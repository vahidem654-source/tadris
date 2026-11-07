/* استودیو اسلاید — امکانات بیشتر (studio.js)
   روی برنامه‌ی اصلی (index.html) سوار می‌شود و از متغیرهای آن (D, i, cv, X, draw, ui, mk, fit, Q, P, th, Rc …) استفاده می‌کند. */
(function(){
var q$=function(s,r){return(r||document).querySelector(s)};
var fa=function(n){return String(n).replace(/\d/g,function(d){return'۰۱۲۳۴۵۶۷۸۹'[d]})};
var mmss=function(t){t=Math.max(0,Math.floor(t||0));return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0')};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var raf=function(){return new Promise(function(r){requestAnimationFrame(r)})};
var wait=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
var st=document.createElement('style');st.textContent=
'.ov{position:fixed;inset:0;background:#000b;display:flex;align-items:center;justify-content:center;z-index:50;padding:10px}'+
'.ov .pn{background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:14px;padding:14px;max-width:560px;width:100%;max-height:92vh;overflow:auto;display:flex;flex-direction:column;gap:10px;line-height:1.8;font-size:14px}'+
'.ov .pn.w{max-width:780px}.ov .pn input[type=text],.ov .pn input[type=password],.ov .pn input[type=number],.ov .pn textarea{width:100%}'+
'.ov .pn label.k{display:flex;gap:6px;align-items:center}.ov .pn small{opacity:.7}.ov .pn .rw{display:flex;gap:8px;flex-wrap:wrap;align-items:center}'+
'#ts2{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#222e;color:#fff;border-radius:12px;padding:8px 14px;z-index:99;opacity:0;transition:opacity .25s;pointer-events:none;max-width:90%;text-align:center}'+
'.gg{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px}'+
'.gg .it{position:relative;border:3px solid var(--line);border-radius:10px;overflow:hidden;background:#fff;aspect-ratio:1;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#223;font-size:12px;text-align:center}'+
'.gg .it img{max-width:100%;max-height:100%;object-fit:contain}.gg .it.sel{border-color:var(--acc);box-shadow:0 0 0 2px var(--acc)}'+
'.gg .it span{position:absolute;bottom:0;right:0;left:0;background:#000a;color:#fff;font-size:10px;text-align:center}'+
'.wc{border:1px solid var(--line);border-radius:12px;padding:8px;display:flex;flex-direction:column;gap:6px}'+
'#tl button.on{background:var(--acc);color:var(--bg)}#cdn{position:fixed;inset:0;display:none;align-items:center;justify-content:center;font-size:120px;color:#fff;background:#0007;z-index:60}';
document.head.appendChild(st);
var tsEl=document.createElement('div');tsEl.id='ts2';document.body.appendChild(tsEl);
function toast(t,ms){tsEl.textContent=t;tsEl.style.opacity=1;clearTimeout(tsEl.t);tsEl.t=setTimeout(function(){tsEl.style.opacity=0},ms||2800)}
function modal(html,wide){var o=document.createElement('div');o.className='ov';o.innerHTML='<div class="pn'+(wide?' w':'')+'">'+html+'</div>';document.body.appendChild(o);return o}
function busy(t){var o=q$('#bzz');if(!t){if(o)o.remove();return}if(!o){o=modal('<div style="text-align:center" id="bzt"></div>');o.id='bzz'}q$('#bzt',o).textContent=t}
function saveBlob(bl,name){var u=URL.createObjectURL(bl);
 Promise.resolve().then(function(){return window.claude&&window.claude.use&&window.claude.use('downloads')}).then(function(d){
  if(d){return d.save({filename:name,data:bl})}
  var a=document.createElement('a');a.href=u;a.download=name;a.style.display='none';document.body.appendChild(a);a.click();setTimeout(function(){a.remove()},6000)}).catch(function(e){if(!e||e.code!='declined'){var a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove()}})}
window.addEventListener('error',function(e){toast('خطا: '+(e.message||'ناشناخته'),5000)});
window.addEventListener('unhandledrejection',function(e){var m=e.reason&&e.reason.message;if(m)toast('خطا: '+m,5000)});
var MTS=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
var pickMt=function(){return window.MediaRecorder?MTS.filter(function(t){return MediaRecorder.isTypeSupported(t)})[0]:null};
var extOf=function(mt){return mt.indexOf('mp4')>=0?'mp4':'webm'};
var sizeQ=function(){return Q[q$('#q').value]};

/* ============ ذخیره‌ی خودکار (IndexedDB) ============ */
var idb=null;
function idbOpen(){return new Promise(function(res){try{var r=indexedDB.open('slidestudio',1);r.onupgradeneeded=function(){r.result.createObjectStore('k',{keyPath:'id'})};r.onsuccess=function(){res(r.result)};r.onerror=function(){res(null)}}catch(e){res(null)}})}
function idbPut(v){if(!idb)return;try{var t=idb.transaction('k','readwrite');t.objectStore('k').put(v)}catch(e){}}
function idbGet(id){return new Promise(function(res){if(!idb)return res(null);try{var g=idb.transaction('k').objectStore('k').get(id);g.onsuccess=function(){res(g.result||null)};g.onerror=function(){res(null)}}catch(e){res(null)}})}
var svT=0;
window.save=function(){
 clearTimeout(svT);svT=setTimeout(function(){idbPut({id:'deck',D:D,i:i})},700);
 try{localStorage.setItem('deck1',JSON.stringify(D.map(function(z){if(z.pg){var c=Object.assign({},z);delete c.pg;c.im=[];return c}return z})))}
 catch(e){try{localStorage.setItem('deck1',JSON.stringify(D.map(function(z){var c=Object.assign({},z);delete c.pg;c.im=[];return c})))}catch(e2){}}};
idbOpen().then(function(d){idb=d;return idbGet('deck')}).then(function(r){if(r&&r.D&&r.D.length){D=r.D;i=Math.min(r.i||0,D.length-1);ui()}});
document.addEventListener('visibilitychange',function(){if(document.hidden&&idb)idbPut({id:'deck',D:D,i:i})});window.addEventListener('pagehide',function(){if(idb)idbPut({id:'deck',D:D,i:i})});

/* ============ منبع فایل (PPTX / PDF) ============ */
var pdfjs=null;
async function getPdf(){if(!pdfjs){try{pdfjs=await import('./pdf.min.mjs')}catch(e){throw new Error('فایل‌های pdf.min.mjs و pdf.worker.min.mjs باید کنار index.html آپلود شده باشند')}pdfjs.GlobalWorkerOptions.workerSrc='./pdf.worker.min.mjs'}return pdfjs}
var LASTFILE=null;
async function openSource(f){
 var name=f.name||'file',buf=await f.arrayBuffer();
 if(/\.pdf$/i.test(name)||f.type==='application/pdf'){
  var pd=await getPdf(),doc=await pd.getDocument({data:new Uint8Array(buf)}).promise;
  return{kind:'pdf',doc:doc,n:doc.numPages,name:name,hidden:[],OPS:pd.OPS,
   render:async function(k,c,w){var pg=await doc.getPage(k+1),v0=pg.getViewport({scale:1}),v=pg.getViewport({scale:w/v0.width});c.width=Math.round(v.width);c.height=Math.round(v.height);var g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);await pg.render({canvasContext:g,viewport:v}).promise},
   ratio:async function(){var p=await doc.getPage(1),v=p.getViewport({scale:1});return v.height/v.width},
   text:async function(k){var pg=await doc.getPage(k+1),tc=await pg.getTextContent();var items=tc.items.filter(function(t){return t.str&&t.str.trim()}).map(function(t){return{s:t.str,x:t.transform[4],y:t.transform[5]}}).sort(function(a,b){return b.y-a.y||a.x-b.x}),lines=[];
    items.forEach(function(it){var l=lines[lines.length-1];if(l&&Math.abs(l.y-it.y)<4)l.a.push(it);else lines.push({y:it.y,a:[it]})});
    return lines.map(function(l){var rtl=/[؀-ۿ]/.test(l.a.map(function(t){return t.s}).join(''));l.a.sort(function(p,q){return rtl?q.x-p.x:p.x-q.x});return l.a.map(function(t){return t.s}).join(' ')}).join('\n').normalize('NFKC')}}}
 if(/\.(pptx|ppsx)$/i.test(name)){
  if(!window.PPTX||typeof JSZip=='undefined')throw new Error('فایل pptx.js و jszip.min.js باید کنار index.html باشند');
  var d=await PPTX.load(buf);if(!d.slides.length)throw new Error('این فایل اسلایدی ندارد');
  return{kind:'pptx',deck:d,n:d.slides.length,name:name,hidden:d.slides.map(function(s){return s.hidden}),
   render:function(k,c,w){return d.render(k,c,w)},ratio:async function(){return d.h/d.w},text:async function(k){return d.text(k)}}}
 throw new Error('این قالب پشتیبانی نمی‌شود. فایل را روی pptx یا PDF ذخیره کن.')}

/* ============ ورود فایل ============ */
window.importFile=async function(f){
 var name=f.name||'';LASTFILE=f;
 if(/\.pdf$/i.test(name)||f.type==='application/pdf'){return importImages(f)}
 if(/\.(pptx|ppsx)$/i.test(name)){
  var o=modal('<b>ورود «'+esc(name)+'»</b><button class="p" id="m1">🖼 ظاهر دقیق (هر اسلاید یک تصویر، دقیقاً مثل اصل) — پیشنهادی</button><button id="m2">✏️ قابل‌ویرایش (متن و عکس‌ها وارد می‌شود، ظاهر ساده)</button><button id="mx">انصراف</button>');
  q$('#mx',o).onclick=function(){o.remove()};
  q$('#m1',o).onclick=function(){o.remove();importImages(f)};
  q$('#m2',o).onclick=function(){o.remove();impEdit(f)};
  return}
 alert('این قالب پشتیبانی نمی‌شود. فایل را در پاورپوینت روی «ذخیره با نام ← pptx» یا PDF بگذار.')};
async function importImages(f){
 busy('در حال باز کردن فایل…');
 try{
  var s=await openSource(f),out=[],c=document.createElement('canvas'),t=document.createElement('canvas');c.width=1600;c.height=900;var g=c.getContext('2d');
  var ratio=await s.ratio(),w=ratio<=9/16?1600:Math.round(900/ratio);
  for(var k=0;k<s.n;k++){
   if(s.hidden[k])continue;busy('در حال خواندن صفحه‌ها… '+fa(k+1)+' از '+fa(s.n));await wait(0);
   try{await s.render(k,t,Math.max(w,1000))}catch(e){continue}
   g.fillStyle='#fff';g.fillRect(0,0,1600,900);var sc=Math.min(1600/t.width,900/t.height),dw=t.width*sc,dh=t.height*sc;g.drawImage(t,(1600-dw)/2,(900-dh)/2,dw,dh);
   var txt='';try{txt=(await s.text(k)).trim()}catch(e){}
   var z=mk((txt.split('\n')[0]||'').slice(0,60)||('صفحه '+fa(k+1)),'');z.k='img';z.pg=c.toDataURL('image/jpeg',.86);z.txt=txt;out.push(z)}
  if(!out.length)throw new Error('صفحه‌ای خوانده نشد');
  D=out;i=0;ui();busy();toast('وارد شد: '+fa(out.length)+' صفحه — با دکمه‌ی ● ضبط کن')
 }catch(e){busy();alert('ورود فایل ممکن نشد: '+(e.message||e))}}

/* ============ لایه‌ی روی بوم: قلم، لمس، لیزر، اعتبار تصویر، محو شدن اسلاید ============ */
var PGI=new WeakMap();
window.drawPg=function(Z){var e=PGI.get(Z);if(!e||e.s!==Z.pg){var im=new Image();im.onload=function(){dirty=true};im.src=Z.pg;e={im:im,s:Z.pg};PGI.set(Z,e)}
 if(e.im.complete&&e.im.naturalWidth)X.drawImage(e.im,0,0,1280,720)};
var TL={tool:'none',color:'#e0332b',w:6},INK={},ptrs=new Map(),taps=[],live=null,TR=null,BUSYREC=false;
var VO=null;
var inkKey=function(){return VO?'vo':i};
window.needFrame=function(){var n=performance.now();taps=taps.filter(function(t){return n-t.t<700});return ptrs.size>0||taps.length>0||!!TR||BUSYREC||(VO&&!VO.v.paused)};
window.VOD=function(){if(!VO)return false;var v=VO.v;X.fillStyle='#000';X.fillRect(0,0,1280,720);
 if(v.readyState>=2&&v.videoWidth){var s=Math.min(1280/v.videoWidth,720/v.videoHeight),w=v.videoWidth*s,h=v.videoHeight*s;X.drawImage(v,(1280-w)/2,(720-h)/2,w,h)}return true};
window.ovl=function(){
 var Z=cur(),n=performance.now();
 if(!VO&&Z.cr){X.save();X.font='15px Tahoma,sans-serif';X.fillStyle='rgba(110,110,110,.95)';X.textAlign='right';X.textBaseline='bottom';X.direction='ltr';X.fillText('Image: '+Z.cr,1240,714,900);X.restore()}
 var L=INK[inkKey()]||[];
 X.save();X.lineCap='round';X.lineJoin='round';
 L.concat(live&&live.p.length?[live]:[]).forEach(function(s){X.strokeStyle=s.c;X.lineWidth=s.w;X.beginPath();s.p.forEach(function(p,j){j?X.lineTo(p[0],p[1]):X.moveTo(p[0],p[1])});if(s.p.length==1)X.lineTo(s.p[0][0]+.1,s.p[0][1]);X.stroke()});
 if(TL.tool=='touch'||TL.tool=='laser'){
  taps.forEach(function(t){var a=(n-t.t)/700;if(a>=1)return;X.strokeStyle='rgba(255,255,255,'+(.8*(1-a))+')';X.lineWidth=5;X.beginPath();X.arc(t.x,t.y,24+a*40,0,7);X.stroke()});
  ptrs.forEach(function(o){
   if(TL.tool=='laser'){var gr=X.createRadialGradient(o.x,o.y,0,o.x,o.y,34);gr.addColorStop(0,'rgba(255,60,60,.95)');gr.addColorStop(.35,'rgba(255,40,40,.5)');gr.addColorStop(1,'rgba(255,0,0,0)');X.fillStyle=gr;X.beginPath();X.arc(o.x,o.y,34,0,7);X.fill();X.fillStyle='#fff';X.beginPath();X.arc(o.x,o.y,5,0,7);X.fill();return}
   if(o.tr.length>1)for(var j=1;j<o.tr.length;j++){var a=o.tr[j-1],b=o.tr[j],al=Math.max(0,1-(n-b.t)/450);X.strokeStyle='rgba(255,255,255,'+(.45*al)+')';X.lineWidth=22*al+2;X.beginPath();X.moveTo(a.x,a.y);X.lineTo(b.x,b.y);X.stroke()}
   X.fillStyle='rgba(255,255,255,.38)';X.strokeStyle='rgba(255,255,255,.95)';X.lineWidth=4;X.beginPath();X.arc(o.x,o.y,26,0,7);X.fill();X.stroke();X.strokeStyle='rgba(0,0,0,.35)';X.lineWidth=1.5;X.beginPath();X.arc(o.x,o.y,28,0,7);X.stroke()})}
 X.restore();
 if(TR){var t=(n-TR.t0)/TR.d;if(t>=1)TR=null;else{X.save();X.setTransform(1,0,0,1,0,0);X.globalAlpha=1-t;X.drawImage(TR.img,0,0,cv.width,cv.height);X.restore()}}};
function cpt(e){var r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*1280,y:(e.clientY-r.top)/r.height*720}}
cv.addEventListener('pointerdown',function(e){if(TL.tool=='none')return;e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(x){}
 var p=cpt(e),n=performance.now();
 if(TL.tool=='pen')live={c:TL.color,w:TL.w,p:[[p.x,p.y]],id:e.pointerId};
 else{ptrs.set(e.pointerId,{x:p.x,y:p.y,tr:[{x:p.x,y:p.y,t:n}]});if(TL.tool=='touch')taps.push({x:p.x,y:p.y,t:n})}
 dirty=true},true);
cv.addEventListener('pointermove',function(e){if(TL.tool=='none')return;var p=cpt(e),n=performance.now();
 if(live&&live.id===e.pointerId){var ev=e.getCoalescedEvents?e.getCoalescedEvents():[e];ev.forEach(function(q){var pp=cpt(q);live.p.push([pp.x,pp.y])});dirty=true;return}
 var o=ptrs.get(e.pointerId);if(!o)return;o.x=p.x;o.y=p.y;o.tr.push({x:p.x,y:p.y,t:n});while(o.tr.length&&n-o.tr[0].t>450)o.tr.shift();dirty=true},true);
function pUp(e){if(live&&live.id===e.pointerId){var k=inkKey();(INK[k]=INK[k]||[]).push({c:live.c,w:live.w,p:live.p});live=null;dirty=true}
 if(ptrs.delete(e.pointerId))dirty=true}
cv.addEventListener('pointerup',pUp,true);cv.addEventListener('pointercancel',pUp,true);
cv.addEventListener('touchmove',function(e){if(TL.tool!='none')e.preventDefault()},{passive:false});
function buildTools(){var b=q$('#tl');b.innerHTML='<span style="font-size:13px;opacity:.8">ابزار حین ضبط:</span>'+
 [['none','🖐 بدون ابزار'],['pen','✎ قلم'],['touch','👆 فقط نشان‌دادن لمس'],['laser','🔴 لیزر']].map(function(a){return'<button data-t="'+a[0]+'">'+a[1]+'</button>'}).join('')+
 '<input type="color" id="tcol" value="'+TL.color+'"><select id="tw"><option value="3">نازک</option><option value="6" selected>متوسط</option><option value="12">ضخیم</option></select><button id="tun">↶</button><button id="tcl">🧹 پاک‌کردن خط‌های این اسلاید</button>';
 function sync(){b.querySelectorAll('[data-t]').forEach(function(x){x.classList.toggle('on',x.dataset.t==TL.tool)});cv.style.touchAction=TL.tool=='none'?'':'none';cv.style.cursor=TL.tool=='none'?'':'crosshair'}
 b.onclick=function(e){var t=e.target.closest('[data-t]');if(t){TL.tool=t.dataset.t;sync();dirty=true}};
 q$('#tcol').oninput=function(e){TL.color=e.target.value};q$('#tw').onchange=function(e){TL.w=+e.target.value};
 q$('#tun').onclick=function(){var l=INK[inkKey()];if(l&&l.length){l.pop();dirty=true}};
 q$('#tcl').onclick=function(){INK[inkKey()]=[];dirty=true};sync()}
buildTools();
var _ui=window.ui;

/* ============ صدا: زنجیره‌ی تمیزکردن میکروفون ============ */
var AS={ns:1,fx:1,gain:1.8,cd:1,mv:20,mfade:1,keep:0};
try{Object.assign(AS,JSON.parse(localStorage.ss_as||'{}'))}catch(e){}
AS.music=null;
function saveAS(){try{var c=Object.assign({},AS);delete c.music;localStorage.ss_as=JSON.stringify(c)}catch(e){}}
var AC=window.AudioContext||window.webkitAudioContext;
async function buildMic(o){
 var s;
 try{s=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:!!o.ns,autoGainControl:false,channelCount:1,sampleRate:48000}})}
 catch(e){try{s=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e2){throw new Error('دسترسی به میکروفون ممکن نشد. اجازه‌ی میکروفون را در تنظیمات مرورگر بده.')}}
 var ac;try{ac=new AC({sampleRate:48000})}catch(e){ac=new AC()}
 try{await ac.resume()}catch(e){}
 var src=ac.createMediaStreamSource(s),dst=ac.createMediaStreamDestination(),an=ac.createAnalyser();an.fftSize=1024;
 var bq=function(t,f,g,Q){var b=ac.createBiquadFilter();b.type=t;b.frequency.value=f;if(g!=null)b.gain.value=g;if(Q)b.Q.value=Q;return b};
 var last=src;
 if(o.fx){
  var nodes=[bq('highpass',85),bq('peaking',260,-2.5,.9),bq('peaking',3200,2.5,.9),bq('peaking',6800,-3,1.4),bq('highshelf',10000,-2)];
  var c1=ac.createDynamicsCompressor();[['threshold',-30],['knee',24],['ratio',6],['attack',.006],['release',.22]].forEach(function(a){c1[a[0]].value=a[1]});
  var g=ac.createGain();g.gain.value=o.gain;
  var c2=ac.createDynamicsCompressor();[['threshold',-5],['knee',0],['ratio',20],['attack',.001],['release',.08]].forEach(function(a){c2[a[0]].value=a[1]});
  nodes.push(c1,g,c2);nodes.forEach(function(nd){last.connect(nd);last=nd})}
 else{var g2=ac.createGain();g2.gain.value=Math.min(o.gain,1.5);last.connect(g2);last=g2}
 last.connect(dst);last.connect(an);
 return{st:s,ac:ac,dst:dst,an:an,level:function(){var d=new Uint8Array(an.fftSize);an.getByteTimeDomainData(d);var m=0;for(var k=0;k<d.length;k++){var v=Math.abs(d[k]-128)/128;if(v>m)m=v}return m},
  close:function(){try{s.getTracks().forEach(function(t){t.stop()})}catch(e){}try{ac.close()}catch(e){}}}}
var BARS='▁▂▃▄▅▆▇█';
var lvlTxt=function(l){return BARS[Math.min(7,Math.floor(Math.sqrt(l)*8))]};
function audioDlg(){
 var o=modal('<b>🎙 تنظیمات صدا</b>'+
 '<label class="k"><input type="checkbox" id="a1"> نویزگیر (حذف صدای محیط و فن) </label>'+
 '<label class="k"><input type="checkbox" id="a2"> صاف و واضح‌کردن صدا (فیلتر، فشرده‌ساز، محدودکننده)</label>'+
 '<label>بلندی صدای من: <span id="a3v"></span><input type="range" id="a3" min="1" max="3.5" step="0.1" style="width:100%"></label>'+
 '<label class="k"><input type="checkbox" id="a4"> شمارش معکوس ۳-۲-۱ قبل از شروع</label>'+
 '<div class="rw"><button id="a5">🎤 تست میکروفون</button><span id="a6" style="font-size:22px;letter-spacing:2px;direction:ltr"></span></div><small id="a7">با «تست» چند جمله حرف بزن؛ نوار باید بیشتر وقت‌ها وسط باشد، نه پر و نه خالی.</small>'+
 '<hr style="width:100%;border:0;border-top:1px solid var(--line)"><b>🎵 آهنگ پس‌زمینه‌ی ضبط (اختیاری)</b>'+
 '<label class="btn">🎵 <span id="a8">'+(AS.music?esc(AS.music.name):'انتخاب آهنگ')+'</span><input type="file" id="a9" accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac" hidden></label>'+
 '<label>بلندی آهنگ: <input type="range" id="a10" min="3" max="60" style="width:100%"></label>'+
 '<label class="k"><input type="checkbox" id="a11"> در انتها آرام کم شود (۳ ثانیه)</label><button id="a12" style="display:none">حذف آهنگ</button>'+
 '<button class="p" id="a13">تأیید</button>');
 var s=function(x){return q$(x,o)};s('#a1').checked=!!AS.ns;s('#a2').checked=!!AS.fx;s('#a3').value=AS.gain;s('#a3v').textContent=AS.gain;s('#a4').checked=!!AS.cd;s('#a10').value=AS.mv;s('#a11').checked=!!AS.mfade;
 if(AS.music)s('#a12').style.display='';
 var mic=null,tm=null;
 function stopT(){clearInterval(tm);if(mic){mic.close();mic=null}s('#a5').textContent='🎤 تست میکروفون';s('#a6').textContent=''}
 s('#a3').oninput=function(){s('#a3v').textContent=s('#a3').value};
 s('#a5').onclick=async function(){if(mic){stopT();return}
  try{mic=await buildMic({ns:s('#a1').checked,fx:s('#a2').checked,gain:+s('#a3').value});s('#a5').textContent='■ توقف تست';var pk=0,mx=0;
   tm=setInterval(function(){var l=mic.level();pk=Math.max(l,pk*.9);mx=Math.max(mx,l);s('#a6').textContent=Array(6).join(lvlTxt(pk)).slice(0,5)+' '+Math.round(pk*100)+'٪';s('#a7').textContent=mx>.97?'⚠ صدا زیاد بلند است؛ «بلندی صدا» را کم کن یا کمی عقب‌تر بنشین':mx<.12?'صدا خیلی کم است؛ نزدیک‌تر به میکروفون حرف بزن یا بلندی صدا را زیاد کن':'✅ بلندی خوب است'},100)}catch(e){alert(e.message)}};
 s('#a9').onchange=function(e){var f=e.target.files[0];if(f){AS.music=f;s('#a8').textContent=f.name;s('#a12').style.display=''}};
 s('#a12').onclick=function(){AS.music=null;s('#a8').textContent='انتخاب آهنگ';s('#a12').style.display='none'};
 s('#a13').onclick=function(){stopT();AS.ns=s('#a1').checked?1:0;AS.fx=s('#a2').checked?1:0;AS.gain=+s('#a3').value;AS.cd=s('#a4').checked?1:0;AS.mv=+s('#a10').value;AS.mfade=s('#a11').checked?1:0;saveAS();o.remove();toast('تنظیمات صدا ذخیره شد')}}
q$('#as').onclick=audioDlg;

/* ============ ضبط ============ */
var chunks=[],rtm=null,curMic=null,recT0=0,recAcc=0;
var lastClip=null;
function showOut(bl,ext){
 lastClip=bl;var u=URL.createObjectURL(bl);
 q$('#out').innerHTML='<video controls playsinline src="'+u+'"></video><div class="bar"><button id="sv2" class="p">💾 ذخیره '+ext.toUpperCase()+' ('+(bl.size/1048576).toFixed(1)+' MB)</button><button id="om">🎵 آهنگ/صدا روی این کلیپ…</button></div>'+(ext=='webm'?'<p>این مرورگر mp4 نمی‌دهد و خروجی webm شد؛ برای mp4 از Chrome یا Safari جدید استفاده کن.</p>':'');
 q$('#sv2').onclick=function(){saveBlob(bl,'presentation-'+Date.now()+'.'+ext)};q$('#om').onclick=toolsMenu}
async function countdown(){var c=q$('#cdn');if(!c){c=document.createElement('div');c.id='cdn';document.body.appendChild(c)}c.style.display='flex';for(var n=3;n>0;n--){c.textContent=fa(n);await wait(800)}c.style.display='none'}
async function studioRec(){
 if(BUSYREC){if(BUSYREC.cancel)BUSYREC.cancel();return}
 if(Rc){Rc.stop();return}
 var mt=pickMt();if(!mt){alert('این مرورگر ضبط ویدیو را پشتیبانی نمی‌کند. از Chrome یا Safari جدید استفاده کن.');return}
 var mic;try{mic=await buildMic(AS)}catch(e){alert(e.message);return}
 curMic=mic;var ac=mic.ac,ms=null,mg=null,okOrig=false;
 if(AS.music){try{var buf=await ac.decodeAudioData(await AS.music.arrayBuffer());mg=ac.createGain();mg.gain.value=0;ms=ac.createBufferSource();ms.buffer=buf;ms.loop=true;ms.connect(mg);mg.connect(mic.dst)}catch(e){toast('آهنگ خوانده نشد؛ بدون آهنگ ضبط می‌شود');ms=null}}
 if(VO&&VO.keep&&!VO.node){try{VO.node=ac.createMediaElementSource(VO.v);VO.node.connect(mic.dst);okOrig=true}catch(e){}}
 var qq=sizeQ();size();draw();
 if(AS.cd){await countdown()}
 var stm=cv.captureStream(qq.fps);stm.addTrack(mic.dst.stream.getAudioTracks()[0]);
 chunks=[];var r;
 try{r=new MediaRecorder(stm,{mimeType:mt,videoBitsPerSecond:qq.b,audioBitsPerSecond:128000})}catch(e){r=new MediaRecorder(stm)}
 r.ondataavailable=function(e){if(e.data&&e.data.size)chunks.push(e.data)};
 r.onstop=function(){clearInterval(rtm);try{ms&&ms.stop()}catch(e){}mic.close();curMic=null;Rc=null;
  if(VO){try{VO.v.pause()}catch(e){}}
  var ext=extOf(mt),bl=new Blob(chunks,{type:'video/'+ext});showOut(bl,ext);
  q$('#rec').textContent='● شروع ضبط';q$('#rec').className='p';q$('#tm').textContent='';q$('#ps2').hidden=true;
  if(VO)voUpdate();toast('ضبط تمام شد؛ ذخیره‌اش کن')};
 if(!VO){i=0;ui()}
 Rc=r;r.start(1000);recT0=Date.now();recAcc=0;
 if(ms){var n=ac.currentTime,vol=AS.mv/100;mg.gain.setValueAtTime(0,n);mg.gain.linearRampToValueAtTime(vol,n+1);
  if(VO&&VO.auto&&isFinite(VO.dur)&&AS.mfade){var rem=VO.dur-VO.v.currentTime;if(rem>6){mg.gain.setValueAtTime(vol,n+rem-3);mg.gain.linearRampToValueAtTime(0,n+rem)}}
  ms.start()}
 if(VO){var v=VO.v;if(VO.auto){if(v.ended||v.currentTime>=VO.dur-.05)v.currentTime=0;v.muted=!okOrig;v.play().catch(function(){})}}
 q$('#rec').textContent='■ توقف ضبط';q$('#rec').className='r';var pb=q$('#ps2');pb.hidden=false;pb.textContent='⏸ مکث';
 rtm=setInterval(function(){if(r.state=='recording')q$('#tm').textContent='🔴 '+mmss(recAcc+(Date.now()-recT0)/1000)+'  '+lvlTxt(mic.level())},200);
 try{navigator.wakeLock&&navigator.wakeLock.request('screen').catch(function(){})}catch(e){}
 if(mg)Rc.__mg=mg}
q$('#rec').onclick=studioRec;
q$('#ps2').onclick=function(){if(!Rc)return;var pb=q$('#ps2');
 if(Rc.state=='recording'){Rc.pause();curMic&&curMic.ac.suspend();VO&&VO.v.pause();recAcc+=(Date.now()-recT0)/1000;pb.textContent='▶ ادامه'}
 else{Rc.resume();curMic&&curMic.ac.resume();if(VO&&VO.auto)VO.v.play().catch(function(){});recT0=Date.now();pb.textContent='⏸ مکث'}};

/* ============ کلیپ خودکار (بی‌صدا یا با آهنگ) ============ */
function autoDlg(){
 if(Rc||BUSYREC){toast('اول ضبط جاری را تمام کن');return}
 var o=modal('<b>🎞 ساخت کلیپ خودکار از اسلایدها</b><small>برنامه اسلایدها را خودش یکی‌یکی نشان می‌دهد و فیلم می‌گیرد (بدون صدا یا با آهنگ پس‌زمینه). هنگام ساخت صفحه را باز نگه دار.</small>'+
 '<label>هر اسلاید چند ثانیه بماند؟ <input type="number" id="g1" value="6" min="1" max="120" style="width:80px"></label>'+
 '<label class="k"><input type="checkbox" id="g2"> زمان را از روی مقدار متن تنظیم کن (متن بیشتر = زمان بیشتر)</label>'+
 '<label class="k"><input type="checkbox" id="g3" checked> محوشدن نرم بین اسلایدها</label>'+
 '<label class="btn">🎵 <span id="g4">آهنگ پس‌زمینه (اختیاری)</span><input type="file" id="g5" accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac" hidden></label>'+
 '<label>بلندی آهنگ: <input type="range" id="g6" min="5" max="100" value="30" style="width:100%"></label>'+
 '<div id="g7" style="min-height:22px"></div><div class="rw"><button class="p" id="g8">▶ شروع</button><button id="g9">بستن</button></div>');
 var s=function(x){return q$(x,o)},mus=null,job=null;
 s('#g5').onchange=function(e){var f=e.target.files[0];if(f){mus=f;s('#g4').textContent=f.name}};
 s('#g9').onclick=function(){if(job)job.cancel();o.remove()};
 s('#g8').onclick=async function(){if(job)return;s('#g8').disabled=true;
  job=autoClip({sec:+s('#g1').value||6,auto:s('#g2').checked,fade:s('#g3').checked?.5:0,music:mus,vol:s('#g6').value/100,say:function(t){s('#g7').textContent=t}});
  try{await job.done;s('#g7').textContent='✅ تمام شد'}catch(e){s('#g7').textContent=e.message||'ناموفق بود'}job=null;s('#g8').disabled=false}}
function autoClip(o){
 var cancelled=false;
 var done=(async function(){
  var mt=pickMt();if(!mt)throw new Error('این مرورگر ضبط ویدیو را پشتیبانی نمی‌کند');
  var ac=null,dst=null,buf=null;
  if(o.music){ac=new AC();try{await ac.resume()}catch(e){}try{buf=await ac.decodeAudioData(await o.music.arrayBuffer())}catch(e){ac.close();throw new Error('این فایل آهنگ خوانده نشد؛ mp3 یا m4a امتحان کن')}dst=ac.createMediaStreamDestination()}
  var qq=sizeQ();size();var save=i,stm=cv.captureStream(qq.fps);if(dst)stm.addTrack(dst.stream.getAudioTracks()[0]);
  var mt2=dst?mt:mt.replace(/,mp4a[^;]*/,'').replace(/,opus/,'');
  var ch=[],r;try{r=new MediaRecorder(stm,{mimeType:mt2,videoBitsPerSecond:qq.b,audioBitsPerSecond:128000})}catch(e){r=new MediaRecorder(stm)}
  r.ondataavailable=function(e){e.data&&e.data.size&&ch.push(e.data)};var stopped=new Promise(function(res){r.onstop=res});
  var durs=D.map(function(z){if(!o.auto)return o.sec;var t=((z.t||'')+' '+(z.b||'')+' '+(z.txt||'')).trim().split(/\s+/).length;return Math.max(3,Math.min(40,3+t*.45))});
  var total=durs.reduce(function(a,b){return a+b},0);
  BUSYREC={cancel:function(){cancelled=true}};
  try{navigator.wakeLock&&navigator.wakeLock.request('screen').catch(function(){})}catch(e){}
  i=0;thumbs();dirty=true;draw();await wait(150);r.start(1000);
  var mg=null,ms=null;
  if(ac){ms=ac.createBufferSource();ms.buffer=buf;ms.loop=true;mg=ac.createGain();ms.connect(mg);mg.connect(dst);var n0=ac.currentTime;mg.gain.setValueAtTime(0,n0);mg.gain.linearRampToValueAtTime(o.vol,n0+1);
   var fd=Math.min(3,durs[durs.length-1]);mg.gain.setValueAtTime(o.vol,n0+total-fd);mg.gain.linearRampToValueAtTime(0,n0+total);ms.start()}
  var tAll=performance.now();
  for(var k=0;k<D.length&&!cancelled;k++){
   if(k>0){if(o.fade){var sn=document.createElement('canvas');sn.width=cv.width;sn.height=cv.height;sn.getContext('2d').drawImage(cv,0,0);TR={img:sn,t0:performance.now(),d:o.fade*1000}}i=k;thumbs();dirty=true}
   var t0=performance.now();
   while(!cancelled&&(performance.now()-t0)/1000<durs[k]){o.say('در حال ساخت… اسلاید '+fa(k+1)+' از '+fa(D.length)+' — '+fa(Math.round((performance.now()-tAll)/1000))+' از '+fa(Math.round(total))+' ثانیه — صفحه را باز نگه دار');await raf()}}
  dirty=true;await raf();await raf();r.stop();await stopped;try{ms&&ms.stop()}catch(e){}ac&&ac.close();BUSYREC=false;TR=null;i=save;ui();
  if(cancelled)throw new Error('لغو شد');
  var ext=extOf(mt2),bl=new Blob(ch,{type:'video/'+ext});showOut(bl,ext);saveBlob(bl,'clip-'+Date.now()+'.'+ext)})();
 done.catch(function(){BUSYREC=false;TR=null});
 return{done:done,cancel:function(){cancelled=true}}}

/* ============ صدا (و آهنگ) روی کلیپ آماده ============ */
function voUpdate(){
 var b=q$('#vob');
 if(!VO){if(b)b.remove();return}
 if(!b){b=document.createElement('div');b.id='vob';b.className='bar';b.innerHTML='<b>🎬 کلیپ آماده:</b><button id="vp1">▶</button><input type="range" id="vs1" min="0" max="1000" value="0" style="flex:1;min-width:120px"><span id="vt1"></span><button id="vx1">✖ بستن کلیپ</button>';q$('#tl').after(b);
  q$('#vp1').onclick=function(){VO.v.paused?VO.v.play():VO.v.pause()};
  q$('#vs1').oninput=function(e){VO.v.currentTime=e.target.value/1000*VO.dur;dirty=true};
  q$('#vx1').onclick=voClose;
  VO.v.addEventListener('timeupdate',voUpdate);VO.v.addEventListener('play',voUpdate);VO.v.addEventListener('pause',voUpdate)}
 q$('#vp1').textContent=VO.v.paused?'▶':'⏸';q$('#vs1').value=VO.dur?VO.v.currentTime/VO.dur*1000:0;q$('#vt1').textContent=mmss(VO.v.currentTime)+' / '+mmss(VO.dur);dirty=true}
function voClose(){if(Rc){toast('اول ضبط را تمام کن');return}if(!VO)return;try{VO.v.pause()}catch(e){}URL.revokeObjectURL(VO.url);delete INK.vo;VO=null;voUpdate();dirty=true;toast('به اسلایدها برگشتی')}
async function voOpen(clip,o){
 busy('در حال باز کردن کلیپ…');
 var v=document.createElement('video');v.playsInline=true;v.muted=true;v.preload='auto';var url=URL.createObjectURL(clip);v.src=url;
 try{
  await new Promise(function(res,rej){v.onloadedmetadata=res;v.onerror=function(){rej(new Error('x'))}});
  if(!isFinite(v.duration)){v.currentTime=1e7;await new Promise(function(r){v.addEventListener('seeked',r,{once:true})})}
  var dur=v.duration;v.currentTime=.01;await new Promise(function(r){v.addEventListener('seeked',r,{once:true})});
  if(VO)voClose();
  VO={v:v,url:url,dur:dur,auto:o.auto,stopAuto:o.stop,keep:o.keep};
  if(o.music)AS.music=o.music;if(o.vol)AS.mv=o.vol;
  v.onended=function(){voUpdate();if(Rc&&VO&&VO.stopAuto)setTimeout(function(){Rc&&Rc.stop()},500)};
  size();voUpdate();busy();toast('کلیپ آماده است؛ دکمه‌ی ● را بزن و صحبت کن');dirty=true;
 }catch(e){busy();URL.revokeObjectURL(url);alert('این کلیپ در مرورگر باز نشد.')}}
function voDlg(){
 if(Rc||BUSYREC){toast('اول ضبط جاری را تمام کن');return}
 var o=modal('<b>🎙 صدا (و آهنگ) روی یک کلیپ آماده</b>'+
 '<label class="btn">🎬 <span id="v1">'+(lastClip?'آخرین کلیپ ساخته‌شده (برای تغییر بزن)':'انتخاب کلیپ')+'</span><input type="file" id="v2" accept="video/*" hidden></label>'+
 '<label class="btn">🎵 <span id="v3">'+(AS.music?esc(AS.music.name):'آهنگ پس‌زمینه (اختیاری)')+'</span><input type="file" id="v4" accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac" hidden></label>'+
 '<label>بلندی آهنگ: <input type="range" id="v5" min="3" max="60" style="width:100%"></label>'+
 '<label class="k"><input type="checkbox" id="v6" checked> با شروع ضبط، کلیپ خودکار پخش شود</label>'+
 '<label class="k"><input type="checkbox" id="v7" checked> با تمام‌شدن کلیپ، ضبط هم تمام شود</label>'+
 '<label class="k"><input type="checkbox" id="v8"> صدای اصلی خود کلیپ هم نگه داشته شود</label>'+
 '<small>بعد از «آماده‌سازی»، کلیپ روی صفحه می‌آید. با ابزارهای زیر بوم (قلم، لمس، لیزر) روی آن توضیح بده. هر وقت خواستی ● را بزن تا کلیپ شروع شود و صدایت (با آهنگ) ضبط شود.</small>'+
 '<div class="rw"><button class="p" id="v9">آماده‌سازی</button><button id="v10">بستن</button></div>');
 var s=function(x){return q$(x,o)},clip=lastClip,mus=AS.music;s('#v5').value=AS.mv;
 s('#v2').onchange=function(e){var f=e.target.files[0];if(f){clip=f;s('#v1').textContent=f.name}};
 s('#v4').onchange=function(e){var f=e.target.files[0];if(f){mus=f;s('#v3').textContent=f.name}};
 s('#v10').onclick=function(){o.remove()};
 s('#v9').onclick=async function(){if(!clip){toast('اول کلیپ را انتخاب کن');return}var op={music:mus,vol:+s('#v5').value,auto:s('#v6').checked,stop:s('#v7').checked,keep:s('#v8').checked};o.remove();await voOpen(clip,op)}}

/* ============ فقط آهنگ روی کلیپ آماده (بازضبط) ============ */
async function mixClip(clip,mus,vol,fade,say){
 var v=document.createElement('video');v.playsInline=true;v.preload='auto';var url=URL.createObjectURL(clip);v.src=url;
 await new Promise(function(res,rej){v.onloadedmetadata=res;v.onerror=function(){rej(new Error('این کلیپ باز نشد'))}});
 if(!isFinite(v.duration)){v.currentTime=1e7;await new Promise(function(r){v.addEventListener('seeked',r,{once:true})});v.currentTime=0;await new Promise(function(r){v.addEventListener('seeked',r,{once:true})})}
 var dur=v.duration,sc=Math.min(1,1280/v.videoWidth),w=Math.round(v.videoWidth*sc/2)*2,h=Math.round(v.videoHeight*sc/2)*2;
 var c=document.createElement('canvas');c.width=w;c.height=h;var x=c.getContext('2d');
 var ac=new AC();try{await ac.resume()}catch(e){}
 var buf;try{buf=await ac.decodeAudioData(await mus.arrayBuffer())}catch(e){ac.close();throw new Error('این فایل آهنگ خوانده نشد؛ mp3 یا m4a امتحان کن')}
 var dst=ac.createMediaStreamDestination(),ms0=null;try{ms0=ac.createMediaElementSource(v);ms0.connect(dst)}catch(e){}
 var mg=ac.createGain(),ms=ac.createBufferSource();ms.buffer=buf;ms.loop=true;ms.connect(mg);mg.connect(dst);
 var mt=pickMt(),stm=c.captureStream(30);stm.addTrack(dst.stream.getAudioTracks()[0]);var ch=[];
 var r=new MediaRecorder(stm,{mimeType:mt,videoBitsPerSecond:2500000,audioBitsPerSecond:128000});r.ondataavailable=function(e){e.data&&e.data.size&&ch.push(e.data)};
 var stopped=new Promise(function(res){r.onstop=res}),rf,cancelled=false,endNow=null;
 function frame(){x.drawImage(v,0,0,w,h);say('در حال ساخت… '+mmss(v.currentTime)+(isFinite(dur)?' / '+mmss(dur):'')+' — صفحه را باز نگه دار');rf=requestAnimationFrame(frame)}
 try{navigator.wakeLock&&navigator.wakeLock.request('screen').catch(function(){})}catch(e){}
 r.start(1000);await v.play();ms.start();var n=ac.currentTime;mg.gain.setValueAtTime(0,n);mg.gain.linearRampToValueAtTime(vol,n+1);
 if(fade&&isFinite(dur)&&dur>6){mg.gain.setValueAtTime(vol,n+dur-3);mg.gain.linearRampToValueAtTime(0,n+dur)}
 frame();
 return{cancel:function(){cancelled=true;if(endNow)endNow()},done:(async function(){
  await new Promise(function(res){v.onended=res;endNow=function(){v.pause();res()}});cancelAnimationFrame(rf);r.stop();await stopped;try{ms.stop()}catch(e){}ac.close();URL.revokeObjectURL(url);
  if(cancelled)throw new Error('لغو شد');var ext=extOf(mt),bl=new Blob(ch,{type:'video/'+ext});showOut(bl,ext);saveBlob(bl,'clip-music-'+Date.now()+'.'+ext)})()}}
function musicDlg(){
 if(Rc||BUSYREC){toast('اول ضبط جاری را تمام کن');return}
 var o=modal('<b>🎵 آهنگ پس‌زمینه برای یک کلیپ آماده</b>'+
 '<label class="btn">🎬 <span id="m1">'+(lastClip?'آخرین کلیپ (برای تغییر بزن)':'انتخاب کلیپ')+'</span><input type="file" id="m2" accept="video/*" hidden></label>'+
 '<label class="btn">🎵 <span id="m3">انتخاب آهنگ</span><input type="file" id="m4" accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac" hidden></label>'+
 '<label>بلندی آهنگ: <input type="range" id="m5" min="3" max="100" value="22" style="width:100%"></label>'+
 '<label class="k"><input type="checkbox" id="m6" checked> در ثانیه‌های آخر آرام کم شود</label><small>کلیپ در زمان واقعی دوباره پخش و ضبط می‌شود (صدای خود کلیپ هم می‌ماند). مدت ساخت برابر طول کلیپ است.</small><div id="m7" style="min-height:22px"></div>'+
 '<div class="rw"><button class="p" id="m8">▶ شروع</button><button id="m9">بستن</button></div>');
 var s=function(x){return q$(x,o)},clip=lastClip,mus=null,job=null;
 s('#m2').onchange=function(e){var f=e.target.files[0];if(f){clip=f;s('#m1').textContent=f.name}};s('#m4').onchange=function(e){var f=e.target.files[0];if(f){mus=f;s('#m3').textContent=f.name}};
 s('#m9').onclick=function(){if(job)job.cancel();o.remove()};
 s('#m8').onclick=async function(){if(job)return;if(!clip||!mus){s('#m7').textContent='اول کلیپ و آهنگ را انتخاب کن';return}s('#m8').disabled=true;s('#m7').textContent='در حال آماده‌سازی…';
  try{job=await mixClip(clip,mus,s('#m5').value/100,s('#m6').checked,function(t){s('#m7').textContent=t});await job.done;s('#m7').textContent='✅ تمام شد و ذخیره شد'}catch(e){s('#m7').textContent=e.message||'ناموفق بود'}job=null;s('#m8').disabled=false}}

/* ============ تنظیمات Claude / تصویرساز ============ */
var AI={};try{AI=JSON.parse(localStorage.ss_ai||'{}')}catch(e){}
function aiDlg(){
 var o=modal('<b>⚙ تنظیمات Claude و تصویرساز (اختیاری)</b><small>کلیدها فقط روی همین دستگاه ذخیره می‌شوند و مستقیم به سرویس مربوط فرستاده می‌شوند. هزینه‌ی استفاده با حساب خودت است. در ایران ممکن است فیلترشکن لازم باشد.</small>'+
 '<label>کلید Claude (برای خلاصه‌نویسی و انتخاب عبارت جستجو)<input type="password" id="k1" dir="ltr" placeholder="sk-ant-..."></label>'+
 '<label>مدل Claude<input type="text" id="k2" dir="ltr" placeholder="claude-sonnet-5-5"></label>'+
 '<hr style="width:100%;border:0;border-top:1px solid var(--line)"><label>آدرس سرویس تصویرساز (سازگار با OpenAI)<input type="text" id="k3" dir="ltr" placeholder="https://api.openai.com/v1"></label>'+
 '<label>کلید تصویرساز<input type="password" id="k4" dir="ltr"></label><label>نام مدل تصویر<input type="text" id="k5" dir="ltr" placeholder="gpt-image-1"></label>'+
 '<div class="rw"><button class="p" id="k6">ذخیره</button><button id="k7">بستن</button></div>');
 var s=function(x){return q$(x,o)};s('#k1').value=AI.ckey||'';s('#k2').value=AI.cmodel||'';s('#k3').value=AI.ibase||'';s('#k4').value=AI.ikey||'';s('#k5').value=AI.imodel||'';
 s('#k7').onclick=function(){o.remove()};
 s('#k6').onclick=function(){AI={ckey:s('#k1').value.trim(),cmodel:s('#k2').value.trim(),ibase:s('#k3').value.trim(),ikey:s('#k4').value.trim(),imodel:s('#k5').value.trim()};try{localStorage.ss_ai=JSON.stringify(AI)}catch(e){}o.remove();toast('ذخیره شد')}}

/* ============ تصویرهای داخل فایل ============ */
function objToCanvas(o){var W=o.width,H=o.height,sc=Math.min(1,1800/Math.max(W,H)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(W*sc));c.height=Math.max(1,Math.round(H*sc));var g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);
 if(o.bitmap){g.drawImage(o.bitmap,0,0,c.width,c.height);return c}
 if(!o.data)return null;var id=new ImageData(W,H),d=id.data,s=o.data;
 if(o.kind===3&&s.length>=W*H*4)d.set(s.subarray(0,W*H*4));
 else if(o.kind===2&&s.length>=W*H*3){for(var a=0,j=0;a<W*H;a++,j+=3){d[a*4]=s[j];d[a*4+1]=s[j+1];d[a*4+2]=s[j+2];d[a*4+3]=255}}
 else if(o.kind===1){var rb=(W+7)>>3;for(var y=0;y<H;y++)for(var x=0;x<W;x++){var v=(s[y*rb+(x>>3)]>>(7-(x&7)))&1?255:0,k=(y*W+x)*4;d[k]=d[k+1]=d[k+2]=v;d[k+3]=255}}
 else return null;
 var t=document.createElement('canvas');t.width=W;t.height=H;t.getContext('2d').putImageData(id,0,0);g.drawImage(t,0,0,c.width,c.height);return c}
async function extractImages(S,add,say,stop){
 if(S.kind==='pptx'){var ms=await S.deck.media(),n=0;for(var a=0;a<ms.length;a++){if(stop())break;var m=ms[a];say('در حال خواندن تصویرها… '+fa(++n)+' از '+fa(ms.length));var bm;try{bm=await createImageBitmap(m.blob)}catch(e){continue}if(bm.width<80||bm.height<80)continue;add({blob:m.blob,w:bm.width,h:bm.height,label:'اسلاید '+m.slides.map(function(x){return fa(x+1)}).join('، ')});await wait(0)}return}
 var OPS=S.OPS,seen={},cnt=0;
 for(var p=1;p<=S.doc.numPages&&!stop();p++){say('در حال جست‌وجوی تصویر… صفحه '+fa(p)+' از '+fa(S.doc.numPages));var pg=await S.doc.getPage(p),ops=await pg.getOperatorList();
  for(var k=0;k<ops.fnArray.length&&!stop();k++){var fn=ops.fnArray[k];if(fn!==OPS.paintImageXObject&&fn!==OPS.paintInlineImageXObject&&fn!==OPS.paintImageXObjectRepeat)continue;
   var ar=ops.argsArray[k],obj;
   if(fn===OPS.paintInlineImageXObject)obj=ar[0];else{var id=ar[0];if(seen[id])continue;seen[id]=1;obj=await new Promise(function(res){var store=String(id).indexOf('g_')==0?pg.commonObjs:pg.objs,ok=false;try{store.get(id,function(v){ok=true;res(v)})}catch(e){res(null)}setTimeout(function(){if(!ok)res(null)},4000)})}
   if(!obj||!(obj.width>=100&&obj.height>=100))continue;var c=objToCanvas(obj);if(!c)continue;
   var blob=await new Promise(function(r){c.toBlob(r,'image/jpeg',.9)});if(!blob)continue;add({blob:blob,w:obj.width,h:obj.height,label:'صفحه '+fa(p)});if(++cnt>=400)return}}}
async function imgDlg(){
 var o=modal('<b>🖼 تصویرهای داخل فایل</b><label class="btn" id="g0l">📂 <span id="g0t">'+(LASTFILE?esc(LASTFILE.name)+' (برای فایل دیگر بزن)':'انتخاب فایل PPTX یا PDF')+'</span><input type="file" id="g0" accept=".pptx,.ppsx,.pdf,application/pdf" hidden></label><div id="gs2" style="font-size:13px"></div><div class="gg" id="gg"></div>'+
 '<div class="rw"><button id="gA">⬇ همه (zip)</button><button id="gS">⬇ انتخاب‌شده‌ها (zip)</button><button class="p" id="gP">📌 روی اسلاید فعلی بگذار</button><button id="gN">➕ هر تصویر یک اسلاید جدید</button><button id="gX">بستن</button></div>',true);
 var s=function(x){return q$(x,o)},sel={},list=[],stop=false,token=0;
 s('#gX').onclick=function(){stop=true;o.remove()};
 function add(it){var k=list.length;list.push(it);var d=document.createElement('div');d.className='it';d.innerHTML='<img src="'+URL.createObjectURL(it.blob)+'"><span>'+it.label+' · '+fa(it.w)+'×'+fa(it.h)+'</span>';d.onclick=function(){if(sel[k]){delete sel[k]}else sel[k]=1;d.classList.toggle('sel',!!sel[k])};s('#gg').appendChild(d)}
 async function load(f){var my=++token;s('#gg').innerHTML='';list=[];sel={};s('#gs2').textContent='در حال باز کردن فایل…';
  try{var S=await openSource(f);await extractImages(S,add,function(t){if(my===token)s('#gs2').textContent=t},function(){return stop||my!==token});
   if(my===token)s('#gs2').textContent=list.length?fa(list.length)+' تصویر پیدا شد. روی هر تصویر بزن تا انتخاب شود.':'تصویری در این فایل پیدا نشد (ممکن است صفحه‌ها فقط عکسِ اسکن‌شده باشند).'}
  catch(e){s('#gs2').textContent='خواندن فایل ناموفق بود: '+(e.message||e)}}
 s('#g0').onchange=function(e){var f=e.target.files[0];if(f){LASTFILE=f;s('#g0t').textContent=f.name;load(f)}};
 var ext=function(b){return b.type.indexOf('png')>=0?'png':b.type.indexOf('gif')>=0?'gif':b.type.indexOf('webp')>=0?'webp':'jpg'};
 async function dl(ids){if(!ids.length){toast('تصویری انتخاب نشده');return}var z=new JSZip();ids.forEach(function(k,j){z.file('image-'+String(j+1).padStart(3,'0')+'.'+ext(list[k].blob),list[k].blob)});saveBlob(await z.generateAsync({type:'blob'}),'images.zip')}
 s('#gA').onclick=function(){dl(list.map(function(_,k){return k}))};s('#gS').onclick=function(){dl(Object.keys(sel).map(Number))};
 s('#gP').onclick=async function(){var ids=Object.keys(sel).map(Number);if(!ids.length){toast('اول یک یا چند تصویر را انتخاب کن');return}
  var Z=cur();if(Z.k==='img'){toast('این اسلاید تصویر کامل صفحه است؛ از «هر تصویر یک اسلاید جدید» استفاده کن');return}
  Z.im=Z.im||[];for(var a=0;a<ids.length;a++){var b=list[ids[a]].blob,u=await fit(b,/png/i.test(b.type));if(u)Z.im.push({u:u})}stop=true;o.remove();ui();toast('تصویر روی اسلاید گذاشته شد')};
 s('#gN').onclick=async function(){var ids=Object.keys(sel).map(Number);if(!ids.length){toast('اول یک یا چند تصویر را انتخاب کن');return}
  for(var a=0;a<ids.length;a++){var b=list[ids[a]].blob,u=await fit(b,/png/i.test(b.type));if(u){var z=mk('تصویر '+fa(a+1),'');z.im=[{u:u}];D.splice(i+1,0,z);i++}}stop=true;o.remove();ui();toast('اسلاید تازه ساخته شد')};
 if(LASTFILE)load(LASTFILE);else s('#gs2').textContent='یک فایل انتخاب کن.'}

/* ============ ویزارد: ارائه‌ی تازه با تصویرهای مرتبط ============ */
async function claudeAsk(system,prompt,maxTok){if(!AI.ckey)throw new Error('کلید Claude تنظیم نشده');
 var r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':AI.ckey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:AI.cmodel||'claude-sonnet-5-5',max_tokens:maxTok||4000,system:system,messages:[{role:'user',content:prompt}]})});
 if(!r.ok)throw new Error('Claude '+r.status+': '+(await r.text()).slice(0,160));var j=await r.json();return(j.content||[]).map(function(c){return c.text||''}).join('')}
function parseJSON(t){var m=t.match(/\[[\s\S]*\]/);return JSON.parse(m?m[0]:t)}
async function wikiSearch(qq,n){var u='https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit='+(n||8)+'&gsrsearch='+encodeURIComponent(qq+' filetype:bitmap')+'&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=800';
 var r=await fetch(u);if(!r.ok)throw new Error('ویکی‌مدیا '+r.status);var j=await r.json(),pages=Object.keys((j.query&&j.query.pages)||{}).map(function(k){return j.query.pages[k]}).sort(function(a,b){return a.index-b.index}),strip=function(s){return String(s||'').replace(/<[^>]*>/g,'').trim()};
 return pages.map(function(p){var ii=p.imageinfo&&p.imageinfo[0];if(!ii||!ii.thumburl)return null;var m=ii.extmetadata||{};return{thumb:ii.thumburl,credit:(strip(m.Artist&&m.Artist.value)||'Wikimedia Commons')+' — '+(strip(m.LicenseShortName&&m.LicenseShortName.value)||'CC')+' — Wikimedia Commons',title:p.title}}).filter(Boolean)}
async function aiImage(prompt){if(!AI.ikey)throw new Error('کلید تصویرساز تنظیم نشده');var base=(AI.ibase||'https://api.openai.com/v1').replace(/\/$/,'');
 var r=await fetch(base+'/images/generations',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+AI.ikey},body:JSON.stringify({model:AI.imodel||'gpt-image-1',prompt:prompt,size:'1024x1024',n:1})});
 if(!r.ok)throw new Error('تصویرساز '+r.status+': '+(await r.text()).slice(0,160));var j=await r.json(),d=j.data&&j.data[0];if(!d)throw new Error('پاسخ تصویرساز خالی بود');
 if(d.b64_json){var bin=atob(d.b64_json),u=new Uint8Array(bin.length);for(var a=0;a<bin.length;a++)u[a]=bin.charCodeAt(a);return new Blob([u],{type:'image/png'})}
 if(d.url)return await(await fetch(d.url)).blob();throw new Error('قالب پاسخ تصویرساز ناشناخته بود')}
async function fetchBlob(u){var r=await fetch(u);if(!r.ok)throw new Error('دانلود تصویر '+r.status);return await r.blob()}
function slideText(Z){return(Z.txt||((Z.t||'')+'\n'+(Z.b||'')+(Z.k!='text'&&Z.d?'\n'+Z.d:''))).trim()}
function offlineSlide(idx,text){var lines=text.split(/\n+/).map(function(s){return s.trim()}).filter(Boolean),title=(lines[0]||'').slice(0,70),rest=lines.slice(1).join(' ');
 var sents=rest.split(/[.؟?!۔]+\s+/).map(function(s){return s.trim()}).filter(function(s){return s.length>12}).slice(0,4).map(function(s){return s.length>130?s.slice(0,127)+'…':s});
 return{idx:idx,title:title,bullets:sents,queries:title?[title]:[],aiPrompt:'Clear educational illustration about: '+title+'. No text in the image.',diagram:false}}
function makeFlow(items){var W=900,H=900,c=document.createElement('canvas');c.width=W;c.height=H;var g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,W,H);
 var cols=['#8b5a2b','#c89560','#a0522d','#d2b48c','#6b4226'],it=items.slice(0,5).map(function(t){return t.length>40?t.slice(0,38)+'…':t}),n=it.length||1,gap=50,bh=(H-80-gap*(n-1))/n;
 g.direction='rtl';g.textAlign='center';g.textBaseline='middle';
 it.forEach(function(t,k){var y=40+k*(bh+gap);g.fillStyle=cols[k%5];g.beginPath();if(g.roundRect)g.roundRect(40,y,W-80,bh,24);else g.rect(40,y,W-80,bh);g.fill();
  g.fillStyle=k%2?'#2a1a0e':'#fff';var fs=Math.min(44,bh*.3);g.font='bold '+fs+'px Vazirmatn,Tahoma,sans-serif';
  var words=t.split(/\s+/),ls=[],cu='';words.forEach(function(w){var tt=cu?cu+' '+w:w;if(cu&&g.measureText(tt).width>W-140){ls.push(cu);cu=w}else cu=tt});if(cu)ls.push(cu);ls=ls.slice(0,3);
  ls.forEach(function(l,j){g.fillText(l,W/2,y+bh/2+(j-(ls.length-1)/2)*fs*1.3)});
  if(k<n-1){g.fillStyle='#8a7a68';g.beginPath();g.moveTo(W/2-24,y+bh+8);g.lineTo(W/2+24,y+bh+8);g.lineTo(W/2,y+bh+gap-8);g.closePath();g.fill()}});
 return new Promise(function(r){c.toBlob(r,'image/png')})}
function wizDlg(){
 var n=D.length,hasC=!!AI.ckey,hasI=!!AI.ikey,run=null,cancel=false;
 var o=modal('<b>🪄 ساخت ارائه‌ی تازه با تصویرهای مرتبط</b><small>متن اسلایدها/صفحه‌های ارائه یا کتابی که وارد کرده‌ای خوانده می‌شود و برای هر کدام یک اسلاید تازه با تصویر مرتبط (از بیرون کتاب) ساخته می‌شود. پیش از نهایی‌شدن همه‌چیز را می‌بینی. ارائه‌ی فعلی هم با «↩ برگشت» برمی‌گردد.</small>'+
 '<div class="rw">از اسلاید <input type="number" id="wf" min="1" max="'+n+'" value="1" style="width:70px"> تا <input type="number" id="wt" min="1" max="'+n+'" value="'+Math.min(n,10)+'" style="width:70px"><small>(از '+fa(n)+')</small></div>'+
 '<label class="k"><input type="checkbox" id="wc" '+(hasC?'checked':'disabled')+'> خلاصه‌نویسی و انتخاب عبارت جستجو با Claude '+(hasC?'':'<small>(کلید را در ⚙ تنظیمات بگذار)</small>')+'</label>'+
 '<label class="k"><input type="checkbox" id="ww" checked> جستجوی عکس آزاد در ویکی‌مدیا (نیاز به اینترنت)</label>'+
 '<label class="k"><input type="checkbox" id="wa" '+(hasI?'':'disabled')+'> ساخت عکس با هوش مصنوعی '+(hasI?'<small>(هزینه دارد)</small>':'<small>(کلید را در ⚙ تنظیمات بگذار)</small>')+'</label>'+
 '<label class="k"><input type="checkbox" id="wd" checked> اگر عکسی پیدا نشد، شکل ساده (کادر و فلش) بساز</label>'+
 '<div id="ws" style="font-size:13px;min-height:22px"></div><div id="wr"></div><div class="rw"><button class="p" id="wg">▶ شروع</button><button id="wx">بستن</button></div>',true);
 var s=function(x){return q$(x,o)},say=function(t){s('#ws').textContent=t};
 s('#wx').onclick=function(){cancel=true;o.remove()};
 s('#wg').onclick=async function(){if(run)return;run=1;var from=Math.max(1,Math.min(n,+s('#wf').value||1))-1,to=Math.max(from,Math.min(n,+s('#wt').value||n)-1);
  var opt={from:from,to:to,claude:s('#wc').checked&&hasC,wiki:s('#ww').checked,ai:s('#wa').checked&&hasI,dia:s('#wd').checked};s('#wg').disabled=true;
  try{var sl=await wizRun(opt,say,function(){return cancel});if(!cancel)wizReview(o,sl,opt)}catch(e){console.error(e);say('⚠ '+(e.message||'ناموفق بود'))}run=null;if(s('#wg'))s('#wg').disabled=false}}
async function wizRun(opt,say,stop){
 var items=[];for(var k=opt.from;k<=opt.to&&!stop();k++){var t=slideText(D[k]);if(t.length>=25)items.push({idx:k,text:t})}
 if(!items.length)throw new Error('متنی در این اسلایدها پیدا نشد (ممکن است فایل اسکن‌شده باشد)');
 var slides=null,warn='';
 if(opt.claude){slides=[];var sys='You turn Persian textbook pages into presentation slides. Reply with a JSON array only, no commentary.';
  for(var b=0;b<items.length&&!stop();b+=5){var part=items.slice(b,b+5);say('Claude در حال خلاصه‌کردن ('+fa(Math.min(b+5,items.length))+' از '+fa(items.length)+')…');
   var prompt='برای هر صفحه‌ی زیر یک اسلاید بساز. فقط یک آرایه‌ی JSON بده با این قالب:\n[{"page":<شماره>,"title":"عنوان کوتاه فارسی (حداکثر ۸ کلمه)","bullets":["حداکثر ۴ نکته‌ی کوتاه فارسی، هرکدام حداکثر ۱۵ کلمه"],"queries":["2 تا 3 عبارت جستجوی انگلیسی برای عکس در Wikimedia Commons؛ اسم‌های مشخص و قابل‌دیدن مثل نام پدیده یا مکان، نه مفاهیم انتزاعی"],"ai_prompt":"English prompt for an educational illustration, no text inside the image","diagram":true یا false (true اگر محتوا یک فرایند/مراحل است)}]\nتصویرها باید موضوع را نشان بدهند و از بیرون کتاب باشند، نه از خود صفحه.\n\n'+part.map(function(p){return'### PAGE '+(p.idx+1)+'\n'+p.text.slice(0,1800)}).join('\n\n');
   try{var arr=parseJSON(await claudeAsk(sys,prompt,4000));arr.forEach(function(a,ai){var p=part.filter(function(x){return x.idx+1===+a.page})[0]||part[ai];if(!p)return;slides.push({idx:p.idx,title:String(a.title||'').slice(0,80),bullets:(a.bullets||[]).map(String).slice(0,4),queries:(a.queries||[]).map(String).slice(0,3),aiPrompt:String(a.ai_prompt||a.title||''),diagram:!!a.diagram})})}
   catch(e){console.error(e);warn='⚠ Claude برای بعضی صفحه‌ها جواب نداد؛ آن‌ها بدون خلاصه‌نویسی ساخته شدند. ';part.forEach(function(p){slides.push(offlineSlide(p.idx,p.text))})}}
  var have={};slides.forEach(function(x){have[x.idx]=1});items.forEach(function(p){if(!have[p.idx])slides.push(offlineSlide(p.idx,p.text))});slides.sort(function(a,b){return a.idx-b.idx})}
 else slides=items.map(function(p){return offlineSlide(p.idx,p.text)});
 for(var m=0;m<slides.length&&!stop();m++){var s=slides[m];s.cands=[];s.chosen='none';
  if(opt.wiki){say('در حال جستجوی عکس برای اسلاید '+fa(m+1)+' از '+fa(slides.length)+'…');
   for(var qi=0;qi<s.queries.length;qi++){try{var r=await wikiSearch(s.queries[qi],8);r.forEach(function(c){if(!s.cands.some(function(x){return x.thumb===c.thumb}))s.cands.push(c)})}catch(e){console.error(e);warn=warn||'⚠ جستجوی ویکی‌مدیا انجام نشد (اینترنت یا فیلترشکن را بررسی کن). ';break}if(s.cands.length>=4)break}}
  if(opt.ai){say('در حال ساختن تصویر با هوش مصنوعی برای اسلاید '+fa(m+1)+' از '+fa(slides.length)+'…');try{s.aiBlob=await aiImage(s.aiPrompt||s.title);s.aiUrl=URL.createObjectURL(s.aiBlob);s.chosen='ai'}catch(e){console.error(e);warn=warn||'⚠ ساخت تصویر با هوش مصنوعی ناموفق بود: '+e.message+' '}}
  if(s.chosen==='none')s.chosen=s.cands.length?0:(opt.dia&&s.bullets.length>1?'dia':'none')}
 slides.warn=warn;return slides}
function wizReview(o,slides,opt){
 var s0=function(x){return q$(x,o)};s0('#ws').textContent=(slides.warn||'')+fa(slides.length)+' اسلاید آماده است. عکس هر اسلاید را انتخاب کن یا متن را ویرایش کن، بعد «ساخت ارائه» را بزن.';
 function render(){s0('#wr').innerHTML=slides.map(function(s,k){return'<div class="wc" data-k="'+k+'"><b>اسلاید '+fa(k+1)+' <small style="opacity:.6">(از اسلاید '+fa(s.idx+1)+')</small></b>'+
  '<input type="text" class="wt" value="'+esc(s.title)+'"><textarea class="wb" rows="3">'+esc(s.bullets.join('\n'))+'</textarea>'+
  '<div class="gg" style="grid-template-columns:repeat(auto-fill,minmax(84px,1fr))">'+(s.aiUrl?'<div class="it '+(s.chosen==='ai'?'sel':'')+'" data-c="ai"><img src="'+s.aiUrl+'"><span>AI</span></div>':'')+
  s.cands.map(function(c,j){return'<div class="it '+(s.chosen===j?'sel':'')+'" data-c="'+j+'"><img src="'+esc(c.thumb)+'"></div>'}).join('')+
  '<div class="it '+(s.chosen==='dia'?'sel':'')+'" data-c="dia">📊 شکل ساده</div><div class="it '+(s.chosen==='none'?'sel':'')+'" data-c="none">بدون تصویر</div></div>'+
  '<div class="rw"><input type="text" class="wq" dir="ltr" value="'+esc(s.queries[0]||'')+'" style="flex:1;min-width:120px"><button class="wsr">🔍 جستجو</button>'+(AI.ikey?'<button class="wai">🤖 ساخت با AI</button>':'')+'</div></div>'}).join('')+'<div class="rw"><button class="p" id="wk">✅ ساخت ارائه</button></div>'}
 render();s0('#wg').style.display='none';
 function sync(){o.querySelectorAll('.wc').forEach(function(c){var s=slides[+c.dataset.k];s.title=c.querySelector('.wt').value.trim();s.bullets=c.querySelector('.wb').value.split('\n').map(function(x){return x.trim()}).filter(Boolean);s.queries[0]=c.querySelector('.wq').value.trim()})}
 s0('#wr').onclick=async function(e){var card=e.target.closest('.wc');if(!card)return;var s=slides[+card.dataset.k];
  var it=e.target.closest('.it');if(it){sync();var c=it.dataset.c;s.chosen=(c==='ai'||c==='dia'||c==='none')?c:+c;render();return}
  if(e.target.closest('.wsr')){sync();var bt=e.target.closest('button');bt.disabled=true;try{s.cands=await wikiSearch(s.queries[0],8);if(s.cands.length)s.chosen=0}catch(err){toast('جستجو ناموفق بود: '+err.message)}render();return}
  if(e.target.closest('.wai')){sync();var b2=e.target.closest('button');b2.disabled=true;b2.textContent='در حال ساختن…';try{s.aiBlob=await aiImage(s.aiPrompt||s.title);s.aiUrl=URL.createObjectURL(s.aiBlob);s.chosen='ai'}catch(err){toast(err.message)}render()}};
 s0('#wk').onclick=async function(){sync();s0('#wk').disabled=true;var out=[],fail=0;
  for(var k=0;k<slides.length;k++){var s=slides[k];s0('#ws').textContent='در حال آماده‌سازی اسلاید '+fa(k+1)+' از '+fa(slides.length)+'…';
   var z=mk(s.title,s.bullets.join('\n'));
   try{var bl=null;
    if(s.chosen==='ai')bl=s.aiBlob;
    else if(typeof s.chosen==='number'){var c=s.cands[s.chosen];bl=c.blob||(c.blob=await fetchBlob(c.thumb));z.cr=c.credit}
    else if(s.chosen==='dia')bl=await makeFlow(s.bullets);
    if(bl){var u=await fit(bl,/png/i.test(bl.type));if(u)z.im=[{u:u}]}}
   catch(e){console.error(e);fail++}
   out.push(z)}
  DBAK={D:D,i:i};D=out;i=0;o.remove();ui();toast(fail?'ارائه ساخته شد؛ '+fa(fail)+' عکس دانلود نشد':'ارائه ساخته شد؛ برای برگشت به قبلی: 🧰 ← ↩')}}
var DBAK=null;
function undoWiz(){if(!DBAK){toast('چیزی برای برگشت نیست');return}D=DBAK.D;i=DBAK.i;DBAK=null;ui();toast('به ارائه‌ی قبلی برگشتی')}

/* ============ خروجی PPTX ============ */
var xe=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
async function exportPptx(){
 if(Rc||BUSYREC){toast('اول ضبط را تمام کن');return}
 busy('در حال ساخت پاورپوینت…');await wait(30);
 try{
  var n=D.length,SW=12192000,SH=6858000,E=9525,p=P[th],hex=function(c){return c.replace('#','')};
  var A='http://schemas.openxmlformats.org/drawingml/2006/main',R_='http://schemas.openxmlformats.org/officeDocument/2006/relationships',P_='http://schemas.openxmlformats.org/presentationml/2006/main',H='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  var rel=function(items){return H+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+items.map(function(a){return'<Relationship Id="'+a[0]+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/'+a[1]+'" Target="'+a[2]+'"/>'}).join('')+'</Relationships>'};
  var ns='xmlns:a="'+A+'" xmlns:r="'+R_+'" xmlns:p="'+P_+'"',z=new JSZip(),grp='<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>';
  z.file('[Content_Types].xml',H+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpeg" ContentType="image/jpeg"/><Default Extension="png" ContentType="image/png"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>'+D.map(function(_,k){return'<Override PartName="/ppt/slides/slide'+(k+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>'}).join('')+'</Types>');
  z.file('_rels/.rels',rel([['rId1','officeDocument','ppt/presentation.xml']]));
  z.file('ppt/presentation.xml',H+'<p:presentation '+ns+'><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>'+D.map(function(_,k){return'<p:sldId id="'+(256+k)+'" r:id="rId'+(k+2)+'"/>'}).join('')+'</p:sldIdLst><p:sldSz cx="'+SW+'" cy="'+SH+'"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>');
  z.file('ppt/_rels/presentation.xml.rels',rel([['rId1','slideMaster','slideMasters/slideMaster1.xml']].concat(D.map(function(_,k){return['rId'+(k+2),'slide','slides/slide'+(k+1)+'.xml']}))));
  z.file('ppt/slideMasters/slideMaster1.xml',H+'<p:sldMaster '+ns+'><p:cSld><p:bg><p:bgRef idx="1001"><a:schemeClr val="bg1"/></p:bgRef></p:bg><p:spTree>'+grp+'</p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst><p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles></p:sldMaster>');
  z.file('ppt/slideMasters/_rels/slideMaster1.xml.rels',rel([['rId1','slideLayout','../slideLayouts/slideLayout1.xml'],['rId2','theme','../theme/theme1.xml']]));
  z.file('ppt/slideLayouts/slideLayout1.xml',H+'<p:sldLayout '+ns+' type="blank" preserve="1"><p:cSld name="Blank"><p:spTree>'+grp+'</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>');
  z.file('ppt/slideLayouts/_rels/slideLayout1.xml.rels',rel([['rId1','slideMaster','../slideMasters/slideMaster1.xml']]));
  var sf='<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>',lnS='<a:ln w="6350">'+sf+'</a:ln>';
  z.file('ppt/theme/theme1.xml',H+'<a:theme xmlns:a="'+A+'" name="Office"><a:themeElements><a:clrScheme name="Office"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1><a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="44546A"/></a:dk2><a:lt2><a:srgbClr val="E7E6E6"/></a:lt2><a:accent1><a:srgbClr val="4472C4"/></a:accent1><a:accent2><a:srgbClr val="ED7D31"/></a:accent2><a:accent3><a:srgbClr val="A5A5A5"/></a:accent3><a:accent4><a:srgbClr val="FFC000"/></a:accent4><a:accent5><a:srgbClr val="5B9BD5"/></a:accent5><a:accent6><a:srgbClr val="70AD47"/></a:accent6><a:hlink><a:srgbClr val="0563C1"/></a:hlink><a:folHlink><a:srgbClr val="954F72"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst>'+sf+sf+sf+'</a:fillStyleLst><a:lnStyleLst>'+lnS+lnS+lnS+'</a:lnStyleLst><a:effectStyleLst>'+'<a:effectStyle><a:effectLst/></a:effectStyle>'.repeat(3)+'</a:effectStyleLst><a:bgFillStyleLst>'+sf+sf+sf+'</a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>');
  var keepI=i;
  for(var k=0;k<n;k++){
   busy('در حال ساخت پاورپوینت… اسلاید '+fa(k+1)+' از '+fa(n));await wait(0);
   var Z=D[k],id=1,body='',relx=[['rId1','slideLayout','../slideLayouts/slideLayout1.xml']],rc=1,bg='<p:bg><p:bgPr><a:solidFill><a:srgbClr val="'+hex(p.bg)+'"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>';
   var pic=function(blob,ext,x,y,w,h){rc++;id++;var nm='image'+k+'_'+rc+'.'+ext;z.file('ppt/media/'+nm,blob);relx.push(['rId'+rc,'image','../media/'+nm]);
    return'<p:pic><p:nvPicPr><p:cNvPr id="'+id+'" name="Picture '+id+'"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="rId'+rc+'"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="'+Math.round(x)+'" y="'+Math.round(y)+'"/><a:ext cx="'+Math.round(w)+'" cy="'+Math.round(h)+'"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>'};
   var tbox=function(x,y,w,h,paras,anchor){id++;return'<p:sp><p:nvSpPr><p:cNvPr id="'+id+'" name="Text '+id+'"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="'+Math.round(x*E)+'" y="'+Math.round(y*E)+'"/><a:ext cx="'+Math.round(w*E)+'" cy="'+Math.round(h*E)+'"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square" lIns="0" rIns="0" anchor="'+anchor+'"><a:normAutofit/></a:bodyPr><a:lstStyle/>'+paras+'</p:txBody></p:sp>'};
   var para=function(t,pt,col,rtl,b,f){return'<a:p><a:pPr algn="'+(rtl?'r':'l')+'" rtl="'+(rtl?1:0)+'"/><a:r><a:rPr lang="'+(rtl?'fa-IR':'en-US')+'" sz="'+Math.round(pt*100)+'" b="'+(b?1:0)+'"><a:solidFill><a:srgbClr val="'+hex(col)+'"/></a:solidFill><a:latin typeface="'+xe(f)+'"/><a:cs typeface="'+xe(f)+'"/></a:rPr><a:t>'+xe(t)+'</a:t></a:r></a:p>'};
   if(Z.k==='text'){
    var rtl=R((Z.t||'')+(Z.b||'')),hasIm=Z.im&&Z.im.length,f=Z.f||'Vazirmatn';
    id++;body+='<p:sp><p:nvSpPr><p:cNvPr id="'+id+'" name="Bar"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="'+SW+'" cy="'+(14*E)+'"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="'+hex(p.acc)+'"/></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-US"/></a:p></p:txBody></p:sp>';
    body+=tbox(80,40,1120,110,para(Z.t||'',Z.s*1.35*.75,p.acc,rtl,1,f),'ctr');
    var bx=hasIm&&rtl?600:80,bw=hasIm?600:1120;
    var bp=(Z.b||'').split('\n').map(function(t){return para(t,Z.s*.75,p.ink,R(t)||rtl,0,f)}).join('');
    if(Z.b)body+=tbox(bx,175,bw,500,bp,'t');
    if(hasIm){var ims=Z.im,gap=14,y0=175,bh=(680-y0-gap*(ims.length-1))/ims.length,ix=rtl?80:740,iw=460;
     for(var a=0;a<ims.length;a++){var bl=await (await fetch(ims[a].u)).blob(),bm=await createImageBitmap(bl),sc=Math.min(iw/bm.width,bh/bm.height),w=bm.width*sc,h=bm.height*sc;
      body+=pic(bl,/png/i.test(bl.type)?'png':'jpeg',(ix+(iw-w)/2)*E,(y0+a*(bh+gap)+(bh-h)/2)*E,w*E,h*E)}}
    if(Z.cr)body+=tbox(80,690,1120,24,para('Image: '+Z.cr,9,'#777777',false,0,'Tahoma'),'ctr');
   }else{
    i=k;dirty=true;size();draw();var jb=await new Promise(function(r){cv.toBlob(r,'image/jpeg',.9)});body+=pic(jb,'jpeg',0,0,SW,SH)}
   z.file('ppt/slides/slide'+(k+1)+'.xml',H+'<p:sld '+ns+'><p:cSld>'+bg+'<p:spTree>'+grp+body+'</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>');
   z.file('ppt/slides/_rels/slide'+(k+1)+'.xml.rels',rel(relx))}
  i=keepI;ui();
  busy('در حال بسته‌بندی…');var out=await z.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.presentationml.presentation',compression:'DEFLATE'});
  busy();saveBlob(out,'presentation-'+Date.now()+'.pptx');toast('پاورپوینت ساخته شد (اسلایدهای متنی قابل‌ویرایش؛ بقیه به‌صورت تصویر)')
 }catch(e){busy();console.error(e);alert('ساخت پاورپوینت ناموفق بود: '+(e.message||e))}}

/* ============ منوی ابزارها ============ */
function toolsMenu(){
 var items=[['imp','📂 ورود PPTX یا PDF'],['img','🖼 تصویرهای داخل فایل (دیدن، دانلود، گذاشتن روی اسلاید)'],['wiz','🪄 ساخت ارائه‌ی تازه با تصویرهای مرتبط'],['auto','🎞 ساخت کلیپ خودکار (بی‌صدا یا با آهنگ)'],['vo','🎙 صدا (و آهنگ) روی کلیپ آماده'],['mus','🎵 فقط آهنگ روی کلیپ آماده'],['ppt','📤 گرفتن خروجی PowerPoint'],['aud','🎙 تنظیمات صدا و میکروفون'],['ai','⚙ تنظیمات Claude و تصویرساز'],['undo','↩ برگشت به ارائه‌ی قبل از ویزارد']];
 var o=modal('<b>🧰 ابزارها</b>'+items.map(function(a){return'<button data-m="'+a[0]+'" style="text-align:start">'+a[1]+'</button>'}).join('')+'<button id="mx">بستن</button>');
 q$('#mx',o).onclick=function(){o.remove()};
 o.onclick=function(e){var b=e.target.closest('[data-m]');if(!b)return;var m=b.dataset.m;o.remove();
  if(m=='imp')q$('#imp').click();else if(m=='img')imgDlg();else if(m=='wiz')wizDlg();else if(m=='auto')autoDlg();else if(m=='vo')voDlg();else if(m=='mus')musicDlg();else if(m=='ppt')exportPptx();else if(m=='aud')audioDlg();else if(m=='ai')aiDlg();else if(m=='undo')undoWiz()}}
q$('#tl_').onclick=toolsMenu;

/* ============ صفحه‌ی بزرگ / تمام‌صفحه ============ */
(function(){
 var css=document.createElement('style');css.textContent='body.big header,body.big #th,body.big #ed{display:none}body.big main{grid-template-columns:1fr;padding:6px;max-width:none}body.big canvas#cv{width:min(100%,calc((100vh - 170px)*16/9));margin:0 auto}body.big .bar{margin:6px 0}@media(max-height:520px){body.big canvas#cv{width:100%}}';
 document.head.appendChild(css);
 var b=document.createElement('button');b.id='bg';b.textContent='⛶ صفحه‌ی بزرگ';q$('#as').after(b);
 var tb=document.createElement('button');tb.id='tl2';tb.textContent='🧰 ابزارها';tb.style.display='none';b.after(tb);tb.onclick=toolsMenu;
 var on=false;
 function set(v){on=v;document.body.classList.toggle('big',on);b.textContent=on?'⮌ کوچک‌کردن':'⛶ صفحه‌ی بزرگ';tb.style.display=on?'':'none';
  try{if(on){var e=document.documentElement;(e.requestFullscreen||e.webkitRequestFullscreen||function(){}).call(e);if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(function(){})}
   else{if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen();if(screen.orientation&&screen.orientation.unlock)screen.orientation.unlock()}}catch(x){}
  dirty=true;window.scrollTo(0,0)}
 b.onclick=function(){set(!on)};
 document.addEventListener('fullscreenchange',function(){if(!document.fullscreenElement&&on){on=false;document.body.classList.remove('big');b.textContent='⛶ صفحه‌ی بزرگ';tb.style.display='none'}});
})();
window.__ss={vo:function(){return VO},ink:function(){return INK}};
})();
