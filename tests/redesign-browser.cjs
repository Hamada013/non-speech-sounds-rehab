'use strict';
// The 2026-11 move and redesign, in Chromium and WebKit: the clinic start screen, the new home (today's road,
// «ابدأ», the six activities), therapist-only reports, the card-glow reward in a scored round, and the road bar
// during the route. Firebase is blocked, so nothing here talks to the clinic database.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const { chromium, webkit } = require(process.env.SOUNDS_PLAYWRIGHT || 'playwright');
const root = path.resolve(__dirname, '..');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.webp': 'image/webp', '.m4a': 'audio/mp4' };
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return res.writeHead(404).end();
  res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(res);
});
const CHILD = { schema: 1, active: 'qa', children: [{ id: 'qa', name: 'تجربة', created: '2026-11-25T08:00:00Z', apps: { 'auditory-rehabilitation': true } }] };

async function page(browser, url, { entry = true, child = true, size = { width: 820, height: 1180 } } = {}) {
  const ctx = await browser.newContext({ viewport: size, serviceWorkers: 'block' });
  await ctx.route(/gstatic\.com\/firebasejs/, route => route.abort());
  await ctx.addInitScript(({ entry, child, CHILD }) => {
    if (sessionStorage.getItem('qa-seeded')) return; sessionStorage.setItem('qa-seeded', '1');
    if (entry) localStorage.setItem('speech-entry-v1', JSON.stringify({ mode: 'therapist' }));
    if (child) localStorage.setItem('auditory-rehabilitation-children-v1', JSON.stringify(CHILD));
    const AC = window.AudioContext; window.qaNotes = 0;
    if (AC) window.AudioContext = class extends AC { createOscillator() { window.qaNotes++; return super.createOscillator(); } };
  }, { entry, child, CHILD });
  const p = await ctx.newPage(), errors = [];
  p.on('pageerror', error => errors.push(error.message));
  await p.goto(url); await p.waitForTimeout(700);
  return { p, ctx, errors };
}

async function run(browser, name, base) {
  // 1. A new device opens on the clinic start screen; 013 opens the app.
  { const { p, ctx, errors } = await page(browser, base, { entry: false, child: false });
    await p.locator('dialog.speech-entry[open]').waitFor();
    await p.locator('.speech-entry [data-therapist]').click(); await p.getByPlaceholder('رمز المعالج').fill('013');
    await p.locator('dialog.speech-entry').waitFor({ state: 'detached' });
    assert.deepEqual(errors, []); await ctx.close(); }

  // 2. Home: five road stops, «ابدأ», six activities; reports only while the lock is open.
  { const { p, ctx, errors } = await page(browser, base);
    assert.deepEqual(await p.locator('.as-road b').allInnerTexts(), ['نكتشف', 'نميّز', 'نتعرّف', 'نتذكّر', 'أحسنت']);
    assert.equal(await p.locator('.as-road li.next').count(), 1);
    assert.equal((await p.locator('.as-start').innerText()).trim(), 'ابدأ');
    assert.equal(await p.locator('.as-more > a').count(), 6);
    assert.equal(await p.locator('[data-suite-control="report"]').isVisible(), false, 'Reports are therapist-only');
    await p.evaluate(() => { localStorage.setItem(window.InterventionGoals.APP.therapistKey, 'on'); dispatchEvent(new CustomEvent('voc-therapist-change', { detail: { active: true } })); });
    await p.waitForTimeout(200); assert.equal(await p.locator('[data-suite-control="report"]').isVisible(), true);
    assert.equal(await p.evaluate(() => getComputedStyle(document.querySelector('.as-hero h1')).fontFamily.startsWith('Cairo')), true);
    assert.deepEqual(errors, []); await ctx.close(); }

  // 3. Phone width: nothing scrolls sideways; every home control is a big touch target.
  { const { p, ctx } = await page(browser, base, { size: { width: 360, height: 740 } });
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No sideways scroll');
    const small = await p.locator('.as-start, .as-more > *').evaluateAll(nodes => nodes.filter(n => { const r = n.getBoundingClientRect(); return r.width < 44 || r.height < 44; }).length);
    assert.equal(small, 0, 'Touch targets are at least 44px');
    await ctx.close(); }

  // 4. A scored round (WebKit plays the recordings): the answered card glows or gets a soft ring; no full-screen mark.
  if (name === 'webkit') {
    const { p, ctx, errors } = await page(browser, base + '#/around/identification');
    await p.locator('#two-set').click(); await p.locator('#modal .set-card, #modal [data-set]').first().click();
    await p.evaluate(() => document.getElementById('identify-test').click());
    const card = p.locator('.answer-grid button:enabled').first(); await card.waitFor({ timeout: 20000 });
    await card.click();
    await p.locator('.answer-grid .reward-right, .answer-grid .reward-retry').waitFor();
    assert.equal(await p.locator('#answer-feedback').count(), 0, 'No full-screen mark');
    assert.ok([1, 2].includes(await p.evaluate(() => window.qaNotes)), 'A chime played');
    assert.deepEqual(errors, []); await ctx.close();
  }

  // 5. «ابدأ» → choose today's sounds → the route starts at «نكتشف» with the road bar on top.
  { const { p, ctx, errors } = await page(browser, base);
    await p.locator('.as-start').click(); await p.locator('#modal [data-route-set]').first().click();
    await p.locator('#road-bar').waitFor();
    assert.equal(await p.locator('#road-bar li[aria-current="step"] b').innerText(), 'نكتشف');
    await p.evaluate(() => { location.hash = '/home'; }); await p.waitForTimeout(400);
    assert.equal(await p.locator('#road-bar').count(), 0, 'Leaving ends the route');
    assert.equal(await p.locator('.as-road li.done').count(), 0, 'A step lights up only when finished');
    assert.deepEqual(errors, []); await ctx.close(); }
  console.log(`PASS ${name}: start screen and 013, new home and road, therapist-only reports, phone fit and touch targets,${name === 'webkit' ? ' card-glow reward in a scored round,' : ''} road bar.`);
}

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/index.html`;
  try {
    for (const [name, engine] of [['chromium', chromium], ['webkit', webkit]]) {
      if (process.env.SOUNDS_ENGINE && process.env.SOUNDS_ENGINE !== name) continue;
      const browser = await engine.launch(); try { await run(browser, name, base); } finally { await browser.close(); }
    }
  } finally { server.close(); server.closeAllConnections?.(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
