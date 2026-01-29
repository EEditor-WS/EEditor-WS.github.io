document.addEventListener('DOMContentLoaded', () => {
    // Обработчики для кнопок навигации
    const navButtons = document.querySelectorAll('.navbtn');
    navButtons.forEach(button => {
        if (button.id == 'openedPage') return; else {
        button.addEventListener('click', function() {
            if (this.getAttribute('id') == 'openedPage') return; else {
            
            // Получаем id страницы из атрибута data-page
            const pageId = this.getAttribute('data-page');
            window.pages.switch(pageId);
            this.classList.add('active');
            }
        })};
    });

    // Обработчики для языкового переключателя
    const langChooser = document.getElementById('currentLangChooser');
    const langDropdown = document.getElementById('langDropdown');
    if (langChooser && langDropdown) {
        langChooser.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('active');
            accountDropdown.classList.remove('active');
        });

        // Обработчики для выбора языка
        const langLinks = langDropdown.querySelectorAll('a[data-lang]');
        langLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = link.getAttribute('data-lang');
                document.body.setAttribute('data-lang', lang);
                localStorage.setItem('selectedLanguage', lang);
                langDropdown.classList.remove('active');
                window.dispatchEvent(new Event('languageChanged'));
            });
        });
    }

    // Обработчики для меню аккаунта
    const accountButton = document.getElementById('account-button');
    const accountDropdown = document.getElementById('accountDropdown');
    if (accountButton && accountDropdown) {
        accountButton.addEventListener('click', (e) => {
            e.stopPropagation();
            accountDropdown.classList.toggle('active');
            langDropdown.classList.remove('active');
        });
    }

    // Закрытие дропдаунов при клике вне их области
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.language-switcher')) {
            langDropdown?.classList.remove('active');
        }
        if (!e.target.closest('#account-button') && !e.target.closest('#accountDropdown')) {
            accountDropdown?.classList.remove('active');
        }
    });

    // Загрузка сохраненного языка
    const savedLang = localStorage.getItem('selectedLanguage') || 'ru';
    document.body.setAttribute('data-lang', savedLang);
    window.dispatchEvent(new Event('languageChanged'));
}); 