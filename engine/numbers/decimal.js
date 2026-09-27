/**
 * Deterministic German decimal (Komma) and money forms.
 * Spoken decimals: whole cardinal + "Komma" + digit-by-digit (not the frac as a cardinal).
 * Money: "… Euro" / "… Euro …" (cents as a cardinal; no "Cent" in the default short form).
 */

import { ATOMIC } from "./data.js";
import { cardinalForm, constructionParts, parseCardinalForm } from "./cardinal.js";

const KOMMA = "Komma";
const EURO = "Euro";

/**
 * Digit name for spoken decimal tails (0–9). Uses eins (not ein).
 * @param {number} d
 */
export function decimalDigitForm(d) {
  if (!Number.isInteger(d) || d < 0 || d > 9) {
    throw new RangeError(`decimal digit out of range 0–9: ${d}`);
  }
  return ATOMIC[d];
}

/**
 * @param {number} whole — integer ≥ 0 (cardinal range 0–1000)
 * @param {number[]} fracDigits — each 0–9, length ≥ 1
 */
function assertDecimal(whole, fracDigits) {
  if (!Number.isInteger(whole) || whole < 0 || whole > 1000) {
    throw new RangeError(`decimal whole out of range 0–1000: ${whole}`);
  }
  if (!Array.isArray(fracDigits) || fracDigits.length < 1 || fracDigits.length > 4) {
    throw new RangeError("fracDigits must be 1–4 digits");
  }
  for (const d of fracDigits) {
    if (!Number.isInteger(d) || d < 0 || d > 9) {
      throw new RangeError(`bad frac digit: ${d}`);
    }
  }
}

/**
 * Written German decimal (Komma, not Punkt).
 * @param {number} whole
 * @param {number[]} fracDigits
 */
export function decimalWritten(whole, fracDigits) {
  assertDecimal(whole, fracDigits);
  return `${whole},${fracDigits.join("")}`;
}

/**
 * English-style written form (Punkt) for glosses.
 * @param {number} whole
 * @param {number[]} fracDigits
 */
export function decimalEnglishWritten(whole, fracDigits) {
  assertDecimal(whole, fracDigits);
  return `${whole}.${fracDigits.join("")}`;
}

/**
 * @param {number} whole
 * @param {number[]} fracDigits
 */
export function decimalAnalysis(whole, fracDigits) {
  assertDecimal(whole, fracDigits);
  const wholeForm = cardinalForm(whole);
  const digitForms = fracDigits.map(decimalDigitForm);
  const spokenParts = [wholeForm, KOMMA, ...digitForms];
  /** Construction chips: split the whole, keep Komma + digits atomic. */
  const construction = [
    ...constructionParts(whole),
    KOMMA,
    ...digitForms,
  ];
  return {
    whole,
    fracDigits: [...fracDigits],
    written: decimalWritten(whole, fracDigits),
    englishWritten: decimalEnglishWritten(whole, fracDigits),
    form: spokenParts.join(" "),
    kind: "decimal",
    segments: {
      spoken: spokenParts,
      construction,
    },
    rules: ["decimal.komma", `decimal.whole.${whole}`, `decimal.frac.${fracDigits.length}`],
  };
}

export function decimalForm(whole, fracDigits) {
  return decimalAnalysis(whole, fracDigits).form;
}

export function decimalParts(whole, fracDigits, grain = "construction") {
  const a = decimalAnalysis(whole, fracDigits);
  return grain === "spoken" ? [...a.segments.spoken] : [...a.segments.construction];
}

/**
 * Parse spoken or spaced decimal reading → { whole, fracDigits } or null.
 * Accepts "drei Komma eins vier", case/spacing flexible.
 * @param {string} raw
 */
export function parseDecimalForm(raw) {
  if (raw == null) return null;
  const s = String(raw)
    .trim()
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/\s+/g, " ");
  if (!s) return null;

  const m = s.match(/^(.*?)\s+komma\s+(.+)$/);
  if (!m) return null;
  const wholeRaw = m[1].replace(/\s+/g, "");
  const fracRaw = m[2].trim();

  const whole = parseCardinalForm(wholeRaw);
  if (whole == null) return null;

  const digitToks = fracRaw.split(/\s+/).filter(Boolean);
  if (!digitToks.length) return null;

  const fracDigits = [];
  for (const tok of digitToks) {
    let found = null;
    for (let d = 0; d <= 9; d++) {
      if (ATOMIC[d] === tok || (d === 0 && tok === "null")) {
        found = d;
        break;
      }
    }
    // also accept fused digit string without spaces: "einsvier" is ambiguous — require spaces
    if (found == null) return null;
    fracDigits.push(found);
  }
  return { whole, fracDigits };
}

/**
 * Parse written "3,14" / "3.14" → { whole, fracDigits } or null.
 * @param {string} raw
 */
export function parseDecimalWritten(raw) {
  if (raw == null) return null;
  const s = String(raw).trim().replace(/\s+/g, "");
  const m = s.match(/^(\d{1,4})[,.](\d{1,4})$/);
  if (!m) return null;
  const whole = Number(m[1]);
  const fracDigits = m[2].split("").map((ch) => Number(ch));
  if (!Number.isInteger(whole) || whole < 0 || whole > 1000) return null;
  if (fracDigits.some((d) => !Number.isInteger(d) || d < 0 || d > 9)) return null;
  return { whole, fracDigits };
}

/** Money: "ein" not "eins" before Euro/Cent counts. */
function moneyCountForm(n) {
  if (n === 1) return "ein";
  return cardinalForm(n);
}

/**
 * @param {number} euros — 0–1000
 * @param {number} cents — 0–99
 */
export function moneyAnalysis(euros, cents) {
  if (!Number.isInteger(euros) || euros < 0 || euros > 1000) {
    throw new RangeError(`euros out of range: ${euros}`);
  }
  if (!Number.isInteger(cents) || cents < 0 || cents > 99) {
    throw new RangeError(`cents out of range: ${cents}`);
  }

  const written =
    cents === 0 ? `${euros},00 €` : `${euros},${String(cents).padStart(2, "0")} €`;
  const english =
    cents === 0
      ? `${euros}.00 €`
      : `${euros}.${String(cents).padStart(2, "0")} €`;

  const parts = [];
  if (euros > 0) {
    parts.push(...(euros === 1 ? ["ein"] : constructionParts(euros)));
    parts.push(EURO);
  }
  if (cents > 0) {
    if (euros === 0) {
      parts.push(...(cents === 1 ? ["ein"] : constructionParts(cents)));
      parts.push("Cent");
    } else {
      // Short form: "zwölf Euro fünfzig" (no Cent)
      parts.push(...(cents === 1 ? ["ein"] : constructionParts(cents)));
    }
  } else if (euros === 0) {
    parts.push("null", EURO);
  }

  const spoken =
    cents === 0
      ? `${moneyCountForm(euros)} ${EURO}`
      : euros === 0
        ? `${moneyCountForm(cents)} Cent`
        : `${moneyCountForm(euros)} ${EURO} ${moneyCountForm(cents)}`;

  return {
    euros,
    cents,
    written,
    englishWritten: english,
    form: spoken,
    kind: "money",
    segments: {
      spoken: spoken.split(" "),
      construction: parts,
    },
    rules: ["money.euro", cents > 0 ? "money.cents" : "money.whole"],
  };
}

export function moneyForm(euros, cents) {
  return moneyAnalysis(euros, cents).form;
}

export function moneyParts(euros, cents, grain = "construction") {
  const a = moneyAnalysis(euros, cents);
  return grain === "spoken" ? [...a.segments.spoken] : [...a.segments.construction];
}

/**
 * Parse short money speech → { euros, cents } or null.
 * @param {string} raw
 */
export function parseMoneyForm(raw) {
  if (raw == null) return null;
  const s = String(raw)
    .trim()
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/\s+/g, " ");
  if (!s) return null;

  // "X euro Y" | "X euro" | "Y cent"
  const euroCent = s.match(/^(.*?)\s+euro\s+(.+)$/);
  if (euroCent) {
    const eRaw = euroCent[1].replace(/\s+/g, "");
    const cRaw = euroCent[2].replace(/\s+/g, "").replace(/cent$/, "");
    const euros = eRaw === "ein" ? 1 : parseCardinalForm(eRaw);
    const cents = cRaw === "ein" ? 1 : parseCardinalForm(cRaw);
    if (euros == null || cents == null || cents < 0 || cents > 99) return null;
    return { euros, cents };
  }
  const euroOnly = s.match(/^(.*?)\s+euro$/);
  if (euroOnly) {
    const eRaw = euroOnly[1].replace(/\s+/g, "");
    const euros = eRaw === "ein" ? 1 : parseCardinalForm(eRaw);
    if (euros == null) return null;
    return { euros, cents: 0 };
  }
  const centOnly = s.match(/^(.*?)\s+cent$/);
  if (centOnly) {
    const cRaw = centOnly[1].replace(/\s+/g, "");
    const cents = cRaw === "ein" ? 1 : parseCardinalForm(cRaw);
    if (cents == null || cents < 0 || cents > 99) return null;
    return { euros: 0, cents };
  }
  return null;
}
