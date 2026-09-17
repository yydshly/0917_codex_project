"""Maintain the original vector research guide; no upstream execution."""
from html import escape
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / 'assets/capability-summary.svg'
parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="2350" viewBox="0 0 1600 2350" role="img" aria-labelledby="title desc">',
 '<title id="title">Security Audit Skill：能力、约束、效果与历史项目对比</title>',
 '<desc id="desc">从六类安全角度审查代码，沿入口到影响追踪；七类约束分别由模型指令、程序校验与宿主隔离落实；六阶段输出三种结论和覆盖记录，对比 Defending Code。原创研究说明图，非实测结果。</desc>',
 '<style>text{font-family:Microsoft YaHei,PingFang SC,Arial,sans-serif}a text{text-decoration:underline}</style>',
 '<rect width="1600" height="2350" fill="#f5f5ee"/>']

def text(x,y,value,size=22,color='#172f2b',weight=400):
    parts.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" font-weight="{weight}">{escape(value)}</text>')

def box(x,y,w,h,fill='#fffef9',stroke='#d6ded2',radius=14):
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke}"/>')

def lines(x,y,items,size=21,color='#5d6c65',gap=31):
    for i,item in enumerate(items): text(x,y+i*gap,item,size,color)

def section(y,n,title,sub):
    text(64,y,n,18,'#62794b',700); text(112,y,title,30,weight=700)
    if sub: text(112,y+36,sub,20,'#5d6c65')

text(64,58,'011 / CLOUDFLARE / SECURITY AUDIT SKILL',18,'#5d6c65',600)
box(1180,28,356,43,'#e6edda',radius=8); text(1197,57,'原创研究图 · 非真实审计结果',20)
text(64,122,'从业务与技术边界，检查代码的安全质量',44,weight=700)
lines(64,166,['检查谁能做什么、输入如何到达资源、是否产生不该发生的效果；Skill 指导，宿主 AI 调查与验证。',
 '“质量把控”限定在安全维度：不等于全部功能、性能、可维护性评估，也不替项目实现权限系统。'],22,gap=33)

section(259,'01','从哪些角度审计','根据项目的真实入口和信任边界选择；9 组基础方法与 10 个专项领域提供调查提示。')
cards=[('业务逻辑与生命周期',['状态与顺序、并发与重试、撤销与恢复','检查重复退款、重复核销等安全后果']),
('身份、权限与隔离',['认证、角色、对象所有权、租户范围','检查越权操作与跨用户、跨租户访问']),
('输入、接口与敏感操作',['HTTP、文件、CLI、消息与工具参数','检查范围、类型、转换及注入路径']),
('数据与秘密',['缓存、导出、备份、删除与密钥','检查派生副本和后续使用是否泄露']),
('组件、协议与平台',['浏览器、RPC、AI / MCP、本地 IPC','检查组件的保证与下游假设是否一致']),
('底层、部署与供应链',['内存、资源上限、云配置、CI 与发布','检查越界、共享资源与发布权限失效'])]
for i,(title,body) in enumerate(cards):
    x=64+(i%3)*500; y=319+(i//3)*145
    box(x,y,472,128); text(x+22,y+38,title,25,weight=650); lines(x+22,y+75,body,20,gap=29)

box(64,622,1472,188,'#214c40','#214c40')
text(88,663,'02 / 沿入口追到实际影响',27,'#f7f7ef',700)
text(88,711,'谁进入  →  能输入或操作什么  →  认证授权与转换  →  触达什么资源  →  边界失败与证据',25,'#d6ef79',600)
lines(88,752,['同时核查：必经防护、批量与旧版、异常、并发、重试、迁移、撤销和恢复路径。',
 '假设订单案例：A 查询 B 的订单 → 核对中间件、查询与数据库策略 → 本地虚拟账号验证；未知策略保留待验证。'],20,'#d4dfcf',gap=30)

section(867,'03','Skill 从哪些角度约束 AI','约束审计行为与证据标准；不能仅凭发现者自报完成，就认定漏洞成立。')
rows=[('目标','说明主体、输入或动作、边界、资源与具体结果','以安全不变量提出候选'),
('路径','从入口追到效果，核对最强防护及其他可达路径','调查者阅读，验证者重读'),
('覆盖','保存检查单元、负责人、源码路径、检查与遗漏','覆盖记录 + 独立覆盖检查'),
('证据','确认需完整路径与本地观察；未知关键事实单列','独立验证；待验证无严重性'),
('独立性','发现者不兼任独立验证者；重大改写再次复核','主代理安排新的子代理'),
('执行','断外网、白名单环境、只读源码、隔离写入与限额','宿主沙箱强制实施，缺条件不执行'),
('输出','三类结论字段分开，报告不得超出已验证事实','Schema 与脚本检查记录规则')]
box(64,924,1472,382)
for i,(a,b,c) in enumerate(rows):
    y=960+i*50
    if i%2==0: box(76,y-29,1448,46,'#eef1e7','#eef1e7',5)
    text(92,y,a,22,weight=700); text(245,y,b,21); text(1075,y,c,20,'#526642')

mechanisms=[('指令约束 / 模型遵守',['Markdown → 主代理 → 子代理提示','规定如何调查；仍可能遗漏或误解']),
 ('程序校验 / 明确规则',['Node.js 检查字段、状态与一致性','记录合规 ≠ 漏洞事实得到证明']),
 ('环境隔离 / 操作系统',['宿主提供网络、文件与资源隔离','本库没有附带完整的运行平台'])]
for i,(title,body) in enumerate(mechanisms):
    x=64+i*500; box(x,1326,472,122,'#e7eddb'); text(x+22,1364,title,24,weight=650); lines(x+22,1397,body,20,gap=28)

section(1504,'04','如何推进，最终得到什么','预期价值：减少无证据猜测与重复调查，让结论、覆盖缺口和后续行动可追踪。')
text(80,1589,'侦察  →  调查  →  候选验证  →  结构化记录  →  最终复核  →  报告',29,weight=650)
verdicts=[('confirmed / 已确认',['路径、条件、观察结果与已证明影响','可赋严重性；提出最小修复建议'],'#e1edc9'),
 ('needs_validation / 待验证',['源码支持疑点，明确缺失的关键事实','提供验证计划；不赋严重性'],'#eee9d6'),
 ('rejected / 已排除',['有效控制或反证推翻候选问题','记录理由，避免重复错误主张'],'#e3e7e0')]
for i,(title,body,fill) in enumerate(verdicts):
    x=64+i*500; box(x,1615,472,118,fill,fill); text(x+20,1653,title,24,weight=650); lines(x+20,1684,body,20,gap=28)
text(80,1771,'共同产物：findings.json + 覆盖记录 + 汇总 / 详细发现 / 待验证报告。披露受阻、延期和范围外事项。',21)
text(80,1806,'quick 合并验证与最终复核，明确部分覆盖；本次未执行真实审计，未测检出率、误报率或成本。',20,'#5d6c65')

section(1860,'05','与 9 月 15 日研究的 Defending Code 对比','共同方法：读代码 → 提出假设 → 构造验证输入 → 独立复核 → 保留证据。')
box(64,1910,1472,259)
text(86,1947,'维度',21,'#5d6c65',600); text(282,1947,'Security Audit Skill / 本次',25,weight=700); text(933,1947,'Defending Code / 先前',25,weight=700)
compare=[('形态与范围','审计 Skill + 校验脚本；跨领域安全边界','可执行框架 + Skill；默认 C/C++ 内存漏洞'),
 ('执行与环境','宿主提供模型、子代理、工具和隔离','Claude Code + Python + Docker / gVisor / ASAN'),
 ('工程重点','覆盖追踪、证据门槛、最终记录与报告','构造输入、容器复现、恢复与补丁验收'),
 ('修复与效果','给修复建议，不改源码；检出效果未实测','另有 Patch 命令生成并验证候选补丁')]
for i,(a,b,c) in enumerate(compare):
    y=2000+i*46
    parts.append(f'<path d="M80 {y-28}H1520" stroke="#d6ded2"/>')
    text(86,y,a,20,weight=600); text(282,y,b,20); text(933,y,c,19)
text(64,2210,'其他研究：Ponytail 看实现必要性与精简；Impeccable 看界面体验；gstack 覆盖研发流程与质量检查。',21)
text(64,2246,'两库均不保证发现全部问题；未做同目标、同模型的效果对照，不能据此判断谁更准确。',21,'#5d6c65')
parts.append('<path d="M64 2272H1536" stroke="#d6ded2"/>')
lines(64,2302,['固定来源：Cloudflare c1c8a8c（MIT） / Anthropic d3bea6b（Apache-2.0）；研究整理 2026-09-17。',
 '依据 SKILL、RECONNAISSANCE、HUNTING、VALIDATION 与 Defending Code 前次源码研究；完整来源见 sources.md。'],17,gap=26)
parts.append('</svg>')
OUT.write_text('\n'.join(parts),encoding='utf-8',newline='\n')
print('Built the complete capability and comparison guide')
