import { gameConfig } from "../config.js";
import { Block } from "../GameObjects/Entite.js";

export class Level {
    constructor(levelConfig) {
        this.blocks = [];

        this.canvasWidth = gameConfig.canvas.width;
        this.generate(levelConfig);
    }
    
    generate(levelConfig) {
        const { rows, cols, padding, map } = levelConfig;
        const blockWidth = 80;
        const blockHeight = 30;

        const colors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0004ffff', '#7700ffff', '#2f0164ff'];
        const totalWidth = cols * blockWidth + (cols - 1) * padding;
        const offsetX = (this.canvasWidth - totalWidth) / 2;
        
        for (let row = 0; row < rows; row++) {
            const rowString = map[row];
            
            for (let col = 0; col < cols; col++) {
                const blockType = parseInt(rowString[col]);
                
                if (blockType === 0) continue;
                
                const x = offsetX + col * (blockWidth + padding);
                const y = 50 + row * (blockHeight + padding);
                const color = colors[row % colors.length];
                const health = blockType;
                
                this.blocks.push(new Block(x, y, blockWidth, blockHeight, color, health));
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