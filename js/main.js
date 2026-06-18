
class Game{
    constructor(){
        this.player = null;
        this.enemys = [];
        this.bullets = []; // ← Новый массив
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.enemySpawnInterval = null;
        this.isGameOver = false;
        this.enemySpawnTime = 1000;

        this.score = 0;
        this.kills = 0;
        this.killsStrike = 0;

        this.scoreMultiplier = 1;
        this.killsForNextMultiplier = 10; // Убийств до следующего уровня множителя

        // // Координаты каждого врага на спрайт-листе
        // this.enemySprites = [
        //     { sx: 0, sy: 0, swidth: 50, sheight: 59 },    // Враг 1
        //     { sx: 51, sy: 0, swidth: 32, sheight: 58 },   // Враг 2
        //     { sx: 82, sy: 0, swidth: 58, sheight: 60 },  // Враг 3
        //     { sx: 140, sy: 0, swidth: 60, sheight: 56 },  // Враг 4
        //     { sx: 200, sy: 0, swidth: 42, sheight: 48 },    // Враг 5
        //     { sx: 242, sy: 0, swidth: 28, sheight: 56 },   // Враг 6
        //     { sx: 270, sy: 0, swidth: 56, sheight: 60 },  // Враг 7
        //     { sx: 326, sy: 0, swidth: 52, sheight: 60 }   // Враг 8
        // ];

        this.enemyTypes = [
            {
                name: 'smalShip',
                spriteSheet: 'images/SpritesEnemy2.png',
                sprites:[
                    { sx: 51, sy: 0, swidth: 32, sheight: 58 },   // Враг 2
                    { sx: 200, sy: 0, swidth: 42, sheight: 48 },    // Враг 5
                    { sx: 242, sy: 0, swidth: 28, sheight: 56 }   // Враг 6
                ],
                speed: 1,
                dy: 3,
                points: 5,
                health: 1 
            },
            {
                name: 'mediumShip',
                spriteSheet: 'images/SpritesEnemy2.png',
                sprites: [
                    { sx: 0, sy: 0, swidth: 50, sheight: 59 },    // Враг 1
                    { sx: 51, sy: 0, swidth: 32, sheight: 58 },   // Враг 2
                    { sx: 140, sy: 0, swidth: 60, sheight: 56 }  // Враг 4
                ],
                speed: 0.8,
                dy: 2,
                points: 10,
                health: 2 
            }
        ];

        this.spriteSheets = {};
        this.loadSpriteSheets();

        this.playerSprites = {
            down: this.loadImage('images/player_down.png'),
            left: this.loadImage('images/player_left.png'),
            right: this.loadImage('images/player_right.png'),
            up: this.loadImage('images/player_up.png'),
            left_down: this.loadImage('images/player_left_down.png'),
            left_up: this.loadImage('images/player_left_up.png'),
            right_down: this.loadImage('images/player_right_down.png'),
            right_up: this.loadImage('images/player_right_up.png'),
            idle: this.loadImage('images/player.png')
        };

        this.init();
    }

    loadImage(src) {
        const img = new Image();
        img.src = src;
        return img;
    }

    loadSpriteSheets() {
        this.enemyTypes.forEach(type => {
            const img = new Image();
            img.src = type.spriteSheet;
            img.onload = () => {
                console.log(`Спрайт-лист для ${type.name} загружен`);
            };
            this.spriteSheets[type.name] = img;
        });
    }


    init() {
        const startBtn = document.getElementById('start-game-btn');
        const restartBtn = document.getElementById('restart-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () =>
                {
                    this.startGame();
                    document.getElementById('main-menu').classList.add('hidden');
                });
                    
        }
        if (restartBtn) {
            restartBtn.addEventListener('click', () =>
                {
                    this.startGame();
                    document.getElementById('game-over').classList.add('hidden');
                });
        }

    }
    
    startGame() {
        
        this.isGameOver = false;
        this.enemys = [];
        // Сбрасываем счет при новой игре
        this.score = 0;
        this.kills = 0;
        this.killsStrike = 0
        this.scoreMultiplier = 1;
        this.killsForNextMultiplier = 10;
        this.updateScoreDisplay();
        this.updateKillsDisplay();
        this.updateMultiplierDisplay();

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.player = new Player(this.canvas.width, this.canvas.height, 45, 45, this.playerSprites); 

        this.createEnemys();
        // Запускаем спавн новых врагов каждые 10 секунд
        this.enemySpawnInterval = setInterval(() => {
            this.createEnemys();
        }, this.enemySpawnTime);
        
        
        this.gameLoop();
        
    }
    
    update() {
        // Двигаем игрока
        for (const key of this.player.keys.keys()) {
            this.clickButtonPlayer(key);
        }
        
        if(this.player.keys.size == 0){
            this.player.currentDirection = 'idle';
        }
        // Двигаем всех врагов
        for (const enemy of this.enemys) {
            enemy.move();
        }

        // Двигаем пули
        for (const bullet of this.bullets) {
            bullet.move();
        }

        // Удаляем улетевшие пули
        this.bullets = this.bullets.filter(bullet => 
            !bullet.isOffScreen(this.canvas.width, this.canvas.height)
        );

        this.enemys = this.enemys.filter(enemy => 
            !enemy.isOffScreen(this.canvas.width, this.canvas.height)
        );

        this.checkCollisions();
    }
    
    gameLoop() {
        
        if (this.isGameOver) {
            return; // Выходим из цикла
        }
        this.update();
        this.draw();

        requestAnimationFrame(() => this.gameLoop());
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (const enemy of this.enemys) {
            if (enemy.isLoaded) {
                enemy.draw(this.ctx);
            }
        }

        this.player.draw(this.ctx);
        this.player.drawCooldownBar(this.ctx);
        this.player.drawHealthfBar(this.ctx);
        // Рисуем пули
        for (const bullet of this.bullets) {
            bullet.draw(this.ctx);
        }
    }
    
    createEnemys(){
        // Случайно выбираем тип и спрайт
        const randomTypeIndex = Math.floor(Math.random() * this.enemyTypes.length);
        const randomType = this.enemyTypes[randomTypeIndex];
        const randomSpriteIndex = Math.floor(Math.random() * randomType.sprites.length);
        const randomSprite = randomType.sprites[randomSpriteIndex];
        
        const enemy = new Enemy(
            this.canvas.width,
            this.canvas.height,
            randomSprite.swidth,
            randomSprite.sheight,
            this.spriteSheets[randomType.name],
            randomSprite,
            randomType.speed,
            randomType.name,
            randomType.dy,
            randomType.points
        );
        
        this.enemys.push(enemy);
    }

    clickButtonPlayer(key){
        const player = this.player;

        const keys = this.player.keys;
        const hasUp = keys.has('ArrowUp');
        const hasDown = keys.has('ArrowDown');
        const hasLeft = keys.has('ArrowLeft');
        const hasRight = keys.has('ArrowRight');

        if (hasUp && hasLeft) {
            player.currentDirection = 'left_up';
        } else if (hasUp && hasRight) {
            player.currentDirection = 'right_up';
        } else if (hasDown && hasLeft) {
            player.currentDirection = 'left_down';
        } else if (hasDown && hasRight) {
            player.currentDirection = 'right_down';
        } else if (hasUp) {
            player.currentDirection = 'up';
        } else if (hasDown) {
            player.currentDirection = 'down';
        } else if (hasLeft) {
            player.currentDirection = 'left';
        } else if (hasRight) {
            player.currentDirection = 'right';
        }else {
            player.currentDirection = 'idle';
        }

        switch(key){
            case"ArrowRight":
                if (player.x + player.sizeX < this.canvas.width) {
                    player.x += player.dx * player.speed;
                }
                break;

            case"ArrowLeft":
                player.x -= player.dx * player.speed;
                if (player.x < 0) {
                    player.x += player.dx * player.speed;
                }
                break;
            case"ArrowUp":
                player.y -= player.dy * player.speed;
                if ( player.y < 0) {
                    player.y += player.dy * player.speed;
                }
                break;                
            case"ArrowDown":
                if (player.y + player.sizeY < this.canvas.height ) {
                    player.y += player.dy * player.speed;
                }
                break;

            case" ":
                if(this.player.canShoot()){
                    this.createBullet();
                }
                break;

            default:
                break;
        }

    }

    checkCollisions() {
        const player = this.player;

        for (let j = this.enemys.length - 1; j >= 0; j--) {
            const enemy = this.enemys[j];
                    
            // Столкновение пуль с врагами
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const bullet = this.bullets[i];

                if (this.isColliding(bullet, enemy)) {
                    this.bullets.splice(i, 1);
                    this.enemys.splice(j, 1);
                    this.onEnemyKilled(enemy.costPoint);
                    break;
                }
            }

            if (this.isColliding(player, enemy)) {
                this.enemys.splice(j, 1);
                this.clearMultiplier();
                this.player.playerHealth--;
                if(this.player.playerHealth < 1){
                    this.gameOver();
                }
                break; // Выходим из цикла, игра окончена
            }
        }
    }

    isColliding(rect1, rect2) {
        return !(
            rect1.x + rect1.sizeX < rect2.x ||
            rect1.x > rect2.x + rect2.sizeX ||
            rect1.y + rect1.sizeY < rect2.y ||
            rect1.y > rect2.y + rect2.sizeY
        );
    }

    createBullet() {
        const bulletX = this.player.x + (this.player.sizeX / 2) - 5;
        const bulletY = this.player.y;
        
        const bullet = new Bullet(bulletX, bulletY);
        this.bullets.push(bullet);
    }
     
    // Метод обработки убийства
    onEnemyKilled(pointsPerKill) {
        this.kills++;
        this.killsStrike++;
        // Добавляем очки с текущим множителем
        const points = Math.floor(pointsPerKill * this.scoreMultiplier);;
        this.addScore(points);
           
        // Проверяем, не пора ли увеличить множитель
        if (this.killsStrike >= this.killsForNextMultiplier) {
            this.increaseMultiplier();
        }
        
        this.updateKillsDisplay();
    }

    // Увеличение множителя
    increaseMultiplier() {
        this.scoreMultiplier *= 1.5;
        this.killsForNextMultiplier += 10 * this.killsForNextMultiplier/5; // Следующий уровень через 10 убийств

        this.updateMultiplierDisplay();
        // Опционально: визуальное уведомление
        this.showMultiplierNotification();
    }

    // Уведомление об увеличении множителя
    showMultiplierNotification() {
        // Можно добавить анимацию или всплывающее сообщение
        const notification = document.createElement('div');
        notification.textContent = `Множитель x${this.scoreMultiplier.toFixed(2)}!`;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 215, 0, 0.9);
            color: #000;
            padding: 20px 40px;
            font-size: 32px;
            font-weight: bold;
            border-radius: 10px;
            z-index: 1000;
            animation: fadeInOut 2s forwards;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    // Метод добавления очков
    addScore(points) {
        this.score += points;
        this.updateScoreDisplay();
    }
    
    // Метод увеличения количества убийств
    addKill() {
        this.kills++;
        this.updateKillsDisplay();
    }

    //Очистка множителя
    clearMultiplier(){
        this.scoreMultiplier = 1;
        this.killsForNextMultiplier = 10;
        this.killsStrike = 0;
        this.updateMultiplierDisplay();
    }

    // Обновление отображения счета
    updateScoreDisplay() {
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            scoreDisplay.textContent = this.score;
        }
    }
    
    // Обновление отображения убийств
    updateKillsDisplay() {
        const killsDisplay = document.getElementById('kills-display');
        if (killsDisplay) {
            killsDisplay.textContent = this.kills;
        }
    }

    updateMultiplierDisplay() {
        const multiplierDisplay = document.getElementById('multiplier-display');
        if (multiplierDisplay) {
            multiplierDisplay.textContent = `x${this.scoreMultiplier.toFixed(2)}`;
        }
        const killsForNextDisplay = document.getElementById('killsForNext-display');
        if (killsForNextDisplay) {
            killsForNextDisplay.textContent = `x${this.killsForNextMultiplier.toFixed(0)}`;
        }
    }

    gameOver() {
        if (this.enemySpawnInterval) {
            clearInterval(this.enemySpawnInterval);
        }
        this.isGameOver = true;
           
        const gameOverScreen = document.getElementById('game-over');
        if (gameOverScreen) {
            gameOverScreen.classList.remove('hidden');
        }
    }
    
}


class GameObject {
    constructor(x, y, sizeX, sizeY) {
        this.x = x;
        this.y = y;
        this.sizeX = sizeX;
        this.sizeY = sizeY; 
    }
    
    // Общий метод для проверки выхода за экран
    isOffScreen(canvasWidth, canvasHeight) {
        return (
            this.x + this.sizeX < 0 ||    // Ушел за левый край
            this.x > canvasWidth ||        // Ушел за правый край
            this.y + this.sizeY < 0 ||    // Ушел за верхний край
            this.y > canvasHeight          // Ушел за нижний край
        );
    }
}


class Creature extends GameObject{
    constructor(width, height, sizeX, sizeY){
        super(width, height, sizeX, sizeY);

        this.speed = 1;// Скорость движения (пикселей за кадр)
        this.dx = 5; // Изменение по X
        this.dy = 5; // Изменение по Y
    }

}

class Player extends Creature{
    constructor(width, height, sizeX, sizeY, sprites){
        super(width, height, sizeX, sizeY);

        this.canvasWidth = width;
        this.canvasHeight = height;

        this.x = (width - this.sizeX) / 2; 
        this.y = (height - this.sizeY) - 20; 

        this.keys = new Map(); // Кнопки

        this.lastShotTime = 0; // Время последнего выстрела
        this.shootCooldown = 800;

        this.playerHealth = 3;
        this.weaponLevel = 1;

        this.sprites = sprites;
        this.currentDirection = 'idle';

        this.updateWeaponStats();

        this.init();
    }

    init(){

        document.addEventListener('keydown', e => {
            if(!this.keys.get(e.key)){
                this.keys.set(e.key, e.key);
            }
        });

        document.addEventListener('keyup', e => {
            if(this.keys.get(e.key)){
                this.keys.delete(e.key);
            }
        });
    } 
    canShoot() {
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime >= this.shootCooldown) {
            this.lastShotTime = Date.now();
            return true; // Можно стрелять
        }
        return false; // Еще рано
    }

    updateWeaponStats() {
        switch(this.weaponLevel) {
            case 1:
                this.shootCooldown = 800;
                break;
            case 2:
                this.shootCooldown = 500;
                break;
            case 3:
                this.shootCooldown = 300;
                break;
            case 4:
                this.shootCooldown = 150;
                break;
            default:
                break;
        }
    }
    
    upgradeWeapon() {
        this.weaponLevel++;
        this.updateWeaponStats();
    }

    drawCooldownBar(ctx) {
        const player = this;
        const currentTime = Date.now();
        const timeSinceLastShot = currentTime - player.lastShotTime;
        
        // Прогресс от 0 до 1 (1 = готов к стрельбе)
        const progress = Math.min(timeSinceLastShot / player.shootCooldown, 1);
        
        const barWidth = player.sizeX;
        const barHeight = 5;
        const barX = player.x;
        const barY = player.y-5; // Над игроком
        
        // Фон полоски (серый)
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Заполненная часть (зеленый, когда готов)
        ctx.fillStyle = progress >= 1 ? '#00ff00' : '#ffff00';
        ctx.fillRect(barX, barY, barWidth * progress, barHeight);
    }

    drawHealthfBar(ctx) {
        const player = this;

        const barWidth = player.sizeX;
        const barHeight = 5;
        const barX = player.x;
        const barY = player.y + player.sizeY + 5; // Под игроком

        // Фон полоски (серый)
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Заполненная часть (зеленый, когда готов)
        switch(this.playerHealth){
            case(0):
                ctx.fillStyle = '#333';
                break;
            case(1):
                ctx.fillStyle =  '#af0202ff';
                break;
            case(2):
                ctx.fillStyle =  '#ffff00';
                break;
            case(3):
                ctx.fillStyle =  '#00ff00';
                break;
        }
        ctx.fillRect(barX, barY, barWidth * (this.playerHealth/3), barHeight);
    }

    draw(ctx) {
        const sprite = this.sprites[this.currentDirection];
        
        // Проверяем, что картинка загружена
        if (sprite && sprite.complete) {
            ctx.drawImage(sprite, this.x, this.y, this.sizeX, this.sizeY);
        }
    }
}

class Enemy extends Creature{
    constructor(width, height, sizeX, sizeY, spriteSheet, spriteData, speed,  typeName, dy=3, costPoint = 5){
        super(width, height, sizeX, sizeY);

        this.x = Math.random() * width; 
        this.y = 0; 

        this.dx = 3;
        this.dy = dy;
        this.speed = speed;
        this.costPoint = costPoint;
        this.typeName = typeName;

        this.spriteSheet = spriteSheet;
        this.spriteData = spriteData;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        
        this.isLoaded = spriteSheet.complete; // Флаг готовности
    }
    
    draw(ctx) {
        if (this.isLoaded) {
            // Используем 9-аргументный drawImage для вырезания части спрайт-листа
            ctx.drawImage(
                this.spriteSheet,
                this.spriteData.sx, this.spriteData.sy,
                this.spriteData.swidth, this.spriteData.sheight,
                this.x, this.y,
                this.sizeX, this.sizeY
            );
        }
    }

    move(){
        this.y += this.dy * this.speed;
    }

}

class Bullet extends GameObject {
    constructor(x, y, sizeX = 10, sizeY = 10, speed = 5) {
        super(x, y, sizeX, sizeY );
        this.speed = speed;
        this.color = this.randomRgbColor();
    }
    
    move() {
        this.y -= this.speed; // Летит вверх
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.sizeX, this.sizeY);
    }
    
    randomRgbColor() {
        const red = Math.floor(Math.random() * 256); // Случайное число от 0 до 255
        // const green = Math.floor(Math.random() * 256);
        // const blue = Math.floor(Math.random() * 256);
        const green = 0;
        const blue = 0;
        return `rgb(${red}, ${green}, ${blue})`;
    }
}


document.addEventListener('DOMContentLoaded', () => new Game());


