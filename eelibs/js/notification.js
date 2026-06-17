class NotificationManager {
    constructor() {
        this.container = null;
        this.notifications = new Set();
        this.initialize();
        
        // Привязываем методы к контексту
        this.show = this.show.bind(this);
        this.close = this.close.bind(this);
        this.closeAll = this.closeAll.bind(this);
    }

    initialize() {
        // Создаем контейнер для уведомлений, если его еще нет
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        }
    }

    /**
     * Показать уведомление
     * @param {Object} options - Параметры уведомления
     * @param {string} options.title - Заголовок уведомления
     * @param {string} options.message - Текст уведомления
     * @param {string} options.type - Тип уведомления ('success', 'error', 'warning', 'info')
     * @param {number} [options.duration=5000] - Длительность показа в миллисекундах
     * @param {boolean} [options.closeable=true] - Можно ли закрыть уведомление
     * @param {boolean} [options.progress=true] - Показывать ли индикатор прогресса
     */
    show({ title = '', message = '', type = 'info', duration = 5000, closeable = true, progress = true } = {}) {
        try {
            // Проверяем наличие контейнера
            if (!this.container) {
                this.initialize();
            }

            // Преобразуем значения в строки
            title = this.valueToString(title);
            message = this.valueToString(message);

            // Проверяем тип уведомления
            const validTypes = ['success', 'error', 'warning', 'info'];
            if (!validTypes.includes(type)) {
                type = 'info';
            }

            // Проверяем длительность
            duration = Math.max(0, parseInt(duration) || 5000);

            const notification = document.createElement('div');
            notification.className = `notification ${type}`;

            // Экранируем HTML в title и message
            const safeTitle = this.escapeHtml(title);
            const safeMessage = this.escapeHtml(message);

            // Создаем содержимое уведомления
            notification.innerHTML = `
                <div class="notification-icon">${this.getIconForType(type)}</div>
                <div class="notification-content">
                    <div class="notification-title">${safeTitle}</div>
                    <div class="notification-text">${safeMessage}</div>
                </div>
                ${closeable ? `
                    <button class="notification-close" aria-label="Закрыть уведомление">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.06 11.9994L19.031 6.03042C19.324 5.73742 19.324 5.26342 19.031 4.97042C18.738 4.67742 18.262 4.67742 17.97 4.97042L11.999 10.9384L6.02999 4.97042C5.73699 4.67742 5.26199 4.67742 4.96899 4.97042C4.67599 5.26342 4.67599 5.73742 4.96899 6.03042L10.939 11.9994L4.96899 17.9704C4.67599 18.2634 4.67599 18.7374 4.96899 19.0304C5.11599 19.1774 5.30699 19.2494 5.49899 19.2494C5.69199 19.2494 5.88299 19.1774 6.02999 19.0304L11.999 13.0614L17.97 19.0304C18.116 19.1774 18.308 19.2494 18.5 19.2494C18.692 19.2494 18.884 19.1774 19.031 19.0304C19.324 18.7374 19.324 18.2634 19.031 17.9704L13.06 11.9994Z" fill="white"/></svg>
                    </button>
                ` : ''}
                ${progress ? '<div class="notification-progress"></div>' : ''}
            `;

            // Добавляем в контейнер
            this.container.appendChild(notification);
            this.notifications.add(notification);

            // Настраиваем прогресс-бар
            if (progress && duration > 0) {
                const progressBar = notification.querySelector('.notification-progress');
                if (progressBar) {
                    progressBar.style.width = '100%';
                    progressBar.style.transition = `width ${duration}ms linear`;
                    // Используем requestAnimationFrame для более плавной анимации
                    requestAnimationFrame(() => {
                        progressBar.style.width = '0%';
                    });
                }
            }

            // Добавляем обработчик для кнопки закрытия
            if (closeable) {
                const closeButton = notification.querySelector('.notification-close');
                if (closeButton) {
                    const closeHandler = () => {
                        this.close(notification);
                        closeButton.removeEventListener('click', closeHandler);
                    };
                    closeButton.addEventListener('click', closeHandler);
                }
            }

            // Автоматически закрываем через указанное время
            if (duration > 0) {
                const timeoutId = setTimeout(() => {
                    if (this.notifications.has(notification)) {
                        this.close(notification);
                    }
                }, duration);

                // Сохраняем ID таймера для возможности отмены
                notification.dataset.timeoutId = timeoutId;
            }

            return notification;
        } catch (error) {
            console.error('Error showing notification:', error);
            return null;
        }
    }

    /**
     * Закрыть уведомление
     * @param {HTMLElement} notification - Элемент уведомления
     */
    close(notification) {
        try {
            if (!notification || !this.notifications.has(notification)) return;

            // Отменяем таймер автозакрытия, если он есть
            const timeoutId = notification.dataset.timeoutId;
            if (timeoutId) {
                clearTimeout(parseInt(timeoutId));
            }

            notification.classList.add('closing');
            
            const handleAnimationEnd = () => {
                if (notification.parentNode) {
                    notification.remove();
                }
                this.notifications.delete(notification);
                notification.removeEventListener('animationend', handleAnimationEnd);
            };

            notification.addEventListener('animationend', handleAnimationEnd);
        } catch (error) {
            console.error('Error closing notification:', error);
        }
    }

    /**
     * Закрыть все уведомления
     */
    closeAll() {
        try {
            this.notifications.forEach(notification => this.close(notification));
        } catch (error) {
            console.error('Error closing all notifications:', error);
        }
    }

    /**
     * Экранирование HTML
     * @private
     */
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Получить SVG иконку для типа уведомления
     * @private
     */
    getIconForType(type) {
        const icons = {
            success: `<svg viewBox="0 0 24 24" fill="none" stroke="#2ecc71" stroke-width="2" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>`,
            error: `<svg viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>`,
            warning: `<svg viewBox="0 0 24 24" fill="none" stroke="#f1c40f" stroke-width="2" aria-hidden="true">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>`,
            info: `<svg viewBox="0 0 24 24" fill="none" stroke="#3498db" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>`
        };
        return icons[type] || icons.info;
    }

    /**
     * Преобразует любое значение в строку
     * @private
     */
    valueToString(value) {
        if (value === null || value === undefined) {
            return '';
        }
        if (typeof value === 'object') {
            try {
                return JSON.stringify(value, null, 2);
            } catch (e) {
                return String(value);
            }
        }
        return String(value);
    }
}

// Создаем глобальный экземпляр менеджера уведомлений после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.notification = new NotificationManager();

    // Удобные методы для разных типов уведомлений
    window.notification.success = (title, message, options = {}) => {
        return window.notification.show({ title, message, type: 'success', ...options });
    };

    window.notification.error = (title, message, options = {}) => {
        return window.notification.show({ title, message, type: 'error', ...options });
    };

    window.notification.warning = (title, message, options = {}) => {
        return window.notification.show({ title, message, type: 'warning', ...options });
    };

    window.notification.info = (title, message, options = {}) => {
        return window.notification.show({ title, message, type: 'info', ...options });
    };

if (window.location.href.includes('https')) {

} else if (window.location.href.includes('http') || window.location.href.includes('hello.html')) {

} else {
    showWarning('Opened local copy of app')
}
});

/*
showSuccess('Заголовок', 'Сообщение');
showError('Ошибка', 'Текст ошибки');
showWarning('Внимание', 'Предупреждение');
showInfo('Информация', 'Информационное сообщение');
*/