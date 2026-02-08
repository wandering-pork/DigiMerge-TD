import Phaser from 'phaser';
import { SPRITE_ATLAS_MAP, ATLAS_KEYS } from '@/data/SpriteAtlasData';
import type { AtlasEntry } from '@/data/SpriteAtlasData';

export { ATLAS_KEYS };

/**
 * Check if a game sprite key has atlas coverage.
 */
export function hasAtlasEntry(key: string): boolean {
  return key in SPRITE_ATLAS_MAP;
}

/**
 * Get the atlas entry for a sprite key, or null if not mapped.
 */
export function getAtlasEntry(key: string): AtlasEntry | null {
  return SPRITE_ATLAS_MAP[key] ?? null;
}

/**
 * Get static frame info for UI display (frame 0 from atlas).
 * Returns { atlas, frame } or null if the key has no atlas entry.
 */
export function getStaticFrame(key: string): { atlas: string; frame: string } | null {
  const entry = getAtlasEntry(key);
  if (!entry) return null;
  return { atlas: entry.atlas, frame: `${entry.prefix}_0` };
}

/**
 * Create a 3-frame idle animation if it doesn't already exist.
 * Uses frames 0, 1, 2 (Row 0 = front-facing idle) at 4 fps, infinite repeat.
 * Returns the animation key (e.g. 'idle_agumon') or null if no atlas entry.
 */
export function ensureIdleAnim(scene: Phaser.Scene, key: string): string | null {
  const entry = getAtlasEntry(key);
  if (!entry) return null;

  const animKey = `idle_${key}`;

  if (scene.anims.exists(animKey)) {
    return animKey;
  }

  scene.anims.create({
    key: animKey,
    frames: [
      { key: entry.atlas, frame: `${entry.prefix}_0` },
      { key: entry.atlas, frame: `${entry.prefix}_1` },
      { key: entry.atlas, frame: `${entry.prefix}_2` },
    ],
    frameRate: 4,
    repeat: -1,
  });

  return animKey;
}

/**
 * Check if a sprite can be displayed (either via atlas or individual texture).
 */
export function canDisplaySprite(scene: Phaser.Scene, key: string): boolean {
  if (hasAtlasEntry(key)) return true;
  return scene.textures.exists(key);
}

/**
 * Apply the correct texture to a sprite. Returns true if atlas was used.
 * If atlas entry exists: sets atlas texture with frame 0.
 * Otherwise falls back to individual texture key.
 */
export function applySprite(
  sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image,
  scene: Phaser.Scene,
  key: string,
): boolean {
  const entry = getAtlasEntry(key);
  if (entry) {
    sprite.setTexture(entry.atlas, `${entry.prefix}_0`);
    return true;
  }

  if (scene.textures.exists(key)) {
    sprite.setTexture(key);
  }

  return false;
}
