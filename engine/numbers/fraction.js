/**
 * Deterministic German fraction forms (halb, -tel, proper, mixed).
 * Construction chips prefer productive splits; lexical halves stay atomic.
 */

import { cardinalForm, constructionParts, parseCardinalForm } from "./cardinal.js";

/** Denominator → fraction noun (neuter -tel). 2 is special (halb). */
export const FRACTION_NOUNS = Object.freeze({
  2: "halb",
  3: "Drittel",
  4: "Viertel",
  5: "Fünftel",
  6: "Sechstel",
  7: "Siebtel",
  8: "Achtel",
  9: "Neuntel",
  10: "Zehntel",
  11: "Elftel",
  12: "Zwölftel",
});

/**
 * @param {number} numerator — ≥ 1
 * @param {number} denominator — 2–12
 */
function assertFraction(numerator, denominator) {
  if (!Number.isInteger(numerator) || numerator < 1 || numerator > 20) {
    throw new RangeError(`fraction numerator out of range: ${numerator}`);
  }
  if (!Number.isInteger(denominator) || denominator < 2 || denominator > 12) {
    throw new RangeError(`fraction denominator out of range: ${denominator}`);
  }
  if (!FRACTION_NOUNS[denominator]) {
    throw new RangeError(`unsupported denominator: ${denominator}`);
  }
  if (numerator >= denominator && denominator !== 2) {
    // proper fractions only for non-mixed helper
  }
}

/**
 * Proper / unit fraction (numerator < denominator), or halb/Viertel lexical.
 * @param {number} numerator
 * @param {number} denominator
 */
export function fractionAnalysis(numerator, denominator) {
  assertFraction(numerator, denominator);
  if (numerator >= denominator) {
    throw new RangeError(
      `use mixedFractionAnalysis for improper ${numerator}/${denominator}`
    );
  }

  const noun = FRACTION_NOUNS[denominator];

  // 1/2 → halb (high-frequency lexical)
  if (numerator === 1 && denominator === 2) {
    return {
      numerator,
      denominator,
      kind: "fraction-half",
      form: "halb",
      written: "1/2",
      englishWritten: "1/2",
      segments: { construction: ["halb"], spoken: ["halb"] },
      rules: ["fraction.halb"],
    };
  }

  // 1/n → ein + noun (ein Viertel, ein Drittel, …)
  if (numerator === 1) {
    const parts = ["ein", noun];
    return {
      numerator,
      denominator,
      kind: "fraction-unit",
      form: parts.join(" "),
      written: `1/${denominator}`,
      englishWritten: `1/${denominator}`,
      segments: { construction: parts, spoken: parts },
      rules: ["fraction.unit", `fraction.den.${denominator}`],
    };
  }

  // m/n → cardinal + noun
  const numParts = constructionParts(numerator);
  const parts = [...numParts, noun];
  return {
    numerator,
    denominator,
    kind: "fraction-proper",
    form: parts.join(" "),
    written: `${numerator}/${denominator}`,
    englishWritten: `${numerator}/${denominator}`,
    segments: { construction: parts, spoken: [cardinalForm(numerator), noun] },
    rules: ["fraction.proper", `fraction.den.${denominator}`],
  };
}

export function fractionForm(numerator, denominator) {
  return fractionAnalysis(numerator, denominator).form;
}

export function fractionParts(numerator, denominator) {
  return [...fractionAnalysis(numerator, denominator).segments.construction];
}

/**
 * Mixed number: whole + proper fraction.
 * Special: N + 1/2 → eineinhalb / zweieinhalb / …
 * @param {number} whole — ≥ 1
 * @param {number} numerator
 * @param {number} denominator
 */
export function mixedFractionAnalysis(whole, numerator, denominator) {
  if (!Number.isInteger(whole) || whole < 1 || whole > 20) {
    throw new RangeError(`mixed whole out of range: ${whole}`);
  }
  assertFraction(numerator, denominator);
  if (numerator >= denominator) {
    throw new RangeError(`fraction part must be proper: ${numerator}/${denominator}`);
  }

  // …einhalb
  if (numerator === 1 && denominator === 2) {
    const form =
      whole === 1
        ? "eineinhalb"
        : whole === 2
          ? "zweieinhalb"
          : whole === 3
            ? "dreieinhalb"
            : whole === 4
              ? "viereinhalb"
              : whole === 5
                ? "füneinhalb"
                : whole === 6
                  ? "sechseinhalb"
                  : whole === 7
                    ? "siebeneinhalb"
                    : whole === 8
                      ? "achteinhalb"
                      : whole === 9
                        ? "neuneinhalb"
                        : whole === 10
                          ? "zehneinhalb"
                          : `${cardinalForm(whole)}einhalb`;
    return {
      whole,
      numerator,
      denominator,
      kind: "fraction-mixed-half",
      form,
      written: `${whole} 1/2`,
      englishWritten: `${whole} 1/2`,
      segments: { construction: [form], spoken: [form] },
      rules: ["fraction.mixed.halb", `fraction.whole.${whole}`],
    };
  }

  const frac = fractionAnalysis(numerator, denominator);
  const wholeParts = constructionParts(whole);
  const parts = [...wholeParts, "und", ...frac.segments.construction];
  return {
    whole,
    numerator,
    denominator,
    kind: "fraction-mixed",
    form: parts.join(" "),
    written: `${whole} ${numerator}/${denominator}`,
    englishWritten: `${whole} ${numerator}/${denominator}`,
    segments: {
      construction: parts,
      spoken: [cardinalForm(whole), "und", ...frac.segments.spoken],
    },
    rules: ["fraction.mixed", ...frac.rules],
  };
}

export function mixedFractionForm(whole, numerator, denominator) {
  return mixedFractionAnalysis(whole, numerator, denominator).form;
}

export function mixedFractionParts(whole, numerator, denominator) {
  return [
    ...mixedFractionAnalysis(whole, numerator, denominator).segments.construction,
  ];
}

/**
 * Parse simple fraction speech → { kind, ... } or null.
 * @param {string} raw
 */
export function parseFractionForm(raw) {
  if (raw == null) return null;
  const s = String(raw)
    .trim()
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/\s+/g, " ");
  if (!s) return null;

  if (s === "halb") return { kind: "fraction", numerator: 1, denominator: 2 };

  const halfMixed = {
    eineinhalb: 1,
    zweieinhalb: 2,
    dreieinhalb: 3,
    viereinhalb: 4,
    funeinhalb: 5,
    füneinhalb: 5,
    sechseinhalb: 6,
    siebeneinhalb: 7,
    achteinhalb: 8,
    neuneinhalb: 9,
    zehneinhalb: 10,
  };
  if (halfMixed[s] != null) {
    return {
      kind: "mixed",
      whole: halfMixed[s],
      numerator: 1,
      denominator: 2,
    };
  }

  // mixed: "drei und ein viertel"
  const und = s.match(/^(.+) und (.+)$/);
  if (und) {
    const whole = parseCardinalForm(und[1].replace(/\s+/g, ""));
    const frac = parseFractionForm(und[2]);
    if (whole != null && whole >= 1 && frac?.kind === "fraction") {
      return {
        kind: "mixed",
        whole,
        numerator: frac.numerator,
        denominator: frac.denominator,
      };
    }
  }

  for (const [den, noun] of Object.entries(FRACTION_NOUNS)) {
    if (Number(den) === 2) continue;
    const n = noun.toLowerCase().replace(/ß/g, "ss");
    if (s === `ein ${n}`) {
      return { kind: "fraction", numerator: 1, denominator: Number(den) };
    }
    const m = s.match(new RegExp(`^(.+) ${n}$`));
    if (m) {
      const num = parseCardinalForm(m[1].replace(/\s+/g, ""));
      if (num != null && num >= 1) {
        return { kind: "fraction", numerator: num, denominator: Number(den) };
      }
    }
  }
  return null;
}
