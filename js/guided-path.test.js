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
  it("moves to a harder step after three correct answers, and a miss stays on the step", () => {
    let progress = emptyGuidedProgress();
    for (let i = 0; i < STAGE_BLOCK - 1; i++) {
      progress = applyGuidedResult(progress, {
        pathKeys: path,
        correct: true,
        ladderLength: 3,
        unitKey: path[0],
      });
    }
    assert.equal(progress.stage, 0);
    assert.equal(progress.streak, 2);
    progress = applyGuidedResult(progress, {
      pathKeys: path,
      correct: false,
      ladderLength: 3,
      unitKey: path[0],
    });
    assert.equal(progress.streak, 0);
    assert.equal(progress.stage, 0);
    for (let i = 0; i < STAGE_BLOCK; i++) {
      progress = applyGuidedResult(progress, {
        pathKeys: path,
        correct: true,
        ladderLength: 3,
        unitKey: path[0],
      });
    }
    assert.equal(progress.openKey, path[0]);
    assert.equal(progress.stage, 1);
    assert.equal(progress.streak, 0);
  });

  it("graduates a one-step unit and opens the next", () => {
    let progress = emptyGuidedProgress();
    for (let i = 0; i < STAGE_BLOCK; i++) {
      progress = applyGuidedResult(progress, {
        pathKeys: path,
        correct: true,
        ladderLength: 1,
        unitKey: path[0],
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

  it("resumes a fresh profile from preset evidence", () => {
    const progress = hydrateGuidedProgress(
      emptyGuidedProgress(),
      path,
      {
        [path[0]]: ["sentence"],
        [path[1]]: ["listen", "build", "convert"],
      },
      {
        grains: {
          [`${path[0]}×sentence`]: { correct: 3, total: 3 },
          [`${path[1]}×listen`]: { correct: 3, total: 4 },
        },
      }
    );
    assert.deepEqual(progress.graduated, [path[0]]);
    assert.equal(progress.openKey, path[1]);
    assert.equal(progress.stage, 1);
  });

  it("a jump leaves the skipped units behind the open unit", () => {
    const progress = skipGuidedUnits(emptyGuidedProgress(), path, [path[0], path[1]]);
    assert.equal(progress.openKey, path[2]);
    assert.deepEqual(progress.skipped, [path[0], path[1]]);
    assert.deepEqual(progress.graduated, []);
  });
});
