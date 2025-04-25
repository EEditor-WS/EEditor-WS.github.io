class HelloScreen {
    constructor() {
        this.translations = {
            en: {
                title: "Terms of Use",
                accept: "I Accept",
                decline: "Decline",
                choose_language: "Choose Language",
                terms: `Terms of Use and Disclaimer

1. Acceptance of Terms
By accessing and using this software (website or application), you accept and agree to be bound by these Terms of Use.

2. Disclaimer of Liability
2.1. The software and its content are provided "as is" and "as available" without any warranties of any kind.
2.2. The software owner bears no responsibility for:
   - Any damages or losses resulting from the use of this software
   - The accuracy, completeness, or reliability of the content
   - Any modifications made to scenarios or game files
   - Any consequences of using the created or modified content
   - Any violations of third-party rights
   - Any technical issues or service interruptions

3. User Responsibilities
3.1. Users are solely responsible for:
   - All actions performed while using the software
   - Content they create, modify, or download
   - Compliance with applicable laws and regulations
   - Backing up their data and content

4. Intellectual Property
4.1. Users retain ownership of their created content
4.2. The software owner is not responsible for any intellectual property disputes

5. Limitation of Liability
5.1. Under no circumstances shall the software owner be liable for any direct, indirect, incidental, special, or consequential damages.
5.2. The software owner is not liable for any loss of data, profits, or other losses.

6. Changes to Terms
The software owner reserves the right to modify these terms at any time without notice.

By clicking "I Accept", you acknowledge that you have read and understood these terms and agree to be bound by them.`,
                login_title: "Join Our Community",
                login_message: "Sign in with Discord to unlock additional features (coming soon):",
                login_features: [
                    { text: "Access to the library of countries", disabled: true },
                    { text: "Access to the library of reforms", disabled: true },
                    { text: "Access to the library of events", disabled: true },
                    { text: "Ability to share your creations", disabled: true },
                    { text: "Sync between devices", disabled: true }
                ],
                coming_soon: "Coming soon",
                login_button: "Sign in with Discord",
                login_skip: "Skip for now",
                login_note: "You can sign in later at any time"
            },
            ru: {
                title: "Условия использования",
                accept: "Принимаю",
                decline: "Отклонить",
                choose_language: "Выберите язык",
                terms: `Условия использования и отказ от ответственности

1. Принятие условий
Получая доступ к этому программному обеспечению (веб-сайт или приложение) и используя его, вы принимаете и соглашаетесь соблюдать настоящие Условия использования.

2. Отказ от ответственности
2.1. Программное обеспечение и его содержимое предоставляются "как есть" и "как доступно" без каких-либо гарантий.
2.2. Владелец программного обеспечения не несёт ответственности за:
   - Любой ущерб или потери, возникшие в результате использования этого программного обеспечения
   - Точность, полноту или достоверность контента
   - Любые модификации сценариев или игровых файлов
   - Любые последствия использования созданного или модифицированного контента
   - Любые нарушения прав третьих лиц
   - Любые технические проблемы или перерывы в обслуживании

3. Ответственность пользователя
3.1. Пользователи несут полную ответственность за:
   - Все действия, выполняемые при использовании программного обеспечения
   - Контент, который они создают, модифицируют или скачивают
   - Соблюдение применимых законов и правил
   - Резервное копирование своих данных и контента

4. Интеллектуальная собственность
4.1. Пользователи сохраняют права на созданный ими контент
4.2. Владелец программного обеспечения не несёт ответственности за любые споры об интеллектуальной собственности

5. Ограничение ответственности
5.1. Ни при каких обстоятельствах владелец программного обеспечения не несёт ответственности за любые прямые, косвенные, случайные, особые или последующие убытки.
5.2. Владелец программного обеспечения не несёт ответственности за любую потерю данных, прибыли или другие потери.

6. Изменения в условиях
Владелец программного обеспечения оставляет за собой право изменять эти условия в любое время без уведомления.

Нажимая "Принимаю", вы подтверждаете, что прочитали и поняли эти условия и соглашаетесь их соблюдать.`,
                login_title: "Присоединяйтесь к сообществу",
                login_message: "Войдите через Discord, чтобы получить дополнительные возможности (скоро):",
                login_features: [
                    { text: "Доступ к библиотеке стран", disabled: true },
                    { text: "Доступ к библиотеке реформ", disabled: true },
                    { text: "Доступ к библиотеке событий", disabled: true },
                    { text: "Возможность делиться своими работами", disabled: true },
                    { text: "Синхронизация между устройствами", disabled: true }
                ],
                coming_soon: "Скоро будет доступно",
                login_button: "Войти через Discord",
                login_skip: "Пропустить",
                login_note: "Вы сможете войти позже в любое время"
            },
            uk: {
                title: "Умови використання",
                accept: "Приймаю",
                decline: "Відхилити",
                choose_language: "Оберіть мову",
                terms: `Умови використання та відмова від відповідальності

1. Прийняття умов
Отримуючи доступ до цього програмного забезпечення (веб-сайт або додаток) та використовуючи його, ви приймаєте та погоджуєтесь дотримуватися цих Умов використання.

2. Відмова від відповідальності
2.1. Програмне забезпечення та його вміст надаються "як є" та "як доступно" без будь-яких гарантій.
2.2. Власник програмного забезпечення не несе відповідальності за:
   - Будь-які збитки або втрати, що виникли в результаті використання цього програмного забезпечення
   - Точність, повноту або достовірність контенту
   - Будь-які модифікації сценаріїв або ігрових файлів
   - Будь-які наслідки використання створеного або модифікованого контенту
   - Будь-які порушення прав третіх осіб
   - Будь-які технічні проблеми або перерви в обслуговуванні

3. Відповідальність користувача
3.1. Користувачі несуть повну відповідальність за:
   - Всі дії, що виконуються при використанні програмного забезпечення
   - Контент, який вони створюють, модифікують або завантажують
   - Дотримання застосовних законів та правил
   - Резервне копіювання своїх даних та контенту

4. Інтелектуальна власність
4.1. Користувачі зберігають права на створений ними контент
4.2. Власник програмного забезпечення не несе відповідальності за будь-які суперечки щодо інтелектуальної власності

5. Обмеження відповідальності
5.1. За жодних обставин власник програмного забезпечення не несе відповідальності за будь-які прямі, непрямі, випадкові, особливі або подальші збитки.
5.2. Власник програмного забезпечення не несе відповідальності за будь-яку втрату даних, прибутку або інші втрати.

6. Зміни в умовах
Власник програмного забезпечення залишає за собою право змінювати ці умови в будь-який час без повідомлення.

Натискаючи "Приймаю", ви підтверджуєте, що прочитали та зрозуміли ці умови та погоджуєтесь їх дотримуватися.`,
                login_title: "Приєднуйтесь до спільноти",
                login_message: "Увійдіть через Discord, щоб отримати додаткові можливості (скоро):",
                login_features: [
                    { text: "Доступ до бібліотеки країн", disabled: true },
                    { text: "Доступ до бібліотеки реформ", disabled: true },
                    { text: "Доступ до бібліотеки подій", disabled: true },
                    { text: "Можливість ділитися своїми роботами", disabled: true },
                    { text: "Синхронізація між пристроями", disabled: true }
                ],
                coming_soon: "Скоро буде доступно",
                login_button: "Увійти через Discord",
                login_skip: "Пропустити",
                login_note: "Ви зможете увійти пізніше в будь-який час"
            }
        };
        
        this.currentLang = localStorage.getItem('selectedLanguage') || 'ru';
        this.checkAndShow();
    }

    checkAndShow() {
        const hasAccepted = localStorage.getItem('termsAccepted') || document.cookie.includes('termsAccepted=true');
        if (!hasAccepted) {
            this.showTerms();
        }
    }

    createStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .hello-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                z-index: 10000;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .hello-container {
                background: #242424;
                border-radius: 8px;
                padding: 20px;
                width: 80%;
                max-width: 800px;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .hello-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 10px;
                border-bottom: 1px solid #333;
            }

            .hello-title {
                font-size: 24px;
                color: #e0e0e0;
                margin: 0;
            }

            .hello-lang-select {
                padding: 8px;
                background: #333;
                border: 1px solid #444;
                border-radius: 4px;
                color: #e0e0e0;
                cursor: pointer;
            }

            .hello-content {
                overflow-y: auto;
                padding: 10px;
                background: #1a1a1a;
                border-radius: 4px;
                white-space: pre-wrap;
                color: #e0e0e0;
                font-size: 14px;
                line-height: 1.6;
            }

            .hello-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }

            .hello-button {
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }

            .hello-accept {
                background: #2ecc71;
                color: white;
            }

            .hello-accept:hover {
                background: #27ae60;
            }

            .hello-decline {
                background: #e74c3c;
                color: white;
            }

            .hello-decline:hover {
                background: #c0392b;
            }

            .hello-features {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .hello-features li {
                padding: 8px 0;
                color: #e0e0e0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .hello-features li::before {
                content: "✓";
                color: #2ecc71;
                font-weight: bold;
            }

            .hello-login-button {
                background: #5865F2;
                color: white;
                padding: 12px 24px;
                border: none;
                border-radius: 4px;
                font-size: 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                margin: 20px 0;
                transition: background 0.2s;
            }

            .hello-login-button:hover {
                background: #4752C4;
            }

            .hello-login-skip {
                color: #888;
                text-align: center;
                font-size: 14px;
                cursor: pointer;
                text-decoration: underline;
            }

            .hello-login-note {
                color: #888;
                text-align: center;
                font-size: 12px;
                margin-top: 10px;
            }

            .hello-features li.disabled {
                color: #888;
                text-decoration: line-through;
            }
            .hello-features li .coming-soon {
                color: #666;
                font-size: 0.8em;
                margin-left: 8px;
                text-decoration: none;
            }
        `;
        document.head.appendChild(style);
    }

    showTerms() {
        this.createStyles();

        const overlay = document.createElement('div');
        overlay.className = 'hello-overlay';

        const container = document.createElement('div');
        container.className = 'hello-container';

        const header = document.createElement('div');
        header.className = 'hello-header';

        const title = document.createElement('h2');
        title.className = 'hello-title';
        title.textContent = this.translations[this.currentLang].title;

        const langSelect = document.createElement('select');
        langSelect.className = 'hello-lang-select';
        const languages = [
            { code: 'en', name: 'English' },
            { code: 'ru', name: 'Русский' },
            { code: 'uk', name: 'Українська' }
        ];

        languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.code;
            option.textContent = lang.name;
            option.selected = lang.code === this.currentLang;
            langSelect.appendChild(option);
        });

        langSelect.addEventListener('change', (e) => {
            this.currentLang = e.target.value;
            title.textContent = this.translations[this.currentLang].title;
            content.textContent = this.translations[this.currentLang].terms;
            acceptBtn.textContent = this.translations[this.currentLang].accept;
            declineBtn.textContent = this.translations[this.currentLang].decline;
        });

        const content = document.createElement('div');
        content.className = 'hello-content';
        content.textContent = this.translations[this.currentLang].terms;

        const actions = document.createElement('div');
        actions.className = 'hello-actions';

        const acceptBtn = document.createElement('button');
        acceptBtn.className = 'hello-button hello-accept';
        acceptBtn.textContent = this.translations[this.currentLang].accept;
        acceptBtn.onclick = () => {
            localStorage.setItem('termsAccepted', 'true');
            localStorage.setItem('selectedLanguage', this.currentLang);
            document.cookie = 'termsAccepted=true;path=/;max-age=31536000';
            overlay.remove();
            this.showLoginPrompt();
        };

        const declineBtn = document.createElement('button');
        declineBtn.className = 'hello-button hello-decline';
        declineBtn.textContent = this.translations[this.currentLang].decline;
        declineBtn.onclick = () => {
            window.location.href = 'about:blank';
        };

        header.appendChild(title);
        header.appendChild(langSelect);
        actions.appendChild(declineBtn);
        actions.appendChild(acceptBtn);

        container.appendChild(header);
        container.appendChild(content);
        container.appendChild(actions);
        overlay.appendChild(container);

        document.body.appendChild(overlay);
    }

    showLoginPrompt() {
        const overlay = document.createElement('div');
        overlay.className = 'hello-overlay';

        const container = document.createElement('div');
        container.className = 'hello-container';

        const header = document.createElement('div');
        header.className = 'hello-header';

        const title = document.createElement('h2');
        title.className = 'hello-title';
        title.textContent = this.translations[this.currentLang].login_title;

        const content = document.createElement('div');
        content.className = 'hello-content';

        const message = document.createElement('p');
        message.textContent = this.translations[this.currentLang].login_message;

        const featuresList = document.createElement('ul');
        featuresList.className = 'hello-features';

        this.translations[this.currentLang].login_features.forEach(feature => {
            const li = document.createElement('li');
            if (feature.disabled) {
                li.className = 'disabled';
                li.innerHTML = `${feature.text} <span class="coming-soon">(${this.translations[this.currentLang].coming_soon})</span>`;
            } else {
                li.textContent = feature.text;
            }
            featuresList.appendChild(li);
        });

        const loginButton = document.createElement('button');
        loginButton.className = 'hello-login-button';
        loginButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.2 4.8H4.8C3.36 4.8 2.4 5.76 2.4 7.2V16.8C2.4 18.24 3.36 19.2 4.8 19.2H19.2C20.64 19.2 21.6 18.24 21.6 16.8V7.2C21.6 5.76 20.64 4.8 19.2 4.8ZM14.4 15.6C13.44 15.6 12.72 15.12 12.48 14.4C12.24 15.12 11.52 15.6 10.56 15.6C9.12 15.6 8.4 14.4 8.4 13.2V10.8H9.6V13.2C9.6 13.92 9.84 14.4 10.56 14.4C11.28 14.4 11.52 13.92 11.52 13.2V10.8H12.72V13.2C12.72 13.92 12.96 14.4 13.68 14.4C14.4 14.4 14.64 13.92 14.64 13.2V10.8H15.84V13.2C15.6 14.4 14.88 15.6 14.4 15.6Z" fill="white"/>
            </svg>
            ${this.translations[this.currentLang].login_button}
        `;
        loginButton.onclick = () => {
            if (window.authManager) {
                window.authManager.loginWithDiscord();
            }
        };

        const skipButton = document.createElement('div');
        skipButton.className = 'hello-login-skip';
        skipButton.textContent = this.translations[this.currentLang].login_skip;
        skipButton.onclick = () => {
            overlay.remove();
            window.location.reload();
        };

        const note = document.createElement('div');
        note.className = 'hello-login-note';
        note.textContent = this.translations[this.currentLang].login_note;

        header.appendChild(title);
        content.appendChild(message);
        content.appendChild(featuresList);
        content.appendChild(loginButton);
        content.appendChild(skipButton);
        content.appendChild(note);

        container.appendChild(header);
        container.appendChild(content);
        overlay.appendChild(container);

        document.body.appendChild(overlay);
    }
}

// Создаем экземпляр при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.helloScreen = new HelloScreen();
});