const V='slide-v18',A=['./','./index.html','./board.html','./studio.js','./pptx.js','./jszip.min.js','./pdf.min.mjs','./pdf.worker.min.mjs','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(A.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=V).map(x=>caches.delete(x)))).then(()=>clients.claim()))});
self.addEventListener('fetch',e=>{
 if(e.request.method!='GET')return;
 e.respondWith(caches.match(e.request).then(h=>{
  const f=fetch(e.request).then(r=>{if(r&&(r.ok||r.type=='opaque')){const c=r.clone();caches.open(V).then(x=>x.put(e.request,c))}return r}).catch(()=>h);
  return h||f}))});
