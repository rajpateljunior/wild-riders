// Gameplay screenshots per track at a given viewport (phone/iPad), optionally split screen.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const out = process.argv[2], W = +process.argv[3], H = +process.argv[4], tracks = (process.argv[5]||'f1').split(','), split = process.argv[6]==='split', secs = +(process.argv[7]||6);
(async () => {
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const ctx = await b.newContext({viewport:{width:W,height:H}, deviceScaleFactor:2, hasTouch:true, isMobile:true});
  const p = await ctx.newPage();
  const errs=[]; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1500);
  for (const t of tracks) {
    await p.evaluate(async ({t, split}) => {
      App.save.seenHelp = true; App.mode = split ? 'split' : 'race';
      App.pick = { riders: ['kaito','priya'], vehs: ['mtb','dirt'], track: t };
      window.__auto = true;
      await startRace();
    }, {t, split});
    // autopilot humans for screenshots
    await p.evaluate(() => { const r = App.race; r.humans.forEach(h => h.ai = { skill: 0.9, aggr: 0.8, t: 0, tx: 0, inp: {} }); window.readPlayerOrig = window.readPlayerOrig || readPlayer; window.readPlayer = (i) => { const h = App.race && App.race.humans[i]; return h ? Object.assign({}, aiThink(App.race, h, 1/60, h.z)) : {}; }; });
    await p.waitForTimeout(secs * 1000);
    await p.screenshot({path: `${out}/${t}${split?'-split':''}-${W}x${H}.png`});
    await p.evaluate(() => quitRace(false));
    await p.waitForTimeout(300);
  }
  console.log(errs.join('\n') || 'no errors');
  await b.close();
})();
