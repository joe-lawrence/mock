import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  caseTypePlaceholder,
  caseTypedAnswerMatches,
  compassPlaceholder,
  freeformPlaceholder,
} from "./answer-placeholders.js";
import { buildCasePlayDeck, buildCaseUnitQuestions } from "../../engine/nouns/case-questions.js";

describe("freeform placeholders", () => {
  it("uses a format sample and skips the item on screen", () => {
    assert.equal(
      freeformPlaceholder({ kind: "cardinal", value: 13, form: "dreizehn" }),
      "e.g. vierzehn"
    );
    assert.equal(
      freeformPlaceholder(
        { kind: "cardinal", value: 14, form: "vierzehn" },
        { reverse: true }
      ),
      "e.g. 13"
    );
    assert.equal(
      freeformPlaceholder(
        { kind: "cardinal", value: 13, form: "dreizehn", written: "13" },
        { reverse: true }
      ),
      "e.g. 16"
    );
  });

  it("splits whole euros from cents, and clock from digital", () => {
    assert.equal(
      freeformPlaceholder({ kind: "money", cents: 0, form: "drei Euro" }),
      "e.g. ein Euro"
    );
    assert.equal(
      freeformPlaceholder({ kind: "money", cents: 50, form: "ein Euro fünfzig" }),
      "e.g. zwei Euro fünfzig"
    );
    assert.equal(
      freeformPlaceholder(
        { kind: "money", cents: 0, written: "3,00 €" },
        { reverse: true }
      ),
      "e.g. 3 €"
    );
    assert.equal(
      freeformPlaceholder(
        { kind: "money", cents: 50, written: "3,50 €" },
        { reverse: true }
      ),
      "e.g. 12,50 €"
    );
    assert.equal(
      freeformPlaceholder({ kind: "clock", form: "zehn nach drei" }),
      "e.g. fünf vor halb zwei"
    );
    assert.equal(
      freeformPlaceholder(
        { kind: "clock", written: "03:30", form: "halb vier" },
        { reverse: true }
      ),
      "e.g. 9:15"
    );
    assert.equal(
      freeformPlaceholder(
        { kind: "clock", written: "21:15", form: "Viertel nach neun" },
        { reverse: true }
      ),
      "e.g. 14:05 (24h)"
    );
    assert.equal(
      freeformPlaceholder(
        { kind: "clock", written: "09:15", form: "Viertel nach neun" },
        { reverse: true }
      ),
      "e.g. 3:30"
    );
    assert.equal(
      freeformPlaceholder(
        { kind: "digital-time", written: "14:05" },
        { reverse: true }
      ),
      "e.g. 8:00"
    );
  });

  it("picks the measure unit’s own format", () => {
    assert.equal(
      freeformPlaceholder({ kind: "measure", unit: "Liter", form: "drei Liter" }),
      "e.g. ein Liter"
    );
    assert.equal(
      freeformPlaceholder(
        { kind: "measure", unit: "Stundenkilometer", written: "50 km/h" },
        { reverse: true }
      ),
      "e.g. 30 km/h"
    );
    assert.equal(
      freeformPlaceholder(
        { kind: "measure", unit: "Grad", written: "10 °C" },
        { reverse: true }
      ),
      "e.g. 21 °C"
    );
  });

  it("shows an article format that is not the accusative answer", () => {
    assert.equal(
      caseTypePlaceholder({ case: "accusative", correct: "den" }),
      "e.g. die"
    );
    assert.equal(
      caseTypePlaceholder({
        case: "dative",
        target: "noun",
        correct: "Hunden",
      }),
      "e.g. Kindern"
    );
  });

  it("accepts the article, the article and noun, or the whole sentence", () => {
    const ball = {
      target: "article",
      correct: "den",
      nounForm: "Ball",
      lemma: "Ball",
      sentence: "Ich habe den Ball.",
    };
    for (const answer of [
      "den",
      "Den",
      "den.",
      "den Ball",
      "den Ball.",
      "Ich habe den Ball",
      "Ich habe den Ball.",
      "ich habe den ball!",
    ]) {
      assert.equal(caseTypedAnswerMatches(ball, answer), true, answer);
    }
    for (const answer of ["dem", "dem Ball", "Ball", "Ich habe dem Ball.", "ein Ball"]) {
      assert.equal(caseTypedAnswerMatches(ball, answer), false, answer);
    }

    const indef = {
      target: "article",
      correct: "einen",
      nounForm: "Ball",
      sentence: "Ich habe einen Ball.",
    };
    assert.equal(caseTypedAnswerMatches(indef, "einen"), true);
    assert.equal(caseTypedAnswerMatches(indef, "einen Ball"), true);
    assert.equal(caseTypedAnswerMatches(indef, "Ich habe einen Ball"), true);
    assert.equal(caseTypedAnswerMatches(indef, "ein"), false);
    assert.equal(caseTypedAnswerMatches(indef, "ein Ball"), false);

    const frau = buildCasePlayDeck(buildCaseUnitQuestions("case.prep.fuer")).find(
      (card) =>
        card.quizType === "sentence-type" &&
        card.sentence === "Das Geschenk ist für die Frau."
    );
    assert.equal(caseTypedAnswerMatches(frau, "die"), true);
    assert.equal(caseTypedAnswerMatches(frau, "die Frau."), true);
    assert.equal(caseTypedAnswerMatches(frau, "Das Geschenk ist für die Frau"), true);
    assert.equal(caseTypedAnswerMatches(frau, "der Frau"), false);

    const plural = {
      target: "noun",
      correct: "Kindern",
      nounForm: "Kindern",
      sentence: "Ich helfe den Kindern.",
    };
    assert.equal(caseTypedAnswerMatches(plural, "Kindern"), true);
    assert.equal(caseTypedAnswerMatches(plural, "Kindern."), true);
    assert.equal(caseTypedAnswerMatches(plural, "den"), false);
    assert.equal(caseTypedAnswerMatches(plural, "den Kindern"), false);
  });

  it("gives the compass a direction that is not the cue", () => {
    assert.equal(compassPlaceholder(false, ["Nordosten"]), "e.g. Norden");
    assert.equal(compassPlaceholder(true, ["Northeast"]), "e.g. North");
  });
});
