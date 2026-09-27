/**
 * Decimals / money quiz pools for the Numbers mock.
 */

import {
  decimalAnalysis,
  moneyAnalysis,
} from "../engine/numbers/index.js?v=20260927-dec2";

function decimalMeta(whole, fracDigits) {
  const a = decimalAnalysis(whole, fracDigits);
  return {
    kind: "decimal",
    whole,
    fracDigits: [...fracDigits],
    written: a.written,
    form: a.form,
    english: a.englishWritten,
    grain: "construction",
    parts: [...a.segments.construction],
  };
}

function moneyMeta(euros, cents) {
  const a = moneyAnalysis(euros, cents);
  return {
    kind: "money",
    euros,
    cents,
    written: a.written,
    form: a.form,
    english: a.englishWritten,
    grain: "construction",
    parts: [...a.segments.construction],
  };
}

/** 1-place: 0,0–100,9 · 2-place: 0,00–20,99 */
export function buildKommaPool() {
  const items = [];
  for (let w = 0; w <= 100; w++) {
    for (let d = 0; d <= 9; d++) items.push(decimalMeta(w, [d]));
  }
  for (let w = 0; w <= 20; w++) {
    for (let f = 0; f <= 99; f++) {
      items.push(decimalMeta(w, [Math.floor(f / 10), f % 10]));
    }
  }
  return items;
}

/** Same coverage as Komma reading — place-value build focus. */
export function buildPlaceValuePool() {
  return buildKommaPool();
}

/** Writing focus: denser 2-place set on small wholes. */
export function buildWriteKommaPool() {
  const items = [];
  for (let w = 0; w <= 50; w++) {
    for (let d = 0; d <= 9; d++) items.push(decimalMeta(w, [d]));
  }
  for (let w = 0; w <= 30; w++) {
    for (let f = 0; f <= 99; f++) {
      items.push(decimalMeta(w, [Math.floor(f / 10), f % 10]));
    }
  }
  return items;
}

/** Whole euros 1–200. */
export function buildMoneyEurosPool() {
  const items = [];
  for (let e = 1; e <= 200; e++) items.push(moneyMeta(e, 0));
  return items;
}

/** Euros 0–50 × cents 0–99 (includes Cent-only when euros=0). */
export function buildMoneyCentsPool() {
  const items = [];
  for (let e = 0; e <= 50; e++) {
    for (let c = 0; c <= 99; c++) {
      if (e === 0 && c === 0) continue;
      items.push(moneyMeta(e, c));
    }
  }
  return items;
}

export const DECIMAL_POOLS = {
  "komma-read": buildKommaPool(),
  "place-value": buildPlaceValuePool(),
  "write-komma": buildWriteKommaPool(),
  "money-euros": buildMoneyEurosPool(),
  "money-cents": buildMoneyCentsPool(),
};
