import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SUPPORT_LEXICON_POOLS, realizeNumberPrompt } from "./support-lexicon.js";

function tokens(sentence) {
  return String(sentence || "")
    .replace(/[?.]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

describe("support lexicon questions", () => {
  it("puts each support word in an example sentence", () => {
    const want = {
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

  it("offers one natural sentence for each prompt", () => {
    const byId = new Map();
    for (const items of Object.values(SUPPORT_LEXICON_POOLS)) {
      for (const item of items) byId.set(item.id, item);
    }
    const keyed = {
      kosten: ["That costs five euros.", "Das kostet fünf Euro."],
      preis: ["The price is three euros.", "Der Preis ist drei Euro."],
      geld: ["I have money.", "Ich habe Geld."],
      "mass-meter": ["The meter is a unit of measure.", "Der Meter ist ein Maß."],
    };
    for (const [id, [english, form]] of Object.entries(keyed)) {
      const item = byId.get(id);
      assert.equal(item.english, english, id);
      assert.equal(item.form, form, id);
      assert.equal(item.choices.filter((choice) => choice === form).length, 1, id);
    }
    const banned = {
      "zeit-habe": ["Ich habe Uhr.", "Die Zeit ist Uhr."],
      "zeit-hast": ["Hast du Uhr?", "Ist die Zeit?"],
      preis: [
        "Das Geld ist drei Euro.",
        "Das kostet drei Euro.",
        "Das ist drei Euro.",
        "Das macht drei Euro.",
      ],
      kosten: [
        "Der Preis ist fünf Euro.",
        "Das Geld ist fünf Euro.",
        "Das ist fünf Euro.",
        "Das macht fünf Euro.",
        "Es kostet fünf Euro.",
      ],
      geld: ["Ich habe Preis.", "Ich koste Geld.", "Das ist Geld Euro."],
      billig: ["Der Preis ist billig.", "Das kostet billig.", "Das ist günstig."],
      teuer: ["Der Preis ist teuer.", "Das kostet teuer."],
      "datum-wie": ["Wie ist der Tag?", "Wie ist der Monat?"],
      "datum-mai": [
        "Der Tag ist der erste Mai.",
        "Heute ist der erste Mai.",
        "Das Jahr ist der erste Mai.",
      ],
      "mass-meter": ["Das ist ein Meter.", "Das Meter ist ein."],
      "mass-welches": ["Welcher Meter ist das?"],
    };
    for (const [id, bad] of Object.entries(banned)) {
      const choices = byId.get(id).choices;
      for (const choice of bad) {
        assert.equal(choices.includes(choice), false, `${id}: ${choice}`);
      }
    }
  });

  it("keeps number questions as patterns until a digit is chosen", () => {
    const opening = SUPPORT_LEXICON_POOLS["number-words"];
    assert.deepEqual(
      opening.map((item) => item.pattern),
      ["zahl-phrase", "zahl-sentence"]
    );
    for (const item of opening) {
      assert.equal(item.kind, "number-prompt");
      assert.equal(item.word, "Zahl");
      assert.equal(item.min, 0);
      assert.equal(item.max, 9);
      assert.equal(item.form, undefined);
      assert.equal(item.choices, undefined);
    }
    const senses = SUPPORT_LEXICON_POOLS["number-senses"];
    assert.deepEqual(
      senses.map((item) => item.pattern),
      ["nummer-phrase", "zahl-nummer", "anzahl-sentence"]
    );
    for (const item of senses) assert.equal(item.max, 99);
    const amount = SUPPORT_LEXICON_POOLS["amount-words"];
    for (const item of amount) assert.equal(item.max, 99);
    assert.deepEqual(
      amount.map((item) => item.pattern),
      ["menge-sentence", "zaehlen-sentence"]
    );

    const eight = realizeNumberPrompt(opening[0], 8);
    const five = realizeNumberPrompt(opening[0], 5);
    assert.equal(eight.english, "the number 8");
    assert.equal(eight.form, "die Zahl 8");
    assert.equal(eight.choices.filter((choice) => choice === eight.form).length, 1);
    assert.notEqual(eight.form, five.form);
    for (const choice of eight.choices) {
      assert.equal(/\b(Nummer|Anzahl|Menge|zähle)\b/.test(choice), false, choice);
    }
    const nummer = realizeNumberPrompt(senses[0], 5);
    for (const choice of nummer.choices) {
      assert.equal(/\b(Zahl|Anzahl|Menge)\b/.test(choice), false, choice);
    }
    const contrast = realizeNumberPrompt(senses[1], 6);
    assert.deepEqual(contrast.choices, ["die Zahl 6", "die Nummer 6"]);
    const count = realizeNumberPrompt(senses[2], 4);
    for (const choice of count.choices) {
      assert.equal(/\b(Zahl|Nummer|Menge)\b/.test(choice), false, choice);
    }
  });
});
