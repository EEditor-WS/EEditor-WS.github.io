// Утилиты для работы с цветом
const ColorUtils = {
    // Преобразует массив RGB в строку
    colorToRgb(colorArray) {
        if (!Array.isArray(colorArray) || colorArray.length < 3) {
            return 'rgb(128, 128, 128)';
        }
        const r = Math.round(parseFloat(colorArray[0]) || 0);
        const g = Math.round(parseFloat(colorArray[1]) || 0);
        const b = Math.round(parseFloat(colorArray[2]) || 0);
        return `rgb(${r}, ${g}, ${b})`;
    },

    // Генерирует случайный цвет
    randomColor() {
        return [
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            255
        ];
    },

    // Проверяет корректность цвета
    isValidColor(color) {
        return Array.isArray(color) && 
               color.length >= 3 && 
               color.every(c => typeof c === 'number' && c >= 0 && c <= 255);
    },

    // Преобразует hex в RGB массив
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
            255
        ] : null;
    },

    // Преобразует RGB массив в hex
    rgbToHex(colorArray) {
        if (!this.isValidColor(colorArray)) return '#808080';
        const [r, g, b] = colorArray;
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
};

// Утилиты для валидации
const ValidationUtils = {
    // Проверяет обязательные поля формы
    validateRequiredFields(fields) {
        const missing = [];
        fields.forEach(field => {
            const element = document.getElementById(field.id);
            if (!element || !element.value.trim()) {
                missing.push(field.label || field.id);
            }
        });
        return missing;
    },

    // Проверяет числовое значение
    validateNumber(value, min, max) {
        const num = parseFloat(value);
        if (isNaN(num)) return false;
        if (min !== undefined && num < min) return false;
        if (max !== undefined && num > max) return false;
        return true;
    }
};

// Утилиты для работы с DOM
const DOMUtils = {
    // Создает элемент с атрибутами
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else {
                element.setAttribute(key, value);
            }
        });
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
        return element;
    },

    // Очищает содержимое элемента
    clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },

    // Показывает/скрывает элемент
    toggleElement(element, show) {
        if (element) {
            element.style.display = show ? '' : 'none';
        }
    }
};

// Экспортируем утилиты
window.ColorUtils = ColorUtils;
window.ValidationUtils = ValidationUtils;
window.DOMUtils = DOMUtils; 