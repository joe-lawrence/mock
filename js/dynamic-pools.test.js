import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildFullDatesPool,
  buildDatePool,
  DATE_POOL_BUILDERS,
} from "./dates-pools.js";
import {
  buildMinutesPool,
  buildDigital24hPool,
  buildDurationPool,
  TIME_POOL_BUILDERS,
} from "./time-pools.js";
import {
  buildLengthPool,
  buildVolumePool,
  buildTempSpeedPool,
  MEASURE_POOL_BUILDERS,
} from "./measure-pools.js";
import {
  buildOrdinalDatesUsePool,
  ORDINAL_POOL_BUILDERS,
} from "./ordinals-pools.js";
import {
  buildMixedNumbersPool,
  FRACTION_POOL_BUILDERS,
} from "./fractions-pools.js";

describe("dynamic Numbers pools", () => {
  it("exposes builders for every expanded pool family", () => {
    for (const id of [
      "full-dates",
      "minutes",
      "digital-24h",
      "duration",
      "length",
      "volume",
      "temp-speed",
      "ordinal-dates-use",
      "mixed-numbers",
    ]) {
      assert.ok(
        DATE_POOL_BUILDERS[id] ||
          TIME_POOL_BUILDERS[id] ||
          MEASURE_POOL_BUILDERS[id] ||
          ORDINAL_POOL_BUILDERS[id] ||
          FRACTION_POOL_BUILDERS[id],
        `missing builder: ${id}`
      );
    }
  });

  it("full-dates covers every valid day·month plus year samples", () => {
    const pool = buildFullDatesPool();
    assert.ok(pool.length >= 365 + 12 * 3);
    assert.ok(pool.every((m) => m.kind === "calendar-date"));
    assert.ok(pool.some((m) => m.year == null));
    assert.ok(pool.some((m) => m.year != null));
    // Feb has no day 30
    assert.equal(
      pool.some((m) => m.month === 2 && m.day === 30 && m.year == null),
      false
    );
  });

  it("time minutes / digital / duration are full grids", () => {
    assert.equal(buildMinutesPool().length, 24 * 8);
    assert.equal(buildDigital24hPool().length, 24 * 12);
    const dur = buildDurationPool();
    assert.ok(dur.length >= 50);
    assert.ok(dur.some((m) => m.hours === 0 && m.minutes === 1));
    assert.ok(dur.some((m) => m.hours === 2 && m.minutes === 15));
  });

  it("measure grids expand value×unit", () => {
    assert.ok(buildLengthPool().length >= 60);
    assert.ok(buildVolumePool().length >= 25);
    assert.ok(buildTempSpeedPool().length >= 60);
  });

  it("ordinal dates-use is 1–31; mixed numbers are rule-generated", () => {
    assert.equal(buildOrdinalDatesUsePool().length, 31);
    const mixed = buildMixedNumbersPool();
    assert.ok(mixed.length >= 80);
    assert.ok(mixed.every((m) => m.kind === "mixed-fraction"));
  });

  it("builders return fresh arrays", () => {
    assert.notEqual(buildDatePool("full-dates"), buildDatePool("full-dates"));
    assert.notEqual(buildMinutesPool(), buildMinutesPool());
  });
});
