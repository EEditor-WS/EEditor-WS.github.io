const DISCORD_CLIENT_ID = '1333948751919972434'; // Замените на ваш Client ID
const DISCORD_REDIRECT_URI = window.location.origin + '/auth/discord/callback';
const GITHUB_REPO = 'EE-Apps/ws-eeditor.accounts';
const COOKIE_NAME = 'ee_auth';
const COOKIE_EXPIRES_DAYS = 30;

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.encryptionKey = window.cryptoManager.generateRandomPassword();
        this.loadUserData();
    }

    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }

    async loadUserData() {
        try {
            // Пробуем загрузить из Cookie
            const encryptedData = this.getCookie(COOKIE_NAME);
            if (encryptedData) {
                this.currentUser = await window.cryptoManager.decrypt(encryptedData, this.encryptionKey);
            }

            // Если нет в Cookie, пробуем из localStorage
            if (!this.currentUser) {
                const localData = localStorage.getItem('userData');
                if (localData) {
                    this.currentUser = await window.cryptoManager.decrypt(localData, this.encryptionKey);
                }
            }

            if (this.currentUser) {
                this.updateUI();
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных пользователя:', error);
            this.logout();
        }
    }

    async saveUserData(userData) {
        try {
            const encryptedData = await window.cryptoManager.encrypt(userData, this.encryptionKey);
            
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
        const encryptedData = await window.cryptoManager.encrypt(userData, this.encryptionKey);
        
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
                    accessToken: await window.cryptoManager.encrypt(accessToken, this.encryptionKey)
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
        this.deleteCookie(COOKIE_NAME);
        localStorage.removeItem('userData');
        this.currentUser = null;
        this.encryptionKey = window.cryptoManager.generateRandomPassword();
        this.updateUI();
    }

    updateUI() {
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
        }
    }
}

window.authManager = new AuthManager();

// Проверяем, находимся ли мы на странице callback
if (window.location.pathname === '/auth/discord/callback') {
    window.authManager.handleDiscordCallback();
} 