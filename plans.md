# Sprint Reorganization & Implementation Plan

## Context

The user wants to reorganize remaining sprints and add new features/fixes. Sprint 29 (plans.md) is fully implemented. Sprint 20B is done (manual playtest deferred to after balancing). The remaining incomplete items from Sprints 23, 24, and 25 need restructuring, and several new requirements are being added.

## Sprint Reorganization

### Mark as Done
- **Sprint 20B**: Manual playtest — done, will re-test after balancing

### Merged Sprint 23/24 — Performance, Visual Polish & UI Fixes ✅ DONE
Combines remaining items from Sprint 23A + Sprint 24A + new items:
- [x] Screen centering fix (reduce GAME_WIDTH 1280→940, eliminate 362px dead space)
- [x] Update all Digimon/skill descriptions (auto-generate 257 entries in DigimonDescriptions.ts)
- [x] Player name entry for high scores (HTML DOM input, localStorage persistence, Name column)
- [ ] Particle pool (merge effects, hit particles, status visuals) — *deferred*
- [ ] Enhanced boss ability visual feedback — *deferred*
- [ ] FPS measurement on late-game waves — *deferred*

### Updated Sprint 25 — Balance & Mechanics Overhaul
Existing items + new requirements:
- [ ] Remove flying enemy type, replace with **Stealth** + **Healer** (more types later)
- [ ] Armor as shield (HP buffer consumed before HP, not % reduction)
- [ ] Boss lives penalty (regular boss = 3, phase boss = 5)
- [ ] Boss-only waves for phase bosses (waves 20, 40, 60, 80, 100)
- [ ] Add new enemy variants for underrepresented types — *existing*
- [ ] Balance new entries against existing towers — *existing*

---

## Implementation Plan (Sprint 23/24) — ✅ COMPLETED

### Step 1: Screen Centering Fix ✅

**Problem**: GAME_WIDTH=1280 but content is only ~918px wide → 362px dead space on right.

**Solution**: Reduce `GAME_WIDTH` from `1280` to `940`.

**Files**:
- `src/config/Constants.ts` (line 13): `GAME_WIDTH = 940`
- Verify all scenes — most use `this.cameras.main.width` or `GAME_WIDTH/2` for centering (auto-adjusts)

**Layout at 940px**:
| Region | X Start | X End | Width |
|--------|---------|-------|-------|
| Left HUD | 20 | 300 | 280 |
| Water buffer | 305 | 315 | 10 |
| Grid | 315 | 603 | 288 |
| Water buffer | 603 | 618 | 15 |
| Right panel | 618 | 918 | 300 |
| Right margin | 918 | 940 | 22 |

**Scenes to verify** (all use dynamic centering, should auto-adjust):
- `GameScene.ts`: Right panel BG (line 1392) uses `GAME_WIDTH - rightPanelStartX + 5` → becomes `940-618+5 = 327` — fits
- `EncyclopediaScene.ts`: Panel 600px → `(940-600)/2 = 170px` margins — fits but check if looks tight
- `CreditsScene.ts`: Panel 620px → `(940-620)/2 = 160px` margins — fits, might reduce to 580px
- `HighScoresScene.ts`: Panel 600px → 170px margins — OK
- `MainMenuScene.ts`, `StarterSelectScene.ts`, `GameOverScene.ts`, `PauseScene.ts`, `SettingsScene.ts`: All use `cameras.main.width` — auto-adjust

**Phaser handles scaling**: `Scale.FIT` + `CENTER_BOTH` in GameConfig.ts will scale the 940x720 canvas to fill viewport and center it.

---

### Step 2: Player Name for High Scores ✅

**Files**:

1. **`src/managers/HighScoreManager.ts`** — Add `playerName: string` to `HighScoreEntry` interface. Add helper functions:
   - `getLastPlayerName(): string` — reads from `localStorage('digimerge_td_player_name')`
   - `setLastPlayerName(name: string): void` — saves to localStorage

2. **`src/config/GameConfig.ts`** — Add `dom: { createContainer: true }` to Phaser config to enable HTML DOM elements (needed for text input)

3. **`src/scenes/GameOverScene.ts`** — Add name input flow:
   - After showing game over stats, show a styled HTML `<input>` via `this.add.dom()` pre-filled with last player name
   - "Save Score" button reads name, calls `setLastPlayerName()`, creates `HighScoreEntry` with name, saves via `HighScoreManager.addScore()`
   - Default name: "Player" if no previous name saved

4. **`src/scenes/HighScoresScene.ts`** — Add "Name" column:
   - Shift existing columns to accommodate name after rank
   - Display `entry.playerName || 'Anonymous'` for backward compatibility
   - Column layout: Rank | Name | Wave | Score | Kills | Time | Date | W/L

5. **`index.html`** — Add CSS for the name input (styled to match game theme)

---

### Step 3: Auto-Generate Digimon Descriptions ✅

**Files**:

1. **`src/types/DigimonTypes.ts`** — Add optional `description?: string` to `DigimonStats` and `EnemyStats` interfaces

2. **`src/data/DigimonDatabase.ts`** — Add `description` field to all ~257 entries. Auto-generate short 1-2 sentence descriptions based on:
   - Stage/tier (In-Training = small/cute, Mega = powerful/legendary)
   - Attribute (Vaccine = holy/protective, Virus = dark/aggressive, Data = balanced/tech)
   - Effect type (burn = fire attacks, slow = ice/water, poison = nature/toxic, etc.)
   - Known Digimon lore where applicable

   Example descriptions:
   ```
   koromon: "A small pink ball Digimon with sharp teeth. Despite its cute appearance, it has a fierce fighting spirit."
   agumon: "A Reptile Digimon with powerful fire attacks. Its Pepper Breath can burn enemies over time."
   greymon: "A giant Dinosaur Digimon that devastates groups with its area-of-effect fire breath."
   ```

3. **`src/scenes/EncyclopediaScene.ts`** — Show description in the detail card view below name/stats

4. **`src/ui/TowerInfoPanel.ts`** — Optionally show a short description subtitle under the Digimon name

---

## Implementation Plan (Sprint 25) — TODO

### Step 4: Boss-Only Waves (Simplest, do first)

**File**: `src/data/WaveData.ts`

Set `enemies: []` for **phase boss** waves only:
- Wave 20 (line ~221): `enemies: []` (boss: Greymon Evolved)
- Wave 40 (line ~424): `enemies: []` (boss: Myotismon)
- Wave 60 (line ~639): `enemies: []` (boss: VenomMyotismon)
- Wave 80 (line ~865): `enemies: []` (boss: Omegamon)
- Wave 100 (line ~1097): `enemies: []` (boss: Apocalymon)

Mid-phase bosses (10, 30, 50, 70, 90) keep their regular enemies.

WaveManager already handles empty enemy arrays correctly (boss spawns independently).

---

### Step 5: Boss Lives Penalty

**Files**:

1. **`src/entities/Enemy.ts`** — Add `public liveCost: number = 1;` property. In `reachBase()`, include `liveCost` in emitted event data. In `reset()`, reset to `liveCost = 1`.

2. **`src/data/WaveData.ts`** — Add `bossLiveCost` field to wave configs:
   - Mid-phase bosses (10, 30, 50, 70, 90): `bossLiveCost: 3`
   - Phase bosses (20, 40, 60, 80, 100): `bossLiveCost: 5`

3. **`src/types/GameTypes.ts`** or wave types — Add `bossLiveCost?: number` to `WaveConfig`

4. **`src/managers/WaveManager.ts`** — When spawning a boss, set `enemy.liveCost = waveConfig.bossLiveCost ?? 1`

5. **`src/scenes/GameScene.ts`** — Update `onEnemyReachedBase()` (line ~2163): extract `liveCost` from event data, subtract that many lives instead of always 1

---

### Step 6: Replace Flying with Stealth + Healer

**Remove `flying` type**, replace 12 flying enemies with new types.

#### Stealth Enemy Type
- **Behavior**: Invisible (alpha 0.3) until within 2 cells of a tower, then fully visible and targetable. Towers can only acquire stealth targets when they're "revealed" (within detection range).
- **Counter**: Dense tower placement, short-range high-DPS towers
- **Visual**: Semi-transparent sprite, shimmer effect when revealed

**Files**:
- `src/types/DigimonTypes.ts`: Change `EnemyType` — remove `'flying'`, add `'stealth'` and `'healer'`
- `src/entities/Enemy.ts`: Add stealth logic in `update()` — check distance to nearest tower, set alpha + `isRevealed` flag
- `src/systems/TargetingSystem.ts`: Filter out unrevealed stealth enemies from targeting. Remove `FLYING` priority or repurpose it.
- `src/managers/CombatManager.ts`: Remove `isFlying` from `enemyToTarget()`, add `isRevealed`
- `src/data/DigimonDatabase.ts`: Reassign ~6 of the 12 ex-flying enemies to `stealth`

#### Healer Enemy Type
- **Behavior**: Heals nearby enemies (within 2 cells) for X HP/sec while alive. Does not heal self.
- **Counter**: Prioritize killing healers first (new `HEALER` targeting priority?)
- **Visual**: Green pulse/aura around the healer, green floating numbers on healed allies

**Files**:
- `src/entities/Enemy.ts`: Add healer logic in `update()` — find nearby enemies, heal them each tick
- `src/data/DigimonDatabase.ts`: Reassign ~6 of the 12 ex-flying enemies to `healer`. Add `healAmount` or `healPerSecond` to enemy stats.
- `src/systems/TargetingSystem.ts`: Optionally add `HEALER` priority (targets healers first)

---

### Step 7: Armor as Shield System

**Current**: `actualDamage = incomingDamage * (1 - armor)` where armor is 0.0–0.6
**New**: Armor becomes a shield HP buffer. Shield absorbs damage first, then overflow hits HP.

**Files**:

1. **`src/entities/Enemy.ts`**:
   - Add properties: `public shieldHp: number = 0`, `public maxShieldHp: number = 0`
   - Constructor + `reset()`: `this.maxShieldHp = Math.floor(this.maxHp * this.armor); this.shieldHp = this.maxShieldHp;`
   - Rewrite `takeDamage(amount, ignoreArmor)`:
     ```
     if ignoreArmor OR shieldHp <= 0:
       hp -= amount
     else:
       shieldDamage = amount * (armorBreakActive ? 2.0 : 1.0)
       if shieldDamage >= shieldHp:
         overflow = shieldDamage - shieldHp
         shieldHp = 0
         hp -= overflow / (armorBreakActive ? 2.0 : 1.0)  // normalize overflow
       else:
         shieldHp -= shieldDamage
     ```
   - Rewrite `drawArmorBar()`: Show `shieldHp / maxShieldHp` ratio. Color: silver when full, yellow when < 50%, red when < 25% or armor_break active.
   - `getEffectiveArmor()`: Repurpose to return whether armor_break is active (for 2x multiplier)

2. **`src/data/DigimonDatabase.ts`**: Review armor values. Current range 0.0–0.6 means shields are 0%–60% of maxHP. This seems reasonable — keep as-is, tune after playtesting.

3. **`src/data/StatusEffects.ts`**: Update `armorBreak` description to "Doubles damage to enemy shields"

4. **Tests**: Add unit tests for shield absorption, overflow, armor_break 2x, armor_pierce bypass

---

## Update PROGRESS.md ✅

After implementation, update PROGRESS.md:
- [x] Mark Sprint 20B as complete
- [x] Replace Sprint 23A/24A sections with merged "Sprint 23/24"
- [x] Update Sprint 25 with new requirements
- [x] Update Sprint 27 remaining items
- [x] Add Sprint 26 (DNA Digivolution) — unchanged, still pending

---

## Verification

### Sprint 23/24 ✅ VERIFIED
1. `npm run build` — TypeScript clean ✅
2. `npm run test` — 527 tests pass ✅
3. `npm run dev` — visual check needed:
   - Game canvas properly centered, no dead space on right
   - All scenes render correctly within narrower 940px canvas
   - High scores: enter name on game over, see name in high scores table
   - Encyclopedia: descriptions visible in detail view

### Sprint 25
1. `npm run test` — all new + existing tests pass
2. `npm run dev` — gameplay check:
   - Phase boss waves (20, 40, 60, 80, 100): boss spawns alone, no regular enemies
   - Boss reaching base costs 3 lives (mid-phase) or 5 lives (phase boss)
   - Armored enemies show shield bar that depletes before HP bar
   - Armor_break makes shield deplete 2x faster
   - Armor_pierce bypasses shield entirely
   - Stealth enemies are semi-transparent until near towers
   - Healer enemies heal nearby allies with visible green effect
