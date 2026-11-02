#!/usr/bin/env python3
"""Build a full-site red sandstone pavement mesh for the RANCHES map.

The generated pavement is the project boundary minus asphalt roads, parking,
private land plots, approved water and green areas, and the inner rings of
greenery polygons. Greenery, water, and other contained inner rings remain
real holes in the redstone surface.

This script reads source GeoJSON without modifying it and writes:
  public/models/ranches-redstone-coverage.glb
  public/data/redstone-coverage-manifest.json

Requires: pip install numpy shapely pyproj trimesh mapbox-earcut pillow
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import trimesh
from PIL import Image
from pyproj import Transformer
from shapely import make_valid
from shapely.geometry import Polygon, shape
from shapely.ops import transform as shp_transform
from shapely.ops import unary_union


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "public" / "data"
MODELS = ROOT / "public" / "models"
MODELS.mkdir(exist_ok=True, parents=True)

TO_M = Transformer.from_crs("EPSG:4326", "EPSG:22992", always_xy=True)
TO_LONLAT = Transformer.from_crs("EPSG:22992", "EPSG:4326", always_xy=True)
TO_ECEF = Transformer.from_crs("EPSG:4979", "EPSG:4978", always_xy=True)

ORIGIN_LON = 30.8601
ORIGIN_LAT = 30.095
ORIGIN_X, ORIGIN_Y = TO_M.transform(ORIGIN_LON, ORIGIN_LAT)

PAVEMENT_TOP_HEIGHT_M = 0.20
PAVEMENT_BASE_HEIGHT_M = 0.05
TILE_REPEAT_M = 2.4

# Keep the new surface clear of existing textured geometry and raised curbs.
ROAD_CLEARANCE_M = 0.60
PARKING_CLEARANCE_M = 0.60
PLOT_CLEARANCE_M = 0.05
GREEN_CLEARANCE_M = 0.05
GREEN_HOLE_CLEARANCE_M = 0.05
LANDSCAPE_HOLE_CLEARANCE_M = 0.05
WATER_CLEARANCE_M = 0.05

MIN_COMPONENT_AREA_SQM = 0.25
MIN_TRIANGLE_AREA_SQM = 0.003
MIN_WALL_EDGE_M = 0.025


def read_geom(filename: str):
    obj = json.loads((DATA / filename).read_text(encoding="utf8"))
    return [
        shp_transform(TO_M.transform, shape(feature["geometry"]))
        for feature in obj["features"]
        if feature.get("geometry")
    ]


def polygon_parts(geometry):
    """Yield every non-empty polygon from a possibly mixed geometry."""
    if geometry.is_empty:
        return
    if geometry.geom_type == "Polygon":
        yield geometry
        return
    for part in getattr(geometry, "geoms", []):
        yield from polygon_parts(part)


def polygons(geometries, buffer_m: float = 0.0):
    result = []
    for original in geometries:
        geometry = original if original.is_valid else make_valid(original)
        if buffer_m:
            geometry = geometry.buffer(buffer_m)
        result.extend(
            part
            for part in polygon_parts(geometry)
            if part.area >= MIN_TRIANGLE_AREA_SQM
        )
    return result


def landscape_inner_polygons(geometries):
    """Return only the holes drawn inside landscape polygons."""
    result = []
    for original in geometries:
        geometry = original if original.is_valid else make_valid(original)
        for part in polygon_parts(geometry):
            for interior in part.interiors:
                inner = Polygon(interior)
                if inner.area >= MIN_COMPONENT_AREA_SQM:
                    result.append(inner)
    return result


def local_frame():
    x0, y0, z0 = TO_ECEF.transform(ORIGIN_LON, ORIGIN_LAT, 0)
    longitude, latitude = np.radians([ORIGIN_LON, ORIGIN_LAT])
    sin_lon, cos_lon = np.sin(longitude), np.cos(longitude)
    sin_lat, cos_lat = np.sin(latitude), np.cos(latitude)
    east = np.array([-sin_lon, cos_lon, 0])
    north = np.array(
        [-sin_lat * cos_lon, -sin_lat * sin_lon, cos_lat]
    )
    up = np.array([cos_lat * cos_lon, cos_lat * sin_lon, sin_lat])
    return np.array([x0, y0, z0]), east, north, up


ORIGIN_ECEF, EAST, NORTH, UP = local_frame()


def xyz_glb(x: float, y: float, height: float):
    longitude, latitude = TO_LONLAT.transform(float(x), float(y))
    xc, yc, zc = TO_ECEF.transform(longitude, latitude, float(height))
    delta = np.array([xc, yc, zc]) - ORIGIN_ECEF
    # Cesium maps glTF (X,Y,Z) to local ENU (Z,X,Y) for Y-up glTF models.
    return [float(delta @ NORTH), float(delta @ UP), float(delta @ EAST)]


def world_uv(x: float, y: float):
    """Continuous world-aligned UVs shared by every pavement polygon."""
    return [
        float((y - ORIGIN_Y) / TILE_REPEAT_M),
        float(-(x - ORIGIN_X) / TILE_REPEAT_M),
    ]


def main():
    print("Reading project boundary and exclusion layers...", flush=True)

    site = unary_union(polygons(read_geom("land_boundary.geojson")))
    roads = unary_union(
        polygons(read_geom("road-surface.geojson"), ROAD_CLEARANCE_M)
    )
    parking = unary_union(
        polygons(read_geom("parking.geojson"), PARKING_CLEARANCE_M)
    )
    plots = unary_union(
        polygons(read_geom("land_use.geojson"), PLOT_CLEARANCE_M)
    )
    green_geometry = read_geom("green-areas.geojson")
    green_surfaces = unary_union(polygons(green_geometry))
    green_areas = unary_union(
        polygons(green_geometry, GREEN_CLEARANCE_M)
    )
    green_inner_parts = landscape_inner_polygons(green_geometry)
    green_holes = unary_union(
        polygons(green_inner_parts, GREEN_HOLE_CLEARANCE_M)
    )
    landscape_inner_parts = landscape_inner_polygons(
        read_geom("landscape.geojson")
    )
    landscape_holes = unary_union(
        polygons(landscape_inner_parts, LANDSCAPE_HOLE_CLEARANCE_M)
    )
    water_areas = unary_union(
        polygons(read_geom("water-areas.geojson"), WATER_CLEARANCE_M)
    )

    blockers = unary_union(
        [
            roads,
            parking,
            plots,
            green_areas,
            green_holes,
            landscape_holes,
            water_areas,
        ]
    )
    coverage = make_valid(site.difference(blockers))
    coverage_parts = [
        part
        for part in polygon_parts(coverage)
        if part.area >= MIN_COMPONENT_AREA_SQM
    ]
    if not coverage_parts:
        raise RuntimeError("The exclusion mask removed the entire project area")

    # Fail before exporting if any source surface remains underneath pavement.
    coverage_union = unary_union(coverage_parts)
    validation = {
        "outside_boundary_sqm": coverage_union.difference(site).area,
        "road_overlap_sqm": coverage_union.intersection(roads).area,
        "parking_overlap_sqm": coverage_union.intersection(parking).area,
        "plot_overlap_sqm": coverage_union.intersection(plots).area,
        "green_overlap_sqm": coverage_union.intersection(green_areas).area,
        "green_inner_overlap_sqm": coverage_union.intersection(green_holes).area,
        "landscape_inner_overlap_sqm": coverage_union.intersection(landscape_holes).area,
        "water_overlap_sqm": coverage_union.intersection(water_areas).area,
    }
    for name, area in validation.items():
        if area >= 0.01:
            raise RuntimeError(f"Coverage validation failed: {name}={area:.6f}")

    top_positions = []
    top_uvs = []
    top_faces = []
    wall_positions = []
    wall_faces = []
    total_area = 0.0

    def emit_wall(a, b):
        start = len(wall_positions)
        wall_positions.extend(
            [
                xyz_glb(*a, PAVEMENT_TOP_HEIGHT_M),
                xyz_glb(*b, PAVEMENT_TOP_HEIGHT_M),
                xyz_glb(*b, PAVEMENT_BASE_HEIGHT_M),
                xyz_glb(*a, PAVEMENT_BASE_HEIGHT_M),
            ]
        )
        wall_faces.extend(
            [(start, start + 1, start + 2), (start, start + 2, start + 3)]
        )

    for index, polygon in enumerate(coverage_parts, start=1):
        total_area += polygon.area
        vertices, faces = trimesh.creation.triangulate_polygon(
            polygon,
            engine="earcut",
        )
        vertices = np.asarray(vertices, dtype=np.float64)
        for face in np.asarray(faces):
            ring = vertices[face][:, :2]
            determinant = (
                (ring[1, 0] - ring[0, 0]) * (ring[2, 1] - ring[0, 1])
                - (ring[1, 1] - ring[0, 1]) * (ring[2, 0] - ring[0, 0])
            )
            if abs(determinant) * 0.5 < MIN_TRIANGLE_AREA_SQM:
                continue
            if determinant < 0:
                ring = ring[[0, 2, 1]]
            face_start = len(top_positions)
            for x, y in ring:
                top_positions.append(xyz_glb(x, y, PAVEMENT_TOP_HEIGHT_M))
                top_uvs.append(world_uv(x, y))
            top_faces.append((face_start, face_start + 1, face_start + 2))

        exterior = np.asarray(polygon.exterior.coords, dtype=np.float64)
        for edge in range(len(exterior) - 1):
            if np.linalg.norm(exterior[edge + 1] - exterior[edge]) > MIN_WALL_EDGE_M:
                emit_wall(exterior[edge], exterior[edge + 1])

        # Reverse hole walls so their visible face points into the opening.
        for interior in polygon.interiors:
            hole = np.asarray(interior.coords, dtype=np.float64)
            for edge in range(len(hole) - 1):
                if np.linalg.norm(hole[edge + 1] - hole[edge]) > MIN_WALL_EDGE_M:
                    emit_wall(hole[edge + 1], hole[edge])

        if index % 100 == 0:
            print(
                f"Processed {index}/{len(coverage_parts)} pavement components; "
                f"triangles: {len(top_faces)}",
                flush=True,
            )

    if not top_faces:
        raise RuntimeError("No pavement triangles were generated")

    texture = Image.open(
        ROOT / "public" / "textures" / "limestone-walkway.png"
    ).convert("RGB")
    top_material = trimesh.visual.material.PBRMaterial(
        name="RANCHES red sandstone coverage",
        baseColorTexture=texture,
        metallicFactor=0,
        roughnessFactor=0.95,
        doubleSided=False,
    )
    top_mesh = trimesh.Trimesh(
        vertices=np.asarray(top_positions),
        faces=np.asarray(top_faces),
        process=False,
    )
    top_mesh.visual = trimesh.visual.TextureVisuals(
        uv=np.asarray(top_uvs, dtype=np.float32),
        material=top_material,
    )

    wall_material = trimesh.visual.material.PBRMaterial(
        name="RANCHES red sandstone edges",
        baseColorFactor=[155, 78, 58, 255],
        metallicFactor=0,
        roughnessFactor=0.9,
    )
    wall_mesh = trimesh.Trimesh(
        vertices=np.asarray(wall_positions),
        faces=np.asarray(wall_faces),
        process=False,
    )
    wall_mesh.visual = trimesh.visual.TextureVisuals(material=wall_material)

    scene = trimesh.Scene()
    scene.add_geometry(top_mesh, geom_name="redstone-coverage-top")
    scene.add_geometry(wall_mesh, geom_name="redstone-coverage-walls")

    output = MODELS / "ranches-redstone-coverage.glb"
    temporary_output = output.with_suffix(".glb.tmp")
    temporary_output.write_bytes(scene.export(file_type="glb"))
    temporary_output.replace(output)

    lamp_data = json.loads(
        (DATA / "full-sidewalk-lampposts.json").read_text(encoding="utf8")
    )
    manifest = {
        "mode": "full-site-redstone-coverage",
        "output_model": f"/models/{output.name}",
        "source_boundary": "land_boundary.geojson",
        "excluded_layers": [
            "road-surface.geojson",
            "parking.geojson",
            "land_use.geojson",
            "green-areas.geojson surfaces and inner rings",
            "landscape.geojson inner rings only",
            "water-areas.geojson",
        ],
        "green_area_count": len(green_geometry),
        "green_inner_hole_count": len(green_inner_parts),
        "green_surface_area_sqm": round(green_surfaces.area, 2),
        "landscape_inner_hole_count": len(landscape_inner_parts),
        "component_count": len(coverage_parts),
        "surface_area_sqm": round(total_area, 2),
        "triangles": len(top_faces),
        "wall_triangles": len(wall_faces),
        "texture_mapping": "continuous-world-aligned",
        "texture_m_per_repeat": TILE_REPEAT_M,
        "pavement_top_height_m": PAVEMENT_TOP_HEIGHT_M,
        "pavement_base_height_m": PAVEMENT_BASE_HEIGHT_M,
        "lamppost_count_preserved": len(lamp_data.get("lamps", [])),
        "clearance_m": {
            "roads": ROAD_CLEARANCE_M,
            "parking": PARKING_CLEARANCE_M,
            "plots": PLOT_CLEARANCE_M,
            "green_areas": GREEN_CLEARANCE_M,
            "green_inner_holes": GREEN_HOLE_CLEARANCE_M,
            "landscape_inner_holes": LANDSCAPE_HOLE_CLEARANCE_M,
            "water_areas": WATER_CLEARANCE_M,
        },
        "validation_overlap_sqm": {
            key: round(value, 6) for key, value in validation.items()
        },
        "safety_note": (
            "Concept only; approved green and water areas are excluded from pavement, "
            "and other inner rings are reserved for future lakes or gardens. "
            "land_use contains parcel polygons rather than verified building footprints. "
            "Site elevations and pavement engineering are unverified."
        ),
    }
    (DATA / "redstone-coverage-manifest.json").write_text(
        json.dumps(manifest, indent=2) + "\n",
        encoding="utf8",
    )

    print("SUCCESS", json.dumps(manifest, indent=2), flush=True)
    print("GLB", round(output.stat().st_size / 1024 / 1024, 2), "MiB", flush=True)


if __name__ == "__main__":
    main()
