import Globe from 'globe.gl';
import * as THREE from 'three';

// ── URL params ────────────────────────────────────────────────────────────────
const _p       = new URLSearchParams(location.search);
const DEBUG    = _p.get('debug') === '1';
const TEX_SIZE = (() => { const v = Number(_p.get('tex')); return v > 0 && isFinite(v) ? v : 4096; })();
const W        = TEX_SIZE;
const H        = Math.round(TEX_SIZE / 2); // equirectangular aspect

// ── Frame cache ───────────────────────────────────────────────────────────────
const FRAME_CACHE = new Map();
const FRAME_SIZES = new Map();
const IN_FLIGHT   = new Map();

// ── Globe state ───────────────────────────────────────────────────────────────
let globeInst       = null;
let canvas2d        = null;
let ctx2d           = null;
let texMap          = null;
let manifestData    = null;
let currentFile     = null;
let frameGen        = 0;
let lastFrameIdx    = -1;
let bgPreloadActive = false;
let bgPreloadIdx    = 0;
const PRELOAD_AHEAD = 6;

// ── Draw timing ───────────────────────────────────────────────────────────────
const drawTimes = []; // ring of last 120 draw durations
let drawAvg = 0;
let drawMax = 0;

// ── Public API (mirrors globe.js) ─────────────────────────────────────────────
export const crossfadeEnabled = false;
let benchMode = false;
export function setBenchMode(v) { benchMode = v; }
export function getCres() { return null; }
export function notifyPlayStart() {}

const longTaskLog = [];
if (typeof PerformanceObserver !== 'undefined' && PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
  new PerformanceObserver(list => {
    const now = performance.now();
    for (const e of list.getEntries()) longTaskLog.push({ ts: now, duration: e.duration });
  }).observe({ type: 'longtask', buffered: true });
}
export function getLongTaskSnapshot() { return [...longTaskLog]; }

export function getCacheStats() {
  const cached = FRAME_CACHE.size;
  const total  = manifestData?.frames.length ?? 0;
  let bytes = 0;
  for (const s of FRAME_SIZES.values()) bytes += s;
  return { cached, total, estimatedMB: (bytes / 1024 / 1024).toFixed(2) };
}

// ── Debug overlay ─────────────────────────────────────────────────────────────
let debugEl   = null;
const fpsRing   = [];
const deltaRing = [];
let prevRafTs = null;

// ── Projection ────────────────────────────────────────────────────────────────
// Equirectangular: lon -180 → x=0, lon +180 → x=W; lat +90 → y=0, lat -90 → y=H.
// flipY=true (Three.js default) correctly maps y=0 (north) to sphere UV v=1 (north).
function lonLatToXY(lon, lat) {
  return [(lon + 180) / 360 * W, (90 - lat) / 180 * H];
}

// ── Canvas drawing ─────────────────────────────────────────────────────────────

function countRingsAntim(rings) {
  let n = 0;
  for (const ring of rings) {
    for (let i = 1; i < ring.length; i++) {
      if (Math.abs(ring[i][0] - ring[i - 1][0]) > 180) n++;
    }
  }
  return n;
}

function traceGeom(geom) {
  let antim = 0;
  if (!geom) return antim;
  if (geom.type === 'Polygon') {
    antim += countRingsAntim(geom.coordinates);
    for (const ring of geom.coordinates) {
      const [x0, y0] = lonLatToXY(ring[0][0], ring[0][1]);
      ctx2d.moveTo(x0, y0);
      for (let i = 1; i < ring.length; i++) {
        const [x, y] = lonLatToXY(ring[i][0], ring[i][1]);
        ctx2d.lineTo(x, y);
      }
      ctx2d.closePath();
    }
  } else if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates) {
      antim += countRingsAntim(poly);
      for (const ring of poly) {
        const [x0, y0] = lonLatToXY(ring[0][0], ring[0][1]);
        ctx2d.moveTo(x0, y0);
        for (let i = 1; i < ring.length; i++) {
          const [x, y] = lonLatToXY(ring[i][0], ring[i][1]);
          ctx2d.lineTo(x, y);
        }
        ctx2d.closePath();
      }
    }
  }
  return antim;
}

function drawFrame(geojson, frameFile) {
  const t0 = performance.now();

  ctx2d.fillStyle = '#002d50';
  ctx2d.fillRect(0, 0, W, H);

  let antimCount = 0;
  if (geojson) {
    ctx2d.fillStyle = '#c8a96e';
    ctx2d.beginPath();
    for (const feature of geojson.features) {
      antimCount += traceGeom(feature.geometry);
    }
    ctx2d.fill('evenodd');
  }

  const dt = performance.now() - t0;

  drawTimes.push(dt);
  if (drawTimes.length > 120) drawTimes.shift();
  drawAvg = drawTimes.reduce((a, b) => a + b, 0) / drawTimes.length;
  if (dt > drawMax) drawMax = dt;

  // Shared stats for bench panel
  window.__plateauTex = { avg: drawAvg, max: drawMax };

  console.log(
    `[texture] draw ${frameFile ?? 'init'}: ${dt.toFixed(2)} ms` +
    ` | avg=${drawAvg.toFixed(2)} max=${drawMax.toFixed(2)}` +
    ` | antimeridian segments: ${antimCount}`
  );

  texMap.needsUpdate = true;
}

// ── rAF loop (FPS + debug overlay) ───────────────────────────────────────────

function rafLoop(ts) {
  requestAnimationFrame(rafLoop);

  fpsRing.push(ts);
  const cut = ts - 2000;
  while (fpsRing.length > 1 && fpsRing[0] < cut) fpsRing.shift();
  if (prevRafTs !== null) {
    const dt = ts - prevRafTs;
    deltaRing.push({ ts, dt });
    while (deltaRing.length > 0 && deltaRing[0].ts < cut) deltaRing.shift();
  }
  prevRafTs = ts;

  if (DEBUG && debugEl) {
    const fps = fpsRing.length >= 2
      ? ((fpsRing.length - 1) / ((fpsRing[fpsRing.length - 1] - fpsRing[0]) / 1000)).toFixed(1)
      : '—';
    const worstMs   = deltaRing.length > 0 ? Math.max(...deltaRing.map(d => d.dt)).toFixed(1) : '—';
    const slowCount = deltaRing.filter(d => d.dt > 33).length;

    const ltCut = ts - 5000;
    while (longTaskLog.length > 0 && longTaskLog[0].ts < ltCut) longTaskLog.shift();
    const ltCount   = longTaskLog.length;
    const ltWorstMs = ltCount > 0 ? Math.max(...longTaskLog.map(e => e.duration)).toFixed(1) : '—';

    debugEl.textContent =
      `mode: texture ${W}×${H}\n` +
      `FPS (rata-rata 2 s): ${fps}\n` +
      `frame rAF terburuk: ${worstMs} ms\n` +
      `frame >33 ms: ${slowCount}\n` +
      `draw avg: ${drawAvg.toFixed(2)} ms\n` +
      `draw max: ${drawMax.toFixed(2)} ms\n` +
      `crossfadeEnabled: false\n` +
      `long task (5 s): ${ltCount} | worst ${ltWorstMs} ms`;
  }
}

// ── Manifest & frame utilities ────────────────────────────────────────────────

async function loadManifest() {
  const res = await fetch('/data/manifest.json');
  if (!res.ok) throw new Error(`manifest.json: HTTP ${res.status}`);
  return res.json();
}

function findNearestFrame(timeMa) {
  const frames = manifestData.frames;
  let best = frames[0], bestDiff = Math.abs(frames[0].time_ma - timeMa);
  for (let i = 1; i < frames.length; i++) {
    const diff = Math.abs(frames[i].time_ma - timeMa);
    if (diff < bestDiff) { bestDiff = diff; best = frames[i]; }
  }
  return best;
}

function findFrameIndex(frame) {
  return manifestData.frames.findIndex(f => f.file === frame.file);
}

async function fetchFrame(frame) {
  if (FRAME_CACHE.has(frame.file)) return FRAME_CACHE.get(frame.file);
  if (IN_FLIGHT.has(frame.file))   return IN_FLIGHT.get(frame.file);
  const promise = (async () => {
    try {
      const res     = await fetch(`/data/frames/${frame.file}`);
      if (!res.ok) throw new Error(`Frame ${frame.file}: HTTP ${res.status}`);
      const text    = await res.text();
      const geojson = JSON.parse(text);
      FRAME_SIZES.set(frame.file, text.length);
      FRAME_CACHE.set(frame.file, geojson);
      return geojson;
    } finally {
      IN_FLIGHT.delete(frame.file);
    }
  })();
  IN_FLIGHT.set(frame.file, promise);
  return promise;
}

// ── Preload ───────────────────────────────────────────────────────────────────

function preloadAhead(currentIdx, count, direction) {
  if (!manifestData || direction === 0) return;
  const total = manifestData.frames.length;
  for (let i = 1; i <= count; i++) {
    const idx = currentIdx + direction * i;
    if (idx < 0 || idx >= total) break;
    fetchFrame(manifestData.frames[idx]).catch(() => {});
  }
}

function yieldToMain() {
  return new Promise(resolve => {
    if (typeof requestIdleCallback === 'function') requestIdleCallback(resolve, { timeout: 50 });
    else setTimeout(resolve, 50);
  });
}

async function bgWorker() {
  while (bgPreloadActive && manifestData) {
    const idx = bgPreloadIdx++;
    if (idx >= manifestData.frames.length) break;
    const frame = manifestData.frames[idx];
    if (!FRAME_CACHE.has(frame.file)) await fetchFrame(frame).catch(() => {});
    await yieldToMain();
  }
}

async function bgPreloadWorkerFn() {
  if (!manifestData) return;
  bgPreloadIdx = 0;
  await Promise.all([bgWorker(), bgWorker(), bgWorker()]);
  bgPreloadActive = false;
  console.info('[texture] Background preload selesai.', getCacheStats());
}

export function startBackgroundPreload() {
  if (bgPreloadActive || !manifestData) return;
  bgPreloadActive = true;
  bgPreloadWorkerFn();
}

// ── UI helpers ────────────────────────────────────────────────────────────────

function setLoading(visible) {
  document.getElementById('loading-indicator').classList.toggle('visible', visible);
}

function showError(msg) {
  const el = document.getElementById('error-message');
  el.textContent = msg;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 5000);
}

// ── setCrossfadeFrame ─────────────────────────────────────────────────────────
// Texture mode always snaps to nearest frame; crossfade is not implemented.

export async function setCrossfadeFrame(timeMa, _isPlaying) {
  if (!globeInst || !manifestData) return;

  const snapFrame = findNearestFrame(timeMa);

  const snapIdx   = findFrameIndex(snapFrame);
  const direction = lastFrameIdx < 0 ? 0 : Math.sign(snapIdx - lastFrameIdx);
  lastFrameIdx    = snapIdx;
  preloadAhead(snapIdx, PRELOAD_AHEAD, direction);

  const gen = ++frameGen;

  if (snapFrame.file === currentFile) return;

  const alreadyReady = FRAME_CACHE.has(snapFrame.file);
  if (!alreadyReady) setLoading(true);
  try {
    const geojson = await fetchFrame(snapFrame);
    if (gen !== frameGen) return;
    drawFrame(geojson, snapFrame.file);
    currentFile = snapFrame.file;
  } catch (err) {
    if (gen === frameGen) showError(err.message);
  } finally {
    if (!alreadyReady && gen === frameGen) setLoading(false);
  }
}

export async function setFrame(timeMa) {
  await setCrossfadeFrame(timeMa, false);
}

// ── initGlobe ─────────────────────────────────────────────────────────────────

export async function initGlobe(containerId) {
  const container = document.getElementById(containerId);

  // 2D canvas for equirectangular texture paint
  canvas2d        = document.createElement('canvas');
  canvas2d.width  = W;
  canvas2d.height = H;
  ctx2d = canvas2d.getContext('2d');

  // Single Globe.gl instance; no polygonsData at all
  globeInst = Globe()(container)
    .width(container.clientWidth)
    .height(container.clientHeight)
    .backgroundColor('rgba(0,0,0,0)')
    .atmosphereColor('#1a5080')
    .atmosphereAltitude(0.12);

  // Wait one microtask for Globe.gl / Three.js internal setup to settle
  await new Promise(resolve => setTimeout(resolve, 0));

  // THREE.CanvasTexture: flipY=true (default) is correct for our north-at-top canvas
  texMap            = new THREE.CanvasTexture(canvas2d);
  texMap.colorSpace = THREE.SRGBColorSpace; // three r152+; canvas data is sRGB

  const mat = globeInst.globeMaterial();
  mat.map   = texMap;
  // White color so texture colors pass through unmodified;
  // emissive adds ambient fill similar to old mode (old used #001525 @ 0.6)
  mat.color.set(0xffffff);
  mat.emissive.set(0x001525);
  mat.emissiveIntensity = 0.3;
  mat.needsUpdate = true;

  // Controls (mirror globe.js)
  const controls = globeInst.controls();
  controls.autoRotate      = true;
  controls.autoRotateSpeed = 0.35;
  controls.minDistance     = 115;
  controls.maxDistance     = 560;
  let resumeTimer;
  controls.addEventListener('start', () => { controls.autoRotate = false; clearTimeout(resumeTimer); });
  controls.addEventListener('end',   () => { resumeTimer = setTimeout(() => { controls.autoRotate = true; }, 2500); });

  window.addEventListener('resize', () => {
    globeInst.width(container.clientWidth).height(container.clientHeight);
  });

  if (DEBUG) {
    debugEl = document.createElement('div');
    debugEl.style.cssText = [
      'position:fixed', 'top:60px', 'right:12px',
      'background:rgba(0,0,0,0.78)', 'color:#3f3',
      'font:11px/1.7 monospace', 'padding:8px 14px',
      'border-radius:6px', 'white-space:pre', 'z-index:999',
      'pointer-events:none',
    ].join(';');
    document.body.appendChild(debugEl);
  }

  requestAnimationFrame(rafLoop);

  try {
    setLoading(true);
    manifestData = await loadManifest();
  } catch (err) {
    showError('Gagal memuat manifest: ' + err.message);
  } finally {
    setLoading(false);
  }

  // Initial blank ocean draw so the globe doesn't show a black sphere
  drawFrame(null, 'init');

  return globeInst;
}
