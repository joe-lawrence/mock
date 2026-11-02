import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  STAGE_BLOCK,
  NUMBERS_GUIDED_ORDER,
  applyGuidedResult,
  emptyGuidedProgress,
  hydrateGuidedProgress,
  orderGuidedKeys,
  planGuidedStep,
  presetLadder,
  skipGuidedUnits,
} from "./guided-path.js";

const SEEDS = {
  listen: 0.35,
  proofread: 0.4,
  build: 0.45,
  convert: 0.55,
  sentence: 0.6,
};

const path = [
  "numbers:cardinals:number-words",
  "numbers:cardinals:base",
  "numbers:decimals:place-value",
  "numbers:decimals:money-context",
  "numbers:decimals:money-euros",
];

function ladderOf(key) {
  if (key.endsWith("number-words") || key.endsWith("money-context")) return ["sentence"];
  return ["listen", "build", "convert"];
}

describe("guided path order", () => {
  it("opens Cardinals with number words and places money phrases before euro amounts", () => {
    const keys = orderGuidedKeys([
      "numbers:cardinals:base",
      "numbers:cardinals:number-words",
      "numbers:decimals:money-euros",
      "numbers:decimals:money-context",
      "numbers:decimals:komma-read",
      "numbers:decimals:place-value",
      "nouns:suffixes:wugs",
      "case:accusative:masc",
    ]);
    assert.deepEqual(keys.slice(0, 6), [
      "numbers:cardinals:number-words",
      "numbers:cardinals:base",
      "numbers:decimals:komma-read",
      "numbers:decimals:place-value",
      "numbers:decimals:money-context",
      "numbers:decimals:money-euros",
    ]);
    assert.deepEqual(keys.slice(6), ["nouns:suffixes:wugs", "case:accusative:masc"]);
    assert.equal(NUMBERS_GUIDED_ORDER[0], "numbers:cardinals:number-words");
    assert.equal(NUMBERS_GUIDED_ORDER[1], "numbers:cardinals:base");
    assert.ok(
      NUMBERS_GUIDED_ORDER.indexOf("numbers:cardinals:base") <
        NUMBERS_GUIDED_ORDER.indexOf("numbers:cardinals:number-senses")
    );
    assert.ok(
      NUMBERS_GUIDED_ORDER.indexOf("numbers:cardinals:number-senses") <
        NUMBERS_GUIDED_ORDER.indexOf("numbers:cardinals:amount-words")
    );
    assert.ok(
      NUMBERS_GUIDED_ORDER.indexOf("numbers:cardinals:amount-words") <
        NUMBERS_GUIDED_ORDER.indexOf("numbers:cardinals:teens")
    );
    assert.ok(
      NUMBERS_GUIDED_ORDER.indexOf("numbers:time:time-words") <
        NUMBERS_GUIDED_ORDER.indexOf("numbers:time:whole-hours")
    );
    assert.ok(
      NUMBERS_GUIDED_ORDER.indexOf("numbers:measurement:measure-context") <
        NUMBERS_GUIDED_ORDER.indexOf("numbers:measurement:length")
    );
  });
});

describe("preset ladder", () => {
  it("climbs listen, then build, then typing when the allowlist is longer", () => {
    assert.deepEqual(
      presetLadder(["build", "listen", "convert", "proofread"], SEEDS),
      ["listen", "build", "convert"]
    );
  });

  it("keeps a one-preset unit on that preset", () => {
    assert.deepEqual(presetLadder(["sentence"], SEEDS), ["sentence"]);
  });
});

describe("graduation", () => {
  it("stays on a step until each required item is correct, and a miss returns that item", () => {
    const slice = ["n:0", "n:3", "n:6"];
    let progress = emptyGuidedProgress();
    progress = applyGuidedResult(progress, {
      pathKeys: path,
      correct: true,
      ladderLength: 3,
      unitKey: path[0],
      contentKey: "n:0",
      slice,
    });
    progress = applyGuidedResult(progress, {
      pathKeys: path,
      correct: true,
      ladderLength: 3,
      unitKey: path[0],
      contentKey: "n:0",
      slice,
    });
    assert.equal(progress.stage, 0);
    assert.deepEqual(progress.coverage[path[0]].correct, ["n:0"]);
    progress = applyGuidedResult(progress, {
      pathKeys: path,
      correct: false,
      ladderLength: 3,
      unitKey: path[0],
      contentKey: "n:0",
      slice,
    });
    assert.equal(progress.streak, 0);
    assert.deepEqual(progress.coverage[path[0]].correct, []);
    assert.deepEqual(progress.coverage[path[0]].wrong, ["n:0"]);
    for (const contentKey of ["n:0", "n:3", "n:6"]) {
      progress = applyGuidedResult(progress, {
        pathKeys: path,
        correct: true,
        ladderLength: 3,
        unitKey: path[0],
        contentKey,
        slice,
      });
    }
    assert.equal(progress.openKey, path[0]);
    assert.equal(progress.stage, 1);
    assert.equal(progress.streak, 0);
  });

  it("graduates a one-step unit only after its slice is correct", () => {
    const slice = ["id:zahl-digit", "id:zahl-digit-7", "id:zahl-ist"];
    let progress = emptyGuidedProgress();
    for (let i = 0; i < STAGE_BLOCK; i++) {
      progress = applyGuidedResult(progress, {
        pathKeys: path,
        correct: true,
        ladderLength: 1,
        unitKey: path[0],
        contentKey: slice[0],
        slice,
      });
    }
    assert.deepEqual(progress.graduated, []);
    assert.equal(progress.openKey, path[0]);
    for (const contentKey of slice) {
      progress = applyGuidedResult(progress, {
        pathKeys: path,
        correct: true,
        ladderLength: 1,
        unitKey: path[0],
        contentKey,
        slice,
      });
    }
    assert.deepEqual(progress.graduated, [path[0]]);
    assert.equal(progress.openKey, path[1]);
  });

  it("does not let a review card change the open unit's streak", () => {
    let progress = applyGuidedResult(emptyGuidedProgress(), {
      pathKeys: path,
      correct: true,
      ladderLength: 1,
      unitKey: path[0],
    });
    progress = applyGuidedResult(progress, {
      pathKeys: path,
      correct: true,
      review: true,
      ladderLength: 1,
      unitKey: path[1],
    });
    assert.equal(progress.streak, 1);
    assert.equal(progress.openKey, path[0]);
  });

  it("deals the open unit, then a finished unit on every fourth card", () => {
    const progress = {
      ...emptyGuidedProgress(),
      graduated: [path[0]],
      openKey: path[1],
      deals: 3,
    };
    const plan = planGuidedStep({ pathKeys: path, progress, ladderOf });
    assert.equal(plan.review, true);
    assert.equal(plan.key, path[0]);
    assert.equal(plan.presetId, "sentence");
    const focus = planGuidedStep({
      pathKeys: path,
      progress: { ...progress, deals: 4 },
      ladderOf,
    });
    assert.equal(focus.review, false);
    assert.equal(focus.key, path[1]);
    assert.equal(focus.presetId, "listen");
  });

  it("rewinds a step that advanced before any coverage was recorded", () => {
    const progress = hydrateGuidedProgress(
      {
        ...emptyGuidedProgress(),
        graduated: [path[0]],
        openKey: path[1],
        stage: 2,
        streak: 2,
      },
      path
    );
    assert.equal(progress.openKey, path[1]);
    assert.equal(progress.stage, 0);
    assert.equal(progress.streak, 0);
  });

  it("does not treat a short run of correct answers as a finished unit", () => {
    const progress = hydrateGuidedProgress(emptyGuidedProgress(), path);
    assert.deepEqual(progress.graduated, []);
    assert.equal(progress.openKey, path[0]);
    assert.equal(progress.stage, 0);
  });

  it("a jump leaves the skipped units behind the open unit", () => {
    const progress = skipGuidedUnits(emptyGuidedProgress(), path, [path[0], path[1]]);
    assert.equal(progress.openKey, path[2]);
    assert.deepEqual(progress.skipped, [path[0], path[1]]);
    assert.deepEqual(progress.graduated, []);
  });
});
