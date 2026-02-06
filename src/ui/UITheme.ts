// =============================================================================
// UITheme.ts — Centralized design tokens for the "Digital World Interface" aesthetic
// =============================================================================

// COLOR PALETTE
export const COLORS = {
  // Backgrounds (dark layers with blue-purple undertone)
  BG_DEEPEST: 0x060614,
  BG_DARK: 0x0a0a1e,
  BG_PANEL: 0x101030,
  BG_PANEL_LIGHT: 0x181848,
  BG_HOVER: 0x222266,
  BG_CARD: 0x141438,

  // Primary accent (cyan)
  CYAN: 0x00ddff,
  CYAN_DIM: 0x0088aa,
  CYAN_GLOW: 0x00eeff,
  CYAN_BRIGHT: 0x66f0ff,

  // Secondary accent (gold/amber)
  GOLD: 0xffc844,
  GOLD_DIM: 0xaa8833,
  GOLD_BRIGHT: 0xffdd66,

  // Attribute colors (hex number for Graphics)
  VACCINE: 0x33ee77,
  DATA: 0x00bbff,
  VIRUS: 0xff44cc,
  FREE: 0xffcc33,

  // Attribute colors (hex string for Text)
  VACCINE_STR: '#33ee77',
  DATA_STR: '#00bbff',
  VIRUS_STR: '#ff44cc',
  FREE_STR: '#ffcc33',

  // Functional colors — richer palette with better depth
  SUCCESS: 0x22aa55,
  SUCCESS_HOVER: 0x33cc66,
  SUCCESS_PRESS: 0x1a884a,
  SUCCESS_GLOW: 0x44ee88,
  DANGER: 0xcc3344,
  DANGER_HOVER: 0xee4455,
  DANGER_PRESS: 0x992233,
  DANGER_GLOW: 0xff6677,
  SPECIAL: 0x7744cc,
  SPECIAL_HOVER: 0x9955ee,
  SPECIAL_PRESS: 0x553399,
  SPECIAL_GLOW: 0xbb88ff,
  PRIMARY: 0x2255bb,
  PRIMARY_HOVER: 0x3377dd,
  PRIMARY_PRESS: 0x1a4499,
  PRIMARY_GLOW: 0x4499ff,
  MERGE: 0x228899,
  MERGE_HOVER: 0x33bbdd,
  MERGE_PRESS: 0x1a6677,
  MERGE_GLOW: 0x44ddff,
  DISABLED: 0x161622,
  DISABLED_TEXT: '#444466',

  // Text
  TEXT_WHITE: '#ffffff',
  TEXT_DIM: '#7788aa',
  TEXT_LABEL: '#8899bb',
  TEXT_VALUE: '#ffffff',
  TEXT_GOLD: '#ffcc44',
  TEXT_LIVES: '#ff6666',
  TEXT_CURRENCY: '#ffdd44',

  // Grid
  GRID_PATH: 0x2a1a10,
  GRID_SLOT: 0x0e1e0e,
  GRID_SLOT_BORDER: 0x1a2a1a,
  GRID_SLOT_DOT: 0x00ccff,
  GRID_SPAWN: 0x00aa44,
  GRID_BASE: 0xaa2222,
  PATH_LINE: 0x886633,

  // Borders & separators
  BORDER_PANEL: 0x00ccff,
  BORDER_BUTTON: 0x4466aa,
  SEPARATOR: 0x00ccff,

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

// TYPOGRAPHY — distinctive choices for a Digital World aesthetic
// Georgia for elegant display text, Consolas for data readability
export const FONTS = {
  DISPLAY: 'Georgia, "Palatino Linotype", "Book Antiqua", serif',
  BODY: '"Segoe UI", Tahoma, Geneva, sans-serif',
  MONO: 'Consolas, "Lucida Console", "Courier New", monospace',
};

export const TEXT_STYLES = {
  SCENE_TITLE: {
    fontFamily: FONTS.DISPLAY,
    fontSize: '48px',
    color: '#00ddff',
    fontStyle: 'bold',
    stroke: '#002233',
    strokeThickness: 5,
    shadow: { offsetX: 0, offsetY: 3, color: '#001122', blur: 8, fill: true },
  } as Phaser.Types.GameObjects.Text.TextStyle,
  SCENE_SUBTITLE: {
    fontFamily: FONTS.BODY,
    fontSize: '17px',
    color: '#8899bb',
    shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 4, fill: true },
  } as Phaser.Types.GameObjects.Text.TextStyle,
  HUD_LABEL: {
    fontFamily: FONTS.BODY,
    fontSize: '12px',
    color: '#7788aa',
    letterSpacing: 2,
  } as Phaser.Types.GameObjects.Text.TextStyle,
  HUD_VALUE: {
    fontFamily: FONTS.MONO,
    fontSize: '20px',
    color: '#ffffff',
    fontStyle: 'bold',
    shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 3, fill: true },
  } as Phaser.Types.GameObjects.Text.TextStyle,
  PANEL_TITLE: {
    fontFamily: FONTS.DISPLAY,
    fontSize: '17px',
    color: '#00ddff',
    fontStyle: 'bold',
  } as Phaser.Types.GameObjects.Text.TextStyle,
  PANEL_LABEL: {
    fontFamily: FONTS.BODY,
    fontSize: '12px',
    color: '#8899bb',
  } as Phaser.Types.GameObjects.Text.TextStyle,
  PANEL_VALUE: {
    fontFamily: FONTS.MONO,
    fontSize: '13px',
    color: '#ffffff',
  } as Phaser.Types.GameObjects.Text.TextStyle,
  BUTTON: {
    fontFamily: FONTS.BODY,
    fontSize: '16px',
    color: '#ffffff',
    fontStyle: 'bold',
    shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 2, fill: true },
  } as Phaser.Types.GameObjects.Text.TextStyle,
  BUTTON_SM: {
    fontFamily: FONTS.BODY,
    fontSize: '13px',
    color: '#ffffff',
    fontStyle: 'bold',
  } as Phaser.Types.GameObjects.Text.TextStyle,
  MODAL_TITLE: {
    fontFamily: FONTS.DISPLAY,
    fontSize: '26px',
    color: '#ffdd44',
    fontStyle: 'bold',
    stroke: '#332200',
    strokeThickness: 3,
    shadow: { offsetX: 0, offsetY: 2, color: '#221100', blur: 6, fill: true },
  } as Phaser.Types.GameObjects.Text.TextStyle,
  VERSION: {
    fontFamily: FONTS.MONO,
    fontSize: '11px',
    color: '#445566',
  } as Phaser.Types.GameObjects.Text.TextStyle,
};

// ANIMATION CONFIGS — slightly refined timings for better feel
export const ANIM = {
  PANEL_SLIDE_MS: 300,
  PANEL_SLIDE_EASE: 'Cubic.easeOut',
  MODAL_POP_MS: 350,
  MODAL_POP_EASE: 'Back.easeOut',
  BUTTON_HOVER_MS: 120,
  BUTTON_PRESS_MS: 80,
  GLOW_PULSE_MS: 1500,
  FADE_IN_MS: 500,
  STAGGER_MS: 60,         // Delay between staggered items
  ENTRANCE_OFFSET: 40,    // Pixels to slide in from
};
