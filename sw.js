const CACHE='kansai-pocket-v4-free-map';
const ASSETS=['./','index.html','app.css','map.css','app.js','geo.mjs','free-map.mjs','maplibre-gl.js','maplibre-gl.css','icon.svg','icon-192.png','icon-512.png','manifest.webmanifest','places.json'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('kansai-pocket-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)))}return response;
  }).catch(async()=>await caches.match(event.request)||((event.request.mode==='navigate')?await caches.match('index.html'):new Response('Offline',{status:503}))));
});
