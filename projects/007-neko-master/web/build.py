"""Build the Neko Master research site, using an explicit publication allowlist."""
import shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent
ROOT = HERE.parents[2]
OUT = ROOT / 'site/apps/007-neko-master'
COMMIT = '6f72cfd0db69e2952713f24a648812407fef1e78'
ASSETS = ('system-proxy-tun-revised.png', 'capability-summary.svg', 'clash-network-flow.svg', 'clash-network-flow.png', 'neko-master-overview-light.png', 'neko-master-domains-dark.png', 'neko-master-rules-dark.png', 'neko-master-regions-light.png')
WEB_FILES = ('styles.css', 'favicon.svg', 'model.mjs', 'app.mjs')
DOCUMENTS = {'capabilities.md':'capabilities.txt', 'architecture.md':'architecture.txt', 'sources.md':'sources.txt', 'assets/capability-summary-text.md':'capability-summary-text.txt', 'third-party/LICENSE.neko-master':'LICENSE.neko-master.txt'}
DOCUMENTS['understanding.md'] = 'understanding.txt'
DOCUMENTS['assets/clash-network-flow-text.md'] = 'clash-network-flow-text.txt'

def build():
    OUT.mkdir(parents=True, exist_ok=True)
    page = (HERE/'index.template.html').read_text(encoding='utf-8')
    page = page.replace('{{BASE}}', f'https://github.com/foru17/neko-master/blob/{COMMIT}/')
    (OUT/'index.html').write_text(page, encoding='utf-8', newline='\n')
    for name in WEB_FILES:
        shutil.copy2(HERE/name, OUT/name)
    for name in ASSETS:
        shutil.copy2(PROJECT/'assets'/name, OUT/name)
    for source, name in DOCUMENTS.items():
        (OUT/name).write_text((PROJECT/source).read_text(encoding='utf-8'), encoding='utf-8-sig', newline='\n')
    shutil.copy2(PROJECT/'source-manifest.json', OUT/'source-manifest.json')
    print('Built 007: capabilities, source screenshots, delta explainer and architecture')

if __name__ == '__main__':
    build()
