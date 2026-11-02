"""Convert LibreDWG JSON into the app's masterplan data; model-space blocks are expanded.
Usage: dwgread -O JSON -o /tmp/plan.json source.dwg
       python3 scripts/convert-plan.py /tmp/plan.json
Requires shapely (plots, units and envelopes are rebuilt from loose CAD linework).
Writes public/data/plan.json with:
  features  linework per layer (all source geometry, for the line layers)
  areas     filled polygons: site, plot, unit, envelope, green, parking, hardscape
  labels    plot numbers, villa units, decoded Arabic road/zone names, dimensions, survey points
  summary   site totals shown to visitors
Coordinates are metres in the EPSG:22992 survey grid, relative to sourceBounds[0:2].
Survey spot levels and the POINT cloud are not in model space and are not exported.
"""
import collections, json, math, re, sys
from pathlib import Path
from shapely.geometry import LineString, Point, Polygon
from shapely.ops import polygonize, unary_union

j = json.load(open(sys.argv[1])); objects = j['OBJECTS']; byid = {o['handle'][-1]: o for o in objects}
layers = {o['handle'][-1]: o['name'] for o in objects if o.get('object') == 'LAYER'}
model = next(o for o in objects if o.get('name') == '*Model_Space')

def category_for(layer):
 layer = layer.lower()
 if any(token in layer for token in ['road', 'streets', 'axis', 'cr-', 'parking']): return 'roads'
 if 'green' in layer or 'gc_hatch' in layer: return 'greens'
 if 'bike' in layer: return 'bike'
 if 'plot' in layer or 'setback' in layer or 'pav-' in layer: return 'plots'
 if any(token in layer for token in ['fence', 'boundry', 'boundary', 'حد']): return 'perimeter'
 return 'technical'

# Arabic labels were typed with an AutoCAD SHX font that maps the Arabic 101 keyboard onto Latin keys;
# upper case selects the final glyph form of the same letter.
KEYS = dict(zip("qwertyuiop[]asdfghjkl;'zxcvbnm,/`", ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د', 'ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط',
 'ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ظ', 'ذ']))
KEYS.update({k.upper(): v for k, v in KEYS.items() if k.isalpha()}); KEYS.update({'{': 'ج', '}': 'د', '(': ')', ')': '('})
PHRASES = [(r'^طريق داخلي عرض (\d+) م$', 'Internal road · {0} m'), (r'^بوابة$', 'Main gate'), (r'^سور المشروع$', 'Project boundary wall'),
 (r'^ممر مشاه$', 'Pedestrian walkway'), (r'^منطقة خدمات$', 'Services zone'), (r'^\(?فندق ملحق به خدمات\)?$', 'Hotel with services'),
 (r'^\(?اداري[ةه] وتجاري[ةه]\)?$', 'Administrative & commercial'), (r'^منطقة رقم (\d+)$', 'Zone {0}'), (r'^بمسطح ([\d.]+) م2$', 'Area {0} m²')]
def decode_arabic(text):
 # '.' is the ز key, except as a decimal point between digits.
 decoded = ''.join('.' if c == '.' and 0 < i < len(text) - 1 and text[i - 1].isdigit() and text[i + 1].isdigit() else 'ز' if c == '.' else KEYS.get(c, c) for i, c in enumerate(text))
 return re.sub(r'\s+', ' ', decoded).strip()
def translate(arabic):
 for pattern, english in PHRASES:
  match = re.match(pattern, arabic)
  if match: return english.format(*[f'{float(g):,.0f}' if '.' in g else g for g in match.groups()])
 return None

def transform(p, m): x, y = p[:2]; a, b, c, d, tx, ty = m; return [a * x + c * y + tx, b * x + d * y + ty]
def compose(m, n): a, b, c, d, x, y = m; e, f, g, h, u, v = n; return [a * e + c * f, b * e + d * f, a * g + c * h, b * g + d * h, a * u + c * v + x, b * u + d * v + y]
def angle_of(m): return math.atan2(m[1], m[0])
def bulge_arc(start, end, b):
 dx, dy = end[0] - start[0], end[1] - start[1]; chord = math.hypot(dx, dy)
 if not b or not chord: return []
 cx = (start[0] + end[0]) / 2 - dy * (1 - b * b) / (4 * b); cy = (start[1] + end[1]) / 2 + dx * (1 - b * b) / (4 * b)
 r = chord * (1 + b * b) / (4 * abs(b)); a = math.atan2(start[1] - cy, start[0] - cx); sweep = 4 * math.atan(b)
 steps = max(2, min(64, math.ceil(abs(sweep) * math.sqrt(max(r, 1)))))
 return [[cx + r * math.cos(a + sweep * k / steps), cy + r * math.sin(a + sweep * k / steps)] for k in range(1, steps)]
def arc_points(cx, cy, r, a, b, ccw=True):
 if not ccw: a, b = -b, -a
 sweep = (b - a) % math.tau or math.tau; n = max(8, min(96, math.ceil(sweep * math.sqrt(max(r, 1)))))
 return [[cx + r * math.cos(a + sweep * i / n), cy + r * math.sin(a + sweep * i / n)] for i in range(n + 1)]
def polyline_points(vertices, closed):
 p = []
 for i, (start, b) in enumerate(vertices):
  p.append(start)
  if b and (i + 1 < len(vertices) or closed): p.extend(bulge_arc(start, vertices[(i + 1) % len(vertices)][0], b))
 if closed and vertices: p.append(vertices[0][0])
 return p
def entity_points(o):
 typ = o.get('entity')
 if typ == 'LINE': return [o['start'][:2], o['end'][:2]], False
 if typ == 'LWPOLYLINE':
  pts = o.get('points', []); bulges = o.get('bulges', []); closed = bool(o.get('flag', 0) & 512)
  return polyline_points([(pt[:2], bulges[i] if i < len(bulges) else 0) for i, pt in enumerate(pts)], closed), closed
 if typ == 'CIRCLE': return arc_points(*o['center'][:2], o['radius'], 0, math.tau), True
 if typ == 'ARC': return arc_points(*o['center'][:2], o['radius'], o.get('start_angle', 0), o.get('end_angle', math.tau)), False
 return [], False
def hatch_rings(o):
 rings = []
 for path in o.get('paths', []):
  if 'polyline_paths' in path: ring = polyline_points([(v['point'][:2], v.get('bulge', 0)) for v in path['polyline_paths']], True)
  else:
   ring = []
   for seg in path.get('segs', []):
    if seg['curve_type'] == 1: ring += [seg['first_endpoint'][:2], seg['second_endpoint'][:2]]
    elif seg['curve_type'] == 2: ring += arc_points(*seg['center'][:2], seg['radius'], seg['start_angle'], seg['end_angle'], bool(seg.get('is_ccw', 1)))
  if len(ring) > 2: rings.append(ring)
 return rings

lines = []; hatches = []; texts = []; dimensions = []; plot_numbers = []
def walk(o, m, inherited, depth=0):
 if depth > 16 or o.get('invisible'): return
 typ = o.get('entity'); layer = layers.get(o.get('layer', [0])[-1], '0')
 if layer == '0' and inherited: layer = inherited
 if typ == 'INSERT':
  block = byid.get(o.get('block_header', [0])[-1], {}); base = block.get('base_pt', [0, 0]); x, y = o['ins_pt'][:2]
  sx, sy = o.get('scale', [1, 1])[:2]; a = o.get('rotation', 0); c, s = math.cos(a), math.sin(a)
  n = compose(m, [c * sx, s * sx, -s * sy, c * sy, x - c * sx * base[0] + s * sy * base[1], y - s * sx * base[0] - c * sy * base[1]])
  for ref in o.get('attribs') or []:
   attrib = byid.get(ref[-1], {})
   if attrib.get('tag') == 'NO': plot_numbers.append((attrib.get('text_value', '').strip(), transform(attrib['ins_pt'], m)))
  for ref in block.get('entities', []):
   child = byid.get(ref[-1], {})
   if child.get('entity') != 'ATTDEF': walk(child, n, layer, depth + 1)
  return
 if typ == 'HATCH': hatches.append((layer, [[transform(v, m) for v in ring] for ring in hatch_rings(o)])); return
 if typ in ('TEXT', 'MTEXT'):
  raw = o.get('text_value') or o.get('text') or ''; raw = re.sub(r'\\[A-Za-z][^;]*;|[{}]', '', raw) if typ == 'MTEXT' else raw
  rotation = math.atan2(o['x_axis_dir'][1], o['x_axis_dir'][0]) if typ == 'MTEXT' and o.get('x_axis_dir') else o.get('rotation', 0)
  texts.append({'layer': layer, 'text': raw.strip(), 'at': transform(o['ins_pt'], m), 'rotation': rotation + angle_of(m), 'height': o.get('height') or o.get('text_height') or 1}); return
 if typ and typ.startswith('DIMENSION') and o.get('act_measurement'):
  dimensions.append({'layer': layer, 'value': o['act_measurement'], 'type': typ.split('_')[-1].lower(), 'at': transform(o['text_midpt'], m), 'from': transform(o.get('xline1_pt') or o['text_midpt'], m), 'to': transform(o.get('xline2_pt') or o.get('def_pt') or o['text_midpt'], m)}); return
 points, closed = entity_points(o)
 if len(points) > 1:
  if typ in ['LWPOLYLINE', 'ARC', 'CIRCLE'] and o.get('extrusion', [0, 0, 1])[2] < 0: points = [[-v[0], v[1]] for v in points]
  points = [transform(v, m) for v in points]
  if all(math.isfinite(v) for xy in points for v in xy): lines.append({'layer': layer, 'coordinates': points, 'closed': closed, 'type': typ})

for ref in model.get('entities', []): walk(byid.get(ref[-1], {}), [1, 0, 0, 1, 0, 0], None)

def layer_lines(*names): return [LineString(f['coordinates']) for f in lines if f['layer'] in names]
def faces(*names): return [p for p in polygonize(unary_union(layer_lines(*names))) if p.area > 1]
def closed_polys(*names): return [Polygon(f['coordinates']).buffer(0) for f in lines if f['layer'] in names and f['closed'] and len(f['coordinates']) > 3]

# Plots: faces of the #PLOT linework that hold a plot-number attribute. Villa numbers (1–2, 1–4, 1–6) inside a plot give its homes.
plot_faces = faces('#PLOT'); plots = []
for number, at in plot_numbers:
 point = Point(at); hits = [f for f in plot_faces if f.contains(point)]
 if hits: plots.append({'number': number, 'geometry': min(hits, key=lambda f: f.area)})
villa_texts = [t for t in texts if 'num villa' in t['layer'] and t['text'].strip().isdigit()]
TYPOLOGY = {2: 'Twin villa', 4: 'Townhouse cluster', 6: 'Townhouse row'}
envelopes = [f for f in faces('#Setbacks-new') if f.area > 20] or closed_polys('#Setbacks-new')
for plot in plots:
 grown = plot['geometry'].buffer(1)
 plot['homes'] = [t for t in villa_texts if grown.contains(Point(t['at']))]
 plot['typology'] = TYPOLOGY.get(len(plot['homes']), f"{len(plot['homes'])} homes" if plot['homes'] else 'Plot')
 plot['envelope'] = sum(e.area for e in envelopes if plot['geometry'].buffer(0.5).contains(e.representative_point()))
greens = unary_union([Polygon(r).buffer(0) for layer, rings in hatches if 'green' in layer.lower() for r in rings] + closed_polys('greens MD', 'Greens', 'XREF_17112024 Ranches PH2$0$greens MD'))
marked = unary_union([Polygon(r).buffer(0) for layer, rings in hatches if layer == 'GC_HATCH' for r in rings])  # ANSI31 hatch over plots 103–107; meaning not stated in the drawing
parking = [p for p in closed_polys('00-Parking Lots') if p.area > 2]
site = max(closed_polys('حد'), key=lambda p: p.area)

xs = [v[0] for f in lines for v in f['coordinates']]; ys = [v[1] for f in lines for v in f['coordinates']]; bounds = [min(xs), min(ys), max(xs), max(ys)]
ox, oy = bounds[:2]
def rel(xy): return [round(xy[0] - ox, 2), round(xy[1] - oy, 2)]
def rings_of(geometry):
 polys = [geometry] if geometry.geom_type == 'Polygon' else list(getattr(geometry, 'geoms', []))
 return [[[rel(c) for c in p.exterior.coords]] + [[rel(c) for c in hole.coords] for hole in p.interiors] for p in polys if p.geom_type == 'Polygon' and not p.is_empty]

features = []; counts = collections.Counter()
for index, f in enumerate(lines):
 features.append({'id': f'cad-{index}', 'coordinates': [rel(v) for v in f['coordinates']], 'layer': f['layer'], 'category': category_for(f['layer']), 'closed': f['closed']}); counts[f['layer']] += 1
areas = []
def add_area(kind, geometry, **props):
 for polygon in rings_of(geometry): areas.append({'id': f'area-{len(areas)}', 'kind': kind, 'rings': polygon, **props})
add_area('site', site, area=round(site.area))
add_area('green', greens)
add_area('marked', marked)
for p in parking: add_area('parking', p)
for plot in sorted(plots, key=lambda p: int(p['number']) if p['number'].isdigit() else 0):
 add_area('plot', plot['geometry'], plot=plot['number'], area=round(plot['geometry'].area), homes=len(plot['homes']), typology=plot['typology'], envelope=round(plot['envelope']))
for e in envelopes: add_area('envelope', e, area=round(e.area))

labels = []
def add_label(kind, text, at, rotation=0, **props): labels.append({'id': f'label-{len(labels)}', 'kind': kind, 'text': text, 'at': rel(at), 'rotation': round(math.degrees(rotation) % 360, 1), **props})
for plot in plots: add_label('plot', plot['number'], list(plot['geometry'].representative_point().coords)[0], typology=plot['typology'])
for t in villa_texts: add_label('unit', t['text'].strip(), t['at'])
for t in texts:
 if t['layer'] == '00 D-Text-Name':
  arabic = decode_arabic(t['text']); english = translate(arabic); rotation = t['rotation']
  if math.cos(rotation) < 0: rotation += math.pi  # keep road names readable left-to-right
  add_label('road' if english and english.startswith('Internal road') else 'name', english or arabic, t['at'], rotation, arabic=arabic, size=t['height'])
 elif t['layer'] in ('CORDINATE', 'text', 'new points') and re.match(r'^P\s*\d+$', t['text']): add_label('survey', t['text'].replace(' ', ''), t['at'])
for d in dimensions:
 rotation = math.atan2(d['to'][1] - d['from'][1], d['to'][0] - d['from'][0]); rotation += math.pi if math.cos(rotation) < 0 else 0
 add_label('dimension', ('R ' if d['type'] == 'radius' else '') + f"{d['value']:.2f} m".replace('.00 m', ' m'), d['at'], rotation)

# The services-zone note is five stacked CAD texts; merge them into one callout.
zone_parts = {l['text']: l for l in labels if l['kind'] == 'name' and (l['text'] in ('Services zone', 'Hotel with services', 'Administrative & commercial') or l['text'].startswith(('Zone ', 'Area ')))}
if 'Services zone' in zone_parts:
 at = [sum(l['at'][i] for l in zone_parts.values()) / len(zone_parts) for i in (0, 1)]; area = next((t for t in zone_parts if t.startswith('Area ')), '')
 labels = [l for l in labels if l['id'] not in {z['id'] for z in zone_parts.values()}]
 labels.append({'id': 'label-services', 'kind': 'zone', 'text': 'Services zone', 'detail': ' · '.join(x for x in ['Hotel, administrative & commercial', area.replace('Area ', '')] if x), 'at': at, 'rotation': 0})
zone_names = [l for l in labels if l['kind'] in ('name', 'zone')]
typologies = collections.Counter(p['typology'] for p in plots)
summary = {'landArea': round(site.area), 'plots': len(plots), 'homes': sum(len(p['homes']) for p in plots), 'plotArea': round(sum(p['geometry'].area for p in plots)),
 'greenArea': round(greens.area), 'parkingAreas': len(parking), 'typologies': dict(typologies),
 'roadWidths': sorted({int(m.group(1)) for l in labels if l['kind'] == 'road' for m in [re.search(r'(\d+) m', l['text'])] if m})}
result = {'features': features, 'areas': areas, 'labels': labels, 'summary': summary, 'bounds': [0, 0, round(bounds[2] - ox, 2), round(bounds[3] - oy, 2)], 'sourceBounds': bounds,
 'source': 'ZONE 1 - IT.dwg', 'crs': 'EPSG:22992', 'coordinateSystem': 'Egypt 1907 / Red Belt', 'units': 'metres', 'layers': list(counts),
 'alignment': 'Projected from Egypt 1907 / Red Belt; optional adjustment remains available for imagery matching'}
out = Path('public/data/plan.json'); out.write_text(json.dumps(result, separators=(',', ':'), ensure_ascii=False))
print('Lines:', len(features), 'Areas:', collections.Counter(a['kind'] for a in areas), 'Labels:', collections.Counter(l['kind'] for l in labels))
print('Summary:', summary, 'Bytes:', out.stat().st_size)
for l in zone_names + [l for l in labels if l['kind'] == 'road']: print(' ', l['kind'], l['text'], '|', l.get('arabic'))
unplaced = [n for n, _ in plot_numbers if n not in {p['number'] for p in plots}]
if unplaced: print('Plot numbers without a plot outline:', unplaced)
w, h = result['bounds'][2:]; svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}"><rect width="100%" height="100%" fill="#263b34"/><g transform="translate(0,{h}) scale(1,-1)" fill="none" stroke="#eff1c8" stroke-width="{w/2000}">'
svg += ''.join('<polyline points="' + ' '.join(f'{x},{y}' for x, y in f['coordinates']) + '"/>' for f in features) + '</g></svg>'
Path('public/data/plan-preview.svg').write_text(svg)
