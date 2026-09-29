/**
 * Extra Numbers quiz shells imported from the old level1 patterns:
 * cloze, proofread, visual (pie/clock), sentence ordinals.
 */

import { cardinalForm, constructionParts } from "../engine/numbers/index.js?v=20260929-dmo4";

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
  if (s.includes("ß")) variants.push(s.replace(/ß/g, "ss"));
  if (s.includes("ss") && !s.includes("ß")) variants.push(s.replace(/ss/, "ß"));
  if (s.includes("und")) variants.push(s.replace("und", ""));
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
  variants.push(s + "en");
  variants.push(s.replace(/e$/, "en") || s + "n");
  const pick = variants.find((v) => v && v !== s);
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
  return {
    id: `ex.numbers.proofread.${meta.written || meta.value || form}`,
    templateId: "numbers.proofread.fix",
    territoryId: "numbers",
    mode: difficulty,
    target: { kind: "proofread" },
    scaffolding: {
      mode: difficulty,
      showEnglish: difficulty === "assisted",
      showHintButton: true,
      showReferenceButton: true,
      allowRetryWrongChoice: true,
    },
    prompt: {
      kind: "proofread-fix",
      wrong,
      written: meta.written || (meta.value != null ? String(meta.value) : ""),
      english: meta.english || "",
      ask: "Fix the spelling",
    },
    materials: {
      form,
      wrong,
      hint: "One piece is wrong — type the correct German form.",
    },
    resolution: {
      kind: "proofread",
      form,
      wrong,
      value: meta.value,
      written: meta.written,
      whole: meta.whole,
      fracDigits: meta.fracDigits,
      numerator: meta.numerator,
      denominator: meta.denominator,
      n: meta.n,
      hours: meta.hours,
      minutes: meta.minutes,
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
    ticks += `<line x1="64" y1="12" x2="64" y2="${12 + (major ? 8 : 4)}" stroke="currentColor" stroke-width="${major ? 3 : 1.5}" stroke-linecap="round" transform="rotate(${t * 30} 64 64)"/>`;
  }
  return `<svg class="quiz-visual-svg" viewBox="0 0 128 128" width="128" height="128" aria-hidden="true">
    <circle cx="64" cy="64" r="58" fill="#fff" stroke="currentColor" stroke-width="4"/>
    ${ticks}
    <line x1="64" y1="64" x2="64" y2="34" stroke="currentColor" stroke-width="4" stroke-linecap="round" transform="rotate(${hourDeg} 64 64)"/>
    <line x1="64" y1="64" x2="64" y2="20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" transform="rotate(${minuteDeg} 64 64)"/>
    <circle cx="64" cy="64" r="4" fill="currentColor"/>
  </svg>`;
}

/**
 * Visual HTML for fraction / clock metas. Null if unsupported.
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
      ask: "Name the fraction shown",
      lead: "",
    };
  }
  // pool metas use kind: "fraction"
  if (meta?.kind === "fraction" && meta.numerator != null) {
    return {
      html: pieSvg(meta.numerator, meta.denominator),
      ask: "Name the fraction shown",
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
      ask: "State the time on the clock",
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
    target: { kind: "sentence-ordinal", n },
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
    },
    materials: {
      form: answer,
      choices: shuffle([answer, ...distractors.slice(0, 3)]),
      hint: "Turn the written ordinal (12.) into the spoken form inside the sentence.",
    },
    resolution: {
      kind: "sentence-ordinal",
      form: answer,
      n,
      written: writtenCue,
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
