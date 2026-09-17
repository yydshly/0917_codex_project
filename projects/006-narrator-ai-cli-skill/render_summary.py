"""Render the original research diagram as editable SVG and PNG (Pillow)."""
from pathlib import Path
from html import escape
import math
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'assets'
W, H = 2160, 3140
BG, INK, MUTED = '#F4F7FB', '#17263D', '#4B5D74'
BLUE, TEAL, PURPLE, AMBER = '#2859B8', '#087E83', '#7350AD', '#A76213'
im = Image.new('RGB', (W, H), BG)
d = ImageDraw.Draw(im)
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">',
       '<title>Narrator AI CLI Skill：从素材到解说视频的能力与约束全景</title>',
       '<desc>按角色、素材准备、任务交互、约束边界和成品五部分阅读。原创研究说明图，未运行云端生成。</desc>',
       f'<rect width="{W}" height="{H}" fill="{BG}"/>']
regular = 'C:/Windows/Fonts/msyh.ttc'
bold = 'C:/Windows/Fonts/msyhbd.ttc'

def font(size, heavy=False):
    return ImageFont.truetype(bold if heavy else regular, size)

def text(x, y, value, size=29, color=INK, heavy=False):
    f = font(size, heavy)
    width = d.textlength(value, font=f)
    assert x + width <= W - 40, (value, x + width)
    d.text((x, y), value, font=f, fill=color, anchor='lt')
    svg.append(f'<text x="{x}" y="{y}" dominant-baseline="text-before-edge" font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-size="{size}" font-weight="{700 if heavy else 400}" fill="{color}">{escape(value)}</text>')

def rect(x, y, w, h, fill='white', stroke=None, radius=20):
    d.rounded_rectangle((x, y, x+w, y+h), radius, fill=fill, outline=stroke, width=2)
    svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke or "none"}" stroke-width="2"/>')

def line(points, color=MUTED, width=3, arrow=False, dashed=False):
    if dashed:
        for a, b in zip(points, points[1:]):
            distance = math.dist(a, b)
            for start in range(0, int(distance), 18):
                end = min(start+10, distance)
                d.line([(a[0]+(b[0]-a[0])*t/distance, a[1]+(b[1]-a[1])*t/distance) for t in (start,end)], fill=color, width=width)
    else:
        d.line(points, fill=color, width=width, joint='curve')
    dash = ' stroke-dasharray="10 8"' if dashed else ''
    svg.append(f'<polyline points="{" ".join(f"{x},{y}" for x,y in points)}" fill="none" stroke="{color}" stroke-width="{width}"{dash}/>')
    if arrow:
        a,b = points[-2:]
        angle = math.atan2(b[1]-a[1], b[0]-a[0])
        pts = [b, (b[0]-16*math.cos(angle-.45),b[1]-16*math.sin(angle-.45)), (b[0]-16*math.cos(angle+.45),b[1]-16*math.sin(angle+.45))]
        d.polygon(pts, fill=color)
        svg.append(f'<polygon points="{" ".join(f"{x},{y}" for x,y in pts)}" fill="{color}"/>')

def lines(x, y, values, size=29, color=MUTED, gap=47):
    for i, value in enumerate(values):
        text(x, y+i*gap, value, size, color)

def section(y, number, title, subtitle):
    rect(80,y,56,52,INK,radius=12)
    text(95,y+7,number,29,'white',True)
    text(155,y+2,title,38,INK,True)
    text(155,y+60,subtitle,27,MUTED)

def box(x,y,w,h,title,body,color,fill):
    rect(x,y,w,h,fill)
    rect(x,y,8,h,color,radius=3)
    text(x+26,y+24,title,33,color,True)
    lines(x+26,y+83,body,28,gap=45)

text(80,55,'006 / 项目研究 · NARRATOR AI CLI SKILL',27,BLUE,True)
text(80,110,'从素材到解说视频：谁在做，怎样做？',64,INK,True)
text(80,207,'把我们的理解串起来：用户提出目标，助手按规则组织步骤，云端完成制作。',32,MUTED)
rect(80,277,2000,132,INK)
text(112,300,'这个库的核心能力 = 提供“素材 → 成品”的操作方法、接口知识与流程约束',38,'white',True)
text(112,359,'Skill 是操作手册；CLI 是调用工具；真正的文案、配音和视频处理由服务端执行。',29,'#D9E5F4')

section(454,'01','先分清四个角色','Skill 约束助手怎样操作；它本身不负责上传文件、推理模型或渲染视频。')
xs=[80,595,1110,1625]
box(xs[0],567,455,250,'Skill · 操作手册',['有哪些能力、怎么调用','先做什么、需要什么输入','参数规则、确认与异常处理'],PURPLE,'#EEE8F7')
box(xs[1],567,455,250,'AI 助手 · 安排工作',['理解用户要求并选择路线','选素材、风格、声音与音乐','读结果，决定下一步'],BLUE,'#E8EFFB')
box(xs[2],567,455,250,'CLI · 传递请求',['把参数变成 API 请求','上传文件、提交和查询任务','把状态与产物返回给助手'],TEAL,'#E1F1F1')
box(xs[3],567,455,250,'服务端 · 执行制作',['按接口参数创建处理任务','调用模型与媒体处理程序','生成文案、音频和视频'],AMBER,'#FBF0DF')
for i,label in enumerate(['指导','调用','请求']):
    line([(xs[i]+455,686),(xs[i+1]-9,686)], [PURPLE,BLUE,TEAL][i],4,True,i==0)
    text(xs[i]+460,644,label,22,MUTED)
rect(80,847,2000,83,'white')
text(109,871,'用户 → AI 助手：“把这部电影做成中文幽默解说，选男声，最后输出竖屏视频。”',32,INK)

section(971,'02','素材从哪里来？先拿到可引用的文件','平台素材和用户素材是两条入口；搜到电影资料，并不等于拿到了电影文件。')
rect(80,1083,2000,356,'white')
text(110,1103,'A  使用平台素材',29,TEAL,True)
for x,w,t in [(420,405,'客户端查询素材目录'),(910,450,'取得视频＋字幕 file_id'),(1445,585,'直接作为后续任务的输入')]:
    rect(x,1098,w,62,'#E1F1F1',radius=12)
    text(x+18,1112,t,27,TEAL)
line([(825,1129),(900,1129)],TEAL,3,True)
line([(1360,1129),(1435,1129)],TEAL,3,True)
text(110,1190,'B  上传自己的素材（由客户端完成以下过程）',29,BLUE,True)
nodes=[(110,'本地视频＋SRT','准备文件'),(505,'申请上传地址','平台返回预签名 URL'),(900,'上传到对象存储','客户端发送文件内容'),(1295,'回调确认上传','通知平台文件已就绪'),(1690,'取得 file_id','后续按 ID 引用')]
for i,(x,t,b) in enumerate(nodes):
    rect(x,1243,360,112,'#E8EFFB',radius=14)
    text(x+18,1258,t,29,BLUE,True)
    text(x+18,1303,b,25,MUTED)
    if i<4: line([(x+360,1298),(x+386,1298)],BLUE,3,True)
text(110,1383,'素材确认后，再选择解说风格、音色和 BGM；文件上传一次，后续任务引用文件编号。',29,MUTED)

section(1482,'03','客户端与服务端怎样配合？每个制作步骤都走这个循环','助手安排调用；客户端发送参数；服务端处理；返回结果后，助手继续下一步。')
rect(80,1594,2000,655,'white')
box(110,1615,460,164,'AI 助手',['按 Skill 组织本步骤参数'],BLUE,'#E8EFFB')
box(775,1615,460,164,'CLI 客户端',['JSON 参数＋API Key'],TEAL,'#E1F1F1')
box(1440,1615,610,164,'服务端 API',['检查请求，创建异步处理任务'],AMBER,'#FBF0DF')
line([(570,1680),(765,1680)],BLUE,3,True)
text(610,1635,'调用命令',25)
line([(1235,1680),(1430,1680)],TEAL,3,True)
text(1263,1635,'提交任务',25)
line([(1745,1779),(1745,1818),(1005,1818),(1005,1779)],AMBER,3,True)
text(1210,1784,'返回 task_id（任务编号）',24,AMBER)
text(110,1840,'客户端用 task_id 查询 → 服务端返回进度／错误／完成结果 → 助手读取并决定下一步',25,INK)

rect(110,1876,1940,203,'#F5F7FA',radius=16)
text(135,1894,'服务端按任务逐步执行的制作链',28,AMBER,True)
stages=[(135,405,'生成解说文案','影片资料／字幕＋风格'),(610,405,'生成剪辑数据','文案＋视频／字幕＋音色／BGM'),(1085,405,'合成视频','按剪辑数据完成成片'),(1560,465,'视觉包装 · 可选','标题、字幕样式、版式、分集')]
for i,(x,w,t,b) in enumerate(stages):
    rect(x,1949,w,104,'white',radius=12)
    text(x+16,1960,t,28,INK,True)
    text(x+16,2007,b,22,MUTED)
    if i<3: line([(x+w,1999),(stages[i+1][0]-8,1999)],AMBER,3,True)
text(110,2100,'两条路线：原创文案 → 快速剪辑 → 合成；参考风格／二创文案 → 剪辑 → 合成。',28,INK)
text(110,2146,'结果传递：file_id 引用文件；task_id 查询进度；task_order_num 关联制作任务。',27,MUTED)
text(110,2190,'必须等前置步骤完成；两条路线用于合成的关联编号不同，Skill 会说明如何传递。',27,MUTED)

section(2292,'04','约束怎样起作用？要分清“指导”与“强制检查”','约束制作过程可以减少操作错误，但不能单靠规则保证视频一定好看。')
box(80,2406,640,282,'Skill：指导助手遵守',['素材 ID 来自真实查询／上传','文案、音色、标题语言一致','按顺序执行，并确认资源选择','失败后处理，不擅自更换路线'],PURPLE,'#EEE8F7')
box(760,2406,640,282,'程序：检查已实现的条件',['CLI：任务名、JSON 等检查','服务端：鉴权、参数与额度等','不满足条件时返回错误','并非所有 Skill 规则都有代码校验'],TEAL,'#E1F1F1')
box(1440,2406,640,282,'效果：还取决于实际处理',['素材和字幕是否准确、完整','云端文案、配音与剪辑的质量','助手是否正确遵守流程','具体后端算法未完整公开'],AMBER,'#FBF0DF')

rect(80,2730,2000,255,INK)
text(112,2752,'05   最后得到什么？',37,'white',True)
text(112,2814,'解说稿  ＋  原片画面  ＋  配音／字幕／BGM  →  成品 MP4 下载链接',38,'white',True)
text(112,2874,'可选：视觉模板、横竖屏布局与分集；独立能力还包括声音克隆和文字转语音。',29,'#D9E5F4')
text(112,2924,'最准确的理解：这个库提供从输入到成品的操作方法与规则，云端服务提供实际制作能力。',28,'#D9E5F4')
text(80,3026,'本研究原创说明图 · 2026-09-17 · Skill 4b17c6f / CLI 2d8bb14 · 依据公开文档与源码整理',25,MUTED)
text(80,3070,'未调用云端生成：图中展示逻辑流程，非运行截图；成片质量、耗时和费用尚待实测。',25,MUTED)

svg.append('</svg>')
OUT.mkdir(exist_ok=True)
(OUT/'capability-summary.svg').write_text('\n'.join(svg),encoding='utf-8')
im.save(OUT/'capability-summary.png',optimize=True)
print(f'Rendered {W} x {H}: {OUT / "capability-summary.png"}')
