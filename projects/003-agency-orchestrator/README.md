# 003 · Agency Orchestrator

Agency Orchestrator（AO）面向具体场景选择角色、拆分任务并按依赖编排执行，支持结果传递、运行留档与局部返工，适用于内容策划、产品方案、研究评审和媒体流程。对我们的价值是**复用协作流程、追溯结果与减少重复执行**；质量增益、重复内容和角色必要性仍需后续用真实产品任务对照验证。

| 信息 | 内容 |
| --- | --- |
| 上游 | [jnMetaCode/agency-orchestrator](https://github.com/jnMetaCode/agency-orchestrator) |
| 研究基准 | 版本 `0.19.2`；commit [`1f36dba95ef70a0f3c3559cac16acd9898622ad9`](https://github.com/jnMetaCode/agency-orchestrator/commit/1f36dba95ef70a0f3c3559cac16acd9898622ad9) |
| commit 时间 / 研究日期 | 2026-09-16 18:32:50 +08:00 / 2026-09-17 |
| 上游许可 | Apache-2.0；角色库等依赖分别遵循各自许可 |
| 技术构成 | TypeScript / Node.js ≥20；本地 Web 服务、React Studio、Electron 桌面入口 |
| 本次范围 | 能力与源码核查、158 项核心测试、五角色内容场景真实运行与定向返工；质量对照和全渠道兼容性尚未验证 |
| 详细材料 | [能力清单](capabilities.md) · [研究与验证记录](notes.md) · [元数据](project.json) |
| 能力展示网页 | [打开静态页面](../../site/apps/003-agency-orchestrator/index.html) · [网页维护说明](web/README.md) |
| 实际场景 | [一人启动 AI 办公账号](../../site/apps/003-agency-orchestrator/case-content.html) · [两轮运行与复现材料](cases/content-launch/README.md) |
| 完整理解图 | [高清 PNG](assets/capability-summary.png) · [可放大 SVG](assets/capability-summary.svg) · [文字版](assets/capability-summary-text.md) · [来源与制图说明](assets/capability-summary-brief.md) |
| 后续产品试验 | [任务选择、对照方案、质量与重复评估](product-validation.md)（待开展） |

## 一张图整理我们的完整理解

[能力与使用全景图](assets/capability-summary.png) 用八个部分串起库的定位、能力地图、内部执行与反馈循环、使用方法与命令、五角色真实案例、限制、适用价值和证据范围。图中分别标注源码确认、实测和未验证部分；网页入口为[理解全景图](../../site/apps/003-agency-orchestrator/index.html#guide)。

## 一个实际场景：首月内容计划

给「下班前十分钟」账号一份需求：一个人、每天最多 30 分钟、不露脸、四周 12 条 AI 办公短视频。原库的老板 → 用户研究员 → 内容策划 → 编导 → 运营依次输出定位、画像假设、十个选题、首条脚本和日历。

首轮真实调用耗时 329.9 秒，五步完成，但出现真人出镜和日期错误。我们用原库的反馈续跑机制，复用前三步，只重做脚本与运营，耗时 125.4 秒。网页保留真实原文，展示修正前后、完整提示词、样例待办表和十二次发布安排，也指出验收通过后仍存在的内容问题。

[进入实际案例网页](../../site/apps/003-agency-orchestrator/case-content.html)。账号设定用于演示，没有实际拍摄或发布；此案例验证流程接力与局部返工，不代表运营效果或多角色质量优势。

## 原有能力与效果

[能力展示网页](../../site/apps/003-agency-orchestrator/index.html) 首先展示清晰摘要和完整理解图，随后区分质量、重复执行与重复劳动，列出产品试验计划。官方 Studio 界面、演示动图和四个原始模板继续保留，帮助理解实际入口与预期交付。

![上游官方 Studio 工作流页面：产品、内容、投研与开发模板，非本次本地运行截图](assets/upstream/studio-workflows-zh.png)

截图与动图原样来自固定 commit 的上游仓库，保留来源和 Apache-2.0 许可，见[素材记录](assets/README.md)。网页中的模板交付清单是对原模板的整理，不冒充本次生成结果。

## 与前两个子项目的关系

| 项目 | 主要提供什么 | 在协作流程中的位置 |
| --- | --- | --- |
| [001 · Agency Agents](../001-agency-agents/README.md) | 英文角色身份、工作方法和交付要求 | 定义角色 |
| [002 · Agency Agents 中文版](../002-agency-agents-zh/README.md) | 中文化、本地化和扩展角色 | 提供中文任务的角色材料 |
| **003 · Agency Orchestrator** | YAML 解析、模型调用、任务调度、状态与产物管理 | 让角色按流程执行 |

AO 将角色正文用作 system prompt，也能给步骤附加方法论 Skill。角色名和角色文件中的 `tools` 字段，不等于引擎自动具备对应的搜索、数据库或业务系统权限。它加载的角色包版本也不必等于我们在 001、002 中研究的快照。

## 我们对质量与重复的理解

| 关注点 | 已有机制 | 仍需额外设计或验证 |
| --- | --- | --- |
| 结果质量 | 结构检查、模型验收、一次自动返工 | 标准完整性、事实准确性、最终交付阻断；流程完成不等于结果合格 |
| 重复执行 | 从档案复用已完成步骤，定点重做相关步骤及下游 | 是否有必要重跑、原有结果是否足够好 |
| 重复劳动与内容 | 可通过清晰分工减少重叠 | 尚未发现通用机制自动判断角色多余、内容重复和协作增益 |

AO 擅长执行设计好的协作流程；设计是否合理、增加角色是否有独立贡献，还需要人定义任务与验收，并通过实际任务检验。不能把五个角色都运行完当成五个角色都必要。

## 能力概览

| 能力 | 典型用途 | 主要前提或边界 |
| --- | --- | --- |
| 一句话组队 `compose` | 自动选择角色、拆任务、生成 YAML；可接着运行 | 生成过程要调用模型；生成的流程仍需审阅 |
| 依赖与并发调度 | 独立评审完成后汇总 | 按显式 `depends_on` 建图；顶层 CLI provider 会强制串行 |
| 条件分支与有限循环 | 按分类分流，评审后有界返工 | 条件主要是文本 `contains` / `equals`；循环上限 10 |
| 角色、团队、Skills | 复用阵容、私有角色和方法论 | 团队保存角色组合，工作流保存任务与依赖 |
| 人工参与 | 中途补充信息、确认是否继续 | `approval` 读取回答；需下游条件才能按回答拦截 |
| 验收与结构检查 | 核对交付标准、必需内容或文件数量 | `acceptance` 是模型软核验；`assert` 是程序结构检查 |
| 续跑与反馈 | 复用完成步骤，从指定步骤带意见返工 | 依赖本地档案；不是跨任务自动学习记忆 |
| 模型接入与按步配置 | API、已登录 CLI、本地 Ollama、步骤级模型覆盖 | 免 API key 不等于没有账号、额度或算力成本 |
| Web Studio 与桌面 | 选角色、编辑画布、看运行与产物 | 已核查源码；本次未做界面交互验收 |
| 媒体流水线 | 图像、视频、配音与多镜合成 | 依赖媒体供应商；合成使用本机 ffmpeg |
| 交付与集成 | Markdown/JSON、分享 HTML、文档导出、代码文件落盘、MCP | 文件落盘不等于代码已运行；PDF 有 HTML 回退 |
| 对照评测 | 工作流与单次生成双向盲评 | 评分模型与基线质量有限，不能当作普遍质量保证 |

源码入口、具体限制和验证状态见[完整能力清单](capabilities.md)。

## 运行机制

```mermaid
flowchart LR
  A[需求或现成 YAML] --> B[解析和校验]
  B --> C[按依赖构建执行图]
  C --> D[角色与方法论 + 上游输出]
  D --> E[模型或媒体连接器]
  E --> F[结构检查与可选模型验收]
  F --> G[每步产物与运行档案]
  G --> H[汇总交付或带反馈续跑]
```

例如内置 `product-review.yaml` 是“需求分析 → 技术评审与体验评审 → 最终汇总”。两份评审处于同一执行层，可在 API 模型和并发设置允许时并行。`{{变量}}` 将已声明输入和步骤输出填入后续任务，调度器按层、按批执行。

## 使用时最需要知道的边界

1. **流程完成不等于验收通过。** `acceptance` 未通过会返工一轮，但仍未通过时可以继续向下游输出；验收器不可用也会告警后继续。执行状态和 `verification.pass` 要分开看。
2. **人工节点不自动保证拒绝生效。** `approval` 没有内置 yes/no 拦截。上游营销模板检查回答；投研模板的最终报告只依赖签字节点，没有对应条件。
3. **检查有先后关系。** 文本步骤先做 `assert`，再做 `acceptance`；本版本没有在后者返工后重新检查 `assert`，两者叠加不保证最终产物同时合格。
4. **产出代码和执行代码有区别。** Claude Code 连接器关闭工具；Codex CLI 连接器使用只读沙箱。`--materialize` 写出代码块，本身不安装依赖、不运行测试、不部署应用。
5. **研究需要真实证据。** 通用文本连接器没有自动检索互联网或仓库的通用工具循环；给一个 URL 不等于已读取该页面。应先准备带路径、commit 和来源的材料，再交给流程处理。
6. **多角色增益不能预设。** 上游自报的四模板评测在不同模型下有输有赢，且基线并非精调提示词。本次未复现这组质量评测，也没有测得节省时间或成本的结论。

依据为固定版本的 [executor.ts](https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/core/executor.ts)、[连接器目录](https://github.com/jnMetaCode/agency-orchestrator/tree/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/connectors) 与[上游评测记录](https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/EVAL_FINDINGS.md)。具体复现和证据见[研究记录](notes.md)。

## 对本仓库的适用性

适合尝试“提供证据材料 → 能力提取 → 架构与限制分别评审 → 中文文档 → 人工核对”的固定研究流程。中间结果可追溯、可定点返工，比单纯增加角色数量更有实际参考价值。

一次性短问答、强模型已能稳定完成的单步任务，未必值得增加流程。当前不能据此替代需要真实浏览、运行代码与核查外部资料的研究代理。

后续需要选择真实产品的小功能，固定模型、来源材料和交付要求，对比认真设计的单次生成、2—3 个角色的精简流程与更多角色的流程。记录事实错误、来源可追溯率、重复内容、角色独立贡献、耗时、可获得用量与人工修订量，再在产品中实际实现和验收。完整[产品试验计划](product-validation.md)已整理，尚未开展，不预设增益。

## 本次交付与来源

本阶段已整理能力、源码入口和验证记录，完成静态能力展示网页，并补充一次真实内容工作流与带反馈续跑案例；状态保留“研究中”，跟踪真实产品对照和原软件界面体验等未验证部分。引导图与项目封面统一使用本研究的完整信息图。发布地址在部署成功并验证后写入 `demo`。

完整源码位于被忽略的 `upstream/agency-orchestrator/`。源码链接固定到研究 commit，研究说明为本仓库整理；本子项目仅引用三份上游展示素材，并附带许可全文，没有引入上游程序源码或角色全文。许可依据为上游 [LICENSE](https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/LICENSE) 和 [package.json](https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/package.json)。
