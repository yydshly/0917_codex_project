"""Build the Subtrace educational site using only the Python standard library."""
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent
OUT = HERE.parents[2] / 'site/apps/009-subtrace'
COMMIT = 'e3e3546b367ecc23d5fe5642491526ee969a6ff2'


def build():
    OUT.mkdir(parents=True, exist_ok=True)
    page = (HERE / 'index.template.html').read_text(encoding='utf-8')
    page = page.replace('{{BASE}}', f'https://github.com/subtrace/subtrace/blob/{COMMIT}/')
    (OUT / 'index.html').write_text(page, encoding='utf-8', newline='\n')
    for name in ('styles.css', 'app.js', 'favicon.svg'):
        (OUT / name).write_bytes((HERE / name).read_bytes())
    (OUT / 'capability-summary.svg').write_bytes((PROJECT / 'assets/capability-summary.svg').read_bytes())
    (OUT / 'capability-summary.png').write_bytes((PROJECT / 'assets/capability-summary.png').read_bytes())
    for source, target in [('README.md', 'research.txt'), ('architecture.md', 'architecture.txt'), ('sources.md', 'sources.txt'), ('assets/capability-summary-text.md', 'guide.txt')]:
        (OUT / target).write_text((PROJECT / source).read_text(encoding='utf-8'), encoding='utf-8-sig', newline='\n')
    print('Built 009: Subtrace educational page and research documents')


if __name__ == '__main__':
    build()
