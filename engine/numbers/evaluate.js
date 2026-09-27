/**
 * Evaluate learner number constructions against engine truth.
 */

import { cardinalAnalysis, parseCardinalForm } from "./cardinal.js";
import { decimalAnalysis, moneyAnalysis } from "./decimal.js";

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
