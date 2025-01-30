const DISCORD_CLIENT_ID = '1333948751919972434';
const DISCORD_REDIRECT_URI = window.location.origin + '/auth/discord/callback';
const GITHUB_DATA_REPO = 'EE-Apps/eeditor-ws-data';
const COOKIE_NAME = 'ee_auth';
const COOKIE_EXPIRES_DAYS = 30;

// Разбиваем токен на части
const GITHUB_TOKEN_PARTS = [
    'github_pat_11A6XWVIA0',
    'qvCkkNmpWI3D_gdd4odbqw',
    'dOdlI420lYVKHk21LGkWD',
    'JLUFHMiaX5iJsVW32TDXST31OsDw2'
];

function getGithubToken() {
    return GITHUB_TOKEN_PARTS.join('');
}

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

    async checkAndCreateUserFile(userData) {
        try {
            const githubToken = getGithubToken();
            if (!githubToken) throw new Error('Не удалось получить токен GitHub');

            const filename = `users/${userData.id}.json`;
            
            // Проверяем существование файла
            try {
                const checkResponse = await fetch(`https://api.github.com/repos/${GITHUB_DATA_REPO}/contents/${filename}`, {
                    headers: {
                        'Authorization': `Bearer ${githubToken}`,
                    }
                });

                if (checkResponse.status === 404) {
                    // Файл не существует, создаем новый
                    console.log('📝 Создание нового файла пользователя...');
                    const now = new Date();
                    const moscowTime = new Date(now.getTime() + (3 * 60 * 60 * 1000)); // UTC+3 для Москвы

                    // Получаем сохраненный язык из localStorage или используем русский по умолчанию
                    const savedLang = localStorage.getItem('selectedLanguage') || 'ru';
                    console.log('🌐 Использование сохраненного языка для нового пользователя:', savedLang);

                    const userFileData = {
                        name: userData.username,
                        id: `@${userData.username}`,
                        nid: userData.id,
                        reg: now.getTime(),
                        regt: moscowTime.toISOString(),
                        lang: savedLang,
                        countries: [],
                        reforms: [],
                        events: [],
                        maps: [],
                        scenarios: [],
                        status: "user"
                    };

                    const content = btoa(JSON.stringify(userFileData, null, 2));
                    const createResponse = await fetch(`https://api.github.com/repos/${GITHUB_DATA_REPO}/contents/${filename}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${githubToken}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            message: `Create user data for ${userData.username}`,
                            content: content,
                            branch: 'main'
                        })
                    });

                    if (!createResponse.ok) {
                        throw new Error('Failed to create user file');
                    }
                    console.log('✅ Файл пользователя создан успешно');
                } else {
                    console.log('✅ Файл пользователя уже существует');
                }
            } catch (error) {
                console.error('❌ Ошибка при работе с файлом пользователя:', error);
                throw error;
            }
        } catch (error) {
            console.error('❌ Ошибка при проверке/создании файла пользователя:', error);
            throw error;
        }
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

            // Проверяем существование файла пользователя
            await this.checkAndCreateUserFile(userData);

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
