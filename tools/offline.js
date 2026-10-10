// Offline test: load once (SW caches), go offline, reload, start a race.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const ctx = await b.newContext({viewport:{width:844,height:390}});
  const p = await ctx.newPage(); const errs=[]; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(2500);
  const n = await p.evaluate(async () => { await navigator.serviceWorker.ready; const ks = await caches.keys(); const c = await caches.open(ks[0]); return ks[0] + ' ' + (await c.keys()).length; });
  console.log('cache', n);
  await ctx.setOffline(true);
  await p.reload(); await p.waitForTimeout(2000);
  const ok = await p.evaluate(async () => { App.save.seenHelp = true; App.mode='race'; App.pick={riders:['priya'],vehs:['bmx'],track:'f2'}; await startRace(); await new Promise(r=>setTimeout(r,4500)); return { racing: !!App.race, z: App.race.humans[0].z, font: document.fonts.check('20px Bangers') }; });
  console.log('offline', JSON.stringify(ok));
  console.log(errs.join('\n') || 'no errors'); await b.close();
})();
