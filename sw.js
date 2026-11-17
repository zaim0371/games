// Service worker: menerima push walau browser/web tidak dibuka (chat & telepon masuk)
const SB="https://ypdtaoccfxzquyfsiloy.supabase.co",KEY="sb_publishable_2crOjnp8Rf4zhCt2bdO_Ug_rH4enKGH";
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));

self.addEventListener("push",e=>{
  let d={};try{d=e.data?e.data.json():{}}catch(_){d={}}
  e.waitUntil((async()=>{
    if(d.call){
      // telepon masuk: tampilkan + getar, lalu beri tahu penelepon "berdering"
      await self.registration.showNotification(d.title||"Panggilan masuk",{
        body:d.body||"Panggilan masuk",tag:"zcall",renotify:true,requireInteraction:true,
        vibrate:[600,300,600,300,600,300,600,300,600],data:{from:d.from||"",call:1}});
      try{await fetch(SB+"/rest/v1/zg_msgs",{method:"POST",
        headers:{apikey:KEY,"Content-Type":"application/json",Prefer:"return=minimal"},
        body:JSON.stringify({from_code:d.to,to_code:d.from,body:{t:"rack",id:d.id},ts:Date.now()})})}catch(_){}
      return}
    // chat: kalau web sedang terbuka & terlihat, tidak perlu notifikasi
    const cs=await self.clients.matchAll({type:"window",includeUncontrolled:true});
    if(cs.some(c=>c.visibilityState==="visible"))return;
    await self.registration.showNotification(d.title||"Zaim’s Games",{
      body:d.body||"Pesan baru",tag:d.tag||"zg",renotify:true,data:{from:d.from||""}});
  })());
});

self.addEventListener("notificationclick",e=>{
  e.notification.close();
  const dt=e.notification.data||{},from=dt.from||"";
  e.waitUntil((async()=>{
    const cs=await self.clients.matchAll({type:"window",includeUncontrolled:true});
    if(cs.length){const c=cs[0];try{await c.focus()}catch(_){}if(from&&!dt.call)c.postMessage({zopen:from});return}
    await self.clients.openWindow("./"+(from&&!dt.call?"?chat="+encodeURIComponent(from):""));
  })());
});
