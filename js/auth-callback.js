const DISCORD_CLIENT_ID = '1333948751919972434';
const DISCORD_REDIRECT_URI = window.location.origin + '/auth/discord/callback';
const COOKIE_NAME = 'ee_auth';
const COOKIE_EXPIRES_DAYS = 30;

class AuthCallback {
    constructor() {
        console.log('🔄 Инициализация AuthCallback...');
        this.handleCallback();
    }

    async handleCallback() {
        console.log('🔄 Обработка callback...');
        try {
            const fragment = new URLSearchParams(window.location.hash.slice(1));
            const accessToken = fragment.get('access_token');

            if (!accessToken) {
                throw new Error('Токен доступа не найден в URL');
            }

            console.log('🔑 Токен доступа получен');

            const response = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка при получении данных пользователя');
            }

            const data = await response.json();
            console.log('👤 Получены данные пользователя:', data);

            const userData = {
                id: data.id,
                username: data.username,
                displayName: data.global_name || data.username,
                avatar: data.avatar ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png` : null
            };

            console.log('💾 Сохранение данных пользователя...');
            
            // Сохраняем в localStorage
            const userDataString = JSON.stringify(userData);
            localStorage.setItem('userData', userDataString);
            console.log('✅ Данные сохранены в localStorage');

            // Сохраняем в Cookie
            if (window.authManager) {
                window.authManager.setCookie('ee_auth', userDataString, 30);
                console.log('✅ Данные сохранены в Cookie');
            }

            console.log('✅ Данные пользователя успешно сохранены');
            window.location.href = '/';
        } catch (error) {
            console.error('❌ Ошибка при обработке callback:', error);
            alert('Произошла ошибка при авторизации. Пожалуйста, попробуйте снова.');
            window.location.href = '/';
        }
    }
}

// Создаем экземпляр для обработки callback
window.authCallback = new AuthCallback(); 
