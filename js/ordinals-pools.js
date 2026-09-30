/**
 * Ordinals quiz pools for the Numbers mock.
 */

import {
  ordinalAnalysis,
  ordinalAmAnalysis,
} from "../engine/numbers/index.js?v=20260930-dmo16";

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

function ordinalAmMeta(n) {
  const a = ordinalAmAnalysis(n);
  return {
    kind: "ordinal-am",
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

/** am + dative — bridge to Dates. */
export function buildOrdinalDatesUsePool() {
  const days = [1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 15, 20, 21, 22, 23, 28, 30, 31];
  return days.map(ordinalAmMeta);
}

export const ORDINAL_POOLS = {
  "ordinal-1-12": buildOrdinal112Pool(),
  "ordinal-teens": buildOrdinalTeensPool(),
  "ordinal-tens": buildOrdinalTensPool(),
  "ordinal-compounds": buildOrdinalCompoundsPool(),
  "ordinal-dates-use": buildOrdinalDatesUsePool(),
};
