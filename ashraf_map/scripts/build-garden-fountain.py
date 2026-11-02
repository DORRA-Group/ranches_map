#!/usr/bin/env python3
"""Deterministic, lightweight, static circular fountain / landscaped roundabout.

pip install numpy trimesh
Outputs a real self-contained GLB; local metres, centered at (0,0), +Z up.
Trimesh exports GLTF with the same axis convention as RANCHES's working lamp.
"""
from __future__ import annotations
import math
import os
import random
from collections import defaultdict

import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial
from trimesh.visual.texture import TextureVisuals

HERE = os.path.dirname(os.path.abspath(__file__))
OUTPUT = os.path.abspath(os.path.join(HERE, '..', 'public', 'models', 'ranches-garden-fountain.glb'))
SEED = 23041
rng = random.Random(SEED)
TAU = 2.0 * math.pi
SEGMENTS = 128
# Colors are encoded as proper glTF PBR baseColorFactors. No external textures.
C = {
 'stone': ('#D2C2A8', .04, .87),
 'stone_light': ('#E9D8B8', .05, .80),
 'stone_shadow': ('#9F9585', .02, .96),
 'stone_grout': ('#897E6B', .01, .96),
 'stone_tile': ('#DDCDB0', .02, .92),
 'stone_tile_alt': ('#E5D6BF', .02, .92),
 'grass_dark': ('#315D2C', .0, .99),
 'grass': ('#4E8539', .0, .99),
 'grass_light': ('#6BA348', .0, .99),
 'soil': ('#4F382C', .0, 1.0),
 'mulch': ('#674638', .0, 1.0),
 'hedge_dark': ('#264A27', .0, 1.0),
 'hedge': ('#386C36', .0, .98),
 'hedge_light': ('#528746', .0, .98),
 'foliage': ('#44803E', .0, 1),
 'foliage_light': ('#73A354', .0, .98),
 'flower_pink': ('#E75C9B', .0, .85),
 'flower_rose': ('#ECA4BD', .0, .88),
 'flower_magenta': ('#C33A84', .0, .85),
 'flower_purple': ('#8C69BB', .0, .90),
 'flower_white': ('#FFF2E2', .0, .85),
 'flower_yellow': ('#F2C94A', .0, .83),
 'flower_gold': ('#E9A936', .0, .82),
 'flower_coral': ('#F08069', .0, .86),
 'flower_center': ('#E3A324', .0, .85),
 'flower_center_brown': ('#8A5D27', .0, .85),
 'water_deep': ('#176C7B', .02, .19),
 'water': ('#2A9DB0', .0, .20),
 'water_light': ('#66D0D5', .0, .18),
 'water_glint': ('#B9EEE9', .0, .12),
 'bronze': ('#87764F', .6, .34),
}


def rgba(hexstr):
 s=hexstr.lstrip('#');return [int(s[i:i+2],16) for i in (0,2,4)]+[255]

class Batch:
 def __init__(self):
  self.vertices=defaultdict(list)
  self.faces=defaultdict(list)
 def tris(self, name, verts, tris):
  v=self.vertices[name]
  start=len(v)
  v.extend(tuple(float(x) for x in vert) for vert in verts)
  self.faces[name].extend((start+a,start+b,start+c) for a,b,c in tris)
 def quad(self, name, a,b,c,d):
  self.tris(name,[a,b,c,d],[(0,1,2),(0,2,3)])
 def ring(self,name,r_in,r_out,z,segments=SEGMENTS,angle0=0,angle1=TAU):
  vs=[];fs=[]
  for j in range(segments+1):
   a=angle0+(angle1-angle0)*j/segments
   cs,sn=math.cos(a),math.sin(a)
   vs.extend([(r_in*cs,r_in*sn,z),(r_out*cs,r_out*sn,z)])
   if j:
    k=(j-1)*2
    fs.extend([(k,k+1,k+3),(k,k+3,k+2)])
  self.tris(name,vs,fs)
 def cylinder(self,name,r,z0,z1,sides=SEGMENTS,cx=0,cy=0,r_top=None,caps=True):
  if r_top is None:r_top=r
  vs=[];fs=[]
  for j in range(sides):
   a=TAU*j/sides;cs,sn=math.cos(a),math.sin(a)
   vs.extend([(cx+cs*r,cy+sn*r,z0),(cx+cs*r_top,cy+sn*r_top,z1)])
  for j in range(sides):
   k=2*j;l=2*((j+1)%sides)
   fs.extend([(k,l,k+1),(k+1,l,l+1)])
  if caps:
   vs.extend([(cx,cy,z0),(cx,cy,z1)])
   lo=len(vs)-2;hi=lo+1
   for j in range(sides):
    k=2*j;l=2*((j+1)%sides)
    fs.extend([(lo,l,k),(hi,k+1,l+1)])
  self.tris(name,vs,fs)
 def wall(self,name,r,z0,z1,sides=SEGMENTS):
  vs=[];fs=[]
  for j in range(sides):
   a=TAU*j/sides;cs,sn=math.cos(a),math.sin(a)
   vs.extend([(r*cs,r*sn,z0),(r*cs,r*sn,z1)])
  for j in range(sides):
   k=2*j;l=2*((j+1)%sides)
   fs.extend([(k,l,k+1),(k+1,l,l+1)])
  self.tris(name,vs,fs)
 def annulus_solid(self,wallmat,topmat,inner,outer,zlo,zhi):
  self.ring(topmat,inner,outer,zhi)
  self.wall(wallmat,outer,zlo,zhi)
  self.wall('stone_shadow',inner,zlo,zhi)
 def ellipsoid(self,name,x,y,z,rx,ry,rz,sides=8,levels=3):
  vs=[(x,y,z+rz)];fs=[]
  for lat in range(1,levels+1):
   theta=.5*math.pi*lat/(levels+1)
   rr=math.sin(theta)
   for j in range(sides):
    a=TAU*j/sides
    vs.append((x+rx*rr*math.cos(a),y+ry*rr*math.sin(a),z+rz*math.cos(theta)))
  for j in range(sides):fs.append((0,1+(j+1)%sides,1+j))
  for k in range(levels-1):
   base=1+k*sides; nxt=base+sides
   for j in range(sides):
    t=(j+1)%sides
    fs.extend([(base+j,base+t,nxt+j),(base+t,nxt+t,nxt+j)])
  # Lower perimeter closes at ground; no visible underside.
  base=1+(levels-1)*sides
  vs.append((x,y,z))
  bottom=len(vs)-1
  for j in range(sides):fs.append((bottom,base+j,base+(j+1)%sides))
  self.tris(name,vs,fs)
 def ribbon(self,name,pts,width,up=True):
  # Thin folded strips for static highlights / stone veins; two-sided material.
  for (ax,ay,az),(bx,by,bz) in zip(pts,pts[1:]):
   dx=bx-ax;dy=by-ay;l=math.hypot(dx,dy)
   if l<1e-9:continue
   nx=-dy/l*width*.5;ny=dx/l*width*.5
   self.quad(name,(ax+nx,ay+ny,az),(ax-nx,ay-ny,az),(bx-nx,by-ny,bz),(bx+nx,by+ny,bz))
 def flower(self,x,y,z,color,diameter=.17):
  # Five faceted, curved petals, a gold centre, and two tonal green leaves.
  rz=diameter*.5
  orientation=rng.random()*TAU
  v=[];faces=[]
  for i in range(5):
   a=orientation+i*TAU/5
   w=.52*rz;u=(math.cos(a),math.sin(a));vperp=(-u[1],u[0])
   base=len(v)
   v.extend([
     (x+u[0]*rz*.15,y+u[1]*rz*.15,z),
     (x+u[0]*rz*.9+vperp[0]*w,y+u[1]*rz*.9+vperp[1]*w,z+.025),
     (x+u[0]*rz*1.55,y+u[1]*rz*1.55,z+.008),
     (x+u[0]*rz*.9-vperp[0]*w,y+u[1]*rz*.9-vperp[1]*w,z+.025),
   ])
   faces.extend([(base,base+1,base+2),(base,base+2,base+3)])
  self.tris(color,v,faces)
  self.cylinder('flower_center',.027,z+.008,z+.035,sides=5,cx=x,cy=y)
  if rng.random()<.4:
   q=rng.random()*TAU
   ux,uy=math.cos(q),math.sin(q)
   self.tris('foliage',[(x,y,z-.12),(x+ux*.16-uy*.035,y+uy*.16+ux*.035,z-.08),(x+ux*.18+uy*.035,y+uy*.18-ux*.035,z-.09)],[(0,1,2)])
 def finish(self,path):
  scene=trimesh.Scene()
  stats={}
  for name,vs in self.vertices.items():
   if not vs:continue
   mesh=trimesh.Trimesh(vertices=np.asarray(vs,dtype=np.float32),faces=np.asarray(self.faces[name],dtype=np.int64),process=False)
   hexstr,metal,rough=C[name]
   mesh.visual=TextureVisuals(material=PBRMaterial(
      name=name,baseColorFactor=rgba(hexstr), metallicFactor=metal,
      roughnessFactor=rough,doubleSided=True,alphaMode='OPAQUE'))
   scene.add_geometry(mesh,geom_name=name,node_name=name)
   stats[name]=len(mesh.faces)
  os.makedirs(os.path.dirname(path),exist_ok=True)
  data=trimesh.exchange.gltf.export_glb(scene)
  open(path,'wb').write(data)
  return stats,scene.bounds,len(data)


def make(path):
 b=Batch()
 # R=10.0m roundabout inset garden. Asset must be scaled to selected GIS island.
 # Ground at z=0.07m ensures no z fighting with Cesium ground (placement at z~0.1m).
 b.cylinder('stone_shadow',10.0,0.00,.13)
 b.ring('stone',9.68,10.0,.15)
 b.wall('stone_light',9.98,.11,.23)
 b.ring('stone_light',9.77,9.98,.23)
 b.ring('grass_dark',0,9.76,.151)
 b.ring('grass',8.66,9.71,.156)
 b.ring('soil',7.42,8.66,.161)
 b.ring('grass',7.15,7.42,.17)
 b.ring('soil',6.24,7.15,.165)
 b.ring('grass',5.40,6.24,.17)
 b.ring('stone_grout',4.25,5.36,.174)
 # Segmented paving rings, with understated grout. 64 unique stone pavers.
 for j in range(96):
  a0=TAU*(j+.035)/96;a1=TAU*(j+.965)/96
  b.ring('stone_tile' if j%3 else 'stone_tile_alt',4.35,5.31,.185,segments=3,angle0=a0,angle1=a1)
 b.ring('stone_light',4.08,4.24,.195)
 b.wall('stone_shadow',4.08,.15,.29)
 b.ring('stone',3.94,4.08,.30)
 # Circular planter edges in limestone, tucked into the greenery, no curb overlap.
 for ri,ro in [(8.60,8.66),(7.40,7.45),(7.13,7.18),(6.20,6.25)]:
  b.ring('stone_shadow',ri,ro,.191)
 # Large ornamental fountain basin with stone coping and raised walls.
 b.cylinder('stone_shadow',3.98,.15,.32)
 b.annulus_solid('stone','stone_light',3.52,3.99,.22,.63)
 b.ring('stone_grout',3.45,3.52,.52)
 b.cylinder('water_deep',3.50,.36,.365)
 b.cylinder('water',3.42,.37,.386)
 b.ring('water_light',2.75,3.12,.391)
 # Calm water glints, semi-circular fragmented rings (not actual animation).
 for idx in range(20):
  rr=rng.uniform(1.45,3.28); a0=rng.uniform(0,TAU);ang=rng.uniform(.15,.65)
  pts=[(rr*math.cos(a0+ang*t/10),rr*math.sin(a0+ang*t/10),.397) for t in range(11)]
  b.ribbon('water_glint',pts,width=rng.uniform(.012,.032))
 # Base and sculpted central tiered stone fountain.
 b.cylinder('stone',.92,.38,.53,sides=48)
 b.cylinder('stone_light',.67,.53,.66,sides=48)
 b.cylinder('stone_shadow',.42,.65,1.05,sides=32,r_top=.30)
 b.cylinder('stone',1.08,1.01,1.11,sides=64)
 b.cylinder('stone_light',1.18,1.09,1.19,sides=64)
 b.cylinder('water_light',.95,1.20,1.213,sides=64)
 b.cylinder('stone',.24,1.20,1.61,sides=24,r_top=.16)
 b.cylinder('stone_light',.56,1.60,1.68,sides=48)
 b.cylinder('water_light',.42,1.688,1.705,sides=48)
 b.cylinder('bronze',.09,1.70,1.92,sides=16,r_top=.045)
 # Stone petal forms 8 tiny inset fountains around center: emphasize aerial detail.
 for i in range(8):
  a=TAU*i/8+math.pi/8;cx=2.23*math.cos(a);cy=2.23*math.sin(a)
  b.cylinder('bronze',.065,.39,.56,sides=8,cx=cx,cy=cy)
  b.cylinder('water_light',.095,.55,.61,sides=8,cx=cx,cy=cy,r_top=.035)
 # Outer hedge clusters, planted in alternating rhythm.
 for i in range(96):
  a=TAU*(i+.5)/96
  r=5.79+rng.uniform(-.09,.09)
  cx=r*math.cos(a);cy=r*math.sin(a)
  nm=rng.choice(['hedge_dark','hedge','hedge','hedge_light'])
  b.ellipsoid(nm,cx,cy,.18,.24,.23,rng.uniform(.30,.44),sides=7,levels=3)
 # Four larger ornamental low shrubs, paired along the garden belt.
 for i in range(16):
  a=TAU*i/16+.13;rr=9.02+rng.uniform(-.10,.10)
  nm=rng.choice(['foliage','hedge','foliage_light'])
  b.ellipsoid(nm,rr*math.cos(a),rr*math.sin(a),.16,.31,.27,.46,sides=10,levels=4)
 # Color-themed bedding sections alternate around each ring, not a flat texture.
 for j in range(850):
  r=math.sqrt(rng.uniform(7.48**2,8.57**2));a=rng.random()*TAU
  palette=['flower_magenta','flower_pink','flower_rose','flower_purple']
  section=int(a/(TAU/8))
  color=palette[(section+(0 if rng.random()<.70 else rng.randrange(4)))%4]
  b.flower(r*math.cos(a),r*math.sin(a),.23+rng.uniform(-.005,.036),color,rng.uniform(.12,.20))
 for j in range(780):
  r=math.sqrt(rng.uniform(6.30**2,7.09**2));a=rng.random()*TAU
  palette=['flower_yellow','flower_coral','flower_gold','flower_white']
  section=int(a/(TAU/8))
  color=palette[(section+(0 if rng.random()<.72 else rng.randrange(4)))%4]
  b.flower(r*math.cos(a),r*math.sin(a),.23+rng.uniform(-.005,.035),color,rng.uniform(.12,.19))
 # Scattered grass tufts across outer lawn; no tufts under the water/stone.
 for j in range(980):
  r=math.sqrt(rng.uniform(8.75**2,9.62**2));a=rng.random()*TAU
  x,y=r*math.cos(a),r*math.sin(a)
  h=rng.uniform(.055,.135);s=rng.uniform(.035,.065);z=.158
  nm=rng.choice(['grass_dark','grass_light','grass'])
  b.tris(nm,[(x-s,y,z),(x+s,y,z),(x,y,h+z),(x,y-s,z),(x,y+s,z)],[(0,1,2),(3,4,2)])
 stats,bounds,nbytes=b.finish(path)
 print('Saved:',path)
 print('Size: %.2f MB'%(nbytes/1048576))
 print('Bounds (m):',bounds)
 print('Triangles:',sum(stats.values()), 'draw calls/materials:',len(stats))
 print('Materials:',list(stats))
 return stats

if __name__=='__main__':
 make(OUTPUT)
