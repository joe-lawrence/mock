import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildGameReport,
  poolOf,
  progressSnapshot,
  smoothedMissRate,
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
    assert.equal(
      snap.introducedHintedPlayed + snap.introducedHintedNotPlayed,
      snap.introducedHinted
    );
    assert.ok(snap.introducedHintedPlayed >= 1);
    assert.ok(typeof snap.hintAmongPlayedPct === "number" || snap.hintAmongPlayedPct === null);
  });

  it("smoothedMissRate down-ranks tiny samples vs larger ones", () => {
    assert.ok(smoothedMissRate(1, 1) < smoothedMissRate(4, 5));
    assert.ok(smoothedMissRate(0, 1) > smoothedMissRate(0, 5));
  });

  it("needs-review ranking prefers consistent misses over a single miss", () => {
    const words = [
      word("A"),
      word("B", "fem", "die"),
      word("C", "neut", "das"),
      word("D"),
      word("E", "fem", "die"),
    ];
    const pools = initClimberPools(words.map((w) => ({ ...w, correct: 0, wrong: 0 })));
    const seenByKey = new Map();
    const once = pools.activePool[0];
    const often = pools.activePool[1];
    once.wrong = 1;
    once.correct = 0;
    often.wrong = 4;
    often.correct = 1;
    seenByKey.set(wordKey(once), once);
    seenByKey.set(wordKey(often), often);
    const report = buildGameReport({
      gameId: "snow-nomen",
      gameTitle: "Snow-Nomen",
      score: 1,
      speed: 1,
      words,
      pools,
      seenByKey,
    });
    assert.equal(report.payload.weakestPlayed[0].word, often.word);
    assert.match(report.text, /Needs review \(least certain/);
    assert.match(
      report.text,
      new RegExp(`${often.wrong} errors · n=${often.correct + often.wrong}`)
    );
    assert.match(report.payload.definitions.needsReviewRanking, /Not a pure/);
    assert.match(report.text, /Hint among played/);
    assert.match(report.text, /not yet played/);
  });

  it("needs-review lines put errors and n ahead of smoothed score", () => {
    const words = [word("Ball"), word("Hemd", "neut", "das"), word("Kleid", "neut", "das")];
    const pools = initClimberPools(words.map((w) => ({ ...w, correct: 0, wrong: 0 })));
    const seenByKey = new Map();
    for (const w of pools.activePool) {
      if (w.word === "Ball") {
        w.correct = 1;
        w.wrong = 0;
      } else if (w.word === "Hemd") {
        w.correct = 1;
        w.wrong = 0;
      } else if (w.word === "Kleid") {
        w.correct = 7;
        w.wrong = 2;
      }
      seenByKey.set(wordKey(w), w);
    }
    const report = buildGameReport({
      gameId: "snow-nomen",
      gameTitle: "Snow-Nomen",
      score: 0,
      speed: 1,
      words,
      pools,
      seenByKey,
    });
    const lines = report.text.split("\n");
    const review = lines.filter((l) => /^\d+\. /.test(l));
    assert.equal(review.length, 3);
    // Sparse perfect trials outrank well-evidenced mild misses on score — label must not say “weakest”.
    assert.match(review[0], /0 errors · n=1/);
    assert.match(review[0], /score 0\.333/);
    assert.match(review.find((l) => /Kleid/.test(l)), /2 errors · n=9/);
    assert.doesNotMatch(report.text, /Weakest words/);
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
