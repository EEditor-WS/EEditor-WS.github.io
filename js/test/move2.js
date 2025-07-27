// Страны
function copyManyCountries() {
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    // Switch to pcopy-countries page
    const pageId = "pcopy-countries";
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId)?.classList.add('active');

    // Setup select all checkbox handler
    const selectAllCheckbox = document.getElementById('select-all-countries');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.onchange = (e) => {
            const checkboxes = document.querySelectorAll('#pcopy-countries-list input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = e.target.checked);
        };
    }
    
    // Populate countries list
    const countriesList = document.getElementById('pcopy-countries-list');
    if (!countriesList) return;
    
    countriesList.innerHTML = '';
    const countries = window.countryManager.jsonData?.lands;
    
    if (!countries) return;
    
    // Create a checkbox for each country
    Object.entries(countries).forEach(([id, country]) => {
        if (id === 'provinces') return;
        
        const div = document.createElement('div');
        div.className = 'country-item';
        
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = id;
        checkbox.dataset.countryId = id;
        
        const colorDiv = document.createElement('div');
        colorDiv.className = 'country-color';
        colorDiv.style.backgroundColor = window.countryManager.colorToRgb(country.color || [128, 128, 128]);
        
        const name = document.createElement('span');
        name.textContent = country.name || id;
        
        label.appendChild(checkbox);
        label.appendChild(colorDiv);
        label.appendChild(name);
        div.appendChild(label);
        countriesList.appendChild(div);
    });
    
    // Add copy button handler
    const copyButton = document.getElementById('copy-selected-countries');
    if (copyButton) {
        copyButton.onclick = () => {
            const selectedCountries = Array.from(document.querySelectorAll('#pcopy-countries-list input[type="checkbox"]:checked'))
                .map(checkbox => checkbox.dataset.countryId)
                .filter(Boolean);
            
            if (selectedCountries.length === 0) return;
            
            const countriesToCopy = selectedCountries.reduce((acc, id) => {
                if (window.countryManager.jsonData?.lands[id]) {
                    // Clone country data and remove capital and provinces fields
                    const countryData = JSON.parse(JSON.stringify(window.countryManager.jsonData.lands[id]));
                    if (countryData.reforms) {
                        countryData.reforms.forEach(reform => {
                            delete reform.capital;
                            delete reform.provinces;
                        });
                    }
                    acc[id] = countryData;
                }
                return acc;
            }, {});
            
            // Copy to clipboard
            const dataStr = JSON.stringify(countriesToCopy, null, 2);
            navigator.clipboard.writeText(dataStr).then(() => {
                // Show success notification
                showSuccess(window.translator.translate('ready'), 
                    window.translator.translate('copyed'));
            }).catch(err => {
                console.error('Failed to copy:', err);
                showError(window.translator.translate('error'), 
                    window.translator.translate('copy_failed'));
            });
        };
    }
}

async function pasteManyCountries() {
    try {
        const clipText = await navigator.clipboard.readText();
        let countries;
        try {
            countries = JSON.parse(clipText);
        } catch (e) {
            showError(window.translator.translate('error'), 
                window.translator.translate('invalid_json'));
            return;
        }

        if (!countries || typeof countries !== 'object') {
            showError(window.translator.translate('error'), 
                window.translator.translate('invalid_countries_data'));
            return;
        }        // Initialize lands if it doesn't exist
        if (!window.countryManager.jsonData) {
            window.countryManager.jsonData = {};
        }
        if (!window.countryManager.jsonData.lands) {
            window.countryManager.jsonData.lands = { provinces: {} };
        }

        // Get existing civilization IDs
        const existingIds = new Set(Object.keys(window.countryManager.jsonData.lands));

        // Process each country
        for (const [civilizationId, countryData] of Object.entries(countries)) {
            // Check if ID is already used
            if (existingIds.has(civilizationId)) {
                showError('Error', `country ${civilizationId} is used now`);
                continue;
            }

            // Clean up diplomatic relations
            const diplomaticFields = ['allies', 'enemies', 'guaranteed', 'guaranteed_by', 'pacts', 'sanctions', 'vassals'];
            diplomaticFields.forEach(field => {
                if (Array.isArray(countryData[field])) {
                    // Filter out references to non-existent countries
                    countryData[field] = countryData[field].filter(id => 
                        existingIds.has(id) || Object.keys(countries).includes(id)
                    );
                }
            });

            // Add the country to the data
            window.countryManager.jsonData.lands[civilizationId] = countryData;
            existingIds.add(civilizationId); // Add to existing IDs for next iterations
        }

        // Update the UI
        window.countryManager.updateCountriesList();
        showSuccess(window.translator.translate('ready'), 
            window.translator.translate('countries_pasted'));
            console.log('saving...');
            window.countryManager.saveScen();
            console.log('saved');

    } catch (err) {
        console.error('Failed to paste countries:', err);
        showError(window.translator.translate('error'), 
            window.translator.translate('paste_failed'));
    }
}

// События
function copyManyEvents() {
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    // Switch to pcopy-events page
    const pageId = "pcopy-events";
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId)?.classList.add('active');

    // Setup select all checkbox handler
    const selectAllCheckbox = document.getElementById('select-all-events');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.onchange = (e) => {
            const checkboxes = document.querySelectorAll('#pcopy-events-list input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = e.target.checked);
        };
    }
    
    // Populate events list
    const eventsList = document.getElementById('pcopy-events-list');
    if (!eventsList) return;
    
    eventsList.innerHTML = '';
    const events = window.eventManager.jsonData?.custom_events;
    
    if (!events) return;
    
    // Create a checkbox for each event
    Object.entries(events).forEach(([id, event]) => {
        if (id === 'provinces') return;
        const div = document.createElement('div');
        div.className = 'event-item';
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = id;
        checkbox.dataset.eventId = id;
        const name = document.createElement('span');
        name.textContent = event.title || event.unique_event_name || event.name || id;
        label.appendChild(checkbox);
        label.appendChild(name);
        div.appendChild(label);
        eventsList.appendChild(div);
    });
    
    // Add copy button handler
    const copyButton = document.getElementById('copy-selected-events');
    if (copyButton) {
        copyButton.onclick = () => {
            const selectedEvents = Array.from(document.querySelectorAll('#pcopy-events-list input[type="checkbox"]:checked'))
                .map(checkbox => checkbox.dataset.eventId)
                .filter(Boolean);
            if (selectedEvents.length === 0) return;
            const eventsToCopy = selectedEvents.reduce((acc, id) => {
                if (window.eventManager.jsonData?.custom_events[id]) {
                    // Клонируем событие
                    acc[id] = JSON.parse(JSON.stringify(window.eventManager.jsonData.custom_events[id]));
                }
                return acc;
            }, {});
            // Copy to clipboard
            const dataStr = JSON.stringify(eventsToCopy, null, 2);
            navigator.clipboard.writeText(dataStr).then(() => {
                showSuccess(window.translator.translate('ready'), window.translator.translate('copyed'));
            }).catch(err => {
                console.error('Failed to copy:', err);
                showError(window.translator.translate('error'), window.translator.translate('copy_failed'));
            });
        };
    }
}

async function pasteManyEvents() {
    try {
        const clipText = await navigator.clipboard.readText();
        let eventsData;
        try {
            eventsData = JSON.parse(clipText);
        } catch (e) {
            showError(window.translator.translate('error'), window.translator.translate('invalid_json'));
            return;
        }
        if (!eventsData || typeof eventsData !== 'object') {
            showError(window.translator.translate('error'), window.translator.translate('invalid_json'));
            console.error('PasteManyEvents: invalid JSON or not an object:', eventsData);
            alert(eventsData);
            return;
        }
        // Инициализируем custom_events если нужно
        if (!window.eventManager.jsonData) {
            window.eventManager.jsonData = {};
        }
        if (!window.eventManager.jsonData.custom_events) {
            window.eventManager.jsonData.custom_events = {};
        }
        // Получаем существующие eventId
        const existingIds = new Set(Object.keys(window.eventManager.jsonData.custom_events));
        // Вставляем события
        for (const [eventId, eventData] of Object.entries(eventsData)) {
            if (existingIds.has(eventId)) {
                showError('Error', `event ${eventId} is used now`);
                continue;
            }
            window.eventManager.jsonData.custom_events[eventId] = eventData;
            existingIds.add(eventId);
        }
        // Обновляем UI
        window.eventManager.updateEventsList();
        showSuccess(window.translator.translate('ready'), window.translator.translate('events_pasted'));
        if (window.eventManager.saveScen) {
            console.log('saving...');
            window.eventManager.saveScen();
            console.log('saved');
        }
    } catch (err) {
        console.error('Failed to paste events:', err);
        showError(window.translator.translate('error'), window.translator.translate('paste_failed') + ': ' + (err && err.message ? err.message : err));
        alert('Paste failed: ' + (err && err.message ? err.message : err));
    }
}

// Вспомогательная функция для получения вложенного значения
function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

// Вспомогательная функция для установки вложенного значения
function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((acc, key) => {
        if (!(key in acc)) acc[key] = {};
        return acc[key];
    }, obj);
    target[lastKey] = value;
}

function copyParam(param1, param2, param3, param4, param5) {
    const params = [param1, param2, param3, param4, param5].filter(Boolean); // исключаем undefined
    alert('Копирование параметров: ' + params.join(', '));
    
    const provPop = window.countryManager.jsonData.provinces.map(province => {
        const entry = {};
        for (const key of params) {
            const value = getNestedValue(province, key);
            setNestedValue(entry, key, value);
        }
        return entry;
    });

    localStorage.setItem("copyParam", JSON.stringify(provPop));
}

function pasteParam(param1, param2, param3, param4, param5) {
    const params = [param1, param2, param3, param4, param5].filter(Boolean); // исключаем пустые
    let updates;

    try {
        updates = JSON.parse(localStorage.copyParam || "[]");
    } catch (e) {
        console.error("Ошибка парсинга данных из localStorage:", e);
        return;
    }

    const provinces = window.countryManager.jsonData.provinces;

    provinces.forEach((province, idx) => {
        const update = updates[idx];
        if (!update) return;

        for (const key of params) {
            const value = getNestedValue(update, key);
            if (value !== undefined) {
                setNestedValue(province, key, value);
            }
        }
    });

    // Показываем результат
    previewContent.value = provinces;
}
