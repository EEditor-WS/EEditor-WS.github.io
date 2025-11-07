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
        //const mapFilter = (document.getElementById('lib-map-filter') || { value: '' }).value.toLowerCase();
        const mapFilter = window.params.get('map');
        const typeFilter = (document.getElementById('lib-type-filter') || { value: '' }).value;
        const languageFilter = (document.getElementById('lib-language-filter') || { value: '' }).value;
        const rawFull = (document.getElementById('lib-full-id-filter') || { value: '' }).value;
        const fullIdFilter = rawFull ? rawFull.replace(/\.json$/i, '').trim().toLowerCase() : '';

        // Get status, period and mechanics filters
        const statusFilter = getCheckedValues('status');
        const timePeriods = Array.from(document.querySelectorAll('.checkbox-list input[type="checkbox"]:not([name="status"]):not([name^="mechanics"])')).map(cb => cb.value);

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
                console.log('Author filter:', { scenarioAuthor, searchAuthor, authorMatch });
            }

            // Map filter
            if (mapFilter) {
                const scenarioMap = String(`${scenario.id[0]}_${scenario.id[1]}` || '');
                const mapMatch = scenarioMap.includes(mapFilter);
                visible = visible && mapMatch;
                console.log('Map filter:', { scenarioMap, mapFilter, mapMatch });
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
                console.log('Language filter:', { langs, languageFilter, langMatch });
            }

            // Status filter
            if (statusFilter.length > 0) {
                visible = visible && statusFilter.includes(scenario.status);
            }

            // Period filter (эпоха)
            if (timePeriods.length > 0) {
                visible = visible && timePeriods.includes(scenario.era || scenario.period);
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

        return sortedScenariosList; // Return for convenience
    }

    // Expose the module
    window.libFilters = libFilters;

})(window);

function libApplyFilters() {
    getSortedScenarios()
}