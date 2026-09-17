# 能力总览图 · 内容与制作说明

- 文件：capability-summary.png，2880 × 5062 像素，PNG。
- 用途：作为 002 的网页引导图、README 主图与根索引封面。
- 内容来源：本项目固定版本 catalog.json、重点角色文件、原版 001 研究与此前核对的配套编排项目说明。
- 基准：中文版 `fa3c83ddff9954e0dd7af1fc3e39d919d7af6452`，研究日期 2026-09-17。
- 图的性质：原创研究信息图，非上游应用截图、角色运行结果或自动编排实测证据。

## 内容结构

1. 定位：包含多个身份的中文角色与工作方法库，身份定义职责、规则、步骤和交付要求。
2. 能力与意义：中文化、本地化与原创扩展、工具适配；将工作要求组织成可复用指令。
3. 范围：实际 277 个角色、20 个部门，列出全部部门与对应数量。
4. 对个人研究工作的价值：源码理解、最小验证、证据核验、中文文档与展示、按需补充领域视角。均为潜在价值，尚未做效果对照。
5. 后续方向：独立 agency-orchestrator 可组织角色、依赖和并行步骤并传递结果；模型与工具负责实际执行，用户确定目标、提供条件并验收结果。
6. 边界和采用标准：数量不代表效果；固定任务和模型做对照，模型升级后复评。

## 制作与复现

文字内容源为 `web/capability-summary.template.html`；构建脚本从 catalog.json 自动填充角色总数、部门数量和版本，输出 `web/capability-summary.html`。

为保证中文文字清晰和整图无重复拼接，PNG 使用 Pillow 从该 HTML 的内容节点直接排版绘制。它不是浏览器长截图。导出脚本依赖 Pillow 和 Windows 微软雅黑字体；常规站点构建只复制已生成的 PNG，不依赖这些导出条件。

```powershell
python projects/002-agency-agents-zh/web/build.py
python projects/002-agency-agents-zh/web/render_summary.py
python scripts/build_site.py
```

修改图文后须重新导出 PNG 并检查整图。已检查全部五个内容分区、20 部门数量、文字排版、后续调度边界与来源说明。HTML 和 PNG 共用正文，排版布局各自适配展示与导出。

图中第三方角色资料沿用上游 MIT 许可，版权声明随图注明；完整许可见 web/UPSTREAM-LICENSE.txt。
