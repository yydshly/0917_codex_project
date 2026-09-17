# 固定版本来源索引

研究日期：2026-09-17。上游提交：`c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`（2026-09-14）。

| 来源 | 支持的结论 |
| --- | --- |
| [README.md](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/README.md) | 定位、六阶段概述、安装入口、运行依赖；单仓库起点与更大 harness 的关系 |
| [SKILL.md](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/SKILL.md) | guidance / full audit、模式与预算、主代理写入权、沙箱要求、严重性、修复边界 |
| [RECONNAISSANCE.md](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/RECONNAISSANCE.md) | 四个基础侦察角色、确定性覆盖 ID、状态约束、以往记录复核 |
| [HUNTING.md](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/HUNTING.md) | 调查提示组合、候选门槛、结构化返回、去重和覆盖检查循环 |
| [ATTACK-CLASSES.md](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/ATTACK-CLASSES.md) | 9 组基础方法与 10 个专项领域入口 |
| [VALIDATION-AND-REPORTING.md](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/VALIDATION-AND-REPORTING.md) | 三种结论、独立验证、最终记录复核、报告内容与未完成状态 |
| [report-schema.json](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/report-schema.json) | 各结论的字段契约与额外字段限制 |
| [validate-findings.cjs](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/validate-findings.cjs) | JSON Schema 解释、字段与语义规则；校验范围不包含目标源码事实证明 |
| [validate-coverage-ledger.cjs](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/validate-coverage-ledger.cjs) | 覆盖 ID、状态、所有者、引用与归档检查 |
| [LICENSE](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/LICENSE) | MIT，Copyright (c) 2025–2026 Cloudflare, Inc. |

网页每个专项卡片另有对应固定文件的直接链接。展示中的解释、假设案例和图形为本研究整理，不是上游原文、官方产品界面或真实运行记录。没有用仓库 star 数或宣传案例推导审计准确率。

## 讨论与历史项目比较的来源

- [Defending Code 前次研究](https://yydshly.github.io/0915_codex_project/008-defending-code-harness/)：2026-09-15 整理，固定提交 `d3bea6b5793b5f3d59a75ebe69a58efa88383145`。本次重新读取已保存的 README 与 notes/sources.md。
- [Defending Code 固定 README](https://github.com/anthropics/defending-code-reference-harness/blob/d3bea6b5793b5f3d59a75ebe69a58efa88383145/README.md)：交互技能与自动流水线、默认 C/C++ 范围。
- [模型调用层](https://github.com/anthropics/defending-code-reference-harness/blob/d3bea6b5793b5f3d59a75ebe69a58efa88383145/harness/agent.py)、[隔离实现](https://github.com/anthropics/defending-code-reference-harness/blob/d3bea6b5793b5f3d59a75ebe69a58efa88383145/harness/sandbox.py)、[补丁说明](https://github.com/anthropics/defending-code-reference-harness/blob/d3bea6b5793b5f3d59a75ebe69a58efa88383145/docs/patching.md)：Claude Code 依赖、容器与补丁验证的前次源码依据。
- [Ponytail 研究](../004-ponytail/README.md)：固定 `e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156`，实现必要性与复用原则。
- [Impeccable 研究](../005-impeccable/README.md)：固定 `f2c7051853848826aac2f4646581d62a732155ad`，设计方法与部分界面确定性检测。
- [gstack 研究](https://yydshly.github.io/0911_codex_project/012-gstack/)：固定 `71f6048e8ada25180e61438abc1d98cb151fe9a7`，研发环节的技能与配套工具。

“六类检查角度”和“七类约束”是本研究为解释上游规则所作的中文归纳，不是上游额外提供的六个或七个检测器。比较仅限已研究机制，未重新运行上游，也没有准确率对照实验。
