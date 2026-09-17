"""Build 003's static upstream capability showcase; Python standard library only."""
import html
import json
import shutil
from pathlib import Path
from urllib.parse import quote
from build_case import build_case

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent
ROOT = PROJECT.parents[1]
OUT = ROOT / "site/apps/003-agency-orchestrator"
COMMIT = "1f36dba95ef70a0f3c3559cac16acd9898622ad9"
SOURCE = f"https://github.com/jnMetaCode/agency-orchestrator/blob/{COMMIT}"


def build():
    OUT.mkdir(parents=True, exist_ok=True)
    scenarios = json.loads((HERE / "scenarios.json").read_text(encoding="utf-8"))
    buttons, panels = [], []
    esc = html.escape
    for case in scenarios:
        key = case["id"]
        buttons.append(f'<a class="scenario-tab" id="tab-{key}" href="#scenario-{key}"><span>{case["number"]}</span>{esc(case["label"])}</a>')
        steps = ''.join(f'<li><span class="step-index">{i:02d}</span><div><strong>{esc(step["role"])}</strong><span>{esc(step["work"])}</span></div></li>' for i, step in enumerate(case["steps"], 1))
        outputs = ''.join(f'<li>{esc(item)}</li>' for item in case["outputs"])
        panels.append(f'''<article class="scenario-panel" id="scenario-{key}" aria-labelledby="title-{key}">
          <div class="scenario-main"><p class="overline">{case["number"]} / {esc(case["label"])}</p><h3 id="title-{key}">{esc(case["title"])}</h3>
          <div class="request"><span>输入一个需求</span><p>“{esc(case["input"])}”</p></div>
          <ol class="steps">{steps}</ol><p class="scenario-note">{esc(case["note"])}</p>
          <a class="source-link" href="{SOURCE}/{quote(case["source"])}" target="_blank" rel="noopener noreferrer">查看上游原始模板 ↗</a></div>
          <div class="deliverable"><div class="document-top"><span>预期交付</span><span>{esc(case["format"])}</span></div><h4>{esc(case["deliverable"])}</h4><ul>{outputs}</ul><p>按上游模板整理的交付范围，非本次运行产物。</p></div></article>''')
    page = (HERE / "index.template.html").read_text(encoding="utf-8")
    page = page.replace("{{SOURCE}}", SOURCE).replace("<!-- SCENARIO_TABS -->", '\n'.join(buttons)).replace("<!-- SCENARIO_PANELS -->", '\n'.join(panels))
    (OUT / "index.html").write_text(page, encoding="utf-8", newline="\n")
    for filename in ("styles.css", "app.js"):
        shutil.copy2(HERE / filename, OUT / filename)
    assets = OUT / "assets"
    assets.mkdir(exist_ok=True)
    for filename in ("demo-studio-zh.gif", "studio-workflows-zh.png", "studio-roles-zh.png", "LICENSE.txt"):
        shutil.copy2(PROJECT / "assets/upstream" / filename, assets / filename)
    shutil.copy2(PROJECT / "assets/README.md", OUT / "SOURCES.md")
    for filename in ("capability-summary.png", "capability-summary.svg", "capability-summary-text.md"):
        shutil.copy2(PROJECT / "assets" / filename, OUT / filename)
    shutil.copy2(PROJECT / "assets/capability-summary-text.md", OUT / "capability-summary-text.txt")
    build_case(OUT)
    print("Built 003: upstream capability showcase and real content case")


if __name__ == "__main__":
    build()
