import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  emptyEvidenceStore,
  grainKeysForAttempt,
  recordAttemptEvidence,
  dealerStatsFromEvidence,
  contrastUnitPresets,
  weakConcepts,
  deriveNumbersEvidenceIds,
  isConceptEvidenceId,
  evidenceSnapshot,
  EVIDENCE_GRAIN,
} from "./multi-grain-evidence.js";
import { ATTEMPT_RECORD_FIELDS } from "./guidance-contracts.js";
import { dealExercise } from "../engine/dealer.js";

describe("multi-grain evidence (Slice 5)", () => {
  it("builds unit, unit×preset, and concept keys", () => {
    const keys = grainKeysForAttempt({
      dealKey: "numbers:cardinals:compounds",
      presetId: "convert",
      evidenceIds: [
        "compound.ones+und+tens",
        "compound.eins→ein",
        "eval.incorrect",
        "eval.cardinal.construction",
      ],
    });
    const kinds = keys.map((k) => k.kind);
    assert.ok(kinds.includes(EVIDENCE_GRAIN.UNIT));
    assert.ok(kinds.includes(EVIDENCE_GRAIN.UNIT_PRESET));
    assert.ok(kinds.includes(EVIDENCE_GRAIN.CONCEPT));
    assert.ok(keys.some((k) => k.key === "numbers:cardinals:compounds×convert"));
    assert.ok(keys.some((k) => k.conceptId === "compound.eins→ein"));
    assert.ok(!keys.some((k) => k.conceptId === "eval.incorrect"));
  });

  it("isConceptEvidenceId keeps morph rules, drops status tags", () => {
    assert.equal(isConceptEvidenceId("compound.eins→ein"), true);
    assert.equal(isConceptEvidenceId("shorten.sieben→sieb"), true);
    assert.equal(isConceptEvidenceId("eval.incorrect"), false);
    assert.equal(isConceptEvidenceId("eval.cardinal.construction"), false);
  });

  it("deriveNumbersEvidenceIds pulls eins→ein for compounds", () => {
    const ids = deriveNumbersEvidenceIds({
      value: 21,
      kind: "cardinal",
      status: "incorrect",
    });
    assert.ok(ids.includes("compound.eins→ein"));
    assert.ok(ids.includes("compound.ones+und+tens"));
    assert.ok(ids.includes("eval.incorrect"));
  });

  it("records grains so freeform can be weak while MC is OK", () => {
    const store = emptyEvidenceStore();
    const dealKey = "numbers:cardinals:compounds";
    // Convert (freeform) misses
    for (let i = 0; i < 3; i++) {
      recordAttemptEvidence(store, {
        dealKey,
        presetId: "convert",
        evidenceIds: ["compound.ones+und+tens"],
        correct: false,
      });
    }
    // Choose / listen (MC-like) hits
    for (let i = 0; i < 3; i++) {
      recordAttemptEvidence(store, {
        dealKey,
        presetId: "listen",
        evidenceIds: ["compound.ones+und+tens"],
        correct: true,
      });
    }
    const contrast = contrastUnitPresets(store, {
      dealKey,
      presetA: "convert",
      presetB: "listen",
    });
    assert.equal(contrast.ready, true);
    assert.ok(contrast.aAcc < contrast.bAcc);
    assert.equal(contrast.aWeaker, true);
    // Unit grain is blended
    assert.equal(store.grains[dealKey].total, 6);
    assert.equal(store.grains[dealKey].correct, 3);
  });

  it("tracks failing eins→ein as a weak concept", () => {
    const store = emptyEvidenceStore();
    recordAttemptEvidence(store, {
      dealKey: "numbers:cardinals:compounds",
      presetId: "convert",
      evidenceIds: ["compound.eins→ein", "compound.ones+und+tens"],
      correct: false,
    });
    recordAttemptEvidence(store, {
      dealKey: "numbers:cardinals:compounds",
      presetId: "convert",
      evidenceIds: ["compound.eins→ein"],
      correct: false,
    });
    const weak = weakConcepts(store, { threshold: 0.67, minTotal: 2 });
    assert.ok(weak.some((w) => w.stat.conceptId === "compound.eins→ein"));
  });

  it("dealerStatsFromEvidence feeds dealExercise (unit grain)", () => {
    const store = emptyEvidenceStore();
    const weakKey = "numbers:cardinals:compounds";
    const strongKey = "numbers:cardinals:teens";
    recordAttemptEvidence(store, {
      dealKey: weakKey,
      presetId: "convert",
      evidenceIds: ["compound.eins→ein"],
      correct: false,
    });
    recordAttemptEvidence(store, {
      dealKey: weakKey,
      presetId: "convert",
      evidenceIds: ["compound.eins→ein"],
      correct: false,
    });
    recordAttemptEvidence(store, {
      dealKey: strongKey,
      presetId: "build",
      evidenceIds: ["teen.13"],
      correct: true,
    });
    const candidates = [
      { key: weakKey, territory: "numbers" },
      { key: strongKey, territory: "numbers" },
      { key: "numbers:cardinals:hundreds", territory: "numbers" },
    ];
    const stats = dealerStatsFromEvidence(store, candidates);
    assert.equal(stats[weakKey].correct, 0);
    assert.equal(stats[weakKey].total, 2);
    const deal = dealExercise({
      candidates,
      seen: [weakKey, strongKey],
      stats,
    });
    assert.equal(deal?.reasonCode?.code, "review");
    assert.equal(deal?.candidate?.key, weakKey);
  });

  it("evidenceSnapshot matches attempt contract field", () => {
    assert.ok(ATTEMPT_RECORD_FIELDS.includes("evidenceIds"));
    const snap = evidenceSnapshot(["compound.eins→ein", "eval.incorrect"], {
      dealKey: "numbers:cardinals:compounds",
      presetId: "convert",
    });
    assert.deepEqual(snap.evidenceIds, [
      "compound.eins→ein",
      "eval.incorrect",
    ]);
    assert.deepEqual(snap.conceptIds, ["compound.eins→ein"]);
    assert.equal(
      snap.unitPresetKey,
      "numbers:cardinals:compounds×convert"
    );
  });
});
