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
        const mapData = filesInFolder[mapName];
        const versions = mapData.versions || [];
        const scenarios = mapData.scenarios || [];
        const isOther = mapName.toLowerCase() === 'other';

        console.log(`Карта: ${mapName}, Версий: ${versions.length}, Сценариев: ${scenarios.length}`);

        // === Формирование пути к картинке ===
        let mapImgPath = '';
        let mapId = '';
        let mapIdArray = [];
        
        if (!isOther) {
            const parts = mapName.split(/[\\/]/); // Поддержка и \, и /
            const lastPart = parts[parts.length - 1];
            mapIdArray = lastPart.split('_');
            mapId = mapIdArray.slice(0, 2).join('_');
            mapImgPath = `${libLink}lib/${mapIdArray.slice(0, 2).join('/')}/${mapIdArray.join('_')}`;
        }

        const mapDataSync = getMapDataSync(mapId);

        // === Создаём карточку карты ===
        const mapEl = document.createElement('div');
        mapEl.className = 'map-card' + (isOther ? ' map-card-other' : '');

        // Фоновая картинка
        const mapBg = document.createElement('img');
        mapBg.className = 'map-card-bg';
        
        if (isOther) {
            mapBg.src = '/img/ui/folder.svg'; // Заглушка для "other"
            mapBg.alt = 'Прочие сценарии';
        } else {
            mapBg.src = mapImgPath + '.webp';
            mapBg.onerror = (e) => {
                e.target.onerror = null;
                // Fallback на последнюю версию из mapData.versions
                const fallbackVersion = versions.length > 0 
                    ? versions[versions.length - 1][0] 
                    : (mapIdArray[2] || '');
                e.target.src = mapImgPath + '_' + fallbackVersion + '_!.webp';
            };
        }

        // Заголовок
        const headerEl = document.createElement('div');
        headerEl.className = 'map-header';

        const titleWrapper = document.createElement('div');
        titleWrapper.className = 'map-title-wrapper';

        const mapH = document.createElement('h2');
        mapH.className = 'map-title';
        if (isOther) {
            mapH.textContent = 'Прочие сценарии';
        } else {
            mapH.textContent = mapDataSync ? mapDataSync.title : mapId;
        }
        titleWrapper.appendChild(mapH);

        const badge = document.createElement('span');
        badge.className = 'map-badge';
        badge.textContent = `${scenarios.length} сцен.`;
        titleWrapper.appendChild(badge);

        // === Селектор версий (если их больше 1) ===
        let selectedVersion = 'all';
        
        if (versions.length > 1) {
            const versionSelect = document.createElement('select');
            versionSelect.className = 'map-version-select';
            
            const allOption = document.createElement('option');
            allOption.value = 'all';
            allOption.textContent = 'Все версии';
            versionSelect.appendChild(allOption);
            
            versions.forEach(([versionId, versionPath]) => {
                const option = document.createElement('option');
                option.value = versionId;
                option.textContent = versionId;
                versionSelect.appendChild(option);
            });
            
            versionSelect.addEventListener('change', (e) => {
                selectedVersion = e.target.value;
                filterScenarios();
            });
            
            titleWrapper.appendChild(versionSelect);
        }

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'map-toggle-btn';
        toggleBtn.setAttribute('aria-label', 'Свернуть');

        const arrowImg = document.createElement('img');
        arrowImg.src = '/img/ui/arrow/down.svg';
        arrowImg.alt = 'toggle';
        arrowImg.loading = 'lazy';
        toggleBtn.appendChild(arrowImg);

        headerEl.appendChild(mapBg);
        headerEl.appendChild(titleWrapper);
        headerEl.appendChild(toggleBtn);

        // === Контейнер для сценариев ===
        const scenariosContainer = document.createElement('div');
        scenariosContainer.className = 'scenarios-container';

        // Функция фильтрации сценариев по версии
        function filterScenarios() {
            const scenarioItems = scenariosContainer.querySelectorAll('.scenario-item');
            scenarioItems.forEach(item => {
                const scenarioVersion = item.dataset.version;
                if (selectedVersion === 'all' || scenarioVersion === selectedVersion) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        }

        // === Обработка пустых карт ===
        if (scenarios.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'scenarios-empty';
            emptyMsg.textContent = 'Нет сценариев для этой карты';
            scenariosContainer.appendChild(emptyMsg);
        } else {
            // === Добавляем сценарии ===
            scenarios.forEach(scenario => {
                const scenEl = document.createElement('div');
                scenEl.className = 'scenario-item';
                scenEl.dataset.version = scenario.mapversion || ''; // Для фильтрации

                const scenInfo = document.createElement('div');
                scenInfo.className = 'scenario-info';

                // Извлекаем имя файла из пути (на случай, если там есть слэши)
                const filePathParts = scenario.file.split(/[\\/]/);
                const fileName = filePathParts[filePathParts.length - 1];

                const scenName = document.createElement('span');
                scenName.className = 'scenario-name';
                scenName.textContent = scenario.name || fileName;
                scenInfo.appendChild(scenName);

                if (scenario.file !== null && scenario.file !== undefined) {
                    const scenFile = document.createElement('span');
                    scenFile.className = 'scenario-file';
                    scenFile.textContent = `(${scenario.file})`;
                    scenInfo.appendChild(scenFile);
                }

                // Год (проверяем !== null, чтобы не пропустить year: 0)
                if (scenario.year !== null && scenario.year !== undefined) {
                    const scenYear = document.createElement('span');
                    scenYear.className = 'scenario-year';
                    scenYear.textContent = `Year: ${scenario.year}`;
                    scenInfo.appendChild(scenYear);
                }

                // Описание
                if (scenario.description) {
                    const scenDesc = document.createElement('div');
                    scenDesc.className = 'scenario-description';
                    scenDesc.textContent = scenario.description;
                    scenInfo.appendChild(scenDesc);
                }

                // Версия карты (если есть)
                if (scenario.mapversion) {
                    const scenVersion = document.createElement('span');
                    scenVersion.className = 'scenario-version';
                    scenVersion.textContent = `v: ${scenario.mapversion}`;
                    scenInfo.appendChild(scenVersion);
                }

                const actionsWrapper = document.createElement('div');
                actionsWrapper.className = 'scenario-actions';

                // Редактировать
                const editBtn = document.createElement('button');
                editBtn.className = 'scenario-btn edit-btn';
                editBtn.title = 'Редактировать';

                const editIcon = document.createElement('img');
                editIcon.src = '/img/ui/edit2.svg';
                editIcon.alt = 'Редактировать';
                editBtn.appendChild(editIcon);

                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log(`Редактировать сценарий: "${scenario.file}" (карта: ${mapName}, версия: ${scenario.mapversion})`);
                    // Ваша логика: window.fileSystem.WriteFileAsync(scenario.file + '.json', ...)
                });

                // Посмотреть
                const viewBtn = document.createElement('button');
                viewBtn.className = 'scenario-btn view-btn';
                viewBtn.title = 'Посмотреть';

                const viewIcon = document.createElement('img');
                viewIcon.src = '/img/ui/file/open.svg';
                viewIcon.alt = 'Посмотреть';
                viewBtn.appendChild(viewIcon);

                viewBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log(`Просмотр сценария: "${scenario.file}" (карта: ${mapName}, версия: ${scenario.mapversion})`);
                    // Ваша логика: загрузка сценария в редактор
                });

                // Удалить
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'scenario-btn delete-btn';
                deleteBtn.title = 'Удалить';

                const deleteIcon = document.createElement('img');
                deleteIcon.src = '/img/ui/file/trash.svg';
                deleteIcon.alt = 'Удалить';
                deleteBtn.appendChild(deleteIcon);

                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(`Удалить сценарий "${scenario.name || fileName}"?`)) {
                        console.log(`Удалён сценарий: "${scenario.file}" (карта: ${mapName}, версия: ${scenario.mapversion})`);
                        // Ваша логика: window.fileSystem.DeleteFileAsync(scenario.file + '.json')
                    }
                });

                actionsWrapper.appendChild(editBtn);
                actionsWrapper.appendChild(viewBtn);
                actionsWrapper.appendChild(deleteBtn);

                scenEl.appendChild(scenInfo);
                scenEl.appendChild(actionsWrapper);
                scenariosContainer.appendChild(scenEl);
            });
        }

        // === Логика сворачивания ===
        let isCollapsed = false;
        function toggleScenarios() {
            isCollapsed = !isCollapsed;
            mapEl.classList.toggle('active');
            toggleBtn.classList.toggle('collapsed', isCollapsed);
            toggleBtn.setAttribute('aria-label', isCollapsed ? 'Развернуть' : 'Свернуть');
        }

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleScenarios();
        });

        headerEl.addEventListener('click', (e) => {
            if (e.target.closest('.map-toggle-btn') || e.target.closest('.map-version-select')) return;
            toggleScenarios();
        });

        mapEl.appendChild(headerEl);
        mapEl.appendChild(scenariosContainer);
        content.appendChild(mapEl);
    });
}

displayMaps();