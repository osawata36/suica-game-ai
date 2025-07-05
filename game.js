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
    
    init() {
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
    
    drawFruitDetails(fruit, x, y, radius) {
        const ctx = this.ctx;
        const fruitType = this.fruitTypes[fruit.type];
        
        ctx.save();
        
        switch(fruitType.name) {
            case 'cherry':
                // Draw cherry stem
                ctx.strokeStyle = '#4a5d23';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x, y - radius);
                ctx.lineTo(x - 2, y - radius - 5);
                ctx.stroke();
                // Add cherry highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.beginPath();
                ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.25, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'strawberry':
                // Draw strawberry seeds
                ctx.fillStyle = '#ffff8d';
                for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2;
                    const seedX = x + Math.cos(angle) * radius * 0.6;
                    const seedY = y + Math.sin(angle) * radius * 0.6;
                    ctx.beginPath();
                    ctx.arc(seedX, seedY, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
                // Add strawberry top leaves
                ctx.fillStyle = '#4caf50';
                for (let i = 0; i < 5; i++) {
                    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
                    const leafX = x + Math.cos(angle) * radius * 0.3;
                    const leafY = y - radius + 2;
                    ctx.beginPath();
                    ctx.ellipse(leafX, leafY, 2, 4, angle, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'grape':
                // Draw grape texture with small circles
                ctx.fillStyle = 'rgba(123, 31, 162, 0.5)';
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        const grapeX = x + (col - 1) * radius * 0.3;
                        const grapeY = y + (row - 1) * radius * 0.3;
                        ctx.beginPath();
                        ctx.arc(grapeX, grapeY, radius * 0.15, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                break;
                
            case 'orange':
                // Draw orange segments
                ctx.strokeStyle = fruitType.darkColor;
                ctx.lineWidth = 1;
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + Math.cos(angle) * radius * 0.8, y + Math.sin(angle) * radius * 0.8);
                    ctx.stroke();
                }
                // Add orange texture
                ctx.fillStyle = 'rgba(255, 152, 0, 0.3)';
                for (let i = 0; i < 20; i++) {
                    const dotX = x + (Math.random() - 0.5) * radius * 1.5;
                    const dotY = y + (Math.random() - 0.5) * radius * 1.5;
                    if (Math.sqrt((dotX - x) ** 2 + (dotY - y) ** 2) < radius * 0.8) {
                        ctx.beginPath();
                        ctx.arc(dotX, dotY, 0.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                break;
                
            case 'persimmon':
                // Draw persimmon star pattern on top
                ctx.fillStyle = '#8bc34a';
                ctx.beginPath();
                ctx.moveTo(x, y - radius);
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
                    const starX = x + Math.cos(angle) * radius * 0.4;
                    const starY = y - radius + 3;
                    ctx.lineTo(starX, starY);
                }
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'apple':
                // Draw apple leaf
                ctx.fillStyle = '#4caf50';
                ctx.beginPath();
                ctx.ellipse(x - 3, y - radius + 2, 3, 6, -Math.PI / 4, 0, Math.PI * 2);
                ctx.fill();
                // Add apple stem
                ctx.strokeStyle = '#8d6e63';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x, y - radius);
                ctx.lineTo(x, y - radius - 4);
                ctx.stroke();
                // Add apple dimple
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.beginPath();
                ctx.arc(x, y - radius + 3, 2, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'pear':
                // Draw pear shape variation (more narrow at top)
                ctx.fillStyle = fruitType.color;
                ctx.beginPath();
                ctx.ellipse(x, y - radius * 0.3, radius * 0.7, radius * 0.4, 0, 0, Math.PI * 2);
                ctx.fill();
                // Add pear stem
                ctx.strokeStyle = '#8d6e63';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x, y - radius);
                ctx.lineTo(x, y - radius - 6);
                ctx.stroke();
                break;
                
            case 'peach':
                // Draw peach fuzz texture
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
                // Add peach crease
                ctx.strokeStyle = 'rgba(255, 138, 101, 0.6)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x, y - radius);
                ctx.lineTo(x, y + radius);
                ctx.stroke();
                break;
                
            case 'pineapple':
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
                // Add pineapple crown
                ctx.fillStyle = '#4caf50';
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const crownX = x + Math.cos(angle) * radius * 0.2;
                    const crownY = y - radius;
                    ctx.beginPath();
                    ctx.ellipse(crownX, crownY, 2, 8, angle, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'melon':
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
                // Draw watermelon stripes
                ctx.strokeStyle = '#1b5e20';
                ctx.lineWidth = 3;
                for (let i = -2; i <= 2; i++) {
                    ctx.beginPath();
                    ctx.arc(x, y, radius - Math.abs(i) * 8, 0, Math.PI * 2);
                    ctx.stroke();
                }
                // Add watermelon seeds
                ctx.fillStyle = '#000';
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const seedX = x + Math.cos(angle) * radius * 0.4;
                    const seedY = y + Math.sin(angle) * radius * 0.4;
                    ctx.beginPath();
                    ctx.ellipse(seedX, seedY, 2, 3, angle, 0, Math.PI * 2);
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