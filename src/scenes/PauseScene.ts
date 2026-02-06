import Phaser from 'phaser';
import { COLORS, TEXT_STYLES, FONTS, ANIM } from '@/ui/UITheme';
import { drawPanel, drawButton, animateButtonHover, animateButtonPress } from '@/ui/UIHelpers';
import { AudioManager } from '@/managers/AudioManager';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Semi-transparent dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(COLORS.OVERLAY_BLACK, 0.7);
    overlay.fillRect(0, 0, width, height);

    // Panel background — themed
    const panelWidth = 300;
    const panelHeight = 380;
    const panelX = (width - panelWidth) / 2;
    const panelY = (height - panelHeight) / 2;

    const panel = this.add.graphics();
    drawPanel(panel, panelX, panelY, panelWidth, panelHeight);

    // Glow behind PAUSED text (lower alpha copy)
    this.add.text(width / 2, panelY + 50, 'PAUSED', {
      ...TEXT_STYLES.SCENE_TITLE,
      fontSize: '42px',
    }).setOrigin(0.5).setAlpha(0.3);

    // PAUSED text — cyan
    this.add.text(width / 2, panelY + 50, 'PAUSED', {
      ...TEXT_STYLES.SCENE_TITLE,
      fontSize: '42px',
    }).setOrigin(0.5);

    // ---- Volume Control ----
    const audioManager: AudioManager | undefined = this.registry.get('audioManager');
    const sliderY = panelY + 110;
    const sliderX = panelX + 40;
    const sliderWidth = 160;
    const sliderHeight = 8;

    this.add.text(panelX + 30, sliderY - 5, 'Volume', {
      fontFamily: FONTS.DISPLAY,
      fontSize: '14px',
      color: COLORS.TEXT_LABEL,
    });

    const currentVolume = audioManager ? audioManager.getVolume() : 0.5;
    const isMuted = audioManager ? !audioManager.isEnabled() : false;

    // Slider track
    const sliderTrack = this.add.graphics();
    sliderTrack.fillStyle(COLORS.BG_PANEL_LIGHT, 1);
    sliderTrack.fillRoundedRect(sliderX, sliderY + 18, sliderWidth, sliderHeight, 4);
    sliderTrack.lineStyle(1, COLORS.CYAN_DIM, 0.5);
    sliderTrack.strokeRoundedRect(sliderX, sliderY + 18, sliderWidth, sliderHeight, 4);

    // Slider fill
    const sliderFill = this.add.graphics();
    const drawSliderFill = (vol: number) => {
      sliderFill.clear();
      sliderFill.fillStyle(COLORS.CYAN, 0.8);
      sliderFill.fillRoundedRect(sliderX, sliderY + 18, sliderWidth * vol, sliderHeight, 4);
    };
    drawSliderFill(isMuted ? 0 : currentVolume);

    // Slider handle
    const handleSize = 18;
    const handle = this.add.graphics();
    let volume = currentVolume;

    const drawHandle = (vol: number) => {
      handle.clear();
      const hx = sliderX + sliderWidth * vol - handleSize / 2;
      const hy = sliderY + 18 + sliderHeight / 2 - handleSize / 2;
      handle.fillStyle(0xffffff, 1);
      handle.fillRoundedRect(hx, hy, handleSize, handleSize, 4);
      handle.lineStyle(2, COLORS.CYAN, 0.8);
      handle.strokeRoundedRect(hx, hy, handleSize, handleSize, 4);
    };
    drawHandle(isMuted ? 0 : volume);

    // Volume percentage text
    const volPercText = this.add.text(sliderX + sliderWidth + 15, sliderY + 15, `${Math.round((isMuted ? 0 : volume) * 100)}%`, {
      fontFamily: FONTS.MONO,
      fontSize: '14px',
      color: COLORS.TEXT_WHITE,
    });

    // Invisible draggable zone over slider
    const sliderZone = this.add.zone(sliderX + sliderWidth / 2, sliderY + 22, sliderWidth + handleSize, 30)
      .setInteractive({ useHandCursor: true, draggable: false });

    let isDragging = false;

    const updateVolume = (pointerX: number) => {
      const localX = pointerX - panelX - 40;
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
      if (isDragging) {
        updateVolume(pointer.x);
      }
    });

    this.input.on('pointerup', () => {
      isDragging = false;
    });

    // Mute toggle button
    const muteBtnW = 70;
    const muteBtnH = 28;
    const muteContainer = this.add.container(sliderX + sliderWidth / 2, sliderY + 50);
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
        const nowMuted = audioManager.isEnabled();
        audioManager.setEnabled(!nowMuted);
        muteText.setText(nowMuted ? 'Unmute' : 'Mute');
        drawButton(muteBtnBg, muteBtnW, muteBtnH, nowMuted ? COLORS.DANGER : COLORS.PRIMARY);
        if (nowMuted) {
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

    // Resume button (Container + Graphics)
    const resumeBtnW = 180;
    const resumeBtnH = 44;
    const resumeBtn = this.add.container(width / 2, panelY + 230);
    const resumeBtnBg = this.add.graphics();
    drawButton(resumeBtnBg, resumeBtnW, resumeBtnH, COLORS.PRIMARY);
    resumeBtn.add(resumeBtnBg);

    const resumeText = this.add.text(0, 0, 'Resume', {
      fontFamily: FONTS.DISPLAY,
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    resumeBtn.add(resumeText);

    const resumeHitArea = new Phaser.Geom.Rectangle(-resumeBtnW / 2, -resumeBtnH / 2, resumeBtnW, resumeBtnH);
    resumeBtn.setInteractive(resumeHitArea, Phaser.Geom.Rectangle.Contains);
    resumeBtn.input!.cursor = 'pointer';
    resumeBtn.on('pointerover', () => {
      drawButton(resumeBtnBg, resumeBtnW, resumeBtnH, COLORS.PRIMARY_HOVER, { glowRing: true });
      animateButtonHover(this, resumeBtn, true);
    });
    resumeBtn.on('pointerout', () => {
      drawButton(resumeBtnBg, resumeBtnW, resumeBtnH, COLORS.PRIMARY);
      animateButtonHover(this, resumeBtn, false);
    });
    resumeBtn.on('pointerdown', () => {
      animateButtonPress(this, resumeBtn);
      this.scene.resume('GameScene');
      this.scene.stop();
    });

    // Main Menu button (Container + Graphics)
    const menuBtnW = 180;
    const menuBtnH = 44;
    const menuBtn = this.add.container(width / 2, panelY + 300);
    const menuBtnBg = this.add.graphics();
    drawButton(menuBtnBg, menuBtnW, menuBtnH, COLORS.DANGER);
    menuBtn.add(menuBtnBg);

    const menuText = this.add.text(0, 0, 'Main Menu', {
      fontFamily: FONTS.DISPLAY,
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    menuBtn.add(menuText);

    const menuHitArea = new Phaser.Geom.Rectangle(-menuBtnW / 2, -menuBtnH / 2, menuBtnW, menuBtnH);
    menuBtn.setInteractive(menuHitArea, Phaser.Geom.Rectangle.Contains);
    menuBtn.input!.cursor = 'pointer';
    menuBtn.on('pointerover', () => {
      drawButton(menuBtnBg, menuBtnW, menuBtnH, COLORS.DANGER_HOVER, { glowRing: true });
      animateButtonHover(this, menuBtn, true);
    });
    menuBtn.on('pointerout', () => {
      drawButton(menuBtnBg, menuBtnW, menuBtnH, COLORS.DANGER);
      animateButtonHover(this, menuBtn, false);
    });
    menuBtn.on('pointerdown', () => {
      animateButtonPress(this, menuBtn);
      this.scene.stop('GameScene');
      this.scene.start('MainMenuScene');
    });

    // ESC to resume
    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.resume('GameScene');
      this.scene.stop();
    });
  }
}
