import { maToSlider, P } from './timescale.js';

// ── Speed ─────────────────────────────────────────────────────────────────────
// At 1×, traversing segment B (p: 0.15 → 0.85, width 0.70) takes exactly 60 s.
const V_1X  = (P.BC - P.AB) / 60; // p per second at 1×
const STEPS = 10000;               // must match STEPS in timeline.js

// ── State ─────────────────────────────────────────────────────────────────────
let playing    = false;
let speed      = 1;          // multiplier: 0.5 | 1 | 2
let currentPos = 0;          // float position in [0, STEPS] — the accumulator
let lastTs     = null;       // DOMHighResTimeStamp of previous rAF tick
let rafId      = null;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSlider() { return document.getElementById('timeline-slider'); }

function updateBtn() {
  const btn = document.getElementById('pb-play');
  if (!btn) return;
  btn.textContent = playing ? '⏸' : '▶';
  btn.title       = playing ? 'Pause (Spasi)' : 'Play (Spasi)';
  btn.setAttribute('aria-pressed', String(playing));
  btn.classList.toggle('pb-btn-playing', playing);
}

// ── Animation loop ────────────────────────────────────────────────────────────

function tick(ts) {
  if (!playing) return;
  const slider = getSlider();
  if (!slider) { playing = false; return; }

  if (lastTs !== null) {
    // Cap dt to 100 ms so a hidden-tab wake-up doesn't jump the slider.
    const dt   = Math.min((ts - lastTs) / 1000, 0.1);
    currentPos = Math.min(STEPS, currentPos + V_1X * speed * dt * STEPS);

    const intVal = Math.round(currentPos);
    if (intVal !== +slider.value) {
      slider.value = String(intVal);
      // Custom event → timeline.js syncs label + era panel WITHOUT pausing.
      slider.dispatchEvent(new CustomEvent('plateauview:seekto', {
        detail: { value: intVal },
      }));
    }

    if (currentPos >= STEPS) {
      pausePlayback();
      return;
    }
  }

  lastTs = ts;
  rafId  = requestAnimationFrame(tick);
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Stop playback (safe to call when already stopped). */
export function pausePlayback() {
  if (!playing) return;
  playing = false;
  lastTs  = null;
  if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  updateBtn();
}

function play() {
  const slider = getSlider();
  if (!slider) return;

  // Sync float accumulator with actual slider position (handles manual seeks).
  currentPos = +slider.value;

  // If at the right end, restart from the left.
  if (currentPos >= STEPS) {
    currentPos   = 0;
    slider.value = '0';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  }

  playing = true;
  lastTs  = null;
  updateBtn();
  rafId = requestAnimationFrame(tick);
}

function toggle() {
  if (playing) pausePlayback();
  else play();
}

function resetToStart() {
  pausePlayback();
  const slider = getSlider();
  if (!slider) return;
  slider.value = '0';
  slider.dispatchEvent(new Event('input', { bubbles: true }));
}

function goToPresent() {
  pausePlayback();
  const slider = getSlider();
  if (!slider) return;
  slider.value = String(Math.round(maToSlider(0) * STEPS));
  slider.dispatchEvent(new Event('input', { bubbles: true }));
}

// ── Build controls DOM ────────────────────────────────────────────────────────

export function initPlayback() {
  const bar = document.getElementById('timeline-bar');
  if (!bar) { console.warn('initPlayback: #timeline-bar not found'); return; }

  const ctrl = document.createElement('div');
  ctrl.id = 'pb-controls';

  // ── Reset button ──
  const resetBtn = document.createElement('button');
  resetBtn.id        = 'pb-reset';
  resetBtn.className = 'pb-btn';
  resetBtn.textContent = '⏮';
  resetBtn.title     = 'Reset ke 4600 Ma lalu';
  resetBtn.setAttribute('aria-label', 'Reset ke awal');
  resetBtn.addEventListener('click', resetToStart);

  // ── Play / pause button ──
  const playBtn = document.createElement('button');
  playBtn.id        = 'pb-play';
  playBtn.className = 'pb-btn pb-btn-play';
  playBtn.textContent = '▶';
  playBtn.title     = 'Play (Spasi)';
  playBtn.setAttribute('aria-pressed', 'false');
  playBtn.addEventListener('click', toggle);

  // ── Speed selector ──
  const speedGroup = document.createElement('div');
  speedGroup.id = 'pb-speeds';
  const speedDefs = [
    { label: '0,5×', value: 0.5 },
    { label: '1×',   value: 1   },
    { label: '2×',   value: 2   },
  ];
  for (const s of speedDefs) {
    const btn = document.createElement('button');
    btn.className     = 'pb-speed' + (s.value === 1 ? ' pb-speed-active' : '');
    btn.textContent   = s.label;
    btn.dataset.speed = String(s.value);
    btn.addEventListener('click', () => {
      speed = s.value;
      speedGroup.querySelectorAll('.pb-speed').forEach(b =>
        b.classList.toggle('pb-speed-active', b === btn));
    });
    speedGroup.appendChild(btn);
  }

  // ── Spacer ──
  const spacer = document.createElement('div');
  spacer.className = 'pb-spacer';

  // ── Masa kini button ──
  const nowBtn = document.createElement('button');
  nowBtn.id        = 'pb-now';
  nowBtn.className = 'pb-btn pb-btn-text';
  nowBtn.textContent = 'Masa kini';
  nowBtn.title     = 'Lompat ke 0 Ma';
  nowBtn.addEventListener('click', goToPresent);

  ctrl.append(resetBtn, playBtn, speedGroup, spacer, nowBtn);
  bar.insertBefore(ctrl, bar.firstChild); // above #timeline-track-wrapper

  // ── Spacebar: toggle play/pause ──
  document.addEventListener('keydown', e => {
    if (e.target instanceof HTMLInputElement && e.target.type !== 'range') return;
    if (e.target instanceof HTMLTextAreaElement) return;
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      toggle();
    }
  });
}
