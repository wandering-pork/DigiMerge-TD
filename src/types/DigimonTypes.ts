export enum Stage {
  IN_TRAINING = 0,
  ROOKIE = 1,
  CHAMPION = 2,
  ULTIMATE = 3,
  MEGA = 4,
  ULTRA = 5,
}

export enum Attribute {
  VACCINE = 0,
  DATA = 1,
  VIRUS = 2,
  FREE = 3,
}

export enum TargetPriority {
  FIRST = 'first',
  LAST = 'last',
  STRONGEST = 'strongest',
  WEAKEST = 'weakest',
  FASTEST = 'fastest',
  CLOSEST = 'closest',
  FLYING = 'flying',
}

export interface DigimonStats {
  id: string;
  name: string;
  stageTier: Stage;
  attribute: Attribute;
  baseDamage: number;
  baseSpeed: number;
  range: number;
  effectType?: string;
  effectChance?: number;
  priority?: TargetPriority;
  spriteKey?: string;
}

export type BossAbilityTrigger = 'cooldown' | 'passive' | 'hp_threshold';

export interface BossAbility {
  id: string;
  name: string;
  description: string;
  trigger: BossAbilityTrigger;
  cooldown?: number;       // seconds (for 'cooldown' trigger)
  hpThreshold?: number;    // 0-1 fraction (for 'hp_threshold' trigger)
  duration?: number;        // seconds (for timed effects)
  params: Record<string, number>; // ability-specific parameters
}

export interface EnemyStats {
  id: string;
  spriteKey?: string;
  name: string;
  stageTier: Stage;
  attribute: Attribute;
  baseHP: number;
  moveSpeed: number;
  armor: number;
  type: EnemyType;
  reward: number;
  bossAbility?: BossAbility;
}

export type EnemyType = 'swarm' | 'standard' | 'tank' | 'speedster' | 'flying' | 'regen' | 'shielded' | 'splitter';

export enum SpawnType {
  RANDOM = 'random',
  SPECIFIC = 'specific',
  FREE = 'free',
}

export const STAGE_NAMES: Record<Stage, string> = {
  [Stage.IN_TRAINING]: 'In-Training',
  [Stage.ROOKIE]: 'Rookie',
  [Stage.CHAMPION]: 'Champion',
  [Stage.ULTIMATE]: 'Ultimate',
  [Stage.MEGA]: 'Mega',
  [Stage.ULTRA]: 'Ultra',
};

export const ATTRIBUTE_NAMES: Record<Attribute, string> = {
  [Attribute.VACCINE]: 'Vaccine',
  [Attribute.DATA]: 'Data',
  [Attribute.VIRUS]: 'Virus',
  [Attribute.FREE]: 'Free',
};
