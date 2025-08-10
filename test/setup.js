// Mock Canvas API for testing
class MockCanvas {
  constructor() {
    this.width = 400;
    this.height = 600;
  }

  getContext(type) {
    if (type === '2d') {
      return new MockCanvasRenderingContext2D();
    }
    return null;
  }
}

class MockCanvasRenderingContext2D {
  constructor() {
    this.fillStyle = '#000000';
    this.strokeStyle = '#000000';
    this.lineWidth = 1;
    this.globalAlpha = 1;
    this.drawCalls = [];
  }

  beginPath() {
    this.drawCalls.push({ method: 'beginPath' });
  }

  closePath() {
    this.drawCalls.push({ method: 'closePath' });
  }

  moveTo(x, y) {
    this.drawCalls.push({ method: 'moveTo', args: [x, y] });
  }

  lineTo(x, y) {
    this.drawCalls.push({ method: 'lineTo', args: [x, y] });
  }

  arc(x, y, radius, startAngle, endAngle) {
    this.drawCalls.push({ method: 'arc', args: [x, y, radius, startAngle, endAngle] });
  }

  ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle) {
    this.drawCalls.push({ method: 'ellipse', args: [x, y, radiusX, radiusY, rotation, startAngle, endAngle] });
  }

  quadraticCurveTo(cpx, cpy, x, y) {
    this.drawCalls.push({ method: 'quadraticCurveTo', args: [cpx, cpy, x, y] });
  }

  fill() {
    this.drawCalls.push({ method: 'fill' });
  }

  stroke() {
    this.drawCalls.push({ method: 'stroke' });
  }

  save() {
    this.drawCalls.push({ method: 'save' });
  }

  restore() {
    this.drawCalls.push({ method: 'restore' });
  }

  createRadialGradient(x0, y0, r0, x1, y1, r1) {
    const gradient = {
      addColorStop: global.jest.fn()
    };
    this.drawCalls.push({ method: 'createRadialGradient', args: [x0, y0, r0, x1, y1, r1] });
    return gradient;
  }

  clearRect(x, y, width, height) {
    this.drawCalls.push({ method: 'clearRect', args: [x, y, width, height] });
  }
}

// Mock DOM elements
// Make jest available globally
global.jest = require('@jest/globals').jest;

global.document = {
  getElementById: global.jest.fn((id) => {
    if (id === 'gameCanvas') {
      return new MockCanvas();
    }
    if (id === 'score') {
      return { textContent: '0' };
    }
    if (id === 'next-fruit') {
      return { textContent: '🍒' };
    }
    if (id === 'startBtn' || id === 'restartBtn') {
      return { addEventListener: global.jest.fn() };
    }
    return null;
  }),
  createElement: global.jest.fn(() => ({ 
    getContext: () => new MockCanvasRenderingContext2D(),
    addEventListener: global.jest.fn()
  }))
};

global.window = {
  requestAnimationFrame: global.jest.fn((cb) => setTimeout(cb, 16)),
  cancelAnimationFrame: global.jest.fn(),
  FruitRenderer: class MockFruitRenderer {
    constructor() {
      this.svgCache = {};
      this.imageCache = {};
    }
    
    async loadAllFruits() {
      return Promise.resolve();
    }
    
    hasSVG() {
      return false;
    }
    
    drawFruit() {
      return;
    }
  }
};

// Mock fetch for SVG loading
global.fetch = global.jest.fn(() => 
  Promise.resolve({
    text: () => Promise.resolve('<svg></svg>')
  })
);

global.URL = {
  createObjectURL: global.jest.fn(() => 'mock-url'),
  revokeObjectURL: global.jest.fn()
};

global.Image = class {
  constructor() {
    this.onload = null;
    this.onerror = null;
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
  
  set src(value) {
    this._src = value;
  }
  
  get src() {
    return this._src;
  }
};

global.Blob = class {
  constructor(content, options) {
    this.content = content;
    this.options = options;
  }
};