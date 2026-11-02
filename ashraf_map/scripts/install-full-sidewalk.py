#!/usr/bin/env python3
"""Patch only the two known App.tsx points; backup first, refuse unknown code."""
from pathlib import Path
import shutil
import sys

root=Path(__file__).resolve().parents[1]
app=root/'src'/'App.tsx'
if not app.exists():raise SystemExit('src/App.tsx was not found; run from your RANCHES project.')
s=app.read_text(encoding='utf8')
if 'from "./fullSidewalk"' in s:
    print('Full-site sidewalk already installed; App.tsx unchanged.')
    raise SystemExit(0)

old_import='import { loadSidewalkDemo, SIDEWALK_DEMO_CENTER } from "./sidewalkDemo";'
new_import=('import { SIDEWALK_DEMO_CENTER } from "./sidewalkDemo";\n'
            'import { loadFullSidewalk } from "./fullSidewalk";')
old_call='loadedDataSources = await loadSidewalkDemo('
new_call='loadedDataSources = await loadFullSidewalk('
for target in [old_import, old_call]:
    if s.count(target)!=1:
        raise SystemExit(f'Could not identify exactly one occurrence of {target!r}. '
                         'Original file was not modified. Please inspect App.tsx manually.')
updated=s.replace(old_import,new_import).replace(old_call,new_call)
updated=updated.replace('3D sidewalk & classic lamps (demo)','3D sidewalks & classic lamps')
# Optional display-only count, scoped to the existing sidebar row.
rowstart=updated.find('id: "sidewalkDemo"')
if rowstart>=0:
    end=updated.find('},',rowstart)
    block=updated[rowstart:end]
    if 'featureCount: "4"' in block:
        updated=updated[:rowstart]+block.replace('featureCount: "4"','featureCount: "243"')+updated[end:]
backup=app.with_suffix('.tsx.before-full-sidewalk.bak')
shutil.copy2(app,backup)
app.write_text(updated,encoding='utf8')
print('Installed full-site sidewalk loader in src/App.tsx.')
print('Backup saved:',backup)
