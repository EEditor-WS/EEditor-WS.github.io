// Конфигурация полей для требований и бонусов
const reqbonConfig = {
    // Конфигурация бонусов
    bonuses: {
        // Бонусы с длительностью
        defense: { hasDuration: true },
        attack: { hasDuration: true },
        population_income: { hasDuration: true },
        building_cost: { hasDuration: true },
        relation_ideology_change: { hasDuration: true },
        relation_change: { hasDuration: true },
        accelerated_recruit_cost: { hasDuration: true },
        maintaining_army_cost_multiplier: { hasDuration: true },
        population_increase: { hasDuration: true },
        recruit_cost: { hasDuration: true },
        add_culture_population: { hasDuration: true },

        // Бонусы без длительности
        resurrect_country: { hasDuration: false },
        add_oil: { hasDuration: false },
        add_cruiser: { hasDuration: false },
        diplomacy_lift_sanctions: { hasDuration: false },
        diplomacy_sanctions: { hasDuration: false },
        diplomacy_pact: { hasDuration: false },
        add_random_culture_population: { hasDuration: false },
        diplomacy_alliance: { hasDuration: false },
        diplomacy_peace: { hasDuration: false },
        add_shock_infantry: { hasDuration: false },
        discontent: { hasDuration: false },
        annex_country: { hasDuration: false },
        add_tank: { hasDuration: false },
        diplomacy_war: { hasDuration: false },
        army_losses: { hasDuration: false },
        prestige: { hasDuration: false },
        add_battleship: { hasDuration: false },
        add_infantry: { hasDuration: false },
        science: { hasDuration: false },
        money: { hasDuration: false },
        change_country: { hasDuration: false }
    },

    // Конфигурация требований
    requirements: {
        near_water: {
            subType: false,
            value: 'boolean',
            actions: ['equal', 'not_equal']
        },
        independent_land: {
            subType: false,
            value: 'boolean',
            actions: ['equal', 'not_equal']
        },
        political_institution: {
            subType: false,
            value: 'ideology',
            actions: ['equal', 'not_equal']
        },
        no_enemy: {
            subType: false,
            value: 'boolean',
            actions: ['equal']
        },
        enemy_near_capital: {
            subType: false,
            value: 'boolean',
            actions: ['equal', 'not_equal']
        },
        lost_capital: {
            subType: false,
            value: 'boolean',
            actions: ['equal', 'not_equal']
        },
        has_pact: {
            subType: false,
            value: 'country',
            actions: ['equal', 'not_equal']
        },
        has_sanctions: {
            subType: false,
            value: 'country',
            actions: ['equal', 'not_equal']
        },
        has_war: {
            subType: false,
            value: 'country',
            actions: ['equal', 'not_equal']
        },
        land_id: {
            subType: false,
            value: 'country',
            actions: ['equal', 'not_equal']
        },
        land_name: {
            subType: false,
            value: 'country',
            actions: ['equal', 'not_equal']
        },
        is_defeated: {
            subType: false,
            value: 'country',
            actions: ['equal', 'not_equal']
        },
        cooldown: {
            subType: 'event',
            value: 'number',
            actions: ['more', 'less']
        },
        month: {
            subType: false,
            value: 'number',
            actions: ['more', 'equal', 'less']
        },
        year: {
            subType: false,
            value: 'number',
            actions: ['more', 'equal', 'less']
        },
        turn: {
            subType: false,
            value: 'number',
            actions: ['more', 'equal', 'less']
        },
        num_of_provinces: {
            subType: false,
            value: 'number',
            actions: ['more', 'equal', 'less']
        },
        random_value: {
            subType: false,
            value: 'number',
            actions: ['more', 'equal', 'less']
        },
        count_of_tasks: {
            subType: false,
            value: 'number',
            actions: ['more', 'equal', 'less']
        },
        tax: {
            subType: false,
            value: 'number',
            actions: ['more', 'equal', 'less']
        },
        land_power: {
            subType: false,
            value: 'number',
            actions: ['more', 'equal', 'less']
        },
        building_exists: {
            subType: false,
            value: 'building',
            actions: ['equal', 'not_equal']
        }
    }
};

// Экспортируем конфигурацию
window.reqbonConfig = reqbonConfig;