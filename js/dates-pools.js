/**
 * Dates quiz pools for the Numbers mock.
 * Combinations are generated from calendar ranges (rebuild via builders).
 */

import {
  weekdayAnalysis,
  monthAnalysis,
} from "../../engine/numbers/index.js?v=20260930-dmo16";

function weekdayMeta(index) {
  const a = weekdayAnalysis(index);
  return {
    kind: "weekday",
    index,
    written: a.englishWritten,
    form: a.form,
    english: a.englishWritten,
    grain: "construction",
    parts: [...a.segments.construction],
  };
}

function monthMeta(month) {
  const a = monthAnalysis(month);
  return {
    kind: "month",
    month,
    written: a.englishWritten,
    form: a.form,
    english: a.englishWritten,
    grain: "construction",
    parts: [...a.segments.construction],
  };
}

export function buildWeekdaysPool() {
  return Array.from({ length: 7 }, (_, i) => weekdayMeta(i));
}

export function buildMonthsPool() {
  return Array.from({ length: 12 }, (_, i) => monthMeta(i + 1));
}

/** @type {Record<string, () => object[]>} */
export const DATE_POOL_BUILDERS = {
  weekdays: buildWeekdaysPool,
  months: buildMonthsPool,
};

export function buildDatePool(poolId) {
  const build = DATE_POOL_BUILDERS[poolId];
  return build ? build() : [];
}

export const DATE_POOLS = {
  weekdays: buildWeekdaysPool(),
  months: buildMonthsPool(),
};
