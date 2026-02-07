# DigiMerge TD - Progress & Roadmap

## Current Status

**All 11 sprints complete + Sprint 12A-D + Sprint 13-16 + Sprint 18-22 done** | 498 tests passing | 19 test files | TypeScript clean | Vite build succeeds

Live at: https://wandering-pork.github.io/DigiMerge-TD/

### What's Built
- ~141 tower Digimon (21 starter lines + 36 alternate evolution towers), ~65 enemy Digimon, 12 bosses with unique abilities
- 100 main waves across 5 phases + endless mode (101+)
- Full merge, digivolve, DP, and origin systems + merge ability inheritance (bonus effects)
- Status effects (burn, poison, slow, freeze, stun, armor break) with visual feedback
- Boss ability system (10 unique abilities: stun, speed boost, DB drain, heal, etc.)
- Tutorial (8-step overlay), Encyclopedia (browsable catalog with filters, crisp detail view)
- Wave preview with interactive enemy tooltips (hover/click for stats + boss abilities)
- Save/load (LocalStorage, auto-save, export/import JSON), settings (SFX + music volume, toggles)
- Background music (menu + battle themes), game speed (1x/2x/3x)
- Visual merge effect (particle burst), right-click cancel, placement cancel
- Credits scene with disclaimer, version v1.0.0
- Sprout Lands tileset, 149 loaded sprites, 17 SFX, 2 music tracks
- Volume persistence across scenes (localStorage), improved UI text readability
- Statistics tracking (kills, towers, merges, digivolutions, DB earned, playtime)
- Per-tower kill count and damage tracking, MVP tower in post-game
- Investment-based sell formula (50% of base + level-up costs)
- Low lives warning (flash at ≤5), danger vignette (red border at <3), boss incoming alert
- Keyboard shortcuts: S/Del=sell, U=level up, D=deselect, Tab=cycle towers
- Post-game stats screen with run summary, MVP tower, animated stat entries
- High scores system (top 10, localStorage), High Scores scene from main menu

---

## Completed Work

### Sprints 1-8: Core Game
- **Foundation**: Phaser 3 + TypeScript + Vite + Vitest, all scenes, data files, 65 sprites, 17 SFX
- **Entities**: Tower (sprite, selection, range, combat), Enemy (path following, health bar), Projectile (homing, trails)
- **Game Loop**: WaveManager, CombatManager, AttributeSystem, TargetingSystem (7 priority modes)
- **Economy**: GameStateManager, LevelSystem, SpawnMenu, tower placement on grid
- **Evolution**: DPSystem, OriginSystem, EvolutionModal, TowerInfoPanel with digivolve button
- **Merge**: MergeSystem, TowerManager, MergeModal, merge mode (highlight candidates, click-to-merge)
- **Polish**: AudioManager (17 SFX), SaveManager (LocalStorage + auto-save), boss health bar + announcements

### Post-MVP Polish
- UI Theme System (UITheme.ts + UIHelpers.ts)
- Volume control (slider + mute), game speed (1x/2x/3x), Sprout Lands tileset
- Settings overlay (non-pausing), simplified pause (click/ESC), GitHub Pages deployment

### Gameplay Enhancements
- Stage-based level-up cost scaling (In-Training x1 to Ultra x5)
- Status effects system (6 effects with DoT, CC, visual indicators)
- Tower skills display, floating damage numbers (color-coded), health bar toggle
- Wave preview with sprites, Lv+5/MAX with affordable level calc, auto-start wave toggle

### Enemy Mechanics
- Regen (2% HP/sec, blocked by poison), Shielded (60% armor, blue tint), Splitter (x2/x4 on death)

### Content Expansion
- **Phase 2 (Waves 21-40)**: 18 Champion enemies, bosses Devimon + Myotismon
- **Phase 3 (Waves 41-60)**: 13 Ultimate enemies, bosses SkullGreymon + VenomMyotismon
- **Phase 4 (Waves 61-80)**: 16 Mega enemies, bosses Machinedramon + Omegamon
- **Phase 5 (Waves 81-100)**: 5 Ultra enemies, bosses Omegamon Zwart + Apocalymon (final boss)
- **Endless Mode (101+)**: Dynamic generation, 1.05^n HP scaling, boss every 10 waves

### Roster Expansion (Phase 10)
- Tier 1 (Lines 9-15): Nyaromon, Gummymon, Chocomon, Pyocomon, Mochimon, Pukamon, Dorimon
- Tier 2 (Lines 16-21): Sunmon, Moonmon, Kyokyomon, Puroromon, Budmon, Caprimon
- spriteKey system for ID/sprite mismatches, 21 starters total, ~54 new sprites

### Boss Abilities (Sprint 10)
10 unique abilities: Nova Blast (stun), Mega Flame (speed boost), Death Claw (DB drain), Crimson Lightning (heal), Ground Zero (projectile destroy), Venom Infuse (minion spawn), Infinity Cannon (range reduce), Transcendent Sword (damage shield), Garuru Cannon (top DPS stun), Total Annihilation (global stun)

### Tutorial & Encyclopedia (Sprint 11)
- 8-step tutorial with highlight zones, skip button, localStorage persistence
- Encyclopedia with type/stage filters, pagination, detail view, evolution chains
- Enhanced wave preview with enemy sprites + type tags + boss ability names

### Sprint 12A-D: Polish, Bug Fixes & Content Expansion
- **12A Critical Fixes**: Game Over freeze, Continue button, TowerInfoPanel real-time DB updates
- **12B UI/UX**: Single starter selection, Pixel Digivolve font, boss ability visibility, encyclopedia skill names + evolution chains + tower-only default, boss sprite aura
- **12C Gameplay**: Wave type limits (max 5 unique, min 5 each), auto-pause on tab blur, projectile particles, hit particles per effect, multi-hit visual spread
- **12D Content**: 36 enemy Digimon repurposed as alternate evolution tower entries (8 Rookie, 10 Champion, 8 Ultimate, 10 Mega), connected as alternate paths from existing starters via DP gating

### Sprint 13: Merge Ability Inheritance
- Tower instances gain `bonusEffects` array (`BonusEffect[]`) — inherited from sacrifice on merge
- Sacrifice's effect added at half proc chance, max 2 bonus effects per tower
- Same-effect stacking: +5% proc chance instead of duplicate
- CombatManager rolls bonus effects after primary effect (first successful roll wins)
- TowerInfoPanel displays bonus effects below primary skill
- MergeModal previews effect inheritance before confirming
- Save/load preserves bonusEffects (GameTypes.TowerSaveData + GameScene restore)
- 11 new tests (479 total), files: Tower.ts, GameTypes.ts, MergeSystem.ts, CombatManager.ts, TowerInfoPanel.ts, MergeModal.ts, GameScene.ts

### Sprint 20: Bug Fixes & Foundation
- **20A Boss Sprite Fix**: Added `spriteKey: 'greymon'` to boss_greymon_evolved, updated Enemy.ts to prefer spriteKey field, verified all 12 boss sprites resolve correctly
- **20C Statistics Activation**: Wired up GameStatistics tracking in GameScene — enemiesKilled, towersPlaced, mergesPerformed, digivolutionsPerformed, totalDigibytesEarned, highestWave, playtimeSeconds; saved/restored with auto-save
- **20D Sell Value Formula**: Added `getSellPrice(level, stage)` to Constants.ts — 50% of (base cost + cumulative level-up costs with stage multiplier), minimum 25 DB; 6 new tests

### Sprint 21: Quality of Life & UX
- **21C Warnings & Notifications**: Low lives warning (flash lives counter at ≤5), danger vignette (pulsing red border when lives < 3), boss incoming warning text below grid
- **21D Keyboard Shortcuts**: S/Del=sell selected tower, U=level up, D=deselect, Tab=cycle through towers; hotkey hints on buttons ([U], [S]); EventBus events for shortcut actions

### Sprint 22: Statistics & Post-Game
- **22A Per-Tower Tracking**: Added killCount and totalDamageDealt to Tower class, sourceTowerID on Projectile for attribution, CombatManager sets sourceTowerID, kills/damage displayed in TowerInfoPanel, saved/restored
- **22B Post-Game Stats Screen**: Redesigned GameOverScene with expanded panel (statistics grid: 2 columns × 3 rows, MVP tower section, animated staggered entries), score calculation, "New Record!" indicator
- **22C Run History & High Scores**: HighScoreManager.ts (top 10, localStorage, score formula: wave×100 + kills×10 + lives×50), HighScoresScene.ts (table with rank/wave/score/kills/time/date), High Scores button on MainMenu, Clear High Scores in Settings; 13 new tests

---

## Test Summary (498 tests, 19 files)

| Test File | Tests |
|-----------|-------|
| AttributeSystem | 20 |
| TargetingSystem | 13 |
| DPSystem | 19 |
| LevelSystem | 49 |
| MergeSystem | 28 |
| OriginSystem | 34 |
| StatusEffects | 73 |
| BossAbilitySystem | 26 |
| GridUtils | 16 |
| Constants | 37 |
| DigimonDatabase | 20 |
| EvolutionPaths | 28 |
| WaveData | 26 |
| GameStateManager | 52 |
| SaveManager | 16 |
| SpawnMenu | 18 |
| TutorialOverlay | 4 |
| EncyclopediaScene | 6 |
| HighScoreManager | 13 |

---

## File Inventory (47 source files)

- **config/**: Constants.ts, GameConfig.ts
- **data/**: DigimonDatabase.ts, EvolutionPaths.ts, StatusEffects.ts, WaveData.ts
- **entities/**: Tower.ts, Enemy.ts, Projectile.ts
- **managers/**: AudioManager.ts, CombatManager.ts, GameStateManager.ts, HighScoreManager.ts, SaveManager.ts, TowerManager.ts, WaveManager.ts
- **scenes/**: BootScene.ts, PreloadScene.ts, MainMenuScene.ts, StarterSelectScene.ts, GameScene.ts, PauseScene.ts, SettingsScene.ts, GameOverScene.ts, HighScoresScene.ts, EncyclopediaScene.ts, CreditsScene.ts
- **systems/**: AttributeSystem.ts, BossAbilitySystem.ts, DPSystem.ts, LevelSystem.ts, MergeSystem.ts, OriginSystem.ts, TargetingSystem.ts
- **ui/**: SpawnMenu.ts, TowerInfoPanel.ts, EvolutionModal.ts, MergeModal.ts, TutorialOverlay.ts, UITheme.ts, UIHelpers.ts
- **utils/**: EventBus.ts, GridUtils.ts
- **types/**: DigimonTypes.ts, GameTypes.ts, index.ts
- main.ts

---

## Roadmap

### Sprint 20 — Bug Fixes & Effect Audit ✓ (partial)

#### 20A: Boss Sprite Fix ✓
- [x] Wave 20 boss `boss_greymon_evolved` — added `spriteKey: 'greymon'` override
- [x] Updated Enemy.ts to prefer `spriteKey` field over ID-derived key
- [x] Verified all 12 boss sprite keys resolve correctly

#### 20B: Tower Effect Audit (manual playtest)
- [ ] Playtest and verify all tower status effects work correctly
- [ ] Check proc rates, bonus effect inheritance, visual indicators

#### 20C: Statistics Activation ✓
- [x] Wire up `GameStatistics` tracking in GameScene via EventBus listeners
- [x] Track enemiesKilled, towersPlaced, mergesPerformed, digivolutionsPerformed
- [x] Track totalDigibytesEarned (wave rewards + sell income), highestWave
- [x] Pass statistics to SaveManager on auto-save, restore from save
- [x] Playtime tracker (elapsed ms, converted to seconds, saved/restored)

#### 20D: Sell Value Formula ✓
- [x] Added `getSellPrice(level, stage)` to Constants.ts — 50% of (base + cumulative level-up costs)
- [x] Updated TowerInfoPanel to use investment-based formula
- [x] 6 new tests for sell price calculation

---

### Sprint 21 — Quality of Life & UX ✓ (partial)

#### 21A: Range Preview on Placement
- [ ] Show range circle when hovering over valid grid cells during tower placement
- [ ] Preview tower sprite on hover (ghost/transparent) before committing
- [ ] Show tower base stats in a tooltip during placement

#### 21B: SpawnMenu Tooltips & Info
- [ ] Add attribute triangle diagram/tooltip in SpawnMenu (Vaccine > Virus > Data > Vaccine)
- [ ] Add origin system explanation tooltip ("Spawn stage limits max evolution")
- [ ] Show Digimon base stats on hover before spawning (damage, speed, range, effect)
- [ ] Show evolution path preview (what this Digimon can evolve into)

#### 21C: Warnings & Notifications ✓
- [x] Low lives warning — flash HUD lives counter when lives ≤ 5
- [x] Boss incoming warning — "Boss incoming next wave!" text below grid
- [x] Critical state indicator — pulsing red vignette border when lives < 3

#### 21D: Keyboard Shortcuts ✓
- [x] `S` or `Del` — sell selected tower
- [x] `U` — level up selected tower
- [x] `D` — deselect current tower
- [x] `Tab` — cycle through placed towers
- [x] Hotkey hints on buttons ([U], [S])

---

### Sprint 22 — Statistics & Post-Game ✓

#### 22A: Per-Tower Tracking ✓
- [x] Added `killCount` and `totalDamageDealt` to Tower class
- [x] Added `sourceTowerID` to Projectile for kill/damage attribution
- [x] Display kill count and total damage in TowerInfoPanel
- [x] MVP tower (most kills) computed and passed to post-game

#### 22B: Post-Game Stats Screen ✓
- [x] Redesigned GameOverScene with expanded panel (statistics grid, MVP tower, score)
- [x] Animated staggered stat entries (2-column layout)
- [x] "New Record!" highlight when beating previous best score

#### 22C: Run History & High Scores ✓
- [x] HighScoreManager.ts — top 10 runs in localStorage, score formula (wave×100 + kills×10 + lives×50)
- [x] HighScoresScene.ts — table with rank, wave, score, kills, time, date, W/L
- [x] High Scores button on MainMenuScene (conditional on existing scores)
- [x] Clear High Scores button in SettingsScene
- [x] 13 new tests for HighScoreManager

---

### Sprint 23 — Performance Optimization

#### 23A: Object Pooling
- [ ] Projectile pool — reuse instead of create/destroy per shot
- [ ] Enemy pool — reuse instead of create/destroy per wave
- [ ] Particle pool — reuse for merge effects, hit particles, status effect visuals
- [ ] Measure before/after FPS on late-game waves (80+) with many towers

#### 23B: Sprite Sheet Atlases
- [ ] Set up texture atlas tooling (TexturePacker or free alternative)
- [ ] Pack tower sprites into atlas(es) by stage
- [ ] Pack enemy sprites into atlas(es) by phase
- [ ] Pack UI/effect sprites into atlas
- [ ] Update PreloadScene to load atlases instead of individual PNGs
- [ ] Measure load time improvement (currently ~149 individual sprite loads)

---

### Sprint 24 — Visual Polish

#### 24A: Boss & Enemy Effects
- [ ] Unique boss death animation (larger explosion, screen flash, reward popup)
- [ ] Enemy death particles (small burst on kill, colored by attribute)
- [ ] Tower attack animation (brief scale pulse or flash when firing)
- [ ] Enhanced boss ability visual feedback (screen shake, overlays, area indicators)

#### 24B: Evolution Path Preview
- [ ] Show available evolution options in TowerInfoPanel (stat comparison before committing)
- [ ] Preview next evolution's sprite, damage, speed, range, and ability
- [ ] Dim/lock evolutions that require more DP

---

### Sprint 25 — Roster Expansion

- [ ] Audit current roster: ~141 towers across 21 lines, identify gaps
- [ ] Add more alternate evolution paths using available sprites (842 total, ~149 used)
- [ ] Target: 150+ tower Digimon
- [ ] Add new enemy variants for underrepresented types (flying, regen, splitter)
- [ ] Balance new entries against existing towers at each stage
- [ ] Update tests for new database entries

---

### Sprint 26 — DNA Digivolution (Ultra Tier)

- [ ] Design DNA Digivolution system:
  - Combine two specific Mega Digimon to create an Ultra
  - Requires both at max level + DP threshold
  - DNA pairs defined in evolution paths (e.g. WarGreymon + MetalGarurumon = Omnimon)
- [ ] Add DNA fusion UI (select two compatible Megas, confirm fusion)
- [ ] Add Ultra-tier tower stats and abilities
- [ ] Define 8+ DNA fusion pairs (see `ROSTER_EXPANSION_PLAN.md`)
- [ ] Update EvolutionPaths with DNA routes
- [ ] Update Encyclopedia to display DNA requirements
- [ ] Add tests for DNA merge validation, stat calculations

---

### Sprint 27 — Accessibility

- [ ] Colorblind mode: add attribute icons/symbols alongside colors (e.g. shield=Vaccine, sword=Virus, circle=Data, star=Free)
- [ ] Attribute icon display on tower sprites, enemy sprites, and all UI panels
- [ ] High-contrast mode option for UI panels and text
- [ ] Current game speed indicator (persistent HUD badge showing 1x/2x/3x)
- [ ] Settings toggle for colorblind-friendly palette

---

## Future Ideas

- Map expansion (multiple map layouts, map select scene)
- Achievements system
- Mobile touch optimization
- Difficulty modes (Easy / Normal / Hard)
- Challenge modes (limited towers, no merge, speed run)
- Tower synergies (adjacent tower bonuses)
- Localization (multi-language)
- PWA support (installable web app, offline play)
- Open Graph meta tags, release tag
- Tower comparison UI (side-by-side stats)
- Undo/refund grace period on tower placement

---

## Reference: Roster Expansion Plan

See `ROSTER_EXPANSION_PLAN.md` for:
- Tier 1-2 tower line details (21 lines total)
- New enemy additions by tier (~60 planned)
- DNA Digivolution targets (8 fusions)
- Sprite availability analysis and name mappings

## Reference: Sprite Filename Corrections

Several Digimon use Japanese romanization for sprite filenames. See `CLAUDE.md` Appendix B for the full mapping table.
