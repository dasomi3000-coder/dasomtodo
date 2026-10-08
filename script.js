(function(){
  const STORE_KEY='lazytodo_data_v1', NAMES_KEY='lazytodo_names_v1';
  const WEEKDAYS=['일','월','화','수','목','금','토'];
  const SECTIONS=['study','etc'];
  const DEFAULT_NAMES={study:'공부',etc:'기타'};
  const $=id=>document.getElementById(id);

  function migrate(s){
    Object.keys(s).forEach(k=>{
      const d=s[k]; if(!d) return;
      if(d.productivity||d.chores){
        d.etc=(d.etc||[]).concat(d.productivity||[],d.chores||[]);
        delete d.productivity; delete d.chores;
      }
      d.study=d.study||[]; d.etc=d.etc||[];
    });
    return s;
  }
  function load(key,fallback){try{const r=localStorage.getItem(key);return r?JSON.parse(r):fallback}catch(e){return fallback}}
  function save(key,val){try{localStorage.setItem(key,JSON.stringify(val))}catch(e){}}
  let store=migrate(load(STORE_KEY,{}));
  let names=Object.assign({},DEFAULT_NAMES,load(NAMES_KEY,{}));
  const saveStore=()=>save(STORE_KEY,store);
  saveStore();

  let current=new Date(); current.setHours(0,0,0,0);
  const dateKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const emptyDay=()=>({study:[],etc:[],rating:null});
  function getDay(d){const k=dateKey(d); if(!store[k]) store[k]=emptyDay(); return store[k];}
  function fmtTime(m){m=Math.max(0,m|0);const h=Math.floor(m/60),r=m%60;if(!h&&!r)return'0분';if(!h)return`${r}분`;if(!r)return`${h}시간`;return`${h}시간 ${r}분`;}
  const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);

  function render(){
    const d=current;
    $('dateLabel').textContent=`${d.getFullYear()}년 ${String(d.getMonth()+1).padStart(2,'0')}월 ${String(d.getDate()).padStart(2,'0')}일 (${WEEKDAYS[d.getDay()]}요일)`;
    const day=getDay(d); let remain=0;
    SECTIONS.forEach(sec=>{
      const list=$('list-'+sec); list.innerHTML='';
      const items=day[sec];
      // 완료된 항목은 맨 아래로 (각 그룹 안의 순서는 유지)
      const ordered=items.filter(i=>!i.done).concat(items.filter(i=>i.done));
      $('cnt-'+sec).textContent=items.length?`${items.filter(i=>i.done).length}/${items.length}`:'';
      ordered.forEach(item=>{ if(!item.done) remain+=(item.minutes||0); list.appendChild(buildRow(sec,item)); });
      const inp=$('name-'+sec); if(document.activeElement!==inp) inp.value=names[sec];
    });
    $('timeLeft').textContent=fmtTime(remain);
    document.querySelectorAll('.rating-btn').forEach(b=>b.classList.toggle('sel',day.rating===b.dataset.v));
  }

  function buildRow(sec,item){
    const row=document.createElement('div');
    row.className='todo-row'+(item.done?' done':''); row.dataset.id=item.id;
    const cb=document.createElement('div'); cb.className='checkbox';
    cb.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    cb.addEventListener('click',()=>{item.done=!item.done;saveStore();render();});
    const main=document.createElement('div'); main.className='todo-main';
    const text=document.createElement('div'); text.className='todo-text'; text.textContent=item.text;
    text.addEventListener('click',()=>startEdit(item,text));
    const time=document.createElement('div'); time.className='todo-time'; time.textContent=`(${fmtTime(item.minutes||0)})`;
    time.addEventListener('click',e=>{e.stopPropagation();openTimeModal(item.text,item.minutes||0,m=>{item.minutes=m;saveStore();render();});});
    main.appendChild(text); main.appendChild(time);
    const handle=document.createElement('div'); handle.className='drag-handle';
    handle.innerHTML='<svg viewBox="0 0 20 20" fill="currentColor"><circle cx="6" cy="4" r="1.6"/><circle cx="14" cy="4" r="1.6"/><circle cx="6" cy="10" r="1.6"/><circle cx="14" cy="10" r="1.6"/><circle cx="6" cy="16" r="1.6"/><circle cx="14" cy="16" r="1.6"/></svg>';
    row.appendChild(cb); row.appendChild(main); row.appendChild(handle);
    attachLongPress(row,sec,item); attachDragHandle(handle,row,sec);
    return row;
  }

  function startEdit(item,textEl){
    const input=document.createElement('textarea'); input.className='todo-edit-input'; input.value=item.text; input.rows=1;
    textEl.replaceWith(input); input.focus(); input.setSelectionRange(input.value.length,input.value.length);
    input.addEventListener('blur',()=>{const v=input.value.trim(); if(v) item.text=v; saveStore(); render();});
    input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();input.blur();}});
  }

  // 길게 누르면 삭제/이동 메뉴
  function attachLongPress(row,sec,item){
    let timer=null,sx=0,sy=0,long=false;
    row.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY;long=false;clearTimeout(timer);
      timer=setTimeout(()=>{long=true;if(navigator.vibrate)navigator.vibrate(15);openContextMenu(sec,item);},480);});
    row.addEventListener('pointermove',e=>{if(Math.abs(e.clientX-sx)>10||Math.abs(e.clientY-sy)>10)clearTimeout(timer);});
    ['pointerup','pointerleave','pointercancel'].forEach(t=>row.addEventListener(t,()=>clearTimeout(timer)));
    row.addEventListener('click',e=>{if(long){e.preventDefault();e.stopPropagation();long=false;}},true);
  }

  // 손잡이 드래그로 순서 변경 (터치: Touch Events, 마우스: mouse 이벤트)
  function attachDragHandle(handle,row,sec){
    let dragging=false;
    function move(y){
      if(!dragging) return;
      const list=row.parentElement;
      const sibs=Array.from(list.children).filter(el=>el!==row&&el.classList.contains('todo-row'));
      for(const s of sibs){const r=s.getBoundingClientRect(); if(y<r.top+r.height/2){list.insertBefore(row,s);return;}}
      list.appendChild(row);
    }
    function start(){dragging=true;row.classList.add('dragging');if(navigator.vibrate)navigator.vibrate(10);}
    function finish(){if(!dragging)return;dragging=false;row.classList.remove('dragging');reorderSection(sec);render();}
    handle.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();start();},{passive:false});
    handle.addEventListener('touchmove',e=>{if(!dragging)return;e.preventDefault();move(e.touches[0].clientY);},{passive:false});
    handle.addEventListener('touchend',finish); handle.addEventListener('touchcancel',finish);
    handle.addEventListener('mousedown',e=>{e.preventDefault();e.stopPropagation();start();
      const onMove=ev=>move(ev.clientY);
      const onUp=()=>{finish();window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseup',onUp);};
      window.addEventListener('mousemove',onMove);window.addEventListener('mouseup',onUp);});
    handle.addEventListener('pointerdown',e=>e.stopPropagation());
  }
  function reorderSection(sec){
    const ids=Array.from($('list-'+sec).querySelectorAll('.todo-row')).map(r=>r.dataset.id);
    const day=getDay(current), byId={}; day[sec].forEach(i=>{byId[i.id]=i;});
    day[sec]=ids.map(id=>byId[id]).filter(Boolean); saveStore();
  }

  // 할 일 추가 (엔터 또는 바깥 탭 → 예상시간 입력)
  SECTIONS.forEach(sec=>{
    const box=$('add-'+sec);
    const lines=()=>{const l=box.value.split('\n').map(s=>s.trim()).filter(Boolean);box.value='';box.style.height='auto';return l;};
    box.addEventListener('blur',()=>{const l=lines(); if(l.length) queueAdds(sec,l);});
    box.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();const l=lines(); if(l.length) queueAdds(sec,l,()=>box.focus());}});
    box.addEventListener('input',()=>{box.style.height='auto';box.style.height=Math.min(box.scrollHeight,80)+'px';});
  });
  function queueAdds(sec,lines,onDone){
    let i=0;
    (function next(){
      if(i>=lines.length){if(onDone)onDone();return;}
      const text=lines[i];
      openTimeModal(text,0,m=>{getDay(current)[sec].push({id:uid(),text,minutes:m,done:false});saveStore();render();i++;next();});
    })();
  }

  // 섹션 이름 수정
  SECTIONS.forEach(sec=>{
    const inp=$('name-'+sec);
    inp.addEventListener('focus',()=>inp.select());
    inp.addEventListener('keydown',e=>{if(e.key==='Enter')inp.blur();});
    inp.addEventListener('blur',()=>{const v=inp.value.trim()||DEFAULT_NAMES[sec];names[sec]=v;inp.value=v;save(NAMES_KEY,names);});
  });

  // 예상시간 모달
  const modal=$('timeModal'); let modalCb=null;
  function openTimeModal(text,preset,cb){
    $('modalItemText').textContent=text; $('modalHour').value=Math.floor((preset||0)/60); $('modalMin').value=(preset||0)%60;
    modalCb=cb; modal.classList.add('show'); setTimeout(()=>$('modalHour').focus(),50);
  }
  function closeModal(m){modal.classList.remove('show');const cb=modalCb;modalCb=null;if(cb)cb(m);}
  $('modalOk').addEventListener('click',()=>closeModal(Math.max(0,parseInt($('modalHour').value)||0)*60+Math.max(0,parseInt($('modalMin').value)||0)));
  $('modalSkip').addEventListener('click',()=>closeModal(0));

  // 길게 누름 메뉴
  const ctx=$('ctxModal'); let target=null;
  function openContextMenu(sec,item){target={sec,item};$('ctxItemText').textContent=item.text;ctx.classList.add('show');}
  function closeCtx(){ctx.classList.remove('show');target=null;}
  function moveTo(date){
    const {sec,item}=target, day=getDay(current), idx=day[sec].findIndex(i=>i.id===item.id);
    if(idx>-1) day[sec].splice(idx,1);
    if(date){const k=dateKey(date); if(!store[k]) store[k]=emptyDay(); store[k][sec].push(item);}
    saveStore(); closeCtx(); render();
  }
  $('ctxDelete').addEventListener('click',()=>{if(target)moveTo(null);});
  $('ctxTomorrow').addEventListener('click',()=>{if(!target)return;const t=new Date(current);t.setDate(t.getDate()+1);moveTo(t);});
  $('ctxToday').addEventListener('click',()=>{if(!target)return;const t=new Date();t.setHours(0,0,0,0);moveTo(t);});
  $('ctxCancel').addEventListener('click',closeCtx);

  // 평가 / 날짜 이동
  $('ratingRow').addEventListener('click',e=>{const b=e.target.closest('.rating-btn');if(!b)return;const day=getDay(current);day.rating=day.rating===b.dataset.v?null:b.dataset.v;saveStore();render();});
  $('prevDay').addEventListener('click',()=>{current.setDate(current.getDate()-1);render();});
  $('nextDay').addEventListener('click',()=>{current.setDate(current.getDate()+1);render();});
  $('gotoToday').addEventListener('click',()=>{current=new Date();current.setHours(0,0,0,0);render();});

  render();
})();
