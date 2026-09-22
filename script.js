(function(){
  const STORE_KEY = 'lazytodo_data_v1';
  const WEEKDAYS = ['일','월','화','수','목','금','토'];
  const SECTIONS = ['study','productivity','chores'];

  let store = loadStore();
  let current = new Date();
  current.setHours(0,0,0,0);

  function loadStore(){
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch(e){ return {}; }
  }
  function saveStore(){
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch(e){}
  }
  function dateKey(d){
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
  function getDay(d){
    const k = dateKey(d);
    if (!store[k]) {
      store[k] = { study: [], productivity: [], chores: [], rating: null };
    }
    return store[k];
  }
  function fmtTime(mins){
    mins = Math.max(0, mins|0);
    const h = Math.floor(mins/60), m = mins%60;
    if (h===0 && m===0) return '0분';
    if (h===0) return `${m}분`;
    if (m===0) return `총 ${h}시간`;
    return `총 ${h}시간 ${m}분`;
  }
  function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }

  function render(){
    const d = current;
    document.getElementById('dateLabel').textContent =
      `${d.getFullYear()}년 ${String(d.getMonth()+1).padStart(2,'0')}월 ${String(d.getDate()).padStart(2,'0')}일 (${WEEKDAYS[d.getDay()]}요일)`;

    const day = getDay(d);
    let remain = 0;
    SECTIONS.forEach(sec => {
      const list = document.getElementById('list-'+sec);
      list.innerHTML = '';
      const items = day[sec];
      document.getElementById('cnt-'+sec).textContent = items.length ? `${items.filter(i=>i.done).length}/${items.length}` : '';
      items.forEach(item => {
        if (!item.done) remain += (item.minutes||0);
        list.appendChild(buildRow(sec, item));
      });
    });
    document.getElementById('timeLeft').textContent = fmtTime(remain);

    document.querySelectorAll('.rating-btn').forEach(btn => {
      btn.classList.toggle('sel', day.rating === btn.dataset.v);
    });
  }

  function buildRow(sec, item){
    const row = document.createElement('div');
    row.className = 'todo-row' + (item.done ? ' done' : '');
    row.dataset.id = item.id;

    const cb = document.createElement('div');
    cb.className = 'checkbox';
    cb.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    cb.addEventListener('click', () => {
      item.done = !item.done;
      saveStore();
      render();
    });

    const main = document.createElement('div');
    main.className = 'todo-main';

    const text = document.createElement('div');
    text.className = 'todo-text';
    text.textContent = item.text;
    text.addEventListener('click', () => startEdit(sec, item, text));

    const time = document.createElement('div');
    time.className = 'todo-time';
    time.textContent = `(${fmtTime(item.minutes||0).replace('총 ','')})`;
    time.addEventListener('click', (e) => {
      e.stopPropagation();
      openTimeModal(item.text, item.minutes||0, (mins) => {
        item.minutes = mins;
        saveStore();
        render();
      });
    });

    main.appendChild(text);
    main.appendChild(time);

    const handle = document.createElement('div');
    handle.className = 'drag-handle';
    handle.innerHTML = '<svg viewBox="0 0 20 20" fill="currentColor"><circle cx="6" cy="4" r="1.6"/><circle cx="14" cy="4" r="1.6"/><circle cx="6" cy="10" r="1.6"/><circle cx="14" cy="10" r="1.6"/><circle cx="6" cy="16" r="1.6"/><circle cx="14" cy="16" r="1.6"/></svg>';

    row.appendChild(cb);
    row.appendChild(main);
    row.appendChild(handle);
    attachLongPress(row, sec, item);
    attachDragHandle(handle, row, sec);
    return row;
  }

  function attachLongPress(row, sec, item){
    let timer = null;
    let startX = 0, startY = 0;
    let longPressed = false;
    const THRESH = 10;
    const DURATION = 480;

    row.addEventListener('pointerdown', (e) => {
      startX = e.clientX; startY = e.clientY;
      longPressed = false;
      clearTimeout(timer);
      timer = setTimeout(() => {
        longPressed = true;
        if (navigator.vibrate) navigator.vibrate(15);
        openContextMenu(sec, item);
      }, DURATION);
    });
    row.addEventListener('pointermove', (e) => {
      if (Math.abs(e.clientX - startX) > THRESH || Math.abs(e.clientY - startY) > THRESH) {
        clearTimeout(timer);
      }
    });
    row.addEventListener('pointerup', () => clearTimeout(timer));
    row.addEventListener('pointerleave', () => clearTimeout(timer));
    row.addEventListener('pointercancel', () => clearTimeout(timer));
    row.addEventListener('click', (e) => {
      if (longPressed) {
        e.preventDefault();
        e.stopPropagation();
        longPressed = false;
      }
    }, true);
  }

  // 전용 드래그 손잡이: Pointer Capture가 브라우저마다 불안정할 수 있어
  // 터치 기기는 Touch Events(항상 시작 요소에 이벤트가 고정됨)로 처리하고,
  // 마우스(데스크톱 미리보기)는 별도 mouse 이벤트로 처리한다.
  function attachDragHandle(handle, row, sec){
    let dragging = false;

    function doMove(clientY){
      if (!dragging) return;
      const list = row.parentElement;
      const siblings = Array.from(list.children).filter(el => el !== row && el.classList.contains('todo-row'));
      let inserted = false;
      for (const sib of siblings) {
        const rect = sib.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        if (clientY < mid) {
          list.insertBefore(row, sib);
          inserted = true;
          break;
        }
      }
      if (!inserted) list.appendChild(row);
    }
    function start(){
      dragging = true;
      row.classList.add('dragging');
      if (navigator.vibrate) navigator.vibrate(10);
    }
    function finish(){
      if (!dragging) return;
      dragging = false;
      row.classList.remove('dragging');
      reorderSection(sec);
    }

    // 터치 (모바일 실기기용, 가장 신뢰도 높은 경로)
    handle.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      start();
    }, { passive: false });
    handle.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      e.preventDefault();
      doMove(e.touches[0].clientY);
    }, { passive: false });
    handle.addEventListener('touchend', finish);
    handle.addEventListener('touchcancel', finish);

    // 마우스 (데스크톱/미리보기용)
    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      start();
      function onMove(ev){ doMove(ev.clientY); }
      function onUp(){
        finish();
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      }
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    });

    // 손잡이를 눌렀을 때 부모 row의 롱프레스(삭제/이동 메뉴) 타이머가
    // 같이 시작되지 않도록 pointerdown 버블링을 막는다.
    handle.addEventListener('pointerdown', (e) => e.stopPropagation());
  }

  function reorderSection(sec){
    const list = document.getElementById('list-'+sec);
    const ids = Array.from(list.querySelectorAll('.todo-row')).map(r => r.dataset.id);
    const day = getDay(current);
    const itemsById = {};
    day[sec].forEach(it => { itemsById[it.id] = it; });
    day[sec] = ids.map(id => itemsById[id]).filter(Boolean);
    saveStore();
  }

  function startEdit(sec, item, textEl){
    const input = document.createElement('textarea');
    input.className = 'todo-edit-input';
    input.value = item.text;
    input.rows = 1;
    textEl.replaceWith(input);
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
    function commit(){
      const v = input.value.trim();
      if (v) item.text = v;
      saveStore();
      render();
    }
    input.addEventListener('blur', commit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    });
  }

  SECTIONS.forEach(sec => {
    const box = document.getElementById('add-'+sec);
    function resetBoxHeight(){
      box.style.height = 'auto';
    }
    box.addEventListener('blur', () => {
      const raw = box.value;
      const lines = raw.split('\n').map(s=>s.trim()).filter(Boolean);
      box.value = '';
      resetBoxHeight();
      if (!lines.length) return;
      queueAdds(sec, lines);
    });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const lines = box.value.split('\n').map(s=>s.trim()).filter(Boolean);
        box.value = '';
        resetBoxHeight();
        if (!lines.length) return;
        queueAdds(sec, lines, () => box.focus());
      }
    });
    box.addEventListener('input', () => {
      box.style.height = 'auto';
      box.style.height = Math.min(box.scrollHeight, 80) + 'px';
    });
  });

  function queueAdds(sec, lines, onDone){
    let i = 0;
    function next(){
      if (i >= lines.length) { if (onDone) onDone(); return; }
      const text = lines[i];
      openTimeModal(text, 0, (mins) => {
        const day = getDay(current);
        day[sec].push({ id: uid(), text, minutes: mins, done: false });
        saveStore();
        render();
        i++;
        next();
      });
    }
    next();
  }

  const modal = document.getElementById('timeModal');
  const modalItemText = document.getElementById('modalItemText');
  const modalHour = document.getElementById('modalHour');
  const modalMin = document.getElementById('modalMin');
  const modalOk = document.getElementById('modalOk');
  const modalSkip = document.getElementById('modalSkip');
  let modalCallback = null;

  function openTimeModal(text, presetMins, cb){
    modalItemText.textContent = text;
    modalHour.value = Math.floor((presetMins||0)/60);
    modalMin.value = (presetMins||0)%60;
    modalCallback = cb;
    modal.classList.add('show');
    setTimeout(()=>modalHour.focus(), 50);
  }
  function closeModal(mins){
    modal.classList.remove('show');
    const cb = modalCallback;
    modalCallback = null;
    if (cb) cb(mins);
  }
  modalOk.addEventListener('click', () => {
    const h = Math.max(0, parseInt(modalHour.value)||0);
    const m = Math.max(0, parseInt(modalMin.value)||0);
    closeModal(h*60+m);
  });
  modalSkip.addEventListener('click', () => closeModal(0));

  // long-press context menu (delete / move to tomorrow / move to today)
  const ctxModal = document.getElementById('ctxModal');
  const ctxItemText = document.getElementById('ctxItemText');
  let ctxTarget = null;

  function openContextMenu(sec, item){
    ctxTarget = { sec, item };
    ctxItemText.textContent = item.text;
    ctxModal.classList.add('show');
  }
  function closeContextMenu(){
    ctxModal.classList.remove('show');
    ctxTarget = null;
  }
  function removeFromCurrentDay(sec, item){
    const day = getDay(current);
    const idx = day[sec].findIndex(i => i.id === item.id);
    if (idx > -1) day[sec].splice(idx, 1);
  }
  function moveItemToDate(sec, item, targetDate){
    removeFromCurrentDay(sec, item);
    const targetKey = dateKey(targetDate);
    if (!store[targetKey]) store[targetKey] = { study: [], productivity: [], chores: [], rating: null };
    store[targetKey][sec].push(item);
  }

  document.getElementById('ctxDelete').addEventListener('click', () => {
    if (!ctxTarget) return;
    removeFromCurrentDay(ctxTarget.sec, ctxTarget.item);
    saveStore();
    closeContextMenu();
    render();
  });
  document.getElementById('ctxTomorrow').addEventListener('click', () => {
    if (!ctxTarget) return;
    const target = new Date(current);
    target.setDate(target.getDate() + 1);
    moveItemToDate(ctxTarget.sec, ctxTarget.item, target);
    saveStore();
    closeContextMenu();
    render();
  });
  document.getElementById('ctxToday').addEventListener('click', () => {
    if (!ctxTarget) return;
    const target = new Date();
    target.setHours(0,0,0,0);
    moveItemToDate(ctxTarget.sec, ctxTarget.item, target);
    saveStore();
    closeContextMenu();
    render();
  });
  document.getElementById('ctxCancel').addEventListener('click', closeContextMenu);

  document.querySelector('.sidebar').addEventListener('click', (e) => {
    const btn = e.target.closest('.rating-btn');
    if (!btn) return;
    const day = getDay(current);
    day.rating = (day.rating === btn.dataset.v) ? null : btn.dataset.v;
    saveStore();
    render();
  });

  document.getElementById('prevDay').addEventListener('click', () => {
    current.setDate(current.getDate()-1);
    render();
  });
  document.getElementById('nextDay').addEventListener('click', () => {
    current.setDate(current.getDate()+1);
    render();
  });
  document.getElementById('gotoToday').addEventListener('click', () => {
    current = new Date();
    current.setHours(0,0,0,0);
    render();
  });

  render();
})();
