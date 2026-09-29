/**
 * Measurement quiz pools for the Numbers mock.
 */

import { measureAnalysis } from "../engine/numbers/index.js?v=20260929-dmo4";

function measureMeta(value, unit) {
  const a = measureAnalysis(value, unit);
  return {
    kind: "measure",
    value,
    unit,
    written: a.written,
    form: a.form,
    english: a.englishWritten,
    grain: "construction",
    parts: [...a.segments.construction],
  };
}

function expand(values, units) {
  const items = [];
  for (const v of values) {
    for (const u of units) items.push(measureMeta(v, u));
  }
  return items;
}

export function buildLengthPool() {
  return expand(
    [1, 2, 3, 5, 10, 12, 20, 25, 50, 100],
    ["Meter", "Zentimeter", "Kilometer"]
  );
}

export function buildWeightPool() {
  return [
    ...expand([1, 2, 5, 10, 100, 200, 250, 500], ["Gramm"]),
    ...expand([1, 2, 3, 5, 10], ["Kilo", "Kilogramm"]),
  ];
}

export function buildVolumePool() {
  return [
    ...expand([1, 2, 3, 5, 10], ["Liter"]),
    ...expand([100, 200, 250, 500], ["Milliliter"]),
  ];
}

export function buildTempSpeedPool() {
  return [
    ...expand([1, 5, 10, 15, 20, 25, 30], ["Grad"]),
    ...expand([30, 50, 80, 100, 120], ["Stundenkilometer"]),
  ];
}

export const MEASURE_POOLS = {
  length: buildLengthPool(),
  weight: buildWeightPool(),
  volume: buildVolumePool(),
  "temp-speed": buildTempSpeedPool(),
};
