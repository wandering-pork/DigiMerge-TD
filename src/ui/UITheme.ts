// =============================================================================
// UITheme.ts — Centralized design tokens for the "Digital Sunrise" aesthetic
// Warm amber/teal palette with deep indigo backgrounds
// =============================================================================

// COLOR PALETTE
export const COLORS = {
  // Backgrounds (deep indigo-charcoal)
  BG_DEEPEST: 0x0f0a14,
  BG_DARK: 0x1a1020,
  BG_PANEL: 0x1e1428,
  BG_PANEL_LIGHT: 0x2a1e36,
  BG_HOVER: 0x3a2848,
  BG_CARD: 0x221830,

  // Primary accent (warm amber)
  AMBER: 0xff9944,
  AMBER_DIM: 0xbb6622,
  AMBER_GLOW: 0xffaa55,
  AMBER_BRIGHT: 0xffbb66,

  // Legacy CYAN aliases → now amber (for backward compat in code)
  CYAN: 0xff9944,
  CYAN_DIM: 0xbb6622,
  CYAN_GLOW: 0xffaa55,
  CYAN_BRIGHT: 0xffbb66,

  // Secondary accent (cool teal)
  TEAL: 0x44ccbb,
  TEAL_DIM: 0x338899,
  TEAL_BRIGHT: 0x66eedd,

  // Tertiary accent (gold — keep for special highlights)
  GOLD: 0xffc844,
  GOLD_DIM: 0xaa8833,
  GOLD_BRIGHT: 0xffdd66,

  // Attribute colors (keep distinctive for gameplay clarity)
  VACCINE: 0x33ee77,
  DATA: 0x44aaff,
  VIRUS: 0xff44cc,
  FREE: 0xffcc33,

  // Attribute colors (hex string for Text)
  VACCINE_STR: '#33ee77',
  DATA_STR: '#44aaff',
  VIRUS_STR: '#ff44cc',
  FREE_STR: '#ffcc33',

  // Functional colors — warmer palette
  SUCCESS: 0x33aa55,
  SUCCESS_HOVER: 0x44cc66,
  SUCCESS_PRESS: 0x228844,
  SUCCESS_GLOW: 0x55ee88,
  DANGER: 0xcc4444,
  DANGER_HOVER: 0xee5555,
  DANGER_PRESS: 0x993333,
  DANGER_GLOW: 0xff7777,
  SPECIAL: 0x8844cc,
  SPECIAL_HOVER: 0xaa55ee,
  SPECIAL_PRESS: 0x663399,
  SPECIAL_GLOW: 0xcc88ff,
  PRIMARY: 0x3355bb,
  PRIMARY_HOVER: 0x4477dd,
  PRIMARY_PRESS: 0x224499,
  PRIMARY_GLOW: 0x5599ff,
  MERGE: 0x339988,
  MERGE_HOVER: 0x44bbcc,
  MERGE_PRESS: 0x227766,
  MERGE_GLOW: 0x55ddee,
  DISABLED: 0x1a1422,
  DISABLED_TEXT: '#554466',

  // Text — warm whites and warm grays
  TEXT_WHITE: '#fff8f0',
  TEXT_DIM: '#aa9988',
  TEXT_LABEL: '#ccaa88',
  TEXT_VALUE: '#fff8f0',
  TEXT_GOLD: '#ffcc44',
  TEXT_LIVES: '#ff6666',
  TEXT_CURRENCY: '#ffdd44',

  // Grid — warm earth tones
  GRID_PATH: 0x2a1a10,
  GRID_SLOT: 0x0e1e0e,
  GRID_SLOT_BORDER: 0x1a2a1a,
  GRID_SLOT_DOT: 0xff9944,
  GRID_SPAWN: 0x00aa44,
  GRID_BASE: 0xaa2222,
  PATH_LINE: 0x886633,

  // Borders & separators — amber tinted
  BORDER_PANEL: 0xff9944,
  BORDER_BUTTON: 0x664422,
  SEPARATOR: 0xff9944,

  // Overlay
  OVERLAY_BLACK: 0x000000,

  // Inner highlight for buttons (top edge glint)
  BUTTON_HIGHLIGHT: 0xffffff,
};

// ATTRIBUTE_COLORS map (replaces duplicated definitions)
export const ATTRIBUTE_COLORS_NUM: Record<number, number> = {
  0: COLORS.VACCINE,
  1: COLORS.DATA,
  2: COLORS.VIRUS,
  3: COLORS.FREE,
};
export const ATTRIBUTE_COLORS_STR: Record<number, string> = {
  0: COLORS.VACCINE_STR,
  1: COLORS.DATA_STR,
  2: COLORS.VIRUS_STR,
  3: COLORS.FREE_STR,
};

// TYPOGRAPHY — Digital Sunrise aesthetic
// Playfair Display for elegant display, Inter for clean body, Fira Code for data
export const FONTS = {
  DISPLAY: '"Pixel Digivolve", "Playfair Display", Georgia, serif',
  BODY: 'Inter, "Segoe UI", Tahoma, sans-serif',
  MONO: '"Fira Code", Consolas, "Courier New", monospace',
};

export const TEXT_STYLES = {
  SCENE_TITLE: {
    fontFamily: FONTS.DISPLAY,
    fontSize: '48px',
    color: '#ff9944',
    fontStyle: 'bold',
    stroke: '#221100',
    strokeThickness: 5,
    shadow: { offsetX: 0, offsetY: 3, color: '#110800', blur: 8, fill: true },
    resolution: 2,
  } as Phaser.Types.GameObjects.Text.TextStyle,
  SCENE_SUBTITLE: {
    fontFamily: FONTS.BODY,
    fontSize: '17px',
    color: '#ccaa88',
    shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 4, fill: true },
    resolution: 2,
  } as Phaser.Types.GameObjects.Text.TextStyle,
  HUD_LABEL: {
    fontFamily: FONTS.BODY,
    fontSize: '12px',
    color: '#ccaa88',
    letterSpacing: 2,
    resolution: 2,
  } as Phaser.Types.GameObjects.Text.TextStyle,
  HUD_VALUE: {
    fontFamily: FONTS.MONO,
    fontSize: '20px',
    color: '#fff8f0',
    fontStyle: 'bold',
    shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 3, fill: true },
    resolution: 2,
  } as Phaser.Types.GameObjects.Text.TextStyle,
  PANEL_TITLE: {
    fontFamily: FONTS.DISPLAY,
    fontSize: '17px',
    color: '#ff9944',
    fontStyle: 'bold',
    resolution: 2,
  } as Phaser.Types.GameObjects.Text.TextStyle,
  PANEL_LABEL: {
    fontFamily: FONTS.BODY,
    fontSize: '14px',
    color: '#ccaa88',
    resolution: 2,
  } as Phaser.Types.GameObjects.Text.TextStyle,
  PANEL_VALUE: {
    fontFamily: FONTS.MONO,
    fontSize: '15px',
    color: '#fff8f0',
    resolution: 2,
  } as Phaser.Types.GameObjects.Text.TextStyle,
  BUTTON: {
    fontFamily: FONTS.BODY,
    fontSize: '16px',
    color: '#fff8f0',
    fontStyle: 'bold',
    shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 2, fill: true },
    resolution: 2,
  } as Phaser.Types.GameObjects.Text.TextStyle,
  BUTTON_SM: {
    fontFamily: FONTS.BODY,
    fontSize: '13px',
    color: '#fff8f0',
    fontStyle: 'bold',
    resolution: 2,
  } as Phaser.Types.GameObjects.Text.TextStyle,
  MODAL_TITLE: {
    fontFamily: FONTS.DISPLAY,
    fontSize: '26px',
    color: '#ffcc44',
    fontStyle: 'bold',
    stroke: '#332200',
    strokeThickness: 3,
    shadow: { offsetX: 0, offsetY: 2, color: '#221100', blur: 6, fill: true },
    resolution: 2,
  } as Phaser.Types.GameObjects.Text.TextStyle,
  VERSION: {
    fontFamily: FONTS.MONO,
    fontSize: '11px',
    color: '#665544',
    resolution: 2,
  } as Phaser.Types.GameObjects.Text.TextStyle,
};

// ANIMATION CONFIGS
export const ANIM = {
  PANEL_SLIDE_MS: 300,
  PANEL_SLIDE_EASE: 'Cubic.easeOut',
  MODAL_POP_MS: 350,
  MODAL_POP_EASE: 'Back.easeOut',
  BUTTON_HOVER_MS: 120,
  BUTTON_PRESS_MS: 80,
  GLOW_PULSE_MS: 1500,
  FADE_IN_MS: 500,
  STAGGER_MS: 60,
  ENTRANCE_OFFSET: 40,
};
