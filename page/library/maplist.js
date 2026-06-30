let mapsData = null
let loadingPromise = null

async function loadJsonMaps() {
    if (mapsData) return mapsData;           // уже загружено
    if (loadingPromise) return loadingPromise; // уже в процессе
    loadingPromise = (async () => {
        const url = `${libLink}warnamentMaps.json`;
        const response = await fetch(url, { cache: 'reload' });
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
        mapsData = await response.json();
        console.log(mapsData);
        document.dispatchEvent(new CustomEvent('mapDataLoaded', { detail: mapsData }));
        return mapsData;
    })();
    return loadingPromise;
}

function normalizeMapIdForComparison(input) {
    if (Array.isArray(input)) {
        // Если массив, берём первые два элемента и склеиваем
        return input.slice(0, 2).join('_');
    }
    if (typeof input === 'string') {
        let cleaned = input.trim();
        // Убираем кавычки, если строка была обёрнута в JSON.stringify
        if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
            (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
            cleaned = cleaned.slice(1, -1);
        }
        return cleaned;
    }
    return String(input);
}

async function getMapData(map) {
    await loadJsonMaps();
    const normalized = normalizeMapIdForComparison(map);
    const mapInfo = mapsData.find(m => m.id.slice(0, 2).join('_') === normalized);
    if (!mapInfo) console.error(`Map with ID ${map} (${normalized}) not found`);
    return mapInfo;
}

function getMapDataSync(mapId) {
    // mapId может быть массивом или строкой, приводим к строке первых двух частей
    const key = Array.isArray(mapId) ? mapId.slice(0, 2).join('_') : mapId;
    return mapsData?.find(m => m.id.slice(0, 2).join('_') === key) || null;
}

/*function getMapData(map) {
    const mapInfo = mapsData.find(m => m.id.join('_') === map);
    if (!mapInfo) {
        console.error(`Map with ID ${map} not found`);
        return null;
    }
    return mapInfo;
}

function getMapData(map) {
    const mapInfo = mapsData.find(m => `${m.id[0]}_${m.id[1]}` === map);
    if (!mapInfo) {
        console.error(`Map with ID ${map} not found`);
        return null;
    }
    return mapInfo;
}*/

loadJsonMaps();

const mapTypes = {
    "world": "World",
    "continent": "Continent",
    "region": "Region",
    "country": "Country",
    "oblast": "Oblast",
    "district": "Disctrict",
    "city": "City",
    "custom": "Custom"
};

const mapFeatures = {
    "water_provinces": "Water Provinces",
    "islands": "Islands",
    "straits": "Straits",
    "deserts": "Deserts",
    "rivers": "Rivers",
    "terrain": "Terrain",
    "resources": "Resources"
};

const mapRegions = {
    "world": "World",
    "europe": "Europe",
    "north_africa": "North Africa",
    "middle_east": "Middle East",
    "asia": "Asia",
    "americas": "Americas",
    "africa": "Africa",
    "oceania": "Oceania"
};

const mapLoads = {
    "ultralight": "Ultra Light",
    "mobile": "Mobile",
    "light": "Light",
    "normal": "Normal",
    "heavy": "Heavy",
    "superheavy": "Super Heavy"
};

function generateDetailsLinkMap(mapId) {
    return `details.html?type=map&map=${mapId}`;
}

// Функция для генерации HTML карточки карты
function generateMapCard(map) {
    if (map.hidden === true) return('')
    // const detailsLink = generateDetailsLinkMap(map.id.join('_'));
    const detailsLink = `${window.location.protocol}\/\/${window.location.host}\/library.html?category=scenarios&map=${map.id[0]}_${map.id[1]}`
    const lastVersion = map.versions? '_' + map.versions[map.versions.length - 1][0] : ''
    const imagePath = `${libLink}lib/${map.id.slice(0, 2).join('/')}/${map.id.join('_')}${lastVersion}_!.webp`;
    const imagePathNew = `${libLink}lib/${map.id.slice(0, 2).join('/')}/${map.id.join('_')}.webp`;
    const awardsHTML = ''; // Can be implemented later if needed
    const status = map.status || 'completed';
    const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
    let noRights;
    if (authorsData[map.author]?.rights === true) {
        noRights = "";
    } else {
        noRights = `<button class="download-download-button" onclick="askDelete()" style="background-color: #945d44ff; border-radius: 0; width: 45px; height: 45px; border: none; cursor: pointer;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"role="img" aria-label="Жалоба: предупреждение" focusable="false"><title>Жалоба</title><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                    </button>`;
    }

    return `
        <div class="download-card map-card" 
            data-title="${map.title}"
            data-author="${authorsData[map.author]?.name}" 
            data-type="${map.type}" 
            data-map-id="${map.id.join('_')}" 
            data-publish-date="${map.publishDate}"
            data-last-update="${map.lastUpdate}"
            data-score="${map.hiddenScore}"
            data-provinces="${map.provinces}" 
            data-features="${map.features.join(',')}"
            data-regions="${map.region.join(',')}"
            data-load="${map.load}"
            data-status="${map.status}"
        >
            <div class="download-info">
                <div class="download-up">
                    <div class="download-image-container">
                        <a href="${detailsLink}">
                            <img src="${imagePath}" onerror="this.onerror=null; this.src='${imagePathNew}'" class="download-goto-page" style="/*width: 250px; height: 156px; object-fit: cover; border-radius: var(--br) 15px 0 0;*/">
                        </a>
                        <div class="download-awards">
                            ${awardsHTML}
                        </div>
                        <div class="download-status status-${status}">
                            ${statusLabel}
                        </div>
                    </div>
                </div>
                <div class="download-center">
                    <a href="${detailsLink}" class="download-title download-goto-page">${map.title}</a>
                    <div class="download-row-big">
                        <div class="download-row">
                            <img src="/img/library/autor.svg" class="download-info-ico" />
                            <div class="authors" style="display:flex; flex-direction:column">
                                ${
                                    Array.isArray(map?.author) // 1. Проверяем, что это именно массив
                                        ? map.author
                                            .map(authorId => {
                                                const author = authorsData?.[authorId];
                                                
                                                if (!author) return ''; 

                                                const name = author.name ? truncateAuthorName(author.name) : 'Неизвестный автор';
                                                const link = author.link || '#';
                                                const color = author.color || 'inherit';

                                                return `<a href="${link}" style="color: ${color}">${name}</a>`;
                                            })
                                            .filter(Boolean)
                                            .join("")
                                        : ""
                                }
                            </div>
                        </div>
                        <div class="download-row">
                            <p>${map.provinces}</p>
                            <img src="/img/library/world.svg" class="download-info-ico" />
                        </div>
                    </div>
                    <div class="download-row-big">
                        <div class="download-row">
                            <img src="/img/library/mass.svg" class="download-info-ico" />
                            <p>${mapLoads[map.load]}</p>
                        </div>
                        <div class="download-row">
                            <p>${mapTypes[map.type] || map.type}</p>
                            <img src="/img/library/world.svg" class="download-info-ico" />
                        </div>
                    </div>
                    <div class="download-row-big">
                        <p class="card-description">${map.description}</p>
                    </div>
                    <div class="card-features">
                        ${map.features.map(feature => `<span class="feature-tag">${mapFeatures[feature] || feature}</span>`).join(', ')}
                    </div>
                </div>
            </div>
            <div class="download-down">
                <div class="download-row-big">
                    <div class="card-regions">
                        ${map.region.map(reg => `<span class="region-tag">${mapRegions[reg] || reg}</span>`).join('')}
                    </div>
                </div>
                <div class="download-row-big" style="min-height: 90px; position: relative;">
                    <div class="download-row" style="max-width: calc(100% - 45px)">
                            <img src="/img/library/calendar.svg" class="download-info-ico" />
                        <p title="Last Update">${new Date(map.lastUpdate).toLocaleDateString()}</p>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:bottom;border-radius:var(--br);overflow:hidden;position:absolute;right:0;bottom:0;">
                        ${noRights}
                        <button class="download-download-button" onclick="downloadMapMap('${map.id.join('_')}${lastVersion}')" style="background-color: #44944A; border-radius: 0; width: 45px; height: 45px; border: none; cursor: pointer;">
                            <img src="/img/library/download.svg" class="download-info-ico" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Функция для отображения карт с фильтрацией
function displayMaps(filters = {}) {
    const container = document.getElementById('map-cards');
    if (!container) {
        console.error('Map cards container not found');
        return;
    }

    let filteredMaps = mapsData;

    // Применяем фильтры
    if (filters.type) {
        filteredMaps = filteredMaps.filter(map => map.type === filters.type);
    }
    if (filters.author) {
        filteredMaps = filteredMaps.filter(map => authorsData[map.author]?.name.toLowerCase().includes(filters.author.toLowerCase()));
    }
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredMaps = filteredMaps.filter(map => 
            map.title.toLowerCase().includes(searchLower) ||
            map.description.toLowerCase().includes(searchLower)
        );
    }
    if (filters.minProvinces) {
        filteredMaps = filteredMaps.filter(map => map.provinces >= filters.minProvinces);
    }
    if (filters.regions && filters.regions.length > 0) {
        filteredMaps = filteredMaps.filter(map => 
            filters.regions.some(region => map.region.includes(region))
        );
    }
    if (filters.load) {
        filteredMaps = filteredMaps.filter(map => map.load === filters.load);
    }
    if (filters.features && filters.features.length > 0) {
        filteredMaps = filteredMaps.filter(map => 
            filters.features.every(feature => map.features.includes(feature))
        );
    }

    // Сортируем карты
    filteredMaps.sort((a, b) => b.hiddenScore - a.hiddenScore);

    // Отображаем карты
    container.innerHTML = filteredMaps.map(generateMapCard).join('');
}

// Функция для загрузки карты
async function downloadMapMap(mapId) {
    console.log(`Downloading map: ${mapId}`);
    const [author, map, version] = mapId.split('_');
    
    try {
        const fileName = `${mapId}_!.map`;
        const url = `${libLink}lib/${author}/${map}/${fileName}`;
        
        await downloadFile(url, fileName);
        downloadedMaps.add(mapId);
        console.log(`Map ${mapId} downloaded successfully`);
    } catch (error) {
        console.error(`Error downloading map ${mapId}:`, error);
        showErrorMapModal(mapId);
    }
}

// Обновляем функцию applyMapFilters чтобы использовать новые фильтры
function applyMapFilters() {
    const searchText = document.getElementById('map-lib-search').value.toLowerCase();
    const authorFilter = document.getElementById('map-lib-author-filter').value.toLowerCase();
    const typeFilter = document.getElementById('map-lib-type-filter').value;
    const loadFilter = document.getElementById('map-lib-load-filter').value;
    
    // Получаем выбранные регионы
    const selectedRegions = Array.from(document.querySelectorAll('input[name="regions"]:checked'))
        .map(cb => cb.value);
    
    // Получаем выбранные особенности
    const selectedFeatures = Array.from(document.querySelectorAll('input[name="features"]:checked'))
        .map(cb => cb.value);
    
    // Получаем минимальное количество провинций
    const provinceFilters = Array.from(document.querySelectorAll('input[name="provinces"]:checked'))
        .map(v => parseInt(v))
        .sort((a, b) => b - a);
    const minProvinces = provinceFilters[0] || 0;

    // Создаем объект с фильтрами
    const filters = {
        search: searchText,
        author: authorFilter,
        type: typeFilter,
        load: loadFilter,
        regions: selectedRegions,
        features: selectedFeatures,
        minProvinces: minProvinces
    };

    // Применяем фильтры
    displayMaps(filters);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Создаем контейнер для карт, если его нет
        const mapsDiv = document.querySelector('#maps .download-container');
        if (!mapsDiv.querySelector('#map-cards')) {
            const cardsContainer = document.createElement('div');
            cardsContainer.id = 'map-cards';
            cardsContainer.className = 'download-cards';
            mapsDiv.appendChild(cardsContainer);
        }

        // Отображаем карты
        displayMaps();
    } catch(e) {
        
    }
});