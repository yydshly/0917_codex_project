# 006 · 固定版本与证据来源

研究日期：2026-09-17。以下链接固定到本次实际检出的 commit，避免上游修改后结论与来源不一致。

## 上游版本与许可

| 对象 | 固定 commit | 声明版本 | 许可证与版权 |
| --- | --- | --- | --- |
| narrator-ai-cli-skill | `4b17c6f2175bd532c92db778a847f8fb6bdd3177` | 1.0.5 | MIT；Copyright (c) 2026 jieshuo-ai |
| narrator-ai-cli | `2d8bb1463058fb36f267f205994dca38b32f037d` | 1.0.0 | MIT；Copyright (c) 2026 AI解说大师 |

许可证原文：[Skill LICENSE](https://github.com/NarratorAI-Studio/narrator-ai-cli-skill/blob/4b17c6f2175bd532c92db778a847f8fb6bdd3177/LICENSE) · [CLI LICENSE](https://github.com/NarratorAI-Studio/narrator-ai-cli/blob/2d8bb1463058fb36f267f205994dca38b32f037d/LICENSE)。本研究不将代码许可扩展解释为影视、配音或平台其他资源的使用授权。

## 证据目录

| 编号 | 固定版本文件 | 支持的结论 |
| --- | --- | --- |
| S1 | [README.md](https://github.com/NarratorAI-Studio/narrator-ai-cli-skill/blob/4b17c6f2175bd532c92db778a847f8fb6bdd3177/README.md) | 产品定位、宣传资源规模、安装要求和 API Key |
| S2 | [SKILL.md](https://github.com/NarratorAI-Studio/narrator-ai-cli-skill/blob/4b17c6f2175bd532c92db778a847f8fb6bdd3177/SKILL.md) | 流程、交互约束、语言一致与任务字段关系 |
| S3 | [references/workflows.md](https://github.com/NarratorAI-Studio/narrator-ai-cli-skill/blob/4b17c6f2175bd532c92db778a847f8fb6bdd3177/references/workflows.md) | 两条路线、三种原创模式、输入输出与任务衔接 |
| S4 | [references/magic-video.md](https://github.com/NarratorAI-Studio/narrator-ai-cli-skill/blob/4b17c6f2175bd532c92db778a847f8fb6bdd3177/references/magic-video.md) | 版式、标题、水印、分集与文字语言规则 |
| S5 | [references/operations.md](https://github.com/NarratorAI-Studio/narrator-ai-cli-skill/blob/4b17c6f2175bd532c92db778a847f8fb6bdd3177/references/operations.md) | 轮询、响应结构、文件与账户操作、错误处理 |
| S6 | [references/resources.md](https://github.com/NarratorAI-Studio/narrator-ai-cli-skill/blob/4b17c6f2175bd532c92db778a847f8fb6bdd3177/references/resources.md) | 素材、BGM、音色和风格模板字段 |
| C1 | [pyproject.toml](https://github.com/NarratorAI-Studio/narrator-ai-cli/blob/2d8bb1463058fb36f267f205994dca38b32f037d/pyproject.toml) | Python 版本、依赖、包版本与命令入口 |
| C2 | [src/narrator_ai/client.py](https://github.com/NarratorAI-Studio/narrator-ai-cli/blob/2d8bb1463058fb36f267f205994dca38b32f037d/src/narrator_ai/client.py) | HTTP 封装、鉴权、业务错误处理、SSE 与上传 |
| C3 | [src/narrator_ai/commands/task.py](https://github.com/NarratorAI-Studio/narrator-ai-cli/blob/2d8bb1463058fb36f267f205994dca38b32f037d/src/narrator_ai/commands/task.py) | 9 类创建任务、90 个风格条目、搜索、查询、预算与校验 |
| C4 | [src/narrator_ai/commands/file.py](https://github.com/NarratorAI-Studio/narrator-ai-cli/blob/2d8bb1463058fb36f267f205994dca38b32f037d/src/narrator_ai/commands/file.py) | 预签名上传、对象存储 PUT、回调和下载链接 |
| C5 | [src/narrator_ai/config.py](https://github.com/NarratorAI-Studio/narrator-ai-cli/blob/2d8bb1463058fb36f267f205994dca38b32f037d/src/narrator_ai/config.py) | 默认地址、环境变量和配置存储 |
| C6 | [src/narrator_ai/commands/materials.py](https://github.com/NarratorAI-Studio/narrator-ai-cli/blob/2d8bb1463058fb36f267f205994dca38b32f037d/src/narrator_ai/commands/materials.py) | 云端素材查询与视频、字幕引用 |
| C7 | [src/narrator_ai/commands/dubbing.py](https://github.com/NarratorAI-Studio/narrator-ai-cli/blob/2d8bb1463058fb36f267f205994dca38b32f037d/src/narrator_ai/commands/dubbing.py) | 63 个音色条目、语言标签与 ID 格式 |
| C8 | [src/narrator_ai/commands/bgm.py](https://github.com/NarratorAI-Studio/narrator-ai-cli/blob/2d8bb1463058fb36f267f205994dca38b32f037d/src/narrator_ai/commands/bgm.py) | 146 个 BGM 条目 |
| C9 | [docs/dependencies.md](https://github.com/NarratorAI-Studio/narrator-ai-cli/blob/2d8bb1463058fb36f267f205994dca38b32f037d/docs/dependencies.md) | 后端模型、TTS、队列、数据库与缓存的文档线索，含待完善项 |
| C10 | [src/narrator_ai/models/responses.py](https://github.com/NarratorAI-Studio/narrator-ai-cli/blob/2d8bb1463058fb36f267f205994dca38b32f037d/src/narrator_ai/models/responses.py) | 业务错误码及 0–4 任务状态常量 |

## 证据等级

- **源码可确认**：接口、传参、上传机制、本地目录资源条目数量。
- **上游文档声明**：影片规模、质量与速度比较、云端能力；未通过本次运行复核。
- **研究解释**：例如字幕在文案与时间线之间起桥梁作用；不等同于已掌握后端算法。
- **待验证**：实际成片、供应商实时路由、价格、运行可靠性、部署架构及未公开算法。

上游源码检出在被忽略的 `upstream/`，未整体引入研究目录。本子项目的能力总览图是根据接口关系和本次讨论整理的原创说明图，不是上游截图或后端真实拓扑；包含 PNG、SVG 和文字说明。当前没有引用或生成影视样片、音频和运行截图。
