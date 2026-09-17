# 多 Web 演示部署规划

已添加展示导航页与 001-agency-agents 静态能力研究页，可本地预览；尚未公开发布或启用自动部署。

## 路径规划

一个 GitHub 仓库对应一个 Pages 站点，多个静态演示放在该站点的不同子路径中：

```text
site/
  index.html                  # 后续添加的演示导航页
  apps/
    001-example-repo/         # 第一个演示的静态产物
      index.html
    002-another-repo/         # 第二个演示的静态产物
      index.html
```

本仓库的默认 Pages 地址预计为 `https://yydshly.github.io/0917_codex_project/`，示例演示路径为 `/0917_codex_project/apps/001-example-repo/`。这些是路径约定，当前不是已上线链接。

## 源码与发布内容

- 每个项目的演示源码保存在 `projects/NNN-slug/web/`，依赖和构建方式由子项目独立决定。
- 后续构建流程将静态产物汇总到 `site/apps/NNN-slug/`，统一上传 Pages。
- `site/` 只用于公开静态文件；研究笔记和本地上游副本不需要加入发布包。
- 构建工具的资源前缀应匹配 `/0917_codex_project/apps/NNN-slug/`，也可按工具支持情况使用相对资源路径。
- 单页应用可使用 hash 路由；采用其他路由时需要另外验证深层链接和刷新行为。

## 首次上线时

1. 添加并验证第一个演示及 `site/index.html`。
2. 在仓库 Settings → Pages 中选择 GitHub Actions 作为发布来源。
3. 添加 Pages 工作流：构建各演示、汇总到 `site/`，再通过 `actions/upload-pages-artifact` 与 `actions/deploy-pages` 发布；上传前排除目录说明文件。
4. 验证首页、每个演示、静态资源和子路径刷新。
5. 将实际演示地址写入对应 `project.json` 的 `demo` 并同步索引。

Pages 仅托管静态 HTML、CSS 和 JavaScript。有服务端、数据库或私密 API 密钥的项目，需要另行选择后端运行环境，在子项目中记录访问方式。

参考：[GitHub Pages 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)、[自定义 Pages 工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
