# 静态展示维护

使用原生 HTML / CSS / JavaScript 与 Python 标准库构建，不需要前端依赖，不请求外部模型或真实审计服务。

本轮讨论整理在 `../understanding.md`；网页对应正文为 `understanding.html`，由构建脚本嵌入。完整总览图由 `python projects/011-security-audit-skill/web/build_guide.py` 生成，修改排版源后再构建网页。图中涵盖安全检查角度、约束机制、产出和 Defending Code 对比，预期效果与未实测事实分开说明。

```sh
python projects/011-security-audit-skill/web/build.py
python scripts/build_site.py
python scripts/projects.py sync
python scripts/projects.py check
python -m http.server 8011 --bind 127.0.0.1 --directory site
```

浏览器访问 `http://127.0.0.1:8011/apps/011-security-audit-skill/`。产物在 `site/apps/011-security-audit-skill/`；相对资源适配 GitHub Pages 子路径，也可直接打开 index.html。

交互：六阶段选择、审计模式说明、领域搜索与筛选、假设证据条件切换。案例数据写在 app.js 中，不执行审计。固定源码链接由 build.py 替换生成。

修改后重新构建并核对导航、键盘操作、窄屏布局与相对链接。`validation.json` 记录本次实际完成的检查；部署后才可填写 project.json 的 demo 地址。
