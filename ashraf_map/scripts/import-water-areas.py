#!/usr/bin/env python3
"""Validate and import the approved water-area GeoJSON into the web map."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from pyproj import Transformer
from shapely import make_valid
from shapely.geometry import mapping, shape
from shapely.ops import transform as shp_transform


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "data" / "water-areas.geojson"
TO_M = Transformer.from_crs("EPSG:4326", "EPSG:22992", always_xy=True)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Import verified Polygon/MultiPolygon water areas."
    )
    parser.add_argument("source", type=Path, help="Source water-area GeoJSON")
    args = parser.parse_args()

    source = json.loads(args.source.read_text(encoding="utf8"))
    if source.get("type") != "FeatureCollection":
        raise RuntimeError("The water source must be a GeoJSON FeatureCollection")

    features = []
    total_area = 0.0
    for index, feature in enumerate(source.get("features", []), start=1):
        geometry_data = feature.get("geometry")
        if not geometry_data or geometry_data.get("type") not in {
            "Polygon",
            "MultiPolygon",
        }:
            raise RuntimeError(f"Water feature {index} is not a polygon")
        geometry = shape(geometry_data)
        geometry = geometry if geometry.is_valid else make_valid(geometry)
        if geometry.is_empty or geometry.geom_type not in {"Polygon", "MultiPolygon"}:
            raise RuntimeError(f"Water feature {index} has invalid polygon geometry")
        total_area += shp_transform(TO_M.transform, geometry).area
        features.append(
            {
                "type": "Feature",
                "properties": dict(feature.get("properties") or {}),
                "geometry": mapping(geometry),
            }
        )

    if not features:
        raise RuntimeError("The water source contains no polygon features")

    result = {
        "type": "FeatureCollection",
        "name": "RANCHES verified water areas",
        "features": features,
    }
    OUTPUT.write_text(
        json.dumps(result, separators=(",", ":")) + "\n",
        encoding="utf8",
    )
    print(
        f"Wrote {OUTPUT.relative_to(ROOT)} with {len(features)} water areas "
        f"covering {total_area:.2f} m²"
    )


if __name__ == "__main__":
    main()
