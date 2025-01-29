const DISCORD_CLIENT_ID = '1333948751919972434';
const DISCORD_REDIRECT_URI = window.location.origin + '/auth/discord/callback';
const GITHUB_REPO = 'EE-Apps/ws-eeditor.accounts';
const COOKIE_NAME = 'ee_auth';
const COOKIE_EXPIRES_DAYS = 30;

class AuthManager {
    constructor() {
        console.log('🔄 Инициализация AuthManager...');
        this.currentUser = null;
        
        // Ждем загрузку DOM перед инициализацией
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('🔄 Инициализация интерфейса...');
        
        // Проверяем, есть ли элементы интерфейса на странице
        const hasInterface = document.querySelector('.account-name') !== null;
        
        if (hasInterface) {
            // Привязываем обработчики событий
            const loginButton = document.querySelector('[data-action="login"]');
            const logoutButton = document.querySelector('[data-action="logout"]');
            
            if (loginButton) {
                loginButton.addEventListener('click', () => this.loginWithDiscord());
            }
            
            if (logoutButton) {
                logoutButton.addEventListener('click', () => this.logout());
            }
        } else {
            console.log('ℹ️ Элементы интерфейса не найдены на этой странице');
        }

        // Загружаем данные пользователя в любом случае
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

    loadUserData() {
        console.log('🔄 Загрузка данных пользователя...');
        try {
            const userData = localStorage.getItem('userData');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                console.log('✅ Данные пользователя загружены:', this.currentUser);
                this.updateUI();
            } else {
                console.log('ℹ️ Пользователь не авторизован');
                this.updateUI();
            }
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
        localStorage.removeItem('userData');
        this.currentUser = null;
        console.log('✅ Выход выполнен успешно');
        this.updateUI();
    }

    updateUI() {
        // Проверяем, есть ли элементы интерфейса на странице
        const accountName = document.querySelector('.account-name');
        const accountId = document.querySelector('.account-id');
        const accountAvatar = document.querySelector('.account-avatar');
        const loginItem = document.querySelector('[data-action="login"]');
        const registerItem = document.querySelector('[data-action="register"]');
        const logoutItem = document.querySelector('[data-action="logout"]');

        // Если нет основных элементов интерфейса, просто выходим
        if (!accountName || !accountId) {
            console.log('ℹ️ Элементы интерфейса отсутствуют на этой странице');
            return;
        }

        console.log('🔄 Обновление интерфейса...');

        if (this.currentUser) {
            accountName.textContent = this.currentUser.displayName || this.currentUser.username;
            accountId.textContent = `@${this.currentUser.username}`;
            
            if (accountAvatar) {
                if (this.currentUser.avatar) {
                    accountAvatar.src = this.currentUser.avatar;
                    accountAvatar.style.display = 'block';
                } else {
                    accountAvatar.style.display = 'none';
                }
            }

            if (loginItem) loginItem.style.display = 'none';
            if (registerItem) registerItem.style.display = 'none';
            if (logoutItem) logoutItem.style.display = 'flex';
            
            console.log('✅ Интерфейс обновлен для авторизованного пользователя');
        } else {
            accountName.textContent = 'Гость';
            accountId.textContent = '#0000';
            
            if (accountAvatar) {
                accountAvatar.style.display = 'none';
            }

            if (loginItem) loginItem.style.display = 'flex';
            if (registerItem) registerItem.style.display = 'flex';
            if (logoutItem) logoutItem.style.display = 'none';
            
            console.log('✅ Интерфейс обновлен для гостя');
        }
    }
}

// Создаем глобальный экземпляр
window.authManager = new AuthManager();

// Проверяем, находимся ли мы на странице callback
if (window.location.pathname === '/auth/discord/callback') {
    window.authManager.handleDiscordCallback();
} 