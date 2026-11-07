/* extra features for اسلایدساز: images inside the file, images on slides, settings (Claude / image AI),
   "new presentation with related images" wizard, generated-deck renderer and editable .pptx export.
   Loaded after the main script (shares its global variables). */
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let stash=null;
document.head.appendChild(Object.assign(document.createElement('style'),{textContent:`
.gg{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px}
.gg .it{position:relative;border:2px solid var(--ln);border-radius:10px;overflow:hidden;background:#fff;aspect-ratio:1;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#223;font-size:12px;text-align:center}
.gg .it img{max-width:100%;max-height:100%;object-fit:contain}.gg .it.sel{border-color:var(--ac);box-shadow:0 0 0 3px var(--ac)}
.gg .it span{position:absolute;bottom:0;right:0;left:0;background:#000a;color:#fff;font-size:10px;text-align:center;padding:1px}
.wc{border:1px solid var(--ln);border-radius:12px;padding:8px;display:flex;flex-direction:column;gap:6px}
.pn input[type=text],.pn input[type=password],.pn textarea{font:inherit;background:transparent;color:var(--tx);border:1px solid var(--ln);border-radius:8px;padding:6px;width:100%;box-sizing:border-box}
`}));
function modal(html,wide){const o=document.createElement('div');o.className='ov';o.innerHTML=`<div class="pn" style="${wide?'max-width:720px':''}">${html}</div>`;document.body.appendChild(o);return o}
// ---------- settings
let AI={};try{AI=JSON.parse(localStorage.sl_ai||'{}')}catch{}
function aiDlg(){sh.classList.add('h');bar.classList.add('h');
 const o=modal(`<b>⚙ تنظیمات Claude و تصویرساز</b>
 <div style="font-size:12px;opacity:.8">کلیدها فقط روی همین دستگاه ذخیره می‌شوند و فقط به همان سرویس فرستاده می‌شوند. هزینه‌ی استفاده با حساب خودت است و این بخش‌ها اینترنت می‌خواهند. همه‌ی فیلدها اختیاری‌اند.</div>
 <b style="font-size:13px">Claude: خلاصه‌ی متن و انتخاب عبارت جستجوی عکس</b>
 <input type="password" id="ak" dir="ltr" placeholder="کلید API (sk-ant-…)" value="${esc(AI.ckey)}"><input type="text" id="am" dir="ltr" placeholder="مدل: claude-sonnet-5-5" value="${esc(AI.cmodel)}">
 <b style="font-size:13px">تصویرساز هوش مصنوعی (سازگار با OpenAI)</b>
 <input type="text" id="ab" dir="ltr" placeholder="https://api.openai.com/v1" value="${esc(AI.ibase)}"><input type="password" id="ik" dir="ltr" placeholder="کلید API تصویرساز" value="${esc(AI.ikey)}">
 <div class="r"><input type="text" id="im" dir="ltr" placeholder="مدل: gpt-image-1" value="${esc(AI.imodel)}" style="flex:1"><input type="text" id="is" dir="ltr" placeholder="1024x1024" value="${esc(AI.isize)}" style="flex:1"></div>
 <div class="r"><button class="on" id="as">ذخیره</button><button id="ax">بستن</button></div>`);
 const q=s=>o.querySelector(s);q('#ax').onclick=()=>o.remove();
 q('#as').onclick=()=>{AI={ckey:q('#ak').value.trim(),cmodel:q('#am').value.trim(),ibase:q('#ab').value.trim(),ikey:q('#ik').value.trim(),imodel:q('#im').value.trim(),isize:q('#is').value.trim()};try{localStorage.sl_ai=JSON.stringify(AI)}catch{}o.remove();toast('تنظیمات ذخیره شد')}}
// ---------- text of pages
async function pageText(i){if(src.kind==='pptx')return src.deck.text(i);
 if(src.kind==='pdf'){const pg=await src.doc.getPage(i+1),tc=await pg.getTextContent();const items=tc.items.filter(t=>t.str&&t.str.trim()).map(t=>({s:t.str,x:t.transform[4],y:t.transform[5]})).sort((a,b)=>b.y-a.y||a.x-b.x),lines=[];
  for(const it of items){const l=lines[lines.length-1];if(l&&Math.abs(l.y-it.y)<4)l.a.push(it);else lines.push({y:it.y,a:[it]})}
  return lines.map(l=>{const rtl=/[؀-ۿ]/.test(l.a.map(t=>t.s).join(''));l.a.sort((p,q)=>rtl?q.x-p.x:p.x-q.x);return l.a.map(t=>t.s).join(' ')}).join('\n').normalize('NFKC')}
 return''}
// ---------- images inside the file
function objToCanvas(o){const W=o.width,H=o.height,sc=Math.min(1,1800/Math.max(W,H)),c=mk(Math.max(1,Math.round(W*sc)),Math.max(1,Math.round(H*sc))),g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);
 if(o.bitmap){g.drawImage(o.bitmap,0,0,c.width,c.height);return c}
 if(!o.data)return null;const id=new ImageData(W,H),d=id.data,s=o.data;
 if(o.kind===3&&s.length>=W*H*4)d.set(s.subarray(0,W*H*4));
 else if(o.kind===2&&s.length>=W*H*3){for(let i=0,j=0;i<W*H;i++,j+=3){d[i*4]=s[j];d[i*4+1]=s[j+1];d[i*4+2]=s[j+2];d[i*4+3]=255}}
 else if(o.kind===1){const rb=(W+7)>>3;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const v=(s[y*rb+(x>>3)]>>(7-(x&7)))&1?255:0,k=(y*W+x)*4;d[k]=d[k+1]=d[k+2]=v;d[k+3]=255}}
 else return null;
 const t=mk(W,H);t.getContext('2d').putImageData(id,0,0);g.drawImage(t,0,0,c.width,c.height);return c}
async function extractImages(add,say,stop){
 if(src.kind==='pptx'){const ms=await src.deck.media();let n=0;for(const m of ms){if(stop())break;say(`در حال خواندن تصویرها… ${fa(++n)} از ${fa(ms.length)}`);let bm;try{bm=await createImageBitmap(m.blob)}catch{continue}if(bm.width<80||bm.height<80)continue;add({blob:m.blob,w:bm.width,h:bm.height,label:'اسلاید '+m.slides.map(x=>fa(x+1)).join('، ')});await new Promise(r=>setTimeout(r))}return}
 if(src.kind==='pdf'){const pd=await getPdf(),OPS=pd.OPS,seen=new Set();let cnt=0;
  for(let p=1;p<=src.doc.numPages&&!stop();p++){say(`در حال جست‌وجوی تصویر… صفحه ${fa(p)} از ${fa(src.doc.numPages)}`);const pg=await src.doc.getPage(p),ops=await pg.getOperatorList();
   for(let i=0;i<ops.fnArray.length&&!stop();i++){const fn=ops.fnArray[i];if(fn!==OPS.paintImageXObject&&fn!==OPS.paintInlineImageXObject&&fn!==OPS.paintImageXObjectRepeat)continue;
    const a=ops.argsArray[i];let obj;
    if(fn===OPS.paintInlineImageXObject)obj=a[0];else{const id=a[0];if(seen.has(id))continue;seen.add(id);obj=await new Promise(res=>{const store=String(id).startsWith('g_')?pg.commonObjs:pg.objs;let ok=false;try{store.get(id,v=>{ok=true;res(v)})}catch{res(null)}setTimeout(()=>!ok&&res(null),4000)})}
    if(!obj||!(obj.width>=100&&obj.height>=100))continue;const c=objToCanvas(obj);if(!c)continue;
    const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.9));if(!blob)continue;add({blob,w:obj.width,h:obj.height,label:'صفحه '+fa(p)});if(++cnt>=400)return}}}}
async function imgDlg(){if(!src){toast('اول یک فایل باز کن');return}if(src.kind==='gen'){toast('این ارائه را خود برنامه ساخته؛ تصویرها داخل خروجی pptx هستند');return}
 sh.classList.add('h');bar.classList.add('h');let stop=false;
 const o=modal(`<b>🖼 تصویرهای داخل «${esc(src.name)}»</b><div id="gs2" style="font-size:13px">در حال جست‌وجو…</div><div class="gg" id="gg"></div><div class="r"><button id="gA">⬇ همه (zip)</button><button id="gS">⬇ انتخاب‌شده‌ها</button><button id="gP" class="on">📌 روی اسلاید فعلی بگذار</button><button id="gX">بستن</button></div>`,true);
 const q=s=>o.querySelector(s),sel=new Set(),list=[];q('#gX').onclick=()=>{stop=true;o.remove()};
 const add=it=>{const k=list.length;list.push(it);const d=document.createElement('div');d.className='it';d.innerHTML=`<img src="${URL.createObjectURL(it.blob)}"><span>${it.label} · ${fa(it.w)}×${fa(it.h)}</span>`;d.onclick=()=>{sel.has(k)?sel.delete(k):sel.add(k);d.classList.toggle('sel',sel.has(k))};q('#gg').appendChild(d)};
 try{await extractImages(add,t=>{const e=q('#gs2');if(e)e.textContent=t},()=>stop);const e=q('#gs2');if(e)e.textContent=list.length?`${fa(list.length)} تصویر پیدا شد. روی هر تصویر بزن تا انتخاب شود.`:'تصویری در این فایل پیدا نشد (ممکن است صفحه‌ها فقط عکسِ اسکن‌شده باشند).'}catch(e){console.error(e);const el=q('#gs2');if(el)el.textContent='خواندن تصویرها ناموفق بود'}
 const ext=b=>b.type.includes('png')?'png':b.type.includes('gif')?'gif':b.type.includes('webp')?'webp':'jpg';
 const dl=async ids=>{if(!ids.length){toast('تصویری انتخاب نشده');return}const z=new JSZip();ids.forEach((k,j)=>z.file(`image-${String(j+1).padStart(3,'0')}.${ext(list[k].blob)}`,list[k].blob));dlBlob(await z.generateAsync({type:'blob'}),'images.zip')};
 q('#gA').onclick=()=>dl(list.map((_,k)=>k));q('#gS').onclick=()=>dl([...sel]);
 q('#gP').onclick=async()=>{if(!sel.size){toast('اول یک یا چند تصویر را انتخاب کن');return}stop=true;for(const k of sel)await addOvl(list[k].blob);o.remove();toast('عکس روی اسلاید آمد؛ بکشش و با دایره‌ی گوشه اندازه‌اش را عوض کن')}}
// ---------- pictures placed on slides
function drawOvl(g,i){const L=ovl[i];if(!L)return;for(const it of L)g.drawImage(it.bm,it.x,it.y,it.w,it.h);
 if(S.tool=='obj'&&objSel&&objSel.i===i&&!rec&&!gen&&!vo){const it=L[objSel.k];if(it){g.save();g.strokeStyle='#35e0c2';g.lineWidth=OW/320;g.setLineDash([OW/80,OW/160]);g.strokeRect(it.x,it.y,it.w,it.h);g.setLineDash([]);g.fillStyle='#35e0c2';g.beginPath();g.arc(it.x+it.w,it.y+it.h,OW/60,0,7);g.fill();g.restore()}}}
async function addOvl(blob){const bm=await createImageBitmap(blob);let w=OW*.4,h=w*bm.height/bm.width;if(h>OH*.7){h=OH*.7;w=h*bm.width/bm.height}(ovl[cur]=ovl[cur]||[]).push({blob,bm,x:(OW-w)/2,y:(OH-h)/2,w,h});objSel={i:cur,k:ovl[cur].length-1};S.tool='obj';ui();dirty=1;scheduleSave()}
function objDown(e){const p=pt(e),L=ovl[cur]||[];
 if(objSel&&objSel.i===cur){const it=L[objSel.k];if(it&&Math.hypot(p.x-(it.x+it.w),p.y-(it.y+it.h))<OW/22){drawing={id:e.pointerId,obj:'rs',it,ar:it.w/it.h};return}}
 for(let k=L.length-1;k>=0;k--){const it=L[k];if(p.x>=it.x&&p.x<=it.x+it.w&&p.y>=it.y&&p.y<=it.y+it.h){objSel={i:cur,k};drawing={id:e.pointerId,obj:'mv',it,ox:p.x-it.x,oy:p.y-it.y};dirty=1;return}}
 objSel=null;dirty=1}
function objMove(e){const p=pt(e),d=drawing,it=d.it;if(d.obj==='mv'){it.x=p.x-d.ox;it.y=p.y-d.oy}else{const w=Math.max(OW/20,p.x-it.x);it.w=w;it.h=w/d.ar}dirty=1}
function delObj(){if(!objSel||!ovl[objSel.i])return;ovl[objSel.i].splice(objSel.k,1);objSel=null;dirty=1;scheduleSave()}
function saveOvl(){const o={};for(const i in ovl)if(ovl[i].length)o[i]=ovl[i].map(({blob,x,y,w,h})=>({blob,x,y,w,h}));cput('ovl',{o,ow:OW})}
async function loadOvl(){const r=await cget('ovl');ovl={};if(!r)return;const sc=OW/(r.ow||OW);for(const i in r.o){ovl[i]=[];for(const it of r.o[i]){try{ovl[i].push({blob:it.blob,bm:await createImageBitmap(it.blob),x:it.x*sc,y:it.y*sc,w:it.w*sc,h:it.h*sc})}catch{}}}}
// ---------- Claude / Wikimedia / image AI
async function claudeAsk(system,prompt,maxTok){if(!AI.ckey)throw new Error('کلید Claude تنظیم نشده');
 const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':AI.ckey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:AI.cmodel||'claude-sonnet-5-5',max_tokens:maxTok||4000,system,messages:[{role:'user',content:prompt}]})});
 if(!r.ok)throw new Error('Claude '+r.status+': '+(await r.text()).slice(0,160));const j=await r.json();return(j.content||[]).map(c=>c.text||'').join('')}
const parseJSON=t=>{const m=t.match(/\[[\s\S]*\]/);return JSON.parse(m?m[0]:t)};
async function wikiSearch(q,n){const u='https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit='+(n||8)+'&gsrsearch='+encodeURIComponent(q+' filetype:bitmap')+'&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=800';
 const r=await fetch(u);if(!r.ok)throw new Error('ویکی‌مدیا '+r.status);const j=await r.json(),pages=Object.values((j.query&&j.query.pages)||{}).sort((a,b)=>a.index-b.index),strip=s=>String(s||'').replace(/<[^>]*>/g,'').trim();
 return pages.map(p=>{const i=p.imageinfo&&p.imageinfo[0];if(!i||!i.thumburl)return null;const m=i.extmetadata||{};return{thumb:i.thumburl,credit:`${strip(m.Artist&&m.Artist.value)||'Wikimedia Commons'} — ${strip(m.LicenseShortName&&m.LicenseShortName.value)||'CC'} — Wikimedia Commons`,title:p.title}}).filter(Boolean)}
async function aiImage(prompt){if(!AI.ikey)throw new Error('کلید تصویرساز تنظیم نشده');const base=(AI.ibase||'https://api.openai.com/v1').replace(/\/$/,'');
 const r=await fetch(base+'/images/generations',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+AI.ikey},body:JSON.stringify({model:AI.imodel||'gpt-image-1',prompt,size:AI.isize||'1024x1024',n:1})});
 if(!r.ok)throw new Error('تصویرساز '+r.status+': '+(await r.text()).slice(0,160));const j=await r.json(),d=j.data&&j.data[0];if(!d)throw new Error('پاسخ تصویرساز خالی بود');
 if(d.b64_json){const bin=atob(d.b64_json),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new Blob([u],{type:'image/png'})}
 if(d.url){return await(await fetch(d.url)).blob()}throw new Error('قالب پاسخ تصویرساز ناشناخته بود')}
const fetchBlob=async u=>{const r=await fetch(u);if(!r.ok)throw new Error('دانلود تصویر '+r.status);return await r.blob()};
// ---------- wizard
function offlineSlide(page,text){const lines=text.split(/\n+/).map(s=>s.trim()).filter(Boolean),title=(lines[0]||'').slice(0,70),rest=lines.slice(1).join(' ');
 const sents=rest.split(/(?<=[.؟?!۔])\s+/).map(s=>s.trim()).filter(s=>s.length>12).slice(0,4).map(s=>s.length>130?s.slice(0,127)+'…':s);
 return{page,title,bullets:sents,queries:[title].filter(Boolean),aiPrompt:'Clear educational illustration about: '+title+'. No text in the image.',diagram:false}}
function wizDlg(){if(!src){toast('اول یک فایل (کتاب یا پاورپوینت) باز کن');return}if(src.kind==='gen'){toast('اول به فایل اصلی برگرد');return}sh.classList.add('h');bar.classList.add('h');
 const hasC=!!AI.ckey,hasI=!!AI.ikey;let run=null;
 const o=modal(`<b>🪄 ساخت ارائه‌ی تازه از روی متن «${esc(src.name)}»</b>
 <div style="font-size:12px;opacity:.8">برنامه متن صفحه‌ها را می‌خواند و برای هر صفحه یک اسلاید با تصویر مرتبط (از بیرون کتاب) می‌سازد. پیش از نهایی‌شدن همه‌چیز را می‌بینی و می‌توانی عوض کنی.</div>
 <div class="r">صفحه‌ی <input type="number" id="wf" min="1" max="${src.n}" value="1"> تا <input type="number" id="wt" min="1" max="${src.n}" value="${Math.min(src.n,10)}"><span style="font-size:12px;opacity:.7">(از ${fa(src.n)})</span></div>
 <label><input type="checkbox" id="wc" ${hasC?'checked':'disabled'}> خلاصه‌نویسی و انتخاب عبارت جستجو با Claude ${hasC?'':'<small>(اول کلید را در ⚙ تنظیمات بگذار)</small>'}</label>
 <label><input type="checkbox" id="ww" checked> جستجوی عکس آزاد در ویکی‌مدیا (اینترنت)</label>
 <label><input type="checkbox" id="wa" ${hasI?'':'disabled'}> ساخت عکس با هوش مصنوعی ${hasI?'<small>(برای هر اسلاید یک عکس ساخته می‌شود و هزینه دارد)</small>':'<small>(نیازمند کلید در ⚙ تنظیمات)</small>'}</label>
 <label><input type="checkbox" id="wd" checked> اگر عکسی پیدا نشد، شکل ساده (کادر و فلش) بساز</label>
 <div id="ws" style="font-size:13px;min-height:22px"></div><div id="wr"></div>
 <div class="r"><button class="on" id="wg">▶ شروع</button><button id="wx">بستن</button></div>`,true);
 const q=s=>o.querySelector(s),say=t=>{q('#ws').textContent=t};let cancel=false;q('#wx').onclick=()=>{cancel=true;o.remove()};
 q('#wg').onclick=async()=>{if(run)return;run=1;const from=Math.max(1,Math.min(src.n,+q('#wf').value||1))-1,to=Math.max(from,Math.min(src.n,+q('#wt').value||src.n)-1);
  const opt={from,to,claude:q('#wc').checked&&hasC,wiki:q('#ww').checked,ai:q('#wa').checked&&hasI,dia:q('#wd').checked};q('#wg').disabled=true;
  try{const slides=await wizRun(opt,say,()=>cancel);if(cancel)return;wizReview(o,slides,opt)}catch(e){console.error(e);say('⚠ '+(e.message||'ناموفق بود'))}run=null;if(q('#wg'))q('#wg').disabled=false}}
async function wizRun(opt,say,stop){const items=[];
 for(let i=opt.from;i<=opt.to&&!stop();i++){say(`در حال خواندن متن صفحه ${fa(i+1)}…`);const t=(await pageText(i)).trim();if(t.length>=25)items.push({page:i,text:t})}
 if(!items.length)throw new Error('متنی در این صفحه‌ها پیدا نشد (ممکن است فایل اسکن‌شده باشد)');
 let slides=null,warn='';
 if(opt.claude){slides=[];const sys='You turn Persian textbook pages into presentation slides. Reply with a JSON array only, no commentary.';
  for(let b=0;b<items.length&&!stop();b+=5){const part=items.slice(b,b+5);say(`Claude در حال خلاصه‌کردن (${fa(Math.min(b+5,items.length))} از ${fa(items.length)})…`);
   const prompt=`برای هر صفحه‌ی زیر یک اسلاید بساز. فقط یک آرایه‌ی JSON بده با این قالب:\n[{"page":<شماره>,"title":"عنوان کوتاه فارسی (حداکثر ۸ کلمه)","bullets":["حداکثر ۴ نکته‌ی کوتاه فارسی، هرکدام حداکثر ۱۵ کلمه"],"queries":["2 تا 3 عبارت جستجوی انگلیسی برای عکس در Wikimedia Commons؛ اسم‌های مشخص و قابل‌دیدن مثل نام پدیده یا مکان، نه مفاهیم انتزاعی"],"ai_prompt":"English prompt for an educational illustration, no text inside the image","diagram":true یا false (true اگر محتوا یک فرایند/مراحل است)}]\nتصویرها باید موضوع را نشان بدهند و از بیرون کتاب باشند، نه از خود صفحه.\n\n`+part.map(p=>`### PAGE ${p.page+1}\n${p.text.slice(0,1800)}`).join('\n\n');
   try{const arr=parseJSON(await claudeAsk(sys,prompt,4000));for(const a of arr){const p=part.find(x=>x.page+1===+a.page)||part[arr.indexOf(a)];if(!p)continue;slides.push({page:p.page,title:String(a.title||'').slice(0,80),bullets:(a.bullets||[]).map(String).slice(0,4),queries:(a.queries||[]).map(String).slice(0,3),aiPrompt:String(a.ai_prompt||a.title||''),diagram:!!a.diagram})}}
   catch(e){console.error(e);warn='⚠ Claude برای بعضی صفحه‌ها جواب نداد؛ آن‌ها بدون خلاصه‌نویسی ساخته شدند. ';for(const p of part)slides.push(offlineSlide(p.page,p.text))}}
  const have=new Set(slides.map(s=>s.page));for(const p of items)if(!have.has(p.page))slides.push(offlineSlide(p.page,p.text));slides.sort((a,b)=>a.page-b.page)}
 else slides=items.map(p=>offlineSlide(p.page,p.text));
 for(let k=0;k<slides.length&&!stop();k++){const s=slides[k];s.cands=[];s.chosen='none';
  if(opt.wiki){say(`در حال جستجوی عکس برای اسلاید ${fa(k+1)} از ${fa(slides.length)}…`);
   for(const qq of s.queries){try{const r=await wikiSearch(qq,8);for(const c of r)if(!s.cands.some(x=>x.thumb===c.thumb))s.cands.push(c)}catch(e){console.error(e);warn=warn||'⚠ جستجوی ویکی‌مدیا انجام نشد (اینترنت یا فیلترشکن را بررسی کن). ';break}if(s.cands.length>=4)break}}
  if(opt.ai){say(`در حال ساختن تصویر با هوش مصنوعی برای اسلاید ${fa(k+1)} از ${fa(slides.length)}…`);try{s.aiBlob=await aiImage(s.aiPrompt||s.title);s.aiUrl=URL.createObjectURL(s.aiBlob);s.chosen='ai'}catch(e){console.error(e);warn=warn||'⚠ ساخت تصویر با هوش مصنوعی ناموفق بود: '+e.message+' '}}
  if(s.chosen==='none'){s.chosen=s.cands.length?0:(opt.dia?'dia':'none')}else if(s.diagram===undefined){}}
 slides.warn=warn;return slides}
function wizReview(o,slides,opt){const q=s=>o.querySelector(s);q('#ws').textContent=(slides.warn||'')+`${fa(slides.length)} اسلاید آماده است. عکس هر اسلاید را انتخاب کن یا متن را ویرایش کن، بعد «ساخت ارائه» را بزن.`;
 const render=()=>{q('#wr').innerHTML=slides.map((s,k)=>`<div class="wc" data-k="${k}"><b>اسلاید ${fa(k+1)} <small style="opacity:.6">(صفحه‌ی ${fa(s.page+1)})</small></b>
  <input type="text" class="wt" value="${esc(s.title)}"><textarea class="wb" rows="3">${esc(s.bullets.join('\n'))}</textarea>
  <div class="gg" style="grid-template-columns:repeat(auto-fill,minmax(84px,1fr))">${s.aiUrl?`<div class="it ${s.chosen==='ai'?'sel':''}" data-c="ai"><img src="${s.aiUrl}"><span>ساخته‌شده با AI</span></div>`:''}${s.cands.map((c,i)=>`<div class="it ${s.chosen===i?'sel':''}" data-c="${i}"><img src="${esc(c.thumb)}" crossorigin="anonymous"></div>`).join('')}
   <div class="it ${s.chosen==='dia'?'sel':''}" data-c="dia">📊 شکل ساده</div><div class="it ${s.chosen==='none'?'sel':''}" data-c="none">بدون تصویر</div></div>
  <div class="r"><input type="text" class="wq" dir="ltr" value="${esc(s.queries[0]||'')}" style="flex:1;min-width:120px"><button class="wsr">🔍 جستجو</button>${AI.ikey?'<button class="wai">🤖 ساخت با AI</button>':''}</div></div>`).join('')+'<div class="r"><button class="on" id="wk">✅ ساخت ارائه</button></div>'};
 render();q('#wg').style.display='none';
 const sync=()=>q('#wr').querySelectorAll('.wc').forEach(c=>{const s=slides[+c.dataset.k];s.title=c.querySelector('.wt').value.trim();s.bullets=c.querySelector('.wb').value.split('\n').map(x=>x.trim()).filter(Boolean);s.queries[0]=c.querySelector('.wq').value.trim()});
 q('#wr').onclick=async e=>{const card=e.target.closest('.wc');if(!card)return;const s=slides[+card.dataset.k];
  const it=e.target.closest('.it');if(it){sync();const c=it.dataset.c;s.chosen=c==='ai'||c==='dia'||c==='none'?c:+c;render();return}
  if(e.target.closest('.wsr')){sync();const bt=e.target.closest('button');bt.disabled=true;try{s.cands=await wikiSearch(s.queries[0],8);if(s.cands.length)s.chosen=0}catch(err){toast('جستجو ناموفق بود: '+err.message)}render();return}
  if(e.target.closest('.wai')){sync();const bt=e.target.closest('button');bt.disabled=true;bt.textContent='در حال ساختن…';try{s.aiBlob=await aiImage(s.aiPrompt||s.title);s.aiUrl=URL.createObjectURL(s.aiBlob);s.chosen='ai'}catch(err){toast(err.message)}render()}};
 q('#wk').onclick=async()=>{sync();q('#wk').disabled=true;const models=[];let fail=0;
  for(const [k,s] of slides.entries()){q('#ws').textContent=`در حال آماده‌سازی اسلاید ${fa(k+1)} از ${fa(slides.length)}…`;const m={title:s.title,bullets:s.bullets,diagram:false,blob:null,credit:''};
   try{if(s.chosen==='ai')m.blob=s.aiBlob;else if(typeof s.chosen==='number'){const c=s.cands[s.chosen];m.blob=c.blob||(c.blob=await fetchBlob(c.thumb));m.credit=c.credit}else if(s.chosen==='dia')m.diagram=true}catch(e){console.error(e);fail++;m.diagram=!!opt.dia}
   models.push(m)}
  o.remove();await loadGen(models);toast(fail?`ارائه ساخته شد؛ ${fa(fail)} عکس دانلود نشد`:'ارائه ساخته شد؛ از ☰ می‌توانی pptx بگیری یا کلیپ بسازی')}}
// ---------- generated deck: renderer + switch back to the original file
async function loadGen(models){stash={src,ink,rdo,ovl,cur};for(const m of models)if(m.blob){try{m.bm=await createImageBitmap(m.blob)}catch{m.bm=null}}
 src={kind:'gen',n:models.length,ratio:9/16,name:'ارائه‌ی ساخته‌شده',hidden:models.map(()=>false),models,render:async(i,c,w)=>drawGen(c,models[i],w)};
 cache.clear();inkC={};ink={};rdo={};ovl={};objSel=null;cur=0;$('#bk').style.display='';setupSize();await getSlide(0).p;go(0);bar.classList.remove('h')}
function backOrig(){if(!stash)return;({src,ink,rdo,ovl,cur}=stash);stash=null;$('#bk').style.display='none';cache.clear();inkC={};objSel=null;setupSize();go(cur);toast('به فایل اصلی برگشتی')}
const GFONT='Vazirmatn,Tahoma,"Noto Sans Arabic","DejaVu Sans",Arial,sans-serif',DCOL=['#35E0C2','#6C8BFF','#FFD166','#FF5C7A','#9B8CFF'];
function wrapRtl(g,text,maxW){const words=String(text).split(/\s+/).filter(Boolean),lines=[];let c='';for(const w of words){const t=c?c+' '+w:w;if(c&&g.measureText(t).width>maxW){lines.push(c);c=w}else c=t}if(c)lines.push(c);return lines}
function genLayout(m){const vis=!!(m.bm||m.diagram);return{hdr:{x:0,y:0,w:1,h:.17},title:{x:.05,y:.02,w:.9,h:.13},text:vis?{x:.50,y:.22,w:.45,h:.68}:{x:.05,y:.22,w:.9,h:.68},vis:vis?{x:.05,y:.22,w:.41,h:.68}:null,credit:{x:.05,y:.93,w:.9,h:.05}}}
function genMetrics(m,g,w,h){const L=genLayout(m);let ts=h*.07;do{g.font=`bold ${ts}px ${GFONT}`;ts*=.94}while(g.measureText(m.title||'').width>L.title.w*w&&ts>h*.03);ts/=.94;
 const items=m.bullets||[];let bs=h*.05,lines;for(;;){g.font=`${bs}px ${GFONT}`;lines=items.map(t=>wrapRtl(g,t,L.text.w*w-bs*1.3));const tot=lines.reduce((a,l)=>a+l.length,0)*bs*1.4+items.length*bs*.45;if(tot<=L.text.h*h||bs<h*.022)break;bs*=.92}return{ts,bs,lines}}
function diagItems(m){return(m.bullets||[]).slice(0,5).map(t=>t.length>38?t.slice(0,36)+'…':t)}
function drawGen(c,m,w){const h=Math.round(w*9/16);c.width=w;c.height=h;const g=c.getContext('2d'),L=genLayout(m),X=v=>v*w,Y=v=>v*h;
 g.fillStyle='#fff';g.fillRect(0,0,w,h);g.fillStyle='#0E2A47';g.fillRect(0,0,w,Y(.17));g.fillStyle='#35E0C2';g.fillRect(0,Y(.17),w,Y(.008));
 const M=genMetrics(m,g,w,h);g.direction='rtl';g.textAlign='right';g.textBaseline='middle';g.fillStyle='#fff';g.font=`bold ${M.ts}px ${GFONT}`;g.fillText(m.title||'',X(L.title.x+L.title.w),Y(L.title.y+L.title.h/2));
 g.font=`${M.bs}px ${GFONT}`;g.fillStyle='#14213D';let y=Y(L.text.y)+M.bs*.8;const rx=X(L.text.x+L.text.w);
 M.lines.forEach(ls=>{g.fillStyle='#35B7A0';g.beginPath();g.arc(rx-M.bs*.25,y,M.bs*.13,0,7);g.fill();g.fillStyle='#14213D';ls.forEach((t,i)=>{g.fillText(t,rx-M.bs*.7,y);y+=M.bs*1.4});y+=M.bs*.45});
 if(L.vis){const v={x:X(L.vis.x),y:Y(L.vis.y),w:X(L.vis.w),h:Y(L.vis.h)};
  if(m.bm){const s=Math.min(v.w/m.bm.width,v.h/m.bm.height),iw=m.bm.width*s,ih=m.bm.height*s,ix=v.x+(v.w-iw)/2,iy=v.y+(v.h-ih)/2;g.save();g.beginPath();g.roundRect?g.roundRect(ix,iy,iw,ih,h*.02):g.rect(ix,iy,iw,ih);g.clip();g.drawImage(m.bm,ix,iy,iw,ih);g.restore()}
  else{const it=diagItems(m),n=it.length||1,gap=v.h*.07,bh=(v.h-gap*(n-1))/n;g.textAlign='center';it.forEach((t,i)=>{const by=v.y+i*(bh+gap);g.fillStyle=DCOL[i%5];g.beginPath();g.roundRect?g.roundRect(v.x,by,v.w,bh,h*.02):g.rect(v.x,by,v.w,bh);g.fill();g.fillStyle='#14213D';g.font=`bold ${Math.min(M.bs*.9,bh*.32)}px ${GFONT}`;const ls=wrapRtl(g,t,v.w*.9).slice(0,3),lh=Math.min(M.bs*.9,bh*.32)*1.3;ls.forEach((l,j)=>g.fillText(l,v.x+v.w/2,by+bh/2+(j-(ls.length-1)/2)*lh));
   if(i<n-1){g.fillStyle='#8A93A8';g.beginPath();const ax=v.x+v.w/2,ay=by+bh+gap*.15;g.moveTo(ax-gap*.3,ay);g.lineTo(ax+gap*.3,ay);g.lineTo(ax,ay+gap*.7);g.closePath();g.fill()}})}}
 if(m.credit){g.direction='ltr';g.textAlign='left';g.fillStyle='#7A8499';g.font=`${h*.022}px ${GFONT}`;g.fillText('Image: '+m.credit,X(L.credit.x),Y(L.credit.y+L.credit.h/2))}}
// ---------- editable .pptx of the generated deck
const xe=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
async function exportGenPptx(){sh.classList.add('h');bar.classList.add('h');const models=src.models,n=models.length,SW=12192000,SH=6858000,PT=540,tmp=mk(1280,720).getContext('2d');
 const A='http://schemas.openxmlformats.org/drawingml/2006/main',R='http://schemas.openxmlformats.org/officeDocument/2006/relationships',P='http://schemas.openxmlformats.org/presentationml/2006/main',H='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
 const rel=items=>H+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+items.map(([id,t,tg])=>`<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/${t}" Target="${tg}"/>`).join('')+'</Relationships>';
 const ns=`xmlns:a="${A}" xmlns:r="${R}" xmlns:p="${P}"`,z=new JSZip(),grp='<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>';
 z.file('[Content_Types].xml',H+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpeg" ContentType="image/jpeg"/><Default Extension="png" ContentType="image/png"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>'+Array.from({length:n},(_,i)=>`<Override PartName="/ppt/slides/slide${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join('')+'</Types>');
 z.file('_rels/.rels',rel([['rId1','officeDocument','ppt/presentation.xml']]));
 z.file('ppt/presentation.xml',H+`<p:presentation ${ns}><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>${Array.from({length:n},(_,i)=>`<p:sldId id="${256+i}" r:id="rId${i+2}"/>`).join('')}</p:sldIdLst><p:sldSz cx="${SW}" cy="${SH}"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>`);
 z.file('ppt/_rels/presentation.xml.rels',rel([['rId1','slideMaster','slideMasters/slideMaster1.xml'],...Array.from({length:n},(_,i)=>[`rId${i+2}`,'slide',`slides/slide${i+1}.xml`])]));
 z.file('ppt/slideMasters/slideMaster1.xml',H+`<p:sldMaster ${ns}><p:cSld><p:bg><p:bgRef idx="1001"><a:schemeClr val="bg1"/></p:bgRef></p:bg><p:spTree>${grp}</p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst><p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles></p:sldMaster>`);
 z.file('ppt/slideMasters/_rels/slideMaster1.xml.rels',rel([['rId1','slideLayout','../slideLayouts/slideLayout1.xml'],['rId2','theme','../theme/theme1.xml']]));
 z.file('ppt/slideLayouts/slideLayout1.xml',H+`<p:sldLayout ${ns} type="blank" preserve="1"><p:cSld name="Blank"><p:spTree>${grp}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`);
 z.file('ppt/slideLayouts/_rels/slideLayout1.xml.rels',rel([['rId1','slideMaster','../slideMasters/slideMaster1.xml']]));
 const sf='<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>',lnS='<a:ln w="6350">'+sf+'</a:ln>';
 z.file('ppt/theme/theme1.xml',H+`<a:theme xmlns:a="${A}" name="Office"><a:themeElements><a:clrScheme name="Office"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1><a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="44546A"/></a:dk2><a:lt2><a:srgbClr val="E7E6E6"/></a:lt2><a:accent1><a:srgbClr val="4472C4"/></a:accent1><a:accent2><a:srgbClr val="ED7D31"/></a:accent2><a:accent3><a:srgbClr val="A5A5A5"/></a:accent3><a:accent4><a:srgbClr val="FFC000"/></a:accent4><a:accent5><a:srgbClr val="5B9BD5"/></a:accent5><a:accent6><a:srgbClr val="70AD47"/></a:accent6><a:hlink><a:srgbClr val="0563C1"/></a:hlink><a:folHlink><a:srgbClr val="954F72"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst>${sf}${sf}${sf}</a:fillStyleLst><a:lnStyleLst>${lnS}${lnS}${lnS}</a:lnStyleLst><a:effectStyleLst>${'<a:effectStyle><a:effectLst/></a:effectStyle>'.repeat(3)}</a:effectStyleLst><a:bgFillStyleLst>${sf}${sf}${sf}</a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>`);
 const E=(fx,fy)=>[Math.round(fx*SW),Math.round(fy*SH)];let id=1;
 const rect=(x,y,w,h,fill,prst,text,pt,color,bold)=>{id++;const [ox,oy]=E(x,y),[cx,cy]=E(w,h);return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="Shape ${id}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${ox}" y="${oy}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="${prst||'rect'}"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="${fill}"/></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr>${text!=null?`<p:txBody><a:bodyPr wrap="square" lIns="45720" rIns="45720" anchor="ctr"><a:normAutofit/></a:bodyPr><a:lstStyle/><a:p><a:pPr algn="ctr" rtl="1"/><a:r><a:rPr lang="fa-IR" sz="${Math.round(pt*100)}" b="${bold?1:0}"><a:solidFill><a:srgbClr val="${color}"/></a:solidFill><a:latin typeface="Tahoma"/><a:cs typeface="B Nazanin"/></a:rPr><a:t>${xe(text)}</a:t></a:r></a:p></p:txBody>`:'<p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="fa-IR"/></a:p></p:txBody>'}</p:sp>`};
 const tbox=(x,y,w,h,paras,anchor)=>{id++;const [ox,oy]=E(x,y),[cx,cy]=E(w,h);return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="Text ${id}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${ox}" y="${oy}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square" lIns="0" rIns="0" anchor="${anchor||'t'}"><a:normAutofit/></a:bodyPr><a:lstStyle/>${paras}</p:txBody></p:sp>`};
 const para=(t,pt,color,o)=>`<a:p><a:pPr algn="${o.algn||'r'}" rtl="${o.rtl===0?0:1}"${o.bu?' marL="285750" indent="-285750"':''}>${o.bu?'<a:spcBef><a:spcPts val="900"/></a:spcBef><a:buFont typeface="Arial"/><a:buChar char="•"/>':''}</a:pPr><a:r><a:rPr lang="${o.rtl===0?'en-US':'fa-IR'}" sz="${Math.round(pt*100)}" b="${o.b?1:0}"><a:solidFill><a:srgbClr val="${color}"/></a:solidFill><a:latin typeface="Tahoma"/><a:cs typeface="B Nazanin"/></a:rPr><a:t>${xe(t)}</a:t></a:r></a:p>`;
 for(let i=0;i<n;i++){const m=models[i],L=genLayout(m),M=genMetrics(m,tmp,1280,720),k=PT/720;let body='';id=1;
  body+=rect(0,0,1,.17,'0E2A47');body+=rect(0,.17,1,.008,'35E0C2');
  body+=tbox(L.title.x,L.title.y,L.title.w,L.title.h,para(m.title||'',M.ts*k,'FFFFFF',{b:1}),'ctr');
  if(m.bullets&&m.bullets.length)body+=tbox(L.text.x,L.text.y,L.text.w,L.text.h,m.bullets.map(t=>para(t,M.bs*k,'14213D',{bu:1})).join(''),'t');
  let pic='',relx=[['rId1','slideLayout','../slideLayouts/slideLayout1.xml']];
  if(L.vis&&m.blob&&m.bm){const png=m.blob.type.includes('png'),ext=png?'png':'jpeg',s=Math.min(L.vis.w*SW/m.bm.width,L.vis.h*SH/m.bm.height),iw=Math.round(m.bm.width*s),ih=Math.round(m.bm.height*s),ox=Math.round(L.vis.x*SW+(L.vis.w*SW-iw)/2),oy=Math.round(L.vis.y*SH+(L.vis.h*SH-ih)/2);
   z.file(`ppt/media/image${i+1}.${ext}`,m.blob);relx.push(['rId2','image',`../media/image${i+1}.${ext}`]);id++;
   pic=`<p:pic><p:nvPicPr><p:cNvPr id="${id}" name="Picture ${id}" descr="${xe(m.title)}"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="rId2"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="${ox}" y="${oy}"/><a:ext cx="${iw}" cy="${ih}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>`}
  else if(L.vis&&m.diagram){const it=diagItems(m),nn=it.length||1,gap=L.vis.h*.07,bh=(L.vis.h-gap*(nn-1))/nn;it.forEach((t,j)=>{const by=L.vis.y+j*(bh+gap);pic+=rect(L.vis.x,by,L.vis.w,bh,DCOL[j%5].slice(1),'roundRect',t,Math.min(M.bs*.9,bh*720*.32)*k,'14213D',1);if(j<nn-1)pic+=rect(L.vis.x+L.vis.w/2-gap*.3*.5/1.0*0-.015,by+bh+gap*.12,.03,gap*.76,'8A93A8','downArrow')})}
  body+=pic;if(m.credit)body+=tbox(L.credit.x,L.credit.y,L.credit.w,L.credit.h,para('Image: '+m.credit,9,'7A8499',{algn:'l',rtl:0}),'ctr');
  z.file(`ppt/slides/slide${i+1}.xml`,H+`<p:sld ${ns}><p:cSld><p:spTree>${grp}${body}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`);z.file(`ppt/slides/_rels/slide${i+1}.xml.rels`,rel(relx))}
 const out=await z.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.presentationml.presentation',compression:'DEFLATE'});dlBlob(out,'ارائه-ساخته-شده.pptx');toast('پاورپوینت قابل‌ویرایش ساخته شد')}
