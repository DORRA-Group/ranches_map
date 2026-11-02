#!/usr/bin/env python3
"""Combine the authoritative full-site GIS layers into one MapLibre source.

The source files are maintained by ``ashraf_map``.  Keeping this conversion
explicit preserves their provenance while giving the presentation app a small,
stable schema: every feature has a ``kind`` used by MapLibre filters.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "ashraf_map" / "public" / "data"
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "data" / "site-gis.json"

LAYERS = (
    ("boundary", "land_boundary.geojson"),
    ("plot", "land_use.geojson"),
    ("landscape", "landscape.geojson"),
    ("water", "water-areas.geojson"),
    ("road", "road-surface.geojson"),
    ("parking", "parking.geojson"),
)


def main() -> None:
    features: list[dict] = []
    counts: dict[str, int] = {}
    for kind, filename in LAYERS:
        path = SOURCE / filename
        with path.open(encoding="utf-8") as source:
            collection = json.load(source)
        layer_features = collection["features"]
        counts[kind] = len(layer_features)
        for index, feature in enumerate(layer_features):
            properties = feature.get("properties") or {}
            # Retain useful identifiers and measurements without carrying the
            # large, inconsistent source attribute tables into the browser.
            compact = {
                "kind": kind,
                "source": filename,
                "source_id": properties.get("OBJECTID", index),
            }
            for key in ("piece_number", "project_activty", "elements", "area_m2", "parking_type"):
                value = properties.get(key)
                if value is not None:
                    compact[key] = value
            feature["properties"] = compact
            features.append(feature)

    output = {
        "type": "FeatureCollection",
        "name": "Ranches full-site GIS classifications",
        "provenance": "ashraf_map/public/data",
        "counts": counts,
        "features": features,
    }
    OUTPUT.write_text(json.dumps(output, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {OUTPUT} with {len(features)} features ({OUTPUT.stat().st_size / 1_000_000:.1f} MB)")


if __name__ == "__main__":
    main()
