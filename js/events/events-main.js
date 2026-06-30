// events-main.js — обновлённая версия с поддержкой кастомных выпадающих списков для поля value (объект-группы)

class EventManager {
    constructor() {
        try {
            this.currentEvent = null;
            this.jsonData = null;
            this.undoStack = [];
            this.redoStack = [];
            this.maxStackSize = 50;
            this.isEditing = false;
            this.filters = {};
            this.eventListeners = [];
            this.eventData;
            
            this.sortColumn = 'id';
            this.sortDirection = 'asc';
            
            this.previewContent = document.getElementById('preview-content');
            this.fileInfo = document.getElementById('file-info');
            
            if (!this.previewContent) {
                console.warn('Не найден элемент preview-content - это нормально для editor.html');
            }
            if (!this.fileInfo) {
                console.warn('Не найден элемент file-info - это нормально для editor.html');
            }
            
            if (this.previewContent) {
                try {
                    const initialData = JSON.parse(this.previewContent.value);
                    this.setJsonData(initialData);
                } catch (error) {
                    console.warn('Не удалось загрузить начальные данные:', error);
                }
                
                this.previewContent.addEventListener('input', () => {
                    if (this.isEditing) return;
                    try {
                        const jsonData = JSON.parse(this.previewContent.value);
                        this.setJsonData(jsonData);
                    } catch (error) {
                        console.error('Ошибка при парсинге JSON:', error);
                        if (this.fileInfo) {
                            this.fileInfo.textContent = window.translator.translate('file_parse_error');
                        }
                    }
                });
            }
            
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
            if (!this.jsonData.custom_events || this.jsonData.custom_events === []) {
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
        if (!this.jsonData.custom_events || this.jsonData.custom_events === []) {
            this.jsonData.custom_events = {};
        }
        this.updateEventsList();
    }

    init() {
        this.initEventListeners();
        this.initSortHandlers();

        const imageSelect = document.getElementById('event-image');
        const imagePreview = document.getElementById('event-image-preview');
        const iconSelect = document.getElementById('event-icon');
        const iconPreview = document.getElementById('event-icon-preview');

        if (imageSelect && imagePreview) {
            imageSelect.addEventListener('change', () => {
                const selectedImage = imageSelect.value;
                imagePreview.src = `/event/img/${selectedImage}.png`;
            });
            imagePreview.src = `/event/img/${imageSelect.value}.png`;
        }

        if (iconSelect && iconPreview) {
            iconSelect.addEventListener('change', () => {
                const selectedIcon = iconSelect.value;
                iconPreview.src = `/event/ico/${selectedIcon}.png`;
            });
            iconPreview.src = `/event/ico/${iconSelect.value}.png`;
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

    updateEventsList(eventsRaw = 'fillIt', place = 'events-list') {
        if (!this.jsonData?.custom_events) {
            console.warn('Нет данных о событиях');
            return;
        }

        const tbody = document.getElementById(place);
        if (!tbody) {
            console.error('Не найден элемент events-list');
            return;
        }

        tbody.innerHTML = '';

        if (eventsRaw == 'fillIt') eventsRaw = this.jsonData.custom_events;
        let events = Object.entries(eventsRaw)
            .map(([id, event]) => ({
                ico: event.icon || 'broken',
                id,
                group: event.group_name || '',
                name: event.unique_event_name || '',
                title: event.title || '',
                requirements: event.requirements || [],
                ...event
            }));

        const eventsCountEl = document.getElementById('eventsCount');
        if (eventsCountEl && place == 'events-list') {
            eventsCountEl.textContent = events.length;
        } 

        if (this.filters.groups) {
            events = events.filter(event => {
                const eventGroups = (event.group || '').split(/\s*,\s*/).filter(Boolean);
                return eventGroups.some(group => this.filters.groups.includes(group));
            });
        }

        if (this.sortColumn === 'id') {
            events.sort((a, b) => {
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

        events.forEach(event => {
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            tr.setAttribute('data-event-id', event.id);
            tr.addEventListener('click', (clicked) => {
                if (clicked.target.closest('.reqs') || clicked.target.closest('.groupsInCell')) {
                    return;
                }
                this.openEvent(event.id)
            });

            const idCell = document.createElement('td');
            idCell.innerHTML = `<div style="display: inline-flex"><img loading="lazy" class="list-icon" src="/event/ico/${event.ico || 'broken'}.png" alt="${event.ico || 'broken'}"><span style:"margin-left: 5px"> ${event.id}</span></div>`;
            idCell.id = `event-row-${event.id}`;

            const groupCell = document.createElement('td');
            groupCell.className = 'groupsInCell';
            let groups = event.group.split(',')
            if (groups.length == 1 && groups[0] == '') groups = []
            groups.forEach(name => {
                const span = document.createElement('span');
                span.textContent = name;
                span.className = 'group-item';
                span.addEventListener('click', () => {
                    const grs = window.eventManager.filters;
                    if (!grs || !grs.groups) grs.groups = [];
                    if (grs.groups[0] == name) {
                        grs.groups = []
                        delete grs.groups
                    } else {
                        grs.groups = [];
                        grs.groups.push(name);
                    }
                    window.eventManager.updateEventsList();
                });
                groupCell.appendChild(span);
            });

            const nameCell = document.createElement('td');
            nameCell.textContent = event.name;

            const titleCell = document.createElement('td');
            titleCell.textContent = event.title;

            const requirementsCell = document.createElement('td');
            requirementsCell.innerHTML = '';
            requirementsCell.appendChild(convertObjectToReadableDOM(event.requirements, event.id));
            requirementsCell.className = 'reqs';

            window.currentOrderEvents.forEach((numer, number) => {
                if (window.currentOrderEvents[number] === 'id') {
                    tr.appendChild(idCell);
                } else if (window.currentOrderEvents[number] === 'group') {
                    tr.appendChild(groupCell);
                } else if (window.currentOrderEvents[number] === 'name') {
                    tr.appendChild(nameCell);
                } else if (window.currentOrderEvents[number] === 'title') {
                    tr.appendChild(titleCell);
                } else if (window.currentOrderEvents[number] === 'requirements') {
                    tr.appendChild(requirementsCell);
                }
            });

            tbody.appendChild(tr);
        });

        console.log('Список событий обновлен');
    }

    initEventListeners() {
        document.getElementById('add-event')?.addEventListener('click', () => this.createNewEvent());

        document.getElementById('copy-event')?.addEventListener('click', () => this.copyCurrentEvent());
        document.getElementById('delete-event')?.addEventListener('click', () => this.deleteCurrentEvent());

        const form = document.getElementById('event-form');
        if (form) {
            form.addEventListener('change', (e) => this.handleFormChange(e));
            form.addEventListener('submit', (e) => e.preventDefault());
        }

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#event-actions-button')) {
                document.getElementById('eventActionsDropdown')?.classList.remove('active');
            }
        });

        document.getElementById('event-image')?.addEventListener('change', (e) => {
            this.updateImagePreview(e.target.value);
        });

        document.getElementById('event-icon')?.addEventListener('change', (e) => {
            this.updateIconPreview(e.target.value);
        });

        document.getElementById('event-answer2-disabled')?.addEventListener('change', () => {
            this.updateAnswerBlocksState();
        });

        document.getElementById('event-answer3-disabled')?.addEventListener('change', () => {
            this.updateAnswerBlocksState();
        });

        document.querySelectorAll('.requirements-button').forEach(button => {
            button.addEventListener('click', () => {
                let answer = button.getAttribute('data-answer') || '';
                this.openRequirementsEditor(answer, 'modal');
            });
        });

        document.getElementById('save-event')?.addEventListener('click', () => {
            this.saveChanges();
        });

        document.getElementById('cancel-edit')?.addEventListener('click', () => {
            this.switchToEventsList();
        });

        document.querySelectorAll('#events .th-filter').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const column = button.closest('th').getAttribute('data-sort');
                
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.remove('active');
                });

                if (column === 'group') {
                    this.showGroupFilterModal();
                } else {
                    this.showFilterModal(column);
                }
            });
        });

        document.getElementById('clear-events-filters')?.addEventListener('click', () => {
            this.clearAllFilters();
        });

        document.getElementById('back-to-events-list')?.addEventListener('click', () => this.backToEventsList());

        const tbody = document.getElementById('events-list');
        if (tbody) {
            tbody.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const tr = e.target.closest('tr');
                if (!tr) return;

                const eventId = tr.getAttribute('data-event-id');
                if (!eventId) return;

                const oldMenu = document.querySelector('.context-menu');
                if (oldMenu) {
                    document.body.removeChild(oldMenu);
                }

                const contextMenu = document.createElement('div');
                contextMenu.className = 'context-menu';
                
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;

                contextMenu.innerHTML = `
                    <div class="context-menu-item" id="duplicate-event-context">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        <span>${window.translator.translate('duplicate')}</span>
                    </div>
                    <div class="context-menu-item" id="copy-event-context">
                        <img src="img/ui/file/paste.svg">
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

                const menuRect = contextMenu.getBoundingClientRect();
                
                let x = e.clientX;
                let y = e.clientY;

                if (x + menuRect.width > windowWidth) {
                    x = windowWidth - menuRect.width;
                }
                if (y + menuRect.height > windowHeight) {
                    y = windowHeight - menuRect.height;
                }

                contextMenu.style.position = 'fixed';
                contextMenu.style.left = x + 'px';
                contextMenu.style.top = y + 'px';

                document.getElementById('duplicate-event-context')?.addEventListener('click', () => {
                    this.copyCurrentEvent(eventId);
                    document.body.removeChild(contextMenu);
                });

                document.getElementById('delete-event-context')?.addEventListener('click', () => {
                    this.deleteCurrentEvent(eventId);
                    document.body.removeChild(contextMenu);
                });

                document.getElementById('copy-event-context')?.addEventListener('click', () => {
                    window.moveManager.copyCurrentEvent(eventId);
                    document.body.removeChild(contextMenu);
                });

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
        
        if (!this.jsonData.custom_events || this.jsonData.custom_events === []) {
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
            requirements3: [],
            eeditor: {
                dateAdd: {
                    user: window.authManager.currentUser.username,
                    time: Date.now()
                }
            }
        };

        this.pushToUndoStack();
        this.jsonData.custom_events[newId] = newEvent;
        this.updateJsonInPreview();
        this.updateEventsList();
        this.openEvent(newId);
    }

    generateUniqueId(minimumID = 0) {
        if (!this.jsonData || !this.jsonData.custom_events) {
            return `E${Math.max(1, minimumID + 1)}`;
        }

        const existingIds = new Set(
            Object.keys(this.jsonData.custom_events)
                .filter(id => /^E\d+$/.test(id))
                .map(id => parseInt(id.substring(1), 10))
                .filter(num => !isNaN(num))
        );

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
            
            const eventCopy = JSON.parse(JSON.stringify(sourceEvent));

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
            ['requirements','requirements1','requirements2','requirements3','bonuses','bonuses1','bonuses2','bonuses3'].forEach(field => {
                if (Array.isArray(eventCopy[field])) {
                    eventCopy[field] = replaceIdDeep(eventCopy[field], sourceId, newId);
                }
            });

            eventCopy.id = newId;
            eventCopy.unique_event_name = sourceEvent.unique_event_name ? `${sourceEvent.unique_event_name}_copy` : '';
            eventCopy.title = `${sourceEvent.title || ''} ${window.translator.translate("(copy)")}`;

            this.jsonData.custom_events[newId] = eventCopy;

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

        this.populateRequirementsAndBonuses(event);

        this.switchToEditPage();

        const opage = document.getElementById('openedPage');
        opage.setAttribute('data-pre', opage.getAttribute('data-now'));
        opage.setAttribute('data-now', 'event-edit');
    }

    setFormValues(values) {
        Object.entries(values).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (element.tagName === 'SELECT') {
                    element.value = value;
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

        this.updateAnswerBlocksState();
    }

    updateImagePreview(imageName) {
        const preview = document.getElementById('event-image-preview');
        if (preview) {
            preview.src = imageName ? `/event/img/${imageName}.png` : '';
        }
    }

    updateIconPreview(iconName) {
        const preview = document.getElementById('event-icon-preview');
        if (preview) {
            preview.src = iconName ? `/event/ico/${iconName}.png` : '';
        }
    }

    updateAnswerBlocksState() {
        const answer2Block = document.querySelector('.answer-block:nth-child(2)');
        const answer2Disabled = document.getElementById('event-answer2-disabled').value === 'true';
        if (answer2Block) {
            answer2Block.setAttribute('data-disabled', answer2Disabled);
        }

        const answer3Block = document.querySelector('.answer-block:nth-child(3)');
        const answer3Disabled = document.getElementById('event-answer3-disabled').value === 'true';
        if (answer3Block) {
            answer3Block.setAttribute('data-disabled', answer3Disabled);
        }
    }

    populateRequirementsAndBonuses(event) {
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

        if (!this.jsonData.custom_events || this.jsonData.custom_events === []) {
            this.jsonData.custom_events = {};
        }

        this.isEditing = true;
        try {
            const event = this.jsonData.custom_events[this.currentEvent];

            const requiredElements = [
                'event-id', 'event-title',
                'event-description', 'event-image', 'event-icon'
            ];

            event.eeditor = event.eeditor || {};
            const eeData = event.eeditor;
            eeData.dateUpd = {
                user: window.authManager.currentUser.username,
                time: Date.now()
            };
            eeData.users = eeData.users || [];
            if (!(eeData.users).includes(window.authManager.currentUser.username)) {
                eeData.users.push(window.authManager.currentUser.username)
            }

            for (const elementId of requiredElements) {
                const element = document.getElementById(elementId);
                if (!element) {
                    throw new Error(`Не найден элемент формы: ${elementId}`);
                }
            }

            event.id = document.getElementById('event-id').value;
            event.group_name = document.getElementById('event-group-name').value;
            event.unique_event_name = document.getElementById('event-unique-name').value;
            event.title = document.getElementById('event-title').value;
            event.description = document.getElementById('event-description').value;
            event.image = document.getElementById('event-image').value;
            event.icon = document.getElementById('event-icon').value;

            if (!event.id || !event.title) {
                throw new Error('ID и заголовок события обязательны');
            }

            this.updateEventAnswers(event);

            this.updateJsonInPreview();
            
            const titleHeader = document.getElementById('event-name-header');
            if (titleHeader) {
                titleHeader.textContent = event.title || window.translator.translate("without_name");
            }

            this.updateEventsList();
            
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

    // Изменённая функция saveRequirementOrBonus с поддержкой кастомного dropdown для value
    saveRequirementOrBonus(params) {
        const { 
            type, 
            isBonus, 
            prefix = '', 
            items = [], 
            editor = null, 
            updateListFn = null,
            data = null,
            isClose = true,
        } = params;
        
        if (!type) {
            console.warn('Тип требования не выбран');
            return null;
        }

        const whereReqBon = isBonus ? 'bonuses' : 'requirements';
        const config = window.reqbonConfig[whereReqBon]?.[type];
        
        if (!config) {
            console.warn(`Конфигурация не найдена для типа ${type}`);
            return null;
        }

        let action = '';
        if (!isBonus && config.action) {
            if (data?.action !== undefined) {
                action = data.action;
            } else {
                const actionEl = document.getElementById(`${prefix}requirement-action`);
                if (actionEl) {
                    const activeBtn = actionEl.querySelector('.action-button.active');
                    if (activeBtn) {
                        action = activeBtn.dataset.value;
                    } else if (actionEl.tagName === 'SELECT' || actionEl.tagName === 'INPUT') {
                        action = actionEl.value || '';
                    } else {
                        const nestedInput = actionEl.querySelector('select, input');
                        if (nestedInput) {
                            action = nestedInput.value || '';
                        } else {
                            const hiddenInput = actionEl.querySelector('.action-value');
                            action = hiddenInput ? hiddenInput.value : '';
                        }
                    }
                }
            }
        }

        let subtype = '';
        if (config.subType !== false) {
            if (data?.subtype !== undefined) {
                subtype = data.subtype;
            } else {
                const subtypeEl = document.getElementById(`${prefix}requirement-subtype`);
                if (subtypeEl) {
                    if (subtypeEl.tagName === 'SELECT' || subtypeEl.tagName === 'INPUT') {
                        subtype = subtypeEl.value || '';
                    } else if (subtypeEl.querySelector('select, input')) {
                        const input = subtypeEl.querySelector('select, input');
                        subtype = input ? input.value || '' : '';
                    } else {
                        subtype = subtypeEl.textContent || '';
                    }
                }
            }
        }

        // --- ИЗМЕНЕНИЕ: получение value с учётом кастомного dropdown ---
        let value = '';
        if (config.value !== false) {
            if (data?.value !== undefined) {
                value = data.value;
            } else {
                const valueEl = document.getElementById(`${prefix}requirement-value`);
                if (valueEl) {
                    // Проверяем, есть ли кастомный dropdown (сохранённый в _dropdown)
                    if (valueEl._dropdown) {
                        value = valueEl._dropdown.getValue();
                    } else if (valueEl.tagName === 'SELECT' || valueEl.tagName === 'INPUT') {
                        value = valueEl.value || '';
                    } else if (valueEl.querySelector('select, input')) {
                        const input = valueEl.querySelector('select, input');
                        value = input ? input.value || '' : '';
                    } else {
                        value = valueEl.textContent || '';
                    }
                }
            }
        }

        let duration;
        if (isBonus && config.hasDuration) {
            if (data?.duration !== undefined) {
                duration = data.duration;
            } else {
                const actualDurationInput = document.getElementById(`${prefix}requirement-duration`);
                if (actualDurationInput) {
                    let durationValue = actualDurationInput.value.replace(/^["']|["']$/g, '').trim();
                    duration = parseInt(durationValue) || config?.defaultDuration || 3;
                }
            }
        }

        if (!type) {
            console.warn('Тип требования обязателен');
            return null;
        }
        if (!isBonus && config.action && Array.isArray(config.action) && !action) {
            console.warn('Action обязателен для этого типа требования', config.action);
            return null;
        }
        if (config.value !== false && value === '' && value !== 0 && value !== false) {
            console.warn('Value обязателен для этого типа требования');
            return null;
        }
        if (isBonus && config.hasDuration && duration === undefined) {
            console.warn('Duration обязателен для этого типа бонуса');
            return null;
        }

        const numericTypes = ['month', 'num_of_provinces', 'year', 'turn', 'random_value', 
            'count_of_tasks', 'tax', 'discontent', 'money', 'land_power', 'defense', 'num_of_vassals',
            'attack', 'population_income', 'population_increase', 'building_cost', 'add_oil', 'add_cruiser', 
            'add_random_culture_population', 'add_shock_infantry', 'add_tank', 'add_artillery',
            'army_losses', 'prestige', 'add_battleship', 'add_infantry', 'science', 'cooldown', 
            'num_of_players', 'has_resource', 'has_prestige', 'has_science'];

        const booleanTypes = ['near_water', 'is_player', 'independent_land', 'no_enemy', 'enemy_near_capital', 'lost_capital'];

        if (numericTypes.includes(type)) {
            value = (value || '').toString().replace(/^["']|["']$/g, '').trim();
            if (!isNaN(value) && value !== '') {
                value = Number(value);
            }
        } else if (booleanTypes.includes(type)) {
            value = value === 'true' || value === true;
        }

        const item = {
            type,
            ...(action && { action }),
            ...(subtype && { subtype }),
            value,
            ...(isBonus && config.hasDuration && duration !== undefined && { duration })
        };

        if (items && editor) {
            const editIndex = editor.dataset.editIndex;
            if (editIndex !== undefined) {
                items[editIndex] = item;
                delete editor.dataset.editIndex;
            } else {
                items.push(item);
            }
            
            if (isClose) editor.classList.remove('active');
            if (updateListFn) {
                updateListFn();
            }
            this.saveChanges();
        }

        return item;
    }

    updateJsonInPreview() {
        if (!this.previewContent || !this.jsonData) return;
        
        this.isEditing = true;
        try {
            const cursorPosition = this.previewContent.selectionStart;
            
            this.previewContent.value = JSON.stringify(this.jsonData, null, 4);
        
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

        document.querySelectorAll('.navbtn').forEach(btn => {
            btn.classList.remove('active');
        });

        this.openRequirementsEditor('mainreq', 'inpage');
    }

    switchToEventsList() {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('events')?.classList.add('active');

        document.querySelectorAll('.navbtn').forEach(btn => {
            if (btn.getAttribute('data-page') === 'events') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    pushToUndoStack() {}

    undo() {}

    redo() {}

    // Изменённый метод openRequirementsEditor с поддержкой кастомного dropdown для value
    openRequirementsEditor(answer, place) {
        let prefix = '';
        document.getElementById('reqbonback').classList.add('active');

        const modal = document.getElementById(`requirements-editor-modal`);
        const title = document.getElementById(`${prefix}requirements-editor-title`);
        const list = document.getElementById(`${prefix}requirements-items`);
        const editor = document.getElementById(`${prefix}requirement-editor`);
        const addButton = document.getElementById(`${prefix}add-requirement`);
        const saveButton = document.getElementById(`${prefix}save-requirement`);
        const cancelButton = document.getElementById(`${prefix}cancel-requirement`);
        const typeSelect = window.cReqType;
        const durationInput = document.getElementById(`${prefix}requirement-duration`);

        if (localStorage.getItem('eeditorEventEditStyle') === 'grid') {
            document.getElementById('event-form-container').classList.add('oldview');
        }

        const isBonus = answer.includes('bonus');
        this.isEditingBonus = isBonus;
        const listType = isBonus ? 'bonuses' : 'requirements';
        title.textContent = window.translator.translate(answer);

        const items = this.jsonData.custom_events[this.currentEvent][listType + (answer.includes('-') ? answer.split('-')[0] : '')] || [];

        function buildBonusOptions() {
            const options = [];
            const config = window.reqbonConfig?.bonuses || {};
            const categories = window.bonusCategories || {};

            for (const [categoryKey, keys] of Object.entries(categories)) {
                const label = window.translator.translate(categoryKey);
                options.push({
                    value: '',
                    label: `--- ${label} ---`,
                    disabled: true
                });

                for (const key of keys) {
                    const bonus = config[key];
                    if (bonus && !bonus.hidden) {
                        options.push({
                            value: key,
                            label: window.translator.translate(key)
                        });
                    }
                }
            }
            return options;
        }

        function buildRequirementOptions() {
            const options = [];
            const config = window.reqbonConfig?.requirements || {};
            const categories = window.requirementCategories || {};

            for (const [categoryKey, keys] of Object.entries(categories)) {
                const label = window.translator.translate(categoryKey);
                options.push({
                    value: '',
                    label: `--- ${label} ---`,
                    disabled: true
                });

                for (const key of keys) {
                    if (config[key]) {
                        options.push({
                            value: key,
                            label: window.translator.translate(key)
                        });
                    }
                }
            }
            return options;
        }

        if (isBonus) {
            window.cReqType.setOptions(buildBonusOptions());
        } else {
            window.cReqType.setOptions(buildRequirementOptions());
        }

        const updateList = () => {
            list.innerHTML = '';
            items.forEach((item, index) => {
                const row = document.createElement('tr');
                const config = isBonus ? window.reqbonConfig?.bonuses?.[item.type] : null;
                
                const booleanTypes = ['near_water', 'is_player', 'independent_land', 'no_enemy', 'enemy_near_capital', 'lost_capital'];
                let displayValue = item.value;
                if (booleanTypes.includes(item.type)) {
                    displayValue = item.value ? window.translator.translate('yes') : window.translator.translate('no');
                }

                let tSType = '';
                if (typeof item.subtype === "string") {
                    if (/^E\d+$/.test(item.subtype)) {
                        tSType = `<p class="eventReqEvent" onclick="window.eventManager.openEvent('${item.subtype}')">${item.subtype} - ${window.eventManager.jsonData?.custom_events?.[item.subtype]?.title}</p>`;
                    } else if (item.subtype.includes("civilization")) {
                        tSType = `<p class="eventReqEvent" onclick="window.countryManager.openCountry('${item.subtype}')">${window.eventManager.jsonData.lands[item.subtype]?.name}</p>`;
                    } else {
                        tSType = item.subtype;
                    }
                } else if (item.subtype !== undefined) {
                    tSType = String(item.subtype);
                }

                let tAction = '';
                if (typeof item.action === "string") {
                    if (/^E\d+$/.test(item.action)) {
                        tAction = `<p class="eventReqEvent" onclick="window.eventManager.openEvent('${item.action}')">${item.action} - ${window.eventManager.jsonData?.custom_events?.[item.action]?.title}</p>`;
                    } else if (item.action.includes("civilization")) {
                        tAction = `<p class="eventReqEvent" onclick="window.countryManager.openCountry('${item.action}')">${window.eventManager.jsonData?.lands?.[item.action]?.name || item.action}</p>`;
                    } else {
                        tAction = item.action;
                    }
                } else if (item.action !== undefined) {
                    tAction = String(item.action);
                }

                let tValue = '';
                if (typeof displayValue === "string") {
                    if (/^E\d+$/.test(displayValue)) {
                        tValue = `<p class="eventReqEvent" onclick="window.eventManager.openEvent('${displayValue}')">${displayValue} - ${window.eventManager.jsonData?.custom_events?.[displayValue]?.title}</p>`;
                    } else if (displayValue.includes("civilization")) {
                        tValue = `<p class="eventReqEvent" onclick="window.countryManager.openCountry('${displayValue}')">${window.eventManager.jsonData?.lands?.[displayValue]?.name || displayValue}</p>`;
                    } else {
                        tValue = displayValue;
                    }
                } else if (displayValue !== undefined) {
                    tValue = String(displayValue);
                }
                
                row.innerHTML = `
                    <td>${window.translator.translate(item.type)}</td>
                    <td>${tSType}</td>
                    <td>${isBonus ? (item.duration ? `${item.duration} turns` : '') : tAction}</td>
                    <td>${tValue}</td>
                    <td>
                        <div class="requirement-actions">
                            <button type="button" class="edit" data-index="${index}">✎</button>
                            <button type="button" class="delete" data-index="${index}">×</button>
                        </div>
                    </td>
                `;
                list.appendChild(row);
            });
        };
        window.eventManager.updateList = updateList;

        // --- ИЗМЕНЁННАЯ функция updateValueField с поддержкой кастомного dropdown для value ---
        const updateValueField = () => {
            // Получаем контейнеры
            let valueContainer = document.getElementById(`${prefix}requirement-value`);
            const subtypeContainer = document.getElementById(`${prefix}requirement-subtype`);
            const actionContainer = document.getElementById(`${prefix}requirement-action`);

            const subtypeLabel = document.querySelector(`[for="${prefix}requirement-subtype"]`);
            const subtypeGroup = subtypeLabel?.closest('.form-group');
            
            const actionLabel = document.querySelector(`[for="${prefix}requirement-action"]`);
            const actionGroup = actionLabel?.closest('.form-group');

            const durationInput = document.getElementById(`${prefix}requirement-duration`);

            const selectedType = window.cReqType.getValue();
            const isBonus = this.isEditingBonus;

            if (!valueContainer) {
                console.warn('Value container not found');
                return;
            }

            // --- КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: заменяем valueContainer на новый элемент, чтобы сбросить все обработчики и _dropdown ---
            const parent = valueContainer.parentNode;
            const newValueContainer = document.createElement('div');
            newValueContainer.id = valueContainer.id;
            newValueContainer.className = valueContainer.className;
            parent.replaceChild(newValueContainer, valueContainer);
            valueContainer = newValueContainer; // теперь используем новый

            // Очищаем остальные контейнеры (они не имеют обработчиков, но для чистоты)
            if (subtypeContainer) subtypeContainer.innerHTML = '';
            if (actionContainer) actionContainer.innerHTML = '';

            // Управление длительностью (без изменений)
            if (durationInput?.parentElement) {
                const hasDuration = !!window.reqbonConfig?.bonuses?.[selectedType]?.hasDuration;
                durationInput.parentElement.style.display = hasDuration ? 'block' : 'none';
                if (hasDuration) {
                    const changeHandler = () => {
                        const actualDurationInput = document.getElementById(`${prefix}requirement-duration`);
                        if (actualDurationInput) {
                            this.onRequirementFieldChange('duration', actualDurationInput.value);
                        }
                    };
                    const newDurationInput = durationInput.cloneNode(true);
                    durationInput.parentNode.replaceChild(newDurationInput, durationInput);
                    newDurationInput.addEventListener('change', changeHandler);
                    newDurationInput.addEventListener('input', changeHandler);
                }
            }
            if (!isBonus && durationInput?.parentElement) {
                durationInput.parentElement.style.display = 'none';
            }

            // Вспомогательная функция рендеринга секций (без изменений)
            const renderSection = (type, container, group) => {
                const element = returnPlace(selectedType, isBonus, type, this.currentEvent);
                if (!element || !group) {
                    if (group) group.style.display = 'none';
                    return;
                }
                group.style.display = 'block';
                if (container) {
                    container.appendChild(element);
                    if (type === 'subType') {
                        const input = container.querySelector('select, input[type="text"], input[type="number"]');
                        if (input) {
                            const changeHandler = () => this.onRequirementFieldChange('subtype', input.value);
                            input.addEventListener('change', changeHandler);
                            input.addEventListener('input', changeHandler);
                        }
                    } else if (type === 'action') {
                        const buttons = container.querySelectorAll('.action-button');
                        if (buttons.length > 0) {
                            buttons.forEach(btn => {
                                btn.addEventListener('click', (e) => {
                                    e.preventDefault();
                                    setTimeout(() => {
                                        const activeBtn = container.querySelector('.action-button.active');
                                        if (activeBtn) {
                                            const hiddenInput = container.querySelector('.action-value');
                                            if (hiddenInput) hiddenInput.value = activeBtn.dataset.value;
                                            this.onRequirementFieldChange('action', activeBtn.dataset.value);
                                        }
                                    }, 0);
                                });
                            });
                        } else {
                            const input = container.querySelector('select, input[type="text"], input[type="number"]');
                            if (input) {
                                const changeHandler = () => this.onRequirementFieldChange('action', input.value);
                                input.addEventListener('change', changeHandler);
                                input.addEventListener('input', changeHandler);
                            }
                        }
                    } else if (type === 'value') {
                        const input = container.querySelector('select, input[type="text"], input[type="number"]');
                        if (input) {
                            const changeHandler = () => this.onRequirementFieldChange('value', input.value);
                            input.addEventListener('change', changeHandler);
                            input.addEventListener('input', changeHandler);
                        }
                    }
                }
            };

            // Рендерим subtype
            renderSection('subType', subtypeContainer, subtypeGroup);

            // Рендерим action (только для требований)
            if (isBonus) {
                if (actionGroup) actionGroup.style.display = 'none';
            } else {
                renderSection('action', actionContainer, actionGroup);
            }

            // --- Рендерим value с проверкой на объект ---
            const config = window.reqbonConfig[isBonus ? 'bonuses' : 'requirements']?.[selectedType];
            if (config && config.value && typeof config.value === 'object' && !Array.isArray(config.value)) {
                // Это объект групп -> создаём кастомный dropdown
                const options = [];
                for (const [groupKey, items] of Object.entries(config.value)) {
                    options.push({ value: groupKey, label: window.translator.translate(groupKey), group: groupKey, disabled: true });
                    for (const item of items) {
                        options.push({ value: item, label: window.translator.translate(item), group: groupKey });
                    }
                }
                const dropdown = createCustomDropdown(valueContainer, options, { placeholder: 'Выберите...', searchable: true });
                valueContainer._dropdown = dropdown;
                // Обработчик изменения dropdown
                valueContainer.addEventListener('change', (e) => {
                    this.onRequirementFieldChange('value', e.detail.value);
                });
            } else {
                // Обычный рендеринг через returnPlace
                renderSection('value', valueContainer, valueContainer);
            }
        };

        typeSelect.addEventListener('change', updateValueField);

        addButton.onclick = () => {
            editor.classList.add('active');
            window.cReqType.setValue('');
            updateValueField();
        };

        document.getElementById('add-requirement2').onclick = addButton.onclick;

        list.onclick = (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const index = parseInt(button.dataset.index);
            if (button.classList.contains('edit')) {
                const item = items[index];
                editor.classList.add('active');
                window.cReqType.setValue(item.type);
                updateValueField();
                
                setTimeout(() => {
                    const actionContainer = document.getElementById(`${prefix}requirement-action`);
                    if (actionContainer && item.action !== undefined) {
                        const btn = actionContainer.querySelector(`[data-value="${item.action}"]`);
                        if (btn) {
                            actionContainer.querySelectorAll('.action-button').forEach(b => b.classList.remove('active'));
                            btn.classList.add('active');
                            const hiddenInput = actionContainer.querySelector('.action-value');
                            if (hiddenInput) hiddenInput.value = item.action;
                        } else if (actionContainer.tagName === 'SELECT' || actionContainer.tagName === 'INPUT') {
                            actionContainer.value = item.action;
                        } else if (actionContainer.querySelector('select, input')) {
                            const input = actionContainer.querySelector('select, input');
                            if (input) input.value = item.action;
                        }
                    }
                    
                    const subtypeContainer = document.getElementById(`${prefix}requirement-subtype`);
                    if (subtypeContainer && item.subtype !== undefined) {
                        const subtypeInput = subtypeContainer.querySelector('select, input[type="text"], input[type="number"]');
                        if (subtypeInput) {
                            subtypeInput.value = item.subtype;
                        } else if (subtypeContainer.tagName === 'SELECT' || subtypeContainer.tagName === 'INPUT') {
                            subtypeContainer.value = item.subtype;
                        }
                    }
                    
                    // --- ИЗМЕНЕНИЕ: установка значения в кастомный dropdown или обычный input ---
                    const valueContainer = document.getElementById(`${prefix}requirement-value`);
                    if (valueContainer && item.value !== undefined) {
                        if (valueContainer._dropdown) {
                            valueContainer._dropdown.setValue(item.value);
                        } else {
                            const valueInput = valueContainer.querySelector('select, input[type="text"], input[type="number"]');
                            if (valueInput) {
                                valueInput.value = item.value;
                            } else if (valueContainer.tagName === 'SELECT' || valueContainer.tagName === 'INPUT') {
                                valueContainer.value = item.value;
                            }
                        }
                    }
                    
                    if (isBonus && item.duration !== undefined) {
                        const currentDurationInput = document.getElementById(`${prefix}requirement-duration`);
                        if (currentDurationInput) {
                            currentDurationInput.value = item.duration;
                        }
                    }
                }, 50);
                
                editor.dataset.editIndex = index;
            } else if (button.classList.contains('delete')) {
                items.splice(index, 1);
                updateList();
                this.saveChanges();
            }
        };

        saveButton.onclick = () => {
            const type = window.cReqType.getValue();
            
            window.eventManager.saveRequirementOrBonus({
                type,
                isBonus,
                prefix,
                items,
                editor,
                updateListFn: updateList
            });
        };

        cancelButton.onclick = () => {
            editor.classList.remove('active');
            delete editor.dataset.editIndex;
        };

        updateList();
        updateValueField();
        editor.classList.remove('active');
    }

    onRequirementFieldChange(fieldName, value) {
        console.log(`Requirement field changed: ${fieldName} = ${value}`);
    }

    loadAvailableImages() {
        const imageSelect = document.getElementById('event-image');
        const iconSelect = document.getElementById('event-icon');

        if (imageSelect) {
            const images = ['diplomacy', 'war', 'economy', 'culture'];
            imageSelect.innerHTML = images.map(img => 
                `<option value="${img}">${img}</option>`
            ).join('');
        }

        if (iconSelect) {
            const icons = ['diplomacy', 'war', 'economy', 'culture'];
            iconSelect.innerHTML = icons.map(icon => 
                `<option value="${icon}">${icon}</option>`
            ).join('');
        }
    }

    backToEventsList() {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById('events').classList.add('active');
    }

    showGroupFilterModal() {
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

        const groups = new Set();
        if (!this.jsonData?.custom_events) {
            console.warn('Нет данных о событиях');
            return;
        }

        Object.values(this.jsonData.custom_events).forEach(event => {
            if (event.group_name) {
                event.group_name.split(/\s*,\s*/).forEach(group => {
                    if (group) groups.add(group);
                });
            }
        });

        console.log('Найдено групп:', groups.size);

        const sortedGroups = Array.from(groups).sort();

        groupsList.innerHTML = sortedGroups.map(group => {
            const isChecked = this.filters.groups?.includes(group);
            return `
                <div class="group-checkbox-item">
                    <input type="checkbox" id="group-${group}" value="${group}"
                           ${isChecked ? 'checked' : ''}>
                    <label for="group-${group}">${group}</label>
                </div>
            `;
        }).join('');

        const applyButton = modal.querySelector('#groups-filter-apply');
        const clearButton = modal.querySelector('#groups-filter-clear');
        const closeButton = modal.querySelector('.close-modal');

        const newApplyButton = applyButton.cloneNode(true);
        const newClearButton = clearButton.cloneNode(true);
        const newCloseButton = closeButton.cloneNode(true);

        applyButton.parentNode.replaceChild(newApplyButton, applyButton);
        clearButton.parentNode.replaceChild(newClearButton, clearButton);
        closeButton.parentNode.replaceChild(newCloseButton, closeButton);

        newApplyButton.addEventListener('click', () => {
            const checkedGroups = Array.from(groupsList.querySelectorAll('input[type="checkbox"]:checked'))
                .map(checkbox => checkbox.value);
            
            if (checkedGroups.length > 0) {
                this.filters.groups = checkedGroups;
            } else {
                delete this.filters.groups;
            }
            
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

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                modal.classList.remove('active');
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        modal.classList.add('active');
    }

    showFilterModal(column) {
        const modal = document.getElementById('events-filter-modal');
        const title = modal.querySelector('.modal-title');
        const operatorSelect = document.getElementById('events-filter-operator');
        const valueContainer = document.getElementById('events-filter-value-container');

        title.textContent = `${window.translator.translate('filter')}: ${this.getColumnTitle(column)}`;

        operatorSelect.innerHTML = `
            <option value="equals">${window.translator.translate('filter_equals')}</option>
            <option value="not_equals">${window.translator.translate('filter_not_equals')}</option>
            <option value="contains">${window.translator.translate('filter_contains')}</option>
        `;

        let inputType = 'text';
        let placeholder = 'filter_text_value';
        
        if (['order', 'year', 'duration'].includes(column)) {
            inputType = 'number';
            placeholder = 'filter_number_value';
        }

        valueContainer.innerHTML = `
            <input type="${inputType}" id="events-filter-value" class="main-page-input" 
                   placeholder="${window.translator.translate(placeholder)}"
                   ${inputType === 'number' ? 'min="0"' : ''}>
        `;

        if (this.filters[column]) {
            operatorSelect.value = this.filters[column].operator;
            document.getElementById('events-filter-value').value = this.filters[column].value;
        }

        const applyButton = modal.querySelector('#events-filter-apply');
        const clearButton = modal.querySelector('#events-filter-clear');
        const closeButton = modal.querySelector('.close-modal');

        const newApplyButton = applyButton.cloneNode(true);
        const newClearButton = clearButton.cloneNode(true);
        const newCloseButton = closeButton.cloneNode(true);

        applyButton.parentNode.replaceChild(newApplyButton, applyButton);
        clearButton.parentNode.replaceChild(newClearButton, clearButton);
        closeButton.parentNode.replaceChild(newCloseButton, closeButton);

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

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                modal.classList.remove('active');
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

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

    switchStyle() {
        const element = document.getElementById('event-form-container');
        element.classList.toggle('oldview');
        if (element.classList.contains('oldview')) {
            localStorage.setItem('eeditorEventEditStyle', 'grid');
        } else {
            localStorage.setItem('eeditorEventEditStyle', 'flex');
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    window.eventManager = new EventManager();
});

function createRequirementEditor() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = ``;
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

document.addEventListener('click', function(e) {
    if (e.target.matches('#add-requirement')) {
        const modal = createRequirementEditor();
        window.translator.updateModals(modal);
        window.translator.updateAllTranslations();
    }
});

document.addEventListener('click', function(e) {
    if (e.target.matches('#add-bonus')) {
        const modal = createBonusEditor();
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

document.addEventListener('DOMContentLoaded', () => { 
    document.querySelectorAll('.requirements-button').forEach(button => {
        button.onclick = () => {
            document.getElementById('event-requirements-jakor').scrollIntoView({ behavior: 'smooth' });
        };
    });
});