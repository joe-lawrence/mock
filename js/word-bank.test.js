import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { nounAnalysis } from "../engine/nouns/noun.js";
import {
  addUserCard,
  buildReviewQuestion,
  cardMayEnterCaseFrame,
  comprehensionTap,
  composeInputPassage,
  emptyWordBank,
  introduceUnit,
  provedInputSentences,
  recordReviewResult,
  reviewKinds,
  reviewQueue,
} from "./word-bank.js";

describe("word bank and input", () => {
  it("keeps a user gloss card out of Case frames and sentences", () => {
    let bank = introduceUnit(emptyWordBank(), "case.acc.masc");
    bank = addUserCard(bank, "Blitz", "lightning");
    bank = addUserCard(bank, "Hund", "hound");
    const user = bank.cards["user:Blitz"];
    assert.equal(cardMayEnterCaseFrame(user), false);
    assert.equal(nounAnalysis("Blitz").known, false);
    const texts = provedInputSentences(bank).map((sentence) => sentence.text);
    assert.ok(texts.length > 0);
    assert.ok(texts.every((text) => !text.includes("Blitz")));
    assert.ok(texts.some((text) => text.includes("Hund")));
    const userHund = buildReviewQuestion(bank.cards["user:Hund"], bank);
    assert.equal(userHund.kind, "gloss");
    assert.equal(userHund.correct, "hound");
    assert.deepEqual(userHund.evidenceIds, []);
  });

  it("drops constructions the learner has not opened", () => {
    const acc = introduceUnit(emptyWordBank(), "case.acc.masc");
    const accTexts = provedInputSentences(acc).map((sentence) => sentence.text);
    assert.ok(accTexts.every((text) => text.startsWith("Ich sehe ") || text.startsWith("Ich habe ")));
    assert.ok(!accTexts.some((text) => /helfe|mit |warte|danke|gefällt|gibt|zeigt/.test(text)));

    const withHelp = introduceUnit(acc, "case.dat.helfen");
    const helped = provedInputSentences(withHelp);
    assert.ok(helped.some((sentence) => sentence.text.startsWith("Ich helfe ")));
    assert.ok(!helped.some((sentence) => sentence.unitId === "case.prep.mit"));
    assert.ok(!helped.some((sentence) => sentence.text.includes("Zeitung")));
  });

  it("grows review questions with the arc and does not score grammar", () => {
    const bare = emptyWordBank();
    bare.cards["curriculum:Hund"] = {
      id: "curriculum:Hund",
      source: "curriculum",
      lemma: "Hund",
      gloss: "dog",
      unitId: "case.acc.masc",
      introducedAt: 1,
      missedAt: null,
    };
    assert.deepEqual(reviewKinds(bare.cards["curriculum:Hund"], []), [
      "gloss",
      "nominative",
    ]);
    assert.equal(buildReviewQuestion(bare.cards["curriculum:Hund"], bare).correct, "der");

    let bank = introduceUnit(emptyWordBank(), "case.acc.masc", 10);
    assert.equal(buildReviewQuestion(bank.cards["curriculum:Hund"], bank).correct, "den");
    bank = introduceUnit(bank, "case.dat.helfen", 20);
    assert.equal(buildReviewQuestion(bank.cards["curriculum:Mann"], bank).correct, "dem");
    bank = introduceUnit(bank, "case.dat.indef", 30);
    assert.equal(buildReviewQuestion(bank.cards["curriculum:Frau"], bank).kind, "dative-indef");
    assert.equal(buildReviewQuestion(bank.cards["curriculum:Frau"], bank).correct, "einer");

    const missed = recordReviewResult(bank, "curriculum:Hund", false, 50);
    assert.deepEqual(missed.evidenceIds, []);
    const queue = reviewQueue(missed.bank, "path");
    assert.equal(queue[0].id, "curriculum:Hund");
    const list = reviewQueue(addUserCard(missed.bank, "Blitz", "lightning", 5), "list");
    assert.deepEqual(list.map((card) => card.id), ["user:Blitz"]);
  });

  it("builds a passage only from proved sentences and ignores comprehension taps", () => {
    let bank = introduceUnit(emptyWordBank(), "case.acc.masc");
    bank = introduceUnit(bank, "case.dat.helfen");
    const passage = composeInputPassage(bank);
    assert.ok(passage.length > 0);
    assert.ok(passage.length <= 4);
    assert.ok(passage.every((sentence) => sentence.text && sentence.gloss));
    assert.equal(comprehensionTap().evidenceIds.length, 0);
    const mixed = introduceUnit(bank, "case.mixed");
    assert.ok(
      provedInputSentences(mixed).some((sentence) => sentence.text === "Ich gebe dem Kind den Ball.")
    );
    assert.ok(
      !provedInputSentences(bank).some((sentence) => sentence.text === "Ich gebe dem Kind den Ball.")
    );
  });
});
