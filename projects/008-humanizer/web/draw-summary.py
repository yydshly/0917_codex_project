"""Draw the original, editable Humanizer capability overview (stdlib only)."""
from html import escape
from pathlib import Path

ASSETS = Path(__file__).resolve().parents[1] / 'assets'
W, H = 1800, 2600
INK, MUTED, ACCENT = '#25322e', '#5c6c62', '#a84430'
PAPER, WHITE, LINE, MINT = '#f6f4ec', '#fffef9', '#d5dccf', '#e7ede0'
text_lines = []
parts = [f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-labelledby="title desc">
<title id="title">Humanizer：能力、Skill 实现方式与对我们的意义</title>
<desc id="desc">从能力、用户输入、Skill 加载、模型编辑流程、三种输出、25 类规则、使用价值到验收边界的完整说明。Skill 是 Markdown 编辑指南，规则由宿主模型按上下文执行，不是 25 个独立程序。图中列出全部 25 类规则，并说明事实核验、中文适配和实际收益仍需要验证。</desc>
<defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M1 1L8 4.5L1 8" fill="none" stroke="{ACCENT}" stroke-width="1.5"/></marker></defs>
<rect width="{W}" height="{H}" fill="{PAPER}"/>
<g font-family="Microsoft YaHei,Segoe UI,sans-serif">''']


def rect(x, y, w, h, fill=WHITE, stroke=LINE, radius=12):
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>')


def text(x, y, value, size=25, color=INK, weight=400, anchor='start'):
    text_lines.append(value)
    parts.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" font-weight="{weight}" text-anchor="{anchor}">{escape(value)}</text>')


def lines(x, y, values, size=24, color=MUTED, step=36):
    for i, value in enumerate(values):
        text(x, y + step * i, value, size, color)


def arrow(x1, y1, x2, y2):
    parts.append(f'<path d="M{x1} {y1} L{x2} {y2}" fill="none" stroke="{ACCENT}" stroke-width="3" marker-end="url(#arrow)"/>')


def section(y, number, title, note=''):
    text(72, y, number, 23, ACCENT, 600)
    text(130, y, title, 34, INK, 650)
    if note:
        text(1728, y, note, 20, MUTED, anchor='end')


text(72, 67, 'RESEARCH NOTE 008  /  HUMANIZER', 21, ACCENT, 600)
text(1728, 67, 'v3.0.0 · MIT · 中文研究', 21, MUTED, anchor='end')
text(72, 146, '把文字编辑经验，变成可复用的 Skill。', 57, INK, 650)
text(72, 199, '减少 AI 模板腔，让表达更自然；提供个人样文后，进一步贴近作者自己的语气。', 29, MUTED)
text(72, 242, '核心判断：25 类问题与修改建议，由宿主模型按上下文选用；无需每篇文章执行 25 次处理。', 24, ACCENT)

section(316, '01', '能力：在初稿完成后，加一轮有章法的编辑')
capabilities = [
    ('去掉空话与夸大', ['删无信息的铺垫、重复结尾', '把宣传和模糊背书改得具体']),
    ('调整句式与段落', ['减少机械排比和重复开头', '按实际内容组织节奏与结构']),
    ('匹配作者的语气', ['参考样文的措辞、句长、标点', '不同文体采用不同表达方式']),
    ('嵌入写作与文件任务', ['用于正文、邮件、README、PR', '文件模式要求保留代码与链接']),
]
for i, (title, body) in enumerate(capabilities):
    x = 72 + 422 * i
    rect(x, 342, 390, 163)
    text(x + 23, 387, title, 28, INK, 600)
    lines(x + 23, 433, body, 22, step=35)

section(573, '02', '实现：把规则放进上下文，由大模型完成改写', '本库没有自有模型或独立改写服务')
rect(72, 605, 400, 267)
text(97, 647, '你提供什么', 29, INK, 600)
lines(97, 693, ['原文：待编辑的内容', '目标：读者、文体、用途', '事实：需要保留的材料', '样文：可选的个人写作参考'], 25, step=43)
arrow(482, 734, 532, 734)

rect(543, 605, 700, 267, '#f4ebdf', '#c6987d')
text(570, 647, 'Humanizer / SKILL.md', 30, ACCENT, 600)
lines(570, 693, ['元数据：名称与描述，供宿主识别与调用', '规则正文：25 类模式 + 前后示例 + 例外条件', '执行要求：编辑步骤、事实约束、风格与输出', '使用方式：宿主加载 Skill，将规则交给模型'], 25, step=43)
arrow(1255, 734, 1305, 734)

rect(1318, 605, 410, 267, MINT)
text(1343, 647, '宿主大模型执行', 29, INK, 600)
lines(1343, 693, ['理解原文和上下文', '判断哪些规则适用', '生成改写并自检', '文件读写能力由宿主提供'], 25, step=43)

rect(72, 892, 1656, 100, '#efeee5', '#efeee5')
text(98, 930, '配套文件只负责接入与检查', 23, INK, 600)
text(98, 966, 'plugin.json / agents/openai.yaml：入口与展示信息；validate-package.py：检查版本、编号和包结构，不处理文章。', 23, MUTED)

text(72, 1044, '模型内的编辑流程', 25, INK, 600)
text(1728, 1044, '提示词中的步骤，不代表固定四次 API 调用', 22, MUTED, anchor='end')
steps = [
    ('1  标记问题', ['从词句到段落识别模式']),
    ('2  重写初稿', ['重组表达，保留有效信息']),
    ('3  复查初稿', ['检查残留问题与事实增删']),
    ('4  写出终稿', ['围绕主旨自然表达']),
]
for i, (title, body) in enumerate(steps):
    x = 72 + i * 431
    rect(x, 1066, 363, 105, WHITE)
    text(x + 23, 1107, title, 28, INK, 600)
    text(x + 23, 1145, body[0], 23, MUTED)
    if i < 3:
        arrow(x + 374, 1118, x + 416, 1118)

rect(72, 1191, 1656, 102, MINT, MINT)
text(97, 1230, '贯穿全程的约束', 25, INK, 600)
text(337, 1230, '不新增无依据事实；把原文当编辑材料；有意义的修辞和引用应保留。', 25, INK)
text(337, 1270, '弱信号结合上下文判断；作者样文可覆盖默认风格；缺少信息就提问或简化。', 24, MUTED)

outputs = [('粘贴文本', '初稿 + 简短自评 + 最终文本'), ('指定文件', '只写最终正文，再摘要说明'), ('嵌入其他任务', '只返回最终文本')]
for i, (title, body) in enumerate(outputs):
    x = 72 + i * 562
    text(x, 1340, title, 25, ACCENT, 600)
    text(x, 1378, body, 24, MUTED)

section(1457, '03', '规则：5 个类别，覆盖 25 类常见写作问题', '完整分类，按上游 3.0.0 编号归纳')
categories = [
    ('A', '表达姿态', ['01  空洞的“不是…而是…”', '02  重复结尾、戏剧化短句', '03  貌似深刻的格言', '04  进入主题前的铺垫', '05  虚设反对意见']),
    ('B', '机械节奏', ['06  强行凑三项的排比', '07  连续重复句子开头', '08  破折号连接一切', '09  不确定修饰语堆叠', '10  英文连字符滥用', '11  被动语态、缺失主语']),
    ('C', '夸大与权威', ['12  指定的 AI 高频词', '13  拔高普通事实的意义', '14  含糊的关联表述', '15  无依据的 -ing 附加句', '16  宣传式语言', '17  模糊专家、媒体背书', '18  回避简单动词']),
    ('D', '机械格式', ['19  装饰性加粗与标签', '20  装饰性标题', '21  不符目标风格的引号']),
    ('E', '聊天与草稿残留', ['22  聊天问候、赞美、追问', '23  知识声明与无据猜测', '24  首句重复标题', '25  不必要的旧版本叙述']),
]
for i, (key, title, rules) in enumerate(categories):
    x = 72 + i * 336
    rect(x, 1484, 312, 384, WHITE)
    text(x + 20, 1526, f'{key} / {len(rules)} 类', 21, ACCENT, 600)
    text(x + 20, 1568, title, 27, INK, 600)
    lines(x + 20, 1615, rules, 20, MUTED, step=34)
text(72, 1910, '25 类是编辑检查项，不是 25 个独立算法，也不是 AI 作者身份的判定标准。具体例外与说明见网页规则库。', 24, ACCENT)

section(1981, '04', '对我们的意义：把反复提出的修改意见，变成可复用的规范')
values = [
    ('日常写作：少重复交代', ['把“删套话、说具体、保留信息”固化下来。', '用于邮件、汇报、博客和产品说明，', '减少每次从头描述编辑要求的负担。']),
    ('研究整理：更容易读懂', ['适合本仓库研究文档的最后一轮编辑。', '保留项目名、版本、commit、许可证，', '以及“已验证 / 待验证”的区别。']),
    ('团队协作：积累自己的标准', ['结合团队样文与读者需求调整规则。', '把个人经验变成可讨论的编辑清单，', '再用真实样本比较质量与修改成本。']),
]
for i, (title, body) in enumerate(values):
    x = 72 + i * 562
    rect(x, 2008, 532, 196, MINT, MINT)
    text(x + 24, 2053, title, 27, INK, 600)
    lines(x + 24, 2100, body, 22, MUTED, step=35)
text(72, 2255, '建议使用位置', 24, ACCENT, 600)
text(275, 2255, '研究 / 写作初稿  →  Humanizer 编辑  →  人工核对事实与语气  →  文档或网页发布', 27, INK, 600)

rect(72, 2302, 1656, 165, INK, INK)
text(98, 2347, '验收边界', 29, '#f6f4ec', 600)
text(280, 2347, '保留原意是规则目标，模型仍可能遗漏或改错；自检不能代替事实核验。', 25, '#f6f4ec')
text(280, 2391, '中文需结合语境，英文标点和词表不能直接照搬；文件修改后仍要核对差异。', 24, '#d1ddce')
text(280, 2435, '已完成：源文件研究与包校验。待验证：实际改写、语气匹配与可量化收益。', 24, '#d1ddce')

text(72, 2513, '原创研究说明图 · 2026-09-17 · 非模型运行结果 · 实际价值为研究判断，尚未做效果对照实验', 21, MUTED)
text(72, 2550, '依据：blader/humanizer · SKILL.md / README.md / 插件配置 / 校验脚本 · commit 9862685f575c65a8247f90369951df1b3416e3d6', 20, MUTED)
parts.append('</g></svg>')
ASSETS.mkdir(parents=True, exist_ok=True)
(ASSETS / 'capability-summary.svg').write_text('\n'.join(parts), encoding='utf-8', newline='\n')
(ASSETS / 'capability-summary-text.md').write_text('# Humanizer 能力与实现总览：文字版\n\n' + '\n\n'.join(text_lines) + '\n\n来源：https://github.com/blader/humanizer/tree/9862685f575c65a8247f90369951df1b3416e3d6\n', encoding='utf-8', newline='\n')
print(ASSETS / 'capability-summary.svg')
