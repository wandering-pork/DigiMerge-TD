/**
 * generate-atlases.ts
 *
 * Reads Digimon sprite sheets (48x64, 12 frames of 16x16 each) from
 * assets/sprites/sprite sheets/{stage}/, packs them into texture atlas PNGs
 * with Phaser JSON Hash descriptors, and auto-generates SpriteAtlasData.ts
 * mapping game sprite keys to their atlas entries.
 *
 * Run:  npx tsx scripts/generate-atlases.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

/** Stage folder name -> atlas key */
const STAGE_MAP: Record<string, string> = {
  'Baby II': 'atlas_baby2',
  'Child': 'atlas_child',
  'Adult': 'atlas_adult',
  'Perfect': 'atlas_perfect',
  'Ultimate-Super Ultimate': 'atlas_ultimate',
};

const SPRITE_SHEETS_DIR = path.join(PROJECT_ROOT, 'assets', 'sprites', 'sprite sheets');
const ATLAS_OUTPUT_DIR = path.join(PROJECT_ROOT, 'public', 'assets', 'sprites', 'atlases');
const PRELOAD_SCENE_PATH = path.join(PROJECT_ROOT, 'src', 'scenes', 'PreloadScene.ts');
const SPRITE_ATLAS_DATA_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'SpriteAtlasData.ts');

const FRAME_W = 16;
const FRAME_H = 16;
const SHEET_COLS = 3; // frames per row in a 48-wide sheet
const SHEET_ROWS = 4; // rows in a 64-tall sheet
const FRAMES_PER_SHEET = SHEET_COLS * SHEET_ROWS; // 12
const MAX_ATLAS_SIZE = 2048;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FrameDescriptor {
  /** e.g. "Agumon_0" */
  name: string;
  /** Source sheet file path */
  sheetPath: string;
  /** Extract region within the source sheet */
  sx: number;
  sy: number;
}

interface PhaserFrameHash {
  frame: { x: number; y: number; w: number; h: number };
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: { x: number; y: number; w: number; h: number };
  sourceSize: { w: number; h: number };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripExtension(filename: string): string {
  return filename.replace(/\.png$/i, '');
}

/**
 * Parse the PreloadScene.ts `sprites` object to extract a mapping of
 * game key -> filename (without extension).
 *
 * We look for lines like:  someKey: 'Filename.png',
 */
function parseSpriteKeyMap(preloadSource: string): Map<string, string> {
  const map = new Map<string, string>();

  // Find the sprites block
  const blockMatch = preloadSource.match(
    /const\s+sprites\s*:\s*Record<string,\s*string>\s*=\s*\{([\s\S]*?)\};/,
  );
  if (!blockMatch) {
    console.error('ERROR: Could not find sprites Record in PreloadScene.ts');
    return map;
  }

  const block = blockMatch[1];
  // Match each key-value pair (handles both bare identifiers and quoted keys)
  const entryRegex = /(?:'([^']+)'|"([^"]+)"|(\w+))\s*:\s*'([^']+)'/g;
  let match: RegExpExecArray | null;
  while ((match = entryRegex.exec(block)) !== null) {
    const key = match[1] ?? match[2] ?? match[3];
    const filename = match[4];
    map.set(key, stripExtension(filename));
  }

  return map;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== DigiMerge TD Atlas Generator ===\n');

  // Ensure output directory exists
  fs.mkdirSync(ATLAS_OUTPUT_DIR, { recursive: true });

  // Build a lookup: filename (no ext) -> { stageFolder, atlasKey }
  // Used later when generating SpriteAtlasData.ts
  const filenameToAtlas = new Map<string, { atlasKey: string; stageFolder: string }>();

  // Process each stage
  for (const [stageFolder, atlasKey] of Object.entries(STAGE_MAP)) {
    const stageDir = path.join(SPRITE_SHEETS_DIR, stageFolder);

    if (!fs.existsSync(stageDir)) {
      console.warn(`WARNING: Stage directory not found, skipping: ${stageDir}`);
      continue;
    }

    const pngFiles = fs
      .readdirSync(stageDir)
      .filter((f) => f.toLowerCase().endsWith('.png'))
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    if (pngFiles.length === 0) {
      console.warn(`WARNING: No PNG files in ${stageDir}, skipping.`);
      continue;
    }

    console.log(`Processing "${stageFolder}" (${atlasKey}): ${pngFiles.length} sprite sheets`);

    // Register each file for the atlas lookup
    for (const file of pngFiles) {
      const baseName = stripExtension(file);
      filenameToAtlas.set(baseName, { atlasKey, stageFolder });
    }

    // Collect all frames
    const frames: FrameDescriptor[] = [];
    for (const file of pngFiles) {
      const baseName = stripExtension(file);
      const sheetPath = path.join(stageDir, file);

      for (let frameIdx = 0; frameIdx < FRAMES_PER_SHEET; frameIdx++) {
        const col = frameIdx % SHEET_COLS;
        const row = Math.floor(frameIdx / SHEET_COLS);
        frames.push({
          name: `${baseName}_${frameIdx}`,
          sheetPath,
          sx: col * FRAME_W,
          sy: row * FRAME_H,
        });
      }
    }

    const totalFrames = frames.length;
    const atlasCols = Math.ceil(Math.sqrt(totalFrames));
    const atlasRows = Math.ceil(totalFrames / atlasCols);
    const atlasW = atlasCols * FRAME_W;
    const atlasH = atlasRows * FRAME_H;

    if (atlasW > MAX_ATLAS_SIZE || atlasH > MAX_ATLAS_SIZE) {
      console.error(
        `ERROR: Atlas "${atlasKey}" would be ${atlasW}x${atlasH}, exceeding ${MAX_ATLAS_SIZE}x${MAX_ATLAS_SIZE}. ` +
          `Consider splitting the stage into multiple atlases.`,
      );
      continue;
    }

    console.log(
      `  ${totalFrames} frames -> ${atlasCols}x${atlasRows} grid (${atlasW}x${atlasH}px)`,
    );

    // Extract all frames into raw RGBA buffers
    // We batch-read each unique sheet once and extract all its frames
    const sheetCache = new Map<string, sharp.Sharp>();
    const composites: sharp.OverlayOptions[] = [];
    const jsonFrames: Record<string, PhaserFrameHash> = {};

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      const destCol = i % atlasCols;
      const destRow = Math.floor(i / atlasCols);
      const destX = destCol * FRAME_W;
      const destY = destRow * FRAME_H;

      // Get or create the sharp instance for this sheet
      if (!sheetCache.has(frame.sheetPath)) {
        sheetCache.set(frame.sheetPath, sharp(frame.sheetPath).ensureAlpha());
      }

      // Extract the 16x16 region from the sprite sheet
      const extracted = await sheetCache
        .get(frame.sheetPath)!
        .clone()
        .extract({
          left: frame.sx,
          top: frame.sy,
          width: FRAME_W,
          height: FRAME_H,
        })
        .png()
        .toBuffer();

      composites.push({
        input: extracted,
        left: destX,
        top: destY,
      });

      // JSON Hash entry
      jsonFrames[frame.name] = {
        frame: { x: destX, y: destY, w: FRAME_W, h: FRAME_H },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: FRAME_W, h: FRAME_H },
        sourceSize: { w: FRAME_W, h: FRAME_H },
      };
    }

    // Compose the atlas image
    const atlasPng = await sharp({
      create: {
        width: atlasW,
        height: atlasH,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite(composites)
      .png()
      .toBuffer();

    // Write atlas PNG
    const pngOutPath = path.join(ATLAS_OUTPUT_DIR, `${atlasKey}.png`);
    fs.writeFileSync(pngOutPath, atlasPng);
    console.log(`  Written: ${pngOutPath}`);

    // Write JSON descriptor
    const jsonOutPath = path.join(ATLAS_OUTPUT_DIR, `${atlasKey}.json`);
    const jsonData = JSON.stringify({ frames: jsonFrames }, null, 2);
    fs.writeFileSync(jsonOutPath, jsonData, 'utf-8');
    console.log(`  Written: ${jsonOutPath}`);
  }

  // ---------------------------------------------------------------------------
  // Generate SpriteAtlasData.ts
  // ---------------------------------------------------------------------------
  console.log('\nGenerating SpriteAtlasData.ts...');

  const preloadSource = fs.readFileSync(PRELOAD_SCENE_PATH, 'utf-8');
  const spriteKeyMap = parseSpriteKeyMap(preloadSource);
  console.log(`  Found ${spriteKeyMap.size} sprite keys in PreloadScene.ts`);

  // For each game key, check if we have a matching sprite sheet
  const entries: { key: string; atlas: string; prefix: string }[] = [];
  let matched = 0;
  let unmatched = 0;

  for (const [gameKey, fileBaseName] of spriteKeyMap) {
    const atlasInfo = filenameToAtlas.get(fileBaseName);
    if (atlasInfo) {
      entries.push({ key: gameKey, atlas: atlasInfo.atlasKey, prefix: fileBaseName });
      matched++;
    } else {
      unmatched++;
    }
  }

  console.log(`  Matched: ${matched}, No atlas coverage: ${unmatched}`);

  // Sort entries by key for stable output
  entries.sort((a, b) => a.key.localeCompare(b.key));

  // Build the TS source
  const atlasKeys = Object.values(STAGE_MAP).sort();
  const mapEntries = entries
    .map((e) => `  ${quoteKey(e.key)}: { atlas: '${e.atlas}', prefix: '${escapeStr(e.prefix)}' },`)
    .join('\n');

  const tsSource = `// Auto-generated by scripts/generate-atlases.ts — DO NOT EDIT

export interface AtlasEntry {
  atlas: string;    // e.g. 'atlas_child'
  prefix: string;   // e.g. 'Agumon' (frame prefix in atlas JSON)
}

/** Map from game sprite key to atlas info. Only includes sprites that have atlas coverage. */
export const SPRITE_ATLAS_MAP: Record<string, AtlasEntry> = {
${mapEntries}
};

export const ATLAS_KEYS = [
${atlasKeys.map((k) => `  '${k}',`).join('\n')}
] as const;
`;

  fs.writeFileSync(SPRITE_ATLAS_DATA_PATH, tsSource, 'utf-8');
  console.log(`  Written: ${SPRITE_ATLAS_DATA_PATH}`);

  console.log('\nDone!');
}

/** Quote a key if it contains special characters, otherwise return bare */
function quoteKey(key: string): string {
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
    return key;
  }
  return `'${escapeStr(key)}'`;
}

/** Escape single quotes in a string */
function escapeStr(s: string): string {
  return s.replace(/'/g, "\\'");
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
