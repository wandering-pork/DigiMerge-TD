import Phaser from 'phaser';
import { DIGIMON_DATABASE } from '@/data/DigimonDatabase';
import { getEvolutionChain } from '@/data/EvolutionPaths';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config/Constants';
import { STAGE_NAMES, ATTRIBUTE_NAMES } from '@/types';
import { COLORS, ATTRIBUTE_COLORS_STR, TEXT_STYLES, FONTS } from './UITheme';
import { drawPanel, drawButton, drawSeparator, animateModalIn, animateModalOut, animateButtonHover, animateButtonPress } from './UIHelpers';
import { canDisplaySprite, getStaticFrame } from '@/utils/SpriteAnimHelper';

/**
 * EvolutionTreeModal shows the full evolution chain for a selected tower.
 * Displays the current Digimon highlighted, previous evolutions, and all
 * possible next evolutions. Clickable sprites navigate within the tree.
 */
export class EvolutionTreeModal extends Phaser.GameObjects.Container {
  private overlay!: Phaser.GameObjects.Graphics;
  private panelContainer!: Phaser.GameObjects.Container;
  private contentContainer!: Phaser.GameObjects.Container;

  private static readonly PANEL_WIDTH = 460;
  private static readonly PANEL_HEIGHT = 480;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.buildModal();
    this.setVisible(false);
    this.setDepth(55);

    scene.add.existing(this);
  }

  private buildModal(): void {
    // Dark overlay
    this.overlay = this.scene.add.graphics();
    this.overlay.fillStyle(COLORS.OVERLAY_BLACK, 0.6);
    this.overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.overlay.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT),
      Phaser.Geom.Rectangle.Contains,
    );
    this.overlay.on('pointerdown', () => this.hide());
    this.add(this.overlay);

    // Panel container for animation
    this.panelContainer = this.scene.add.container(0, 0);
    this.add(this.panelContainer);

    // Content container (rebuilt each time)
    this.contentContainer = this.scene.add.container(0, 0);
    this.panelContainer.add(this.contentContainer);
  }

  public show(digimonId: string): void {
    this.buildContent(digimonId);
    this.setVisible(true);

    this.overlay.setAlpha(0);
    this.scene.tweens.add({ targets: this.overlay, alpha: 1, duration: 200 });
    animateModalIn(this.scene, this.panelContainer);
  }

  public hide(): void {
    animateModalOut(this.scene, this.panelContainer);
    this.scene.tweens.add({
      targets: this.overlay, alpha: 0, duration: 200,
      onComplete: () => {
        this.setVisible(false);
        this.contentContainer.removeAll(true);
      },
    });
  }

  private buildContent(digimonId: string): void {
    this.contentContainer.removeAll(true);

    const w = EvolutionTreeModal.PANEL_WIDTH;
    const h = EvolutionTreeModal.PANEL_HEIGHT;
    const px = (GAME_WIDTH - w) / 2;
    const py = (GAME_HEIGHT - h) / 2;

    // Panel background
    const bg = this.scene.add.graphics();
    drawPanel(bg, px, py, w, h, { borderColor: COLORS.CYAN });
    this.contentContainer.add(bg);

    // Title
    const stats = DIGIMON_DATABASE.towers[digimonId];
    const name = stats?.name ?? digimonId;
    this.contentContainer.add(
      this.scene.add.text(GAME_WIDTH / 2, py + 20, 'Evolution Tree', TEXT_STYLES.MODAL_TITLE).setOrigin(0.5, 0),
    );

    // Current Digimon header
    const spriteKey = stats?.spriteKey ?? digimonId;
    if (canDisplaySprite(this.scene, spriteKey)) {
      const sf = getStaticFrame(spriteKey);
      const sprite = sf
        ? this.scene.add.image(px + 50, py + 72, sf.atlas, sf.frame)
        : this.scene.add.image(px + 50, py + 72, spriteKey);
      sprite.setScale(3);
      this.contentContainer.add(sprite);
    }

    this.contentContainer.add(
      this.scene.add.text(px + 90, py + 55, name, {
        fontFamily: FONTS.DISPLAY,
        fontSize: '18px',
        color: '#00ddff',
        fontStyle: 'bold',
        resolution: 2,
      }),
    );

    if (stats) {
      const attrColor = ATTRIBUTE_COLORS_STR[stats.attribute] ?? '#ffffff';
      this.contentContainer.add(
        this.scene.add.text(px + 90, py + 78, `${STAGE_NAMES[stats.stageTier]} | ${ATTRIBUTE_NAMES[stats.attribute]}`, {
          fontFamily: FONTS.BODY,
          fontSize: '12px',
          color: attrColor,
          resolution: 2,
        }),
      );
    }

    // Separator
    const sep1 = this.scene.add.graphics();
    drawSeparator(sep1, px + 16, py + 100, px + w - 16, COLORS.CYAN);
    this.contentContainer.add(sep1);

    // Evolution chain
    const chain = getEvolutionChain(digimonId);

    // Build full recursive chain
    const fullPrev = this.getFullPrevChain(digimonId);
    const fullNext = this.getFullNextChain(digimonId);

    let curY = py + 115;

    // "Evolves From" section
    this.contentContainer.add(
      this.scene.add.text(px + 16, curY, 'Evolves From', {
        fontFamily: FONTS.DISPLAY,
        fontSize: '13px',
        color: '#7788aa',
        fontStyle: 'bold',
        resolution: 2,
      }),
    );
    curY += 20;

    if (fullPrev.length === 0) {
      this.contentContainer.add(
        this.scene.add.text(px + 16, curY, 'None (base form)', {
          fontFamily: FONTS.BODY,
          fontSize: '12px',
          color: '#556677',
          resolution: 2,
        }),
      );
      curY += 24;
    } else {
      // Show chain as sprite row with arrows
      let chainX = px + 30;
      for (let i = 0; i < fullPrev.length; i++) {
        const prevId = fullPrev[i];
        const node = this.createDigimonNode(prevId, chainX, curY + 20, digimonId);
        this.contentContainer.add(node);
        chainX += 72;

        if (i < fullPrev.length - 1) {
          this.contentContainer.add(
            this.scene.add.text(chainX - 14, curY + 16, '\u2192', {
              fontSize: '16px', color: '#556677', resolution: 2,
            }).setOrigin(0.5, 0),
          );
        }
      }
      curY += 64;
    }

    // Separator
    const sep2 = this.scene.add.graphics();
    drawSeparator(sep2, px + 16, curY, px + w - 16);
    this.contentContainer.add(sep2);
    curY += 10;

    // Current Digimon (highlighted)
    this.contentContainer.add(
      this.scene.add.text(px + 16, curY, 'Current', {
        fontFamily: FONTS.DISPLAY,
        fontSize: '13px',
        color: '#00ddff',
        fontStyle: 'bold',
        resolution: 2,
      }),
    );
    curY += 20;

    const currentNode = this.createDigimonNode(digimonId, px + 30, curY + 20, digimonId, true);
    this.contentContainer.add(currentNode);
    curY += 64;

    // Separator
    const sep3 = this.scene.add.graphics();
    drawSeparator(sep3, px + 16, curY, px + w - 16);
    this.contentContainer.add(sep3);
    curY += 10;

    // "Evolves To" section
    this.contentContainer.add(
      this.scene.add.text(px + 16, curY, 'Evolves To', {
        fontFamily: FONTS.DISPLAY,
        fontSize: '13px',
        color: '#7788aa',
        fontStyle: 'bold',
        resolution: 2,
      }),
    );
    curY += 20;

    if (chain.nextIds.length === 0) {
      this.contentContainer.add(
        this.scene.add.text(px + 16, curY, 'None (final form)', {
          fontFamily: FONTS.BODY,
          fontSize: '12px',
          color: '#556677',
          resolution: 2,
        }),
      );
    } else {
      let nextX = px + 30;
      for (const nextId of chain.nextIds) {
        const node = this.createDigimonNode(nextId, nextX, curY + 20, digimonId);
        this.contentContainer.add(node);
        nextX += 72;

        // Show further evolutions as small text below
        const furtherChain = getEvolutionChain(nextId);
        if (furtherChain.nextIds.length > 0) {
          const furtherNames = furtherChain.nextIds
            .map(id => DIGIMON_DATABASE.towers[id]?.name ?? id)
            .join(', ');
          this.contentContainer.add(
            this.scene.add.text(nextX - 72, curY + 56, `\u2192 ${furtherNames}`, {
              fontFamily: FONTS.BODY,
              fontSize: '9px',
              color: '#556677',
              wordWrap: { width: 68 },
              resolution: 2,
            }),
          );
        }
      }
    }

    // Close button
    const closeBtnW = 100;
    const closeBtnH = 34;
    const closeBtn = this.scene.add.container(GAME_WIDTH / 2, py + h - 35);
    const closeBtnBg = this.scene.add.graphics();
    drawButton(closeBtnBg, closeBtnW, closeBtnH, COLORS.DANGER);
    closeBtn.add(closeBtnBg);
    closeBtn.add(
      this.scene.add.text(0, 0, 'Close', TEXT_STYLES.BUTTON_SM).setOrigin(0.5),
    );
    const closeHitArea = new Phaser.Geom.Rectangle(-closeBtnW / 2, -closeBtnH / 2, closeBtnW, closeBtnH);
    closeBtn.setInteractive(closeHitArea, Phaser.Geom.Rectangle.Contains);
    closeBtn.input!.cursor = 'pointer';
    closeBtn.on('pointerdown', () => {
      animateButtonPress(this.scene, closeBtn);
      this.hide();
    });
    closeBtn.on('pointerover', () => {
      drawButton(closeBtnBg, closeBtnW, closeBtnH, COLORS.DANGER_HOVER, { glowRing: true });
      animateButtonHover(this.scene, closeBtn, true);
    });
    closeBtn.on('pointerout', () => {
      drawButton(closeBtnBg, closeBtnW, closeBtnH, COLORS.DANGER);
      animateButtonHover(this.scene, closeBtn, false);
    });
    this.contentContainer.add(closeBtn);
  }

  /**
   * Create a clickable Digimon node (sprite + name) for the tree.
   */
  private createDigimonNode(
    id: string, x: number, y: number,
    currentId: string, isCurrent: boolean = false,
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    const stats = DIGIMON_DATABASE.towers[id];
    const displayName = stats?.name ?? id;
    const spriteKey = stats?.spriteKey ?? id;

    // Sprite
    if (canDisplaySprite(this.scene, spriteKey)) {
      const sf = getStaticFrame(spriteKey);
      const sprite = sf
        ? this.scene.add.image(0, 0, sf.atlas, sf.frame)
        : this.scene.add.image(0, 0, spriteKey);
      sprite.setScale(isCurrent ? 2.5 : 2);
      container.add(sprite);
    } else {
      container.add(
        this.scene.add.text(0, 0, '?', {
          fontSize: '14px', color: '#556677', resolution: 2,
        }).setOrigin(0.5),
      );
    }

    // Highlight ring for current
    if (isCurrent) {
      const ring = this.scene.add.graphics();
      ring.lineStyle(2, COLORS.CYAN, 0.7);
      ring.strokeCircle(0, 0, 22);
      container.add(ring);
    }

    // Name
    const nameText = this.scene.add.text(0, 22, displayName, {
      fontFamily: FONTS.BODY,
      fontSize: '10px',
      color: isCurrent ? '#00ddff' : '#aabbcc',
      align: 'center',
      resolution: 2,
    }).setOrigin(0.5, 0);
    container.add(nameText);

    // Clickable (navigate to that Digimon's tree)
    if (!isCurrent) {
      const hitZone = this.scene.add.zone(0, 6, 50, 50).setInteractive({ cursor: 'pointer' });
      hitZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
        this.buildContent(id);
      });
      hitZone.on('pointerover', () => { nameText.setColor('#00ddff'); });
      hitZone.on('pointerout', () => { nameText.setColor('#aabbcc'); });
      container.add(hitZone);
    }

    return container;
  }

  /**
   * Walk backwards through evolution chain to get full predecessor list.
   * Returns ordered from earliest ancestor to direct parent.
   */
  private getFullPrevChain(digimonId: string, maxDepth: number = 5): string[] {
    const chain: string[] = [];
    let currentId = digimonId;

    for (let i = 0; i < maxDepth; i++) {
      const prev = getEvolutionChain(currentId);
      if (prev.prevIds.length === 0) break;
      // Take the first predecessor (default path)
      const prevId = prev.prevIds[0];
      chain.unshift(prevId);
      currentId = prevId;
    }

    return chain;
  }

  /**
   * Get the first-level next evolutions (not recursive — shown as nodes).
   */
  private getFullNextChain(digimonId: string): string[] {
    const chain = getEvolutionChain(digimonId);
    return chain.nextIds;
  }
}
