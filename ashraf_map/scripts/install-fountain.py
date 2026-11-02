#!/usr/bin/env python3
"""Patch an existing RANCHES App.tsx safely and idempotently.
Run from your Cesium project root, after copying the patch's src/public/scripts folders.
"""
from pathlib import Path
import sys,shutil
p=Path('src/App.tsx')
if not p.exists():
 print('Error: run from the RANCHES project root, alongside package.json',file=sys.stderr)
 sys.exit(1)
s=p.read_text(encoding='utf-8')
if 'loadGardenFountains' in s:
 print('Fountain layer already installed: skipping App.tsx modification')
 sys.exit(0)
checks=[
 ('import { loadFullSidewalk } from "./fullSidewalk";',
  'import { loadFullSidewalk } from "./fullSidewalk";\nimport { loadGardenFountains } from "./fountainGarden";'),
 ('  | "sidewalkDemo";', '  | "sidewalkDemo"\n  | "fountains";'),
 ('    id: "sidewalkDemo",', '''    id: "fountains",
    label: "3D landscaped fountains",
    arabicLabel: "نوافير وحدائق الدوارات ثلاثية الأبعاد",
    featureCount: "Custom",
    color: "#5CA772",
    url: "/data/fountain-roundabouts.geojson",
    defaultVisible: false,
  },
  {
    id: "sidewalkDemo",'''),
 ('        } else if (id === "sidewalkDemo") {',
  '''        } else if (id === "fountains") {
          loadedDataSources = [await loadGardenFountains(PAVEMENT_CURB_HEIGHT)];
        } else if (id === "sidewalkDemo") {'''),
]
for before,after in checks:
 count=s.count(before)
 if count!=1:
  print(f'Error: expected 1 match, found {count}: {before[:80]!r}. No changes made.',file=sys.stderr)
  sys.exit(2)
 s=s.replace(before,after,1)
backup=p.with_suffix('.tsx.before-fountain.bak')
if not backup.exists():shutil.copy2(p,backup)
p.write_text(s,encoding='utf-8')
print('Installed 3D landscaped fountains layer. Backup:',backup)
