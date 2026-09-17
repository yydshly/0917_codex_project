# Clash 系统代理、TUN 与远端代理交互：一图文字版

本图为原创教学示意，具体采用“访问 HTTPS 网站，出口选择普通 Trojan 节点”的例子。目标是区分入口接管、代理转发、协议加密、IP 出口与统计。不是用户实际网络抓包或故障诊断。

## 按图阅读

1. 左路系统代理：浏览器读取代理设置，建立到本机 `127.0.0.1:7890` 的 TCP 连接；这仍经过操作系统 TCP/IP，只是走本机回环。浏览器通过 HTTP CONNECT 告知网站域名和端口，本机 Clash 建立转发通道。通道就绪后浏览器才传输网站 TLS 握手和加密数据。7890 为示例，不是对本机设置的检测。
2. 右路 TUN：应用照常对网站目标地址建立连接。系统按路由把选中的 IP 包送入 TUN 虚拟接口，Clash 结合协议栈处理 TCP 状态和重组，形成可转发的流；UDP 以数据报方式适配。具体 stack 和平台实现不同，不能理解为所有 TCP 功能一律由纯用户态完成。无需本机和远端使用相同 IP。
3. 两路进入同一套核心：恢复目标信息，查规则或 GLOBAL 选择出口，建立出站连接，包装计数器后双向转发。图中为职责列表，不代表每个操作只执行一次或严格按并排位置先后执行。
4. 选择 Trojan 节点：本机新建到节点的 TCP/TLS 连接，发送代理认证、网站目标与待转发字节。节点解除外层 TLS、解析代理请求，再新建到网站的 TCP 连接。原始入站 IP/TCP 包不是一般性地原封不动送到网站。
5. 浏览器与网站之间的内层 HTTPS TLS 保持端到端。代理服务器可读取代理目标地址和转发量，但解除外层 Trojan TLS 并不自动解开内层网站 TLS。网站实际完成内层握手和内容处理。
6. 响应沿相应链路反向返回：网站 → 远端节点 → 本机核心 → HTTP 通道或 TUN 栈 → 应用。图的实线以请求方向为阅读顺序，并不表示只能单向传输。
7. 若核心选择 DIRECT，则本机出站连接目标网站；如果流量根本没进入核心，那是另一种“绕过”，图中没有将其画成核心 DIRECT 分支。

## 图中 IP 的含义

连接①的 IP 目的地址是节点；连接②的目的地址是网站。两段连接各有自己的 TCP 状态、源 / 目的地址和端口。节点连接网站时，网站通常看到节点的公网出口 IP；DIRECT 则通常看到本地网络的公网出口 IP。地址可能被路由器 NAT 转换，图中使用“公网出口”而非假设电脑直接拥有公网 IP。

同一出口 IP 可以同时服务系统代理和 TUN 两种入口。“全局代理”控制进入核心后的出口，不能强迫所有应用使用系统代理；TUN 控制接入范围，也受排除路由影响。客户端自己的出站需通过绑定接口、路由或平台相关机制避免再次被自身 TUN 接管。TUN 本身没有远端认证或加密协议。

## 统计与定位边界

Mihomo 的 TCP / UDP Tracker 在连接读写路径累加上传和下载字节。Neko Master 从管理 API 获取连接累计值，计算差分，做历史与维度聚合。计数口径不等于物理网卡：外层代理封装、网络头、重传和绕过核心的其他流量可能不同。

HTTP CONNECT 提供目标域名；TUN 的 IP 包本身不保证包含域名，Mihomo 可通过 DNS/Fake-IP 映射或可见握手信息嗅探补充。嗅探不等于解密 HTTPS 正文。图为架构说明，不据此断言用户遇到的 Google 地区差异原因。

## 来源

研究日期：2026-09-17。以下为官方协议或源码资料；Mihomo 的 Meta 分支链接是阅读时的实现参考，不冒充 Neko Master 固定提交的一部分。

- [Chromium 代理行为：HTTP CONNECT、SOCKS 和 DNS](https://chromium.googlesource.com/chromium/src/+/HEAD/net/docs/proxy.md)
- [Linux TUN/TAP 驱动说明](https://docs.kernel.org/networking/tuntap.html)
- [Mihomo TUN 配置与 stack](https://wiki.metacubex.one/config/inbound/tun/)
- [Mihomo TUN 入口实现](https://github.com/MetaCubeX/mihomo/blob/Meta/listener/sing_tun/server.go)
- [Mihomo 统一 TCP / UDP 转发](https://github.com/MetaCubeX/mihomo/blob/Meta/tunnel/tunnel.go)
- [Mihomo 连接统计](https://github.com/MetaCubeX/mihomo/blob/Meta/tunnel/statistic/tracker.go)
- [Trojan 协议规范](https://trojan-gfw.github.io/trojan/protocol)
- [Neko Master 固定版本采集器](https://github.com/foru17/neko-master/blob/6f72cfd0db69e2952713f24a648812407fef1e78/apps/collector/src/modules/collector/gateway.collector.ts)

源图生成：`python projects/007-neko-master/web/draw-network-flow.py`。PNG 为同一 SVG 的高清栅格版本，未增加额外内容；不属于上游截图。
