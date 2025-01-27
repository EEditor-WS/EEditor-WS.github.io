class EventManager {
    constructor() {
        this.currentEvent = null;
        this.jsonData = null;
        this.undoStack = [];
        this.redoStack = [];
        this.maxStackSize = 50;
        this.isEditing = false;
        
        // Добавляем параметры сортировки
        this.sortColumn = 'id'; // По умолчанию сортируем по ID
        this.sortDirection = 'asc'; // По умолчанию по возрастанию
        
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
            }
        });
        
        this.init();
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
    }

    initSortHandlers() {
        const headers = document.querySelectorAll('.events-table th');
        headers.forEach((header, index) => {
            header.addEventListener('click', () => {
                // Определяем колонку для сортировки
                const columns = ['id', 'group_name', 'unique_event_name', 'title'];
                const column = columns[index];
                
                // Если кликнули на ту же колонку, меняем направление сортировки
                if (this.sortColumn === column) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortColumn = column;
                    this.sortDirection = 'asc';
                }
                
                // Обновляем классы заголовков
                headers.forEach(h => {
                    h.classList.remove('sort-asc', 'sort-desc');
                });
                header.classList.add(`sort-${this.sortDirection}`);
                
                // Обновляем список с новой сортировкой
                this.updateEventsList();
            });
        });
    }

    updateEventsList() {
        const eventsList = document.getElementById('events-list');
        if (!eventsList || !this.jsonData?.custom_events) return;

        // Очищаем список
        eventsList.innerHTML = '';

        // Создаем отсортированный массив событий
        const eventsArray = Object.entries(this.jsonData.custom_events)
            .map(([id, event]) => ({
                id,
                title: event.title || '',
                group_name: event.group_name || '',
                unique_event_name: event.unique_event_name || '',
                ...event
            }))
            .sort((a, b) => {
                let comparison = 0;
                
                switch (this.sortColumn) {
                    case 'id':
                        comparison = a.id.localeCompare(b.id);
                        break;
                    case 'title':
                        comparison = (a.title || '').localeCompare(b.title || '');
                        break;
                    case 'group_name':
                        comparison = (a.group_name || '').localeCompare(b.group_name || '');
                        break;
                    case 'unique_event_name':
                        comparison = (a.unique_event_name || '').localeCompare(b.unique_event_name || '');
                        break;
                }
                
                return this.sortDirection === 'asc' ? comparison : -comparison;
            });

        // Добавляем события в список
        for (const event of eventsArray) {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.onclick = () => this.openEvent(event.id);

            row.innerHTML = `
                <td>${event.id}</td>
                <td>${event.group_name || ''}</td>
                <td>${event.unique_event_name || ''}</td>
                <td>${event.title || ''}</td>
            `;

            eventsList.appendChild(row);
        }
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

        // Обработчики изменения изображений
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
                const answer = button.getAttribute('data-answer');
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
            group_name: 'Новая группа',
            unique_event_name: `new_event_${newId.toLowerCase()}`,
            title: 'Новое событие',
            description: 'Описание события',
            image: 'diplomacy',
            answer1: 'Ответ 1',
            answer2: 'Ответ 2',
            answer3: 'Ответ 3',
            description1: 'Описание ответа 1',
            description2: 'Описание ответа 2',
            description3: 'Описание ответа 3',
            answer2_is_disabled: false,
            answer3_is_disabled: false,
            auto_answer1_if_ignored: true,
            delete_after_turns: 1,
            hide_later: false,
            icon: 'diplomacy',
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

    generateUniqueId() {
        if (!this.jsonData || !this.jsonData.custom_events) {
            return 'E1';
        }

        // Получаем все существующие ID
        const existingIds = Object.keys(this.jsonData.custom_events)
            .filter(id => id.startsWith('E'))
            .map(id => parseInt(id.substring(1)))
            .filter(num => !isNaN(num));

        // Если нет существующих ID, возвращаем E1
        if (existingIds.length === 0) {
            return 'E1';
        }

        // Находим максимальный номер и увеличиваем его на 1
        const maxId = Math.max(...existingIds);
        return `E${maxId + 1}`;
    }

    copyCurrentEvent() {
        if (!this.currentEvent || !this.jsonData?.custom_events?.[this.currentEvent]) return;

        const newId = this.generateUniqueId();
        const currentEvent = this.jsonData.custom_events[this.currentEvent];
        
        this.pushToUndoStack();
        
        // Создаем глубокую копию события
        this.jsonData.custom_events[newId] = JSON.parse(JSON.stringify(currentEvent));
        
        // Обновляем id и заголовок копии
        this.jsonData.custom_events[newId].id = newId;
        this.jsonData.custom_events[newId].title += ' (копия)';
        this.jsonData.custom_events[newId].unique_event_name = `${currentEvent.unique_event_name}_copy`;
        
        this.updateEventsList();
        this.openEvent(newId);
        this.saveChanges();
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
            titleHeader.textContent = event.title || 'Без названия';
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
        const content = isRequirement ? 
            `${item.type} ${item.action || ''} ${item.value}${item.subtype ? ` (${item.subtype})` : ''}` :
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
        if (!this.currentEvent || !this.jsonData?.custom_events?.[this.currentEvent]) return;

        this.isEditing = true;
        try {
            const event = this.jsonData.custom_events[this.currentEvent];

            // Обновляем основные данные
            event.id = document.getElementById('event-id').value;
            event.group_name = document.getElementById('event-group-name').value;
            event.unique_event_name = document.getElementById('event-unique-name').value;
            event.title = document.getElementById('event-title').value;
            event.description = document.getElementById('event-description').value;
            event.image = document.getElementById('event-image').value;
            event.icon = document.getElementById('event-icon').value;
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

            // Обновляем требования и бонусы
            this.updateRequirementsAndBonuses(event);

            // Обновляем JSON и интерфейс
            this.updateJsonInPreview();
            
            // Обновляем заголовок
            const titleHeader = document.getElementById('event-name-header');
            if (titleHeader) {
                titleHeader.textContent = event.title || 'Без названия';
            }

            this.updateEventsList();
        } finally {
            this.isEditing = false;
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
        // Этот метод нужно реализовать в зависимости от структуры DOM
        // Возвращает объект с данными требования или бонуса
        return isRequirement ? 
            { type: 'money', action: 'more', value: 10 } : // Пример для требования
            { type: 'defense', duration: 3, value: 1.2 };  // Пример для бонуса
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
            this.fileInfo.textContent = 'Изменения не сохранены';
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
        // TODO: Реализовать открытие редактора требований и бонусов
        console.log(`Открываем редактор требований для ответа ${answer}`);
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
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    window.eventManager = new EventManager();
});
