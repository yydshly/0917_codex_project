# 图片与素材

## 原理全景图

- `capability-summary.png`：2400 × 3700 高清图。
- `capability-summary.svg`：相同内容的矢量版，可放大阅读。
- `capability-summary-text.md`：按图中阅读顺序导出的文字版。
- 生成日期：2026-09-17。图的内容、布局和绘制脚本均为本研究原创；不是软件截图或模型运行效果图。
- 事实基准：Ponytail v4.10.0，commit `e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156`，上游许可证 MIT。
- 来源：[固定版本源码](https://github.com/DietrichGebert/ponytail/tree/e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156)、[本研究源码分析](../architecture.md)、[7 步 Hook 隔离实验](../experiments/hook-trace.json)。图中日期筛选为教学案例，未用模型做收益对照实验。
- 复现：在 Windows 上运行 `python projects/004-ponytail/web/render_summary.py`，需要 Pillow 和微软雅黑字体；静态站点正常构建直接复制已生成资源，不依赖 Pillow。
- 替代文本：Ponytail 原理全景图，展示作用与能力、四条并列接入路径、规则进入模型上下文、七步复用决策、日期筛选案例，以及程序控制与提示约束的区别。
