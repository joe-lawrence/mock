/**
 * Vocabulary Learn + Practice UI (topic-level).
 * Practice chrome mirrors Numbers/Nouns: choice-grid / gendered piece tray,
 * answer reveal, icon actions-nav. Back / Forward step the shared quiz trail.
 */

import {
  vocabularyForTopic,
  vocabularyForScope,
  vocabularyLearnOrder,
  vocabAreaForCurriculumTopic,
  getVocabulary,
  VOCABULARY_VERSION,
} from "./generated/vocabulary.js?v=20261030-casetakes";
import {
  createVocabularyQuestion,
  displayForm,
  evaluateVocabularyAnswer,
  caseRequirementText,
  factsForItem,
  pickQuestionType,
  questionTypesForItem,
  revealDeHtml,
} from "./vocabulary-practice.js?v=20261030-composeex";
import { choiceSecondChanceOpen } from "./answer-shells.js?v=20261027-retry";
import { flaggedCueHtml } from "./lang-flags.js?v=20261030-langflag";

/** Bootstrap Icons (outline) — same set as mock.js session chrome. */
const BI_PATHS = {
  chevronLeft:
    '<path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>',
  chevronRight:
    '<path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>',
  book: '<path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>',
  speedometer:
    '<path d="M8 2a.5.5 0 0 1 .5.5V4a.5.5 0 0 1-1 0V2.5A.5.5 0 0 1 8 2M3.732 3.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707M2 8a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 8m9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5m.754-4.246a.39.39 0 0 0-.527-.02L7.547 7.31A.91.91 0 1 0 8.85 8.569l3.434-4.297a.39.39 0 0 0-.029-.518z"/><path fill-rule="evenodd" d="M6.664 15.889A8 8 0 1 1 9.336.11a8 8 0 0 1-2.672 15.78zm-4.665-4.283A11.95 11.95 0 0 1 8 10c2.186 0 4.236.585 6.001 1.606a7 7 0 1 0-12.002 0"/>',
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

function actionsNavHtml({ refDisabled = false } = {}) {
  return `
    <div class="actions actions-nav" data-vocab-actions>
      <button type="button" class="btn btn-icon" data-vocab-back data-icon="chevronLeft" aria-label="Back" title="Back"></button>
      <div class="actions-mid">
        <div class="assist-stepper" data-vocab-assist-stepper hidden role="group" aria-label="Assistance">
          <button type="button" class="assist-stepper-btn" data-assist-dir="-1" data-icon="chevronLeft" aria-label="More help"></button>
          <span class="assist-stepper-label" data-assist-label>More help</span>
          <button type="button" class="assist-stepper-btn" data-assist-dir="1" data-icon="chevronRight" aria-label="Less help"></button>
        </div>
        <button type="button" class="btn btn-icon" data-vocab-ref data-icon="book" aria-label="Reference" title="Reference" ${
          refDisabled ? "disabled" : ""
        }></button>
        <button type="button" class="btn btn-icon" id="vocab-difficulty" data-vocab-difficulty data-icon="speedometer" aria-label="Assistance" title="Assistance"></button>
      </div>
      <button type="button" class="btn btn-icon" data-vocab-forward data-icon="chevronRight" aria-label="Forward" title="Forward — next in sequence, or skip at the end"></button>
    </div>`;
}

function vocabPromptHtml(q) {
  if (q?.type === "case") {
    const word = flaggedCueHtml("de", esc(q.promptText || ""));
    const label = esc(q.slotLabel || "Case");
    return `<span class="vocab-case-line">${word}<span class="vocab-case-takes">takes the</span><span class="slot" data-vocab-case-slot aria-label="${label}">${label}</span></span>`;
  }
  const text = esc(q?.prompt || "");
  if (q?.type === "meaning") return flaggedCueHtml("de", text);
  if (q?.type === "form") return flaggedCueHtml("en", text);
  const lang = q?.promptLang === "de" ? ' lang="de"' : "";
  return `<span${lang}>${text}</span>`;
}

function caseChoiceLabel(q, id) {
  const choice = (q?.choices || []).find((item) => String(item.id) === String(id));
  return choice?.label || "";
}

function paintVocabCaseSlot(root, label, kind) {
  const slot = root.querySelector("[data-vocab-case-slot]");
  if (!slot) return;
  slot.classList.remove(
    "is-filled",
    "is-hot",
    "is-ok",
    "is-bad",
    "is-correct-flash",
    "is-wrong-flash"
  );
  if (!label) {
    slot.textContent = "Case";
    slot.setAttribute("aria-label", "Case");
    return;
  }
  slot.textContent = label;
  slot.classList.add("is-filled");
  if (kind === "ok") slot.classList.add("is-ok", "is-correct-flash");
  if (kind === "bad") slot.classList.add("is-bad", "is-wrong-flash");
  slot.setAttribute("aria-label", label);
}

function choiceIsAccepted(q, id) {
  const accept = q?.accept?.length ? q.accept : [q?.expect];
  return accept.some((value) => String(value) === String(id));
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
  const introducedBy =
    Array.isArray(opts.introducedBy) && opts.introducedBy.length
      ? opts.introducedBy
      : null;

  const resolveItems = () => {
    const decks = Array.isArray(opts.decks) ? opts.decks.filter(Boolean) : [];
    if (decks.length) {
      const all = [];
      const seen = new Set();
      for (const deck of decks) {
        /** @type {{ areas?: string[], introducedBy?: string[] }} */
        const scope = {};
        if (Array.isArray(deck.vocabAreas) && deck.vocabAreas.length) {
          scope.areas = deck.vocabAreas;
        }
        const introduced = Array.isArray(deck.vocabIntroducedBy)
          ? deck.vocabIntroducedBy
          : deck.vocabIntroducedBy
            ? [deck.vocabIntroducedBy]
            : [];
        if (introduced.length) scope.introducedBy = introduced;
        const deckTopic = deck.vocabTopic || deck.territory || topic;
        for (const item of vocabularyForScope(deckTopic, scope)) {
          if (!item?.id || seen.has(item.id)) continue;
          seen.add(item.id);
          all.push(item);
        }
      }
      if (opts.mode === "learn") return vocabularyLearnOrder(all);
      return shuffle(all);
    }
    /** @type {{ areas?: string[], introducedBy?: string[] }} */
    const scope = {};
    if (activeAreas?.length) scope.areas = activeAreas;
    if (introducedBy?.length) scope.introducedBy = introducedBy;
    const list = vocabularyForScope(topic, scope);
    if (opts.mode === "learn") return vocabularyLearnOrder(list);
    return shuffle([...list]);
  };

  const paint = (html) => {
    root.innerHTML = `${opts.seriesHtml || ""}${html}`;
    if (opts.seriesHtml) opts.onSeriesChrome?.(root);
  };

  let items = resolveItems();
  if (!items.length) {
    root.className = "vocab-panel stage stage-fill";
    paint(`<p class="vocab-empty">No vocabulary for this scope yet.</p>
      ${actionsNavHtml({ refDisabled: true })}`);
    hydrateIconButtons(root);
    root.querySelector("[data-vocab-back]")?.addEventListener("click", opts.onBack);
    root.querySelector("[data-vocab-forward]")?.addEventListener("click", opts.onBack);
    opts.wireAssist?.(root);
    return { destroy() {} };
  }

  const resume = opts.resume;
  const session = {
    mode: resume?.mode || opts.mode || "learn",
    index: resume?.index || 0,
    deck: resume?.deck?.length ? resume.deck.slice() : items,
    /** @type {{ question: object, revealed: boolean, result: object|null }[]} */
    history: (resume?.history || []).map((entry) => ({ ...entry })),
    cursor: resume?.cursor || 0,
    deckPos: resume?.deckPos || 0,
  };
  if (resume?.deck?.length) items = session.deck;

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
    if (opts.onBackNav) {
      opts.onBackNav();
      return;
    }
    if (session.mode === "learn") {
      if (session.index <= 0) return;
      session.index -= 1;
      render();
      return;
    }
    ensurePracticeHistory();
    if (session.cursor <= 0) return;
    session.cursor -= 1;
    render();
  };

  const goNext = () => {
    opts.stopSpeech?.();
    if (opts.onForward?.() === "history") return;
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
      paint(`<p class="vocab-empty">No vocabulary for this scope yet.</p>
          ${actionsNavHtml({ refDisabled: true })}`);
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
    paint(`
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
        ${
          facts.governs?.length
            ? `<li><strong>Takes</strong> the ${esc(caseRequirementText(facts.governs))}</li>`
            : ""
        }
        <li><strong>Practice types</strong> ${esc(types.join(", ") || "—")}</li>
      </ul>
      <p class="vocab-meta">${esc(item.id)} · ${esc(VOCABULARY_VERSION)}</p>
      ${actionsNavHtml({
        refDisabled: !item.reference?.[0],
      })}
    `);
    hydrateIconButtons(root);
    wireChrome(item);
    opts.onItemChange?.(item);
    publishNav();
  };

  const renderPractice = () => {
    ensurePracticeHistory();
    const entry = session.history[session.cursor];
    if (!entry) return;
    const q = entry.question;
    const item = getVocabulary(q.vocabId);

    root.className = "vocab-panel stage stage-fill";
    paint(`
      <p class="action-instruction">${esc(
        q.instruction || "Practice · Vocabulary"
      )}</p>
      <p class="prompt">${vocabPromptHtml(q)}</p>
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
      })}
    `);
    hydrateIconButtons(root);
    wireChrome(item);
    opts.onItemChange?.(item);
    publishNav();

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
      if (q.type === "case") {
        const shown =
          ok && result?.given
            ? caseChoiceLabel(q, result.given)
            : caseChoiceLabel(q, q.expect);
        paintVocabCaseSlot(root, shown, "ok");
      }
      revealDe.innerHTML = revealDeHtml(q);

      const spoken = q.revealDe || "";
      const sentenceParts =
        q.revealKaraoke === "sentence" && spoken
          ? opts.sentenceAnswerParts?.(spoken)
          : null;
      const rawParts =
        (sentenceParts && sentenceParts.length ? sentenceParts : null) ||
        (item && opts.answerPartsForItem?.(item)) ||
        (spoken ? [spoken] : []);
      const resolved = opts.resolvePronunciation
        ? opts.resolvePronunciation(rawParts)
        : { displayParts: [], pronunciationUnavailable: true };
      const phonNodes = [];
      if (revealPhon) {
        revealPhon.hidden = false;
        revealPhon.classList.toggle(
          "is-unavailable",
          !!resolved.pronunciationUnavailable
        );
        revealPhon.innerHTML = "";
        if (resolved.pronunciationUnavailable) {
          revealPhon.removeAttribute("lang");
          revealPhon.setAttribute("data-pronunciation", "unavailable");
          revealPhon.innerHTML =
            '<span class="phon-unavailable">Pronunciation guide unavailable</span>';
        } else {
          revealPhon.setAttribute("lang", "de");
          revealPhon.removeAttribute("data-pronunciation");
          (resolved.displayParts || []).forEach((p, i) => {
            if (i > 0) revealPhon.appendChild(document.createTextNode(" · "));
            const span = document.createElement("span");
            span.className = "phon-beat" + (p.stress ? " has-stress" : "");
            span.textContent = p.guide || "";
            revealPhon.appendChild(span);
            phonNodes.push(span);
          });
        }
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
        if (choiceIsAccepted(q, id)) btn.classList.add("is-ok");
        else if (!ok && id === result?.given) btn.classList.add("is-bad");
      });
      opts.stopSpeech?.();
      opts.playReveal?.(
        spoken,
        resolved.displayParts || [],
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
      if (q.type === "case") {
        const shown =
          ok && result?.given
            ? caseChoiceLabel(q, result.given)
            : caseChoiceLabel(q, q.expect);
        paintVocabCaseSlot(root, shown, ok ? "ok" : "bad");
      }
      root.querySelectorAll("[data-vocab-choice]").forEach((btn) => {
        btn.disabled = true;
        const id = btn.getAttribute("data-vocab-choice");
        if (choiceIsAccepted(q, id)) btn.classList.add("is-ok", "is-correct-flash");
        else if (!ok && id === result?.given) btn.classList.add("is-bad", "is-wrong-flash");
      });
      if (ok) opts.playFeedback?.("ok");
      else opts.playFeedback?.("bad");
      window.setTimeout(() => {
        showReveal(result, { autoAdvance: false });
      }, VOCAB_CORRECT_FLASH_MS);
    };

    if (entry.revealed && entry.result) showReveal(entry.result);

    root.querySelectorAll("[data-vocab-choice]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (entry.revealed || btn.disabled) return;
        const id = btn.getAttribute("data-vocab-choice");
        const result = evaluateVocabularyAnswer(q, id);
        if (q.type === "case") {
          paintVocabCaseSlot(
            root,
            caseChoiceLabel(q, id),
            result.status === "correct" ? "" : "bad"
          );
        }
        if (result.status === "correct") {
          finish(result);
          return;
        }
        btn.classList.add("is-bad");
        btn.disabled = true;
        const stillOpen = choiceSecondChanceOpen(
          root.querySelectorAll("[data-vocab-choice]"),
          btn
        );
        if (!stillOpen) {
          finish({ ...result, verdictLabel: "Answer" });
          return;
        }
        opts.playFeedback?.("retry");
        if (attempt) {
          attempt.hidden = false;
          attempt.textContent = "Try again";
          attempt.classList.remove("is-flash");
          void attempt.offsetWidth;
          attempt.classList.add("is-flash");
        }
      });
    });
  };

  function vocabNavSnapshot() {
    const learnItem =
      session.mode === "learn" && session.deck.length
        ? session.deck[session.index % session.deck.length]
        : null;
    const question =
      session.mode === "practice"
        ? session.history[session.cursor]?.question
        : null;
    const territory = topic === "nouns" ? "nouns" : "numbers";
    return {
      key:
        session.mode === "learn"
          ? `learn:${session.index}:${learnItem?.id || ""}`
          : `practice:${question?.id || session.cursor}`,
      mode: session.mode,
      index: session.index,
      cursor: session.cursor,
      deckPos: session.deckPos,
      deck: session.deck.slice(),
      history: session.history.map((entry) => ({ ...entry })),
      areas: opts.areas || null,
      territory,
    };
  }

  function publishNav() {
    opts.onShown?.(vocabNavSnapshot());
    const back = root.querySelector("[data-vocab-back]");
    if (back) back.disabled = opts.backDisabled?.() ?? false;
  }

  if (root.dataset.swipeBound !== "1") {
    root.dataset.swipeBound = "1";
    let x0 = 0;
    let y0 = 0;
    let active = false;
    root.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "touch") return;
      if (e.target.closest("button, input, textarea, select, a, .piece, .choice")) return;
      active = true;
      x0 = e.clientX;
      y0 = e.clientY;
    });
    const end = (e) => {
      if (!active) return;
      active = false;
      if (e.pointerType && e.pointerType !== "touch") return;
      const dx = e.clientX - x0;
      const dy = e.clientY - y0;
      if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.15) return;
      if (dx < 0) root.querySelector("[data-vocab-forward]")?.click();
      else root.querySelector("[data-vocab-back]")?.click();
    };
    root.addEventListener("pointerup", end);
    root.addEventListener("pointercancel", () => {
      active = false;
    });
  }

  function wireChrome(item) {
    root.querySelector("[data-vocab-back]")?.addEventListener("click", goPrev);
    root.querySelector("[data-vocab-forward]")?.addEventListener("click", goNext);
    root.querySelector("[data-vocab-ref]")?.addEventListener("click", () => {
      const rid = item?.reference?.[0] || null;
      opts.openReference(rid, topic);
    });
    opts.wireAssist?.(root);
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
