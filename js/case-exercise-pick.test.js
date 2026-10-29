import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildCasePlayDeck,
  buildCaseUnitQuestions,
  caseDeckForPreset,
} from "../engine/nouns/case-questions.js";
import {
  emptyEvidenceStore,
  recordAttemptEvidence,
  EVIDENCE_GRAIN,
} from "./multi-grain-evidence.js";
import {
  caseSentenceKey,
  pickCaseExerciseIndex,
} from "./case-exercise-pick.js";

const dealKey = "case:accusative:masc";
const play = buildCasePlayDeck(buildCaseUnitQuestions("case.acc.masc"));
const proof = caseDeckForPreset(play, "proofread");
const sentence = caseDeckForPreset(play, "sentence");

function attempt(card, presetId, correct) {
  return {
    dealKey,
    presetId,
    evidenceIds: [card.assesses],
    itemKey: caseSentenceKey(card),
    itemLabel: card.sentence,
    correct,
  };
}

describe("guided case exercise instance", () => {
  it("shares one sentence key across article presets and keeps the concept id", () => {
    const store = emptyEvidenceStore();
    const keys = recordAttemptEvidence(store, attempt(sentence[0], "sentence", true));
    assert.equal(caseSentenceKey(proof[0]), caseSentenceKey(sentence[0]));
    assert.notEqual(caseSentenceKey(proof[0]), caseSentenceKey(proof[1]));
    assert.ok(caseSentenceKey(proof[0]).endsWith(`:${proof[0].lemma}`));
    assert.ok(keys.some((key) => key.kind === EVIDENCE_GRAIN.CONCEPT));
    const proofKeys = recordAttemptEvidence(store, attempt(proof[0], "proofread", true));
    assert.ok(
      proofKeys.some((key) => key.conceptId === proof[0].assesses)
    );
    assert.ok(
      keys.some(
        (key) =>
          key.kind === EVIDENCE_GRAIN.ITEM &&
          key.key.endsWith(caseSentenceKey(proof[0])) &&
          key.label === proof[0].sentence
      )
    );
  });

  it("opens on the first sentence, then a different one for the next preset", () => {
    assert.equal(
      pickCaseExerciseIndex(proof, { dealKey, grains: {}, reasonCode: "new" }),
      0
    );
    const store = emptyEvidenceStore();
    recordAttemptEvidence(store, attempt(proof[0], "proofread", true));
    const next = pickCaseExerciseIndex(sentence, {
      dealKey,
      grains: store.grains,
      reasonCode: "probe_mastery",
      heldSentenceKey: caseSentenceKey(proof[0]),
    });
    assert.notEqual(caseSentenceKey(sentence[next]), caseSentenceKey(proof[0]));
  });

  it("repeats the sentence when a harder shape is earned", () => {
    const store = emptyEvidenceStore();
    recordAttemptEvidence(store, attempt(proof[0], "proofread", true));
    for (const reasonCode of ["felt_too_easy", "edge_of_competence"]) {
      const index = pickCaseExerciseIndex(sentence, {
        dealKey,
        grains: store.grains,
        reasonCode,
        heldSentenceKey: caseSentenceKey(proof[0]),
      });
      assert.equal(caseSentenceKey(sentence[index]), caseSentenceKey(proof[0]));
    }
  });

  it("skips a sentence that was left without an answer", () => {
    const index = pickCaseExerciseIndex(proof, {
      dealKey,
      grains: {},
      reasonCode: "new",
      heldSentenceKey: caseSentenceKey(proof[0]),
    });
    assert.equal(caseSentenceKey(proof[index]), caseSentenceKey(proof[1]));
  });

  it("returns to a missed sentence after the others have been seen", () => {
    const store = emptyEvidenceStore();
    sentence.forEach((card, index) => {
      recordAttemptEvidence(store, attempt(card, "sentence", index !== 2));
    });
    const index = pickCaseExerciseIndex(sentence, {
      dealKey,
      grains: store.grains,
      reasonCode: "review",
    });
    assert.equal(index, 2);
  });
});
