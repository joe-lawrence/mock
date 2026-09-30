/**
 * Fractions quiz pools for the Numbers mock.
 */

import {
  fractionAnalysis,
  mixedFractionAnalysis,
} from "../engine/numbers/index.js?v=20260930-dmo16";

function fractionMeta(numerator, denominator) {
  const a = fractionAnalysis(numerator, denominator);
  return {
    kind: "fraction",
    numerator,
    denominator,
    written: a.written,
    form: a.form,
    english: a.englishWritten,
    grain: "construction",
    parts: [...a.segments.construction],
  };
}

function mixedMeta(whole, numerator, denominator) {
  const a = mixedFractionAnalysis(whole, numerator, denominator);
  return {
    kind: "mixed-fraction",
    whole,
    numerator,
    denominator,
    written: a.written,
    form: a.form,
    english: a.englishWritten,
    grain: "construction",
    parts: [...a.segments.construction],
  };
}

/** halb & Viertel high-frequency set. */
export function buildHalfQuarterPool() {
  return [
    fractionMeta(1, 2),
    fractionMeta(1, 4),
    fractionMeta(3, 4),
    fractionMeta(2, 4), // zwei Viertel — pattern practice
  ];
}

/** Unit fractions 1/n for n = 3–12. */
export function buildUnitFractionsPool() {
  const items = [];
  for (let d = 3; d <= 12; d++) items.push(fractionMeta(1, d));
  return items;
}

/** Proper fractions m/n with 1 < m < n, denser on small denominators. */
export function buildProperFractionsPool() {
  const items = [];
  for (let d = 3; d <= 12; d++) {
    for (let n = 2; n < d; n++) {
      items.push(fractionMeta(n, d));
    }
  }
  return items;
}

/** Mixed: N + 1/2 fused, plus a few whole + und + fraction. */
export function buildMixedNumbersPool() {
  const items = [];
  for (let w = 1; w <= 10; w++) items.push(mixedMeta(w, 1, 2));
  for (const [w, n, d] of [
    [1, 1, 4],
    [2, 1, 4],
    [1, 3, 4],
    [2, 1, 3],
    [3, 2, 3],
    [1, 1, 5],
    [2, 2, 5],
    [4, 1, 4],
    [5, 3, 4],
  ]) {
    items.push(mixedMeta(w, n, d));
  }
  return items;
}

export const FRACTION_POOLS = {
  "half-quarter": buildHalfQuarterPool(),
  "unit-fractions": buildUnitFractionsPool(),
  "proper-fractions": buildProperFractionsPool(),
  "mixed-numbers": buildMixedNumbersPool(),
};
