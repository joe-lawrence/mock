/**
 * Ordinals quiz pools for the Numbers mock.
 * Combinations from ranges (rebuild via builders).
 */

import { ordinalAnalysis } from "../engine/numbers/index.js?v=20261001-ordam1";

function ordinalMeta(n) {
  const a = ordinalAnalysis(n);
  return {
    kind: "ordinal",
    n,
    written: a.written,
    form: a.form,
    english: a.englishWritten,
    grain: "construction",
    parts: [...a.segments.construction],
  };
}

export function buildOrdinal112Pool() {
  return Array.from({ length: 12 }, (_, i) => ordinalMeta(i + 1));
}

export function buildOrdinalTeensPool() {
  return Array.from({ length: 7 }, (_, i) => ordinalMeta(13 + i));
}

export function buildOrdinalTensPool() {
  return [20, 30, 40, 50, 60, 70, 80, 90].map(ordinalMeta);
}

export function buildOrdinalCompoundsPool() {
  const items = [];
  for (let n = 21; n <= 99; n++) {
    if (n % 10 === 0) continue;
    items.push(ordinalMeta(n));
  }
  return items;
}

/** @type {Record<string, () => object[]>} */
export const ORDINAL_POOL_BUILDERS = {
  "ordinal-1-12": buildOrdinal112Pool,
  "ordinal-teens": buildOrdinalTeensPool,
  "ordinal-tens": buildOrdinalTensPool,
  "ordinal-compounds": buildOrdinalCompoundsPool,
};

export function buildOrdinalPool(poolId) {
  const build = ORDINAL_POOL_BUILDERS[poolId];
  return build ? build() : [];
}

export const ORDINAL_POOLS = {
  "ordinal-1-12": buildOrdinal112Pool(),
  "ordinal-teens": buildOrdinalTeensPool(),
  "ordinal-tens": buildOrdinalTensPool(),
  "ordinal-compounds": buildOrdinalCompoundsPool(),
};
