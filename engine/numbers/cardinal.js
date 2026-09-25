/**
 * Deterministic German cardinal forms 0–99.
 */

import {
  ATOMIC,
  COMPOUND_ONES,
  TEEN_PREFIX,
  TENS,
  TENS_MORPH,
  DATA_VERSION,
} from "./data.js";

export const ENGINE_VERSION = "0.1.0";
export { DATA_VERSION };

function assertInt(n) {
  if (!Number.isInteger(n) || n < 0 || n > 99) {
    throw new RangeError(`cardinal out of range 0–99: ${n}`);
  }
}

/**
 * @param {number} n
 * @returns {string}
 */
export function cardinalForm(n) {
  return cardinalAnalysis(n).form;
}

/**
 * Full analysis: orthography, kind, segments, firing rule ids.
 * @param {number} n
 */
export function cardinalAnalysis(n) {
  assertInt(n);

  if (n <= 12) {
    const form = ATOMIC[n];
    return {
      n,
      form,
      kind: "atomic",
      segments: {
        construction: [form],
        morph: [form],
      },
      rules: [`atomic.${n}`],
    };
  }

  if (n >= 13 && n <= 19) {
    const prefix = TEEN_PREFIX[n];
    const form = prefix + "zehn";
    return {
      n,
      form,
      kind: "teen",
      segments: {
        construction: [prefix, "zehn"],
        morph: [prefix, "zehn"],
      },
      rules: [`teen.${n}`, n === 16 ? "shorten.sechs→sech" : null, n === 17 ? "shorten.sieben→sieb" : null].filter(Boolean),
    };
  }

  const tensDigit = Math.floor(n / 10);
  const onesDigit = n % 10;
  const tensWord = TENS[tensDigit];
  const tensMorph = [...TENS_MORPH[tensDigit]];

  if (onesDigit === 0) {
    return {
      n,
      form: tensWord,
      kind: "tens",
      segments: {
        construction: [tensWord],
        morph: tensMorph,
      },
      rules: [`tens.${tensDigit}0`],
    };
  }

  const ones = COMPOUND_ONES[onesDigit];
  const form = ones + "und" + tensWord;
  return {
    n,
    form,
    kind: "compound",
    segments: {
      construction: [ones, "und", tensWord],
      morph: [ones, "und", ...tensMorph],
    },
    rules: [
      "compound.ones+und+tens",
      onesDigit === 1 ? "compound.eins→ein" : null,
      `tens.${tensDigit}0`,
    ].filter(Boolean),
  };
}

/**
 * Parse a written cardinal (0–99) back to an integer.
 * Accepts optional spaces; case-insensitive.
 * @param {string} raw
 * @returns {number | null}
 */
export function parseCardinalForm(raw) {
  if (raw == null) return null;
  const s = String(raw).trim().toLowerCase().replace(/\s+/g, "");
  if (!s) return null;

  for (let n = 0; n <= 99; n++) {
    if (cardinalForm(n) === s) return n;
  }
  return null;
}

/**
 * Parts for a construction exercise.
 * @param {number} n
 * @param {{ grain?: "construction" | "morph" }} [opts]
 * @returns {string[]}
 */
export function constructionParts(n, opts = {}) {
  const grain = opts.grain === "morph" ? "morph" : "construction";
  return [...cardinalAnalysis(n).segments[grain]];
}
