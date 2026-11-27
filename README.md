# DealOrDud — real Black Friday deals, graded honestly

[![Bounty](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![Rank](https://make.fun/badge/black-friday-deal-finder-01/Robekk/makefun-black-friday-deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![Reward](https://make.fun/badge/black-friday-deal-finder-01/Robekk/makefun-black-friday-deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01)

Entry for the make.fun bounty [black-friday-deal-finder-01](https://make.fun/bounty/black-friday-deal-finder-01): a static deal finder whose 28 Black Friday deals were found and price-checked on the morning of Friday 27 November 2026 (01:41–02:05 ET), each with its product, store, store link, sale price, usual price, the time its price was checked and the source it was read from.

What makes it different is the stamp on every deal: **RECORD LOW**, **REAL DEAL**, **FAIR CUT**, **THIN CUT** — or **JUDGE THE PRICE**, for discounts measured against a "comparable value" that was never a selling price. A dedicated Mirage Watch page explains the trick and names the deals it touches. Search, category chips and filters by store, discount and verdict all work, on desktop and on a phone, from static files with no network request.

## Run

`node main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library. To browse the site: serve `app/` with any static server and open `index.html`.

## License

MIT — see `LICENSE`.
