# 004 · Ponytail

Ponytail 指导 AI 在开发前先理解需求和调用链，优先复用已有代码、标准库、平台原生功能与已安装依赖，只补真正缺少的代码；也提供当前改动审查、全库精简建议和已标记技术债汇总，帮助减少重复实现、无用抽象和维护负担。

核心是 **Skill 工程规则 + 上下文送达机制**。宿主可以直接加载 Skill，也可以通过插件与 Hooks 自动加载、读取静态规则文件，或通过 MCP 按需取得规则。规则进入模型上下文后，宿主 AI 使用原有工具读取项目、判断方案、修改代码并验证。四条接入路径可以按需选择；这些工程原则属于提示约束，不能自动保证模型正确复用或拦截所有不合理实现。

![Ponytail 原理全景图：作用与能力、四条接入路径、上下文构建、复用决策、日期筛选案例及约束边界；本研究原创说明图](assets/capability-summary.png)

[查看可放大的矢量图](assets/capability-summary.svg) · [图中文字](assets/capability-summary-text.md) · [来源与绘制说明](assets/README.md)

| 信息 | 内容 |
| --- | --- |
| 上游 | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) |
| 研究基准 | 包版本 `4.10.0`；commit [`e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156`](https://github.com/DietrichGebert/ponytail/commit/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156) |
| commit 日期 / 研究日期 | 2026-09-14 / 2026-09-17 |
| 许可证 | MIT，Copyright (c) 2026 DietrichGebert |
| 技术构成 | Markdown 技能与规则、JavaScript / Node.js 接入层、可选 MCP 服务、宿主插件描述文件 |
| 本次范围 | 能力与源码分析、评测口径核查、规则副本检查、3 项 MCP 指令构建测试、7 步隔离 Hook 验证及交互研究网页 |
| 尚未验证 | 宿主安装与真实会话、模型输出质量、项目实际节省的代码/成本/时间、MCP 客户端端到端调用 |
| 详细材料 | [能力与技术原理](capabilities.md) · [整体构成与执行机制](architecture.md) · [研究与验证记录](notes.md) · [元数据](project.json) |
| 交互研究网页 | [在线能力总览与案例](https://yydshly.github.io/0917_codex_project/apps/004-ponytail/) · [在线原理全景图与详解](https://yydshly.github.io/0917_codex_project/apps/004-ponytail/architecture.html#guide) · [网页维护与本地预览](web/README.md) |

## 解决什么问题

AI 编程助手容易为小需求添加新依赖、单实现接口、多层包装和未来配置。Ponytail 将“是否真的需要这些代码”变成持续的决策规则，减少无必要的实现和维护负担。

例如日期选择需求在浏览器原生控件足够时，可以采用 `<input type="date">`。节省来自方案选择，不能把原生输入框与带复杂范围选择、品牌视觉和跨平台一致性交互的日历组件视为天然等价。如果这些功能是明确需求，核心规则要求保留。

这是设计原则的说明示例，非本次模型生成或浏览器运行结果。规则依据见[核心技能](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/skills/ponytail/SKILL.md)。

## 能力概览

| 能力 | 产出或行为 | 主要边界 |
| --- | --- | --- |
| 精简实现 | 优先复用已有能力，减少未经请求的抽象和依赖 | 提示词约束，最终判断取决于模型 |
| 强度调节 | `lite`、`full`、`ultra`，以及关闭模式 | 实际切换能力取决于宿主接入方式 |
| `ponytail-review` | 当前 diff 的可删除/替换清单 | 只报告，不修改；不替代完整代码审查 |
| `ponytail-audit` | 全仓库可精简位置，按潜在缩减量排序 | 行数和依赖缩减属于模型建议，未实际修改验证 |
| `ponytail-debt` | 从 `ponytail:` 注释提取局限与升级条件 | 只覆盖已标记的债务，不会自动发现所有技术债 |
| `ponytail-gain` | 展示上游历史基准收益 | 非当前仓库测量，而且本版本仍保留旧版数字 |
| `ponytail-help` | 命令帮助 | 不增加代码分析能力 |
| 多宿主接入 / MCP | 把规则交给支持插件、规则文件或 MCP 的助手 | 不提供独立模型、代码执行器或通用编排引擎 |

## 技术原理

1. **规则内容**：`skills/ponytail/SKILL.md` 定义需求判断、复用优先级、安全边界与模式差异。
2. **送达路径**：直接调用 Skill、插件与 Hooks、静态规则文件和 MCP 是可选择的接入方式，不是必须依次经过的四个步骤。
3. **动态构建**：在插件与 Hooks 路径中，事件脚本读取配置和当前模式；`ponytail-instructions.js` 读取技能正文、去掉文件头，保留当前强度对应的表格行和示例，再按宿主格式输出上下文。MCP 复用构建器按需返回文本；直接 Skill 和静态规则路径不必经过这套脚本。
4. **实际决策**：模型先阅读相关代码，再按“必要性 → 仓库已有实现 → 标准库 → 平台原生 → 已有依赖 → 简短实现 → 必要的新代码”选择第一个满足明确需求的方案，使用宿主原有工具完成编辑和检查。

因此，实际机制是**规则文本 + 上下文注入 + 模式管理**。审查、简化和技术债解释主要由模型执行；接入代码没有将“不要过度设计”转化为确定性的 AST 重写或提交阻断规则。

不同宿主并非每轮都采用同一种注入机制。共用 Hooks 配置包含会话启动、子代理启动和用户输入三个事件；OpenCode 适配器每轮追加系统上下文；MCP 则按请求返回文本。[详细源码入口与接入差异](capabilities.md#接入与运行机制)

## 收益证据应怎样理解

上游 2026-06-18 报告使用 Haiku 4.5，在 FastAPI + React 项目的 12 个功能任务上，每任务每组运行 4 次，报告新增代码行数约减少 54%、tokens 减少 22%、费用减少 20%、耗时减少 27%。这些是作者自报结果，本研究未复跑。

这组实验主要统计 `git diff` 新增行数，没有启动浏览器或服务验收这 12 个功能，因此不能仅凭代码更少就认定功能和体验等价。另设的安全任务中，5 类安全检查共 20 次通过；“100% safe”只对应这组有限样本，不能外推为安全保证。

本版本还有一个值得注意的文档差异：`ponytail-gain` 仍展示早期单轮生成实验的“代码减少 80–94%、费用减少 47–77%、速度提升 3–6 倍”；README 已承认早期回答行数包含解释文本，会放大差距。不能将 gain 卡片用于代表当前项目的实际收益。

来源：[修正后的评测](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/benchmarks/results/2026-06-18-agentic.md) · [gain 技能](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/skills/ponytail-gain/SKILL.md)。更多证据限制见[研究记录](notes.md#上游效果报告的核查)。

## 对本研究仓库的价值

适合在后续静态演示和小功能开发中，提醒助手复用已存在的页面组件、脚本与浏览器功能，避免为每个研究项目引入不必要的框架。也适合在实现后补一次复杂度审查，寻找可删除的包装和重复逻辑。

与现有三个子项目的关系：001/002 提供角色和工作方法，003 负责流程编排，004 提供偏向精简实现的工程规则。它不能替代事实核查、来源记录、部署验证或角色调度。与其他角色规则组合时，仍需核对明确需求、详细中文分析要求和测试约定，防止“少写”削弱交付完整性。

上述为基于源码的适用性判断。当前没有测得本仓库使用 Ponytail 后的质量、成本或效率增益。

## 阶段结论

本次能力分析已完成。已经确认规则构建、适配机制和命令边界，运行了不调用模型的有限检查。研究状态保留“研究中”，用于跟踪尚未开展的真实任务对照；后续方案见[研究记录](notes.md#后续验证方案未执行)。

本阶段已完成并公开发布静态研究网页：能力与意义、可操作的日期筛选场景、Skill 入口与约束拆解。场景数据及模式解释为本研究教学示例，不是模型实测。本地交互检查、站点构建和线上静态资源核对通过；已将在线地址登记到 `demo`。[首次发布记录](https://github.com/yydshly/0917_codex_project/actions/runs/35199129801)。

另提供一张完整的[原理全景图（PNG）](assets/capability-summary.png)、[可放大的 SVG](assets/capability-summary.svg) 和[文字版](assets/capability-summary-text.md)，从作用、接入路径、上下文构建、决策阶梯、实际场景到约束边界连贯说明。本图为本研究原创说明图，已作为项目封面；来源见 [assets/README.md](assets/README.md)。

## 来源与许可证

上游源码保存在被忽略的 `upstream/ponytail/`。本文及能力文档为本研究整理，源码链接固定到研究 commit，未将上游程序源码、技能全文或图片复制进子项目。许可依据：[LICENSE](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/LICENSE)；版本依据：[package.json](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/package.json)。
