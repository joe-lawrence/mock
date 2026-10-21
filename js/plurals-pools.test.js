import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { pluralPool } from "./plurals-pools.js";
import { productivePluralSpec } from "../../engine/nouns/plural-rules.js";

describe("plural pools", () => {
  it("predicts the suffix endings used in the ladder", () => {
    assert.equal(productivePluralSpec("Klappung").form, "Klappungen");
    assert.equal(productivePluralSpec("Blöndchen").ending, "—");
    assert.equal(productivePluralSpec("Glnorner").patternId, "ner");
    assert.equal(productivePluralSpec("Klopfer").patternId, "er");
    assert.equal(productivePluralSpec("Murfling"), null);
    assert.equal(productivePluralSpec("Plork"), null);
  });

  it("splits wugs, productive lemmas, one pattern each, and lexical leftovers", () => {
    const wugs = pluralPool("plural-wugs");
    const real = pluralPool("plural-real-words");
    const patterns = pluralPool("plural-patterns");
    const lexical = pluralPool("plural-lexical");

    assert.ok(wugs.some((item) => item.lemma === "Klappung" && item.form === "Klappungen"));
    assert.ok(!wugs.some((item) => item.lemma === "Murfling"));
    assert.ok(real.some((item) => item.lemma === "Zeitung"));
    assert.ok(real.some((item) => item.lemma === "Fahrer" && item.ending === "—"));
    assert.ok(!real.some((item) => item.lemma === "Buch"));
    assert.ok(lexical.some((item) => item.lemma === "Buch" && item.form === "Bücher"));
    assert.ok(lexical.some((item) => item.lemma === "Auto"));

    const realLemmas = new Set(real.map((item) => item.lemma));
    for (const item of lexical) assert.ok(!realLemmas.has(item.lemma));

    const patternIds = patterns.map((item) => item.patternId);
    assert.deepEqual(new Set(patternIds).size, patternIds.length);
    assert.ok(patternIds.includes("ung"));
    assert.ok(patternIds.includes("er"));
    assert.ok(patterns.some((item) => item.lemma === "Zeitung"));
    assert.ok(patterns.some((item) => item.lemma === "Fahrer"));

    for (const item of [...wugs, ...real, ...lexical, ...patterns]) {
      assert.ok(item.chooseForms.includes(item.form));
      assert.ok(item.chooseForms.length >= 2);
      assert.ok(item.proofAnswer === "Richtig" || item.proofAnswer === "Falsch");
      if (item.proofAnswer === "Richtig") assert.equal(item.proofShown, item.form);
      else assert.notEqual(item.proofShown, item.form);
    }
  });
});
