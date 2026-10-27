/**
 * Measurement quiz pools for the Numbers mock.
 * Value × unit grids (rebuild via builders).
 */

import { measureAnalysis } from "../../engine/numbers/index.js?v=20260930-dmo16";

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
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200],
    ["Meter", "Zentimeter", "Kilometer"]
  );
}

export function buildWeightPool() {
  return [
    ...expand(
      [1, 2, 5, 10, 20, 25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 750],
      ["Gramm"]
    ),
    ...expand(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 50],
      ["Kilo", "Kilogramm"]
    ),
  ];
}

export function buildVolumePool() {
  return [
    ...expand(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 50],
      ["Liter"]
    ),
    ...expand(
      [50, 75, 100, 125, 150, 200, 250, 300, 330, 400, 500, 750],
      ["Milliliter"]
    ),
  ];
}

export function buildTempSpeedPool() {
  const temps = [];
  for (let t = 1; t <= 40; t++) temps.push(t);
  const speeds = [];
  for (let s = 10; s <= 200; s += 10) speeds.push(s);
  for (const s of [5, 15, 25, 35, 45, 55, 65, 75, 85, 95, 110, 130, 150, 180]) {
    if (!speeds.includes(s)) speeds.push(s);
  }
  speeds.sort((a, b) => a - b);
  return [
    ...expand(temps, ["Grad"]),
    ...expand(speeds, ["Stundenkilometer"]),
  ];
}

/** @type {Record<string, () => object[]>} */
export const MEASURE_POOL_BUILDERS = {
  length: buildLengthPool,
  weight: buildWeightPool,
  volume: buildVolumePool,
  "temp-speed": buildTempSpeedPool,
};

export function buildMeasurePool(poolId) {
  const build = MEASURE_POOL_BUILDERS[poolId];
  return build ? build() : [];
}

export const MEASURE_POOLS = {
  length: buildLengthPool(),
  weight: buildWeightPool(),
  volume: buildVolumePool(),
  "temp-speed": buildTempSpeedPool(),
};
