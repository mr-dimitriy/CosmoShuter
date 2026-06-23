export class GameLauncher {
    constructor() {
        this.launcher = document.getElementById('launcher');
        this.gameContainer = document.getElementById('game-container');
        this.gameFrame = document.getElementById('game-frame');
        this.backBtn = document.getElementById('back-btn');
        
        this.init();
    }
    
    init() {
        // Обработка кликов по карточкам игр
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                const gameName = card.dataset.game;
                this.launchGame(gameName);
            });
        });
        
        // Кнопка "Назад"
        this.backBtn.addEventListener('click', () => {
            this.returnToMenu();
        });
    }
    
    launchGame(gameName) {
        // Скрываем лаунчер, показываем контейнер игры
        this.launcher.classList.add('hidden');
        this.gameContainer.classList.remove('hidden');
        
        // Загружаем игру в iframe
        this.gameFrame.src = `js/games/${gameName}/index.html`;
    }
    
    returnToMenu() {
        // Очищаем iframe (останавливаем игру)
        this.gameFrame.src = '';
        
        // Возвращаемся в меню
        this.gameContainer.classList.add('hidden');
        this.launcher.classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => new GameLauncher());