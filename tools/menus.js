// Screenshot every menu screen.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const out = process.argv[2], W = +process.argv[3], H = +process.argv[4];
(async () => {
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const ctx = await b.newContext({viewport:{width:W,height:H}, deviceScaleFactor:2, hasTouch:true, isMobile:true});
  const p = await ctx.newPage(); const errs=[]; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(2000);
  const tag = `${W}x${H}`;
  await p.screenshot({path:`${out}/m-title-${tag}.png`});
  await p.click('[data-act="race"]'); await p.waitForTimeout(400); await p.screenshot({path:`${out}/m-rider-${tag}.png`});
  await p.click('#rider-go'); await p.waitForTimeout(400); await p.screenshot({path:`${out}/m-veh-${tag}.png`});
  await p.click('#veh-go'); await p.waitForTimeout(1500); await p.screenshot({path:`${out}/m-track-${tag}.png`});
  await p.evaluate(async () => { App.save.seenHelp = true; await startRace(); const r = App.race; r.countdown = 0; r.humans[0].ai = {skill:.9,aggr:.6,t:0,tx:0,inp:{}};
    while (!r.over) { stepRace(r, [Object.assign({}, aiThink(r, r.humans[0], STEP, r.humans[0].z))], STEP); r.events.length = 0; } r.overT = 0; });
  await p.waitForTimeout(1500); await p.screenshot({path:`${out}/m-results-${tag}.png`});
  await p.evaluate(() => { renderTitle(); openSettings(); }); await p.waitForTimeout(300); await p.screenshot({path:`${out}/m-settings-${tag}.png`});
  await p.evaluate(() => openHelp()); await p.waitForTimeout(300); await p.screenshot({path:`${out}/m-help-${tag}.png`});
  console.log(errs.join('\n') || 'no errors'); await b.close();
})();
