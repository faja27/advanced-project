import { maToSlider } from './timescale.js';
import { crossfadeEnabled, getCres, getLongTaskSnapshot, setBenchMode } from './globe.js';
import { setSpeed, startPlay, pausePlayback } from './playback.js';

const BENCH  = new URLSearchParams(location.search).get('bench') === '1';
const STEPS  = 10000; // must match playback.js / timeline.js
const WARMUP = 10_000; // ms to wait for preload before starting
const RUN    = 8_000;  // ms of actual measurement

export function initBench() {
  if (!BENCH) return;

  const params  = new URLSearchParams(location.search);
  const tParam  = Number(params.get('t'));
  const benchT  = Number.isFinite(tParam) && tParam !== 0 ? tParam : 250;

  setBenchMode(true);

  const panel = createPanel();
  panel.textContent = `BENCH: menunggu preload (${WARMUP / 1000} s)...`;
  document.body.appendChild(panel);

  setTimeout(() => runBench(panel, benchT), WARMUP);
}

function runBench(panel, benchT) {
  // Seek slider to bench start position
  const slider = document.getElementById('timeline-slider');
  if (slider) {
    slider.value = String(Math.round(maToSlider(benchT) * STEPS));
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // Set speed to 2×
  setSpeed(2);

  // Brief settle delay, then start
  setTimeout(() => {
    const benchStart   = performance.now();
    const rafDeltas    = [];
    let   prevTs       = null;
    let   benchRafId   = null;

    function benchTick(ts) {
      const elapsed = ts - benchStart;

      if (prevTs !== null) rafDeltas.push(ts - prevTs);
      prevTs = ts;

      const sec = Math.floor(elapsed / 1000);
      panel.textContent = `BENCH BERJALAN... (detik ke-${sec})`;

      if (elapsed >= RUN) {
        pausePlayback();
        setBenchMode(false);
        showResults(panel, rafDeltas, benchStart, benchT);
        return;
      }

      benchRafId = requestAnimationFrame(benchTick);
    }

    startPlay();
    benchRafId = requestAnimationFrame(benchTick);
  }, 200);
}

function createPanel() {
  const el = document.createElement('div');
  el.style.cssText = [
    'position:fixed', 'top:12px', 'right:12px',
    'background:rgba(0,0,0,0.88)', 'color:#ffe44d',
    'font:12px/1.8 monospace', 'padding:10px 16px',
    'border-radius:6px', 'white-space:pre', 'z-index:9999',
    'pointer-events:none', 'max-width:520px',
  ].join(';');
  return el;
}

function showResults(panel, rafDeltas, benchStart, benchT) {
  const benchEnd = benchStart + RUN;

  // Long tasks that fired inside the bench window
  const allTasks    = getLongTaskSnapshot();
  const benchTasks  = allTasks.filter(e => e.ts >= benchStart && e.ts <= benchEnd + 500);
  const ltCount     = benchTasks.length;
  const ltWorstMs   = ltCount > 0 ? Math.max(...benchTasks.map(e => e.duration)).toFixed(1) : '—';

  const count      = rafDeltas.length;
  const totalMs    = count > 0 ? rafDeltas.reduce((a, b) => a + b, 0) : RUN;
  const fpsAvg     = count > 0 ? (count * 1000 / totalMs).toFixed(1) : '—';
  const worstMs    = count > 0 ? Math.max(...rafDeltas).toFixed(1) : '—';
  const slowCount  = rafDeltas.filter(d => d > 33).length;

  panel.style.color = '#7fff7f';
  panel.textContent =
    `BENCH SELESAI\n` +
    `FPS rata-rata    : ${fpsAvg}\n` +
    `frame terburuk   : ${worstMs} ms\n` +
    `frame >33 ms     : ${slowCount} dari ${count}\n` +
    `long task        : ${ltCount}, terpanjang ${ltWorstMs} ms\n` +
    `crossfadeEnabled : ${crossfadeEnabled}\n` +
    `cres             : ${getCres() ?? '(default 5)'}\n` +
    `t awal           : ${benchT} Ma`;
}
