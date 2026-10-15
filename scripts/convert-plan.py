"""Convert LibreDWG JSON into rounded 2D paths; expand model-space blocks.
Usage: dwgread -O JSON -o /tmp/plan.json source.dwg
       python3 scripts/convert-plan.py /tmp/plan.json
Text, survey points, dimensions and hatches are intentionally omitted.
"""
import json, math, sys, collections
from pathlib import Path
j=json.load(open(sys.argv[1])); objects=j['OBJECTS']; byid={o['handle'][-1]:o for o in objects}
layers={o['handle'][-1]:o['name'] for o in objects if o.get('object')=='LAYER'}
model=next(o for o in objects if o.get('name')=='*Model_Space')
paths=[]; counts=collections.Counter()
def transform(p,m):
 x,y=p[:2];a,b,c,d,tx,ty=m;return [a*x+c*y+tx,b*x+d*y+ty]
def compose(m,n):
 a,b,c,d,x,y=m;e,f,g,h,u,v=n;return [a*e+c*f,b*e+d*f,a*g+c*h,b*g+d*h,a*u+c*v+x,b*u+d*v+y]
def walk(o,m,depth=0):
 if depth>16 or o.get('invisible'):return
 typ=o.get('entity');p=[]
 if typ=='INSERT':
  block=byid.get(o.get('block_header',[0])[-1],{});base=block.get('base_pt',[0,0]);x,y=o['ins_pt'][:2];sx,sy=o.get('scale',[1,1])[:2];a=o.get('rotation',0);c,s=math.cos(a),math.sin(a)
  n=[c*sx,s*sx,-s*sy,c*sy,x-c*sx*base[0]+s*sy*base[1],y-s*sx*base[0]-c*sy*base[1]]
  for ref in block.get('entities',[]):walk(byid.get(ref[-1],{}),compose(m,n),depth+1)
  return
 if typ=='LINE':p=[o['start'],o['end']]
 elif typ=='LWPOLYLINE':
  pts=o.get('points',[]);bulges=o.get('bulges',[]);closed=bool(o.get('flag',0)&512)
  for i,start in enumerate(pts):
   p.append(start);b=bulges[i] if i<len(bulges) else 0
   if b and (i+1<len(pts) or closed):
    end=pts[(i+1)%len(pts)];dx,dy=end[0]-start[0],end[1]-start[1];ch=math.hypot(dx,dy)
    if ch:
     cx=(start[0]+end[0])/2-dy*(1-b*b)/(4*b);cy=(start[1]+end[1])/2+dx*(1-b*b)/(4*b);r=ch*(1+b*b)/(4*abs(b));a=math.atan2(start[1]-cy,start[0]-cx);sweep=4*math.atan(b);steps=max(2,min(64,math.ceil(abs(sweep)*math.sqrt(max(r,1)))))
     p.extend([[cx+r*math.cos(a+sweep*k/steps),cy+r*math.sin(a+sweep*k/steps)] for k in range(1,steps)])
  if closed and pts:p.append(pts[0])
 elif typ in ['ARC','CIRCLE']:
  cx,cy=o['center'][:2];r=o['radius'];a=o.get('start_angle',0);b=o.get('end_angle',math.tau);sweep=(b-a)%math.tau or math.tau;n=max(8,min(96,math.ceil(sweep*math.sqrt(max(r,1)))))
  p=[[cx+r*math.cos(a+sweep*i/n),cy+r*math.sin(a+sweep*i/n)] for i in range(n+1)]
 if len(p)>1:
  if typ in ['LWPOLYLINE','ARC','CIRCLE'] and o.get('extrusion',[0,0,1])[2]<0:p=[[-v[0],v[1]] for v in p]
  p=[transform(v,m) for v in p]
  if all(math.isfinite(v) for xy in p for v in xy):paths.append(p);counts[layers.get(o.get('layer',[0])[-1],'0')]+=1
for ref in model.get('entities',[]):walk(byid.get(ref[-1],{}),[1,0,0,1,0,0])
xs=[v[0] for p in paths for v in p];ys=[v[1] for p in paths for v in p];bounds=[min(xs),min(ys),max(xs),max(ys)]
# Store relative coordinates, removing large survey offsets for compact payloads.
paths=[[[round(x-bounds[0],2),round(y-bounds[1],2)] for x,y in p] for p in paths]
result={'paths':paths,'bounds':[0,0,round(bounds[2]-bounds[0],2),round(bounds[3]-bounds[1],2)],'sourceBounds':bounds,'source':'ZONE 1 - IT.dwg','units':'Unverified CAD units; header reports inches','layers':list(counts),'alignment':'Approximate; no confirmed CRS or ground control'}
out=Path('public/data/plan.json');out.write_text(json.dumps(result,separators=(',',':')))
print('Paths:',len(paths),'Bounds:',bounds,'Bytes:',out.stat().st_size,'Layers:',counts)
w,h=result['bounds'][2:];svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}"><rect width="100%" height="100%" fill="#263b34"/><g transform="translate(0,{h}) scale(1,-1)" fill="none" stroke="#eff1c8" stroke-width="{w/2000}">'
svg+=''.join('<polyline points="'+' '.join(f'{x},{y}' for x,y in p)+'"/>' for p in paths)+'</g></svg>'
Path('public/data/plan-preview.svg').write_text(svg)
