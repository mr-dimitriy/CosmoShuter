import { gameConfig } from "../config.js";
import { Block } from "../GameObjects/Entite.js";

export class Level {
    constructor(rows, cols, blockWidth, blockHeight, padding, health) {
        this.blocks = [];
        this.health = health //Временное свойство сложности

        this.canvasWidth = gameConfig.canvas.width;
        this.generate(rows, cols, blockWidth, blockHeight, padding);
    }
    
    generate(rows, cols, blockWidth, blockHeight, padding) {
        const colors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff'];
        const totalWidth = cols * blockWidth + (cols - 1) * padding;
        const offsetX = (this.canvasWidth - totalWidth) / 2;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = offsetX + col * (blockWidth + padding);
                const y = 50 + row * (blockHeight + padding);
                const color = colors[row % colors.length];
                
                this.blocks.push(new Block(x, y, blockWidth, blockHeight, color, this.health));
            }
        }
    }
    
    isCleared() {
        return this.blocks.every(b => b.isDestroyed);
    }
    
    draw(ctx) {
        for (const block of this.blocks) {
            block.draw(ctx);
        }
    }
}