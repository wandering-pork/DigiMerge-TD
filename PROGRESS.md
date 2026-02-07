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

### Sprint 12D — Content Expansion (COMPLETE)

#### D1: Enemy Digimon as Towers (36 New Tower Entries)
- [x] Identified 36 enemy Digimon with existing sprites repurposed as towers
- [x] Added tower stats (damage, speed, range, effect) balanced by stage
- [x] Created evolution paths as alternates within existing 21 starter lines
- [x] No new starters needed — all new towers are alternate evolution paths
- [x] Updated tests: 11 new tests (468 total, all passing)
- **New towers by stage:** 8 Rookie, 10 Champion, 8 Ultimate, 10 Mega
- **Files:** `DigimonDatabase.ts`, `EvolutionPaths.ts`

---

### Sprint 13 — Merge Ability Inheritance (COMPLETE)

- [x] Add `bonusEffects` field to Tower class + BonusEffect interface in GameTypes
- [x] Update MergeSystem: calculateMergeEffects (half proc chance, dedup, max 2, +5% stack)
- [x] Update CombatManager to roll bonus effects on attack
- [x] Update TowerInfoPanel to display bonus effects
- [x] Update MergeModal to preview effect inheritance
- [x] Update SaveManager to serialize/deserialize bonusEffects (Tower.toSaveData + GameScene restore)
- [x] Add 11 tests for effect inheritance, stacking, max cap (479 total)
- **Files:** `Tower.ts`, `GameTypes.ts`, `MergeSystem.ts`, `CombatManager.ts`, `TowerInfoPanel.ts`, `MergeModal.ts`, `GameScene.ts`

---

### Sprint 14 — Wave Preview Interaction (COMPLETE)

- [x] Wave preview enemy entries interactive (invisible hit zones with pointer events)
- [x] Tooltip panel: sprite (2.5x), name (attribute-colored), stage, attribute, HP/speed/armor/type/weakness stats
- [x] Hover shows tooltip (positioned left of preview, screen-clamped)
- [x] Click pins tooltip (toggle, [x] indicator), dismissed on click elsewhere
- [x] Boss tooltip includes ability name + description
- [x] Tooltip positioned to avoid overlapping right panel (shows to the left)
- **Files:** `GameScene.ts`

---

### Sprint 15 — Audio & Save Export (COMPLETE)

#### 15.1 Background Music
- [x] 2 looping MP3 tracks: menu theme (kawaii dance), battle theme (j-rock anime)
- [x] AudioManager extended: playMusic, stopMusic, playMenuMusic, playBattleMusic, setMusicVolume, getMusicVolume
- [x] Music volume slider (gold-colored) in SettingsScene, separate from SFX
- [x] Menu music plays in MainMenuScene, battle music in GameScene
- **Files:** `AudioManager.ts`, `PreloadScene.ts`, `SettingsScene.ts`, `GameScene.ts`, `MainMenuScene.ts`

#### 15.2 Sprite Sheets (DEFERRED)
- Performance optimization, requires atlas tooling — deferred to later sprint

#### 15.3 Save File Export/Import
- [x] Export Save button (JSON file download with date-stamped filename)
- [x] Import Save button (file picker, JSON validation, version check)
- [x] Status feedback (success/error messages in SettingsScene)
- **Files:** `SaveManager.ts`, `SettingsScene.ts`

---

### Sprint 16 — Polish & Cleanup (PARTIAL)

#### 16.1 Visual Effects
- [x] Visual merge effect (16-particle burst + central flash at survivor position)
- [x] Right-click to cancel (merge mode, tower selection, spawn menu) + context menu suppressed
- [x] ESC already handled merge mode cancellation (existing)

#### 16.2 Code Refactoring (DEFERRED)
- Larger refactor — deferred to post-release

#### 16.3 Performance (DEFERRED)
- Object pooling — deferred to post-release when perf issues are measured

#### 16.4 More Content (DEFERRED)
- DNA Digivolution, enemy expansion — deferred to future sprints

**Files:** `GameScene.ts`

---

### Sprint 17: Map Expansion

- [ ] Map data architecture (multiple map configs, dynamic grid)
- [ ] New maps: Wide Valley (12x14), Gauntlet (6x24), Crossroads (10x16, dual spawn)
- [ ] Map select scene with thumbnails and difficulty ratings
- [ ] Multi-spawn support for Crossroads map

---

### Sprint 18 — Public Release Prep (COMPLETE)

- [x] Credits scene: Game, Framework, Language, Sprites, Tileset, SFX, Music, Font, Built-with credits
- [x] Fan-made disclaimer (non-commercial, not affiliated with Bandai Namco/Toei)
- [x] Version number v1.0.0 on main menu
- [x] Credits button added to MainMenuScene, CreditsScene registered in GameConfig
- [ ] Final playtesting pass (manual — all 100 waves + endless, Chrome/Firefox/Edge)
- [ ] Open Graph meta tags, release tag (v1.0.0)
- **Files:** `CreditsScene.ts` (new), `MainMenuScene.ts`, `GameConfig.ts`

---

### Sprint 19 — Bug Fixes & UI Polish (COMPLETE)

#### 19A: Critical Bug Fixes
- [x] Fix SettingsScene restart crash (get GameScene ref before stopping self)
- [x] Fix SettingsScene Main Menu crash (stop GameScene first, then navigate)
- [x] Fix AudioManager EventBus cleanup (store handler refs, proper `off()` with fn+context)
- [x] Add MainMenuScene `shutdown()` to prevent music accumulation
- [x] Remove Daemon (missing sprite): deleted from PreloadScene, DigimonDatabase, EvolutionPaths, WaveData (7 refs replaced)

#### 19B: Settings & UX Improvements
- [x] Fix Settings panel layout overflow: increased panelHeight 580→640 (GameScene) / 460→520 (MainMenu)
- [x] Repositioned save status text to flow naturally after Export/Import buttons
- [x] Add Settings gear button to MainMenuScene (top-right corner, launches SettingsScene overlay)
- [x] Conditional Settings buttons: hide Restart/Main Menu when opened from MainMenuScene
- [x] Disclaimer popup on first visit (localStorage persistence, "I Understand" to dismiss)

#### 19C: Volume Persistence
- [x] AudioManager localStorage persistence (`digimerge_audio_settings` key)
- [x] Static `loadSettings()` / instance `saveSettings()` for cross-scene volume state
- [x] First-time defaults: sfxVolume=0.5, musicVolume=0.3, enabled=true (was 0/false/0.3)
- [x] MainMenuScene reads persisted volume instead of hardcoded 0.3
- [x] SettingsScene falls back to persisted settings when no AudioManager instance exists
- [x] Volume, music volume, and mute state persist across MainMenu↔Game transitions

#### 19D: UI Text Readability & Encyclopedia Fixes
- [x] UITheme: PANEL_LABEL 12px→14px, PANEL_VALUE 13px→15px
- [x] TowerInfoPanel: panel height 660→700, stat row height 24→26, skill name/chance 12→14px, skill desc 10→12px, bonus text 11→13px
- [x] Encyclopedia detail: stat labels 12→14px, stat values 13→15px, row height 24→28px, evo names 9→11px
- [x] Encyclopedia evolution chain: "From:"/"To:" labels moved above sprite rows, sprite spacing 70→85px
- [x] Encyclopedia card heights: 480→540 (with evo), 380→420 (without), grid names 9→10px
- [x] Added `resolution: 2` to all detail view and skill text for crisp rendering
- [x] Removed "Enemies" filter from Encyclopedia, deduplicated "All" mode (prefer tower entries)
- [x] Added Tower/Enemy toggle tabs in detail view when counterpart exists
- **Files:** `SettingsScene.ts`, `AudioManager.ts`, `MainMenuScene.ts`, `PreloadScene.ts`, `DigimonDatabase.ts`, `EvolutionPaths.ts`, `WaveData.ts`, `EncyclopediaScene.ts`, `UITheme.ts`, `TowerInfoPanel.ts`, `DigimonDatabase.test.ts`

---

## Future Ideas (Post-Release)

- Achievements / Leaderboards
- Mobile touch optimization
- Difficulty modes (Easy / Normal / Hard)
- Challenge modes (limited towers, no merge, speed run)
- Localization (multi-language)

---

## Reference: Roster Expansion Plan

See `ROSTER_EXPANSION_PLAN.md` for:
- Tier 1-2 tower line details (21 lines total)
- New enemy additions by tier (~60 planned)
- DNA Digivolution targets (8 fusions)
- Sprite availability analysis and name mappings

## Reference: Sprite Filename Corrections

Several Digimon use Japanese romanization for sprite filenames. See `CLAUDE.md` Appendix B for the full mapping table.
