document.addEventListener('DOMContentLoaded', () => {
    // Инициализация переменных
    const navButtons = document.querySelectorAll('.nav-button[data-page]');
    const navLinks = document.querySelectorAll('.docs-nav a');
    const searchInput = document.getElementById('docs-search');
    const pages = document.querySelectorAll('.page');
    let searchTimeout;

    // Функция для переключения страниц
    function switchPage(pageId) {
        // Убираем активный класс у всех кнопок
        navButtons.forEach(btn => {
            if (!btn.getAttribute('onclick')) {
                btn.classList.remove('active');
            }
        });

        // Добавляем активный класс нужной кнопке
        const activeButton = document.querySelector(`[data-page="${pageId}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Скрываем все страницы
        pages.forEach(page => {
            page.classList.remove('active');
        });

        // Показываем нужную страницу
        const activePage = document.getElementById(pageId);
        if (activePage) {
            activePage.classList.add('active');
        }

        // Показываем соответствующий раздел в боковой навигации
        document.querySelectorAll('.nav-section').forEach(section => {
            const sectionId = section.getAttribute('data-section');
            section.style.display = sectionId === pageId ? 'block' : 'none';
        });

        // Сохраняем активную страницу в localStorage
        localStorage.setItem('activeDocPage', pageId);

        // Прокручиваем страницу вверх
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Обработчики для кнопок навигации
    navButtons.forEach(button => {
        if (button.getAttribute('onclick')) return; // Пропускаем кнопку "Домой"
        
        button.addEventListener('click', () => {
            const pageId = button.getAttribute('data-page');
            if (!pageId) {
                console.error('Missing data-page attribute');
                return;
            }
            switchPage(pageId);
        });
    });

    // Обработчики для боковой навигации
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const section = link.closest('.nav-section');
            if (!section) return;

            // Убираем активный класс у всех ссылок в текущей секции
            section.querySelectorAll('a').forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Получаем якорь и скроллим к нему
            const anchor = link.getAttribute('href')?.substring(1);
            if (!anchor) return;

            const sectionId = section.getAttribute('data-section');
            if (!sectionId) return;

            const targetElement = document.querySelector(`#${sectionId} .docs-content`);
            if (!targetElement) return;

            // Находим заголовок и скроллим к нему
            const heading = targetElement.querySelector(`#${anchor}`);
            if (heading) {
                heading.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });

                // Добавляем якорь в URL
                history.pushState(null, '', `#${anchor}`);
            }
        });
    });

    // Функция поиска
    function searchInContent(searchText) {
        const contents = document.querySelectorAll('.docs-content');
        let hasResults = false;

        contents.forEach(content => {
            if (!searchText) {
                // Убираем подсветку при пустом поиске
                content.innerHTML = content.innerHTML.replace(/<mark class="search-highlight">(.*?)<\/mark>/g, '$1');
                return;
            }

            const html = content.innerHTML;
            try {
                const regex = new RegExp(searchText, 'gi');
                const newHtml = html.replace(regex, match => {
                    hasResults = true;
                    return `<mark class="search-highlight">${match}</mark>`;
                });
                content.innerHTML = newHtml;
            } catch (e) {
                console.error('Invalid regex:', e);
                // Если регулярное выражение некорректно, ищем как обычный текст
                const safeRegex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                const newHtml = html.replace(safeRegex, match => {
                    hasResults = true;
                    return `<mark class="search-highlight">${match}</mark>`;
                });
                content.innerHTML = newHtml;
            }
        });

        // Если есть результаты, прокручиваем к первому
        if (hasResults) {
            const firstResult = document.querySelector('.search-highlight');
            if (firstResult) {
                firstResult.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }

        return hasResults;
    }

    // Обработчик поиска
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const searchText = e.target.value.trim();
                const hasResults = searchInContent(searchText);

                // Показываем/скрываем сообщение о результатах
                let resultsMessage = document.getElementById('search-results-message');
                if (!resultsMessage) {
                    resultsMessage = document.createElement('div');
                    resultsMessage.id = 'search-results-message';
                    resultsMessage.className = 'search-results-message';
                    searchInput.parentNode.appendChild(resultsMessage);
                }

                if (searchText && !hasResults) {
                    resultsMessage.textContent = 'Ничего не найдено';
                    resultsMessage.style.display = 'block';
                } else {
                    resultsMessage.style.display = 'none';
                }
            }, 300);
        });

        // Добавляем обработчик клавиши Escape
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                searchInContent('');
                searchInput.blur();
            }
        });
    }

    // Обработка якорей при загрузке страницы
    function handleInitialHash() {
        const hash = window.location.hash;
        if (hash) {
            const targetElement = document.querySelector(hash);
            if (targetElement) {
                setTimeout(() => {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            }
        }
    }

    // Восстанавливаем активную страницу при загрузке
    const savedPage = localStorage.getItem('activeDocPage');
    if (savedPage) {
        switchPage(savedPage);
    }

    // Обрабатываем начальный якорь
    handleInitialHash();

    // Обработка изменения хэша в URL
    window.addEventListener('hashchange', handleInitialHash);
});