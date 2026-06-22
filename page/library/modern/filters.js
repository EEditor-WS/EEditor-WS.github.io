(function (window) {
    'use strict';

    // Simple scenario filter that returns filtered and sorted list of scenarios
    let sortedScenariosList = []; // Store filtered scenarios here

    const libFilters = {
        filterScenarios  // Only expose the filter function
    };

    // Helper to get checked checkbox values
    function getCheckedValues(name) {
        return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(cb => cb.value);
    }

    // Main filter function that returns filtered scenarios from scenariosData
    function filterScenarios() {
        if (!scenariosData || !Array.isArray(scenariosData)) {
            console.error('scenariosData is not available or not an array');
            return [];
        }

        // Get all filter values
        const searchText = (document.getElementById('lib-search') || { value: '' }).value.toLowerCase();
        const authorFilter = (document.getElementById('lib-autor-filter') || { value: '' }).value.toLowerCase();
        const mapFilter = window.params.get('map');
        const typeFilter = (document.getElementById('lib-type-filter') || { value: '' }).value;
        const languageFilter = (document.getElementById('lib-language-filter') || { value: '' }).value;
        const rawFull = (document.getElementById('lib-full-id-filter') || { value: '' }).value;
        const fullIdFilter = rawFull ? rawFull.replace(/\.json$/i, '').trim().toLowerCase() : '';

        // Чистый фильтр периода из window.params (без привязки к HTML)
        const periodFilter = window.params.get('period'); 

        // Get status and mechanics filters
        const statusFilter = getCheckedValues('status');

        const mechanicsFilters = {
            economy: getCheckedValues('economy'),
            population: getCheckedValues('population'),
            resources: getCheckedValues('resources'),
            diplomacy: getCheckedValues('diplomacy'),
            rebellions: getCheckedValues('rebellions'),
            reforms: getCheckedValues('reforms'),
            events: getCheckedValues('events')
        };

        // Filter scenarios from scenariosData
        const filteredScenarios = scenariosData.filter(scenario => {
            let visible = true;

            // Search in title and description
            if (searchText) {
                const searchableText = [
                    scenario.title,
                    scenario.description,
                    scenario.author
                ].filter(Boolean).join(' ').toLowerCase();
                visible = visible && searchableText.includes(searchText);
            }

            // Author filter
            if (authorFilter) {
                const scenarioAuthor = String(scenario.author || '').toLowerCase();
                const searchAuthor = authorFilter.toLowerCase().replace(/^@/, '');
                const authorMatch = scenarioAuthor.includes(searchAuthor) || scenarioAuthor.replace(/^@/, '').includes(searchAuthor);
                visible = visible && authorMatch;
            }

            // Map filter
            if (mapFilter) {
                const scenarioMap = String(`${scenario.id[0]}_${scenario.id[1]}` || '');
                const mapMatch = scenarioMap == mapFilter;
                visible = visible && mapMatch;
            }

            // Type filter
            if (typeFilter) {
                const scenarioType = String(scenario.type || '').toLowerCase();
                visible = visible && scenarioType === typeFilter.toLowerCase();
            }

            // Language filter
            if (languageFilter) {
                const langs = typeof scenario.languages === 'string' ? 
                    scenario.languages.split(',').map(l => l.trim()) :
                    Array.isArray(scenario.languages) ? scenario.languages : [];
                const langMatch = langs.some(l => l.toLowerCase() === languageFilter.toLowerCase());
                visible = visible && langMatch;
            }

            // Status filter
            if (statusFilter.length > 0) {
                visible = visible && statusFilter.includes(scenario.status);
            }

            // === Фильтр по периоду из window.params ===
            if (periodFilter) {
                const scenarioPeriod = String(scenario.era || scenario.period || '').toLowerCase();
                visible = visible && scenarioPeriod === periodFilter.toLowerCase();
            }

            // Full ID filter
            if (fullIdFilter) {
                const scenarioFull = scenario.id.toLowerCase();
                visible = visible && scenarioFull === fullIdFilter;
            }

            // Mechanics filters
            Object.entries(mechanicsFilters).forEach(([mechanic, values]) => {
                if (values.length > 0) {
                    visible = visible && values.includes(scenario.mechanics[mechanic]);
                }
            });

            return visible;
        });

        // Sort by score and store in global variable
        sortedScenariosList = filteredScenarios.sort((a, b) => 
            (parseFloat(b.score) || 0) - (parseFloat(a.score) || 0)
        );

        return sortedScenariosList;
    }

    // Expose the module
    window.libFilters = libFilters;

})(window);

function libApplyFilters() {
    loadScenarios()
}

function libResetFilters() {
    // 1. Сбрасываем параметры в window.params (если это URLSearchParams или подобный объект)
    if (window.params && typeof window.params.delete === 'function') {
        window.params.delete('map');
        window.params.delete('period');
        
        // Если нужно, чтобы изменения отразились в адресной строке браузера без перезагрузки:
        if (window.history && window.history.replaceState) {
            const newUrl = window.location.pathname + (window.params.toString() ? '?' + window.params.toString() : '');
            window.history.replaceState({}, '', newUrl);
        }
    }

    // 2. Очищаем текстовые поля ввода и селекты
    const inputsToClear = ['lib-search', 'lib-autor-filter', 'lib-type-filter', 'lib-language-filter', 'lib-full-id-filter'];
    inputsToClear.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = ''; // Сбрасываем значение
        }
    });

    // 3. Снимаем галочки со всех чекбоксов (status, mechanics и т.д.)
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = false;
    });

    // 4. Перезапускаем фильтрацию, чтобы отобразить полный список сценариев
    if (window.libFilters && typeof window.libFilters.filterScenarios === 'function') {
        window.libFilters.filterScenarios();
    }
    
    // Если у вас на странице за вывод отвечает функция libApplyFilters, вызываем её:
    if (typeof libApplyFilters === 'function') {
        libApplyFilters();
    }
}

class LibraryFilters {
    constructor() {
        this.filters = {};
    }

    init() {

    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.LibraryFilters = LibraryFilters
})