const DISCORD_CLIENT_ID = '1333948751919972434'; // Замените на ваш Client ID
const DISCORD_REDIRECT_URI = window.location.origin + '/auth/discord/callback';
const GITHUB_REPO = 'EE-Apps/ws-eeditor.accounts';

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.encryptionKey = window.cryptoManager.generateRandomPassword();
        this.loadUserFromLocalStorage();
    }

    async loadUserFromLocalStorage() {
        const encryptedData = localStorage.getItem('userData');
        if (encryptedData) {
            try {
                this.currentUser = await window.cryptoManager.decrypt(encryptedData, this.encryptionKey);
                this.updateUI();
            } catch (error) {
                console.error('Ошибка при расшифровке данных пользователя:', error);
                this.logout();
            }
        }
    }

    async saveUserToLocalStorage(userData) {
        try {
            const encryptedData = await window.cryptoManager.encrypt(userData, this.encryptionKey);
            localStorage.setItem('userData', encryptedData);
            this.currentUser = userData;
            this.updateUI();
        } catch (error) {
            console.error('Ошибка при шифровании данных пользователя:', error);
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
                await this.saveUserToLocalStorage(userData);
                window.location.href = '/';
            } catch (error) {
                console.error('Ошибка при авторизации через Discord:', error);
            }
        }
    }

    logout() {
        localStorage.removeItem('userData');
        this.currentUser = null;
        this.encryptionKey = window.cryptoManager.generateRandomPassword();
        this.updateUI();
    }

    updateUI() {
        const accountName = document.querySelector('.account-name');
        const accountId = document.querySelector('.account-id');
        const loginItem = document.querySelector('[data-action="login"]');
        const registerItem = document.querySelector('[data-action="register"]');
        const logoutItem = document.querySelector('[data-action="logout"]');

        if (this.currentUser) {
            accountName.textContent = this.currentUser.displayName;
            accountId.textContent = `@${this.currentUser.username}`;
            loginItem.style.display = 'none';
            registerItem.style.display = 'none';
            logoutItem.style.display = 'flex';
        } else {
            accountName.textContent = 'Гость';
            accountId.textContent = '#0000';
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