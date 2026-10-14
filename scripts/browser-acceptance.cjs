/* eslint-disable @typescript-eslint/no-require-imports -- standalone Node CommonJS test harness */
/** Purpose: Real Chromium desktop/mobile acceptance with fictional inputs.
 * Inputs: local production server port 3026, installed Playwright/Chrome.
 * Outputs: screenshots, optional silent recording frames, loud assertion log. */
const {chromium} = require('/home/jakins1777/.npm-global/lib/node_modules/openclaw/node_modules/playwright-core');
const assert = require('node:assert/strict');
(async () => {
 console.log('[browser] start desktop and mobile acceptance');
 const browser = await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
 try {
  for (const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]) {
   const context = await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
   const page = await context.newPage(); const errors=[];
   page.on('pageerror', e=>errors.push(e.stack));
   await page.goto('http://127.0.0.1:3026');
   await page.getByLabel('Type a fictional answer').waitFor();
   assert.equal(await page.evaluate(()=>localStorage.length),0);
   await page.screenshot({path:'reports/'+name+'-intro.png',fullPage:true});
   await page.getByRole('button',{name:'I lost my job yesterday',exact:true}).click();
   await page.getByLabel('Type a fictional answer').fill('2 or 3');
   await page.getByRole('button',{name:'Review answer',exact:true}).click();
   await page.getByRole('alert').filter({hasText:'Enter one household total'}).waitFor();
   await page.getByLabel('Type a fictional answer').fill('three');
   await page.getByRole('button',{name:'Review answer',exact:true}).click();
   await page.getByRole('button',{name:'Confirm answer',exact:true}).click();
   await page.getByRole('button',{name:'Yes',exact:true}).click();
   await page.getByRole('button',{name:'$1,200',exact:true}).click();
   await page.getByLabel('Type a fictional answer').fill("I don't have coverage");
   await page.getByRole('button',{name:'Review answer',exact:true}).click();
   assert.match(await page.locator('.confirmation').innerText(),/no/);
   await page.getByRole('button',{name:'Confirm answer',exact:true}).click();
   await page.getByRole('button',{name:'Yes',exact:true}).click();
   await page.getByRole('heading',{name:'Your recovery plan is ready.'}).waitFor();
   assert.equal(await page.locator('.programDescription').count(),4);
   await page.getByRole('button',{name:'View next step',exact:true}).first().click();
   assert.equal(await page.getByRole('link',{name:'Open official source'}).getAttribute('href'),'https://www.dol.ks.gov/unemployment/overview');
   await page.getByRole('checkbox',{name:'Mark action started',exact:true}).first().check();
   await page.getByRole('button',{name:'Save 30-day follow-up',exact:true}).click();
   await page.getByRole('status').filter({hasText:'Recheck date'}).waitFor();
   assert.equal(await page.evaluate(()=>localStorage.length),0);
   await page.getByRole('checkbox',{name:'Save this fictional plan on this device'}).check();
   await page.waitForFunction(()=>localStorage.getItem('benefitbridge-demo-case-v2'));
   await page.reload();
   await page.getByRole('heading',{name:'Your recovery plan is ready.'}).waitFor();
   assert.equal(await page.getByRole('checkbox',{name:'Marked as started',exact:true}).count(),1);
   await page.screenshot({path:'reports/'+name+'-plan.png',fullPage:true});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.getByRole('button',{name:'Cancel saved follow-up',exact:true}).click();
   await page.getByRole('button',{name:'Clear demo data',exact:true}).click();
   assert.equal(await page.evaluate(()=>localStorage.length),0);
   await page.evaluate(()=>{localStorage.setItem('benefitbridge-demo-case-v2','{bad json');});
   await page.reload();
   await page.getByRole('alert').filter({hasText:'could not be restored'}).waitFor();
   await page.getByRole('button',{name:'Clear demo data',exact:true}).click();
   await page.evaluate(()=>{window.SpeechRecognition=undefined;window.webkitSpeechRecognition=undefined;});
   await page.getByRole('button',{name:'Answer by voice'}).click();
   await page.getByRole('alert').filter({hasText:'not supported'}).waitFor();
   await page.evaluate(()=>{window.SpeechRecognition=class {start(){this.onresult({results:[[{transcript:'I lost my job yesterday'}]]});this.onend();}};});
   await page.getByRole('button',{name:'Answer by voice'}).click();
   await page.getByRole('button',{name:'Confirm answer',exact:true}).waitFor();
   // A mocked speech event is not proof of real microphone/provider recognition.
   await page.getByRole('button',{name:'Confirm answer',exact:true}).click();
   await page.getByRole('button',{name:'3',exact:true}).waitFor();
   await page.getByRole('button',{name:'Clear demo data',exact:true}).click();
   await page.evaluate(()=>{window.SpeechRecognition=class {start(){this.onerror({error:'not-allowed'});this.onend();}};});
   await page.getByRole('button',{name:'Answer by voice'}).click();
   await page.getByRole('alert').filter({hasText:'Microphone access'}).waitFor();
   page.on('dialog',dialog=>dialog.accept());
   await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new DOMException('Quota exceeded','QuotaExceededError');};});
   await page.getByRole('checkbox',{name:'Save this fictional plan on this device'}).check();
   assert.equal(await page.evaluate(()=>localStorage.length),0);
   assert.deepEqual(errors,[]);
   console.log('[browser] PASS',name,'intake, clarification, negation, descriptions, links, consent, resume, cancel, clear, corrupt storage, unavailable voice, mocked speech confirmation and denial, storage quota failure, overflow, page errors');
   await context.close();
  }
  const response = await fetch('http://127.0.0.1:3026/mcp',{method:'POST'}); assert.equal(response.status,503);
  console.log('[browser] PASS unauthenticated HTTP MCP fail-closed');
 } finally { await browser.close(); }
 console.log('[browser] completed');
})().catch(error=>{console.error('[browser] FAILED',error.stack);process.exitCode=1;});
