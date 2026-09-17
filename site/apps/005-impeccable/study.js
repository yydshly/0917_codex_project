let version = 'after';
let scenario = 'normal';
const scenarios = {
  normal: ['任务：找到 Impeccable 并查看研究重点', '搜索 impeccable，或筛选“设计工具”，再展开“研究重点”。观察标题层级、输入提示与操作反馈。'],
  mobile: ['任务：在手机宽度下筛选项目', '选择“工程工具”并查看 Ponytail。对比固定宽度造成的横向滚动与改造后的控件重排。此处为窄视口模拟，不是实体手机。'],
  long: ['任务：读完整的长项目标题', '第一个项目加入明确标注的合成长标题。对比截断隐藏与自然换行；项目名称压力数据只用于本场景。'],
  empty: ['任务：搜索无结果后恢复全部项目', '页面已输入一个无匹配的关键词。对比空白列表与带恢复按钮的说明。点击“查看全部项目”，检查焦点和结果数量。']
};
function update() {
  document.querySelectorAll('[data-version]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.version === version)));
  document.querySelectorAll('[data-scenario]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.scenario === scenario)));
  const url = `${version}.html${['empty', 'long'].includes(scenario) ? '?scenario=' + scenario : ''}`;
  const frame = document.querySelector('#demo');
  frame.src = url;
  frame.title = `${version === 'after' ? '改造后' : '改造前'}的研究看板：${scenarios[scenario][0]}`;
  document.querySelector('.stage').classList.toggle('mobile', scenario === 'mobile');
  document.querySelector('#standalone').href = url;
  document.querySelector('#task-title').textContent = scenarios[scenario][0];
  document.querySelector('#task-copy').textContent = scenarios[scenario][1];
  document.querySelector('#frame-note').textContent = scenario === 'mobile' ? '目标预览宽度 390px；若当前屏幕更窄，则随容器缩小。' : '预览宽度随当前窗口变化。正式检测采用单独的固定尺寸浏览器。';
}
document.querySelectorAll('[data-version]').forEach(b => b.addEventListener('click', () => { version = b.dataset.version; update(); }));
document.querySelectorAll('[data-scenario]').forEach(b => b.addEventListener('click', () => { scenario = b.dataset.scenario; update(); }));
