/**
 * Playlist practice helpers (legacy Cfg gear — caps now drive Pick/Write/Listen).
 * Quiz types apply across selected units where each unit allows them.
 */

import { modesForStep, getNumbersMode } from "./numbers-curriculum.js";
import {
  getGenderShortcutsUnit,
  familiesForUnit,
  modalitiesForUnit,
  NOUNS_MODALITY_LABELS,
} from "./nouns-curriculum.js";

export const PREFS_KEY = "schnapp-practice-prefs";

/** @typedef {{ id: string, label: string, group: string, playable: boolean, territory: string }} PracticeTypeOption */

const FAMILY_LABELS = {
  wugs: "Wugs",
  "real-words": "Real Words",
  proofread: "Proofread",
  "reverse-mc": "Reverse",
  "gender-recognition": "Gender Recognition",
  "article-application": "Article Application",
  "gender-imposter": "Gender Imposter",
  "sentence-validation": "Sentence Validation",
  association: "Associations",
};

/**
 * Collect quiz-type options applicable to the current unit selection.
 * @param {object[]} units
 * @param {{ keyboard?: boolean, audio?: boolean }} caps
 * @returns {{ groups: { id: string, label: string, options: PracticeTypeOption[] }[] }}
 */
export function collectPracticeOptions(units, caps = {}) {
  const list = Array.isArray(units) ? units : [];
  const familyMap = new Map();
  const modalityMap = new Map();
  const numbersMap = new Map();

  for (const u of list) {
    if (u.playable === false) continue;

    if (u.territory === "nouns" && u.learnUnitId) {
      for (const f of familiesForUnit(u.learnUnitId)) {
        familyMap.set(f.id, {
          id: `family:${f.id}`,
          typeId: f.id,
          label: f.label,
          group: "families",
          playable: true,
          territory: "nouns",
          intro: !!f.intro,
        });
      }
      for (const m of modalitiesForUnit(u.learnUnitId)) {
        modalityMap.set(m.id, {
          id: `modality:${m.id}`,
          typeId: m.id,
          label: m.label,
          group: "how",
          playable: m.playable,
          territory: "nouns",
        });
      }
    }

    if (u.territory === "numbers" && u.topicId && u.stepId) {
      for (const m of modesForStep(u.topicId, u.stepId)) {
        if (m.id === "listen" && caps.audio === false) continue;
        if (
          (m.id === "convert" || m.id === "proofread") &&
          caps.keyboard === false
        )
          continue;
        numbersMap.set(m.id, {
          id: `numbers:${m.id}`,
          typeId: m.id,
          label: m.label,
          group: "numbers-how",
          playable: true,
          territory: "numbers",
        });
      }
    }
  }

  const groups = [];
  if (familyMap.size) {
    groups.push({
      id: "families",
      label: "Practice families",
      options: [...familyMap.values()],
    });
  }
  if (modalityMap.size) {
    groups.push({
      id: "how",
      label: "How (Nouns)",
      options: [...modalityMap.values()],
    });
  }
  if (numbersMap.size) {
    groups.push({
      id: "numbers-how",
      label: "How (Numbers)",
      options: [...numbersMap.values()],
    });
  }
  return { groups };
}

/** @returns {Set<string>} selected option ids (`family:wugs`, `numbers:build`, …) */
export function loadPracticePrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set(parsed.filter((x) => typeof x === "string"));
  } catch (_) {}
  return new Set();
}

export function savePracticePrefs(selectedIds) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify([...selectedIds]));
  } catch (_) {}
}

/**
 * Intersection of user prefs with options available for this selection.
 * If prefs empty → all playable options on (playlist-wide defaults).
 */
export function resolvePracticePrefs(units, caps, selectedIds) {
  const { groups } = collectPracticeOptions(units, caps);
  const available = new Map();
  const allPlayable = [];
  for (const g of groups) {
    for (const o of g.options) {
      available.set(o.id, o);
      if (o.playable) allPlayable.push(o);
    }
  }

  const prefSet = selectedIds instanceof Set ? selectedIds : new Set(selectedIds || []);
  const useDefaults = prefSet.size === 0;

  const picked = [];
  if (useDefaults) {
    picked.push(...allPlayable);
  } else {
    for (const id of prefSet) {
      const o = available.get(id);
      if (o?.playable) picked.push(o);
    }
  }

  const nounsFamilies = picked
    .filter((o) => o.group === "families")
    .map((o) => o.typeId);
  const nounsModalities = picked
    .filter((o) => o.group === "how")
    .map((o) => o.typeId);
  const numbersModes = picked
    .filter((o) => o.group === "numbers-how")
    .map((o) => o.typeId);

  return {
    nounsFamilies:
      nounsFamilies.length > 0
        ? nounsFamilies
        : groups
            .find((g) => g.id === "families")
            ?.options.filter((o) => o.playable)
            .map((o) => o.typeId) || [],
    nounsModalities:
      nounsModalities.length > 0
        ? nounsModalities
        : ["choose-article"],
    numbersModes:
      numbersModes.length > 0
        ? numbersModes
        : groups
            .find((g) => g.id === "numbers-how")
            ?.options.map((o) => o.typeId) || ["build"],
    summaryLabels: picked.map((o) => o.label),
  };
}

/** All playable option ids for current units (default-on set). */
export function allPlayableOptionIds(units, caps) {
  const { groups } = collectPracticeOptions(units, caps);
  const ids = [];
  for (const g of groups) {
    for (const o of g.options) {
      if (o.playable) ids.push(o.id);
    }
  }
  return ids;
}

export function practiceSummaryLine(resolved) {
  const bits = [];
  if (resolved.nounsFamilies?.length) {
    bits.push(
      resolved.nounsFamilies.map((id) => FAMILY_LABELS[id] || id).join("+")
    );
  }
  if (resolved.nounsModalities?.length) {
    bits.push(
      resolved.nounsModalities
        .map((id) => NOUNS_MODALITY_LABELS[id] || id)
        .join("+")
    );
  }
  if (resolved.numbersModes?.length) {
    bits.push(
      resolved.numbersModes
        .map((id) => getNumbersMode(id)?.label || id)
        .join("+")
    );
  }
  return bits.join(" · ");
}
