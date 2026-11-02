"""Build the 3D streetscape (public/data/streets.json) from the NUCA GIS layers and the Zone 1 landscape DWG.
Usage: python3 scripts/import-streets.py '<folder with the .kmz layers>' [/tmp/ran-ls.json]
The optional second argument is `dwgread -O JSON` output of RAN-LS_latest.dwg; its LP-TREE inserts become 3D trees.
Requires shapely. The KMZ layers are already WGS 84; geometry is built in local metres around the site and
converted back. Writes one GeoJSON FeatureCollection whose `kind` property drives the map layers:
  carriageway / parking   asphalt surfaces (road reserve minus kerbed areas; lay-by parking)
  sidewalk / island / kerb raised surfaces from the kerb rings (الرصيف), with a granite kerb along the road edge
  green / path            landscape areas and pedestrian paths (عناصر تنسيق الموقع)
  marking                 zebra crossings, as polygons
  line                    lane dashes, edge lines, stop lines and parking-bay lines as centre-lines with a `width` in metres
                          (a line layer draws them at true width; a quarter of the bytes of the same paint as buffered polygons)
  wall                    the outer boundary wall (السور الخارجي)
  light                   illustrative street-light positions every 32 m along kerbs (not in the source drawings)
  car                     illustrative parked cars in ~60% of the GIS parking bays (not in the source data)
plus `trees`: [x, y, 'shade'|'palm'] in the plan's EPSG:22992 frame, relative to plan.json sourceBounds[0:2].
"""
import json, math, re, sys, zipfile
from pathlib import Path
from shapely.geometry import LineString, Point, Polygon
from shapely.ops import linemerge, snap, substring, unary_union

GIS = Path(sys.argv[1]); LANDSCAPE = sys.argv[2] if len(sys.argv) > 2 else None
LAT0, LNG0 = 30.095, 30.862; KX = 111320 * math.cos(math.radians(LAT0)); KY = 110574
to_m = lambda lng, lat: ((lng - LNG0) * KX, (lat - LAT0) * KY)
to_ll = lambda x, y: [round(x / KX + LNG0, 7), round(y / KY + LAT0, 7)]

def kmz(name):
 """Placemarks as (attributes, [shapely geometries]) from an ArcGIS-exported KMZ (attributes live in the HTML popup table)."""
 kml = zipfile.ZipFile(GIS / name).read('doc.kml').decode('utf-8'); out = []
 ring = lambda text: [to_m(*map(float, c.split(',')[:2])) for c in re.search(r'<coordinates>(.*?)</coordinates>', text, re.S).group(1).split()]
 for placemark in re.findall(r'<Placemark.*?</Placemark>', kml, re.S):
  fields = {key.split('<td>')[-1].strip(): value for key, value in re.findall(r'<td>(.*?)</td>\s*<td>(.*?)</td>', placemark, re.S)}
  shapes = [LineString(ring(line)) for line in re.findall(r'<LineString>.*?</LineString>', placemark, re.S)]
  for polygon in re.findall(r'<Polygon>.*?</Polygon>', placemark, re.S):
   outer = re.search(r'<outerBoundaryIs>.*?</outerBoundaryIs>', polygon, re.S).group(0)
   shapes.append(Polygon(ring(outer), [ring(inner) for inner in re.findall(r'<innerBoundaryIs>.*?</innerBoundaryIs>', polygon, re.S)]).buffer(0))
  out.append((fields, shapes))
 return out

def parts(geometry):
 if geometry.is_empty: return []
 return list(geometry.geoms) if hasattr(geometry, 'geoms') else [geometry]

features = []
def emit(kind, geometry, min_area=0.02, **props):
 for part in parts(geometry):
  if part.geom_type == 'Polygon' and part.area >= min_area:
   part = part.simplify(0.03)
   features.append({'type': 'Feature', 'properties': {'kind': kind, **props}, 'geometry': {'type': 'Polygon', 'coordinates': [[to_ll(*p) for p in ring.coords] for ring in [part.exterior, *part.interiors]]}})
  elif part.geom_type == 'Point':
   features.append({'type': 'Feature', 'properties': {'kind': kind, **props}, 'geometry': {'type': 'Point', 'coordinates': to_ll(part.x, part.y)}})

def emit_many(kind, geometry, **props):
 """Small repeated shapes (dashes, bay lines, zebra stripes) go out as one Multi* feature: per-feature JSON overhead
 would otherwise outweigh their coordinates."""
 polygons = [part.simplify(0.03) for part in parts(geometry) if part.geom_type == 'Polygon' and part.area >= 0.01]
 lines = [part.simplify(0.03) for part in parts(geometry) if part.geom_type == 'LineString' and part.length >= 0.3]
 if polygons: features.append({'type': 'Feature', 'properties': {'kind': kind, **props}, 'geometry': {'type': 'MultiPolygon', 'coordinates': [[[to_ll(*p) for p in ring.coords] for ring in [part.exterior, *part.interiors]] for part in polygons]}})
 if lines: features.append({'type': 'Feature', 'properties': {'kind': kind, **props}, 'geometry': {'type': 'MultiLineString', 'coordinates': [[to_ll(*p) for p in part.coords] for part in lines]}})

# Road reserve from centre-lines and their reserve width (عرض_الطريق); one line has no width and is a standard 18 m street.
width_of = lambda value: float(value) if re.match(r'^[\d.]+$', value or '') else 18.0
centrelines = [(line, width_of(fields.get('عرض_الطريق'))) for fields, shapes in kmz('شبكه الطرق.kmz') for line in shapes]
network = unary_union([snap(line, unary_union([l for l, _ in centrelines]), 0.5) for line, _ in centrelines])
pieces = [(piece, min(centrelines, key=lambda item: item[0].distance(piece.interpolate(0.5, normalized=True)))[1]) for piece in parts(network)]
reserve = unary_union([line.buffer(width / 2, join_style='round') for line, width in pieces])

# Kerb rings come as pairs around each block (kerb edge and back of sidewalk) plus single rings for medians and islands.
# Even-odd fill of all rings gives the raised surfaces; everything kerbed is taken out of the road reserve.
rings = [Polygon(line.coords).buffer(0) for _, shapes in kmz('الرصيف.kmz') for line in shapes if len(line.coords) > 3 and line.is_ring]
rings = [ring for ring in rings if ring.area > 5]
raised = Polygon()
for ring in rings: raised = raised.symmetric_difference(ring)
kerbed = unary_union(rings)
carriageway = reserve.buffer(4, join_style='round').buffer(-4, join_style='round').difference(kerbed).buffer(0)
carriageway = unary_union([part for part in parts(carriageway) if part.area > 40])
raised = raised.intersection(reserve.buffer(6))  # only the street-facing strips; block interiors stay as imagery
# Parking courts: pockets closed on every side by kerbs, sidewalks and landscape that no centre-line reserve reaches, such
# as the plaza court by plots 125–127. The GIS draws parking bays in them, so they are paved as carriageway; plots and
# roundabout centres (no bays) stay as imagery.
landscape = kmz('عناصر تنسيق الموقع.kmz')
bay_areas = unary_union([shape for _, shapes in kmz('انتظار سيارات.kmz') for shape in shapes])
bay_strokes = unary_union([line for _, shapes in kmz('اماكن انتظار السيارات.kmz') for line in shapes])
enclosed = unary_union([carriageway, raised] + [shape for _, shapes in landscape for shape in shapes]).buffer(0.05)
courts = [Polygon(hole).buffer(0.06) for part in parts(enclosed) for hole in part.interiors]
courts = [court for court in courts if court.area < 5000 and (court.intersection(bay_areas).area > 10 or court.intersection(bay_strokes).length > 5)]
carriageway = unary_union([carriageway, *courts]).buffer(0)
print('Paved', len(courts), 'parking courts ·', round(sum(court.area for court in courts)), 'm²')
kerb = raised.intersection(carriageway.buffer(0.3)).buffer(0)
for part in parts(raised.difference(kerb)):
 # Medians and roundabout centres sit wholly inside the road reserve; the strips along blocks are sidewalks.
 emit('island' if part.area > 20 and part.intersection(reserve).area > 0.9 * part.area else 'sidewalk', part, 0.5)
emit('kerb', kerb, 0.05)

parking_bays = unary_union([shape for _, shapes in kmz('انتظار سيارات.kmz') for shape in shapes])
emit('carriageway', carriageway.difference(parking_bays), 1)
emit('parking', parking_bays.intersection(carriageway.buffer(0.2)), 1)
for fields, shapes in landscape:
 kind = 'path' if fields.get('عناصر_تنسيق_الموقع') == 'مسار_مشاه' else 'green'
 for shape in shapes: emit(kind, shape.difference(carriageway), 1)

# Road markings at real size: zebras as polygons, painted lines as centre-lines with their width.
markings = []; paint = []  # paint: (line geometry, width in metres)
inner = carriageway.buffer(-0.35)
paint.append((linemerge(parts(inner.boundary)), 0.12))  # edge lines

# Junctions: nodes where three or more centre-line pieces meet. Each arm gets a zebra and a stop line where the
# junction mouth narrows back to the street's own width; centre dashes stop short of the junction.
nodes = {}
for index, (piece, _) in enumerate(pieces):
 for end in (0, -1):
  key = tuple(round(v, 0) for v in piece.coords[end]); nodes.setdefault(key, []).append((index, end))
def cross_section(point, normal, reach):
 probe = LineString([(point.x - normal[0] * reach, point.y - normal[1] * reach), (point.x + normal[0] * reach, point.y + normal[1] * reach)])
 hit = probe.intersection(carriageway); return next((p.length for p in parts(hit) if p.distance(point) < 0.01), 0)
junction_zones = []
for key, arms in nodes.items():
 if len(arms) < 3: continue
 node = Point(key); widest = max(pieces[i][1] for i, _ in arms); junction_zones.append(node.buffer(widest / 2 + 2))
 for index, end in arms:
  piece, width = pieces[index]; line = piece if end == 0 else LineString(piece.coords[::-1])
  if line.length < 30: continue
  sample = lambda s: (line.interpolate(s), line.interpolate(s + 0.5))
  def frame(s):
   a, b = sample(s); dx, dy = b.x - a.x, b.y - a.y; n = math.hypot(dx, dy) or 1; return a, (dx / n, dy / n), (-dy / n, dx / n)
  _, _, normal = frame(line.length / 2); nominal = cross_section(frame(line.length / 2)[0], normal, width)
  if nominal < 5: continue
  mouth = next((s for s in [x * 0.5 for x in range(int(width), 60)] if abs(cross_section(frame(s)[0], frame(s)[2], width * 1.5) - nominal) < 0.6), None)
  if mouth is None or mouth > 25: continue
  centre, u, n = frame(mouth + 1)
  half = nominal / 2 + 0.5
  stripes = [Polygon([(centre.x + n[0] * o + u[0] * a, centre.y + n[1] * o + u[1] * a) for o, a in [(o0, 0), (o0 + 0.5, 0), (o0 + 0.5, 3), (o0, 3)]]) for o0 in [-half + k * 1.0 for k in range(int(2 * half))]]
  markings.append(unary_union(stripes))
  stop, _, _ = frame(mouth + 5)
  paint.append((LineString([(stop.x, stop.y), (stop.x + n[0] * half * -1, stop.y + n[1] * half * -1)]), 0.4))  # inbound half: right of travel towards the node
junctions = unary_union(junction_zones)
dash_area = inner.buffer(-0.6).difference(junctions.buffer(8)).difference(parking_bays.buffer(0.5))
for piece, width in pieces:
 if width < 13: continue
 for run in parts(piece.intersection(dash_area)):
  if run.geom_type != 'LineString': continue
  paint += [(substring(run, s, s + 3), 0.12) for s in [2 + k * 9 for k in range(int((run.length - 4) / 9) + 1)]]
bay_lines = [line for _, shapes in kmz('اماكن انتظار السيارات.kmz') for line in shapes]
paint.append((linemerge(parts(unary_union(bay_lines))), 0.12))
emit_many('marking', unary_union(markings).intersection(carriageway.buffer(0.05)))
road_surface = carriageway.buffer(0.05)
for width in sorted({width for _, width in paint}):
 pieces_on_road = [piece for line, w in paint if w == width for piece in parts(line.intersection(road_surface)) if piece.geom_type == 'LineString']
 emit_many('line', linemerge(pieces_on_road), width=width)

# Illustrative parked cars: the bay cells merge into 2.5 m parallel lanes and 5 m perpendicular rows; ~60% of slots are filled.
random = __import__('random').Random(7); cars = 0
rows = unary_union([Polygon(line.coords) for line in bay_lines if line.is_ring and len(line.coords) > 3]).buffer(0.02)
def footprint(cx, cy, heading, length=4.4, width=1.85):
 hx, hy = heading; return Polygon([(cx + hx * a - hy * b, cy + hy * a + hx * b) for a, b in [(-length / 2, -width / 2), (length / 2, -width / 2), (length / 2, width / 2), (-length / 2, width / 2)]])
for row in parts(rows):
 corners = list(row.minimum_rotated_rectangle.exterior.coords)
 sides = sorted([(math.dist(corners[i], corners[i + 1]), i) for i in (0, 1)], reverse=True)
 (span, i), (depth, _) = sides; ax = ((corners[i + 1][0] - corners[i][0]) / span, (corners[i + 1][1] - corners[i][1]) / span)
 perpendicular = abs(depth - 5) < 0.6
 if not perpendicular and abs(depth - 2.5) > 0.5: continue
 centre = row.minimum_rotated_rectangle.centroid; pitch = 2.5 if perpendicular else 6.2
 for k in range(int(span / pitch)):
  along = -span / 2 + pitch * (k + 0.5); cx, cy = centre.x + ax[0] * along, centre.y + ax[1] * along
  heading = (-ax[1], ax[0]) if perpendicular else ax
  if random.random() < 0.5: heading = (-heading[0], -heading[1])
  # Slots that fall outside a curved row are skipped.
  if not row.buffer(0.2).contains(footprint(cx, cy, heading)) or random.random() > 0.6: continue
  emit('car', Point(cx, cy), bearing=round(math.degrees(math.atan2(heading[0], heading[1])), 1), tone=random.randrange(8)); cars += 1

# Outer boundary wall: a 0.3 m band on the site edge.
for _, shapes in kmz('السور الخارجي.kmz'):
 for shape in shapes: emit('wall', shape.exterior.buffer(0.15, cap_style='flat', join_style='mitre'), 0.1)

# Illustrative street lights: one every 32 m, 0.6 m behind the kerb, facing the road.
kerb_lines = linemerge([line for line in parts(carriageway.boundary.intersection(raised.buffer(0.1))) if line.geom_type == 'LineString'])
lights = 0
for line in parts(kerb_lines):
 for s in [16 + k * 32 for k in range(int((line.length - 8) / 32))]:
  at = line.interpolate(s); road = carriageway.boundary.interpolate(carriageway.boundary.project(at))
  ahead = line.interpolate(min(s + 1, line.length)); dx, dy = ahead.x - at.x, ahead.y - at.y; n = math.hypot(dx, dy) or 1
  normal = (-dy / n, dx / n)
  if carriageway.contains(Point(at.x + normal[0], at.y + normal[1])): normal = (-normal[0], -normal[1])
  spot = Point(at.x + normal[0] * 0.6, at.y + normal[1] * 0.6)
  if not raised.contains(spot): continue
  emit('light', spot, bearing=round(math.degrees(math.atan2(-normal[0], -normal[1])), 1)); lights += 1

trees = []
if LANDSCAPE:
 text = open(LANDSCAPE, encoding='utf-8', errors='replace').read()
 # LibreDWG writes nan/inf and occasionally drops a comma after very long numbers.
 text = re.sub(r'(?<=[\s\[,:])-?(nan|inf)\b', 'null', text); text = re.sub(r'([0-9el])\n(\s+)(?=[-0-9n"\[{])', r'\1,\n\2', text)
 objects = json.loads(text, strict=False)['OBJECTS']; del text
 byid = {o['handle'][-1]: o for o in objects}; layers = {o['handle'][-1]: o['name'] for o in objects if o.get('object') == 'LAYER'}
 origin = json.load(open('public/data/plan.json'))['sourceBounds']
 for o in objects:
  if o.get('entity') != 'INSERT' or layers.get((o.get('layer') or [0])[-1]) != 'LP-TREE conceptt': continue
  x, y = o['ins_pt'][:2]
  if not (origin[0] <= x <= origin[2] and origin[1] <= y <= origin[3]): continue
  name = byid.get(o['block_header'][-1], {}).get('name', '')
  trees.append([round(x - origin[0], 2), round(y - origin[1], 2), 'palm' if 'PALM' in name else 'shade'])

Path('public/data/streets.json').write_text(json.dumps({'type': 'FeatureCollection', 'features': features, 'trees': trees, 'source': 'NUCA GIS (KMZ, WGS 84) · RAN-LS_latest.dwg trees'}, ensure_ascii=False, separators=(',', ':')))
counts = {}
for f in features: counts[f['properties']['kind']] = counts.get(f['properties']['kind'], 0) + 1
print('Wrote', len(features), 'features', counts, '·', len(trees), 'trees ·', lights, 'lights ·', cars, 'cars · carriageway', round(carriageway.area), 'm²')
