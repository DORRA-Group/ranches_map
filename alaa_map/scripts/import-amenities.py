"""Extract real nearby POIs from an OSM API XML area download."""
import xml.etree.ElementTree as ET,json,math,sys
from pathlib import Path
root=ET.parse(sys.argv[1]).getroot();nodes={e.attrib['id']:(float(e.attrib['lat']),float(e.attrib['lon'])) for e in root.findall('node')};places=[]
groups={'food':['restaurant','cafe','fast_food','food_court','bar'],'shopping':['supermarket','mall','convenience'],'health':['hospital','clinic','pharmacy','doctors','dentist'],'education':['school','university','college','kindergarten'],'services':['fuel','bank','atm']}
for e in root:
 tags={t.attrib['k']:t.attrib['v'] for t in e.findall('tag')};kind=tags.get('amenity',tags.get('shop',''));cat=next((c for c,ks in groups.items() if kind in ks),None)
 if not cat:continue
 if e.tag=='node':lat,lng=nodes[e.attrib['id']]
 elif e.tag=='way':
  pts=[nodes[n.attrib['ref']] for n in e.findall('nd') if n.attrib['ref'] in nodes]
  if not pts:continue
  lat=sum(p[0] for p in pts)/len(pts);lng=sum(p[1] for p in pts)/len(pts)
 else:continue
 r=math.pi/180;a=math.sin((lat-30.0989057)*r/2)**2+math.cos(lat*r)*math.cos(30.0989057*r)*math.sin((lng-30.8716454)*r/2)**2;d=6371*2*math.atan2(math.sqrt(a),math.sqrt(1-a))
 if d>10:continue
 places.append({'id':e.tag+'-'+e.attrib['id'],'name':tags.get('name:en',tags.get('name',kind.replace('_',' '))),'category':cat,'lat':lat,'lng':lng,'kind':kind.replace('_',' '),'distance':round(d,3)})
places.sort(key=lambda p:p['distance']);Path('public/data/amenities.json').write_text(json.dumps(places,ensure_ascii=False,separators=(',',':')))
print('Imported',len(places),'amenities');print([(p['name'],p['distance']) for p in places[:12]])
