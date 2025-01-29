const DISCORD_CLIENT_ID = '1333948751919972434'; // Замените на ваш Client ID
const DISCORD_REDIRECT_URI = window.location.origin + '/auth/discord/callback';
const GITHUB_REPO = 'EE-Apps/ws-eeditor.accounts';
const COOKIE_NAME = 'ee_auth';
const COOKIE_EXPIRES_DAYS = 30;

class AuthManager {
    constructor() {
        console.log('🔄 Инициализация AuthManager...');
        this.currentUser = null;
        this.loadUserData();
    }

    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
        console.log('🍪 Cookie обновлены');
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        console.log('🗑️ Cookie удалены');
    }

    async loadUserData() {
        console.log('🔄 Загрузка данных пользователя...');
        try {
            // Пробуем загрузить из Cookie
            const cookieData = this.getCookie(COOKIE_NAME);
            if (cookieData) {
                console.log('🍪 Найдены данные в Cookie');
                try {
                    this.currentUser = JSON.parse(cookieData);
                    console.log('✅ Данные из Cookie успешно загружены');
                    this.updateUI();
                    return;
                } catch (e) {
                    console.error('❌ Ошибка парсинга Cookie:', e);
                }
            }

            // Если нет в Cookie, пробуем из localStorage
            console.log('🔍 Поиск данных в localStorage...');
            const localData = localStorage.getItem('userData');
            if (localData) {
                console.log('💾 Найдены данные в localStorage');
                try {
                    this.currentUser = JSON.parse(localData);
                    console.log('✅ Данные из localStorage успешно загружены');
                    // Восстанавливаем Cookie из localStorage
                    this.setCookie(COOKIE_NAME, localData, COOKIE_EXPIRES_DAYS);
                    this.updateUI();
                    return;
                } catch (e) {
                    console.error('❌ Ошибка парсинга localStorage:', e);
                }
            }

            console.log('ℹ️ Пользователь не авторизован');
            this.updateUI();
        } catch (error) {
            console.error('❌ Ошибка при загрузке данных пользователя:', error);
            this.logout();
        }
    }

    async saveUserData(userData) {
        try {
            const encryptedData = await window.cryptoManager.encrypt(userData);
            
            // Сохраняем в Cookie
            this.setCookie(COOKIE_NAME, encryptedData, COOKIE_EXPIRES_DAYS);
            
            // Сохраняем в localStorage как резервную копию
            localStorage.setItem('userData', encryptedData);
            
            this.currentUser = userData;
            this.updateUI();
        } catch (error) {
            console.error('Ошибка при сохранении данных пользователя:', error);
        }
    }

    async saveUserToGithub(userData) {
        const filename = `users/${userData.id}.json`;
        const encryptedData = await window.cryptoManager.encrypt(userData);
        
        try {
            const githubToken = await getGithubToken();
            if (!githubToken) throw new Error('Не удалось получить токен GitHub');

            const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filename}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${githubToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Update user data for ${userData.username}`,
                    content: btoa(encryptedData),
                    branch: 'main'
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save user data to GitHub');
            }
        } catch (error) {
            console.error('Ошибка сохранения данных в GitHub:', error);
        }
    }

    loginWithDiscord() {
        console.log('🔄 Начало авторизации через Discord...');
        const params = new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            redirect_uri: DISCORD_REDIRECT_URI,
            response_type: 'token',
            scope: 'identify'
        });

        window.location.href = `https://discord.com/api/oauth2/authorize?${params}`;
    }

    async handleDiscordCallback() {
        const fragment = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = fragment.get('access_token');

        if (accessToken) {
            try {
                const response = await fetch('https://discord.com/api/users/@me', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const data = await response.json();
                const userData = {
                    id: data.id,
                    username: data.username,
                    displayName: data.global_name || data.username,
                    avatar: `https://cdn.discord.com/avatars/${data.id}/${data.avatar}.png`,
                    accessToken: await window.cryptoManager.encrypt(accessToken)
                };

                await this.saveUserToGithub(userData);
                await this.saveUserData(userData);
                window.location.href = '/';
            } catch (error) {
                console.error('Ошибка при авторизации через Discord:', error);
            }
        }
    }

    logout() {
        console.log('🔄 Выход из аккаунта...');
        this.deleteCookie(COOKIE_NAME);
        localStorage.removeItem('userData');
        console.log('💾 Данные удалены из localStorage');
        this.currentUser = null;
        console.log('✅ Выход выполнен успешно');
        this.updateUI();
    }

    updateUI() {
        console.log('🔄 Обновление интерфейса...');
        const accountName = document.querySelector('.account-name');
        const accountId = document.querySelector('.account-id');
        const accountAvatar = document.querySelector('.account-avatar');
        const loginItem = document.querySelector('[data-action="login"]');
        const registerItem = document.querySelector('[data-action="register"]');
        const logoutItem = document.querySelector('[data-action="logout"]');

        if (this.currentUser) {
            accountName.textContent = this.currentUser.displayName;
            accountId.textContent = `@${this.currentUser.username}`;
            if (accountAvatar) {
                accountAvatar.src = this.currentUser.avatar;
                accountAvatar.style.display = 'block';
            }
            loginItem.style.display = 'none';
            registerItem.style.display = 'none';
            logoutItem.style.display = 'flex';
            console.log('✅ Интерфейс обновлен для авторизованного пользователя');
        } else {
            accountName.textContent = 'Гость';
            accountId.textContent = '#0000';
            if (accountAvatar) {
                accountAvatar.src = '';
                accountAvatar.style.display = 'none';
            }
            loginItem.style.display = 'flex';
            registerItem.style.display = 'flex';
            logoutItem.style.display = 'none';
            console.log('✅ Интерфейс обновлен для гостя');
        }
    }
}

window.authManager = new AuthManager();

// Проверяем, находимся ли мы на странице callback
if (window.location.pathname === '/auth/discord/callback') {
    window.authManager.handleDiscordCallback();
} 