import Phaser from 'phaser';
import { COLORS, TEXT_STYLES, FONTS } from '@/ui/UITheme';
import { drawPanel, drawButton, drawSeparator, animateButtonHover, animateButtonPress, animateModalIn } from '@/ui/UIHelpers';
import { AudioManager } from '@/managers/AudioManager';
import { SaveManager } from '@/managers/SaveManager';
import { HighScoreManager } from '@/managers/HighScoreManager';

/**
 * Settings overlay scene with volume, mute, restart, and main menu options.
 */
export class SettingsScene extends Phaser.Scene {
  private callerScene: string = 'GameScene';

  constructor() {
    super({ key: 'SettingsScene' });
  }

  create(data?: { from?: string }) {
    if (data?.from) {
      this.callerScene = data.from;
    }
    const { width, height } = this.cameras.main;

    // Semi-transparent dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(COLORS.OVERLAY_BLACK, 0.7);
    overlay.fillRect(0, 0, width, height);

    overlay.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, width, height),
      Phaser.Geom.Rectangle.Contains,
    );

    // Panel
    const panelWidth = 310;
    const showGameButtons = this.callerScene !== 'MainMenuScene';
    const panelHeight = showGameButtons ? 520 : 420;
    const panelX = (width - panelWidth) / 2;
    const panelY = (height - panelHeight) / 2;

    const panelContainer = this.add.container(0, 0);

    const panel = this.add.graphics();
    drawPanel(panel, panelX, panelY, panelWidth, panelHeight, { borderColor: COLORS.CYAN_DIM });
    panelContainer.add(panel);

    // Title
    const titleText = this.add.text(width / 2, panelY + 28, 'Settings', {
      ...TEXT_STYLES.SCENE_TITLE,
      fontSize: '26px',
    }).setOrigin(0.5);
    panelContainer.add(titleText);

    // Separator under title
    const titleSep = this.add.graphics();
    drawSeparator(titleSep, panelX + 20, panelY + 50, panelX + panelWidth - 20);
    panelContainer.add(titleSep);

    // ---- Volume Control ----
    const audioManager: AudioManager | undefined = this.registry.get('audioManager');
    const persistedSettings = AudioManager.loadSettings();
    const controlX = panelX + 24;
    const contentWidth = panelWidth - 48;
    let controlY = panelY + 62;

    this.add.text(controlX, controlY, 'VOLUME', {
      fontFamily: FONTS.BODY,
      fontSize: '11px',
      color: '#7788aa',
      letterSpacing: 2,
      resolution: 2,
    });

    controlY += 18;

    const currentVolume = audioManager ? audioManager.getVolume() : persistedSettings.sfxVolume;
    const isMuted = audioManager ? !audioManager.isEnabled() : !persistedSettings.enabled;

    // Slider track
    const sliderWidth = contentWidth - 80; // room for percentage + mute
    const sliderHeight = 6;
    const volumeSliderY = controlY; // Capture Y for closures
    const sliderTrack = this.add.graphics();
    sliderTrack.fillStyle(COLORS.BG_DEEPEST, 1);
    sliderTrack.fillRoundedRect(controlX, volumeSliderY, sliderWidth, sliderHeight, 3);
    sliderTrack.lineStyle(1, COLORS.CYAN_DIM, 0.3);
    sliderTrack.strokeRoundedRect(controlX, volumeSliderY, sliderWidth, sliderHeight, 3);

    // Slider fill
    const sliderFill = this.add.graphics();
    const drawSliderFill = (vol: number) => {
      sliderFill.clear();
      sliderFill.fillStyle(COLORS.CYAN, 0.7);
      const fillW = Math.max(3, sliderWidth * vol);
      sliderFill.fillRoundedRect(controlX, volumeSliderY, fillW, sliderHeight, 3);
    };
    drawSliderFill(isMuted ? 0 : currentVolume);

    // Slider handle
    const handleSize = 14;
    const handle = this.add.graphics();
    let volume = currentVolume;

    const drawHandle = (vol: number) => {
      handle.clear();
      const hx = controlX + sliderWidth * vol - handleSize / 2;
      const hy = volumeSliderY + sliderHeight / 2 - handleSize / 2;
      handle.fillStyle(0x000000, 0.3);
      handle.fillRoundedRect(hx + 1, hy + 1, handleSize, handleSize, 4);
      handle.fillStyle(0xffffff, 1);
      handle.fillRoundedRect(hx, hy, handleSize, handleSize, 4);
      handle.lineStyle(1.5, COLORS.CYAN, 0.6);
      handle.strokeRoundedRect(hx, hy, handleSize, handleSize, 4);
    };
    drawHandle(isMuted ? 0 : volume);

    // Volume percentage text (inline right of slider)
    const volPercText = this.add.text(controlX + sliderWidth + 8, volumeSliderY - 3, `${Math.round((isMuted ? 0 : volume) * 100)}%`, {
      fontFamily: FONTS.MONO,
      fontSize: '12px',
      color: COLORS.TEXT_WHITE,
      resolution: 2,
    });

    // Draggable zone over slider
    const sliderZone = this.add.zone(controlX + sliderWidth / 2, volumeSliderY + 3, sliderWidth + handleSize, 24)
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
      } else {
        // Persist directly when no AudioManager instance exists (e.g., MainMenu)
        try {
          const s = AudioManager.loadSettings();
          s.sfxVolume = volume;
          if (volume > 0) s.enabled = true;
          localStorage.setItem('digimerge_audio_settings', JSON.stringify(s));
        } catch { /* ignore */ }
      }
      // Update mute button state
      updateMuteVisual();
    };

    sliderZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      isDragging = true;
      updateVolume(pointer.x);
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (isDragging) updateVolume(pointer.x);
    });

    this.input.on('pointerup', () => { isDragging = false; });

    // Mute toggle (small icon button inline, far right)
    const muteBtnW = 26;
    const muteBtnH = 22;
    const muteBtnX = panelX + panelWidth - 34;
    const muteContainer = this.add.container(muteBtnX, volumeSliderY + 1);
    const muteBtnBg = this.add.graphics();
    const muteIcon = this.add.text(0, 0, '', {
      fontFamily: FONTS.BODY,
      fontSize: '14px',
      color: '#ffffff',
      resolution: 2,
    }).setOrigin(0.5);

    const updateMuteVisual = () => {
      const muted = audioManager ? !audioManager.isEnabled() : !AudioManager.loadSettings().enabled;
      drawButton(muteBtnBg, muteBtnW, muteBtnH, muted ? COLORS.DANGER : COLORS.BG_PANEL_LIGHT);
      muteIcon.setText(muted ? '\u2716' : '\u266A');
    };

    muteContainer.add(muteBtnBg);
    muteContainer.add(muteIcon);
    updateMuteVisual();

    const muteHitArea = new Phaser.Geom.Rectangle(-muteBtnW / 2, -muteBtnH / 2, muteBtnW, muteBtnH);
    muteContainer.setInteractive(muteHitArea, Phaser.Geom.Rectangle.Contains);
    muteContainer.input!.cursor = 'pointer';

    muteContainer.on('pointerdown', () => {
      if (audioManager) {
        const nowEnabled = audioManager.isEnabled();
        audioManager.setEnabled(!nowEnabled);
        if (nowEnabled) {
          drawSliderFill(0);
          drawHandle(0);
          volPercText.setText('0%');
        } else {
          drawSliderFill(volume);
          drawHandle(volume);
          volPercText.setText(`${Math.round(volume * 100)}%`);
        }
        updateMuteVisual();
      } else {
        // Persist mute toggle directly when no AudioManager instance
        try {
          const s = AudioManager.loadSettings();
          s.enabled = !s.enabled;
          localStorage.setItem('digimerge_audio_settings', JSON.stringify(s));
          if (!s.enabled) {
            drawSliderFill(0);
            drawHandle(0);
            volPercText.setText('0%');
            // Stop menu music
            this.sound.stopAll();
          } else {
            drawSliderFill(volume);
            drawHandle(volume);
            volPercText.setText(`${Math.round(volume * 100)}%`);
          }
          updateMuteVisual();
        } catch { /* ignore */ }
      }
    });

    controlY += 28;

    // ---- Music Volume ----
    this.add.text(controlX, controlY, 'MUSIC', {
      fontFamily: FONTS.BODY,
      fontSize: '11px',
      color: '#7788aa',
      letterSpacing: 2,
      resolution: 2,
    });
    controlY += 18;

    // Get current music volume from AudioManager or persisted settings
    let musicVol = audioManager?.getMusicVolume() ?? persistedSettings.musicVolume;
    const musicSliderY = controlY; // Capture Y for closures

    const musicSliderTrack = this.add.graphics();
    musicSliderTrack.fillStyle(COLORS.BG_DEEPEST, 1);
    musicSliderTrack.fillRoundedRect(controlX, musicSliderY, sliderWidth, sliderHeight, 3);
    musicSliderTrack.lineStyle(1, COLORS.GOLD_DIM, 0.3);
    musicSliderTrack.strokeRoundedRect(controlX, musicSliderY, sliderWidth, sliderHeight, 3);

    const musicSliderFill = this.add.graphics();
    const drawMusicFill = (vol: number) => {
      musicSliderFill.clear();
      musicSliderFill.fillStyle(COLORS.GOLD, 0.7);
      const fillW = Math.max(3, sliderWidth * vol);
      musicSliderFill.fillRoundedRect(controlX, musicSliderY, fillW, sliderHeight, 3);
    };
    drawMusicFill(musicVol);

    const musicHandle = this.add.graphics();
    const drawMusicHandle = (vol: number) => {
      musicHandle.clear();
      const hx = controlX + sliderWidth * vol - handleSize / 2;
      const hy = musicSliderY + sliderHeight / 2 - handleSize / 2;
      musicHandle.fillStyle(0x000000, 0.3);
      musicHandle.fillRoundedRect(hx + 1, hy + 1, handleSize, handleSize, 4);
      musicHandle.fillStyle(0xffffff, 1);
      musicHandle.fillRoundedRect(hx, hy, handleSize, handleSize, 4);
      musicHandle.lineStyle(1.5, COLORS.GOLD, 0.6);
      musicHandle.strokeRoundedRect(hx, hy, handleSize, handleSize, 4);
    };
    drawMusicHandle(musicVol);

    const musicPercText = this.add.text(controlX + sliderWidth + 8, musicSliderY - 3, `${Math.round(musicVol * 100)}%`, {
      fontFamily: FONTS.MONO,
      fontSize: '12px',
      color: COLORS.TEXT_WHITE,
      resolution: 2,
    });

    const musicSliderZone = this.add.zone(controlX + sliderWidth / 2, musicSliderY + 3, sliderWidth + handleSize, 24)
      .setInteractive({ useHandCursor: true });

    let isMusicDragging = false;

    const updateMusicVolume = (pointerX: number) => {
      const localX = pointerX - controlX;
      musicVol = Phaser.Math.Clamp(localX / sliderWidth, 0, 1);
      drawMusicFill(musicVol);
      drawMusicHandle(musicVol);
      musicPercText.setText(`${Math.round(musicVol * 100)}%`);
      if (audioManager) {
        audioManager.setMusicVolume(musicVol);
      } else {
        // Persist directly when no AudioManager instance exists (e.g., MainMenu)
        try {
          const s = AudioManager.loadSettings();
          s.musicVolume = musicVol;
          localStorage.setItem('digimerge_audio_settings', JSON.stringify(s));
        } catch { /* ignore */ }
      }
      // Also update menu music playing directly via Phaser (not through AudioManager)
      for (const key of ['music_menu', 'music_battle']) {
        const sounds = this.sound.getAll(key);
        for (const s of sounds) {
          (s as any).volume = musicVol;
        }
      }
    };

    musicSliderZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      isMusicDragging = true;
      updateMusicVolume(pointer.x);
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (isMusicDragging) updateMusicVolume(pointer.x);
    });

    this.input.on('pointerup', () => { isMusicDragging = false; });

    controlY += 28;

    // Separator
    const optionsSep = this.add.graphics();
    drawSeparator(optionsSep, panelX + 20, controlY, panelX + panelWidth - 20);
    controlY += 12;

    // ---- Display Options ----
    this.add.text(controlX, controlY, 'DISPLAY', {
      fontFamily: FONTS.BODY,
      fontSize: '11px',
      color: '#7788aa',
      letterSpacing: 2,
      resolution: 2,
    });
    controlY += 20;

    // Damage Numbers Toggle
    const showDmgNumbers = this.registry.get('showDamageNumbers') !== false;

    const dmgRow = this.add.container(0, controlY);
    dmgRow.add(this.add.text(controlX, 0, 'Damage Numbers', {
      fontFamily: FONTS.BODY,
      fontSize: '13px',
      color: '#aabbcc',
      resolution: 2,
    }));

    const dmgBtnW = 50;
    const dmgBtnH = 22;
    const dmgBtnContainer = this.add.container(panelX + panelWidth - 44, 0);
    const dmgBtnBg = this.add.graphics();
    drawButton(dmgBtnBg, dmgBtnW, dmgBtnH, showDmgNumbers ? COLORS.CYAN_DIM : COLORS.BG_PANEL_LIGHT);
    dmgBtnContainer.add(dmgBtnBg);

    const dmgText = this.add.text(0, 0, showDmgNumbers ? 'ON' : 'OFF', {
      fontFamily: FONTS.BODY,
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold',
      resolution: 2,
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
    controlY += 26;

    // Health Bar Mode Toggle
    const HEALTH_MODES: Array<'all' | 'bosses' | 'off'> = ['all', 'bosses', 'off'];
    const HEALTH_MODE_LABELS: Record<string, string> = { all: 'All', bosses: 'Bosses', off: 'Off' };
    let currentHpMode: string = this.registry.get('healthBarMode') ?? 'all';

    const hpRow = this.add.container(0, controlY);
    hpRow.add(this.add.text(controlX, 0, 'Health Bars', {
      fontFamily: FONTS.BODY,
      fontSize: '13px',
      color: '#aabbcc',
      resolution: 2,
    }));

    const hpBtnW = 62;
    const hpBtnH = 22;
    const hpBtnContainer = this.add.container(panelX + panelWidth - 50, 0);
    const hpBtnBg = this.add.graphics();
    drawButton(hpBtnBg, hpBtnW, hpBtnH, COLORS.CYAN_DIM);
    hpBtnContainer.add(hpBtnBg);

    const hpText = this.add.text(0, 0, HEALTH_MODE_LABELS[currentHpMode], {
      fontFamily: FONTS.BODY,
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold',
      resolution: 2,
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
    controlY += 26;

    // Separator before save section
    const saveSep = this.add.graphics();
    drawSeparator(saveSep, panelX + 20, controlY, panelX + panelWidth - 20);
    controlY += 12;

    // ---- Save Export/Import ----
    this.add.text(controlX, controlY, 'SAVE DATA', {
      fontFamily: FONTS.BODY,
      fontSize: '11px',
      color: '#7788aa',
      letterSpacing: 2,
      resolution: 2,
    });
    controlY += 24;

    const halfBtnW = 82;
    // Export button
    this.createActionButton(width / 2 - halfBtnW / 2 - 6, controlY, halfBtnW, 28, 'Export', COLORS.MERGE, COLORS.MERGE_HOVER, () => {
      const exported = SaveManager.exportSave();
      if (exported) {
        saveStatusText.setText('Save exported!').setColor('#44cc88');
      } else {
        saveStatusText.setText('No save to export').setColor('#ff6666');
      }
      this.time.delayedCall(3000, () => saveStatusText.setText(''));
    });

    // Import button
    this.createActionButton(width / 2 + halfBtnW / 2 + 6, controlY, halfBtnW, 28, 'Import', COLORS.SPECIAL, COLORS.SPECIAL_HOVER, () => {
      // Create a hidden file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const result = SaveManager.validateImport(reader.result as string);
          if (typeof result === 'string') {
            saveStatusText.setText(result).setColor('#ff6666');
            this.time.delayedCall(4000, () => saveStatusText.setText(''));
          } else {
            SaveManager.importSave(result);
            saveStatusText.setText('Save imported! Restart to apply.').setColor('#44cc88');
            this.time.delayedCall(4000, () => saveStatusText.setText(''));
          }
        };
        reader.onerror = () => {
          saveStatusText.setText('Failed to read file').setColor('#ff6666');
          this.time.delayedCall(3000, () => saveStatusText.setText(''));
        };
        reader.readAsText(file);
      };
      input.click();
    });

    controlY += 32;

    // Status text for import feedback (below Export/Import buttons)
    const saveStatusText = this.add.text(width / 2, controlY, '', {
      fontFamily: FONTS.MONO,
      fontSize: '10px',
      color: '#44cc88',
      resolution: 2,
    }).setOrigin(0.5);

    controlY += 16;

    // Clear High Scores button
    if (HighScoreManager.hasHighScores()) {
      const clearHsBtnW = 150;
      const clearHsBtnH = 26;
      const clearHsContainer = this.add.container(width / 2, controlY);
      const clearHsBg = this.add.graphics();
      drawButton(clearHsBg, clearHsBtnW, clearHsBtnH, COLORS.BG_PANEL_LIGHT);
      clearHsContainer.add(clearHsBg);

      const clearHsText = this.add.text(0, 0, 'Clear High Scores', {
        fontFamily: FONTS.BODY,
        fontSize: '11px',
        color: '#ff6666',
        fontStyle: 'bold',
        resolution: 2,
      }).setOrigin(0.5);
      clearHsContainer.add(clearHsText);

      const clearHsHitArea = new Phaser.Geom.Rectangle(-clearHsBtnW / 2, -clearHsBtnH / 2, clearHsBtnW, clearHsBtnH);
      clearHsContainer.setInteractive(clearHsHitArea, Phaser.Geom.Rectangle.Contains);
      clearHsContainer.input!.cursor = 'pointer';

      clearHsContainer.on('pointerover', () => {
        drawButton(clearHsBg, clearHsBtnW, clearHsBtnH, COLORS.DANGER, { glowRing: true });
        animateButtonHover(this, clearHsContainer, true);
      });
      clearHsContainer.on('pointerout', () => {
        drawButton(clearHsBg, clearHsBtnW, clearHsBtnH, COLORS.BG_PANEL_LIGHT);
        animateButtonHover(this, clearHsContainer, false);
      });
      clearHsContainer.on('pointerdown', () => {
        animateButtonPress(this, clearHsContainer);
        HighScoreManager.clearHighScores();
        clearHsText.setText('Cleared!').setColor('#44cc88');
        clearHsContainer.removeInteractive();
      });

      controlY += 32;
    }

    // Separator before action buttons
    const actionSep = this.add.graphics();
    drawSeparator(actionSep, panelX + 20, controlY, panelX + panelWidth - 20);
    controlY += 14;

    // ---- Action Buttons ----
    const btnW = 180;
    const btnH = 34;
    const btnCenterX = width / 2;

    // Close button
    this.createActionButton(btnCenterX, controlY, btnW, btnH, 'Close', COLORS.PRIMARY, COLORS.PRIMARY_HOVER, () => {
      this.scene.stop();
    });
    controlY += 38;

    if (showGameButtons) {
      // Restart button
      this.createActionButton(btnCenterX, controlY, btnW, btnH, 'Restart', COLORS.SPECIAL, COLORS.SPECIAL_HOVER, () => {
        const gameScene = this.scene.get('GameScene');
        this.scene.stop();
        if (gameScene) {
          gameScene.scene.restart();
        }
      });
      controlY += 38;

      // Main Menu button
      this.createActionButton(btnCenterX, controlY, btnW, btnH, 'Main Menu', COLORS.DANGER, COLORS.DANGER_HOVER, () => {
        this.scene.stop('GameScene');
        this.scene.stop();
        this.scene.start('MainMenuScene');
      });
    }

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
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 2, fill: true },
      resolution: 2,
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
