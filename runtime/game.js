(() => {
  const config = window.ARCADE_CONFIG;
  const root = document.documentElement;
  root.style.setProperty('--accent', config.theme.accent);
  root.style.setProperty('--mint', config.theme.mint);
  root.style.setProperty('--background', config.theme.background);
  document.title = `${config.title} · ArcadeKit`;

  document.querySelector('#app').innerHTML = `
    <div class="shell">
      <div class="brand"><div class="brand-word"><span class="brand-icon">✳</span> PLAYROOM</div><span class="live">READY TO PLAY</span></div>
      <header class="heading"><h1>${config.title}</h1><p>${config.subtitle}</p></header>
      <div class="hud">
        <div class="stat"><span class="stat-label">SCORE / 得分</span><span class="stat-value score" id="score">0</span></div>
        <div class="stat"><span class="stat-label">TIME / 剩余</span><span class="stat-value" id="timer">${config.duration}<small>s</small></span></div>
        <div class="stat"><span class="stat-label">COMBO / 连击</span><span class="stat-value" id="combo">0<small>×1</small></span></div>
        <button class="pause" id="pause" aria-label="暂停游戏" disabled>Ⅱ</button>
      </div>
      <div class="arena" id="arena">
        <div class="progress"><div class="progress-fill" id="progress"></div></div>
        <canvas id="game" width="840" height="960" aria-label="拖动${config.player.name}左右移动接取目标"></canvas>
        <div class="overlay" id="overlay"></div>
      </div>
      <div class="instructions">${config.controls}</div>
      <div class="bottom"><span class="best">个人最佳 <b id="best">0</b></span><span class="credit">${config.footer}</span></div>
    </div>`;

  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d');
  const overlay = document.querySelector('#overlay');
  const scoreEl = document.querySelector('#score');
  const timerEl = document.querySelector('#timer');
  const comboEl = document.querySelector('#combo');
  const pauseBtn = document.querySelector('#pause');
  const progress = document.querySelector('#progress');
  const bestEl = document.querySelector('#best');
  const W = 420;
  const H = 480;
  ctx.scale(2, 2);
  let state = 'menu';
  let playerX = W / 2;
  let targetX = W / 2;
  let elapsed = 0;
  let score = 0;
  let combo = 0;
  let bestCombo = 0;
  let caught = 0;
  let hit = 0;
  let spawnClock = 0;
  let objects = [];
  let particles = [];
  let labels = [];
  let lastTime = 0;
  let flash = 0;
  let best = Number(localStorage.getItem(config.storageKey) || 0);
  const keys = new Set();
  bestEl.textContent = best;

  const randomItem = list => list[Math.floor(Math.random() * list.length)];
  const clampX = x => Math.max(34, Math.min(W - 34, x));
  const multiplier = () => Math.min(3, 1 + Math.floor(combo / 5));

  function showMenu() {
    overlay.hidden = false;
    overlay.innerHTML = `
      <span class="pill">${config.eyebrow}</span>
      <div class="hero-icon">🛸</div>
      <h2>快乐，从天而降</h2>
      <p>${config.intro}</p>
      <div class="rules"><div class="rule"><span>＋</span>接住目标</div><div class="rule bad"><span>－</span>避开障碍</div><div class="rule"><span>×3</span>连击加成</div></div>
      <button class="primary" id="start">开玩！ <span aria-hidden="true">↗</span></button>
      <span class="tiny">${config.duration} 秒一局 · 无需下载</span>`;
    document.querySelector('#start').onclick = start;
  }

  function start() {
    state = 'playing';
    elapsed = 0;
    score = 0;
    combo = 0;
    bestCombo = 0;
    caught = 0;
    hit = 0;
    spawnClock = 0.35;
    objects = [];
    particles = [];
    labels = [];
    playerX = W / 2;
    targetX = W / 2;
    flash = 0;
    overlay.hidden = true;
    pauseBtn.disabled = false;
    pauseBtn.textContent = 'Ⅱ';
    updateHud();
  }

  function updateHud() {
    scoreEl.textContent = score;
    timerEl.innerHTML = `${Math.ceil(Math.max(0, config.duration - elapsed))}<small>s</small>`;
    comboEl.innerHTML = `${combo}<small>×${multiplier()}</small>`;
    progress.style.width = `${100 * Math.max(0, 1 - elapsed / config.duration)}%`;
  }

  function pause() {
    if (state !== 'playing') return;
    state = 'paused';
    keys.clear();
    pauseBtn.textContent = '▶';
    overlay.hidden = false;
    overlay.innerHTML = '<span class="pill">TAKE A BREATH</span><div class="hero-icon">☕</div><h2>休息一下</h2><p>快乐不会跑掉，准备好再继续。</p><button class="primary" id="resume">继续接快乐</button>';
    document.querySelector('#resume').onclick = resume;
  }

  function resume() {
    state = 'playing';
    overlay.hidden = true;
    pauseBtn.textContent = 'Ⅱ';
  }

  function finish() {
    state = 'result';
    pauseBtn.disabled = true;
    const isRecord = score > best;
    best = Math.max(best, score);
    localStorage.setItem(config.storageKey, best);
    bestEl.textContent = best;
    const rank = [...config.ranks].sort((a, b) => b.min - a.min).find(item => score >= item.min);
    overlay.hidden = false;
    overlay.innerHTML = `
      <span class="pill">CHALLENGE COMPLETE</span>
      <div class="hero-icon">${rank.icon}</div>
      <h2>${rank.title}</h2>
      <div class="result-score">${score}<small>TOTAL SCORE</small></div>
      ${isRecord ? '<div class="record">✦ 创造个人新纪录 ✦</div>' : ''}
      <p>${rank.line}</p>
      <div class="result-details"><span><b>${caught}</b>接住目标</span><span><b>${bestCombo}</b>最高连击</span><span><b>${hit}</b>碰到障碍</span></div>
      <button class="primary" id="retry">再来一局 ↗</button>`;
    document.querySelector('#retry').onclick = start;
  }

  function spawn() {
    const bad = Math.random() < config.difficulty.obstacleChance;
    const item = randomItem(bad ? config.obstacles : config.targets);
    ctx.font = 'bold 13px system-ui';
    const width = Math.max(58, ctx.measureText(item.text).width + 26);
    objects.push({ ...item, bad, width, x: 15 + width / 2 + Math.random() * (W - width - 30), y: -25, speed: 0.85 + Math.random() * 0.3 });
  }

  function burst(x, y, color) {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 35 + Math.random() * 90;
      particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 30, life: 0.55, color });
    }
  }

  function collect(item) {
    if (item.bad) {
      score = Math.max(0, score - item.penalty);
      combo = 0;
      hit++;
      flash = 0.18;
      labels.push({ x: playerX, y: H - 107, text: `-${item.penalty}`, color: item.color, life: 0.8 });
    } else {
      combo++;
      caught++;
      bestCombo = Math.max(bestCombo, combo);
      const points = item.points * multiplier();
      score += points;
      labels.push({ x: playerX, y: H - 107, text: `+${points}${multiplier() > 1 ? ` ×${multiplier()}` : ''}`, color: item.color, life: 0.8 });
    }
    burst(item.x, item.y, item.color);
    updateHud();
  }

  function update(dt) {
    elapsed += dt;
    if (elapsed >= config.duration) {
      elapsed = config.duration;
      updateHud();
      finish();
      return;
    }
    if (keys.has('ArrowLeft') || keys.has('a')) targetX = clampX(targetX - 360 * dt);
    if (keys.has('ArrowRight') || keys.has('d')) targetX = clampX(targetX + 360 * dt);
    playerX += (targetX - playerX) * Math.min(1, 20 * dt);
    const phase = elapsed / config.duration;
    const difficulty = config.difficulty;
    const fallSpeed = difficulty.startSpeed + (difficulty.endSpeed - difficulty.startSpeed) * phase;
    const interval = difficulty.spawnStart + (difficulty.spawnEnd - difficulty.spawnStart) * phase;
    spawnClock -= dt;
    if (spawnClock <= 0) {
      spawn();
      spawnClock = interval;
    }
    for (let i = objects.length - 1; i >= 0; i--) {
      const item = objects[i];
      item.y += fallSpeed * item.speed * dt;
      if (item.y > H - 96 && item.y < H - 49 && Math.abs(item.x - playerX) < item.width / 2 + 23) {
        collect(item);
        objects.splice(i, 1);
      } else if (item.y > H + 25) {
        if (!item.bad) combo = 0;
        objects.splice(i, 1);
      }
    }
    for (const particle of particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 160 * dt;
      particle.life -= dt;
    }
    particles = particles.filter(p => p.life > 0);
    labels.forEach(label => { label.y -= 35 * dt; label.life -= dt; });
    labels = labels.filter(label => label.life > 0);
    flash = Math.max(0, flash - dt);
    updateHud();
  }

  function roundRect(x, y, w, h, radius, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();
  }

  function drawPlayer(time) {
    const y = H - 74;
    const bob = state === 'playing' ? 0 : Math.sin(time * 2) * 3;
    ctx.save();
    ctx.translate(playerX, y + bob);
    ctx.fillStyle = '#00000030';
    ctx.beginPath(); ctx.ellipse(0, 47, 33, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = config.player.color;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-9, -18); ctx.lineTo(-16, -28); ctx.moveTo(9, -18); ctx.lineTo(16, -28); ctx.stroke();
    roundRect(-27, -18, 54, 43, 12, config.player.color);
    roundRect(-20, -11, 40, 26, 7, '#252039');
    ctx.font = 'bold 19px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#eee8ff';
    ctx.fillText(config.player.face, 0, 8);
    roundRect(-21, 24, 13, 11, 4, config.player.color);
    roundRect(8, 24, 13, 11, 4, config.player.color);
    roundRect(-35, -25, 70, 8, 4, config.theme.mint);
    ctx.restore();
  }

  function draw(time) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = config.theme.background;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#ffffff04';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 35) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 35) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    for (let i = 0; i < 22; i++) {
      const x = (i * 83 + 21) % W;
      const y = (i * 137 + 40) % (H - 90);
      ctx.globalAlpha = .13 + .12 * Math.sin(time + i);
      ctx.fillStyle = i % 2 ? config.theme.accent : config.theme.mint;
      ctx.fillRect(x, y, i % 3 ? 2 : 3, i % 3 ? 2 : 3);
    }
    ctx.globalAlpha = 1;
    const glow = ctx.createRadialGradient(playerX, H - 45, 0, playerX, H - 45, 150);
    glow.addColorStop(0, '#ad9bff17'); glow.addColorStop(1, '#ad9bff00');
    ctx.fillStyle = glow; ctx.fillRect(0, H - 195, W, 195);
    ctx.strokeStyle = '#ad9bff20'; ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.moveTo(14, H - 34); ctx.lineTo(W - 14, H - 34); ctx.stroke(); ctx.setLineDash([]);

    const visibleObjects = state === 'menu' ? [
      { ...config.targets[0], x: 80, y: 75, width: 85, bad: false },
      { ...config.targets[1 % config.targets.length], x: 332, y: 125, width: 90, bad: false },
      { ...config.obstacles[0], x: 275, y: 40, width: 94, bad: true }
    ] : objects;
    for (const item of visibleObjects) {
      roundRect(item.x - item.width / 2, item.y - 15, item.width, 30, 9, item.bad ? '#ff697e18' : `${item.color}20`);
      ctx.strokeStyle = `${item.color}75`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(item.x - item.width / 2, item.y - 15, item.width, 30, 9); ctx.stroke();
      ctx.fillStyle = item.color; ctx.font = 'bold 13px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(item.text, item.x, item.y + 5);
    }
    drawPlayer(time);
    for (const particle of particles) {
      ctx.globalAlpha = particle.life / .55;
      roundRect(particle.x - 2, particle.y - 2, 4, 4, 1, particle.color);
    }
    for (const label of labels) {
      ctx.globalAlpha = Math.min(1, label.life * 2);
      ctx.fillStyle = label.color; ctx.font = 'bold 20px system-ui'; ctx.textAlign = 'center'; ctx.fillText(label.text, label.x, label.y);
    }
    ctx.globalAlpha = 1;
    if (flash > 0) { ctx.fillStyle = `rgba(255,70,100,${flash * .5})`; ctx.fillRect(0, 0, W, H); }
  }

  function frame(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;
    if (state === 'playing') update(dt);
    draw(timestamp / 1000);
    requestAnimationFrame(frame);
  }

  function movePointer(event) {
    const box = canvas.getBoundingClientRect();
    targetX = clampX((event.clientX - box.left) / box.width * W);
  }
  canvas.addEventListener('pointerdown', event => {
    if (state !== 'playing') return;
    canvas.setPointerCapture(event.pointerId);
    movePointer(event);
  });
  canvas.addEventListener('pointermove', event => {
    if (state === 'playing' && (event.pointerType === 'mouse' || canvas.hasPointerCapture(event.pointerId))) movePointer(event);
  });
  window.addEventListener('keydown', event => {
    if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(event.key) && state === 'playing') {
      event.preventDefault();
      keys.add(event.key);
    }
    if (event.key === 'Escape') {
      if (state === 'playing') pause();
      else if (state === 'paused') resume();
    }
  });
  window.addEventListener('keyup', event => keys.delete(event.key));
  window.addEventListener('blur', pause);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  pauseBtn.onclick = () => state === 'paused' ? resume() : pause();
  showMenu();
  requestAnimationFrame(frame);
})();
