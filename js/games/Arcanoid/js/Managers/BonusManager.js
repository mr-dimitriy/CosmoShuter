import { Bonus } from "../GameObjects/Bonus.js";
import { Ball } from "../GameObjects/Entite.js";
import { gameConfig } from "../config.js";

export class BonusManager {
    constructor() {
        this.activeBonuses = [];
        this.activeEffects = []; // Активные эффекты бонусов
    }
    
    reset() {
        this.activeBonuses = [];
        this.activeEffects = [];
    }
    
    tryDropBonuse(x, y) {
        const dropRate = gameConfig.bonusRate || 0;
        const randomNum = Math.random();
        
        //console.log(`🎲 Выпало ${randomNum} из ${dropRate}`);

        // Проверяем, выпадет ли бонус
        if (randomNum < dropRate) {
            const bonuseType = this.getRandomBonuseType();
            const bonusConfig = gameConfig.bonusTypes.find(t => t.type === bonuseType);
            const duration = bonusConfig ? bonusConfig.duration : 0;

            const bonuse = new Bonus(x, y, bonuseType, duration);
            this.activeBonuses.push(bonuse);
        }
    }
    
    getRandomBonuseType() {
        const types = gameConfig.bonusTypes;
        const totalWeight = types.reduce((sum, type) => sum + type.weight, 0);
        
        let random = Math.random() * totalWeight;
        
        for (const type of types) {
            random -= type.weight;
            if (random <= 0) {
                return type.type;
            }
        }
        
        return types[0].type;
    }
    
    update(deltaTime) {
        // Двигаем бонусы
        for (const bonuse of this.activeBonuses) {
            bonuse.move(deltaTime);
        }
        
        // Удаляем улетевшие и истёкшие
        this.activeBonuses = this.activeBonuses.filter(p => 
            !p.isOffScreen(gameConfig.canvas.height,gameConfig.canvas.width) && !p.isExpired()
        );
    }
    
    draw(ctx) {
        for (const bonuse of this.activeBonuses) {
            bonuse.draw(ctx);
        }
    }
    
    checkCollision(game) {

        for (let i = this.activeBonuses.length - 1; i >= 0; i--) {
            const bonus = this.activeBonuses[i];
            
            // Проверяем столкновение с платформой
            if (this.isColliding(bonus, game.paddle)) {
                const applied = this.applyBonuse(game, bonus.type, bonus.duration);
                
                if (applied) {
                    this.activeBonuses.splice(i, 1);
                    return bonus.name;
                }
            }
        }
            
        return null;
    }
    
    isColliding(rect1, rect2) {
        return !(
            rect1.x + rect1.sizeX < rect2.x ||
            rect1.x > rect2.x + rect2.sizeX ||
            rect1.y + rect1.sizeY < rect2.y ||
            rect1.y > rect2.y + rect2.sizeY
        );
    }
    
    applyBonuse(game, type, duration) {
        switch(type) {
            case 'health':
                if (game.lives < 5) {
                    game.lives++;
                    return true;
                }
                return false; // Здоровье полное
                break;
                
            case 'sizeUp':
                // Увеличиваем платформу
                if(game.paddle.sizeX < gameConfig.canvas.width){
                    const deltaSize = 30; // На сколько увеличиваем
                    game.paddle.sizeX = game.paddle.sizeX + deltaSize;
                    if (duration > 0) {
                        this.activeEffects.push({
                            type: 'sizeUp',
                            expiresAt: Date.now() + duration * 1000,
                            deltaSize: deltaSize
                        });
                    }
                    return true;
                }
                return false;
                
            case 'threeBalls':
                // Создаем 3 дополнительных мяча
                if(game.balls.length < 100){
                    this.addExtraBalls(game, game.balls.length);
                    return true;
                }
                return false;
                
            case 'speedUp':
                // Увеличиваем скорость платформы
                if(game.paddle.speed < gameConfig.paddle.maxSpeed){
                    const deltaSpeed = 2;
                    game.paddle.speed = game.paddle.speed + deltaSpeed;
                    if (duration > 0) {
                        this.activeEffects.push({
                            type: 'speedUp',
                            expiresAt: Date.now() + duration * 1000,
                            deltaSpeed: deltaSpeed
                        });
                    }
                    return true;
                }
                return false;

        }
        return false;
    }

    addExtraBalls(game, count) {
        const randomBall = Math.floor(Math.random() * game.balls.length);
        const baseBall = game.balls[randomBall];
        if (!baseBall) return;
        
        for (let i = 0; i < count; i++) {
            const newBall = new Ball(
                baseBall.x,
                baseBall.y,
                baseBall.radius,
                baseBall.baseSpeed
            );
            
            // Задаем случайное направление
            const angle = (Math.random() - 0.5) * Math.PI; // -90° до +90°
            newBall.dx = newBall.baseSpeed * Math.sin(angle);
            newBall.dy = -newBall.baseSpeed * Math.cos(angle);
            newBall.isAttached = false;
            
            game.balls.push(newBall);
        }
    }

    updateActiveEffects(game) {
        const now = Date.now();
        
        // Проверяем истекшие эффекты
        this.activeEffects = this.activeEffects.filter(effect => {
            if (effect.expiresAt > 0 && now >= effect.expiresAt) {
                // Эффект истек - возвращаем исходные значения
                this.revertEffect(game, effect);
                return false;
            }
            return true;
        });
    }
    
    revertEffect(game, effect) {
        switch(effect.type) {
            case 'sizeUp':
                game.paddle.sizeX = Math.max(gameConfig.paddle.paddleWidth, game.paddle.sizeX - effect.deltaSize);
                break;
            case 'speedUp':
                game.paddle.speed = Math.max(8, game.paddle.speed - effect.deltaSpeed);
                break;
            case 'threeBalls':
                game.balls = game.balls[0];
                break;
        }
    }
}