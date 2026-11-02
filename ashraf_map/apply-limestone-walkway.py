#!/usr/bin/env python3
"""Safely patch ONLY the walkway material in an existing sidewalkDemo.ts.

Copy src/limestoneWalkway.ts and public/textures/limestone-walkway.png
from this package into your project first, then run here from project root:
    python3 apply-limestone-walkway.py

The current sidewalkDemo.ts is backed up before being modified; existing
lamppost size, headings, positions and shadows are left unchanged.
"""
from pathlib import Path
import re
import sys

path = Path('src/sidewalkDemo.ts')
module = Path('src/limestoneWalkway.ts')
texture = Path('public/textures/limestone-walkway.png')
if not path.exists() or not module.exists() or not texture.exists():
    sys.exit('Missing src/sidewalkDemo.ts, src/limestoneWalkway.ts or the limestone texture; run from project root.')
s = path.read_text(encoding='utf-8')
original = s
if 'createLimestoneWalkwayTop' in s:
    sys.exit('Limestone walkway is already installed. No changes made.')
if 'import * as Cesium from "cesium";' not in s:
    sys.exit('Unknown Cesium import; no changes made. Please use the provided example.')

if 'const walkwayTop = new Cesium.CustomDataSource("Walkway tile surface");' in s:
    # Previous assistant-recommended walkway layer reused the parking image.
    old = re.compile(
        r'^[ \t]*const walkwayTop = new Cesium.CustomDataSource\("Walkway tile surface"\);'
        r'\s*const tileMaterial = new Cesium.ImageMaterialProperty\(\{.*?^\s*\}\);',
        flags=re.M | re.S,
    )
    s, hits = old.subn('  const walkwayTop = createLimestoneWalkwayTop(sidewalk, topHeightMeters);', s, count=1)
    if hits != 1:
        sys.exit('Could not isolate old tile material safely; no changes made.')
    s, _ = re.subn(
        r'\n[ \t]*const hierarchy = entity\.polygon\.hierarchy\?\.getValue\(\s*Cesium\.JulianDate\.now\(\)\s*\);',
        '', s,
        count=1,
    )
    # Remove old entity-per-polygon textured overlay, including nested object braces.
    marker = '// Add a separate tiled walking surface.'
    start = s.find(marker)
    if start < 0:
        sys.exit('Could not find the old walking-surface block; no changes made.')
    branch_start = s.find('if (hierarchy) {', start)
    if branch_start < 0:
        sys.exit('Could not locate old texture overlay; no changes made.')
    opening = s.find('{', branch_start)
    depth = 0
    closing = None
    for pos in range(opening, len(s)):
        if s[pos] == '{':
            depth += 1
        elif s[pos] == '}':
            depth -= 1
            if depth == 0:
                closing = pos + 1
                break
    if closing is None:
        sys.exit('Malformed overlay block; no changes made.')
    line_start = s.rfind('\n', 0, start) + 1
    s = s[:line_start] + s[closing:]

else:
    # Original plain-colour slab, without any separate walkway top.
    anchor = 'const stone = Cesium.Color.fromCssColorString("#CDBB9C");'
    if anchor not in s:
        sys.exit('Could not locate the raised beige slab; no changes made.')
    s = s.replace(anchor, anchor + '\n  const walkwayTop = createLimestoneWalkwayTop(sidewalk, topHeightMeters);', 1)

s = s.replace(
    'import * as Cesium from "cesium";',
    'import * as Cesium from "cesium";\nimport { createLimestoneWalkwayTop } from "./limestoneWalkway";',
    1,
)
if 'return [sidewalk, walkwayTop, posts];' not in s:
    if 'return [sidewalk, posts];' not in s:
        sys.exit('Unknown sidewalk return structure; no changes made.')
    s = s.replace('return [sidewalk, posts];', 'return [sidewalk, walkwayTop, posts];', 1)
if 'tileMaterial' in s or 'parking-pavers.png' in s:
    sys.exit('Old parking material still present in sidewalkDemo.ts; no changes made.')
backup = path.with_suffix('.tsx-no-limestone-backup')
if backup.exists():
    sys.exit(f'Backup already exists: {backup}; rename it before retrying.')
backup.write_text(original, encoding='utf-8')
path.write_text(s, encoding='utf-8')
print(f'Updated {path} (backup: {backup}). Existing lamppost code preserved.')
