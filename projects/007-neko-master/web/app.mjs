import { scenarios, initialState, ingest, flush, total } from './model.mjs';
const $ = id => document.getElementById(id);
const base = 'https://github.com/foru17/neko-master/blob/6f72cfd0db69e2952713f24a648812407fef1e78/';
const gallery = {
  overview: { file: 'neko-master-overview-light.png', alt: '上游浅色总览：总流量、连接数、时间趋势及域名、代理、地区排名', caption: '总览 / 观察峰值，再选择设备、域名或节点继续分析。' },
  domains: { file: 'neko-master-domains-dark.png', alt: '上游深色域名分析：域名的流量、连接数和关联信息', caption: '域名 / 找到高用量服务；名称依赖网关提供的元数据。' },
  rules: { file: 'neko-master-rules-dark.png', alt: '上游深色规则分析：规则统计与策略组、代理节点的选择路径', caption: '规则 / 解释分流选择；策略链不等于真实网络逐跳路由。' },
  regions: { file: 'neko-master-regions-light.png', alt: '上游浅色地区分析：目的地址的地图分布和地区统计', caption: '地区 / 目的 IP 的地理位置与归属，不代表访问者实际位置。' }
};
document.querySelectorAll('[data-view]').forEach(button => {
  button.disabled = false;
  button.addEventListener('click', () => {
    const view = gallery[button.dataset.view];
    document.querySelectorAll('[data-view]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    $('capability-image').src = view.file;
    $('capability-image').alt = view.alt;
    $('original-link').href = view.file;
    $('gallery-caption').textContent = view.caption;
    $('screenshot-source').href = `${base}assets/${view.file}`;
  });
});
let state = initialState();
let frame = 0;
let scenario = 'normal';
const format = n => n === null ? '—' : n.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
function render() {
  for (const name of ['current','previous','delta','stored','pending','connections']) $(name).textContent = format(state[name]);
  $('total').textContent = format(total(state));
  $('frame-label').textContent = frame ? `快照 ${frame} / ${scenarios[scenario].frames.length}` : '尚未读取快照';
  $('next').disabled = frame >= scenarios[scenario].frames.length;
  $('next').textContent = $('next').disabled ? '已读完全部快照' : '读取下一帧 →';
  $('flush').disabled = state.pending === 0;
}
function restart() {
  state = initialState(); frame = 0;
  $('explanation').textContent = '点击“读取下一帧”，从第一份连接快照开始。';
  $('lab-log').textContent = `已选择“${scenarios[scenario].title}”。所有数字都是人工构造的教学数据。`;
  render();
}
$('scenario').disabled = false;
$('scenario').addEventListener('change', event => { scenario = event.target.value; restart(); });
$('restart').disabled = false;
$('restart').addEventListener('click', restart);
$('next').addEventListener('click', () => {
  if (frame >= scenarios[scenario].frames.length) return;
  state = ingest(state, scenarios[scenario].frames[frame]);
  $('explanation').textContent = scenarios[scenario].notes[frame];
  frame++;
  $('lab-log').textContent = `快照 ${frame}：新增 ${format(state.delta)} MB；数据库 ${format(state.stored)} + 内存 ${format(state.pending)} = 面板 ${format(total(state))} MB。`;
  render();
});
$('flush').addEventListener('click', () => {
  const written = state.pending;
  state = flush(state);
  $('lab-log').textContent = `模拟落盘 ${format(written)} MB：已转入数据库并清空内存，面板总量仍为 ${format(total(state))} MB。`;
  render();
});
render();
const modes = {
  direct: { label: '中心可以访问网关 API', steps: ['Clash / Surge 网关', '中心采集服务', '统计与面板'], description: 'Clash 通过 WebSocket；Surge 通过 HTTP 轮询。适合中心与网关网络可达的环境。' },
  agent: { label: '网关附近采集，主动上报中心', steps: ['远程网关', 'Go Agent / HTTP 采集', '中心接收增量'], description: '该提交 Go Agent 对 Clash / Surge 均使用 HTTP 轮询，在本地计算增量再上报中心；中心不必反向直连远程网关。Token 鉴权、心跳和重试去重支持分布式接入。' }
};
document.querySelectorAll('[data-mode]').forEach(button => {
  button.disabled = false;
  button.addEventListener('click', () => {
    const mode = modes[button.dataset.mode];
    document.querySelectorAll('[data-mode]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    $('mode-label').textContent = mode.label;
    $('mode-description').textContent = mode.description;
    $('mode-flow').replaceChildren();
    mode.steps.forEach((step, index) => {
      if (index) { const arrow = document.createElement('b'); arrow.textContent = '→'; arrow.setAttribute('aria-hidden','true'); $('mode-flow').append(arrow); }
      const node = document.createElement('span'); node.textContent = step; $('mode-flow').append(node);
    });
  });
});
