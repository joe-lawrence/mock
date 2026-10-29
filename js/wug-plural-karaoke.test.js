import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  orderPluralTrayLabels,
  pluralizeProductiveBeats,
} from "./wug-plural-karaoke.js";

describe("productive plural karaoke", () => {
  it("splits -ion plurals into o · nen", () => {
    const singular = [
      { text: "Na", guide: "nah" },
      { text: "ti", guide: "TSI", stress: true, source: "suffix-chart" },
      { text: "on", guide: "ohn", source: "suffix-chart" },
    ];
    const parts = pluralizeProductiveBeats(singular, { ending: "en" });
    assert.deepEqual(
      parts.map((p) => p.text),
      ["Na", "ti", "o", "nen"]
    );
    assert.ok(parts.every((p) => p.guide && !p.pronunciationUnavailable));
  });

  it("splits -keit plurals into kei · ten", () => {
    const singular = [
      { text: "Schwie", guide: "SHVEE", stress: true },
      { text: "rig", guide: "rikh" },
      { text: "keit", guide: "kite" },
    ];
    const parts = pluralizeProductiveBeats(singular, { ending: "en" });
    assert.deepEqual(
      parts.map((p) => [p.text, p.guide]),
      [
        ["Schwie", "SHVEE"],
        ["rig", "rikh"],
        ["kei", "kye"],
        ["ten", "ten"],
      ]
    );
  });

});

describe("plural tray order", () => {
  it("puts the stem first, endings in a fixed order, and — last", () => {
    const labels = orderPluralTrayLabels(
      ["die", "Spindation", "en"],
      ["e", "er", "s"]
    );
    assert.deepEqual(labels, ["Spindation", "e", "en", "er", "s", "—"]);
  });

  it("keeps a changed stem ahead of the singular lemma", () => {
    const labels = orderPluralTrayLabels(
      ["die", "Mütter", "—"],
      ["e", "en", "Mutter"]
    );
    assert.equal(labels[0], "Mütter");
    assert.ok(labels.indexOf("Mutter") < labels.indexOf("e"));
    assert.equal(labels.at(-1), "—");
  });
});
