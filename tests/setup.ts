// Phaser mock setup for Vitest
// Since Phaser requires a browser/canvas context, we mock the necessary parts

import { vi } from 'vitest';

// Mock Phaser's EventEmitter for EventBus tests
vi.mock('phaser', () => {
  class MockEventEmitter {
    private listeners: Map<string, Set<Function>> = new Map();

    on(event: string, fn: Function) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, new Set());
      }
      this.listeners.get(event)!.add(fn);
      return this;
    }

    off(event: string, fn: Function) {
      this.listeners.get(event)?.delete(fn);
      return this;
    }

    emit(event: string, ...args: unknown[]) {
      this.listeners.get(event)?.forEach(fn => fn(...args));
      return true;
    }

    removeAllListeners() {
      this.listeners.clear();
      return this;
    }
  }

  return {
    default: {
      AUTO: 0,
      Scale: {
        FIT: 'FIT',
        CENTER_BOTH: 'CENTER_BOTH',
      },
      Events: {
        EventEmitter: MockEventEmitter,
      },
      Math: {
        Vector2: class {
          x: number;
          y: number;
          constructor(x = 0, y = 0) { this.x = x; this.y = y; }
        },
      },
      Scene: class {
        constructor(_config: unknown) {}
      },
      Game: class {
        constructor(_config: unknown) {}
      },
      GameObjects: {
        Container: class {},
        Sprite: class {},
        Graphics: class {},
        Text: class {},
      },
    },
    AUTO: 0,
    Scale: {
      FIT: 'FIT',
      CENTER_BOTH: 'CENTER_BOTH',
    },
    Events: {
      EventEmitter: MockEventEmitter,
    },
    Math: {
      Vector2: class {
        x: number;
        y: number;
        constructor(x = 0, y = 0) { this.x = x; this.y = y; }
      },
    },
    Scene: class {
      constructor(_config: unknown) {}
    },
    Game: class {
      constructor(_config: unknown) {}
    },
    GameObjects: {
      Container: class {},
      Sprite: class {},
      Graphics: class {},
      Text: class {},
    },
  };
});
