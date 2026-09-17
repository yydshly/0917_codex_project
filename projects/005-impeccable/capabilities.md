# Impeccable：能力与技术原理

研究基准：2026-09-17；源码 [f2c7051853848826aac2f4646581d62a732155ad](https://github.com/pbakaus/impeccable/tree/f2c7051853848826aac2f4646581d62a732155ad)。提供工作指南不代表本研究已逐项实测。

## 阶段摘要

面向前端界面优化：Skill 提供通用设计约束，用户明确风格和特殊要求，大模型据此细化方案并实现，检测器辅助检查。对我可作为网页改进的方法与验收参考；具体能力、适用场景和实际增益仍需后续逐项梳理与验证。

本文件是初步能力目录和源码分析；不代表所有命令已实跑。模型能力提升后，通用提醒的增益可能下降；实际价值须按目标项目和当前模型重新评价。

## 定位

设计知识存在 Markdown Skill 和参考文件里；宿主模型使用自己的工具修改代码；Rust 引擎承担可重复的检测、上下文管理和本地服务。它既有提示词与上下文工程，也有实际可执行程序。它不提供基础模型，也不是一套供业务应用导入的 UI 组件库。

## 完整命令清单

| 命令 | 能力与典型场景 | 本次验证 |
| --- | --- | --- |
| craft | 普通新建请求的别名；源码已标 deprecated | 源码核查 |
| init | 收集用户、目标、约束，写 PRODUCT.md | context 实跑；未完整访谈 |
| document | 从既有实现记录 DESIGN.md | 指南分析 |
| extract | 提取组件和 tokens | 指南分析 |
| shape | 实现前规划 UX/UI | 指南分析 |
| critique | 视觉层级、信息结构、认知负担等体验评审 | 指南分析，未执行完整双评审 |
| audit | 无障碍、性能、主题、响应式与实现审查 | 检测子能力实跑，非完整 audit |
| polish | 交付前细节与一致性检查 | 指南分析 |
| bolder | 增强平淡设计的表现 | 指南分析 |
| quieter | 降低过强视觉刺激 | 指南分析 |
| distill | 精简视觉与结构复杂度 | 指南分析 |
| harden | 长文本、空状态、错误与边界 | 实践长标题和空结果 |
| onboard | 首次使用、空状态与激活路径 | 指南分析 |
| animate | 有目的的交互动画 | 指南分析 |
| colorize | 用颜色建立角色与强调 | 指南分析 |
| typeset | 字体角色、字号、层级、可读性 | 实践字号与层级原则 |
| layout | 分组、布局、间距、响应式结构 | 实践列表和手机布局 |
| delight | 与任务相符的体验细节 | 指南分析 |
| overdrive | 高表现力的特殊视觉技术 | 指南分析 |
| clarify | 标签、操作提示、错误文案 | 应用明确标签与恢复提示 |
| adapt | 不同设备和容器适配 | 指南分析；窄屏行为另验 |
| optimize | UI 性能诊断与改善 | 未测性能增益 |
| live | 浏览器选元素、生成和选择方案 | 源码分析，未实跑 |
| generate | 直接指定元素生成变体 | 源码分析，未实跑 |

数量依据 [Skill Commands 表](https://github.com/pbakaus/impeccable/blob/f2c7051853848826aac2f4646581d62a732155ad/skill/SKILL.src.md)。pin、hooks、doctor 及辅助动词另计；24 不是所有可执行子命令总数。

## 技术结构

### 设计知识与上下文

skill/SKILL.src.md 负责路由，skill/reference/ 保存具体工作指南；crates/context 解析项目范围并加载产品、设计与页面资料。PRODUCT.md 保存产品事实，DESIGN.md 保存视觉规范和可机器读取的 token，页面说明保存局部目标。

访问者模式分为 Persuade（促进行动）、Operate（完成操作）、Read（理解内容）、Experience（体验作品）。本研究说明页属于 Read，看板属于 Operate。模式与具体页面相关，不应把整个产品固定成一种风格。

### 确定性规则引擎

| 模块 | 输入与原理 | 局限 |
| --- | --- | --- |
| crates/detect | 文件遍历、文本/正则及专项模式分析 | 不完全理解任意动态代码 |
| crates/html | HTML 解析、CSS 级联与静态 DOM | 静态近似不同于浏览器渲染 |
| crates/browser | 发现 Chromium，使用 CDP 加载网页和采集 DOM/计算样式/布局快照 | 需要浏览器与可访问页面，有限状态覆盖 |
| crates/core + foundation | 规则逻辑、阈值、颜色计算、注册表、共享类型 | 61 条规则不是完整质量标准 |
| crates/wasm | 将共享核心编译到 WebAssembly | 供扩展、页面工具等运行 |

当前 URL 实现通过 JavaScript 采集快照，在本机 Rust 运行规则；浏览器扩展/页面工具另有 WASM 复用路径。旧 ADR 与部分帮助仍提 Puppeteer/Node，应以当前实现为准。[browser 源码](https://github.com/pbakaus/impeccable/blob/f2c7051853848826aac2f4646581d62a732155ad/crates/browser/src/lib.rs) · [ENGINE.md](https://github.com/pbakaus/impeccable/blob/f2c7051853848826aac2f4646581d62a732155ad/docs/ENGINE.md)

输出包括规则 ID、描述、严重度、文件/URL、样式片段等；退出码 0 为无主要发现，2 为有发现，1 为操作失败，建议项另计。检测本身不需要 LLM 或 API Key，但如何修正仍需模型或开发者判断。audit 是更广的 AI 工作流程，detect 是其可用的程序检查，二者不能等同。

### Live 预览与接受

浏览器选择目标元素，本地 HTTP 服务传给 Agent；SSE 推送状态，Agent 通过长轮询接收事件。模型生成变体，开发服务器热更新或框架适配器负责渲染，选择后保留相应代码并清理临时状态。

普通源码预览与 Svelte 临时组件预览不同，不能笼统说所有变体都立即改写主页面。Live 要求本地源码；线上站点主要用于检测/观察。研究页前后切换是原创静态展示，**不是官方 Live**。[Live 指南](https://github.com/pbakaus/impeccable/blob/f2c7051853848826aac2f4646581d62a732155ad/skill/reference/live.md)

### 宿主适配与 Hook

scripts/lib/transformers/ 从同一 Skill 源材料生成不同宿主的目录、元数据和 Hook 配置；crates/skills 负责安装、更新和链接。npm CLI 是同一引擎的入口，不是必须加入业务应用的运行依赖。

crates/hook 提供编辑后的快速检查与结束阶段深检查。支持 Skill 不等于所有宿主都支持自动 Hook，具体入口和信任要求需要分别确认。本次没有安装或验证 Hook。

## 使用价值与边界

工程质量规则如 low-contrast、text-overflow，和审美偏好如 overused-font、side-tab 并存。后者要考虑品牌、产品惯例和明确需求，不能为了零命中机械地替换正确设计。

本例正文改为 16px、提高对比度、移除无信息意义的侧边装饰，沿用研究仓库的系统中文字体栈，优先稳定加载与可读性。没有宣称“审美提升 100%”。本次支持具体问题能够检查和修正，不支持通用模型增益、节约 tokens/时间、转化率提高或完整无障碍合规等结论。

后续因果验证应采用同任务、同模型与预算、多次独立运行、有/无 Skill 分组，结合盲评和任务成功率；本次人为基线不能替代该实验。

## 源码导航

源码统一固定到上述 commit：入口 skill/SKILL.src.md；方法 skill/reference/{typeset,layout,harden,audit}.md；规则 crates/core/src/checks 与 crates/foundation/src/registry.rs；检测路径 crates/{detect,html,browser}；浏览器复用 crates/wasm、browser-bundle、extension；实时工作流 crates/live；适配 scripts/lib/transformers。
