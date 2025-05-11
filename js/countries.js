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
        console.log('Обновление списка стран...');
        if (!this.jsonData?.lands) {
            console.warn('Нет данных о странах');
            return;
        }

        const tbody = document.getElementById('countries-list');
        if (!tbody) {
            console.error('Не найден элемент countries-list');
            return;
        }

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
                group: country.group_name || '', // Changed from group_name to group
                color: country.color || [128, 128, 128],
                provinces: provincesCount[id] || 0,
                capital_name: country.capital_name || '',
                ...country
            }));

        console.log('Найдено стран:', countries.length);

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
                if (!country.group_name) { // Changed from group_name to group
                    // Если у страны нет группы, проверяем есть ли пустая группа в фильтре
                    return this.filters.groups.includes('');
                }
                
                // Разбиваем группы страны на массив
                const countryGroups = country.group_name.split(',').map(g => g.trim()); // Changed from group_name to group
                
                // Проверяем, есть ли хотя бы одна группа из фильтра в группах страны
                return this.filters.groups.some(filterGroup => {
                    if (filterGroup === '') {
                        return false; // Пустая группа уже обработана выше
                    }
                    return countryGroups.includes(filterGroup);
                });
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
                    case 'group_name':
                        valueA = a.group_name || '';
                        valueB = b.group_name || '';
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

            // Создаем ячейки таблицы
            const colorCell = document.createElement('td');
            colorCell.setAttribute('data-country-id', country.id);
            const colorDiv = document.createElement('div');
            colorDiv.className = 'country-color';
            colorDiv.style.backgroundColor = this.colorToRgb(country.color);
            colorCell.appendChild(colorDiv);

            const nameCell = document.createElement('td');
            nameCell.setAttribute('data-country-id', country.id);
            nameCell.textContent = country.name;

            const sysNameCell = document.createElement('td');
            sysNameCell.setAttribute('data-country-id', country.id);
            sysNameCell.textContent = country.id;

            const groupCell = document.createElement('td');
            groupCell.setAttribute('data-country-id', country.id);
            groupCell.textContent = country.group_name;

            const provincesCell = document.createElement('td');
            provincesCell.setAttribute('data-country-id', country.id);
            provincesCell.textContent = country.provinces;

            const capitalCell = document.createElement('td');
            capitalCell.setAttribute('data-country-id', country.id);
            capitalCell.textContent = country.capital_name;

            // Добавляем обработчики событий
            const handleClick = (e) => {
                if (!e.target.closest('.context-menu')) {
                    this.openCountry(country.id);
                }
            };

            const handleContextMenu = (e) => {
                e.preventDefault();
                e.stopPropagation();

                const tr = e.target.closest('tr');
                if (!tr) return;

                const countryId = tr.getAttribute('data-country-id');
                if (!countryId) return;

                // Удаляем старое меню, если оно есть
                const oldMenu = document.querySelector('.context-menu');
                if (oldMenu) {
                    oldMenu.remove();
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
                    contextMenu.remove();
                });

                document.getElementById('delete-country-context')?.addEventListener('click', () => {
                    this.deleteCurrentCountry(countryId);
                    contextMenu.remove();
                });

                // Закрываем меню при клике вне его
                const closeMenu = (e) => {
                    if (!contextMenu.contains(e.target)) {
                        contextMenu.remove();
                        document.removeEventListener('click', closeMenu);
                        document.removeEventListener('contextmenu', closeMenu);
                    }
                };

                document.addEventListener('click', closeMenu);
                document.addEventListener('contextmenu', closeMenu);
            };

            // Добавляем обработчики к каждой ячейке
            [tr, colorCell, nameCell, sysNameCell, groupCell, provincesCell, capitalCell].forEach(element => {
                element.addEventListener('click', handleClick);
                element.addEventListener('contextmenu', handleContextMenu);
            });

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

        console.log('Список стран обновлен');
    }

    initEventListeners() {
        // Очищаем старые обработчики событий, если они есть
        document.querySelectorAll('.add-country-button').forEach(button => {
            const clone = button.cloneNode(true);
            button.parentNode.replaceChild(clone, button);
        });
        
        // Обработчик добавления новой страны
        document.getElementById('add-country')?.addEventListener('click', () => this.createNewCountry());

        // Обработчики действий со страной
        document.getElementById('copy-country')?.addEventListener('click', () => this.copyCurrentCountry());
        
        // Исправляем обработчик удаления
        const deleteButton = document.getElementById('delete-country');
        if (deleteButton) {
            // Удаляем все старые обработчики
            const newButton = deleteButton.cloneNode(true);
            deleteButton.parentNode.replaceChild(newButton, deleteButton);
            // Добавляем новый обработчик
            newButton.addEventListener('click', () => this.deleteCurrentCountry());
        }

        // Исправляем обработчик копирования
        const copyButton = document.getElementById('copy-country');
        if (copyButton) {
            // Удаляем старые обработчики
            const newButton = copyButton.cloneNode(true);
            copyButton.parentNode.replaceChild(newButton, copyButton);
            // Добавляем новый обработчик
            newButton.addEventListener('click', () => {
                if (this.currentCountry) {
                    this.copyCurrentCountry(this.currentCountry);
                }
            });
        }
        
        document.getElementById('country-all-diplomacy')?.addEventListener('click', () => {
            if (!this.currentCountry) {
                console.error('Не выбрана страна');
                return;
            }
            this.showMassRelationModal(this.currentCountry);
        });

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
        // Закрываем меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#country-actions-button')) {
                document.getElementById('countryActionsDropdown')?.classList.remove('active');
            }
        });
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

        // Добавляем обработчик для кнопки выбора цвета
        document.getElementById('pick-country-color')?.addEventListener('click', () => this.openColorPicker());
        
        // Добавляем обработчик для input color
        document.getElementById('country-color-picker')?.addEventListener('input', (e) => this.handleColorPick(e));
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
        try {
            if (this._isCopying) return;
            this._isCopying = true;

            const sourceId = countryId || this.currentCountry;
            if (!sourceId || !this.jsonData?.lands?.[sourceId]) return;

            const newId = this.generateUniqueId();
            const currentCountry = this.jsonData.lands[sourceId];
            
            this.pushToUndoStack();
            
            // Создаем глубокую копию страны
            this.jsonData.lands[newId] = JSON.parse(JSON.stringify(currentCountry));
            this.jsonData.lands[newId].name += ' (копия)';

            // Обновляем все за один раз
            const jsonString = JSON.stringify(this.jsonData, null, 4);
            if (this.previewContent) {
                this.previewContent.value = jsonString;
                if (typeof window.saveChanges === 'function') {
                    window.saveChanges();
                }
            }

            // Сначала обновляем список
            this.updateCountriesList();
            // Затем открываем страну без дополнительного обновления
            this.openCountry(newId);

            showSuccess(window.translator.translate('ready'), window.translator.translate('copyed'));
        } catch (error) {
            console.error('Error copying country:', error);
            showError('Failed to copy country');
        } finally {
            this._isCopying = false;
        }
    }

    copySelectedCountries() {
        try {
            const selectedInputs = document.querySelectorAll('.country-checkbox:checked');
            const countries = Array.from(selectedInputs).map(input => {
                const countryId = input.value;
                return {
                    id: countryId,
                    ...this.jsonData.lands[countryId]
                };
            });

            if (countries.length === 0) {
                showError(window.translator.translate('no_countries_selected'));
                return;
            }

            // Store the countries in clipboard
            const countryData = JSON.stringify(countries);
            localStorage.setItem('copiedCountries', countryData);
            
            showSuccess(
                window.translator.translate('success'),
                window.translator.translate('countries_copied').replace('{count}', countries.length)
            );
        } catch (error) {
            console.error('Error copying countries:', error);
            showError(window.translator.translate('failed_to_copy_countries'));
        }
    }

    pasteManyCountries() {
        try {
            const copiedData = localStorage.getItem('copiedCountries');
            if (!copiedData) {
                showError(window.translator.translate('no_copied_countries'));
                return;
            }

            this.pushToUndoStack();

            const countries = JSON.parse(copiedData);
            
            // First clean up invalid relations between copied countries
            this.cleanInvalidRelations(countries);

            // Add the countries with new unique IDs
            countries.forEach(country => {
                const newId = this.generateUniqueId();
                const newCountry = { ...country, id: newId };
                newCountry.name += ' (копия)';
                this.jsonData.lands[newId] = newCountry;
            });

            this.updateJsonAndUI();
            showSuccess(
                window.translator.translate('success'),
                window.translator.translate('countries_pasted').replace('{count}', countries.length)
            );
        } catch (error) {
            console.error('Error pasting countries:', error);
            showError(window.translator.translate('failed_to_paste_countries'));
        }
    }

    deleteCurrentCountry(countryId) {
        try {
            // Проверяем, не выполняется ли уже удаление
            if (this._isDeleting) return;
            this._isDeleting = true;

            // Определяем ID страны для удаления
            const targetId = countryId || this.currentCountry;
            
            if (!targetId || !this.jsonData?.lands[targetId]) {
                showError(windows.translator.translate('error'), 'Страна для удаления не найдена');
                this._isDeleting = false;
                return;
            }

            // Запрашиваем подтверждение
            if (!confirm(window.translator.translate('confirm_delete_country'))) {
                this._isDeleting = false;
                return;
            }

            this.pushToUndoStack();

            // Сохраняем имя страны для уведомления
            const countryName = this.jsonData.lands[targetId].name;

            // Удаляем страну
            delete this.jsonData.lands[targetId];

            // Очищаем текущую страну, если удаляем её
            if (this.currentCountry === targetId) {
                this.currentCountry = null;
            }

            // Обновляем список
            this.updateCountriesList();

            // Обновляем JSON в превью и сохраняем
            if (this.previewContent) {
                this.previewContent.value = JSON.stringify(this.jsonData, null, 4);
                if (typeof window.saveChanges === 'function') {
                    window.saveChanges();
                }
            }

            // Переключаемся на список стран
            this.switchToCountriesList();

            // Показываем уведомление об успешном удалении
            showSuccess('Удалено', `Страна "${countryName}" успешно удалена`);
        } catch (error) {
            console.error('Ошибка при удалении страны:', error);
            showError('Ошибка', 'Не удалось удалить страну');
        } finally {
            this._isDeleting = false;
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
            'country-group': country.group_name || '', // Changed from group_name to group
            'country-capital': country.capital_name || '',
            'country-capital-id': country.capital || '',
            'country-defeated': country.defeated ? 'true' : 'false',
            'country-political': country.political || '',
            'country-vassalof': country.vassal_of || ''
        });

        // Обработка поля vassal_of
        const vassalofContainer = document.getElementById('vassalof-container');
        const vassalofInput = document.getElementById('country-vassalof');
        
        if (country.hasOwnProperty('vassal_of') && country.vassal_of) {
            // Получаем информацию о стране-сюзерене
            const vassalCountry = this.jsonData.lands[country.vassal_of];
            if (vassalCountry) {
                vassalofInput.value = `${vassalCountry.name} - ${country.vassal_of}`;
            } else {
                vassalofInput.value = `${country.vassal_of}`;
            }
        } else {
            vassalofInput.value = '';
        }

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

        // Переключаемся на страницу редактирования без дополнительных обновлений
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('country-edit')?.classList.add('active');

        document.querySelectorAll('.nav-button').forEach(btn => {
            btn.classList.remove('active');
        });
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
        // Удаляем существующие модальные окна перед добавлением нового элемента
        document.querySelectorAll('.modal.active').forEach(modal => modal.remove());
        
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
        // Проверяем и удаляем существующие модальные окна
        document.querySelectorAll('.modal.active').forEach(modal => modal.remove());
        
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
                <div class="info-actions">
                    <button class="action-button save-params requirements-editor-button primary">
                        <svg viewBox="0 0 24 24">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        <span>${window.translator.translate('save')}</span>
                    </button>
                    <button class="requirements-editor-button secondary">
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
            country.group_name = document.getElementById('country-group').value; // Changed from group_name to group
            country.capital_name = document.getElementById('country-capital').value;
            const capitalId = parseInt(document.getElementById('country-capital-id').value);
            if (!isNaN(capitalId) && capitalId > 0) {
                country.capital = capitalId;
            } else {
                delete country.capital;
            }
            
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
                showSuccess(window.translator.translate('ready'), window.translator.translate('non-existent owners are replaced '));
            }
        } else {
            if (this.fileInfo) {
                this.fileInfo.textContent = 'Изменений не требуется';
                showInfo(window.translator.translate('ready'), window.translator.translate('no need'));
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

        // Сохраняем текущую колонку
        this.currentFilterColumn = column;
        
        // Настраиваем заголовок с переводом
        const columnTitle = this.getColumnTitle(column);
        title.setAttribute('data-translate-params', JSON.stringify({
            key: 'filter',
            column: columnTitle
        }));
        title.textContent = `${window.translator.translate('filter')}: ${columnTitle}`;
        
        // Настраиваем доступные операторы в зависимости от типа колонки
        this.setupOperators(column);
        
        // Восстанавливаем текущие настройки фильтра, если они есть
        const filter = this.filters[column] || { operator: null, value: null };
        if (filter.operator) {
            operator.value = filter.operator;
        } else {
            operator.selectedIndex = 0;
        }

        // Создаем фильтр, если его нет
        if (!this.filters[column]) {
            this.filters[column] = { operator: null, value: null };
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
                    { value: 'equals', key: 'filter_equals' },
                    { value: 'not_equals', key: 'filter_not_equals' }
                );
                break;
            case 'provinces_count':
            case 'system_name':
                options.push(
                    { value: 'equals', key: 'filter_equals' },
                    { value: 'not_equals', key: 'filter_not_equals' },
                    { value: 'greater', key: 'filter_greater' },
                    { value: 'less', key: 'filter_less' },
                    { value: 'greater_equals', key: 'filter_greater_equals' },
                    { value: 'less_equals', key: 'filter_less_equals' },
                    { value: 'contains', key: 'filter_contains' }
                );
                break;
            default:
                options.push(
                    { value: 'contains', key: 'filter_contains' },
                    { value: 'equals', key: 'filter_equals' },
                    { value: 'not_equals', key: 'filter_not_equals' }
                );
        }

        // Добавляем опции в select с переводом
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.setAttribute('data-translate', opt.key);
            option.textContent = window.translator.translate(opt.key);
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
        showSuccess(window.translator.translate('ready'), window.translator.translate('filtres reseted'))
    }

    getColumnTitle(column) {
        const titles = {
            color: 'color',
            name: 'name',
            system_name: 'system_name',
            provinces_count: 'provinces_count',
            capital: 'capital',
            group_name: 'group_name'
        };
        return window.translator.translate(titles[column] || column);
    }

    // Вспомогательная функция для извлечения числа из ID страны
    extractCivilizationNumber(id) {
        const match = id.match(/civilization_(\d+)/);
        return match ? parseInt(match[1]) : null;
    }

    showGroupFilterModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';

        // Собираем все уникальные группы, разбивая строки с несколькими группами
        const groups = new Set();
        if (this.jsonData?.lands) {
            Object.values(this.jsonData.lands).forEach(country => {
                if (country.group_name) {
                    // Разбиваем строку групп по запятой и добавляем каждую группу отдельно
                    country.group_name.split(',').forEach(group => {
                        const trimmedGroup = group.trim();
                        if (trimmedGroup) {
                            groups.add(trimmedGroup);
                        }
                    });
                }
            });
        }

        // Сортируем группы
        const sortedGroups = Array.from(groups).sort();

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${window.translator.translate('filter_groups')}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="groups-list" id="groups-filter-list">
                        <div class="group-checkbox-item">
                            <input type="checkbox" id="country-group-empty" value=""
                                   ${this.filters.groups.includes('') ? 'checked' : ''}>
                            <label for="country-group-empty" data-translate="empty_group">[Пусто]</label>
                        </div>
                        ${sortedGroups.map(group => `
                            <div class="group-checkbox-item">
                                <input type="checkbox" id="country-group-${group}" value="${group}"
                                       ${this.filters.groups.includes(group) ? 'checked' : ''}>
                                <label for="country-group-${group}">${group}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="action-button apply-filter">
                        <svg viewBox="0 0 24 24">
                            <path d="M20.3 2H3.7c-.9 0-1.7.8-1.7 1.7v16.6c0 .9.8 1.7 1.7 1.7h16.6c.9 0 1.7-.8 1.7-1.7V3.7c0-.9-.8-1.7-1.7-1.7zm-2.3 11.8l-5.5 5.5c-.4.4-1 .4-1.4 0L5.6 13.8c-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0l4.2 4.2 4.9-4.9c.4-.4 1-.4 1.4 0 .5.4.5 1.1.1 1.4z"/>
                        </svg>
                        <span>${window.translator.translate('apply')}</span>
                    </button>
                    <button class="action-button clear-filter">
                        <svg viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                        </svg>
                        <span>${window.translator.translate('clear')}</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Обработчики
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.querySelector('.apply-filter').addEventListener('click', () => {
            const checkedGroups = Array.from(modal.querySelectorAll('input[type="checkbox"]:checked'))
                .map(checkbox => checkbox.value);
            this.filters.groups = checkedGroups;
            this.updateCountriesList();
            modal.remove();
        });
        modal.querySelector('.clear-filter').addEventListener('click', () => {
            this.filters.groups = [];
            this.updateCountriesList();
            modal.remove();
        });
    }

    openColorPicker() {
        const colorPicker = document.getElementById('country-color-picker');
        if (colorPicker) {
            const r = document.getElementById('country-color-r').value;
            const g = document.getElementById('country-color-g').value;
            const b = document.getElementById('country-color-b').value;
            const hexColor = this.rgbToHex(parseInt(r), parseInt(g), parseInt(b));
            colorPicker.value = hexColor;
            colorPicker.click();
        }
    }

    handleColorPick(e) {
        const hexColor = e.target.value;
        const rgb = this.hexToRgb(hexColor);
        if (rgb) {
            document.getElementById('country-color-r').value = rgb.r;
            document.getElementById('country-color-g').value = rgb.g;
            document.getElementById('country-color-b').value = rgb.b;
            this.updateCountryColorPreview();
        }
    }

    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    updateCountryColorPreview() {
        const r = document.getElementById('country-color-r').value;
        const g = document.getElementById('country-color-g').value;
        const b = document.getElementById('country-color-b').value;
        const preview = document.getElementById('country-color-preview');
        if (preview) {
            preview.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        }
        this.saveChanges();
    }

    showMassRelationModal(ccountry) {
        let modalAllRelations = document.getElementById('massRelationModal');
        modalAllRelations.classList.add("active");
        console.log('modalAllRelations', modalAllRelations, ccountry);
    }

    closeMassRelationModal() {
        let modalAllRelations = document.getElementById('massRelationModal');
        if (modalAllRelations) {
            modalAllRelations.classList.remove("active");
        }
    }

    copySelectedCountries() {
        try {
            const selectedInputs = document.querySelectorAll('.country-checkbox:checked');
            const countries = Array.from(selectedInputs).map(input => {
                const countryId = input.value;
                return {
                    id: countryId,
                    ...this.jsonData.lands[countryId]
                };
            });

            if (countries.length === 0) {
                showError(window.translator.translate('no_countries_selected'));
                return;
            }

            // Store the countries in clipboard
            const countryData = JSON.stringify(countries);
            localStorage.setItem('copiedCountries', countryData);
            
            showSuccess(
                window.translator.translate('success'),
                window.translator.translate('countries_copied').replace('{count}', countries.length)
            );
        } catch (error) {
            console.error('Error copying countries:', error);
            showError(window.translator.translate('failed_to_copy_countries'));
        }
    }

    pasteManyCountries() {
        try {
            const copiedData = localStorage.getItem('copiedCountries');
            if (!copiedData) {
                showError(window.translator.translate('no_copied_countries'));
                return;
            }

            this.pushToUndoStack();

            const countries = JSON.parse(copiedData);
            
            // First clean up invalid relations between copied countries
            this.cleanInvalidRelations(countries);

            // Add the countries with new unique IDs
            countries.forEach(country => {
                const newId = this.generateUniqueId();
                const newCountry = { ...country, id: newId };
                newCountry.name += ' (копия)';
                this.jsonData.lands[newId] = newCountry;
            });

            this.updateJsonAndUI();
            showSuccess(
                window.translator.translate('success'),
                window.translator.translate('countries_pasted').replace('{count}', countries.length)
            );
        } catch (error) {
            console.error('Error pasting countries:', error);
            showError(window.translator.translate('failed_to_paste_countries'));
        }
    }

    saveMassRelationModal() {
        if (!this.currentCountry || !this.jsonData?.lands) return;

        const modal = document.getElementById('massRelationModal');
        if (!modal) return;

        // Получаем все параметры из формы
        const relationType = document.getElementById('massRelationType').value;
        const turn = parseInt(modal.querySelector('.param-turn').value) || 0;
        const duration = modal.querySelector('.param-duration').value;
        const initiator = modal.querySelector('.param-initiator').value === 'true';

        this.pushToUndoStack();

        // Инициализируем объект отношений для текущей страны если он не существует
        if (!this.jsonData.lands[this.currentCountry][relationType]) {
            this.jsonData.lands[this.currentCountry][relationType] = {};
        }

        // Для каждой страны (кроме текущей и служебных) добавляем отношения
        Object.entries(this.jsonData.lands).forEach(([countryId, _]) => {
            if (countryId !== this.currentCountry && countryId !== 'undeveloped_land' && countryId !== 'provinces') {
                // Создаем параметры отношения для текущей страны
                const relationParams = {
                    turn: turn
                };

                // Добавляем опциональные параметры если они указаны
                if (duration) {
                    relationParams.duration = parseInt(duration);
                }
                if (initiator !== undefined) {
                    relationParams.initiator = initiator;
                }

                // Добавляем отношение текущей страны к целевой
                this.jsonData.lands[this.currentCountry][relationType][countryId] = relationParams;

                // Инициализируем объект отношений для целевой страны если он не существует
                if (!this.jsonData.lands[countryId][relationType]) {
                    this.jsonData.lands[countryId][relationType] = {};
                }

                // Создаем обратное отношение
                const reciprocalParams = { ...relationParams };
                if (initiator !== undefined) {
                    reciprocalParams.initiator = !initiator; // Инвертируем для второй страны
                }

                // Добавляем обратное отношение от целевой страны к текущей
                this.jsonData.lands[countryId][relationType][this.currentCountry] = reciprocalParams;
            }
        });

        // Сохраняем изменения и обновляем интерфейс
        this.updateJsonAndUI();
        modal.classList.remove('active');
        this.openCountry(this.currentCountry);

        // Показываем уведомление об успешном применении
        showSuccess(
            window.translator.translate('success'),
            window.translator.translate('mass_relation_applied')
        );
    }

    cleanInvalidRelations(countries) {
        if (!countries || !this.jsonData?.lands) return;

        // Create a set of valid country IDs that includes both existing and to-be-pasted countries
        const validCountryIds = new Set([
            ...Object.keys(this.jsonData.lands),
            ...countries.map(country => country.id)
        ]);

        // For each country that will be pasted
        countries.forEach(countryData => {
            // List of all relation types to check
            const relationTypes = ['allies', 'enemies', 'guaranteed', 'guaranteed_by', 'pacts', 'sanctions', 'vassals'];

            // Check and clean each relation type
            relationTypes.forEach(relationType => {
                if (countryData[relationType] && typeof countryData[relationType] === 'object') {
                    // Get and clean the relations for this type
                    const relations = countryData[relationType];
                    const invalidRelations = [];
                    
                    // Identify invalid relations
                    Object.keys(relations).forEach(relatedCountryId => {
                        // A relation is invalid if:
                        // - The related country doesn't exist and isn't being pasted, or
                        // - It's a self-relation
                        if (!validCountryIds.has(relatedCountryId) || countryData.id === relatedCountryId) {
                            invalidRelations.push(relatedCountryId);
                        }
                    });

                    // Remove the invalid relations
                    invalidRelations.forEach(relatedCountryId => {
                        delete relations[relatedCountryId];
                    });
                }
            });

            // Special handling for vassal_of if it exists
            if (countryData.vassal_of && !validCountryIds.has(countryData.vassal_of)) {
                delete countryData.vassal_of;
            }
        });
    }

    async loadScenario(scenarioData) {
        try {
            this.jsonData = scenarioData;
            if (!this.jsonData.lands) {
                this.jsonData.lands = {};
            }
            if (!this.jsonData.provinces) {
                this.jsonData.provinces = [];
            }
            
            // Reset current country selection
            this.currentCountry = null;
            
            // Update the UI
            this.updateCountriesList();
            
            return true;
        } catch (error) {
            console.error('Error loading scenario in CountryManager:', error);
            return false;
        }
    }
    
    saveScen() {
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
    }
}

// Создаем глобальный экземпляр менеджера стран после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('Инициализация CountryManager...');
    window.countryManager = new CountryManager();
    console.log('CountryManager инициализирован:', window.countryManager);
});
