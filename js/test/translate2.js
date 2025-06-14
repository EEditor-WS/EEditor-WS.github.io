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
async function translateText2(text, sourceLang = 'en', targetLang = 'ru') {
    try {
        // My Memory Translation API endpoint
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Проверяем успешность перевода
        if (data.responseStatus === 200) {
            return data.responseData.translatedText;
        } else {
            throw new Error(data.responseDetails || 'Translation failed');
        }
    } catch (error) {
        console.error('Translation error:', error);
        // Возвращаем исходный текст в случае ошибки
        return text;
    }
}

function generateTranslationObject(scenario) {
    if (!scenario) {
        console.error("No scenario provided.");
        return [];
    }

    const lines = [];

    lines.push(scenario.name || "");

    const lands = scenario.lands || {};
    const sortedLandKeys = Object.keys(lands).sort();
    for (const key of sortedLandKeys) {
        const value = lands[key];
        lines.push(value.name || "");
        lines.push(value.capital_name || "");

        if (value.reforms) {
            for (const reform of value.reforms) {
                lines.push(reform.name || "");
            }
        }
    }

    const events = scenario.custom_events || {};
    const sortedEventKeys = Object.keys(events).sort();
    for (const key of sortedEventKeys) {
        const event = events[key];
        lines.push(event.title || "");
        lines.push(event.description || "");

        lines.push(event.answer1 || "");
        lines.push(event.description1 || "");

        if (!event.answer2_is_disabled) {
            lines.push(event.answer2 || "");
            lines.push(event.description2 || "");
        }

        if (!event.answer3_is_disabled) {
            lines.push(event.answer3 || "");
            lines.push(event.description3 || "");
        }
    }

    return lines;
}

function applyTranslationObject(originalScenario, translatedLines) {
    if (!originalScenario || !translatedLines || !Array.isArray(translatedLines)) {
        console.error("Invalid input.");
        return null;
    }

    const scenario = structuredClone(originalScenario); // глубокая копия
    let l = 0;

    scenario.name = translatedLines[l++] || "";

    const lands = scenario.lands || {};
    const sortedLandKeys = Object.keys(lands).sort();
    for (const key of sortedLandKeys) {
        const value = lands[key];
        value.name = translatedLines[l++] || "";
        value.capital_name = translatedLines[l++] || "";

        if (value.reforms) {
            for (const reform of value.reforms) {
                reform.name = translatedLines[l++] || "";
            }
        }
    }

    const events = scenario.custom_events || {};
    const sortedEventKeys = Object.keys(events).sort();
    for (const key of sortedEventKeys) {
        const event = events[key];
        event.title = translatedLines[l++] || "";
        event.description = translatedLines[l++] || "";

        event.answer1 = translatedLines[l++] || "";
        event.description1 = translatedLines[l++] || "";

        if (!event.answer2_is_disabled) {
            event.answer2 = translatedLines[l++] || "";
            event.description2 = translatedLines[l++] || "";
        }

        if (!event.answer3_is_disabled) {
            event.answer3 = translatedLines[l++] || "";
            event.description3 = translatedLines[l++] || "";
        }
    }

    return scenario;
}

function translate2() {
    return(generateTranslationObject(JSON.stringify(window.countryManager.jsonData)));
    /*translatedLns = applyTranslationObject(translateText2(JSON.stringify(window.countryManager.jsonData)), translateLns);
    
    
    if (window.countryManager) {
        window.countryManager.jsonData = translatedLns;
        window.countryManager.updateCountriesList();
    }
    if (window.eventManager) {
        window.eventManager.setJsonData(translatedLns);
    }
    fillFormFromJson(translatedLns);
    if (previewContent) {
        previewContent.value = JSON.stringify(translatedLns);
    }*/
}