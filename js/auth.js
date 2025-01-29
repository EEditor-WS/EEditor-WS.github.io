const DISCORD_CLIENT_ID = '1333948751919972434';
const DISCORD_REDIRECT_URI = window.location.origin + '/auth/discord/callback';
const GITHUB_REPO = 'EE-Apps/ws-eeditor.accounts';
const COOKIE_NAME = 'ee_auth';
const COOKIE_EXPIRES_DAYS = 30;

class AuthManager {
    constructor() {
        console.log('🔄 Инициализация AuthManager...');
        this.currentUser = null;
        this.translations = {
            en: {
                guest: 'Guest',
                login: 'Login with Discord',
                register: 'Register',
                settings: 'Settings',
                logout: 'Logout'
            },
            ru: {
                guest: 'Гость',
                login: 'Войти через Discord',
                register: 'Регистрация',
                settings: 'Настройки',
                logout: 'Выйти'
            },
            uk: {
                guest: 'Гість',
                login: 'Увійти через Discord',
                register: 'Реєстрація',
                settings: 'Налаштування',
                logout: 'Вийти'
            }
        };
        
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

            // Обновляем переводы при смене языка
            document.addEventListener('languageChanged', (event) => {
                console.log('🌐 Смена языка:', event.detail.language);
                this.updateUI();
            });
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
        console.log('🔄 Обработка callback Discord...');
        const fragment = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = fragment.get('access_token');
        const error = fragment.get('error');
        const errorDescription = fragment.get('error_description');

        if (error) {
            console.error('❌ Ошибка авторизации Discord:', errorDescription);
            return;
        }

        if (!accessToken) {
            console.error('❌ Токен доступа не найден');
            return;
        }

        try {
            console.log('🔑 Получен токен доступа, запрашиваем данные пользователя...');
            const response = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`Ошибка получения данных: ${response.status}`);
            }

            const data = await response.json();
            console.log('👤 Получены данные пользователя Discord:', data);

            const userData = {
                id: data.id,
                username: data.username,
                displayName: data.global_name || data.username,
                avatar: data.avatar ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png` : null
            };

            // Сохраняем данные
            localStorage.setItem('userData', JSON.stringify(userData));
            console.log('✅ Данные пользователя сохранены:', userData);

            // Перенаправляем на главную
            window.location.href = '/';
        } catch (error) {
            console.error('❌ Ошибка при получении данных пользователя:', error);
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
        const accountButtonAvatar = document.querySelector('.account-button-avatar');
        const accountButtonIcon = document.querySelector('.account-button-icon');
        const loginItem = document.querySelector('[data-action="login"]');
        const registerItem = document.querySelector('[data-action="register"]');
        const logoutItem = document.querySelector('[data-action="logout"]');

        // Если нет основных элементов интерфейса, просто выходим
        if (!accountName || !accountId) {
            console.log('ℹ️ Элементы интерфейса отсутствуют на этой странице');
            return;
        }

        console.log('🔄 Обновление интерфейса...');

        // Получаем текущий язык
        const currentLang = document.body.getAttribute('data-lang') || 'ru';
        console.log('🌐 Текущий язык:', currentLang);

        if (this.currentUser) {
            console.log('👤 Обновление данных пользователя:', {
                name: this.currentUser.displayName,
                avatar: this.currentUser.avatar
            });

            accountName.textContent = this.currentUser.displayName || this.currentUser.username;
            accountId.textContent = `@${this.currentUser.username}`;
            
            // Обновляем аватарку в выпадающем меню
            if (accountAvatar) {
                if (this.currentUser.avatar) {
                    console.log('🖼️ Установка аватарки в меню:', this.currentUser.avatar);
                    accountAvatar.style.display = 'none';
                    accountAvatar.src = this.currentUser.avatar;
                    accountAvatar.onerror = () => {
                        console.error('❌ Ошибка загрузки аватарки в меню');
                        accountAvatar.style.display = 'none';
                        if (accountButtonIcon) accountButtonIcon.style.display = 'block';
                        if (accountButtonAvatar) accountButtonAvatar.style.display = 'none';
                    };
                    accountAvatar.onload = () => {
                        console.log('✅ Аватарка в меню успешно загружена');
                        accountAvatar.style.display = 'block';
                    };
                } else {
                    console.log('ℹ️ Аватарка отсутствует');
                    accountAvatar.style.display = 'none';
                    accountAvatar.src = '';
                }
            }

            // Обновляем аватарку в кнопке
            if (accountButtonAvatar && accountButtonIcon) {
                if (this.currentUser.avatar) {
                    console.log('🖼️ Установка аватарки в кнопке:', this.currentUser.avatar);
                    accountButtonAvatar.style.display = 'none';
                    accountButtonAvatar.src = this.currentUser.avatar;
                    accountButtonAvatar.onerror = () => {
                        console.error('❌ Ошибка загрузки аватарки в кнопке');
                        accountButtonIcon.style.display = 'block';
                        accountButtonAvatar.style.display = 'none';
                    };
                    accountButtonAvatar.onload = () => {
                        console.log('✅ Аватарка в кнопке успешно загружена');
                        accountButtonIcon.style.display = 'none';
                        accountButtonAvatar.style.display = 'block';
                    };
                } else {
                    accountButtonIcon.style.display = 'block';
                    accountButtonAvatar.style.display = 'none';
                    accountButtonAvatar.src = '';
                }
            }

            if (loginItem) loginItem.style.display = 'none';
            if (registerItem) registerItem.style.display = 'none';
            if (logoutItem) {
                logoutItem.style.display = 'flex';
                const logoutText = logoutItem.querySelector('[data-translate="logout"]');
                if (logoutText) {
                    logoutText.textContent = this.translations[currentLang].logout;
                }
            }
            
            console.log('✅ Интерфейс обновлен для авторизованного пользователя');
        } else {
            accountName.textContent = this.translations[currentLang].guest;
            accountId.textContent = '#0000';
            
            // Скрываем аватарку в выпадающем меню
            if (accountAvatar) {
                accountAvatar.style.display = 'none';
                accountAvatar.src = '';
            }

            // Возвращаем иконку в кнопке
            if (accountButtonAvatar && accountButtonIcon) {
                accountButtonIcon.style.display = 'block';
                accountButtonAvatar.style.display = 'none';
                accountButtonAvatar.src = '';
            }

            if (loginItem) {
                loginItem.style.display = 'flex';
                const loginText = loginItem.querySelector('[data-translate="login"]');
                if (loginText) {
                    loginText.textContent = this.translations[currentLang].login;
                }
            }
            if (registerItem) {
                registerItem.style.display = 'flex';
                const registerText = registerItem.querySelector('[data-translate="register"]');
                if (registerText) {
                    registerText.textContent = this.translations[currentLang].register;
                }
            }
            if (logoutItem) logoutItem.style.display = 'none';
            
            console.log('✅ Интерфейс обновлен для гостя');
        }

        // Обновляем текст настроек
        const settingsItem = document.querySelector('[data-action="settings"]');
        if (settingsItem) {
            const settingsText = settingsItem.querySelector('[data-translate="settings"]');
            if (settingsText) {
                settingsText.textContent = this.translations[currentLang].settings;
            }
        }
        
        console.log('✅ Интерфейс обновлен');
    }
}

// Создаем глобальный экземпляр
window.authManager = new AuthManager();

// Проверяем, находимся ли мы на странице callback
if (window.location.pathname === '/auth/discord/callback') {
    window.authManager.handleDiscordCallback();
} 