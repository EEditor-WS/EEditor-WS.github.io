class CountryManager {
    constructor() {
        this.currentCountry = null;
        this.jsonData = null;
        this.undoStack = [];
        this.redoStack = [];
        this.maxStackSize = 50;
        this.isEditing = false;
        
        // Добавляем параметры сортировки
        this.sortColumn = 'name'; // По умолчанию сортируем по имени
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
        const headers = document.querySelectorAll('.countries-table th');
        headers.forEach((header, index) => {
            header.addEventListener('click', () => {
                // Определяем колонку для сортировки
                const columns = ['color', 'name', 'id', 'provinces', 'capital'];
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
                this.updateCountriesList();
            });
        });
    }

    // Модифицируем метод updateCountriesList
    updateCountriesList() {
        const countriesList = document.getElementById('countries-list');
        if (!countriesList || !this.jsonData?.lands) return;

        // Очищаем список
        countriesList.innerHTML = '';

        // Подсчитываем количество провинций
        const provincesCount = {};
        if (this.jsonData.provinces) {
            for (const province of this.jsonData.provinces) {
                if (province.owner) {
                    provincesCount[province.owner] = (provincesCount[province.owner] || 0) + 1;
                }
            }
        }

        // Создаем отсортированный массив стран
        const countriesArray = Object.entries(this.jsonData.lands)
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
            row.onclick = () => this.openCountry(country.id);

            row.innerHTML = `
                <td><div class="country-color" style="background-color: ${this.colorToRgb(country.color)}"></div></td>
                <td>${country.name}</td>
                <td>${country.id}</td>
                <td>${country.provinces}</td>
                <td>${country.capital_name}</td>
            `;

            countriesList.appendChild(row);
        }
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
        document.getElementById('random-country-color')?.addEventListener('click', function() {
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            
            document.getElementById('country-color-r').value = r;
            document.getElementById('country-color-g').value = g;
            document.getElementById('country-color-b').value = b;
            
            updateCountryColorPreview();
        });

        // Кнопка возврата к списку стран
        document.getElementById('back-to-countries-list')?.addEventListener('click', () => this.backToCountriesList());
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
        this.saveChanges();
    }

    generateUniqueId() {
        const existingIds = Object.keys(this.jsonData.lands);
        let n = 1;
        while (existingIds.includes(`civilization_${n}`)) {
            n++;
        }
        return `civilization_${n}`;
    }

    copyCurrentCountry() {
        if (!this.currentCountry || !this.jsonData?.lands[this.currentCountry]) return;

        const newId = this.generateUniqueId();
        const currentCountry = this.jsonData.lands[this.currentCountry];
        
        this.pushToUndoStack();
        this.jsonData.lands[newId] = JSON.parse(JSON.stringify(currentCountry));
        this.jsonData.lands[newId].name += ' (копия)';
        
        this.updateCountriesList();
        this.openCountry(newId);
        this.saveChanges();
    }

    deleteCurrentCountry() {
        if (!this.currentCountry || !this.jsonData?.lands[this.currentCountry]) return;

        // confirm('Вы уверены, что хотите удалить эту страну?')

        if (true) {
            this.pushToUndoStack();
            delete this.jsonData.lands[this.currentCountry];
            this.updateCountriesList();
            this.switchToCountriesList();
            this.saveChanges();
        }
    }

    openCountry(countryId) {
        if (!this.jsonData?.lands?.[countryId]) return;

        this.currentCountry = countryId;
        const country = this.jsonData.lands[countryId];

        // Обновляем заголовок с галочкой
        if (window.countryUtils && typeof window.countryUtils.updateCountryHeader === 'function') {
            window.countryUtils.updateCountryHeader(country.name);
        }

        this.setFormValues({
            'country-name': country.name,
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
                    <h3 data-translate="relation_params">Параметры отношений</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label data-translate="select_country">Выберите страну</label>
                        <select class="param-country main-page-input">
                            <option value="" data-translate="select_country_placeholder">Выберите страну...</option>
                            ${this.generateCountryOptions()}
                        </select>
                    </div>
                    <div class="form-group">
                        <label data-translate="relation_turn">Ход начала</label>
                        <input type="number" class="param-turn main-page-input" value="${params.turn || 0}" min="0">
                    </div>
                    <div class="form-group">
                        <label data-translate="relation_duration">Длительность</label>
                        <input type="number" class="param-duration main-page-input" value="${params.duration || ''}" min="0">
                    </div>
                    ${relationType === 'sanctions' ? `
                    <div class="form-group">
                        <label data-translate="relation_initiator">Инициатор</label>
                        <select class="param-initiator main-page-input">
                            <option value="false" ${!params.initiator ? 'selected' : ''} data-translate="no">Нет</option>
                            <option value="true" ${params.initiator ? 'selected' : ''} data-translate="yes">Да</option>
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
                        <span data-translate="save">Сохранить</span>
                    </button>
                    <button class="action-button cancel-params">
                        <svg viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        <span data-translate="cancel">Отмена</span>
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
        const r = Math.round(parseFloat(colorArray[0]) || 0);
        const g = Math.round(parseFloat(colorArray[1]) || 0);
        const b = Math.round(parseFloat(colorArray[2]) || 0);
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