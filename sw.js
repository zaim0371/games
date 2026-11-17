self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("push",e=>{
  let d={};try{d=e.data?e.data.json():{}}catch(_){d={}}
  e.waitUntil((async()=>{
    const cs=await self.clients.matchAll({type:"window",includeUncontrolled:true});
    if(cs.some(c=>c.visibilityState==="visible"))return;
    await self.registration.showNotification(d.title||"Zaim’s Games",{body:d.body||"Pesan baru",tag:d.tag||"zg",renotify:true,data:{from:d.from||""}});
  })());
});
self.addEventListener("notificationclick",e=>{
  e.notification.close();
  const from=(e.notification.data&&e.notification.data.from)||"";
  e.waitUntil((async()=>{
    const cs=await self.clients.matchAll({type:"window",includeUncontrolled:true});
    if(cs.length){const c=cs[0];try{await c.focus()}catch(_){}if(from)c.postMessage({zopen:from});return}
    await self.clients.openWindow("./"+(from?"?chat="+encodeURIComponent(from):""));
  })());
});
