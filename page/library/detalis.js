/*document.addEventListener('DOMContentLoaded', () => {
    const script = document.createElement('script');
    script.src = 'maplist.js';
    script.onload = () => {
        // После загрузки списка карт, отображаем их
        displayMaps();
    };
});*/

let params;
let fileType;
let scenarioId;
let scenarioArray;
let scenarioConent;
let scenarioMap;

/*let liblink;
if (window.location.href.includes('file:///')) {
    libLink = 'http://192.168.100.18:8081/';
} else {
    libLink = 'https://raw.githubusercontent.com/eenot-eenot/eeditor-ws-data/refs/heads/main/';
}*/

document.addEventListener('DOMContentLoaded', () => {
    // Убедитесь, что scenariosData объявлена где-то глобально или доступна в этой области видимости
    if (typeof scenariosData === 'undefined' || !Array.isArray(scenariosData)) {
        console.error('Ошибка: Массив scenariosData не найден или объявлен некорректно.');
        return; // Прерываем выполнение, если данные недоступны
    }
    
    const params = new URLSearchParams(document.location.search);
    const fileType = params.get('type');
    
    // Получаем значение параметра 'scenario' и очищаем его
    const rawScenarioId = params.get('scenario');
    if (!rawScenarioId) {
        console.log("Параметр 'scenario' не найден в URL.");
        return;
    }
    
    const cleanScenarioId = rawScenarioId.replace(/\.json$/i, '');
    
    // Преобразуем чистое имя сценария в массив по разделителю '_'
    const scenarioArray = cleanScenarioId.split('_');

    console.log("Целевой массив из URL:", scenarioArray);

    const foundScenario = scenariosData.find(scenario => {
        // Проверяем, что scenario.id существует и является массивом
        if (!Array.isArray(scenario.id)) {
            return false;
        }
        const targetString = JSON.stringify(scenarioArray);
        const currentString = JSON.stringify(scenario.id);
        
        return targetString === currentString;
    });

    function setOtherParams() {
        // Успешный поиск!
        console.log('Сценарий найден!');
        console.log('Имя сценария (title):', foundScenario.title);
        // Добавьте здесь вашу логику, например, загрузку сценария
        document.getElementById('scenario-name').textContent = foundScenario.title;
        document.getElementById('scenarioTitle').value = foundScenario.title;
        document.getElementById('scenarioAuthor').value = foundScenario.author.join(', ');
        document.getElementById('scenarioMap').value = foundScenario.id.slice(0, 2).join('_');
        document.getElementById('scenarioLang').value = foundScenario.languages[0];
        document.getElementById('scenarioPublish').value = foundScenario.publishDate;
        document.getElementById('scenarioUpdate').value = foundScenario.lastUpdate;
        document.getElementById('scenarioProvinces').value = scenarioConent.num_of_provinces;
        if (scenarioConent.custom_events != [] && scenarioConent.custom_events != undefined && Object.keys(scenarioConent.custom_events).length > 0) {
            document.getElementById('scenarioEvents').value = Object.keys(scenarioConent.custom_events).length;
        };
        if (JSON.stringify(scenarioConent).includes('infrastructure_level')) {
            document.getElementById('scenarioEconomy').value = 'yes';
        };
        if (JSON.stringify(scenarioConent).includes('resource_rule')) {
            document.getElementById('scenarioResources').value = 'yes';
        };
        if (JSON.stringify(scenarioConent).includes('reforms')) {
            document.getElementById('scenarioReforms').value = 'yes';
        };
        /*if (scenarioConent.description) { document.getElementById('description-text').value = scenarioConent.eeditor.description;
        } else { document.getElementById('description-text').value = 'Описание отсутствует.'; };*/
        if (scenarioConent.eeditor?.description) { document.getElementById('description').innerHTML = discordMarkdownToHtml(scenarioConent.eeditor.description);
        } else { document.getElementById('description').innerHTML = 'Описание отсутствует.'; };

        //alert(`Найден сценарий: ${foundScenario.title}`);

        document.getElementById('screenshoot').src = `${libLink}lib/${foundScenario.id.slice(0, 2).join('/')}/${cleanScenarioId}.png`;

        document.getElementById('downloadScenarioDetalis').onclick = () => {
            libDownloadScenario(`${libLink}lib/${foundScenario.id.slice(0, 2).join('/')}/${cleanScenarioId}.json`, ' ', `${foundScenario.id[0]}`, `${foundScenario.id[1]}`, `${foundScenario.id[2]}`, true);
        };
        document.getElementById('downloadMapDetalis').onclick = () => {
            downloadMapMap(`${foundScenario.id[0]}_${foundScenario.id[1]}_${foundScenario.id[2]}`);
        };
    }

    fetch(`${libLink}lib/${foundScenario.id.slice(0, 2).join('/')}/${rawScenarioId.replace(/\.json$/i, '')}.json`)
    .then(response => {
        // 1. Проверяем статус HTTP
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // 2. Преобразуем ответ в нужный формат (JSON, текст и т.д.)
        return response.json(); 
    })
    .then(data => {
        // 3. Работаем с полученными данными
        console.log(data);
        scenarioConent = data;
        setOtherParams();
    })
    .catch(error => {
        // 4. Обрабатываем ошибки сети или ошибки, выброшенные в блоке .then()
        console.error('Fetch error:', error);
    });
});