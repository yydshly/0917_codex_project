# 004 · Ponytail — 研究与验证记录

## 2026-09-17：能力与源码分析

目标：回答这个库能做什么、如何起作用、有哪些可靠证据，以及对本仓库的潜在价值。没有将被研究的 Ponytail 技能作为本会话执行指令，也没有安装或启用它。

| 项目 | 记录 |
| --- | --- |
| 上游 | https://github.com/DietrichGebert/ponytail |
| commit | `e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156` |
| 提交说明 | `chore: release v4.10.0 (#870)` |
| commit 日期 | 2026-09-14 |
| 包版本与许可 | 4.10.0，MIT，Copyright (c) 2026 DietrichGebert |
| 本地源码 | 仓库根目录下 `upstream/ponytail/`，被 Git 忽略 |
| 环境 | Windows / PowerShell，Python 3.10.11，Node.js v22.15.0，Git 2.42.0.windows.2 |
| 研究材料 | 上游 README、六项技能、规则构建/配置/runtime、Hooks、OpenCode 适配器、MCP 服务及测试、上游评测报告 |

源码通过浅克隆获取，研究时工作树无改动。所有文档链接固定到上述 commit，后续上游更新不自动改变本次结论。

## 本地执行的检查

以下命令在研究仓库根目录运行，使用已有本地 Node.js，不安装第三方依赖、不调用模型。首次获取源码可用：

```powershell
git clone https://github.com/DietrichGebert/ponytail.git upstream/ponytail
git -C upstream/ponytail checkout e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156
```

### 规则副本一致性

```powershell
node upstream/ponytail/scripts/check-rule-copies.js
```

实际结果：退出码 0，输出如下：

```text
Rule copies match AGENTS.md; 9 rule invariants present in SKILL.md and AGENTS.md.
```

脚本比较 7 份紧凑规则副本与上游 AGENTS.md 的正文，并检查核心技能和紧凑规则共同包含的 9 个关键短语。它只验证这些副本和短语的一致性，不证明全部技能内容同步；`ponytail-gain` 的旧数字不在此检查范围内。

### MCP 指令构建测试

```powershell
node --test upstream/ponytail/ponytail-mcp/test/instructions.test.js
```

实际结果：退出码 0，3 项测试全部通过，0 失败、0 跳过。

| 测试 | 观察 |
| --- | --- |
| 有效强度解析 | lite/full/ultra 保持相应值 |
| 无效或非服务强度回退 | off/review/未知值/空值回退到服务支持的强度 |
| 规则构建 | ultra 输出包含激活标记和模式信息 |

测试执行了真实指令解析与文本构建代码。它没有启动 MCP 服务、连接客户端、运行宿主 Hooks 或检验模型是否遵守指令。未执行上游完整 `npm test`，不能报告为全套测试通过。

来源：[副本检查脚本](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/scripts/check-rule-copies.js) · [指令测试](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/ponytail-mcp/test/instructions.test.js)。

## 上游效果报告的核查

### 2026-06-18：修正后的 agentic benchmark

| 项目 | 上游报告内容 |
| --- | --- |
| 执行环境 | Claude Code 2.1.177，无界面会话；Haiku 4.5 |
| 项目基准 | full-stack-fastapi-template，commit `cd83fc1`，FastAPI + React |
| 对照组 | 无技能、Ponytail、Caveman、简短 YAGNI/one-liner 提示词 |
| 功能任务 | 12 项，每个任务每组 4 次 |
| 代码指标 | 生成文件的 git diff 新增行数，包含注释 |
| 作者报告的功能任务汇总收益 | 代码约 -54%，tokens -22%，费用 -20%，耗时 -27% |
| 安全测试 | 单独执行生成函数；5 类安全检查 × 4 次，Ponytail 为 20/20 |

这里的行数是新增行数，不能解释为整个仓库体积下降 54%，也不是删减后净差异。指标来自特定任务和模型，不能代替当前项目实测。

报告承认此前基线被全局插件污染，后续通过隔离插件加载修正；也承认更早的单次生成评测把解释和备选方案计入回答行数，夸大了差异。报告还记录 192 个功能任务运行单元中有 4 个发生进程超时，其代码仍计入行数，但不计成本和耗时。

本研究对证据的判断：

- 平台原生控件能替代定制组件时，减少代码具有明确机制解释。
- 功能任务没有启动浏览器或服务验收，尚不能由 LOC 指标确认需求完整性、界面体验和长期维护性等价。
- 安全检查是有限的确定性测试；20/20 不能推出“生成代码普遍安全”。
- 样本少、单一主模型，且部分成本/耗时样本缺失，不能把百分比作为普遍承诺。
- 本次未运行这些模型实验，未独立核对所有原始生成产物。

来源：[2026-06-18 报告](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/benchmarks/results/2026-06-18-agentic.md)。

### gain 与 README 的口径差异

固定版本 `skills/ponytail-gain/SKILL.md` 仍让模型展示早期成绩：代码减少 80–94%、费用减少 47–77%、速度提升 3–6 倍。该技能明确这是历史基准而非当前项目实测，但没有改用 README 已修正的 agentic 数字。

因此，分析与对外展示应优先注明测量方法，不能照抄 gain 卡片代表最新结论。本次只记录该差异，未修改上游。

来源：[gain](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/skills/ponytail-gain/SKILL.md) · [固定版本 README](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/README.md)。

### 后续根因理解与复用报告

2026-06-22 报告单独考察“读取调用方、修复共享根因”的操作性指令。作者报告不同模型的改善并不一致，较弱模型仍可能只修症状；在两项仓库内复用实验中，无技能组也成功复用了已有 helper，未证明新增复用规则在这些任务上的额外收益。

这支持一个有限结论：具体可执行的阅读步骤可能比泛泛强调精简更有作用，但效果依赖模型和任务。该报告同样未由本研究复现，其个别正确性指标只检查代码能否编译，不能视作完整行为验证。

来源：[2026-06-22 报告](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/benchmarks/results/2026-06-22-issue-245-217-comprehension.md)。

## 结论的证据等级

| 结论 | 证据类型 | 本次是否验证 |
| --- | --- | --- |
| 主要通过规则与上下文注入改变助手行为 | 源码 | 已确认 |
| 提供六项技能，review/audit 默认只报告 | 技能正文 | 已确认 |
| MCP 返回指令而非执行代码分析 | 源码与指令测试 | 文本构建已实测，协议链路未测 |
| 规则副本和关键短语一致 | 上游本地检查脚本 | 已通过 |
| 多个会话可能共享模式状态 | 固定路径实现推断 | 未复现，取决于宿主隔离方式 |
| 真实任务能省多少代码、费用和时间 | 上游模型评测 | 仅核查报告，未复跑 |
| 本仓库开发能否受益 | 场景判断 | 待对照 |

## 研究文档检查

通过仓库规定的 `python scripts/projects.py new` 创建 `004-ponytail`，填写元数据后执行 `python scripts/projects.py sync` 和 `python scripts/projects.py check`。检查通过，共 4 个研究项目；根 README 只增加自动生成的索引行。

另外核查了文档中的 37 个链接：相对文件目标存在，固定 commit 的源码链接对应本地快照中存在的文件；未将此检查描述为远端 HTTP 可用性测试。未发现模板占位符或编码替换字符，`git diff --check` 通过。

## 后续验证方案（未执行）

选择真实小任务，例如日期筛选、CSV 导出和共享函数缺陷修复，固定需求、仓库版本、模型、权限与验收检查。比较三个独立环境：正常工程提示词、正常提示词加简短复用原则、Ponytail full。确保控制组没有加载 Ponytail 的全局规则或 Hooks。

每组多次运行，先验收需求、功能、边界和安全，再统计新增/删除行数、依赖变化、测试结果、耗时、可获得的真实用量、人工返工量。缺失费用数据时留空；不得用理论价格或未构建的替代方案冒充节省量。

另需验证宿主模式切换、关闭后行为、子代理规则传递和并发会话隔离。只有这些实验完成后，才将“可能有帮助”更新为本仓库内有证据支持的收益结论。

## 2026-09-17：交互研究网页

按用户要求新增三部分：能力与意义、具体开发场景、Skill 实现分析。源码在 `web/`，产物在 `site/apps/004-ponytail/`，并登记到总构建入口。网页使用原生 HTML/CSS/JavaScript，无新增前端依赖。

场景为“研究任务按截止日期筛选”：6 条教学数据，原生日期输入，筛选、重置、计数与空状态均实际运行。另用单选项改变“是否已有 DateFilter 组件”的教学前提，分别展示停在复用现有能力或原生控件的决策；不调用模型，不加载真实的外部 DateFilter 组件。

实现分析涵盖 Skill、插件 Hooks、项目规则文件和 MCP 四类入口；拆解元数据、角色、持续性、决策阶梯、工程规则、输出与例外。明确分开确定性的模式/文本处理与依赖模型执行的工程约束。

本地浏览器验证结果：

| 检查 | 实际结果 |
| --- | --- |
| 初始状态 | 显示 6 条示例任务 |
| 9 月 17 日快捷筛选 | 显示 2 条任务，计数同步 |
| 原生日期输入 2026-09-19 | 显示 1 条任务，内容为验证静态页面子路径 |
| 9 月 30 日空结果 | 显示 0 项与空状态说明 |
| 清空筛选 | 恢复 6 条，日期值清空 |
| 复用前提切换 | 决策停留位置从第 4 步切换到第 2 步，再切回正常 |
| lite/full/ultra | 三种教学说明可切换，公共边界保留 |
| Skill 规则展开 | 决策阶梯正文可展开读取 |
| 手机视口 390 × 844 | 可阅读和操作；页面宽度未溢出 |
| 桌面视口 1280 × 900 | 双栏案例布局正常；页面宽度未溢出 |
| 浏览器控制台 | 检查时未发现 error/warn 日志 |

已运行总构建、项目一致性检查和 JavaScript 语法检查。页面仅在本地预览，未提交或发布；`demo` 保持空值。这些验证属于教学网页的功能检查，不是 Ponytail 的模型能力或收益评测。

## 2026-09-17：整体机制与隔离 Hook 验证

针对 Skill、插件、Hooks、规则文件、MCP 如何协同的追问，新增 [architecture.md](architecture.md) 和独立机制详解网页。区分内容来源、打包注册、事件注入、静态规则与协议取用，补充普通请求、切换、关闭、子代理和重新激活的行为。

执行 `python projects/004-ponytail/experiments/trace_hooks.py`，在被忽略的 `.tmp/ponytail-trace-*` 中建立独立配置和状态目录，通过隔离环境选择上游脚本的 Codex 格式输出分支。没有改变真实插件配置，也未启动宿主、模型或 MCP 服务。

7 步全部通过：full 激活、普通输入无输出、lite 切换仅通知、子代理获得 lite 正文、off 删除状态、关闭后的子代理无输出、再次激活回到默认 full。详细数据见 [hook-trace.json](experiments/hook-trace.json)，方法与边界见 [整体机制](architecture.md#7-步隔离脚本验证)。之前未运行 Hooks 的记录属于前一研究阶段，本次新增的是隔离脚本执行，仍不等于真实宿主端到端验证。

解析网页的四条路径切换已在浏览器验证，390 × 844 手机视口没有整页横向溢出；宽表格在自身区域横向滚动，正文与路径图保持可读。检查时控制台无 error/warn。页面通过总构建、JavaScript 语法检查和项目索引检查；未公开发布。

## 原理全景图（2026-09-17）

根据现有固定版本分析制作原创说明图，依次说明作用与能力、四条并列接入路径、插件与 Hooks 的上下文构建、七步开发决策、日期筛选案例和约束边界。明确区分程序机制、模型判断和教学案例，不将文字规则描述为自动代码拦截器。

提供 2400 × 3700 PNG、同内容 SVG 及文字版，记录来源和生成方式；同步接入两页的 guide 区域和项目索引封面。已查看整张 PNG，修正案例中的孤行标点；浏览器核对网页图片和 SVG 正常显示。另检查 PNG 尺寸、SVG XML、资源复制一致性、两页 guide 唯一性；项目索引检查和站点构建通过。本次未重新运行模型或上游实验，未发布站点。

## 整理结论与远端发布（2026-09-17）

根据用户要求，摘要明确区分能力（先理解、先复用、必要实现、改动与全库审查、已标记技术债汇总）和原理（Skill 工程规则通过可选接入路径进入模型上下文，由宿主模型和工具执行）。沿用现有全景图，不增加另一张封面；研究状态保留“研究中”，因为真实模型收益对照仍未开展。

提交 f7dae4f 已推送至 main，首次 Pages 发布成功：[工作流 35199129801](https://github.com/yydshly/0917_codex_project/actions/runs/35199129801)。线上两页 HTML、PNG / SVG、脚本样式、文字材料与 Hook 摘要均返回 HTTP 200，并与本地构建核对一致（文本统一换行符后比较）。正式地址写回 project.json，并同步根 README 和网站索引。以上发布验证不增加对 Ponytail 模型输出质量的结论。
