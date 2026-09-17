// Requires Playwright in NODE_PATH. Checks the served static research page.
const { chromium, request } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const project = path.resolve(__dirname, '..');
const root = path.resolve(project, '../..');
const base = process.env.RESEARCH_BASE || 'http://127.0.0.1:8766/apps/006-narrator-ai-cli-skill/';
const online = base.startsWith('https:');
const checks = [];
const errors = [];
async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({width, height: 900});
    await page.goto(base, {waitUntil:'networkidle'});
    assert.equal(await page.locator('h1').innerText(), '一份 Skill，\n串起素材到成片。');
    const sizes = await page.evaluate(() => ({viewport: innerWidth, page: document.documentElement.scrollWidth, imageLoaded: document.querySelector('img').naturalWidth === 2160}));
    assert(sizes.page <= sizes.viewport, `overflow at ${width}`);
    assert(sizes.imageLoaded, 'guide image not loaded');
    const anchors = await page.locator('a[href^="#"]').evaluateAll(links => links.map(a => ({href:a.getAttribute('href'), valid:!!document.getElementById(a.hash.slice(1))})));
    assert(anchors.every(a => a.valid), JSON.stringify(anchors));
    checks.push({name:'viewport, image and anchors', width, ...sizes, passed:true});
    if (!online && [390,1280].includes(width)) {
      await page.screenshot({path:path.join(project, 'assets', width === 390 ? 'study-mobile.png' : 'study-desktop.png'), fullPage:true});
    }
  }
  const summary = page.locator('details summary').first();
  await summary.focus(); await summary.press('Enter');
  assert(await page.locator('details').first().evaluate(e=>e.open));
  await summary.press('Enter');
  assert.equal(await page.locator('details').first().evaluate(e=>e.open), false);
  await page.locator('nav a[href="#guide"]').click();
  assert(page.url().endsWith('#guide'));
  checks.push({name:'keyboard details and guide navigation',passed:true});
  const api = await request.newContext();
  const publicDir = path.join(root,'site/apps/006-narrator-ai-cli-skill');
  for (const name of fs.readdirSync(publicDir)) {
    const response = await api.get(base+name);
    assert(response.ok(), `${name}: ${response.status()}`);
    const body = await response.body();
    const normalize = b => name.endsWith('.png') ? b : Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'));
    const digest = b => createHash('sha256').update(normalize(b)).digest('hex');
    assert.equal(digest(body), digest(fs.readFileSync(path.join(publicDir,name))), `${name}: content mismatch`);
    checks.push({name:'public file matches build',file:name,passed:true});
  }
  await api.dispose();
  await browser.close();
  assert.deepEqual(errors,[]);
  fs.mkdirSync(path.join(project,'experiments'),{recursive:true});
  fs.writeFileSync(path.join(project,'experiments',online?'deployment.json':'browser-checks.json'), JSON.stringify({checkedAt:new Date().toISOString(),base,checks,errors},null,2)+'\n');
  console.log(`${online?'Online':'Local'} checks passed: ${checks.length}`);
}
main().catch(e=>{console.error(e);process.exit(1)});
