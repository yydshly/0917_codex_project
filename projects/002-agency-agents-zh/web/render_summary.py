"""Render the authored infographic as a high-resolution PNG (Pillow + Windows fonts).

The HTML is the content source; this is a diagram renderer, not an app screenshot.
Run build.py first. This optional export step is not needed by the site build.
"""
from html.parser import HTMLParser
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
SCALE = 2
WIDTH = 1440
INK, MUTED, GREEN = '#18352e', '#526b61', '#24654e'
LINE, WASH, DARK = '#cedbd3', '#f1f6f2', '#183c32'


class Node:
    def __init__(self, tag='', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []

    def text(self):
        return ''.join(c.text() if isinstance(c, Node) else c for c in self.children).strip()

    def find(self, tag=None, cls=None):
        result = []
        for child in self.children:
            if isinstance(child, Node):
                if (tag is None or child.tag == tag) and (cls is None or cls in child.attrs.get('class', '').split()):
                    result.append(child)
                result.extend(child.find(tag, cls))
        return result


class Document(HTMLParser):
    def __init__(self):
        super().__init__(); self.root = Node(); self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        if tag == 'br':
            self.stack[-1].children.append('\n'); return
        node = Node(tag, attrs); self.stack[-1].children.append(node)
        if tag not in {'meta', 'link', 'img', 'input', 'hr'}:
            self.stack.append(node)

    def handle_endtag(self, tag):
        if len(self.stack) > 1 and self.stack[-1].tag == tag:
            self.stack.pop()

    def handle_data(self, data):
        self.stack[-1].children.append(data)


doc = Document(); doc.feed((HERE / 'capability-summary.html').read_text(encoding='utf-8'))
root = doc.root
catalog = json.loads((HERE / 'catalog.json').read_text(encoding='utf-8'))
canvas = Image.new('RGB', (WIDTH*SCALE, 4200*SCALE), 'white')
draw = ImageDraw.Draw(canvas)
fonts = {}


def font(size, bold=False):
    key = (size, bold)
    if key not in fonts:
        fonts[key] = ImageFont.truetype('C:/Windows/Fonts/msyhbd.ttc' if bold else 'C:/Windows/Fonts/msyh.ttc', size*SCALE)
    return fonts[key]


def text(value, x, y, size=20, color=INK, bold=False, width=1300):
    current, lines = '', []
    for char in value:
        if char == '\n':
            lines.append(current); current = ''; continue
        if draw.textlength(current + char, font=font(size, bold)) > width*SCALE and current and char not in '。，；：！？、）”':
            lines.append(current); current = char
        else:
            current += char
    if current: lines.append(current)
    for line in lines:
        draw.text((x*SCALE,y*SCALE), line, font=font(size,bold), fill=color, anchor='lt')
        y += size*1.65
    return y


def rect(x,y,w,h,color,outline=None):
    draw.rectangle((x*SCALE,y*SCALE,(x+w)*SCALE,(y+h)*SCALE),fill=color,outline=outline,width=2)


def heading(index, title, y):
    text(index,54,y,22,GREEN); text(title,99,y,27,bold=True)
    return y+54


y=42
text('开源研究集 / 002 · 能力理解图',54,y,16,MUTED)
text('身份与方法 → 按需选用 → 后续编排',985,y,16,MUTED)
y=98
text('Agency Agents 中文版',54,y,49,bold=True)
text('它提供什么，覆盖什么，对我有什么价值？',54,y+71,27)
rect(1100,y,286,100,WASH); rect(1100,y,4,100,GREEN)
text('当前研究结论',1119,y+17,17,MUTED)
text('内容已梳理 · 增益待验证',1119,y+53,20,bold=True,width=258)
y=227
rect(54,y,1332,206,DARK)
text(root.find(cls='core')[0].find('h2')[0].text(),80,y+25,27,'white',True,970)
text(root.find(cls='core')[0].find('p')[0].text(),80,y+73,20,'#dfebe5',width=960)
for i,label in enumerate(['选什么角色','按什么方法工作','交付与检查什么']):
    rect(80+i*264,y+126,230,49,'#254b3d','#6b8c7e')
    text(label,98+i*264,y+138,20,'white')
    if i<2: text('→',316+i*264,y+135,23,'#e3c797')
text(str(sum(len(g['agents']) for g in catalog['divisions'])),1132,y+43,50,'white',True); text('个角色定义',1132,y+104,18,'#dfebe5')
text(f"{len(catalog['divisions'])} 个部门",1132,y+148,24,'white',True)
y+=242
titles=[n.find('h2')[0].text() for n in root.find('section')]
y=heading('01',titles[0],y)
for i,item in enumerate(root.find(cls='feature')):
    x=54+i*449
    rect(x,y,434,146,WASH); rect(x,y,434,3,'#518870')
    text(item.find('h3')[0].text(),x+19,y+19,22,bold=True,width=396)
    text(item.find('p')[0].text(),x+19,y+62,19,MUTED,width=396)
y+=159
y=text(root.find('section')[0].find(cls='small')[0].text(),54,y,17,MUTED,width=1330)+18
y=heading('02',titles[1],y)
for i,item in enumerate(root.find(cls='domain')):
    col,row=i%4,i//4; x=54+col*333; yy=y+row*54
    rect(x,yy,333,54,WASH if row==0 else 'white',LINE)
    text(item.find('span')[0].text(),x+18,yy+14,21)
    text(item.find('strong')[0].text(),x+276,yy+14,22,GREEN,True)
y+=282
rect(54,y,1332,52,'#f7f5ee')
text(root.find(cls='examples')[0].text(),72,y+14,19,'#625638',width=1300)
y+=63
y=text(root.find('section')[1].find(cls='small')[0].text(),54,y,17,MUTED,width=1330)+19
y=heading('03',titles[2],y)
for i,item in enumerate(root.find(cls='value')):
    x=54+(i%2)*674; yy=y+(i//2)*156
    rect(x,yy,658,140,'white',LINE)
    text(item.find('h3')[0].text(),x+20,yy+18,23,bold=True,width=618)
    text(item.find('p')[0].text(),x+20,yy+61,19,MUTED,width=618)
y+=320
rect(54,y,1332,90,WASH)
for i,item in enumerate(root.find(cls='personal-flow')[0].find('div')):
    x=91+i*333
    label=item.text().replace(item.find('small')[0].text(),'')
    text(label,x,y+16,22,GREEN,True,width=220)
    text(item.find('small')[0].text(),x,y+54,16,MUTED)
    if i<3: text('→',x+251,y+30,25,GREEN)
y+=103
y=text(root.find('section')[2].find(cls='small')[0].text(),54,y,17,MUTED,width=1330)+7
rect(54,y,1332,57,'#faf6ee'); rect(54,y,4,57,'#ba934e')
text(root.find(cls='meaning')[0].text(),74,y+15,20,'#785921',width=1285)
y+=83
y=heading('04',titles[3],y)
future_y=y
rect(54,y,1332,350,'#f8fbf8','#719682')
text('从“角色怎么工作”到“任务如何协作”',78,y+20,24,bold=True)
text('后续可接入 · 尚未运行验证',1093,y+24,17,GREEN,width=270)
for i,item in enumerate(root.find(cls='node')):
    x=[78,474,1013][i]; w=[346,489,349][i]
    rect(x,y+78,w,112,'#eaf2eb' if i==1 else 'white','#bdd1c2')
    text(item.find('h3')[0].text(),x+16,y+94,22,bold=True,width=w-32)
    text(item.find('p')[0].text(),x+16,y+133,18,MUTED,width=w-32)
    if i<2: text('→',x+w+12,y+111,28,GREEN)
yy=text(root.find(cls='schedule-note')[0].text(),78,y+210,19,MUTED,width=1280)
text(root.find(cls='future')[0].find(cls='small')[0].text(),78,yy+7,17,MUTED,width=1280)
y=future_y+377
y=heading('05',titles[4],y)
rect(54,y,1332,165,DARK)
for i,item in enumerate(root.find(cls='boundary')[0].children):
    if not isinstance(item,Node): continue
    x=78 if item==root.find(cls='boundary')[0].find('div')[0] else 758
    text(item.find('h3')[0].text(),x,y+20,22,'#e3c797',True)
    text(item.find('p')[0].text(),x,y+61,19,'#e3ede7',width=598)
y+=187
draw.line((54*SCALE,y*SCALE,1386*SCALE,y*SCALE),fill=LINE,width=2)
text('来源：jnMetaCode/agency-agents-zh · agency-orchestrator 项目说明',54,y+17,15,MUTED)
text('能力与数量依据源文件；个人价值与后续流程为研究判断，非实测效果。',54,y+43,15,MUTED)
text(f"研究快照：{catalog['commit'][:12]} · {catalog['reviewed_on']}",1040,y+17,15,MUTED,width=350)
text('上游 MIT · © Michael Sitarzewski / jnMetaCode',1002,y+43,14,MUTED,width=390)
height=int(y+90)
out=HERE.parent/'assets/capability-summary.png'
canvas.crop((0,0,WIDTH*SCALE,height*SCALE)).save(out)
print(f'Rendered {out}: {WIDTH*SCALE} x {height*SCALE}')
