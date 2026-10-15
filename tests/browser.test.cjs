// Run with Playwright available on NODE_PATH and a Chromium browser installed.
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');
const root = path.resolve(__dirname,'../assets/clock');
const output = path.resolve(__dirname,'../docs/previews');
fs.mkdirSync(output,{recursive:true});
const server = http.createServer((req,res)=>{
  const file = path.join(root,req.url.split('?')[0]);
  if(!file.startsWith(root+path.sep)) {res.writeHead(403).end();return;}
  fs.readFile(file,(err,data)=>{
    if(err) {res.writeHead(404).end();return;}
    res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');
    res.end(data);
  });
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL || 'msedge',headless:true});
  try {
    const page=await browser.newPage({viewport:{width:800,height:800}});
    const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
    const external=[]; page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:')) external.push(r.url());});
    const base=`http://127.0.0.1:${server.address().port}/index.html`;
    await page.clock.install({time:new Date('2025-01-01T10:09:30Z')});
    async function load(options={}) {
      await page.goto(base+'#'+encodeURIComponent(JSON.stringify({timeZone:'UTC',...options})));
      // Hash-only navigation does not recreate a document; KS does.
      await page.reload(); await page.clock.runFor(20);
    }
    await load();
    assert.equal(await page.locator('#date').textContent(),'WED 1');
    for(const [width,height] of [[800,800],[1280,800],[1920,1080],[800,1280],[480,800]]) {
      await page.setViewportSize({width,height}); await page.clock.runFor(20);
      const geometry=await page.evaluate(()=>{
        const s=document.querySelector('svg');
        const bounds=s.viewBox.baseVal;
        return ['twelve','nine','three','six','date'].map(id=>{
          const el=document.getElementById(id), b=el.getBBox(), matrix=el.getCTM(), inv=s.getCTM().inverse();
          const p=new DOMPoint(b.x,b.y).matrixTransform(matrix).matrixTransform(inv);
          const q=new DOMPoint(b.x+b.width,b.y+b.height).matrixTransform(matrix).matrixTransform(inv);
          return {id,inside:p.x>=0&&p.y>=0&&q.x<=bounds.width&&q.y<=bounds.height};
        });
      });
      assert(geometry.every(g=>g.inside),JSON.stringify(geometry));
      await page.screenshot({path:path.join(output,`original-${width}x${height}.png`)});
    }
    await page.setViewportSize({width:800,height:800});
    await page.clock.setSystemTime(new Date('2025-01-01T10:09:30Z')); await page.clock.runFor(20);
    await page.screenshot({path:path.join(output,'square.png')});
    let before=await page.locator('#second').getAttribute('style');
    await page.clock.runFor(100);
    assert.notEqual(await page.locator('#second').getAttribute('style'),before);
    // Visibility events cancel the loop, then resume at current time. This
    // tests document lifecycle logic; Android WebView suspension needs a device.
    await page.evaluate(()=>{
      Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});
      document.dispatchEvent(new Event('visibilitychange'));
    });
    before=await page.locator('#second').getAttribute('style');
    await page.clock.runFor(1000);
    assert.equal(await page.locator('#second').getAttribute('style'),before);
    await page.evaluate(()=>{
      Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.clock.runFor(20);
    assert.notEqual(await page.locator('#second').getAttribute('style'),before);
    // Simulate five minutes with the real DOM/animation loop, including midnight.
    await page.clock.setSystemTime(new Date('2025-01-01T23:59:59.900Z'));
    await page.clock.runFor(1100);
    await page.clock.fastForward(298900);
    assert.equal(await page.locator('#date').textContent(),'THU 2');
    // Suspension has no catch-up integration: the next frame follows wall time.
    await page.clock.setSystemTime(new Date('2025-02-03T03:30:00Z')); await page.clock.runFor(20);
    assert.equal(await page.locator('#date').textContent(),'MON 3');
    assert(Math.abs(await page.evaluate(()=>parseFloat(document.getElementById('hour').style.transform.slice(7)))-105)<.01);
    await load({theme:'Custom',backgroundColor:'#123456',showSeconds:false,showDate:false,layout:'Adaptive'});
    assert.equal(await page.evaluate(()=>getComputedStyle(document.body).backgroundColor),'rgb(18, 52, 86)');
    assert.equal(await page.locator('#second').evaluate(el=>getComputedStyle(el).display),'none');
    assert.equal(await page.locator('#date').evaluate(el=>getComputedStyle(el).display),'none');
    await page.setViewportSize({width:1280,height:800}); await page.clock.runFor(20);
    await page.screenshot({path:path.join(output,'adaptive-landscape.png')});
    for(const [name,palette] of Object.entries(require('../assets/clock/clock-core.js').presets)) {
      await load({theme:name,backgroundColor:'#123456'});
      assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--background')),palette[0]);
    }
    await load({timeZone:'Asia/Kolkata'});
    await page.clock.setSystemTime(new Date('2025-01-01T00:00:00Z')); await page.clock.runFor(20);
    assert(Math.abs(await page.evaluate(()=>parseFloat(document.getElementById('hour').style.transform.slice(7)))-165)<.01);
    await page.clock.setSystemTime(new Date('2025-01-01T10:09:30Z'));
    await load({timeZone:'invalid-zone'}); // safe local fallback
    assert.equal(errors.length,0,errors.join('\n')); assert.equal(external.length,0);
    console.log('Browser passed: five viewport sizes, SVG bounds, fractional sweep, five minutes across midnight, suspension, custom theme, resize, invalid zone, no external requests');
  } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});

