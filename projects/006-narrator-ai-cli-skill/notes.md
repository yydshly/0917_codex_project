# 006 · Narrator AI CLI Skill — 研究笔记

## 2026-09-17：能力与原理的静态研究

### 目标与方法

先说明用户能做什么、得到什么，再沿着 Skill → CLI → API 解释实现。读取上游 Skill 是为了研究，不代表将它安装为当前会话的操作规则。

本次实际完成：阅读 Skill、四份参考文档、插件描述与许可证；检查任务映射、HTTP 客户端、配置、文件上传、素材查询与资源表；用 Python 标准库 `ast` 统计资源常量；记录上游 commit 和固定版本来源。

本次没有执行：CLI 依赖安装、账户登录、API Key 配置、云端素材查询、收费任务创建、生成样片与播放验收。下文的接口流程是源码分析结果，不是云端运行日志。

### 环境与版本

| 项目 | 记录 |
| --- | --- |
| 研究环境 | Windows / PowerShell，本地 Python 可运行项目管理与静态解析脚本 |
| Skill 检出 | `upstream/narrator-ai-cli-skill/` |
| Skill commit | `4b17c6f2175bd532c92db778a847f8fb6bdd3177` |
| Skill 描述版本 | `1.0.5`，来自 `SKILL.md` 与 `plugin.json` |
| CLI 检出 | `upstream/narrator-ai-cli/` |
| CLI commit | `2d8bb1463058fb36f267f205994dca38b32f037d` |
| CLI 包声明版本 | `1.0.0`，来自 `pyproject.toml`；包版本不等同于 Git commit |

### 静态资源盘点

| 常量 | 实际统计结果 | 解释 |
| --- | --- | --- |
| `commands/bgm.py` → `BGM_LIST` | 146 条 | 资源目录，不是本地音频包 |
| `commands/dubbing.py` → `DUBBING_LIST` | 63 条，11 个语言标签 | 音色目录，不是本地模型 |
| `commands/task.py` → `NARRATION_TEMPLATES` | 90 条，12 类题材 | 风格名称与 ID，内部实现不可见 |
| `commands/task.py` → `TASK_TYPES` | 9 类 | 可创建任务的接口映射 |
| `commands/materials.py` | 云端分页查询 | 未查询实时影片素材数量 |

复核方法：用 `ast.parse` 解析文件，定位相应 `ast.Assign`，对常量值使用 `ast.literal_eval`，统计长度和去重后的 `type` / `genre`。没有导入或执行上游模块。[证据 C3、C6、C7、C8](sources.md)

## 关键源码阅读结果

### 1. 客户端入口与请求

`pyproject.toml` 将命令映射到 `narrator_ai.cli:app`。`NarratorClient` 读取服务地址、密钥和超时配置，复用 HTTPX 客户端，在请求头加入 `app-key`；检查 HTTP 状态与业务返回码，成功时提取 `data`，并提供 SSE 和上传方法。

默认地址为 `https://openapi.jieshuo.cn`，可通过环境变量或 `~/.narrator-ai/config.yaml` 配置。这里只分析配置机制，没有读取实际凭据。[证据 C1、C2、C5](sources.md)

### 2. 任务映射

| CLI 类型 | HTTP 路径 | 职责 |
| --- | --- | --- |
| `popular-learning` | `/v2/task/commentary/create_popular_learning` | 参考风格学习 |
| `generate-writing` | `/v2/task/commentary/create_generate_writing` | 二创文案 |
| `fast-writing` | `/v2/task/commentary/create_fast_generate_writing` | 原创文案 |
| `clip-data` | `/v2/task/commentary/create_generate_clip_data` | 二创路线剪辑数据 |
| `fast-clip-data` | `/v2/task/commentary/create_generate_fast_writing_clip_data` | 原创路线剪辑数据 |
| `video-composing` | `/v2/task/commentary/create_video_composing` | 合成视频 |
| `magic-video` | `/v2/task/commentary/create_magic_video` | 视觉包装 |
| `voice-clone` | `/v2/task/voice_clone/create` | 声音克隆 |
| `tts` | `/v2/task/text_to_speech/create` | 文字转语音 |

`task create` 检查任务名、解析 JSON，再向对应路径发送请求；`--stream` 切换为 SSE。公开代码没有逐项强制执行 Skill 中所有资源确认和语言要求。[证据 C3](sources.md)

### 3. 异步数据流

查询路径为 `/v2/task/commentary/query/{task_id}`。顶层状态为 0 初始化、1 执行中、2 成功、3 失败、4 取消；嵌套子任务状态使用另一套编码，不能混用。

**原创路线：**

1. `fast-writing` 创建响应给出 `task_id`。
2. 查询完成记录，取 `files[0].file_id` 引用文案文件。
3. `fast-clip-data` 接收上述任务 ID、文件 ID，以及音色、BGM 和剧集素材。
4. 剪辑任务完成后，取其顶层 `task_order_num`。
5. `video-composing` 以该值作为 `order_num`，查询完成后取得视频 URL。

**二创路线：**

1. 选择预设 `learning_model_id`；或执行 `popular-learning` 获得风格标识。
2. 创建 `generate-writing`，等待完成并保存顶层 `task_order_num`。
3. `clip-data` 以写稿步骤的 `task_order_num` 作为 `order_num`，附带音色和 BGM。
4. 剪辑数据任务完成后，合成仍使用写稿任务的 `task_order_num`，再次传入音色与 BGM。

不能用“总是传上一步 ID”的规则替代两条路线的差异。响应中的账单订单号也不等于顶层 `task_order_num`。[证据 S3、S5、C10](sources.md)

### 4. 素材与影片搜索

- `material list` 请求 `/v2/res/movie-sucai`，返回含视频、字幕文件 ID 的资源信息。
- `search-movie` 请求 `/v2/task/commentary/search_media_information`，返回影片资料。
- `file upload` 上传实际文件。

影片资料可以用于写稿，但不能替代剪辑素材。纯解说模式仅在 `fast-writing` 省略剧集字段，后续 `fast-clip-data` 示例仍含视频与字幕引用。[证据 S3、C3、C4、C6](sources.md)

### 5. 上传与存储

1. POST `/v2/files/upload/presigned-url`，提交文件名、大小和类型。
2. 对返回的 URL 执行 PUT，发送文件内容。
3. POST `/v2/files/upload/callback`，确认文件 ID、对象键和上传结果。

下载命令申请的是有有效期的下载 URL。素材保留期、生成链接有效期和账户额度需要实际服务信息确认。[证据 C4](sources.md)

## 文档差异与研究边界

| 观察 | 处理方式 |
| --- | --- |
| README 描述“一句话完成”，Skill 要求逐项确认 | 描述为自然语言入口与可编排流程，不承诺无人值守 |
| Skill 写请求到平台地址，源码另有对象存储上传，后端文档还列第三方依赖 | 不解读为数据绝不离开单一服务商 |
| 主 Skill 文案价格以千字符计，工作流某参数表出现按字符计的写法 | 不给出确定成本，后续用预算与账单核对 |
| CLI 帮助与详细 Skill 对某些必填项和合成参数的描述不完全一致 | 记录文档约定，后续结合校验与真实返回复核 |
| `learning_model_id` 名称中有 model | 不把字段名当作模型训练证据 |
| 音色 ID 中出现供应商品牌 | 只记录目录事实，不推断所有 TTS 的提供方 |
| 后端依赖文档列出数据库、队列、模型服务，同时含 TODO | 作为架构线索，不当作已审计的生产部署 |

依据见 [S1–S5、C3、C4、C7、C9](sources.md)。

## 后续最小实验方案（尚未执行）

1. 独立环境安装固定 CLI commit，记录 Python 和依赖版本；按上游方式配置有效账户。
2. 准备可用于实验的视频与对应 SRT，记录文件摘要、时长和字幕版本。
3. 固定语言、音色、BGM 和解说风格。
4. 按原创路线检查素材、估算预算、写稿、生成剪辑数据、合成并下载成片。
5. 保存去除凭据和敏感链接后的请求、任务状态、消耗、耗时与产物信息。
6. 相同素材测试二创路线，需要比较包装时再添加视觉模板。

此方案不预先承诺片长、画质、成功率或成本；均需记录真实结果。

| 检查项 | 判定方法 | 当前结果 |
| --- | --- | --- |
| 文案事实 | 对照原片和字幕检查人物、事件、因果 | 未执行 |
| 画面对应 | 按解说句段检查素材，记录错配位置 | 未执行 |
| 配音字幕同步 | 记录时间偏差、漏字与截断 | 未执行 |
| 原声衔接 | 检查旁白覆盖对白、音量突变和停顿 | 未执行 |
| 视觉模板 | 检查标题语言、裁切、字幕遮挡与分集 | 未执行 |
| 成本与耗时 | 比较预算、实际积分及各步骤耗时 | 未执行 |
| 异常恢复 | 记录失败状态与必要步骤的重试情况 | 未执行 |

公开资料足以说明功能入口、工作流和客户端实现，不能替代成片验证。

## 2026-09-17：讨论理解汇总与单图说明

结合后续讨论，将库本身的价值进一步明确为“操作方法、接口知识与流程约束”，避免把云端平台能力完全归到 Skill 文件本身。新增一张总览图，按角色、素材、任务交互、约束和输出五部分组织，包含用户上传到对象存储的过程与异步任务返回路径。

图由 `render_summary.py` 绘制，同步生成 PNG 和 SVG；已检查 PNG 中的文字、连线、边距与布局。图片作为子项目封面，另提供文字说明；没有模拟或伪造运行截图、生成样片。首页通过项目同步脚本更新。

## 2026-09-17：静态研究网页

按讨论结果建立网页，以总览图引导，依次解释角色、素材上传、任务交互、制作链、约束和服务端 Agent 的未知边界。摘要强调这是由 Codex 等宿主助手驱动的 Skill，CLI 下发指令与查询结果，服务端处理素材。

实际验证：标准库构建成功；Chromium 在 320、390、768、1280 像素宽度下无横向溢出，图像正常加载，章节锚点与键盘展开收起有效，8 个公开文件与构建结果一致。本地检查共 13 项，通过；完整记录见 `experiments/browser-checks.json`。桌面与手机截图已保存到 assets。

网页不执行上游制作能力，网页可访问与本地浏览器检查不能证明云端成片效果。发布继续沿用当前仓库 GitHub Pages。

### 首次发布与线上验证

首次发布对应 commit `dc80364f358901a7ec8ebe46846578dfcc31fe5e`，GitHub Pages [工作流 35213733990](https://github.com/yydshly/0917_codex_project/actions/runs/35213733990) 成功。线上地址为 [006 研究页](https://yydshly.github.io/0917_codex_project/apps/006-narrator-ai-cli-skill/)。

线上检查共 13 项通过：四种视口无溢出且图片正常、原生键盘交互与锚点正常、8 个公开文件内容与本地构建一致。记录保存在 `experiments/deployment.json`。验证后将正式地址登记到项目元数据并同步首页。研究网页已发布，不表示上游生成能力已实测。
