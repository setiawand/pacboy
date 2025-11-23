const TILE = 24;
const MAPS = [
  [
    "WWWWWWWWWWWWWWWWWWW",
    "W........W........W",
    "W.WWWW.W.W.W.WWWW.W",
    "WoW    W...W    WoW",
    "W.W WW WWWWW WW W.W",
    "W...W...W...W...W.W",
    "WWW.WWW W W WWW.WWW",
    "W........W........W",
    "W.WWWW.W.W.W.WWWW.W",
    "W.W  W.W   W.W  W.W",
    "W...W...WWW...W...W",
    "WWWWWWWWWWWWWWWWWWW"
  ],
  [
    "WWWWWWWWWWWWWWWWWWW",
    "W.o......W......o.W",
    "W.WWWW.W.W.W.WWWW.W",
    "W.W    W...W    W.W",
    "W.W WW WWWWW WW W.W",
    "W...W.......W...W.W",
    "WWW.WWW W W WWW.WWW",
    "W........W........W",
    "W.WWWW.W.W.W.WWWW.W",
    "W.W  W.W   W.W  W.W",
    "W...W...WWW...W...W",
    "WWWWWWWWWWWWWWWWWWW"
  ],
  [
    "WWWWWWWWWWWWWWWWWWW",
    "W....W.......W....W",
    "W.WW.W.WWWW.W.WW.WW",
    "W.o  W.....W  o.W.W",
    "WWW WW WWWWW WW WWW",
    "W...W...W...W...W.W",
    "W.W.WWW W W WWW.W.W",
    "W........W........W",
    "W.WWWW.W.W.W.WWWW.W",
    "W.W  W.W   W.W  W.W",
    "W...W...WWW...W...W",
    "WWWWWWWWWWWWWWWWWWW"
  ],
  [
    "WWWWWWWWWWWWWWWWWWW",
    "W.....o..W..o.....W",
    "W.WWWW.W.W.W.WWWW.W",
    "W.W    W...W    W.W",
    "W.W WW WWWWW WW W.W",
    "W...W...W...W...W.W",
    "WWW.WWW W W WWW.WWW",
    "W........W........W",
    "W.WWWW.W.W.W.WWWW.W",
    "W.W  W.W   W.W  W.W",
    "W...W...WWW...W...W",
    "WWWWWWWWWWWWWWWWWWW"
  ]
];
let mapIndex = 0;
let MAP = MAPS[mapIndex].slice();
const ROWS = MAP.length;
const COLS = MAP[0].length;
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = COLS * TILE;
canvas.height = ROWS * TILE;
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const overlayEl = document.getElementById("overlay");
const finalScoreEl = document.getElementById("finalScore");
const finalLevelEl = document.getElementById("finalLevel");
const restartBtn = document.getElementById("restart");
const btnLeft = document.getElementById("btnLeft");
const btnRight = document.getElementById("btnRight");
const btnUp = document.getElementById("btnUp");
const btnDown = document.getElementById("btnDown");
let score = 0;
let lives = 3;
let running = false;
let lastTime = 0;
let pelletsLeft = 0;
let frightenedUntil = 0;
let startGraceUntil = 0;
let level = 1;
const MAX_GHOSTS = 4;
const SPAWN = { c: 9, r: 6 };
let gameOver = false;
const pacman = { x: 0, y: 0, dir: { x: 0, y: 0 }, next: { x: 0, y: 0 }, speed: 90, mouth: 0 };
const ghosts = [];
function getCol(x) { return Math.floor(x / TILE); }
function getRow(y) { return Math.floor(y / TILE); }
function cell(c, r) { return MAP[r][c]; }
function isWall(c, r) { return MAP[r][c] === 'W'; }
function setCell(c, r, ch) {
  const s = MAP[r];
  MAP[r] = s.slice(0, c) + ch + s.slice(c + 1);
}
function restoreMap() {
  MAP = MAPS[mapIndex].slice();
}
function computeReachableFrom(c0, r0) {
  const q = [];
  const seen = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  const start = findOpenCellNear(c0, r0);
  q.push(start);
  seen[start.r][start.c] = true;
  while (q.length) {
    const { c, r } = q.shift();
    const nbrs = [
      { c: c + 1, r }, { c: c - 1, r }, { c, r: r + 1 }, { c, r: r - 1 }
    ];
    for (const n of nbrs) {
      if (n.c < 0 || n.c >= COLS || n.r < 0 || n.r >= ROWS) continue;
      if (seen[n.r][n.c]) continue;
      if (isWall(n.c, n.r)) continue;
      seen[n.r][n.c] = true;
      q.push(n);
    }
  }
  return seen;
}
function sanitizeUnreachablePellets() {
  const reach = computeReachableFrom(SPAWN.c, SPAWN.r);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const ch = MAP[r][c];
      if ((ch === '.' || ch === 'o') && !reach[r][c]) {
        setCell(c, r, ' ');
      }
    }
  }
}
function resetMap() {
  pelletsLeft = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const ch = MAP[r][c];
      if (ch === '.') pelletsLeft++;
      if (ch === 'o') pelletsLeft++;
    }
  }
}
function placeEntities() {
  const spot = findOpenCellNear(SPAWN.c, SPAWN.r);
  pacman.x = (spot.c + 0.5) * TILE;
  pacman.y = (spot.r + 0.5) * TILE;
  pacman.dir = { x: 0, y: 0 };
  pacman.next = { x: -1, y: 0 };
  ghosts.length = 0;
  const corners = [
    { c: 1, r: 1, dir: { x: 1, y: 0 }, color: '#ff0000', delay: 2000 },
    { c: COLS - 2, r: 1, dir: { x: -1, y: 0 }, color: '#ffb8ff', delay: 3500 },
    { c: 1, r: ROWS - 2, dir: { x: 1, y: 0 }, color: '#00ffff', delay: 5000 },
    { c: COLS - 2, r: ROWS - 2, dir: { x: -1, y: 0 }, color: '#ffb847', delay: 6500 }
  ];
  const now = performance.now();
  const count = Math.min(corners.length, Math.min(MAX_GHOSTS, 1 + Math.floor((level - 1) / 4)));
  for (let i = 0; i < count; i++) {
    const p = corners[i];
    const spot = findOpenCellNear(p.c, p.r);
    const spd = 70 + Math.min(20, level * 2);
    ghosts.push({ x: (spot.c + 0.5) * TILE, y: (spot.r + 0.5) * TILE, dir: p.dir, speed: spd, color: p.color, dead: false, releaseAt: now + p.delay });
  }
}
function resetGame() {
  score = 0;
  lives = 3;
  frightenedUntil = 0;
  startGraceUntil = performance.now() + 3000;
  mapIndex = 0;
  level = 1;
  gameOver = false;
  restoreMap();
  sanitizeUnreachablePellets();
  resetMap();
  placeEntities();
  updateHUD();
  if (overlayEl) overlayEl.classList.add('hidden');
}
function advanceLevel() {
  level += 1;
  frightenedUntil = 0;
  startGraceUntil = performance.now() + 2000;
  mapIndex = (mapIndex + 1) % MAPS.length;
  restoreMap();
  sanitizeUnreachablePellets();
  resetMap();
  placeEntities();
  updateHUD();
}
function showGameOver() {
  gameOver = true;
  running = false;
  if (finalScoreEl) finalScoreEl.textContent = String(score);
  if (finalLevelEl) finalLevelEl.textContent = String(level);
  if (overlayEl) overlayEl.classList.remove('hidden');
}
function updateHUD() {
  scoreEl.textContent = "Skor: " + score;
  livesEl.textContent = "Nyawa: " + lives;
  const lvlEl = document.getElementById("level");
  if (lvlEl) lvlEl.textContent = "Level: " + level;
}
function nearCenter(v, center) { return Math.abs(v - center) < 1; }
function canMove(entity, dir) {
  const c = getCol(entity.x);
  const r = getRow(entity.y);
  const cx = c * TILE + TILE / 2;
  const ry = r * TILE + TILE / 2;
  if (dir.x !== 0) {
    if (!nearCenter(entity.y, ry)) return false;
    const nc = c + Math.sign(dir.x);
    if (isWall(nc, r)) return false;
  }
  if (dir.y !== 0) {
    if (!nearCenter(entity.x, cx)) return false;
    const nr = r + Math.sign(dir.y);
    if (isWall(c, nr)) return false;
  }
  return true;
}
function tryTurn() {
  if (pacman.next.x === pacman.dir.x && pacman.next.y === pacman.dir.y) return;
  const c = getCol(pacman.x);
  const r = getRow(pacman.y);
  const cx = c * TILE + TILE / 2;
  const ry = r * TILE + TILE / 2;
  if (nearCenter(pacman.x, cx) && nearCenter(pacman.y, ry)) {
    if (canMove(pacman, pacman.next)) pacman.dir = { x: pacman.next.x, y: pacman.next.y };
  }
}
function moveEntity(e, dt) {
  const sp = e.speed * dt;
  const nx = e.x + e.dir.x * sp;
  const ny = e.y + e.dir.y * sp;
  const c = getCol(e.x);
  const r = getRow(e.y);
  const cx = c * TILE + TILE / 2;
  const ry = r * TILE + TILE / 2;
  if (e.dir.x !== 0) {
    if (!nearCenter(e.y, ry)) e.y += Math.sign(ry - e.y) * Math.min(Math.abs(ry - e.y), sp);
    const ahead = e.dir.x > 0 ? getCol(e.x + TILE / 2) + 0 : getCol(e.x - TILE / 2);
    if (!isWall(ahead, r)) e.x = nx; else e.x = cx;
  }
  if (e.dir.y !== 0) {
    if (!nearCenter(e.x, cx)) e.x += Math.sign(cx - e.x) * Math.min(Math.abs(cx - e.x), sp);
    const ahead = e.dir.y > 0 ? getRow(e.y + TILE / 2) + 0 : getRow(e.y - TILE / 2);
    if (!isWall(c, ahead)) e.y = ny; else e.y = ry;
  }
  if (e.x < 0) e.x = COLS * TILE - 1;
  if (e.x >= COLS * TILE) e.x = 1;
  if (e.y < 0) e.y = ROWS * TILE - 1;
  if (e.y >= ROWS * TILE) e.y = 1;
}
function eatPellet() {
  const c = getCol(pacman.x);
  const r = getRow(pacman.y);
  const ch = cell(c, r);
  if (ch === '.') {
    setCell(c, r, ' ');
    score += 10;
    pelletsLeft--;
  } else if (ch === 'o') {
    setCell(c, r, ' ');
    score += 50;
    pelletsLeft--;
    frightenedUntil = performance.now() + 6000;
  }
}
function dist(ax, ay, bx, by) { const dx = ax - bx, dy = ay - by; return Math.hypot(dx, dy); }
function availableDirs(e) {
  const dirs = [];
  const c = getCol(e.x);
  const r = getRow(e.y);
  const cx = c * TILE + TILE / 2;
  const ry = r * TILE + TILE / 2;
  if (!nearCenter(e.x, cx) || !nearCenter(e.y, ry)) return dirs;
  if (!isWall(c + 1, r)) dirs.push({ x: 1, y: 0 });
  if (!isWall(c - 1, r)) dirs.push({ x: -1, y: 0 });
  if (!isWall(c, r + 1)) dirs.push({ x: 0, y: 1 });
  if (!isWall(c, r - 1)) dirs.push({ x: 0, y: -1 });
  return dirs;
}
function findOpenCellNear(c, r) {
  if (!isWall(c, r)) return { c, r };
  const deltas = [
    { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
    { x: 1, y: 1 }, { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 },
    { x: 2, y: 0 }, { x: -2, y: 0 }, { x: 0, y: 2 }, { x: 0, y: -2 }
  ];
  for (const d of deltas) {
    const nc = Math.min(Math.max(0, c + d.x), COLS - 1);
    const nr = Math.min(Math.max(0, r + d.y), ROWS - 1);
    if (!isWall(nc, nr)) return { c: nc, r: nr };
  }
  return { c: c, r: r };
}
function ghostAI(g) {
  const now = performance.now();
  const fright = now < frightenedUntil;
  const dirs = availableDirs(g);
  if (!dirs.length) return;
  const rev = { x: -g.dir.x, y: -g.dir.y };
  const choices = dirs.filter(d => !(d.x === rev.x && d.y === rev.y));
  let pick = choices.length ? choices : dirs;
  if (fright) {
    pick = pick.sort((a, b) => dist(g.x + a.x, g.y + a.y, pacman.x, pacman.y) - dist(g.x + b.x, g.y + b.y, pacman.x, pacman.y)).reverse();
  } else {
    pick = pick.sort((a, b) => dist(g.x + a.x, g.y + a.y, pacman.x, pacman.y) - dist(g.x + b.x, g.y + b.y, pacman.x, pacman.y));
  }
  g.dir = pick[0];
  g.speed = fright ? 60 : 75;
}
function checkCollisions() {
  if (performance.now() < startGraceUntil) return;
  for (const g of ghosts) {
    if (g.dead) continue;
    const d = dist(pacman.x, pacman.y, g.x, g.y);
    if (d < TILE * 0.6) {
      const fright = performance.now() < frightenedUntil;
      if (fright) {
        score += 200;
        g.dead = true;
        g.x = (9 + 0.5) * TILE;
        g.y = (6 + 0.5) * TILE;
        setTimeout(() => { g.dead = false; }, 1500);
      } else {
        lives -= 1;
        updateHUD();
        pacman.x = (9 + 0.5) * TILE;
        pacman.y = (6 + 0.5) * TILE;
        pacman.dir = { x: 0, y: 0 };
        pacman.next = { x: -1, y: 0 };
        frightenedUntil = 0;
        startGraceUntil = performance.now() + 1500;
        if (lives <= 0) {
          showGameOver();
        }
        return;
      }
    }
  }
}
function drawMaze() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const ch = MAP[r][c];
      const x = c * TILE;
      const y = r * TILE;
      if (ch === 'W') {
        ctx.fillStyle = "#1e3cff";
        ctx.fillRect(x, y, TILE, TILE);
      } else if (ch === '.') {
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + TILE / 2, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (ch === 'o') {
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + TILE / 2, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
function drawPacman() {
  const t = performance.now() / 120;
  const a = (Math.sin(t) * 0.25 + 0.35) * Math.PI;
  let start = 0;
  if (pacman.dir.x === 1) start = a;
  if (pacman.dir.x === -1) start = Math.PI - a;
  if (pacman.dir.y === -1) start = -Math.PI / 2 + a;
  if (pacman.dir.y === 1) start = Math.PI / 2 + a;
  ctx.fillStyle = "#ffd700";
  ctx.beginPath();
  ctx.moveTo(pacman.x, pacman.y);
  ctx.arc(pacman.x, pacman.y, TILE * 0.45, start, start + (Math.PI * 2 - 2 * a));
  ctx.fill();
}
function drawGhost(g) {
  ctx.fillStyle = g.dead ? "#888" : g.color;
  ctx.beginPath();
  ctx.arc(g.x, g.y, TILE * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(g.x - 6, g.y - 4, 4, 0, Math.PI * 2);
  ctx.arc(g.x + 6, g.y - 4, 4, 0, Math.PI * 2);
  ctx.fill();
}
function update(dt) {
  tryTurn();
  moveEntity(pacman, dt);
  eatPellet();
  const now = performance.now();
  for (const g of ghosts) {
    if (g.dead) continue;
    if (now < g.releaseAt) continue;
    ghostAI(g);
    moveEntity(g, dt);
  }
  checkCollisions();
  updateHUD();
  if (pelletsLeft <= 0) advanceLevel();
}
function render() {
  drawMaze();
  drawPacman();
  for (const g of ghosts) drawGhost(g);
}
function loop(ts) {
  if (!running) { render(); lastTime = ts; return requestAnimationFrame(loop); }
  const dt = Math.min(0.03, (ts - lastTime) / 1000);
  lastTime = ts;
  update(dt);
  render();
  requestAnimationFrame(loop);
}
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') pacman.next = { x: -1, y: 0 };
  if (e.key === 'ArrowRight') pacman.next = { x: 1, y: 0 };
  if (e.key === 'ArrowUp') pacman.next = { x: 0, y: -1 };
  if (e.key === 'ArrowDown') pacman.next = { x: 0, y: 1 };
});
startBtn.addEventListener('click', () => {
  resetGame();
  running = true;
});
pauseBtn.addEventListener('click', () => {
  running = !running;
});
if (restartBtn) {
restartBtn.addEventListener('click', () => {
  resetGame();
  running = true;
});
}
if (btnLeft) {
  btnLeft.addEventListener('click', () => { pacman.next = { x: -1, y: 0 }; });
  btnLeft.addEventListener('touchstart', e => { e.preventDefault(); pacman.next = { x: -1, y: 0 }; });
}
if (btnRight) {
  btnRight.addEventListener('click', () => { pacman.next = { x: 1, y: 0 }; });
  btnRight.addEventListener('touchstart', e => { e.preventDefault(); pacman.next = { x: 1, y: 0 }; });
}
if (btnUp) {
  btnUp.addEventListener('click', () => { pacman.next = { x: 0, y: -1 }; });
  btnUp.addEventListener('touchstart', e => { e.preventDefault(); pacman.next = { x: 0, y: -1 }; });
}
if (btnDown) {
  btnDown.addEventListener('click', () => { pacman.next = { x: 0, y: 1 }; });
  btnDown.addEventListener('touchstart', e => { e.preventDefault(); pacman.next = { x: 0, y: 1 }; });
}
let touchStartX = 0;
let touchStartY = 0;
canvas.addEventListener('touchstart', e => {
  const t = e.changedTouches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
}, { passive: true });
canvas.addEventListener('touchend', e => {
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  const thr = 24;
  if (ax < thr && ay < thr) return;
  if (ax > ay) {
    pacman.next = { x: dx > 0 ? 1 : -1, y: 0 };
  } else {
    pacman.next = { x: 0, y: dy > 0 ? 1 : -1 };
  }
});
resetGame();
requestAnimationFrame(loop);