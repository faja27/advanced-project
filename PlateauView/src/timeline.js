import { sliderToMa, maToSlider, formatMa, nearestAvailableMa, SEG, P } from './timescale.js';
import { setFrame } from './globe.js';
import { pausePlayback } from './playback.js';

const STEPS   = 10000;
const SMALL   = 50;   // keyboard small step (~7 Ma in segment B)
const LARGE   = 500;  // keyboard large step (Shift+arrow, ~70 Ma in seg B)
const THUMB_R = 12;   // px — must match CSS thumb radius (24px diameter / 2)

let pendingMa = null;
let rafHandle = null;

// ── Era color band ────────────────────────────────────────────────────────────

function collectSegments(data) {
  const out = [];
  for (const eon of data.eons) {
    if (!eon.eras || eon.eras.length === 0) {
      out.push({ start_ma: eon.start_ma, end_ma: eon.end_ma, color: eon.color });
    } else {
      for (const era of eon.eras) {
        if (!era.periods || era.periods.length === 0) {
          out.push({ start_ma: era.start_ma, end_ma: era.end_ma, color: era.color });
        } else {
          for (const period of era.periods) {
            out.push({ start_ma: period.start_ma, end_ma: period.end_ma, color: period.color });
          }
        }
      }
    }
  }
  // Segment C (future / projection) — no ICS standard colour
  out.push({ start_ma: 0, end_ma: SEG.C_YOUNG, color: '#2d2b55' });
  return out;
}

function buildGradient(segs) {
  const stops = [];
  for (const s of segs) {
    const L = (maToSlider(s.start_ma) * 100).toFixed(2);
    const R = (maToSlider(s.end_ma)   * 100).toFixed(2);
    stops.push(`${s.color} ${L}%`, `${s.color} ${R}%`);
  }
  return `linear-gradient(to right, ${stops.join(', ')})`;
}

// ── Tick positions ────────────────────────────────────────────────────────────

function collectTickPcts(data) {
  const pts = new Set();
  for (const eon of data.eons) {
    pts.add(eon.start_ma);
    pts.add(eon.end_ma);
    if (eon.eras) {
      for (const era of eon.eras) {
        pts.add(era.start_ma);
      }
    }
  }
  pts.add(SEG.A_OLD);
  pts.add(SEG.B_C);
  pts.add(SEG.C_YOUNG);

  return [...pts]
    .filter(ma => ma >= SEG.C_YOUNG && ma <= SEG.A_OLD)
    .map(ma => maToSlider(ma) * 100);
}

// ── Thumb label position ──────────────────────────────────────────────────────
// At val=0  : label centre at THUMB_R px from left edge
// At val=MAX: label centre at THUMB_R px from right edge

function labelLeft(val) {
  const pct = val / STEPS * 100;
  return `calc(${pct}% + ${THUMB_R * (1 - 2 * pct / 100)}px)`;
}

// ── Frame dispatch: rAF + latest-wins (generation in globe.js) ────────────────

function scheduleFrame(ma) {
  pendingMa = ma;
  if (!rafHandle) rafHandle = requestAnimationFrame(dispatchFrame);
}

async function dispatchFrame() {
  rafHandle = null;
  const ma = pendingMa;
  pendingMa = null;
  await setFrame(nearestAvailableMa(ma));
}

// ── Build DOM ─────────────────────────────────────────────────────────────────

export async function initTimeline(initialMa = 0) {
  const res  = await fetch('/data/eras.json');
  const data = await res.json();

  // bar
  const bar  = document.createElement('div');
  bar.id = 'timeline-bar';

  // track wrapper — all visual layers stack here
  const wrap = document.createElement('div');
  wrap.id = 'timeline-track-wrapper';

  // time label above the thumb (left updated by JS)
  const lbl = document.createElement('div');
  lbl.id = 'timeline-time-label';

  // era colour band
  const band = document.createElement('div');
  band.id = 'timeline-era-band';
  band.style.background = buildGradient(collectSegments(data));

  // tick marks
  const ticksCt = document.createElement('div');
  ticksCt.id = 'timeline-ticks';
  for (const pct of collectTickPcts(data)) {
    const t = document.createElement('div');
    t.className = 'timeline-tick';
    t.style.left = `${pct.toFixed(2)}%`;
    ticksCt.appendChild(t);
  }

  // vertical segment boundary lines at A/B (p=0.15) and B/C (p=0.85)
  const boundCt = document.createElement('div');
  boundCt.id = 'timeline-boundaries';
  for (const p of [P.AB, P.BC]) {
    const b = document.createElement('div');
    b.className = 'timeline-boundary';
    b.style.left = `${(p * 100).toFixed(2)}%`;
    boundCt.appendChild(b);
  }

  // segment A / B / C labels centred in each segment
  const segCt = document.createElement('div');
  segCt.id = 'timeline-seg-markers';
  const SEG_LABELS = [
    { text: 'A — Bumi Awal',    p: (P.A0 + P.AB) / 2 },
    { text: 'B — Rekonstruksi', p: (P.AB + P.BC) / 2  },
    { text: 'C — Proyeksi',     p: (P.BC + P.C1) / 2  },
  ];
  for (const s of SEG_LABELS) {
    const el = document.createElement('div');
    el.className = 'timeline-seg-label';
    el.style.left = `${(s.p * 100).toFixed(2)}%`;
    el.textContent = s.text;
    segCt.appendChild(el);
  }

  // range input
  const slider = document.createElement('input');
  slider.type  = 'range';
  slider.id    = 'timeline-slider';
  slider.min   = '0';
  slider.max   = String(STEPS);
  slider.step  = '1';
  slider.value = String(Math.round(maToSlider(initialMa) * STEPS));

  wrap.append(band, ticksCt, boundCt, segCt, lbl, slider);
  bar.appendChild(wrap);
  document.body.appendChild(bar);

  // keep label text + position in sync with slider value; notify era panel
  function sync() {
    const val = Number(slider.value);
    const ma  = sliderToMa(val / STEPS);
    lbl.textContent = formatMa(ma);
    lbl.style.left  = labelLeft(val);
    window.dispatchEvent(new CustomEvent('plateauview:timechange', { detail: { ma } }));
  }
  sync();

  // user drags the slider → pause animation
  slider.addEventListener('input', () => {
    pausePlayback();
    sync();
    scheduleFrame(sliderToMa(Number(slider.value) / STEPS));
  });

  // programmatic seek from playback.js → update UI without pausing
  slider.addEventListener('plateauview:seekto', e => {
    sync();
    scheduleFrame(sliderToMa(e.detail.value / STEPS));
  });

  // keyboard: left/right arrow (+ Shift for large step) → pause animation
  document.addEventListener('keydown', e => {
    if (e.target instanceof HTMLInputElement && e.target.type !== 'range') return;
    if (e.target instanceof HTMLTextAreaElement) return;

    let delta = 0;
    if      (e.key === 'ArrowLeft')  delta = -(e.shiftKey ? LARGE : SMALL);
    else if (e.key === 'ArrowRight') delta =  (e.shiftKey ? LARGE : SMALL);
    else return;

    e.preventDefault();
    pausePlayback();
    slider.value = String(Math.max(0, Math.min(STEPS, +slider.value + delta)));
    sync();
    scheduleFrame(sliderToMa(+slider.value / STEPS));
  });
}
