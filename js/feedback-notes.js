/**
 * In-app feedback / curriculum-review notes.
 * Shared by the practice mock and curriculum-browse.
 * Persists to localStorage; export JSON + plaintext for copy/paste.
 */

const STORAGE_KEY = "schnapp-feedback-notes";
const STYLE_ID = "feedback-notes-style";

/** @typedef {"review"|"bug"|"feature"|"other"} FeedbackKind */

/**
 * @typedef {object} FeedbackContext
 * @property {string} [source]
 * @property {string} [href]
 * @property {string} [view]
 * @property {string} [territory]
 * @property {string} [topicId]
 * @property {string} [stepId]
 * @property {string} [modeId]
 * @property {string} [familyId]
 * @property {string} [label]
 * @property {boolean} [launch]
 * @property {string} [hintDepth]
 */

/**
 * @typedef {object} FeedbackNote
 * @property {string} id
 * @property {number} at
 * @property {FeedbackKind} kind
 * @property {string[]} tags
 * @property {string} body
 * @property {FeedbackContext} context
 */

const KIND_LABELS = {
  review: "Curriculum review",
  bug: "Bug",
  feature: "Feature idea",
  other: "Other",
};

const TAG_OPTIONS = [
  { id: "too-hard", label: "Too hard" },
  { id: "too-easy", label: "Too easy" },
  { id: "seed-wrong", label: "Seed / difficulty off" },
  { id: "ladder-gap", label: "Hint ladder gap" },
  { id: "copy-unclear", label: "Copy unclear" },
  { id: "ui-glitch", label: "UI glitch" },
  { id: "ok", label: "Looks good" },
];

function uid() {
  return `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** @returns {FeedbackNote[]} */
export function loadFeedbackNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

/** @param {FeedbackNote[]} notes */
function saveFeedbackNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

/**
 * @param {{ kind: FeedbackKind, tags?: string[], body: string, context?: FeedbackContext }} input
 * @returns {FeedbackNote}
 */
export function addFeedbackNote(input) {
  const note = {
    id: uid(),
    at: Date.now(),
    kind: input.kind || "other",
    tags: Array.isArray(input.tags) ? input.tags.filter(Boolean) : [],
    body: String(input.body || "").trim(),
    context: {
      href: location.href,
      ...(input.context || {}),
    },
  };
  const notes = loadFeedbackNotes();
  notes.unshift(note);
  saveFeedbackNotes(notes);
  return note;
}

/** @param {string} id */
export function deleteFeedbackNote(id) {
  saveFeedbackNotes(loadFeedbackNotes().filter((n) => n.id !== id));
}

export function clearFeedbackNotes() {
  saveFeedbackNotes([]);
}

/** @param {FeedbackNote[]} [notes] */
export function exportFeedbackJson(notes = loadFeedbackNotes()) {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      app: "schnapp-mock",
      schema: "feedback-notes.v1",
      count: notes.length,
      notes,
    },
    null,
    2
  );
}

/** @param {FeedbackNote[]} [notes] */
export function exportFeedbackPlaintext(notes = loadFeedbackNotes()) {
  if (!notes.length) return "(No feedback notes yet.)\n";
  const blocks = notes.map((n, i) => {
    const when = new Date(n.at).toISOString();
    const kind = KIND_LABELS[n.kind] || n.kind;
    const tags = n.tags.length ? n.tags.join(", ") : "—";
    const ctx = n.context || {};
    const loc =
      ctx.label ||
      [ctx.territory, ctx.topicId, ctx.stepId || ctx.familyId, ctx.modeId]
        .filter(Boolean)
        .join(" · ") ||
      ctx.href ||
      "—";
    return [
      `### ${i + 1}. ${kind}`,
      `When: ${when}`,
      `Where: ${loc}`,
      `Tags: ${tags}`,
      ctx.href ? `URL: ${ctx.href}` : null,
      "",
      n.body || "(no note body)",
      "",
    ]
      .filter((line) => line != null)
      .join("\n");
  });
  return [
    "Schnapp feedback export",
    `Exported: ${new Date().toISOString()}`,
    `Notes: ${notes.length}`,
    "",
    "Paste into chat or a ticket so someone can update curriculum packages / fix bugs.",
    "",
    ...blocks,
  ].join("\n");
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (_) {
      /* ignore */
    }
    ta.remove();
    return ok;
  }
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = new URL("../css/feedback-notes.css", import.meta.url).href;
  document.head.appendChild(link);
}

function contextSummary(ctx) {
  if (!ctx) return "No context";
  if (ctx.label) return ctx.label;
  const bits = [
    ctx.territory,
    ctx.topicId,
    ctx.stepId || ctx.familyId,
    ctx.modeId,
  ].filter(Boolean);
  return bits.length ? bits.join(" · ") : ctx.source || "General";
}

function defaultKindFromContext(ctx) {
  if (ctx?.launch || ctx?.source === "curriculum-browse") return "review";
  return "bug";
}

/**
 * @param {FeedbackContext} [context]
 * @param {{ onChange?: () => void }} [opts]
 */
export function openFeedbackComposer(context = {}, opts = {}) {
  ensureStyles();
  closeFeedbackComposer();

  const ctx = {
    href: location.href,
    source: context.source || "mock",
    ...context,
  };
  const kind0 = defaultKindFromContext(ctx);

  const root = document.createElement("div");
  root.className = "fb-root";
  root.id = "feedback-notes-root";
  root.innerHTML = `
    <button type="button" class="fb-scrim" data-fb-close aria-label="Close"></button>
    <div class="fb-panel" role="dialog" aria-modal="true" aria-labelledby="fb-title">
      <header class="fb-head">
        <h2 id="fb-title">Feedback &amp; notes</h2>
        <button type="button" class="fb-x" data-fb-close aria-label="Close">×</button>
      </header>
      <div class="fb-body">
        <p class="fb-lede">
          Curriculum review findings, bugs, and feature ideas — saved on this device.
          Export and paste into chat or a ticket when ready to implement.
        </p>
        <p class="fb-context"><span class="fb-k">Context</span> ${escapeHtml(
          contextSummary(ctx)
        )}</p>
        <form class="fb-form" id="fb-form">
          <label class="fb-field">
            <span>Kind</span>
            <select name="kind" id="fb-kind">
              ${Object.entries(KIND_LABELS)
                .map(
                  ([id, label]) =>
                    `<option value="${id}"${
                      id === kind0 ? " selected" : ""
                    }>${escapeHtml(label)}</option>`
                )
                .join("")}
            </select>
          </label>
          <fieldset class="fb-tags">
            <legend>Tags</legend>
            <div class="fb-tag-grid">
              ${TAG_OPTIONS.map(
                (t) => `<label class="fb-tag">
                  <input type="checkbox" name="tag" value="${escapeHtml(t.id)}" />
                  <span>${escapeHtml(t.label)}</span>
                </label>`
              ).join("")}
            </div>
          </fieldset>
          <label class="fb-field">
            <span>Note</span>
            <textarea name="body" id="fb-body" rows="4" required
              placeholder="What happened? What should change in the package / product?"></textarea>
          </label>
          <div class="fb-actions">
            <button type="submit" class="fb-btn fb-btn-primary">Save note</button>
            <button type="button" class="fb-btn" data-fb-close>Cancel</button>
          </div>
        </form>
        <section class="fb-list-wrap" aria-label="Saved notes">
          <div class="fb-list-head">
            <h3>Saved <span id="fb-count"></span></h3>
            <div class="fb-export">
              <button type="button" class="fb-btn" data-fb-copy="json">Copy JSON</button>
              <button type="button" class="fb-btn" data-fb-copy="text">Copy text</button>
              <button type="button" class="fb-btn fb-btn-danger" data-fb-clear>Clear all</button>
            </div>
          </div>
          <p class="fb-toast" id="fb-toast" hidden></p>
          <ul class="fb-list" id="fb-list"></ul>
        </section>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  const toast = root.querySelector("#fb-toast");
  function flash(msg) {
    if (!toast) return;
    toast.hidden = false;
    toast.textContent = msg;
    clearTimeout(flash._t);
    flash._t = setTimeout(() => {
      toast.hidden = true;
    }, 2200);
  }

  function renderList() {
    const notes = loadFeedbackNotes();
    const count = root.querySelector("#fb-count");
    const list = root.querySelector("#fb-list");
    if (count) count.textContent = `(${notes.length})`;
    if (!list) return;
    if (!notes.length) {
      list.innerHTML = `<li class="fb-empty">No notes yet.</li>`;
      return;
    }
    list.innerHTML = notes
      .map((n) => {
        const when = new Date(n.at).toLocaleString();
        const kind = KIND_LABELS[n.kind] || n.kind;
        const tags = n.tags.length
          ? n.tags.map((t) => `<span class="fb-pill">${escapeHtml(t)}</span>`).join("")
          : "";
        return `<li class="fb-item" data-id="${escapeHtml(n.id)}">
          <div class="fb-item-head">
            <strong>${escapeHtml(kind)}</strong>
            <span class="fb-muted">${escapeHtml(when)}</span>
            <button type="button" class="fb-link" data-fb-delete="${escapeHtml(
              n.id
            )}">Delete</button>
          </div>
          <div class="fb-muted">${escapeHtml(contextSummary(n.context))}</div>
          ${tags ? `<div class="fb-pill-row">${tags}</div>` : ""}
          <p class="fb-item-body">${escapeHtml(n.body)}</p>
        </li>`;
      })
      .join("");
  }

  root.addEventListener("click", async (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.closest("[data-fb-close]")) {
      closeFeedbackComposer();
      return;
    }
    const del = t.closest("[data-fb-delete]");
    if (del) {
      deleteFeedbackNote(del.getAttribute("data-fb-delete") || "");
      renderList();
      opts.onChange?.();
      flash("Deleted");
      return;
    }
    const copy = t.closest("[data-fb-copy]");
    if (copy) {
      const mode = copy.getAttribute("data-fb-copy");
      const text =
        mode === "json" ? exportFeedbackJson() : exportFeedbackPlaintext();
      const ok = await copyText(text);
      flash(ok ? `Copied ${mode === "json" ? "JSON" : "plaintext"}` : "Copy failed");
      return;
    }
    if (t.closest("[data-fb-clear]")) {
      if (!loadFeedbackNotes().length) return;
      if (!confirm("Clear all feedback notes on this device?")) return;
      clearFeedbackNotes();
      renderList();
      opts.onChange?.();
      flash("Cleared");
    }
  });

  root.querySelector("#fb-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    const fd = new FormData(form);
    const kind = /** @type {FeedbackKind} */ (String(fd.get("kind") || "other"));
    const body = String(fd.get("body") || "").trim();
    if (!body) return;
    const tags = [...form.querySelectorAll('input[name="tag"]:checked')].map(
      (el) => /** @type {HTMLInputElement} */ (el).value
    );
    addFeedbackNote({ kind, tags, body, context: ctx });
    form.reset();
    const kindSel = root.querySelector("#fb-kind");
    if (kindSel instanceof HTMLSelectElement) kindSel.value = kind0;
    renderList();
    opts.onChange?.();
    flash("Saved");
  });

  renderList();
  root.querySelector("#fb-body")?.focus();
}

export function closeFeedbackComposer() {
  document.getElementById("feedback-notes-root")?.remove();
}

/**
 * Wire a click target to open the composer with fresh context.
 * @param {Element | null} el
 * @param {() => FeedbackContext} getContext
 */
export function bindFeedbackTrigger(el, getContext) {
  if (!el) return;
  el.addEventListener("click", (e) => {
    e.preventDefault();
    openFeedbackComposer(getContext() || {});
  });
}

/** Infer review context from launch query params (curriculum-browse → mock). */
export function contextFromLocationSearch() {
  const params = new URLSearchParams(location.search);
  if (params.get("launch") !== "1") return null;
  const moduleId = params.get("module") || "numbers";
  return {
    source: "curriculum-browse",
    launch: true,
    territory: moduleId,
    topicId: params.get("topic") || undefined,
    stepId: params.get("step") || undefined,
    modeId: params.get("preset") || params.get("mode") || undefined,
    familyId: params.get("family") || undefined,
    label: [
      "Launch",
      moduleId,
      params.get("topic"),
      params.get("step") || params.get("family"),
      params.get("preset") || params.get("mode"),
    ]
      .filter(Boolean)
      .join(" · "),
  };
}
