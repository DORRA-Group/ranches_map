#!/usr/bin/env python3
"""Validate, repair, and import approved greenery GeoJSON into the web map."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from pyproj import Transformer
from shapely import make_valid
from shapely.geometry import mapping, shape
from shapely.ops import transform as shp_transform
from shapely.ops import unary_union


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "data" / "green-areas.geojson"
TO_M = Transformer.from_crs("EPSG:4326", "EPSG:22992", always_xy=True)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Import verified Polygon/MultiPolygon greenery areas."
    )
    parser.add_argument("source", type=Path, help="Source greenery GeoJSON")
    args = parser.parse_args()

    source = json.loads(args.source.read_text(encoding="utf8"))
    if source.get("type") != "FeatureCollection":
        raise RuntimeError("The greenery source must be a GeoJSON FeatureCollection")

    water_path = ROOT / "public" / "data" / "water-areas.geojson"
    water_source = json.loads(water_path.read_text(encoding="utf8"))
    water_mask = unary_union(
        [
            shape(feature["geometry"])
            for feature in water_source.get("features", [])
            if feature.get("geometry")
        ]
    )

    features = []
    total_area = 0.0
    water_overlap_area = 0.0
    water_feature_count = 0
    repaired_count = 0
    for index, feature in enumerate(source.get("features", []), start=1):
        geometry_data = feature.get("geometry")
        if not geometry_data or geometry_data.get("type") not in {
            "Polygon",
            "MultiPolygon",
        }:
            raise RuntimeError(f"Greenery feature {index} is not a polygon")
        geometry = shape(geometry_data)
        if not geometry.is_valid:
            geometry = make_valid(geometry)
            repaired_count += 1
        water_overlap_area += shp_transform(
            TO_M.transform,
            geometry.intersection(water_mask),
        ).area
        geometry = make_valid(geometry.difference(water_mask))
        if geometry.is_empty:
            water_feature_count += 1
            continue
        if geometry.geom_type not in {"Polygon", "MultiPolygon"}:
            raise RuntimeError(f"Greenery feature {index} has invalid polygon geometry")
        total_area += shp_transform(TO_M.transform, geometry).area
        features.append(
            {
                "type": "Feature",
                "properties": dict(feature.get("properties") or {}),
                "geometry": mapping(geometry),
            }
        )

    if not features:
        raise RuntimeError("The greenery source contains no polygon features")

    result = {
        "type": "FeatureCollection",
        "name": "RANCHES verified green areas",
        "features": features,
    }
    OUTPUT.write_text(
        json.dumps(result, separators=(",", ":")) + "\n",
        encoding="utf8",
    )
    print(
        f"Wrote {OUTPUT.relative_to(ROOT)} with {len(features)} green areas "
        f"covering {total_area:.2f} m²; repaired {repaired_count} geometries; "
        f"removed {water_feature_count} water features / {water_overlap_area:.2f} m²"
    )


if __name__ == "__main__":
    main()
