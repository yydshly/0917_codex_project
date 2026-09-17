"""Refresh the versioned role inventory from the ignored upstream checkout."""
import json
import re
import subprocess
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
UPSTREAM = HERE.parents[2] / "upstream" / "agency-agents"

def collect():
    commit = subprocess.check_output(["git", "-C", str(UPSTREAM), "rev-parse", "HEAD"], text=True).strip()
    divisions = json.loads((UPSTREAM / "divisions.json").read_text(encoding="utf-8"))["divisions"]
    groups = []
    for key, metadata in divisions.items():
        agents = []
        for path in sorted((UPSTREAM / key).rglob("*.md")):
            text = path.read_text(encoding="utf-8-sig")
            front = re.match(r"\A---\s*\n(.*?)\n---", text, re.S)
            name = re.search(r"^name:\s*(.+)$", front[1], re.M) if front else None
            if name:
                agents.append({"name": name[1].strip().strip('\"\''), "path": path.relative_to(UPSTREAM).as_posix()})
        if not agents:
            raise ValueError(f"No agents found in {key}")
        groups.append({"id": key, "label": metadata["label"], "agents": agents})
    data = {"repository": "https://github.com/msitarzewski/agency-agents", "commit": commit,
            "reviewed_on": date.today().isoformat(), "license": "MIT", "divisions": groups}
    (HERE / "catalog.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (HERE / "UPSTREAM-LICENSE.txt").write_text((UPSTREAM / "LICENSE").read_text(encoding="utf-8"), encoding="utf-8")
    print(f"Catalog: {len(groups)} divisions, {sum(len(g['agents']) for g in groups)} roles, {commit}")

if __name__ == "__main__":
    collect()
