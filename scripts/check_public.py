from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json, re

root = Path(__file__).resolve().parents[1]
dist = root / 'dist'
issues = []
forbidden = (re.compile(r'mailto:|tel:', re.I), re.compile(r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}'), re.compile(r'[A-Z]:[/\\](?:Users|11111|APP)', re.I))
for path in root.rglob('*'):
    if not path.is_file() or '.git' in path.parts or '__pycache__' in path.parts or path == Path(__file__).resolve():
        continue
    if path.suffix.lower() in ('.html', '.css', '.js', '.json', '.md', '.yml', '.txt'):
        text = path.read_text(encoding='utf-8')
        if any(pattern.search(text) for pattern in forbidden):
            issues.append('Private contact or local path found: ' + str(path.relative_to(root)))
    if path.suffix.lower() in ('.pdf', '.doc', '.docx') or '.openai' in path.parts:
        issues.append('Private document or hosting metadata found: ' + str(path.relative_to(root)))

class AssetParser(HTMLParser):
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ('src', 'poster', 'href', 'data-src') and value:
                parsed = urlsplit(value)
                if not parsed.scheme and not parsed.netloc and parsed.path:
                    path = dist / unquote(parsed.path)
                    if not path.exists():
                        issues.append('Missing local reference: ' + value)

AssetParser().feed((dist / 'index.html').read_text(encoding='utf-8'))
artworks = json.loads((dist / 'artworks.json').read_text(encoding='utf-8'))
for item in artworks:
    for key in ('thumb', 'full'):
        if key in item and not (dist / item[key]).exists():
            issues.append('Missing artwork: ' + item[key])
if issues:
    raise SystemExit('\n'.join(issues))
print('Public contact scan and local asset references passed.')
