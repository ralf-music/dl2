const CACHE="dl2-companion-v0.11.2";
const ASSETS=["./","index.html","css/app.css","js/app.js","manifest.json","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-192.png","icons/icon-maskable-512.png","data/districts.json","data/inhibitors.json","data/safes.json","data/faq.json","data/builds.json","data/changelog.json","data/activities.json","data/airdrops.json","data/gre-anomalies.json","data/sunken-airdrops.json","data/gre-quarantine.json","data/ducks.json","data/collectibles.json","data/lang-de.json","data/lang-en.json"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("dl2-companion-")&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=="GET"||url.origin!==self.location.origin)return;
 const isDoc=req.mode==="navigate";
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{
   const fresh=await fetch(req,{cache:"no-store"});
   if(fresh.ok)await cache.put(req,fresh.clone());
   return fresh;
  }catch(e){
   const cached=await cache.match(req,{ignoreSearch:isDoc});
   if(cached)return cached;
   if(isDoc){const home=await cache.match("./");if(home)return home;const page=await cache.match("index.html");if(page)return page;}
   return new Response("Offline: Datei nicht zwischengespeichert.",{status:503,statusText:"Offline"});
  }
 })());
});
