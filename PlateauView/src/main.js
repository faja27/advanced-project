import { initGlobe, setFrame } from './globe.js';
import { initTimeline } from './timeline.js';

const params      = new URLSearchParams(window.location.search);
const initialTime = Number(params.get('t') ?? 0);
const t           = isFinite(initialTime) ? initialTime : 0;

(async () => {
  await initGlobe('globe-container');
  await setFrame(t);
  await initTimeline(t);
})();
