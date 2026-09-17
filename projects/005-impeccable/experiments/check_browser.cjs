// Set NODE_PATH to a directory containing Playwright, or install it in your environment.
const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../../..');
const origin = process.env.DEMO_ORIGIN || 'http://127.0.0.1:8766';
const base = origin + '/apps/005-impeccable/';
const checks = [];
const errors = [];
async function main() {
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1280,height:900}});
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => {if(r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);});
  for (const mode of ['before', 'after']) {
    await page.goto(base + mode + '.html');
    await page.screenshot({path:path.join(root,`projects/005-impeccable/assets/${mode}-desktop.png`),fullPage:true});
    await page.locator('#query').fill('impeccable');
    assert.equal(await page.locator('.project:visible').count(), 1);
    await page.locator('#kind').selectOption('工程工具');
    assert.equal(await page.locator('.project:visible').count(), 0);
    await page.locator('#reset').click();
    assert.equal(await page.locator('.project:visible').count(), 5);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'query');
    await page.locator('#kind').selectOption('角色库');
    assert.equal(await page.locator('.project:visible').count(), 2);
    checks.push({name:`${mode}: 搜索、组合筛选、清除筛选与恢复焦点`,passed:true});
  }
  await page.goto(base + 'after.html?scenario=empty');
  assert.equal(await page.locator('.project:visible').count(),0);
  assert(await page.locator('#empty-reset').isVisible());
  await page.locator('#empty-reset').click();
  assert.equal(await page.locator('.project:visible').count(),5);
  assert.equal(await page.evaluate(() => document.activeElement.id),'query');
  const summary = page.locator('details summary').first();
  await summary.focus(); await summary.press('Enter');
  assert(await page.locator('details').first().evaluate(e=>e.open));
  await summary.press('Enter');
  assert.equal(await page.locator('details').first().evaluate(e=>e.open),false);
  checks.push({name:'改造后：空结果说明、恢复全部、键盘展开与收起',passed:true});
  for(const width of [320,390,768,1280]) {
    await page.setViewportSize({width,height:900});
    await page.goto(base+'after.html?scenario=long');
    const size = await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth,headingHeight:document.querySelector('.project h3').getBoundingClientRect().height}));
    assert(size.scroll <= size.viewport, `overflow at ${width}`);
    checks.push({name:'改造后长标题与视口',width,...size,passed:true});
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto(base+'after.html');
  await page.screenshot({path:path.join(root,'projects/005-impeccable/assets/after-mobile.png'),fullPage:true});
  await page.goto(base+'before.html');
  const baseline = await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth}));
  assert(baseline.scroll > baseline.viewport);
  checks.push({name:'基线缺陷复现：手机横向溢出',...baseline,expectedDefect:true});
  await page.screenshot({path:path.join(root,'projects/005-impeccable/assets/before-mobile.png')});
  await page.goto(base+'after.html?scenario=long');
  await page.evaluate(()=>{
    const elements=[...document.querySelectorAll('body,body *')];
    const sizes=elements.map(e=>parseFloat(getComputedStyle(e).fontSize));
    elements.forEach((e,i)=>e.style.fontSize=sizes[i]*2+'px');
  });
  const enlarged = await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth}));
  assert(enlarged.scroll <= enlarged.viewport,'200% text overflow');
  checks.push({name:'390px 下逐元素字号放大至 200%（不是浏览器缩放/实体设备）',...enlarged,passed:true});
  await page.goto(base+'after.html?scenario=empty');
  await page.screenshot({path:path.join(root,'projects/005-impeccable/assets/empty-mobile.png')});
  await page.setViewportSize({width:1280,height:900});
  await page.goto(base);
  for(const scenario of ['mobile','long','empty','normal']) {
    await page.locator(`[data-scenario="${scenario}"]`).click();
    for(const version of ['before','after']){
      await page.locator(`[data-version="${version}"]`).click();
      await page.frameLocator('#demo').locator('#query').waitFor();
      const src=await page.locator('#demo').getAttribute('src');
      assert(src.startsWith(version));
      assert.equal(await page.locator(`[data-version="${version}"]`).getAttribute('aria-pressed'),'true');
      assert.equal(await page.locator('#standalone').getAttribute('href'),src);
    }
  }
  checks.push({name:'研究页：4 个场景 × 2 个版本切换与独立打开链接',passed:true});
  for(const width of [320,390,768,1280]){
    await page.setViewportSize({width,height:900});
    await page.goto(base);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`study overflow ${width}`);
    checks.push({name:'研究页响应式',width,passed:true});
  }
  const hrefs=await page.locator('a[href]').evaluateAll(a=>a.map(e=>e.getAttribute('href')));
  for(const href of hrefs){
    if(href.startsWith('#')) assert(await page.locator(href).count(),href);
    else if(!/^https?:/.test(href) && href !== 'browser-checks.json'){
      const response=await page.request.get(new URL(href,base).href);
      assert.equal(response.status(),200,href);
    }
  }
  checks.push({name:'研究页锚点、证据下载、截图与站内链接',passed:true});
  await page.setViewportSize({width:1440,height:1040});
  await page.goto(base);
  await page.screenshot({path:path.join(root,'projects/005-impeccable/assets/study-desktop.png')});
  await page.evaluate(()=>window.scrollTo({top:document.querySelector('#experiment').getBoundingClientRect().top+scrollY-90,behavior:'instant'}));
  await page.screenshot({path:path.join(root,'projects/005-impeccable/assets/comparison-desktop.png')});
  await page.setViewportSize({width:390,height:844});
  await page.goto(base);
  await page.screenshot({path:path.join(root,'projects/005-impeccable/assets/study-mobile.png')});
  const nojs=await browser.newContext({javaScriptEnabled:false});
  const read=await nojs.newPage();
  await read.goto(base+'after.html');
  assert.equal(await read.locator('.project').count(),5);
  await read.locator('details summary').first().click();
  assert(await read.locator('details').first().evaluate(e=>e.open));
  checks.push({name:'禁用 JavaScript：5 个项目与原生 details 可读',passed:true});
  await page.route('**/0917_codex_project/**',async route=>{
    const pathname=new URL(route.request().url()).pathname.replace('/0917_codex_project/','');
    let file=path.join(root,'site',pathname);
    if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    if(!fs.existsSync(file))return route.fulfill({status:404,body:'Not found'});
    const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.json':'application/json','.png':'image/png'}[path.extname(file)] || 'text/plain';
    await route.fulfill({status:200,contentType:mime,body:fs.readFileSync(file)});
  });
  await page.goto(origin+'/0917_codex_project/apps/005-impeccable/');
  await page.locator('[data-version="before"]').click();
  await page.frameLocator('#demo').locator('#query').waitFor();
  assert.equal(await page.locator('.topbar').evaluate(e=>getComputedStyle(e).display),'flex');
  await page.locator('.brand').click();
  assert.equal(await page.title(),'开源研究集 · 项目索引');
  checks.push({name:'模拟 GitHub Pages /0917_codex_project/ 子路径：样式、脚本、iframe 与返回首页',passed:true});
  assert.deepEqual(errors,[]);
  const result={recordedAt:new Date().toISOString(),browser:await browser.version(),status:'passed',checks,errors,limitations:['不是实体手机测试','不是完整无障碍审计','未测用户任务耗时、转化率或模型因果增益','检测结果为默认页面状态，交互状态由本脚本另验']};
  fs.writeFileSync(path.join(__dirname,'browser-checks.json'),JSON.stringify(result,null,2)+'\n');
  fs.copyFileSync(path.join(__dirname,'browser-checks.json'),path.join(root,'site/apps/005-impeccable/browser-checks.json'));
  assert.equal((await page.request.get(base+'browser-checks.json')).status(),200);
  console.log(JSON.stringify(result,null,2));
  await browser.close();
}
main().catch(e=>{console.error(e);process.exit(1)});
