"""Render our sourced understanding as one PNG and an editable SVG.

This is an authored explanatory diagram, not an AO screenshot or model result.
Pillow is needed only to regenerate exports, not to build the static website.
"""
from pathlib import Path
from html import escape
import json
import math
import re
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
ASSETS = HERE.parent / 'assets'
W, M, GAP = 2600, 76, 24
CW = W - 2 * M
INK, MUTED, LINE = '#172735', '#506273', '#d4dee7'
BLUE, PURPLE, GREEN, AMBER = '#235b9c', '#6544cb', '#24634d', '#885518'
WASH, SOFT, MINT, SAND = '#f2f6fa', '#f2effb', '#edf6f1', '#fff6e8'
canvas = Image.new('RGB', (W, 9000), '#ffffff')
draw = ImageDraw.Draw(canvas)
svg, texts, bounds = [], [], []
fonts = {}


def font(size, bold=False):
    key = (size, bold)
    if key not in fonts:
        fonts[key] = ImageFont.truetype(
            'C:/Windows/Fonts/msyhbd.ttc' if bold else 'C:/Windows/Fonts/msyh.ttc', size)
    return fonts[key]


def wrap(value, width, size=28, bold=False):
    lines = []
    for paragraph in value.split('\n'):
        parts = []
        for char in re.findall(r'[A-Za-z0-9_./@{}<>:=\-]+|[^\n]', paragraph):
            if parts and draw.textlength(''.join(parts) + char, font=font(size, bold)) > width:
                if char in '。，；：！？、）”》' and len(parts) > 1:
                    tail = parts.pop()
                    lines.append(''.join(parts).rstrip())
                    parts = [tail, char]
                else:
                    lines.append(''.join(parts).rstrip())
                    parts = [char] if char.strip() else []
            else:
                parts.append(char)
        lines.append(''.join(parts).rstrip())
    return lines


def height(value, width, size=28, bold=False):
    return len(wrap(value, width, size, bold)) * int(size * 1.48)


def text(value, x, y, width, size=28, color=INK, bold=False):
    texts.append(value)
    lines = wrap(value, width, size, bold)
    for line in lines:
        draw.text((x, y), line, font=font(size, bold), fill=color, anchor='lt')
        svg.append(f'<text x="{x}" y="{y}" fill="{color}" font-size="{size}" font-weight="{700 if bold else 400}" dominant-baseline="text-before-edge">{escape(line)}</text>')
        actual = draw.textlength(line, font=font(size, bold))
        assert actual <= width + 1, (line, actual, width)
        assert 0 <= x <= x + actual <= W, (line, x, actual)
        bounds.append((x, y, x + actual, y + size))
        y += int(size * 1.48)
    return y


def rect(x, y, w, h, fill='#ffffff', stroke=None, radius=12):
    draw.rounded_rectangle((x, y, x + w, y + h), radius=radius, fill=fill, outline=stroke, width=2)
    svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke or "none"}" stroke-width="2"/>')


def line(points, color=LINE, width=2):
    draw.line(points, fill=color, width=width)
    svg.append(f'<polyline points="{" ".join(f"{x},{y}" for x,y in points)}" fill="none" stroke="{color}" stroke-width="{width}"/>')


def arrow(points, color=PURPLE, width=3):
    line(points, color, width)
    x, y = points[-1]
    px, py = points[-2]
    angle = math.atan2(y - py, x - px)
    pts = [(x, y), (x - 12 * math.cos(angle - .5), y - 12 * math.sin(angle - .5)),
           (x - 12 * math.cos(angle + .5), y - 12 * math.sin(angle + .5))]
    draw.polygon(pts, fill=color)
    svg.append(f'<polygon points="{" ".join(f"{a},{b}" for a,b in pts)}" fill="{color}"/>')


def section(number, title, y, note=''):
    line([(M, y), (W - M, y)])
    text(number, M, y + 27, 80, 30, PURPLE, True)
    text(title, M + 90, y + 22, 1720, 42, INK, True)
    if note:
        text(note, W - M - 570, y + 35, 570, 23, MUTED)
    return y + 102


def row(cards, y, colors=None, size=28):
    """Cards: (title, body); dynamically share the tallest necessary height."""
    width = (CW - GAP * (len(cards) - 1)) // len(cards)
    pad = 27
    needed = [height(title, width - 2 * pad - 20, 33, True) + height(body, width - 2 * pad, size) + 2 * pad + 18 for title, body in cards]
    h = max(needed)
    for i, (title, body) in enumerate(cards):
        x = M + i * (width + GAP)
        fill, accent = (colors[i] if colors else (WASH, BLUE))
        rect(x, y, width, h, fill, LINE)
        rect(x + pad, y + pad, 6, 32, accent, radius=2)
        ty = text(title, x + pad + 20, y + pad - 4, width - 2 * pad - 20, 33, accent, True)
        end = text(body, x + pad, ty + 17, width - 2 * pad, size)
        assert end <= y + h + 2, (title, end, y + h)
    return y + h


def band(title, body, y, fill=SOFT, accent=PURPLE, body_color=INK):
    h = 48 + height(title, CW - 58, 31, True) + 13 + height(body, CW - 58, 28)
    rect(M, y, CW, h, fill)
    ty = text(title, M + 29, y + 23, CW - 58, 31, accent, True)
    text(body, M + 29, ty + 13, CW - 58, 28, body_color)
    return y + h


# Header: explicit scope and central claim.
rect(0, 0, W, 303, INK, radius=0)
text('开源研究集  /  003  /  能力与使用全景图', M, 36, 1800, 27, '#c2d0df')
text('Agency Orchestrator', M, 91, 2000, 76, '#ffffff', True)
text('把专家提示词组织成可复用、可追溯、可局部返工的 AI 工作流', M, 207, CW, 37, '#ffffff')
y = text('研究快照：0.19.2 · 1f36dba95ef70 · 2026-09-17  |  以固定版本源码与两轮实际调用为依据', M, 331, CW, 27, MUTED) + 28

# 1. Conceptual placement.
y = section('01', '它是什么：角色、流程、模型，各自负责什么', y)
cards = [
    ('角色与方法：定义“怎么想”', '001 / 002 提供角色身份、专业方法与交付要求。\n角色正文 + 可选 Skills 成为提示材料；团队保存常用阵容。'),
    ('AO 引擎：安排“怎么接着做”', '将输入、角色、任务、依赖与检查写成 YAML。\n解析配置、传递上下文、调用连接器、调度步骤并保存档案。'),
    ('模型与外部工具：实际执行', 'API / 已登录 CLI / Ollama 生成内容。\n媒体服务生成图像、视频和声音；ffmpeg 合成；人负责核查和业务交付。'),
]
y = row(cards, y, [(WASH, BLUE), (SOFT, PURPLE), (MINT, GREEN)]) + 18
y = text('固定快照规模：69 个工作流（含 13 个英文模板）｜276 个中文角色 / 191 个英文角色｜Apache-2.0；依赖各循其许可', M, y, CW, 26, MUTED) + 30

# 2. Capability surface.
y = section('02', '能力地图：从组队，到执行，再到带走成果', y, '本区为源码确认；实际覆盖见第 08 区')
y = row([
    ('A  建立流程与复用阵容', '自然语言 compose 选角色、拆任务、生成 YAML；也可直接用内置模板。\n私有角色、Team、步骤 Skills、Prompt Lab；角色安装支持 8 个目标。'),
    ('B  依赖、分支与有界循环', 'depends_on 构建执行图；同层任务可按并发设置运行。\n文本条件 contains / equals；部分分支合流；有限回跳，循环最多 10 次。'),
    ('C  人工输入、检查与恢复', 'human_input 收集信息；approval 记录回答。\nassert 检查结构，acceptance 让模型核验内容；超时、部分错误重试、档案续跑与反馈返工。'),
], y) + GAP
y = row([
    ('D  模型与媒体接入', '支持 API、CLI 登录、本地 Ollama；可按步骤配置模型。\nimage / video / tts / concat 连接生成、配音和合成流程；需要对应服务与运行环境。'),
    ('E  产物、导出与文件落盘', '逐步输出、Markdown / JSON 档案、单文件 HTML 报告。\n导出 docx / pdf / xlsx / pptx / skill / plan；从代码块写出项目文件。'),
    ('F  使用入口与外围集成', 'Web Studio、Electron 桌面、CLI 和 Node 编程 API。\nMCP 提供 6 个工作流工具；社区模板、Webhook 通知；周期触发依赖外部调度。'),
], y) + 33

# 3. Internals: data path with a real feedback loop.
y = section('03', '内部怎样工作：输入 → 调度 → 生成 → 检查 → 归档', y)
y = band('输入层', '完整需求 + 证据材料 + 生产约束 + 模型配置 → 已有 YAML；或者先通过 compose 生成 YAML，再人工审阅。', y, WASH, BLUE) + 28
nodes = [
    ('1  解析 / 校验', '检查字段、角色、变量与依赖；validate / plan 可预查。'),
    ('2  依赖调度', '建图后按层、按批执行；判断条件与人工节点，必要时有限循环。'),
    ('3  组装上下文', '角色 + Skills + 当前任务 + 显式引用的输入 / 上游产出。'),
    ('4  调用连接器', '按配置请求文本模型或媒体服务；记录耗时、状态与可用用量。'),
    ('5  检查 / 保存', '文本先 assert，再 acceptance；记录输出与核验结果，交给下游。'),
]
nw, ng = (CW - 4 * 38) // 5, 38
nh = max(97 + height(body, nw - 42, 28) for title, body in nodes)
for i, (title, body) in enumerate(nodes):
    x = M + i * (nw + ng)
    rect(x, y, nw, nh, SOFT, LINE)
    text(title, x + 21, y + 23, nw - 42, 31, PURPLE, True)
    text(body, x + 21, y + 84, nw - 42, 28)
    if i < 4:
        arrow([(x + nw + 5, y + nh / 2), (x + nw + ng - 5, y + nh / 2)])
loop_y = y + nh + 32
arrow([(W - M - nw / 2, y + nh), (W - M - nw / 2, loop_y),
       (M + nw + ng + nw / 2, loop_y), (M + nw + ng + nw / 2, y + nh)], PURPLE)
y = text('反馈闭环：查看每步产出 → 找到问题步骤 → 旧稿 + 意见定向重做 → 下游使用新结果；此前已完成步骤可复用。', M, loop_y + 26, CW, 28, PURPLE) + 22
y = row([
    ('上下文如何传递', 'output 命名产出，{{变量}} 把它填进后续 task；depends_on 控制执行顺序。\n关键约束需显式传给相关步骤。角色不会自动共享全部需求或拥有长期记忆。'),
    ('检查不是同一种保证', 'assert：结构不符返工一轮，再不符则步骤失败。\nacceptance：内容不符最多返工一轮；仍不通过或验收不可用，可以警告后继续。两者要分别读。'),
], y, [(WASH, BLUE), (SAND, AMBER)]) + 34

# 4. Usage path, grounded in the actual run.
y = section('04', '如何使用：先跑通一条小流程，再加角色和分支', y)
y = row([
    ('① 准备运行条件', 'Node.js ≥20；固定版本源码安装依赖并构建。\n选择 API 凭据、已有 CLI 登录或 Ollama；确认角色与模板可加载。'),
    ('② 把任务说完整', '写清目标、受众、原始材料、禁止事项和交付格式。\n把预算、截止日期、不可猜测字段、通过标准传到相关步骤。'),
    ('③ 预查后再执行', '新手：Studio 选模板、填输入、看分工、运行。\n可复用任务：CLI / API 跑 YAML；先 validate / plan，核对依赖和输入。'),
    ('④ 检查并定点修改', '分别查看执行状态、验收结果和最终内容。\n从问题步骤带反馈续跑，再人工核对、测试或发布；保留具体档案。'),
], y, size=27) + 24
commands = [
    'node dist/cli.js validate workflows/一人公司-做内容.yaml',
    'node dist/cli.js plan workflows/一人公司-做内容.yaml',
    'node dist/cli.js run workflows/一人公司-做内容.yaml -i direction=@brief.txt --provider claude-code',
    'node dist/cli.js run workflows/一人公司-做内容.yaml --resume last --from script --feedback "只录屏，不露脸" --provider claude-code',
]
code_h = 104 + sum(height(cmd, CW - 56, 26) + 10 for cmd in commands) + 70
rect(M, y, CW, code_h, INK)
cy = text('最小命令示例｜在已构建的上游目录执行；brief.txt 放完整需求，Claude CLI 已登录', M + 28, y + 22, CW - 56, 29, '#ffffff', True) + 18
for cmd in commands:
    cy = text(cmd, M + 28, cy, CW - 56, 26, '#d8e5f5') + 10
text('实际案例使用对应的 Node API；多流程共用输出目录时，把 last 换成明确的运行档案路径。', M + 28, cy + 10, CW - 56, 26, '#c2d0df')
y += code_h + 32

# 5. Real case: no fictional model success.
y = section('05', '实际场景：一个人做 AI 办公账号，五个角色接力', y, '真实调用 · 含人工发现偏差后的续跑')
y = text('需求：下班前十分钟｜职场新人｜不露脸｜每天最多 30 分钟｜4 周 12 条｜首条演示“会议笔记 → 待办表”', M, y, CW, 29) + 24
stages = [
    ('老板', '定位与差异化\n首轮 54.5 秒 · 复用'),
    ('用户研究员', '两类画像 / 痛点假设\n首轮 75.5 秒 · 复用'),
    ('内容策划', '10 个选题 / 冷启动次序\n首轮 75.7 秒 · 复用'),
    ('编导', '口播 / 提示词 / 样例表\n返工 62.7 秒 · 重做'),
    ('运营', '12 次发布 / 复盘规则\n返工 62.8 秒 · 重做'),
]
sw = (CW - 4 * 28) // 5
sh = 183
for i, (title, body) in enumerate(stages):
    x = M + i * (sw + 28)
    rect(x, y, sw, sh, MINT if i < 3 else SOFT, LINE)
    text(title, x + 23, y + 22, sw - 46, 33, GREEN if i < 3 else PURPLE, True)
    text(body, x + 23, y + 83, sw - 46, 26)
    if i < 4:
        arrow([(x + sw + 3, y + sh / 2), (x + sw + 25, y + sh / 2)], GREEN)
y += sh + 24
y = row([
    ('首轮：329.9 秒，完成 5 / 5 步', '模型验收：选题和日历均通过。人工却发现脚本要求真人出镜，日期把 2026-09-21 标成星期日。\n编导任务只引用选题库，未直接带完整原始需求，也未配置 acceptance。'),
    ('返工：125.4 秒，复用 3 步 / 重做 2 步', '给编导旧稿和明确反馈，下游运营使用新脚本。出镜方式与 12 个日期已修正。\n仍有口播过长、无来源平台判断、“做完12条”的过早复盘与工作量遗漏，需人工再处理。'),
], y, [(SAND, AMBER), (MINT, GREEN)]) + 16
y = text('这验证了：角色接力、产物留档和局部返工。没有验证：真实账号增长、30 分钟产能、视频生成，或优于单次提示词。', M, y, CW, 26, MUTED) + 31

# 6. Limits: priority on exact observed semantics.
y = section('06', '限制与边界：避免把编排能力误认成结果保证', y)
y = row([
    ('工具与事实边界', '角色提示词中的 tools 不会自动授予搜索、数据库或业务系统权限；给 URL 不等于已读取网页。\n通用文本路径没有自动检索循环。应先准备可靠材料，外部事实需独立核对。'),
    ('审批与验收边界', 'approval 只读取回答：输入 no 也可能继续，须给下游加明确条件。\nacceptance 返工后不再重跑 assert：可能内容过了、结构却坏了，需最终独立检查。'),
    ('并发与资源边界', '顶层 provider 为 CLI 时并发降为 1；API 并发受配置、限流和依赖影响。\n重试不是无限恢复；--budget 是模型分配策略，不是费用硬上限。用量字段可能不完整。'),
], y, [(SAND, AMBER)] * 3) + GAP
y = row([
    ('执行与媒体边界', 'Claude Code 文本连接器关闭工具；Codex CLI 使用只读沙箱。文件落盘不代表已运行测试或部署。\n媒体需服务；合成需 ffmpeg，concat 无验收/断言；视频验收失败默认不重生成。'),
    ('运行环境与数据边界', 'Studio 是本地单用户服务，不能直接当多租户企业平台；密钥保存在本地不等于推理在本地。\nCLI 复用登录仍有账号与额度条件；本地模型需要算力。GitHub Pages 仅承载静态结果。'),
    ('格式与质量边界', 'PDF 依赖外部排版工具，缺失时回退 HTML；Excel 主要提取 Markdown 表格。\n多角色可能放大遗漏、增加时间与成本。作者有限评测有输有赢，不能推断普遍质量提升。'),
], y, [(SAND, AMBER)] * 3) + 34

# 7. Meaning, fit and a recommended adoption path.
y = section('07', '有什么意义：把一次生成，变成可检查的工作过程', y)
y = row([
    ('适合使用的地方', '固定输入、多个分工、明确交付、需要追溯和经常返工的重复任务。\n例如内容策划、PRD 拆解、多角度评审、已有证据材料的研究汇总、媒体生产流程。'),
    ('不宜直接托付的地方', '一次简单问答；缺少真实证据的研究；要求自动联网、执行代码或操作业务系统的任务。\n严格审批、强权限治理、高风险结论和确定性结果，需要额外机制与人工责任。'),
    ('对我们最有价值的用法', '来源材料 → 能力提取 → 架构 / 限制评审 → 中文交付 → 人工核对。\n先固定证据包和小流程；与强单次提示词比较事实错误、来源、用时、用量和修订量，再扩展。'),
], y, [(WASH, BLUE), (WASH, BLUE), (SOFT, PURPLE)]) + 30

# 8. Evidence is part of the diagram, not a hidden disclaimer.
y = section('08', '我们的证据到哪里：确认、实测与未验证分开看', y)
y = row([
    ('源码确认 + 选定核心测试', '构建完成；10 组纯函数 / Mock 测试，158 项通过。\n额外实验确认 approval 的 no 不自动阻断、验收后断言缺口，以及 API / CLI 并发表现。非全量测试。'),
    ('一次真实场景 + 一次定向返工', '原始“做内容”模板未修改；Claude Code 2.1.90，未指定模型，记录未返回精确模型名。\n共两轮生成记录，保留逐步原文和反馈；人物画像与运营目标属于未验证假设。'),
    ('仍待实测的部分', '自动组队质量、其他供应商兼容、Studio / 桌面完整交互、媒体生成、导出排版与外部集成。\n尚未做同条件质量对照、真人制作计时、真实运营实验、长期可靠性或完整安全审计。'),
], y, [(WASH, BLUE), (MINT, GREEN), (WASH, MUTED)], size=27) + 26
y = band('核心判断', 'AO 的已证实价值在流程组织、材料传递、产物追溯和定点返工。要获得可靠交付，仍需把约束写进步骤、把证据提供给模型，并独立检查最终结果。', y, INK, '#ffffff', '#ffffff')
y += 27
footer = '来源：jnMetaCode/agency-orchestrator @ 1f36dba95ef70 · 本项目 capabilities.md / notes.md / cases/content-launch/{run,revision}.json'
y = text(footer, M, y, CW, 23, MUTED) + 8
y = text('这是本研究整理的能力解释图，非官方界面截图。数字仅适用于研究快照；完整原文与复现说明见 003 子项目和案例网页。', M, y, CW, 23, MUTED) + 37

H = int(y)
assert H <= canvas.height
assert max(b[3] for b in bounds) < H
ASSETS.mkdir(exist_ok=True)
png = ASSETS / 'capability-summary.png'
canvas.crop((0, 0, W, H)).save(png, optimize=True)
description = 'Agency Orchestrator 的定位、六类能力、内部流程、使用路径、真实案例、限制、价值与证据范围。'
header = f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-labelledby="title desc"><title id="title">Agency Orchestrator 能力与使用全景图</title><desc id="desc">{description}</desc><rect width="100%" height="100%" fill="#fff"/><g font-family="Microsoft YaHei, PingFang SC, Noto Sans CJK SC, sans-serif">'
(ASSETS / 'capability-summary.svg').write_text(header + ''.join(svg) + '</g></svg>\n', encoding='utf-8')
(ASSETS / 'capability-summary-text.md').write_text('# Agency Orchestrator 能力与使用全景图：文字版\n\n' + '\n\n'.join(dict.fromkeys(texts)) + '\n', encoding='utf-8')
(ASSETS / 'capability-summary-layout.json').write_text(json.dumps({'width': W, 'height': H, 'text_lines': len(bounds), 'content_blocks': len(texts), 'text_within_canvas': True, 'generator': 'web/render_summary.py', 'upstream_commit': '1f36dba95ef70a0f3c3559cac16acd9898622ad9'}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Rendered {png}: {W} x {H}; {len(bounds)} text lines')
