#!/usr/bin/env python3
"""Reposition Alaa's illustrative lamps on the corrected GIS pavement.

The original lamp count and approximate spacing are retained. Each point is
snapped to a narrow setback band inside the combined walkway/pavement surface,
then turned toward the nearest authoritative road. Requires Shapely.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

try:
    from shapely.geometry import Point, Polygon, mapping, shape
    from shapely.ops import nearest_points, transform, unary_union
    from shapely.validation import make_valid
except ImportError as error:
    raise SystemExit("Shapely is required: python3 -m pip install shapely") from error


ROOT = Path(__file__).resolve().parents[2]
ASHRAF_DATA = ROOT / "ashraf_map" / "public" / "data"
CURB_SOURCE = ROOT / "layers" / "pavment.geojson"
WALKWAY_SOURCE = ROOT / "layers" / "walkways.geojson"
STREETS_SOURCE = Path(__file__).resolve().parents[1] / "public" / "data" / "streets.json"
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "data" / "aligned-lamps.json"
ORIGIN_LNG, ORIGIN_LAT = 30.8601, 30.095
METRES_LNG = 111_320 * math.cos(math.radians(ORIGIN_LAT))
METRES_LAT = 110_574
MIN_CURB_SETBACK_M = 0.65
MAX_CURB_SETBACK_M = 0.90
POLE_EDGE_CLEARANCE_M = 0.16


def read(path: Path) -> dict:
    with path.open(encoding="utf-8") as source:
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


def merged(path: Path):
    return make_valid(
        unary_union(
            [to_metres(make_valid(shape(feature["geometry"]))) for feature in read(path)["features"]]
        )
    )


def line_parts(geometry):
    if geometry.geom_type == "LineString":
        yield geometry
    elif hasattr(geometry, "geoms"):
        for part in geometry.geoms:
            yield from line_parts(part)


def pavement_surface():
    pavement = Polygon()
    for feature in read(CURB_SOURCE)["features"]:
        geometry = to_metres(make_valid(shape(feature["geometry"])))
        for line in line_parts(geometry):
            if line.is_ring and len(line.coords) >= 4:
                pavement = make_valid(
                    pavement.symmetric_difference(make_valid(Polygon(line.coords)))
                )
    return pavement


def main() -> None:
    streets = read(STREETS_SOURCE)
    source_lamps = [
        feature for feature in streets["features"] if feature["properties"].get("kind") == "light"
    ]
    curb = merged(CURB_SOURCE)
    textured_surface = make_valid(merged(WALKWAY_SOURCE).union(pavement_surface()))
    roads = merged(ASHRAF_DATA / "road-surface.geojson")
    parking = merged(ASHRAF_DATA / "parking.geojson")
    plots = merged(ASHRAF_DATA / "land_use.geojson")

    blockers = unary_union(
        [roads.buffer(0.15), parking.buffer(0.25), plots.buffer(0.15)]
    )
    safe_surface = make_valid(textured_surface.buffer(-POLE_EDGE_CLEARANCE_M).difference(blockers))
    setback_band = make_valid(
        safe_surface.intersection(
            curb.buffer(MAX_CURB_SETBACK_M).difference(curb.buffer(MIN_CURB_SETBACK_M))
        )
    )
    if setback_band.is_empty:
        raise RuntimeError("No valid lamppost setback band was found")

    features = []
    displacements = []
    for index, feature in enumerate(source_lamps, start=1):
        original = to_metres(shape(feature["geometry"]))
        spot = nearest_points(original, setback_band)[1]
        road_at = nearest_points(spot, roads)[1]
        dx, dy = road_at.x - spot.x, road_at.y - spot.y
        bearing = math.degrees(math.atan2(dx, dy))
        displacement = original.distance(spot)
        displacements.append(displacement)
        features.append(
            {
                "type": "Feature",
                "id": f"aligned-lamp-{index:04d}",
                "properties": {
                    "kind": "light",
                    "bearing": round(bearing, 1),
                    "source": "Alaa illustrative lamp, GIS-aligned",
                    "displacement_m": round(displacement, 2),
                },
                "geometry": mapping(to_wgs84(Point(spot.x, spot.y))),
            }
        )

    result = {
        "type": "FeatureCollection",
        "name": "GIS-aligned illustrative lampposts",
        "provenance": ["public/data/streets.json", "layers/pavment.geojson", "layers/walkways.geojson"],
        "setback_m": [MIN_CURB_SETBACK_M, MAX_CURB_SETBACK_M],
        "features": features,
    }
    OUTPUT.write_text(json.dumps(result, separators=(",", ":")), encoding="utf-8")
    print(
        f"Wrote {OUTPUT} with {len(features)} lamps · "
        f"median shift {sorted(displacements)[len(displacements) // 2]:.2f} m · "
        f"max shift {max(displacements):.2f} m"
    )


if __name__ == "__main__":
    main()
