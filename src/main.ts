import Phaser from 'phaser';
import { gameConfig } from '@/config/GameConfig';

// Patch Text to default high resolution for crisp rendering with pixelArt + Scale.FIT.
// pixelArt:true forces NEAREST on the canvas, making text blocky at non-native sizes.
// Use devicePixelRatio (min 2) to render text at native display resolution.
const TEXT_RESOLUTION = Math.max(2, Math.ceil(window.devicePixelRatio || 2));
const origSetStyle = Phaser.GameObjects.Text.prototype.setStyle;
Phaser.GameObjects.Text.prototype.setStyle = function (style: any) {
  if (style && style.resolution === undefined) {
    style.resolution = TEXT_RESOLUTION;
  }
  return origSetStyle.call(this, style);
};

const game = new Phaser.Game(gameConfig);

export default game;
