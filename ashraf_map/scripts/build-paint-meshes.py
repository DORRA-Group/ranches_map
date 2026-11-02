#!/usr/bin/env python3
"""Build georeferenced, metre-width paint meshes for Cesium.

Run from the project directory with Python + numpy + pyproj. The source GIS
GeoJSONs must be WGS84 and are NEVER modified. Each output is an array of
float32 (longitude-offset, latitude-offset) pairs for the four vertices of
world-anchored quads, in order: left start, right start, right end, left end.
The floating-point offsets maintain sub-centimetre detail without the large
files produced by storing full WGS84 longitudes as float64.
"""
from __future__ import annotations
import json
from pathlib import Path
import numpy as np
from pyproj import Transformer
from shapely.strtree import STRtree
from shapely.ops import unary_union, transform as geom_transform, linemerge
from shapely.geometry import LineString, Point, shape, MultiLineString

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'public' / 'data'
ORIGIN_LON = 30.8601
ORIGIN_LAT = 30.0950
TO_METERS = Transformer.from_crs('EPSG:4326', 'EPSG:22992', always_xy=True)
TO_WGS84 = Transformer.from_crs('EPSG:22992', 'EPSG:4326', always_xy=True)
# Metres and colours are configurable in src/App.tsx; change widths here,
# regenerate binaries, and keep their height offsets consistent there.
MESHES = {
    'road-dashes': {'source': 'road-centerlines.geojson', 'width': 0.15, 'sample': 1.5, 'tolerance': .02, 'dash': 3.0, 'cycle': 6.0, 'phase': 0.0},
    'curb-white': {'source': 'parking-aware-curb', 'width': 0.55, 'inset_m': .235, 'away_from': 'road', 'sample': 1.5, 'tolerance': .025, 'dash': 1.5, 'cycle': 3.0, 'phase': 0.0},
    'curb-black': {'source': 'parking-aware-curb', 'width': 0.55, 'inset_m': .235, 'away_from': 'road', 'sample': 1.5, 'tolerance': .025, 'dash': 1.5, 'cycle': 3.0, 'phase': 1.5},
    # Inner pavement/parking boundary: no striped curb. Keep empty .bin files
    # so older App.tsx versions can still fetch them without changes.
    'parking-curb-white': {'disabled': True, 'source': '__inner_pavement_no_stripes__', 'width': 0.55, 'inset_m': .235, 'away_from': 'parking', 'sample': 1.5, 'tolerance': .025, 'dash': 1.5, 'cycle': 3.0, 'phase': 0.0},
    'parking-curb-black': {'disabled': True, 'source': '__inner_pavement_no_stripes__', 'width': 0.55, 'inset_m': .235, 'away_from': 'parking', 'sample': 1.5, 'tolerance': .025, 'dash': 1.5, 'cycle': 3.0, 'phase': 1.5},
    'parking-edges': {'source': 'parking-road-edges.geojson', 'width': 0.12, 'sample': 2.0, 'tolerance': .04},
    'parking-bays': {'source': 'parkings_line.geojson', 'width': 0.10, 'sample': 3.0, 'tolerance': .05},
    'pavement-outlines': {'source': 'Pavement_Cesium.geojson', 'width': 0.10, 'sample': 3.0, 'tolerance': .06},
}


# A car park interrupts an ordinary pavement frontage. We must NOT put a
# raised striped curb on the edge where a car drives onto the parking bay.
# The single striped edge is transferred to the BACK of that parking bay
# (the long edge facing away from its nearest road centerline).
PARKING_FRONTAGE_CLEARANCE_M = 4.0
PARKING_REAR_MIN_SCORE_M = 0.35

# Local correction for the small roundabout near the project's middle bays.
# The broad 4m parking clearance erases parts of its curved pavement edge.
# Use narrower clipping ONLY inside this junction, preserving the shipped
# curb geometry and paint pattern byte-for-byte outside the junction.
ROUNDABOUT_CENTER_RED_BELT = (601658.5, 820567.5)
ROUNDABOUT_CORRECTION_RADIUS_M = 95.0
ROUNDABOUT_PARKING_CLEARANCE_M = 1.25

# Fill short gaps when the curb transfers from ordinary pavement frontage
# onto the BACK of a parking bay. Do not draw on the car-entry (front) side.
CURB_RETURN_MAX_GAP_M = 7.5
CURB_RETURN_PARKING_INTERIOR_TOLERANCE_M = 0.20
# Angles at both corners must be close to 90 degrees, not a diagonal shortcut.
# 0.20 corresponds to approximately 78-102 degrees at each corner.
CURB_RETURN_MAX_COSINE = 0.20
CURB_RETURN_SNAP_TOLERANCE_M = 0.20
CURB_RETURN_ROAD_ALIGNMENT_COSINE = 0.75

_CURB_INPUT_CACHE = {}

def orthogonal_parking_return(poly, rear_coords, back_at_start, road_point, road_outward):
    """Find a square curb return following a *real side* of the parking polygon.

    Route: existing road-side pavement curb -> front parking corner ->
    physical parking side boundary -> rear parking curb. The corner points
    come from the parking polygon, not from an arbitrary diagonal bridge.

    Ambiguous/slanted/nonrectangular locations are intentionally left open.
    """
    back_xy = np.asarray(rear_coords[0 if back_at_start else -1], dtype=np.float64)
    rear_other = np.asarray(rear_coords[1 if back_at_start else -2], dtype=np.float64)
    rear_axis = rear_other - back_xy
    rear_length = np.linalg.norm(rear_axis)
    if rear_length < 1e-5:
        return None
    rear_axis /= rear_length

    # Same low-tolerance ring used when detecting this polygon's rear sides.
    ring = np.asarray(poly.simplify(0.07, preserve_topology=True).exterior.coords[:-1])
    if len(ring) < 3:
        return None
    distances = np.linalg.norm(ring - back_xy, axis=1)
    idx = int(np.argmin(distances))
    if distances[idx] > CURB_RETURN_SNAP_TOLERANCE_M:
        return None

    road_xy = np.asarray(road_point.coords[0], dtype=np.float64)
    best = None
    for front_xy in (ring[(idx - 1) % len(ring)], ring[(idx + 1) % len(ring)]):
        side = front_xy - back_xy
        side_length = np.linalg.norm(side)
        if side_length < .50 or side_length > CURB_RETURN_MAX_GAP_M:
            continue
        side_unit = side / side_length
        # At the back we must turn 90 degrees onto the actual parking side.
        back_corner_cosine = abs(float(np.dot(side_unit, rear_axis)))
        if back_corner_cosine > CURB_RETURN_MAX_COSINE:
            continue
        if np.dot(side_unit, road_xy - back_xy) <= 0:
            continue

        approach = front_xy - road_xy
        approach_length = np.linalg.norm(approach)
        if approach_length < .30 or approach_length > CURB_RETURN_MAX_GAP_M:
            continue
        approach_unit = approach / approach_length
        # At the front, road approach must meet the side at a right angle.
        front_corner_cosine = abs(float(np.dot(side_unit, approach_unit)))
        if front_corner_cosine > CURB_RETURN_MAX_COSINE:
            continue
        # This must continue away from the end of the pavement curb, rather
        # than fold backwards or run across the parking entrance.
        if float(np.dot(approach_unit, road_outward)) < CURB_RETURN_ROAD_ALIGNMENT_COSINE:
            continue

        front_link = LineString((tuple(road_xy), tuple(front_xy)))
        side_link = LineString((tuple(front_xy), tuple(back_xy)))
        # Avoid shortcuts through the interior of the parking polygon.
        if front_link.intersection(poly.buffer(-0.10)).length > .05:
            continue
        # Do not build the "approach" curb ALONG a parking frontage:
        # this would block access for cars on the road-facing long edge.
        if front_link.intersection(poly.boundary).length > 0.20:
            continue
        if side_link.intersection(poly.buffer(-0.10)).length > .05:
            continue

        score = (front_corner_cosine + back_corner_cosine,
                 approach_length + side_length)
        if best is None or score < best[0]:
            best = (score, [road_xy.tolist(), front_xy.tolist(), back_xy.tolist()])
    return None if best is None else best[1]


def parking_aware_curb_lines(roundabout_fix=False):
    """Return (WGS84 coordinates, adjoining-area name) without double curbs.

    This leaves road-facing pavement curbs unchanged EXCEPT at parking bays.
    Near a parking bay, the old curb is removed and the back garage boundary
    is used instead. All calculations are in the source project's metres.
    """
    global _CURB_INPUT_CACHE
    if roundabout_fix in _CURB_INPUT_CACHE:
        return _CURB_INPUT_CACHE[roundabout_fix]

    def layer_geom(filename):
        with (DATA / filename).open('r', encoding='utf8') as handle:
            content = json.load(handle)
        return [geom_transform(TO_METERS.transform, shape(f['geometry']))
                for f in content['features'] if f.get('geometry')]

    parking_shapes = layer_geom('parking.geojson')
    parking_polys = []
    for g in parking_shapes:
        repaired = g if g.is_valid else g.buffer(0)
        if repaired.geom_type == 'Polygon':
            parking_polys.append(repaired)
        elif repaired.geom_type == 'MultiPolygon':
            parking_polys.extend(repaired.geoms)

    standard_exclusion = unary_union([p.buffer(PARKING_FRONTAGE_CLEARANCE_M)
                                      for p in parking_polys])
    pavement_edges = unary_union(layer_geom('pavement-road-edges.geojson'))
    if roundabout_fix:
        zone = Point(*ROUNDABOUT_CENTER_RED_BELT).buffer(
            ROUNDABOUT_CORRECTION_RADIUS_M
        )
        close_parking = [p for p in parking_polys if p.intersects(zone)]
        local_exclusion = unary_union([
            p.buffer(ROUNDABOUT_PARKING_CLEARANCE_M) for p in close_parking
        ])
        exclusion = standard_exclusion.difference(zone).union(
            local_exclusion.intersection(zone)
        )

        # Remove one short, parallel stray curb at the NE side of this circle.
        # This isolated 4.8m segment from the original GIS is offset ~2m from
        # the continuous outer curb and creates a floating striped fragment.
        # All other short lines (including traffic islands) are preserved.
        stray_start = Point(601669.7, 820582.4)
        kept = []
        removed = 0
        for coords in individual_lines(pavement_edges):
            seg = LineString(coords)
            if (4.5 < seg.length < 5.2 and
                seg.distance(stray_start) < 0.4):
                removed += 1
                continue
            kept.append(seg)
        if removed != 1:
            raise RuntimeError(
                f'Expected exactly one NE roundabout duplicate, found {removed}; '
                'GIS source may have changed. Review the geometry before exporting.'
            )
        pavement_edges = unary_union(kept)
    else:
        exclusion = standard_exclusion

    without_parking_frontage = pavement_edges.difference(exclusion)

    road_geoms = layer_geom('road-centerlines.geojson')
    road_lines = [line for geometry in road_geoms
                  for line in individual_lines(geometry)]
    road_index_shapes = [LineString(coords) for coords in road_lines]
    if not road_index_shapes:
        raise RuntimeError('Road centerlines are needed to find parking backs')
    tree = STRtree(road_index_shapes)

    rear_lines = []
    rear_pairs = []  # (parking polygon, line part) for short safe end returns
    total_front_edges = 0
    total_rear_edges = 0
    for poly in parking_polys:
        ring = poly.simplify(0.07, preserve_topology=True).exterior
        vertices = np.asarray(ring.coords)
        if len(vertices) < 4:
            continue
        # For a CCW exterior the polygon lies left of travel, so the
        # right-hand normal points out of the parking bay (and vice versa).
        outward_sign = -1.0 if ring.is_ccw else 1.0
        pieces = []
        for a, b in zip(vertices[:-1], vertices[1:]):
            seg = b - a
            length = np.linalg.norm(seg)
            if length < .35:
                continue
            mid = (a + b) / 2.0
            normal = outward_sign * np.array([-seg[1], seg[0]]) / length
            nearest = road_index_shapes[int(tree.nearest(Point(*mid)))]
            outside = Point(*(mid + .6 * normal)).distance(nearest)
            inside = Point(*(mid - .6 * normal)).distance(nearest)
            # Back edge: going OUT of the parking bay takes us farther
            # away from the road; front edge does the opposite.
            if outside - inside > PARKING_REAR_MIN_SCORE_M:
                pieces.append(LineString([a, b]))
                total_rear_edges += 1
            else:
                total_front_edges += 1
        if pieces:
            joined = unary_union(pieces)
            merged = linemerge(joined) if joined.geom_type != "LineString" else joined
            for rear_coords in individual_lines(merged):
                rear_lines.append(rear_coords)
                rear_pairs.append((poly, rear_coords))

    # Connect in a true road -> parking SIDE -> parking BACK right-angle path.
    # Never join the endpoints directly: that creates diagonal striped curbs.
    road_parts = [line for line in individual_lines(without_parking_frontage)]
    road_end_points = [Point(line[side]) for line in road_parts for side in (0, -1)]
    road_endpoint_tree = STRtree(road_end_points)
    parking_safe_interiors = [poly.buffer(-0.10) for poly in parking_polys]
    parking_safe_tree = STRtree(parking_safe_interiors)
    used_road_endpoints = set()
    connectors = []
    declined = 0

    for poly, rear_coords in rear_pairs:
        for back_at_start in (True, False):
            back_coords = rear_coords[0 if back_at_start else -1]
            back_point = Point(back_coords)
            candidates = road_endpoint_tree.query(back_point.buffer(CURB_RETURN_MAX_GAP_M))
            ranked = sorted(
                ((back_point.distance(road_end_points[int(i)]), int(i)) for i in candidates),
                key=lambda entry: entry[0],
            )
            chosen = None
            for gap, index in ranked:
                if gap < 0.12 or gap > CURB_RETURN_MAX_GAP_M or index in used_road_endpoints:
                    continue
                road_piece = road_parts[index // 2]
                if len(road_piece) < 2:
                    continue
                xy = np.asarray(road_piece, dtype=np.float64)
                road_outward = (xy[0] - xy[1]) if index % 2 == 0 else (xy[-1] - xy[-2])
                outward_length = np.linalg.norm(road_outward)
                if outward_length < 1.e-5:
                    continue
                road_outward /= outward_length
                square_path = orthogonal_parking_return(
                    poly, rear_coords, back_at_start, road_end_points[index], road_outward
                )
                if square_path is None:
                    continue
                candidate_line = LineString(square_path)
                # Protect all nearby parking bays, not just the current bay.
                if any(candidate_line.intersection(parking_safe_interiors[int(j)]).length
                       > CURB_RETURN_PARKING_INTERIOR_TOLERANCE_M
                       for j in parking_safe_tree.query(candidate_line)):
                    continue
                chosen = (index, square_path)
                break
            if chosen is None:
                declined += 1
                continue
            index, path = chosen
            used_road_endpoints.add(index)
            connectors.append(path)

    print(f'Square parking curb end returns: {len(connectors)} connected, '
          f'{declined} skipped where 90-degree geometry is uncertain')

    def as_wgs84(coords):
        xy = np.asarray(coords, dtype=np.float64)
        lon, lat = TO_WGS84.transform(xy[:, 0], xy[:, 1])
        return np.column_stack((lon, lat)).tolist()

    # 'road' means put width into the pavement away from the road.
    # 'parking' puts width behind the parking, leaving vehicle access open.
    output = [(as_wgs84(coords), 'road')
              for coords in individual_lines(without_parking_frontage)]
    output.extend((as_wgs84(coords), 'parking') for coords in rear_lines)
    output.extend((as_wgs84(coords), 'parking') for coords in connectors)
    _CURB_INPUT_CACHE[roundabout_fix] = output
    print('Parking-aware striped curbs:',
          f'{len(output)} line parts, {total_rear_edges} rear segments,',
          f'{total_front_edges} non-rear segments excluded')
    return output


# Shared geometry is cached once so each paint colour stays on exactly the
# same physical edge, and rerunning this script remains reproducible.
_REGION_CACHE = {}

def region(name):
    if name not in _REGION_CACHE:
        filename = 'road-surface.geojson' if name == 'road' else 'parking.geojson'
        with (DATA / filename).open('r', encoding='utf8') as f:
            content = json.load(f)
        parts = [geom_transform(TO_METERS.transform, shape(feature['geometry']))
                 for feature in content['features'] if feature.get('geometry')]
        # Road surface exports can contain self-touching rings. Repair only
        # the in-memory polygons used to decide which side faces pavement.
        _REGION_CACHE[name] = unary_union([g if g.is_valid else g.buffer(0) for g in parts])
    return _REGION_CACHE[name]

def individual_lines(geometry):
    if geometry.is_empty:
        return
    if geometry.geom_type == 'LineString':
        if geometry.length >= .5:
            yield list(geometry.coords)
    elif hasattr(geometry, 'geoms'):
        for part in geometry.geoms:
            yield from individual_lines(part)

def pavement_inset_sign(xy, nearby_area):
    # Choose the side AWAY from the adjacent road/parking area so the curb
    # occupies more of the pavement (about 51 cm inward) and only ~4 cm faces the road.
    # We only compute one consistent sign per short GIS line to avoid zigzags.
    mid_idx = max(0, (len(xy)-2)//2)
    origin = (xy[mid_idx] + xy[mid_idx+1]) / 2
    delta = xy[mid_idx+1] - xy[mid_idx]
    delta /= max(1e-8, np.linalg.norm(delta))
    n = np.array([-delta[1], delta[0]])
    left_point = Point(*(origin + n * .30))
    right_point = Point(*(origin - n * .30))
    left_inside = nearby_area.covers(left_point)
    right_inside = nearby_area.covers(right_point)
    if left_inside != right_inside:
        return -1.0 if left_inside else 1.0
    # For ambiguous boundaries, use whichever side is farther from the area.
    return 1.0 if left_point.distance(nearby_area) > right_point.distance(nearby_area) else -1.0


def lines_from_geom(g):
    if not g:
        return
    typ = g.get('type', '')
    if typ == 'LineString':
        yield g['coordinates']
    elif typ == 'MultiLineString':
        yield from g['coordinates']
    elif typ == 'GeometryCollection':
        for child in g.get('geometries', []):
            yield from lines_from_geom(child)


def measured_line(coords, tolerance):
    p = np.asarray(coords, dtype=np.float64)
    if p.ndim != 2 or p.shape[0] < 2:
        return None
    x, y = TO_METERS.transform(p[:, 0], p[:, 1])
    xy = np.column_stack((x, y))
    # Remove redundant GIS densification, preserving bends within the
    # stated few-centimetre visual tolerance. Source files stay intact.
    if len(xy) > 2:
        xy = np.asarray(LineString(xy).simplify(tolerance, preserve_topology=False).coords)
    steps = np.linalg.norm(np.diff(xy, axis=0), axis=1)
    keep = np.concatenate(([True], steps > .015))
    xy = xy[keep]
    if len(xy) < 2:
        return None
    steps = np.linalg.norm(np.diff(xy, axis=0), axis=1)
    s = np.concatenate(([0.0], np.cumsum(steps)))
    return xy, s


def painted_intervals(length, options):
    if 'dash' not in options:
        yield 0., length
        return
    span = options['dash']
    cycle = options['cycle']
    phase = options['phase']
    # phase 0 begins with paint; phase=span begins with a gap.
    start = -phase
    while start < length:
        a = max(0., start)
        b = min(length, start + span)
        if b - a > 0.03:
            yield a, b
        start += cycle


def quads_for_interval(xy, cumulative, start, end, options, shift_sign=0.0):
    # Include exact vertices on curves and a regular distance-based sample.
    inside = cumulative[(cumulative > start + .001) & (cumulative < end - .001)]
    regular = np.arange(start + options['sample'], end, options['sample'])
    distances = np.unique(np.concatenate(([start], inside, regular, [end])))
    xx = np.interp(distances, cumulative, xy[:, 0])
    yy = np.interp(distances, cumulative, xy[:, 1])
    sampled = np.column_stack((xx, yy))
    if len(sampled) < 2:
        return None

    vectors = np.diff(sampled, axis=0)
    lengths = np.linalg.norm(vectors, axis=1)
    valid = np.concatenate(([True], lengths > .005))
    sampled = sampled[valid]
    if len(sampled) < 2:
        return None

    vectors = np.diff(sampled, axis=0)
    vectors /= np.linalg.norm(vectors, axis=1)[:, None]
    normals = np.column_stack((-vectors[:, 1], vectors[:, 0]))
    join = np.empty_like(sampled)
    join[0] = normals[0]
    join[-1] = normals[-1]
    if len(sampled) > 2:
        mid = normals[:-1] + normals[1:]
        norms = np.linalg.norm(mid, axis=1)
        norms = np.maximum(norms, 1e-8)
        mid /= norms[:, None]
        denominator = np.abs(np.sum(mid * normals[:-1], axis=1))
        join[1:-1] = mid * np.minimum(2.0, 1.0 / np.maximum(denominator, 0.5))[:, None]
    offsets = join * (options['width'] / 2)
    center_offset = join * (shift_sign * options.get('inset_m', 0.0))
    left = sampled + center_offset + offsets
    right = sampled + center_offset - offsets

    # CCW winding: (left start, right start, right end, left end).
    arr = np.stack((left[:-1], right[:-1], right[1:], left[1:]), axis=1)
    return arr.reshape((-1, 2))


def build_mesh(key, options):
    if options.get('disabled'):
        (DATA / (key + '.bin')).write_bytes(b'')
        print(f'{key:20} disabled (inner pavement: no stripes)')
        return {'file': key + '.bin', 'quads': 0, 'width_m': options['width']}
    if options['source'] == 'parking-aware-curb':
        input_lines = parking_aware_curb_lines(roundabout_fix=False)
    else:
        path = DATA / options['source']
        with path.open('r', encoding='utf8') as f:
            source = json.load(f)
        input_lines = [(coords, options.get('away_from'))
                       for feature in source['features']
                       for coords in lines_from_geom(feature.get('geometry'))]
    def make_quads(lines):
        parts = []
        count = 0
        for coords, neighbor in lines:
            result = measured_line(coords, options['tolerance'])
            if result is None:
                continue
            xy, cumulative = result
            length = cumulative[-1]
            if length <= .05:
                continue
            count += 1
            adjacent = region(neighbor) if neighbor else None
            sign = pavement_inset_sign(xy, adjacent) if adjacent is not None else 0.0
            for start, end in painted_intervals(length, options):
                part = quads_for_interval(xy, cumulative, start, end, options, sign)
                if part is not None:
                    parts.append(part)
        if not parts:
            raise RuntimeError(f'No geometry produced for {key}')
        return np.concatenate(parts, axis=0).reshape((-1, 4, 2)), count

    base_quads, total_lines = make_quads(input_lines)
    if options['source'] == 'parking-aware-curb':
        # Swap geometry only inside the small roundabout zone. Outside it,
        # preserve the original quad bytes and paint/dash sequencing exactly.
        refined_quads, _ = make_quads(parking_aware_curb_lines(roundabout_fix=True))
        center = np.asarray(ROUNDABOUT_CENTER_RED_BELT)
        base_inside = np.linalg.norm(base_quads.mean(axis=1) - center, axis=1) < ROUNDABOUT_CORRECTION_RADIUS_M
        refined_inside = np.linalg.norm(refined_quads.mean(axis=1) - center, axis=1) < ROUNDABOUT_CORRECTION_RADIUS_M
        quads = np.concatenate((base_quads[~base_inside], refined_quads[refined_inside]), axis=0)
        print(f'{key}: local roundabout replacement: {np.sum(base_inside)} original -> '
              f'{np.sum(refined_inside)} corrected quads')
    else:
        quads = base_quads
    xy = quads.reshape((-1, 2))
    lon, lat = TO_WGS84.transform(xy[:, 0], xy[:, 1])
    deltas = np.column_stack((np.asarray(lon) - ORIGIN_LON, np.asarray(lat) - ORIGIN_LAT))
    offset_coords = deltas.astype('<f4')
    path = DATA / (key + '.bin')
    offset_coords.tofile(path)
    quad_count = len(offset_coords) // 4
    print(f'{key:20} {total_lines:5} lines, {quad_count:7} quads, {path.stat().st_size / 1024 / 1024:.2f} MiB')
    return {'file': key + '.bin', 'quads': quad_count, 'width_m': options['width']}


def main():
    generated = {name: build_mesh(name, cfg) for name, cfg in MESHES.items()}
    with (DATA / 'paint-meshes-manifest.json').open('w') as output:
        json.dump({'coordinate_origin_lonlat': [ORIGIN_LON, ORIGIN_LAT], 'meshes': generated}, output, indent=2)
    print('Completed. GIS source files remain unchanged.')


if __name__ == '__main__':
    main()
