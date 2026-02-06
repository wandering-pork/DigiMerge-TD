import Phaser from 'phaser';

export const EventBus = new Phaser.Events.EventEmitter();

export const GameEvents = {
  // Tower events
  TOWER_PLACED: 'tower:placed',
  TOWER_SELECTED: 'tower:selected',
  TOWER_DESELECTED: 'tower:deselected',
  TOWER_SOLD: 'tower:sold',
  TOWER_MERGED: 'tower:merged',
  TOWER_EVOLVED: 'tower:evolved',
  TOWER_LEVELED: 'tower:leveled',

  // Enemy events
  ENEMY_SPAWNED: 'enemy:spawned',
  ENEMY_DIED: 'enemy:died',
  ENEMY_REACHED_BASE: 'enemy:reachedBase',
  SPLITTER_DIED: 'enemy:splitterDied',

  // Combat events
  DAMAGE_DEALT: 'combat:damageDealt',

  // Wave events
  WAVE_STARTED: 'wave:started',
  WAVE_COMPLETED: 'wave:completed',
  WAVE_ALL_CLEARED: 'wave:allCleared',
  BOSS_SPAWNED: 'boss:spawned',

  // Game events
  GAME_OVER: 'game:over',
  GAME_WON: 'game:won',
  GAME_PAUSED: 'game:paused',
  GAME_RESUMED: 'game:resumed',

  // Economy events
  DIGIBYTES_CHANGED: 'currency:changed',
  LIVES_CHANGED: 'lives:changed',

  // UI events
  SPAWN_REQUESTED: 'ui:spawnRequested',
  STARTER_SELECTED: 'ui:starterSelected',
  MERGE_INITIATED: 'ui:mergeInitiated',
  DIGIVOLVE_INITIATED: 'ui:digivolveInitiated',

  // Boss ability events
  BOSS_ABILITY_ACTIVATED: 'boss:abilityActivated',
} as const;
