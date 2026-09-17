'use strict';
const examples = {
  product: ['这项革命性的功能不仅是一种工具，更是团队效率的飞跃。它可以把会议记录整理成待办清单，让我们一起开启协作的新篇章。', '这个功能可以把会议记录整理成待办清单。', '保留具体功能，删去无依据的“革命性”“效率飞跃”和口号式结尾。'],
  report: ['首先，让我们回顾本周取得的重要进展。团队完成了 3 个接口，并修复了 2 个问题。这些成果充分彰显了团队追求卓越的坚定承诺。', '本周团队完成了 3 个接口，修复了 2 个问题。', '保留时间、主体和数量，删除没有新增信息的开场与自我评价。'],
  docs: ['好问题！下面让我们深入了解这项功能。配置文件会在启动时读取。配置文件会在保存时校验。配置文件校验失败时会保留上一次有效配置。希望这对你有帮助！', '系统在启动时读取配置文件，在保存时校验内容。如果校验失败，会保留上一次有效配置。', '删除聊天外壳，合并重复的句子开头；启动、保存、校验失败三种条件仍然保留。']
};
document.querySelectorAll('[data-example]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-example]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    const [before, after, reason] = examples[button.dataset.example];
    document.getElementById('before-text').textContent = before;
    document.getElementById('after-text').textContent = after;
    const paragraph = document.getElementById('example-reason');
    const label = document.createElement('strong');
    label.textContent = '为什么这样改：';
    paragraph.replaceChildren(label, document.createTextNode(reason));
  });
});
const search = document.getElementById('rule-search');
const rules = Array.from(document.querySelectorAll('.rule'));
const groupButtons = Array.from(document.querySelectorAll('.filters button'));
const groupNames = {A:'表达姿态', B:'机械节奏', C:'夸大与权威', D:'机械格式', E:'聊天残留'};
let selectedGroup = 'all';
function filterRules() {
  const term = search.value.trim().toLocaleLowerCase();
  let visible = 0;
  rules.forEach(rule => {
    const searchableText = groupNames[rule.dataset.group] + rule.textContent;
    const matches = (selectedGroup === 'all' || rule.dataset.group === selectedGroup) && searchableText.toLocaleLowerCase().includes(term);
    rule.hidden = !matches;
    if (matches) visible++;
  });
  document.getElementById('rule-count').textContent = `显示 ${visible} / 25 条规则`;
  document.getElementById('empty-state').hidden = visible !== 0;
}
groupButtons.forEach(button => button.addEventListener('click', () => {
  selectedGroup = button.dataset.group;
  groupButtons.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
  filterRules();
}));
search.addEventListener('input', filterRules);
document.getElementById('reset-filter').addEventListener('click', () => {
  selectedGroup = 'all';
  search.value = '';
  groupButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.group === 'all')));
  filterRules();
  search.focus();
});
document.querySelector('.rule-tools').hidden = false;
