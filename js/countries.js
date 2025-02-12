class CountryManager {
    constructor() {
        this.currentCountry = null;
        this.jsonData = null;
        this.undoStack = [];
        this.redoStack = [];
        this.maxStackSize = 50;
        this.isEditing = false;
        
        // Добавляем параметры сортировки и фильтрации
        this.sortColumn = 'name';
        this.sortDirection = 'asc';
        this.filters = {
            color: { operator: null, value: null },
            name: { operator: null, value: '' },
            system_name: { operator: null, value: '' },
            provinces_count: { operator: null, value: '' },
            capital: { operator: null, value: '' },
            groups: []
        };
        
        this.currentFilterColumn = null;
        
        // Сохраняем ссылки на важные элементы
        this.previewContent = document.getElementById('preview-content');
        this.fileInfo = document.getElementById('file-info');
        
        // Проверяем наличие необходимых элементов
        if (!this.previewContent) {
            console.error('Не найден элемент preview-content');
            return;
        }
        if (!this.fileInfo) {
            console.error('Не найден элемент file-info');
            return;
        }
        
        this.init();
    }

    init() {
        // Инициализация обработчиков событий
        this.initEventListeners();
        
        // Инициализация модального окна
        this.initModal();
        
        // Инициализация сортировки
        this.initSortHandlers();
    }

    // Добавляем новый метод для инициализации обработчиков сортировки
    initSortHandlers() {
        const headers = document.querySelectorAll('#countries .list-table th[data-sort]');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const column = header.getAttribute('data-sort');
                if (this.sortColumn === column) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortColumn = column;
                    this.sortDirection = 'asc';
                }
                this.updateCountriesList();
            });
        });
    }

    // Модифицируем метод updateCountriesList
    updateCountriesList() {
        if (!this.jsonData?.lands) return;

        const tbody = document.getElementById('countries-list');
        if (!tbody) return;

        tbody.innerHTML = '';

        // Подсчитываем количество провинций
        const provincesCount = {};
        if (this.jsonData.provinces) {
            for (const province of this.jsonData.provinces) {
                if (province.owner) {
                    provincesCount[province.owner] = (provincesCount[province.owner] || 0) + 1;
                }
            }
        }

        // Создаем массив стран для сортировки и фильтрации
        let countries = Object.entries(this.jsonData.lands)
            .filter(([id]) => id !== 'provinces')
            .map(([id, country]) => ({
                id,
                name: country.name || '',
                group: country.group || '',
                color: country.color || [128, 128, 128],
                provinces: provincesCount[id] || 0,
                capital_name: country.capital_name || '',
                ...country
            }));

        // Применяем фильтры
        countries = countries.filter(country => {
            // Проверяем стандартные фильтры
            for (const [column, filter] of Object.entries(this.filters)) {
                if (column === 'groups') continue; // Пропускаем фильтр групп
                if (!filter.operator || !filter.value) continue;

                let value = country[column];
                if (column === 'color') {
                    const [r, g, b] = country.color;
                    value = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                }

                switch (filter.operator) {
                    case 'contains':
                        if (!String(value).toLowerCase().includes(filter.value.toLowerCase())) return false;
                        break;
                    case 'equals':
                        if (String(value).toLowerCase() !== filter.value.toLowerCase()) return false;
                        break;
                    case 'not_equals':
                        if (String(value).toLowerCase() === filter.value.toLowerCase()) return false;
                        break;
                }
            }

            // Отдельно проверяем фильтр групп
            if (this.filters.groups.length > 0) {
                if (!country.group || !this.filters.groups.includes(country.group)) {
                    return false;
                }
            }

            return true;
        });

        // Сортируем страны если указана колонка сортировки
        if (this.sortColumn) {
            countries.sort((a, b) => {
                let valueA, valueB;
                
                switch (this.sortColumn) {
                    case 'color':
                        valueA = a.color ? a.color[0] + a.color[1] + a.color[2] : 0;
                        valueB = b.color ? b.color[0] + b.color[1] + b.color[2] : 0;
                        break;
                    case 'name':
                        valueA = a.name || '';
                        valueB = b.name || '';
                        break;
                    case 'system_name':
                        valueA = a.id || '';
                        valueB = b.id || '';
                        break;
                    case 'provinces_count':
                        valueA = a.provinces || 0;
                        valueB = b.provinces || 0;
                        break;
                    case 'capital':
                        valueA = a.capital_name || '';
                        valueB = b.capital_name || '';
                        break;
                    case 'group':
                        valueA = a.group || '';
                        valueB = b.group || '';
                        break;
                    default:
                        return 0;
                }

                if (typeof valueA === 'string') {
                    return this.sortDirection === 'asc' 
                        ? valueA.localeCompare(valueB)
                        : valueB.localeCompare(valueA);
                } else {
                    return this.sortDirection === 'asc'
                        ? valueA - valueB
                        : valueB - valueA;
                }
            });
        }

        // Создаем строки таблицы
        countries.forEach(country => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-country-id', country.id);
            tr.style.cursor = 'pointer';
            tr.onclick = (e) => {
                if (!e.target.closest('.context-menu')) {
                    this.openCountry(country.id);
                }
            };
            tr.oncontextmenu = (e) => {
                e.preventDefault();
                const countryId = tr.getAttribute('data-country-id');
                if (!countryId) return;

                // Удаляем старое меню, если оно есть
                const oldMenu = document.querySelector('.context-menu');
                if (oldMenu) {
                    document.body.removeChild(oldMenu);
                }

                // Создаем новое контекстное меню
                const contextMenu = document.createElement('div');
                contextMenu.className = 'context-menu';
                
                // Получаем размеры окна
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;

                // Добавляем пункты меню
                contextMenu.innerHTML = `
                    <div class="context-menu-item" id="duplicate-country-context">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        <span>${window.translator.translate('duplicate')}</span>
                    </div>
                    <div class="context-menu-item delete" id="delete-country-context">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        <span>${window.translator.translate('delete')}</span>
                    </div>
                `;

                document.body.appendChild(contextMenu);

                // Получаем размеры меню
                const menuRect = contextMenu.getBoundingClientRect();
                
                // Позиционируем меню
                let x = e.clientX;
                let y = e.clientY;

                // Проверяем правую границу
                if (x + menuRect.width > windowWidth) {
                    x = windowWidth - menuRect.width;
                }
                
                // Проверяем нижнюю границу
                if (y + menuRect.height > windowHeight) {
                    y = windowHeight - menuRect.height;
                }

                // Устанавливаем позицию меню
                contextMenu.style.position = 'fixed';
                contextMenu.style.left = x + 'px';
                contextMenu.style.top = y + 'px';

                // Добавляем обработчики для пунктов меню
                document.getElementById('duplicate-country-context')?.addEventListener('click', () => {
                    this.copyCurrentCountry(countryId);
                    document.body.removeChild(contextMenu);
                });

                document.getElementById('delete-country-context')?.addEventListener('click', () => {
                    this.deleteCurrentCountry(countryId);
                    document.body.removeChild(contextMenu);
                });

                // Закрываем меню при клике вне его
                const closeMenu = (e) => {
                    if (!contextMenu.contains(e.target)) {
                        document.body.removeChild(contextMenu);
                        document.removeEventListener('click', closeMenu);
                        document.removeEventListener('contextmenu', closeMenu);
                    }
                };

                document.addEventListener('click', closeMenu);
                document.addEventListener('contextmenu', closeMenu);
            };

            // Создаем ячейки таблицы
            const colorCell = document.createElement('td');
            const colorDiv = document.createElement('div');
            colorDiv.className = 'country-color';
            colorDiv.style.backgroundColor = this.colorToRgb(country.color);
            colorCell.appendChild(colorDiv);

            const nameCell = document.createElement('td');
            nameCell.textContent = country.name;

            const sysNameCell = document.createElement('td');
            sysNameCell.textContent = country.id;

            const groupCell = document.createElement('td');
            groupCell.textContent = country.group;

            const provincesCell = document.createElement('td');
            provincesCell.textContent = country.provinces;

            const capitalCell = document.createElement('td');
            capitalCell.textContent = country.capital_name;

            tr.appendChild(colorCell);
            tr.appendChild(nameCell);
            tr.appendChild(sysNameCell);
            tr.appendChild(groupCell);
            tr.appendChild(provincesCell);
            tr.appendChild(capitalCell);

            tbody.appendChild(tr);
        });

        // Обновляем классы заголовков для индикации сортировки
        const headers = document.querySelectorAll('#countries .list-table th[data-sort]');
        headers.forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
            if (header.getAttribute('data-sort') === this.sortColumn) {
                header.classList.add(`sort-${this.sortDirection}`);
            }
        });
    }

    initEventListeners() {
        // Обработчик добавления новой страны
        document.getElementById('add-country')?.addEventListener('click', () => this.createNewCountry());

        // Обработчики действий со страной
        document.getElementById('copy-country')?.addEventListener('click', () => this.copyCurrentCountry());
        document.getElementById('delete-country')?.addEventListener('click', () => this.deleteCurrentCountry());
        document.getElementById('country-reforms')?.addEventListener('click', () => {
            if (!this.currentCountry) {
                console.error('Не выбрана страна');
                return;
            }
            
            if (!window.reformManager) {
                console.error('Менеджер реформ не инициализирован');
                return;
            }

            window.reformManager.jsonData = this.jsonData;
            window.reformManager.openReforms(this.currentCountry);
        });

        // Обработчики формы редактирования
        const form = document.getElementById('country-form');
        if (form) {
            form.addEventListener('change', (e) => this.handleFormChange(e));
            form.addEventListener('submit', (e) => e.preventDefault());
        }

        // Обработчики отношений
        document.querySelectorAll('.add-country-button').forEach(button => {
            const target = button.getAttribute('data-target');
            
            if (target) {
                button.addEventListener('click', (e) => {
                    this.handleAddRelation(e);
                });
            }
        });

        // Делегирование событий для динамических элементов
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('array-item-delete')) {
                this.handleDeleteRelation(e);
            } else if (e.target.classList.contains('relation-edit')) {
                this.showRelationParamsModal(e);
            }
        });

        // Обработчики цвета
        this.initColorHandlers();

        // Обработчик для кнопки случайного цвета страны
        document.getElementById('random-country-color')?.addEventListener('click', () => {
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            
            document.getElementById('country-color-r').value = r;
            document.getElementById('country-color-g').value = g;
            document.getElementById('country-color-b').value = b;
            
            const preview = document.getElementById('country-color-preview');
            if (preview) {
                preview.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
            }
            this.saveChanges();
        });

        // Кнопка возврата к списку стран
        document.getElementById('back-to-countries-list')?.addEventListener('click', () => this.backToCountriesList());

        // Обработчики фильтров
        document.querySelectorAll('.th-filter').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const column = button.closest('th').getAttribute('data-sort');
                
                // Закрываем все модальные окна
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.remove('active');
                });

                // Показываем соответствующее модальное окно
                if (column === 'group') {
                    this.showGroupFilterModal();
                } else {
                    this.currentFilterColumn = column;
                    this.showFilterModal(column);
                }
            });
        });

        // Обработчик кнопки сброса всех фильтров
        document.getElementById('clear-filters')?.addEventListener('click', () => {
            this.clearAllFilters();
        });

        // Обработчики модального окна фильтра
        const filterModal = document.getElementById('filter-modal');
        if (filterModal) {
            filterModal.querySelector('.close-modal')?.addEventListener('click', () => {
                filterModal.classList.remove('active');
            });

            document.getElementById('apply-filter')?.addEventListener('click', () => {
                this.applyFilter();
                filterModal.classList.remove('active');
            });

            document.getElementById('clear-filter')?.addEventListener('click', () => {
                this.clearFilter(this.currentFilterColumn);
                filterModal.classList.remove('active');
            });

            document.getElementById('filter-operator')?.addEventListener('change', () => {
                this.updateFilterValueInput();
            });
        }

        // Обработчик кнопки обновления списка
        document.getElementById('refresh-countries')?.addEventListener('click', () => {
            this.updateCountriesList();
        });

        // Добавляем обработчик контекстного меню для таблицы стран
        const tbody = document.querySelector('.countries-table tbody');
        if (tbody) {
            tbody.addEventListener('contextmenu', (e) => {
                const tr = e.target.closest('tr');
                if (!tr) return;

                e.preventDefault();
                
                const countryId = tr.getAttribute('data-country-id');
                if (!countryId) return;

                // Удаляем старое меню, если оно есть
                const oldMenu = document.querySelector('.context-menu');
                if (oldMenu) {
                    document.body.removeChild(oldMenu);
                }

                // Создаем новое контекстное меню
                const contextMenu = document.createElement('div');
                contextMenu.className = 'context-menu';
                
                // Получаем размеры окна
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;

                // Добавляем пункты меню
                contextMenu.innerHTML = `
                    <div class="context-menu-item" id="duplicate-country-context">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        <span>${window.translator.translate('duplicate')}</span>
                    </div>
                    <div class="context-menu-item delete" id="delete-country-context">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        <span>${window.translator.translate('delete')}</span>
                    </div>
                `;

                document.body.appendChild(contextMenu);

                // Получаем размеры меню
                const menuRect = contextMenu.getBoundingClientRect();
                
                // Позиционируем меню
                let x = e.clientX;
                let y = e.clientY;

                // Проверяем правую границу
                if (x + menuRect.width > windowWidth) {
                    x = windowWidth - menuRect.width;
                }
                
                // Проверяем нижнюю границу
                if (y + menuRect.height > windowHeight) {
                    y = windowHeight - menuRect.height;
                }

                // Устанавливаем позицию меню
                contextMenu.style.position = 'fixed';
                contextMenu.style.left = x + 'px';
                contextMenu.style.top = y + 'px';

                // Добавляем обработчики для пунктов меню
                document.getElementById('duplicate-country-context')?.addEventListener('click', () => {
                    this.copyCurrentCountry(countryId);
                    document.body.removeChild(contextMenu);
                });

                document.getElementById('delete-country-context')?.addEventListener('click', () => {
                    this.deleteCurrentCountry(countryId);
                    document.body.removeChild(contextMenu);
                });

                // Закрываем меню при клике вне его
                const closeMenu = (e) => {
                    if (!contextMenu.contains(e.target)) {
                        document.body.removeChild(contextMenu);
                        document.removeEventListener('click', closeMenu);
                        document.removeEventListener('contextmenu', closeMenu);
                    }
                };

                document.addEventListener('click', closeMenu);
                document.addEventListener('contextmenu', closeMenu);
            });
        }
    }

    initColorHandlers() {
        const colorInputs = ['country-color-r', 'country-color-g', 'country-color-b'].map(id => 
            document.getElementById(id)
        );

        colorInputs.forEach(input => {
            if (!input) return;
            input.addEventListener('input', () => {
                const [r, g, b] = colorInputs.map(input => Math.round(parseFloat(input.value) || 0));
                const preview = document.getElementById('country-color-preview');
                if (preview) {
                    preview.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
                }
                this.saveChanges();
            });
        });
    }

    initModal() {
        const modal = document.getElementById('country-select-modal');
        if (!modal) return;

        // Закрытие модального окна
        modal.querySelector('.close-modal')?.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        // Добавление выбранной страны
        modal.querySelector('#add-selected-country')?.addEventListener('click', () => {
            this.addSelectedCountry();
        });
    }

    createNewCountry() {
        // Если jsonData не существует, создаем новый объект
        if (!this.jsonData) {
            this.jsonData = {
                lands: {},
                provinces: []
            };
        }

        this.pushToUndoStack();

        // Генерируем уникальный ID
        const newId = this.generateUniqueId();

        // Создаем новую страну с дефолтными значениями
        this.jsonData.lands[newId] = {
            name: "New country",
            color: [128, 128, 128, 255],
            capital: 0,
            capital_name: '',
            defeated: false,
            political: '',
            allies: {},
            enemies: {},
            guaranteed: {},
            guaranteed_by: {},
            pacts: {},
            sanctions: {},
            vassals: {}
        };

        // Обновляем список и открываем редактор
        this.updateCountriesList();
        this.openCountry(newId);

        // Обновляем содержимое в редакторе и сохраняем в файл
        if (this.previewContent) {
            console.log('Обновляем содержимое в редакторе и сохраняем в файл');
            const jsonString = JSON.stringify(this.jsonData, null, 4);
            this.previewContent.value = jsonString;
            
            // Сохраняем изменения в файл
            if (typeof window.saveChanges === 'function') {
                window.saveChanges();
            }
        }
        console.log(this.previewContent);
    }

    generateUniqueId() {
        if (!this.jsonData?.lands) return 'civilization_1';
        
        const existingIds = Object.keys(this.jsonData.lands);
        let n = 1;
        while (existingIds.includes(`civilization_${n}`)) {
            n++;
        }
        return `civilization_${n}`;
    }

    copyCurrentCountry(countryId) {
        if (!countryId || !this.jsonData?.lands[countryId]) return;

        const newId = this.generateUniqueId();
        const currentCountry = this.jsonData.lands[countryId];
        
        this.pushToUndoStack();
        this.jsonData.lands[newId] = JSON.parse(JSON.stringify(currentCountry));
        this.jsonData.lands[newId].name += ' (копия)';
        
        this.updateCountriesList();
        this.openCountry(newId);

        // Обновляем JSON в превью и сохраняем
        if (this.previewContent) {
            this.previewContent.value = JSON.stringify(this.jsonData, null, 4);
            if (typeof window.saveChanges === 'function') {
                window.saveChanges();
            }
        }
    }

    deleteCurrentCountry(countryId) {
        if (!countryId || !this.jsonData?.lands[countryId]) {
            console.error('Нет страны для удаления');
            return;
        }

        if (!confirm(window.translator.translate('confirm_delete_country'))) {
            return;
        }

        this.pushToUndoStack();

        // Удаляем страну
        delete this.jsonData.lands[countryId];

        // Обновляем список
        this.updateCountriesList();

        // Обновляем JSON в превью и сохраняем
        if (this.previewContent) {
            this.previewContent.value = JSON.stringify(this.jsonData, null, 4);
            if (typeof window.saveChanges === 'function') {
                window.saveChanges();
            }
        }
    }

    openCountry(countryId) {
        // Проверяем наличие jsonData и создаем его при необходимости
        if (!this.jsonData) {
            this.jsonData = {
                lands: {},
                provinces: []
            };
        }

        // Проверяем наличие страны
        if (!this.jsonData.lands?.[countryId]) return;

        this.currentCountry = countryId;
        const country = this.jsonData.lands[countryId];

        // Обновляем заголовок с галочкой
        if (window.countryUtils && typeof window.countryUtils.updateCountryHeader === 'function') {
            window.countryUtils.updateCountryHeader(country.name);
        }

        this.setFormValues({
            'country-name': country.name,
            'country-group': country.group || '',
            'country-capital': country.capital_name || '',
            'country-capital-id': country.capital || '',
            'country-defeated': country.defeated ? 'true' : 'false',
            'country-political': country.political || ''
        });

        // Устанавливаем цвет
        if (Array.isArray(country.color) && country.color.length >= 3) {
            this.setFormValues({
                'country-color-r': country.color[0],
                'country-color-g': country.color[1],
                'country-color-b': country.color[2]
            });

            const colorPreview = document.getElementById('country-color-preview');
            if (colorPreview) {
                colorPreview.style.backgroundColor = `rgb(${country.color[0]}, ${country.color[1]}, ${country.color[2]})`;
            }
        }

        // Заполняем отношения
        this.populateRelationLists(country);

        // Переключаемся на страницу редактирования
        this.switchToEditPage();
    }

    setFormValues(values) {
        Object.entries(values).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (element.tagName === 'INPUT' || element.tagName === 'SELECT') {
                    element.value = value;
                } else {
                    element.textContent = value;
                }
            }
        });
    }

    populateRelationLists(country) {
        const relations = ['allies', 'enemies', 'guaranteed', 'guaranteed_by', 'pacts', 'sanctions', 'vassals'];
        relations.forEach(relation => {
            const container = document.getElementById(`country-${relation.replace('_', '-')}`);
            if (!container) return;

            // Очищаем контейнер
            container.innerHTML = '';

            // Добавляем существующие отношения
            const items = country[relation];
            if (items) {
                if (Array.isArray(items)) {
                    // Если это массив, создаем пустой объект
                    country[relation] = {};
                } else if (typeof items === 'object') {
                    // Если это объект, добавляем отношения
                    Object.entries(items).forEach(([targetCountry, params]) => {
                        this.addRelationItem(container, targetCountry, params);
                    });
                }
            } else {
                // Если отношения не определены, создаем пустой объект
                country[relation] = {};
            }
        });
    }

    addRelationItem(container, targetCountry, params = {}) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'array-list-item';

        let extraInfo = '';
        if (params.turn !== undefined) {
            extraInfo += `<span class="relation-turn">Ход: ${params.turn}</span>`;
        }
        if (params.duration !== undefined) {
            extraInfo += `<span class="relation-duration">Длительность: ${params.duration}</span>`;
        }
        if (params.initiator !== undefined) {
            extraInfo += `<span class="relation-initiator">Инициатор: ${params.initiator ? 'Да' : 'Нет'}</span>`;
        }

        itemDiv.innerHTML = `
            <div class="relation-info">
                <input type="text" class="array-item-input" value="${targetCountry}"
                    data-turn="${params.turn || 0}"
                    data-duration="${params.duration || ''}"
                    data-initiator="${params.initiator || false}">
                <div class="relation-params">${extraInfo}</div>
            </div>
            <div class="relation-controls">
                <button type="button" class="relation-edit">✎</button>
                <button type="button" class="array-item-delete">×</button>
            </div>
        `;

        container.appendChild(itemDiv);
    }

    handleAddRelation(e) {
        // Находим ближайшую кнопку, если клик был по SVG или line
        const button = e.target.closest('.add-country-button');
        if (!button) return;

        const target = button.getAttribute('data-target');
        
        // Добавляем префикс country- к ID контейнера
        const containerId = `country-${target}`;
        const container = document.getElementById(containerId);
        
        if (!container) {
            console.error('Не найден контейнер для добавления отношений:', containerId);
            return;
        }

        // Проверяем, что текущая страна существует
        if (!this.currentCountry || !this.jsonData?.lands[this.currentCountry]) {
            console.error('Не выбрана текущая страна');
            return;
        }

        this.pushToUndoStack();

        // Создаем элемент
        const itemDiv = document.createElement('div');
        itemDiv.className = 'array-list-item';
        itemDiv.innerHTML = `
            <div class="relation-info">
                <input type="text" class="array-item-input" value=""
                    data-turn="0">
                <div class="relation-params">
                    <span class="relation-turn">Ход: 0</span>
                </div>
            </div>
            <div class="relation-controls">
                <button type="button" class="relation-edit">✎</button>
                <button type="button" class="array-item-delete">×</button>
            </div>
        `;

        container.appendChild(itemDiv);

        // Сразу показываем модальное окно для редактирования
        this.showRelationParamsModal({ target: itemDiv.querySelector('.relation-edit') });
    }

    handleDeleteRelation(e) {
        const item = e.target.closest('.array-list-item');
        if (!item) return;

        this.pushToUndoStack();

        // Получаем тип отношений и ID страны перед удалением
        const relationType = item.closest('.array-list').id.replace('country-', '').replace('-', '_');
        const targetCountryId = item.querySelector('input')?.value;

        // Если это вассал, удаляем поле vassal_of у вассала
        if (relationType === 'vassals' && targetCountryId && this.jsonData?.lands[targetCountryId]) {
            delete this.jsonData.lands[targetCountryId].vassal_of;
        }

        item.remove();
        this.saveChanges();
    }

    showRelationParamsModal(e) {
        const button = e.target;
        const itemDiv = button.closest('.array-list-item');
        const input = itemDiv.querySelector('.array-item-input');
        const relationType = itemDiv.closest('.array-list').id.replace('country-', '');

        const params = {
            turn: parseInt(input.getAttribute('data-turn')) || 0,
            duration: input.getAttribute('data-duration') || '',
            initiator: input.getAttribute('data-initiator') === 'true'
        };

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${window.translator.translate('relation_params')}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>${window.translator.translate('select_country')}</label>
                        <select class="param-country main-page-input">
                            <option value="">${window.translator.translate('select_country_placeholder')}</option>
                            ${this.generateCountryOptions()}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>${window.translator.translate('relation_turn')}</label>
                        <input type="number" class="param-turn main-page-input" value="${params.turn || 0}" min="0">
                    </div>
                    <div class="form-group">
                        <label>${window.translator.translate('relation_duration')}</label>
                        <input type="number" class="param-duration main-page-input" value="${params.duration || ''}" min="0">
                    </div>
                    ${relationType === 'sanctions' ? `
                    <div class="form-group">
                        <label>${window.translator.translate('relation_initiator')}</label>
                        <select class="param-initiator main-page-input">
                            <option value="false" ${!params.initiator ? 'selected' : ''}>${window.translator.translate('no')}</option>
                            <option value="true" ${params.initiator ? 'selected' : ''}>${window.translator.translate('yes')}</option>
                        </select>
                    </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="action-button save-params">
                        <svg viewBox="0 0 24 24">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                            <polyline points="17 21 17 13 7 13 7 21"/>
                            <polyline points="7 3 7 8 15 8"/>
                        </svg>
                        <span>${window.translator.translate('save')}</span>
                    </button>
                    <button class="action-button cancel-params">
                        <svg viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        <span>${window.translator.translate('cancel')}</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Устанавливаем текущую страну в селекте
        const countrySelect = modal.querySelector('.param-country');
        if (countrySelect) {
            countrySelect.value = input.value;
        }

        const closeModal = () => modal.remove();
        modal.querySelector('.close-modal').onclick = closeModal;

        modal.querySelector('.save-params').onclick = () => {
            const selectedCountryId = modal.querySelector('.param-country').value;
            const turn = modal.querySelector('.param-turn').value;
            const duration = modal.querySelector('.param-duration').value;
            const initiator = modal.querySelector('.param-initiator')?.value;

            this.pushToUndoStack();
            
            // Обновляем отношения для текущей страны
            input.value = selectedCountryId;
            input.setAttribute('data-turn', turn);
            if (duration) input.setAttribute('data-duration', duration);
            if (initiator !== undefined) input.setAttribute('data-initiator', initiator);

            const paramsDiv = itemDiv.querySelector('.relation-params');
            paramsDiv.innerHTML = this.formatRelationParams({
                turn: parseInt(turn),
                duration: duration ? parseInt(duration) : undefined,
                initiator: initiator === 'true'
            });

            // Обновляем отношения для выбранной страны
            this.updateReciprocatedRelation(selectedCountryId, relationType, {
                turn: parseInt(turn),
                duration: duration ? parseInt(duration) : undefined,
                initiator: initiator === 'true'
            });

            this.saveChanges();
            closeModal();
        };
    }

    generateCountryOptions() {
        if (!this.jsonData?.lands) return '';
        
        return Object.entries(this.jsonData.lands)
            .filter(([id]) => id !== 'provinces' && id !== this.currentCountry)
            .map(([id, country]) => {
                return `<option value="${id}">${country.name} - ${id}</option>`;
            })
            .join('');
    }

    updateReciprocatedRelation(targetCountryId, relationType, params) {
        if (!this.jsonData?.lands[targetCountryId]) return;

        const reciprocalTypes = {
            allies: 'allies',
            enemies: 'enemies',
            pacts: 'pacts',
            sanctions: 'sanctions',
            guaranteed: 'guaranteed_by',
            guaranteed_by: 'guaranteed'
        };

        // Специальная обработка для вассалов
        if (relationType === 'vassals') {
            // Добавляем только поле vassal_of вассалу
            this.jsonData.lands[targetCountryId].vassal_of = this.currentCountry;
            return; // Выходим, не добавляя взаимные отношения
        }

        const reciprocalType = reciprocalTypes[relationType];
        if (!reciprocalType) return;

        // Обновляем отношения у целевой страны
        const targetCountry = this.jsonData.lands[targetCountryId];
        
        // Проверяем существующие отношения
        if (!targetCountry[reciprocalType]) {
            targetCountry[reciprocalType] = {};
        } else if (Array.isArray(targetCountry[reciprocalType])) {
            targetCountry[reciprocalType] = {};
        }

        const relationParams = { turn: params.turn };
        if (params.duration !== undefined) {
            relationParams.duration = params.duration;
        }
        if (params.initiator !== undefined) {
            relationParams.initiator = !params.initiator; // Инвертируем для второй страны
        }

        targetCountry[reciprocalType][this.currentCountry] = relationParams;
    }

    formatRelationParams(params) {
        let html = '';
        if (params.turn !== undefined) {
            html += `<span class="relation-turn" data-translate="relation_turn_short">Ход</span>: ${params.turn}`;
        }
        if (params.duration !== undefined) {
            html += `<span class="relation-duration" data-translate="relation_duration_short">Длительность</span>: ${params.duration}`;
        }
        if (params.initiator !== undefined) {
            html += `<span class="relation-initiator" data-translate="relation_initiator_short">Инициатор</span>: ${params.initiator ? window.translator.translate('yes') : window.translator.translate('no')}`;
        }
        return html;
    }

    handleFormChange(e) {
        if (this.isEditing) return;
        this.pushToUndoStack();
        this.saveChanges();
    }

    saveChanges() {
        if (!this.currentCountry || !this.jsonData?.lands[this.currentCountry]) return;

        this.isEditing = true;
        try {
            const country = this.jsonData.lands[this.currentCountry];

            // Обновляем основные данные
            country.name = document.getElementById('country-name').value;
            country.group = document.getElementById('country-group').value;
            country.capital_name = document.getElementById('country-capital').value;
            country.capital = parseInt(document.getElementById('country-capital-id').value) || 0;
            country.defeated = document.getElementById('country-defeated').value === 'true';
            country.political = document.getElementById('country-political').value;

            // Обновляем цвет
            const r = parseFloat(document.getElementById('country-color-r').value) || 0;
            const g = parseFloat(document.getElementById('country-color-g').value) || 0;
            const b = parseFloat(document.getElementById('country-color-b').value) || 0;
            country.color = [r, g, b, 255];

            // Обновляем отношения
            this.updateRelations(country);

            // Обновляем JSON и интерфейс
            this.updateJsonAndUI();

            // Обновляем все выпадающие списки стран
            this.updateAllCountryDropdowns();

            // Обновляем содержимое в редакторе и сохраняем в файл
            if (window.previewContent) {
                const jsonString = JSON.stringify(this.jsonData, null, 4);
                window.previewContent.value = jsonString;
                
                // Сохраняем изменения в файл
                if (typeof window.saveChanges === 'function') {
                    window.saveChanges();
                }
            }
        } finally {
            this.isEditing = false;
        }
    }

    updateRelations(country) {
        const relations = ['allies', 'enemies', 'guaranteed', 'guaranteed_by', 'pacts', 'sanctions', 'vassals'];
        relations.forEach(relation => {
            const container = document.getElementById(`country-${relation.replace('_', '-')}`);
            if (!container) return;

            const relationData = {};
            container.querySelectorAll('.array-list-item').forEach(item => {
                const input = item.querySelector('input');
                if (!input?.value.trim()) return;

                const targetCountry = input.value.trim();
                const data = {
                    turn: parseInt(input.getAttribute('data-turn')) || 0
                };

                const duration = input.getAttribute('data-duration');
                if (duration) {
                    data.duration = parseInt(duration);
                }

                const initiator = input.getAttribute('data-initiator');
                if (initiator === 'true') {
                    data.initiator = true;
                }

                relationData[targetCountry] = data;
            });

            // Если нет отношений, устанавливаем пустой объект вместо массива
            country[relation] = Object.keys(relationData).length > 0 ? relationData : {};
        });
    }

    updateJsonAndUI() {
        if (!this.jsonData || !this.previewContent) return;

        this.previewContent.value = JSON.stringify(this.jsonData, null, 4);
        
        const nameHeader = document.getElementById('country-name-header');
        if (nameHeader) {
            nameHeader.textContent = this.jsonData.lands[this.currentCountry].name;
        }

        if (this.fileInfo) {
            this.fileInfo.textContent = 'Изменения не сохранены';
        }

        this.updateCountriesList();
    }

    colorToRgb(colorArray) {
        if (!Array.isArray(colorArray) || colorArray.length < 3) {
            return 'rgb(128, 128, 128)';
        }
        const r = Math.min(255, Math.max(0, Math.round(parseFloat(colorArray[0]) || 0)));
        const g = Math.min(255, Math.max(0, Math.round(parseFloat(colorArray[1]) || 0)));
        const b = Math.min(255, Math.max(0, Math.round(parseFloat(colorArray[2]) || 0)));
        return `rgb(${r}, ${g}, ${b})`;
    }

    switchToEditPage() {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('country-edit')?.classList.add('active');

        document.querySelectorAll('.nav-button').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    switchToCountriesList() {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('countries')?.classList.add('active');

        document.querySelectorAll('.nav-button').forEach(btn => {
            if (btn.getAttribute('data-page') === 'countries') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    pushToUndoStack() {
        if (!this.jsonData) return;
        
        this.undoStack.push(JSON.stringify(this.jsonData));
        if (this.undoStack.length > this.maxStackSize) {
            this.undoStack.shift();
        }
        this.redoStack = [];
    }

    undo() {
        if (this.undoStack.length === 0) return;

        const currentState = JSON.stringify(this.jsonData);
        this.redoStack.push(currentState);

        const previousState = this.undoStack.pop();
        this.jsonData = JSON.parse(previousState);

        this.updateJsonAndUI();
        if (this.currentCountry) {
            this.openCountry(this.currentCountry);
        }
    }

    redo() {
        if (this.redoStack.length === 0) return;

        const currentState = JSON.stringify(this.jsonData);
        this.undoStack.push(currentState);

        const nextState = this.redoStack.pop();
        this.jsonData = JSON.parse(nextState);

        this.updateJsonAndUI();
        if (this.currentCountry) {
            this.openCountry(this.currentCountry);
        }
    }

    removeInvalidOwners() {
        if (!this.jsonData?.provinces || !this.jsonData?.lands) return;

        this.pushToUndoStack();

        let replacedCount = 0;
        let addedCount = 0;
        const validOwners = new Set(Object.keys(this.jsonData.lands));

        // Проходим по всем провинциям
        this.jsonData.provinces.forEach(province => {
            if (province.owner && !validOwners.has(province.owner)) {
                // Заменяем недействительного владельца
                province.owner = 'undeveloped_land';
                replacedCount++;
            } else if (!province.owner && !province.is_water) {
                // Добавляем владельца для сухопутных провинций без владельца
                province.owner = 'undeveloped_land';
                addedCount++;
            }
        });

        if (replacedCount > 0 || addedCount > 0) {
            // Обновляем JSON и интерфейс
            this.updateJsonAndUI();
            
            // Показываем сообщение о результате
            if (this.fileInfo) {
                let message = [];
                if (replacedCount > 0) {
                    message.push(`заменено ${replacedCount} несуществующих владельцев`);
                }
                if (addedCount > 0) {
                    message.push(`добавлен владелец для ${addedCount} провинций`);
                }
                this.fileInfo.textContent = `Результат: ${message.join(', ')}`;
            }
        } else {
            if (this.fileInfo) {
                this.fileInfo.textContent = 'Изменений не требуется';
            }
        }
    }

    updateAllCountryDropdowns() {
        // Обновляем все модальные окна выбора страны
        const countrySelects = document.querySelectorAll('.country-select');
        countrySelects.forEach(select => {
            const currentValue = select.value;
            select.innerHTML = `<option value="" data-translate="choose_country...">Выберите страну...</option>${this.generateCountryOptions()}`;
            select.value = currentValue;
        });

        // Обновляем все существующие поля отношений
        document.querySelectorAll('.array-item-input').forEach(input => {
            const currentValue = input.value;
            const countryData = this.jsonData.lands[currentValue];
            if (countryData) {
                const countryName = countryData.name;
                input.setAttribute('title', `${countryName} - ${currentValue}`);
            }
        });
    }

    backToCountriesList() {
        // Переключаемся на страницу списка стран
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById('countries').classList.add('active');
    }

    showFilterModal(column) {
        const modal = document.getElementById('filter-modal');
        if (!modal) {
            console.error('Модальное окно фильтра не найдено');
            return;
        }

        const title = modal.querySelector('.modal-title');
        const operator = document.getElementById('filter-operator');
        
        if (!title || !operator) {
            console.error('Не найдены необходимые элементы модального окна');
            return;
        }
        
        // Настраиваем заголовок с переводом
        const columnTitle = this.getColumnTitle(column);
        title.textContent = `${this.getColumnTitle('filter')}: ${columnTitle}`;
        
        // Настраиваем доступные операторы в зависимости от типа колонки
        this.setupOperators(column);
        
        // Восстанавливаем текущие настройки фильтра
        const filter = this.filters[column];
        if (filter.operator) {
            operator.value = filter.operator;
        } else {
            operator.selectedIndex = 0;
        }
        
        // Обновляем поле ввода значения
        this.updateFilterValueInput();
        
        // Показываем модальное окно
        modal.classList.add('active');
    }

    setupOperators(column) {
        const operator = document.getElementById('filter-operator');
        if (!operator) return;

        // Очищаем текущие опции
        operator.innerHTML = '';

        // Добавляем нужные опции в зависимости от типа колонки
        const options = [];
        
        switch (column) {
            case 'color':
                options.push(
                    { value: 'equals', text: 'filter_equals' },
                    { value: 'not_equals', text: 'filter_not_equals' }
                );
                break;
            case 'provinces_count':
            case 'system_name':
                options.push(
                    { value: 'equals', text: 'filter_equals' },
                    { value: 'not_equals', text: 'filter_not_equals' },
                    { value: 'greater', text: 'filter_greater' },
                    { value: 'less', text: 'filter_less' },
                    { value: 'greater_equals', text: 'filter_greater_equals' },
                    { value: 'less_equals', text: 'filter_less_equals' },
                    { value: 'contains', text: 'filter_contains' }
                );
                break;
            default:
                options.push(
                    { value: 'contains', text: 'filter_contains' },
                    { value: 'equals', text: 'filter_equals' },
                    { value: 'not_equals', text: 'filter_not_equals' }
                );
        }

        // Добавляем опции в select с переводом
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = this.getColumnTitle(opt.text);
            operator.appendChild(option);
        });
    }

    updateFilterValueInput() {
        const container = document.getElementById('filter-value-container');
        const operator = document.getElementById('filter-operator').value;
        const column = this.currentFilterColumn;
        const currentValue = this.filters[column].value;
        
        container.innerHTML = '';
        
        let input;
        switch (column) {
            case 'color':
                input = document.createElement('input');
                input.type = 'color';
                input.id = 'filter-value';
                input.value = currentValue || '#000000';
                input.title = this.getColumnTitle('filter_color_value');
                break;
            case 'provinces_count':
                input = document.createElement('input');
                input.type = 'number';
                input.id = 'filter-value';
                input.min = '0';
                input.value = currentValue || '';
                input.placeholder = this.getColumnTitle('filter_number_value');
                break;
            default:
                input = document.createElement('input');
                input.type = 'text';
                input.id = 'filter-value';
                input.value = currentValue || '';
                input.placeholder = this.getColumnTitle('filter_text_value');
        }
        
        input.className = 'main-page-input';
        container.appendChild(input);
    }

    applyFilter() {
        const column = this.currentFilterColumn;
        const operator = document.getElementById('filter-operator').value;
        const value = document.getElementById('filter-value').value;
        
        this.filters[column] = { operator, value };
        
        // Добавляем индикатор активного фильтра
        const filterButton = document.querySelector(`th[data-sort="${column}"] .th-filter`);
        if (value) {
            filterButton.classList.add('active');
            if (!filterButton.querySelector('.filter-badge')) {
                const badge = document.createElement('div');
                badge.className = 'filter-badge';
                filterButton.appendChild(badge);
            }
        } else {
            filterButton.classList.remove('active');
            filterButton.querySelector('.filter-badge')?.remove();
        }
        
        this.updateCountriesList();
    }

    clearFilter(column) {
        this.filters[column] = { operator: null, value: null };
        const filterButton = document.querySelector(`th[data-sort="${column}"] .th-filter`);
        filterButton.classList.remove('active');
        filterButton.querySelector('.filter-badge')?.remove();
        this.updateCountriesList();
    }

    clearAllFilters() {
        Object.keys(this.filters).forEach(column => {
            if (column === 'groups') {
                this.filters.groups = [];
            } else {
                this.filters[column] = { operator: null, value: null };
            }
        });
        
        // Очищаем индикаторы фильтров
        document.querySelectorAll('.th-filter').forEach(button => {
            button.classList.remove('active');
            button.querySelector('.filter-badge')?.remove();
        });

        this.updateCountriesList();
    }

    getColumnTitle(column) {
        const titles = {
            color: 'color',
            name: 'name',
            system_name: 'system_name',
            provinces_count: 'provinces_count',
            capital: 'capital',
            group: 'group'
        };
        return window.translator.translate(titles[column] || column);
    }

    // Вспомогательная функция для извлечения числа из ID страны
    extractCivilizationNumber(id) {
        const match = id.match(/civilization_(\d+)/);
        return match ? parseInt(match[1]) : null;
    }

    showGroupFilterModal() {
        console.log('Открытие модального окна фильтра групп стран');
        const modal = document.getElementById('countries-groups-filter-modal');
        if (!modal) {
            console.error('Модальное окно фильтра групп не найдено');
            return;
        }

        const groupsList = document.getElementById('countries-groups-filter-list');
        if (!groupsList) {
            console.error('Список групп не найден');
            return;
        }

        // Получаем все уникальные группы
        const groups = new Set();
        if (!this.jsonData?.lands) {
            console.warn('Нет данных о странах');
            return;
        }

        Object.values(this.jsonData.lands).forEach(country => {
            if (country.group) {
                groups.add(country.group);
            }
        });

        console.log('Найдено групп:', groups.size);

        // Сортируем группы по алфавиту
        const sortedGroups = Array.from(groups).sort();

        // Создаем чекбоксы для каждой группы
        let html = `
            <div class="group-checkbox-item">
                <input type="checkbox" id="country-group-empty" value=""
                       ${this.filters.groups.includes('') ? 'checked' : ''}>
                <label for="country-group-empty" data-translate="empty_group">[Пусто]</label>
            </div>
        `;

        html += sortedGroups.map(group => {
            const isChecked = this.filters.groups.includes(group);
            console.log(`Группа ${group}, выбрана: ${isChecked}`);
            return `
                <div class="group-checkbox-item">
                    <input type="checkbox" id="country-group-${group}" value="${group}"
                           ${isChecked ? 'checked' : ''}>
                    <label for="country-group-${group}">${group}</label>
                </div>
            `;
        }).join('');

        groupsList.innerHTML = html;

        // Обновляем заголовок модального окна
        const title = modal.querySelector('.modal-title');
        if (title) {
            title.setAttribute('data-translate', 'filter_groups');
            title.textContent = this.getColumnTitle('filter_groups');
        }

        // Обработчики кнопок
        const applyButton = modal.querySelector('#countries-groups-filter-apply');
        const clearButton = modal.querySelector('#countries-groups-filter-clear');
        const closeButton = modal.querySelector('.close-modal');

        // Удаляем старые обработчики
        const newApplyButton = applyButton.cloneNode(true);
        const newClearButton = clearButton.cloneNode(true);
        const newCloseButton = closeButton.cloneNode(true);

        applyButton.parentNode.replaceChild(newApplyButton, applyButton);
        clearButton.parentNode.replaceChild(newClearButton, clearButton);
        closeButton.parentNode.replaceChild(newCloseButton, closeButton);

        // Добавляем новые обработчики
        newApplyButton.addEventListener('click', () => {
            const checkedGroups = Array.from(groupsList.querySelectorAll('input[type="checkbox"]:checked'))
                .map(checkbox => checkbox.value);
            
            console.log('Выбранные группы:', checkedGroups);
            this.filters.groups = checkedGroups;
            this.updateCountriesList();
            modal.classList.remove('active');
        });

        newClearButton.addEventListener('click', () => {
            this.filters.groups = [];
            this.updateCountriesList();
            modal.classList.remove('active');
        });

        newCloseButton.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        // Показываем модальное окно
        modal.classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', function() {

    // Функция для обновления списка стран
    function updateCountriesList(lands) {
        const countriesList = document.getElementById('countries-list');
        if (!countriesList || !lands) return;

        // Очищаем текущий список
        countriesList.innerHTML = '';

        // Подсчитываем количество провинций
        const provincesCount = {};
        if (lands.provinces) {
            for (const province of lands.provinces) {
                if (province.owner) {
                    provincesCount[province.owner] = (provincesCount[province.owner] || 0) + 1;
                }
            }
        }

        // Создаем отсортированный массив стран
        const countriesArray = Object.entries(lands)
            .filter(([id]) => id !== 'provinces')
            .map(([id, country]) => ({
                id,
                name: country.name,
                color: country.color,
                provinces: provincesCount[id] || 0,
                capital: country.capital_name || '',
                ...country
            }))
            .sort((a, b) => {
                // Специальная обработка для undeveloped_land - всегда в конце
                if (a.id === 'undeveloped_land') return 1;
                if (b.id === 'undeveloped_land') return -1;
                
                let comparison = 0;
                
                switch (this.sortColumn) {
                    case 'name':
                        comparison = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                        break;
                    case 'id':
                        // Специальная обработка для civilization_N
                        const aMatch = a.id.match(/^civilization_(\d+)$/);
                        const bMatch = b.id.match(/^civilization_(\d+)$/);
                        if (aMatch && bMatch) {
                            // Если оба ID в формате civilization_N, сравниваем числа
                            comparison = parseInt(aMatch[1]) - parseInt(bMatch[1]);
                        } else if (aMatch) {
                            // Если только первый ID в формате civilization_N, он идет первым
                            comparison = -1;
                        } else if (bMatch) {
                            // Если только второй ID в формате civilization_N, он идет первым
                            comparison = 1;
                        } else {
                            // Для всех остальных случаев используем обычное сравнение
                            comparison = a.id.toLowerCase().localeCompare(b.id.toLowerCase());
                        }
                        break;
                    case 'provinces':
                        comparison = a.provinces - b.provinces;
                        break;
                    case 'capital':
                        comparison = (a.capital || '').toLowerCase().localeCompare((b.capital || '').toLowerCase());
                        break;
                    case 'color':
                        // Сортировка по сумме RGB компонентов
                        const sumA = (a.color || [0,0,0]).slice(0,3).reduce((sum, c) => sum + c, 0);
                        const sumB = (b.color || [0,0,0]).slice(0,3).reduce((sum, c) => sum + c, 0);
                        comparison = sumA - sumB;
                        break;
                }
                
                return this.sortDirection === 'asc' ? comparison : -comparison;
            });

        // Добавляем страны в список
        for (const country of countriesArray) {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.onclick = () => editCountry(country.id);
            
            // Цвет
            const colorCell = document.createElement('td');
            const colorDiv = document.createElement('div');
            colorDiv.className = 'country-color';
            colorDiv.style.backgroundColor = colorToRgb(country.color);
            colorCell.appendChild(colorDiv);
            
            // Название
            const nameCell = document.createElement('td');
            const nameSpan = document.createElement('span');
            nameSpan.textContent = country.name;
            nameCell.appendChild(nameSpan);

            // Добавляем иконку, если страна есть в landsData
            const isInLandsData = landsData.lands.some(land => land.key === country.id);
            if (isInLandsData) {
                const markImg = document.createElement('img');
                markImg.src = 'mark.svg';
                markImg.className = 'country-mark';
                nameCell.appendChild(markImg);
            }
            
            // Системное название (ID)
            const sysNameCell = document.createElement('td');
            sysNameCell.textContent = country.id;
            
            // Количество провинций
            const provincesCell = document.createElement('td');
            provincesCell.textContent = provincesCount[country.id] || 0;
            
            // Столица
            const capitalCell = document.createElement('td');
            capitalCell.textContent = country.capital_name || '';

            // Добавляем ячейки в строку
            row.appendChild(colorCell);
            row.appendChild(nameCell);
            row.appendChild(sysNameCell);
            row.appendChild(provincesCell);
            row.appendChild(capitalCell);

            // Добавляем строку в таблицу
            countriesList.appendChild(row);
        }
    }
})