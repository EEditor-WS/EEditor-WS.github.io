document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone-pp');
    const fileInput = document.getElementById('file-input-pp');

    // 1. Предотвращаем стандартное поведение браузера (чтобы он не открыл файл в новой вкладке)
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    // 2. Подсветка зоны при наведении
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover'); // Добавьте этот класс в CSS для красоты
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        }, false);
    });

    // 3. Обработка броска (Drop)
    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    });

    // 4. Обработка выбора через кнопку
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    });

    // 5. Функция чтения и парсинга
    async function processFile(file) {
        // Проверка на расширение, если нужно
        if (!file.name.endsWith('.json')) {
            window.notification.error('Пожалуйста, выберите JSON файл');
            return;
        }

        try {
            const text = await file.text(); // Читаем как текст
            const json = JSON.parse(text); // Превращаем в объект
            
            console.log('Данные получены:', json);
            window.notification.success(`Файл "${file.name}" успешно прочитан!`);

            // логика при открытом
            document.getElementById('openedForCopyFile').textContent = file.name
            window.scenarioUtils.scenarioForTransferParams = json

        } catch (err) {
            console.error('Ошибка чтения файла:', err);
            window.notification.error('Не удалось прочитать JSON файл. Проверьте его формат.');
        }
    }

    document.getElementById('apply-paste-params').addEventListener('click', () => {
        let where = []
        document.querySelector('.pasteparamcheck.pop input').checked ? where.push('population') : ''
        document.querySelector('.pasteparamcheck.inf input').checked ? where.push('infrastructure') : ''
        document.querySelector('.pasteparamcheck.res input').checked ? where.push('resource') : ''
        document.querySelector('.pasteparamcheck.rel input').checked ? where.push('relief') : ''
        document.querySelector('.pasteparamcheck.h2o input').checked ? where.push('water') : ''
        window.scenarioUtils.transferParams(window.scenarioUtils.scenarioForTransferParams, where, document.getElementById('pp-progressbar'))
    })
})