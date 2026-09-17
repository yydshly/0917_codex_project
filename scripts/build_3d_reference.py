"""Build a static reading page around an actual screenshot of each 3D app."""
import html
import json
import shutil
from pathlib import Path


def build_reference(project, out):
    project, out = Path(project), Path(out)
    meta = json.loads((project / 'project.json').read_text(encoding='utf-8'))
    data = json.loads((project / 'web/reference.json').read_text(encoding='utf-8'))
    esc = html.escape
    title, summary = esc(data['title']), esc(meta['summary'])
    shutil.copyfile(project / meta['cover'], out / 'product-preview.png')
    cards = ''.join(f'<article><h3>{esc(t)}</h3><p>{esc(d)}</p></article>' for t, d in data['capabilities'])
    steps = ''.join(f'<li>{esc(s)}</li>' for s in data['steps'])
    limits = ''.join(f'<li>{esc(s)}</li>' for s in data['limits'])
    source = f'https://github.com/yydshly/0917_codex_project/tree/main/projects/{project.name}/web/src'
    page = f'''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="{summary}"><title>{title}</title>
<style>
*{{box-sizing:border-box}}:root{{--accent:{data['accent']};color:#25382f;background:#f4f5ef;font-family:system-ui,"Microsoft YaHei",sans-serif;line-height:1.8}}body{{margin:0}}a{{color:var(--accent);text-underline-offset:4px}}a:focus-visible,summary:focus-visible{{outline:3px solid #bc7941;outline-offset:5px}}main{{max-width:1120px;margin:auto;padding:30px}}nav{{display:flex;justify-content:space-between;gap:20px;border-bottom:1px solid #d4ddcf;padding-bottom:18px;font-size:14px}}header{{padding:55px 0 28px;max-width:850px}}.eyebrow{{font-size:12px;letter-spacing:2px;color:var(--accent)}}h1{{font-size:clamp(30px,4vw,49px);line-height:1.3;margin:15px 0 20px;letter-spacing:-1px}}.lead{{font-size:19px;color:#516354}}.actions{{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}}.button{{display:inline-block;background:var(--accent);color:white;text-decoration:none;padding:11px 21px;border-radius:7px}}.button.secondary{{background:#e5ebdf;color:#294a38}}figure{{margin:12px 0 48px;background:#e6eadd;border:1px solid #d5ddce;border-radius:12px;overflow:hidden}}figure a{{display:block}}figure img{{display:block;width:100%;max-height:690px;aspect-ratio:16/10;object-fit:cover;object-position:center 16%;background:#e9ede3}}figcaption{{padding:14px 20px;font-size:13px;color:#55684e}}section{{margin:48px 0}}h2{{font-size:25px;margin:0 0 16px}}h3{{font-size:17px;margin:0 0 9px}}p{{margin:10px 0}}.cards{{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}}article{{background:#fffef8;border:1px solid #d9dfd3;border-radius:10px;padding:22px}}article p{{font-size:14px;color:#59694f}}.table-wrap{{overflow:auto}}table{{border-collapse:collapse;width:100%;background:#fffef8}}th,td{{text-align:left;border-bottom:1px solid #dbe1d4;padding:16px;vertical-align:top}}th{{background:#e8eee0}}td:first-child{{white-space:nowrap}}li{{margin:9px 0}}.note{{background:#e8eee0;border-left:3px solid var(--accent);padding:20px 25px}}.prompt{{white-space:pre-wrap;background:#fffef8;border:1px solid #d5decb;padding:22px;border-radius:9px;font:inherit}}footer{{border-top:1px solid #d1dac9;padding:25px 0;color:#63745a;font-size:13px}}@media(max-width:680px){{main{{padding:20px}}header{{padding-top:32px}}.cards{{grid-template-columns:1fr}}.lead{{font-size:17px}}h2{{font-size:22px}}section{{margin:35px 0}}figure img{{max-height:none}}th,td{{padding:11px;font-size:13px}}nav{{font-size:12px}}}}
</style></head><body><main>
<nav><a href="../../">← 项目索引</a><a href="../{data['other']}/guide.html">{esc(data['other_label'])} →</a></nav>
<header><span class="eyebrow">3D IMPLEMENTATION REFERENCE / {meta['id']:03d}</span><h1>{title}</h1><p class="lead">{summary}</p><p>{esc(data['value'])}</p><div class="actions"><a class="button" href="./">打开 3D 交互演示 →</a><a class="button secondary" href="{source}">查看实现源码 ↗</a></div></header>
<figure id="guide"><a href="./" aria-label="打开{title}交互演示"><img src="product-preview.png" alt="{esc(meta['cover_alt'])}"></a><figcaption>实际产品效果 · 2026-09-18 本地浏览器运行截图；未使用生成图替代效果。点击图片进入演示。<a href="product-preview.png">查看原图</a></figcaption></figure>
<section><h2>这个参考能帮你实现什么</h2><div class="cards">{cards}</div></section>
<section><h2>建议按这个顺序体验</h2><ol>{steps}</ol></section>
<section><h2>React、Three.js 和我们自己写的代码</h2><p>核心是通用网页与三维能力，具体产品行为由项目代码实现。这里不是一个安装后就自带全部功能的“自行车库”或“椅子库”。</p><div class="table-wrap"><table><thead><tr><th>层次</th><th>提供的能力</th><th>当前实现</th></tr></thead><tbody><tr><td>React</td><td>界面与状态</td><td>按钮、滑杆、页签、选中项、配色与读数。</td></tr><tr><td>Three.js</td><td>三维渲染与交互</td><td>几何、材质、灯光、阴影、相机、点击拾取与动画循环。</td></tr><tr><td>自定义 JavaScript</td><td>对象专属规则</td><td>{esc(data['rules'])}</td></tr><tr><td>Vite</td><td>构建与交付</td><td>打包成本地资源，部署到 GitHub Pages 子路径，无应用后端。</td></tr></tbody></table></div><p class="note">操作 → 更新配置 → 计算运动状态 → 更新三维节点 → 回传界面读数。可复用的是这条流程；几何造型、装配层级和运动约束需要按对象重写。</p></section>
<section><h2>为什么自行车容易做精细，人物更难</h2><p>车管、轮圈和紧固件接近规则几何体，适合程序化搭建，再通过金属、车漆和橡胶的不同反光表现结构。椅子软包需要连续曲面、织纹和缝线；人体还需要准确比例、连续关节、衣物形变及自然动作。</p><p>当前人物由简化几何生成，保持固定坐姿，尚未使用带骨骼的精细人物。提高灯光或分辨率不能替代模型质量。下一阶段应先改善人物模型与接触姿态，再加入蹬地、收脚和受压反馈；同一套 React + Three.js 可以继续承载这些资源。</p></section>
<section><h2>下次如何提出类似需求</h2><p>说明对象、部件、规则、视觉标准和验收方式，比只说“做一个炫酷 3D 页面”更明确。</p><div class="prompt">{esc(data['prompt'])}</div></section>
<section><h2>适用场景与边界</h2><p>{esc(data['scenarios'])}</p><ul>{limits}</ul><p>源码和实际截图用于实现参考与验证，不代表任何厂商产品规格或工程认证。</p></section>
<footer>独立实现参考 · <a href="{source}">项目源码</a> · <a href="sources.txt">来源与许可证</a> · <a href="./">进入 3D 演示</a></footer>
</main></body></html>'''
    (out / 'guide.html').write_text(page, encoding='utf-8', newline='\n')
