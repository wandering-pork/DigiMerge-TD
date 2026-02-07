# DigiMerge TD - Progress & Roadmap

## Current Status

**All 11 sprints complete + Sprint 12A-D + Sprint 13-16 + Sprint 18 + Sprint 19 done** | 479 tests passing | 18 test files | TypeScript clean | Vite build succeeds

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

---

## Test Summary (479 tests, 18 files)

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
| Constants | 31 |
| DigimonDatabase | 20 |
| EvolutionPaths | 28 |
| WaveData | 26 |
| GameStateManager | 52 |
| SaveManager | 16 |
| SpawnMenu | 18 |
| TutorialOverlay | 4 |
| EncyclopediaScene | 6 |

---

## File Inventory (45 source files)

- **config/**: Constants.ts, GameConfig.ts
- **data/**: DigimonDatabase.ts, EvolutionPaths.ts, StatusEffects.ts, WaveData.ts
- **entities/**: Tower.ts, Enemy.ts, Projectile.ts
- **managers/**: AudioManager.ts, CombatManager.ts, GameStateManager.ts, SaveManager.ts, TowerManager.ts, WaveManager.ts
- **scenes/**: BootScene.ts, PreloadScene.ts, MainMenuScene.ts, StarterSelectScene.ts, GameScene.ts, PauseScene.ts, SettingsScene.ts, GameOverScene.ts, EncyclopediaScene.ts, CreditsScene.ts
- **systems/**: AttributeSystem.ts, BossAbilitySystem.ts, DPSystem.ts, LevelSystem.ts, MergeSystem.ts, OriginSystem.ts, TargetingSystem.ts
- **ui/**: SpawnMenu.ts, TowerInfoPanel.ts, EvolutionModal.ts, MergeModal.ts, TutorialOverlay.ts, UITheme.ts, UIHelpers.ts
- **utils/**: EventBus.ts, GridUtils.ts
- **types/**: DigimonTypes.ts, GameTypes.ts, index.ts
- main.ts

---

## Roadmap

### Sprint 20 — Bug Fixes & Effect Audit

#### 20A: Boss Sprite Fix
- [ ] Wave 20 boss `boss_greymon_evolved` resolves to sprite key `greymon_evolved` which doesn't exist — falls back to missing texture
- [ ] Decide: use existing `greymon` sprite, or find/add a distinct sprite (e.g. GeoGreymon, Greymon_X)
- [ ] Verify all other boss sprite keys resolve correctly

#### 20B: Tower Effect Audit
- [ ] Playtest and verify all tower status effects work correctly:
  - Burn (DoT, 5% HP/tick over 3s)
  - Poison (DoT, 3% HP/tick over 4s, stacks x3)
  - Slow (40% speed reduction, 2s)
  - Freeze (full stop 1.5s + slow after thaw)
  - Stun (full stop 1s)
  - Armor Break (armor reduction, 3s)
- [ ] Check proc rates feel correct across all towers with effects
- [ ] Verify bonus effect inheritance works in practice (merge a tower with an effect, confirm the survivor gains it)
- [ ] Check visual indicators (tint, particles) display for each effect
- [ ] Fix any broken or unbalanced effects found during testing

#### 20C: Statistics Activation
- [ ] Wire up `GameStatistics` tracking in GameStateManager (interface already exists in SaveManager)
- [ ] Increment `enemiesKilled` on enemy death event
- [ ] Increment `towersPlaced` on tower spawn
- [ ] Increment `mergesPerformed` on merge
- [ ] Increment `digivolutionsPerformed` on evolution
- [ ] Track `totalDigibytesEarned` (wave rewards + sell income)
- [ ] Track `highestWave` on wave completion
- [ ] Pass statistics to SaveManager on auto-save
- [ ] Add playtime tracker (elapsed seconds, saved/restored)

#### 20D: Sell Value Formula
- [ ] Move sell price calculation from TowerInfoPanel (`level * 25`) to Constants.ts
- [ ] Define clear refund formula based on total investment (spawn cost + level-up costs spent)
- [ ] Display sell value prominently in TowerInfoPanel

---

### Sprint 21 — Quality of Life & UX

#### 21A: Range Preview on Placement
- [ ] Show range circle when hovering over valid grid cells during tower placement
- [ ] Preview tower sprite on hover (ghost/transparent) before committing
- [ ] Show tower base stats in a tooltip during placement

#### 21B: SpawnMenu Tooltips & Info
- [ ] Add attribute triangle diagram/tooltip in SpawnMenu (Vaccine > Virus > Data > Vaccine)
- [ ] Add origin system explanation tooltip ("Spawn stage limits max evolution")
- [ ] Show Digimon base stats on hover before spawning (damage, speed, range, effect)
- [ ] Show evolution path preview (what this Digimon can evolve into)

#### 21C: Warnings & Notifications
- [ ] Low lives warning — flash HUD lives counter + play alert SFX when lives drop below threshold (e.g. 5)
- [ ] Boss incoming warning — show "Boss incoming next wave!" in wave preview when next wave has a boss
- [ ] Critical state indicator — tint screen edges red when lives < 3

#### 21D: Keyboard Shortcuts
- [ ] `S` or `Del` — sell selected tower
- [ ] `U` — level up selected tower
- [ ] `D` or `Click empty` — deselect current tower
- [ ] `Tab` — cycle through placed towers
- [ ] Display hotkey hints on buttons (e.g. "Sell (S)")

---

### Sprint 22 — Statistics & Post-Game

#### 22A: Per-Tower Tracking
- [ ] Add `killCount` to Tower class, increment in CombatManager on kill
- [ ] Add `totalDamageDealt` to Tower class, increment on each hit
- [ ] Display kill count and total damage in TowerInfoPanel
- [ ] Highlight "MVP tower" (most kills) in post-game

#### 22B: Post-Game Stats Screen
- [ ] Redesign GameOverScene to show detailed run summary:
  - Waves completed, playtime
  - Total enemies killed, towers placed
  - Merges performed, digivolutions performed
  - Total DigiBytes earned
  - MVP tower (name, kills, damage dealt)
- [ ] Different layouts for victory vs defeat
- [ ] "New Record!" highlight when beating previous best wave

#### 22C: Run History & High Scores
- [ ] Save top 10 runs to localStorage (wave, time, date, score)
- [ ] Score formula: waves cleared + kills + bonus for lives remaining
- [ ] High scores viewable from MainMenuScene
- [ ] Clear history button in settings

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
