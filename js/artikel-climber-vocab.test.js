import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildNavTree, vocabularyUnitsIn } from "./nav-carousel.js";
import {
  climberWordCountForUnit,
  climberWordFromItem,
  climberWordsFromVocabUnits,
} from "./artikel-climber-vocab.js";
import { getVocabulary } from "./generated/vocabulary.js";

describe("artikel climber vocab", () => {
  it("maps gendered vocabulary items and skips items without gender", () => {
    const zahl = getVocabulary("vocab.numbers.zahl");
    const mapped = climberWordFromItem(zahl);
    assert.ok(mapped);
    assert.equal(mapped.word, "Zahl");
    assert.equal(mapped.article, "die");
    assert.equal(mapped.gender, "fem");
  });

  it("builds a non-empty pool from Vocabulary nav sections", () => {
    const vocabs = vocabularyUnitsIn(buildNavTree());
    assert.ok(vocabs.length > 0);
    const withWords = vocabs.filter((u) => climberWordCountForUnit(u) > 0);
    assert.ok(withWords.length > 0, "expected at least one gendered section");
    const pool = climberWordsFromVocabUnits(withWords);
    assert.ok(pool.length > 0);
    assert.ok(pool.every((w) => w.article && w.gender && w.word));
    const ids = new Set(pool.map((w) => w.vocabId));
    assert.equal(ids.size, pool.length);
  });

  it("returns an empty pool when nothing is selected", () => {
    assert.deepEqual(climberWordsFromVocabUnits([]), []);
    assert.deepEqual(climberWordsFromVocabUnits(null), []);
  });
});
