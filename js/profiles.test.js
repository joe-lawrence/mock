import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PROFILES_SCHEMA,
  defaultProfileStore,
  normalizeProfileStore,
  addProfile,
  switchActiveProfile,
  deleteProfile,
  exportProfileDocument,
  importProfileDocument,
  recordProfileAttempt,
  recordProfileDealerReason,
  getActiveProfile,
  listProfiles,
  saveProfileStore,
  loadProfileStore,
} from "./profiles.js";
import {
  buildReportCard,
  buildFullAudit,
  reportCardToPlaintext,
  fullAuditToPlaintext,
  readinessFromStat,
  parseUnitKey,
} from "./mastery-export.js";
import {
  MASTERY_REPORT_CARD_SCHEMA,
  MASTERY_FULL_AUDIT_SCHEMA,
} from "./guidance-contracts.js";

/** @returns {Storage} */
function memStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

describe("profiles + mastery export (Slice 7)", () => {
  it("default store has one active profile", () => {
    const s = defaultProfileStore();
    assert.equal(s.schema, PROFILES_SCHEMA);
    assert.equal(listProfiles(s).length, 1);
    assert.equal(getActiveProfile(s).label, "You");
  });

  it("isolates evidence across two profiles", () => {
    let store = defaultProfileStore();
    store = recordProfileAttempt(store, {
      dealKey: "numbers:cardinals:tens",
      presetId: "build",
      evidenceIds: ["tens.60"],
      correct: false,
      hintDepth: 1.3,
    });
    const aId = store.activeId;
    store = addProfile(store, "Guest");
    const bId = store.activeId;
    assert.notEqual(aId, bId);
    store = recordProfileAttempt(store, {
      dealKey: "numbers:cardinals:base",
      presetId: "listen",
      evidenceIds: [],
      correct: true,
      hintDepth: 0,
    });
    const guest = store.profiles[bId];
    const you = store.profiles[aId];
    assert.equal(guest.evidence.grains["numbers:cardinals:base"].correct, 1);
    assert.equal(you.evidence.grains["numbers:cardinals:tens"].correct, 0);
    assert.equal(you.evidence.grains["numbers:cardinals:base"], undefined);
    assert.ok(you.hintHistory.length >= 1);
  });

  it("export/import profile round-trips", () => {
    let store = defaultProfileStore();
    store = recordProfileAttempt(store, {
      dealKey: "numbers:cardinals:compounds",
      presetId: "convert",
      evidenceIds: ["compound.eins→ein"],
      correct: true,
    });
    const doc = exportProfileDocument(getActiveProfile(store));
    assert.equal(doc.schema, "schnapp.profile-export.v0");
    assert.ok(doc.profile.evidence.grains["numbers:cardinals:compounds"]);

    let other = addProfile(defaultProfileStore(), "Other");
    other = importProfileDocument(other, doc, { activate: true });
    const active = getActiveProfile(other);
    assert.ok(
      active.evidence.grains["numbers:cardinals:compounds"]?.total >= 1
    );
    assert.match(active.label, /You|import/);
  });

  it("switch + delete keep at least one profile", () => {
    let store = defaultProfileStore();
    store = addProfile(store, "B");
    const b = store.activeId;
    store = switchActiveProfile(store, "p_default");
    assert.equal(store.activeId, "p_default");
    store = deleteProfile(store, b);
    assert.equal(listProfiles(store).length, 1);
    store = deleteProfile(store, store.activeId);
    assert.equal(listProfiles(store).length, 1);
  });

  it("normalize rejects bad payloads", () => {
    const s = normalizeProfileStore({ schema: "nope" });
    assert.equal(s.schema, PROFILES_SCHEMA);
  });

  it("recordProfileDealerReason tallies codes", () => {
    let store = defaultProfileStore();
    store = recordProfileDealerReason(store, "new");
    store = recordProfileDealerReason(store, "new");
    store = recordProfileDealerReason(store, "review");
    const p = getActiveProfile(store);
    assert.equal(p.dealerStats.new, 2);
    assert.equal(p.dealerStats.review, 1);
  });

  it("report card + full audit match contract schemas", () => {
    let store = defaultProfileStore();
    store = recordProfileAttempt(store, {
      dealKey: "numbers:cardinals:tens",
      presetId: "build",
      evidenceIds: ["tens.60"],
      correct: false,
      hintDepth: 2,
    });
    store = recordProfileDealerReason(store, "edge_of_competence");
    const p = getActiveProfile(store);
    const card = buildReportCard(p);
    assert.equal(card.schema, MASTERY_REPORT_CARD_SCHEMA.schema);
    assert.ok(card.units.some((u) => u.readiness === "weak"));
    assert.ok(card.suggestedNext);

    const audit = buildFullAudit(p);
    assert.equal(audit.schema, MASTERY_FULL_AUDIT_SCHEMA.schema);
    assert.ok(audit.interaction.some((r) => r.presetId === "build"));
    assert.ok(audit.concepts.some((c) => c.conceptId === "tens.60"));
    assert.equal(audit.dealerStats.edge_of_competence, 1);

    const text = reportCardToPlaintext(card);
    assert.match(text, /Mastery report card/);
    assert.match(fullAuditToPlaintext(audit), /full audit/i);
  });

  it("parseUnitKey and readiness helpers", () => {
    assert.deepEqual(parseUnitKey("numbers:cardinals:tens×convert"), {
      territory: "numbers",
      topicId: "cardinals",
      unitId: "tens",
      presetId: "convert",
    });
    assert.equal(readinessFromStat(null), "unseen");
    assert.equal(readinessFromStat({ correct: 0, total: 2 }), "weak");
    assert.equal(readinessFromStat({ correct: 9, total: 10 }), "ready");
  });

  it("mem storage save/load via normalize shape", () => {
    const storage = memStorage();
    let store = defaultProfileStore();
    store = addProfile(store, "Kid");
    saveProfileStore(store, storage);
    const loaded = loadProfileStore(storage);
    assert.equal(listProfiles(loaded).length, 2);
    assert.equal(getActiveProfile(loaded).label, "Kid");
  });
});
