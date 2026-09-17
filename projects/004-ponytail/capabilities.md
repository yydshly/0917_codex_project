# Ponytail：能力与技术原理

研究日期：2026-09-17。所有源码引用固定到 `e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156`（4.10.0）。本文将“规则要求助手这样做”与“程序自动保证这样做”分开；前者不能当作经过模型实测的能力保证。

## 核心决策规则

核心技能要求先读相关代码、理解实际流程，再按以下顺序选择满足需求的实现：

| 顺序 | 判断 | 预期收益 |
| --- | --- | --- |
| 1 | 功能是否真的需要存在 | 不为假设中的未来需求开发 |
| 2 | 仓库内是否已有实现 | 复用工具、类型或现有模式 |
| 3 | 标准库能否完成 | 减少自定义算法与维护成本 |
| 4 | 平台原生功能能否完成 | 使用浏览器控件、CSS、数据库约束等 |
| 5 | 已安装依赖能否完成 | 复用已有能力，避免重复引入依赖 |
| 6 | 是否能用一行完成 | 在满足约束时采用简洁表达 |
| 7 | 前述方案均不足 | 编写必要的最小实现 |

修复缺陷时，技能特别要求搜索被修改函数的调用方，在共享路径修复根因，而不是只对报告中的症状加补丁。这是自然语言操作指导，没有自动构建调用图的专用程序。

规则还要求保留信任边界输入校验、防止数据丢失的错误处理、安全措施、基本无障碍、明确要求的功能和真实硬件校准能力。非平凡逻辑应留下至少一个可运行检查；这不能取代项目本身更完整的测试要求。

来源：[核心技能](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/skills/ponytail/SKILL.md)。

## 模式与六项技能

| 模式 | 行为目标 | 理解边界 |
| --- | --- | --- |
| lite | 完成需求，同时指出更省事的备选方案 | 用户选择是否采用 |
| full | 默认模式，优先复用、原生能力和最小改动 | 最小实现仍应满足明确需求 |
| ultra | 更积极地质疑需求、优先删除和延期不必要部分 | 需要明确验收范围，不能作为任意省略需求的授权 |
| off | 适配器停止提供新的规则上下文 | 已进入对话的文本不会从历史中物理删除；关闭后的模型行为需实测 |

### ponytail-review：审查当前 diff

输出位置、问题标签、建议替代实现和可减少行数估计。标签包括删除、标准库替代、原生替代、不必要设计、逻辑缩短。技能只列建议，不应用修复；正确性、安全漏洞和性能问题明确不属于该审查范围。

值得核查的例子：技能将邮件验证类简化为包含 `@` 的检查，并将确认邮件视为真实验证。邮箱所有权确认与格式、长度、业务规则等是不同要求，不能脱离具体边界直接使用该示例替换验证逻辑。此处是研究者对示例适用范围的判断，不代表本次观察到模型实际删除校验。

来源：[review 技能](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/skills/ponytail-review/SKILL.md)。

### ponytail-audit：全库复杂度审查

将 review 扩展到仓库全树，寻找单实现接口、单产品工厂、仅转发的包装、无用配置和可以被平台替代的依赖。输出按潜在缩减量排序，估计可减少的行数和依赖数量；只报告，不修改。

“扫描全库”是给宿主模型的任务指令，实际覆盖率受搜索工具、上下文容量和模型执行情况影响。没有内置的静态分析覆盖率证明。

来源：[audit 技能](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/skills/ponytail-audit/SKILL.md)。

### ponytail-debt：显式简化标记的台账

查找代码注释中的 `ponytail:` 标记，按文件列出已做的简化、已知上限和升级触发条件；缺少升级路径的标记会被列为 `no-trigger`。可借助 blame 补充修改者，但没有自动项目管理或提醒服务。

默认只读报告。它依赖开发时主动留下标记，不能把“未找到标记”解释为仓库没有技术债。扫描示例只列出部分注释语法，需要按语言补充。

来源：[debt 技能](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/skills/ponytail-debt/SKILL.md)。

### ponytail-gain 与 ponytail-help

gain 展示预先写在技能中的上游基准成绩，没有实时计量当前项目的模型费用或代码节省。该技能明确禁止虚构“本仓库节省了多少”；不过它仍保留旧评测数字，与修正后的 README 存在口径差异。help 提供命令速查。

来源：[gain 技能](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/skills/ponytail-gain/SKILL.md) · [help 技能](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/skills/ponytail-help/SKILL.md)。

## 接入与运行机制

### 规则构建

`getPonytailInstructions(mode)` 读取核心技能，剥离 YAML 文件头，过滤其他模式的表格行与带引号示例。常规工程规则和安全边界继续保留，读取失败时使用内置回退文本。特殊 `review` 状态只返回模式提示，由独立 review 技能定义行为。

这里的过滤操作处理提示词文本，不处理用户项目的源代码。

来源：[ponytail-instructions.js](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/hooks/ponytail-instructions.js)。

### 配置、状态与 Hooks

默认模式优先级为环境变量 `PONYTAIL_DEFAULT_MODE` → 配置文件 `defaultMode` → `full`。配置目录支持 `XDG_CONFIG_HOME`，Windows 回退到 `%APPDATA%/ponytail/`，其他平台回退到 `~/.config/ponytail/`。

| 事件或组件 | 实现行为 |
| --- | --- |
| SessionStart | 读取默认模式，写入活动模式标记，输出对应规则；共用配置匹配 startup/resume/clear/compact |
| UserPromptSubmit | 解析模式查询、切换、关闭和默认值设置命令，更新模式并输出通知；部分宿主额外注入完整规则 |
| SubagentStart | 读取活动模式，给符合条件的子代理注入规则；可用正则限制代理类型 |
| runtime | 识别宿主，选择状态目录，按宿主要求输出文本或 JSON |

共用配置实际注册了三个事件，不应将 README 中“两项 Hooks”的简化表述当作精确数量。当前实现多处采取尽力而为的错误处理：出错时通常不阻断宿主，这有助于保持会话可用，但也意味着规则可能没有成功注入。

模式写入 `.ponytail-active`，主 Hook runtime 路径未包含会话 ID；OpenCode 也使用固定状态文件。因此，如果多个会话共享同一状态目录，源码上存在相互影响模式的可能性。宿主是否为每个会话提供隔离目录需另行实测，本研究不声称已经复现串扰。

来源：[配置解析](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/hooks/ponytail-config.js) · [事件配置](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/hooks/claude-codex-hooks.json) · [activate](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/hooks/ponytail-activate.js) · [mode-tracker](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/hooks/ponytail-mode-tracker.js) · [subagent](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/hooks/ponytail-subagent.js) · [runtime](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/hooks/ponytail-runtime.js)。

### 宿主差异

| 接入方式 | 仓库实现 | 本研究确认范围 |
| --- | --- | --- |
| Claude Code / Codex 插件 | 技能目录和生命周期 Hooks，按宿主转换上下文输出格式 | 已读源码，未安装到真实会话 |
| OpenCode 插件 | 注册命令与技能路径，每轮追加系统上下文，文件保存模式 | 已读源码，未实测并发会话与模式切换时序 |
| Cursor Hooks / 规则文件 | 项目规则已存在时，Hooks 避免重复注入；无法用模式命令关闭该静态规则 | 已读 runtime 与项目说明；未验证具体宿主版本 |
| 其他规则文件接入 | 将同一组精简规则放进宿主可识别的文件 | 检查了 7 份紧凑规则副本的一致性；不等于各宿主完整兼容测试 |
| MCP | 提供 prompt 和只读指令工具，按调用返回规则文本 | 指令构建测试通过；未进行客户端协议握手 |

本文描述固定版本仓库中的适配实现，不作为宿主最新安装指南。参考：[Codex manifest](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/.codex-plugin/plugin.json) · [OpenCode 插件](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/.opencode/plugins/ponytail.mjs) · [Cursor 说明](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/docs/cursor-hooks.md)。

### MCP 的真实能力

服务使用 MCP SDK、Zod 和 stdio 传输，暴露两种入口：

- Prompt `ponytail`：返回带规则文本的 user 消息，支持 `lite/full/ultra`。
- Tool `ponytail_instructions`：返回同样的文本及 `{ mode, instructions }` 结构化结果，标记为只读。

它不扫描项目、不生成补丁、不运行模型。MCP 没有跨宿主通用的“每轮自动注入规则”机制，因此不能把该服务视作常驻插件的完全替代。公开参数 schema 只接受 `lite/full/ultra`；内部解析函数针对 `off` 等无效值会回退到可提供的强度，本地测试覆盖的是这一内部行为，不表示协议入口接受 `off` 作为关闭命令。

来源：[MCP 实现](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/ponytail-mcp/index.js) · [说明](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/ponytail-mcp/README.md)。

## 适用场景与能力边界

| 场景 | 可能价值 | 应核对的条件 |
| --- | --- | --- |
| 小型前端功能 | 优先原生输入控件、CSS 和已有组件 | 交互、视觉、无障碍与兼容性是否满足需求 |
| 维护性重构 | 找出重复逻辑、不必要包装和无效配置 | 接口契约、测试、外部调用者是否保留 |
| 修复共享逻辑缺陷 | 提醒搜索全部调用方并修复共同路径 | 提示词不能证明模型已完整追踪 |
| 技术债盘点 | 让刻意简化的上限可追溯 | 未标记的债务不会出现在清单中 |
| 大型复杂业务或公共库 | 作为质疑复杂度的一种视角 | 单实现接口也可能服务稳定边界或公共 API，不能机械删除 |
| 来源研究和长文分析 | 仅作为开发阶段的辅助方法 | 核心技能明确不用于普通知识、摘要等非编程任务；不替代证据收集 |

收益机制是少选一些不必要的方案，从而可能减少实现和模型输出。注入规则本身也消耗上下文，复杂推理和反复判断可能增加成本；没有使用前后的等价任务基线，就无法计算当前项目究竟省了多少。
