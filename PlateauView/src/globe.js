import Globe from 'globe.gl';

// ── Cache & in-flight deduplication ──────────────────────────────────────────
const FRAME_CACHE = new Map();  // file → parsed GeoJSON
const FRAME_SIZES = new Map();  // file → raw JSON byte length (for memory stats)
const IN_FLIGHT   = new Map();  // file → Promise<GeoJSON>  (coalesces concurrent fetches)

// ── Globe state ───────────────────────────────────────────────────────────────
let globeInstance   = null;
let manifestData    = null;
let frameGen        = 0;      // latest-wins counter
let lastFrameIdx    = -1;     // index of last requested frame (direction detection)
let displayedFile   = null;   // file currently rendered on globe (skip redundant updates)
let bgPreloadActive = false;
let bgPreloadIdx    = 0;      // shared work-queue index for parallel bg workers

const PRELOAD_AHEAD = 6;     // frames to fetch ahead in the current playback direction

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

// ── Manifest & frame loading ──────────────────────────────────────────────────

async function loadManifest() {
  const res = await fetch('/data/manifest.json');
  if (!res.ok) throw new Error(`manifest.json: HTTP ${res.status}`);
  return res.json();
}

function findNearestFrame(timeMa) {
  const frames = manifestData.frames;
  let best = frames[0];
  let bestDiff = Math.abs(frames[0].time_ma - timeMa);
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
 * Fetch a frame, using cache-first and coalescing concurrent requests for the
 * same file so only one network request is ever in-flight per file.
 */
async function fetchFrame(frame) {
  if (FRAME_CACHE.has(frame.file)) return FRAME_CACHE.get(frame.file);
  if (IN_FLIGHT.has(frame.file))   return IN_FLIGHT.get(frame.file);

  const promise = (async () => {
    try {
      const res = await fetch(`/data/frames/${frame.file}`);
      if (!res.ok) throw new Error(`Frame ${frame.file}: HTTP ${res.status}`);
      // Use text() so we can record the byte length for the memory diagnostic.
      const text    = await res.text();
      const geojson = JSON.parse(text);
      FRAME_SIZES.set(frame.file, text.length);
      FRAME_CACHE.set(frame.file, geojson);
      return geojson;
    } finally {
      IN_FLIGHT.delete(frame.file); // always clean up, even on error
    }
  })();

  IN_FLIGHT.set(frame.file, promise);
  return promise;
}

// ── Directional preload ───────────────────────────────────────────────────────

/**
 * Fire-and-forget preload of `count` frames ahead of `currentIdx`.
 * direction: -1 = toward lower Ma (forward/future), +1 = toward higher Ma (past).
 */
function preloadAhead(currentIdx, count, direction) {
  if (!manifestData || direction === 0) return;
  const total = manifestData.frames.length;
  for (let i = 1; i <= count; i++) {
    const idx = currentIdx + direction * i;
    if (idx < 0 || idx >= total) break;
    fetchFrame(manifestData.frames[idx]).catch(() => {}); // fire-and-forget
  }
}

// ── Background preload (all frames, one at a time) ────────────────────────────

/**
 * Yield to the main thread between fetches so the UI stays responsive.
 * Uses requestIdleCallback when available, falls back to setTimeout.
 */
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
    if (!FRAME_CACHE.has(frame.file)) {
      await fetchFrame(frame).catch(() => {});
    }
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

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Start loading all remaining frames in the background.
 * Call this once after the first frame is on screen.
 * Schedules a cache-stats console report after 10 s.
 */
export function startBackgroundPreload() {
  if (bgPreloadActive || !manifestData) return;
  bgPreloadActive = true;
  bgPreloadWorker(); // non-blocking — intentionally NOT awaited

  setTimeout(() => {
    const { cached, total, estimatedMB } = getCacheStats();
    console.info(
      `[PlateauView] Cache +10 s: ${cached}/${total} frame ter-cache` +
      ` (~${estimatedMB} MB data JSON)`
    );
  }, 10_000);
}

/** Current cache statistics. */
export function getCacheStats() {
  const cached = FRAME_CACHE.size;
  const total  = manifestData?.frames.length ?? 0;
  let bytes = 0;
  for (const s of FRAME_SIZES.values()) bytes += s;
  return { cached, total, estimatedMB: (bytes / 1024 / 1024).toFixed(2) };
}

/**
 * Load the frame nearest to timeMa and update globe polygons.
 *
 * Behaviour:
 *  - If the frame is already cached the globe updates synchronously (no spinner).
 *  - If not yet cached the globe keeps the previous frame visible until the
 *    fetch completes (never goes blank), and shows the spinner only once.
 *  - Automatically preloads PRELOAD_AHEAD frames in the direction of travel.
 *  - Latest-wins: a stale fetch whose generation has been superseded is silently
 *    discarded so it cannot overwrite a newer frame.
 */
export async function setFrame(timeMa) {
  if (!globeInstance || !manifestData) return;

  const frame    = findNearestFrame(timeMa);
  const frameIdx = findFrameIndex(frame);

  // Detect direction (sign of index delta) and preload ahead.
  const direction = lastFrameIdx < 0 ? 0 : Math.sign(frameIdx - lastFrameIdx);
  lastFrameIdx    = frameIdx;
  preloadAhead(frameIdx, PRELOAD_AHEAD, direction);

  // Increment gen first so any stale in-flight fetch for this same file is discarded.
  const gen = ++frameGen;
  if (frame.file === displayedFile) return;  // already on screen — nothing to do

  const alreadyReady = FRAME_CACHE.has(frame.file);
  if (!alreadyReady) setLoading(true);

  try {
    const geojson = await fetchFrame(frame);
    if (gen !== frameGen) return;             // superseded — newer request won
    globeInstance.polygonsData(geojson.features);
    displayedFile = frame.file;
  } catch (err) {
    if (gen === frameGen) showError(err.message);
  } finally {
    if (!alreadyReady && gen === frameGen) setLoading(false);
  }
}

export async function initGlobe(containerId) {
  const container = document.getElementById(containerId);

  const globe = Globe()(container)
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

  const mat = globe.globeMaterial();
  mat.color.set(0x002d50);
  mat.emissive.set(0x001525);
  mat.emissiveIntensity = 0.6;

  const controls = globe.controls();
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

  window.addEventListener('resize', () => {
    globe.width(container.clientWidth).height(container.clientHeight);
  });

  globeInstance = globe;

  try {
    setLoading(true);
    manifestData = await loadManifest();
  } catch (err) {
    showError('Gagal memuat manifest: ' + err.message);
  } finally {
    setLoading(false);
  }

  return globe;
}
