document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('upload-form');
    const screenshotInput = document.getElementById('scenario-screenshot');
    const screenshotPreview = document.getElementById('screenshot-preview');

    // Автоматически устанавливаем текущую дату
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('upload-date').value = today;
    document.getElementById('update-date').value = today;

    // Предпросмотр скриншота
    screenshotInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                screenshotPreview.innerHTML = '';
                screenshotPreview.appendChild(img);
            }
            reader.readAsDataURL(file);
        }
    });

    // Обработка отправки формы
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Собираем данные формы
        const formData = new FormData();
        
        // Добавляем все поля формы
        formData.append('name', document.getElementById('scenario-name').value);
        formData.append('author', document.getElementById('scenario-author').value);
        formData.append('description', document.getElementById('scenario-description').value);
        formData.append('uploadDate', document.getElementById('upload-date').value);
        formData.append('updateDate', document.getElementById('update-date').value);
        
        // Получаем выбранные категории
        const categories = Array.from(document.getElementById('scenario-categories').selectedOptions)
            .map(option => option.value);
        formData.append('categories', JSON.stringify(categories));
        
        formData.append('language', document.getElementById('scenario-language').value);
        formData.append('screenshot', screenshotInput.files[0]);
        formData.append('mapName', document.getElementById('map-name').value);
        formData.append('provinceCount', document.getElementById('province-count').value);
        
        // Собираем данные о фичах
        const features = {
            economy: document.getElementById('feature-economy').value,
            population: document.getElementById('feature-population').value,
            resources: document.getElementById('feature-resources').value,
            diplomacy: document.getElementById('feature-diplomacy').value,
            uprisings: document.getElementById('feature-uprisings').value,
            reforms: document.getElementById('feature-reforms').value,
            events: document.getElementById('feature-events').value
        };
        formData.append('features', JSON.stringify(features));

        // TODO: Отправка данных на сервер
        console.log('Form submitted', Object.fromEntries(formData));
        
        // Показываем уведомление об успешной загрузке
        alert('Scenario uploaded successfully!');
    });
});
