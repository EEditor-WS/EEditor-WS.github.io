// Усовершенствованная версия вашего кода
const content = document.getElementById('filesList');

async function displayMaps() {
    const filesInFolder = await loadGroupedMaps();
    window.filesInFolder = filesInFolder; // для отладки
    console.log('filesInFolder:', filesInFolder);

    if (!filesInFolder) {
        console.error("Не удалось загрузить карты");
        return;
    }

    content.innerHTML = '';

    Object.keys(filesInFolder).forEach(mapName => {
        // Получаем данные сценариев для этой карты
        let scenarios = filesInFolder[mapName];

        // --- Проверка и приведение к массиву ---
        if (!Array.isArray(scenarios)) {
            console.warn(`Для карты "${mapName}" данные не являются массивом:`, scenarios);
            // Попытка привести к массиву
            if (typeof scenarios === 'string') {
                scenarios = [scenarios]; // если одиночная строка
            } else if (scenarios && typeof scenarios === 'object' && Array.isArray(scenarios.scenarios)) {
                scenarios = scenarios.scenarios; // если объект с полем scenarios
            } else if (scenarios && typeof scenarios === 'object' && !Array.isArray(scenarios)) {
                // Если это объект, но не массив, возможно, ключи — это имена сценариев?
                // Попробуем взять значения объекта
                const values = Object.values(scenarios);
                if (values.length && values.every(v => typeof v === 'string')) {
                    scenarios = values;
                } else {
                    console.error(`Не удалось преобразовать данные для карты "${mapName}"`, scenarios);
                    return; // пропускаем карту
                }
            } else {
                console.error(`Неизвестный формат данных для карты "${mapName}", пропускаем`);
                return;
            }
        }

        const parts = mapName.split('\\')
        const mapIdArray = parts[parts.length - 1].split('_')
        const mapId = mapIdArray.slice(0, 2).join('_')
        const mapImgPath = `${libLink}lib/${mapIdArray.slice(0, 2).join('/')}/${mapIdArray.join('_')}`

        const mapData = getMapDataSync(mapId)
        console.log(mapData)
        console.log(mapId)

        // Создаём карточку карты
        const mapEl = document.createElement('div');
        mapEl.className = 'map-card';

        const mapBg = document.createElement('img')
        mapBg.className = 'map-card-bg'
        mapBg.src = mapImgPath + '.webp'
        mapBg.onerror = (e) => {
            e.target.onerror = null;
            e.target.src = mapImgPath + '_' + (mapData.versions ? mapData.versions[mapData.versions.length - 1][0] : mapIdArray[2]) + '_!.webp';
        };

        // Заголовок
        const headerEl = document.createElement('div');
        headerEl.className = 'map-header';

        const titleWrapper = document.createElement('div');
        titleWrapper.className = 'map-title-wrapper';

        const mapH = document.createElement('h2');
        mapH.className = 'map-title';
        mapH.textContent = mapData ? mapData.title : mapId;
        titleWrapper.appendChild(mapH);

        const badge = document.createElement('span');
        badge.className = 'map-badge';
        badge.textContent = `${scenarios.length} сценариев`;
        titleWrapper.appendChild(badge);

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'map-toggle-btn';
        toggleBtn.setAttribute('aria-label', 'Свернуть');

        const arrowImg = document.createElement('img');
        arrowImg.src = '/img/ui/arrow/down.svg';
        arrowImg.alt = 'toggle';
        arrowImg.loading = 'lazy';
        toggleBtn.appendChild(arrowImg);

        headerEl.appendChild(mapBg)
        headerEl.appendChild(titleWrapper);
        headerEl.appendChild(toggleBtn);

        // Контейнер для сценариев
        const scenariosContainer = document.createElement('div');
        scenariosContainer.className = 'scenarios-container';

        // Добавляем сценарии
        scenarios.forEach(scenario => {
            const scenEl = document.createElement('div');
            scenEl.className = 'scenario-item';

            const scenName = document.createElement('span');
            scenName.className = 'scenario-name';
            scenName.textContent = scenario;

            const actionsWrapper = document.createElement('div');
            actionsWrapper.className = 'scenario-actions';

            // Редактировать
            const editBtn = document.createElement('button');
            editBtn.className = 'scenario-btn edit-btn';
            editBtn.title = 'Редактировать'; // Подсказка при наведении

            const editIcon = document.createElement('img');
            editIcon.src = '/img/ui/edit2.svg'; // или edit.png, смотря какое расширение
            editIcon.alt = 'Редактировать';
            editBtn.appendChild(editIcon);

            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log(`Редактировать сценарий: "${scenario}" (карта: ${mapName})`);
                // Ваша логика
            });

            // Посмотреть
            const viewBtn = document.createElement('button');
            viewBtn.className = 'scenario-btn view-btn';
            viewBtn.title = 'Посмотреть';

            const viewIcon = document.createElement('img');
            viewIcon.src = '/img/ui/file/open.svg'; // или view.png
            viewIcon.alt = 'Посмотреть';
            viewBtn.appendChild(viewIcon);

            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log(`Просмотр сценария: "${scenario}" (карта: ${mapName})`);
                // Ваша логика
            });

            // Удалить
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'scenario-btn delete-btn';
            deleteBtn.title = 'Удалить';

            const deleteIcon = document.createElement('img');
            deleteIcon.src = '/img/ui/file/trash.svg'; // или delete.png
            deleteIcon.alt = 'Удалить';
            deleteBtn.appendChild(deleteIcon);

            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Удалить сценарий "${scenario}"?`)) {
                    console.log(`Удалён сценарий: "${scenario}" (карта: ${mapName})`);
                    // Ваша логика
                }
            });

            actionsWrapper.appendChild(editBtn);
            actionsWrapper.appendChild(viewBtn);
            actionsWrapper.appendChild(deleteBtn);

            scenEl.appendChild(scenName);
            scenEl.appendChild(actionsWrapper);
            scenariosContainer.appendChild(scenEl);
        });

        // Логика сворачивания
        let isCollapsed = false;
        function toggleScenarios() {
            isCollapsed = !isCollapsed;
            mapEl.classList.toggle('active')
            toggleBtn.classList.toggle('collapsed', isCollapsed);
            toggleBtn.setAttribute('aria-label', isCollapsed ? 'Развернуть' : 'Свернуть');
        }

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleScenarios();
        });

        headerEl.addEventListener('click', (e) => {
            if (e.target.closest('.map-toggle-btn')) return;
            toggleScenarios();
        });

        mapEl.appendChild(headerEl);
        mapEl.appendChild(scenariosContainer);
        content.appendChild(mapEl);
    });
}

displayMaps();