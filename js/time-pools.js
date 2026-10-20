/**
 * Time / duration quiz pools for the Numbers mock.
 * Combinations are generated from hour×minute / duration ranges.
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

/**
 * Minute offsets other than :00/:15/:30/:45 — full 24h × 5-minute grid
 * excluding quarter/half/hour (those live in sibling units).
 */
export function buildMinutesPool() {
  const mins = [5, 10, 20, 25, 35, 40, 50, 55];
  const items = [];
  for (let h = 0; h <= 23; h++) {
    for (const m of mins) items.push(clockMeta(h, m));
  }
  return items;
}

/** Digital / 24h: every hour × 5-minute steps (incl. :00 quarters). */
export function buildDigital24hPool() {
  const items = [];
  for (let h = 0; h <= 23; h++) {
    for (let m = 0; m < 60; m += 5) {
      items.push(digitalMeta(h, m));
    }
  }
  return items;
}

/**
 * Durations: minute-only, hour-only, and hour+minute combinations.
 */
export function buildDurationPool() {
  const items = [];
  for (let m = 5; m <= 55; m += 5) items.push(durationMeta(0, m));
  items.unshift(durationMeta(0, 1)); // eine Minute
  for (let h = 1; h <= 12; h++) items.push(durationMeta(h, 0));
  const comboMins = [5, 10, 15, 20, 30, 45];
  for (let h = 1; h <= 6; h++) {
    for (const m of comboMins) items.push(durationMeta(h, m));
  }
  return items;
}

/** @type {Record<string, () => object[]>} */
export const TIME_POOL_BUILDERS = {
  "whole-hours": buildWholeHoursPool,
  "half-past": buildHalfPastPool,
  quarters: buildQuartersPool,
  minutes: buildMinutesPool,
  "digital-24h": buildDigital24hPool,
  duration: buildDurationPool,
};

export function buildTimePool(poolId) {
  const build = TIME_POOL_BUILDERS[poolId];
  return build ? build() : [];
}

export const TIME_POOLS = {
  "whole-hours": buildWholeHoursPool(),
  "half-past": buildHalfPastPool(),
  quarters: buildQuartersPool(),
  minutes: buildMinutesPool(),
  "digital-24h": buildDigital24hPool(),
  duration: buildDurationPool(),
};
