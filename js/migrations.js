function migrateGroupToGroupName() {
    try {
        // Получаем JSON данные из текстового поля
        const previewContent = document.getElementById('preview-content');
        if (!previewContent?.value) {
            console.error('No preview content found');
            showError('Ошибка', 'Нет данных для миграции');
            return;
        }

        // Парсим JSON
        const data = JSON.parse(previewContent.value);
        if (!data?.lands) {
            console.error('No lands data found in JSON');
            showError('Ошибка', 'Не найдены данные о странах');
            return;
        }

        let modified = false;

        // Мигрируем данные
        for (const countryId in data.lands) {
            const country = data.lands[countryId];
            if (country.group !== undefined) {
                console.log(`Migrating country ${countryId}: group = ${country.group}`);
                country.group_name = country.group;
                delete country.group;
                modified = true;
            }
        }

        if (modified) {
            // Обновляем JSON в текстовом поле
            previewContent.value = JSON.stringify(data, null, 4);
            
            // Обновляем интерфейс
            if (typeof window.saveChanges === 'function') {
                window.saveChanges();
            }

            showSuccess(
                window.translator.translate('ready'),
                'Параметр group успешно перенесен в group_name'
            );
        } else {
            showInfo(
                window.translator.translate('ready'),
                'Миграция не требуется'
            );
        }
    } catch (error) {
        console.error('Error during migration:', error);
        showError(
            window.translator.translate('error'),
            'Не удалось выполнить миграцию параметров'
        );
    }
}
