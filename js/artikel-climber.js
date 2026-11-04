/**
 * Artikel Climber — canvas gender platforms inside the Schnapp shell.
 */

import {
  initClimberPools,
  markClimberCorrect,
  markClimberIncorrect,
  pickClimberWord,
} from "./artikel-climber-pools.js";

const BASE_GRAVITY = 0.2;
const BASE_BOUNCE = -8.2;
const BASE_MEGA_BOUNCE = -11.2;
const BASE_MOVE = 3.0;
const MAX_LIVES = 3;
/** Eyes stay dark on the white ball in both themes. */
const EYE_INK = "#1a2030";

/**
 * @param {HTMLElement} root
 * @param {{
 *   words: { word: string, article: string, gender: string }[],
 *   audio?: boolean,
 *   speak?: (text: string) => void,
 *   playFeedback?: (kind: "ok"|"bad"|"retry") => void,
 *   scoreEl?: HTMLElement|null,
 *   livesEl?: HTMLElement|null,
 *   onExit?: () => void,
 * }} options
 */
export function mountArtikelClimber(root, options = {}) {
  const words = Array.isArray(options.words) ? options.words : [];
  const audioOn = options.audio !== false;
  const speak = typeof options.speak === "function" ? options.speak : () => {};
  const playFeedback =
    typeof options.playFeedback === "function" ? options.playFeedback : () => {};
  const onExit = typeof options.onExit === "function" ? options.onExit : null;
  const scoreEl =
    options.scoreEl || document.getElementById("climber-top-score");
  const livesEl =
    options.livesEl || document.getElementById("climber-top-lives");

  root.innerHTML = `
    <div class="climber-shell">
      <div class="climber-stage" data-climber-stage>
        <canvas class="climber-canvas" data-climber-canvas></canvas>
        <div class="climber-next" data-climber-next hidden>
          <span class="climber-next-label">Next up</span>
          <span class="climber-next-word" data-climber-next-word></span>
        </div>
        <div class="climber-overlay" data-climber-start>
          <div class="climber-panel">
            <h1 class="climber-title">Wort-Hüpfer</h1>
            <label class="climber-speed">
              <select data-climber-speed aria-label="Speed">
                <option value="0.8">Relaxed Rate</option>
                <option value="1.0" selected>Normal Speed</option>
                <option value="1.15">Frantic Pace</option>
              </select>
            </label>
            <button type="button" class="btn btn-primary" data-climber-play>Start</button>
          </div>
        </div>
        <div class="climber-overlay is-hidden" data-climber-over hidden>
          <div class="climber-panel">
            <h1 class="climber-title">Spiel vorbei!</h1>
            <p class="climber-lede">Punktzahl</p>
            <p class="climber-final" data-climber-final>0</p>
            <div class="climber-over-actions">
              <button type="button" class="btn btn-primary" data-climber-continue>Continue</button>
              <button type="button" class="btn" data-climber-retry>Restart</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const stage = root.querySelector("[data-climber-stage]");
  const canvas = root.querySelector("[data-climber-canvas]");
  const ctx = canvas.getContext("2d");
  const startEl = root.querySelector("[data-climber-start]");
  const overEl = root.querySelector("[data-climber-over]");
  const finalEl = root.querySelector("[data-climber-final]");
  const speedEl = root.querySelector("[data-climber-speed]");
  const nextEl = root.querySelector("[data-climber-next]");
  const nextWordEl = root.querySelector("[data-climber-next-word]");

  function displayFont(weight, sizePx) {
    const family =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--font-display")
        .trim() || "system-ui, sans-serif";
    return `${weight} ${sizePx}px ${family}`;
  }

  function setScoreDisplay(n) {
    if (scoreEl) {
      scoreEl.hidden = false;
      scoreEl.textContent = String(n);
    }
  }

  function setLivesDisplay(n) {
    if (!livesEl) return;
    livesEl.hidden = false;
    livesEl.querySelectorAll(".climber-life").forEach((el, i) => {
      el.classList.toggle("is-lost", i >= n);
    });
    livesEl.setAttribute("aria-label", `Lives: ${n} of ${MAX_LIVES}`);
  }

  /** @param {{ word?: string, gender?: string, showHint?: boolean }|string|null|undefined} word */
  function setWordDisplay(word) {
    if (!nextEl || !nextWordEl) return;
    const entry = typeof word === "string" ? { word } : word;
    const text = String(entry?.word || "").trim();
    if (!text) {
      nextEl.hidden = true;
      nextWordEl.textContent = "";
      nextEl.removeAttribute("data-gender");
      nextEl.classList.remove("is-hinted");
      return;
    }
    nextEl.hidden = false;
    nextWordEl.textContent = text;
    nextWordEl.title = text;
    const showHint = entry?.showHint !== false && entry?.gender;
    if (showHint) {
      nextEl.dataset.gender = entry.gender;
      nextEl.classList.add("is-hinted");
    } else {
      nextEl.removeAttribute("data-gender");
      nextEl.classList.remove("is-hinted");
    }
  }

  let width = 0;
  let height = 0;
  let gameState = "start";
  let score = 0;
  let lives = MAX_LIVES;
  let cameraY = 0;
  let platforms = [];
  let particles = [];
  let clouds = [];
  let animationId = null;
  let pools = { unseenPool: [], activePool: [], graduatedPool: [] };
  let GRAVITY = BASE_GRAVITY;
  let BOUNCE_VELOCITY = BASE_BOUNCE;
  let MEGA_BOUNCE = BASE_MEGA_BOUNCE;
  let MOVE_SPEED = BASE_MOVE;
  const keys = { left: false, right: false, up: false };
  /** @type {Map<number, "left"|"right"|"up"|null>} */
  const canvasPointers = new Map();
  /** Sliding deadzone anchors — relative drag, not screen halves (less sticky on iOS). */
  /** @type {Map<number, { ax: number, ay: number }>} */
  const pointerAnchors = new Map();
  const TOUCH_DEAD_X = 10;
  const TOUCH_DEAD_Y = 18;
  const player = {
    x: 0,
    y: 0,
    radius: 15,
    vx: 0,
    vy: 0,
    targetWord: null,
    /** True after falling off-screen — freeze camera until a correct land. */
    isRescuing: false,
    /** @type {"normal"|"happy"|"boost"|"scared"|"dead"} */
    face: "normal",
    faceUntil: 0,
  };

  /** @param {"normal"|"happy"|"boost"|"scared"|"dead"} face @param {number} [ms] */
  function setFace(face, ms = 280) {
    player.face = face;
    player.faceUntil = performance.now() + ms;
  }

  function currentFace() {
    if (gameState === "gameover") return "dead";
    if (player.isRescuing) return "scared";
    if (keys.up && player.vy < 0) return "boost";
    if (player.vy > 10) return "scared";
    if (performance.now() < player.faceUntil) return player.face;
    return "normal";
  }

  function drawEyes() {
    const face = currentFace();
    const look = Math.max(-2.2, Math.min(2.2, player.vx * 0.35));
    const lx = player.x - 5 + look;
    const rx = player.x + 5 + look;
    const ey = player.y - 3;
    ctx.strokeStyle = EYE_INK;
    ctx.fillStyle = EYE_INK;
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";

    if (face === "dead" || face === "scared") {
      // X eyes
      const s = face === "dead" ? 3.2 : 2.6;
      for (const ex of [lx, rx]) {
        ctx.beginPath();
        ctx.moveTo(ex - s, ey - s);
        ctx.lineTo(ex + s, ey + s);
        ctx.moveTo(ex + s, ey - s);
        ctx.lineTo(ex - s, ey + s);
        ctx.stroke();
      }
      return;
    }

    if (face === "happy") {
      // ^ ^ closed happy eyes
      for (const ex of [lx, rx]) {
        ctx.beginPath();
        ctx.arc(ex, ey + 1.2, 2.6, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      }
      return;
    }

    if (face === "boost") {
      // wide open o o
      for (const ex of [lx, rx]) {
        ctx.beginPath();
        ctx.arc(ex, ey, 2.8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ex + look * 0.15, ey, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    // normal dots
    ctx.beginPath();
    ctx.arc(lx, ey, 2, 0, Math.PI * 2);
    ctx.arc(rx, ey, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function genderColors() {
    const styles = getComputedStyle(document.documentElement);
    const read = (name, fallback) =>
      (styles.getPropertyValue(name) || "").trim() || fallback;
    return {
      masc: {
        fill: read("--masc", "#4d7ef5"),
        border: read("--masc-ink", "#3a6ae0"),
        label: "DER",
      },
      fem: {
        fill: read("--fem", "#d96b9a"),
        border: read("--fem-ink", "#b34472"),
        label: "DIE",
      },
      neut: {
        fill: read("--neut", "#2a8f62"),
        border: read("--neut-ink", "#1a5a3d"),
        label: "DAS",
      },
    };
  }

  function resize() {
    width = stage.clientWidth;
    height = stage.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function speakWord(article, word) {
    if (!audioOn) return;
    speak(`${article} ${word}`);
  }

  function getNextWord() {
    return pickClimberWord({ ...pools, current: player.targetWord });
  }

  function generatePlatforms(startY) {
    let yPos = startY;
    for (let i = 0; i < 5; i++) {
      // Wider vertical gaps so rows feel less cramped.
      yPos -= 120 + Math.random() * 40;
      const types = ["masc", "fem", "neut"].sort(() => Math.random() - 0.5);
      const playableWidth = width * 0.8;
      const offsetX = (width - playableWidth) / 2;
      const laneWidth = playableWidth / 3;
      const pWidth = Math.min(75, laneWidth - 5);
      for (let j = 0; j < 3; j++) {
        const minX = offsetX + j * laneWidth + 5;
        let maxX = offsetX + (j + 1) * laneWidth - pWidth - 5;
        if (maxX < minX) maxX = minX;
        const x = minX + Math.random() * (maxX - minX);
        platforms.push({
          x,
          y: yPos + (Math.random() * 20 - 10),
          width: pWidth,
          height: 20,
          type: types[j],
          broken: false,
        });
      }
    }
  }

  function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1,
        color,
      });
    }
  }

  function clearKeys() {
    keys.left = false;
    keys.right = false;
    keys.up = false;
  }

  function applySpeedFromUi() {
    const speedScale = Number(speedEl?.value) || 1;
    GRAVITY = BASE_GRAVITY * (speedScale * speedScale);
    BOUNCE_VELOCITY = BASE_BOUNCE * speedScale;
    MEGA_BOUNCE = BASE_MEGA_BOUNCE * speedScale;
    MOVE_SPEED = BASE_MOVE * speedScale;
  }

  function hideOverlays() {
    startEl?.classList.add("is-hidden");
    if (startEl) startEl.hidden = true;
    overEl?.classList.add("is-hidden");
    if (overEl) overEl.hidden = true;
  }

  function seedAmbientClouds() {
    clouds = [];
    const rows = Math.max(6, Math.ceil(height / 90));
    for (let i = 0; i < rows; i++) {
      clouds.push({
        x: Math.random() * (width || 320),
        y: cameraY + (i / rows) * (height || 480) + (Math.random() * 40 - 20),
        radius: 36 + Math.random() * 34,
        speed: 0.12 + Math.random() * 0.38,
      });
    }
  }

  function tickAmbient() {
    clouds.forEach((c) => {
      c.x += c.speed;
      if (c.x - c.radius * 2 > width) c.x = -c.radius * 2;
    });
  }

  function drawClouds() {
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    clouds.forEach((c) => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
      ctx.arc(c.x + c.radius * 0.9, c.y + c.radius * 0.2, c.radius * 0.8, 0, Math.PI * 2);
      ctx.arc(c.x - c.radius * 0.9, c.y + c.radius * 0.2, c.radius * 0.7, 0, Math.PI * 2);
      ctx.arc(c.x + c.radius * 0.4, c.y - c.radius * 0.5, c.radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /** First screen / Restart: clear run progress and show the start panel. */
  function showStartScreen() {
    if (animationId) cancelAnimationFrame(animationId);
    gameState = "start";
    clearKeys();
    canvasPointers.clear();
    pointerAnchors.clear();
    score = 0;
    lives = MAX_LIVES;
    cameraY = 0;
    platforms = [];
    particles = [];
    pools = { unseenPool: [], activePool: [], graduatedPool: [] };
    player.vx = 0;
    player.vy = 0;
    player.targetWord = null;
    player.isRescuing = false;
    player.face = "normal";
    player.faceUntil = 0;
    setScoreDisplay(0);
    setLivesDisplay(MAX_LIVES);
    setWordDisplay("");
    if (overEl) {
      overEl.hidden = true;
      overEl.classList.add("is-hidden");
    }
    if (startEl) {
      startEl.hidden = false;
      startEl.classList.remove("is-hidden");
    }
    resize();
    seedAmbientClouds();
    animationId = requestAnimationFrame(gameLoop);
  }

  /** Small grey starter pad: keep until a correct gender land (no life lost if missed). */
  function placeBounceFloor({ fromFall = false } = {}) {
    const padY = cameraY + height - 50;
    platforms = platforms.filter((p) => !p.isBounceFloor);
    platforms.push({
      x: width / 2 - 40,
      y: padY,
      width: 80,
      height: 15,
      type: "safe",
      broken: false,
      isBounceFloor: true,
    });
    player.x = width / 2;
    player.y = padY - player.radius - 5;
    player.vx = 0;
    player.vy = fromFall ? MEGA_BOUNCE : BOUNCE_VELOCITY;
    player.isRescuing = true;
    if (fromFall) {
      setFace("scared", 900);
      createParticles(player.x, padY, "#ef4444");
    }
  }

  function clearBounceFloor() {
    platforms = platforms.filter((p) => !p.isBounceFloor);
    player.isRescuing = false;
  }

  function endGame(reason) {
    gameState = "gameover";
    clearKeys();
    canvasPointers.clear();
    pointerAnchors.clear();
    setFace("dead", 10_000);
    setWordDisplay("");
    if (finalEl) finalEl.textContent = String(score);
    if (startEl) {
      startEl.hidden = true;
      startEl.classList.add("is-hidden");
    }
    if (overEl) {
      overEl.hidden = false;
      overEl.classList.remove("is-hidden");
    }
    if (audioOn) speak("Spiel vorbei!");
  }

  function initGame() {
    if (!words.length) {
      endGame("No gendered vocabulary in the selected sections.");
      return;
    }
    if (animationId) cancelAnimationFrame(animationId);
    resize();
    pools = initClimberPools(words.map((w) => ({ ...w })));
    applySpeedFromUi();
    score = 0;
    lives = MAX_LIVES;
    setScoreDisplay(0);
    setLivesDisplay(lives);
    cameraY = 0;
    platforms = [];
    particles = [];
    clouds = [];
    clearKeys();
    canvasPointers.clear();
    pointerAnchors.clear();
    player.face = "normal";
    player.faceUntil = 0;
    player.targetWord = getNextWord();
    setWordDisplay(player.targetWord);
    generatePlatforms(height - 50);
    placeBounceFloor({ fromFall: false });
    gameState = "playing";
    hideOverlays();
    animationId = requestAnimationFrame(gameLoop);
  }

  /** Resume after game over: keep score, height, and word pools; refill lives. */
  function continueGame() {
    if (!words.length) {
      endGame("No gendered vocabulary in the selected sections.");
      return;
    }
    if (animationId) cancelAnimationFrame(animationId);
    resize();
    applySpeedFromUi();
    lives = MAX_LIVES;
    setScoreDisplay(score);
    setLivesDisplay(lives);
    clearKeys();
    canvasPointers.clear();
    pointerAnchors.clear();
    player.face = "normal";
    player.faceUntil = 0;
    if (!player.targetWord) {
      player.targetWord = getNextWord();
    }
    setWordDisplay(player.targetWord);
    placeBounceFloor({ fromFall: false });
    gameState = "playing";
    hideOverlays();
    animationId = requestAnimationFrame(gameLoop);
  }

  function update() {
    if (gameState !== "playing") return;
    if (keys.left) player.vx = -MOVE_SPEED;
    else if (keys.right) player.vx = MOVE_SPEED;
    else player.vx = 0;
    player.x += player.vx;
    if (player.x < -player.radius) player.x = width + player.radius;
    if (player.x > width + player.radius) player.x = -player.radius;
    player.vy += GRAVITY;
    player.y += player.vy;
    const screenCenterY = height / 2;
    // Don't scroll the field while recovering from a bottom fall.
    if (!player.isRescuing && player.y < cameraY + screenCenterY) {
      const diff = cameraY + screenCenterY - player.y;
      cameraY -= diff;
      const nextScore = Math.floor(Math.abs(cameraY) / 100);
      if (nextScore > score) {
        score = nextScore;
        setScoreDisplay(score);
      }
    }
    const minPlatformY = platforms.length
      ? platforms.reduce((minY, p) => Math.min(minY, p.y), Infinity)
      : cameraY;
    if (minPlatformY > cameraY - height * 1.5) generatePlatforms(minPlatformY);
    let minCloudY = clouds.length
      ? clouds.reduce((minY, c) => Math.min(minY, c.y), Infinity)
      : cameraY;
    while (minCloudY > cameraY - height * 1.5) {
      minCloudY -= 150 + Math.random() * 200;
      clouds.push({
        x: Math.random() * width,
        y: minCloudY,
        radius: 40 + Math.random() * 30,
        speed: 0.1 + Math.random() * 0.4,
      });
    }
    platforms = platforms.filter((p) => p.y < cameraY + height + 50 && !p.broken);
    particles = particles.filter((p) => p.life > 0);
    clouds = clouds.filter((c) => c.y < cameraY + height + 200);

    if (player.vy > 0) {
      for (const p of platforms) {
        if (p.broken) continue;
        if (p.type !== "safe" && p.type !== player.targetWord?.gender) continue;
        if (
          player.x + player.radius > p.x &&
          player.x - player.radius < p.x + p.width &&
          player.y + player.radius >= p.y &&
          player.y + player.radius <= p.y + p.height + player.vy
        ) {
          player.y = p.y - player.radius;
          const jumpBoost = keys.up ? -5 : 0;
          if (p.type === "safe") {
            player.vy = BOUNCE_VELOCITY + jumpBoost;
            setFace("happy", 220);
          } else if (p.type === player.targetWord?.gender) {
            player.vy = MEGA_BOUNCE + jumpBoost;
            clearBounceFloor();
            setFace("happy", 320);
            speakWord(player.targetWord.article, player.targetWord.word);
            playFeedback("ok");
            markClimberCorrect(pools, player.targetWord);
            player.targetWord = getNextWord();
            setWordDisplay(player.targetWord);
            createParticles(player.x, player.y, "#fde047");
          }
          break;
        }
      }
    }

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += GRAVITY * 0.5;
      p.life -= 0.02;
    });
    clouds.forEach((c) => {
      c.x += c.speed;
      if (c.x - c.radius * 2 > width) c.x = -c.radius * 2;
    });

    if (player.y > cameraY + height + 20) {
      // Still finding a platform after start/life — keep the floor, no life lost.
      if (player.isRescuing) {
        placeBounceFloor({ fromFall: true });
        return;
      }
      if (audioOn && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          /* ignore */
        }
      }
      playFeedback("bad");
      markClimberIncorrect(pools, player.targetWord);
      lives = Math.max(0, lives - 1);
      setLivesDisplay(lives);
      if (lives <= 0) {
        endGame();
        return;
      }
      placeBounceFloor({ fromFall: true });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const colors = genderColors();
    const faint = getComputedStyle(document.documentElement)
      .getPropertyValue("--faint")
      .trim() || "#8b95a3";
    const surface2 = getComputedStyle(document.documentElement)
      .getPropertyValue("--surface-2")
      .trim() || "#eef1f4";

    ctx.save();
    ctx.translate(0, -cameraY);
    drawClouds();

    if (gameState === "start") {
      ctx.restore();
      return;
    }

    platforms.forEach((p) => {
      if (p.broken) return;
      if (p.type === "safe") {
        ctx.fillStyle = faint;
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.width, p.height, 8);
        ctx.fill();
        return;
      }
      const style = colors[p.type];
      ctx.fillStyle = style.border;
      ctx.beginPath();
      ctx.roundRect(p.x, p.y + 4, p.width, p.height, 8);
      ctx.fill();
      ctx.fillStyle = style.fill;
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, p.width, p.height, 8);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = displayFont(700, 13);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(style.label, p.x + p.width / 2, p.y + p.height / 2);
    });

    particles.forEach((p) => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = surface2;
    ctx.stroke();
    drawEyes();

    if (player.targetWord) {
      const nextFs = nextWordEl
        ? parseFloat(getComputedStyle(nextWordEl).fontSize) || 18
        : 18;
      ctx.font = displayFont(700, nextFs);
      ctx.textAlign = "center";
      const wordWidth = ctx.measureText(player.targetWord.word).width;
      const showHint = player.targetWord.showHint !== false;
      const theme =
        document.documentElement.getAttribute("data-theme") || "light";
      const hiddenFill =
        theme === "dark" ? "#0d1117" : "#1a2030";
      const bubbleColor = showHint
        ? colors[player.targetWord.gender].fill
        : hiddenFill;
      const padX = 10;
      const bubbleH = Math.max(28, Math.round(nextFs * 1.55));
      const bubbleY = player.y - player.radius - bubbleH - 10;
      ctx.fillStyle = bubbleColor;
      ctx.beginPath();
      ctx.roundRect(
        player.x - wordWidth / 2 - padX,
        bubbleY,
        wordWidth + padX * 2,
        bubbleH,
        bubbleH / 2
      );
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "middle";
      ctx.fillText(player.targetWord.word, player.x, bubbleY + bubbleH / 2);
    }
    ctx.restore();
  }

  function gameLoop() {
    if (gameState === "playing") update();
    else tickAmbient();
    draw();
    animationId = requestAnimationFrame(gameLoop);
  }

  function onKeyDown(e) {
    if (gameState !== "playing") return;
    if (e.key === "ArrowLeft" || e.key === "a") {
      keys.left = true;
      e.preventDefault();
    }
    if (e.key === "ArrowRight" || e.key === "d") {
      keys.right = true;
      e.preventDefault();
    }
    if (e.key === "ArrowUp" || e.key === "w" || e.key === " ") {
      keys.up = true;
      e.preventDefault();
    }
  }
  function onKeyUp(e) {
    if (e.key === "ArrowLeft" || e.key === "a") keys.left = false;
    if (e.key === "ArrowRight" || e.key === "d") keys.right = false;
    if (e.key === "ArrowUp" || e.key === "w" || e.key === " ") keys.up = false;
  }

  function syncKeysFromCanvasPointers() {
    let left = false;
    let right = false;
    let up = false;
    for (const dir of canvasPointers.values()) {
      if (dir === "left") left = true;
      if (dir === "right") right = true;
      if (dir === "up") up = true;
    }
    keys.left = left;
    keys.right = right;
    keys.up = up;
  }

  function localPoint(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      h: rect.height || height,
    };
  }

  /** @returns {"left"|"right"|"up"|null} */
  function dirFromDrag(pointerId, clientX, clientY) {
    const { x, y, h } = localPoint(clientX, clientY);
    let anchor = pointerAnchors.get(pointerId);
    if (!anchor) {
      anchor = { ax: x, ay: y };
      pointerAnchors.set(pointerId, anchor);
    }
    let dx = x - anchor.ax;
    let dy = y - anchor.ay;
    // Pull the deadzone with the finger so reversing left↔right is immediate.
    if (dx <= -TOUCH_DEAD_X) anchor.ax = x + TOUCH_DEAD_X;
    else if (dx >= TOUCH_DEAD_X) anchor.ax = x - TOUCH_DEAD_X;
    if (dy <= -TOUCH_DEAD_Y) anchor.ay = y + TOUCH_DEAD_Y;
    dx = x - anchor.ax;
    dy = y - anchor.ay;
    const wantUp = dy <= -TOUCH_DEAD_Y || y < h * 0.28;
    if (wantUp && Math.abs(dx) < TOUCH_DEAD_X * 1.35) return "up";
    if (dx <= -TOUCH_DEAD_X) return "left";
    if (dx >= TOUCH_DEAD_X) return "right";
    return null;
  }

  function applyPointerSample(pointerId, clientX, clientY) {
    canvasPointers.set(pointerId, dirFromDrag(pointerId, clientX, clientY));
    syncKeysFromCanvasPointers();
  }

  function onCanvasPointerDown(e) {
    if (gameState !== "playing") return;
    e.preventDefault();
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    const { x, y } = localPoint(e.clientX, e.clientY);
    pointerAnchors.set(e.pointerId, { ax: x, ay: y });
    // Finger down alone doesn't steer — wait for a drag past the deadzone.
    canvasPointers.set(e.pointerId, null);
    syncKeysFromCanvasPointers();
  }

  function onCanvasPointerMove(e) {
    if (gameState !== "playing" || !canvasPointers.has(e.pointerId)) return;
    e.preventDefault();
    const samples =
      typeof e.getCoalescedEvents === "function" && e.getCoalescedEvents().length
        ? e.getCoalescedEvents()
        : [e];
    for (const sample of samples) {
      applyPointerSample(e.pointerId, sample.clientX, sample.clientY);
    }
  }

  function onCanvasPointerUp(e) {
    canvasPointers.delete(e.pointerId);
    pointerAnchors.delete(e.pointerId);
    syncKeysFromCanvasPointers();
  }

  function destroy() {
    if (animationId) cancelAnimationFrame(animationId);
    clearKeys();
    canvasPointers.clear();
    pointerAnchors.clear();
    if (scoreEl) scoreEl.hidden = true;
    if (livesEl) livesEl.hidden = true;
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("resize", resize);
    root.innerHTML = "";
  }

  root.querySelector("[data-climber-play]")?.addEventListener("click", (e) => {
    e.preventDefault();
    initGame();
  });
  root.querySelector("[data-climber-retry]")?.addEventListener("click", (e) => {
    e.preventDefault();
    showStartScreen();
  });
  root.querySelector("[data-climber-continue]")?.addEventListener("click", (e) => {
    e.preventDefault();
    continueGame();
  });
  // Relative thumb-drag on the canvas (not left/right screen halves).
  canvas.addEventListener("pointerdown", onCanvasPointerDown, { passive: false });
  canvas.addEventListener("pointermove", onCanvasPointerMove, { passive: false });
  canvas.addEventListener("pointerup", onCanvasPointerUp);
  canvas.addEventListener("pointercancel", onCanvasPointerUp);
  canvas.addEventListener("lostpointercapture", onCanvasPointerUp);
  canvas.addEventListener(
    "touchstart",
    (e) => {
      if (gameState === "playing") e.preventDefault();
    },
    { passive: false }
  );
  canvas.addEventListener(
    "touchmove",
    (e) => {
      if (gameState === "playing") e.preventDefault();
    },
    { passive: false }
  );
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("resize", resize);
  setScoreDisplay(0);
  setLivesDisplay(MAX_LIVES);
  setWordDisplay("");
  resize();
  seedAmbientClouds();
  requestAnimationFrame(() => {
    resize();
    if (!clouds.length) seedAmbientClouds();
  });
  animationId = requestAnimationFrame(gameLoop);

  return { destroy, resize };
}
