#!/usr/bin/env python3
"""Build MapLibre presentation details on Ashraf's exact GIS coordinates.

The supplied walkway polygons and closed pavement outlines form one continuous
paver-textured surface. Existing Ashraf paint meshes are decoded from their
compact float32 format, so curb stripes and markings remain byte-for-byte
aligned with the GIS scene. Requires Shapely.
"""

from __future__ import annotations

import json
import math
import struct
from pathlib import Path

try:
    from shapely.geometry import Polygon, mapping, shape
    from shapely.ops import substring, transform, unary_union
    from shapely.validation import make_valid
except ImportError as error:
    raise SystemExit("Shapely is required: python3 -m pip install shapely") from error


ROOT = Path(__file__).resolve().parents[2]
ASHRAF_DATA = ROOT / "ashraf_map" / "public" / "data"
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "data" / "site-details.json"
CURB_SOURCE = ROOT / "layers" / "pavment.geojson"
WALKWAY_SOURCE = ROOT / "layers" / "walkways.geojson"
ORIGIN_LNG, ORIGIN_LAT = 30.8601, 30.095
METRES_LNG = 111_320 * math.cos(math.radians(ORIGIN_LAT))
METRES_LAT = 110_574
SIDEWALK_OUTER_M = 2.25
CURB_CLEARANCE_M = 0.60


def collection(name: str) -> dict:
    with (ASHRAF_DATA / name).open(encoding="utf-8") as source:
        return json.load(source)


def to_metres(geometry):
    return transform(
        lambda x, y, z=None: ((x - ORIGIN_LNG) * METRES_LNG, (y - ORIGIN_LAT) * METRES_LAT),
        geometry,
    )


def to_wgs84(geometry):
    return transform(
        lambda x, y, z=None: (
            [round(value / METRES_LNG + ORIGIN_LNG, 7) for value in x],
            [round(value / METRES_LAT + ORIGIN_LAT, 7) for value in y],
        ),
        geometry,
    )


def merged(name: str):
    return unary_union(
        [to_metres(make_valid(shape(feature["geometry"]))) for feature in collection(name)["features"]]
    )


def merged_file(path: Path):
    with path.open(encoding="utf-8") as source:
        data = json.load(source)
    return unary_union(
        [to_metres(make_valid(shape(feature["geometry"]))) for feature in data["features"]]
    )


def line_parts(geometry):
    if geometry.geom_type == "LineString":
        yield geometry
    elif hasattr(geometry, "geoms"):
        for part in geometry.geoms:
            yield from line_parts(part)


def pavement_surface():
    """Fill closed curb rings using an even-odd rule.

    The pavement file is linework rather than ready-made polygons. Applying a
    symmetric difference to its closed rings preserves islands and holes in the
    same way an even-odd CAD/GIS fill does.
    """
    with CURB_SOURCE.open(encoding="utf-8") as source:
        data = json.load(source)
    pavement = Polygon()
    closed_rings = 0
    for feature in data["features"]:
        geometry = to_metres(make_valid(shape(feature["geometry"])))
        for line in line_parts(geometry):
            if line.is_ring and len(line.coords) >= 4:
                ring = make_valid(Polygon(line.coords))
                if not ring.is_empty:
                    pavement = make_valid(pavement.symmetric_difference(ring))
                    closed_rings += 1
    return make_valid(pavement), closed_rings


def sidewalk_feature() -> dict:
    outline = merged_file(CURB_SOURCE)
    roads = merged("road-surface.geojson")
    # The supplied curb outline is authoritative. Only portions adjoining the
    # asphalt form the road-facing edge used to build the sidewalk ribbon.
    edge = outline.intersection(roads.buffer(0.80))
    # The band starts beyond the 55 cm striped curb. The road side is removed
    # by the authoritative obstacle polygons, leaving the pavement-facing side.
    band = edge.buffer(SIDEWALK_OUTER_M, cap_style="flat", join_style="mitre").difference(
        edge.buffer(CURB_CLEARANCE_M, cap_style="flat", join_style="mitre")
    )
    blockers = unary_union(
        [
            roads.buffer(0.12),
            merged("parking.geojson").buffer(0.60),
            merged("land_use.geojson").buffer(0.12),
        ]
    )
    sidewalk = make_valid(band.difference(blockers))
    return {
        "type": "Feature",
        "properties": {
            "kind": "aligned-sidewalk",
            "source": "layers/pavment.geojson",
            "width_m": SIDEWALK_OUTER_M - CURB_CLEARANCE_M,
            "area_m2": round(sidewalk.area, 2),
        },
        "geometry": mapping(to_wgs84(sidewalk)),
    }


def walkway_feature() -> dict:
    walkway = make_valid(merged_file(WALKWAY_SOURCE))
    pavement, closed_rings = pavement_surface()
    textured_surface = make_valid(walkway.union(pavement))
    return {
        "type": "Feature",
        "properties": {
            "kind": "aligned-walkway",
            "source": ["layers/walkways.geojson", "layers/pavment.geojson"],
            "walkway_area_m2": round(walkway.area, 2),
            "pavement_area_m2": round(pavement.area, 2),
            "closed_pavement_rings": closed_rings,
            "area_m2": round(textured_surface.area, 2),
        },
        "geometry": mapping(to_wgs84(textured_surface)),
    }


def curb_features() -> list[dict]:
    walkway = make_valid(merged_file(WALKWAY_SOURCE))
    pavement, _ = pavement_surface()
    textured_surface = make_valid(walkway.union(pavement))
    roads = merged("road-surface.geojson")
    # The visible curb is the boundary between asphalt and the textured
    # pedestrian surface. A small tolerance selects that shared interface when
    # the independent GIS sources stop a few centimetres short of one another;
    # the resulting centreline remains on the texture boundary itself.
    touching_edge = textured_surface.boundary.intersection(roads.buffer(0.20))
    road_edge = make_valid(
        unary_union([line for line in line_parts(touching_edge) if line.length >= 0.40])
    )
    outline_ribbon = make_valid(road_edge.buffer(0.06, cap_style="flat", join_style="mitre"))
    stripes: list[list] = [[], []]
    for line in line_parts(road_edge):
        start = 0.0
        index = 0
        while start < line.length:
            end = min(line.length, start + 1.5)
            segment = substring(line, start, end)
            ribbon = segment.buffer(0.275, cap_style="flat", join_style="mitre")
            if not ribbon.is_empty:
                stripes[index % 2].append(ribbon)
            start = end
            index += 1
    white = make_valid(unary_union(stripes[0]))
    black = make_valid(unary_union(stripes[1]))
    return [
        {
            "type": "Feature",
            "properties": {
                "kind": "aligned-curb-outline",
                "source": ["layers/walkways.geojson", "layers/pavment.geojson", "road-surface.geojson"],
                "rule": "road-textured-surface-edge",
            },
            "geometry": mapping(to_wgs84(outline_ribbon)),
        },
        {
            "type": "Feature",
            "properties": {
                "kind": "aligned-curb-white",
                "source": ["layers/walkways.geojson", "layers/pavment.geojson", "road-surface.geojson"],
                "rule": "road-textured-surface-edge",
                "stripe_m": 1.5,
            },
            "geometry": mapping(to_wgs84(white)),
        },
        {
            "type": "Feature",
            "properties": {
                "kind": "aligned-curb-black",
                "source": ["layers/walkways.geojson", "layers/pavment.geojson", "road-surface.geojson"],
                "rule": "road-textured-surface-edge",
                "stripe_m": 1.5,
            },
            "geometry": mapping(to_wgs84(black)),
        },
    ]


def mesh_feature(kind: str, filename: str, origin: tuple[float, float]) -> dict:
    raw = (ASHRAF_DATA / filename).read_bytes()
    values = struct.unpack(f"<{len(raw) // 4}f", raw)
    if len(values) % 8:
        raise ValueError(f"Invalid quad mesh {filename}")
    polygons = []
    for start in range(0, len(values), 8):
        points = [
            [round(origin[0] + values[start + index], 7), round(origin[1] + values[start + index + 1], 7)]
            for index in range(0, 8, 2)
        ]
        points.append(points[0])
        polygons.append([points])
    return {
        "type": "Feature",
        "properties": {"kind": kind, "source": filename, "quads": len(polygons)},
        "geometry": {"type": "MultiPolygon", "coordinates": polygons},
    }


def main() -> None:
    manifest = collection("paint-meshes-manifest.json")
    origin = tuple(manifest["coordinate_origin_lonlat"])
    meshes = (
        ("aligned-road-dash", "road-dashes.bin"),
        ("aligned-parking-edge", "parking-edges.bin"),
        ("aligned-parking-bay", "parking-bays.bin"),
    )
    features = [walkway_feature(), *curb_features(), *(mesh_feature(kind, filename, origin) for kind, filename in meshes)]
    result = {
        "type": "FeatureCollection",
        "name": "Ranches GIS-aligned presentation details",
        "provenance": "ashraf_map/public/data",
        "features": features,
    }
    OUTPUT.write_text(json.dumps(result, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {OUTPUT} ({OUTPUT.stat().st_size / 1_000_000:.1f} MB)")


if __name__ == "__main__":
    main()
