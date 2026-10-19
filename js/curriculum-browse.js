/**
 * Curriculum browse — review Modules × Topics × Units × Quiz types.
 * Standalone page; reads the same registries as the practice mock.
 */

import {
  NUMBERS_TOPICS,
  NUMBERS_MODES,
  modesForStep,
  plannedModeChips,
} from "./numbers-curriculum.js?v=20261018-compass5";
import {
  NOUNS_TOPICS,
  modesForNounsStep,
  plannedNounsModeChips,
} from "./nouns-curriculum.js?v=20261018-compass13";
import {
  vocabularyAreas,
  vocabularyForTopic,
} from "./generated/vocabulary.js?v=20260930-vocab17";
import {
  openFeedbackComposer,
  bindFeedbackTrigger,
} from "./feedback-notes.js?v=20261017-fb1";
import {
  getInteractionPreset,
  MATRIX_PRESET_IDS,
} from "./interaction-presets.js?v=20261018-compass5";

/** @typedef {"numbers"|"nouns"|"sounds"} ModuleId */

/**
 * @typedef {object} BrowseRow
 * @property {ModuleId} moduleId
 * @property {string} moduleLabel
 * @property {string} topicId
 * @property {string} topicLabel
 * @property {string} unitId
 * @property {string} unitLabel
 * @property {string} [blurb]
 * @property {boolean} playable
 * @property {{ id: string, label: string, playable: boolean, planned?: boolean }[]} quizTypes
 */

const SOUNDS_TOPICS = [
  {
    id: "syllables",
    label: "Syllables",
    playable: true,
    blurb: "Spelling ↔ sound karaoke with stress.",
    units: [
      {
        id: "karaoke",
        label: "Syllable karaoke",
        playable: true,
        blurb: "Orthography above, respelling below; CAPS = stress.",
        modes: [{ id: "karaoke", label: "Karaoke", playable: true }],
      },
    ],
  },
  {
    id: "contrasts",
    label: "Contrasts",
    playable: true,
    blurb: "Hear a contrast, pick the match (Listen).",
    units: [
      {
        id: "minimal-pairs",
        label: "Minimal pairs",
        playable: true,
        blurb: "ü/u, schön/schon, and similar contrasts.",
        modes: [{ id: "listen", label: "Listen", playable: true }],
      },
    ],
  },
];

const MODULES = [
  {
    id: "numbers",
    label: "Numbers",
    blurb: "Topic × unit × reusable quiz modalities.",
  },
  {
    id: "nouns",
    label: "Nouns",
    blurb: "Topic × unit × shared interaction presets (same columns as Numbers).",
  },
  {
    id: "sounds",
    label: "Sounds",
    blurb: "Syllables and Listen (contrast) drills.",
  },
];

function numbersRows() {
  /** @type {BrowseRow[]} */
  const rows = [];
  for (const topic of NUMBERS_TOPICS) {
    for (const step of topic.steps || []) {
      const live = modesForStep(topic.id, step.id).map((m) => ({
        id: m.id,
        label: m.label,
        playable: true,
      }));
      const liveIds = new Set(live.map((m) => m.id));
      const planned = (step.playable ? [] : plannedModeChips(step))
        .filter((m) => !liveIds.has(m.id))
        .map((m) => ({
          id: m.id,
          label: m.label,
          playable: false,
          planned: true,
        }));
      rows.push({
        moduleId: "numbers",
        moduleLabel: "Numbers",
        topicId: topic.id,
        topicLabel: topic.label,
        unitId: step.id,
        unitLabel: step.label,
        blurb: step.blurb || topic.blurb || "",
        playable: Boolean(topic.playable && step.playable),
        quizTypes: [...live, ...planned],
      });
    }
  }
  return rows;
}

function nounsRows() {
  /** @type {BrowseRow[]} */
  const rows = [];
  for (const topic of NOUNS_TOPICS) {
    for (const step of topic.steps || []) {
      const live = modesForNounsStep(topic.id, step.id).map((m) => ({
        id: m.id,
        label: m.label,
        playable: true,
      }));
      const liveIds = new Set(live.map((m) => m.id));
      const plannedSrc = step.playable
        ? step
        : {
            ...step,
            plannedModes: step.plannedModes?.length
              ? step.plannedModes
              : step.modes || ["choose"],
          };
      const planned = plannedNounsModeChips(plannedSrc)
        .filter((m) => !liveIds.has(m.id))
        .map((m) => ({
          id: m.id,
          label: m.label,
          playable: false,
          planned: true,
        }));
      rows.push({
        moduleId: "nouns",
        moduleLabel: "Nouns",
        topicId: topic.id,
        topicLabel: topic.label,
        unitId: step.id,
        unitLabel: step.label,
        blurb: step.blurb || topic.blurb || "",
        playable: Boolean(topic.playable && step.playable),
        quizTypes: [...live, ...planned],
      });
    }
  }
  return rows;
}

/** Vocabulary layer (hub Learn/Practice) — Numbers areas + Nouns bundle. */
function vocabularyRows() {
  /** @type {BrowseRow[]} */
  const rows = [];
  const numbersAreas = vocabularyAreas.numbers || [];
  for (const area of numbersAreas) {
    rows.push({
      moduleId: "numbers",
      moduleLabel: "Numbers",
      topicId: "vocabulary",
      topicLabel: "Vocabulary",
      unitId: area.id,
      unitLabel: area.label,
      blurb: "Supporting lexicon — Learn introduces; Practice retrieves.",
      playable: true,
      quizTypes: [
        { id: "vocab-learn", label: "Learn", playable: true },
        { id: "vocab-practice", label: "Practice", playable: true },
      ],
    });
  }
  if (vocabularyForTopic("nouns").length) {
    rows.push({
      moduleId: "nouns",
      moduleLabel: "Nouns",
      topicId: "vocabulary",
      topicLabel: "Vocabulary",
      unitId: "gender-lexicon",
      unitLabel: "Gender lexicon",
      blurb: "Supporting lexicon for Gender Shortcuts — Learn / Practice.",
      playable: true,
      quizTypes: [
        { id: "vocab-learn", label: "Learn", playable: true },
        { id: "vocab-practice", label: "Practice", playable: true },
      ],
    });
  }
  return rows;
}

function soundsRows() {
  /** @type {BrowseRow[]} */
  const rows = [];
  for (const topic of SOUNDS_TOPICS) {
    for (const unit of topic.units || []) {
      rows.push({
        moduleId: "sounds",
        moduleLabel: "Sounds",
        topicId: topic.id,
        topicLabel: topic.label,
        unitId: unit.id,
        unitLabel: unit.label,
        blurb: unit.blurb || topic.blurb || "",
        playable: Boolean(topic.playable && unit.playable),
        quizTypes: unit.modes || [],
      });
    }
  }
  return rows;
}

function allRows() {
  const vocab = vocabularyRows();
  return [
    ...numbersRows(),
    ...vocab.filter((r) => r.moduleId === "numbers"),
    ...nounsRows(),
    ...vocab.filter((r) => r.moduleId === "nouns"),
    ...soundsRows(),
  ];
}

function allQuizTypeOptions(rows) {
  const map = new Map();
  for (const row of rows) {
    for (const q of row.quizTypes) {
      if (!map.has(q.id)) map.set(q.id, q.label);
    }
  }
  // Prefer shared matrix preset order, then leftovers (e.g. vocab).
  const ordered = [];
  for (const id of MATRIX_PRESET_IDS) {
    if (map.has(id)) {
      ordered.push({ id, label: map.get(id) });
      map.delete(id);
    }
  }
  for (const m of NUMBERS_MODES) {
    if (map.has(m.id)) {
      ordered.push({ id: m.id, label: map.get(m.id) });
      map.delete(m.id);
    }
  }
  for (const [id, label] of map) ordered.push({ id, label });
  return ordered;
}

function topicsForModule(moduleId, rows) {
  const seen = new Map();
  for (const row of rows) {
    if (row.moduleId !== moduleId) continue;
    if (!seen.has(row.topicId)) {
      seen.set(row.topicId, row.topicLabel);
    }
  }
  return [...seen.entries()].map(([id, label]) => ({ id, label }));
}

function readFiltersFromUrl() {
  const params = new URLSearchParams(location.search);
  return {
    module: params.get("module") || "all",
    topic: params.get("topic") || "all",
    quiz: params.get("quiz") || "all",
    status: params.get("status") || "all",
    q: params.get("q") || "",
    view: params.get("view") || "catalog",
  };
}

function writeFiltersToUrl(filters) {
  const params = new URLSearchParams();
  if (filters.module && filters.module !== "all") {
    params.set("module", filters.module);
  }
  if (filters.topic && filters.topic !== "all") {
    params.set("topic", filters.topic);
  }
  if (filters.quiz && filters.quiz !== "all") {
    params.set("quiz", filters.quiz);
  }
  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }
  if (filters.q) params.set("q", filters.q);
  if (filters.view && filters.view !== "catalog") {
    params.set("view", filters.view);
  }
  const qs = params.toString();
  const next = qs ? `${location.pathname}?${qs}` : location.pathname;
  history.replaceState(null, "", next);
}

function filterRows(rows, filters) {
  const needle = (filters.q || "").trim().toLowerCase();
  return rows.filter((row) => {
    if (filters.module !== "all" && row.moduleId !== filters.module) {
      return false;
    }
    if (filters.topic !== "all" && row.topicId !== filters.topic) {
      return false;
    }
    if (filters.status === "playable" && !row.playable) return false;
    if (filters.status === "soon" && row.playable) return false;
    if (filters.quiz !== "all") {
      const hit = row.quizTypes.some((q) => q.id === filters.quiz);
      if (!hit) return false;
    }
    if (needle) {
      const hay = [
        row.moduleLabel,
        row.topicLabel,
        row.unitLabel,
        row.blurb,
        ...row.quizTypes.map((q) => q.label),
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Build index.html launch URL for a live Module×Topic×Unit×Mode cell. */
function launchHref(row, quiz) {
  if (!row.playable || !quiz?.playable || quiz.planned) return "";
  const params = new URLSearchParams({ launch: "1", module: row.moduleId });

  if (quiz.id === "vocab-learn" || quiz.id === "vocab-practice") {
    params.set("vocab", "1");
    params.set("mode", quiz.id === "vocab-practice" ? "practice" : "learn");
    if (row.topicId === "vocabulary" && row.unitId) {
      params.set("area", row.unitId);
    }
    return `./index.html?${params.toString()}`;
  }

  if (row.moduleId === "numbers" || row.moduleId === "nouns") {
    params.set("topic", row.topicId);
    params.set("step", row.unitId);
    params.set("preset", quiz.id);
    const preset = getInteractionPreset(quiz.id);
    if (preset) {
      params.set("stimulus", preset.stimulus);
      params.set("response", preset.response);
    }
  } else if (row.moduleId === "sounds") {
    params.set("preset", quiz.id);
  } else {
    return "";
  }
  return `./index.html?${params.toString()}`;
}

function quizChipsHtml(row, highlightQuiz) {
  if (!row.quizTypes.length) {
    return `<span class="cb-chip is-empty">No quiz types yet</span>`;
  }
  return row.quizTypes
    .map((q) => {
      const classes = ["cb-chip"];
      if (!q.playable || q.planned) classes.push("is-soon");
      if (highlightQuiz && highlightQuiz !== "all" && q.id === highlightQuiz) {
        classes.push("is-hit");
      }
      const href = launchHref(row, q);
      const label = escapeHtml(q.label);
      const title = href
        ? `Play ${q.label} — opens in a new window`
        : q.label;
      const preset = getInteractionPreset(q.id);
      const pair =
        preset?.stimulus && preset?.response
          ? `${preset.stimulus} → ${preset.response}`
          : "";
      const pairHtml = pair
        ? `<span class="cb-pair">${escapeHtml(pair)}</span>`
        : "";
      if (href) {
        classes.push("is-launch");
        return `<a class="${classes.join(" ")}" href="${escapeHtml(
          href
        )}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(
          pair ? `${title} (${pair})` : title
        )}">${label}${pairHtml}</a>`;
      }
      return `<span class="${classes.join(" ")}" title="${escapeHtml(
        pair || title
      )}">${label}${pairHtml}</span>`;
    })
    .join("");
}

function renderStats(filtered, all) {
  const playable = filtered.filter((r) => r.playable).length;
  const quizCells = filtered.reduce(
    (n, r) => n + r.quizTypes.filter((q) => q.playable).length,
    0
  );
  const el = document.getElementById("cb-stats");
  if (!el) return;
  el.textContent = `${filtered.length} of ${all.length} units · ${playable} playable · ${quizCells} live quiz cells`;
}

function renderCatalog(rows, filters) {
  const root = document.getElementById("cb-results");
  if (!root) return;

  if (!rows.length) {
    root.innerHTML = `<p class="cb-empty">No units match these filters.</p>`;
    return;
  }

  /** @type {Map<string, Map<string, BrowseRow[]>>} */
  const tree = new Map();
  for (const row of rows) {
    if (!tree.has(row.moduleId)) tree.set(row.moduleId, new Map());
    const topics = tree.get(row.moduleId);
    if (!topics.has(row.topicId)) topics.set(row.topicId, []);
    topics.get(row.topicId).push(row);
  }

  const moduleOrder = MODULES.map((m) => m.id);
  const blocks = [];
  for (const moduleId of moduleOrder) {
    const topics = tree.get(moduleId);
    if (!topics) continue;
    const mod = MODULES.find((m) => m.id === moduleId);
    const topicBlocks = [];
    for (const [topicId, units] of topics) {
      const topicLabel = units[0]?.topicLabel || topicId;
      const unitRows = units
        .map((row) => {
          const status = row.playable
            ? `<span class="cb-status is-live">Playable</span>`
            : `<span class="cb-status is-soon">Coming soon</span>`;
          return `<li class="cb-unit${row.playable ? "" : " is-soon"}">
            <div class="cb-unit-head">
              <strong>${escapeHtml(row.unitLabel)}</strong>
              ${status}
            </div>
            ${
              row.blurb
                ? `<p class="cb-unit-blurb">${escapeHtml(row.blurb)}</p>`
                : ""
            }
            <div class="cb-chips" aria-label="Quiz types">${quizChipsHtml(
              row,
              filters.quiz
            )}</div>
            <button
              type="button"
              class="btn cb-note-btn"
              data-fb-unit
              data-module="${escapeHtml(row.moduleId)}"
              data-topic="${escapeHtml(row.topicId)}"
              data-unit="${escapeHtml(row.unitId)}"
              data-label="${escapeHtml(
                `${row.moduleLabel} · ${row.topicLabel} · ${row.unitLabel}`
              )}"
            >Note on this unit</button>
          </li>`;
        })
        .join("");
      topicBlocks.push(`<section class="cb-topic" data-topic="${escapeHtml(
        topicId
      )}">
        <h3 class="cb-topic-title">${escapeHtml(topicLabel)}</h3>
        <ul class="cb-unit-list">${unitRows}</ul>
      </section>`);
    }
    blocks.push(`<section class="cb-module" data-module="${escapeHtml(
      moduleId
    )}">
      <header class="cb-module-head">
        <h2>${escapeHtml(mod?.label || moduleId)}</h2>
        ${
          mod?.blurb
            ? `<p>${escapeHtml(mod.blurb)}</p>`
            : ""
        }
      </header>
      ${topicBlocks.join("")}
    </section>`);
  }

  root.innerHTML = blocks.join("");
}

/** Shared preset columns for every module matrix (same left→right order). */
function matrixColumnsForModule(_moduleId, moduleRows, filters) {
  const cols = [];
  const seen = new Set();
  for (const id of MATRIX_PRESET_IDS) {
    if (filters.quiz !== "all" && id !== filters.quiz) continue;
    const p = getInteractionPreset(id);
    const fromRow = moduleRows
      .flatMap((r) => r.quizTypes)
      .find((q) => q.id === id);
    cols.push({
      id,
      label: fromRow?.label || p?.label || id,
      pair:
        p?.stimulus && p?.response ? `${p.stimulus} → ${p.response}` : "",
    });
    seen.add(id);
  }
  // Vocab / one-off chips that aren't matrix presets (catalog still shows them).
  for (const row of moduleRows) {
    for (const q of row.quizTypes) {
      if (seen.has(q.id)) continue;
      if (filters.quiz !== "all" && q.id !== filters.quiz) continue;
      const p = getInteractionPreset(q.id);
      cols.push({
        id: q.id,
        label: q.label,
        pair:
          p?.stimulus && p?.response ? `${p.stimulus} → ${p.response}` : "",
      });
      seen.add(q.id);
    }
  }
  return cols;
}

function matrixTableHtml(moduleId, moduleLabel, moduleRows, filters) {
  const modeCols = matrixColumnsForModule(moduleId, moduleRows, filters);
  if (!modeCols.length) {
    return `<section class="cb-matrix-section">
      <h2 class="cb-matrix-module">${escapeHtml(moduleLabel)}</h2>
      <p class="cb-empty">No quiz columns for this filter.</p>
    </section>`;
  }

  const head = modeCols
    .map((m) => {
      const title = m.pair ? `${m.label} (${m.pair})` : m.label;
      return `<th scope="col" title="${escapeHtml(title)}">
          <span class="cb-matrix-preset">${escapeHtml(m.label)}</span>
          ${
            m.pair
              ? `<span class="cb-matrix-pair">${escapeHtml(m.pair)}</span>`
              : ""
          }
        </th>`;
    })
    .join("");

  let lastTopic = "";
  const body = moduleRows
    .map((row) => {
      let topicRow = "";
      if (row.topicId !== lastTopic) {
        lastTopic = row.topicId;
        topicRow = `<tr class="cb-matrix-topic"><th colspan="${
          modeCols.length + 1
        }">${escapeHtml(row.topicLabel)}</th></tr>`;
      }
      const cells = modeCols
        .map((m) => {
          const hit = row.quizTypes.find((q) => q.id === m.id);
          if (!hit) {
            return `<td class="cb-cell is-na" title="Not offered">·</td>`;
          }
          if (hit.playable && !hit.planned) {
            const href = launchHref(row, hit);
            if (href) {
              return `<td class="cb-cell is-live"><a class="cb-matrix-launch" href="${escapeHtml(
                href
              )}" target="_blank" rel="noopener noreferrer" title="Play ${escapeHtml(
                hit.label
              )} — new window"><span>●</span></a></td>`;
            }
            return `<td class="cb-cell is-live" title="Playable"><span>●</span></td>`;
          }
          return `<td class="cb-cell is-soon" title="Planned / coming soon"><span>○</span></td>`;
        })
        .join("");
      return `${topicRow}<tr class="${row.playable ? "" : "is-soon"}">
        <th scope="row">
          <span class="cb-matrix-unit">${escapeHtml(row.unitLabel)}</span>
          ${
            row.playable
              ? ""
              : `<span class="cb-status is-soon">Soon</span>`
          }
        </th>
        ${cells}
      </tr>`;
    })
    .join("");

  return `<section class="cb-matrix-section">
    <h2 class="cb-matrix-module">${escapeHtml(moduleLabel)}</h2>
    <div class="cb-matrix-wrap">
      <table class="cb-matrix">
        <thead>
          <tr>
            <th scope="col">Unit</th>
            ${head}
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  </section>`;
}

function renderMatrix(rows, filters) {
  const root = document.getElementById("cb-results");
  if (!root) return;

  const sections = [];
  for (const mod of MODULES) {
    if (filters.module !== "all" && filters.module !== mod.id) continue;
    // Matrix = interaction-preset grid; Vocabulary stays in Catalog.
    const moduleRows = rows.filter(
      (r) => r.moduleId === mod.id && r.topicId !== "vocabulary"
    );
    if (!moduleRows.length) continue;
    sections.push(matrixTableHtml(mod.id, mod.label, moduleRows, filters));
  }

  if (!sections.length) {
    root.innerHTML = `<p class="cb-empty">No units match these filters. Switch to Catalog or clear filters.</p>`;
    return;
  }

  root.innerHTML = `${sections.join("")}
    <p class="cb-matrix-legend"><span class="is-live">●</span> Playable (click to launch) · <span class="is-soon">○</span> Planned · · Not offered</p>`;
}

function syncTopicSelect(rows, filters) {
  const sel = document.getElementById("cb-topic");
  if (!sel) return;
  const moduleId = filters.module === "all" ? null : filters.module;
  /** @type {{ id: string, label: string }[]} */
  let topics = [];
  if (moduleId) {
    topics = topicsForModule(moduleId, rows);
  } else {
    const seen = new Map();
    for (const row of rows) {
      const key = `${row.moduleId}:${row.topicId}`;
      if (!seen.has(key)) {
        seen.set(key, {
          id: row.topicId,
          label: `${row.moduleLabel} · ${row.topicLabel}`,
        });
      }
    }
    topics = [...seen.values()];
  }

  const keep = filters.topic;
  sel.innerHTML =
    `<option value="all">All topics</option>` +
    topics
      .map(
        (t) =>
          `<option value="${escapeHtml(t.id)}">${escapeHtml(t.label)}</option>`
      )
      .join("");
  if (keep !== "all" && topics.some((t) => t.id === keep)) {
    sel.value = keep;
  } else {
    sel.value = "all";
    filters.topic = "all";
  }
}

function syncQuizSelect(quizOptions, filters) {
  const sel = document.getElementById("cb-quiz");
  if (!sel) return;
  sel.innerHTML =
    `<option value="all">All quiz types</option>` +
    quizOptions
      .map(
        (q) =>
          `<option value="${escapeHtml(q.id)}">${escapeHtml(q.label)}</option>`
      )
      .join("");
  if (quizOptions.some((q) => q.id === filters.quiz)) {
    sel.value = filters.quiz;
  } else {
    sel.value = "all";
    filters.quiz = "all";
  }
}

function applyTheme() {
  try {
    const pref = localStorage.getItem("schnapp-theme") || "system";
    const dark =
      pref === "dark" ||
      (pref !== "light" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
  } catch (_) {
    /* ignore */
  }
}

function mount() {
  applyTheme();
  const rows = allRows();
  const quizOptions = allQuizTypeOptions(rows);
  const filters = readFiltersFromUrl();

  const moduleSel = document.getElementById("cb-module");
  const topicSel = document.getElementById("cb-topic");
  const quizSel = document.getElementById("cb-quiz");
  const statusSel = document.getElementById("cb-status");
  const searchInput = document.getElementById("cb-search");
  const viewCatalog = document.getElementById("cb-view-catalog");
  const viewMatrix = document.getElementById("cb-view-matrix");

  if (moduleSel) {
    moduleSel.innerHTML =
      `<option value="all">All modules</option>` +
      MODULES.map(
        (m) =>
          `<option value="${escapeHtml(m.id)}">${escapeHtml(m.label)}</option>`
      ).join("");
    moduleSel.value = filters.module;
  }
  if (statusSel) statusSel.value = filters.status;
  if (searchInput) searchInput.value = filters.q;

  syncTopicSelect(rows, filters);
  syncQuizSelect(quizOptions, filters);

  function paint() {
    filters.module = moduleSel?.value || "all";
    filters.topic = topicSel?.value || "all";
    filters.quiz = quizSel?.value || "all";
    filters.status = statusSel?.value || "all";
    filters.q = searchInput?.value || "";
    filters.view = viewMatrix?.classList.contains("is-on")
      ? "matrix"
      : "catalog";

    writeFiltersToUrl(filters);
    const filtered = filterRows(rows, filters);
    renderStats(filtered, rows);
    if (filters.view === "matrix") renderMatrix(filtered, filters);
    else renderCatalog(filtered, filters);

    viewCatalog?.classList.toggle("is-on", filters.view === "catalog");
    viewMatrix?.classList.toggle("is-on", filters.view === "matrix");
    viewCatalog?.setAttribute(
      "aria-pressed",
      String(filters.view === "catalog")
    );
    viewMatrix?.setAttribute(
      "aria-pressed",
      String(filters.view === "matrix")
    );
  }

  moduleSel?.addEventListener("change", () => {
    filters.module = moduleSel.value;
    filters.topic = "all";
    syncTopicSelect(rows, filters);
    paint();
  });
  topicSel?.addEventListener("change", paint);
  quizSel?.addEventListener("change", paint);
  statusSel?.addEventListener("change", paint);
  searchInput?.addEventListener("input", paint);

  viewCatalog?.addEventListener("click", () => {
    viewCatalog.classList.add("is-on");
    viewMatrix?.classList.remove("is-on");
    paint();
  });
  viewMatrix?.addEventListener("click", () => {
    viewMatrix.classList.add("is-on");
    viewCatalog?.classList.remove("is-on");
    paint();
  });

  function browseContext(extra = {}) {
    const bits = [
      filters.module !== "all" ? `module=${filters.module}` : null,
      filters.topic !== "all" ? `topic=${filters.topic}` : null,
      filters.quiz !== "all" ? `quiz=${filters.quiz}` : null,
      filters.view,
    ].filter(Boolean);
    return {
      source: "curriculum-browse",
      label: extra.label || `Browse · ${bits.join(" · ") || "all"}`,
      territory: extra.module || (filters.module !== "all" ? filters.module : undefined),
      topicId: extra.topic || (filters.topic !== "all" ? filters.topic : undefined),
      stepId: extra.unit,
      modeId: filters.quiz !== "all" ? filters.quiz : undefined,
      ...extra,
    };
  }

  bindFeedbackTrigger(document.getElementById("cb-feedback"), () =>
    browseContext()
  );

  document.getElementById("cb-results")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-fb-unit]");
    if (!btn) return;
    openFeedbackComposer(
      browseContext({
        module: btn.dataset.module,
        topic: btn.dataset.topic,
        unit: btn.dataset.unit,
        label: btn.dataset.label,
        territory: btn.dataset.module,
        topicId: btn.dataset.topic,
        stepId: btn.dataset.unit,
      })
    );
  });

  if (filters.view === "matrix") {
    viewMatrix?.classList.add("is-on");
    viewCatalog?.classList.remove("is-on");
  }

  paint();
}

mount();
