(() => {
  const tabList = document.querySelector('.scenario-tabs');
  const tabs = [...document.querySelectorAll('.scenario-tab')];
  const panels = [...document.querySelectorAll('.scenario-panel')];
  if (tabList && tabs.length === panels.length) {
    tabList.setAttribute('role', 'tablist');
    tabs.forEach((tab, index) => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panels[index].id);
      panels[index].setAttribute('role', 'tabpanel');
      panels[index].setAttribute('aria-labelledby', tab.id);
      panels[index].tabIndex = 0;
    });
    function select(index, focus = false) {
      tabs.forEach((tab, i) => {
        tab.setAttribute('aria-selected', String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
        panels[i].hidden = i !== index;
      });
      if (focus) tabs[index].focus();
    }
    const initial = panels.findIndex(panel => '#' + panel.id === location.hash);
    select(initial >= 0 ? initial : 0);
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', event => {
        event.preventDefault();
        select(index);
        history.replaceState(null, '', '#' + panels[index].id);
      });
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (event.key === ' ') next = index;
        if (next !== undefined) {
          event.preventDefault();
          select(next, true);
          history.replaceState(null, '', '#' + panels[next].id);
        }
      });
    });
    window.addEventListener('hashchange', () => {
      const index = panels.findIndex(panel => '#' + panel.id === location.hash);
      if (index >= 0) select(index);
    });
  }
  const toggle = document.getElementById('demo-toggle');
  const demoImage = document.getElementById('demo-image');
  if (toggle && demoImage) {
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      const play = toggle.getAttribute('aria-pressed') !== 'true';
      demoImage.src = play ? demoImage.dataset.animation : demoImage.dataset.still;
      demoImage.alt = play ? '上游提供的 Studio 自动组队演示动图' : '上游角色组队界面：输入需求，或手动从中文角色库挑选专家';
      toggle.setAttribute('aria-pressed', String(play));
      toggle.textContent = play ? '收起动图 ■' : '播放上游动图 ▶';
    });
  }
})();
