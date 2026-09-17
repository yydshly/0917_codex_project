# 图片与截图来源

## 优秀标准与技术原理全景图

capability-summary.png（2520×3780）与 capability-summary.svg（1680×2520 逻辑画布）是同一张原创说明图，非上游官方图或软件截图。由 web/render_principles.py 根据已阅读的固定源码生成可编辑矢量图，再由 web/render_principles.cjs 在 Chromium 渲染为高清 PNG，无图片生成模型参与。

内容按“入口 → 标准来源 → 项目约束 → AI 执行 → 三路反馈 → 分层验收”组织，并归纳个人使用价值、模型升级的影响和后续待验证能力；用颜色辅助区分程序检查、上下文判断与审美/用户确认，但每个分类均有文字说明。箭头表示概念流程，三路反馈并非每个命令都会自动完整执行。

基准源码 f2c7051853848826aac2f4646581d62a732155ad；日期 2026-09-17。参考包括规则代码、critique、craft-floor、主 Skill、ENGINE.md、live.md。SVG 底部可点击来源；完整链接和文字替代版见 capability-summary-text.md。

## 实际浏览器截图

下表所列为 2026-09-17 本研究通过 Playwright / Chromium 渲染本地原创静态页面取得的真实截图，无图片生成、界面拼接或上游宣传素材。

| 文件 | 页面与状态 | 视口 |
| --- | --- | --- |
| before-desktop.png | before.html 默认状态，完整页面 | 1280×900 |
| after-desktop.png | after.html 默认状态，完整页面 | 1280×900 |
| after-mobile.png | after.html 默认状态，完整页面 | 390×844 |
| before-mobile.png | before.html 默认状态，手机首屏 | 390×844 |
| empty-mobile.png | after.html?scenario=empty，空结果首屏 | 390×844 |
| study-desktop.png | 研究页首屏 | 1440×1040 |
| study-mobile.png | 研究页手机首屏 | 390×844 |
| comparison-desktop.png | 研究页滚动至实验章节 | 1440×1040 |

页面源码在 ../web/。桌面与改造后手机图来自初轮真实渲染；后续也可由 ../experiments/check_browser.cjs 复现。fullPage 图片高度可超过视口高度。浏览器版本见 ../experiments/browser-checks.json。

基线是本研究构造的问题页面，不是上游产品、真实客户界面或无 Skill 模型产物。前后使用相同仓库数据，只有明确标注的长标题场景使用合成压力文本。
