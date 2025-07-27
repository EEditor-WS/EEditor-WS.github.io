class EventManager {
    constructor() {
        try {
            this.currentEvent = null;
            this.jsonData = null;
            this.undoStack = [];
            this.redoStack = [];
            this.maxStackSize = 50;
            this.isEditing = false;
            this.filters = {};  // Добавляем инициализацию фильтров
            this.eventListeners = []; // Добавляем инициализацию массива eventListeners
            
            // Добавляем параметры сортировки
            this.sortColumn = 'id'; // По умолчанию сортируем по ID
            this.sortDirection = 'asc'; // По умолчанию по возрастанию
            
            // Сохраняем ссылки на важные элементы
            this.previewContent = document.getElementById('preview-content');
            this.fileInfo = document.getElementById('file-info');
            
            // Проверяем наличие необходимых элементов
            if (!this.previewContent) {
                throw new Error('Не найден элемент preview-content');
            }
            if (!this.fileInfo) {
                throw new Error('Не найден элемент file-info');
            }
            
            // Пытаемся загрузить начальные данные из preview-content
            try {
                const initialData = JSON.parse(this.previewContent.value);
                this.setJsonData(initialData);
            } catch (error) {
                console.warn('Не удалось загрузить начальные данные:', error);
                console.warn("Если эта ошибка появилась до загрузки файла, то это нормально, просто нет данных для отображения");
            }
            
            // Подписываемся на изменения в preview-content
            this.previewContent.addEventListener('input', () => {
                if (this.isEditing) return; // Игнорируем событие, если мы сами его вызвали
                try {
                    const jsonData = JSON.parse(this.previewContent.value);
                    this.setJsonData(jsonData);
                } catch (error) {
                    console.error('Ошибка при парсинге JSON:', error);
                    this.fileInfo.textContent = window.translator.translate('file_parse_error');
                }
            });
            
            this.init();
        } catch (error) {
            console.error('Ошибка при инициализации EventManager:', error);
            throw error;
        }
    }

    syncronizeWithPreview() {
        try {
            this.jsonData = JSON.parse(this.previewContent.value);
        } catch (error) {
            console.error('Ошибка при синхронизации с previewContent:', error);
        }
    }

    async loadScenario(content) {
        try {
            this.jsonData = JSON.parse(content);
            if (!this.jsonData.custom_events) {
                this.jsonData.custom_events = {};
            }
            this.updateEventsList();
            return true;
        } catch (error) {
            console.error('Error loading scenario in EventManager:', error);
            return false;
        }
    }

    setJsonData(jsonData) {
        this.jsonData = jsonData;
        if (!this.jsonData.custom_events) {
            this.jsonData.custom_events = {};
        }
        this.updateEventsList();
    }

    init() {
        // Инициализация обработчиков событий
        this.initEventListeners();
        
        // Инициализация сортировки
        this.initSortHandlers();

        // Добавляем обработчики для предпросмотра изображений
        const imageSelect = document.getElementById('event-image');
        const imagePreview = document.getElementById('event-image-preview');
        const iconSelect = document.getElementById('event-icon');
        const iconPreview = document.getElementById('event-icon-preview');

        if (imageSelect && imagePreview) {
            imageSelect.addEventListener('change', () => {
                const selectedImage = imageSelect.value;
                imagePreview.src = `event/img/${selectedImage}.png`;
            });
            // Инициализируем предпросмотр для текущего значения
            imagePreview.src = `event/img/${imageSelect.value}.png`;
        }

        if (iconSelect && iconPreview) {
            iconSelect.addEventListener('change', () => {
                const selectedIcon = iconSelect.value;
                iconPreview.src = `event/ico/${selectedIcon}.png`;
            });
            // Инициализируем предпросмотр для текущего значения
            iconPreview.src = `event/ico/${iconSelect.value}.png`;
        }
    }

    initSortHandlers() {
        const headers = document.querySelectorAll('#events .list-table th[data-sort]');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const column = header.getAttribute('data-sort');
                if (this.sortColumn === column) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortColumn = column;
                    this.sortDirection = 'asc';
                }
                this.updateEventsList();
            });
        });
    }

    updateEventsList() {
        console.log('Обновление списка событий...');
        if (!this.jsonData?.custom_events) {
            console.warn('Нет данных о событиях');
            return;
        }

        const tbody = document.getElementById('events-list');
        if (!tbody) {
            console.error('Не найден элемент events-list');
            return;
        }

        tbody.innerHTML = '';

        // Создаем массив событий для сортировки и фильтрации
        let events = Object.entries(this.jsonData.custom_events)
            .map(([id, event]) => ({
                id,
                group: event.group_name || '',
                name: event.unique_event_name || '',
                title: event.title || '',
                requirements: event.requirements || '',
                ...event
            }));

            
        const eventsCountEl = document.getElementById('eventsCount');
        if (eventsCountEl) {
            eventsCountEl.textContent = events.length;
        } 

        // Применяем фильтры
        if (this.filters.groups) {
            events = events.filter(event => {
                // event.group может содержать несколько групп через запятую
                const eventGroups = (event.group || '').split(/\s*,\s*/).filter(Boolean);
                // Если хотя бы одна из групп события есть в фильтре, событие показываем
                return eventGroups.some(group => this.filters.groups.includes(group));
            });
        }

        // Сортировка
        if (this.sortColumn === 'id') {
            events.sort((a, b) => {
                // Извлекаем числа из ID (например, из 'E1' получаем 1)
                const numA = parseInt(a.id.replace('E', ''));
                const numB = parseInt(b.id.replace('E', ''));
                return this.sortDirection === 'asc' ? numA - numB : numB - numA;
            });
        } else {
            events.sort((a, b) => {
                let valueA = a[this.sortColumn] || '';
                let valueB = b[this.sortColumn] || '';
                return this.sortDirection === 'asc' 
                    ? String(valueA).localeCompare(String(valueB))
                    : String(valueB).localeCompare(String(valueA));
            });
        }

        // Обновляем индикаторы сортировки и фильтрации
        const headers = document.querySelectorAll('#events .list-table th[data-sort]');
        headers.forEach(header => {
            const column = header.getAttribute('data-sort');
            header.classList.remove('sort-asc', 'sort-desc', 'filtered');
            if (column === this.sortColumn) {
                header.classList.add(`sort-${this.sortDirection}`);
            }
            if (column === 'group' && this.filters.groups) {
                header.classList.add('filtered');
            }
        });

        // Отображаем события
        events.forEach(event => {
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            tr.setAttribute('data-event-id', event.id);
            tr.addEventListener('click', () => this.openEvent(event.id));

            const idCell = document.createElement('td');
            idCell.textContent = event.id;

            const groupCell = document.createElement('td');
            groupCell.textContent = event.group;

            const nameCell = document.createElement('td');
            nameCell.textContent = event.name;

            const titleCell = document.createElement('td');
            titleCell.textContent = event.title;

            const requirementsCell = document.createElement('td');
            requirementsCell.textContent = convertObjectToReadableString(event.requirements);

            tr.appendChild(idCell);
            tr.appendChild(groupCell);
            tr.appendChild(nameCell);
            tr.appendChild(titleCell);
            tr.appendChild(requirementsCell);

            tbody.appendChild(tr);
        });

        console.log('Список событий обновлен');
    }

    initEventListeners() {
        // Обработчик добавления нового события
        document.getElementById('add-event')?.addEventListener('click', () => this.createNewEvent());

        // Обработчики действий с событием
        document.getElementById('copy-event')?.addEventListener('click', () => this.copyCurrentEvent());
        document.getElementById('delete-event')?.addEventListener('click', () => this.deleteCurrentEvent());

        // Обработчики формы редактирования
        const form = document.getElementById('event-form');
        if (form) {
            form.addEventListener('change', (e) => this.handleFormChange(e));
            form.addEventListener('submit', (e) => e.preventDefault());
        }

        // Закрываем меню действий ивентов при клике вне его
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#event-actions-button')) {
                document.getElementById('eventActionsDropdown')?.classList.remove('active');
            }
        });

        // Обработчики изображений
        document.getElementById('event-image')?.addEventListener('change', (e) => {
            this.updateImagePreview(e.target.value);
        });

        document.getElementById('event-icon')?.addEventListener('change', (e) => {
            this.updateIconPreview(e.target.value);
        });

        // Обработчики состояния ответов
        document.getElementById('event-answer2-disabled')?.addEventListener('change', () => {
            this.updateAnswerBlocksState();
        });

        document.getElementById('event-answer3-disabled')?.addEventListener('change', () => {
            this.updateAnswerBlocksState();
        });

        // Обработчики кнопок требований и бонусов
        document.querySelectorAll('.requirements-button').forEach(button => {
            button.addEventListener('click', () => {
                const answer = button.getAttribute('data-answer') || '';
                this.openRequirementsEditor(answer);
            });
        });

        // Обработчики сохранения и отмены
        document.getElementById('save-event')?.addEventListener('click', () => {
            this.saveChanges();
        });

        document.getElementById('cancel-edit')?.addEventListener('click', () => {
            this.switchToEventsList();
        });

        // Обработчики фильтров
        document.querySelectorAll('#events .th-filter').forEach(button => {
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
                    this.showFilterModal(column);
                }
            });
        });

        // Кнопка очистки всех фильтров
        document.getElementById('clear-events-filters')?.addEventListener('click', () => {
            this.clearAllFilters();
        });

        // Обработчик для кнопки возврата к списку событий
        document.getElementById('back-to-events-list')?.addEventListener('click', () => this.backToEventsList());

        // Добавляем обработчик контекстного меню для таблицы событий
        const tbody = document.getElementById('events-list');
        if (tbody) {
            tbody.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const tr = e.target.closest('tr');
                if (!tr) return;

                const eventId = tr.getAttribute('data-event-id');
                if (!eventId) return;

                console.log('Открытие контекстного меню для события:', eventId);

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
                    <div class="context-menu-item" id="duplicate-event-context">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        <span>${window.translator.translate('duplicate')}</span>
                    </div>
                    <div class="context-menu-item" id="copy-event-context">
                        <svg viewBox="0 0 24 24">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                            <line x1="12" y1="11" x2="12" y2="17"></line>
                            <line x1="9" y1="14" x2="15" y2="14"></line>
                        </svg>
                        <span>${window.translator.translate('copy-to-clipboard')}</span>
                    </div>
                    <div class="context-menu-item delete" id="delete-event-context">
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
                document.getElementById('duplicate-event-context')?.addEventListener('click', () => {
                    console.log('Дублирование события:', eventId);
                    this.copyCurrentEvent(eventId);
                    document.body.removeChild(contextMenu);
                });

                document.getElementById('delete-event-context')?.addEventListener('click', () => {
                    console.log('Удаление события:', eventId);
                    this.deleteCurrentEvent(eventId);
                    document.body.removeChild(contextMenu);
                });

                document.getElementById('copy-event-context')?.addEventListener('click', () => {
                    window.moveManager.copyCurrentEvent(eventId);
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

        // Обработчики удаления требований и бонусов
        const deleteButtons = document.querySelectorAll('.delete');
        deleteButtons.forEach(button => {
            const listener = (e) => {
                const index = e.target.getAttribute('data-index');
                const container = e.target.closest('.array-list');
                if (container) {
                    const items = Array.from(container.children);
                    if (items[index]) {
                        container.removeChild(items[index]);
                        this.saveChanges();
                    }
                }
            };
            button.addEventListener('click', listener);
            this.eventListeners.push({ element: button, event: 'click', listener });
        });
    }

    createNewEvent() {
        if (!this.jsonData) {
            try {
                this.jsonData = JSON.parse(this.previewContent.value);
            } catch (error) {
                this.jsonData = {};
            }
        }
        
        if (!this.jsonData.custom_events) {
            this.jsonData.custom_events = {};
        }

        const newId = this.generateUniqueId();
        const newEvent = {
            id: newId,
            group_name: "",
            unique_event_name: "",
            title: `Event ${newId.toLowerCase()}`,
            description: "",
            answer1: "ignore",
            answer2: "",
            answer3: "",
            description1: "",
            description2: "",
            description3: "",
            answer2_is_disabled: true,
            answer3_is_disabled: true,
            auto_answer1_if_ignored: true,
            delete_after_turns: 1,
            hide_later: false,
            image: "diplomacy",
            icon: "diplomacy",
            lands: [],
            bonuses: [],
            bonuses1: [],
            bonuses2: [],
            bonuses3: [],
            requirements: [],
            requirements1: [],
            requirements2: [],
            requirements3: []
        };

        this.pushToUndoStack();
        this.jsonData.custom_events[newId] = newEvent;
        this.updateJsonInPreview();
        this.updateEventsList();
        this.openEvent(newId);
    }

generateUniqueId(minimumID = 0) {
    if (!this.jsonData || !this.jsonData.custom_events) {
        // Вернём ID, который больше minimumID
        return `E${Math.max(1, minimumID + 1)}`;
    }

    // Извлекаем существующие числовые ID
    const existingIds = new Set(
        Object.keys(this.jsonData.custom_events)
            .filter(id => /^E\d+$/.test(id))
            .map(id => parseInt(id.substring(1), 10))
            .filter(num => !isNaN(num))
    );

    // Начинаем с первого подходящего ID
    let newId = minimumEventID + 1;
    while (existingIds.has(newId)) {
        newId++;
    }

    return `E${newId}`;
}

    copyCurrentEvent(eventId) {
        try {
            if (this._isCopying) return;
            this._isCopying = true;

            const sourceId = eventId || this.currentEvent;
            if (!sourceId || !this.jsonData?.custom_events?.[sourceId]) {
                console.error('Source event not found');
                return;
            }

            const newId = this.generateUniqueId();
            const sourceEvent = this.jsonData.custom_events[sourceId];
            
            this.pushToUndoStack();
            
            // Создаем глубокую копию события
            const eventCopy = JSON.parse(JSON.stringify(sourceEvent));

            // Рекурсивно заменить все вхождения старого ID на новый во всех полях
            function replaceIdDeep(obj, oldId, newId) {
                if (Array.isArray(obj)) {
                    return obj.map(item => replaceIdDeep(item, oldId, newId));
                } else if (obj && typeof obj === 'object') {
                    const newObj = {};
                    for (const key in obj) {
                        if (typeof obj[key] === 'string' && obj[key] === oldId) {
                            newObj[key] = newId;
                        } else {
                            newObj[key] = replaceIdDeep(obj[key], oldId, newId);
                        }
                    }
                    return newObj;
                }
                return obj;
            }
            // Заменяем во всех requirements/bonuses и вложенных
            ['requirements','requirements1','requirements2','requirements3','bonuses','bonuses1','bonuses2','bonuses3'].forEach(field => {
                if (Array.isArray(eventCopy[field])) {
                    eventCopy[field] = replaceIdDeep(eventCopy[field], sourceId, newId);
                }
            });

            // Устанавливаем правильный id и обновляем название
            eventCopy.id = newId;
            // Добавляем '_copy' только если уникальное имя не пустое
            eventCopy.unique_event_name = sourceEvent.unique_event_name ? `${sourceEvent.unique_event_name}_copy` : '';
            eventCopy.title = `${sourceEvent.title || ''} ${window.translator.translate("(copy)")}`;

            // Сохраняем копию в общий список
            this.jsonData.custom_events[newId] = eventCopy;

            // Обновляем все за один раз
            this.updateJsonInPreview();
            this.updateEventsList();
            this.openEvent(newId);

            showSuccess(window.translator.translate('ready'), window.translator.translate('copyed'));
        } catch (error) {
            console.error('Error copying event:', error);
            showError('Failed to copy event');
        } finally {
            this._isCopying = false;
        }
    }

    deleteCurrentEvent() {
        if (!this.currentEvent || !this.jsonData?.custom_events?.[this.currentEvent]) return;

        this.pushToUndoStack();
        delete this.jsonData.custom_events[this.currentEvent];
        this.updateJsonInPreview();
        this.updateEventsList();
        this.switchToEventsList();
    }

    openEvent(eventId) {
        if (!this.jsonData?.custom_events?.[eventId]) return;

        this.currentEvent = eventId;
        const event = this.jsonData.custom_events[eventId];

        // Заполняем основные поля
        const titleHeader = document.getElementById('event-name-header');
        if (titleHeader) {
            titleHeader.textContent = event.title || window.translator.translate("without_name");
        }

        this.setFormValues({
            'event-id': event.id,
            'event-group-name': event.group_name || '',
            'event-unique-name': event.unique_event_name || '',
            'event-title': event.title || '',
            'event-description': event.description || '',
            'event-image': event.image || '',
            'event-icon': event.icon || '',
            'event-answer1': event.answer1 || '',
            'event-answer2': event.answer2 || '',
            'event-answer3': event.answer3 || '',
            'event-description1': event.description1 || '',
            'event-description2': event.description2 || '',
            'event-description3': event.description3 || '',
            'event-answer2-disabled': event.answer2_is_disabled ? 'true' : 'false',
            'event-answer3-disabled': event.answer3_is_disabled ? 'true' : 'false',
            'event-auto-answer1': event.auto_answer1_if_ignored ? 'true' : 'false',
            'event-delete-turns': event.delete_after_turns || 1,
            'event-hide-later': event.hide_later ? 'true' : 'false'
        });

        // Заполняем бонусы и требования
        this.populateRequirementsAndBonuses(event);

        // Переключаемся на страницу редактирования
        this.switchToEditPage();
    }

    setFormValues(values) {
        Object.entries(values).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (element.tagName === 'SELECT') {
                    element.value = value;
                    // Обновляем предпросмотр для изображений
                    if (id === 'event-image') {
                        this.updateImagePreview(value);
                    } else if (id === 'event-icon') {
                        this.updateIconPreview(value);
                    }
                } else {
                    element.value = value;
                }
            }
        });

        // Обновляем состояние блоков ответов
        this.updateAnswerBlocksState();
    }

    updateImagePreview(imageName) {
        const preview = document.getElementById('event-image-preview');
        if (preview) {
            preview.src = imageName ? `event/img/${imageName}.png` : '';
        }
    }

    updateIconPreview(iconName) {
        const preview = document.getElementById('event-icon-preview');
        if (preview) {
            preview.src = iconName ? `event/ico/${iconName}.png` : '';
        }
    }

    updateAnswerBlocksState() {
        // Обновляем состояние второго ответа
        const answer2Block = document.querySelector('.answer-block:nth-child(2)');
        const answer2Disabled = document.getElementById('event-answer2-disabled').value === 'true';
        if (answer2Block) {
            answer2Block.setAttribute('data-disabled', answer2Disabled);
        }

        // Обновляем состояние третьего ответа
        const answer3Block = document.querySelector('.answer-block:nth-child(3)');
        const answer3Disabled = document.getElementById('event-answer3-disabled').value === 'true';
        if (answer3Block) {
            answer3Block.setAttribute('data-disabled', answer3Disabled);
        }
    }

    populateRequirementsAndBonuses(event) {
        // Очищаем существующие списки
        ['requirements', 'requirements1', 'requirements2', 'requirements3',
         'bonuses', 'bonuses1', 'bonuses2', 'bonuses3'].forEach(listType => {
            const container = document.getElementById(`event-${listType}`);
            if (container) {
                container.innerHTML = '';
                const items = event[listType] || [];
                items.forEach(item => this.addRequirementOrBonusItem(container, item));
            }
        });
    }

    addRequirementOrBonusItem(container, item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'array-list-item';

        const isRequirement = container.id.includes('requirements');
        
        // Список бонусов без длительности
        const bonusesWithoutDuration = [
            'add_oil', 'add_cruiser', 'add_random_culture_population', 
            'add_shock_infantry', 'discontent', 'add_tank', 'add_artillery', 'army_losses', 
            'prestige', 'add_battleship', 'add_infantry', 'science', 'money'
        ];

        const content = isRequirement ? 
            `${item.type} ${item.action || ''} ${item.value}${item.subtype ? ` (${item.subtype})` : ''}` :
            bonusesWithoutDuration.includes(item.type) ?
                `${item.type} ${item.value}` :
            `${item.type} ${item.value}${item.duration ? ` на ${item.duration} ходов` : ''}${item.subtype ? ` (${item.subtype})` : ''}`;

        itemDiv.innerHTML = `
            <div class="item-content">${content}</div>
            <div class="item-controls">
                <button type="button" class="item-edit">✎</button>
                <button type="button" class="item-delete">×</button>
            </div>
        `;

        container.appendChild(itemDiv);
    }

    handleFormChange(e) {
        if (this.isEditing) return;
        this.pushToUndoStack();
        this.saveChanges();
            }

    saveChanges() {
        if (!this.currentEvent || !this.jsonData?.custom_events?.[this.currentEvent]) {
            console.warn('Нет текущего события или данных для сохранения');
            return;
        }

        this.isEditing = true;
        try {
            const event = this.jsonData.custom_events[this.currentEvent];

            // Проверяем наличие всех необходимых элементов формы
            const requiredElements = [
                'event-id', 'event-title',
                'event-description', 'event-image', 'event-icon'
            ];

            for (const elementId of requiredElements) {
                const element = document.getElementById(elementId);
                if (!element) {
                    throw new Error(`Не найден элемент формы: ${elementId}`);
                }
            }

            // Обновляем основные данные
            event.id = document.getElementById('event-id').value;
            event.group_name = document.getElementById('event-group-name').value;
            event.unique_event_name = document.getElementById('event-unique-name').value;
            event.title = document.getElementById('event-title').value;
            event.description = document.getElementById('event-description').value;
            event.image = document.getElementById('event-image').value;
            event.icon = document.getElementById('event-icon').value;

            // Валидация обязательных полей
            if (!event.id || !event.title) {
                throw new Error('ID и заголовок события обязательны');
            }

            // Обновляем ответы
            this.updateEventAnswers(event);

            // Обновляем JSON и интерфейс
            this.updateJsonInPreview();
            
            // Обновляем заголовок
            const titleHeader = document.getElementById('event-name-header');
            if (titleHeader) {
                titleHeader.textContent = event.title || window.translator.translate("without_name");
            }

            this.updateEventsList();
            
            // Показываем сообщение об успешном сохранении
            this.fileInfo.textContent = window.translator.translate('changes_saved');
        } catch (error) {
            console.error('Ошибка при сохранении изменений:', error);
            this.fileInfo.textContent = window.translator.translate('save_error');
        } finally {
            this.isEditing = false;
        }
    }

    updateEventAnswers(event) {
        try {
            event.answer1 = document.getElementById('event-answer1').value;
            event.answer2 = document.getElementById('event-answer2').value;
            event.answer3 = document.getElementById('event-answer3').value;
            event.description1 = document.getElementById('event-description1').value;
            event.description2 = document.getElementById('event-description2').value;
            event.description3 = document.getElementById('event-description3').value;
            event.answer2_is_disabled = document.getElementById('event-answer2-disabled').value === 'true';
            event.answer3_is_disabled = document.getElementById('event-answer3-disabled').value === 'true';
            event.auto_answer1_if_ignored = document.getElementById('event-auto-answer1').value === 'true';
            event.delete_after_turns = parseInt(document.getElementById('event-delete-turns').value) || 1;
            event.hide_later = document.getElementById('event-hide-later').value === 'true';
        } catch (error) {
            console.error('Ошибка при обновлении ответов события:', error);
            throw error;
        }
    }

    updateRequirementsAndBonuses(event) {
        ['requirements', 'requirements1', 'requirements2', 'requirements3',
         'bonuses', 'bonuses1', 'bonuses2', 'bonuses3'].forEach(listType => {
            const container = document.getElementById(`event-${listType}`);
            if (!container) return;

            const items = [];
            container.querySelectorAll('.array-list-item').forEach(item => {
                // Здесь нужно добавить логику извлечения данных из элементов списка
                // В зависимости от того, как хранятся данные в DOM
                const itemData = this.parseItemData(item, listType.includes('requirements'));
                if (itemData) {
                    items.push(itemData);
                }
            });

            event[listType] = items;
        });
    }

    parseItemData(item, isRequirement) {
        if (isRequirement) {
            const typeCell = item.cells[0];
            const subtypeCell = item.cells[1];
            const actionCell = item.cells[2];
            const valueCell = item.cells[3];
            
            return {
                type: typeCell.textContent.trim(),
                action: actionCell.textContent.trim() || undefined,
                value: valueCell.textContent.split('(')[0].trim(),
                subtype: subtypeCell.textContent.trim() || undefined
            };
        } else {
            const typeCell = item.cells[0];
            const subtypeCell = item.cells[1];
            const valueCell = item.cells[3];
            
            const durationMatch = valueCell.textContent.match(/\((\d+) ходов\)/);
            
            return {
                type: typeCell.textContent.trim(),
                value: valueCell.textContent.split('(')[0].trim(),
                duration: durationMatch ? parseInt(durationMatch[1]) : 3,
                subtype: subtypeCell.textContent.trim() || undefined
            };
        }
    }

    updateJsonInPreview() {
        if (!this.previewContent || !this.jsonData) return;
        
        this.isEditing = true;
        try {
            // Сохраняем текущую позицию курсора
            const cursorPosition = this.previewContent.selectionStart;
            
            // Обновляем JSON в текстовом поле
        this.previewContent.value = JSON.stringify(this.jsonData, null, 4);
        
            // Восстанавливаем позицию курсора
            this.previewContent.setSelectionRange(cursorPosition, cursorPosition);

        if (this.fileInfo) {
            this.fileInfo.textContent = window.translator.translate("changes_not_saved");
        }
        } finally {
            this.isEditing = false;
        }
    }

    switchToEditPage() {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('event-edit')?.classList.add('active');

        document.querySelectorAll('.nav-button').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    switchToEventsList() {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('events')?.classList.add('active');

        document.querySelectorAll('.nav-button').forEach(btn => {
            if (btn.getAttribute('data-page') === 'events') {
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

        this.updateJsonInPreview();
        if (this.currentEvent) {
            this.openEvent(this.currentEvent);
        }
    }

    redo() {
        if (this.redoStack.length === 0) return;

        const currentState = JSON.stringify(this.jsonData);
        this.undoStack.push(currentState);

        const nextState = this.redoStack.pop();
        this.jsonData = JSON.parse(nextState);

        this.updateJsonInPreview();
        if (this.currentEvent) {
            this.openEvent(this.currentEvent);
        }
    }

    openRequirementsEditor(answer) {
        const modal = document.getElementById('requirements-editor-modal');
        const title = document.getElementById('requirements-editor-title');
        const list = document.getElementById('requirements-items');
        const editor = document.getElementById('requirement-editor');
        const addButton = document.getElementById('add-requirement');
        const closeButton = modal.querySelector('.close-modal');
        const saveButton = document.getElementById('save-requirement');
        const cancelButton = document.getElementById('cancel-requirement');
        const typeSelect = document.getElementById('requirement-type');
        const actionSelect = document.getElementById('requirement-action');
        const subtypeInput = document.getElementById('requirement-subtype');
        const valueInput = document.getElementById('requirement-value');
        const durationInput = document.getElementById('requirement-duration');

        // Определяем тип редактора (требования или бонусы)
        const isBonus = answer.includes('bonus');
        this.isEditingBonus = isBonus;
        const listType = isBonus ? 'bonuses' : 'requirements';
        title.textContent = isBonus ? window.translator.translate('bonus_editor') : window.translator.translate('requirements_editor');

        // Получаем список требований/бонусов
        const items = this.jsonData.custom_events[this.currentEvent][listType + (answer.includes('-') ? answer.split('-')[0] : '')] || [];

        // Обновляем список типов в зависимости от режима
        typeSelect.innerHTML = '';
        if (isBonus) {
            // Для бонусов показываем только бонусы
            const bonusOptions = [
                // Экономика
                { value: '', label: '--- ' + window.translator.translate('economy') + ' ---', disabled: true },
                { value: 'money', label: window.translator.translate('money') },
                { value: 'building_cost', label: window.translator.translate('building_cost') },
                { value: 'population_income', label: window.translator.translate('population_income') },
                { value: 'population_increase', label: window.translator.translate('population_increase') },
                // { value: 'add_oil', label: window.translator.translate('add_oil') },
                { value: 'resource', label: window.translator.translate('resource') },
                { value: 'recruit_cost', label: window.translator.translate('recruit_cost') },
                { value: 'accelerated_recruit_cost', label: window.translator.translate('accelerated_recruit_cost') },
                { value: 'maintaining_army_cost_multiplier', label: window.translator.translate('maintaining_army_cost_multiplier') },

                // Военное дело
                { value: '', label: '--- ' + window.translator.translate('military') + ' ---', disabled: true },
                { value: 'defense', label: window.translator.translate('defense') },
                { value: 'attack', label: window.translator.translate('attack') },
                { value: 'army_losses', label: window.translator.translate('army_losses') },
                { value: 'add_infantry', label: window.translator.translate('add_infantry') },
                { value: 'add_shock_infantry', label: window.translator.translate('add_shock_infantry') },
                { value: 'add_artillery', label: window.translator.translate('add_artillery') },
                { value: 'add_tank', label: window.translator.translate('add_tank') },
                { value: 'add_cruiser', label: window.translator.translate('add_cruiser') },
                { value: 'add_battleship', label: window.translator.translate('add_battleship') },

                // Население и культура
                { value: '', label: '--- ' + window.translator.translate('population_and_culture') + ' ---', disabled: true },
                { value: 'population_increase', label: window.translator.translate('population_increase') },
                { value: 'add_random_culture_population', label: window.translator.translate('add_random_culture_population') },
                { value: 'add_culture_population', label: window.translator.translate('add_culture_population') },
                { value: 'discontent', label: window.translator.translate('discontent') },

                // Дипломатия
                { value: '', label: '--- ' + window.translator.translate('diplomacy') + ' ---', disabled: true },
                { value: 'relation_change', label: window.translator.translate('relation_change') },
                { value: 'relation_ideology_change', label: window.translator.translate('relation_ideology_change') },
                { value: 'diplomacy_lift_sanctions', label: window.translator.translate('diplomacy_lift_sanctions') },
                { value: 'diplomacy_sanctions', label: window.translator.translate('diplomacy_sanctions') },
                { value: 'diplomacy_pact', label: window.translator.translate('diplomacy_pact') },
                { value: 'diplomacy_alliance', label: window.translator.translate('diplomacy_alliance') },
                { value: 'diplomacy_become_vassal', label: window.translator.translate('diplomacy_become_vassal') },
                { value: 'diplomacy_get_vassal', label: window.translator.translate('diplomacy_get_vassal') },
                { value: 'diplomacy_peace', label: window.translator.translate('diplomacy_peace') },
                { value: 'diplomacy_war', label: window.translator.translate('diplomacy_war') },

                // Прочее
                { value: '', label: '--- ' + window.translator.translate('other') + ' ---', disabled: true },
                { value: 'prestige', label: window.translator.translate('prestige') },
                { value: 'science', label: window.translator.translate('science') },
                { value: 'resurrect_country', label: window.translator.translate('resurrect_country') },
                { value: 'annex_country', label: window.translator.translate('annex_country') },
                { value: 'change_country', label: window.translator.translate('change_country') }
            ];
            typeSelect.innerHTML = bonusOptions.map(opt => 
                `<option value="${opt.value}" ${opt.disabled ? 'disabled' : ''}>${opt.label}</option>`
            ).join('');
        } else {
            // Для требований показываем только требования
            const requirementOptions = [
                // Временные условия
                { value: '', label: '--- ' + window.translator.translate('time_conditions') + ' ---', disabled: true },
                { value: 'year', label: window.translator.translate('year') },
                { value: 'month', label: window.translator.translate('month') },
                { value: 'turn', label: window.translator.translate('turn') },
                { value: 'cooldown', label: window.translator.translate('cooldown') },
                { value: 'event_choice', label: window.translator.translate('event_choice') },
                { value: 'received_event', label: window.translator.translate('received_event' ) },

                // Страны и территории
                { value: '', label: '--- ' + window.translator.translate('countries_and_territories') + ' ---', disabled: true },
                { value: 'land_id', label: window.translator.translate('land_id') },
                { value: 'land_name', label: window.translator.translate('land_name') },
                { value: 'group_name', label: window.translator.translate('group_name') },
                { value: 'land_power', label: window.translator.translate('land_power') },
                { value: 'num_of_provinces', label: window.translator.translate('num_of_provinces') },
                { value: 'near_water', label: window.translator.translate('near_water') },
                { value: 'is_player', label: window.translator.translate('is_player') },
                { value: 'controls_capital', label: window.translator.translate('controls_capital') },
                { value: 'lost_capital', label: window.translator.translate('lost_capital') },
                { value: 'enemy_near_capital', label: window.translator.translate('enemy_near_capital') },
                { value: 'independent_land', label: window.translator.translate('independent_land') },
                { value: 'is_defeated', label: window.translator.translate('is_defeated') },

                // Дипломатия
                { value: '', label: '--- ' + window.translator.translate('diplomacy') + ' ---', disabled: true },
                { value: 'has_pact', label: window.translator.translate('has_pact') },
                { value: 'has_alliance', label: window.translator.translate('has_alliance') },
                { value: 'has_vassal', label: window.translator.translate('has_vassal') },
                { value: 'has_sanctions', label: window.translator.translate('has_sanctions') },
                { value: 'has_war', label: window.translator.translate('has_war') },
                { value: 'no_enemy', label: window.translator.translate('no_enemy') },

                // Экономика и развитие
                { value: '', label: '--- ' + window.translator.translate('economy_and_development') + ' ---', disabled: true },
                { value: 'money', label: window.translator.translate('money') },
                { value: 'tax', label: window.translator.translate('tax') },
                { value: 'discontent', label: window.translator.translate('discontent') },
                { value: 'building_exists', label: window.translator.translate('building_exists') },
                { value: 'political_institution', label: window.translator.translate('political_institution') },

                // Прочее
                { value: '', label: '--- ' + window.translator.translate('other') + ' ---', disabled: true },
                { value: 'random_value', label: window.translator.translate('random_value') },
                { value: 'count_of_tasks', label: window.translator.translate('count_of_tasks') }
            ];
            typeSelect.innerHTML = requirementOptions.map(opt => 
                `<option value="${opt.value}" ${opt.disabled ? 'disabled' : ''}>${opt.label}</option>`
            ).join('');
        }

        // Функция для обновления списка
        const updateList = () => {
            list.innerHTML = '';
            items.forEach((item, index) => {
                const row = document.createElement('tr');
                const config = isBonus ? window.reqbonConfig?.bonuses?.[item.type] : null;
                const showDuration = isBonus && config?.hasDuration;
                
                // Форматируем значение в зависимости от типа
                const booleanTypes = ['near_water', 'is_player', 'independent_land', 'no_enemy', 'enemy_near_capital', 'lost_capital'];
                let displayValue = item.value;
                if (booleanTypes.includes(item.type)) {
                    displayValue = item.value ? window.translator.translate('yes') : window.translator.translate('no');
                }

                // -------------------------------------------

                let tSType;
                if (typeof item.subtype === "string" && item.subtype.includes("civilization")) {
                    tSType = window.eventManager.jsonData.lands[item.subtype]?.name ?? item.subtype;
                } else {
                    tSType = item.subtype ?? "";
                }

                let tAction;
                if (typeof item.action === "string" && item.action.includes("civilization")) {
                    tAction = window.eventManager.jsonData.lands[item.action]?.name ?? item.action;
                } else {
                    tAction = window.translator.translate(item.action) ?? "";
                }

                let tValue;
                if (typeof displayValue === "string" && displayValue.includes("civilization")) {
                    tValue = window.eventManager.jsonData.lands[displayValue]?.name ?? displayValue;
                } else {
                    tValue = displayValue ?? "";
                }

                // -------------------------------------------
                
                row.innerHTML = `
                    <td>${window.translator.translate(item.type)}</td>
                    <td>${tSType || ''}</td>
                    <td>${isBonus ? (item.duration ? `${item.duration} turns` : '') : (tAction || '')}</td>
                    <td>${tValue}</td>
                    <td>
                        <div class="requirement-actions">
                            <button type="button" class="edit" data-index="${index}">✎</button>
                            <button type="button" class="delete" data-index="${index}">×</button>
                        </div>
                    </td>
                `;
                row.addEventListener('click', () => {
                    // При клике на строку — заполняем форму текущими значениями
                    if (typeSelect) typeSelect.value = item.type || '';
                    if (actionSelect) actionSelect.value = item.action || '';
                    if (subtypeInput) subtypeInput.value = item.subtype || '';
                    if (valueInput) valueInput.value = item.value || '';
                    if (durationInput && typeof item.duration !== 'undefined') durationInput.value = item.duration;
                });
                list.appendChild(row);
            });
        };

        // Функция для обновления доступных действий в зависимости от типа
        const updateActions = () => {
            const actionSelect = document.getElementById('requirement-action');
            const durationInput = document.getElementById('requirement-duration');
            const selectedType = typeSelect.value;
            const actions = [];

            if (isBonus) {
                // Для бонусов скрываем действия
                actionSelect.parentElement.style.display = 'none';
                
                // Проверяем конфигурацию бонуса для отображения длительности
                const config = window.reqbonConfig?.bonuses?.[selectedType];
                if (durationInput && config) {
                    durationInput.parentElement.style.display = config.hasDuration ? 'block' : 'none';
                    if (config.hasDuration) {
                        durationInput.value = config.defaultDuration || 3;
                    }
                }
            } else {
                // Для требований показываем действия и скрываем длительность
                actionSelect.parentElement.style.display = 'block';
                if (durationInput) {
                    durationInput.parentElement.style.display = 'none';
                }
                
                // Получаем доступные действия из конфигурации
                if (['month', 'num_of_provinces', 'year', 'turn', 'random_value', 'count_of_tasks', 'tax', 'discontent', 'money', 'land_power'].includes(selectedType)) {
                    actions.push('more', 'equal', 'less');
                } else if (['near_water', 'is_player', 'has_pact', 'has_alliance', 'has_vassal', 'has_sanctions', 'has_war', 'independent_land', 'land_name', 'building_exists', 'land_id', "group_name", 'political_institution', 'enemy_near_capital', 'is_defeated', 'lost_capital', "controls_capital", "received_event"].includes(selectedType)) {
                    actions.push('equal', 'not_equal');
                } else if (['cooldown'].includes(selectedType)) {
                    actions.push('more', 'less');
                    
                    // Создаем выпадающий список событий для подтипа
                    const subtypeGroup = document.querySelector('[for="requirement-subtype"]').parentElement;
                    subtypeGroup.style.display = 'block';
                    
                    const subtypeInput = document.getElementById('requirement-subtype');
                    const select = document.createElement('select');
                    select.id = 'requirement-subtype';
                    select.className = 'main-page-input';
                    
                    // Получаем список всех событий
                    const events = Object.entries(this.jsonData.custom_events || {}).map(([id, event]) => ({
                        id,
                        name: event.unique_event_name || event.title || id
                    }));
                    
                    // Сортируем события по имени
                    events.sort((a, b) => a.name.localeCompare(b.name));
                    
                    // Создаем опции для выпадающего списка
                    select.innerHTML = events.map(event => 
                        `<option value="${event.id}">${event.id} - ${event.name}${event.systemName ? ` (${event.systemName})` : ''}</option>`
                    ).join('');
                    
                    // Заменяем текстовое поле на выпадающий список
                    subtypeInput.parentNode.replaceChild(select, subtypeInput);
                    
                    // Создаем числовое поле для значения
                    const valueContainer = document.getElementById('requirement-value-container');
                    valueContainer.innerHTML = '';
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.id = 'requirement-value';
                    input.className = 'main-page-input';
                    input.placeholder = window.translator.translate('enter_number');
                    valueContainer.appendChild(input);
                } else if (['event_choice'].includes(selectedType)) {
                    actions.push('equal', 'not_equal');
                
                    // Создаем выпадающий список событий для подтипа
                    const subtypeGroup = document.querySelector('[for="requirement-subtype"]').parentElement;
                    subtypeGroup.style.display = 'block';
                
                    const subtypeInput = document.getElementById('requirement-subtype');
                    const select = document.createElement('select');
                    select.id = 'requirement-subtype';
                    select.className = 'main-page-input';
                
                    // Получаем список всех событий
                    const events = Object.entries(this.jsonData.custom_events || {}).map(([id, event]) => ({
                        id,
                        name: event.unique_event_name || event.title || id
                    }));
                
                    // Сортируем события по имени
                    events.sort((a, b) => a.name.localeCompare(b.name));
                
                    // Создаем опции для выпадающего списка
                    select.innerHTML = events.map(event =>
                        `<option value="${event.id}">${event.id} - ${event.name}${event.systemName ? ` (${event.systemName})` : ''}</option>`
                    ).join('');
                
                    // Заменяем текстовое поле на выпадающий список
                    subtypeInput.parentNode.replaceChild(select, subtypeInput);
                
                    // Создаем выпадающий список для значения (1, 2, 3)
                    const valueContainer = document.getElementById('requirement-value-container');
                    valueContainer.innerHTML = '';
                
                    const valueSelect = document.createElement('select');
                    valueSelect.id = 'requirement-value';
                    valueSelect.className = 'main-page-input';
                    valueSelect.innerHTML = `
                        <option value="1">${window.translator.translate('answer')} 1</option>
                        <option value="2">${window.translator.translate('answer')} 2</option>
                        <option value="3">${window.translator.translate('answer')} 3</option>
                    `;
                    valueContainer.appendChild(valueSelect);
                } else if (['received_event'].includes(selectedType)) {
                    actions.push('equal', 'not_equal');

                    // Создаем выпадающий список стран для subtype
                    const subtypeGroup = document.querySelector('[for="requirement-subtype"]').parentElement;
                    subtypeGroup.style.display = 'block';
                    
                    const subtypeInput = document.getElementById('requirement-subtype');
                    const subtypeSelect = document.createElement('select');
                    subtypeSelect.id = 'requirement-subtype';
                    subtypeSelect.className = 'main-page-input';
                    
                    // Получаем список стран и сортируем по имени
                    const countries = Object.entries(this.jsonData.lands || {})
                        .map(([id, country]) => ({
                            id,
                            name: country.name || id
                        }))
                        .sort((a, b) => a.name.toString().toUpperCase().localeCompare(b.name.toString().toUpperCase()));
                    
                    // Создаем опции для выпадающего списка с any и this
                    subtypeSelect.innerHTML = `
                        <option value="this">${window.translator.translate('this')}</option>
                        <option value="any">${window.translator.translate('any')}</option>
                        ${countries.map(country => 
                            `<option value="${country.id}">${country.name}</option>`
                        ).join('')}
                    `;
                    
                    // Заменяем текстовое поле на выпадающий список
                    if (subtypeInput) {
                        subtypeInput.parentNode.replaceChild(subtypeSelect, subtypeInput);
                    }
                    
                    // Создаем выпадающий список событий для value
                    const select = document.createElement('select');
                    select.id = 'requirement-value';
                    select.className = 'main-page-input';
                    
                    // Получаем список всех событий
                    const events = Object.entries(this.jsonData.custom_events || {}).map(([id, event]) => ({
                        id,
                        name: event.unique_event_name || event.title || id
                    }));
                    
                    // Сортируем события по имени
                    events.sort((a, b) => a.name.localeCompare(b.name));
                    
                    // Создаем опции для выпадающего списка
                    select.innerHTML = events.map(event => 
                        `<option value="${event.id}">${event.id} - ${event.name}</option>`
                    ).join('');
                    
                    valueContainer.appendChild(select);
                } else if (['no_enemy'].includes(selectedType)) {
                    actions.push('equal');
                }
            }

            if (['event_choice'].includes(selectedType)) {
                // Создаем выпадающий список для стран
                const select = document.createElement('select');
                select.id = 'requirement-action';
                select.className = 'main-page-input';

                // Получаем список стран и сортируем по имени
                const countries = Object.entries(JSON.parse(document.getElementById('preview-content').value).lands || {})
                    .map(([id, country]) => ({
                        id,
                        name: country.name || id
                    }))
                    .sort((a, b) => a.name.toString().toUpperCase().localeCompare(b.name.toString().toUpperCase()));

                // Создаем опции для выпадающего списка
                select.innerHTML = countries.map(country => 
                    `<option value="${country.id}">${country.name}</option>`
                ).join('');

                // Заменяем оригинальный элемент на новый выпадающий список
                const actionSelect = document.getElementById('requirement-action');
                actionSelect.parentNode.replaceChild(select, actionSelect);
            } else {
                actionSelect.innerHTML = actions.map(action => `
                    <option value="${action}">${
                        action === 'more' ? window.translator.translate('more') :
                        action === 'equal' ? window.translator.translate('equal') :
                        action === 'not_equal' ? window.translator.translate('not_equal') :
                        action === 'less' ? window.translator.translate('less') : action
                    }</option>
                `).join('');
            }
        };

        // Функция для обновления поля значения в зависимости от типа
        const updateValueField = () => {
            const valueContainer = document.getElementById('requirement-value-container');
            const subtypeLabel = document.querySelector('[for="requirement-subtype"]');
            const subtypeGroup = subtypeLabel ? subtypeLabel.parentElement : null;
            const selectedType = document.getElementById('requirement-type').value;
            const durationInput = document.getElementById('requirement-duration');

            // Очищаем контейнер
            if (valueContainer) {
                valueContainer.innerHTML = '';
            }

            if (!subtypeGroup) {
                console.warn('Subtype group element not found');
                return;
            }

            if (this.isEditingBonus) {
                if (durationInput) {
                    if (window.reqbonConfig?.bonuses?.[selectedType]?.hasDuration) {
                        durationInput.parentElement.style.display = 'block';
                    } else {
                        durationInput.parentElement.style.display = 'none';
                    }
                }
                // Новые бонусы
                if (['accelerated_recruit_cost', 'maintaining_army_cost_multiplier', 'population_increase', 'recruit_cost'].includes(selectedType)) {
                    // Для процентных значений с длительностью
                    subtypeGroup.style.display = 'none';
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.id = 'requirement-value';
                    input.className = 'main-page-input';
                    input.placeholder = window.translator.translate('enter_percent');
                    valueContainer.appendChild(input);
                } else if (selectedType === 'change_country') {
                    // Для выбора страны без длительности
                    subtypeGroup.style.display = 'none';
                    const select = document.createElement('select');
                    select.id = 'requirement-value';
                    select.className = 'main-page-input';
                            const countries = Object.entries(this.jsonData.lands || {}).map(([id, country]) => ({
                                id,
                                name: country.name
                            })).sort((a, b) => a.name.localeCompare(b.name));;
                            select.innerHTML = countries.map(country => 
                                `<option value="${country.id}">${country.name}</option>`
                            ).join('');
                    valueContainer.appendChild(select);
                } else if (selectedType === 'add_culture_population') {
                    // Для добавления населения культуры с подтипом страны
                    subtypeGroup.style.display = 'block';
                    const subtypeInput = document.getElementById('requirement-subtype');

                    // Создаем выпадающий список для стран
                    const countrySelect = document.createElement('select');
                    countrySelect.id = 'requirement-subtype';
                    countrySelect.className = 'main-page-input';

                    // Получаем и сортируем список стран по имени
                    const countries = Object.entries(this.jsonData.lands || {}).map(([id, country]) => ({
                        id,
                        name: country.name
                    })).sort((a, b) => a.name.localeCompare(b.name));

                    // Заполняем выпадающий список
                    countrySelect.innerHTML = countries.map(country =>
                        `<option value="${country.id}">${country.name}</option>`
                    ).join('');

                    // Заменяем текстовое поле на выпадающий список
                    subtypeInput.parentNode.replaceChild(countrySelect, subtypeInput);

                    // Добавляем поле для числового значения
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.id = 'requirement-value';
                    input.className = 'main-page-input';
                    input.placeholder = window.translator.translate('enter_number');
                    valueContainer.appendChild(input);
                } else if (['resurrect_country', 'annex_country'].includes(selectedType)) {
                    // Существующая логика для старых бонусов
                        const select = document.createElement('select');
                        select.id = 'requirement-value';
                        select.className = 'main-page-input';
                        const countries = Object.entries(this.jsonData.lands || {}).map(([id, country]) => ({
                            id,
                            name: country.name
                        })).sort((a, b) => a.name.localeCompare(b.name));;
                        select.innerHTML = countries.map(country => 
                            `<option value="${country.id}">${country.name}</option>`
                        ).join('');
                        valueContainer.appendChild(select);
                    subtypeGroup.style.display = 'none';
                } else if (['diplomacy_lift_sanctions', 'diplomacy_sanctions', 'diplomacy_pact', 'diplomacy_become_vassal', 'diplomacy_get_vassal', 'diplomacy_alliance', 'diplomacy_peace', 'diplomacy_war'].includes(selectedType)) {
                    // Для дипломатических действий страна выбирается в subtype
                    subtypeGroup.style.display = 'block';
                    const subtypeInput = document.getElementById('requirement-subtype');
                    
                    // Создаем выпадающий список для стран в subtype
                    const countrySelect = document.createElement('select');
                    countrySelect.id = 'requirement-subtype';
                    countrySelect.className = 'main-page-input';
                    
                    // Получаем список стран и сортируем по названию (без учета регистра)
                    const countries = Object.entries(this.jsonData.lands || {})
                        .map(([id, country]) => ({
                            id,
                            name: country.name || id
                        }))
                        .sort((a, b) => a.name.toString().toUpperCase().localeCompare(b.name.toString().toUpperCase()));
                    
                    // Создаем опции для выпадающего списка с any и this
                    countrySelect.innerHTML = `
                        ${countries.map(country => 
                            `<option value="${country.id}">${country.name}</option>`
                        ).join('')}
                    `;
                    
                    // Заменяем текстовое поле на выпадающий список
                    subtypeInput.parentNode.replaceChild(countrySelect, subtypeInput);
                
                    // Для value устанавливаем значение по умолчанию true
                    const valueInput = document.createElement('input');
                    valueInput.type = 'hidden';
                    valueInput.id = 'requirement-value';
                    valueInput.value = 'true';
                    valueContainer.appendChild(valueInput);
                } else if (['relation_ideology_change'].includes(selectedType)) {
                    // Для изменения идеологии
                    subtypeGroup.style.display = 'block';
                    const subtypeInput = document.getElementById('requirement-subtype');
                    // Создаем выпадающий список для идеологий
                    const ideologySelect = document.createElement('select');
                    ideologySelect.id = 'requirement-subtype';
                    ideologySelect.className = 'main-page-input';
                    const ideologies = [
                        "Democracy",
                        "Monarchy",
                        "Communism",
                        "Fascism",
                        "Theocracy",
                        "Trade_republic"
                    ];
                    ideologySelect.innerHTML = ideologies.map(ideology => 
                        `<option value="${ideology}">${ideology}</option>`
                    ).join('');
                    // Заменяем текстовое поле на выпадающий список
                    subtypeInput.parentNode.replaceChild(ideologySelect, subtypeInput);

                    const input = document.createElement('input');
                    input.type = 'number';
                    input.id = 'requirement-value';
                    input.className = 'main-page-input';
                    input.placeholder = window.translator.translate('enter_number');
                    valueContainer.appendChild(input);
                } else if (['relation_change'].includes(selectedType)) {
                    // Для изменения отношений
                    subtypeGroup.style.display = 'block';
                    const subtypeInput = document.getElementById('requirement-subtype');
                    // Создаем выпадающий список для стран
                    const countrySelect = document.createElement('select');
                    countrySelect.id = 'requirement-subtype';
                    countrySelect.className = 'main-page-input';
                    const countries = Object.entries(this.jsonData.lands || {}).map(([id, country]) => ({
                        id,
                        name: country.name
                    })).sort((a, b) => a.name.localeCompare(b.name));;
                    countrySelect.innerHTML = countries.map(country => 
                        `<option value="${country.id}">${country.name}</option>`
                            ).join('');
                    // Заменяем текстовое поле на выпадающий список
                    subtypeInput.parentNode.replaceChild(countrySelect, subtypeInput);

                    const input = document.createElement('input');
                    input.type = 'number';
                    input.id = 'requirement-value';
                    input.className = 'main-page-input';
                    input.placeholder = window.translator.translate('enter_percent');
                    valueContainer.appendChild(input);
                } else if (['defense', 'attack', 'population_income', 'population_increase', 'building_cost'].includes(selectedType)) {
                    // Для процентных значений
                    subtypeGroup.style.display = 'none';
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.id = 'requirement-value';
                    input.className = 'main-page-input';
                    input.placeholder = window.translator.translate('enter_percent');
                    valueContainer.appendChild(input);
                } else if (['add_oil', 'add_cruiser', 'add_random_culture_population', 'add_shock_infantry', 'discontent', 'add_tank', 'add_artillery', 'army_losses', 'prestige', 'add_battleship', 'add_infantry', 'science', 'money'].includes(selectedType)) {
                    // Для числовых значений без длительности
                    subtypeGroup.style.display = 'none';
                        const input = document.createElement('input');
                        input.type = 'number';
                        input.id = 'requirement-value';
                        input.className = 'main-page-input';
                        input.placeholder = window.translator.translate('enter_number');
                        valueContainer.appendChild(input);
                } else if (['cooldown'].includes(selectedType)) {
                    // Для числовых значений без длительности
                    subtypeGroup.style.display = 'none';
                        const input = document.createElement('input');
                        input.type = 'number';
                        input.id = 'requirement-value';
                        input.className = 'main-page-input';
                        input.placeholder = window.translator.translate('enter_number');
                        valueContainer.appendChild(input);
                } else if (selectedType === 'resource') {
                    // Для ресурсов - dropdown в subtype и числовое поле в value
                    subtypeGroup.style.display = 'block';
                    const subtypeInput = document.getElementById('requirement-subtype');
                    
                    // Создаем выпадающий список для типов ресурсов
                    const resourceSelect = document.createElement('select');
                    resourceSelect.id = 'requirement-subtype';
                    resourceSelect.className = 'main-page-input';
                    
                    const resources = [
                        'gold',
                        'iron',
                        'oil',
                        'steel',
                        'uranium',
                        'wood',
                        'cartridges',
                        'chemical_weapon',
                        'heavy_water',
                        'nuclear_weapon'
                    ];
                    
                    resourceSelect.innerHTML = resources.map(resource => 
                        `<option value="${resource}">${window.translator.translate(resource) || resource}</option>`
                    ).join('');
                    
                    // Заменяем текстовое поле на выпадающий список
                    subtypeInput.parentNode.replaceChild(resourceSelect, subtypeInput);

                    // Создаем числовое поле для значения
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.id = 'requirement-value';
                    input.className = 'main-page-input';
                    input.placeholder = window.translator.translate('enter_number');
                    valueContainer.appendChild(input);
                }
            } else {
                // Для требований оставляем существующую логику
                if (['near_water', 'is_player', 'independent_land', 'no_enemy', 'enemy_near_capital', 'lost_capital'].includes(selectedType)) {
                        valueContainer.innerHTML = `
                            <select id="requirement-value" class="main-page-input">
                        <option value='true'>${window.translator.translate('yes')}</option>
                        <option value='false'>${window.translator.translate('no')}</option>
                            </select>
                        `;
                    subtypeGroup.style.display = 'none';
                } else if (['political_institution'].includes(selectedType)) {
                    // Для политических институтов
                    const select = document.createElement('select');
                    select.id = 'requirement-value';
                    select.className = 'main-page-input';
                    const institutions = [
                        "Aviation I",
                        "Aviation II",
                        "Blue Blood",
                        "Blue Bones",
                        "Communism",
                        "Conservatism I",
                        "Conservatism II",
                        "Control I",
                        "Control II",
                        "Democracy",
                        "Development of Trade Routes",
                        "Devotion",
                        "Dynasty",
                        "Empire I",
                        "Empire II",
                        "Fascism",
                        "Five-Year Plan",
                        "Fleet I",
                        "Fleet II",
                        "Freedom of Speech",
                        "Globalization I",
                        "Globalization II",
                        "Grinder I",
                        "Grinder II",
                        "Humility I",
                        "Humility II",
                        "Metropolis I",
                        "Metropolis II",
                        "Monarchy",
                        "Nationalism I",
                        "Nationalism II",
                        "Occultism",
                        "Permanent Revolution I",
                        "Permanent Revolution II",
                        "Propaganda",
                        "Religion",
                        "Revanchism I",
                        "Revanchизм II",
                        "Science I",
                        "Science II",
                        "Scientific Program",
                        "Socialism I",
                        "Socialism II",
                        "Standardization",
                        "Superiority I",
                        "Superiority II",
                        "Theocracy",
                        "Trade Agreement",
                        "Trade Republic",
                        "Traditions I",
                        "Traditions II",
                        "War Communism I",
                        "War Communism II",
                        "Xenophobia"
                    ];
                    select.innerHTML = institutions.map(inst => 
                        `<option value="${inst}">${inst}</option>`
                    ).join('');
                    valueContainer.appendChild(select);
                    subtypeGroup.style.display = 'none'; // Скрываем поле subtype
                } else if (['land_id', 'is_defeated'].includes(selectedType)) {
                    const select = document.createElement('select');
                    select.id = 'requirement-value';
                    select.className = 'main-page-input';

                    // Добавляем опцию "any" первой
                    select.innerHTML = `<option value="any">${window.translator.translate('any')}</option>`;

                    // Получаем список стран и сортируем его по имени
                    const countries = Object.entries(this.jsonData.lands || {})
                        .map(([id, country]) => ({
                            id,
                            name: country.name || id
                        }))
                        .sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()));

                    // Добавляем остальные опции
                    select.innerHTML += countries.map(country => 
                        `<option value="${country.id}">${country.name || country.id}</option>`
                    ).join('');

                    valueContainer.appendChild(select);
                    subtypeGroup.style.display = 'none';
                } else if (['controls_capital', 'has_pact', 'has_alliance', 'has_vassal', 'has_sanctions', 'has_war'].includes(selectedType)) {
                    // Создаем селект для value
                    const select = document.createElement('select');
                    select.id = 'requirement-value';
                    select.className = 'main-page-input';

                    // Создаем селект для subtype
                    const subtypeSelect = document.createElement('select');
                    subtypeSelect.id = 'requirement-subtype';
                    subtypeSelect.className = 'main-page-input';

                    // Получаем список стран и сортируем его по имени
                    const countries = Object.entries(this.jsonData.lands || {})
                        .map(([id, country]) => ({
                            id,
                            name: country.name || id
                        }))
                        .sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()));

                    // Создаем базовые опции для обоих селектов
                    const baseOptions = `
                        <option value="any">${window.translator.translate('any')}</option>
                        <option value="this">${window.translator.translate('this')}</option>
                        ${countries.map(country => 
                            `<option value="${country.id}">${country.name || country.id}</option>`
                        ).join('')}
                    `;

                    select.innerHTML = baseOptions;
                    subtypeSelect.innerHTML = baseOptions;

                    valueContainer.appendChild(select);
                    
                    // Заменяем существующий subtype input новым селектом
                    const subtypeInput = document.getElementById('requirement-subtype');
                    subtypeInput.parentNode.replaceChild(subtypeSelect, subtypeInput);
                    
                    subtypeGroup.style.display = 'block';
                } else if (['group_name'].includes(selectedType)) {
                    // Очищаем контейнер перед созданием нового списка
                    valueContainer.innerHTML = '';

                    // Получаем актуальные группы из данных
                    const groups = new Set();
                    Object.values(this.jsonData.lands || {}).forEach(country => {
                        if (country.group_name && typeof country.group_name === 'string') {
                            // Разбиваем строку групп по запятой и добавляем каждую группу отдельно
                            country.group_name.split(',').forEach(group => {
                                const trimmedGroup = group.trim();
                                if (trimmedGroup) {
                                    groups.add(trimmedGroup);
                                }
                            });
                        }
                    });

                    // Создаем новый select элемент
                    const select = document.createElement('select');
                    select.id = 'requirement-value';
                    select.className = 'main-page-input';

                    // Формируем все опции сразу через шаблонную строку, сортируем группы по алфавиту
                    select.innerHTML = `
                        <option value="">[${window.translator.translate('empty_group')}]</option>
                        ${Array.from(groups)
                            .sort((a, b) => a.localeCompare(b))
                            .map(group => `<option value="${group}">${group}</option>`)
                            .join('')}
                    `;
                    // Добавляем список в контейнер
                    valueContainer.appendChild(select);
                    subtypeGroup.style.display = 'none';
                } else if (['land_name'].includes(selectedType)) {
                    // Создаем контейнер для инпута и кнопки
                    const inputGroup = document.createElement('div');
                    inputGroup.className = 'input-group';
                    
                    // Создаем текстовое поле
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.id = 'requirement-value';
                    input.className = 'main-page-input';
                    input.placeholder = window.translator.translate('enter_country_name');
                    
                    // Создаем кнопку для открытия выпадающего списка
                    const dropdownButton = document.createElement('button');
                    dropdownButton.type = 'button';
                    dropdownButton.className = 'dropdown-button';
                    dropdownButton.innerHTML = '▼';
                    
                    // Создаем выпадающий список
                    const dropdown = document.createElement('select');
                    dropdown.className = 'country-dropdown';
                    dropdown.style.display = 'none';

                    // Получаем список стран и сортируем их по имени
                    const countries = Object.entries(this.jsonData.lands || {})
                        .map(([id, country]) => ({
                            id,
                            name: country.name || id
                        }))
                        .sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()));

                    // Добавляем опции в выпадающий список
                    dropdown.innerHTML = countries.map(country => 
                        `<option value="${country.name}">${country.name}</option>`
                    ).join('');
                    
                    // Добавляем обработчики событий
                    dropdownButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const isVisible = dropdown.style.display === 'block';
                        dropdown.style.display = isVisible ? 'none' : 'block';
                    });
                    
                    dropdown.addEventListener('change', () => {
                        input.value = dropdown.value;
                        dropdown.style.display = 'none';
                        // Вызываем событие input для обновления данных
                        input.dispatchEvent(new Event('input'));
                    });
                    
                    document.addEventListener('click', (e) => {
                        if (!inputGroup.contains(e.target)) {
                            dropdown.style.display = 'none';
                        }
                    });

                    // Добавляем все элементы в группу
                    inputGroup.appendChild(input);
                    inputGroup.appendChild(dropdownButton);
                    inputGroup.appendChild(dropdown);
                    valueContainer.appendChild(inputGroup);
                    
                    subtypeGroup.style.display = 'none';
                } else if (['received_event'].includes(selectedType)) {
                    subtypeGroup.style.display = 'block';
                    
                    // Создаем выпадающий список для subtype
                    const subtypeInput = document.getElementById('requirement-subtype');
                    const subtypeSelect = document.createElement('select');
                    subtypeSelect.id = 'requirement-subtype';
                    subtypeSelect.className = 'main-page-input';

                    // Получаем список стран и сортируем по имени
                    const countries = Object.entries(this.jsonData.lands || {})
                        .map(([id, country]) => ({
                            id,
                            name: country.name || id
                        }))
                        .sort((a, b) => a.name.toString().toUpperCase().localeCompare(b.name.toString().toUpperCase()));

                    // Создаем опции для выпадающего списка с any и this
                    subtypeSelect.innerHTML = `
                        <option value="any">${window.translator.translate('any')}</option>
                        <option value="this">${window.translator.translate('this')}</option>
                        ${countries.map(country => 
                            `<option value="${country.id}">${country.name}</option>`
                        ).join('')}
                    `;

                    // Заменяем текущее поле ввода на выпадающий список
                    if (subtypeInput) {
                        subtypeInput.parentNode.replaceChild(subtypeSelect, subtypeInput);
                    }

                    // Создаем выпадающий список событий для value
                    const select = document.createElement('select');
                    select.id = 'requirement-value';
                    select.className = 'main-page-input';
                    
                    // Получаем список всех событий
                    const events = Object.entries(this.jsonData.custom_events || {}).map(([id, event]) => ({
                        id,
                        name: event.unique_event_name || event.title || id
                    }));
                    
                    // Сортируем события по имени
                    events.sort((a, b) => a.name.localeCompare(b.name));
                    
                    // Создаем опции для выпадающего списка
                    select.innerHTML = events.map(event => 
                        `<option value="${event.id}">${event.id} - ${event.name}</option>`
                    ).join('');
                    
                    valueContainer.appendChild(select);
                } else {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.id = 'requirement-value';
                    input.className = 'main-page-input';
                    input.placeholder = 
                        ['month', 'num_of_provinces', 'year', 'turn', 'random_value', 'count_of_tasks', 'tax', 'discontent', 'money', 'land_power'].includes(selectedType) ? window.translator.translate('enter_number') :
                        ['building_exists'].includes(selectedType) ? window.translator.translate('enter_building_name') :
                        ['political_institution'].includes(selectedType) ? window.translator.translate('enter_institution_name') : window.translator.translate('enter_value');
                        valueContainer.appendChild(input);
                        subtypeGroup.style.display = selectedType === 'building_exists' || selectedType === 'political_institution' || selectedType === 'event_choice' || selectedType === 'cooldown' ? 'block' : 'none';
                }
            }
        };

        // Обработчики событий
        typeSelect.addEventListener('change', () => {
            updateActions();
            updateValueField();
        });

        addButton.onclick = () => {
            editor.style.display = 'block';
            document.getElementById('requirement-type').value = '';
            document.getElementById('requirement-action').value = '';
            document.getElementById('requirement-subtype').value = '';
            updateActions();
            updateValueField();
        };

        list.onclick = (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const index = parseInt(button.dataset.index);
            if (button.classList.contains('edit')) {
                const item = items[index];
                editor.style.display = 'block';
                document.getElementById('requirement-type').value = item.type;
                // Сначала обновляем тип, чтобы создались нужные поля
                updateActions();
                updateValueField();
                // Теперь выставляем значения для всех полей (action, subtype, value, duration)
                const actionInput = document.getElementById('requirement-action');
                if (actionInput && typeof item.action !== 'undefined') actionInput.value = item.action;
                const subtypeInput = document.getElementById('requirement-subtype');
                if (subtypeInput && typeof item.subtype !== 'undefined') subtypeInput.value = item.subtype;
                const valueInput = document.getElementById('requirement-value');
                if (valueInput && typeof item.value !== 'undefined') valueInput.value = item.value;
                if (isBonus && document.getElementById('requirement-duration')) {
                    document.getElementById('requirement-duration').value = item.duration || 3;
                }
                editor.dataset.editIndex = index;
            } else if (button.classList.contains('delete')) {
                items.splice(index, 1);
                updateList();
                this.saveChanges();
            }
        };

        saveButton.onclick = () => {
            const type = document.getElementById('requirement-type').value;
            const action = isBonus ? '' : document.getElementById('requirement-action').value;
            const subtype = document.getElementById('requirement-subtype').value;
            let value = document.getElementById('requirement-value').value;
            let duration;
            
            // Проверяем конфигурацию бонуса для длительности
            const config = isBonus ? window.reqbonConfig?.bonuses?.[type] : null;
            
            if (isBonus) {
                const durationElement = document.getElementById('requirement-duration');
                if (durationElement) {
                    let durationValue = durationElement.value;
                    // Удаляем кавычки и пробелы с начала и конца
                    durationValue = durationValue.replace(/^["']|["']$/g, '').trim();
                    // Преобразуем в число
                    duration = parseInt(durationValue) || config?.defaultDuration || 3;
                }
            }

            if (!type || !value || (isBonus && config?.hasDuration && !duration)) {
                console.warn('Не все обязательные поля заполнены');
                return;
            }

            // Проверяем и обрабатываем числовые значения
            const numericTypes = ['month', 'num_of_provinces', 'year', 'turn', 'random_value', 
                'count_of_tasks', 'tax', 'discontent', 'money', 'land_power', 'defense', 
                'attack', 'population_income', 'population_increase', 'building_cost', 'add_oil', 'add_cruiser', 
                'add_random_culture_population', 'add_shock_infantry', 'add_tank', 'add_artillery',
                'army_losses', 'prestige', 'add_battleship', 'add_infantry', 'science', 'cooldown'];

            // Проверяем и обрабатываем булевы значения
            const booleanTypes = ['near_water', 'is_player', 'independent_land', 'no_enemy', 'enemy_near_capital', 'lost_capital'];

            if (numericTypes.includes(type)) {
                // Удаляем кавычки и пробелы с начала и конца
                value = value.replace(/^["']|["']$/g, '').trim();
                // Проверяем, является ли значение числом
                if (!isNaN(value)) {
                    value = Number(value);
                }
            } else if (booleanTypes.includes(type)) {
                // Для булевых значений преобразуем строку в булево значение
                value = value === 'true';
            }

            const item = {
                type,
                action: isBonus ? undefined : action,
                subtype: subtype || undefined,
                value,
                duration: isBonus ? duration : undefined
            };

            const editIndex = editor.dataset.editIndex;
            if (editIndex !== undefined) {
                items[editIndex] = item;
                delete editor.dataset.editIndex;
            } else {
                items.push(item);
            }

            editor.style.display = 'none';
            updateList();
            this.saveChanges();
        };

        cancelButton.onclick = () => {
            editor.style.display = 'none';
            delete editor.dataset.editIndex;
        };

        closeButton.onclick = () => {
            modal.classList.remove('active');
        };

        // Инициализация
        updateList();
        updateActions();
        updateValueField();
        editor.style.display = 'none';
        modal.classList.add('active');
    }

    loadAvailableImages() {
        // TODO: Загрузить список доступных изображений и иконок
        const imageSelect = document.getElementById('event-image');
        const iconSelect = document.getElementById('event-icon');

        if (imageSelect) {
            // Временный список изображений
            const images = ['diplomacy', 'war', 'economy', 'culture'];
            imageSelect.innerHTML = images.map(img => 
                `<option value="${img}">${img}</option>`
            ).join('');
        }

        if (iconSelect) {
            // Временный список иконок
            const icons = ['diplomacy', 'war', 'economy', 'culture'];
            iconSelect.innerHTML = icons.map(icon => 
                `<option value="${icon}">${icon}</option>`
            ).join('');
        }
    }

    backToEventsList() {
        // Переключаемся на страницу списка событий
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById('events').classList.add('active');
    }

    showGroupFilterModal() {
        console.log('Открытие модального окна фильтра групп');
        const modal = document.getElementById('groups-filter-modal');
        if (!modal) {
            console.error('Модальное окно фильтра групп не найдено');
            return;
        }

        const groupsList = document.getElementById('groups-filter-list');
        if (!groupsList) {
            console.error('Список групп не найден');
            return;
        }

        // Получаем все уникальные группы
        const groups = new Set();
        if (!this.jsonData?.custom_events) {
            console.warn('Нет данных о событиях');
            return;
        }

        Object.values(this.jsonData.custom_events).forEach(event => {
            if (event.group_name) {
                // Разбиваем по запятым с любым количеством пробелов вокруг
                event.group_name.split(/\s*,\s*/).forEach(group => {
                    if (group) groups.add(group);
                });
            }
        });

        console.log('Найдено групп:', groups.size);

        // Сортируем группы по алфавиту
        const sortedGroups = Array.from(groups).sort();

        // Создаем чекбоксы для каждой группы
        groupsList.innerHTML = sortedGroups.map(group => {
            const isChecked = this.filters.groups?.includes(group);
            console.log(`Группа ${group}, выбрана: ${isChecked}`);
            return `
                <div class="group-checkbox-item">
                    <input type="checkbox" id="group-${group}" value="${group}"
                           ${isChecked ? 'checked' : ''}>
                    <label for="group-${group}">${group}</label>
                </div>
            `;
        }).join('');

        // Обработчики кнопок
        const applyButton = modal.querySelector('#groups-filter-apply');
        const clearButton = modal.querySelector('#groups-filter-clear');
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
            
            if (checkedGroups.length > 0) {
                this.filters.groups = checkedGroups;
            } else {
                delete this.filters.groups;
            }
            
            console.log('Обновленные фильтры:', this.filters);
            this.updateEventsList();
            modal.classList.remove('active');
        });

        newClearButton.addEventListener('click', () => {
            delete this.filters.groups;
            this.updateEventsList();
            modal.classList.remove('active');
        });

        newCloseButton.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        // Добавляем обработчик клавиши Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                modal.classList.remove('active');
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Показываем модальное окно
        modal.classList.add('active');
    }

    showFilterModal(column) {
        const modal = document.getElementById('events-filter-modal');
        const title = modal.querySelector('.modal-title');
        const operatorSelect = document.getElementById('events-filter-operator');
        const valueContainer = document.getElementById('events-filter-value-container');

        // Устанавливаем заголовок
        title.textContent = `${window.translator.translate('filter')}: ${this.getColumnTitle(column)}`;

        // Настраиваем операторы
        operatorSelect.innerHTML = `
            <option value="equals">${window.translator.translate('filter_equals')}</option>
            <option value="not_equals">${window.translator.translate('filter_not_equals')}</option>
            <option value="contains">${window.translator.translate('filter_contains')}</option>
        `;

        // Создаем поле ввода в зависимости от типа колонки
        let inputType = 'text'; // По умолчанию текстовое поле
        let placeholder = 'filter_text_value';
        
        // Числовые колонки
        if (['order', 'year', 'duration'].includes(column)) {
            inputType = 'number';
            placeholder = 'filter_number_value';
        }

        valueContainer.innerHTML = `
            <input type="${inputType}" id="events-filter-value" class="main-page-input" 
                   placeholder="${window.translator.translate(placeholder)}"
                   ${inputType === 'number' ? 'min="0"' : ''}>
        `;

        // Устанавливаем текущие значения фильтра, если они есть
        if (this.filters[column]) {
            operatorSelect.value = this.filters[column].operator;
            document.getElementById('events-filter-value').value = this.filters[column].value;
        }

        // Обработчики кнопок
        const applyButton = modal.querySelector('#events-filter-apply');
        const clearButton = modal.querySelector('#events-filter-clear');
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
            const operator = operatorSelect.value;
            const value = document.getElementById('events-filter-value').value;
            
            if (value) {
                this.filters[column] = { operator, value };
            } else {
                delete this.filters[column];
            }
            
            this.updateEventsList();
            modal.classList.remove('active');
        });

        newClearButton.addEventListener('click', () => {
            delete this.filters[column];
            this.updateEventsList();
            modal.classList.remove('active');
        });

        newCloseButton.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        // Добавляем обработчик клавиши Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                modal.classList.remove('active');
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Показываем модальное окно
        modal.classList.add('active');
    }

    clearAllFilters() {
        this.filters = {};
        this.updateEventsList();
    }

    getColumnTitle(column) {
        const titles = {
            'id': 'event_id',
            'group': 'event_group',
            'name': 'event_name',
            'title': 'event_title'
        };
        return window.translator.translate(titles[column] || column);
    }

    getCurrentEvent() {
        const currentEventId = document.getElementById('event-id').value;
        if (!currentEventId) return null;
        
        // Get event data from form
        return {
            id: currentEventId,
            name: document.getElementById('event-unique-name').value,
            title: document.getElementById('event-title').value,
            description: document.getElementById('event-description').value,
            group: document.getElementById('event-group-name').value,
            image: document.getElementById('event-image').value,
            icon: document.getElementById('event-icon').value,
            hide_later: document.getElementById('event-hide-later').value === 'true',
            delete_turns: parseInt(document.getElementById('event-delete-turns').value),
            requirements: window.requirementsManager.getRequirements('mainreq'),
            answers: [
                {
                    text: document.getElementById('event-answer1').value,
                    description: document.getElementById('event-description1').value,
                    auto_answer: document.getElementById('event-auto-answer1').value === 'true',
                    requirements: window.requirementsManager.getRequirements('1-req'),
                    bonuses: window.requirementsManager.getRequirements('1-bonus')
                },
                {
                    text: document.getElementById('event-answer2').value,
                    description: document.getElementById('event-description2').value,
                    disabled: document.getElementById('event-answer2-disabled').value === 'true',
                    requirements: window.requirementsManager.getRequirements('2-req'),  
                    bonuses: window.requirementsManager.getRequirements('2-bonus')
                },
                {
                    text: document.getElementById('event-answer3').value,
                    description: document.getElementById('event-description3').value,
                    disabled: document.getElementById('event-answer3-disabled').value === 'true',
                    requirements: window.requirementsManager.getRequirements('3-req'),
                    bonuses: window.requirementsManager.getRequirements('3-bonus')
                }
            ]
        };
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    window.eventManager = new EventManager();
});

function createRequirementEditor() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
    `;
    document.body.appendChild(modal);
    window.translator.updateModals(modal);
    return modal;
}

function createBonusEditor() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
        </div>
    `;
    document.body.appendChild(modal);
    window.translator.updateModals(modal);
    return modal;
}

// Обновляем обработчик добавления требований
document.addEventListener('click', function(e) {
    if (e.target.matches('#add-requirement')) {
        const modal = createRequirementEditor();
        // ... existing code ...
        window.translator.updateModals(modal);
        window.translator.updateAllTranslations();
    }
});

// Обновляем обработчик добавления бонусов
document.addEventListener('click', function(e) {
    if (e.target.matches('#add-bonus')) {
        const modal = createBonusEditor();
        // ... existing code ...
        window.translator.updateModals(modal);
    }
});

function sortCountriesByName(countries) {
    return countries.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        return nameA.localeCompare(nameB);
    });
}

function createCountrySelect(countries) {
    return countries
        .sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()))
        .map(country => `<option value="${country.id}">${country.name}</option>`)
        .join('');
}
