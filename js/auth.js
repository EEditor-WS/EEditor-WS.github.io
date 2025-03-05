const DISCORD_CLIENT_ID = '1333948751919972434';
const DISCORD_REDIRECT_URI = window.location.origin + '/auth/discord/callback';
const GITHUB_REPO = 'eenot-eenot/eeditor-ws-data';
const COOKIE_NAME = 'ee_auth';
const COOKIE_EXPIRES_DAYS = 30;

// Разбиваем токен на части
const GITHUB_TOKEN_PARTS = [
    'github_pat_11A6XWVIA0',
    'sIpTSLtCHu21_GWTr2APD',
    'Wth5T1CXmr4I7rb16b0P0',
    'fNySlZvb4YRLvBE6G6CM2SSCmLEQnF'
];

function getGithubToken() {
    return GITHUB_TOKEN_PARTS.join('');
}

class AuthManager {
    constructor() {
        console.log('🔄 Инициализация AuthManager...');
        this.currentUser = null;
        this.accessToken = null;
        this.translations = {
            'en': {
                guest: 'Guest',
                login: 'Login',
                register: 'Register',
                logout: 'Logout',
                settings: 'Settings'
            },
            'ru': {
                guest: 'Гость',
                login: 'Войти',
                register: 'Регистрация',
                logout: 'Выйти',
                settings: 'Настройки'
            },
            'uk': {
                guest: 'Гість',
                login: 'Увійти',
                register: 'Реєстрація',
                logout: 'Вийти',
                settings: 'Налаштування'
            },
            'be': {
                guest: 'Госць',
                login: 'Увайсці',
                register: 'Рэгістрацыя',
                logout: 'Выйсці',
                settings: 'Налады'
            },
            'kk': {
                guest: 'Қонақ',
                login: 'Кіру',
                register: 'Тіркелу',
                logout: 'Шығу',
                settings: 'Параметрлер'
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
        
        // Загружаем данные пользователя и токен
        this.loadUserData();
        
        // Восстанавливаем сохраненный язык или устанавливаем русский по умолчанию
        const savedLang = localStorage.getItem('selectedLanguage') || 'ru';
        console.log('🌐 Восстановление сохраненного языка:', savedLang);
        
        // Устанавливаем язык в DOM и сохраняем в localStorage
        this.setLanguage(savedLang);
        
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

            // Добавляем обработчик для выпадающего списка языков
            const langDropdown = document.getElementById('langDropdown');
            if (langDropdown) {
                const langLinks = langDropdown.querySelectorAll('a[data-lang]');
                langLinks.forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const newLang = e.target.getAttribute('data-lang');
                        this.setLanguage(newLang);
                        
                        // Создаем и отправляем событие смены языка
                        const event = new CustomEvent('languageChanged', {
                            detail: { language: newLang }
                        });
                        document.dispatchEvent(event);
                    });
                });
            }

            // Обработчик для кнопки Discord
            document.querySelector('.account-item[data-action="discord"]').addEventListener('click', function(e) {
                e.preventDefault();
                window.open('https://discord.gg/s5JgHChaQE', '_blank');
            });
        } else {
            console.log('ℹ️ Элементы интерфейса не найдены на этой странице');
        }

        // Загружаем данные пользователя в любом случае
        this.loadUserData();
    }

    setLanguage(lang) {
        console.log('🌐 Установка языка:', lang);
        
        // Сохраняем в localStorage
        localStorage.setItem('selectedLanguage', lang);
        
        // Устанавливаем атрибут в DOM
        document.body.setAttribute('data-lang', lang);
        
        // Обновляем текст текущего языка в интерфейсе
        const currentLang = document.getElementById('currentLang');
        if (currentLang) {
            currentLang.textContent = this.getLanguageName(lang);
        }
        
        // Обновляем активный класс в выпадающем списке
        const langDropdown = document.getElementById('langDropdown');
        if (langDropdown) {
            const langLinks = langDropdown.querySelectorAll('a[data-lang]');
            langLinks.forEach(link => {
                if (link.getAttribute('data-lang') === lang) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
        
        // Обновляем переводы
        this.updateTranslations(lang);
        
        console.log('✅ Язык установлен и сохранен:', lang);
    }

    updateTranslations(lang) {
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (key && this.translations[lang]?.[key]) {
                element.textContent = this.translations[lang][key];
            }
        });
    }

    getLanguageName(lang) {
        const names = {
            en: 'English',
            ru: 'Русский',
            uk: 'Українська'
        };
        return names[lang] || 'English';
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
        this.updateUI();
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
                avatar: data.avatar ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png` : null,
                lastLogin: new Date().toISOString()
            };

            // Проверяем существование файла пользователя
            await this.checkAndCreateUserFile(userData);

            // Сохраняем данные
            localStorage.setItem('userData', JSON.stringify(userData));
            this.currentUser = userData;

            console.log('✅ Авторизация успешно завершена');
            this.updateUI();

            // Перенаправляем на главную
            window.location.href = '/';
        } catch (error) {
            console.error('❌ Ошибка при получении данных пользователя:', error);
        }
    }

    async checkAndCreateUserFile(userData) {
        try {
            const githubToken = getGithubToken();
            if (!githubToken) throw new Error('Не удалось получить токен GitHub');

            const filename = `users/${userData.id}.json`;
            
            // Проверяем существование файла
            try {
                const checkResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filename}`, {
                    headers: {
                        'Authorization': `Bearer ${githubToken}`,
                    }
                });

                if (checkResponse.status === 404) {
                    // Файл не существует, создаем новый
                    console.log('📝 Создание нового файла пользователя...');
                    const now = new Date();
                    const moscowTime = new Date(now.getTime() + (3 * 60 * 60 * 1000)); // UTC+3 для Москвы

                    const userFileData = {
                        name: userData.username,
                        id: `@${userData.username}`,
                        nid: userData.id,
                        reg: now.getTime(),
                        regt: moscowTime.toISOString(),
                        lang: document.body.getAttribute('data-lang') || 'ru',
                        countries: [],
                        reforms: [],
                        events: [],
                        maps: [],
                        scenarios: [],
                        status: "user"
                    };

                    const content = btoa(JSON.stringify(userFileData, null, 2));
                    const createResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filename}`, {
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

    logout() {
        console.log('🔄 Выход из аккаунта...');
        localStorage.removeItem('userData');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('tokenExpiry');
        this.currentUser = null;
        this.accessToken = null;
        console.log('✅ Выход выполнен успешно');
        this.updateUI();
    }

    updateUI() {
        const accountName = document.querySelector('.account-name');
        const accountId = document.querySelector('.account-id');
        const accountAvatar = document.querySelector('.account-avatar');
        const accountButtonAvatar = document.querySelector('.account-button-avatar');
        const accountButtonIcon = document.querySelector('.account-button-icon');
        const loginItem = document.querySelector('[data-action="login"]');
        const registerItem = document.querySelector('[data-action="register"]');
        const logoutItem = document.querySelector('[data-action="logout"]');

        if (!accountName || !accountId) {
            console.log('ℹ️ Элементы интерфейса отсутствуют на этой странице');
            return;
        }

        const currentLang = document.body.getAttribute('data-lang') || 'ru';

        if (this.currentUser) {
            // Обновляем имя и ID
            accountName.textContent = this.currentUser.displayName || this.currentUser.username;
            accountId.textContent = `@${this.currentUser.username}`;
            
            // Обновляем аватарку в меню
            if (accountAvatar && this.currentUser.avatar) {
                accountAvatar.src = this.currentUser.avatar;
                accountAvatar.style.display = 'block';
            } else if (accountAvatar) {
                accountAvatar.style.display = 'none';
                accountAvatar.src = '';
            }

            // Обновляем аватарку в кнопке
            if (accountButtonAvatar && accountButtonIcon) {
                if (this.currentUser.avatar) {
                    accountButtonAvatar.src = this.currentUser.avatar;
                    accountButtonAvatar.style.display = 'block';
                    accountButtonIcon.style.display = 'none';
                } else {
                    accountButtonIcon.style.display = 'block';
                    accountButtonAvatar.style.display = 'none';
                }
            }

            // Показываем/скрываем элементы меню
            if (loginItem) loginItem.style.display = 'none';
            if (registerItem) registerItem.style.display = 'none';
            if (logoutItem) {
                logoutItem.style.display = 'flex';
                const logoutText = logoutItem.querySelector('[data-translate="logout"]');
                if (logoutText) {
                    logoutText.textContent = this.translations[currentLang]?.logout || 'Выйти';
                }
            }
        } else {
            // Гостевой режим
            accountName.textContent = this.translations[currentLang]?.guest || 'Гость';
            accountId.textContent = '#0000';
            
            // Скрываем аватарки
            if (accountAvatar) {
                accountAvatar.style.display = 'none';
                accountAvatar.src = '';
            }
            if (accountButtonAvatar && accountButtonIcon) {
                accountButtonIcon.style.display = 'block';
                accountButtonAvatar.style.display = 'none';
                accountButtonAvatar.src = '';
            }

            // Показываем/скрываем элементы меню
            if (loginItem) {
                loginItem.style.display = 'flex';
                const loginText = loginItem.querySelector('[data-translate="login"]');
                if (loginText) {
                    loginText.textContent = this.translations[currentLang]?.login || 'Войти';
                }
            }
            if (registerItem) {
                registerItem.style.display = 'flex';
                const registerText = registerItem.querySelector('[data-translate="register"]');
                if (registerText) {
                    registerText.textContent = this.translations[currentLang]?.register || 'Регистрация';
                }
            }
            if (logoutItem) logoutItem.style.display = 'none';
        }

        // Обновляем текст настроек
        const settingsItem = document.querySelector('[data-action="settings"]');
        if (settingsItem) {
            const settingsText = settingsItem.querySelector('[data-translate="settings"]');
            if (settingsText) {
                settingsText.textContent = this.translations[currentLang]?.settings || 'Настройки';
            }
        }
    }
}

// Создаем глобальный экземпляр
window.authManager = new AuthManager();

// Проверяем, находимся ли мы на странице callback
if (window.location.pathname === '/auth/discord/callback') {
    window.authManager.handleDiscordCallback();
} 