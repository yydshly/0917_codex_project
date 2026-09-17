# 研究笔记 · Agency Agents

## 2026-09-17：能力梳理

- 基准：ad9264e309bd5e5422c04784372d7841b1e5d604。
- 上游副本：upstream/agency-agents/，浅克隆，被仓库忽略规则排除。
- 本阶段目标：解释能力、适用范围、对我们的价值，并制作网页。
- 实际完成：读取上游目录清单、角色元数据、重点角色和转换脚本；生成网页。
- 未进行：上游角色安装、自动编排实测、跨工具兼容性验证、效率对照实验。

## 目录统计

统计依据为 [divisions.json](https://github.com/msitarzewski/agency-agents/blob/ad9264e309bd5e5422c04784372d7841b1e5d604/divisions.json)。仅统计其声明的目录中含 YAML frontmatter 和单行 name 的 Markdown 文件；保留角色名称与相对路径，结果在 [web/catalog.json](web/catalog.json)。该提取器针对本次源文件格式，不是通用 YAML 解析器。

| 分类 | 角色数 |
| --- | ---: |
| academic | 6 |
| design | 10 |
| engineering | 64 |
| finance | 5 |
| game-development | 21 |
| gis | 13 |
| healthcare | 3 |
| marketing | 36 |
| paid-media | 7 |
| product | 5 |
| project-management | 7 |
| research | 1 |
| sales | 9 |
| security | 12 |
| spatial-computing | 6 |
| specialized | 59 |
| support | 6 |
| testing | 9 |
| 合计 | 279 |

角色存在不等于角色效果已验证；数量不是质量评分。

## 阅读重点与结论

以下路径均相对于上述基准 commit 的上游目录。网页中提供逐项固定版本链接。

- engineering/engineering-codebase-onboarding-engineer.md：先读源码，定位入口，追踪输入输出，只陈述已检查代码中的事实；明确禁止写入和提出改进建议。适合导读子阶段。
- research/research-synthesist.md：检索范围、原始来源、证据分级、争议与缺口，适合提高结论可追溯性。
- engineering/engineering-rapid-prototyper.md：最小功能验证假设，含默认反馈收集、分析与 A/B 测试要求；研究演示中应按需删减。
- testing/testing-evidence-collector.md：强调真实截图与需求比对，但含至少发现 3–5 个问题的预设以及固定的 QA 命令，应改写。
- testing/testing-reality-checker.md：交叉检查代码、报告、截图与测试记录；固定 Laravel/HTML 路径、localhost 地址以及首轮默认未完成规则不宜通用化。
- engineering/engineering-technical-writer.md：按读者任务整理文档、示例与步骤，适合知识沉淀。
- specialized/agents-orchestrator.md：文本定义需求、架构、开发与 QA、最终集成阶段，规定最多三次尝试；不是独立执行调度器的实现。
- scripts/convert.sh：读取角色字段和正文，输出目标工具的配置；审阅转换逻辑，未执行安装或转换兼容性实验。
- tools.json：上游工具适配元数据；不将登记数量解读为实测兼容数量。

## 网页实现与验证

- Python 3.10 标准库生成；HTML / CSS / 原生 JavaScript；无第三方前端依赖。
- 源码：web/index.template.html、web/styles.css、web/app.js。
- 发布目录：site/apps/001-agency-agents/；网站导航：site/index.html。
- 普通构建从已保存的清单生成，断网可构建；刷新清单才依赖上游副本。
- 保留所有源链接的 commit，CSS、脚本、清单与许可采用相对路径。
- 验证结果和真实截图见 [assets/README.md](assets/README.md)。

## 下一步实验建议

选择一个小型开源项目，比较普通研究与使用三个精简角色模板的研究。控制任务与模型条件，记录总耗时、事实错误、复现成功率和返工次数。首次实验主要确认工作流程是否适用，不能据单次结果宣称普遍提升。

## 共识更新：项目定位与验证方向

本库是按领域、按身份定制的 skill 提示词库。模型提供基础能力，提示词的效果和增量价值可能随模型提升而变化。我们当前整理范围、角色和来源；后续根据实际需求验证相关身份与能力，不预设有提升，不全量采用。六个角色是需求驱动的初选候选，尚未证明必要性或效果。

## GitHub Pages 部署

2026-09-17，研究页及引导图已部署到 https://yydshly.github.io/0917_codex_project/apps/001-agency-agents/ 。首次发布通过 GitHub Actions 工作流运行 35180823638，线上浏览器验证了索引链接、图片、可展开清单与手机布局。项目继续保持“研究中”，角色效果后续按需验证。
