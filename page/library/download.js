function libShowFilters() {
    const filtersElement = document.querySelector('.lib-filters');
    if (filtersElement) {
        filtersElement.classList.toggle('active');
    }
}

function libToggleFilters() {
    const content = document.querySelector('.lib-filters-content');
    const button = document.querySelector('.collapse-filters');
    if (content && button) {
        content.classList.toggle('collapsed');
        button.textContent = content.classList.contains('collapsed') ? '▶' : '▼';
    }
}

function libToggleFilterGroup(header) {
    const content = header.nextElementSibling;
    const button = header.querySelector('.collapse-filter-group');
    
    content.classList.toggle('collapsed');
    button.classList.toggle('collapsed');
    button.textContent = content.classList.contains('collapsed') ? '▼' : '▶';
}

// Function to get URL parameters
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        search: params.get('search') || '',
        author: params.get('author') || '',
        map: params.get('map') || '',
        type: params.get('type') || '',
        language: params.get('lang') || '',
        period: params.getAll('period') || [],
        mechanics: {
            economy: params.getAll('economy') || [],
            population: params.getAll('population') || [],
            resources: params.getAll('resources') || [],
            diplomacy: params.getAll('diplomacy') || [],
            rebellions: params.getAll('rebellions') || [],
            reforms: params.getAll('reforms') || [],
            events: params.getAll('events') || []
        }
    };
}

// Function to update URL with current filters
function updateUrlWithFilters() {
    const params = new URLSearchParams();
    
    // Add basic filters
    const searchText = document.getElementById('lib-search').value;
    const authorFilter = document.getElementById('lib-autor-filter').value;
    const mapFilter = document.getElementById('lib-map-filter').value;
    const typeFilter = document.getElementById('lib-type-filter').value;
    const languageFilter = document.getElementById('lib-language-filter').value;

    if (searchText) params.set('search', searchText);
    if (authorFilter) params.set('author', authorFilter);
    if (mapFilter) params.set('map', mapFilter);
    if (typeFilter) params.set('type', typeFilter);
    if (languageFilter) params.set('lang', languageFilter);

    // Add period filters
    const timePeriods = Array.from(document.querySelectorAll('.checkbox-list input[type="checkbox"]:checked:not([name^="mechanics"])'))
        .map(cb => cb.value);
    timePeriods.forEach(period => params.append('period', period));

    // Add mechanics filters
    const mechanicsFilters = {
        economy: getCheckedValues('economy'),
        population: getCheckedValues('population'),
        resources: getCheckedValues('resources'),
        diplomacy: getCheckedValues('diplomacy'),
        rebellions: getCheckedValues('rebellions'),
        reforms: getCheckedValues('reforms'),
        events: getCheckedValues('events')
    };

    Object.entries(mechanicsFilters).forEach(([mechanic, values]) => {
        values.forEach(value => params.append(mechanic, value));
    });

    // Update URL without reloading the page
    const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.pushState({}, '', newUrl);
}

// Apply filters from URL parameters
function applyUrlParams() {
    const params = getUrlParams();

    // Set basic filters
    document.getElementById('lib-search').value = params.search;
    document.getElementById('lib-autor-filter').value = params.author;
    document.getElementById('lib-map-filter').value = params.map;
    document.getElementById('lib-type-filter').value = params.type;
    document.getElementById('lib-language-filter').value = params.language;

    // Set period checkboxes
    document.querySelectorAll('.checkbox-list input[type="checkbox"]:not([name^="mechanics"])')
        .forEach(cb => {
            cb.checked = params.period.includes(cb.value);
        });

    // Set mechanics checkboxes
    Object.entries(params.mechanics).forEach(([mechanic, values]) => {
        document.querySelectorAll(`input[name="${mechanic}"]`).forEach(cb => {
            cb.checked = values.includes(cb.value);
        });
    });

    // Apply filters
    libApplyFilters();
}

function libApplyFilters() {
    const searchText = document.getElementById('lib-search').value.toLowerCase();
    const authorFilter = document.getElementById('lib-autor-filter').value.toLowerCase();
    const mapFilter = document.getElementById('lib-map-filter').value.toLowerCase();
    const typeFilter = document.getElementById('lib-type-filter').value;
    const languageFilter = document.getElementById('lib-language-filter').value;
    const timePeriods = Array.from(document.querySelectorAll('.checkbox-list input[type="checkbox"]:checked:not([name^="mechanics"])'))
        .map(cb => cb.value);

    // Get mechanics filters
    const mechanicsFilters = {
        economy: getCheckedValues('economy'),
        population: getCheckedValues('population'),
        resources: getCheckedValues('resources'),
        diplomacy: getCheckedValues('diplomacy'),
        rebellions: getCheckedValues('rebellions'),
        reforms: getCheckedValues('reforms'),
        events: getCheckedValues('events')
    };

    // Get all cards and convert to array for sorting
    const cards = Array.from(document.querySelectorAll('.download-card'));
    
    // Filter and sort cards
    cards.forEach(card => {
        let visible = true;

        // Apply text search
        if (searchText) {
            visible = visible && card.textContent.toLowerCase().includes(searchText);
        }

        // Apply author filter
        if (authorFilter) {
            visible = visible && card.dataset.author.toLowerCase().includes(authorFilter);
        }

        // Apply map filter
        if (mapFilter) {
            visible = visible && card.dataset.mapId.toLowerCase() === mapFilter.toLowerCase();
        }

        // Apply type filter
        if (typeFilter) {
            visible = visible && card.dataset.type === typeFilter;
        }

        // Apply language filter
        if (languageFilter) {
            visible = visible && card.dataset.languages.includes(languageFilter);
        }

        // Apply time period filter
        if (timePeriods.length > 0) {
            visible = visible && timePeriods.includes(card.dataset.period);
        }

        // Apply mechanics filters
        const mechanics = JSON.parse(card.dataset.mechanics || '{}');
        Object.entries(mechanicsFilters).forEach(([mechanic, values]) => {
            if (values.length > 0) {
                visible = visible && values.includes(mechanics[mechanic]);
            }
        });

        // Update visibility
        card.style.display = visible ? '' : 'none';
    });

    // Re-sort visible cards
    const container = document.getElementById('download-cards');
    const visibleCards = cards.filter(card => card.style.display !== 'none')
        .sort((a, b) => {
            const scoreA = parseFloat(a.dataset.score) || 0;
            const scoreB = parseFloat(b.dataset.score) || 0;
            return scoreB - scoreA;
        });

    // Reappend cards in sorted order
    visibleCards.forEach(card => container.appendChild(card));

    // Update URL with current filters
    updateUrlWithFilters();
}

function getCheckedValues(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
        .map(cb => cb.value);
}

function libClearFilters() {
    // Clear search
    document.getElementById('lib-search').value = '';
    
    // Clear dropdowns
    document.getElementById('lib-autor-filter').value = '';
    document.getElementById('lib-map-filter').value = '';
    document.getElementById('lib-type-filter').value = '';
    document.getElementById('lib-language-filter').value = '';
    
    // Clear all checkboxes
    document.querySelectorAll('.checkbox-list input[type="checkbox"]')
        .forEach(cb => cb.checked = false);

    // Re-apply filters to show all cards
    libApplyFilters();
}

