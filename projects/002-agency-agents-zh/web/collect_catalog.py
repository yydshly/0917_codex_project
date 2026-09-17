"""Explicitly refresh the pinned inventory; normal builds do not access upstream."""
import json
import re
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
UPSTREAM = HERE.parents[2] / "upstream/agency-agents-zh"
SKIP = {"scripts", "integrations", "examples", "assets", "evals", "node_modules"}


def collect():
    commit = subprocess.check_output(["git", "-C", str(UPSTREAM), "rev-parse", "HEAD"], text=True).strip()
    groups = []
    for folder in sorted(UPSTREAM.iterdir()):
        if not folder.is_dir() or folder.name.startswith(".") or folder.name in SKIP:
            continue
        agents = []
        for path in sorted(folder.rglob("*.md")):
            content = path.read_text(encoding="utf-8-sig")
            front = re.match(r"\A---\s*\n(.*?)\n---", content, re.S)
            name = re.search(r"^name:\s*(.+)$", front[1], re.M) if front else None
            if name:
                agents.append({"name": name[1].strip().strip("\"'"), "path": path.relative_to(UPSTREAM).as_posix()})
        if agents:
            groups.append({"id": folder.name, "agents": agents})
    data = {"repository": "https://github.com/jnMetaCode/agency-agents-zh", "commit": commit,
            "reviewed_on": "2026-09-17", "license": "MIT", "divisions": groups}
    (HERE / "catalog.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (HERE / "UPSTREAM-LICENSE.txt").write_text((UPSTREAM / "LICENSE").read_text(encoding="utf-8"), encoding="utf-8")
    print(f"{commit}: {len(groups)} departments, {sum(len(g['agents']) for g in groups)} roles")


if __name__ == "__main__":
    collect()
