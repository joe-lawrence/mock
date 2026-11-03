import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  GUIDED_PICK,
  contentKeyOf,
  coverageTake,
  normalizeQuestionText,
  numberSenseSurfaceKey,
  orderedContentKeys,
  drawFromPool,
  drawPromptNumber,
  markCoverage,
  pickGuidedContent,
  promptSlots,
  slicesForLadder,
  spanSample,
} from "./guided-coverage.js";

const base = Array.from({ length: 13 }, (_, n) => `n:${n}`);
const ladder = ["listen", "build", "convert"];

describe("guided coverage", () => {
  it("spreads a cardinal unit across skills instead of repeating the first values", () => {
    const required = spanSample(orderedContentKeys(base), coverageTake("numbers:cardinals:base", base.length));
    assert.deepEqual(required, base);
    const slices = slicesForLadder(required, ladder);
    assert.deepEqual(slices.listen, ["n:0", "n:3", "n:6", "n:9", "n:12"]);
    assert.deepEqual(slices.build, ["n:1", "n:4", "n:7", "n:10"]);
    assert.deepEqual(slices.convert, ["n:2", "n:5", "n:8", "n:11"]);
    assert.equal(slices.listen.includes("n:1"), false);
  });

  it("asks for the next uncovered example, not the one just answered", () => {
    const slice = ["n:0", "n:3", "n:6", "n:9", "n:12"];
    const first = pickGuidedContent({ slice, salt: 0 });
    assert.equal(first.contentKey, "n:3");
    assert.equal(first.reason, GUIDED_PICK.cover);
    const second = pickGuidedContent({
      slice,
      correct: ["n:3"],
      recent: ["n:3"],
      salt: 0,
    });
    assert.equal(second.contentKey, "n:6");
    const again = pickGuidedContent({
      slice,
      correct: ["n:3"],
      recent: ["n:3", "n:3"],
      salt: 0,
    });
    assert.equal(again.contentKey, "n:6");
    const zero = pickGuidedContent({
      slice,
      correct: ["n:3", "n:6", "n:9", "n:12"],
      salt: 0,
    });
    assert.equal(zero.contentKey, "n:0");
    assert.notEqual(
      pickGuidedContent({ slice, salt: 2 }).contentKey,
      first.contentKey
    );
  });

  it("repairs a miss before reviewing items that are already correct", () => {
    const slice = ["n:0", "n:3", "n:6"];
    const pick = pickGuidedContent({
      slice,
      correct: ["n:3", "n:6"],
      wrong: ["n:0"],
      recent: ["n:6"],
    });
    assert.equal(pick.contentKey, "n:0");
    assert.equal(pick.reason, GUIDED_PICK.repair);
  });

  it("reviews a finished slice by bringing back the least recent item", () => {
    const slice = ["id:a", "id:b"];
    const pick = pickGuidedContent({
      slice,
      correct: slice,
      recent: ["id:a", "id:b"],
    });
    assert.equal(pick.contentKey, "id:a");
    assert.equal(pick.reason, GUIDED_PICK.retrieve);
  });

  it("samples both ends of a long unit instead of its first items", () => {
    const hundreds = Array.from({ length: 901 }, (_, i) => `n:${100 + i}`);
    const sample = spanSample(
      orderedContentKeys(hundreds),
      coverageTake("numbers:cardinals:hundreds", hundreds.length)
    );
    assert.equal(sample.length, 12);
    assert.equal(sample[0], "n:100");
    assert.equal(sample.at(-1), "n:1000");
    assert.notEqual(sample[1], "n:101");
  });

  it("treats punctuation as the same question and a different number as a different one", () => {
    assert.equal(normalizeQuestionText("die Zahl 3."), normalizeQuestionText("die Zahl 3"));
    assert.notEqual(normalizeQuestionText("the number 3"), normalizeQuestionText("the number 7"));
    assert.equal(contentKeyOf(0), "n:0");
    assert.equal(contentKeyOf({ id: "zahl-digit", form: "die Zahl 3" }), "id:zahl-digit");
    assert.equal(
      contentKeyOf({ pattern: "zahl-phrase", value: 8, id: "zahl-phrase:8" }),
      "zahl-phrase:8"
    );
    assert.notEqual(
      contentKeyOf({ id: "zahl-digit" }),
      contentKeyOf({ id: "zahl-ist", form: "Die Zahl ist 4." })
    );
  });

  it("fingerprints number-sense surfaces for de-dupe without collapsing slots", () => {
    assert.ok(GUIDED_PICK.contrast?.code === "contrast");
    const a = numberSenseSurfaceKey({
      word: "Zahl",
      task: "phrase",
      direction: "forward",
      prompt: "The number is 3.",
      value: 3,
    });
    const b = numberSenseSurfaceKey({
      word: "Zahl",
      task: "phrase",
      direction: "forward",
      prompt: "The number is 3.",
      value: 3,
    });
    const c = numberSenseSurfaceKey({
      word: "Zahl",
      task: "phrase",
      direction: "reverse",
      prompt: "die Zahl",
      value: 3,
    });
    assert.equal(a, b);
    assert.notEqual(a, c);
  });

  it("draws a whole number from the range, and skips one just used when it can", () => {
    const templates = [
      { pattern: "zahl-phrase", sampleTake: 2 },
      { pattern: "zahl-sentence", sampleTake: 1 },
    ];
    assert.deepEqual(promptSlots(templates), [
      "zahl-phrase#1",
      "zahl-phrase#2",
      "zahl-sentence#1",
    ]);
    assert.equal(drawPromptNumber(0, 9, [], () => 0), 0);
    assert.equal(drawPromptNumber(0, 9, [], () => 0.999), 9);
    assert.equal(drawPromptNumber(0, 9, [0], () => 0), 1);
    assert.equal(drawPromptNumber(0, 99, [], () => 0), 0);
    assert.equal(drawPromptNumber(0, 99, [], () => 0.999), 99);
    assert.equal(drawFromPool([20, 30, 40], [], () => 0), 20);
    assert.equal(drawFromPool([20, 30, 40], [], () => 0.999), 40);
    assert.equal(drawFromPool([20, 30, 40], [20], () => 0), 30);
    const saved = markCoverage(
      { "numbers:cardinals:number-words": { correct: [], wrong: [], recent: [], required: [] } },
      "numbers:cardinals:number-words",
      "zahl-phrase#1",
      true
    );
    assert.equal(saved["numbers:cardinals:number-words"].correct.includes("zahl-phrase#1"), true);
  });
});
