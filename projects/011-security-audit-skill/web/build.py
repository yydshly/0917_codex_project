"""Build the local educational page with Python's standard library."""
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent
OUT = HERE.parents[2] / 'site' / 'apps' / PROJECT.name
COMMIT = 'c1c8a8c1471069fb0e188eeaff69b8e8db6564a8'


def build():
    OUT.mkdir(parents=True, exist_ok=True)
    base = f'https://github.com/cloudflare/security-audit-skill/blob/{COMMIT}/'
    for name in ('index.html', 'styles.css', 'app.js'):
        text = (HERE / name).read_text(encoding='utf-8')
        if name == 'index.html':
            text = text.replace('{{UNDERSTANDING}}', (HERE / 'understanding.html').read_text(encoding='utf-8'))
        text = text.replace('{{BASE}}', base)
        (OUT / name).write_text(text, encoding='utf-8', newline='\n')
    (OUT / 'capability-summary.svg').write_bytes((PROJECT / 'assets/capability-summary.svg').read_bytes())
    (OUT / 'capability-summary.png').write_bytes((PROJECT / 'assets/capability-summary.png').read_bytes())
    for name in ('README', 'architecture', 'sources', 'understanding'):
        (OUT / f'{name}.txt').write_text((PROJECT / f'{name}.md').read_text(encoding='utf-8'), encoding='utf-8-sig')
    print('Built 011: Security Audit Skill educational page')


if __name__ == '__main__':
    build()
