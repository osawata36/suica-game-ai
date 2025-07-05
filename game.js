class SuicaGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.fruits = [];
        this.score = 0;
        this.gameState = 'menu';
        this.dangerLine = this.height * 0.1;
        this.gravity = 0.3;
        this.friction = 0.99;
        this.restitution = 0.3;
        
        this.fruitTypes = [
            { name: 'cherry', emoji: '🍒', color: '#ff6b6b', radius: 15, points: 10 },
            { name: 'strawberry', emoji: '🍓', color: '#ff8a80', radius: 20, points: 20 },
            { name: 'grape', emoji: '🍇', color: '#9c27b0', radius: 25, points: 40 },
            { name: 'orange', emoji: '🍊', color: '#ff9800', radius: 30, points: 80 },
            { name: 'persimmon', emoji: '🥭', color: '#ff5722', radius: 35, points: 160 },
            { name: 'apple', emoji: '🍎', color: '#f44336', radius: 40, points: 320 },
            { name: 'pear', emoji: '🍐', color: '#8bc34a', radius: 45, points: 640 },
            { name: 'peach', emoji: '🍑', color: '#ffb3ba', radius: 50, points: 1280 },
            { name: 'pineapple', emoji: '🍍', color: '#ffc107', radius: 55, points: 2560 },
            { name: 'melon', emoji: '🍈', color: '#4caf50', radius: 60, points: 5120 },
            { name: 'watermelon', emoji: '🍉', color: '#2e7d32', radius: 70, points: 10240 }
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
    }
    
    generateNextFruit() {
        this.nextFruitType = Math.floor(Math.random() * Math.min(5, this.fruitTypes.length));
        document.getElementById('next-fruit').textContent = this.fruitTypes[this.nextFruitType].emoji;
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
            if (fruit.y - fruit.radius < this.dangerLine) {
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
            this.ctx.fillStyle = fruit.color;
            this.ctx.beginPath();
            this.ctx.arc(fruit.x, fruit.y, fruit.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = `${fruit.radius}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(fruit.emoji, fruit.x, fruit.y);
        });
        
        if (this.gameState === 'playing' && this.canDrop) {
            const previewFruit = this.fruitTypes[this.nextFruitType];
            this.ctx.fillStyle = previewFruit.color;
            this.ctx.globalAlpha = 0.5;
            this.ctx.beginPath();
            this.ctx.arc(this.dropPosition, 50, previewFruit.radius, 0, Math.PI * 2);
            this.ctx.fill();
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