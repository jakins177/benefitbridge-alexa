/* eslint-disable @typescript-eslint/no-require-imports -- standalone Node CommonJS media reproduction harness */
/** Purpose: create an honest, caption-led BenefitBridge submission review video.
 * Function: combine real local browser footage, genuine stills and text slides using installed ffmpeg.
 * Inputs: ../benefitbridge-demo-silent.mp4, ../desktop-intro.png, ../mobile-plan.png.
 * Outputs: benefitbridge-final-demo.mp4, segments, text assets, probe.json and verbose render.log.
 * No network, TTS, cloud calls or third-party dependencies. Run: node reports/final-demo/edit-demo.cjs
 */
const fs = require('node:fs'); const path = require('node:path'); const {spawnSync} = require('node:child_process');
const out = __dirname; const reports = path.dirname(out); const font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
const logFile=path.join(out,'render.log'); fs.writeFileSync(logFile,'');
function log(s){console.log(s); fs.appendFileSync(logFile,s+'\n');}
function run(cmd,args){log('[command] '+cmd+' '+JSON.stringify(args)); const r=spawnSync(cmd,args,{encoding:'utf8',maxBuffer:32*1024*1024});fs.appendFileSync(logFile,r.stdout||'');fs.appendFileSync(logFile,r.stderr||'');if(r.error)throw r.error;if(r.status!==0)throw new Error(cmd+' exit '+r.status+'\n'+r.stderr);return r.stdout;}
function txt(name,value){const p=path.join(out,name+'.txt');fs.writeFileSync(p,value);return p;}
function draw(p,size,x,y,color='white'){return "drawtext=fontfile="+font+":textfile="+p+":fontcolor="+color+":fontsize="+size+":x="+x+":y="+y+":line_spacing=18";}
const segments=[];
function encode(name,duration,input,filters){log('[segment] '+name+' '+duration+' seconds');const target=path.join(out,name+'.mp4');run('ffmpeg',['-hide_banner','-y',...input,'-vf',filters,'-t',String(duration),'-r','25','-an','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p',target]);segments.push(target);}
function slide(name,duration,kicker,title,body){const k=txt(name+'-kicker',kicker),t=txt(name+'-title',title),b=txt(name+'-body',body);encode(name,duration,['-f','lavfi','-i','color=c=0x103e34:s=1920x1080:r=25'],["drawbox=x=90:y=170:w=90:h=7:color=0xc7e66b:t=fill",draw(k,26,90,95,'0xc7e66b'),draw(t,60,90,220),draw(b,35,90,400),draw(txt(name+'-footer','BenefitBridge  |  Fictional Kansas household  |  Local browser simulation'),23,90,1000,'0xc7e66b')].join(','));}
function still(name,duration,file,caption){const c=txt(name+'-caption',caption);encode(name,duration,['-loop','1','-i',file],[...(name==='06-mobile'?['crop=390:844:0:0']:[]),'scale=1580:880:force_original_aspect_ratio=decrease','pad=1920:1080:(ow-iw)/2:35:color=0x103e34',draw(c,30,'(w-text_w)/2',955)].join(','));}
try{log('[start] '+new Date().toISOString());
slide('01-title',12,'A CLEAR NEXT STEP','BenefitBridge','From “I lost my job” to a source-linked action plan.\nAn Alexa+-style conversation, demonstrated in a local browser.\nNo actual Alexa device or live AWS execution is shown.');
still('02-intro',12,path.join(reports,'desktop-intro.png'),'A fictional-data simulator, not a government application service.');
slide('03-scenario',12,'THE FICTIONAL HOUSEHOLD','One difficult moment. A short intake.','Kansas • recent job loss • three people, including a child.\nExpected monthly gross income: $1,200.\nNo health coverage; responsible for home-energy costs.\nThese answers organize next steps. They do not determine eligibility.');
const cap=txt('04-live-caption','REAL LOCAL BROWSER CAPTURE  |  Fictional data  |  Silent recording');
encode('04-browser',44.64,['-i',path.join(reports,'benefitbridge-demo-silent.mp4')],['setpts=2*PTS','scale=1580:880:force_original_aspect_ratio=decrease','pad=1920:1080:(ow-iw)/2:35:color=0x103e34',draw(cap,28,'(w-text_w)/2',960)].join(','));
slide('05-plan',16,'WHY THESE FOUR PROGRAMS?','Reasons. Official links. Next actions.','Unemployment: temporary, partial wage replacement.\nFood Assistance: help qualifying households buy food.\nKanCare: medical-assistance application pathways.\nLIEAP: the 2026 window is closed; recheck the official source.\nAgencies make final decisions. No applications are submitted here.');
still('06-mobile',10,path.join(reports,'mobile-plan.png'),'Actual mobile browser screenshot  |  Not an Alexa device screen');
slide('07-storage',14,'CONTROL AND CONSENT','Local means local.','Session-only by default; on-device saving requires opt-in.\nThe capture shows task progress and on-device persistence.\nIt does not prove DynamoDB or cross-device resume.\nThe 30-day recheck is not live monitoring or an outbound notification.');
slide('08-architecture',18,'IMPLEMENTED SOURCE ARCHITECTURE','Two deliberately separate paths.','Browser → shared deterministic routing → local session / opt-in storage.\nPrivate operator MCP → constrained optional Bedrock language support.\nConfigured cloud adapters: DynamoDB + EventBridge → due-marker Lambda.\nBrowser does not carry the operator token or call the private MCP.\nThis slide describes source capability, not fresh cloud execution.');
slide('09-evidence',15,'VERIFIED LOCALLY • OCTOBER 13, 2026','Proof, with limits.','31 tests passed; Chrome desktop and mobile acceptance passed.\nLint and production build passed. Production npm audit: zero findings.\nFull audit: five HIGH development-chain entries; braces remains unpatched.\nThis recording demonstrates the local simulator, not cloud execution.\nSee the release evidence for separately verified deployment status.');
slide('10-close',12,'BENEFITBRIDGE','A manageable next step.','Fictional demonstration • Kansas only • preliminary information.\nNo government endorsement, Alexa certification or benefit promise.\nSource: github.com/jakins177/benefitbridge-alexa\nOwner review, rules verification and final submission remain pending.');
const list=path.join(out,'concat.txt');fs.writeFileSync(list,segments.map(p=>"file '"+p+"'").join('\n'));
run('ffmpeg',['-hide_banner','-y','-f','concat','-safe','0','-i',list,'-c','copy','-movflags','+faststart',path.join(out,'benefitbridge-final-demo.mp4')]);
const probe=run('ffprobe',['-v','error','-show_format','-show_streams','-of','json',path.join(out,'benefitbridge-final-demo.mp4')]);fs.writeFileSync(path.join(out,'probe.json'),probe);const p=JSON.parse(probe);if(Number(p.format.duration)>=180)throw new Error('Video must be shorter than 180 seconds');log('[done] '+p.format.duration+' seconds; streams '+p.streams.map(s=>s.codec_type+':'+s.codec_name).join(', '));
}catch(e){log('[ERROR] '+(e.stack||String(e)));process.exitCode=1;}
