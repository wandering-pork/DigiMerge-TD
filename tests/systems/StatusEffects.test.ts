import { describe, it, expect } from 'vitest';
import {
  ActiveEffect,
  StatusEffectConfig,
  STATUS_EFFECT_CONFIGS,
  getBaseEffectType,
  getEffectiveSpeedMultiplier,
  getEffectiveArmorMultiplier,
  calculateDotDamage,
} from '@/data/StatusEffects';

// ---------------------------------------------------------------------------
// Helper: create an ActiveEffect with sensible defaults
// ---------------------------------------------------------------------------

function createEffect(overrides: Partial<ActiveEffect> & { id: string }): ActiveEffect {
  return {
    remainingDuration: 3,
    tickTimer: 0,
    strength: STATUS_EFFECT_CONFIGS[overrides.id]?.strength ?? 0,
    stacks: 1,
    sourceDamage: 100,
    ...overrides,
  };
}

// ===========================================================================
// getBaseEffectType
// ===========================================================================

describe('getBaseEffectType', () => {
  it('returns direct match for known effects', () => {
    expect(getBaseEffectType('burn')).toBe('burn');
    expect(getBaseEffectType('poison')).toBe('poison');
    expect(getBaseEffectType('slow')).toBe('slow');
    expect(getBaseEffectType('freeze')).toBe('freeze');
    expect(getBaseEffectType('stun')).toBe('stun');
    expect(getBaseEffectType('armorBreak')).toBe('armorBreak');
  });

  it('extracts base type from compound effect names', () => {
    expect(getBaseEffectType('burn_aoe')).toBe('burn');
    expect(getBaseEffectType('slow_pierce')).toBe('slow');
    expect(getBaseEffectType('burn_multihit')).toBe('burn');
    expect(getBaseEffectType('burn_aoe_kb')).toBe('burn');
  });

  it('returns null for unknown effect types', () => {
    expect(getBaseEffectType('crit')).toBeNull();
    expect(getBaseEffectType('holy')).toBeNull();
    expect(getBaseEffectType('lifesteal')).toBeNull();
    expect(getBaseEffectType('chain')).toBeNull();
    expect(getBaseEffectType('multiHit')).toBeNull();
  });
});

// ===========================================================================
// getEffectiveSpeedMultiplier
// ===========================================================================

describe('getEffectiveSpeedMultiplier', () => {
  it('returns 1 when no effects are active', () => {
    const effects = new Map<string, ActiveEffect>();
    expect(getEffectiveSpeedMultiplier(effects)).toBe(1);
  });

  it('returns 0 when frozen', () => {
    const effects = new Map<string, ActiveEffect>();
    effects.set('freeze', createEffect({ id: 'freeze', remainingDuration: 1.5 }));
    expect(getEffectiveSpeedMultiplier(effects)).toBe(0);
  });

  it('returns 0 when stunned', () => {
    const effects = new Map<string, ActiveEffect>();
    effects.set('stun', createEffect({ id: 'stun', remainingDuration: 1 }));
    expect(getEffectiveSpeedMultiplier(effects)).toBe(0);
  });

  it('reduces speed by 40% when slowed (strength 0.4)', () => {
    const effects = new Map<string, ActiveEffect>();
    effects.set('slow', createEffect({ id: 'slow', strength: 0.4, remainingDuration: 2 }));
    expect(getEffectiveSpeedMultiplier(effects)).toBeCloseTo(0.6);
  });

  it('freeze takes priority over slow (returns 0)', () => {
    const effects = new Map<string, ActiveEffect>();
    effects.set('freeze', createEffect({ id: 'freeze', remainingDuration: 1 }));
    effects.set('slow', createEffect({ id: 'slow', strength: 0.4, remainingDuration: 2 }));
    expect(getEffectiveSpeedMultiplier(effects)).toBe(0);
  });

  it('stun takes priority over slow (returns 0)', () => {
    const effects = new Map<string, ActiveEffect>();
    effects.set('stun', createEffect({ id: 'stun', remainingDuration: 0.5 }));
    effects.set('slow', createEffect({ id: 'slow', strength: 0.4, remainingDuration: 2 }));
    expect(getEffectiveSpeedMultiplier(effects)).toBe(0);
  });

  it('applies freeze_thaw slow after freeze expires', () => {
    const effects = new Map<string, ActiveEffect>();
    // Freeze has expired but thaw slow is active
    effects.set('freeze_thaw', createEffect({ id: 'freeze_thaw', strength: 0.4, remainingDuration: 1 }));
    expect(getEffectiveSpeedMultiplier(effects)).toBeCloseTo(0.6);
  });

  it('uses the strongest slow between slow and freeze_thaw', () => {
    const effects = new Map<string, ActiveEffect>();
    effects.set('slow', createEffect({ id: 'slow', strength: 0.4, remainingDuration: 2 }));
    effects.set('freeze_thaw', createEffect({ id: 'freeze_thaw', strength: 0.3, remainingDuration: 1 }));
    // slow is stronger (0.4 > 0.3), so 1 - 0.4 = 0.6
    expect(getEffectiveSpeedMultiplier(effects)).toBeCloseTo(0.6);
  });

  it('ignores expired effects (remainingDuration = 0)', () => {
    const effects = new Map<string, ActiveEffect>();
    effects.set('freeze', createEffect({ id: 'freeze', remainingDuration: 0 }));
    expect(getEffectiveSpeedMultiplier(effects)).toBe(1);
  });

  it('ignores effects with negative remainingDuration', () => {
    const effects = new Map<string, ActiveEffect>();
    effects.set('stun', createEffect({ id: 'stun', remainingDuration: -0.5 }));
    expect(getEffectiveSpeedMultiplier(effects)).toBe(1);
  });

  it('never returns below 0', () => {
    const effects = new Map<string, ActiveEffect>();
    effects.set('slow', createEffect({ id: 'slow', strength: 1.5, remainingDuration: 2 }));
    expect(getEffectiveSpeedMultiplier(effects)).toBe(0);
  });
});

// ===========================================================================
// getEffectiveArmorMultiplier
// ===========================================================================

describe('getEffectiveArmorMultiplier', () => {
  it('returns 1 when no effects are active', () => {
    const effects = new Map<string, ActiveEffect>();
    expect(getEffectiveArmorMultiplier(effects)).toBe(1);
  });

  it('reduces armor by 50% with armorBreak (strength 0.5)', () => {
    const effects = new Map<string, ActiveEffect>();
    effects.set('armorBreak', createEffect({ id: 'armorBreak', strength: 0.5, remainingDuration: 3 }));
    expect(getEffectiveArmorMultiplier(effects)).toBeCloseTo(0.5);
  });

  it('ignores expired armorBreak', () => {
    const effects = new Map<string, ActiveEffect>();
    effects.set('armorBreak', createEffect({ id: 'armorBreak', strength: 0.5, remainingDuration: 0 }));
    expect(getEffectiveArmorMultiplier(effects)).toBe(1);
  });

  it('returns 1 when only non-armor effects are active', () => {
    const effects = new Map<string, ActiveEffect>();
    effects.set('burn', createEffect({ id: 'burn', remainingDuration: 3 }));
    effects.set('slow', createEffect({ id: 'slow', remainingDuration: 2 }));
    expect(getEffectiveArmorMultiplier(effects)).toBe(1);
  });
});

// ===========================================================================
// calculateDotDamage
// ===========================================================================

describe('calculateDotDamage', () => {
  describe('burn', () => {
    it('deals 5% of source damage per tick', () => {
      const effect = createEffect({ id: 'burn', sourceDamage: 100 });
      const config = STATUS_EFFECT_CONFIGS['burn'];
      // 100 * 0.05 = 5, ceil(5) = 5
      expect(calculateDotDamage(effect, config)).toBe(5);
    });

    it('rounds up fractional damage with Math.ceil', () => {
      const effect = createEffect({ id: 'burn', sourceDamage: 33 });
      const config = STATUS_EFFECT_CONFIGS['burn'];
      // 33 * 0.05 = 1.65, ceil(1.65) = 2
      expect(calculateDotDamage(effect, config)).toBe(2);
    });

    it('deals minimum 1 damage even with very low source damage', () => {
      const effect = createEffect({ id: 'burn', sourceDamage: 1 });
      const config = STATUS_EFFECT_CONFIGS['burn'];
      // 1 * 0.05 = 0.05, ceil(0.05) = 1
      expect(calculateDotDamage(effect, config)).toBe(1);
    });

    it('stacks do not affect burn damage', () => {
      const effect = createEffect({ id: 'burn', sourceDamage: 100, stacks: 3 });
      const config = STATUS_EFFECT_CONFIGS['burn'];
      // Burn does not stack; damage is always 100 * 0.05 = 5
      expect(calculateDotDamage(effect, config)).toBe(5);
    });
  });

  describe('poison', () => {
    it('deals 3% of enemy max HP per tick per stack', () => {
      const effect = createEffect({ id: 'poison', stacks: 1 });
      const config = STATUS_EFFECT_CONFIGS['poison'];
      const enemyMaxHp = 500;
      // 500 * 0.03 * 1 = 15
      expect(calculateDotDamage(effect, config, enemyMaxHp)).toBe(15);
    });

    it('scales damage with stacks', () => {
      const effect = createEffect({ id: 'poison', stacks: 3 });
      const config = STATUS_EFFECT_CONFIGS['poison'];
      const enemyMaxHp = 500;
      // 500 * 0.03 * 3 = 45
      expect(calculateDotDamage(effect, config, enemyMaxHp)).toBe(45);
    });

    it('rounds up fractional damage', () => {
      const effect = createEffect({ id: 'poison', stacks: 1 });
      const config = STATUS_EFFECT_CONFIGS['poison'];
      const enemyMaxHp = 100;
      // 100 * 0.03 * 1 = 3
      expect(calculateDotDamage(effect, config, enemyMaxHp)).toBe(3);
    });

    it('deals minimum 1 damage with low max HP', () => {
      const effect = createEffect({ id: 'poison', stacks: 1 });
      const config = STATUS_EFFECT_CONFIGS['poison'];
      const enemyMaxHp = 10;
      // 10 * 0.03 * 1 = 0.3, ceil(0.3) = 1
      expect(calculateDotDamage(effect, config, enemyMaxHp)).toBe(1);
    });
  });

  describe('non-dot effects', () => {
    it('returns 0 for slow (no tickInterval)', () => {
      const effect = createEffect({ id: 'slow' });
      const config = STATUS_EFFECT_CONFIGS['slow'];
      expect(calculateDotDamage(effect, config)).toBe(0);
    });

    it('returns 0 for freeze (no tickInterval)', () => {
      const effect = createEffect({ id: 'freeze' });
      const config = STATUS_EFFECT_CONFIGS['freeze'];
      expect(calculateDotDamage(effect, config)).toBe(0);
    });

    it('returns 0 for stun (no tickInterval)', () => {
      const effect = createEffect({ id: 'stun' });
      const config = STATUS_EFFECT_CONFIGS['stun'];
      expect(calculateDotDamage(effect, config)).toBe(0);
    });

    it('returns 0 for armorBreak (no tickInterval)', () => {
      const effect = createEffect({ id: 'armorBreak' });
      const config = STATUS_EFFECT_CONFIGS['armorBreak'];
      expect(calculateDotDamage(effect, config)).toBe(0);
    });
  });
});

// ===========================================================================
// STATUS_EFFECT_CONFIGS validation
// ===========================================================================

describe('STATUS_EFFECT_CONFIGS', () => {
  it('has config for all core MVP effects', () => {
    const coreEffects = ['burn', 'poison', 'slow', 'freeze', 'stun', 'armorBreak'];
    for (const id of coreEffects) {
      expect(STATUS_EFFECT_CONFIGS[id]).toBeDefined();
    }
  });

  it('burn has correct configuration', () => {
    const config = STATUS_EFFECT_CONFIGS['burn'];
    expect(config.duration).toBe(3);
    expect(config.tickInterval).toBe(0.5);
    expect(config.strength).toBe(0.05);
    expect(config.maxStacks).toBeUndefined();
  });

  it('poison has correct configuration with stacking', () => {
    const config = STATUS_EFFECT_CONFIGS['poison'];
    expect(config.duration).toBe(4);
    expect(config.tickInterval).toBe(1);
    expect(config.strength).toBe(0.03);
    expect(config.maxStacks).toBe(3);
  });

  it('slow has correct configuration', () => {
    const config = STATUS_EFFECT_CONFIGS['slow'];
    expect(config.duration).toBe(2);
    expect(config.strength).toBe(0.4);
    expect(config.tickInterval).toBeUndefined();
  });

  it('freeze has correct configuration', () => {
    const config = STATUS_EFFECT_CONFIGS['freeze'];
    expect(config.duration).toBe(1.5);
    expect(config.strength).toBe(1.0);
    expect(config.tickInterval).toBeUndefined();
  });

  it('stun has correct configuration', () => {
    const config = STATUS_EFFECT_CONFIGS['stun'];
    expect(config.duration).toBe(1);
    expect(config.strength).toBe(1.0);
    expect(config.tickInterval).toBeUndefined();
  });

  it('armorBreak has correct configuration', () => {
    const config = STATUS_EFFECT_CONFIGS['armorBreak'];
    expect(config.duration).toBe(3);
    expect(config.strength).toBe(0.5);
    expect(config.tickInterval).toBeUndefined();
  });
});

// ===========================================================================
// Effect application / stacking / refresh logic
// (testing the pure logic that Enemy.applyEffect will use)
// ===========================================================================

describe('Effect application logic', () => {
  /**
   * Simulate applyEffect logic as a pure function for testing.
   * This mirrors what Enemy.applyEffect does without Phaser dependencies.
   */
  function applyEffect(
    effects: Map<string, ActiveEffect>,
    effectId: string,
    sourceDamage: number,
  ): void {
    const config = STATUS_EFFECT_CONFIGS[effectId];
    if (!config) return;

    const existing = effects.get(effectId);
    if (existing) {
      // Refresh duration
      existing.remainingDuration = config.duration;
      // Update source damage if higher
      existing.sourceDamage = Math.max(existing.sourceDamage, sourceDamage);
      // Stack if applicable
      const maxStacks = config.maxStacks ?? 1;
      if (existing.stacks < maxStacks) {
        existing.stacks++;
      }
    } else {
      effects.set(effectId, {
        id: effectId,
        remainingDuration: config.duration,
        tickTimer: 0,
        strength: config.strength,
        stacks: 1,
        sourceDamage,
      });
    }
  }

  describe('new effect application', () => {
    it('adds a new burn effect with correct properties', () => {
      const effects = new Map<string, ActiveEffect>();
      applyEffect(effects, 'burn', 100);

      expect(effects.has('burn')).toBe(true);
      const burn = effects.get('burn')!;
      expect(burn.id).toBe('burn');
      expect(burn.remainingDuration).toBe(3);
      expect(burn.strength).toBe(0.05);
      expect(burn.stacks).toBe(1);
      expect(burn.sourceDamage).toBe(100);
      expect(burn.tickTimer).toBe(0);
    });

    it('adds a new slow effect', () => {
      const effects = new Map<string, ActiveEffect>();
      applyEffect(effects, 'slow', 50);

      const slow = effects.get('slow')!;
      expect(slow.remainingDuration).toBe(2);
      expect(slow.strength).toBe(0.4);
    });

    it('does not add unknown effects', () => {
      const effects = new Map<string, ActiveEffect>();
      applyEffect(effects, 'unknownEffect', 100);
      expect(effects.size).toBe(0);
    });
  });

  describe('effect refresh', () => {
    it('refreshes duration when re-applying same effect', () => {
      const effects = new Map<string, ActiveEffect>();
      applyEffect(effects, 'burn', 100);

      // Simulate time passing
      effects.get('burn')!.remainingDuration = 0.5;

      // Re-apply
      applyEffect(effects, 'burn', 100);

      expect(effects.get('burn')!.remainingDuration).toBe(3); // Refreshed to full
    });

    it('updates source damage if new source is stronger', () => {
      const effects = new Map<string, ActiveEffect>();
      applyEffect(effects, 'burn', 50);
      applyEffect(effects, 'burn', 100);

      expect(effects.get('burn')!.sourceDamage).toBe(100);
    });

    it('keeps higher source damage when re-applying with weaker source', () => {
      const effects = new Map<string, ActiveEffect>();
      applyEffect(effects, 'burn', 100);
      applyEffect(effects, 'burn', 50);

      expect(effects.get('burn')!.sourceDamage).toBe(100);
    });
  });

  describe('effect stacking (poison)', () => {
    it('stacks poison up to max 3', () => {
      const effects = new Map<string, ActiveEffect>();
      applyEffect(effects, 'poison', 100);
      expect(effects.get('poison')!.stacks).toBe(1);

      applyEffect(effects, 'poison', 100);
      expect(effects.get('poison')!.stacks).toBe(2);

      applyEffect(effects, 'poison', 100);
      expect(effects.get('poison')!.stacks).toBe(3);
    });

    it('does not exceed max stacks', () => {
      const effects = new Map<string, ActiveEffect>();
      applyEffect(effects, 'poison', 100);
      applyEffect(effects, 'poison', 100);
      applyEffect(effects, 'poison', 100);
      applyEffect(effects, 'poison', 100); // 4th application

      expect(effects.get('poison')!.stacks).toBe(3); // Still 3
    });

    it('refreshes duration when stacking', () => {
      const effects = new Map<string, ActiveEffect>();
      applyEffect(effects, 'poison', 100);
      effects.get('poison')!.remainingDuration = 1;

      applyEffect(effects, 'poison', 100);
      expect(effects.get('poison')!.remainingDuration).toBe(4); // Refreshed to full
    });
  });

  describe('non-stackable effects', () => {
    it('burn does not stack (maxStacks is undefined, defaults to 1)', () => {
      const effects = new Map<string, ActiveEffect>();
      applyEffect(effects, 'burn', 100);
      applyEffect(effects, 'burn', 100);
      applyEffect(effects, 'burn', 100);

      expect(effects.get('burn')!.stacks).toBe(1);
    });

    it('slow does not stack', () => {
      const effects = new Map<string, ActiveEffect>();
      applyEffect(effects, 'slow', 100);
      applyEffect(effects, 'slow', 100);

      expect(effects.get('slow')!.stacks).toBe(1);
    });
  });
});

// ===========================================================================
// Effect expiry logic
// ===========================================================================

describe('Effect expiry logic', () => {
  /**
   * Simulate updateEffects tick processing as a pure function for testing.
   */
  function tickEffects(
    effects: Map<string, ActiveEffect>,
    deltaSec: number,
    enemyMaxHp: number = 100,
  ): number {
    let totalDamage = 0;
    const toRemove: string[] = [];
    const toAdd: [string, ActiveEffect][] = [];

    for (const [key, effect] of effects) {
      effect.remainingDuration -= deltaSec;

      // Process DoT ticks
      const config = STATUS_EFFECT_CONFIGS[effect.id];
      if (config && config.tickInterval) {
        effect.tickTimer += deltaSec;
        while (effect.tickTimer >= config.tickInterval) {
          effect.tickTimer -= config.tickInterval;
          totalDamage += calculateDotDamage(effect, config, enemyMaxHp);
        }
      }

      // Mark expired effects for removal
      if (effect.remainingDuration <= 0) {
        // If freeze expired, queue thaw slow
        if (effect.id === 'freeze') {
          toAdd.push(['freeze_thaw', {
            id: 'freeze_thaw',
            remainingDuration: 1,
            tickTimer: 0,
            strength: 0.4,
            stacks: 1,
            sourceDamage: 0,
          }]);
        }
        toRemove.push(key);
      }
    }

    // Apply deferred removals and additions
    for (const key of toRemove) {
      effects.delete(key);
    }
    for (const [key, effect] of toAdd) {
      effects.set(key, effect);
    }

    return totalDamage;
  }

  it('removes effect when duration expires', () => {
    const effects = new Map<string, ActiveEffect>();
    effects.set('stun', createEffect({ id: 'stun', remainingDuration: 1 }));

    tickEffects(effects, 1.0);

    expect(effects.has('stun')).toBe(false);
  });

  it('keeps effect alive when duration has not expired', () => {
    const effects = new Map<string, ActiveEffect>();
    effects.set('slow', createEffect({ id: 'slow', remainingDuration: 2 }));

    tickEffects(effects, 0.5);

    expect(effects.has('slow')).toBe(true);
    expect(effects.get('slow')!.remainingDuration).toBeCloseTo(1.5);
  });

  it('processes burn ticks and returns damage', () => {
    const effects = new Map<string, ActiveEffect>();
    effects.set('burn', createEffect({
      id: 'burn',
      remainingDuration: 3,
      sourceDamage: 100,
      strength: 0.05,
    }));
    effects.get('burn')!.tickTimer = 0;

    // Tick for 0.5s -> should trigger one burn tick
    const damage = tickEffects(effects, 0.5);
    // 100 * 0.05 = 5
    expect(damage).toBe(5);
  });

  it('processes multiple burn ticks in a large delta', () => {
    const effects = new Map<string, ActiveEffect>();
    effects.set('burn', createEffect({
      id: 'burn',
      remainingDuration: 3,
      sourceDamage: 100,
      strength: 0.05,
    }));
    effects.get('burn')!.tickTimer = 0;

    // Tick for 1.0s -> should trigger two burn ticks (at 0.5 interval)
    const damage = tickEffects(effects, 1.0);
    expect(damage).toBe(10); // 5 * 2
  });

  it('processes poison ticks with stacking', () => {
    const effects = new Map<string, ActiveEffect>();
    effects.set('poison', createEffect({
      id: 'poison',
      remainingDuration: 4,
      stacks: 2,
      strength: 0.03,
    }));
    effects.get('poison')!.tickTimer = 0;

    const enemyMaxHp = 500;
    // Tick for 1.0s -> one poison tick at 1s interval
    const damage = tickEffects(effects, 1.0, enemyMaxHp);
    // 500 * 0.03 * 2 = 30
    expect(damage).toBe(30);
  });

  it('freeze creates thaw slow when it expires', () => {
    const effects = new Map<string, ActiveEffect>();
    effects.set('freeze', createEffect({ id: 'freeze', remainingDuration: 1.5 }));

    // Tick past the freeze duration
    tickEffects(effects, 1.5);

    expect(effects.has('freeze')).toBe(false);
    expect(effects.has('freeze_thaw')).toBe(true);
    expect(effects.get('freeze_thaw')!.remainingDuration).toBe(1);
    expect(effects.get('freeze_thaw')!.strength).toBe(0.4);
  });

  it('thaw slow expires normally after its duration', () => {
    const effects = new Map<string, ActiveEffect>();
    effects.set('freeze_thaw', {
      id: 'freeze_thaw',
      remainingDuration: 1,
      tickTimer: 0,
      strength: 0.4,
      stacks: 1,
      sourceDamage: 0,
    });

    tickEffects(effects, 1.0);

    expect(effects.has('freeze_thaw')).toBe(false);
  });

  it('returns 0 damage for CC/debuff effects', () => {
    const effects = new Map<string, ActiveEffect>();
    effects.set('slow', createEffect({ id: 'slow', remainingDuration: 2 }));
    effects.set('armorBreak', createEffect({ id: 'armorBreak', remainingDuration: 3 }));

    const damage = tickEffects(effects, 0.5);
    expect(damage).toBe(0);
  });
});
