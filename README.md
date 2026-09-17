# GitHub 项目研究集

记录值得深入研究的 GitHub 项目：理解设计、运行验证、整理实践，并逐步积累可体验的 Web 演示。

这里是摘要与导航入口。源码分析、运行步骤、截图和实验结论保存在各子项目中。

## 项目索引

项目按固定编号升序排列；编号分配后不随研究状态变化，也不重复使用。

<!-- PROJECT_INDEX:START -->
| 编号 | 项目 | 研究摘要 | 状态 | 上游 | Web 演示 |
| --- | --- | --- | --- | --- | --- |
| 001 | [Agency Agents](projects/001-agency-agents/README.md) | 按领域、按身份定制的 skill 提示词库；效果受模型能力及其提升影响，后续按实际需要验证角色与能力的价值。 | 研究中 | <a href="https://github.com/msitarzewski/agency-agents">GitHub</a> | <a href="https://yydshly.github.io/0917_codex_project/apps/001-agency-agents/">访问演示</a> |
<!-- PROJECT_INDEX:END -->

## 项目预览

<!-- PROJECT_GALLERY:START -->
### 001 · Agency Agents

<a href="projects/001-agency-agents/README.md"><img src="projects/001-agency-agents/assets/overview-desktop.png" alt="Agency Agents 中文能力研究页面桌面预览，展示概览、角色统计和能力地图" width="640"></a>

按领域、按身份定制的 skill 提示词库；效果受模型能力及其提升影响，后续按实际需要验证角色与能力的价值。
<!-- PROJECT_GALLERY:END -->

## 新增研究项目

需要 Python 3.10 或更新版本，无第三方依赖。在仓库根目录运行：

```sh
python scripts/projects.py new example-repo --name "项目名称" --repo https://github.com/owner/example-repo --summary "一句话介绍研究重点"
```

命令自动分配编号、创建研究文档，并更新首页索引。修改子项目的 `project.json` 后运行：

```sh
python scripts/projects.py sync
```

## 仓库导航

| 目录 / 文档 | 用途 |
| --- | --- |
| [projects/](projects/) | 按编号组织的研究项目、笔记与图片 |
| [templates/project/](templates/project/) | 统一的子项目文档模板 |
| [研究约定](docs/research-guide.md) | 编号规则、研究流程、图片与源码管理 |
| [Web 部署说明](docs/deployment.md) | 多个演示的路径规划与 GitHub Pages 部署方式 |
| [site/](site/) | 已部署的静态研究展示与导航 |

上游项目的源码、图片与其他素材遵循各自许可证；引用和修改时在子项目中记录来源。
