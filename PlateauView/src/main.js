import { initGlobe, setFrame } from './globe.js';

const params = new URLSearchParams(window.location.search);
const initialTime = Number(params.get('t') ?? 0);

(async () => {
  await initGlobe('globe-container');
  await setFrame(isFinite(initialTime) ? initialTime : 0);
})();
