# Ranches neighbourhood explorer

Next.js 16 + React + MapLibre GL JS, exported as static HTML. No API key or server is required.

## Run

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. `npm run build` creates `out/` for any static host. `npm run typecheck` checks TypeScript.

## Features

Graphite dark interface with translucent panels, photographic satellite grading and a rendered site plan: plots coloured by home type with building envelopes, landscape, parking, road names and plot numbers (villa numbers and dimensions appear when zoomed in). Clicking a plot shows its area, homes and building envelope. The supplied survey coordinates are projected from Egypt 1907 / Red Belt, while “Align to satellite” remains available for small imagery corrections; the map opens on Zone 1 and “Fit masterplan” returns to it.

**3D villas & streets** (on by default, toggle in the masterplan panel; “3D street view” tilts the camera): every plot with homes gets a G+1 villa massing (window bands, terrace and roof parapets, party-wall fins, roofs tinted by home type, cast shadows) standing in a lawn garden with a boundary wall, a gate and drive per home, and for twin and detached villas a roof room, a pool where one fits and a garden tree; clicking a villa opens its plot. A three-pylon canopy marks the main gate, a two-tier fountain with pulsing jets (lit blue after dark) stands in the plaza roundabout by plots 125–127, and OpenStreetMap buildings around the site are extruded as quiet context. Then textured asphalt carriageways, raised granite kerbs, paved sidewalks, planted medians, lane dashes, edge lines, zebra crossings and stop lines at junctions, parking bays, the boundary wall, landscape and pedestrian paths, under directional sun light with cast shadows and a sky at the horizon. The CAD road linework and parking fills are hidden while it is on.

**Time of day** (masterplan panel): the sun is computed for today's date at Ranches (local solar time), driving the light direction and colour, the sky, the imagery grading and every cast shadow; golden hour warms the scene, and after dusk a night shade falls while street lights pool on the road and about two in three villa windows glow. ▶ plays the day as a ~15 s time-lapse.

**Guided tour** flies through Zone 1, the main gate, the twin villas, the plaza fountain, the townhouse rows and the pedestrian walkway with a slow orbit at each stop; panels step aside, the caption dots jump between stops, and any touch, click or wheel on the map ends it (reduced motion: cuts instead of flights). The mouse wheel zooms directly on desktop; two-finger gestures are required only on touch screens.

WebGL satellite (Esri) and dark vector street (OpenFreeMap, OpenStreetMap data) basemaps; selectable CAD feature groups; opacity and visibility controls; editable latitude, longitude, width and rotation saved on the device; real amenity search/category/radius filters; straight-line distances; place selection and Google Maps directions; responsive layout.

## Data and accuracy

- Location pin comes from the supplied Google Maps link: 30.0989057, 30.8716454. The initial view frames the Zone 1 plots.
- `public/data/plan.json` is built from `ZONE 1 - IT.dwg` (model-space blocks expanded): 744 linework features by source layer, filled areas (44 plots, 27 building envelopes, landscape, parking courts, site boundary) and labels. Plots are rebuilt from the `#PLOT` linework and numbered from the `block num` attributes (101–137, 264–270); the villa numbers inside each plot give its type: 24 twin-villa plots (2 homes), 6 townhouse clusters (4), 7 townhouse rows (6) and 7 plots without a unit split, 114 homes in all. Plot and envelope areas are measured from the drawing. Arabic labels use an SHX keyboard encoding and are decoded, then translated (internal roads 18/24/26 m, main gate, boundary wall, pedestrian walkway, services zone: hotel, administrative & commercial, 41,670 m²). The ANSI31 hatch over plots 103–107 has no legend in the drawing and is shown only with Survey & dimensions. Survey spot levels are not in model space and are omitted. Indicative only, not a sales inventory.
- **Coordinate placement uses an inferred survey CRS.** The DWG bounds and location match Egypt 1907 / Red Belt (EPSG:22992), an engineering-survey coordinate system in metres. The app projects this grid to WGS 84 with the 3-parameter Egypt 1907 shift (EPSG:1545, `towgs84=-130,110,-13`) before rendering. Checked against Esri World Imagery, the highway carriageways (`exs l1`), the graded villa streets and the perimeter fence line up within about 2 m; a 7-parameter set tried earlier placed the plan about 160 m west. The CAD file itself does not declare its CRS, so retain the alignment control for small imagery corrections and validate against surveyed ground control before relying on it for construction or legal boundaries.
- `public/data/amenities.json` is a 15 October 2026 OpenStreetMap snapshot: 16 mapped amenities from bbox 30.80,30.03,30.95,30.17, filtered to 10 km. This bounding box does not cover the entire 10 km circle. OSM coverage is incomplete; unnamed places keep their mapped type. Distances are geodesic straight-line approximations, never driving times. Directions open Google Maps.
- If the snapshot is missing, the app tries two public Overpass endpoints with timeouts and an honest retry/error state.
- Satellite imagery, OpenFreeMap street vector tiles and label glyphs (protomaps basemaps-assets on GitHub Pages) require internet access. Attribution remains visible. Review providers' terms and traffic limits before a large public launch.
- OpenStreetMap data © OpenStreetMap contributors, ODbL: https://www.openstreetmap.org/copyright. Esri imagery credits are on the map.

- `public/data/streets.json` is built from the NUCA GIS layers in `GIS FILES-…zip` (`ملفات ال GIS/*.kmz`, already WGS 84): road centre-lines with reserve widths (13–26 m), kerb rings (الرصيف), parking areas and bays, landscape elements and the outer wall. Carriageways are the road reserve minus the kerbed areas, plus parking courts: pockets closed in by kerbs, sidewalks and landscape that no centre-line reaches but where the GIS draws parking bays (31 pockets, 6,000 m², chiefly the plaza court by plots 125–127; plots and roundabout centres have no bays and stay as imagery); markings are generated from that geometry (they are not surveyed paint). Painted lines are stored as centre-lines with a width and drawn at true size by a line layer, and repeated shapes are grouped into single multi-features (1.6 MB, 320 KB gzipped). The 129 trees (95 shade trees, 34 palms) are the `LP-TREE conceptt` inserts of `RAN-LS_latest.dwg` and follow the CAD placement. **Street lights (every 32 m) and parked cars (~60% of bays) are illustrative**, not in either source.

- `public/data/villas.json` is built from the plan's building envelopes (`#Setbacks-new`): each envelope is split into homes at the villa numbers (Voronoi), then massed as a ground floor and a first floor set back 1.4 m from the outer edges. 13 plots with homes have no envelope in the drawing; theirs is a uniform setback matching the median coverage of the same home type, and the plot card says so. Plots 125–127 and 265 have neither homes nor an envelope and stay open. Storey heights (7.5 m to parapet) and facades are illustrative, as are the garden works: gates face the nearest CAD carriageway, and pools, roof rooms and garden trees are placed by rule, not from a drawing. The main gate is placed where the boulevard's two carriageway axes cross the site boundary.

## Regenerate data

Install LibreDWG (`brew install libredwg`) and Shapely (`pip3 install shapely`) then:

```sh
dwgread -O JSON -o /tmp/ranches-dwg.json '../ZONE 1 - IT.dwg'
python3 scripts/convert-plan.py /tmp/ranches-dwg.json
```

An inspectable `public/data/plan-preview.svg` is also generated. Then rebuild the villa massing from the new plan:

```sh
python3 scripts/build-villas.py
```

For the 3D streets, unzip the GIS archive (macOS: `ditto -x -k` keeps the Arabic file names) and, for the trees, convert the landscape DWG:

```sh
dwgread -O JSON -o /tmp/ran-ls.json ../RAN-LS_latest.dwg
python3 scripts/import-streets.py '/path/to/GIS FILES/ملفات ال GIS' /tmp/ran-ls.json
```

The landscape JSON is about 1.3 GB and LibreDWG writes some invalid numbers; the script repairs them while loading. Raw DWG/LibreDWG JSON are not shipped.

To refresh nearby places, download the OpenStreetMap API area XML and run `python3 scripts/import-amenities.py /path/to/area.osm`. Review the snapshot date in the UI when updating it.
