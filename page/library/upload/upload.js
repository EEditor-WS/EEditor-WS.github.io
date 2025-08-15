// === Конфигурация соответствия ключей объекта и ID элементов формы ===
const fieldMap = {
    id: 'scenario-map',           // input с id="input-id"
    title: 'scenario-title',     // input с id="input-title"
    author: 'scenario-author',   // input с id="input-author"
    year: 'scenario-year',       // input с id="input-year"
    languages: 'scenario-languages', // контейнер чекбоксов
    gameMode: 'scenario-type',
    publishDate: 'scenario-upload-date',
    lastUpdate: 'scenario-update-date',
    hiddenScore: 'scenario-hidden-score',
    type: 'scenario-type',
    period: 'scenario-period',
    rights: 'scenario-rights',
    economy: 'scenario-economy',
    population: 'scenario-population',
    resources: 'scenario-resources',
    diplomacy: 'scenario-diplomacy',
    revolts: 'scenario-revolts',
    reforms: 'scenario-reforms',
    events: 'scenario-events',
};

let scenarioData = null; // сюда будем записывать JSON
let scenarioImage = null; // сюда будем записывать изображение (File или DataURL)

// === Сбор данных в объект ===
function collectData() {
    let data = {
        id: document.getElementById(fieldMap.id).value.split(',').map(v => v.trim()).filter(Boolean),
        title: document.getElementById(fieldMap.title).value,
        author: document.getElementById(fieldMap.author).value.split(',').map(v => v.trim()).filter(Boolean),
        year: document.getElementById(fieldMap.year).value,
        languages: Array.from(
            document.querySelectorAll(`#${fieldMap.languages} input[name="languages"]:checked`)
        ).map(cb => cb.value),
        gameMode: document.getElementById(fieldMap.gameMode).value,

        // скрытые
        publishDate: document.getElementById(fieldMap.publishDate).value,
        lastUpdate: document.getElementById(fieldMap.lastUpdate).value,
        hiddenScore: Number(document.getElementById(fieldMap.hiddenScore).value || 0),
        type: document.getElementById(fieldMap.type).value,
        period: document.getElementById(fieldMap.period).value,
        rights: document.getElementById(fieldMap.rights).checked,
        
        economy: document.getElementById(fieldMap.economy).value,
        population: document.getElementById(fieldMap.population).value,
        resources: document.getElementById(fieldMap.resources).value,
        diplomacy: document.getElementById(fieldMap.diplomacy).value,
        revolts: document.getElementById(fieldMap.revolts).value,
        reforms: document.getElementById(fieldMap.reforms).value,

        events: Number(document.getElementById(fieldMap.events).value || 0)
    };
    return data;
}

// === Заполнение формы из объекта ===
function fillForm(data) {
    const byId = id => document.getElementById(id);

    if (byId(fieldMap.id))      byId(fieldMap.id).value      = (data.id || []).join(', ');
    if (byId(fieldMap.title))   byId(fieldMap.title).value   = data.title ?? '';
    if (byId(fieldMap.author))  byId(fieldMap.author).value  = (data.author || []).join(', ');
    if (byId(fieldMap.year))    byId(fieldMap.year).value    = data.year ?? '';

    // Языки: нормализуем к нижнему регистру и выставляем checked
    const langsSet = new Set((data.languages || []).map(v => String(v).toLowerCase()));
    document
        .querySelectorAll(`#${fieldMap.languages} input[name="languages"]`)
        .forEach(cb => {
            cb.checked = langsSet.has(String(cb.value).toLowerCase());
        });

    if (byId(fieldMap.gameMode))   byId(fieldMap.gameMode).value   = data.gameMode ?? '';
    if (byId(fieldMap.publishDate))byId(fieldMap.publishDate).value= data.publishDate ?? '';
    if (byId(fieldMap.lastUpdate)) byId(fieldMap.lastUpdate).value = data.lastUpdate ?? '';
    if (byId(fieldMap.hiddenScore))byId(fieldMap.hiddenScore).value= data.hiddenScore ?? 0;
    if (byId(fieldMap.type))       byId(fieldMap.type).value       = data.type ?? '';
    if (byId(fieldMap.period))     byId(fieldMap.period).value     = data.period ?? '';

    // rights — у тебя select; приведём к строке "true"/"false"
    if (byId(fieldMap.rights)) byId(fieldMap.rights).value = String(Boolean(data.rights));
}


function lockFieldsIfNotEnot() {
    const currentUser = window.authManager?.currentUser?.username;

    // Если пользователя нет или он не enot_enot и его ник не в списке авторов
    const authorValue = document.getElementById(fieldMap.author)?.value || "";
    const authorList = authorValue.split(',').map(a => a.trim());

    if (!currentUser || (currentUser !== 'enot_enot' && !authorList.includes(currentUser))) {
        for (const key in fieldMap) {
            const el = document.getElementById(fieldMap[key]);
            if (el) {
                el.disabled = true;
                // Для чекбоксов/радио дополнительно
                if (el.type === 'checkbox' || el.type === 'radio') {
                    el.disabled = true;
                }
            }
        }
    }
}




document.addEventListener('DOMContentLoaded', () => {
    // === Пример использования ===
    // Собрать данные
    document.getElementById('btn-collect').addEventListener('click', () => {
        //const obj = collectData();
        console.log('Собранные данные:', JSON.stringify(collectData()).toString());
        alert('enot')
    });

    // Заполнить тестовыми данными
    //document.getElementById('btn-fill').addEventListener('click', () => {
        const testData = {"id":["eeditor","test","v1","two"],"title":"TEST TWO","author":["eenot","eeditor"],"year":"2025","languages":["uk"],"gameMode":"sandbox","publishDate":"2025-06-12","lastUpdate":"2025-06-24","hiddenScore":0,"type":"sandbox","period":"modern","economy":"none","population":"none","resources":"none","diplomacy":"none","revolts":"none","reforms":"none","events":0};
        fillForm(testData);
    //});

    lockFieldsIfNotEnot();
});

async function uploadScenarioToGithub() {
    const fileInput = document.getElementById('file-input');
    if (!fileInput.files.length) {
        alert('Выберите файл для загрузки');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = async function() {
        let fileContent = reader.result;
        const [user, map, mapVersion, scenario] = collectData().id;
        let filePath = `lib/${user}/${map}/${user}_${map}_${mapVersion}_${scenario}.json`;

        try {
            //const githubToken = await getGithubToken();
            const githubToken = getGithubToken();
            //const githubToken = GITHUB_TOKEN_PARTS.join();
            if (!githubToken) throw new Error('Не удалось получить токен GitHub');

            const repoOwner = 'EEditor-WS';
            const repoName = 'eeditor-ws-data';
            const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

            // 1. Получаем SHA текущей версии файла
            let sha = null;
            const getResp = await fetch(apiUrl, {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github+json'
                }
            });

            if (getResp.ok) {
                const fileData = await getResp.json();
                sha = fileData.sha; // SHA нужен для перезаписи
            } else if (getResp.status !== 404) {
                // Если ошибка не "файл не найден", выкидываем исключение
                const errData = await getResp.json();
                throw new Error(`Ошибка при получении файла: ${errData.message}`);
            }

            // 2. Кодируем контент в Base64
            const encodedContent = btoa(unescape(encodeURIComponent(fileContent)));

            // 3. Отправляем новый контент на GitHub (с SHA, если файл существует)
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github+json'
                },
                body: JSON.stringify({
                    message: `Upload scenario ${filePath}`,
                    content: encodedContent,
                    sha: sha || undefined // добавляем только если файл существует
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(`Ошибка GitHub: ${errData.message}`);
            }

            alert('Файл успешно загружен на GitHub!');
        } catch (err) {
            console.error(err);
            alert(`Ошибка: ${err.message}`);
        }

        // ------------------- SCENARIO-DATA ------------------- //
        async function uploadDataToGitHub() {
            try {
                // 1. Получаем существующие данные
                const dataUrl = 'https://raw.githubusercontent.com/EEditor-WS/eeditor-ws-data/refs/heads/main/test.json';
                const response = await fetch(dataUrl);
                let existingData = [];
                
                if (response.ok) {
                    try {
                        const data = await response.json();
                        existingData = Array.isArray(data) ? data : [];
                    } catch (error) {
                        console.error('Ошибка парсинга JSON:', error);
                        existingData = [];
                    }
                }
                
                // 2. Добавляем новые данные
                existingData.push(collectData());
                alert(existingData);
                
                // 3. Формируем финальный контент
                const fileContent = JSON.stringify(existingData, null, 4);
                const filePath = 'test.json';
                
                // 4. Загружаем на GitHub
                const githubToken = getGithubToken();
                if (!githubToken) throw new Error('Не удалось получить токен GitHub');

                const repoOwner = 'EEditor-WS';
                const repoName = 'eeditor-ws-data';
                const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

                // Получаем SHA текущей версии файла
                let sha = null;
                const getResp = await fetch(apiUrl, {
                    headers: {
                        'Authorization': `token ${githubToken}`,
                        'Accept': 'application/vnd.github+json'
                    }
                });

                if (getResp.ok) {
                    const fileData = await getResp.json();
                    sha = fileData.sha;
                } else if (getResp.status !== 404) {
                    const errData = await getResp.json();
                    throw new Error(`Ошибка при получении файла: ${errData.message}`);
                }

                // Кодируем контент в Base64
                const encodedContent = btoa(unescape(encodeURIComponent(fileContent)));

                // Отправляем новый контент на GitHub
                const uploadResp = await fetch(apiUrl, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${githubToken}`,
                        'Accept': 'application/vnd.github+json'
                    },
                    body: JSON.stringify({
                        message: `Update ${filePath}`,
                        content: encodedContent,
                        sha: sha || undefined
                    })
                });

                if (!uploadResp.ok) {
                    const errData = await uploadResp.json();
                    throw new Error(`Ошибка GitHub: ${errData.message}`);
                }

                alert('Файл успешно загружен на GitHub!');
                return await uploadResp.json();
            } catch (err) {
                console.error(err);
                alert(`Ошибка: ${err.message}`);
                throw err;
            }
        }

        // Использование функции
        uploadDataToGitHub().then(() => {
            console.log('Завершено');
        }).catch(() => {
            console.log('Произошла ошибка');
        });
    };

    reader.onerror = function() {
        alert('Ошибка чтения файла');
    };
}
