import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SUPPORT_LEXICON_POOLS } from "./support-lexicon.js";

function tokens(sentence) {
  return String(sentence || "")
    .replace(/[?.]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

describe("support lexicon questions", () => {
  it("puts each support word in an example sentence", () => {
    const want = {
      "number-words": ["Zahl", "Nummer", "Anzahl", "zählen", "Menge"],
      "time-words": ["Zeit"],
      "money-context": ["Preis", "kosten", "Geld", "billig", "teuer"],
      "date-context": ["Datum"],
      "measure-context": ["Maß"],
    };
    for (const [poolId, words] of Object.entries(want)) {
      const items = SUPPORT_LEXICON_POOLS[poolId];
      assert.ok(items?.length, poolId);
      for (const word of words) {
        const hit = items.find((item) => item.word === word);
        assert.ok(hit, `${poolId} missing ${word}`);
        assert.equal(hit.kind, "example-sentence");
        assert.ok(hit.choices.includes(hit.expect));
        assert.ok(tokens(hit.form).includes(hit.token), hit.form);
      }
    }
  });

  it("quizzes Hälfte, doppelt, einmal, and zweimal as the answer", () => {
    const items = SUPPORT_LEXICON_POOLS["fraction-words"];
    for (const word of ["Hälfte", "doppelt", "einmal", "zweimal"]) {
      const rows = items.filter((item) => item.word === word);
      assert.equal(rows.length, 2, word);
      assert.ok(rows.every((item) => item.kind === "lex-word"));
      assert.ok(rows.every((item) => item.choices.includes(item.expect)));
      assert.ok(rows.some((item) => item.promptLang === "en"));
      assert.ok(rows.some((item) => item.promptLang === "de"));
    }
    assert.equal(
      items.some((item) => item.kind === "example-sentence"),
      false
    );
  });
});
