# 仓库协作约定

- 本仓库用于研究多个 GitHub 项目，默认使用中文文档。
- 根 README 保持摘要与导航用途；详细分析放到对应 `projects/NNN-slug/` 中。
- 新项目通过 `python scripts/projects.py new` 创建。编号固定、按数字升序展示、不重排、不复用；归档时保留项目目录。
- 子项目 `project.json` 是索引数据来源；不要手工修改 README 中自动生成的索引和预览区域。
- 更新项目元数据后执行 `python scripts/projects.py sync`，提交前执行 `python scripts/projects.py check`。
- 截图放在对应子项目的 `assets/` 中，提供有意义的替代文本和来源说明，不伪造运行结果。
- 上游源码默认克隆到被忽略的 `upstream/`，记录具体 commit 和许可证。需要引入源码时保留原有版权与许可证。
- 各子项目独立选择技术栈；不要给整个研究仓库强加单一应用框架。
- GitHub Pages 只承载静态内容。演示统一规划在 `site/apps/NNN-slug/`，部署前核对资源前缀和子路径路由。
