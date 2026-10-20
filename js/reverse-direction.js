/**
 * Quiz direction — forward | reverse as a per-cell flag (not a matrix column).
 *
 * Reverse flips cue ↔ answer for the same interaction preset. Units opt in via
 * `directions: { [presetId]: ["forward","reverse"] }` on curriculum steps.
 */

import { makeNounReverseChoices } from "./quiz-extras.js";

/** @typedef {"forward"|"reverse"} QuizDirection */

export const DIRECTION = Object.freeze({
  FORWARD: "forward",
  REVERSE: "reverse",
});

export const DIRECTION_LABELS = Object.freeze({
  forward: "Forward",
  reverse: "Reverse",
});

/** Default when a step omits `directions` / a preset isn’t listed. */
export const DEFAULT_DIRECTIONS = Object.freeze([DIRECTION.FORWARD]);

/**
 * Normalize a directions allowlist.
 * @param {unknown} raw
 * @returns {QuizDirection[]}
 */
export function normalizeDirections(raw) {
  if (!Array.isArray(raw) || !raw.length) return [...DEFAULT_DIRECTIONS];
  const out = [];
  for (const d of raw) {
    if (d === DIRECTION.FORWARD || d === DIRECTION.REVERSE) {
      if (!out.includes(d)) out.push(d);
    }
  }
  return out.length ? out : [...DEFAULT_DIRECTIONS];
}

/**
 * Directions allowed for a curriculum step + preset.
 * @param {{ directions?: Record<string, string[]> }|null|undefined} step
 * @param {string} modeId
 */
export function directionsForStepMode(step, modeId) {
  if (!step || !modeId) return [...DEFAULT_DIRECTIONS];
  const map = step.directions;
  if (!map || typeof map !== "object") return [...DEFAULT_DIRECTIONS];
  return normalizeDirections(map[modeId]);
}

/**
 * @param {{ directions?: Record<string, string[]> }|null|undefined} step
 * @param {string} modeId
 * @param {string} direction
 */
export function isDirectionPlayable(step, modeId, direction) {
  return directionsForStepMode(step, modeId).includes(direction);
}

export function isReverse(direction) {
  return direction === DIRECTION.REVERSE;
}

/**
 * Article → lemma reverse pack (Suffixes choose · reverse).
 * @param {string} targetLemma
 * @param {string} targetArticle
 * @param {{ lemma: string, article: string }[]} candidates
 */
export function reverseNounArticleChoose(targetLemma, targetArticle, candidates) {
  const pack = makeNounReverseChoices(targetLemma, targetArticle, candidates);
  return {
    direction: DIRECTION.REVERSE,
    cue: pack.promptArticle,
    cueKind: "article",
    answer: pack.answer,
    choices: pack.options,
    ask: "Pick the matching noun",
    hint: `Look for a ${targetArticle}-gender cue.`,
  };
}

/**
 * Convert · reverse: German form → type the “other side” (digit / English / written date).
 * @param {{
 *   kind?: string,
 *   value?: number|string|null,
 *   n?: number|null,
 *   form?: string,
 *   written?: string,
 *   english?: string,
 * }} meta
 */
export function reverseNumbersConvert(meta) {
  const kind = meta?.kind || "cardinal";
  const form = String(meta?.form || "").trim();

  // Weekdays / months: German name → English name.
  if (kind === "weekday" || kind === "month") {
    const english = String(meta?.english || meta?.written || "").trim();
    return {
      direction: DIRECTION.REVERSE,
      cue: form,
      cueKind: "german-form",
      answer: english,
      acceptedForms: english
        ? [english, english.toLowerCase(), english.replace(/^\w/, (c) => c.toUpperCase())]
        : [],
      ask:
        kind === "weekday"
          ? "Type the English weekday"
          : "Type the English month",
      hint: "Read the German name — type the English form.",
      placeholder: kind === "weekday" ? "e.g. Monday" : "e.g. January",
      ariaLabel: kind === "weekday" ? "English weekday" : "English month",
    };
  }

  // Ordinals / calendar day: German → written ordinal (12. / am 9.).
  if (kind === "ordinal" || kind === "ordinal-am") {
    const n = meta?.n ?? meta?.value;
    const written = String(
      meta?.written || (n != null ? `${n}.` : "")
    ).trim();
    const digit = n != null ? String(n) : "";
    const accepted = [written, digit, digit ? `${digit}.` : ""].filter(Boolean);
    return {
      direction: DIRECTION.REVERSE,
      cue: form,
      cueKind: "german-form",
      answer: written || digit,
      acceptedForms: [...new Set(accepted)],
      ask: "Type the ordinal number",
      hint: "Read the German ordinal — type the number (e.g. 12.).",
      placeholder: "e.g. 12.",
      ariaLabel: "Ordinal number",
    };
  }

  // Full dates: spoken German → written date.
  if (kind === "calendar-date") {
    const written = String(meta?.written || "").trim();
    return {
      direction: DIRECTION.REVERSE,
      cue: form,
      cueKind: "german-form",
      answer: written,
      acceptedForms: written ? [written] : [],
      ask: "Type the written date",
      hint: "Read the German date — type the written form (e.g. 9.11.2020).",
      placeholder: "e.g. 9.11.",
      ariaLabel: "Written date",
    };
  }

  // Cardinals (default): German → digits.
  const value = meta?.value;
  const digit = value != null ? String(value) : "";
  const cue = form || String(meta?.written || "").trim();
  return {
    direction: DIRECTION.REVERSE,
    cue,
    cueKind: "german-form",
    answer: digit,
    acceptedForms: digit
      ? [digit, digit.replace(/^0+/, "") || "0"]
      : [],
    ask: "Type the number",
    hint: "Read the German form — type the digits.",
    placeholder: "number",
    ariaLabel: "Number value",
  };
}

/**
 * Convert · reverse for compass: German lemma → type English.
 * @param {{ lemma?: string, english?: string, translation?: string }} meta
 */
export function reverseCompassConvert(meta) {
  const lemma = String(meta?.lemma || "").trim();
  const english = String(meta?.english || meta?.translation || "").trim();
  return {
    direction: DIRECTION.REVERSE,
    cue: lemma,
    cueKind: "german-lemma",
    answer: english,
    acceptedForms: english ? [english, english.toLowerCase()] : [],
    ask: "Type the English direction",
    hint: "See the German direction — type the English name.",
    placeholder: "English direction",
    ariaLabel: "English direction",
  };
}
