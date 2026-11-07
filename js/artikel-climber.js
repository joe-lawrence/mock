/**
 * Artikel Climber — canvas gender platforms inside the Schnapp shell.
 */

import {
  ANSWER_SPACING,
  initClimberPools,
  markClimberCorrect,
  markClimberIncorrect,
  pickClimberWord,
  wordAnswerKey,
} from "./artikel-climber-pools.js?v=20261107-ans-space2";
import {
  buildGameReport,
  progressSnapshot as sharedProgressSnapshot,
  wordKey,
} from "./artikel-game-progress.js?v=20261107-ans-space2";
import { TOASTER_FRAMES } from "./toaster-sprites.js?v=20261106-hopper-stick";

const BASE_GRAVITY = 0.2;
const BASE_BOUNCE = -8.2;
const BASE_MEGA_BOUNCE = -11.2;
const BASE_MOVE = 3.0;
const MAX_LIVES = 3;
/** Eyes stay dark on the white ball in both themes. */
const EYE_INK = "#1a2030";
/** Occasional After Dark–style flying toaster easter egg (washed-out sky prop). */
const TOASTER_SPAWN_CHANCE = 0.001;
const TOASTER_MAX = 2;
const TOASTER_SCALE = 1.05;
/** Sky wash on opaque toaster pixels (keeps hard occlusion vs clouds). */
const TOASTER_WASH_LIGHT = "rgba(214, 226, 238, 0.78)";
const TOASTER_WASH_DARK = "rgba(58, 74, 98, 0.62)";

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
 *   playFeedback?: (kind: "ok"|"bad"|"retry"|"splat") => void,
 *   scoreEl?: HTMLElement|null,
 *   livesEl?: HTMLElement|null,
 *   onExit?: () => void,
 * }} options
 */
export function mountArtikelClimber(root, options = {}) {
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
    <div class="climber-shell">
      <div class="climber-stage" data-climber-stage>
        <canvas class="climber-canvas" data-climber-canvas></canvas>
        <div class="climber-progress" data-climber-progress hidden>
          <span class="climber-progress-side">Hints <span data-climber-hints-pct>—</span></span>
          <div class="climber-progress-track" aria-hidden="true">
            <div class="climber-progress-half is-hints">
              <div class="climber-progress-hints" data-climber-hints-bar></div>
            </div>
            <div class="climber-progress-half is-deck">
              <div class="climber-progress-deck" data-climber-deck-bar></div>
            </div>
          </div>
          <span class="climber-progress-side">Deck <span data-climber-deck-pct>0%</span></span>
        </div>
        <div class="climber-next is-correct" data-climber-next hidden>
          <span class="climber-next-label" data-climber-next-label>CORRECT</span>
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
            <p class="climber-summary" data-climber-summary></p>
            <div class="climber-over-actions">
              <button type="button" class="btn btn-primary" data-climber-continue>Continue</button>
              <button type="button" class="btn" data-climber-retry>Restart</button>
              <button type="button" class="btn climber-report-btn" data-climber-report aria-label="Full report card">
                ${REPORT_LIST_SVG}
              </button>
            </div>
          </div>
        </div>
        <div class="climber-overlay is-hidden" data-climber-report-sheet hidden>
          <div class="climber-panel climber-report-panel">
            <h1 class="climber-title">Spielanalyse</h1>
            <pre class="climber-report-body" data-climber-report-body></pre>
            <div class="climber-over-actions">
              <button type="button" class="btn btn-primary" data-climber-copy-text>Copy text</button>
              <button type="button" class="btn" data-climber-copy-json>Copy JSON</button>
              <button type="button" class="btn" data-climber-report-close>Done</button>
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
  const reportSheetEl = root.querySelector("[data-climber-report-sheet]");
  const reportBodyEl = root.querySelector("[data-climber-report-body]");
  const summaryEl = root.querySelector("[data-climber-summary]");
  const finalEl = root.querySelector("[data-climber-final]");
  const speedEl = root.querySelector("[data-climber-speed]");
  const nextEl = root.querySelector("[data-climber-next]");
  const nextLabelEl = root.querySelector("[data-climber-next-label]");
  const nextWordEl = root.querySelector("[data-climber-next-word]");
  const progressEl = root.querySelector("[data-climber-progress]");
  const hintsPctEl = root.querySelector("[data-climber-hints-pct]");
  const deckPctEl = root.querySelector("[data-climber-deck-pct]");
  const hintsBarEl = root.querySelector("[data-climber-hints-bar]");
  const deckBarEl = root.querySelector("[data-climber-deck-bar]");

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

  /** @type {{ article: string, word: string, gender: string, shownAt: number }|null} */
  let correctFlash = null;
  /** Hold CORRECT fully visible, then ease out (row gaps are too tight for ski-style distance fade alone). */
  const CORRECT_HOLD_MS = 1200;
  const CORRECT_FADE_MS = 700;

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

  /** After a correct land: show color-coded article + noun, then hold and fade. */
  function showCorrectFlash(landed) {
    if (!nextEl || !nextWordEl || !landed?.word) return;
    correctFlash = {
      article: String(landed.article || "").trim(),
      word: String(landed.word || "").trim(),
      gender: landed.gender || "",
      shownAt: performance.now(),
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

  /** Hold at full opacity, then fade out (same feel as Snow-Nomen’s linger). */
  function updateCorrectFlashFade() {
    if (!correctFlash || !nextEl) return;
    const elapsed = performance.now() - correctFlash.shownAt;
    if (elapsed < CORRECT_HOLD_MS) {
      nextEl.style.opacity = "1";
      return;
    }
    const t = (elapsed - CORRECT_HOLD_MS) / CORRECT_FADE_MS;
    if (t >= 1) {
      clearCorrectFlash();
      return;
    }
    nextEl.style.opacity = String(Math.max(0, 1 - t));
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
  /**
   * World-space flight in the cloud band (scrolls with sky, behind platforms/player).
   * layer "back" = fully behind clouds, "mid" = fully in front of clouds.
   * @type {{ x: number, y: number, vx: number, vy: number, frame: number, frameAcc: number, wingDir: number, scale: number, layer: "back"|"mid" }[]}
   */
  let toasters = [];
  let animationId = null;

  const toasterImgs = TOASTER_FRAMES.map((src) => {
    const img = new Image();
    img.src = src;
    return img;
  });
  /** Scratch canvas so wash stays on toaster pixels without alpha-blending through clouds. */
  const toasterScratch = document.createElement("canvas");
  const toasterScratchCtx = toasterScratch.getContext("2d");
  let pools = { unseenPool: [], activePool: [], graduatedPool: [] };
  /** Distinct words that have appeared as a target at least once this run tree. */
  /** @type {Map<string, object>} */
  const seenByKey = new Map();
  let lastReportText = "";
  let lastReportJson = "";
  let GRAVITY = BASE_GRAVITY;
  let BOUNCE_VELOCITY = BASE_BOUNCE;
  let MEGA_BOUNCE = BASE_MEGA_BOUNCE;
  let MOVE_SPEED = BASE_MOVE;
  const keys = { left: false, right: false, up: false };
  /** @type {Map<number, "left"|"right"|"up"|null>} */
  const canvasPointers = new Map();
  /**
   * Per-finger virtual stick (same model as Snow-Nomen).
   * Fixed origin at touch-down + enter/exit hysteresis.
   * @type {Map<number, {
   *   ox: number, oy: number,
   *   smx: number, smy: number,
   *   dir: "left"|"right"|"up"|null,
   *   pending: "left"|"right"|"up"|null,
   *   pendingSince: number,
   *   axis: "h"|"v"|null,
   * }>}
   */
  const pointerSticks = new Map();
  const isTouchApple =
    typeof navigator !== "undefined" &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent || "") ||
      (navigator.platform === "MacIntel" &&
        (navigator.maxTouchPoints || 0) > 1));
  // Enter deadzone (engage) vs larger reverse threshold (flip) — hysteresis.
  const STICK_ENTER = isTouchApple ? 14 : 16;
  const STICK_HOLD = isTouchApple ? 7 : 8;
  const STICK_REVERSE = isTouchApple ? 28 : 32;
  const STICK_UP_ENTER = isTouchApple ? 16 : 18;
  const STICK_SMOOTH = 0.35;
  const STICK_CONFIRM_MS = 35;
  const TOUCH_MOVE_MULT = isTouchApple ? 1.22 : 1;
  /** Soft lateral when an Apple touch stick is active (matches skier feel). */
  const TOUCH_MOVE_ACCEL = 0.42;
  const TOUCH_FRICTION = 0.88;
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
    /** X-eyes after a lost life; clears after safe bounces or steering. */
    scaredBouncesLeft: 0,
    /** Eye-orbit spin (radians) after mega+hold ejections. */
    spin: 0,
    spinVel: 0,
    /** Normal (safe) bounces left before snapping eyes upright. */
    spinSettleBounces: 0,
  };

  /** Mega+hold eye tumble — scaled by horizontal speed (straight up ≈ none). */
  function kickMegaSpin() {
    const scale = Math.max(-1, Math.min(1, player.vx / Math.max(MOVE_SPEED, 0.01)));
    player.spinVel = scale * 0.72;
    player.spinSettleBounces = 2;
  }

  /** Snap eyes upright and clear the settle countdown. */
  function resetEyeSpin() {
    player.spin = 0;
    player.spinVel = 0;
    player.spinSettleBounces = 0;
  }

  /** Count a normal bounce toward ending tumble (reset on the 2nd). */
  function noteNormalBounceForSpin() {
    if (player.spinSettleBounces <= 0) {
      if (player.spin !== 0 || player.spinVel !== 0) resetEyeSpin();
      return;
    }
    player.spinSettleBounces -= 1;
    if (player.spinSettleBounces <= 0) resetEyeSpin();
  }

  /** @param {"normal"|"happy"|"boost"|"scared"|"dead"} face @param {number} [ms] */
  function setFace(face, ms = 280) {
    player.face = face;
    player.faceUntil = performance.now() + ms;
  }

  function clearScaredFace() {
    player.scaredBouncesLeft = 0;
    if (player.face === "scared") {
      player.face = "normal";
      player.faceUntil = 0;
    }
  }

  function currentFace() {
    if (gameState === "gameover") return "dead";
    if (player.scaredBouncesLeft > 0) return "scared";
    if (keys.up && player.vy < 0) return "boost";
    if (performance.now() < player.faceUntil) return player.face;
    return "normal";
  }

  function drawEyes() {
    const face = currentFace();
    // Never tumble X-eyes (life loss / game over) — keep them upright.
    const allowTumble = face !== "dead" && face !== "scared";
    const tumbling = allowTumble && Math.abs(player.spinVel) > 0.05;
    const look = tumbling ? 0 : Math.max(-2.2, Math.min(2.2, player.vx * 0.35));
    // Only orbit while spinning. Never leave normal * * stuck at a tilted angle.
    const spin = tumbling ? player.spin : 0;
    const cos = Math.cos(spin);
    const sin = Math.sin(spin);
    const mapEye = (ox, oy) => ({
      x: player.x + ox * cos - oy * sin,
      y: player.y + ox * sin + oy * cos,
    });
    const left = mapEye(-5 + look, -3);
    const right = mapEye(5 + look, -3);
    ctx.strokeStyle = EYE_INK;
    ctx.fillStyle = EYE_INK;
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";

    // While ejected/spinning, keep simple dots orbiting with the ball.
    if (tumbling) {
      ctx.beginPath();
      ctx.arc(left.x, left.y, 2.15, 0, Math.PI * 2);
      ctx.arc(right.x, right.y, 2.15, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (face === "dead" || face === "scared") {
      const s = face === "dead" ? 3.2 : 2.6;
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
  }

  function buildReport() {
    const report = buildGameReport({
      gameId: "wort-huepfer",
      gameTitle: "Wort-Hüpfer",
      score,
      speed: Number(speedEl?.value) || 1,
      words,
      pools,
      seenByKey,
      targetLabel: "climb target",
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
  /** Recent answer keys (articles / genders) for spaced selection. */
  let recentAnswers = /** @type {string[]} */ ([]);

  function rememberAnswerKey(key) {
    const k = String(key || "")
      .trim()
      .toLowerCase();
    if (!k) return;
    recentAnswers.push(k);
    if (recentAnswers.length > ANSWER_SPACING * 4) {
      recentAnswers = recentAnswers.slice(-ANSWER_SPACING * 4);
    }
  }

  function pickOpts() {
    return {
      recentAnswers,
      answerKeyOf: wordAnswerKey,
    };
  }

  function queueUpcomingWord() {
    upcomingWord = pickClimberWord(
      { ...pools, current: player.targetWord },
      Math.random,
      pickOpts()
    );
  }

  function getNextWord() {
    const next =
      upcomingWord && upcomingWord !== player.targetWord
        ? upcomingWord
        : pickClimberWord(
            { ...pools, current: player.targetWord },
            Math.random,
            pickOpts()
          );
    upcomingWord = null;
    noteWordInPlay(next);
    rememberAnswerKey(wordAnswerKey(next));
    return next;
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
    canvasPointers.clear();
    pointerSticks.clear();
  }

  function touchSteerActive() {
    for (const dir of canvasPointers.values()) {
      if (dir) return true;
    }
    return false;
  }

  function applySpeedFromUi() {
    const speedScale = Number(speedEl?.value) || 1;
    GRAVITY = BASE_GRAVITY * (speedScale * speedScale);
    BOUNCE_VELOCITY = BASE_BOUNCE * speedScale;
    MEGA_BOUNCE = BASE_MEGA_BOUNCE * speedScale;
    MOVE_SPEED = BASE_MOVE * speedScale * TOUCH_MOVE_MULT;
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

  /** @param {number} x @param {number} y */
  function createToaster(x, y) {
    return {
      x,
      y,
      vx: -(1.0 + Math.random() * 1.2),
      vy: 0.35 + Math.random() * 0.55,
      frame: Math.floor(Math.random() * 5),
      frameAcc: 0,
      wingDir: 1,
      scale: TOASTER_SCALE * (0.85 + Math.random() * 0.3),
      layer: Math.random() < 0.5 ? "back" : "mid",
    };
  }

  /** Rare opening sighting: at most one, and often none. */
  function seedAmbientToasters() {
    toasters = [];
    if (width < 8 || height < 8) return;
    if (Math.random() > 0.35) return;
    const y = cameraY + (0.15 + Math.random() * 0.7) * height;
    const x = -40 + Math.random() * (width + 80);
    toasters.push(createToaster(x, y));
  }

  /** Occasional toaster higher in the climb — not a guaranteed fill. */
  function topUpToastersAhead() {
    if (width < 8 || height < 8) return;
    if (toasters.length >= TOASTER_MAX) return;
    if (Math.random() > TOASTER_SPAWN_CHANCE * 0.6) return;
    const yLo = cameraY - height * 1.4;
    const yHi = cameraY + height * 0.15;
    const y = yLo + Math.random() * Math.max(40, yHi - yLo);
    const x = width + 20 + Math.random() * 60;
    toasters.push(createToaster(x, y));
  }

  function maybeSpawnToaster() {
    if (gameState !== "playing" && gameState !== "gameover") return;
    if (width < 8 || height < 8) return;
    if (toasters.length >= TOASTER_MAX) return;
    if (Math.random() > TOASTER_SPAWN_CHANCE) return;
    // Enter from the right anywhere in the visible (+ slightly above) sky column.
    const yMin = cameraY - height * 0.2;
    const yMax = cameraY + height * 0.95;
    toasters.push(
      createToaster(
        width + 20 + Math.random() * 40,
        yMin + Math.random() * Math.max(48, yMax - yMin)
      )
    );
  }

  function updateToasters() {
    maybeSpawnToaster();
    topUpToastersAhead();
    for (const t of toasters) {
      t.x += t.vx;
      t.y += t.vy;
      t.frameAcc += 1;
      if (t.frameAcc >= 5) {
        t.frameAcc = 0;
        t.frame += t.wingDir;
        if (t.frame >= 4) {
          t.frame = 4;
          t.wingDir = -1;
        } else if (t.frame <= 0) {
          t.frame = 0;
          t.wingDir = 1;
        }
      }
    }
    toasters = toasters.filter(
      (t) =>
        t.x > -140 &&
        t.y < cameraY + height + 160 &&
        t.y > cameraY - height * 1.6
    );
  }

  function fillCloudShape(c) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
    ctx.arc(c.x + c.radius * 0.9, c.y + c.radius * 0.2, c.radius * 0.8, 0, Math.PI * 2);
    ctx.arc(c.x - c.radius * 0.9, c.y + c.radius * 0.2, c.radius * 0.7, 0, Math.PI * 2);
    ctx.arc(c.x + c.radius * 0.4, c.y - c.radius * 0.5, c.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  /** Erase back-layer toaster pixels under clouds so translucent clouds never show a blend. */
  function punchCloudsThroughBackToasters() {
    if (!toasters.some((t) => t.layer === "back") || !clouds.length) return;
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "#fff";
    clouds.forEach(fillCloudShape);
    ctx.restore();
  }

  /**
   * Draw toaster with sky wash baked into opaque sprite pixels (no globalAlpha mush).
   * @param {HTMLImageElement} img
   * @param {number} x
   * @param {number} y
   * @param {number} dw
   * @param {number} dh
   */
  function drawWashedToaster(img, x, y, dw, dh) {
    if (!toasterScratchCtx) {
      ctx.drawImage(img, x, y, dw, dh);
      return;
    }
    const tw = Math.max(1, Math.ceil(dw));
    const th = Math.max(1, Math.ceil(dh));
    if (toasterScratch.width !== tw) toasterScratch.width = tw;
    if (toasterScratch.height !== th) toasterScratch.height = th;
    toasterScratchCtx.clearRect(0, 0, tw, th);
    toasterScratchCtx.imageSmoothingEnabled = false;
    toasterScratchCtx.globalCompositeOperation = "source-over";
    toasterScratchCtx.globalAlpha = 1;
    toasterScratchCtx.drawImage(img, 0, 0, dw, dh);
    toasterScratchCtx.globalCompositeOperation = "source-atop";
    const theme =
      document.documentElement.getAttribute("data-theme") || "light";
    toasterScratchCtx.fillStyle =
      theme === "dark" ? TOASTER_WASH_DARK : TOASTER_WASH_LIGHT;
    toasterScratchCtx.fillRect(0, 0, tw, th);
    toasterScratchCtx.globalCompositeOperation = "source-over";
    ctx.drawImage(toasterScratch, x, y);
  }

  /** @param {"back"|"mid"} layer */
  function drawToastersLayer(layer) {
    const list = toasters.filter((t) => t.layer === layer);
    if (!list.length) return;
    const prevSmooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    for (const t of list) {
      const img = toasterImgs[t.frame] || toasterImgs[0];
      if (!img?.complete || !img.naturalWidth) continue;
      const dw = img.naturalWidth * t.scale;
      const dh = img.naturalHeight * t.scale;
      drawWashedToaster(img, t.x - dw / 2, t.y - dh / 2, dw, dh);
    }
    ctx.imageSmoothingEnabled = prevSmooth;
  }

  function drawClouds() {
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    clouds.forEach(fillCloudShape);
  }

  /** Wipe run + report stats (Restart). Next Start begins a fresh session. */
  function clearSessionStats() {
    score = 0;
    pools = { unseenPool: [], activePool: [], graduatedPool: [] };
    seenByKey.clear();
    lastReportText = "";
    lastReportJson = "";
    player.targetWord = null;
    setScoreDisplay(0);
    setProgressVisible(false);
    updateProgressUi();
  }

  /** First screen / Restart: clear run progress and show the start panel. */
  function showStartScreen() {
    if (animationId) cancelAnimationFrame(animationId);
    gameState = "start";
    clearKeys();
    canvasPointers.clear();
    pointerSticks.clear();
    clearSessionStats();
    lives = MAX_LIVES;
    cameraY = 0;
    platforms = [];
    particles = [];
    toasters = [];
    player.vx = 0;
    player.vy = 0;
    player.isRescuing = false;
    player.face = "normal";
    player.faceUntil = 0;
    setLivesDisplay(MAX_LIVES);
    clearCorrectFlash();
    closeReportSheet();
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
      resetEyeSpin();
      player.scaredBouncesLeft = 3;
      setFace("scared", 4000);
      createParticles(player.x, padY, "#ef4444");
    } else {
      clearScaredFace();
      resetEyeSpin();
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
    pointerSticks.clear();
    resetEyeSpin();
    setFace("dead", 10_000);
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
    if (audioOn) speak("Spiel vorbei!");
  }

  function initGame() {
    if (!words.length) {
      endGame("No gendered vocabulary in the selected sections.");
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
    setScoreDisplay(0);
    setLivesDisplay(lives);
    cameraY = 0;
    platforms = [];
    particles = [];
    clouds = [];
    toasters = [];
    clearKeys();
    canvasPointers.clear();
    pointerSticks.clear();
    player.face = "normal";
    player.faceUntil = 0;
    updateProgressUi();
    setProgressVisible(true);
    clearCorrectFlash();
    upcomingWord = null;
    recentAnswers = [];
    player.targetWord = getNextWord();
    queueUpcomingWord();
    generatePlatforms(height - 50);
    placeBounceFloor({ fromFall: false });
    seedAmbientClouds();
    seedAmbientToasters();
    gameState = "playing";
    hideOverlays();
    closeReportSheet();
    animationId = requestAnimationFrame(gameLoop);
  }

  /**
   * Resume after game over: refill lives, zero the run score.
   * Word ✓/✗, SRS pools, and report stats keep accruing until Restart.
   */
  function continueGame() {
    if (!words.length) {
      endGame("No gendered vocabulary in the selected sections.");
      return;
    }
    if (animationId) cancelAnimationFrame(animationId);
    resize();
    applySpeedFromUi();
    lives = MAX_LIVES;
    score = 0;
    setScoreDisplay(0);
    setLivesDisplay(lives);
    cameraY = 0;
    platforms = [];
    particles = [];
    clouds = [];
    toasters = [];
    clearKeys();
    canvasPointers.clear();
    pointerSticks.clear();
    player.face = "normal";
    player.faceUntil = 0;
    clearScaredFace();
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
    generatePlatforms(height - 50);
    placeBounceFloor({ fromFall: false });
    seedAmbientClouds();
    seedAmbientToasters();
    gameState = "playing";
    hideOverlays();
    closeReportSheet();
    animationId = requestAnimationFrame(gameLoop);
  }

  function update() {
    if (gameState !== "playing") return;
    updateCorrectFlashFade();
    updateToasters();
    const touchSteer = isTouchApple && touchSteerActive();
    if (touchSteer) {
      if (keys.left) player.vx -= TOUCH_MOVE_ACCEL;
      if (keys.right) player.vx += TOUCH_MOVE_ACCEL;
      if (!keys.left && !keys.right) player.vx *= TOUCH_FRICTION;
      if (player.vx > MOVE_SPEED) player.vx = MOVE_SPEED;
      if (player.vx < -MOVE_SPEED) player.vx = -MOVE_SPEED;
      if (!keys.left && !keys.right && Math.abs(player.vx) < 0.05) player.vx = 0;
    } else if (keys.left) player.vx = -MOVE_SPEED;
    else if (keys.right) player.vx = MOVE_SPEED;
    else player.vx = 0;
    if (
      player.scaredBouncesLeft > 0 &&
      (keys.left || keys.right || keys.up)
    ) {
      clearScaredFace();
    }
    player.x += player.vx;
    if (player.x < -player.radius) player.x = width + player.radius;
    if (player.x > width + player.radius) player.x = -player.radius;
    player.vy += GRAVITY;
    player.y += player.vy;
    player.spin += player.spinVel;
    player.spinVel *= 0.965;
    // When tumble energy dies, snap to horizontal * * (don't freeze at ~90°).
    if (Math.abs(player.spinVel) < 0.002) {
      player.spinVel = 0;
      player.spin = 0;
    }
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
            noteNormalBounceForSpin();
            if (player.scaredBouncesLeft > 0) {
              player.scaredBouncesLeft -= 1;
              if (player.scaredBouncesLeft <= 0) clearScaredFace();
              else setFace("scared", 4000);
            } else {
              setFace("happy", 220);
            }
          } else if (p.type === player.targetWord?.gender) {
            const landed = player.targetWord;
            player.vy = MEGA_BOUNCE + jumpBoost;
            if (keys.up) kickMegaSpin();
            clearBounceFloor();
            clearScaredFace();
            setFace("happy", 320);
            speakWord(landed.article, landed.word);
            playFeedback("ok");
            landed.correct = (landed.correct || 0) + 1;
            if (pools.graduatedPool.includes(landed)) {
              landed.postGradCorrect = (landed.postGradCorrect || 0) + 1;
            }
            markClimberCorrect(pools, landed);
            updateProgressUi();
            showCorrectFlash(landed);
            player.targetWord = getNextWord();
            queueUpcomingWord();
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
      if (audioOn) stopSpeak();
      playFeedback("splat");
      if (player.targetWord) {
        player.targetWord.wrong = (player.targetWord.wrong || 0) + 1;
        if (pools.graduatedPool.includes(player.targetWord)) {
          player.targetWord.postGradWrong =
            (player.targetWord.postGradWrong || 0) + 1;
        }
      }
      markClimberIncorrect(pools, player.targetWord);
      updateProgressUi();
      clearCorrectFlash();
      queueUpcomingWord();
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
    // Sky stack at cloud depth: hard behind/in-front of clouds, never with player.
    if (gameState !== "start") {
      drawToastersLayer("back");
      punchCloudsThroughBackToasters();
    }
    drawClouds();
    if (gameState !== "start") drawToastersLayer("mid");

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
    else {
      tickAmbient();
      // Keep easter-egg toasters drifting behind the game-over overlay.
      if (gameState === "gameover") updateToasters();
    }
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

  /**
   * Discrete direction from a floating virtual stick.
   * Techniques: fixed origin, EMA smoothing, enter/hold/reverse hysteresis,
   * axis lock, and short confirm delay before flipping.
   * @returns {"left"|"right"|"up"|null}
   */
  function dirFromStick(pointerId, clientX, clientY) {
    const { x, y, h } = localPoint(clientX, clientY);
    let stick = pointerSticks.get(pointerId);
    if (!stick) {
      stick = {
        ox: x,
        oy: y,
        smx: 0,
        smy: 0,
        dir: /** @type {null} */ (null),
        pending: /** @type {null} */ (null),
        pendingSince: 0,
        axis: /** @type {null} */ (null),
      };
      pointerSticks.set(pointerId, stick);
    }

    const rawDx = x - stick.ox;
    const rawDy = y - stick.oy;
    stick.smx += (rawDx - stick.smx) * STICK_SMOOTH;
    stick.smy += (rawDy - stick.smy) * STICK_SMOOTH;
    const dx = stick.smx;
    const dy = stick.smy;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);

    /** @type {"left"|"right"|"up"|null} */
    let candidate = null;
    if (stick.dir === "left" || stick.dir === "right") {
      stick.axis = "h";
    } else if (stick.dir === "up") {
      stick.axis = "v";
    }

    if (stick.axis === "h" || (!stick.axis && adx >= ady)) {
      if (stick.dir === "left") {
        if (dx <= -STICK_HOLD) candidate = "left";
        else if (dx >= STICK_REVERSE) candidate = "right";
      } else if (stick.dir === "right") {
        if (dx >= STICK_HOLD) candidate = "right";
        else if (dx <= -STICK_REVERSE) candidate = "left";
      } else if (adx >= STICK_ENTER && adx >= ady * 0.85) {
        candidate = dx < 0 ? "left" : "right";
      }
    }

    if (!candidate && (stick.axis === "v" || !stick.axis)) {
      const tapTop = y < h * 0.28 && adx < STICK_ENTER * 0.75;
      if (stick.dir === "up") {
        if (dy <= -STICK_HOLD || tapTop) candidate = "up";
      } else if ((dy <= -STICK_UP_ENTER && ady > adx) || tapTop) {
        candidate = "up";
      }
    }

    const now = performance.now();
    if (candidate === stick.dir) {
      stick.pending = null;
      stick.pendingSince = 0;
      return stick.dir;
    }
    if (!candidate) {
      if (
        stick.dir === "left" ||
        stick.dir === "right" ||
        stick.dir === "up"
      ) {
        const stillHeld =
          (stick.dir === "left" && dx <= -STICK_HOLD) ||
          (stick.dir === "right" && dx >= STICK_HOLD) ||
          (stick.dir === "up" && dy <= -STICK_HOLD);
        if (stillHeld) return stick.dir;
      }
      stick.dir = null;
      stick.axis = null;
      stick.pending = null;
      return null;
    }

    if (stick.pending !== candidate) {
      stick.pending = candidate;
      stick.pendingSince = now;
      return stick.dir;
    }
    if (now - stick.pendingSince < STICK_CONFIRM_MS && stick.dir) {
      return stick.dir;
    }
    stick.dir = candidate;
    stick.axis = candidate === "up" ? "v" : "h";
    stick.pending = null;
    return stick.dir;
  }

  function applyPointerSample(pointerId, clientX, clientY) {
    canvasPointers.set(pointerId, dirFromStick(pointerId, clientX, clientY));
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
    const { x, y, h } = localPoint(e.clientX, e.clientY);
    pointerSticks.set(e.pointerId, {
      ox: x,
      oy: y,
      smx: 0,
      smy: 0,
      dir: y < h * 0.28 ? "up" : null,
      pending: null,
      pendingSince: 0,
      axis: y < h * 0.28 ? "v" : null,
    });
    // Tap top band = boost; elsewhere wait for stick to leave the enter deadzone.
    canvasPointers.set(e.pointerId, y < h * 0.28 ? "up" : null);
    syncKeysFromCanvasPointers();
  }

  function onCanvasPointerMove(e) {
    if (gameState !== "playing" || !canvasPointers.has(e.pointerId)) return;
    e.preventDefault();
    // Latest sample only — coalesced bursts fight hysteresis.
    applyPointerSample(e.pointerId, e.clientX, e.clientY);
  }

  function onCanvasPointerUp(e) {
    canvasPointers.delete(e.pointerId);
    pointerSticks.delete(e.pointerId);
    syncKeysFromCanvasPointers();
  }

  function destroy() {
    if (animationId) cancelAnimationFrame(animationId);
    clearKeys();
    canvasPointers.clear();
    pointerSticks.clear();
    if (scoreEl) scoreEl.hidden = true;
    if (livesEl) livesEl.hidden = true;
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("resize", resize);
    root.innerHTML = "";
  }

  const playBtn = root.querySelector("[data-climber-play]");
  const continueBtn = root.querySelector("[data-climber-continue]");
  // pointerdown keeps unlock inside the iOS user-gesture window more reliably than click.
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
  root.querySelector("[data-climber-retry]")?.addEventListener("click", (e) => {
    e.preventDefault();
    showStartScreen();
  });
  continueBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    primeSpeak();
    continueGame();
  });
  root.querySelector("[data-climber-report]")?.addEventListener("click", (e) => {
    e.preventDefault();
    openReportSheet();
  });
  root.querySelector("[data-climber-report-close]")?.addEventListener("click", (e) => {
    e.preventDefault();
    closeReportSheet();
  });
  root.querySelector("[data-climber-copy-text]")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!lastReportText) buildReport();
    copyText(lastReportText);
  });
  root.querySelector("[data-climber-copy-json]")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!lastReportJson) buildReport();
    copyText(lastReportJson);
  });
  // Virtual stick on the canvas (same model as Snow-Nomen).
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
  clearCorrectFlash();
  resize();
  seedAmbientClouds();
  requestAnimationFrame(() => {
    resize();
    if (!clouds.length) seedAmbientClouds();
  });
  animationId = requestAnimationFrame(gameLoop);

  return { destroy, resize };
}
