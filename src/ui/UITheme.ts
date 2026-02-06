// =============================================================================
// UITheme.ts — Centralized design tokens for the "Digital World Interface" aesthetic
// =============================================================================

// COLOR PALETTE
export const COLORS = {
  // Backgrounds (dark layers)
  BG_DEEPEST: 0x0a0a18,
  BG_DARK: 0x0d0d1a,
  BG_PANEL: 0x12122a,
  BG_PANEL_LIGHT: 0x1a1a38,
  BG_HOVER: 0x222250,

  // Primary accent (cyan)
  CYAN: 0x00ccff,
  CYAN_DIM: 0x006688,
  CYAN_GLOW: 0x00ccff,

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

  // Functional colors
  SUCCESS: 0x33aa55,
  SUCCESS_HOVER: 0x44cc66,
  SUCCESS_PRESS: 0x228844,
  DANGER: 0xaa3333,
  DANGER_HOVER: 0xcc4444,
  DANGER_PRESS: 0x882222,
  SPECIAL: 0x6633aa,
  SPECIAL_HOVER: 0x8844dd,
  SPECIAL_PRESS: 0x552288,
  PRIMARY: 0x2244aa,
  PRIMARY_HOVER: 0x3366cc,
  PRIMARY_PRESS: 0x1a3388,
  MERGE: 0x227788,
  MERGE_HOVER: 0x33aacc,
  MERGE_PRESS: 0x1a5566,
  DISABLED: 0x1a1a22,
  DISABLED_TEXT: '#555566',

  // Text
  TEXT_WHITE: '#ffffff',
  TEXT_DIM: '#8888aa',
  TEXT_LABEL: '#9999bb',
  TEXT_VALUE: '#ffffff',
  TEXT_GOLD: '#ffdd44',
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

// TYPOGRAPHY
export const FONTS = {
  DISPLAY: '"Trebuchet MS", "Segoe UI", Verdana, sans-serif',
  MONO: '"Courier New", Consolas, monospace',
};

export const TEXT_STYLES = {
  SCENE_TITLE: { fontFamily: FONTS.DISPLAY, fontSize: '52px', color: '#00ccff', fontStyle: 'bold', stroke: '#003344', strokeThickness: 4 },
  SCENE_SUBTITLE: { fontFamily: FONTS.DISPLAY, fontSize: '18px', color: '#8888aa' },
  HUD_LABEL: { fontFamily: FONTS.DISPLAY, fontSize: '14px', color: '#9999bb' },
  HUD_VALUE: { fontFamily: FONTS.MONO, fontSize: '20px', color: '#ffffff', fontStyle: 'bold' },
  PANEL_TITLE: { fontFamily: FONTS.DISPLAY, fontSize: '18px', color: '#00ccff', fontStyle: 'bold' },
  PANEL_LABEL: { fontFamily: FONTS.DISPLAY, fontSize: '13px', color: '#9999bb' },
  PANEL_VALUE: { fontFamily: FONTS.MONO, fontSize: '13px', color: '#ffffff' },
  BUTTON: { fontFamily: FONTS.DISPLAY, fontSize: '16px', color: '#ffffff', fontStyle: 'bold' },
  BUTTON_SM: { fontFamily: FONTS.DISPLAY, fontSize: '13px', color: '#ffffff', fontStyle: 'bold' },
  MODAL_TITLE: { fontFamily: FONTS.DISPLAY, fontSize: '24px', color: '#ffdd44', fontStyle: 'bold' },
  VERSION: { fontFamily: FONTS.MONO, fontSize: '12px', color: '#555566' },
};

// ANIMATION CONFIGS
export const ANIM = {
  PANEL_SLIDE_MS: 280,
  PANEL_SLIDE_EASE: 'Cubic.easeOut',
  MODAL_POP_MS: 320,
  MODAL_POP_EASE: 'Back.easeOut',
  BUTTON_HOVER_MS: 100,
  BUTTON_PRESS_MS: 80,
  GLOW_PULSE_MS: 1500,
  FADE_IN_MS: 400,
};
