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

            const listItem = link.closest('li');
            const sublist = listItem?.querySelector('ul');
            const href = link.getAttribute('href');
            
            // Если это элемент с подкатегориями и клик был на стрелке
            if (sublist && e.target.closest('.collapse-button')) {
                listItem.classList.toggle('collapsed');
                localStorage.setItem(`nav-item-${href}`, listItem.classList.contains('collapsed'));
                return;
            }

            // Для всех ссылок (с подкатегориями или без)
            section.querySelectorAll('a').forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            if (!href || !href.startsWith('#')) return;

            const sectionId = section.getAttribute('data-section');
            if (!sectionId) return;

            // Разворачиваем все родительские категории
            let parent = link.parentElement;
            while (parent && !parent.classList.contains('nav-section')) {
                if (parent.tagName === 'LI' && parent.classList.contains('collapsed')) {
                    parent.classList.remove('collapsed');
                    const parentLink = parent.querySelector('a');
                    if (parentLink) {
                        const parentHref = parentLink.getAttribute('href');
                        localStorage.setItem(`nav-item-${parentHref}`, 'false');
                    }
                }
                parent = parent.parentElement;
            }

            // Находим заголовок и скроллим к нему
            const heading = document.querySelector(href);
            if (heading) {
                heading.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });

                // Добавляем якорь в URL
                history.pushState(null, '', href);
            }
        });
    });

    // Инициализация сворачивания разделов
    const sections = document.querySelectorAll('.nav-section');
    sections.forEach(section => {
        const title = section.querySelector('.nav-section-title');
        if (title) {
            // Восстанавливаем состояние из localStorage
            const sectionId = section.getAttribute('data-section');
            const isCollapsed = localStorage.getItem(`section-${sectionId}-collapsed`) === 'true';
            
            if (isCollapsed) {
                section.classList.add('collapsed');
            }

            // Добавляем обработчик клика на заголовок
            title.addEventListener('click', (e) => {
                section.classList.toggle('collapsed');
                localStorage.setItem(`section-${sectionId}-collapsed`, section.classList.contains('collapsed'));
            });
        }
    });

    // Инициализация состояния подкатегорий
    document.querySelectorAll('.nav-section li').forEach(item => {
        const sublist = item.querySelector('ul');
        const link = item.querySelector('a');

        if (sublist && link) {
            // Создаем кнопку сворачивания
            const collapseButton = document.createElement('button');
            collapseButton.className = 'collapse-button';
            collapseButton.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            `;
            
            // Добавляем кнопку после ссылки
            link.parentNode.insertBefore(collapseButton, link.nextSibling);

            // Добавляем класс collapsed по умолчанию
            item.classList.add('collapsed');

            // Восстанавливаем состояние из localStorage
            const itemId = link.getAttribute('href');
            const isCollapsed = localStorage.getItem(`nav-item-${itemId}`) !== 'false';
            
            if (!isCollapsed) {
                item.classList.remove('collapsed');
            }

            // Обработчик клика по кнопке сворачивания
            collapseButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                item.classList.toggle('collapsed');
                localStorage.setItem(`nav-item-${itemId}`, item.classList.contains('collapsed'));
            });
        }
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

    // Функция для раскрытия родительских категорий при переходе по якорю
    function expandParentCategories(targetElement) {
        let current = targetElement;
        while (current && !current.classList.contains('nav-section')) {
            if (current.tagName === 'LI' && current.classList.contains('collapsed')) {
                current.classList.remove('collapsed');
                const link = current.querySelector('a');
                if (link) {
                    const itemId = link.getAttribute('href');
                    localStorage.setItem(`nav-item-${itemId}`, 'false');
                }
            }
            current = current.parentElement;
        }
    }

    // Обработка кликов по ссылкам в навигации
    document.querySelectorAll('.nav-section a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    expandParentCategories(link.parentElement);
                }
            }
        });
    });
});