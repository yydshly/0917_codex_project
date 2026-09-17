# 研究笔记 · Agency Agents 中文版

## 2026-09-17：范围与版本

- 新建编号 002，使用 `python scripts/projects.py new`，保留 001 原版研究。
- 中文版基准：`fa3c83ddff9954e0dd7af1fc3e39d919d7af6452`。
- 原版比较基准：`ad9264e309bd5e5422c04784372d7841b1e5d604`，复用 001 的已保存清单。
- 中文版许可：MIT；保留 Michael Sitarzewski（2025）和 jnMetaCode（2026）的版权声明。
- 本阶段目标：能力说明、原版对比、对我们研究工作的价值与边界，制作可复现静态页面。

## 文件统计方法

`web/collect_catalog.py` 扫描上游非隐藏分类目录中的 Markdown，排除 scripts、integrations、examples、assets、evals、node_modules，要求以 frontmatter 开头且有单行 `name` 字段。strategy 下没有符合条件的角色，不纳入部门统计。此提取器针对当前格式，不是通用 YAML 解析器。

统计结果为 277 个角色、20 个部门，记录名称与路径，不把文件数量视为质量评分。目录清单见 web/catalog.json；页面角色源链接固定到上述 commit。

| 部门 | 数量 | 部门 | 数量 |
| --- | ---: | --- | ---: |
| company | 7 | engineering | 42 |
| design | 10 | marketing | 43 |
| paid-media | 7 | sales | 9 |
| finance | 9 | hr | 2 |
| legal | 2 | supply-chain | 5 |
| product | 5 | project-management | 7 |
| testing | 9 | support | 7 |
| specialized | 58 | spatial-computing | 6 |
| game-development | 20 | academic | 6 |
| gis | 13 | security | 10 |

## 重点核查与判断

- README.md / AGENT-LIST.md / UPSTREAM.md：社区版关系、作者来源分类与同步记录。首页统计与部分正文、六月追踪记录不一致；AGENT-LIST 的部门概览仍写 marketing 42，实际为 43。采用实际文件统计；未独立审计“213 翻译 / 64 原创”的归属。
- engineering/engineering-codebase-onboarding-engineer.md：中文代码导读强调检查实际代码、追踪执行路径与事实陈述；任务评价需另外安排。
- engineering/engineering-feishu-integration-developer.md：说明开发流程和权限、重试、幂等要求，属于开发指令，不是已连接的飞书工具。
- engineering/engineering-mechanical-design-engineer.md：含领域规则、公式和固定数值。本次不验证工程正确性，不把它们作为技术标准推荐；网页明确要求依据任务核对。
- specialized/agents-orchestrator.md：描述分阶段交接与开发 / QA 循环，是角色文件，不能认定为运行调度系统。
- scripts/convert.sh：静态读取转换逻辑，输出不同工具格式；未执行安装或兼容性测试。
- 原版固定 catalog 中确有 Xiaohongshu Specialist、Douyin Strategist、WeChat Official Account Manager、Feishu Integration Developer；中国场景不是中文版全部独有。
- 中文清单与源码文本未检出 Research Synthesist / research-synthesist 同名同路径角色；不从该检查推断所有语义相近内容都不存在。
- 配套 agency-orchestrator：阅读公开 README，说明其与角色库的关系；未克隆、安装或实测，不将其动态功能声明当作本项目运行证据。

## 实现与验证

- Python 标准库构建，HTML/CSS/原生 JavaScript，普通构建离线可用。
- 页面：定位与能力、原版对比、研究价值、可搜索角色清单、能力边界、版本与证据。
- 搜索角色名和文件路径，支持大小写不敏感匹配；部门选择与搜索可组合；含空结果提示和重置。
- 总构建脚本登记 002，站点索引和根 README 来自 project.json；001 内容和版本未更新。
- 浏览器检查和截图见 assets/README.md。截图来自本地页面，不是角色运行结果。
- 本次未提交、推送或发布；demo 留空。角色实际效果继续标为待验证。

## 后续验证建议

以相同项目、模型、上下文、工具和交付标准，比较现有研究要求、原版精选角色与中文版对应角色。独立会话执行，记录事实错误、来源追溯、复现成功率、耗时与返工次数；多任务重复，模型升级后复评。

## 共识整理：能力总览图

新增一张 2880 × 5062 的高清研究信息图，整理库的能力、20 部门范围、意义、个人研究价值与后续 agency-orchestrator 调度关系。库包含多个身份，每个身份提供工作方法；编排器组织角色执行，实际成果仍由模型、工具及验收共同决定。当前先按需选取角色，后续再验证自动调度。

图文以固定版本资料为基础，统计由 catalog.json 填充；PNG 直接排版绘制，非角色运行截图。已接入网页 #guide、README 主图和项目封面。渲染与维护见 assets/capability-summary-brief.md。
