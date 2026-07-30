/* ============================================================
   تخته هوشمند تدریس - Smart Teaching Whiteboard PWA
   Single-app logic: canvas drawing, boards/tabs, file upload,
   undo/redo, zoom, screen+mic(+webcam) recording, autosave.

   NOTE ON SIZING: each board has its OWN logical resolution
   (board.width / board.height) instead of one fixed 16:9 size.
   - A blank new board takes the aspect ratio of the current
     screen (portrait on phone, landscape on laptop) so it
     fills the whole visible area with no empty bars.
   - An uploaded image/PDF page takes the image's own aspect
     ratio, so it fills its board edge-to-edge (no letterboxing)
     instead of floating small inside a mismatched 16:9 canvas.
   ============================================================ */

// ---------- Constants ----------
const MAX_DIM = 1400;      // longer-side resolution cap (quality vs. mobile pen-thickness balance)
const AUTOSAVE_KEY = 'wb_autosave_v1';
const AUTOSAVE_INTERVAL = 30000; // 30s
const SWATCHES = ['#1c1b18','#2f6f5e','#b3452f','#2662d9','#d9a72f','#8a3fd1','#ffffff','#e0725a'];

// ---------- State ----------
let boards = [];          // {id, name, width, height, bgDataUrl, strokes:[], undo:[], redo:[]}
let currentBoardIdx = 0;
let tool = 'pen';
let color = '#2f6f5e';
let size = 4;
let drawing = false;
let currentStroke = null;
let startPt = null;
let zoomScale = 1;
let isRecording = false;
let mediaRecorder = null;
let recordedChunks = [];
let recTimerInterval = null;
let recSeconds = 0;
let webcamStream = null;
let compositeRAF = null;
let pipPos = {xPct:0.86, yPct:0.84};
let pipDragging = false;

// ---------- DOM ----------
const bgCanvas = document.getElementById('bgCanvas');
const drawCanvas = document.getElementById('drawCanvas');
const bgCtx = bgCanvas.getContext('2d');
const drawCtx = drawCanvas.getContext('2d');
const stage = document.getElementById('stage');
const stageWrap = document.getElementById('stage-wrap');
const tabsbar = document.getElementById('tabsbar');
const statusEl = document.getElementById('status');
const saveIndicator = document.getElementById('saveIndicator');
const toast = document.getElementById('toast');

function currentBoard(){ return boards[currentBoardIdx]; }

// Compute a board size that matches the CURRENT viewport's aspect ratio,
// so a blank board fills the screen fully (portrait on phone, landscape on laptop).
function computeViewportBoardSize(){
  const wrapW = Math.max(200, stageWrap.clientWidth - 24);
  const wrapH = Math.max(200, stageWrap.clientHeight - 24);
  const aspect = wrapW / wrapH;
  let w, h;
  if(aspect >= 1){ w = MAX_DIM; h = Math.round(MAX_DIM / aspect); }
  else { h = MAX_DIM; w = Math.round(MAX_DIM * aspect); }
  return { w, h };
}

// Resize the actual <canvas> backing store to match a board's logical size.
// (Changing canvas.width/height clears it, so caller must redraw after.)
function resizeCanvasesToBoard(board){
  [bgCanvas, drawCanvas].forEach(c=>{ c.width = board.width; c.height = board.height; });
}

function sizeStage(){
  const b = currentBoard();
  if(!b) return;
  const wrapW = stageWrap.clientWidth - 24;
  const wrapH = stageWrap.clientHeight - 24;
  // Base fit already matches the board's own aspect ratio (chosen at creation time),
  // so this naturally fills the screen without shrinking into empty bars.
  const baseScale = Math.min(wrapW / b.width, wrapH / b.height);
  const scale = baseScale * zoomScale;
  const dispW = b.width * scale, dispH = b.height * scale;
  stage.style.width = dispW + 'px';
  stage.style.height = dispH + 'px';
  [bgCanvas, drawCanvas].forEach(c=>{
    c.style.width = dispW + 'px';
    c.style.height = dispH + 'px';
  });
  document.getElementById('zoomLabel').textContent = Math.round(zoomScale*100) + '%';
}
window.addEventListener('resize', sizeStage);

// ---------- Boards / Tabs ----------
function newBoard(name, w, h){
  if(!w || !h){ const vp = computeViewportBoardSize(); w = vp.w; h = vp.h; }
  return { id: 'b'+Date.now()+Math.random().toString(36).slice(2,6), name: name||('صفحه '+(boards.length+1)), width:w, height:h, bgDataUrl:null, strokes:[], undo:[], redo:[] };
}
function addBoard(name, w, h){
  const b = newBoard(name, w, h);
  boards.push(b);
  switchBoard(boards.length-1);
  renderTabs();
  return b;
}
function switchBoard(idx){
  if(isRecording){ showToast('در حین ضبط نمی‌توان صفحه را عوض کرد'); return; }
  currentBoardIdx = idx;
  const b = currentBoard();
  resizeCanvasesToBoard(b);
  loadBoardBg();
  redrawAll();
  renderTabs();
  sizeStage();
}
function renderTabs(){
  tabsbar.innerHTML = '';
  boards.forEach((b,i)=>{
    const tab = document.createElement('div');
    tab.className = 'tab' + (i===currentBoardIdx ? ' active':'');
    tab.innerHTML = `<span>${b.name}</span>` + (boards.length>1 ? `<span class="close-tab" data-i="${i}">✕</span>`:'');
    tab.addEventListener('click', (e)=>{
      if(e.target.classList.contains('close-tab')){
        e.stopPropagation();
        removeBoard(i);
      } else {
        switchBoard(i);
      }
    });
    tabsbar.appendChild(tab);
  });
  const addTab = document.createElement('div');
  addTab.className = 'tab-add';
  addTab.textContent = '+ صفحه جدید';
  addTab.addEventListener('click', ()=> addBoard());
  tabsbar.appendChild(addTab);
}
function removeBoard(i){
  if(boards.length<=1) return;
  boards.splice(i,1);
  if(currentBoardIdx>=boards.length) currentBoardIdx = boards.length-1;
  switchBoard(currentBoardIdx);
}
function loadBoardBg(){
  const b = currentBoard();
  bgCtx.clearRect(0,0,b.width,b.height);
  if(b.bgDataUrl){
    const img = new Image();
    img.onload = ()=>{
      if(currentBoard() !== b) return; // user switched away before image loaded
      // Board resolution already matches this image's own aspect ratio
      // (set at import time), so draw full-bleed with no bars.
      bgCtx.clearRect(0,0,b.width,b.height);
      bgCtx.drawImage(img,0,0,b.width,b.height);
    };
    img.src = b.bgDataUrl;
  }
}

// ---------- Drawing ----------
function redrawAll(){
  const b = currentBoard();
  drawCtx.clearRect(0,0,b.width,b.height);
  b.strokes.forEach(s=> renderStroke(drawCtx, s));
}
function renderStroke(ctx, s){
  ctx.save();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = s.color; ctx.lineWidth = s.size;
  ctx.globalCompositeOperation = (s.type==='eraser') ? 'destination-out' : 'source-over';
  if(s.type==='pen' || s.type==='eraser'){
    ctx.beginPath();
    s.points.forEach((p,i)=> i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
    ctx.stroke();
  } else if(s.type==='line' || s.type==='ruler'){
    ctx.beginPath(); ctx.moveTo(s.x1,s.y1); ctx.lineTo(s.x2,s.y2); ctx.stroke();
  } else if(s.type==='rect'){
    ctx.strokeRect(Math.min(s.x1,s.x2), Math.min(s.y1,s.y2), Math.abs(s.x2-s.x1), Math.abs(s.y2-s.y1));
  } else if(s.type==='circle'){
    const rx = Math.abs(s.x2-s.x1)/2, ry = Math.abs(s.y2-s.y1)/2;
    const cx = (s.x1+s.x2)/2, cy = (s.y1+s.y2)/2;
    ctx.beginPath(); ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2); ctx.stroke();
  } else if(s.type==='triangle'){
    const cx=(s.x1+s.x2)/2;
    ctx.beginPath();
    ctx.moveTo(cx,Math.min(s.y1,s.y2));
    ctx.lineTo(s.x1,Math.max(s.y1,s.y2));
    ctx.lineTo(s.x2,Math.max(s.y1,s.y2));
    ctx.closePath(); ctx.stroke();
  } else if(s.type==='text'){
    ctx.fillStyle = s.color;
    ctx.font = `${s.size*5}px 'Vazirmatn',sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText(s.text, s.x1, s.y1);
  }
  ctx.restore();
}

function pushHistory(){
  const b = currentBoard();
  b.undo.push(JSON.stringify(b.strokes));
  if(b.undo.length>60) b.undo.shift();
  b.redo = [];
}
function undo(){
  const b = currentBoard();
  if(!b.undo.length) return;
  b.redo.push(JSON.stringify(b.strokes));
  b.strokes = JSON.parse(b.undo.pop());
  redrawAll();
}
function redo(){
  const b = currentBoard();
  if(!b.redo.length) return;
  b.undo.push(JSON.stringify(b.strokes));
  b.strokes = JSON.parse(b.redo.pop());
  redrawAll();
}

function getPos(e){
  const b = currentBoard();
  const rect = drawCanvas.getBoundingClientRect();
  const scaleX = b.width / rect.width, scaleY = b.height / rect.height;
  const cx = (e.touches ? e.touches[0].clientX : e.clientX);
  const cy = (e.touches ? e.touches[0].clientY : e.clientY);
  return { x: (cx-rect.left)*scaleX, y: (cy-rect.top)*scaleY };
}

function onPointerDown(e){
  if(pipDragging) return;
  e.preventDefault();
  drawing = true;
  const p = getPos(e);
  startPt = p;
  if(tool==='pen' || tool==='eraser'){
    currentStroke = { type: tool, color: tool==='eraser'?'#000000':color, size: tool==='eraser'? size*3 : size, points:[p] };
  } else if(tool==='text'){
    const txt = window.prompt('متن مورد نظر را وارد کنید:');
    drawing = false;
    if(txt){
      pushHistory();
      currentBoard().strokes.push({type:'text', color, size, x1:p.x, y1:p.y, text:txt});
      redrawAll();
    }
    return;
  } else {
    currentStroke = { type: tool==='ruler'?'ruler':tool, color, size, x1:p.x, y1:p.y, x2:p.x, y2:p.y };
  }
}
function onPointerMove(e){
  if(!drawing || !currentStroke) return;
  e.preventDefault();
  const p = getPos(e);
  if(currentStroke.type==='pen' || currentStroke.type==='eraser'){
    currentStroke.points.push(p);
  } else {
    currentStroke.x2 = p.x; currentStroke.y2 = p.y;
    if(currentStroke.type==='ruler'){
      const ang = Math.atan2(p.y-startPt.y, p.x-startPt.x) * 180/Math.PI;
      statusEl.textContent = `📐 زاویه: ${ang.toFixed(1)}°`;
    }
  }
  redrawAll();
  renderStroke(drawCtx, currentStroke);
}
function onPointerUp(e){
  if(!drawing) return;
  drawing = false;
  if(currentStroke){
    pushHistory();
    currentBoard().strokes.push(currentStroke);
    currentStroke = null;
  }
  redrawAll();
  statusEl.textContent = '🖊️ آماده';
}
drawCanvas.addEventListener('pointerdown', onPointerDown);
drawCanvas.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);
drawCanvas.addEventListener('pointerleave', ()=>{});

// ---------- Toolbar ----------
document.querySelectorAll('.tool-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tool-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    tool = btn.dataset.tool;
  });
});
const colorSwatchesEl = document.getElementById('colorSwatches');
SWATCHES.forEach(c=>{
  const sw = document.createElement('div');
  sw.className = 'swatch' + (c===color?' selected':'');
  sw.style.background = c;
  sw.style.boxShadow = c==='#ffffff' ? 'inset 0 0 0 1px #ccc' : '';
  sw.addEventListener('click', ()=>{
    color = c;
    document.querySelectorAll('.swatch').forEach(s=>s.classList.remove('selected'));
    sw.classList.add('selected');
    document.getElementById('colorPicker').value = c;
  });
  colorSwatchesEl.appendChild(sw);
});
document.getElementById('colorPicker').addEventListener('input', (e)=>{ color = e.target.value; });
document.getElementById('sizeRange').addEventListener('input', (e)=>{
  size = +e.target.value;
  document.getElementById('sizeLabel').textContent = size;
});

document.getElementById('btnUndo').addEventListener('click', undo);
document.getElementById('btnRedo').addEventListener('click', redo);
document.getElementById('btnClear').addEventListener('click', ()=>{
  if(confirm('کل این صفحه پاک بشه؟ (فایل آپلودشده باقی می‌مونه)')){
    pushHistory();
    currentBoard().strokes = [];
    redrawAll();
  }
});
window.addEventListener('keydown', (e)=>{
  if(e.ctrlKey && e.key.toLowerCase()==='z'){ e.preventDefault(); undo(); }
  if(e.ctrlKey && (e.key.toLowerCase()==='y' || (e.shiftKey && e.key.toLowerCase()==='z'))){ e.preventDefault(); redo(); }
});

// ---------- Zoom ----------
document.getElementById('zoomIn').addEventListener('click', ()=>{ zoomScale = Math.min(4, zoomScale+0.15); sizeStage(); });
document.getElementById('zoomOut').addEventListener('click', ()=>{ zoomScale = Math.max(0.3, zoomScale-0.15); sizeStage(); });
document.getElementById('zoomReset').addEventListener('click', ()=>{ zoomScale = 1; sizeStage(); });

// Pinch-to-zoom (two-finger) support for touch devices
let pinchStartDist = null, pinchStartScale = 1;
stageWrap.addEventListener('touchstart', (e)=>{
  if(e.touches.length===2){
    pinchStartDist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
    pinchStartScale = zoomScale;
  }
}, {passive:true});
stageWrap.addEventListener('touchmove', (e)=>{
  if(e.touches.length===2 && pinchStartDist){
    const dist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
    zoomScale = Math.min(4, Math.max(0.3, pinchStartScale * (dist/pinchStartDist)));
    sizeStage();
  }
}, {passive:true});
stageWrap.addEventListener('touchend', (e)=>{ if(e.touches.length<2) pinchStartDist = null; });

// ---------- Theme ----------
function applyTheme(t){
  document.body.dataset.theme = t;
  localStorage.setItem('wb_theme', t);
  document.getElementById('btnTheme').textContent = t==='dark' ? '☀️' : '🌙';
}
document.getElementById('btnTheme').addEventListener('click', ()=>{
  applyTheme(document.body.dataset.theme==='dark' ? 'light' : 'dark');
});
applyTheme(localStorage.getItem('wb_theme') || 'light');

// ---------- Fullscreen ----------
document.getElementById('btnFullscreen').addEventListener('click', ()=>{
  if(!document.fullscreenElement){
    document.documentElement.requestFullscreen?.().catch(()=>{});
  } else {
    document.exitFullscreen?.();
  }
});

// ---------- File upload (image / PDF) ----------
document.getElementById('btnUpload').addEventListener('click', ()=> document.getElementById('hiddenFileInput').click());
document.getElementById('hiddenFileInput').addEventListener('change', async (e)=>{
  const files = Array.from(e.target.files || []);
  for(const file of files){
    if(file.type==='application/pdf'){
      await importPdf(file);
    } else if(file.type.startsWith('image/')){
      await importImage(file);
    }
  }
  e.target.value = '';
});
function fileToDataUrl(file){
  return new Promise((res,rej)=>{
    const r = new FileReader();
    r.onload = ()=>res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
function naturalImageSize(dataUrl){
  return new Promise((res)=>{
    const img = new Image();
    img.onload = ()=> res({w:img.naturalWidth, h:img.naturalHeight});
    img.src = dataUrl;
  });
}
function fitToMaxDim(w,h){
  const scale = Math.min(1, MAX_DIM / Math.max(w,h));
  return { w: Math.round(w*scale), h: Math.round(h*scale) };
}
async function importImage(file){
  const dataUrl = await fileToDataUrl(file);
  const nat = await naturalImageSize(dataUrl);
  const {w,h} = fitToMaxDim(nat.w, nat.h);
  const b = addBoard(file.name.slice(0,18), w, h);
  b.bgDataUrl = dataUrl;
  loadBoardBg();
  showToast('عکس اضافه شد ✅');
}
async function importPdf(file){
  showToast('در حال بارگذاری PDF... ⏳');
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({data:buf}).promise;
  for(let p=1; p<=pdf.numPages; p++){
    const page = await pdf.getPage(p);
    const baseViewport = page.getViewport({scale:1});
    const {w,h} = fitToMaxDim(baseViewport.width, baseViewport.height);
    const renderScale = w / baseViewport.width;
    const viewport = page.getViewport({scale: Math.max(renderScale, 2)}); // render crisp, then it's stored at board res
    const tmp = document.createElement('canvas');
    tmp.width = viewport.width; tmp.height = viewport.height;
    await page.render({canvasContext: tmp.getContext('2d'), viewport}).promise;
    const b = addBoard(file.name.slice(0,10)+' ص'+p, w, h);
    b.bgDataUrl = tmp.toDataURL('image/jpeg', 0.9);
  }
  loadBoardBg();
  showToast(`PDF اضافه شد (${pdf.numPages} صفحه) ✅`);
}

// ---------- Export ----------
function compositeToCanvas(){
  const b = currentBoard();
  const tmp = document.createElement('canvas');
  tmp.width = b.width; tmp.height = b.height;
  const ctx = tmp.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0,0,b.width,b.height);
  ctx.drawImage(bgCanvas,0,0);
  ctx.drawImage(drawCanvas,0,0);
  return tmp;
}
document.getElementById('btnExportPng').addEventListener('click', ()=>{
  const tmp = compositeToCanvas();
  const a = document.createElement('a');
  a.download = `تخته-${currentBoard().name}-${Date.now()}.png`;
  a.href = tmp.toDataURL('image/png');
  a.click();
});
document.getElementById('btnExportPdf').addEventListener('click', async ()=>{
  if(!window.jspdf){ showToast('کتابخانه PDF بارگذاری نشد'); return; }
  const { jsPDF } = window.jspdf;
  let pdf = null;
  const prevIdx = currentBoardIdx;
  for(let i=0;i<boards.length;i++){
    switchBoard(i);
    await new Promise(r=>setTimeout(r,150)); // wait bg image draw
    const b = boards[i];
    const tmp = compositeToCanvas();
    const orientation = b.width >= b.height ? 'landscape' : 'portrait';
    if(!pdf){
      pdf = new jsPDF({orientation, unit:'px', format:[b.width, b.height]});
    } else {
      pdf.addPage([b.width, b.height], orientation);
    }
    pdf.addImage(tmp.toDataURL('image/jpeg',0.9), 'JPEG', 0,0, b.width, b.height);
  }
  switchBoard(prevIdx);
  pdf.save(`تخته-${Date.now()}.pdf`);
});

// ---------- Autosave ----------
function serializeBoards(){
  return boards.map(b=>({id:b.id,name:b.name,width:b.width,height:b.height,bgDataUrl:b.bgDataUrl,strokes:b.strokes}));
}
function autosave(){
  try{
    const data = { boards: serializeBoards(), ts: Date.now() };
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
    saveIndicator.textContent = '✅ ذخیره شد ' + new Date().toLocaleTimeString('fa-IR');
  }catch(err){
    saveIndicator.textContent = '⚠️ فضای ذخیره پر است';
    showToast('حافظه محلی پر شده؛ فایل‌های حجیم را حذف یا خروجی بگیرید.');
  }
}
setInterval(autosave, AUTOSAVE_INTERVAL);
window.addEventListener('beforeunload', autosave);

function restoreAutosave(){
  const raw = localStorage.getItem(AUTOSAVE_KEY);
  if(!raw) return false;
  try{
    const data = JSON.parse(raw);
    if(data.boards && data.boards.length){
      boards = data.boards.map(b=>{
        let {width,height} = b;
        if(!width || !height){ const vp = computeViewportBoardSize(); width = vp.w; height = vp.h; }
        return {...b, width, height, undo:[], redo:[]};
      });
      currentBoardIdx = 0;
      resizeCanvasesToBoard(currentBoard());
      renderTabs();
      loadBoardBg();
      redrawAll();
      return true;
    }
  }catch(e){}
  return false;
}

// ---------- Toast ----------
let toastTimer;
function showToast(msg){
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toast.classList.remove('show'), 3000);
}

// ================= RECORDING =================
const recordModalBack = document.getElementById('recordModalBack');
const btnRecord = document.getElementById('btnRecord');
const webcamPip = document.getElementById('webcamPip');
const webcamVideo = document.getElementById('webcamVideo');
const recTimerEl = document.getElementById('recTimer');

btnRecord.addEventListener('click', ()=>{
  if(isRecording){ stopRecording(); }
  else { recordModalBack.classList.add('show'); }
});
document.getElementById('btnCancelRecord').addEventListener('click', ()=> recordModalBack.classList.remove('show'));
document.getElementById('btnStartRecordConfirm').addEventListener('click', async ()=>{
  recordModalBack.classList.remove('show');
  const wantWebcam = document.getElementById('chkWebcam').checked;
  await startRecording(wantWebcam);
});

async function startRecording(wantWebcam){
  try{
    const board = currentBoard();
    const W = board.width, H = board.height;
    const micStream = await navigator.mediaDevices.getUserMedia({audio:true});
    let camStream = null;
    if(wantWebcam){
      try{
        camStream = await navigator.mediaDevices.getUserMedia({video:{width:320,height:320}});
        webcamVideo.srcObject = camStream;
        webcamPip.style.display = 'block';
        webcamStream = camStream;
      }catch(err){
        showToast('دسترسی به دوربین ممکن نشد؛ فقط صدا ضبط می‌شود');
      }
    }
    // composite canvas for baking board + webcam together (fixed to this board's size for the whole recording)
    const composite = document.createElement('canvas');
    composite.width = W; composite.height = H;
    const cctx = composite.getContext('2d');

    function drawFrame(){
      cctx.fillStyle = '#fff'; cctx.fillRect(0,0,W,H);
      cctx.drawImage(bgCanvas,0,0,W,H);
      cctx.drawImage(drawCanvas,0,0,W,H);
      if(webcamStream && webcamVideo.readyState>=2){
        const r = Math.min(W,H)*0.14;
        const cx = pipPos.xPct*W, cy = pipPos.yPct*H;
        cctx.save();
        cctx.beginPath();
        if(webcamPip.classList.contains('rect')){
          cctx.rect(cx-r*1.4, cy-r, r*2.8, r*2);
        } else {
          cctx.arc(cx, cy, r, 0, Math.PI*2);
        }
        cctx.closePath(); cctx.clip();
        cctx.drawImage(webcamVideo, cx-r*1.4, cy-r, r*2.8, r*2);
        cctx.restore();
        cctx.lineWidth = 4; cctx.strokeStyle = getAccentColor();
        cctx.beginPath();
        if(webcamPip.classList.contains('rect')) cctx.rect(cx-r*1.4, cy-r, r*2.8, r*2);
        else cctx.arc(cx, cy, r, 0, Math.PI*2);
        cctx.stroke();
      }
      compositeRAF = requestAnimationFrame(drawFrame);
    }
    drawFrame();

    const canvasStream = composite.captureStream(30);
    const mixedStream = new MediaStream([...canvasStream.getVideoTracks(), ...micStream.getAudioTracks()]);

    const mimeCandidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];
    const mimeType = mimeCandidates.find(m=> MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) || '';

    recordedChunks = [];
    mediaRecorder = new MediaRecorder(mixedStream, mimeType ? {mimeType, videoBitsPerSecond: 2_500_000} : undefined);
    mediaRecorder.ondataavailable = (e)=>{ if(e.data.size>0) recordedChunks.push(e.data); };
    mediaRecorder.onstop = ()=>{
      cancelAnimationFrame(compositeRAF);
      micStream.getTracks().forEach(t=>t.stop());
      if(camStream) camStream.getTracks().forEach(t=>t.stop());
      webcamPip.style.display = 'none';
      webcamStream = null;
      const blob = new Blob(recordedChunks, {type: mimeType.split(';')[0] || 'video/webm'});
      const ext = (mimeType.includes('mp4')) ? 'mp4' : 'webm';
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `ضبط-کلاس-${Date.now()}.${ext}`;
      a.click();
      showToast('فیلم ذخیره شد ✅ (فرمت: ' + ext.toUpperCase() + ')');
    };
    mediaRecorder.start(1000);
    isRecording = true;
    btnRecord.textContent = '⏹️ توقف ضبط';
    btnRecord.classList.add('recording');
    recSeconds = 0;
    recTimerEl.style.display = 'inline';
    recTimerInterval = setInterval(()=>{
      recSeconds++;
      const m = String(Math.floor(recSeconds/60)).padStart(2,'0');
      const s = String(recSeconds%60).padStart(2,'0');
      recTimerEl.textContent = `${m}:${s}`;
    },1000);
  }catch(err){
    console.error(err);
    showToast('اجازه دسترسی به میکروفون داده نشد ❌');
  }
}
function stopRecording(){
  if(mediaRecorder && mediaRecorder.state!=='inactive') mediaRecorder.stop();
  isRecording = false;
  btnRecord.textContent = '⏺️ شروع ضبط';
  btnRecord.classList.remove('recording');
  clearInterval(recTimerInterval);
  recTimerEl.style.display = 'none';
}
function getAccentColor(){
  return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#2f6f5e';
}

// webcam PIP drag + double-click to toggle circle/rect
webcamPip.addEventListener('pointerdown', (e)=>{
  pipDragging = true;
  webcamPip.classList.add('dragging');
  webcamPip.setPointerCapture(e.pointerId);
});
webcamPip.addEventListener('pointermove', (e)=>{
  if(!pipDragging) return;
  const rect = stage.getBoundingClientRect();
  let xPct = (e.clientX - rect.left) / rect.width;
  let yPct = (e.clientY - rect.top) / rect.height;
  xPct = Math.min(0.95, Math.max(0.05, xPct));
  yPct = Math.min(0.95, Math.max(0.05, yPct));
  pipPos = {xPct, yPct};
  webcamPip.style.left = (xPct*rect.width - webcamPip.offsetWidth/2) + 'px';
  webcamPip.style.top = (yPct*rect.height - webcamPip.offsetHeight/2) + 'px';
});
webcamPip.addEventListener('pointerup', (e)=>{
  pipDragging = false;
  webcamPip.classList.remove('dragging');
});
webcamPip.addEventListener('dblclick', ()=> webcamPip.classList.toggle('rect'));

// ---------- Init ----------
function init(){
  if(!restoreAutosave()){
    addBoard('صفحه ۱');
  }
  sizeStage();
  showToast('👋 خوش اومدی! تخته آماده‌ست.');
}
init();
