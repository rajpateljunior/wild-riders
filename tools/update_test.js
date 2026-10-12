// Update banner test (real service worker). Needs WR_UPD_DIR with folders: live (previous release), v2 (this build),
// v3 (this build with APP_VERSION bumped), served at http://localhost:8795/ from WR_UPD_DIR. See NOTES.md.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const { execSync } = require('child_process');
const U=process.env.WR_UPD_DIR; const URL='http://localhost:8795/site/index.html';
let fails=0; const check=(c,m)=>{ if(!c){fails++;console.log('FAIL',m);} };
const deploy=(v)=>execSync('rm -rf '+U+'/site && cp -r '+U+'/'+v+' '+U+'/site');
(async () => {
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const ctx = await b.newContext({viewport:{width:844,height:390}, hasTouch:true, isMobile:true});
  const p = await ctx.newPage(); const errs=[]; p.on('pageerror', e=>errs.push(e.message));
  const state = () => p.evaluate(() => ({ ver: typeof APP_VERSION!=='undefined'?APP_VERSION:'old', banner: !!document.querySelector('#upd') && !document.querySelector('#upd').classList.contains('hidden'), modal: !document.querySelector('#modal').classList.contains('hidden') ? (document.querySelector('.mbox h3')||{}).textContent : null, save: localStorage.getItem('wild-riders-save-v1') }));
  // A: the version that is live today
  await p.goto(URL); await p.waitForTimeout(5000);
  await p.evaluate(() => { App.save.stars={f1:3,d1:2}; App.save.vehs.push('ebike'); App.save.races=12; App.save.coins=4321; App.save.spin={last:'x',streak:0,seen:0}; saveGame(); });
  await p.evaluate(() => navigator.serviceWorker.ready); await p.waitForTimeout(800);
  const saveA = JSON.parse((await state()).save);
  console.log('A live version, save stars', JSON.stringify(saveA.stars));
  // B: deploy this build. Open the app again like a player would, a few times
  deploy('v2');
  let st, n=0;
  for (; n<6; n++) { await p.reload(); await p.waitForTimeout(5000); st = await state(); if (st.banner || st.ver==='2026.10.12b') break; }
  console.log('B after', n+1, 'opens: version', st.ver, 'banner', st.banner, 'popup', st.modal);
  // (the version live today updates itself the old way; the banner starts with the NEXT release)
  if (st.modal) { await p.evaluate(() => closeModal()); }
  if (st.banner) { await p.click('#upd button'); await p.waitForTimeout(5000); }
  await p.reload(); await p.waitForTimeout(5000);
  st = await state();
  console.log('   after UPDATE tap: version', st.ver, 'popup', st.modal, 'banner', st.banner);
  check(st.ver==='2026.10.12b' && !st.banner, 'on new version after tapping update');
  const sB = JSON.parse(st.save);
  check(JSON.stringify(sB.stars)===JSON.stringify(saveA.stars) && JSON.stringify(sB.vehs)===JSON.stringify(saveA.vehs) && sB.races===12, 'progress kept through update');
  if (st.modal) await p.evaluate(() => closeModal());
  // C: deploy a newer build: ONE open should be enough now
  deploy('v3');
  n=0; for (; n<4; n++) { await p.reload(); await p.waitForTimeout(5000); st = await state(); console.log('   C open', n, JSON.stringify(await p.evaluate(async () => ({ build: BUILD_ID, ver: APP_VERSION, server: await fetch('version.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.text()), ready: Upd.ready, url: location.href })))); if (st.banner) break; }
  console.log('C newer build seen after', n+1, 'opens, banner', st.banner);
  check(st.banner && n===0, 'banner on first open after a new release');
  if (st.modal) await p.evaluate(() => closeModal());
  await p.screenshot({path:'/tmp/claude-0/shots/upd-banner.png'});
  await p.click('#upd button'); await p.waitForTimeout(5000);
  st = await state();
  console.log('   after UPDATE tap: version', st.ver, 'popup', st.modal);
  check(st.ver==='2026.10.12c', 'switched to newer');
  check(st.modal==="WHAT'S NEW", "what's new shown after update");
  await p.screenshot({path:'/tmp/claude-0/shots/upd-whatsnew.png'});
  const sC = JSON.parse(st.save);
  check(JSON.stringify(sC.stars)===JSON.stringify(saveA.stars) && sC.races===12 && sC.coins===sB.coins, 'progress kept again');
  // offline still works on the new version
  await ctx.setOffline(true); await p.reload(); await p.waitForTimeout(2000);
  st = await state(); check(st.ver==='2026.10.12c', 'offline loads new version'); await ctx.setOffline(false);
  // banner hidden during a race
  deploy('v2'); await p.reload(); await p.waitForTimeout(5000); await p.evaluate(() => closeModal());
  await p.evaluate(async () => { App.save.seenHelp=true; App.mode='race'; App.pick={riders:['kaito'],vehs:['mtb'],track:'f1'}; await startRace(); });
  await p.waitForTimeout(1500);
  st = await state(); check(!st.banner, 'no banner during a race');
  check(errs.length===0, 'errors '+errs.join(';'));
  await b.close(); console.log(fails? fails+' FAILURES':'ALL UPDATE CHECKS PASSED'); process.exit(fails?1:0);
})();
