# 中文能力研究网页

这是 Agency Agents 研究展示页，不是上游角色执行界面。

- `catalog.json`：固定版本的 279 个角色名称、路径及 18 个分类。
- `collect_catalog.py`：显式从 `upstream/agency-agents/` 刷新角色清单与许可。
- `index.template.html` / `styles.css` / `app.js`：中文内容、响应式样式与章节导航。
- `build.py`：生成 `site/apps/001-agency-agents/`，无第三方依赖。
- `UPSTREAM-LICENSE.txt`：角色元数据的上游版权与 MIT 许可。

从仓库根目录执行 `python projects/001-agency-agents/web/build.py` 后预览 `site/`。网页支持离线阅读、原生可展开角色清单、键盘导航和小屏布局；外部来源链接需要网络。无 JavaScript 时正文与清单仍可阅读。

更新上游版本后须同步核查中文结论、日期、研究文档和截图。发布遵循根目录的 GitHub Pages 规划，尚未公开部署。
