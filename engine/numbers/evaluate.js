/**
 * Evaluate learner number constructions against engine truth.
 */

import { cardinalAnalysis, parseCardinalForm } from "./cardinal.js";

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
