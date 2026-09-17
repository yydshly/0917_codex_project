// Run after the Pages workflow succeeds; requires Playwright in NODE_PATH.
const {chromium, request} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const root = path.resolve(__dirname, '../../..');
const base = 'https://yydshly.github.io/0917_codex_project/apps/005-impeccable/';
const output = path.join(root, 'site/apps/005-impeccable');
const checks = [];
const digest = data => createHash('sha256').update(data).digest('hex');
function files(dir) {
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? files(path.join(dir,e.name)) : [path.join(dir,e.name)]);
}
async function main() {
  const api = await request.newContext({timeout:60000});
  const publicFiles = files(output).filter(f => !f.endsWith('.md') && !f.endsWith('.template.html'));
  for (let i=0; i<publicFiles.length; i+=6) {
    await Promise.all(publicFiles.slice(i,i+6).map(async file => {
      const name = path.relative(output,file).split(path.sep).join('/');
      const response = await api.get(base+name);
      assert(response.ok(), `${name}: HTTP ${response.status()}`);
      const remote = await response.body();
      const local = fs.readFileSync(file);
      const normalize = data => file.endsWith('.png') ? data : Buffer.from(data.toString('utf8').replace(/\r\n/g,'\n'));
      assert.equal(digest(normalize(remote)),digest(normalize(local)),`${name}: deployed content mismatch`);
      checks.push({file:name,status:response.status(),sha256:digest(remote),matchesBuild:true});
    }));
  }
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400) errors.push(`${r.status()} ${r.url()}`);});
  const summary = JSON.parse(fs.readFileSync(path.join(root,'projects/005-impeccable/project.json'),'utf8')).summary;
  for (const width of [390,1440]) {
    await page.setViewportSize({width,height:900});
    await page.goto(base,{waitUntil:'networkidle'});
    assert.equal(await page.locator('.intro').textContent(),summary);
    assert(await page.locator('#guide img').evaluate(e=>e.complete && e.naturalWidth===2520));
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  await page.locator('[data-scenario="empty"]').click();
  const frame = page.frameLocator('#demo');
  await frame.locator('#empty-reset').click();
  assert.equal(await frame.locator('.project:visible').count(),5);
  for (const name of ['capabilities.txt','research-notes.txt','capability-summary-text.txt']) {
    await page.goto(base+name);
    assert.equal(await page.evaluate(()=>document.characterSet),'UTF-8');
    const expected = fs.readFileSync(path.join(output,name),'utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n');
    assert.equal((await page.locator('body').innerText()).replace(/\r\n/g,'\n'),expected);
  }
  assert.deepEqual(errors,[]);
  const report = {
    checkedAt:new Date().toISOString(),url:base,
    deployedCommit:process.env.DEPLOY_COMMIT || null,
    workflow:process.env.DEPLOY_RUN || null,
    files:checks.sort((a,b)=>a.file.localeCompare(b.file)),
    browser:{version:browser.version(),desktopAndMobile:true,guideLoaded:true,summaryMatches:true,noHorizontalOverflow:true,emptyRecovery:true,chineseTextUtf8:true,errors}
  };
  if (process.env.VERIFY_ONLY !== '1') fs.writeFileSync(path.join(__dirname,'deployment.json'),JSON.stringify(report,null,2)+'\n');
  console.log(`Verified ${checks.length} published files, desktop/mobile layout, guide, interaction and Chinese text.`);
  await browser.close(); await api.dispose();
}
main().catch(e=>{console.error(e);process.exit(1);});
