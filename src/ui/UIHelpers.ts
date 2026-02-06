// =============================================================================
// UIHelpers.ts — Shared drawing + animation utilities
// =============================================================================

import Phaser from 'phaser';
import { COLORS, ANIM } from './UITheme';

// --- Drawing ---

/** Draw a 4-layer panel: outer glow -> dark edge -> inner fill -> bright border */
export function drawPanel(
  g: Phaser.GameObjects.Graphics,
  x: number, y: number, w: number, h: number,
  opts?: { borderColor?: number; borderAlpha?: number; radius?: number; fillAlpha?: number },
): void {
  const r = opts?.radius ?? 10;
  const bc = opts?.borderColor ?? COLORS.CYAN;
  const ba = opts?.borderAlpha ?? 0.8;
  const fa = opts?.fillAlpha ?? 0.96;
  g.clear();
  // Layer 1: outer glow (larger, low alpha)
  g.fillStyle(bc, 0.06);
  g.fillRoundedRect(x - 4, y - 4, w + 8, h + 8, r + 2);
  // Layer 2: dark edge
  g.fillStyle(COLORS.BG_DARK, 1);
  g.fillRoundedRect(x - 1, y - 1, w + 2, h + 2, r);
  // Layer 3: inner fill
  g.fillStyle(COLORS.BG_PANEL, fa);
  g.fillRoundedRect(x, y, w, h, r);
  // Layer 4: bright border
  g.lineStyle(1.5, bc, ba);
  g.strokeRoundedRect(x, y, w, h, r);
}

/** Draw a button background (centered at origin) */
export function drawButton(
  g: Phaser.GameObjects.Graphics,
  w: number, h: number, color: number,
  opts?: { radius?: number; glowRing?: boolean },
): void {
  const r = opts?.radius ?? 6;
  g.clear();
  if (opts?.glowRing) {
    g.fillStyle(color, 0.15);
    g.fillRoundedRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6, r + 2);
  }
  g.fillStyle(color, 1);
  g.fillRoundedRect(-w / 2, -h / 2, w, h, r);
  g.lineStyle(1, 0xffffff, 0.1);
  g.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
}

/** Draw a glowing horizontal separator */
export function drawSeparator(
  g: Phaser.GameObjects.Graphics,
  x1: number, y: number, x2: number,
  color?: number,
): void {
  const c = color ?? COLORS.CYAN;
  g.lineStyle(3, c, 0.08);
  g.lineBetween(x1, y, x2, y);
  g.lineStyle(1, c, 0.3);
  g.lineBetween(x1, y, x2, y);
}

/** Draw a faint digital grid texture on a Graphics object */
export function drawDigitalGrid(
  g: Phaser.GameObjects.Graphics,
  w: number, h: number,
  spacing?: number, color?: number, alpha?: number,
): void {
  const s = spacing ?? 40;
  const c = color ?? COLORS.CYAN;
  const a = alpha ?? 0.04;
  g.lineStyle(1, c, a);
  for (let x = 0; x <= w; x += s) g.lineBetween(x, 0, x, h);
  for (let y = 0; y <= h; y += s) g.lineBetween(0, y, w, y);
}

// --- Animations ---

/** Slide a container in from the right */
export function animateSlideIn(scene: Phaser.Scene, target: Phaser.GameObjects.Container, finalX: number): void {
  scene.tweens.killTweensOf(target);
  target.setVisible(true);
  target.x = finalX + 300;
  target.alpha = 0;
  scene.tweens.add({
    targets: target, x: finalX, alpha: 1,
    duration: ANIM.PANEL_SLIDE_MS, ease: ANIM.PANEL_SLIDE_EASE,
  });
}

/** Slide a container out to the right, then hide */
export function animateSlideOut(scene: Phaser.Scene, target: Phaser.GameObjects.Container, finalX: number): void {
  scene.tweens.killTweensOf(target);
  scene.tweens.add({
    targets: target, x: finalX + 300, alpha: 0,
    duration: ANIM.PANEL_SLIDE_MS, ease: 'Cubic.easeIn',
    onComplete: () => target.setVisible(false),
  });
}

/** Pop a container in from center (scale + fade) */
export function animateModalIn(scene: Phaser.Scene, target: Phaser.GameObjects.Container): void {
  scene.tweens.killTweensOf(target);
  target.setVisible(true);
  target.setScale(0.7);
  target.alpha = 0;
  scene.tweens.add({
    targets: target, scaleX: 1, scaleY: 1, alpha: 1,
    duration: ANIM.MODAL_POP_MS, ease: ANIM.MODAL_POP_EASE,
  });
}

/** Pop a container out (scale down + fade) */
export function animateModalOut(scene: Phaser.Scene, target: Phaser.GameObjects.Container): void {
  scene.tweens.killTweensOf(target);
  scene.tweens.add({
    targets: target, scaleX: 0.7, scaleY: 0.7, alpha: 0,
    duration: 200, ease: 'Cubic.easeIn',
    onComplete: () => target.setVisible(false),
  });
}

/** Hover scale effect for a button container */
export function animateButtonHover(scene: Phaser.Scene, btn: Phaser.GameObjects.Container, hovering: boolean): void {
  scene.tweens.killTweensOf(btn);
  scene.tweens.add({
    targets: btn, scaleX: hovering ? 1.04 : 1, scaleY: hovering ? 1.04 : 1,
    duration: ANIM.BUTTON_HOVER_MS, ease: 'Cubic.easeOut',
  });
}

/** Press bounce for a button container */
export function animateButtonPress(scene: Phaser.Scene, btn: Phaser.GameObjects.Container): void {
  scene.tweens.killTweensOf(btn);
  scene.tweens.add({
    targets: btn, scaleX: 0.95, scaleY: 0.95,
    duration: ANIM.BUTTON_PRESS_MS, ease: 'Cubic.easeOut',
    yoyo: true,
  });
}
