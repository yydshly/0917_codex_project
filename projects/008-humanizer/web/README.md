# Humanizer 网页维护

页面使用原生 HTML、CSS 与 JavaScript；构建只需 Python 3.10+ 标准库，无在线字体或外部运行依赖。规则列表在构建时从 `../patterns.md` 提取，保证编号和研究文档一致。

在仓库根目录执行：

```powershell
python projects/008-humanizer/web/build.py
python scripts/build_site.py
python -m http.server 8765 --bind 127.0.0.1 --directory site
```

访问 `/apps/008-humanizer/`。公开部署路径为 `/0917_codex_project/apps/008-humanizer/`，使用相对资源路径和 hash 导航。已发布：[在线研究页](https://yydshly.github.io/0917_codex_project/apps/008-humanizer/)。首次发布工作流 `35231331072` 成功，10 个公开文件与发布提交一致；线上 1440、390、320 像素布局、总览图加载及规则搜索通过，项目 `demo` 已登记。

## 内容和交互

- 能力、语气匹配、Skill / 用户 / 模型分工、编辑流程、三种输出模式、场景与边界。
- 三组固定中文改写教学示例，不调用模型，不接收用户文章。
- 25 类规则可按类别、标题和说明筛选；支持空结果清除和原生键盘展开。
- 禁用 JavaScript 时仍显示全部规则并支持展开，保留默认产品示例。
- 来源固定到 commit `9862685f575c65a8247f90369951df1b3416e3d6`。
- `#guide` 展示一张完整能力与实现总览图，含全部 25 类规则、对我们的意义和验收边界；提供 PNG、SVG 与文字版。

构建仅发布 HTML、CSS、JS、favicon、总览图 PNG / SVG / 文字版和明确选入的三份研究文本；不复制上游克隆或本地运行环境。

## 总览图维护

`python projects/008-humanizer/web/draw-summary.py` 生成 SVG 和完整文字版。设置 `PLAYWRIGHT_MODULE` 后执行 `node projects/008-humanizer/web/render-summary.cjs`，可导出 2700 × 3900 PNG；导出时检查文字是否越过画布或面板边界。日常站点构建直接复制已检查的版本化图片，不需要 Playwright。

## 浏览器验证

检查脚本为 `../experiments/verify-web.cjs`，在仓库根目录执行。需要外部安装 Playwright 和 Chromium；可用 `PLAYWRIGHT_MODULE` 指定 Playwright 模块路径。用 `HUMANIZER_URL` 指定页面地址，默认是 `http://127.0.0.1:8878/apps/008-humanizer/`。运行 `node projects/008-humanizer/experiments/verify-web.cjs` 会更新检查记录和本地截图。

已通过 320—1440 像素的五档宽度检查、搜索与分类、空结果恢复、键盘展开与示例切换、内部链接与锚点检查，以及禁用 JavaScript 后的基本阅读检查。截图及来源见 `../assets/README.md`；这不代表上游模型效果已验证。
