class Translator {
    constructor() {
        this.currentLang = 'en';
        this.translations = translations;
        this.initEventListeners();
        
        // Загружаем язык после небольшой задержки, чтобы DOM успел загрузиться
        setTimeout(() => {
            this.loadSavedLanguage();
        }, 100);
    }

    initEventListeners() {
        document.querySelectorAll('#langDropdown a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const lang = e.target.dataset.lang;
                this.setLanguage(lang);
                document.getElementById('langDropdown').classList.remove('active');
            });
        });
    }

    loadSavedLanguage() {
        const body = document.body;
        const savedLang = body.getAttribute('data-lang') || 'en';
        this.setLanguage(savedLang);
    }

    setLanguage(lang) {
        if (!this.translations[lang]) return;

        this.currentLang = lang;
        
        // Сохраняем язык в атрибуте body
        document.body.setAttribute('data-lang', lang);
        
        // Обновляем только title кнопки выбора языка
        const currentLangButton = document.getElementById('currentLang');
        if (currentLangButton) {
            currentLangButton.setAttribute('title', this.getLanguageName(lang));
        }

        this.updateAllTranslations();
    }

    getLanguageName(lang) {
        const names = {
            'en': 'English',
            'ru': 'Русский',
            'uk': 'Українська'
        };
        return names[lang] || 'English';
    }

    translate(key) {
        return this.translations[this.currentLang]?.[key] || key;
    }

    updateAllTranslations() {
        // Обновляем все элементы с атрибутом data-translate
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.dataset.translate;
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.placeholder) {
                    element.placeholder = this.translate(key);
                }
            } else {
                element.textContent = this.translate(key);
            }
        });

        // Обновляем навигационные кнопки
        this.updateNavButtons();

        // Обновляем основные страницы
        this.updateMainPage();
        this.updateCountriesPage();
        this.updateEventsPage();
        this.updateReformsPage();

        // Обновляем модальные окна
        this.updateModals();

        // Обновляем формы
        this.updateForms();
    }

    updateNavButtons() {
        const navButtons = {
            'main': 'editor',
            'countries': 'countries',
            'events': 'events'
        };

        for (const [pageId, translationKey] of Object.entries(navButtons)) {
            const button = document.querySelector(`.navbtn[data-page="${pageId}"]`);
            if (button) {
                const textSpan = button.querySelector('.button-text');
                if (textSpan) {
                    textSpan.textContent = this.translate(translationKey);
                }
                // Добавляем тултип для мобильной версии
                button.setAttribute('data-tooltip', this.translate(translationKey));
            }
        }

        // Кнопка сохранения
        const saveButton = document.getElementById('force-save');
        if (saveButton) {
            const textSpan = saveButton.querySelector('.button-text');
            if (textSpan) {
                textSpan.textContent = this.translate('save');
            } else {
                saveButton.textContent = this.translate('save');
            }
            // Добавляем тултип для мобильной версии
            saveButton.setAttribute('data-tooltip', this.translate('save'));
        }
    }

    updateMainPage() {
        // Обновляем текст в зоне загрузки файла
        const dropZone = document.getElementById('drop-zone');
        if (dropZone) {
            const dragText = dropZone.querySelector('p');
            if (dragText) {
                dragText.textContent = this.translate('drag_file_here');
            }
            const fileLabel = dropZone.querySelector('label');
            if (fileLabel) {
                fileLabel.textContent = this.translate('choose_file');
            }
        }

        // Обновляем заголовок предпросмотра
        const previewFilename = document.getElementById('preview-filename');
        if (previewFilename) {
            previewFilename.textContent = this.translate('file_preview');
        }

        // Обновляем метки в форме настроек
        const settingsLabels = {
            'name': 'title',
            'id': 'id',
            'last_turn': 'last_turn',
            'year': 'year',
            'month': 'month',
            'play_after_last_turn': 'play_after_last_turn',
            'technology_lvl': 'technology_lvl',
            'technologies_are_opened': 'technologies_are_opened',
            'resources_spawn': 'resources_spawn',
            'difficulty': 'difficulty',
            'bots_behavior': 'bots_behavior',
            'no_initial_diplomacy': 'no_initial_diplomacy',
            'water_color': 'water_color',
            'no_nuclear_weapon': 'no_nuclear_weapon',
            'sandbox': 'sandbox',
            'turn': 'turn',
            'player_land': 'player_land',
            'fog_of_war': 'fog_of_war',
            'map_hash': 'map_hash',
            'num_of_provinces': 'num_of_provinces',
            'min_game_version': 'min_game_version'
        };

        for (const [inputId, translationKey] of Object.entries(settingsLabels)) {
            const label = document.querySelector(`label[for="${inputId}"]`);
            if (label) {
                label.textContent = this.translate(translationKey);
            }
        }

        // Обновляем значения в выпадающих списках
        this.updateDropdownValues();
    }

    updateDropdownValues() {
        const dropdowns = {
            'play_after_last_turn': ['enabled', 'disabled'],
            'technologies_are_opened': ['enabled', 'disabled'],
            'resources_spawn': ['low', 'standard', 'few'],
            'difficulty': ['easy', 'standard', 'hard', 'impossible'],
            'bots_behavior': ['peaceful', 'standard', 'aggressive'],
            'no_initial_diplomacy': ['enabled', 'disabled'],
            'no_nuclear_weapon': ['enabled', 'disabled'],
            'sandbox': ['enabled', 'disabled'],
            'fog_of_war': ['standard']
        };

        for (const [selectId, values] of Object.entries(dropdowns)) {
            const select = document.getElementById(selectId);
            if (select) {
                Array.from(select.options).forEach(option => {
                    const value = option.value;
                    if (values.includes(value)) {
                        option.textContent = this.translate(value);
                    }
                });
            }
        }
    }

    updateCountriesPage() {
        // Заголовок страницы
        const title = document.querySelector('#countries h2');
        if (title) {
            title.textContent = this.translate('countries_title');
        }

        // Заголовки таблицы
        const tableHeaders = {
            0: 'color',
            1: 'name',
            2: 'system_name',
            3: 'provinces_count',
            4: 'capital'
        };

        const headers = document.querySelectorAll('.countries-table th');
        headers.forEach((header, index) => {
            if (tableHeaders[index]) {
                header.textContent = this.translate(tableHeaders[index]);
            }
        });
    }

    updateEventsPage() {
        // Заголовок страницы
        const title = document.querySelector('#events h2');
        if (title) {
            title.textContent = this.translate('events_title');
        }

        // Заголовки таблицы
        const tableHeaders = {
            0: 'event_id',
            1: 'event_group',
            2: 'event_name',
            3: 'event_title'
        };

        const headers = document.querySelectorAll('.events-table th');
        headers.forEach((header, index) => {
            if (tableHeaders[index]) {
                header.textContent = this.translate(tableHeaders[index]);
            }
        });

        // Форма редактирования события
        this.updateEventForm();
    }

    updateEventForm() {
        const labels = {
            'event-image': 'event_image',
            'event-icon': 'event_icon',
            'event-id': 'event_id',
            'event-group-name': 'event_group_name',
            'event-unique-name': 'event_unique_name',
            'event-title': 'event_title',
            'event-hide-later': 'event_hide_later',
            'event-delete-turns': 'event_delete_turns',
            'event-description': 'event_description'
        };

        for (const [inputId, translationKey] of Object.entries(labels)) {
            const label = document.querySelector(`label[for="${inputId}"]`);
            if (label) {
                label.textContent = this.translate(translationKey);
            }
        }

        // Ответы
        for (let i = 1; i <= 3; i++) {
            const answerBlock = document.querySelector(`.answer-block:nth-child(${i})`);
            if (answerBlock) {
                const title = answerBlock.querySelector('h3');
                if (title) {
                    title.textContent = this.translate(`answer_${i}`);
                }

                const labels = {
                    [`event-answer${i}`]: 'answer_text',
                    [`event-description${i}`]: 'result_description',
                    [`event-auto-answer${i}`]: 'auto_select',
                    [`event-answer${i}-disabled`]: 'enable_answer'
                };

                for (const [inputId, translationKey] of Object.entries(labels)) {
                    const label = document.querySelector(`label[for="${inputId}"]`);
                    if (label) {
                        label.textContent = this.translate(translationKey);
                    }
                }
            }
        }
    }

    updateReformsPage() {
        // Заголовок страницы
        const title = document.querySelector('#reforms h2');
        if (title) {
            title.textContent = this.translate('reforms_title');
        }

        // Заголовки таблицы
        const tableHeaders = {
            0: 'color',
            1: 'name',
            2: 'required_ideology',
            3: 'provinces_amount'
        };

        const headers = document.querySelectorAll('.reforms-table th');
        headers.forEach((header, index) => {
            if (tableHeaders[index]) {
                header.textContent = this.translate(tableHeaders[index]);
            }
        });

        // Форма редактирования реформы
        const formLabels = {
            'reform-name': 'name',
            'reform-ideology': 'required_ideology'
        };

        for (const [inputId, translationKey] of Object.entries(formLabels)) {
            const label = document.querySelector(`label[for="${inputId}"]`);
            if (label) {
                label.textContent = this.translate(translationKey);
            }
        }
    }

    updateModals() {
        // Модальное окно выбора страны
        const countryModal = document.getElementById('country-select-modal');
        if (countryModal) {
            const title = countryModal.querySelector('h3');
            if (title) {
                title.textContent = this.translate('select_country');
            }

            const select = document.getElementById('country-select');
            if (select) {
                const placeholder = select.querySelector('option[value=""]');
                if (placeholder) {
                    placeholder.textContent = this.translate('select_country_placeholder');
                }
            }

            const turnLabel = countryModal.querySelector('label[for="country-turn"]');
            if (turnLabel) {
                turnLabel.textContent = this.translate('turn_number');
            }

            const addButton = document.getElementById('add-selected-country');
            if (addButton) {
                addButton.textContent = this.translate('add');
            }
        }

        // Модальное окно редактора требований
        const reqModal = document.getElementById('requirements-editor-modal');
        if (reqModal) {
            const title = reqModal.querySelector('h3');
            if (title) {
                title.textContent = this.translate('requirements_editor');
            }

            const tableHeaders = {
                0: 'type',
                1: 'subtype',
                2: 'action',
                3: 'value'
            };

            const headers = reqModal.querySelectorAll('th');
            headers.forEach((header, index) => {
                if (tableHeaders[index]) {
                    header.textContent = this.translate(tableHeaders[index]);
                }
            });

            const labels = {
                'requirement-type': 'type',
                'requirement-action': 'action',
                'requirement-subtype': 'subtype',
                'requirement-value': 'value'
            };

            for (const [inputId, translationKey] of Object.entries(labels)) {
                const label = document.querySelector(`label[for="${inputId}"]`);
                if (label) {
                    label.textContent = this.translate(translationKey);
                }
            }

            const actionSelect = document.getElementById('requirement-action');
            if (actionSelect) {
                const actions = {
                    'more': 'more',
                    'equal': 'equal',
                    'not_equal': 'not_equal',
                    'less': 'less'
                };

                Array.from(actionSelect.options).forEach(option => {
                    const value = option.value;
                    if (actions[value]) {
                        option.textContent = this.translate(actions[value]);
                    }
                });
            }
        }

        // Обновляем модальные окна фильтров
        const filterModals = document.querySelectorAll('#filter-modal, #events-filter-modal, #groups-filter-modal, #countries-groups-filter-modal');
        filterModals.forEach(modal => {
            // Обновляем заголовок
            const title = modal.querySelector('.modal-title');
            if (title && title.hasAttribute('data-translate-params')) {
                const params = JSON.parse(title.getAttribute('data-translate-params'));
                title.textContent = `${this.translate(params.key)}: ${params.column}`;
            } else if (title && title.hasAttribute('data-translate')) {
                title.textContent = this.translate(title.getAttribute('data-translate'));
            }

            // Обновляем метки
            modal.querySelectorAll('[data-translate]').forEach(element => {
                element.textContent = this.translate(element.getAttribute('data-translate'));
            });

            // Обновляем операторы в select
            const operatorSelect = modal.querySelector('select');
            if (operatorSelect) {
                operatorSelect.querySelectorAll('option[data-translate]').forEach(option => {
                    option.textContent = this.translate(option.getAttribute('data-translate'));
                });
            }

            // Обновляем placeholder для поля ввода
            const input = modal.querySelector('input[placeholder]');
            if (input && input.hasAttribute('data-translate-placeholder')) {
                input.placeholder = this.translate(input.getAttribute('data-translate-placeholder'));
            }
        });
    }

    updateForms() {
        // Обновляем все метки форм
        document.querySelectorAll('label').forEach(label => {
            const forAttr = label.getAttribute('for');
            if (forAttr) {
                const input = document.getElementById(forAttr);
                if (input) {
                    const key = forAttr.replace(/-/g, '_');
                    const translation = this.translate(key);
                    if (translation !== key) {
                        label.textContent = translation;
                    }
                }
            }
        });

        // Обновляем все placeholder'ы
        document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(input => {
            const key = input.getAttribute('data-translate-placeholder');
            if (key) {
                input.placeholder = this.translate(key);
            }
        });

        // Обновляем все опции в select'ах
        document.querySelectorAll('select').forEach(select => {
            Array.from(select.options).forEach(option => {
                const key = option.getAttribute('data-translate-option');
                if (key) {
                    option.textContent = this.translate(key);
                }
            });
        });
    }
}

// Создаем глобальный экземпляр переводчика после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.translator = new Translator();
});
