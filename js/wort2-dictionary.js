/**
 * German dictionary citation lines for WortMatch reference cards.
 *
 * Full form examples:
 *   Zeitung, die; -, -en
 *   sehen <V. mit Akk.>
 *   mit <Präp. mit Dat.>
 *
 * Sorting (non-learning): bare lemma only — no gender / case / plural spoilers.
 */

/** @param {string|null|undefined} trait */
export function caseLong(trait) {
  if (trait === 'Akk') return 'Akk.';
  if (trait === 'Dat') return 'Dat.';
  return null;
}

/** Nominative gender article for a noun item. */
export function nounGenderArticle(wordObj) {
  if (!wordObj || wordObj.pos !== 'noun') return null;
  if (['der', 'die', 'das'].includes(wordObj.trait)) return wordObj.trait;
  return wordObj.genderArticle || null;
}

function genderLabel(art) {
  if (art === 'der') return 'masculine';
  if (art === 'die') return 'feminine';
  if (art === 'das') return 'neuter';
  return null;
}

/** Conventional genitive-singular shorthand when we lack a lexical form. */
export function genitiveEndingCitation(art) {
  if (art === 'die') return '-';
  if (art === 'der' || art === 'das') return '-[e]s';
  return null;
}

/** Nominative plural ending shorthand from lexicon ending (+ optional umlaut mark). */
export function pluralEndingCitation(wordObj) {
  const ending = wordObj?.pluralEnding;
  if (ending == null || ending === '') return null;
  if (ending === '—' || ending === '-') return '-';
  const umlaut = wordObj.hasUmlaut ? '¨' : '';
  return `${umlaut}-${ending}`;
}

/**
 * Which grammar bits may appear without spoiling the active sort.
 * @returns {{ article: boolean, plural: boolean, caseGov: boolean }}
 */
export function dictionaryRevealFlags(wordObj, { full = false, revealAnswer = false } = {}) {
  if (!full && !revealAnswer) {
    return { article: false, plural: false, caseGov: false };
  }
  // After Check / explicit answer mode: full citation.
  if (revealAnswer) {
    return { article: true, plural: true, caseGov: true };
  }
  // Learning while still sorting — hide whatever that mode is testing.
  // Nouns: bare lemma only (gender is the answer; partial "Zeitung; -en" is odd).
  const domain = wordObj?.domain;
  if (domain === 'nouns' || domain === 'case') {
    return { article: false, plural: false, caseGov: false };
  }
  if (domain === 'plurals') {
    return { article: true, plural: false, caseGov: false };
  }
  return { article: true, plural: true, caseGov: true };
}

/**
 * Build the dictionary citation string (lemma line only).
 */
export function formatDictionaryCitation(wordObj, flags = {}) {
  const lemma = (wordObj && wordObj.word) || '';
  if (!lemma) return '';

  const { article = false, plural = false, caseGov = false } = flags;
  const pos = wordObj.pos || '';

  if (pos === 'noun') {
    const art = article ? nounGenderArticle(wordObj) : null;
    const gen = art ? genitiveEndingCitation(art) : null;
    const pl = plural ? pluralEndingCitation(wordObj) : null;
    if (!art && !gen && !pl) return lemma;
    if (art && (gen || pl)) {
      const endings = [gen, pl].filter(Boolean).join(', ');
      return `${lemma}, ${art}; ${endings}`;
    }
    if (art) return `${lemma}, ${art}`;
    if (pl) return `${lemma}; ${pl}`;
    return lemma;
  }

  if (pos === 'prep') {
    const cas = caseGov ? caseLong(wordObj.trait) : null;
    if (cas) return `${lemma} <Präp. mit ${cas}>`;
    return lemma;
  }

  if (pos === 'verb') {
    const cas = caseGov ? caseLong(wordObj.trait) : null;
    // Principal parts (st. V.; liest, las, …) when present on the item.
    const parts = wordObj.principalParts || wordObj.verbParts || null;
    const kind = wordObj.verbKind || (parts ? 'V.' : 'V.');
    if (parts && caseGov) {
      const gov = cas ? `; + ${cas}` : '';
      return `${lemma} <${kind}; ${parts}${gov}>`;
    }
    if (parts) return `${lemma} <${kind}; ${parts}>`;
    if (cas) return `${lemma} <V. mit ${cas}>`;
    return lemma;
  }

  if (pos === 'verb+prep') {
    const cas = caseGov ? caseLong(wordObj.trait) : null;
    if (cas) return `${lemma} <V. + Präp. mit ${cas}>`;
    return lemma;
  }

  if (pos === 'adj' || pos === 'adjective') {
    const cmp = wordObj.comparative;
    const sup = wordObj.superlative;
    if (cmp && sup) return `${lemma} <Adj.; ${cmp}, ${sup}>`;
    return `${lemma} <Adj.>`;
  }

  if (pos === 'adv' || pos === 'adverb') {
    return `${lemma} <Adv.>`;
  }

  if (pos === 'pronoun') {
    const forms = wordObj.caseForms;
    if (forms) return `${lemma} <Pers.-Pron.; ${forms}>`;
    return `${lemma} <Pers.-Pron.>`;
  }

  if (pos === 'article') {
    const forms = wordObj.articleForms || lemma;
    const kind = wordObj.articleKind === 'indef' ? 'unbest. Art.' : 'best. Art.';
    return `${forms} <${kind}>`;
  }

  return lemma;
}

/**
 * Short gloss / meaning line.
 */
export function formatDictionaryGloss(wordObj) {
  return (wordObj && wordObj.meaning) || '';
}

/**
 * Pedagogical bullets explaining visible citation parts (full card only).
 */
export function formatDictionaryBullets(wordObj, flags = {}) {
  const lemma = (wordObj && wordObj.word) || '';
  if (!lemma) return [];
  const { article = false, plural = false, caseGov = false } = flags;
  const bullets = [];
  const pos = wordObj.pos || '';

  if (pos === 'noun') {
    bullets.push(`${lemma}: Base form (nominative singular).`);
    const art = article ? nounGenderArticle(wordObj) : null;
    if (art) {
      const g = genderLabel(art);
      bullets.push(`${art}: Grammatical gender${g ? ` (${g})` : ''}.`);
      const gen = genitiveEndingCitation(art);
      if (gen === '-') {
        bullets.push(`-: Genitive singular (no ending).`);
      } else if (gen === '-[e]s') {
        bullets.push(`-[e]s: Genitive singular ending (des ${lemma}s / des ${lemma}es).`);
      }
    }
    if (plural) {
      const pl = pluralEndingCitation(wordObj);
      if (pl && wordObj.pluralForm) {
        bullets.push(
          `${pl}: Nominative plural ending (die ${wordObj.pluralForm}).`,
        );
      } else if (pl) {
        bullets.push(`${pl}: Nominative plural ending.`);
      }
    }
    return bullets;
  }

  if (pos === 'prep') {
    bullets.push(`${lemma}: Base form (does not inflect).`);
    if (caseGov) {
      const cas = caseLong(wordObj.trait);
      if (cas === 'Dat.') {
        bullets.push(`Präp. mit Dat.: Preposition requiring the dative.`);
      } else if (cas === 'Akk.') {
        bullets.push(`Präp. mit Akk.: Preposition requiring the accusative.`);
      }
    }
    return bullets;
  }

  if (pos === 'verb' || pos === 'verb+prep') {
    bullets.push(`${lemma}: Base form (infinitive).`);
    if (caseGov) {
      const cas = caseLong(wordObj.trait);
      if (cas === 'Dat.') {
        bullets.push(
          pos === 'verb+prep'
            ? `+ Dat.: Verb + preposition requiring the dative.`
            : `V. mit Dat.: Verb requiring the dative.`,
        );
      } else if (cas === 'Akk.') {
        bullets.push(
          pos === 'verb+prep'
            ? `+ Akk.: Verb + preposition requiring the accusative.`
            : `V. mit Akk.: Verb requiring the accusative.`,
        );
      }
    }
    if (wordObj.principalParts || wordObj.verbParts) {
      bullets.push(
        `${wordObj.principalParts || wordObj.verbParts}: Principal parts (present / past / participle).`,
      );
    }
    return bullets;
  }

  if (pos === 'adj' || pos === 'adjective') {
    bullets.push(`${lemma}: Base form (uninflected).`);
    if (wordObj.comparative && wordObj.superlative) {
      bullets.push(
        `${wordObj.comparative}, ${wordObj.superlative}: Comparative and superlative.`,
      );
    }
    return bullets;
  }

  if (pos === 'adv' || pos === 'adverb') {
    bullets.push(`${lemma}: Base form (does not take endings).`);
    return bullets;
  }

  return bullets;
}

/**
 * Full dictionary card model for the popup / word bank.
 */
export function buildDictionaryCard(wordObj, { full = false, revealAnswer = false } = {}) {
  const flags = dictionaryRevealFlags(wordObj, { full, revealAnswer });
  const showGrammar = full || revealAnswer;
  const citation = formatDictionaryCitation(
    wordObj,
    showGrammar ? flags : { article: false, plural: false, caseGov: false },
  );
  const gloss = formatDictionaryGloss(wordObj);
  const bullets =
    showGrammar && (flags.article || flags.plural || flags.caseGov || revealAnswer)
      ? formatDictionaryBullets(wordObj, flags)
      : [];

  // Trait pill only when the citation doesn't already carry that info.
  let showTraitPill = !!revealAnswer;
  if (showTraitPill && wordObj) {
    if (wordObj.pos === 'noun' && flags.article && nounGenderArticle(wordObj)) {
      showTraitPill = false;
    }
    if (
      (wordObj.pos === 'prep' ||
        wordObj.pos === 'verb' ||
        wordObj.pos === 'verb+prep') &&
      flags.caseGov
    ) {
      showTraitPill = false;
    }
    if (wordObj.domain === 'plurals' && flags.plural) {
      // Ending is in the citation; keep pill only if citation omitted it.
      const pl = pluralEndingCitation(wordObj);
      if (pl && citation.includes(pl)) showTraitPill = false;
    }
  }

  return {
    citation,
    gloss,
    bullets,
    flags,
    showTraitPill,
    /** Separate "Plural: die X" line — redundant when citation has the ending. */
    showPluralLine:
      !!wordObj?.pluralForm &&
      flags.plural &&
      !pluralEndingCitation(wordObj),
  };
}
