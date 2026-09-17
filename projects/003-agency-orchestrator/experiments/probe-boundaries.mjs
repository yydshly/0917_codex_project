// 本仓库编写的边界实验。仅使用预设文本，不连接任何模型或外部服务。
// 在仓库根目录运行：node projects/003-agency-orchestrator/experiments/probe-boundaries.mjs
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const script = fileURLToPath(import.meta.url);
const root = resolve(dirname(script), '../../..');
const upstream = join(root, 'upstream/agency-orchestrator');
const { buildDAG } = await import(pathToFileURL(join(upstream, 'dist/core/dag.js')));
const { executeDAG } = await import(pathToFileURL(join(upstream, 'dist/core/executor.js')));
const scratch = mkdtempSync(join(tmpdir(), 'ao-research-boundaries-'));
const llm = { provider: 'deepseek', model: 'mock', retry: 0 };
mkdirSync(join(scratch, 'research'));
writeFileSync(join(scratch, 'research/role.md'), '---\nname: Research fixture\ndescription: Offline fixture\n---\nReturn the requested text.\n');
const response = content => ({ content, usage: { input_tokens: 0, output_tokens: 0 } });
async function run(steps, connector, extra = {}) {
  const workflow = { name: 'offline-boundary-probe', agents_dir: scratch, llm, steps };
  return executeDAG(buildDAG(workflow), {
    connector, agentsDir: scratch, llmConfig: llm,
    inputs: new Map(), concurrency: 2, ...extra,
  });
}

try {
  if (process.argv.includes('--approval-child')) {
    const result = await run([
      { id: 'signoff', type: 'approval', prompt: 'yes/no?', output: 'answer' },
      { id: 'deliver', role: 'research/role', task: 'Make report', depends_on: ['signoff'] },
    ], { chat: async () => response('MOCK REPORT') });
    console.log('PROBE_JSON=' + JSON.stringify({
      answer: result.steps.find(s => s.id === 'signoff').output,
      downstream_status: result.steps.find(s => s.id === 'deliver').status,
      success: result.success,
    }));
  } else {
    const child = spawnSync(process.execPath, [script, '--approval-child'], {
      input: 'no\n', encoding: 'utf8', timeout: 15000, windowsHide: true,
    });
    assert.equal(child.status, 0, child.stderr || child.error?.message);
    const line = child.stdout.split('\n').find(s => s.includes('PROBE_JSON='));
    assert.ok(line, child.stdout);
    const approval = JSON.parse(line.slice(line.indexOf('PROBE_JSON=') + 'PROBE_JSON='.length));
    assert.equal(approval.answer, 'no');
    assert.equal(approval.downstream_status, 'completed');

    const replies = [
      'KEEP original draft',
      JSON.stringify({ pass: false, failed: [{ criterion: 'Quality', why: 'Needs revision' }] }),
      'Reworked draft without the required marker',
      JSON.stringify({ pass: true, failed: [] }),
    ];
    let calls = 0;
    const checked = await run([
      { id: 'draft', role: 'research/role', task: 'Write a draft',
        assert: { contains: ['KEEP'] }, acceptance: 'Quality is sufficient' },
    ], { chat: async () => response(replies[calls++]) }, { verify: true });
    const draft = checked.steps[0];
    assert.equal(calls, 4);
    assert.equal(draft.status, 'completed');
    assert.equal(draft.verification.pass, true);
    assert.equal(draft.output.includes('KEEP'), false);

    const observed = {};
    for (const provider of ['deepseek', 'claude-code']) {
      let active = 0, maximum = 0;
      await run(['a', 'b'].map(id => ({ id, role: 'research/role', task: 'Write' })), {
        chat: async () => {
          active++;
          maximum = Math.max(maximum, active);
          await new Promise(done => setTimeout(done, 30));
          active--;
          return response('mock');
        },
      }, { llmConfig: { ...llm, provider } });
      observed[provider] = maximum;
    }
    assert.deepEqual(observed, { deepseek: 2, 'claude-code': 1 });
    console.log(JSON.stringify({
      mode: 'offline mocks only; no real model or API calls',
      approval_without_condition: approval,
      acceptance_rework_after_assert: {
        status: draft.status, verification: draft.verification,
        final_contains_required_marker: draft.output.includes('KEEP'), calls,
      },
      max_concurrent_mock_calls: observed,
    }, null, 2));
  }
} finally {
  // scratch is the unique directory created by mkdtempSync above.
  rmSync(scratch, { recursive: true, force: true });
}
