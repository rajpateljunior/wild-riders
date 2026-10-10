// Renders portraits, back sprites and side vehicles into a grid for visual review.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const fs = require('fs'); const path = require('path');
const out = process.argv[2] || 'art.png';
(async () => {
  const src = ['core.js','data.js','art.js','art_world.js'].map(f => fs.readFileSync(path.join(__dirname,'..','src',f),'utf8')).join('\n');
  const html = `<html><body style="margin:0;background:#556"><div id=g style="display:flex;flex-wrap:wrap;gap:6px;padding:6px"></div><script>${src}
  const g=document.getElementById('g');
  const add=(svg,w,bg='#334')=>{const d=document.createElement('div');d.style.cssText='background:'+bg+';width:'+w+'px';d.innerHTML=svg;d.firstChild.style.width='100%';d.firstChild.style.height='auto';g.appendChild(d);};
  const mode='${process.argv[3]||'all'}';
  if(mode==='all'||mode==='por') RIDERS.forEach(r=>add(portraitSVG(r),400));
  if(mode==='all'||mode==='back') RIDERS.forEach((r,i)=>['mtb','bmx','dirt','atv'].forEach(v=>add(riderBackSVG(r,v,'ride',0),150,'#8a9')));
  if(mode==='poses') ['ride','punchL','punchR','kickL','kickR','hurt','nohand','super','cancan'].forEach(p=>add(riderBackSVG(RIDERS[${process.argv[4]||0}],'${process.argv[5]||'mtb'}',p,0),150,'#8a9'));
  if(mode==='world') Object.values(W).forEach(d=>add(SV.wrap(d.w,d.h,d.svg()),Math.min(260,d.w*0.6),'#9ab'));
  if(mode==='bg') BIOMES.forEach(b=>{add(bgSVG(b,'far'),1280,b.sky[1]);add(bgSVG(b,'near'),1280,b.sky[2]);});
  if(mode==='items') Object.keys(ITEMS).forEach(i=>add(itemSVG(i),64,'#9ab'));
  if(mode==='all'||mode==='side') RIDERS.slice(0,4).forEach((r,i)=>add(vehicleSideSVG(VEHICLES[i].id,r),220,'#ccd'));
  </script></body></html>`;
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const p = await b.newPage({viewport:{width:1300,height:900}});
  p.on('console', m=>console.log('console:', m.text())); p.on('pageerror', e=>console.log('ERR', e.message));
  await p.setContent(html); await p.waitForTimeout(300);
  await p.screenshot({path: out, fullPage:true}); await b.close();
})();
