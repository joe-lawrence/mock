import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { keysSkippedByJump } from "./guided-jump.js";

const order = [
  "numbers:cardinals:base",
  "numbers:cardinals:teens",
  "numbers:cardinals:tens",
  "numbers:decimals:komma-read",
];

describe("guided jump", () => {
  it("skips the current step and everything before the chosen step", () => {
    assert.deepEqual(
      keysSkippedByJump(order, "numbers:cardinals:base", "numbers:cardinals:tens"),
      ["numbers:cardinals:base", "numbers:cardinals:teens"]
    );
  });

  it("skips only the current step when the next step is chosen", () => {
    assert.deepEqual(
      keysSkippedByJump(order, "numbers:cardinals:base", "numbers:cardinals:teens"),
      ["numbers:cardinals:base"]
    );
  });

  it("does not skip backward or onto the current step", () => {
    assert.deepEqual(
      keysSkippedByJump(order, "numbers:cardinals:tens", "numbers:cardinals:base"),
      []
    );
    assert.deepEqual(
      keysSkippedByJump(order, "numbers:cardinals:base", "numbers:cardinals:base"),
      []
    );
  });
});
