#!/usr/bin/env python3
"""Apply the optional world-scaled asphalt material to the local RANCHES App.tsx.

Run from project root. Fails without modifying files if App.tsx differs too much.
Use on the already-working Cesium app; it does not alter GIS/curbs/lamps.
"""
from pathlib import Path
import re
import shutil

root = Path.cwd()
app = root / 'src' / 'App.tsx'
module = root / 'src' / 'roadTextureMapping.ts'
if not app.is_file():
    raise SystemExit('Cannot find src/App.tsx — run from the project root.')
if not module.is_file():
    raise SystemExit('Cannot find src/roadTextureMapping.ts — copy it first.')
text = app.read_text(encoding='utf8')
import_line = 'import { styleRoadSurfaceMetered } from "./roadTextureMapping";'
start_re = re.compile(r'(?m)^function styleRoadSurface\(')
end_re = re.compile(r'(?m)^function getParkingTextureRepeat\(')
starts = list(start_re.finditer(text))
ends = list(end_re.finditer(text))
if len(starts) != 1 or len(ends) != 1 or ends[0].start() <= starts[0].start():
    raise SystemExit('Unexpected App.tsx structure; no files modified.')

old_block = text[starts[0].start():ends[0].start()]
if 'styleRoadSurfaceMetered(' in old_block and import_line in text:
    print('Already applied. No changes needed.')
    raise SystemExit(0)
if 'new Cesium.ImageMaterialProperty(' not in old_block or 'ROAD_SURFACE_HEIGHT' not in old_block:
    raise SystemExit('Unexpected road styling function; no files modified.')

new_block = '''function styleRoadSurface(dataSource: Cesium.DataSource) {
  // Geographic positions unchanged; asphalt tiles repeat at constant metre scale.
  styleRoadSurfaceMetered(dataSource, ASPHALT_TEXTURE_URL, ROAD_SURFACE_HEIGHT);
}

'''
updated = text[:starts[0].start()] + new_block + text[ends[0].start():]
if import_line not in updated:
    match = re.search(r'(?m)^import \* as Cesium from [\'\"]cesium[\'\"];?\s*$', updated)
    if not match:
        raise SystemExit('Cannot find Cesium import; no files modified.')
    updated = updated[:match.end()] + '\n' + import_line + updated[match.end():]
shutil.copy2(app, app.with_suffix('.tsx.quality-backup'))
app.write_text(updated, encoding='utf8')
print('Updated src/App.tsx. Backup: src/App.tsx.quality-backup')
