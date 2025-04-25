class SettingsManager {
    constructor() {
        this.translations = {
            en: {
                settings: "Settings",
                theme: "Theme",
                language: "Language",
                clear_data: "Clear All Data",
                clear_data_confirm: "Are you sure you want to clear all data? This will remove all your settings, preferences, and cached data. This action cannot be undone.",
                clear_data_success: "All data has been cleared successfully",
                yes: "Yes",
                no: "No",
                dark: "Dark",
                light: "Light",
                back: "Back"
            },
            ru: {
                settings: "Настройки",
                theme: "Тема",
                language: "Язык",
                clear_data: "Удалить все данные",
                clear_data_confirm: "Вы уверены, что хотите удалить все данные? Это удалит все ваши настройки, предпочтения и кэшированные данные. Это действие нельзя отменить.",
                clear_data_success: "Все данные успешно удалены",
                yes: "Да",
                no: "Нет",
                dark: "Тёмная",
                light: "Светлая",
                back: "Назад"
            },
            uk: {
                settings: "Налаштування",
                theme: "Тема",
                language: "Мова",
                clear_data: "Видалити всі дані",
                clear_data_confirm: "Ви впевнені, що хочете видалити всі дані? Це видалить всі ваші налаштування, уподобання та кешовані дані. Цю дію не можна скасувати.",
                clear_data_success: "Всі дані успішно видалено",
                yes: "Так",
                no: "Ні",
                dark: "Темна",
                light: "Світла",
                back: "Назад"
            }
        };

        this.currentLang = localStorage.getItem('selectedLanguage') || 'ru';
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.createSettingsContent();
            this.bindEvents();
        });
    }

    createSettingsContent() {
        /*const content = document.querySelector('.settings-content');
        if (!content) return;

        content.innerHTML = `
            <div class="settings-section">
                <div class="settings-group">
                    <button class="settings-danger-button" id="clearDataBtn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        ${this.translations[this.currentLang].clear_data}
                    </button>
                </div>
                <h3 data-translate="backup_settings">Настройки бекапов</h3>
                <div class="backup-settings">
                    <div class="backup-interval-setting">
                        <label for="backup-interval" data-translate="backup_interval">Интервал автосохранения (минут):</label>
                        <input type="number" id="backup-interval" value="5" min="1" max="60">
                    </div>
                    <div class="backup-limit-setting">
                        <label for="backup-limit" data-translate="backup_limit">Максимальное количество бекапов:</label>
                        <input type="number" id="backup-limit" value="20" min="1" max="100">
                    </div>
                </div>
            </div>
        `;*/

        // Добавляем стили
        const style = document.createElement('style');
        style.textContent = `
            .settings-section {
                margin-bottom: 30px;
            }

            .settings-group {
                background: #1a1a1a;
                border-radius: 8px;
                padding: 16px;
            }

            .settings-danger-button {
                background: rgba(231, 76, 60, 0.1);
                color: #e74c3c;
                border: none;
                border-radius: 6px;
                padding: 12px 20px;
                font-size: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s;
                width: 100%;
            }

            .settings-danger-button:hover {
                background: rgba(231, 76, 60, 0.2);
            }

            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }

            .modal-content {
                background: #242424;
                border-radius: 8px;
                padding: 24px;
                max-width: 400px;
                width: 90%;
            }

            .modal-title {
                font-size: 18px;
                color: #e74c3c;
                margin: 0 0 16px 0;
            }

            .modal-text {
                color: #e0e0e0;
                margin-bottom: 24px;
                line-height: 1.5;
            }

            .modal-actions {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }

            .modal-button {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }

            .modal-button.confirm {
                background: #e74c3c;
                color: white;
            }

            .modal-button.confirm:hover {
                background: #c0392b;
            }

            .modal-button.cancel {
                background: #95a5a6;
                color: white;
            }

            .modal-button.cancel:hover {
                background: #7f8c8d;
            }
        `;
        document.head.appendChild(style);
    }

    bindEvents() {
        const clearDataBtn = document.getElementById('clearDataBtn');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => this.showClearDataConfirmation());
        }
    }

    showClearDataConfirmation() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h3 class="modal-title">${this.translations[this.currentLang].clear_data}</h3>
                <p class="modal-text">${this.translations[this.currentLang].clear_data_confirm}</p>
                <div class="modal-actions">
                    <button class="modal-button cancel">${this.translations[this.currentLang].no}</button>
                    <button class="modal-button confirm">${this.translations[this.currentLang].yes}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const confirmBtn = modal.querySelector('.confirm');
        const cancelBtn = modal.querySelector('.cancel');

        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });

        confirmBtn.addEventListener('click', () => {
            this.clearAllData();
            modal.remove();
            window.location.href = '/';
        });
    }

    clearAllData() {
        // Очищаем localStorage
        localStorage.clear();

        // Очищаем все куки
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
        }
    }
}

// Создаем экземпляр при загрузке страницы
window.settingsManager = new SettingsManager(); 