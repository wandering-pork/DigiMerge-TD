import { Attribute } from '@/types';
import { ATTRIBUTE_MULTIPLIERS } from '@/config/Constants';

export function getAttributeMultiplier(attacker: Attribute, defender: Attribute): number {
  return ATTRIBUTE_MULTIPLIERS[attacker]?.[defender] ?? 1.0;
}

export function getAttributeAdvantage(attacker: Attribute, defender: Attribute): 'strong' | 'weak' | 'neutral' {
  const mult = getAttributeMultiplier(attacker, defender);
  if (mult > 1.0) return 'strong';
  if (mult < 1.0) return 'weak';
  return 'neutral';
}
