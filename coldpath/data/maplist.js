let mapsData = null
let loadingPromise = null

async function loadJsonMaps() {
    if (mapsData) return mapsData;              // уже загружено
    if (loadingPromise) return loadingPromise;  // уже в процессе
    loadingPromise = (async () => {
        const url = `${libLink}coldpathMaps.json`;
        const response = await fetch(url, { cache: 'reload' });
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
        mapsData = await response.json();
        console.log(mapsData);
        document.dispatchEvent(new CustomEvent('mapDataLoaded', { detail: mapsData }));
        return mapsData;
    })();
    return loadingPromise;
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

function generateDetailsLinkMap(mapId) {
    return `details.html?type=map&map=${mapId}`;
}

// Функция для генерации HTML карточки карты
function generateMapCardColdPath(map) {
    if (map.hidden === true) return('')

    // Удалено: detailsLink, lastVersion, imagePath, imagePathNew — используют id и versions

    const status = map.status || 'completed';
    const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
    const awardsHTML = ''; // можно расширить позже
    const mapId = map.id
    //const detailsLink = `${libLink}coldpath/${mapId}/`
    const detailsLink = '#'
    const imagePath = `${libLink}coldpath/${mapId}/!.webp`

    let noRights;
    if (authorsData[map.author]?.rights === true) {
        noRights = "";
    } else {
        noRights = `<button class="download-download-button" onclick="askDelete()" style="background-color: #945d44ff; border-radius: 0; width: 45px; height: 45px; border: none; cursor: pointer;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"role="img" aria-label="Жалоба: предупреждение" focusable="false"><title>Жалоба</title><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                    </button>`;
    }

    // Формируем авторов (поддержка строки и массива)
    let authorsHtml = '';
    if (Array.isArray(map.author)) {
        authorsHtml = map.author
            .map(authorId => {
                const author = authorsData?.[authorId];
                if (!author) return '';
                const name = author.name ? truncateAuthorName(author.name) : 'unknown';
                const link = author.link || '#';
                const color = author.color || 'inherit';
                return `<a href="${link}" style="color: ${color}">${name}</a>`;
            })
            .filter(Boolean)
            .join('');
    } else if (typeof map.author === 'string') {
        const author = authorsData?.[map.author];
        if (author) {
            const name = author.name ? truncateAuthorName(author.name) : map.author;
            const link = author.link || '#';
            const color = author.color || 'inherit';
            authorsHtml = `<a href="${link}" style="color: ${color}">${name}</a>`;
        } else {
            authorsHtml = `<span>${map.author}</span>`;
        }
    }

    return `
        <div class="download-card map-card" 
            data-author="${authorsData[map.author]?.name || map.author}" 
            data-type="${map.type}" 
            data-publish-date="${map.publishDate || ''}"
            data-last-update="${map.updateDate || ''}"
            data-score="${map.hiddenScore || 0}"
            data-provinces="${map.provinces || 0}"
        >
            <div class="download-info">
                <div class="download-up">
                    <div class="download-image-container">
                        <a href="${detailsLink}">
                            <img src="${imagePath}" class="download-goto-page">
                        </a>
                        <div class="download-awards">
                            ${awardsHTML}
                        </div>
                        <!--div class="download-status status-${status}">
                            ${statusLabel}
                        </div-->
                    </div>
                </div>
                <div class="download-center">
                    <div class="download-title">${map.id || 'unknown'}</div>
                    <div class="download-row-big">
                        <div class="download-row">
                            <img src="/img/library/autor.svg" class="download-info-ico" />
                            <div class="authors" style="display:flex; flex-direction:column">
                                ${authorsHtml}
                            </div>
                        </div>
                        <div class="download-row">
                            <p>${mapTypes[map.type] || map.type}</p>
                            <img src="/img/library/world.svg" class="download-info-ico" />
                        </div>
                    </div>
                    <div class="download-row-big">
                        <div class="download-row">
                            <!--img src="/img/library/calendar.svg" class="download-info-ico" />
                            <p>${mapTypes[map.updateDate] || map.publishDate}</p-->
                        </div>
                        <div class="download-row">
                            <p>${map.provinces > 0 ? map.provinces : ''}</p>
                            <img src="/img/library/world.svg" class="download-info-ico" />
                        </div>
                    </div>
                    <div class="download-row-big">
                        <p class="card-description">${map.description || ''}</p>
                    </div>
                </div>
            </div>
            <div class="download-down">
                <div class="download-row-big" style="min-height: 90px; position: relative;">
                    <div class="download-down-date" class="download-row" style="max-width: calc(100% - 45px)">
                        <div style="display: inline-flex; align-items: center; gap: var(--dss);">
                            <img src="/img/library/calendar.svg" class="download-info-ico" />
                            <p>${map.updateDate ? 'Last update' : 'Uploaded'}</p>
                        </div>
                        <p title="Last Update">${map.updateDate ? new Date(map.updateDate).toLocaleDateString() : new Date(map.publishDate).toLocaleDateString()}</p>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:bottom;border-radius:var(--br);overflow:hidden;position:absolute;right:0;bottom:0;">
                        ${noRights}
                        <button class="download-download-button" onclick="downloadMapColdPath('${map.id}')" style="background-color: #44944A; border-radius: 0; width: 45px; height: 45px; border: none; cursor: pointer;">
                            <img src="/img/library/download.svg" class="download-info-ico" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Функция для отображения карт с фильтрацией
function displayMaps() {
    const container = document.getElementById('map-cards');
    if (!container) {
        console.error('Map cards container not found');
        return;
    }
    
    // Инициализируем фильтры (создаем UI и навешиваем обработчики)
    initMapFilters();
    
    // Применяем фильтры (изначально покажут все не скрытые карты)
    applyFilters();
}

// Функция для загрузки карты
async function downloadMapColdPath(mapId) {
    console.log(`Downloading map: ${mapId}`);
    
    try {
        const fileName = `${mapId}.map`;
        const url = `${libLink}coldpath/${mapId}/${fileName}`;
        
        await downloadFile(url, fileName);
        downloadedMaps.add(mapId);
        console.log(`Map ${mapId} downloaded successfully`);
    } catch (error) {
        console.error(`Error downloading map ${mapId}:`, error);
        showErrorMapModal(mapId);
    }
}

function applyFilters() {
    if (!mapsData) return;

    const nameFilter = document.getElementById('filter-name')?.value.toLowerCase().trim() || '';
    const authorFilter = document.getElementById('filter-author')?.value || '';
    const regionFilter = document.getElementById('filter-region')?.value.toLowerCase().trim() || '';
    const typeFilter = document.getElementById('filter-type')?.value || '';
    const provincesMin = parseInt(document.getElementById('filter-provinces-min')?.value) || 0;

    const filteredMaps = mapsData.filter(map => {
        if (map.hidden === true) return false;

        // 1. Фильтр по названию (id)
        if (nameFilter && !map.id.toLowerCase().includes(nameFilter)) {
            return false;
        }

        // 2. Фильтр по автору (поддерживает и строку, и массив авторов)
        if (authorFilter) {
            const mapAuthors = Array.isArray(map.author) ? map.author : [map.author];
            const hasAuthor = mapAuthors.some(a => {
                const authorInfo = authorsData?.[a];
                const authorName = authorInfo ? authorInfo.name : a;
                return a === authorFilter || authorName === authorFilter;
            });
            if (!hasAuthor) return false;
        }

        // 3. Фильтр по части света (region)
        if (regionFilter) {
            const mapRegion = Array.isArray(map.region) ? map.region.join(' ') : (map.region || '');
            if (!mapRegion.toLowerCase().includes(regionFilter)) {
                return false;
            }
        }

        // 4. Фильтр по типу
        if (typeFilter && map.type !== typeFilter) {
            return false;
        }

        // 5. Фильтр по количеству провинций
        if ((map.provinces || 0) < provincesMin) {
            return false;
        }

        return true;
    });

    // Сортируем отфильтрованные карты
    filteredMaps.sort((a, b) => b.hiddenScore - a.hiddenScore);

    // Отображаем карты
    const container = document.getElementById('map-cards');
    if (container) {
        if (filteredMaps.length === 0) {
            container.innerHTML = '<p style="text-align: center; width: 100%; padding: 20px; color: #666;">Карты не найдены</p>';
        } else {
            container.innerHTML = filteredMaps.map(generateMapCardColdPath).join('');
        }
    }
}

function initMapFilters() {
    const container = document.getElementById('map-cards');
    if (!container) return;

    // Проверяем, не созданы ли уже фильтры
    if (document.getElementById('map-filters-container')) return;

    const filterContainer = document.createElement('div');
    filterContainer.id = 'map-filters-container';
    filterContainer.className = 'map-filters';
    
    filterContainer.innerHTML = `
        <input type="text" id="filter-name" placeholder="${window.translator.translate('search')}" style="flex: 2; min-width: 200px; padding: 10px; border: 1px solid #ccc; background: #fff; color: #333; border-radius: 6px; outline: none;">
        
        <select id="filter-author" style="flex: 1; min-width: 150px; padding: 10px; border: 1px solid #ccc; background: #fff; color: #333; border-radius: 6px; outline: none;">
            <option value="">${window.translator.translate('author')}</option>
        </select>
        
        <select id="filter-region" style="flex: 1; min-width: 150px; padding: 10px; border: 1px solid #ccc; background: #fff; color: #333; border-radius: 6px; outline: none;">
            <option value="">${window.translator.translate('region')}</option>
        </select>
        
        <select id="filter-type" style="flex: 1; min-width: 150px; padding: 10px; border: 1px solid #ccc; background: #fff; color: #333; border-radius: 6px; outline: none;">
            <option value="">${window.translator.translate('type')}</option>
        </select>
        
        <div id="provincesDiv">
            <label style="white-space: nowrap; color: #333;">Провинций от:</label>
            <input type="number" id="filter-provinces-min" placeholder="0" min="0">
        </div>
        
        <button id="reset-filters" style="padding: 10px 20px; background-color: #945d44ff; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; transition: background 0.2s;">${window.translator.translate('reset')}</button>
    `;

    // Вставляем панель фильтров прямо перед контейнером карт
    container.parentNode.insertBefore(filterContainer, container);

    // Собираем уникальные значения для выпадающих списков
    const authors = new Set();
    const regions = new Set();
    const types = new Set();

    mapsData.forEach(map => {
        if (Array.isArray(map.author)) {
            map.author.forEach(a => authors.add(a));
        } else if (map.author) {
            authors.add(map.author);
        }
        if (map.region) {
            if (Array.isArray(map.region)) {
                map.region.forEach(r => regions.add(r));
            } else {
                regions.add(map.region);
            }
        }
        /*if (map.type) {
            types.add(map.type);
        }*/
    });

    types.add('world')
    types.add('continent')
    types.add('region')
    types.add('country')
    types.add('oblast')
    types.add('city')
    types.add('other')


    // Заполняем select авторов
    const authorSelect = document.getElementById('filter-author');
    authors.forEach(authorId => {
        const authorInfo = authorsData?.[authorId];
        const displayName = authorInfo ? authorInfo.name : authorId;
        const option = document.createElement('option');
        option.value = authorId;
        option.textContent = displayName;
        authorSelect.appendChild(option);
    });

    // Заполняем select регионов
    const regionSelect = document.getElementById('filter-region');
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        regionSelect.appendChild(option);
    });

    // Заполняем select типов
    const typeSelect = document.getElementById('filter-type');
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = mapTypes[type] || type;
        typeSelect.appendChild(option);
    });

    // Навешиваем обработчики событий для мгновенной реакции на изменения
    document.getElementById('filter-name').addEventListener('input', applyFilters);
    authorSelect.addEventListener('change', applyFilters);
    regionSelect.addEventListener('change', applyFilters);
    typeSelect.addEventListener('change', applyFilters);
    document.getElementById('filter-provinces-min').addEventListener('input', applyFilters);
    
    document.getElementById('reset-filters').addEventListener('click', () => {
        document.getElementById('filter-name').value = '';
        authorSelect.value = '';
        regionSelect.value = '';
        typeSelect.value = '';
        document.getElementById('filter-provinces-min').value = '';
        applyFilters();
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Создаем контейнер для карт, если его нет
        const mapsDiv = document.querySelector('#maps .download-container');
        if (mapsDiv && !mapsDiv.querySelector('#map-cards')) {
            const cardsContainer = document.createElement('div');
            cardsContainer.id = 'map-cards';
            cardsContainer.className = 'download-cards';
            mapsDiv.appendChild(cardsContainer);
        }

        // Ждем завершения загрузки JSON, чтобы избежать гонки данных (race condition)
        await loadJsonMaps();
        
        // Отображаем карты с уже работающими фильтрами
        displayMaps();
    } catch(e) {
        console.error('Error initializing maps:', e);
    }
});