window.moveManager = {
    copiedEvent: null,
    lastCopiedText: null, // Добавляем переменную для хранения последнего скопированного текста
    parameterMappings: {
        civIds: new Map(),
        civNames: new Map(), 
        eventIds: new Map()
    },

    copyCurrentEvent() {
        const eventId = document.getElementById('event-id')?.value;
        if (!eventId) {
            showError('No event selected');
            return;
        }

        try {
            // Get event directly from JSON text
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

            // Get event text block and replace parameters
            const eventText = this.getEventTextBlock(jsonText, eventId);
            const processedText = this.replaceParameters(eventText);

            // Store for paste and in clipboard
            this.copiedEvent = processedText;
            this.lastCopiedText = processedText; // Сохраняем текст

            // Copy to clipboard
            navigator.clipboard.writeText(processedText)
                .then(() => showSuccess('Event copied to clipboard'))
                .catch(err => showError('Failed to copy to clipboard'));

        } catch (error) {
            console.error('Error copying event:', error);
            showError('Error copying event');
        }
    },

    getEventTextBlock(jsonText, eventId) {
        // Find the event block in the original text while preserving formatting
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
    },

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
    },

    // Function to paste copied event
    async pasteCurrentEvent() {
        try {
            // Сначала проверяем наш сохраненный текст
            let textToPaste = this.lastCopiedText;
            
            // Если его нет, пробуем получить из буфера обмена
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

            // Единый поиск всех параметров через одну регулярку
            const paramRegex = /(?:"value"|"subtype"):\s*"(copy_[a-z]+_[a-z0-9]+_\d+)"|"(copy_event_\d+)":\s*{/g;
            const parameters = new Set();
            let match;

            while ((match = paramRegex.exec(textToPaste)) !== null) {
                // match[1] для value/subtype, match[2] для event ID
                const param = match[1] || match[2];
                if (param) {
                    parameters.add(param);
                }
            }

            if (parameters.size > 0) {
                // Create modal wrapper
                const modal = document.createElement('div');
                modal.className = 'modal';
                
                // Add modal content
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
                                            ${this.getOptionsForParam(param)}
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

                // Add modal to body and show it
                document.body.appendChild(modal);
                // Важно! Делаем небольшую задержку перед добавлением класса active
                setTimeout(() => {
                    modal.classList.add('active');
                }, 10);

                try {
                    await new Promise((resolve) => {
                        document.getElementById('confirm-paste').onclick = () => {
                            try {
                                const form = document.getElementById('parameter-form');
                                const formData = new FormData(form);
                                let eventText = textToPaste;

                                // Replace all parameters with selected values at once
                                const replacements = Array.from(formData.entries())
                                    .sort((a, b) => b[0].length - a[0].length); // Сортируем по длине, чтобы избежать частичных замен

                                replacements.forEach(([param, value]) => {
                                    const regex = new RegExp(param.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
                                    eventText = eventText.replace(regex, value);
                                });

                                // Generate new event ID
                                const newId = this.generateNewEventId(data.custom_events);

                                // Parse event text into object
                                const tempObj = JSON.parse(`{${eventText}}`);
                                const originalId = Object.keys(tempObj)[0];

                                // Replace all occurrences of ID at once
                                const idRegex = new RegExp(`"${originalId}":|"id":\\s*"${originalId}"`, 'g');
                                eventText = eventText.replace(idRegex, match => 
                                    match.includes('"id":') ? `"id":"${newId}"` : `"${newId}":`
                                );

                                // Parse final event text
                                const parsedEvent = JSON.parse(`{${eventText}}`);
                                const eventObj = parsedEvent[newId];
                                
                                // Update data and UI once
                                eventObj.id = newId;
                                data.custom_events[newId] = eventObj;
                                document.getElementById('preview-content').value = JSON.stringify(data, null, 4);

                                // Single update for EventManager
                                if (window.eventManager) {
                                    window.eventManager.setJsonData(data);
                                }

                                showSuccess('Event pasted successfully');
                                document.body.removeChild(modal);
                                resolve();
                            } catch (e) {
                                console.error('Error processing event:', e);
                                showError('Invalid event format');
                                document.body.removeChild(modal);
                                resolve();
                            }
                        };

                        const closeModal = () => {
                            document.body.removeChild(modal);
                            resolve();
                        };

                        document.getElementById('cancel-paste').onclick = closeModal;
                        modal.querySelector('.close-modal').onclick = closeModal;
                    });
                } catch (e) {
                    if (document.body.contains(modal)) {
                        document.body.removeChild(modal);
                    }
                    throw e;
                }
            }
        } catch (error) {
            console.error('Error pasting event:', error);
            showError('Failed to paste event');
        }
    },

    getOptionsForParam(param) {
        const data = JSON.parse(document.getElementById('preview-content').value);
        
        if (param.startsWith('copy_civ_id_')) {
            return Object.entries(data.lands || {})
                .map(([id, land]) => `<option value="${id}">${land.name || id}</option>`)
                .join('');
        }
        
        if (param.startsWith('copy_civ_name_')) {
            return Object.values(data.lands || {})
                .map(land => `<option value="${land.name}">${land.name}</option>`)
                .join('');
        }
        
        if (param.startsWith('copy_event_')) {
            // Добавляем опцию для нового события
            const newId = this.generateNewEventId(data.custom_events);
            let options = [`<option value="${newId}">Новое событие</option>`];
            
            // Добавляем существующие события
            if (data.custom_events) {
                options.push(...Object.entries(data.custom_events)
                    .map(([id, event]) => {
                        const name = event.title || event.unique_event_name || id;
                        return `<option value="${id}">${id} - ${name}</option>`;
                    }));
            }
            
            return options.join('');
        }
        
        return '';
    },

    generateNewEventId(events) {
        // Находим все существующие номера ID
        const usedNumbers = Object.keys(events || {})
            .map(id => parseInt(id.replace('E', '')))
            .filter(num => !isNaN(num))
            .sort((a, b) => a - b);

        // Ищем первый свободный номер, начиная с 1
        let newNumber = 1;
        for (const num of usedNumbers) {
            if (num > newNumber) {
                break;
            }
            newNumber = num + 1;
        }

        return `E${newNumber}`; // Возвращаем ID в формате E№
    },

    // Get unique parameters that need to be replaced
    getUniqueParameters(event) {
        const parameters = new Set();
        
        const searchForParameters = (obj) => {
            for (const key in obj) {
                if (typeof obj[key] === 'string' && obj[key].startsWith('copy_')) {
                    parameters.add(obj[key]);
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    searchForParameters(obj[key]);
                }
            }
        };

        searchForParameters(event);
        return Array.from(parameters);
    },

    // Show dialog for parameter selection
    async showParameterSelectionDialog(parameters) {
        return new Promise((resolve) => {
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'block';

            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';

            // Add header
            const header = document.createElement('div');
            header.className = 'modal-header';
            header.innerHTML = '<h3>Select New Parameters</h3>';
            modalContent.appendChild(header);

            // Add body with parameter inputs
            const body = document.createElement('div');
            body.className = 'modal-body';

            parameters.forEach(param => {
                const formGroup = document.createElement('div');
                formGroup.className = 'form-group';

                const label = document.createElement('label');
                label.textContent = `Replace ${param} with:`;
                formGroup.appendChild(label);

                const select = document.createElement('select');
                select.className = 'main-page-input';
                select.dataset.param = param;

                // Add civilization options
                const civilizations = window.scenarioManager.getCivilizations();
                civilizations.forEach(civ => {
                    const option = document.createElement('option');
                    option.value = civ.id;
                    option.textContent = civ.name;
                    select.appendChild(option);
                });

                formGroup.appendChild(select);
                body.appendChild(formGroup);
            });

            modalContent.appendChild(body);

            // Add footer with buttons
            const footer = document.createElement('div');
            footer.className = 'modal-footer';

            const cancelButton = document.createElement('button');
            cancelButton.className = 'action-button secondary';
            cancelButton.textContent = 'Cancel';
            cancelButton.onclick = () => {
                document.body.removeChild(modal);
                resolve(null);
            };

            const applyButton = document.createElement('button');
            applyButton.className = 'action-button';
            applyButton.textContent = 'Apply';
            applyButton.onclick = () => {
                const newParameters = {};
                parameters.forEach(param => {
                    const select = body.querySelector(`select[data-param="${param}"]`);
                    newParameters[param] = select.value;
                });
                document.body.removeChild(modal);
                resolve(newParameters);
            };

            footer.appendChild(cancelButton);
            footer.appendChild(applyButton);
            modalContent.appendChild(footer);

            modal.appendChild(modalContent);
            document.body.appendChild(modal);
        });
    },

    // Create new event with replaced parameters
    createEventWithNewParameters(event, newParameters) {
        const newEvent = JSON.parse(JSON.stringify(event));
        
        const replaceParameters = (obj) => {
            for (const key in obj) {
                if (typeof obj[key] === 'string' && obj[key].startsWith('copy_')) {
                    if (newParameters[obj[key]]) {
                        obj[key] = newParameters[obj[key]];
                    }
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    replaceParameters(obj[key]);
                }
            }
        };

        replaceParameters(newEvent);
        return newEvent;
    }
};
