/**
 * Vocabulary Learn + Practice UI (topic-level).
 * Practice chrome mirrors Numbers/Nouns: choice-grid / gendered piece tray,
 * answer reveal, icon actions-nav. Back / Next step the sequence.
 */

import {
  vocabularyForTopic,
  vocabularyForScope,
  vocabularyLearnOrder,
  vocabAreaForCurriculumTopic,
  getVocabulary,
  VOCABULARY_VERSION,
} from "./generated/vocabulary.js?v=20260930-vocab17";
import {
  createVocabularyQuestion,
  displayForm,
  evaluateVocabularyAnswer,
  factsForItem,
  pickQuestionType,
  questionTypesForItem,
  revealDeHtml,
} from "./vocabulary-practice.js";

/** Bootstrap Icons (outline) — same set as mock.js session chrome. */
const BI_PATHS = {
  chevronLeft:
    '<path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>',
  chevronRight:
    '<path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>',
  book: '<path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>',
};

function biIcon(name) {
  const path = BI_PATHS[name];
  if (!path) return "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">${path}</svg>`;
}

function hydrateIconButtons(root) {
  root.querySelectorAll("[data-icon]").forEach((btn) => {
    const name = btn.dataset.icon;
    if (!BI_PATHS[name]) return;
    btn.classList.add("btn-icon");
    btn.innerHTML = biIcon(name);
  });
}

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function genderPieceClass(genderOrArticle) {
  const g = String(genderOrArticle || "").toLowerCase();
  if (g === "masculine" || g === "der") return "g-masc";
  if (g === "feminine" || g === "die") return "g-fem";
  if (g === "neuter" || g === "das") return "g-neut";
  return "";
}

function actionsNavHtml({ refDisabled = false, forwardLabel = "Next" } = {}) {
  return `
    <div class="actions actions-nav" data-vocab-actions>
      <button type="button" class="btn btn-icon" data-vocab-back data-icon="chevronLeft" aria-label="Previous" title="Previous"></button>
      <div class="actions-mid">
        <button type="button" class="btn btn-icon" data-vocab-ref data-icon="book" aria-label="Reference" title="Reference" ${
          refDisabled ? "disabled" : ""
        }></button>
      </div>
      <button type="button" class="btn btn-icon" data-vocab-forward data-icon="chevronRight" aria-label="${esc(
        forwardLabel
      )}" title="${esc(forwardLabel)}"></button>
    </div>`;
}

function choicesHtml(q) {
  const choices = q.choices || [];
  if (q.choiceKind === "articles") {
    return `<div class="tray" data-vocab-entry role="group" aria-label="Choices">
      ${choices
        .map((c) => {
          const id = c.id;
          const label = c.label || id;
          const gClass = genderPieceClass(c.gender || id);
          const sub = c.sub
            ? `<span class="piece-sub">${esc(c.sub)}</span>`
            : "";
          return `<button type="button" class="piece ${gClass}" data-vocab-choice="${esc(
            id
          )}" aria-label="${esc(c.sub ? `${label}, ${c.sub}` : label)}">${esc(
            label
          )}${sub}</button>`;
        })
        .join("")}
    </div>`;
  }

  const labels = choices.map((c) =>
    typeof c === "string" ? c : String(c.label || c.id || "")
  );
  const stacked = labels.some((t) => t.length >= 16 || /\s/.test(t));
  return `<div class="choice-grid${stacked ? " is-stacked" : ""}" data-vocab-entry role="group" aria-label="Choices">
    ${choices
      .map((c) => {
        const id = typeof c === "string" ? c : c.id;
        const label = typeof c === "string" ? c : c.label;
        const sub =
          typeof c === "object" && c.sub
            ? `<span class="choice-sub">${esc(c.sub)}</span>`
            : "";
        return `<button type="button" class="choice" data-vocab-choice="${esc(
          id
        )}">${esc(label)}${sub}</button>`;
      })
      .join("")}
  </div>`;
}

/**
 * @param {HTMLElement} root
 * @param {{
 *   topic: "numbers"|"nouns",
 *   mode: "learn"|"practice",
 *   areas?: string[]|null,
 *   onBack: () => void,
 *   openReference: (id: string|null, territory: string) => void,
 *   answerPartsForItem?: (item: object) => { text: string, guide?: string, stress?: boolean }[],
 *   playFeedback?: (kind: "ok"|"bad"|"retry") => void,
 *   playReveal?: (
 *     spoken: string,
 *     parts: object[],
 *     nodes: HTMLElement[],
 *     onDone?: () => void
 *   ) => void,
 *   stopSpeech?: () => void,
 * }} opts
 */
export function mountVocabularyPanel(root, opts) {
  const topic = opts.topic;
  /** @type {string[]|null} null = all areas — scope comes from session Custom mix */
  const activeAreas =
    Array.isArray(opts.areas) && opts.areas.length ? [...opts.areas] : null;

  const resolveItems = () => {
    const scope = activeAreas?.length ? { areas: activeAreas } : {};
    const list = vocabularyForScope(topic, scope);
    if (opts.mode === "learn") return vocabularyLearnOrder(list);
    return shuffle([...list]);
  };

  let items = resolveItems();
  if (!items.length) {
    root.className = "vocab-panel stage stage-fill";
    root.innerHTML = `<p class="vocab-empty">No vocabulary for this scope yet.</p>
      ${actionsNavHtml({ refDisabled: true, forwardLabel: "Next" })}`;
    hydrateIconButtons(root);
    root.querySelector("[data-vocab-back]")?.addEventListener("click", opts.onBack);
    root.querySelector("[data-vocab-forward]")?.addEventListener("click", opts.onBack);
    return { destroy() {} };
  }

  const session = {
    mode: opts.mode || "learn",
    index: 0,
    deck: items,
    /** @type {{ question: object, revealed: boolean, result: object|null }[]} */
    history: [],
    cursor: 0,
    deckPos: 0,
  };

  const resetDeck = () => {
    items = resolveItems();
    session.deck = items;
    session.index = 0;
    session.history = [];
    session.cursor = 0;
    session.deckPos = 0;
  };

  const makeQuestion = () => {
    if (!session.deck.length) return null;
    const item = session.deck[session.deckPos % session.deck.length];
    session.deckPos += 1;
    const type = pickQuestionType(item, { topic, peers: items });
    return createVocabularyQuestion(item, type, { topic, peers: items });
  };

  const ensurePracticeHistory = () => {
    if (session.history.length) return;
    const q = makeQuestion();
    if (!q) return;
    session.history.push({ question: q, revealed: false, result: null });
    session.cursor = 0;
  };

  const goPrev = () => {
    opts.stopSpeech?.();
    if (session.mode === "learn") {
      if (session.index <= 0) {
        opts.onBack();
        return;
      }
      session.index -= 1;
      render();
      return;
    }
    ensurePracticeHistory();
    if (session.cursor <= 0) {
      opts.onBack();
      return;
    }
    session.cursor -= 1;
    render();
  };

  const goNext = () => {
    opts.stopSpeech?.();
    if (session.mode === "learn") {
      if (!session.deck.length) return;
      session.index += 1;
      render();
      return;
    }
    ensurePracticeHistory();
    if (session.cursor < session.history.length - 1) {
      session.cursor += 1;
      render();
      return;
    }
    const q = makeQuestion();
    if (!q) return;
    session.history.push({ question: q, revealed: false, result: null });
    session.cursor = session.history.length - 1;
    render();
  };


  const render = () => {
    root.classList.remove("is-answer");
    if (!session.deck.length) {
      root.className = "vocab-panel stage stage-fill";
      root.innerHTML = `<p class="vocab-empty">No vocabulary for this scope yet.</p>
          ${actionsNavHtml({ refDisabled: true, forwardLabel: "Next" })}`;
      hydrateIconButtons(root);
        root.querySelector("[data-vocab-back]")?.addEventListener("click", opts.onBack);
      root.querySelector("[data-vocab-forward]")?.addEventListener("click", opts.onBack);
      return;
    }
    if (session.mode === "learn") renderLearn();
    else renderPractice();
  };

  const renderLearn = () => {
    const item = session.deck[session.index % session.deck.length];
    const facts = factsForItem(item);
    const types = questionTypesForItem(item, { topic, peers: items });
    const areaLabel = item.area || "";
    root.className = "vocab-panel stage stage-fill";
    root.innerHTML = `
      <p class="action-instruction">Learn · Vocabulary${
        areaLabel ? ` · ${esc(areaLabel)}` : ""
      } · ${(session.index % session.deck.length) + 1} / ${session.deck.length}</p>
      <p class="prompt" lang="de">${esc(displayForm(item))}</p>
      <p class="help-line">${esc(facts.gloss || "")}${
        facts.sense ? ` · ${esc(facts.sense)}` : ""
      }</p>
      <ul class="vocab-facts">
        ${facts.article ? `<li><strong>Article</strong> ${esc(facts.article)}</li>` : ""}
        ${facts.gender ? `<li><strong>Gender</strong> ${esc(facts.gender)}</li>` : ""}
        ${facts.plural ? `<li><strong>Plural</strong> ${esc(facts.plural)}</li>` : ""}
        ${facts.type ? `<li><strong>Type</strong> ${esc(facts.type)}</li>` : ""}
        <li><strong>Practice types</strong> ${esc(types.join(", ") || "—")}</li>
      </ul>
      <p class="vocab-meta">${esc(item.id)} · ${esc(VOCABULARY_VERSION)}</p>
      ${actionsNavHtml({
        refDisabled: !item.reference?.[0],
        forwardLabel: "Next",
      })}
    `;
    hydrateIconButtons(root);
    wireChrome(item);
    opts.onItemChange?.(item);
  };

  const renderPractice = () => {
    ensurePracticeHistory();
    const entry = session.history[session.cursor];
    if (!entry) return;
    const q = entry.question;
    const item = getVocabulary(q.vocabId);

    root.className = "vocab-panel stage stage-fill";
    root.innerHTML = `
      <p class="action-instruction">${esc(
        q.instruction || "Practice · Vocabulary"
      )}</p>
      <p class="prompt" ${q.promptLang === "de" ? 'lang="de"' : ""}>${esc(
        q.prompt
      )}</p>
      ${choicesHtml(q)}
      <p class="attempt-feedback" data-vocab-attempt hidden aria-live="polite"></p>
      <div class="answer-reveal" data-vocab-reveal hidden>
        <p class="verdict" data-vocab-verdict aria-live="polite"></p>
        <div class="answer-reveal-box">
          <p class="answer-reveal-de" data-vocab-reveal-de lang="de"></p>
          <p class="answer-reveal-phonetic" data-vocab-reveal-phonetic aria-live="polite"></p>
        </div>
        <p class="answer-reveal-en" data-vocab-reveal-en hidden></p>
      </div>
      ${actionsNavHtml({
        refDisabled: !item?.reference?.[0],
        forwardLabel: "Next",
      })}
    `;
    hydrateIconButtons(root);
    wireChrome(item);
    opts.onItemChange?.(item);

    const attempt = root.querySelector("[data-vocab-attempt]");
    const reveal = root.querySelector("[data-vocab-reveal]");
    const verdict = root.querySelector("[data-vocab-verdict]");
    const revealDe = root.querySelector("[data-vocab-reveal-de]");
    const revealPhon = root.querySelector("[data-vocab-reveal-phonetic]");
    const revealEn = root.querySelector("[data-vocab-reveal-en]");

    const showReveal = (result, { autoAdvance = false } = {}) => {
      const ok = result?.status === "correct";
      const revealCursor = session.cursor;
      root.classList.add("is-answer");
      reveal.hidden = false;
      reveal.classList.remove("is-ok", "is-bad");
      void reveal.offsetWidth;
      reveal.classList.toggle("is-ok", ok);
      reveal.classList.toggle("is-bad", !ok);
      verdict.classList.remove("is-ok", "is-bad");
      verdict.classList.add(ok ? "is-ok" : "is-bad");
      verdict.textContent =
        result?.verdictLabel || (ok ? "Correct" : "Answer");
      revealDe.innerHTML = revealDeHtml(q);

      const parts =
        (item && opts.answerPartsForItem?.(item)) ||
        [{ text: q.revealDe, guide: q.revealDe, stress: true }];
      const spoken = q.revealDe || "";
      const phonNodes = [];
      if (revealPhon) {
        revealPhon.hidden = false;
        revealPhon.removeAttribute("aria-hidden");
        revealPhon.innerHTML = "";
        revealPhon.setAttribute("lang", "de");
        parts.forEach((p, i) => {
          if (i > 0) revealPhon.appendChild(document.createTextNode(" · "));
          const span = document.createElement("span");
          span.className = "phon-beat" + (p.stress ? " has-stress" : "");
          span.textContent = p.guide || p.text || "";
          revealPhon.appendChild(span);
          phonNodes.push(span);
        });
      }
      if (q.revealEn) {
        revealEn.hidden = false;
        revealEn.textContent = q.revealEn;
      } else {
        revealEn.hidden = true;
        revealEn.textContent = "";
      }
      root.querySelectorAll("[data-vocab-choice]").forEach((btn) => {
        btn.disabled = true;
        const id = btn.getAttribute("data-vocab-choice");
        if (id === q.expect) btn.classList.add("is-ok");
        else if (!ok && id === result?.given) btn.classList.add("is-bad");
      });
      opts.stopSpeech?.();
      opts.playReveal?.(
        spoken,
        parts,
        phonNodes,
        autoAdvance
          ? () => {
              if (session.mode !== "practice") return;
              if (session.cursor !== revealCursor) return;
              goNext();
            }
          : undefined
      );
    };

    const VOCAB_CORRECT_FLASH_MS = 1150;

    const finish = (result) => {
      if (entry.revealed) return;
      entry.revealed = true;
      entry.result = result;
      if (attempt) {
        attempt.hidden = true;
        attempt.textContent = "";
      }
      const ok = result?.status === "correct";
      root.querySelectorAll("[data-vocab-choice]").forEach((btn) => {
        btn.disabled = true;
        const id = btn.getAttribute("data-vocab-choice");
        if (id === q.expect) btn.classList.add("is-ok", "is-correct-flash");
        else if (!ok && id === result?.given) btn.classList.add("is-bad", "is-wrong-flash");
      });
      if (ok) opts.playFeedback?.("ok");
      else opts.playFeedback?.("bad");
      window.setTimeout(() => {
        showReveal(result, { autoAdvance: true });
      }, VOCAB_CORRECT_FLASH_MS);
    };

    if (entry.revealed && entry.result) showReveal(entry.result);

    root.querySelectorAll("[data-vocab-choice]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (entry.revealed || btn.disabled) return;
        const id = btn.getAttribute("data-vocab-choice");
        const result = evaluateVocabularyAnswer(q, id);
        if (result.status === "correct") {
          finish(result);
          return;
        }
        btn.classList.add("is-bad");
        btn.disabled = true;
        opts.playFeedback?.("retry");
        if (attempt) {
          attempt.hidden = false;
          attempt.textContent = "Try again";
          attempt.classList.remove("is-flash");
          void attempt.offsetWidth;
          attempt.classList.add("is-flash");
        }
        const remaining = [
          ...root.querySelectorAll("[data-vocab-choice]:not(:disabled)"),
        ];
        if (!remaining.length) finish({ ...result, verdictLabel: "Answer" });
      });
    });
  };

  function wireChrome(item) {
    root.querySelector("[data-vocab-back]")?.addEventListener("click", goPrev);
    root.querySelector("[data-vocab-forward]")?.addEventListener("click", goNext);
    root.querySelector("[data-vocab-ref]")?.addEventListener("click", () => {
      const rid = item?.reference?.[0] || null;
      opts.openReference(rid, topic);
    });
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  render();
  return {
    destroy() {
      opts.stopSpeech?.();
      root.classList.remove("is-answer");
      root.innerHTML = "";
    },
    getCurrentItem() {
      if (session.mode === "learn") {
        if (!session.deck.length) return null;
        return session.deck[session.index % session.deck.length];
      }
      const entry = session.history[session.cursor];
      if (!entry?.question?.vocabId) return null;
      return getVocabulary(entry.question.vocabId);
    },
  };
}


export function topicHasVocabulary(topic) {
  return vocabularyForTopic(topic).length > 0;
}

/** Areas for a Numbers curriculum topic selection (carousel / hub). */
export function vocabAreasFromCurriculumTopics(topicIds) {
  const areas = [];
  for (const id of topicIds || []) {
    const area = vocabAreaForCurriculumTopic(id);
    if (area && !areas.includes(area)) areas.push(area);
  }
  return areas;
}
