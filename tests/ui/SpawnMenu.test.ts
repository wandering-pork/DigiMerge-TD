import { describe, it, expect } from 'vitest';
import { getAvailableDigimonAtStage, getAllDigimonAtStage, getDigimonAtStageByAttribute } from '@/ui/SpawnMenu';
import { Stage, Attribute } from '@/types';

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

describe('getAllDigimonAtStage', () => {
  it('returns all 8 In-Training starters', () => {
    const result = getAllDigimonAtStage(Stage.IN_TRAINING);
    expect(result).toHaveLength(8);
    expect(result).toContain('koromon');
    expect(result).toContain('tsunomon');
    expect(result).toContain('tokomon');
    expect(result).toContain('gigimon');
    expect(result).toContain('tanemon');
    expect(result).toContain('demiveemon');
    expect(result).toContain('pagumon');
    expect(result).toContain('viximon');
  });

  it('returns all 8 Rookie evolutions', () => {
    const result = getAllDigimonAtStage(Stage.ROOKIE);
    expect(result).toHaveLength(8);
    expect(result).toContain('agumon');
    expect(result).toContain('gabumon');
    expect(result).toContain('patamon');
    expect(result).toContain('guilmon');
    expect(result).toContain('palmon');
    expect(result).toContain('veemon');
    expect(result).toContain('demidevimon');
    expect(result).toContain('renamon');
  });

  it('returns all 8 Champion evolutions (default path)', () => {
    const result = getAllDigimonAtStage(Stage.CHAMPION);
    expect(result).toHaveLength(8);
  });
});

describe('getDigimonAtStageByAttribute', () => {
  it('returns Vaccine In-Training starters', () => {
    const result = getDigimonAtStageByAttribute(Stage.IN_TRAINING, Attribute.VACCINE);
    expect(result).toContain('koromon');
    expect(result).toContain('tokomon');
    expect(result).not.toContain('tsunomon'); // Data
    expect(result).not.toContain('gigimon');  // Virus
  });

  it('returns Data In-Training starters', () => {
    const result = getDigimonAtStageByAttribute(Stage.IN_TRAINING, Attribute.DATA);
    expect(result).toContain('tsunomon');
    expect(result).toContain('tanemon');
    expect(result).toContain('viximon');
  });

  it('returns Virus In-Training starters', () => {
    const result = getDigimonAtStageByAttribute(Stage.IN_TRAINING, Attribute.VIRUS);
    expect(result).toContain('gigimon');
    expect(result).toContain('pagumon');
  });

  it('Free attribute Digimon are excluded from Vaccine/Data/Virus filters', () => {
    const vaccine = getDigimonAtStageByAttribute(Stage.IN_TRAINING, Attribute.VACCINE);
    const data = getDigimonAtStageByAttribute(Stage.IN_TRAINING, Attribute.DATA);
    const virus = getDigimonAtStageByAttribute(Stage.IN_TRAINING, Attribute.VIRUS);
    expect(vaccine).not.toContain('demiveemon');
    expect(data).not.toContain('demiveemon');
    expect(virus).not.toContain('demiveemon');
  });

  it('returns Vaccine Rookie evolutions', () => {
    const result = getDigimonAtStageByAttribute(Stage.ROOKIE, Attribute.VACCINE);
    expect(result).toContain('agumon');
    expect(result).toContain('patamon');
  });

  it('returns empty for nonexistent attribute at stage', () => {
    // All starters produce specific attributes; this tests filtering works
    const free = getDigimonAtStageByAttribute(Stage.IN_TRAINING, Attribute.FREE);
    expect(free).toContain('demiveemon');
  });
});
