"""Reproduce six official engine scans; needs a local engine and the static server."""
import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import subprocess

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--engine', required=True)
    parser.add_argument('--base-url', default='http://127.0.0.1:8766/apps/005-impeccable')
    args = parser.parse_args()
    engine = Path(args.engine).resolve()
    raw = HERE / 'raw'
    raw.mkdir(exist_ok=True)
    report = {'recordedAt': datetime.now(timezone.utc).isoformat(), 'engineRelease': 'engine-v0.1.5', 'engineReportedVersion': subprocess.check_output([str(engine), '--version'], text=True).strip(), 'binarySha256': hashlib.sha256(engine.read_bytes()).hexdigest(), 'config': '--no-config (no suppressions and no DESIGN.md)', 'pairs': []}
    for mode, label, viewport in [('static', '静态 HTML / CSS', None), ('desktop', '浏览器 1280 × 900', '1280x900'), ('mobile', '浏览器 390 × 844', '390x844')]:
        pair = {'mode': mode, 'label': label}
        for version in ['before', 'after']:
            target = str(ROOT / 'site/apps/005-impeccable' / f'{version}.html') if mode == 'static' else f'{args.base_url}/{version}.html'
            command = [str(engine), 'detect', '--json', '--no-config']
            if viewport: command += ['--viewport', viewport]
            command.append(target)
            result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, encoding='utf-8', timeout=120)
            if result.returncode not in (0, 2): raise RuntimeError(f'{mode}/{version}: {result.returncode}: {result.stderr}')
            findings = json.loads(result.stdout)
            # Retain actual findings, only replace machine-specific absolute root.
            (raw / f'{mode}-{version}.json').write_text(result.stdout.replace(str(ROOT).replace('\\', '\\\\'), '<REPO>').replace(str(ROOT).replace('\\', '/'), '<REPO>'), encoding='utf-8')
            (raw / f'{mode}-{version}.stderr.txt').write_text(result.stderr, encoding='utf-8')
            primary = [f for f in findings if not f.get('advisory') and f.get('severity') != 'advisory']
            pair[version] = {'exitCode': result.returncode, 'primary': len(primary), 'advisory': len(findings)-len(primary), 'rules': dict(Counter(f.get('antipattern', f.get('rule', 'unknown')) for f in findings)), 'raw': f'raw/{mode}-{version}.json', 'target': f'site/apps/005-impeccable/{version}.html' if mode == 'static' else target, 'viewport': viewport}
            print(f'{mode}/{version}: {len(primary)} primary, {len(findings)-len(primary)} advisory', flush=True)
        report['pairs'].append(pair)
    (HERE / 'results.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

if __name__ == '__main__': main()
