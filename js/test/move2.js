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