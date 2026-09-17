# 网页维护与预览

在仓库根目录运行 `python scripts/build_site.py`，然后运行 `python -m http.server 8766 --bind 127.0.0.1 --directory site`，访问 [本地演示](http://127.0.0.1:8766/apps/005-impeccable/)。

入口 index.template.html；实验页面共用 board.template.html、data.json 与 board.js，差别由 before.css / after.css 及少量可访问性文案控制。build.py 读取保存的实验结果生成表格，再复制资源到 site/apps/005-impeccable/。资源使用相对路径，适配 Pages 仓库前缀，不使用服务端路由。

网页不运行 AI、检测器或 Live。版本切换是静态案例展示，不是官方 Live。已验证并登记 [在线研究页](https://yydshly.github.io/0917_codex_project/apps/005-impeccable/)；发布检查脚本为 ../experiments/check_deployment.cjs。

中文 `.txt` 文档使用带 BOM 的 UTF-8 导出，避免静态服务器未声明 HTTP charset 时浏览器按其他编码打开。Markdown 源文件仍保持 UTF-8，正文不变。

优秀标准与技术原理图的源文件为 render_principles.py。修改后运行 `python projects/005-impeccable/web/render_principles.py`；在已配置 Playwright 的环境运行 `node projects/005-impeccable/web/render_principles.cjs` 生成高清 PNG，再重新构建。图中文字同步导出为带 UTF-8 BOM 的文本，SVG 保留可点击的固定 commit 来源。

修改看板后重跑 experiments/run_detector.py 和 check_browser.cjs，再构建网页；不要手工修改生成页面或检测数字。完整复现命令见 [研究笔记](../notes.md)。
