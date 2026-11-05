/**
 * Snow-Nomen — canvas gender gates inside the Schnapp shell.
 */

import {
  initClimberPools,
  markClimberCorrect,
  markClimberIncorrect,
  pickClimberWord,
} from "./artikel-climber-pools.js";
import {
  buildGameReport,
  progressSnapshot as sharedProgressSnapshot,
  wordKey,
} from "./artikel-game-progress.js";

const MAX_LIVES = 3;
const BASE_MIN_SPEED = 3.5;
const BASE_MAX_SPEED = 7.5;
const LATERAL_ACCEL = 0.8;
const MAX_LATERAL_SPEED = 6;
const FRICTION = 0.85;
/** Match Wort-Hüpfer ball / face size. */
const HEAD_RADIUS = 15;
const EYE_INK = "#1a2030";
/** Hold X-eyes on tree wipeout before reset / game over. */
const DEATH_FACE_MS = 1000;
/** Gate misses on the same target before it counts as an SRS word miss. */
const GATE_MISSES_FOR_WORD_MISS = 2;

/*
The MIT License (MIT)

Copyright (c) 2019-2024 The Bootstrap Authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
const REPORT_LIST_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1.1em" height="1.1em" fill="currentColor" class="bi bi-list-check" viewBox="0 0 16 16" aria-hidden="true"><path fill-rule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3.854 2.146a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708L2 3.293l1.146-1.147a.5.5 0 0 1 .708 0m0 4a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708L2 7.293l1.146-1.147a.5.5 0 0 1 .708 0m0 4a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0"/></svg>`;

/**
 * @param {HTMLElement} root
 * @param {{
 *   words: { word: string, article: string, gender: string }[],
 *   audio?: boolean,
 *   speak?: (text: string) => void,
 *   unlockSpeak?: () => void,
 *   stopSpeak?: () => void,
 *   playFeedback?: (kind: "ok"|"bad"|"retry"|"splat"|"hop") => void,
 *   scoreEl?: HTMLElement|null,
 *   livesEl?: HTMLElement|null,
 *   onExit?: () => void,
 * }} options
 */
export function mountArtikelSkier(root, options = {}) {
  const words = Array.isArray(options.words) ? options.words : [];
  const audioOn = options.audio !== false;
  const speak = typeof options.speak === "function" ? options.speak : () => {};
  const unlockSpeak =
    typeof options.unlockSpeak === "function" ? options.unlockSpeak : () => {};
  const stopSpeak =
    typeof options.stopSpeak === "function" ? options.stopSpeak : () => {};
  const playFeedback =
    typeof options.playFeedback === "function" ? options.playFeedback : () => {};
  const onExit = typeof options.onExit === "function" ? options.onExit : null;
  const scoreEl =
    options.scoreEl || document.getElementById("climber-top-score");
  const livesEl =
    options.livesEl || document.getElementById("climber-top-lives");

  root.innerHTML = `
    <div class="skier-shell">
      <div class="skier-stage" data-skier-stage>
        <canvas class="skier-canvas" data-skier-canvas></canvas>
        <div class="skier-progress" data-skier-progress hidden>
          <span class="skier-progress-side">Hints <span data-skier-hints-pct>—</span></span>
          <div class="skier-progress-track" aria-hidden="true">
            <div class="skier-progress-half is-hints">
              <div class="skier-progress-hints" data-skier-hints-bar></div>
            </div>
            <div class="skier-progress-half is-deck">
              <div class="skier-progress-deck" data-skier-deck-bar></div>
            </div>
          </div>
          <span class="skier-progress-side">Deck <span data-skier-deck-pct>0%</span></span>
        </div>
        <div class="skier-speed-hud" data-skier-speed-hud hidden>0 km/h</div>
        <div class="skier-next is-correct" data-skier-next hidden>
          <span class="skier-next-label" data-skier-next-label>CORRECT</span>
          <span class="skier-next-word" data-skier-next-word></span>
        </div>
        <div class="skier-overlay" data-skier-start>
          <div class="skier-panel">
            <h1 class="skier-title">Snow-Nomen</h1>
            <p class="skier-lede">Ski through the correct gate. Steer or hop to start.</p>
            <p class="skier-hint-row">
              <span class="is-masc">Blue = Der</span>
              <span class="is-fem">Red = Die</span>
              <span class="is-neut">Green = Das</span>
            </p>
            <label class="skier-speed">
              <select data-skier-speed aria-label="Speed">
                <option value="0.8">Relaxed Rate</option>
                <option value="1.0" selected>Normal Speed</option>
                <option value="1.25">Frantic Pace</option>
              </select>
            </label>
            <button type="button" class="btn btn-primary" data-skier-play>Start</button>
          </div>
        </div>
        <div class="skier-overlay is-hidden" data-skier-over hidden>
          <div class="skier-panel">
            <h1 class="skier-title">Und täglich grüßt der Baum!</h1>
            <p class="skier-lede">Punktzahl</p>
            <p class="skier-final" data-skier-final>0</p>
            <p class="skier-summary" data-skier-summary></p>
            <div class="skier-over-actions">
              <button type="button" class="btn btn-primary" data-skier-continue>Continue</button>
              <button type="button" class="btn" data-skier-retry>Restart</button>
              <button type="button" class="btn skier-report-btn" data-skier-report aria-label="Full report card">
                ${REPORT_LIST_SVG}
              </button>
            </div>
          </div>
        </div>
        <div class="skier-overlay is-hidden" data-skier-report-sheet hidden>
          <div class="skier-panel skier-report-panel">
            <h1 class="skier-title">Spielanalyse</h1>
            <pre class="skier-report-body" data-skier-report-body></pre>
            <div class="skier-over-actions">
              <button type="button" class="btn btn-primary" data-skier-copy-text>Copy text</button>
              <button type="button" class="btn" data-skier-copy-json>Copy JSON</button>
              <button type="button" class="btn" data-skier-report-close>Done</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const stage = root.querySelector("[data-skier-stage]");
  const canvas = root.querySelector("[data-skier-canvas]");
  const ctx = canvas.getContext("2d");
  const startEl = root.querySelector("[data-skier-start]");
  const overEl = root.querySelector("[data-skier-over]");
  const reportSheetEl = root.querySelector("[data-skier-report-sheet]");
  const reportBodyEl = root.querySelector("[data-skier-report-body]");
  const summaryEl = root.querySelector("[data-skier-summary]");
  const finalEl = root.querySelector("[data-skier-final]");
  const speedEl = root.querySelector("[data-skier-speed]");
  const speedHudEl = root.querySelector("[data-skier-speed-hud]");
  const nextEl = root.querySelector("[data-skier-next]");
  const nextLabelEl = root.querySelector("[data-skier-next-label]");
  const nextWordEl = root.querySelector("[data-skier-next-word]");
  const progressEl = root.querySelector("[data-skier-progress]");
  const hintsPctEl = root.querySelector("[data-skier-hints-pct]");
  const deckPctEl = root.querySelector("[data-skier-deck-pct]");
  const hintsBarEl = root.querySelector("[data-skier-hints-bar]");
  const deckBarEl = root.querySelector("[data-skier-deck-bar]");

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

  /** @type {{ article: string, word: string, gender: string }|null} */
  let correctFlash = null;

  function hideCorrectChip() {
    correctFlash = null;
    if (!nextEl || !nextWordEl) return;
    nextEl.hidden = true;
    nextEl.style.opacity = "";
    nextEl.removeAttribute("data-gender");
    nextEl.classList.remove("is-hinted");
    nextWordEl.textContent = "";
    nextWordEl.title = "";
    if (nextLabelEl) nextLabelEl.textContent = "CORRECT";
  }

  function clearCorrectFlash() {
    hideCorrectChip();
  }

  /** After a correct gate: show color-coded article + noun until the next gate nears. */
  function showCorrectFlash(landed) {
    if (!nextEl || !nextWordEl || !landed?.word) return;
    correctFlash = {
      article: String(landed.article || "").trim(),
      word: String(landed.word || "").trim(),
      gender: landed.gender || "",
    };
    if (nextLabelEl) nextLabelEl.textContent = "CORRECT";
    nextEl.classList.add("is-correct", "is-hinted");
    if (correctFlash.gender) nextEl.dataset.gender = correctFlash.gender;
    else nextEl.removeAttribute("data-gender");
    const text = `${correctFlash.article} ${correctFlash.word}`.trim();
    nextWordEl.textContent = text;
    nextWordEl.title = text;
    nextEl.hidden = false;
    nextEl.style.opacity = "1";
  }

  /** Fade CORRECT chip as the next gate approaches, then hide. */
  function updateCorrectFlashFade() {
    if (!correctFlash || !nextEl) return;
    const nextGate = rows.find((r) => !r.passed);
    if (!nextGate) {
      clearCorrectFlash();
      return;
    }
    const dist = nextGate.y - player.y;
    const fadeStart = 300;
    const fadeEnd = 100;
    if (dist <= fadeEnd) {
      clearCorrectFlash();
      return;
    }
    if (dist < fadeStart) {
      nextEl.style.opacity = String(
        Math.max(0, (dist - fadeEnd) / (fadeStart - fadeEnd))
      );
    } else {
      nextEl.style.opacity = "1";
    }
  }

  let width = 0;
  let height = 0;
  let gameState = "start";
  let score = 0;
  let lives = MAX_LIVES;
  let animationId = 0;
  let lastReportText = "";
  let lastReportJson = "";
  /** @type {Map<string, object>} */
  const seenByKey = new Map();
  /** @type {{ unseenPool: object[], activePool: object[], graduatedPool: object[] }} */
  let pools = { unseenPool: [], activePool: [], graduatedPool: [] };

  let minSpeed = BASE_MIN_SPEED;
  let maxSpeed = BASE_MAX_SPEED;
  let scrollSpeed = BASE_MIN_SPEED;

  const keys = { left: false, right: false, up: false };
  /** @type {Map<number, "left"|"right"|"up"|null>} */
  const canvasPointers = new Map();

  const player = {
    x: 0,
    y: 0,
    /** Collision / body scale — head drawn at HEAD_RADIUS. */
    radius: HEAD_RADIUS,
    vx: 0,
    jumpZ: 0,
    jumpVZ: 0,
    targetWord: /** @type {object|null} */ (null),
    invuln: 0,
    /** @type {"normal"|"happy"|"boost"|"dead"} */
    face: "normal",
    faceUntil: 0,
  };

  /** True until the learner steers or hops — slope does not scroll yet. */
  let awaitingInput = true;
  /** Hop started after the last gate row was resolved (skip next airborne miss). */
  let hoppedSinceLastGate = false;
  /** Consecutive non-hop gate misses for the current target word. */
  let gateMissStreak = 0;
  let deathUntil = 0;
  let pendingGameOver = false;
  /** Explicit flag — do not key off deathUntil vs now (that races the reset). */
  let dying = false;

  /** @type {object[]} */
  let rows = [];
  /** @type {object[]} */
  let particles = [];
  /** @type {object[]} */
  let trail = [];
  /** @type {object[]} */
  let trees = [];
  /** @type {object[]} */
  let ramps = [];

  /** @param {"normal"|"happy"|"boost"|"dead"} face @param {number} [ms] */
  function setFace(face, ms = 280) {
    player.face = face;
    player.faceUntil = performance.now() + ms;
  }

  function currentFace() {
    if (dying || pendingGameOver || gameState === "gameover") return "dead";
    if (player.jumpZ > 0 || player.jumpVZ > 0) return "boost";
    if (player.face === "dead") return "normal";
    if (performance.now() < player.faceUntil) return player.face;
    return "normal";
  }

  let nextEyeBlinkAt = performance.now() + 900;
  let eyeBlinkUntil = 0;

  function scheduleEyeBlink() {
    const now = performance.now();
    if (now < eyeBlinkUntil) return;
    if (now < nextEyeBlinkAt) return;
    eyeBlinkUntil = now + 110;
    nextEyeBlinkAt = now + 1600 + Math.random() * 2800;
  }

  function eyesClosed() {
    return performance.now() < eyeBlinkUntil;
  }

  /** Idle bob while waiting for steer/hop — keeps the head alive without opacity blink. */
  function idleBobY() {
    if (!awaitingInput || dying) return 0;
    return Math.sin(performance.now() / 280) * 2.2;
  }

  /**
   * Eyes in local head space — same geometry as Wort-Hüpfer (radius-15 ball).
   * Head center is local (0, 0).
   */
  function drawEyesLocal() {
    const face = currentFace();
    const look = Math.max(-2.2, Math.min(2.2, player.vx * 0.35));
    const left = { x: -5 + look, y: -3 };
    const right = { x: 5 + look, y: -3 };
    ctx.strokeStyle = EYE_INK;
    ctx.fillStyle = EYE_INK;
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";

    if (face === "dead") {
      const s = 3.2;
      for (const eye of [left, right]) {
        ctx.beginPath();
        ctx.moveTo(eye.x - s, eye.y - s);
        ctx.lineTo(eye.x + s, eye.y + s);
        ctx.moveTo(eye.x + s, eye.y - s);
        ctx.lineTo(eye.x - s, eye.y + s);
        ctx.stroke();
      }
      return;
    }

    // Natural lid blink (also while awaiting input / after respawn).
    if (eyesClosed() && face !== "boost") {
      for (const eye of [left, right]) {
        ctx.beginPath();
        ctx.moveTo(eye.x - 2.6, eye.y);
        ctx.lineTo(eye.x + 2.6, eye.y);
        ctx.stroke();
      }
      return;
    }

    if (face === "happy") {
      for (const eye of [left, right]) {
        ctx.beginPath();
        ctx.arc(eye.x, eye.y + 1.2, 2.6, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      }
      return;
    }

    if (face === "boost") {
      for (const eye of [left, right]) {
        ctx.beginPath();
        ctx.arc(eye.x, eye.y, 2.8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(eye.x + look * 0.15, eye.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    ctx.beginPath();
    ctx.arc(left.x, left.y, 2, 0, Math.PI * 2);
    ctx.arc(right.x, right.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function rampUnderSkier() {
    for (const r of ramps) {
      if (
        player.x + player.radius > r.x &&
        player.x - player.radius < r.x + r.width &&
        player.y + player.radius > r.y &&
        player.y - player.radius < r.y + r.height
      ) {
        return r;
      }
    }
    return null;
  }

  function beginAwaitingInput() {
    awaitingInput = true;
    scrollSpeed = 0;
    player.vx = 0;
    player.jumpZ = 0;
    player.jumpVZ = 0;
    clearKeys();
    if (speedHudEl) speedHudEl.textContent = "0 km/h";
  }

  function notePlayerDirection() {
    if (!awaitingInput) return;
    if (keys.left || keys.right || keys.up) {
      awaitingInput = false;
      scrollSpeed = minSpeed;
    }
  }

  function genderColors() {
    const cs = getComputedStyle(document.documentElement);
    const masc =
      cs.getPropertyValue("--masc").trim() || "#3b82f6";
    const fem = cs.getPropertyValue("--fem").trim() || "#ef4444";
    const neut = cs.getPropertyValue("--neut").trim() || "#22c55e";
    const mascInk =
      cs.getPropertyValue("--masc-ink").trim() || "#1d4ed8";
    const femInk =
      cs.getPropertyValue("--fem-ink").trim() || "#b91c1c";
    const neutInk =
      cs.getPropertyValue("--neut-ink").trim() || "#15803d";
    return {
      masc: { fill: masc, solid: masc, border: mascInk, label: "DER" },
      fem: { fill: fem, solid: fem, border: femInk, label: "DIE" },
      neut: { fill: neut, solid: neut, border: neutInk, label: "DAS" },
    };
  }

  function speakWord(article, word) {
    if (!audioOn) return;
    speak(`${article} ${word}`);
  }

  function noteWordInPlay(w) {
    if (!w?.word) return;
    const k = wordKey(w);
    if (!seenByKey.has(k)) seenByKey.set(k, w);
    if (typeof w.correct !== "number") w.correct = w.correct || 0;
    if (typeof w.wrong !== "number") w.wrong = w.wrong || 0;
    updateProgressUi();
  }

  function progressSnapshot() {
    return sharedProgressSnapshot({ words, pools, seenByKey });
  }

  function updateProgressUi() {
    const snap = progressSnapshot();
    if (hintsPctEl) {
      hintsPctEl.textContent =
        snap.hintDependencePct == null
          ? "—"
          : `${snap.hintDependencePct}% (${snap.introducedHinted}/${snap.deckTotal})`;
    }
    if (deckPctEl) {
      deckPctEl.textContent =
        snap.deckProgressPct == null
          ? "0%"
          : `${snap.deckProgressPct}% (${snap.introduced}/${snap.deckTotal})`;
    }
    if (hintsBarEl) {
      hintsBarEl.style.width =
        snap.hintDependencePct == null ? "0%" : `${snap.hintDependencePct}%`;
    }
    if (deckBarEl) {
      deckBarEl.style.width =
        snap.deckProgressPct == null ? "0%" : `${snap.deckProgressPct}%`;
    }
  }

  function setProgressVisible(on) {
    if (!progressEl) return;
    progressEl.hidden = !on;
    if (speedHudEl) speedHudEl.hidden = !on;
  }

  function buildReport() {
    const report = buildGameReport({
      gameId: "snow-nomen",
      gameTitle: "Snow-Nomen",
      score,
      speed: Number(speedEl?.value) || 1,
      words,
      pools,
      seenByKey,
      targetLabel: "ski target",
    });
    lastReportText = report.text;
    lastReportJson = report.json;
    return report.payload;
  }

  function openReportSheet() {
    buildReport();
    if (reportBodyEl) reportBodyEl.textContent = lastReportText;
    if (reportSheetEl) {
      reportSheetEl.hidden = false;
      reportSheetEl.classList.remove("is-hidden");
    }
  }

  function closeReportSheet() {
    if (reportSheetEl) {
      reportSheetEl.hidden = true;
      reportSheetEl.classList.add("is-hidden");
    }
  }

  async function copyText(value) {
    const text = String(value || "");
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  }

  /** Pre-rolled next target (internal queue only — no HUD). */
  let upcomingWord = /** @type {object|null} */ (null);

  function queueUpcomingWord() {
    upcomingWord = pickClimberWord({ ...pools, current: player.targetWord });
  }

  function getNextWord() {
    const next =
      upcomingWord && upcomingWord !== player.targetWord
        ? upcomingWord
        : pickClimberWord({ ...pools, current: player.targetWord });
    upcomingWord = null;
    noteWordInPlay(next);
    return next;
  }

  function clearKeys() {
    keys.left = false;
    keys.right = false;
    keys.up = false;
    canvasPointers.clear();
  }

  function hideOverlays() {
    if (startEl) {
      startEl.hidden = true;
      startEl.classList.add("is-hidden");
    }
    if (overEl) {
      overEl.hidden = true;
      overEl.classList.add("is-hidden");
    }
  }

  function showStartScreen() {
    gameState = "start";
    clearKeys();
    clearCorrectFlash();
    setProgressVisible(false);
    closeReportSheet();
    if (overEl) {
      overEl.hidden = true;
      overEl.classList.add("is-hidden");
    }
    if (startEl) {
      startEl.hidden = false;
      startEl.classList.remove("is-hidden");
    }
  }

  function applySpeedFromUi() {
    const scale = Number(speedEl?.value) || 1;
    minSpeed = BASE_MIN_SPEED * scale;
    maxSpeed = BASE_MAX_SPEED * scale;
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
    if (gameState === "start" || !player.y) {
      player.y = height * 0.25;
      player.x = width / 2;
    }
  }

  function createParticles(x, y, color, count = 15) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1,
        color,
      });
    }
  }

  function generateGateRow(yPos) {
    const types = ["masc", "fem", "neut"];
    const row = { y: yPos, gates: [], passed: false };
    const playableWidth = width * 0.85;
    const offsetX = (width - playableWidth) / 2;
    const laneWidth = playableWidth / 3;
    const pWidth = Math.min(80, laneWidth - 10);
    const maxJitter = (laneWidth - pWidth) / 2;
    for (let j = 0; j < 3; j++) {
      const jitter = Math.random() * maxJitter * 2 - maxJitter;
      const x =
        offsetX + j * laneWidth + (laneWidth - pWidth) / 2 + jitter;
      row.gates.push({ x, width: pWidth, type: types[j] });
    }
    rows.push(row);
  }

  function populateTrees(amount, startY, endY) {
    for (let i = 0; i < amount; i++) {
      trees.push({
        x:
          Math.random() > 0.5
            ? Math.random() * (width * 0.15)
            : width - Math.random() * (width * 0.15),
        y: startY + Math.random() * (endY - startY),
        size: 15 + Math.random() * 15,
        color: Math.random() > 0.5 ? "#0f766e" : "#115e59",
      });
    }
  }

  /** Occasional ramp after a gate — not every row. */
  function maybePlaceRamp(afterGateY) {
    if (Math.random() > 0.38) return;
    ramps.push({
      x: width * 0.2 + Math.random() * (width * 0.6 - 60),
      y: afterGateY + 120 + Math.random() * 80,
      width: 60,
      height: 20,
    });
  }

  function seedTrack() {
    rows = [];
    particles = [];
    trail = [];
    trees = [];
    ramps = [];
    let startY = height + 100;
    for (let i = 0; i < 5; i++) {
      const rowY = startY + i * 600;
      generateGateRow(rowY);
      maybePlaceRamp(rowY);
    }
    populateTrees(30, -100, height + 800);
  }

  /** Full SRS word miss — no life lost. */
  function registerWordMiss() {
    playFeedback("bad");
    if (player.targetWord) {
      player.targetWord.wrong = (player.targetWord.wrong || 0) + 1;
      if (pools.graduatedPool.includes(player.targetWord)) {
        player.targetWord.postGradWrong =
          (player.targetWord.postGradWrong || 0) + 1;
      }
    }
    markClimberIncorrect(pools, player.targetWord);
    updateProgressUi();
    queueUpcomingWord();
    gateMissStreak = 0;
  }

  /** One missed gate; SRS miss only after GATE_MISSES_FOR_WORD_MISS in a row. */
  function noteGateMiss() {
    gateMissStreak += 1;
    if (gateMissStreak >= GATE_MISSES_FOR_WORD_MISS) {
      registerWordMiss();
      return;
    }
    playFeedback("retry");
  }

  /** Tree wipeout: X-eyes for 1s, lose a life, then reset to mid-track (or game over). */
  function killSkier() {
    if (dying || player.invuln > 0 || gameState !== "playing") return;
    dying = true;
    if (audioOn) stopSpeak();
    playFeedback("splat");
    createParticles(player.x, player.y, "#991b1b", 50);
    lives = Math.max(0, lives - 1);
    setLivesDisplay(lives);
    setFace("dead", DEATH_FACE_MS + 200);
    deathUntil = performance.now() + DEATH_FACE_MS;
    pendingGameOver = lives <= 0;
    player.vx = 0;
    player.jumpZ = 0;
    player.jumpVZ = 0;
    clearKeys();
    scrollSpeed = 0;
  }

  function resetAfterDeath() {
    dying = false;
    deathUntil = 0;
    pendingGameOver = false;
    // Mid-course respawn with normal eyes; wait for steer/hop.
    player.x = width / 2;
    player.y = height * 0.25;
    player.vx = 0;
    player.jumpZ = 0;
    player.jumpVZ = 0;
    player.invuln = 120;
    player.face = "normal";
    player.faceUntil = 0;
    hoppedSinceLastGate = false;
    seedTrack();
    beginAwaitingInput();
  }

  function endGame() {
    dying = false;
    deathUntil = 0;
    pendingGameOver = false;
    gameState = "gameover";
    clearKeys();
    clearCorrectFlash();
    closeReportSheet();
    updateProgressUi();
    const snap = progressSnapshot();
    if (finalEl) finalEl.textContent = String(score);
    if (summaryEl) {
      const deck =
        snap.deckProgressPct == null
          ? "—"
          : `${snap.deckProgressPct}% (${snap.introduced}/${snap.deckTotal})`;
      const hints =
        snap.hintDependencePct == null
          ? "—"
          : `${snap.hintDependencePct}% (${snap.introducedHinted}/${snap.deckTotal})`;
      summaryEl.textContent = `Hints ${hints} · Deck ${deck}`;
    }
    buildReport();
    if (startEl) {
      startEl.hidden = true;
      startEl.classList.add("is-hidden");
    }
    if (overEl) {
      overEl.hidden = false;
      overEl.classList.remove("is-hidden");
    }
    if (audioOn) speak("Und täglich grüßt der Baum!");
  }

  function initGame() {
    if (!words.length) {
      endGame();
      return;
    }
    if (animationId) cancelAnimationFrame(animationId);
    resize();
    pools = initClimberPools(
      words.map((w) => ({ ...w, correct: 0, wrong: 0 }))
    );
    seenByKey.clear();
    applySpeedFromUi();
    score = 0;
    lives = MAX_LIVES;
    scrollSpeed = minSpeed;
    setScoreDisplay(0);
    setLivesDisplay(lives);
    player.x = width / 2;
    player.y = height * 0.25;
    player.vx = 0;
    player.jumpZ = 0;
    player.jumpVZ = 0;
    player.invuln = 0;
    player.face = "normal";
    player.faceUntil = 0;
    dying = false;
    deathUntil = 0;
    pendingGameOver = false;
    hoppedSinceLastGate = false;
    gateMissStreak = 0;
    clearKeys();
    updateProgressUi();
    setProgressVisible(true);
    clearCorrectFlash();
    upcomingWord = null;
    player.targetWord = getNextWord();
    queueUpcomingWord();
    seedTrack();
    gameState = "playing";
    hideOverlays();
    closeReportSheet();
    lastReportText = "";
    lastReportJson = "";
    beginAwaitingInput();
    animationId = requestAnimationFrame(gameLoop);
  }

  /**
   * Resume after game over: refill lives, zero the run score.
   * Word ✓/✗, SRS pools, and report stats keep accruing until Restart.
   */
  function continueGame() {
    if (!words.length) {
      endGame();
      return;
    }
    if (animationId) cancelAnimationFrame(animationId);
    resize();
    applySpeedFromUi();
    lives = MAX_LIVES;
    score = 0;
    scrollSpeed = minSpeed;
    setScoreDisplay(0);
    setLivesDisplay(lives);
    player.x = width / 2;
    player.y = height * 0.25;
    player.vx = 0;
    player.jumpZ = 0;
    player.jumpVZ = 0;
    player.invuln = 0;
    player.face = "normal";
    player.faceUntil = 0;
    dying = false;
    deathUntil = 0;
    pendingGameOver = false;
    hoppedSinceLastGate = false;
    gateMissStreak = 0;
    clearKeys();
    setProgressVisible(true);
    updateProgressUi();
    clearCorrectFlash();
    if (!player.targetWord) {
      upcomingWord = null;
      player.targetWord = getNextWord();
    } else {
      noteWordInPlay(player.targetWord);
    }
    queueUpcomingWord();
    seedTrack();
    gameState = "playing";
    hideOverlays();
    closeReportSheet();
    beginAwaitingInput();
    animationId = requestAnimationFrame(gameLoop);
  }

  function update() {
    if (gameState === "gameover") {
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;
      });
      particles = particles.filter((p) => p.life > 0);
      return;
    }
    if (gameState !== "playing") return;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.03;
    });
    particles = particles.filter((p) => p.life > 0);

    if (dying) {
      if (performance.now() >= deathUntil) {
        if (pendingGameOver) {
          endGame();
          return;
        }
        resetAfterDeath();
      }
      return;
    }

    notePlayerDirection();
    scheduleEyeBlink();
    updateCorrectFlashFade();

    if (player.invuln > 0) player.invuln -= 1;

    if (keys.left) player.vx -= LATERAL_ACCEL;
    if (keys.right) player.vx += LATERAL_ACCEL;
    player.vx *= FRICTION;
    if (player.vx > MAX_LATERAL_SPEED) player.vx = MAX_LATERAL_SPEED;
    if (player.vx < -MAX_LATERAL_SPEED) player.vx = -MAX_LATERAL_SPEED;
    player.x += player.vx;
    if (player.x < player.radius) {
      player.x = player.radius;
      player.vx = 0;
    }
    if (player.x > width - player.radius) {
      player.x = width - player.radius;
      player.vx = 0;
    }

    if (!awaitingInput) {
      if (keys.left || keys.right) {
        scrollSpeed -= 0.03;
        if (scrollSpeed < minSpeed) scrollSpeed = minSpeed;
      } else {
        scrollSpeed += 0.05;
        if (scrollSpeed > maxSpeed) scrollSpeed = maxSpeed;
      }
    } else {
      scrollSpeed = 0;
    }
    if (speedHudEl) {
      speedHudEl.textContent = `${Math.round(scrollSpeed * 10)} km/h`;
    }

    trees.forEach((t) => {
      t.y -= scrollSpeed;
    });
    rows.forEach((r) => {
      r.y -= scrollSpeed;
    });
    particles.forEach((p) => {
      p.y -= scrollSpeed;
    });
    trail.forEach((t) => {
      t.y -= scrollSpeed;
    });
    ramps.forEach((r) => {
      r.y -= scrollSpeed;
    });

    if (!awaitingInput && player.invuln <= 0) {
      for (const t of trees) {
        const dx = player.x - t.x;
        const dy = player.y - t.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < player.radius + t.size * 0.4 && player.jumpZ < 10) {
          killSkier();
          return;
        }
      }
    }

    if (player.jumpZ === 0 && !awaitingInput) {
      const onRamp = rampUnderSkier();
      if (keys.up) {
        // Manual hop on a ramp = exaggerated launch; plain hop is smaller.
        player.jumpVZ = onRamp ? 13.5 : 4.5;
        hoppedSinceLastGate = true;
        setFace("boost", onRamp ? 700 : 420);
        playFeedback("hop");
        keys.up = false;
        for (const [id, dir] of canvasPointers) {
          if (dir === "up") canvasPointers.set(id, null);
        }
      } else if (onRamp) {
        player.jumpVZ = 9;
        hoppedSinceLastGate = true;
        setFace("boost", 520);
        playFeedback("hop");
      }
    }

    if (player.jumpZ > 0 || player.jumpVZ > 0) {
      player.jumpZ += player.jumpVZ;
      player.jumpVZ -= 0.4;
      if (player.jumpZ <= 0) {
        player.jumpZ = 0;
        player.jumpVZ = 0;
        createParticles(player.x, player.y, "#ffffff", 10);
      }
    }

    if (
      !awaitingInput &&
      player.jumpZ === 0 &&
      (Math.abs(player.vx) > 0.5 || Math.random() > 0.5)
    ) {
      trail.push({ x: player.x, y: player.y, life: 1.0 });
    }

    if (!awaitingInput) {
      for (const row of rows) {
        if (!row.passed && row.y - 10 < player.y + player.radius) {
          row.passed = true;
          const skipMiss = hoppedSinceLastGate;
          hoppedSinceLastGate = false;

          let matchedGate = null;
          if (player.jumpZ === 0) {
            for (const g of row.gates) {
              if (player.x >= g.x && player.x <= g.x + g.width) {
                matchedGate = g;
                break;
              }
            }
          }

          if (
            matchedGate &&
            matchedGate.type === player.targetWord?.gender
          ) {
            score += 100;
            setScoreDisplay(score);
            const landed = player.targetWord;
            speakWord(landed.article, landed.word);
            playFeedback("ok");
            setFace("happy", 360);
            landed.correct = (landed.correct || 0) + 1;
            if (pools.graduatedPool.includes(landed)) {
              landed.postGradCorrect = (landed.postGradCorrect || 0) + 1;
            }
            markClimberCorrect(pools, landed);
            updateProgressUi();
            showCorrectFlash(landed);
            gateMissStreak = 0;
            player.targetWord = getNextWord();
            queueUpcomingWord();
            createParticles(player.x, player.y, "#fde047", 25);
          } else if (skipMiss || player.jumpZ > 0) {
            // Hopped after previous gate (or still airborne) — ignore.
          } else {
            createParticles(player.x, player.y, "#94a3b8", 12);
            noteGateMiss();
          }
        }
      }
    }

    if (!awaitingInput) {
      let highestY = rows.length ? rows[rows.length - 1].y : height;
      if (highestY < height * 1.5) {
        const newY = highestY + 600;
        generateGateRow(newY);
        maybePlaceRamp(newY);
      }

      const highestTreeY = trees.length
        ? Math.max(...trees.map((t) => t.y))
        : height;
      if (highestTreeY < height * 1.5) {
        populateTrees(8, highestTreeY + 50, highestTreeY + 300);
      }
    }

    rows = rows.filter((r) => r.y > -100);
    trees = trees.filter((t) => t.y > -50);
    ramps = ramps.filter((r) => r.y > -50);
    trail.forEach((t) => {
      t.life -= 0.015;
    });
    trail = trail.filter((t) => t.life > 0);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    if (gameState === "start") return;

    const colors = genderColors();

    trail.forEach((t) => {
      ctx.globalAlpha = t.life * 0.4;
      ctx.fillStyle = "#cbd5e1";
      ctx.beginPath();
      ctx.arc(t.x, t.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    ctx.fillStyle = "#f1f5f9";
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ramps.forEach((r) => {
      ctx.beginPath();
      ctx.roundRect(r.x, r.y, r.width, r.height, 4);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(r.x + 8, r.y + r.height / 2);
      ctx.lineTo(r.x + r.width - 8, r.y + r.height / 2);
      ctx.stroke();
    });

    rows.forEach((r) => {
      r.gates.forEach((g) => {
        const style = colors[g.type];
        ctx.fillStyle = style.border;
        ctx.beginPath();
        ctx.roundRect(g.x, r.y + 4, g.width, 20, 8);
        ctx.fill();
        ctx.fillStyle = style.solid;
        ctx.beginPath();
        ctx.roundRect(g.x, r.y, g.width, 20, 8);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = displayFont(900, 14);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(style.label, g.x + g.width / 2, r.y + 10);
      });
    });

    trees.forEach((t) => {
      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.moveTo(t.x, t.y - t.size);
      ctx.lineTo(t.x - t.size / 2, t.y + t.size);
      ctx.lineTo(t.x + t.size / 2, t.y + t.size);
      ctx.fill();
    });

    particles.forEach((p) => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.translate(player.x, player.y + idleBobY());
    if (player.jumpZ > 0) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.beginPath();
      ctx.ellipse(
        0,
        HEAD_RADIUS * 1.15,
        HEAD_RADIUS * 1.05,
        HEAD_RADIUS * 0.5,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.translate(0, -player.jumpZ);

    const turn = Math.max(
      -1,
      Math.min(1, player.vx / MAX_LATERAL_SPEED)
    );
    // Tips face down-slope (travel); negate so carve matches lateral move.
    const skiAngle = -turn * 0.72;

    // Two plain ski strokes (+Y = down-slope). Crossed for wipeout + game over.
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    const skiSpread = HEAD_RADIUS * 0.42;
    const skiTop = -HEAD_RADIUS * 0.35;
    const skiBot = HEAD_RADIUS * 1.45;
    const skisCrossed = dying || gameState === "gameover";

    if (skisCrossed) {
      // Shorter above/behind the player; longer down-slope.
      const back = HEAD_RADIUS * 0.7;
      const front = HEAD_RADIUS * 1.35;
      ctx.beginPath();
      ctx.moveTo(-back, -back);
      ctx.lineTo(front, front);
      ctx.moveTo(back, -back);
      ctx.lineTo(-front, front);
      ctx.stroke();
    } else {
      ctx.save();
      ctx.rotate(skiAngle);
      ctx.beginPath();
      ctx.moveTo(-skiSpread, skiTop);
      ctx.lineTo(-skiSpread, skiBot);
      ctx.moveTo(skiSpread, skiTop);
      ctx.lineTo(skiSpread, skiBot);
      ctx.stroke();
      ctx.restore();
    }

    // Head only (no body) — same white ball as Wort-Hüpfer.
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, HEAD_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#eef1f4";
    ctx.stroke();

    drawEyesLocal();
    ctx.restore();

    if (player.targetWord && gameState === "playing" && !dying) {
      ctx.font = displayFont(700, 18);
      ctx.textAlign = "center";
      const wordWidth = ctx.measureText(player.targetWord.word).width;
      const showHint = player.targetWord.showHint !== false;
      const theme =
        document.documentElement.getAttribute("data-theme") || "light";
      const hiddenFill = theme === "dark" ? "#0d1117" : "#1a2030";
      const bubbleColor = showHint
        ? colors[player.targetWord.gender].solid
        : hiddenFill;
      const bubbleH = 30;
      const bubbleY =
        player.y - player.jumpZ - HEAD_RADIUS - bubbleH - 10;
      ctx.fillStyle = bubbleColor;
      ctx.beginPath();
      ctx.roundRect(
        player.x - wordWidth / 2 - 12,
        bubbleY,
        wordWidth + 24,
        bubbleH,
        bubbleH / 2
      );
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "middle";
      ctx.fillText(
        player.targetWord.word,
        player.x,
        bubbleY + bubbleH / 2
      );
    }
  }

  function gameLoop() {
    update();
    draw();
    if (gameState !== "start") {
      animationId = requestAnimationFrame(gameLoop);
    }
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
      w: rect.width || width,
    };
  }

  function dirFromPoint(clientX, clientY) {
    const { x, y, h, w } = localPoint(clientX, clientY);
    if (y < h / 3) return "up";
    if (x < w / 2) return "left";
    return "right";
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

  function onCanvasPointerDown(e) {
    if (gameState !== "playing") return;
    e.preventDefault();
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    canvasPointers.set(e.pointerId, dirFromPoint(e.clientX, e.clientY));
    syncKeysFromCanvasPointers();
  }

  function onCanvasPointerMove(e) {
    if (gameState !== "playing") return;
    if (!canvasPointers.has(e.pointerId)) return;
    e.preventDefault();
    canvasPointers.set(e.pointerId, dirFromPoint(e.clientX, e.clientY));
    syncKeysFromCanvasPointers();
  }

  function onCanvasPointerUp(e) {
    canvasPointers.delete(e.pointerId);
    syncKeysFromCanvasPointers();
  }

  function destroy() {
    if (animationId) cancelAnimationFrame(animationId);
    clearKeys();
    if (scoreEl) scoreEl.hidden = true;
    if (livesEl) livesEl.hidden = true;
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("resize", resize);
    root.innerHTML = "";
  }

  const playBtn = root.querySelector("[data-skier-play]");
  const continueBtn = root.querySelector("[data-skier-continue]");
  const primeSpeak = () => {
    if (audioOn) unlockSpeak();
  };
  playBtn?.addEventListener("pointerdown", primeSpeak);
  continueBtn?.addEventListener("pointerdown", primeSpeak);
  playBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    primeSpeak();
    initGame();
  });
  root.querySelector("[data-skier-retry]")?.addEventListener("click", (e) => {
    e.preventDefault();
    showStartScreen();
  });
  continueBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    primeSpeak();
    continueGame();
  });
  root.querySelector("[data-skier-report]")?.addEventListener("click", (e) => {
    e.preventDefault();
    openReportSheet();
  });
  root
    .querySelector("[data-skier-report-close]")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      closeReportSheet();
    });
  root
    .querySelector("[data-skier-copy-text]")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      if (!lastReportText) buildReport();
      copyText(lastReportText);
    });
  root
    .querySelector("[data-skier-copy-json]")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      if (!lastReportJson) buildReport();
      copyText(lastReportJson);
    });

  canvas.addEventListener("pointerdown", onCanvasPointerDown, {
    passive: false,
  });
  canvas.addEventListener("pointermove", onCanvasPointerMove, {
    passive: false,
  });
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
  clearCorrectFlash();
  resize();
  requestAnimationFrame(() => resize());

  // Silence unused onExit unless shell wires a chrome back button later.
  void onExit;

  return { destroy, resize };
}
