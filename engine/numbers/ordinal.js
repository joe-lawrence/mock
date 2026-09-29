/**
 * Deterministic German ordinals 1–99 (citation -e forms) + am + -en date forms.
 */

import { COMPOUND_ONES, TENS, TEEN_PREFIX } from "./data.js";

/** Irregular / high-frequency ordinal stems (citation -e). */
const SPECIAL = Object.freeze({
  1: "erste",
  3: "dritte",
  7: "siebte",
  8: "achte",
});

function assertOrdinal(n) {
  if (!Number.isInteger(n) || n < 1 || n > 99) {
    throw new RangeError(`ordinal out of range 1–99: ${n}`);
  }
}

/** Written German ordinal: "3." */
export function ordinalWritten(n) {
  assertOrdinal(n);
  return `${n}.`;
}

/** English gloss: "3rd", "12th". */
function englishOrdinal(n) {
  const mod100 = n % 100;
  const mod10 = n % 10;
  const suf =
    mod100 >= 11 && mod100 <= 13
      ? "th"
      : mod10 === 1
        ? "st"
        : mod10 === 2
          ? "nd"
          : mod10 === 3
            ? "rd"
            : "th";
  return `${n}${suf}`;
}

/**
 * Bare ordinal citation form (erste, zwanzigste, einundzwanzigste).
 * Construction splits productive stem + te/ste; irregulars stay atomic.
 * @param {number} n — 1–99
 */
export function ordinalAnalysis(n) {
  assertOrdinal(n);
  const written = ordinalWritten(n);
  const englishWritten = englishOrdinal(n);

  if (SPECIAL[n]) {
    const form = SPECIAL[n];
    return {
      n,
      kind: "ordinal-special",
      form,
      written,
      englishWritten,
      segments: { construction: [form], spoken: [form] },
      rules: [`ordinal.special.${n}`],
    };
  }

  if (n <= 12) {
    // zweite, vierte, … zwölfte — atomic stem + te as one chip for 2,4–6,9–12
    const stem =
      n === 2
        ? "zwei"
        : n === 4
          ? "vier"
          : n === 5
            ? "fünf"
            : n === 6
              ? "sechs"
              : n === 9
                ? "neun"
                : n === 10
                  ? "zehn"
                  : n === 11
                    ? "elf"
                    : "zwölf";
    const form = `${stem}te`;
    return {
      n,
      kind: "ordinal-base",
      form,
      written,
      englishWritten,
      segments: { construction: [stem, "te"], spoken: [form] },
      rules: [`ordinal.base.${n}`, "ordinal.suffix.te"],
    };
  }

  if (n >= 13 && n <= 19) {
    const prefix = TEEN_PREFIX[n];
    const form = `${prefix}zehnte`;
    return {
      n,
      kind: "ordinal-teen",
      form,
      written,
      englishWritten,
      segments: {
        construction: [prefix, "zehn", "te"],
        spoken: [form],
      },
      rules: [`ordinal.teen.${n}`, "ordinal.suffix.te"],
    };
  }

  const tensDigit = Math.floor(n / 10);
  const onesDigit = n % 10;
  const tensWord = TENS[tensDigit];

  if (onesDigit === 0) {
    const form = `${tensWord}ste`;
    return {
      n,
      kind: "ordinal-tens",
      form,
      written,
      englishWritten,
      segments: {
        construction: [tensWord, "ste"],
        spoken: [form],
      },
      rules: [`ordinal.tens.${n}`, "ordinal.suffix.ste"],
    };
  }

  const ones = COMPOUND_ONES[onesDigit];
  const form = `${ones}und${tensWord}ste`;
  return {
    n,
    kind: "ordinal-compound",
    form,
    written,
    englishWritten,
    segments: {
      construction: [ones, "und", tensWord, "ste"],
      spoken: [form],
    },
    rules: ["ordinal.compound", "ordinal.suffix.ste", `tens.${tensDigit}0`],
  };
}

export function ordinalForm(n) {
  return ordinalAnalysis(n).form;
}

export function ordinalParts(n) {
  return [...ordinalAnalysis(n).segments.construction];
}

/** Dative -en form used after am: ersten, dritten, zwanzigsten. */
export function ordinalDativeForm(n) {
  const bare = ordinalForm(n);
  if (bare.endsWith("e")) return `${bare}n`;
  return `${bare}en`;
}

/**
 * Date-bridge: "am dritten"
 * @param {number} n — day of month 1–31 (ordinal engine caps at 99; days 1–31)
 */
export function ordinalAmAnalysis(n) {
  if (!Number.isInteger(n) || n < 1 || n > 31) {
    throw new RangeError(`ordinal day out of range 1–31: ${n}`);
  }
  assertOrdinal(n);
  const dative = ordinalDativeForm(n);
  const parts = ["am", dative];
  return {
    n,
    kind: "ordinal-am",
    form: parts.join(" "),
    // Cue is bare "12." — do not leak "am" in the prompt lead.
    written: ordinalWritten(n),
    englishWritten: `on the ${englishOrdinal(n)}`,
    segments: { construction: parts, spoken: parts },
    rules: ["ordinal.am", ...ordinalAnalysis(n).rules],
  };
}

export function ordinalAmForm(n) {
  return ordinalAmAnalysis(n).form;
}

export function ordinalAmParts(n) {
  return [...ordinalAmAnalysis(n).segments.construction];
}

/**
 * Parse ordinal speech / written "3." → n or null.
 * @param {string} raw
 */
export function parseOrdinalForm(raw) {
  if (raw == null) return null;
  const s = String(raw)
    .trim()
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/\s+/g, "");
  if (!s) return null;

  const written = s.match(/^(\d+)\.?$/);
  if (written) {
    const n = Number(written[1]);
    if (n >= 1 && n <= 99) return n;
    return null;
  }

  for (let n = 1; n <= 99; n++) {
    const form = ordinalForm(n).toLowerCase().replace(/ß/g, "ss").replace(/\s+/g, "");
    if (form === s) return n;
    const dative = ordinalDativeForm(n)
      .toLowerCase()
      .replace(/ß/g, "ss")
      .replace(/\s+/g, "");
    if (dative === s) return n;
    if (`am${dative}` === s) return n;
  }
  return null;
}
