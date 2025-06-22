// Зависимости
document.addEventListener('DOMContentLoaded', () => {
    // Дожидаемся инициализации системы уведомлений
    window.addEventListener('notificationSystemReady', () => {
        // Система уведомлений готова к использованию
    });
});

/**
 * Переводит текст с использованием API My Memory Translation
 * @param {string} text - Текст для перевода
 * @param {string} sourceLang - Исходный язык (en, ru, etc)
 * @param {string} targetLang - Целевой язык (en, ru, etc)
 * @returns {Promise<string>} Переведенный текст
 */
async function translateText(text, sourceLang = 'en', targetLang = 'ru') {
    try {
        // Если определена и не пуста CSV-таблица переводов
        if (typeof tableTranslations === 'string' && tableTranslations.trim().length > 0) {
            // Сопоставление коротких кодов с заголовками столбцов
            const langMap = {
                ru: "Русский",
                en: "English",
                uk: "Українська"
            };

            const fromLang = langMap[sourceLang] || sourceLang;
            const toLang   = langMap[targetLang]  || targetLang;

            // Парсим CSV
            const csvData = tableTranslations.trim();
            const lines   = csvData.split(/\r?\n/);
            const headers = lines[0].split(',');

            const fromIndex = headers.indexOf(fromLang);
            const toIndex   = headers.indexOf(toLang);

            if (fromIndex === -1 || toIndex === -1) {
                console.warn(`Языки "${fromLang}" или "${toLang}" не найдены в таблице.`);
            } else {
                // Ищем точное совпадение в колонке-источнике
                for (let i = 1; i < lines.length; i++) {
                    const row = lines[i].split(',');
                    if (row[fromIndex]?.trim() === text.trim()) {
                        return row[toIndex]?.trim() || text;
                    }
                }
            }

            // Если не нашли в таблице — возвращаем оригинал
            // return text;
        }
        showInfo('Обращение к переводчику, так как нету в таблице')

        // Если таблицы нет — вызываем внешний API MyMemory
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.responseStatus === 200 && data.responseData?.translatedText) {
            return data.responseData.translatedText;
        } else {
            throw new Error(data.responseDetails || 'Translation failed');
        }
    } catch (error) {
        console.error('Translation error:', error);
        return text;
    }
}



/**
 * Переводит HTML элемент и все его дочерние элементы
 * @param {HTMLElement} element - HTML элемент для перевода
 * @param {string} sourceLang - Исходный язык (en, ru, etc)
 * @param {string} targetLang - Целевой язык (en, ru, etc)
 */
async function translateElement(element, sourceLang = 'en', targetLang = 'ru') {
    // Рекурсивно обходим все текстовые узлы
    const walk = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let node;
    let promises = [];

    while (node = walk.nextNode()) {
        const text = node.textContent.trim();
        if (text) {
            // Собираем все промисы переводов
            promises.push(
                translateText(text, sourceLang, targetLang)
                    .then(translatedText => {
                        node.textContent = translatedText;
                    })
            );
        }
    }

    // Ждем завершения всех переводов
    await Promise.all(promises);
}

/**
 * Создает диалог выбора языков для перевода
 * @returns {Promise<{sourceLang: string, targetLang: string}>} Выбранные языки
 */
function createLanguageDialog() {
    return new Promise((resolve) => {
        // Создаем диалоговое окно
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            color: white;
            background-color: #333;
            outline: none;
        `;

        // Добавляем содержимое
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
            <button id="translateBtn" style="outline: none; padding: 5px 15px; border-radius: 7px; background-color: #2980b9;">Начать перевод</button>
        `;

        // Добавляем диалог на страницу
        document.body.appendChild(dialog);

        // Обработчик кнопки
        const translateBtn = dialog.querySelector('#translateBtn');
        translateBtn.onclick = () => {
            const sourceLang = dialog.querySelector('#sourceLang').value;
            const targetLang = dialog.querySelector('#targetLang').value;
            const isCapitals = dialog.querySelector('#isCapitals').checked;
            document.body.removeChild(dialog);
            resolve({ sourceLang, targetLang, isCapitals });
        };
    });
}

/**
 * Переводит все указанные параметры в объекте данных
 * @param {Object} data - Объект с данными для перевода
 * @param {string} sourceLang - Исходный язык
 * @param {string} targetLang - Целевой язык
 * @returns {Promise<Object>} Объект с переведенными данными
 */
async function translateParameters(data, sourceLang, targetLang, isCapitals = true) {
    window.showInfo('Перевод', 'Начинаем перевод параметров...');

    let fieldsToTranslate;
    if (isCapitals) {
        fieldsToTranslate = [
            'name',
            'capital_name',
            'title',
            'answer1',
            'answer2',
            'answer3',
            'description1',
            'description2',
            'description3'
        ];
    } else {
        fieldsToTranslate = [
            'name',
            'title',
            'answer1',
            'answer2',
            'answer3',
            'description1',
            'description2',
            'description3'
        ];
    }

    // Рекурсивная функция для обхода объекта
    async function translateObject(obj) {
        if (!obj || typeof obj !== 'object') return obj;

        // Если это массив, обрабатываем каждый элемент
        if (Array.isArray(obj)) {
            const newArray = [];
            for (const item of obj) {
                newArray.push(await translateObject(item));
            }
            return newArray;
        }

        // Создаем копию объекта
        const translatedObj = { ...obj };

        // Обходим все поля объекта
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null) {
                // Рекурсивно обрабатываем вложенные объекты
                translatedObj[key] = await translateObject(value);
            } else if (typeof value === 'string' && fieldsToTranslate.includes(key)) {
                try {
                    if (value.trim() === '') {
                        console.warn(`Пропускаем пустое поле ${key}`);
                        continue; // Пропускаем пустые строки
                    }
                    console.log(`Переводим ${key}: ${value}`);
                    const translated = await translateText(value, sourceLang, targetLang);
                    translatedObj[key] = translated;
                    console.log(`Переведено ${key}: ${translated}`);
                    window.showSuccess('Перевод', `Переведено: ${key} как "${translated}"`);
                } catch (error) {
                    console.error(`Ошибка при переводе поля ${key}:`, error);
                    window.showError('Перевод', `Ошибка перевода: ${key}`);
                }
                // Добавляем небольшую задержку, чтобы не перегружать API
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return translatedObj;
    }

    // Переводим весь объект
    const result = await translateObject(data);
    window.showSuccess('Перевод', 'Перевод параметров завершен');
    return result;
}

/**
 * Основная функция для перевода данных из текущего файла
 */
async function translateCurrentFile() {
    //try {
        // Получаем выбор языков от пользователя
        const { sourceLang, targetLang, isCapitals } = await createLanguageDialog();

        // Получаем данные из текущего файла
        const fileContent = JSON.stringify(window.countryManager.jsonData);
        console.log('проверка...');
        if (!fileContent) {
            throw new Error('Не удалось найти содержимое файла');
        }

        // Парсим JSON
        const data = JSON.parse(fileContent);

        // Если это массив, переводим каждый элемент
        console.log('Начинаем перевод данных...');
        if (Array.isArray(data)) {
            const translatedArray = [];
            for (const item of data) {
                const translatedItem = await translateParameters(item, sourceLang, targetLang, isCapitals);
                translatedArray.push(translatedItem);
            }
            return translatedArray;
        } else {
            // Если это объект, переводим его
            return await translateParameters(data, sourceLang, targetLang, isCapitals);
        }
    /*} catch (error) {
        console.log('ошибка');
        console.error('Ошибка при переводе файла:', error);
        return null;
    }*/
}

/**
 * Показывает уведомление о состоянии процесса
 * @param {string} message - Текст уведомления
 * @param {string} type - Тип уведомления ('info', 'success', 'error')
 */
/*function window.showInfo(message, type = 'info') {
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
        background: ${colors[type]};
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        z-index: 1001;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }
    }, 3000);
}*/

/**
 * Переводит файл и сохраняет изменения
 * @returns {Promise<boolean>} Возвращает true если файл сохранен, false если операция отменена
 */
async function translateAndSaveFile() {
    translateCurrentFile()
        .then(translatedData => {
            if (window.countryManager) {
                window.countryManager.jsonData = translatedData;
                window.countryManager.updateCountriesList();
            }
            if (window.eventManager) {
                window.eventManager.setJsonData(translatedData);
            }
            fillFormFromJson(translatedData);
            if (previewContent) {
                previewContent.value = JSON.stringify(translatedData);
            }
        }
    )
}

/**
 * Рекомендуемый способ вызова функции перевода
 */
function translate() {
    showNotification('Запуск перевода...', 'info');
    return translateAndSaveFile()
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

// Пример использования:
/*
translateAndSaveFile()
    .then(success => {
        if (success) {
            console.log('Файл успешно переведен и сохранен');
        } else {
            console.log('Операция была отменена пользователем');
        }
    });
*/