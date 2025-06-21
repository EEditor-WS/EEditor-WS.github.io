// Функция для копирования параметров провинций в буфер обмена
function copyProvinceParams() {
    // Получаем провинции из текущего сценария
    const provinces = window.countryManager.jsonData?.provinces;
    if (!provinces || !Array.isArray(provinces)) {
        window.showError(window.translator.translate('error'), window.translator.translate('no_provinces'));
        return;
    }

    // Создаем массив данных провинций
    const provinceData = provinces.map(province => {
        // Собираем только нужные параметры, если они есть
        const data = {
            id: province.id // ID провинции обязателен для идентификации
        };

        // Добавляем параметры только если они существуют
        if (province.infrastructure_level !== undefined) {
            data.infrastructure_level = province.infrastructure_level;
        }
        if (province.population_limit !== undefined) {
            data.population_limit = province.population_limit;
        }
        if (province.resource_rule !== undefined) {
            data.resource_rule = province.resource_rule;
        }

        return data;
    }).filter(data => 
        // Оставляем только те провинции, где есть хотя бы один из нужных параметров
        data.infrastructure_level !== undefined || 
        data.population_limit !== undefined || 
        data.resource_rule !== undefined
    );

    if (provinceData.length === 0) {
        window.showWarning(window.translator.translate('warning'), window.translator.translate('no_data_to_copy'));
        return;
    }

    // Создаем объект с метаданными для проверки совместимости при вставке
    const copyData = {
        type: 'province_params',
        version: '1.0',
        timestamp: Date.now(),
        data: provinceData
    };

    // Копируем в буфер обмена
    try {
        navigator.clipboard.writeText(JSON.stringify(copyData))
            .then(() => {
                window.showSuccess(
                    window.translator.translate('success'), 
                    window.translator.translate('params_copied').replace('{count}', provinceData.length)
                );
            })
            .catch(err => {
                console.error('Ошибка копирования в буфер:', err);
                window.showError(window.translator.translate('error'), window.translator.translate('copy_failed'));
            });
    } catch (err) {
        console.error('Ошибка копирования в буфер:', err);
        window.showError(window.translator.translate('error'), window.translator.translate('copy_failed'));
    }
}

// Функция для вставки параметров провинций из буфера обмена
async function pasteProvinceParams() {
    try {
        // Считываем данные из буфера обмена
        const clipboardText = await navigator.clipboard.readText();
        let clipboardData;

        try {
            clipboardData = JSON.parse(clipboardText);
        } catch (err) {
            window.showError(window.translator.translate('error'), window.translator.translate('invalid_clipboard_data'));
            return;
        }

        // Проверяем валидность данных
        if (!clipboardData || 
            clipboardData.type !== 'province_params' || 
            !Array.isArray(clipboardData.data)) {
            window.showError(window.translator.translate('error'), window.translator.translate('invalid_data_format'));
            return;
        }

        // Получаем текущие провинции
        const currentProvinces = window.countryManager.jsonData?.provinces;
        if (!currentProvinces || !Array.isArray(currentProvinces)) {
            window.showError(window.translator.translate('error'), window.translator.translate('no_provinces_current'));
            return;
        }

        let updatedCount = 0;
        
        // Обновляем параметры провинций
        clipboardData.data.forEach(sourceProvince => {
            // Находим соответствующую провинцию в текущем сценарии
            const targetProvince = currentProvinces.find(p => p.id === sourceProvince.id);
            if (targetProvince) {
                let wasUpdated = false;

                // Обновляем каждый параметр, если он есть в исходных данных
                if (sourceProvince.infrastructure_level !== undefined) {
                    targetProvince.infrastructure_level = sourceProvince.infrastructure_level;
                    wasUpdated = true;
                }
                if (sourceProvince.population_limit !== undefined) {
                    targetProvince.population_limit = sourceProvince.population_limit;
                    wasUpdated = true;
                }
                if (sourceProvince.resource_rule !== undefined) {
                    targetProvince.resource_rule = sourceProvince.resource_rule;
                    wasUpdated = true;
                }

                if (wasUpdated) {
                    updatedCount++;
                }
            }
        });

        // Обновляем отображение и показываем результат
        if (updatedCount > 0) {
            // Обновляем JSON в редакторе предпросмотра
            const previewContent = document.getElementById('preview-content');
            if (previewContent) {
                previewContent.value = JSON.stringify(window.countryManager.jsonData, null, 4);
            }

            window.showSuccess(
                window.translator.translate('success'),
                window.translator.translate('params_pasted')
                    .replace('{count}', updatedCount)
            );
        } else {
            window.showWarning(
                window.translator.translate('warning'),
                window.translator.translate('no_provinces_updated')
            );
        }

    } catch (err) {
        console.error('Ошибка вставки из буфера:', err);
        window.showError(window.translator.translate('error'), window.translator.translate('paste_failed'));
    }
}
