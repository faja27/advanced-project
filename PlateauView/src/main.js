import { initTimeline } from './timeline.js';
import { initEraPanel } from './era-panel.js';
import { initPlayback } from './playback.js';
import { initBench } from './bench.js';

const params      = new URLSearchParams(window.location.search);
const initialTime = Number(params.get('t') ?? 0);
const t           = isFinite(initialTime) ? initialTime : 0;
const mode        = params.get('mode');

(async () => {
  const { initGlobe, setFrame, startBackgroundPreload } = mode === 'texture'
    ? await import('./globe-texture.js')
    : await import('./globe.js');

  await initGlobe('globe-container');
  await setFrame(t);
  startBackgroundPreload();
  await initEraPanel(t);
  await initTimeline(t);
  initPlayback();
  initBench();
})();
