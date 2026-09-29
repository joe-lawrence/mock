/**
 * Evaluate learner number constructions against engine truth.
 */

import { cardinalAnalysis, parseCardinalForm } from "./cardinal.js";
import { decimalAnalysis, moneyAnalysis } from "./decimal.js";
import {
  fractionAnalysis,
  mixedFractionAnalysis,
  parseFractionForm,
} from "./fraction.js";
import {
  clockAnalysis,
  digitalTimeAnalysis,
  durationAnalysis,
} from "./time.js";
import {
  ordinalAnalysis,
  ordinalAmAnalysis,
  parseOrdinalForm,
} from "./ordinal.js";
import {
  weekdayAnalysis,
  monthAnalysis,
  calendarDateAnalysis,
} from "./date.js";
import { measureAnalysis } from "./measure.js";

function partsEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((p, i) => p === b[i]);
}

function normalizeParts(parts) {
  return (parts || []).map((p) => String(p).trim().toLowerCase());
}

/**
 * @param {{ value: number, parts: string[], grain?: "construction" | "morph" }} input
 */
export function evaluateCardinalConstruction({ value, parts, grain = "construction" }) {
  const analysis = cardinalAnalysis(value);
  const expected =
    grain === "morph"
      ? analysis.segments.morph
      : analysis.segments.construction;
  const normalized = normalizeParts(parts);
  const built = normalized.join("");
  const canonical = analysis.form;

  const evidenceIds = [...analysis.rules, "eval.cardinal.construction"];

  if (built === canonical && partsEqual(normalized, expected)) {
    return {
      status: "correct",
      canonicalAnswers: [canonical],
      matchedAnswer: canonical,
      explanation: "Construction matches the canonical segmentation.",
      evidenceIds,
      slotMatch: normalized.map((p, i) => p === expected[i]),
    };
  }

  if (built === canonical) {
    return {
      status: "accepted-alternative",
      canonicalAnswers: [canonical],
      matchedAnswer: canonical,
      explanation:
        "Orthography matches the cardinal, but chip boundaries differ from the target segmentation.",
      evidenceIds: [...evidenceIds, "eval.alt.segmentation"],
      slotMatch: null,
    };
  }

  const parsed = parseCardinalForm(built);
  if (parsed === value) {
    return {
      status: "accepted-alternative",
      canonicalAnswers: [canonical],
      matchedAnswer: built,
      explanation: "Parses to the target value with non-canonical spelling or spacing.",
      evidenceIds: [...evidenceIds, "eval.alt.parse"],
      slotMatch: null,
    };
  }

  if (parsed != null && parsed !== value) {
    return {
      status: "valid-but-unintended",
      canonicalAnswers: [canonical],
      matchedAnswer: built,
      explanation: `Form is a valid cardinal for ${parsed}, not ${value}.`,
      evidenceIds: [...evidenceIds, "eval.wrong-target", `parsed.${parsed}`],
      parsedValue: parsed,
      slotMatch: expected.map((p, i) => normalized[i] === p),
    };
  }

  return {
    status: "incorrect",
    canonicalAnswers: [canonical],
    explanation: `Does not form the cardinal for ${value} (${canonical}).`,
    evidenceIds: [...evidenceIds, "eval.incorrect"],
    slotMatch: expected.map((p, i) => normalized[i] === p),
  };
}

/**
 * @param {{ parts: string[], expected: string[], form: string, rules?: string[] }} input
 */
function evaluateSegmentedForm({ parts, expected, form, rules = [] }) {
  const normalized = normalizeParts(parts);
  const expect = normalizeParts(expected);
  const builtSpaced = normalized.join(" ");
  const builtFused = normalized.join("");
  const canonical = String(form).toLowerCase().replace(/\s+/g, " ").trim();
  const canonicalFused = canonical.replace(/\s+/g, "");
  const evidenceIds = [...rules, "eval.segmented"];

  if (partsEqual(normalized, expect)) {
    return {
      status: "correct",
      canonicalAnswers: [form],
      matchedAnswer: form,
      explanation: "Construction matches the canonical segmentation.",
      evidenceIds,
      slotMatch: normalized.map((p, i) => p === expect[i]),
    };
  }

  if (builtSpaced === canonical || builtFused === canonicalFused) {
    return {
      status: "accepted-alternative",
      canonicalAnswers: [form],
      matchedAnswer: builtSpaced,
      explanation: "Orthography matches, but chip boundaries differ.",
      evidenceIds: [...evidenceIds, "eval.alt.segmentation"],
      slotMatch: null,
    };
  }

  return {
    status: "incorrect",
    canonicalAnswers: [form],
    explanation: `Does not form ${form}.`,
    evidenceIds: [...evidenceIds, "eval.incorrect"],
    slotMatch: expect.map((p, i) => normalized[i] === p),
  };
}

/**
 * @param {{ whole: number, fracDigits: number[], parts: string[], grain?: string }} input
 */
export function evaluateDecimalConstruction({
  whole,
  fracDigits,
  parts,
  grain = "construction",
}) {
  const a = decimalAnalysis(whole, fracDigits);
  const expected =
    grain === "spoken" ? a.segments.spoken : a.segments.construction;
  return evaluateSegmentedForm({
    parts,
    expected,
    form: a.form,
    rules: a.rules,
  });
}

/**
 * @param {{ euros: number, cents: number, parts: string[], grain?: string }} input
 */
export function evaluateMoneyConstruction({
  euros,
  cents,
  parts,
  grain = "construction",
}) {
  const a = moneyAnalysis(euros, cents);
  const expected =
    grain === "spoken" ? a.segments.spoken : a.segments.construction;
  return evaluateSegmentedForm({
    parts,
    expected,
    form: a.form,
    rules: a.rules,
  });
}

/**
 * @param {{ numerator: number, denominator: number, parts: string[] }} input
 */
export function evaluateFractionConstruction({ numerator, denominator, parts }) {
  const a = fractionAnalysis(numerator, denominator);
  const base = evaluateSegmentedForm({
    parts,
    expected: a.segments.construction,
    form: a.form,
    rules: a.rules,
  });
  if (base.status !== "incorrect") return base;
  const built = normalizeParts(parts).join(" ");
  const parsed = parseFractionForm(built);
  if (
    parsed?.kind === "fraction" &&
    parsed.numerator === numerator &&
    parsed.denominator === denominator
  ) {
    return {
      status: "accepted-alternative",
      canonicalAnswers: [a.form],
      matchedAnswer: built,
      explanation: "Parses to the target fraction with non-canonical segmentation.",
      evidenceIds: [...a.rules, "eval.alt.parse"],
      slotMatch: null,
    };
  }
  return base;
}

/**
 * @param {{ whole: number, numerator: number, denominator: number, parts: string[] }} input
 */
export function evaluateMixedFractionConstruction({
  whole,
  numerator,
  denominator,
  parts,
}) {
  const a = mixedFractionAnalysis(whole, numerator, denominator);
  const base = evaluateSegmentedForm({
    parts,
    expected: a.segments.construction,
    form: a.form,
    rules: a.rules,
  });
  if (base.status !== "incorrect") return base;
  const built = normalizeParts(parts).join(" ").replace(/\s+/g, " ");
  const fused = normalizeParts(parts).join("");
  const parsed = parseFractionForm(built) || parseFractionForm(fused);
  if (
    parsed?.kind === "mixed" &&
    parsed.whole === whole &&
    parsed.numerator === numerator &&
    parsed.denominator === denominator
  ) {
    return {
      status: "accepted-alternative",
      canonicalAnswers: [a.form],
      matchedAnswer: built || fused,
      explanation: "Parses to the target mixed fraction.",
      evidenceIds: [...a.rules, "eval.alt.parse"],
      slotMatch: null,
    };
  }
  return base;
}

/**
 * @param {{ hours: number, minutes: number, parts: string[] }} input
 */
export function evaluateClockConstruction({ hours, minutes, parts }) {
  const a = clockAnalysis(hours, minutes);
  return evaluateSegmentedForm({
    parts,
    expected: a.segments.construction,
    form: a.form,
    rules: a.rules,
  });
}

/**
 * @param {{ hours: number, minutes: number, parts: string[] }} input
 */
export function evaluateDigitalTimeConstruction({ hours, minutes, parts }) {
  const a = digitalTimeAnalysis(hours, minutes);
  return evaluateSegmentedForm({
    parts,
    expected: a.segments.construction,
    form: a.form,
    rules: a.rules,
  });
}

/**
 * @param {{ hours?: number, minutes?: number, parts: string[] }} input
 */
export function evaluateDurationConstruction({ hours = 0, minutes = 0, parts }) {
  const a = durationAnalysis({ hours, minutes });
  return evaluateSegmentedForm({
    parts,
    expected: a.segments.construction,
    form: a.form,
    rules: a.rules,
  });
}

/**
 * @param {{ n: number, parts: string[] }} input
 */
export function evaluateOrdinalConstruction({ n, parts }) {
  const a = ordinalAnalysis(n);
  const base = evaluateSegmentedForm({
    parts,
    expected: a.segments.construction,
    form: a.form,
    rules: a.rules,
  });
  if (base.status !== "incorrect") return base;
  const built = normalizeParts(parts).join("");
  const parsed = parseOrdinalForm(built);
  if (parsed === n) {
    return {
      status: "accepted-alternative",
      canonicalAnswers: [a.form],
      matchedAnswer: built,
      explanation: "Parses to the target ordinal.",
      evidenceIds: [...a.rules, "eval.alt.parse"],
      slotMatch: null,
    };
  }
  return base;
}

/**
 * @param {{ n: number, parts: string[] }} input
 */
export function evaluateOrdinalAmConstruction({ n, parts }) {
  const a = ordinalAmAnalysis(n);
  return evaluateSegmentedForm({
    parts,
    expected: a.segments.construction,
    form: a.form,
    rules: a.rules,
  });
}

/**
 * @param {{ index: number, parts: string[] }} input
 */
export function evaluateWeekdayConstruction({ index, parts }) {
  const a = weekdayAnalysis(index);
  return evaluateSegmentedForm({
    parts,
    expected: a.segments.construction,
    form: a.form,
    rules: a.rules,
  });
}

/**
 * @param {{ month: number, parts: string[] }} input
 */
export function evaluateMonthConstruction({ month, parts }) {
  const a = monthAnalysis(month);
  return evaluateSegmentedForm({
    parts,
    expected: a.segments.construction,
    form: a.form,
    rules: a.rules,
  });
}

/**
 * @param {{ day: number, month: number, year?: number|null, parts: string[] }} input
 */
export function evaluateCalendarDateConstruction({
  day,
  month,
  year = null,
  parts,
}) {
  const a = calendarDateAnalysis(
    year != null ? { day, month, year } : { day, month }
  );
  return evaluateSegmentedForm({
    parts,
    expected: a.segments.construction,
    form: a.form,
    rules: a.rules,
  });
}

/**
 * @param {{ value: number, unit: string, parts: string[] }} input
 */
export function evaluateMeasureConstruction({ value, unit, parts }) {
  const a = measureAnalysis(value, unit);
  return evaluateSegmentedForm({
    parts,
    expected: a.segments.construction,
    form: a.form,
    rules: a.rules,
  });
}
