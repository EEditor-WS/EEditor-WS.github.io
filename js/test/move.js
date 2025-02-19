class MoveManager {
    constructor() {
        this.selectedCountries = new Set();
        this.selectedEvents = new Set();
        this.initialized = false;
        this.init();

        // Add new properties for event copying
        this.copiedEvent = null;
        this.lastCopiedText = null;
        this.parameterMappings = {
            civilizations: new Map(),
            events: new Map()
        };
    }

    init() {
        this.initEventListeners();
        this.updateLists();

        document.querySelectorAll('.nav-button').forEach(button => {
            button.addEventListener('click', () => {
                if (button.getAttribute('data-page') === 'move') {
                    this.updateLists();
                }
            });
        });

        document.addEventListener('countryDataLoaded', () => {
            if (document.querySelector('.pmove.active')) {
                this.updateLists();
            }
        });

        document.addEventListener('eventDataLoaded', () => {
            if (document.querySelector('.pmove.active')) {
                this.updateLists();
            }
        });
    }

    initEventListeners() {
        // Поиск стран
        document.getElementById('country-move-search')?.addEventListener('input', (e) => {
            this.filterCountries(e.target.value);
        });

        // Поиск событий
        document.getElementById('event-move-search')?.addEventListener('input', (e) => {
            this.filterEvents(e.target.value);
        });

        // Копирование
        document.getElementById('copy-selected')?.addEventListener('click', () => {
            this.copySelected();
        });

        // Вставка
        document.getElementById('paste-selected')?.addEventListener('click', () => {
            this.pasteFromClipboard();
        });

        // Выделить всё в странах
        document.getElementById('select-all-countries')?.addEventListener('click', () => {
            this.toggleSelectAllCountries();
        });

        // Выделить всё в событиях
        document.getElementById('select-all-events')?.addEventListener('click', () => {
            this.toggleSelectAllEvents();
        });
    }

    updateLists() {
        if (!window.countryManager?.jsonData || !window.eventManager?.jsonData) {
            console.log('Waiting for data to load...');
            return;
        }

        console.log('Updating move lists...');
        this.updateCountriesList();
        this.updateEventsList();
        this.initialized = true;
    }

    updateCountriesList() {
        const list = document.getElementById('countries-move-list');
        if (!list || !window.countryManager?.jsonData?.lands) {
            console.log('Countries list or data not found');
            return;
        }

        list.innerHTML = '';
        const countries = Object.entries(window.countryManager.jsonData.lands)
            .filter(([id]) => id !== 'provinces')
            .sort((a, b) => (a[1].name || '').localeCompare(b[1].name || ''));

        countries.forEach(([id, country]) => {
            const item = document.createElement('div');
            item.className = 'move-item';
            item.innerHTML = `
                <input type="checkbox" value="${id}" ${this.selectedCountries.has(id) ? 'checked' : ''}>
                <span>${country.name || id} (${id})</span>
            `;

            item.querySelector('input').addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedCountries.add(id);
                } else {
                    this.selectedCountries.delete(id);
                }
            });

            list.appendChild(item);
        });

        console.log(`Updated countries list: ${countries.length} items`);
    }

    updateEventsList() {
        const list = document.getElementById('events-move-list');
        if (!list) {
            console.log('Events list element not found');
            return;
        }

        // Проверяем структуру данных событий
        if (!window.eventManager?.jsonData) {
            console.log('No event data available');
            return;
        }

        list.innerHTML = '';
        let events = [];

        // Правильно извлекаем события из структуры данных
        const eventsData = window.eventManager.jsonData;
        if (eventsData.custom_events && typeof eventsData.custom_events === 'object') {
            // Если события находятся в custom_events
            events = Object.entries(eventsData.custom_events);
        } else if (eventsData.events && typeof eventsData.events === 'object') {
            // Если события находятся в events
            events = Object.entries(eventsData.events);
        } else if (typeof eventsData === 'object') {
            // Если события находятся в корне объекта
            events = Object.entries(eventsData);
        }

        console.log('Found events:', events.length);

        // Сортируем события
        events.sort((a, b) => {
            const nameA = a[1].name || a[1].title || a[0] || '';
            const nameB = b[1].name || b[1].title || b[0] || '';
            return nameA.localeCompare(nameB);
        });

        events.forEach(([id, event]) => {
            const item = document.createElement('div');
            item.className = 'move-item';
            
            // Используем имя события, заголовок или ID в качестве отображаемого текста
            const displayName = event.name || event.title || id;
            
            item.innerHTML = `
                <input type="checkbox" value="${id}" ${this.selectedEvents.has(id) ? 'checked' : ''}>
                <span>${displayName}</span>
            `;

            item.querySelector('input').addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedEvents.add(id);
                } else {
                    this.selectedEvents.delete(id);
                }
            });

            list.appendChild(item);
        });

        console.log(`Updated events list: ${events.length} items`);
    }

    filterCountries(query) {
        const list = document.getElementById('countries-move-list');
        if (!list) return;

        const items = list.getElementsByClassName('move-item');
        const lowerQuery = query.toLowerCase();

        for (const item of items) {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(lowerQuery) ? '' : 'none';
        }
    }

    filterEvents(query) {
        const list = document.getElementById('events-move-list');
        if (!list) return;

        const items = list.getElementsByClassName('move-item');
        const lowerQuery = query.toLowerCase();

        for (const item of items) {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(lowerQuery) ? '' : 'none';
        }
    }

    async copySelected() {
        if (!window.countryManager?.jsonData || !window.eventManager?.jsonData) return;

        // Сбрасываем маппинги перед новым копированием
        this.parameterMappings.civilizations.clear();
        this.parameterMappings.events.clear();

        const selectedData = {
            countries: {},
            events: {}
        };

        // Копируем и обрабатываем выбранные страны
        this.selectedCountries.forEach(id => {
            if (window.countryManager.jsonData.lands[id]) {
                const replacement = `copy_civilization_${this.parameterMappings.civilizations.size + 1}`;
                this.parameterMappings.civilizations.set(id, replacement);
                const countryData = JSON.parse(JSON.stringify(window.countryManager.jsonData.lands[id]));
                selectedData.countries[replacement] = countryData;
            }
        });

        // Копируем и обрабатываем выбранные события
        this.selectedEvents.forEach(id => {
            let eventData = null;
            if (window.eventManager.jsonData.custom_events?.[id]) {
                eventData = window.eventManager.jsonData.custom_events[id];
            }
            if (eventData) {
                const replacement = `copy_event_${this.parameterMappings.events.size + 1}`;
                this.parameterMappings.events.set(id, replacement);
                eventData = JSON.parse(JSON.stringify(eventData));
                
                // Заменяем ID стран в требованиях и бонусах события
                this.replaceCountryIdsInEvent(eventData);
                selectedData.events[replacement] = eventData;
            }
        });

        try {
            const dataStr = JSON.stringify(selectedData);
            await navigator.clipboard.writeText(dataStr);
            this.lastCopiedText = dataStr;
            showSuccess(window.translator.translate('ready'), window.translator.translate('copied_to_clipboard'));
        } catch (err) {
            console.error('Failed to copy:', err);
            showError(window.translator.translate('error'), window.translator.translate('copy_failed'));
        }
    }

    replaceCountryIdsInEvent(event) {
        const replaceInObject = (obj) => {
            for (let key in obj) {
                if (typeof obj[key] === 'string') {
                    // Replace civilization IDs
                    const civMatch = obj[key].match(/civilization_\d+/g);
                    if (civMatch) {
                        civMatch.forEach(civId => {
                            if (!this.parameterMappings.civilizations.has(civId)) {
                                const replacement = `copy_civilization_${this.parameterMappings.civilizations.size + 1}`;
                                this.parameterMappings.civilizations.set(civId, replacement);
                            }
                            obj[key] = obj[key].replace(civId, this.parameterMappings.civilizations.get(civId));
                        });
                    }

                    // Replace event IDs
                    const eventMatch = obj[key].match(/E\d+/g);
                    if (eventMatch) {
                        eventMatch.forEach(eventId => {
                            if (!this.parameterMappings.events.has(eventId)) {
                                const replacement = `copy_event_${this.parameterMappings.events.size + 1}`;
                                this.parameterMappings.events.set(eventId, replacement);
                            }
                            obj[key] = obj[key].replace(eventId, this.parameterMappings.events.get(eventId));
                        });
                    }
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    replaceInObject(obj[key]);
                }
            }
        };

        replaceInObject(event);
    }

    async pasteFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            if (!text.includes('copy_')) {
                showError('Invalid copied data');
                return;
            }

            // Если файл не открыт, создаём пустую структуру
            if (!window.eventManager.jsonData) {
                window.eventManager.jsonData = {
                    custom_events: {}
                };
            }
            if (!window.countryManager.jsonData) {
                window.countryManager.jsonData = {
                    lands: {}
                };
            }

            const data = JSON.parse(text);
            
            // Собираем все параметры для замены
            const parameters = new Set();
            const collectParams = (obj) => {
                for (const [key, value] of Object.entries(obj)) {
                    if (key.startsWith('copy_')) {
                        parameters.add(key);
                    }
                    if (typeof value === 'string' && value.includes('copy_')) {
                        // Ищем copy_ параметры в строковых значениях
                        const matches = value.match(/copy_[a-z_]+\d+/g);
                        if (matches) {
                            matches.forEach(match => parameters.add(match));
                        }
                    }
                    if (typeof value === 'object' && value !== null) {
                        collectParams(value);
                    }
                }
            };
            
            collectParams(data);

            if (parameters.size > 0) {
                // Создаем модальное окно
                const modal = document.createElement('div');
                modal.className = 'modal active';
                modal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>${window.translator.translate('select_parameters')}</h3>
                            <button class="close-modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="parameter-form">
                                ${Array.from(parameters).map(param => `
                                    <div class="form-group">
                                        <label>${window.translator.translate('replace')} "${param}" ${window.translator.translate('with')}:</label>
                                        <select name="${param}" class="main-page-input">
                                            ${this.getOptionsForParameter(param)}
                                        </select>
                                    </div>
                                `).join('')}
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button class="action-button secondary" id="cancel-paste">${window.translator.translate('cancel')}</button>
                            <button class="action-button" id="confirm-paste">${window.translator.translate('paste')}</button>
                        </div>
                    </div>
                `;

                document.body.appendChild(modal);

                // Обрабатываем выбор пользователя
                const replacements = await new Promise((resolve) => {
                    document.getElementById('confirm-paste').onclick = () => {
                        const form = document.getElementById('parameter-form');
                        const formData = new FormData(form);
                        const replacements = Object.fromEntries(formData);
                        document.body.removeChild(modal);
                        resolve(replacements);
                    };

                    const closeModal = () => {
                        document.body.removeChild(modal);
                        resolve(null);
                    };

                    document.getElementById('cancel-paste').onclick = closeModal;
                    modal.querySelector('.close-modal').onclick = closeModal;
                });

                if (replacements) {
                    // Применяем выбранные замены
                    this.applyParameterReplacements(data, replacements);
                    // И обновляем данные
                    this.updateDataAfterPaste(data, replacements);
                }
            } else {
                // Если нет параметров для замены, просто обновляем данные
                this.updateDataAfterPaste(data, {});
            }

        } catch (err) {
            console.error('Failed to paste:', err);
            showError(window.translator.translate('error'), window.translator.translate('paste_failed'));
        }
    }

    getOptionsForParameter(param) {
        if (param.startsWith('copy_civilization_')) {
            let options = [`<option value="new_country">Создать новую страну</option>`];
            
            // Add additional "Create new country" options if already used
            for (let i = 2; i <= this.newCountryCount + 2; i++) {
                options.push(`<option value="new_country${i}">Создать новую страну ${i}</option>`);
            }
            
            // Add existing countries
            options.push(...Object.entries(window.countryManager?.jsonData?.lands || {})
                .filter(([id]) => id !== 'provinces')
                .map(([id, country]) => `<option value="${id}">${country.name || id}</option>`));
            
            return options.join('');
        } else if (param.startsWith('copy_event_')) {
            let options = [`<option value="new_event">Создать новое событие</option>`];
            
            // Add additional "Create new event" options if already used
            for (let i = 2; i <= this.newEventCount + 2; i++) {
                options.push(`<option value="new_event${i}">Создать новое событие ${i}</option>`);
            }
            
            // Add existing events
            const events = window.eventManager?.jsonData?.custom_events || {};
            options.push(...Object.entries(events)
                .map(([id, event]) => `<option value="${id}">${event.name || event.title || id}</option>`));
            
            return options.join('');
        }
        return '';
    }

    applyParameterReplacements(data, replacements) {
        const replaceInObject = (obj) => {
            for (let key in obj) {
                if (typeof obj[key] === 'string') {
                    for (const [param, newValue] of Object.entries(replacements)) {
                        if (obj[key].includes(param)) {
                            obj[key] = obj[key].replace(param, newValue);
                        }
                    }
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    replaceInObject(obj[key]);
                }
            }
        };

        replaceInObject(data);
    }

    updateDataAfterPaste(data) {
        if (!data) return;

        // Инициализируем структуры данных, если они не существуют
        if (!window.eventManager.jsonData) {
            window.eventManager.jsonData = { custom_events: {} };
        }
        if (!window.eventManager.jsonData.custom_events) {
            window.eventManager.jsonData.custom_events = {};
        }

        if (!window.countryManager.jsonData) {
            window.countryManager.jsonData = { lands: {} };
        }
        if (!window.countryManager.jsonData.lands) {
            window.countryManager.jsonData.lands = {};
        }

        // Process all copy_ parameters in the data
        const replacements = {};
        let needNewCountry = false;
        let needNewEvent = false;

        const findReplacements = (obj) => {
            for (const [key, value] of Object.entries(obj)) {
                if (key.startsWith('copy_civilization_')) {
                    needNewCountry = true;
                    replacements[key] = this.generateNewCountryId();
                } else if (key.startsWith('copy_event_')) {
                    needNewEvent = true;
                    replacements[key] = this.generateNewEventId();
                }

                if (typeof value === 'string' && value.includes('copy_')) {
                    // Ищем copy_ параметры в строковых значениях
                    const civilizationMatches = value.match(/copy_civilization_\d+/g);
                    if (civilizationMatches) {
                        civilizationMatches.forEach(match => {
                            if (!replacements[match]) {
                                needNewCountry = true;
                                replacements[match] = this.generateNewCountryId();
                            }
                        });
                    }

                    const eventMatches = value.match(/copy_event_\d+/g);
                    if (eventMatches) {
                        eventMatches.forEach(match => {
                            if (!replacements[match]) {
                                needNewEvent = true;
                                replacements[match] = this.generateNewEventId();
                            }
                        });
                    }
                }

                if (typeof value === 'object' && value !== null) {
                    findReplacements(value);
                }
            }
        };

        findReplacements(data);

        // Создаем новые страны и события с уникальными ID
        if (needNewCountry) {
            Object.values(replacements)
                .filter(id => id.startsWith('civilization_'))
                .forEach(newId => {
                    if (!window.countryManager.jsonData.lands[newId]) {
                        window.countryManager.jsonData.lands[newId] = {
                            name: `Новая страна ${newId.split('_')[1]}`,
                            color: [
                                Math.floor(Math.random() * 256),
                                Math.floor(Math.random() * 256),
                                Math.floor(Math.random() * 256)
                            ],
                            capital_name: '',
                            defeated: false
                        };
                    }
                });
        }

        // Replace all occurrences of copy_ parameters
        const replaceInObject = (obj) => {
            for (let key in obj) {
                if (typeof obj[key] === 'string') {
                    let newValue = obj[key];
                    for (const [param, replacement] of Object.entries(replacements)) {
                        if (newValue.includes(param)) {
                            newValue = newValue.replace(new RegExp(param, 'g'), replacement);
                        }
                    }
                    obj[key] = newValue;
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    replaceInObject(obj[key]);
                }
            }
        };

        replaceInObject(data);

        // Add to undo stack if needed
        if (data.countries && Object.keys(data.countries).length > 0) {
            window.countryManager?.pushToUndoStack();
        }
        if (data.events && Object.keys(data.events).length > 0) {
            window.eventManager?.pushToUndoStack();
        }

        // Update data
        let updateRequired = false;

        if (data.countries && Object.keys(data.countries).length > 0) {
            Object.entries(data.countries).forEach(([id, country]) => {
                window.countryManager.jsonData.lands[id] = country;
            });
            updateRequired = true;
        }

        if (data.events && Object.keys(data.events).length > 0) {
            Object.entries(data.events).forEach(([id, event]) => {
                window.eventManager.jsonData.custom_events[id] = event;
            });
            updateRequired = true;
        }

        // Update UI if needed
        if (updateRequired) {
            if (window.countryManager.updateCountriesList) {
                window.countryManager.updateCountriesList();
            }
            if (window.eventManager.updateEventsList) {
                window.eventManager.updateEventsList();
            }
            this.updateLists();
            showSuccess(window.translator.translate('ready'), window.translator.translate('paste_successful'));
        }
    }

    generateNewCountryId() {
        if (!window.countryManager?.jsonData?.lands) return 'civilization_1';
        let n = 1;
        while (window.countryManager.jsonData.lands[`civilization_${n}`]) {
            n++;
        }
        return `civilization_${n}`;
    }

    generateNewEventId() {
        if (!window.eventManager?.jsonData?.custom_events) return 'E1';
        let n = 1;
        while (window.eventManager.jsonData.custom_events[`E${n}`]) {
            n++;
        }
        return `E${n}`;
    }

    toggleSelectAllCountries() {
        const list = document.getElementById('countries-move-list');
        if (!list) return;

        const checkboxes = list.querySelectorAll('input[type="checkbox"]');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);

        checkboxes.forEach(cb => {
            cb.checked = !allChecked;
            const event = new Event('change');
            cb.dispatchEvent(event);
        });
    }

    toggleSelectAllEvents() {
        const list = document.getElementById('events-move-list');
        if (!list) return;

        const checkboxes = list.querySelectorAll('input[type="checkbox"]');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);

        checkboxes.forEach(cb => {
            cb.checked = !allChecked;
            const event = new Event('change');
            cb.dispatchEvent(event);
        });
    }

    // Добавляем методы для работы с индивидуальными элементами
    copyCurrentEvent() {
        const currentEvent = window.eventManager?.getCurrentEvent();
        if (!currentEvent) {
            showError('Error', 'No event selected');
            return;
        }

        const data = {
            events: {
                [currentEvent.id]: currentEvent
            }
        };

        this.copyToClipboard(data);
    }

    copyCurrentCountry() {
        const currentCountry = window.countryManager?.currentCountry;
        if (!currentCountry || !window.countryManager?.jsonData?.lands[currentCountry]) {
            showError('Error', 'No country selected');
            return;
        }

        const data = {
            countries: {
                [currentCountry]: window.countryManager.jsonData.lands[currentCountry]
            }
        };

        this.copyToClipboard(data);
    }

    async copyToClipboard(data) {
        try {
            await navigator.clipboard.writeText(JSON.stringify(data));
            showSuccess(window.translator.translate('ready'), window.translator.translate('copied_to_clipboard'));
        } catch (err) {
            console.error('Failed to copy:', err);
            showError(window.translator.translate('error'), window.translator.translate('copy_failed'));
        }
    }

    // Add new methods for event handling
    copyCurrentEvent() {
        const eventId = document.getElementById('event-id')?.value;
        if (!eventId) {
            showError('No event selected');
            return;
        }

        try {
            const jsonText = document.getElementById('preview-content').value;
            const data = JSON.parse(jsonText);
            
            if (!data?.custom_events?.[eventId]) {
                showError('Event not found in data');
                return;
            }

            // Reset mappings
            this.parameterMappings.civIds.clear();
            this.parameterMappings.civNames.clear();
            this.parameterMappings.eventIds.clear();

            const eventText = this.getEventTextBlock(jsonText, eventId);
            const processedText = this.replaceParameters(eventText);

            this.copiedEvent = processedText;
            this.lastCopiedText = processedText;

            navigator.clipboard.writeText(processedText)
                .then(() => showSuccess('Event copied to clipboard'))
                .catch(err => showError('Failed to copy to clipboard'));

        } catch (error) {
            console.error('Error copying event:', error);
            showError('Error copying event');
        }
    }

    getEventTextBlock(jsonText, eventId) {
        const startMarker = `"${eventId}": {`;
        const start = jsonText.indexOf(startMarker);
        if (start === -1) return null;

        let bracketCount = 1;
        let position = start + startMarker.length;
        
        while (bracketCount > 0 && position < jsonText.length) {
            const char = jsonText[position];
            if (char === '{') bracketCount++;
            if (char === '}') bracketCount--;
            position++;
        }

        return jsonText.substring(start, position);
    }

    replaceParameters(text) {
        let result = text;

        // Find and replace civilization IDs
        const civIdRegex = /"(civilization_\d+)"/g;
        let match;
        while ((match = civIdRegex.exec(text)) !== null) {
            const original = match[1];
            if (!this.parameterMappings.civIds.has(original)) {
                const replacement = `copy_civ_id_${this.parameterMappings.civIds.size + 1}`;
                this.parameterMappings.civIds.set(original, replacement);
            }
            result = result.replace(original, this.parameterMappings.civIds.get(original));
        }

        // Find and replace civilization names
        const civNameRegex = /"name":\s*"([^"]+)"/g;
        while ((match = civNameRegex.exec(text)) !== null) {
            const original = match[1];
            if (!this.parameterMappings.civNames.has(original)) {
                const replacement = `copy_civ_name_${this.parameterMappings.civNames.size + 1}`;
                this.parameterMappings.civNames.set(original, replacement);
            }
            result = result.replace(`"${original}"`, `"${this.parameterMappings.civNames.get(original)}"`);
        }

        // Find and replace event IDs
        const eventIdRegex = /"(E\d+)"/g;
        while ((match = eventIdRegex.exec(text)) !== null) {
            const original = match[1];
            if (!this.parameterMappings.eventIds.has(original)) {
                const replacement = `copy_event_${this.parameterMappings.eventIds.size + 1}`;
                this.parameterMappings.eventIds.set(original, replacement);
            }
            result = result.replace(original, this.parameterMappings.eventIds.get(original));
        }

        return result;
    }

    async pasteCurrentEvent() {
        try {
            let textToPaste = this.lastCopiedText;
            
            if (!textToPaste) {
                try {
                    textToPaste = await navigator.clipboard.readText();
                } catch (e) {
                    console.warn('Could not access clipboard:', e);
                }
            }

            if (!textToPaste || !textToPaste.includes('copy_')) {
                showError('No copied event found');
                return;
            }

            const jsonText = document.getElementById('preview-content').value;
            const data = JSON.parse(jsonText);
            
            if (!data.custom_events) {
                data.custom_events = {};
            }

            const paramRegex = /(?:"value"|"subtype"):\s*"(copy_[a-z]+_[a-z0-9]+_\d+)"|"(copy_event_\d+)":\s*{/g;
            const parameters = new Set();
            let match;

            while ((match = paramRegex.exec(textToPaste)) !== null) {
                const param = match[1] || match[2];
                if (param) {
                    parameters.add(param);
                }
            }

            if (parameters.size > 0) {
                await this.showParameterSelectionDialog(textToPaste, data, parameters);
            }

        } catch (error) {
            console.error('Error pasting event:', error);
            showError('Failed to paste event');
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.moveManager = new MoveManager();
    
    // Если страница move активна при загрузке, обновляем списки
    if (document.querySelector('.pmove.active')) {
        window.moveManager.updateLists();
    }
});
