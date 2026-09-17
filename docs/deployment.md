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

009 Subtrace 的源码位于 `projects/009-subtrace/web/`，静态产物为 `site/apps/009-subtrace/`。页面说明 seccomp 连接接管、透明 TCP 代理、临时 CA 与 HAR 记录，包含五种逐步连接场景和固定样例请求查看器。Windows 仅阅读静态网页，不安装或运行上游，不捕获实际流量。已通过本地交互、链接、320–1440 像素响应式、file:// 和无 JavaScript 阅读检查；已部署：[在线研究页](https://yydshly.github.io/0917_codex_project/apps/009-subtrace/) · [完整交互图](https://yydshly.github.io/0917_codex_project/apps/009-subtrace/#guide)。[首次发布工作流](https://github.com/yydshly/0917_codex_project/actions/runs/35232736513) 成功，10 个公开文件与发布提交一致，线上摘要、图像与教学交互验证通过，`demo` 已登记。见 [009 维护说明](../projects/009-subtrace/web/README.md)。

```powershell
python scripts/projects.py sync
python scripts/projects.py check
python scripts/build_site.py
python -m http.server 8765 --bind 127.0.0.1 --directory site
```

说明页构建使用 Python 3.10+ 标准库；010、012 的独立三维应用另需 Node.js 22 与 npm，首次构建按锁文件安装依赖。所有公开资源随静态产物发布，运行时无需访问上游源码。各子项目独立选用技术栈；目前总构建入口已登记 001–006 的构建方式，后续按项目需要添加。

006 Narrator AI CLI Skill 的源码位于 `projects/006-narrator-ai-cli-skill/web/`，发布目录为 `site/apps/006-narrator-ai-cli-skill/`。用单张总览图引导理解 Skill、Codex 等宿主助手、CLI 与云端服务的分工；详细展示素材上传、异步任务、制作流程与约束边界。页面为纯静态说明，不调用模型、不接收上传、不创建生成任务。公开产物包含研究正文、PNG / SVG 总览图、引导图文字版及明确选入的源码研究与来源记录；未发布凭据或上游检出。维护方式见[网页说明](../projects/006-narrator-ai-cli-skill/web/README.md)。

已部署：[006 在线研究页](https://yydshly.github.io/0917_codex_project/apps/006-narrator-ai-cli-skill/) · [引导图](https://yydshly.github.io/0917_codex_project/apps/006-narrator-ai-cli-skill/#guide)。首次发布 [工作流 35213733990](https://github.com/yydshly/0917_codex_project/actions/runs/35213733990) 成功。线上 320、390、768、1280 像素宽度、锚点、键盘展开收起、图像加载和 8 个公开文件一致性检查通过，正式地址已登记；检查记录见子项目 `experiments/deployment.json`。

005 Impeccable 的静态产物位于 `site/apps/005-impeccable/`，源码位于 `projects/005-impeccable/web/`。以单张引导图说明前端优化能力、Skill 通用约束、用户与模型的定制分工及个人使用价值，另有教学看板、四种交互场景和实测记录。已部署：[在线研究页](https://yydshly.github.io/0917_codex_project/apps/005-impeccable/) · [单张引导图](https://yydshly.github.io/0917_codex_project/apps/005-impeccable/#guide)；首次发布 [工作流 35209570002](https://github.com/yydshly/0917_codex_project/actions/runs/35209570002)。已核对 38 个线上文件、桌面/手机布局、图像加载、空结果恢复和中文文本编码，`demo` 已登记。具体能力与实际收益仍需后续逐项研究；网页不执行 AI、检测器或 Live，原始规则输出附上游许可与 NOTICE。复现见[维护说明](../projects/005-impeccable/web/README.md)。

004 Ponytail 的静态产物位于 `site/apps/004-ponytail/`，源码位于 `projects/004-ponytail/web/`。页面说明库的能力、复用优先决策、Skill 与插件 / Hooks / 规则文件 / MCP 的关系，并以同一张原理全景图作为摘要和封面。已部署：[在线研究页](https://yydshly.github.io/0917_codex_project/apps/004-ponytail/) · [全景图与机制详解](https://yydshly.github.io/0917_codex_project/apps/004-ponytail/architecture.html#guide) · [高清图](https://yydshly.github.io/0917_codex_project/apps/004-ponytail/capability-summary.png)。首次发布：[工作流 35199129801](https://github.com/yydshly/0917_codex_project/actions/runs/35199129801)。页面、PNG / SVG、文字版、Hook 摘要和必要资源均已核对，正式地址已登记到 `demo`；日期筛选为教学案例，实际模型收益仍待对照验证。

002 中文版研究已公开部署：[在线研究页](https://yydshly.github.io/0917_codex_project/apps/002-agency-agents-zh/) · [高清引导图](https://yydshly.github.io/0917_codex_project/apps/002-agency-agents-zh/capability-summary.png)。发布路径为 `apps/002-agency-agents-zh/`，正式地址已写入项目 `demo`。首次发布记录：[工作流 35183980271](https://github.com/yydshly/0917_codex_project/actions/runs/35183980271)；线上页面、引导图与搜索交互验证通过。

003 角色编排研究的发布路径为 `apps/003-agency-orchestrator/`。以完整信息图作为引导和封面，说明能力、场景、研究价值、质量与重复边界及后续真实产品试验计划；另有 `case-content.html` 保存两轮真实模型调用的静态产物。官方素材与许可随站点发布。已部署：[在线研究页](https://yydshly.github.io/0917_codex_project/apps/003-agency-orchestrator/) · [完整引导图](https://yydshly.github.io/0917_codex_project/apps/003-agency-orchestrator/capability-summary.png) · [真实案例](https://yydshly.github.io/0917_codex_project/apps/003-agency-orchestrator/case-content.html)，正式地址已登记到 `demo`。首次发布：[工作流 35190150874](https://github.com/yydshly/0917_codex_project/actions/runs/35190150874)。线上 HTML、PNG / SVG、文字版、两轮运行记录及必要资源已核对一致；后续产品效果对照试验仍待开展。

## 007 Neko Master

发布目录 `site/apps/007-neko-master/`，源码 `projects/007-neko-master/web/`。以修订对照图和底层交互图引导理解：Clash 在转发时本地计数，Neko Master 从管理 API 采集、保存并展示。页面包含理解整理、上游截图、增量教学实验和源码证据；静态发布不连接用户网关。

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

007 Neko Master 已部署：[在线研究页](https://yydshly.github.io/0917_codex_project/apps/007-neko-master/) · [两张引导图](https://yydshly.github.io/0917_codex_project/apps/007-neko-master/#guide)。[首次发布工作流](https://github.com/yydshly/0917_codex_project/actions/runs/35230427660) 成功，21 个公开文件、线上摘要与图片验证通过。

008 Humanizer 已部署：[在线研究页](https://yydshly.github.io/0917_codex_project/apps/008-humanizer/) · [单张总览图](https://yydshly.github.io/0917_codex_project/apps/008-humanizer/#guide)。页面完整展示 Skill 能力、模型执行方式、25 类规则与对我们的意义；提供 PNG、SVG 和文字版。首次发布 [工作流 35231331072](https://github.com/yydshly/0917_codex_project/actions/runs/35231331072) 成功，10 个线上文件与发布提交一致，线上 1440、390、320 像素布局、图像与搜索检查通过。静态示例不调用模型，实际收益仍待验证。维护见 [008 网页说明](../projects/008-humanizer/web/README.md)。

## 010 / 012：可交互 3D 实现参考

这两个项目以实际产品效果截图作为引导图；首页新增两张入口卡，分别通往实现说明与交互演示。

- [010 自行车实现说明](https://yydshly.github.io/0917_codex_project/apps/010-veloce-bike-studio/guide.html)：机械结构、材质配置、传动制动和配件联动。
- [012 升降椅实现说明](https://yydshly.github.io/0917_codex_project/apps/012-lift-chair-studio/guide.html)：产品配置、织物与装配、调节锁定、人物乘坐滑行。

两者均为 React + Three.js + 自定义运动代码，页面说明可复用方式、提示词和质量边界。原始截图在子项目 assets/product-guide.png；构建复制为 product-preview.png。guide.html 由 reference.json 和共享构建脚本生成。正式地址与工作流记录在各项目 experiments/deployment.json 中登记，运行验证不代表真实物理精度。

2026-09-18 首次发布完成：[工作流 35287605549](https://github.com/yydshly/0917_codex_project/actions/runs/35287605549) 成功。两项目与首页共 60 个公开文件与本地产物一致；线上验证自行车换色与暂停、升降椅乘坐滑行与暂停，未记录控制台错误。`demo` 已登记正式地址。
