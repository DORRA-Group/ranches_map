#!/usr/bin/env python3
"""Build the RANCHES full-site conceptual 3D stone sidewalk and candidate lamps.

Reads (never changes) public/data/pavement-road-edges.geojson,
road-surface.geojson, parking.geojson, land_use.geojson and road-centerlines.geojson;
embeds public/textures/limestone-walkway.png into a single textured GLB.

Requires: pip install numpy shapely pyproj trimesh pillow

IMPORTANT: This is a conceptual, uniformly raised 3D sidewalk, not a surveyed
or engineered pavement. Conservative exclusion zones keep it off roads, parking,
private plots and the striped curb. Inspect junctions before deployment.
"""
from __future__ import annotations
import json, math, sys
from collections import defaultdict
from pathlib import Path
import numpy as np
import trimesh
from PIL import Image
from pyproj import Transformer
from shapely import make_valid, constrained_delaunay_triangles
from shapely.geometry import Point, Polygon, LineString, shape
from shapely.ops import transform as shp_transform
from shapely.strtree import STRtree

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'public' / 'data'
MODELS = ROOT / 'public' / 'models'
MODELS.mkdir(exist_ok=True, parents=True)

TO_M = Transformer.from_crs('EPSG:4326', 'EPSG:22992', always_xy=True)
TO_LONLAT = Transformer.from_crs('EPSG:22992', 'EPSG:4326', always_xy=True)
TO_ECEF = Transformer.from_crs('EPSG:4979', 'EPSG:4978', always_xy=True)

# Match existing finished curb and demo. Geometry comes from project CRS metres.
SIDEWALK_OUTER_M = 2.25         # conceptual distance into pavement from road-facing edge
CURB_CLEARANCE_M = 0.60        # 55cm striped curb reaches ~51cm into pavement
PAVEMENT_TOP_HEIGHT_M = 0.20   # actual current App.tsx ROAD_SURFACE_HEIGHT=0.05 + 0.15
PAVEMENT_BASE_HEIGHT_M = 0.05
PARKING_BUFFER_M = 0.60       # parking-back curb + safety margin
ROAD_BUFFER_M = 0.12
PLOT_BUFFER_M = 0.12
SAMPLING_MAX_STEP_M = 3.0
LINE_SIMPLIFY_TOLERANCE_M = 0.035
MIN_CONNECTED_LENGTH_M = 0.9
MIN_TRIANGLE_AREA_SQM = 0.003
TILE_REPEAT_M = 2.4           # high-resolution sandstone texture covers 2.4 m by 2.4 m
POST_DISTANCE_M = 32.0
POST_SETBACK_M = 1.25
POST_MIN_PARKING_DISTANCE_M = 3.5
POST_MIN_ROAD_DISTANCE_M = 0.45
POST_MIN_OTHER_POST_M = 21.0
POST_MIN_PRIVATE_PLOT_DISTANCE_M = 0.35
POST_MAX_RENDER_DISTANCE_M = 650.0
MAX_LAMPS = 1100
ORIGIN_LON, ORIGIN_LAT = 30.8601, 30.095


def read_geom(path):
    obj=json.loads((DATA/path).read_text(encoding='utf8'))
    return [shp_transform(TO_M.transform, shape(f['geometry'])) for f in obj['features'] if f.get('geometry')]


def polys(geoms,buffer=0):
    out=[]
    for orig in geoms:
        g=orig if orig.is_valid else make_valid(orig)
        if buffer: g=g.buffer(buffer)
        if g.is_empty:continue
        if g.geom_type=='Polygon':out.append(g)
        elif hasattr(g,'geoms'):
            out.extend(h for h in g.geoms if h.geom_type=='Polygon' and not h.is_empty)
    return out


def flatten_lines(geoms):
    for geom in geoms:
        if geom.geom_type == 'LineString':yield geom
        elif hasattr(geom,'geoms'):
            for part in geom.geoms:
                yield from flatten_lines([part])


def sampling(coords, max_step):
    src=np.asarray(coords,dtype=np.float64)
    dif=np.diff(src,axis=0)
    length=np.linalg.norm(dif,axis=1)
    mask=np.concatenate(([True],length>0.015))
    src=src[mask]
    if len(src)<2:return []
    dif=np.diff(src,axis=0)
    length=np.linalg.norm(dif,axis=1)
    dist=np.concatenate(([0],np.cumsum(length)))
    if dist[-1]<MIN_CONNECTED_LENGTH_M:return []
    # Retain corners/curve vertices and ensure no gap >3m.
    samples=np.unique(np.concatenate((dist,np.arange(0,dist[-1],max_step),[dist[-1]])))
    x=np.interp(samples,dist,src[:,0]);y=np.interp(samples,dist,src[:,1])
    return list(zip(np.column_stack((x,y)),samples))


def tangent_normals(pts):
    edges=np.diff(pts,axis=0)
    norms=np.linalg.norm(edges,axis=1)
    good=norms>1e-6
    if not np.all(good):raise ValueError('Repeated coordinate')
    tangents=edges/norms[:,None]
    normals=np.column_stack((-tangents[:,1],tangents[:,0]))
    joins=np.zeros_like(pts)
    joins[0]=normals[0]; joins[-1]=normals[-1]
    if len(pts)>2:
        summed=normals[:-1]+normals[1:]
        mag=np.linalg.norm(summed,axis=1)
        unit=summed/np.maximum(mag[:,None],1e-8)
        denom=np.sum(unit*normals[:-1],axis=1)
        joins[1:-1]=unit*np.minimum(1.65,1/np.maximum(.61,denom))[:,None]
    return tangents,normals,joins


def local_lamp_bearing(road_vector):
    return (math.degrees(math.atan2(road_vector[0],road_vector[1]))+360)%360


def main():
    print('Reading road-facing pavement and obstacle geometry...',flush=True)
    lines=[l.simplify(LINE_SIMPLIFY_TOLERANCE_M, preserve_topology=False)
           for l in flatten_lines(read_geom('pavement-road-edges.geojson'))]
    lines=[l for l in lines if l.length>=MIN_CONNECTED_LENGTH_M]
    roads=polys(read_geom('road-surface.geojson'), ROAD_BUFFER_M)
    parking=polys(read_geom('parking.geojson'), PARKING_BUFFER_M)
    plots=polys(read_geom('land_use.geojson'), PLOT_BUFFER_M)
    blockers=roads+parking+plots
    tree=STRtree(blockers)
    road_tree=STRtree(roads)
    parking_tree=STRtree(parking)
    plot_tree=STRtree(plots)
    # centerlines are better facing references than road polygons at junctions.
    centerlines=list(flatten_lines(read_geom('road-centerlines.geojson')))
    centerline_tree=STRtree(centerlines)
    print('source lines:',len(lines),'blocker polygons:',len(blockers),flush=True)

    x0,y0,z0=TO_ECEF.transform(ORIGIN_LON,ORIGIN_LAT,0)
    lon,lat=np.radians([ORIGIN_LON,ORIGIN_LAT]);sl,cl=np.sin(lon),np.cos(lon);sp,cp=np.sin(lat),np.cos(lat)
    east=np.array([-sl,cl,0]);north=np.array([-sp*cl,-sp*sl,cp]);up=np.array([cp*cl,cp*sl,sp]);origin=np.array([x0,y0,z0])
    # Cesium maps glTF (X,Y,Z) to local ENU (Z,X,Y) for its default Y-up, Z-forward glTF models.
    # Therefore write positions as (north, up, east), not (east, up, -north).
    def xyz_glb(px,py,height):
        longitude,latitude=TO_LONLAT.transform(float(px),float(py))
        xc,yc,zc=TO_ECEF.transform(longitude,latitude,float(height))
        d=np.array([xc,yc,zc])-origin
        return [float(d@north),float(d@up),float(d@east)]

    top_positions=[];top_uv=[];top_triangles=[]
    side_positions=[];side_indices=[]
    candidate_lamps=[]
    total_area=0.0
    success_quads=0; skipped_blocked=0; road_sided=0

    def emit_side(a,b):
        p0=len(side_positions)
        # Outer rim is rarely visible from the normal view, but real sides keep 15 cm thickness.
        side_positions.extend([xyz_glb(*a,PAVEMENT_TOP_HEIGHT_M), xyz_glb(*b,PAVEMENT_TOP_HEIGHT_M),
                               xyz_glb(*b,PAVEMENT_BASE_HEIGHT_M), xyz_glb(*a,PAVEMENT_BASE_HEIGHT_M)])
        side_indices.extend([(p0,p0+1,p0+2),(p0,p0+2,p0+3)])

    # The original version calculated UVs independently in each tiny polygon's
    # tangent frame. At bends, adjacent pieces assigned DIFFERENT UVs to their
    # shared vertices, making sandstone joints jump across otherwise smooth paths.
    # Use the SAME endpoint UVs for adjoining ribbon quads. Positions inside a
    # clipped quad inherit UVs from its two fixed triangles by barycentric mapping.
    # This keeps tile widths real-world metric and the joints continuous on curves.
    def quad_uv(points, quad_xy, start_dist, end_dist):
        a, b, c, d = np.asarray(quad_xy, dtype=np.float64)
        values = np.array([
            [start_dist, CURB_CLEARANCE_M],
            [end_dist, CURB_CLEARANCE_M],
            [end_dist, SIDEWALK_OUTER_M],
            [start_dist, SIDEWALK_OUTER_M],
        ], dtype=np.float64)
        p = np.asarray(points, dtype=np.float64)

        def weights(q0, q1, q2):
            x = q1 - q0
            y = q2 - q0
            det = x[0] * y[1] - x[1] * y[0]
            if abs(det) < 1e-10:
                raise ValueError('Degenerate sidewalk quad')
            v = p - q0
            w1 = (v[:, 0] * y[1] - v[:, 1] * y[0]) / det
            w2 = (x[0] * v[:, 1] - x[1] * v[:, 0]) / det
            return np.column_stack((1 - w1 - w2, w1, w2))

        w0 = weights(a,b,c)
        w1 = weights(a,c,d)
        # A clipped polygon can touch the common diagonal within tiny float error.
        # Pick the triangle containing the point, or the closer triangle otherwise.
        use_first = np.min(w0, axis=1) >= np.min(w1, axis=1)
        uv0 = w0 @ values[[0,1,2]]
        uv1 = w1 @ values[[0,2,3]]
        raw = np.where(use_first[:, None], uv0, uv1)
        # Rotate the red sandstone paving by 90 degrees without rotating
        # the geography, sidewalk mesh, or lamp placements.
        # Both texture axes represent the same 2.4 m repeat dimension.
        return np.column_stack((raw[:, 1], -raw[:, 0])) / TILE_REPEAT_M

    # Avoid layered competing slab meshes at crossings and close GIS segments:
    # both would have different stone alignment, and same-elevation triangles
    # would also z-fight as the camera moves. This grid only stores generated
    # walkway parts (source GIS is never modified).
    accepted = []
    walked_grid = defaultdict(list)
    GRID_METRES = 6.0

    def grid_keys(bounds):
        lo_x,lo_y,hi_x,hi_y=bounds
        for gx in range(math.floor(lo_x/GRID_METRES),math.floor(hi_x/GRID_METRES)+1):
            for gy in range(math.floor(lo_y/GRID_METRES),math.floor(hi_y/GRID_METRES)+1):
                yield gx,gy

    def unique_pieces(poly):
        candidates=set()
        for key in grid_keys(poly.bounds):
            candidates.update(walked_grid[key])
        clipped=poly
        for idx in sorted(candidates):
            other=accepted[idx]
            if clipped.is_empty:break
            if clipped.intersects(other):
                clipped=clipped.difference(other)
        pieces = [clipped] if clipped.geom_type == 'Polygon' else [
            part for part in getattr(clipped,'geoms',[]) if part.geom_type == 'Polygon'
        ]
        for part in pieces:
            if part.area <= .07:continue
            idx=len(accepted)
            accepted.append(part)
            for key in grid_keys(part.bounds): walked_grid[key].append(idx)
            yield part

    def emit_polygon(poly, quad_xy, start_dist, end_dist):
        nonlocal total_area
        if poly.area < MIN_TRIANGLE_AREA_SQM:return
        total_area += poly.area
        tri_parts=constrained_delaunay_triangles(poly)
        for tri in tri_parts.geoms:
            if tri.area<MIN_TRIANGLE_AREA_SQM:continue
            ring=np.asarray(tri.exterior.coords)[:3]
            det=(ring[1,0]-ring[0,0])*(ring[2,1]-ring[0,1])-(ring[1,1]-ring[0,1])*(ring[2,0]-ring[0,0])
            if det<0:ring=ring[[0,2,1]]
            try:
                triangle_uv=quad_uv(ring, quad_xy, start_dist, end_dist)
            except ValueError:
                continue
            idx=len(top_positions)
            for v,uv in zip(ring,triangle_uv):
                top_positions.append(xyz_glb(*v,PAVEMENT_TOP_HEIGHT_M))
                top_uv.append(tuple(uv))
            top_triangles.append((idx,idx+1,idx+2))
        outer=np.asarray(poly.exterior.coords)
        for i in range(len(outer)-1):
            if np.linalg.norm(outer[i+1]-outer[i])>0.025:emit_side(outer[i],outer[i+1])
        for hole in poly.interiors:
            ring=np.asarray(hole.coords)
            for i in range(len(ring)-1):
                if np.linalg.norm(ring[i+1]-ring[i])>0.025:emit_side(ring[i+1],ring[i])

    def near_blocker(point,trees,geoms,distance=0):
        # Keep queries local and avoid global union/topology exceptions.
        hits=trees.query(point.buffer(distance) if distance else point)
        return any(geoms[int(i)].distance(point)<=distance for i in hits)

    for li,line in enumerate(lines):
        sampled=sampling(line.coords,SAMPLING_MAX_STEP_M)
        if len(sampled)<2:continue
        pts=np.array([row[0] for row in sampled]);dist=np.array([row[1] for row in sampled])
        try:tangents,normals,joins=tangent_normals(pts)
        except ValueError:continue
        for k,tangent in enumerate(tangents):
            a,b=pts[k],pts[k+1]
            mid=(a+b)*0.5
            nr=normals[k]
            # Road is the side closer to the nearest known road centerline.
            nearest=centerlines[int(centerline_tree.nearest(Point(*mid)))]
            plus=Point(*(mid+nr*0.9)).distance(nearest)
            minus=Point(*(mid-nr*0.9)).distance(nearest)
            sign=1 if plus>minus else -1
            inward=nr*sign
            if abs(plus-minus)<.1:
                # Fall back to the actual asphalt polygons where centerline is ambiguous.
                test_left=Point(*(mid+nr*0.35));test_right=Point(*(mid-nr*0.35))
                inleft=near_blocker(test_left,road_tree,roads)
                inright=near_blocker(test_right,road_tree,roads)
                if inleft != inright:sign=-1 if inleft else 1;inward=nr*sign
            near0=a+joins[k]*sign*CURB_CLEARANCE_M
            near1=b+joins[k+1]*sign*CURB_CLEARANCE_M
            far1=b+joins[k+1]*sign*SIDEWALK_OUTER_M
            far0=a+joins[k]*sign*SIDEWALK_OUTER_M
            quad=Polygon([near0,near1,far1,far0])
            if quad.area<.03 or not quad.is_valid:
                continue
            hits=tree.query(quad)
            clipped=quad
            if len(hits):
                # Avoid expensive global polygon union and avoid emitting overlaps.
                for j in hits:
                    g=blockers[int(j)]
                    if clipped.is_empty:break
                    if clipped.intersects(g):clipped=clipped.difference(g)
            if clipped.is_empty:
                skipped_blocked+=1;continue
            pieces=[clipped] if clipped.geom_type=='Polygon' else [p for p in getattr(clipped,'geoms',[]) if p.geom_type=='Polygon']
            for poly in pieces:
                if poly.area>.07:
                    for unique in unique_pieces(poly):
                        emit_polygon(unique, [near0,near1,far1,far0],float(dist[k]),float(dist[k+1]))
            success_quads+=1
            # Lamps are sampled along continuous lines; do not place against stalls,
            # at tight corners, or on clipped/too-narrow pavement.
            for n in range(math.ceil(dist[k]/POST_DISTANCE_M),math.floor(dist[k+1]/POST_DISTANCE_M)+1):
                sample_d=POST_DISTANCE_M*n
                if sample_d<=10 or sample_d>=dist[-1]-8:continue
                t=(sample_d-dist[k])/max(dist[k+1]-dist[k],1e-9)
                if not (0<=t<=1):continue
                loc=a+(b-a)*t+inward*POST_SETBACK_M
                locpoint=Point(*loc)
                if not clipped.buffer(-.18).covers(locpoint):continue
                if near_blocker(locpoint,parking_tree,parking,POST_MIN_PARKING_DISTANCE_M):continue
                if near_blocker(locpoint,road_tree,roads,POST_MIN_ROAD_DISTANCE_M):continue
                if near_blocker(locpoint,plot_tree,plots,POST_MIN_PRIVATE_PLOT_DISTANCE_M):continue
                to_road=-inward
                longitude,latitude=TO_LONLAT.transform(float(loc[0]),float(loc[1]))
                candidate_lamps.append((loc,float(longitude),float(latitude),local_lamp_bearing(to_road)))
        if li%100==0:
            print(f'processed {li+1}/{len(lines)} edges; surface triangles: {len(top_triangles)}',flush=True)

    if not top_triangles:raise RuntimeError('No valid pavement generated. Check source files.')
    # Greedy minimum 21m spacing between lamps. A simple grid avoids O(N^2).
    grid=defaultdict(list);lamps=[];cell=POST_MIN_OTHER_POST_M
    for xy,longitude,latitude,heading in candidate_lamps:
        gx,gy=math.floor(xy[0]/cell),math.floor(xy[1]/cell)
        if any(np.linalg.norm(other-xy)<POST_MIN_OTHER_POST_M
               for xx in range(gx-1,gx+2) for yy in range(gy-1,gy+2)
               for other in grid[(xx,yy)]):continue
        grid[(gx,gy)].append(xy)
        lamps.append(dict(id=f'full-streetlamp-{len(lamps)+1:04}',longitude=longitude,
                          latitude=latitude,headingDegrees=round(heading,4),heightMeters=4.74))
        if len(lamps)>=MAX_LAMPS:break

    # Meshes share one world-anchored coordinate origin; avoids camera-dependent shifting.
    stone=Image.open(ROOT/'public'/'textures'/'limestone-walkway.png').convert('RGB')
    texmat=trimesh.visual.material.PBRMaterial(name='Ranches red sandstone',baseColorTexture=stone,
                                                  metallicFactor=0,roughnessFactor=.95,doubleSided=False)
    top=trimesh.Trimesh(vertices=np.asarray(top_positions),faces=np.asarray(top_triangles),process=False)
    top.visual=trimesh.visual.TextureVisuals(uv=np.asarray(top_uv,dtype=np.float32), material=texmat)
    slab=trimesh.Trimesh(vertices=np.asarray(side_positions),faces=np.asarray(side_indices),process=False)
    slab.visual=trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(
        name='Ranches red sandstone edges', baseColorFactor=[155,78,58,255], metallicFactor=0, roughnessFactor=.9))
    scene=trimesh.Scene()
    scene.add_geometry(top,geom_name='sandstone-walkway-top')
    scene.add_geometry(slab,geom_name='raised-sidewalk-walls')
    out=MODELS/'ranches-full-sidewalk.glb'
    out.write_bytes(scene.export(file_type='glb'))
    data={'type':'streetlight-placement','model':'/models/classic-streetlamp.glb',
        'note':'Conceptual locations, clipped to walkable surface and set back from parking and plots. Verify before construction.',
        'lamps':lamps,'renderDistanceMeters':POST_MAX_RENDER_DISTANCE_M,
        'stoneTileSizeMeters':TILE_REPEAT_M,'curbClearanceMeters':CURB_CLEARANCE_M,
        'sidewalkTopHeightMeters':PAVEMENT_TOP_HEIGHT_M,'sidewalkBaseHeightMeters':PAVEMENT_BASE_HEIGHT_M}
    (DATA/'full-sidewalk-lampposts.json').write_text(json.dumps(data,separators=(',',':'))+'\n',encoding='utf8')
    manifest={'edge_count':len(lines),'ribbon_segments':success_quads,'blocked_segments':skipped_blocked,
              'surface_area_sqm':round(total_area,2), 'uv_mapping':'continuous-curvilinear-ribbon', 'overlap_removal':True,'triangles':len(top_triangles),'wall_triangles':len(side_indices),
              'lamppost_count':len(lamps),'max_lamp_visibility_m':POST_MAX_RENDER_DISTANCE_M,
              'curb_clearance_m':CURB_CLEARANCE_M,'texture_m_per_repeat':TILE_REPEAT_M,
              'safety_note':'Concept only; site elevations, true pavement widths, setbacks and lamp engineering unverified.'}
    (DATA/'full-sidewalk-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf8')
    print('SUCCESS',json.dumps(manifest,indent=2),flush=True)
    print('GLB',round(out.stat().st_size/1024/1024,2),'MiB',flush=True)

if __name__=='__main__':main()
