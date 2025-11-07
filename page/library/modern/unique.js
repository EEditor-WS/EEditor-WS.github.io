// unique.js
// Функция для анализа уникальности контента в jsonData

function analyzeUniqueness(jsonData) {
    const result = {
        reformsCount: {}, // {landId: reforms.length}
        eventUnique: {}, // {landId: count}
        eventMentions: {}, // {landId: count}
    };

    // Подсчёт реформ по странам
    if (jsonData.lands) {
        for (const landId in jsonData.lands) {
            const land = jsonData.lands[landId];
            result.reformsCount[landId] = Array.isArray(land.reforms) ? land.reforms.length : 0;
            result.eventUnique[landId] = 0;
            result.eventMentions[landId] = 0;
        }
    }

    // Подсчёт упоминаний страны в requirements событий
    if (jsonData.custom_events) {
        for (const eventId in jsonData.custom_events) {
            const event = jsonData.custom_events[eventId];
            if (!Array.isArray(event.requirements)) continue;
            for (const req of event.requirements) {
                if (!req || typeof req !== 'object') continue;
                // Проверяем по всем странам
                for (const landId in jsonData.lands) {
                    const land = jsonData.lands[landId];
                    // type = land_id
                    if (req.type === 'land_id' && req.value === landId) {
                        result.eventUnique[landId]++;
                    }
                    // type = land_name
                    if (req.type === 'land_name' && req.value === land.name) {
                        result.eventUnique[landId]++;
                    }
                    // type = group_name
                    if (req.type === 'group_name' && typeof land.group_name === 'string') {
                        // group_name может быть строкой с запятыми
                        const groups = land.group_name.split(',').map(g => g.trim());
                        if (groups.includes(req.value)) {
                            result.eventMentions[landId]++;
                        }
                    }
                }
            }
        }
    }

    return result;
}

// Экспорт для использования в других скриптах
if (typeof window !== 'undefined') {
    window.analyzeUniqueness = analyzeUniqueness;
}

// module.exports = analyzeUniqueness; // Для Node.js, если потребуется
