import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TutorialOverlay } from '@/ui/TutorialOverlay';

// Mock localStorage for tutorial tests
const localStorageMock: Record<string, string> = {};
const originalGetItem = globalThis.localStorage?.getItem;
const originalSetItem = globalThis.localStorage?.setItem;
const originalRemoveItem = globalThis.localStorage?.removeItem;

beforeEach(() => {
  // Clear mock storage
  for (const key of Object.keys(localStorageMock)) {
    delete localStorageMock[key];
  }

  // Patch localStorage
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key: string) => localStorageMock[key] ?? null,
      setItem: (key: string, value: string) => { localStorageMock[key] = value; },
      removeItem: (key: string) => { delete localStorageMock[key]; },
    },
    writable: true,
    configurable: true,
  });
});

describe('TutorialOverlay', () => {
  describe('isComplete / markComplete / reset', () => {
    it('returns false when tutorial has not been completed', () => {
      expect(TutorialOverlay.isComplete()).toBe(false);
    });

    it('returns true after marking complete', () => {
      TutorialOverlay.markComplete();
      expect(TutorialOverlay.isComplete()).toBe(true);
    });

    it('returns false after reset', () => {
      TutorialOverlay.markComplete();
      expect(TutorialOverlay.isComplete()).toBe(true);
      TutorialOverlay.reset();
      expect(TutorialOverlay.isComplete()).toBe(false);
    });
  });

  describe('getStepCount', () => {
    it('returns 8 tutorial steps', () => {
      expect(TutorialOverlay.getStepCount()).toBe(8);
    });
  });
});
