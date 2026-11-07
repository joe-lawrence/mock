/**
 * Snow-Nomen — canvas gender gates inside the Schnapp shell.
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
import {
  DEFAULT_CASE_GOVERNORS,
  GENDER_LANES,
  buildCaseTrial,
  constructionsForNoun,
} from "./artikel-skier-cases.js?v=20261107-ans-space2";
import { genderMarkHtml } from "./gender-marks.js";

const MAX_LIVES = 3;
const BASE_MIN_SPEED = 3.5;
const BASE_MAX_SPEED = 7.5;
/** Cases slope reads denser prompts — keep it slower than Nouns. */
const CASES_SPEED_FACTOR = 0.74;
const LATERAL_ACCEL = 0.8;
const MAX_LATERAL_SPEED = 6;
const FRICTION = 0.85;
/** Softer strafe on iPhone — screen-half taps felt twitchy. */
const TOUCH_LATERAL_ACCEL = 0.55;
const TOUCH_MAX_LATERAL_SPEED = 4.8;
const TOUCH_FRICTION = 0.88;
/** Match Wort-Hüpfer ball / face size. */
const HEAD_RADIUS = 15;
const EYE_INK = "#1a2030";
/** Hold X-eyes on tree wipeout before reset / game over. */
const DEATH_FACE_MS = 1000;
/** Gate misses on the same target before it counts as an SRS word miss. */
const GATE_MISSES_FOR_WORD_MISS = 2;
/** No trees in this downhill band after the *correct* gate (overrun room). */
const GATE_TREE_CLEAR_AFTER = 240;
/** Extra width past the correct gate poles where trees are kept clear. */
const GATE_TREE_CLEAR_PAD = 56;
/** Rare SkiFree-style lurkers — yeti in trees, ski-man in clearings. */
const LURKER_YETI_CHANCE = 0.14;
const LURKER_SKIER_CHANCE = 0.045;
const LURKER_MIN_GAP = 320;
/** Ski-man stays clear of gate approach and overrun. */
const LURKER_SKIER_GATE_BEFORE = 180;
const LURKER_SKIER_GATE_AFTER = 260;
const LURKER_SKIER_SCALE = 2;
const LURKER_YETI_SCALE = 2.15;
/** Embedded sprites (avoids brittle /img fetch during module cache-busting). */
const LURKER_DATA = {
  skier:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAaCAYAAABctMd+AAAAnUlEQVR42t2WUQ6AMAhDd/TdbEerZriMqDBh8COxX4ZH7dBYilI4L64SUXcoCftDVmA3nDe+O25drTkG3F1xMAEn3DxAeuQB49p2LsEduY8E9PtO5zKcsifpBuxhdeD/4NfhIgT+1NYnYb75qXBho7CdubKqCDnUBOfLAWlwhO57ciThcLNzOAdQ1VoxtBoARVIjHH1RfyffXVjV6wBGXVW1DgoGdAAAAABJRU5ErkJggg==",
  yeti:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAoCAYAAACfKfiZAAAA4klEQVR42u2YURKDMAhEuf+pcrNtP9rRWkKAsrEfOJMxo6P7XAQlIiKQYzvPt21QxLETBsq4xQU4XdJgURUGE3CM8TV+cA1aCJZhmogj8aCIuPAhOJlnX3gXhGr/xYmScC8B8JrjdMwJAG/GodgB7TyiNsExsqntA3h6DmvPqKLaTTXh0oI0rX5K3mvH60v0W6AwDWPi1yc3KiFoAIYg1QXTdnYYQuIMiAZogAa4vQ40QAiC2U15P8VUAFl0RdTOGsEmFixx5jUN8J8AmfQq+0nNNBsw1prSSzXYGDrfCgYD4AFpmXZIIsYfZwAAAABJRU5ErkJggg==",
  ouch:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAZCAYAAABQDyyRAAAA60lEQVR42t2WURLDIAhEuf+lPNr2w9hCWBE1tjPNzP4l7IuwJCJ7Fy795AJQ9XcQmDjaxwHeBVVRfBPCACRBnj+FpgmQYwOZBTmeiC4IPoZbEFgGIS3LJmgldhZECxZkUM95YrEvBmA2vgstaH4eYDI11BN5ALouMvFF5IWsefUQJ1EQAcg+ADPXEPc3J0N5FoBEEhmvxAwUNJUiTmpIRzsBUwvptncuFSI/oFsAfso9QH1zCyA8IamTBjNmAHEL+PPBiehJQygNoB01wLjGcLVGN/I02Pb05sh8PWOATCQ7CRjWD284/IvtAF6pVr1UcC4OTQAAAABJRU5ErkJggg==",
};

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
 *   caseWords?: { word: string, article: string, gender: string, caseGoverns?: ("acc"|"dat")[] }[],
 *   audio?: boolean,
 *   speak?: (text: string) => void,
 *   unlockSpeak?: () => void,
 *   stopSpeak?: () => void,
 *   playFeedback?: (kind: "ok"|"bad"|"retry"|"splat"|"hop") => void,
 *   caseGovernors?: { surface: string, case: "acc"|"dat" }[],
 *   scoreEl?: HTMLElement|null,
 *   livesEl?: HTMLElement|null,
 *   onExit?: () => void,
 * }} options
 */
export function mountArtikelSkier(root, options = {}) {
  const nounWords = Array.isArray(options.words) ? options.words : [];
  const caseWords =
    Array.isArray(options.caseWords) && options.caseWords.length
      ? options.caseWords
      : nounWords;
  const caseGovernors =
    Array.isArray(options.caseGovernors) && options.caseGovernors.length
      ? options.caseGovernors
      : DEFAULT_CASE_GOVERNORS;
  /** Nouns slope uses selected units; Cases slope uses curated Case-topic nouns. */
  function deckWords() {
    return courseMode === "cases" ? caseWords : nounWords;
  }
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
            <p class="skier-lede" data-skier-lede>Ski through the correct gate. Steer or hop to start.</p>
            <label class="skier-speed">
              <select data-skier-speed aria-label="Speed">
                <option value="0.8">Relaxed Rate</option>
                <option value="1.0" selected>Normal Speed</option>
                <option value="1.25">Frantic Pace</option>
              </select>
            </label>
            <div class="skier-course" role="group" aria-label="Course">
              <button type="button" class="skier-course-btn is-active" data-skier-course="nouns">Nouns slope</button>
              <button type="button" class="skier-course-btn" data-skier-course="cases">Cases slope</button>
            </div>
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
  const courseBtns = [
    ...root.querySelectorAll("[data-skier-course]"),
  ];

  /** @type {"nouns"|"cases"} */
  let courseMode = "nouns";
  /** Separate case-article tallies (def vs indef). */
  const caseStats = {
    def: { correct: 0, wrong: 0 },
    indef: { correct: 0, wrong: 0 },
  };
  /**
   * Per-attempt Cases combos for the report (trigger × noun × case row).
   * @type {{
   *   prompt: string,
   *   trigger: string,
   *   noun: string,
   *   lemma: string,
   *   case: string,
   *   parity: string,
   *   number: string,
   *   gender: string,
   *   article: string,
   *   ruleText: string,
   *   result: "correct"|"wrong",
   *   at: string,
   * }[]}
   */
  let caseComboLog = [];
  /**
   * Active Cases-slope trial (null on Nouns slope).
   * @type {ReturnType<typeof buildCaseTrial>|null}
   */
  let caseTrial = null;
  /**
   * Non-blocking center watermark after a correct case gate.
   * @type {null | {
   *   trigger: string,
   *   article: string,
   *   noun: string,
   *   tint: string,
   *   born: number,
   *   ruleMs: number,
   *   nounMs: number,
   * }}
   */
  let ghostText = null;

  function isCasesCourse() {
    return courseMode === "cases";
  }

  function syncCourseUi() {
    for (const btn of courseBtns) {
      const mode = btn.getAttribute("data-skier-course");
      btn.classList.toggle("is-active", mode === courseMode);
    }
  }

  function setCourseMode(mode) {
    courseMode = mode === "cases" ? "cases" : "nouns";
    syncCourseUi();
  }

  function restampUnpassedCaseGates() {
    if (!isCasesCourse() || !caseTrial?.gateArticles?.length) return;
    const labels = caseTrial.gateArticles;
    const n = GENDER_LANES.length;
    for (const row of rows) {
      if (row.passed) continue;
      if (row.gates.length !== n) continue;
      for (let j = 0; j < n; j++) {
        const article = labels[j];
        const g = row.gates[j];
        g.type = GENDER_LANES[j];
        g.article = article;
        g.label = String(article).toUpperCase();
      }
    }
  }

  function attachCaseTrial(noun) {
    if (!isCasesCourse() || !noun) {
      caseTrial = null;
      return;
    }
    const constructions = constructionsForNoun(caseGovernors, noun);
    const pool = constructions.length ? constructions : caseGovernors;
    /** @type {ReturnType<typeof buildCaseTrial>|null} */
    let best = null;
    const recentArts = recentCaseArticles.slice(-ANSWER_SPACING);
    const recentSet = new Set(recentArts);
    const lastArt = recentArts[recentArts.length - 1];
    for (let i = 0; i < 10; i++) {
      const trial = buildCaseTrial(pool, noun);
      if (!best) best = trial;
      const key = String(trial.correctArticle || "").toLowerCase();
      if (key && !recentSet.has(key)) {
        best = trial;
        break;
      }
      if (key && key !== lastArt) best = trial;
    }
    caseTrial = best;
    restampUnpassedCaseGates();
  }

  function clearGhostText() {
    ghostText = null;
  }

  function spawnGhostText(trial) {
    if (!trial) return;
    ghostText = {
      trigger: trial.trigger,
      article: trial.correctArticle,
      noun: trial.noun,
      tint: trial.tint || trial.gender || "masc",
      born: performance.now(),
      ruleMs: 1500,
      nounMs: 980,
      /** One glow pulse on phrase + article at reveal. */
      glowMs: 480,
    };
  }

  /** @param {"correct"|"wrong"} result */
  function noteCaseAttempt(result) {
    if (!isCasesCourse() || !caseTrial) return;
    const bucket =
      caseTrial.parity === "indef" ? caseStats.indef : caseStats.def;
    if (result === "correct") bucket.correct += 1;
    else bucket.wrong += 1;
    caseComboLog.push({
      prompt: `${caseTrial.trigger} ➔ ${caseTrial.noun}`,
      trigger: caseTrial.trigger,
      noun: caseTrial.noun,
      lemma: caseTrial.lemma || caseTrial.noun,
      case: caseTrial.case,
      parity: caseTrial.parity,
      number: caseTrial.number,
      gender: caseTrial.gender,
      article: caseTrial.correctArticle,
      ruleText: caseTrial.ruleText,
      result,
      at: new Date().toISOString(),
    });
  }

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
    nextEl.classList.remove("is-hinted", "is-case-flash");
    nextWordEl.textContent = "";
    nextWordEl.innerHTML = "";
    nextWordEl.title = "";
    if (nextLabelEl) nextLabelEl.textContent = "CORRECT";
  }

  function clearCorrectFlash() {
    hideCorrectChip();
  }

  function genderMarkId(gender) {
    if (gender === "fem") return "feminine";
    if (gender === "neut") return "neuter";
    if (gender === "plur") return "plural";
    if (gender === "kein") return "kein";
    return "masculine";
  }

  /**
   * After a correct gate: Nouns = article + noun; Cases = case name + gender SVG.
   * @param {object} landed
   * @param {{ caseId?: "acc"|"dat", number?: "sg"|"pl", parity?: "def"|"indef", tint?: string }} [opts]
   */
  function showCorrectFlash(landed, opts = {}) {
    if (!nextEl || !nextWordEl || !landed?.word) return;
    const gender = landed.gender || "";
    const tint = opts.tint || gender;
    correctFlash = {
      article: String(landed.article || "").trim(),
      word: String(landed.word || "").trim(),
      gender: tint || gender,
    };
    if (nextLabelEl) nextLabelEl.textContent = "CORRECT";
    nextEl.classList.add("is-correct", "is-hinted");
    nextEl.classList.toggle("is-case-flash", isCasesCourse());
    if (correctFlash.gender) nextEl.dataset.gender = correctFlash.gender;
    else nextEl.removeAttribute("data-gender");

    if (isCasesCourse()) {
      const caseId = opts.caseId || caseTrial?.case || "acc";
      const number = opts.number || caseTrial?.number || "sg";
      const parity = opts.parity || caseTrial?.parity || "def";
      const caseLabel = caseId === "dat" ? "Dative" : "Accusative";
      let mark = genderMarkId(gender);
      if (number === "pl") mark = parity === "indef" ? "kein" : "plural";
      if (mark === "kein" || mark === "plural") {
        nextEl.dataset.gender = mark === "kein" ? "kein" : "plur";
      }
      nextWordEl.innerHTML = genderMarkHtml(mark, caseLabel);
      nextWordEl.title = caseLabel;
    } else {
      const text = `${correctFlash.article} ${correctFlash.word}`.trim();
      nextWordEl.textContent = text;
      nextWordEl.title = text;
    }
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
    const fadeStart = 380;
    const fadeEnd = 90;
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
  /**
   * Per-finger virtual stick state.
   * Fixed origin at touch-down + enter/exit hysteresis (common mobile pattern).
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
  /** @type {{ kind: "skier"|"yeti"|"ouch", x: number, y: number, faceLeft: boolean }[]} */
  let lurkers = [];
  /** @type {{ x: number, y: number, r: number, vy: number, vx: number, a: number }[]} */
  let snowfall = [];

  const lurkerImgs = {
    skier: new Image(),
    yeti: new Image(),
    ouch: new Image(),
  };
  lurkerImgs.skier.src = LURKER_DATA.skier;
  lurkerImgs.yeti.src = LURKER_DATA.yeti;
  lurkerImgs.ouch.src = LURKER_DATA.ouch;

  function seedSnowfall() {
    const n = Math.max(28, Math.min(64, Math.floor(width / 10)));
    snowfall = Array.from({ length: n }, () => ({
      x: Math.random() * Math.max(1, width),
      y: Math.random() * Math.max(1, height),
      r: 1.1 + Math.random() * 2.6,
      vy: 0.4 + Math.random() * 1.1,
      vx: -0.35 + Math.random() * 0.7,
      a: 0.4 + Math.random() * 0.45,
    }));
  }

  function updateSnowfall() {
    if (!snowfall.length || width < 1) return;
    const drift = awaitingInput ? 0.5 : 1 + Math.min(1.2, scrollSpeed * 0.03);
    for (const f of snowfall) {
      f.y += f.vy * drift;
      f.x += f.vx + Math.sin(f.y * 0.025 + f.r) * 0.2;
      if (f.y > height + 6) {
        f.y = -6;
        f.x = Math.random() * width;
      }
      if (f.x < -6) f.x = width + 6;
      else if (f.x > width + 6) f.x = -6;
    }
  }

  function drawSnowfall() {
    if (!snowfall.length) return;
    const theme =
      document.documentElement.getAttribute("data-theme") || "light";
    const flakeFill = theme === "dark" ? "#94a3b8" : "#ffffff";
    for (const f of snowfall) {
      ctx.globalAlpha = f.a;
      ctx.fillStyle = flakeFill;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawLurkers() {
    if (!lurkers.length) return;
    const prevSmooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    for (const l of lurkers) {
      const img = lurkerImgs[l.kind];
      if (!img?.complete || !img.naturalWidth) continue;
      const scale =
        l.kind === "yeti" ? LURKER_YETI_SCALE : LURKER_SKIER_SCALE;
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.save();
      ctx.translate(l.x, l.y);
      // OUCH is a top-down wipeout — don't mirror it.
      if (l.faceLeft && l.kind !== "ouch") ctx.scale(-1, 1);
      // Anchor near feet so they sit among tree trunks.
      ctx.drawImage(img, -dw / 2, -dh + 6, dw, dh);
      ctx.restore();
    }
    ctx.imageSmoothingEnabled = prevSmooth;
  }

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
    const plur =
      cs.getPropertyValue("--de-gold").trim() || "#c9a227";
    const mascInk =
      cs.getPropertyValue("--masc-ink").trim() || "#1d4ed8";
    const femInk =
      cs.getPropertyValue("--fem-ink").trim() || "#b91c1c";
    const neutInk =
      cs.getPropertyValue("--neut-ink").trim() || "#15803d";
    const plurInk =
      cs.getPropertyValue("--ink").trim() || "#334155";
    return {
      masc: { fill: masc, solid: masc, border: mascInk, label: "DER" },
      fem: { fill: fem, solid: fem, border: femInk, label: "DIE" },
      neut: { fill: neut, solid: neut, border: neutInk, label: "DAS" },
      plur: { fill: plur, solid: plur, border: plurInk, label: "PL" },
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
    return sharedProgressSnapshot({ words: deckWords(), pools, seenByKey });
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
      words: deckWords(),
      pools,
      seenByKey,
      targetLabel: "ski target",
    });
    let payload = report.payload;
    let text = report.text;
    if (isCasesCourse()) {
      const comboLines =
        caseComboLog.length > 0
          ? caseComboLog.map((c, i) => {
              const caseLabel = c.case === "dat" ? "dat" : "acc";
              const mark = c.result === "correct" ? "✓" : "✗";
              return `${i + 1}. ${mark} ${c.prompt} → ${c.ruleText} [${caseLabel}/${c.parity}/${c.number}]`;
            })
          : ["— none —"];
      payload = {
        ...payload,
        course: "cases",
        caseArticles: {
          definite: { ...caseStats.def },
          indefinite: { ...caseStats.indef },
        },
        caseCombos: caseComboLog.map((c) => ({ ...c })),
      };
      text = [
        text,
        "",
        "Case articles (this run)",
        `Definite ${caseStats.def.correct}✓ · ${caseStats.def.wrong}✗`,
        `Indefinite ${caseStats.indef.correct}✓ · ${caseStats.indef.wrong}✗`,
        "",
        "Case combos (prompt → rule)",
        ...comboLines,
      ].join("\n");
    } else {
      payload = { ...payload, course: "nouns" };
    }
    lastReportText = text;
    lastReportJson = JSON.stringify(payload, null, 2);
    return payload;
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
  /** Recent gate answers (der/die/das or masc/fem/neut) for spaced selection. */
  let recentAnswers = /** @type {string[]} */ ([]);
  /** Cases slope: recent declined articles (den/dem/…) for trial variety. */
  let recentCaseArticles = /** @type {string[]} */ ([]);

  function rememberAnswerKey(key, into = "answers") {
    const k = String(key || "")
      .trim()
      .toLowerCase();
    if (!k) return;
    if (into === "case") {
      recentCaseArticles.push(k);
      if (recentCaseArticles.length > ANSWER_SPACING * 4) {
        recentCaseArticles = recentCaseArticles.slice(-ANSWER_SPACING * 4);
      }
      return;
    }
    recentAnswers.push(k);
    if (recentAnswers.length > ANSWER_SPACING * 4) {
      recentAnswers = recentAnswers.slice(-ANSWER_SPACING * 4);
    }
  }

  function pickOpts() {
    return {
      recentAnswers,
      // Cases: space by gender lane; nouns: by nominative article.
      answerKeyOf: isCasesCourse()
        ? (w) =>
            String(w?.gender || "")
              .trim()
              .toLowerCase()
        : wordAnswerKey,
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
    attachCaseTrial(next);
    if (isCasesCourse()) {
      rememberAnswerKey(caseTrial?.tint || caseTrial?.gender || next?.gender);
      rememberAnswerKey(caseTrial?.correctArticle, "case");
    } else {
      rememberAnswerKey(wordAnswerKey(next));
    }
    return next;
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
      if (dir === "left" || dir === "right") return true;
    }
    return false;
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
    clearGhostText();
    setProgressVisible(false);
    closeReportSheet();
    syncCourseUi();
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
    const courseFactor = isCasesCourse() ? CASES_SPEED_FACTOR : 1;
    minSpeed = BASE_MIN_SPEED * scale * courseFactor;
    maxSpeed = BASE_MAX_SPEED * scale * courseFactor;
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
    if (gameState !== "start") seedSnowfall();
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
    const row = { y: yPos, gates: [], passed: false };
    const playableWidth = width * 0.85;
    const offsetX = (width - playableWidth) / 2;
    const caseMode =
      isCasesCourse() &&
      caseTrial?.gateArticles?.length === GENDER_LANES.length;
    const laneCount = caseMode ? GENDER_LANES.length : 3;
    const laneWidth = playableWidth / laneCount;
    const pWidth = Math.min(caseMode ? 58 : 80, laneWidth - 6);
    const maxJitter = Math.max(0, (laneWidth - pWidth) / 2);
    const caseLabels = caseMode ? caseTrial.gateArticles : null;

    for (let j = 0; j < laneCount; j++) {
      const jitter = Math.random() * maxJitter * 2 - maxJitter;
      const x =
        offsetX + j * laneWidth + (laneWidth - pWidth) / 2 + jitter;
      const type = caseMode ? GENDER_LANES[j] : GENDER_LANES[j];
      if (caseLabels) {
        const article = caseLabels[j];
        row.gates.push({
          x,
          width: pWidth,
          type,
          article,
          label: String(article).toUpperCase(),
        });
      } else {
        // Nouns slope: masc / fem / neut only.
        row.gates.push({ x, width: pWidth, type: GENDER_LANES[j] });
      }
    }
    rows.push(row);
  }

  /** Target lane: gender (sg) or plur (pl) on Cases; gender on Nouns. */
  function targetGateType() {
    if (isCasesCourse() && caseTrial?.number === "pl") return "plur";
    return player.targetWord?.gender || null;
  }

  /** Correct gate = color / plural lane match. */
  function correctGateInRow(row) {
    const type = targetGateType();
    if (!type) return null;
    return row.gates.find((g) => g.type === type) || null;
  }

  function matchedGateIsCorrect(matchedGate) {
    if (!matchedGate) return false;
    const type = targetGateType();
    return !!type && matchedGate.type === type;
  }

  /**
   * True if a *new* tree would sit in the overrun corridor of a correct gate.
   * Placement-only — never delete trees already on the course (they would pop).
   */
  function treeBlockedAfterCorrectGate(t) {
    for (const row of rows) {
      if (t.y < row.y || t.y > row.y + GATE_TREE_CLEAR_AFTER) continue;
      const gate = correctGateInRow(row);
      if (!gate) continue;
      if (
        t.x >= gate.x - GATE_TREE_CLEAR_PAD &&
        t.x <= gate.x + gate.width + GATE_TREE_CLEAR_PAD
      ) {
        return true;
      }
    }
    return false;
  }

  function populateTrees(amount, startY, endY) {
    const span = Math.max(1, endY - startY);
    for (let i = 0; i < amount; i++) {
      let placed = false;
      for (let attempt = 0; attempt < 8; attempt++) {
        const y = startY + Math.random() * span;
        const x =
          Math.random() > 0.5
            ? Math.random() * (width * 0.12)
            : width - Math.random() * (width * 0.12);
        if (treeBlockedAfterCorrectGate({ x, y })) continue;
        trees.push({
          x,
          y,
          size: 15 + Math.random() * 15,
          color: Math.random() > 0.5 ? "#0f766e" : "#115e59",
        });
        placed = true;
        break;
      }
      if (!placed) {
        // Prefer the edge opposite the correct gate; else nudge past the band.
        let y = startY + Math.random() * span;
        let preferLeft = Math.random() > 0.5;
        for (const row of rows) {
          if (y < row.y || y > row.y + GATE_TREE_CLEAR_AFTER) continue;
          const gate = correctGateInRow(row);
          if (!gate) continue;
          preferLeft = gate.x + gate.width / 2 > width / 2;
          y = row.y + GATE_TREE_CLEAR_AFTER + 20;
          break;
        }
        trees.push({
          x: preferLeft
            ? Math.random() * (width * 0.12)
            : width - Math.random() * (width * 0.12),
          y,
          size: 15 + Math.random() * 15,
          color: Math.random() > 0.5 ? "#0f766e" : "#115e59",
        });
      }
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

  function lurkerTooClose(y) {
    return lurkers.some((l) => Math.abs(l.y - y) < LURKER_MIN_GAP);
  }

  /** True if y sits on the approach or overrun of any gate row. */
  function skierBlockedNearGate(y) {
    for (const row of rows) {
      if (
        y >= row.y - LURKER_SKIER_GATE_BEFORE &&
        y <= row.y + LURKER_SKIER_GATE_AFTER
      ) {
        return true;
      }
    }
    return false;
  }

  /** Occasional static SkiFree skier (clearing) / yeti (tree line). */
  function maybePlaceLurker(startY, endY) {
    if (width < 8) return;
    const span = Math.max(1, endY - startY);

    if (Math.random() < LURKER_YETI_CHANCE) {
      const y = startY + Math.random() * span;
      if (!lurkerTooClose(y)) {
        const left = Math.random() > 0.5;
        lurkers.push({
          kind: "yeti",
          x: left
            ? width * (0.03 + Math.random() * 0.09)
            : width * (0.88 + Math.random() * 0.09),
          y,
          faceLeft: !left,
        });
      }
    }

    if (Math.random() < LURKER_SKIER_CHANCE) {
      for (let attempt = 0; attempt < 8; attempt++) {
        const y = startY + Math.random() * span;
        if (lurkerTooClose(y) || skierBlockedNearGate(y)) continue;
        const leftClearing = Math.random() > 0.5;
        lurkers.push({
          kind: "skier",
          x: leftClearing
            ? width * (0.22 + Math.random() * 0.14)
            : width * (0.64 + Math.random() * 0.14),
          y,
          faceLeft: !leftClearing,
        });
        break;
      }
    }
  }

  function seedTrack() {
    rows = [];
    particles = [];
    trail = [];
    trees = [];
    ramps = [];
    lurkers = [];
    let startY = height + 100;
    for (let i = 0; i < 5; i++) {
      const rowY = startY + i * 600;
      generateGateRow(rowY);
      maybePlaceRamp(rowY);
    }
    populateTrees(30, -100, height + 800);
    maybePlaceLurker(height * 0.4, height + 700);
    maybePlaceLurker(height + 200, height + 900);
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
    noteCaseAttempt("wrong");
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
      let line = `Hints ${hints} · Deck ${deck}`;
      if (isCasesCourse()) {
        line += ` · Def ${caseStats.def.correct}✓/${caseStats.def.wrong}✗ · Indef ${caseStats.indef.correct}✓/${caseStats.indef.wrong}✗`;
      }
      summaryEl.textContent = line;
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
    const deck = deckWords();
    if (!deck.length) {
      endGame();
      return;
    }
    if (animationId) cancelAnimationFrame(animationId);
    resize();
    pools = initClimberPools(
      deck.map((w) => ({ ...w, correct: 0, wrong: 0 }))
    );
    seenByKey.clear();
    caseStats.def.correct = 0;
    caseStats.def.wrong = 0;
    caseStats.indef.correct = 0;
    caseStats.indef.wrong = 0;
    caseComboLog = [];
    clearGhostText();
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
    recentAnswers = [];
    recentCaseArticles = [];
    player.targetWord = getNextWord();
    queueUpcomingWord();
    seedTrack();
    seedSnowfall();
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
    if (!deckWords().length) {
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
    clearGhostText();
    if (!player.targetWord) {
      upcomingWord = null;
      player.targetWord = getNextWord();
    } else {
      noteWordInPlay(player.targetWord);
      attachCaseTrial(player.targetWord);
    }
    queueUpcomingWord();
    seedTrack();
    seedSnowfall();
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
      updateSnowfall();
      return;
    }
    if (gameState !== "playing") return;

    updateSnowfall();

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

    const touchSteer = isTouchApple && touchSteerActive();
    const accel = touchSteer ? TOUCH_LATERAL_ACCEL : LATERAL_ACCEL;
    const maxLat = touchSteer ? TOUCH_MAX_LATERAL_SPEED : MAX_LATERAL_SPEED;
    const friction = touchSteer ? TOUCH_FRICTION : FRICTION;
    if (keys.left) player.vx -= accel;
    if (keys.right) player.vx += accel;
    player.vx *= friction;
    if (player.vx > maxLat) player.vx = maxLat;
    if (player.vx < -maxLat) player.vx = -maxLat;
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
    lurkers.forEach((l) => {
      l.y -= scrollSpeed;
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

    // Ski over the clearing ski-man → classic OUCH wipeout (no life lost).
    if (!awaitingInput && player.jumpZ < 10) {
      for (const l of lurkers) {
        if (l.kind !== "skier") continue;
        const dx = player.x - l.x;
        const dy = player.y - (l.y - 18);
        if (Math.hypot(dx, dy) < player.radius + 18) {
          l.kind = "ouch";
          playFeedback("splat");
          createParticles(l.x, l.y - 10, "#f8fafc", 14);
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

          if (matchedGateIsCorrect(matchedGate)) {
            score += 1;
            setScoreDisplay(score);
            const landed = player.targetWord;
            noteCaseAttempt("correct");
            if (isCasesCourse() && caseTrial) {
              spawnGhostText(caseTrial);
              // Cases TTS: only the case-forcing phrase + article (e.g. "mit dem").
              if (audioOn) speak(caseTrial.ruleText);
            } else {
              speakWord(landed.article, landed.word);
            }
            playFeedback("ok");
            setFace("happy", 360);
            landed.correct = (landed.correct || 0) + 1;
            if (pools.graduatedPool.includes(landed)) {
              landed.postGradCorrect = (landed.postGradCorrect || 0) + 1;
            }
            markClimberCorrect(pools, landed);
            updateProgressUi();
            showCorrectFlash(landed, {
              caseId: caseTrial?.case,
              number: caseTrial?.number,
              parity: caseTrial?.parity,
              tint: caseTrial?.tint,
            });
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
        const fromY = highestTreeY + 50;
        const toY = highestTreeY + 300;
        populateTrees(8, fromY, toY);
        maybePlaceLurker(fromY, toY);
      }
    }

    rows = rows.filter((r) => r.y > -100);
    trees = trees.filter((t) => t.y > -50);
    lurkers = lurkers.filter((l) => l.y > -60);
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
        const style = colors[g.type] || colors.masc;
        ctx.fillStyle = style.border;
        ctx.beginPath();
        ctx.roundRect(g.x, r.y + 4, g.width, 20, 8);
        ctx.fill();
        ctx.fillStyle = style.solid;
        ctx.beginPath();
        ctx.roundRect(g.x, r.y, g.width, 20, 8);
        ctx.fill();
        ctx.fillStyle = "#fff";
        const label = g.label || style.label;
        const fontSize = label && label.length > 3 ? 11 : 14;
        ctx.font = displayFont(900, fontSize);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, g.x + g.width / 2, r.y + 10);
      });
    });

    // Lurkers sit in the tree line (under trees so foliage can cover them).
    drawLurkers();

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

    // Behind the skier so flakes don't sit on top of the player.
    drawSnowfall();

    const theme =
      document.documentElement.getAttribute("data-theme") || "light";

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
    ctx.strokeStyle = theme === "dark" ? "#cbd5e1" : "#334155";
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
      const bubbleH = 30;
      const bubbleY =
        player.y - player.jumpZ - HEAD_RADIUS - bubbleH - 10;
      const themeNow =
        document.documentElement.getAttribute("data-theme") || "light";
      const hiddenFill = themeNow === "dark" ? "#0d1117" : "#1a2030";
      const showHint = player.targetWord.showHint !== false;
      const genderStyle = colors[player.targetWord.gender] || colors.masc;

      if (isCasesCourse() && caseTrial) {
        // Micro-prompt: trigger ➔ noun; gender/plural color fades when showHint is off.
        const trigger = `${caseTrial.trigger} ➔ `;
        const noun = caseTrial.noun;
        const nounStyle = colors[caseTrial.tint] || genderStyle;
        const nounFill = showHint ? nounStyle.solid : "#ffffff";
        ctx.font = displayFont(700, 15);
        const triggerW = ctx.measureText(trigger).width;
        const nounW = ctx.measureText(noun).width;
        const padX = 12;
        const bw = Math.min(width - 16, triggerW + nounW + padX * 2);
        const bx = player.x - bw / 2;
        ctx.fillStyle = hiddenFill;
        ctx.beginPath();
        ctx.roundRect(bx, bubbleY, bw, bubbleH, bubbleH / 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        const textX = player.x - (triggerW + nounW) / 2;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(trigger, textX, bubbleY + bubbleH / 2);
        ctx.fillStyle = nounFill;
        ctx.fillText(noun, textX + triggerW, bubbleY + bubbleH / 2);
      } else {
        ctx.font = displayFont(700, 18);
        ctx.textAlign = "center";
        const wordWidth = ctx.measureText(player.targetWord.word).width;
        const bubbleColor = showHint ? genderStyle.solid : hiddenFill;
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

    drawGhostText(colors);
  }

  function drawGhostText(colors) {
    if (!ghostText) return;
    const age = performance.now() - ghostText.born;
    const maxLife = Math.max(ghostText.ruleMs, ghostText.nounMs);
    if (age >= maxLife) {
      ghostText = null;
      return;
    }
    const ruleT = Math.min(1, age / ghostText.ruleMs);
    const nounT = Math.min(1, age / ghostText.nounMs);
    // Ease out — noun dies faster (higher t sooner → lower alpha).
    const ruleAlpha = Math.max(0, 1 - ruleT * ruleT);
    const nounAlpha = Math.max(0, 1 - nounT * nounT * (0.85 + nounT));
    const scale = 0.92 + Math.min(1, age / 280) * 0.28;
    const tint = colors[ghostText.tint] || colors.masc;
    const cx = width / 2;
    const cy = height * 0.42;
    const artUp = String(ghostText.article || "").toUpperCase();
    const ruleLeft = `${ghostText.trigger} `;
    const theme =
      document.documentElement.getAttribute("data-theme") || "light";
    const nounColor =
      theme === "dark" ? "rgba(148,163,184,1)" : "rgba(100,116,139,1)";
    const glowMs = ghostText.glowMs || 0;
    const glow =
      glowMs > 0 && age < glowMs
        ? Math.sin(Math.PI * (age / glowMs))
        : 0;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = displayFont(800, 28);
    const leftW = ctx.measureText(ruleLeft).width;
    const artW = ctx.measureText(artUp).width;
    const totalW = leftW + artW;
    const x0 = -totalW / 2;

    ctx.globalAlpha = ruleAlpha * 0.88;
    ctx.fillStyle = tint.solid;
    ctx.textAlign = "left";
    if (glow > 0.02) {
      ctx.shadowColor = tint.solid;
      ctx.shadowBlur = 6 + glow * 22;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    ctx.fillText(ruleLeft, x0, 0);
    ctx.font = displayFont(900, 30);
    ctx.fillText(artUp, x0 + leftW, 0);
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";

    ctx.globalAlpha = nounAlpha * 0.75;
    ctx.fillStyle = nounColor;
    ctx.font = displayFont(500, 22);
    ctx.textAlign = "center";
    ctx.fillText(ghostText.noun, 0, 34);

    ctx.restore();
    ctx.globalAlpha = 1;
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
      // Drop to neutral only if we fell below the hold threshold.
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

    // Confirm flips briefly so one noisy sample can't reverse you.
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
    // Tap top band = hop; elsewhere wait for stick to leave the enter deadzone.
    canvasPointers.set(e.pointerId, y < h * 0.28 ? "up" : null);
    syncKeysFromCanvasPointers();
  }

  function onCanvasPointerMove(e) {
    if (gameState !== "playing" || !canvasPointers.has(e.pointerId)) return;
    e.preventDefault();
    // Use the latest sample only — coalesced bursts were fighting hysteresis.
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
  for (const btn of courseBtns) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      setCourseMode(btn.getAttribute("data-skier-course") || "nouns");
    });
  }
  playBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    primeSpeak();
    initGame();
  });
  root.querySelector("[data-skier-retry]")?.addEventListener("click", (e) => {
    e.preventDefault();
    showStartScreen();
  });
  syncCourseUi();
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
