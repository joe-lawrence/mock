/**
 * Session Custom mix — shared playlist dropdown for Learn / Practice.
 * Catalog: Topics → Units (Vocabulary nested under Numbers topics).
 * Sequence: in-order (curriculum) | random (shuffle play order only).
 */

/** Bootstrap Icons — MIT License (c) 2019–2024 The Bootstrap Authors */
const ICON_ORDER = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.873 11.297V4.142H1.699L0 5.379v1.137l1.64-1.18h.06v5.961zm3.213-5.09v-.063c0-.618.44-1.169 1.196-1.169.676 0 1.174.44 1.174 1.106 0 .624-.42 1.101-.807 1.526L4.99 10.553v.744h4.78v-.99H6.643v-.069L8.41 8.252c.65-.724 1.237-1.332 1.237-2.27C9.646 4.849 8.723 4 7.308 4c-1.573 0-2.36 1.064-2.36 2.15v.057zm6.559 1.883h.786c.823 0 1.374.481 1.379 1.179.01.707-.55 1.216-1.421 1.21-.77-.005-1.326-.419-1.379-.953h-1.095c.042 1.053.938 1.918 2.464 1.918 1.478 0 2.642-.839 2.62-2.144-.02-1.143-.922-1.651-1.551-1.714v-.063c.535-.09 1.347-.66 1.326-1.678-.026-1.053-.933-1.855-2.359-1.845-1.5.005-2.317.88-2.348 1.898h1.116c.032-.498.498-.944 1.206-.944.703 0 1.206.435 1.206 1.07.005.64-.504 1.106-1.2 1.106h-.75z"/></svg>`;

const ICON_RANDOM = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M13 1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2zM3 0a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V3a3 3 0 0 0-3-3z"/><path d="M5.5 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m8 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m-8 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m4-4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/></svg>`;

const ICON_KEYBOARD = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M14 5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM2 4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><path d="M2 7a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1A.5.5 0 0 1 2 7m2.5-.5a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m2.5-.5a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5M2 9a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1A.5.5 0 0 1 2 9m2.5-.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1zm5.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5"/></svg>`;

const ICON_AUDIO = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3a5 5 0 0 0-5 5v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a6 6 0 1 1 12 0v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1V8a5 5 0 0 0-5-5"/></svg>`;

export function emptyPlaylistState() {
  return {
    initialUnitIds: [],
    enabledUnitIds: [],
    sequence: "order",
    catalog: [],
    territory: null,
    kind: null, // "numbers-quiz" | "numbers-vocab" | "nouns"
  };
}

/**
 * @param {object[]} numbersTopics — NUMBERS_TOPICS
 * @param {object} vocabAreasByTopic — vocabularyAreas.numbers
 * @param {object} curriculumTopicToArea
 * @param {{ topicId: string, stepId: string }[]} quizUnits
 * @param {boolean} includeAllVocab — when vocab-only or full Numbers select
 */
export function buildNumbersCatalog(
  numbersTopics,
  vocabAreasByTopic,
  curriculumTopicToArea,
  quizUnits,
  { includeVocab = true, forceAllTopics = false } = {}
) {
  const quizByTopic = new Map();
  for (const u of quizUnits || []) {
    if (!u?.topicId || !u?.stepId) continue;
    if (!quizByTopic.has(u.topicId)) quizByTopic.set(u.topicId, new Set());
    quizByTopic.get(u.topicId).add(u.stepId);
  }

  const areaList = Array.isArray(vocabAreasByTopic) ? vocabAreasByTopic : [];
  const areaByCurriculum = curriculumTopicToArea || {};

  const topicIds = new Set();
  if (forceAllTopics) {
    for (const t of numbersTopics) if (t.playable) topicIds.add(t.id);
  } else {
    for (const tid of quizByTopic.keys()) topicIds.add(tid);
    if (includeVocab && quizByTopic.size === 0) {
      // Vocabulary-only session: every topic that has a vocab area
      for (const t of numbersTopics) {
        if (t.playable && areaByCurriculum[t.id]) topicIds.add(t.id);
      }
    }
  }

  const catalog = [];
  const vocabAreasAdded = new Set();
  for (const topic of numbersTopics) {
    if (!topic.playable) continue;
    if (!topicIds.has(topic.id)) continue;

    const children = [];
    const selectedSteps = quizByTopic.get(topic.id);
    for (const step of topic.steps || []) {
      if (!step.playable) continue;
      if (!forceAllTopics) {
        if (!selectedSteps || !selectedSteps.has(step.id)) continue;
      }
      children.push({
        id: `${topic.id}:${step.id}`,
        label: step.label,
        kind: "unit",
        unitKind: "quiz",
        topicId: topic.id,
        stepId: step.id,
      });
    }

    if (includeVocab) {
      const area = areaByCurriculum[topic.id];
      if (
        area &&
        !vocabAreasAdded.has(area) &&
        areaList.some((a) => a.id === area)
      ) {
        const areaMeta = areaList.find((a) => a.id === area);
        if (children.length || forceAllTopics || !quizByTopic.size) {
          vocabAreasAdded.add(area);
          children.push({
            id: `vocab:numbers:${area}`,
            label: `Vocabulary · ${areaMeta?.label || area}`,
            kind: "unit",
            unitKind: "vocab",
            topicId: topic.id,
            area,
          });
        }
      }
    }

    if (!children.length) continue;
    catalog.push({
      id: `topic:numbers:${topic.id}`,
      label: topic.label,
      kind: "topic",
      topicId: topic.id,
      children,
    });
  }
  return catalog;
}

/**
 * @param {object[]} genderUnits — GENDER_SHORTCUTS_UNITS
 * @param {string[]} familyIds — selected family ids
 */
export function buildNounsCatalog(genderUnits, familyIds) {
  const want = new Set(familyIds || []);
  const catalog = [];
  for (const u of genderUnits || []) {
    const fams = (u.families || []).filter((f) => f.playable);
    const children = fams
      .filter((f) => !want.size || want.has(f.id))
      .map((f) => ({
        id: `nouns:family:${f.id}`,
        label: f.label || f.id,
        kind: "unit",
        unitKind: "nouns-family",
        learnUnitId: u.id,
        familyId: f.id,
      }));
    if (!children.length && want.size) continue;
    if (!children.length) {
      // If no filter matched but unit was selected as a whole, include all families
      continue;
    }
    catalog.push({
      id: `topic:nouns:${u.id}`,
      label: u.label,
      kind: "topic",
      learnUnitId: u.id,
      children,
    });
  }
  return catalog;
}

/** Flatten catalog leave unit ids in curriculum order. */
export function catalogUnitIds(catalog) {
  const ids = [];
  for (const topic of catalog || []) {
    for (const u of topic.children || []) ids.push(u.id);
  }
  return ids;
}

export function findCatalogUnit(catalog, unitId) {
  for (const topic of catalog || []) {
    for (const u of topic.children || []) {
      if (u.id === unitId) return { topic, unit: u };
    }
  }
  return null;
}

/** Scope label for the closed trigger. */
export function playlistScopeLabel(playlist) {
  const enabled = new Set(playlist.enabledUnitIds || []);
  const initial = new Set(playlist.initialUnitIds || []);
  if (!enabled.size) return "None";
  const allOn =
    initial.size > 0 &&
    initial.size === enabled.size &&
    [...initial].every((id) => enabled.has(id));
  if (allOn) return "All";

  const topicsFullyOn = [];
  const partialUnits = [];
  for (const topic of playlist.catalog || []) {
    const kids = topic.children || [];
    if (!kids.length) continue;
    const on = kids.filter((c) => enabled.has(c.id));
    if (on.length === kids.length) topicsFullyOn.push(topic.label);
    else on.forEach((c) => partialUnits.push(c));
  }
  if (topicsFullyOn.length === 1 && !partialUnits.length) return topicsFullyOn[0];
  if (topicsFullyOn.length && !partialUnits.length) {
    return topicsFullyOn.length <= 2
      ? topicsFullyOn.join(" + ")
      : `${topicsFullyOn.length} topics`;
  }
  const n = enabled.size;
  if (topicsFullyOn.length === 1 && partialUnits.length) {
    return `${topicsFullyOn[0]} + ${partialUnits.length}`;
  }
  return n === 1
    ? findCatalogUnit(playlist.catalog, [...enabled][0])?.unit?.label || "1 unit"
    : `${n} units`;
}

export function topicCheckState(topic, enabledSet) {
  const kids = topic.children || [];
  if (!kids.length) return "none";
  let n = 0;
  for (const c of kids) if (enabledSet.has(c.id)) n += 1;
  if (n === 0) return "none";
  if (n === kids.length) return "all";
  return "some";
}

/**
 * Mount playlist dropdown into hostEl.
 * @returns {{ destroy: () => void, refresh: () => void }}
 */
export function mountSessionPlaylistDropdown(hostEl, opts) {
  const getPlaylist = opts.getPlaylist;
  const onChange = opts.onChange;
  const getCaps = opts.getCaps || (() => ({ keyboard: true, audio: true }));
  const onCaps = opts.onCaps || (() => {});
  const getCurrentUnitId = opts.getCurrentUnitId || (() => null);
  const disabled = opts.disabled || false;

  let open = false;
  let root = null;

  const destroy = () => {
    document.removeEventListener("pointerdown", onDocPointer, true);
    document.removeEventListener("keydown", onKey);
    root?.remove();
    root = null;
    hostEl.innerHTML = "";
  };

  const onDocPointer = (e) => {
    if (!open || !root) return;
    if (root.contains(e.target)) return;
    open = false;
    render();
  };

  const onKey = (e) => {
    if (e.key === "Escape" && open) {
      open = false;
      render();
    }
  };

  const triggerLabel = (pl, currentId) => {
    if (currentId) {
      const hit = findCatalogUnit(pl.catalog, currentId);
      if (hit?.unit?.label) return hit.unit.label;
    }
    return playlistScopeLabel(pl);
  };

  const render = () => {
    const pl = getPlaylist();
    if (!pl?.catalog?.length) {
      hostEl.innerHTML = "";
      hostEl.hidden = true;
      return;
    }
    hostEl.hidden = false;
    const enabled = new Set(pl.enabledUnitIds || []);
    const currentId = getCurrentUnitId() || null;
    const label = triggerLabel(pl, currentId);
    const seq = pl.sequence === "random" ? "random" : "order";
    const seqIcon = seq === "random" ? ICON_RANDOM : ICON_ORDER;
    const caps = getCaps() || { keyboard: true, audio: true };

    if (!root) {
      root = document.createElement("div");
      root.className = "session-playlist";
      hostEl.appendChild(root);
      document.addEventListener("pointerdown", onDocPointer, true);
      document.addEventListener("keydown", onKey);
    }

    root.classList.toggle("is-open", open);
    root.classList.toggle("is-disabled", !!disabled);

    root.innerHTML = `
      <button type="button" class="session-playlist-trigger" data-sp-toggle
        aria-expanded="${open}" aria-haspopup="listbox"
        ${disabled ? "disabled" : ""}>
        <span class="session-playlist-trigger-icon">${seqIcon}</span>
        <span class="session-playlist-trigger-text">${esc(label)}</span>
        <span class="session-playlist-caret" aria-hidden="true"></span>
      </button>
      <div class="session-playlist-panel" role="listbox" ${open ? "" : "hidden"}>
        <div class="session-playlist-scroll">
          <label class="session-playlist-row session-playlist-all">
            <input type="checkbox" data-sp-all ${
              allEnabled(pl) ? "checked" : ""
            } />
            <span>All</span>
          </label>
          ${pl.catalog
            .map((topic) => topicBlockHtml(topic, enabled, currentId))
            .join("")}
        </div>
        <div class="session-playlist-footer">
          <div class="session-playlist-seq" role="group" aria-label="Sequence">
            <button type="button" class="session-playlist-seq-btn${
              seq === "order" ? " is-on" : ""
            }" data-sp-seq="order" aria-label="In order" title="In order">${ICON_ORDER}</button>
            <button type="button" class="session-playlist-seq-btn${
              seq === "random" ? " is-on" : ""
            }" data-sp-seq="random" aria-label="Random" title="Random">${ICON_RANDOM}</button>
          </div>
          <div class="session-playlist-caps" role="group" aria-label="Practice styles">
            <button type="button" class="session-playlist-cap-btn${
              capClass(caps.keyboard)
            }" data-sp-cap="keyboard" aria-pressed="${
              caps.keyboard !== false
            }" data-cap-state="${esc(String(caps.keyboard))}" aria-label="${
              capAria("Write", caps.keyboard)
            }" title="${capTitle("Write — free-form text", caps.keyboard)}">${ICON_KEYBOARD}</button>
            <button type="button" class="session-playlist-cap-btn${
              capClass(caps.audio)
            }" data-sp-cap="audio" aria-pressed="${
              caps.audio !== false
            }" data-cap-state="${esc(String(caps.audio))}" aria-label="${
              capAria("Listen", caps.audio)
            }" title="${capTitle("Listen — audio in", caps.audio)}">${ICON_AUDIO}</button>
          </div>
        </div>
      </div>
    `;

    root.querySelector("[data-sp-toggle]")?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (disabled) return;
      open = !open;
      render();
      if (open) {
        root
          ?.querySelector(".session-playlist-row.is-current")
          ?.scrollIntoView({ block: "nearest" });
      }
    });

    root.querySelector("[data-sp-all]")?.addEventListener("change", (e) => {
      const on = e.target.checked;
      const next = {
        ...pl,
        enabledUnitIds: on ? [...(pl.initialUnitIds || [])] : [],
      };
      onChange(next);
      render();
    });

    root.querySelectorAll("[data-sp-topic]").forEach((input) => {
      input.addEventListener("change", () => {
        const topicId = input.getAttribute("data-sp-topic");
        const topic = pl.catalog.find((t) => t.id === topicId);
        if (!topic) return;
        const set = new Set(pl.enabledUnitIds);
        const kids = topic.children || [];
        if (input.checked) kids.forEach((c) => set.add(c.id));
        else kids.forEach((c) => set.delete(c.id));
        onChange({ ...pl, enabledUnitIds: [...set] });
        render();
      });
    });

    root.querySelectorAll("[data-sp-unit]").forEach((input) => {
      input.addEventListener("change", () => {
        const id = input.getAttribute("data-sp-unit");
        const set = new Set(pl.enabledUnitIds);
        if (input.checked) set.add(id);
        else set.delete(id);
        onChange({ ...pl, enabledUnitIds: [...set] });
        render();
      });
    });

    root.querySelectorAll("[data-sp-seq]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const sequence = btn.getAttribute("data-sp-seq");
        onChange({ ...pl, sequence });
        render();
      });
    });

    root.querySelectorAll("[data-sp-cap]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const key = btn.getAttribute("data-sp-cap");
        const next = {
          keyboard: caps.keyboard,
          audio: caps.audio,
        };
        if (key === "keyboard") {
          next.keyboard = cycleCap(caps.keyboard);
          if (next.keyboard === "only") next.audio = false;
        } else if (key === "audio") {
          next.audio = cycleCap(caps.audio);
          if (next.audio === "only") next.keyboard = false;
        }
        onCaps(next);
        render();
      });
    });
  };

  function cycleCap(cur) {
    if (cur === false) return true;
    if (cur === true) return "only";
    return false;
  }

  function capClass(v) {
    if (v === "only") return " is-on is-only";
    if (v === false) return "";
    return " is-on";
  }

  function capAria(label, v) {
    if (v === "only") return `${label} only`;
    if (v === false) return `${label} off`;
    return label;
  }

  function capTitle(base, v) {
    if (v === "only") return `${base} (only this style)`;
    if (v === false) return `${base} (off)`;
    return base;
  }

  function allEnabled(pl) {
    const enabled = new Set(pl.enabledUnitIds || []);
    const initial = pl.initialUnitIds || [];
    return (
      initial.length > 0 &&
      initial.length === enabled.size &&
      initial.every((id) => enabled.has(id))
    );
  }

  function topicBlockHtml(topic, enabledSet, currentId) {
    const check = topicCheckState(topic, enabledSet);
    return `
      <div class="session-playlist-topic">
        <label class="session-playlist-row">
          <input type="checkbox" data-sp-topic="${esc(topic.id)}"
            ${check === "all" ? "checked" : ""}
            ${check === "some" ? "data-indeterminate=1" : ""} />
          <span>${esc(topic.label)}</span>
        </label>
        <div class="session-playlist-units">
          ${(topic.children || [])
            .map((u) => {
              const current = currentId && u.id === currentId;
              return `
            <label class="session-playlist-row is-unit${
              current ? " is-current" : ""
            }" ${current ? 'data-sp-current="1"' : ""}>
              <input type="checkbox" data-sp-unit="${esc(u.id)}"
                ${enabledSet.has(u.id) ? "checked" : ""} />
              <span>${esc(u.label)}</span>
            </label>`;
            })
            .join("")}
        </div>
      </div>`;
  }

  const refresh = () => {
    render();
    root?.querySelectorAll('input[data-indeterminate="1"]').forEach((el) => {
      el.indeterminate = true;
    });
  };

  refresh();
  if (hostEl) hostEl.hidden = false;
  return { destroy, refresh };
}

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Quiz step entries from enabled playlist units, curriculum order. */
export function enabledQuizEntries(playlist) {
  const enabled = new Set(playlist.enabledUnitIds || []);
  const out = [];
  for (const topic of playlist.catalog || []) {
    for (const u of topic.children || []) {
      if (!enabled.has(u.id)) continue;
      if (u.unitKind === "quiz" && u.topicId && u.stepId) {
        out.push({ topicId: u.topicId, stepId: u.stepId });
      }
    }
  }
  return out;
}

/** Vocab area ids from enabled playlist units. */
export function enabledVocabAreas(playlist) {
  const enabled = new Set(playlist.enabledUnitIds || []);
  const areas = [];
  for (const topic of playlist.catalog || []) {
    for (const u of topic.children || []) {
      if (!enabled.has(u.id)) continue;
      if (u.unitKind === "vocab" && u.area && !areas.includes(u.area)) {
        areas.push(u.area);
      }
    }
  }
  return areas;
}

export function enabledNounFamilies(playlist) {
  const enabled = new Set(playlist.enabledUnitIds || []);
  const out = [];
  for (const topic of playlist.catalog || []) {
    for (const u of topic.children || []) {
      if (!enabled.has(u.id)) continue;
      if (u.unitKind === "nouns-family" && u.familyId) {
        out.push({ familyId: u.familyId, learnUnitId: u.learnUnitId });
      }
    }
  }
  return out;
}

export function playlistHasQuiz(playlist) {
  return enabledQuizEntries(playlist).length > 0;
}

export function playlistHasVocab(playlist) {
  return enabledVocabAreas(playlist).length > 0;
}
