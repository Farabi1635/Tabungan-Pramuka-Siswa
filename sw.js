const C='tp-v1.0.8',F=['./','index.html','manifest.json','assets/css/style.css','assets/js/app.js','assets/js/chart.umd.js','assets/js/storage.js','assets/js/members.js','assets/js/transactions.js','assets/js/reports.js','assets/js/backup.js','assets/images/logo-pramuka.png','assets/images/logo-pramuka-dunia.png','assets/images/logo-sekolah.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))));
self.addEventListener('fetch',e=>e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request))));
