// The child's feedback in the games: the answered card glows green (right) or gets a soft amber ring (try again),
// with a short, quiet chime made in the browser (no sound files). Three right answers in a row add a small burst of
// coloured dots around the card. Nothing covers the screen, nothing blocks the next tap, and with reduced motion the
// card only changes colour. The spoken praise («برافو!») still comes from prompts.js where the route uses it.
let context = null, streak = 0;
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function audio() {
  try { context ||= new (window.AudioContext || window.webkitAudioContext)(); if (context.state === 'suspended') context.resume(); return context; } catch { return null; }
}
// One soft bell-like note: quick rise, gentle fall, no click at the end.
function note(ctx, frequency, start, length, volume, type = 'sine') {
  const osc = ctx.createOscillator(), gain = ctx.createGain(), t = ctx.currentTime + start;
  osc.type = type; osc.frequency.setValueAtTime(frequency, t);
  gain.gain.setValueAtTime(0.0001, t); gain.gain.exponentialRampToValueAtTime(volume, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
  osc.connect(gain).connect(ctx.destination); osc.start(t); osc.stop(t + length + 0.02);
}
export function chime(correct) {
  const ctx = audio(); if (!ctx) return;
  if (correct) { note(ctx, 1046.5, 0, 0.32, 0.09); note(ctx, 1318.5, 0.09, 0.42, 0.08); } // C6 then E6, rising
  else note(ctx, 392, 0, 0.22, 0.05, 'triangle'); // one low, short G4: «try again», never a buzzer
}

function burst(card) {
  if (calm()) return;
  const box = card.getBoundingClientRect(), layer = document.createElement('div');
  layer.className = 'reward-burst'; layer.setAttribute('aria-hidden', 'true');
  layer.style.left = `${box.left + box.width / 2}px`; layer.style.top = `${box.top + box.height / 2}px`;
  const colours = ['#f59e0b', '#22c55e', '#38bdf8', '#f472b6', '#a78bfa', '#facc15', '#fb7185', '#34d399'];
  const reach = Math.max(box.width, box.height) * 0.62;
  colours.forEach((colour, i) => {
    const dot = document.createElement('i'), angle = (i / colours.length) * Math.PI * 2;
    dot.style.background = colour; layer.append(dot);
    dot.animate([{ transform: 'translate(-50%,-50%) scale(.4)', opacity: 1 },
      { transform: `translate(calc(-50% + ${Math.cos(angle) * reach}px), calc(-50% + ${Math.sin(angle) * reach}px)) scale(1)`, opacity: 0 }],
    { duration: 620, easing: 'cubic-bezier(0.2, 0, 0, 1)', fill: 'forwards' });
  });
  document.body.append(layer); setTimeout(() => layer.remove(), 700);
}

// Called once per answer. Returns the same kind of node the old full-screen mark returned, so callers can remove() it.
export function reward(correct, card) {
  chime(correct);
  streak = correct ? streak + 1 : 0;
  if (card) {
    card.classList.remove('reward-right', 'reward-retry'); void card.offsetWidth;
    card.classList.add(correct ? 'reward-right' : 'reward-retry');
    if (correct && streak % 3 === 0) burst(card);
  }
  const label = correct ? 'إجابة صحيحة' : 'حاول مرة ثانية', live = document.getElementById('announcement');
  if (live) live.textContent = label;
  return { remove() { card?.classList.remove('reward-right', 'reward-retry'); } };
}
export function resetStreak() { streak = 0; }
