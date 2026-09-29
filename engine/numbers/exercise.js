/**
 * Exercise shells derived from engine truth (presentation may decorate further).
 */

import { cardinalAnalysis, constructionParts } from "./cardinal.js";
import { TENS, COMPOUND_ONES, TEEN_PREFIX, ATOMIC } from "./data.js";
import { decimalAnalysis, moneyAnalysis } from "./decimal.js";
import {
  fractionAnalysis,
  mixedFractionAnalysis,
} from "./fraction.js";
import {
  clockAnalysis,
  digitalTimeAnalysis,
  durationAnalysis,
} from "./time.js";
import { ordinalAnalysis, ordinalAmAnalysis } from "./ordinal.js";
import {
  weekdayAnalysis,
  monthAnalysis,
  calendarDateAnalysis,
} from "./date.js";
import { measureAnalysis } from "./measure.js";

function unique(list) {
  return [...new Set(list)];
}

function distractorsFor(n, parts, grain) {
  const analysis = cardinalAnalysis(n);
  const pool = [];

  if (analysis.kind === "compound") {
    const tensDigit = Math.floor(n / 10);
    const onesDigit = n % 10;
    // Nearby wrong pieces — avoid offering the fused tens word next to a morph split
    // (e.g. neunzig beside neun+zig confuses the tray).
    const altTens = TENS[((tensDigit + 1 - 2) % 8) + 2];
    if (altTens && !parts.includes(altTens) && grain !== "morph") {
      pool.push(altTens);
    }
    if (onesDigit >= 2) pool.push(ATOMIC[onesDigit]);
    pool.push("zehn");
    pool.push(COMPOUND_ONES[((onesDigit % 9) + 1)]);
    if (grain === "morph") {
      pool.push("acht");
      pool.push("neunzehn");
    }
  } else if (analysis.kind === "teen") {
    pool.push("zehn");
    pool.push(ATOMIC[n - 10] || null);
    pool.push(TEEN_PREFIX[n === 16 ? 17 : 16] || "sech");
  } else if (analysis.kind === "tens") {
    pool.push("zig");
    pool.push(COMPOUND_ONES[Math.floor(n / 10)] || null);
  } else if (
    analysis.kind === "hundred" ||
    analysis.kind === "hundred+rem" ||
    analysis.kind === "thousand"
  ) {
    pool.push("tausend");
    pool.push("hundert");
    pool.push("zehn");
    pool.push("und");
    const h = Math.floor(n / 100) || 1;
    const altH = h === 9 ? 2 : h + 1;
    if (ATOMIC[altH]) pool.push(ATOMIC[altH]);
    if (n !== 1000) pool.push("ein");
  } else {
    pool.push(ATOMIC[(n + 1) % 13]);
    pool.push("und");
  }

  return unique(pool.filter((x) => x && !parts.includes(x))).slice(0, 3);
}

function hintFor(n, grain) {
  const a = cardinalAnalysis(n);
  if (a.kind === "compound") {
    if (grain === "morph") {
      return `${a.segments.morph.join(" + ")}. Reuse stems when the tens word splits.`;
    }
    return `Ones + und + tens: ${a.segments.construction.join(" + ")}.`;
  }
  if (a.kind === "teen") {
    return `Teen: ${a.segments.construction.join(" + ")}.`;
  }
  if (a.kind === "tens") {
    return `Tens word: ${a.form}.`;
  }
  if (a.kind === "thousand") {
    return `ein + tausend → ${a.form}.`;
  }
  if (a.kind === "hundred" || a.kind === "hundred+rem") {
    return `Hundreds first, then the 0–99 tail: ${a.segments.construction.join(" + ")}.`;
  }
  return `Atomic form: ${a.form}.`;
}

/**
 * @param {number} n
 * @param {{ grain?: "construction" | "morph", english?: string }} [opts]
 */
export function constructionExercise(n, opts = {}) {
  const grain = opts.grain === "morph" ? "morph" : "construction";
  const analysis = cardinalAnalysis(n);
  const parts = constructionParts(n, { grain });
  return {
    value: n,
    form: analysis.form,
    kind: analysis.kind,
    grain,
    parts,
    distractors: distractorsFor(n, parts, grain),
    hint: hintFor(n, grain),
    rules: analysis.rules,
    english: opts.english || "",
  };
}

function decimalDistractors(parts) {
  const pool = ["Punkt", "und", "zehn", "zig", ATOMIC[0], ATOMIC[1], "Cent", "Euro"];
  return unique(pool.filter((x) => x && !parts.includes(x))).slice(0, 3);
}

/**
 * @param {number} whole
 * @param {number[]} fracDigits
 * @param {{ grain?: string, english?: string }} [opts]
 */
export function decimalExercise(whole, fracDigits, opts = {}) {
  const grain = opts.grain === "spoken" ? "spoken" : "construction";
  const a = decimalAnalysis(whole, fracDigits);
  const parts =
    grain === "spoken" ? [...a.segments.spoken] : [...a.segments.construction];
  return {
    whole,
    fracDigits: [...fracDigits],
    written: a.written,
    englishWritten: a.englishWritten,
    form: a.form,
    kind: "decimal",
    grain,
    parts,
    distractors: decimalDistractors(parts),
    hint: `Komma (not Punkt): ${parts.join(" + ")}. Digits after Komma are read one by one.`,
    rules: a.rules,
    english: opts.english || a.englishWritten,
  };
}

/**
 * @param {number} euros
 * @param {number} cents
 * @param {{ grain?: string, english?: string }} [opts]
 */
export function moneyExercise(euros, cents, opts = {}) {
  const grain = opts.grain === "spoken" ? "spoken" : "construction";
  const a = moneyAnalysis(euros, cents);
  const parts =
    grain === "spoken" ? [...a.segments.spoken] : [...a.segments.construction];
  return {
    euros,
    cents,
    written: a.written,
    englishWritten: a.englishWritten,
    form: a.form,
    kind: "money",
    grain,
    parts,
    distractors: decimalDistractors(parts),
    hint:
      cents === 0
        ? `${parts.join(" + ")} — whole euros.`
        : `${parts.join(" + ")} — cents as a cardinal after Euro (not digit-by-digit).`,
    rules: a.rules,
    english: opts.english || a.englishWritten,
  };
}

function fractionDistractors(parts) {
  const pool = [
    "Punkt",
    "Komma",
    "und",
    "halb",
    "Viertel",
    "Drittel",
    "Fünftel",
    "zehn",
    "zig",
    "Uhr",
    ATOMIC[2],
    ATOMIC[3],
  ];
  return unique(pool.filter((x) => x && !parts.includes(x))).slice(0, 3);
}

/**
 * @param {number} numerator
 * @param {number} denominator
 * @param {{ english?: string }} [opts]
 */
export function fractionExercise(numerator, denominator, opts = {}) {
  const a = fractionAnalysis(numerator, denominator);
  const parts = [...a.segments.construction];
  return {
    numerator,
    denominator,
    written: a.written,
    englishWritten: a.englishWritten,
    form: a.form,
    kind: a.kind,
    grain: "construction",
    parts,
    distractors: fractionDistractors(parts),
    hint: `${parts.join(" + ")} — fraction noun after the numerator.`,
    rules: a.rules,
    english: opts.english || a.englishWritten,
  };
}

/**
 * @param {number} whole
 * @param {number} numerator
 * @param {number} denominator
 * @param {{ english?: string }} [opts]
 */
export function mixedFractionExercise(whole, numerator, denominator, opts = {}) {
  const a = mixedFractionAnalysis(whole, numerator, denominator);
  const parts = [...a.segments.construction];
  return {
    whole,
    numerator,
    denominator,
    written: a.written,
    englishWritten: a.englishWritten,
    form: a.form,
    kind: a.kind,
    grain: "construction",
    parts,
    distractors: fractionDistractors(parts),
    hint:
      a.kind === "fraction-mixed-half"
        ? `${a.form} — fused …einhalb for N + 1/2.`
        : `${parts.join(" + ")} — whole + und + fraction.`,
    rules: a.rules,
    english: opts.english || a.englishWritten,
  };
}

function timeDistractors(parts) {
  const pool = [
    "Punkt",
    "Komma",
    "und",
    "nach",
    "vor",
    "halb",
    "Viertel",
    "Uhr",
    "Stunde",
    "Minute",
    ATOMIC[3],
    ATOMIC[4],
  ];
  return unique(pool.filter((x) => x && !parts.includes(x))).slice(0, 3);
}

/**
 * @param {number} hours
 * @param {number} minutes
 * @param {{ english?: string }} [opts]
 */
export function clockExercise(hours, minutes, opts = {}) {
  const a = clockAnalysis(hours, minutes);
  const parts = [...a.segments.construction];
  return {
    hours,
    minutes,
    written: a.written,
    englishWritten: a.englishWritten,
    form: a.form,
    kind: a.kind,
    grain: "construction",
    parts,
    distractors: timeDistractors(parts),
    hint: `${parts.join(" + ")} — colloquial clock (halb / Viertel / nach / vor).`,
    rules: a.rules,
    english: opts.english || a.englishWritten,
  };
}

/**
 * @param {number} hours
 * @param {number} minutes
 * @param {{ english?: string }} [opts]
 */
export function digitalTimeExercise(hours, minutes, opts = {}) {
  const a = digitalTimeAnalysis(hours, minutes);
  const parts = [...a.segments.construction];
  return {
    hours,
    minutes,
    written: a.written,
    englishWritten: a.englishWritten,
    form: a.form,
    kind: a.kind,
    grain: "construction",
    parts,
    distractors: timeDistractors(parts),
    hint: `${parts.join(" + ")} — digital / 24h: hour + Uhr + minutes.`,
    rules: a.rules,
    english: opts.english || a.englishWritten,
  };
}

/**
 * @param {{ hours?: number, minutes?: number }} dur
 * @param {{ english?: string }} [opts]
 */
export function durationExercise(dur, opts = {}) {
  const a = durationAnalysis(dur);
  const parts = [...a.segments.construction];
  return {
    hours: a.hours,
    minutes: a.minutes,
    written: a.written,
    englishWritten: a.englishWritten,
    form: a.form,
    kind: a.kind,
    grain: "construction",
    parts,
    distractors: timeDistractors(parts),
    hint: `${parts.join(" + ")} — how long (Stunde(n) / Minute(n)).`,
    rules: a.rules,
    english: opts.english || a.englishWritten,
  };
}

function ordinalDistractors(parts) {
  const pool = ["te", "ste", "und", "am", "der", "die", "zehn", "zig", "erste", "dritte"];
  return unique(pool.filter((x) => x && !parts.includes(x))).slice(0, 3);
}

/**
 * @param {number} n
 * @param {{ english?: string }} [opts]
 */
export function ordinalExercise(n, opts = {}) {
  const a = ordinalAnalysis(n);
  const parts = [...a.segments.construction];
  return {
    n,
    written: a.written,
    englishWritten: a.englishWritten,
    form: a.form,
    kind: a.kind,
    grain: "construction",
    parts,
    distractors: ordinalDistractors(parts),
    hint: `${parts.join(" + ")} — ordinal: stem + te (<20) or ste (≥20).`,
    rules: a.rules,
    english: opts.english || a.englishWritten,
  };
}

/**
 * @param {number} n
 * @param {{ english?: string }} [opts]
 */
export function ordinalAmExercise(n, opts = {}) {
  const a = ordinalAmAnalysis(n);
  const parts = [...a.segments.construction];
  return {
    n,
    written: a.written,
    englishWritten: a.englishWritten,
    form: a.form,
    kind: a.kind,
    grain: "construction",
    parts,
    distractors: ordinalDistractors(parts),
    hint: `${parts.join(" + ")} — am + dative ordinal (-en).`,
    rules: a.rules,
    english: opts.english || a.englishWritten,
  };
}

function dateDistractors(parts) {
  const pool = ["am", "Uhr", "Montag", "Januar", "März", "te", "ste", "und", "der"];
  return unique(pool.filter((x) => x && !parts.includes(x))).slice(0, 3);
}

/**
 * @param {number} index — 0–6
 * @param {{ english?: string }} [opts]
 */
export function weekdayExercise(index, opts = {}) {
  const a = weekdayAnalysis(index);
  const parts = [...a.segments.construction];
  return {
    index,
    written: a.written,
    englishWritten: a.englishWritten,
    form: a.form,
    kind: a.kind,
    grain: "construction",
    parts,
    distractors: dateDistractors(parts),
    hint: `Weekday: ${a.form}.`,
    rules: a.rules,
    english: opts.english || a.englishWritten,
  };
}

/**
 * @param {number} month — 1–12
 * @param {{ english?: string }} [opts]
 */
export function monthExercise(month, opts = {}) {
  const a = monthAnalysis(month);
  const parts = [...a.segments.construction];
  return {
    month,
    written: a.written,
    englishWritten: a.englishWritten,
    form: a.form,
    kind: a.kind,
    grain: "construction",
    parts,
    distractors: dateDistractors(parts),
    hint: `Month: ${a.form}.`,
    rules: a.rules,
    english: opts.english || a.englishWritten,
  };
}

/**
 * @param {{ day: number, month: number, year?: number }} date
 * @param {{ english?: string }} [opts]
 */
export function calendarDateExercise(date, opts = {}) {
  const a = calendarDateAnalysis(date);
  const parts = [...a.segments.construction];
  return {
    day: a.day,
    month: a.month,
    year: a.year,
    written: a.written,
    englishWritten: a.englishWritten,
    form: a.form,
    kind: a.kind,
    grain: "construction",
    parts,
    distractors: dateDistractors(parts),
    hint: `${parts.join(" + ")} — am + day + month.`,
    rules: a.rules,
    english: opts.english || a.englishWritten,
  };
}

function measureDistractors(parts) {
  const pool = [
    "Meter",
    "Kilometer",
    "Gramm",
    "Liter",
    "Grad",
    "Uhr",
    "Euro",
    "und",
    "zehn",
  ];
  return unique(pool.filter((x) => x && !parts.includes(x))).slice(0, 3);
}

/**
 * @param {number} value
 * @param {string} unit
 * @param {{ english?: string }} [opts]
 */
export function measureExercise(value, unit, opts = {}) {
  const a = measureAnalysis(value, unit);
  const parts = [...a.segments.construction];
  return {
    value,
    unit,
    written: a.written,
    englishWritten: a.englishWritten,
    form: a.form,
    kind: a.kind,
    grain: "construction",
    parts,
    distractors: measureDistractors(parts),
    hint: `${parts.join(" + ")} — number + unit.`,
    rules: a.rules,
    english: opts.english || a.englishWritten,
  };
}
