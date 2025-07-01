// Зависимости

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('notificationSystemReady', () => {
        // Система уведомлений готова к использованию
    });
});

// Кэш и таблица переводов
const translationCache = new Map();
let parsedTable = null;

// Семафор для API переводчика
let translationInProgress = false;
const translationQueue = [];

// Функция для обработки очереди переводов
async function processTranslationQueue() {
    if (translationInProgress || translationQueue.length === 0) return;
    
    translationInProgress = true;
    const { text, sourceLang, targetLang, resolve, reject } = translationQueue.shift();
    
    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
        const response = await fetch(url);
        const data = await response.json();
        
        await new Promise(r => setTimeout(r, 1000)); // Задержка 1 секунда между запросами
        
        if (data?.responseStatus === 200 && data.responseData?.translatedText) {
            resolve(data.responseData.translatedText);
        } else {
            resolve(text);
        }
    } catch (err) {
        console.error('Ошибка API перевода:', err);
        resolve(text);
    } finally {
        translationInProgress = false;
        processTranslationQueue(); // Обрабатываем следующий запрос в очереди
    }
}

// Функция для добавления запроса в очередь
function queueTranslationRequest(text, sourceLang, targetLang) {
    return new Promise((resolve, reject) => {
        translationQueue.push({ text, sourceLang, targetLang, resolve, reject });
        processTranslationQueue();
    });
}

function parseTranslationTable() {
    if (parsedTable) return parsedTable;
    const langMap = {
        ru: "Русский",
        en: "English",
        uk: "Українська"
    };
    const lines = tableTranslations.trim().split(/\r?\n/);
    const headers = lines[0].split(',');
    const map = lines.slice(1).map(line => line.split(','));
    parsedTable = { headers, map, langMap };
    return parsedTable;
}

function lookupInTable(text, sourceLang, targetLang) {
    const { headers, map, langMap } = parseTranslationTable();
    const fromIndex = headers.indexOf(langMap[sourceLang] || sourceLang);
    const toIndex = headers.indexOf(langMap[targetLang] || targetLang);
    if (fromIndex === -1 || toIndex === -1) return null;
    for (const row of map) {
        if (row[fromIndex]?.trim() === text.trim()) {
            return row[toIndex]?.trim() || null;
        }
    }
    return null;
}

async function translateText(text, sourceLang = 'en', targetLang = 'ru') {
    const cacheKey = `${sourceLang}:${targetLang}:${text}`;
    if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey);
    }
    
    let result = null;
    if (typeof tableTranslations === 'string' && tableTranslations.trim()) {
        result = lookupInTable(text, sourceLang, targetLang);
        if (result) {
            translationCache.set(cacheKey, result);
            return result;
        }
    }
    
    // Используем очередь для API запросов
    result = await queueTranslationRequest(text, sourceLang, targetLang);
    translationCache.set(cacheKey, result);
    return result;
}

async function translateElement(element, sourceLang = 'en', targetLang = 'ru') {
    const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    let node;
    const promises = [];
    while (node = walk.nextNode()) {
        const text = node.textContent.trim();
        if (text) {
            promises.push(
                translateText(text, sourceLang, targetLang).then(translated => {
                    node.textContent = translated;
                })
            );
        }
    }
    await Promise.all(promises);
}

function createLanguageDialog() {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #333;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            color: white;
            outline: none;`;
        dialog.innerHTML = `
            <h3 style="margin-top: 0;">Выберите языки для перевода</h3>
            <div style="margin-bottom: 15px;">
                <label>С языка: </label>
                <select id="sourceLang" style="margin-left: 10px;">
                    <option value="en">English</option>
                    <option value="ru">Русский</option>
                    <option value="uk">Українська</option>
                    <option value="de">Deutsch</option>
                    <option value="fr">Français</option>
                </select>
            </div>
            <div style="margin-bottom: 20px;">
                <label>На язык: </label>
                <select id="targetLang" style="margin-left: 10px;">
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                    <option value="uk">Українська</option>
                    <option value="de">Deutsch</option>
                    <option value="fr">Français</option>
                </select>
            </div>
            <div style="margin-bottom: 20px;">
                <label>Переводить столицы? </label>
                <input type="checkbox" id="isCapitals" value="yes" checked>
            </div>
            <button id="translateBtn" style="outline: none; padding: 5px 15px; border-radius: 7px; background-color: #2980b9; color: white;">Начать перевод</button>
        `;
        document.body.appendChild(dialog);
        dialog.querySelector('#translateBtn').onclick = () => {
            const sourceLang = dialog.querySelector('#sourceLang').value;
            const targetLang = dialog.querySelector('#targetLang').value;
            const isCapitals = dialog.querySelector('#isCapitals').checked;
            document.body.removeChild(dialog);
            resolve({ sourceLang, targetLang, isCapitals });
        };
    });
}

async function translateParameters(data, sourceLang, targetLang, isCapitals = true) {
    window.showInfo('Перевод', 'Начинаем перевод параметров...');
    const fieldsToTranslate = isCapitals
        ? ['name', 'capital_name', 'title', 'answer1', 'answer2', 'answer3', 'description1', 'description2', 'description3']
        : ['name', 'title', 'answer1', 'answer2', 'answer3', 'description1', 'description2', 'description3'];
    async function translateObject(obj) {
        if (!obj || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) {
            return await Promise.all(obj.map(item => translateObject(item)));
        }
        const translatedObj = { ...obj };
        const translationTasks = [];
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null) {
                translationTasks.push(
                    translateObject(value).then(translated => {
                        translatedObj[key] = translated;
                    })
                );
            } else if (typeof value === 'string' && fieldsToTranslate.includes(key) && value.trim()) {
                translationTasks.push(
                    translateText(value, sourceLang, targetLang).then(translated => {
                        translatedObj[key] = translated;
                        window.showSuccess('Перевод', `Переведено: ${key}`);
                    }).catch(error => {
                        console.error(`Ошибка перевода ${key}:`, error);
                        window.showError('Перевод', `Ошибка перевода: ${key}`);
                    })
                );
            }
        }
        await Promise.all(translationTasks);
        return translatedObj;
    }
    const result = await translateObject(data);
    window.showSuccess('Перевод', 'Перевод параметров завершён');
    return result;
}

async function translateCurrentFile() {
    const { sourceLang, targetLang, isCapitals } = await createLanguageDialog();
    const fileContent = JSON.stringify(window.countryManager.jsonData);
    if (!fileContent) throw new Error('Не удалось найти содержимое файла');
    const data = JSON.parse(fileContent);
    let translated;
    if (Array.isArray(data)) {
        translated = await Promise.all(data.map(item => translateParameters(item, sourceLang, targetLang, isCapitals)));
    } else {
        translated = await translateParameters(data, sourceLang, targetLang, isCapitals);
    }
    if (window.countryManager) {
        window.countryManager.jsonData = translated;
        window.countryManager.updateCountriesList();
    }
    if (window.eventManager) {
        window.eventManager.setJsonData(translated);
    }
    fillFormFromJson(translated);
    if (window.previewContent) {
        previewContent.value = JSON.stringify(translated);
    }
    return true;
}

function showNotification(message, type = 'info') {
    const colors = {
        info: '#2196F3',
        success: '#4CAF50',
        error: '#f44336'
    };
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || '#2196F3'};
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        z-index: 1001;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

function translateAndSaveFile() {
    showNotification('Запуск перевода...', 'info');
    return translateCurrentFile()
        .then(success => {
            if (success) {
                console.log('✅ Файл успешно переведен и сохранен');
            } else {
                console.log('❌ Операция была отменена пользователем');
            }
            return success;
        })
        .catch(error => {
            console.error('❌ Произошла ошибка:', error);
            return false;
        });
}
