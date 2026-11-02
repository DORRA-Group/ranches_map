# RANCHES Phase 1 — Cesium GIS Map

A React + TypeScript application built with Node.js, Vite, and CesiumJS. It displays the aligned Phase 1 GIS layers and a derived asphalt-road presentation on a Cesium globe.

> Development policy: this project is local-only. Run it on `127.0.0.1`; do not publish or deploy updates to a hosted Site.

## Included

- CesiumJS installed and versioned through npm
- React component architecture with strict TypeScript checks
- Vite development and production build workflow
- Cesium 3D globe with satellite and street basemaps
- GIS layers exported from EPSG:22992 to WGS84 GeoJSON with 1 m densification
- Asphalt road surfaces derived as the project-boundary remainder after removing mapped non-road areas
- Dashed center markings that follow the source curves and stop across recorded junction centres
- Parking areas plus an optional 3,290-bay detail layer
- Road-facing parking edge paint and off-white painted parking-bay markings
- Landscaping, pedestrian walkways, sidewalks, outer fence, and project phases
- Project overview camera, north-up control, live coordinates, and boundary visibility toggle
- Responsive desktop and mobile interface
- Project facts read from the GIS attributes: New Sphinx City, 299.01 feddans, 1,256,094.82 m²

## Development

```bash
npm install
npm run dev
```

The local map will be available at `http://127.0.0.1:4173/`.

Create a production build with `npm run build`.

## Structure

- `src/App.tsx` — React interface and Cesium viewer lifecycle
- `src/styles.css` — responsive interface styling
- `public/data/road-surface.geojson` — project boundary minus mapped plots, pavement, parking, and landscape
- `public/data/road-centerlines.geojson` — junction-trimmed centreline geometry for markings
- `public/data/parking-road-edges.geojson` — parking boundaries shared with the derived road surface
- `public/data/redstone-coverage-manifest.json` — generated coverage statistics and overlap checks
- `public/data/water-areas.geojson` — six verified water polygons rendered with animated Cesium water
- `public/data/green-areas.geojson` — 40 verified greenery polygons rendered as raised textured turf
- `public/models/ranches-redstone-coverage.glb` — full-site red sandstone pavement with exclusion holes
- `public/textures/asphalt.jpg` — optimized copy of the supplied asphalt texture
- `public/textures/parking-pavers.png` — repeating parking-surface paver texture
- `scripts/build-redstone-coverage.py` — rebuilds the redstone model from the GIS exclusion layers
- `scripts/import-water-areas.py` — validates and imports the approved water-area GeoJSON
- `scripts/import-green-areas.py` — repairs, validates, and imports approved greenery GeoJSON
- `vite.config.ts` — Cesium asset and production-build configuration
- `dist/` — generated production application
- `.openai/hosting.json` — Sites deployment configuration

Every GIS category remains independently toggleable. The project-boundary and outer-fence polygons are displayed as outlines only, and the detailed parking-bay layer is loaded on demand to keep the initial map responsive.

## Redstone pavement coverage

The red sandstone surface fills the part of the project boundary that remains after subtracting asphalt roads, parking, complete land-plot polygons, verified green and water areas, and the inner rings of the greenery polygons. The source data has plot-area and numeric footprint attributes, but no verified building-footprint geometry, so private plots are conservatively excluded in full.

Rebuild the model after changing one of its source layers with:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements-redstone.txt
.venv/bin/python scripts/build-redstone-coverage.py
```

The generator validates that the resulting surface does not overlap any exclusion layer and writes the results to `public/data/redstone-coverage-manifest.json`.

## Green areas

The supplied greenery layer contains 40 approved polygons covering approximately 38,954 m². They are rendered as raised 3D turf with a repeating grass texture. Use the **Green areas** camera control to inspect the full set and the layer control to show or hide it. The pavement generator excludes the exact greenery surfaces.

Import a replacement approved GeoJSON and rebuild the pavement with:

```bash
.venv/bin/python scripts/import-green-areas.py /absolute/path/to/green_areas.geojson
.venv/bin/python scripts/build-redstone-coverage.py
```

## Animated water areas

The six approved polygons in `water-areas.geojson` are rendered with Cesium's animated water material. Use the **Water areas** camera control to inspect them and the **Animated water areas** layer control to show or hide them. The pavement generator excludes these polygons so the redstone surface does not remain underneath the water.

Import a replacement approved GeoJSON with:

```bash
.venv/bin/python scripts/import-water-areas.py /absolute/path/to/water_areas.geojson
.venv/bin/python scripts/build-redstone-coverage.py
```

## Road geometry notes

The source GIS does not include a verified road-surface polygon layer. The road surface is therefore calculated as the area remaining inside `land_boundary` after subtracting the mapped `land_use`, parking, and landscape polygons. The 83 closed `Pavement` line outlines are polygonized and included in the non-road mask. This lets the available classified layers define the road edges instead of estimating the surface from centreline widths.

`Road_lines_1` remains the guide for centre markings and intersection trimming, but it no longer controls the asphalt footprint. The resulting surface is still derived geometry and should not be treated as surveyed curb geometry if any source classification is later found to be missing or incorrect.

Road markings use the same centreline geometry. Markings are removed around the 50 junction connections recorded by the source layer, so dashed paint does not run through the middle of those intersections. The road surface is raised 0.05 m and the markings 0.88 m above the ellipsoid to avoid coplanar flicker while preserving `depthTestAgainstTerrain = false`, disabled terrain clamping, and request-render mode.

Regenerate both road GeoJSON files after a verified source update with:

```bash
./scripts/build-road-geojson.sh /absolute/path/to/source.gdb
```
