"""Verify provenance, publication boundary and relative resources without network."""
import hashlib
import json
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote

PROJECT = Path(__file__).resolve().parents[1]
ROOT = PROJECT.parents[1]
OUT = ROOT/'site/apps/007-neko-master'

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=set(); self.links=[]; self.images=[]
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f'Duplicate id {attrs["id"]}'
            self.ids.add(attrs['id'])
        for key in ('href','src'):
            if key in attrs: self.links.append(attrs[key])
        if tag=='img':
            assert attrs.get('alt','').strip(), 'Image needs alt text'
            self.images.append(attrs)

checks=[]
manifest=json.loads((PROJECT/'source-manifest.json').read_text(encoding='utf-8'))
assert len(manifest['files'])==26
for item in manifest['files']:
    assert manifest['commit'] in item['url']
    if item['path'].startswith('assets/'):
        filename=Path(item['path']).name
        data=(PROJECT/'assets'/filename).read_bytes()
        assert hashlib.sha256(data).hexdigest()==item['sha256'], filename
        assert (OUT/filename).read_bytes()==data, filename
checks.append('4 upstream PNGs match commit-pinned SHA-256 and published copies')
assert 'Copyright (c) 2025 foru17' in (OUT/'LICENSE.neko-master.txt').read_text(encoding='utf-8-sig')
checks.append('Upstream MIT license and copyright retained')
page=Page(); content=(OUT/'index.html').read_text(encoding='utf-8'); page.feed(content)
assert '{{' not in content
for link in page.links:
    url=urlsplit(link)
    if url.scheme or url.netloc: continue
    assert not url.path.startswith('/'), f'Absolute resource breaks subpath: {link}'
    if url.path:
        dest=(OUT/unquote(url.path)).resolve()
        assert dest.is_relative_to((ROOT/'site').resolve()),link
        assert dest.exists(),f'Missing {link}'
    elif url.fragment: assert url.fragment in page.ids, f'Missing anchor {link}'
checks.append('All HTML local resources and anchors resolve under static site root')
allowed={'index.html','styles.css','favicon.svg','model.mjs','app.mjs','capability-summary.svg','neko-master-overview-light.png','neko-master-domains-dark.png','neko-master-rules-dark.png','neko-master-regions-light.png','capabilities.txt','architecture.txt','sources.txt','capability-summary-text.txt','LICENSE.neko-master.txt','source-manifest.json'}
allowed.update(('system-proxy-tun-revised.png', 'understanding.txt', 'clash-network-flow.png', 'clash-network-flow.svg', 'clash-network-flow-text.txt'))
assert {path.name for path in OUT.iterdir()}==allowed
checks.append('Exactly 21 allowlisted public files, no upstream checkout or private data')
for name in ('system-proxy-tun-revised.png', 'clash-network-flow.png', 'clash-network-flow.svg'):
    assert (OUT/name).read_bytes()==(PROJECT/'assets'/name).read_bytes()
checks.append('Original Clash diagram PNG and SVG match published copies')
for name in ('model.mjs','app.mjs','styles.css','favicon.svg'):
    assert (OUT/name).read_bytes()==(PROJECT/'web'/name).read_bytes()
checks.append('Built code and styles match maintained sources')
result={'verified_at':datetime.now(timezone.utc).isoformat(),'scope':'Local teaching page and asset provenance only; no upstream gateway runtime test','checks':checks,'status':'passed'}
(PROJECT/'experiments/validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result,ensure_ascii=False,indent=2))
