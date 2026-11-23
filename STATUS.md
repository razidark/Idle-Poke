# IdlePoke — Project Status & Roadmap (Working Document)

> **Purpose:** Single source of truth for the state of the IdlePoke game, what has been
> fixed/improved, known gotchas, and next steps. Written for future sessions/engagements.
> **Last updated:** 2026-11-19
>
> Companion docs (keep in sync): `README.md` (credits/changelog), `STRUCTURE.md`
> (file tree, PT), `roadmap.md` (feature checklist), `session-ses_*.md` (prior chat log).

---

## 1. How to run

```bash
npm install            # deps are at project ROOT (not in react-version/)
npm run dev            # Vite dev server
```

- Open **http://localhost:5173/** → root `index.html` does `window.location.replace('/react-version/')`.
- The **live game is `react-version/`** (React 19 + Vite + TypeScript). The root `public/`
  + `style.css` are an **abandoned vanilla-JS legacy version** — ignore them.
- Save/profile data persists in `localStorage`.

### ⚠️ Dev-server port pitfall (cost real time once)
- Two `vite` servers can run at once (old session on 5173, new on 5174). If the UI looks
  "unstyled/broken", you may be on a **stale server**. Kill strays and confirm one server:
  ```bash
  Get-NetTCPConnection -LocalPort 5173,5174   # see what's bound
  # kill stray node processes, then start ONE fresh `npm run dev`
  ```
- Always verify against the **dev server**, not the production build (see §2).

---

## 2. Architecture & critical notes

- **Tailwind was NOT installed originally.** Components were written with Tailwind utility
  classes (`md:grid-cols-12`, `flex-[1.8]`, `bg-[#111318]/90`, arbitrary `text-[10px]`…) but
  only a small hand-written subset existed in `react-version/src/index.css`. Result: the
  intended 3-column dashboard collapsed to a single stacked column on wide screens.
  - **Fixed 2026-07-14:** installed `tailwindcss` + `@tailwindcss/vite`, added the plugin to
    `vite.config.ts`, and `@import "tailwindcss";` as the first line of `index.css`.
  - All classes now generate correctly in dev (verified). `index.css` still holds the
    hand-written theme variables (`[data-theme=...]`), type colors, route backgrounds, and
    animations — these are preserved alongside Tailwind.
- **`npm run build` is currently broken for the game.** Vite's root is the project root, whose
  `index.html` is only the redirect shell, so the production build transforms ~4 modules and
  emits a 68 KB CSS that does **not** bundle the React app. The **dev server is the validated
  runtime**. Do not trust `npm run build` output to validate React changes. (Fixing the build
  to target `react-version/` is a worthwhile future task — see §5.)
- **Sprites are local now.** `react-version/src/data/db.js` was repointed from the
  `img.pokemondb.net` CDN to `/assets/sprites/...` (local copies already existed from
  `download_sprites.cjs`). 24 Gen-5 form variants that were never downloaded fall back to a
  Poké Ball SVG via a global `img` error listener in `App.tsx`.
- **Evolution levels are per-Pokémon and intentional** — they live in `data/evolutions.js`.
  Do **NOT** touch them (user明确要求保留).
- **Pixel-art shape safety:** every Pokémon/trainer `<img>` uses `object-contain pixelated`.
  `.pixelated` now also enforces `object-fit: contain` so no sprite can distort even if given a
  fixed width/height. The only non-`contain` image is the map background (`object-cover`, intended).

---

## 3. Work completed

### Prior session (see `session-ses_*.md`)
- **Bug:** shininess randomized on every save/load (`p.shiny` vs `isShiny`) → fixed in `usePokeState.ts`.
- **Bug:** starter never had real perfect IVs + data lost on reload → `createProfile` sets `ivs` all 31 and persists full starter.
- **Bug:** EXP Candy computed wrong stats (ignored IVs/EVs/nature, skipped spAtk/spDef) → `buyCandy` now uses `recalculatePokemonStats` + full HP refill.
- **Bug:** `BattleBackground.tsx:602` stray duplicate `};` parse error → removed.
- **Bug:** catch-rate formula (Master Ball ~1% on legendaries) → canonical `(catchRate/255)*ballMod`, Master Ball guaranteed.
- **Bug:** PC Storage tab crashed (`<BoxPanel>` rendered but never imported) → added missing `import { BoxPanel }`.
- **Bug:** `PokedexDetailModal` imported non-existent `getSpeciesLearnset` → swapped to `getLearnableMoves`.
- **Feature:** wired existing `sortActiveTeam` into Roster Party header (Level/IV/Power/Dex#).
- **Cleanup:** removed dead `LocationsPanel.tsx`, `Window.tsx`; unused `App.tsx` imports/consts; `usePokeState.ts` helpers `getHpValue`/`getStatValue`.
- **Assets:** repointed sprites to local `/assets/sprites/`; added global image-error Poké Ball fallback.

### This session (UI/UX overhaul + foundation fix)
- **Foundation:** installed & wired Tailwind v4 (see §2) — revived the 3-column dashboard layout.
- **Layout / responsiveness:**
  - Rebalanced columns to `md:col-span-3 / 6 / 3` (was 2/6/4); chat feed wider, roster balanced.
  - Made fully responsive: on `<md` it stacks to one scrollable column (main `overflow-y-auto`),
    on `md+` it's the fixed-height 3-column grid (`md:overflow-hidden`). Columns use
    `h-auto md:h-full`; battle arena `h-[150px] md:h-[180px]`; tab content `min-h-[320px] md:min-h-0`.
  - Header action buttons `flex-wrap` so they don't overflow on small screens.
  - `xl:max-w-[1680px] xl:mx-auto` centers the layout on ultra-wide screens.
- **Readability:** bumped tiny fonts — move-button Pow/type/PP, roster HP label & numbers,
  gym-card subtitle, footer HUD, and the center tab bar (now `whitespace-nowrap`, less padding).
  Roster sprite enlarged `w-11 h-11` → `w-12 h-12`.
- **Sprite integrity:** `.pixelated` now enforces `object-fit: contain` (see §2).
- **Combat screen rewrite (benchmarked vs pokeidle.com):** the old battle view put each
  fighter's **sprite in one corner and its stat plate in the opposite corner**, used an
  unreadable 7–8px pixel font, and showed ATB bars the original doesn't have. Rewrote
  `BattleBackground.tsx` so each fighter is a **self-contained "pokeBox" card** (sprite +
  name/level + HP bar + EXP bar + status), enemy on top / player on bottom, facing each
  other, with readable text and the original's light stat-card style. Removed the two
  crossed corner plates and the ATB   bars.
- **Removed the mock chat feed:** `ChatPanel.tsx` (simulated trainers + fake messages + fake bot
  replies — the only mock/simulated data in the app) was deleted and its left column removed.
  No mock data remains. Layout rebalanced to a clean **2-column** grid (`md:col-span-8` battle
  center / `md:col-span-4` roster) instead of the old 3-column-with-chat.
- **Sizing pass:** normalized the type scale to a consistent rhythm — 8px floor for micro tags
  (starter type, engine subtitle, swap badge), 9px+ for body/labels, 10px+ for modal form
  labels, 11px for footer HUD. Eliminated the `text-[7px]` micro-text.
- **Responsive pass:** `main` stacks to one scrollable column on `<md` (`overflow-y-auto`) and is
  the fixed-height 3-col→2-col grid on `md+` (`md:overflow-hidden`); columns `h-auto md:h-full`;
  battle arena `h-[150px] md:h-[180px]`; tab content `min-h-[320px] md:min-h-0`; header buttons
  `flex-wrap`; layout capped at `xl:max-w-[1680px] xl:mx-auto` on ultra-wide.
- **Activity log:** `LogPanel.tsx` created in prior steps; wired this pass into the center tab
  bar as the **"Activity"** tab (ScrollText icon) rendering `combatLogs`.

---

## 4. Known issues / risks

- Production `build` does not bundle the React app (§2). Dev server is the source of truth.
- `oxlint` still reports only harmless `no-unused-vars` warnings in `App.tsx` (unused hook
  destructures like `activeBallType`, `chooseStarter`, `autoPotion`, `ShieldAlert` import). Left
  alone to avoid churn; safe to clean later.
- `MapPanel` map coordinates only cover Kanto/Johto (per `roadmap.md`); other regions exist in
  `routes.js` but lack coordinate maps/visual assets.
- Some `text-[7px]` labels remain inside modals (Create Profile, swap list) — acceptable for
  dense forms, not gameplay-critical.

---

## 5. Recommended next steps

1. **Fix `npm run build`** to target `react-version/` (set `root`/`build.outDir` or
   `build.rollupOptions.input`) so the game can be deployed/previewed via `vite preview`.
2. **Further UI polish** (optional, user-driven): per-panel visual cohesion, empty-state
   illustrations, consistent iconography, hover/active states.
3. **Region maps:** add coordinate maps + assets for Hoenn→Alola; un-hardcode the region selector.
4. **Clean unused vars** flagged by lint if desired.
5. **Re-verify on real mobile viewport** (DevTools responsive) since the responsive pass was
   done blind (no screenshot access).

---

## 6. Benchmark vs pokeidle.com (the original game)

The user wants IdlePoke to match the original **pokeidle.com** (renlok's fork of MarcoWorms'
PokeIdle, vanilla JS — `github.com/renlok/renlok.github.io`). Key reference facts pulled from
the original `index.html` / `style.css`:

- **Layout:** fixed **800px** centered container, CSS grid `200px 165px auto 165px`.
  - Left `#listBox` (200px): the main list, switched by view buttons (Routes / Pokemon /
    Storage / PokeDex).
  - `#viewSelectBox` (165px): **Heal / Pokemon / Storage / PokeDex / Routes** switcher.
  - `#invBox`: **Catch All/New** toggles, **ball selection** (poke/great/ultra w/ ammo
    counts), **Coins**.
  - `#enemyBox` (right): wild Pokémon (name, sprite, HP text, HP progress bar, status) +
    `#townBox` (Town / Trainer Battle).
  - `#playerBox`: your Pokémon (name, sprite, HP bar, **exp bar**, status).
  - `#console`: the activity/log text.
  - `#navBox`: **Inventory / Achievements / View Stats / Settings / Updates**.
- **Sizes:** pokeBox 165px, name 18px, HP bar 70×5px (green), exp bar 120px; plain Lato font
  (no tiny pixel font).
- **Town:** `#townContainer` has a **Poke Shop** (items) AND a **Poke Trader** (sell/buy
  Pokémon). Settings include **sprite choice (back/front)**, console toggle, **export/import
  save**, **clear game data**. Region select lists all 7 regions.

### Gaps vs original (to close)
- [ ] **Weird menus:** our 2-col (battle center + 7-tab bar + roster) still diverges from the
  original's logical view-switcher + inv box + console + nav. The **mock chat column was
  removed** (no mock data). The 7-tab center bar is still cramped. Consider a left **view
  switcher** (Routes/Pokemon/Storage/Pokedex) + an **inv/actions** panel + bottom **nav**
  (Inventory/Achievements/Stats/Settings) like the original.
- [ ] **Missing features:**
  - [ ] **Town Poke Trader** (sell/buy Pokémon) — only Poke Shop exists.
  - [ ] **Settings:** sprite choice (back/front), export/import save UI, clear game data.
  - [ ] **View Stats** screen (original has one; we have `statistics` in state but no screen).
  - [ ] **Region select for all 7 regions** (our `MapPanel` is hardcoded to Kanto/Johto coords).
  - [ ] **Story** system.
- [ ] **Sizes:** normalize to a consistent scale (avoid the `text-[7–8px]` pixel-font micro
  text); reference the original's 800px / pokeBox 165px / name 18px rhythm.
- [x] **Combat screen:** rewritten this session (see §3) to match the original's pokeBox model.

## 7. Quick file map (gameplay-critical)

- `react-version/src/App.tsx` — root layout, 3-column dashboard, tabs, modals, all wiring.
- `react-version/src/hooks/usePokeState.ts` — game "brain" (state, saves, combat, catch, candy).
- `react-version/src/data/db.js` — Pokémon DB + sprite URLs (now local).
- `react-version/src/data/evolutions.js` — **per-Pokémon evolution levels (do not change).**
- `react-version/src/components/BattleBackground.tsx` — battle arena, sprites, VFX, catch anim.
- `react-version/src/components/{MapPanel,MartPanel,PokedexPanel,BoxPanel,LogPanel,...}.tsx` — panels.
- `react-version/src/index.css` — Tailwind import + theme vars, type colors, animations.

---

## Session 2026-11-19 — save-lock fix, nav redesign, Prestige, View Stats

### 1. Save-lock bug (data-loss class, FIXED)

The multi-tab save lock had all three failure modes at once:

| Mode | Was | Now |
|---|---|---|
| Lock stolen | `selectProfile` wrote the owner key **unconditionally**, so a second tab took ownership from the first | Claim only when the lock is free, ours, or stale |
| Silent refusal | `saveGame` did `if (locked) return;` — the player watched their progress stop saving with **no message** | Logs `⚠️ Save blocked: another tab has this profile open.` and warns to console |
| Never released | The owner key was written but never removed | Released on `beforeunload` **and** `pagehide`, only if we own it |
| Stale lock | No way to tell a live owner from a dead one | Owner key is now `sessionId:timestamp`, refreshed by a 5s heartbeat; a lock older than 15s can be taken over |

Also removed a duplicated `localStorage.setItem` line in `selectProfile`.

Verified live: a second tab does not steal the lock; a live lock is respected
and the save is visibly blocked; a stale lock is taken over.

### 2. Navigation redesign

The 3×3 grid of **emoji** buttons was cramped on narrow screens and mixed
emoji with the lucide icons used everywhere else, so the visual language was
inconsistent. Replaced with a vertical icon nav rail (Map / Mart / Storage /
Pokedex / Medals / Wiki / Log / Stats / Battle Hub / Settings), mirroring the
official game's left-hand view switcher. Labels are now readable words
instead of 8px micro-caps.

### 3. View Stats (NEW)

`statistics` was collected but only ever used to unlock achievements, so the
player could not see their own progress. New `StatsPanel.tsx` surfaces it:
catch rate, throws, shinies, wild/trainer/Elite Four/champion wins, money,
owned Pokémon, badges, balls — plus a completion bar for the dex.

### 4. Prestige (NEW)

A Lv.50+ Pokémon can be reset for permanent power. The official game's
mechanic was used as the reference.

**The balance problem, and the fix.** A flat percentage bonus on a Lv.1
Pokémon is always *worse* than simply levelling up (Lv.1 × 1.05 < Lv.50),
so prestige would be a trap. Each prestige therefore also grants a **level
floor that grows**:

| Prestige | Level floor | Stat bonus | Charmander attack | vs plain Lv.50 (64) |
|---|---|---|---|---|
| 1 | Lv.20 | +5% | 29 | wash |
| 2 | Lv.40 | +10% | 57 | wash |
| 3 | Lv.60 | +15% | 87 | **wins** |
| 4 | Lv.80 | +20% | 120 | wins |

The first two prestiges buy progress without a penalty; from the third on
the Pokémon is strictly stronger than where it would otherwise be. The
bonus belongs to the individual, so it survives a save/load.

- `PokemonInstance.prestige` added to the type
- Persisted in the save payload and restored on load (team and storage)
- `PRESTIGE_MIN_LEVEL = 50` gate, with a disabled button in manage mode
- IVs, EVs, nature, ability, moves and shininess are all preserved — only
  the level and XP are reset

Verified live: Lv.60 → Lv.20 with prestige 1, IVs kept, other team members
untouched, and the count survives a reload.

### 5. Also confirmed (no change needed)

- `npm run build` now works — the old "build is broken" note is outdated;
  `vite.config.ts` was fixed to target `react-version/` and emits a real bundle.
- `dexNumbers.ts` supplies all 895 National Dex numbers, so the missing
  `db.js` field is no longer a problem.
- All 7 regions are present in `routes.js`.
- Team reordering already existed (`movePokeUp`/`movePokeDown`/`movePokeToTop`).

### Not done (out of scope by request)

Poke Trader, save export/import (save-to-localStorage only), dual types.

---

## Session 2026-11-19 (b) — source-level fixes, type safety, broken assets

### 1. Wrong sprite for 93 of 895 Pokémon — FIXED & VERIFIED

`getPokemonId()` derived the sprite from the **array position** in the
database. That is not the National Dex number: the database orders its
alternate forms (Mega, Alolan, Galarian, Ash…) *after* the base species,
so the index ran far past the real dex range.

| Pokémon | Old sprite | Correct |
|---|---|---|
| M-Charizard X | **1 (Bulbasaur)** | 6 |
| M-Venusaur | 803 | 3 |
| A-Rattata | 809 | 19 |
| M-Blastoise | 806 | 9 |

93 of 895 entries were wrong. The correct numbers already existed in
`data/dexNumbers.ts` (895/895, resolved from PokeAPI) but were not used.
`getPokemonId()` now calls `getDexNumber()`. Verified: 1:1 name coverage,
all sample sprite URLs return HTTP 200, and the app renders `4.png` for
Charmander.

### 2. Offline progress inflated every stat — FIXED

The offline-progress path passed `poke.iv` — a **0–100 percentage** — into
the stat formula, which expects a **single IV of 0–31**. A maxed Pokémon
added +100 to every stat instead of +31, roughly tripling its strength.
The per-stat IVs are already stored on the instance, so they are now used.

### 3. TM rules enforced only in the UI — FIXED

- **Type compatibility** was checked in the modal but not in
  `teachMoveViaTM`, so any Pokémon could be taught any TM. The hook now
  applies the same rule the modal uses: the move must be in the learnset or
  match one of the Pokémon's types.
- **Badge requirement** was a lock overlay in the shop but `buyTM` never
  checked it, so a gated TM could be bought for free. Now enforced in the
  hook.

### 4. `manageMode` was two different flags — FIXED

`App.tsx` owned a `manageMode` state and `TeamPanel` kept its own copy.
The panel's Manage button toggled the panel's copy, which nothing else
read; the app's ✏️ Manage button toggled the app's copy, which the panel
never saw. So neither button affected the other's UI.

`manageMode` is now a controlled prop with an `onToggleManageMode`
callback, and the panel falls back to local state only when used
standalone.

### 5. Three dead controls in the roster — FIXED

- The **Sort** dropdown and the **Swap** button were rendered by
  `TeamPanel` but no handler was passed, so they did nothing.
- `onSelectDetail` was never passed either, so the Pokémon-detail modal
  could not be opened from the roster. Clicking a team member now opens it
  (verified: Nature, Ability, Gender and Evolution Line all render).

### 6. `tsconfig.json` created — 14 type errors → 0

The project had no `tsconfig.json` at all. A strict check surfaced 14 real
errors, including three genuine bugs:

- `wildPoke.type` / `activeFighter.type` — the property is `types`, so the
  **type badges in the battle HUD never rendered**.
- `activeProfile?.username` — `activeProfile` is a string, not an object.
- Missing `manageMode` / `onOpenBoxSelect` / `sortActiveTeam` props.

The data modules (`evolutions.js`, `typeModifiers.js`) now carry JSDoc
`@type` annotations giving them the index signatures they actually have.

**`npx tsc --noEmit` now reports 0 errors.**

### 7. Broken images — FIXED

Every asset the app requested was 404:

- The map images were in `react-version/public/` but the app requested
  `/assets/<name>.png`. Moved into `assets/`.
- `assets/other/trainer.png` was never copied across. Copied.
- The 14 gym/route backgrounds existed only in the legacy `public/` tree.
  Copied into `react-version/public/assets/backgrounds/`.
- `johto_realistic_map.png` does not exist anywhere — the reference now
  points at `johto_neon_map.png`, which does.
- **`db.js` referenced 2,684 sprite paths** in directories that were never
  created (`sprites/normal/`, `sprites/back-normal/`, `sprites/shiny/`,
  `sprites/back-shiny/`). All of them now resolve to the PokeAPI sprite
  URLs that `getPokemonSprites()` already used, matched by dex number.

Verified in the browser: **0 broken images** on the map screen and the
Pokedex tab; every local `/assets/` reference resolves.

### Not done

- The legacy vanilla-JS version in `public/` is untouched (the ~40 lint
  warnings come from it).
- `challengeLeader` / `currentLeaderDetails` are still dead code, so the
  Elite Four "Champion Rival" branch remains unreachable.
