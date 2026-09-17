// The complete catalog is rendered in HTML; JavaScript only adds navigation and filters.
const sections = [...document.querySelectorAll('main > section[id]')];
const navLinks = [...document.querySelectorAll('nav a')];
function updateNavigation() {
  const threshold = window.matchMedia('(max-width: 780px)').matches ? 170 : 125;
  let current = sections[0].id;
  for (const section of sections) if (section.getBoundingClientRect().top <= threshold) current = section.id;
  for (const link of navLinks) {
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

const query = document.querySelector('#role-query');
const department = document.querySelector('#department');
const cards = [...document.querySelectorAll('[data-group]')];
const originalOpen = new Map();
let filtering = false;
function filterRoles() {
  const needle = query.value.trim().toLocaleLowerCase();
  const active = Boolean(needle || department.value);
  if (active && !filtering) for (const card of cards) originalOpen.set(card, card.querySelector('details').open);
  let roleCount = 0, groupCount = 0;
  for (const card of cards) {
    const groupMatches = !department.value || department.value === card.dataset.group;
    let count = 0;
    for (const item of card.querySelectorAll('[data-search]')) {
      const matches = groupMatches && item.dataset.search.toLocaleLowerCase().includes(needle);
      item.hidden = !matches;
      if (matches) count++;
    }
    card.hidden = count === 0;
    card.querySelector('.count').textContent = `${count} 个角色`;
    if (active) card.querySelector('details').open = count > 0;
    else if (filtering) card.querySelector('details').open = originalOpen.get(card) || false;
    roleCount += count;
    if (count) groupCount++;
  }
  filtering = active;
  document.querySelector('#result-count').textContent = `${active ? '找到' : '共'} ${roleCount} 个角色 · ${groupCount} 个部门`;
  document.querySelector('#empty-state').hidden = roleCount !== 0;
}
query.addEventListener('input', filterRoles);
department.addEventListener('change', filterRoles);
document.querySelector('.filters').addEventListener('reset', () => {
  requestAnimationFrame(() => { filterRoles(); query.focus(); });
});
