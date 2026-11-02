"""Build the 3D villa massing (public/data/villas.json) from the building envelopes in public/data/plan.json.
Usage: python3 scripts/build-villas.py   (run after convert-plan.py; requires shapely)
Each plot's envelope (#Setbacks-new) is split into its homes with a Voronoi diagram of the villa-number labels, so
party walls fall between the numbers the drawing places in each home. Every home becomes a ground floor and a
first floor set back from the outer envelope edges, with window bands, a terrace parapet, a roof parapet and a
roof finish tinted by home type. Plots with homes but no envelope in the drawing (17 of 44) get one derived
from a uniform setback that matches the median coverage of their home type; they are flagged `derived`.
Plots with neither homes nor an envelope stay empty. Storey heights and the facade design are illustrative.
Each plot also gets illustrative garden works: a 1.5 m boundary wall with a gate per home on the side facing the
nearest road (CAD carriageway edges and axes), a paved drive from each gate, and for twin and detached villas a roof
room, a pool where one fits in the garden and a garden tree. The main gate gets a three-pylon canopy across the
boulevard where its two carriageway axes cross the site boundary. The plaza roundabout by plots 125–127 gets a
two-tier fountain inside its paved ring; its jets (plot 'fountain-jet') and basin water (color FIXED['pool']) are drawn
by a separate animated, night-lit layer.
Writes, in plan.json's frame (metres relative to sourceBounds[0:2]):
  colors     palette indexed by parts
  parts      [plot, base, top, color, rings] one extruded solid each
  buildings  [plot, derived, envelope ring, upper-floor rings] for cast shadows and selection
  trees      [x, y, 'shade'|'palm'] garden trees, drawn like the landscape-plan trees
"""
import json, math, statistics
from pathlib import Path
from shapely import affinity
from shapely.geometry import LineString, MultiPoint, Point, Polygon, box
from shapely.ops import nearest_points, unary_union, voronoi_diagram

plan = json.load(open('public/data/plan.json'))
plots = [a for a in plan['areas'] if a['kind'] == 'plot']
envelopes = [Polygon(a['rings'][0], a['rings'][1:]).buffer(0) for a in plan['areas'] if a['kind'] == 'envelope']
units = [(Point(l['at']), l['text']) for l in plan['labels'] if l['kind'] == 'unit']

# Storey levels in metres: plinth, sill, head and slab of each floor, then the parapets.
GROUND = {'plinth': 0.45, 'sill': 1.0, 'head': 2.9, 'slab': 3.6}
UPPER = {'sill': 4.2, 'head': 6.0, 'slab': 6.9}
PARAPET, TERRACE_RAIL, SETBACK, REVEAL = 7.5, 4.5, 1.4, 0.12
ROOF = {'Twin villa': '#d9c4a0', 'Townhouse cluster': '#c9a47e', 'Townhouse row': '#b98d6c', 'Plot': '#b7c0ca'}
WALL = {'Twin villa': ['#efe9df', '#ebe4d8', '#f2ede4'], 'Townhouse cluster': ['#e8ddcb', '#e4d8c4', '#ece2d2'], 'Townhouse row': ['#e5d6c0', '#e0d0b8', '#e9dbc7'], 'Plot': ['#ece8e1', '#e7e2da', '#f0ece6']}
FIXED = {'plinth': '#9f9383', 'glass': '#2a3742', 'rail': '#f6f3ec', 'deck': '#9b7a58', 'fin': '#f8f5ef', 'boundary': '#e4dccd', 'coping': '#f1ece2',
 'water': '#3fb0d4', 'paving': '#cdc3b1', 'pool': '#46b9da', 'jet': '#dff5fc', 'stone': '#e6ddcb', 'paver': '#c6bfb1', 'pylon': '#d8ccb3', 'canopy': '#ece6da', 'fascia': '#5b4a36'}
WALL_HEIGHT, ROOF_ROOM = 1.5, 9.3
colors = []
def color(value):
 if value not in colors: colors.append(value)
 return colors.index(value)

rel = lambda xy: [round(xy[0], 2), round(xy[1], 2)]
def rings(geometry):
 polys = [geometry] if geometry.geom_type == 'Polygon' else list(getattr(geometry, 'geoms', []))
 return [[[rel(c) for c in p.exterior.coords]] + [[rel(c) for c in hole.coords] for hole in p.interiors] for p in polys if p.geom_type == 'Polygon' and p.area > 0.05]

# Plots that lack an envelope take a setback giving the median envelope/plot ratio of their type (bisection on the inset).
def envelope_of(plot):
 shape = Polygon(plot['rings'][0]); hits = [e for e in envelopes if shape.buffer(0.5).contains(e.representative_point())]
 return (unary_union(hits), False) if hits else (None, True)
ratios = {}
for plot in plots:
 found, _ = envelope_of(plot)
 if found is not None and plot['homes']: ratios.setdefault(plot['typology'], []).append(found.area / plot['area'])
def derived_envelope(plot):
 shape = Polygon(plot['rings'][0]); target = statistics.median(ratios[plot['typology']]) * shape.area; low, high = 0.0, 15.0
 for _ in range(30):
  mid = (low + high) / 2
  if shape.buffer(-mid, join_style='mitre').area > target: low = mid
  else: high = mid
 return shape.buffer(-low, join_style='mitre')

# Street side of each plot: the CAD carriageway edges and road axes. Other plots mark the shared (side and back) boundaries.
roads = unary_union([LineString(f['coordinates']) for f in plan['features'] if f['layer'] in ('CR-EOP', '00-Road Axis', '00-Roads') and len(f['coordinates']) > 1])
lots = {plot['plot']: Polygon(plot['rings'][0]) for plot in plots}
def frontage(number):
 lot = lots[number]; others = unary_union([shape for key, shape in lots.items() if key != number]).buffer(0.8)
 exposed = lot.exterior.difference(others)
 facing = exposed.intersection(roads.buffer(16))
 return facing if facing.length > 4 else (exposed if exposed.length > 4 else lot.exterior)

def inset_to(shape, share):
 """Shape shrunk evenly until it keeps `share` of its area."""
 low, high = 0.0, 10.0
 for _ in range(25):
  mid = (low + high) / 2
  if shape.buffer(-mid, join_style='mitre').area > share * shape.area: low = mid
  else: high = mid
 return shape.buffer(-low, join_style='mitre')

def fit(region, length, width, angles, prefer):
 """A length×width rectangle inside `region`, tried on a 1 m grid at each angle; the candidate farthest from `prefer` wins."""
 if region.is_empty or region.area < length * width: return None
 x0, y0, x1, y1 = region.bounds; best = None
 for angle in angles:
  template = affinity.rotate(box(-length / 2, -width / 2, length / 2, width / 2), angle, origin=(0, 0))
  for gx in range(int(x0), int(x1) + 1):
   for gy in range(int(y0), int(y1) + 1):
    candidate = affinity.translate(template, gx, gy)
    if region.contains(candidate):
     score = candidate.centroid.distance(prefer)
     if best is None or score > best[0]: best = (score, candidate)
 return best and best[1]

def axis_angle(shape):
 corners = list(shape.minimum_rotated_rectangle.exterior.coords)
 edges = [(Point(corners[i]).distance(Point(corners[i + 1])), corners[i], corners[i + 1]) for i in (0, 1)]
 _, a, b = max(edges); return math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))

parts, buildings, trees = [], [], []
def solid(plot, base, top, value, geometry):
 for polygon in rings(geometry): parts.append([plot, base, top, color(value), polygon])

for plot in plots:
 envelope, derived = envelope_of(plot)
 if envelope is None:
  if not plot['homes']: continue
  envelope = derived_envelope(plot)
 number, typology = plot['plot'], plot['typology']; shape = Polygon(plot['rings'][0]).buffer(1)
 seeds = [point for point, _ in units if shape.contains(point)]
 # Voronoi cells of the villa numbers give the homes; a plot without numbers is one detached villa.
 cells = [cell.intersection(envelope) for cell in voronoi_diagram(MultiPoint(seeds), envelope=envelope.buffer(50)).geoms] if len(seeds) > 1 else [envelope]
 cells = [cell for cell in cells if cell.area > 20]
 upper_all = envelope.buffer(-SETBACK, join_style='mitre')
 for index, home in enumerate(cells):
  wall = WALL[typology][(int(number) + index) % 3] if number.isdigit() else WALL[typology][0]
  upper = home.intersection(upper_all)
  solid(number, 0, GROUND['plinth'], FIXED['plinth'], home)
  solid(number, GROUND['plinth'], GROUND['sill'], wall, home)
  solid(number, GROUND['sill'], GROUND['head'], FIXED['glass'], home.buffer(-REVEAL, join_style='mitre'))
  solid(number, GROUND['head'], GROUND['slab'], wall, home)
  solid(number, GROUND['slab'], GROUND['slab'] + 0.05, FIXED['deck'], home.buffer(-0.18, join_style='mitre'))
  solid(number, GROUND['slab'], TERRACE_RAIL, FIXED['rail'], home.difference(home.buffer(-0.18, join_style='mitre')).difference(upper.buffer(0.01)))
  if upper.area > 8:
   solid(number, GROUND['slab'], UPPER['sill'], wall, upper)
   solid(number, UPPER['sill'], UPPER['head'], FIXED['glass'], upper.buffer(-REVEAL, join_style='mitre'))
   solid(number, UPPER['head'], UPPER['slab'], wall, upper)
   solid(number, UPPER['slab'], UPPER['slab'] + 0.05, ROOF[typology], upper.buffer(-0.2, join_style='mitre'))
   solid(number, UPPER['slab'], PARAPET, wall, upper.difference(upper.buffer(-0.2, join_style='mitre')))
   if typology in ('Twin villa', 'Plot') and upper.area > 40:
    room = inset_to(upper, 0.18)  # roof room over the stair, its terrace around it
    solid(number, UPPER['slab'], ROOF_ROOM, wall, room)
    solid(number, ROOF_ROOM, ROOF_ROOM + 0.15, FIXED['rail'], room.buffer(0.15, join_style='mitre'))
 # Party walls: a slim fin standing proud of the facade between attached homes.
 for a in range(len(cells)):
  for b in range(a + 1, len(cells)):
   shared = cells[a].buffer(0.05).intersection(cells[b].buffer(0.05))
   if shared.area > 0.05: solid(number, 0, PARAPET + 0.15, FIXED['fin'], shared.buffer(0.12, cap_style='flat', join_style='mitre').intersection(envelope.buffer(0.25, join_style='mitre')))
 # Garden works: each home's gate is the street-facing boundary point nearest to it, with a drive up to the house.
 lot = lots[number]; street = frontage(number); inner = lot.buffer(-0.2, join_style='mitre')
 gates = [nearest_points(street, home.centroid)[0] for home in cells]
 drives = []
 for gate, home in zip(gates, cells):
  door = nearest_points(home, gate)[0]
  if gate.distance(door) > 0.5: drives.append(LineString([gate, door]).buffer(1.5, cap_style='flat').intersection(inner).difference(home))
 drive_area = unary_union(drives) if drives else Polygon()
 solid(number, 0, 0.06, FIXED['paving'], drive_area)
 solid(number, 0, WALL_HEIGHT, FIXED['boundary'], lot.difference(inner).difference(unary_union([gate.buffer(1.9) for gate in gates])))
 # Each home's garden is the part of the lot nearer to it than to its neighbours, clear of the house, drives and wall.
 regions = list(voronoi_diagram(MultiPoint([home.centroid for home in cells]), envelope=lot.buffer(50)).geoms) if len(cells) > 1 else [lot.buffer(50)]
 for index, home in enumerate(cells):
  region = next((r for r in regions if r.contains(home.centroid)), lot)
  garden = region.intersection(lot.buffer(-1.0, join_style='mitre')).difference(envelope.buffer(1.5, join_style='mitre')).difference(drive_area.buffer(0.6))
  if garden.is_empty: continue
  gate = gates[index]; taken = Polygon()
  if typology in ('Twin villa', 'Plot'):
   angle = axis_angle(lot); pool = fit(garden, 8, 3.5, [angle, angle + 90], gate) or fit(garden, 6, 3, [angle, angle + 90], gate)
   if pool is not None:
    solid(number, 0, 0.12, FIXED['coping'], pool.buffer(0.45, join_style='mitre').difference(pool))
    solid(number, 0, 0.05, FIXED['water'], pool); taken = pool.buffer(2.5)
  spot = garden.difference(taken).buffer(-1.2)
  if spot.area > 1:
   x0, y0, x1, y1 = spot.bounds
   grid = [Point(x, y) for x in [x0 + (x1 - x0) * i / 8 for i in range(9)] for y in [y0 + (y1 - y0) * j / 8 for j in range(9)]]
   inside = [point for point in grid if spot.contains(point)]
   if inside:
    best = max(inside, key=lambda point: point.distance(envelope))
    trees.append([round(best.x, 2), round(best.y, 2), 'palm' if typology == 'Twin villa' and index % 2 else 'shade'])
 buildings.append([number, derived, rings(envelope)[0][0], [ring[0] for ring in rings(upper_all)]])

# Main gate: where the boulevard's two carriageway axes meet the site boundary, a canopy on three pylons spans both lanes.
gate_label = next((Point(l['at']) for l in plan['labels'] if l['text'] == 'Main gate'), None)
site = next(Polygon(a['rings'][0]) for a in plan['areas'] if a['kind'] == 'site')
if gate_label is not None:
 # The drawing repeats some axis lines, so they are de-duplicated before taking the two nearest (entry and exit lanes).
 unique = {tuple(map(tuple, f['coordinates'])): LineString(f['coordinates']) for f in plan['features'] if f['layer'] == '00-Road Axis' and len(f['coordinates']) == 2}
 axes = sorted(unique.values(), key=lambda line: line.distance(gate_label))[:2]
 (a0, a1), (b0, b1) = [sorted(line.coords, key=lambda c: c[1]) for line in axes]
 start = ((a0[0] + b0[0]) / 2, (a0[1] + b0[1]) / 2); end = ((a1[0] + b1[0]) / 2, (a1[1] + b1[1]) / 2)
 length = math.dist(start, end); u = ((end[0] - start[0]) / length, (end[1] - start[1]) / length); n = (u[1], -u[0])
 probe = LineString([(start[0] - u[0] * 60, start[1] - u[1] * 60), end]).intersection(site.exterior)
 cross = min(getattr(probe, 'geoms', [probe]), key=lambda p: p.distance(Point(start)))
 centre = (cross.x + u[0] * 5, cross.y + u[1] * 5); half = math.dist(a0, b0) / 2 + 8.5
 def block(across, along, w, d):
  cx, cy = centre[0] + n[0] * across + u[0] * along, centre[1] + n[1] * across + u[1] * along
  return Polygon([(cx + n[0] * sx * w / 2 + u[0] * sy * d / 2, cy + n[1] * sx * w / 2 + u[1] * sy * d / 2) for sx, sy in [(-1, -1), (1, -1), (1, 1), (-1, 1)]])
 for across, top in [(-half, 7.2), (0, 8.2), (half, 7.2)]: solid('gate', 0, top, FIXED['pylon'], block(across, 0, 2.4, 3.2))
 solid('gate', 5.8, 6.1, FIXED['fascia'], block(0, 0, 2 * half + 3, 4.2))
 solid('gate', 6.1, 7.0, FIXED['canopy'], block(0, 0, 2 * half + 3, 4.4))
 solid('gate', 0, 3.1, FIXED['glass'], block(0, 6, 2.2, 4))  # guard booth on the median, inside the gate
 solid('gate', 3.1, 3.4, FIXED['canopy'], block(0, 6, 3, 5))

# Plaza fountain: the small circle on the road layer nearest plots 125–127 is the roundabout's centre (r ≈ 3.9 m); the
# GIS paved ring around it starts 5.4 m out, so the fountain stays within 5.2 m.
plaza = unary_union([lots[n] for n in ('125', '126', '127') if n in lots]).centroid
circles = []
for f in plan['features']:
 if f['layer'] != '00-Roads' or len(f['coordinates']) < 8: continue
 ring = Polygon(f['coordinates']); radius = math.sqrt(ring.area / math.pi) if ring.is_valid else 0
 if 3 < radius < 5 and 4 * math.pi * ring.area / ring.exterior.length ** 2 > 0.95: circles.append(ring.centroid)
landmarks = {}
if circles:
 c = min(circles, key=lambda point: point.distance(plaza)); landmarks['fountain'] = [round(c.x, 2), round(c.y, 2)]
 disc = lambda r: c.buffer(r, 48); ring = lambda outer, inner: disc(outer).difference(disc(inner))
 solid('fountain', 0, 0.16, FIXED['paver'], disc(5.4))                         # paving up to the GIS ring
 solid('fountain', 0.16, 0.7, FIXED['stone'], ring(5.0, 4.6))                  # basin wall
 solid('fountain', 0.7, 0.8, FIXED['coping'], ring(5.15, 4.5))                 # coping
 solid('fountain', 0.16, 0.55, FIXED['pool'], disc(4.6))                       # basin water
 solid('fountain', 0.16, 1.3, FIXED['stone'], disc(1.2))                       # pedestal
 solid('fountain', 1.3, 1.5, FIXED['coping'], ring(2.1, 1.7))                  # lower bowl rim
 solid('fountain', 1.3, 1.45, FIXED['pool'], disc(1.7))                        # lower bowl water
 solid('fountain', 1.45, 2.5, FIXED['stone'], disc(0.4))                       # stem
 solid('fountain', 2.5, 2.65, FIXED['coping'], ring(1.05, 0.8))                # upper bowl rim
 solid('fountain', 2.5, 2.6, FIXED['pool'], disc(0.8))                         # upper bowl water
 solid('fountain-jet', 2.6, 4.4, FIXED['jet'], disc(0.18))                     # central jet
 for k in range(8):                                                            # ring of arcing jets, drawn as columns
  a = 2 * math.pi * k / 8; solid('fountain-jet', 0.55, 1.6, FIXED['jet'], Point(c.x + 3.3 * math.cos(a), c.y + 3.3 * math.sin(a)).buffer(0.14, 12))

out = {'source': 'Envelopes from plan.json (#Setbacks-new); homes split at the villa numbers. Massing and storey heights are illustrative.', 'levels': {'ground': GROUND, 'upper': UPPER, 'parapet': PARAPET}, 'colors': colors, 'parts': parts, 'buildings': buildings, 'trees': trees, 'landmarks': landmarks}
Path('public/data/villas.json').write_text(json.dumps(out, separators=(',', ':')))
print('Wrote', len(buildings), 'buildings ·', sum(1 for b in buildings if b[1]), 'derived envelopes ·', len(parts), 'parts ·', len(trees), 'garden trees ·', sum(1 for part in parts if colors[part[3]] == FIXED['water']), 'pools')
