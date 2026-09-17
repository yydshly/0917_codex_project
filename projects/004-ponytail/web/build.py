"""Build Ponytail's static research page using only the Python standard library."""
from pathlib import Path
import html
import json
import shutil

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
OUT = ROOT / "site/apps/004-ponytail"
COMMIT = "e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156"


def build():
    OUT.mkdir(parents=True, exist_ok=True)
    source = f"https://github.com/DietrichGebert/ponytail/blob/{COMMIT}"
    page = (HERE / "index.template.html").read_text(encoding="utf-8")
    (OUT / "index.html").write_text(page.replace("{{SOURCE}}", source), encoding="utf-8", newline="\n")
    trace = json.loads((HERE.parent / "experiments/hook-trace.json").read_text(encoding="utf-8"))
    rows = []
    for event in trace["events"]:
        mode = html.escape(event["state"] or "无标记")
        output = "完整决策规则" if event["contains_ladder"] else "仅状态通知" if event["stdout_present"] else "无输出"
        rows.append(f'<tr><td>{html.escape(event["event"])}</td><td>{mode}</td><td>{output}</td><td>{event["context_characters"]}</td></tr>')
    architecture = (HERE / "architecture.template.html").read_text(encoding="utf-8")
    architecture = architecture.replace("{{SOURCE}}", source).replace("<!-- HOOK_ROWS -->", "\n".join(rows))
    (OUT / "architecture.html").write_text(architecture, encoding="utf-8", newline="\n")
    shutil.copy2(HERE.parent / "experiments/hook-trace.json", OUT / "hook-trace.json")
    for filename in ("styles.css", "app.js", "favicon.svg", "architecture.css", "architecture.js"):
        shutil.copy2(HERE / filename, OUT / filename)
    for filename in ("capability-summary.png", "capability-summary.svg"):
        shutil.copy2(HERE.parent / "assets" / filename, OUT / filename)
    shutil.copy2(HERE.parent / "assets/capability-summary-text.md", OUT / "capability-summary-text.txt")
    for source_name, public_name in (("capabilities.md", "capabilities.txt"), ("notes.md", "research-notes.txt"), ("architecture.md", "architecture.txt")):
        shutil.copy2(HERE.parent / source_name, OUT / public_name)
    print("Built 004: Ponytail capability guide, working date filter, and Skill analysis")


if __name__ == "__main__":
    build()
