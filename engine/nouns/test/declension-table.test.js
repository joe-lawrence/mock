import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CASE_CHART_ID,
  declensionDeck,
  declensionModes,
  gradeDeclensionAnswer,
  isDeclensionUnit,
} from "../declension-table.js";

function card(id) {
  return declensionDeck(CASE_CHART_ID).find((item) => item.id === id);
}

describe("declension tables", () => {
  it("unifies definite and indefinite under case.chart", () => {
    assert.equal(isDeclensionUnit(CASE_CHART_ID), true);
    assert.equal(isDeclensionUnit("case.prep.acc"), false);
    assert.deepEqual(declensionModes(), ["build", "choose"]);
    assert.ok(declensionDeck(CASE_CHART_ID).length > declensionDeck("case.table.definite").length);
  });

  it("fills the definite and indefinite tables without genitive", () => {
    const definite = card("table.definite.by-case.nominative");
    assert.deepEqual(
      definite.slots.map((slot) => slot.form).slice().sort(),
      ["das", "der", "die", "die"]
    );
    assert.deepEqual(
      definite.slots.map((slot) => slot.mark).slice().sort(),
      ["feminine", "masculine", "neuter", "plural"]
    );
    assert.deepEqual(
      card("table.indefinite.by-case.nominative").slots.map((slot) => slot.mark).slice().sort(),
      ["feminine", "kein", "masculine", "neuter"]
    );
    assert.deepEqual(
      card("table.definite.by-case.dative").slots.map((slot) => slot.form).slice().sort(),
      ["dem", "dem", "den", "der"]
    );
    const indefinite = card("table.indefinite.by-case.dative");
    assert.deepEqual(
      indefinite.slots.map((slot) => slot.form).slice().sort(),
      ["einem", "einem", "einer", "keinen"]
    );
    const forms = declensionDeck(CASE_CHART_ID)
      .filter((item) => item.quizType === "table-choose" && item.family === "Indefinite")
      .map((item) => item.prompt);
    assert.deepEqual(forms, ["ein", "eine", "keine", "einen", "einem", "einer", "keinen"]);
    assert.ok(!forms.includes("eines"));
    assert.ok(!forms.includes("des"));
  });

  it("asks by gender with the column as the cue and the cases as slots", () => {
    const feminine = card("table.definite.by-column.feminine");
    assert.equal(feminine.prompt, "Feminine");
    assert.equal(feminine.mark, "feminine");
    assert.deepEqual(
      feminine.slots.map((slot) => [slot.label, slot.form]).slice().sort(),
      [
        ["Accusative", "die"],
        ["Dative", "der"],
        ["Nominative", "die"],
      ]
    );
    const kein = card("table.indefinite.by-column.kein");
    assert.equal(kein.mark, "kein");
    assert.deepEqual(
      kein.slots.map((slot) => slot.form).slice().sort(),
      ["keine", "keine", "keinen"]
    );
  });

  it("offers die with every true cell plus distractors, and grades a partial selection", () => {
    const die = card("table.definite.by-article.die");
    assert.ok(die.choices.length >= 5 && die.choices.length <= 6);
    assert.equal(die.correctIds.length, 4);
    assert.deepEqual(
      [...die.correctIds].sort(),
      [
        "definite:accusative:feminine",
        "definite:accusative:plural",
        "definite:nominative:feminine",
        "definite:nominative:plural",
      ]
    );
    const grades = gradeDeclensionAnswer(die, ["definite:nominative:feminine"]);
    const feminine = grades.find((cell) => cell.id === "definite:nominative:feminine");
    const plural = grades.find((cell) => cell.id === "definite:nominative:plural");
    assert.equal(feminine.correct, true);
    assert.equal(plural.correct, false);
  });

  it("accepts die in both feminine and plural slots", () => {
    const row = card("table.definite.by-case.nominative");
    const grades = gradeDeclensionAnswer(row, row.slots.map((slot) => slot.form));
    assert.ok(grades.every((cell) => cell.correct));
    const pluralIndex = row.slots.findIndex((slot) => slot.mark === "plural");
    const feminineIndex = row.slots.findIndex((slot) => slot.mark === "feminine");
    const wrong = row.slots.map((slot) => slot.form);
    wrong[pluralIndex] = "der";
    const missed = gradeDeclensionAnswer(row, wrong);
    assert.equal(missed[pluralIndex].correct, false);
    assert.equal(missed[feminineIndex].correct, true);
  });
});
