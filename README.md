# Dialled

An espresso shot logger that suggests the next adjustment after each shot. It's a progressive web app built for one person on an iPhone. There's no backend: everything is stored on the device in IndexedDB.

Tuned for a Gaggia Classic and a Niche Zero (grind 0–50), with medium and dark roasts in mind.

## Features

- **Log a shot**: bean picker, dose/yield/grind prefilled from your last shot with that bean (18g → 36g for a new bean), large steppers, a tap-to-start stopwatch that fills in the shot time, taste tags, an optional rating and notes.
- **Suggestion after every shot**: one change at a time, with the reason. See [Suggestion rules](#suggestion-rules).
- **History**: shots grouped by bean, newest first, with time and grind sparklines for the last 10 shots. Tap a shot to edit or delete it.
- **Beans**: add, edit, archive and restore.
- **Settings**: grind step size, JSON backup and restore, CSV export of shots, and a reminder when your last backup is over 30 days old.
- Works offline after the first load. Dark theme, safe-area aware, no input zoom.

## Running locally

Requires Node 22+.

```sh
npm install
npm run dev          # http://localhost:5173
```

To try it on your phone over Wi-Fi, run `npm run dev -- --host` and open the printed network URL. Service workers need HTTPS on anything other than `localhost`, so offline mode only works once deployed.

### Checks

```sh
npm run lint        # oxlint with @nkzw/oxlint-config (type-aware)
npm run typecheck   # tsc -b
npm run build       # typecheck + production build into dist/
npm run preview     # serve dist/ locally
```

### Icons

The PNG icons in `public/` are generated from `public/logo.svg` and committed. To regenerate them after changing the logo:

```sh
npm run icons
```

## Deploying (free)

The app is static and uses hash routing (`#/history`), so no server rewrites are needed.

### Cloudflare Pages

1. Push the repo to GitHub or GitLab.
2. In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Connect to Git** and pick the repo.
3. Set the build command to `npm run build` and the output directory to `dist`.
4. Under environment variables, add `NODE_VERSION` = `22`.
5. Deploy. You'll get an `https://<project>.pages.dev` URL.

### GitHub Pages

GitHub Pages serves the site from `/<repo-name>/`, so build with `BASE_PATH`:

```sh
BASE_PATH=/<repo-name>/ npm run build
```

To deploy on every push, go to **Settings → Pages → Source: GitHub Actions** and add `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          BASE_PATH: /${{ github.event.repository.name }}/
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

## Installing on iPhone

1. Open the deployed HTTPS URL in **Safari**. It must be Safari; other iOS browsers can't install web apps.
2. Tap **Share**, then **Add to Home Screen**, then **Add**.
3. Launch Dialled from the home screen icon. It opens full screen and works offline.

Your data lives only in this installed app. iOS keeps a home-screen app's storage separate from Safari's, so shots logged in a Safari tab won't appear in the installed app. Use **Settings → Export backup** now and then, and save the file to Files or iCloud Drive. If you reinstall, **Import backup** restores it.

## Architecture

```
src/
  domain/       pure TypeScript: zod schemas & types, suggestion engine, prefill,
                grouping, backup/CSV, formatting. No React, no storage.
  storage/      Repository interface + Dexie (IndexedDB) implementation,
                navigator.storage.persist()
  hooks/        DataContext (shared state + actions), form, stopwatch,
                routing, backup, persistence
  components/   presentational components: props in, markup out
  screens/      thin containers that wire hooks to components
  lib/          browser helpers (share/download a file, ids)
```

- `suggestNextStep(shot, history, bean, options?)` in `src/domain/suggest.ts` is a pure function returning `{ kind, headline, reason, next, warnings }`.
- zod validates every boundary: imported backups, form input, and settings read from IndexedDB.
- Components never touch storage. Screens get data and actions from `useData()`.

## Suggestion rules

Rules are checked top to bottom, and the first match wins. Only one change is suggested per shot.

| # | Condition | Suggestion |
|---|-----------|------------|
| 1 | Taste is **balanced** | "Don't change anything". Taste beats the timer, even if the time is outside 25–35s |
| 2 | **Bitter and sour** | Check puck prep (WDT, distribution, level tamp). No grind change |
| 3 | Time **≥ 50s** (stall) or **> 40s** | Grind one step coarser |
| 4 | Time **< 20s** | Grind one step finer |
| 5 | You ground finer than last time and it tasted **worse** (lower rating, worse taste tag, or sour → bitter) | Go one step coarser: you've passed the sweet spot |
| 6 | **Sour**, light roast, ratio ≥ 1:2.5 | Drop the dose by 1–2g (suggests −1g, same ratio) |
| 7 | **Sour**, ratio below the roast's maximum | Longer shot (+~20% of dose in yield) |
| 8 | **Sour**, ratio at maximum | Grind finer, or raise the temperature if the shot is already ≥ 35s |
| 9 | **Bitter**, ratio above the roast's minimum | Shorter shot |
| 10 | **Bitter**, ratio at minimum | Grind coarser, or lower the temperature if the shot is already ≤ 25s |
| 11 | **Flat**, ratio > 1:2.2 | Shorter shot for more body |
| 12 | **Flat** otherwise | Grind finer, or raise the temperature if the shot is already ≥ 35s |

Ratio limits by roast: light 1:1.8–1:3, medium and dark 1:1.5–1:2.5.

Every suggestion can also carry warnings:

- If you changed more than one of **dose, ratio or grind** since the previous shot with the same bean, you're told it's hard to tell which change made the difference.
- If the bean's roast date is more than 6 weeks before the shot, you're warned that old beans can taste flat.

One grind step defaults to 0.5 on the Niche scale. You can change it in Settings.
