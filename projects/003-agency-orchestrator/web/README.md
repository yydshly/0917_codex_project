# 003 能力展示网页维护

本页首先展示能力、场景、价值摘要与完整理解图，再整理质量和重复的边界、后续产品试验计划以及上游原有效果。沿用本仓库静态网站结构，不添加应用框架，也不连接模型服务。

## 文件

- `index.template.html`：页面正文、官方示例和素材说明。
- `scenarios.json`：四条原库模板的输入示例、分工与预期交付，不是运行产物。
- `styles.css`：响应式布局与打印样式。
- `app.js`：场景切换、键盘操作、动图播放/收起。
- `case.template.html`、`case.css`、`build_case.py`：实际场景页；读取保存的两轮模型输出和人工讲解，不在构建时调用模型。
- `../cases/content-launch/`：原始输入、运行记录、返工意见、原文节选和复现说明。
- `build.py`：Python 标准库构建，输出到 `site/apps/003-agency-orchestrator/`。
- `render_summary.py`：将研究内容排成一张完整中文图，生成 PNG、SVG 和文字版；仅重新制图时需要 Pillow 与 Windows 中文字体。网页构建直接复制现有产物。
- 上游展示素材、固定版本来源与许可：`../assets/`。

## 构建与预览

在仓库根目录执行：

```powershell
python scripts/projects.py sync
python scripts/projects.py check
python scripts/build_site.py
python -m http.server 8873 --bind 127.0.0.1 --directory site
```

能力总览：http://127.0.0.1:8873/apps/003-agency-orchestrator/ 。

实际案例：http://127.0.0.1:8873/apps/003-agency-orchestrator/case-content.html 。单独构建可用 `python projects/003-agency-orchestrator/web/build.py`。

不依赖网络或上游源码目录，所需素材已随本项目保存；没有 JavaScript 时所有场景保持可见，动图可通过独立链接打开。资源均为相对路径，适配 GitHub Pages 的仓库子路径，也可直接打开 HTML。

## 内容与验证

- 版本与规模沿用本子项目的研究快照；变更时需同步页面、来源记录与研究文档。
- 截图原样复制并保留署名、固定 commit 来源与许可，不能替换成仿造的运行结果。
- 官方动图采用用户点击播放，不自动播放；收起后恢复静态截图。
- 场景切换遵循 tab / tabpanel 语义，支持左右方向键、Home、End 和空格。
- 已执行构建、静态资源与锚点检查、JS 语法检查、素材哈希核对以及本地 HTTP 可达性验证。
- 本次未进行浏览器截图、界面自动化测试；不把上游截图当成本地网页验收截图。
- 实际案例来自 2026-09-17 的真实模型调用和反馈续跑；节选必须与对应轮次的原文完全匹配。构建时逐段断言，前三步用首轮、后两步用反馈后版本；完整两轮 JSON 可下载。
- 发布采用仓库现有 GitHub Pages 流程，公开地址验证后写入 `project.json.demo`。
- 发布包排除 Markdown，因此引导图文字版同时提供 `.txt`，网页指向可发布的文件。

完整理解图位于首页 `#guide`，提供高清原图、可放大 SVG 和文字版。图是研究解释材料；已查看成图并检查内容和边界，不是网页截图或浏览器验收记录。详细来源见 `../assets/capability-summary-brief.md`。
