import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ACTIVE_SIZE,
  ANSWER_SPACING,
  TARGET_STREAK,
  initClimberPools,
  markClimberCorrect,
  markClimberIncorrect,
  pickClimberWord,
  preferSpacedAnswers,
  wordAnswerKey,
} from "./artikel-climber-pools.js";

function sampleWords(n) {
  return Array.from({ length: n }, (_, i) => ({
    word: `W${i}`,
    article: "der",
    gender: "masc",
  }));
}

function mixedGenderWords() {
  return [
    { word: "Hund", article: "der", gender: "masc" },
    { word: "Katze", article: "die", gender: "fem" },
    { word: "Kind", article: "das", gender: "neut" },
    { word: "Mann", article: "der", gender: "masc" },
    { word: "Frau", article: "die", gender: "fem" },
    { word: "Buch", article: "das", gender: "neut" },
  ];
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

  it("preferSpacedAnswers skips keys seen in the recent window", () => {
    const words = mixedGenderWords();
    // Full gender window → fall back to “not last answer”.
    const spaced = preferSpacedAnswers(words, ["der", "die", "das"]);
    assert.ok(spaced.every((w) => wordAnswerKey(w) !== "das"));
    const soft = preferSpacedAnswers(words, ["der", "der"]);
    assert.ok(soft.every((w) => wordAnswerKey(w) !== "der"));
    const partial = preferSpacedAnswers(words, ["der", "die"]);
    assert.ok(partial.every((w) => wordAnswerKey(w) === "das"));
    assert.equal(ANSWER_SPACING, 3);
  });

  it("pickClimberWord avoids repeating the same answer across a short run", () => {
    const pools = initClimberPools(mixedGenderWords());
    const recent = [];
    const keys = [];
    for (let i = 0; i < 12; i++) {
      const next = pickClimberWord(
        { ...pools, current: null },
        () => 0.99,
        { recentAnswers: recent }
      );
      assert.ok(next);
      const key = wordAnswerKey(next);
      keys.push(key);
      recent.push(key);
      if (recent.length > ANSWER_SPACING * 4) recent.shift();
    }
    // No run of ANSWER_SPACING+1 identical answers when alternatives exist.
    for (let i = ANSWER_SPACING; i < keys.length; i++) {
      const window = keys.slice(i - ANSWER_SPACING, i + 1);
      const allSame = window.every((k) => k === window[0]);
      assert.equal(
        allSame,
        false,
        `answers ${window.join(",")} at ${i}`
      );
    }
  });
});
