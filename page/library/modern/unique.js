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

/**
 * Возвращает массив с 3 значениями для одной страны:
 * [reformsCount, eventUnique, eventMentions]
 */
function getLandUniquenessById(jsonData, landId, isData = false) {
    if (!jsonData?.lands?.[landId]) {
        return [0, [], []];
    }

    const land = jsonData.lands[landId];

    const reformsCount = Array.isArray(land.reforms) ? land.reforms.length : 0;
    const eventUnique = [];
    const eventMentions = [];

    if (!jsonData.custom_events) {
        return [reformsCount, [], []];
    }

    for (const eventId in jsonData.custom_events) {
        const event = jsonData.custom_events[eventId];

        if (Array.isArray(event.requirements)) {
            for (const req of event.requirements) {
                if (!req || typeof req !== 'object') continue;

                // land_id
                if (req.type === 'land_id' && req.value === landId) {
                    eventUnique.push(isData ? event : event.id);
                } else

                // land_name
                if (req.type === 'land_name' && req.value === land.name) {
                    eventUnique.push(isData ? event : event.id);
                } else 

                // group_name
                if (req.type === 'group_name' && typeof land.group_name === 'string') {
                    const groups = land.group_name.split(',').map(g => g.trim());
                    if (groups.includes(req.value)) {
                        eventMentions.push(isData ? event : event.id);
                    }
                } else {
                    if (req.value === landId || req.subtype === landId || req.action === landId) {
                        eventMentions.push(isData ? event : event.id);
                    }
                }
            }
        }

        const bonuses = [
            ...(event.bonuses1 || []),
            ...(event.bonuses2 || []),
            ...(event.bonuses3 || [])
        ];

        for (const bon of bonuses) {
            if (!bon || typeof bon !== 'object') continue;

            // упоминание страны / земли через бонус
            if (bon.value === landId || bon.subtype === landId) {
                eventMentions.push(isData ? event : event.id);
            }
        }
    }

    return [
        reformsCount,
        [...new Set(eventUnique)],
        [...new Set(eventMentions)]
    ];
}

// Экспорт для использования в других скриптах
if (typeof window !== 'undefined') {
    window.analyzeUniqueness = analyzeUniqueness;
    window.getLandUniquenessById = getLandUniquenessById;
}

// module.exports = analyzeUniqueness; // Для Node.js, если потребуется
