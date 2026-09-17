# 静态展示维护

本项目采用原生 HTML / CSS / JavaScript，构建只需 Python 3.10+ 标准库。源码在本目录，静态产物在 `site/apps/007-neko-master/`，资源全部使用相对路径，页面导航使用 hash。

在仓库根目录运行 `python projects/007-neko-master/web/build.py`，再用 `python -m http.server 8765 --bind 127.0.0.1 --directory site` 访问 `/apps/007-neko-master/`。总构建入口 `python scripts/build_site.py` 已登记本项目。

上游截图是固定版本素材，页面提供原图、固定来源和许可证；单连接模型只模拟累计差分、重复快照、重置与落盘守恒，不调用网关、模型服务或在线 GeoIP。

`model.mjs` 是独立缩小模型，不是上游源码；`app.mjs` 控制截图和教学交互。模型测试 `node --test projects/007-neko-master/experiments/model.test.mjs`；静态与来源检查 `python projects/007-neko-master/experiments/verify.py`。

构建使用文件白名单：HTML、CSS、JS、原创 SVG、四张上游 PNG、指定研究正文 TXT、来源清单 JSON 和 MIT 许可。不会复制 upstream、任何凭据、未选中的实验文件。站点已部署，正式地址已登记到 `demo`。

另包含原创 `clash-network-flow.svg`、其高清 PNG 导出及文字说明，展示系统代理、TUN 与 Trojan 的交互。`draw-network-flow.py` 用 Python 标准库生成 SVG；PNG 为已检查的导出素材，日常站点构建无需图像库。页面 `#network-flow` 可直达该图。

已部署：[在线研究页](https://yydshly.github.io/0917_codex_project/apps/007-neko-master/) · [两张引导图](https://yydshly.github.io/0917_codex_project/apps/007-neko-master/#guide)。首轮发布 [工作流](https://github.com/yydshly/0917_codex_project/actions/runs/35230427660) 成功；21 个公开文件与构建产物一致，线上摘要、图片和跳转已验证。见 `experiments/deployment.json`。
