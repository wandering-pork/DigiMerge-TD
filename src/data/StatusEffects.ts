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
