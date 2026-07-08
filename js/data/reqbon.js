// Конфигурация полей для требований и бонусов
const reqbonConfig = {
    // Конфигурация бонусов
    bonuses: {
        accelerated_recruit_cost: {
            subType: false,
            hasDuration: true,
            value: 'number'
        },
        add_resource: { 
            hasDuration: false,
            subType: [
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
            ],
            value: 'number'
        },
        add_artillery: {
            subType: false,
            hasDuration: false,
            value: 'number'
        },
        add_battleship: {
            subType: false,
            hasDuration: false,
            value: 'number'
        },
        add_cavalry: {
            subType: false,
            hasDuration: false,
            value: 'number'
        },
        add_cruiser: {
            subType: false,
            hasDuration: false,
            value: 'number'
        },
        add_culture_population: {
            subType: 'country',
            hasDuration: true,
            value: 'number'
        },
        add_infantry: {
            subType: false,
            hasDuration: false,
            value: 'number'
        },
        add_oil: {
            subType: false,
            hasDuration: false,
            value: 'number',
            hidden: true
        },
        add_random_culture_population: {
            subType: false,
            hasDuration: false,
            value: 'number'
        },
        add_shock_infantry: {
            subType: false,
            hasDuration: false,
            value: 'number'
        },
        add_submarine: {
            subType: false,
            hasDuration: false,
            value: 'number'
        },
        add_tank: {
            subType: false,
            hasDuration: false,
            value: 'number'
        },
        annex_country: {
            subType: false,
            hasDuration: false,
            value: 'country'
        },
        army_losses: {
            subType: false,
            hasDuration: false,
            value: 'number'
        },
        maintaining_army_cost_multiplier: {
            subType: false,
            hasDuration: true,
            value: 'number'
        },
        attack: {
            subType: false,
            hasDuration: true,
            value: 'number'
        },
        building_cost: {
            subType: false,
            hasDuration: true,
            value: 'number'
        },
        change_country: {
            subType: false,
            hasDuration: false,
            value: 'country'
        },
        change_political_institution: {
            subType: false,
            hasDuration: false,
            value: 'ideology'
        },
        defense: {
            subType: false,
            hasDuration: true,
            value: 'number'
        },
        diplomacy_war: {
            subType: 'country',
            hasDuration: false,
            value: false
        },
        diplomacy_peace: {
            subType: 'country',
            hasDuration: false,
            value: false
        },
        diplomacy_alliance: {
            subType: 'country',
            hasDuration: false,
            value: false
        },
        diplomacy_pact: {
            subType: 'country',
            hasDuration: false,
            value: false
        },
        diplomacy_sanctions: {
            subType: 'country',
            hasDuration: false,
            value: false
        },
        diplomacy_lift_sanctions: {
            subType: 'country',
            hasDuration: false,
            value: false
        },
        diplomacy_become_vassal: {
            subType: 'country',
            hasDuration: false,
            value: false
        },
        diplomacy_get_vassal: {
            subType: 'country',
            hasDuration: false,
            value: false
        },
        diplomacy_break_alliance: {
            subType: 'country',
            hasDuration: false,
            value: false
        },
        disable_external_diplomacy: {
            subType: false,
            hasDuration: true,
            value: [1]
        },
        discontent: {
            subType: false,
            hasDuration: true,
            value: 'number'
        },
        money: {
            subType: false,
            hasDuration: false,
            value: 'number'
        },
        population_increase: {
            subType: false,
            hasDuration: true,
            value: 'number'
        },
        population_income: {
            subType: false,
            hasDuration: true,
            value: 'number'
        },
        prestige: {
            subType: false,
            hasDuration: false,
            value: 'number'
        },
        recruit_cost: {
            subType: false,
            hasDuration: true,
            value: 'number'
        },
        relation_change: {
            subType: 'country',
            hasDuration: true,
            value: 'number'
        },
        relation_ideology_change: {
            subType: 'ideology',
            hasDuration: true,
            value: 'number'
        },
        resurrect_country: {
            subType: false,
            hasDuration: false,
            value: 'country'
        },
        science: {
            subType: false,
            hasDuration: false,
            value: 'number'
        },
        transfer_provinces: {
            subType: 'country',
            hasDuration: false,
            value: 'string'
        },
    },

    // Конфигурация требований
    requirements: {
        building_exists: {
            subType: false,
            value: window.buildings,
            action: ['equal', 'not_equal']
        },
        controls_capital: {
            subType: 'country',
            value: 'country',
            action: ['equal', 'not_equal']
        },
        cooldown: {
            subType: 'event',
            value: 'number',
            action: ['more', 'less'],
            rightAction: ['cooldownRecivedEvent', 'cooldownNoRepeat']
        },
        count_of_tasks: {
            subType: false,
            value: 'number',
            action: ['more', "equal", 'less']
        },
        discontent: {
            subType: false,
            value: 'number',
            action: ['more', 'less']
        },
        enemy_near_capital: {
            subType: false,
            value: [true, false],
            action: ['equal', 'not_equal']
        },
        event_choice: {
            subType: 'event',
            value: [1,2,3],
            action: 'country'
        },
        group_name: {
            subType: false,
            value: 'string',
            action: ['equal', 'not_equal']
        },
        has_alliance: {
            subType: 'country',
            value: 'country',
            action: ['equal', 'not_equal']
        },
        has_pact: {
            subType: 'country',
            value: 'country',
            action: ['equal', 'not_equal']
        },
        has_provinces: {
            subType: ['all', 'any'],
            value: 'string',
            action: ['equal', 'not_equal']
        },
        has_sanctions: {
            subType: 'country',
            value: 'country',
            action: ['equal', 'not_equal']
        },
        has_vassal: {
            subType: 'country',
            value: 'country',
            action: ['equal', 'not_equal']
        },
        has_war: {
            subType: 'country',
            value: 'country',
            action: ['equal', 'not_equal']
        },
        independent_land: {
            subType: false,
            value: [true],
            action: ['equal', 'not_equal']
        },
        is_defeated: {
            subType: false,
            value: 'country',
            action: ['equal', 'not_equal']
        },
        is_neighbor: {
            subType: false,
            value: 'country',
            action: ['equal', 'not_equal']
        },
        is_player: {
            subType: false,
            value: [true],
            action: ['equal', 'not_equal']
        },
        land_id: {
            subType: false,
            value: 'country',
            action: ['equal', 'not_equal']
        },
        land_name: {
            subType: false,
            value: 'string',
            action: ['equal', 'not_equal']
        },
        land_power: {
            subType: false,
            value: 'number',
            action: ['more', 'less']
        },
        lost_capital: {
            subType: false,
            value: [true],
            action: ['equal', 'not_equal']
        },
        money: {
            subType: false,
            value: 'number',
            action: ['more', 'less']
        },
        month: {
            subType: false,
            value: 'month',
            action: ['more', 'equal', 'less']
        },
        near_water: {
            subType: false,
            value: [true],
            action: ['equal', 'not_equal']
        },
        no_enemy: {
            subType: false,
            value: [true],
            action: ['equal', 'not_equal']
        },
        num_of_provinces: {
            subType: false,
            value: 'number',
            action: ['more', 'equal', 'less']
        },
        num_of_vassals: {
            subType: false,
            value: 'number',
            action: ['more', 'equal', 'less']
        },
        political_institution: {
            subType: false,
            value: 'ideology',
            action: ['equal', 'not_equal']
        },
        random_value: {
            subType: false,
            value: 'number',
            action: ['less']
        },
        received_event: {
            subType: 'country',
            value: 'event',
            action: ['equal', 'not_equal']
        },
        tax: {
            subType: false,
            value: 'number',
            action: ['more', 'less']
        },
        turn: {
            subType: false,
            value: 'number',
            action: ['more', 'equal', 'less']
        },
        year: {
            subType: false,
            value: 'number',
            action: ['more', 'equal', 'less']
        },
        num_of_players: {
            subType: false,
            value: 'number',
            action: ['more', 'equal', 'less']
        },
        has_resource: {
            subType: [
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
            ],
            value: 'number',
            action: ['more', 'equal', 'less']
        },
        has_prestige: {
            subType: false,
            value: 'number',
            action: ['more', 'equal', 'less']
        },
        has_science: {
            subType: false,
            value: 'number',
            action: ['more', 'equal', 'less']
        },
    }
};

// Конфигурация категорий для бонусов
const bonusCategories = {
    economy: [
        'money', 'building_cost', 'population_income', 'population_increase',
        'add_resource', 'recruit_cost', 'accelerated_recruit_cost',
        'maintaining_army_cost_multiplier', 'change_political_institution'
    ],
    military: [
        'defense', 'attack', 'army_losses', 'add_infantry', 'add_shock_infantry',
        'add_artillery', 'add_tank', 'add_cavalry', 'add_cruiser', 'add_battleship', 'add_submarine'
    ],
    population_and_culture: [
        'add_random_culture_population', 'add_culture_population', 'discontent'
    ],
    diplomacy: [
        'relation_change', 'relation_ideology_change', 'resurrect_country', 'annex_country',
        'change_country', 'disable_external_diplomacy', 'transfer_provinces'
    ],
    diplomacy_actions: [
        'diplomacy_lift_sanctions', 'diplomacy_sanctions', 'diplomacy_pact', 'diplomacy_alliance',
        'diplomacy_break_alliance', 'diplomacy_become_vassal', 'diplomacy_get_vassal',
        'diplomacy_peace', 'diplomacy_war'
    ],
    other: [
        'prestige', 'science'
    ]
};

// Конфигурация категорий для требований
const requirementCategories = {
    time_conditions: [
        'year', 'month', 'turn', 'cooldown', 'event_choice', 'received_event'
    ],
    countries: [
        'land_id', 'land_name', 'group_name', 'land_power', 'is_player', 'independent_land', 
        'is_defeated'
    ],
    territory: [
        'num_of_provinces', 'near_water', 'controls_capital', 'lost_capital', 'enemy_near_capital',
        'is_neighbor', 'has_provinces'
    ],
    diplomacy: [
        'has_pact', 'has_alliance', 'has_vassal', 'has_sanctions', 'has_war', 'no_enemy', 
        'num_of_vassals'
    ],
    economy_and_development: [
        'money', 'tax', 'discontent', 'building_exists', 'political_institution',
        'has_resource', 'has_prestige', 'has_science'
    ],
    other: [
        'random_value', 'count_of_tasks', 'num_of_players'
    ]
};


// Экспортируем конфигурацию
window.reqbonConfig = reqbonConfig;
window.bonusCategories = bonusCategories;
window.requirementCategories = requirementCategories;

window.requirementsManager = {
    // Get requirements/bonuses from a specific section
    getRequirements(section) {
        const container = document.getElementById(`event-${section}`);
        if (!container) {
            console.warn(`Container for ${section} not found`);
            return [];
        }

        const items = [];
        const itemElements = container.getElementsByClassName('array-list-item');
        
        Array.from(itemElements).forEach(item => {
            const content = item.querySelector('.item-content')?.textContent;
            if (!content) return;

            // Parse item content to extract type, action, value and subtype
            const parsed = this.parseItemContent(content);
            if (parsed) {
                items.push(parsed);
            }
        });

        return items;
    },

    // Parse item content string into requirement/bonus object
    parseItemContent(content) {
        // Basic format: "type action value (subtype)"
        const match = content.match(/^(\w+)\s*(\w+)?\s*([^(]+)(?:\(([^)]+)\))?$/);
        if (!match) return null;

        const [_, type, action, value, subtype] = match;
        
        // Create requirement object
        const requirement = {
            type: type.trim(),
            value: value.trim()
        };

        // Add action if present
        if (action && action !== 'undefined') {
            requirement.action = action.trim();
        }

        // Add subtype if present
        if (subtype) {
            requirement.subtype = subtype.trim();
        }

        return requirement;
    }
};

// Обновляем функцию создания поля значения
function updateValueField(type, currentValue = '') {
    const valueContainer = document.getElementById('requirement-value');
    if (!valueContainer) return;
    
    valueContainer.innerHTML = '';
    
    const config = window.reqbonConfig.requirements[type];
    if (!config) return;
    
    if (config.value === 'country') {
    }
    // Остальная логика для других типов...
}

let additionalActions = {};
additionalActions.addRecivedEvent = (params = {}) => {
    const { 
        prefix = '', 
        answer = '',
        eventId = window.eventManager?.currentEvent,
        // Готовые данные (приоритет над полями формы)
        action = 'equal',
        subtype = 'this',    // страна
        value = document.querySelector('select#requirement-subType').value      // событие
    } = params;
    
    // Получаем массив требований ИЗ ДАННЫХ
    const listKey = `requirements${answer ? `-${answer}` : ''}`;
    const items = window.eventManager?.jsonData?.custom_events?.[eventId]?.[listKey] || [];
    
    // Получаем редактор и функцию обновления
    const editor = document.getElementById(`${prefix}requirement-editor`);
    const updateListFn = window.eventManager?.updateList;
    
    // Вызываем сохранение с готовыми данными
    const result = window.eventManager?.saveRequirementOrBonus({
        type: 'received_event',
        isBonus: false,
        prefix,
        items,
        editor,
        updateListFn,
        data: { action, subtype, value },  // ← ПЕРЕДАЁМ ДАННЫЕ НАПРЯМУЮ
        isClose: false
    });
    
    if (!result) {
        console.warn('Не удалось сохранить received_event');
        return null;
    }
    
    return result;
};
additionalActions.noRepeat = (params = {}) => {
    const { 
        prefix = '', 
        answer = '',
        eventId = window.eventManager?.currentEvent,
        // Готовые данные (приоритет над полями формы)
        /*action = 'less',
        subtype = document.querySelector('select#requirement-subType').value,    // событие
        value = Number(document.querySelector('input#requirement-value').value) + 2      // длительность*/
        action = 'not_equal',
        subtype = 'this',
        value = window.eventManager?.currentEvent
    } = params;
    
    // Получаем массив требований ИЗ ДАННЫХ
    const listKey = `requirements${answer ? `-${answer}` : ''}`;
    const items = window.eventManager?.jsonData?.custom_events?.[eventId]?.[listKey] || [];
    
    // Получаем редактор и функцию обновления
    const editor = document.getElementById(`${prefix}requirement-editor`);
    const updateListFn = window.eventManager?.updateList;
    
    // Вызываем сохранение с готовыми данными
    const result = window.eventManager?.saveRequirementOrBonus({
        //type: 'cooldown',
        type: 'received_event',
        isBonus: false,
        prefix,
        items,
        editor,
        updateListFn,
        data: { action, subtype, value },  // ← ПЕРЕДАЁМ ДАННЫЕ НАПРЯМУЮ
        isClose: false
    });
    
    if (!result) {
        console.warn('Не удалось сохранить cooldown');
        return null;
    }
    
    return result;
}



// number, false, event, ideology, string

// Функция для создания кнопок выбора action
const createActionButtons = (selectedAction = '', availableActions = ['equal', 'not_equal', 'more', 'less'], eventType) => {
    const containerGreat = document.createElement('div');
    containerGreat.id = 'requirement-actions-container';

    const container = document.createElement('div');
    container.className = 'action-buttons-group';
    container.id = 'requirement-action-left';

    const container2 = document.createElement('div');
    container2.className = 'action-buttons-group';
    container2.id = 'requirement-action-right';
    
    const allActions = [
        { value: 'equal', icon: '=', title: 'Equal' },
        { value: 'not_equal', icon: '≠', title: 'Not Equal' },
        { value: 'more', icon: '>', title: 'Greater' },
        { value: 'less', icon: '<', title: 'Less' },
        { value: 'cooldownRecivedEvent', icon: 'Rec', title: 'Recived event', function: 'addRecivedEvent' },
        { value: 'cooldownNoRepeat', icon: 'NR', title: 'No repeat', function: 'noRepeat' },
    ];
    
    // Фильтруем только доступные actions
    const filteredActions = allActions.filter(a => availableActions.includes(a.value));

    function returnActionBtn(action, isRight = false) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'action-button';
        btn.dataset.value = action.value;
        btn.textContent = action.icon;
        btn.title = action.title;
        
        if (selectedAction === action.value) {
            btn.classList.add('active');
        }
        
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (isRight) {
                additionalActions[action.function]()
            } else {
                container.querySelectorAll('.action-button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });

        return(btn)
    }
    window.returnActionBtn = returnActionBtn;
    
    filteredActions.forEach(action => {
        const btn = returnActionBtn(action)
        
        container.appendChild(btn);
    });

    if (eventType && reqbonConfig.requirements?.[eventType]?.rightAction) {
        const rightFiltredActions = allActions.filter(a => reqbonConfig.requirements?.[eventType]?.rightAction.includes(a.value));
        rightFiltredActions.forEach(action => {
            const btn = returnActionBtn(action, true)
            
            container2.appendChild(btn);
        });
    }
    
    // Добавляем скрытый input для хранения значения
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.className = 'action-value';
    hiddenInput.value = selectedAction;
    container.appendChild(hiddenInput);

    containerGreat.appendChild(container)
    containerGreat.appendChild(container2)
    
    return containerGreat;
};

const returnPlace = (type, isBonus, place, eventId = '') => {
    const whereReqBon = isBonus ? 'bonuses' : 'requirements';
    const rb = window.reqbonConfig[whereReqBon];

    if (rb?.[type]?.[place]) {
        console.log(`returnPlace called: type=${type}, place=${place}, value=${rb[type][place]}`);
        
        if (rb[type][place] == false) {
            // Нет подтипа, возвращаем пустой элемент
            return false;
        } else if (place === 'action' && rb[type][place] instanceof Array && 
                   rb[type][place].every(v => ['equal', 'not_equal', 'more', 'less'].includes(v))) {
            // Создаем кнопки для action только если это массив символов сравнения
            console.log('Creating action buttons for:', rb[type][place]);
            return createActionButtons('', rb[type][place], type);
        } else if (rb[type][place] == 'string') {
            // Создаем текстовое поле
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `requirement-${place}`;
            input.className = 'main-page-input';
            console.log('returning from reqbon: ', input);
            return input;
        } else if (rb[type][place] == 'number') {
            // Создаем числовое поле
            const input = document.createElement('input');
            input.type = 'number';
            input.id = `requirement-${place}`;
            input.className = 'main-page-input';
            console.log('returning from reqbon: ', input);
            return input;
        } else if (rb[type][place] == 'country') {
            // Создаем выпадающий список для стран
            let lands = Object.entries(window.countryManager?.jsonData?.lands || {});
            lands = lands.filter(([id, country]) => id !== 'undeveloped_land');
            const countrySelect = document.createElement('select');
            countrySelect.id = `requirement-${place}`;
            countrySelect.className = 'main-page-input';    
            // Получаем и сортируем список стран по имени
            const countries = lands.map(([id, country]) => ({
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

            countrySelect.innerHTML = baseOptions;

            console.log('returning from reqbon: ', countrySelect);
            return countrySelect;
        } else if (rb[type][place] == 'event') {
            // Создаем выпадающий список для событий
            const eventSelect = document.createElement('select');
            eventSelect.id = `requirement-${place}`;
            eventSelect.className = 'main-page-input';

            let events = Object.entries(window.eventManager?.jsonData?.custom_events || {});

            // Приводим к удобному виду и сортируем по названию
            const sortedEvents = events.map(([id, event]) => ({
                id,
                title: event.title,
                name: event.title || id
            }))
            .sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()));

            eventSelect.innerHTML = `
                <option value="${eventId}">${window.translator.translate('this')}</option>
                ${sortedEvents.map(event => 
                    `<option value="${event.id}">${event.id} - ${event.name} - ${event.title}</option>`
                ).join('')}
            `;

            console.log('returning from reqbon: ', eventSelect);
            return eventSelect;
        } else if (rb[type][place] instanceof Array) {
            // Создаем выпадающий список из массива
            const select = document.createElement('select');
            select.id = `requirement-${place}`;
            select.className = 'main-page-input';
            select.innerHTML = rb[type][place].map(option => 
                `<option value="${option}">${option}</option>`
            ).join('');
            console.log('returning from reqbon: ', select);
            return select;
        } else if (rb[type][place] == 'boolean') {
            const div = document.createElement('div');
            div.id = `requirement-${place}`;
            div.className = 'main-page-input';
            div.innerHTML = `
                <input type="radio" name="req-subtype" value="true" id="req-subtype-true">
                <label for="req-subtype-true">${window.translator.translate('yes')}</label>
                <input type="radio" name="req-subtype" value="false" id="req-subtype-false">
                <label for="req-subtype-false">${window.translator.translate('no')}</label>
            `;
            console.log('returning from reqbon: ', div);
            return div;
        } else if (rb[type][place] == 'ideology') {
            const ideologySelect = document.createElement('select');
            ideologySelect.id = 'country-political';
            ideologySelect.name = 'political';
            ideologySelect.className = 'main-page-input';
            ideologySelect.innerHTML = `
                <option value="Democracy" data-translate="democracy">🗳️ Демократия</option>
                <option value="Communism" data-translate="communism">🚩 Коммунизм</option>
                <option value="Monarchy" data-translate="monarchy">👑 Монархия</option>
                <option value="Theocracy" data-translate="theocracy">✝️ Теократия</option>
                <option value="Fascism" data-translate="fascism">⚔️ Фашизм</option>
                <option value="Trade Republic" data-translate="trade_republic">💰 Торговая Республика</option>
            `;
            console.log('returning from reqbon: ', ideologySelect);
            return ideologySelect;
        } else if (rb[type][place] == 'month') {
            const monthSelect = document.createElement('select');
            monthSelect.id = `requirement-${place}`;
            monthSelect.className = 'main-page-input';
            monthSelect.innerHTML = `
                <option value="1">${window.translator.translate('january')}</option>
                <option value="2">${window.translator.translate('february')}</option>
                <option value="3">${window.translator.translate('march')}</option>
                <option value="4">${window.translator.translate('april')}</option>
                <option value="5">${window.translator.translate('may')}</option>
                <option value="6">${window.translator.translate('june')}</option>
                <option value="7">${window.translator.translate('july')}</option>
                <option value="8">${window.translator.translate('august')}</option>
                <option value="9">${window.translator.translate('september')}</option>
                <option value="10">${window.translator.translate('october')}</option>
                <option value="11">${window.translator.translate('november')}</option>
                <option value="12">${window.translator.translate('december')}</option>
            `;
            console.log('returning from reqbon: ', monthSelect);
            return monthSelect;
        } else {
            console.warn(`Unknown subtype for ${type} in ${place}`);
            return false;
        }
    }
}

// Экспортируем returnPlace в глобальный объект
window.returnPlace = returnPlace;