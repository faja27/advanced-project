import Globe from 'globe.gl';

export function initGlobe(containerId) {
  const container = document.getElementById(containerId);

  const globe = Globe()(container)
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
    .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
    .width(container.clientWidth)
    .height(container.clientHeight);

  // Auto-rotate when idle
  globe.controls().autoRotate = true;
  globe.controls().autoRotateSpeed = 0.5;

  // Resize handler
  window.addEventListener('resize', () => {
    globe.width(container.clientWidth).height(container.clientHeight);
  });

  return globe;
}
