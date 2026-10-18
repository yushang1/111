import {hasCoordinate} from './geo.mjs';

let libraryPromise;
function loadLibrary(){
  if(window.maplibregl)return Promise.resolve(window.maplibregl);
  if(!libraryPromise)libraryPromise=new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src='maplibre-gl.js';script.onload=()=>resolve(window.maplibregl);script.onerror=()=>{libraryPromise=null;script.remove();reject(Error('map-library-load-failed'))};document.head.appendChild(script);
  });
  return libraryPromise;
}
const geojson=places=>({type:'FeatureCollection',features:places.filter(hasCoordinate).map(p=>({type:'Feature',id:p.id,properties:{id:p.id,name:p.name},geometry:{type:'Point',coordinates:[p.coordinate.lng,p.coordinate.lat]}}))});

export async function createFreeMap(container,{onSelect,onBounds,onError}){
  const ml=await loadLibrary();
  const map=new ml.Map({container,style:'https://tiles.openfreemap.org/styles/liberty',
    center:[135.7681,35.0116],zoom:12,attributionControl:{compact:true},
    renderWorldCopies:false,cooperativeGestures:false,locale:{'NavigationControl.ZoomIn':'放大地图','NavigationControl.ZoomOut':'缩小地图','FullscreenControl.Enter':'全屏地图','FullscreenControl.Exit':'退出全屏','Map.Title':'收藏地图','AttributionControl.ToggleAttribution':'地图来源'}});
  map.addControl(new ml.NavigationControl({showCompass:false}),'top-right');
  map.addControl(new ml.FullscreenControl(),'top-right');
  let disposed=false,selected=null,places=[],signature='',locationMarker=null,sourceReady=false;
  const markers=new Map();
  function syncMarkers(){
    if(!sourceReady||disposed)return;
    const next=new Set();
    const features=map.queryRenderedFeatures(undefined,{layers:['collection-query']});
    for(const feature of features){
      const props=feature.properties,isCluster=Boolean(props.cluster),id=isCluster?`c${props.cluster_id}`:`p${props.id}`;
      if(next.has(id))continue;next.add(id);
      if(!markers.has(id)){
        const button=document.createElement('button');button.type='button';
        button.className=`map-point ${isCluster?'cluster':''}`;
        button.textContent=isCluster?String(props.point_count):'●';
        button.setAttribute('aria-label',isCluster?`${props.point_count} 个收藏地点，放大查看`:props.name);
        button.dataset.placeId=isCluster?'':props.id;
        const marker=new ml.Marker({element:button}).setLngLat(feature.geometry.coordinates).addTo(map);
        markers.set(id,marker);
      }
      const button=markers.get(id).getElement();button.classList.toggle('selected',!isCluster&&props.id===selected);
      button.onclick=async event=>{
        event.stopPropagation();
        if(isCluster){
          try{const zoom=await map.getSource('collection').getClusterExpansionZoom(Number(props.cluster_id));map.easeTo({center:feature.geometry.coordinates,zoom:Math.min(zoom,18),duration:350})}
          catch(error){console.warn('Map cluster could not expand',error.message)}
        }else{selected=props.id;syncMarkers();onSelect(props.id)}
      };
      button.textContent=isCluster?String(props.point_count):'●';
      button.setAttribute('aria-label',isCluster?`${props.point_count} 个收藏地点，放大查看`:props.name);
      const current=markers.get(id).getLngLat(),[lng,lat]=feature.geometry.coordinates;
      if(current.lng!==lng||current.lat!==lat)markers.get(id).setLngLat([lng,lat]);
      if(!isCluster)button.setAttribute('aria-pressed',String(props.id===selected));
    }
    for(const [id,marker] of markers)if(!next.has(id)){marker.remove();markers.delete(id)}
    container.dataset.visibleMarkers=String(markers.size);
    container.dataset.clusterCount=String([...markers.keys()].filter(id=>id.startsWith('c')).length);
  }
  const ready=new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(Error('map-load-timeout')),20000);
    map.once('load',()=>{
      clearTimeout(timer);
      map.addSource('collection',{type:'geojson',data:geojson([]),cluster:true,clusterRadius:48,clusterMaxZoom:16});
      // This layer asks MapLibre for the current visible cluster features.
      map.addLayer({id:'collection-query',type:'circle',source:'collection',paint:{'circle-radius':18,'circle-color':'#143f3b','circle-opacity':0.01}});
      sourceReady=true;container.dataset.ready='true';resolve();
    });
    map.on('error',event=>{
      // A missing font/tile can be retried by the map; only an unloaded style is fatal.
      if(!sourceReady&&event.error?.message?.includes('Failed to initialize')){clearTimeout(timer);reject(event.error)}
    });
  });
  map.on('sourcedata',event=>{if(event.sourceId==='collection'&&event.isSourceLoaded)syncMarkers()});
  map.on('render',syncMarkers);
  map.on('moveend',()=>{syncMarkers();if(disposed)return;const b=map.getBounds();onBounds({south:b.getSouth(),west:b.getWest(),north:b.getNorth(),east:b.getEast()})});
  try{await ready}catch(error){map.remove();onError?.(error);throw error}
  return {
    update(next,{fit=false,selectedId=null}={}){
      if(disposed)return;places=next.filter(hasCoordinate);selected=selectedId;
      const nextSignature=places.map(p=>`${p.id}:${p.coordinate.lat},${p.coordinate.lng}`).join('|');
      if(nextSignature!==signature){signature=nextSignature;map.getSource('collection').setData(geojson(places));container.dataset.pointCount=String(places.length)}
      if(fit&&places.length){const bounds=new ml.LngLatBounds();places.forEach(p=>bounds.extend([p.coordinate.lng,p.coordinate.lat]));map.fitBounds(bounds,{padding:45,maxZoom:16,duration:300})}
      syncMarkers();
    },
    focus(place){if(!hasCoordinate(place)||disposed)return;selected=place.id;map.easeTo({center:[place.coordinate.lng,place.coordinate.lat],zoom:16,duration:300});syncMarkers()},
    locate(point){if(disposed)return;locationMarker?.remove();const dot=document.createElement('span');dot.className='current-position';dot.setAttribute('aria-label','当前位置');locationMarker=new ml.Marker({element:dot}).setLngLat([point.lng,point.lat]).addTo(map);map.easeTo({center:[point.lng,point.lat],zoom:14,duration:300})},
    resize(){if(!disposed)map.resize()},
    dispose(){disposed=true;markers.forEach(m=>m.remove());locationMarker?.remove();map.remove()}
  };
}
