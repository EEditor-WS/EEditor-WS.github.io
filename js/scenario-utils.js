class ScenarioUtils {
    constructor() {
        this.scenarioForTransferParams = {}
    }

    transferParams(jsonData, which, progressbar) {
        if (progressbar) {
            progressbar.max = jsonData.provinces.length
            progressbar.value = 0
        }

        console.log('Копируется из:', jsonData)
        console.log('С параметрами:', JSON.stringify(which))
        jsonData.provinces.forEach((province, index) => {
            if (window.countryManager.jsonData.provinces[index]) {
                console.log('copied')
                if (progressbar) progressbar.value++
                // Копируем поле resource_rule
                if (which.includes('resource')) {
                    // Проверяем, есть ли поле в исходном (закинутом) файле
                    if (Object.hasOwn(province, 'resource_rule')) {
                        // Если есть — копируем (используем структурированное клонирование, чтобы не было ссылок)
                        window.countryManager.jsonData.resource_rule = JSON.parse(JSON.stringify(province.resource_rule));
                    } else {
                        // Если в исходнике нет — удаляем у себя
                        delete window.countryManager.jsonData.resource_rule;
                    }
                }
                which.includes('population') ? window.countryManager.jsonData.provinces[index].population_limit = province.population_limit : '';
                which.includes('population') ? window.countryManager.jsonData.provinces[index].population = province.population : '';
                which.includes('infrastructure') ? window.countryManager.jsonData.provinces[index].infrastructure_level = province.infrastructure_level : '';
                which.includes('relief') ? window.countryManager.jsonData.provinces[index].relief = province.relief : '';
                if (which.includes('water') && province.water == true) {
                    window.countryManager.jsonData.provinces[index].water = true
                    province.river == true ? window.countryManager.jsonData.provinces[index].river = true : ''
                }
            }
        });

        // Обновляем содержимое в редакторе и сохраняем в файл
        if (window.previewContent) {
            const jsonString = JSON.stringify(window.countryManager.jsonData, null);
            window.previewContent.value = jsonString;
                
            // Сохраняем изменения в файл
            if (typeof window.saveChanges === 'function') {
                window.saveChanges();
            }
        } else {
            window.notification.error('preview не найден')
        }

        window.notification.success('Copied')
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.scenarioUtils = new ScenarioUtils
})