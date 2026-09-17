const input = document.querySelector('#query');
const kind = document.querySelector('#kind');
const rows = [...document.querySelectorAll('.project')];
const params = new URLSearchParams(location.search);
if (params.get('scenario') === 'long') {
  const title = rows[0].querySelector('h3');
  title.textContent = 'Agency Agents / 多语言跨部门协作与长期项目研究工作方法说明（合成长标题压力测试）';
  rows[0].dataset.search += ' 多语言跨部门协作与长期项目研究工作方法说明';
}
function filter() {
  const term = input.value.trim().toLocaleLowerCase();
  let total = 0;
  for (const row of rows) {
    row.hidden = !(row.dataset.search.toLocaleLowerCase().includes(term) && (!kind.value || row.dataset.kind === kind.value));
    if (!row.hidden) total++;
  }
  document.querySelector('#count').textContent = `显示 ${total} / ${rows.length} 个项目`;
  document.querySelector('#empty').hidden = total !== 0;
}
function reset() { input.value = ''; kind.value = ''; filter(); input.focus(); }
document.querySelector('#filters').addEventListener('submit', e => { e.preventDefault(); filter(); });
input.addEventListener('input', filter);
kind.addEventListener('change', filter);
document.querySelector('#reset').addEventListener('click', reset);
document.querySelector('#empty-reset')?.addEventListener('click', reset);
if (params.get('scenario') === 'empty') input.value = '不存在的项目';
filter();
