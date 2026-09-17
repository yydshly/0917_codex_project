"""Draw the original Clash ingress/egress teaching diagram (stdlib only)."""
from html import escape
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / 'assets/clash-network-flow.svg'
parts = ['''<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="2260" viewBox="0 0 1600 2260" role="img" aria-labelledby="title desc">
<title id="title">Clash 底层交互：系统代理与 TUN 如何汇入同一条代理链</title>
<desc id="desc">以 HTTPS 网站和 Trojan 远端节点为例。左路应用主动使用 HTTP 代理，经操作系统回环 TCP 到本地监听器；右路应用正常联网，经系统路由及 TUN 虚拟网卡把 IP 包交给协议栈。两路都进入 Clash，识别目标、选择出口并统计转发字节。物理网络连接远端节点，节点解除外层代理 TLS 并新建到网站的连接，内层 HTTPS 仍由浏览器和网站端到端处理。DIRECT 则直接连接网站。底部解释 IP 检测、DNS 和 Neko Master 统计。</desc>
<defs><marker id="a" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" fill="none" stroke="#294e44" stroke-width="1.7"/></marker><marker id="b" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" fill="none" stroke="#976239" stroke-width="1.7"/></marker></defs>
<rect width="1600" height="2260" fill="#f7f8f2"/>
<g font-family="Microsoft YaHei,Segoe UI,sans-serif">''']

def text(x,y,s,size=26,color='#203e35',weight=400,anchor='start'):
    parts.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" font-weight="{weight}" text-anchor="{anchor}">{escape(s)}</text>')
def rect(x,y,w,h,fill='#fff',stroke='#c8d8ce',radius=15):
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>')
def arrow(d,dashed=False):
    color='#976239' if dashed else '#294e44'
    parts.append(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="3" marker-end="url(#{"b" if dashed else "a"})"'+(' stroke-dasharray="9 7"' if dashed else '')+'/>')
def box(x,y,w,h,title,lines,fill='#fff',title_color='#203e35'):
    rect(x,y,w,h,fill)
    text(x+24,y+42,title,30,title_color,600)
    for i,line in enumerate(lines): text(x+24,y+82+i*35,line,24,'#50675d')

text(50,64,'Clash：两种入口，同一套出口与统计',48,weight=650)
text(50,109,'示例：访问 HTTPS 网站，使用 Trojan 节点。沿箭头向下读；响应沿对应链路反向返回。',26,'#50675d')

rect(40,150,1520,865,'#eef3ed','#b8cdbf',22)
text(68,192,'Ⅰ 你的电脑内部',29,weight=600)
text(1515,192,'这部分没有连接远端代理服务器',23,'#50675d',anchor='end')
text(90,242,'A · 系统代理：应用主动找 Clash',30,'#215b79',600)
text(860,242,'B · TUN：系统把包交给 Clash',30,'#326044',600)
box(90,264,650,118,'浏览器知道代理地址',['示例：本机 127.0.0.1:7890'],'#edf4f9')
box(860,264,650,118,'应用照常连接网站',['目标：网站 IP:443；应用无须知道代理'],'#edf5e9')
arrow('M415 383V448'); text(447,423,'先连接本机代理端口',23,'#215b79')
arrow('M1185 383V448'); text(1217,423,'产生 TCP/IP 数据包',23,'#326044')
box(90,452,650,120,'操作系统：回环 TCP/IP',['本机 socket → 本机代理监听器'],'#edf4f9')
box(860,452,650,120,'操作系统：路由 → TUN 虚拟网卡',['匹配的 IP 包交给程序，不直接发到网线'],'#edf5e9')
arrow('M415 573V644'); text(447,611,'HTTP CONNECT 网站域名:443',22,'#215b79')
arrow('M1185 573V644'); text(1217,611,'IP 包：IP / TCP / 数据',22,'#326044')
box(90,648,650,124,'Clash 的 HTTP / mixed 入口',['解析 CONNECT 目标，建立字节转发通道'],'#edf4f9')
box(860,648,650,124,'Clash 的 TUN 协议栈适配',['处理 TCP 状态与重组，形成连接 / 字节流'],'#edf5e9')
text(90,809,'通道建立后，浏览器发送网站的 TLS 握手与密文。',23,'#50675d')
text(860,809,'UDP 则按数据报处理；TUN 自身不是远端协议。',23,'#50675d')
arrow('M415 826V852H780V877'); arrow('M1185 826V852H820V877')
rect(90,882,1420,100,'#203e35','#203e35')
text(118,923,'Clash 统一处理',31,'#fff',600)
text(420,920,'目标识别 / DNS 映射',25,'#e1eddf')
text(806,920,'规则 / GLOBAL 选出口',25,'#e1eddf')
text(1210,920,'读写计数与转发',25,'#e1eddf')
text(420,958,'全局模式只改出口选择；不会让所有应用自动进入 Clash。',24,'#e1eddf')
arrow('M800 983V1047'); text(834,1028,'选中代理节点：由本机新建到节点的连接',23)

text(50,1092,'Ⅱ 真正经过物理网络的交互',30,weight=600)
box(50,1120,450,205,'你的电脑：Clash 出站',['认证 + 目标地址 + 要转发的数据','用 Trojan 的外层 TLS 封装','经系统 TCP/IP → Wi-Fi / 网线'],'#fff')
box(600,1120,450,205,'远端 Trojan 服务器',['解除外层 TLS，读取目标地址','新建到网站的 TCP 连接','继续转发内层 HTTPS 密文'],'#fff')
box(1150,1120,400,205,'目标网站，例如 Google',['处理浏览器的 HTTPS','读取网页请求并返回响应','来源 IP：节点的出口 IP'],'#e7efdf')
arrow('M501 1217H583'); text(548,1155,'连接①',20,anchor='middle')
arrow('M1051 1217H1133'); text(1098,1155,'连接②',20,anchor='middle')
text(50,1364,'这两段是分别建立的网络连接；同一个网站 TLS 会话的字节被跨段转发。',25,'#50675d')
arrow('M274 1326V1404H1347V1340',True)
rect(465,1383,668,42,'#f7f8f2','#f7f8f2',0)
text(800,1413,'若选 DIRECT：本机 → 网站，网站看到本地出口 IP',23,'#976239',anchor='middle')

text(50,1488,'Ⅲ “转换”的到底是什么？看两个加密层',30,weight=600)
rect(50,1514,1500,267,'#fff','#c8d8ce')
text(77,1557,'连接①  本机 → 节点',26,weight=600)
rect(390,1529,1125,80,'#edf3ed','#c8d8ce',8)
text(410,1578,'IP（目的=节点 IP） / TCP / 外层 TLS〔Trojan 协议 + 内层 HTTPS〕',25)
text(77,1660,'连接②  节点 → 网站',26,weight=600)
rect(390,1632,1125,68,'#edf4f9','#cad8e2',8)
text(410,1675,'IP（目的=网站 IP） / TCP / 内层 HTTPS TLS 数据',25)
text(77,1744,'内层 HTTPS：浏览器 ↔ 网站。远端代理解除的是外层加密，不因此获得 HTTPS 正文。',25,'#50675d')
text(50,1820,'图示为连接的逻辑分层：认证和目标地址不是每个数据包都重复携带；不代表原 IP 包整包转发。',23,'#50675d')

text(50,1882,'Ⅳ 回到你的问题：出口 IP、域名和监控',30,weight=600)
box(50,1905,480,200,'网站为什么看到代理 IP？',['连接②由节点建立，来源是节点。','两种入口若使用同一个出口，','网站看到的出口 IP 可以相同。'],'#fff')
box(560,1905,480,200,'域名和 IP 从哪里来？',['CONNECT 可以直接提供域名。','TUN 初始主要看到目标 IP；','域名可由 DNS 映射 / 嗅探补充。'],'#fff')
box(1070,1905,480,200,'Neko Master 在哪里统计？',['Clash 先计每条连接的读写字节。','Neko 读 API，做差分并汇总。','不等于物理网卡的全部字节。'],'#fff')
text(50,2160,'两种入口都使用操作系统与 IP 层。TUN 无须和远端同 IP；Clash 出站需正确选路，避免再次被自身捕获。',24,'#50675d')
text(50,2204,'适用范围：普通 HTTPS + HTTP 代理入口 / TUN + Trojan；不含 HTTPS 解密、链式代理、VPN IP 隧道等变体。',22,'#50675d')
text(50,2239,'原创教学示意 · 依据 Chromium、Linux TUN 文档、Mihomo 源码、Trojan 协议与 Neko Master 源码 · 详见配套来源说明',20,'#50675d')
parts.append('</g></svg>')
OUT.write_text('\n'.join(parts),encoding='utf-8',newline='\n')
print(OUT)
