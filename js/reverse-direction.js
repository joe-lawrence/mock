/**
 * Quiz direction — forward | reverse for one interaction preset (not a matrix column).
 *
 * Reverse flips cue ↔ answer. Units opt in via
 * `directions: { [presetId]: ["forward","reverse"] }` on curriculum steps.
 * When both are allowed, play deals a direction per question.
 */

import { ARTICLES, SUFFIX_PATTERNS, WUGS } from "../engine/nouns/index.js";
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

function uniqueForms(forms) {
  const out = [];
  for (const f of forms) {
    const s = String(f || "").trim();
    if (s && !out.includes(s)) out.push(s);
  }
  return out;
}

/** Hour of a `H:MM` / `HH:MM` written time, or null. */
function writtenClockHour(written) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(written || "").trim());
  if (!m) return null;
  return Number(m[1]);
}

/**
 * Colloquial clock speech is 12-hour, but the stored time can be 00:xx or 13–23.
 * Those items need a 24-hour answer (`21:15`, not `9:15`).
 */
function clockWrittenIs24h(written) {
  const h = writtenClockHour(written);
  return h != null && (h === 0 || h >= 13);
}

/** `09:15` and `9:15` both count. `21:15` does not also accept `9:15`. */
function clockWrittenForms(written) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(written || "").trim());
  if (!m) return [String(written || "").trim()].filter(Boolean);
  const h = String(Number(m[1]));
  return [`${h.padStart(2, "0")}:${m[2]}`, `${h}:${m[2]}`];
}

/**
 * German spoken form → the canonical written value (decimal, money, fraction,
 * clock, duration, measure).
 * @param {{ kind?: string, form?: string, written?: string }} meta
 */
function writtenFormReverse(meta) {
  const kind = meta?.kind;
  const form = String(meta?.form || "").trim();
  const written = String(meta?.written || "").trim();
  let accepted = written ? [written] : [];
  let ask = "Type the written form";
  let hint = "Read the German — type the written form.";
  let placeholder = "written form";
  let ariaLabel = "Written form";

  if (kind === "decimal") {
    ask = "Type the decimal";
    hint = "Read the German — type it with a Komma (e.g. 3,14).";
    placeholder = "e.g. 3,14";
    ariaLabel = "Written decimal";
  } else if (kind === "money") {
    ask = "Type the amount";
    hint = "Read the German — type the amount (e.g. 3,50 €).";
    placeholder = "e.g. 3,50 €";
    ariaLabel = "Euro amount";
    if (written) accepted.push(written.replace(/\s+€/g, "€"));
  } else if (kind === "fraction" || kind === "mixed-fraction") {
    ask = "Type the fraction";
    hint = "Read the German — type the fraction (e.g. 2/3).";
    placeholder = kind === "mixed-fraction" ? "e.g. 2 1/2" : "e.g. 2/3";
    ariaLabel = "Fraction";
  } else if (kind === "digital-time") {
    ask = "Type the time";
    hint = "Read the German — type the time (e.g. 14:05).";
    placeholder = "e.g. 14:05";
    ariaLabel = "Time";
    accepted = clockWrittenForms(written);
  } else if (kind === "clock") {
    const twentyFour = clockWrittenIs24h(written);
    ask = twentyFour ? "Type the time (24-hour)" : "Type the time";
    hint = twentyFour
      ? "Read the German — type the 24-hour time (e.g. 21:15)."
      : "Read the German — type the time (9:15 or 09:15).";
    placeholder = twentyFour ? "e.g. 21:15 (24h)" : "e.g. 9:15";
    ariaLabel = "Time";
    accepted = clockWrittenForms(written);
  } else if (kind === "duration") {
    ask = "Type the duration";
    hint = "Read the German — type the duration (e.g. 2h 30min).";
    placeholder = "e.g. 2h 30min";
    ariaLabel = "Duration";
    if (written) accepted.push(written.replace(/\s+/g, ""));
  } else if (kind === "measure") {
    ask = "Type the measurement";
    hint = "Read the German — type the amount and unit (e.g. 3 m).";
    placeholder = "e.g. 3 m";
    ariaLabel = "Measurement";
    if (written) accepted.push(written.replace(/\s+/g, ""));
  }

  return {
    direction: DIRECTION.REVERSE,
    cue: form,
    cueKind: "german-form",
    answer: written,
    acceptedForms: uniqueForms(accepted),
    ask,
    hint,
    placeholder,
    ariaLabel,
  };
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

function wugSuffixCue(patternId) {
  if (!patternId) return null;
  const pattern = SUFFIX_PATTERNS.find((p) => p.id === patternId);
  return pattern?.suffix ? `-${pattern.suffix}` : null;
}

/**
 * Wug reverse stays on wug forms (never lexicon lemmas).
 * Cue is der/die/das, or "?" when the wug has no gender cue.
 * Answer key uses suffixCue + patternNote (ending ↔ gender), not the fake word.
 * @param {string} form
 */
export function wugReverseChoose(form) {
  const entry = WUGS.find((w) => w.form === form);
  if (!entry) throw new Error(`wugReverseChoose: unknown wug ${form}`);
  const candidates = WUGS.map((w) => ({
    lemma: w.form,
    article: w.intendedGender ? ARTICLES[w.intendedGender] : "?",
    gender: w.intendedGender || null,
  }));
  const target = candidates.find((c) => c.lemma === form);
  const pack = reverseNounArticleChoose(target.lemma, target.article, candidates);
  const bare = target.article === "?";
  return {
    ...pack,
    ask: "Pick the matching wug",
    hint: bare
      ? "No reliable suffix — pick the wug with no gender cue."
      : `Look for a wug with a ${target.article} suffix cue.`,
    gender: target.gender,
    wug: true,
    suffixCue: wugSuffixCue(entry.patternId),
    patternNote: entry.note || "",
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

  if (
    kind === "decimal" ||
    kind === "money" ||
    kind === "fraction" ||
    kind === "mixed-fraction" ||
    kind === "clock" ||
    kind === "digital-time" ||
    kind === "duration" ||
    kind === "measure"
  ) {
    return writtenFormReverse(meta);
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
    placeholder: "e.g. 13",
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
