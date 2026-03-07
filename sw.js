self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(clients.claim()); });
self.addEventListener('fetch', function(e){
  if(e.request.url.includes('/socket.io/')) return;
  e.respondWith(fetch(e.request).catch(function(){ return caches.match(e.request); }));
});