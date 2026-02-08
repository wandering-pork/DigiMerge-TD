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

// --- Background tab workaround ---
// Browsers pause requestAnimationFrame when a tab is hidden.
// We use a Web Worker with setInterval to keep ticking the game loop
// in the background. The worker only drives updates while the tab is hidden;
// when visible, normal RAF takes over.
const workerBlob = new Blob(
  [`setInterval(()=>postMessage(0),${1000 / 60})`],
  { type: 'application/javascript' },
);
const worker = new Worker(URL.createObjectURL(workerBlob));
let lastBgTime = 0;

worker.onmessage = () => {
  // Only step while the document is hidden (RAF is paused)
  if (!document.hidden) return;

  const now = performance.now();
  if (lastBgTime === 0) lastBgTime = now;
  const delta = now - lastBgTime;
  lastBgTime = now;

  // Drive Phaser's TimeStep manually
  if (delta > 0 && delta < 500) {
    game.loop.step(now);
  }
};

// Reset background timer when visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    lastBgTime = performance.now();
  } else {
    lastBgTime = 0;
  }
});

export default game;
