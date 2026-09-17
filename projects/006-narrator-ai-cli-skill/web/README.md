# 006 网页维护

本页面是静态研究说明，不接收文件、不调用模型、不创建云端任务。主线为：Skill 由 Codex 等助手驱动，CLI 传递指令和结果，服务端执行素材处理。引导图来自子项目 assets，页面区分事实、文档声明和未验证的后端细节。

源码为 `index.template.html`、`styles.css`、`favicon.svg`。`build.py` 读取项目摘要与上游地址，生成 `site/apps/006-narrator-ai-cli-skill/`；图片直接复制，文字材料用带 BOM 的 UTF-8 输出，避免浏览器中文编码误判。构建只用 Python 标准库，不依赖上游检出或图片绘制环境。

在仓库根目录运行：

```powershell
python scripts/projects.py sync
python scripts/projects.py check
python scripts/build_site.py
python -m http.server 8766 --bind 127.0.0.1 --directory site
```

预览入口：`http://127.0.0.1:8766/apps/006-narrator-ai-cli-skill/`。所有资源与研究索引链接均使用相对路径，兼容 GitHub Pages 的仓库前缀。交互使用原生锚点与 details，关闭 JavaScript 也能完整阅读。

部署沿用仓库 `.github/workflows/pages.yml`，不是部署上游视频服务。发布后核对页面、图片与文字材料，确认可访问后再登记 project.json 的 demo。

验证脚本为 `check_browser.cjs`，需要在 Node 环境中提供 Playwright。默认检查本地预览；通过 `RESEARCH_BASE` 可指定线上完整目录 URL。检查 320、390、768、1280 像素宽度、图片加载、锚点、键盘展开收起和全部公开文件内容一致性，并把结果保存到 `../experiments/`。本地模式额外生成桌面与手机完整截图。
