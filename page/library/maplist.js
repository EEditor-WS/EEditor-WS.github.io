mapsData = [
    {
        id: ["jalhund", "europe", "vg"],
        title: "Standart Europe",
        author: {
            name: "@jalhund",
            link: "https://discord.com/users/277053272959008768",
            color: "#3B83BD"
        },
        description: "Builded-in map of Europe by game developer",
        type: "continent",
        region: ["europe"],
        provinces: 293,
        features: ["water_provinces", "islands"],
        status: "completed",
        publishDate: "1912-04-15",
        lastUpdate: "2077-01-01",
        load: "mobile",
        hiddenScore: 0,
    },
    {
        id: ["eenot", "world", "v1"],
        title: "World by ЕЕнот",
        author: {
            name: "@eenot",
            link: "https://discord.com/users/852608191783919676",
            color: "#3B83BD"
        },
        description: "The best world map for normal and low devices. Very optimized. By developer of EEditor",
        type: "world",
        region: ["europe", "north_africa", "middle_east", "asia", "americas", "africa", "oceania"],
        provinces: 1147,
        features: ["water_provinces", "islands", "straits", "rivers", "shores"],
        status: "completed",
        publishDate: "2025-01-19",
        lastUpdate: "2025-01-19",
        load: "light",
        hiddenScore: 0,
    },
    {
        id: ["bluepum", "enaatme", "v4"],
        title: "Europe+ by Bluepum",
        author: {
            name: "@bluepum",
            link: "https://discord.com/users/277053272959008768",
            color: "#3B83BD"
        },
        description: "Map of Europe, North Africa and Middle East",
        type: "continent",
        region: ["europe", "north_africa", "middle_east"],
        provinces: 734,
        features: ["water_provinces", "islands"],
        status: "in_development",
        publishDate: "2025-04-26",
        lastUpdate: "2024-05-01",
        load: "light",
        hiddenScore: 0,
    },
    {
        id: ["zachary", "world", "v1"],
        title: "World by Zachary",
        author: {
            name: "@zacharyzachary.bachary",
            link: "https://discord.com/users/852608191783919676",
            color: "#3B83BD"
        },
        description: "One of the bestest world maps",
        type: "world",
        region: ["water_provinces", "islands", "straits", "rivers", "shores"],
        provinces: 2871,
        features: ["water_provinces", "islands", "straits", "rivers"],
        status: "completed",
        publishDate: "2025-02-10", 
        lastUpdate: "2025-02-10",
        load: "normal",
        hiddenScore: 0,
    }
];

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
    const detailsLink = generateDetailsLinkMap(map.id.join('_'));
    const imagePath = `${libLink}lib/${map.id.slice(0, 2).join('/')}/${map.id.join('_')}_!.png`;
    const awardsHTML = ''; // Can be implemented later if needed
    const status = map.status || 'completed';
    const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

    return `
        <div class="download-card" 
            data-title="${map.title}"
            data-author="${map.author.name}" 
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
                            <img src="${imagePath}" class="download-goto-page" style="width: 250px; border-radius: 15px 15px 0 0;">
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
                    <a href="${detailsLink}" class="download-title download-goto-page" target="_blank">${map.title}</a>
                    <div class="download-row-big">
                        <div class="download-row">
                            <img src="../../img/library/autor.svg" class="download-info-ico" />
                            <a href="${map.author.link}" style="color: ${map.author.color}">${truncateAuthorName(map.author.name)}</a>
                        </div>
                        <div class="download-row">
                            <p>${map.provinces}</p>
                            <img src="../../img/library/world.svg" class="download-info-ico" />
                        </div>
                    </div>
                    <div class="download-row-big">
                        <div class="download-row">
                            <img src="../../img/library/mass.svg" class="download-info-ico" />
                            <p>${mapLoads[map.load]}</p>
                        </div>
                        <div class="download-row">
                            <p>${mapTypes[map.type] || map.type}</p>
                            <img src="../../img/library/world.svg" class="download-info-ico" />
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
                <div class="download-row-big">
                    <div class="download-row">
                            <img src="../../img/library/calendar.svg" class="download-info-ico" />
                        <p title="Last Update">${new Date(map.lastUpdate).toLocaleDateString()}</p>
                    </div>
                    <button class="download-download-button" onclick="downloadMapMap('${map.id.join('_')}')" style="background-color: #44944A; border-radius: 15px; width: 45px; height: 45px; border: none; cursor: pointer;">
                        <img src="../../img/library/download.svg" class="download-info-ico" />
                    </button>
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
        filteredMaps = filteredMaps.filter(map => map.author.name.toLowerCase().includes(filters.author.toLowerCase()));
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
});