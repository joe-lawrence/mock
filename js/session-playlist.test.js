import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildNumbersCatalog,
  buildNounsCatalog,
  catalogUnitIds,
  enabledQuizEntries,
  enabledVocabAreas,
  enabledNounFamilies,
  playlistScopeLabel,
  playlistHasQuiz,
  playlistHasVocab,
} from "./session-playlist.js";

const TOPICS = [
  {
    id: "cardinals",
    label: "Cardinals",
    playable: true,
    steps: [
      { id: "0-12", label: "0–12", playable: true },
      { id: "13-20", label: "13–20", playable: true },
    ],
  },
  {
    id: "time",
    label: "Time",
    playable: true,
    steps: [{ id: "clock", label: "Clock", playable: true }],
  },
];

const AREAS = [
  { id: "core", label: "Core" },
  { id: "time", label: "Time words" },
];

const AREA_MAP = { cardinals: "core", time: "time" };

describe("session playlist catalog", () => {
  it("nests vocabulary under selected quiz topics", () => {
    const catalog = buildNumbersCatalog(
      TOPICS,
      AREAS,
      AREA_MAP,
      [{ topicId: "cardinals", stepId: "0-12" }],
      { includeVocab: true }
    );
    const ids = catalogUnitIds(catalog);
    assert.deepEqual(ids, ["cardinals:0-12", "vocab:numbers:core"]);
    assert.equal(catalog.length, 1);
    assert.equal(catalog[0].label, "Cardinals");
  });

  it("vocab-only seeds every topic with a mapped area", () => {
    const catalog = buildNumbersCatalog(TOPICS, AREAS, AREA_MAP, [], {
      includeVocab: true,
    });
    const ids = catalogUnitIds(catalog);
    assert.ok(ids.includes("vocab:numbers:core"));
    assert.ok(ids.includes("vocab:numbers:time"));
    assert.ok(!ids.some((id) => id.includes(":0-12")));
  });

  it("reports quiz vs vocab from enabled units", () => {
    const catalog = buildNumbersCatalog(
      TOPICS,
      AREAS,
      AREA_MAP,
      [
        { topicId: "cardinals", stepId: "0-12" },
        { topicId: "time", stepId: "clock" },
      ],
      { includeVocab: true }
    );
    const ids = catalogUnitIds(catalog);
    const pl = {
      catalog,
      initialUnitIds: ids,
      enabledUnitIds: ids,
      sequence: "order",
    };
    assert.equal(playlistScopeLabel(pl), "All");
    assert.equal(playlistHasQuiz(pl), true);
    assert.equal(playlistHasVocab(pl), true);
    assert.deepEqual(enabledQuizEntries(pl), [
      { topicId: "cardinals", stepId: "0-12" },
      { topicId: "time", stepId: "clock" },
    ]);
    assert.deepEqual(enabledVocabAreas(pl), ["core", "time"]);

    pl.enabledUnitIds = ids.filter((id) => id.startsWith("vocab:"));
    assert.equal(playlistHasQuiz(pl), false);
    assert.equal(playlistHasVocab(pl), true);
    assert.notEqual(playlistScopeLabel(pl), "All");
  });

  it("builds nouns family catalog filtered to selection", () => {
    const catalog = buildNounsCatalog(
      [
        {
          id: "feminine",
          label: "Feminine",
          families: [
            { id: "wugs", label: "Wugs", playable: true },
            { id: "real-words", label: "Real", playable: true },
          ],
        },
      ],
      ["wugs"]
    );
    assert.deepEqual(catalogUnitIds(catalog), ["nouns:family:wugs"]);
    assert.deepEqual(
      enabledNounFamilies({
        catalog,
        enabledUnitIds: catalogUnitIds(catalog),
      }),
      [{ familyId: "wugs", learnUnitId: "feminine" }]
    );
  });
});
