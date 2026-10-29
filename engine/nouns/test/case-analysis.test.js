import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ANALYSIS_CASE_CHOICES,
  ANALYSIS_ROLE_CHOICES,
  buildCaseAnalysisDeck,
} from "../case-analysis.js";
import { CASE_ANALYSIS_UNIT, caseAttemptEvidence, caseUnitModes } from "../case-questions.js";
import { caseDeckForPreset } from "../case-questions.js";

const STAGE_ORDER = [
  "transitive",
  "dative-verb",
  "three-phrase",
  "requirements",
  "proofread",
  "gefallen",
];

function rolesOf(deck, sentence) {
  return deck
    .filter((card) => card.quizType === "role" && card.sentence === sentence)
    .map((card) => [card.focusPhrase, card.correct]);
}

describe("sentence analysis deck", () => {
  const deck = buildCaseAnalysisDeck();

  it("follows the agreed sequence and keeps role then case together", () => {
    const stages = deck.map((card) => STAGE_ORDER.indexOf(card.stage));
    assert.ok(stages.every((index) => index >= 0));
    for (let i = 1; i < stages.length; i++) {
      assert.ok(stages[i] >= stages[i - 1], deck[i].playId);
    }
    assert.equal(deck.at(-1).stage, "gefallen");
    assert.equal(deck.at(-1).sentence, "Das Buch gefällt dem Mann.");
    for (let i = 0; i < deck.length; i++) {
      if (deck[i].quizType !== "role") continue;
      const next = deck[i + 1];
      assert.equal(next.quizType, "case-name");
      assert.equal(next.sentence, deck[i].sentence);
      assert.equal(next.focusPhrase, deck[i].focusPhrase);
    }
  });

  it("asks for every role in geben and zeigen", () => {
    assert.deepEqual(rolesOf(deck, "Ich gebe dem Kind den Ball."), [
      ["Ich", "Subject"],
      ["dem Kind", "Dative object"],
      ["den Ball", "Accusative object"],
    ]);
    assert.deepEqual(rolesOf(deck, "Die Frau zeigt dem Mann das Buch."), [
      ["Die Frau", "Subject"],
      ["dem Mann", "Dative object"],
      ["das Buch", "Accusative object"],
    ]);
    const gebenCases = deck.filter(
      (card) => card.quizType === "case-name" && card.sentence === "Ich gebe dem Kind den Ball."
    );
    assert.deepEqual(
      gebenCases.map((card) => card.correct),
      ["Nominative", "Dative", "Accusative"]
    );
  });

  it("keeps prepositional phrases out of the role deck", () => {
    const roleSentences = deck
      .filter((card) => card.quizType === "role")
      .map((card) => card.sentence);
    assert.deepEqual(
      [...new Set(roleSentences)],
      [
        "Der Mann sieht den Hund.",
        "Der Lehrer hilft dem Schüler.",
        "Ich gebe dem Kind den Ball.",
        "Die Frau zeigt dem Mann das Buch.",
        "Das Buch gefällt dem Mann.",
      ]
    );
  });

  it("validates every choice, answer, and distractor", () => {
    const ids = new Set();
    for (const card of deck) {
      assert.equal(ids.has(card.playId), false, card.playId);
      ids.add(card.playId);
      assert.ok(card.choices.includes(card.correct), card.playId);
      assert.equal(new Set(card.choices).size, card.choices.length, card.playId);
      if (card.quizType === "role") {
        assert.deepEqual(card.choices, [...ANALYSIS_ROLE_CHOICES]);
        assert.ok(ANALYSIS_ROLE_CHOICES.includes(card.correct));
        assert.ok(card.sentence.includes(card.focusPhrase), card.playId);
        assert.equal(card.interaction.presetId, "choose");
        assert.equal(card.interaction.response, "multi-select");
        assert.ok(card.assesses.startsWith("recognize.role."));
      } else if (card.quizType === "case-name") {
        assert.deepEqual(card.choices, [...ANALYSIS_CASE_CHOICES]);
        assert.ok(ANALYSIS_CASE_CHOICES.includes(card.correct));
        assert.ok(card.sentence.includes(card.focusPhrase), card.playId);
        assert.equal(card.interaction.presetId, "choose");
        assert.ok(card.assesses.startsWith("recognize.case."));
      } else if (card.quizType === "case-requirement") {
        assert.deepEqual(card.choices, [...ANALYSIS_CASE_CHOICES]);
        assert.ok(card.correct === "Accusative" || card.correct === "Dative");
        assert.equal(card.choices.includes("Nominative"), true);
        assert.equal(card.interaction.presetId, "choose");
        assert.equal(card.interaction.stimulus, "value");
        assert.ok(card.assesses.startsWith("apply."));
        assert.match(card.prompt, / — /);
      } else if (card.quizType === "proofread") {
        assert.deepEqual(card.choices, ["Richtig", "Falsch"]);
        assert.ok(card.correct === "Richtig" || card.correct === "Falsch");
        assert.equal(card.interaction.presetId, "proofread");
        assert.equal(card.interaction.response, "binary");
        assert.ok(card.focusPhrase && card.prompt.includes(card.focusPhrase));
        if (card.foil === "article") {
          assert.equal(card.cue, "");
          assert.ok(card.assesses.startsWith("judge.article."));
          assert.equal(card.prompt === card.sentence, card.correct === "Richtig");
        } else if (card.foil === "role") {
          assert.ok(ANALYSIS_ROLE_CHOICES.includes(card.cue), card.playId);
          assert.equal(card.prompt, card.sentence);
          assert.ok(card.assesses.startsWith("judge.role."));
          assert.equal(card.correct === "Richtig", card.cue === expectedRole(card));
        } else if (card.foil === "case") {
          assert.ok(ANALYSIS_CASE_CHOICES.includes(card.cue), card.playId);
          assert.equal(card.prompt, card.sentence);
          assert.ok(card.assesses.startsWith("judge.case."));
          assert.equal(card.correct === "Richtig", card.cue === expectedCase(card));
        } else {
          assert.fail(card.foil);
        }
      } else {
        assert.fail(card.quizType);
      }
    }
    const foils = new Set(deck.filter((card) => card.foil).map((card) => card.foil));
    assert.deepEqual([...foils].sort(), ["article", "case", "role"]);
  });

  it("names the construction in warten auf and passen zu feedback", () => {
    const warten = deck.find((card) => card.prompt.startsWith("warten auf"));
    const passen = deck.find((card) => card.prompt.startsWith("passen zu"));
    assert.equal(warten.correct, "Accusative");
    assert.match(warten.answerCue, /^In warten auf,/);
    assert.equal(/auf always|auf takes the accusative/i.test(warten.answerCue), false);
    assert.equal(passen.correct, "Dative");
    assert.match(passen.answerCue, /^In passen zu,/);
  });

  it("places gefallen last with an explanation and the reference page", () => {
    const cards = deck.filter((card) => card.stage === "gefallen");
    assert.equal(cards.length, 4);
    assert.ok(cards.every((card) => card.referenceId === "case.verb.gefallen"));
    assert.ok(cards.every((card) => /grammatical subject|person who likes the book/.test(card.help)));
    assert.equal(cards[0].correct, "Subject");
    assert.equal(cards[1].correct, "Nominative");
    assert.equal(cards[2].correct, "Dative object");
    assert.equal(cards[3].correct, "Dative");
    const proofAt = deck.findIndex((card) => card.stage === "proofread");
    const gefallenAt = deck.findIndex((card) => card.stage === "gefallen");
    assert.ok(proofAt < gefallenAt);
  });

  it("uses Choose and Proofread and records the foil that was judged", () => {
    assert.deepEqual(caseUnitModes(CASE_ANALYSIS_UNIT), ["choose", "proofread"]);
    const choose = caseDeckForPreset(deck, "choose");
    const proof = caseDeckForPreset(deck, "proofread");
    assert.ok(choose.every((card) => card.interaction.presetId === "choose"));
    assert.ok(proof.every((card) => card.interaction.presetId === "proofread"));
    assert.equal(choose.length + proof.length, deck.length);
    for (const card of proof) {
      const ev = caseAttemptEvidence(card, false);
      assert.deepEqual(ev.evidenceIds, [card.assesses]);
      assert.equal(ev.componentFollowup, null);
      assert.ok(/^judge\.(article|role|case)\./.test(card.assesses));
    }
    const roleMiss = caseAttemptEvidence(deck.find((card) => card.quizType === "role"), false);
    const caseMiss = caseAttemptEvidence(deck.find((card) => card.quizType === "case-name"), false);
    assert.notEqual(roleMiss.evidenceIds[0], caseMiss.evidenceIds[0]);
  });
});

function expectedRole(card) {
  const known = {
    "den Hund": "Accusative object",
    "Der Lehrer": "Subject",
    "dem Kind": "Dative object",
    "das Buch": "Accusative object",
  };
  return known[card.focusPhrase] || "";
}

function expectedCase(card) {
  const known = {
    "dem Schüler": "Dative",
    "Der Mann": "Nominative",
    "den Ball": "Accusative",
  };
  return known[card.focusPhrase] || "";
}
