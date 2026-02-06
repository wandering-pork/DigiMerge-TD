import { describe, it, expect } from 'vitest';
import {
  BOSS_ABILITIES,
  createBossAbilityState,
  tickBossAbility,
  getDamageReduction,
  getCooldownProgress,
  BossAbilityState,
} from '@/systems/BossAbilitySystem';

describe('BossAbilitySystem', () => {
  describe('BOSS_ABILITIES', () => {
    it('should define 10 unique boss abilities', () => {
      expect(Object.keys(BOSS_ABILITIES)).toHaveLength(10);
    });

    it('each ability has required fields', () => {
      for (const ability of Object.values(BOSS_ABILITIES)) {
        expect(ability.id).toBeTruthy();
        expect(ability.name).toBeTruthy();
        expect(ability.description).toBeTruthy();
        expect(['cooldown', 'passive', 'hp_threshold']).toContain(ability.trigger);
        expect(ability.params).toBeDefined();
      }
    });

    it('cooldown abilities have positive cooldown', () => {
      const cooldownAbilities = Object.values(BOSS_ABILITIES).filter(a => a.trigger === 'cooldown');
      expect(cooldownAbilities.length).toBeGreaterThan(0);
      for (const ability of cooldownAbilities) {
        expect(ability.cooldown).toBeGreaterThan(0);
      }
    });

    it('hp_threshold abilities have threshold between 0 and 1', () => {
      const thresholdAbilities = Object.values(BOSS_ABILITIES).filter(a => a.trigger === 'hp_threshold');
      expect(thresholdAbilities.length).toBeGreaterThan(0);
      for (const ability of thresholdAbilities) {
        expect(ability.hpThreshold).toBeGreaterThan(0);
        expect(ability.hpThreshold).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('createBossAbilityState', () => {
    it('initializes cooldown timer from ability', () => {
      const state = createBossAbilityState(BOSS_ABILITIES.nova_blast);
      expect(state.cooldownTimer).toBe(8);
      expect(state.hasTriggered).toBe(false);
      expect(state.isEffectActive).toBe(false);
      expect(state.effectTimer).toBe(0);
    });

    it('initializes passive ability with zero accumulators', () => {
      const state = createBossAbilityState(BOSS_ABILITIES.death_claw);
      expect(state.passiveAccumulator).toBe(0);
      expect(state.cooldownTimer).toBe(0);
    });
  });

  describe('tickBossAbility — cooldown abilities', () => {
    it('nova_blast: fires stun_tower after cooldown', () => {
      const state = createBossAbilityState(BOSS_ABILITIES.nova_blast);
      // Tick almost to cooldown
      let actions = tickBossAbility(state, 7.9, 1, 400);
      expect(actions).toHaveLength(0);

      // Tick past cooldown
      actions = tickBossAbility(state, 0.2, 1, 400);
      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('stun_tower');
      expect(actions[0].params.stunDuration).toBe(2);
    });

    it('nova_blast: resets cooldown after firing', () => {
      const state = createBossAbilityState(BOSS_ABILITIES.nova_blast);
      tickBossAbility(state, 8.1, 1, 400);
      // After firing, cooldown resets to full cooldown value
      expect(state.cooldownTimer).toBeCloseTo(8, 0);
    });

    it('mega_flame: fires speed_boost and starts timed effect', () => {
      const state = createBossAbilityState(BOSS_ABILITIES.mega_flame);
      const actions = tickBossAbility(state, 10.1, 1, 1200);
      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('speed_boost');
      expect(actions[0].params.speedBoost).toBe(0.3);
      expect(state.isEffectActive).toBe(true);
      expect(state.effectTimer).toBe(3);
    });

    it('mega_flame: effect expires after duration', () => {
      const state = createBossAbilityState(BOSS_ABILITIES.mega_flame);
      tickBossAbility(state, 10.1, 1, 1200); // triggers
      expect(state.isEffectActive).toBe(true);

      tickBossAbility(state, 2, 1, 1200); // 2s elapsed
      expect(state.isEffectActive).toBe(true);

      tickBossAbility(state, 1.1, 1, 1200); // 3.1s total
      expect(state.isEffectActive).toBe(false);
    });

    it('crimson_lightning: heals for 10% of max HP', () => {
      const maxHp = 6000;
      const state = createBossAbilityState(BOSS_ABILITIES.crimson_lightning);
      const actions = tickBossAbility(state, 12.1, 0.5, maxHp);
      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('heal_self');
      expect(actions[0].params.healAmount).toBe(600); // 10% of 6000
    });

    it('venom_infuse: spawns minions', () => {
      const state = createBossAbilityState(BOSS_ABILITIES.venom_infuse);
      const actions = tickBossAbility(state, 15.1, 0.8, 15000);
      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('spawn_minions');
      expect(actions[0].params.minionCount).toBe(3);
    });

    it('transcendent_sword: activates damage shield', () => {
      const state = createBossAbilityState(BOSS_ABILITIES.transcendent_sword);
      const actions = tickBossAbility(state, 20.1, 1, 50000);
      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('damage_shield');
      expect(actions[0].params.damageReduction).toBe(0.5);
      expect(state.isEffectActive).toBe(true);
      expect(state.effectTimer).toBe(4);
    });

    it('garuru_cannon: freezes top DPS towers', () => {
      const state = createBossAbilityState(BOSS_ABILITIES.garuru_cannon);
      const actions = tickBossAbility(state, 15.1, 0.8, 80000);
      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('stun_top_towers');
      expect(actions[0].params.towerCount).toBe(3);
      expect(actions[0].params.stunDuration).toBe(3);
    });
  });

  describe('tickBossAbility — passive abilities', () => {
    it('death_claw: drains DB over time', () => {
      const state = createBossAbilityState(BOSS_ABILITIES.death_claw);
      // 5 DB/sec, after 0.2s = 1 DB
      let actions = tickBossAbility(state, 0.2, 1, 2500);
      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('drain_db');
      expect(actions[0].params.amount).toBe(1);
    });

    it('death_claw: accumulates fractional drain', () => {
      const state = createBossAbilityState(BOSS_ABILITIES.death_claw);
      // 5 DB/sec, after 0.1s = 0.5 DB — not enough for 1
      let actions = tickBossAbility(state, 0.1, 1, 2500);
      expect(actions).toHaveLength(0);
      expect(state.passiveAccumulator).toBeCloseTo(0.5);

      // Another 0.1s = 1.0 total accumulated
      actions = tickBossAbility(state, 0.1, 1, 2500);
      expect(actions).toHaveLength(1);
      expect(actions[0].params.amount).toBe(1);
    });

    it('infinity_cannon: continuously emits range reduction', () => {
      const state = createBossAbilityState(BOSS_ABILITIES.infinity_cannon);
      const actions = tickBossAbility(state, 0.016, 1, 25000);
      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('range_reduction');
      expect(actions[0].params.rangeReduction).toBe(0.2);
    });
  });

  describe('tickBossAbility — hp_threshold abilities', () => {
    it('ground_zero: triggers at 50% HP', () => {
      const state = createBossAbilityState(BOSS_ABILITIES.ground_zero);
      // Above threshold — no trigger
      let actions = tickBossAbility(state, 1, 0.6, 8000);
      expect(actions).toHaveLength(0);
      expect(state.hasTriggered).toBe(false);

      // At threshold
      actions = tickBossAbility(state, 1, 0.5, 8000);
      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('destroy_projectiles');
      expect(state.hasTriggered).toBe(true);
    });

    it('ground_zero: only triggers once', () => {
      const state = createBossAbilityState(BOSS_ABILITIES.ground_zero);
      tickBossAbility(state, 1, 0.5, 8000);
      expect(state.hasTriggered).toBe(true);

      // Below threshold again — should not trigger again
      const actions = tickBossAbility(state, 1, 0.3, 8000);
      expect(actions).toHaveLength(0);
    });

    it('total_annihilation: triggers at 25% HP', () => {
      const state = createBossAbilityState(BOSS_ABILITIES.total_annihilation);
      let actions = tickBossAbility(state, 1, 0.3, 200000);
      expect(actions).toHaveLength(0);

      actions = tickBossAbility(state, 1, 0.25, 200000);
      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('stun_all_towers');
      expect(actions[0].params.stunDuration).toBe(2);
    });
  });

  describe('getDamageReduction', () => {
    it('returns 0 when no damage shield is active', () => {
      const state = createBossAbilityState(BOSS_ABILITIES.nova_blast);
      expect(getDamageReduction(state)).toBe(0);
    });

    it('returns reduction when transcendent_sword is active', () => {
      const state = createBossAbilityState(BOSS_ABILITIES.transcendent_sword);
      tickBossAbility(state, 20.1, 1, 50000); // activate
      expect(getDamageReduction(state)).toBe(0.5);
    });

    it('returns 0 after transcendent_sword expires', () => {
      const state = createBossAbilityState(BOSS_ABILITIES.transcendent_sword);
      tickBossAbility(state, 20.1, 1, 50000); // activate
      tickBossAbility(state, 4.1, 1, 50000); // expire
      expect(getDamageReduction(state)).toBe(0);
    });
  });

  describe('getCooldownProgress', () => {
    it('returns 0 at full cooldown', () => {
      const state = createBossAbilityState(BOSS_ABILITIES.nova_blast);
      expect(getCooldownProgress(state)).toBeCloseTo(0);
    });

    it('returns 0.5 at half cooldown', () => {
      const state = createBossAbilityState(BOSS_ABILITIES.nova_blast);
      tickBossAbility(state, 4, 1, 400); // half of 8s
      expect(getCooldownProgress(state)).toBeCloseTo(0.5);
    });

    it('returns 0 for passive abilities', () => {
      const state = createBossAbilityState(BOSS_ABILITIES.death_claw);
      expect(getCooldownProgress(state)).toBe(0);
    });
  });
});
