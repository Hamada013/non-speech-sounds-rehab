# أصوات من حولي

Standalone Arabic RTL PWA, published at https://hamada013.github.io/non-speech-sounds-rehab/. It moved out of the tools repository on 2026-11-25; the tools page keeps only a card to it, and the old `tools/auditory-rehabilitation/` address forwards here. Saved children stay, because both addresses are on the same site (storage key `auditory-rehabilitation-children-v1`).

## Content

50 environmental sound pictures, 50 whole recordings and 100 short/long recordings. Includes discovery, sound discrimination, duration practice/tests, identification, paired memory games, and the sound library. Activity headers show only the app name; practice/test, replay, and sound-picker controls are icon-only with accessible labels. Active screens size square cards to the available width and height, including short landscape screens. Six-card Memory always uses two rows of three.

Every practice or test starts automatically after a colorful, animated 1–2–3 countdown with a blurred backdrop. Detection uses the same neutral ear overlay during sound-present and silent trials: actual sound playback controls the first duration, while silence lasts three seconds. Responses unlock after the overlay closes; routine instructional and answer-feedback text is omitted. Detection retains balanced sound/silence trials, pause/resume, ten answers, stars, and score results.

Discrimination and identification use a square ear card for target playback, replay, and dropping an answer, with no separate play button. Trial counts use Latin digits. Practice automatically demonstrates ten sounds while covering every inactive choice; open groups retain ten unique cards containing the target. Long/short practice plays the first card ten times and then the second ten times, covering the other card and keeping one-second gaps, before returning to the same listening workplace. Its test plays ten balanced trials automatically, with icon feedback and no trial-number text. Sound selection stays beside the long/short heading. The original short/long duration bars remain available when listening or practicing.

Automatic sessions use gesture-unlocked Web Audio for playback after countdowns and between trials. Leaving or hiding an activity cancels pending audio, timers, countdowns, and demonstrations; manual library and Memory playback also stops on leaving the page. Audio failures retain explicit error feedback and allow replay/restart.

The supplied logo is `images/logo.webp`. Installation icons are in `icons/`. The home uses the project home-screen style. Its download dialog offers installation when supported, offline download, and a percentage bar. Downloading saves this app's own 200 media files, verifies hashes, and resumes missing files on retry. Offline audio supports byte ranges. Cache names include this app's name and hosting scope.

Complete new releases wait for «تحديث الآن» or «لاحقًا». Update checks run when opening the app and returning online. Rebuild release manifests before publishing changes.

## The 2026-11 redesign

- **Home:** the logo, today's road (نكتشف، نميّز، نتعرّف، نتذكّر، أحسنت) that lights up as each step's test is passed, one big «ابدأ» (choose today's sounds, then «المسار التلقائي»), then the six activities.
- **During the route:** a slim road bar on top of each step (`assets/road.js`).
- **Feedback:** the answered card or button glows green with a soft chime made in the browser (`assets/reward.js`); a wrong answer gets a soft amber ring; three right answers in a row add a small burst of dots. Nothing covers the screen; with reduced motion only the colour changes.
- **Therapist only (013):** the intervention plan and goals, reports and «ملف الطفل».
- **Type:** Cairo (bundled) on every screen; styles in `assets/redesign.css` (shared with أصواتي العربية), loaded last.

## Clinic link

Like the other apps: `assets/child-file.js`, `assets/speech-sync.js` and `assets/speech-entry.js` (app id `auditory-rehabilitation`), the locked start screen (child's name + number, or 013), «أطفال من العيادة» in the accounts window, and progress sent to the clinic database. Keep these three files byte-identical with the other apps.

## Development

```sh
npm run build        # Rebuild the offline release after changing files.
npm test             # Release hashes, manifest, icons, JavaScript syntax.
npm run test:browser # The move and redesign in Chromium and WebKit (set SOUNDS_PLAYWRIGHT to a Playwright package if needed).
npm run stage && npm run test:links  # What GitHub Pages publishes, and no links back to other sites.
```

`npm run test:legacy` is the old activity suite from the tools repository.
