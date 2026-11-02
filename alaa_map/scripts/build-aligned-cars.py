#!/usr/bin/env python3
"""Place illustrative cars inside Ashraf's exact parking-bay linework.

Cars use real bay orientation and are accepted only when the complete vehicle
footprint clears the painted bay lines. Occupancy is deterministic and remains
illustrative. Requires Shapely.
"""

from __future__ import annotations

import json
import math
import random
from pathlib import Path

try:
    from shapely.geometry import Point, Polygon, shape
    from shapely.ops import polygonize, transform, unary_union
    from shapely.validation import make_valid
except ImportError as error:
    raise SystemExit("Shapely is required: python3 -m pip install shapely") from error


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "ashraf_map" / "public" / "data" / "parkings_line.geojson"
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "data" / "aligned-cars.json"
ORIGIN_LNG, ORIGIN_LAT = 30.86, 30.095
METRES_LNG = 111_320 * math.cos(math.radians(ORIGIN_LAT))
METRES_LAT = 110_574
CAR_LENGTH_M = 4.40
CAR_WIDTH_M = 1.80
LINE_CLEARANCE_M = 0.12
OCCUPANCY = 0.68


def to_metres(geometry):
    return transform(
        lambda x, y, z=None: ((x - ORIGIN_LNG) * METRES_LNG, (y - ORIGIN_LAT) * METRES_LAT),
        geometry,
    )


def to_lonlat(x: float, y: float) -> list[float]:
    return [round(x / METRES_LNG + ORIGIN_LNG, 7), round(y / METRES_LAT + ORIGIN_LAT, 7)]


def footprint(cx: float, cy: float, heading: tuple[float, float]) -> Polygon:
    hx, hy = heading
    return Polygon(
        [
            (cx + hx * along - hy * across, cy + hy * along + hx * across)
            for along, across in (
                (-CAR_LENGTH_M / 2, -CAR_WIDTH_M / 2),
                (CAR_LENGTH_M / 2, -CAR_WIDTH_M / 2),
                (CAR_LENGTH_M / 2, CAR_WIDTH_M / 2),
                (-CAR_LENGTH_M / 2, CAR_WIDTH_M / 2),
            )
        ]
    )


def parts(geometry):
    return list(geometry.geoms) if hasattr(geometry, "geoms") else [geometry]


def main() -> None:
    with SOURCE.open(encoding="utf-8") as source:
        data = json.load(source)
    linework = [to_metres(make_valid(shape(feature["geometry"]))) for feature in data["features"]]
    bay_polygons = [polygon for geometry in linework for polygon in polygonize(geometry)]
    # Shared edges dissolve into 2.5 m perpendicular rows or 5–6.2 m parallel
    # runs. Slot centres are reconstructed at the source drawing's spacing.
    rows = unary_union(bay_polygons)
    candidates: list[tuple[float, float, tuple[float, float], Polygon]] = []
    for row in parts(rows):
        rectangle = row.minimum_rotated_rectangle
        corners = list(rectangle.exterior.coords)
        sides = sorted(
            [(math.dist(corners[index], corners[index + 1]), index) for index in (0, 1)],
            reverse=True,
        )
        (span, index), (depth, _) = sides
        axis = (
            (corners[index + 1][0] - corners[index][0]) / span,
            (corners[index + 1][1] - corners[index][1]) / span,
        )
        perpendicular = 4.45 <= depth <= 5.55
        parallel = 2.25 <= depth <= 3.10 and span >= 5.40
        if not (perpendicular or parallel):
            continue
        pitch = 2.5 if perpendicular else 6.2
        centre = rectangle.centroid
        for slot in range(int(span / pitch)):
            along = -span / 2 + pitch * (slot + 0.5)
            cx = centre.x + axis[0] * along
            cy = centre.y + axis[1] * along
            heading = (-axis[1], axis[0]) if perpendicular else axis
            vehicle = footprint(cx, cy, heading)
            # The inset protects the row boundary. Internal separators in the
            # source contain overlapping 2.5 m half-cells, so slot centres are
            # reconstructed from their regular 2.5/6.2 m rhythm instead of
            # treating every duplicate internal segment as a bay boundary.
            if not row.buffer(-LINE_CLEARANCE_M).contains(vehicle):
                continue
            candidates.append((cx, cy, heading, row.boundary))

    rng = random.Random(17)
    features = []
    clearances = []
    for cx, cy, heading, boundary in candidates:
        if rng.random() > OCCUPANCY:
            continue
        if rng.random() < 0.5:
            heading = (-heading[0], -heading[1])
        vehicle = footprint(cx, cy, heading)
        clearance = vehicle.distance(boundary)
        clearances.append(clearance)
        features.append(
            {
                "type": "Feature",
                "properties": {
                    "kind": "car",
                    "bearing": round(math.degrees(math.atan2(heading[0], heading[1])), 1),
                    "tone": rng.randrange(8),
                    "bay_boundary_clearance_m": round(clearance, 2),
                    "source": "parkings_line.geojson",
                },
                "geometry": {"type": "Point", "coordinates": to_lonlat(cx, cy)},
            }
        )

    result = {
        "type": "FeatureCollection",
        "name": "GIS-aligned illustrative parked cars",
        "source": "ashraf_map/public/data/parkings_line.geojson",
        "occupancy": OCCUPANCY,
        "vehicle_m": [CAR_LENGTH_M, CAR_WIDTH_M],
        "minimum_bay_boundary_clearance_m": round(min(clearances), 3) if clearances else None,
        "features": features,
    }
    OUTPUT.write_text(json.dumps(result, separators=(",", ":")), encoding="utf-8")
    print(
        f"Wrote {OUTPUT} with {len(features)} cars from {len(candidates)} valid bays; "
        f"minimum bay-boundary clearance {min(clearances):.2f} m"
    )


if __name__ == "__main__":
    main()
