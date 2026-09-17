# 图片来源

四张 PNG 原样取自 `foru17/neko-master` 的固定 commit `6f72cfd0db69e2952713f24a648812407fef1e78`，上游路径均为 `assets/同名文件`。MIT，Copyright (c) 2025 foru17；[许可证](../third-party/LICENSE.neko-master)。URL、字节数和 SHA-256 见 [来源清单](../source-manifest.json)。

| 文件 | 替代文本 / 展示内容 |
| --- | --- |
| `neko-master-overview-light.png` | 浅色总览：总流量、连接数、时间趋势与排名 |
| `neko-master-domains-dark.png` | 深色域名分析：域名流量、连接数和关联信息 |
| `neko-master-rules-dark.png` | 深色规则分析：规则统计与策略路径 |
| `neko-master-regions-light.png` | 浅色地区分析：地图和目的地址的地理分布 |

原图未改写。数字来自上游示例，不是本研究测量；图片所在提交不证明截取时运行的也是同一提交。

`capability-summary.svg` 为本研究原创能力与原理图，不是产品截图。[文字版](capability-summary-text.md)

`clash-network-flow.svg` 与高清导出 `clash-network-flow.png` 为本研究原创协议交互图，展示系统代理 / TUN 入口、Clash 核心、Trojan 转发、嵌套 TLS 和统计位置。不是实际抓包，采用 HTTPS + 普通 Trojan 场景；[文字版与官方来源](clash-network-flow-text.md)。可通过 `web/draw-network-flow.py` 重新生成 SVG。

`system-proxy-tun-revised.png` 是用户提供图稿经内置图像工具修订的教学图。2026-09-17 用户指定用于研究页部署；不属于上游截图或实际抓包。修订内容及官方参考见 [理解整理](../understanding.md)。
