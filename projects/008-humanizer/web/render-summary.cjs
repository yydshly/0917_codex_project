// Optional PNG export. Requires Playwright and its Chromium browser.
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const path = require('path');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1800,height:2600},deviceScaleFactor:1.5});
  const assets = path.resolve(__dirname,'../assets');
  const svg = fs.readFileSync(path.join(assets,'capability-summary.svg'),'utf8');
  await page.setContent('<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>html,body{margin:0;width:1800px;height:2600px}svg{display:block}</style></head><body>'+svg+'</body></html>');
  await page.evaluate(()=>document.fonts.ready);
  const overflow = await page.evaluate(()=>{
    const boxes = [...document.querySelectorAll('rect')].slice(1).map(r=>r.getBBox());
    return [...document.querySelectorAll('text')].flatMap(t=>{
      const b=t.getBBox();
      const containing=boxes.find(r=>b.x>=r.x && b.x<r.x+r.width && b.y>=r.y && b.y<r.y+r.height);
      if(b.x<0||b.y<0||b.x+b.width>1800||b.y+b.height>2600)return [{text:t.textContent,reason:'canvas bounds'}];
      if(containing && (b.x+b.width>containing.x+containing.width-8||b.y+b.height>containing.y+containing.height-8))return [{text:t.textContent,reason:'panel bounds'}];
      return [];
    });
  });
  if(overflow.length) throw Error(JSON.stringify(overflow,null,2));
  await page.screenshot({path:path.join(assets,'capability-summary.png'),fullPage:true});
  console.log('Rendered 2700 × 3900 PNG; all text stays within canvas and panel bounds.');
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
