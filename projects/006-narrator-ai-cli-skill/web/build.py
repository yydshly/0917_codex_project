"""Build the Narrator research page with the standard library only."""
import html
import json
import shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent
ROOT = HERE.parents[2]
OUT = ROOT / 'site/apps/006-narrator-ai-cli-skill'


def build():
    OUT.mkdir(parents=True, exist_ok=True)
    meta = json.loads((PROJECT / 'project.json').read_text(encoding='utf-8'))
    page = (HERE / 'index.template.html').read_text(encoding='utf-8')
    values = {
        'SUMMARY': html.escape(meta['summary'], quote=True),
        'REPO': html.escape(meta['repo'], quote=True),
        'SKILL': 'https://github.com/NarratorAI-Studio/narrator-ai-cli-skill/blob/4b17c6f2175bd532c92db778a847f8fb6bdd3177',
        'CLI': 'https://github.com/NarratorAI-Studio/narrator-ai-cli/blob/2d8bb1463058fb36f267f205994dca38b32f037d',
    }
    for key, value in values.items():
        page = page.replace('{{' + key + '}}', value)
    (OUT / 'index.html').write_text(page, encoding='utf-8', newline='\n')
    for name in ('styles.css', 'favicon.svg'):
        shutil.copy2(HERE / name, OUT / name)
    for name in ('capability-summary.png', 'capability-summary.svg'):
        shutil.copy2(PROJECT / 'assets' / name, OUT / name)
    for source, target in (
        ('assets/capability-summary-text.md', 'capability-summary-text.txt'),
        ('notes.md', 'research-notes.txt'),
        ('sources.md', 'sources.txt'),
    ):
        (OUT / target).write_text((PROJECT / source).read_text(encoding='utf-8'), encoding='utf-8-sig', newline='\n')
    print('Built 006: Narrator capability, guide image, workflow and evidence')


if __name__ == '__main__':
    build()
