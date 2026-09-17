# 001 · Agency Agents

按领域和身份提供角色提示词、工作步骤与交付要求，覆盖工程、设计、测试等18个领域、279个角色；供我们按实际任务选取并验证能否提升效果，价值可能随模型升级变化。

| 信息 | 内容 |
| --- | --- |
| 上游 | [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) |
| 基准 commit | [`ad9264e309bd5e5422c04784372d7841b1e5d604`](https://github.com/msitarzewski/agency-agents/commit/ad9264e309bd5e5422c04784372d7841b1e5d604) |
| 研究日期 | 2026-09-17 |
| 上游许可 | MIT，Copyright (c) 2025 AgentLand Contributors |
| 当前阶段 | 能力整理与网页部署已完成；角色及能力后续按需验证 |
| 详细记录 | [研究笔记](notes.md) · [项目元数据](project.json) |
| 网页源码 | [web/](web/) |
| 静态展示 | [在线研究页](https://yydshly.github.io/0917_codex_project/apps/001-agency-agents/) · [本地静态文件](../../site/apps/001-agency-agents/index.html) |

先从[项目汇总图](https://yydshly.github.io/0917_codex_project/apps/001-agency-agents/#guide)了解库的定位、主要领域、候选选择原因与后续验证方向，再阅读详细分析。

## 项目是什么

Agency Agents 是按领域、按身份定制的 skill 提示词库，附带工作步骤、交付模板及工具适配脚本。这里的 skill 指技能指令内容，不表示全部源文件都是某一平台统一格式的技能包。本次固定版本的 divisions.json 定义了 18 个分类；对这些分类目录下有 frontmatter 且包含 name 的 Markdown 文件进行递归统计，共 279 个角色。strategy/、examples/、integrations/ 不计入角色数。

角色定义能够约束 AI 如何执行工作；并不直接提供模型能力、外部工具权限、持久化记忆或已运行的自动化调度系统。

## 能力范围

| 层次 | 提供的内容 | 实际使用条件 |
| --- | --- | --- |
| 专业角色 | 工程、设计、测试、安全、产品、研究等 18 类任务指令 | 模型具有相关能力，且能够访问任务上下文 |
| 工作过程 | 任务拆解、角色交接、开发与 QA 循环、重试约束 | 使用方提供执行工具与状态管理 |
| 交付标准 | 代码、方案、文档、截图和验收清单的格式与要求 | 根据真实项目改写，并实际核查结果 |
| 工具适配 | 将角色源文件转换成不同工具要求的配置格式 | 逐项验证目标工具与版本；格式转换不等于效果验证 |

完整分类与角色链接见网页；所有上游角色链接固定到上述 commit。

## 对我们的价值

目前的价值是建立一个可查阅的角色与能力候选库。后续只在实际任务需要时，选择相关身份和能力进行验证，再决定是否采用或改写。

效果首先受模型本身能力影响；模型提升可能降低通用人设和步骤的增量价值，也可能改善其执行效果。每次验证应记录模型与任务条件，不能将当前结果永久推广。

下列六个候选由我们的研究流程推导，并非已经证实有效的推荐名单。

| 按研究需求初选的候选角色 | 对应产出 | 必须调整的地方 |
| --- | --- | --- |
| Codebase Onboarding Engineer | 入口、关键文件、调用链和阅读范围 | 原角色禁止价值判断与改进建议，应单独安排分析环节 |
| Research Synthesist | 来源追溯、证据强弱、未解决问题 | 将文献方法调整为开源项目研究范围 |
| Rapid Prototyper | 最小示例、验证标准、实验结果 | 删除不必要的分析埋点、A/B 测试与固定时间承诺 |
| Evidence Collector | 真实截图、测试记录、复现信息 | 不预设必须发现 3–5 个问题，不以截图替代所有验证 |
| Reality Checker | 完成报告与实际实现的交叉核验 | 替换固定路径和脚本，不预设首轮必然失败 |
| Technical Writer | 研究报告、复现指南、展示网页 | 对齐本仓库中文、元数据和静态演示规范 |

以上是按本仓库需求进行的候选筛选，并非官方核心名单，也没有全面比较全部角色。六个角色可合并、精简，不等于需要运行六个 Agent。核心增量价值与实际效果留待后续深度测试；尚未证明效率或质量提升。

## 网页与复现

采用 Python 标准库生成静态 HTML，浏览器端无第三方依赖、无外部字体或图片。所有发布资源使用相对路径，兼容 GitHub Pages 子路径，也可离线打开静态网页。角色清单使用原始英文名称，分类说明与研究结论为中文。

在仓库根目录执行：

```powershell
python projects/001-agency-agents/web/build.py
python -m http.server 8765 --bind 127.0.0.1 --directory site
```

访问 http://127.0.0.1:8765/apps/001-agency-agents/ 。正常构建直接读取已提交的 web/catalog.json，不需要网络或本地上游副本。

只有主动更新研究版本时，才执行：

```powershell
git clone --depth 1 https://github.com/msitarzewski/agency-agents.git upstream/agency-agents
python projects/001-agency-agents/web/collect_catalog.py
python projects/001-agency-agents/web/build.py
```

已有上游目录时不重复克隆。更新快照后应重新阅读受影响角色、修改中文结论与文档版本；新增分类会使构建停止，要求先补充中文说明。不要仅刷新数字就认定研究已更新。

## 图片展示

### 一图总览：能力、候选角色与潜在价值

![Agency Agents 总览：18 个领域、279 个角色、按研究需求初选的六个候选及原因，以及模型进步背景下尚待验证的长期价值](assets/capability-summary.png)

[下载高清总览图](assets/capability-summary.png) · [可编辑排版源文件](web/capability-summary.html) · [内容与制作说明](assets/capability-summary-brief.md)

该图是基于固定版本资料制作的研究信息图，不是角色实际运行效果的证据。六个候选基于我们的任务需求筛选，其效果与增量价值留待后续深度测试。

网页历史截图与验证记录保存在 [assets/](assets/)，本页仅展示上方这一张汇总图。

## 研究进度

- [x] 固定上游版本并记录许可证
- [x] 统计全部角色分类与数量
- [x] 阅读重点角色与转换实现，整理能力和边界
- [x] 完成中文静态网页和本地预览
- [ ] 在实际研究任务中运行选定角色
- [ ] 对照评估耗时、事实错误、复现成功率与返工次数
- [x] 公开部署 GitHub Pages 并记录真实演示地址

## 来源与许可

源码副本位于被忽略的 upstream/agency-agents/。网页收录角色名称、源文件路径及原创中文分析，随附上游 [MIT 许可全文](web/UPSTREAM-LICENSE.txt)。各项角色结论的固定版本链接见网页及研究笔记。本阶段未安装上游角色、未执行上游安装脚本、未运行其多角色管线。
