# Ponytail 静态研究网页

页面按三项问题组织：库的能力与意义、日期筛选场景、Skill 的入口和约束机制。使用原生 HTML、CSS 和 JavaScript，无第三方前端依赖；没有模型调用、账号、数据库或外部字体请求。

## 内容与维护

- `index.template.html`：页面内容与固定版本源码链接。
- `architecture.template.html`、`architecture.css`、`architecture.js`：整体构成详解页，提供四条接入路径切换、请求生命周期、约束分析和真实 Hook 运行摘要。
- `styles.css`：桌面与手机布局，键盘焦点和减少动态效果偏好。
- `app.js`：日期筛选、示例日期、清空、决策前提切换和模式解读。
- `build.py`：替换源码链接前缀，复制静态资源与研究文字版到 `site/apps/004-ponytail/`。

机制详解访问 `/apps/004-ponytail/architecture.html`。事件表从 `../experiments/hook-trace.json` 构建；构建不调用上游脚本或模型。复现实验需另外运行 `python projects/004-ponytail/experiments/trace_hooks.py`，并准备固定 commit 的上游源码与 Node.js。

所有页面调整应修改这里的源文件后重新构建，不直接修改生成目录。构建依赖 Python 标准库，不依赖被忽略的上游源码。

```powershell
python scripts/build_site.py
python -m http.server 8766 --bind 127.0.0.1 --directory site
```

访问 `http://127.0.0.1:8766/apps/004-ponytail/`。所有本地资源使用相对路径，页面内部使用锚点；兼容既有 GitHub Pages 子路径。当前只完成本地构建与浏览器验证，未发布，本项目 `demo` 保持空值。

## 场景定义

任务：为 6 条研究任务添加按截止日期筛选的功能。数据为教学示例，不代表真实研究排期或完成状态。

使用原生日期输入和已有静态列表，只比较 `YYYY-MM-DD` 日历日期字符串，不转换时区。9 月 17 日和 18 日分别显示 2 项；9 月 19 日显示 1 项；9 月 30 日显示空结果；清空恢复 6 项。

“已有 DateFilter”选项只改变教学前提、决策停留位置和解释，没有动态加载一个外部组件。lite/full/ultra 切换只展示基于原规则的中文解读，不激活真实插件。

## 验证边界

本地浏览器已验证日期输入、快捷日期、空结果、重置、复用前提切换、模式切换与规则展开；另检查手机布局和静态资源。详细记录见 [notes.md](../notes.md)。

这些验证证明本研究网页能运行，不证明 Ponytail 让某个模型生成了等价代码，也不构成节省代码行数、成本或时间的对照实验。

## 原理全景图

两页的 `#guide` 共用 `../assets/capability-summary.png` 和 SVG；文字版便于检索和辅助阅读。`render_summary.py` 同时绘制 PNG、SVG 并导出文字，含边界检查。修改图片时需安装 Pillow 并使用 Windows 微软雅黑字体；运行生成脚本后再构建站点。普通站点构建直接复制图片，不新增构建依赖。
