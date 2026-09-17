"""Render the recorded real run without running a model during website builds."""
import html
import json
import re
import shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent
CASE = HERE.parent / "cases/content-launch"
SOURCE = "https://github.com/jnMetaCode/agency-orchestrator/blob/1f36dba95ef70a0f3c3559cac16acd9898622ad9"


def inline(value):
    value = html.escape(value)
    value = re.sub(r"`([^`]+)`", r"<code>\1</code>", value)
    return re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", value)


def markdown(text):
    """Small escaped presentation renderer; raw text remains downloadable."""
    lines, result, i = text.splitlines(), [], 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        if line.startswith('```'):
            block = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith('```'):
                block.append(lines[i])
                i += 1
            result.append('<pre><code>' + html.escape('\n'.join(block)) + '</code></pre>')
            i += 1
            continue
        if re.fullmatch(r'[-*_]{3,}', line):
            result.append('<hr>')
        elif re.match(r'^#{1,6} ', line):
            heading = re.match(r'^(#{1,6}) (.+)', line)
            level = min(5, len(heading[1]) + 2)
            result.append(f'<h{level}>{inline(heading[2])}</h{level}>')
        elif line.startswith('|') and i + 1 < len(lines) and re.fullmatch(r'[| :\-]+', lines[i + 1].strip()):
            cells = lambda row: [inline(c.strip()) for c in row.strip().strip('|').split('|')]
            header = ''.join(f'<th scope="col">{c}</th>' for c in cells(line))
            body = []
            i += 2
            while i < len(lines) and lines[i].strip().startswith('|'):
                body.append('<tr>' + ''.join(f'<td>{c}</td>' for c in cells(lines[i])) + '</tr>')
                i += 1
            result.append('<div class="table-scroll" tabindex="0" role="region" aria-label="产出中的表格"><table><thead><tr>' + header + '</tr></thead><tbody>' + ''.join(body) + '</tbody></table></div>')
            continue
        elif re.match(r'^(?:[-*] |\d+[.)] )', line):
            ordered = bool(re.match(r'^\d', line))
            pattern = r'^\d+[.)] ' if ordered else r'^[-*] '
            items = []
            start = int(re.match(r'\d+', line)[0]) if ordered else None
            while i < len(lines) and re.match(pattern, lines[i].strip()):
                items.append('<li>' + inline(re.sub(pattern, '', lines[i].strip())) + '</li>')
                i += 1
            tag = 'ol' if ordered else 'ul'
            attr = f' start="{start}"' if ordered else ''
            result.append(f'<{tag}{attr}>' + ''.join(items) + f'</{tag}>')
            continue
        elif line.startswith('>'):
            result.append('<blockquote>' + inline(line.lstrip('> ')) + '</blockquote>')
        else:
            result.append('<p>' + inline(line) + '</p>')
        i += 1
    return ''.join(result)


def build_case(out):
    record = json.loads((CASE / 'run.json').read_text(encoding='utf-8'))
    revision = json.loads((CASE / 'revision.json').read_text(encoding='utf-8'))
    editorial = json.loads((CASE / 'editorial.json').read_text(encoding='utf-8'))
    steps = {step['id']: step for step in record['steps']}
    for step in revision['steps']:
        if step['id'] in ('script', 'calendar'):
            steps[step['id']] = step
    esc = html.escape
    data = out / 'case-data'
    data.mkdir(exist_ok=True)
    for name in ('run.json', 'revision.json', 'brief.txt', 'feedback.txt'):
        shutil.copy2(CASE / name, data / name)
    outputs = []
    journey = []
    for i, note in enumerate(editorial['steps'], 1):
        step = steps[note['id']]
        output = step.get('output', '')
        assert note['excerpt'] in output, f"Excerpt does not match original: {note['id']}"
        (data / f"{step['id']}.txt").write_text(output, encoding='utf-8', newline='\n')
        outputs.append(f"# {i}. {step['agentName']} ({step['id']})\n\n{output}\n")
        verification = step.get('verification')
        if not step.get('acceptance'):
            verdict, state = '模板未设置模型验收', 'neutral'
        elif verification is None:
            verdict, state = '验收结果不可用', 'warning'
        else:
            verdict = '模型验收通过' if verification['pass'] else '模型验收未通过'
            if verification['reworked']:
                verdict += ' · 已返工 1 轮'
            state = '' if verification['pass'] else 'warning'
        journey.append(f'''<article class="journey-step" id="step-{step['id']}">
          <div class="step-side"><span class="num">{i:02d}</span><h3>{esc(step['agentName'])}</h3><span class="timing">{step['duration']/1000:.1f} 秒 · {'反馈后版本' if step['id'] in ('script', 'calendar') else '首轮版本'}</span><span class="check-label {state}">{verdict}</span></div>
          <div class="step-content"><h4>{esc(note['title'])}</h4><div class="handoff-line"><span>接收：{esc(note['receives'])}</span><span>交给下一步：{esc(note['hands_off'])}</span></div><blockquote>{esc(note['excerpt'])}</blockquote><p class="editorial">讲解：{esc(note['explanation'])}</p><details><summary>展开这一步的完整原始产出</summary><div class="output">{markdown(output)}<p><a href="./case-data/{step['id']}.txt" target="_blank" rel="noopener">打开原始文本 ↗</a></p></div></details></div></article>''')
    (data / 'outputs.txt').write_text('\n\n'.join(outputs), encoding='utf-8', newline='\n')
    artifacts = []
    for artifact in editorial['artifacts']:
        original = steps[artifact['step']]['output']
        assert artifact['excerpt'] in original, f"Artifact does not match original: {artifact['title']}"
        artifacts.append(f'''<article class="artifact {'full' if artifact.get('wide') else ''}"><div class="artifact-meta"><span>{esc(artifact['label'])}</span><a href="./case-data/{artifact['step']}.txt" target="_blank" rel="noopener">完整原文 ↗</a></div><h3>{esc(artifact['title'])}</h3><div class="output">{markdown(artifact['excerpt'])}</div><p class="artifact-note">{esc(artifact['note'])}</p></article>''')
    observations = ''.join(f'<article class="observation"><span class="label">{i:02d} / 观察</span><h3>{esc(item["title"])}</h3><p>{esc(item["body"])}</p></article>' for i, item in enumerate(editorial['observations'], 1))
    reviews = ''.join(f'<li>{esc(item)}</li>' for item in editorial['human_review'])
    verified = [step['verification'] for step in record['steps'] if step.get('verification')]
    passed = sum(v['pass'] for v in verified)
    done = sum(s['status'] == 'completed' for s in record['steps'])
    total_tokens = record['totalTokens']['input'] + record['totalTokens']['output']
    reused = sum(step['duration'] == 0 for step in revision['steps'])
    metrics = f'''<div><strong>{done} / {len(steps)}</strong><p>首轮完成的步骤</p><small>五个角色顺序执行</small></div><div><strong>{record['totalDuration']/1000:.1f} s</strong><p>首轮执行耗时</p><small>包含生成与模型验收</small></div><div><strong>{revision['totalDuration']/1000:.1f} s</strong><p>定向返工耗时</p><small>只重做编导与运营</small></div><div><strong>{reused} / 5</strong><p>返工时复用的步骤</p><small>定位、画像和选题不重跑</small></div>'''
    provenance = record['provenance']
    conditions = f'''<p>基准 commit：<code>{provenance['upstream_commit'][:12]}</code>；原始“做内容”模板未修改。通过 AO 调用 Claude Code 2.1.90，使用 CLI 默认模型，未指定模型名；AO 记录没有返回模型的精确名称。</p><p>首轮开始时间（UTC）：{esc(provenance['started_at'])}；结束时间（UTC）：{esc(provenance['finished_at'])}。保持模型验收开启，失败重试设为 0，单次调用超时 180 秒。</p><p>首轮设置了验收的两步结果为 {passed}/{len(verified)} 通过，但人工仍发现约束遗漏。首轮 AO 记录 {total_tokens:,} token，其中输入记录为 0；此值不应作为完整用量或费用依据。</p><p>返工使用 --resume / --from script / --feedback 的对应编程接口。<a href="./case-data/revision.json" target="_blank" rel="noopener">返工记录 ↗</a> · <a href="./case-data/feedback.txt" target="_blank" rel="noopener">完整返工意见 ↗</a></p><p>CLI 接入使用串行调度；本次没有演示自动选人、并行执行、视频生成或对单次提示词的质量优势。</p>'''
    before = editorial['revision']['before']
    after = editorial['revision']['after']
    assert before in next(s['output'] for s in record['steps'] if s['id'] == 'script')
    assert after in steps['script']['output']
    revision_html = f'''<section class="wrap rework-section" id="rework"><div class="section-head"><div><p class="overline">发现偏差 → 带反馈续跑</p><h2>初稿偏离要求，只让相关角色返工</h2></div></div><p class="section-intro">人工发现脚本安排了真人出镜，且首轮日历把 2026 年 9 月 21 日标为星期日（实际为星期一）。保留前三步，从编导开始修订，并让运营用新脚本重排日历。</p><div class="rework-grid"><article><span class="label">首轮脚本原文</span><blockquote>{esc(before)}</blockquote><p>与“不露脸，只屏幕录制加口播”冲突。</p></article><article><span class="label">反馈后的脚本原文</span><blockquote>{esc(after)}</blockquote><p>完整返工意见还补充了缺失信息处理、12 个明确日期和每日工作量限制。</p></article></div><div class="resume-path"><span>定位 · 复用</span><span>画像 · 复用</span><span>选题 · 复用</span><strong>脚本 · 重做</strong><strong>日历 · 重做</strong></div><a class="source-link" href="./case-data/feedback.txt" target="_blank" rel="noopener">查看这次提交的完整反馈 ↗</a></section>'''
    replacements = {
        '{{METRICS}}': metrics,
        '{{RUN_NOTE}}': '实测时间：2026-09-17。使用原库固定五角色模板；账号设定为演示简报，产出来自实际模型调用。',
        '{{REVISION}}': revision_html,
        '{{JOURNEY}}': ''.join(journey),
        '{{DELIVERY}}': '<div class="delivery-grid">' + ''.join(artifacts) + '</div>',
        '{{OBSERVATIONS}}': '<div class="observation-grid">' + observations + '</div><div class="review-callout"><h3>人工复核：交付前还需要处理</h3><ul>' + reviews + '</ul></div>',
        '{{PROVENANCE}}': conditions,
        '{{SOURCE}}': SOURCE,
    }
    page = (HERE / 'case.template.html').read_text(encoding='utf-8')
    for key, value in replacements.items():
        page = page.replace(key, value)
    (out / 'case-content.html').write_text(page, encoding='utf-8', newline='\n')
    shutil.copy2(HERE / 'case.css', out / 'case.css')
