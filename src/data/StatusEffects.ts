export interface StatusEffectDef {
  id: string;
  name: string;
  category: 'dot' | 'cc' | 'debuff' | 'special' | 'support';
  description: string;
}

export const STATUS_EFFECTS: Record<string, StatusEffectDef> = {
  // Damage Over Time
  burn: { id: 'burn', name: 'Burn', category: 'dot', description: 'Deals fire damage over time' },
  poison: { id: 'poison', name: 'Poison', category: 'dot', description: 'Deals poison damage over time, stacks up to 3x' },
  bleed: { id: 'bleed', name: 'Bleed', category: 'dot', description: 'Deals % HP damage over time, stacks up to 3x' },

  // Crowd Control
  stun: { id: 'stun', name: 'Stun', category: 'cc', description: 'Cannot move or act' },
  freeze: { id: 'freeze', name: 'Freeze', category: 'cc', description: 'Stun + slow after thaw' },
  root: { id: 'root', name: 'Root', category: 'cc', description: 'Cannot move, can still act' },
  slow: { id: 'slow', name: 'Slow', category: 'cc', description: 'Reduced move speed' },
  confuse: { id: 'confuse', name: 'Confuse', category: 'cc', description: 'Random movement direction' },
  fear: { id: 'fear', name: 'Fear', category: 'cc', description: 'Runs backward along path' },
  knockback: { id: 'knockback', name: 'Knockback', category: 'cc', description: 'Pushed back along path' },

  // Debuffs
  armorBreak: { id: 'armorBreak', name: 'Armor Break', category: 'debuff', description: 'Reduces target armor' },
  blind: { id: 'blind', name: 'Blind', category: 'debuff', description: 'Attacks miss' },

  // Special
  execute: { id: 'execute', name: 'Execute', category: 'special', description: 'Instant kill below HP threshold' },
  lifesteal: { id: 'lifesteal', name: 'Lifesteal', category: 'special', description: 'Heals on damage dealt' },
  pierce: { id: 'pierce', name: 'Pierce', category: 'special', description: 'Hits multiple enemies in a line' },
  chain: { id: 'chain', name: 'Chain', category: 'special', description: 'Jumps to nearby enemies' },
  holy: { id: 'holy', name: 'Holy', category: 'special', description: 'Bonus damage vs Virus' },
  crit: { id: 'crit', name: 'Critical', category: 'special', description: 'Chance for multiplied damage' },
  multiHit: { id: 'multiHit', name: 'Multi-Hit', category: 'special', description: 'Multiple projectiles per attack' },

  // Support
  heal: { id: 'heal', name: 'Heal', category: 'support', description: 'Restores player lives' },
  auraDamage: { id: 'auraDamage', name: 'Damage Aura', category: 'support', description: 'Buffs adjacent tower damage' },
  auraSpeed: { id: 'auraSpeed', name: 'Speed Aura', category: 'support', description: 'Buffs adjacent tower attack speed' },
  auraAll: { id: 'auraAll', name: 'All Aura', category: 'support', description: 'Buffs all adjacent tower stats' },
};

// ============================================================================
// Runtime Status Effect Configuration
// ============================================================================

export interface StatusEffectConfig {
  duration: number;      // seconds
  tickInterval?: number; // seconds (for DoTs)
  strength: number;      // effect-specific: damage multiplier, slow %, armor reduction %
  maxStacks?: number;    // max concurrent stacks (default 1)
}

export const STATUS_EFFECT_CONFIGS: Record<string, StatusEffectConfig> = {
  burn: { duration: 3, tickInterval: 0.5, strength: 0.05 },
  poison: { duration: 4, tickInterval: 1, strength: 0.03, maxStacks: 3 },
  slow: { duration: 2, strength: 0.4 },
  freeze: { duration: 1.5, strength: 1.0 },
  stun: { duration: 1, strength: 1.0 },
  armorBreak: { duration: 3, strength: 0.5 },
};

// ============================================================================
// Active Effect Instance (runtime state on an enemy)
// ============================================================================

export interface ActiveEffect {
  id: string;
  remainingDuration: number;
  tickTimer: number;
  strength: number;
  stacks: number;
  sourceDamage: number; // tower's damage for DoT calculations
}

// ============================================================================
// Visual indicator colors for each effect type
// ============================================================================

export const EFFECT_INDICATOR_COLORS: Record<string, number> = {
  burn: 0xff8800,     // orange
  poison: 0xaa00ff,   // purple
  slow: 0x88ccff,     // light blue
  freeze: 0xffffff,   // white
  stun: 0xffff00,     // yellow
  armorBreak: 0x880000, // dark red
};

// ============================================================================
// Pure logic functions (testable without Phaser)
// ============================================================================

/**
 * Extract the base effect type from compound effect names.
 * e.g. 'burn_aoe' -> 'burn', 'slow_pierce' -> 'slow', 'burn' -> 'burn'
 */
export function getBaseEffectType(effectType: string): string | null {
  // Direct match first
  if (STATUS_EFFECT_CONFIGS[effectType]) {
    return effectType;
  }
  // Try the prefix before the first underscore
  const base = effectType.split('_')[0];
  if (STATUS_EFFECT_CONFIGS[base]) {
    return base;
  }
  return null;
}

/**
 * Calculate the speed multiplier from all active effects.
 * freeze and stun stop movement completely (return 0).
 * slow reduces speed by its strength percentage.
 * Returns a multiplier between 0 and 1.
 */
export function getEffectiveSpeedMultiplier(effects: Map<string, ActiveEffect>): number {
  // Freeze and stun completely stop movement
  const freezeEffect = effects.get('freeze');
  if (freezeEffect && freezeEffect.remainingDuration > 0) {
    return 0;
  }

  const stunEffect = effects.get('stun');
  if (stunEffect && stunEffect.remainingDuration > 0) {
    return 0;
  }

  // Check for freeze_thaw (the slow that occurs after freeze ends)
  const thawEffect = effects.get('freeze_thaw');

  // Slow reduces speed - use the strongest slow effect
  const slowEffect = effects.get('slow');
  let slowMultiplier = 1;

  if (slowEffect && slowEffect.remainingDuration > 0) {
    slowMultiplier = 1 - slowEffect.strength;
  }

  if (thawEffect && thawEffect.remainingDuration > 0) {
    const thawMultiplier = 1 - thawEffect.strength;
    slowMultiplier = Math.min(slowMultiplier, thawMultiplier);
  }

  return Math.max(0, slowMultiplier);
}

/**
 * Calculate the armor multiplier from all active effects.
 * armorBreak reduces armor by its strength percentage.
 * Returns a multiplier between 0 and 1.
 */
export function getEffectiveArmorMultiplier(effects: Map<string, ActiveEffect>): number {
  const armorBreakEffect = effects.get('armorBreak');
  if (armorBreakEffect && armorBreakEffect.remainingDuration > 0) {
    return 1 - armorBreakEffect.strength;
  }
  return 1;
}

/**
 * Calculate DoT damage for a single tick.
 * - burn: deals strength% of source tower damage per tick
 * - poison: deals strength% of enemy max HP per tick (per stack)
 * Uses Math.ceil to avoid fractional damage.
 *
 * @param effect - The active effect instance
 * @param config - The effect configuration
 * @param enemyMaxHp - The enemy's maximum HP (needed for poison)
 * @returns The damage to deal this tick
 */
export function calculateDotDamage(
  effect: ActiveEffect,
  config: StatusEffectConfig,
  enemyMaxHp: number = 0,
): number {
  if (!config.tickInterval) return 0;

  if (effect.id === 'burn') {
    // Burn: strength% of tower's damage per tick
    return Math.ceil(effect.sourceDamage * config.strength);
  }

  if (effect.id === 'poison') {
    // Poison: strength% of enemy max HP per tick, multiplied by stacks
    return Math.ceil(enemyMaxHp * config.strength * effect.stacks);
  }

  return 0;
}
