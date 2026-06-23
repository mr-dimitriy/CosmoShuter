
export class UIManager {
    constructor() {
        // Панели меню
        this.mainMenu = document.getElementById('main-menu');
        this.gameOverScreen = document.getElementById('game-over');
        this.pauseScreen = document.getElementById('game-pause');

        // Уведомления
        this.notifLevel = document.getElementById('notification-level');
        this.notifBonus = document.getElementById('notification-bonus');
        this.notifLevelValue = document.getElementById('notif-level-value');
        this.notifBonusName = document.getElementById('notif-bonus-name');
        
        // Элементы панели статистики
        this.levelDisplay = document.getElementById('level-display');
        this.livesDisplay = document.getElementById('lives-display');
        this.scoreDisplay = document.getElementById('score-display');
        this.blocksDisplay = document.getElementById('blocks-display');
        
        // Таймеры для автоматического скрытия
        this.hideTimers = {};
    }
        
    // ========== УВЕДОМЛЕНИЯ ==========
    showNotification(element, duration = 2000) {
        if (this.hideTimers[element.id]) {
            clearTimeout(this.hideTimers[element.id]);
        }
        
        element.classList.remove('show', 'hidden');
        void element.offsetWidth; // Форсируем reflow
        element.classList.add('show');
        
        this.hideTimers[element.id] = setTimeout(() => {
            element.classList.remove('show');
            element.classList.add('hidden');
            delete this.hideTimers[element.id];
        }, duration);
    }
    
    showLevelNotification(level) {
        if (this.notifLevelValue) {
            this.notifLevelValue.textContent = level;
        }
        this.showNotification(this.notifLevel, 2500);
    }
    
    showBonusNotification(bonusName) {
        if (this.notifBonusName) {
            this.notifBonusName.textContent = bonusName;
        }
        this.showNotification(this.notifBonus, 1500);
    }
    
    // ========== ОБНОВЛЕНИЕ СТАТИСТИКИ ==========
    updateScore(score) {
        if (this.scoreDisplay) this.scoreDisplay.textContent = score;
    }
    
    updateLevelInfo(level, lives) {
        if (this.levelDisplay) this.levelDisplay.textContent = level;
        if (this.livesDisplay) this.livesDisplay.textContent = lives;
    }
    
    updateBlocksDestroyed(count) {
        if (this.blocksDisplay) this.blocksDisplay.textContent = count;
    }
    
    updateAll(scoreManager, level, lives, blocksDestroyed) {
        this.updateScore(scoreManager.score);
        this.updateLevelInfo(level, lives);
        this.updateBlocksDestroyed(blocksDestroyed);
    }
    
    // ========== МЕНЮ ==========
    showMainMenu() {
        this.mainMenu.classList.remove('hidden');
    }
    
    hideMainMenu() {
        this.mainMenu.classList.add('hidden');
    }
    
    showGameOver() {
        this.gameOverScreen.classList.remove('hidden');
    }
    
    hideGameOver() {
        this.gameOverScreen.classList.add('hidden');
    }
    
    showAndHidePause(isPaused) {
        if (isPaused) {
            this.pauseScreen.classList.remove('hidden');
        } else {
            this.pauseScreen.classList.add('hidden');
        }
    }

}