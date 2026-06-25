import { InputHandler } from '../../../common/InputHandler.js';
import { BaseGame } from '../../../common/BaseGame.js';
import { AssetLoader } from "./AssetLoader.js";
import { ScoreManager } from './Managers/ScoreManager.js';
import { UIManager } from "./Managers/UIManager.js";
import { Paddle, Ball } from './GameObjects/Entite.js';
import { Level } from './Managers/LevelsManager.js';
import { gameConfig } from "./config.js";
import { BonusManager } from './Managers/BonusManager.js';

class Arcanoid extends BaseGame{
    constructor(){
        super('gameCanvas');
        //Холст игры
        // this.canvas = document.getElementById('gameCanvas');
        // this.ctx = this.canvas.getContext('2d');

        // Менеджеры
        this.input = new InputHandler(() => this.togglePause());
        this.scoreManager = new ScoreManager();
        this.ui = new UIManager();
        this.bonusManager = new BonusManager();
        
        // Игровые сущности
        this.paddle = null;
        this.mainBall = null;
        this.level = null;
        this.balls = [];

        // Состояние
        this.isGameOver = false;
        this.gamePause = false;
        this.currentLevel = 1;
        this.lives = 5;
        this.lastFrameTime = Date.now();


        // Загрузка ресурсов на будущее
        this.assetLoader = new AssetLoader();

    }

    // Реализуем метод init() из BaseGame
    init() {
        this.initUI();
        this.ui.showMainMenu();
    }

    initUI() {
        const startBtn = document.getElementById('start-game-btn');
        const restartBtn = document.getElementById('restart-btn');
        const resumeBtn = document.getElementById('resume-btn');

        if (startBtn) {
            startBtn.addEventListener('click', () =>
                {
                    this.startGame();
                });
                    
        }
        if (restartBtn) {
            restartBtn.addEventListener('click', () =>
                {
                    this.startGame();
                });
        }

        if (resumeBtn) {
            resumeBtn.addEventListener('click', () =>
                {
                     this.togglePause();
                });
        }
        
    }

    startGame() {
        this.isGameOver = false;
        this.gamePause = false;
        this.currentLevel = 1;
        this.lives = 5;
        this.lastFrameTime = Date.now();
        this.balls = [];

        this.scoreManager.reset();
        this.bonusManager.reset();

        this.ui.hideMainMenu();
        this.ui.hideGameOver();

        this.ui.updateAll(this.scoreManager);

        this.initFirstLevel();
        this.start();
    }    

    initFirstLevel() {

        const levelsCount = gameConfig.levelMaps.length;
        const randomLevel = Math.floor(Math.random() * levelsCount);

        this.level = new Level(gameConfig.levelMaps[randomLevel]);
        
        // Создаем платформу
        const paddleX = (this.canvas.width - gameConfig.paddle.paddleWidth) / 2;
        const paddleY = this.canvas.height - 50;
        
        this.paddle = new Paddle(paddleX, paddleY);
        
        // Создаем мяч
        const ballRadius = 8;
        const ballSpeed = 8;
        const ballX = this.canvas.width / 2;
        const ballY = paddleY - ballRadius - 5;
        
        const newBall = new Ball(ballX, ballY, ballRadius, ballSpeed);
        this.balls = [newBall]; // Массив с одним мячом
        
        this.ui.updateLevelInfo(this.currentLevel, this.lives);
    }

    initLevel() {

        const levelsCount = gameConfig.levelMaps.length;
        const randomLevel = Math.floor(Math.random() * levelsCount);

        this.level = new Level(gameConfig.levelMaps[randomLevel]);

        this.bonusManager.activeBonuses = [];

        this.ui.updateLevelInfo(this.currentLevel, this.lives);
    }
    
    gameOver() {
        this.stop(); // Останавливаем игровой цикл через BaseGame
        this.isGameOver = true;
        this.ui.showGameOver();
    }

    update(deltaTime) {
        if (this.gamePause) {
            this.updatePause();
            return; // ← При паузе update не идёт дальше
        }
                
        // Обновляем платформу
        this.updatePaddle();
        
        // Обновляем мячи
        this.updateBalls();
        
        // Проверяем столкновения
        this.checkCollisions();

        this.bonusManager.update(deltaTime);
        
        // Проверяем сбор бонусов
        const collectedBonus = this.bonusManager.checkCollision(this);
        if (collectedBonus) {
            this.ui.showBonusNotification(collectedBonus);
        }

        this.bonusManager.updateActiveEffects(this);

        // Проверяем завершение уровня
        if (this.level.isCleared()) {
            this.nextLevel();
        }
        
        this.ui.updateScore(this.scoreManager.score);
    }

    updatePause(){
        this.ui.showAndHidePause(this.gamePause);
    }

    togglePause() {
        this.gamePause = !this.gamePause;
        this.input.pauseKey = this.gamePause;
        this.ui.showAndHidePause(this.gamePause);
    }

    updatePaddle() {
        if (!this.paddle) return;
        
        // Движение платформы
        if (this.input.isPressed('ArrowRight')) {
            this.paddle.moveRight(this.canvas.width);
        }
        if (this.input.isPressed('ArrowLeft')) {
            this.paddle.moveLeft();
        }
        
        this.paddle.updateLastPosition();

        // // Если мяч прикреплен к платформе, двигаем его вместе с платформой
        // if (this.mainBall && this.mainBall.isAttached) {
        //     this.mainBall.x = this.paddle.x + this.paddle.sizeX / 2;
        //     this.mainBall.y = this.paddle.y - this.mainBall.radius - 2;
        //     this.mainBall.paddle = this.paddle;
        // }
        
        // // Запуск мяча по пробелу
        // if (this.input.isSpacePressed() && this.mainBall && this.mainBall.isAttached) {
        //     this.mainBall.launch();
        // }

        // Если есть мячи, прикрепленные к платформе, двигаем их вместе
        for (const ball of this.balls) {
            if (ball.isAttached) {
                ball.x = this.paddle.x + this.paddle.sizeX / 2;
                ball.y = this.paddle.y - ball.radius - 2;
            }
        }
        
        // Запуск мяча по пробелу (запускаем все прикрепленные мячи)
        if (this.input.isSpacePressed()) {
            for (const ball of this.balls) {
                if (ball.isAttached) {
                    ball.launch();
                }
            }
        }
    }

    updateBalls() {
        for (const ball of this.balls) {
            ball.move();
            
            // Проверяем столкновение со стенами
            const ballLost = ball.checkWallCollision(this.canvas.width, this.canvas.height);
            
            if (ballLost) {
                ball.isLost = true;
            }
        }
        
        // Удаляем потерянные мячи
        this.balls = this.balls.filter(ball => !ball.isLost);
        
        // Если мячей не осталось, теряем жизнь
        if (this.balls.length === 0 && !this.isGameOver) {
            this.loseLife();
        }
    }

    checkCollisions() {
        if (this.balls.length === 0 || !this.paddle) return;
        
        // Проверяем столкновения для ВСЕХ мячей
        for (const ball of this.balls) {
            // Столкновение с блоками
            for (const block of this.level.blocks) {
                if (block.isDestroyed) continue;
                
                if (this.checkBallBlockCollision(ball, block)) {
                    if (block.isDestroyed) {
                        this.scoreManager.onBlockDestroy(block, this.bonusManager);
                    }
                    break;
                }
            }
            
            // Столкновение с платформой
            this.checkBallPaddleCollision(ball, this.paddle);
        }
    }
    
    checkBallBlockCollision(ball, block) {
        if (block.isDestroyed) return false;
        
        // Проверяем пересечение
        if (ball.x + ball.radius < block.x ||
            ball.x - ball.radius > block.x + block.sizeX ||
            ball.y + ball.radius < block.y ||
            ball.y - ball.radius > block.y + block.sizeY) {
            return false;
        }

        // Используем предыдущую позицию мяча для определения стороны удара
        const prevX = ball.x - ball.dx;
        const prevY = ball.y - ball.dy;
        
        // Проверяем, с какой стороны мяч НЕ пересекался в предыдущем кадре
        const wasOutsideLeft = prevX + ball.radius < block.x;
        const wasOutsideRight = prevX - ball.radius > block.x + block.sizeX;
        const wasOutsideTop = prevY + ball.radius < block.y;
        const wasOutsideBottom = prevY - ball.radius > block.y + block.sizeY;
        
        // Определяем сторону удара на основе предыдущей позиции
        if (wasOutsideLeft || wasOutsideRight) {
            ball.dx = -ball.dx; // Удар сбоку
        } else if (wasOutsideTop || wasOutsideBottom) {
            ball.dy = -ball.dy; // Удар сверху/снизу
        } else {
            // Если мяч был внутри блока (туннелирование), используем минимальное перекрытие
            const overlapLeft = (ball.x + ball.radius) - block.x;
            const overlapRight = (block.x + block.sizeX) - (ball.x - ball.radius);
            const overlapTop = (ball.y + ball.radius) - block.y;
            const overlapBottom = (block.y + block.sizeY) - (ball.y - ball.radius);
            
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
            
            if (minOverlap === overlapLeft || minOverlap === overlapRight) {
                ball.dx = -ball.dx;
            } else {
                ball.dy = -ball.dy;
            }
        }
        
        return block.takeDamage();
    }
    
    checkBallPaddleCollision(ball, paddle) {
        // Проверка столкновения
        if (ball.y + ball.radius < paddle.y) return false;
        if (ball.x < paddle.x || ball.x > paddle.x + paddle.sizeX) return false;
        if (ball.dy < 0) return false; // мяч летит вверх — не сталкиваемся
        
        // Используем предыдущую позицию для определения момента столкновения
        const prevY = ball.y - ball.dy;
        
        // Если в предыдущем кадре мяч был выше платформы, значит столкновение только что произошло
        if (prevY + ball.radius <= paddle.y) {
            // Мяч только что коснулся платформы — корректируем позицию плавно
            ball.y = paddle.y - ball.radius;
        } else {
            // Мяч уже внутри/под платформой (туннелирование) — вычисляем точку столкновения
            // Интерполируем позицию между предыдущим и текущим кадром
            const penetration = (ball.y + ball.radius) - paddle.y;
            ball.y = paddle.y - ball.radius - penetration * 0.5; // Выталкиваем на половину проникновения
        }
        
        // Базовый отскок - инвертируем вертикальную скорость
        ball.dy = -Math.abs(ball.dy); // Гарантируем движение вверх
        
        // 🎯 Влияние движения платформы на мяч
        const paddleVelocity = paddle.velocity || 0;
        const influence = 0.5; // Коэффициент влияния (0-1, чем больше — тем сильнее влияние)
        
        // Добавляем часть скорости платформы к горизонтальной скорости мяча
        ball.dx += paddleVelocity * influence;
        
        // Нормализация скорости мяча (чтобы не ускорялся бесконечно)
        const targetSpeed = 8; // Базовая скорость мяча
        const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        
        if (currentSpeed > 0) {
            ball.dx = (ball.dx / currentSpeed) * targetSpeed;
            ball.dy = (ball.dy / currentSpeed) * targetSpeed;
        }
        
        return true;
    }
    
    loseLife() {
        this.lives--;
        this.ui.updateLevelInfo(this.currentLevel, this.lives);
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Создаем ОДИН новый мяч
            const ballRadius = 8;
            const ballSpeed = 8;
            const ballX = this.canvas.width / 2;
            const ballY = this.paddle.y - ballRadius - 5;
            
            const newBall = new Ball(ballX, ballY, ballRadius, ballSpeed);
            this.balls = [newBall]; // Очищаем массив и добавляем новый мяч
        }
    }
    
    nextLevel() {
        this.currentLevel++;
        this.lives = 5;
        this.ui.showLevelNotification(this.currentLevel);
        this.initLevel();
    }


    draw() {
        // Очищаем canvas
        this.ctx.fillStyle = '#050510';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем уровень (блоки)
        if (this.level) {
            this.level.draw(this.ctx);
        }
        
        // Рисуем платформу
        if (this.paddle) {
            this.paddle.draw(this.ctx);
        }

        // Рисуем платформу
        if (this.bonusManager) {
            this.bonusManager.draw(this.ctx);
        }
        
        // Рисуем мячи
        for (const ball of this.balls) {
            ball.draw(this.ctx);
        }
    }
    
    destroy() {
        this.stop();
        console.log('Arcanoid destroyed');
    }
     
}

let game = null;

document.addEventListener('DOMContentLoaded', () =>{
    game = new Arcanoid();
    game.init();

    // 2. Делаем игру доступной в консоли
    window.game = game;


        // 3. Добавляем функцию отладки, которая работает с ЭТИМ экземпляром
    window.debug = (rows, cols, padding, health) => {
        game.level.generateDebug(rows, cols, padding, health);
    };
});
    

