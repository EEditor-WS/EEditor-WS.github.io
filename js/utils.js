function scenarioData() {
    return JSON.parse(document.getElementById('preview-content').value);
}

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

function convertObjectToReadableString(obj) {
    if (!Array.isArray(obj)) {
        return "<span style='color:red'>Некорректный формат объекта.</span>";
    }

    const translations = {
        equal: " = ",
        not_equal: " ≠ ",
        more: " > ",
        less: " < ",
    };

    const results = obj.map((item) => {
        let type = window.translator?.translate(item.type) || item.type;
        let action = translations[item.action] || item.action;
        let value = item.value;
        let subtype = item.subtype || "";

        // ---------------------------
        try {
            if (typeof action === "string" && action.includes("civilization")) {
                action = window.eventManager.jsonData.lands[action]?.name || action;
            }
            if (typeof value === "string" && value.includes("civilization")) {
                value = window.eventManager.jsonData.lands[value]?.name || value;
            }
            if (typeof subtype === "string" && subtype.includes("civilization")) {
                subtype = window.eventManager.jsonData.lands[subtype]?.name || subtype;
            }
        } catch (e) {
            console.error("Ошибка при обработке действия:", e);
        }
        // ---------------------------

        if (typeof value === "boolean") {
            value = value ? "yes" : "no";
        }

        // создаём HTML с подсветкой
        let htmlType = `<span class="list-req-type">${type}</span>`;
        let htmlSubtype = subtype ? ` <span class="list-req-subtype">(${subtype})</span>` : "";
        if (/^E\d+$/.test(subtype)) {
            htmlSubtype = subtype ? ` <span class="list-req-subtype" onclick="document.getElementById('event-row-${subtype}').scrollIntoView({ behavior: 'smooth' })">(${subtype})</span>` : "";
        }
        let htmlAction = `<span class="list-req-action">${action}</span>`;
        if (/^E\d+$/.test(action)) {
            htmlSubtype = action ? ` <span class="list-req-subtype" onclick="document.getElementById('event-row-${action}').scrollIntoView({ behavior: 'smooth' })">(${action})</span>` : "";
        }
        let htmlValue = `<span class="list-req-value">${value}</span>`;
        if (/^E\d+$/.test(value)) {
            htmlSubtype = value ? ` <span class="list-req-subtype" onclick="document.getElementById('event-row-${value}').scrollIntoView({ behavior: 'smooth' })">(${value})</span>` : "";
        }

        return `${htmlType}${htmlSubtype} ${htmlAction} ${htmlValue}`;
    });

    // каждая строка отдельным блоком
    const html = results.map(r => `<div class="list-requirement-item">${r}</div>`).join("\n");

    return `<div class="list-requirements-list">${html}</div>`;
}

function convertObjectToReadableDOM(obj) {
    if (!Array.isArray(obj)) {
        const error = document.createElement("span");
        error.style.color = "red";
        error.textContent = "Некорректный формат объекта.";
        return error;
    }

    const translations = {
        equal: " = ",
        not_equal: " ≠ ",
        more: " > ",
        less: " < ",
    };

    const root = document.createElement("div");
    root.className = "list-requirements-list";

    obj.forEach(item => {
        const row = document.createElement("div");
        row.className = "list-requirement-item";

        let type = window.translator?.translate(item.type) || item.type;
        let action = translations[item.action] || item.action;
        let value = item.value;
        let subtype = item.subtype || "";

        if (typeof value === "boolean") {
            value = value ? "yes" : "no";
        }

        /* ===== TYPE ===== */
        const typeEl = document.createElement("span");
        typeEl.className = "list-req-type";
        typeEl.textContent = type;
        row.appendChild(typeEl);

        /* ===== SUBTYPE ===== */
        if (subtype) {
            const subtypeEl = document.createElement("span");
            subtypeEl.className = "list-req-subtype";
            subtypeEl.textContent = `(${subtype})`;

            if (typeof subtype === "string" && subtype.includes("civilization")) {
                const id = item.subtype;
                subtypeEl.textContent =
                    window.eventManager.jsonData.lands[id]?.name || subtype;
                subtypeEl.addEventListener("click", () => window.countryManager.openCountry(id));
            }

            if (/^E\d+$/.test(subtype)) {
                subtypeEl.addEventListener("click", () => {
                    document
                        .getElementById(`event-row-${subtype}`)
                        ?.scrollIntoView({ behavior: "smooth" });
                });
            }

            row.append(" ");
            row.appendChild(subtypeEl);
        }

        row.append(" ");

        /* ===== ACTION ===== */
        const actionEl = document.createElement("span");
        actionEl.className = "list-req-action";
        actionEl.textContent = action;

        if (typeof item.action === "string" && item.action.includes("civilization")) {
            const id = item.action;
            actionEl.textContent =
                window.eventManager?.jsonData?.lands?.[id]?.name || action;
            actionEl.addEventListener("click", () => window.countryManager.openCountry(id));
        }

        if (/^E\d+$/.test(item.action)) {
            actionEl.addEventListener("click", () => {
                document
                    .getElementById(`event-row-${item.action}`)
                    ?.scrollIntoView({ behavior: "smooth" });
            });
        }

        row.appendChild(actionEl);
        row.append(" ");

        /* ===== VALUE ===== */
        const valueEl = document.createElement("span");
        valueEl.className = "list-req-value";
        valueEl.textContent = value;

        if (typeof item.value === "string" && item.value.includes("civilization")) {
            const id = item.value;
            valueEl.textContent =
                window.eventManager?.jsonData?.lands?.[id]?.name || value;
            valueEl.addEventListener("click", () => window.countryManager.openCountry(id));
        }

        if (/^E\d+$/.test(item.value)) {
            valueEl.addEventListener("click", () => {
                document
                    .getElementById(`event-row-${item.value}`)
                    ?.scrollIntoView({ behavior: "smooth" });
            });
        }

        row.appendChild(valueEl);

        root.appendChild(row);
    });

    return root;
}


function transformCustomEvents() {
  let data = JSON.parse(previewContent.value);
  let oldEvents = data.custom_events;
  let newEvents = {};

  for (let key in oldEvents) {
    let event = oldEvents[key];
    if (event.id) {
      newEvents[event.id] = event;
    } else {
      console.log("Пропущено событие без id:", key, event);
    }
  }

  data.custom_events = newEvents;

  previewContent.value = JSON.stringify(data, null, 2);
  window.eventManager.syncronizeWithPreview();
  showSuccess("ID Роздан чётенько!");

  return data;
}

function saveToPreview(data) {
    document.getElementById('preview-content').value = JSON.stringify(data, null, 4);
}

// Экспортируем утилиты
window.ColorUtils = ColorUtils;
window.ValidationUtils = ValidationUtils;
window.DOMUtils = DOMUtils; 

document.addEventListener('DOMContentLoaded', function() {
    if (new URLSearchParams(window.location.search).get('dev') === 'true') {
        document.body.classList.add('dev_mode');
        window.showInfo('Режим разработчика включён');
    }
});