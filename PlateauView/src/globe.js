import Globe from 'globe.gl';

const FRAME_CACHE = new Map();
let globeInstance = null;
let manifestData = null;

// --- UI helpers ---

function setLoading(visible) {
  document.getElementById('loading-indicator').classList.toggle('visible', visible);
}

function showError(msg) {
  const el = document.getElementById('error-message');
  el.textContent = msg;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 5000);
}

// --- Manifest & frame loading ---

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
    if (diff < bestDiff) {
      bestDiff = diff;
      best = frames[i];
    }
  }
  return best;
}

async function fetchFrame(frame) {
  if (FRAME_CACHE.has(frame.file)) return FRAME_CACHE.get(frame.file);
  const res = await fetch(`/data/frames/${frame.file}`);
  if (!res.ok) throw new Error(`Frame ${frame.file}: HTTP ${res.status}`);
  const geojson = await res.json();
  FRAME_CACHE.set(frame.file, geojson);
  return geojson;
}

// --- Public API ---

/**
 * Load the frame nearest to timeMa and update globe polygons.
 * Called by Tahap 3+ (slider, animation loop).
 */
export async function setFrame(timeMa) {
  if (!globeInstance || !manifestData) return;

  const frame = findNearestFrame(timeMa);
  setLoading(true);
  try {
    const geojson = await fetchFrame(frame);
    globeInstance.polygonsData(geojson.features);
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

export async function initGlobe(containerId) {
  const container = document.getElementById(containerId);

  const globe = Globe()(container)
    .width(container.clientWidth)
    .height(container.clientHeight)
    // Dark space background; transparent lets CSS #000814 show
    .backgroundColor('rgba(0,0,0,0)')
    // Thin blue atmosphere
    .atmosphereColor('#1a5080')
    .atmosphereAltitude(0.12)
    // Polygon layer: GeoJSON Feature objects → extract .geometry
    .polygonGeoJsonGeometry(d => d.geometry)
    .polygonCapColor(() => '#c8a96e')   // warm cream/brown land
    .polygonSideColor(() => 'rgba(0,0,0,0)')
    .polygonStrokeColor(() => null)     // no border
    .polygonAltitude(0.004);

  // Ocean color: modify the default MeshPhongMaterial directly
  const mat = globe.globeMaterial();
  mat.color.set(0x002d50);
  mat.emissive.set(0x001525);
  mat.emissiveIntensity = 0.6;

  // --- Controls ---
  const controls = globe.controls();
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.35;
  controls.minDistance = 115;   // cannot zoom into surface
  controls.maxDistance = 560;   // cannot zoom out too far

  // Pause auto-rotate while user interacts; resume after 2.5 s of idle
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

  // Load manifest; on failure show error but still return globe
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
