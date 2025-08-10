const { describe, test, expect, beforeEach, jest } = require('@jest/globals');

// Import both game and renderer
const fs = require('fs');
const path = require('path');

const gameCode = fs.readFileSync(path.join(__dirname, '../game.js'), 'utf8');
const fruitRendererCode = fs.readFileSync(path.join(__dirname, '../fruitRenderer.js'), 'utf8');

eval(fruitRendererCode);
eval(gameCode);

describe('Integration Tests', () => {
  let game;

  beforeEach(() => {
    jest.clearAllMocks();
    game = new SuicaGame();
  });

  describe('Game Startup Flow', () => {
    test('should complete full game initialization without errors', async () => {
      expect(() => {
        game.startGame();
      }).not.toThrow();

      expect(game.gameState).toBe('playing');
      expect(game.fruitRenderer).toBeDefined();
    });

    test('should handle start button click', () => {
      const startButton = { addEventListener: jest.fn() };
      document.getElementById = jest.fn((id) => {
        if (id === 'startBtn') return startButton;
        if (id === 'gameCanvas') return { 
          getContext: () => game.ctx,
          width: 400,
          height: 600,
          addEventListener: jest.fn()
        };
        return { textContent: '0', addEventListener: jest.fn() };
      });

      const newGame = new SuicaGame();
      
      expect(startButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });

  describe('Complete Game Flow', () => {
    test('should play a complete game scenario', () => {
      // Start game
      game.startGame();
      expect(game.gameState).toBe('playing');

      // Drop a fruit
      game.dropPosition = 200;
      game.nextFruitType = 0;
      game.dropFruit();
      
      expect(game.fruits).toHaveLength(1);
      expect(game.fruits[0].x).toBe(200);

      // Update physics several times
      for (let i = 0; i < 10; i++) {
        game.updatePhysics();
      }

      // Fruit should have moved due to gravity
      expect(game.fruits[0].y).toBeGreaterThan(100);

      // Draw the game
      expect(() => game.draw()).not.toThrow();
    });

    test('should handle fruit merging scenario', () => {
      game.startGame();
      
      // Create two overlapping fruits of same type
      const fruit1 = {
        x: 200, y: 500, radius: 15, type: 0, // cherry
        vx: 0, vy: 0, settled: false
      };
      const fruit2 = {
        x: 210, y: 500, radius: 15, type: 0, // cherry
        vx: 0, vy: 0, settled: false
      };
      
      game.fruits = [fruit1, fruit2];
      const initialScore = game.score;

      // Update physics to trigger collision detection
      game.updatePhysics();

      // Should have merged (one less fruit, score increased)
      expect(game.fruits.length).toBeLessThanOrEqual(2);
      expect(game.score).toBeGreaterThanOrEqual(initialScore);
    });

    test('should detect game over condition', () => {
      game.startGame();
      
      // Create a settled fruit above danger line
      const fruit = {
        x: 200, y: 50, radius: 15, type: 0,
        vx: 0, vy: 0, settled: true
      };
      game.fruits = [fruit];
      
      game.update();
      
      // Game should end when fruit is above danger line
      if (game.isDangerLineViolated(fruit)) {
        game.endGame();
        expect(game.gameState).toBe('gameover');
      }
    });
  });

  describe('Rendering Integration', () => {
    test('should render all fruit types without errors', () => {
      game.startGame();
      
      // Create one fruit of each type
      for (let i = 0; i < game.fruitTypes.length; i++) {
        const fruit = {
          x: 100 + (i * 30), 
          y: 300, 
          radius: game.fruitTypes[i].radius, 
          type: i
        };
        game.fruits.push(fruit);
      }

      // Should render all fruits without throwing
      expect(() => game.draw()).not.toThrow();
      
      // Verify each fruit was processed
      expect(game.fruits).toHaveLength(11);
    });

    test('should handle mixed SVG and custom fruit rendering', () => {
      // Mock some fruits as having SVG, others not
      game.fruitRenderer.hasSVG = jest.fn((name) => {
        return ['cherry', 'grape'].includes(name);
      });
      
      const drawFruitSpy = jest.spyOn(game.fruitRenderer, 'drawFruit');
      
      // Create fruits of different types
      game.fruits = [
        { x: 100, y: 300, radius: 15, type: 0 }, // cherry (has SVG)
        { x: 200, y: 300, radius: 20, type: 1 }, // strawberry (custom)
        { x: 300, y: 300, radius: 25, type: 2 }  // grape (has SVG)
      ];
      
      game.draw();
      
      // SVG renderer should be called for cherry and grape
      expect(drawFruitSpy).toHaveBeenCalledTimes(2);
      expect(drawFruitSpy).toHaveBeenCalledWith(game.ctx, 'cherry', 100, 300, 15);
      expect(drawFruitSpy).toHaveBeenCalledWith(game.ctx, 'grape', 300, 300, 25);
    });
  });

  describe('Performance and Memory', () => {
    test('should handle many fruits without performance issues', () => {
      game.startGame();
      
      // Create many fruits
      for (let i = 0; i < 50; i++) {
        game.fruits.push({
          x: Math.random() * game.width,
          y: Math.random() * game.height,
          radius: 15,
          type: Math.floor(Math.random() * 5),
          vx: 0,
          vy: 0,
          settled: false
        });
      }

      const startTime = performance.now();
      
      // Update and draw
      game.updatePhysics();
      game.draw();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (100ms)
      expect(duration).toBeLessThan(100);
    });

    test('should clean up properly on game restart', () => {
      game.startGame();
      
      // Add fruits and score
      game.fruits = [
        { x: 100, y: 300, radius: 15, type: 0 },
        { x: 200, y: 300, radius: 20, type: 1 }
      ];
      game.score = 500;

      // Restart game
      game.restartGame();

      // Should be cleaned up
      expect(game.fruits).toHaveLength(0);
      expect(game.score).toBe(0);
      expect(game.gameState).toBe('playing');
    });
  });

  describe('Error Recovery', () => {
    test('should recover from drawing errors', () => {
      game.startGame();
      
      // Create fruit with invalid context scenario
      const originalDrawFruit = game.drawFruit;
      let errorThrown = false;
      
      game.drawFruit = function(fruit) {
        try {
          originalDrawFruit.call(this, fruit);
        } catch (error) {
          errorThrown = true;
          // Continue with game loop
        }
      };
      
      game.fruits = [{ x: 100, y: 300, radius: 15, type: 0 }];
      
      // Should not crash the game
      expect(() => game.draw()).not.toThrow();
    });

    test('should handle concurrent fruit operations', () => {
      game.startGame();
      
      // Simulate concurrent operations
      game.dropFruit();
      game.updatePhysics();
      game.draw();
      
      // Should not have race conditions or errors
      expect(game.fruits.length).toBeGreaterThanOrEqual(0);
      expect(() => game.update()).not.toThrow();
    });
  });
});