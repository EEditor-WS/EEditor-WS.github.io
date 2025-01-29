const DISCORD_CLIENT_ID = '1333948751919972434';
const DISCORD_REDIRECT_URI = window.location.origin + '/auth/discord/callback';
const COOKIE_NAME = 'ee_auth';
const COOKIE_EXPIRES_DAYS = 30;

class AuthCallback {
    constructor() {
        console.log('🔄 Инициализация AuthCallback...');
        this.handleCallback();
    }

    showError(message) {
        console.error('❌', message);
        const loader = document.querySelector('.loader');
        if (loader) {
            loader.style.display = 'none';
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        // Перенаправляем на главную через 3 секунды
        setTimeout(() => {
            window.location.href = '/';
        }, 3000);
    }

    async handleCallback() {
        console.log('🔄 Обработка callback...');
        try {
            // Получаем токен из URL
            const fragment = new URLSearchParams(window.location.hash.slice(1));
            const accessToken = fragment.get('access_token');
            const error = fragment.get('error');
            const errorDescription = fragment.get('error_description');

            // Проверяем наличие ошибок в URL
            if (error) {
                throw new Error(errorDescription || 'Ошибка авторизации Discord');
            }

            // Проверяем наличие токена
            if (!accessToken) {
                throw new Error('Токен доступа не найден в URL');
            }

            console.log('🔑 Токен доступа получен');

            // Получаем данные пользователя из Discord
            const response = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`Ошибка получения данных пользователя: ${response.status}`);
            }

            const data = await response.json();
            console.log('👤 Получены данные пользователя:', data);

            // Формируем данные пользователя
            const userData = {
                id: data.id,
                username: data.username,
                displayName: data.global_name || data.username,
                avatar: data.avatar ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png` : null,
                lastLogin: new Date().toISOString()
            };

            // Сохраняем данные
            localStorage.setItem('userData', JSON.stringify(userData));
            console.log('✅ Данные пользователя сохранены');

            // Перенаправляем на главную
            window.location.href = '/';
        } catch (error) {
            this.showError(error.message || 'Произошла ошибка при авторизации');
        }
    }
}

// Создаем экземпляр для обработки callback
window.authCallback = new AuthCallback(); 
