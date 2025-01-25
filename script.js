// Глобальные переменные для работы с файлами
let currentFile = null;
let fileHandle = null;
let isJsonFile = false;
let previewContent = null;
let fileInfo = null;

// Проверяем поддержку File System Access API
const hasFileSystemAccess = 'showOpenFilePicker' in window;

// Глобальная переменная для хранения данных из lands.json
let markedCountries = new Set();

// Функция для инициализации данных о странах
function initLandsData() {
    // Используем глобальную переменную landsData из lands_data.js
    if (typeof landsData !== 'undefined' && landsData.lands) {
        markedCountries = new Set(landsData.lands.map(land => land.key));
    } else {
        console.error('Данные о странах не найдены');
    }
}

// Функция для загрузки lands.json
function loadLandsJson() {
    // Пробуем загрузить из localStorage
    const savedData = localStorage.getItem('landsData');
    if (savedData) {
        try {
            const landsData = JSON.parse(savedData);
            markedCountries = new Set(landsData.lands.map(land => land.key));
            return;
        } catch (e) {
            console.error('Ошибка при загрузке данных из localStorage:', e);
        }
    }

    // Создаем скрытый input для загрузки файла
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const landsData = JSON.parse(e.target.result);
                    markedCountries = new Set(landsData.lands.map(land => land.key));
                    // Сохраняем в localStorage
                    localStorage.setItem('landsData', e.target.result);
                } catch (error) {
                    console.error('Ошибка при чтении lands.json:', error);
                }
            };
            reader.readAsText(file);
        }
        document.body.removeChild(input);
    };

    input.click();
}

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация глобальных переменных
    previewContent = document.getElementById('preview-content');
    fileInfo = document.getElementById('file-info');

    // Инициализируем данные о странах
    initLandsData();

    // Получаем все кнопки навигации
    const navButtons = document.querySelectorAll('.nav-button');
    
    // Добавляем обработчик для каждой кнопки
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Убираем класс active у всех кнопок
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // Добавляем класс active текущей кнопке
            this.classList.add('active');
            
            // Получаем id страницы из атрибута data-page
            const pageId = this.getAttribute('data-page');
            
            // Скрываем все страницы
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            // Показываем нужную страницу
            document.getElementById(pageId).classList.add('active');
        });
    });

    // Обработчик клика по строкам таблицы стран
    const countriesList = document.getElementById('countries-list');
    if (countriesList) {
        countriesList.addEventListener('click', function(e) {
            const row = e.target.closest('tr');
            if (!row) return;

            // Получаем ID страны из строки
            const countryId = row.cells[2].textContent;
            window.countryManager.openCountry(countryId);
        });
    }

    // Language switcher functionality
    const langButton = document.getElementById('currentLang');
    const langDropdown = document.getElementById('langDropdown');
    
    // Toggle dropdown
    langButton.addEventListener('click', function(e) {
        e.stopPropagation();
        langDropdown.classList.toggle('show');
    });
    
    // Handle language selection
    langDropdown.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const selectedLang = e.target.getAttribute('data-lang');
            const selectedText = e.target.textContent;
            
            // Update button text
            langButton.textContent = selectedText;
            
            // Store selected language
            localStorage.setItem('selectedLanguage', selectedLang);
            
            // Close dropdown
            langDropdown.classList.remove('show');
            
            // Here you can add logic to change the application language
            changeApplicationLanguage(selectedLang);
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        langDropdown.classList.remove('show');
    });
    
    // Load saved language preference
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang) {
        const savedLangElement = langDropdown.querySelector(`[data-lang="${savedLang}"]`);
        if (savedLangElement) {
            langButton.textContent = savedLangElement.textContent;
            changeApplicationLanguage(savedLang);
        }
    }

    // Получаем элементы DOM
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewFilename = document.getElementById('preview-filename');
    const forceSaveButton = document.getElementById('force-save');
    const settingsForm = document.getElementById('settings-form');

    // Функция для преобразования цвета в RGB строку
    function colorToRgb(colorArray) {
        if (!Array.isArray(colorArray) || colorArray.length < 3) {
            return 'rgb(128, 128, 128)';
        }
        const r = Math.round(parseFloat(colorArray[0]) || 0);
        const g = Math.round(parseFloat(colorArray[1]) || 0);
        const b = Math.round(parseFloat(colorArray[2]) || 0);
        return `rgb(${r}, ${g}, ${b})`;
    }

    // Функция для обновления JSON в редакторе
    function updateJsonEditor(formData) {
        if (!isJsonFile || !previewContent) return;
        
        try {
            const jsonData = JSON.parse(previewContent.value);
            
            // Обновляем значения из формы
            for (const [key, value] of Object.entries(formData)) {
                if (value !== '') {
                    if (key === 'map_hash' || key === 'technology_lvl' || 
                        key === 'year' || key === 'last_turn' || 
                        key === 'month' || key === 'turn' || 
                        key === 'num_of_provinces' || key === 'min_game_version') {
                        jsonData[key] = parseInt(value);
                    } else if (key === 'play_after_last_turn') {
                        jsonData[key] = value === 'true';
                    } else if (key === 'sandbox' || key === 'technologies_are_opened' || 
                              key === 'no_initial_diplomacy' || key === 'no_nuclear_weapon') {
                        jsonData[key] = value;
                    } else {
                        jsonData[key] = value;
                    }
                }
            }
            
            // Обновляем содержимое редактора
            previewContent.value = JSON.stringify(jsonData, null, 4);
            if (fileInfo) {
                fileInfo.textContent = 'Изменения не сохранены';
            }
        } catch (error) {
            console.error('Ошибка при обновлении JSON:', error);
            if (fileInfo) {
                fileInfo.textContent = 'Ошибка при обновлении JSON';
            }
        }
    }

    // Функция для заполнения формы из JSON
    function fillFormFromJson(jsonData) {
        try {
            // Очищаем все поля формы перед заполнением
            settingsForm.reset();

            // Заполняем поля формы
            const mappings = {
                // Числовые значения
                'map_hash': { type: 'number', id: 'map_hash' },
                'technology_lvl': { type: 'number', id: 'technology_lvl' },
                'year': { type: 'number', id: 'year' },
                'last_turn': { type: 'number', id: 'last_turn' },
                'month': { type: 'number', id: 'month' },
                'num_of_provinces': { type: 'number', id: 'num_of_provinces' },
                'turn': { type: 'number', id: 'turn' },
                'min_game_version': { type: 'number', id: 'min_game_version' },

                // Строковые значения с выбором
                'resources_spawn': { type: 'select', id: 'resources_spawn' },
                'bots_behavior': { type: 'select', id: 'bots_behavior' },
                'difficulty': { type: 'select', id: 'difficulty' },
                'fog_of_war': { type: 'select', id: 'fog_of_war' },

                // Значения enabled/disabled
                'sandbox': { type: 'enabled-disabled', id: 'sandbox' },
                'technologies_are_opened': { type: 'enabled-disabled', id: 'technologies_are_opened' },
                'no_initial_diplomacy': { type: 'enabled-disabled', id: 'no_initial_diplomacy' },
                'no_nuclear_weapon': { type: 'enabled-disabled', id: 'no_nuclear_weapon' },

                // Чистые булевы значения
                'play_after_last_turn': { type: 'pure-boolean', id: 'play_after_last_turn' },

                // Текстовые значения
                'name': { type: 'text', id: 'name' },
                'id': { type: 'text', id: 'id' },
                'player_land': { type: 'select', id: 'player_land' }
            };

            // Обрабатываем каждое поле согласно маппингу
            for (const [key, config] of Object.entries(mappings)) {
                const value = jsonData[key];
                if (value === undefined) continue;

                const element = document.getElementById(config.id);
                if (!element) continue;

                switch (config.type) {
                    case 'number':
                        element.value = parseInt(value) || 0;
                        break;
                    case 'select':
                        if (config.id === 'player_land') {
                            // Специальная обработка для player_land
                            updatePlayerLandSelect(jsonData.lands, value);
                        } else {
                            element.value = value;
                        }
                        break;
                    case 'enabled-disabled':
                        element.value = value;
                        break;
                    case 'pure-boolean':
                        element.value = value ? 'true' : 'false';
                        break;
                    case 'text':
                        element.value = value;
                        break;
                }
            }

            // Обработка цвета воды отдельно
            if (Array.isArray(jsonData.water_color) && jsonData.water_color.length >= 3) {
                const [r, g, b] = jsonData.water_color;
                
                // Устанавливаем значения в поля ввода
                document.getElementById('water_color_r').value = r;
                document.getElementById('water_color_g').value = g;
                document.getElementById('water_color_b').value = b;
                
                // Обновляем предпросмотр
                const colorPreview = document.getElementById('water_color_preview');
                if (colorPreview) {
                    colorPreview.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
                }
            }

            // Обновляем список стран, если они есть в JSON
            if (jsonData.lands) {
                updateCountriesList(jsonData.lands);
            }

        } catch (error) {
            console.error('Ошибка при заполнении формы:', error);
        }
    }

    // Функция для обновления списка стран
    function updateCountriesList(lands) {
        const countriesList = document.getElementById('countries-list');
        if (!countriesList || !lands) return;

        // Очищаем текущий список
        countriesList.innerHTML = '';

        // Подсчитываем количество провинций
        const provincesCount = {};
        if (lands.provinces) {
            for (const province of lands.provinces) {
                if (province.owner) {
                    provincesCount[province.owner] = (provincesCount[province.owner] || 0) + 1;
                }
            }
        }

        // Создаем отсортированный массив стран
        const countriesArray = Object.entries(lands)
            .filter(([id]) => id !== 'provinces')
            .map(([id, country]) => ({
                id,
                name: country.name,
                color: country.color,
                provinces: provincesCount[id] || 0,
                capital: country.capital_name || '',
                ...country
            }))
            .sort((a, b) => {
                // Специальная обработка для undeveloped_land - всегда в конце
                if (a.id === 'undeveloped_land') return 1;
                if (b.id === 'undeveloped_land') return -1;
                
                let comparison = 0;
                
                switch (this.sortColumn) {
                    case 'name':
                        comparison = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                        break;
                    case 'id':
                        // Специальная обработка для civilization_N
                        const aMatch = a.id.match(/^civilization_(\d+)$/);
                        const bMatch = b.id.match(/^civilization_(\d+)$/);
                        if (aMatch && bMatch) {
                            // Если оба ID в формате civilization_N, сравниваем числа
                            comparison = parseInt(aMatch[1]) - parseInt(bMatch[1]);
                        } else if (aMatch) {
                            // Если только первый ID в формате civilization_N, он идет первым
                            comparison = -1;
                        } else if (bMatch) {
                            // Если только второй ID в формате civilization_N, он идет первым
                            comparison = 1;
                        } else {
                            // Для всех остальных случаев используем обычное сравнение
                            comparison = a.id.toLowerCase().localeCompare(b.id.toLowerCase());
                        }
                        break;
                    case 'provinces':
                        comparison = a.provinces - b.provinces;
                        break;
                    case 'capital':
                        comparison = (a.capital || '').toLowerCase().localeCompare((b.capital || '').toLowerCase());
                        break;
                    case 'color':
                        // Сортировка по сумме RGB компонентов
                        const sumA = (a.color || [0,0,0]).slice(0,3).reduce((sum, c) => sum + c, 0);
                        const sumB = (b.color || [0,0,0]).slice(0,3).reduce((sum, c) => sum + c, 0);
                        comparison = sumA - sumB;
                        break;
                }
                
                return this.sortDirection === 'asc' ? comparison : -comparison;
            });

        // Добавляем страны в список
        for (const country of countriesArray) {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.onclick = () => editCountry(country.id);
            
            // Цвет
            const colorCell = document.createElement('td');
            const colorDiv = document.createElement('div');
            colorDiv.className = 'country-color';
            colorDiv.style.backgroundColor = colorToRgb(country.color);
            colorCell.appendChild(colorDiv);
            
            // Название
            const nameCell = document.createElement('td');
            const nameSpan = document.createElement('span');
            nameSpan.textContent = country.name;
            nameCell.appendChild(nameSpan);

            // Добавляем иконку, если страна есть в landsData
            const isInLandsData = landsData.lands.some(land => land.key === country.id);
            if (isInLandsData) {
                const markImg = document.createElement('img');
                markImg.src = 'mark.svg';
                markImg.className = 'country-mark';
                nameCell.appendChild(markImg);
            }
            
            // Системное название (ID)
            const sysNameCell = document.createElement('td');
            sysNameCell.textContent = country.id;
            
            // Количество провинций
            const provincesCell = document.createElement('td');
            provincesCell.textContent = provincesCount[country.id] || 0;
            
            // Столица
            const capitalCell = document.createElement('td');
            capitalCell.textContent = country.capital_name || '';

            // Добавляем ячейки в строку
            row.appendChild(colorCell);
            row.appendChild(nameCell);
            row.appendChild(sysNameCell);
            row.appendChild(provincesCell);
            row.appendChild(capitalCell);

            // Добавляем строку в таблицу
            countriesList.appendChild(row);
        }
    }

    // Функция для обновления списка стран
    function updatePlayerLandSelect(lands, selectedValue) {
        const playerLandSelect = document.getElementById('player_land');
        if (!playerLandSelect || !lands) return;

        // Очищаем текущие опции
        playerLandSelect.innerHTML = '';
        
        // Добавляем опции из списка стран
        for (const [id, country] of Object.entries(lands)) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = country.name;
            playerLandSelect.appendChild(option);
        }
        
        // Устанавливаем выбранную страну
        if (selectedValue) {
            playerLandSelect.value = selectedValue;
        }
    }

    // Функция для сохранения изменений
    async function saveChanges() {
        if (hasFileSystemAccess) {
            if (!fileHandle) {
                try {
                    // Запрашиваем доступ к файловой системе
                    fileHandle = await window.showSaveFilePicker({
                        suggestedName: currentFile?.name || 'scenario.json',
                        types: [{
                            description: 'JSON Files',
                            accept: {
                                'application/json': ['.json']
                            }
                        }]
                    });
                } catch (err) {
                    if (err.name === 'AbortError') {
                        return; // Пользователь отменил выбор
                    }
                    console.error('Ошибка при получении доступа к файлу:', err);
                    if (fileInfo) {
                        fileInfo.textContent = 'Ошибка при получении доступа к файлу';
                    }
                    return;
                }
            }

            try {
                // Создаем поток для записи
                const writable = await fileHandle.createWritable();
                // Записываем содержимое
                await writable.write(previewContent.value);
                // Закрываем поток
                await writable.close();
                
                if (fileInfo) {
                    fileInfo.textContent = `Файл ${currentFile.name} сохранен`;
                }
            } catch (error) {
                console.error('Ошибка при сохранении файла:', error);
                if (fileInfo) {
                    fileInfo.textContent = 'Ошибка при сохранении файла';
                }
            }
        } else {
            // Для браузеров без поддержки File System Access API
            const blob = new Blob([previewContent.value], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = currentFile?.name || 'scenario.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            if (fileInfo) {
                fileInfo.textContent = 'Файл скачан';
            }
        }
    }

    // Функция для открытия файла
    async function openFile() {
        try {
            if (hasFileSystemAccess) {
                // Запрашиваем доступ к файлу
                [fileHandle] = await window.showOpenFilePicker({
                    types: [{
                        description: 'JSON Files',
                        accept: {
                            'application/json': ['.json']
                        }
                    }]
                });
                
                // Получаем файл
                currentFile = await fileHandle.getFile();
                
                // Читаем содержимое
                const text = await currentFile.text();
                
                // Обновляем интерфейс
                handleFileContent(currentFile.name, text);
            } else {
                // Для браузеров без поддержки File System Access API
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                
                input.onchange = async function(e) {
                    const file = e.target.files[0];
                    if (file) {
                        currentFile = file;
                        const text = await file.text();
                        handleFileContent(file.name, text);
                    }
                };
                
                input.click();
            }
        } catch (err) {
            console.error('Ошибка при открытии файла:', err);
            if (fileInfo) {
                fileInfo.textContent = 'Ошибка при открытии файла';
            }
        }
    }

    // Функция для обработки содержимого файла
    function handleFileContent(fileName, content) {
        if (previewContent) {
            previewContent.value = content;
        }
        if (previewFilename) {
            previewFilename.textContent = fileName;
        }
        if (fileInfo) {
            fileInfo.textContent = `Файл: ${fileName}`;
        }
        
        // Проверяем JSON
        isJsonFile = fileName.toLowerCase().endsWith('.json');
        if (isJsonFile) {
            try {
                const jsonData = JSON.parse(content);
                fillFormFromJson(jsonData);
                
                // Инициализируем менеджер стран
                if (window.countryManager) {
                    window.countryManager.jsonData = jsonData;
                    window.countryManager.updateCountriesList();
                }
            } catch (error) {
                console.error('Ошибка при парсинге JSON:', error);
                if (fileInfo) {
                    fileInfo.textContent = 'Ошибка при парсинге JSON';
                }
            }
        }
    }

    // Обработчик изменений в текстовом поле
    let saveTimeout;
    previewContent.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            fileInfo.textContent = 'Изменения не сохранены';
        }, 500);
    });

    // Обработчик кнопки принудительного сохранения
    forceSaveButton.addEventListener('click', saveChanges);

    // Обработчик выбора файла через input
    fileInput.addEventListener('click', (e) => {
        e.preventDefault();
        openFile();
    });

    // Обработчик drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');

        // Получаем перетащенные файлы
        if (hasFileSystemAccess) {
            const items = [...e.dataTransfer.items];
            for (const item of items) {
                if (item.kind === 'file') {
                    const handle = await item.getAsFileSystemHandle();
                    if (handle.kind === 'file') {
                        fileHandle = handle;
                        currentFile = await fileHandle.getFile();
                        const text = await currentFile.text();
                        handleFileContent(currentFile.name, text);
                        break;
                    }
                }
            }
        } else {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                currentFile = file;
                const text = await file.text();
                handleFileContent(file.name, text);
            }
        }
    });

    // Обработчик изменений в форме
    settingsForm.addEventListener('change', (e) => {
        if (!isJsonFile) return;
        
        const formData = new FormData(settingsForm);
        const data = Object.fromEntries(formData.entries());
        updateJsonEditor(data);
    });

    // Обработчик изменения цвета воды
    const waterColorInputs = ['water_color_r', 'water_color_g', 'water_color_b'].map(id => 
        document.getElementById(id)
    );

    waterColorInputs.forEach(input => {
        if (!input) return;
        
        input.addEventListener('input', () => {
            if (!isJsonFile || !previewContent) return;

            try {
                const jsonData = JSON.parse(previewContent.value);
                
                // Получаем значения RGB
                const r = Math.round(parseFloat(waterColorInputs[0].value) || 0);
                const g = Math.round(parseFloat(waterColorInputs[1].value) || 0);
                const b = Math.round(parseFloat(waterColorInputs[2].value) || 0);

                // Обновляем предпросмотр цвета
                const colorPreview = document.getElementById('water_color_preview');
                if (colorPreview) {
                    colorPreview.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
                }

                // Обновляем значение в JSON
                jsonData.water_color = [r, g, b, 255];
                
                // Обновляем содержимое редактора
                previewContent.value = JSON.stringify(jsonData, null, 4);
                
                if (fileInfo) {
                    fileInfo.textContent = 'Изменения не сохранены';
                }
            } catch (error) {
                console.error('Ошибка при обновлении цвета воды:', error);
                if (fileInfo) {
                    fileInfo.textContent = 'Ошибка при обновлении цвета воды';
                }
            }
        });
    });

    // Обработчик горячих клавиш
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Z - отмена
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            if (window.countryManager) {
                window.countryManager.undo();
            }
        }
        
        // Ctrl/Cmd + Shift + Z или Ctrl/Cmd + Y - возврат
        if ((e.ctrlKey || e.metaKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
            e.preventDefault();
            if (window.countryManager) {
                window.countryManager.redo();
            }
        }
    });

    // Загружаем данные при старте
    loadLandsJson();

    // Инициализируем менеджер стран
    window.countryManager = new CountryManager();
});

function changeApplicationLanguage(lang) {
    // Add your translation logic here
    // For example:
    const translations = {
        en: {
            editor: 'Editor',
            countries: 'Countries',
            events: 'Events',
            // Add more translations
        },
        ru: {
            editor: 'Редактор',
            countries: 'Страны',
            events: 'События',
            // Add more translations
        },
        uk: {
            editor: 'Редактор',
            countries: 'Країни',
            events: 'Події',
            // Add more translations
        }
    };

    // Apply translations
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
}

class CountryManager {
    constructor() {
        this.currentCountry = null;
        this.jsonData = null;
        this.undoStack = [];
        this.redoStack = [];
        this.maxStackSize = 50;
        this.isEditing = false;
        
        // Добавляем параметры сортировки
        this.sortColumn = 'name'; // По умолчанию сортируем по имени
        this.sortDirection = 'asc'; // По умолчанию по возрастанию
        
        // Сохраняем ссылки на важные элементы
        this.previewContent = document.getElementById('preview-content');
        this.fileInfo = document.getElementById('file-info');
        
        // Проверяем наличие необходимых элементов
        if (!this.previewContent) {
            console.error('Не найден элемент preview-content');
            return;
        }
        if (!this.fileInfo) {
            console.error('Не найден элемент file-info');
            return;
        }
        
        this.init();
    }

    init() {
        // Инициализация обработчиков событий
        this.initEventListeners();
        
        // Инициализация модального окна
        this.initModal();
        
        // Инициализация сортировки
        this.initSortHandlers();
    }

    // Добавляем новый метод для инициализации обработчиков сортировки
    initSortHandlers() {
        const headers = document.querySelectorAll('.countries-table th');
        headers.forEach((header, index) => {
            header.addEventListener('click', () => {
                // Определяем колонку для сортировки
                const columns = ['color', 'name', 'id', 'provinces', 'capital'];
                const column = columns[index];
                
                // Если кликнули на ту же колонку, меняем направление сортировки
                if (this.sortColumn === column) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortColumn = column;
                    this.sortDirection = 'asc';
                }
                
                // Обновляем классы заголовков
                headers.forEach(h => {
                    h.classList.remove('sort-asc', 'sort-desc');
                });
                header.classList.add(`sort-${this.sortDirection}`);
                
                // Обновляем список с новой сортировкой
                this.updateCountriesList();
            });
        });
    }

    // Модифицируем метод updateCountriesList
    updateCountriesList() {
        const countriesList = document.getElementById('countries-list');
        if (!countriesList || !this.jsonData?.lands) return;

        // Очищаем список
        countriesList.innerHTML = '';

        // Подсчитываем количество провинций
        const provincesCount = {};
        if (this.jsonData.provinces) {
            for (const province of this.jsonData.provinces) {
                if (province.owner) {
                    provincesCount[province.owner] = (provincesCount[province.owner] || 0) + 1;
                }
            }
        }

        // Создаем отсортированный массив стран
        const countriesArray = Object.entries(this.jsonData.lands)
            .filter(([id]) => id !== 'provinces')
            .map(([id, country]) => ({
                id,
                name: country.name,
                color: country.color,
                provinces: provincesCount[id] || 0,
                capital: country.capital_name || '',
                ...country
            }))
            .sort((a, b) => {
                // Специальная обработка для undeveloped_land - всегда в конце
                if (a.id === 'undeveloped_land') return 1;
                if (b.id === 'undeveloped_land') return -1;
                
                let comparison = 0;
                
                switch (this.sortColumn) {
                    case 'name':
                        comparison = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                        break;
                    case 'id':
                        // Специальная обработка для civilization_N
                        const aMatch = a.id.match(/^civilization_(\d+)$/);
                        const bMatch = b.id.match(/^civilization_(\d+)$/);
                        if (aMatch && bMatch) {
                            // Если оба ID в формате civilization_N, сравниваем числа
                            comparison = parseInt(aMatch[1]) - parseInt(bMatch[1]);
                        } else if (aMatch) {
                            // Если только первый ID в формате civilization_N, он идет первым
                            comparison = -1;
                        } else if (bMatch) {
                            // Если только второй ID в формате civilization_N, он идет первым
                            comparison = 1;
                        } else {
                            // Для всех остальных случаев используем обычное сравнение
                            comparison = a.id.toLowerCase().localeCompare(b.id.toLowerCase());
                        }
                        break;
                    case 'provinces':
                        comparison = a.provinces - b.provinces;
                        break;
                    case 'capital':
                        comparison = (a.capital || '').toLowerCase().localeCompare((b.capital || '').toLowerCase());
                        break;
                    case 'color':
                        // Сортировка по сумме RGB компонентов
                        const sumA = (a.color || [0,0,0]).slice(0,3).reduce((sum, c) => sum + c, 0);
                        const sumB = (b.color || [0,0,0]).slice(0,3).reduce((sum, c) => sum + c, 0);
                        comparison = sumA - sumB;
                        break;
                }
                
                return this.sortDirection === 'asc' ? comparison : -comparison;
            });

        // Добавляем страны в список
        for (const country of countriesArray) {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.onclick = () => this.openCountry(country.id);

            row.innerHTML = `
                <td><div class="country-color" style="background-color: ${this.colorToRgb(country.color)}"></div></td>
                <td>${country.name}</td>
                <td>${country.id}</td>
                <td>${country.provinces}</td>
                <td>${country.capital_name}</td>
            `;

            countriesList.appendChild(row);
        }
    }

    initEventListeners() {
        // Обработчик добавления новой страны
        document.getElementById('add-country')?.addEventListener('click', () => this.createNewCountry());

        // Обработчики действий со страной
        document.getElementById('copy-country')?.addEventListener('click', () => this.copyCurrentCountry());
        document.getElementById('delete-country')?.addEventListener('click', () => this.deleteCurrentCountry());
        document.getElementById('country-reforms')?.addEventListener('click', () => this.openReforms());

        // Обработчики формы редактирования
        const form = document.getElementById('country-form');
        if (form) {
            form.addEventListener('change', (e) => this.handleFormChange(e));
            form.addEventListener('submit', (e) => e.preventDefault());
        }

        // Обработчики отношений
        document.querySelectorAll('.add-country-button').forEach(button => {
            console.log('Найдена кнопка добавления:', button);
            const target = button.getAttribute('data-target');
            console.log('target:', target);
            
            if (target) {
                // Получаем тип отношений из ID контейнера
                const relation = target.replace('country-', '');
                button.setAttribute('data-relation', relation);
                console.log('Установлен data-relation:', relation);
                
                button.addEventListener('click', (e) => {
                    console.log('Клик по кнопке добавления');
                    this.handleAddRelation(e);
                });
            }
        });

        // Делегирование событий для динамических элементов
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('array-item-delete')) {
                this.handleDeleteRelation(e);
            } else if (e.target.classList.contains('relation-edit')) {
                this.showRelationParamsModal(e);
            }
        });

        // Обработчики цвета
        this.initColorHandlers();
    }

    initColorHandlers() {
        const colorInputs = ['country-color-r', 'country-color-g', 'country-color-b'].map(id => 
            document.getElementById(id)
        );

        colorInputs.forEach(input => {
            if (!input) return;
            input.addEventListener('input', () => {
                const [r, g, b] = colorInputs.map(input => Math.round(parseFloat(input.value) || 0));
                const preview = document.getElementById('country-color-preview');
                if (preview) {
                    preview.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
                }
                this.saveChanges();
            });
        });
    }

    initModal() {
        const modal = document.getElementById('country-select-modal');
        if (!modal) return;

        // Закрытие модального окна
        modal.querySelector('.close-modal')?.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        // Добавление выбранной страны
        modal.querySelector('#add-selected-country')?.addEventListener('click', () => {
            this.addSelectedCountry();
        });
    }

    createNewCountry() {
        const id = this.generateUniqueId();
        const newCountry = {
            name: 'Новая страна',
            color: [128, 128, 128, 255],
            capital_name: '',
            capital: 0,
            defeated: false,
            political: '',
            allies: {},
            enemies: {},
            guaranteed: {},
            guaranteed_by: {},
            pacts: {},
            sanctions: {},
            vassals: {}
        };

        this.pushToUndoStack();
        this.jsonData.lands[id] = newCountry;
        this.updateCountriesList();
        this.openCountry(id);
        this.saveChanges();
    }

    generateUniqueId() {
        const existingIds = Object.keys(this.jsonData.lands);
        let n = 1;
        while (existingIds.includes(`civilization_${n}`)) {
            n++;
        }
        return `civilization_${n}`;
    }

    copyCurrentCountry() {
        if (!this.currentCountry || !this.jsonData?.lands[this.currentCountry]) return;

        const newId = this.generateUniqueId();
        const currentCountry = this.jsonData.lands[this.currentCountry];
        
        this.pushToUndoStack();
        this.jsonData.lands[newId] = JSON.parse(JSON.stringify(currentCountry));
        this.jsonData.lands[newId].name += ' (копия)';
        
        this.updateCountriesList();
        this.openCountry(newId);
        this.saveChanges();
    }

    deleteCurrentCountry() {
        if (!this.currentCountry || !this.jsonData?.lands[this.currentCountry]) return;

        if (confirm('Вы уверены, что хотите удалить эту страну?')) {
            this.pushToUndoStack();
            delete this.jsonData.lands[this.currentCountry];
            this.updateCountriesList();
            this.switchToCountriesList();
            this.saveChanges();
        }
    }

    openCountry(countryId) {
        if (!this.jsonData?.lands[countryId]) return;

        this.currentCountry = countryId;
        const country = this.jsonData.lands[countryId];

        // Заполняем основные поля
        const nameHeader = document.getElementById('country-name-header');
        if (nameHeader) {
            nameHeader.innerHTML = ''; // Очищаем содержимое
            
            // Добавляем название
            const nameSpan = document.createElement('span');
            nameSpan.textContent = country.name;
            nameHeader.appendChild(nameSpan);

            // Проверяем, нужна ли галочка
            const isInLandsData = landsData.lands.some(land => land.key === countryId);
            if (isInLandsData) {
                const markImg = document.createElement('img');
                markImg.src = 'mark.svg';
                markImg.className = 'country-mark';
                nameHeader.appendChild(markImg);
            }
        }

        this.setFormValues({
            'country-name': country.name,
            'country-capital': country.capital_name || '',
            'country-capital-id': country.capital || '',
            'country-defeated': country.defeated ? 'true' : 'false',
            'country-political': country.political || ''
        });

        // Устанавливаем цвет
        if (Array.isArray(country.color) && country.color.length >= 3) {
            this.setFormValues({
                'country-color-r': country.color[0],
                'country-color-g': country.color[1],
                'country-color-b': country.color[2]
            });

            const colorPreview = document.getElementById('country-color-preview');
            if (colorPreview) {
                colorPreview.style.backgroundColor = `rgb(${country.color[0]}, ${country.color[1]}, ${country.color[2]})`;
            }
        }

        // Заполняем отношения
        this.populateRelationLists(country);

        // Переключаемся на страницу редактирования
        this.switchToEditPage();
    }

    setFormValues(values) {
        Object.entries(values).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (element.tagName === 'INPUT' || element.tagName === 'SELECT') {
                    element.value = value;
                } else {
                    element.textContent = value;
                }
            }
        });
    }

    populateRelationLists(country) {
        const relations = ['allies', 'enemies', 'guaranteed', 'guaranteed_by', 'pacts', 'sanctions', 'vassals'];
        relations.forEach(relation => {
            const container = document.getElementById(`country-${relation.replace('_', '-')}`);
            if (!container) return;

            // Очищаем контейнер
            container.innerHTML = '';

            // Добавляем существующие отношения
            const items = country[relation];
            if (items) {
                if (Array.isArray(items)) {
                    // Если это массив, создаем пустой объект
                    country[relation] = {};
                } else if (typeof items === 'object') {
                    // Если это объект, добавляем отношения
                    Object.entries(items).forEach(([targetCountry, params]) => {
                        this.addRelationItem(container, targetCountry, params);
                    });
                }
            } else {
                // Если отношения не определены, создаем пустой объект
                country[relation] = {};
            }
        });
    }

    addRelationItem(container, targetCountry, params = {}) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'array-list-item';

        let extraInfo = '';
        if (params.turn !== undefined) {
            extraInfo += `<span class="relation-turn">Ход: ${params.turn}</span>`;
        }
        if (params.duration !== undefined) {
            extraInfo += `<span class="relation-duration">Длительность: ${params.duration}</span>`;
        }
        if (params.initiator !== undefined) {
            extraInfo += `<span class="relation-initiator">Инициатор: ${params.initiator ? 'Да' : 'Нет'}</span>`;
        }

        itemDiv.innerHTML = `
            <div class="relation-info">
                <input type="text" class="array-item-input" value="${targetCountry}"
                    data-turn="${params.turn || 0}"
                    data-duration="${params.duration || ''}"
                    data-initiator="${params.initiator || false}">
                <div class="relation-params">${extraInfo}</div>
            </div>
            <div class="relation-controls">
                <button type="button" class="relation-edit">✎</button>
                <button type="button" class="array-item-delete">×</button>
            </div>
        `;

        container.appendChild(itemDiv);
    }

    handleAddRelation(e) {
        console.log('handleAddRelation вызван', e.target);
        const button = e.target;
        const target = button.getAttribute('data-target');
        console.log('target:', target);
        
        // Добавляем префикс country- к ID контейнера
        const containerId = `country-${target}`;
        console.log('containerId:', containerId);
        
        const container = document.getElementById(containerId);
        console.log('container:', container);
        
        if (!container) {
            console.error('Не найден контейнер для добавления отношений:', containerId);
            return;
        }

        // Проверяем, что текущая страна существует
        if (!this.currentCountry || !this.jsonData?.lands[this.currentCountry]) {
            console.error('Не выбрана текущая страна');
            return;
        }

        this.pushToUndoStack();

        // Создаем элемент
        const itemDiv = document.createElement('div');
        itemDiv.className = 'array-list-item';
        itemDiv.innerHTML = `
            <div class="relation-info">
                <input type="text" class="array-item-input" value=""
                    data-turn="0">
                <div class="relation-params">
                    <span class="relation-turn">Ход: 0</span>
                </div>
            </div>
            <div class="relation-controls">
                <button type="button" class="relation-edit">✎</button>
                <button type="button" class="array-item-delete">×</button>
            }
        `;

        container.appendChild(itemDiv);
        console.log('Элемент добавлен');

        // Сразу показываем модальное окно для редактирования
        this.showRelationParamsModal({ target: itemDiv.querySelector('.relation-edit') });
    }

    handleDeleteRelation(e) {
        const item = e.target.closest('.array-list-item');
        if (!item) return;

        this.pushToUndoStack();

        // Получаем тип отношений и ID страны перед удалением
        const relationType = item.closest('.array-list').id.replace('country-', '').replace('-', '_');
        const targetCountryId = item.querySelector('input')?.value;

        // Если это вассал, удаляем поле vassal_of у вассала
        if (relationType === 'vassals' && targetCountryId && this.jsonData?.lands[targetCountryId]) {
            delete this.jsonData.lands[targetCountryId].vassal_of;
        }

        item.remove();
        this.saveChanges();
    }

    showRelationParamsModal(e) {
        const item = e.target.closest('.array-list-item');
        const input = item?.querySelector('input');
        if (!input) return;

        const relationType = item.closest('.array-list').id.replace('country-', '').replace('-', '_');
        const params = {
            turn: input.getAttribute('data-turn'),
            duration: input.getAttribute('data-duration'),
            initiator: input.getAttribute('data-initiator') === 'true'
        };

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Параметры отношений</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Страна</label>
                        <select class="param-country">
                            ${this.generateCountryOptions()}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Ход начала</label>
                        <input type="number" class="param-turn" value="${params.turn || 0}" min="0">
                    </div>
                    <div class="form-group">
                        <label>Длительность</label>
                        <input type="number" class="param-duration" value="${params.duration || ''}" min="0">
                    </div>
                    ${relationType === 'sanctions' ? `
                    <div class="form-group">
                        <label>Инициатор</label>
                        <select class="param-initiator">
                            <option value="false" ${!params.initiator ? 'selected' : ''}>Нет</option>
                            <option value="true" ${params.initiator ? 'selected' : ''}>Да</option>
                        </select>
                    </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="action-button save-params">Сохранить</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Устанавливаем текущую страну в селекте
        const countrySelect = modal.querySelector('.param-country');
        if (countrySelect) {
            countrySelect.value = input.value;
        }

        const closeModal = () => modal.remove();
        modal.querySelector('.close-modal').onclick = closeModal;

        modal.querySelector('.save-params').onclick = () => {
            const selectedCountryId = modal.querySelector('.param-country').value;
            const turn = modal.querySelector('.param-turn').value;
            const duration = modal.querySelector('.param-duration').value;
            const initiator = modal.querySelector('.param-initiator')?.value;

            this.pushToUndoStack();
            
            // Обновляем отношения для текущей страны
            input.value = selectedCountryId;
            input.setAttribute('data-turn', turn);
            if (duration) input.setAttribute('data-duration', duration);
            if (initiator !== undefined) input.setAttribute('data-initiator', initiator);

            const paramsDiv = item.querySelector('.relation-params');
            paramsDiv.innerHTML = this.formatRelationParams({
                turn: parseInt(turn),
                duration: duration ? parseInt(duration) : undefined,
                initiator: initiator === 'true'
            });

            // Обновляем отношения для выбранной страны
            this.updateReciprocatedRelation(selectedCountryId, relationType, {
                turn: parseInt(turn),
                duration: duration ? parseInt(duration) : undefined,
                initiator: initiator === 'true'
            });

            this.saveChanges();
            closeModal();
        };
    }

    generateCountryOptions() {
        if (!this.jsonData?.lands) return '';
        
        let options = '';
        for (const [id, country] of Object.entries(this.jsonData.lands)) {
            if (id === this.currentCountry) continue; // Исключаем текущую страну
            options += `<option value="${id}">${country.name} (${id})</option>`;
        }
        return options;
    }

    updateReciprocatedRelation(targetCountryId, relationType, params) {
        if (!this.jsonData?.lands[targetCountryId]) return;

        const reciprocalTypes = {
            allies: 'allies',
            enemies: 'enemies',
            pacts: 'pacts',
            sanctions: 'sanctions',
            guaranteed: 'guaranteed_by',
            guaranteed_by: 'guaranteed'
        };

        // Специальная обработка для вассалов
        if (relationType === 'vassals') {
            // Добавляем только поле vassal_of вассалу
            this.jsonData.lands[targetCountryId].vassal_of = this.currentCountry;
            return; // Выходим, не добавляя взаимные отношения
        }

        const reciprocalType = reciprocalTypes[relationType];
        if (!reciprocalType) return;

        // Обновляем отношения у целевой страны
        const targetCountry = this.jsonData.lands[targetCountryId];
        
        // Проверяем существующие отношения
        if (!targetCountry[reciprocalType]) {
            targetCountry[reciprocalType] = {};
        } else if (Array.isArray(targetCountry[reciprocalType])) {
            targetCountry[reciprocalType] = {};
        }

        const relationParams = { turn: params.turn };
        if (params.duration !== undefined) {
            relationParams.duration = params.duration;
        }
        if (params.initiator !== undefined) {
            relationParams.initiator = !params.initiator; // Инвертируем для второй страны
        }

        targetCountry[reciprocalType][this.currentCountry] = relationParams;
    }

    formatRelationParams(params) {
        let html = '';
        if (params.turn !== undefined) {
            html += `<span class="relation-turn">Ход: ${params.turn}</span>`;
        }
        if (params.duration !== undefined) {
            html += `<span class="relation-duration">Длительность: ${params.duration}</span>`;
        }
        if (params.initiator !== undefined) {
            html += `<span class="relation-initiator">Инициатор: ${params.initiator ? 'Да' : 'Нет'}</span>`;
        }
        return html;
    }

    handleFormChange(e) {
        if (this.isEditing) return;
        this.pushToUndoStack();
        this.saveChanges();
    }

    saveChanges() {
        if (!this.currentCountry || !this.jsonData?.lands[this.currentCountry]) return;

        this.isEditing = true;
        try {
            const country = this.jsonData.lands[this.currentCountry];

            // Обновляем основные данные
            country.name = document.getElementById('country-name').value;
            country.capital_name = document.getElementById('country-capital').value;
            country.capital = parseInt(document.getElementById('country-capital-id').value) || 0;
            country.defeated = document.getElementById('country-defeated').value === 'true';
            country.political = document.getElementById('country-political').value;

            // Обновляем цвет
            const r = parseFloat(document.getElementById('country-color-r').value) || 0;
            const g = parseFloat(document.getElementById('country-color-g').value) || 0;
            const b = parseFloat(document.getElementById('country-color-b').value) || 0;
            country.color = [r, g, b, 255];

            // Обновляем отношения
            this.updateRelations(country);

            // Обновляем JSON и интерфейс
            this.updateJsonAndUI();
        } finally {
            this.isEditing = false;
        }
    }

    updateRelations(country) {
        const relations = ['allies', 'enemies', 'guaranteed', 'guaranteed_by', 'pacts', 'sanctions', 'vassals'];
        relations.forEach(relation => {
            const container = document.getElementById(`country-${relation.replace('_', '-')}`);
            if (!container) return;

            const relationData = {};
            container.querySelectorAll('.array-list-item').forEach(item => {
                const input = item.querySelector('input');
                if (!input?.value.trim()) return;

                const targetCountry = input.value.trim();
                const data = {
                    turn: parseInt(input.getAttribute('data-turn')) || 0
                };

                const duration = input.getAttribute('data-duration');
                if (duration) {
                    data.duration = parseInt(duration);
                }

                const initiator = input.getAttribute('data-initiator');
                if (initiator === 'true') {
                    data.initiator = true;
                }

                relationData[targetCountry] = data;
            });

            // Если нет отношений, устанавливаем пустой объект вместо массива
            country[relation] = Object.keys(relationData).length > 0 ? relationData : {};
        });
    }

    updateJsonAndUI() {
        if (!this.jsonData || !this.previewContent) return;

        this.previewContent.value = JSON.stringify(this.jsonData, null, 4);
        
        const nameHeader = document.getElementById('country-name-header');
        if (nameHeader) {
            nameHeader.textContent = this.jsonData.lands[this.currentCountry].name;
        }

        if (this.fileInfo) {
            this.fileInfo.textContent = 'Изменения не сохранены';
        }

        this.updateCountriesList();
    }

    colorToRgb(colorArray) {
        if (!Array.isArray(colorArray) || colorArray.length < 3) {
            return 'rgb(128, 128, 128)';
        }
        const r = Math.round(parseFloat(colorArray[0]) || 0);
        const g = Math.round(parseFloat(colorArray[1]) || 0);
        const b = Math.round(parseFloat(colorArray[2]) || 0);
        return `rgb(${r}, ${g}, ${b})`;
    }

    switchToEditPage() {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('country-edit')?.classList.add('active');

        document.querySelectorAll('.nav-button').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    switchToCountriesList() {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('countries')?.classList.add('active');

        document.querySelectorAll('.nav-button').forEach(btn => {
            if (btn.getAttribute('data-page') === 'countries') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    pushToUndoStack() {
        if (!this.jsonData) return;
        
        this.undoStack.push(JSON.stringify(this.jsonData));
        if (this.undoStack.length > this.maxStackSize) {
            this.undoStack.shift();
        }
        this.redoStack = [];
    }

    undo() {
        if (this.undoStack.length === 0) return;

        const currentState = JSON.stringify(this.jsonData);
        this.redoStack.push(currentState);

        const previousState = this.undoStack.pop();
        this.jsonData = JSON.parse(previousState);

        this.updateJsonAndUI();
        if (this.currentCountry) {
            this.openCountry(this.currentCountry);
        }
    }

    redo() {
        if (this.redoStack.length === 0) return;

        const currentState = JSON.stringify(this.jsonData);
        this.undoStack.push(currentState);

        const nextState = this.redoStack.pop();
        this.jsonData = JSON.parse(nextState);

        this.updateJsonAndUI();
        if (this.currentCountry) {
            this.openCountry(this.currentCountry);
        }
    }
}

