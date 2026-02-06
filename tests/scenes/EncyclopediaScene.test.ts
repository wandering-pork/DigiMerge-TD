import { describe, it, expect } from 'vitest';
import { DIGIMON_DATABASE } from '@/data/DigimonDatabase';

describe('EncyclopediaScene data', () => {
  it('has tower entries in the database', () => {
    const towerCount = Object.keys(DIGIMON_DATABASE.towers).length;
    expect(towerCount).toBeGreaterThan(50);
  });

  it('has enemy entries in the database', () => {
    const enemyCount = Object.keys(DIGIMON_DATABASE.enemies).length;
    expect(enemyCount).toBeGreaterThan(30);
  });

  it('all tower entries have required fields for encyclopedia display', () => {
    for (const [id, stats] of Object.entries(DIGIMON_DATABASE.towers)) {
      expect(stats.name, `${id} missing name`).toBeTruthy();
      expect(stats.stageTier, `${id} missing stageTier`).toBeDefined();
      expect(stats.attribute, `${id} missing attribute`).toBeDefined();
      expect(stats.baseDamage, `${id} missing baseDamage`).toBeGreaterThan(0);
    }
  });

  it('all enemy entries have required fields for encyclopedia display', () => {
    for (const [id, stats] of Object.entries(DIGIMON_DATABASE.enemies)) {
      expect(stats.name, `${id} missing name`).toBeTruthy();
      expect(stats.stageTier, `${id} missing stageTier`).toBeDefined();
      expect(stats.attribute, `${id} missing attribute`).toBeDefined();
      expect(stats.baseHP, `${id} missing baseHP`).toBeGreaterThan(0);
    }
  });

  it('all bosses have bossAbility defined', () => {
    const bosses = Object.entries(DIGIMON_DATABASE.enemies).filter(([id]) => id.startsWith('boss_'));
    expect(bosses.length).toBeGreaterThanOrEqual(10);
    for (const [id, stats] of bosses) {
      expect(stats.bossAbility, `Boss ${id} missing bossAbility`).toBeDefined();
      expect(stats.bossAbility!.name, `Boss ${id} ability missing name`).toBeTruthy();
      expect(stats.bossAbility!.description, `Boss ${id} ability missing description`).toBeTruthy();
    }
  });

  it('entries can be filtered by stage', () => {
    const allEntries = [
      ...Object.values(DIGIMON_DATABASE.towers).map(s => ({ stage: s.stageTier, isTower: true })),
      ...Object.values(DIGIMON_DATABASE.enemies).map(s => ({ stage: s.stageTier, isTower: false })),
    ];

    // Filter by CHAMPION
    const championEntries = allEntries.filter(e => e.stage === 2);
    expect(championEntries.length).toBeGreaterThan(0);

    // Filter by towers only
    const towerOnly = allEntries.filter(e => e.isTower);
    expect(towerOnly.length).toBe(Object.keys(DIGIMON_DATABASE.towers).length);
  });
});
