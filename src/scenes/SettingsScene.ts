import Phaser from 'phaser';
import { COLORS, TEXT_STYLES, FONTS } from '@/ui/UITheme';
import { drawPanel, drawButton, drawSeparator, animateButtonHover, animateButtonPress, animateModalIn } from '@/ui/UIHelpers';
import { AudioManager } from '@/managers/AudioManager';

/**
 * Settings overlay scene with volume, mute, restart, and main menu options.
 * Enhanced with glass-panel design and cleaner control layout.
 */
export class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Semi-transparent dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(COLORS.OVERLAY_BLACK, 0.7);
    overlay.fillRect(0, 0, width, height);

    // Make overlay block clicks from passing through
    overlay.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, width, height),
      Phaser.Geom.Rectangle.Contains,
    );

    // Panel background
    const panelWidth = 340;
    const panelHeight = 520;
    const panelX = (width - panelWidth) / 2;
    const panelY = (height - panelHeight) / 2;

    const panelContainer = this.add.container(0, 0);

    const panel = this.add.graphics();
    drawPanel(panel, panelX, panelY, panelWidth, panelHeight, { borderColor: COLORS.CYAN_DIM });
    panelContainer.add(panel);

    // Title
    const titleText = this.add.text(width / 2, panelY + 35, 'Settings', {
      ...TEXT_STYLES.SCENE_TITLE,
      fontSize: '30px',
    }).setOrigin(0.5);
    panelContainer.add(titleText);

    // Separator under title
    const titleSep = this.add.graphics();
    drawSeparator(titleSep, panelX + 20, panelY + 60, panelX + panelWidth - 20);
    panelContainer.add(titleSep);

    // ---- Volume Control ----
    const audioManager: AudioManager | undefined = this.registry.get('audioManager');
    const controlX = panelX + 30;
    let controlY = panelY + 80;
    const sliderWidth = 180;
    const sliderHeight = 8;

    this.add.text(controlX, controlY, 'VOLUME', {
      fontFamily: FONTS.BODY,
      fontSize: '11px',
      color: '#7788aa',
      letterSpacing: 2,
    });

    controlY += 20;

    const currentVolume = audioManager ? audioManager.getVolume() : 0.05;
    const isMuted = audioManager ? !audioManager.isEnabled() : false;

    // Slider track
    const sliderTrack = this.add.graphics();
    sliderTrack.fillStyle(COLORS.BG_DEEPEST, 1);
    sliderTrack.fillRoundedRect(controlX, controlY, sliderWidth, sliderHeight, 4);
    sliderTrack.lineStyle(1, COLORS.CYAN_DIM, 0.3);
    sliderTrack.strokeRoundedRect(controlX, controlY, sliderWidth, sliderHeight, 4);

    // Slider fill
    const sliderFill = this.add.graphics();
    const drawSliderFill = (vol: number) => {
      sliderFill.clear();
      sliderFill.fillStyle(COLORS.CYAN, 0.7);
      const fillW = Math.max(4, sliderWidth * vol);
      sliderFill.fillRoundedRect(controlX, controlY, fillW, sliderHeight, 4);
    };
    drawSliderFill(isMuted ? 0 : currentVolume);

    // Slider handle
    const handleSize = 18;
    const handle = this.add.graphics();
    let volume = currentVolume;

    const drawHandle = (vol: number) => {
      handle.clear();
      const hx = controlX + sliderWidth * vol - handleSize / 2;
      const hy = controlY + sliderHeight / 2 - handleSize / 2;
      // Shadow
      handle.fillStyle(0x000000, 0.3);
      handle.fillRoundedRect(hx + 1, hy + 1, handleSize, handleSize, 5);
      // Handle body
      handle.fillStyle(0xffffff, 1);
      handle.fillRoundedRect(hx, hy, handleSize, handleSize, 5);
      // Inner highlight
      handle.fillStyle(COLORS.CYAN, 0.2);
      handle.fillRoundedRect(hx + 2, hy + 2, handleSize - 4, handleSize / 2 - 2, 3);
      handle.lineStyle(1.5, COLORS.CYAN, 0.6);
      handle.strokeRoundedRect(hx, hy, handleSize, handleSize, 5);
    };
    drawHandle(isMuted ? 0 : volume);

    // Volume percentage text
    const volPercText = this.add.text(controlX + sliderWidth + 15, controlY - 2, `${Math.round((isMuted ? 0 : volume) * 100)}%`, {
      fontFamily: FONTS.MONO,
      fontSize: '14px',
      color: COLORS.TEXT_WHITE,
    });

    // Draggable zone over slider
    const sliderZone = this.add.zone(controlX + sliderWidth / 2, controlY + 4, sliderWidth + handleSize, 30)
      .setInteractive({ useHandCursor: true });

    let isDragging = false;

    const updateVolume = (pointerX: number) => {
      const localX = pointerX - controlX;
      volume = Phaser.Math.Clamp(localX / sliderWidth, 0, 1);
      drawSliderFill(volume);
      drawHandle(volume);
      volPercText.setText(`${Math.round(volume * 100)}%`);
      if (audioManager) {
        audioManager.setVolume(volume);
        if (volume > 0) audioManager.setEnabled(true);
      }
    };

    sliderZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      isDragging = true;
      updateVolume(pointer.x);
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (isDragging) updateVolume(pointer.x);
    });

    this.input.on('pointerup', () => { isDragging = false; });

    controlY += 30;

    // Mute toggle button
    const muteBtnW = 90;
    const muteBtnH = 30;
    const muteContainer = this.add.container(controlX + sliderWidth / 2, controlY);
    const muteBtnBg = this.add.graphics();
    drawButton(muteBtnBg, muteBtnW, muteBtnH, isMuted ? COLORS.DANGER : COLORS.PRIMARY);
    muteContainer.add(muteBtnBg);

    const muteText = this.add.text(0, 0, isMuted ? 'Unmute' : 'Mute', {
      fontFamily: FONTS.BODY,
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    muteContainer.add(muteText);

    const muteHitArea = new Phaser.Geom.Rectangle(-muteBtnW / 2, -muteBtnH / 2, muteBtnW, muteBtnH);
    muteContainer.setInteractive(muteHitArea, Phaser.Geom.Rectangle.Contains);
    muteContainer.input!.cursor = 'pointer';

    muteContainer.on('pointerdown', () => {
      if (audioManager) {
        const nowEnabled = audioManager.isEnabled();
        audioManager.setEnabled(!nowEnabled);
        muteText.setText(nowEnabled ? 'Unmute' : 'Mute');
        drawButton(muteBtnBg, muteBtnW, muteBtnH, nowEnabled ? COLORS.DANGER : COLORS.PRIMARY);
        if (nowEnabled) {
          drawSliderFill(0);
          drawHandle(0);
          volPercText.setText('0%');
        } else {
          drawSliderFill(volume);
          drawHandle(volume);
          volPercText.setText(`${Math.round(volume * 100)}%`);
        }
      }
    });

    controlY += 30;

    // Separator
    const optionsSep = this.add.graphics();
    drawSeparator(optionsSep, panelX + 20, controlY, panelX + panelWidth - 20);
    controlY += 15;

    // ---- Display Options Row ----
    this.add.text(controlX, controlY, 'DISPLAY', {
      fontFamily: FONTS.BODY,
      fontSize: '11px',
      color: '#7788aa',
      letterSpacing: 2,
    });
    controlY += 22;

    // Damage Numbers Toggle
    const showDmgNumbers = this.registry.get('showDamageNumbers') !== false;

    const dmgRow = this.add.container(0, controlY);
    dmgRow.add(this.add.text(controlX, 0, 'Damage Numbers', {
      fontFamily: FONTS.BODY,
      fontSize: '13px',
      color: '#aabbcc',
    }));

    const dmgBtnW = 60;
    const dmgBtnH = 26;
    const dmgBtnContainer = this.add.container(panelX + panelWidth - 50, 0);
    const dmgBtnBg = this.add.graphics();
    drawButton(dmgBtnBg, dmgBtnW, dmgBtnH, showDmgNumbers ? COLORS.CYAN_DIM : COLORS.BG_PANEL_LIGHT);
    dmgBtnContainer.add(dmgBtnBg);

    const dmgText = this.add.text(0, 0, showDmgNumbers ? 'ON' : 'OFF', {
      fontFamily: FONTS.BODY,
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    dmgBtnContainer.add(dmgText);

    const dmgHitArea = new Phaser.Geom.Rectangle(-dmgBtnW / 2, -dmgBtnH / 2, dmgBtnW, dmgBtnH);
    dmgBtnContainer.setInteractive(dmgHitArea, Phaser.Geom.Rectangle.Contains);
    dmgBtnContainer.input!.cursor = 'pointer';

    dmgBtnContainer.on('pointerdown', () => {
      const current = this.registry.get('showDamageNumbers') !== false;
      const newValue = !current;
      this.registry.set('showDamageNumbers', newValue);
      dmgText.setText(newValue ? 'ON' : 'OFF');
      drawButton(dmgBtnBg, dmgBtnW, dmgBtnH, newValue ? COLORS.CYAN_DIM : COLORS.BG_PANEL_LIGHT);
    });

    dmgRow.add(dmgBtnContainer);
    controlY += 36;

    // Health Bar Mode Toggle
    const HEALTH_MODES: Array<'all' | 'bosses' | 'off'> = ['all', 'bosses', 'off'];
    const HEALTH_MODE_LABELS: Record<string, string> = { all: 'All', bosses: 'Bosses', off: 'Off' };
    let currentHpMode: string = this.registry.get('healthBarMode') ?? 'all';

    const hpRow = this.add.container(0, controlY);
    hpRow.add(this.add.text(controlX, 0, 'Health Bars', {
      fontFamily: FONTS.BODY,
      fontSize: '13px',
      color: '#aabbcc',
    }));

    const hpBtnW = 80;
    const hpBtnH = 26;
    const hpBtnContainer = this.add.container(panelX + panelWidth - 60, 0);
    const hpBtnBg = this.add.graphics();
    drawButton(hpBtnBg, hpBtnW, hpBtnH, COLORS.CYAN_DIM);
    hpBtnContainer.add(hpBtnBg);

    const hpText = this.add.text(0, 0, HEALTH_MODE_LABELS[currentHpMode], {
      fontFamily: FONTS.BODY,
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    hpBtnContainer.add(hpText);

    const hpHitArea = new Phaser.Geom.Rectangle(-hpBtnW / 2, -hpBtnH / 2, hpBtnW, hpBtnH);
    hpBtnContainer.setInteractive(hpHitArea, Phaser.Geom.Rectangle.Contains);
    hpBtnContainer.input!.cursor = 'pointer';

    hpBtnContainer.on('pointerdown', () => {
      const idx = HEALTH_MODES.indexOf(currentHpMode as 'all' | 'bosses' | 'off');
      const nextIdx = (idx + 1) % HEALTH_MODES.length;
      currentHpMode = HEALTH_MODES[nextIdx];
      this.registry.set('healthBarMode', currentHpMode);
      hpText.setText(HEALTH_MODE_LABELS[currentHpMode]);
    });

    hpRow.add(hpBtnContainer);
    controlY += 40;

    // Separator before action buttons
    const actionSep = this.add.graphics();
    drawSeparator(actionSep, panelX + 20, controlY, panelX + panelWidth - 20);
    controlY += 20;

    // ---- Action Buttons ----
    const btnW = 220;
    const btnH = 42;
    const btnCenterX = width / 2;

    // Close button
    this.createActionButton(btnCenterX, controlY, btnW, btnH, 'Close', COLORS.PRIMARY, COLORS.PRIMARY_HOVER, () => {
      this.scene.stop();
    });
    controlY += 52;

    // Restart button
    this.createActionButton(btnCenterX, controlY, btnW, btnH, 'Restart', COLORS.SPECIAL, COLORS.SPECIAL_HOVER, () => {
      this.scene.stop('GameScene');
      this.scene.stop();
      this.scene.start('GameScene');
    });
    controlY += 52;

    // Main Menu button
    this.createActionButton(btnCenterX, controlY, btnW, btnH, 'Main Menu', COLORS.DANGER, COLORS.DANGER_HOVER, () => {
      this.scene.stop('GameScene');
      this.scene.stop();
      this.scene.start('MainMenuScene');
    });

    // Panel entrance animation
    animateModalIn(this, panelContainer);

    // ESC to close
    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.stop();
    });
  }

  private createActionButton(
    x: number, y: number, w: number, h: number,
    label: string, color: number, hoverColor: number, onClick: () => void,
  ): void {
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    drawButton(bg, w, h, color);
    container.add(bg);

    const text = this.add.text(0, 0, label, {
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
      drawButton(bg, w, h, hoverColor, { glowRing: true });
      animateButtonHover(this, container, true);
    });
    container.on('pointerout', () => {
      drawButton(bg, w, h, color);
      animateButtonHover(this, container, false);
    });
    container.on('pointerdown', () => {
      animateButtonPress(this, container);
      onClick();
    });
  }
}
