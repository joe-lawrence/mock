/**
 * Exercise shells derived from engine truth (presentation may decorate further).
 */

import { cardinalAnalysis, constructionParts } from "./cardinal.js";
import { TENS, COMPOUND_ONES, TEEN_PREFIX, ATOMIC } from "./data.js";
import { decimalAnalysis, moneyAnalysis } from "./decimal.js";

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
