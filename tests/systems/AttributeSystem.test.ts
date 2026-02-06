import { describe, it, expect } from 'vitest';
import { getAttributeMultiplier, getAttributeAdvantage } from '@/systems/AttributeSystem';
import { Attribute } from '@/types';

describe('AttributeSystem', () => {
  describe('getAttributeMultiplier', () => {
    // Vaccine attacks
    it('Vaccine vs Vaccine = 1.0x (neutral)', () => {
      expect(getAttributeMultiplier(Attribute.VACCINE, Attribute.VACCINE)).toBe(1.0);
    });

    it('Vaccine vs Data = 0.75x (weak)', () => {
      expect(getAttributeMultiplier(Attribute.VACCINE, Attribute.DATA)).toBe(0.75);
    });

    it('Vaccine vs Virus = 1.5x (strong)', () => {
      expect(getAttributeMultiplier(Attribute.VACCINE, Attribute.VIRUS)).toBe(1.5);
    });

    it('Vaccine vs Free = 1.0x (neutral)', () => {
      expect(getAttributeMultiplier(Attribute.VACCINE, Attribute.FREE)).toBe(1.0);
    });

    // Data attacks
    it('Data vs Vaccine = 1.5x (strong)', () => {
      expect(getAttributeMultiplier(Attribute.DATA, Attribute.VACCINE)).toBe(1.5);
    });

    it('Data vs Data = 1.0x (neutral)', () => {
      expect(getAttributeMultiplier(Attribute.DATA, Attribute.DATA)).toBe(1.0);
    });

    it('Data vs Virus = 0.75x (weak)', () => {
      expect(getAttributeMultiplier(Attribute.DATA, Attribute.VIRUS)).toBe(0.75);
    });

    it('Data vs Free = 1.0x (neutral)', () => {
      expect(getAttributeMultiplier(Attribute.DATA, Attribute.FREE)).toBe(1.0);
    });

    // Virus attacks
    it('Virus vs Vaccine = 0.75x (weak)', () => {
      expect(getAttributeMultiplier(Attribute.VIRUS, Attribute.VACCINE)).toBe(0.75);
    });

    it('Virus vs Data = 1.5x (strong)', () => {
      expect(getAttributeMultiplier(Attribute.VIRUS, Attribute.DATA)).toBe(1.5);
    });

    it('Virus vs Virus = 1.0x (neutral)', () => {
      expect(getAttributeMultiplier(Attribute.VIRUS, Attribute.VIRUS)).toBe(1.0);
    });

    it('Virus vs Free = 1.0x (neutral)', () => {
      expect(getAttributeMultiplier(Attribute.VIRUS, Attribute.FREE)).toBe(1.0);
    });

    // Free attacks (all neutral)
    it('Free vs Vaccine = 1.0x (neutral)', () => {
      expect(getAttributeMultiplier(Attribute.FREE, Attribute.VACCINE)).toBe(1.0);
    });

    it('Free vs Data = 1.0x (neutral)', () => {
      expect(getAttributeMultiplier(Attribute.FREE, Attribute.DATA)).toBe(1.0);
    });

    it('Free vs Virus = 1.0x (neutral)', () => {
      expect(getAttributeMultiplier(Attribute.FREE, Attribute.VIRUS)).toBe(1.0);
    });

    it('Free vs Free = 1.0x (neutral)', () => {
      expect(getAttributeMultiplier(Attribute.FREE, Attribute.FREE)).toBe(1.0);
    });
  });

  describe('getAttributeAdvantage', () => {
    it('returns strong for Vaccine vs Virus', () => {
      expect(getAttributeAdvantage(Attribute.VACCINE, Attribute.VIRUS)).toBe('strong');
    });

    it('returns weak for Vaccine vs Data', () => {
      expect(getAttributeAdvantage(Attribute.VACCINE, Attribute.DATA)).toBe('weak');
    });

    it('returns neutral for same attribute', () => {
      expect(getAttributeAdvantage(Attribute.DATA, Attribute.DATA)).toBe('neutral');
    });

    it('returns neutral for Free vs anything', () => {
      expect(getAttributeAdvantage(Attribute.FREE, Attribute.VACCINE)).toBe('neutral');
      expect(getAttributeAdvantage(Attribute.FREE, Attribute.VIRUS)).toBe('neutral');
    });
  });
});
