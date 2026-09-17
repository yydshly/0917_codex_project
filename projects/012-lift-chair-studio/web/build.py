"""Build this independent Vite app and copy only static client files to Pages."""
from pathlib import Path
import shutil
import subprocess
import sys

HERE = Path(__file__).resolve().parent
OUT = HERE.parents[2] / 'site/apps/012-lift-chair-studio'


def build():
    npm = shutil.which('npm.cmd') or shutil.which('npm')
    if not npm:
        raise SystemExit('Building project 012 requires Node.js 22 and npm.')
    if not (HERE / 'node_modules').is_dir():
        subprocess.run([npm, 'ci', '--no-audit', '--no-fund'], cwd=HERE, check=True)
    subprocess.run([npm, 'run', 'build'], cwd=HERE, check=True)
    # Only this project's generated assets may be removed; do not touch other demos.
    asset_target = (OUT / 'assets').resolve()
    expected = (HERE.parents[2] / 'site/apps/012-lift-chair-studio/assets').resolve()
    if asset_target != expected or not asset_target.is_relative_to(OUT.resolve()):
        raise SystemExit('Unsafe output directory')
    if asset_target.exists():
        shutil.rmtree(asset_target)
    shutil.copytree(HERE / 'dist', OUT, dirs_exist_ok=True)
    license_dir = OUT / 'licenses'
    license_dir.mkdir(parents=True, exist_ok=True)
    for package in ('three', 'react', 'react-dom', 'lucide-react', '@fontsource/space-grotesk'):
        package_dir = HERE / 'node_modules' / package
        for name in ('LICENSE', 'LICENSE.txt', 'LICENSE.md', 'OFL.txt'):
            source = package_dir / name
            if source.exists():
                shutil.copyfile(source, license_dir / (package.replace('/', '-') + '-' + name))
    shutil.copyfile(HERE.parent / 'sources.md', OUT / 'sources.txt')
    sys.path.insert(0, str(HERE.parents[2] / 'scripts'))
    from build_3d_reference import build_reference
    build_reference(HERE.parent, OUT)
    print('Built 012: Lift Chair Studio, static client and third-party licenses')


if __name__ == '__main__':
    build()
