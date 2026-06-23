import { gameConfig } from "../config.js";

export class ScoreManager {
    constructor() {
        this.score = 0;
        this.reset();
    }
    
    reset() {
        this.score = 0;
    } 

    onBlockDestroy(block){
        this.score += block.points;
    }
}