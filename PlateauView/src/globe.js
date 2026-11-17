import Globe from 'globe.gl';

// ── Cache & in-flight deduplication ──────────────────────────────────────────
const FRAME_CACHE = new Map();
const FRAME_SIZES = new Map();
const IN_FLIGHT   = new Map();

// ── Globe instances ───────────────────────────────────────────────────────────
let globeBottom = null;   // interactive, always bottom layer
let globeTop    = null;   // overlay, pointer-events none
let topWrapper  = null;   // div wrapper for globeTop; opacity knob

// ── Crossfade flag (?crossfade=0 disables from load) ─────────────────────────
export let crossfadeEnabled = new URLSearchParams(location.search).get('crossfade') !== '0';

// ── Manifest & frame state ────────────────────────────────────────────────────
let manifestData        = null;
let frameGen            = 0;
let lastFrameIdx        = -1;
let displayedBottomFile = null;
let displayedTopFile    = null;
let bgPreloadActive     = false;
let bgPreloadIdx        = 0;

const PRELOAD_AHEAD = 6;

// ── Debug overlay (active only with ?debug=1) ─────────────────────────────────
const DEBUG = new URLSearchParams(location.search).get('debug') === '1';
let debugEl = null;

// FPS: ring of rAF timestamps over a 2-second rolling window
const fpsRing = [];

// Inter-rAF delta ring: {ts, dt} pairs for worst-frame and slow-frame stats
const deltaRing = [];
let prevCameraTs = null;

// Auto-fallback: rAF timestamps collected between 1 s and 4 s after play start
let playStartTs  = null;
let fallbackDone = false;
let fallbackRing = [];

// Camera sync rAF handle
let cameraRafId = null;

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

/**
 * Returns the two frames that bracket timeMa, plus the blend fraction.
 *
 *   bottom globe  → olderFrame  (higher time_ma = further in past)
 *   top globe     → newerFrame  (lower  time_ma = closer to present)
 *   top opacity   = frac   (0 = all old, 1 = all new)
 *
 * Single-frame zones (Seg A: timeMa > 1000, Seg C: timeMa ≤ 0):
 *   olderFrame === newerFrame, frac = 0.
 */
function findBracketingFrames(timeMa) {
  const frames = manifestData.frames;

  // Seg A (pre-reconstruction) and Seg C (projection): one nearest frame only
  if (timeMa > 1000 || timeMa <= 0) {
    const f = findNearestFrame(timeMa);
    return { olderFrame: f, newerFrame: f, frac: 0 };
  }

  // Seg B: find first index hi where frames[hi].time_ma >= timeMa
  let hi = -1;
  for (let i = 0; i < frames.length; i++) {
    if (frames[i].time_ma >= timeMa) { hi = i; break; }
  }

  if (hi <= 0) {
    return { olderFrame: frames[0], newerFrame: frames[0], frac: 0 };
  }
  if (hi >= frames.length) {
    const f = frames[frames.length - 1];
    return { olderFrame: f, newerFrame: f, frac: 0 };
  }

  const newerFrame = frames[hi - 1]; // lower time_ma  = closer to present
  const olderFrame = frames[hi];     // higher time_ma = further in past
  const span = olderFrame.time_ma - newerFrame.time_ma;
  if (span === 0) return { olderFrame, newerFrame, frac: 0 };

  // frac=0 when at olderFrame; frac=1 when at newerFrame
  const frac = (olderFrame.time_ma - timeMa) / span;
  return { olderFrame, newerFrame, frac: Math.max(0, Math.min(1, frac)) };
}

async function fetchFrame(frame) {
  if (FRAME_CACHE.has(frame.file)) return FRAME_CACHE.get(frame.file);
  if (IN_FLIGHT.has(frame.file))   return IN_FLIGHT.get(frame.file);

  const promise = (async () => {
    try {
      const res  = await fetch(`/data/frames/${frame.file}`);
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
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(resolve, { timeout: 50 });
    } else {
      setTimeout(resolve, 50);
    }
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

async function bgPreloadWorker() {
  if (!manifestData) return;
  bgPreloadIdx = 0;
  await Promise.all([bgWorker(), bgWorker(), bgWorker()]);
  bgPreloadActive = false;
  console.info('[PlateauView] Background preload selesai.', getCacheStats());
}

export function startBackgroundPreload() {
  if (bgPreloadActive || !manifestData) return;
  bgPreloadActive = true;
  bgPreloadWorker();
  setTimeout(() => {
    const { cached, total, estimatedMB } = getCacheStats();
    console.info(
      `[PlateauView] Cache +10 s: ${cached}/${total} frame ter-cache (~${estimatedMB} MB data JSON)`
    );
  }, 10_000);
}

export function getCacheStats() {
  const cached = FRAME_CACHE.size;
  const total  = manifestData?.frames.length ?? 0;
  let bytes = 0;
  for (const s of FRAME_SIZES.values()) bytes += s;
  return { cached, total, estimatedMB: (bytes / 1024 / 1024).toFixed(2) };
}

// ── Polygon update with rebuild timing ───────────────────────────────────────

function applyPolygons(globeInstance, geojson) {
  globeInstance.polygonsData(geojson.features);
}

// ── Camera sync & debug loop ──────────────────────────────────────────────────

/**
 * Runs every rAF. Responsibilities:
 *   1. Maintain FPS ring for debug overlay and auto-fallback.
 *   2. Auto-fallback: if avg FPS < 40 in the 1–4 s window after play starts,
 *      disable crossfade and log a console warning.
 *   3. Sync top-globe camera to bottom-globe camera via pointOfView(pov, 0).
 *   4. Update debug overlay (only with ?debug=1).
 *
 * Camera sync order vs Globe.gl's render loop:
 *   Globe.gl schedules its own rAF internally (ThreeJS AnimationLoop). Our rAF
 *   and Globe.gl's rAF are both registered with the browser and run in
 *   unspecified order within the same vsync frame. If Globe.gl renders globeTop
 *   before our callback sets the camera, the top layer is 1 frame (~16 ms) behind.
 *   At autoRotateSpeed = 0.35 °/s this is ≈ 0.006 ° of jitter — imperceptible.
 */
function cameraSyncLoop(ts) {
  cameraRafId = requestAnimationFrame(cameraSyncLoop);

  // ── FPS ring (2-second window) ────────────────────────────────────────────
  fpsRing.push(ts);
  const fpsCutoff = ts - 2000;
  while (fpsRing.length > 1 && fpsRing[0] < fpsCutoff) fpsRing.shift();

  // ── Inter-rAF delta ring (2-second window) ────────────────────────────────
  if (prevCameraTs !== null) {
    const dt = ts - prevCameraTs;
    deltaRing.push({ ts, dt });
    while (deltaRing.length > 0 && deltaRing[0].ts < fpsCutoff) deltaRing.shift();
  }
  prevCameraTs = ts;

  // ── Auto-fallback: measure rAF timestamps between 1 s and 4 s after play ──
  if (crossfadeEnabled && !fallbackDone && playStartTs !== null) {
    const elapsed = ts - playStartTs;
    if (elapsed >= 1000 && elapsed < 4000) {
      fallbackRing.push(ts);
    } else if (elapsed >= 4000) {
      fallbackDone = true;
      if (fallbackRing.length > 1) {
        const windowMs = fallbackRing[fallbackRing.length - 1] - fallbackRing[0];
        const avgFps   = (fallbackRing.length - 1) / (windowMs / 1000);
        if (avgFps < 40) {
          crossfadeEnabled = false;
          console.warn(
            `[PlateauView] Crossfade auto-disabled: rata-rata FPS ${avgFps.toFixed(1)} < 40 ` +
            `(diukur 1–4 s setelah play dimulai).`
          );
          if (topWrapper) topWrapper.style.opacity = '0';
          if (globeTop)   globeTop.pauseAnimation();
        }
      }
      fallbackRing = [];
    }
  }

  // ── Camera sync (only when top layer is visible) ──────────────────────────
  if (globeBottom && globeTop && topWrapper) {
    const topOpacity = parseFloat(topWrapper.style.opacity || '0');
    if (topOpacity > 0) {
      const pov = globeBottom.pointOfView();
      globeTop.pointOfView(pov, 0);
    }
  }

  // ── Debug overlay ─────────────────────────────────────────────────────────
  if (DEBUG && debugEl) {
    const fps = fpsRing.length >= 2
      ? ((fpsRing.length - 1) / ((fpsRing[fpsRing.length - 1] - fpsRing[0]) / 1000)).toFixed(1)
      : '—';
    const worstMs = deltaRing.length > 0
      ? Math.max(...deltaRing.map(d => d.dt)).toFixed(1)
      : '—';
    const slowCount = deltaRing.filter(d => d.dt > 33).length;
    debugEl.textContent =
      `FPS (rata-rata 2 s): ${fps}\n` +
      `frame terburuk (2 s): ${worstMs} ms\n` +
      `frame >33 ms: ${slowCount}\n` +
      `crossfadeEnabled: ${crossfadeEnabled}`;
  }
}

// ── Main crossfade API ────────────────────────────────────────────────────────

/**
 * Update globe display for timeMa.
 *
 * isPlaying = true  → crossfade mode: blend olderFrame (bottom) + newerFrame (top)
 *                     using CSS opacity = frac, position-based.
 *                     Both globes render continuously.
 *                     Only activates if both frames are already in FRAME_CACHE;
 *                     otherwise holds previous display (preloader fills the cache).
 *
 * isPlaying = false → snap mode: show nearest single frame on bottom,
 *                     top opacity = 0, top globe paused.
 *
 * crossfadeEnabled = false → always uses snap path regardless of isPlaying.
 */
export async function setCrossfadeFrame(timeMa, isPlaying) {
  if (!globeBottom || !manifestData) return;

  const { olderFrame, newerFrame, frac } = findBracketingFrames(timeMa);

  // Directional preload based on older-frame index movement
  const olderIdx  = findFrameIndex(olderFrame);
  const direction = lastFrameIdx < 0 ? 0 : Math.sign(olderIdx - lastFrameIdx);
  lastFrameIdx    = olderIdx;
  preloadAhead(olderIdx, PRELOAD_AHEAD, direction);

  const gen = ++frameGen;

  const isSingleZone = olderFrame.file === newerFrame.file;
  const doCrossfade  = crossfadeEnabled && isPlaying && !isSingleZone;

  // ── Crossfade path ────────────────────────────────────────────────────────
  if (doCrossfade) {
    const olderReady = FRAME_CACHE.has(olderFrame.file);
    const newerReady = FRAME_CACHE.has(newerFrame.file);

    if (olderReady && newerReady) {
      if (olderFrame.file !== displayedBottomFile) {
        applyPolygons(globeBottom, FRAME_CACHE.get(olderFrame.file));
        displayedBottomFile = olderFrame.file;
      }
      if (newerFrame.file !== displayedTopFile) {
        applyPolygons(globeTop, FRAME_CACHE.get(newerFrame.file));
        displayedTopFile = newerFrame.file;
      }
      if (topWrapper) {
        topWrapper.style.opacity = String(frac);
        if (frac > 0) globeTop.resumeAnimation();
      }
      return;
    }

    // Frames not ready: kick off fetches, then fall through to snap path
    if (!olderReady) fetchFrame(olderFrame).catch(() => {});
    if (!newerReady) fetchFrame(newerFrame).catch(() => {});
  }

  // ── Snap path ─────────────────────────────────────────────────────────────
  const snapFrame = isSingleZone ? olderFrame : findNearestFrame(timeMa);

  if (snapFrame.file !== displayedBottomFile) {
    const alreadyReady = FRAME_CACHE.has(snapFrame.file);
    if (!alreadyReady) setLoading(true);
    try {
      const geojson = await fetchFrame(snapFrame);
      if (gen !== frameGen) return;
      applyPolygons(globeBottom, geojson);
      displayedBottomFile = snapFrame.file;
    } catch (err) {
      if (gen === frameGen) showError(err.message);
    } finally {
      if (!alreadyReady && gen === frameGen) setLoading(false);
    }
  }

  if (topWrapper) topWrapper.style.opacity = '0';
  if (globeTop)   globeTop.pauseAnimation();
}

/** Backward-compat wrapper used by main.js for initial frame load. */
export async function setFrame(timeMa) {
  await setCrossfadeFrame(timeMa, false);
}

/**
 * Call when playback starts. Resets FPS monitoring window for auto-fallback.
 * Must be called before the first playing tick so the 1–4 s window is correct.
 */
export function notifyPlayStart() {
  playStartTs  = performance.now();
  fallbackDone = false;
  fallbackRing = [];
}

// ── Globe initialization ──────────────────────────────────────────────────────

function applyGlobeMaterial(globeInstance) {
  const mat = globeInstance.globeMaterial();
  mat.color.set(0x002d50);
  mat.emissive.set(0x001525);
  mat.emissiveIntensity = 0.6;
}

export async function initGlobe(containerId) {
  const container = document.getElementById(containerId);
  container.style.position = 'relative';

  // ── Bottom globe (interactive, always bottom layer) ───────────────────────
  const bottomWrap = document.createElement('div');
  bottomWrap.style.cssText = 'position:absolute;inset:0;';
  container.appendChild(bottomWrap);

  globeBottom = Globe()(bottomWrap)
    .width(container.clientWidth)
    .height(container.clientHeight)
    .backgroundColor('rgba(0,0,0,0)')
    .atmosphereColor('#1a5080')
    .atmosphereAltitude(0.12)
    .polygonGeoJsonGeometry(d => d.geometry)
    .polygonCapColor(() => '#c8a96e')
    .polygonSideColor(() => 'rgba(0,0,0,0)')
    .polygonStrokeColor(() => null)
    .polygonAltitude(0.004)
    .polygonsTransitionDuration(0);

  applyGlobeMaterial(globeBottom);

  const controls = globeBottom.controls();
  controls.autoRotate      = true;
  controls.autoRotateSpeed = 0.35;
  controls.minDistance     = 115;
  controls.maxDistance     = 560;

  let resumeTimer;
  controls.addEventListener('start', () => {
    controls.autoRotate = false;
    clearTimeout(resumeTimer);
  });
  controls.addEventListener('end', () => {
    resumeTimer = setTimeout(() => { controls.autoRotate = true; }, 2500);
  });

  // ── Top globe (overlay, pointer-events none, initially hidden) ────────────
  const topWrap = document.createElement('div');
  topWrap.style.cssText = 'position:absolute;inset:0;pointer-events:none;opacity:0;';
  container.appendChild(topWrap);
  topWrapper = topWrap;

  globeTop = Globe()(topWrap)
    .width(container.clientWidth)
    .height(container.clientHeight)
    .backgroundColor('rgba(0,0,0,0)')
    // Atmosphere is provided by the bottom globe; disabling here prevents doubling
    .showAtmosphere(false)
    .polygonGeoJsonGeometry(d => d.geometry)
    .polygonCapColor(() => '#c8a96e')
    .polygonSideColor(() => 'rgba(0,0,0,0)')
    .polygonStrokeColor(() => null)
    .polygonAltitude(0.004)
    .polygonsTransitionDuration(0);

  applyGlobeMaterial(globeTop);

  const topControls = globeTop.controls();
  topControls.enabled    = false;
  topControls.autoRotate = false;
  globeTop.pauseAnimation();

  // ── Resize: both instances ────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    globeBottom.width(container.clientWidth).height(container.clientHeight);
    globeTop.width(container.clientWidth).height(container.clientHeight);
  });

  // ── Camera sync & FPS loop ────────────────────────────────────────────────
  cameraRafId = requestAnimationFrame(cameraSyncLoop);

  // ── Debug overlay ─────────────────────────────────────────────────────────
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

  // ── Manifest ──────────────────────────────────────────────────────────────
  try {
    setLoading(true);
    manifestData = await loadManifest();
  } catch (err) {
    showError('Gagal memuat manifest: ' + err.message);
  } finally {
    setLoading(false);
  }

  return globeBottom;
}
