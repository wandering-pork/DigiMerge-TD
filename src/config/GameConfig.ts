import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './Constants';
import { BootScene } from '@/scenes/BootScene';
import { PreloadScene } from '@/scenes/PreloadScene';
import { MainMenuScene } from '@/scenes/MainMenuScene';
import { StarterSelectScene } from '@/scenes/StarterSelectScene';
import { GameScene } from '@/scenes/GameScene';
import { PauseScene } from '@/scenes/PauseScene';
import { SettingsScene } from '@/scenes/SettingsScene';
import { GameOverScene } from '@/scenes/GameOverScene';
import { EncyclopediaScene } from '@/scenes/EncyclopediaScene';
import { CreditsScene } from '@/scenes/CreditsScene';
import { HighScoresScene } from '@/scenes/HighScoresScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#0f0a14',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    StarterSelectScene,
    GameScene,
    PauseScene,
    SettingsScene,
    GameOverScene,
    EncyclopediaScene,
    CreditsScene,
    HighScoresScene,
  ],
};
