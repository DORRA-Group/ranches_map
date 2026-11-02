# RANCHES — raised striped curb update

This package changes only the curb/marking implementation. It is based on the
latest App.tsx uploaded in this conversation, with asynchronous:false already present.

## Install (simplest approach)
1. Back up your existing src/App.tsx.
2. Copy src/App.tsx from this ZIP into your project's src/App.tsx.
3. Copy the four .bin files in public/data into your project's public/data.
4. Copy scripts/build-paint-meshes.py into your project's scripts folder.
5. The paint-meshes-manifest.json update is optional metadata; copy it too if you use the manifest.
6. Start the application with npm run dev and inspect closely from oblique angles.

## Alternative: keep edits you made since uploading App.tsx
Instead of copying App.tsx, apply `raised-curbs.patch` in the root of your
project with `git apply --check /path/to/raised-curbs.patch` first. Then run
`git apply /path/to/raised-curbs.patch` if it passes. Do NOT both copy App.tsx
and apply the patch. The patch matches the App_fixed.tsx uploaded earlier.

## What changes
- Existing black-and-white road-side curb widened from 18 cm to 40 cm
  and shifted ~16 cm towards the pavement (roughly 36 cm on the pavement
  side and 4 cm on the road side).
- Additional black-and-white segments appear where parking borders the
  pavement, inferred from intersecting your existing GIS geometry.
- Curb top: 0.20 m above local WGS84 ellipsoid (15 cm above asphalt which
  is at 0.05 m, and 12 cm above parking which is at 0.08 m).
- Vertical curb faces now connect to asphalt/parking ground height.
- Pavement outlines drawn at 0.195 m so they sit below the raised curb top.
- World anchored geometry, no screen-pixel width changes.

This does not yet generate an entire raised sidewalk slab across the sidewalk
interior. It adds raised curb geometry along its boundaries. A true pedestrian
zebra crossing perpendicular to a road is also a separate feature and would
require an intended crossing location and orientation.

## Regeneration
If GIS edges change, regenerate bin files using:
  python3 -m pip install numpy shapely pyproj
  python3 scripts/build-paint-meshes.py
The original GeoJSON files are not modified.

Validation: Source generator completed for all eight meshes, geometry sizes
validated, and TypeScript compilation `tsc --noEmit` passed. Runtime visual
appearance still needs checking in your Cesium browser.
