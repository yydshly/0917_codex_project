// Real run of the pinned upstream content workflow; no mock responses.
// Uses the user's existing Claude CLI login; tools are disabled by AO's connector.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const upstream = join(root, 'upstream/agency-orchestrator');
const caseDir = join(root, 'projects/003-agency-orchestrator/cases/content-launch');
const rawDir = join(root, '.tmp/agency-orchestrator-content-launch');
mkdirSync(rawDir, { recursive: true });
const { run, findLatestOutput } = await import(pathToFileURL(join(upstream, 'dist/index.js')));
const revise = process.argv.includes('--feedback');
const resumeDir = revise ? findLatestOutput(rawDir) : undefined;
if (revise && !resumeDir) throw new Error('No previous raw run archive to resume');
const startedAt = new Date().toISOString();
const result = await run(join(upstream, 'workflows/一人公司-做内容.yaml'), {
  direction: readFileSync(join(caseDir, 'brief.txt'), 'utf8').trim(),
}, {
  outputDir: rawDir,
  llmOverride: { provider: 'claude-code', model: '', retry: 0, timeout: 180000 },
  verify: true,
  signalFlush: true,
  ...(revise ? {
    resumeDir,
    fromStep: 'script',
    feedback: readFileSync(join(caseDir, 'feedback.txt'), 'utf8').trim(),
  } : {}),
});
// The raw archive may contain local paths. The shareable record excludes them.
const { file: localWorkflowPath, ...shareable } = result;
const recordName = revise ? 'revision.json' : 'run.json';
writeFileSync(join(caseDir, recordName), JSON.stringify({
  provenance: {
    mode: 'real-model-run',
    upstream_commit: '1f36dba95ef70a0f3c3559cac16acd9898622ad9',
    workflow: 'workflows/一人公司-做内容.yaml',
    provider: 'claude-code',
    model: 'Claude CLI default; no model override',
    cli_version: '2.1.90',
    started_at: startedAt,
    finished_at: new Date().toISOString(),
    verify_enabled: true,
    retry: 0,
    per_call_timeout_ms: 180000,
    workflow_modified: false,
    ...(revise ? { revision_of: 'run.json', from_step: 'script', feedback_file: 'feedback.txt' } : {}),
    source_material: 'brief.txt; user-facing demo brief authored for this case',
  },
  ...shareable,
}, null, 2) + '\n');
console.log('CASE_SAVED=' + join(caseDir, recordName));
process.exitCode = result.success ? 0 : 1;
