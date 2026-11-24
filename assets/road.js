// Today's road: the steps of «المسار التلقائي». A stop lights up when the child finishes it (a passed test, or the
// memory game at the end), per child on this device, for today only. The home shows the whole road; while the route
// runs, a slim copy sits on top of the screen.
export const ROAD = [['detection', 'نكتشف', 'ear'], ['discrimination', 'نميّز', 'sound'], ['identification', 'نتعرّف', 'target'], ['memory', 'نتذكّر', 'memory'], ['done', 'أحسنت', 'star']];
const KEY = 'auditory-rehabilitation-road-v1', today = () => new Date().toLocaleDateString('en-CA');
const child = () => window.SoundProgress?.active()?.id || '-';
const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>';
export const roadIcon = (icon, name) => name === 'star' ? STAR : icon(name);

export function roadReached() {
  try { const own = (JSON.parse(localStorage.getItem(KEY)) || {})[child()]; return own?.date === today() ? own.steps : []; } catch { return []; }
}
export function markRoad(step) {
  try {
    const all = JSON.parse(localStorage.getItem(KEY)) || {}, id = child(), own = all[id]?.date === today() ? all[id] : { date: today(), steps: [] };
    if (!own.steps.includes(step)) own.steps.push(step); all[id] = own; localStorage.setItem(KEY, JSON.stringify(all));
  } catch {}
}
// step: the stop being played now, or null to remove the bar.
export function roadBar(step, icon) {
  document.getElementById('road-bar')?.remove(); document.body.classList.toggle('route-on', !!step);
  if (!step) return;
  const at = ROAD.findIndex(([id]) => id === step), bar = document.createElement('ol');
  bar.id = 'road-bar'; bar.className = 'road-bar'; bar.setAttribute('aria-label', 'خطوات اليوم');
  bar.innerHTML = ROAD.map(([id, label, name], i) => `<li class="${i < at ? 'done' : i === at ? 'now' : ''}"${i === at ? ' aria-current="step"' : ''}><span>${roadIcon(icon, name)}</span><b>${label}</b></li>`).join('');
  document.body.append(bar);
}
