// Renders the app icons from the game's emblem (claw-slashed spiked wheel in a shield) over a sunset mountain. No characters.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const src = ['core.js','data.js','art.js'].map(f => fs.readFileSync(path.join(__dirname,'..','src',f),'utf8')).join('\n');
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const shots = [['icon-180.png',180,0],['icon-192.png',192,0],['icon-512.png',512,0],['icon-maskable-512.png',512,1],['favicon-64.png',64,0]];
  for (const [name, size, mask] of shots) {
    const p = await b.newPage({viewport:{width:size,height:size}});
    const html = `<html><body style="margin:0"><div id=i></div><script>${src}
      const emb = emblemSVG({ raw: true, savage: false, noGlow: true });
      const pad = ${mask} ? 0.2 : 0.04;
      document.getElementById('i').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">'+
      '<defs><radialGradient id="bgx" cx="50%" cy="30%" r="80%"><stop offset="0" stop-color="#ffd23f"/><stop offset=".45" stop-color="#ff6a3d"/><stop offset=".8" stop-color="#c2185b"/><stop offset="1" stop-color="#3a1257"/></radialGradient></defs>'+
      '<rect width="512" height="512" fill="url(#bgx)"/>'+
      '<path d="M0 400 L90 290 L150 330 L250 230 L340 320 L410 270 L512 360 L512 512 L0 512Z" fill="#2a1240"/>'+
      '<g transform="translate('+(256-200*(1-pad)*1.28)+','+(256-200*(1-pad)*1.28)+') scale('+(1.28*(1-pad))+')">'+emb+'</g>'+
      '</svg>';
    </script></body></html>`;
    await p.setContent(html); await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(__dirname,'..','icons',name), clip:{x:0,y:0,width:size,height:size} });
    await p.close();
  }
  await b.close();
})();
