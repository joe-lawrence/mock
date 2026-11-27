import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  germanOrthSyllables,
  karaokeSyllablesForPhrase,
} from "./german-syllables.js";

describe("germanOrthSyllables", () => {
  it("splits common lemmas on vowel nuclei", () => {
    assert.deepEqual(germanOrthSyllables("Lehrer"), ["Leh", "rer"]);
    assert.deepEqual(germanOrthSyllables("Apfel"), ["Ap", "fel"]);
    assert.deepEqual(germanOrthSyllables("Mutter"), ["Mut", "ter"]);
  });

  it("peels productive suffixes", () => {
    assert.deepEqual(germanOrthSyllables("Freiheit"), ["Frei", "heit"]);
    assert.deepEqual(germanOrthSyllables("Wohnung"), ["Wohn", "ung"]);
    assert.deepEqual(germanOrthSyllables("Zeitung"), ["Zeit", "ung"]);
    assert.deepEqual(germanOrthSyllables("Freundschaft"), ["Freund", "schaft"]);
  });

  it("respects compound prefix + root", () => {
    assert.deepEqual(
      germanOrthSyllables("Bahnhof", {
        compound: { prefix: "Bahn", rootWord: "Hof" },
      }),
      ["Bahn", "hof"]
    );
  });

  it("keeps monosyllables whole", () => {
    assert.deepEqual(germanOrthSyllables("Buch"), ["Buch"]);
    assert.deepEqual(germanOrthSyllables("Rad"), ["Rad"]);
  });
});

describe("karaokeSyllablesForPhrase", () => {
  it("prefixes a leading article beat", () => {
    const beats = karaokeSyllablesForPhrase("der Lehrer");
    assert.deepEqual(
      beats.map((b) => b.text),
      ["der", "Leh", "rer"]
    );
    assert.equal(beats[0].article, true);
    assert.equal(beats[1].stress, true);
  });

  it("marks first stem syllable stressed", () => {
    const beats = karaokeSyllablesForPhrase("Zeitung");
    assert.equal(beats[0].stress, true);
    assert.equal(beats[1].stress, false);
  });
});
