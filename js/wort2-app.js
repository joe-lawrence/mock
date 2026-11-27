import {
      setPiperAudioContextProvider,
      unlockPiperAudio,
      ensurePiperReady,
      speakGermanPiper,
      stopPiperAudio,
      isPiperReady,
    } from './piper-tts.js?v=wort2-piper-4';
    import { buildWort2Vocab } from './wort2-vocab.js?v=wort2-plurals-gender1';
    import {
      getExampleSentence
    } from './wort2-definitions.js?v=wort2-content-5';
    import { buildDictionaryCard } from './wort2-dictionary.js?v=dict1';
    import {
      playKaraokeFlow,
      clearKaraokeTimers,
    } from './karaoke-flow.js?v=20261127-karaoke';
    import { karaokeSyllablesForPhrase } from './german-syllables.js?v=20261127-karaoke';
    const { VOCAB_DATA, LEVEL_DEFINITIONS } = buildWort2Vocab();

document.documentElement.dataset.wortBoot = 'loading';
const __wortBootLine = document.getElementById('intro-build-line');
if (__wortBootLine) __wortBootLine.textContent = 'German grammar sort · loading…';

    // Immediately clear stuck overlays (Safari can leave `hidden`+`flex` visible).
    ['translation-popover', 'session-report-modal', 'word-bank-modal', 'confirm-toast'].forEach((id) => {
      document.getElementById(id)?.classList.add('hidden');
    });

    // =========================================================================
    // 1. CURRICULUM VOCABULARY DATASET (nouns-gender.md & case.md)
    // =========================================================================
    // Visual styling tokens per grammatical trait (Blue=Masc, Red=Fem, Green=Neut, Green=Akk, Blue=Dat)
    const TRAIT_STYLES = {
      'der': {
        badgeBg: 'wm-badge wm-badge-der',
        headerBg: 'wm-header-der border',
        colTint: 'wm-col-der',
        titleText: 'wm-title-der',
        subLabel: 'Masculine',
        cardRevealBg: 'wm-card-der border-2',
        cardInvertedBg: 'wm-inv-der border-2',
        cardMissBg: 'wm-miss-der border-2',
        badgeInvertedBg: 'wm-badge-inv wm-badge-inv-der'
      },
      'die': {
        badgeBg: 'wm-badge wm-badge-die',
        headerBg: 'wm-header-die border',
        colTint: 'wm-col-die',
        titleText: 'wm-title-die',
        subLabel: 'Feminine',
        cardRevealBg: 'wm-card-die border-2',
        cardInvertedBg: 'wm-inv-die border-2',
        cardMissBg: 'wm-miss-die border-2',
        badgeInvertedBg: 'wm-badge-inv wm-badge-inv-die'
      },
      'das': {
        badgeBg: 'wm-badge wm-badge-das',
        headerBg: 'wm-header-das border',
        colTint: 'wm-col-das',
        titleText: 'wm-title-das',
        subLabel: 'Neuter',
        cardRevealBg: 'wm-card-das border-2',
        cardInvertedBg: 'wm-inv-das border-2',
        cardMissBg: 'wm-miss-das border-2',
        badgeInvertedBg: 'wm-badge-inv wm-badge-inv-das'
      },
      'Akk': {
        badgeBg: 'wm-badge wm-badge-Akk',
        headerBg: 'wm-header-Akk border',
        colTint: 'wm-col-Akk',
        titleText: 'wm-title-Akk',
        subLabel: 'Accusative',
        cardRevealBg: 'wm-card-Akk border-2',
        cardInvertedBg: 'wm-inv-Akk border-2',
        cardMissBg: 'wm-miss-Akk border-2',
        badgeInvertedBg: 'wm-badge-inv wm-badge-inv-Akk'
      },
      'Dat': {
        badgeBg: 'wm-badge wm-badge-Dat',
        headerBg: 'wm-header-Dat border',
        colTint: 'wm-col-Dat',
        titleText: 'wm-title-Dat',
        subLabel: 'Dative',
        cardRevealBg: 'wm-card-Dat border-2',
        cardInvertedBg: 'wm-inv-Dat border-2',
        cardMissBg: 'wm-miss-Dat border-2',
        badgeInvertedBg: 'wm-badge-inv wm-badge-inv-Dat'
      },
      '+en': {
        badgeBg: 'wm-badge wm-badge-pl-en',
        headerBg: 'wm-header-pl-en border',
        colTint: 'wm-col-pl-en',
        titleText: 'wm-title-pl-en',
        subLabel: 'en ending',
        cardRevealBg: 'wm-card-pl-en border-2',
        cardInvertedBg: 'wm-inv-pl-en border-2',
        cardMissBg: 'wm-miss-pl-en border-2',
        badgeInvertedBg: 'wm-badge-inv wm-badge-inv-pl-en'
      },
      '+e': {
        badgeBg: 'wm-badge wm-badge-pl-e',
        headerBg: 'wm-header-pl-e border',
        colTint: 'wm-col-pl-e',
        titleText: 'wm-title-pl-e',
        subLabel: 'e ending',
        cardRevealBg: 'wm-card-pl-e border-2',
        cardInvertedBg: 'wm-inv-pl-e border-2',
        cardMissBg: 'wm-miss-pl-e border-2',
        badgeInvertedBg: 'wm-badge-inv wm-badge-inv-pl-e'
      },
      '+er': {
        badgeBg: 'wm-badge wm-badge-pl-er',
        headerBg: 'wm-header-pl-er border',
        colTint: 'wm-col-pl-er',
        titleText: 'wm-title-pl-er',
        subLabel: 'er ending',
        cardRevealBg: 'wm-card-pl-er border-2',
        cardInvertedBg: 'wm-inv-pl-er border-2',
        cardMissBg: 'wm-miss-pl-er border-2',
        badgeInvertedBg: 'wm-badge-inv wm-badge-inv-pl-er'
      },
      '+s': {
        badgeBg: 'wm-badge wm-badge-pl-s',
        headerBg: 'wm-header-pl-s border',
        colTint: 'wm-col-pl-s',
        titleText: 'wm-title-pl-s',
        subLabel: 's ending',
        cardRevealBg: 'wm-card-pl-s border-2',
        cardInvertedBg: 'wm-inv-pl-s border-2',
        cardMissBg: 'wm-miss-pl-s border-2',
        badgeInvertedBg: 'wm-badge-inv wm-badge-inv-pl-s'
      },
      '—': {
        badgeBg: 'wm-badge wm-badge-pl-zero',
        headerBg: 'wm-header-pl-zero border',
        colTint: 'wm-col-pl-zero',
        titleText: 'wm-title-pl-zero',
        subLabel: 'no ending',
        cardRevealBg: 'wm-card-pl-zero border-2',
        cardInvertedBg: 'wm-inv-pl-zero border-2',
        cardMissBg: 'wm-miss-pl-zero border-2',
        badgeInvertedBg: 'wm-badge-inv wm-badge-inv-pl-zero'
      }
    };

    const DOMAIN_CONFIG = {
      nouns: { label: 'Gender', traits: ['der', 'die', 'das'] },
      case: { label: 'Case', traits: ['Akk', 'Dat'] },
      plurals: { label: 'Plurals', traits: ['+en', '+e', '+er', '+s', '—'] }
    };

    /** Domains that speak the category label once (anchors / Learning), not on every word. */
    function isCategoryLabelDomain(domain) {
      return domain === 'case' || domain === 'plurals';
    }

    // =========================================================================
    // 2. PERSISTENT STATE, MULTI-PACK SELECTION & COMPOUND GATING ENGINE
    // =========================================================================
    const STORAGE_KEY = 'wortmatch_sort_pwa_v6';
    const MAX_SCORE = 8;
    const GRADUATION_RATIO = 0.75; // 75% Learned (score >= 3) marks a pack complete
    /** Hard cap so column chips + learning anchors still fit on one screen. */
    const MAX_ROUND_SORTABLES = 6;

    let appState = {
      domain: 'nouns',          // 'nouns' | 'case' | 'plurals'
      selectedPacks: {
        nouns: [1],
        case: [1],
        plurals: [1]
      },
      soundEnabled: true,
      speechEnabled: true,
      streak: 0,
      bestStreak: 0,
      scores: {},               // { [wordId]: number (0..8) }
      introduced: {},           // { [wordId]: true } — taught as anchor or sprint before sortable
      lastMissAt: {},           // { [wordId]: timestamp } — last wrong sort
      seenCombinations: []      // Array of sorted ID strings
    };

    let currentRound = null;
    let isChecked = false;
    /** Answer mode: learning anchors have been moved to the top of each column. */
    let answerLayoutActive = false;
    let nextRoundTransitioning = false;
    let bankFilter = 'all';       // tier / status filter
    let bankTraitFilter = 'all';  // grammatical trait
    let bankPackFilter = 'all';   // pack id or 'all'
    let bankSort = 'pack';
    let bankQuery = '';
    let bankOpenId = null;        // expanded row in word bank
    let bankRenderLimit = 40;     // paginate — full list freezes iPhone Safari
    const BANK_PAGE_SIZE = 40;
    /** One-shot Bank → practice: force these into the next generateRound(). */
    let practiceFocus = null;     // { focusId, relatedIds: string[] } | null
    let activeScreen = 'intro'; // 'intro' | 'sprint' | 'game'

    /** Per play-session stats (reset when starting game/sprint from setup). */
    let sessionStats = null;
    let lastSessionReport = null;

    function createEmptySessionStats() {
      return {
        startedAt: Date.now(),
        rounds: 0,
        perfectRounds: 0,
        sortsCorrect: 0,
        sortsWrong: 0,
        introducedIds: new Set(),
        graduatedIds: new Set(),
        demotedIds: new Set(),
        peakStreak: 0,
        mistakes: []
      };
    }

    function ensureSessionStats() {
      if (!sessionStats) sessionStats = createEmptySessionStats();
      return sessionStats;
    }

    function resetSessionStats() {
      sessionStats = createEmptySessionStats();
    }

    function snapshotSessionReport() {
      if (!sessionStats || sessionStats.rounds < 1) return null;
      const s = sessionStats;
      return {
        startedAt: s.startedAt,
        endedAt: Date.now(),
        rounds: s.rounds,
        perfectRounds: s.perfectRounds,
        sortsCorrect: s.sortsCorrect,
        sortsWrong: s.sortsWrong,
        introduced: s.introducedIds.size,
        graduated: s.graduatedIds.size,
        demoted: s.demotedIds.size,
        peakStreak: s.peakStreak,
        bestAllTime: appState.bestStreak,
        endStreak: appState.streak,
        mistakes: s.mistakes.slice(0, 12)
      };
    }

    function persistLastSessionReport(report) {
      lastSessionReport = report;
      try {
        if (report) sessionStorage.setItem('wort2_last_session', JSON.stringify(report));
        else sessionStorage.removeItem('wort2_last_session');
      } catch (_) {}
    }

    function loadLastSessionReport() {
      try {
        const raw = sessionStorage.getItem('wort2_last_session');
        if (raw) lastSessionReport = JSON.parse(raw);
      } catch (_) {
        lastSessionReport = null;
      }
    }

    function formatSessionDuration(ms) {
      const sec = Math.max(1, Math.round(ms / 1000));
      if (sec < 60) return `${sec}s`;
      const m = Math.floor(sec / 60);
      const r = sec % 60;
      return r ? `${m}m ${r}s` : `${m}m`;
    }

    function renderSessionReportBody(report) {
      const body = document.getElementById('session-report-body');
      const sub = document.getElementById('session-report-sub');
      if (!body || !report) return;
      const dur = formatSessionDuration(report.endedAt - report.startedAt);
      if (sub) sub.textContent = `${dur} · ${report.rounds} round${report.rounds === 1 ? '' : 's'}`;
      const accuracy = report.sortsCorrect + report.sortsWrong > 0
        ? Math.round((report.sortsCorrect / (report.sortsCorrect + report.sortsWrong)) * 100)
        : 0;
      const mistakeLines = report.mistakes.length
        ? report.mistakes.map(m =>
            `<li class="flex items-center gap-2 py-0.5"><span class="px-1.5 py-0.5 rounded text-[10px] font-extrabold shrink-0" style="background:var(--surface-2)">${m.trait}</span><span class="wm-word-scroll font-semibold">${m.pluralForm || m.word}</span></li>`
          ).join('')
        : '<li style="color:var(--muted)">No misses this session</li>';

      body.innerHTML = `
        <div class="grid grid-cols-2 gap-2">
          <div class="rounded-xl px-3 py-2.5" style="background:var(--surface-2)">
            <p class="wm-section-label mb-0.5">Accuracy</p>
            <p class="wm-display text-xl font-semibold">${accuracy}%</p>
            <p class="text-[10px]" style="color:var(--muted)">${report.sortsCorrect} right · ${report.sortsWrong} wrong</p>
          </div>
          <div class="rounded-xl px-3 py-2.5" style="background:var(--surface-2)">
            <p class="wm-section-label mb-0.5">Streak</p>
            <p class="wm-display text-xl font-semibold">${report.peakStreak}</p>
            <p class="text-[10px]" style="color:var(--muted)">peak · best ever ${report.bestAllTime}</p>
          </div>
          <div class="rounded-xl px-3 py-2.5" style="background:var(--surface-2)">
            <p class="wm-section-label mb-0.5">Rounds</p>
            <p class="wm-display text-xl font-semibold">${report.perfectRounds}/${report.rounds}</p>
            <p class="text-[10px]" style="color:var(--muted)">perfect / played</p>
          </div>
          <div class="rounded-xl px-3 py-2.5" style="background:var(--surface-2)">
            <p class="wm-section-label mb-0.5">Progress</p>
            <p class="wm-display text-lg font-semibold">+${report.introduced} · ↑${report.graduated}</p>
            <p class="text-[10px]" style="color:var(--muted)">introduced · graduated</p>
          </div>
        </div>
        ${report.demoted ? `<p class="text-[11px]" style="color:var(--muted)">${report.demoted} word${report.demoted === 1 ? '' : 's'} slipped below Learned</p>` : ''}
        <div>
          <p class="wm-section-label mb-1">Misses to revisit</p>
          <ul class="text-xs space-y-0.5">${mistakeLines}</ul>
        </div>
      `;
    }

    function openSessionReport(report) {
      if (!report) return;
      persistLastSessionReport(report);
      renderSessionReportBody(report);
      const modal = document.getElementById('session-report-modal');
      if (modal) modal.classList.remove('hidden');
      refreshIntroSessionCard();
    }

    function closeSessionReport() {
      const modal = document.getElementById('session-report-modal');
      if (modal) modal.classList.add('hidden');
    }

    function refreshIntroSessionCard() {
      const card = document.getElementById('intro-session-card');
      const line = document.getElementById('intro-session-summary');
      if (!card || !line) return;
      if (!lastSessionReport || lastSessionReport.rounds < 1) {
        card.classList.add('hidden');
        return;
      }
      const r = lastSessionReport;
      const accuracy = r.sortsCorrect + r.sortsWrong > 0
        ? Math.round((r.sortsCorrect / (r.sortsCorrect + r.sortsWrong)) * 100)
        : 0;
      line.textContent = `${r.rounds} rounds · ${accuracy}% · peak streak ${r.peakStreak} · +${r.introduced} introduced`;
      card.classList.remove('hidden');
    }

    function leavePlayToIntro({ showReport = true } = {}) {
      const report = snapshotSessionReport();
      if (report) persistLastSessionReport(report);
      sessionStats = null;
      showScreen('intro');
      refreshIntroSessionCard();
      if (showReport && report) openSessionReport(report);
    }

    function loadState() {
      try {
        const raw =
          localStorage.getItem(STORAGE_KEY) ||
          localStorage.getItem('wortmatch_sort_pwa_v5') ||
          localStorage.getItem('wortmatch_sort_pwa_v4');
        if (raw) {
          const parsed = JSON.parse(raw);
          appState = {
            ...appState,
            ...parsed,
            selectedPacks: { ...appState.selectedPacks, ...(parsed.selectedPacks || {}) },
            introduced: { ...(parsed.introduced || {}) },
            lastMissAt: { ...(parsed.lastMissAt || {}) }
          };
        }
      } catch (e) {
        console.warn('Could not load saved state:', e);
      }

      if (!DOMAIN_CONFIG[appState.domain]) {
        appState.domain = 'nouns';
      }

      // Drop legacy Words-per-round mix fields from older saves.
      delete appState.learningCount;
      delete appState.learnedCount;
      delete appState.masteredCount;

      if (!appState.introduced || typeof appState.introduced !== 'object') {
        appState.introduced = {};
      }
      if (!appState.lastMissAt || typeof appState.lastMissAt !== 'object') {
        appState.lastMissAt = {};
      }

      ['nouns', 'case', 'plurals'].forEach(dom => {
        if (!Array.isArray(appState.selectedPacks[dom]) || appState.selectedPacks[dom].length === 0) {
          appState.selectedPacks[dom] = [1];
        }
      });

      // Seed missing scores from curated initialScore; Learned+ counts as already introduced.
      // Also reseed a never-played all-zero save (legacy v4/v5 ignored initialScore).
      const scoreIds = VOCAB_DATA.map(item => item.id);
      const allZero =
        scoreIds.length > 0 &&
        scoreIds.every(id => (appState.scores[id] ?? 0) === 0);
      const neverTaught = Object.keys(appState.introduced).length === 0;
      const reseedFromInitial = allZero && neverTaught;

      VOCAB_DATA.forEach(item => {
        if (typeof appState.scores[item.id] !== 'number' || reseedFromInitial) {
          appState.scores[item.id] =
            typeof item.initialScore === 'number' ? item.initialScore : 0;
        }
        if (getTier(appState.scores[item.id]) !== 'learning') {
          appState.introduced[item.id] = true;
        }
      });
      saveState();
    }

    /** True once a word has been taught (anchor / sprint) or is already Learned+. */
    function isIntroduced(wordId) {
      if (!wordId) return false;
      if (appState.introduced[wordId]) return true;
      return getTier(appState.scores[wordId] ?? 0) !== 'learning';
    }

    function markIntroduced(wordId) {
      if (!wordId || appState.introduced[wordId]) return;
      appState.introduced[wordId] = true;
      if (sessionStats) sessionStats.introducedIds.add(wordId);
    }

    function saveState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
      } catch (e) {
        console.warn('Could not save state:', e);
      }
    }

    function getTier(score) {
      if (score >= 6) return 'mastered';
      if (score >= 3) return 'learned';
      return 'learning';
    }

    function isCompoundUnlocked(wordObj) {
      if (!wordObj || !wordObj.compound || !wordObj.compound.rootId) return true;
      const rootObj = VOCAB_DATA.find(w => w.id === wordObj.compound.rootId);
      // rootOnly bases exist for breakdown hints only — never gate compounds on them.
      if (rootObj?.rootOnly) return true;
      const rootScore = appState.scores[wordObj.compound.rootId] ?? 0;
      return rootScore >= 3; // Root must reach Learned tier first
    }

    function getLevelStats(domain, levelId) {
      const items = VOCAB_DATA.filter(w => w.domain === domain && w.level === levelId);
      const learnedOrBetter = items.filter(w => (appState.scores[w.id] ?? 0) >= 3).length;
      const ratio = items.length > 0 ? learnedOrBetter / items.length : 1;
      return {
        total: items.length,
        learnedOrBetter,
        ratio,
        graduated: ratio >= GRADUATION_RATIO
      };
    }

    function getSelectedPackSet(domain) {
      const list = appState.selectedPacks[domain];
      return new Set(Array.isArray(list) && list.length > 0 ? list : [1]);
    }

    function getActiveWorkingPool(domain) {
      const packSet = getSelectedPackSet(domain);
      return VOCAB_DATA.filter(w => {
        if (w.domain !== domain) return false;
        if (w.rootOnly) return false;
        if (!packSet.has(w.level)) return false;
        return isCompoundUnlocked(w);
      });
    }

    function needsBootstrapSprint(domain) {
      const pool = getActiveWorkingPool(domain);
      const traits = DOMAIN_CONFIG[domain].traits;
      const learnedOrMasteredCount = pool.filter(w => (appState.scores[w.id] ?? 0) >= 3).length;
      const traitsWithLearned = traits.filter(t =>
        pool.some(w => w.trait === t && (appState.scores[w.id] ?? 0) >= 3)
      ).length;
      return learnedOrMasteredCount < 2 || traitsWithLearned < 2;
    }

    function autoAdvanceGraduatedPacks(domain) {
      const levels = LEVEL_DEFINITIONS[domain] || [];
      const packSet = getSelectedPackSet(domain);
      const selectedIds = [...packSet].sort((a, b) => a - b);
      const highestSelected = selectedIds[selectedIds.length - 1] || 1;
      const highestStats = getLevelStats(domain, highestSelected);

      if (highestStats.graduated && highestSelected < levels.length) {
        const nextPack = highestSelected + 1;
        if (!packSet.has(nextPack)) {
          packSet.add(nextPack);
          appState.selectedPacks[domain] = [...packSet].sort((a, b) => a - b);
        }
      }
    }

    // =========================================================================
    // 3. WEB AUDIO SYNTHESIZER & iOS SAFARI-SAFE GERMAN PRONUNCIATION
    // =========================================================================
    let audioCtx = null;
    let cachedEnglishVoice = null;
    let cachedGermanVoice = null;
    const APP_STATUS_OK = 'German grammar sort · js ok 1125f';
    let speechUnlocked = false;
    let speakAfterCancel = false;
    let piperSpeakGen = 0;
    let piperWarmStarted = false;
    /** Dictionary karaoke highlight timers (Schnapp playKaraokeFlow bag). */
    const dictKaraokeTimers = [];
    /** Refined from prior karaoke onEnd — feeds estimateUtteranceMs. */
    let ttsMsPerChar = null;

    function isIOSAudioDevice() {
      const ua = navigator.userAgent || '';
      if (/iPhone|iPad|iPod/i.test(ua)) return true;
      if (/Chrome|Chromium|Edg\/|Firefox|Linux|Windows|Android|CrOS|X11/i.test(ua)) {
        return false;
      }
      return navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1;
    }

    /** Desktop + mobile Safari/WebKit — Piper WASM/MediaStream freezes these. */
    function isSafariWebKit() {
      const ua = navigator.userAgent || '';
      if (/Chrome|Chromium|CriOS|Edg\/|Firefox|FxiOS|Android/i.test(ua)) return false;
      return /Safari/i.test(ua) || /Apple/i.test(navigator.vendor || '');
    }

    /** Safari: route to speaker like Music app (silent switch otherwise mutes). */
    function usePlaybackSession() {
      try {
        const session = navigator.audioSession;
        if (session && session.type !== 'playback') session.type = 'playback';
      } catch {
        /* ignore */
      }
    }

    let audioUnlockedOnce = false;
    let voiceStatusTimer = null;

    function setVoiceStatus(msg) {
      const el = document.getElementById('voice-status');
      if (!el) return;
      if (voiceStatusTimer) {
        clearTimeout(voiceStatusTimer);
        voiceStatusTimer = null;
      }
      if (!msg) {
        el.textContent = '';
        el.classList.remove('is-on');
        return;
      }
      el.textContent = msg;
      el.classList.add('is-on');
      voiceStatusTimer = setTimeout(() => {
        el.classList.remove('is-on');
        voiceStatusTimer = null;
      }, 4200);
    }

    /** Top-left brand subtitle + floating pill (download / ready / speaking). */
    function setAppStatus(msg, { sticky = false } = {}) {
      const bootLine = document.getElementById('intro-build-line');
      if (bootLine) {
        bootLine.textContent = msg || APP_STATUS_OK;
      }
      const gameLine = document.getElementById('game-status-line');
      if (gameLine) {
        gameLine.textContent = msg || '';
      }
      if (msg) setVoiceStatus(msg);
      else if (!sticky) setVoiceStatus('');
    }

    function piperProgressLabel(info) {
      const url = String(info?.url || '');
      if (url.startsWith('piper://runtime')) {
        const n = info?.loaded ?? 0;
        if (n <= 0) return 'Loading TTS engine…';
        if (n === 1) return 'Loading phonemizer…';
        return 'TTS engine ready…';
      }
      if (url.includes('piper://voice')) {
        const n = info?.loaded ?? 0;
        if (n <= 0) return 'Downloading German voice…';
        if (n === 1) return 'Loading voice model…';
        return 'Voice ready';
      }
      return 'Loading voice…';
    }

    function initAudio() {
      try {
        usePlaybackSession();
        resolveVoices();

        // SFX AudioContext — skip on iOS (steals Piper's only session).
        if (!isIOSAudioDevice()) {
          if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
              audioCtx = new AudioContextClass();
            }
          }
          if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
          }
        }

        // Unlock Piper in-gesture (MediaStream is skipped inside piper on Safari).
        void unlockPiperAudio()
          .then(() => {
            audioUnlockedOnce = true;
          })
          .catch(() => {
            audioUnlockedOnce = true;
          });

        if (!speechUnlocked && 'speechSynthesis' in window) {
          try {
            const primer = new SpeechSynthesisUtterance(' ');
            primer.volume = 0;
            primer.rate = 10;
            window.speechSynthesis.resume();
            window.speechSynthesis.speak(primer);
            speechUnlocked = true;
            speakAfterCancel = false;
          } catch {
            /* later speak can retry */
          }
        }
      } catch (err) {
        console.warn('[wort2] initAudio failed', err);
        audioUnlockedOnce = true;
      }
    }

    function warmPiperVoice() {
      if (!appState.speechEnabled) return;
      if (piperWarmStarted) return;
      if (isPiperReady()) {
        setAppStatus('Voice ready');
        return;
      }
      piperWarmStarted = true;
      setAppStatus('Loading German voice…');
      // Yield so the tap can paint / navigate before WASM work.
      const start = () => {
        void ensurePiperReady((info) => setAppStatus(piperProgressLabel(info)))
          .then(() => setAppStatus('Voice ready'))
          .catch((err) => {
            console.warn('[wort2] Piper warm failed', err);
            piperWarmStarted = false;
            const de = cachedGermanVoice ? cachedGermanVoice.name : 'device';
            setAppStatus(`Using ${de} voice`);
          });
      };
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(start, { timeout: 800 });
      } else {
        setTimeout(start, 180);
      }
    }

    function initSchnappTts() {
      setPiperAudioContextProvider(() => {
        if (isIOSAudioDevice()) return null;
        if (!audioCtx) {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (AC) audioCtx = new AC();
        }
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
      });
      // Do NOT unlock audio from capture-phase document listeners.
      // On Safari, AudioContext / MediaStream work in capture can freeze the
      // tab and swallow the originating tap before it reaches any button.
      // Unlock only from Start / Sprint / speak (after UI has navigated).
    }

    function resolveVoices() {
      if (!('speechSynthesis' in window)) return;
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      const enVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));
      cachedEnglishVoice =
        enVoices.find(v => v.lang === 'en-US' && /samantha|alex|daniel/i.test(v.name)) ||
        enVoices.find(v => v.lang === 'en-US') ||
        enVoices.find(v => v.lang === 'en-GB') ||
        enVoices[0] ||
        cachedEnglishVoice;

      const deVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('de'));
      cachedGermanVoice =
        deVoices.find(v => /anna|petra|helena|markus|yannick|google|enhanced/i.test(v.name)) ||
        deVoices.find(v => /^de-DE/i.test(v.lang)) ||
        deVoices[0] ||
        cachedGermanVoice;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', resolveVoices);
    }

    function playSound(type) {
      if (!appState.soundEnabled) return;
      // iOS: oscillator SFX fights Piper's single audio session — skip.
      if (isIOSAudioDevice()) return;
      initAudio();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;

      if (type === 'sort') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.095);
      } else if (type === 'correct') {
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.11, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.26);
        });
      } else if (type === 'wrong') {
        [230, 175].forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.09);
          gain.gain.setValueAtTime(0.08, now + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.22);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + idx * 0.09);
          osc.stop(now + idx * 0.09 + 0.23);
        });
      }
    }

    function stopSpeech() {
      piperSpeakGen += 1;
      clearKaraokeTimers(dictKaraokeTimers);
      document.querySelectorAll('#trans-karaoke .wm-syl.is-active').forEach((el) => {
        el.classList.remove('is-active');
      });
      try {
        stopPiperAudio();
      } catch {
        /* ignore */
      }
      if ('speechSynthesis' in window) {
        try {
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
            if (isIOSAudioDevice()) speakAfterCancel = true;
          }
        } catch {
          /* ignore */
        }
      }
    }

    /** English (and German fallback) via device speechSynthesis. */
    function speakText(text, onDone, langCode = 'en-US', hooks = null) {
      if (!appState.speechEnabled || !('speechSynthesis' in window) || !text) {
        if (onDone) onDone();
        return;
      }

      usePlaybackSession();
      resolveVoices();

      const startSpeak = () => {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        if (langCode.toLowerCase().startsWith('en')) {
          if (cachedEnglishVoice) utterance.voice = cachedEnglishVoice;
          utterance.lang = cachedEnglishVoice?.lang || 'en-US';
          utterance.rate = 1.02;
        } else {
          if (cachedGermanVoice) utterance.voice = cachedGermanVoice;
          utterance.lang = cachedGermanVoice?.lang || 'de-DE';
          utterance.rate = 0.96;
        }

        let finished = false;
        const finishOnce = () => {
          if (finished) return;
          finished = true;
          clearTimeout(fallbackTimer);
          if (onDone) onDone();
        };

        utterance.onstart = () => {
          hooks?.onStart?.();
        };
        utterance.onend = finishOnce;
        utterance.onerror = finishOnce;
        const fallbackTimer = setTimeout(finishOnce, Math.max(1800, text.length * 85));
        window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
        speakAfterCancel = isIOSAudioDevice();
      }

      // WebKit drops speak() if it follows cancel() in the same turn.
      if (speakAfterCancel) {
        speakAfterCancel = false;
        setTimeout(startSpeak, 40);
      } else {
        startSpeak();
      }
    }

    function formatSpokenPhrase(wordObj, includeArticle) {
      if (!wordObj) return '';
      // Plurals mode: always speak nominative gender article with the singular noun.
      if (wordObj.domain === 'plurals' && wordObj.genderArticle) {
        return `${wordObj.genderArticle} ${wordObj.word}`;
      }
      if (includeArticle && wordObj.pos === 'noun' && ['der', 'die', 'das'].includes(wordObj.trait)) {
        return `${wordObj.trait} ${wordObj.word}`;
      }
      // Case labels are spoken separately (with a pause) — never glue "Accusative: für".
      return wordObj.word;
    }

    function formatDisplayWord(wordObj) {
      if (!wordObj) return '';
      // Bare lemma on chips / sort card — no gender article (plurals or otherwise).
      return wordObj.word;
    }

    function formatGenderArticleHtml(wordObj, { articleTrait = null } = {}) {
      if (!wordObj || wordObj.domain !== 'nouns') return '';
      const art = articleTrait || wordObj.trait;
      if (!['der', 'die', 'das'].includes(art)) return '';
      const st = TRAIT_STYLES[art];
      const colorClass = st?.titleText || '';
      return `<span class="wm-gender-article-text ${colorClass}">${art}</span>\u00a0${wordObj.word}`;
    }

    /**
     * Map a sort trait to a written plural suffix.
     * +en → "n" when the stem already ends in -e (Abgabe → Abgaben, not Abgabeen).
     */
    function syntheticPluralSuffix(stem, trait) {
      if (trait === '—') return '';
      if (trait === '+e') return 'e';
      if (trait === '+er') return 'er';
      if (trait === '+s') return 's';
      if (trait === '+en') {
        const s = String(stem || '');
        // Weak -e stems take -n; otherwise -en (Zeitung → Zeitungen).
        if (/e$/i.test(s)) return 'n';
        return 'en';
      }
      return null;
    }

    /**
     * Split a lexical plural into base + colored suffix for display.
     * Prefers lexicon stem/ending (n vs en) over naive trait labels.
     */
    function lexicalPluralParts(wordObj) {
      const form = wordObj.pluralForm || '';
      const stem = wordObj.pluralStem || '';
      const ending = wordObj.pluralEnding;
      if (!ending || ending === '—' || ending === '-') {
        return { base: form || wordObj.word || '', suffix: '' };
      }
      if (form && stem && form.startsWith(stem) && form.slice(stem.length) === ending) {
        return { base: stem, suffix: ending };
      }
      if (form && form.endsWith(ending)) {
        return {
          base: form.slice(0, form.length - ending.length),
          suffix: ending,
        };
      }
      if (form) return { base: form, suffix: '' };
      return { base: wordObj.word || '', suffix: '' };
    }

    /**
     * Plural with colored ending. `endingTrait` overrides the ending/color
     * (used while sorting so chips follow the column the user chose).
     */
    function formatPluralAnswerHtml(wordObj, { endingTrait = null } = {}) {
      if (!wordObj) return '';
      const trait = endingTrait || wordObj.trait;
      const st = TRAIT_STYLES[trait];
      const colorClass = st?.titleText || '';

      // Answer mode, or correctly placed in its ending column: lexical form
      // (Abgabe + n, Bücher + er) — never force trait label "en" onto an -e stem.
      if (!endingTrait || endingTrait === wordObj.trait) {
        const { base, suffix } = lexicalPluralParts(wordObj);
        if (!suffix) return base;
        return `${base}<span class="wm-plural-ending-text ${colorClass}">${suffix}</span>`;
      }

      // Wrong column while sorting: synthesize from singular + trait ending.
      const stem = wordObj.word || '';
      const suffix = syntheticPluralSuffix(stem, trait);
      if (suffix == null || suffix === '') return stem;
      return `${stem}<span class="wm-plural-ending-text ${colorClass}">${suffix}</span>`;
    }

    function formatDisplayWordHtml(wordObj, { showEnding = false, showArticle = false } = {}) {
      if (!wordObj) return '';
      if (wordObj.domain === 'plurals' && showEnding) {
        return formatPluralAnswerHtml(wordObj);
      }
      if (showArticle && wordObj.domain === 'nouns') {
        return formatGenderArticleHtml(wordObj) || formatDisplayWord(wordObj);
      }
      return formatDisplayWord(wordObj);
    }

    /**
     * Placed chips before Check: article/ending follow the column the user
     * chose (not the true answer — that would spoil).
     */
    function formatSortingWordHtml(wordObj, { columnTrait = null } = {}) {
      if (!wordObj) return '';
      if (wordObj.domain === 'plurals') {
        return formatPluralAnswerHtml(wordObj, {
          endingTrait: columnTrait || wordObj.trait,
        });
      }
      if (wordObj.domain === 'nouns') {
        return (
          formatGenderArticleHtml(wordObj, {
            articleTrait: columnTrait || wordObj.trait,
          }) || formatDisplayWord(wordObj)
        );
      }
      return formatDisplayWord(wordObj);
    }

    function columnTraitForSide(side) {
      if (!currentRound) return null;
      return side === 'left' ? currentRound.leftTrait : currentRound.rightTrait;
    }

    function categorySpokenLabel(wordObj) {
      if (!wordObj || !isCategoryLabelDomain(wordObj.domain)) return null;
      return TRAIT_STYLES[wordObj.trait]?.subLabel || wordObj.trait || null;
    }

    /**
     * Speak one German string via Piper (or device fallback).
     * Optional `hooks` mirror Schnapp withGermanUtterance (onStart may get durationMs).
     */
    function speakGermanUtterance(phrase, gen, onDone, hooks = null) {
      if (!phrase) {
        if (onDone) onDone();
        return;
      }
      const finish = () => {
        if (gen !== piperSpeakGen) return;
        hooks?.onEnd?.();
        if (onDone) onDone();
      };

      const run = async () => {
        try {
          if (!isPiperReady()) {
            warmPiperVoice();
            const waitMs = isSafariWebKit() || isIOSAudioDevice() ? 12000 : 1800;
            const ready = await Promise.race([
              ensurePiperReady((info) => setAppStatus(piperProgressLabel(info)))
                .then(() => true)
                .catch(() => false),
              new Promise((resolve) => setTimeout(() => resolve(false), waitMs))
            ]);
            if (gen !== piperSpeakGen) return;
            if (!ready) {
              setAppStatus(cachedGermanVoice ? 'Device German voice' : 'No German voice yet');
              speakText(phrase, finish, 'de-DE', {
                onStart: () => hooks?.onStart?.(),
              });
              return;
            }
            setAppStatus('Voice ready');
          }
          if (gen !== piperSpeakGen) return;
          await speakGermanPiper(phrase, {
            rate: hooks?.rate || 1,
            onStart: (info) => {
              if (gen !== piperSpeakGen) return;
              hooks?.onStart?.(info);
            },
            onEnd: finish,
            onError: (err) => {
              console.warn('[wort2] Piper speak error, falling back', err);
              if (gen !== piperSpeakGen) return;
              setAppStatus('Piper failed · device voice');
              speakText(phrase, finish, 'de-DE', {
                onStart: () => hooks?.onStart?.(),
              });
            },
          });
        } catch (err) {
          console.warn('[wort2] Piper unavailable, falling back', err);
          if (gen !== piperSpeakGen) return;
          setAppStatus('Using device voice');
          speakText(phrase, finish, 'de-DE', {
            onStart: () => hooks?.onStart?.(),
          });
        }
      };

      void run();
    }

    function speakGermanWord(wordObj, includeArticle = false, onDone = null) {
      if (!appState.speechEnabled || !wordObj) {
        if (onDone) onDone();
        return;
      }

      const gen = ++piperSpeakGen;
      const finish = () => {
        if (gen !== piperSpeakGen) return;
        if (onDone) onDone();
      };

      try {
        void unlockPiperAudio();
        initAudio();
      } catch (_) { /* ignore */ }

      // Case / plurals: category label …pause… word (never one glued phrase).
      if (includeArticle && isCategoryLabelDomain(wordObj.domain)) {
        const label = categorySpokenLabel(wordObj);
        const word = formatSpokenPhrase(wordObj, true);
        if (!label) {
          speakGermanUtterance(word, gen, finish);
          return;
        }
        speakGermanUtterance(label, gen, () => {
          if (gen !== piperSpeakGen) return;
          setTimeout(() => {
            if (gen !== piperSpeakGen) return;
            speakGermanUtterance(word, gen, finish);
          }, 420);
        });
        return;
      }

      const phrase = formatSpokenPhrase(wordObj, includeArticle);
      speakGermanUtterance(phrase, gen, finish);
    }

    function speakEnglishDefinition(text, onDone = null) {
      speakText(text, onDone, 'en-US');
    }

    initSchnappTts();

    // =========================================================================
    // 4. ROUND GENERATION WITH SORTABLE LEARNING WORDS & LEVEL PROGRESSION
    // =========================================================================
    function shuffleArray(arr) {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }

    function pickRandom(pool, excludeIds = new Set()) {
      const filtered = pool.filter(item => !excludeIds.has(item.id));
      if (filtered.length === 0) return null;
      return filtered[Math.floor(Math.random() * filtered.length)];
    }

    function pickRelatedPracticeIds(focusWord) {
      const packSet = getSelectedPackSet(appState.domain);
      const pool = VOCAB_DATA.filter(w =>
        w.domain === appState.domain && packSet.has(w.level) && w.id !== focusWord.id
      );
      const related = [];
      const pushId = (id) => {
        if (id && !related.includes(id) && id !== focusWord.id) related.push(id);
      };

      if (focusWord.compound?.rootId) pushId(focusWord.compound.rootId);

      if (Array.isArray(focusWord.buildsCompounds)) {
        for (const surface of focusWord.buildsCompounds.slice(0, 2)) {
          const hit = pool.find(w => w.word === surface);
          if (hit) pushId(hit.id);
        }
      }

      const sameTraitMiss = pool
        .filter(w => w.trait === focusWord.trait && appState.lastMissAt?.[w.id])
        .sort((a, b) => (appState.lastMissAt[b.id] || 0) - (appState.lastMissAt[a.id] || 0));
      if (sameTraitMiss[0]) pushId(sameTraitMiss[0].id);

      return related.slice(0, 2);
    }

    function generateRound() {
      const packSet = getSelectedPackSet(appState.domain);
      const packLabel = packSet.size === 1 ? `Pack ${[...packSet][0]}` : `${packSet.size} Packs`;
      const pendingPractice = practiceFocus;
      practiceFocus = null;

      const focusWord = pendingPractice
        ? VOCAB_DATA.find(w => w.id === pendingPractice.focusId)
        : null;
      const relatedIds = pendingPractice?.relatedIds || [];

      let domainItems = getActiveWorkingPool(appState.domain);
      // Practice may target a gated compound — still include it for this round.
      if (focusWord && !domainItems.some(w => w.id === focusWord.id)) {
        domainItems = [...domainItems, focusWord];
      }
      relatedIds.forEach(rid => {
        if (domainItems.some(w => w.id === rid)) return;
        const extra = VOCAB_DATA.find(w => w.id === rid);
        if (extra && extra.domain === appState.domain) domainItems = [...domainItems, extra];
      });

      const traits = DOMAIN_CONFIG[appState.domain].traits;
      const seenSet = new Set(appState.seenCombinations);
      /** Fixed round size — Learned → Mastered → introduced Learning (scarcity only). */
      const totalNeeded = MAX_ROUND_SORTABLES;

      const getExactBucket = (tier, trait) =>
        domainItems.filter(w => w.trait === trait && getTier(appState.scores[w.id] ?? 0) === tier);

      /** Learning words not yet taught as anchor/sprint — preferred for column anchors. */
      const getUnintroducedLearning = (trait) =>
        getExactBucket('learning', trait).filter(w => !isIntroduced(w.id));

      /** Learning words already taught — only these may appear as Learning sortables. */
      const getIntroducedLearning = (trait) =>
        getExactBucket('learning', trait).filter(w => isIntroduced(w.id));

      /** Anchor pool: prefer unintroduced Learning, then any Learning, then Learned. Never require cold sortables. */
      const getAnchorPool = (trait) => {
        const fresh = getUnintroducedLearning(trait);
        if (fresh.length > 0) return fresh;
        const learning = getExactBucket('learning', trait);
        if (learning.length > 0) return learning;
        const learned = getExactBucket('learned', trait);
        if (learned.length > 0) return learned;
        const mastered = getExactBucket('mastered', trait);
        if (mastered.length > 0) return mastered;
        return domainItems.filter(w => w.trait === trait);
      };

      /**
       * Sortable pools never include unintroduced Learning words.
       * Fill phases: learned (falls through to mastered) → mastered → introduced learning only.
       */
      const getSortablePool = (tier, trait) => {
        if (tier === 'learning') {
          return getIntroducedLearning(trait);
        }
        if (tier === 'learned') {
          const learned = getExactBucket('learned', trait);
          if (learned.length > 0) return learned;
          return getExactBucket('mastered', trait);
        }
        return getExactBucket('mastered', trait);
      };

      const pushSortable = (sortableWords, usedIds, w) => {
        if (!w || usedIds.has(w.id)) return;
        usedIds.add(w.id);
        sortableWords.push({
          ...w,
          displayTier: getTier(appState.scores[w.id] ?? 0),
          assignedSide: null,
          isCorrect: null,
          movedFromSide: null
        });
      };

      let bestRound = null;
      let isUnique = false;

      // Try up to 25 attempts to avoid repeating exact word sets
      for (let attempt = 0; attempt < 25; attempt++) {
        let pairTraits;
        if (focusWord && traits.includes(focusWord.trait)) {
          const other =
            pickRandom(
              traits.filter(t => t !== focusWord.trait).map(t => ({ id: t, val: t }))
            )?.val || traits.find(t => t !== focusWord.trait);
          pairTraits = shuffleArray([focusWord.trait, other]);
        } else {
          // Prefer traits that still have unintroduced Learning words so new items get taught as anchors.
          const traitsWithFresh = traits.filter(t => getUnintroducedLearning(t).length > 0);
          const traitsWithLearning = traits.filter(t => getExactBucket('learning', t).length > 0);
          if (traitsWithFresh.length >= 2) {
            pairTraits = shuffleArray(traitsWithFresh).slice(0, 2);
          } else if (traitsWithFresh.length === 1) {
            const other =
              pickRandom(
                traits.filter(t => t !== traitsWithFresh[0]).map(t => ({ id: t, val: t }))
              )?.val || traits.find(t => t !== traitsWithFresh[0]);
            pairTraits = shuffleArray([traitsWithFresh[0], other]);
          } else if (traitsWithLearning.length >= 2) {
            pairTraits = shuffleArray(traitsWithLearning).slice(0, 2);
          } else if (traitsWithLearning.length === 1) {
            const otherTrait =
              pickRandom(
                traits.filter(t => t !== traitsWithLearning[0]).map(t => ({ id: t, val: t }))
              )?.val || traits.find(t => t !== traitsWithLearning[0]);
            pairTraits = shuffleArray([traitsWithLearning[0], otherTrait]);
          } else {
            pairTraits = shuffleArray(traits).slice(0, 2);
          }
        }

        const [leftTrait, rightTrait] = pairTraits;
        const usedIds = new Set();
        // Keep the focus word as a sortable drill target, not an anchor.
        if (focusWord) usedIds.add(focusWord.id);

        const leftAnchor = pickRandom(getAnchorPool(leftTrait), usedIds);
        if (leftAnchor) usedIds.add(leftAnchor.id);

        const rightAnchor = pickRandom(getAnchorPool(rightTrait), usedIds);
        if (rightAnchor) usedIds.add(rightAnchor.id);

        // Focus was reserved — allow it into sortables now.
        if (focusWord) usedIds.delete(focusWord.id);

        const sortableWords = [];
        const traitOk = (w) => w && (w.trait === leftTrait || w.trait === rightTrait);

        if (focusWord && traitOk(focusWord)) {
          pushSortable(sortableWords, usedIds, focusWord);
        }
        relatedIds.forEach(rid => {
          if (sortableWords.length >= totalNeeded) return;
          const rel = domainItems.find(w => w.id === rid);
          if (traitOk(rel)) pushSortable(sortableWords, usedIds, rel);
        });

        // Prefer Learned, then Mastered; dip into introduced Learning only if still short.
        const fillOrder = [
          ...Array(totalNeeded).fill('learned'),
          ...Array(totalNeeded).fill('mastered'),
          ...Array(totalNeeded).fill('learning')
        ];
        for (const tier of fillOrder) {
          if (sortableWords.length >= totalNeeded) break;
          const targetTrait = pairTraits[Math.floor(Math.random() * 2)];
          let w = pickRandom(getSortablePool(tier, targetTrait), usedIds);
          if (!w) {
            const altTrait = targetTrait === leftTrait ? rightTrait : leftTrait;
            w = pickRandom(getSortablePool(tier, altTrait), usedIds);
          }
          pushSortable(sortableWords, usedIds, w);
        }

        const allIds = [leftAnchor?.id, rightAnchor?.id, ...sortableWords.map(w => w.id)].filter(Boolean).sort();
        const comboKey = allIds.join('|');

        // Keep practice focus near the front of the unsorted queue.
        const orderedItems = focusWord
          ? [
              ...sortableWords.filter(w => w.id === focusWord.id),
              ...shuffleArray(sortableWords.filter(w => w.id !== focusWord.id))
            ]
          : shuffleArray(sortableWords);

        bestRound = {
          leftTrait,
          rightTrait,
          leftAnchor,
          rightAnchor,
          items: orderedItems,
          comboKey,
          practiceFocusId: focusWord?.id || null
        };

        // Practice rounds always accept the first build (forced set).
        if (focusWord || !seenSet.has(comboKey)) {
          isUnique = !seenSet.has(comboKey);
          break;
        }
      }

      if (bestRound && !seenSet.has(bestRound.comboKey)) {
        appState.seenCombinations.push(bestRound.comboKey);
        if (appState.seenCombinations.length > 400) {
          appState.seenCombinations.shift();
        }
        saveState();
      }

      const statusEl = document.getElementById('combo-pool-status');
      if (statusEl) {
        if (focusWord) {
          statusEl.textContent = `Practice · ${focusWord.word}`;
        } else {
          statusEl.textContent = isUnique
            ? `${packLabel} · Unique`
            : `${packLabel} · Recycled`;
        }
      }

      return bestRound;
    }

    function practiceWordFromBank(wordId) {
      const wordObj = VOCAB_DATA.find(w => w.id === wordId);
      if (!wordObj || wordObj.domain !== appState.domain) return;

      const packSet = getSelectedPackSet(appState.domain);
      if (!packSet.has(wordObj.level)) {
        packSet.add(wordObj.level);
        appState.selectedPacks[appState.domain] = [...packSet].sort((a, b) => a - b);
      }

      // Sortables require introduced Learning words — teach it now.
      markIntroduced(wordObj.id);
      const relatedIds = pickRelatedPracticeIds(wordObj);
      relatedIds.forEach(id => markIntroduced(id));

      practiceFocus = { focusId: wordObj.id, relatedIds };
      saveState();

      if (elBankModal) elBankModal.classList.add('hidden');
      bankOpenId = null;
      stopSpeech();

      initAudio();
      if (appState.speechEnabled) warmPiperVoice();

      if (activeScreen !== 'game') {
        resetSessionStats();
        ensureSessionStats();
        showScreen('game');
      } else {
        ensureSessionStats();
        startNewRound();
      }
    }

    // =========================================================================
    // 4B. BOOTSTRAP SPRINT ENGINE (RAPID COLD-START TIER SEEDING)
    // =========================================================================
    const elSprintScreen = document.getElementById('sprint-screen');
    let sprintState = null;

    function startBootstrapSprint() {
      const domain = appState.domain;
      const pool = getActiveWorkingPool(domain);

      const unlearnedInSelection = shuffleArray(pool.filter(w => (appState.scores[w.id] ?? 0) < 3));
      const queue = unlearnedInSelection.length > 0 ? unlearnedInSelection : shuffleArray(pool);

      sprintState = {
        queue,
        index: 0,
        seededCount: 0,
        locked: false
      };

      showScreen('sprint');
      renderSprintCard();
    }

    function renderSprintCard() {
      if (!sprintState || sprintState.index >= sprintState.queue.length) {
        showScreen('game');
        return;
      }

      const wordObj = sprintState.queue[sprintState.index];
      const cardEl = document.getElementById('sprint-card');
      cardEl.className = 'wm-surface w-full max-w-[320px] rounded-3xl border-2 p-6 text-center space-y-2 transition-all';
      cardEl.style.borderColor = 'var(--line-strong)';
      cardEl.style.color = 'var(--ink)';

      document.getElementById('sprint-counter').textContent = `${sprintState.index + 1} / ${sprintState.queue.length}`;
      document.getElementById('sprint-level-tag').textContent = `Pack ${wordObj.level}`;
      document.getElementById('sprint-word').textContent = formatDisplayWord(wordObj);

      // Speak after paint so Safari isn't wedged mid-navigation.
      const spoken = wordObj;
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (!sprintState || sprintState.queue[sprintState.index] !== spoken) return;
          speakGermanWord(spoken, false);
        }, 0);
      });

      const fb = document.getElementById('sprint-feedback-line');
      fb.textContent = '—';
      fb.className = 'h-5 text-xs font-bold text-transparent transition-colors';
      fb.style.color = '';

      const traits = DOMAIN_CONFIG[appState.domain].traits;
      const btnContainer = document.getElementById('sprint-buttons');
      btnContainer.className =
        traits.length <= 2
          ? 'grid grid-cols-2 gap-2.5'
          : traits.length === 3
            ? 'grid grid-cols-3 gap-2'
            : 'grid grid-cols-3 gap-2';

      btnContainer.innerHTML = traits.map(trait => {
        const st = TRAIT_STYLES[trait];
        return `
          <button type="button" data-sprint-trait="${trait}" class="py-3.5 px-2 rounded-2xl border-2 ${st.headerBg} active:scale-95 transition flex flex-col items-center justify-center shadow-xs">
            <span class="px-2 py-0.5 rounded-md text-xs font-extrabold ${st.badgeBg}">${trait}</span>
            <span class="text-[11px] font-bold ${st.titleText} mt-1">${st.subLabel}</span>
          </button>
        `;
      }).join('');

      btnContainer.querySelectorAll('[data-sprint-trait]').forEach(btn => {
        btn.addEventListener('click', () => handleSprintChoice(btn.dataset.sprintTrait));
      });
    }

    function handleSprintChoice(chosenTrait) {
      if (!sprintState || sprintState.locked) return;
      sprintState.locked = true;
      initAudio();

      const wordObj = sprintState.queue[sprintState.index];
      const isDontKnow = chosenTrait === null;
      const isRight = !isDontKnow && chosenTrait === wordObj.trait;
      const st = TRAIT_STYLES[wordObj.trait];
      const cardEl = document.getElementById('sprint-card');
      const fb = document.getElementById('sprint-feedback-line');

      if (isRight) {
        const prev = appState.scores[wordObj.id] ?? 0;
        appState.scores[wordObj.id] = Math.min(MAX_SCORE, Math.max(3, prev + 3));
        sprintState.seededCount++;
        playSound('correct');
        cardEl.className = `w-full max-w-[320px] rounded-3xl border-2 ${st.cardRevealBg} p-6 text-center space-y-2 transition-all`;
        cardEl.style.borderColor = '';
        fb.textContent = `✓ ${wordObj.trait} ${formatDisplayWord(wordObj)} → Learned`;
        fb.className = `h-5 text-xs font-extrabold ${st.titleText}`;
      } else if (isDontKnow) {
        appState.scores[wordObj.id] = 0;
        playSound('sort');
        cardEl.className = `w-full max-w-[320px] rounded-3xl border-2 ${st.cardRevealBg} p-6 text-center space-y-2 transition-all`;
        cardEl.style.borderColor = '';
        fb.textContent = `${wordObj.trait} ${formatDisplayWord(wordObj)} → Learning`;
        fb.className = `h-5 text-xs font-extrabold ${st.titleText}`;
      } else {
        appState.scores[wordObj.id] = 0;
        playSound('wrong');
        cardEl.className = `w-full max-w-[320px] rounded-3xl border-2 ${st.cardRevealBg} p-6 text-center space-y-2 transition-all`;
        cardEl.style.borderColor = '';
        fb.textContent = `✗ ${wordObj.trait} ${formatDisplayWord(wordObj)} → Anchor`;
        fb.className = 'h-5 text-xs font-extrabold';
        fb.style.color = 'var(--bad)';
      }

      // Sprint always reveals the correct trait — safe to sort later.
      markIntroduced(wordObj.id);

      autoAdvanceGraduatedPacks(appState.domain);
      saveState();
      updateHeaderAndLegend();

      setTimeout(() => {
        if (!sprintState) return;
        sprintState.index++;
        sprintState.locked = false;
        renderSprintCard();
      }, 650);
    }

    // =========================================================================
    // 5. SCREEN MANAGEMENT, BOARD RENDERING & TOUCH SWIPE PHYSICS
    // =========================================================================
    const elIntroScreen = document.getElementById('intro-screen');
    const elGameScreen = document.getElementById('game-screen');

    const elColLeft = document.getElementById('col-left');
    const elColRight = document.getElementById('col-right');
    const elColLeftHeader = document.getElementById('col-left-header');
    const elColRightHeader = document.getElementById('col-right-header');
    const elColLeftItems = document.getElementById('col-left-items');
    const elColRightItems = document.getElementById('col-right-items');
    const elUnsortedSection = document.getElementById('unsorted-section');
    const elUnsortedQueue = document.getElementById('unsorted-queue');
    const elPrimaryBtn = document.getElementById('btn-primary-action');
    const elPrimaryLabel = document.getElementById('btn-primary-label');

    // Translation popover elements
    const elTransPopover = document.getElementById('translation-popover');
    const elTransCard = document.getElementById('translation-card');
    let transHideTimer = null;
    let transOpenedAt = 0;
    let transSpeechDone = true;
    let anchorIntroRunId = 0;
    let revealSequenceRunId = 0;
    let highlightedSide = null; // null | 'left' | 'right'
    let highlightedWordId = null; // word id currently highlighted during Answer Mode TTS
    let highlightedRootEl = null; // DOM node currently inverted for TTS readout

    const BUILDS_EXAMPLE_LIMIT = 3;

    /** Auto-marquee overflowing `.wm-word-scroll` nodes (no scrollbar). */
    function refreshWordScroll(scope = document) {
      const roots = scope.querySelectorAll
        ? scope.querySelectorAll('.wm-word-scroll')
        : [];
      const list = roots.length ? [...roots] : (scope?.classList?.contains('wm-word-scroll') ? [scope] : []);
      list.forEach((el) => {
        let inner = el.querySelector(':scope > .wm-word-scroll-inner');
        if (!inner) {
          inner = document.createElement('span');
          inner.className = 'wm-word-scroll-inner';
          while (el.firstChild) inner.appendChild(el.firstChild);
          el.appendChild(inner);
        }
        el.classList.remove('is-overflowing');
        el.style.removeProperty('--wm-marquee-x');
        el.style.removeProperty('--wm-marquee-duration');
        // Force layout after class clear
        void inner.offsetWidth;
        const overflow = inner.scrollWidth - el.clientWidth;
        if (overflow > 6) {
          el.classList.add('is-overflowing');
          el.style.setProperty('--wm-marquee-x', `${-overflow}px`);
          el.style.setProperty('--wm-marquee-duration', `${Math.max(3.5, overflow / 18)}s`);
        }
      });
    }

    function formatBuildsHint(wordObj) {
      const builds = wordObj && wordObj.buildsCompounds;
      if (!builds || !builds.length) return '';
      const shown = builds.slice(0, BUILDS_EXAMPLE_LIMIT);
      const more = builds.length > BUILDS_EXAMPLE_LIMIT ? '…' : '';
      return `Builds: ${shown.join(', ')}${more}`;
    }

    function formatCompoundHint(wordObj, revealAnswer = false) {
      if (!wordObj) return '';
      if (wordObj.compound) {
        if (!revealAnswer) return '';
        return `${wordObj.compound.prefix} + ${wordObj.compound.rootTrait} ${wordObj.compound.rootWord}`;
      }
      return formatBuildsHint(wordObj);
    }

    /** Learning-tier (or round Learning slot) — may see dictionary clues during play. */
    function isLearningWord(wordObj) {
      if (!wordObj) return false;
      if (wordObj.displayTier === 'learning') return true;
      return getTier(appState.scores[wordObj.id] ?? 0) === 'learning';
    }

    /**
     * Full dictionary card: Learning words anytime, or any word after Check.
     * Sorting non-learning: lemma + definition only.
     */
    function isFullDictionary(wordObj, revealAnswer = false) {
      return !!revealAnswer || isLearningWord(wordObj);
    }

    /** Single clean gloss — grammar lives on the citation / note lines. */
    function dictionaryDefinition(wordObj) {
      return (wordObj && wordObj.meaning) || '';
    }

    let transDismissCallback = null;

    function clearDictKaraoke() {
      clearKaraokeTimers(dictKaraokeTimers);
      const row = document.getElementById('trans-karaoke');
      if (!row) return;
      row.querySelectorAll('.wm-syl.is-active').forEach((el) => {
        el.classList.remove('is-active');
      });
      row.replaceChildren();
      row.classList.add('hidden');
    }

    /**
     * Mount compact orthographic karaoke chips (SYL·a·bel).
     * @returns {HTMLElement[]}
     */
    function mountDictKaraoke(syllables) {
      const row = document.getElementById('trans-karaoke');
      if (!row) return [];
      row.replaceChildren();
      if (!syllables?.length) {
        row.classList.add('hidden');
        return [];
      }
      syllables.forEach((s, i) => {
        if (i > 0) {
          const sep = document.createElement('span');
          sep.className = 'wm-syl-sep';
          sep.textContent = '·';
          sep.setAttribute('aria-hidden', 'true');
          row.appendChild(sep);
        }
        const chip = document.createElement('span');
        chip.className = 'wm-syl' + (s.stress ? ' has-stress' : '');
        if (s.article) chip.classList.add('wm-syl-article');
        chip.textContent = s.text;
        row.appendChild(chip);
      });
      row.classList.remove('hidden');
      return [...row.querySelectorAll('.wm-syl')];
    }

    /**
     * Speak phrase with Schnapp-style duration-weighted syllable highlight.
     */
    function speakGermanWithKaraoke(phrase, wordObj, gen, onDone) {
      const syllables = karaokeSyllablesForPhrase(phrase, {
        compound: wordObj?.compound || null,
      });
      const nodes = mountDictKaraoke(syllables);
      if (!nodes.length) {
        speakGermanUtterance(phrase, gen, onDone);
        return;
      }

      playKaraokeFlow(phrase, syllables, nodes, {
        timers: dictKaraokeTimers,
        getMsPerChar: () => ttsMsPerChar,
        setMsPerChar: (v) => {
          ttsMsPerChar = v;
        },
        speak: (text, speakOpts) => {
          speakGermanUtterance(text, gen, null, speakOpts);
        },
        onEnd: () => {
          if (gen !== piperSpeakGen) return;
          if (onDone) onDone();
        },
        onError: () => {
          if (gen !== piperSpeakGen) return;
          if (onDone) onDone();
        },
      });
    }

    function showTranslationPopup(wordObj, revealAnswer = false, options = {}) {
      if (!wordObj) return;
      const {
        minReadMs = 3200,
        pauseAfterMs = 250,
        readDefinitionAloud = false,
        onComplete = null,
        cancelAnchorIntro = true,
        /** Stay open until the user taps the overlay (default). */
        holdUntilDismiss = true
      } = options;

      if (cancelAnchorIntro) {
        anchorIntroRunId++;
      }

      initAudio();
      clearDictKaraoke();
      if (transHideTimer) {
        clearTimeout(transHideTimer);
        transHideTimer = null;
      }
      transDismissCallback = onComplete;

      const st = TRAIT_STYLES[wordObj.trait];
      const pillEl = document.getElementById('trans-pill');
      const headerLineEl = document.getElementById('trans-header-line');
      const defEl = document.getElementById('trans-definition');
      const noteEl = document.getElementById('trans-note');
      const compEl = document.getElementById('trans-compound');
      const pluralEl = document.getElementById('trans-plural');
      const bulletsEl = document.getElementById('trans-dict-bullets');
      const exampleEl = document.getElementById('trans-example');
      const exampleEnEl = document.getElementById('trans-example-en');
      const hrExample = document.getElementById('trans-hr-example');
      const hrBuilds = document.getElementById('trans-hr-builds');

      const full = isFullDictionary(wordObj, revealAnswer);
      // Trait TTS cue — answer mode only (would spoil the sort).
      const showTrait = !!revealAnswer;
      const card = buildDictionaryCard(wordObj, { full, revealAnswer });
      const definitionText = card.gloss || dictionaryDefinition(wordObj);
      // Examples carry articles / case / plural forms — answer mode only.
      const example = revealAnswer ? getExampleSentence(wordObj) : null;

      headerLineEl.textContent = card.citation;
      defEl.textContent = definitionText;

      if (bulletsEl) {
        if (card.bullets?.length) {
          bulletsEl.replaceChildren();
          for (const b of card.bullets) {
            const li = document.createElement('li');
            li.textContent = `• ${b}`;
            bulletsEl.appendChild(li);
          }
          bulletsEl.classList.remove('hidden');
        } else {
          bulletsEl.replaceChildren();
          bulletsEl.classList.add('hidden');
        }
      }

      if (pluralEl) {
        if (card.showPluralLine) {
          pluralEl.textContent = `Plural: die ${wordObj.pluralForm}`;
          pluralEl.classList.remove('hidden');
        } else {
          pluralEl.classList.add('hidden');
        }
      }

      // Trait pill only when citation doesn't already carry gender / case / ending.
      if (card.showTraitPill && st) {
        pillEl.textContent = wordObj.trait;
        pillEl.className = `wm-anchor-pill ${st.badgeBg}`;
        pillEl.classList.remove('hidden');
      } else {
        pillEl.classList.add('hidden');
      }

      // Grammar note (suffix rules, etc.): answer mode only.
      if (revealAnswer && wordObj.note) {
        noteEl.textContent = wordObj.note;
        noteEl.classList.remove('hidden');
      } else {
        noteEl.classList.add('hidden');
      }

      const showExample = !!(example && exampleEl && exampleEnEl);
      if (showExample) {
        exampleEl.textContent = example.de;
        exampleEl.classList.remove('hidden');
        exampleEnEl.textContent = example.en;
        exampleEnEl.classList.remove('hidden');
      } else if (exampleEl && exampleEnEl) {
        exampleEl.classList.add('hidden');
        exampleEnEl.classList.add('hidden');
      }
      hrExample?.classList.toggle('hidden', !showExample);

      // Compounds: full breakdown after Check; Builds on Learning while sorting.
      let compoundHint = '';
      if (revealAnswer) {
        compoundHint = formatCompoundHint(wordObj, true) || '';
      } else if (full && !wordObj.compound) {
        compoundHint = formatBuildsHint(wordObj) || '';
      }
      if (compoundHint) {
        compEl.textContent = compoundHint;
        compEl.classList.remove('hidden');
      } else {
        compEl.classList.add('hidden');
      }
      // Divider before Builds only when example (or prior block) is above it.
      hrBuilds?.classList.toggle('hidden', !compoundHint);

      elTransPopover.classList.remove('hidden');
      requestAnimationFrame(() => {
        elTransCard.classList.remove('scale-95', 'opacity-0');
        elTransCard.classList.add('scale-100', 'opacity-100');
        refreshWordScroll(elTransCard);
      });

      transOpenedAt = Date.now();
      transSpeechDone = false;
      const popupRunId = anchorIntroRunId;

      const scheduleFadeOutAfterMinRead = () => {
        if (holdUntilDismiss) return;
        if (popupRunId !== anchorIntroRunId) return;
        const elapsed = Date.now() - transOpenedAt;
        const remaining = Math.max(pauseAfterMs, minReadMs - elapsed);
        transHideTimer = setTimeout(() => {
          if (popupRunId !== anchorIntroRunId) return;
          hideTranslationPopup();
        }, remaining);
      };

      speakDictionaryCard(wordObj, showTrait, () => {
        if (popupRunId !== anchorIntroRunId) return;
        if (readDefinitionAloud && definitionText) {
          setTimeout(() => {
            if (popupRunId !== anchorIntroRunId) return;
            speakEnglishDefinition(definitionText, () => {
              transSpeechDone = true;
              scheduleFadeOutAfterMinRead();
            });
          }, 160);
        } else {
          transSpeechDone = true;
          scheduleFadeOutAfterMinRead();
        }
      });
    }

    /** Dictionary popup TTS — lemma karaoke (Schnapp timing) after optional trait label. */
    function speakDictionaryCard(wordObj, includeArticle, onDone = null) {
      if (!appState.speechEnabled || !wordObj) {
        if (onDone) onDone();
        return;
      }

      const gen = ++piperSpeakGen;
      clearKaraokeTimers(dictKaraokeTimers);

      try {
        void unlockPiperAudio();
        initAudio();
      } catch (_) { /* ignore */ }

      const finish = () => {
        if (gen !== piperSpeakGen) return;
        if (onDone) onDone();
      };

      if (includeArticle && isCategoryLabelDomain(wordObj.domain)) {
        const label = categorySpokenLabel(wordObj);
        const word = formatSpokenPhrase(wordObj, true);
        if (!label) {
          speakGermanWithKaraoke(word, wordObj, gen, finish);
          return;
        }
        speakGermanUtterance(label, gen, () => {
          if (gen !== piperSpeakGen) return;
          setTimeout(() => {
            if (gen !== piperSpeakGen) return;
            speakGermanWithKaraoke(word, wordObj, gen, finish);
          }, 420);
        });
        return;
      }

      const phrase = formatSpokenPhrase(wordObj, includeArticle);
      speakGermanWithKaraoke(phrase, wordObj, gen, finish);
    }

    function setColumnHighlight(side) {
      highlightedSide = side;
      if (!currentRound) return;

      const applyColClass = (colEl, colSide, trait) => {
        const st = TRAIT_STYLES[trait];
        const active = highlightedSide === colSide ? ' col-intro-highlight' : '';
        // Always keep a soft trait wash so columns aren't flat gray.
        colEl.className = `wm-col rounded-2xl border-2 flex flex-col overflow-hidden transition-all duration-200 ${st.colTint}${active}`;
      };

      applyColClass(elColLeft, 'left', currentRound.leftTrait);
      applyColClass(elColRight, 'right', currentRound.rightTrait);

      if (!isChecked) {
        highlightRevealWord(side, side === 'left' ? currentRound.leftAnchor?.id : currentRound.rightAnchor?.id);
      }
    }

    function announceColumnAnchor(side, onComplete = null, runId = null) {
      if (!currentRound) return;
      const anchorWord = side === 'left' ? currentRound.leftAnchor : currentRound.rightAnchor;
      if (!anchorWord) {
        if (onComplete) onComplete();
        return;
      }

      // Header already shows trait + gloss; counting this as taught for future Learning sortables.
      markIntroduced(anchorWord.id);
      saveState();

      const activeRunId = runId !== null ? runId : ++anchorIntroRunId;
      initAudio();
      hideTranslationPopup();
      if (isChecked) {
        setColumnHighlight(null);
        highlightRevealWord(side, anchorWord.id);
      } else {
        setColumnHighlight(side);
      }

      speakGermanWord(anchorWord, true, () => {
        if (activeRunId !== anchorIntroRunId) return;
        setTimeout(() => {
          if (activeRunId !== anchorIntroRunId) return;
          setColumnHighlight(null);
          if (isChecked) clearRevealHighlights();
          if (onComplete) onComplete();
        }, 320);
      });
    }

    function playNewRoundAnchorIntro() {
      const runId = ++anchorIntroRunId;
      const sides = [];
      if (currentRound?.leftAnchor) sides.push('left');
      if (currentRound?.rightAnchor) sides.push('right');
      if (sides.length === 0) return;

      const showStep = (idx) => {
        if (runId !== anchorIntroRunId || activeScreen !== 'game' || isChecked) {
          setColumnHighlight(null);
          return;
        }
        if (idx >= sides.length) {
          setColumnHighlight(null);
          return;
        }

        announceColumnAnchor(sides[idx], () => {
          if (runId !== anchorIntroRunId || activeScreen !== 'game' || isChecked) return;
          setTimeout(() => showStep(idx + 1), 220);
        }, runId);
      };

      showStep(0);
    }

    function hideTranslationPopup() {
      if (transHideTimer) {
        clearTimeout(transHideTimer);
        transHideTimer = null;
      }
      clearDictKaraoke();
      const cb = transDismissCallback;
      transDismissCallback = null;
      elTransCard.classList.remove('scale-100', 'opacity-100');
      elTransCard.classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        elTransPopover.classList.add('hidden');
        if (cb) cb();
      }, 180);
    }

    /** True when the user has highlighted text (don't treat release as a dismiss tap). */
    function hasTextSelection() {
      const sel = window.getSelection?.();
      if (!sel || sel.isCollapsed) return false;
      return String(sel.toString() || '').trim().length > 0;
    }

    elTransPopover.addEventListener('click', () => {
      // Selecting/copying dictionary text ends with a click — keep the card open.
      if (hasTextSelection()) return;
      anchorIntroRunId++;
      revealSequenceRunId++;
      clearRevealHighlights();
      stopSpeech();
      hideTranslationPopup();
    });

    const LONG_PRESS_MS = 480;

    /**
     * Short vs long press (pointer events).
     * Long-press cancels short; movement cancels the pending long-press.
     */
    function bindShortLongPress(el, { onShort = null, onLong = null } = {}) {
      if (!el) return;
      let timer = null;
      let longFired = false;
      let startX = 0;
      let startY = 0;
      let activePointer = null;

      const clearTimer = () => {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      };

      el.addEventListener('contextmenu', (e) => e.preventDefault());

      el.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        activePointer = e.pointerId;
        longFired = false;
        startX = e.clientX;
        startY = e.clientY;
        clearTimer();
        if (onLong) {
          timer = setTimeout(() => {
            timer = null;
            longFired = true;
            onLong(e);
          }, LONG_PRESS_MS);
        }
      });

      el.addEventListener('pointermove', (e) => {
        if (activePointer !== e.pointerId || !timer) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (dx * dx + dy * dy > 36) clearTimer();
      });

      const endPress = (e) => {
        if (activePointer !== e.pointerId) return;
        const releasedEarly = !!timer;
        const wasLong = longFired;
        clearTimer();
        activePointer = null;
        longFired = false;
        // Long-press already handled — don't let a bubbled short hit the column.
        if (wasLong) {
          e.stopPropagation();
          return;
        }
        if (onShort && (releasedEarly || !onLong)) {
          onShort(e);
        }
      };

      el.addEventListener('pointerup', endPress);
      el.addEventListener('pointercancel', (e) => {
        if (activePointer !== e.pointerId) return;
        clearTimer();
        activePointer = null;
        longFired = false;
      });
    }

    function handleColumnShortPress(side) {
      if (!currentRound) return;
      if (isChecked) {
        revealSequenceRunId++;
        clearRevealHighlights();
        announceColumnAnchor(side);
        return;
      }
      const pending = currentUnsortedWord();
      if (pending) assignWord(pending.id, side);
    }

    /**
     * Tap anywhere on a column (except an already-sorted chip) to place the
     * current unsorted word. Chips stopPropagation and unassign themselves.
     * Use click (not pointer short-press) so empty scroll areas + headers work.
     */
    function bindColumnSurfacePress(colEl, side) {
      if (!colEl || colEl.dataset.pressBound === '1') return;
      colEl.dataset.pressBound = '1';
      colEl.style.touchAction = 'manipulation';
      colEl.style.cursor = 'pointer';
      colEl.addEventListener('click', (e) => {
        if (e.target.closest('[data-col-item-id]')) return;
        // Long-press on learning card sets this so we don't also place.
        if (colEl.dataset.suppressPlace === '1') {
          delete colEl.dataset.suppressPlace;
          return;
        }
        handleColumnShortPress(side);
      });
    }

    // Tap anywhere on a column (not a sorted chip) sorts the pending word into it.
    bindColumnSurfacePress(elColLeft, 'left');
    bindColumnSurfacePress(elColRight, 'right');

    /** Apply className without background transitions bleeding between words. */
    function snapClassName(el, className) {
      if (!el) return;
      el.style.transition = 'none';
      el.className = className;
      void el.offsetWidth;
      el.style.transition = '';
    }

    function restoreHighlightRoot(el) {
      if (!el) return;
      const normal = (el.dataset.normalClass || '')
        .replace(/\bword-announce-highlight\b/g, '')
        .replace(/\bwm-reveal-quiet\b/g, '')
        .replace(/\bwm-inv-\S+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (normal) {
        snapClassName(el, normal);
      } else {
        el.style.transition = 'none';
        [...el.classList].forEach((c) => {
          if (c.startsWith('wm-inv-') || c === 'word-announce-highlight' || c === 'wm-reveal-quiet') {
            el.classList.remove(c);
          }
        });
        void el.offsetWidth;
        el.style.transition = '';
      }
      const badgeEl = el.querySelector('[data-anchor-badge]');
      if (badgeEl && badgeEl.dataset.normalClass) {
        snapClassName(badgeEl, badgeEl.dataset.normalClass);
      }
      const wordEl = el.querySelector('[data-anchor-word]');
      if (wordEl && wordEl.dataset.normalClass) {
        snapClassName(wordEl, wordEl.dataset.normalClass);
      }
      const defEl = el.querySelector('[data-anchor-def]');
      if (defEl && defEl.dataset.normalClass) {
        snapClassName(defEl, defEl.dataset.normalClass);
        defEl.style.color = 'var(--muted)';
      }
      requestAnimationFrame(() => refreshWordScroll(el));
    }

    function stripAllInvertedRevealPaint() {
      document.querySelectorAll('[class*="wm-inv-"]').forEach((el) => {
        if (el.dataset.normalClass) {
          restoreHighlightRoot(el);
          return;
        }
        el.style.transition = 'none';
        [...el.classList].forEach((c) => {
          if (c.startsWith('wm-inv-') || c === 'word-announce-highlight') {
            el.classList.remove(c);
          }
        });
        void el.offsetWidth;
        el.style.transition = '';
      });
    }

    function clearRevealQuiets() {
      document.querySelectorAll('.wm-reveal-quiet').forEach((el) => {
        el.classList.remove('wm-reveal-quiet');
      });
    }

    function clearRevealHighlights() {
      highlightedWordId = null;
      const roots = new Set();
      if (highlightedRootEl) roots.add(highlightedRootEl);
      document.querySelectorAll('.word-announce-highlight').forEach((el) => roots.add(el));
      roots.forEach((el) => restoreHighlightRoot(el));
      highlightedRootEl = null;
      stripAllInvertedRevealPaint();
      clearRevealQuiets();
    }

    function quietOtherRevealCards(activeEl) {
      clearRevealQuiets();
      if (!isChecked) return;
      const cards = [
        ...document.querySelectorAll('[data-anchor-card]'),
        ...document.querySelectorAll('[data-col-item-id]')
      ];
      cards.forEach((el) => {
        if (el !== activeEl) el.classList.add('wm-reveal-quiet');
      });
    }

    /** Swap fill/text colors in place — keep border width, padding, radius intact. */
    function paintInvertedHighlight(el, invBgToken) {
      if (!el) return;
      el.style.transition = 'none';
      const inv = String(invBgToken || '')
        .split(/\s+/)
        .find((c) => c.startsWith('wm-inv-'));
      [...el.classList].forEach((c) => {
        if (
          c === 'wm-surface' ||
          c.startsWith('wm-card-') ||
          c.startsWith('wm-miss-') ||
          c.startsWith('wm-inv-') ||
          c === 'word-announce-highlight' ||
          c === 'wm-reveal-quiet'
        ) {
          el.classList.remove(c);
        }
      });
      if (inv) el.classList.add(inv);
      el.classList.add('word-announce-highlight');
      void el.offsetWidth;
      el.style.transition = '';
    }

    function highlightRevealWord(side, wordId) {
      clearRevealHighlights();
      highlightedWordId = wordId;
      if (!side || !wordId) return;

      const anchorObj = side === 'left' ? currentRound?.leftAnchor : currentRound?.rightAnchor;
      if (anchorObj && anchorObj.id === wordId) {
        const st = TRAIT_STYLES[anchorObj.trait];
        const headerEl = side === 'left' ? elColLeftHeader : elColRightHeader;
        const anchorCard = headerEl.querySelector('[data-anchor-card]');
        if (anchorCard) {
          if (!anchorCard.dataset.normalClass) {
            anchorCard.dataset.normalClass = anchorCard.className
              .replace(/\bword-announce-highlight\b/g, '')
              .replace(/\bwm-reveal-quiet\b/g, '')
              .replace(/\bwm-inv-\S+/g, '')
              .replace(/\s+/g, ' ')
              .trim();
          }
          highlightedRootEl = anchorCard;
          paintInvertedHighlight(anchorCard, st.cardInvertedBg);
          const badgeEl = anchorCard.querySelector('[data-anchor-badge]');
          if (badgeEl) {
            if (!badgeEl.dataset.normalClass) {
              badgeEl.dataset.normalClass = badgeEl.className;
            }
            snapClassName(badgeEl, `wm-anchor-pill ${st.badgeInvertedBg}`);
          }
          const wordEl = anchorCard.querySelector('[data-anchor-word]');
          if (wordEl) {
            if (!wordEl.dataset.normalClass) wordEl.dataset.normalClass = wordEl.className;
            wordEl.classList.add('text-white');
          }
          const defEl = anchorCard.querySelector('[data-anchor-def]');
          if (defEl) {
            defEl.style.color = 'rgba(255,255,255,0.92)';
          }
          quietOtherRevealCards(anchorCard);
          requestAnimationFrame(() => refreshWordScroll(anchorCard));
        }
        return;
      }

      const colContainer = side === 'left' ? elColLeftItems : elColRightItems;
      const itemEl = colContainer.querySelector(`[data-col-item-id="${CSS.escape(wordId)}"]`);
      const itemObj = currentRound?.items.find(i => i.id === wordId);
      if (itemEl && itemObj) {
        const st = TRAIT_STYLES[itemObj.trait];
        if (!itemEl.dataset.normalClass) {
          itemEl.dataset.normalClass = itemEl.className
            .replace(/\bword-announce-highlight\b/g, '')
            .replace(/\bwm-reveal-quiet\b/g, '')
            .replace(/\bwm-inv-\S+/g, '')
            .replace(/\banimate-slide-to-(left|right)\b/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        }
        highlightedRootEl = itemEl;
        paintInvertedHighlight(itemEl, st.cardInvertedBg);
        quietOtherRevealCards(itemEl);
        requestAnimationFrame(() => refreshWordScroll(itemEl));
        itemEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }


    function playRevealColumnSequence() {
      const runId = ++revealSequenceRunId;
      if (!currentRound) return;

      const steps = [];
      if (currentRound.leftAnchor) {
        steps.push({ side: 'left', wordObj: currentRound.leftAnchor });
      }
      currentRound.items
        .filter(item => item.assignedSide === 'left')
        .forEach(item => steps.push({ side: 'left', wordObj: item }));

      if (currentRound.rightAnchor) {
        steps.push({ side: 'right', wordObj: currentRound.rightAnchor });
      }
      currentRound.items
        .filter(item => item.assignedSide === 'right')
        .forEach(item => steps.push({ side: 'right', wordObj: item }));

      if (steps.length === 0) return;

      let stepGate = 0;

      const speakStepNow = (idx) => {
        if (runId !== revealSequenceRunId || activeScreen !== 'game' || !isChecked) {
          setColumnHighlight(null);
          clearRevealHighlights();
          return;
        }
        if (idx >= steps.length) {
          setColumnHighlight(null);
          clearRevealHighlights();
          return;
        }

        const myGate = ++stepGate;
        const { side, wordObj } = steps[idx];
        // Answer mode: highlight only the spoken word — not the whole column.
        setColumnHighlight(null);
        highlightRevealWord(side, wordObj.id);

        let advanced = false;
        const advance = () => {
          if (advanced) return;
          advanced = true;
          if (runId !== revealSequenceRunId || myGate !== stepGate) return;
          if (activeScreen !== 'game' || !isChecked) return;
          const nextStep = steps[idx + 1];
          const pauseMs = nextStep && nextStep.side !== side ? 520 : 320;
          setTimeout(() => {
            if (runId !== revealSequenceRunId || myGate !== stepGate) return;
            speakStepNow(idx + 1);
          }, pauseMs);
        };

        // Case / plurals: category label only for anchors + Learning words; later words bare.
        // Noun gender: keep article on every answer-mode readout.
        const speakCategory =
          isCategoryLabelDomain(wordObj.domain)
            ? (wordObj === currentRound.leftAnchor
              || wordObj === currentRound.rightAnchor
              || isLearningWord(wordObj))
            : true;
        speakGermanWord(wordObj, speakCategory, advance);
      };

      speakStepNow(0);
    }

    function setScreenVisible(el, on) {
      if (!el) return;
      el.classList.toggle('is-active', !!on);
      el.classList.toggle('hidden', !on); // keep for any legacy selectors
    }

    function showScreen(screenName) {
      activeScreen = screenName;
      anchorIntroRunId++;
      revealSequenceRunId++;
      setColumnHighlight(null);
      clearRevealHighlights();
      stopSpeech();
      hideTranslationPopup();
      setScreenVisible(elIntroScreen, false);
      setScreenVisible(elSprintScreen, false);
      setScreenVisible(elGameScreen, false);

      if (screenName === 'intro') {
        setScreenVisible(elIntroScreen, true);
        updateHeaderAndLegend();
      } else if (screenName === 'sprint') {
        setScreenVisible(elSprintScreen, true);
      } else if (screenName === 'game') {
        setScreenVisible(elGameScreen, true);
        startNewRound();
      }
    }

    function startNewRound() {
      isChecked = false;
      nextRoundTransitioning = false;
      resetAnswerModeLayout();
      anchorIntroRunId++;
      revealSequenceRunId++;
      setColumnHighlight(null);
      clearRevealHighlights();
      stopSpeech();
      hideTranslationPopup();
      currentRound = generateRound();
      renderBoard();
      // Column headers reveal trait + gloss immediately — teach before any sortable use.
      if (currentRound?.leftAnchor) markIntroduced(currentRound.leftAnchor.id);
      if (currentRound?.rightAnchor) markIntroduced(currentRound.rightAnchor.id);
      saveState();
      updateHeaderAndLegend();
      // Defer TTS until the game screen has painted (Safari freezes on sync unlock).
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (activeScreen !== 'game' || isChecked) return;
          playNewRoundAnchorIntro();
        }, 0);
      });
    }

    /** Match left/right learning footers to the taller of the two. */
    function equalizeColumnAnchorFooters() {
      const left = elColLeftHeader;
      const right = elColRightHeader;
      if (!left || !right) return;

      left.style.minHeight = '';
      right.style.minHeight = '';
      const leftDef = left.querySelector('[data-anchor-def]');
      const rightDef = right.querySelector('[data-anchor-def]');
      if (leftDef) leftDef.style.minHeight = '';
      if (rightDef) rightDef.style.minHeight = '';

      // Force layout, then pad defs and footers to the max of either side.
      void left.offsetHeight;
      const defH = Math.max(leftDef?.offsetHeight || 0, rightDef?.offsetHeight || 0);
      if (leftDef && rightDef && defH > 0) {
        leftDef.style.minHeight = `${defH}px`;
        rightDef.style.minHeight = `${defH}px`;
      }

      const footerH = Math.max(left.offsetHeight, right.offsetHeight);
      if (footerH > 0) {
        left.style.minHeight = `${footerH}px`;
        right.style.minHeight = `${footerH}px`;
      }
    }

    function finalizeColumnHeaders() {
      // Double rAF: marquee wrap mutates DOM; equalize after that layout settles.
      requestAnimationFrame(() => {
        refreshWordScroll(elColLeftHeader);
        refreshWordScroll(elColRightHeader);
        requestAnimationFrame(() => equalizeColumnAnchorFooters());
      });
    }

    function renderBoard() {
      renderColumnHeader(elColLeftHeader, currentRound.leftTrait, currentRound.leftAnchor, 'left');
      renderColumnHeader(elColRightHeader, currentRound.rightTrait, currentRound.rightAnchor, 'right');
      finalizeColumnHeaders();

      setColumnHighlight(null);

      renderColumnItems(elColLeftItems, 'left');
      renderColumnItems(elColRightItems, 'right');
      renderUnsortedQueue();
      updatePrimaryButtonState();
    }

    function currentUnsortedWord() {
      if (!currentRound || isChecked) return null;
      return currentRound.items.find(item => item.assignedSide === null) || null;
    }

    function renderColumnHeader(containerEl, trait, anchorWord, side) {
      const st = TRAIT_STYLES[trait];
      const placing = !!currentUnsortedWord();
      const edgeClass = answerLayoutActive ? 'border-b rounded-t-2xl' : 'border-t rounded-b-2xl';
      containerEl.className = `p-2.5 ${edgeClass} shrink-0 cursor-pointer select-none transition-colors flex flex-col ${st.headerBg}`;
      containerEl.setAttribute('role', 'button');
      containerEl.setAttribute(
        'aria-label',
        placing ? `Place word in ${st.subLabel} column` : `${st.subLabel} column anchor`
      );

      const defText = anchorWord ? dictionaryDefinition(anchorWord) : '';
      const normalCardClass = 'wm-surface wm-anchor-card rounded-xl px-2.5 py-2.5 active:scale-[0.98]';
      const normalBadgeClass = `wm-anchor-pill ${st.badgeBg}`;
      const normalWordClass = 'wm-display wm-anchor-word wm-word-scroll';
      const normalDefClass = 'wm-anchor-def';
      const normalLabelClass = `text-[11px] font-bold tracking-tight ${st.titleText} mt-1.5`;
      const pluralsDomain = appState.domain === 'plurals';
      // Plurals: ending is color-coded on the word (no trait pill). Other domains keep the pill.
      const badgeHtml = pluralsDomain
        ? ''
        : `<span data-anchor-badge="true" data-normal-class="${normalBadgeClass}" class="${normalBadgeClass}">${trait}</span>`;
      const anchorWordHtml = formatDisplayWordHtml(anchorWord, { showEnding: pluralsDomain });

      // Bigger learning card: pill alone, then word, then gloss
      containerEl.style.minHeight = '';
      containerEl.innerHTML = `
        ${anchorWord ? `
          <div data-anchor-card="true" data-normal-class="${normalCardClass}" class="${normalCardClass}">
            ${badgeHtml}
            <span data-anchor-word="true" data-normal-class="${normalWordClass}" class="${normalWordClass}">${anchorWordHtml}</span>
            <p data-anchor-def="true" data-normal-class="${normalDefClass}" class="${normalDefClass}" style="color:var(--muted)">${defText}</p>
          </div>
        ` : ''}
        <span class="${normalLabelClass}">${st.subLabel}</span>
      `;

      // Short-press on the learning card / header places the pending word (column click).
      // Long-press → dictionary (and suppress the following click so we don't also place).
      containerEl.onclick = null;
      const anchorCard = containerEl.querySelector('[data-anchor-card]');
      if (anchorCard && anchorWord) {
        anchorCard.style.touchAction = 'manipulation';
        const colEl = side === 'left' ? elColLeft : elColRight;
        bindShortLongPress(anchorCard, {
          onLong: (e) => {
            e.stopPropagation();
            if (colEl) {
              colEl.dataset.suppressPlace = '1';
              setTimeout(() => {
                if (colEl.dataset.suppressPlace === '1') delete colEl.dataset.suppressPlace;
              }, 600);
            }
            revealSequenceRunId++;
            clearRevealHighlights();
            showTranslationPopup(anchorWord, true);
          }
        });
      }
    }

    function suppressColumnPlaceFromChip(chipEl) {
      const colEl = chipEl?.closest?.('.wm-col');
      if (!colEl) return;
      // Chip removal on pointerup lets the following click hit the column and
      // re-place the word — block that one place.
      colEl.dataset.suppressPlace = '1';
      setTimeout(() => {
        if (colEl.dataset.suppressPlace === '1') delete colEl.dataset.suppressPlace;
      }, 450);
    }

    function bindColumnItemClick(el, itemObj) {
      el.style.touchAction = 'manipulation';
      el.style.userSelect = 'none';
      el.style.webkitUserSelect = 'none';
      el.style.position = 'relative';
      el.style.zIndex = '3';

      // Keep column-level sort from seeing presses on chips (bubble steal).
      el.addEventListener('pointerdown', (e) => e.stopPropagation());
      el.addEventListener('pointerup', (e) => e.stopPropagation());
      el.addEventListener('pointercancel', (e) => e.stopPropagation());

      let suppressClick = false;
      bindShortLongPress(el, {
        onShort: (e) => {
          e.stopPropagation();
          suppressClick = true;
          if (isChecked) {
            revealSequenceRunId++;
            setColumnHighlight(null);
            clearRevealHighlights();
            showTranslationPopup(itemObj, true);
            return;
          }
          suppressColumnPlaceFromChip(el);
          unassignWord(itemObj.id);
        },
        onLong: (e) => {
          e.stopPropagation();
          suppressClick = true;
          suppressColumnPlaceFromChip(el);
          revealSequenceRunId++;
          setColumnHighlight(null);
          clearRevealHighlights();
          showTranslationPopup(itemObj, !!isChecked);
        }
      });

      // Click fallback — recovers unassign if pointer short-press was canceled mid-gesture.
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (suppressClick) {
          suppressClick = false;
          return;
        }
        if (isChecked) {
          revealSequenceRunId++;
          setColumnHighlight(null);
          clearRevealHighlights();
          showTranslationPopup(itemObj, true);
          return;
        }
        suppressColumnPlaceFromChip(el);
        unassignWord(itemObj.id);
      });
    }

    /** Append one placed chip without rebuilding sibling chips (avoids blink). */
    function appendPlacedColumnItem(containerEl, item, side, { animate = false } = {}) {
      const el = document.createElement('div');
      el.dataset.colItemId = item.id;
      el.dataset.colSide = side;
      el.className = `word-row-spring cursor-pointer wm-surface rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-1.5 min-w-0${animate ? ' slot-enter' : ''}`;
      el.title = '';
      el.innerHTML = `<span class="text-sm font-bold wm-word-scroll flex-1">${formatSortingWordHtml(item, { columnTrait: columnTraitForSide(side) })}</span>`;
      bindColumnItemClick(el, item);
      containerEl.appendChild(el);
      requestAnimationFrame(() => refreshWordScroll(el));
      return el;
    }

    function renderColumnItems(containerEl, side, { enterId = null } = {}) {
      const assigned = currentRound.items.filter(item => item.assignedSide === side);

      if (assigned.length === 0) {
        containerEl.innerHTML = '';
        return;
      }

      containerEl.innerHTML = assigned.map(item => {
        if (!isChecked) {
          const enterClass = enterId && item.id === enterId ? ' slot-enter' : '';
          const colTrait = columnTraitForSide(side);
          return `
            <div data-col-item-id="${item.id}" data-col-side="${side}" class="word-row-spring cursor-pointer wm-surface rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-1.5 min-w-0${enterClass}">
              <span class="text-sm font-bold wm-word-scroll flex-1">${formatSortingWordHtml(item, { columnTrait: colTrait })}</span>
            </div>
          `;
        } else {
          const trueStyle = TRAIT_STYLES[item.trait];
          const wasWrong = !!item.movedFromSide;
          const borderThickness = item.isCorrect ? 'border' : 'border-2';

          const animClass = wasWrong
            ? (side === 'right' ? 'animate-slide-to-right' : 'animate-slide-to-left')
            : '';

          const toneClass = wasWrong ? trueStyle.cardMissBg : trueStyle.cardRevealBg;
          const normalRevealClass = `cursor-pointer ${borderThickness} rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 min-w-0 ${toneClass}`;
          const missMark = wasWrong
            ? '<span class="wm-miss-mark" aria-label="Incorrect"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 3l6 6M9 3L3 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span>'
            : '';

          return `
            <div data-col-item-id="${item.id}" data-col-side="${side}" data-was-wrong="${wasWrong ? '1' : '0'}" data-normal-class="${normalRevealClass}" class="${normalRevealClass} ${animClass}">
              <span class="text-sm font-extrabold wm-word-scroll flex-1">${formatDisplayWordHtml(item, { showEnding: true, showArticle: true })}</span>${missMark}
            </div>
          `;
        }
      }).join('');

      containerEl.querySelectorAll('[data-col-item-id]').forEach(el => {
        const itemId = el.dataset.colItemId;
        const itemObj = currentRound.items.find(i => i.id === itemId);
        bindColumnItemClick(el, itemObj);
      });
      requestAnimationFrame(() => refreshWordScroll(containerEl));
    }

    function renderUnsortedQueue() {
      const unsorted = currentRound.items.filter(item => item.assignedSide === null);

      if (isChecked) {
        elUnsortedSection.classList.add('hidden');
        elUnsortedQueue.innerHTML = '';
        refreshColumnHeaderChrome();
        return;
      }

      elUnsortedSection.classList.remove('hidden');

      if (unsorted.length === 0) {
        elUnsortedSection.classList.add('hidden');
        elUnsortedQueue.innerHTML = '';
        refreshColumnHeaderChrome();
        return;
      }

      document.getElementById('unsorted-label').textContent = `Remaining: ${unsorted.length}`;
      const currentItem = unsorted[0];

      // Sort card: bare lemma only — article / plural ending appear after placing.
      elUnsortedQueue.innerHTML = `
        <div data-word-id="${currentItem.id}" class="wm-word-card rounded-2xl px-3 py-3 text-center select-none" style="touch-action:manipulation;-webkit-user-select:none;user-select:none">
          <p class="text-xl font-semibold wm-word-scroll">${formatDisplayWord(currentItem)}</p>
        </div>
      `;

      const cardEl = elUnsortedQueue.querySelector('[data-word-id]');
      if (cardEl) {
        bindShortLongPress(cardEl, {
          onLong: () => {
            showTranslationPopup(currentItem, false);
          }
        });
      }
      requestAnimationFrame(() => refreshWordScroll(elUnsortedQueue));

      refreshColumnHeaderChrome();
    }

    /** Update place-vs-tap aria only — avoid rebuilding learning footers (blinks). */
    function refreshColumnHeaderChrome() {
      if (!currentRound) return;
      const placing = !!currentUnsortedWord();
      const pairs = [
        [elColLeftHeader, currentRound.leftTrait],
        [elColRightHeader, currentRound.rightTrait]
      ];
      pairs.forEach(([el, trait]) => {
        if (!el || !trait) return;
        const st = TRAIT_STYLES[trait];
        el.setAttribute(
          'aria-label',
          placing ? `Place word in ${st.subLabel} column` : `${st.subLabel} column anchor`
        );
      });
    }

    function assignWord(wordId, side) {
      if (isChecked) return;
      const item = currentRound.items.find(w => w.id === wordId);
      if (!item) return;

      anchorIntroRunId++;
      setColumnHighlight(null);
      hideTranslationPopup();

      item.assignedSide = side;
      playSound('sort');

      const containerEl = side === 'left' ? elColLeftItems : elColRightItems;
      appendPlacedColumnItem(containerEl, item, side, { animate: true });
      renderUnsortedQueue();
      updatePrimaryButtonState();
      syncReadyLayout();
    }

    function unassignWord(wordId) {
      if (isChecked) return;
      const item = currentRound.items.find(w => w.id === wordId);
      if (!item) return;

      item.assignedSide = null;
      playSound('sort');

      const el = document.querySelector(`[data-col-item-id="${CSS.escape(wordId)}"]`);
      if (el) el.remove();
      renderUnsortedQueue();
      updatePrimaryButtonState();
      syncReadyLayout();
    }

    function updatePrimaryButtonState() {
      const remaining = currentRound.items.filter(w => w.assignedSide === null).length;

      if (isChecked) {
        elPrimaryBtn.classList.remove('hidden');
        elPrimaryBtn.disabled = false;
        elPrimaryBtn.className = 'w-full py-3.5 px-4 wm-btn-primary active:scale-[0.99] text-sm transition flex items-center justify-center whitespace-nowrap';
        elPrimaryLabel.className = 'inline-flex items-center justify-center gap-1.5 whitespace-nowrap';
        elPrimaryLabel.innerHTML = '<span>Next Round</span><svg class="w-4 h-4 shrink-0 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
        return;
      }

      if (remaining > 0) {
        elPrimaryBtn.classList.add('hidden');
        elPrimaryBtn.disabled = true;
      } else {
        elPrimaryBtn.classList.remove('hidden');
        elPrimaryBtn.disabled = false;
        elPrimaryBtn.className = 'w-full py-3.5 px-4 wm-btn-ok active:scale-[0.99] text-sm transition flex items-center justify-center gap-1.5 whitespace-nowrap';
        elPrimaryLabel.className = 'whitespace-nowrap';
        elPrimaryLabel.textContent = 'Check Answers';
      }
    }

    // =========================================================================
    // 6. CHECK ANSWERS, ANCHOR PROMOTION, AUTO-MOVE & SYMMETRIC SCORING
    // =========================================================================

    function columnLayoutParts() {
      return [
        { col: elColLeft, items: elColLeftItems, header: elColLeftHeader },
        { col: elColRight, items: elColRightItems, header: elColRightHeader }
      ];
    }

    /** FLIP learning anchors from column footers up to the top (still visible). */
    function enterAnswerModeLayout() {
      if (answerLayoutActive) return;
      answerLayoutActive = true;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const parts = columnLayoutParts();

      // Only FLIP the header — transforming the items container desyncs chip hit-targets.
      const snapshots = parts.map(({ header }) => ({
        header,
        headerTop: header.getBoundingClientRect().top
      }));

      parts.forEach(({ col, items, header }) => {
        col.insertBefore(header, items);
        header.classList.remove('border-t', 'rounded-b-2xl');
        header.classList.add('border-b', 'rounded-t-2xl');
        items.style.transform = '';
        items.style.transition = '';
      });

      if (reduceMotion) {
        requestAnimationFrame(() => equalizeColumnAnchorFooters());
        return;
      }

      snapshots.forEach(({ header, headerTop }) => {
        const headerDy = headerTop - header.getBoundingClientRect().top;
        header.style.transition = 'none';
        header.style.transform = `translateY(${headerDy}px)`;
      });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          snapshots.forEach(({ header }) => {
            header.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
            header.style.transform = '';
          });
          setTimeout(() => {
            snapshots.forEach(({ header }) => {
              header.style.transition = '';
              header.style.transform = '';
            });
            equalizeColumnAnchorFooters();
          }, 520);
        });
      });
    }

    /** Instant restore (new round / exit animation cleanup). */
    function resetAnswerModeLayout() {
      columnLayoutParts().forEach(({ col, items, header }) => {
        if (header.parentElement === col) col.appendChild(header);
        header.classList.remove('border-b', 'rounded-t-2xl');
        header.classList.add('border-t', 'rounded-b-2xl');
        header.style.transform = '';
        header.style.transition = '';
        items.style.transform = '';
        items.style.transition = '';
      });
      answerLayoutActive = false;
    }

    /** FLIP learning anchors back down when a word returns to the pile. */
    function exitReadyModeLayout() {
      if (!answerLayoutActive || isChecked) return;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const parts = columnLayoutParts();

      const snapshots = parts.map(({ header }) => ({
        header,
        headerTop: header.getBoundingClientRect().top
      }));

      parts.forEach(({ col, items, header }) => {
        col.appendChild(header);
        header.classList.remove('border-b', 'rounded-t-2xl');
        header.classList.add('border-t', 'rounded-b-2xl');
        items.style.transform = '';
        items.style.transition = '';
      });
      answerLayoutActive = false;

      if (reduceMotion) {
        requestAnimationFrame(() => equalizeColumnAnchorFooters());
        return;
      }

      snapshots.forEach(({ header, headerTop }) => {
        const headerDy = headerTop - header.getBoundingClientRect().top;
        header.style.transition = 'none';
        header.style.transform = `translateY(${headerDy}px)`;
      });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          snapshots.forEach(({ header }) => {
            header.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
            header.style.transform = '';
          });
          setTimeout(() => {
            snapshots.forEach(({ header }) => {
              header.style.transition = '';
              header.style.transform = '';
            });
            equalizeColumnAnchorFooters();
          }, 520);
        });
      });
    }

    /** Slide learning words up when Check Answers appears; down if a chip returns. */
    function syncReadyLayout() {
      if (isChecked) return;
      if (!currentRound) return;
      const allPlaced = !currentUnsortedWord();
      if (allPlaced) enterAnswerModeLayout();
      else exitReadyModeLayout();
    }

    function beginNextRoundTransition() {
      if (nextRoundTransitioning) return;
      nextRoundTransitioning = true;
      revealSequenceRunId++;
      stopSpeech();
      setColumnHighlight(null);
      clearRevealHighlights();
      hideTranslationPopup();
      if (elPrimaryBtn) elPrimaryBtn.disabled = true;

      const grid = document.getElementById('columns-grid');
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        nextRoundTransitioning = false;
        if (grid) {
          grid.classList.remove('wm-board-exit-up');
          grid.removeEventListener('animationend', onEnd);
        }
        resetAnswerModeLayout();
        startNewRound();
        if (grid) {
          grid.classList.remove('wm-board-enter');
          void grid.offsetWidth;
          grid.classList.add('wm-board-enter');
          const clearEnter = (ev) => {
            if (ev && ev.target !== grid) return;
            grid.classList.remove('wm-board-enter');
            grid.removeEventListener('animationend', clearEnter);
          };
          grid.addEventListener('animationend', clearEnter);
          setTimeout(() => clearEnter({ target: grid }), 500);
        }
      };

      const onEnd = (ev) => {
        if (ev.target !== grid) return;
        finish();
      };

      if (!grid || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        finish();
        return;
      }

      grid.classList.add('wm-board-exit-up');
      grid.addEventListener('animationend', onEnd);
      setTimeout(finish, 480);
    }

    function handlePrimaryButtonClick() {
      initAudio();

      if (isChecked) {
        beginNextRoundTransition();
        return;
      }

      const remaining = currentRound.items.filter(w => w.assignedSide === null).length;
      if (remaining > 0) return;

      isChecked = true;
      let correctCount = 0;
      let leftCorrectCount = 0;
      let rightCorrectCount = 0;

      const sess = ensureSessionStats();

      currentRound.items.forEach(item => {
        const expectedSide = item.trait === currentRound.leftTrait ? 'left' : 'right';
        item.isCorrect = item.assignedSide === expectedSide;

        const prevScore = appState.scores[item.id] ?? 0;
        if (item.isCorrect) {
          correctCount++;
          if (expectedSide === 'left') leftCorrectCount++;
          else rightCorrectCount++;
          item.movedFromSide = null;
          const next = Math.min(MAX_SCORE, prevScore + 1);
          appState.scores[item.id] = next;
          sess.sortsCorrect += 1;
          if (prevScore < 3 && next >= 3) sess.graduatedIds.add(item.id);
        } else {
          item.movedFromSide = item.assignedSide;
          item.assignedSide = expectedSide;
          const next = Math.max(0, prevScore - 1);
          appState.scores[item.id] = next;
          sess.sortsWrong += 1;
          if (prevScore >= 3 && next < 3) sess.demotedIds.add(item.id);
          appState.lastMissAt[item.id] = Date.now();
          if (!sess.mistakes.some(m => m.id === item.id)) {
            sess.mistakes.push({
              id: item.id,
              word: item.word,
              trait: item.trait,
              genderArticle: item.genderArticle || null
            });
          }
        }
      });

      // Promote column anchors (+1 toward Learned) whenever you successfully match words to them
      if (currentRound.leftAnchor && leftCorrectCount > 0) {
        const aPrev = appState.scores[currentRound.leftAnchor.id] ?? 0;
        if (aPrev < 3) {
          const next = Math.min(3, aPrev + 1);
          appState.scores[currentRound.leftAnchor.id] = next;
          if (aPrev < 3 && next >= 3) sess.graduatedIds.add(currentRound.leftAnchor.id);
        }
      }
      if (currentRound.rightAnchor && rightCorrectCount > 0) {
        const aPrev = appState.scores[currentRound.rightAnchor.id] ?? 0;
        if (aPrev < 3) {
          const next = Math.min(3, aPrev + 1);
          appState.scores[currentRound.rightAnchor.id] = next;
          if (aPrev < 3 && next >= 3) sess.graduatedIds.add(currentRound.rightAnchor.id);
        }
      }

      const allRight = correctCount === currentRound.items.length;
      sess.rounds += 1;
      if (allRight) sess.perfectRounds += 1;

      if (allRight) {
        appState.streak += 1;
        appState.bestStreak = Math.max(appState.bestStreak, appState.streak);
        playSound('correct');
      } else {
        appState.streak = 0;
        playSound('wrong');
      }
      sess.peakStreak = Math.max(sess.peakStreak, appState.streak);

      autoAdvanceGraduatedPacks(appState.domain);
      saveState();

      renderColumnItems(elColLeftItems, 'left');
      renderColumnItems(elColRightItems, 'right');
      renderUnsortedQueue();
      updatePrimaryButtonState();
      updateHeaderAndLegend();

      playRevealColumnSequence();
    }

    // =========================================================================
    // 7. HEADER, INTRO UI & WORD BANK MODAL
    // =========================================================================
    function updateHeaderAndLegend() {
      const domain = appState.domain;
      const levels = LEVEL_DEFINITIONS[domain] || [];
      const packSet = getSelectedPackSet(domain);

      const packGrid = document.getElementById('pack-grid');
      packGrid.className = levels.length <= 2
        ? 'wm-pack-grid grid grid-cols-2 gap-1.5 p-1 rounded-xl'
        : 'wm-pack-grid grid grid-cols-3 gap-1.5 max-h-[112px] overflow-y-auto thin-scroll p-1 rounded-xl';

      packGrid.innerHTML = levels.map(lvl => {
        const stats = getLevelStats(domain, lvl.id);
        const isSelected = packSet.has(lvl.id);
        const badgeText = stats.graduated ? '✓' : `${stats.learnedOrBetter}/${stats.total}`;
        const packPct = Math.round(stats.ratio * 100);

        return `
          <button type="button" data-pack-id="${lvl.id}" class="p-1.5 rounded-xl border text-left transition flex flex-col gap-1 ${
            isSelected ? 'is-on' : ''
          }" style="${isSelected
            ? 'background:var(--signal-soft);border-color:var(--signal);color:var(--signal)'
            : 'background:var(--surface);border-color:var(--line);color:var(--ink)'}">
            <div class="w-full flex items-center justify-between gap-1">
              <span class="text-[11px] font-bold truncate">${lvl.title}</span>
              <span class="text-[9px] wm-mono px-1 py-0.5 rounded shrink-0" style="${
                stats.graduated
                  ? 'background:var(--ok);color:#fff'
                  : (isSelected ? 'background:var(--surface);color:var(--signal)' : 'background:var(--surface-2);color:var(--muted)')
              }">${badgeText}</span>
            </div>
            <div class="w-full h-1 rounded-full overflow-hidden" style="background:${isSelected ? 'rgba(47,111,237,0.25)' : 'var(--surface-2)'}">
              <div class="h-full rounded-full transition-all duration-300" style="width:${packPct}%;background:var(--ok)"></div>
            </div>
          </button>
        `;
      }).join('');

      packGrid.querySelectorAll('[data-pack-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = Number(btn.dataset.packId);
          const nextSet = getSelectedPackSet(domain);
          if (nextSet.has(id)) {
            if (nextSet.size > 1) {
              nextSet.delete(id);
            }
          } else {
            nextSet.add(id);
          }
          appState.selectedPacks[domain] = [...nextSet].sort((a, b) => a - b);
          saveState();
          updateHeaderAndLegend();
        });
      });

      document.getElementById('pack-selection-summary').textContent = `${packSet.size}/${levels.length} Packs`;

      const activePool = getActiveWorkingPool(domain);
      const lockedCompoundsCount = VOCAB_DATA.filter(
        w => w.domain === domain && packSet.has(w.level) && !isCompoundUnlocked(w)
      ).length;

      let mCount = 0, lCount = 0, nCount = 0;
      activePool.forEach(w => {
        const t = getTier(appState.scores[w.id]);
        if (t === 'mastered') mCount++;
        else if (t === 'learned') lCount++;
        else nCount++;
      });

      const activeTotal = activePool.length;
      const activeLearnedPct = activeTotal > 0 ? Math.round(((mCount + lCount) / activeTotal) * 100) : 0;
      const gameProgressBar = document.getElementById('game-progress-bar');
      const gameProgressLabel = document.getElementById('game-progress-label');
      if (gameProgressBar) gameProgressBar.style.width = `${activeLearnedPct}%`;
      if (gameProgressLabel) gameProgressLabel.textContent = `${mCount + lCount}/${activeTotal} (${activeLearnedPct}%)`;

      const streakText = sessionStats && sessionStats.rounds > 0
        ? `Streak ${appState.streak} · Peak ${sessionStats.peakStreak} · Best ${appState.bestStreak}`
        : `Streak ${appState.streak} · Best ${appState.bestStreak}`;
      document.getElementById('combo-badge').textContent = streakText;
      document.getElementById('intro-streak-badge').textContent =
        `Streak ${appState.streak} · Best ${appState.bestStreak}`;
      document.getElementById('tier-summary-pill').textContent = `${mCount}/${lCount}/${nCount}`;
      document.getElementById('intro-pool-breakdown').textContent = lockedCompoundsCount > 0
        ? `${mCount}M · ${lCount}L · ${nCount} New (${lockedCompoundsCount} compounds gated)`
        : `${mCount} Mastered · ${lCount} Learned · ${nCount} New`;

      const needsSprint = needsBootstrapSprint(domain);
      document.getElementById('btn-start-label').textContent = needsSprint
        ? 'Sprint → Sort'
        : 'Start Game';

      ['nouns', 'case', 'plurals'].forEach(dom => {
        const btn = document.getElementById(`domain-${dom}`);
        if (!btn) return;
        btn.className = `domain-btn py-2 px-2.5 rounded-xl border text-left transition flex flex-col justify-between${
          appState.domain === dom ? ' is-on' : ''
        }`;
      });

      const sndBtn = document.getElementById('toggle-sound');
      sndBtn.className = `audio-toggle wm-chip px-2.5 py-1.5 text-xs flex items-center gap-1${
        appState.soundEnabled ? ' is-on' : ''
      }`;
      document.getElementById('sound-icon').textContent = appState.soundEnabled ? '🔊' : '🔇';

      const spkBtn = document.getElementById('toggle-speech');
      spkBtn.className = `audio-toggle wm-chip px-2.5 py-1.5 text-xs flex items-center gap-1${
        appState.speechEnabled ? ' is-on' : ''
      }`;
    }

    function applyWortTheme(pref) {
      try {
        localStorage.setItem('schnapp-theme', pref);
      } catch (_) {}
      const dark =
        pref === 'dark' ||
        (pref !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (dark) document.documentElement.setAttribute('data-theme', 'dark');
      else document.documentElement.removeAttribute('data-theme');
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', dark ? '#12151a' : '#f4f6f8');
      document.querySelectorAll('[data-theme-choice]').forEach((btn) => {
        const on = btn.dataset.themeChoice === pref;
        btn.setAttribute('aria-pressed', String(on));
        btn.style.background = on ? 'var(--signal-soft)' : 'transparent';
        btn.style.color = on ? 'var(--signal)' : 'var(--muted)';
      });
    }

    // Event bindings
    elPrimaryBtn.addEventListener('click', handlePrimaryButtonClick);

    document.getElementById('btn-start-game').addEventListener('click', () => {
      // Navigate first; then light audio prime while still in the tap gesture.
      resetSessionStats();
      try {
        if (needsBootstrapSprint(appState.domain)) {
          startBootstrapSprint();
        } else {
          showScreen('game');
        }
      } catch (err) {
        console.warn('[wort2] start navigation failed', err);
      }
      try {
        initAudio(); // in-gesture unlock for Safari / iOS
      } catch (err) {
        console.warn('[wort2] start audio failed', err);
      }
      if (appState.speechEnabled) {
        setTimeout(() => warmPiperVoice(), 280);
      }
    });

    document.getElementById('btn-bootstrap-intro').addEventListener('click', () => {
      resetSessionStats();
      try {
        startBootstrapSprint();
      } catch (err) {
        console.warn('[wort2] sprint navigation failed', err);
      }
      try {
        initAudio();
      } catch (err) {
        console.warn('[wort2] sprint audio failed', err);
      }
      if (appState.speechEnabled) {
        setTimeout(() => warmPiperVoice(), 280);
      }
    });

    document.getElementById('btn-packs-all').addEventListener('click', () => {
      const levels = LEVEL_DEFINITIONS[appState.domain] || [];
      appState.selectedPacks[appState.domain] = levels.map(l => l.id);
      saveState();
      updateHeaderAndLegend();
    });

    document.getElementById('btn-packs-none').addEventListener('click', () => {
      appState.selectedPacks[appState.domain] = [1];
      saveState();
      updateHeaderAndLegend();
    });

    document.getElementById('btn-back-setup').addEventListener('click', () => {
      leavePlayToIntro({ showReport: true });
    });

    document.getElementById('btn-sprint-exit').addEventListener('click', () => {
      sprintState = null;
      leavePlayToIntro({ showReport: true });
    });

    document.getElementById('btn-close-session-report')?.addEventListener('click', () => {
      closeSessionReport();
    });
    document.getElementById('btn-dismiss-session-report')?.addEventListener('click', () => {
      closeSessionReport();
    });
    document.getElementById('btn-open-session-report')?.addEventListener('click', () => {
      if (lastSessionReport) openSessionReport(lastSessionReport);
    });
    document.getElementById('session-report-modal')?.addEventListener('click', (e) => {
      if (hasTextSelection()) return;
      if (e.target.id === 'session-report-modal') closeSessionReport();
    });

    document.getElementById('btn-sprint-skip-all').addEventListener('click', () => {
      initAudio();
      sprintState = null;
      showScreen('game');
    });

    document.getElementById('btn-sprint-dont-know').addEventListener('click', () => {
      handleSprintChoice(null);
    });

    ['nouns', 'case', 'plurals'].forEach(dom => {
      document.getElementById(`domain-${dom}`)?.addEventListener('click', () => {
        if (appState.domain === dom) return;
        appState.domain = dom;
        bankTraitFilter = 'all';
        bankPackFilter = 'all';
        bankOpenId = null;
        saveState();
        updateHeaderAndLegend();
        if (elBankModal && !elBankModal.classList.contains('hidden')) {
          syncBankPackOptions();
          syncBankTraitFilterButtons();
          renderWordBank();
        }
      });
    });

    document.getElementById('toggle-sound').addEventListener('click', () => {
      appState.soundEnabled = !appState.soundEnabled;
      if (appState.soundEnabled) playSound('sort');
      saveState();
      updateHeaderAndLegend();
    });

    document.getElementById('toggle-speech').addEventListener('click', () => {
      appState.speechEnabled = !appState.speechEnabled;
      if (appState.speechEnabled) {
        initAudio();
        warmPiperVoice();
      } else {
        stopSpeech();
      }
      saveState();
      updateHeaderAndLegend();
    });

    // Word Bank Modal
    const elBankModal = document.getElementById('word-bank-modal');
    const elBankList = document.getElementById('word-bank-list');
    const elConfirmToast = document.getElementById('confirm-toast');
    const elBankSearch = document.getElementById('bank-search');
    const elBankPackFilter = document.getElementById('bank-pack-filter');
    const elBankSort = document.getElementById('bank-sort');
    const elBankTraitFilters = document.getElementById('bank-trait-filters');
    const elBankCountLine = document.getElementById('bank-count-line');

    function formatMissAge(ts) {
      if (!ts) return '';
      const mins = Math.round((Date.now() - ts) / 60000);
      if (mins < 1) return 'just now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.round(mins / 60);
      if (hrs < 48) return `${hrs}h ago`;
      const days = Math.round(hrs / 24);
      return `${days}d ago`;
    }

    function escapeBankHtml(s) {
      return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function syncBankTraitFilterButtons() {
      if (!elBankTraitFilters) return;
      const traits = DOMAIN_CONFIG[appState.domain]?.traits || [];
      if (!traits.includes(bankTraitFilter) && bankTraitFilter !== 'all') {
        bankTraitFilter = 'all';
      }
      elBankTraitFilters.innerHTML = [
        `<button type="button" data-bank-trait="all" class="bank-filter-btn${bankTraitFilter === 'all' ? ' is-on' : ''} px-2.5 py-1 rounded-lg">Any trait</button>`,
        ...traits.map(t =>
          `<button type="button" data-bank-trait="${t}" class="bank-filter-btn${bankTraitFilter === t ? ' is-on' : ''} px-2.5 py-1 rounded-lg">${t}</button>`
        )
      ].join('');
      elBankTraitFilters.querySelectorAll('[data-bank-trait]').forEach(btn => {
        btn.addEventListener('click', () => {
          bankTraitFilter = btn.dataset.bankTrait;
          bankOpenId = null;
          bankRenderLimit = BANK_PAGE_SIZE;
          syncBankTraitFilterButtons();
          renderWordBank();
        });
      });
    }

    function syncBankPackOptions() {
      if (!elBankPackFilter) return;
      const levels = LEVEL_DEFINITIONS[appState.domain] || [];
      const prev = bankPackFilter;
      elBankPackFilter.innerHTML =
        `<option value="all">All packs</option>` +
        levels.map(l => `<option value="${l.id}">${escapeBankHtml(l.title)}</option>`).join('');
      const stillValid = prev === 'all' || levels.some(l => String(l.id) === String(prev));
      bankPackFilter = stillValid ? prev : 'all';
      elBankPackFilter.value = String(bankPackFilter);
    }

    function openWordBank() {
      bankOpenId = null;
      bankRenderLimit = BANK_PAGE_SIZE;
      syncBankPackOptions();
      syncBankTraitFilterButtons();
      if (elBankSearch) elBankSearch.value = bankQuery;
      if (elBankSort) elBankSort.value = bankSort;
      document.querySelectorAll('#bank-tier-filters [data-bank-filter]').forEach(b => {
        const on = b.dataset.bankFilter === bankFilter;
        b.className = `bank-filter-btn px-2.5 py-1 rounded-lg${on ? ' is-on' : ''}`;
      });
      renderWordBank();
      elBankModal.classList.remove('hidden');
      // Don't autofocus search on iOS — opens keyboard and can steal the first tap.
      if (!isIOSAudioDevice()) {
        requestAnimationFrame(() => elBankSearch?.focus());
      }
    }

    document.getElementById('btn-open-bank-intro').addEventListener('click', openWordBank);
    document.getElementById('btn-open-bank-game').addEventListener('click', openWordBank);

    document.getElementById('btn-close-bank').addEventListener('click', () => {
      elBankModal.classList.add('hidden');
      bankOpenId = null;
    });

    elBankModal.addEventListener('click', (e) => {
      if (hasTextSelection()) return;
      if (e.target === elBankModal) {
        elBankModal.classList.add('hidden');
        bankOpenId = null;
      }
    });

    document.querySelectorAll('#bank-tier-filters [data-bank-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        bankFilter = btn.dataset.bankFilter;
        bankOpenId = null;
        document.querySelectorAll('#bank-tier-filters [data-bank-filter]').forEach(b => {
          const on = b.dataset.bankFilter === bankFilter;
          b.className = `bank-filter-btn px-2.5 py-1 rounded-lg${on ? ' is-on' : ''}`;
        });
        bankRenderLimit = BANK_PAGE_SIZE;
        renderWordBank();
      });
    });

    let bankSearchTimer = null;
    elBankSearch?.addEventListener('input', () => {
      clearTimeout(bankSearchTimer);
      bankSearchTimer = setTimeout(() => {
        bankQuery = elBankSearch.value.trim();
        bankOpenId = null;
        bankRenderLimit = BANK_PAGE_SIZE;
        renderWordBank();
      }, 120);
    });

    elBankPackFilter?.addEventListener('change', () => {
      bankPackFilter = elBankPackFilter.value;
      bankOpenId = null;
      bankRenderLimit = BANK_PAGE_SIZE;
      renderWordBank();
    });

    elBankSort?.addEventListener('change', () => {
      bankSort = elBankSort.value;
      bankRenderLimit = BANK_PAGE_SIZE;
      renderWordBank();
    });

    function renderWordBank() {
      const domainItems = VOCAB_DATA.filter(
        w => w.domain === appState.domain && !w.rootOnly
      );
      const q = bankQuery.toLowerCase();

      const items = domainItems
        .filter(w => {
          if (bankPackFilter !== 'all' && String(w.level) !== String(bankPackFilter)) return false;
          if (bankTraitFilter !== 'all' && w.trait !== bankTraitFilter) return false;

          const score = appState.scores[w.id] ?? 0;
          const tier = getTier(score);
          const taught = isIntroduced(w.id);
          const missed = !!(appState.lastMissAt && appState.lastMissAt[w.id]);

          if (bankFilter === 'learning' || bankFilter === 'learned' || bankFilter === 'mastered') {
            if (tier !== bankFilter) return false;
          } else if (bankFilter === 'missed') {
            if (!missed) return false;
          } else if (bankFilter === 'cold') {
            if (taught) return false;
          }

          if (q) {
            const hay = `${w.word} ${w.meaning || ''} ${w.trait} ${w.note || ''}`.toLowerCase();
            if (!hay.includes(q)) return false;
          }
          return true;
        })
        .sort((a, b) => {
          const sa = appState.scores[a.id] ?? 0;
          const sb = appState.scores[b.id] ?? 0;
          const ma = appState.lastMissAt?.[a.id] || 0;
          const mb = appState.lastMissAt?.[b.id] || 0;
          if (bankSort === 'score-asc') return sa - sb || a.word.localeCompare(b.word, 'de');
          if (bankSort === 'score-desc') return sb - sa || a.word.localeCompare(b.word, 'de');
          if (bankSort === 'alpha') return a.word.localeCompare(b.word, 'de');
          if (bankSort === 'miss') return mb - ma || a.level - b.level || a.word.localeCompare(b.word, 'de');
          return a.level - b.level || sb - sa || a.word.localeCompare(b.word, 'de');
        });

      const visible = items.slice(0, bankRenderLimit);
      const remaining = Math.max(0, items.length - visible.length);

      if (elBankCountLine) {
        elBankCountLine.textContent = remaining
          ? `Showing ${visible.length} of ${items.length} matches · tap a row for gloss + example`
          : `Showing ${items.length} of ${domainItems.length} · tap a row for gloss + example`;
      }

      if (items.length === 0) {
        elBankList.innerHTML = `
          <div class="rounded-xl border border-dashed p-4 text-center text-xs" style="border-color:var(--line);color:var(--muted)">
            No words match these filters.
          </div>`;
        return;
      }

      elBankList.innerHTML = visible.map(w => {
        const score = appState.scores[w.id] ?? 0;
        const tier = getTier(score);
        const st = TRAIT_STYLES[w.trait];
        const unlocked = isCompoundUnlocked(w);
        const pct = Math.round((score / MAX_SCORE) * 100);
        const taught = isIntroduced(w.id);
        const missAt = appState.lastMissAt?.[w.id] || 0;
        const open = bankOpenId === w.id;
        const def = dictionaryDefinition(w);
        const example = getExampleSentence(w);
        const buildsHint = !w.compound ? formatBuildsHint(w) : '';

        const tierBadge = tier === 'mastered'
          ? '<span class="bank-tier-pill bank-tier-mastered">Mastered</span>'
          : tier === 'learned'
            ? '<span class="bank-tier-pill bank-tier-learned">Learned</span>'
            : '<span class="bank-tier-pill bank-tier-learning">Learning</span>';

        const statusChips = [
          taught
            ? '<span class="bank-chip-taught px-1.5 py-0.5 rounded text-[9px] font-bold">Taught</span>'
            : '<span class="bank-chip-cold px-1.5 py-0.5 rounded text-[9px] font-bold">Not taught</span>',
          missAt
            ? `<span class="bank-chip-miss px-1.5 py-0.5 rounded text-[9px] font-bold">Miss ${escapeBankHtml(formatMissAge(missAt))}</span>`
            : ''
        ].filter(Boolean).join('');

        const compoundSub = w.compound
          ? `<p class="text-[10px] font-mono ${unlocked ? 'text-amber-700' : 'text-zinc-400'} mt-0.5">${unlocked ? '' : '🔒 '}${escapeBankHtml(w.compound.prefix)} + ${escapeBankHtml(w.compound.rootTrait)} ${escapeBankHtml(w.compound.rootWord)}</p>`
          : buildsHint
            ? `<p class="text-[10px] font-mono text-amber-700 mt-0.5">${escapeBankHtml(buildsHint)}</p>`
            : '';

        const dictCard = buildDictionaryCard(w, { full: true, revealAnswer: true });
        const pluralLine = dictCard.showPluralLine
          ? `<p class="text-[11px] font-semibold" style="color:var(--ink)">Plural: die ${escapeBankHtml(w.pluralForm)}</p>`
          : '';
        const bulletLines = dictCard.bullets?.length
          ? `<ul class="text-[12px] leading-snug space-y-0.5" style="color:var(--muted)">${dictCard.bullets.map((b) => `<li>• ${escapeBankHtml(b)}</li>`).join('')}</ul>`
          : '';

        const detail = open ? `
          <div class="mt-2.5 pt-2.5 border-t space-y-1.5 text-left" style="border-color:var(--line)" data-bank-detail>
            <p class="text-xs leading-snug" style="color:var(--ink)">${escapeBankHtml(def)}</p>
            ${bulletLines}
            ${pluralLine}
            ${example ? `
              <p class="text-[11px] leading-snug font-semibold" style="color:var(--ink)">${escapeBankHtml(example.de)}</p>
              <p class="text-[10px] leading-snug" style="color:var(--muted)">${escapeBankHtml(example.en)}</p>
            ` : ''}
            ${w.note ? `<p class="text-[10px]" style="color:var(--muted)">${escapeBankHtml(w.note)}</p>` : ''}
            <div class="flex items-center gap-2 pt-1 flex-wrap">
              <button type="button" data-bank-practice="${escapeBankHtml(w.id)}" class="wm-btn-ok px-2.5 py-1 text-[10px] rounded-full">Practice this</button>
              <button type="button" data-bank-speak="${escapeBankHtml(w.id)}" class="wm-chip px-2.5 py-1 text-[10px]">Hear word</button>
              ${example ? `<button type="button" data-bank-speak-example="${escapeBankHtml(w.id)}" class="wm-chip px-2.5 py-1 text-[10px]">Hear example</button>` : ''}
            </div>
          </div>
        ` : '';

        return `
          <div class="bank-row p-2.5 rounded-xl border border-zinc-200/80 ${open ? 'is-open' : ''} ${unlocked ? 'bg-zinc-50/60' : 'bg-zinc-100/80 opacity-80'} cursor-pointer"
               data-bank-word-id="${escapeBankHtml(w.id)}" role="button" tabindex="0">
            <div class="flex items-start justify-between gap-2.5">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 min-w-0">
                  ${dictCard.showTraitPill ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-extrabold shrink-0 ${st.badgeBg}">${w.trait}</span>` : ''}
                  <span class="font-bold text-sm text-zinc-900 wm-word-scroll">${escapeBankHtml(dictCard.citation)}</span>
                </div>
                <p class="text-xs text-zinc-400 wm-word-scroll mt-0.5">— ${escapeBankHtml(w.meaning || '')}</p>
                <div class="flex items-center gap-1 flex-wrap mt-1">${statusChips}</div>
                ${compoundSub}
                <div class="mt-1.5 flex items-center gap-2">
                  <div class="flex-1 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                    <div class="h-full bg-zinc-800 rounded-full transition-all" style="width: ${pct}%;background:var(--ink)"></div>
                  </div>
                  <span class="text-[11px] font-mono text-zinc-500 shrink-0">${score}/${MAX_SCORE} · Pack ${w.level}</span>
                </div>
              </div>
              <div class="shrink-0 flex flex-col items-end gap-1">
                ${tierBadge}
                <span class="text-[10px]" style="color:var(--faint)">${open ? '▲' : '▼'}</span>
              </div>
            </div>
            ${detail}
          </div>
        `;
      }).join('') + (remaining
        ? `<button type="button" id="bank-show-more" class="w-full py-2.5 rounded-xl text-xs font-bold wm-chip">Show ${Math.min(BANK_PAGE_SIZE, remaining)} more (${remaining} left)</button>`
        : '');

      document.getElementById('bank-show-more')?.addEventListener('click', (e) => {
        e.stopPropagation();
        bankRenderLimit += BANK_PAGE_SIZE;
        renderWordBank();
      });

      elBankList.querySelectorAll('[data-bank-word-id]').forEach(row => {
        const id = row.dataset.bankWordId;
        row.addEventListener('click', (e) => {
          if (e.target.closest('[data-bank-speak], [data-bank-speak-example], [data-bank-practice]')) return;
          if (hasTextSelection()) return;
          bankOpenId = bankOpenId === id ? null : id;
          renderWordBank();
          if (bankOpenId) {
            requestAnimationFrame(() => {
              elBankList.querySelector(`[data-bank-word-id="${CSS.escape(bankOpenId)}"]`)
                ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            });
          }
        });
      });

      elBankList.querySelectorAll('[data-bank-practice]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          practiceWordFromBank(btn.dataset.bankPractice);
        });
      });

      elBankList.querySelectorAll('[data-bank-speak]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const wordObj = VOCAB_DATA.find(w => w.id === btn.dataset.bankSpeak);
          if (!wordObj) return;
          initAudio();
          speakGermanWord(wordObj, true);
        });
      });

      elBankList.querySelectorAll('[data-bank-speak-example]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const wordObj = VOCAB_DATA.find(w => w.id === btn.dataset.bankSpeakExample);
          const example = getExampleSentence(wordObj);
          if (!example?.de) return;
          initAudio();
          void (async () => {
            try {
              if (!isPiperReady()) await ensurePiperReady();
              await speakGermanPiper(example.de);
            } catch (err) {
              speakText(example.de, null, 'de-DE');
            }
          })();
        });
      });
    }

    document.getElementById('btn-clear-combos').addEventListener('click', () => {
      appState.seenCombinations = [];
      saveState();
      renderWordBank();
      document.getElementById('combo-pool-status').textContent = 'Unique set';
    });

    document.getElementById('btn-reset-progress').addEventListener('click', () => {
      elConfirmToast.classList.remove('hidden');
    });

    document.getElementById('confirm-toast-no').addEventListener('click', () => {
      elConfirmToast.classList.add('hidden');
    });

    document.getElementById('confirm-toast-yes').addEventListener('click', () => {
      appState.introduced = {};
      appState.lastMissAt = {};
      VOCAB_DATA.forEach(item => {
        const seed = typeof item.initialScore === 'number' ? item.initialScore : 0;
        appState.scores[item.id] = seed;
        if (getTier(seed) !== 'learning') {
          appState.introduced[item.id] = true;
        }
      });
      appState.selectedPacks = { nouns: [1], case: [1], plurals: [1] };
      appState.seenCombinations = [];
      appState.streak = 0;
      bankOpenId = null;
      saveState();
      elConfirmToast.classList.add('hidden');
      updateHeaderAndLegend();
      renderWordBank();
      if (activeScreen === 'game') {
        startNewRound();
      }
    });

    // =========================================================================
    // 8. BOOTSTRAP
    // =========================================================================
    function bootWortMatch() {
      document.documentElement.dataset.wortBoot = '1125f';
      setAppStatus(APP_STATUS_OK);
      let themePref = 'system';
      try {
        themePref = localStorage.getItem('schnapp-theme') || 'system';
      } catch (_) {}
      applyWortTheme(themePref);
      document.querySelectorAll('[data-theme-choice]').forEach((btn) => {
        btn.addEventListener('click', () => applyWortTheme(btn.dataset.themeChoice));
      });
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        let pref = 'system';
        try {
          pref = localStorage.getItem('schnapp-theme') || 'system';
        } catch (_) {}
        if (pref === 'system') applyWortTheme('system');
      });

      // Clear any stuck overlay that might have been left without `.hidden`.
      ['translation-popover', 'session-report-modal', 'word-bank-modal', 'confirm-toast'].forEach((id) => {
        document.getElementById(id)?.classList.add('hidden');
      });

      loadState();
      loadLastSessionReport();
      showScreen('intro');
      refreshIntroSessionCard();
    }

    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', bootWortMatch, { once: true });
    } else {
      bootWortMatch();
    }
