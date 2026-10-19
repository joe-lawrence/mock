/**
 * Extra Numbers quiz shells imported from the old level1 patterns:
 * cloze, proofread, visual (pie/clock), sentence ordinals.
 */

import { cardinalForm, constructionParts } from "../engine/numbers/index.js?v=20260930-dmo16";

const BLANK_PREF = new Set([
  "und",
  "zehn",
  "zig",
  "ßig",
  "te",
  "ste",
  "Komma",
  "Uhr",
  "nach",
  "vor",
  "halb",
  "am",
  "Euro",
  "Cent",
]);

const ORDINAL_FRAMES = [
  { frame: "Das ist", art: "der", nouns: ["Tag", "Monat", "Platz", "Versuch"] },
  { frame: "Das ist", art: "die", nouns: ["Woche", "Frage", "Runde", "Person"] },
  { frame: "Das ist", art: "das", nouns: ["Jahr", "Kapitel", "Buch", "Mal"] },
  { frame: "Heute ist", art: "der", nouns: ["Tag"] },
];

function unique(list) {
  return [...new Set(list.filter(Boolean))];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Prefer morphologically meaningful blanks; else middle piece. */
export function pickBlankIndex(parts) {
  if (!parts?.length) return 0;
  if (parts.length === 1) return 0;
  for (let i = 0; i < parts.length; i++) {
    if (BLANK_PREF.has(parts[i])) return i;
  }
  return Math.min(parts.length - 1, Math.max(1, Math.floor(parts.length / 2)));
}

export function answerPartsForMeta(meta) {
  if (meta?.parts?.length) return [...meta.parts];
  if (meta?.value != null) {
    return constructionParts(meta.value, {
      grain: meta.grain === "morph" ? "morph" : "construction",
    });
  }
  if (meta?.form) return String(meta.form).split(/\s+/);
  return [];
}

export function canonicalFormForMeta(meta) {
  if (meta?.form) return meta.form;
  if (meta?.value != null) return cardinalForm(meta.value);
  return "";
}

/** Light orthographic corruption for proofreading. */
export function corruptForm(form) {
  const s = String(form || "").trim();
  if (!s) return s + "x";
  const variants = [];
  // Never foil ß ↔ ss — both are accepted orthographies in this product.
  // Prefer real letter slips over -en (drei→dreien is a real dative form — confusing).
  if (/ei/.test(s)) variants.push(s.replace(/ei/g, "ie"));
  if (/ie/.test(s) && !/ei/.test(s)) variants.push(s.replace(/ie/g, "ei"));
  // Compound linker "und" only (not the "und" inside hundert).
  if (/(^|[^a-zäöü])und([^a-zäöü]|$)/i.test(s)) {
    variants.push(s.replace(/\bund\b/i, ""));
  }
  if (s.includes("zig")) variants.push(s.replace("zig", "ßig"));
  if (s.includes("ßig")) variants.push(s.replace("ßig", "zig"));
  if (s.includes("Komma")) variants.push(s.replace("Komma", "Punkt"));
  if (s.includes("Viertel")) variants.push(s.replace("Viertel", "Viertal"));
  if (s.includes("te") && !s.includes("ste")) variants.push(s.replace(/te$/, "ste"));
  if (s.includes("ste")) variants.push(s.replace(/ste$/, "te"));
  // NB: never swap "Uhr" → "Stunde" — that is a confusing semantic error
  // ("null Stunde"), not the orthographic slip proofreading is meant to test.
  if (s.includes(" ")) {
    const bits = s.split(" ");
    if (bits.length >= 2) {
      variants.push([...bits].reverse().join(" "));
      variants.push(bits.slice(0, -1).join(" "));
    }
  }
  if (s.length > 4) variants.push(s + "en");
  if (s.length > 4) variants.push(s.replace(/e$/, "en") || s + "n");
  if (s.length <= 4) variants.push(s + "i");
  const pick = variants.find((v) => v && v !== s && v.replace(/\s+/g, "") !== s.replace(/\s+/g, ""));
  return pick || `${s}x`;
}

export function clozeDistractors(blank, parts) {
  const pool = [
    "und",
    "zehn",
    "zig",
    "ßig",
    "te",
    "ste",
    "Komma",
    "Punkt",
    "Uhr",
    "nach",
    "vor",
    "halb",
    "am",
    "ein",
    "eins",
    `${blank}en`,
  ];
  return unique(pool.filter((x) => x && x !== blank)).slice(0, 3);
}

/**
 * @param {object} meta
 * @param {{ difficulty?: string }} [opts]
 */
export function makeClozeExercise(meta, opts = {}) {
  const parts = answerPartsForMeta(meta);
  if (parts.length < 2) {
    return null; // caller falls back
  }
  const blankIndex = pickBlankIndex(parts);
  const blank = parts[blankIndex];
  const difficulty = opts.difficulty || "assisted";
  return {
    id: `ex.numbers.cloze.${meta.written || meta.value || meta.form}.${blankIndex}`,
    templateId: "numbers.cloze.slot",
    territoryId: "numbers",
    mode: difficulty,
    target: { kind: "cloze", blankIndex },
    scaffolding: {
      mode: difficulty,
      showEnglish: difficulty === "assisted",
      showHintButton: true,
      showReferenceButton: true,
      allowRetryWrongChoice: true,
      chipTray: true,
    },
    prompt: {
      kind: "cloze-blank",
      written: meta.written || (meta.value != null ? String(meta.value) : ""),
      english: meta.english || "",
      ask: "Fill the missing piece",
    },
    materials: {
      parts,
      blankIndex,
      blank,
      distractors: clozeDistractors(blank, parts),
      form: canonicalFormForMeta(meta),
      hint: `Missing slot ${blankIndex + 1} of ${parts.length}.`,
    },
    resolution: {
      kind: "cloze",
      parts,
      blankIndex,
      blank,
      form: canonicalFormForMeta(meta),
      value: meta.value,
      written: meta.written,
    },
  };
}

/**
 * @param {object} meta
 * @param {{ difficulty?: string }} [opts]
 */
export function makeProofreadExercise(meta, opts = {}) {
  const form = canonicalFormForMeta(meta);
  if (!form) return null;
  const wrong = corruptForm(form);
  const difficulty = opts.difficulty || "assisted";
  const parts = answerPartsForMeta(meta);
  const english = String(meta.english || meta.englishWritten || "").trim();
  const ask = english
    ? `Fix the spelling of ${english}`
    : "Fix the spelling";
  const lemma = parts.length === 1 ? parts[0] : null;
  return {
    id: `ex.numbers.proofread.${meta.written || meta.value || form}`,
    templateId: "numbers.proofread.form",
    territoryId: "numbers",
    mode: difficulty,
    target: {
      kind: "proofread",
      value: meta.value,
      // Help Vocab: correct token — never the misspelled surface.
      lemma,
    },
    scaffolding: {
      mode: difficulty,
      showEnglish: difficulty === "assisted",
      showHintButton: true,
      showReferenceButton: true,
      allowRetryWrongChoice: true,
    },
    prompt: {
      kind: "proofread-form",
      wrong,
      written: meta.written || (meta.value != null ? String(meta.value) : ""),
      english,
      ask,
    },
    materials: {
      form,
      wrong,
      // Correct construction chips for Help Vocab (never the typo).
      parts: parts.length ? parts : [form],
      hint: english
        ? `Type the correct German for “${english}”. The prompt shows a misspelling.`
        : "One piece is wrong — type the correct German form.",
    },
    resolution: {
      kind: "proofread",
      form,
      wrong,
      english,
      value: meta.value,
      written: meta.written,
      whole: meta.whole,
      fracDigits: meta.fracDigits,
      numerator: meta.numerator,
      denominator: meta.denominator,
      n: meta.n,
      hours: meta.hours,
      minutes: meta.minutes,
      lemma,
    },
  };
}


function pieSvg(numer, denom) {
  const size = 128;
  const c = size / 2;
  const r = 54;
  const slice = 360 / denom;
  let paths = "";
  for (let i = 0; i < denom; i++) {
    const start = (i * slice - 90) * (Math.PI / 180);
    const end = ((i + 1) * slice - 90) * (Math.PI / 180);
    const x1 = c + r * Math.cos(start);
    const y1 = c + r * Math.sin(start);
    const x2 = c + r * Math.cos(end);
    const y2 = c + r * Math.sin(end);
    const large = slice > 180 ? 1 : 0;
    const fill = i < numer ? "var(--accent, #2563eb)" : "#fff";
    paths += `<path d="M ${c} ${c} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z" fill="${fill}" stroke="#94a3b8" stroke-width="1.5"/>`;
  }
  return `<svg class="quiz-visual-svg" viewBox="0 0 ${size} ${size}" width="128" height="128" aria-hidden="true">${paths}</svg>`;
}

function clockSvg(hours, minutes) {
  const h = hours % 12;
  const minuteDeg = minutes * 6;
  const hourDeg = h * 30 + (minutes / 60) * 30;
  let ticks = "";
  for (let t = 0; t < 12; t++) {
    const major = t % 3 === 0;
    ticks += `<line class="clock-tick" x1="64" y1="12" x2="64" y2="${12 + (major ? 8 : 4)}" stroke="var(--clock-hand, #1c2430)" stroke-width="${major ? 3 : 1.5}" stroke-linecap="round" transform="rotate(${t * 30} 64 64)"/>`;
  }
  return `<svg class="quiz-visual-svg quiz-clock-svg" viewBox="0 0 128 128" width="128" height="128" aria-hidden="true">
    <circle class="clock-face" cx="64" cy="64" r="58" fill="var(--clock-face, #fff)" stroke="var(--clock-rim, currentColor)" stroke-width="4"/>
    ${ticks}
    <line class="clock-hand" x1="64" y1="64" x2="64" y2="34" stroke="var(--clock-hand, currentColor)" stroke-width="4" stroke-linecap="round" transform="rotate(${hourDeg} 64 64)"/>
    <line class="clock-hand" x1="64" y1="64" x2="64" y2="20" stroke="var(--clock-hand, currentColor)" stroke-width="2.5" stroke-linecap="round" transform="rotate(${minuteDeg} 64 64)"/>
    <circle class="clock-hub" cx="64" cy="64" r="4" fill="var(--clock-hand, currentColor)"/>
  </svg>`;
}

/**
 * German compass bearings (deg clockwise from north). Abbreviations use O for Osten.
 * @type {ReadonlyArray<{ id: string, abbr: string, deg: number, english: string }>}
 */
export const COMPASS_BEARINGS = Object.freeze([
  Object.freeze({ id: "Norden", abbr: "N", deg: 0, english: "north" }),
  Object.freeze({ id: "Nordosten", abbr: "NO", deg: 45, english: "northeast" }),
  Object.freeze({ id: "Osten", abbr: "O", deg: 90, english: "east" }),
  Object.freeze({ id: "Südosten", abbr: "SO", deg: 135, english: "southeast" }),
  Object.freeze({ id: "Süden", abbr: "S", deg: 180, english: "south" }),
  Object.freeze({ id: "Südwesten", abbr: "SW", deg: 225, english: "southwest" }),
  Object.freeze({ id: "Westen", abbr: "W", deg: 270, english: "west" }),
  Object.freeze({ id: "Nordwesten", abbr: "NW", deg: 315, english: "northwest" }),
]);

/** Deck metas for Categories → Cardinal directions (compass naming). */
export function compassDirectionPool() {
  return COMPASS_BEARINGS.map((b) =>
    Object.freeze({
      kind: "compass",
      bearing: b.id,
      lemma: b.id,
      english: b.english,
      deg: b.deg,
    })
  );
}

function bearingById(bearingId) {
  return COMPASS_BEARINGS.find((b) => b.id === bearingId) || null;
}

/**
 * Compass face with needle pointing at the target bearing.
 * @param {string} bearingId — lemma id (e.g. Norden, Nordosten)
 * @param {{ interactive?: boolean, selected?: boolean }} [opts]
 */
export function compassSvg(bearingId, opts = {}) {

  const hit = bearingById(bearingId) || COMPASS_BEARINGS[0];
  const deg = hit.deg;
  let ticks = "";
  for (const b of COMPASS_BEARINGS) {
    const major = b.deg % 90 === 0;
    ticks += `<line class="compass-tick" x1="64" y1="12" x2="64" y2="${12 + (major ? 10 : 5)}" stroke="var(--clock-hand, #1c2430)" stroke-width="${major ? 2.5 : 1.5}" stroke-linecap="round" transform="rotate(${b.deg} 64 64)"/>`;
  }
  const cls = [
    "quiz-visual-svg",
    "quiz-compass-svg",
    opts.interactive ? "is-interactive" : "",
    opts.selected ? "is-selected" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const needleFill = opts.selected
    ? "var(--accent, #2563eb)"
    : opts.interactive && !bearingId
      ? "color-mix(in srgb, var(--clock-hand, #1c2430) 35%, transparent)"
      : "var(--accent, #2563eb)";
  return `<svg class="${cls}" viewBox="0 0 128 128" width="160" height="160" role="${opts.interactive ? "img" : "presentation"}" aria-hidden="${opts.interactive ? "false" : "true"}">
    <circle class="compass-face" cx="64" cy="64" r="58" fill="var(--clock-face, #fff)" stroke="var(--clock-rim, currentColor)" stroke-width="4"/>
    ${ticks}
    <polygon class="compass-needle" points="64,22 69,64 64,58 59,64" fill="${needleFill}" transform="rotate(${deg} 64 64)"/>
    <polygon class="compass-needle-tail" points="64,106 69,64 64,70 59,64" fill="var(--clock-hand, #1c2430)" opacity="0.35" transform="rotate(${deg} 64 64)"/>
    <circle class="compass-hub" cx="64" cy="64" r="4" fill="var(--clock-hand, currentColor)"/>
  </svg>`;
}

/**
 * Angle (degrees clockwise from north) → nearest compass bearing id.
 * @param {number} deg
 */
export function bearingIdFromAngleDeg(deg) {
  const n = ((Number(deg) % 360) + 360) % 360;
  const idx = Math.round(n / 45) % COMPASS_BEARINGS.length;
  return COMPASS_BEARINGS[idx].id;
}

/**
 * Pointer position relative to SVG center → degrees clockwise from north.
 * @param {DOMRect} rect
 * @param {number} clientX
 * @param {number} clientY
 */
export function angleDegFromPointer(rect, clientX, clientY) {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = clientX - cx;
  const dy = clientY - cy;
  // atan2: 0 = east; convert to clockwise-from-north
  const rad = Math.atan2(dy, dx);
  const fromEast = (rad * 180) / Math.PI;
  return ((fromEast + 90) % 360 + 360) % 360;
}

/**
 * Interactive / quiz clock face (same geometry as clockSvg).
 * @param {number} hours
 * @param {number} minutes
 * @param {{ interactive?: boolean }} [opts]
 */
/** ViewBox hand lengths (center 64,64 → tip). */
export const CLOCK_HOUR_HAND_LEN = 30; // y 64 → 34
export const CLOCK_MINUTE_HAND_LEN = 44; // y 64 → 20

/**
 * Tip of a clock hand in viewBox coords (deg clockwise from north).
 * @param {number} deg
 * @param {number} length
 */
export function clockHandTip(deg, length) {
  const rad = (Number(deg) * Math.PI) / 180;
  return {
    x: 64 + length * Math.sin(rad),
    y: 64 - length * Math.cos(rad),
  };
}

/**
 * Which hand is nearer the pointer (tip distance in viewBox space).
 * Outer clicks favor the minute hand; near-center favors the hour hand when aligned.
 * @param {DOMRect} rect — svg.getBoundingClientRect()
 * @param {number} clientX
 * @param {number} clientY
 * @param {number} hours
 * @param {number} minutes
 * @returns {"hour"|"minute"}
 */
export function pickClockHandFromPointer(rect, clientX, clientY, hours, minutes) {
  if (!rect?.width || !rect?.height) return "minute";
  const x = ((clientX - rect.left) / rect.width) * 128;
  const y = ((clientY - rect.top) / rect.height) * 128;
  const h = ((hours % 12) + 12) % 12;
  const mins = ((minutes % 60) + 60) % 60;
  const minuteDeg = mins * 6;
  const hourDeg = h * 30 + (mins / 60) * 30;
  const hourTip = clockHandTip(hourDeg, CLOCK_HOUR_HAND_LEN);
  const minTip = clockHandTip(minuteDeg, CLOCK_MINUTE_HAND_LEN);
  const dH = (x - hourTip.x) ** 2 + (y - hourTip.y) ** 2;
  const dM = (x - minTip.x) ** 2 + (y - minTip.y) ** 2;
  return dH <= dM ? "hour" : "minute";
}

/**
 * Apply hour/minute hand transforms on an existing clock SVG.
 * @param {SVGElement|null} svg
 * @param {number} hours
 * @param {number} minutes
 * @param {{ dragTarget?: "hour"|"minute"|null }} [opts]
 */
export function syncClockHandTransforms(svg, hours, minutes, opts = {}) {
  if (!svg) return;
  const h = ((hours % 12) + 12) % 12;
  const mins = ((minutes % 60) + 60) % 60;
  const minuteDeg = mins * 6;
  const hourDeg = h * 30 + (mins / 60) * 30;
  const hourEl = svg.querySelector(".clock-hand--hour");
  const minEl = svg.querySelector(".clock-hand--minute");
  hourEl?.setAttribute("transform", `rotate(${hourDeg} 64 64)`);
  minEl?.setAttribute("transform", `rotate(${minuteDeg} 64 64)`);
  const target = opts.dragTarget || null;
  hourEl?.classList.toggle("is-dragging", target === "hour");
  minEl?.classList.toggle("is-dragging", target === "minute");
}

export function clockFaceSvg(hours, minutes, opts = {}) {
  const h = ((hours % 12) + 12) % 12;
  const mins = ((minutes % 60) + 60) % 60;
  const minuteDeg = mins * 6;
  const hourDeg = h * 30 + (mins / 60) * 30;
  let ticks = "";
  for (let t = 0; t < 12; t++) {
    const major = t % 3 === 0;
    ticks += `<line class="clock-tick" x1="64" y1="12" x2="64" y2="${12 + (major ? 8 : 4)}" stroke="var(--clock-hand, #1c2430)" stroke-width="${major ? 3 : 1.5}" stroke-linecap="round" transform="rotate(${t * 30} 64 64)"/>`;
  }
  const cls = [
    "quiz-visual-svg",
    "quiz-clock-svg",
    opts.interactive ? "is-interactive" : "",
  ]
    .filter(Boolean)
    .join(" ");
  // Same intrinsic size as clockSvg (Type what you see).
  return `<svg class="${cls}" viewBox="0 0 128 128" width="128" height="128" role="${opts.interactive ? "img" : "presentation"}" aria-hidden="${opts.interactive ? "false" : "true"}">
    <circle class="clock-face" cx="64" cy="64" r="58" fill="var(--clock-face, #fff)" stroke="var(--clock-rim, currentColor)" stroke-width="4"/>
    ${ticks}
    <line class="clock-hand clock-hand--hour" x1="64" y1="64" x2="64" y2="34" stroke="var(--clock-hand, currentColor)" stroke-width="4" stroke-linecap="round" transform="rotate(${hourDeg} 64 64)"/>
    <line class="clock-hand clock-hand--minute" x1="64" y1="64" x2="64" y2="20" stroke="var(--accent, #2563eb)" stroke-width="2.5" stroke-linecap="round" transform="rotate(${minuteDeg} 64 64)"/>
    <circle class="clock-hub" cx="64" cy="64" r="4" fill="var(--clock-hand, currentColor)"/>
  </svg>`;
}

/**
 * Snap minutes to nearest step (default 5); hours stay in 0–23.
 * @param {number} hours
 * @param {number} minutes
 * @param {number} [minuteStep=5]
 */
export function snapClockTime(hours, minutes, minuteStep = 5) {
  const step = Math.max(1, minuteStep | 0);
  let mins = Math.round(Number(minutes) / step) * step;
  let hrs = Math.floor(Number(hours)) % 24;
  if (hrs < 0) hrs += 24;
  if (mins >= 60) {
    mins = 0;
    hrs = (hrs + 1) % 24;
  }
  if (mins < 0) {
    mins = 60 - step;
    hrs = (hrs + 23) % 24;
  }
  return { hours: hrs, minutes: mins };
}

/**
 * Angle clockwise from north → clock minutes (0–59), optional snap.
 * @param {number} deg
 * @param {number} [minuteStep=5]
 */
export function minutesFromAngleDeg(deg, minuteStep = 5) {
  const n = ((Number(deg) % 360) + 360) % 360;
  const raw = n / 6;
  const step = Math.max(1, minuteStep | 0);
  let mins = Math.round(raw / step) * step;
  if (mins >= 60) mins = 0;
  return mins;
}

/**
 * Angle clockwise from north → hour 0–11 (for hour-hand drag).
 * @param {number} deg
 * @param {number} minutes — current minutes (for hour-hand offset undo)
 */
export function hourFromAngleDeg(deg, minutes = 0) {
  const n = ((Number(deg) % 360) + 360) % 360;
  const mins = ((minutes % 60) + 60) % 60;
  // Undo the minute contribution on the hour hand (0.5° per minute).
  const adjusted = (n - mins * 0.5 + 360) % 360;
  return Math.round(adjusted / 30) % 12;
}

/**
 * Visual HTML for fraction / clock / compass metas. Null if unsupported.
 * @param {object} meta
 */
export function visualForMeta(meta) {
  if (
    (meta?.kind === "fraction" || meta?.kind === "fraction-half" || meta?.kind === "fraction-unit" || meta?.kind === "fraction-proper") &&
    meta.numerator != null &&
    meta.denominator != null
  ) {
    return {
      html: pieSvg(meta.numerator, meta.denominator),
      ask: "Name what you see",
      lead: "",
    };
  }
  // pool metas use kind: "fraction"
  if (meta?.kind === "fraction" && meta.numerator != null) {
    return {
      html: pieSvg(meta.numerator, meta.denominator),
      ask: "Name what you see",
      lead: "",
    };
  }
  if (
    (meta?.kind === "clock" ||
      String(meta?.kind || "").startsWith("time-")) &&
    meta.hours != null &&
    meta.minutes != null
  ) {
    return {
      html: clockSvg(meta.hours, meta.minutes),
      ask: "Name what you see",
      lead: "",
    };
  }
  if (meta?.kind === "compass" && (meta.bearing || meta.lemma)) {
    const bearing = meta.bearing || meta.lemma;
    return {
      html: compassSvg(bearing),
      ask: "Name what you see",
      lead: "",
    };
  }
  return null;
}

/**
 * Sentence-frame ordinal: "Das ist der 12. Tag." → "Das ist der zwölfte Tag."
 * @param {object} meta — ordinal meta with n + form
 * @param {{ difficulty?: string }} [opts]
 */
export function makeSentenceOrdinalExercise(meta, opts = {}) {
  const n = meta?.n;
  const ord = meta?.form;
  if (!n || !ord) return null;
  const pack = ORDINAL_FRAMES[n % ORDINAL_FRAMES.length];
  const noun = pack.nouns[n % pack.nouns.length];
  const writtenCue = `${pack.frame} ${pack.art} ${n}. ${noun}.`;
  const answer = `${pack.frame} ${pack.art} ${ord} ${noun}.`;
  const wrongSuffix = n < 20 ? `${ord.replace(/te$/, "ste")}` : `${ord.replace(/ste$/, "te")}`;
  const distractors = unique([
    `${pack.frame} ${pack.art} ${cardinalForm(n)} ${noun}.`,
    `${pack.frame} ${pack.art} ${wrongSuffix} ${noun}.`,
    `${pack.frame} ${pack.art} ${ord}en ${noun}.`,
  ]).filter((d) => d !== answer);
  const difficulty = opts.difficulty || "assisted";
  return {
    id: `ex.numbers.sentence.ordinal.${n}.${noun}`,
    templateId: "numbers.sentence.ordinal",
    territoryId: "numbers",
    mode: difficulty,
    target: { kind: "sentence-ordinal", n, lemma: noun },
    scaffolding: {
      mode: difficulty,
      showEnglish: difficulty === "assisted",
      showHintButton: true,
      showReferenceButton: true,
      allowRetryWrongChoice: true,
    },
    prompt: {
      kind: "sentence-ordinal",
      written: writtenCue,
      ask: "Read the sentence aloud in German",
      english: meta.english || "",
      lemma: noun,
    },
    materials: {
      form: answer,
      choices: shuffle([answer, ...distractors.slice(0, 3)]),
      // Help Vocab: spoken ordinal + frame noun — not the MC sentence strings.
      parts: [ord],
      hint: "Turn the written ordinal (12.) into the spoken form inside the sentence.",
    },
    resolution: {
      kind: "sentence-ordinal",
      form: answer,
      n,
      written: writtenCue,
      lemma: noun,
    },
  };
}

/** Nouns proofread: statement with article — Richtig/Falsch. */
export function makeNounProofreadChoices(correctArticle, lemma) {
  const arts = ["der", "die", "das"];
  const isCorrect = Math.random() > 0.45;
  const shown = isCorrect
    ? correctArticle
    : arts.filter((a) => a !== correctArticle)[Math.floor(Math.random() * 2)];
  return {
    statement: `${shown} ${lemma}`,
    shownArticle: shown,
    correctArticle,
    answer: isCorrect ? "Richtig" : "Falsch",
    isCorrect,
    options: ["Richtig", "Falsch"],
  };
}

/**
 * Reverse MC: article shown → pick the matching lemma.
 * @param {string} targetLemma
 * @param {string} targetArticle
 * @param {{ lemma: string, article: string }[]} candidates
 */
export function makeNounReverseChoices(targetLemma, targetArticle, candidates) {
  const wrongPool = shuffle(
    (candidates || []).filter(
      (c) => c.lemma !== targetLemma && c.article !== targetArticle
    )
  );
  const wrong = wrongPool.slice(0, 2).map((c) => c.lemma);
  while (wrong.length < 2) {
    const filler = (candidates || []).find(
      (c) => c.lemma !== targetLemma && !wrong.includes(c.lemma)
    );
    if (!filler) break;
    wrong.push(filler.lemma);
  }
  return {
    promptArticle: targetArticle,
    answer: targetLemma,
    options: shuffle([targetLemma, ...wrong]),
  };
}
