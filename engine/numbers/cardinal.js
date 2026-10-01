/**
 * Deterministic German cardinal forms 0–1000 (hundreds + eintausend).
 */

import {
  ATOMIC,
  COMPOUND_ONES,
  TEEN_PREFIX,
  TENS,
  TENS_MORPH,
  DATA_VERSION,
} from "./data.js";

export const ENGINE_VERSION = "0.2.0";
export { DATA_VERSION };

function assertInt(n) {
  if (!Number.isInteger(n) || n < 0 || n > 1000) {
    throw new RangeError(`cardinal out of range 0–1000: ${n}`);
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

  if (n === 1000) {
    return {
      n,
      form: "eintausend",
      kind: "thousand",
      segments: {
        construction: ["ein", "tausend"],
        morph: ["ein", "tausend"],
      },
      rules: ["thousand.1000"],
    };
  }

  if (n >= 100) {
    const h = Math.floor(n / 100);
    const rem = n % 100;
    const hStem = h === 1 ? "ein" : ATOMIC[h];
    const head = [hStem, "hundert"];
    if (rem === 0) {
      return {
        n,
        form: head.join(""),
        kind: "hundred",
        segments: {
          construction: [...head],
          morph: [...head],
        },
        rules: [`hundreds.${h}00`],
      };
    }
    const remA = cardinalAnalysis(rem);
    return {
      n,
      form: head.join("") + remA.form,
      kind: "hundred+rem",
      segments: {
        construction: [...head, ...remA.segments.construction],
        morph: [...head, ...remA.segments.morph],
      },
      rules: [`hundreds.${h}00`, ...remA.rules],
    };
  }

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
      rules: [
        `teen.${n}`,
        n === 16 ? "shorten.sechs→sech" : null,
        n === 17 ? "shorten.sieben→sieb" : null,
      ].filter(Boolean),
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
 * Parse a written cardinal (0–1000) back to an integer.
 * Accepts optional spaces; case-insensitive.
 * @param {string} raw
 * @returns {number | null}
 */
export function parseCardinalForm(raw) {
  if (raw == null) return null;
  const s = String(raw)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/ß/g, "ss");
  if (!s) return null;

  for (let n = 0; n <= 1000; n++) {
    const form = cardinalForm(n).toLowerCase().replace(/ß/g, "ss");
    if (form === s) return n;
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
