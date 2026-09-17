# Subtrace 技术原理与源码导览

基准：`e3e3546b367ecc23d5fe5642491526ee969a6ff2`。本文是静态源码分析；流程做了教学简化，省略并发、恢复和全部 socket 状态迁移。

## 1. 如何进入观察范围

`cmd/run/run.go` 检查环境、创建父子进程、初始化 CA 与发布通道。子进程安装 seccomp 过滤器并执行用户命令。过滤器用 `SECCOMP_RET_USER_NOTIF` 将选定调用交给父进程，其余返回 `SECCOMP_RET_ALLOW`。

`process/handle.go` 注册 socket、connect、bind、listen、accept、地址查询、文件打开、进程退出等处理器。`process_vm_readv/writev` 读取参数或写回结果，受限时有 `/proc/pid/mem` 回退。`pidfd_getfd` 获取目标描述符，`SECCOMP_IOCTL_NOTIF_ADDFD` 向目标注入描述符。

正常读写流量可以通过代理 socket，无需传统 ptrace 对每次 read/write 单步跟踪。依赖 gVisor 的 ABI / BPF 包，不等于把目标程序放进完整 gVisor 沙箱。

源码：[入口](https://github.com/subtrace/subtrace/blob/e3e3546b367ecc23d5fe5642491526ee969a6ff2/cmd/run/run.go)、[过滤器](https://github.com/subtrace/subtrace/blob/e3e3546b367ecc23d5fe5642491526ee969a6ff2/cmd/run/engine/seccomp/seccomp.go)、[内存参数读写](https://github.com/subtrace/subtrace/blob/e3e3546b367ecc23d5fe5642491526ee969a6ff2/cmd/run/engine/process/vm.go)。

## 2. TCP 如何接管

网络处理器筛选 IPv4 / IPv6 的 TCP 流式 socket，并维护连接状态。出站 Connect 路径建立本地连接和真正的外部连接；入站 Listen / Accept 路径将请求接入代理。通过地址查询处理，尽量提供程序预期的 socket 信息。

```text
应用 connect(目标地址)
  → seccomp 通知 Subtrace
  → 本地代理接入应用连接，并连接真正目标
  → 应用 ⇄ 本地代理 ⇄ 外部服务
  → 代理识别协议并整理观察记录
```

代理检查首批字节识别 HTTP/1、HTTP/2、TLS；未知协议回退为原始字节复制。实现也考虑了服务端先发送数据的协议，避免一律等待客户端首字节。

这是实际通信路径中的代理：“无需修改业务代码”不代表对连接行为和性能完全没有影响。

源码：[socket 状态与接入](https://github.com/subtrace/subtrace/blob/e3e3546b367ecc23d5fe5642491526ee969a6ff2/cmd/run/socket/socket.go)、[协议识别与转发](https://github.com/subtrace/subtrace/blob/e3e3546b367ecc23d5fe5642491526ee969a6ff2/cmd/run/socket/proxy.go)。

## 3. HTTPS 临时 CA 与两段 TLS

`GenerateEphemeralCA` 在内存生成 ECDSA 临时 CA。目标程序打开已知 Linux CA 文件时，`handleOpen` 读取原内容，创建 memfd 写入“原集合 + 临时 CA”，将描述符注入程序。stat 处理同步调整文件大小；原磁盘文件不被覆盖。

`tls.Environ` 在未设置时补充 `SSL_CERT_FILE`、`REQUESTS_CA_BUNDLE`、`NODE_EXTRA_CA_CERTS`、`DENO_CERT` 等变量。这不能保证自带信任库或固定证书的程序接受临时 CA。

```text
目标应用                  Subtrace                  外部 HTTPS 服务
  │ 读取 CA 文件             │                            │
  │ ← 原 CA + 临时 CA        │                            │
  │                          │                            │
  │ TLS 握手 →               │ 独立 TLS 握手 →             │
  │ ← 临时 CA 签发的站点证书 │ ← 上游站点证书              │
  │                          │                            │
  │ ⇄ 加密通道 A ⇄           │ ⇄ 加密通道 B ⇄             │
  │                 代理内获得 HTTP 明文                  │
```

CA 初始化和文件读取可以早于连接，图示不代表每次请求都执行文件注入。代理参考 ClientHello 信息与上游握手，再对应用提供新签发的证书。这是两段 TLS，不是破解原始加密。

入站 TLS 因应用证书 / 私钥位置不统一而直接回退。证书固定、mTLS、自定义 CA 库可能使出站握手失败。该版本上游使用 `InsecureSkipVerify: true`，源码明确保留证书验证 TODO，因此信任验证与原程序不完全等价。

源码：[CA 与握手](https://github.com/subtrace/subtrace/blob/e3e3546b367ecc23d5fe5642491526ee969a6ff2/cmd/run/tls/tls.go)、[文件注入](https://github.com/subtrace/subtrace/blob/e3e3546b367ecc23d5fe5642491526ee969a6ff2/cmd/run/engine/process/handle.go)、[入站回退](https://github.com/subtrace/subtrace/blob/e3e3546b367ecc23d5fe5642491526ee969a6ff2/cmd/run/socket/proxy.go)。

## 4. 从字节到记录

HTTP/1 路径读取请求 / 响应，HTTP/2 路径解析帧、流与 HPACK 头部。`tracer/parser.go` 整理 HAR 结构，采样正文、处理部分压缩 / 编码、收集时间与标签。

默认正文捕获上限 4096 字节。捕获副本截断不代表把应用实际响应截短。网页的正文控件仅说明这个区别，没有实现上游的全部采样与编码逻辑。

过滤在记录完成后使用 CEL 表达式判断，规则首条匹配、未命中默认保留。当前实现中求值失败也走保留路径。因此过滤配置不是阻断连接的防火墙。网页筛选只是有限的教学选项，不是完整 CEL 执行器。

源码：[HAR、采样、过滤](https://github.com/subtrace/subtrace/blob/e3e3546b367ecc23d5fe5642491526ee969a6ff2/tracer/parser.go)、[规则](https://github.com/subtrace/subtrace/blob/e3e3546b367ecc23d5fe5642491526ee969a6ff2/docs/rules.mdx)。

## 5. 数据去向

默认 `sendReflector=true`，HAR、标签等被封装成 protobuf 事件，由 publisher 通过 WebSocket 发送。默认端点为 `https://subtrace.dev`，无 token 时申请临时面板链接，有 token 时使用认证上下文。

`--devtools` 设置路径后，解析器可把 HAR 交给本地服务，在应用 HTTP 路径提供界面。但启动 publisher 的条件还与 token 有关，不能只凭这个选项断言整个进程完全无外联。

仓库也包含 tunnel / worker / ClickHouse 相关路径；它们不是基础命令必须由用户另外部署的全部前提。本研究未验证完整私有化部署。

源码：[发布通道](https://github.com/subtrace/subtrace/blob/e3e3546b367ecc23d5fe5642491526ee969a6ff2/tracer/publisher.go)、[端点](https://github.com/subtrace/subtrace/blob/e3e3546b367ecc23d5fe5642491526ee969a6ff2/rpc/endpoint.go)、[DevTools](https://github.com/subtrace/subtrace/blob/e3e3546b367ecc23d5fe5642491526ee969a6ff2/devtools/devtools.go)。

## 6. 平台差异

透明 run 路径依赖 Linux seccomp、pidfd 与通知描述符注入，入口要求 5.9+，过滤器支持 amd64 / arm64。Windows 原生没有这套内核接口，本检出未发现等价 Windows run 入口。

Darwin 入口注册 proxy / tail / worker / version，没有 Linux run。macOS 文档与 README 的支持表述处于不同阶段，应单独验证，不能将显式端口代理等同于 Linux 透明接管。

本研究只需 Python 与浏览器，不安装 Subtrace。WSL2 / Linux 容器是可能的未来验证环境，本次未运行。
