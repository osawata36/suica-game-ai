class SuicaGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.fruits = [];
        this.score = 0;
        this.gameState = 'menu';
        this.dangerLine = this.height * 0.15;
        this.gravity = 0.3;
        this.friction = 0.99;
        this.restitution = 0.3;
        
        // Initialize fruit renderer
        this.fruitRenderer = new FruitRenderer();
        
        this.fruitTypes = [
            { name: 'cherry', emoji: '🍒', color: '#ff1744', darkColor: '#c5185d', radius: 15, points: 10 },
            { name: 'strawberry', emoji: '🍓', color: '#ff5252', darkColor: '#d32f2f', radius: 20, points: 20 },
            { name: 'grape', emoji: '🍇', color: '#7b1fa2', darkColor: '#4a148c', radius: 25, points: 40 },
            { name: 'orange', emoji: '🍊', color: '#ff9800', darkColor: '#f57c00', radius: 30, points: 80 },
            { name: 'persimmon', emoji: '🥭', color: '#ff6f00', darkColor: '#ff8f00', radius: 35, points: 160 },
            { name: 'apple', emoji: '🍎', color: '#f44336', darkColor: '#c62828', radius: 40, points: 320 },
            { name: 'pear', emoji: '🍐', color: '#8bc34a', darkColor: '#689f38', radius: 45, points: 640 },
            { name: 'peach', emoji: '🍑', color: '#ffab91', darkColor: '#ff8a65', radius: 50, points: 1280 },
            { name: 'pineapple', emoji: '🍍', color: '#ffc107', darkColor: '#ff8f00', radius: 55, points: 2560 },
            { name: 'melon', emoji: '🍈', color: '#4caf50', darkColor: '#388e3c', radius: 60, points: 5120 },
            { name: 'watermelon', emoji: '🍉', color: '#2e7d32', darkColor: '#1b5e20', radius: 70, points: 10240 }
        ];
        
        this.nextFruitType = 0;
        this.dropPosition = this.width / 2;
        this.canDrop = true;
        
        this.init();
    }
    
    async init() {
        // Load SVG images first
        await this.fruitRenderer.loadAllFruits();
        
        this.setupEventListeners();
        this.generateNextFruit();
        this.gameLoop();
    }
    
    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.gameState === 'playing') {
                const rect = this.canvas.getBoundingClientRect();
                this.dropPosition = Math.max(30, Math.min(this.width - 30, e.clientX - rect.left));
            }
        });
        
        this.canvas.addEventListener('click', (e) => {
            if (this.gameState === 'playing' && this.canDrop) {
                this.dropFruit();
            }
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') {
                const rect = this.canvas.getBoundingClientRect();
                const touch = e.touches[0];
                this.dropPosition = Math.max(30, Math.min(this.width - 30, touch.clientX - rect.left));
                if (this.canDrop) {
                    this.dropFruit();
                }
            }
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') {
                const rect = this.canvas.getBoundingClientRect();
                const touch = e.touches[0];
                this.dropPosition = Math.max(30, Math.min(this.width - 30, touch.clientX - rect.left));
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (this.gameState === 'playing') {
                switch(e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.dropPosition = Math.max(30, this.dropPosition - 10);
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.dropPosition = Math.min(this.width - 30, this.dropPosition + 10);
                        break;
                    case 'ArrowDown':
                    case ' ':
                        e.preventDefault();
                        if (this.canDrop) {
                            this.dropFruit();
                        }
                        break;
                }
            }
        });
    }
    
    generateNextFruit() {
        this.nextFruitType = Math.floor(Math.random() * Math.min(5, this.fruitTypes.length));
        document.getElementById('next-fruit').textContent = this.fruitTypes[this.nextFruitType].emoji;
    }
    
    drawFruit(fruit) {
        const ctx = this.ctx;
        const x = fruit.x;
        const y = fruit.y;
        const radius = fruit.radius;
        const fruitType = this.fruitTypes[fruit.type];
        
        // Check if we have SVG for this fruit (but skip custom-drawn fruits)
        if (this.fruitRenderer.hasSVG(fruitType.name) && !['strawberry', 'cherry', 'grape', 'orange', 'persimmon', 'apple', 'pear', 'peach', 'pineapple', 'melon', 'watermelon'].includes(fruitType.name)) {
            this.fruitRenderer.drawFruit(ctx, fruitType.name, x, y, radius);
        } else {
            // Special cases for custom-drawn fruits - don't draw circle background
            if (['strawberry', 'cherry', 'grape', 'orange', 'persimmon', 'apple', 'pear', 'peach', 'pineapple', 'melon', 'watermelon'].includes(fruitType.name)) {
                // Draw shadow
                ctx.save();
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.ellipse(x + 2, y + radius * 0.8, radius * 0.8, radius * 0.3, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                
                // Draw custom fruit shape
                this.drawFruitDetails(fruit, x, y, radius);
            } else {
                // Fallback to original rendering for other fruits without SVG
                // Create gradient for 3D effect
                const gradient = ctx.createRadialGradient(
                    x - radius * 0.3, y - radius * 0.3, 0,
                    x, y, radius
                );
                gradient.addColorStop(0, fruitType.color);
                gradient.addColorStop(0.7, fruitType.darkColor);
                gradient.addColorStop(1, fruitType.darkColor);
                
                // Draw shadow
                ctx.save();
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.ellipse(x + 2, y + radius * 0.8, radius * 0.8, radius * 0.3, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                
                // Draw main fruit body
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Add highlight for glossy effect
                const highlightGradient = ctx.createRadialGradient(
                    x - radius * 0.3, y - radius * 0.3, 0,
                    x - radius * 0.3, y - radius * 0.3, radius * 0.4
                );
                highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
                highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                ctx.fillStyle = highlightGradient;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Add fruit-specific details
                this.drawFruitDetails(fruit, x, y, radius);
            }
        }
    }
    
    drawFruitDetails(fruit, x, y, radius) {
        const ctx = this.ctx;
        const fruitType = this.fruitTypes[fruit.type];
        
        ctx.save();
        
        switch(fruitType.name) {
            case 'cherry':
                // Draw two cherries
                const cherry1X = x - radius * 0.5;
                const cherry2X = x + radius * 0.5;
                const cherryY = y + radius * 0.2;
                
                // Cherry 1
                ctx.fillStyle = '#c62828';
                ctx.beginPath();
                ctx.arc(cherry1X, cherryY, radius * 0.7, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#ff1744';
                ctx.beginPath();
                ctx.arc(cherry1X, cherryY, radius * 0.65, 0, Math.PI * 2);
                ctx.fill();
                
                // Cherry 2
                ctx.fillStyle = '#c62828';
                ctx.beginPath();
                ctx.arc(cherry2X, cherryY, radius * 0.7, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#ff1744';
                ctx.beginPath();
                ctx.arc(cherry2X, cherryY, radius * 0.65, 0, Math.PI * 2);
                ctx.fill();
                
                // Stems
                ctx.strokeStyle = '#4a5d23';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(cherry1X, cherryY - radius * 0.6);
                ctx.quadraticCurveTo(x - radius * 0.2, y - radius * 0.8, x, y - radius);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(cherry2X, cherryY - radius * 0.6);
                ctx.quadraticCurveTo(x + radius * 0.2, y - radius * 0.8, x, y - radius);
                ctx.stroke();
                
                // Highlights
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(cherry1X - radius * 0.2, cherryY - radius * 0.2, radius * 0.2, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(cherry2X - radius * 0.2, cherryY - radius * 0.2, radius * 0.2, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'strawberry':
                // Make strawberry shape more realistic - wider at top, pointed at bottom
                ctx.fillStyle = fruitType.color;
                ctx.beginPath();
                // Create heart-like strawberry shape
                ctx.moveTo(x, y + radius);  // Bottom point
                ctx.quadraticCurveTo(x - radius * 1.2, y, x - radius * 0.8, y - radius * 0.5);
                ctx.quadraticCurveTo(x - radius * 0.6, y - radius * 0.9, x, y - radius * 0.7);
                ctx.quadraticCurveTo(x + radius * 0.6, y - radius * 0.9, x + radius * 0.8, y - radius * 0.5);
                ctx.quadraticCurveTo(x + radius * 1.2, y, x, y + radius);
                ctx.fill();
                
                // Draw strawberry seeds pattern
                ctx.fillStyle = '#f9e79f';
                const seedPositions = [
                    {sx: -0.3, sy: -0.4}, {sx: 0.3, sy: -0.4},
                    {sx: -0.5, sy: 0}, {sx: 0, sy: 0}, {sx: 0.5, sy: 0},
                    {sx: -0.3, sy: 0.4}, {sx: 0.3, sy: 0.4},
                    {sx: 0, sy: -0.6}, {sx: -0.4, sy: 0.2}, {sx: 0.4, sy: 0.2}
                ];
                for (let pos of seedPositions) {
                    const seedX = x + pos.sx * radius;
                    const seedY = y + pos.sy * radius;
                    ctx.beginPath();
                    ctx.arc(seedX, seedY, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
                // Add strawberry top leaves (calyx)
                ctx.fillStyle = '#2e7d32';
                // Draw star-shaped calyx
                ctx.beginPath();
                for (let i = 0; i < 10; i++) {
                    const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
                    const r = i % 2 === 0 ? radius * 0.5 : radius * 0.25;
                    const leafX = x + Math.cos(angle) * r;
                    const leafY = y - radius * 0.7 + Math.sin(angle) * r * 0.5;
                    if (i === 0) {
                        ctx.moveTo(leafX, leafY);
                    } else {
                        ctx.lineTo(leafX, leafY);
                    }
                }
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'grape':
                // Draw grape cluster
                const grapePositions = [
                    {gx: 0, gy: -0.6, size: 0.35},  // Top
                    {gx: -0.4, gy: -0.3, size: 0.35}, {gx: 0.4, gy: -0.3, size: 0.35},  // Second row
                    {gx: -0.6, gy: 0.1, size: 0.35}, {gx: 0, gy: 0.1, size: 0.35}, {gx: 0.6, gy: 0.1, size: 0.35},  // Third row
                    {gx: -0.4, gy: 0.5, size: 0.35}, {gx: 0.4, gy: 0.5, size: 0.35},  // Fourth row
                    {gx: 0, gy: 0.8, size: 0.35}  // Bottom
                ];
                
                for (let grape of grapePositions) {
                    const grapeX = x + grape.gx * radius;
                    const grapeY = y + grape.gy * radius;
                    const grapeRadius = grape.size * radius;
                    
                    // Grape shadow/depth
                    ctx.fillStyle = '#4a148c';
                    ctx.beginPath();
                    ctx.arc(grapeX, grapeY, grapeRadius, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Main grape
                    ctx.fillStyle = '#7b1fa2';
                    ctx.beginPath();
                    ctx.arc(grapeX, grapeY, grapeRadius * 0.95, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Highlight
                    ctx.fillStyle = 'rgba(186, 104, 200, 0.6)';
                    ctx.beginPath();
                    ctx.arc(grapeX - grapeRadius * 0.3, grapeY - grapeRadius * 0.3, grapeRadius * 0.3, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'orange':
                // Draw orange shape (perfect circle)
                ctx.fillStyle = '#ff9800';
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw orange peel texture (dimples)
                ctx.fillStyle = '#ffcc02';
                for (let i = 0; i < 20; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = Math.random() * radius * 0.8;
                    const dotX = x + Math.cos(angle) * dist;
                    const dotY = y + Math.sin(angle) * dist;
                    
                    ctx.beginPath();
                    ctx.arc(dotX, dotY, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Add orange segments (light lines)
                ctx.strokeStyle = '#ff8f00';
                ctx.lineWidth = 1;
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(
                        x + Math.cos(angle) * radius * 0.8,
                        y + Math.sin(angle) * radius * 0.8
                    );
                    ctx.stroke();
                }
                break;
                
            case 'persimmon':
                // Draw persimmon shape (flattened, like 🥭 but orange)
                ctx.fillStyle = '#ff6f00'; // Deep orange, different from regular orange
                ctx.beginPath();
                ctx.ellipse(x, y, radius * 1.2, radius * 0.7, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Add darker orange gradient
                ctx.fillStyle = '#e65100';
                ctx.beginPath();
                ctx.ellipse(x, y + radius * 0.2, radius * 1.1, radius * 0.5, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Add persimmon calyx (star-shaped top)
                ctx.fillStyle = '#2e7d32';
                for (let i = 0; i < 4; i++) {
                    const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
                    const leafX = x + Math.cos(angle) * radius * 0.4;
                    const leafY = y - radius * 0.6;
                    
                    ctx.beginPath();
                    ctx.moveTo(leafX, leafY);
                    ctx.lineTo(leafX + Math.cos(angle) * radius * 0.3, leafY - radius * 0.2);
                    ctx.lineTo(leafX - Math.cos(angle + Math.PI/2) * radius * 0.15, leafY);
                    ctx.closePath();
                    ctx.fill();
                }
                
                // Central calyx point
                ctx.fillStyle = '#1b5e20';
                ctx.beginPath();
                ctx.arc(x, y - radius * 0.6, radius * 0.08, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'apple':
                // Draw apple shape (slightly heart-shaped top)
                ctx.fillStyle = fruitType.color;
                ctx.beginPath();
                ctx.moveTo(x, y + radius);
                ctx.quadraticCurveTo(x - radius, y + radius * 0.3, x - radius * 0.8, y - radius * 0.3);
                ctx.quadraticCurveTo(x - radius * 0.3, y - radius * 0.9, x, y - radius * 0.7);
                ctx.quadraticCurveTo(x + radius * 0.3, y - radius * 0.9, x + radius * 0.8, y - radius * 0.3);
                ctx.quadraticCurveTo(x + radius, y + radius * 0.3, x, y + radius);
                ctx.fill();
                
                // Apple stem
                ctx.strokeStyle = '#8d6e63';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x, y - radius * 0.7);
                ctx.lineTo(x, y - radius * 1.1);
                ctx.stroke();
                
                // Apple leaf
                ctx.beginPath();
                ctx.ellipse(x + radius * 0.2, y - radius * 1, radius * 0.15, radius * 0.3, Math.PI / 4, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'pear':
                // Draw pear shape (narrow top, wide bottom)
                ctx.fillStyle = fruitType.color;
                ctx.beginPath();
                // Bottom bulb
                ctx.arc(x, y + radius * 0.3, radius * 0.8, 0, Math.PI * 2);
                ctx.fill();
                // Top neck
                ctx.beginPath();
                ctx.ellipse(x, y - radius * 0.4, radius * 0.4, radius * 0.6, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Pear stem
                ctx.strokeStyle = '#8d6e63';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x, y - radius);
                ctx.lineTo(x, y - radius - 6);
                ctx.stroke();
                break;
                
            case 'peach':
                // Draw peach shape (round with groove)
                ctx.fillStyle = fruitType.color;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Peach groove/crease
                ctx.strokeStyle = '#ff5722';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x, y - radius * 0.9);
                ctx.quadraticCurveTo(x + radius * 0.3, y, x, y + radius * 0.9);
                ctx.stroke();
                
                // Peach fuzz texture
                ctx.fillStyle = 'rgba(255, 183, 197, 0.4)';
                for (let i = 0; i < 30; i++) {
                    const fuzzX = x + (Math.random() - 0.5) * radius * 1.8;
                    const fuzzY = y + (Math.random() - 0.5) * radius * 1.8;
                    if (Math.sqrt((fuzzX - x) ** 2 + (fuzzY - y) ** 2) < radius * 0.9) {
                        ctx.beginPath();
                        ctx.arc(fuzzX, fuzzY, 0.3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                break;
                
            case 'pineapple':
                // Draw pineapple body shape (oval)
                ctx.fillStyle = fruitType.color;
                ctx.beginPath();
                ctx.ellipse(x, y + radius * 0.2, radius * 0.8, radius * 1.1, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw pineapple diamond pattern
                ctx.strokeStyle = '#ff8f00';
                ctx.lineWidth = 1;
                for (let i = -2; i <= 2; i++) {
                    for (let j = -2; j <= 2; j++) {
                        const diamondX = x + i * radius * 0.3;
                        const diamondY = y + j * radius * 0.3;
                        if (Math.sqrt((diamondX - x) ** 2 + (diamondY - y) ** 2) < radius * 0.8) {
                            ctx.beginPath();
                            ctx.moveTo(diamondX, diamondY - 3);
                            ctx.lineTo(diamondX + 3, diamondY);
                            ctx.lineTo(diamondX, diamondY + 3);
                            ctx.lineTo(diamondX - 3, diamondY);
                            ctx.closePath();
                            ctx.stroke();
                        }
                    }
                }
                // Add pineapple crown (spiky leaves)
                ctx.fillStyle = '#2e7d32';
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
                    const leafX = x + Math.cos(angle) * radius * 0.3;
                    const leafY = y - radius * 1.2;
                    ctx.beginPath();
                    ctx.moveTo(leafX, leafY + radius * 0.5);
                    ctx.lineTo(leafX + Math.cos(angle) * radius * 0.2, leafY - radius * 0.3);
                    ctx.lineTo(leafX - Math.cos(angle) * radius * 0.1, leafY + radius * 0.2);
                    ctx.closePath();
                    ctx.fill();
                }
                break;
                
            case 'melon':
                // Draw melon shape (round)
                ctx.fillStyle = fruitType.color;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw melon net pattern
                ctx.strokeStyle = '#388e3c';
                ctx.lineWidth = 1;
                for (let i = -2; i <= 2; i++) {
                    ctx.beginPath();
                    ctx.moveTo(x - radius, y + i * radius * 0.25);
                    ctx.lineTo(x + radius, y + i * radius * 0.25);
                    ctx.stroke();
                }
                for (let i = -2; i <= 2; i++) {
                    ctx.beginPath();
                    ctx.moveTo(x + i * radius * 0.25, y - radius);
                    ctx.lineTo(x + i * radius * 0.25, y + radius);
                    ctx.stroke();
                }
                break;
                
            case 'watermelon':
                // Draw watermelon shape (round)
                ctx.fillStyle = fruitType.color;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw watermelon stripes
                ctx.strokeStyle = '#1b5e20';
                ctx.lineWidth = 3;
                for (let i = 0; i < 5; i++) {
                    const stripeRadius = radius * (0.3 + i * 0.15);
                    if (stripeRadius < radius) {
                        ctx.beginPath();
                        ctx.arc(x, y, stripeRadius, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                }
                
                // Add watermelon seeds
                ctx.fillStyle = '#000';
                const watermelonSeeds = [
                    {sx: 0, sy: 0}, {sx: 0.3, sy: 0.2}, {sx: -0.3, sy: 0.2},
                    {sx: 0.2, sy: -0.3}, {sx: -0.2, sy: -0.3}, {sx: 0, sy: 0.4}
                ];
                for (let pos of watermelonSeeds) {
                    const seedX = x + pos.sx * radius;
                    const seedY = y + pos.sy * radius;
                    ctx.beginPath();
                    ctx.ellipse(seedX, seedY, 2, 4, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
        }
        
        ctx.restore();
    }
    
    dropFruit() {
        if (!this.canDrop) return;
        
        const fruitType = this.fruitTypes[this.nextFruitType];
        const fruit = {
            x: this.dropPosition,
            y: 50,
            vx: 0,
            vy: 0,
            radius: fruitType.radius,
            type: this.nextFruitType,
            color: fruitType.color,
            emoji: fruitType.emoji
        };
        
        this.fruits.push(fruit);
        this.generateNextFruit();
        this.canDrop = false;
        
        setTimeout(() => {
            this.canDrop = true;
        }, 1000);
    }
    
    updatePhysics() {
        this.fruits.forEach(fruit => {
            fruit.vy += this.gravity;
            fruit.x += fruit.vx;
            fruit.y += fruit.vy;
            
            if (fruit.x - fruit.radius < 0) {
                fruit.x = fruit.radius;
                fruit.vx = -fruit.vx * this.restitution;
            }
            if (fruit.x + fruit.radius > this.width) {
                fruit.x = this.width - fruit.radius;
                fruit.vx = -fruit.vx * this.restitution;
            }
            
            if (fruit.y + fruit.radius > this.height) {
                fruit.y = this.height - fruit.radius;
                fruit.vy = -fruit.vy * this.restitution;
                fruit.vx *= this.friction;
            }
        });
        
        this.checkCollisions();
    }
    
    checkCollisions() {
        for (let i = 0; i < this.fruits.length; i++) {
            for (let j = i + 1; j < this.fruits.length; j++) {
                const fruit1 = this.fruits[i];
                const fruit2 = this.fruits[j];
                
                const dx = fruit2.x - fruit1.x;
                const dy = fruit2.y - fruit1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = fruit1.radius + fruit2.radius;
                
                if (distance < minDistance) {
                    if (fruit1.type === fruit2.type && fruit1.type < this.fruitTypes.length - 1) {
                        this.mergeFruits(fruit1, fruit2, i, j);
                        return;
                    } else {
                        this.resolveBounce(fruit1, fruit2, distance, minDistance, dx, dy);
                    }
                }
            }
        }
    }
    
    mergeFruits(fruit1, fruit2, index1, index2) {
        const newType = fruit1.type + 1;
        const newFruitType = this.fruitTypes[newType];
        
        const newFruit = {
            x: (fruit1.x + fruit2.x) / 2,
            y: (fruit1.y + fruit2.y) / 2,
            vx: 0,
            vy: 0,
            radius: newFruitType.radius,
            type: newType,
            color: newFruitType.color,
            emoji: newFruitType.emoji
        };
        
        this.fruits.splice(Math.max(index1, index2), 1);
        this.fruits.splice(Math.min(index1, index2), 1);
        this.fruits.push(newFruit);
        
        this.score += newFruitType.points;
        document.getElementById('score').textContent = this.score;
    }
    
    resolveBounce(fruit1, fruit2, distance, minDistance, dx, dy) {
        const overlap = minDistance - distance;
        const separationX = (dx / distance) * overlap * 0.5;
        const separationY = (dy / distance) * overlap * 0.5;
        
        fruit1.x -= separationX;
        fruit1.y -= separationY;
        fruit2.x += separationX;
        fruit2.y += separationY;
        
        const relativeVelocityX = fruit2.vx - fruit1.vx;
        const relativeVelocityY = fruit2.vy - fruit1.vy;
        const speed = relativeVelocityX * (dx / distance) + relativeVelocityY * (dy / distance);
        
        if (speed > 0) return;
        
        fruit1.vx += speed * (dx / distance) * this.restitution;
        fruit1.vy += speed * (dy / distance) * this.restitution;
        fruit2.vx -= speed * (dx / distance) * this.restitution;
        fruit2.vy -= speed * (dy / distance) * this.restitution;
    }
    
    checkGameOver() {
        for (let fruit of this.fruits) {
            if (fruit.y - fruit.radius < this.dangerLine && fruit.vy <= 0) {
                this.gameState = 'gameover';
                return true;
            }
        }
        return false;
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.dangerLine);
        this.ctx.lineTo(this.width, this.dangerLine);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        this.fruits.forEach(fruit => {
            this.drawFruit(fruit);
        });
        
        if (this.gameState === 'playing' && this.canDrop) {
            const previewFruit = {
                x: this.dropPosition,
                y: 50,
                radius: this.fruitTypes[this.nextFruitType].radius,
                type: this.nextFruitType
            };
            this.ctx.globalAlpha = 0.5;
            this.drawFruit(previewFruit);
            this.ctx.globalAlpha = 1;
        }
        
        if (this.gameState === 'gameover') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over', this.width / 2, this.height / 2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 60);
        }
    }
    
    gameLoop() {
        if (this.gameState === 'playing') {
            this.updatePhysics();
            this.checkGameOver();
        }
        
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    startGame() {
        this.gameState = 'playing';
        this.fruits = [];
        this.score = 0;
        document.getElementById('score').textContent = this.score;
        this.generateNextFruit();
        this.canDrop = true;
    }
    
    restartGame() {
        this.startGame();
    }
}

const game = new SuicaGame();