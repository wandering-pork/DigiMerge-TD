import Phaser from 'phaser';
import { COLORS, TEXT_STYLES, FONTS, ANIM } from './UITheme';
import { drawPanel, drawButton, animateButtonHover, animateButtonPress } from './UIHelpers';
import {
  GRID_OFFSET_X,
  GRID_OFFSET_Y,
  GRID,
  GAME_WIDTH,
  GAME_HEIGHT,
} from '@/config/Constants';

const TUTORIAL_STORAGE_KEY = 'digimerge_td_tutorial_complete';

export interface TutorialStep {
  text: string;
  highlightArea?: { x: number; y: number; w: number; h: number };
  arrowDir?: 'left' | 'right' | 'up' | 'down';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    text: 'Welcome to DigiMerge TD!\nEnemies follow the dirt path — defend your base!',
  },
  {
    text: 'Tap a green grass slot to place\nyour starter Digimon.',
    highlightArea: {
      x: GRID_OFFSET_X,
      y: GRID_OFFSET_Y,
      w: GRID.COLUMNS * GRID.CELL_SIZE,
      h: GRID.ROWS * GRID.CELL_SIZE,
    },
  },
  {
    text: 'Enemies are coming!\nYour Digimon attacks automatically.',
  },
  {
    text: 'Earn DigiBytes by defeating enemies.\nUse them to level up your towers!',
    highlightArea: {
      x: GRID_OFFSET_X + GRID.COLUMNS * GRID.CELL_SIZE + 15,
      y: 0,
      w: 270,
      h: 140,
    },
    arrowDir: 'right',
  },
  {
    text: 'Open the Spawn Menu to deploy\nmore Digimon on empty slots.',
  },
  {
    text: 'Merge same-attribute Digimon\nto gain DP for Digivolution!',
  },
  {
    text: 'At max level with enough DP,\nDigivolve into a stronger form!',
  },
  {
    text: 'Good luck, Tamer!\nThe Digital World is counting on you!',
  },
];

/**
 * TutorialOverlay shows a step-by-step tutorial on first game start.
 * Managed as a Phaser Container within the GameScene.
 */
export class TutorialOverlay extends Phaser.GameObjects.Container {
  private currentStep: number = 0;
  private overlay: Phaser.GameObjects.Graphics;
  private textBox: Phaser.GameObjects.Graphics;
  private stepText: Phaser.GameObjects.Text;
  private stepCounter: Phaser.GameObjects.Text;
  private nextBtn: Phaser.GameObjects.Container;
  private skipBtn: Phaser.GameObjects.Container;
  private arrowText: Phaser.GameObjects.Text;
  private onComplete: () => void;

  constructor(scene: Phaser.Scene, onComplete: () => void) {
    super(scene, 0, 0);
    this.onComplete = onComplete;
    this.setDepth(100);

    // Dark overlay
    this.overlay = scene.add.graphics();
    this.add(this.overlay);

    // Text box panel
    this.textBox = scene.add.graphics();
    this.add(this.textBox);

    // Step text
    this.stepText = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, '', {
      fontFamily: FONTS.BODY,
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 8,
      shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 4, fill: true },
    }).setOrigin(0.5);
    this.add(this.stepText);

    // Step counter
    this.stepCounter = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 140, '', {
      fontFamily: FONTS.MONO,
      fontSize: '12px',
      color: COLORS.TEXT_DIM,
    }).setOrigin(0.5);
    this.add(this.stepCounter);

    // Arrow indicator
    this.arrowText = scene.add.text(0, 0, '>', {
      fontFamily: FONTS.DISPLAY,
      fontSize: '28px',
      color: '#00ccff',
      fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 1, color: '#003344', blur: 6, fill: true },
    }).setOrigin(0.5).setVisible(false);
    this.add(this.arrowText);

    // Next button
    this.nextBtn = this.createButton(GAME_WIDTH / 2 + 80, GAME_HEIGHT / 2 + 180, 120, 40, 'Next', COLORS.PRIMARY, () => {
      this.advanceStep();
    });
    this.add(this.nextBtn);

    // Skip button
    this.skipBtn = this.createButton(GAME_WIDTH / 2 - 80, GAME_HEIGHT / 2 + 180, 120, 40, 'Skip', COLORS.BG_PANEL_LIGHT, () => {
      this.completeTutorial();
    });
    this.add(this.skipBtn);

    this.showStep(0);
  }

  /**
   * Check if the tutorial has been completed before.
   */
  public static isComplete(): boolean {
    try {
      return localStorage.getItem(TUTORIAL_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Mark the tutorial as complete.
   */
  public static markComplete(): void {
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Reset tutorial state (for testing).
   */
  public static reset(): void {
    try {
      localStorage.removeItem(TUTORIAL_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  private showStep(index: number): void {
    this.currentStep = index;
    const step = TUTORIAL_STEPS[index];

    // Draw overlay with cutout for highlighted area
    this.overlay.clear();
    this.overlay.fillStyle(0x000000, 0.7);
    this.overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Cut out highlight area
    if (step.highlightArea) {
      const { x, y, w, h } = step.highlightArea;
      this.overlay.fillStyle(0x000000, 0); // "erase" by drawing transparent
      // Actually we can't erase with Graphics, so use a blend approach:
      // Draw everything except the highlight
      this.overlay.clear();

      // Top band
      this.overlay.fillStyle(0x000000, 0.7);
      this.overlay.fillRect(0, 0, GAME_WIDTH, y);
      // Bottom band
      this.overlay.fillRect(0, y + h, GAME_WIDTH, GAME_HEIGHT - (y + h));
      // Left band
      this.overlay.fillRect(0, y, x, h);
      // Right band
      this.overlay.fillRect(x + w, y, GAME_WIDTH - (x + w), h);

      // Highlight border
      this.overlay.lineStyle(2, 0x00ccff, 0.8);
      this.overlay.strokeRect(x - 2, y - 2, w + 4, h + 4);
    }

    // Text box background
    const boxW = 420;
    const boxH = 140;
    const boxX = GAME_WIDTH / 2 - boxW / 2;
    const boxY = GAME_HEIGHT / 2 + 40;
    this.textBox.clear();
    drawPanel(this.textBox, boxX, boxY, boxW, boxH);

    // Update text
    this.stepText.setText(step.text);
    this.stepText.setPosition(GAME_WIDTH / 2, boxY + 45);

    // Step counter
    this.stepCounter.setText(`${index + 1} / ${TUTORIAL_STEPS.length}`);
    this.stepCounter.setPosition(GAME_WIDTH / 2, boxY + boxH - 15);

    // Arrow
    this.arrowText.setVisible(false);
    if (step.highlightArea && step.arrowDir) {
      this.arrowText.setVisible(true);
      const { x, y, w, h } = step.highlightArea;
      switch (step.arrowDir) {
        case 'right':
          this.arrowText.setText('>');
          this.arrowText.setPosition(x - 15, y + h / 2);
          break;
        case 'left':
          this.arrowText.setText('<');
          this.arrowText.setPosition(x + w + 15, y + h / 2);
          break;
        case 'down':
          this.arrowText.setText('v');
          this.arrowText.setPosition(x + w / 2, y - 15);
          break;
        case 'up':
          this.arrowText.setText('^');
          this.arrowText.setPosition(x + w / 2, y + h + 15);
          break;
      }
    }

    // Update next button text on last step
    if (index === TUTORIAL_STEPS.length - 1) {
      (this.nextBtn.getAt(1) as Phaser.GameObjects.Text).setText('Start!');
    } else {
      (this.nextBtn.getAt(1) as Phaser.GameObjects.Text).setText('Next');
    }

    // Button positions
    this.nextBtn.setPosition(GAME_WIDTH / 2 + 80, boxY + boxH + 30);
    this.skipBtn.setPosition(GAME_WIDTH / 2 - 80, boxY + boxH + 30);
  }

  private advanceStep(): void {
    if (this.currentStep >= TUTORIAL_STEPS.length - 1) {
      this.completeTutorial();
    } else {
      this.showStep(this.currentStep + 1);
    }
  }

  private completeTutorial(): void {
    TutorialOverlay.markComplete();
    this.onComplete();
    this.destroy();
  }

  /**
   * Get the total number of tutorial steps.
   */
  public static getStepCount(): number {
    return TUTORIAL_STEPS.length;
  }

  private createButton(
    x: number, y: number, w: number, h: number,
    label: string, color: number, onClick: () => void,
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    const bg = this.scene.add.graphics();
    drawButton(bg, w, h, color);
    container.add(bg);

    const text = this.scene.add.text(0, 0, label, {
      fontFamily: FONTS.BODY,
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 2, fill: true },
    }).setOrigin(0.5);
    container.add(text);

    const hitArea = new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    container.input!.cursor = 'pointer';

    container.on('pointerover', () => {
      drawButton(bg, w, h, color + 0x111111, { glowRing: true });
      animateButtonHover(this.scene, container, true);
    });
    container.on('pointerout', () => {
      drawButton(bg, w, h, color);
      animateButtonHover(this.scene, container, false);
    });
    container.on('pointerdown', () => {
      animateButtonPress(this.scene, container);
      onClick();
    });

    return container;
  }
}
