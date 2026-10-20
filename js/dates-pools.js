/**
 * Dates quiz pools for the Numbers mock.
 * Combinations are generated from calendar ranges (rebuild via builders).
 */

import {
  weekdayAnalysis,
  monthAnalysis,
  ordinalAmAnalysis,
  calendarDateAnalysis,
  daysInMonth,
} from "../engine/numbers/index.js?v=20260930-dmo16";

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

function ordinalDayMeta(n) {
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

function dateMeta(day, month, year) {
  const a = calendarDateAnalysis(
    year != null ? { day, month, year } : { day, month }
  );
  return {
    kind: "calendar-date",
    day,
    month,
    year: year ?? null,
    written: a.written,
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

export function buildOrdinalDaysPool() {
  return Array.from({ length: 31 }, (_, i) => ordinalDayMeta(i + 1));
}

/**
 * All valid day·month (no year), plus stratified day·month·year samples
 * (engine year range 2000–2035; we use recent years).
 */
export function buildFullDatesPool() {
  const items = [];
  for (let month = 1; month <= 12; month++) {
    const max = daysInMonth(month);
    for (let day = 1; day <= max; day++) {
      items.push(dateMeta(day, month));
    }
  }
  // With year: 1st / mid / last of each month × 2020–2026
  for (let year = 2020; year <= 2026; year++) {
    for (let month = 1; month <= 12; month++) {
      const max = daysInMonth(month);
      const days = new Set([1, Math.ceil(max / 2), max]);
      for (const day of days) items.push(dateMeta(day, month, year));
    }
  }
  return items;
}

/** @type {Record<string, () => object[]>} */
export const DATE_POOL_BUILDERS = {
  weekdays: buildWeekdaysPool,
  months: buildMonthsPool,
  "ordinal-days": buildOrdinalDaysPool,
  "full-dates": buildFullDatesPool,
};

export function buildDatePool(poolId) {
  const build = DATE_POOL_BUILDERS[poolId];
  return build ? build() : [];
}

export const DATE_POOLS = {
  weekdays: buildWeekdaysPool(),
  months: buildMonthsPool(),
  "ordinal-days": buildOrdinalDaysPool(),
  "full-dates": buildFullDatesPool(),
};
