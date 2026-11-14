import { initGlobe, setFrame } from './globe.js';
import { initTimeline } from './timeline.js';
import { initEraPanel } from './era-panel.js';

const params      = new URLSearchParams(window.location.search);
const initialTime = Number(params.get('t') ?? 0);
const t           = isFinite(initialTime) ? initialTime : 0;

(async () => {
  await initGlobe('globe-container');
  await setFrame(t);
  await initEraPanel(t);   // register listener before timeline dispatches
  await initTimeline(t);   // sync() dispatches initial 'plateauview:timechange'
})();
