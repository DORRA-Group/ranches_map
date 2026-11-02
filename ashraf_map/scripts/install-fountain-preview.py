#!/usr/bin/env python3
"""RANCHES fountain demo: install layer if needed, show one GIS-safe site, add camera shortcut.
Run from project root AFTER merging package public/src/scripts folders.
"""
from pathlib import Path
import re
import runpy
import shutil
import sys

app = Path('src/App.tsx')
if not app.is_file() or not Path('package.json').is_file():
    raise SystemExit('Run from the RANCHES project root (containing package.json and src/App.tsx).')
for resource in ('src/fountainGarden.ts', 'public/models/ranches-garden-fountain.glb', 'public/data/fountain-roundabouts.geojson'):
    if not Path(resource).is_file():
        raise SystemExit(f'Missing {resource}. Copy the package src/ and public/ folders into the project first.')

# Always preserve the user's original app, even when the base installer runs first.
backup = Path('src/App.tsx.before-fountain-preview.bak')
if not backup.exists():
    shutil.copy2(app, backup)

s = app.read_text(encoding='utf-8')
if 'loadGardenFountains' not in s:
    base_installer = Path('scripts/install-fountain.py')
    if not base_installer.is_file():
        raise SystemExit('Missing scripts/install-fountain.py. Copy the scripts/ folder from this patch.')
    runpy.run_path(str(base_installer), run_name='__main__')
    s = app.read_text(encoding='utf-8')

# Upgrade the existing import so the camera and GeoJSON placement refer to the same demo.
if 'FOUNTAIN_PREVIEW_CENTER' not in s:
    match = re.search(r'import\s*\{\s*loadGardenFountains\s*\}\s*from\s*[\'\"]\./fountainGarden[\'\"];', s)
    if not match:
        raise SystemExit('Could not find the fountainGarden import; app not modified by preview step.')
    s = s[:match.start()] + 'import { FOUNTAIN_PREVIEW_CENTER, loadGardenFountains } from "./fountainGarden";' + s[match.end():]

# One fountain visible on initial map load; existing user can turn it off in layer menu.
layer = re.search(r'(\{\s*id:\s*[\'\"]fountains[\'\"],[\s\S]*?\bdefaultVisible:\s*)(true|false)', s)
if not layer:
    raise SystemExit('Could not locate the fountain layer configuration in App.tsx.')
s = s[:layer.start(2)] + 'true' + s[layer.end(2):]

if 'const viewGardenFountain = ' not in s:
    anchor = '  const orientNorth = () => {'
    if s.count(anchor) != 1:
        raise SystemExit('Could not find camera-controls insertion point in App.tsx.')
    function = '''  // Temporary GIS-anchored fountain demo camera; no change to normal project home view.
  const viewGardenFountain = () => {
    if (!layerVisibilityRef.current.fountains) {
      const layer = LAYERS.find((item) => item.id === "fountains");
      if (layer) toggleLayer(layer);
    }
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.camera.flyToBoundingSphere(
      new Cesium.BoundingSphere(
        Cesium.Cartesian3.fromDegrees(
          FOUNTAIN_PREVIEW_CENTER.longitude,
          FOUNTAIN_PREVIEW_CENTER.latitude,
          PAVEMENT_CURB_HEIGHT,
        ),
        12,
      ),
      {
        offset: new Cesium.HeadingPitchRange(
          Cesium.Math.toRadians(28),
          Cesium.Math.toRadians(-55),
          85,
        ),
        duration: 1.4,
      },
    );
    viewer.scene.requestRender();
  };

'''
    s = s.replace(anchor, function + anchor, 1)

if 'onClick={viewGardenFountain}' not in s:
    button = '''
          <button
            className="action-button"
            type="button"
            onClick={viewGardenFountain}
          >
            View fountain
          </button>
'''
    pattern = r'(<button\s+className="action-button"\s+type="button"\s+onClick=\{view3DSidewalk\}\s*>\s*3D sidewalk\s*</button>)'
    if not re.search(pattern, s):
        raise SystemExit('Could not find the existing 3D sidewalk button in App.tsx.')
    s = re.sub(pattern, lambda m: m.group(1) + button, s, count=1)

app.write_text(s, encoding='utf-8')
print('Fountain preview installed. One island is selected, the layer starts ON, and View fountain was added to the top bar.')
print('Original App.tsx backup:', backup)
