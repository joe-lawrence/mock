import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCaseTrial,
  caseGovernorsFromVocabItems,
  correctCaseArticle,
  gateRowForCase,
  GENDER_LANES,
  DEFAULT_CASE_GOVERNORS,
} from "./artikel-skier-cases.js";

describe("artikel-skier-cases color-match rows", () => {
  it("keeps fixed masc/fem/neut/plur lane order", () => {
    assert.deepEqual(GENDER_LANES, ["masc", "fem", "neut", "plur"]);
  });

  it("returns dative and accusative definite rows with plural", () => {
    assert.deepEqual(gateRowForCase("dat", "def"), [
      "dem",
      "der",
      "dem",
      "den",
    ]);
    assert.deepEqual(gateRowForCase("acc", "def"), [
      "den",
      "die",
      "das",
      "die",
    ]);
  });

  it("returns indefinite rows with kein plural", () => {
    assert.deepEqual(gateRowForCase("acc", "indef"), [
      "einen",
      "eine",
      "ein",
      "keine",
    ]);
    assert.deepEqual(gateRowForCase("dat", "indef"), [
      "einem",
      "einer",
      "einem",
      "keinen",
    ]);
  });

  it("correct article is gender/number ∩ case row", () => {
    assert.equal(correctCaseArticle("dat", "masc", "sg", "def"), "dem");
    assert.equal(correctCaseArticle("dat", "fem", "sg", "def"), "der");
    assert.equal(correctCaseArticle("dat", "neut", "sg", "def"), "dem");
    assert.equal(correctCaseArticle("acc", "masc", "pl", "def"), "die");
    assert.equal(correctCaseArticle("dat", "masc", "pl", "def"), "den");
    assert.equal(correctCaseArticle("acc", "masc", "sg", "indef"), "einen");
    assert.equal(correctCaseArticle("acc", "masc", "pl", "indef"), "keine");
    assert.equal(correctCaseArticle("dat", "fem", "pl", "indef"), "keinen");
  });

  it("builds plural trials on the plur lane", () => {
    let sawPl = false;
    for (let i = 0; i < 80; i++) {
      const t = buildCaseTrial(
        DEFAULT_CASE_GOVERNORS,
        { word: "Katze", article: "die", gender: "fem", caseGoverns: ["acc"] },
        { indefChance: 0, pluralChance: 1 }
      );
      assert.equal(t.number, "pl");
      assert.equal(t.tint, "plur");
      assert.equal(t.gateArticles.length, 4);
      assert.equal(t.correctArticle, t.gateArticles[3]);
      sawPl = true;
    }
    assert.ok(sawPl);
  });

  it("ignores nouns when extracting governors", () => {
    const govs = caseGovernorsFromVocabItems([
      { type: "noun", surface: "Mann", governs: ["accusative"] },
      { type: "function_word", surface: "mit", governs: ["dative"] },
    ]);
    assert.deepEqual(govs, [{ surface: "mit", case: "dat" }]);
  });
});
