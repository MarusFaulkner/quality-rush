# Quality Rush: Defect Runner

A 90-second action runner about manufacturing quality, starring **Maya Metrology**. Run the walkway beside a moving production line, pull defective parts off the conveyor before they reach shipping, and jump or slide past floor hazards.

Part of the **Quality Rush** series by Marcus Faulkner, alongside [Quality Quest](https://marusfaulkner.github.io/quality-quest/) and [Quality Showdown](https://marusfaulkner.github.io/quality-showdown/).

## How to play

| Action | Phone | Keyboard / mouse |
|---|---|---|
| Jump pallets and spills | Swipe up or tap **Jump** | Space or ↑ |
| Slide under low beams | Swipe down or tap **Slide** | ↓ |
| Pull a defective part | Tap the part | Click the part |
| Pause | Pause button | P or Esc |

- A defect that reaches **shipping** is an escape and costs a quality shield.
- Pulling a **good** part is a false reject and resets your combo.
- Hitting an obstacle costs a shield. Lose all five and the line shuts down.
- Four part types ride the line: housings, flanges, gears and brackets.
- New defects unlock during the shift: wrong components, misaligned bores and chipped gear teeth at 0:25, hairline cracks at 0:55.
- Two paces: **Standard** (default) and **Rush** (faster line, tighter gaps). Best scores are kept separately.

Ranks run **Trainee → Inspector → Quality Specialist → Quality Champion → MISTER QUALITY**, based on defect detection, escapes, false rejects and obstacle hits.

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

**GitHub Pages:** push to `main`, then Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)`.

**itch.io:** upload the ZIP with `index.html` at its root. Kind of project: HTML. Played in the browser. Embed 960 × 540, Mobile friendly, Orientation **Landscape**, Fullscreen button on.

## Project structure

```
index.html        Page shell
css/styles.css    All styles
js/game.js        Game logic (canvas, no dependencies)
assets/           Maya sprites, expressions, background layers, logo, end screens
```

Parts and obstacles are drawn in code. Tuning values (shift length, speed, defect unlock times, scoring) sit near the top of `js/game.js`.

## Credits

Concept, characters and quality scenarios by **Marcus Faulkner**. Character and background art was created with generative AI tools; code was written with AI assistance.

© 2026 Marcus Faulkner. All rights reserved. Mister Quality™. The in-game ranks are game achievements, not professional quality certifications.
