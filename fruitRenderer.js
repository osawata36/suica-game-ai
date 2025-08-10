class FruitRenderer {
    constructor() {
        this.svgCache = {};
        this.imageCache = {};
    }

    async loadSVG(name, path) {
        try {
            const response = await fetch(path);
            const svgText = await response.text();
            this.svgCache[name] = svgText;
            
            // Convert SVG to image for canvas rendering
            const blob = new Blob([svgText], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const img = new Image();
            
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = url;
            });
            
            this.imageCache[name] = img;
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(`Failed to load SVG for ${name}:`, error);
        }
    }

    async loadAllFruits() {
        const fruits = [
            { name: 'cherry', path: 'images/cherry.svg' },
            { name: 'strawberry', path: 'images/strawberry.svg' },
            { name: 'grape', path: 'images/grape.svg' },
            { name: 'orange', path: 'images/orange.svg' }
        ];

        await Promise.all(fruits.map(fruit => this.loadSVG(fruit.name, fruit.path)));
    }

    drawFruit(ctx, fruitName, x, y, radius) {
        const img = this.imageCache[fruitName];
        if (img) {
            // Draw shadow
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.ellipse(x + 2, y + radius * 0.8, radius * 0.8, radius * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Draw SVG image scaled to fit the fruit radius
            const size = radius * 2.2;
            ctx.drawImage(img, x - size/2, y - size/2, size, size);
        }
    }

    hasSVG(fruitName) {
        return !!this.imageCache[fruitName];
    }
}

// Export for use in game.js
window.FruitRenderer = FruitRenderer;