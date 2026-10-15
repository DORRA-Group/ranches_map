# Ranches neighbourhood explorer

Next.js 16 + React + Leaflet, exported as static HTML. No API key or server is required.

## Run

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. `npm run build` creates `out/` for any static host. `npm run typecheck` checks TypeScript.

## Features

Satellite (Esri) and street (OpenStreetMap) layers; canvas-rendered CAD overlay; opacity/toggle; editable latitude, longitude, width and rotation saved on the device; real amenity search/category/radius filters; straight-line distances; place selection and Google Maps directions; responsive layout.

## Data and accuracy

- Location pin comes from the supplied Google Maps link: 30.0989057, 30.8716454. Initial view uses the link's viewport, 30.1001275, 30.8605909.
- `public/data/plan.json` contains 744 extracted paths from `ZONE 1 - IT.dwg`, about 107 KB. LibreDWG expands model-space block references; conversion preserves lines, polylines, bulge arcs, circles and arcs, including negative-Z object coordinates. Text, points, dimensions, solids and hatches are omitted. This is simplified linework, not a fully rendered architectural model.
- **Alignment is approximate and unverified.** The drawing has survey-like coordinates but no confirmed CRS. Its unit header says inches, which is not reliable for the observed extents. Initial placement is a visual starting point, not georeferencing. Confirm two or more ground-control points or the source CRS, then adjust alignment. Saved alignment is device-local.
- `public/data/amenities.json` is a 15 October 2026 OpenStreetMap snapshot: 16 mapped amenities from bbox 30.80,30.03,30.95,30.17, filtered to 10 km. This bounding box does not cover the entire 10 km circle. OSM coverage is incomplete; unnamed places keep their mapped type. Distances are geodesic straight-line approximations, never driving times. Directions open Google Maps.
- If the snapshot is missing, the app tries two public Overpass endpoints with timeouts and an honest retry/error state.
- Satellite/street tiles require internet access. Attribution remains visible. Review providers' terms and traffic limits before a large public launch.
- OpenStreetMap data © OpenStreetMap contributors, ODbL: https://www.openstreetmap.org/copyright. Esri imagery credits are on the map.

## Regenerate data

Install LibreDWG (`brew install libredwg`) then:

```sh
dwgread -O JSON -o /tmp/ranches-dwg.json '../ZONE 1 - IT.dwg'
python3 scripts/convert-plan.py /tmp/ranches-dwg.json
```

An inspectable `public/data/plan-preview.svg` is also generated. Raw DWG/LibreDWG JSON are not shipped.

To refresh nearby places, download the OpenStreetMap API area XML and run `python3 scripts/import-amenities.py /path/to/area.osm`. Review the snapshot date in the UI when updating it.
