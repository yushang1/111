export function hasCoordinate(place){
  const p=place.coordinate;
  return !!p && Number.isFinite(p.lat)&&Number.isFinite(p.lng)&&Math.abs(p.lat)<=90&&Math.abs(p.lng)<=180;
}
export function distanceKm(a,b){
  const rad=value=>value*Math.PI/180;
  const dlat=rad(b.lat-a.lat),dlng=rad(b.lng-a.lng);
  const h=Math.sin(dlat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dlng/2)**2;
  return 6371*2*Math.asin(Math.sqrt(Math.min(1,Math.max(0,h))));
}
export function orderedPlaces(places,position){
  if(!position)return [...places];
  return [...places].sort((a,b)=>{
    const da=hasCoordinate(a)?distanceKm(position,a.coordinate):Infinity;
    const db=hasCoordinate(b)?distanceKm(position,b.coordinate):Infinity;
    return da-db||a.name.localeCompare(b.name,'zh-CN');
  });
}
export function withinBounds(point,bounds){
  const lngMatch=bounds.west<=bounds.east?point.lng>=bounds.west&&point.lng<=bounds.east:point.lng>=bounds.west||point.lng<=bounds.east;
  return point.lat>=bounds.south&&point.lat<=bounds.north&&lngMatch;
}
// Spatial screen buckets: O(n), recomputed for the current zoom/projection.
export function clusterPoints(places,project,zoom){
  const size=zoom>=17?0:64,buckets=new Map();
  for(const place of places){
    if(!hasCoordinate(place))continue;
    const p=project(place.coordinate);if(!p)continue;
    const key=size?`${Math.floor(p.x/size)}:${Math.floor(p.y/size)}`:place.id;
    const group=buckets.get(key)||{x:0,y:0,places:[]};
    group.x+=p.x;group.y+=p.y;group.places.push(place);buckets.set(key,group);
  }
  return [...buckets.values()].map(g=>({...g,x:g.x/g.places.length,y:g.y/g.places.length}));
}
