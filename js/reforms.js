class ReformManager {
    constructor() {
        this.currentCountry = null;
        this.currentReform = null;
        this.reformBuffer = null;
        this.jsonData = null;
        this.sortColumn = null;
        this.sortDirection = 'asc';

        // Инициализация обработчиков событий
        this.initEventListeners();
    }

    initEventListeners() {
        // Кнопки на странице списка реформ
        document.getElementById('add-reform')?.addEventListener('click', () => this.createNewReform());
        document.getElementById('paste-reform')?.addEventListener('click', () => this.pasteReform());
        document.getElementById('back-to-countries')?.addEventListener('click', () => this.backToCountry());

        // Кнопки на странице редактирования
        document.getElementById('back-to-reforms')?.addEventListener('click', () => this.switchToReformsList());
        document.getElementById('copy-reform')?.addEventListener('click', () => this.copyReform());
        document.getElementById('copy-reform-buffer')?.addEventListener('click', () => this.copyReformToBuffer());
        document.getElementById('load-reform-sync')?.addEventListener('click', () => this.loadReformSync());
        document.getElementById('delete-reform')?.addEventListener('click', () => this.deleteReform());

        // Обработчики изменения цвета
        ['reform-color-r', 'reform-color-g', 'reform-color-b'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', () => this.updateReformColorPreview());
        });

        // Обработчик формы
        document.getElementById('reform-form')?.addEventListener('change', () => this.saveReformChanges());

        // Обработчики сортировки
        const headers = document.querySelectorAll('.reforms-table th');
        headers.forEach((header, index) => {
            header.addEventListener('click', () => this.sortReforms(index));
        });

        // Обработчик для кнопки случайного цвета реформы
        document.getElementById('random-reform-color').addEventListener('click', () => this.randomReformColor());
    }

    openReforms(countryId) {
        if (!this.jsonData?.lands?.[countryId]) return;

        this.currentCountry = countryId;
        const country = this.jsonData.lands[countryId];

        // Обновляем заголовок
        const nameSpan = document.getElementById('reforms-country-name');
        if (nameSpan) {
            nameSpan.textContent = `${window.translator.translate('reforms_of')} ${country.name}`;
        }

        // Обновляем список реформ
        this.updateReformsList();

        // Переключаемся на страницу реформ
        this.switchToReformsList();
    }

    updateReformsList() {
        if (!this.currentCountry || !this.jsonData?.lands[this.currentCountry]) return;

        const country = this.jsonData.lands[this.currentCountry];
        const tbody = document.getElementById('reforms-list');
        if (!tbody) return;

        tbody.innerHTML = '';
        country.reforms?.forEach((reform, index) => {
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            tr.addEventListener('click', () => this.editReform(index));

            const colorCell = document.createElement('td');
            const colorDiv = document.createElement('div');
            colorDiv.className = 'reform-color';
            colorDiv.style.backgroundColor = this.colorToRgb(reform.color);
            colorCell.appendChild(colorDiv);

            const nameCell = document.createElement('td');
            nameCell.textContent = reform.name;

            const ideologyCell = document.createElement('td');
            ideologyCell.textContent = reform.requirements?.political || '';

            const provincesCell = document.createElement('td');
            provincesCell.textContent = reform.requirements?.provinces?.length || 0;

            tr.appendChild(colorCell);
            tr.appendChild(nameCell);
            tr.appendChild(ideologyCell);
            tr.appendChild(provincesCell);
            
            tbody.appendChild(tr);
        });
    }

    createNewReform() {
        if (!this.currentCountry || !this.jsonData?.lands[this.currentCountry]) return;

        const newReform = {
            name: window.translator.translate('new_reform'),
            color: [128, 128, 128, 255],
            requirements: {
                political: 'Democracy',
                provinces: []
            }
        };

        const country = this.jsonData.lands[this.currentCountry];
        if (!Array.isArray(country.reforms)) {
            country.reforms = [];
        }

        country.reforms.push(newReform);
        this.editReform(country.reforms.length - 1);
        this.saveChanges();
    }

    editReform(index) {
        if (!this.currentCountry || !this.jsonData?.lands[this.currentCountry]) return;

        const country = this.jsonData.lands[this.currentCountry];
        const reform = country.reforms[index];
        if (!reform) return;

        this.currentReform = index;

        // Заполняем форму
        document.getElementById('reform-name').value = reform.name;
        document.getElementById('reform-ideology').value = reform.requirements?.political || 'Democracy';

        // Устанавливаем цвет
        if (Array.isArray(reform.color) && reform.color.length >= 3) {
            document.getElementById('reform-color-r').value = reform.color[0];
            document.getElementById('reform-color-g').value = reform.color[1];
            document.getElementById('reform-color-b').value = reform.color[2];
            this.updateReformColorPreview();
        }

        // Переключаемся на страницу редактирования
        this.switchToReformEdit();
    }

    copyReform() {
        if (!this.currentCountry || !this.jsonData?.lands[this.currentCountry] || this.currentReform === null) return;

        const country = this.jsonData.lands[this.currentCountry];
        const reform = country.reforms[this.currentReform];
        if (!reform) return;

        const newReform = JSON.parse(JSON.stringify(reform));
        newReform.name += ` ${window.translator.translate('copy_suffix')}`;
        country.reforms.push(newReform);

        this.updateReformsList();
        this.editReform(country.reforms.length - 1);
        this.saveChanges();
    }

    copyReformToBuffer() {
        if (!this.currentCountry || !this.jsonData?.lands[this.currentCountry] || this.currentReform === null) return;

        const country = this.jsonData.lands[this.currentCountry];
        const reform = country.reforms[this.currentReform];
        if (!reform) return;

        this.reformBuffer = JSON.parse(JSON.stringify(reform));
    }

    pasteReform() {
        if (!this.reformBuffer || !this.currentCountry || !this.jsonData?.lands[this.currentCountry]) return;

        const country = this.jsonData.lands[this.currentCountry];
        if (!Array.isArray(country.reforms)) {
            country.reforms = [];
        }

        const newReform = JSON.parse(JSON.stringify(this.reformBuffer));
        country.reforms.push(newReform);

        this.updateReformsList();
        this.editReform(country.reforms.length - 1);
        this.saveChanges();
    }

    loadReformSync() {
        alert(window.translator.translate('function_in_development'));
    }

    deleteReform() {
        if (!this.currentCountry || !this.jsonData?.lands[this.currentCountry] || this.currentReform === null) return;

        const country = this.jsonData.lands[this.currentCountry];
        country.reforms.splice(this.currentReform, 1);

        this.updateReformsList();
        this.switchToReformsList();
        this.saveChanges();
    }

    saveReformChanges() {
        if (!this.currentCountry || !this.jsonData?.lands[this.currentCountry] || this.currentReform === null) return;

        const country = this.jsonData.lands[this.currentCountry];
        const reform = country.reforms[this.currentReform];
        if (!reform) return;

        reform.name = document.getElementById('reform-name').value;
        reform.requirements.political = document.getElementById('reform-ideology').value;

        const r = parseInt(document.getElementById('reform-color-r').value) || 0;
        const g = parseInt(document.getElementById('reform-color-g').value) || 0;
        const b = parseInt(document.getElementById('reform-color-b').value) || 0;
        reform.color = [r, g, b, 255];

        this.saveChanges();
    }

    updateReformColorPreview() {
        const r = document.getElementById('reform-color-r').value;
        const g = document.getElementById('reform-color-g').value;
        const b = document.getElementById('reform-color-b').value;
        const preview = document.getElementById('reform-color-preview');
        if (preview) {
            preview.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        }
        this.saveReformChanges();
    }

    colorToRgb(colorArray) {
        if (!Array.isArray(colorArray) || colorArray.length < 3) {
            return 'rgb(128, 128, 128)';
        }
        return `rgb(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]})`;
    }

    switchToReformsList() {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('reforms')?.classList.add('active');
    }

    switchToReformEdit() {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('reform-edit')?.classList.add('active');
    }

    saveChanges() {
        if (!this.jsonData) return;

        // Обновляем JSON в текстовом поле предпросмотра
        const previewContent = document.getElementById('preview-content');
        if (previewContent) {
            previewContent.value = JSON.stringify(this.jsonData, null, 4);
        }

        // Обновляем информацию о файле
        const fileInfo = document.getElementById('file-info');
        if (fileInfo) {
            fileInfo.textContent = window.translator.translate('changes_not_saved');
        }
    }

    sortReforms(columnIndex) {
        if (!this.currentCountry || !this.jsonData?.lands[this.currentCountry]) return;

        const country = this.jsonData.lands[this.currentCountry];
        if (!Array.isArray(country.reforms)) return;

        // Если кликнули на ту же колонку, меняем направление сортировки
        if (this.sortColumn === columnIndex) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnIndex;
            this.sortDirection = 'asc';
        }

        // Обновляем классы заголовков
        const headers = document.querySelectorAll('.reforms-table th');
        headers.forEach(header => header.classList.remove('sort-asc', 'sort-desc'));
        headers[columnIndex].classList.add(`sort-${this.sortDirection}`);

        // Сортируем реформы
        country.reforms.sort((a, b) => {
            let valueA, valueB;

            switch (columnIndex) {
                case 0: // Цвет
                    valueA = a.color ? a.color[0] + a.color[1] + a.color[2] : 0;
                    valueB = b.color ? b.color[0] + b.color[1] + b.color[2] : 0;
                    break;
                case 1: // Название
                    valueA = a.name || '';
                    valueB = b.name || '';
                    break;
                case 2: // Идеология
                    valueA = a.requirements?.political || '';
                    valueB = b.requirements?.political || '';
                    break;
                case 3: // Количество провинций
                    valueA = a.requirements?.provinces?.length || 0;
                    valueB = b.requirements?.provinces?.length || 0;
                    break;
                default:
                    return 0;
            }

            if (typeof valueA === 'string') {
                return this.sortDirection === 'asc' 
                    ? valueA.localeCompare(valueB)
                    : valueB.localeCompare(valueA);
            } else {
                return this.sortDirection === 'asc'
                    ? valueA - valueB
                    : valueB - valueA;
            }
        });

        this.updateReformsList();
        this.saveChanges();
    }

    randomReformColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        
        document.getElementById('reform-color-r').value = r;
        document.getElementById('reform-color-g').value = g;
        document.getElementById('reform-color-b').value = b;
        
        this.updateReformColorPreview();
    }

    backToCountry() {
        if (!this.currentCountry || !this.jsonData?.lands[this.currentCountry]) return;
        
        // Переключаемся на страницу редактирования страны
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById('country-edit').classList.add('active');
    }
}

// Создаем глобальный экземпляр менеджера реформ после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.reformManager = new ReformManager();
});
