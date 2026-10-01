/**
 * Schnapp Phase 1 design mock — hub + Numbers/Nouns/Sounds shells.
 * Numbers quiz answers come from the Phase 2 deterministic engine.
 */

import {
  createNounArticleExercise,
  createNounAssociationExercise,
  createNounCategoryGenderRecognitionExercise,
  createNounCategoryArticleApplicationExercise,
  createNounCategoryGenderImposterExercise,
  createNounCategorySentenceValidationExercise,
  createNounWugExercise,
  createNounPluralExercise,
  createNumberConstructionExercise,
  createDecimalConstructionExercise,
  createMoneyConstructionExercise,
  createFractionConstructionExercise,
  createMixedFractionConstructionExercise,
  createClockConstructionExercise,
  createDigitalTimeConstructionExercise,
  createDurationConstructionExercise,
  createOrdinalConstructionExercise,
  createOrdinalAmConstructionExercise,
  createWeekdayConstructionExercise,
  createMonthConstructionExercise,
  createCalendarDateConstructionExercise,
  createMeasureConstructionExercise,
  submitExerciseAttempt,
} from "../engine/exercise/index.js?v=20260930-nouns13";
import {
  associationLemmas,
  wugForms,
  lemmasWithPlural,
  LEXICON,
  ARTICLES,
  GENDER_CATEGORIES,
  practiceCategories,
  categoryArticleItems,
  categoryValidationItems,
} from "../engine/nouns/index.js?v=20260930-nouns13";
import {
  cardinalForm,
  parseCardinalForm,
  constructionParts,
  decimalAnalysis,
  parseDecimalForm,
  parseDecimalWritten,
  parseMoneyForm,
  parseFractionForm,
  parseOrdinalForm,
  clockFormAlternates,
  clockForm,
  digitalTimeForm,
} from "../engine/numbers/index.js?v=20260930-ref1";
import {
  NUMBERS_TOPICS,
  getNumbersTopic,
  getNumbersStep,
  getNumbersMode,
  modesForStep,
  introModeForStep,
  isNumbersCellPlayable,
  suggestNumbersFocus,
  formatNumbersFocusLabel,
  mixableSteps,
} from "./numbers-curriculum.js?v=20260930-ref1";
import {
  GENDER_SHORTCUTS_UNITS,
  NOUNS_STUB_TOPICS,
  getGenderShortcutsUnit,
  familiesForUnit,
  introFamilyForUnit,
  unitIdForFamily,
} from "./nouns-curriculum.js?v=20260929-dmo4";
import { DECIMAL_POOLS } from "./decimals-pools.js?v=20260930-ref1";
import { FRACTION_POOLS } from "./fractions-pools.js?v=20260929-dmo4";
import { TIME_POOLS } from "./time-pools.js?v=20260929-dmo4";
import { DATE_POOLS } from "./dates-pools.js?v=20260929-dmo4";
import { MEASURE_POOLS } from "./measure-pools.js?v=20260929-dmo4";
import { ORDINAL_POOLS } from "./ordinals-pools.js?v=20260929-dmo4";
import {
  makeClozeExercise,
  makeProofreadExercise,
  makeSentenceOrdinalExercise,
  visualForMeta,
  canonicalFormForMeta,
  makeNounProofreadChoices,
  makeNounReverseChoices,
} from "./quiz-extras.js?v=20260930-numui3";
import { mountNavCarousel } from "./nav-carousel.js?v=20260930-vocab17";
import {
  dealExercise,
  WEAK_ACCURACY,
} from "../engine/dealer.js?v=20260929-dmo8";

import {
  buildSoundsChart,
  buildNumbersChart,
  buildNounsChart,
} from "./reference-charts.js?v=20260930-ref1";
import {
  renderReferenceEntryHtml,
  renderReferenceLandingHtml,
  wireReferenceNav,
  referenceIdForPracticeContext,
} from "./reference-ui.js?v=20260930-ref1";
import {
  buildHelpModel,
  renderHelpSheetHtml,
  wireHelpSheet,
} from "./help-sheet.js?v=20261001-help7";
import {
  mountVocabularyPanel,
  topicHasVocabulary,
  vocabAreasFromCurriculumTopics,
} from "./vocabulary-ui.js?v=20260930-vocab17";
import {
  vocabularyAreas,
  curriculumTopicToVocabArea,
} from "./generated/vocabulary.js?v=20260930-vocab17";
import {
  emptyPlaylistState,
  buildNumbersCatalog,
  buildNounsCatalog,
  catalogUnitIds,
  mountSessionPlaylistDropdown,
  enabledQuizEntries,
  enabledVocabAreas,
  enabledNounFamilies,
  playlistHasQuiz,
  playlistHasVocab,
} from "./session-playlist.js?v=20260930-vocab17";

/** Bootstrap Icons (outline) — https://icons.getbootstrap.com */
const BI_PATHS = {
  chevronLeft:
    '<path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>',
  chevronRight:
    '<path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>',
  book: '<path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>',
  lightbulb:
    '<path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13a.5.5 0 0 1 0 1 .5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1 0-1 .5.5 0 0 1 0-1 .5.5 0 0 1-.46-.302l-.761-1.77a2 2 0 0 0-.453-.618A5.98 5.98 0 0 1 2 6m6-5a5 5 0 0 0-3.479 8.592c.263.254.514.564.676.941L5.83 12h4.342l.632-1.467c.162-.377.413-.687.676-.941A5 5 0 0 0 8 1"/>',
};

function biIcon(name) {
  const path = BI_PATHS[name];
  if (!path) return "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">${path}</svg>`;
}

function hydrateIconButtons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((btn) => {
    const name = btn.dataset.icon;
    if (!BI_PATHS[name]) return;
    btn.classList.add("btn-icon");
    btn.innerHTML = biIcon(name);
  });
}

/* —— Theme (Light / Dark / System) —— */

const THEME_KEY = "schnapp-theme";

function readThemePref() {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch (_) {
    /* ignore */
  }
  return "system";
}

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolvedTheme(pref = readThemePref()) {
  if (pref === "dark") return "dark";
  if (pref === "light") return "light";
  return systemPrefersDark() ? "dark" : "light";
}

function applyTheme(pref = readThemePref()) {
  const resolved = resolvedTheme(pref);
  if (resolved === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  document.documentElement.style.colorScheme = resolved;
  syncThemeMenu(pref);
}

function syncThemeMenu(pref = readThemePref()) {
  document.querySelectorAll("[data-theme-choice]").forEach((btn) => {
    const on = btn.dataset.themeChoice === pref;
    btn.setAttribute("aria-checked", String(on));
    const mark = btn.querySelector(".menu-check-mark");
    if (mark) mark.textContent = on ? "✓" : "";
  });
}

function setThemePref(pref) {
  try {
    localStorage.setItem(THEME_KEY, pref);
  } catch (_) {
    /* ignore */
  }
  applyTheme(pref);
}

function initTheme() {
  applyTheme(readThemePref());
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => {
    if (readThemePref() === "system") applyTheme("system");
  };
  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", onChange);
  } else if (typeof mq.addListener === "function") {
    mq.addListener(onChange);
  }
}

/* —— Soft answer feedback tones (Web Audio; no asset files) —— */

const SFX_KEY = "schnapp-sfx";
let feedbackAudioCtx = null;

function readSfxEnabled() {
  try {
    const v = localStorage.getItem(SFX_KEY);
    if (v === "0" || v === "off" || v === "false") return false;
  } catch (_) {
    /* ignore */
  }
  return true;
}

function setSfxEnabled(on) {
  try {
    localStorage.setItem(SFX_KEY, on ? "1" : "0");
  } catch (_) {
    /* ignore */
  }
  syncSfxMenu(on);
}

function syncSfxMenu(on = readSfxEnabled()) {
  document.querySelectorAll("[data-sfx-toggle]").forEach((btn) => {
    btn.setAttribute("aria-checked", String(on));
    const mark = btn.querySelector(".menu-check-mark");
    if (mark) mark.textContent = on ? "✓" : "";
  });
}

function getFeedbackAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!feedbackAudioCtx) feedbackAudioCtx = new AC();
  if (feedbackAudioCtx.state === "suspended") {
    feedbackAudioCtx.resume().catch(() => {});
  }
  return feedbackAudioCtx;
}

/**
 * Short UI chimes — positive ascending, soft miss / retry.
 * @param {"ok"|"bad"|"retry"} kind
 */
function playFeedbackSound(kind) {
  if (!readSfxEnabled()) return;
  const ctx = getFeedbackAudio();
  if (!ctx) return;

  const run = () => {
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.065;
    master.connect(ctx.destination);

    const tone = (freq, t0, dur, type = "sine") => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(1, t0 + 0.014);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain);
      gain.connect(master);
      osc.start(t0);
      osc.stop(t0 + dur + 0.03);
    };

    if (kind === "ok") {
      // Soft major third lift
      tone(523.25, now, 0.11);
      tone(659.25, now + 0.085, 0.15);
    } else if (kind === "retry") {
      tone(349.23, now, 0.09, "triangle");
    } else {
      // Gentle descending pair — not harsh
      tone(277.18, now, 0.1, "triangle");
      tone(220.0, now + 0.09, 0.14, "triangle");
    }
  };

  // Resume may be async — schedule tones only after the context is running
  // so delayed flashes (post-click) still produce audible feedback.
  if (ctx.state === "suspended") {
    void ctx.resume().then(run).catch(() => {});
  } else {
    run();
  }
}

function initSfx() {
  syncSfxMenu();
}
const territories = [
  {
    id: "sounds",
    name: "Sounds",
    blurb: "Spelling ↔ sound, syllables, stress.",
    status: "playable",
    statusLabel: "Playable",
  },
  {
    id: "numbers",
    name: "Numbers",
    blurb: "Build deterministic number systems. Learn the app’s hands.",
    status: "playable",
    statusLabel: "Playable",
    suggested: true,
  },
  {
    id: "nouns",
    name: "Nouns",
    blurb: "Gender Shortcuts, Plurals, Articles — patterns vs lexical facts.",
    status: "playable",
    statusLabel: "Playable",
  },
  {
    id: "case",
    name: "Case",
    blurb: "Nominative → accusative → dative transformations.",
    status: "preview",
    statusLabel: "Coming soon",
  },
  {
    id: "phrases",
    name: "Phrases",
    blurb: "Adjective endings. Energy Transfer as metaphor only.",
    status: "preview",
    statusLabel: "Coming soon",
  },
  {
    id: "syntax",
    name: "Syntax",
    blurb: "V2 and preferred TMP ordering as a pattern.",
    status: "preview",
    statusLabel: "Coming soon",
  },
  {
    id: "fluency",
    name: "Fluency",
    blurb: "Produce with novel words. Wug tests.",
    status: "preview",
    statusLabel: "Coming soon",
  },
  {
    id: "reading",
    name: "Reading",
    blurb: "Context, chunks, tap-to-translate.",
    status: "preview",
    statusLabel: "Coming soon",
  },
];

const comingCopy = {
  case: "Visible masculine accusative first — then the quieter cells.",
  phrases: "Energy Transfer visualization without becoming the grammar model.",
  syntax: "Sentence pieces that snap into V2-legal orders.",
  fluency: "Generalization exercises once Nouns and Case are real.",
  reading: "Verified passages only — no silent generated curriculum.",
};

/** Sounds chart — built from generated Reference Markdown. */
const soundsChart = buildSoundsChart();

/** Territory briefings = Introduce / Demonstrate before practice (spec learning loop). */
const briefings = {
  sounds: {
    title: "German sound foundation",
    lede: "Learn to hear and decode common German spelling→sound patterns before you lean on vocabulary drills.",
    blocks: [
      {
        heading: "What you’ll practice",
        html: `<ul>
          <li><strong>Syllables</strong> — spelling on top, respelling under; CAPS = stress</li>
          <li><strong>Discriminate</strong> — hear a contrast, pick the match (ü/u, schön/schon)</li>
        </ul>`,
      },
      {
        heading: "How to read a syllable card",
        html: `<p>Orthography above, English-friendly respelling below. Stress is marked with CAPS and a underline — not with IPA.</p>`,
        example: true,
      },
      {
        heading: "Full chart",
        html: `<p>Vowels, umlauts, diphthongs, consonants, and special cases are in the sound chart — open it whenever you need the map.</p>`,
      },
      {
        heading: "What this is not",
        html: `<ul>
          <li>Browser TTS is a helper, not the linguistic authority</li>
          <li>No microphone grading — listening and decoding first</li>
          <li>Respelling is approximate; regional voices vary</li>
        </ul>`,
      },
    ],
  },
  numbers: {
    title: "Numbers are algorithmic German",
    lede: "Build forms you can derive. Open the number chart for base words, teens, tens, and the ones+und+tens compound rule — tap any form to hear it.",
    blocks: [
      {
        heading: "Vocabulary",
        html: `<ul class="gender-key">
          <li><span class="g-tag g-fem">die</span> <strong>Zahl</strong>, -en — number</li>
          <li><span class="g-tag g-fem">die</span> <strong>Ziffer</strong>, -n — digit</li>
          <li><strong>null</strong> — zero <span class="brief-note">(no article)</span></li>
        </ul>`,
      },
      {
        heading: "What you’ll use in practice",
        html: `<ul>
          <li><strong>Topics</strong> — Cardinals through Ordinals (all Numbers topics playable except phrase-context stubs)</li>
          <li><strong>Cardinals steps</strong> — 0–12, Teens, Tens, Compounds, Hundreds+</li>
          <li><strong>Decimals steps</strong> — Komma reading, place value, Euro / Euro+Cent</li>
          <li><strong>Fractions / Time</strong> — halb→mixed; Uhr / halb / Viertel / minutes / 24h / durations</li>
          <li><strong>Modes</strong> — Build, Listen, Convert (per step)</li>
          <li>Assisted / Core change support, not the German truth</li>
        </ul>`,
      },
      {
        heading: "How practice works",
        html: `<ul>
          <li>Tap a chip to fill the next slot; tap a filled slot to clear it</li>
          <li>Hint / Reference are scaffolding — not failures</li>
        </ul>`,
      },
    ],
  },
  nouns: {
    title: "Gender Shortcuts",
    lede: "Browse by Learn unit: Suffixes (Wugs / Real Words) and Categories (Gender Recognition → Article → Imposter → Sentence). Categories train gender discrimination from semantic shortcuts — not suffix drills. Plurals and Articles are separate Nouns topics coming next.",
    blocks: [
      {
        heading: "Learn units",
        html: `<ul>
          <li><strong>Suffixes</strong> — morphological cues; Learn opens the gender/suffix chart</li>
          <li><strong>Categories</strong> — semantic associations; Learn opens the Categories tab</li>
        </ul>`,
      },
      {
        heading: "Practice families (under a unit)",
        html: `<ul>
          <li><strong>Wugs</strong> / <strong>Real Words</strong> — under Suffixes</li>
          <li><strong>Gender Recognition</strong> / <strong>Article Application</strong> / <strong>Gender Imposter</strong> / <strong>Sentence Validation</strong> — under Categories</li>
        </ul>`,
      },
      {
        heading: "Nominative frame",
        html: `<ul>
          <li><strong>Singular:</strong> <span class="g-tag g-masc">der</span> / <span class="g-tag g-fem">die</span> / <span class="g-tag g-neut">das</span> mark noun gender</li>
          <li><strong>Plural:</strong> article always <strong>die</strong> — number, not feminine (Plurals topic)</li>
          <li>Articles as forms bridging to Case land later</li>
        </ul>`,
      },
      {
        heading: "Gender channels",
        html: `<ul class="gender-key">
          <li><span class="g-tag g-masc">der</span> <span class="g-tag g-masc">M</span> — masculine · bold / blue</li>
          <li><span class="g-tag g-fem">die</span> <span class="g-tag g-fem">F</span> — feminine · italic / round / pink <em>(singular only)</em></li>
          <li><span class="g-tag g-neut">das</span> <span class="g-tag g-neut">N</span> — neuter · dotted underline / green</li>
        </ul>`,
      },
    ],
  },
};

/** Nouns chart — built from generated Reference Markdown. */
const nounsChart = buildNounsChart();

/** Numbers chart — built from generated Reference Markdown. */
const numbersChart = buildNumbersChart();

/** Look up an exact Numbers chart row (guides + stress). */
function numbersChartParts(n) {
  for (const key of ["hundreds", "teens", "tens", "compounds", "base", "komma", "money", "fractions", "time", "dates", "measure", "ordinals"]) {
    const row = (numbersChart[key] || []).find((r) => Number(r.n) === n || String(r.n) === String(n));
    if (row?.parts?.length) return row.parts;
  }
  return null;
}

/** Compound ones stem with chart-style CAPS guide (eins → ein). */
function compoundOnesGuidePart(onesDigit) {
  if (onesDigit === 1) return { text: "ein", guide: "INE", stress: true };
  const base = numbersChartParts(onesDigit);
  if (!base?.length) return null;
  if (base.length === 1) {
    return {
      text: base[0].text,
      guide: String(base[0].guide || base[0].text).toUpperCase(),
      stress: true,
    };
  }
  // e.g. sieben → one morph token matching engine segments
  return {
    text: base.map((p) => p.text).join(""),
    guide: base.map((p) => p.guide || p.text).join(""),
    stress: true,
  };
}

/**
 * Phonetic answer-key beats (morph split).
 * Composes chart rows so Listen/compounds aren’t stuck without guides.
 */
function synthesizeMorphGuides(n) {
  const exact = numbersChartParts(n);
  if (exact) return exact;
  if (!Number.isInteger(n) || n < 0 || n > 1000) return null;

  if (n === 1000) {
    return [
      { text: "ein", guide: "ine" },
      { text: "tausend", guide: "TOW-zent", stress: true },
    ];
  }

  if (n >= 100) {
    const h = Math.floor(n / 100);
    const rem = n % 100;
    const hStem =
      h === 1
        ? { text: "ein", guide: "ine" }
        : numbersChartParts(h)?.[0] || {
            text: String(h),
            guide: String(h),
          };
    const head = [
      { ...hStem, text: h === 1 ? "ein" : hStem.text },
      { text: "hundert", guide: "HOON-dert", stress: true },
    ];
    if (rem === 0) return head;
    const remParts = synthesizeMorphGuides(rem);
    return remParts ? [...head, ...remParts] : head;
  }

  if (n > 99) return null;

  const tensDigit = Math.floor(n / 10);
  const onesDigit = n % 10;
  const tensParts = numbersChartParts(tensDigit * 10);
  if (!tensParts) return null;
  if (onesDigit === 0) return tensParts;

  const onesPart = compoundOnesGuidePart(onesDigit);
  if (!onesPart) return null;
  return [onesPart, { text: "und", guide: "oont" }, ...tensParts];
}

/**
 * Karaoke guides from the Numbers chart when the grain matches the chart split.
 * Listen / morph: always synthesize so every pool value has phonetic beats.
 */
function numberAnswerParts(n, grain) {
  if (grain === "morph" || grain === "listen") {
    return synthesizeMorphGuides(n);
  }
  // Construction: teens share morph split; other grains only exact chart rows.
  if (n >= 13 && n <= 19) return numbersChartParts(n);
  return null;
}

/** English glosses for Assisted scaffolding only — not German linguistic truth. */
const EN_ONES = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];
const EN_TENS = [
  null,
  null,
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

function englishCardinal(n) {
  if (n < 20) return EN_ONES[n];
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    if (ones === 0) return EN_TENS[tens];
    return `${EN_TENS[tens]}-${EN_ONES[ones]}`;
  }
  if (n === 1000) return "one thousand";
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const rem = n % 100;
    const hWord = `${EN_ONES[h]} hundred`;
    if (rem === 0) return hWord;
    return `${hWord} ${englishCardinal(rem)}`;
  }
  return String(n);
}

/**
 * Full value sets per Cardinals step pool key — single source for Build / Listen / Convert / Mix.
 */
function cardinalStepValues(poolKey) {
  if (poolKey === "base") return Array.from({ length: 13 }, (_, value) => value);
  if (poolKey === "teens") {
    return Array.from({ length: 7 }, (_, i) => 13 + i);
  }
  if (poolKey === "tens") return [20, 30, 40, 50, 60, 70, 80, 90];
  if (poolKey === "compounds") {
    return Array.from({ length: 79 }, (_, i) => 21 + i).filter(
      (n) => n % 10 !== 0
    );
  }
  if (poolKey === "hundreds") {
    // Full Hundreds+: every integer 100–1000 (engine range).
    return Array.from({ length: 901 }, (_, i) => 100 + i);
  }
  return Array.from({ length: 100 }, (_, value) => value);
}

function cardinalStepGrain(poolKey) {
  return poolKey === "tens" ? "morph" : "construction";
}

function metaFromValue(value, poolKey) {
  return {
    value,
    english: englishCardinal(value),
    grain: cardinalStepGrain(poolKey),
  };
}

/**
 * Quiz pools by Cardinals step — full deterministic ranges, shared by every quiz mode.
 */
const numberPools = Object.fromEntries(
  ["base", "teens", "tens", "compounds", "hundreds"].map((key) => [
    key,
    cardinalStepValues(key).map((value) => metaFromValue(value, key)),
  ])
);

Object.assign(
  numberPools,
  DECIMAL_POOLS,
  FRACTION_POOLS,
  TIME_POOLS,
  DATE_POOLS,
  MEASURE_POOLS,
  ORDINAL_POOLS
);

const WRITTENISH_KINDS = new Set([
  "decimal",
  "money",
  "fraction",
  "mixed-fraction",
  "clock",
  "digital-time",
  "duration",
  "ordinal",
  "ordinal-am",
  "weekday",
  "month",
  "calendar-date",
  "measure",
]);

function isWrittenishMeta(meta) {
  return meta && WRITTENISH_KINDS.has(meta.kind);
}

/** Values allowed in Listen for the current Cardinals step or mix (cardinal digits only). */
function listenValuePool() {
  if (state.numbersSessionKind === "mix") {
    return mixListenValuesFromEntries(currentMixEntries());
  }
  if (state.numbersTopic !== "cardinals") return [];
  const step = getNumbersStep(state.numbersTopic, state.numbersStep);
  return cardinalStepValues(step?.pool || "compounds");
}

/** @returns {{ topicId: string, stepId: string }[]} */
function currentMixEntries() {
  if (Array.isArray(state.numbersMixEntries) && state.numbersMixEntries.length) {
    return state.numbersMixEntries;
  }
  const topicId = state.numbersMixTopic || "cardinals";
  if (topicId === "multi") return [];
  return (state.numbersMixSteps || []).map((stepId) => ({ topicId, stepId }));
}

function mixListenValuesFromEntries(entries) {
  const set = new Set();
  for (const { topicId, stepId } of entries || []) {
    if (topicId !== "cardinals") continue;
    const step = getNumbersStep(topicId, stepId);
    const key = step?.pool;
    if (!key) continue;
    for (const v of cardinalStepValues(key)) set.add(v);
  }
  return [...set];
}

function mixListenValues(topicId, stepIds) {
  return mixListenValuesFromEntries(
    (stepIds || []).map((stepId) => ({ topicId, stepId }))
  );
}

function buildMixDeck(topicId, stepIds, modeId) {
  return buildMixDeckFromEntries(
    (stepIds || []).map((stepId) => ({ topicId, stepId })),
    modeId
  );
}

function buildMixDeckFromEntries(entries, modeId) {
  const items = [];
  const caps = navCaps();
  const resolved = mixModeForCaps(modeId);
  const wantBuild = resolved === "build" || resolved === "either";
  const wantListen =
    capEnabled(caps.audio) && (resolved === "listen" || resolved === "either");
  const wantConvert =
    capEnabled(caps.keyboard) &&
    (resolved === "convert" || resolved === "either");
  const wantEitherExtras = resolved === "either";
  const wantNamed = (id) => {
    if (capExclusive(caps.keyboard)) return id === "proofread";
    if (capExclusive(caps.audio)) return false;
    return resolved === id || wantEitherExtras;
  };
  // Cross-topic Play mixes: cap each step×mode so huge pools (decimals)
  // don’t drown out Time / Cardinals / etc.
  const multiTopic = new Set((entries || []).map((e) => e.topicId)).size > 1;
  const perBucket = multiTopic ? 16 : Infinity;

  const take = (list) => {
    if (list.length <= perBucket) return list;
    return shuffle([...list]).slice(0, perBucket);
  };

  for (const { topicId, stepId } of entries || []) {
    const modes = filterModesForCaps(modesForStep(topicId, stepId));
    const pool =
      numberPools[stepId] || numberPools[getNumbersStep(topicId, stepId)?.pool];
    if (!pool) continue;
    if (wantBuild && modes.some((m) => m.id === "build")) {
      for (const meta of take(pool)) {
        items.push({ ...meta, stepId, mode: "build", topicId });
      }
    }
    if (wantListen && modes.some((m) => m.id === "listen")) {
      if (topicId === "cardinals") {
        for (const value of take(mixListenValues(topicId, [stepId]))) {
          items.push({
            kind: "cardinal",
            value,
            english: englishCardinal(value),
            grain: "construction",
            stepId,
            mode: "listen",
            topicId,
          });
        }
      } else {
        for (const meta of take(pool)) {
          items.push({ ...meta, stepId, mode: "listen", topicId });
        }
      }
    }
    if (wantConvert && modes.some((m) => m.id === "convert")) {
      for (const meta of take(pool)) {
        items.push({ ...meta, stepId, mode: "convert", topicId });
      }
    }
    for (const extra of ["cloze", "proofread", "visual", "sentence"]) {
      if (!wantNamed(extra)) continue;
      if (!modeAllowedByCaps(extra)) continue;
      if (!modes.some((m) => m.id === extra)) continue;
      for (const meta of take(pool)) {
        items.push({ ...meta, stepId, mode: extra, topicId });
      }
    }
  }
  return shuffle(items);
}

function ensureMixDeck() {
  const mode = mixModeForCaps(state.numbersMixMode);
  state.numbersMixMode = mode;
  const entries = currentMixEntries();
  const caps = navCaps();
  const entryKey = entries
    .map((e) => `${e.topicId}:${e.stepId}`)
    .sort()
    .join(",");
  const key = `${mode}:k${caps.keyboard}:a${caps.audio}:${entryKey}`;
  if (
    state.numbersMixDeckKey !== key ||
    !Array.isArray(state.numbersMixDeck) ||
    !state.numbersMixDeck.length
  ) {
    state.numbersMixDeckKey = key;
    state.numbersMixDeck = buildMixDeckFromEntries(entries, mode);
    state.numbersMixCursor = 0;
  }
  syncMixItemFocus();
}

function syncMixItemFocus() {
  if (state.numbersSessionKind !== "mix") return;
  const deck = state.numbersMixDeck;
  if (!deck?.length) return;
  const item = deck[state.numbersMixCursor % deck.length];
  if (!item) return;
  if (item.mode) state.numbersQuizMode = item.mode;
  if (item.stepId) state.numbersStep = item.stepId;
  state.numbersTopic = item.topicId || state.numbersMixTopic || "cardinals";
}

function listenDigitAllowed(n) {
  return listenValuePool().includes(n);
}

/** Stable identity for a Numbers pool item (anti-repeat + Back/Forward). */
function numbersItemKey(meta) {
  if (meta == null) return "";
  let base = "";
  if (typeof meta === "number") base = `v:${meta}`;
  else if (meta.value != null && (meta.kind === "cardinal" || !meta.kind))
    base = `v:${meta.value}`;
  else if (meta.kind === "weekday") base = `wd:${meta.index}`;
  else if (meta.kind === "month") base = `mo:${meta.month}`;
  else if (meta.kind === "ordinal" || meta.kind === "ordinal-am")
    base = `ord:${meta.kind}:${meta.n}`;
  else if (meta.kind === "clock" || meta.kind === "digital-time")
    base = `t:${meta.kind}:${meta.hours}:${meta.minutes}`;
  else if (meta.kind === "duration") base = `dur:${meta.hours}:${meta.minutes}`;
  else if (meta.kind === "calendar-date")
    base = `cal:${meta.day}.${meta.month}.${meta.year ?? ""}`;
  else if (meta.kind === "measure")
    base = `meas:${meta.unit}:${meta.value ?? meta.n ?? meta.written}`;
  else if (meta.written != null) base = `${meta.kind || "w"}:${meta.written}`;
  else if (meta.form != null) base = `${meta.kind || "f"}:${meta.form}`;
  else base = `x:${String(meta)}`;
  // Mix decks often repeat the same value across modes/steps — disambiguate.
  const topic = meta.topicId || "";
  const step = meta.stepId || "";
  const mode = meta.mode || "";
  if (topic || step || mode) return `${topic}:${step}:${mode}:${base}`;
  return base;
}

/** Shuffle, but keep `avoidKey` off the front when the pool has 2+ items. */
function shuffleAvoidingKey(pool, avoidKey) {
  const deck = shuffle([...pool]);
  if (!avoidKey || deck.length < 2) return deck;
  if (numbersItemKey(deck[0]) !== avoidKey) return deck;
  for (let i = 1; i < deck.length; i++) {
    if (numbersItemKey(deck[i]) !== avoidKey) {
      [deck[0], deck[i]] = [deck[i], deck[0]];
      break;
    }
  }
  return deck;
}

function currentNumbersAvoidKey() {
  try {
    return numbersItemKey(currentNumberMeta());
  } catch {
    return "";
  }
}

function reshuffleListenDeck() {
  const avoid = currentNumbersAvoidKey();
  const mixNonCardinal =
    state.numbersSessionKind === "mix" &&
    currentMixEntries().some((e) => e.topicId !== "cardinals");
  if (state.numbersTopic !== "cardinals" || mixNonCardinal) {
    const pool =
      state.numbersSessionKind === "mix"
        ? (state.numbersMixDeck || []).filter((m) => m.mode === "listen")
        : currentNumberPool();
    state.numbersListenDeck = shuffleAvoidingKey(
      pool.length ? pool : currentNumberPool(),
      avoid
    );
  } else {
    state.numbersListenDeck = shuffleAvoidingKey(listenValuePool(), avoid);
  }
  state.numbersListenCursor = 0;
}

function ensureListenDeck() {
  const key =
    state.numbersSessionKind === "mix"
      ? `mix:${state.numbersMixDeckKey || ""}`
      : `${state.numbersTopic}:${state.numbersStep}`;
  const mixNonCardinal =
    state.numbersSessionKind === "mix" &&
    currentMixEntries().some((e) => e.topicId !== "cardinals");
  const decimalish = state.numbersTopic !== "cardinals" || mixNonCardinal;
  const expected = decimalish
    ? currentNumberPool().length
    : listenValuePool().length;
  if (
    state.numbersListenPoolKey !== key ||
    !Array.isArray(state.numbersListenDeck) ||
    state.numbersListenDeck.length !== expected
  ) {
    state.numbersListenPoolKey = key;
    reshuffleListenDeck();
  }
}

/** Shuffled Build/Convert deck for the current focus step (full pool, one pass then reshuffle). */
function reshuffleStepDeck() {
  const pool = currentNumberPool();
  state.numbersStepDeck = shuffleAvoidingKey(pool, currentNumbersAvoidKey());
  state.numbersIndex = 0;
  state.numbersStepDeckKey = `${state.numbersTopic}:${state.numbersStep}`;
}

function ensureStepDeck() {
  const key = `${state.numbersTopic}:${state.numbersStep}`;
  const expected = currentNumberPool().length;
  if (
    state.numbersStepDeckKey !== key ||
    !Array.isArray(state.numbersStepDeck) ||
    state.numbersStepDeck.length !== expected
  ) {
    reshuffleStepDeck();
  }
}

function currentNumberPool() {
  const step = getNumbersStep(state.numbersTopic, state.numbersStep);
  const key = step?.pool;
  if (key && numberPools[key]) return numberPools[key];
  return numberPools.compounds;
}

function enrichNumberMeta(meta) {
  if (!meta) return meta;
  if (isWrittenishMeta(meta)) {
    const parts = meta.parts || [];
    return {
      ...meta,
      answerParts: parts.map((t) =>
        typeof t === "string" ? { text: t, guide: t } : t
      ),
    };
  }
  const value = meta.value;
  return {
    ...meta,
    kind: meta.kind || "cardinal",
    english: meta.english || (value != null ? englishCardinal(value) : ""),
    answerParts:
      meta.answerParts ||
      (value != null
        ? numberAnswerParts(value, meta.grain || "construction")
        : []),
  };
}

function currentNumberMeta() {
  if (state.numbersQuizMode === "listen") {
    if (state.numbersSessionKind === "mix") {
      ensureMixDeck();
      const deck = state.numbersMixDeck;
      const item = deck[state.numbersMixCursor % Math.max(1, deck.length)];
      return enrichNumberMeta(item);
    }
    ensureListenDeck();
    const entry =
      state.numbersListenDeck[
        state.numbersListenCursor % state.numbersListenDeck.length
      ];
    if (entry != null && typeof entry === "object") {
      return enrichNumberMeta(entry);
    }
    return enrichNumberMeta({
      kind: "cardinal",
      value: entry,
      english: englishCardinal(entry),
      grain: "construction",
    });
  }
  if (state.numbersSessionKind === "mix") {
    ensureMixDeck();
    const deck = state.numbersMixDeck;
    const meta = deck[state.numbersMixCursor % Math.max(1, deck.length)];
    return enrichNumberMeta(meta);
  }
  ensureStepDeck();
  const deck = state.numbersStepDeck;
  const meta = deck[state.numbersIndex % Math.max(1, deck.length)];
  return enrichNumberMeta(meta);
}

function decimalAnswerParts(meta) {
  return (meta.parts || meta.answerParts || []).map((t) =>
    typeof t === "string" ? { text: t, guide: t } : t
  );
}

function currentNumberExercise() {
  const meta = currentNumberMeta();
  if (isWrittenishMeta(meta)) {
    return currentWrittenishExercise(meta);
  }
  if (state.numbersQuizMode === "listen") {
    const form = cardinalForm(meta.value);
    return {
      id: `ex.numbers.listen.${meta.value}.${state.numbersDifficulty}`,
      templateId: "numbers.listen.value",
      territoryId: "numbers",
      mode: state.numbersDifficulty,
      target: { value: meta.value },
      scaffolding: {
        mode: state.numbersDifficulty,
        showEnglish: false,
        showHintButton: true,
        showReferenceButton: true,
        allowRetryWrongChoice: true,
      },
      prompt: {
        kind: "listen-value",
        value: meta.value,
        form,
      },
      materials: {
        form,
        choices: listenChoices(meta.value),
        answerParts: numberAnswerParts(meta.value, "listen"),
        hint:
          state.numbersDifficulty === "assisted"
            ? "Replay if needed. Choices are nearby / look-alike values — TTS is a helper, not the linguistic authority."
            : "Replay if needed, then type the digit. TTS is a helper, not the linguistic authority.",
      },
      resolution: {
        value: meta.value,
        form,
        english: meta.english,
      },
    };
  }
  if (state.numbersQuizMode === "convert") {
    const form = cardinalForm(meta.value);
    return {
      id: `ex.numbers.convert.${meta.value}.${state.numbersDifficulty}`,
      templateId: "numbers.convert.form",
      territoryId: "numbers",
      mode: state.numbersDifficulty,
      target: { value: meta.value },
      scaffolding: {
        mode: state.numbersDifficulty,
        showEnglish: state.numbersDifficulty === "assisted",
        showHintButton: true,
        showReferenceButton: true,
        allowRetryWrongChoice: true,
      },
      prompt: {
        kind: "convert-digit",
        value: meta.value,
        english: meta.english,
      },
      materials: {
        form,
        answerParts: numberAnswerParts(meta.value, "listen"),
        hint:
          state.numbersDifficulty === "assisted"
            ? "Type the German form. Assisted checks as you type — keep going while it stays green."
            : "Type the full German form, then Check.",
      },
      resolution: {
        value: meta.value,
        form,
        english: meta.english,
      },
    };
  }
  return createNumberConstructionExercise(meta.value, {
    grain: meta.grain,
    english: meta.english,
    mode: state.numbersDifficulty,
    answerParts: meta.answerParts,
  });
}

/** Listen / Convert / Build for decimal, money, fraction, and time metas. */
function currentWrittenishExercise(meta) {
  const form = meta.form;
  const written = meta.written;
  const parts = decimalAnswerParts(meta);

  if (state.numbersQuizMode === "listen") {
    const readTime = isClockMeta(meta);
    return {
      id: `ex.numbers.listen.${written}.${state.numbersDifficulty}`,
      templateId: readTime
        ? "numbers.listen.read-time"
        : "numbers.listen.written",
      territoryId: "numbers",
      mode: state.numbersDifficulty,
      target: { kind: meta.kind, written, form },
      scaffolding: {
        mode: state.numbersDifficulty,
        showEnglish: false,
        showHintButton: true,
        showReferenceButton: true,
        allowRetryWrongChoice: true,
      },
      prompt: { kind: readTime ? "listen-read-time" : "listen-written", form, written },
      materials: {
        form,
        written,
        choices: readTime
          ? listenGermanFormChoices(meta)
          : listenWrittenChoices(meta),
        answerParts: parts,
        hint:
          state.numbersDifficulty === "assisted"
            ? readTime
              ? meta.kind === "digital-time"
                ? "Pick the formal · 24-hour reading (… Uhr …)."
                : "Pick the conversational reading (relative to halb when relevant)."
              : meta.kind === "decimal" || meta.kind === "money"
                ? "Replay if needed. Pick the written form (Komma, not Punkt)."
                : "Replay if needed. Pick the written form you heard."
            : readTime
              ? meta.kind === "digital-time"
                ? "Type the formal · 24-hour reading (… Uhr …)."
                : "Type the conversational reading (relative to halb when relevant)."
              : meta.kind === "decimal" || meta.kind === "money"
                ? "Replay if needed, then type the written form (use Komma)."
                : "Replay if needed, then type the written form.",
      },
      resolution: {
        kind: meta.kind,
        written,
        form,
        english: meta.english,
        whole: meta.whole,
        fracDigits: meta.fracDigits,
        euros: meta.euros,
        cents: meta.cents,
        numerator: meta.numerator,
        denominator: meta.denominator,
        hours: meta.hours,
        minutes: meta.minutes,
        n: meta.n,
        index: meta.index,
        month: meta.month,
        day: meta.day,
        year: meta.year,
        value: meta.value,
        unit: meta.unit,
        acceptedForms: readTime
          ? acceptedConvertForms(meta)
          : undefined,
      },
    };
  }

  if (state.numbersQuizMode === "convert") {
    // No "write Komma from English point" drills — convert always targets the
    // spoken German reading (… Komma …), never orthography swap alone.
    return {
      id: `ex.numbers.convert.${written}.${state.numbersDifficulty}`,
      templateId: "numbers.convert.form",
      territoryId: "numbers",
      mode: state.numbersDifficulty,
      target: { kind: meta.kind, written, form },
      scaffolding: {
        mode: state.numbersDifficulty,
        showEnglish: false,
        showHintButton: true,
        showReferenceButton: true,
        allowRetryWrongChoice: true,
      },
      prompt: {
        kind: "convert-written",
        written,
        english: "",
      },
      materials: {
        form,
        written,
        answerParts: parts,
        hint:
          state.numbersDifficulty === "assisted"
            ? "Type the German reading. Assisted checks as you type."
            : "Type the full German reading, then Check.",
      },
      resolution: {
        kind: meta.kind,
        written,
        form,
        english: meta.english,
        whole: meta.whole,
        fracDigits: meta.fracDigits,
        euros: meta.euros,
        cents: meta.cents,
        numerator: meta.numerator,
        denominator: meta.denominator,
        hours: meta.hours,
        minutes: meta.minutes,
        n: meta.n,
        index: meta.index,
        month: meta.month,
        day: meta.day,
        year: meta.year,
        value: meta.value,
        unit: meta.unit,
        acceptedForms: acceptedConvertForms(meta),
      },
    };
  }

  if (meta.kind === "money") {
    return createMoneyConstructionExercise(meta.euros, meta.cents, {
      mode: state.numbersDifficulty,
      english: meta.english,
      answerParts: parts,
    });
  }
  if (meta.kind === "fraction") {
    return createFractionConstructionExercise(meta.numerator, meta.denominator, {
      mode: state.numbersDifficulty,
      english: meta.english,
      answerParts: parts,
    });
  }
  if (meta.kind === "mixed-fraction") {
    return createMixedFractionConstructionExercise(
      meta.whole,
      meta.numerator,
      meta.denominator,
      {
        mode: state.numbersDifficulty,
        english: meta.english,
        answerParts: parts,
      }
    );
  }
  if (meta.kind === "clock") {
    return createClockConstructionExercise(meta.hours, meta.minutes, {
      mode: state.numbersDifficulty,
      english: meta.english,
      answerParts: parts,
    });
  }
  if (meta.kind === "digital-time") {
    return createDigitalTimeConstructionExercise(meta.hours, meta.minutes, {
      mode: state.numbersDifficulty,
      english: meta.english,
      answerParts: parts,
    });
  }
  if (meta.kind === "duration") {
    return createDurationConstructionExercise(
      { hours: meta.hours, minutes: meta.minutes },
      {
        mode: state.numbersDifficulty,
        english: meta.english,
        answerParts: parts,
      }
    );
  }
  if (meta.kind === "ordinal") {
    return createOrdinalConstructionExercise(meta.n, {
      mode: state.numbersDifficulty,
      english: meta.english,
      answerParts: parts,
    });
  }
  if (meta.kind === "ordinal-am") {
    return createOrdinalAmConstructionExercise(meta.n, {
      mode: state.numbersDifficulty,
      english: meta.english,
      answerParts: parts,
    });
  }
  if (meta.kind === "weekday") {
    return createWeekdayConstructionExercise(meta.index, {
      mode: state.numbersDifficulty,
      english: meta.english,
      answerParts: parts,
    });
  }
  if (meta.kind === "month") {
    return createMonthConstructionExercise(meta.month, {
      mode: state.numbersDifficulty,
      english: meta.english,
      answerParts: parts,
    });
  }
  if (meta.kind === "calendar-date") {
    return createCalendarDateConstructionExercise(
      {
        day: meta.day,
        month: meta.month,
        year: meta.year ?? undefined,
      },
      {
        mode: state.numbersDifficulty,
        english: meta.english,
        answerParts: parts,
      }
    );
  }
  if (meta.kind === "measure") {
    return createMeasureConstructionExercise(meta.value, meta.unit, {
      mode: state.numbersDifficulty,
      english: meta.english,
      answerParts: parts,
    });
  }
  return createDecimalConstructionExercise(meta.whole, meta.fracDigits, {
    mode: state.numbersDifficulty,
    english: meta.english,
    answerParts: parts,
  });
}

function listenWrittenChoices(meta) {
  const pool = currentNumberPool();
  const correct = meta.written;
  const picks = new Set([correct].filter(Boolean));
  // Decimal/money: skip English point orthography (4.85). Do NOT skip
  // ordinal/date forms that use a trailing period (12., am 3.).
  const skipEnglishPoint = meta.kind === "decimal" || meta.kind === "money";
  const candidates = shuffle(
    pool.map((m) => m.written).filter((w) => w && w !== correct)
  );
  for (const w of candidates) {
    if (picks.size >= 4) break;
    if (
      skipEnglishPoint &&
      String(w).includes(".") &&
      !String(w).includes(",")
    ) {
      continue;
    }
    picks.add(w);
  }
  // Pad with nearby written ordinals when the pool is thin or filters ate distractors.
  if (
    picks.size < 4 &&
    (meta.kind === "ordinal" || meta.kind === "ordinal-am") &&
    meta.n != null
  ) {
    for (const d of [1, -1, 2, -2, 3, -3, 4, 5, 10, -5]) {
      if (picks.size >= 4) break;
      const n = meta.n + d;
      if (!Number.isInteger(n) || n < 1 || n > 999) continue;
      const w =
        meta.kind === "ordinal-am" ? `am ${n}.` : `${n}.`;
      if (w !== correct) picks.add(w);
    }
  }
  return shuffle([...picks]).slice(0, Math.max(1, Math.min(4, picks.size)));
}

/** MC choices: German spoken readings (for Read-the-time quizzes). */
function listenGermanFormChoices(meta) {
  const pool = currentNumberPool();
  const correct = meta.form;
  const picks = new Set([correct].filter(Boolean));
  const candidates = shuffle(
    pool.map((m) => m.form).filter((f) => f && f !== correct)
  );
  for (const f of candidates) {
    if (picks.size >= 4) break;
    picks.add(f);
  }
  return shuffle([...picks]).slice(0, Math.max(1, Math.min(4, picks.size)));
}

/** Reading register for clock cues (conversational vs formal digital). */
function clockReadingRegister(meta) {
  if (meta?.kind === "digital-time") {
    return {
      id: "formal-24h",
      label: "Formal · 24-hour",
      // Style exemplar — not the item under test.
      example: "dreizehn Uhr fünfundzwanzig",
    };
  }
  if (meta?.kind === "clock") {
    return {
      id: "conversational",
      label: "Conversational reading",
      example: "fünf vor halb zwei",
    };
  }
  return null;
}

/** @deprecated use clockReadingRegister — kept for call sites mid-migration. */
function clockFormatLabel(meta) {
  const reg = clockReadingRegister(meta);
  if (reg?.id === "formal-24h") return "Formal · 24-hour";
  if (reg?.id === "conversational") return "conversational";
  return "";
}

/** Canonical + accepted alternate readings for convert / read-time checks. */
function acceptedConvertForms(meta) {
  if (!meta) return [];
  if (meta.kind === "clock" && meta.hours != null && meta.minutes != null) {
    return clockFormAlternates(meta.hours, meta.minutes);
  }
  return meta.form ? [meta.form] : [];
}

/** Static format exemplars for “Type the German reading” asks (not the answer). */
function convertReadingExample(meta) {
  switch (meta?.kind) {
    case "decimal":
      return "vier Komma acht fünf";
    case "money":
      return "zwei Euro fünfzig";
    case "fraction":
    case "fraction-half":
    case "fraction-unit":
    case "fraction-proper":
      return "drei Viertel";
    case "mixed-fraction":
      return "zwei ein halb";
    case "clock":
      return "fünf vor halb zwei";
    case "digital-time":
      return "dreizehn Uhr fünfundzwanzig";
    case "duration":
      return "zwei Stunden fünfzehn Minuten";
    case "ordinal":
      return "zwölfte";
    case "ordinal-am":
      return "am zwölften";
    case "weekday":
      return "Montag";
    case "month":
      return "Januar";
    case "calendar-date":
      return "der dritte Oktober";
    case "measure":
      return "drei Meter";
    default:
      return meta?.form || "";
  }
}

/**
 * Assisted Listen distractors — prefer confusable neighbors for 2-digit values:
 * same tens / same ones / digit swap / teen↔tens traps.
 */
function listenChoices(value) {
  const candidates = [];
  const add = (n) => {
    if (!Number.isInteger(n) || n === value || !listenDigitAllowed(n)) return;
    candidates.push(n);
  };

  if (value < 10) {
    for (const d of [-3, -2, -1, 1, 2, 3]) add(value + d);
    add(value + 10);
    add(value + 11);
    add(10 + value); // e.g. 3 → 13
  } else if (value >= 100) {
    const h = Math.floor(value / 100);
    const rem = value % 100;
    add(value - 1);
    add(value + 1);
    add(h * 100);
    if (rem) add(rem);
    for (const dh of [-1, 1, -2, 2]) {
      const nh = h + dh;
      if (nh >= 1 && nh <= 9) add(nh * 100 + rem);
      if (nh >= 1 && nh <= 9) add(nh * 100);
    }
    if (value === 1000) {
      add(100);
      add(900);
      add(999);
    } else if (value >= 900) {
      add(1000);
    }
  } else {
    const tens = Math.floor(value / 10);
    const ones = value % 10;

    // Same tens digit, nearby ones (42 → 41, 43, 40…)
    for (const o of [ones - 2, ones - 1, ones + 1, ones + 2, ones + 3, ones - 3]) {
      if (o >= 0 && o <= 9) add(tens * 10 + o);
    }

    // Same ones digit, nearby tens (42 → 32, 52, 22…)
    for (const t of [tens - 1, tens + 1, tens - 2, tens + 2]) {
      if (t >= 1 && t <= 9) add(t * 10 + ones);
    }

    // Digit transposition when both digits are meaningful (42 → 24)
    if (ones >= 1 && ones !== tens) add(ones * 10 + tens);

    // Teen ↔ tens traps (16 ↔ 60, 17 ↔ 70; 30 ↔ 13)
    if (value >= 13 && value <= 19) {
      add((value - 10) * 10);
      add((value - 10) * 10 + (value - 10));
    }
    if (ones === 0 && tens >= 2) {
      add(10 + tens);
      add(tens);
    }

    // ±1 overall as mild near-miss
    add(value - 1);
    add(value + 1);
  }

  const unique = shuffle([...new Set(candidates)]);
  const picks = unique.slice(0, 3);
  const pool = listenValuePool();
  while (picks.length < 3 && picks.length < pool.length - 1) {
    const n = pool[Math.floor(Math.random() * pool.length)];
    if (n !== value && !picks.includes(n)) picks.push(n);
  }
  return shuffle([value, ...picks]);
}

/** Karaoke guides for singular article quizzes (article + lemma beats). */
const NOUN_SINGULAR_PARTS = {
  Zeitung: [
    { text: "die", guide: "dee" },
    { text: "Zei", guide: "TSAI", stress: true },
    { text: "tung", guide: "toong" },
  ],
  Freiheit: [
    { text: "die", guide: "dee" },
    { text: "Frei", guide: "FRY", stress: true },
    { text: "heit", guide: "hite" },
  ],
  Möglichkeit: [
    { text: "die", guide: "dee" },
    { text: "Mö", guide: "MUE", stress: true },
    { text: "glich", guide: "glikh" },
    { text: "keit", guide: "kite" },
  ],
  Freundschaft: [
    { text: "die", guide: "dee" },
    { text: "Freund", guide: "FROYNT", stress: true },
    { text: "schaft", guide: "shahft" },
  ],
  Nation: [
    { text: "die", guide: "dee" },
    { text: "Na", guide: "nah" },
    { text: "ti", guide: "TSI", stress: true },
    { text: "on", guide: "ohn" },
  ],
  Frühling: [
    { text: "der", guide: "dair" },
    { text: "Früh", guide: "FRUE", stress: true },
    { text: "ling", guide: "ling" },
  ],
  Tourismus: [
    { text: "der", guide: "dair" },
    { text: "Tou", guide: "too" },
    { text: "ris", guide: "RIS", stress: true },
    { text: "mus", guide: "moos" },
  ],
  Lehrer: [
    { text: "der", guide: "dair" },
    { text: "Lehr", guide: "LAYR", stress: true },
    { text: "er", guide: "er" },
  ],
  Wohnung: [
    { text: "die", guide: "dee" },
    { text: "Woh", guide: "VOH", stress: true },
    { text: "nung", guide: "noong" },
  ],
  Rechnung: [
    { text: "die", guide: "dee" },
    { text: "Rech", guide: "REKH", stress: true },
    { text: "nung", guide: "noong" },
  ],
  Montag: [
    { text: "der", guide: "dair" },
    { text: "Mon", guide: "MOHN", stress: true },
    { text: "tag", guide: "tahk" },
  ],
  Zahl: [
    { text: "die", guide: "dee" },
    { text: "Zahl", guide: "TSAHL", stress: true },
  ],
  Nummer: [
    { text: "die", guide: "dee" },
    { text: "Num", guide: "NOOM", stress: true },
    { text: "mer", guide: "mer" },
  ],
  Stunde: [
    { text: "die", guide: "dee" },
    { text: "Stun", guide: "SHTOON", stress: true },
    { text: "de", guide: "duh" },
  ],
  Minute: [
    { text: "die", guide: "dee" },
    { text: "Mi", guide: "mi" },
    { text: "nu", guide: "NOO", stress: true },
    { text: "te", guide: "tuh" },
  ],
  Gärtner: [
    { text: "der", guide: "dair" },
    { text: "Gärt", guide: "GAIRT", stress: true },
    { text: "ner", guide: "ner" },
  ],
  Mädchen: [
    { text: "das", guide: "dahs" },
    { text: "Mäd", guide: "MEHD", stress: true },
    { text: "chen", guide: "chen" },
  ],
  Büchlein: [
    { text: "das", guide: "dahs" },
    { text: "Büch", guide: "BUEKH", stress: true },
    { text: "lein", guide: "line" },
  ],
  Instrument: [
    { text: "das", guide: "dahs" },
    { text: "In", guide: "in" },
    { text: "stru", guide: "STROO", stress: true },
    { text: "ment", guide: "ment" },
  ],
  Tag: [
    { text: "der", guide: "dair" },
    { text: "Tag", guide: "TAHK", stress: true },
  ],
  Buch: [
    { text: "das", guide: "dahs" },
    { text: "Buch", guide: "BOOKH", stress: true },
  ],
  Auto: [
    { text: "das", guide: "dahs" },
    { text: "Au", guide: "OW", stress: true },
    { text: "to", guide: "toh" },
  ],
};

/** Karaoke guides for plural reveal (die + stem beats + ending where spoken). */
const NOUN_PLURAL_PARTS = {
  Zeitung: [
    { text: "die", guide: "dee" },
    { text: "Zei", guide: "TSAI", stress: true },
    { text: "tun", guide: "toon" },
    { text: "gen", guide: "gen" },
  ],
  Freiheit: [
    { text: "die", guide: "dee" },
    { text: "Frei", guide: "FRY", stress: true },
    { text: "hei", guide: "hye" },
    { text: "ten", guide: "ten" },
  ],
  Möglichkeit: [
    { text: "die", guide: "dee" },
    { text: "Mö", guide: "MUE", stress: true },
    { text: "glich", guide: "glikh" },
    { text: "kei", guide: "kye" },
    { text: "ten", guide: "ten" },
  ],
  Freundschaft: [
    { text: "die", guide: "dee" },
    { text: "Freund", guide: "FROYNT", stress: true },
    { text: "schaf", guide: "shahf" },
    { text: "ten", guide: "ten" },
  ],
  Nation: [
    { text: "die", guide: "dee" },
    { text: "Na", guide: "nah" },
    { text: "ti", guide: "TSI", stress: true },
    { text: "o", guide: "oh" },
    { text: "nen", guide: "nen" },
  ],
  Frühling: [
    { text: "die", guide: "dee" },
    { text: "Früh", guide: "FRUE", stress: true },
    { text: "lin", guide: "lin" },
    { text: "ge", guide: "ge" },
  ],
  Lehrer: [
    { text: "die", guide: "dee" },
    { text: "Lehr", guide: "LAYR", stress: true },
    { text: "er", guide: "er" },
  ],
  Gärtner: [
    { text: "die", guide: "dee" },
    { text: "Gärt", guide: "GAIRT", stress: true },
    { text: "ner", guide: "ner" },
  ],
  Mädchen: [
    { text: "die", guide: "dee" },
    { text: "Mäd", guide: "MEHD", stress: true },
    { text: "chen", guide: "chen" },
  ],
  Büchlein: [
    { text: "die", guide: "dee" },
    { text: "Büch", guide: "BUEKH", stress: true },
    { text: "lein", guide: "line" },
  ],
  Instrument: [
    { text: "die", guide: "dee" },
    { text: "In", guide: "in" },
    { text: "stru", guide: "STROO", stress: true },
    { text: "men", guide: "men" },
    { text: "te", guide: "te" },
  ],
  Tag: [
    { text: "die", guide: "dee" },
    { text: "Ta", guide: "TAH", stress: true },
    { text: "ge", guide: "ge" },
  ],
  Buch: [
    { text: "die", guide: "dee" },
    { text: "Bü", guide: "BUE", stress: true },
    { text: "cher", guide: "kher" },
  ],
  Auto: [
    { text: "die", guide: "dee" },
    { text: "Au", guide: "OW", stress: true },
    { text: "tos", guide: "tohs" },
  ],
};

function fallbackSingularParts(lemma) {
  const entry = LEXICON[lemma];
  const article = entry ? ARTICLES[entry.gender] : "die";
  const artGuide =
    article === "der" ? "dair" : article === "das" ? "dahs" : "dee";
  return [
    { text: article, guide: artGuide },
    { text: lemma, guide: lemma, stress: true },
  ];
}

/** Karaoke beats for a vocabulary item (article + lemma when known). */
function vocabAnswerParts(item) {
  if (!item) return [];
  const lemma = item.engine?.lemma || item.surface || "";
  if (!lemma) return [];
  if (NOUN_SINGULAR_PARTS[lemma]) return NOUN_SINGULAR_PARTS[lemma];
  if (LEXICON[lemma]) return fallbackSingularParts(lemma);
  const heading = String(item.heading || "").trim();
  const m = heading.match(/^(der|die|das)\s+/i);
  const article = m ? m[1].toLowerCase() : null;
  if (!article) return [{ text: lemma, guide: lemma, stress: true }];
  const artGuide =
    article === "der" ? "dair" : article === "das" ? "dahs" : "dee";
  return [
    { text: article, guide: artGuide },
    { text: lemma, guide: lemma, stress: true },
  ];
}

function fallbackPluralParts(lemma) {
  const entry = LEXICON[lemma];
  const form = entry?.plural?.form || lemma;
  return [
    { text: "die", guide: "dee" },
    { text: form, guide: form, stress: true },
  ];
}

/** Real Words / Association: suffix-cued lemmas only (pattern spine). */
const nounArticleMeta = associationLemmas().map(({ lemma }) => ({
  lemma,
  parts: NOUN_SINGULAR_PARTS[lemma] || fallbackSingularParts(lemma),
}));

/** Plurals: all recorded plurals (includes a few chart exemplars without gender suffix). */
const NOUN_PLURAL_EN = {
  Zeitung: "newspapers",
  Rechnung: "bills",
  Wohnung: "apartments",
  Bedeutung: "meanings",
  Hoffnung: "hopes",
  Erfahrung: "experiences",
  Übung: "exercises",
  Lösung: "solutions",
  Erzählung: "stories",
  Freiheit: "freedoms",
  Schönheit: "beauties",
  Krankheit: "illnesses",
  Wahrheit: "truths",
  Sicherheit: "securities",
  Möglichkeit: "possibilities",
  Fähigkeit: "abilities",
  Schwierigkeit: "difficulties",
  Geschwindigkeit: "speeds",
  Freundschaft: "friendships",
  Wirtschaft: "economies",
  Landschaft: "landscapes",
  Wissenschaft: "sciences",
  Gesellschaft: "societies",
  Nation: "nations",
  Information: "pieces of information",
  Situation: "situations",
  Station: "stations",
  Region: "regions",
  Diskussion: "discussions",
  Frühling: "springs",
  Lehrling: "apprentices",
  Flüchtling: "refugees",
  Findling: "foundlings",
  Mädchen: "girls",
  Häuschen: "little houses",
  Brötchen: "bread rolls",
  Märchen: "fairy tales",
  Kaninchen: "rabbits",
  Büchlein: "booklets",
  Kindlein: "little children",
  Fräulein: "young women",
  Instrument: "instruments",
  Dokument: "documents",
  Experiment: "experiments",
  Argument: "arguments",
  Monument: "monuments",
  Tag: "days",
  Buch: "books",
  Auto: "cars",
};

const nounPluralMeta = lemmasWithPlural().map((lemma) => {
  const entry = LEXICON[lemma];
  return {
    lemma,
    translation: NOUN_PLURAL_EN[lemma] || entry?.gloss || "",
    answerParts: NOUN_PLURAL_PARTS[lemma] || fallbackPluralParts(lemma),
  };
});

const nounAssociationPool = associationLemmas();
const nounWugPool = wugForms();
const nounCategoryGenderRecognitionPool = () =>
  practiceCategories().map((c) => ({ categoryId: c.id }));
const nounCategoryArticleApplicationPool = () =>
  categoryArticleItems().map((x) => ({ itemId: x.id }));
const nounCategoryGenderImposterPool = () =>
  practiceCategories().map((c) => ({ categoryId: c.id }));
const nounCategorySentenceValidationPool = () =>
  categoryValidationItems().map((x) => ({ itemId: x.id }));

function nounDeckSource(kind) {
  if (kind === "Article") return nounArticleMeta;
  if (kind === "Plural") return nounPluralMeta;
  if (kind === "Association") return nounAssociationPool;
  if (kind === "Proofread" || kind === "Reverse") return nounAssociationPool;
  if (kind === "CategoryGenderRecognition") return nounCategoryGenderRecognitionPool();
  if (kind === "CategoryArticleApplication") return nounCategoryArticleApplicationPool();
  if (kind === "CategoryGenderImposter") return nounCategoryGenderImposterPool();
  if (kind === "CategorySentenceValidation") return nounCategorySentenceValidationPool();
  return nounWugPool;
}

function ensureNounDeck(kind) {
  const deckKey = `nouns${kind}Deck`;
  const source = nounDeckSource(kind);
  if (!Array.isArray(state[deckKey]) || state[deckKey].length !== source.length) {
    state[deckKey] = shuffle([...source]);
  }
  return state[deckKey];
}

function reshuffleNounDeck(kind) {
  const deckKey = `nouns${kind}Deck`;
  state[deckKey] = shuffle([...nounDeckSource(kind)]);
}

function currentNounArticleExercise() {
  const deck = ensureNounDeck("Article");
  const meta = deck[state.nounsIndex % deck.length];
  return createNounArticleExercise(meta.lemma, {
    mode: state.nounsDifficulty,
    answerParts: meta.parts,
  });
}

function currentNounAssociationExercise() {
  const deck = ensureNounDeck("Association");
  const item = deck[state.nounsAssociationIndex % Math.max(1, deck.length)];
  return createNounAssociationExercise(item.lemma, {
    mode: state.nounsDifficulty,
  });
}

function currentNounCategoryGenderRecognitionExercise() {
  const deck = ensureNounDeck("CategoryGenderRecognition");
  const item =
    deck[state.nounsCategoryGenderRecognitionIndex % Math.max(1, deck.length)];
  return createNounCategoryGenderRecognitionExercise(item.categoryId, {
    mode: state.nounsDifficulty,
  });
}

function currentNounCategoryArticleApplicationExercise() {
  const deck = ensureNounDeck("CategoryArticleApplication");
  const item =
    deck[state.nounsCategoryArticleApplicationIndex % Math.max(1, deck.length)];
  return createNounCategoryArticleApplicationExercise(item.itemId, {
    mode: state.nounsDifficulty,
  });
}

function currentNounCategoryGenderImposterExercise() {
  const deck = ensureNounDeck("CategoryGenderImposter");
  const item =
    deck[state.nounsCategoryGenderImposterIndex % Math.max(1, deck.length)];
  return createNounCategoryGenderImposterExercise(item.categoryId, {
    mode: state.nounsDifficulty,
  });
}

function currentNounCategorySentenceValidationExercise() {
  const deck = ensureNounDeck("CategorySentenceValidation");
  const item =
    deck[state.nounsCategorySentenceValidationIndex % Math.max(1, deck.length)];
  return createNounCategorySentenceValidationExercise(item.itemId, {
    mode: state.nounsDifficulty,
  });
}

function currentNounWugExercise() {
  const deck = ensureNounDeck("Wug");
  const form = deck[state.nounsWugIndex % Math.max(1, deck.length)];
  return createNounWugExercise(form, { mode: state.nounsDifficulty });
}

function currentNounPluralExercise() {
  const deck = ensureNounDeck("Plural");
  const meta = deck[state.nounsPluralIndex % deck.length];
  return createNounPluralExercise(meta.lemma, {
    mode: state.nounsDifficulty,
    translation: meta.translation,
    answerParts: meta.answerParts,
  });
}

function isNounArticleLikeMode() {
  return (
    state.nounsMode === "real-words" ||
    state.nounsMode === "articles" || // legacy alias
    state.nounsMode === "association" || // legacy suffix-family drill
    state.nounsMode === "wugs"
  );
}

function isNounCategoryMode() {
  return (
    state.nounsMode === "gender-recognition" ||
    state.nounsMode === "article-application" ||
    state.nounsMode === "gender-imposter" ||
    state.nounsMode === "sentence-validation"
  );
}

function isNounDiscriminateMode() {
  return state.nounsMode === "proofread" || state.nounsMode === "reverse-mc";
}

function recordFamilyAttempt(patternId, ok) {
  if (!patternId) return;
  const prev = state.nounFamilyStats[patternId] || { correct: 0, total: 0 };
  state.nounFamilyStats[patternId] = {
    correct: prev.correct + (ok ? 1 : 0),
    total: prev.total + 1,
  };
}

function familyProgressText(patternId, suffix) {
  if (!patternId || !suffix) return "";
  const s = state.nounFamilyStats[patternId] || { correct: 0, total: 0 };
  if (s.total === 0) {
    return `-${suffix} family · build accuracy here · ~80% feels ready for plurals`;
  }
  const pct = Math.round((100 * s.correct) / s.total);
  const ready = pct >= 80 && s.total >= 4;
  return `-${suffix} · ${s.correct}/${s.total} (${pct}%)${
    ready ? " · ready for plurals on this family" : " · aim ~80%"
  }`;
}

function joinNounPluralParts(parts) {
  return parts
    .map((t) => (t === "—" ? "" : t))
    .filter(Boolean)
    .join("\u00AD");
}

/** Soft hyphen (U+00AD) — invisible unless the line wraps at that join. */
const SOFT_HYPHEN = "\u00AD";

/**
 * Insert soft hyphens between orthographic segments, preserving `word` casing.
 * @param {string} word
 * @param {string[]} segs
 */
function joinWithSoftHyphens(word, segs) {
  const w = String(word || "");
  if (!w || !segs?.length) return w;
  let i = 0;
  const out = [];
  for (let s = 0; s < segs.length; s++) {
    const len = String(segs[s]).length;
    out.push(w.slice(i, i + len));
    i += len;
    if (s < segs.length - 1) out.push(SOFT_HYPHEN);
  }
  return out.join("");
}

/**
 * Soft-hyphenate a German token using segment texts that concatenate to it.
 * @param {string} word
 * @param {Array<string|{text?: string}>} [parts]
 */
function softHyphenateToken(word, parts) {
  const w = String(word || "").replaceAll(SOFT_HYPHEN, "");
  if (!w) return "";
  const segs = (parts || [])
    .map((p) => (typeof p === "string" ? p : p?.text || ""))
    .map((t) => String(t).replaceAll(SOFT_HYPHEN, ""))
    .filter((t) => t && !/\s/.test(t));
  const target = w.toLowerCase();

  const trySegs = (list) => {
    if (!list || list.length < 2) return null;
    if (list.join("").toLowerCase() !== target) return null;
    return joinWithSoftHyphens(w, list);
  };

  let hit = trySegs(segs);
  if (hit) return hit;
  // Contiguous subsequence (e.g. article beat + lemma syllables in one parts list).
  for (let i = 0; i < segs.length; i++) {
    for (let j = i + 2; j <= segs.length; j++) {
      hit = trySegs(segs.slice(i, j));
      if (hit) return hit;
    }
  }
  return w;
}

/**
 * Soft-hyphenate German display text for wrap-friendly answer/pronunciation lines.
 * Prefers authored/engine segments; falls back to cardinal morph joins; else plain
 * (CSS `hyphens: auto` on lang=de can still break open compounds).
 */
function softHyphenateGerman(word, parts) {
  const raw = String(word || "");
  if (!raw) return "";
  // Preserve whitespace tokens (sentences / "die Zeitung").
  if (/\s/.test(raw)) {
    return raw
      .split(/(\s+)/)
      .map((tok) => (/^\s+$/.test(tok) ? tok : softHyphenateToken(tok, parts)))
      .join("");
  }
  const fromParts = softHyphenateToken(raw, parts);
  if (fromParts.includes(SOFT_HYPHEN)) return fromParts;

  const n = parseCardinalForm(raw.replaceAll(SOFT_HYPHEN, ""));
  if (n != null) {
    const morph = constructionParts(n, { grain: "morph" });
    const fromMorph = softHyphenateToken(raw, morph);
    if (fromMorph.includes(SOFT_HYPHEN)) return fromMorph;
    const constr = constructionParts(n);
    return softHyphenateToken(raw, constr);
  }
  return fromParts;
}

/** Discriminate set — chart-aligned contrasts. Choice captions never name `play`. */
const soundDiscriminate = [
  {
    prompt: "Which vowel did you hear?",
    play: "Tür",
    answer: "ü",
    parts: [{ text: "Tür", guide: "tueer" }],
    choices: [
      { id: "u", label: "u", sub: "back, rounded" },
      { id: "ü", label: "ü", sub: "front, rounded" },
      { id: "i", label: "i", sub: "front, unrounded" },
    ],
    hint: "Lips rounded like u, tongue farther forward — closer to i.",
    reference: {
      title: "ü vs u",
      html: `<ul>
        <li><strong>u</strong> — back, rounded (gut, Fuß)</li>
        <li><strong>ü</strong> — front, rounded (Tür, über)</li>
      </ul>`,
    },
  },
  {
    prompt: "Which vowel did you hear?",
    play: "schön",
    answer: "ö",
    parts: [{ text: "schön", guide: "shoen" }],
    choices: [
      { id: "o", label: "o", sub: "back · “already”" },
      { id: "ö", label: "ö", sub: "front rounded" },
      { id: "ei", label: "ei", sub: "“eye” glide" },
    ],
    hint: "Front rounded ö — not the back o of schon.",
    reference: {
      title: "ö vs o",
      html: `<ul>
        <li><strong>schon</strong> — back o “already”</li>
        <li><strong>schön</strong> — front rounded ö “beautiful”</li>
      </ul>`,
    },
  },
  {
    prompt: "Short or longer a?",
    play: "Mann",
    answer: "short",
    parts: [{ text: "Mann", guide: "mahn" }],
    choices: [
      { id: "short", label: "short a", sub: "double consonant after" },
      { id: "long", label: "longer a", sub: "aa / ah spelling" },
      { id: "umlaut", label: "ä", sub: "umlaut · airy eh" },
    ],
    hint: "Double n keeps the vowel short — mahn, not baahn.",
    reference: {
      title: "a length",
      html: `<ul>
        <li>Short: Mann — double consonant after</li>
        <li>Longer: Bahn — ah / aa cue length</li>
      </ul>`,
    },
  },
  {
    prompt: "Short or longer a?",
    play: "Bahn",
    answer: "long",
    parts: [{ text: "Bahn", guide: "baahn" }],
    choices: [
      { id: "short", label: "short a", sub: "double consonant after" },
      { id: "long", label: "longer a", sub: "aa / ah spelling" },
      { id: "umlaut", label: "ä", sub: "umlaut · airy eh" },
    ],
    hint: "ah in the spelling cues a longer a.",
    reference: {
      title: "a length",
      html: `<ul>
        <li>Bahn, Saal — aa / ah → longer</li>
        <li>Mann, Stadt — double consonant → short</li>
      </ul>`,
    },
  },
  {
    prompt: "Which e did you hear?",
    play: "Bett",
    answer: "short",
    parts: [{ text: "Bett", guide: "bett" }],
    choices: [
      { id: "short", label: "short e", sub: "double consonant after" },
      { id: "long", label: "longer e", sub: "ee / eh spelling" },
      { id: "schwa", label: "weak -e", sub: "unstressed ending" },
    ],
    hint: "Double t keeps it short — bett, not zay.",
    reference: {
      title: "e length",
      html: `<ul>
        <li>Short: Bett</li>
        <li>Longer: See, mehr (ee / eh)</li>
      </ul>`,
    },
  },
  {
    prompt: "Which e did you hear?",
    play: "See",
    answer: "long",
    parts: [{ text: "See", guide: "zay" }],
    choices: [
      { id: "short", label: "short e", sub: "double consonant after" },
      { id: "long", label: "longer e", sub: "ee / eh spelling" },
      { id: "ei", label: "ei", sub: "“eye” diphthong" },
    ],
    hint: "ee spelling → longer e (like “ay” in day, not English “see”).",
    reference: {
      title: "e length",
      html: `<ul>
        <li>See, Tee — ee → longer e</li>
        <li>Not the diphthong ei (mein)</li>
      </ul>`,
    },
  },
  {
    prompt: "Which i did you hear?",
    play: "mit",
    answer: "short",
    parts: [{ text: "mit", guide: "mit" }],
    choices: [
      { id: "short", label: "short i", sub: "ih · closed" },
      { id: "long", label: "longer ie", sub: "usually spelled ie" },
      { id: "ü", label: "ü", sub: "front rounded" },
    ],
    hint: "Short ih — not the long ee of sie.",
    reference: {
      title: "i length",
      html: `<ul>
        <li>Short: mit, Tisch</li>
        <li>Longer: sie, viel — usually spelled ie</li>
      </ul>`,
    },
  },
  {
    prompt: "Which i did you hear?",
    play: "sie",
    answer: "long",
    parts: [{ text: "sie", guide: "zee" }],
    choices: [
      { id: "short", label: "short i", sub: "ih · closed" },
      { id: "long", label: "longer ie", sub: "usually spelled ie" },
      { id: "ei", label: "ei", sub: "“eye” diphthong" },
    ],
    hint: "ie is the usual long-i spelling — zee, not “eye”.",
    reference: {
      title: "ie vs ei",
      html: `<ul>
        <li><strong>ie</strong> — longer ee (sie)</li>
        <li><strong>ei</strong> — diphthong “eye” (mein)</li>
      </ul>`,
    },
  },
  {
    prompt: "Which o did you hear?",
    play: "oft",
    answer: "short",
    parts: [{ text: "oft", guide: "awft" }],
    choices: [
      { id: "short", label: "short o", sub: "open · brief" },
      { id: "long", label: "longer o", sub: "oo / oh spelling" },
      { id: "ö", label: "ö", sub: "front rounded" },
    ],
    hint: "Short open o — not Boot’s longer o, and not ö.",
    reference: {
      title: "o length",
      html: `<ul>
        <li>Short: oft, Sonne</li>
        <li>Longer: Boot, ohne (oo / oh)</li>
      </ul>`,
    },
  },
  {
    prompt: "Which o did you hear?",
    play: "Boot",
    answer: "long",
    parts: [{ text: "Boot", guide: "boht" }],
    choices: [
      { id: "short", label: "short o", sub: "open · brief" },
      { id: "long", label: "longer o", sub: "oo / oh spelling" },
      { id: "au", label: "au", sub: "“ow” diphthong" },
    ],
    hint: "oo / oh cues a longer o.",
    reference: {
      title: "o length",
      html: `<ul>
        <li>Boot, Sohn — longer o</li>
        <li>Not the diphthong au (Haus)</li>
      </ul>`,
    },
  },
  {
    prompt: "Which u did you hear?",
    play: "und",
    answer: "short",
    parts: [{ text: "und", guide: "oont" }],
    choices: [
      { id: "short", label: "short u", sub: "brief · closed" },
      { id: "long", label: "longer u", sub: "uh often marks length" },
      { id: "ü", label: "ü", sub: "front rounded" },
    ],
    hint: "Short u — Schuh is longer (uh marks length).",
    reference: {
      title: "u length",
      html: `<ul>
        <li>Short: und, Mutter</li>
        <li>Longer: Schuh, Uhr — uh often marks length</li>
      </ul>`,
    },
  },
  {
    prompt: "Which u did you hear?",
    play: "Schuh",
    answer: "long",
    parts: [{ text: "Schuh", guide: "shoo" }],
    choices: [
      { id: "short", label: "short u", sub: "brief · closed" },
      { id: "long", label: "longer u", sub: "uh often marks length" },
      { id: "ü", label: "ü", sub: "front rounded" },
    ],
    hint: "uh between vowels marks a longer u — shoo, not ü.",
    reference: {
      title: "u length",
      html: `<ul>
        <li>Schuh — longer u</li>
        <li>Tür — ü (front rounded), different sound</li>
      </ul>`,
    },
  },
  {
    prompt: "Which umlaut did you hear?",
    play: "Männer",
    answer: "ä",
    parts: [
      { text: "män", guide: "MEN", stress: true },
      { text: "ner", guide: "ner" },
    ],
    choices: [
      { id: "a", label: "a", sub: "plain open a" },
      { id: "ä", label: "ä", sub: "airy eh" },
      { id: "e", label: "e", sub: "short e" },
    ],
    hint: "ä is like a short e / airy eh — not plain a.",
    reference: {
      title: "ä",
      html: `<ul>
        <li>Männer, spät — ä ≈ short e / airy eh</li>
        <li>Stress on first beat: MEN-ner</li>
      </ul>`,
    },
  },
  {
    prompt: "Which vowel did you hear?",
    play: "spät",
    answer: "ä",
    parts: [{ text: "spät", guide: "shpeht" }],
    choices: [
      { id: "a", label: "a", sub: "plain a" },
      { id: "ä", label: "ä", sub: "airy eh · longer" },
      { id: "e", label: "e", sub: "short e" },
    ],
    hint: "Longer ä — äh/ä with length, not plain a.",
    reference: {
      title: "ä length",
      html: `<ul>
        <li>spät — longer ä</li>
        <li>äh in spelling often cues length</li>
      </ul>`,
    },
  },
  {
    prompt: "Which vowel did you hear?",
    play: "öffnen",
    answer: "ö",
    parts: [
      { text: "öff", guide: "OEFF", stress: true },
      { text: "nen", guide: "nen" },
    ],
    choices: [
      { id: "o", label: "o", sub: "back rounded" },
      { id: "ö", label: "ö", sub: "front rounded" },
      { id: "e", label: "e", sub: "unrounded" },
    ],
    hint: "Rounded: lips of o, tongue of e — not in English.",
    reference: {
      title: "ö",
      html: `<ul>
        <li><strong>öffnen</strong> — short ö</li>
        <li><strong>offen</strong> — plain o (different word)</li>
      </ul>`,
    },
  },
  {
    prompt: "Which vowel did you hear?",
    play: "müssen",
    answer: "ü",
    parts: [
      { text: "müs", guide: "MUES", stress: true },
      { text: "sen", guide: "sen" },
    ],
    choices: [
      { id: "u", label: "u", sub: "back rounded" },
      { id: "ü", label: "ü", sub: "front rounded" },
      { id: "i", label: "i", sub: "front unrounded" },
    ],
    hint: "Rounded: lips of u, tongue of i.",
    reference: {
      title: "ü",
      html: `<ul>
        <li>müssen — short ü</li>
        <li>Contrast: muss / Fuß use plain u</li>
      </ul>`,
    },
  },
  {
    prompt: "Which diphthong did you hear?",
    play: "mein",
    answer: "ei",
    parts: [{ text: "mein", guide: "mine" }],
    choices: [
      { id: "ei", label: "ei / ai", sub: "“eye” glide" },
      { id: "ie", label: "ie", sub: "longer ee" },
      { id: "ee", label: "ee", sub: "longer e" },
    ],
    hint: "ei/ai = “eye” — don’t say English “ay” or “ee”.",
    reference: {
      title: "ei / ai",
      html: `<ul>
        <li>mein, Mai — same glide both spellings</li>
        <li>ie is different (sie)</li>
      </ul>`,
    },
  },
  {
    prompt: "Which diphthong did you hear?",
    play: "Haus",
    answer: "au",
    parts: [{ text: "Haus", guide: "hows" }],
    choices: [
      { id: "au", label: "au", sub: "“ow” as in house" },
      { id: "eu", label: "eu / äu", sub: "“oy” glide" },
      { id: "o", label: "o", sub: "plain longer o" },
    ],
    hint: "Like English “house” — ow, not oy.",
    reference: {
      title: "au",
      html: `<ul>
        <li>Haus, auch — au ≈ “ow”</li>
        <li>eu/äu ≈ “oy” (neu)</li>
      </ul>`,
    },
  },
  {
    prompt: "Which diphthong did you hear?",
    play: "neu",
    answer: "eu",
    parts: [{ text: "neu", guide: "noy" }],
    choices: [
      { id: "eu", label: "eu / äu", sub: "“oy” glide" },
      { id: "au", label: "au", sub: "“ow” as in house" },
      { id: "u", label: "u", sub: "plain u" },
    ],
    hint: "eu and äu are spelling twins — both “oy”.",
    reference: {
      title: "eu / äu",
      html: `<ul>
        <li>neu, Häuser — same “oy” glide</li>
        <li>Not au (Haus)</li>
      </ul>`,
    },
  },
  {
    prompt: "Which ch did you hear?",
    play: "ich",
    answer: "soft",
    parts: [{ text: "ich", guide: "ikh" }],
    choices: [
      { id: "soft", label: "soft ch", sub: "after front vowels" },
      { id: "back", label: "back ch", sub: "after a, o, u, au" },
      { id: "sch", label: "sch", sub: "like English sh" },
    ],
    hint: "Soft ch after front vowels (i, e, ä, ö, ü, ei…).",
    reference: {
      title: "ich vs ach",
      html: `<ul>
        <li><strong>ich</strong> — soft after front vowels</li>
        <li><strong>ach</strong> — back after a, o, u, au (Buch)</li>
      </ul>`,
    },
  },
  {
    prompt: "Which ch did you hear?",
    play: "Buch",
    answer: "back",
    parts: [{ text: "Buch", guide: "bookh" }],
    choices: [
      { id: "soft", label: "soft ch", sub: "after front vowels" },
      { id: "back", label: "back ch", sub: "after a, o, u, au" },
      { id: "k", label: "k", sub: "hard stop" },
    ],
    hint: "Back ch after a, o, u, au — not soft ich.",
    reference: {
      title: "ach-sound",
      html: `<ul>
        <li>Buch, auch, Nacht — back ch</li>
        <li>Environment rule, not a different letter</li>
      </ul>`,
    },
  },
  {
    prompt: "How does the v sound here?",
    play: "Vater",
    answer: "f",
    parts: [
      { text: "Va", guide: "FA", stress: true },
      { text: "ter", guide: "ter" },
    ],
    choices: [
      { id: "f", label: "like f", sub: "common for German v" },
      { id: "v", label: "like English v", sub: "as in very" },
      { id: "w", label: "like English w", sub: "as in water" },
    ],
    hint: "German v often = f — not English “vay-ter”.",
    reference: {
      title: "v / f",
      html: `<ul>
        <li>Vater, vier — v usually like f</li>
        <li>w is the letter that sounds like English v (was)</li>
      </ul>`,
    },
  },
  {
    prompt: "How does the w sound here?",
    play: "was",
    answer: "v",
    parts: [{ text: "was", guide: "vas" }],
    choices: [
      { id: "v", label: "like English v", sub: "German w default" },
      { id: "w", label: "like English w", sub: "as in water" },
      { id: "f", label: "like f", sub: "common for German v" },
    ],
    hint: "German w ≈ English v — not English w.",
    reference: {
      title: "w",
      html: `<ul>
        <li>was, wo, Wein — w like English v</li>
      </ul>`,
    },
  },
  {
    prompt: "How does the j sound here?",
    play: "ja",
    answer: "y",
    parts: [{ text: "ja", guide: "ya" }],
    choices: [
      { id: "y", label: "like English y", sub: "yes-glide" },
      { id: "j", label: "like English j", sub: "as in jam" },
      { id: "sh", label: "like sh", sub: "as in journal" },
    ],
    hint: "German j = English y — never English “j”.",
    reference: {
      title: "j",
      html: `<ul>
        <li>ja, Jahr, jung — y-glide</li>
      </ul>`,
    },
  },
  {
    prompt: "How does s sound at the start?",
    play: "Sonne",
    answer: "z",
    parts: [
      { text: "Son", guide: "ZON", stress: true },
      { text: "ne", guide: "ne" },
    ],
    choices: [
      { id: "z", label: "like z", sub: "before a vowel" },
      { id: "s", label: "voiceless s", sub: "ß / ss style" },
      { id: "sh", label: "like sh", sub: "sch style" },
    ],
    hint: "Before a vowel at the start, s is often like English z.",
    reference: {
      title: "s at start",
      html: `<ul>
        <li>Sonne, sehen — often z-like</li>
        <li>ss / ß stay voiceless s (Fuß)</li>
      </ul>`,
    },
  },
  {
    prompt: "Voiced or voiceless s?",
    play: "Fuß",
    answer: "voiceless",
    parts: [{ text: "Fuß", guide: "foos" }],
    choices: [
      { id: "voiceless", label: "voiceless s", sub: "ß / ss" },
      { id: "voiced", label: "z-like s", sub: "start before vowel" },
      { id: "sh", label: "sh", sub: "sch style" },
    ],
    hint: "ß / ss = voiceless s — never the z-like start of Sonne.",
    reference: {
      title: "ß / ss",
      html: `<ul>
        <li>Fuß, wissen — voiceless s</li>
        <li>Sonne — often z-like at the start</li>
      </ul>`,
    },
  },
  {
    prompt: "How does sch sound?",
    play: "Schule",
    answer: "sh",
    parts: [
      { text: "Schu", guide: "SHOO", stress: true },
      { text: "le", guide: "le" },
    ],
    choices: [
      { id: "sh", label: "like sh", sub: "one sound, three letters" },
      { id: "sk", label: "like sk", sub: "English “school”" },
      { id: "ch", label: "soft ch", sub: "after front vowels" },
    ],
    hint: "sch = English sh — one sound, three letters.",
    reference: {
      title: "sch",
      html: `<ul>
        <li>Schule, schon — sh</li>
        <li>Not English “sk” as in school</li>
      </ul>`,
    },
  },
  {
    prompt: "How does sp sound at the start?",
    play: "Spiel",
    answer: "shp",
    parts: [{ text: "Spiel", guide: "shpeel" }],
    choices: [
      { id: "shp", label: "shp", sub: "s → sh + p" },
      { id: "sp", label: "sp", sub: "English spin" },
      { id: "sh", label: "sh only", sub: "no p" },
    ],
    hint: "Word-initial sp → s sounds like sh (shp).",
    reference: {
      title: "sp / st",
      html: `<ul>
        <li>Spiel, Stein — word-initial s → sh</li>
        <li>Mid-word often stays s (Wespe)</li>
      </ul>`,
    },
  },
  {
    prompt: "How does st sound at the start?",
    play: "Stein",
    answer: "sht",
    parts: [{ text: "Stein", guide: "shtine" }],
    choices: [
      { id: "sht", label: "sht", sub: "s → sh + t" },
      { id: "st", label: "st", sub: "English stone" },
      { id: "sh", label: "sh only", sub: "no t" },
    ],
    hint: "Word-initial st → sht.",
    reference: {
      title: "st",
      html: `<ul>
        <li>Stein, stehen — sht at the start</li>
      </ul>`,
    },
  },
  {
    prompt: "How does z sound?",
    play: "Zeit",
    answer: "ts",
    parts: [{ text: "Zeit", guide: "tsite" }],
    choices: [
      { id: "ts", label: "ts", sub: "as in cats" },
      { id: "z", label: "English z", sub: "as in zoo" },
      { id: "s", label: "plain s", sub: "as in see" },
    ],
    hint: "German z = ts (as in cats) — never English z.",
    reference: {
      title: "z / tz",
      html: `<ul>
        <li>Zeit, zu — ts</li>
        <li>tz same sound (Katze)</li>
      </ul>`,
    },
  },
  {
    prompt: "Which cluster did you hear?",
    play: "Apfel",
    answer: "pf",
    parts: [
      { text: "Ap", guide: "AP", stress: true },
      { text: "fel", guide: "fel" },
    ],
    choices: [
      { id: "pf", label: "pf", sub: "both sounds" },
      { id: "f", label: "f only", sub: "English apple" },
      { id: "p", label: "p only", sub: "no f" },
    ],
    hint: "pf is both sounds — not English “apple”.",
    reference: {
      title: "pf",
      html: `<ul>
        <li>Apfel, Pferd — p + f</li>
        <li>Stress on first syllable: AP-fel</li>
      </ul>`,
    },
  },
  {
    prompt: "How does qu sound?",
    play: "Quark",
    answer: "kv",
    parts: [{ text: "Quark", guide: "kvark" }],
    choices: [
      { id: "kv", label: "kv", sub: "k + v" },
      { id: "kw", label: "kw", sub: "English queen" },
      { id: "k", label: "k only", sub: "no v" },
    ],
    hint: "German qu = k + v — not English “kw”.",
    reference: {
      title: "qu",
      html: `<ul>
        <li>Quark, Qualität — kv</li>
      </ul>`,
    },
  },
  {
    prompt: "What is the h doing between vowels?",
    play: "gehen",
    answer: "length",
    parts: [
      { text: "ge", guide: "GE", stress: true },
      { text: "hen", guide: "hen" },
    ],
    choices: [
      { id: "length", label: "marks length", sub: "often silent" },
      { id: "h-sound", label: "sounds like h", sub: "as in hat" },
      { id: "ch", label: "soft ch", sub: "after front vowels" },
    ],
    hint: "Between vowels, h is often silent and marks length on the vowel before.",
    reference: {
      title: "h for length",
      html: `<ul>
        <li>gehen, sehen — h often silent</li>
        <li>Stress: GE-hen</li>
      </ul>`,
    },
  },
  {
    prompt: "What does the double consonant tell you?",
    play: "Mutter",
    answer: "short",
    parts: [
      { text: "Mut", guide: "MUT", stress: true },
      { text: "ter", guide: "ter" },
    ],
    choices: [
      { id: "short", label: "vowel before is short", sub: "tt / pp / ck cue" },
      { id: "long", label: "vowel before is long", sub: "like English “moot”" },
      { id: "stress", label: "stress moves back", sub: "onto the last beat" },
    ],
    hint: "tt / pp / ck → vowel before is short. Stress stays on Mut-.",
    reference: {
      title: "double consonant",
      html: `<ul>
        <li>Mutter, Ecke, Nippel — short vowel before</li>
        <li>Not a cue to stress the second syllable</li>
      </ul>`,
    },
  },
];

/** Syllables set — multi-beat chart words + stress contrast (loanword late stress). */
const soundKaraoke = [
  {
    word: "Männer",
    tts: "Männer",
    syllables: [
      { text: "män", guide: "MEN", stress: true },
      { text: "ner", guide: "ner", stress: false },
    ],
    hint: "Default native stress: first stem syllable — MEN in caps.",
    reference: {
      title: "Männer",
      html: `<ul>
        <li>ä ≈ airy eh</li>
        <li>CAPS + underline = primary stress</li>
      </ul>`,
    },
  },
  {
    word: "öffnen",
    tts: "öffnen",
    syllables: [
      { text: "öff", guide: "OEFF", stress: true },
      { text: "nen", guide: "nen", stress: false },
    ],
    hint: "Front rounded ö on the stressed first beat.",
    reference: {
      title: "öffnen",
      html: `<ul>
        <li>ö — lips of o, tongue of e</li>
        <li>Stress: OEFF-nen</li>
      </ul>`,
    },
  },
  {
    word: "müssen",
    tts: "müssen",
    syllables: [
      { text: "müs", guide: "MUES", stress: true },
      { text: "sen", guide: "sen", stress: false },
    ],
    hint: "Front rounded ü — stress on MUES.",
    reference: {
      title: "müssen",
      html: `<ul>
        <li>ü — lips of u, tongue of i</li>
        <li>Double s keeps the vowel short</li>
      </ul>`,
    },
  },
  {
    word: "Ecke",
    tts: "Ecke",
    syllables: [
      { text: "Eck", guide: "ECK", stress: true },
      { text: "e", guide: "e", stress: false },
    ],
    hint: "ck = k; double c keeps the vowel short. Stress on Eck-.",
    reference: {
      title: "Ecke",
      html: `<ul>
        <li>ck → like k; short vowel before</li>
        <li>Weak -e on the second beat</li>
      </ul>`,
    },
  },
  {
    word: "Vater",
    tts: "Vater",
    syllables: [
      { text: "Va", guide: "FA", stress: true },
      { text: "ter", guide: "ter", stress: false },
    ],
    hint: "v often = f. Stress on FA-.",
    reference: {
      title: "Vater",
      html: `<ul>
        <li>German v ≈ f here</li>
        <li>Not English “vay-ter”</li>
      </ul>`,
    },
  },
  {
    word: "Apfel",
    tts: "Apfel",
    syllables: [
      { text: "Ap", guide: "AP", stress: true },
      { text: "fel", guide: "fel", stress: false },
    ],
    hint: "pf = both sounds. Stress on AP-, not -fel.",
    reference: {
      title: "Apfel",
      html: `<ul>
        <li>pf cluster — p + f</li>
        <li>First-stem stress (native default)</li>
      </ul>`,
    },
  },
  {
    word: "Sonne",
    tts: "Sonne",
    syllables: [
      { text: "Son", guide: "ZON", stress: true },
      { text: "ne", guide: "ne", stress: false },
    ],
    hint: "Initial s before a vowel often sounds like z. Stress on ZON-.",
    reference: {
      title: "Sonne",
      html: `<ul>
        <li>Start s → often z-like</li>
        <li>Double n → short vowel</li>
      </ul>`,
    },
  },
  {
    word: "Schule",
    tts: "Schule",
    syllables: [
      { text: "Schu", guide: "SHOO", stress: true },
      { text: "le", guide: "le", stress: false },
    ],
    hint: "sch = sh (one sound, three letters). Stress on SHOO-.",
    reference: {
      title: "Schule",
      html: `<ul>
        <li>sch → English sh</li>
        <li>Not English “sk”</li>
      </ul>`,
    },
  },
  {
    word: "Katze",
    tts: "Katze",
    syllables: [
      { text: "Kat", guide: "KAT", stress: true },
      { text: "ze", guide: "tse", stress: false },
    ],
    hint: "tz = ts. Stress on KAT-; t marks a short vowel before.",
    reference: {
      title: "Katze",
      html: `<ul>
        <li>z / tz → ts (as in cats)</li>
        <li>Never English z</li>
      </ul>`,
    },
  },
  {
    word: "gehen",
    tts: "gehen",
    syllables: [
      { text: "ge", guide: "GE", stress: true },
      { text: "hen", guide: "hen", stress: false },
    ],
    hint: "Between vowels, h is often silent and marks length. Stress on GE-.",
    reference: {
      title: "gehen",
      html: `<ul>
        <li>h between vowels → often silent / length mark</li>
        <li>Stress stays on the first beat</li>
      </ul>`,
    },
  },
  {
    word: "Mutter",
    tts: "Mutter",
    syllables: [
      { text: "Mut", guide: "MUT", stress: true },
      { text: "ter", guide: "ter", stress: false },
    ],
    hint: "Double t → vowel before is short. Stress on MUT-, not -ter.",
    reference: {
      title: "Mutter",
      html: `<ul>
        <li>tt / pp / ck → short vowel before</li>
        <li>Not a cue to move stress back</li>
      </ul>`,
    },
  },
  {
    word: "Zeitung",
    tts: "Zeitung",
    syllables: [
      { text: "Zei", guide: "TSAI", stress: true },
      { text: "tung", guide: "toong", stress: false },
    ],
    hint: "Native default: first stem syllable — TSAI in caps. z = ts.",
    reference: {
      title: "Zeitung",
      html: `<ul>
        <li>ei → “eye” glide</li>
        <li>z → ts; ng as in sing</li>
        <li>CAPS = primary stress</li>
      </ul>`,
    },
  },
  {
    word: "Universität",
    tts: "Universität",
    syllables: [
      { text: "U", guide: "oo", stress: false },
      { text: "ni", guide: "ni", stress: false },
      { text: "ver", guide: "ver", stress: false },
      { text: "si", guide: "zi", stress: false },
      { text: "tät", guide: "TEHT", stress: true },
    ],
    hint: "Loanword exception: stress near the end — TEHT in caps.",
    reference: {
      title: "Universität",
      html: `<ul>
        <li>Many -ität / foreign endings stress late</li>
        <li>Contrast with first-stem natives like Zeitung</li>
        <li>Respelling: oo-ni-ver-zi-TEHT</li>
      </ul>`,
    },
  },
];

/** English glosses for Sounds reveals / Syllables (not shown in prompts). */
const deEnGloss = {
  Tür: "door",
  schön: "beautiful",
  Mann: "man",
  Bahn: "train / track",
  Bett: "bed",
  See: "lake",
  mit: "with",
  sie: "she / they",
  oft: "often",
  Boot: "boat",
  und: "and",
  Schuh: "shoe",
  Männer: "men",
  spät: "late",
  öffnen: "to open",
  müssen: "must / to have to",
  mein: "my",
  Haus: "house",
  neu: "new",
  ich: "I",
  Buch: "book",
  Vater: "father",
  was: "what",
  ja: "yes",
  Sonne: "sun",
  Fuß: "foot",
  Schule: "school",
  Spiel: "game / play",
  Stein: "stone",
  Zeit: "time",
  Apfel: "apple",
  Quark: "quark (curd cheese)",
  gehen: "to go",
  Mutter: "mother",
  Ecke: "corner",
  Katze: "cat",
  Zeitung: "newspaper",
  Universität: "university",
};

function glossForDe(word) {
  if (!word) return "";
  return deEnGloss[word] || deEnGloss[word.replace(/^./, (c) => c.toUpperCase())] || "";
}

/**
 * Shared post-answer panel: boxed German + phonetic, English outside.
 * Hides question chrome so the reveal replaces the ask UI.
 * Returns phonetic beat nodes for karaoke highlighting.
 * @param {string} [opts.wordHtml] — optional HTML for the DE line (e.g. gendered article)
 */
function setStageAnswerMode(prefix, on) {
  const stage = document.getElementById(`${prefix}-stage`);
  if (stage) stage.classList.toggle("is-answer", !!on);
}

function setVerdict(prefix, ok, label) {
  const el = document.getElementById(`${prefix}-verdict`);
  if (!el) return;
  el.classList.remove("is-ok", "is-bad");
  if (ok === true) {
    el.classList.add("is-ok");
    el.textContent = label || "Correct";
  } else if (ok === false) {
    el.classList.add("is-bad");
    el.textContent = label || "Not quite";
  } else {
    el.textContent = "";
  }
}

function showAttemptFeedback(prefix, message = "Try again", opts = {}) {
  const el = document.getElementById(`${prefix}-attempt-feedback`);
  if (!el) return;
  el.hidden = false;
  el.textContent = message;
  // Retrigger enter animation if already visible
  el.classList.remove("is-flash");
  void el.offsetWidth;
  el.classList.add("is-flash");
  if (opts.sound !== false) playFeedbackSound("retry");
}

function clearAttemptFeedback(prefix) {
  const el = document.getElementById(`${prefix}-attempt-feedback`);
  if (!el) return;
  el.hidden = true;
  el.textContent = "";
  el.classList.remove("is-flash");
}

/** Action instruction line (BUILD THE GERMAN …) above the semantic prompt. */
function setActionInstruction(prefix, text) {
  const el = document.getElementById(`${prefix}-instruction`);
  if (!el) return;
  if (text) {
    el.textContent = text;
    el.hidden = false;
  } else {
    el.textContent = "";
    el.hidden = true;
  }
}

/** Pedagogical feedback node below the prompt (replaces bare red borders). */
function showExerciseFeedback(prefix, html, { hint = false } = {}) {
  const el = document.getElementById(`${prefix}-feedback`);
  if (!el) return;
  el.innerHTML = html;
  el.classList.toggle("is-hint", !!hint);
  el.hidden = false;
}

function clearExerciseFeedback(prefix) {
  const el = document.getElementById(`${prefix}-feedback`);
  if (!el) return;
  el.hidden = true;
  el.innerHTML = "";
  el.classList.remove("is-hint");
}

const NUMBERS_INSTRUCTION = {
  build: "Build the German",
  listen: "Listen & choose",
  convert: "Type the German",
  cloze: "Fill the gap",
  proofread: "Fix the spelling",
  visual: "Name what you see",
  sentence: "Read the sentence",
};

const NOUNS_INSTRUCTION = {
  wugs: "Guess the article",
  "real-words": "Guess the article",
  articles: "Guess the article",
  association: "Guess the article",
  plurals: "Build the plural",
  proofread: "Right or wrong?",
  "reverse-mc": "Pick the noun",
  "gender-recognition": "Pick the gender",
  "article-application": "Guess the article",
  "gender-imposter": "Find the odd one",
  "sentence-validation": "Right or wrong?",
};

/** Brief pause so the correct answer can blink before karaoke / advance. */
let correctFlashTimer = null;
const CORRECT_FLASH_MS = 1150;
/** Settle after answer-key TTS ends, then auto-advance. */
const AFTER_TTS_ADVANCE_MS = 400;
/** When TTS cannot run — give time to read the answer key, then advance. */
const NO_TTS_REVEAL_ADVANCE_MS = 1400;

/**
 * Play answer-key karaoke, then schedule advance.
 * Advances shortly after TTS completes; if TTS cannot run, after a read pause.
 * @param {string} spoken
 * @param {object[]} parts
 * @param {HTMLElement[]} nodes
 * @param {(delayMs: number) => void} scheduleAdvance
 */
function playAnswerKeyThenAdvance(spoken, parts, nodes, scheduleAdvance) {
  const canSpeak =
    !!spoken &&
    Array.isArray(nodes) &&
    nodes.length > 0 &&
    !!window.speechSynthesis &&
    navCaps().audio;
  if (!canSpeak) {
    scheduleAdvance(NO_TTS_REVEAL_ADVANCE_MS);
    return;
  }
  playKaraokeFlow(spoken, parts, nodes, {
    keepAdvance: true,
    onEnd: () => scheduleAdvance(AFTER_TTS_ADVANCE_MS),
    onError: () => scheduleAdvance(NO_TTS_REVEAL_ADVANCE_MS),
  });
}

function clearCorrectFlashTimer() {
  if (correctFlashTimer) {
    clearTimeout(correctFlashTimer);
    correctFlashTimer = null;
  }
}

function applyCorrectFlash(el) {
  if (!el) return;
  el.classList.remove("is-bad", "is-wrong-flash");
  el.classList.add("is-ok", "is-correct-flash");
}

function applyWrongFlash(el) {
  if (!el) return;
  el.classList.remove("is-ok", "is-correct-flash");
  el.classList.add("is-bad", "is-wrong-flash");
}

function flashCorrectThen(done, delayMs = CORRECT_FLASH_MS) {
  clearCorrectFlashTimer();
  const reduced =
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  correctFlashTimer = window.setTimeout(() => {
    correctFlashTimer = null;
    deferHeavy(done);
  }, reduced ? 280 : delayMs);
}

/** Run heavy DOM work outside the current timer/rAF turn (avoids Violation noise). */
function deferHeavy(fn) {
  if (typeof MessageChannel === "function") {
    const ch = new MessageChannel();
    ch.port1.onmessage = () => {
      try {
        fn();
      } catch (err) {
        console.error(err);
      }
    };
    ch.port2.postMessage(null);
    return;
  }
  setTimeout(() => {
    try {
      fn();
    } catch (err) {
      console.error(err);
    }
  }, 0);
}

/**
 * Correct-answer spotlight policy (all quiz types):
 * - Flash the answer field(s) (PART slots / typed input) — not the answer+pronunciation box.
 * - Wrong answer fields use the red flash variant (wrongEls).
 * - Choice/tray chips may get a static green/red border (caller sets is-ok / is-bad);
 *   they are not passed here to flash.
 * - If there is no separate answer field (MC only), flash the correct choice(s).
 * - After the flash, optionally open the answer+pronunciation reveal (no second flash).
 */
function presentCorrectAnswer({
  prefix,
  reveal = null,
  answerEls = [],
  wrongEls = [],
  choiceEls = [],
  then,
}) {
  // Play chime on the same turn as the selection so AudioContext resume
  // stays tied to the user gesture (fillAnswerReveal runs after the flash).
  if (reveal) {
    if (reveal.ok === true) playFeedbackSound("ok");
    else if (reveal.ok === false) playFeedbackSound("bad");
  }
  const snapTargets = answerEls.length ? answerEls : choiceEls;
  for (const el of answerEls) applyCorrectFlash(el);
  for (const el of wrongEls) applyWrongFlash(el);
  // Always flash matching MC choices when provided (all multi-choice modes).
  for (const el of choiceEls) applyCorrectFlash(el);
  // The "Snap": correct field(s) settle into place with a brief spring.
  for (const el of snapTargets) {
    if (!el) continue;
    el.classList.remove("snap-success");
    void el.offsetWidth;
    el.classList.add("snap-success");
  }

  flashCorrectThen(() => {
    let nodes = [];
    if (reveal) nodes = fillAnswerReveal(prefix, { ...reveal, silent: true });
    then?.(nodes);
  });
}

function fillAnswerReveal(prefix, { word, wordHtml, parts, en, ok, verdictLabel, silent }) {
  const root = document.getElementById(`${prefix}-reveal`);
  const wordEl = document.getElementById(`${prefix}-reveal-word`);
  const phonEl = document.getElementById(`${prefix}-reveal-phonetic`);
  const enEl = document.getElementById(`${prefix}-reveal-en`);
  if (!root || !wordEl || !phonEl) return [];

  clearAttemptFeedback(prefix);
  setStageAnswerMode(prefix, true);
  root.hidden = false;
  root.classList.remove("is-ok", "is-bad");
  // Retrigger wash/motion when reusing the same reveal node
  void root.offsetWidth;
  root.classList.toggle("is-ok", ok === true);
  root.classList.toggle("is-bad", ok === false);
  setVerdict(prefix, ok, verdictLabel);
  if (!silent) {
    if (ok === true) playFeedbackSound("ok");
    else if (ok === false) playFeedbackSound("bad");
  }
  wordEl.classList.remove("is-correct-flash");
  wordEl.setAttribute("lang", "de");
  if (wordHtml) wordEl.innerHTML = wordHtml;
  else wordEl.textContent = softHyphenateGerman(word, parts);
  phonEl.innerHTML = "";
  phonEl.setAttribute("lang", "de");

  const nodes = [];
  (parts || []).forEach((p, i) => {
    if (i > 0) {
      phonEl.appendChild(document.createTextNode(" · "));
    }
    const span = document.createElement("span");
    span.className = "phon-beat" + (p.stress ? " has-stress" : "");
    span.textContent = p.guide || p.text || "";
    phonEl.appendChild(span);
    nodes.push(span);
  });

  if (enEl) {
    if (en) {
      enEl.hidden = false;
      enEl.textContent = en;
    } else {
      enEl.hidden = true;
      enEl.textContent = "";
    }
  }

  return nodes;
}

/** Color-only tint for answer-key articles (no gender formatting). */
function articleColorClass(article, gender) {
  if (gender === "masculine" || article === "der") return "art-color-masc";
  if (gender === "feminine" || article === "die") return "art-color-fem";
  if (gender === "neuter" || article === "das") return "art-color-neut";
  return "";
}

/**
 * Answer-key DE line: colored article + lemma.
 * Assisted: Zeit-ung (hyphen + gender-colored suffix).
 * Core: Zeitung (no hyphen; gender-colored suffix only).
 */
function nounAnswerWordHtml(article, lemma, gender, opts = {}) {
  const { stem, ending, assisted = false } = opts;
  const tint = articleColorClass(article, gender);
  const art = tint
    ? `<span class="answer-art ${tint}">${article}</span>`
    : article;
  let lemmaHtml = lemma;
  if (stem && ending) {
    // Assisted: visible pedagogical hyphen. Core: soft hyphen for wrap only.
    const join = assisted ? "-" : SOFT_HYPHEN;
    lemmaHtml = `<span class="answer-lemma"><span class="answer-stem">${stem}</span>${join}<span class="answer-suf ${tint}">${ending}</span></span>`;
  }
  return `${art} ${lemmaHtml}`;
}

/**
 * Plural answer-key: die + stem + ending.
 * No gender tint — plural die is number, not feminine gender of the noun.
 */
function nounPluralAnswerWordHtml(parts) {
  const [article, stem, ending] = parts;
  return `${article} ${joinNounPluralParts([stem, ending])}`;
}

function clearAnswerReveal(prefix) {
  clearCorrectFlashTimer();
  setStageAnswerMode(prefix, false);
  clearAttemptFeedback(prefix);
  const root = document.getElementById(`${prefix}-reveal`);
  if (!root) return;
  root.hidden = true;
  root.classList.remove("is-ok", "is-bad");
  setVerdict(prefix, null);
  const wordEl = document.getElementById(`${prefix}-reveal-word`);
  const phonEl = document.getElementById(`${prefix}-reveal-phonetic`);
  const enEl = document.getElementById(`${prefix}-reveal-en`);
  if (wordEl) {
    wordEl.textContent = "";
    wordEl.innerHTML = "";
  }
  if (phonEl) phonEl.innerHTML = "";
  if (enEl) {
    enEl.hidden = true;
    enEl.textContent = "";
  }
}

const state = {
  view: "hub",
  selectedPiece: null,
  numbersIndex: 0,
  /** Shuffled Build/Convert order for the current step; reshuffles after a full pass. */
  numbersStepDeck: null,
  numbersStepDeckKey: "",
  /** Shuffled order for Listen; cursor walks the deck. */
  numbersListenDeck: null,
  numbersListenCursor: 0,
  numbersListenPoolKey: "",
  numbersTopic: "cardinals",
  numbersStep: "compounds",
  numbersQuizMode: "build",
  nounsIndex: 0,
  nounsPluralIndex: 0,
  nounsAssociationIndex: 0,
  nounsCategoryGenderRecognitionIndex: 0,
  nounsCategoryArticleApplicationIndex: 0,
  nounsCategoryGenderImposterIndex: 0,
  nounsCategorySentenceValidationIndex: 0,
  nounsWugIndex: 0,
  nounsProofreadIndex: 0,
  nounsReverseIndex: 0,
  /** Shuffled question decks (rebuilt when mode starts / pass completes). */
  nounsArticleDeck: null,
  nounsPluralDeck: null,
  nounsAssociationDeck: null,
  nounsWugDeck: null,
  nounsProofreadDeck: null,
  nounsReverseDeck: null,
  numbersFilled: [],
  nounsFilled: [],
  nounsArticle: null,
  numbersListenChoice: null,
  /** Listen Assisted: one retry after a wrong pick, then reveal. */
  numbersListenRetryUsed: false,
  nounsConvertRetryUsed: false,
  nounsDiscriminateRetryUsed: false,
  soundsMode: "karaoke",
  nounsMode: "wugs",
  /** Gender Shortcuts learn unit: suffixes | categories */
  nounsLearnUnit: "suffixes",
  /** focus | family-mix */
  nounsSessionKind: "focus",
  nounsFamilyMix: [],
  nounsModality: "choose-article",
  /** Hub: learn unit id while Practice family picker is open. */
  nounsHubPracticePick: "",
  /** When Play selects Numbers + Nouns, randomly interleave territories. */
  crossTerritoryMix: null,
  /** Learn: DFS-ordered units through the selection. */
  learnSeries: null,
  numbersDifficulty: "assisted",
  nounsDifficulty: "assisted",
  soundsDifficulty: "assisted",
  /** Rolling accuracy per suffix family id (Association mode). */
  nounFamilyStats: {},
  currentExercise: null,
  soundsIndex: 0,
  soundsChoice: null,
  soundsChecked: false,
  numbersChecked: false,
  nounsChecked: false,
  /** Plurals: one retry after a wrong build, then reveal. */
  nounsPluralRetryUsed: false,
  soundsAdvanceTimer: null,
  nounsAdvanceTimer: null,
  numbersAdvanceTimer: null,
  karaokeTimer: null,
  karaokeTimers: [],
  ttsMsPerChar: null,
  /** In-memory attempt log (mock stand-in for persistence). */
  attemptLog: [],

  /** Active vocabulary panel controller (Learn/Practice). */
  vocabMount: null,
  /** "learn" | "practice" while phase is vocab-* */
  vocabMode: "learn",
  /** Optional Numbers Vocabulary area filter (null = all). */
  vocabAreas: null,
  /** Shared Learn/Practice Custom mix playlist (session crumb dropdown). */
  sessionPlaylist: emptyPlaylistState(),
  /** @type {{ destroy: Function, refresh: Function } | null} */
  playlistMount: null,

  /** briefing | chart | practice | hub | vocab-learn | vocab-practice */
  phase: {
    sounds: "briefing",
    numbers: "hub",
    nouns: "hub",
  },
  /**
   * When true, returning to practice restores the hidden stage instead of
   * remounting (so Briefing/Chart peek doesn't wipe the current question).
   */
  preservePractice: {
    sounds: false,
    numbers: false,
    nouns: false,
  },
  /** Hub browse: which topic accordion is open ("" = all closed). */
  numbersHubTopic: "cardinals",
  /** Focus lock: practice stays on this topic+step until Change focus. */
  numbersFocusLocked: true,
  /** "step" = single focus; "mix" = shuffled multi-step deck. */
  numbersSessionKind: "step",
  /** Custom mix: step ids added via + Mix (Cardinals for now). */
  numbersMixSteps: [],
  numbersMixTopic: "cardinals",
  /** @type {{ topicId: string, stepId: string }[]} multi-topic mix units */
  numbersMixEntries: [],
  numbersMixMode: "build",
  /** @type {{ keyboard: boolean, audio: boolean } | null} */
  navCaps: null,
  /** Active session mode for the persistent header: learn | play | guided. */
  sessionMode: null,
  /** @type {{ code: string, label: string, hint?: string } | null} Dealer reason. */
  currentReasonCode: null,
  /** Guided: dealer decision log for this session (debug). */
  guidedDealLog: [],
  /** Guided: final Q&A rows for this session (debug) — question + final answer only. */
  guidedQaLog: [],
  /** Guided: index into attemptLog when the session started (legacy slice fallback). */
  guidedAttemptStartIndex: 0,
  numbersMixDeck: null,
  numbersMixDeckKey: "",
  numbersMixCursor: 0,
  /** Visited Numbers questions in order — Back/Forward move an index through this. */
  numbersHistory: [],
  numbersHistoryIndex: -1,
  /** Hub: `${topic}:${step}` while Practice mode picker is open. */
  numbersHubPracticePick: "",
  soundsChartTab: "vowels",
  numbersChartTab: "base",
  nounsChartTab: "feminine",
};

/** Caps from hub carousel (localStorage) + session Start; default Write+Listen on.
 * Each style: false (off) | true (include) | "only" (exclusive — inverted button).
 * Pick-style quizzes (Build) stay available unless a style is exclusive. */
function normalizeCapValue(v) {
  if (v === "only") return "only";
  return v !== false;
}

function capEnabled(v) {
  return v === true || v === "only";
}

function capExclusive(v) {
  return v === "only";
}

function navCaps() {
  try {
    const raw = localStorage.getItem("schnapp-nav-caps");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        keyboard: normalizeCapValue(parsed.keyboard),
        audio: normalizeCapValue(parsed.audio),
      };
    }
  } catch (_) {
    /* ignore */
  }
  return {
    keyboard: normalizeCapValue(state.navCaps?.keyboard),
    audio: normalizeCapValue(state.navCaps?.audio),
  };
}

function modeAllowedByCaps(modeId) {
  const caps = navCaps();
  if (capExclusive(caps.keyboard)) {
    return modeId === "convert" || modeId === "proofread";
  }
  if (capExclusive(caps.audio)) {
    return modeId === "listen";
  }
  if (modeId === "listen" && !capEnabled(caps.audio)) return false;
  if (
    (modeId === "convert" || modeId === "proofread") &&
    !capEnabled(caps.keyboard)
  ) {
    return false;
  }
  return true;
}

function filterModesForCaps(modes) {
  return (modes || []).filter((m) => modeAllowedByCaps(m.id));
}

/** Mix mode id respecting hub caps (build / listen / either / convert). */
function mixModeForCaps(preferred) {
  const caps = navCaps();
  if (capExclusive(caps.keyboard)) return "convert";
  if (capExclusive(caps.audio)) return "listen";
  const p = preferred || "either";
  if (p === "build") return "build";
  if (p === "listen") return modeAllowedByCaps("listen") ? "listen" : firstAllowedModeId();
  if (p === "convert")
    return modeAllowedByCaps("convert") ? "convert" : firstAllowedModeId();
  if (capEnabled(caps.audio) || capEnabled(caps.keyboard)) return "either";
  return "build";
}

function firstAllowedModeId() {
  if (modeAllowedByCaps("build")) return "build";
  if (modeAllowedByCaps("listen")) return "listen";
  if (modeAllowedByCaps("convert")) return "convert";
  return "build";
}

function mixModeOptionsForCaps() {
  const caps = navCaps();
  if (capExclusive(caps.keyboard)) return [{ id: "convert", label: "Convert" }];
  if (capExclusive(caps.audio)) return [{ id: "listen", label: "Listen" }];
  const opts = [{ id: "build", label: "Build" }];
  if (capEnabled(caps.audio)) opts.push({ id: "listen", label: "Listen" });
  if (capEnabled(caps.keyboard)) opts.push({ id: "convert", label: "Convert" });
  if (opts.length > 1) opts.push({ id: "either", label: "Either" });
  return opts;
}

function capsSessionHint() {
  const caps = navCaps();
  if (capExclusive(caps.keyboard)) return "write only";
  if (capExclusive(caps.audio)) return "listen only";
  if (capEnabled(caps.keyboard) && capEnabled(caps.audio)) return "";
  const parts = [];
  if (!capEnabled(caps.audio)) parts.push("listen off");
  if (!capEnabled(caps.keyboard)) parts.push("write off");
  return parts.join(" · ");
}

function suggestFocusForCaps(current) {
  const suggestion = suggestNumbersFocus(current);
  if (modeAllowedByCaps(suggestion.modeId)) return suggestion;
  const modes = filterModesForCaps(
    modesForStep(suggestion.topicId, suggestion.stepId)
  );
  return {
    ...suggestion,
    modeId: modes[0]?.id || "build",
  };
}

const els = {
  grid: document.getElementById("territory-grid"),
  navCarouselRoot: document.getElementById("nav-carousel-root"),
  views: {
    hub: document.getElementById("view-hub"),
    numbers: document.getElementById("view-numbers"),
    nouns: document.getElementById("view-nouns"),
    sounds: document.getElementById("view-sounds"),
    coming: document.getElementById("view-coming"),
  },
};

const SESSION_MODE_LABELS = { learn: "Learn", play: "Play", guided: "Guided" };
const NOUNS_MODE_CRUMB = {
  wugs: "Wugs",
  "real-words": "Real Words",
  association: "Associations",
  proofread: "Proofread",
  "reverse-mc": "Reverse",
  plurals: "Plurals",
  articles: "Articles",
  "gender-recognition": "Gender Recognition",
  "article-application": "Article Application",
  "gender-imposter": "Gender Imposter",
  "sentence-validation": "Sentence Validation",
};

function destroyPlaylistMount() {
  state.playlistMount?.destroy?.();
  state.playlistMount = null;
  state.playlistMountKind = null;
  const host = document.getElementById("session-playlist-host");
  if (host) {
    host.innerHTML = "";
    host.hidden = true;
  }
}

function clearSessionPlaylist() {
  destroyPlaylistMount();
  state.sessionPlaylist = emptyPlaylistState();
}

function defaultPlaylistSequence() {
  return state.sessionMode === "play" ? "random" : "order";
}

function seedNumbersPlaylist(quizUnits, { vocabOnly = false } = {}) {
  const catalog = buildNumbersCatalog(
    NUMBERS_TOPICS,
    vocabularyAreas.numbers || [],
    curriculumTopicToVocabArea,
    quizUnits || [],
    { includeVocab: true, forceAllTopics: false }
  );
  const ids = catalogUnitIds(catalog);
  state.sessionPlaylist = {
    initialUnitIds: [...ids],
    enabledUnitIds: [...ids],
    sequence: defaultPlaylistSequence(),
    catalog,
    territory: "numbers",
    kind: vocabOnly || !(quizUnits || []).length ? "numbers-vocab" : "numbers-quiz",
  };
}

function seedNounsPlaylist(familyIds) {
  let cat = buildNounsCatalog(GENDER_SHORTCUTS_UNITS, familyIds);
  if (!catalogUnitIds(cat).length && familyIds?.length) {
    const want = new Set(familyIds);
    cat = buildNounsCatalog(GENDER_SHORTCUTS_UNITS, null)
      .map((t) => ({
        ...t,
        children: (t.children || []).filter((c) => want.has(c.familyId)),
      }))
      .filter((t) => t.children.length);
  }
  const ids = catalogUnitIds(cat);
  state.sessionPlaylist = {
    initialUnitIds: [...ids],
    enabledUnitIds: [...ids],
    sequence: defaultPlaylistSequence(),
    catalog: cat,
    territory: "nouns",
    kind: "nouns",
  };
}

function applyPlaylistSequenceToDeck(deck) {
  if (!Array.isArray(deck) || deck.length < 2) return deck;
  if (state.sessionPlaylist.sequence === "random") {
    return shuffleAvoidingKey(deck, numbersItemKey(deck[0]));
  }
  return sortMixDeckInOrder(deck);
}

function sortMixDeckInOrder(deck) {
  const topicOrder = NUMBERS_TOPICS.map((t) => t.id);
  const stepOrder = new Map();
  for (const t of NUMBERS_TOPICS) {
    (t.steps || []).forEach((s, i) =>
      stepOrder.set(`${t.id}:${s.id}`, i)
    );
  }
  const modeOrder = [
    "build",
    "listen",
    "convert",
    "cloze",
    "proofread",
    "visual",
    "sentence",
  ];
  return [...deck].sort((a, b) => {
    const ta = topicOrder.indexOf(a.topicId);
    const tb = topicOrder.indexOf(b.topicId);
    if (ta !== tb) return ta - tb;
    const sa = stepOrder.get(`${a.topicId}:${a.stepId}`) ?? 0;
    const sb = stepOrder.get(`${b.topicId}:${b.stepId}`) ?? 0;
    if (sa !== sb) return sa - sb;
    return modeOrder.indexOf(a.mode) - modeOrder.indexOf(b.mode);
  });
}

/** Rebuild active Learn/Practice from sessionPlaylist (immediate). */
function rebuildSessionFromPlaylist() {
  const pl = state.sessionPlaylist;
  if (!pl?.catalog?.length) return;

  if (pl.kind === "numbers-quiz" || pl.kind === "numbers-vocab") {
    const quiz = enabledQuizEntries(pl);
    const areas = enabledVocabAreas(pl);

    if (quiz.length) {
      pl.kind = "numbers-quiz";
      clearLearnSeries();
      state.numbersMixEntries = quiz.map((e) => ({
        topicId: e.topicId,
        stepId: e.stepId,
      }));
      state.numbersMixSteps = quiz.map((e) => e.stepId);
      const topics = [...new Set(quiz.map((e) => e.topicId))];
      state.numbersMixTopic = topics.length === 1 ? topics[0] : "multi";
      state.numbersMixMode = mixModeForCaps(state.numbersMixMode || "either");
      if (!prepareNumbersMixState()) return;
      if (state.numbersMixDeck?.length) {
        state.numbersMixDeck = applyPlaylistSequenceToDeck(state.numbersMixDeck);
        state.numbersMixCursor = 0;
        syncMixItemFocus();
      }
      state.phase.numbers = "practice";
      state.preservePractice.numbers = false;
      destroyVocabMount();
      showTerritoryPhase("numbers");
      renderNumbers();
      updateSessionCrumb("numbers");
      return;
    }

    if (areas.length || playlistHasVocab(pl)) {
      pl.kind = "numbers-vocab";
      clearLearnSeries();
      state.vocabAreas = areas.length ? areas : null;
      state.vocabMode = state.sessionMode === "learn" ? "learn" : "practice";
      state.phase.numbers =
        state.vocabMode === "practice" ? "vocab-practice" : "vocab-learn";
      state.preservePractice.numbers = false;
      showTerritoryPhase("numbers");
      updateSessionCrumb("numbers");
      return;
    }
    updateSessionCrumb("numbers");
    return;
  }

  if (pl.kind === "nouns") {
    const fams = enabledNounFamilies(pl);
    if (!fams.length) {
      updateSessionCrumb("nouns");
      return;
    }
    clearLearnSeries();
    const uniqueFamilies = fams.map((f) => f.familyId);
    state.nounsLearnUnit =
      fams[0].learnUnitId || unitIdForFamily(uniqueFamilies[0]);
    if (uniqueFamilies.length === 1) {
      state.nounsSessionKind = "focus";
      state.nounsFamilyMix = [];
      state.nounsMode = uniqueFamilies[0];
    } else {
      state.nounsSessionKind = "family-mix";
      state.nounsFamilyMix =
        pl.sequence === "random"
          ? shuffle([...uniqueFamilies])
          : uniqueFamilies;
      state.nounsMode = state.nounsFamilyMix[0];
    }
    resetNounsDeckForMode();
    state.phase.nouns = "practice";
    state.preservePractice.nouns = false;
    showTerritoryPhase("nouns");
    updateSessionCrumb("nouns");
  }
}

function syncPlaylistDropdown() {
  const host = document.getElementById("session-playlist-host");
  if (!host) return;
  const pl = state.sessionPlaylist;
  const guided = state.sessionMode === "guided";
  const hasCatalog = pl?.catalog?.length > 0;
  const view = state.view;
  const inSession =
    (view === "numbers" || view === "nouns") &&
    state.phase[view] !== "hub" &&
    state.sessionMode;

  if (!inSession || !hasCatalog || guided) {
    destroyPlaylistMount();
    return;
  }

  if (state.playlistMount && state.playlistMountKind === pl.kind) {
    state.playlistMount.refresh();
    return;
  }

  destroyPlaylistMount();
  state.playlistMountKind = pl.kind;
  state.playlistMount = mountSessionPlaylistDropdown(host, {
    getPlaylist: () => state.sessionPlaylist,
    disabled: false,
    getCaps: () => navCaps(),
    onCaps: (caps) => setNavCaps(caps),
    getCurrentUnitId: currentPlaylistUnitId,
    onChange: (next) => {
      state.sessionPlaylist = { ...state.sessionPlaylist, ...next };
      rebuildSessionFromPlaylist();
    },
  });
}

function currentPlaylistUnitId() {
  const pl = state.sessionPlaylist;
  if (!pl?.kind) return null;
  if (pl.kind === "numbers-quiz") {
    if (state.numbersTopic && state.numbersStep) {
      return `${state.numbersTopic}:${state.numbersStep}`;
    }
    return null;
  }
  if (pl.kind === "numbers-vocab") {
    const item = state.vocabMount?.getCurrentItem?.();
    if (item?.area) return `vocab:numbers:${item.area}`;
    const areas = enabledVocabAreas(pl);
    return areas[0] ? `vocab:numbers:${areas[0]}` : null;
  }
  if (pl.kind === "nouns" && state.nounsMode) {
    return `nouns:family:${state.nounsMode}`;
  }
  return null;
}

function setNavCaps({ keyboard, audio }) {
  const next = {
    keyboard: normalizeCapValue(keyboard),
    audio: normalizeCapValue(audio),
  };
  if (capExclusive(next.keyboard) && capExclusive(next.audio)) {
    // Mutual exclusion — keep the one just set by preferring keyboard if both.
    next.audio = false;
  }
  state.navCaps = next;
  try {
    localStorage.setItem("schnapp-nav-caps", JSON.stringify(next));
  } catch (_) {
    /* ignore */
  }
  state.numbersMixMode = mixModeForCaps(state.numbersMixMode || "either");
  clearNumbersHistory();
  if (state.sessionPlaylist?.kind === "numbers-quiz") {
    rebuildSessionFromPlaylist();
    return;
  }
  if (state.view === "numbers" && state.phase.numbers === "practice") {
    clearNumbersAdvance();
    stopSpeech();
    renderNumbers();
    return;
  }
  if (state.view === "nouns" && state.phase.nouns === "practice") {
    clearNounsAdvance();
    stopSpeech();
    renderNouns();
  }
}

function syncScaffoldMenu() {
  const diff = state.numbersDifficulty === "core" ? "core" : "assisted";
  document.querySelectorAll("[data-scaffold-difficulty]").forEach((btn) => {
    const on = btn.dataset.scaffoldDifficulty === diff;
    btn.setAttribute("aria-checked", String(on));
    const mark = btn.querySelector(".menu-check-mark");
    if (mark) mark.textContent = on ? "✓" : "";
  });
}

function setScaffoldDifficulty(diff) {
  const next = diff === "core" ? "core" : "assisted";
  state.numbersDifficulty = next;
  state.nounsDifficulty = next;
  state.soundsDifficulty = next;
  syncScaffoldMenu();
  if (state.view === "numbers" && state.phase.numbers === "practice") {
    clearNumbersAdvance();
    stopSpeech();
    showTerritoryPhase("numbers");
    return;
  }
  if (state.view === "nouns" && state.phase.nouns === "practice") {
    clearNounsAdvance();
    stopSpeech();
    showTerritoryPhase("nouns");
    return;
  }
  if (state.view === "sounds" && state.phase.sounds === "practice") {
    setSoundsDifficulty(next);
    showTerritoryPhase("sounds");
  }
}

function refreshPlaylistChrome() {
  state.playlistMount?.refresh?.();
}

/** Short breadcrumb segments for the persistent session header. */
function sessionCrumbParts(view) {
  if (view === "numbers") {
    if (state.sessionPlaylist?.kind === "numbers-vocab") return ["Vocabulary"];
    if (state.numbersSessionKind === "mix") return ["Custom mix"];
    const step = getNumbersStep(state.numbersTopic, state.numbersStep)?.label;
    // Guided chrome is tight: badge + step + reason — drop Numbers/topic/mode.
    if (state.sessionMode === "guided") return [step].filter(Boolean);
    const topic = getNumbersTopic(state.numbersTopic)?.label || "Numbers";
    const mode = getNumbersMode(state.numbersQuizMode)?.label;
    // Drop redundant "Numbers" — the territory is clear from context.
    return [topic, step, mode].filter(Boolean);
  }
  if (view === "nouns") {
    if (state.nounsSessionKind === "family-mix") return ["Custom mix"];
    const unit = getGenderShortcutsUnit(state.nounsLearnUnit)?.label || "Nouns";
    const fam = NOUNS_MODE_CRUMB[state.nounsMode] || "";
    if (state.sessionMode === "guided") return [fam || unit].filter(Boolean);
    return [unit, fam].filter(Boolean);
  }
  if (view === "sounds") return ["Sounds"];
  return [];
}

/** Persistent chrome: Guided badge/breadcrumb, or full-width playlist. */
function updateSessionCrumb(view) {
  const bar = document.getElementById("session-crumb");
  const modeEl = document.getElementById("session-mode");
  const crumbEl = document.getElementById("session-breadcrumb");
  if (!bar || !modeEl || !crumbEl) return;

  const isSession = view === "numbers" || view === "nouns" || view === "sounds";
  // Show for any in-territory phase except the territory's own hub screen.
  const inTerritory = isSession && state.phase[view] !== "hub";
  if (!inTerritory || !state.sessionMode) {
    bar.hidden = true;
    destroyPlaylistMount();
    return;
  }

  const modeKey = state.sessionMode || "play";
  const guided = modeKey === "guided";
  const hasPlaylist =
    !guided &&
    (view === "numbers" || view === "nouns") &&
    state.sessionPlaylist?.catalog?.length > 0;

  modeEl.textContent = SESSION_MODE_LABELS[modeKey] || "Play";
  modeEl.dataset.mode = modeKey;
  modeEl.hidden = !guided;
  crumbEl.hidden = hasPlaylist && !guided;

  // Guided: mode badge opens the Coach sheet (why this path / progress).
  if (guided) {
    modeEl.setAttribute("role", "button");
    modeEl.tabIndex = 0;
    modeEl.setAttribute(
      "aria-label",
      "Guided path — why this exercise and your progress"
    );
    modeEl.title = "Why this path?";
    modeEl.classList.add("is-coach");
  } else {
    modeEl.removeAttribute("role");
    modeEl.removeAttribute("tabindex");
    modeEl.removeAttribute("aria-label");
    modeEl.removeAttribute("title");
    modeEl.classList.remove("is-coach");
  }

  if (!crumbEl.hidden) {
    const parts = sessionCrumbParts(view);
    crumbEl.innerHTML = parts
      .map(
        (p, i) =>
          `<span class="crumb-seg${
            i === parts.length - 1 ? " is-current" : ""
          }">${p}</span>`
      )
      .join('<span class="crumb-sep" aria-hidden="true">·</span>');

    // Reason chip = Coach's "why this exercise" signal (Review / New / Continue).
    const reason = state.currentReasonCode;
    if (reason && reason.label) {
      if (guided) {
        crumbEl.insertAdjacentHTML(
          "beforeend",
          `<button type="button" class="crumb-reason crumb-reason-${
            reason.code
          } is-coach" data-coach-open title="Why this exercise?">${
            reason.label
          }</button>`
        );
      } else {
        crumbEl.insertAdjacentHTML(
          "beforeend",
          `<span class="crumb-reason crumb-reason-${reason.code}" title="${
            reason.hint || ""
          }">${reason.label}</span>`
        );
      }
    }

    if (guided) {
      crumbEl.insertAdjacentHTML(
        "beforeend",
        `<button type="button" class="crumb-debug" data-guided-debug title="Session Q&amp;A and dealer log">Debug</button>`
      );
    }
  } else {
    crumbEl.innerHTML = "";
  }

  bar.hidden = false;
  syncPlaylistDropdown();
}

function navigate(view, opts = {}) {
  state.view = view;
  state.selectedPiece = null;
  document.body.classList.toggle("is-session", view !== "hub");
  stopSpeech();
  closeSheet();
  closeAllMenus();
  syncTerritoryChrome(view);

  Object.entries(els.views).forEach(([key, node]) => {
    const on = key === view;
    node.classList.toggle("is-active", on);
    node.hidden = !on;
  });

  if (view === "hub") {
    navCarouselApi?.resetToMode?.();
  }

  if (view === "numbers" || view === "nouns" || view === "sounds") {
    if (!opts.keepPhase) {
      state.phase[view] =
        view === "numbers" || view === "nouns" ? "hub" : "practice";
      state.preservePractice[view] = false;
    }
    showTerritoryPhase(view);
  }
  if (view === "coming") {
    const titleEl = document.getElementById("coming-title");
    if (titleEl) {
      titleEl.textContent = opts.title || "Coming soon";
      titleEl.hidden = false;
    }
    document.getElementById("coming-body").textContent =
      opts.body || "This territory is on the map but not built yet.";
  }

  updateSessionCrumb(view);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function syncTerritoryChrome(view) {
  document.querySelectorAll(".territory-menu").forEach((el) => {
    el.hidden = el.dataset.territory !== view;
  });
  const coming = document.getElementById("coming-title");
  if (coming && view !== "coming") coming.hidden = true;
}

function briefingExampleHtml() {
  return `<div class="briefing-example" aria-hidden="true">
    <button type="button" class="syl has-stress" tabindex="-1">
      <span class="syl-ortho">Zei</span>
      <span class="syl-guide">TSAI</span>
    </button>
    <button type="button" class="syl" tabindex="-1">
      <span class="syl-ortho">tung</span>
      <span class="syl-guide">toong</span>
    </button>
  </div>`;
}

/** Shared syllable chip used in chart + quiz. */
function makeSylButton({
  ortho,
  guide,
  stress = false,
  say,
  lang = "de-DE",
  ariaLabel,
}) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "syl" + (stress ? " has-stress" : "");
  const canSpeak = !!say && navCaps().audio;
  if (canSpeak) {
    btn.dataset.say = say;
    btn.dataset.lang = lang;
  } else {
    btn.disabled = true;
    btn.classList.add("syl-mute");
  }
  btn.setAttribute(
    "aria-label",
    ariaLabel || (canSpeak ? `Play ${say}` : `${ortho}, no audio`)
  );
  btn.innerHTML = `
    <span class="syl-ortho">${ortho}</span>
    <span class="syl-guide">${guide}</span>
  `;
  if (canSpeak) {
    btn.addEventListener("click", () => playSylChip(btn, say, lang));
  }
  return btn;
}

/**
 * Highlight chip + speak one beat (quiz syllable tap).
 */
function playSylChip(node, text, lang = "de-DE") {
  if (!navCaps().audio) return;
  stopSpeech();
  node.classList.add("is-active");
  withUtterance(text, {
    lang,
    rate: 0.85,
    onEnd: () => {
      state.karaokeTimer = setTimeout(() => {
        node.classList.remove("is-active");
      }, 180);
    },
    onError: () => {
      node.classList.remove("is-active");
    },
  });
}

/** Build a non-clickable syllable chip (used inside chart example karaoke group). */
function makeSylDisplay({ ortho, guide, stress = false }) {
  const el = document.createElement("div");
  el.className = "syl" + (stress ? " has-stress" : "");
  el.innerHTML = `
    <span class="syl-ortho">${ortho}</span>
    <span class="syl-guide">${guide}</span>
  `;
  return el;
}

/** Wire karaoke play on the example button and the left cue (same utterance). */
function wireChartRowPlay(exampleBtn, patternEl, play) {
  exampleBtn.addEventListener("click", play);
  if (!patternEl) return;
  patternEl.classList.add("is-playable");
  patternEl.setAttribute("role", "button");
  patternEl.tabIndex = 0;
  patternEl.title = "Tap to hear";
  const onActivate = (e) => {
    if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    play();
  };
  patternEl.addEventListener("click", onActivate);
  patternEl.addEventListener("keydown", onActivate);
}

function renderSoundsChart() {
  const root = document.getElementById("sounds-chart");
  if (!root) return;

  const tab = state.soundsChartTab;
  const rows = soundsChart[tab] || [];

  const tabs = soundsChart.tabs
    .map(
      (t) =>
        `<button type="button" class="chip${t.id === tab ? " is-on" : ""}" data-chart-tab="${t.id}" aria-pressed="${t.id === tab}">${t.label}</button>`
    )
    .join("");

  const activeTab = soundsChart.tabs.find((t) => t.id === tab);
  const tabBlurb = activeTab?.blurb
    ? `<p class="chart-tab-blurb">${activeTab.blurb}</p>`
    : "";

  root.innerHTML = `
    <div class="chart-tabs" role="tablist">${tabs}</div>
    <div class="chart-scroll">
      <p class="chart-note">Curated high-value patterns — not every German sound. Tap a cue or example to hear the word; CAPS + underline = stressed syllable.</p>
      ${tabBlurb}
      <div class="chart-list" id="chart-list"></div>
    </div>
  `;

  const list = root.querySelector("#chart-list");
  rows.forEach((r) => {
    const row = document.createElement("div");
    row.className = "chart-row";

    const pattern = document.createElement("div");
    pattern.className = "chart-pattern";
    const spells = (r.spells || [r.spell]).filter(Boolean).join(", ");
    pattern.innerHTML = `
      <p class="chart-formula">
        <span class="chart-spells">${spells}</span>
        <span class="chart-eq">=</span>
        <span class="chart-guide">${r.guide}</span>
      </p>
      ${r.note ? `<p class="chart-note-cell">${r.note}</p>` : ""}
    `;

    const example = document.createElement("button");
    example.type = "button";
    example.className = "chart-example-play";
    example.setAttribute(
      "aria-label",
      `Play ${(r.parts || []).map((p) => p.text).join("")}`
    );

    const chips = document.createElement("div");
    chips.className = "chart-chips chart-chips-example";
    const parts = r.parts || [];
    parts.forEach((p) => {
      chips.appendChild(
        makeSylDisplay({
          ortho: p.text,
          guide: p.guide,
          stress: !!p.stress,
        })
      );
    });
    example.appendChild(chips);

    const play = () => {
      const nodes = [...chips.querySelectorAll(".syl")];
      const tts = parts.map((p) => p.text).join("");
      playKaraokeFlow(tts, parts, nodes);
    };
    wireChartRowPlay(example, parts.length ? pattern : null, play);

    row.append(pattern, example);
    list.appendChild(row);
  });

  root.querySelectorAll("[data-chart-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.soundsChartTab = btn.dataset.chartTab;
      renderSoundsChart();
    });
  });
}

function renderBriefing(territoryId) {
  const data = briefings[territoryId];
  const root = document.getElementById(`${territoryId}-briefing`);
  if (!data || !root) return;

  const blocks = data.blocks
    .map((b) => {
      const example = b.example ? briefingExampleHtml() : "";
      return `<div class="briefing-block">
        <h4>${b.heading}</h4>
        ${b.html}
        ${example}
      </div>`;
    })
    .join("");

  root.innerHTML = `
    <p class="briefing-kicker">Briefing</p>
    <h3>${data.title}</h3>
    <p class="briefing-lede">${data.lede}</p>
    ${blocks}
  `;
}

function syncTerritoryMenu(territoryId) {
  const menu = document.querySelector(
    `.territory-menu[data-territory="${territoryId}"]`
  );
  if (!menu) return;

  const phase = state.phase[territoryId] || "practice";
  const modeKey =
    territoryId === "numbers"
      ? null
      : territoryId === "nouns"
        ? state.nounsMode
        : state.soundsMode;
  const difficulty =
    territoryId === "numbers"
      ? state.numbersDifficulty
      : territoryId === "nouns"
        ? state.nounsDifficulty
        : state.soundsDifficulty;

  menu.querySelectorAll("[data-show-briefing]").forEach((btn) => {
    const on = phase === "briefing";
    btn.classList.toggle("is-on", on);
  });
  menu.querySelectorAll("[data-open-chart]").forEach((btn) => {
    const on = phase === "chart";
    btn.classList.toggle("is-on", on);
  });

  if (territoryId === "numbers") {
    syncNumbersCurriculumMenu(menu, phase);
  } else if (territoryId === "nouns") {
    menu.querySelectorAll("[data-nouns-hub]").forEach((btn) => {
      btn.classList.toggle("is-on", phase === "hub");
    });
    menu.querySelectorAll("[data-nouns-unit]").forEach((btn) => {
      const on =
        (phase === "hub" || phase === "chart" || phase === "practice") &&
        btn.dataset.nounsUnit === state.nounsLearnUnit;
      btn.classList.toggle("is-on", on);
    });
  } else {
    const modeAttr = "soundsMode";
    menu.querySelectorAll(`[data-${territoryId}-mode]`).forEach((btn) => {
      const on = phase === "practice" && btn.dataset[modeAttr] === modeKey;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", String(on));
    });
  }

  const diffAttr =
    territoryId === "numbers"
      ? "numbersDifficulty"
      : territoryId === "nouns"
        ? "nounsDifficulty"
        : "soundsDifficulty";
  menu.querySelectorAll(`[data-${territoryId}-difficulty]`).forEach((btn) => {
    const on = btn.dataset[diffAttr] === difficulty;
    btn.classList.remove("is-on");
    btn.setAttribute("aria-checked", String(on));
    btn.removeAttribute("aria-pressed");
    const mark = btn.querySelector(".menu-check-mark");
    if (mark) mark.textContent = on ? "✓" : "";
  });
}

function syncNumbersCurriculumMenu(menu, phase) {
  const changeFocus = menu.querySelector("[data-numbers-change-focus]");
  const resume = menu.querySelector("[data-numbers-resume]");
  const hubHome = menu.querySelector("[data-numbers-hub]");
  const body = menu.querySelector("#numbers-menu-body");
  if (changeFocus) changeFocus.hidden = phase !== "practice";
  if (resume) {
    resume.hidden = !(
      state.preservePractice.numbers &&
      (phase === "briefing" || phase === "chart")
    );
  }
  if (hubHome) {
    hubHome.classList.toggle("is-on", phase === "hub");
  }
  if (body) {
    // Quick topic jumps — playable topics only (Decimals / Fractions / Time included).
    const playable = NUMBERS_TOPICS.filter((t) => t.playable);
    body.hidden = false;
    body.innerHTML = playable
      .map((t) => {
        const on = state.numbersTopic === t.id || state.numbersHubTopic === t.id;
        return `<button type="button" role="menuitem" class="numbers-menu-topic${
          on ? " is-on" : ""
        }" data-numbers-open-topic="${t.id}">${t.label}</button>`;
      })
      .join("");
  }
}

function applyNumbersFocus({ topicId, stepId, modeId, difficulty, lock = true }) {
  const topic = getNumbersTopic(topicId);
  const step = getNumbersStep(topicId, stepId);
  if (!topic || !step) return false;

  let mode = modeId;
  const allowed = filterModesForCaps(modesForStep(topicId, stepId));
  if (!allowed.some((m) => m.id === mode)) {
    mode = allowed[0]?.id || "build";
  }
  if (!modeAllowedByCaps(mode)) return false;
  if (!isNumbersCellPlayable(topicId, stepId, mode)) return false;

  state.numbersSessionKind = "step";
  state.numbersTopic = topicId;
  state.numbersStep = stepId;
  state.numbersQuizMode = mode;
  state.numbersFocusLocked = !!lock;
  state.numbersMixEntries = [];
  state.numbersMixSteps = [];
  if (difficulty) state.numbersDifficulty = difficulty;
  state.numbersIndex = 0;
  state.numbersStepDeck = null;
  state.numbersStepDeckKey = "";
  state.numbersHubPracticePick = "";
  if (mode === "listen") reshuffleListenDeck();
  else reshuffleStepDeck();
  return true;
}

function startNumbersPractice(focus) {
  clearCrossTerritoryMix();
  state.sessionMode = state.sessionMode || "play";
  seedNumbersPlaylist([{ topicId: focus.topicId, stepId: focus.stepId }]);
  state.numbersMixMode = mixModeForCaps(focus.modeId || "either");
  // Prefer mix session so Custom mix can expand units; seed with this step
  state.numbersMixEntries = [{ topicId: focus.topicId, stepId: focus.stepId }];
  state.numbersMixSteps = [focus.stepId];
  state.numbersMixTopic = focus.topicId;
  if (focus.modeId && focus.modeId !== "either") {
    // Single-modality focus when user picked a specific mode chip
    if (!applyNumbersFocus(focus)) return;
    state.phase.numbers = "practice";
    state.preservePractice.numbers = false;
    showTerritoryPhase("numbers");
    syncPlaylistDropdown();
    return;
  }
  rebuildSessionFromPlaylist();
  navigate("numbers", { keepPhase: true });
}

function startNumbersMix() {
  if (!prepareNumbersMixState()) return;
  state.phase.numbers = "practice";
  state.preservePractice.numbers = false;
  showTerritoryPhase("numbers");
}

function openNumbersStepLearn(topicId, stepId) {
  const step = getNumbersStep(topicId, stepId);
  if (!step) return;

  if (step.chartTab && numbersChart[step.chartTab]) {
    state.numbersChartTab = step.chartTab;
    state.phase.numbers = "chart";
    state.preservePractice.numbers = false;
    showTerritoryPhase("numbers");
    return;
  }

  const cue = softAfterLabel(topicId, step);
  openSheet(
    step.label,
    `${learnSeriesChromeHtml()}
     <p>${step.blurb || "Reference for this step."}</p>
     ${cue ? `<p class="sheet-cue">${cue}</p>` : ""}
     <p>A dedicated chart for this step lands later. Use the Reference Chart for Cardinals forms that already have tabs.</p>`
  );
  wireLearnSeriesChrome(document.getElementById("sheet-body"));
}

/** Map carousel / hub Nouns learn unit → reference chart tab. */
function nounsChartTabForUnit(unit) {
  if (unit?.chartTab && nounsChart[unit.chartTab]) return unit.chartTab;
  const learnId = unit?.learnUnitId || "";
  const fromReg = getGenderShortcutsUnit(learnId);
  if (fromReg?.chartTab && nounsChart[fromReg.chartTab]) return fromReg.chartTab;
  const id = unit?.id || learnId || "";
  if (id.includes("categor")) return "categories";
  if (id.includes("suffix")) return "feminine";
  if (id.includes("plural")) return "plurals";
  if (id.includes("masc")) return "masculine";
  if (id.includes("neut")) return "neuter";
  return "feminine";
}

/** Resolve practice family id from a nav unit or explicit family. */
function nounsFamilyForNavUnit(unit) {
  if (unit?.nounsMode) return unit.nounsMode;
  if (unit?.familyId) return unit.familyId;
  const id = unit?.id || "";
  if (id.includes("wugs") && !id.includes("plural")) return "wugs";
  if (id.includes("real-words") || id.includes("real_words")) return "real-words";
  if (id.includes("proofread")) return "proofread";
  if (id.includes("reverse")) return "reverse-mc";
  if (id.includes("gender-recognition") || id.includes("gender_recognition"))
    return "gender-recognition";
  if (id.includes("article-application") || id.includes("article_application"))
    return "article-application";
  if (id.includes("gender-imposter") || id.includes("gender_imposter"))
    return "gender-imposter";
  if (id.includes("sentence-validation") || id.includes("sentence_validation"))
    return "sentence-validation";
  if (id.includes("association")) return "association";
  const learnId = unit?.learnUnitId || "";
  return introFamilyForUnit(learnId)?.id || "wugs";
}

function openNounsStepLearn(units) {
  const list = Array.isArray(units) ? units : [];
  const u = list[0];
  const learnId = u?.learnUnitId || unitIdForFamily(nounsFamilyForNavUnit(u));
  state.nounsLearnUnit = learnId;
  const tab = nounsChartTabForUnit(u) || getGenderShortcutsUnit(learnId)?.chartTab || "feminine";
  state.nounsChartTab = nounsChart[tab] ? tab : "feminine";
  state.phase.nouns = "chart";
  state.preservePractice.nouns = false;
  navigate("nouns", { keepPhase: true });
}

function startNounsFamily(familyId, { mix = false } = {}) {
  clearCrossTerritoryMix();
  state.sessionMode = state.sessionMode === "learn" ? "learn" : "play";
  const unitId = unitIdForFamily(familyId);
  state.nounsLearnUnit = unitId;
  state.nounsModality =
    unitId === "categories" ? "category-gender" : "choose-article";
  state.nounsHubPracticePick = "";
  if (mix) {
    state.nounsSessionKind = "family-mix";
    state.nounsFamilyMix = familiesForUnit(unitId).map((f) => f.id);
    state.nounsMode = state.nounsFamilyMix[0] || familyId;
    seedNounsPlaylist(state.nounsFamilyMix);
  } else {
    state.nounsSessionKind = "focus";
    state.nounsFamilyMix = [];
    state.nounsMode = familyId;
    seedNounsPlaylist([familyId]);
  }
  resetNounsDeckForMode();
  state.phase.nouns = "practice";
  state.preservePractice.nouns = false;
  navigate("nouns", { keepPhase: true });
}

function goNounsHub(opts = {}) {
  clearNounsAdvance();
  clearCrossTerritoryMix();
  clearLearnSeries();
  stopSpeech();
  state.preservePractice.nouns = false;
  state.phase.nouns = "hub";
  if (opts.unitId) {
    state.nounsLearnUnit = opts.unitId;
    state.nounsHubPracticePick = opts.openPractice ? opts.unitId : "";
  }
  navigate("nouns", { keepPhase: true });
}

function goNumbersHub() {
  clearNumbersAdvance();
  clearCrossTerritoryMix();
  clearLearnSeries();
  stopSpeech();
  destroyVocabMount();
  state.numbersHubPracticePick = "";
  state.preservePractice.numbers = false;
  state.phase.numbers = "hub";
  navigate("numbers", { keepPhase: true });
}

function softAfterLabel(topicId, step) {
  if (!step?.softAfter) return "";
  const prior = getNumbersStep(topicId, step.softAfter);
  if (!prior) return "";
  return `Usually after ${prior.label}`;
}

function numbersSessionLabel() {
  const hint = capsSessionHint();
  const suffix = hint ? ` · ${hint}` : "";
  if (state.numbersSessionKind === "mix") {
    const n = state.numbersMixSteps.length;
    const mode =
      state.numbersMixMode === "either"
        ? "Either"
        : getNumbersMode(state.numbersMixMode)?.label || state.numbersMixMode;
    return `Custom mix · ${n} step${n === 1 ? "" : "s"} · ${mode}${suffix}`;
  }
  return (
    formatNumbersFocusLabel({
      topicId: state.numbersTopic,
      stepId: state.numbersStep,
      modeId: state.numbersQuizMode,
      difficulty: state.numbersDifficulty,
    }) + suffix
  );
}

function destroyVocabMount() {
  if (state.vocabMount) {
    state.vocabMount.destroy?.();
    state.vocabMount = null;
  }
}

function openVocabulary(territoryId, mode, opts = {}) {
  destroyVocabMount();
  state.sessionMode = mode === "practice" ? "play" : "learn";
  state.vocabMode = mode === "practice" ? "practice" : "learn";
  if (opts.areas !== undefined) {
    state.vocabAreas =
      Array.isArray(opts.areas) && opts.areas.length ? opts.areas : null;
  } else if (
    territoryId === "numbers" &&
    state.sessionPlaylist?.kind?.startsWith("numbers")
  ) {
    const areas = enabledVocabAreas(state.sessionPlaylist);
    state.vocabAreas = areas.length ? areas : null;
  } else {
    state.vocabAreas = null;
  }
  if (
    territoryId === "numbers" &&
    !(state.sessionPlaylist?.catalog?.length)
  ) {
    seedNumbersPlaylist([], { vocabOnly: true });
    state.vocabAreas = enabledVocabAreas(state.sessionPlaylist);
  }
  state.phase[territoryId] =
    mode === "practice" ? "vocab-practice" : "vocab-learn";
  state.preservePractice[territoryId] = false;
  navigate(territoryId, { keepPhase: true });
}

function renderVocabularyPanel(territoryId) {
  const root = document.getElementById(`${territoryId}-vocab`);
  if (!root) return;
  destroyVocabMount();
  const topic = territoryId === "nouns" ? "nouns" : "numbers";
  state.vocabMount = mountVocabularyPanel(root, {
    topic,
    mode: state.vocabMode || "learn",
    areas: topic === "numbers" ? state.vocabAreas : null,
    onItemChange: () => refreshPlaylistChrome(),
    onBack: () => {
      stopSpeech({ keepAdvance: true });
      destroyVocabMount();
      state.phase[territoryId] = "hub";
      showTerritoryPhase(territoryId);
    },
    openReference: (id, territory) => {
      if (id) openReferenceBrowse({ id });
      else openReferenceBrowse({ territory });
    },
    answerPartsForItem: vocabAnswerParts,
    playFeedback: playFeedbackSound,
    playReveal: (spoken, parts, nodes, onDone) => {
      playAnswerKeyThenAdvance(spoken, parts, nodes, (ms) => {
        if (!onDone) return;
        window.setTimeout(() => onDone(), ms);
      });
    },
    stopSpeech: () => stopSpeech({ keepAdvance: true }),
  });
}

function vocabHubSectionHtml(territoryId) {
  const topic = territoryId === "nouns" ? "nouns" : "numbers";
  if (!topicHasVocabulary(topic)) return "";
  return `
    <section class="numbers-browse vocab-hub-section" aria-label="Vocabulary">
      <h2 class="numbers-browse-title">Vocabulary</h2>
      <p class="numbers-step-note">Topic-level lexical items — Learn introduces; Practice retrieves (multiple question types from the same item).</p>
      <ul class="numbers-step-list">
        <li class="numbers-step-row">
          <div class="numbers-step-copy">
            <strong>Vocabulary</strong>
            <span class="numbers-step-blurb">Supporting lexicon by area (Core → Time → Money → …) — Learn introduces in order; Practice draws from the selected scope.</span>
          </div>
          <div class="numbers-step-actions">
            <div class="numbers-step-actions-main">
              <button type="button" class="btn" data-vocab-open data-vocab-mode="learn" data-vocab-territory="${territoryId}">Learn</button>
              <button type="button" class="btn btn-primary" data-vocab-open data-vocab-mode="practice" data-vocab-territory="${territoryId}">Practice</button>
            </div>
          </div>
        </li>
      </ul>
    </section>`;
}

/** Single hub row matching Suffixes / Categories / Plurals styling. */
function vocabHubRowHtml(territoryId) {
  const topic = territoryId === "nouns" ? "nouns" : "numbers";
  if (!topicHasVocabulary(topic)) return "";
  return `<li class="numbers-step-row vocab-hub-row">
      <div class="numbers-step-copy">
        <strong>Vocabulary</strong>
        <span class="numbers-step-blurb">Supporting lexicon by area — Learn in curriculum order; Practice by selected scope (not number forms).</span>
      </div>
      <div class="numbers-step-actions">
        <div class="numbers-step-actions-main">
          <button type="button" class="btn" data-vocab-open data-vocab-mode="learn" data-vocab-territory="${territoryId}">Learn</button>
          <button type="button" class="btn btn-primary" data-vocab-open data-vocab-mode="practice" data-vocab-territory="${territoryId}">Practice</button>
        </div>
      </div>
    </li>`;
}

function renderNumbersHub() {
  const root = document.getElementById("numbers-hub");
  if (!root) return;

  const suggestion = suggestFocusForCaps({
    topicId: state.numbersTopic,
    stepId: state.numbersStep,
    modeId: state.numbersQuizMode,
    difficulty: state.numbersDifficulty,
  });
  const suggestLabel = formatNumbersFocusLabel(suggestion);
  const openId = state.numbersHubTopic;
  const pickKey = state.numbersHubPracticePick;

  const topicBlocks = NUMBERS_TOPICS.map((t) => {
    const open = t.id === openId;
    const soon = !t.playable;
    const stepRows = (t.steps || [])
      .map((s) => {
        const cue = softAfterLabel(t.id, s);
        const modes = filterModesForCaps(modesForStep(t.id, s.id));
        const rowKey = `${t.id}:${s.id}`;
        const picking = pickKey === rowKey;

        if (!s.playable) {
          return `<li class="numbers-step-row is-preview">
            <div class="numbers-step-copy">
              <strong>${s.label}</strong>
              <span class="numbers-step-cue">Coming soon${cue ? ` · ${cue}` : ""}</span>
              ${s.blurb ? `<span class="numbers-step-blurb">${s.blurb}</span>` : ""}
            </div>
            <div class="numbers-step-actions">
              <button type="button" class="btn" disabled>Learn</button>
              <button type="button" class="btn btn-primary" disabled>Practice</button>
            </div>
          </li>`;
        }

        let practiceActions;
        if (!modes.length) {
          practiceActions = `<button type="button" class="btn btn-primary" disabled>Practice</button>`;
        } else if (picking && modes.length > 1) {
          const introId = introModeForStep(t.id, s.id)?.id;
          const modeChips = modes
            .map((m) => {
              const suggested = m.id === introId;
              return `<button type="button" class="chip${
                suggested ? " is-suggested" : ""
              }" data-hub-start data-topic="${t.id}" data-step="${s.id}" data-mode="${m.id}" title="${
                suggested ? "Soft intro — try first" : m.blurb || m.label
              }">${m.label}${suggested ? " · first" : ""}</button>`;
            })
            .join("");
          practiceActions = modeChips;
        } else {
          practiceActions = `<button type="button" class="btn btn-primary" data-hub-practice data-topic="${t.id}" data-step="${s.id}">Practice</button>`;
        }

        return `<li class="numbers-step-row">
          <div class="numbers-step-copy">
            <strong>${s.label}</strong>
            ${cue ? `<span class="numbers-step-cue">${cue}</span>` : ""}
            ${s.blurb ? `<span class="numbers-step-blurb">${s.blurb}</span>` : ""}
          </div>
          <div class="numbers-step-actions">
            <div class="numbers-step-actions-main">
              <button type="button" class="btn" data-hub-learn data-topic="${t.id}" data-step="${s.id}">Learn</button>
              ${practiceActions}
            </div>
          </div>
        </li>`;
      })
      .join("");

    return `<div class="numbers-topic-block${open ? " is-open" : ""}${soon ? " is-preview" : ""}" data-topic-block="${t.id}">
      <button type="button" class="numbers-topic-card${open ? " is-on" : ""}" data-hub-topic="${t.id}" aria-expanded="${open}">
        <span class="numbers-topic-card-main">
          <span class="numbers-topic-name">${t.label}</span>
          <span class="numbers-topic-meta">${soon ? "Coming soon" : t.blurb || ""}</span>
        </span>
        <span class="numbers-topic-chevron" aria-hidden="true"></span>
      </button>
      <div class="numbers-topic-steps" ${open ? "" : "hidden"}>
        ${
          open
            ? `<p class="numbers-step-note">${
                soon
                  ? "Preview only — not playable yet."
                  : "Learn is per unit. Practice starts a session — use Custom mix in the header to narrow units or switch In-order / Random."
              }</p>
        <ul class="numbers-step-list">${stepRows}</ul>`
            : ""
        }
      </div>
    </div>`;
  }).join("");

  const capsHint = capsSessionHint();
  const capsBanner = capsHint
    ? `<p class="numbers-caps-banner" role="status">Session caps: ${capsHint}. Unavailable modes are hidden.</p>`
    : "";

  root.innerHTML = `
    <header class="numbers-hub-hero">
      <h1>Numbers</h1>
      <p class="numbers-hub-lede">Browse by unit. Learn opens that unit’s reference. Practice starts a session — refine the playlist anytime via Custom mix in the header.</p>
    </header>
    ${capsBanner}

    <section class="numbers-guided" aria-label="Guided practice">
      <div class="numbers-path-head">
        <span class="dealer-badge">Guided practice</span>
        <span class="numbers-path-hint">App chooses</span>
      </div>
      <p class="dealer-copy"><strong>${suggestLabel}</strong> — ${suggestion.reason}</p>
      <button type="button" class="btn btn-primary" id="numbers-hub-go"
        data-topic-id="${suggestion.topicId}"
        data-step-id="${suggestion.stepId}"
        data-mode-id="${suggestion.modeId}"
        data-difficulty="${suggestion.difficulty}">Start guided</button>
    </section>

    <section class="numbers-browse" aria-label="Vocabulary">
      <h2 class="numbers-browse-title">Vocabulary</h2>
      <ul class="numbers-step-list">${vocabHubRowHtml("numbers")}</ul>
    </section>

    <section class="numbers-browse" aria-label="Browse topics">
      <h2 class="numbers-browse-title">Browse</h2>
      <div class="numbers-topic-accordion">${topicBlocks}</div>
    </section>
  `;
}

function renderNounsHub() {
  const root = document.getElementById("nouns-hub");
  if (!root) return;

  const introUnit = getGenderShortcutsUnit("suffixes");
  const introFam = introFamilyForUnit("suffixes");

  const unitRows = GENDER_SHORTCUTS_UNITS.map((u) => {
    const fams = familiesForUnit(u.id);
    const intro = introFamilyForUnit(u.id);
    return `<li class="numbers-step-row">
      <div class="numbers-step-copy">
        <strong>${u.label}</strong>
        ${u.blurb ? `<span class="numbers-step-blurb">${u.blurb}</span>` : ""}
      </div>
      <div class="numbers-step-actions">
        <div class="numbers-step-actions-main">
          <button type="button" class="btn" data-nouns-learn data-unit="${u.id}">Learn</button>
          <button type="button" class="btn btn-primary" data-nouns-start-family data-family="${
            intro?.id || fams[0]?.id || "wugs"
          }" ${fams.length ? "" : "disabled"}>Practice</button>
        </div>
      </div>
    </li>`;
  }).join("");

  const stubs = NOUNS_STUB_TOPICS.map(
    (t) => `<li class="numbers-step-row is-preview">
      <div class="numbers-step-copy">
        <strong>${t.label}</strong>
        <span class="numbers-step-cue">Coming soon</span>
        ${t.blurb ? `<span class="numbers-step-blurb">${t.blurb}</span>` : ""}
      </div>
      <div class="numbers-step-actions">
        <button type="button" class="btn" disabled>Learn</button>
        <button type="button" class="btn btn-primary" disabled>Practice</button>
      </div>
    </li>`
  ).join("");

  root.innerHTML = `
    <header class="numbers-hub-hero">
      <h1>Nouns</h1>
      <p class="numbers-hub-lede">Learn by cue system. Hub Play caps: Write / Listen (Pick-style stays on).</p>
    </header>

    <section class="numbers-guided" aria-label="Guided practice">
      <div class="numbers-path-head">
        <span class="dealer-badge">Guided practice</span>
        <span class="numbers-path-hint">App chooses</span>
      </div>
      <p class="dealer-copy"><strong>${introUnit?.label || "Suffixes"} · ${
    introFam?.label || "Wugs"
  }</strong> — Soft intro on novel nouns</p>
      <button type="button" class="btn btn-primary" data-nouns-start-family data-family="${
        introFam?.id || "wugs"
      }">Start guided</button>
    </section>

    <section class="numbers-browse" aria-label="Gender Shortcuts">
      <h2 class="numbers-browse-title">Gender Shortcuts</h2>
      <p class="numbers-step-note">Learn opens reference. Practice starts the soft-first family (Wugs or Gender Recognition).</p>
      <ul class="numbers-step-list">${vocabHubRowHtml("nouns")}${unitRows}</ul>
    </section>

    <section class="numbers-browse" aria-label="More Nouns topics">
      <h2 class="numbers-browse-title">More topics</h2>
      <ul class="numbers-step-list">${stubs}</ul>
    </section>
  `;
}

function listenInputMaxLength() {
  const pool = listenValuePool();
  const max = pool.length ? Math.max(...pool) : 99;
  return String(max).length;
}

function showTerritoryPhase(territoryId) {
  const phase = state.phase[territoryId] || "briefing";
  const briefing = document.getElementById(`${territoryId}-briefing`);
  const stage = document.getElementById(`${territoryId}-stage`);
  const hub = document.getElementById(`${territoryId}-hub`);
  const vocab = document.getElementById(`${territoryId}-vocab`);
  const soundsChartEl = document.getElementById("sounds-chart");
  const numbersChartEl = document.getElementById("numbers-chart");
  const nounsChartEl = document.getElementById("nouns-chart");

  if (soundsChartEl) soundsChartEl.hidden = true;
  if (numbersChartEl) numbersChartEl.hidden = true;
  if (nounsChartEl) nounsChartEl.hidden = true;
  if (hub) hub.hidden = true;
  if (vocab) vocab.hidden = true;

  syncTerritoryMenu(territoryId);

  if (
    (territoryId === "numbers" || territoryId === "nouns") &&
    (phase === "vocab-learn" || phase === "vocab-practice")
  ) {
    if (briefing) briefing.hidden = true;
    if (stage) stage.hidden = true;
    if (hub) hub.hidden = true;
    if (vocab) {
      vocab.hidden = false;
      state.vocabMode = phase === "vocab-practice" ? "practice" : "learn";
      renderVocabularyPanel(territoryId);
    }
    stopSpeech();
    return;
  }

  if (territoryId === "numbers" && phase === "hub") {
    destroyVocabMount();
    if (briefing) briefing.hidden = true;
    if (stage) stage.hidden = true;
    if (hub) {
      hub.hidden = false;
      renderNumbersHub();
    }
    stopSpeech();
    return;
  }

  if (territoryId === "nouns" && phase === "hub") {
    destroyVocabMount();
    if (briefing) briefing.hidden = true;
    if (stage) stage.hidden = true;
    if (hub) {
      hub.hidden = false;
      renderNounsHub();
    }
    stopSpeech();
    return;
  }

  if (phase === "briefing") {
    if (briefing) briefing.hidden = false;
    if (stage) stage.hidden = true;
    renderBriefing(territoryId);
    stopSpeech();
    return;
  }

  if (phase === "chart") {
    if (briefing) briefing.hidden = true;
    if (stage) stage.hidden = true;
    if (territoryId === "sounds" && soundsChartEl) {
      soundsChartEl.hidden = false;
      renderSoundsChart();
      return;
    }
    if (territoryId === "numbers" && numbersChartEl) {
      numbersChartEl.hidden = false;
      renderNumbersChart();
      return;
    }
    if (territoryId === "nouns" && nounsChartEl) {
      nounsChartEl.hidden = false;
      renderNounsChart();
      return;
    }
  }

  if (briefing) briefing.hidden = true;
  if (stage) stage.hidden = false;

  const resume = state.preservePractice[territoryId];
  if (resume) state.preservePractice[territoryId] = false;

  if (territoryId === "numbers") {
    if (!resume) renderNumbers();
  } else if (territoryId === "nouns") {
    if (!resume) renderNouns();
  } else if (territoryId === "sounds") {
    if (!resume) renderSounds();
  }
}

function renderNumbersChart() {
  const root = document.getElementById("numbers-chart");
  if (!root) return;

  const tab = state.numbersChartTab;
  const rows = numbersChart[tab] || [];
  const tabs = numbersChart.tabs
    .map(
      (t) =>
        `<button type="button" class="chip${t.id === tab ? " is-on" : ""}" data-chart-tab="${t.id}" aria-pressed="${t.id === tab}">${t.label}</button>`
    )
    .join("");

  const activeTab = numbersChart.tabs.find((t) => t.id === tab);
  const tabBlurb = activeTab?.blurb
    ? `<p class="chart-tab-blurb">${activeTab.blurb}</p>`
    : "";

  root.innerHTML = `
    ${learnSeriesChromeHtml()}
    <div class="chart-tabs" role="tablist">${tabs}</div>
    <div class="chart-scroll">
      <p class="chart-note">Tap a cue or example to hear the German form with syllable highlight.</p>
      ${tabBlurb}
      <div class="chart-list" id="numbers-chart-list"></div>
    </div>
  `;
  wireLearnSeriesChrome(root);
  const list = root.querySelector("#numbers-chart-list");
  rows.forEach((r) => {
    const row = document.createElement("div");
    row.className = "chart-row";

    const pattern = document.createElement("div");
    pattern.className = "chart-pattern";
    pattern.innerHTML = `
      <p class="chart-formula">
        <span class="chart-spells">${r.n}</span>
      </p>
      ${r.note ? `<p class="chart-note-cell">${r.note}</p>` : ""}
    `;

    const example = document.createElement("button");
    example.type = "button";
    example.className = "chart-example-play";
    const parts = r.parts || [];
    const word = parts.map((p) => p.text).join("");
    example.setAttribute("aria-label", `Play ${word}`);

    const chips = document.createElement("div");
    chips.className = "chart-chips chart-chips-example";
    parts.forEach((p) => {
      chips.appendChild(
        makeSylDisplay({
          ortho: p.text,
          guide: p.guide,
          stress: !!p.stress,
        })
      );
    });
    example.appendChild(chips);

    const play = () => {
      const nodes = [...chips.querySelectorAll(".syl")];
      playKaraokeFlow(word, parts, nodes);
    };
    wireChartRowPlay(example, parts.length ? pattern : null, play);

    row.append(pattern, example);
    list.appendChild(row);
  });

  root.querySelectorAll("[data-chart-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.numbersChartTab = btn.dataset.chartTab;
      renderNumbersChart();
    });
  });
}

function renderNounsChart() {
  const root = document.getElementById("nouns-chart");
  if (!root) return;

  const tab = state.nounsChartTab;
  const rows = nounsChart[tab] || [];
  const tabs = nounsChart.tabs
    .map(
      (t) =>
        `<button type="button" class="chip${t.id === tab ? " is-on" : ""}" data-chart-tab="${t.id}" aria-pressed="${t.id === tab}">${t.label}</button>`
    )
    .join("");

  const activeTab = nounsChart.tabs.find((t) => t.id === tab);
  const tabBlurb = activeTab?.blurb
    ? `<p class="chart-tab-blurb">${activeTab.blurb}</p>`
    : "";

  root.innerHTML = `
    ${learnSeriesChromeHtml()}
    <div class="chart-tabs" role="tablist">${tabs}</div>
    <div class="chart-scroll">
      <p class="chart-note">Tap a cue or example to hear article + noun.</p>
      ${tabBlurb}
      <div class="chart-list" id="nouns-chart-list"></div>
    </div>
  `;
  wireLearnSeriesChrome(root);
  const list = root.querySelector("#nouns-chart-list");
  rows.forEach((r) => {
    const row = document.createElement("div");
    row.className = "chart-row";

    const cueLabel = r.displayCue || r.cue;
    const gClass = r.gender ? genderClass(r.gender) : "";
    const pattern = document.createElement("div");
    pattern.className = "chart-pattern";
    pattern.innerHTML = `
      <p class="chart-formula">
        <span class="chart-spells${gClass ? ` ${gClass}` : ""}">${cueLabel}</span>
      </p>
      ${r.from ? `<p class="chart-note-cell">${r.from}</p>` : ""}
      ${r.note ? `<p class="chart-note-cell">${r.note}</p>` : ""}
      ${r.cue && r.displayCue ? `<p class="chart-note-cell">${r.cue}</p>` : ""}
    `;

    const parts = r.parts || [];
    if (!parts.length) {
      row.append(pattern);
      list.appendChild(row);
      return;
    }

    const example = document.createElement("button");
    example.type = "button";
    example.className = "chart-example-play";
    const ttsWord = parts
      .map((p, i) => {
        if (i === 0 && ["die", "der", "das"].includes(p.text)) return p.text + " ";
        return p.text;
      })
      .join("")
      .trim();
    example.setAttribute("aria-label", `Play ${ttsWord}`);

    const chips = document.createElement("div");
    chips.className = "chart-chips chart-chips-example";
    parts.forEach((p) => {
      chips.appendChild(
        makeSylDisplay({
          ortho: p.text,
          guide: p.guide,
          stress: !!p.stress,
        })
      );
    });
    example.appendChild(chips);

    const play = () => {
      const nodes = [...chips.querySelectorAll(".syl")];
      playKaraokeFlow(ttsWord, parts, nodes);
    };
    wireChartRowPlay(example, pattern, play);

    row.append(pattern, example);
    list.appendChild(row);
  });

  root.querySelectorAll("[data-chart-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.nounsChartTab = btn.dataset.chartTab;
      renderNounsChart();
    });
  });
}

function isVocabNavUnit(u) {
  return !!(u && (u.kind === "vocabulary" || u.vocabTopic));
}

function handleNavCarouselStart({ mode, units, keyboard, audio, practice, guided }) {
  // Guided: bypass manual playlist — Dealer picks the next rep directly.
  if (guided) {
    clearSessionPlaylist();
    startGuidedSession();
    return;
  }

  const vocabUnits = units.filter(isVocabNavUnit);
  const numbersUnits = units.filter(
    (u) => u.territory === "numbers" && u.topicId && u.stepId && !isVocabNavUnit(u)
  );
  const nounsUnits = units.filter(
    (u) => u.territory === "nouns" && !isVocabNavUnit(u)
  );

  state.navCaps = { keyboard, audio };
  state.sessionMode = mode === "learn" ? "learn" : "play";
  state.currentReasonCode = null;
  clearCrossTerritoryMix();
  clearLearnSeries();
  destroyPlaylistMount();

  // Vocabulary-only selection → Vocabulary Learn/Practice panel
  if (vocabUnits.length && !numbersUnits.length && !nounsUnits.length) {
    const topic = vocabUnits[0].vocabTopic || vocabUnits[0].territory || "nouns";
    const territoryId = topic === "nouns" ? "nouns" : "numbers";
    if (territoryId === "numbers") {
      seedNumbersPlaylist([], { vocabOnly: true });
      state.vocabAreas = enabledVocabAreas(state.sessionPlaylist);
      openVocabulary("numbers", mode === "learn" ? "learn" : "practice", {
        areas: state.vocabAreas,
      });
    } else {
      clearSessionPlaylist();
      openVocabulary("nouns", mode === "learn" ? "learn" : "practice", {
        areas: null,
      });
    }
    return;
  }

  if (mode === "learn") {
    // Seed playlist for Numbers Learn when Numbers units present
    if (numbersUnits.length) {
      seedNumbersPlaylist(numbersUnits.map((u) => ({
        topicId: u.topicId,
        stepId: u.stepId,
      })));
    } else if (nounsUnits.length) {
      const fams = [];
      for (const u of nounsUnits) {
        const learnId = u.learnUnitId || unitIdForFamily(nounsFamilyForNavUnit(u));
        for (const f of familiesForUnit(learnId)) fams.push(f.id);
      }
      seedNounsPlaylist(fams);
    }
    startLearnSeries(units);
    return;
  }

  const hasNumbers = numbersUnits.length > 0;
  const hasNouns = nounsUnits.length > 0;

  // Play → Numbers (quiz units; vocab nested in Custom mix under topics)
  if (hasNumbers && !hasNouns) {
    seedNumbersPlaylist(
      numbersUnits.map((u) => ({ topicId: u.topicId, stepId: u.stepId }))
    );
    state.numbersMixMode = mixModeForCaps(
      (practice?.numbersModes || [])[0] || "either"
    );
    rebuildSessionFromPlaylist();
    navigate("numbers", { keepPhase: true });
    return;
  }

  // Play → randomly interleave Numbers and Nouns when both are selected
  if (hasNumbers && hasNouns) {
    seedNumbersPlaylist(
      numbersUnits.map((u) => ({ topicId: u.topicId, stepId: u.stepId }))
    );
    if (!prepareNumbersFromPlaylist(numbersUnits, practice)) return;
    if (!prepareNounsFromPlaylist(nounsUnits, practice)) return;
    const fams = [];
    for (const u of nounsUnits) {
      const learnId = u.learnUnitId || unitIdForFamily(nounsFamilyForNavUnit(u));
      for (const f of familiesForUnit(learnId)) fams.push(f.id);
    }
    // Prefer numbers playlist in crumb when both; nouns still run via cross-mix
    state.crossTerritoryMix = {
      active: true,
      territories: shuffle(["numbers", "nouns"]),
    };
    state.phase.numbers = "practice";
    state.phase.nouns = "practice";
    state.preservePractice.numbers = false;
    state.preservePractice.nouns = false;
    const first = state.crossTerritoryMix.territories[0] || "numbers";
    navigate(first, { keepPhase: true });
    return;
  }

  if (hasNouns) {
    if (!prepareNounsFromPlaylist(nounsUnits, practice)) return;
    const fams = [];
    for (const u of nounsUnits) {
      const learnId = u.learnUnitId || unitIdForFamily(nounsFamilyForNavUnit(u));
      for (const f of familiesForUnit(learnId)) fams.push(f.id);
    }
    seedNounsPlaylist(fams);
    state.phase.nouns = "practice";
    state.preservePractice.nouns = false;
    navigate("nouns", { keepPhase: true });
  }
}

/**
 * All playable reps across every territory as Dealer candidates, in
 * curriculum order (Numbers steps first, then Nouns families). Cap-filtered.
 */
function guidedCandidates() {
  const out = [];
  // Numbers: every playable step, using its cap-appropriate intro mode.
  for (const t of NUMBERS_TOPICS) {
    if (!t.playable) continue;
    for (const s of t.steps || []) {
      if (!s.playable) continue;
      const modes = filterModesForCaps(modesForStep(t.id, s.id));
      if (!modes.length) continue;
      const introId = introModeForStep(t.id, s.id)?.id;
      const mode = modes.some((m) => m.id === introId) ? introId : modes[0].id;
      out.push({
        territory: "numbers",
        topicId: t.id,
        stepId: s.id,
        mode,
        key: `numbers:${t.id}:${s.id}`,
      });
    }
  }
  // Nouns: every playable family under each Gender-Shortcuts unit.
  for (const u of GENDER_SHORTCUTS_UNITS) {
    for (const f of familiesForUnit(u.id)) {
      out.push({
        territory: "nouns",
        learnUnitId: u.id,
        family: f.id,
        key: `nouns:${u.id}:${f.id}`,
      });
    }
  }
  return out;
}

/** Guided start — reset progress and let the Dealer pick the first rep. */
function startGuidedSession() {
  state.navCaps = state.navCaps || { keyboard: true, audio: true };
  state.sessionMode = "guided";
  clearSessionPlaylist();
  clearCrossTerritoryMix();
  clearLearnSeries();
  state.guidedSeen = new Set();
  state.guidedStats = {};
  state.guidedCurrentKey = null;
  clearNumbersHistory();
  state.guidedDealLog = [];
  state.guidedQaLog = [];
  state.guidedAttemptStartIndex = (state.attemptLog || []).length;
  guidedDealAndGo();
}

/**
 * Deal the next guided rep across all territories (order + competency) and
 * open it. Progress lives in state.guidedSeen / state.guidedStats.
 */
function guidedDealAndGo() {
  const candidates = guidedCandidates();
  const seenList = [...(state.guidedSeen || [])];
  const stats = state.guidedStats || {};
  const deal = dealExercise({
    candidates,
    seen: seenList,
    stats,
  });
  if (!deal) {
    state.currentReasonCode = null;
    navigate("numbers");
    return;
  }
  const c = deal.candidate;
  state.currentReasonCode = deal.reasonCode;
  state.guidedCurrentKey = c.key;

  // Snapshot dealer thinking for the Guided debug panel.
  const weak = candidates
    .filter((x) => seenList.includes(x.key))
    .map((x) => {
      const s = stats[x.key];
      if (!s?.total) return null;
      const acc = s.correct / s.total;
      if (acc >= WEAK_ACCURACY) return null;
      return {
        key: x.key,
        label: guidedLabelForCandidate(x),
        correct: s.correct,
        total: s.total,
        acc,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.acc - b.acc);
  const nextNew = candidates.find((x) => !seenList.includes(x.key));
  const chosenStat = stats[c.key];
  const dealLog = state.guidedDealLog || (state.guidedDealLog = []);
  dealLog.push({
    at: Date.now(),
    n: dealLog.length + 1,
    reason: deal.reasonCode?.code || "",
    reasonLabel: deal.reasonCode?.label || "",
    key: c.key,
    label: guidedLabelForCandidate(c),
    territory: c.territory,
    mode: c.mode || c.family || "",
    seenCount: seenList.length,
    candidateCount: candidates.length,
    chosenStat: chosenStat
      ? { correct: chosenStat.correct, total: chosenStat.total }
      : null,
    weak: weak.slice(0, 8),
    nextNewKey: nextNew?.key || null,
    nextNewLabel: nextNew ? guidedLabelForCandidate(nextNew) : null,
  });

  (state.guidedSeen || (state.guidedSeen = new Set())).add(c.key);
  if (c.territory === "nouns") configureGuidedNouns(c);
  else configureGuidedNumbers(c);
}

function configureGuidedNumbers(c) {
  state.numbersSessionKind = "step";
  state.numbersMixSteps = [];
  state.numbersMixEntries = [];
  state.numbersTopic = c.topicId;
  state.numbersStep = c.stepId;
  state.numbersQuizMode = c.mode;
  state.numbersFocusLocked = true;
  state.numbersStepDeck = null;
  state.numbersStepDeckKey = "";
  state.numbersIndex = 0;
  state.phase.numbers = "practice";
  state.preservePractice.numbers = false;
  navigate("numbers", { keepPhase: true });
}

function configureGuidedNouns(c) {
  const unitId = c.learnUnitId || unitIdForFamily(c.family);
  state.nounsLearnUnit = unitId;
  state.nounsModality =
    unitId === "categories" ? "category-gender" : "choose-article";
  state.nounsHubPracticePick = "";
  state.nounsSessionKind = "focus";
  state.nounsFamilyMix = [];
  state.nounsMode = c.family;
  resetNounsDeckForMode();
  state.phase.nouns = "practice";
  state.preservePractice.nouns = false;
  navigate("nouns", { keepPhase: true });
}

/**
 * When in guided mode, record the rep just answered (for competency) and deal
 * the next one across all territories. Returns true if it took over advancing.
 */
function continueGuided() {
  if (state.sessionMode !== "guided") return false;
  recordGuidedResult();
  // Current question stays in history; past-the-end index so the next deal appends.
  state.numbersHistoryIndex = (state.numbersHistory || []).length;
  guidedDealAndGo();
  return true;
}

/** Fold the most recent attempt's outcome into guided competency stats. */
function recordGuidedResult() {
  const key = state.guidedCurrentKey;
  if (!key) return;
  const log = state.attemptLog || [];
  const last = log[log.length - 1];
  const status = last?.evaluation?.status || last?.status || null;
  // Unknown outcome (mode didn't log) counts as a neutral correct rep so the
  // Dealer keeps progressing rather than looping.
  const correct = status ? status === "correct" : true;
  const stats = state.guidedStats || (state.guidedStats = {});
  const s = stats[key] || (stats[key] = { correct: 0, total: 0 });
  s.total += 1;
  if (correct) s.correct += 1;
}

/** Prompt cue shown to the learner (not syllable chips). */
function currentGuidedQuestionCue() {
  if (state.view === "nouns") {
    const ex = state.currentExercise;
    if (!ex) return "—";
    if (state.nounsMode === "proofread")
      return ex.resolution?.form || ex.prompt?.text || "—";
    if (state.nounsMode === "reverse-mc")
      return ex.resolution?.article || ex.prompt?.text || "—";
    return (
      ex.prompt?.text ||
      ex.prompt?.cue ||
      ex.prompt?.sentence ||
      ex.target?.lemma ||
      ex.materials?.cue ||
      "—"
    );
  }
  const meta = currentNumberMeta();
  const ex = state.currentExercise;
  if (state.numbersQuizMode === "listen") {
    return ex?.resolution?.form || meta?.form || "(audio)";
  }
  if (state.numbersQuizMode === "proofread") {
    return ex?.prompt?.wrong || meta?.form || "—";
  }
  if (state.numbersQuizMode === "sentence") {
    return ex?.prompt?.written || ex?.prompt?.sentence || "—";
  }
  return numbersLead(meta, meta?.form || String(meta?.value ?? "—"));
}

/**
 * Guided debug: one row per finished question — cue + final orthographic answer
 * (never syllable/parts beats).
 */
function logGuidedQa({ question, answer, expected, status } = {}) {
  if (state.sessionMode !== "guided") return;
  const log = state.guidedQaLog || (state.guidedQaLog = []);
  const q = question != null ? question : currentGuidedQuestionCue();
  const a = answer != null ? answer : "";
  const exp = expected != null ? expected : a;
  log.push({
    n: log.length + 1,
    at: Date.now(),
    dealKey: state.guidedCurrentKey || "",
    question: String(q || "—"),
    answer: String(a || "—"),
    expected: String(exp || ""),
    status: status || "?",
  });
}

/** Escape text for Coach sheet HTML. */
function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Human label for a guided candidate key / descriptor. */
function guidedLabelForCandidate(c) {
  if (!c) return "Unknown";
  if (c.territory === "numbers") {
    const topic = NUMBERS_TOPICS.find((t) => t.id === c.topicId);
    const step = getNumbersStep(c.topicId, c.stepId);
    return [topic?.label, step?.label].filter(Boolean).join(" · ") || c.key;
  }
  if (c.territory === "nouns") {
    const unit = getGenderShortcutsUnit(c.learnUnitId);
    const fam = (unit?.families || []).find((f) => f.id === c.family);
    return [unit?.label, fam?.label].filter(Boolean).join(" · ") || c.key;
  }
  return c.key;
}

function guidedLabelForKey(key) {
  const hit = guidedCandidates().find((c) => c.key === key);
  return hit ? guidedLabelForCandidate(hit) : key;
}

function guidedStatLine(key) {
  const s = (state.guidedStats || {})[key];
  if (!s?.total) return null;
  return `${s.correct} of ${s.total} correct`;
}

/**
 * Coach sheet — layers 1–2 by default; dealer policy behind a disclosure.
 * Opens only in Guided (caller checks sessionMode).
 */
function openGuidedCoachSheet() {
  if (state.sessionMode !== "guided") return;
  const reason = state.currentReasonCode;
  const key = state.guidedCurrentKey;
  const candidates = guidedCandidates();
  const seen = state.guidedSeen || new Set();
  const stats = state.guidedStats || {};
  const current = candidates.find((c) => c.key === key);
  const currentLabel = current
    ? guidedLabelForCandidate(current)
    : key
      ? guidedLabelForKey(key)
      : "—";
  const currentStat = key ? guidedStatLine(key) : null;
  const thresholdPct = Math.round(WEAK_ACCURACY * 100);

  // Weak = seen keys under mastery threshold, lowest accuracy first.
  const weak = candidates
    .filter((c) => seen.has(c.key))
    .map((c) => {
      const s = stats[c.key];
      if (!s?.total) return null;
      const acc = s.correct / s.total;
      if (acc >= WEAK_ACCURACY) return null;
      return { c, acc, s };
    })
    .filter(Boolean)
    .sort((a, b) => a.acc - b.acc);

  const nextNew = candidates.find((c) => !seen.has(c.key));
  const touched = seen.size;
  const total = candidates.length;

  // —— Layer 1: why this exercise ——
  let whyHtml;
  if (!reason) {
    whyHtml = `<p>Your path coach is picking the next drill across Numbers and Nouns.</p>`;
  } else if (reason.code === "review") {
    whyHtml = `<p>You’re on <strong>Review</strong> because this unit is still under the lock-in bar (${thresholdPct}%)${
      currentStat ? ` — currently <strong>${escapeHtml(currentStat)}</strong>` : ""
    }.</p>
    <p class="coach-soft">${escapeHtml(reason.hint || "")}</p>`;
  } else if (reason.code === "new") {
    whyHtml = `<p>You’re on <strong>New</strong> — first unseen unit in curriculum order${
      currentLabel && currentLabel !== "—"
        ? `: <strong>${escapeHtml(currentLabel)}</strong>`
        : ""
    }.</p>
    <p class="coach-soft">${escapeHtml(reason.hint || "")}</p>`;
  } else {
    whyHtml = `<p>You’re on <strong>Continue</strong> — every unit in this path has been touched; the coach keeps drilling the weakest.</p>
    <p class="coach-soft">${escapeHtml(reason.hint || "")}</p>`;
  }

  // —— Layer 2: progress ——
  let progressBits = `<p><strong>${touched}</strong> of <strong>${total}</strong> units touched`;
  if (weak.length) progressBits += ` · <strong>${weak.length}</strong> need review`;
  progressBits += `.</p>`;
  progressBits += `<p class="coach-current">Now: <strong>${escapeHtml(
    currentLabel
  )}</strong>`;
  if (currentStat) progressBits += ` <span class="coach-stat">(${escapeHtml(currentStat)})</span>`;
  progressBits += `</p>`;

  if (weak.length) {
    const rows = weak
      .slice(0, 5)
      .map(
        (w) =>
          `<li><span>${escapeHtml(guidedLabelForCandidate(w.c))}</span> <span class="coach-stat">${w.s.correct} of ${w.s.total}</span></li>`
      )
      .join("");
    progressBits += `<p class="coach-sub">Needs review</p><ul class="coach-list">${rows}</ul>`;
  }
  if (nextNew && reason?.code !== "new") {
    progressBits += `<p class="coach-soft">Next new: <strong>${escapeHtml(
      guidedLabelForCandidate(nextNew)
    )}</strong></p>`;
  }

  // —— Under the hood (collapsed) ——
  const hood = `<details class="coach-hood">
    <summary>Under the hood</summary>
    <ol class="coach-policy">
      <li><strong>Review</strong> — weakest seen unit under ${thresholdPct}% accuracy.</li>
      <li><strong>New</strong> — first untouched unit, in curriculum order (Numbers, then Nouns).</li>
      <li><strong>Continue</strong> — once all are seen, keep the lowest-accuracy unit moving.</li>
    </ol>
    <p class="coach-soft">This deal: branch <code>${escapeHtml(
      reason?.code || "—"
    )}</code>${key ? ` · key <code>${escapeHtml(key)}</code>` : ""}.</p>
  </details>`;

  openSheet(
    "Coach",
    `<div class="coach-sheet">
      <section class="coach-block">
        <h4 class="coach-h">Why this exercise</h4>
        ${whyHtml}
      </section>
      <section class="coach-block">
        <h4 class="coach-h">Your path</h4>
        ${progressBits}
      </section>
      ${hood}
    </div>`
  );
}

/** Format one Guided debug Q&A row (final answer only). */
function formatGuidedQaRow(row) {
  const ok = row.status === "correct";
  const showExp =
    row.expected &&
    row.expected !== row.answer &&
    row.status !== "correct";
  return `<li class="dbg-qa ${ok ? "is-ok" : "is-bad"}">
    <div class="dbg-qa-head">
      <span class="dbg-n">#${row.n}</span>
      <span class="dbg-status">${escapeHtml(row.status)}</span>
      <span class="dbg-soft"><code>${escapeHtml(row.dealKey || "")}</code></span>
    </div>
    <div><span class="dbg-k">Q</span> ${escapeHtml(row.question)}</div>
    <div><span class="dbg-k">A</span> ${escapeHtml(row.answer)}${
      showExp
        ? ` <span class="dbg-soft">→ ${escapeHtml(row.expected)}</span>`
        : ""
    }</div>
  </li>`;
}

/** Format one dealer determination for the Guided debug panel. */
function formatGuidedDealRow(d) {
  const stat = d.chosenStat
    ? `${d.chosenStat.correct}/${d.chosenStat.total}`
    : "—";
  const weak =
    d.weak?.length > 0
      ? d.weak
          .map(
            (w) =>
              `${escapeHtml(w.label)} (${w.correct}/${w.total})`
          )
          .join("; ")
      : "none";
  return `<li class="dbg-deal">
    <div class="dbg-qa-head">
      <span class="dbg-n">#${d.n}</span>
      <span class="crumb-reason crumb-reason-${escapeHtml(
        d.reason
      )} dbg-reason">${escapeHtml(d.reasonLabel || d.reason)}</span>
      <span class="dbg-soft">${escapeHtml(d.territory || "")}</span>
    </div>
    <div><strong>${escapeHtml(d.label)}</strong>
      <span class="dbg-soft"><code>${escapeHtml(d.key)}</code></span>
    </div>
    <div class="dbg-soft">seen ${d.seenCount}/${d.candidateCount} · unit stats ${escapeHtml(
      stat
    )}${d.mode ? ` · ${escapeHtml(d.mode)}` : ""}</div>
    <div class="dbg-soft">weak at deal: ${weak}</div>
    ${
      d.nextNewLabel
        ? `<div class="dbg-soft">next new would be: ${escapeHtml(
            d.nextNewLabel
          )}</div>`
        : `<div class="dbg-soft">next new: — (tour complete)</div>`
    }
  </li>`;
}

/** Guided Debug sheet — session Q&A + dealer determinations. */
function openGuidedDebugSheet() {
  if (state.sessionMode !== "guided") return;
  const qa = state.guidedQaLog || [];
  const deals = state.guidedDealLog || [];
  const stats = state.guidedStats || {};
  const statsRows = Object.entries(stats)
    .map(([key, s]) => {
      const acc = s.total ? Math.round((100 * s.correct) / s.total) : 0;
      return `<li><code>${escapeHtml(key)}</code> — ${s.correct}/${s.total} (${acc}%)</li>`;
    })
    .join("");

  const qaHtml = qa.length
    ? `<ol class="dbg-list">${qa.map(formatGuidedQaRow).join("")}</ol>`
    : `<p class="coach-soft">No finished answers yet this session.</p>`;

  const dealHtml = deals.length
    ? `<ol class="dbg-list">${deals.map(formatGuidedDealRow).join("")}</ol>`
    : `<p class="coach-soft">No dealer determinations yet.</p>`;

  openSheet(
    "Guided debug",
    `<div class="coach-sheet dbg-sheet">
      <section class="coach-block">
        <h4 class="coach-h">Session Q&amp;A</h4>
        <p class="coach-soft">${qa.length} finished question${
          qa.length === 1 ? "" : "s"
        } (final answers only).</p>
        ${qaHtml}
      </section>
      <section class="coach-block">
        <h4 class="coach-h">Dealer determinations</h4>
        <p class="coach-soft">${deals.length} deal${
          deals.length === 1 ? "" : "s"
        } · current <code>${escapeHtml(
          state.guidedCurrentKey || "—"
        )}</code></p>
        ${dealHtml}
      </section>
      <section class="coach-block">
        <h4 class="coach-h">Unit stats</h4>
        ${
          statsRows
            ? `<ul class="coach-list">${statsRows}</ul>`
            : `<p class="coach-soft">No competency stats yet.</p>`
        }
      </section>
    </div>`
  );
}

function clearCrossTerritoryMix() {
  state.crossTerritoryMix = null;
}

function clearLearnSeries() {
  state.learnSeries = null;
}

/**
 * Learn: open selected units in tree (depth-first) order.
 * @param {object[]} units
 */
function startLearnSeries(units) {
  clearCrossTerritoryMix();
  const list = Array.isArray(units) ? units.filter(Boolean) : [];
  if (!list.length) return;
  state.learnSeries = { units: list, cursor: 0 };
  openLearnSeriesUnit();
}

function openLearnSeriesUnit() {
  const series = state.learnSeries;
  if (!series?.units?.length) return;
  const u = series.units[series.cursor];
  if (!u) return;
  closeSheet();
  if (isVocabNavUnit(u)) {
    const topic = u.vocabTopic || u.territory || "nouns";
    openVocabulary(topic === "nouns" ? "nouns" : "numbers", "learn");
    return;
  }
  if (u.territory === "numbers" && u.topicId && u.stepId) {
    navigate("numbers", { keepPhase: true });
    openNumbersStepLearn(u.topicId, u.stepId);
    return;
  }
  if (u.territory === "nouns") {
    openNounsStepLearn([u]);
  }
}

function learnSeriesCanPrev() {
  return (state.learnSeries?.cursor ?? 0) > 0;
}

function learnSeriesCanNext() {
  const series = state.learnSeries;
  if (!series?.units?.length) return false;
  return series.cursor < series.units.length - 1;
}

function learnSeriesPrev() {
  if (!learnSeriesCanPrev()) return;
  state.learnSeries.cursor -= 1;
  openLearnSeriesUnit();
}

function learnSeriesNext() {
  if (!learnSeriesCanNext()) return;
  state.learnSeries.cursor += 1;
  openLearnSeriesUnit();
}

function learnSeriesChromeHtml() {
  const series = state.learnSeries;
  if (!series?.units?.length || series.units.length < 2) return "";
  const n = series.units.length;
  const i = series.cursor + 1;
  const u = series.units[series.cursor];
  const label = u?.title || u?.label || "Unit";
  return `<div class="learn-series-bar" role="navigation" aria-label="Learn series">
    <button type="button" class="chip" data-learn-prev ${learnSeriesCanPrev() ? "" : "disabled"}>Previous</button>
    <span class="learn-series-status">${i} / ${n} · ${label}</span>
    <button type="button" class="chip" data-learn-next ${learnSeriesCanNext() ? "" : "disabled"}>Next</button>
  </div>`;
}

function wireLearnSeriesChrome(root) {
  if (!root) return;
  root.querySelector("[data-learn-prev]")?.addEventListener("click", () => {
    learnSeriesPrev();
  });
  root.querySelector("[data-learn-next]")?.addEventListener("click", () => {
    learnSeriesNext();
  });
}

/**
 * After finishing a Play item, pick the next territory at random.
 * @returns {boolean} true if navigation/render handled
 */
function continueCrossTerritoryMix(fromTerritory) {
  if (!state.crossTerritoryMix?.active) return false;
  const pool = state.crossTerritoryMix.territories || ["numbers", "nouns"];
  if (!pool.length) return false;
  const next = pool[Math.floor(Math.random() * pool.length)];
  if (next === fromTerritory) {
    if (next === "numbers") renderNumbers();
    else renderNouns();
    return true;
  }
  state.phase[next] = "practice";
  navigate(next, { keepPhase: true });
  return true;
}

/**
 * Set up Numbers mix/practice from carousel units. Does not navigate.
 * Includes every selected topic×step (not just the largest topic).
 * @returns {boolean}
 */
function prepareNumbersFromPlaylist(numbersUnits, practice) {
  clearNumbersHistory();

  const prefModes = (practice?.numbersModes || []).filter((id) =>
    modeAllowedByCaps(id)
  );
  let mixMode = "either";
  if (prefModes.length === 1) mixMode = prefModes[0];
  else mixMode = mixModeForCaps("either");

  const seen = new Set();
  const entries = [];
  for (const u of numbersUnits) {
    if (!u?.topicId || !u?.stepId) continue;
    const key = `${u.topicId}:${u.stepId}`;
    if (seen.has(key)) continue;
    const eligible = mixableSteps(u.topicId, mixMode);
    if (!eligible.some((s) => s.id === u.stepId)) continue;
    seen.add(key);
    entries.push({ topicId: u.topicId, stepId: u.stepId });
  }

  if (!entries.length) {
    const u = numbersUnits[0];
    if (!u?.topicId || !u?.stepId) return false;
    const modes = filterModesForCaps(modesForStep(u.topicId, u.stepId));
    const modeId =
      prefModes.find((id) => modes.some((m) => m.id === id)) ||
      modes[0]?.id ||
      "build";
    return applyNumbersFocus({
      topicId: u.topicId,
      stepId: u.stepId,
      modeId,
      difficulty: state.numbersDifficulty,
      lock: true,
    });
  }

  const topics = [...new Set(entries.map((e) => e.topicId))];
  state.numbersMixEntries = entries;
  state.numbersMixTopic = topics.length === 1 ? topics[0] : "multi";
  state.numbersMixSteps = entries.map((e) => e.stepId);
  state.numbersMixMode = mixMode;
  state.numbersHubTopic = topics[0] || "cardinals";
  return prepareNumbersMixState();
}

/** Configure mix deck from current mix topic/steps/mode. @returns {boolean} */
function prepareNumbersMixState() {
  const mode = mixModeForCaps(state.numbersMixMode);
  state.numbersMixMode = mode;

  let entries = currentMixEntries();
  // Hub path may only have topic+steps set — rebuild entries.
  if (!entries.length && state.numbersMixTopic && state.numbersMixTopic !== "multi") {
    entries = (state.numbersMixSteps || []).map((stepId) => ({
      topicId: state.numbersMixTopic,
      stepId,
    }));
  }
  entries = entries.filter(({ topicId, stepId }) =>
    mixableSteps(topicId, mode).some((s) => s.id === stepId)
  );
  if (!entries.length) return false;

  const topics = [...new Set(entries.map((e) => e.topicId))];
  state.numbersMixEntries = entries;
  state.numbersMixTopic = topics.length === 1 ? topics[0] : "multi";
  state.numbersMixSteps = entries.map((e) => e.stepId);
  state.numbersSessionKind = "mix";
  state.numbersFocusLocked = false;
  state.numbersTopic = entries[0].topicId;
  state.numbersStep = entries[0].stepId;
  state.numbersMixDeckKey = "";
  state.numbersMixDeck = null;
  state.numbersMixCursor = 0;
  state.numbersHubPracticePick = "";
  clearNumbersHistory();
  ensureMixDeck();
  return !!(state.numbersMixDeck?.length);
}

/**
 * Set up Nouns family mix from carousel units. Does not navigate.
 * @returns {boolean}
 */
function prepareNounsFromPlaylist(nounsUnits, practice) {
  const playable = nounsUnits.filter((u) => u.playable !== false);
  if (!playable.length) return false;

  const learnIds = [
    ...new Set(
      playable.map(
        (u) => u.learnUnitId || unitIdForFamily(nounsFamilyForNavUnit(u))
      )
    ),
  ];

  let uniqueFamilies = [];
  for (const learnId of learnIds) {
    for (const f of familiesForUnit(learnId)) {
      if (!uniqueFamilies.includes(f.id)) uniqueFamilies.push(f.id);
    }
  }
  if (!uniqueFamilies.length) {
    const intro = introFamilyForUnit(learnIds[0]);
    uniqueFamilies = [intro?.id || "wugs"];
  }

  const prefFamilies = (practice?.nounsFamilies || []).filter((id) =>
    uniqueFamilies.includes(id)
  );
  if (prefFamilies.length) uniqueFamilies = prefFamilies;

  const caps = navCaps();
  const modality =
    (practice?.nounsModalities || []).find((id) => {
      if (id === "category-gender") return true;
      if (id === "choose-article") return true;
      if (id === "type-article") return caps.keyboard;
      return false;
    }) ||
    (learnIds.includes("categories") ? "category-gender" : "choose-article");
  state.nounsModality = modality;

  state.nounsLearnUnit = unitIdForFamily(uniqueFamilies[0]);
  if (uniqueFamilies.length === 1) {
    state.nounsSessionKind = "focus";
    state.nounsFamilyMix = [];
    state.nounsMode = uniqueFamilies[0];
  } else {
    state.nounsSessionKind = "family-mix";
    state.nounsFamilyMix = uniqueFamilies;
    state.nounsMode = uniqueFamilies[0];
  }
  state.nounsHubPracticePick = "";
  resetNounsDeckForMode();
  return true;
}

/** Play playlist of Gender Shortcuts learn units; families from units, style from caps. */
function startNounsFromPlaylist(nounsUnits, practice) {
  if (!prepareNounsFromPlaylist(nounsUnits, practice)) return;
  state.phase.nouns = "practice";
  state.preservePractice.nouns = false;
  navigate("nouns", { keepPhase: true });
}

/** @type {{ resetToMode: Function } | null} */
let navCarouselApi = null;

function renderHub() {
  const root = els.navCarouselRoot || document.getElementById("nav-carousel-root");
  if (!root) return;
  navCarouselApi = mountNavCarousel(root, {
    embedded: true,
    onStart: handleNavCarouselStart,
  });
}

/* —— Construction helpers (tap only; drag/snap deferred) —— */

function clearSelection() {
  state.selectedPiece = null;
  document.querySelectorAll(".piece.is-selected").forEach((p) => {
    p.classList.remove("is-selected");
    p.style.outline = "";
  });
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* —— Numbers —— */

function renderNumbers() {
  if (state.numbersSessionKind === "mix") syncMixItemFocus();
  rememberNumbersPosition();
  setActionInstruction(
    "numbers",
    numbersInstruction(state.numbersQuizMode, currentNumberMeta())
  );
  clearExerciseFeedback("numbers");
  refreshPlaylistChrome();
  if (state.numbersQuizMode === "listen") {
    renderNumbersListen();
    return;
  }
  if (state.numbersQuizMode === "convert") {
    renderNumbersConvert();
    return;
  }
  if (state.numbersQuizMode === "cloze") {
    renderNumbersCloze();
    return;
  }
  if (state.numbersQuizMode === "proofread") {
    renderNumbersProofread();
    return;
  }
  if (state.numbersQuizMode === "visual") {
    renderNumbersVisual();
    return;
  }
  if (state.numbersQuizMode === "sentence") {
    renderNumbersSentence();
    return;
  }
  renderNumbersBuild();
}

function finishNumbersOk(exercise, revealForm) {
  state.numbersChecked = true;
  const meta = currentNumberMeta();
  const form =
    revealForm ||
    exercise.resolution.form ||
    (meta?.kind === "weekday" || meta?.kind === "month" ? meta.form : "");
  logGuidedQa({
    question: currentGuidedQuestionCue(),
    answer: form,
    expected: form,
    status: "correct",
  });
  // Prefer real phonetic beats: explicit answerParts → synthesized cardinal
  // morphs (when a plain value is available) → per-token fallback.
  const value = exercise?.resolution?.value ?? meta?.value;
  const parts =
    exercise?.materials?.answerParts ||
    meta?.answerParts ||
    (value != null ? numberAnswerParts(value, "listen") : null) ||
    (form || "")
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => ({ text: t, guide: t }));
  const spoken =
    exercise?.resolution?.spoken || exercise?.materials?.spoken || form;
  // Weekdays/months: English gloss only — German dictionary form is the word.
  const en =
    meta?.kind === "weekday" || meta?.kind === "month"
      ? meta.english || meta.englishWritten || ""
      : meta?.english || meta?.written || "";
  const answerEls = [
    ...document.querySelectorAll("#numbers-slots .slot.is-ok"),
    ...document.querySelectorAll(
      "#numbers-tray input.is-ok, #numbers-tray .numbers-convert-input.is-ok, #numbers-tray .numbers-listen-input.is-ok"
    ),
  ];
  presentCorrectAnswer({
    prefix: "numbers",
    answerEls,
    wrongEls: [],
    choiceEls: correctNumbersChoiceEls(form),
    reveal: {
      word: form,
      parts,
      en,
      ok: true,
    },
    then: (nodes) => {
      playAnswerKeyThenAdvance(spoken, parts, nodes, scheduleNumbersAdvance);
    },
  });
}

/** Only the matching choice/piece — do not green-flash the whole tray. */
function correctNumbersChoiceEls(form) {
  const all = [
    ...document.querySelectorAll("#numbers-tray .choice, #numbers-tray .piece"),
  ];
  const want = String(form || "").trim();
  if (want) {
    const matched = all.filter((el) => {
      const raw =
        el.dataset.value ??
        el.dataset.text ??
        el.textContent ??
        "";
      return String(raw).trim() === want;
    });
    if (matched.length) return matched;
  }
  // Cloze / marked selection: blank token ≠ full form — use is-ok mark.
  return all.filter((el) => el.classList.contains("is-ok"));
}

/**
 * One-column MC when any choice is a phrase or longer than a half-width button.
 * @param {Iterable<string>} choices
 */
function choiceGridClass(choices) {
  const list = [...(choices || [])].map((c) => String(c ?? "").trim());
  const long = list.some((t) => t.length >= 16 || /\s/.test(t));
  return "choice-grid" + (long ? " is-stacked" : "");
}

/**
 * Open the answer key for the current Numbers item, then advance.
 * Used by Skip/Forward so the learner still sees the German form.
 */
function revealNumbersThenAdvance(opts = {}) {
  const exercise = state.currentExercise || currentNumberExercise();
  const meta = currentNumberMeta();
  if (!exercise) {
    scheduleNumbersAdvance(0);
    return;
  }
  state.numbersChecked = true;
  const form =
    exercise.resolution?.form ||
    meta?.form ||
    (meta?.value != null ? String(meta.value) : "");
  logGuidedQa({
    question: currentGuidedQuestionCue(),
    answer: "—",
    expected: form,
    status: "skipped",
  });
  const value = exercise.resolution?.value ?? meta?.value;
  const parts =
    exercise.materials?.answerParts ||
    meta?.answerParts ||
    (value != null ? numberAnswerParts(value, "listen") : null) ||
    (form || "")
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => ({ text: t, guide: t }));
  const spoken =
    exercise.resolution?.spoken || exercise.materials?.spoken || form;
  const en =
    meta?.kind === "weekday" || meta?.kind === "month"
      ? meta.english || meta.englishWritten || ""
      : meta?.english || meta?.written || "";

  // Disable interactive controls so Skip mid-build is final.
  document
    .querySelectorAll(
      "#numbers-tray .piece, #numbers-tray .choice, #numbers-tray input, #numbers-tray button"
    )
    .forEach((el) => {
      el.disabled = true;
    });

  presentCorrectAnswer({
    prefix: "numbers",
    answerEls: [],
    wrongEls: [],
    choiceEls: [],
    reveal: {
      word: form,
      parts,
      en,
      ok: opts.ok === true,
      verdictLabel: opts.verdictLabel || "Answer",
    },
    then: (nodes) => {
      playAnswerKeyThenAdvance(spoken, parts, nodes, (ms) =>
        scheduleNumbersAdvance(opts.delayMs ?? ms)
      );
    },
  });
}

function skipNumbersShowingAnswer() {
  clearNumbersAdvance();
  stopSpeech();
  if (state.numbersChecked) {
    // Already revealed — just move on.
    if (continueGuided()) return;
    advanceNumbersItem();
    if (continueCrossTerritoryMix("numbers")) return;
    renderNumbers();
    return;
  }
  revealNumbersThenAdvance({ ok: false, verdictLabel: "Skipped" });
}

/** Cloze — fill one missing morph chip. */
function renderNumbersCloze() {
  clearNumbersAdvance();
  stopSpeech();
  const meta = currentNumberMeta();
  const exercise = makeClozeExercise(meta, {
    difficulty: state.numbersDifficulty,
  });
  if (!exercise) {
    state.numbersQuizMode = "build";
    renderNumbersBuild();
    return;
  }
  state.currentExercise = exercise;
  state.numbersFilled = Array(exercise.materials.parts.length).fill(null);
  exercise.materials.parts.forEach((p, i) => {
    if (i !== exercise.materials.blankIndex) state.numbersFilled[i] = p;
  });
  state.numbersChecked = false;

  const stage = document.getElementById("numbers-stage");
  if (stage) stage.dataset.mode = "cloze";
  ensureSessionChip();

  const lead = numbersLead(meta, exercise.materials.form);
  document.getElementById("numbers-prompt").innerHTML = `
    <strong lang="de">${lead}</strong>
    <span class="convert-ask">${exercise.prompt.ask}</span>
  `;
  clearAnswerReveal("numbers");
  const back = document.getElementById("numbers-back");
  if (back) back.disabled = numbersBackDisabled();
  const helpBtn = document.getElementById("numbers-help");
  if (helpBtn) {
    const sc = exercise.scaffolding || {};
    helpBtn.hidden = !(sc.showHintButton || sc.showReferenceButton);
  }

  const slots = document.getElementById("numbers-slots");
  slots.hidden = false;
  slots.className = "slot-row";
  slots.innerHTML = "";
  exercise.materials.parts.forEach((p, i) => {
    const slot = document.createElement("div");
    const isBlank = i === exercise.materials.blankIndex;
    slot.className = isBlank ? "slot is-blank" : "slot is-filled is-given";
    slot.dataset.index = String(i);
    slot.textContent = isBlank ? "…" : p;
    slots.appendChild(slot);
  });

  const tray = document.getElementById("numbers-tray");
  tray.className = "tray";
  tray.innerHTML = "";
  shuffle([exercise.materials.blank, ...exercise.materials.distractors]).forEach(
    (label) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "piece";
      btn.textContent = label;
      btn.addEventListener("click", () => {
        if (state.numbersChecked) return;
        const bi = exercise.materials.blankIndex;
        state.numbersFilled[bi] = label;
        const slot = slots.querySelector(`[data-index="${bi}"]`);
        if (slot) slot.textContent = label;
        const ok = label === exercise.materials.blank;
        if (ok) {
          btn.classList.add("is-ok");
          if (slot) slot.classList.add("is-ok");
          finishNumbersOk(exercise, exercise.resolution.form);
        } else {
          showAttemptFeedback("numbers", "Try again");
          if (slot) {
            slot.classList.add("is-bad");
            window.setTimeout(() => {
              if (state.numbersChecked) return;
              slot.textContent = "…";
              slot.classList.remove("is-bad");
              state.numbersFilled[bi] = null;
            }, 400);
          }
        }
      });
      tray.appendChild(btn);
    }
  );
  syncTerritoryMenu("numbers");
}

function renderNumbersProofread() {
  clearNumbersAdvance();
  stopSpeech();
  const meta = currentNumberMeta();
  const exercise = makeProofreadExercise(meta, {
    difficulty: state.numbersDifficulty,
  });
  if (!exercise) {
    state.numbersQuizMode = "convert";
    renderNumbersConvert();
    return;
  }
  state.currentExercise = exercise;
  state.numbersChecked = false;
  state.numbersConvertRetryUsed = false;

  const stage = document.getElementById("numbers-stage");
  if (stage) stage.dataset.mode = "proofread";
  ensureSessionChip();
  document.getElementById("numbers-prompt").innerHTML = `
    <strong lang="de">${exercise.prompt.wrong}</strong>
    <span class="convert-ask">${exercise.prompt.ask}</span>
  `;
  clearAnswerReveal("numbers");
  const back = document.getElementById("numbers-back");
  if (back) back.disabled = numbersBackDisabled();

  const slots = document.getElementById("numbers-slots");
  slots.hidden = true;
  slots.innerHTML = "";

  const tray = document.getElementById("numbers-tray");
  tray.className = "numbers-convert-entry";
  tray.innerHTML = "";
  const input = document.createElement("input");
  input.type = "text";
  input.id = "numbers-convert-input";
  input.className = "numbers-convert-input";
  input.autocomplete = "off";
  input.placeholder = "correct form…";
  const submit = () => {
    if (state.numbersChecked) return;
    const typed = normalizeConvertInput(input.value);
    if (!typed) return;
    const target = normalizeConvertInput(exercise.resolution.form);
    const ok = typed === target;
    if (ok) {
      input.classList.add("is-ok");
      finishNumbersOk(exercise, exercise.resolution.form);
    } else if (!state.numbersConvertRetryUsed) {
      state.numbersConvertRetryUsed = true;
      input.classList.add("is-bad");
      showAttemptFeedback("numbers", "Try again");
      window.setTimeout(() => {
        if (state.numbersChecked) return;
        input.value = "";
        input.classList.remove("is-bad");
        input.focus();
      }, 400);
    } else {
      state.numbersChecked = true;
      input.classList.add("is-bad");
      logGuidedQa({
        question: currentGuidedQuestionCue(),
        answer: input.value.trim() || "—",
        expected: exercise.resolution.form,
        status: "incorrect",
      });
      // Normalize the wrong-answer key to the same shape as the correct one:
      // German word up top, real syllable beats below.
      const value = exercise.resolution.value ?? meta?.value;
      const parts =
        exercise.materials?.answerParts ||
        meta?.answerParts ||
        (value != null ? numberAnswerParts(value, "listen") : null) ||
        exercise.resolution.form
          .split(/\s+/)
          .filter(Boolean)
          .map((t) => ({ text: t, guide: t }));
      const spoken =
        exercise.resolution.spoken || exercise.materials?.spoken || exercise.resolution.form;
      presentCorrectAnswer({
        prefix: "numbers",
        answerEls: [],
        wrongEls: input ? [input] : [],
        reveal: {
          word: exercise.resolution.form,
          parts,
          en: meta?.english || meta?.written || "",
          ok: false,
        },
        then: (nodes) => {
          playAnswerKeyThenAdvance(spoken, parts, nodes, scheduleNumbersAdvance);
        },
      });
    }
  };
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  });
  const checkBtn = document.createElement("button");
  checkBtn.type = "button";
  checkBtn.className = "btn btn-primary";
  checkBtn.textContent = "Check";
  checkBtn.addEventListener("click", submit);
  tray.append(input, checkBtn);
  syncTerritoryMenu("numbers");
  queueMicrotask(() => input.focus());
}

function renderNumbersVisual() {
  clearNumbersAdvance();
  stopSpeech();
  const meta = currentNumberMeta();
  const visual = visualForMeta(meta);
  if (!visual) {
    state.numbersQuizMode = "convert";
    renderNumbersConvert();
    return;
  }
  const stage = document.getElementById("numbers-stage");
  if (stage) stage.dataset.mode = "visual";

  // Analog / digital clock face → MC full readings (long phrases stack in one column).
  if (isClockMeta(meta)) {
    renderNumbersVisualClockMc(meta, visual);
    return;
  }

  let exercise;
  if (isWrittenishMeta(meta)) {
    const saved = state.numbersQuizMode;
    state.numbersQuizMode = "build";
    exercise = currentWrittenishExercise(meta);
    state.numbersQuizMode = saved;
  } else if (meta.value != null) {
    exercise = createNumberConstructionExercise(meta.value, {
      grain: meta.grain,
      english: meta.english,
      mode: state.numbersDifficulty,
      answerParts: meta.answerParts,
    });
  } else {
    state.numbersQuizMode = "convert";
    renderNumbersConvert();
    const prompt = document.getElementById("numbers-prompt");
    if (prompt) {
      prompt.innerHTML = `<div class="quiz-visual">${visual.html}</div><span class="convert-ask">${visual.ask}</span>`;
    }
    return;
  }

  state.currentExercise = exercise;
  const parts = exercise.materials.parts;
  const distractors = exercise.materials.distractors || [];
  state.numbersFilled = Array(parts.length).fill(null);
  state.numbersChecked = false;
  ensureSessionChip();
  document.getElementById("numbers-prompt").innerHTML = `
    <div class="quiz-visual">${visual.html}</div>
    <span class="convert-ask">${visual.ask}</span>
  `;
  clearAnswerReveal("numbers");
  const back = document.getElementById("numbers-back");
  if (back) back.disabled = numbersBackDisabled();

  const slots = document.getElementById("numbers-slots");
  slots.hidden = false;
  slots.className = "slot-row";
  slots.innerHTML = "";
  parts.forEach((_, i) => {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.dataset.index = String(i);
    slot.tabIndex = 0;
    slot.textContent = `Part ${i + 1}`;
    slot.addEventListener("click", () => {
      if (state.numbersChecked) return;
      if (state.numbersFilled[i]) clearNumberSlot(i);
    });
    slots.appendChild(slot);
  });

  const tray = document.getElementById("numbers-tray");
  tray.className = "tray";
  tray.innerHTML = "";
  shuffle([...new Set([...parts, ...distractors])]).forEach((label) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "piece";
    btn.textContent = label;
    btn.addEventListener("click", () => {
      if (state.numbersChecked) return;
      const next = state.numbersFilled.findIndex((x) => !x);
      if (next >= 0) placeNumberText(label, next);
    });
    tray.appendChild(btn);
  });
  syncTerritoryMenu("numbers");
}

/** Clock-face visual: pick the full German reading (register-labeled). */
function renderNumbersVisualClockMc(meta, visual) {
  const saved = state.numbersQuizMode;
  state.numbersQuizMode = "build";
  const exercise = currentWrittenishExercise(meta);
  state.numbersQuizMode = saved;
  if (!exercise) {
    state.numbersQuizMode = "convert";
    renderNumbersConvert();
    return;
  }

  const answer = exercise.resolution.form || meta.form;
  const choices = clockReadingChoices(meta, answer);
  const parts =
    exercise.materials?.answerParts ||
    meta.answerParts ||
    (answer || "")
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => ({ text: t, guide: t }));

  state.currentExercise = {
    ...exercise,
    templateId: "numbers.visual.clock",
    materials: {
      ...exercise.materials,
      form: answer,
      choices,
      answerParts: parts,
    },
    resolution: {
      ...exercise.resolution,
      form: answer,
    },
  };
  state.numbersChecked = false;
  state.numbersFilled = [];
  ensureSessionChip();

  const reg = clockReadingRegister(meta);
  const eg = reg?.example
    ? `, e.g. <span lang="de">${reg.example}</span>`
    : "";
  const ask = reg ? `${reg.label}${eg}` : visual.ask || "State the time on the clock";

  document.getElementById("numbers-prompt").innerHTML = `
    <div class="quiz-visual">${visual.html}</div>
    <span class="convert-ask">${ask}</span>
  `;
  clearAnswerReveal("numbers");
  const back = document.getElementById("numbers-back");
  if (back) back.disabled = numbersBackDisabled();

  const slots = document.getElementById("numbers-slots");
  slots.hidden = true;
  slots.innerHTML = "";

  const tray = document.getElementById("numbers-tray");
  tray.className = choiceGridClass(choices);
  tray.innerHTML = "";
  choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice";
    btn.dataset.value = choice;
    btn.textContent = choice;
    btn.addEventListener("click", () => {
      if (state.numbersChecked) return;
      const ok = choice === answer;
      if (ok) {
        btn.classList.add("is-ok");
        finishNumbersOk(state.currentExercise, answer);
      } else {
        btn.classList.add("is-bad");
        btn.disabled = true;
        showAttemptFeedback("numbers", "Try again");
      }
    });
    tray.appendChild(btn);
  });
  syncTerritoryMenu("numbers");
}

/** Full-reading MC distractors for clock / digital visual. */
function clockReadingChoices(meta, correctForm) {
  const correct = String(correctForm || meta?.form || "").trim();
  const picks = new Set(correct ? [correct] : []);
  const pool = currentNumberPool();
  for (const m of shuffle(pool)) {
    if (picks.size >= 4) break;
    const f = String(m?.form || "").trim();
    if (f && f !== correct) picks.add(f);
  }
  // Nearby minute offsets when the step pool is thin.
  if (picks.size < 4 && meta?.hours != null && meta?.minutes != null) {
    for (const d of [5, -5, 10, -10, 15, -15, 20, 30]) {
      if (picks.size >= 4) break;
      let mins = meta.minutes + d;
      let hrs = meta.hours;
      while (mins < 0) {
        mins += 60;
        hrs = (hrs + 23) % 24;
      }
      while (mins >= 60) {
        mins -= 60;
        hrs = (hrs + 1) % 24;
      }
      const f =
        meta.kind === "digital-time"
          ? digitalTimeForm(hrs, mins)
          : clockForm(hrs, mins);
      if (f && f !== correct) picks.add(f);
    }
  }
  return shuffle([...picks]).slice(0, Math.max(1, Math.min(4, picks.size)));
}

function renderNumbersSentence() {
  clearNumbersAdvance();
  stopSpeech();
  const meta = currentNumberMeta();
  const exercise = makeSentenceOrdinalExercise(meta, {
    difficulty: state.numbersDifficulty,
  });
  if (!exercise) {
    state.numbersQuizMode = "convert";
    renderNumbersConvert();
    return;
  }
  state.currentExercise = exercise;
  state.numbersChecked = false;
  const stage = document.getElementById("numbers-stage");
  if (stage) stage.dataset.mode = "sentence";
  ensureSessionChip();
  document.getElementById("numbers-prompt").innerHTML = `
    <strong lang="de">${exercise.prompt.written}</strong>
    <span class="convert-ask">${exercise.prompt.ask}</span>
  `;
  clearAnswerReveal("numbers");
  const back = document.getElementById("numbers-back");
  if (back) back.disabled = numbersBackDisabled();
  const slots = document.getElementById("numbers-slots");
  slots.hidden = true;
  slots.innerHTML = "";
  const tray = document.getElementById("numbers-tray");
  const choices = exercise.materials.choices || [];
  tray.className = choiceGridClass(choices);
  tray.innerHTML = "";
  choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice";
    btn.dataset.value = choice;
    btn.textContent = choice;
    btn.addEventListener("click", () => {
      if (state.numbersChecked) return;
      const ok = choice === exercise.resolution.form;
      if (ok) {
        btn.classList.add("is-ok");
        finishNumbersOk(exercise, exercise.resolution.form);
      } else {
        btn.classList.add("is-bad");
        showAttemptFeedback("numbers", "Try again");
      }
    });
    tray.appendChild(btn);
  });
  syncTerritoryMenu("numbers");
}

/** Session chip under the prompt — retired; crumb + instruction cover it. */
function ensureSessionChip() {
  const stage = document.getElementById("numbers-stage");
  if (!stage) return;
  stage.querySelectorAll(".numbers-session-chip").forEach((el) => el.remove());
}

function numbersPromptAsk(meta) {
  if (meta?.kind === "ordinal") return "Write the German ordinal";
  if (meta?.kind === "ordinal-am") return "Write the day-of-month form";
  return "";
}

/** English gloss for ordinal prompts: "the 89th". */
function ordinalEnglishGloss(meta) {
  const raw = String(meta?.english || "").trim();
  if (!raw) return "";
  return /^the\s+/i.test(raw) ? raw : `the ${raw}`;
}

/**
 * EN-flagged task line under the DE cue for Build / Type.
 * @param {"build"|"convert"} mode
 * @param {object} meta
 */
function numbersEnTaskAsk(mode, meta) {
  const verb = mode === "build" ? "Build" : "Write out";
  if (meta?.kind === "ordinal") {
    const gloss = ordinalEnglishGloss(meta);
    return gloss
      ? `${verb} the German ordinal (${gloss})`
      : `${verb} the German ordinal`;
  }
  if (meta?.kind === "ordinal-am") {
    const gloss = ordinalEnglishGloss(meta);
    return gloss
      ? `${verb} the day-of-month form (${gloss})`
      : `${verb} the day-of-month form`;
  }
  if (isClockMeta(meta)) {
    const reg = clockReadingRegister(meta);
    if (!reg) {
      return mode === "build"
        ? "Build the German reading"
        : "Write out the German reading";
    }
    const eg = reg.example
      ? `, e.g. <span lang="de">${reg.example}</span>`
      : "";
    return `${reg.label}${eg}`;
  }
  if (meta?.english && !isWrittenDecimalMeta(meta)) {
    return mode === "build"
      ? `Build the German form (${meta.english})`
      : `Write out the German form (${meta.english})`;
  }
  return mode === "build"
    ? "Build the German form"
    : "Write out the German form";
}

/** Clock-face reading (has a HH:MM cue), as opposed to spoken durations. */
function isClockMeta(meta) {
  return meta?.kind === "clock" || meta?.kind === "digital-time";
}

/** "08:10" → "8:10" — drop the cosmetic leading-zero hour for readability. */
function formatClockWritten(written) {
  return String(written || "").replace(/^0(\d:)/, "$1");
}

/** Prompt lead value, with clock times shown as 8:10 (not 08:10). */
function numbersLead(meta, fallback = "") {
  const base =
    meta?.written || (meta?.value != null ? String(meta.value) : fallback);
  return isClockMeta(meta) ? formatClockWritten(base) : base;
}

/** Action instruction — clock face / listen / build read "Read the time". */
function numbersInstruction(mode, meta) {
  if (
    isClockMeta(meta) &&
    (mode === "build" || mode === "listen" || mode === "visual")
  ) {
    return "Read the time";
  }
  return NUMBERS_INSTRUCTION[mode] || "";
}

/** Compact DE / EN flags for bilingual prompts (Build / Convert). */
const FLAG_DE_SVG = `<svg class="lang-flag" width="30" height="20" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M30 0H0V20H30V0Z" fill="#D80027"/><path d="M30 0H0V6.66643H30V0Z" fill="#000"/><path d="M30 13.3329H0V19.9994H30V13.3329Z" fill="#FFDA44"/></svg>`;

const FLAG_EN_SVG = `<svg class="lang-flag" width="30" height="20" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M30 0.00012207H0V20H30V0.00012207Z" fill="#F0F0F0"/><path d="M16.875 0H13.125V8.1248H0V11.8747H13.125V19.9995H16.875V11.8747H30V8.1248H16.875V0Z" fill="#D80027"/><path d="M23.0742 13.4779L30.0009 17.326V13.4779H23.0742Z" fill="#0052B4"/><path d="M18.2617 13.4779L30.0009 19.9995V18.1554L21.5813 13.4779H18.2617Z" fill="#0052B4"/><path d="M26.8739 19.9995L18.2617 15.2146V19.9995H26.8739Z" fill="#0052B4"/><path d="M18.2617 13.4779L30.0009 19.9995V18.1554L21.5813 13.4779H18.2617Z" fill="#D80027"/><path d="M5.29341 13.4778L0 16.4185V13.4778H5.29341Z" fill="#0052B4"/><path d="M11.7397 14.3071V19.9995H1.49414L11.7397 14.3071Z" fill="#0052B4"/><path d="M8.41951 13.4779L0 18.1554V19.9995L11.7391 13.4779H8.41951Z" fill="#D80027"/><path d="M6.92665 6.52159L0 2.67346V6.52159H6.92665Z" fill="#0052B4"/><path d="M11.7391 6.52159L0 0V1.84414L8.41951 6.52159H11.7391Z" fill="#0052B4"/><path d="M3.12695 0L11.7392 4.78491V0H3.12695Z" fill="#0052B4"/><path d="M11.7391 6.52159L0 0V1.84414L8.41951 6.52159H11.7391Z" fill="#D80027"/><path d="M24.707 6.5217L30.0004 3.58093V6.5217H24.707Z" fill="#0052B4"/><path d="M18.2617 5.69233V0H28.5072L18.2617 5.69233Z" fill="#0052B4"/><path d="M21.5813 6.52159L30.0009 1.84414V0L18.2617 6.52159H21.5813Z" fill="#D80027"/></svg>`;

/** German cue line with DE flag (Build / Convert prompts). */
function promptDeHtml(text) {
  return `<strong class="prompt-lang prompt-de" lang="de">${FLAG_DE_SVG}<span class="prompt-lang-text">${text}</span></strong>`;
}

/** English gloss line with EN flag. */
function promptEnHtml(text) {
  if (!text) return "";
  return `<span class="en prompt-lang prompt-en">${FLAG_EN_SVG}<span class="prompt-lang-text">${text}</span></span>`;
}

/**
 * Written-decimal cue pair: DE Komma orthography + EN point orthography.
 * (Not “spoken German” — numerals in each locale’s decimal notation.)
 */
function promptWrittenDecimalHtml(deWritten, enWritten) {
  const de = deWritten
    ? `<strong class="prompt-lang prompt-de" lang="de">${FLAG_DE_SVG}<span class="prompt-format-tag">written</span><span class="prompt-lang-text">${deWritten}</span></strong>`
    : "";
  const en = enWritten
    ? `<span class="en prompt-lang prompt-en">${FLAG_EN_SVG}<span class="prompt-format-tag">written</span><span class="prompt-lang-text">${enWritten}</span></span>`
    : "";
  return `${de}${en}`;
}

function isWrittenDecimalMeta(meta) {
  return meta?.kind === "decimal" || meta?.kind === "money";
}

function renderNumbersBuild() {
  clearNumbersAdvance();
  stopSpeech();
  const exercise = currentNumberExercise();
  const meta = currentNumberMeta();
  state.currentExercise = exercise;
  const parts = exercise.materials.parts;
  const distractors = exercise.materials.distractors;
  state.numbersFilled = Array(parts.length).fill(null);
  state.numbersChecked = false;
  state.numbersListenChoice = null;

  const stage = document.getElementById("numbers-stage");
  if (stage) stage.dataset.mode = "build";

  ensureSessionChip();

  const promptLead = numbersLead(meta, exercise.materials?.written || "");
  let promptHtml;
  if (isWrittenDecimalMeta(meta)) {
    // 4,85 / 4.85 — written decimals (Komma vs point), not spoken forms.
    promptHtml = promptWrittenDecimalHtml(
      promptLead,
      meta.english || exercise.prompt?.english || ""
    );
  } else {
    const enAsk = numbersEnTaskAsk("build", meta);
    promptHtml = `${promptDeHtml(promptLead)}${promptEnHtml(enAsk)}`;
  }
  document.getElementById("numbers-prompt").innerHTML = promptHtml;

  clearAnswerReveal("numbers");
  const back = document.getElementById("numbers-back");
  if (back) back.disabled = numbersBackDisabled();

  const helpBtn = document.getElementById("numbers-help");
  if (helpBtn) {
    const sc = exercise.scaffolding || {};
    helpBtn.hidden = !(sc.showHintButton || sc.showReferenceButton);
  }

  const slots = document.getElementById("numbers-slots");
  slots.hidden = false;
  slots.className = "slot-row";
  slots.innerHTML = "";
  parts.forEach((_, i) => {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.dataset.index = String(i);
    slot.tabIndex = 0;
    slot.textContent = `Part ${i + 1}`;
    slot.addEventListener("click", () => {
      if (state.numbersChecked) return;
      if (state.numbersFilled[i]) clearNumberSlot(i);
    });
    slot.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        slot.click();
      }
    });
    slots.appendChild(slot);
  });

  const tray = document.getElementById("numbers-tray");
  tray.className = "tray";
  tray.innerHTML = "";
  // Unique chip labels — reusable (same form can fill more than one slot).
  const labels = [...new Set([...parts, ...distractors])];
  shuffle(labels).forEach((text, i) => {
    const piece = document.createElement("button");
    piece.type = "button";
    piece.className = "piece";
    piece.dataset.id = `n${i}`;
    piece.dataset.text = text;
    piece.textContent = text;
    piece.addEventListener("click", () => {
      if (state.numbersChecked) return;
      const next = state.numbersFilled.findIndex((x) => !x);
      if (next >= 0) placeNumberText(text, next);
    });
    tray.appendChild(piece);
  });

  syncTerritoryMenu("numbers");
}

function renderNumbersListen() {
  clearNumbersAdvance();
  stopSpeech();
  const exercise = currentNumberExercise();
  const meta = currentNumberMeta();
  state.currentExercise = exercise;
  state.numbersFilled = [];
  state.numbersChecked = false;
  state.numbersListenChoice = null;
  state.numbersListenRetryUsed = false;

  const stage = document.getElementById("numbers-stage");
  if (stage) stage.dataset.mode = "listen";

  ensureSessionChip();

  const listenWritten = exercise.templateId === "numbers.listen.written";
  const listenReadTime = exercise.templateId === "numbers.listen.read-time";
  const listenKind = exercise.resolution?.kind || meta?.kind || "";
  const listenIsDecimalish =
    listenWritten &&
    (listenKind === "decimal" || listenKind === "money");
  const listenSelect =
    state.numbersDifficulty === "assisted" || !navCaps().keyboard;
  const clockReg = listenReadTime ? clockReadingRegister(meta) : null;
  if (listenReadTime) {
    const lead = numbersLead(meta, exercise.materials?.written || "");
    const eg = clockReg?.example
      ? `, e.g. <span lang="de">${clockReg.example}</span>`
      : "";
    const ask = clockReg
      ? `${listenSelect ? "Pick" : "Type"} · ${clockReg.label}${eg}`
      : listenSelect
        ? "Pick the German reading"
        : "Type the German reading";
    document.getElementById("numbers-prompt").innerHTML = `
      ${promptDeHtml(lead)}
      <span class="convert-ask">${ask}</span>`;
  } else {
    document.getElementById("numbers-prompt").innerHTML = listenWritten
      ? listenIsDecimalish
        ? `What did you hear?
         <span class="convert-ask">${
           listenSelect
             ? `Select the German Komma form (e.g. <span lang="de">16,42</span>).`
             : `Type the German Komma form (e.g. <span lang="de">16,42</span>).`
         }</span>`
        : `What did you hear?
         <span class="convert-ask">${
           listenSelect
             ? "Select the German written form you heard."
             : "Type the German written form you heard."
         }</span>`
      : `What number did you hear?`;
  }

  clearAnswerReveal("numbers");
  const back = document.getElementById("numbers-back");
  if (back) back.disabled = numbersBackDisabled();

  const helpBtn = document.getElementById("numbers-help");
  if (helpBtn) {
    const sc = exercise.scaffolding || {};
    helpBtn.hidden = !(sc.showHintButton || sc.showReferenceButton);
  }

  const slots = document.getElementById("numbers-slots");
  slots.className = "numbers-listen-play";
  slots.innerHTML = "";
  if (listenReadTime) {
    slots.hidden = true;
  } else {
    slots.hidden = false;
    const playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.className = "btn btn-primary play-btn";
    playBtn.id = "numbers-listen-play";
    playBtn.textContent = "Play";
    if (!navCaps().audio) {
      playBtn.disabled = true;
      playBtn.title = "Audio is off for this session";
    } else {
      playBtn.addEventListener("click", () => {
        if (state.numbersChecked) return;
        playNumbersListen();
      });
    }
    slots.appendChild(playBtn);
  }

  const tray = document.getElementById("numbers-tray");
  tray.innerHTML = "";

  if (state.numbersDifficulty === "assisted" || !navCaps().keyboard) {
    tray.className = choiceGridClass(exercise.materials.choices || []);
    tray.setAttribute(
      "aria-label",
      listenReadTime
        ? "German reading choices"
        : listenWritten
          ? "Written form choices"
          : "Number choices"
    );
    exercise.materials.choices.forEach((n) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice";
      btn.dataset.value = String(n);
      btn.textContent = String(n);
      btn.addEventListener("click", () => {
        if (state.numbersChecked) return;
        state.numbersListenChoice = n;
        checkNumbersListen(n);
      });
      tray.appendChild(btn);
    });
  } else {
    tray.className = "numbers-listen-entry";
    tray.setAttribute(
      "aria-label",
      listenReadTime
        ? "Enter the German reading"
        : listenWritten
          ? "Enter the written form"
          : "Enter the number"
    );
    const input = document.createElement("input");
    input.type = "text";
    input.id = "numbers-listen-input";
    input.className = "numbers-listen-input";
    if (!listenWritten && !listenReadTime) {
      input.inputMode = "numeric";
      input.pattern = "[0-9]*";
      input.maxLength = listenInputMaxLength();
    } else {
      input.inputMode = listenReadTime ? "text" : "decimal";
      input.maxLength = listenReadTime ? 48 : 16;
      input.autocapitalize = "off";
      input.spellcheck = false;
    }
    input.autocomplete = "off";
    input.placeholder = listenReadTime
      ? "German reading"
      : listenWritten
        ? listenIsDecimalish
          ? "e.g. 16,42"
          : "German written form"
        : "";
    input.setAttribute(
      "aria-label",
      listenReadTime
        ? "German reading"
        : listenWritten
          ? listenIsDecimalish
            ? "German Komma form"
            : "Written form you heard"
          : "Number you heard"
    );
    const checkBtn = document.createElement("button");
    checkBtn.type = "button";
    checkBtn.className = "btn btn-primary";
    checkBtn.id = "numbers-listen-check";
    checkBtn.textContent = "Check";
    const submit = () => {
      if (state.numbersChecked) return;
      const raw = input.value.trim();
      if (listenWritten || listenReadTime) {
        if (!raw) {
          input.classList.add("is-bad");
          return;
        }
        checkNumbersListen(raw);
        return;
      }
      const pool = listenValuePool();
      const maxDigits = String(Math.max(0, ...pool)).length || 1;
      if (!new RegExp(`^\\d{1,${maxDigits}}$`).test(raw)) {
        input.classList.add("is-bad");
        return;
      }
      const n = Number(raw);
      if (!listenDigitAllowed(n)) {
        input.classList.add("is-bad");
        return;
      }
      checkNumbersListen(n);
    };
    checkBtn.addEventListener("click", submit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
      }
    });
    input.addEventListener("input", () => input.classList.remove("is-bad"));
    tray.append(input, checkBtn);
    queueMicrotask(() => input.focus());
  }

  syncTerritoryMenu("numbers");
  // Auto-play when possible; skip for read-the-time (cue is the digital display).
  if (!listenReadTime) {
    queueMicrotask(() => playNumbersListen());
  }
}

function playNumbersListen() {
  if (!navCaps().audio) return;
  const exercise = state.currentExercise || currentNumberExercise();
  const form = exercise.resolution?.form || exercise.materials?.form;
  if (!form) return;
  speakGerman(form);
}

function normalizeConvertInput(raw) {
  // Collapse runs of whitespace — do NOT strip spaces. Spoken decimals need
  // "vier Komma acht fünf", not "vierKommaachtfünf".
  // Case-sensitive: keep capitalization (Komma, Uhr, Viertel, …).
  return String(raw || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/ß/g, "ss") // allow ss for ß while typing
    .replace(/\./g, ","); // accept Punkt when target uses Komma
}

function convertTargetForm(exercise) {
  return String(exercise?.resolution?.form || exercise?.materials?.form || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\./g, ",");
}

/** Space-normalize + ß-fold a candidate answer (case preserved). */
function normalizeAnswerCandidate(raw) {
  return String(raw || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/ß/g, "ss")
    .replace(/\./g, ",");
}

/** Assisted: live prefix check. Core: only used on submit. */
function convertInputMatches(typed, targetForm, acceptedForms) {
  const t = normalizeConvertInput(typed);
  const variants = [];
  const add = (form) => {
    const n = normalizeAnswerCandidate(form);
    if (!n) return;
    variants.push(n);
    if (String(form).includes("ß")) {
      variants.push(normalizeAnswerCandidate(String(form).replace(/ß/g, "ss")));
    }
  };
  add(targetForm);
  for (const alt of acceptedForms || []) add(alt);
  const uniq = [...new Set(variants)];
  return {
    typed: t,
    isPrefix: t.length > 0 && uniq.some((v) => v.startsWith(t)),
    isComplete: uniq.some((v) => v === t),
  };
}

function renderNumbersConvert() {
  clearNumbersAdvance();
  stopSpeech();
  const exercise = currentNumberExercise();
  const meta = currentNumberMeta();
  state.currentExercise = exercise;
  state.numbersFilled = [];
  state.numbersChecked = false;
  state.numbersConvertRetryUsed = false;

  const stage = document.getElementById("numbers-stage");
  if (stage) stage.dataset.mode = "convert";

  ensureSessionChip();

  const convertLead = numbersLead(meta);
  // Written-decimal cues: show Komma vs point as written forms; answer is spoken.
  // No English *gloss* of the spoken reading — point form is orthography, not a translation.
  let promptHtml;
  if (isWrittenDecimalMeta(meta)) {
    const example = convertReadingExample(meta);
    const convertAsk = (() => {
      if (isWrittenishMeta(meta)) {
        const ex = example
          ? ` — e.g. <span lang="de">${example}</span>`
          : "";
        return `Write out the German reading${ex}`;
      }
      return "Write out the German form";
    })();
    promptHtml = `${promptWrittenDecimalHtml(
      convertLead,
      meta.english || ""
    )}<span class="convert-ask">${convertAsk}</span>`;
  } else {
    promptHtml = `${promptDeHtml(convertLead)}${promptEnHtml(
      numbersEnTaskAsk("convert", meta)
    )}`;
  }
  document.getElementById("numbers-prompt").innerHTML = promptHtml;

  clearAnswerReveal("numbers");
  const back = document.getElementById("numbers-back");
  if (back) back.disabled = numbersBackDisabled();

  const helpBtn = document.getElementById("numbers-help");
  if (helpBtn) {
    const sc = exercise.scaffolding || {};
    helpBtn.hidden = !(sc.showHintButton || sc.showReferenceButton);
  }

  const slots = document.getElementById("numbers-slots");
  slots.hidden = true;
  slots.className = "";
  slots.innerHTML = "";

  const tray = document.getElementById("numbers-tray");
  tray.className = "numbers-convert-entry";
  tray.innerHTML = "";

  const assisted = state.numbersDifficulty === "assisted";
  const accepted =
    exercise.resolution?.acceptedForms || acceptedConvertForms(meta);
  const input = document.createElement("input");
  input.type = "text";
  input.id = "numbers-convert-input";
  input.className = "numbers-convert-input";
  input.autocomplete = "off";
  input.autocapitalize = "off";
  input.spellcheck = false;
  input.setAttribute("aria-label", "German number form");
  input.placeholder = assisted ? "start typing…" : "German form";

  const finishIfComplete = () => {
    if (state.numbersChecked) return;
    const target = convertTargetForm(exercise);
    const { isComplete } = convertInputMatches(input.value, target, accepted);
    if (isComplete) checkNumbersConvert(input.value, { fromLive: true });
  };

  input.addEventListener("input", () => {
    if (state.numbersChecked) return;
    if (!assisted) {
      input.classList.remove("is-ok", "is-bad", "is-prefix-ok");
      return;
    }
    const target = convertTargetForm(exercise);
    const { typed, isPrefix, isComplete } = convertInputMatches(
      input.value,
      target,
      accepted
    );
    input.classList.remove("is-ok", "is-bad", "is-prefix-ok");
    if (!typed) return;
    if (isComplete) {
      input.classList.add("is-ok");
      finishIfComplete();
      return;
    }
    if (isPrefix) input.classList.add("is-prefix-ok");
    else input.classList.add("is-bad");
  });

  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (!assisted) {
      checkNumbersConvert(input.value);
      return;
    }
    const target = convertTargetForm(exercise);
    const { typed, isPrefix, isComplete } = convertInputMatches(
      input.value,
      target,
      accepted
    );
    if (isComplete) {
      checkNumbersConvert(input.value, { fromLive: true });
      return;
    }
    // Burn a strike only when the field is clearly wrong (not a live green prefix).
    if (typed && !isPrefix) checkNumbersConvert(input.value);
  });

  tray.appendChild(input);

  // Check is always available so a wrong answer can be committed (Assisted
  // live-red alone never opened the answer key).
  const checkBtn = document.createElement("button");
  checkBtn.type = "button";
  checkBtn.className = "btn btn-primary";
  checkBtn.id = "numbers-convert-check";
  checkBtn.textContent = "Check";
  checkBtn.addEventListener("click", () => checkNumbersConvert(input.value));
  tray.appendChild(checkBtn);

  syncTerritoryMenu("numbers");
  queueMicrotask(() => input.focus());
}

function checkNumbersConvert(raw, opts = {}) {
  if (state.numbersChecked) return;
  const exercise = state.currentExercise || currentNumberExercise();
  const meta = currentNumberMeta();
  const form = convertTargetForm(exercise);
  const typed = normalizeConvertInput(raw);
  if (!typed) return;

  const accepted =
    exercise.resolution?.acceptedForms || acceptedConvertForms(meta);
  const { isComplete } = convertInputMatches(typed, form, accepted);
  // Case-sensitive exact match against canonical + accepted alternates only
  // (no case-folding parse shortcuts that would accept "vier komma…").
  let ok = isComplete;
  // Cardinal compounds: allow value-parse only when casing already matches
  // the all-lowercase cardinal orthography (no capitals to police).
  if (
    !ok &&
    exercise.resolution?.value != null &&
    meta?.kind === "cardinal"
  ) {
    const spacingOk =
      !/\s/.test(form) || /\s/.test(String(raw || "").trim());
    if (spacingOk && typed === typed.toLowerCase()) {
      const parsed = parseCardinalForm(typed.replace(/\s+/g, ""));
      ok = parsed === exercise.resolution.value;
    }
  }

  state.attemptLog.push({
    territoryId: "numbers",
    templateId: "numbers.convert.form",
    mode: exercise.mode,
    target: { value: exercise.resolution.value, form: exercise.resolution.form },
    rawInput: { text: raw },
    evaluation: {
      status: ok ? "correct" : "incorrect",
      canonicalAnswers: [exercise.resolution.form],
    },
    appVersion: "mock",
  });

  const input = document.getElementById("numbers-convert-input");
  const checkBtn = document.getElementById("numbers-convert-check");

  if (!ok && exercise.scaffolding.allowRetryWrongChoice && !state.numbersConvertRetryUsed) {
    state.numbersConvertRetryUsed = true;
    if (input) {
      input.classList.remove("is-ok", "is-prefix-ok");
      void input.offsetWidth;
      input.classList.add("is-bad");
      if (!opts.fromLive) {
        window.setTimeout(() => {
          if (state.numbersChecked) return;
          input.value = "";
          input.classList.remove("is-bad");
          input.focus();
        }, 450);
      }
    }
    showExerciseFeedback(
      "numbers",
      "Not quite — check the spelling and try once more.",
      { hint: true }
    );
    return;
  }

  state.numbersChecked = true;
  clearExerciseFeedback("numbers");
  if (checkBtn) checkBtn.disabled = true;
  if (input) {
    input.disabled = true;
    input.classList.remove("is-bad", "is-prefix-ok");
    input.value = exercise.resolution.form;
  }

  logGuidedQa({
    question: currentGuidedQuestionCue(),
    answer: typed || "—",
    expected: exercise.resolution.form,
    status: ok ? "correct" : "incorrect",
  });

  const parts =
    exercise.materials.answerParts ||
    (exercise.resolution.value != null
      ? numberAnswerParts(exercise.resolution.value, "listen")
      : null) ||
    [{ text: exercise.resolution.form, guide: exercise.resolution.form }];

  const revealWord =
    exercise.materials.spoken || exercise.resolution.spoken || exercise.resolution.form;
  const revealEn =
    meta?.kind === "weekday" || meta?.kind === "month"
      ? meta.english || meta.englishWritten || ""
      : meta.written
        ? `${meta.english || ""} (${meta.written})`
        : `${meta.english || englishCardinal(exercise.resolution.value)} (${exercise.resolution.value})`;

  presentCorrectAnswer({
    prefix: "numbers",
    answerEls: input ? [input] : [],
    wrongEls: [],
    reveal: {
      word: revealWord,
      parts,
      en: revealEn,
      ok,
    },
    then: (nodes) => {
      const tts = exercise.materials.spoken || exercise.resolution.form;
      playAnswerKeyThenAdvance(tts, parts, nodes, scheduleNumbersAdvance);
    },
  });
}

function checkNumbersListen(answer) {
  if (state.numbersChecked) return;
  const exercise = state.currentExercise || currentNumberExercise();
  const meta = currentNumberMeta();
  const writtenMode = exercise.templateId === "numbers.listen.written";
  const readTimeMode = exercise.templateId === "numbers.listen.read-time";
  const accepted =
    exercise.resolution?.acceptedForms || acceptedConvertForms(meta);
  let target;
  let ok;
  if (readTimeMode) {
    target = exercise.resolution.form;
    ok = convertInputMatches(String(answer), target, accepted).isComplete;
  } else if (writtenMode) {
    target = exercise.resolution.written;
    ok = normalizeConvertInput(answer) === normalizeConvertInput(target);
  } else {
    target = exercise.resolution.value;
    ok = Number(answer) === Number(target);
  }

  state.attemptLog.push({
    territoryId: "numbers",
    templateId: exercise.templateId,
    mode: exercise.mode,
    target: {
      value: target,
      form: exercise.resolution.form,
      written: exercise.resolution.written,
    },
    rawInput: { value: answer },
    evaluation: {
      status: ok ? "correct" : "incorrect",
      canonicalAnswers: readTimeMode
        ? accepted.length
          ? accepted
          : [String(target)]
        : [String(target)],
    },
    appVersion: "mock",
  });

  // One second chance (Assisted choices or Core typed entry).
  if (!ok && exercise.scaffolding.allowRetryWrongChoice && !state.numbersListenRetryUsed) {
    state.numbersListenRetryUsed = true;
    state.numbersListenChoice = null;
    if (state.numbersDifficulty === "assisted") {
      document.querySelectorAll("#numbers-tray .choice").forEach((el) => {
        const same =
          writtenMode || readTimeMode
            ? String(el.dataset.value) === String(answer)
            : Number(el.dataset.value) === Number(answer);
        if (same) {
          el.classList.remove("is-bad");
          void el.offsetWidth;
          el.classList.add("is-bad");
          el.disabled = true;
        }
      });
    } else {
      const input = document.getElementById("numbers-listen-input");
      if (input) {
        input.classList.remove("is-bad");
        void input.offsetWidth;
        input.classList.add("is-bad");
        window.setTimeout(() => {
          if (state.numbersChecked) return;
          input.value = "";
          input.classList.remove("is-bad");
          input.focus();
        }, 450);
      }
    }
    showAttemptFeedback("numbers", "Try again");
    return;
  }

  state.numbersChecked = true;

  logGuidedQa({
    question: currentGuidedQuestionCue(),
    answer: String(answer),
    expected: writtenMode || readTimeMode
      ? String(target)
      : exercise.resolution.form || String(target),
    status: ok ? "correct" : "incorrect",
  });

  const playBtn = document.getElementById("numbers-listen-play");
  if (playBtn) playBtn.disabled = true;

  const answerEls = [];
  const choiceEls = [];
  const stringChoice = writtenMode || readTimeMode;
  if (state.numbersDifficulty === "assisted") {
    document.querySelectorAll("#numbers-tray .choice").forEach((el) => {
      el.disabled = true;
      const sameAns = stringChoice
        ? String(el.dataset.value) === String(answer)
        : Number(el.dataset.value) === Number(answer);
      const sameTarget = stringChoice
        ? String(el.dataset.value) === String(target)
        : Number(el.dataset.value) === Number(target);
      if (sameAns && !ok) el.classList.add("is-bad");
      if (sameTarget) {
        el.classList.add("is-ok");
        choiceEls.push(el);
      }
    });
  } else {
    const input = document.getElementById("numbers-listen-input");
    const checkBtn = document.getElementById("numbers-listen-check");
    if (checkBtn) checkBtn.disabled = true;
    if (input) {
      input.disabled = true;
      input.classList.remove("is-ok", "is-bad");
      input.value = String(target);
      if (ok) input.classList.add("is-ok");
      answerEls.push(input);
    }
  }

  const form = exercise.resolution.form;
  const parts =
    exercise.materials.answerParts ||
    (writtenMode
      ? null
      : numberAnswerParts(target, "listen")) ||
    [{ text: form, guide: form }];
  const english = meta.english || (writtenMode ? "" : englishCardinal(target));

  presentCorrectAnswer({
    prefix: "numbers",
    answerEls,
    choiceEls,
    reveal: {
      word: form,
      parts,
      en: writtenMode
        ? `${english || meta.english || ""} (${target})`
        : `${english} (${target})`,
      ok,
    },
    then: (nodes) => {
      playAnswerKeyThenAdvance(form, parts, nodes, scheduleNumbersAdvance);
    },
  });
}

function placeNumberText(text, slotIndex) {
  if (state.numbersChecked) return;
  if (slotIndex < 0 || slotIndex >= state.numbersFilled.length) return;

  state.numbersFilled[slotIndex] = text;

  const slot = document.querySelector(
    `#numbers-slots [data-index="${slotIndex}"]`
  );
  if (slot) {
    slot.classList.add("is-filled");
    slot.classList.remove("is-ok", "is-bad");
    slot.textContent = text;
    slot.setAttribute("aria-label", `${text}, tap to remove`);
  }

  clearSelection();

  if (state.numbersFilled.every(Boolean)) {
    checkNumbers();
  }
}

function clearNumberSlot(slotIndex) {
  if (state.numbersChecked) return;
  if (slotIndex < 0 || slotIndex >= state.numbersFilled.length) return;
  if (!state.numbersFilled[slotIndex]) return;

  state.numbersFilled[slotIndex] = null;
  const slot = document.querySelector(
    `#numbers-slots [data-index="${slotIndex}"]`
  );
  if (slot) {
    slot.classList.remove("is-filled", "is-ok", "is-bad");
    slot.textContent = `Part ${slotIndex + 1}`;
    slot.removeAttribute("aria-label");
  }
  clearSelection();
}

function clearNumbers() {
  if (state.numbersChecked) return;
  if (state.numbersQuizMode === "listen") {
    renderNumbersListen();
    return;
  }
  if (state.numbersQuizMode === "convert") {
    renderNumbersConvert();
    return;
  }
  if (state.numbersQuizMode === "cloze") {
    renderNumbersCloze();
    return;
  }
  if (state.numbersQuizMode === "proofread") {
    renderNumbersProofread();
    return;
  }
  if (state.numbersQuizMode === "visual") {
    renderNumbersVisual();
    return;
  }
  if (state.numbersQuizMode === "sentence") {
    renderNumbersSentence();
    return;
  }
  const exercise = currentNumberExercise();
  state.numbersFilled = Array(exercise.materials.parts.length).fill(null);
  document.querySelectorAll("#numbers-slots .slot").forEach((s, i) => {
    s.classList.remove("is-filled", "is-ok", "is-bad");
    s.textContent = `Part ${i + 1}`;
    s.removeAttribute("aria-label");
  });
  clearSelection();
}

function clearNumbersAdvance() {
  if (state.numbersAdvanceTimer) {
    clearTimeout(state.numbersAdvanceTimer);
    state.numbersAdvanceTimer = null;
  }
  clearCorrectFlashTimer();
}

function scheduleNumbersAdvance(delayMs = 1500) {
  clearNumbersAdvance();
  state.numbersAdvanceTimer = setTimeout(() => {
    state.numbersAdvanceTimer = null;
    deferHeavy(() => {
      if (continueGuided()) return;
      advanceNumbersItem();
      if (continueCrossTerritoryMix("numbers")) return;
      renderNumbers();
    });
  }, delayMs);
}

function numbersBackDisabled() {
  return (state.numbersHistoryIndex ?? -1) <= 0;
}

function clearNumbersHistory() {
  state.numbersHistory = [];
  state.numbersHistoryIndex = -1;
}

function captureNumbersSnapshot() {
  const meta = currentNumberMeta();
  return {
    sessionKind: state.numbersSessionKind,
    topic: state.numbersTopic,
    step: state.numbersStep,
    mode: state.numbersQuizMode,
    difficulty: state.numbersDifficulty,
    index: state.numbersIndex,
    listenCursor: state.numbersListenCursor,
    mixCursor: state.numbersMixCursor,
    itemKey: numbersItemKey(meta),
    guidedKey: state.guidedCurrentKey,
    reasonCode: state.currentReasonCode,
    focusLocked: state.numbersFocusLocked,
  };
}

function snapsMatch(a, b) {
  if (!a || !b) return false;
  return (
    a.itemKey === b.itemKey &&
    a.mode === b.mode &&
    a.step === b.step &&
    a.topic === b.topic &&
    a.sessionKind === b.sessionKind
  );
}

/** Record the live question in history (seed / refresh current slot / append). */
function rememberNumbersPosition() {
  let snap;
  try {
    snap = captureNumbersSnapshot();
  } catch {
    return;
  }
  if (!snap?.itemKey) return;
  const hist = state.numbersHistory || (state.numbersHistory = []);
  const i = state.numbersHistoryIndex ?? -1;

  if (i >= 0 && i < hist.length) {
    if (!snapsMatch(hist[i], snap)) hist[i] = snap;
    return;
  }

  hist.push(snap);
  state.numbersHistoryIndex = hist.length - 1;
  if (hist.length > 40) {
    hist.shift();
    state.numbersHistoryIndex -= 1;
  }
}

/** Jump deck cursor to an item key; return false if not found. */
function seekNumbersDeckToKey(deck, cursorProp, itemKey) {
  if (!deck?.length || !itemKey) return false;
  const i = deck.findIndex((m) => numbersItemKey(m) === itemKey);
  if (i < 0) return false;
  state[cursorProp] = i;
  return true;
}

function restoreNumbersNavSnapshot(snap) {
  if (!snap) return false;
  state.numbersSessionKind = snap.sessionKind || "step";
  state.numbersTopic = snap.topic;
  state.numbersStep = snap.step;
  state.numbersQuizMode = snap.mode;
  if (snap.difficulty) state.numbersDifficulty = snap.difficulty;
  state.numbersFocusLocked = snap.focusLocked !== false;
  state.guidedCurrentKey = snap.guidedKey || state.guidedCurrentKey;
  state.currentReasonCode = snap.reasonCode || null;

  if (snap.sessionKind === "mix") {
    ensureMixDeck();
    if (!seekNumbersDeckToKey(state.numbersMixDeck, "numbersMixCursor", snap.itemKey)) {
      state.numbersMixCursor = Math.min(
        snap.mixCursor ?? 0,
        Math.max(0, (state.numbersMixDeck?.length || 1) - 1)
      );
    }
    syncMixItemFocus();
  } else if (snap.mode === "listen") {
    ensureListenDeck();
    if (
      !seekNumbersDeckToKey(
        state.numbersListenDeck,
        "numbersListenCursor",
        snap.itemKey
      )
    ) {
      state.numbersListenCursor = Math.min(
        snap.listenCursor ?? 0,
        Math.max(0, (state.numbersListenDeck?.length || 1) - 1)
      );
    }
  } else {
    ensureStepDeck();
    if (!seekNumbersDeckToKey(state.numbersStepDeck, "numbersIndex", snap.itemKey)) {
      state.numbersIndex = Math.min(
        snap.index ?? 0,
        Math.max(0, (state.numbersStepDeck?.length || 1) - 1)
      );
    }
  }
  return true;
}

/** Advance one step; skip a back-to-back duplicate when the deck allows. */
function advanceNumbersCursor() {
  if (state.numbersSessionKind === "mix") {
    ensureMixDeck();
    const deck = state.numbersMixDeck;
    const curKey = numbersItemKey(deck[state.numbersMixCursor]);
    state.numbersMixCursor += 1;
    if (state.numbersMixCursor >= deck.length) {
      state.numbersMixDeck = shuffleAvoidingKey(deck, curKey);
      state.numbersMixCursor = 0;
    } else if (
      deck.length > 1 &&
      numbersItemKey(deck[state.numbersMixCursor]) === curKey
    ) {
      state.numbersMixCursor += 1;
      if (state.numbersMixCursor >= deck.length) {
        state.numbersMixDeck = shuffleAvoidingKey(deck, curKey);
        state.numbersMixCursor = 0;
      }
    }
    syncMixItemFocus();
    return;
  }
  if (state.numbersQuizMode === "listen") {
    ensureListenDeck();
    const deck = state.numbersListenDeck;
    const curKey = numbersItemKey(deck[state.numbersListenCursor]);
    state.numbersListenCursor += 1;
    if (state.numbersListenCursor >= deck.length) {
      reshuffleListenDeck();
    } else if (
      deck.length > 1 &&
      numbersItemKey(deck[state.numbersListenCursor]) === curKey
    ) {
      state.numbersListenCursor += 1;
      if (state.numbersListenCursor >= deck.length) reshuffleListenDeck();
    }
    return;
  }
  ensureStepDeck();
  const deck = state.numbersStepDeck;
  const curKey = numbersItemKey(deck[state.numbersIndex]);
  state.numbersIndex += 1;
  if (state.numbersIndex >= deck.length) {
    reshuffleStepDeck();
  } else if (
    deck.length > 1 &&
    numbersItemKey(deck[state.numbersIndex]) === curKey
  ) {
    state.numbersIndex += 1;
    if (state.numbersIndex >= deck.length) reshuffleStepDeck();
  }
}

function advanceNumbersItem() {
  const hist = state.numbersHistory || [];
  const i = state.numbersHistoryIndex ?? -1;
  // Redo a previously visited forward question exactly.
  if (i >= 0 && i < hist.length - 1) {
    state.numbersHistoryIndex = i + 1;
    restoreNumbersNavSnapshot(hist[state.numbersHistoryIndex]);
    return;
  }
  advanceNumbersCursor();
  // Past-the-end index so rememberNumbersPosition appends the new live item.
  state.numbersHistoryIndex = hist.length;
}

function retreatNumbersItem() {
  const i = state.numbersHistoryIndex ?? -1;
  if (i <= 0) return false;
  state.numbersHistoryIndex = i - 1;
  return restoreNumbersNavSnapshot(state.numbersHistory[state.numbersHistoryIndex]);
}

function checkNumbers() {
  if (state.numbersChecked) return;
  const exercise = currentNumberExercise();
  const meta = currentNumberMeta();
  const parts = exercise.materials.parts;
  if (state.numbersFilled.some((x) => !x)) return;

  state.numbersChecked = true;
  const built = state.numbersFilled.slice();
  const { evaluation, attempt, accepted } = submitExerciseAttempt(
    exercise,
    { parts: built },
    { appVersion: "mock" }
  );
  state.attemptLog.push(attempt);

  // PART slots: highlight + flash. Tray chips: green/red border only (no flash).
  const answerEls = [];
  const wrongEls = [];
  const okTexts = new Set();
  const badTexts = new Set();
  built.forEach((text, i) => {
    const slot = document.querySelector(
      `#numbers-slots [data-index="${i}"]`
    );
    if (!slot) return;
    const good =
      evaluation.slotMatch != null
        ? evaluation.slotMatch[i]
        : text === parts[i];
    slot.classList.remove(
      "is-bad",
      "is-ok",
      "is-correct-flash",
      "is-wrong-flash"
    );
    slot.classList.add("is-filled");
    slot.textContent = text;
    if (good) {
      answerEls.push(slot);
      okTexts.add(text);
    } else {
      wrongEls.push(slot);
      badTexts.add(text);
    }
  });
  document.querySelectorAll("#numbers-tray .piece").forEach((p) => {
    p.disabled = true;
    p.classList.remove(
      "is-ok",
      "is-bad",
      "is-correct-flash",
      "is-wrong-flash"
    );
    const t = p.dataset.text;
    // Wrong placement wins if the same chip text appears in both.
    if (badTexts.has(t)) p.classList.add("is-bad");
    else if (okTexts.has(t)) p.classList.add("is-ok");
  });

  const word =
    meta?.kind === "weekday" || meta?.kind === "month"
      ? exercise.resolution.form || meta.form
      : evaluation.canonicalAnswers[0] ||
        exercise.resolution.form ||
        parts.join("");
  const answerParts =
    meta.answerParts || parts.map((t) => ({ text: t, guide: t }));
  const en =
    meta?.kind === "weekday" || meta?.kind === "month"
      ? meta.english || meta.englishWritten || ""
      : meta.english || "";

  logGuidedQa({
    question: currentGuidedQuestionCue(),
    answer: built.join("") || built.join(" "),
    expected: word,
    status: accepted ? "correct" : "incorrect",
  });

  presentCorrectAnswer({
    prefix: "numbers",
    answerEls,
    wrongEls,
    reveal: {
      word,
      parts: answerParts,
      en,
      ok: accepted,
    },
    then: (nodes) => {
      playAnswerKeyThenAdvance(word, answerParts, nodes, scheduleNumbersAdvance);
    },
  });
}

/* —— Nouns —— */

function genderClass(g) {
  if (g === "masculine") return "g-masc";
  if (g === "feminine") return "g-fem";
  return "g-neut";
}

/**
 * Gender channel class for tray/slot chips.
 * Articles only — plural endings stay plain so they don’t clash with die (always F).
 */
function chipGenderClass(text) {
  if (text === "der") return "g-masc";
  if (text === "die") return "g-fem";
  if (text === "das") return "g-neut";
  return "";
}

function applyChipGender(el, text, enabled) {
  el.classList.remove("g-masc", "g-fem", "g-neut");
  if (!enabled) return;
  const g = chipGenderClass(text);
  if (g) el.classList.add(g);
}

/** Lemma HTML for articles slot — Assisted: Zeit-ung (suffix gender color); Core: plain. */
function nounLemmaHtml(exercise) {
  const p = exercise.prompt;
  const markSuffix = !!(p.highlightSuffix && p.ending);
  if (markSuffix) {
    const tint = p.genderClass
      ? articleColorClass(null, p.genderClass)
      : "";
    return `<span class="noun-lemma"><span class="noun-stem">${p.stem}</span>-<span class="noun-suffix${tint ? ` ${tint}` : ""}">${p.ending}</span></span>`;
  }
  return `<span class="noun-lemma">${p.lemma}</span>`;
}

function paintNounArticleLemma(exercise) {
  const lemmaHtml = nounLemmaHtml(exercise);
  // No separate prompt question / duplicate lemma — noun lives in the slot only.
  const prompt = document.getElementById("nouns-prompt");
  if (prompt) {
    prompt.hidden = true;
    prompt.innerHTML = "";
  }
  const nounSlot = document.getElementById("nouns-noun-slot");
  if (nounSlot) {
    nounSlot.innerHTML = lemmaHtml;
  }
}

function renderNouns() {
  clearNounsAdvance();
  stopSpeech();
  clearAnswerReveal("nouns");
  setActionInstruction("nouns", NOUNS_INSTRUCTION[state.nounsMode] || "");
  clearExerciseFeedback("nouns");

  syncTerritoryMenu("nouns");
  refreshPlaylistChrome();

  const help = document.getElementById("nouns-help-line");
  const translationEl = document.getElementById("nouns-translation");
  if (translationEl) {
    translationEl.hidden = true;
    translationEl.textContent = "";
  }
  if (help) {
    help.hidden = true;
    help.textContent = "";
  }

  if (state.nounsMode === "plurals") {
    const prompt = document.getElementById("nouns-prompt");
    if (prompt) prompt.hidden = false;
    const fam = document.getElementById("nouns-family-progress");
    if (fam) {
      fam.hidden = true;
      fam.textContent = "";
    }
    renderNounsPlurals();
    return;
  }

  if (isNounCategoryMode()) {
    renderNounsCategory();
    return;
  }

  if (isNounDiscriminateMode()) {
    renderNounsDiscriminate();
    return;
  }

  if (state.nounsMode === "association") {
    renderNounsAssociation();
    return;
  }

  if (state.nounsMode === "wugs") {
    renderNounsWugs();
    return;
  }

  renderNounsArticles();
}

function applyNounScaffoldingChrome(exercise) {
  const sc = exercise.scaffolding;
  // The "Nominative singular · der die das" key is color-coded, which telegraphs
  // the gender answer — keep it hidden during drills.
  const legend = document.getElementById("nouns-legend");
  if (legend) legend.hidden = true;
  const helpBtn = document.getElementById("nouns-help");
  if (helpBtn) helpBtn.hidden = !(sc.showHintButton || sc.showReferenceButton);

  const help = document.getElementById("nouns-help-line");
  if (help) {
    help.hidden = true;
    help.textContent = "";
  }

  const translationEl = document.getElementById("nouns-translation");
  if (translationEl) {
    translationEl.hidden = true;
    translationEl.textContent = "";
  }
}

/** Shared Real Words / Association / Wugs tray + slots. */
function renderNounArticleLike(exercise, { familyLine = "" } = {}) {
  state.currentExercise = exercise;
  state.nounsArticle = null;
  state.nounsFilled = [];
  state.nounsChecked = false;

  applyNounScaffoldingChrome(exercise);
  paintNounArticleLemma(exercise);

  const fam = document.getElementById("nouns-family-progress");
  if (fam) {
    if (familyLine) {
      fam.hidden = false;
      fam.textContent = familyLine;
    } else {
      fam.hidden = true;
      fam.textContent = "";
    }
  }

  const back = document.getElementById("nouns-back");
  if (back) {
    back.disabled =
      state.nounsMode === "real-words" || state.nounsMode === "articles"
        ? state.nounsIndex <= 0
        : state.nounsMode === "association"
          ? state.nounsAssociationIndex <= 0
          : state.nounsWugIndex <= 0;
  }

  const slotsRow = document.getElementById("nouns-slots");
  slotsRow.hidden = false;
  slotsRow.innerHTML = "";
  const articleSlot = document.createElement("div");
  articleSlot.className = "slot";
  articleSlot.dataset.slot = "article";
  articleSlot.dataset.accept = "article";
  articleSlot.tabIndex = 0;
  articleSlot.textContent = "Article";
  slotsRow.appendChild(articleSlot);

  const nounSlot = document.createElement("div");
  nounSlot.className = "slot is-filled noun-unit";
  nounSlot.id = "nouns-noun-slot";
  nounSlot.setAttribute("aria-live", "polite");
  slotsRow.appendChild(nounSlot);
  paintNounArticleLemma(exercise);

  const tray = document.getElementById("nouns-tray");
  tray.innerHTML = "";
  // Keep der / die / das in fixed pedagogical order; shuffle only extras (?).
  const choiceMeta = [
    { id: "der", text: "der", gender: "masculine" },
    { id: "die", text: "die", gender: "feminine" },
    { id: "das", text: "das", gender: "neuter" },
  ];
  const extras = [];
  if (exercise.materials.allowInsufficient) {
    extras.push({ id: "insufficient", text: "?", gender: null });
  }
  const colorChoices = exercise.scaffolding.showChoiceGenderColors;
  [...choiceMeta, ...shuffle(extras)].forEach((a) => {
    const piece = document.createElement("button");
    piece.type = "button";
    piece.className = "piece";
    if (a.id === "insufficient") {
      // First-class primary choice, not a fallback glyph.
      piece.classList.add("piece-nei");
      piece.innerHTML = `<span class="piece-nei-mark" aria-hidden="true">?</span><span>Not enough info</span>`;
      piece.title = "Not enough info — no reliable gender cue";
      piece.setAttribute("aria-label", "Not enough info");
      piece.dataset.text = "insufficient";
    } else {
      applyChipGender(piece, a.text, colorChoices);
      piece.textContent = a.text;
      piece.setAttribute("aria-label", `${a.text}, ${a.gender}`);
      piece.dataset.text = a.text;
    }
    piece.dataset.id = a.id;
    piece.addEventListener("click", () => {
      if (piece.disabled) return;
      placeArticle(a.id);
    });
    tray.appendChild(piece);
  });
}

function renderNounsArticles() {
  const fam = document.getElementById("nouns-family-progress");
  if (fam) {
    fam.hidden = true;
    fam.textContent = "";
  }
  renderNounArticleLike(currentNounArticleExercise());
}

function renderNounsAssociation() {
  const exercise = currentNounAssociationExercise();
  const suffix = exercise.materials.familySuffix || "family";
  renderNounArticleLike(exercise, {
    familyLine: familyProgressText(exercise.materials.patternId, suffix),
  });
}

function renderNounsWugs() {
  // No legend / “Wug · apply …” chrome — just the nonce + article choices.
  renderNounArticleLike(currentNounWugExercise(), { familyLine: "" });
}

/** Categories — Gender Recognition / Article / Imposter / Sentence Validation. */
function currentNounCategoryExercise() {
  switch (state.nounsMode) {
    case "article-application":
      return currentNounCategoryArticleApplicationExercise();
    case "gender-imposter":
      return currentNounCategoryGenderImposterExercise();
    case "sentence-validation":
      return currentNounCategorySentenceValidationExercise();
    default:
      return currentNounCategoryGenderRecognitionExercise();
  }
}

function categoryModeIndexKey() {
  switch (state.nounsMode) {
    case "article-application":
      return "nounsCategoryArticleApplicationIndex";
    case "gender-imposter":
      return "nounsCategoryGenderImposterIndex";
    case "sentence-validation":
      return "nounsCategorySentenceValidationIndex";
    default:
      return "nounsCategoryGenderRecognitionIndex";
  }
}

function categoryModeDeckKind() {
  switch (state.nounsMode) {
    case "article-application":
      return "CategoryArticleApplication";
    case "gender-imposter":
      return "CategoryGenderImposter";
    case "sentence-validation":
      return "CategorySentenceValidation";
    default:
      return "CategoryGenderRecognition";
  }
}

function categoryModeLabel() {
  switch (state.nounsMode) {
    case "article-application":
      return "Article Application";
    case "gender-imposter":
      return "Gender Imposter";
    case "sentence-validation":
      return "Sentence Validation";
    default:
      return "Gender Recognition";
  }
}

function renderNounsCategory() {
  const exercise = currentNounCategoryExercise();
  state.currentExercise = exercise;
  state.nounsArticle = null;
  state.nounsChecked = false;
  state.nounsFilled = [];
  state.nounsCategoryRetryUsed = false;

  const legend = document.getElementById("nouns-legend");
  if (legend) legend.hidden = true;
  const helpBtn = document.getElementById("nouns-help");
  if (helpBtn) helpBtn.hidden = false;

  const help = document.getElementById("nouns-help-line");
  if (help) {
    help.hidden = true;
    help.textContent = "";
  }
  const translationEl = document.getElementById("nouns-translation");
  if (translationEl) {
    translationEl.hidden = true;
    translationEl.textContent = "";
  }

  const fam = document.getElementById("nouns-family-progress");
  if (fam) {
    fam.hidden = true;
    fam.textContent = "";
  }

  const prompt = document.getElementById("nouns-prompt");
  if (prompt) {
    prompt.hidden = false;
    if (state.nounsMode === "gender-recognition") {
      prompt.textContent = "";
      prompt.hidden = true;
    } else if (state.nounsMode === "article-application") {
      prompt.hidden = true;
      prompt.textContent = "";
    } else if (state.nounsMode === "sentence-validation") {
      prompt.textContent = exercise.prompt.text;
    } else {
      prompt.textContent = exercise.prompt.text;
    }
  }

  clearAnswerReveal("nouns");
  const feedback = document.getElementById("nouns-attempt-feedback");
  if (feedback) {
    feedback.hidden = true;
    feedback.textContent = "";
  }

  const slotsRow = document.getElementById("nouns-slots");
  slotsRow.hidden = false;
  slotsRow.innerHTML = "";
  const status = document.createElement("div");
  status.className = "slot is-filled noun-unit";
  status.id = "nouns-noun-slot";
  status.setAttribute("aria-live", "polite");
  if (state.nounsMode === "gender-recognition") {
    status.textContent = exercise.prompt.categoryName;
  } else if (state.nounsMode === "article-application") {
    status.textContent = exercise.prompt.text;
  } else if (state.nounsMode === "sentence-validation") {
    status.textContent = exercise.prompt.sentence;
  } else {
    status.textContent = "Pick the gender imposter";
  }
  slotsRow.appendChild(status);

  const back = document.getElementById("nouns-back");
  if (back) {
    back.disabled = state[categoryModeIndexKey()] <= 0;
  }

  const tray = document.getElementById("nouns-tray");
  tray.innerHTML = "";
  const labels = exercise.materials.choiceLabels || {};
  for (const id of exercise.materials.choices) {
    const piece = document.createElement("button");
    piece.type = "button";
    piece.className = "piece";
    piece.textContent = labels[id] || id;
    piece.dataset.id = id;
    piece.dataset.text = id;
    piece.setAttribute("aria-label", labels[id] || id);
    piece.addEventListener("click", () => {
      if (piece.disabled || state.nounsChecked) return;
      placeCategoryAssociation(id);
    });
    tray.appendChild(piece);
  }
}

function placeCategoryAssociation(id) {
  if (state.nounsChecked || !isNounCategoryMode()) return;
  state.nounsArticle = id;
  document.querySelectorAll("#nouns-tray .piece").forEach((p) => {
    p.classList.toggle("is-placed", p.dataset.id === id);
  });
  checkNounsCategory();
}

/** Suffixes Proofread / Reverse — Richtig-Falsch or article→lemma MC. */
function currentNounDiscriminateItem() {
  const kind = state.nounsMode === "reverse-mc" ? "Reverse" : "Proofread";
  const deck = ensureNounDeck(kind);
  const indexKey =
    state.nounsMode === "reverse-mc" ? "nounsReverseIndex" : "nounsProofreadIndex";
  const item = deck[state[indexKey] % Math.max(1, deck.length)];
  return item;
}

function renderNounsDiscriminate() {
  const item = currentNounDiscriminateItem();
  const article = ARTICLES[item.gender] || "die";
  const candidates = nounAssociationPool.map((x) => ({
    lemma: x.lemma,
    article: ARTICLES[x.gender] || "die",
  }));

  let promptText;
  let choices;
  let expected;
  const answerParts =
    NOUN_SINGULAR_PARTS[item.lemma] || fallbackSingularParts(item.lemma);
  if (state.nounsMode === "proofread") {
    const pack = makeNounProofreadChoices(article, item.lemma);
    promptText = pack.statement;
    choices = pack.options;
    expected = pack.answer;
    const gloss = LEXICON[item.lemma]?.gloss || item.translation || "";
    state.currentExercise = {
      materials: { hint: `True article is ${pack.correctArticle}.`, answerParts },
      resolution: {
        expected,
        feedbackOk: pack.isCorrect
          ? "Richtig — that article matches."
          : `Falsch spotted — true article is ${pack.correctArticle}.`,
        feedbackBad: `True article is ${pack.correctArticle}.`,
        form: `${pack.correctArticle} ${item.lemma}`,
        lemma: item.lemma,
        article: pack.correctArticle,
        gender: item.gender,
        answerParts,
        translation: gloss,
        statement: pack.statement,
        gloss,
      },
    };
  } else {
    const pack = makeNounReverseChoices(item.lemma, article, candidates);
    promptText = pack.promptArticle;
    choices = pack.options;
    expected = pack.answer;
    state.currentExercise = {
      materials: {
        hint: `Look for a ${article}-gender suffix cue.`,
        answerParts,
        choices: [...choices],
      },
      resolution: {
        expected,
        feedbackOk: `Yes — ${article} ${item.lemma}.`,
        feedbackBad: `Target was ${article} ${item.lemma}.`,
        form: `${article} ${item.lemma}`,
        lemma: item.lemma,
        article,
        gender: item.gender,
        answerParts,
        translation: LEXICON[item.lemma]?.gloss || item.translation || "",
      },
    };
  }

  state.nounsArticle = null;
  state.nounsChecked = false;
  state.nounsFilled = [];
  state.nounsDiscriminateRetryUsed = false;

  const legend = document.getElementById("nouns-legend");
  if (legend) legend.hidden = true;
  const helpBtn = document.getElementById("nouns-help");
  if (helpBtn) helpBtn.hidden = false;

  const help = document.getElementById("nouns-help-line");
  if (help) {
    help.hidden = true;
    help.textContent = "";
  }
  const translationEl = document.getElementById("nouns-translation");
  if (translationEl) {
    translationEl.hidden = true;
    translationEl.textContent = "";
  }

  const fam = document.getElementById("nouns-family-progress");
  if (fam) {
    fam.hidden = false;
    fam.textContent =
      state.nounsMode === "proofread" ? "Proofread" : "Reverse match";
  }

  const prompt = document.getElementById("nouns-prompt");
  const slotsRow = document.getElementById("nouns-slots");
  if (state.nounsMode === "proofread") {
    const gloss =
      state.currentExercise.resolution.gloss ||
      LEXICON[item.lemma]?.gloss ||
      "";
    if (prompt) {
      prompt.hidden = false;
      prompt.innerHTML = `
        <div class="proofread-bilingual">
          ${gloss ? promptEnHtml(`(${gloss})`) : ""}
          ${promptDeHtml(promptText)}
        </div>
      `;
    }
    if (slotsRow) {
      slotsRow.innerHTML = "";
      slotsRow.hidden = true;
    }
  } else {
    if (prompt) {
      prompt.hidden = true;
      prompt.textContent = "";
    }
    if (slotsRow) slotsRow.hidden = false;
    slotsRow.innerHTML = "";
    const status = document.createElement("div");
    status.className = "slot is-filled noun-unit";
    status.id = "nouns-noun-slot";
    status.setAttribute("aria-live", "polite");
    status.textContent = promptText;
    slotsRow.appendChild(status);
    if (translationEl) {
      translationEl.hidden = false;
      translationEl.textContent = "Which noun takes this article?";
    }
  }

  clearAnswerReveal("nouns");
  const feedback = document.getElementById("nouns-attempt-feedback");
  if (feedback) {
    feedback.hidden = true;
    feedback.textContent = "";
  }

  const back = document.getElementById("nouns-back");
  if (back) {
    back.disabled =
      state.nounsMode === "reverse-mc"
        ? state.nounsReverseIndex <= 0
        : state.nounsProofreadIndex <= 0;
  }

  const tray = document.getElementById("nouns-tray");
  tray.innerHTML = "";
  for (const choice of choices) {
    const piece = document.createElement("button");
    piece.type = "button";
    piece.className = "piece";
    piece.textContent = choice;
    piece.dataset.id = choice;
    piece.dataset.text = choice;
    piece.setAttribute("aria-label", choice);
    piece.addEventListener("click", () => {
      if (piece.disabled || state.nounsChecked) return;
      placeNounDiscriminate(choice);
    });
    tray.appendChild(piece);
  }
}

function placeNounDiscriminate(id) {
  if (state.nounsChecked || !isNounDiscriminateMode()) return;
  state.nounsArticle = id;
  document.querySelectorAll("#nouns-tray .piece").forEach((p) => {
    p.classList.toggle("is-placed", p.dataset.id === id);
  });
  checkNounsDiscriminate();
}

function checkNounsDiscriminate() {
  if (state.nounsChecked || !state.nounsArticle || !isNounDiscriminateMode())
    return;
  const exercise = state.currentExercise;
  if (!exercise) return;
  const expected = exercise.resolution.expected;
  const accepted = state.nounsArticle === expected;
  state.nounsChecked = true;

  const chosen = document.querySelector(
    `#nouns-tray [data-id="${CSS.escape(state.nounsArticle)}"]`
  );
  document.querySelectorAll("#nouns-tray .piece").forEach((p) => {
    p.disabled = true;
  });

  const feedback = document.getElementById("nouns-attempt-feedback");
  if (accepted) {
    if (chosen) chosen.classList.add("is-ok");
    playFeedbackSound("ok");
    revealNounDiscriminate(exercise, true);
  } else {
    if (chosen) {
      chosen.classList.add("is-bad");
      chosen.classList.remove("is-placed");
    }
    playFeedbackSound("bad");
    // One retry then answer key + advance.
    if (!state.nounsDiscriminateRetryUsed) {
      state.nounsDiscriminateRetryUsed = true;
      state.nounsChecked = false;
      state.nounsArticle = null;
      if (feedback) {
        feedback.hidden = false;
        feedback.className = "attempt-feedback is-bad";
        feedback.textContent = "Try again";
      }
      window.setTimeout(() => {
        document.querySelectorAll("#nouns-tray .piece").forEach((p) => {
          if (!p.classList.contains("is-bad")) p.disabled = false;
        });
      }, 400);
      return;
    }
    const correct = document.querySelector(
      `#nouns-tray [data-id="${CSS.escape(expected)}"]`
    );
    if (correct) correct.classList.add("is-ok");
    revealNounDiscriminate(exercise, false);
  }
}

/** Answer key for Proofread / Reverse: article + lemma with phonetics + TTS. */
function revealNounDiscriminate(exercise, ok) {
  const res = exercise.resolution || {};
  const lemma = res.lemma || "";
  const article = res.article || "";
  const phrase = article ? `${article} ${lemma}` : res.form || lemma;
  logGuidedQa({
    question:
      state.nounsMode === "proofread"
        ? exercise.resolution?.form
          ? // Statement judged — use the on-screen statement if we still have it.
            document.getElementById("nouns-noun-slot")?.textContent ||
            res.form ||
            lemma
          : lemma
        : article || "—",
    answer: ok
      ? state.nounsArticle || phrase
      : state.nounsArticle || "—",
    expected: state.nounsMode === "proofread" ? res.expected : lemma,
    status: ok ? "correct" : "incorrect",
  });
  const parts =
    res.answerParts ||
    exercise.materials?.answerParts || [{ text: lemma, guide: lemma }];
  const wordHtml = nounAnswerWordHtml(article, lemma, res.gender);
  const nodes = fillAnswerReveal("nouns", {
    word: phrase,
    wordHtml,
    parts,
    en: res.translation || "",
    ok,
    verdictLabel: ok ? "Correct" : "Answer",
  });
  playAnswerKeyThenAdvance(phrase, parts, nodes, scheduleNounsAdvance);
}

function checkNounsCategory() {
  if (state.nounsChecked || !state.nounsArticle) return;
  const exercise = state.currentExercise;
  if (!exercise) return;
  const expected = exercise.resolution.expected;
  const accepted = state.nounsArticle === expected;
  state.nounsChecked = true;

  const chosen = document.querySelector(
    `#nouns-tray [data-id="${CSS.escape(state.nounsArticle)}"]`
  );
  document.querySelectorAll("#nouns-tray .piece").forEach((p) => {
    p.disabled = true;
  });

  const feedback = document.getElementById("nouns-attempt-feedback");
  if (accepted) {
    if (chosen) chosen.classList.add("is-ok");
    playFeedbackSound("ok");
    revealNounCategory(exercise, true);
  } else {
    if (chosen) {
      chosen.classList.add("is-bad");
      chosen.classList.remove("is-placed");
    }
    playFeedbackSound("bad");
    // One retry, then answer key — same policy as other quizzes.
    if (!state.nounsCategoryRetryUsed) {
      state.nounsCategoryRetryUsed = true;
      state.nounsChecked = false;
      state.nounsArticle = null;
      if (feedback) {
        feedback.hidden = false;
        feedback.className = "attempt-feedback is-bad";
        feedback.textContent = "Try again";
      }
      window.setTimeout(() => {
        document.querySelectorAll("#nouns-tray .piece").forEach((p) => {
          if (!p.classList.contains("is-bad")) p.disabled = false;
        });
      }, 400);
      return;
    }
    const correct = document.querySelector(
      `#nouns-tray [data-id="${CSS.escape(expected)}"]`
    );
    if (correct) correct.classList.add("is-ok");
    revealNounCategory(exercise, false);
  }
}

/** Answer key for Category modes — matches Numbers/Proofread reveal shape. */
function revealNounCategory(exercise, ok) {
  const res = exercise.resolution || {};
  const labels = exercise.materials?.choiceLabels || {};
  let word = "";
  let en = res.categoryName || "";
  let parts = [];

  if (state.nounsMode === "article-application") {
    const art = res.expected;
    const lemma = res.lemma || "";
    const filled = String(exercise.prompt?.text || "")
      .replace("___", art)
      .replace(/\s+/g, " ")
      .trim();
    word = filled || `${art} ${lemma}`.trim();
    parts =
      NOUN_SINGULAR_PARTS[lemma] ||
      (lemma ? fallbackSingularParts(lemma) : [{ text: art, guide: art }]);
    const slot = document.getElementById("nouns-noun-slot");
    if (slot) slot.textContent = word;
    en = LEXICON[lemma]?.gloss || en;
  } else if (state.nounsMode === "sentence-validation") {
    word = exercise.prompt?.sentence || "";
    const verdict = labels[res.expected] || res.expected;
    en = `${verdict}${en ? ` · ${en}` : ""}`;
    parts = word
      ? word.split(/\s+/).map((t) => ({ text: t, guide: t }))
      : [];
  } else if (state.nounsMode === "gender-imposter") {
    word = res.expected || "";
    en = res.feedbackOk || res.feedbackBad || `Imposter · ${en}`;
    if (!ok && res.feedbackBad) en = res.feedbackBad;
    if (ok && res.feedbackOk) en = res.feedbackOk;
    parts = word ? [{ text: word, guide: word }] : [];
  } else {
    // gender-recognition
    word = labels[res.expected] || res.expected || "";
    parts = word ? [{ text: word, guide: word }] : [];
  }

  logGuidedQa({
    question: currentGuidedQuestionCue(),
    answer: state.nounsArticle || "—",
    expected: res.expected,
    status: ok ? "correct" : "incorrect",
  });

  const nodes = fillAnswerReveal("nouns", {
    word,
    parts,
    en,
    ok,
    verdictLabel: ok ? "Correct" : "Answer",
  });
  const tts =
    state.nounsMode === "article-application"
      ? `${res.expected || ""} ${res.lemma || ""}`.trim()
      : word;
  if (!tts || state.nounsMode === "gender-recognition") {
    scheduleNounsAdvance(NO_TTS_REVEAL_ADVANCE_MS);
    return;
  }
  playAnswerKeyThenAdvance(tts, parts, nodes, scheduleNounsAdvance);
}

function renderNounsPlurals() {
  const exercise = currentNounPluralExercise();
  state.currentExercise = exercise;
  const fullParts = exercise.materials.parts;
  // Article is given chrome — learner only builds stem + ending.
  const buildParts = fullParts.slice(1);
  const item = {
    lemma: exercise.target.lemma,
    parts: fullParts,
    buildParts,
    distractors: exercise.materials.distractors,
    form: exercise.materials.form,
    hint: exercise.materials.hint,
    translation: exercise.resolution.translation,
    answerParts: exercise.materials.answerParts,
  };
  state.nounsFilled = Array(buildParts.length).fill(null);
  state.nounsArticle = null;
  state.nounsChecked = false;
  state.nounsPluralRetryUsed = false;

  applyNounScaffoldingChrome(exercise);
  const legend = document.getElementById("nouns-legend");
  if (legend) legend.hidden = true;

  document.getElementById("nouns-prompt").innerHTML = `
    Plural of
    <strong>${item.lemma}</strong>
  `;

  const back = document.getElementById("nouns-back");
  if (back) back.disabled = state.nounsPluralIndex <= 0;

  const slots = document.getElementById("nouns-slots");
  slots.hidden = false;
  slots.innerHTML = "";

  const given = document.createElement("span");
  given.className = "slot-given";
  given.textContent = "die";
  given.title = "Nominative plural article — always die (number, not gender)";
  given.setAttribute("aria-label", "die, given");
  slots.appendChild(given);

  buildParts.forEach((_, i) => {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.dataset.index = String(i);
    slot.tabIndex = 0;
    slot.textContent = i === buildParts.length - 1 ? "Ending" : "Stem";
    slot.addEventListener("click", () => {
      if (state.nounsChecked) return;
      if (state.nounsFilled[i]) clearNounPluralSlot(i);
    });
    slot.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        slot.click();
      }
    });
    slots.appendChild(slot);
  });

  const tray = document.getElementById("nouns-tray");
  tray.innerHTML = "";
  orderPluralTrayLabels(buildParts, item.distractors).forEach((text, i) => {
    const piece = document.createElement("button");
    piece.type = "button";
    piece.className = "piece";
    applyChipGender(piece, text, false);
    piece.dataset.id = `np${i}`;
    piece.dataset.text = text;
    piece.textContent = text;
    if (text === "—") {
      piece.title = "No ending (plural same as singular)";
      piece.setAttribute("aria-label", "No ending — plural same as singular");
    }
    piece.addEventListener("click", () => {
      if (state.nounsChecked) return;
      const next = state.nounsFilled.findIndex((x) => !x);
      if (next >= 0) placeNounPluralText(text, next);
    });
    tray.appendChild(piece);
  });
}

/** Tray labels shuffled each question (stems + endings mixed). Always include —. */
function orderPluralTrayLabels(buildParts, distractors) {
  const articles = new Set(["der", "die", "das"]);
  const pool = new Set([...(buildParts || []), ...(distractors || []), "—"]);
  const labels = [...pool].filter((t) => !articles.has(t));
  if (!labels.includes("—")) labels.push("—");
  return shuffle(labels);
}

function placeArticle(id) {
  if (state.nounsChecked || !isNounArticleLikeMode()) return;
  const piece = document.querySelector(`#nouns-tray [data-id="${id}"]`);
  if (!piece || piece.disabled) return;

  document.querySelectorAll("#nouns-tray .piece").forEach((p) => {
    if (!p.disabled) p.classList.remove("is-placed");
  });

  state.nounsArticle = id === "insufficient" ? "insufficient" : id;
  piece.classList.add("is-placed");

  const slot = document.querySelector('#nouns-slots [data-slot="article"]');
  slot.classList.add("is-filled");
  const slotText = id === "insufficient" ? "?" : piece.dataset.text;
  applyChipGender(
    slot,
    id === "insufficient" ? "" : piece.dataset.text,
    !!state.currentExercise?.scaffolding?.showChoiceGenderColors &&
      id !== "insufficient"
  );
  slot.textContent = slotText;
  clearSelection();
  checkNounsArticles();
}

function placeNounPluralText(text, slotIndex) {
  if (state.nounsChecked) return;
  if (slotIndex < 0 || slotIndex >= state.nounsFilled.length) return;

  state.nounsFilled[slotIndex] = text;
  const slot = document.querySelector(
    `#nouns-slots [data-index="${slotIndex}"]`
  );
  if (slot) {
    slot.classList.add("is-filled");
    slot.classList.remove("is-ok", "is-bad");
    applyChipGender(slot, text, false);
    slot.textContent = text;
    slot.setAttribute("aria-label", `${text}, tap to remove`);
  }
  clearSelection();
  if (state.nounsFilled.every(Boolean)) checkNounsPlurals();
}

function clearNounPluralSlot(slotIndex) {
  if (state.nounsChecked) return;
  if (!state.nounsFilled[slotIndex]) return;
  state.nounsFilled[slotIndex] = null;
  const n = state.nounsFilled.length;
  const slot = document.querySelector(
    `#nouns-slots [data-index="${slotIndex}"]`
  );
  if (slot) {
    slot.classList.remove("is-filled", "is-ok", "is-bad", "g-masc", "g-fem", "g-neut");
    slot.textContent = slotIndex === n - 1 ? "Ending" : "Stem";
    slot.removeAttribute("aria-label");
  }
  clearSelection();
}

function clearNouns() {
  if (state.nounsChecked) return;
  if (state.nounsMode === "plurals") {
    const n = state.nounsFilled.length;
    state.nounsFilled = Array(n).fill(null);
    document.querySelectorAll("#nouns-slots .slot").forEach((s, i) => {
      s.classList.remove("is-filled", "is-ok", "is-bad", "g-masc", "g-fem", "g-neut");
      s.textContent = i === n - 1 ? "Ending" : "Stem";
      s.removeAttribute("aria-label");
    });
    clearSelection();
    return;
  }

  state.nounsArticle = null;
  document.querySelectorAll("#nouns-tray .piece").forEach((p) => {
    if (!p.disabled) p.classList.remove("is-placed");
  });
  const slot = document.querySelector('#nouns-slots [data-slot="article"]');
  if (slot) {
    slot.classList.remove("is-filled", "g-masc", "g-fem", "g-neut");
    slot.textContent = "Article";
  }
  clearSelection();
}

function clearNounsAdvance() {
  if (state.nounsAdvanceTimer) {
    clearTimeout(state.nounsAdvanceTimer);
    state.nounsAdvanceTimer = null;
  }
  clearCorrectFlashTimer();
}

function advanceNounsIndex() {
  if (
    state.nounsSessionKind === "family-mix" &&
    state.nounsFamilyMix.length > 1
  ) {
    const mix = state.nounsFamilyMix;
    state.nounsMode = mix[Math.floor(Math.random() * mix.length)] || state.nounsMode;
  }
  const kind = isNounCategoryMode()
    ? categoryModeDeckKind()
    : state.nounsMode === "plurals"
      ? "Plural"
      : state.nounsMode === "association"
        ? "Association"
        : state.nounsMode === "wugs"
          ? "Wug"
          : state.nounsMode === "proofread"
            ? "Proofread"
            : state.nounsMode === "reverse-mc"
              ? "Reverse"
              : "Article";
  const deck = ensureNounDeck(kind);
  const indexKey = isNounCategoryMode()
    ? categoryModeIndexKey()
    : kind === "Plural"
      ? "nounsPluralIndex"
      : kind === "Association"
        ? "nounsAssociationIndex"
        : kind === "Wug"
          ? "nounsWugIndex"
          : kind === "Proofread"
            ? "nounsProofreadIndex"
            : kind === "Reverse"
              ? "nounsReverseIndex"
              : "nounsIndex";
  state[indexKey] += 1;
  if (state[indexKey] >= deck.length) {
    reshuffleNounDeck(kind);
    state[indexKey] = 0;
  }
}

function resetNounsDeckForMode() {
  const kind = isNounCategoryMode()
    ? categoryModeDeckKind()
    : state.nounsMode === "plurals"
      ? "Plural"
      : state.nounsMode === "association"
        ? "Association"
        : state.nounsMode === "wugs"
          ? "Wug"
          : state.nounsMode === "proofread"
            ? "Proofread"
            : state.nounsMode === "reverse-mc"
              ? "Reverse"
              : "Article";
  reshuffleNounDeck(kind);
  if (isNounCategoryMode()) state[categoryModeIndexKey()] = 0;
  else if (kind === "Plural") state.nounsPluralIndex = 0;
  else if (kind === "Association") state.nounsAssociationIndex = 0;
  else if (kind === "Wug") state.nounsWugIndex = 0;
  else if (kind === "Proofread") state.nounsProofreadIndex = 0;
  else if (kind === "Reverse") state.nounsReverseIndex = 0;
  else state.nounsIndex = 0;
}

function scheduleNounsAdvance(delayMs = 1500) {
  clearNounsAdvance();
  state.nounsAdvanceTimer = setTimeout(() => {
    state.nounsAdvanceTimer = null;
    deferHeavy(() => {
      if (continueGuided()) return;
      advanceNounsIndex();
      if (continueCrossTerritoryMix("nouns")) return;
      renderNouns();
    });
  }, delayMs);
}

function revealNounAnswer(exercise, ok = true) {
  paintNounArticleLemma(exercise);

  const art = exercise.resolution.article;
  const lemma = exercise.target?.lemma || exercise.prompt?.lemma || "";
  logGuidedQa({
    question: lemma || exercise.prompt?.cue || currentGuidedQuestionCue(),
    answer: state.nounsArticle || art || "—",
    expected: art === "insufficient" ? "insufficient" : art,
    status: ok ? "correct" : "incorrect",
  });

  // Wugs: no TTS for nonce words — show color-coded suffix + short note.
  if (exercise.target?.wug || state.nounsMode === "wugs") {
    const cue = exercise.materials.cue || exercise.prompt.cue;
    const gender = exercise.resolution.gender;
    const note =
      exercise.resolution.note ||
      exercise.materials.patternBlurb ||
      "";
    let wordHtml;
    if (cue) {
      const tint = articleColorClass(null, gender);
      wordHtml = `<span class="answer-wug-cue${tint ? ` ${tint}` : ""}">${cue}</span>`;
    } else {
      wordHtml = `<span class="answer-insufficient">insufficient information</span>`;
    }
    fillAnswerReveal("nouns", {
      word: cue || "insufficient information",
      wordHtml,
      parts: [],
      en: note,
      ok,
      verdictLabel: ok ? "Right call" : "Answer",
    });
    scheduleNounsAdvance(NO_TTS_REVEAL_ADVANCE_MS);
    return;
  }

  const isInsufficient = art === "insufficient";
  const phrase = isInsufficient
    ? "insufficient information"
    : `${art} ${exercise.target.lemma}`;
  const parts = isInsufficient
    ? [{ text: "?", guide: "insufficient" }]
    : exercise.materials.answerParts || [
        { text: exercise.target.lemma, guide: exercise.target.lemma },
      ];
  const assisted = exercise.mode === "assisted";
  const wordHtml = isInsufficient
    ? `<span class="answer-insufficient">insufficient information</span>`
    : nounAnswerWordHtml(art, exercise.target.lemma, exercise.resolution.gender, {
        stem: exercise.prompt.stem,
        ending: exercise.prompt.ending,
        assisted,
      });
  const nodes = fillAnswerReveal("nouns", {
    word: phrase,
    wordHtml,
    parts,
    en: exercise.resolution.translation || "",
    ok,
    verdictLabel: isInsufficient ? "Right call" : ok ? "Correct" : "Answer",
  });
  if (isInsufficient) {
    scheduleNounsAdvance(NO_TTS_REVEAL_ADVANCE_MS);
    return;
  }
  playAnswerKeyThenAdvance(phrase, parts, nodes, scheduleNounsAdvance);
}

function checkNounsArticles() {
  if (state.nounsChecked) return;
  const exercise =
    state.currentExercise ||
    (state.nounsMode === "association"
      ? currentNounAssociationExercise()
      : state.nounsMode === "wugs"
        ? currentNounWugExercise()
        : currentNounArticleExercise());
  if (!state.nounsArticle) return;

  const { evaluation, attempt, accepted, complete } = submitExerciseAttempt(
    exercise,
    { article: state.nounsArticle },
    { appVersion: "mock" }
  );
  state.attemptLog.push(attempt);

  if (state.nounsMode === "association") {
    recordFamilyAttempt(exercise.materials.patternId, accepted);
  }

  const chosen = document.querySelector(
    `#nouns-tray [data-id="${state.nounsArticle}"]`
  );

  if (!accepted) {
    if (chosen) {
      chosen.disabled = true;
      chosen.classList.remove("is-placed");
    }
    state.nounsArticle = null;
    const slot = document.querySelector('#nouns-slots [data-slot="article"]');
    slot.classList.remove("is-filled", "g-masc", "g-fem", "g-neut");
    slot.textContent = "Article";
    if (!complete && exercise.scaffolding.allowRetryWrongChoice) {
      // Actionable nudge instead of a bare red border.
      const cue = exercise.materials.cue || exercise.prompt?.cue;
      showExerciseFeedback(
        "nouns",
        cue
          ? `Not quite — look at the ending <strong>${cue}</strong> for the gender cue.`
          : `Not quite — try another article.`,
        { hint: true }
      );
      return;
    }
  }

  state.nounsChecked = true;
  clearAttemptFeedback("nouns");
  clearExerciseFeedback("nouns");
  const correctId = exercise.resolution.article;
  document.querySelectorAll("#nouns-tray .piece").forEach((p) => {
    p.disabled = true;
  });
  const answerEls = [];
  if (correctId && correctId !== "insufficient") {
    const slot = document.querySelector('#nouns-slots [data-slot="article"]');
    if (slot) {
      slot.textContent = correctId;
      slot.classList.add("is-filled");
      applyChipGender(slot, correctId, true);
      answerEls.push(slot);
    }
  }
  presentCorrectAnswer({
    prefix: "nouns",
    answerEls,
    then: () => revealNounAnswer(exercise, accepted),
  });
}

function checkNounsPlurals() {
  if (state.nounsChecked) return;
  const exercise = state.currentExercise || currentNounPluralExercise();
  if (state.nounsFilled.some((x) => !x)) return;

  const built = state.nounsFilled.slice();
  const partsForEval = ["die", ...built];
  const { evaluation, attempt, accepted } = submitExerciseAttempt(
    exercise,
    { parts: partsForEval },
    { appVersion: "mock" }
  );
  state.attemptLog.push(attempt);

  document.querySelectorAll("#nouns-slots .slot").forEach((slot, i) => {
    const fullIndex = i + 1; // skip given die
    const expected = exercise.materials.parts;
    const good =
      evaluation.slotMatch != null
        ? evaluation.slotMatch[fullIndex]
        : built[i] === expected[fullIndex];
    slot.classList.toggle("is-ok", !!good);
    slot.classList.toggle("is-bad", !good);
  });

  // Wrong: one second chance, then reveal the answer.
  if (
    !accepted &&
    exercise.scaffolding.allowRetryWrongChoice &&
    !state.nounsPluralRetryUsed
  ) {
    state.nounsPluralRetryUsed = true;
    showAttemptFeedback("nouns", "Try again — rebuild the plural");
    window.setTimeout(() => {
      if (state.nounsChecked) return;
      clearNouns();
      showAttemptFeedback("nouns", "Try again — rebuild the plural", {
        sound: false,
      });
    }, 650);
    return;
  }

  state.nounsChecked = true;
  clearAttemptFeedback("nouns");

  const expected = exercise.materials.parts;
  const answerEls = [];
  document.querySelectorAll("#nouns-slots .slot").forEach((slot, i) => {
    const text = expected[i + 1];
    if (!text) return;
    slot.classList.remove("is-bad", "is-ok");
    slot.classList.add("is-filled");
    slot.textContent = text;
    answerEls.push(slot);
  });
  document.querySelectorAll("#nouns-tray .piece").forEach((p) => {
    p.disabled = true;
  });

  const phrase =
    evaluation.canonicalAnswers[0] ||
    `die ${joinNounPluralParts(exercise.materials.parts.slice(1))}`;
  const pluralForm =
    exercise.resolution.form ||
    joinNounPluralParts(exercise.materials.parts.slice(1));
  const parts = exercise.materials.answerParts || [
    { text: "die", guide: "dee" },
    { text: pluralForm, guide: pluralForm },
  ];
  const construction =
    exercise.resolution.parts || exercise.materials.parts;

  logGuidedQa({
    question: exercise.target?.lemma || currentGuidedQuestionCue(),
    answer: phrase,
    expected: phrase,
    status: accepted ? "correct" : "incorrect",
  });

  presentCorrectAnswer({
    prefix: "nouns",
    answerEls,
    reveal: {
      word: phrase,
      wordHtml: nounPluralAnswerWordHtml(construction),
      parts,
      en: exercise.resolution.translation || "",
      ok: accepted,
    },
    then: (nodes) => {
      playAnswerKeyThenAdvance(phrase, parts, nodes, scheduleNounsAdvance);
    },
  });
}

/* —— Sounds —— */

/** Bumped on cancel so deferred speak() calls from a prior turn are dropped. */
let ttsSpeakGen = 0;
let ttsSpeakTimer = null;

/** iOS/iPadOS Safari clips utterance onsets if speak() follows cancel() too quickly. */
function isAppleTouchTTS() {
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  // iPadOS 13+ can report as Mac; treat touch Macs as Apple mobile TTS.
  return (
    navigator.platform === "MacIntel" &&
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 1
  );
}

function stopSpeech({ keepAdvance = false } = {}) {
  ttsSpeakGen += 1;
  if (ttsSpeakTimer) {
    clearTimeout(ttsSpeakTimer);
    ttsSpeakTimer = null;
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    // Chrome can stick in paused/speaking-true after cancel; resume() can
    // re-clip the next onset on iOS — skip it there.
    if (!isAppleTouchTTS()) {
      try {
        window.speechSynthesis.resume();
      } catch (_) {
        /* ignore */
      }
    }
  }
  if (state.karaokeTimer) {
    clearTimeout(state.karaokeTimer);
    state.karaokeTimer = null;
  }
  (state.karaokeTimers || []).forEach(clearTimeout);
  state.karaokeTimers = [];
  document.querySelectorAll(".syl.is-active").forEach((el) => {
    el.classList.remove("is-active");
  });
  if (!keepAdvance) clearSoundsAdvance();
}

function assignGermanVoice(utterance) {
  const voices = window.speechSynthesis.getVoices();
  const de = voices.filter((v) => v.lang.toLowerCase().startsWith("de"));
  // Prefer non-Microsoft voices when present — MS voices often clip the onset on Chromium.
  const preferred =
    de.find((v) => /google/i.test(v.name)) ||
    de.find((v) => !/microsoft|desktop/i.test(v.name)) ||
    de[0];
  if (preferred) utterance.voice = preferred;
}

function assignEnglishVoice(utterance) {
  const voices = window.speechSynthesis.getVoices();
  const enList = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const en =
    enList.find((v) => /google/i.test(v.name) && /en-us/i.test(v.lang)) ||
    enList.find((v) => /en-us/i.test(v.lang)) ||
    enList.find((v) => /google/i.test(v.name)) ||
    enList[0];
  if (en) utterance.voice = en;
}

/**
 * Queue speak after cancel has fully settled. Desktop needs ~120ms; Apple
 * WebKit often still clips the first phoneme unless we wait for idle + ~300ms.
 */
function scheduleSpeak(speakFn, gen) {
  if (ttsSpeakTimer) clearTimeout(ttsSpeakTimer);

  const apple = isAppleTouchTTS();
  const settleMs = apple ? 300 : 120;
  const started = performance.now();

  const run = () => {
    ttsSpeakTimer = null;
    if (gen !== ttsSpeakGen) return;

    const synth = window.speechSynthesis;
    const busy = synth.speaking || synth.pending;
    // Wait out a lingering cancel on WebKit (cap so we never hang).
    if (busy && performance.now() - started < 600) {
      ttsSpeakTimer = setTimeout(run, 40);
      return;
    }

    const kick = () => {
      if (gen !== ttsSpeakGen) return;
      if (synth.getVoices().length) speakFn();
      else
        synth.addEventListener("voiceschanged", speakFn, {
          once: true,
        });
    };

    ttsSpeakTimer = setTimeout(() => {
      ttsSpeakTimer = null;
      kick();
    }, settleMs);
  };

  // Yield one frame so cancel() can apply before we poll speaking/pending.
  ttsSpeakTimer = setTimeout(run, apple ? 32 : 0);
}

function withUtterance(
  text,
  { rate = 0.9, lang = "de-DE", onStart, onEnd, onError } = {}
) {
  if (!window.speechSynthesis) {
    openSheet(
      "Audio",
      "<p>TTS unavailable on this device — visual reps still work.</p>"
    );
    return null;
  }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = rate;
  if (onStart) u.onstart = onStart;
  if (onEnd) u.onend = onEnd;
  if (onError) u.onerror = onError;

  const gen = ttsSpeakGen;
  const speak = () => {
    if (gen !== ttsSpeakGen) return;
    if (lang.toLowerCase().startsWith("de")) assignGermanVoice(u);
    else assignEnglishVoice(u);
    if (!isAppleTouchTTS()) {
      try {
        window.speechSynthesis.resume();
      } catch (_) {
        /* ignore */
      }
    }
    window.speechSynthesis.speak(u);
  };

  scheduleSpeak(speak, gen);
  return u;
}

function withGermanUtterance(text, opts = {}) {
  return withUtterance(text, { ...opts, lang: "de-DE" });
}

function speakGerman(text, rate = 0.9, onEnd) {
  if (!navCaps().audio) {
    if (typeof onEnd === "function") queueMicrotask(onEnd);
    return;
  }
  stopSpeech({ keepAdvance: true });
  withUtterance(text, { rate, lang: "de-DE", onEnd });
}

function clearSoundsAdvance() {
  if (state.soundsAdvanceTimer) {
    clearTimeout(state.soundsAdvanceTimer);
    state.soundsAdvanceTimer = null;
  }
  clearCorrectFlashTimer();
}

function scheduleSoundsAdvance(delayMs = 1400) {
  clearSoundsAdvance();
  state.soundsAdvanceTimer = setTimeout(() => {
    state.soundsAdvanceTimer = null;
    soundsContinue();
  }, delayMs);
}

/** Estimate utterance length; refine from prior onend measurements when available. */
function estimateUtteranceMs(text, rate) {
  const measured = state.ttsMsPerChar;
  if (measured && measured > 25 && measured < 180) {
    return Math.max(480, measured * text.length);
  }
  // ~11 German graphemes/sec at rate 1 for common browser voices (rough)
  const charsPerSec = 11 * rate;
  return Math.max(520, (text.length / charsPerSec) * 1000 + 140);
}

function setSoundsMode(mode) {
  stopSpeech();
  state.soundsMode = mode;
  state.soundsIndex = 0;
  state.soundsChoice = null;
  syncTerritoryMenu("sounds");
  if (state.phase.sounds === "practice") renderSounds();
}

function setSoundsDifficulty(difficulty) {
  state.soundsDifficulty = difficulty;
  syncTerritoryMenu("sounds");
  if (state.phase.sounds === "practice") renderSounds();
}

function currentSoundsItem() {
  if (state.soundsMode === "karaoke") {
    return soundKaraoke[state.soundsIndex % soundKaraoke.length];
  }
  return soundDiscriminate[state.soundsIndex % soundDiscriminate.length];
}

function openSheet(title, html) {
  const sheet = document.getElementById("app-sheet");
  document.getElementById("sheet-title").textContent = title;
  document.getElementById("sheet-body").innerHTML = html;
  sheet.hidden = false;
  bringOverlayFront(sheet);
  document.getElementById("sheet-close").focus();
}

function closeSheet() {
  const sheet = document.getElementById("app-sheet");
  sheet.hidden = true;
  sheet.style.zIndex = "";
}

/** Hint text for the active Numbers exercise. */
function numbersHelpHint(exercise) {
  return exercise?.materials?.hint || "";
}

/** Hint text for the active Nouns exercise / mode. */
function nounsHelpHint(exercise) {
  if (state.nounsMode === "plurals") {
    return exercise?.materials?.hint || "";
  }
  if (state.nounsMode === "wugs") {
    return exercise?.materials?.hint || "";
  }
  if (isNounDiscriminateMode()) {
    return (
      exercise?.materials?.hint ||
      "Use the suffix cue to judge the article."
    );
  }
  if (isNounCategoryMode()) {
    const hints = {
      "gender-recognition":
        "Retrieve the category’s gender shortcut — masculine, feminine, or neuter.",
      "article-application":
        "Retrieve the category’s gender, then pick the matching article.",
      "gender-imposter":
        "Mentally assign der/die/das to each noun. Three share a gender — pick the odd one.",
      "sentence-validation":
        "Does the article match the category’s gender shortcut?",
    };
    return hints[state.nounsMode] || exercise?.materials?.hint || "";
  }
  const cue = exercise?.materials?.cue || exercise?.prompt?.cue;
  if (cue) return `Nominative singular. Look at the ending ${cue}.`;
  return (
    exercise?.materials?.hint ||
    exercise?.materials?.patternBlurb ||
    ""
  );
}

/**
 * Open unified Help sheet for the active question.
 * @param {{
 *   territory: string,
 *   exercise?: object|null,
 *   hint?: string,
 *   mode?: string,
 *   stepId?: string,
 *   topicId?: string,
 * }} opts
 */
function openSessionHelp(opts) {
  const model = buildHelpModel({
    hint: opts.hint || "",
    exercise: opts.exercise || null,
    territory: opts.territory,
    mode: opts.mode,
    stepId: opts.stepId,
    topicId: opts.topicId,
    referenceId: opts.referenceId || null,
    lexicon: LEXICON,
  });
  openSheet("Help", renderHelpSheetHtml(model));
  wireHelpSheet(document.getElementById("sheet-body"), {
    onOpenFullReference: (id) => openReferenceBrowse({ id }),
  });
}

function openNumbersHelp() {
  const ex = state.currentExercise || currentNumberExercise();
  openSessionHelp({
    territory: "numbers",
    exercise: ex,
    hint: numbersHelpHint(ex),
    stepId: state.numbersStep,
    topicId: state.numbersTopic,
    mode: state.numbersQuizMode,
  });
}

function openNounsHelp() {
  let ex = state.currentExercise;
  if (!ex) {
    if (state.nounsMode === "plurals") ex = currentNounPluralExercise();
    else if (state.nounsMode === "wugs") ex = currentNounWugExercise();
    else if (state.nounsMode === "association")
      ex = currentNounAssociationExercise();
    else if (!isNounCategoryMode() && !isNounDiscriminateMode())
      ex = currentNounArticleExercise();
  }
  openSessionHelp({
    territory: "nouns",
    exercise: ex,
    hint: nounsHelpHint(ex),
    mode: state.nounsMode,
  });
}

function openSoundsHelp() {
  const item = currentSoundsItem();
  openSessionHelp({
    territory: "sounds",
    exercise: null,
    hint: item?.hint || "",
    referenceId: null,
  });
}

/** Open Reference browse/entry in the sheet without touching Practice state. */
function openReferenceBrowse(opts = {}) {
  const { id = null, territory = null } = opts;
  const show = () => {
    let html;
    let title = "Reference";
    if (id) {
      html = renderReferenceEntryHtml(id);
      title = "Reference";
    } else {
      html = renderReferenceLandingHtml(territory);
    }
    openSheet(title, html);
    const body = document.getElementById("sheet-body");
    wireReferenceNav(body, {
      openId: (rid) => openReferenceBrowse({ id: rid }),
      openTerritory: (tid) => openReferenceBrowse({ territory: tid }),
      openHome: () => openReferenceBrowse({}),
    });
  };
  show();
}

function openContextualReference(ctx) {
  const id = referenceIdForPracticeContext(ctx);
  if (id) openReferenceBrowse({ id });
  else openReferenceBrowse({ territory: ctx?.territory || null });
}

function showSoundsHint() {
  openSoundsHelp();
}

function showSoundsReference() {
  openSoundsHelp();
}

function appendSoundsSupportActions(actions, extraButtons = []) {
  actions.append(
    ...extraButtons,
    actionBtn("Help", openSoundsHelp, "btn", null, false, "lightbulb")
  );
}

function soundsNavRow(backBtn, skipBtn, midButtons = []) {
  const row = document.createDocumentFragment();
  row.appendChild(backBtn);
  const mid = document.createElement("div");
  mid.className = "actions-mid";
  midButtons.forEach((b) => mid.appendChild(b));
  row.appendChild(mid);
  row.appendChild(skipBtn);
  return row;
}

function soundsBack() {
  if (state.soundsIndex <= 0) return;
  state.soundsIndex -= 1;
  renderSounds();
}

function soundsSkip() {
  state.soundsIndex += 1;
  renderSounds();
}

function soundsContinue() {
  state.soundsIndex += 1;
  renderSounds();
}

function renderSounds() {
  stopSpeech();
  state.soundsChoice = null;
  state.soundsChecked = false;
  closeSheet();
  syncTerritoryMenu("sounds");

  const prompt = document.getElementById("sounds-prompt");
  const help = document.getElementById("sounds-help");
  const reps = document.getElementById("sounds-reps");
  const playRow = document.getElementById("sounds-play-row");
  const reveal = document.getElementById("sounds-reveal");
  const karaoke = document.getElementById("sounds-karaoke");
  const choices = document.getElementById("sounds-choices");
  const actions = document.getElementById("sounds-actions");
  const assisted = state.soundsDifficulty === "assisted";

  reps.hidden = true;
  playRow.hidden = true;
  playRow.innerHTML = "";
  if (reveal) clearAnswerReveal("sounds");
  karaoke.hidden = true;
  karaoke.innerHTML = "";
  choices.hidden = true;
  choices.innerHTML = "";
  actions.innerHTML = "";
  actions.className = "actions actions-nav";
  help.hidden = true;
  help.textContent = "";
  help.className = "help-line";
  const stage = document.getElementById("sounds-stage");
  stage.dataset.mode = state.soundsMode;
  stage.dataset.difficulty = state.soundsDifficulty;

  const backBtn = actionBtn("Back", soundsBack, "btn", "sounds-back", false, "chevronLeft");
  backBtn.disabled = state.soundsIndex <= 0;

  if (state.soundsMode === "discriminate") {
    const skipBtn = actionBtn("Skip", soundsSkip, "btn", "sounds-skip", false, "chevronRight");
    const item =
      soundDiscriminate[state.soundsIndex % soundDiscriminate.length];
    prompt.textContent = item.prompt;

    playRow.hidden = false;
    playRow.appendChild(
      actionBtn("Play", () => speakGerman(item.play), "btn btn-primary play-btn")
    );

    choices.hidden = false;
    item.choices.forEach((c) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice";
      btn.dataset.id = c.id;
      btn.setAttribute("aria-pressed", "false");
      btn.innerHTML = assisted
        ? `${c.label}<span class="choice-sub">${c.sub}</span>`
        : c.label;
      btn.addEventListener("click", () => {
        if (state.soundsChecked) return;
        state.soundsChoice = c.id;
        checkSoundsDiscriminate(item);
      });
      choices.appendChild(btn);
    });

    const mid = [
      actionBtn("Help", openSoundsHelp, "btn", null, false, "lightbulb"),
    ];
    actions.appendChild(soundsNavRow(backBtn, skipBtn, mid));
    return;
  }

  if (state.soundsMode === "karaoke") {
    const nextBtn = actionBtn("Next", soundsSkip, "btn", "sounds-skip", false, "chevronRight");
    const item = soundKaraoke[state.soundsIndex % soundKaraoke.length];
    prompt.setAttribute("lang", "de");
    prompt.innerHTML = `<strong>${softHyphenateGerman(item.word, item.syllables)}</strong>`;

    playRow.hidden = false;
    playRow.appendChild(
      actionBtn("Play", () => playKaraoke(item), "btn btn-primary play-btn")
    );

    karaoke.hidden = false;
    item.syllables.forEach((s) => {
      const chip = makeSylButton({
        ortho: s.text,
        guide: s.guide,
        stress: s.stress,
        say: s.text,
        ariaLabel: `Play syllable ${s.text}`,
      });
      if (!assisted) {
        const guide = chip.querySelector(".syl-guide");
        if (guide) guide.hidden = true;
      }
      karaoke.appendChild(chip);
    });

    const mid = [
      actionBtn("Help", openSoundsHelp, "btn", null, false, "lightbulb"),
    ];
    actions.appendChild(soundsNavRow(backBtn, nextBtn, mid));
  }
}

function actionBtn(label, onClick, className, id, hidden, icon) {
  const btn = document.createElement("button");
  btn.type = "button";
  if (icon) {
    btn.className = `${className} btn-icon`.trim();
    btn.innerHTML = biIcon(icon);
    btn.setAttribute("aria-label", label);
    btn.title = label;
  } else {
    btn.className = className;
    btn.textContent = label;
  }
  if (id) btn.id = id;
  if (hidden) btn.hidden = true;
  btn.addEventListener("click", onClick);
  return btn;
}

function checkSoundsDiscriminate(item) {
  if (!state.soundsChoice || state.soundsChecked) return;

  state.soundsChecked = true;
  const ok = state.soundsChoice === item.answer;
  const choices = document.getElementById("sounds-choices");
  const choiceEls = [];

  choices.querySelectorAll(".choice").forEach((el) => {
    el.disabled = true;
    const id = el.dataset.id;
    el.setAttribute("aria-pressed", String(id === state.soundsChoice));
    if (id === state.soundsChoice && !ok) el.classList.add("is-bad");
    if (id === item.answer) choiceEls.push(el);
  });

  const playBtn = document.querySelector("#sounds-play-row button");
  if (playBtn) playBtn.disabled = true;

  const parts = item.parts || [{ text: item.play, guide: item.play }];
  const gloss = item.en || glossForDe(item.play);

  presentCorrectAnswer({
    prefix: "sounds",
    choiceEls,
    reveal: {
      word: item.play,
      parts,
      en: gloss,
      ok,
    },
    then: (nodes) => {
      playAnswerKeyThenAdvance(item.play, parts, nodes, scheduleSoundsAdvance);
    },
  });
}

function playKaraoke(item) {
  const nodes = [...document.querySelectorAll("#sounds-karaoke .syl")];
  playKaraokeFlow(item.tts, item.syllables, nodes);
}

/** Full-word TTS with flowing syllable highlight (chart examples + quiz Play word). */
function playKaraokeFlow(tts, syllables, nodes, opts = {}) {
  const { keepAdvance = false, onEnd, onError } = opts;
  if (!navCaps().audio) {
    onEnd?.();
    return;
  }
  stopSpeech({ keepAdvance });
  if (!nodes.length || !tts) {
    onError?.();
    return;
  }

  const rate = 0.7;
  const weights = syllables.map((s) =>
    Math.max(2, (s.text || "").length + (s.stress ? 1 : 0))
  );
  const totalW = weights.reduce((a, b) => a + b, 0);
  const estimated = estimateUtteranceMs(tts, rate);
  const timers = [];
  state.karaokeTimers = timers;

  const clearActive = () => {
    nodes.forEach((n) => n.classList.remove("is-active"));
  };

  const schedule = (totalMs) => {
    timers.forEach(clearTimeout);
    timers.length = 0;
    clearActive();
    let t = 60;
    const usable = Math.max(320, totalMs - 100);
    syllables.forEach((_, i) => {
      const slice = (weights[i] / totalW) * usable;
      const at = t;
      timers.push(
        setTimeout(() => {
          clearActive();
          nodes[i]?.classList.add("is-active");
        }, at)
      );
      t += slice;
    });
  };

  let startedAt = 0;
  let finished = false;
  const finish = (fn) => {
    if (finished) return;
    finished = true;
    fn?.();
  };

  withGermanUtterance(tts, {
    rate,
    onStart: () => {
      startedAt = performance.now();
      schedule(estimated);
    },
    onEnd: () => {
      const actual = Math.max(300, performance.now() - startedAt);
      state.ttsMsPerChar = actual / Math.max(1, tts.length);
      clearActive();
      nodes[nodes.length - 1]?.classList.add("is-active");
      timers.push(
        setTimeout(() => {
          clearActive();
          finish(onEnd);
        }, 320)
      );
    },
    onError: () => {
      clearActive();
      finish(onError || onEnd);
    },
  });
}

/* —— Menus / overlay stacking —— */

/** Last-opened overlay (menu chrome or sheet) gets the highest z-index. */
let overlaySeq = 40;

function nextOverlayZ() {
  overlaySeq += 1;
  return overlaySeq;
}

function bringOverlayFront(el) {
  if (!el) return;
  el.style.zIndex = String(nextOverlayZ());
}

function topbarEl() {
  return document.querySelector(".topbar");
}

function anyMenuOpen() {
  return [...document.querySelectorAll(".menu-panel")].some((p) => !p.hidden);
}

function closeAllMenus() {
  document.querySelectorAll(".menu-panel").forEach((panel) => {
    panel.hidden = true;
  });
  document.querySelectorAll(".brand-menu-btn, .territory-menu-btn").forEach((btn) => {
    btn.setAttribute("aria-expanded", "false");
  });
  const topbar = topbarEl();
  if (topbar && !anyMenuOpen()) {
    topbar.style.zIndex = "";
  }
}

function openMenuPanel(panel, btn) {
  closeAllMenus();
  panel.hidden = false;
  btn.setAttribute("aria-expanded", "true");
  bringOverlayFront(topbarEl());
}

function wireMenus() {
  document.querySelectorAll(".brand-menu-btn, .territory-menu-btn").forEach((btn) => {
    if (btn.tagName !== "BUTTON") return;
    const menu = btn.closest(".menu");
    const panel = menu?.querySelector(".menu-panel");
    if (!panel) return;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = panel.hidden;
      if (willOpen) openMenuPanel(panel, btn);
      else closeAllMenus();
    });
  });

  document.querySelectorAll(".menu-panel").forEach((panel) => {
    panel.addEventListener("click", (e) => {
      // Keep open only for non-action clicks; action buttons close via handlers.
      if (e.target.closest("button")) closeAllMenus();
    });
  });

  document.addEventListener("click", () => closeAllMenus());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllMenus();
  });
}

/* —— wire UI —— */

function bind() {
  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      closeAllMenus();
      navigate(el.dataset.nav);
    });
  });

  wireMenus();

  document.querySelectorAll("[data-theme-choice]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllMenus();
      setThemePref(btn.dataset.themeChoice);
    });
  });

  document.querySelectorAll("[data-sfx-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = !readSfxEnabled();
      setSfxEnabled(next);
      if (next) playFeedbackSound("ok");
    });
  });

  document.getElementById("btn-switch-user")?.addEventListener("click", () => {
    closeAllMenus();
    openSheet(
      "Switch user",
      `<p>Profile switching will land here. For this prototype, you’re on the default local profile.</p>
       <ul>
         <li><strong>You</strong> — active</li>
         <li>Guest — coming soon</li>
       </ul>`
    );
  });

  document.getElementById("numbers-help").addEventListener("click", () => {
    openNumbersHelp();
  });
  document.getElementById("numbers-back").addEventListener("click", () => {
    clearNumbersAdvance();
    stopSpeech();
    if (!retreatNumbersItem()) return;
    renderNumbers();
  });
  document.getElementById("numbers-skip").addEventListener("click", () => {
    clearNumbersAdvance();
    stopSpeech();
    const hist = state.numbersHistory || [];
    const i = state.numbersHistoryIndex ?? -1;
    if (i >= 0 && i < hist.length - 1) {
      state.numbersHistoryIndex = i + 1;
      restoreNumbersNavSnapshot(hist[state.numbersHistoryIndex]);
      renderNumbers();
      return;
    }
    skipNumbersShowingAnswer();
  });

  document.getElementById("nouns-help").addEventListener("click", () => {
    openNounsHelp();
  });
  document.getElementById("nouns-back").addEventListener("click", () => {
    clearNounsAdvance();
    if (state.nounsMode === "plurals") {
      if (state.nounsPluralIndex <= 0) return;
      state.nounsPluralIndex -= 1;
    } else if (isNounCategoryMode()) {
      const key = categoryModeIndexKey();
      if (state[key] <= 0) return;
      state[key] -= 1;
    } else if (state.nounsMode === "association") {
      if (state.nounsAssociationIndex <= 0) return;
      state.nounsAssociationIndex -= 1;
    } else if (state.nounsMode === "wugs") {
      if (state.nounsWugIndex <= 0) return;
      state.nounsWugIndex -= 1;
    } else if (state.nounsMode === "proofread") {
      if (state.nounsProofreadIndex <= 0) return;
      state.nounsProofreadIndex -= 1;
    } else if (state.nounsMode === "reverse-mc") {
      if (state.nounsReverseIndex <= 0) return;
      state.nounsReverseIndex -= 1;
    } else {
      if (state.nounsIndex <= 0) return;
      state.nounsIndex -= 1;
    }
    renderNouns();
  });
  document.getElementById("nouns-skip").addEventListener("click", () => {
    clearNounsAdvance();
    if (continueGuided()) return;
    advanceNounsIndex();
    if (continueCrossTerritoryMix("nouns")) return;
    renderNouns();
  });

  document.getElementById("numbers-hub")?.addEventListener("click", (e) => {
    const vocabOpen = e.target.closest("[data-vocab-open]");
    if (vocabOpen) {
      openVocabulary(
        vocabOpen.dataset.vocabTerritory || "numbers",
        vocabOpen.dataset.vocabMode || "learn"
      );
      return;
    }
    const go = e.target.closest("#numbers-hub-go");
    if (go) {
      startNumbersPractice({
        topicId: go.dataset.topicId,
        stepId: go.dataset.stepId,
        modeId: go.dataset.modeId,
        difficulty: go.dataset.difficulty || state.numbersDifficulty,
        lock: true,
      });
      return;
    }
    const topicBtn = e.target.closest("[data-hub-topic]");
    if (topicBtn) {
      const id = topicBtn.dataset.hubTopic;
      state.numbersHubTopic =
        state.numbersHubTopic === id ? "" : id;
      state.numbersHubPracticePick = "";
      renderNumbersHub();
      return;
    }
    const learn = e.target.closest("[data-hub-learn]");
    if (learn) {
      openNumbersStepLearn(learn.dataset.topic, learn.dataset.step);
      return;
    }
    const practice = e.target.closest("[data-hub-practice]");
    if (practice) {
      const topicId = practice.dataset.topic;
      const stepId = practice.dataset.step;
      const modes = filterModesForCaps(modesForStep(topicId, stepId));
      if (modes.length <= 1) {
        startNumbersPractice({
          topicId,
          stepId,
          modeId: modes[0]?.id || "build",
          difficulty: state.numbersDifficulty,
          lock: true,
        });
        return;
      }
      const key = `${topicId}:${stepId}`;
      state.numbersHubPracticePick =
        state.numbersHubPracticePick === key ? "" : key;
      renderNumbersHub();
      return;
    }
    const start = e.target.closest("[data-hub-start]");
    if (start) {
      startNumbersPractice({
        topicId: start.dataset.topic,
        stepId: start.dataset.step,
        modeId: start.dataset.mode,
        difficulty: state.numbersDifficulty,
        lock: true,
      });
      return;
    }
  });

  document.getElementById("nouns-hub")?.addEventListener("click", (e) => {
    const vocabOpen = e.target.closest("[data-vocab-open]");
    if (vocabOpen) {
      openVocabulary(
        vocabOpen.dataset.vocabTerritory || "nouns",
        vocabOpen.dataset.vocabMode || "learn"
      );
      return;
    }
    const learn = e.target.closest("[data-nouns-learn]");
    if (learn) {
      const unitId = learn.dataset.unit;
      const u = getGenderShortcutsUnit(unitId);
      openNounsStepLearn([
        {
          id: `nouns:gs:${unitId}`,
          learnUnitId: unitId,
          chartTab: u?.chartTab,
        },
      ]);
      return;
    }
    const startFam = e.target.closest("[data-nouns-start-family]");
    if (startFam) {
      startNounsFamily(startFam.dataset.family);
      return;
    }
  });

  document.querySelectorAll("[data-scaffold-difficulty]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllMenus();
      setScaffoldDifficulty(btn.dataset.scaffoldDifficulty);
    });
  });
  syncScaffoldMenu();

  document.querySelectorAll("[data-nouns-hub]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllMenus();
      goNounsHub();
    });
  });

  document
    .querySelector('.territory-menu[data-territory="nouns"] .menu-panel')
    ?.addEventListener("click", (e) => {
      const vocabOpen = e.target.closest("[data-vocab-open]");
      if (!vocabOpen) return;
      e.stopPropagation();
      closeAllMenus();
      openVocabulary(
        vocabOpen.dataset.vocabTerritory || "nouns",
        vocabOpen.dataset.vocabMode || "learn"
      );
    });

  document.querySelectorAll("[data-nouns-unit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllMenus();
      goNounsHub({ unitId: btn.dataset.nounsUnit });
    });
  });

  document.querySelectorAll("[data-sounds-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllMenus();
      setSoundsMode(btn.dataset.soundsMode);
      state.phase.sounds = "practice";
      showTerritoryPhase("sounds");
    });
  });

  document.querySelectorAll("[data-show-briefing]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllMenus();
      const id = btn.dataset.showBriefing;
      if (state.phase[id] === "practice") {
        state.preservePractice[id] = true;
      }
      state.phase[id] = "briefing";
      if (state.view !== id) navigate(id, { keepPhase: true });
      else showTerritoryPhase(id);
    });
  });

  document.querySelectorAll("[data-open-chart]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllMenus();
      const id = btn.dataset.openChart;
      if (state.phase[id] === "practice") {
        state.preservePractice[id] = true;
      }
      state.phase[id] = "chart";
      if (state.view !== id) navigate(id, { keepPhase: true });
      else showTerritoryPhase(id);
    });
  });

  document.querySelectorAll("[data-open-reference]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllMenus();
      const territory = btn.dataset.openReference;
      // Overlay only — do not change Practice phase or Dealer state.
      openReferenceBrowse({ territory });
    });
  });

  document.getElementById("sheet-close").addEventListener("click", closeSheet);
  document.getElementById("sheet-backdrop").addEventListener("click", closeSheet);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSheet();
  });

  // Guided Coach / Debug: reason chip, Guided badge, or Debug → sheets.
  const sessionCrumb = document.getElementById("session-crumb");
  sessionCrumb?.addEventListener("click", (e) => {
    if (state.sessionMode !== "guided") return;
    if (e.target.closest("[data-guided-debug]")) {
      e.preventDefault();
      openGuidedDebugSheet();
      return;
    }
    const hit =
      e.target.closest("[data-coach-open]") ||
      e.target.closest("#session-mode.is-coach");
    if (!hit) return;
    e.preventDefault();
    openGuidedCoachSheet();
  });
  sessionCrumb?.addEventListener("keydown", (e) => {
    if (state.sessionMode !== "guided") return;
    if (e.key !== "Enter" && e.key !== " ") return;
    if (e.target.closest("[data-guided-debug]")) {
      e.preventDefault();
      openGuidedDebugSheet();
      return;
    }
    const hit = e.target.closest("#session-mode.is-coach");
    if (!hit) return;
    e.preventDefault();
    openGuidedCoachSheet();
  });

  window.addEventListener("hashchange", () => {
    const h = location.hash.replace("#", "") || "hub";
    if (["hub", "numbers", "nouns", "sounds"].includes(h)) navigate(h);
  });
}

initTheme();
initSfx();
renderHub();
bind();
hydrateIconButtons();
if (location.hash === "#numbers") navigate("numbers");
else if (location.hash === "#nouns") navigate("nouns");
else if (location.hash === "#sounds") navigate("sounds");
