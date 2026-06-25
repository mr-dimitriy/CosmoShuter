import { GameObject } from "./GameObject.js";

export class Bonus extends GameObject {
    constructor(x, y, type, duration) {
        super(x, y, 20, 20);
        
        this.type = type; // 'health', 'fullHealth', 'fireRate', 'multiShot', 'shield', 'strongShield'
        this.speed = 2; // Скорость падения
        this.lifetime = 10000; // Бонус исчезает через 10 секунд
        this.lifetimeElapsed = 0;
        this.radius = 20;
        this.duration = duration;

        // Настройка внешнего вида в зависимости от типа
        this.setupAppearance();
    }
    
    setupAppearance() {
        switch(this.type) {
            case 'health':
                this.color = '#00ff00';
                this.symbol = '❤️';
                this.name = 'Здоровье';
                break;

            case 'sizeUp':
                this.color = '#00ff00';
                this.symbol = '📏';
                this.name = 'Платформа длиннее';
                break;

            case 'threeBalls':
                this.color = '#00ff00';
                this.symbol = '🎱';
                this.name = 'х2 мячей';
                break;

            case 'speedUp':
                this.color = '#00ff00';
                this.symbol = '🚀';
                this.name = 'Платформа быстрее';
                break;
        }
    }
    
    move(deltaTime) {
        // Движение тоже лучше привязать к deltaTime для плавности при лагах/паузах
        const speedMultiplier = deltaTime / 16; // Нормализация под ~60 FPS
        this.y += this.speed * speedMultiplier;
        
        // ⏱️ Увеличиваем счетчик времени жизни только при активном движении
        this.lifetimeElapsed += deltaTime;
    }
    
    isExpired() {
        return this.lifetimeElapsed >= this.lifetime;
    }
    
    draw(ctx) {
        // Рисуем фон
        //ctx.fillStyle = this.color;
        ctx.fillStyle = '#1d1d1dff';

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.symbol, this.x, this.y);
    }
}