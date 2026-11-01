import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dealExercise } from "../../engine/dealer.js";
import {
  guidedSchedulingView,
  mergeEvidenceStores,
  unitKeysFromEvidence,
} from "./guided-history.js";

const PRESET_SEEDS = { listen: 0.35, build: 0.45, convert: 0.55 };

function cand(key, presets = ["listen", "build", "convert"], mode = "listen") {
  const [, topicId, stepId] = key.split(":");
  return { key, territory: "numbers", topicId, stepId, mode, presets };
}

const base = "numbers:cardinals:base";
const teens = "numbers:cardinals:teens";

describe("guided history", () => {
  it("reads unit keys and ignores preset, item, and concept grains", () => {
    const keys = unitKeysFromEvidence({
      grains: {
        [base]: { correct: 3, total: 4, kind: "unit" },
        [`${base}×listen`]: { correct: 1, total: 1, kind: "unit×preset" },
        [`${base}×listen×eins`]: { correct: 0, total: 1, kind: "item" },
        "concept:tens.60": { correct: 0, total: 1, kind: "concept" },
        [teens]: { correct: 1, total: 1 },
        "concept:orphan": { correct: 1, total: 1 },
      },
    });
    assert.deepEqual(keys.sort(), [base, teens].sort());
  });

  it("adds this run on top of the previous-session snapshot", () => {
    const merged = mergeEvidenceStores(
      {
        grains: {
          [base]: { correct: 2, total: 2, kind: "unit" },
          [`${base}×build`]: { correct: 1, total: 2, kind: "unit×preset", presetId: "build" },
        },
      },
      {
        grains: {
          [base]: { correct: 1, total: 1, kind: "unit" },
          "concept:compound.eins→ein": {
            correct: 0,
            total: 1,
            kind: "concept",
            conceptId: "compound.eins→ein",
          },
        },
      }
    );
    assert.equal(merged.grains[base].correct, 3);
    assert.equal(merged.grains[base].total, 3);
    assert.equal(merged.grains[`${base}×build`].correct, 1);
    assert.equal(merged.grains["concept:compound.eins→ein"].total, 1);
  });

  it("picks up a strong previous session at the next unseen unit", () => {
    const view = guidedSchedulingView({
      history: {
        grains: {
          [base]: { correct: 4, total: 4, kind: "unit" },
        },
      },
      sessionEvidence: { grains: {} },
      sessionSeen: [],
    });
    const first = cand(base);
    const second = cand(teens);
    const deal = dealExercise({
      candidates: [first, second],
      seen: [...view.seen],
      evidence: view.evidence,
      softArc: [base, teens],
      presetSeeds: PRESET_SEEDS,
    });
    assert.equal(deal?.candidate?.key, teens);
    assert.equal(deal?.reasonCode?.code, "new");
  });

  it("reviews a weak unit from a previous session before introducing a new one", () => {
    const view = guidedSchedulingView({
      history: {
        grains: {
          [base]: { correct: 0, total: 3, kind: "unit" },
          [`${base}×listen`]: { correct: 0, total: 3, kind: "unit×preset", presetId: "listen" },
        },
      },
      sessionEvidence: { grains: {} },
      sessionSeen: [],
    });
    const deal = dealExercise({
      candidates: [cand(base), cand(teens)],
      seen: [...view.seen],
      evidence: view.evidence,
      softArc: [base, teens],
      presetSeeds: PRESET_SEEDS,
    });
    assert.equal(deal?.candidate?.key, base);
    assert.equal(deal?.reasonCode?.code, "review");
  });

  it("keeps a jump-ahead unit seen even when it has no score", () => {
    const view = guidedSchedulingView({
      history: { grains: {} },
      sessionEvidence: { grains: {} },
      sessionSeen: [teens],
    });
    assert.ok(view.seen.has(teens));
    const deal = dealExercise({
      candidates: [cand(base), cand(teens)],
      seen: [...view.seen],
      evidence: view.evidence,
      softArc: [base, teens],
      presetSeeds: PRESET_SEEDS,
    });
    assert.equal(deal?.candidate?.key, base);
    assert.equal(deal?.reasonCode?.code, "new");
  });

  it("starts at the first unit when there is no history", () => {
    const view = guidedSchedulingView({
      history: null,
      sessionEvidence: null,
      sessionSeen: null,
    });
    assert.equal(view.seen.size, 0);
    const deal = dealExercise({
      candidates: [cand(base), cand(teens)],
      seen: [...view.seen],
      evidence: view.evidence,
      softArc: [base, teens],
      presetSeeds: PRESET_SEEDS,
    });
    assert.equal(deal?.candidate?.key, base);
    assert.equal(deal?.reasonCode?.code, "new");
  });
});
