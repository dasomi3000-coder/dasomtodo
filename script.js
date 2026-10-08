(function(){
const $=id=>document.getElementById(id);
// ===== 슬롯(고정 좌표, 무대 360x640 기준) =====
const SLOTS={date:{x:16,y:20,w:200,h:26},settings:{x:316,y:18,w:28,h:28},
studyHead:{x:14,y:58,w:196,h:34},studyList:{x:20,y:96,w:184,h:392},studyAdd:{x:20,y:492,w:184,h:34},
timeLabel:{x:222,y:66,w:124,h:18},timeValue:{x:222,y:86,w:124,h:40},
rateBad:{x:226,y:140,w:30,h:30},rateNormal:{x:269,y:140,w:30,h:30},rateGood:{x:312,y:140,w:30,h:30},
etcHead:{x:222,y:192,w:124,h:34},etcList:{x:226,y:230,w:116,h:258},etcAdd:{x:226,y:492,w:116,h:34},
prev:{x:14,y:560,w:44,h:44},today:{x:112,y:560,w:136,h:44},next:{x:302,y:560,w:44,h:44},
ptTitle:{x:20,y:16,w:260,h:18},ptItem:{x:20,y:40,w:260,h:40},ptHourLbl:{x:40,y:82,w:100,h:16},ptMinLbl:{x:160,y:82,w:100,h:16},
ptHour:{x:40,y:100,w:100,h:44},ptMin:{x:160,y:100,w:100,h:44},ptSkip:{x:20,y:166,w:120,h:44},ptOk:{x:160,y:166,w:120,h:44},
pmTitle:{x:20,y:14,w:260,h:18},pmItem:{x:20,y:36,w:260,h:44},pmDel:{x:20,y:90,w:260,h:40},pmTom:{x:20,y:134,w:260,h:40},pmToday:{x:20,y:178,w:260,h:40},pmCancel:{x:20,y:222,w:260,h:28}};
document.querySelectorAll('[data-slot]').forEach(el=>{const s=SLOTS[el.dataset.slot];Object.assign(el.style,{left:s.x+'px',top:s.y+'px',width:s.w+'px',height:s.h+'px'});});
function fit(){const de=document.documentElement,w=de.clientWidth||innerWidth,h=de.clientHeight||innerHeight,s=Math.min(w/360,h/640),st=$('stage');st.style.transform=`scale(${s})`;st.style.left=(w-360*s)/2+'px';st.style.top=(h-640*s)/2+'px';}
addEventListener('resize',fit);addEventListener('orientationchange',fit);addEventListener('load',fit);if(window.visualViewport)visualViewport.addEventListener('resize',fit);fit();setTimeout(fit,300);setTimeout(fit,1200);
function applyFs(){try{const c=document.createElement('canvas').getContext('2d');c.font='100px sans-serif';const cw=c.measureText('MMMMMMMMMM').width;
  const sp=document.createElement('span');sp.textContent='MMMMMMMMMM';sp.style.cssText='position:absolute;left:-9999px;top:0;visibility:hidden;white-space:nowrap;font:100px sans-serif';
  document.body.appendChild(sp);const dw=sp.getBoundingClientRect().width;sp.remove();
  let r=dw/cw;if(!(r>0.8&&r<3)||Math.abs(r-1)<0.04)r=1;document.documentElement.style.setProperty('--fs',(1/r).toFixed(3));}catch(e){}}
applyFs();addEventListener('load',applyFs);setTimeout(applyFs,500);

// ===== 테마: 이미지 항목(기본값은 코드로 그린 SVG) =====
const sv=(w,h,b)=>'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${b}</svg>`);
const card=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="#fff" stroke="#dbe1e8"/><path d="M${x} ${y+34}V${y+16}a16 16 0 0 1 16-16H${x+w-16}a16 16 0 0 1 16 16V${y+34}Z" fill="#dde1e6"/>`;
const rate=(bg,fg,on,t)=>sv(30,30,`<circle cx="15" cy="15" r="${on?13:14}" fill="${bg}" ${on?`stroke="${fg}" stroke-width="2.5"`:''}/><text x="15" y="18" font-size="${t==='normal'?7:8}" font-weight="700" text-anchor="middle" fill="${fg}" font-family="sans-serif">${t}</text>`);
const ck=on=>sv(18,18,`<rect x="1.5" y="1.5" width="15" height="15" rx="5" fill="${on?'#46577a':'#fff'}" stroke="#46577a" stroke-width="1.6"/>${on?'<path d="M5 9.5l2.8 2.8L13 6.5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>':''}`);
const pr=(x,y,w,h,f)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${f}"/>`;
const SPECS=[
['scene','화면 전체 (배경+공부/기타 카드+ToDo Time 카드)',360,640,()=>sv(360,640,`<rect width="360" height="640" fill="#edf1f5"/>${card(14,58,196,474)}${card(222,192,124,340)}<rect x="222" y="58" width="124" height="74" rx="16" fill="#fff" stroke="#dbe1e8"/>`)],
['checkOff','체크박스 (체크 전)',18,18,()=>ck(0)],['checkOn','체크박스 (체크 후)',18,18,()=>ck(1)],
['rateBadOff','bad 버튼 (선택 전)',30,30,()=>rate('#f3dcdb','#b1524c',0,'bad')],['rateBadOn','bad 버튼 (선택 후)',30,30,()=>rate('#f3dcdb','#b1524c',1,'bad')],
['rateNormalOff','normal 버튼 (선택 전)',30,30,()=>rate('#e7eaee','#626b76',0,'normal')],['rateNormalOn','normal 버튼 (선택 후)',30,30,()=>rate('#e7eaee','#626b76',1,'normal')],
['rateGoodOff','good 버튼 (선택 전)',30,30,()=>rate('#d8e6f4','#3f6a94',0,'good')],['rateGoodOn','good 버튼 (선택 후)',30,30,()=>rate('#d8e6f4','#3f6a94',1,'good')],
['today','오늘로 가기 버튼',136,44,()=>sv(136,44,`<rect x="1" y="1" width="134" height="42" rx="14" fill="#fff" stroke="#dbe1e8"/>`)],
['arrowL','왼쪽 화살표 버튼',44,44,()=>sv(44,44,`<circle cx="22" cy="22" r="21" fill="#fff" stroke="#dbe1e8"/><path d="M25 14l-8 8 8 8" fill="none" stroke="#232830" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`)],
['arrowR','오른쪽 화살표 버튼',44,44,()=>sv(44,44,`<circle cx="22" cy="22" r="21" fill="#fff" stroke="#dbe1e8"/><path d="M19 14l8 8-8 8" fill="none" stroke="#232830" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`)],
['popupTime','팝업 틀 (예상 소요시간)',300,230,()=>sv(300,230,`<rect x="1" y="1" width="298" height="228" rx="18" fill="#fff" stroke="#dbe1e8"/><rect x="40" y="100" width="100" height="44" rx="10" fill="#f4f6f9" stroke="#dbe1e8"/><rect x="160" y="100" width="100" height="44" rx="10" fill="#f4f6f9" stroke="#dbe1e8"/>${pr(20,166,120,44,'#f4f6f9')}${pr(160,166,120,44,'#dde3f0')}`)],
['popupMenu','팝업 틀 (삭제/이동)',300,260,()=>sv(300,260,`<rect x="1" y="1" width="298" height="258" rx="18" fill="#fff" stroke="#dbe1e8"/>${pr(20,90,260,40,'#f3dcdb')}${pr(20,134,260,40,'#f4f6f9')}${pr(20,178,260,40,'#f4f6f9')}`)],
['settings','설정 버튼',28,28,()=>sv(28,28,`<circle cx="14" cy="14" r="6" fill="none" stroke="#6b7480" stroke-width="2.4"/>${[0,45,90,135,180,225,270,315].map(a=>`<line x1="14" y1="3.5" x2="14" y2="6.5" stroke="#6b7480" stroke-width="3" stroke-linecap="round" transform="rotate(${a} 14 14)"/>`).join('')}`)]
];
const COLORS=[['text','날짜 · 섹션 이름','#232830'],['item','할 일 글자','#232830'],['done','완료된 할 일 글자','#a2aab5'],['sub','소요시간 · 보조 글자','#6b7480'],['btn','버튼 · 팝업 글자','#232830'],['letter','화면 바깥 여백 색','#edf1f5']];
const THEME_KEY='lazytodo_theme_v1';
let colors={};try{colors=JSON.parse(localStorage.getItem(THEME_KEY)||'{}')}catch(e){}
const custom={}; // key -> objectURL
let db=null;
const idb=(mode,fn)=>new Promise(res=>{if(!db)return res(null);try{const q=fn(db.transaction('imgs',mode).objectStore('imgs'));q.onsuccess=()=>res(q.result===undefined?true:q.result);q.onerror=()=>res(null);}catch(e){res(null);}});
function applyTheme(){
  const r=document.documentElement.style;
  SPECS.forEach(([k,,,,def])=>r.setProperty('--img-'+k,`url("${custom[k]||def()}")`));
  COLORS.forEach(([k,,d])=>r.setProperty('--c-'+k,colors[k]||d));
}
function saveColors(){try{localStorage.setItem(THEME_KEY,JSON.stringify(colors))}catch(e){}}
function toBlobFromFile(file,W,H){return new Promise((res,rej)=>{const img=new Image(),u=URL.createObjectURL(file);
  img.onload=()=>{URL.revokeObjectURL(u);const ar=img.width/img.height,tr=W/H;
    if(Math.abs(ar-tr)/tr>0.05)return rej(`비율이 안 맞아요. 올린 이미지 ${img.width}×${img.height} / 권장 ${W}×${H}px (가로:세로 비율이 같아야 해요)`);
    const c=document.createElement('canvas');c.width=W;c.height=H;c.getContext('2d').drawImage(img,0,0,W,H);c.toBlob(b=>b?res(b):rej('이미지를 처리하지 못했어요'),'image/png');};
  img.onerror=()=>rej('이미지를 읽을 수 없어요');img.src=u;});}

// ===== 설정 화면 =====
let pickKey=null;
const setMsg=t=>{const m=$('sMsg');if(m)m.textContent=t||'';};
function buildSettings(){
  const el=$('settings');
  el.innerHTML=`<div class="sh"><b>디자인 설정</b><button id="sClose">닫기</button></div><div id="sMsg"></div>
  <h3>이미지 (원하는 것만 바꿔도 돼요)</h3><div style="font-size:11.5px;color:#6b7480;margin:-4px 0 8px">그림을 누르면 크게 보고, 앱에서 들어가는 자리를 예시로 볼 수 있어요.</div><div id="sImgs"></div><h3>글자 색</h3><div id="sCols"></div>
  <h3>기타</h3><div class="row"><button id="sReset">전체 초기화</button></div>
  <div style="font-size:11.5px;color:#6b7480;line-height:1.5">버튼 그림에는 글자를 넣지 말고 모양만 그려주세요. (글자는 위에 따로 올라가요. 화살표·설정 버튼은 그림 안에 기호를 직접 그려요.)</div>`;
  $('sImgs').innerHTML=SPECS.map(([k,label,w,h,def])=>`<div class="row"><img class="thumb" data-pv="${k}" src="${custom[k]||def()}"><div class="info">${label}${custom[k]?'<span class="badge">내 이미지</span>':''}<small>권장 ${w*3}×${h*3}px</small></div><button data-up="${k}">올리기</button><button data-rs="${k}">기본값</button></div>`).join('');
  $('sCols').innerHTML=COLORS.map(([k,label,d])=>`<div class="row"><div class="info">${label}</div><input type="color" data-col="${k}" value="${colors[k]||d}"><button data-cr="${k}">초기화</button></div>`).join('');
}
$('settings').addEventListener('click',async e=>{
  const t=e.target;
  if(t.id==='sClose'){$('settings').hidden=true;return;}
  if(t.dataset.pv){openPreview(t.dataset.pv);return;}
  if(t.id==='sReset'){if(!confirm('디자인 설정을 모두 기본값으로 되돌릴까요? (할 일 기록은 지워지지 않아요)'))return;
    for(const k of Object.keys(custom)){URL.revokeObjectURL(custom[k]);await idb('readwrite',s=>s.delete(k));delete custom[k];}
    colors={};saveColors();applyTheme();buildSettings();return;}
  if(t.dataset.up){pickKey=t.dataset.up;$('filePick').value='';$('filePick').click();return;}
  if(t.dataset.rs){const k=t.dataset.rs;if(custom[k]){URL.revokeObjectURL(custom[k]);delete custom[k];await idb('readwrite',s=>s.delete(k));}applyTheme();buildSettings();return;}
  if(t.dataset.cr){delete colors[t.dataset.cr];saveColors();applyTheme();buildSettings();}
});
$('settings').addEventListener('input',e=>{const k=e.target.dataset.col;if(k){colors[k]=e.target.value;saveColors();applyTheme();}});
$('filePick').addEventListener('change',async e=>{
  const f=e.target.files[0];if(!f||!pickKey)return;setMsg('처리 중... '+f.name);const sp=SPECS.find(s=>s[0]===pickKey);
  try{const blob=await toBlobFromFile(f,sp[2]*3,sp[3]*3);
    if(custom[pickKey])URL.revokeObjectURL(custom[pickKey]);custom[pickKey]=URL.createObjectURL(blob);
    const ok=await idb('readwrite',s=>s.put({key:pickKey,blob}));
    applyTheme();buildSettings();setMsg(ok?'적용됐어요 ✓':'적용은 됐지만 저장은 못 했어요. 이 환경에서는 앱을 닫으면 사라질 수 있어요.');
  }catch(err){setMsg(String(err));}
});
$('btnSettings').addEventListener('click',()=>{buildSettings();$('settings').hidden=false;});
const LOC={scene:[0,0,360,640],checkOff:[20,101,18,18],checkOn:[20,101,18,18],rateBadOff:[226,140,30,30],rateBadOn:[226,140,30,30],rateNormalOff:[269,140,30,30],rateNormalOn:[269,140,30,30],rateGoodOff:[312,140,30,30],rateGoodOn:[312,140,30,30],today:[112,560,136,44],arrowL:[14,560,44,44],arrowR:[302,560,44,44],settings:[316,18,28,28],popupTime:[30,205,300,230],popupMenu:[30,190,300,260]};
const spec=k=>SPECS.find(s=>s[0]===k);
function locSvg(key){
  const at=(k,x,y,w,h)=>`<image href="${spec(k)[4]()}" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
  const base=[['settings',316,18,28,28],['rateBadOff',226,140,30,30],['rateNormalOff',269,140,30,30],['rateGoodOff',312,140,30,30],['today',112,560,136,44],['arrowL',14,560,44,44],['arrowR',302,560,44,44],['checkOff',20,101,18,18]];
  const [x,y,w,h]=LOC[key],pop=key.startsWith('popup');
  let s=at('scene',0,0,360,640)+base.map(b=>at(...b)).join('')
   +'<text x="16" y="38" font-size="18" fill="#232830">2026년 10월 08일</text><text x="24" y="80" font-size="15" font-weight="700" fill="#232830">공부</text><text x="232" y="214" font-size="15" font-weight="700" fill="#232830">기타</text><text x="234" y="79" font-size="11" fill="#6b7480">ToDo Time</text><text x="234" y="112" font-size="20" font-weight="700" fill="#232830">3시간 20분</text><text x="43" y="115" font-size="13" fill="#232830">할 일 예시</text>';
  if(pop) s+='<rect width="360" height="640" fill="rgba(20,22,16,.4)"/>'+at(key,x,y,w,h);
  else if(key!=='scene') s+=at(key,x,y,w,h);
  s+=`<rect x="${x-2}" y="${y-2}" width="${w+4}" height="${h+4}" rx="6" fill="${key==='scene'||pop?'none':'rgba(229,57,53,.15)'}" stroke="#e53935" stroke-width="2.5" stroke-dasharray="6 4"/>`;
  return `<svg viewBox="0 0 360 640" width="190" style="border:1px solid #d5dae0;border-radius:8px;background:#fff">${s}</svg>`;
}
function openPreview(k){
  const sp=spec(k),url=custom[k]||sp[4](),sc=Math.min(300/Math.max(sp[2],sp[3]),8);
  $('preview').innerHTML=`<div class="pv-card"><div class="sh"><b>${sp[1]}</b><button id="pvClose">닫기</button></div><div class="pv-sub">권장 ${sp[2]*3}×${sp[3]*3}px · ${custom[k]?'지금은 내 이미지':'지금은 기본 이미지'}</div><div class="pv-big"><img src="${url}" style="width:${sp[2]*sc}px;height:${sp[3]*sc}px"></div><div class="pv-sub">앱에서 이 그림이 들어가는 자리 (예시, 빨간 점선)</div><div class="pv-loc">${locSvg(k)}</div></div>`;
  $('preview').hidden=false;
}
$('preview').addEventListener('click',e=>{if(e.target.id==='pvClose'||e.target.id==='preview')$('preview').hidden=true;});

// ===== 할 일 데이터/로직 =====
const STORE_KEY='lazytodo_data_v1',NAMES_KEY='lazytodo_names_v1',WD=['일','월','화','수','목','금','토'],SECTIONS=['study','etc'],DN={study:'공부',etc:'기타'};
function migrate(s){Object.keys(s).forEach(k=>{const d=s[k];if(!d)return;if(d.productivity||d.chores){d.etc=(d.etc||[]).concat(d.productivity||[],d.chores||[]);delete d.productivity;delete d.chores;}d.study=d.study||[];d.etc=d.etc||[];});return s;}
const load=(k,f)=>{try{const r=localStorage.getItem(k);return r?JSON.parse(r):f}catch(e){return f}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
let store=migrate(load(STORE_KEY,{})),names=Object.assign({},DN,load(NAMES_KEY,{}));
const saveStore=()=>save(STORE_KEY,store);saveStore();
let current=new Date();current.setHours(0,0,0,0);
const dk=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const emptyDay=()=>({study:[],etc:[],rating:null});
const getDay=d=>{const k=dk(d);if(!store[k])store[k]=emptyDay();return store[k];};
const fmt=m=>{m=Math.max(0,m|0);const h=Math.floor(m/60),r=m%60;if(!h&&!r)return'0분';if(!h)return`${r}분`;if(!r)return`${h}시간`;return`${h}시간 ${r}분`;};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
function render(){
  const d=current;$('dateLabel').textContent=`${d.getFullYear()}년 ${String(d.getMonth()+1).padStart(2,'0')}월 ${String(d.getDate()).padStart(2,'0')}일 (${WD[d.getDay()]}요일)`;
  const day=getDay(d);let remain=0;
  SECTIONS.forEach(sec=>{const list=$('list-'+sec);list.innerHTML='';const items=day[sec];
    const ord=items.filter(i=>!i.done).concat(items.filter(i=>i.done));
    $('cnt-'+sec).textContent=items.length?`${items.filter(i=>i.done).length}/${items.length}`:'';
    ord.forEach(it=>{if(!it.done)remain+=(it.minutes||0);list.appendChild(buildRow(sec,it));});
    const inp=$('name-'+sec);if(document.activeElement!==inp)inp.value=names[sec];});
  $('timeLeft').textContent=fmt(remain);
  document.querySelectorAll('.rating-btn').forEach(b=>b.classList.toggle('sel',day.rating===b.dataset.v));
}
function buildRow(sec,item){
  const row=document.createElement('div');row.className='todo-row'+(item.done?' done':'');row.dataset.id=item.id;
  const cb=document.createElement('div');cb.className='checkbox';cb.addEventListener('click',()=>{item.done=!item.done;saveStore();render();});
  const main=document.createElement('div');main.className='todo-main';
  const text=document.createElement('div');text.className='todo-text';text.textContent=item.text;text.addEventListener('click',()=>startEdit(item,text));
  const time=document.createElement('div');time.className='todo-time';time.textContent=`(${fmt(item.minutes||0)})`;
  time.addEventListener('click',e=>{e.stopPropagation();openTime(item.text,item.minutes||0,m=>{item.minutes=m;saveStore();render();});});
  main.append(text,time);
  const h=document.createElement('div');h.className='drag-handle';
  h.innerHTML='<svg viewBox="0 0 20 20" fill="currentColor"><circle cx="6" cy="4" r="1.6"/><circle cx="14" cy="4" r="1.6"/><circle cx="6" cy="10" r="1.6"/><circle cx="14" cy="10" r="1.6"/><circle cx="6" cy="16" r="1.6"/><circle cx="14" cy="16" r="1.6"/></svg>';
  row.append(cb,main,h);attachLong(row,sec,item);attachDrag(h,row,sec);return row;
}
function startEdit(item,el){const i=document.createElement('textarea');i.className='todo-edit-input';i.value=item.text;i.rows=1;el.replaceWith(i);i.focus();i.setSelectionRange(i.value.length,i.value.length);
  i.addEventListener('blur',()=>{const v=i.value.trim();if(v)item.text=v;saveStore();render();});i.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();i.blur();}});}
function attachLong(row,sec,item){let t=null,sx=0,sy=0,long=false;
  row.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY;long=false;clearTimeout(t);t=setTimeout(()=>{long=true;if(navigator.vibrate)navigator.vibrate(15);openCtx(sec,item);},480);});
  row.addEventListener('pointermove',e=>{if(Math.abs(e.clientX-sx)>10||Math.abs(e.clientY-sy)>10)clearTimeout(t);});
  ['pointerup','pointerleave','pointercancel'].forEach(n=>row.addEventListener(n,()=>clearTimeout(t)));
  row.addEventListener('click',e=>{if(long){e.preventDefault();e.stopPropagation();long=false;}},true);}
function attachDrag(handle,row,sec){let on=false;
  const move=y=>{if(!on)return;const list=row.parentElement;for(const s of Array.from(list.children).filter(x=>x!==row&&x.classList.contains('todo-row'))){const r=s.getBoundingClientRect();if(y<r.top+r.height/2){list.insertBefore(row,s);return;}}list.appendChild(row);};
  const start=()=>{on=true;row.classList.add('dragging');if(navigator.vibrate)navigator.vibrate(10);};
  const fin=()=>{if(!on)return;on=false;row.classList.remove('dragging');reorder(sec);render();};
  handle.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();start();},{passive:false});
  handle.addEventListener('touchmove',e=>{if(!on)return;e.preventDefault();move(e.touches[0].clientY);},{passive:false});
  handle.addEventListener('touchend',fin);handle.addEventListener('touchcancel',fin);
  handle.addEventListener('mousedown',e=>{e.preventDefault();e.stopPropagation();start();const mv=ev=>move(ev.clientY),up=()=>{fin();removeEventListener('mousemove',mv);removeEventListener('mouseup',up);};addEventListener('mousemove',mv);addEventListener('mouseup',up);});
  handle.addEventListener('pointerdown',e=>e.stopPropagation());}
function reorder(sec){const ids=Array.from($('list-'+sec).querySelectorAll('.todo-row')).map(r=>r.dataset.id),day=getDay(current),by={};day[sec].forEach(i=>by[i.id]=i);day[sec]=ids.map(id=>by[id]).filter(Boolean);saveStore();}
SECTIONS.forEach(sec=>{const box=$('add-'+sec);
  const lines=()=>{const l=box.value.split('\n').map(s=>s.trim()).filter(Boolean);box.value='';return l;};
  box.addEventListener('blur',()=>{const l=lines();if(l.length)queueAdds(sec,l);});
  box.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();const l=lines();if(l.length)queueAdds(sec,l,()=>box.focus());}});
  const inp=$('name-'+sec);inp.addEventListener('focus',()=>inp.select());inp.addEventListener('keydown',e=>{if(e.key==='Enter')inp.blur();});
  inp.addEventListener('blur',()=>{const v=inp.value.trim()||DN[sec];names[sec]=v;inp.value=v;save(NAMES_KEY,names);});});
function queueAdds(sec,lines,done){let i=0;(function next(){if(i>=lines.length){if(done)done();return;}const text=lines[i];
  openTime(text,0,m=>{getDay(current)[sec].push({id:uid(),text,minutes:m,done:false});saveStore();render();i++;next();});})();}
const tm=$('timeModal');let tcb=null;
function openTime(text,p,cb){$('modalItemText').textContent=text;$('modalHour').value=Math.floor((p||0)/60);$('modalMin').value=(p||0)%60;tcb=cb;tm.classList.add('show');setTimeout(()=>$('modalHour').focus(),50);}
function closeTime(m){tm.classList.remove('show');const cb=tcb;tcb=null;if(cb)cb(m);}
$('modalOk').addEventListener('click',()=>closeTime(Math.max(0,parseInt($('modalHour').value)||0)*60+Math.max(0,parseInt($('modalMin').value)||0)));
$('modalSkip').addEventListener('click',()=>closeTime(0));
const cx=$('ctxModal');let tg=null;
function openCtx(sec,item){tg={sec,item};$('ctxItemText').textContent=item.text;cx.classList.add('show');}
function closeCtx(){cx.classList.remove('show');tg=null;}
function moveTo(date){const{sec,item}=tg,day=getDay(current),i=day[sec].findIndex(x=>x.id===item.id);if(i>-1)day[sec].splice(i,1);
  if(date){const k=dk(date);if(!store[k])store[k]=emptyDay();store[k][sec].push(item);}saveStore();closeCtx();render();}
$('ctxDelete').addEventListener('click',()=>{if(tg)moveTo(null);});
$('ctxTomorrow').addEventListener('click',()=>{if(!tg)return;const t=new Date(current);t.setDate(t.getDate()+1);moveTo(t);});
$('ctxToday').addEventListener('click',()=>{if(!tg)return;const t=new Date();t.setHours(0,0,0,0);moveTo(t);});
$('ctxCancel').addEventListener('click',closeCtx);
document.querySelectorAll('.rating-btn').forEach(b=>b.addEventListener('click',()=>{const day=getDay(current);day.rating=day.rating===b.dataset.v?null:b.dataset.v;saveStore();render();}));
$('prevDay').addEventListener('click',()=>{current.setDate(current.getDate()-1);render();});
$('nextDay').addEventListener('click',()=>{current.setDate(current.getDate()+1);render();});
$('gotoToday').addEventListener('click',()=>{current=new Date();current.setHours(0,0,0,0);render();});

applyTheme();render();
// 저장된 내 이미지 불러오기
(async()=>{try{db=await new Promise(res=>{const r=indexedDB.open('lazytodo_theme',1);r.onupgradeneeded=()=>r.result.createObjectStore('imgs',{keyPath:'key'});r.onsuccess=()=>res(r.result);r.onerror=()=>res(null);});}catch(e){db=null;}
  const rows=await idb('readonly',s=>s.getAll());if(Array.isArray(rows)){rows.forEach(r=>{custom[r.key]=URL.createObjectURL(r.blob);});applyTheme();}})();
})();
