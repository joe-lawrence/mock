import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { vocabulary } from "./generated/vocabulary.js";
import { associateDealKey, vocabItemIdsForDecks } from "./vocab-progress.js";

describe("vocabulary associate unit", () => {
  it("maps every active word onto one curriculum unit", () => {
    for (const item of Object.values(vocabulary)) {
      if (item.status && item.status !== "active") continue;
      const key = associateDealKey(item);
      assert.ok(key, item.id);
      assert.equal(key.includes("vocabulary"), false);
    }
  });

  it("credits case, numbers, and nouns words to the unit that introduces them", () => {
    assert.equal(associateDealKey(vocabulary["vocab.case.sehen"]), "case:accusative:masc");
    assert.equal(associateDealKey(vocabulary["vocab.case.fuer"]), "case:accusative:fuer");
    assert.equal(
      associateDealKey(vocabulary["vocab.case.geben"]),
      "case:mixed:sentences"
    );
    assert.equal(
      associateDealKey(vocabulary["vocab.numbers.zahl"]),
      "numbers:cardinals:number-words"
    );
    assert.equal(
      associateDealKey(vocabulary["vocab.numbers.zeit"]),
      "numbers:time:time-words"
    );
    assert.equal(
      associateDealKey(vocabulary["vocab.nouns.zeitung"]),
      "nouns:suffixes:real-words"
    );
    assert.equal(
      associateDealKey(vocabulary["vocab.nouns.montag"]),
      "nouns:categories:gender-recognition"
    );
  });

  it("lists the words in a guided vocab deck", () => {
    const ids = vocabItemIdsForDecks([
      {
        vocabTopic: "case",
        vocabIntroducedBy: ["case.accusative"],
      },
    ]);
    assert.ok(ids.includes("vocab.case.sehen"));
    assert.ok(ids.includes("vocab.case.fuer"));
    assert.equal(ids.includes("vocab.case.helfen"), false);
  });
});
