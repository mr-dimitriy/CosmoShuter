import { gameConfig } from "../config.js";

export class ScoreManager {
    constructor() {
        this.score = 0;
        this.reset();
    }
    
    reset() {
        this.score = 0;
    } 

    onBlockDestroy(block, bonusManager){
        this.score += block.points;
        bonusManager.tryDropBonuse(block.x, block.y)
    }
}