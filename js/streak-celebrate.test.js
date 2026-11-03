import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  STREAK_MILESTONE,
  STREAK_PHRASES,
  bumpCorrectStreak,
  isCorrectStreakMilestone,
  streakCelebrationFor,
} from "./streak-celebrate.js";

describe("streak celebrate", () => {
  it("milestones every N correct", () => {
    assert.ok(STREAK_MILESTONE >= 1);
    assert.equal(isCorrectStreakMilestone(0), false);
    assert.equal(isCorrectStreakMilestone(STREAK_MILESTONE - 1), false);
    assert.equal(isCorrectStreakMilestone(STREAK_MILESTONE), true);
    assert.equal(isCorrectStreakMilestone(STREAK_MILESTONE * 2), true);
    assert.equal(isCorrectStreakMilestone(STREAK_MILESTONE + 1), false);
  });

  it("bumps the consecutive count", () => {
    assert.equal(bumpCorrectStreak(0), 1);
    assert.equal(bumpCorrectStreak(STREAK_MILESTONE - 1), STREAK_MILESTONE);
    assert.equal(bumpCorrectStreak(null), 1);
  });

  it("rotates German phrases across milestones", () => {
    assert.equal(STREAK_PHRASES.length, 6);
    const a = streakCelebrationFor(STREAK_MILESTONE);
    assert.equal(a.verdict, `${STREAK_MILESTONE} in a row!`);
    assert.equal(a.verdictSpoken, `${STREAK_MILESTONE} in Folge!`);
    assert.equal(a.de, "Sehr gut!");
    assert.equal(a.en, "Very good!");
    assert.ok(a.parts.length >= 2);
    assert.ok(a.parts.every((p) => p.text && p.guide));

    const b = streakCelebrationFor(STREAK_MILESTONE * 2);
    assert.equal(b.de, "Wunderbar!");
    assert.equal(b.en, "Wonderful!");

    const c = streakCelebrationFor(STREAK_MILESTONE * 3);
    assert.equal(c.de, "Toll gemacht!");

    const wrap = streakCelebrationFor(STREAK_MILESTONE * 7);
    assert.equal(wrap.de, STREAK_PHRASES[0].de);
  });
});
