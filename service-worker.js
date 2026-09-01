const CACHE="dl2-companion-v0.3.0";
const ASSETS=["./", "index.html", "css/app.css", "js/app.js", "manifest.json", "icons/icon.svg", "data/districts.json", "data/inhibitors.json", "data/safes.json", "data/faq.json", "data/builds.json", "data/changelog.json", "data/activities.json"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res}).catch(()=>caches.match("index.html")))));
