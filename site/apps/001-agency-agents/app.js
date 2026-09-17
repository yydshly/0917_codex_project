// Progressive enhancement: the full research page works without JavaScript.
const sections = [...document.querySelectorAll('main > section[id]')];
const links = [...document.querySelectorAll('nav a')];
function updateNavigation() {
  const threshold = window.matchMedia('(max-width: 780px)').matches ? 170 : 125;
  let current = sections[0].id;
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= threshold) current = section.id;
  }
  for (const link of links) {
    const active = link.hash === `#${current}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}
let scheduled = false;
window.addEventListener('scroll', () => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => { updateNavigation(); scheduled = false; });
}, { passive: true });
window.addEventListener('resize', updateNavigation);
updateNavigation();
