class dropdownAuto {
    constructor() {

    }

    country({ isNone, isAny, isThis, isUndv } = {}) {
        let options = []
        if (isUndv) options.push({ value: 'undeveloped_land', label: 'undeveloped_land' })
        if (isNone) options.push({ value: '',       label: '--- None ---' })
        if (isThis) options.push({ value: 'this',   label: 'this' })
        if (isAny)  options.push({ value: 'any',    label: 'any' })
        let lands = Object.entries(window.countryManager?.jsonData?.lands || {});
        lands = lands.filter(([id, country]) => id !== 'undeveloped_land');
        lands = lands.map(([id, country]) => ({
                id,
                name: country.name || id,
                banner: country.banner || ''
            }))
            .sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()));
        lands.forEach(civData => {
            options.push({value: civData.id, label: civData.name, img: civData.banner ? `/img/banners/${civData.banner}` : ''})
        })

        const dropdown = createCustomDropdown(false,  options, { placeholder: 'Country', searchable: true });
        dropdown.setValue('');

        return (dropdown)
    }

    events(thisEventId) {
        let options = []
        if (thisEventId) options.push({ value: thisEventId,       label: 'this' })



        const dropdown = createCustomDropdown(false,  options, { placeholder: 'Event', searchable: true });
        dropdown.setValue('');

        return (dropdown)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.dropdownAuto = new dropdownAuto
})