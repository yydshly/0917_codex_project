"""Author a precise Chinese explanatory poster as PNG, SVG, and plain text.

This is our source-based diagram, not an upstream screenshot or model benchmark.
Pillow and Microsoft YaHei are only needed to regenerate the exported images.
"""
from pathlib import Path
from html import escape
import math
import re
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
ASSETS = HERE.parent / "assets"
W, M, GAP = 2400, 80, 24
CW = W - M * 2
INK, MUTED, GREEN, LINE = "#21382e", "#54685c", "#175c4c", "#cbd6c7"
PAPER, WHITE, MINT = "#f7f7f0", "#ffffff", "#e9efdf"
BLUE, BLUEWASH = "#355f84", "#edf2f6"
AMBER, SAND = "#8a542e", "#f6eee1"
canvas = Image.new("RGB", (W, 5000), PAPER)
draw = ImageDraw.Draw(canvas)
svg, transcript, bounds = [], [], []
fonts = {}


def font(size, bold=False):
    key = size, bold
    if key not in fonts:
        fonts[key] = ImageFont.truetype("C:/Windows/Fonts/msyhbd.ttc" if bold else "C:/Windows/Fonts/msyh.ttc", size)
    return fonts[key]


def wrap(value, width, size, bold=False):
    result = []
    for paragraph in value.split("\n"):
        line = ""
        for token in re.findall(r"[A-Za-z0-9_./:+<>=-]+|[^\n]", paragraph):
            if line and draw.textlength(line + token, font=font(size, bold)) > width:
                result.append(line.rstrip())
                line = token.lstrip()
            else:
                line += token
        result.append(line.rstrip())
    return result


def text(value, x, y, width, size=30, color=INK, bold=False):
    transcript.append(value)
    for line in wrap(value, width, size, bold):
        measured = draw.textlength(line, font=font(size, bold))
        assert measured <= width + 1, (line, measured, width)
        assert 0 <= x and x + measured <= W, (line, x)
        draw.text((x, y), line, font=font(size, bold), fill=color, anchor="lt")
        svg.append(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{700 if bold else 400}" fill="{color}" dominant-baseline="text-before-edge">{escape(line)}</text>')
        bounds.append(y + size)
        y += round(size * 1.5)
    return y


def rect(x, y, w, h, fill=WHITE, stroke=LINE, radius=12):
    draw.rounded_rectangle((x, y, x + w, y + h), radius=radius, fill=fill, outline=stroke, width=2)
    svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke or "none"}" stroke-width="2"/>')


def line(points, color=LINE, width=3):
    draw.line(points, fill=color, width=width)
    svg.append(f'<polyline points="{" ".join(f"{x},{y}" for x,y in points)}" fill="none" stroke="{color}" stroke-width="{width}"/>')


def arrow(points, color=GREEN):
    line(points, color, 4)
    x, y = points[-1]
    px, py = points[-2]
    a = math.atan2(y - py, x - px)
    pts = [(x, y), (x - 13 * math.cos(a - .48), y - 13 * math.sin(a - .48)), (x - 13 * math.cos(a + .48), y - 13 * math.sin(a + .48))]
    draw.polygon(pts, fill=color)
    svg.append(f'<polygon points="{" ".join(f"{px},{py}" for px,py in pts)}" fill="{color}"/>')


def section(num, title, y, subtitle):
    line([(M, y), (W - M, y)])
    text(num, M, y + 26, 85, 29, GREEN, True)
    text(title, M + 98, y + 20, CW - 98, 44, INK, True)
    text(subtitle, M + 98, y + 91, CW - 98, 27, MUTED)
    return y + 155


def card(x, y, w, h, tag, title, body, fill=WHITE, accent=GREEN, size=29):
    rect(x, y, w, h, fill)
    ty = text(tag, x + 26, y + 22, w - 52, 23, accent, True)
    ty = text(title, x + 26, ty + 8, w - 52, 35, accent, True)
    ty = text(body, x + 26, ty + 17, w - 52, size, INK)
    assert ty <= y + h - 10, (title, ty, y + h)


# Title and purpose.
rect(0, 0, W, 302, GREEN, None, 0)
text("开源研究集  /  004  /  作用、能力与技术原理", M, 35, CW, 28, "#dce8d4")
text("PONYTAIL", M, 96, CW, 82, WHITE, True)
text("先理解，先复用，再写必要的新代码。", M, 216, CW, 43, WHITE, True)
y = text("读图顺序：看价值 → 分清接入路径 → 理解模型决策 → 用案例核对 → 识别约束边界", M, 335, CW, 29, MUTED) + 30

# Capability strip.
y = section("01", "它的作用：减少重复实现与过度设计", y, "核心是工程规则 Skill；读代码、改代码和运行检查，仍由宿主 AI 助手完成。")
col = (CW - GAP * 2) // 3
card(M, y, col, 238, "开发前 / ponytail", "先找已有能力", "复用项目代码、标准库、原生功能与已有依赖，缺什么再补什么。", MINT)
card(M + col + GAP, y, col, 238, "审查 / review · audit", "找出可删的复杂度", "检查当前改动或整个仓库，给出删除与替代建议；默认不应用修改。", BLUEWASH, BLUE)
card(M + (col + GAP) * 2, y, col, 238, "跟踪 / debt", "把刻意简化留下记录", "汇总 ponytail: 注释中的局限与升级条件；未标记的债务不会自动出现。", WHITE)
y += 267
text("辅助入口：gain 展示历史评测，help 提供帮助。它们不实时测量当前项目的质量或节省量。", M, y, CW, 25, MUTED)
y += 75

# The key distinction: parallel access routes, not five serial steps.
y = section("02", "整体构成：一套原则，多条送达路径", y, "插件是打包与注册机制，可同时包含 Skill 和 Hooks；规则文件与 MCP 是另外的接入方式。")
lane_w = (CW - 3 * GAP) // 4
lane_h = 357
lanes = [
    ("A  按需调用", "Skill", "宿主发现 name / description\n用户调用或宿主按任务选择\n加载 SKILL.md 正文", WHITE, GREEN),
    ("B  自动激活", "插件 + Hooks", "插件登记技能与事件脚本\n事件触发 → 读取模式与 Skill\n构建规则 → 输出宿主上下文", MINT, GREEN),
    ("C  静态约定", "规则文件", "AGENTS.md / 宿主规则目录\n保存核心原则的紧凑版本\n由宿主按自己的约定读取", WHITE, GREEN),
    ("D  协议取用", "MCP", "请求 Prompt 或规则工具\n共用构建器 → 返回规则文本\n由宿主提供给模型", BLUEWASH, BLUE),
]
centers = []
for i, (tag, title, body, fill, accent) in enumerate(lanes):
    x = M + i * (lane_w + GAP)
    card(x, y, lane_w, lane_h, tag, title, body, fill, accent, 28)
    centers.append(x + lane_w / 2)
bus_y = y + lane_h + 40
for cx in centers:
    line([(cx, y + lane_h), (cx, bus_y)], GREEN, 4)
line([(centers[0], bus_y), (centers[-1], bus_y)], GREEN, 4)
arrow([(W / 2, bus_y), (W / 2, bus_y + 43)])
context_y = bus_y + 44
rect(M, context_y, CW, 147, GREEN, None)
text("汇合点：宿主的模型上下文", M + 29, context_y + 22, CW - 58, 37, WHITE, True)
text("Ponytail 规则 + 用户需求 + 项目约定 + 已读取的代码与工具结果", M + 29, context_y + 86, CW - 58, 30, "#dce8d4")
y = context_y + 174
text("不必全部安装或叠加。规则内容相通，但加载时机、模式管理与子代理支持随宿主而异。", M, y, CW, 27, MUTED)
y += 72

# Mechanism detail: what executes and what is model guidance.
y = section("03", "技术原理：程序送达规则，模型完成判断", y, "以下为插件 + Hooks 路径；只调用 Skill 或读取静态规则时，不必经过同一套 Node.js 脚本。")
steps = [
    ("1  读取配置", "环境变量 → 配置文件 → full\n写入当前模式状态"),
    ("2  构建正文", "读取 Skill，去掉文件头\n筛选当前强度示例，保留边界"),
    ("3  宿主接收", "Hook 输出文本或宿主 JSON\n宿主识别后加入上下文"),
    ("4  模型行动", "用原有搜索、编辑、终端工具\n阅读代码 → 选择 → 实现与验证"),
]
step_gap = 36
step_w = (CW - 3 * step_gap) // 4
for i, (title, body) in enumerate(steps):
    x = M + i * (step_w + step_gap)
    rect(x, y, step_w, 192, WHITE)
    ty = text(title, x + 24, y + 21, step_w - 48, 33, GREEN, True)
    end = text(body, x + 24, ty + 13, step_w - 48, 27)
    assert end <= y + 184
    if i < 3:
        arrow([(x + step_w + 4, y + 92), (x + step_w + step_gap - 5, y + 92)])
y += 223
text("模型遵循的决策阶梯", M, y, CW, 33, GREEN, True)
y += 61
labels = ["需求必要？", "仓库已有？", "标准库？", "平台原生？", "现有依赖？", "简短实现？", "必要新代码"]
lgap = 28
lw = (CW - lgap * 6) // 7
for i, label in enumerate(labels):
    x = M + i * (lw + lgap)
    rect(x, y, lw, 119, MINT if i < 6 else GREEN, None)
    text(f"0{i+1}", x + 20, y + 15, lw - 40, 23, GREEN if i < 6 else "#dce8d4")
    text(label, x + 20, y + 57, lw - 40, 28, INK if i < 6 else WHITE, True)
    if i < 6:
        arrow([(x + lw + 3, y + 63), (x + lw + lgap - 4, y + 63)])
y += 147
text("前提：先理解真实代码与调用链。停止条件：第一个满足明确需求的方案就采用。", M, y, CW, 29, INK, True)
y += 55
text("这是给模型的自然语言决策指导，不是自动搜索并强制选出答案的算法，也没有修改或训练模型权重。", M, y, CW, 26, MUTED)
y += 75

# A concrete two-branch example.
y = section("04", "一个场景：给研究任务清单增加日期筛选", y, "同一需求，根据已有能力选不同路径；这是教学示例，不是启用前后的模型对照结果。")
request_w, route_w, out_w = 442, 918, 716
x2 = M + request_w + 72
x3 = x2 + route_w + 68
rect(M, y + 44, request_w, 209, WHITE)
ty = text("需求", M + 25, y + 64, request_w - 50, 25, GREEN, True)
text("按所选日期筛选任务。\n清空后恢复全部列表。", M + 25, ty + 14, request_w - 50, 31)
rect(x2, y, route_w, 130, MINT)
text("项目已有合适的 DateFilter", x2 + 25, y + 18, route_w - 50, 30, GREEN, True)
text("停在第 2 步：复用组件，接入现有列表。", x2 + 25, y + 75, route_w - 50, 27)
rect(x2, y + 160, route_w, 130, BLUEWASH)
text("没有日期组件，但原生控件满足需求", x2 + 25, y + 178, route_w - 50, 30, BLUE, True)
text("停在第 4 步：日期输入框 + 现有过滤逻辑。", x2 + 25, y + 235, route_w - 50, 27)
branch_x = M + request_w + 35
line([(M + request_w, y + 148), (branch_x, y + 148)])
arrow([(branch_x, y + 148), (branch_x, y + 65), (x2 - 5, y + 65)])
arrow([(branch_x, y + 148), (branch_x, y + 225), (x2 - 5, y + 225)], BLUE)
rect(x3, y + 19, out_w, 254, GREEN, None)
text("交付完整需求", x3 + 25, y + 42, out_w - 50, 35, WHITE, True)
text("日期输入 · 清空 · 数量 · 空状态\n避免重复造组件或新增日历库\n复杂需求出现时，重新判断方案", x3 + 25, y + 109, out_w - 50, 28, "#dce8d4")
merge_x = x2 + route_w + 30
line([(x2 + route_w, y + 65), (merge_x, y + 65), (merge_x, y + 225), (x2 + route_w, y + 225)])
arrow([(merge_x, y + 146), (x3 - 5, y + 146)])
y += 333

# Guardrails and evidence.
y = section("05", "约束边界：少写代码，不能少做必要的事", y, "明确需求、安全、输入校验、数据保护、无障碍，以及必要的可运行检查，都不能因精简被省略。")
half = (CW - GAP) // 2
card(M, y, half, 242, "程序层面 / 可确定性检查", "模式、文本与送达机制", "配置解析、状态文件、规则过滤、输出格式可以测试；这些检查不等于验证模型的开发质量。", MINT, GREEN, 28)
card(M + half + GAP, y, half, 242, "模型层面 / 需要验收", "工程判断仍是软约束", "是否读全代码、正确复用、保留边界，由模型执行；共用 Hooks 不会审核每次补丁并阻止违规写入。", SAND, AMBER, 28)
y += 271
rect(M, y, CW, 154, WHITE)
text("本研究证据", M + 25, y + 20, 260, 28, GREEN, True)
text("源码核查 + 3 项 MCP 指令测试 + 7 步隔离 Hook 验证；没有运行真实宿主中的模型开发对照。", M + 300, y + 20, CW - 325, 27)
text("验证观察：普通请求不一定重发规则；切换模式不等于重载全文；off 不会删除已有对话上下文。", M + 25, y + 96, CW - 50, 26, MUTED)
y += 183
line([(M, y), (W - M, y)])
y = text("研究快照 4.10.0 · e3ba2aa6f1e6 · 2026-09-17  |  上游 DietrichGebert/ponytail · MIT", M, y + 23, CW, 24, MUTED)
y = text("本研究原创说明图，依据固定版本 Skill、插件、Hooks、MCP 源码与隔离实验整理；非软件截图，非效果承诺。", M, y + 8, CW, 23, MUTED)
H = int(y + 38)
assert max(bounds) < H < canvas.height
ASSETS.mkdir(parents=True, exist_ok=True)
canvas.crop((0, 0, W, H)).save(ASSETS / "capability-summary.png", optimize=True)
header = f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-labelledby="title desc"><title id="title">Ponytail 作用、能力与技术原理全景图</title><desc id="desc">核心工程规则通过 Skill、插件 Hooks、静态规则或 MCP 四条接入路径进入宿主模型上下文；模型读取项目、按七级阶梯选择方案、实现并验证。包含日期筛选案例及软约束边界。</desc><rect width="100%" height="100%" fill="{PAPER}"/><g font-family="Microsoft YaHei, PingFang SC, sans-serif">'
(ASSETS / "capability-summary.svg").write_text(header + "\n".join(svg) + "</g></svg>", encoding="utf-8", newline="\n")
(ASSETS / "capability-summary-text.md").write_text("# Ponytail 全景图文字版\n\n" + "\n\n".join(transcript) + "\n", encoding="utf-8", newline="\n")
print(f"Rendered Ponytail overview: {W} x {H}; PNG, SVG, and text saved.")
