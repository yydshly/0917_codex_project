// NODE_PATH must point to an environment containing Playwright.
const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
(async()=>{
  const assets=path.resolve(__dirname,'../assets');
  const browser=await chromium.launch({headless:true});
  try {
    const page=await browser.newPage({viewport:{width:1680,height:2520},deviceScaleFactor:1.5});
    await page.setContent('<!doctype html><meta charset="utf-8"><style>html,body{margin:0}svg{display:block}</style>'+fs.readFileSync(path.join(assets,'capability-summary.svg'),'utf8'));
    await page.evaluate(()=>document.fonts.ready);
    const outside=await page.locator('svg text').evaluateAll(nodes=>nodes.filter(n=>{const r=n.getBBox();return r.x<0||r.y<0||r.x+r.width>1680||r.y+r.height>2520}).map(n=>n.textContent));
    assert.deepEqual(outside,[]);
    await page.screenshot({path:path.join(assets,'capability-summary.png'),timeout:20000});
    console.log('Rendered 2520 x 3780 PNG; no text extends outside the SVG canvas.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
