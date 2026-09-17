# 网页维护

- 模板：index.template.html；样式：styles.css；交互：app.js。
- 版本快照：catalog.json；上游许可：UPSTREAM-LICENSE.txt。
- 普通构建：`python projects/002-agency-agents-zh/web/build.py`。
- 整站构建：`python scripts/build_site.py`，产物位于 `site/apps/002-agency-agents-zh/`。
- 浏览器无需第三方依赖；关闭 JavaScript 仍可阅读正文和展开清单，仅搜索筛选不可用。
- 总览图正文源：capability-summary.template.html；构建自动填充清单统计，生成 capability-summary.html。PNG 导出运行 render_summary.py（需要 Pillow 与 Windows 微软雅黑字体），再构建同步到站点。常规构建不需要图片导出依赖。

## 主动更新研究版本

1. 更新被忽略的 `upstream/agency-agents-zh/` 副本，记录新 commit。
2. 更新 collect_catalog.py 中的 reviewed_on 日期，再显式运行该脚本。
3. 审阅角色、部门、统计和同步文档差异；新增部门时补充 build.py 的中文说明。
4. 修改研究正文和版本说明，重新构建并验证。原版比较基准也变动时，同步更新两端论据，避免混用统计。

对独立 agency-orchestrator 项目仅提供来源链接，未在本页嵌入或运行它。页面收集角色名称与路径，不执行上游角色指令。
