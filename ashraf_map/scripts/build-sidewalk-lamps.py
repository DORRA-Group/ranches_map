#!/usr/bin/env python3
"""Generate a single, conservative 3D sidewalk-and-lamppost pilot.

Run from inside a Ranches project that contains these GIS sources:
 public/data/pavement-road-edges.geojson
 public/data/parking.geojson
 public/data/land_use.geojson
 public/data/road-surface.geojson

Dependencies: numpy, shapely, pyproj, trimesh.
This only writes demo-sidewalk.geojson, demo-lampposts.json and the GLB; all GIS sources stay unchanged.

The sidewalk width (2.25 m) is a concept, not an approved engineering dimension.
"""
from __future__ import annotations
import json
import math
from pathlib import Path
import numpy as np
import trimesh
from pyproj import Transformer
from shapely.geometry import LineString, Point, Polygon, shape, mapping
from shapely.ops import transform, substring, unary_union

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "public" / "data"
MODELS = ROOT / "public" / "models"
MODELS.mkdir(parents=True, exist_ok=True)
TO_METERS = Transformer.from_crs('EPSG:4326', 'EPSG:22992', always_xy=True)
TO_WGS84 = Transformer.from_crs('EPSG:22992', 'EPSG:4326', always_xy=True)

# Site-specific prototype segment. Source is the outer road-facing pavement line.
SOURCE_EDGE_PART = 846
START_ALONG_EDGE_M = 650.0
DEMO_LENGTH_M = 70.0
SIDEWALK_WIDTH_M = 2.25
# The painted raised curb is 0.55 m wide and reaches about 0.51 m into the
# sidewalk from its source road-facing pavement edge. Start the 3D slab and
# its stone surface 0.60 m inward, so neither covers the black/white stripes.
SIDEWALK_CURB_CLEARANCE_M = 0.60
POST_SETBACK_M = 1.20
POST_DISTANCE_ALONG_M = [10.0, 26.5, 43.0, 59.5]

def layer_geometries(filename):
    fc = json.loads((DATA / filename).read_text(encoding='utf8'))
    return [transform(TO_METERS.transform, shape(f['geometry'])) for f in fc['features'] if f.get('geometry')]

def wgs_xy(x,y):
    lon,lat=TO_WGS84.transform(float(x),float(y))
    return [lon,lat]

def build_geometry():
    edges=[]
    for geometry in layer_geometries('pavement-road-edges.geojson'):
        if geometry.geom_type=='LineString': edges.append(geometry)
        elif geometry.geom_type=='MultiLineString': edges.extend(geometry.geoms)
    if len(edges)<=SOURCE_EDGE_PART:
        raise RuntimeError('Pavement GIS source has changed; reselect the prototype segment.')
    edge=edges[SOURCE_EDGE_PART]
    segment=substring(edge,START_ALONG_EDGE_M,START_ALONG_EDGE_M+DEMO_LENGTH_M)
    segment=segment.simplify(0.04,preserve_topology=False)
    if segment.length < 68:
        raise RuntimeError('Unexpectedly short pavement segment')
    # Determine which side is actually outside asphalt, rather than assuming
    # all GIS line segments have the same winding.
    primary_road=layer_geometries('road-surface.geojson')[0].buffer(0)
    polygon_left=segment.buffer(SIDEWALK_WIDTH_M,cap_style='flat',join_style='mitre',mitre_limit=2,single_sided=True)
    polygon_right=segment.buffer(-SIDEWALK_WIDTH_M,cap_style='flat',join_style='mitre',mitre_limit=2,single_sided=True)
    left_road_area=polygon_left.intersection(primary_road).area
    right_road_area=polygon_right.intersection(primary_road).area
    side_sign=1 if left_road_area < right_road_area else -1
    # Four-corner pilot: map exact road-facing edge into a narrower slab.
    # We must preserve four corners because limestoneWalkway.ts uses four UVs.
    # This moves BOTH the raised slab and the sandstone top away from curb
    # stripes without moving any lamppost or changing the source GIS lines.
    source_points = np.asarray(segment.coords, dtype=float)
    if len(source_points) != 2:
        raise RuntimeError('Pilot UV mapper requires a straight, two-point sidewalk segment')
    direction = source_points[1] - source_points[0]
    direction /= np.linalg.norm(direction)
    inward = side_sign * np.array([-direction[1], direction[0]])
    near = source_points + inward * SIDEWALK_CURB_CLEARANCE_M
    far = source_points + inward * SIDEWALK_WIDTH_M
    sidewalk = Polygon([near[0], near[1], far[1], far[0]])
    if sidewalk.is_empty or sidewalk.geom_type!='Polygon' or not sidewalk.is_valid:
        raise RuntimeError('Generated sidewalk not a valid polygon')
    if min(left_road_area,right_road_area)/sidewalk.area>0.05:
        raise RuntimeError('Prototype unexpectedly overlaps the asphalt')
    # Make certain this proof-of-concept is not covering stalls or plots.
    parking = unary_union(layer_geometries('parking.geojson'))
    plots = unary_union(layer_geometries('land_use.geojson'))
    if sidewalk.intersection(parking).area>0.1 or sidewalk.intersection(plots).area>0.1:
        raise RuntimeError('Demo sidewalk intersects parking or private plots')
    wgs_polygon=transform(TO_WGS84.transform, sidewalk)
    geojson={'type':'FeatureCollection','features':[{'type':'Feature',
       'properties':{'name':'Pilot 3D sidewalk','width_m':SIDEWALK_WIDTH_M-SIDEWALK_CURB_CLEARANCE_M,'curb_clearance_m':SIDEWALK_CURB_CLEARANCE_M,'note':'Conceptual strip, cut back from road-side black/white curb'},
       'geometry':mapping(wgs_polygon)}]}
    (DATA/'demo-sidewalk.geojson').write_text(json.dumps(geojson,separators=(',',':'))+'\n',encoding='utf8')
    posts=[]
    for index,distance in enumerate(POST_DISTANCE_ALONG_M,1):
        p=segment.interpolate(distance)
        p0=segment.interpolate(max(0,distance-0.5))
        p1=segment.interpolate(min(segment.length,distance+0.5))
        d=np.array([p1.x-p0.x,p1.y-p0.y],dtype=float)
        d/=np.linalg.norm(d)
        inward=side_sign*np.array([-d[1],d[0]])
        center=np.array([p.x,p.y])+inward*POST_SETBACK_M
        if not sidewalk.buffer(0.025).covers(Point(*center)):
            raise RuntimeError('Lamppost outside raised sidewalk')
        to_road=-inward
        # Heading: clockwise from North; model's positive-Y arm points roadward.
        bearing=math.degrees(math.atan2(to_road[0],to_road[1]))%360
        lon,lat=wgs_xy(*center)
        posts.append({'id':f'classic-lamp-{index}','longitude':lon,'latitude':lat,
                      'headingDegrees':round(bearing,4),'heightMeters':4.74})
    (DATA/'demo-lampposts.json').write_text(json.dumps({'type':'streetlight-placement','model':'/models/classic-streetlamp.glb',
                    'placementNote':'Conceptual locations. Positive Y model arm points towards road.',
                    'sidewalkWidthM':SIDEWALK_WIDTH_M,'lamps':posts},indent=2)+'\n',encoding='utf8')
    print(f'Sidewalk pilot: {sidewalk.area:.1f} square metres, {len(posts)} lamp posts, inward side {side_sign}')
    for p in posts:print(p['id'],p['longitude'],p['latitude'],p['headingDegrees'])

# Standalone low-poly classic lamp model, Z-up in the authoring scene.
# GLB exporter handles glTF axis convention. All geometry is in metres.
def material(name,rgba,emissive=None,metal=0.0,rough=.65):
    color=[int(x) for x in rgba]
    kw={'name':name,'baseColorFactor':color,'metallicFactor':metal,'roughnessFactor':rough}
    if emissive: kw['emissiveFactor']=emissive
    return trimesh.visual.material.PBRMaterial(**kw)

DARK=material('Black cast iron',[28,30,34,255],metal=.67,rough=.46)
TRIM=material('Antique bronze trim',[130,105,58,255],metal=.7,rough=.34)
GLASS=material('Warm glowing lantern glass',[255,208,119,255],emissive=[1.0,0.60,0.20],rough=.3)

def make_lamp():
    scene=trimesh.Scene()
    count=0
    def put(mesh,mat,name,translation=(0,0,0)):
        nonlocal count
        mesh.visual=trimesh.visual.TextureVisuals(material=mat)
        mesh.apply_translation(translation)
        scene.add_geometry(mesh,geom_name=f'{name}_{count}')
        count+=1
    def pole(r0,r1,height,z,mat=DARK,name='pole',sides=12):
        # centerline aligned Z, truncated cone if the radii differ
        if abs(r0-r1)<1e-7:
            mesh=trimesh.creation.cylinder(radius=r0,height=height,sections=sides)
        else:
            # Approximate a tapered column using a 2-ring mesh
            theta=np.linspace(0,2*np.pi,sides,endpoint=False)
            lower=np.column_stack((r0*np.cos(theta),r0*np.sin(theta),np.full(sides,-height/2)))
            upper=np.column_stack((r1*np.cos(theta),r1*np.sin(theta),np.full(sides,height/2)))
            verts=np.vstack((lower,upper,[[0,0,-height/2],[0,0,height/2]])); faces=[]
            for k in range(sides):
                kk=(k+1)%sides
                faces.extend([[k,kk,sides+kk],[k,sides+kk,sides+k]])
            for k in range(sides):
                kk=(k+1)%sides
                faces.extend([[2*sides,kk,k],[2*sides+1,sides+k,sides+kk]])
            mesh=trimesh.Trimesh(vertices=verts,faces=faces,process=True)
        put(mesh,mat,name,(0,0,z+height/2))
    def bar(start,end,r=.035,mat=DARK,name='decorative_bar',sides=8):
        a=np.asarray(start,float);b=np.asarray(end,float);v=b-a
        mesh=trimesh.creation.cylinder(radius=r,height=np.linalg.norm(v),sections=sides)
        mesh.apply_transform(trimesh.geometry.align_vectors([0,0,1],v))
        put(mesh,mat,name,(a+b)/2)
    # Cast-iron plinth, collars, taper, finial
    pole(.24,.24,.15,0,DARK,'wide_foot')
    pole(.18,.13,.54,.15,DARK,'decorative_base')
    pole(.145,.145,.12,.62,TRIM,'base_trim')
    pole(.12,.073,3.55,.74,DARK,'tapered_shaft')
    for z,r in [(1.10,.138),(2.75,.106),(4.25,.105)]:
        pole(r,r,.085,z,TRIM,'collar')
    pole(.075,.075,.16,4.29,DARK,'cap')
    put(trimesh.creation.cone(radius=.13,height=.28,sections=12),TRIM,'finial',(0,0,4.46))
    # Curved shepherd's hook, extending positive Y toward the road
    path=[(0,.0,4.13),(0,.28,4.21),(0,.63,4.34),(0,.93,4.32),(0,1.13,4.15),(0,1.16,3.94)]
    for a,b in zip(path[:-1],path[1:]): bar(a,b,.05,DARK,'arched_arm')
    bar((0,.63,4.33),(0,.76,4.06),.028,TRIM,'brace')
    # Square antique lantern at Y=1.16, Z~3.67
    ly=1.16
    def box(size,at,mat,name):
        put(trimesh.creation.box(extents=size),mat,name,at)
    box([.46,.46,.075],[0,ly,3.91],DARK,'lantern_roof')
    box([.36,.36,.31],[0,ly,3.65],GLASS,'warm_glass')
    box([.45,.45,.055],[0,ly,3.46],DARK,'lantern_floor')
    for xx in [-.20,.20]:
        for yy in [-.20,.20]:
            bar((xx,ly+yy,3.48),(xx,ly+yy,3.90),.020,DARK,'lantern_frame',6)
    box([.50,.50,.06],[0,ly,3.93],TRIM,'roof_trim')
    put(trimesh.creation.cone(radius=.25,height=.16,sections=4),DARK,'lantern_top',(0,ly,4.03))
    out=MODELS/'classic-streetlamp.glb'
    out.write_bytes(scene.export(file_type='glb'))
    print('Model:',out,'bytes:',out.stat().st_size,'geometry objects',count)

if __name__=='__main__':
    build_geometry()
    make_lamp()
