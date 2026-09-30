/**
 * Time / duration quiz pools for the Numbers mock.
 */

import {
  clockAnalysis,
  digitalTimeAnalysis,
  durationAnalysis,
} from "../engine/numbers/index.js?v=20260930-dmo17";

function clockMeta(hours, minutes) {
  const a = clockAnalysis(hours, minutes);
  return {
    kind: "clock",
    hours,
    minutes,
    written: a.written,
    form: a.form,
    english: a.englishWritten,
    grain: "construction",
    parts: [...a.segments.construction],
  };
}

function digitalMeta(hours, minutes) {
  const a = digitalTimeAnalysis(hours, minutes);
  return {
    kind: "digital-time",
    hours,
    minutes,
    written: a.written,
    form: a.form,
    english: a.englishWritten,
    grain: "construction",
    parts: [...a.segments.construction],
  };
}

function durationMeta(hours, minutes) {
  const a = durationAnalysis({ hours, minutes });
  return {
    kind: "duration",
    hours,
    minutes,
    written: a.written,
    form: a.form,
    english: a.englishWritten,
    grain: "construction",
    parts: [...a.segments.construction],
  };
}

/** Whole hours on the 12h face (mapped from 1–12 and a few 24h labels). */
export function buildWholeHoursPool() {
  const items = [];
  for (let h = 1; h <= 12; h++) items.push(clockMeta(h === 12 ? 0 : h, 0));
  for (const h of [13, 14, 18, 20, 22]) items.push(clockMeta(h, 0));
  return items;
}

/** halb … — minutes = 30. */
export function buildHalfPastPool() {
  const items = [];
  for (let h = 0; h <= 23; h++) items.push(clockMeta(h, 30));
  return items;
}

/** Viertel nach / Viertel vor. */
export function buildQuartersPool() {
  const items = [];
  for (let h = 0; h <= 23; h++) {
    items.push(clockMeta(h, 15));
    items.push(clockMeta(h, 45));
  }
  return items;
}

/** Common minute offsets (not :00/:15/:30/:45). */
export function buildMinutesPool() {
  const mins = [5, 10, 20, 25, 35, 40, 50, 55];
  const items = [];
  for (let h = 1; h <= 12; h++) {
    for (const m of mins) items.push(clockMeta(h, m));
  }
  // a few afternoon exemplars
  for (const h of [14, 16, 19]) {
    for (const m of [5, 20, 40, 55]) items.push(clockMeta(h, m));
  }
  return items;
}

/** Digital / 24h readings. */
export function buildDigital24hPool() {
  const items = [];
  for (let h = 0; h <= 23; h++) items.push(digitalMeta(h, 0));
  for (const [h, m] of [
    [8, 5],
    [9, 15],
    [12, 30],
    [13, 5],
    [14, 20],
    [16, 45],
    [18, 10],
    [20, 55],
    [22, 30],
    [0, 15],
    [1, 5],
    [7, 45],
  ]) {
    items.push(digitalMeta(h, m));
  }
  return items;
}

/** Durations: minutes, hours, combined. */
export function buildDurationPool() {
  const items = [];
  for (const m of [1, 5, 10, 15, 20, 30, 45]) items.push(durationMeta(0, m));
  for (const h of [1, 2, 3, 4, 5, 6, 8, 10, 12]) items.push(durationMeta(h, 0));
  for (const [h, m] of [
    [1, 15],
    [1, 30],
    [2, 15],
    [2, 30],
    [3, 20],
    [1, 5],
    [4, 45],
  ]) {
    items.push(durationMeta(h, m));
  }
  return items;
}

export const TIME_POOLS = {
  "whole-hours": buildWholeHoursPool(),
  "half-past": buildHalfPastPool(),
  quarters: buildQuartersPool(),
  minutes: buildMinutesPool(),
  "digital-24h": buildDigital24hPool(),
  duration: buildDurationPool(),
};
