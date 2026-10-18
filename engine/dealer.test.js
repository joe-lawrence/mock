import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  dealExercise,
  DEALER_REASONS,
  WEAK_ACCURACY,
  HIGH_HINT_DEPTH,
} from "./dealer.js";

const PRESET_SEEDS = {
  listen: 0.35,
  build: 0.45,
  convert: 0.55,
};

function cand(key, presets = ["listen", "build", "convert"], mode = "listen") {
  const [, topicId, stepId] = key.split(":");
  return {
    key,
    territory: "numbers",
    topicId,
    stepId,
    mode,
    presets,
  };
}

describe("Dealer v1 (Slice 6)", () => {
  it("legacy: weak unit → review/edge", () => {
    const compounds = cand("numbers:cardinals:compounds");
    const teens = cand("numbers:cardinals:teens");
    const deal = dealExercise({
      candidates: [teens, compounds],
      seen: [compounds.key, teens.key],
      stats: {
        [compounds.key]: { correct: 0, total: 3 },
        [teens.key]: { correct: 3, total: 3 },
      },
      presetSeeds: PRESET_SEEDS,
    });
    assert.equal(deal?.candidate?.key, compounds.key);
    assert.ok(
      deal.reasonCode.code === "review" ||
        deal.reasonCode.code === "edge_of_competence"
    );
  });

  it("scaffold_adjust when recent hint depth is high", () => {
    const compounds = cand("numbers:cardinals:compounds", [
      "listen",
      "convert",
    ]);
    const deal = dealExercise({
      candidates: [compounds],
      seen: [compounds.key],
      stats: { [compounds.key]: { correct: 2, total: 2 } },
      evidence: {
        grains: {
          [compounds.key]: {
            correct: 2,
            total: 2,
            kind: "unit",
          },
        },
      },
      presetSeeds: PRESET_SEEDS,
      recentHintDepth: HIGH_HINT_DEPTH,
      recentDealKey: compounds.key,
    });
    assert.equal(deal?.reasonCode?.code, "scaffold_adjust");
    assert.equal(deal?.candidate?.mode, "listen");
    assert.equal(deal?.audit?.features?.preset, "listen");
  });

  it("felt_too_hard eases the next preset", () => {
    const compounds = cand("numbers:cardinals:compounds", [
      "listen",
      "convert",
    ]);
    const deal = dealExercise({
      candidates: [compounds],
      seen: [compounds.key],
      stats: { [compounds.key]: { correct: 2, total: 2 } },
      presetSeeds: PRESET_SEEDS,
      recentFeltDifficulty: "too-hard",
      recentDealKey: compounds.key,
    });
    assert.equal(deal?.reasonCode?.code, "felt_too_hard");
    assert.equal(deal?.candidate?.mode, "listen");
  });

  it("felt_too_easy stretches to a harder preset", () => {
    const compounds = cand("numbers:cardinals:compounds", [
      "listen",
      "convert",
    ]);
    const deal = dealExercise({
      candidates: [compounds],
      seen: [compounds.key],
      stats: { [compounds.key]: { correct: 2, total: 2 } },
      presetSeeds: PRESET_SEEDS,
      recentFeltDifficulty: "too-easy",
      recentDealKey: compounds.key,
    });
    assert.equal(deal?.reasonCode?.code, "felt_too_easy");
    assert.equal(deal?.candidate?.mode, "convert");
  });

  it("review re-deals weak Build when Convert is already OK", () => {
    const tens = cand("numbers:cardinals:tens");
    const deal = dealExercise({
      candidates: [tens, cand("numbers:cardinals:compounds")],
      seen: [tens.key],
      stats: { [tens.key]: { correct: 2, total: 3 } },
      evidence: {
        grains: {
          [tens.key]: { correct: 2, total: 3, kind: "unit" },
          [`${tens.key}×build`]: {
            correct: 0,
            total: 1,
            kind: "unit×preset",
          },
          [`${tens.key}×convert`]: {
            correct: 2,
            total: 2,
            kind: "unit×preset",
          },
        },
      },
      presetSeeds: PRESET_SEEDS,
    });
    assert.equal(deal?.reasonCode?.code, "review");
    assert.equal(deal?.candidate?.key, tens.key);
    assert.equal(deal?.candidate?.mode, "build");
    assert.equal(deal?.audit?.features?.preset, "build");
  });

  it("edge_of_competence when freeform weak and MC OK", () => {
    const compounds = cand("numbers:cardinals:compounds");
    const deal = dealExercise({
      candidates: [compounds, cand("numbers:cardinals:teens")],
      seen: [compounds.key],
      stats: { [compounds.key]: { correct: 3, total: 6 } },
      evidence: {
        grains: {
          [compounds.key]: { correct: 3, total: 6, kind: "unit" },
          [`${compounds.key}×listen`]: {
            correct: 3,
            total: 3,
            kind: "unit×preset",
          },
          [`${compounds.key}×convert`]: {
            correct: 0,
            total: 3,
            kind: "unit×preset",
          },
        },
      },
      presetSeeds: PRESET_SEEDS,
    });
    assert.equal(deal?.reasonCode?.code, "edge_of_competence");
    assert.equal(deal?.candidate?.key, compounds.key);
    assert.equal(deal?.candidate?.mode, "convert");
    assert.ok(deal.audit.features.hardAcc < WEAK_ACCURACY);
    assert.ok(deal.audit.features.easyAcc >= WEAK_ACCURACY);
  });

  it("probe_mastery on untested harder preset when unit is strong", () => {
    const compounds = cand("numbers:cardinals:compounds");
    const deal = dealExercise({
      candidates: [compounds],
      seen: [compounds.key],
      stats: { [compounds.key]: { correct: 4, total: 4 } },
      evidence: {
        grains: {
          [compounds.key]: { correct: 4, total: 4, kind: "unit" },
          [`${compounds.key}×listen`]: {
            correct: 4,
            total: 4,
            kind: "unit×preset",
          },
          // convert untested
        },
      },
      presetSeeds: PRESET_SEEDS,
      recentHintDepth: 0,
    });
    assert.equal(deal?.reasonCode?.code, "probe_mastery");
    assert.equal(deal?.candidate?.mode, "convert");
    assert.equal(deal?.audit?.features?.untested, true);
  });

  it("komma vs euro contrast prefers the weak side", () => {
    const komma = cand("numbers:decimals:komma-read", ["listen", "convert"]);
    const euro = cand("numbers:decimals:money-euros", ["listen", "convert"]);
    const deal = dealExercise({
      candidates: [komma, euro],
      seen: [komma.key, euro.key],
      stats: {
        [komma.key]: { correct: 0, total: 2 },
        [euro.key]: { correct: 2, total: 2 },
      },
      evidence: {
        grains: {
          [komma.key]: { correct: 0, total: 2, kind: "unit" },
          [euro.key]: { correct: 2, total: 2, kind: "unit" },
        },
      },
      presetSeeds: PRESET_SEEDS,
    });
    // Weak unit tier fires before contrast; either way komma is chosen.
    assert.equal(deal?.candidate?.key, komma.key);
    assert.ok(
      ["review", "edge_of_competence"].includes(deal.reasonCode.code)
    );
  });

  it("new follows soft arc order", () => {
    const base = cand("numbers:cardinals:base");
    const teens = cand("numbers:cardinals:teens");
    const compounds = cand("numbers:cardinals:compounds");
    const softArc = [base.key, teens.key, compounds.key];
    const deal = dealExercise({
      candidates: [compounds, teens, base],
      seen: [base.key],
      stats: { [base.key]: { correct: 1, total: 1 } },
      softArc,
      presetSeeds: PRESET_SEEDS,
    });
    assert.equal(deal?.reasonCode?.code, "new");
    assert.equal(deal?.candidate?.key, teens.key);
  });

  it("exposes new reason codes", () => {
    assert.equal(DEALER_REASONS.probe_mastery.code, "probe_mastery");
    assert.equal(DEALER_REASONS.edge_of_competence.code, "edge_of_competence");
    assert.equal(DEALER_REASONS.scaffold_adjust.code, "scaffold_adjust");
  });
});
