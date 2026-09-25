/**
 * Exercise shells derived from engine truth (presentation may decorate further).
 */

import { cardinalAnalysis, constructionParts } from "./cardinal.js";
import { TENS, COMPOUND_ONES, TEEN_PREFIX, ATOMIC } from "./data.js";

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
