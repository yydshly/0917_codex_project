# Web 展示与部署

本仓库使用 GitHub Pages 承载静态研究页面。已启用 GitHub Actions 自动构建与发布。

- [在线项目索引](https://yydshly.github.io/0917_codex_project/)
- [001 · Agency Agents](https://yydshly.github.io/0917_codex_project/apps/001-agency-agents/)
- [Agency Agents 高清引导图](https://yydshly.github.io/0917_codex_project/apps/001-agency-agents/capability-summary.png)

## 目录与数据来源

- 子项目源码：`projects/NNN-slug/web/`。
- 静态产物：`site/apps/NNN-slug/`。
- 网站首页模板：`site/index.template.html`；`scripts/build_site.py` 从各子项目 `project.json` 生成 `site/index.html`。
- 根 README 索引：仍由 `python scripts/projects.py sync` 生成。
- 上游地址来自 `repo` 字段；公开演示地址来自已验证后的 `demo` 字段。根 README 与网页索引均关联原始仓库。

## 本地构建

```powershell
python scripts/projects.py sync
python scripts/projects.py check
python scripts/build_site.py
python -m http.server 8765 --bind 127.0.0.1 --directory site
```

构建只需 Python 3.10+ 标准库，使用保存的版本清单，不依赖网络或上游源码副本。各子项目独立选用技术栈；目前总构建入口已登记 001、002 与 003 的构建方式，后续按项目需要添加。

002 中文版研究已公开部署：[在线研究页](https://yydshly.github.io/0917_codex_project/apps/002-agency-agents-zh/) · [高清引导图](https://yydshly.github.io/0917_codex_project/apps/002-agency-agents-zh/capability-summary.png)。发布路径为 `apps/002-agency-agents-zh/`，正式地址已写入项目 `demo`。首次发布记录：[工作流 35183980271](https://github.com/yydshly/0917_codex_project/actions/runs/35183980271)；线上页面、引导图与搜索交互验证通过。

003 角色编排研究的发布路径为 `apps/003-agency-orchestrator/`。以完整信息图作为引导和封面，说明能力、场景、研究价值、质量与重复边界及后续真实产品试验计划；另有 `case-content.html` 保存两轮真实模型调用的静态产物。官方素材与许可随站点发布；公开地址验证后登记到 `demo`。

## 自动发布

工作流：`.github/workflows/pages.yml`。

1. main 分支的项目、展示、构建脚本或发布工作流变更触发部署，也可手动触发。
2. 检查元数据和 README 索引，再构建网页。
3. 将 `site/` 复制为发布包，排除 Markdown 说明和 HTML 模板。
4. 上传 Pages 静态产物并通过 github-pages 环境发布。

只发布 `site/` 静态文件；本地上游源码副本、研究笔记、运行环境和凭据不会进入网站发布包。003 明确选入的官方展示素材、许可、模型案例文本与脱去本地路径的两轮记录属于公开展示内容；页面不会调用模型。

## 子路径与验证

资源使用相对路径，兼容 `/0917_codex_project/apps/001-agency-agents/`。页面章节用 hash 锚点，无需服务端路由。

2026-09-17 已完成线上验证：网站索引、上游链接、子项目页面、高清引导图、角色清单展开与移动布局。首次发布记录：[工作流 35180823638](https://github.com/yydshly/0917_codex_project/actions/runs/35180823638)。后续部署以最新工作流结果为准。

网页可访问不代表上游角色能力已验证。Agency Agents 当前完成分类整理、候选筛选与展示；后续按任务需求评估实际效果与模型升级的影响。

参考：[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
