import { initGlobe, setFrame, startBackgroundPreload } from './globe.js';
import { initTimeline } from './timeline.js';
import { initEraPanel } from './era-panel.js';
import { initPlayback } from './playback.js';

const params      = new URLSearchParams(window.location.search);
const initialTime = Number(params.get('t') ?? 0);
const t           = isFinite(initialTime) ? initialTime : 0;

(async () => {
  await initGlobe('globe-container');
  await setFrame(t);
  startBackgroundPreload();    // first frame is on screen → load the rest quietly
  await initEraPanel(t);
  await initTimeline(t);
  initPlayback();
})();
