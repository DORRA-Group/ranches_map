#!/usr/bin/env python3
"""Safely integrate the RANCHES 3D sidewalk demo into a current src/App.tsx.

Run from the RANCHES project root after copying the assets/module.
A backup is made. Fails without writing if the expected anchor points are missing.
"""
from pathlib import Path
import re

app = Path('src/App.tsx')
if not app.exists():
    raise SystemExit('ERROR: Run this from your RANCHES project root (where src/App.tsx exists).')
s = app.read_text(encoding='utf8')
if '"sidewalkDemo"' in s:
    raise SystemExit('Already integrated. No changes made.')
original = s

def replace_once(old, new, label):
    global s
    count = s.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected one match, found {count}. Nothing was written.')
    s = s.replace(old, new, 1)

replace_once('import * as Cesium from "cesium";',
    'import * as Cesium from "cesium";\nimport { loadSidewalkDemo, SIDEWALK_DEMO_CENTER } from "./sidewalkDemo";',
    'Cesium import')
match=re.search(r'(\|\s*"phases")\s*;',s)
if not match:
    raise RuntimeError('LayerId phases entry not found. Nothing was written.')
s=s[:match.start()]+match.group(1)+'\n  | "sidewalkDemo";'+s[match.end():]

idx=s.find('    id: "fence",')
if idx<0 or s.count('    id: "fence",')!=1:
    raise RuntimeError('Fence layer anchor not unique. Nothing was written.')
idx=s.rfind('  {',0,idx)
if idx<0: raise RuntimeError('Fence layer object start not found. Nothing was written.')
s=s[:idx]+'''  {
    id: "sidewalkDemo",
    label: "3D sidewalk & classic lamps (demo)",
    arabicLabel: "رصيف ثلاثي الأبعاد وأعمدة إنارة كلاسيكية",
    featureCount: "4",
    color: "#CDBB9C",
    url: "/data/demo-sidewalk.geojson",
    defaultVisible: true,
  },

'''+s[idx:]
pattern=r'(?m)^(?P<indent>[ \t]*)\} else if \(id === "sidewalks"\) \{'
matches=list(re.finditer(pattern,s))
if len(matches)!=1:
    raise RuntimeError(f'Sidewalk loading branch: found {len(matches)} matches. Nothing written.')
m=matches[0]
indent=m.group('indent')
s=s[:m.start()]+f'''{indent}}} else if (id === "sidewalkDemo") {{
{indent}  loadedDataSources = await loadSidewalkDemo(
{indent}    PAVEMENT_CURB_HEIGHT,
{indent}    ROAD_SURFACE_HEIGHT,
{indent}  );
'''+s[m.start():]
replace_once('  const orientNorth = () => {', '''  const view3DSidewalk = () => {
    viewerRef.current?.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        SIDEWALK_DEMO_CENTER.longitude,
        SIDEWALK_DEMO_CENTER.latitude,
        115,
      ),
      orientation: {
        heading: Cesium.Math.toRadians(15),
        pitch: Cesium.Math.toRadians(-53),
        roll: 0,
      },
      duration: 1.4,
    });
  };

  const orientNorth = () => {''', 'Orient north camera control')
needle='aria-label="Orient map north"'
idx=s.find(needle)
if idx<0 or s.count(needle)!=1:
    raise RuntimeError('Orient map north button not found. Nothing written.')
idx=s.rfind('<button',0,idx)
if idx<0: raise RuntimeError('Button start not found. Nothing written.')
# Preserve indentation from existing button
start_of_line=s.rfind('\n',0,idx)+1
indent=s[start_of_line:idx]
s=s[:start_of_line]+'''          <button
            className="action-button"
            type="button"
            onClick={view3DSidewalk}
          >
            3D sidewalk
          </button>

'''+s[start_of_line:]

backup=Path('src/App.tsx.pre-sidewalk-demo.bak')
if backup.exists():
    raise RuntimeError('Backup already exists; move or rename it before retrying. Nothing written.')
backup.write_text(original,encoding='utf8')
app.write_text(s,encoding='utf8')
print('Added one 3D sidewalk pilot layer + camera button. Backup:',backup)
