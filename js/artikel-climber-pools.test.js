import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ACTIVE_SIZE,
  TARGET_STREAK,
  initClimberPools,
  markClimberCorrect,
  markClimberIncorrect,
  pickClimberWord,
} from "./artikel-climber-pools.js";

function sampleWords(n) {
  return Array.from({ length: n }, (_, i) => ({
    word: `W${i}`,
    article: "der",
    gender: "masc",
  }));
}

describe("artikel climber pools", () => {
  it("seeds an active pool and graduates after a streak", () => {
    const pools = initClimberPools(sampleWords(8));
    assert.equal(pools.activePool.length, ACTIVE_SIZE);
    assert.equal(pools.unseenPool.length, 3);
    const word = pools.activePool[0];
    for (let i = 0; i < TARGET_STREAK; i++) markClimberCorrect(pools, word);
    assert.equal(pools.graduatedPool.includes(word), true);
    assert.equal(pools.activePool.includes(word), false);
    assert.equal(pools.activePool.length, ACTIVE_SIZE);
  });

  it("demotes a graduated word after a miss", () => {
    const pools = initClimberPools(sampleWords(3));
    const word = pools.activePool[0];
    for (let i = 0; i < TARGET_STREAK; i++) markClimberCorrect(pools, word);
    assert.ok(pools.graduatedPool.includes(word));
    markClimberIncorrect(pools, word);
    assert.ok(pools.activePool.includes(word));
    assert.equal(pools.graduatedPool.includes(word), false);
  });

  it("avoids immediate repeats when the active pool has another word", () => {
    const pools = initClimberPools(sampleWords(5));
    const current = pools.activePool[0];
    const next = pickClimberWord({ ...pools, current }, () => 0);
    assert.ok(next);
    assert.notEqual(next, current);
  });
});
