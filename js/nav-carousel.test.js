import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { caseNavUnits } from "./case-curriculum.js";
import { familiesForUnit } from "./nouns-curriculum.js";
import {
  buildNavTree,
  curriculumUnitsMirroredBy,
  guidedBoundKeysForUnits,
  practiceUnitsForSelection,
  selectionAfterToggle,
  unitMatchesPlayCaps,
  vocabularyUnitsIn,
} from "./nav-carousel.js";

function indexUnits(nodes, map = new Map()) {
  for (const node of nodes || []) {
    if (node.type === "unit") map.set(node.id, node);
    if (node.children?.length) indexUnits(node.children, map);
  }
  return map;
}

describe("Vocabulary shortcut", () => {
  it("puts Vocabulary first, labeled by territory and unit", () => {
    const tree = buildNavTree();
    assert.equal(tree[0].id, "vocabulary");
    assert.equal(tree[0].type, "subtopic");
    const vocabs = vocabularyUnitsIn(tree);
    const time = vocabs.find((unit) => unit.id === "vocabulary:numbers:time");
    assert.equal(time.kicker, "Numbers");
    assert.equal(time.title, "Time");
    assert.ok(time.mirrorUnitIds.length > 0);
    const suffixes = vocabs.find((unit) => unit.id === "vocabulary:nouns:suffixes");
    assert.equal(suffixes.kicker, "Nouns");
    assert.equal(suffixes.title, "Suffixes");
    assert.deepEqual(suffixes.mirrorUnitIds, ["nouns:gs:suffixes"]);
    const units = indexUnits(tree);
    for (const vocab of vocabs) {
      for (const id of vocab.mirrorUnitIds) {
        const unit = units.get(id);
        assert.ok(unit, id);
        assert.equal(unitMatchesPlayCaps(unit), true);
      }
    }
  });

  it("mirrors vocab selection onto the unit cards and back", () => {
    const vocabs = vocabularyUnitsIn(buildNavTree());
    const time = vocabs.find((unit) => unit.id === "vocabulary:numbers:time");
    const on = selectionAfterToggle(new Set(), [time.id], true, vocabs);
    assert.ok(on.has(time.id));
    for (const id of time.mirrorUnitIds) assert.ok(on.has(id));
    const dropped = selectionAfterToggle(on, [time.mirrorUnitIds[0]], false, vocabs);
    assert.equal(dropped.has(time.id), false);
    assert.equal(dropped.has(time.mirrorUnitIds[0]), false);
    const restored = selectionAfterToggle(new Set(), time.mirrorUnitIds, true, vocabs);
    assert.ok(restored.has(time.id));
    for (const id of time.mirrorUnitIds) assert.ok(restored.has(id));
  });

  it("lists Case topics and mirrors them onto playable Case units", () => {
    const vocabs = vocabularyUnitsIn(buildNavTree());
    const accusative = vocabs.find((unit) => unit.id === "vocabulary:case:accusative");
    assert.equal(accusative.kicker, "Case");
    assert.equal(accusative.title, "Accusative");
    assert.ok(accusative.mirrorUnitIds.includes("case:accusative:masc"));
    const units = indexUnits(buildNavTree());
    for (const id of accusative.mirrorUnitIds) {
      assert.equal(unitMatchesPlayCaps(units.get(id)), true);
    }
    const on = selectionAfterToggle(new Set(), [accusative.id], true, vocabs);
    for (const id of accusative.mirrorUnitIds) assert.ok(on.has(id));
    const mirrored = accusative.mirrorUnitIds.map((id) => units.get(id));
    assert.deepEqual(practiceUnitsForSelection([accusative, ...mirrored]).map((unit) => unit.id), [
      accusative.id,
    ]);
    assert.equal(
      vocabs.some((unit) => unit.id === "vocabulary:case:declension"),
      false
    );
    assert.ok(vocabs.some((unit) => unit.id === "vocabulary:case:dative"));
    assert.ok(vocabs.some((unit) => unit.id === "vocabulary:case:mixed"));
  });

  it("lists Vocabulary on the Case card beside the topics", () => {
    const caseNode = buildNavTree().find((node) => node.id === "case");
    assert.equal(caseNode.children[0].title, "Vocabulary");
    assert.deepEqual(
      caseNode.children[0].children.map((unit) => unit.id),
      [
        "vocabulary:case:accusative",
        "vocabulary:case:dative",
        "vocabulary:case:mixed",
      ]
    );
    assert.equal(
      caseNode.children.some((node) => node.topicId === "declension"),
      true
    );
  });
});

describe("Guided bounds", () => {
  it("maps picked units onto dealer keys and skips vocabulary", () => {
    const step = caseNavUnits().find((unit) => unit.playable);
    const families = familiesForUnit("suffixes").map((f) => f.id);
    const keys = guidedBoundKeysForUnits([
      { territory: "numbers", topicId: "fractions", stepId: "half-quarter", playable: true },
      { territory: "nouns", learnUnitId: "suffixes", playable: true },
      step,
      { kind: "vocabulary", vocabTopic: "numbers", territory: "numbers", playable: true },
    ]);
    assert.equal(keys[0], "numbers:fractions:half-quarter");
    assert.deepEqual(
      keys.filter((key) => key.startsWith("nouns:suffixes:")),
      families.map((id) => `nouns:suffixes:${id}`)
    );
    assert.ok(keys.includes(`case:${step.topicId}:${step.stepId}`));
    assert.equal(keys.some((key) => key.includes("vocabulary")), false);
  });

  it("bounds guided vocab to the curriculum units the words belong to", () => {
    const time = vocabularyUnitsIn(buildNavTree()).find(
      (unit) => unit.id === "vocabulary:numbers:time"
    );
    const mirrors = curriculumUnitsMirroredBy([time]);
    assert.ok(mirrors.length > 0);
    assert.ok(mirrors.every((unit) => unit.topicId === "time" && unit.stepId));
    const keys = guidedBoundKeysForUnits(mirrors);
    assert.ok(keys.includes("numbers:time:whole-hours"));
    assert.ok(keys.includes("numbers:time:time-words"));
    assert.equal(keys.some((key) => key.startsWith("vocabulary")), false);
  });
});

describe("Play caps for Case", () => {
  it("counts a selected Case unit under the default pick caps", () => {
    const units = caseNavUnits().filter((unit) => unit.playable);
    assert.ok(units.length > 1);
    const caps = { keyboard: true, audio: true };
    assert.equal(units.filter((unit) => unitMatchesPlayCaps(unit, caps)).length, units.length);
    const writeOnly = { keyboard: "only", audio: true };
    const listenOnly = { keyboard: true, audio: "only" };
    const tableUnits = new Set(["case.table.definite", "case.table.indefinite"]);
    assert.ok(
      units
        .filter((unit) => !tableUnits.has(unit.unitId))
        .every((unit) => unitMatchesPlayCaps(unit, writeOnly))
    );
    assert.ok(
      units
        .filter((unit) => tableUnits.has(unit.unitId))
        .every((unit) => !unitMatchesPlayCaps(unit, writeOnly))
    );
    const heard = units.filter((unit) => unitMatchesPlayCaps(unit, listenOnly));
    assert.deepEqual(
      heard.map((unit) => unit.unitId).sort(),
      units
        .map((unit) => unit.unitId)
        .filter((id) => id !== "case.analysis" && !tableUnits.has(id))
        .sort()
    );
  });
});
