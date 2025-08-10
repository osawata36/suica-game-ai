const { describe, test, expect, beforeEach, jest } = require('@jest/globals');

// Import the game class - we need to load it in a way that works with our mocks
const fs = require('fs');
const path = require('path');

// Read the game.js file and evaluate it
const gameCode = fs.readFileSync(path.join(__dirname, '../game.js'), 'utf8');
eval(gameCode);

describe('SuicaGame', () => {
  let game;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create new game instance
    game = new SuicaGame();
  });

  describe('Initialization', () => {
    test('should initialize game with correct default values', () => {
      expect(game.score).toBe(0);
      expect(game.gameState).toBe('menu');
      expect(game.fruits).toEqual([]);
      expect(game.canDrop).toBe(true);
    });

    test('should have correct canvas dimensions', () => {
      expect(game.width).toBe(400);
      expect(game.height).toBe(600);
    });

    test('should have 11 fruit types defined', () => {
      expect(game.fruitTypes).toHaveLength(11);
      expect(game.fruitTypes[0].name).toBe('cherry');
      expect(game.fruitTypes[10].name).toBe('watermelon');
    });

    test('should initialize fruit renderer', () => {
      expect(game.fruitRenderer).toBeDefined();
    });
  });

  describe('Game State Management', () => {
    test('should start game when startGame is called', () => {
      game.startGame();
      expect(game.gameState).toBe('playing');
      expect(game.score).toBe(0);
      expect(game.fruits).toEqual([]);
    });

    test('should restart game when restartGame is called', () => {
      game.score = 100;
      game.fruits = [{ x: 100, y: 100 }];
      game.gameState = 'playing';
      
      game.restartGame();
      
      expect(game.gameState).toBe('playing');
      expect(game.score).toBe(0);
      expect(game.fruits).toEqual([]);
    });

    test('should end game when endGame is called', () => {
      game.gameState = 'playing';
      game.endGame();
      expect(game.gameState).toBe('gameover');
    });
  });

  describe('Fruit Generation', () => {
    test('should generate next fruit type within valid range', () => {
      game.generateNextFruit();
      expect(game.nextFruitType).toBeGreaterThanOrEqual(0);
      expect(game.nextFruitType).toBeLessThan(5); // Only first 5 fruit types can be generated
    });

    test('should create fruit at drop position', () => {
      game.gameState = 'playing';
      game.dropPosition = 200;
      game.nextFruitType = 0; // cherry
      
      game.dropFruit();
      
      expect(game.fruits).toHaveLength(1);
      expect(game.fruits[0].x).toBe(200);
      expect(game.fruits[0].type).toBe(0);
    });

    test('should not drop fruit when canDrop is false', () => {
      game.gameState = 'playing';
      game.canDrop = false;
      
      const initialFruitCount = game.fruits.length;
      game.dropFruit();
      
      expect(game.fruits).toHaveLength(initialFruitCount);
    });

    test('should not drop fruit when game is not playing', () => {
      game.gameState = 'menu';
      
      const initialFruitCount = game.fruits.length;
      game.dropFruit();
      
      expect(game.fruits).toHaveLength(initialFruitCount);
    });
  });

  describe('Physics and Collision', () => {
    test('should apply gravity to fruits', () => {
      const fruit = {
        x: 200,
        y: 100,
        vx: 0,
        vy: 0,
        radius: 15,
        type: 0
      };
      game.fruits = [fruit];
      
      game.updatePhysics();
      
      expect(fruit.vy).toBeGreaterThan(0); // Gravity applied
    });

    test('should detect collision between two fruits', () => {
      const fruit1 = { x: 100, y: 100, radius: 15 };
      const fruit2 = { x: 110, y: 100, radius: 15 }; // Overlapping
      
      expect(game.checkCollision(fruit1, fruit2)).toBe(true);
    });

    test('should not detect collision for distant fruits', () => {
      const fruit1 = { x: 100, y: 100, radius: 15 };
      const fruit2 = { x: 200, y: 100, radius: 15 }; // Far apart
      
      expect(game.checkCollision(fruit1, fruit2)).toBe(false);
    });

    test('should merge fruits of same type', () => {
      const fruit1 = { x: 100, y: 100, radius: 15, type: 0, vx: 0, vy: 0 };
      const fruit2 = { x: 110, y: 100, radius: 15, type: 0, vx: 0, vy: 0 };
      game.fruits = [fruit1, fruit2];
      game.score = 0;
      
      game.updatePhysics();
      
      // Should have one fruit less and score should increase
      expect(game.fruits).toHaveLength(1);
      expect(game.score).toBeGreaterThan(0);
    });
  });

  describe('Boundary Detection', () => {
    test('should keep fruit within canvas width', () => {
      const fruit = {
        x: -10, // Outside left boundary
        y: 100,
        vx: -5,
        vy: 0,
        radius: 15,
        type: 0
      };
      game.fruits = [fruit];
      
      game.updatePhysics();
      
      expect(fruit.x).toBeGreaterThanOrEqual(fruit.radius);
    });

    test('should detect danger line violation', () => {
      const fruit = {
        x: 200,
        y: 50, // Above danger line (15% of canvas height = 90px)
        radius: 15,
        type: 0,
        settled: true
      };
      
      expect(game.isDangerLineViolated(fruit)).toBe(true);
    });
  });

  describe('Score System', () => {
    test('should add score when fruits merge', () => {
      const initialScore = game.score;
      const points = 10;
      
      game.addScore(points);
      
      expect(game.score).toBe(initialScore + points);
    });

    test('should update score display', () => {
      const mockScoreElement = { textContent: '0' };
      document.getElementById = jest.fn().mockReturnValue(mockScoreElement);
      
      game.addScore(100);
      
      expect(mockScoreElement.textContent).toBe('100');
    });
  });

  describe('Fruit Drawing', () => {
    test('should call drawFruit for each fruit', () => {
      const mockContext = game.ctx;
      const spy = jest.spyOn(game, 'drawFruit');
      
      game.fruits = [
        { x: 100, y: 100, radius: 15, type: 0 },
        { x: 200, y: 200, radius: 20, type: 1 }
      ];
      
      game.draw();
      
      expect(spy).toHaveBeenCalledTimes(2);
    });

    test('should draw custom strawberry shape', () => {
      const fruit = { x: 200, y: 300, radius: 20, type: 1 }; // strawberry
      const mockContext = game.ctx;
      
      game.drawFruit(fruit);
      
      // Verify that custom drawing was called (shadow only, no circle background)
      const drawCalls = mockContext.drawCalls;
      const hasCircleBackground = drawCalls.some(call => 
        call.method === 'arc' && call.args[2] === 20 // radius matching fruit
      );
      expect(hasCircleBackground).toBe(false); // Should not draw circle background for strawberry
    });

    test('should use SVG renderer for supported fruits', () => {
      // Mock hasSVG to return true for cherry
      game.fruitRenderer.hasSVG = jest.fn().mockReturnValue(true);
      const drawFruitSpy = jest.spyOn(game.fruitRenderer, 'drawFruit');
      
      const fruit = { x: 200, y: 300, radius: 15, type: 0 }; // cherry
      
      game.drawFruit(fruit);
      
      expect(drawFruitSpy).toHaveBeenCalledWith(
        game.ctx, 
        'cherry', 
        200, 
        300, 
        15
      );
    });
  });

  describe('Game Loop', () => {
    test('should update game state in game loop', () => {
      const updateSpy = jest.spyOn(game, 'update');
      const drawSpy = jest.spyOn(game, 'draw');
      
      // Mock requestAnimationFrame to call callback immediately
      window.requestAnimationFrame = jest.fn((cb) => {
        cb();
        return 1;
      });
      
      game.gameLoop();
      
      expect(updateSpy).toHaveBeenCalled();
      expect(drawSpy).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle missing DOM elements gracefully', () => {
      document.getElementById = jest.fn().mockReturnValue(null);
      
      expect(() => {
        new SuicaGame();
      }).not.toThrow();
    });

    test('should handle invalid fruit types', () => {
      const invalidFruit = { x: 200, y: 300, radius: 15, type: 999 }; // Invalid type
      
      expect(() => {
        game.drawFruit(invalidFruit);
      }).not.toThrow();
    });
  });
});