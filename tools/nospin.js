// Test helper: before the page loads, mark today's Daily Spin as already used (only when no save exists yet), so the
// spin popup doesn't cover the screen in tests that jump straight into menus or races. Real players still get it.
module.exports = (page) => page.addInitScript(() => {
  if (localStorage.getItem('wild-riders-save-v1')) return;
  const d = new Date(), day = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  localStorage.setItem('wild-riders-save-v1', JSON.stringify({ v: 1, tl: 2, rl: 2, spin: { last: day, streak: 1, seen: 0 } }));
});
