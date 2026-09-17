"""Trace upstream hooks in isolated local directories; no model or host is launched."""
import json
import os
from pathlib import Path
import subprocess
import tempfile

PROJECT = Path(__file__).resolve().parents[1]
ROOT = PROJECT.parents[1]
UPSTREAM = ROOT / "upstream/ponytail"
COMMIT = "e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156"


def main():
    actual = subprocess.check_output(["git", "-C", str(UPSTREAM), "rev-parse", "HEAD"], text=True).strip()
    if actual != COMMIT:
        raise RuntimeError("Upstream commit differs from the research baseline")
    scratch = ROOT / ".tmp"
    scratch.mkdir(exist_ok=True)
    run_dir = Path(tempfile.mkdtemp(prefix="ponytail-trace-", dir=scratch)).resolve()
    if not run_dir.is_relative_to(scratch.resolve()):
        raise RuntimeError("Experiment directory escaped workspace scratch directory")
    env = os.environ.copy()
    for key in ("COPILOT_PLUGIN_DATA", "CLAUDE_PLUGIN_ROOT", "QODER_SESSION_ID", "CURSOR_VERSION", "CURSOR_PROJECT_DIR", "PONYTAIL_SUBAGENT_MATCHER"):
        env.pop(key, None)
    env.update({
        "PLUGIN_DATA": str(run_dir / "plugin-state"),
        "CLAUDE_CONFIG_DIR": str(run_dir / "claude-config"),
        "XDG_CONFIG_HOME": str(run_dir / "config"),
        "PONYTAIL_DEFAULT_MODE": "full",
    })
    cases = [
        ("会话启动", "ponytail-activate.js", {}, "full", True),
        ("普通开发请求", "ponytail-mode-tracker.js", {"prompt": "为任务清单增加日期筛选"}, "full", False),
        ("切换 lite", "ponytail-mode-tracker.js", {"prompt": "/ponytail lite"}, "lite", False),
        ("子代理启动", "ponytail-subagent.js", {"agent_type": "general"}, "lite", True),
        ("关闭模式", "ponytail-mode-tracker.js", {"prompt": "/ponytail off"}, None, False),
        ("关闭后的子代理", "ponytail-subagent.js", {"agent_type": "general"}, None, False),
        ("再次启动激活脚本", "ponytail-activate.js", {}, "full", True),
    ]
    rows = []
    flag = run_dir / "plugin-state/.ponytail-active"
    for label, script, payload, expected_mode, expected_rules in cases:
        result = subprocess.run(["node", str(UPSTREAM / "hooks" / script)], input=json.dumps(payload, ensure_ascii=False), env=env, text=True, encoding="utf-8", capture_output=True, timeout=10, check=True)
        output = json.loads(result.stdout) if result.stdout.strip() else {}
        context = output.get("hookSpecificOutput", {}).get("additionalContext", "")
        mode = flag.read_text(encoding="utf-8").strip() if flag.exists() else None
        has_rules = "## The ladder" in context
        assert mode == expected_mode, (label, mode)
        assert has_rules == expected_rules, label
        if has_rules:
            assert f"| **{mode}** |" in context, label
            for other in {"lite", "full", "ultra"} - {mode}:
                assert f"| **{other}** |" not in context, label
        rows.append({"event": label, "script": script, "input": payload, "state": mode, "stdout_present": bool(result.stdout.strip()), "context_characters": len(context), "contains_ladder": has_rules, "mode_row": mode if has_rules else None, "exit_code": result.returncode})
    report = {"commit": COMMIT, "date": "2026-09-17", "scope": "Isolated upstream Node.js hook execution using the Codex-shaped output branch; no host, model, or MCP client launched.", "default_mode": "full", "checks": len(rows), "passed": len(rows), "events": rows}
    (PROJECT / "experiments/hook-trace.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
