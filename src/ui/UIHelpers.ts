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
  const r = opts?.radius ?? 12;
  const bc = opts?.borderColor ?? COLORS.CYAN;
  const ba = opts?.borderAlpha ?? 0.7;
  const fa = opts?.fillAlpha ?? 0.97;
  g.clear();
  // Layer 1: outer glow (larger, low alpha)
  g.fillStyle(bc, 0.05);
  g.fillRoundedRect(x - 6, y - 6, w + 12, h + 12, r + 4);
  // Layer 2: dark edge
  g.fillStyle(COLORS.BG_DARK, 1);
  g.fillRoundedRect(x - 1, y - 1, w + 2, h + 2, r);
  // Layer 3: inner fill with subtle gradient effect (two-tone)
  g.fillStyle(COLORS.BG_PANEL, fa);
  g.fillRoundedRect(x, y, w, h, r);
  // Layer 3b: slight top highlight for depth
  g.fillStyle(0xffffff, 0.02);
  g.fillRoundedRect(x + 2, y + 2, w - 4, h / 3, { tl: r - 2, tr: r - 2, bl: 0, br: 0 });
  // Layer 4: bright border
  g.lineStyle(1.5, bc, ba);
  g.strokeRoundedRect(x, y, w, h, r);
}

/** Draw a button background (centered at origin) with gradient-like depth */
export function drawButton(
  g: Phaser.GameObjects.Graphics,
  w: number, h: number, color: number,
  opts?: { radius?: number; glowRing?: boolean },
): void {
  const r = opts?.radius ?? 8;
  g.clear();
  if (opts?.glowRing) {
    g.fillStyle(color, 0.12);
    g.fillRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, r + 3);
  }
  // Main fill
  g.fillStyle(color, 1);
  g.fillRoundedRect(-w / 2, -h / 2, w, h, r);
  // Top highlight for 3D feel
  g.fillStyle(0xffffff, 0.08);
  g.fillRoundedRect(-w / 2 + 2, -h / 2 + 1, w - 4, h * 0.4, { tl: r - 1, tr: r - 1, bl: 0, br: 0 });
  // Bottom darkening
  g.fillStyle(0x000000, 0.12);
  g.fillRoundedRect(-w / 2 + 2, -h / 2 + h * 0.6, w - 4, h * 0.4 - 1, { tl: 0, tr: 0, bl: r - 1, br: r - 1 });
  // Subtle border
  g.lineStyle(1, 0xffffff, 0.08);
  g.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
}

/** Draw a glowing horizontal separator with centered fade */
export function drawSeparator(
  g: Phaser.GameObjects.Graphics,
  x1: number, y: number, x2: number,
  color?: number,
): void {
  const c = color ?? COLORS.CYAN;
  const mid = (x1 + x2) / 2;
  const halfW = (x2 - x1) / 2;
  // Soft glow line (wider)
  g.lineStyle(3, c, 0.06);
  g.lineBetween(x1, y, x2, y);
  // Crisp center line
  g.lineStyle(1, c, 0.25);
  g.lineBetween(x1, y, x2, y);
  // Bright center dot
  g.fillStyle(c, 0.4);
  g.fillCircle(mid, y, 2);
}

/** Draw a faint digital grid texture on a Graphics object */
export function drawDigitalGrid(
  g: Phaser.GameObjects.Graphics,
  w: number, h: number,
  spacing?: number, color?: number, alpha?: number,
): void {
  const s = spacing ?? 40;
  const c = color ?? COLORS.CYAN;
  const a = alpha ?? 0.03;
  g.lineStyle(1, c, a);
  for (let x = 0; x <= w; x += s) g.lineBetween(x, 0, x, h);
  for (let y = 0; y <= h; y += s) g.lineBetween(0, y, w, y);

  // Add subtle cross-hatch at intersections for digital texture
  g.fillStyle(c, a * 1.5);
  for (let x = 0; x <= w; x += s) {
    for (let y = 0; y <= h; y += s) {
      g.fillRect(x - 1, y - 1, 2, 2);
    }
  }
}

/** Draw floating digital particles across a scene (returns array of created objects for cleanup) */
export function createDigitalParticles(
  scene: Phaser.Scene,
  w: number, h: number,
  count?: number,
  color?: number,
): Phaser.GameObjects.Graphics[] {
  const particles: Phaser.GameObjects.Graphics[] = [];
  const n = count ?? 20;
  const c = color ?? COLORS.CYAN;

  for (let i = 0; i < n; i++) {
    const p = scene.add.graphics();
    const size = 1 + Math.random() * 2;
    const alpha = 0.1 + Math.random() * 0.2;
    p.fillStyle(c, alpha);
    p.fillCircle(0, 0, size);

    const startX = Math.random() * w;
    const startY = Math.random() * h;
    p.setPosition(startX, startY);
    p.setDepth(0.5);

    // Floating animation
    scene.tweens.add({
      targets: p,
      y: startY - 30 - Math.random() * 60,
      alpha: { from: alpha, to: 0 },
      duration: 4000 + Math.random() * 6000,
      repeat: -1,
      delay: Math.random() * 4000,
      onRepeat: () => {
        p.setPosition(Math.random() * w, h + 10);
      },
    });

    particles.push(p);
  }

  return particles;
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
    targets: target, scaleX: 0.85, scaleY: 0.85, alpha: 0,
    duration: 200, ease: 'Cubic.easeIn',
    onComplete: () => target.setVisible(false),
  });
}

/** Hover scale effect for a button container */
export function animateButtonHover(scene: Phaser.Scene, btn: Phaser.GameObjects.Container, hovering: boolean): void {
  scene.tweens.killTweensOf(btn);
  scene.tweens.add({
    targets: btn, scaleX: hovering ? 1.05 : 1, scaleY: hovering ? 1.05 : 1,
    duration: ANIM.BUTTON_HOVER_MS, ease: 'Cubic.easeOut',
  });
}

/** Press bounce for a button container */
export function animateButtonPress(scene: Phaser.Scene, btn: Phaser.GameObjects.Container): void {
  scene.tweens.killTweensOf(btn);
  scene.tweens.add({
    targets: btn, scaleX: 0.93, scaleY: 0.93,
    duration: ANIM.BUTTON_PRESS_MS, ease: 'Cubic.easeOut',
    yoyo: true,
  });
}

/** Staggered fade-in for a list of game objects */
export function animateStaggeredEntrance(
  scene: Phaser.Scene,
  targets: Phaser.GameObjects.GameObject[],
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
): void {
  const offset = ANIM.ENTRANCE_OFFSET;

  targets.forEach((target, i) => {
    const obj = target as any;
    const finalX = obj.x;
    const finalY = obj.y;

    // Set initial offset
    switch (direction) {
      case 'up': obj.y = finalY + offset; break;
      case 'down': obj.y = finalY - offset; break;
      case 'left': obj.x = finalX + offset; break;
      case 'right': obj.x = finalX - offset; break;
    }
    obj.alpha = 0;

    scene.tweens.add({
      targets: obj,
      x: finalX,
      y: finalY,
      alpha: 1,
      duration: 350,
      ease: 'Cubic.easeOut',
      delay: i * ANIM.STAGGER_MS,
    });
  });
}
