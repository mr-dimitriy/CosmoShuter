
export class BaseGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.animationFrameId = null;
    }
    
    // Эти методы должны реализовать все игры
    init() { throw new Error('Метод init() должен быть реализован'); }
    update(deltaTime) { throw new Error('Метод update() должен быть реализован'); }
    draw() { throw new Error('Метод draw() должен быть реализован'); }
    destroy() { throw new Error('Метод destroy() должен быть реализован'); }
    
    // Общий игровой цикл
    start() {
        this.isRunning = true;
        this.lastFrameTime = Date.now();
        this.loop();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
    
    loop() {
        if (!this.isRunning) return;
        
        const currentTime = Date.now();
        let deltaTime = currentTime - this.lastFrameTime;

        // Защита от скачка времени
        if (deltaTime > 100) deltaTime = 16;

        this.lastFrameTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        this.animationFrameId = requestAnimationFrame(() => this.loop());
    }
}