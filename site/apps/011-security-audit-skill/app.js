'use strict';
const base = 'https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/';
const phases = [
  ['侦察', '先弄清系统保护什么', '分别梳理产品与技术栈、身份权限、外部输入到敏感操作的路径，以及本地执行与部署可见性。主代理据此建立初始覆盖记录。', '四个基础侦察角色 + 主代理', 'architecture.md / coverage-ledger.json', 'RECONNAISSANCE.md'],
  ['调查', '沿边界追踪，逐项补齐覆盖', '调查者接收架构、指定覆盖单元和相应领域规则，返回结构化检查、候选和遗漏。每轮由覆盖检查代理审查遗漏与证据不足的关闭项。', '调查代理 + 覆盖检查代理', '检查证据 / 候选 / 补查任务', 'HUNTING.md'],
  ['验证', '让另一个代理尝试推翻疑点', '按稳定指纹与根因去重。新验证者重读当前源码，寻找最强防护，必要时独立复现最小本地结果，确认成立条件和实际影响。', '未参与发现的独立验证者', 'confirmed / needs_validation / rejected', 'VALIDATION-AND-REPORTING.md'],
  ['记录', '把判断写进明确的数据契约', '主代理写入 findings.json，运行发现与覆盖校验器。检查必填字段、路径、状态、唯一性和严重性一致性；程序不证明漏洞事实。', '主代理 + Node.js 校验器', '通过规则检查的 JSON 记录', 'report-schema.json'],
  ['复核', '核对最终记录，而非先前印象', '新验证者检查源码引用、输入条件、观察结果、影响与修复。若最终修改显著改变根因、影响或等级，还要再交新的独立验证者。', '新的最终记录验证者', '已复核记录 / 明确未完成原因', 'VALIDATION-AND-REPORTING.md'],
  ['报告', '从记录派生，让文字忠于证据', '用最终记录生成汇总报告、详细发现与待验证说明，同时列出范围、延期和受阻单元。不能在写报告时强化结论或隐藏未完成任务。', '主代理', 'REPORT / FINDINGS-DETAIL / NEEDS-VALIDATION', 'VALIDATION-AND-REPORTING.md']
];
const profiles = {
  standard: '标准：按覆盖记录推进调查与补查；候选验证和最终记录复核分别由独立代理完成，另有最终覆盖检查。',
  quick: '快速：粗粒度覆盖，恰好一轮调查与一次最终覆盖检查；候选验证合并最终记录复核。新增补查项记为延期，属于部分覆盖。',
  deep: '深度：进一步按子系统与生命周期拆分；覆盖检查持续到无接受的补查任务，并对以前同源码已覆盖单元安排独立复查。'
};
let currentPhase = 0;
const steps = document.querySelector('#steps');
phases.forEach((p, i) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-controls', 'phase-panel');
  button.innerHTML = `<span>0${i + 1}</span><strong>${p[0]}</strong>`;
  button.addEventListener('click', () => { currentPhase = i; renderPhase(); });
  steps.append(button);
});
function renderPhase() {
  const profile = document.querySelector('#profile').value;
  document.querySelector('#profile-note').textContent = profiles[profile];
  [...steps.children].forEach((button, i) => button.setAttribute('aria-pressed', String(i === currentPhase)));
  const [name, title, text, owner, output, file] = phases[currentPhase];
  const quickText = profile === 'quick' && (currentPhase === 2 || currentPhase === 4)
    ? '快速模式将候选验证与最终记录复核合并，由同一名未参与发现的验证者完成，仍要求完整证据和最终结构化记录。' : text;
  const actualOwner = profile === 'quick' && currentPhase === 4 ? '候选阶段的独立验证者（合并复核）' : owner;
  document.querySelector('#phase-panel').innerHTML = `<div class="phase-number">PHASE 0${currentPhase + 1} / ${name}</div><h3>${title}</h3><p>${quickText}</p><div class="phase-facts"><div><span>谁负责</span><strong>${actualOwner}</strong></div><div><span>留下什么</span><strong>${output}</strong></div></div><a class="source" href="${base}${file}">核对上游规则 ↗</a>`;
}
document.querySelector('#profile').addEventListener('change', renderPhase);
renderPhase();

const domains = [
  ['base','注入','沿不可信输入追踪到命令、查询、模板等解释执行位置，确认有效防护与实际影响。','ATTACK-CLASSES.md'],
  ['base','访问控制','检查身份认证、对象归属、租户范围和操作权限，寻找跨边界访问。','ATTACK-CLASSES.md'],
  ['base','资源与文件处理','检查路径、文件和归档输入如何到达读写操作，以及范围和资源约束。','ATTACK-CLASSES.md'],
  ['base','密码学与秘密','核对密钥、令牌和敏感信息的使用与暴露路径，追踪具体后果。','ATTACK-CLASSES.md'],
  ['base','业务逻辑','检查状态转换、顺序、重试和异常路径是否破坏业务安全约束。','ATTACK-CLASSES.md'],
  ['base','功能滥用与数据泄漏','分析合法操作如何影响他人、共享资源或不应暴露的数据。','ATTACK-CLASSES.md'],
  ['base','组合漏洞与信任边界','比较组件之间的保证与假设，核对二次使用、权限增长和恢复路径。','ATTACK-CLASSES.md'],
  ['base','开放探索','调查兼容、回退、冷门和不寻常代码，在指定范围内寻找标准分类之外的问题。','ATTACK-CLASSES.md'],
  ['base','基础暴露检查','检查秘密、调试入口、默认凭据和常见危险用法，再追踪实际影响。','ATTACK-CLASSES.md'],
  ['domain','内存安全与二进制','边界与整数、生命周期、并发、FFI / ABI、加载器和特权接口。','MEMORY-SAFETY-AND-BINARY.md'],
  ['domain','AI / LLM / MCP','提示注入、检索与记忆污染、工具动作绑定、MCP 身份与输出处理。','AI-AND-LLM.md'],
  ['domain','HTTP 与认证协议','HTTP 分帧、缓存、浏览器会话、联合身份、MFA / passkey、API key 与 mTLS。','WEB-PROTOCOL-AND-AUTH.md'],
  ['domain','浏览器端','DOM 注入、跨源消息、Service Worker、浏览器存储与界面欺骗。','CLIENT-SIDE.md'],
  ['domain','供应链与发布','依赖与构建输入、CI 自动化权限、发布签名与更新流程。','SUPPLY-CHAIN-AND-RELEASE.md'],
  ['domain','云与部署','工作负载身份、IAM、入口网络、容器、配置与秘密生命周期。','CLOUD-AND-DEPLOYMENT.md'],
  ['domain','RPC 与消息','分帧和解释差异、序列化、RPC 授权、队列隔离、重放与顺序。','PROTOCOLS-RPC-AND-MESSAGING.md'],
  ['domain','资源耗尽与可用性','计算放大、资源累积、配额、调度与故障恢复；只做受限本地检查。','RESOURCE-EXHAUSTION-AND-AVAILABILITY.md'],
  ['domain','数据隔离与生命周期','租户、缓存、搜索、导出、备份恢复、迁移、删除与撤销。','DATA-ISOLATION-AND-LIFECYCLE.md'],
  ['domain','桌面、移动端与本地 IPC','深链、WebView 原生桥、导出组件、特权辅助进程和设备状态。','DESKTOP-MOBILE-AND-LOCAL-IPC.md']
];
let filter = 'all';
function renderDomains() {
  const term = document.querySelector('#search').value.trim().toLocaleLowerCase();
  const matched = domains.filter(d => (filter === 'all' || d[0] === filter) && `${d[1]} ${d[2]} ${d[3]}`.toLocaleLowerCase().includes(term));
  document.querySelector('#domain-grid').innerHTML = matched.map(d => `<article class="domain-card"><small>${d[0] === 'base' ? 'FOUNDATION / 基础方法' : 'SPECIALIST / 专项领域'}</small><h3>${d[1]}</h3><p>${d[2]}</p><a href="${base}${d[3]}">查看该领域规则 ↗</a></article>`).join('');
  document.querySelector('#count').textContent = `${matched.length} / ${domains.length} 项`;
  document.querySelector('#empty').hidden = matched.length !== 0;
}
document.querySelector('#search').addEventListener('input', renderDomains);
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  renderDomains();
}));
renderDomains();

const cases = {
  confirmed: ['已确认：边界失败得到支持', '假设已在隔离本地环境用虚拟用户重现跨租户读取，源码路径与成立条件完整，并经独立验证者核实。', '源码路径 + 最小本地观察结果 + 独立验证', '只有此状态可以赋予严重性；仍应依据已证明的影响评定。本示例不虚构分数。', '说明应强制执行的租户约束，并提出最小修复与回归用例。'],
  needs_validation: ['待验证：关键事实仍然未知', '假设源码中的查询没有租户条件，但实际隔离取决于不可见的数据库行级策略，无法确定运行时是否真正跨越边界。', '完整疑点路径 + 明确阻碍 + 可执行验证计划', '不赋予严重性，也不把缺少的部署事实视为不存在。', '请维护者确认当前查询身份与行级策略，或在隔离环境构造对应策略的虚拟租户检查。'],
  rejected: ['已排除：有效控制推翻疑点', '假设独立验证者发现所有相关请求都必须经过所有权校验，且该控制能够阻止跨租户读取。原先的必要前提不成立。', '必经控制的位置 + 阻断路径的源码依据', '不作为漏洞展示；保留排除原因，避免同一未变化的错误主张重复出现。', '记录该根因指纹与排除依据；源码发生相关变化后再重新审查。']
};
function renderCase(key) {
  const data = cases[key];
  document.querySelectorAll('[data-case]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.case === key)));
  document.querySelector('#case-result').innerHTML = `<div class="verdict">${key}</div><h3>${data[0]}</h3><p>${data[1]}</p><dl><dt>证据门槛</dt><dd>${data[2]}</dd><dt>如何报告</dt><dd>${data[3]}</dd><dt>下一步</dt><dd>${data[4]}</dd></dl>`;
}
document.querySelectorAll('[data-case]').forEach(b => b.addEventListener('click', () => renderCase(b.dataset.case)));
renderCase('confirmed');
