# Subtrace 静态研究网页

源码为原生 HTML / CSS / JavaScript，Python 标准库负责复制和替换固定源码链接。不安装 Subtrace、不调用 API、不请求远程字体、不依赖上游副本。

## 构建与阅读

在仓库根目录运行：

```powershell
python projects/009-subtrace/web/build.py
python scripts/projects.py sync
python scripts/projects.py check
python scripts/build_site.py
python -m http.server 8899 --bind 127.0.0.1 --directory site
```

浏览器访问 `http://127.0.0.1:8899/apps/009-subtrace/`。也可直接打开 `site/apps/009-subtrace/index.html`，交互不使用 fetch，支持 file://。

## 内容与维护

- `index.template.html`：能力、原理、边界、证据与无 JavaScript 静态内容。
- `app.js`：五场景逐步流程；固定样例请求搜索、状态筛选、详情与正文截断。
- `styles.css`：响应式样式；支持键盘焦点与减少动态效果偏好。
- `build.py`：只复制明确选入的资源，文档以 UTF-8 文本供网页下载。
- `../assets/capability-summary.svg` 与 `capability-summary.png`：原创能力与交互全景图，分开说明系统调用控制、实际字节流和记录发布；不是实机截图。网页默认展开，提供 PNG、SVG 与文字版。

正文上限以 UTF-8 字节计算，截断仅影响显示副本；32 字节是为了教学可见性设置的选项，4096 字节对应研究版本默认值。流程没有自动计时，以用户点击推进，不表示真实耗时。

`site/apps/009-subtrace/` 为静态产物，资源均使用相对路径，支持 GitHub Pages 子路径。已核对首次发布工作流和公开资源，`demo` 已登记为 https://yydshly.github.io/0917_codex_project/apps/009-subtrace/ 。发布验证见 `../experiments/deployment.json`。

验收记录位于 `../experiments/web-validation.json`，截图若保存须说明是本研究页。本项目仅验证静态教学交互，不验证 Subtrace 本体。
