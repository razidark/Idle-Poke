# IdlePoke Overhaul Roadmap & Missing Features List

> **Current dev state, fixes, and gotchas live in [`STATUS.md`](./STATUS.md) — read that first for hands-on work.**

This document acts as the master checklist tracking implemented milestones and active development gaps in the **IdlePoke Premium Edition** project.

---

## 🏆 Completed Features (What We Have)

### 1. Unified Dashboard Layout
* [x] **Three-Column Grid:** Clean layout stacking Map/Locations (Left), Battle Arena/Settings (Center), and tabbed status panels (Right).
* [x] **Light/Dark Toggle:** Clean CSS-variables-based theme transition.
* [x] **Integrated Gym Card overlay:** Dynamically renders the leader details and rewards during active badge fights.

### 2. Account Profiles & Save Management
* [x] **Multi-Profile Login:** Dedicated title screen allowing trainers to register, log in, or delete account profiles.
* [x] **Profile-Specific Saves:** Saves game progress to `idle_poke_save_${username}` rather than overriding a single save slot.
* [x] **Navbar Indicators:** Displays the logged-in trainer's name, avatar class emoji, and a clean **Log Out** shortcut that auto-saves before exit.

### 3. Starters & IV Stats Integration
* [x] **Based IV Stats:** Rolled Individual Values (IVs) are integrated directly into combat calculations (`attack`, `defense`, `speed`, and `maxHp`). Perfect 100% IVs grant a major combat advantage.
* [x] **Perfect Starter Choice:** Starting choices (Bulbasaur, Charmander, Squirtle) are guaranteed to roll with **100% perfect IVs** and **Epic Quality** stats.
* [x] **Evolution Scaling:** Stats recalculate using the custom IV values during levels ups and candy ingestion.

### 4. Shop Progression & Consumables
* [x] **Progression-Locked Balls:** Great Balls (1 Badge), Ultra Balls (3 Badges), and Master Balls (5 Badges) are locked behind Gym progress.
* [x] **EXP Candies:** Small (¤150, 1 Badge), Medium (¤1,200, 2 Badges), and Large (¤8,000, 4 Badges) candies allow instant, manual squad training.
* [x] **Passive Upgrades:** Running Shoes (tick speed), Exp. Share (bench yield), Amulet Coin (money multiplier), and Shiny Charm (shiny spawn multiplier) upgrades are fully functional.

### 5. Environments & Biomes
* [x] **Custom Pixel Art Backgrounds:** Loaded beautiful GBA-style wallpapers for Plains, Forests, Caves, Beaches/Water routes, and Gym Stadiums.
* [x] **Victory Road:** Custom dark archway cavern background rendered for all Victory Road routes.
* [x] **Custom Kanto Gyms:** Individual background templates matching the elemental type of each Kanto Gym Leader (e.g. Cerulean pool, Vermilion electric generators, Blaine lava vents).

---

## 🔍 Gaps & Missing Features (What We Don't Have Yet)

### 1. Region Access Extensions (Hoenn, Sinnoh, Unova, Kalos, Alola)
* [ ] **Map coordinates:** While `routes.js` contains route details for Hoenn, Sinnoh, Unova, Kalos, and Alola, the coordinates database `MAP_COORDINATES` in [MapPanel.tsx](file:///g:/RZL APPS/IdlePoke/react-version/src/components/MapPanel.tsx) only supports Kanto and Johto.
* [ ] **Visual Map Assets:** Missing realistic/neon map wallpaper assets for the maps beyond Kanto and Johto.
* [ ] **Region Select list:** The selector in the Travel Map sidebar is hardcoded to `['Kanto', 'Johto']`.

### 2. Auto-Sorting Team (Manage Team Roster)
* [x] **Auto-Ordering buttons:** `sortActiveTeam` is wired into the Roster Party header (Level / IV / Power / Dex#) — see `App.tsx`.

### 3. Active Move Clicker & PP System
* [x] **Manual Move triggers:** `AppMoveButton` renders a click-to-activate move board with PP and cooldown meters calling `clickMove` — see `App.tsx` / `usePokeState.ts`.

### 4. Rod / Fishing Progression System
* [ ] **Rod Purchases:** Although water/fishing routes exist, there is no rod item system (Old Rod, Good Rod, Super Rod) in the Shop to gating water routes.

### 5. Mega Evolutions
* [ ] **Permanent Mega forms:** The game database supports Mega Evolutions, but we don't have the level 100 evolution triggers or the "Evolve Mega" button to convert fully-trained Pokémon.
