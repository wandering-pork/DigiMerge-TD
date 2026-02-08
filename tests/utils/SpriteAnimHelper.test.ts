import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/data/SpriteAtlasData', () => ({
  SPRITE_ATLAS_MAP: {
    agumon: { atlas: 'atlas_child', prefix: 'Agumon' },
    koromon: { atlas: 'atlas_baby2', prefix: 'Koromon' },
  },
  ATLAS_KEYS: ['atlas_baby2', 'atlas_child', 'atlas_adult', 'atlas_perfect', 'atlas_ultimate'],
}));

import {
  hasAtlasEntry,
  getAtlasEntry,
  getStaticFrame,
  ensureIdleAnim,
  canDisplaySprite,
  applySprite,
} from '@/utils/SpriteAnimHelper';

function createMockScene(options?: {
  animExists?: (key: string) => boolean;
  textureExists?: (key: string) => boolean;
}) {
  const animCreate = vi.fn().mockReturnValue({ key: 'mock_anim' });
  const animExists = vi.fn(options?.animExists ?? (() => false));
  const textureExists = vi.fn(options?.textureExists ?? (() => false));

  return {
    anims: {
      exists: animExists,
      create: animCreate,
    },
    textures: {
      exists: textureExists,
    },
    _mocks: { animCreate, animExists, textureExists },
  } as unknown as Phaser.Scene & {
    _mocks: {
      animCreate: ReturnType<typeof vi.fn>;
      animExists: ReturnType<typeof vi.fn>;
      textureExists: ReturnType<typeof vi.fn>;
    };
  };
}

describe('SpriteAnimHelper', () => {
  describe('hasAtlasEntry', () => {
    it('returns true for mapped keys', () => {
      expect(hasAtlasEntry('agumon')).toBe(true);
      expect(hasAtlasEntry('koromon')).toBe(true);
    });

    it('returns false for unmapped keys', () => {
      expect(hasAtlasEntry('greymon')).toBe(false);
      expect(hasAtlasEntry('nonexistent')).toBe(false);
      expect(hasAtlasEntry('')).toBe(false);
    });
  });

  describe('getAtlasEntry', () => {
    it('returns correct entry for mapped key', () => {
      const entry = getAtlasEntry('agumon');
      expect(entry).toEqual({ atlas: 'atlas_child', prefix: 'Agumon' });
    });

    it('returns correct entry for another mapped key', () => {
      const entry = getAtlasEntry('koromon');
      expect(entry).toEqual({ atlas: 'atlas_baby2', prefix: 'Koromon' });
    });

    it('returns null for unmapped key', () => {
      expect(getAtlasEntry('greymon')).toBeNull();
      expect(getAtlasEntry('nonexistent')).toBeNull();
    });
  });

  describe('getStaticFrame', () => {
    it('returns correct atlas and frame string for mapped key', () => {
      const frame = getStaticFrame('agumon');
      expect(frame).toEqual({ atlas: 'atlas_child', frame: 'Agumon_0' });
    });

    it('returns correct atlas and frame for another key', () => {
      const frame = getStaticFrame('koromon');
      expect(frame).toEqual({ atlas: 'atlas_baby2', frame: 'Koromon_0' });
    });

    it('returns null for unmapped key', () => {
      expect(getStaticFrame('greymon')).toBeNull();
    });
  });

  describe('ensureIdleAnim', () => {
    let scene: ReturnType<typeof createMockScene>;

    beforeEach(() => {
      scene = createMockScene();
    });

    it('creates animation with correct config for atlas key', () => {
      const animKey = ensureIdleAnim(scene, 'agumon');

      expect(animKey).toBe('idle_agumon');
      expect(scene._mocks.animExists).toHaveBeenCalledWith('idle_agumon');
      expect(scene._mocks.animCreate).toHaveBeenCalledWith({
        key: 'idle_agumon',
        frames: [
          { key: 'atlas_child', frame: 'Agumon_0' },
          { key: 'atlas_child', frame: 'Agumon_1' },
          { key: 'atlas_child', frame: 'Agumon_2' },
        ],
        frameRate: 4,
        repeat: -1,
      });
    });

    it('returns existing anim key without recreating if already exists', () => {
      scene = createMockScene({ animExists: (key) => key === 'idle_agumon' });

      const animKey = ensureIdleAnim(scene, 'agumon');

      expect(animKey).toBe('idle_agumon');
      expect(scene._mocks.animCreate).not.toHaveBeenCalled();
    });

    it('returns null for non-atlas keys', () => {
      const animKey = ensureIdleAnim(scene, 'greymon');

      expect(animKey).toBeNull();
      expect(scene._mocks.animCreate).not.toHaveBeenCalled();
    });

    it('creates animation for koromon with correct prefix', () => {
      const animKey = ensureIdleAnim(scene, 'koromon');

      expect(animKey).toBe('idle_koromon');
      expect(scene._mocks.animCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'idle_koromon',
          frames: [
            { key: 'atlas_baby2', frame: 'Koromon_0' },
            { key: 'atlas_baby2', frame: 'Koromon_1' },
            { key: 'atlas_baby2', frame: 'Koromon_2' },
          ],
        }),
      );
    });
  });

  describe('canDisplaySprite', () => {
    it('returns true for atlas keys regardless of textures', () => {
      const scene = createMockScene({ textureExists: () => false });
      expect(canDisplaySprite(scene, 'agumon')).toBe(true);
    });

    it('returns true for individual texture keys not in atlas', () => {
      const scene = createMockScene({ textureExists: (key) => key === 'greymon' });
      expect(canDisplaySprite(scene, 'greymon')).toBe(true);
    });

    it('returns false for keys with no atlas entry and no individual texture', () => {
      const scene = createMockScene({ textureExists: () => false });
      expect(canDisplaySprite(scene, 'nonexistent')).toBe(false);
    });
  });

  describe('applySprite', () => {
    let mockSprite: { setTexture: ReturnType<typeof vi.fn> };

    beforeEach(() => {
      mockSprite = { setTexture: vi.fn() };
    });

    it('sets correct atlas texture for atlas keys', () => {
      const scene = createMockScene();
      const result = applySprite(
        mockSprite as unknown as Phaser.GameObjects.Sprite,
        scene,
        'agumon',
      );

      expect(mockSprite.setTexture).toHaveBeenCalledWith('atlas_child', 'Agumon_0');
      expect(result).toBe(true);
    });

    it('sets individual texture for non-atlas keys when texture exists', () => {
      const scene = createMockScene({ textureExists: (key) => key === 'greymon' });
      const result = applySprite(
        mockSprite as unknown as Phaser.GameObjects.Sprite,
        scene,
        'greymon',
      );

      expect(mockSprite.setTexture).toHaveBeenCalledWith('greymon');
      expect(result).toBe(false);
    });

    it('returns true when atlas is used', () => {
      const scene = createMockScene();
      const result = applySprite(
        mockSprite as unknown as Phaser.GameObjects.Sprite,
        scene,
        'koromon',
      );

      expect(result).toBe(true);
      expect(mockSprite.setTexture).toHaveBeenCalledWith('atlas_baby2', 'Koromon_0');
    });

    it('returns false when individual texture is used', () => {
      const scene = createMockScene({ textureExists: () => true });
      const result = applySprite(
        mockSprite as unknown as Phaser.GameObjects.Sprite,
        scene,
        'metalgreymon',
      );

      expect(result).toBe(false);
    });

    it('does not call setTexture when key has no atlas and no individual texture', () => {
      const scene = createMockScene({ textureExists: () => false });
      const result = applySprite(
        mockSprite as unknown as Phaser.GameObjects.Sprite,
        scene,
        'nonexistent',
      );

      expect(mockSprite.setTexture).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});
