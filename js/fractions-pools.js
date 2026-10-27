/**
 * Fractions quiz pools for the Numbers mock.
 *
 * Combinations are generated from small ranges (not a hand-picked quiz list).
 * Call the builders (or {@link buildFractionPool}) whenever a fresh deck is needed.
 */

import {
  fractionAnalysis,
  mixedFractionAnalysis,
} from "../../engine/numbers/index.js?v=20260930-dmo16";

/** Curriculum max denominator (Zwölftel). */
export const FRACTION_MAX_DENOM = 12;

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

/** halb & Viertel — high-frequency lexical set. */
export function buildHalfQuarterPool() {
  return [
    fractionMeta(1, 2),
    fractionMeta(1, 4),
    fractionMeta(3, 4),
    fractionMeta(2, 4), // zwei Viertel — pattern practice
  ];
}

/** Unit fractions 1/n for n = 3…max. */
export function buildUnitFractionsPool(maxDenom = FRACTION_MAX_DENOM) {
  const items = [];
  const max = Math.max(3, Math.floor(Number(maxDenom)) || FRACTION_MAX_DENOM);
  for (let d = 3; d <= max; d++) items.push(fractionMeta(1, d));
  return items;
}

/** Proper fractions m/n with 1 < m < n, dens 3…max. */
export function buildProperFractionsPool(maxDenom = FRACTION_MAX_DENOM) {
  const items = [];
  const max = Math.max(3, Math.floor(Number(maxDenom)) || FRACTION_MAX_DENOM);
  for (let d = 3; d <= max; d++) {
    for (let n = 2; n < d; n++) {
      items.push(fractionMeta(n, d));
    }
  }
  return items;
}

/**
 * Mixed numbers from rules: wholes × common fraction parts
 * (halb, unit ⅓–⅕, and a few proper fractions).
 */
export function buildMixedNumbersPool() {
  const items = [];
  for (let w = 1; w <= 12; w++) items.push(mixedMeta(w, 1, 2));
  for (let w = 1; w <= 10; w++) {
    for (const d of [3, 4, 5]) items.push(mixedMeta(w, 1, d));
  }
  const propers = [
    [2, 3],
    [3, 4],
    [2, 5],
    [3, 5],
    [4, 5],
    [2, 4],
  ];
  for (let w = 1; w <= 8; w++) {
    for (const [n, d] of propers) items.push(mixedMeta(w, n, d));
  }
  return items;
}

/** @type {Record<string, () => object[]>} */
export const FRACTION_POOL_BUILDERS = {
  "half-quarter": buildHalfQuarterPool,
  "unit-fractions": () => buildUnitFractionsPool(),
  "proper-fractions": () => buildProperFractionsPool(),
  "mixed-numbers": buildMixedNumbersPool,
};

/** Fresh pool for a step id (dynamic combinations). */
export function buildFractionPool(poolId) {
  const build = FRACTION_POOL_BUILDERS[poolId];
  return build ? build() : [];
}

/** Convenience snapshot; prefer {@link buildFractionPool} when reshuffling. */
export const FRACTION_POOLS = {
  "half-quarter": buildHalfQuarterPool(),
  "unit-fractions": buildUnitFractionsPool(),
  "proper-fractions": buildProperFractionsPool(),
  "mixed-numbers": buildMixedNumbersPool(),
};
