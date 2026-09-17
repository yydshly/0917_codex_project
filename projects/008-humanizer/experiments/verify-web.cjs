// Run from the research repository root, with Playwright and Chromium installed.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('fs');
const assert = require('assert');
(async () => {
 const browser = await chromium.launch({headless:true});
 const page = await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 const url=process.env.HUMANIZER_URL || 'http://127.0.0.1:8878/apps/008-humanizer/';
 fs.mkdirSync('.tmp',{recursive:true});
 await page.goto(url);
 await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.locator('.rule').count(),25);
 await page.screenshot({path:'projects/008-humanizer/assets/overview-desktop.png'});
 await page.locator('nav a[href="#guide"]').click();
 const guideImage=page.locator('.guide-figure img');
 await guideImage.scrollIntoViewIfNeeded();
 await guideImage.evaluate(img=>img.decode());
 assert(await guideImage.evaluate(img=>img.complete && img.naturalWidth===1800 && img.naturalHeight===2600));
 await page.screenshot({path:'.tmp/humanizer-guide-desktop.png'});
 for(const [group,count] of [['A',5],['B',6],['C',7],['D',3],['E',4]]){
   await page.locator(`.filters button[data-group="${group}"]`).click();
   assert.equal(await page.locator('.rule:visible').count(),count);
 }
 await page.locator('.filters button[data-group="all"]').click();
 await page.locator('#rule-search').fill('权威');
 assert.equal(await page.locator('.rule:visible').count(),7);
 await page.locator('#rule-search').fill('破折号');
 assert.equal(await page.locator('.rule:visible').count(),1);
 await page.locator('#rule-search').fill('没有这样的规则-xyz');
 assert.equal(await page.locator('.rule:visible').count(),0);
 assert(await page.locator('#empty-state').isVisible());
 await page.locator('#reset-filter').click();
 assert.equal(await page.locator('.rule:visible').count(),25);
 const first=page.locator('.rule summary').first();
 await first.focus(); await first.press('Enter');
 assert(await page.locator('.rule').first().evaluate(e=>e.open));
 await first.press('Enter');
 assert(!(await page.locator('.rule').first().evaluate(e=>e.open)));
 for (const name of ['report','docs','product']){
   await page.locator(`[data-example="${name}"]`).click();
   assert.equal(await page.locator(`[data-example="${name}"]`).getAttribute('aria-pressed'),'true');
 }
 await page.locator('[data-example="report"]').focus();
 await page.locator('[data-example="report"]').press('Enter');
 assert((await page.locator('#after-text').textContent()).includes('3 个接口'));
 await page.locator('[data-example="product"]').click();
 const widths=[];
 for(const width of [1440,1024,768,390,320]){
   await page.setViewportSize({width,height:900});
   await page.goto(url);
   assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),`Overflow at ${width}`);
   await page.locator('.rule summary').first().click();
   await page.locator('.prompt-box summary').click();
   assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),`Expanded overflow at ${width}`);
   widths.push(width);
 }
 const broken = await page.evaluate(()=>Array.from(document.querySelectorAll('a[href^="#"]')).map(a=>a.getAttribute('href')).filter(h=>h!=='#'&&!document.getElementById(h.slice(1))));
 assert.deepEqual(broken,[]);
 const localLinks = await page.locator('a').evaluateAll(as=>[...new Set(as.map(a=>a.href).filter(h=>h.startsWith(location.origin)&&!h.includes('#')))]);
 for(const link of localLinks){const response=await page.request.get(link);assert(response.ok(),`${link} ${response.status()}`)}
 await page.setViewportSize({width:390,height:844});
 await page.goto(url);
 await page.screenshot({path:'projects/008-humanizer/assets/overview-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(url);
 await page.screenshot({path:'.tmp/humanizer-full.png',fullPage:true});
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
 const fallback=await nojs.newPage();await fallback.goto(url);
 assert.equal(await fallback.locator('.rule:visible').count(),25);
 await fallback.locator('.rule summary').first().click();
 assert(await fallback.locator('.rule').first().evaluate(e=>e.open));
 assert.deepEqual(errors,[]);
 const result={date:new Date().toISOString(),url,viewports:widths,patterns:25,checks:['guide anchor and image load','category counts','search','empty recovery','keyboard expansion','example switching','keyboard example selection','no horizontal overflow','local links including PNG, SVG and text','anchor targets','no JavaScript fallback','no browser errors'],scope:'Static-page checks only; no Humanizer model calls. Deployment status requires separate verification.'};
 fs.mkdirSync('projects/008-humanizer/experiments',{recursive:true});
 fs.writeFileSync('projects/008-humanizer/experiments/web-check.json',JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result,null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
