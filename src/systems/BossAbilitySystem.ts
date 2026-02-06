import { BossAbility } from '@/types';

// =============================================================================
// Boss Ability Definitions
// =============================================================================

/**
 * Nova Blast — Greymon (Wave 10)
 * Stuns the nearest tower for 2s. Cooldown: 8s.
 */
export const ABILITY_NOVA_BLAST: BossAbility = {
  id: 'nova_blast',
  name: 'Nova Blast',
  description: 'Stuns the nearest tower for 2s',
  trigger: 'cooldown',
  cooldown: 8,
  params: { stunDuration: 2 },
};

/**
 * Mega Flame — Greymon Evolved (Wave 20)
 * Speeds up all nearby enemies by 30% for 3s. Cooldown: 10s.
 */
export const ABILITY_MEGA_FLAME: BossAbility = {
  id: 'mega_flame',
  name: 'Mega Flame',
  description: 'Speeds up nearby enemies by 30% for 3s',
  trigger: 'cooldown',
  cooldown: 10,
  duration: 3,
  params: { speedBoost: 0.3, range: 200 },
};

/**
 * Death Claw — Devimon (Wave 30)
 * Drains 5 DigiBytes per second while alive. Passive.
 */
export const ABILITY_DEATH_CLAW: BossAbility = {
  id: 'death_claw',
  name: 'Death Claw',
  description: 'Drains 5 DB/sec while alive',
  trigger: 'passive',
  params: { drainPerSec: 5 },
};

/**
 * Crimson Lightning — Myotismon (Wave 40)
 * Heals self for 10% max HP every 12s. Cooldown: 12s.
 */
export const ABILITY_CRIMSON_LIGHTNING: BossAbility = {
  id: 'crimson_lightning',
  name: 'Crimson Lightning',
  description: 'Heals self for 10% max HP every 12s',
  trigger: 'cooldown',
  cooldown: 12,
  params: { healPercent: 0.1 },
};

/**
 * Ground Zero — SkullGreymon (Wave 50)
 * At 50% HP, destroys all active projectiles. One-time trigger.
 */
export const ABILITY_GROUND_ZERO: BossAbility = {
  id: 'ground_zero',
  name: 'Ground Zero',
  description: 'At 50% HP, destroys all projectiles',
  trigger: 'hp_threshold',
  hpThreshold: 0.5,
  params: {},
};

/**
 * Venom Infuse — VenomMyotismon (Wave 60)
 * Spawns 3 swarm minions every 15s. Cooldown: 15s.
 */
export const ABILITY_VENOM_INFUSE: BossAbility = {
  id: 'venom_infuse',
  name: 'Venom Infuse',
  description: 'Spawns 3 swarm minions every 15s',
  trigger: 'cooldown',
  cooldown: 15,
  params: { minionCount: 3 },
};

/**
 * Infinity Cannon — Machinedramon (Wave 70)
 * Reduces all tower ranges by 20% while alive. Passive aura.
 */
export const ABILITY_INFINITY_CANNON: BossAbility = {
  id: 'infinity_cannon',
  name: 'Infinity Cannon',
  description: 'Reduces all tower ranges by 20%',
  trigger: 'passive',
  params: { rangeReduction: 0.2 },
};

/**
 * Transcendent Sword — Omegamon (Wave 80)
 * Grants self 50% damage reduction for 4s every 20s.
 */
export const ABILITY_TRANSCENDENT_SWORD: BossAbility = {
  id: 'transcendent_sword',
  name: 'Transcendent Sword',
  description: 'Gains 50% damage shield for 4s',
  trigger: 'cooldown',
  cooldown: 20,
  duration: 4,
  params: { damageReduction: 0.5 },
};

/**
 * Garuru Cannon — Omegamon Zwart (Wave 90)
 * Freezes the 3 highest-DPS towers for 3s every 15s.
 */
export const ABILITY_GARURU_CANNON: BossAbility = {
  id: 'garuru_cannon',
  name: 'Garuru Cannon',
  description: 'Freezes top 3 DPS towers for 3s',
  trigger: 'cooldown',
  cooldown: 15,
  params: { towerCount: 3, stunDuration: 3 },
};

/**
 * Total Annihilation — Apocalymon (Wave 100)
 * At 25% HP, stuns all towers for 2s. One-time trigger.
 */
export const ABILITY_TOTAL_ANNIHILATION: BossAbility = {
  id: 'total_annihilation',
  name: 'Total Annihilation',
  description: 'At 25% HP, stuns all towers for 2s',
  trigger: 'hp_threshold',
  hpThreshold: 0.25,
  params: { stunDuration: 2 },
};

// All boss abilities keyed by ability ID
export const BOSS_ABILITIES: Record<string, BossAbility> = {
  nova_blast: ABILITY_NOVA_BLAST,
  mega_flame: ABILITY_MEGA_FLAME,
  death_claw: ABILITY_DEATH_CLAW,
  crimson_lightning: ABILITY_CRIMSON_LIGHTNING,
  ground_zero: ABILITY_GROUND_ZERO,
  venom_infuse: ABILITY_VENOM_INFUSE,
  infinity_cannon: ABILITY_INFINITY_CANNON,
  transcendent_sword: ABILITY_TRANSCENDENT_SWORD,
  garuru_cannon: ABILITY_GARURU_CANNON,
  total_annihilation: ABILITY_TOTAL_ANNIHILATION,
};

// =============================================================================
// Boss Ability Runtime State
// =============================================================================

export interface BossAbilityState {
  ability: BossAbility;
  cooldownTimer: number;   // seconds remaining until next activation
  hasTriggered: boolean;   // for hp_threshold: whether it already fired
  isEffectActive: boolean; // for timed effects (transcendent_sword, mega_flame)
  effectTimer: number;     // seconds remaining on active effect
  passiveAccumulator: number; // for passive drain (accumulates fractional DB)
}

/**
 * Create the initial runtime state for a boss ability.
 */
export function createBossAbilityState(ability: BossAbility): BossAbilityState {
  return {
    ability,
    cooldownTimer: ability.cooldown ?? 0,
    hasTriggered: false,
    isEffectActive: false,
    effectTimer: 0,
    passiveAccumulator: 0,
  };
}

// =============================================================================
// Boss Ability Logic (pure functions)
// =============================================================================

export interface BossAbilityAction {
  type: 'stun_tower' | 'speed_boost' | 'drain_db' | 'heal_self'
    | 'destroy_projectiles' | 'spawn_minions' | 'range_reduction'
    | 'damage_shield' | 'stun_top_towers' | 'stun_all_towers';
  params: Record<string, number>;
}

/**
 * Tick the boss ability state and return any actions that should be executed.
 * Pure function: mutates `state` in place and returns action descriptors.
 */
export function tickBossAbility(
  state: BossAbilityState,
  deltaSec: number,
  currentHpPercent: number,
  bossMaxHp: number,
): BossAbilityAction[] {
  const actions: BossAbilityAction[] = [];
  const { ability } = state;

  // --- Timed effect expiry ---
  if (state.isEffectActive) {
    state.effectTimer -= deltaSec;
    if (state.effectTimer <= 0) {
      state.isEffectActive = false;
      state.effectTimer = 0;
    }
  }

  // --- Trigger logic ---
  switch (ability.trigger) {
    case 'cooldown': {
      state.cooldownTimer -= deltaSec;
      if (state.cooldownTimer <= 0) {
        state.cooldownTimer = ability.cooldown ?? 0;
        const action = getAbilityAction(ability, bossMaxHp);
        if (action) {
          actions.push(action);
          // Start timed effect if applicable
          if (ability.duration) {
            state.isEffectActive = true;
            state.effectTimer = ability.duration;
          }
        }
      }
      break;
    }

    case 'passive': {
      const action = getPassiveAction(ability, deltaSec, state);
      if (action) actions.push(action);
      break;
    }

    case 'hp_threshold': {
      if (!state.hasTriggered && currentHpPercent <= (ability.hpThreshold ?? 0)) {
        state.hasTriggered = true;
        const action = getAbilityAction(ability, bossMaxHp);
        if (action) actions.push(action);
      }
      break;
    }
  }

  return actions;
}

/**
 * Map a cooldown or threshold ability to its action.
 */
function getAbilityAction(ability: BossAbility, bossMaxHp: number): BossAbilityAction | null {
  switch (ability.id) {
    case 'nova_blast':
      return { type: 'stun_tower', params: { stunDuration: ability.params.stunDuration } };

    case 'mega_flame':
      return { type: 'speed_boost', params: { speedBoost: ability.params.speedBoost, range: ability.params.range } };

    case 'crimson_lightning':
      return { type: 'heal_self', params: { healAmount: bossMaxHp * ability.params.healPercent } };

    case 'ground_zero':
      return { type: 'destroy_projectiles', params: {} };

    case 'venom_infuse':
      return { type: 'spawn_minions', params: { minionCount: ability.params.minionCount } };

    case 'transcendent_sword':
      return { type: 'damage_shield', params: { damageReduction: ability.params.damageReduction } };

    case 'garuru_cannon':
      return { type: 'stun_top_towers', params: { towerCount: ability.params.towerCount, stunDuration: ability.params.stunDuration } };

    case 'total_annihilation':
      return { type: 'stun_all_towers', params: { stunDuration: ability.params.stunDuration } };

    default:
      return null;
  }
}

/**
 * Handle passive abilities that tick every frame.
 */
function getPassiveAction(ability: BossAbility, deltaSec: number, state: BossAbilityState): BossAbilityAction | null {
  switch (ability.id) {
    case 'death_claw': {
      // Accumulate fractional DB drain, only emit action when >= 1
      state.passiveAccumulator += ability.params.drainPerSec * deltaSec;
      if (state.passiveAccumulator >= 1) {
        const drain = Math.floor(state.passiveAccumulator);
        state.passiveAccumulator -= drain;
        return { type: 'drain_db', params: { amount: drain } };
      }
      return null;
    }

    case 'infinity_cannon':
      return { type: 'range_reduction', params: { rangeReduction: ability.params.rangeReduction } };

    default:
      return null;
  }
}

/**
 * Check if the boss currently has an active damage shield.
 */
export function getDamageReduction(state: BossAbilityState): number {
  if (state.ability.id === 'transcendent_sword' && state.isEffectActive) {
    return state.ability.params.damageReduction;
  }
  return 0;
}

/**
 * Get the cooldown progress (0-1) for UI display.
 */
export function getCooldownProgress(state: BossAbilityState): number {
  if (state.ability.trigger !== 'cooldown' || !state.ability.cooldown) return 0;
  return 1 - (state.cooldownTimer / state.ability.cooldown);
}
