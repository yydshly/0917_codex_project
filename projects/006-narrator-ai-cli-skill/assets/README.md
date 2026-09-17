# 项目图片与来源

`capability-summary.png` 是项目研究封面，`capability-summary.svg` 是同内容的可缩放版本；[文字说明](capability-summary-text.md)提供完整阅读顺序与概念解释。

图片由本研究于 2026-09-17 根据公开源码、Skill 文档与本次讨论原创整理，展示能力、角色、上传流程、任务交互、约束边界和输出。固定上游版本为 Skill `4b17c6f`、CLI `2d8bb14`，来源见[证据目录](../sources.md)。它是逻辑说明图，不是运行截图、实际生成样片或后端真实部署图。生成入口为 `../render_summary.py`（Python + Pillow，需可用的中文字体）。

后续真实截图放在此目录，记录拍摄日期、上游版本、任务与素材来源，并提供有意义的替代文本。添加封面后更新 `project.json`，再运行项目同步脚本。不得以概念图冒充运行结果。

## 网页实拍

`study-desktop.png` 与 `study-mobile.png` 为 2026-09-17 使用 Chromium 对本研究网页本地构建的真实截图，视口分别为 1280 × 900、390 × 900（完整页面截图）。由 `web/check_browser.cjs` 生成，检查结果见 `../experiments/browser-checks.json`。这些截图展示静态研究页面，不是上游视频制作系统界面或生成样片。
