import Phaser from 'phaser';
import { COLORS, TEXT_STYLES, FONTS } from '@/ui/UITheme';
import { drawPanel, drawButton, animateButtonHover, animateButtonPress } from '@/ui/UIHelpers';
import { AudioManager } from '@/managers/AudioManager';

/**
 * Settings overlay scene with volume, mute, restart, and main menu options.
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
    const panelWidth = 320;
    const panelHeight = 530;
    const panelX = (width - panelWidth) / 2;
    const panelY = (height - panelHeight) / 2;

    const panel = this.add.graphics();
    drawPanel(panel, panelX, panelY, panelWidth, panelHeight);

    // Title with gear icon
    this.add.text(width / 2, panelY + 40, 'Settings', {
      ...TEXT_STYLES.SCENE_TITLE,
      fontSize: '32px',
    }).setOrigin(0.5);

    // ---- Volume Control ----
    const audioManager: AudioManager | undefined = this.registry.get('audioManager');
    const sliderY = panelY + 90;
    const sliderX = panelX + 50;
    const sliderWidth = 160;
    const sliderHeight = 8;

    this.add.text(panelX + 30, sliderY, 'Volume', {
      fontFamily: FONTS.DISPLAY,
      fontSize: '14px',
      color: COLORS.TEXT_LABEL,
    });

    const currentVolume = audioManager ? audioManager.getVolume() : 0.15;
    const isMuted = audioManager ? !audioManager.isEnabled() : false;

    // Slider track
    const sliderTrack = this.add.graphics();
    sliderTrack.fillStyle(COLORS.BG_PANEL_LIGHT, 1);
    sliderTrack.fillRoundedRect(sliderX, sliderY + 22, sliderWidth, sliderHeight, 4);
    sliderTrack.lineStyle(1, COLORS.CYAN_DIM, 0.5);
    sliderTrack.strokeRoundedRect(sliderX, sliderY + 22, sliderWidth, sliderHeight, 4);

    // Slider fill
    const sliderFill = this.add.graphics();
    const drawSliderFill = (vol: number) => {
      sliderFill.clear();
      sliderFill.fillStyle(COLORS.CYAN, 0.8);
      sliderFill.fillRoundedRect(sliderX, sliderY + 22, sliderWidth * vol, sliderHeight, 4);
    };
    drawSliderFill(isMuted ? 0 : currentVolume);

    // Slider handle
    const handleSize = 18;
    const handle = this.add.graphics();
    let volume = currentVolume;

    const drawHandle = (vol: number) => {
      handle.clear();
      const hx = sliderX + sliderWidth * vol - handleSize / 2;
      const hy = sliderY + 22 + sliderHeight / 2 - handleSize / 2;
      handle.fillStyle(0xffffff, 1);
      handle.fillRoundedRect(hx, hy, handleSize, handleSize, 4);
      handle.lineStyle(2, COLORS.CYAN, 0.8);
      handle.strokeRoundedRect(hx, hy, handleSize, handleSize, 4);
    };
    drawHandle(isMuted ? 0 : volume);

    // Volume percentage text
    const volPercText = this.add.text(sliderX + sliderWidth + 15, sliderY + 18, `${Math.round((isMuted ? 0 : volume) * 100)}%`, {
      fontFamily: FONTS.MONO,
      fontSize: '14px',
      color: COLORS.TEXT_WHITE,
    });

    // Draggable zone over slider
    const sliderZone = this.add.zone(sliderX + sliderWidth / 2, sliderY + 26, sliderWidth + handleSize, 30)
      .setInteractive({ useHandCursor: true });

    let isDragging = false;

    const updateVolume = (pointerX: number) => {
      const localX = pointerX - sliderX;
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

    // Mute toggle button
    const muteBtnW = 80;
    const muteBtnH = 28;
    const muteContainer = this.add.container(sliderX + sliderWidth / 2, sliderY + 58);
    const muteBtnBg = this.add.graphics();
    drawButton(muteBtnBg, muteBtnW, muteBtnH, isMuted ? COLORS.DANGER : COLORS.PRIMARY);
    muteContainer.add(muteBtnBg);

    const muteText = this.add.text(0, 0, isMuted ? 'Unmute' : 'Mute', {
      fontFamily: FONTS.DISPLAY,
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

    // ---- Damage Numbers Toggle ----
    const dmgToggleY = sliderY + 90;
    const showDmgNumbers = this.registry.get('showDamageNumbers') !== false; // default ON

    this.add.text(panelX + 30, dmgToggleY, 'Damage Numbers', {
      fontFamily: FONTS.DISPLAY,
      fontSize: '14px',
      color: COLORS.TEXT_LABEL,
    });

    const dmgBtnW = 80;
    const dmgBtnH = 28;
    const dmgContainer = this.add.container(sliderX + sliderWidth / 2, dmgToggleY + 24);
    const dmgBtnBg = this.add.graphics();
    drawButton(dmgBtnBg, dmgBtnW, dmgBtnH, showDmgNumbers ? COLORS.PRIMARY : COLORS.DANGER);
    dmgContainer.add(dmgBtnBg);

    const dmgText = this.add.text(0, 0, showDmgNumbers ? 'ON' : 'OFF', {
      fontFamily: FONTS.DISPLAY,
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    dmgContainer.add(dmgText);

    const dmgHitArea = new Phaser.Geom.Rectangle(-dmgBtnW / 2, -dmgBtnH / 2, dmgBtnW, dmgBtnH);
    dmgContainer.setInteractive(dmgHitArea, Phaser.Geom.Rectangle.Contains);
    dmgContainer.input!.cursor = 'pointer';

    dmgContainer.on('pointerdown', () => {
      const current = this.registry.get('showDamageNumbers') !== false;
      const newValue = !current;
      this.registry.set('showDamageNumbers', newValue);
      dmgText.setText(newValue ? 'ON' : 'OFF');
      drawButton(dmgBtnBg, dmgBtnW, dmgBtnH, newValue ? COLORS.PRIMARY : COLORS.DANGER);
    });

    // ---- Health Bar Mode Toggle ----
    const hpToggleY = dmgToggleY + 56;
    const HEALTH_MODES: Array<'all' | 'bosses' | 'off'> = ['all', 'bosses', 'off'];
    const HEALTH_MODE_LABELS: Record<string, string> = { all: 'All', bosses: 'Bosses', off: 'Off' };
    let currentHpMode: string = this.registry.get('healthBarMode') ?? 'all';

    this.add.text(panelX + 30, hpToggleY, 'Health Bars', {
      fontFamily: FONTS.DISPLAY,
      fontSize: '14px',
      color: COLORS.TEXT_LABEL,
    });

    const hpBtnW = 100;
    const hpBtnH = 28;
    const hpContainer = this.add.container(sliderX + sliderWidth / 2, hpToggleY + 24);
    const hpBtnBg = this.add.graphics();
    drawButton(hpBtnBg, hpBtnW, hpBtnH, COLORS.PRIMARY);
    hpContainer.add(hpBtnBg);

    const hpText = this.add.text(0, 0, HEALTH_MODE_LABELS[currentHpMode], {
      fontFamily: FONTS.DISPLAY,
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    hpContainer.add(hpText);

    const hpHitArea = new Phaser.Geom.Rectangle(-hpBtnW / 2, -hpBtnH / 2, hpBtnW, hpBtnH);
    hpContainer.setInteractive(hpHitArea, Phaser.Geom.Rectangle.Contains);
    hpContainer.input!.cursor = 'pointer';

    hpContainer.on('pointerdown', () => {
      const idx = HEALTH_MODES.indexOf(currentHpMode as 'all' | 'bosses' | 'off');
      const nextIdx = (idx + 1) % HEALTH_MODES.length;
      currentHpMode = HEALTH_MODES[nextIdx];
      this.registry.set('healthBarMode', currentHpMode);
      hpText.setText(HEALTH_MODE_LABELS[currentHpMode]);
    });

    // ---- Action Buttons ----
    const btnW = 200;
    const btnH = 44;
    const btnCenterX = width / 2;

    // Resume button
    this.createActionButton(btnCenterX, panelY + 330, btnW, btnH, 'Resume', COLORS.PRIMARY, COLORS.PRIMARY_HOVER, () => {
      this.scene.resume('GameScene');
      this.scene.stop();
    });

    // Restart button
    this.createActionButton(btnCenterX, panelY + 390, btnW, btnH, 'Restart', COLORS.SPECIAL, COLORS.SPECIAL_HOVER, () => {
      this.scene.stop('GameScene');
      this.scene.stop();
      this.scene.start('GameScene');
    });

    // Main Menu button
    this.createActionButton(btnCenterX, panelY + 450, btnW, btnH, 'Main Menu', COLORS.DANGER, COLORS.DANGER_HOVER, () => {
      this.scene.stop('GameScene');
      this.scene.stop();
      this.scene.start('MainMenuScene');
    });

    // ESC to close
    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.resume('GameScene');
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
      fontFamily: FONTS.DISPLAY,
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
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
