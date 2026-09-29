/**
 * Nav carousel — Learn|Play → horizontal cards (tap select / hold drill).
 * Standalone page or embedded hub in the main mock.
 */

import { NUMBERS_TOPICS, modesForStep } from "./numbers-curriculum.js?v=20260929-dmo15";
import { genderShortcutsNavUnits, modalitiesForUnit } from "./nouns-curriculum.js?v=20260929-dmo4";

const CAPS_KEY = "schnapp-nav-caps";
const LONG_MS = 500;
const MOVE_PX = 10;

const CHECK_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`;
const ARROW_SVG = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>`;

const HAT_SVG = `<svg viewBox="0 0 24 24" width="56" height="56" fill="currentColor" aria-hidden="true"><path d="M9.90878 3.70062C11.1832 2.88365 12.8168 2.88365 14.0912 3.70062L22.1548 8.86959C22.3689 9.00687 22.4989 9.24336 22.5 9.49775C22.5011 9.75213 22.3732 9.98974 22.1602 10.1289L19 12.1935V17.7509C19 17.9132 18.9474 18.0711 18.85 18.2009L18.8489 18.2024L18.8477 18.204L18.8446 18.208L18.8364 18.2187C18.8321 18.2242 18.8269 18.2308 18.8209 18.2383C18.8179 18.2421 18.8146 18.2462 18.8111 18.2505C18.7904 18.2761 18.7619 18.3105 18.7253 18.3522C18.6522 18.4358 18.5469 18.5493 18.4081 18.6826C18.1305 18.9491 17.7176 19.2958 17.1587 19.6397C16.0359 20.3306 14.3387 21.0009 12 21.0009C9.66127 21.0009 7.96408 20.3306 6.8413 19.6397C6.2824 19.2958 5.86951 18.9491 5.59193 18.6826C5.45308 18.5493 5.34778 18.4358 5.27468 18.3522C5.23204 18.3035 5.1901 18.2541 5.15107 18.2024C5.14956 18.2004 5.15 18.2009 5.15 18.2009C5.05263 18.0711 5 17.9132 5 17.7509V12.1935L3 10.8869V16.2509C3 16.6652 2.66421 17.0009 2.25 17.0009C1.83579 17.0009 1.5 16.6652 1.5 16.2509V9.50095C1.5 9.23047 1.64318 8.99343 1.85788 8.8615L9.90878 3.70062ZM14.1194 15.3822C12.8317 16.2235 11.1683 16.2234 9.88058 15.3822L6.5 13.1735V17.4697C6.5368 17.5082 6.58034 17.5522 6.63073 17.6005C6.84143 17.8028 7.17072 18.0811 7.62745 18.3622C8.53592 18.9213 9.96373 19.5009 12 19.5009C14.0363 19.5009 15.4641 18.9213 16.3726 18.3622C16.8293 18.0811 17.1586 17.8028 17.3693 17.6005C17.4197 17.5522 17.4632 17.5082 17.5 17.4697V13.1735L14.1194 15.3822ZM13.2817 4.96343C12.5006 4.46271 11.4994 4.46271 10.7183 4.96343L3.63041 9.50698L10.701 14.1264C11.4902 14.642 12.5098 14.642 13.299 14.1264L20.3696 9.50698L13.2817 4.96343Z"/></svg>`;

const GAME_SVG = `<svg viewBox="0 0 16 16" width="52" height="52" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 3H12C14.2091 3 16 4.79086 16 7V10C16 12.2091 14.2091 14 12 14H4C1.79086 14 0 12.2091 0 10V7C0 4.79086 1.79086 3 4 3ZM4 4C2.34315 4 1 5.34315 1 7V10C1 11.6569 2.34315 13 4 13H12C13.6569 13 15 11.6569 15 10V7C15 5.34315 13.6569 4 12 4H4Z"/><path d="M5.5 6C5.22386 6 5 6.22386 5 6.5V8H3.5C3.22386 8 3 8.22386 3 8.5C3 8.77614 3.22386 9 3.5 9H5V10.5C5 10.7761 5.22386 11 5.5 11C5.77614 11 6 10.7761 6 10.5V9H7.5C7.77614 9 8 8.77614 8 8.5C8 8.22386 7.77614 8 7.5 8H6V6.5C6 6.22386 5.77614 6 5.5 6Z"/><path d="M13 7C13 7.55228 12.5523 8 12 8C11.4477 8 11 7.55228 11 7C11 6.44772 11.4477 6 12 6C12.5523 6 13 6.44772 13 7Z"/><path d="M12 10C12 10.5523 11.5523 11 11 11C10.4477 11 10 10.5523 10 10C10 9.44772 10.4477 9 11 9C11.5523 9 12 9.44772 12 10Z"/></svg>`;

const PLAY_SVG = `<svg viewBox="0 0 16 16" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>`;

/* Fluent Edit — © 2020 Microsoft Corporation, MIT License */
const KEY_SVG = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M20.0626 8.44532C21.319 9.70247 21.3183 11.7401 20.0612 12.9964L12.938 20.1076C12.675 20.3701 12.3511 20.5634 11.9952 20.6703L7.70221 21.9589C7.17324 22.1177 6.61571 21.8176 6.45694 21.2886C6.3987 21.0946 6.40076 20.8874 6.46285 20.6946L7.82425 16.4666C7.93389 16.1261 8.12313 15.8166 8.37628 15.5639L15.5091 8.44272C16.7674 7.18646 18.8058 7.18762 20.0626 8.44532ZM16.5689 9.50425L9.43607 16.6254C9.35168 16.7096 9.2886 16.8128 9.25206 16.9263L8.18228 20.2487L11.564 19.2336C11.6826 19.198 11.7906 19.1336 11.8782 19.046L19.0002 11.9361C19.6721 11.2647 19.6724 10.1768 19.0016 9.50564C18.3301 8.83371 17.2412 8.83309 16.5689 9.50425ZM8.15104 2.36975L8.20152 2.47487L11.454 10.724L10.297 11.879L9.556 10H5.443L4.44768 12.5209C4.30809 12.874 3.93033 13.0621 3.57164 12.9737L3.47447 12.9426C3.12137 12.803 2.93328 12.4253 3.02168 12.0666L3.05272 11.9694L6.80633 2.47427C7.04172 1.87883 7.84884 1.84415 8.15104 2.36975ZM7.50294 4.79226L6.036 8.5H8.964L7.50294 4.79226Z" fill="currentColor"/></svg>`;

const HEAD_SVG = `<svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M8 3a5 5 0 0 0-5 5v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a6 6 0 1 1 12 0v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1V8a5 5 0 0 0-5-5z"/></svg>`;

/** Nouns territory: Gender Shortcuts learn units; Plurals / Articles stubbed. */
const NOUNS_BRANCH = {
  id: "nouns",
  title: "Nouns",
  type: "topic",
  territory: "nouns",
  children: [
    {
      id: "nouns:gender-shortcuts",
      title: "Gender Shortcuts",
      type: "subtopic",
      territory: "nouns",
      children: genderShortcutsNavUnits(),
    },
    {
      id: "nouns:plurals",
      title: "Plurals",
      type: "subtopic",
      territory: "nouns",
      children: [
        {
          id: "nouns:plurals:soon",
          title: "Coming soon",
          type: "unit",
          territory: "nouns",
          playable: false,
        },
      ],
    },
    {
      id: "nouns:articles",
      title: "Articles",
      type: "subtopic",
      territory: "nouns",
      children: [
        {
          id: "nouns:articles:soon",
          title: "Coming soon",
          type: "unit",
          territory: "nouns",
          playable: false,
        },
      ],
    },
  ],
};

/**
 * Build nav tree from Numbers curriculum + Nouns stub.
 * Unit ids are `topicId:stepId` for Numbers.
 */
export function buildNavTree() {
  const numbersChildren = NUMBERS_TOPICS.map((t) => ({
    id: `numbers:${t.id}`,
    title: t.label,
    type: "subtopic",
    territory: "numbers",
    topicId: t.id,
    playable: t.playable,
    children: (t.steps || []).map((s) => ({
      id: `${t.id}:${s.id}`,
      title: s.label,
      type: "unit",
      territory: "numbers",
      topicId: t.id,
      stepId: s.id,
      playable: !!s.playable,
    })),
  }));

  return [
    {
      id: "numbers",
      title: "Numbers",
      type: "topic",
      territory: "numbers",
      children: numbersChildren,
    },
    NOUNS_BRANCH,
  ];
}

/** Depth-first unit order for Learn (and stable playlist order). */
export function unitTreeOrderMap(tree = buildNavTree()) {
  const map = new Map();
  let i = 0;
  function walk(nodes) {
    for (const n of nodes || []) {
      if (n.type === "unit") map.set(n.id, i++);
      if (n.children?.length) walk(n.children);
    }
  }
  walk(tree);
  return map;
}

function shellHtml({ embedded }) {
  const brand = embedded
    ? ""
    : `<header class="nc-topbar">
        <span class="nc-brand-mark" aria-label="Schnapp"
          >Schn<span class="nc-brand-a">a</span><span class="nc-brand-p1">p</span
          ><span class="nc-brand-p2">p</span></span
        >
      </header>`;

  return `
    <div class="nc-phone${embedded ? " is-embedded" : ""}">
      <section class="nc-screen nc-screen-mode is-active" data-nc-screen="1">
        ${brand}
        <h1 class="nc-mode-title">Choose a path</h1>
        <p class="nc-mode-lede">Learn opens unit reference. Play practices or mixes quiz modalities.</p>
        <div class="nc-mode-stack">
          <button type="button" class="nc-mode-card" data-enter="learn">
            <span class="nc-mode-icon">${HAT_SVG}</span>
            <span class="nc-mode-label">Learn</span>
          </button>
          <button type="button" class="nc-mode-card nc-mode-play" data-enter="play">
            <span class="nc-mode-icon">${GAME_SVG}</span>
            <span class="nc-mode-label">Play</span>
          </button>
        </div>
        <button type="button" class="nc-guided" data-guided>
          <span class="nc-start-icon">${PLAY_SVG}</span>
          <span>Start guided</span>
        </button>
      </section>

      <section class="nc-screen nc-screen-nav" data-nc-screen="2" hidden>
        ${brand}
        <div class="nc-carousel-wrap">
          <div class="nc-nest" data-nc-crumbs aria-label="Parent" hidden></div>
          <div class="nc-carousel no-scrollbar" data-nc-carousel aria-label="Topics and units"></div>
        </div>
        <footer class="nc-bar">
          <button type="button" class="nc-start" data-nc-start disabled>
            <span class="nc-start-icon">${PLAY_SVG}</span>
            <span class="nc-start-label">Start (<span data-nc-count>0</span>)</span>
          </button>
          <div class="nc-bar-caps" role="group" aria-label="Practice styles">
            <span class="nc-caps-label">Practice styles</span>
            <button type="button" class="nc-cap" data-nc-cap="keyboard" aria-pressed="true" aria-label="Write practice style" title="Write — free-form text">${KEY_SVG}</button>
            <button type="button" class="nc-cap" data-nc-cap="audio" aria-pressed="true" aria-label="Listen practice style" title="Listen — audio in">${HEAD_SVG}</button>
          </div>
        </footer>
        <div class="nc-playlist-sheet" data-nc-playlist-sheet hidden>
          <div class="nc-cfg-backdrop" data-nc-playlist-close tabindex="-1"></div>
          <div class="nc-cfg-panel" role="dialog" aria-labelledby="nc-playlist-title">
            <div class="nc-cfg-head">
              <h2 id="nc-playlist-title">Playlist</h2>
              <button type="button" class="nc-cfg-done" data-nc-playlist-close>Done</button>
            </div>
            <p class="nc-cfg-lede">Hold Start to open. Swipe left on a unit to remove.</p>
            <ul class="nc-playlist-list" data-nc-playlist-body></ul>
          </div>
        </div>
      </section>
      <div class="nc-toast" data-nc-toast hidden role="status"></div>
    </div>
  `;
}

/**
 * @param {HTMLElement} container
 * @param {{ embedded?: boolean, onStart?: (payload: object) => void }} [options]
 */
export function mountNavCarousel(container, options = {}) {
  const embedded = !!options.embedded;
  const onStart = options.onStart || null;
  const tree = buildNavTree();

  /** @type {Map<string, object>} */
  const unitIndex = new Map();
  (function index(nodes) {
    for (const n of nodes) {
      if (n.type === "unit") unitIndex.set(n.id, n);
      if (n.children) index(n.children);
    }
  })(tree);

  const state = {
    mode: /** @type {"learn"|"play"|null} */ (null),
    navStack: /** @type {object[]} */ ([]),
    selected: new Set(),
    keyboard: true,
    audio: true,
    playlistOpen: false,
  };

  try {
    const raw = localStorage.getItem(CAPS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.keyboard === "boolean") state.keyboard = parsed.keyboard;
      if (typeof parsed.audio === "boolean") state.audio = parsed.audio;
    }
  } catch (_) {}

  function saveCaps() {
    try {
      localStorage.setItem(
        CAPS_KEY,
        JSON.stringify({
          keyboard: state.keyboard,
          audio: state.audio,
        })
      );
    } catch (_) {}
  }

  container.innerHTML = shellHtml({ embedded });
  const root = container.querySelector(".nc-phone");
  const s1 = root.querySelector('[data-nc-screen="1"]');
  const s2 = root.querySelector('[data-nc-screen="2"]');
  const crumbsEl = root.querySelector("[data-nc-crumbs]");
  const carouselEl = root.querySelector("[data-nc-carousel]");
  const startBtn = root.querySelector("[data-nc-start]");
  const countEl = root.querySelector("[data-nc-count]");
  const toastEl = root.querySelector("[data-nc-toast]");
  const keyBtn = root.querySelector('[data-nc-cap="keyboard"]');
  const audioBtn = root.querySelector('[data-nc-cap="audio"]');
  const capsGroup = root.querySelector(".nc-bar-caps");
  const playlistSheet = root.querySelector("[data-nc-playlist-sheet]");
  const playlistBody = root.querySelector("[data-nc-playlist-body]");

  const treeOrder = unitTreeOrderMap(tree);

  function selectedUnits() {
    return [...state.selected]
      .map((id) => unitIndex.get(id))
      .filter(Boolean)
      .sort(
        (a, b) =>
          (treeOrder.get(a.id) ?? 1e9) - (treeOrder.get(b.id) ?? 1e9) ||
          a.id.localeCompare(b.id)
      );
  }

  function caps() {
    return {
      keyboard: state.keyboard,
      audio: state.audio,
    };
  }

  /**
   * Unit supports practice under current caps.
   * Pick-style (Build / Choose article) is always available when the unit allows it;
   * Write/Listen only when those caps are on.
   */
  function unitMatchesCaps(u, c = caps()) {
    if (!u || u.playable === false) return false;
    if (u.territory === "numbers" && u.topicId && u.stepId) {
      return modesForStep(u.topicId, u.stepId).some(
        (m) =>
          m.id === "build" ||
          m.id === "cloze" ||
          m.id === "visual" ||
          m.id === "sentence" ||
          (m.id === "listen" && c.audio) ||
          ((m.id === "convert" || m.id === "proofread") && c.keyboard)
      );
    }
    if (u.territory === "nouns" && u.learnUnitId) {
      return modalitiesForUnit(u.learnUnitId).some(
        (m) =>
          m.playable &&
          (m.id === "choose-article" ||
            m.id === "category-gender" ||
            (m.id === "type-article" && c.keyboard))
      );
    }
    return false;
  }

  /** Selected units that can actually run under current caps (Play). */
  function eligibleUnits() {
    if (state.mode === "learn") return selectedUnits();
    return selectedUnits().filter((u) => unitMatchesCaps(u));
  }

  function toggleCap(key) {
    state[key] = !state[key];
    saveCaps();
    renderNav();
  }

  function closePlaylist() {
    state.playlistOpen = false;
    if (playlistSheet) playlistSheet.hidden = true;
  }

  function openPlaylist() {
    if (state.selected.size === 0) return;
    state.playlistOpen = true;
    renderPlaylistSheet();
    if (playlistSheet) playlistSheet.hidden = false;
  }

  /** Derive Start practice buckets — Pick always on; Write/Listen from caps. */
  function practiceFromCaps() {
    const c = caps();
    const numbersModes = ["build"];
    if (c.audio) numbersModes.push("listen");
    if (c.keyboard) numbersModes.push("convert");
    const nounsModalities = ["choose-article", "category-gender"];
    if (c.keyboard) nounsModalities.push("type-article");
    return {
      numbersModes,
      nounsFamilies: [],
      nounsModalities,
    };
  }

  function renderPlaylistSheet() {
    if (!playlistBody) return;
    const units = selectedUnits();
    if (!units.length) {
      playlistBody.innerHTML = `<li class="nc-playlist-empty">No units selected.</li>`;
      return;
    }
    playlistBody.innerHTML = units
      .map(
        (u) => `<li class="nc-playlist-row" data-playlist-id="${u.id}">
          <div class="nc-playlist-row-inner">
            <span class="nc-playlist-title">${u.title}</span>
            <span class="nc-playlist-meta">${u.territory || ""}</span>
          </div>
          <span class="nc-playlist-remove" aria-hidden="true">Remove</span>
        </li>`
      )
      .join("");

    playlistBody.querySelectorAll(".nc-playlist-row").forEach((row) => {
      wirePlaylistSwipe(row);
    });
  }

  function wirePlaylistSwipe(row) {
    const inner = row.querySelector(".nc-playlist-row-inner");
    if (!inner) return;
    let startX = 0;
    let dx = 0;
    let tracking = false;

    const reset = () => {
      inner.style.transform = "";
      row.classList.remove("is-swiping");
      dx = 0;
      tracking = false;
    };

    row.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      tracking = true;
      startX = e.clientX;
      dx = 0;
      row.classList.add("is-swiping");
      try {
        row.setPointerCapture(e.pointerId);
      } catch (_) {}
    });

    row.addEventListener("pointermove", (e) => {
      if (!tracking) return;
      dx = e.clientX - startX;
      if (dx > 0) dx = 0;
      inner.style.transform = `translateX(${Math.max(dx, -120)}px)`;
    });

    row.addEventListener("pointerup", () => {
      if (!tracking) return;
      const id = row.dataset.playlistId;
      if (dx < -72 && id) {
        state.selected.delete(id);
        renderNav();
        if (state.selected.size === 0) closePlaylist();
        else renderPlaylistSheet();
        return;
      }
      reset();
    });

    row.addEventListener("pointercancel", reset);
  }

  function updateStartMeta() {
    if (!countEl) return;
    countEl.textContent = String(eligibleUnits().length);
  }

  function getAllUnitIds(node) {
    if (node.type === "unit") return node.playable === false ? [] : [node.id];
    if (!node.children) return [];
    return node.children.flatMap(getAllUnitIds);
  }

  function getNodeSelectionState(node) {
    const ids = getAllUnitIds(node);
    if (ids.length === 0) return "none";
    let n = 0;
    for (const id of ids) if (state.selected.has(id)) n += 1;
    if (n === 0) return "none";
    if (n === ids.length) return "all";
    return "some";
  }

  function showToast(message) {
    if (!toastEl) return;
    toastEl.hidden = false;
    toastEl.textContent = message;
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => {
      toastEl.hidden = true;
    }, 3200);
  }

  function renderCrumbs() {
    if (!crumbsEl) return;
    if (state.navStack.length === 0) {
      crumbsEl.setAttribute("hidden", "");
      crumbsEl.innerHTML = "";
      return;
    }
    const parent = state.navStack[state.navStack.length - 1];
    const sel = getNodeSelectionState(parent);
    let badge = "";
    if (sel === "all") badge = CHECK_SVG;
    else if (sel === "some") badge = `<span class="nc-mini-dot"></span>`;

    crumbsEl.removeAttribute("hidden");
    crumbsEl.innerHTML = `
      <div class="nc-mini is-${sel}" role="button" tabindex="0" title="Back to ${parent.title}" data-go-up>
        <div class="nc-mini-badge">${badge}</div>
        <p class="nc-mini-title">${parent.title}</p>
      </div>
    `;
    const mini = crumbsEl.querySelector("[data-go-up]");
    const goUp = () => navigateToLevel(state.navStack.length - 2);
    mini?.addEventListener("click", goUp);
    mini?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goUp();
      }
    });
  }

  function createCard(item) {
    const sel = getNodeSelectionState(item);
    const isUnit = item.type === "unit";
    const unplayable = isUnit && item.playable === false;

    const card = document.createElement("article");
    card.className = `nc-card is-${sel}${unplayable ? " is-soon" : ""}`;
    card.setAttribute("role", "button");
    card.setAttribute("aria-pressed", String(sel === "all"));
    card.tabIndex = unplayable ? -1 : 0;

    let badge = "";
    if (sel === "all") badge = CHECK_SVG;
    else if (sel === "some") badge = `<span class="nc-card-dot"></span>`;

    // Non-unit cards get an explicit Explore button (drill-down); units show a
    // status hint. The card body itself is a selection toggle in every case.
    const footer = !isUnit
      ? `<button type="button" class="nc-card-explore" data-explore aria-label="Explore ${item.title}"><span>Explore</span>${ARROW_SVG}</button>`
      : unplayable
        ? `<div class="nc-card-hint">Soon</div>`
        : `<div class="nc-card-hint" aria-hidden="true">&nbsp;</div>`;

    card.innerHTML = `
      <div class="nc-card-badge">${badge}</div>
      <div class="nc-card-main">
        <h3 class="nc-card-title">${item.title}</h3>
        ${footer}
      </div>
    `;

    if (unplayable) return card;

    const exploreBtn = card.querySelector("[data-explore]");
    if (exploreBtn) {
      // Keep the drill-down action isolated from the card's toggle handlers.
      exploreBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
      exploreBtn.addEventListener("pointerup", (e) => e.stopPropagation());
      exploreBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        drillDown(item);
      });
      exploreBtn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") e.stopPropagation();
      });
    }

    let startX = 0;
    let startY = 0;

    const reset = () => {
      card.style.transform = "";
    };

    card.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      if (e.target.closest("[data-explore]")) return;
      startX = e.clientX;
      startY = e.clientY;
      card.style.transform = "scale(0.97)";
      try {
        card.setPointerCapture(e.pointerId);
      } catch (_) {}
    });

    card.addEventListener("pointerup", (e) => {
      reset();
      if (e.target.closest("[data-explore]")) return;
      if (
        Math.abs(e.clientX - startX) < MOVE_PX &&
        Math.abs(e.clientY - startY) < MOVE_PX
      ) {
        toggleNodeSelection(item);
      }
    });

    card.addEventListener("pointercancel", reset);
    card.addEventListener("pointerleave", reset);
    card.addEventListener("keydown", (e) => {
      if (e.target.closest("[data-explore]")) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleNodeSelection(item);
      } else if (
        (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "o") &&
        !isUnit
      ) {
        e.preventDefault();
        drillDown(item);
      }
    });

    return card;
  }

  function toggleNodeSelection(node) {
    const ids = getAllUnitIds(node);
    if (!ids.length) return;
    const sel = getNodeSelectionState(node);
    if (sel === "all") ids.forEach((id) => state.selected.delete(id));
    else ids.forEach((id) => state.selected.add(id));
    renderNav();
  }

  function drillDown(node) {
    if (node.type === "unit") return;
    state.navStack.push(node);
    if (carouselEl) carouselEl.scrollLeft = 0;
    renderNav();
  }

  function navigateToLevel(index) {
    if (index < 0) state.navStack = [];
    else state.navStack = state.navStack.slice(0, index + 1);
    if (carouselEl) carouselEl.scrollLeft = 0;
    renderNav();
  }

  function renderNav() {
    let list = tree;
    if (state.navStack.length > 0) {
      list = state.navStack[state.navStack.length - 1].children || [];
    }
    renderCrumbs();
    if (carouselEl) {
      carouselEl.innerHTML = "";
      for (const item of list) carouselEl.appendChild(createCard(item));
    }
    const n = eligibleUnits().length;
    if (startBtn) startBtn.disabled = n === 0;
    updateStartMeta();
    if (capsGroup) capsGroup.hidden = state.mode !== "play";
    if (keyBtn) {
      keyBtn.setAttribute("aria-pressed", String(state.keyboard));
      keyBtn.classList.toggle("is-off", !state.keyboard);
    }
    if (audioBtn) {
      audioBtn.setAttribute("aria-pressed", String(state.audio));
      audioBtn.classList.toggle("is-off", !state.audio);
    }
  }

  function enterMode(mode) {
    state.mode = mode;
    state.navStack = [];
    closePlaylist();
    s1?.classList.add("is-leaving");
    if (s2) {
      s2.hidden = false;
      void s2.offsetWidth;
      s2.classList.add("is-active");
    }
    renderNav();
  }

  function resetToMode() {
    state.mode = null;
    state.navStack = [];
    closePlaylist();
    s2?.classList.remove("is-active");
    s1?.classList.remove("is-leaving");
    s1?.classList.add("is-active");
    if (s2) s2.hidden = true;
    if (s1) s1.hidden = false;
    renderNav();
  }

  function startSeries() {
    if (!state.mode) return;
    const units = eligibleUnits();
    if (units.length === 0) return;
    const practice = practiceFromCaps();

    const payload = {
      mode: state.mode,
      units,
      keyboard: state.keyboard,
      audio: state.audio,
      practice,
    };

    closePlaylist();

    if (onStart) {
      onStart(payload);
      return;
    }

    const capsLabel = [
      state.keyboard ? "write" : null,
      state.audio ? "listen" : null,
    ]
      .filter(Boolean)
      .join("+") || "pick";
    showToast(
      `${state.mode === "learn" ? "Learn" : "Play"} · ${units.length} unit${
        units.length === 1 ? "" : "s"
      } · ${capsLabel}`
    );
    console.info("[nav-carousel] start", payload);
  }

  function wireStartButton() {
    if (!startBtn) return;
    let timer = 0;
    let startX = 0;
    let startY = 0;
    let isLongPress = false;

    const clearTimer = () => {
      window.clearTimeout(timer);
    };

    startBtn.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || startBtn.disabled) return;
      isLongPress = false;
      startX = e.clientX;
      startY = e.clientY;
      try {
        startBtn.setPointerCapture(e.pointerId);
      } catch (_) {}
      timer = window.setTimeout(() => {
        isLongPress = true;
        if (navigator.vibrate) navigator.vibrate(40);
        openPlaylist();
      }, LONG_MS);
    });

    startBtn.addEventListener("pointermove", (e) => {
      if (
        Math.abs(e.clientX - startX) > MOVE_PX ||
        Math.abs(e.clientY - startY) > MOVE_PX
      ) {
        clearTimer();
      }
    });

    startBtn.addEventListener("pointerup", (e) => {
      clearTimer();
      if (startBtn.disabled) return;
      if (
        !isLongPress &&
        Math.abs(e.clientX - startX) < MOVE_PX &&
        Math.abs(e.clientY - startY) < MOVE_PX
      ) {
        startSeries();
      }
    });

    startBtn.addEventListener("pointercancel", clearTimer);
    startBtn.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  root.querySelectorAll("[data-enter]").forEach((btn) => {
    btn.addEventListener("click", () => enterMode(btn.dataset.enter));
  });
  root.querySelector("[data-guided]")?.addEventListener("click", () => {
    if (onStart) {
      onStart({ guided: true });
    } else {
      showToast("Guided start — Dealer picks your next rep.");
    }
  });
  keyBtn?.addEventListener("click", () => toggleCap("keyboard"));
  audioBtn?.addEventListener("click", () => toggleCap("audio"));
  playlistSheet?.querySelectorAll("[data-nc-playlist-close]").forEach((el) => {
    el.addEventListener("click", () => {
      closePlaylist();
      updateStartMeta();
    });
  });
  wireStartButton();

  renderNav();

  return {
    resetToMode,
    showToast,
    getState: () => ({
      mode: state.mode,
      selected: [...state.selected],
      keyboard: state.keyboard,
      audio: state.audio,
    }),
  };
}

// Standalone page boot
if (typeof document !== "undefined") {
  const standalone = document.querySelector("[data-nc-standalone]");
  if (standalone) mountNavCarousel(standalone, { embedded: false });
}
