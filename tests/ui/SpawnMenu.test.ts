import { describe, it, expect } from 'vitest';
import { getAvailableDigimonAtStage } from '@/ui/SpawnMenu';
import { Stage } from '@/types';

describe('getAvailableDigimonAtStage', () => {
  const starters = ['koromon', 'tsunomon', 'tokomon', 'gigimon'];

  it('returns In-Training starters directly', () => {
    const result = getAvailableDigimonAtStage(starters, Stage.IN_TRAINING);
    expect(result).toEqual(['koromon', 'tsunomon', 'tokomon', 'gigimon']);
  });

  it('returns Rookie evolutions for In-Training starters', () => {
    const result = getAvailableDigimonAtStage(starters, Stage.ROOKIE);
    expect(result).toEqual(['agumon', 'gabumon', 'patamon', 'guilmon']);
  });

  it('returns Champion evolutions (default path)', () => {
    const result = getAvailableDigimonAtStage(starters, Stage.CHAMPION);
    expect(result).toEqual(['greymon', 'garurumon', 'angemon', 'growlmon']);
  });

  it('returns empty array for no starters', () => {
    const result = getAvailableDigimonAtStage([], Stage.IN_TRAINING);
    expect(result).toEqual([]);
  });

  it('returns empty array for invalid starter', () => {
    const result = getAvailableDigimonAtStage(['nonexistent'], Stage.ROOKIE);
    expect(result).toEqual([]);
  });

  it('handles partial starters list', () => {
    const result = getAvailableDigimonAtStage(['koromon'], Stage.ROOKIE);
    expect(result).toEqual(['agumon']);
  });

  it('returns Ultimate evolutions (3 stages forward)', () => {
    const result = getAvailableDigimonAtStage(['koromon', 'tsunomon'], Stage.ULTIMATE);
    expect(result).toEqual(['metalgreymon', 'weregarurumon']);
  });

  it('returns Mega evolutions (4 stages forward)', () => {
    const result = getAvailableDigimonAtStage(['koromon'], Stage.MEGA);
    expect(result).toEqual(['wargreymon']);
  });
});
