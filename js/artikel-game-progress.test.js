import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildGameReport,
  poolOf,
  progressSnapshot,
  wordKey,
} from "./artikel-game-progress.js";
import {
  initClimberPools,
  markClimberCorrect,
  markClimberIncorrect,
} from "./artikel-climber-pools.js";

function word(surface, gender = "masc", article = "der") {
  return { word: surface, article, gender, vocabId: surface };
}

describe("artikel-game-progress", () => {
  it("wordKey is stable for gender/article/surface", () => {
    assert.equal(wordKey(word("Hund")), "masc:der:Hund");
  });

  it("progressSnapshot tracks introduced and hint dependence", () => {
    const words = [word("Hund"), word("Katze", "fem", "die"), word("Kind", "neut", "das")];
    const pools = initClimberPools(words.map((w) => ({ ...w })));
    const seenByKey = new Map();
    const first = pools.activePool[0];
    seenByKey.set(wordKey(first), first);
    first.correct = 1;

    const snap = progressSnapshot({ words, pools, seenByKey });
    assert.equal(snap.deckTotal, 3);
    assert.equal(snap.introduced, pools.activePool.length + pools.graduatedPool.length);
    assert.equal(snap.enteredPlay, 1);
    assert.ok(snap.introducedHinted >= 1);
    assert.equal(poolOf(first, pools), "active");
  });

  it("buildGameReport grades misses and graduation like Wort-Hüpfer", () => {
    const words = [
      word("Lehrer"),
      word("Fahrer"),
      word("Zeitung", "fem", "die"),
      word("Wohnung", "fem", "die"),
      word("Element", "neut", "das"),
    ];
    const pools = initClimberPools(words.map((w) => ({ ...w, correct: 0, wrong: 0 })));
    const seenByKey = new Map();
    const target = pools.activePool[0];
    seenByKey.set(wordKey(target), target);

    target.wrong = 1;
    markClimberIncorrect(pools, target);
    target.showHint = true;

    markClimberCorrect(pools, target);
    markClimberCorrect(pools, target);
    markClimberCorrect(pools, target);
    target.correct = 3;

    const report = buildGameReport({
      gameId: "snow-nomen",
      gameTitle: "Snow-Nomen",
      score: 300,
      speed: 1,
      words,
      pools,
      seenByKey,
      targetLabel: "ski target",
    });

    assert.equal(report.payload.game, "snow-nomen");
    assert.equal(report.payload.score, 300);
    assert.match(report.text, /Snow-Nomen — Punktzahl 300/);
    assert.match(report.text, /ski target/);
    const row = report.payload.words.find((r) => r.word === target.word);
    assert.ok(row);
    assert.equal(row.wrong, 1);
    assert.equal(row.correct, 3);
    assert.ok(
      row.pool === "graduated" || row.pool === "active",
      `expected graduated/active, got ${row.pool}`
    );
  });
});
