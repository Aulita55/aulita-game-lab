# АюлитА English Notebook

Checkpoint: 6 November 2026. Base: `fbea860`.

- `index.html`: existing games, teacher interface, browser speech and saved scores.
- `topics.json`: approved teaching content; unchanged by the design update.
- `aulita.css`: light squared paper, orange/green accents and responsive alphabet board.
- `pics/alphabet-3d.webp`: generated 6 × 5 sprite atlas, first 26 cells in approved alphabet order. No letters or answer labels in the art. Each cell is square. Last four cells are blank.
- Brand wordmark and Oscar teacher are reused from the repository's `assets/`.

Approved Fly High 2 order: apple, bear, cat, dog, elephant, flower, goat, hippo, insect, jelly, kangaroo, lion, monkey, nest, octopus, penguin, queen, rabbit, snake, tiger, umbrella, vulture, whale, **fox (X)**, yo-yo, zebra.

Keep `ee-best:<topic>:<game>`, `ee-book`, `ee-name`, teacher settings and existing topic IDs compatible. Keep “A is for…” phrases out of Alphabet. Other topics still use local Twemoji where custom art is unavailable; retain CC BY 4.0 attribution.

Validation: inline JavaScript syntax and `git diff --check`; simulated DOM checks for 26 word/sprite/speech mappings, all 10 Alphabet game screens, a 20-card completion, six-pair completion, previous scores, reload persistence, book switching and teacher login screen. The simulation stubs browser speech and scroll; it does not prove audible speech or visual layout. Existing GitHub Pages was opened and still showed the previous release. Local visual/browser QA was blocked by the separate browser environment and unavailable local Chromium binary. Responsive CSS, physical touch, audible speech and fullscreen still need a browser pilot.

Next: review this branch, visually check the design at desktop/mobile widths, then merge and verify GitHub Pages after owner publication approval. Level locks, microphone and detailed error statistics remain separate future work.
