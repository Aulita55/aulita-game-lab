#!/usr/bin/env python3
"""Build a local, picture-inclusive review copy; production source stays unchanged."""
import argparse
import base64
import json
import mimetypes
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[1]


def build(destination: Path) -> None:
    assets = {}
    for folder, prefix in [(ROOT / 'pics', 'pics/'), (ROOT / 'photos', 'photos/'),
                           (REPO / 'assets', '../../assets/')]:
        for file in sorted(folder.iterdir()):
            if file.suffix not in {'.webp', '.png', '.jpg'}:
                continue
            mime = mimetypes.guess_type(file.name)[0]
            assets[prefix + file.name] = 'data:' + mime + ';base64,' + base64.b64encode(file.read_bytes()).decode()

    def css_urls(text):
        return re.sub(r'url\([\'"]?([^\)\'"\s]+)[\'"]?\)',
                      lambda m: 'url("' + assets.get(m[1], m[1]) + '")', text)

    html = (ROOT / 'index.html').read_text()
    for match in list(re.finditer(r'<link rel="stylesheet" href="([^"?]+)(?:\?[^\"]*)?">', html)):
        if match[1].startswith(('http:', 'https:')):
            continue
        html = html.replace(match[0], '<style>' + css_urls((ROOT / match[1]).read_text()) + '</style>')
    # Only the review copy opens all tasks. Student progression is unchanged.
    html = html.replace(' return steps;', ' steps.forEach(st=>st.open=true);return steps;')
    fetch_line = 'const r=await fetch("topics.json?v="+Date.now(),{cache:"no-store"});if(!r.ok)throw new Error("load");if(!teacherReady){DATA=expandVerbs(await r.json());loaded=true}'
    replacement = 'if(!teacherReady){DATA=expandVerbs(JSON.parse(document.getElementById("review-topics").textContent));loaded=true}'
    if fetch_line not in html:
        raise RuntimeError('Topic loading changed; update the review builder.')
    html = html.replace(fetch_line, replacement)
    helper = r'''if(props){props=Object.assign({},props);if(typeof props.src==='string')props.src=window.__NotebookAssetURL(props.src);if(typeof props.style==='string')props.style=props.style.replace(/url\(["']?([^)"']+)["']?\)/g,(_,p)=>'url("'+window.__NotebookAssetURL(p)+'")')}'''
    html = html.replace('function el(tag,props,...kids){', 'function el(tag,props,...kids){' + helper)
    html = html.replace('<title>Тетрадь</title>', '<title>АюлитА · Проверочная версия тетради</title>')
    for match in list(re.finditer(r'<script src="([^"?]+)(?:\?[^\"]*)?"></script>', html)):
        source = (ROOT / match[1]).read_text()
        if match[1] == 'voice.js':
            source = source.replace("audio.src='audio/'+manifest.packs[p].file", "audio.src='https://raw.githubusercontent.com/Aulita55/aulita-game-lab/main/games/english-notebook/audio/'+manifest.packs[p].file")
        if match[1] == 'cat-city.js':
            source = source.replace("href=\"../../assets/'+file+'\"", "href=\"'+global.__NotebookAssetURL('../../assets/'+file)+'\"")
        html = html.replace(match[0], '<script>\n' + source.replace('</script', '<\\/script') + '\n</script>')
    # Review progress is separate even when opening several local Notebook copies.
    html = html.replace('ee-', 'ee-review-')
    header = '<style>.review-banner{padding:16px 24px;background:#fff2d7;border-bottom:1px solid #ddbd7d;color:#5f573e;font:15px/1.6 system-ui;text-align:center}.review-banner button{font-size:13px;margin:6px 12px;padding:8px 14px}</style><aside class="review-banner"><b>Проверочная версия</b> · Все задания открыты для просмотра. Изображения встроены, для озвучки нужен интернет.<br><button type="button" id="review-demo">Открыть пример города</button></aside>'
    scripts = '<script>window.__NotebookAssets=' + json.dumps(assets, ensure_ascii=False) + ';window.__NotebookAssetURL=p=>window.__NotebookAssets[p]||p;</script>'
    topics = '<script type="application/json" id="review-topics">' + (ROOT / 'topics.json').read_text().replace('</', '<\\/') + '</script>'
    html = html.replace('<body>', '<body>' + header + scripts + topics, 1)
    demo = '''<script>
document.getElementById('review-demo').onclick=()=>{const w=NotebookTown.wallet();let d=w.load();if(!d.buildings.length){for(let i=0;i<50;i++)w.earn('review-demo:'+i,3);const plots=[0,8,14,16,30,32,36,40,48];NotebookTown.CATALOG.forEach((b,i)=>w.buy(b.id,plots[i]));}if(location.hash==='#cat-city')window.dispatchEvent(new Event('hashchange'));else location.hash='cat-city';};
if(!location.hash)location.hash='iv-c';
</script>'''
    html = html.replace('</body>', demo + '</body>')
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(html)
    print(json.dumps({'file': str(destination), 'bytes': destination.stat().st_size,
                      'embedded_images': len(assets), 'audio': 'online recorded packs'}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('output', type=Path)
    build(parser.parse_args().output.resolve())
