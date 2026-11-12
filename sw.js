const CACHE='kansai-pocket-v27-journey-20261112';
const ASSETS=['./','index.html','app.css','map.css','transit.js','app.js','geo.mjs','free-map.mjs','maplibre-gl.js','maplibre-gl.css','icon.svg','icon-192.png','icon-512.png','manifest.webmanifest','places.json'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('kansai-pocket-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
  event.respondWith(fetch(event.request,{cache:'no-cache'}).then(response=>{
    if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)))}return response;
  }).catch(async()=>{
    const cache=await caches.open(CACHE);
    const exact=await cache.match(event.request);
    if(exact)return exact;
    if(event.request.mode==='navigate')return (await cache.match('index.html'))||Response.error();
    // Initial precaching uses unversioned asset names; the HTML uses versioned URLs.
    const asset=new URL(event.request.url);
    asset.search='';
    return (await cache.match(asset.href))||new Response('Offline',{status:503});
  }));
});

