"""Build the static site and its metadata-driven project index (stdlib only)."""
import html
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlparse

from projects import ROOT, read_projects, source_link


def build():
    entries = read_projects()
    # Each subproject owns its stack. Register its build here when necessary.
    subprocess.run([sys.executable, str(ROOT / "projects/001-agency-agents/web/build.py")], check=True)
    subprocess.run([sys.executable, str(ROOT / "projects/002-agency-agents-zh/web/build.py")], check=True)
    subprocess.run([sys.executable, str(ROOT / "projects/003-agency-orchestrator/web/build.py")], check=True)
    subprocess.run([sys.executable, str(ROOT / "projects/004-ponytail/web/build.py")], check=True)
    subprocess.run([sys.executable, str(ROOT / "projects/005-impeccable/web/build.py")], check=True)
    subprocess.run([sys.executable, str(ROOT / "projects/006-narrator-ai-cli-skill/web/build.py")], check=True)
    subprocess.run([sys.executable, str(ROOT / "projects/007-neko-master/web/build.py")], check=True)
    subprocess.run([sys.executable, str(ROOT / "projects/008-humanizer/web/build.py")], check=True)
    subprocess.run([sys.executable, str(ROOT / "projects/009-subtrace/web/build.py")], check=True)
    subprocess.run([sys.executable, str(ROOT / "projects/010-veloce-bike-studio/web/build.py")], check=True)
    subprocess.run([sys.executable, str(ROOT / "projects/011-security-audit-skill/web/build.py")], check=True)
    subprocess.run([sys.executable, str(ROOT / "projects/012-lift-chair-studio/web/build.py")], check=True)
    rows, references = [], []
    for entry in entries:
        folder = entry["folder"]
        local_demo = ROOT / "site" / "apps" / folder / "index.html"
        demo = f'<a href="./apps/{folder}/">阅读研究 →</a>' if local_demo.exists() else "待添加"
        if entry.get('kind') == '3d-reference' and local_demo.exists():
            demo = f'<a href="./apps/{folder}/guide.html">实现参考 →</a><br><a href="./apps/{folder}/">体验 3D →</a>'
            references.append(f'<article class="reference-card"><a href="./apps/{folder}/guide.html"><img src="./apps/{folder}/product-preview.png" alt="{html.escape(entry["cover_alt"], quote=True)}" loading="lazy"><h3>{entry["id"]:03d} · {html.escape(entry["name"])}</h3></a><p>{html.escape(entry["summary"])}</p><div><a href="./apps/{folder}/guide.html">阅读实现参考 →</a><a href="./apps/{folder}/">打开 3D 演示 →</a></div></article>')
        elif (local_demo.parent / "capability-summary.png").is_file():
            demo += f'<br><a href="./apps/{folder}/#guide">先看汇总图 →</a>'
        rows.append(f'<tr><td>{entry["id"]:03d}</td><td><strong>{html.escape(entry["name"])}</strong><br><span>{html.escape(entry["status"])}</span></td><td>{html.escape(entry["summary"])}</td><td>{source_link(entry)}</td><td>{demo}</td></tr>')
    template = (ROOT / "site/index.template.html").read_text(encoding="utf-8")
    feature = '<section class="references"><h2>可交互 3D 实现参考</h2><p>用真实产品效果理解界面、三维渲染与运动规则的分工。图片来自实际运行页面。</p><div class="reference-grid">'+''.join(references)+'</div></section>' if references else ''
    (ROOT / "site/index.html").write_text(template.replace("<!-- PROJECT_ROWS -->", "\n".join(rows)).replace("<!-- THREE_D_REFERENCES -->", feature), encoding="utf-8", newline="\n")
    print("Built static site and project index")


if __name__ == "__main__":
    build()
