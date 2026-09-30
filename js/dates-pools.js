/**
 * Dates quiz pools for the Numbers mock.
 */

import {
  weekdayAnalysis,
  monthAnalysis,
  ordinalAmAnalysis,
  calendarDateAnalysis,
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

export function buildFullDatesPool() {
  const items = [];
  const samples = [
    [1, 1],
    [3, 3],
    [8, 5],
    [12, 6],
    [15, 7],
    [20, 8],
    [23, 9],
    [28, 2],
    [31, 12],
    [1, 5],
    [14, 2],
    [24, 12],
    [4, 10],
    [11, 11],
  ];
  for (const [d, m] of samples) items.push(dateMeta(d, m));
  for (const [d, m, y] of [
    [3, 3, 2024],
    [1, 1, 2025],
    [9, 11, 2020],
    [15, 8, 2026],
    [24, 12, 2023],
  ]) {
    items.push(dateMeta(d, m, y));
  }
  return items;
}

export const DATE_POOLS = {
  weekdays: buildWeekdaysPool(),
  months: buildMonthsPool(),
  "ordinal-days": buildOrdinalDaysPool(),
  "full-dates": buildFullDatesPool(),
};
