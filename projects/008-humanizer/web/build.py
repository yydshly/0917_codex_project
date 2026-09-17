"""Build the Humanizer research page from local, versioned files (stdlib only)."""
import html
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent
OUT = HERE.parents[2] / 'site/apps/008-humanizer'
COMMIT = '9862685f575c65a8247f90369951df1b3416e3d6'


def build():
    cards = []
    group = ''
    for line in (PROJECT / 'patterns.md').read_text(encoding='utf-8').splitlines():
        match = re.match(r'## ([A-E]) · (.+)', line)
        if match:
            group = match[1]
        if re.match(r'\| \d+ \|', line):
            number, title, description = [part.strip().replace('`', '') for part in line.strip('|').split('|')]
            cards.append(f'<details class="rule" data-group="{group}"><summary><span class="rule-num">{int(number):02}</span><span>{html.escape(title)}</span><span class="rule-plus" aria-hidden="true">+</span></summary><p>{html.escape(description)}</p></details>')
    if len(cards) != 25:
        raise ValueError('Expected all 25 patterns')
    OUT.mkdir(parents=True, exist_ok=True)
    page = (HERE / 'index.template.html').read_text(encoding='utf-8')
    page = page.replace('{{RULES}}', '\n'.join(cards)).replace('{{BASE}}', f'https://github.com/blader/humanizer/blob/{COMMIT}/')
    (OUT / 'index.html').write_text(page, encoding='utf-8', newline='\n')
    for name in ('styles.css', 'app.js', 'favicon.svg'):
        (OUT / name).write_bytes((HERE / name).read_bytes())
    for name in ('capability-summary.svg', 'capability-summary.png'):
        (OUT / name).write_bytes((PROJECT / 'assets' / name).read_bytes())
    (OUT / 'capability-summary-text.txt').write_text((PROJECT / 'assets/capability-summary-text.md').read_text(encoding='utf-8'), encoding='utf-8-sig', newline='\n')
    for source, target in (('README.md', 'research.txt'), ('patterns.md', 'patterns.txt'), ('notes.md', 'notes.txt')):
        (OUT / target).write_text((PROJECT / source).read_text(encoding='utf-8'), encoding='utf-8-sig', newline='\n')
    print('Built 008: Humanizer capabilities, illustrative examples and 25 searchable patterns')


if __name__ == '__main__':
    build()
