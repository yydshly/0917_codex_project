# 003 · Agency Orchestrator — 研究与验证记录

研究日期：2026-09-17。[返回项目首页](README.md) · [能力清单](capabilities.md)。

## 范围与基准

- 上游：`https://github.com/jnMetaCode/agency-orchestrator`。
- commit：`1f36dba95ef70a0f3c3559cac16acd9898622ad9`，提交时间 2026-09-16 18:32:50 +08:00。
- `package.json` / lockfile 版本：0.19.2；许可 Apache-2.0。
- 源码目录：仓库根目录下 `upstream/agency-orchestrator/`，已由 `.gitignore` 排除。
- 环境：Windows、PowerShell；Node.js v22.15.0、npm 10.9.2、Python 3.10.11；离线逻辑测试运行器 tsx 4.20.6。
- 安装用 `npm ci --ignore-scripts --no-audit --no-fund`，按 lockfile 安装 190 个包，退出码 0。安装依赖需要联网；后续核心测试使用 Mock 或纯函数，不调用真实模型。
- 初始源码与 Mock 核查阶段没有读取或使用模型密钥，没有向群机器人发消息，没有安装全局角色，没有启动桌面端或 Docker，没有部署网站。

本文将实现事实、本地模拟结果、作者自报评测与后续建议分开记录。上游提供了许多额外测试，本次仅运行下表选定的核心用例，未声称全量测试通过。

## 文件与规模核对

| 项目 | 本次结果 | 统计口径 |
| --- | --- | --- |
| 工作流 | 69 个 | `workflows/` 下递归查找 `.yaml`；包括 13 个 `en/` 模板，不把翻译版去重 |
| 中文角色 | 276 个 | npm 锁定的 `agency-agents-zh@1.4.0`，调用引擎 `listAgents()`，不含用户自建角色 |
| 英文角色 | 191 个 | 当前源码内置 `agency-agents/`，同一加载器口径 |
| 直接运行依赖 | 11 个 | `package.json.dependencies`；另有可选依赖 express，不包含传递依赖 |
| API 注册表 | 20 + 1 条 | `API_PROVIDERS` 20 条，`ANTHROPIC_PROVIDERS` 1 条；另有直接分派的 claude、CLI、Ollama |
| 一键角色安装 | 8 个目标 | `src/cli/install.ts` 中 `INSTALL_TARGETS` 的键数 |
| MCP | 6 个工具 | `src/mcp/server.ts` 的工具注册 |

工作流分布：根目录 29、data 2、department-collab 6、design 2、dev 7、en 13、hr 1、legal 1、marketing 3、ops 3、strategy 2。

上游 README 同时出现“60+ 模板”和“内置模板 32 个”，英文角色标称 184；package 描述还保留 267 个中文角色、11 个模型、7 个免 key 等旧口径。“npm + 2 个依赖”的宣传也与当前 11 个直接运行依赖不同。本文使用明确路径和固定版本统计，不混用这些数值。API 条目数量与基础连接器数量本来就是不同口径，不能简单据此认为服务全部实测可用。

现有 002 子项目研究的是中文角色库另一个 commit，统计为 277；AO 安装的是 npm 1.4.0，得到 276。两者不冲突，也不擅自更新 002 的研究数据。

## 本地验证结果

`npm.cmd run build` 成功完成 TypeScript 编译；`ao validate` 通过内置产品评审模板，识别 4 个步骤、1 个输入；`ao plan` 得到三层依赖，其中第二层是技术与体验评审两个节点。

| 上游测试文件（`test/`） | 通过 | 失败 | 主要覆盖 |
| --- | ---: | ---: | --- |
| `run.ts` | 37 | 0 | 解析、DAG、变量模板、角色加载等核心逻辑 |
| `assert.ts` | 30 | 0 | 文件数、文本长度、包含项等结构断言与配置校验 |
| `condition.ts` | 13 | 0 | 文本条件表达式 |
| `verify.ts` | 37 | 0 | 模型核验结果解析、开关、返工和不可用处理，使用 Mock |
| `resume.ts` | 12 | 0 | 输出保存、恢复与重跑范围，使用 Mock |
| `feedback.ts` | 3 | 0 | 对目标步骤注入旧稿和反馈 |
| `e2e.ts` | 14 | 0 | Mock 流程解析、执行、变量传递与结果保存 |
| `e2e-condition.ts` | 5 | 0 | Mock 分支执行 |
| `e2e-loop.ts` | 5 | 0 | Mock 有限循环 |
| `human-input.ts` | 2 | 0 | 人工节点解析与预填输入传递 |
| **合计** | **158** | **0** | 10 个测试脚本退出码均为 0 |

本地完整测试输出位于被忽略的 `upstream/agency-orchestrator/.research-logs/`，便于本机复查；可提交的结构化摘要为 [verification.json](verification.json)。通过这些测试能确认选定机制在当前环境的表现，不能证明真实模型生成质量或跨平台兼容性。

## 三个补充边界实验

[probe-boundaries.mjs](experiments/probe-boundaries.mjs) 是本仓库编写的实验脚本。它导入本地构建后的引擎，创建临时角色，使用预设回答和模拟连接器，结束后清理自己的临时目录。实验不联网、不调用模型，生成内容不冒充真实研究成果。

### A. 审批节点的拒绝行为

最小结构为 `approval → 普通文本步骤`，不配置下游 `condition`。向子进程输入 `no`，观测到：

```json
{"answer":"no","downstream_status":"completed","success":true}
```

源码对应 `handleApproval()`：读取输入并返回字符串；执行器把正常返回标记为 completed，没有 yes/no 判定。上游投研模板的 `boss_signoff` 后续也是这种无回答条件依赖。营销模板则把回答保存为 `approval_result`，并用 `condition` 检查，说明是否放行由工作流配置承担。

若后续设计自己的流程，可以输出决策变量并用 `equals yes` 等精确条件限定下游，且实际验证否定路径。这里仅记录发现，未修改上游模板、提交 issue 或执行任何业务操作。

### B. 模型返工后的结构检查

步骤声明 `assert.contains: [KEEP]` 和 `acceptance`。模拟以下四次模型响应：初稿包含 KEEP → 验收判失败 → 返工删除 KEEP → 验收判通过。

观测结果：步骤 completed，`verification.pass=true`、`reworked=true`，但最终输出不包含 KEEP。原因是文本执行顺序为先结构检查、后模型验收，后者返工之后直接返回，没有重跑结构断言。

这不否定 `assert` 自身的检查逻辑；它说明将多个检查组合时，还需验证最终交付物。源码依据为 `executor.ts` 的结构断言与验收连续代码段（约 1006–1082 行）。

### C. CLI 并发限制

两个无依赖步骤，设置 `concurrency: 2`，模拟每次请求等待 30ms 并记录在途调用数。顶层 `provider=deepseek` 的峰值是 2，`provider=claude-code` 的峰值是 1。

这是调度策略验证，没有调用 DeepSeek 或 Claude 服务。源码按顶层 provider 判定 CLI 并发，因此混用步骤级 provider 的特殊情况仍需另测，不能把此结论扩大到所有混合配置。

## 复现方式

以下命令在本研究仓库根目录执行。若源码已存在，先检查其 commit 和本地改动；不要覆盖已有研究副本。

```powershell
# 首次准备上游副本时使用
git clone https://github.com/jnMetaCode/agency-orchestrator.git upstream/agency-orchestrator
git -C upstream/agency-orchestrator checkout 1f36dba95ef70a0f3c3559cac16acd9898622ad9

Set-Location upstream/agency-orchestrator
npm.cmd ci --ignore-scripts --no-audit --no-fund
npm.cmd run build
node dist/cli.js validate workflows/product-review.yaml
node dist/cli.js plan workflows/product-review.yaml

$testNames = @('run','assert','condition','verify','resume','feedback','e2e','e2e-condition','e2e-loop','human-input')
foreach ($testName in $testNames) {
    npm.cmd exec --yes --package=tsx@4.20.6 -- tsx "test/$testName.ts"
    if ($LASTEXITCODE -ne 0) { throw "测试失败：$testName" }
}

# 角色与 API 条目统计；单引号中的代码由 node 执行
node --input-type=module -e 'import {listAgents} from "./dist/agents/loader.js"; import {API_PROVIDERS,ANTHROPIC_PROVIDERS} from "./dist/connectors/api-providers.js"; console.log(JSON.stringify({zh:listAgents("node_modules/agency-agents-zh").length,en:listAgents("agency-agents").length,api:API_PROVIDERS.length,anthropic:ANTHROPIC_PROVIDERS.length}));'

Set-Location ../..
node projects/003-agency-orchestrator/experiments/probe-boundaries.mjs
python scripts/projects.py sync
python scripts/projects.py check
```

使用 `.cmd` 是为了明确 Windows 下 npm 命令的参数转发。源码编译需要安装依赖，tsx 首次运行也可能联网下载；“无模型验证”不表示依赖准备不联网。

以后做真实模型实验时，可在上游目录使用 `node dist/cli.js run workflows/product-review.yaml -i prd_content=@自己的材料文件 --provider <已配置的供应商> --model <可用模型>`。此处为用法示意，供应商凭据和模型可用性需另行准备；本次没有运行该命令。

## 实际场景补充：内容工作流与定向返工

2026-09-17，在完成上述无模型核查后，使用原始“一人公司·做内容”模板，通过已有 Claude CLI 登录实际运行「下班前十分钟」账号需求。首轮 5/5 步完成，329.903 秒；人工发现出镜约束遗漏与日期错误后，从编导开始带反馈续跑，复用前三步，重做后两步耗时 125.443 秒。原始模板没有改动。

选题与日历的模型验收通过，不代表原始需求全部满足。网页展示真实节选、全量输出、修订前后与残余问题。运行条件、两轮记录和复现方法见[案例材料](cases/content-launch/README.md)，效果见[实际场景网页](../../site/apps/003-agency-orchestrator/case-content.html)。

## 已知未验证部分与后续研究

- 自动组队生成内容是否符合实际研究目标；真实模型返回的结构稳定性。
- 多角色相对强单次提示词的质量、成本与耗时；上游 `EVAL_FINDINGS.md` 只作作者报告引用。
- Studio 的完整交互、桌面安装包、Docker、媒体生成、导出排版和实际 MCP 客户端连接。
- 除本次 Claude Code 2.1.90 文本流程以外的实际 API/CLI 兼容性、账户额度、供应商价格及其宣传中的外部服务状态。
- 不同输入规模下的性能、长期可靠性与完整安全审计。

这些是后续研究项，不影响本次能力整理完成。优先选择一个已有项目的固定证据包，先比较单次生成与小规模工作流，再决定是否接入整个研究仓库。

## 网页发布记录

2026-09-17 已将本研究、完整引导图、真实内容工作流案例和后续产品试验计划提交到远端并部署到 GitHub Pages。首轮发布：[工作流 35190150874](https://github.com/yydshly/0917_codex_project/actions/runs/35190150874)。公开页、图片、模型记录与必要资源已逐项核对；完整图为研究整理，非产品运行截图。

后续产品效果试验仍未开展。网页上线与结构测试通过，不改变质量增益、角色冗余和实际产品价值待验证的状态。
