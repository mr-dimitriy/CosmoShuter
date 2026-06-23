import { GameObject } from "./GameObject.js";

import { gameConfig } from "../config.js";


export class Paddle extends GameObject {
    constructor(x, y, sizeX, sizeY) {
        super(x, y, sizeX, sizeY);
        this.sizeY = gameConfig.paddle.paddleHeight; 
        this.sizeX = gameConfig.paddle.paddleWidth;

        this.canvasHeight = gameConfig.canvas.height;
        this.canvasWidth = gameConfig.canvas.width;

        this.lastX = x; 

        this.speed = 8;
        this.velocity = 0;
    }
    
    moveLeft() {
        this.x -= this.speed;
        if (this.x < 0) this.x = 0;
    }
    
    moveRight() {
        this.x += this.speed;
        if (this.x + this.sizeX > this.canvasWidth) {
            this.x = this.canvasWidth - this.sizeX;
        }
    }

    // Определяем направление движения (-1 влево, 0 стоит, 1 вправо)
    getMovementDirection() {
        const diff = this.x - this.lastX;
        if (Math.abs(diff) < 1) return 0; // Платформа стоит
        return diff > 0 ? 1 : -1;
    }

    // Вычисляем скорость платформы
    updateLastPosition() {
        this.velocity = this.x - this.lastX; // ← Скорость = изменение позиции
        this.lastX = this.x;
    }
    
    draw(ctx) {
        ctx.fillStyle = '#00d4ff';
        ctx.fillRect(this.x, this.y, this.sizeX, this.sizeY);
    }
}

export class Ball extends GameObject {
    constructor(x, y, radius, speed) {
        super(x, y, radius * 2, radius * 2);
        this.radius = radius;
        this.baseSpeed = speed;
        this.dx = 0;
        this.dy = 0;
        this.isAttached = true; // Мяч "прилип" к платформе в начале
        this.isLost = false;
    }
    
    move() {
        if (this.isAttached) return; // Ждём запуска
        
        this.x += this.dx;
        this.y += this.dy;
    }

    launch() {
        if (!this.isAttached) return;
        this.isAttached = false;
        
        // Мяч летит строго вверх с небольшим случайным отклонением
        // Отклонение от -2 до +2 пикселей по горизонтали
        const randomOffset = (Math.random() - 0.5) * 4;
        
        this.dx = randomOffset;
        this.dy = -this.baseSpeed;
        
        // Нормализуем скорость, чтобы она была одинаковой
        const currentSpeed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        this.dx = (this.dx / currentSpeed) * this.baseSpeed;
        this.dy = (this.dy / currentSpeed) * this.baseSpeed;
    }
    
    // Отскок от стен
    checkWallCollision(canvasWidth, canvasHeight) {
        // Левая/правая стена
        if (this.x - this.radius < 0 || this.x + this.radius > canvasWidth) {
            this.dx = -this.dx;
        }
        // Верхняя стена
        if (this.y - this.radius < 0) {
            this.dy = -this.dy;
        }
        // Мяч упал вниз — потеря жизни
        if (this.y + this.radius > canvasHeight) {
            return true; // сигнал о потере мяча
        }
        return false;
    }
    
    draw(ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

export class Block extends GameObject {
    constructor(x, y, width, height, color, health = 1) {
        super(x, y, width, height);
        this.color = color;
        this.points = 5;
        this.health = health;
        this.maxHealth = health;
        this.isDestroyed = false;
    }
    
    takeDamage() {
        this.health--;
        if (this.health <= 0) {
            this.isDestroyed = true;
            return true; // блок уничтожен
        }
        return false;
    }
    
    draw(ctx) {
        if (this.isDestroyed) return;
        
        // Меняем цвет в зависимости от оставшегося здоровья
        const alpha = this.health / this.maxHealth;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.3 + (alpha * 0.7);
        ctx.fillRect(this.x, this.y, this.sizeX, this.sizeY);
        ctx.globalAlpha = 1;
        
        // Рамка
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.sizeX, this.sizeY);
    }
}