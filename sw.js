const CACHE="ca-briefing-v1";
const ASSETS=["./","./index.html","./manifest.json","./icon.svg"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{if(e.request.method==="GET")e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
self.addEventListener("push",e=>{
 let d={title:"CA Finance Briefing",body:"Your daily 5-story briefing is ready.",url:"./"};
 try{d=Object.assign(d,e.data.json())}catch(_){}
 e.waitUntil(self.registration.showNotification(d.title,{body:d.body,icon:"icon.svg",badge:"icon.svg",data:{url:d.url}}));
});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(cs=>{for(const c of cs)if("focus"in c)return c.focus();return clients.openWindow(e.notification.data.url)}))});
