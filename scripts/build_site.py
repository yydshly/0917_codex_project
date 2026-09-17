"""Build the static site and its metadata-driven project index (stdlib only)."""
import html
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlparse

from projects import ROOT, read_projects


def build():
    entries = read_projects()
    # Each subproject owns its stack. Register its build here when necessary.
    subprocess.run([sys.executable, str(ROOT / "projects/001-agency-agents/web/build.py")], check=True)
    subprocess.run([sys.executable, str(ROOT / "projects/002-agency-agents-zh/web/build.py")], check=True)
    subprocess.run([sys.executable, str(ROOT / "projects/003-agency-orchestrator/web/build.py")], check=True)
    subprocess.run([sys.executable, str(ROOT / "projects/004-ponytail/web/build.py")], check=True)
    subprocess.run([sys.executable, str(ROOT / "projects/005-impeccable/web/build.py")], check=True)
    rows = []
    for entry in entries:
        folder = entry["folder"]
        local_demo = ROOT / "site" / "apps" / folder / "index.html"
        demo = f'<a href="./apps/{folder}/">阅读研究 →</a>' if local_demo.exists() else "待添加"
        if (local_demo.parent / "capability-summary.png").is_file():
            demo += f'<br><a href="./apps/{folder}/#guide">先看汇总图 →</a>'
        source_name = html.escape(urlparse(entry["repo"]).path.strip('/'))
        rows.append(f'<tr><td>{entry["id"]:03d}</td><td><strong>{html.escape(entry["name"])}</strong><br><span>{html.escape(entry["status"])}</span></td><td>{html.escape(entry["summary"])}</td><td><a href="{html.escape(entry["repo"], quote=True)}" target="_blank" rel="noopener noreferrer">{source_name} ↗</a></td><td>{demo}</td></tr>')
    template = (ROOT / "site/index.template.html").read_text(encoding="utf-8")
    (ROOT / "site/index.html").write_text(template.replace("<!-- PROJECT_ROWS -->", "\n".join(rows)), encoding="utf-8", newline="\n")
    print("Built static site and project index")


if __name__ == "__main__":
    build()
