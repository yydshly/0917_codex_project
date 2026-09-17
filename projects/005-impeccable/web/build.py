"""Build the Impeccable research demo from local, recorded evidence (stdlib only)."""
from pathlib import Path
import html
import json
import shutil

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent
ROOT = HERE.parents[2]
OUT = ROOT / "site/apps/005-impeccable"
COMMIT = "f2c7051853848826aac2f4646581d62a732155ad"

def build():
    OUT.mkdir(parents=True, exist_ok=True)
    data = json.loads((HERE / "data.json").read_text(encoding="utf-8"))
    rows = []
    for item in data:
        e = {key: html.escape(value, quote=True) for key, value in item.items()}
        rows.append(f'<article class="project" data-kind="{e["kind"]}" data-search="{e["name"]} {e["summary"]} {e["focus"]}"><span class="number">{e["id"]}</span><h3>{e["name"]}</h3><span class="kind">{e["kind"]}</span><p class="summary">{e["summary"]}</p><details class="detail"><summary>研究重点</summary><p>{e["focus"]}</p></details><a class="source" href="{e["repo"]}" target="_blank" rel="noopener noreferrer" aria-label="查看 {e["name"]} 的上游仓库">上游仓库 ↗</a></article>')
    template = (HERE / "board.template.html").read_text(encoding="utf-8")
    for mode, title in (("before", "改造前"), ("after", "改造后")):
        replacements = {"TITLE": title, "MODE": mode, "STYLE": f"{mode}.css", "NOTICE": f"{title} · {'刻意构造的问题基线' if mode == 'before' else '依据 Impeccable 指南改造'}", "ROWS": "\n".join(rows), "SEARCH_LABEL": '<label for="query">搜索项目</label>' if mode == 'after' else '', "KIND_LABEL": '<label for="kind">项目类型</label>' if mode == 'after' else '', "EMPTY": '<h3>没有找到匹配的项目</h3><p>试试更短的关键词，或清除筛选查看全部项目。</p><button type="button" id="empty-reset">查看全部项目</button>' if mode == 'after' else ''}
        page = template
        for key, value in replacements.items():
            page = page.replace('{{' + key + '}}', value)
        (OUT / f"{mode}.html").write_text(page, encoding="utf-8", newline="\n")
    for name in ('before.css', 'after.css', 'board.js', 'study.css', 'study.js'):
        if (HERE / name).exists(): shutil.copy2(HERE / name, OUT / name)
    if (HERE / 'index.template.html').exists():
        meta = json.loads((PROJECT / 'project.json').read_text(encoding='utf-8'))
        page = (HERE / 'index.template.html').read_text(encoding='utf-8').replace('{{SOURCE}}', f'https://github.com/pbakaus/impeccable/blob/{COMMIT}').replace('{{SUMMARY}}', html.escape(meta['summary']))
        evidence = PROJECT / 'experiments/results.json'
        result = json.loads(evidence.read_text(encoding='utf-8')) if evidence.exists() else None
        table = '<p>检测尚未运行，暂无实测数据。</p>'
        if result:
            table = '<div class="table-scroll"><table><thead><tr><th>检测对象</th><th>改造前</th><th>改造后</th><th>口径</th></tr></thead><tbody>'
            for run in result['pairs']:
                table += f'<tr><th>{html.escape(run["label"])}</th><td>{run["before"]["primary"]} 项</td><td>{run["after"]["primary"]} 项</td><td>主要发现；建议项另计</td></tr>'
            table += '</tbody></table></div><p>以上为保存的官方引擎输出统计，非浏览器中的实时扫描。完整输出包含建议项、定位和退出码。</p>'
        (OUT / 'index.html').write_text(page.replace('{{RESULTS}}', table), encoding='utf-8', newline='\n')
    for name, public in (('capabilities.md', 'capabilities.txt'), ('notes.md', 'research-notes.txt')):
        if (PROJECT / name).exists():
            # Plain-text responses may have no HTTP charset; a BOM makes UTF-8 explicit.
            (OUT / public).write_text((PROJECT / name).read_text(encoding='utf-8'), encoding='utf-8-sig', newline='\n')
    if (PROJECT / 'third-party').exists():
        (OUT / 'third-party').mkdir(exist_ok=True)
        for source_name, public_name in (('LICENSE.impeccable', 'LICENSE.impeccable'), ('NOTICE.impeccable.md', 'NOTICE.impeccable.txt')):
            shutil.copy2(PROJECT / 'third-party' / source_name, OUT / 'third-party' / public_name)
    for name in ('results.json', 'browser-checks.json', 'provenance.json'):
        if (PROJECT / 'experiments' / name).exists(): shutil.copy2(PROJECT / 'experiments' / name, OUT / name)
    for file in (PROJECT / 'assets').glob('*.png'): shutil.copy2(file, OUT / file.name)
    diagram = PROJECT / 'assets/capability-summary.svg'
    if diagram.exists(): shutil.copy2(diagram, OUT / diagram.name)
    transcript = PROJECT / 'assets/capability-summary-text.md'
    if transcript.exists():
        (OUT / 'capability-summary-text.txt').write_text(transcript.read_text(encoding='utf-8'), encoding='utf-8-sig', newline='\n')
    if (PROJECT / 'experiments/raw').exists(): shutil.copytree(PROJECT / 'experiments/raw', OUT / 'evidence', dirs_exist_ok=True)
    print('Built 005: Impeccable research and runnable before/after boards')

if __name__ == '__main__': build()
