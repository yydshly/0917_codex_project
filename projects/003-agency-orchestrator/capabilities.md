# 能力清单与证据

基准：`1f36dba95ef70a0f3c3559cac16acd9898622ad9`（0.19.2）。下文的“源码确认”表示找到实现；表格中的“本地验证”指初始无真实模型测试，不表示全服务、生成质量或 UI 已验收。另已补充[内容工作流真实运行与定向返工](cases/content-launch/README.md)：五步完成、前三步复用、两步重做，原文和验收边界见[案例网页](../../site/apps/003-agency-orchestrator/case-content.html)。[返回项目首页](README.md)。

## 1. 从需求到执行流程

| 能力 | 使用入口 | 已核对的机制与限制 | 证据 |
| --- | --- | --- | --- |
| 自然语言生成流程 | `ao compose "需求"`；加 `--run` 执行 | 模型根据可用角色目录生成 YAML，包含任务、角色、依赖、输出和验收字段；有变量修复逻辑，仍可能选错流程或生成不合适任务 | [compose.ts][compose]，源码确认 |
| 固定模板 | `ao run <workflow.yaml>` | 可声明输入、默认值、步骤、交付物；适合重复执行。基准仓库有 69 个 YAML 模板，含 13 个英文模板 | [workflows/][workflows]；本地文件统计 |
| 预检查与执行计划 | `ao validate`、`ao plan` | 解析、校验字段/变量/角色及构建依赖图；计划展示不调用模型，不验证业务结论 | [parser.ts][parser]、[dag.ts][dag]；本地 CLI 和核心测试通过 |
| 并发与依赖 | `depends_on`、`concurrency` | 显式依赖建图，同层按批执行；顶层 provider 是 CLI 时并发压到 1。调度不是动态分布式队列 | [executor.ts][executor]；Mock 并发实验确认 API=2、CLI=1 |
| 条件与合流 | `condition`、`depends_on_mode` | `contains` / `equals` 做不区分大小写的文本判断；`any_completed` 支持部分分支完成后合流；不是任意逻辑表达式语言 | [condition.ts][condition]；条件与端到端分支测试通过 |
| 有限循环 | `loop.back_to/max_iterations/exit_condition` | 回到前面层级的步骤，按条件退出；次数上限 10。普通依赖图仍需无环 | [dag.ts][dag]、[types.ts][types]；循环测试通过 |
| 输入与上下文 | `-i name=value`、`@文件`、`{{变量}}` | 把用户材料与上游输出传给后续步骤。它们主要是文本，不自动变成检索数据库或事实证据 | [parse-inputs.ts][inputs]、[template.ts][template]、[executor.ts][executor] |

## 2. 角色与方法复用

| 能力 | 实现与用途 | 边界 | 证据 |
| --- | --- | --- | --- |
| 角色库与私有角色 | 从 Markdown frontmatter 和正文加载角色；支持自建角色和覆盖目录 | 角色是提示材料，`tools` 元数据不会自动创建业务连接器或工具授权 | [loader.ts][roles]、[executor.ts][executor] |
| 多语言角色 | 中文 npm 包、内置英文目录及其他语言包 | 本地安装锁定版本下，中文 276、英文 191；不是 README 宣称的英文 184。角色库也不等于现有 001/002 的不同时间快照 | [package-lock.json][lock]、[loader.ts][roles] |
| 团队 / Loadout | `ao team` 保存和查看角色阵容，`ao run --team` 应用于新需求 | 保存阵容与元数据；不是保留每个专家的长期会话或自主记忆 | [team.ts][team] |
| 步骤方法论 | `skill` / `skills` 注入额外 system prompt，支持内置和用户覆盖 | 是方法约束；写“测试驱动”不会自动获得执行测试的工具 | [skills/loader.ts][skills] |
| Prompt Lab | 优化、保存、测试提示词，与 Studio 自建角色衔接 | 优化和试跑仍依赖模型；效果没有独立验证 | [prompt.ts][prompt]、[PromptStudio.tsx][prompt-ui] |
| 角色安装到其他工具 | `ao install --tool ...`，支持预览写入 | `INSTALL_TARGETS` 有 8 个目标；README 的“19 个工具集成”是更宽泛口径，不等于有 19 个一键安装目标 | [install.ts][install]、[integrations/][integrations] |

## 3. 人工参与、验收和恢复

| 机制 | 成功时行为 | 未满足或失败时行为 | 证据状态 |
| --- | --- | --- | --- |
| `human_input` | 暂停接收输入，作为输出变量交给下游；预填值可免交互 | 没有预填时需要交互通道；普通角色任务里“请问用户”不会自动暂停 | [executor.ts][executor]；2 项测试通过 |
| `approval` | 读取回答并完成该节点 | **本身不解释 yes/no**；应把回答保存为变量，并给下游加明确条件 | 源码与本地 `no` 输入实验均确认 |
| `acceptance` | 注入任务要求，默认在 `run()` 路径启用模型核验；可指定核验模型 | 未通过最多返工一轮；仍未过保留警告并继续，核验不可用也可继续。直接调用底层 `executeDAG()` 要显式开启核验 | [verify.ts][verify]、[executor.ts][executor]；37 项核验测试通过 |
| `assert` | 以纯函数检查文件块数、字节数、非空白字符数、必需文本和正则次数 | 结构不符返工一轮；再次不符则该步骤失败。文本步骤中位于 `acceptance` 之前 | [assert.ts][assert]；30 项测试通过 |
| 错误重试与超时 | 对部分网络/限流/服务错误重试，支持步骤覆盖和动态超时 | 不是所有错误都重试；步骤失败会影响依赖它的下游 | [executor.ts][executor]；本次未做真实网络故障压测 |
| `--resume` / `--from` | 从档案恢复输出，跳过已完成步骤，或从指定步骤及受影响下游重跑 | 需保留原有产物和流程，不能假定重跑字面完全一致 | [reporter.ts][reporter]、[index.ts][index]；12 项续跑测试通过 |
| `--feedback` | 把意见和旧稿交给目标步骤，下游使用新结果 | 默认可选最近一次运行；多工作流使用时应显式指定档案 | [index.ts][index]、[executor.ts][executor]；3 项反馈测试通过 |

两个特别容易误解的组合已做本地实验：

- 没有下游条件的审批节点输入 `no`，下游仍执行，流程 `success=true`。上游 `department-collab/marketing-campaign.yaml` 配了回答条件；`一人公司-做投研.yaml` 没有给最终报告配置这个条件。
- 文本初稿通过 `assert` 后，`acceptance` 返工删除了必需字符串，仍能完成且显示验收通过；引擎没有再次执行结构检查。若要将其用于严格交付，需增加最终独立检查或修正上游实现。

复现脚本和实测结果见[研究笔记](notes.md)。这是当前 commit 的行为描述，不代表后续版本相同。

## 4. 模型接入、媒体与成本

文本连接器分为 API（原生 Anthropic / OpenAI 兼容）、本地已登录 CLI 和 Ollama。`base_url` 允许自定义兼容端点，步骤的 `llm` 可覆盖全局配置。源码注册表含 20 个 OpenAI 兼容 API 条目和 1 个额外 Anthropic 兼容条目，另有直接分派的连接器；这与首页“15 种模型”不是同一个统计口径。[factory.ts][factory]、[api-providers.ts][providers]。

“免 API key”仅表示某些连接器复用已有 CLI 登录或本地推理，不代表服务永久免费或无额度。没有对第三方服务当前套餐、停服声明或价格逐一核实，本文不将这些上游宣传当成事实建议。

`compose --budget` 会按任务类型给部分步骤选择较轻模型，只有内置映射的供应商支持；它是模型分配策略，**不是严格费用上限**。运行档案保存用量，部分连接器缺少精确用量时使用估算。没有据此推断实际账单。[compose.ts][compose]、[openai-compatible.ts][compatible]。

| 媒体步骤 | 提供什么 | 使用前提与限制 |
| --- | --- | --- |
| `image` | 提示词生成图像，输出可供后续引用 | 媒体供应商和模型；视觉验收需要能看图的核验模型，可能触发一次额外生成 |
| `video` | 文生视频或以前一步图像作首帧；异步建任务、轮询、下载 | 平台支持的模型、参数和图片输入；默认验收失败不重新出片，需显式开启 `rework` |
| `tts` | 文本转配音 | 需提供供应商、模型和音色 |
| `concat` | 多段视频拼接、旁白、字幕、背景音乐 | 本地 ffmpeg；本版本该节点不支持 `acceptance` / `assert` |
| 创意与风格库 | 浏览提示词和风格，辅助填写媒体流程 | 是素材与工作流辅助，不等于内置免费生成模型 |

依据：[types.ts][types]、[媒体连接器目录][connectors]、[media/][media]、[CreativeLibrary.tsx][creative]。以上媒体能力仅做源码核查，本次没有生成真实图片、音频或视频。

## 5. 界面、产物与外部集成

| 能力 | 已核对内容 | 实际使用边界 |
| --- | --- | --- |
| 本地 Studio | 角色选择、流程画布、运行记录、产物查看、人工输入、供应商配置、对照视图 | 有前后端实现，本次未构建或交互验收前端 |
| Electron / Docker | 桌面壳及容器定义 | 没有验证安装包、签名或容器启动；Dockerfile 默认安装 npm `latest`，不等于当前源码 commit |
| 结果档案 | 步骤 Markdown、汇总、metadata、媒体 assets | 保存中间产物、耗时、用量和状态；不是模型训练或共享长时记忆 |
| `ao report` | 生成可携带的单文件 HTML 报告 | 生成分享文件不等于上传或托管；本次没有发布 |
| `--export` | docx / pdf / xlsx / pptx / skill / plan | PDF 使用 pandoc + xelatex；不可用时回退可打印 HTML。Excel 从 Markdown 表格提取，不是任意数据分析服务 |
| `--materialize` | 从符合约定的代码块解析文件路径并写入目标目录 | 文件写出后需另行运行、测试；有路径检查，但本文不构成完整安全审计 |
| 群通知与定时 | `--notify` 适配钉钉、飞书、企微及通用 webhook | 定时触发依赖外部 cron 等；通知失败不改变流程结果。本次未发送任何消息 |
| 社区模板 | 按远程清单导入并校验工作流 | 模板内容和远程清单会变化，不保证任务质量 |
| MCP 服务 | `ao serve`，stdio 协议，6 个工具 | 暴露 AO 的工作流操作；不等于 AO 能自动调用任意外部 MCP 工具 |
| 编程 API | `run()` 等导出函数供 Node 程序调用 | 调用者仍要处理输入、配置、结果状态与后续执行 |
| CLI 供应商切换与修复 | 配置连接器和部分系统 CLI 设置的页面与工具 | 可能改动本机配置；本次只读源码，未执行全局切换或修复 |

产物与集成实现分别见 [结果保存][reporter]、[报告生成][report]、[格式导出][export]、[文件落盘][materialize]、[通知适配][notify] 和 [Studio 服务][web]；桌面入口见 [desktop/main.cjs][desktop]。

MCP 的六个工具为 `run_workflow`、`validate_workflow`、`list_workflows`、`plan_workflow`、`compose_workflow`、`list_roles`，以当前源码注册为准。[server.ts][mcp]。

Studio 本地服务默认绑定 `127.0.0.1`；容器设置为 `0.0.0.0`。源码将其定位为本地单用户工具，不能直接据此当作已经具备多租户、权限治理的企业服务。模型请求会发送给所选服务；“本地保存密钥”不代表所有推理都在本机。[web/server.js][web]、[Dockerfile][docker]。

AO 的引擎与模型调用需要运行环境，GitHub Pages 只能放研究说明或静态结果，不能承载完整 AO 后端。

## 6. 质量效果的证据级别

上游 `EVAL_FINDINGS.md` 自报：四种模板中，强模型高可信子集与弱模型实验均为工作流 1 胜 3 负；DeepSeek 实验为 3 胜 1 负。这个结果是**作者在有限模板、模型及提示词条件下的观察**；不是本仓库复测，也不是对当前所有模型的排名。[上游评测记录][eval]。

其双向盲评可缓解答案位置偏差，但评价仍来自模型；基线由目标和输入合成，并非强提示词基线。我们因此把价值先定位在流程复用、产物记录和局部返工，质量优势留待同条件实测。

[compose]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/cli/compose.ts
[workflows]: https://github.com/jnMetaCode/agency-orchestrator/tree/1f36dba95ef70a0f3c3559cac16acd9898622ad9/workflows
[parser]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/core/parser.ts
[dag]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/core/dag.ts
[executor]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/core/executor.ts
[condition]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/core/condition.ts
[types]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/types.ts
[inputs]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/cli/parse-inputs.ts
[template]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/core/template.ts
[roles]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/agents/loader.ts
[lock]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/package-lock.json
[team]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/cli/team.ts
[skills]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/skills/loader.ts
[prompt]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/cli/prompt.ts
[prompt-ui]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/website/src/pages/PromptStudio.tsx
[install]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/cli/install.ts
[integrations]: https://github.com/jnMetaCode/agency-orchestrator/tree/1f36dba95ef70a0f3c3559cac16acd9898622ad9/integrations
[verify]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/core/verify.ts
[assert]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/core/assert.ts
[reporter]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/output/reporter.ts
[index]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/index.ts
[factory]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/connectors/factory.ts
[providers]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/connectors/api-providers.ts
[compatible]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/connectors/openai-compatible.ts
[connectors]: https://github.com/jnMetaCode/agency-orchestrator/tree/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/connectors
[media]: https://github.com/jnMetaCode/agency-orchestrator/tree/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/media
[creative]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/website/src/pages/CreativeLibrary.tsx
[mcp]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/mcp/server.ts
[web]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/web/server.js
[docker]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/Dockerfile
[eval]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/EVAL_FINDINGS.md
[report]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/cli/share-report.ts
[export]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/export/convert.ts
[materialize]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/cli/materialize.ts
[notify]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/src/notify.ts
[desktop]: https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9/desktop/main.cjs
