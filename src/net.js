/* Online 2-player — placeholder until the online update ships. */
function openOnline() {
  modal(`<h3>ONLINE 2-PLAYER</h3><p>Racing a friend on their own phone with a room code is coming in the next update.</p>
    <p>For now, try <b>2 PLAYERS · ONE SCREEN</b> on an iPad or a big phone.</p>
    <div class="acts"><button class="btn sm ghost" data-a="close">OK</button></div>`, (box) => {
    box.querySelector('[data-a="close"]').onclick = () => { SFX.play("back"); closeModal(); };
  });
}
function netLeave() {}
function netRematch() {}
function netBeforeStep() {}
function netAfterFrame() {}
