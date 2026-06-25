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

        this.speed = gameConfig.paddle.speed;
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
        this.paddle = null;

        this.prevX = x;
        this.prevY = y;
    }
    
    move() {
        if (this.isAttached) return; // Ждём запуска
        this.prevX = this.x;
        this.prevY = this.y;

        this.x += this.dx;
        this.y += this.dy;
    }

    launch() {
        if (!this.isAttached) return;
        this.isAttached = false;

        // Получаем направление платформы в момент запуска
        const paddleDirection = this.paddle ? this.paddle.velocity : 0;

        console.log(paddleDirection);
        // Если платформа движется — используем это, иначе небольшое случайное отклонение
        if (paddleDirection !== 0) {
            this.dx = paddleDirection * 2; // Влияние платформы
        } else {
            this.dx = 0; // Случайное отклонение
        }
        

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
        this.radius = 5;
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
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.sizeX, this.sizeY, this.radius);
        ctx.fill();

        ctx.globalAlpha = 1;
        
        // Рамка
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke(); 
    }
}