import { InputHandler } from '../../../common/InputHandler.js';
import { BaseGame } from '../../../common/BaseGame.js';
import { AssetLoader } from "./AssetLoader.js";
import { ScoreManager } from './Managers/ScoreManager.js';
import { UIManager } from "./Managers/UIManager.js";
import { Paddle, Ball } from './GameObjects/Entite.js';
import { Level } from './Managers/LevelsManager.js';
import { gameConfig } from "./config.js";


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

        
        // Игровые сущности
        this.paddle = null;
        this.mainBall = null;
        this.level = null;
        this.balls = [];

        // Состояние
        this.isGameOver = false;
        this.gamePause = false;
        this.currentLevel = 1;
        this.lives = 3;
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
        this.lives = 3;
        this.lastFrameTime = Date.now();
        this.balls = [];

        this.scoreManager.reset();

        this.ui.hideMainMenu();
        this.ui.hideGameOver();
        this.ui.updateAll(this.scoreManager);

        this.initLevel();
        this.start();
    }    

    initLevel() {
        // Создаем уровень с блоками
        const rows = 5;
        const cols = 10;
        const blockWidth = 80;
        const blockHeight = 30;
        const padding = 10;
        
        this.level = new Level(rows, cols, blockWidth, blockHeight, padding,this.currentLevel);
        
        // Создаем платформу
        const paddleX = (this.canvas.width - gameConfig.paddle.paddleWidth) / 2;
        const paddleY = this.canvas.height - 50;
        
        this.paddle = new Paddle(paddleX, paddleY);
        
        // Создаем мяч
        const ballRadius = 8;
        const ballSpeed = 5;
        const ballX = this.canvas.width / 2;
        const ballY = paddleY - ballRadius - 5;
        
        this.mainBall = new Ball(ballX, ballY, ballRadius, ballSpeed);
        this.balls = [this.mainBall];
        
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

        // Если мяч прикреплен к платформе, двигаем его вместе с платформой
        if (this.mainBall && this.mainBall.isAttached) {
            this.mainBall.x = this.paddle.x + this.paddle.sizeX / 2;
            this.mainBall.y = this.paddle.y - this.mainBall.radius - 2;
        }
        
        // Запуск мяча по пробелу
        if (this.input.isSpacePressed() && this.mainBall && this.mainBall.isAttached) {
            this.mainBall.launch();
        }
    }

    updateBalls() {
        for (const ball of this.balls) {
            ball.move();
            
            // Проверяем столкновение со стенами
            const ballLost = ball.checkWallCollision(this.canvas.width, this.canvas.height);
            
            if (ballLost) {
                this.onBallLost(ball);
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
        if (!this.mainBall || !this.paddle) return;
        
        // Столкновение мяча с блоками
        for (const block of this.level.blocks) {
            if (block.isDestroyed) continue;
            
            if (this.checkBallBlockCollision(this.mainBall, block)) {
                // Блок уничтожен или поврежден
                if (block.isDestroyed) {
                    this.scoreManager.onBlockDestroy(block);
                }
                break; // Обрабатываем только одно столкновение за кадр
            }
        }
        
        // Столкновение мяча с платформой
        this.checkBallPaddleCollision(this.mainBall, this.paddle);
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
        
        // Определяем сторону удара
        const overlapLeft = (ball.x + ball.radius) - block.x;
        const overlapRight = (block.x + block.sizeX) - (ball.x - ball.radius);
        const overlapTop = (ball.y + ball.radius) - block.y;
        const overlapBottom = (block.y + block.sizeY) - (ball.y - ball.radius);
        
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        
        // Отражаем мяч в зависимости от стороны
        if (minOverlap === overlapLeft || minOverlap === overlapRight) {
            ball.dx = -ball.dx;
        } else {
            ball.dy = -ball.dy;
        }
        
        return block.takeDamage();
    }
    
    checkBallPaddleCollision(ball, paddle) {
        // Проверка столкновения
        if (ball.y + ball.radius < paddle.y) return false;
        if (ball.x < paddle.x || ball.x > paddle.x + paddle.sizeX) return false;
        if (ball.dy < 0) return false; // мяч летит вверх — не сталкиваемся
        
        // Базовый отскок - инвертируем вертикальную скорость
        ball.dy = -Math.abs(ball.dy); // Гарантируем движение вверх
        
        // Влияние движения платформы на мяч
        const paddleDirection = paddle.getMovementDirection();
        const influence = 2; // Сила влияния платформы (можно настроить)
        
        // Если платформа движется, добавляем импульс мячу
        if (paddleDirection !== 0) {
            ball.dx += paddleDirection * influence;
        }
        
        // Нормализация скорости мяча (чтобы не ускорялся бесконечно)
        const targetSpeed = 8; // Базовая скорость мяча
        const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        
        if (currentSpeed > 0) {
            ball.dx = (ball.dx / currentSpeed) * targetSpeed;
            ball.dy = (ball.dy / currentSpeed) * targetSpeed;
        }
            
        // Поднимаем мяч над платформой, чтобы не застрял
        ball.y = paddle.y - ball.radius;
        
        return true;
    }
    
    onBallLost(ball) {
        ball.isLost = true;
    }
    
    loseLife() {
        this.lives--;
        this.ui.updateLevelInfo(this.currentLevel, this.lives);
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Сбрасываем мяч на платформу
            const ballRadius = 8;
            const ballSpeed = 5;
            const ballX = this.canvas.width / 2;
            const ballY = this.paddle.y - ballRadius - 5;
            
            this.mainBall = new Ball(ballX, ballY, ballRadius, ballSpeed);
            this.balls = [this.mainBall];
        }
    }
    
    nextLevel() {
        this.currentLevel++;
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
    window.debug = (type = '') => {

    };
});
    

