# In-Game Encyclopedia Access + TowerInfoPanel Cleanup

## Context
The TowerInfoPanel currently shows an "Evolutions:" section at the bottom that lists possible evolution paths with sprites, stats, and DP requirements. This makes the panel cluttered and can overflow the panel height. Meanwhile, the Encyclopedia (which already has a comprehensive Digimon browser with evolution chains) is only accessible from the Main Menu — players can't reference it during gameplay.

**Goal**: Remove the evolution preview from TowerInfoPanel and add an Encyclopedia button accessible from in-game, so players can look up evolution paths without leaving their game.

---

## Step 1: Remove Evolution Preview from TowerInfoPanel

**File**: `src/ui/TowerInfoPanel.ts`

Remove:
- `evoPreviewObjects` and `evoPreviewBottomY` fields (lines 216-217)
- `refreshEvolutionPreview()` method (lines 730-835) — delete entire method
- Call to `refreshEvolutionPreview(tower)` in `refresh()` (line 711)
- The dynamic merge button repositioning logic that depends on evoPreviewBottomY (lines 715-721) — simplify to fixed position after sell/digivolve
- Cleanup of evoPreviewObjects in `destroy()` (lines 1157-1158)
- The dynamic panel BG resize logic we just added (lines 724-726)

Simplify merge button positioning in `refresh()`:
```typescript
// Merge button — position after digivolve (if visible) or sell
const mergeY = this.digivolveBtn.visible
  ? this.digivolveBtn.y + 44
  : this.sellBtn.y + 44;
this.mergeBtn.y = mergeY;
```

---

## Step 2: Add Encyclopedia Button to Game HUD

**File**: `src/scenes/GameScene.ts`

Add a small "Encyclopedia" button below the Pause/Settings row in the left HUD panel. Pattern matches existing Pause/Settings buttons.

**Placement**: Below the Pause & Settings buttons row, above the SPEED section. Use the same `smallBtnW`/`smallBtnH` dimensions but full width (spanning both columns).

```
[|| Pause] [⚙ Settings]
[   📖 Encyclopedia   ]    ← NEW
SPEED: [1x] [2x] [3x]
```

**Button dimensions**: ~200px wide × 30px tall, centered, using `COLORS.BG_PANEL_LIGHT` (same as Settings button).

**On click**:
```typescript
this.scene.launch('EncyclopediaScene', { from: 'GameScene' });
this.scene.pause();
```

---

## Step 3: Make EncyclopediaScene Work as Overlay from GameScene

**File**: `src/scenes/EncyclopediaScene.ts`

Add caller tracking (same pattern as SettingsScene):

1. Add `callerScene` field defaulting to `'MainMenuScene'`
2. In `create(data?)`, read `data?.from` to set callerScene
3. Update back button handler (line 838):
   ```typescript
   btn.on('pointerdown', () => {
     if (this.callerScene === 'GameScene') {
       this.scene.resume('GameScene');
       this.scene.stop();
     } else {
       this.scene.start('MainMenuScene');
     }
   });
   ```
4. Update ESC handler (line 128) with same logic
5. Add opaque background fill so the game grid doesn't show through (already has `setBackgroundColor('#0f0a14')`)

---

## Files Changed Summary

| File | Change |
|------|--------|
| `src/ui/TowerInfoPanel.ts` | Remove evolution preview section, simplify merge button positioning |
| `src/scenes/GameScene.ts` | Add Encyclopedia button to HUD |
| `src/scenes/EncyclopediaScene.ts` | Add `callerScene` tracking, adaptive back/ESC navigation |

---

## Verification

1. `npx tsc --noEmit` — zero errors
2. `npx vitest run` — all tests pass
3. Manual checks:
   - TowerInfoPanel no longer shows "Evolutions:" section
   - Merge button positions correctly below Sell/Digivolve
   - Encyclopedia button visible in game HUD
   - Clicking Encyclopedia pauses game and opens Encyclopedia overlay
   - Back button / ESC in Encyclopedia returns to game (resumes)
   - Encyclopedia from Main Menu still works (scene.start to MainMenuScene)


# Fix Broken Pyocomon & Kyokyomon Starter Cards

## Context
Two starter cards (Pyocomon and Kyokyomon) display broken in StarterSelectScene — no visible card background, tiny/faded sprites, and name text floating outside the card boundary. All other 19 starters render correctly. A previous fix attempt added a special scale hack for Kyokyomon (3.5x vs 2.8x) but didn't resolve the underlying issue.

**Root cause**: Both starters render from `atlas_baby2` atlas frames. Despite the atlas JSON having valid frame data and sprite sheet sources existing, these 2 specific frames don't render correctly (likely corrupted pixel data at those atlas coordinates or a Phaser rendering issue). The individual PNG files in `Idle Frame Only/` are confirmed valid.

## Fix: Use Individual PNGs for Starter Card Display

### Step 1: PreloadScene.ts — Always load starter sprites individually
**File**: `src/scenes/PreloadScene.ts`

Add a starter keys set before the sprite loading loop (~line 308), then modify the loading condition to include starters:

```typescript
// Add after line 307 (after sprites object closes):
const starterKeys = new Set([
  'koromon', 'tsunomon', 'tokomon', 'gigimon', 'tanemon',
  'demiveemon', 'pagumon', 'viximon', 'nyaromon', 'gummymon',
  'chocomon', 'pyocomon', 'mochimon', 'pukamon', 'dorimon',
  'sunmon', 'moonmon', 'kyokyomon', 'puroromon', 'budmon', 'caprimon',
]);
```

Change line 320 from:
```typescript
if (!hasAtlasEntry(key)) {
```
to:
```typescript
if (!hasAtlasEntry(key) || starterKeys.has(key)) {
```

No conflicts — individual textures use key `'pyocomon'`, atlas uses key `'atlas_baby2'` + frame `'Pyocomon_0'`.

### Step 2: StarterSelectScene.ts — Use individual textures for cards
**File**: `src/scenes/StarterSelectScene.ts`

1. **Remove line 5** (`import { getStaticFrame } from '@/utils/SpriteAnimHelper';`)

2. **Replace lines 207-213** (sprite creation in `createStarterCard`):

   From:
   ```typescript
   // Sprite (Kyokyomon sprite is very faint/tiny — boost its scale)
   const starterStaticFrame = getStaticFrame(starter.key);
   const sprite = starterStaticFrame
     ? this.add.image(0, -16, starterStaticFrame.atlas, starterStaticFrame.frame)
     : this.add.image(0, -16, starter.key);
   sprite.setScale(starter.key === 'kyokyomon' ? 3.5 : 2.8);
   container.add(sprite);
   ```

   To:
   ```typescript
   // Sprite (use individual texture for consistent card display)
   const sprite = this.add.image(0, -16, starter.key);
   sprite.setScale(2.8);
   container.add(sprite);
   ```

## Verification
1. `npm run dev` — navigate to Starter Select screen
2. Confirm all 21 cards render with visible backgrounds, properly-sized sprites, and names inside cards
3. Specifically verify Pyocomon and Kyokyomon look identical in style to other cards
4. Select Pyocomon → Start Game → verify tower sprite works in GameScene (still uses atlas)
5. Select Kyokyomon → Start Game → same check
6. Run `npm run test` — ensure no test regressions


# Sprint 29: Effect Audit + Starter Card Fix

## Context
Playtesting revealed multiple issues: (A) Pyocomon & Kyokyomon starter cards broken, (B) burn/poison have no visible feedback and may not trigger, (C) `armor_break` NEVER applies due to naming bug, (D) `armor_pierce` not implemented, (E) `holy` effect not implemented, (F) `heal` effect not implemented, (G) no visual armor indicator on enemies.

---

## Fix 1: Broken Pyocomon & Kyokyomon Starter Cards

**Files**: `src/scenes/PreloadScene.ts`, `src/scenes/StarterSelectScene.ts`

**Root cause**: Atlas frames for these 2 starters don't render correctly. Individual PNGs are valid.

### PreloadScene.ts
After the sprites object (~line 308), add a starter keys set and force-load them individually:
```typescript
const starterKeys = new Set([
  'koromon', 'tsunomon', 'tokomon', 'gigimon', 'tanemon',
  'demiveemon', 'pagumon', 'viximon', 'nyaromon', 'gummymon',
  'chocomon', 'pyocomon', 'mochimon', 'pukamon', 'dorimon',
  'sunmon', 'moonmon', 'kyokyomon', 'puroromon', 'budmon', 'caprimon',
]);
```
Change line 320: `if (!hasAtlasEntry(key))` → `if (!hasAtlasEntry(key) || starterKeys.has(key))`

### StarterSelectScene.ts
- Remove `import { getStaticFrame }` (line 5)
- Replace lines 207-213 with:
```typescript
const sprite = this.add.image(0, -16, starter.key);
sprite.setScale(2.8);
container.add(sprite);
```

---

## Fix 2: `armor_break` NEVER Applies (CRITICAL BUG)

**File**: `src/data/StatusEffects.ts` — `getBaseEffectType()` (line 97)

**Root cause**: DigimonDatabase uses `'armor_break'` (underscore), but `STATUS_EFFECT_CONFIGS` uses `armorBreak` (camelCase). `getBaseEffectType('armor_break')` splits by `_`, gets `'armor'`, finds nothing → returns null. Affects **15+ towers**.

### Fix in `getBaseEffectType` (StatusEffects.ts ~line 97):
Add a compound effect mapping before the final `return null`:
```typescript
export function getBaseEffectType(effectType: string): string | null {
  if (STATUS_EFFECT_CONFIGS[effectType]) return effectType;
  const base = effectType.split('_')[0];
  if (STATUS_EFFECT_CONFIGS[base]) return base;
  // Handle multi-word effect types (underscore → camelCase)
  if (effectType.includes('armor_break')) return 'armorBreak';
  return null;
}
```

This makes `getBaseEffectType('armor_break')`, `getBaseEffectType('armor_break_stun')`, `getBaseEffectType('burn_aoe_armor_break')`, and `getBaseEffectType('pierce_armor_break')` all correctly return `'armorBreak'`.

---

## Fix 3: Implement `armor_pierce` (Bypass Armor)

**Files**: `src/data/StatusEffects.ts`, `src/entities/Projectile.ts`, `src/entities/Enemy.ts`

**Root cause**: `armor_pierce` has no runtime config. `getBaseEffectType('armor_pierce')` returns null. 6+ towers affected.

### StatusEffects.ts — extend `getBaseEffectType`:
```typescript
if (effectType.includes('armor_break')) return 'armorBreak';
if (effectType.includes('armor_pierce')) return 'armorPierce';  // NEW
```

This is NOT a status effect (not a debuff applied to enemy). Instead, it's a **projectile property** that ignores armor on hit.

### Projectile.ts — add `ignoresArmor` flag:
Add property: `public ignoresArmor: boolean = false;`
In `hit()` method, pass the flag to `takeDamage`:
```typescript
this.target.takeDamage(this.damage, this.ignoresArmor);
```

### CombatManager.ts — set flag when armor_pierce procs:
After effect roll succeeds (line 174), check if it's armor_pierce:
```typescript
if (baseEffect === 'armorPierce') {
  projectile.ignoresArmor = true;
} else if (baseEffect) {
  projectile.effectType = effectType;
  projectile.sourceDamage = baseDamage;
}
```

### Enemy.ts — respect `ignoresArmor` in `takeDamage`:
```typescript
public takeDamage(amount: number, ignoreArmor: boolean = false): void {
  const effectiveArmor = ignoreArmor ? 0 : this.getEffectiveArmor();
  let actualDamage = amount * (1 - effectiveArmor);
  ...
}
```

---

## Fix 4: Implement `holy` Effect (Bonus Damage to All)

**Files**: `src/data/StatusEffects.ts`, `src/managers/CombatManager.ts`

**Root cause**: 'holy' not in STATUS_EFFECT_CONFIGS → `getBaseEffectType('holy')` returns null. 7+ towers affected.

### StatusEffects.ts — extend `getBaseEffectType`:
```typescript
if (effectType.includes('armor_pierce')) return 'armorPierce';
if (effectType.includes('holy')) return 'holy';  // NEW
```

### CombatManager.ts — apply holy bonus damage in `fireProjectile`:
Holy is NOT a status effect — it's a flat 25% damage bonus. After the effect roll:
```typescript
if (baseEffect === 'armorPierce') {
  projectile.ignoresArmor = true;
} else if (baseEffect === 'holy') {
  projectile.holyBonus = true;  // NEW
} else if (baseEffect) {
  projectile.effectType = effectType;
  projectile.sourceDamage = baseDamage;
}
```

### Projectile.ts — apply holy bonus on hit:
Add property: `public holyBonus: boolean = false;`
In `hit()`:
```typescript
const holyMult = this.holyBonus ? 1.25 : 1.0;
this.target.takeDamage(this.damage * holyMult, this.ignoresArmor);
```

### TowerInfoPanel.ts — update description:
Where holy is displayed (~line 43 modifier, ~line 72 aura), ensure description says "Bonus damage to all enemies (+25%)".

---

## Fix 5: Implement `heal` Effect (Restore Lives)

**Files**: `src/data/StatusEffects.ts`, `src/managers/CombatManager.ts`, `src/scenes/GameScene.ts`

**Root cause**: 'heal' not in STATUS_EFFECT_CONFIGS. 2+ towers affected (Floramon, Plotmon line).

### StatusEffects.ts — extend `getBaseEffectType`:
```typescript
if (effectType.includes('holy')) return 'holy';
if (effectType.includes('heal')) return 'heal';  // NEW
```

### CombatManager.ts — emit heal event on proc:
```typescript
if (baseEffect === 'heal') {
  // Emit event for GameScene to restore 1 life
  EventBus.emit('tower:healed', { amount: 1 });
} else if (baseEffect === 'armorPierce') { ...
```
Import EventBus at top.

### GameScene.ts — listen for heal event:
In `create()`: `EventBus.on('tower:healed', this.onTowerHeal, this);`
In `shutdown()`: `EventBus.off('tower:healed', this.onTowerHeal, this);`
Handler:
```typescript
private onTowerHeal(data: { amount: number }): void {
  this.gameState.addLives(data.amount);
  // Show floating "+1 Life" text at some position
}
```

### GameStateManager — add `addLives` method if it doesn't exist.

### TowerInfoPanel.ts — update heal description:
Ensure it shows "Restores 1 player life on hit" with the proc chance.

---

## Fix 6: Armor Bar Visual

**File**: `src/entities/Enemy.ts`

**Goal**: Show a separate gray/silver bar below the HP bar for enemies with armor > 0. When armor break is active, show the reduced portion in red.

### Enemy.ts changes:
Add new Graphics objects: `armorBarBg`, `armorBarFill`
Add constant: `ARMOR_BAR_Y = HEALTH_BAR_Y + HEALTH_BAR_HEIGHT + 1` (just below HP bar)
Armor bar height: 2px (thinner than HP bar's 4px)

In constructor (where healthBarBg/Fill are created):
```typescript
if (this.armor > 0) {
  this.armorBarBg = this.scene.add.graphics();
  this.armorBarFill = this.scene.add.graphics();
  this.add(this.armorBarBg);
  this.add(this.armorBarFill);
  this.drawArmorBar();
}
```

New method `drawArmorBar()`:
```typescript
private drawArmorBar(): void {
  if (!this.armorBarBg || !this.armorBarFill) return;
  const y = Enemy.HEALTH_BAR_Y + Enemy.HEALTH_BAR_HEIGHT + 1;
  // Background (full armor)
  this.armorBarBg.clear();
  this.armorBarBg.fillStyle(0x555555, 0.6);
  this.armorBarBg.fillRect(-Enemy.HEALTH_BAR_WIDTH / 2, y, Enemy.HEALTH_BAR_WIDTH, 2);
  // Fill (effective armor)
  this.armorBarFill.clear();
  const effectiveRatio = this.getEffectiveArmor() / this.armor;
  const color = effectiveRatio < 1 ? 0xff4444 : 0xaaaaaa; // red if debuffed, silver normally
  this.armorBarFill.fillStyle(color, 0.8);
  this.armorBarFill.fillRect(-Enemy.HEALTH_BAR_WIDTH / 2, y, Enemy.HEALTH_BAR_WIDTH * effectiveRatio, 2);
}
```

Call `drawArmorBar()` whenever armor break is applied/removed (in `updateEffects` after processing armorBreak).

Apply same visibility logic as HP bar via `applyHealthBarVisibility`.

---

## Fix 7: DoT Visual Feedback (Floating Numbers for Burn/Poison)

**Files**: `src/entities/Enemy.ts`, `src/scenes/GameScene.ts`

**Goal**: When burn/poison deals damage, show floating damage numbers in the DoT color (orange for burn, purple for poison).

### Enemy.ts — emit event on DoT tick:
In `updateEffects()`, after `takeDamageRaw(dotDamage)` (line 718), emit a damage event:
```typescript
if (dotDamage > 0) {
  this.takeDamageRaw(dotDamage);
  EventBus.emit(GameEvents.DAMAGE_DEALT, {
    x: this.x, y: this.y,
    damage: dotDamage,
    multiplier: 1.0,
    dotType: effect.id,  // 'burn' or 'poison'
  });
  if (!this.isAlive) return;
}
```

### GameScene.ts — color DoT numbers differently:
Update `onDamageDealt` and `showDamageNumber` to accept an optional `dotType`:
```typescript
private onDamageDealt(data: { ...; dotType?: string }): void {
  ...
  this.showDamageNumber(worldX, worldY, data.damage, data.multiplier, data.dotType);
}

private showDamageNumber(x, y, damage, multiplier, dotType?: string): void {
  ...
  // DoT colors override attribute-based colors
  if (dotType === 'burn') color = '#ff8800';  // orange
  else if (dotType === 'poison') color = '#aa00ff';  // purple
  ...
}
```

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `src/scenes/PreloadScene.ts` | Add starterKeys set, force-load starters individually |
| `src/scenes/StarterSelectScene.ts` | Use individual textures, remove atlas lookup |
| `src/data/StatusEffects.ts` | Fix `getBaseEffectType` for armor_break, armor_pierce, holy, heal |
| `src/entities/Projectile.ts` | Add `ignoresArmor`, `holyBonus` flags, pass to takeDamage |
| `src/entities/Enemy.ts` | Add armor bar, takeDamage ignoreArmor param, DoT damage events |
| `src/managers/CombatManager.ts` | Handle holy/heal/armorPierce as projectile properties, import EventBus |
| `src/scenes/GameScene.ts` | Handle heal event, DoT colored damage numbers |
| `src/ui/TowerInfoPanel.ts` | Update descriptions for holy, heal |

## Verification
1. `npm run dev` → Starter Select: all 21 cards render correctly (Pyocomon/Kyokyomon fixed)
2. Place an armor_break tower (e.g., Gabumon line) → attack armored enemy → confirm armor bar turns red and damage increases
3. Place an armor_pierce tower (e.g., Tentomon line) → attack armored enemy → confirm full damage dealt
4. Place a burn tower (e.g., Agumon line) → confirm orange floating numbers appear over time
5. Place a poison tower (e.g., Palmon line) → confirm purple floating numbers appear
6. Place a holy tower (e.g., Angemon) → confirm bonus damage on all targets
7. Place Floramon (heal) → confirm "+1 Life" feedback when heal procs
8. Check enemies with armor show gray bar below HP bar
9. `npm run test` → ensure all existing tests pass
