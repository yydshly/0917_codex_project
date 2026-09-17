"""Author an original, source-linked SVG explainer; rasterize separately in a browser."""
from html import escape
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent
ASSETS = PROJECT / 'assets'
COMMIT = 'f2c7051853848826aac2f4646581d62a732155ad'
BASE = f'https://github.com/pbakaus/impeccable/blob/{COMMIT}/'
W, H = 1680, 2520
INK, MUTED, LINE = '#163447', '#4b6271', '#cbd8df'
TEAL, BLUE, AMBER = '#096958', '#245da2', '#92601b'
parts = []
transcript = []

def rect(x, y, w, h, fill='#ffffff', stroke=LINE, r=16):
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}"/>')

def text(x, y, value, size=23, color=INK, weight=400):
    parts.append(f'<text x="{x}" y="{y}" fill="{color}" font-size="{size}" font-weight="{weight}">{escape(value)}</text>')
    transcript.append(value)

def lines(x, y, values, size=22, color=MUTED, gap=32):
    for i, value in enumerate(values): text(x, y+i*gap, value, size, color)

def path(d, color=TEAL, arrow=False, dash=False):
    parts.append(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="2.5"'+(' marker-end="url(#arrow)"' if arrow else '')+(' stroke-dasharray="7 6"' if dash else '')+'/>')

def pill(x,y,w,label,color=TEAL,fill='#e4f1ec'):
    rect(x,y,w,32,fill,'none',8); text(x+12,y+23,label,18,color,600)

def section(y, number, title, subtitle=''):
    rect(72,y-29,38,38,TEAL,'none',10); text(83,y,number,23,'#ffffff',700)
    text(126,y,title,28,INK,700)
    if subtitle:text(126,y+34,subtitle,21,MUTED)

parts.append(f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-labelledby="title desc">
<title id="title">Impeccable：前端优化的能力、原理与使用价值</title>
<desc id="desc">统一引导图。Skill 提供通用设计约束，用户明确目标与风格，大模型细化项目要求并改代码，检测与验收提供反馈。说明对个人研究网页的意义、持续使用方式、模型升级影响，以及具体能力和实效仍待后续验证。</desc>
<metadata>本研究原创源码分析图，非上游官方图或运行截图。研究日期 2026-09-17；源码 {COMMIT}。已做有限看板实验；具体命令与模型增益尚待逐项验证。</metadata>
<defs><marker id="arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="{TEAL}" stroke-width="1.8"/></marker></defs>
<g font-family="'Microsoft YaHei', 'Segoe UI', sans-serif"><rect width="{W}" height="{H}" fill="#f4f7fa"/>
''')

text(72,80,'Impeccable：前端优化的能力、原理与使用价值',39,INK,700)
text(72,126,'Skill 给通用约束；用户给目标与风格，大模型细化项目要求、设计并实现。',25,MUTED)
pill(72,154,164,'1 个主 Skill')
pill(250,154,188,'24 个设计命令')
pill(452,154,228,'61 条确定性规则')
text(704,178,'上游目录规模，不等于效果已验证；具体能力仍待逐项研究。',20,MUTED)

rect(72,222,1536,112,INK,'none')
text(100,263,'统一入口',26,'#ffffff',700)
text(290,263,'/impeccable <任务> [目标]',30,'#ffffff',600)
text(100,305,'输入：目标界面 + 本轮改进目标；修改需要源码。支持评审、排版、布局、状态完善，也可指导新建。',22,'#d9e8ef')
path('M 840 334 V 361',arrow=True)

section(391,'1','通用规则可以复用，项目要求需要定制','前三类是库提供的默认方法与偏好；第四类需要用户资料和大模型结合实际补充。')
cards = [
 (72,'规范阈值与工程质量',BLUE,'可以测量',[
  '正文对比度 ≥ 4.5:1',
  '大字对比度 ≥ 3:1',
  '文字不遮挡、内容不溢出',
  '对比度阈值沿用 WCAG',
  '来源：质量指南 + 检测规则 [1]']),
 (462,'通用交互设计原则',BLUE,'需要情境判断',[
  '状态可见、操作有反馈',
  '一致性、错误预防与恢复',
  '减少认知负担、明确主任务',
  'Nielsen 十项原则辅助评审',
  '来源：critique 评审指南 [2]']),
 (852,'作者的审美与经验',AMBER,'有取舍、有偏好',[
  '标题层级与间距有节奏',
  '避免套娃卡片、渐变文字',
  '警惕模板化字体与配色',
  '减少装饰对任务的干扰',
  '来源：craft-floor 等指南 [3]']),
 (1242,'项目自身的要求',TEAL,'决定是否适合',[
  '用户、目标、任务与约束',
  '品牌、既有组件和视觉规范',
  '当前页面的内容与使用场景',
  '用户明确指定的要求优先',
  '来源：项目资料 + 用户需求 [4]'])
]
for x,title,color,label,body in cards:
    rect(x,449,366,226)
    text(x+20,486,title,24,INK,700)
    text(x+20,518,label,20,color,600)
    lines(x+20,550,body,20,gap=26)
    path(f'M {x+183} 675 V 703',color=LINE)
path('M 255 703 H 1425',color=LINE)
path('M 840 703 V 726',arrow=True)

rect(72,743,1536,176,'#e7f1ed','#b5d2c5')
text(98,783,'2  用户明确方向，大模型细化项目的特殊要求',28,TEAL,700)
text(98,824,'目标用户 / 任务 / 风格参考 → 模型提出布局、字体、颜色与交互方案 → 用户确认或修订',24,INK,600)
text(98,862,'优秀方向：操作重效率 / 阅读重理解 / 营销重行动 / 展示重体验；风格明确不等于任务已经好用。',23,MUTED)
text(98,898,'PRODUCT.md 保存产品事实；DESIGN.md 保存确认的视觉规范；页面说明保存局部目标。明确需求优先于默认偏好。',21,MUTED)
path('M 840 919 V 956',arrow=True)

rect(72,974,1536,168,'#ffffff',LINE)
text(98,1015,'3  宿主 AI 读取对应指南，推理并修改真实代码',28,INK,700)
text(98,1058,'读取项目 → 诊断问题 → 明确修改策略 → 编辑 HTML / CSS / 组件 → 运行页面',25,TEAL,600)
text(98,1096,'例如：区分标题与正文、按任务重组布局、保留搜索能力、补充长文本和空结果状态。',23,MUTED)
text(98,1128,'约束形式：Markdown 指令进入模型上下文。它依赖模型理解与执行，并非强制求出“最优设计”的算法。',21,MUTED)
path('M 840 1142 V 1172',arrow=True)

section(1210,'4','三种反馈，共同检查实现','作用不同，互相补充；并非所有命令都会自动执行完整三路流程。')
verification=[
 (72,'程序检测：可重复的底线',BLUE,[
  'Rust detect：无需模型或 API Key',
  '源码文本 / 静态 HTML / 网页 URL',
  'URL → Chromium / CDP → 页面快照',
  '规则输出位置、片段和问题类型',
  '扩展与页面工具可复用 WASM 核心',
  '可选 Hook 在支持的宿主编辑后触发'],
  '零发现 ≠ 整个产品无缺陷 [1][5]'),
 (592,'AI 评审：上下文中的判断',TEAL,[
  '看层级、信息结构和品牌适配',
  '检查主任务、状态和认知负担',
  'critique 可将设计与检测分开评估',
  '按严重度给出具体修改建议',
  '要求引用页面或代码中的证据',
  '评分用于整理判断，不是客观真值'],
  '依然可能误判或自我认可 [2]'),
 (1112,'浏览器与人：看实际效果',AMBER,[
  '打开真实页面，检查桌面与手机',
  '操作搜索、键盘和错误恢复路径',
  '检查长标题、空状态与内容变化',
  '用户确认是否符合自己的目标',
  '可选 Live：选择元素并比较变体',
  '接受方案后保留对应源码实现'],
  '模拟视口 ≠ 真实用户测试 [6]')
]
for x,title,color,body,foot in verification:
    rect(x,1270,496,294)
    text(x+22,1310,title,25,color,700)
    lines(x+22,1352,body,22,gap=29)
    text(x+22,1540,foot,21,color,600)
    path(f'M {x+248} 1564 V 1590',color=LINE)
path('M 320 1590 H 1360',color=LINE)
rect(72,1610,1536,68,'#e7f1ed','none',12)
text(100,1652,'发现问题 → 回到 AI 修改 → 批量复查；常规流程限制检查轮次，避免无限润色。',25,TEAL,600)
path('M 72 1644 H 35 V 1050 H 69',arrow=True,dash=True)
path('M 840 1678 V 1707',arrow=True)

section(1746,'5','交付结果：把“通过检查”和“优秀效果”分开','交付物是前端代码、适用的设计记录与评审/验证证据；不是一个保证成功的分数。')
outcomes=[
 (72,'可以验证的质量',BLUE,['本次规则是否命中','指定尺寸是否溢出','指定交互是否正常'],'工具与测试给出有限范围的证据'),
 (592,'仍需判断的适配',TEAL,['信息是否清楚、重点是否合适','是否符合品牌与使用场景','视觉表达是否令人满意'],'模型、设计者与用户共同判断'),
 (1112,'还需实测的用户收益',AMBER,['任务成功率、完成时间','错误次数、理解程度','业务转化和长期使用体验'],'需真实用户或独立对照实验')
]
for x,title,color,body,foot in outcomes:
    rect(x,1804,496,184)
    text(x+22,1842,title,25,color,700)
    lines(x+22,1878,body,22,gap=28)
    text(x+22,1970,foot,20,MUTED)

rect(72,2020,1536,142,INK,'none')
text(98,2061,'对我的意义：给研究网页一套可复用的改进方法与验收参考',26,'#ffffff',700)
text(98,2103,'让读者理解项目能力、原理与证据；让看板用户顺利检索、筛选与恢复操作。',24,'#e1edf3')
text(98,2139,'每轮针对明确问题持续优化，并沉淀已确认的规范；不追求无目标的反复改版，也不只追求规则零命中。',21,'#e1edf3')

rect(72,2194,1536,137,'#ffffff',LINE)
text(98,2231,'阶段认识与后续研究',25,INK,700)
text(98,2270,'模型越强，通用常识提醒的额外价值可能降低；项目上下文与实际验证仍有意义，规则也需更新。',23,MUTED)
text(98,2307,'已做源码分析与有限看板实验；具体命令、风格定制、Live 和相对模型的实际增益，仍需逐项梳理与验证。',23,MUTED)
text(72,2373,'核心：通用约束来自 Skill；特殊要求由用户与模型共同明确；具体实现靠大模型，最终效果靠验收。',25,TEAL,700)

sources=[
 ('[1] 检测规则','crates/core/src/checks/rules.rs'),
 ('[2] 体验评审','skill/reference/critique.md'),
 ('[3] 设计底线','skill/reference/craft-floor.md'),
 ('[4] Skill 与上下文','skill/SKILL.src.md'),
 ('[5] 引擎架构','docs/ENGINE.md'),
 ('[6] Live 流程','skill/reference/live.md')
]
for i,(label,target) in enumerate(sources):
    parts.append(f'<a href="{BASE+target}" target="_blank">')
    text(72+i*254,2420,label,19,BLUE)
    parts.append('</a>')
text(72,2462,'源码 f2c7051 · 2026-09-17 · 本研究原创说明图，非上游官方图或效果承诺；数字规模与实际能力增益应分开看。',19,MUTED)
parts.append('</g></svg>')
ASSETS.mkdir(exist_ok=True)
(ASSETS/'capability-summary.svg').write_text('\n'.join(parts),encoding='utf-8')
body='# Impeccable 优秀标准与技术原理：图中文字\n\n本研究原创分析图。按图中的阅读顺序排列；三路验证为能力汇总，并非每次自动执行全部工作流。\n\n'
body+='\n\n'.join(transcript)+'\n\n## 固定源码来源\n\n'
body+='\n'.join(f'- [{label}]({BASE+target})' for label,target in sources)+'\n'
(ASSETS/'capability-summary-text.md').write_text(body,encoding='utf-8')
print('Generated capability-summary.svg and text companion')
