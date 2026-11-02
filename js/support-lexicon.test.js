import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  NUMBER_SENSE,
  SUPPORT_LEXICON_POOLS,
  realizeNumberPrompt,
  realizeNumberSense,
} from "./support-lexicon.js";

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

  it("maps Zahl, Nummer, and Anzahl by phrase and by usage, both ways", () => {
    const opening = SUPPORT_LEXICON_POOLS["number-words"];
    assert.deepEqual(
      opening.map((item) => item.pattern),
      ["phrase:Zahl", "usage:Zahl"]
    );
    for (const item of opening) {
      assert.equal(item.kind, "number-sense");
      assert.equal(item.word, "Zahl");
    }

    const senses = SUPPORT_LEXICON_POOLS["number-senses"];
    assert.deepEqual(
      senses.map((item) => item.pattern),
      ["phrase:Nummer", "usage:Nummer", "phrase:Anzahl", "usage:Anzahl"]
    );

    const seq = (() => {
      let i = 0;
      return () => {
        const values = [0.1, 0.4, 0.7, 0.2, 0.55, 0.85, 0.3];
        return values[i++ % values.length];
      };
    })();

    const phraseForward = realizeNumberSense(
      { task: "phrase", word: "Zahl", pattern: "phrase:Zahl" },
      { n: 10, direction: "forward", random: seq }
    );
    assert.equal(phraseForward.expect, "Zahl");
    assert.ok(phraseForward.prompt.includes("10") || !phraseForward.prompt.includes("{n}"));
    assert.ok(phraseForward.choices.includes("Zahl"));
    assert.ok(phraseForward.choices.includes("Nummer"));
    assert.ok(phraseForward.choices.includes("Anzahl"));
    assert.equal(phraseForward.choices.length, 4);

    const phraseReverse = realizeNumberSense(
      { task: "phrase", word: "Nummer", pattern: "phrase:Nummer" },
      { n: 5, direction: "reverse", random: () => 0.2 }
    );
    assert.equal(phraseReverse.prompt, "die Nummer");
    assert.ok(phraseReverse.choices.includes(phraseReverse.expect));
    assert.equal(phraseReverse.choices.length, 4);

    const usageForward = realizeNumberSense(
      { task: "usage", word: "Anzahl", pattern: "usage:Anzahl" },
      { direction: "forward", random: () => 0 }
    );
    assert.equal(usageForward.prompt, NUMBER_SENSE.Anzahl.usage);
    assert.equal(usageForward.expect, "Anzahl");
    assert.equal(usageForward.english, NUMBER_SENSE.Anzahl.caption);

    const usageReverse = realizeNumberSense(
      { task: "usage", word: "Zahl", pattern: "usage:Zahl" },
      { direction: "reverse" }
    );
    assert.equal(usageReverse.prompt, "die Zahl");
    assert.equal(usageReverse.expect, NUMBER_SENSE.Zahl.usage);
    assert.equal(usageReverse.english, NUMBER_SENSE.Zahl.caption);

    const phraseCaption = realizeNumberSense(
      { task: "phrase", word: "Nummer", pattern: "phrase:Nummer" },
      { n: 5, direction: "forward", random: () => 0 }
    );
    assert.equal(phraseCaption.english, NUMBER_SENSE.Nummer.caption);
    assert.notEqual(phraseCaption.english, phraseCaption.prompt);

    const room = realizeNumberSense(
      { task: "phrase", word: "Nummer", pattern: "phrase:Nummer" },
      { n: 5, direction: "forward", random: () => 0.3 }
    );
    assert.ok(
      NUMBER_SENSE.Nummer.phrases.some((p) =>
        room.prompt.includes(p.replace("{n}", "5").replace("{n}", "5"))
      ) || room.expect === "Nummer"
    );
    assert.equal(room.expect, "Nummer");

    const count = realizeNumberPrompt(
      { pattern: "zaehlen-sentence", word: "zählen", token: "zähle", min: 0, max: 99 },
      7
    );
    assert.equal(count.english, "I count to 7.");
    assert.equal(count.form, "Ich zähle bis 7.");
  });
});
