# Ponytail 整体机制：Skill、插件、Hooks、规则文件与 MCP

研究基准：4.10.0，commit `e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156`。对应[交互解析网页](../../site/apps/004-ponytail/architecture.html)。

## 整体关系

这些组件不是必须依次经过的五个步骤，而是内容、打包、运行时接入和替代接入方式的组合。

| 部分 | 主要职责 | 是否直接做工程判断 |
| --- | --- | --- |
| Skill | 保存什么时候用、如何决策、哪些边界不能省略 | 文本指导，不自行执行 |
| 插件 | 将技能与事件脚本登记到宿主 | 不判断代码方案 |
| Hooks | 在宿主事件发生时处理模式、构建规则、输出上下文 | 不搜索项目，不审核每次代码修改 |
| 静态规则文件 | 提供宿主可读取的紧凑原则 | 不包含完整动态模式管理 |
| MCP 服务 | 通过 Prompt / 工具按需返回核心规则 | 本服务只返回文本 |
| 宿主模型与工具 | 读取项目事实、决定复用方案、编辑与验证 | 真正执行开发任务 |

核心能力可概括为：工程规则内容，经宿主支持的接入方式进入上下文，再由原有模型和工具执行。Ponytail 改变的是任务中的指令与决策倾向，没有训练新模型，也不增加宿主原本没有的权限。

## 四条接入路径

### 1. 插件 + Hooks

插件清单 → 宿主注册技能和事件 → 事件触发 Hook → 脚本读取 Skill / 模式 → 构建规则 → 宿主接收上下文 → 模型执行开发。

仓库 `.codex-plugin/plugin.json` 显式声明 `skills` 与 `hooks` 路径；Claude 插件清单也声明共用 Hooks 配置。共用配置注册 SessionStart、UserPromptSubmit、SubagentStart 三个事件。

这里 Hook 直接读取核心 SKILL.md，所以自动注入这条路径不要求模型先主动选择或调用 Skill。不依赖 MCP，也不要求复制另一份 AGENTS.md。

### 2. 只调用 Skill

宿主发现技能元数据 → 用户显式调用或宿主按任务选择 → 加载正文 → 模型获得工程指导。

`name` 标识技能，`description` 描述使用场景和触发条件。实际加载由宿主完成，不一定使用 Ponytail 的 Node.js 规则构建器。没有 Hooks 也能提供核心方法，但不能因此假定存在自动激活、状态文件或子代理传递机制。

### 3. 只放静态规则文件

AGENTS.md 或宿主规则文件 → 宿主按自己的读取约定加载 → 紧凑规则进入上下文。

紧凑规则和完整 Skill 的正文不是逐字一致：工程原则对齐，但紧凑文件不包含全部技能元数据、强度示例和脚本功能。副本检查脚本维护紧凑文件的一致性并检查关键短语；它不负责加载规则。

复制一份静态规则不等于安装六项技能。规则依旧存在时，off 命令也不能删除该文件；Cursor 适配器对此做了检测，存在对应项目规则时避免重复注入，并提示动态模式切换不可用。

### 4. MCP 按需取规则

宿主连接服务 → 请求 Prompt `ponytail` 或工具 `ponytail_instructions` → 共用规则构建器返回文本 → 宿主将结果用于模型上下文。

Prompt 返回 user 消息，工具返回文本及 `{ mode, instructions }`；公开 mode 参数仅接受 lite/full/ultra。传输方式为 stdio，服务本身不调用模型，不读取用户项目，不生成补丁，也不将六个 Skill 全部转为 MCP 工具。

只连接服务不等于已经请求规则，更不意味着每轮自动加载。它提供协议兼容性，不能完全替代常驻接入机制。

## 一次开发请求的完整流程

以“给任务列表增加日期筛选”和共用 Hooks 路径为例：

1. **宿主登记插件。** 加载技能目录和事件配置，确定何时调用哪个脚本。
2. **启动选择模式。** activate 调用 getDefaultMode，按有效环境变量、配置文件、full 回退值的顺序解析，写入 `.ponytail-active`。
3. **构建规则正文。** getPonytailInstructions 读取 Skill，剥离 YAML 文件头，过滤其他强度的表格行与带引号示例；一般工程规则与安全边界保留，读文件失败时使用回退文本。
4. **按宿主输出格式交付。** runtime 将文本包装成宿主需要的 stdout / JSON。宿主必须识别并接收，才能进入上下文；各宿主字段和注入时机不同。
5. **模型获取项目事实。** 用户提交需求后，模型用原来的读文件、搜索等工具检查组件、字段和调用链。Ponytail 没有替模型维护组件数据库或自动生成调用图。
6. **模型按阶梯选择方案。** 已有 DateFilter 满足要求则复用；没有时继续评估标准库、原生控件和现有依赖。第一个满足需求的方案即停止点。
7. **宿主执行与验证。** 模型提出编辑和检查，宿主运行工具。规则要求保留明确需求、安全与必要检查，但没有代码门禁自动保证全部满足。

上下文可理解为宿主原有指令、项目规则、Ponytail 原则、用户需求和已读代码结果的组合。这只是说明结构，不是任何宿主完整或精确的消息格式。具体指令优先级由宿主决定，插件不能自行覆盖更高优先级约束。

review、audit 和 debt 是按需要调用的独立技能，不是每次实现后必然运行的自动流水线。

## 约束与决策如何写进 Skill

| 规则类别 | 具体要求 | 如何影响决策 |
| --- | --- | --- |
| 前置理解 | 读相关代码，追踪流程，修复前查调用方 | 防止只追求小 diff 而修错位置 |
| 优先顺序 | 必要性、仓库、标准库、原生、现有依赖、简短实现、必要新代码 | 先寻找已有能力 |
| 停止条件 | 找到首个满足需求的方案即采用 | 减少继续扩建 |
| 负面约束 | 不加未经请求的抽象、未来脚手架和无用配置 | 缩小实现范围 |
| 例外与底线 | 保留校验、安全、数据保护、无障碍、明确需求和真实硬件校准 | 不用短代码交换必要功能 |
| 妥协记录 | ponytail: 注释写上限和升级触发条件 | 使有局限的简化可追踪 |
| 交付要求 | 留下必要检查，说明省略项；明确要求的解释应完整提供 | 保持交付可验证 |

“懒惰资深开发者”是角色倾向；具体操作步骤、顺序和例外才是更可执行的行为指导。最终效果取决于模型能否正确遵循，以及项目上下文是否完整。

代码层面可以测试参数解析、模式过滤、状态写入、输出格式。模型是否完整读了调用链、复用是否正确、是否保留了所有边界，则不能由这些脚本测试自动证明。共用三个 Hooks 不包含对每次补丁进行复杂度判定并拒绝写入的功能。

## 7 步隔离脚本验证

运行[trace_hooks.py](experiments/trace_hooks.py)，结果保存在[hook-trace.json](experiments/hook-trace.json)。脚本核对固定 commit，通过隔离环境选择 Codex 格式输出分支，仅调用上游 Node.js 脚本；没有安装插件、启动真实宿主、调用模型或连接 MCP 客户端。

| 顺序 | 活动状态 | additionalContext 字符数 | 输出内容 |
| --- | --- | --- | --- |
| 会话启动 | full | 5229 | 完整规则，只有 full 强度行 |
| 普通开发请求 | full | 0 | 无输出 |
| 切换 lite | lite | 35 | 模式通知，非完整规则 |
| 子代理启动 | lite | 5202 | 完整规则，只有 lite 强度行 |
| 关闭模式 | 无标记 | 17 | 关闭通知 |
| 关闭后的子代理 | 无标记 | 0 | 无输出 |
| 再次运行激活脚本 | full | 5229 | 按默认值重新注入完整规则 |

字符数是解码后的上下文字符串长度，不是 token 数，也不是完整模型上下文长度。7 步的状态、是否含决策阶梯及模式过滤检查均通过。网页事件表直接从保存的 JSON 构建，不依赖重新运行实验。

由此确认：

- **并非每轮都重发正文。** 在本次分支，普通输入只经过模式识别；OpenCode 则通过每轮 system transform 追加正文，不能混为一谈。
- **模式通知不等于全文重载。** lite 切换只更新状态和通知，后续子代理读取新模式；父会话完整模式切换效果还取决于宿主如何加载技能，当前未验证。
- **off 不删除已有上下文。** 它删除状态并发出通知。再次运行 activate 会采用默认值，本例又成为 full。
- **当前与默认值分开。** 临时模式文件不是默认配置。SessionStart 还匹配 resume/clear/compact，而 activate 本身读取默认值；不能只靠 Skill 的持续性描述推断所有事件都会保留临时模式。
- **会话隔离取决于宿主。** 状态文件路径未包含显式 session ID。多个会话共享目录时可能相互影响；本次未做并发复现。

## 组合使用的判断

只调用 Skill 即可表达核心开发原则。插件提供更方便的自动加载和模式管理；静态规则适合文件约定入口；MCP 适合协议取用入口。按宿主能力选择合适的路径即可，不需要为了“完整”叠加全部入口。重复加载可能占用上下文、造成规则重复或模式冲突。

## 固定版本源码

- [核心 Skill](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/skills/ponytail/SKILL.md)
- [插件清单](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/.codex-plugin/plugin.json)
- [共用 Hooks 配置](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/hooks/claude-codex-hooks.json)
- [activate](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/hooks/ponytail-activate.js)、[mode-tracker](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/hooks/ponytail-mode-tracker.js)、[subagent](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/hooks/ponytail-subagent.js)
- [规则构建器](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/hooks/ponytail-instructions.js)、[配置](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/hooks/ponytail-config.js)、[runtime](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/hooks/ponytail-runtime.js)
- [OpenCode 适配器](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/.opencode/plugins/ponytail.mjs)
- [静态规则](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/AGENTS.md)、[副本检查](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/scripts/check-rule-copies.js)
- [MCP 注册入口](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/ponytail-mcp/index.js)、[MCP 规则选择](https://github.com/DietrichGebert/ponytail/blob/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156/ponytail-mcp/instructions.js)

本文为本研究原创解析，没有复制上游程序或技能全文。上游 MIT 许可与研究范围见[子项目 README](README.md)。
