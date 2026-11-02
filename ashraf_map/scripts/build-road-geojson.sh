#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 /absolute/path/to/source.gdb" >&2
  exit 1
fi

source_gdb="$1"
project_root="$(cd "$(dirname "$0")/.." && pwd)"
output_dir="$project_root/public/data"
qgis_root="${QGIS_ROOT:-/Applications/QGIS.app/Contents}"
ogr2ogr="$qgis_root/MacOS/ogr2ogr"

if [[ ! -d "$source_gdb" ]]; then
  echo "File Geodatabase not found: $source_gdb" >&2
  exit 1
fi

if [[ ! -x "$ogr2ogr" ]]; then
  echo "QGIS ogr2ogr not found: $ogr2ogr" >&2
  exit 1
fi

temporary_dir="$(mktemp -d "${TMPDIR:-/tmp}/ranches-roads.XXXXXX")"
export PROJ_DATA="$qgis_root/Resources/qgis/proj"

surface_sql='WITH site AS (SELECT ST_Union(SHAPE) AS geometry FROM land_boundary), pavement_lines AS (SELECT ST_Union(SHAPE) AS geometry FROM Pavement), pavement_areas AS (SELECT ST_Polygonize(geometry) AS geometry FROM pavement_lines), plot_areas AS (SELECT ST_Union(SHAPE) AS geometry FROM land_use), parking_areas AS (SELECT ST_Union(SHAPE) AS geometry FROM parking), landscape_areas AS (SELECT ST_Union(SHAPE) AS geometry FROM landscape), non_road_areas AS (SELECT ST_Union(geometry) AS geometry FROM (SELECT geometry FROM pavement_areas UNION ALL SELECT geometry FROM plot_areas UNION ALL SELECT geometry FROM parking_areas UNION ALL SELECT geometry FROM landscape_areas)) SELECT ST_Difference(site.geometry, non_road_areas.geometry) AS geometry FROM site CROSS JOIN non_road_areas'

marking_sql='WITH intersection_masks AS (SELECT ST_Union(mask) AS geometry FROM (SELECT ST_Buffer(ST_Intersection(a.SHAPE, b.SHAPE), MAX(COALESCE(a.Road_width, 13), COALESCE(b.Road_width, 13)) / 2.0 + 1.5) AS mask FROM Road_lines_1 a JOIN Road_lines_1 b ON a.OBJECTID < b.OBJECTID AND ST_Intersects(a.SHAPE, b.SHAPE))), trimmed AS (SELECT ST_Difference(r.SHAPE, intersection_masks.geometry) AS geometry, r.Road_width, r.SHAPE_Length FROM Road_lines_1 r CROSS JOIN intersection_masks) SELECT geometry, Road_width, SHAPE_Length FROM trimmed WHERE geometry IS NOT NULL AND NOT ST_IsEmpty(geometry)'

parking_edge_sql='WITH site AS (SELECT ST_Union(SHAPE) AS geometry FROM land_boundary), pavement_lines AS (SELECT ST_Union(SHAPE) AS geometry FROM Pavement), pavement_areas AS (SELECT ST_Polygonize(geometry) AS geometry FROM pavement_lines), plot_areas AS (SELECT ST_Union(SHAPE) AS geometry FROM land_use), parking_areas AS (SELECT ST_Union(SHAPE) AS geometry FROM parking), landscape_areas AS (SELECT ST_Union(SHAPE) AS geometry FROM landscape), non_road_areas AS (SELECT ST_Union(geometry) AS geometry FROM (SELECT geometry FROM pavement_areas UNION ALL SELECT geometry FROM plot_areas UNION ALL SELECT geometry FROM parking_areas UNION ALL SELECT geometry FROM landscape_areas)), roads AS (SELECT ST_Difference(site.geometry, non_road_areas.geometry) AS geometry FROM site CROSS JOIN non_road_areas) SELECT ST_LineMerge(ST_Intersection(ST_Boundary(parking_areas.geometry), ST_Boundary(roads.geometry))) AS geometry FROM parking_areas CROSS JOIN roads'

pavement_edge_sql='WITH site AS (SELECT ST_Union(SHAPE) AS geometry FROM land_boundary), pavement_lines AS (SELECT ST_Union(SHAPE) AS geometry FROM Pavement), pavement_areas AS (SELECT ST_Polygonize(geometry) AS geometry FROM pavement_lines), plot_areas AS (SELECT ST_Union(SHAPE) AS geometry FROM land_use), parking_areas AS (SELECT ST_Union(SHAPE) AS geometry FROM parking), landscape_areas AS (SELECT ST_Union(SHAPE) AS geometry FROM landscape), non_road_areas AS (SELECT ST_Union(geometry) AS geometry FROM (SELECT geometry FROM pavement_areas UNION ALL SELECT geometry FROM plot_areas UNION ALL SELECT geometry FROM parking_areas UNION ALL SELECT geometry FROM landscape_areas)), roads AS (SELECT ST_Difference(site.geometry, non_road_areas.geometry) AS geometry FROM site CROSS JOIN non_road_areas) SELECT ST_LineMerge(ST_Intersection(ST_Boundary(pavement_areas.geometry), ST_Boundary(roads.geometry))) AS geometry FROM pavement_areas CROSS JOIN roads'

"$ogr2ogr" \
  -f GeoJSON \
  "$temporary_dir/road-surface-raw.geojson" \
  "$source_gdb" \
  -dialect SQLite \
  -sql "$surface_sql" \
  -t_srs EPSG:4326 \
  -segmentize 1 \
  -lco RFC7946=YES \
  -lco COORDINATE_PRECISION=8

# The difference operation can retain zero-area line fragments where
# boundaries touch. Explode the result, then keep polygon geometry only.
"$ogr2ogr" \
  -f GeoJSON \
  "$temporary_dir/road-surface-parts.geojson" \
  "$temporary_dir/road-surface-raw.geojson" \
  -explodecollections \
  -lco RFC7946=YES \
  -lco COORDINATE_PRECISION=8

"$ogr2ogr" \
  -f GeoJSON \
  "$temporary_dir/road-surface.geojson" \
  "$temporary_dir/road-surface-parts.geojson" \
  -where "OGR_GEOMETRY = 'POLYGON' OR OGR_GEOMETRY = 'MULTIPOLYGON'" \
  -lco RFC7946=YES \
  -lco COORDINATE_PRECISION=8

"$ogr2ogr" \
  -f GeoJSON \
  "$temporary_dir/road-centerlines.geojson" \
  "$source_gdb" \
  -dialect SQLite \
  -sql "$marking_sql" \
  -t_srs EPSG:4326 \
  -segmentize 1 \
  -lco RFC7946=YES \
  -lco COORDINATE_PRECISION=8

"$ogr2ogr" \
  -f GeoJSON \
  "$temporary_dir/parking-road-edges-raw.geojson" \
  "$source_gdb" \
  -dialect SQLite \
  -sql "$parking_edge_sql" \
  -t_srs EPSG:4326 \
  -segmentize 1 \
  -lco RFC7946=YES \
  -lco COORDINATE_PRECISION=8

# Shared boundaries can include point-only contacts. Keep linework only.
"$ogr2ogr" \
  -f GeoJSON \
  "$temporary_dir/parking-road-edges-parts.geojson" \
  "$temporary_dir/parking-road-edges-raw.geojson" \
  -explodecollections \
  -lco RFC7946=YES \
  -lco COORDINATE_PRECISION=8

"$ogr2ogr" \
  -f GeoJSON \
  "$temporary_dir/parking-road-edges.geojson" \
  "$temporary_dir/parking-road-edges-parts.geojson" \
  -where "OGR_GEOMETRY = 'LINESTRING' OR OGR_GEOMETRY = 'MULTILINESTRING'" \
  -lco RFC7946=YES \
  -lco COORDINATE_PRECISION=8

"$ogr2ogr" \
  -f GeoJSON \
  "$temporary_dir/pavement-road-edges-raw.geojson" \
  "$source_gdb" \
  -dialect SQLite \
  -sql "$pavement_edge_sql" \
  -t_srs EPSG:4326 \
  -segmentize 1 \
  -lco RFC7946=YES \
  -lco COORDINATE_PRECISION=8

"$ogr2ogr" \
  -f GeoJSON \
  "$temporary_dir/pavement-road-edges-parts.geojson" \
  "$temporary_dir/pavement-road-edges-raw.geojson" \
  -explodecollections \
  -lco RFC7946=YES \
  -lco COORDINATE_PRECISION=8

"$ogr2ogr" \
  -f GeoJSON \
  "$temporary_dir/pavement-road-edges.geojson" \
  "$temporary_dir/pavement-road-edges-parts.geojson" \
  -where "OGR_GEOMETRY = 'LINESTRING' OR OGR_GEOMETRY = 'MULTILINESTRING'" \
  -lco RFC7946=YES \
  -lco COORDINATE_PRECISION=8

mv "$temporary_dir/road-surface.geojson" \
  "$output_dir/road-surface.geojson"
mv "$temporary_dir/road-centerlines.geojson" \
  "$output_dir/road-centerlines.geojson"
mv "$temporary_dir/parking-road-edges.geojson" \
  "$output_dir/parking-road-edges.geojson"
mv "$temporary_dir/pavement-road-edges.geojson" \
  "$output_dir/pavement-road-edges.geojson"
rm "$temporary_dir/road-surface-raw.geojson"
rm "$temporary_dir/road-surface-parts.geojson"
rm "$temporary_dir/parking-road-edges-raw.geojson"
rm "$temporary_dir/parking-road-edges-parts.geojson"
rm "$temporary_dir/pavement-road-edges-raw.geojson"
rm "$temporary_dir/pavement-road-edges-parts.geojson"
rmdir "$temporary_dir"


echo "Updated roads, parking edges, and pavement road-edge linework"