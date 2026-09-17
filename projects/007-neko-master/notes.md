# 研究记录

## 2026-09-17

- 通过项目脚本创建 007，保留既有编号。
- 固定 commit `6f72cfd0db69e2952713f24a648812407fef1e78`，MIT，Copyright (c) 2025 foru17。
- git clone 传输停滞后停止，改用固定提交 raw URL 获取 26 个选定源码 / 素材文件到忽略的 `upstream/neko-master/`。这是部分源码快照，不是完整、可运行检出。
- `source-manifest.json` 保存原始 URL、字节数与 SHA-256；四张 PNG 原样复制并保留许可证。
- 阅读直连适配器、缓冲、实时合并、schema、写入模式、GeoIP、Go Agent 与接收端。
- 记录四处细节：Agent Clash 实际 HTTP 轮询、Local GeoIP 在线回退、Agent 超时重绑定、ClickHouse 多种写入模式。
- 制作静态研究页、原创原理 SVG、单连接教学实验。所有教学 MB 数值为人工构造。

## 证据范围

源码核对证明固定版本存在相应分支和字段；上游图片只展示产品界面；本地验证只覆盖教学模型和静态页面。真实网关、性能、精确计量、故障恢复尚未测试。

后续应使用可控流量对照网关累计值与库中统计，覆盖短连接、长连接、空闲、计数重置、ID 重用、进程重启、队列溢出和延迟重试，再对 SQLite / ClickHouse 不同模式做故障注入。完成前保持“研究中”。

复现命令与记录见 [experiments/README.md](experiments/README.md)。
