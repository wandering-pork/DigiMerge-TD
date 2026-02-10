# DigiMerge TD — Balance Pass Plan

Comprehensive balance audit based on DPS calculations, wave HP curves, status effect analysis, and economy modeling. All numbers reference current values in `src/data/DigimonDatabase.ts`, `src/data/WaveData.ts`, `src/data/StatusEffects.ts`, and `src/config/Constants.ts`.

---

## TOWERS

### 1. Pukamon is the weakest starter by far

**Problem:** Pukamon has 1.0 base DPS (2 dmg × 0.5 speed) vs In-Training average of ~1.8 DPS. Picking Pukamon is playing on hard mode with no upside.

| Starter | Damage | Speed | DPS |
|---------|--------|-------|-----|
| Pukamon | 2 | 0.5 | **1.0** |
| Koromon | 3 | 0.6 | 1.8 |
| Average | — | — | 1.8 |

**Fix:** `pukamon.baseDamage: 2 → 3`, `pukamon.baseSpeed: 0.5 → 0.6` (new DPS: 1.8)

**File:** `DigimonDatabase.ts` line ~842

---

### 2. UlforceVdramon has broken DPS (3.5x average Mega)

**Problem:** 80 dmg × 1.6 speed = **128 DPS**. Average Mega is ~36 DPS. This was missed in the Sprint 25 nerf pass.

| Mega | Damage | Speed | DPS | vs Avg |
|------|--------|-------|-----|--------|
| UlforceVdramon | 80 | 1.6 | **128.0** | 3.56x |
| WarGreymon | 70 | 0.5 | 35.0 | 0.97x |
| Average Mega | — | — | 36.0 | 1.00x |

**Fix:** `ulforcevdramon.baseSpeed: 1.6 → 0.9` (new DPS: 72, still strongest Mega but not absurd)

**File:** `DigimonDatabase.ts` line ~2173

---

### 3. Roster expansion Digimon (Hawkmon/Stingmon branches) are 2-3x their stage peers

**Problem:** Sprint 25 roster expansion introduced lines with far too much attack speed, making them dominate their entire tier.

| Digimon | Stage | DPS | Stage Avg | Ratio |
|---------|-------|-----|-----------|-------|
| Hawkmon | Rookie | 12.0 | 7.0 | 1.71x |
| Aquilamon | Champion | 32.5 | 15.0 | 2.17x |
| Silphymon | Ultimate | 70.0 | 23.0 | 3.04x |
| Stingmon | Champion | 36.4 | 15.0 | 2.43x |
| Jewelbeemon | Ultimate | 66.0 | 23.0 | 2.87x |

**Fix (reduce baseSpeed to bring in line):**
- `hawkmon.baseSpeed: 1.2 → 0.8` (DPS: 12.0 → 8.0)
- `aquilamon.baseSpeed: 1.3 → 0.7` (DPS: 32.5 → 17.5)
- `silphymon.baseSpeed: 1.4 → 0.7` (DPS: 70.0 → 35.0)
- `stingmon.baseDamage: 28 → 17, baseSpeed: 1.3 → 1.0` (DPS: 36.4 → 17.0)
- `jewelbeemon.baseDamage: 55 → 36, baseSpeed: 1.2 → 0.8` (DPS: 66.0 → 28.8)

**File:** `DigimonDatabase.ts` lines ~2041, ~2054, ~2067, ~1998, ~2010

---

### 4. Chocomon / Moonmon / Budmon / Puroromon starters are too weak (1.2-1.6 DPS)

**Problem:** CC/support-line starters deal 33-50% less damage than average. Their utility doesn't unlock until Rookie, so waves 1-5 are punishing if you pick these.

| Starter | Damage | Speed | DPS | vs Avg |
|---------|--------|-------|-----|--------|
| Chocomon | 2 | 0.6 | 1.2 | 0.63x |
| Moonmon | 2 | 0.6 | 1.2 | 0.63x |
| Budmon | 2 | 0.6 | 1.2 | 0.63x |
| Puroromon | 2 | 0.8 | 1.6 | 0.84x |
| Average | — | — | 1.9 | 1.00x |

**Fix:** Raise all four to `baseDamage: 3` (DPS: 1.8, 1.8, 1.8, 2.4 respectively).

**File:** `DigimonDatabase.ts` lines ~652, ~1031, ~1217, ~1155

---

## STATUS EFFECTS

### 5. Burn is negligible at all stages (~2-5% bonus damage)

**Problem:** Burn strength is 5% of tower damage per tick. Over 6 ticks (3s duration, 0.5s interval), total burn = 30% of ONE attack. Against enemies with hundreds or thousands of HP, this is meaningless.

| Tower | Burn Total | Enemy HP | % Bonus |
|-------|-----------|----------|---------|
| Greymon (18 dmg) | 5.4 | 100+ | ~5% |
| WarGreymon (70 dmg) | 21 | 1000+ | ~2% |

**Fix:** `StatusEffects.ts` burn `strength: 0.05 → 0.12`. New total burn = 72% of one attack, making it a meaningful DPS boost.

**File:** `StatusEffects.ts` line 55

---

### 6. MagnaAngemon execute at 8% is too low to matter

**Problem:** At 0.7 attacks/sec and 8% proc, expected executes per minute: 3.4 — and only triggers on low-HP enemies. Compare to Beelzemon at 40% which is usable.

**Fix:** `magnaangemon.effectChance: 0.08 → 0.18`

**File:** `DigimonDatabase.ts` line ~190

---

### 7. Armor Break proc rates are too low for the enemies that need it

**Problem:** Shielded enemies (Guardromon 60% armor, Monochromon 45%) are designed to be countered by armor break, but the main armor break towers have low proc rates. Armor break uptime at 10% chance is ~25%, meaning armor stays up 75% of the time.

| Tower | Proc % | Uptime |
|-------|--------|--------|
| Guilmon | 10% | ~25% |
| Gotsumon tower | 10% | ~25% |
| Ginryumon | 20% | ~40% |

**Fix:**
- `guilmon.effectChance: 0.10 → 0.18`
- `gotsumon_tower.effectChance: 0.10 → 0.15`

**File:** `DigimonDatabase.ts` lines ~229, ~1549

---

### 8. Slow duration (2s) is too short for its proc rate

**Problem:** At 20% proc rate and 2s duration, effective uptime is ~29%, giving only 11.6% average speed reduction. Enemies barely notice.

**Fix:** `StatusEffects.ts` slow `duration: 2 → 3`. New uptime: ~40%, effective speed reduction: ~16%.

**File:** `StatusEffects.ts` line 57

---

## WAVES

### 9. Waves 81-89 are nearly identical (9 copy-paste waves)

**Problem:** All nine waves use the same 5 enemies (Omegamon, Omegamon Zwart, Imperialdramon DM, Armageddemon, Millenniummon) with counts varying by ±1. This is the endgame climax — it should feel varied, not repetitive.

**Fix:** Introduce themed waves within the block:
- **W82**: Speed rush — swap in speedster-type Ultras
- **W84**: Armor wall — heavy tank/shielded enemies
- **W86**: Splitter swarm — Diaboromon-heavy
- **W88**: Flying assault — flying-type Megas/Ultras

Keep W81, 83, 85, 87, 89 as the standard all-rounder waves.

**File:** `WaveData.ts` lines ~851-948

---

### 10. Wave 46 is single-type Mamemon-only (boring or annoying)

**Problem:** 10 Mamemon (splitter) with no variety. A single type offers no strategic decision-making.

**Fix:** Change to `6 Mamemon + 5 WereGarurumon` — splitters + speedsters create a split-focus challenge.

**File:** `WaveData.ts` line ~481

---

### 11. Phase 2→3 transition (wave 41) is a huge HP cliff

**Problem:** Wave 39 has Champions (~100 HP each). Wave 41 jumps to Ultimates: MetalGreymon (500 HP, 30% armor), Myotismon (400 HP). Players barely surviving Phase 2 will hit a wall.

**Fix:** Wave 41 should include 2-3 Champion enemy types alongside the Ultimates, similar to how waves 16-19 previewed Champions. Example: `4 Greymon + 4 MetalGreymon + 5 MegaSeadramon + 5 Myotismon`.

**File:** `WaveData.ts` line ~429

---

## ECONOMY

### 12. Champion level-up cost multiplier (×2) makes maxing too expensive

**Problem:** Maxing a Champion to level 35 costs 2,380 DB. Phase 2 income is ~150-200 DB/wave. That's 12-16 waves to max ONE Champion tower. Players need multiple Champions but can't level any of them properly.

**Fix:** `Constants.ts` Champion multiplier: `2.0 → 1.75`. New max cost: ~2,083 DB (13% cheaper).

**File:** `Constants.ts` line ~58

---

### 13. Early wave spawn intervals (2000ms) are too tight for 11-15 enemy waves

**Problem:** Waves 3-5 have 11-15 enemies spawning every 2 seconds. New players with 3 towers can't process that many enemies while learning placement.

**Fix:** Waves 3-5 `spawnInterval: 2000 → 2200` (10% more breathing room).

**File:** `WaveData.ts` lines ~56-78

---

## GAMEPLAY FEEL

### 14. Patamon's 100% knockback is anti-synergy

**Problem:** Patamon attacks at 1.2 speed with 100% knockback. Every single hit pushes enemies backward, moving them OUT of other towers' range and resetting path progress. Patamon actively sabotages your own defense.

**Fix:** `patamon.effectChance: 1.0 → 0.35` — impactful but not every hit.

**File:** `DigimonDatabase.ts` line ~166

---

### 15. Support Megas (Seraphimon, SaintGalgomon, Plesiomon) have bottom-tier DPS without enough compensating power

**Problem:** These Megas have the lowest raw DPS of all Megas and their support effects don't fully compensate.

| Tower | DPS | Effect | vs Avg (36) |
|-------|-----|--------|-------------|
| SaintGalgomon | 27.5 | AoE barrage | 0.76x |
| Plesiomon | 28.0 | Freeze + heal | 0.78x |
| Seraphimon | 33.0 | Damage aura | 0.92x |

SaintGalgomon at 27.5 DPS is weaker than some Ultimates.

**Fix:**
- `saintgalgomon.baseDamage: 55 → 62` (DPS: 31.0)
- `plesiomon.baseDamage: 56 → 62` (DPS: 31.0)

Still the lowest Megas, but not embarrassingly weak.

**File:** `DigimonDatabase.ts` lines ~631, ~888

---

### 16. Heal effect at 100% proc is game-breaking (infinite lives)

**Problem:** Sunflowmon (Champion, 0.9 atk/sec, 100% heal) and Floramon tower (Rookie, 0.9 atk/sec, 100% heal) restore 1 player life on EVERY hit. That's nearly 1 free life per second per tower. With 2-3 of these, the player is effectively unkillable.

Heal mechanic: `EventBus.emit('tower:healed', { amount: 1 })` — triggers on every proc, restoring 1 life up to max 25.

The compound heal towers (Hououmon 0.50, Ophanimon 0.50, Plesiomon 0.40, Lilamon 0.35, Lotusmon 0.50) are already chance-based and heal is one sub-effect alongside damage effects, so those are fine.

**Fix:**
- `floramon_tower.effectChance: 1.0 → 0.08` (~1 life every 14 seconds)
- `sunflowmon.effectChance: 1.0 → 0.12` (~1 life every 9 seconds)

**File:** `DigimonDatabase.ts` lines ~1593, ~1435

---

## ADDITIONAL FINDINGS (from wave analysis agents)

### Post-boss cliff waves spike too hard

| Wave | HP After Boss | % Jump | Issue |
|------|---------------|--------|-------|
| W51 (after W50 boss) | 9,932 | +99% | Severe |
| W81 (after W80 boss) | 86,600 | +246% | Catastrophic |
| W91 (after W90 boss) | 123,550 | +253% | Catastrophic |

**Recommendation:** Add 1-2 ramp waves after each boss instead of immediate full-strength waves.

### Splitter-only waves create false relief → catastrophic next wave

| Relief Wave | Next Wave | HP Jump |
|-------------|-----------|---------|
| W46 (Mamemon only, 2,222 HP) | W47 | +263% |
| W66 (Diaboromon only, 4,200 HP) | W67 | +547% |

**Recommendation:** Increase enemy count in W46/W66 or reduce W47/W67 to smooth the curve.

### Sell formula punishes Champion+ direct spawns

Selling a freshly-spawned Champion (750 DB cost) returns only 25 DB (minimum). The formula uses flat `baseCost = 50` instead of actual spawn cost, causing 96.7% loss on high-tier spawns. This discourages experimentation and tower repositioning.

**Recommendation:** Consider using actual spawn cost in sell price calculation (tracked on tower creation).

---

## IMPLEMENTATION PRIORITY

### High Priority (game-breaking)
- **#16** Heal 100% proc (infinite lives exploit)
- **#2** UlforceVdramon 128 DPS (3.5x average)
- **#3** Stingmon/Aquilamon/Silphymon/Jewelbeemon (2-3x stage average)

### Medium Priority (frustrating imbalance)
- **#1** Pukamon weakest starter
- **#4** Weak CC starters
- **#5** Burn negligible
- **#7** Armor Break too rare
- **#8** Slow too short
- **#14** Patamon knockback anti-synergy
- **#6** MagnaAngemon execute useless

### Low Priority (quality of life / late-game polish)
- **#9** Waves 81-89 copy-paste
- **#10** Wave 46 single-type
- **#11** Wave 41 HP cliff
- **#12** Champion cost multiplier
- **#13** Early spawn intervals
- **#15** Support Mega DPS
