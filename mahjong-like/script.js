(() => {
  // Mahjong-like pair matching with "free" rule (left or right side open).
  const boardEl = document.getElementById('board');
  const timeEl = document.getElementById('time');
  const movesEl = document.getElementById('moves');
  const remainingEl = document.getElementById('remaining');

  const newGameBtn = document.getElementById('newGameBtn');
  const undoBtn = document.getElementById('undoBtn');
  const hintBtn = document.getElementById('hintBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');

  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalMsg = document.getElementById('modalMsg');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const playAgainBtn = document.getElementById('playAgainBtn');

  const tileTpl = document.getElementById('tileTemplate');

  const COLS = 18;
  const ROWS = 8;

  // Board mask: defines where tiles can appear
  const MASK = (() => {
    const rows = [];
    for (let r=0; r<ROWS; r++) {
      const row = new Array(COLS).fill(false);
      const pad = Math.abs((ROWS/2 - 0.5) - r) * 2 + 1;
      const width = COLS - Math.round(pad*2);
      const start = Math.floor((COLS - width)/2);
      for (let c=start; c<start+width; c++) row[c] = true;
      // eye gaps
      if (r === Math.floor(ROWS/2) - 1) { row[4] = false; row[COLS-5] = false; }
      rows.push(row);
    }
    return rows;
  })();

  // Icon SVG generators
  function circle(fill){ return `<svg viewBox="0 0 100 100" class="icon"><circle cx="50" cy="50" r="36" fill="${fill}"/></svg>`; }
  function diamond(fill){ return `<svg viewBox="0 0 100 100" class="icon"><path d="M50 6 L92 50 L50 94 L8 50 Z" fill="${fill}"/></svg>`; }
  function bamboo(fill){ return `<svg viewBox="0 0 100 100" class="icon"><rect x="44" y="8" width="12" height="84" rx="6" fill="${fill}"/><rect x="40" y="28" width="20" height="6" fill="#cdeac0"/><rect x="40" y="64" width="20" height="6" fill="#cdeac0"/></svg>`; }
  function wind(fill){ return `<svg viewBox="0 0 100 100" class="icon"><path d="M20 40h50a12 12 0 1 0-12-12" stroke="${fill}" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M20 60h40a10 10 0 1 1-10 10" stroke="${fill}" stroke-width="10" fill="none" stroke-linecap="round"/></svg>`; }

  const ICONS = [
    {svg: circle('#2a9d8f')}, {svg: circle('#e76f51')}, {svg: circle('#f4a261')}, {svg: circle('#264653')},
    {svg: diamond('#5a8cff')}, {svg: diamond('#9b5de5')}, {svg: diamond('#00bbf9')}, {svg: diamond('#00f5d4')},
    {svg: bamboo('#2b9348')}, {svg: bamboo('#55a630')}, {svg: bamboo('#80b918')}, {svg: bamboo('#aacc00')},
    {svg: wind('#333')}, {svg: wind('#555')}, {svg: wind('#777')}, {svg: wind('#999')},
  ];

  const state = {
    tiles: [],
    selected: null,
    moves: 0,
    timer: 0,
    timerHandle: null,
    history: [],
  };

  function resetTimer(){
    clearInterval(state.timerHandle);
    state.timer = 0;
    timeEl.textContent = "00:00";
    state.timerHandle = null;
  }

  function startTimerIfNeeded(){
    if (state.timerHandle) return;
    state.timerHandle = setInterval(() => {
      state.timer += 1;
      const m = Math.floor(state.timer/60).toString().padStart(2,'0');
      const s = (state.timer%60).toString().padStart(2,'0');
      timeEl.textContent = `${m}:${s}`;
    }, 1000);
  }

  function shuffle(arr){
    for (let i=arr.length-1; i>0; i--){
      const j = Math.floor(Math.random()*(i+1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ✅ FIXED: use SVG string as key so identical tiles always match
  function buildDeck(pairCount){
    const kinds = [];
    for (let i = 0; i < pairCount; i++) {
      kinds.push(ICONS[i % ICONS.length]);
    }

    const deck = [];
    let id = 1;
    kinds.forEach((sym) => {
      const key = sym.svg;
      deck.push({ id: id++, key, svg: sym.svg });
      deck.push({ id: id++, key, svg: sym.svg });
    });

    shuffle(deck);
    return deck;
  }

  function allowedPositions(){
    const spots = [];
    for (let r=0;r<ROWS;r++){
      for (let c=0;c<COLS;c++){
        if (MASK[r][c]) spots.push({r,c});
      }
    }
    return spots;
  }

  function init(){
    boardEl.style.setProperty('--cols', COLS);
    boardEl.innerHTML = '';
    state.tiles = [];
    state.selected = null;
    state.moves = 0;
    movesEl.textContent = '0';
    resetTimer();

    const spots = allowedPositions();
    if (spots.length % 2 === 1) spots.pop();
    const pairCount = spots.length / 2;
    const deck = buildDeck(pairCount);

    spots.forEach((spot, i) => {
      const card = deck[i];
      const el = tileTpl.content.firstElementChild.cloneNode(true);
      el.innerHTML = card.svg;
      el.dataset.key = card.key;
      el.dataset.r = spot.r;
      el.dataset.c = spot.c;
      el.style.gridColumn = (spot.c + 1);
      el.style.gridRow = (spot.r + 1);
      boardEl.appendChild(el);

      state.tiles.push({ ...spot, key: card.key, el, removed: false });
    });

    updateFreeFlags();
    updateRemaining();
    attachHandlers();
  }

  function attachHandlers(){
    boardEl.addEventListener('click', onBoardClick);
    newGameBtn.onclick = () => { init(); };
    undoBtn.onclick = onUndo;
    hintBtn.onclick = onHint;
    shuffleBtn.onclick = onShuffle;

    closeModalBtn.onclick = () => modal.classList.add('hidden');
    playAgainBtn.onclick = () => { modal.classList.add('hidden'); init(); };
  }

  function idxAt(r, c){
    return state.tiles.findIndex(t => !t.removed && t.r === r && t.c === c);
  }

  function leftOccupied(t){ return idxAt(t.r, t.c - 1) !== -1; }
  function rightOccupied(t){ return idxAt(t.r, t.c + 1) !== -1; }

  function isFree(t){
    return !t.removed && (!leftOccupied(t) || !rightOccupied(t));
  }

  function updateFreeFlags(){
    state.tiles.forEach(t => {
      const free = isFree(t);
      t.el.classList.toggle('free', free);
      t.free = free;
      t.el.disabled = t.removed;
    });
  }

  function onBoardClick(e){
    const tileEl = e.target.closest('.tile');
    if (!tileEl) return;
    const tile = state.tiles.find(t => t.el === tileEl);
    if (!tile || tile.removed) return;

    startTimerIfNeeded();
    updateFreeFlags();
    if (!tile.free) return pulse(tile.el);

    if (!state.selected){
      state.selected = tile;
      tile.el.classList.add('selected');
      return;
    }
    if (state.selected === tile){
      tile.el.classList.remove('selected');
      state.selected = null;
      return;
    }
    if (state.selected.key === tile.key){
      removePair(state.selected, tile);
      state.selected.el.classList.remove('selected');
      state.selected = null;
      state.moves += 1;
      movesEl.textContent = String(state.moves);
      updateRemaining();
      updateFreeFlags();
      checkWin();
    } else {
      pulse(tile.el);
      pulse(state.selected.el);
      state.selected.el.classList.remove('selected');
      state.selected = tile;
      tile.el.classList.add('selected');
    }
  }

  function pulse(el){
    el.animate([
      { transform: 'translateY(0)' },
      { transform: 'translateY(-4px)' },
      { transform: 'translateY(0)' }
    ], { duration: 180, easing: 'ease-out' });
  }

  function removePair(a, b){
    a.removed = true; b.removed = true;
    a.el.classList.add('removed'); b.el.classList.add('removed');
    state.history.push({ a: {r:a.r,c:a.c,key:a.key,html:a.el.innerHTML}, b: {r:b.r,c:b.c,key:b.key,html:b.el.innerHTML} });
    setTimeout(() => {
      a.el.remove(); b.el.remove();
    }, 220);
  }

  function updateRemaining(){
    const remain = state.tiles.filter(t => !t.removed).length;
    remainingEl.textContent = String(remain);
  }

  function checkWin(){
    const remain = state.tiles.filter(t => !t.removed).length;
    if (remain === 0){
      clearInterval(state.timerHandle);
      state.timerHandle = null;
      modalTitle.textContent = 'You win! 🎉';
      modalMsg.textContent = `Time ${timeEl.textContent} • Moves ${state.moves}`;
      modal.classList.remove('hidden');
    } else if (!existsFreeMatch()){
      modalTitle.textContent = 'No more moves 😵';
      modalMsg.textContent = 'Try shuffling the remaining tiles or start a new game.';
      modal.classList.remove('hidden');
    }
  }

  function onUndo(){
    const last = state.history.pop();
    if (!last) return;
    [last.a, last.b].forEach(item => {
      const el = tileTpl.content.firstElementChild.cloneNode(true);
      el.innerHTML = item.html;
      el.dataset.key = item.key;
      el.dataset.r = item.r;
      el.dataset.c = item.c;
      el.style.gridColumn = (item.c + 1);
      el.style.gridRow = (item.r + 1);
      boardEl.appendChild(el);
      const t = state.tiles.find(ti => ti.r===item.r && ti.c===item.c);
      if (t){
        t.removed = false;
        t.el = el;
        t.key = item.key;
      }
    });
    updateRemaining();
    updateFreeFlags();
  }

  function findFreePairs(){
    const free = state.tiles.filter(t => !t.removed && isFree(t));
    const groups = {};
    free.forEach(t => {
      (groups[t.key] ||= []).push(t);
    });
    const pairs = [];
    Object.values(groups).forEach(list => {
      for (let i=0;i+1<list.length;i+=2) pairs.push([list[i], list[i+1]]);
    });
    return pairs;
  }

  function existsFreeMatch(){ return findFreePairs().length > 0; }

  function onHint(){
    const pairs = findFreePairs();
    if (!pairs.length){ pulse(boardEl); return; }
    const [a, b] = pairs[0];
    [a.el, b.el].forEach(el => {
      el.classList.add('selected');
      el.animate([{opacity:1},{opacity:.5},{opacity:1}], {duration:600, iterations:2});
      setTimeout(() => el.classList.remove('selected'), 1400);
    });
  }

  function onShuffle(){
    const remainTiles = state.tiles.filter(t => !t.removed);
    const spots = remainTiles.map(t => ({r:t.r, c:t.c}));
    shuffle(spots);
    remainTiles.forEach((t, i) => {
      const s = spots[i];
      t.r = s.r; t.c = s.c;
      t.el.dataset.r = s.r;
      t.el.dataset.c = s.c;
      t.el.style.gridColumn = (s.c + 1);
      t.el.style.gridRow = (s.r + 1);
    });
    updateFreeFlags();
    modal.classList.add('hidden');
  }

  init();
})();
