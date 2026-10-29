import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  declensionDeck,
  declensionModes,
  gradeDeclensionAnswer,
  isDeclensionUnit,
} from "../declension-table.js";

function card(unitId, id) {
  return declensionDeck(unitId).find((item) => item.id === id);
}

describe("declension tables", () => {
  it("sits in front of the sentence units as two visual quizzes", () => {
    assert.equal(isDeclensionUnit("case.table.definite"), true);
    assert.equal(isDeclensionUnit("case.acc.masc"), false);
    assert.deepEqual(declensionModes(), ["build", "choose"]);
  });

  it("fills the definite and indefinite tables without genitive", () => {
    const definite = card("case.table.definite", "table.definite.by-case.nominative");
    assert.deepEqual(
      definite.slots.map((slot) => slot.form),
      ["der", "die", "das", "die"]
    );
    assert.deepEqual(
      definite.slots.map((slot) => [slot.label, slot.mark]),
      [
        ["Masculine", "masculine"],
        ["Feminine", "feminine"],
        ["Neuter", "neuter"],
        ["Plural", "plural"],
      ]
    );
    assert.deepEqual(
      card("case.table.indefinite", "table.indefinite.by-case.nominative").slots.map(
        (slot) => [slot.label, slot.mark]
      ),
      [
        ["Masculine", "masculine"],
        ["Feminine", "feminine"],
        ["Neuter", "neuter"],
        ["Kein", "kein"],
      ]
    );
    assert.deepEqual(
      card("case.table.definite", "table.definite.by-case.dative").slots.map((slot) => slot.form),
      ["dem", "der", "dem", "den"]
    );
    const indefinite = card("case.table.indefinite", "table.indefinite.by-case.dative");
    assert.deepEqual(
      indefinite.slots.map((slot) => slot.form),
      ["einem", "einer", "einem", "keinen"]
    );
    const forms = declensionDeck("case.table.indefinite")
      .filter((item) => item.quizType === "table-choose")
      .map((item) => item.prompt);
    assert.deepEqual(forms, ["ein", "eine", "keine", "einen", "einem", "einer", "keinen"]);
    assert.ok(!forms.includes("eines"));
    assert.ok(!forms.includes("keiner"));
    assert.ok(!forms.includes("des"));
  });

  it("asks by gender with the column as the cue and the cases as slots", () => {
    const feminine = card("case.table.definite", "table.definite.by-column.feminine");
    assert.equal(feminine.prompt, "Feminine");
    assert.equal(feminine.mark, "feminine");
    assert.deepEqual(
      feminine.slots.map((slot) => [slot.label, slot.form]),
      [
        ["Nominative", "die"],
        ["Accusative", "die"],
        ["Dative", "der"],
      ]
    );
    const kein = card("case.table.indefinite", "table.indefinite.by-column.kein");
    assert.equal(kein.mark, "kein");
    assert.deepEqual(
      kein.slots.map((slot) => slot.form),
      ["keine", "keine", "keinen"]
    );
  });

  it("offers die with every true cell plus distractors, and grades a partial selection", () => {
    const die = card("case.table.definite", "table.definite.by-article.die");
    assert.ok(die.choices.length >= 5 && die.choices.length <= 6);
    assert.equal(die.correctIds.length, 4);
    assert.deepEqual(
      [...die.correctIds].sort(),
      [
        "accusative:feminine",
        "accusative:plural",
        "nominative:feminine",
        "nominative:plural",
      ]
    );
    const grades = gradeDeclensionAnswer(die, ["nominative:feminine"]);
    const feminine = grades.find((cell) => cell.id === "nominative:feminine");
    const plural = grades.find((cell) => cell.id === "nominative:plural");
    assert.equal(feminine.correct, true);
    assert.equal(plural.correct, false);
  });

  it("accepts die in both feminine and plural slots", () => {
    const row = card("case.table.definite", "table.definite.by-case.nominative");
    const grades = gradeDeclensionAnswer(row, ["der", "die", "das", "die"]);
    assert.ok(grades.every((cell) => cell.correct));
    const missed = gradeDeclensionAnswer(row, ["der", "die", "das", "der"]);
    assert.equal(missed[3].correct, false);
    assert.equal(missed[1].correct, true);
  });
});
