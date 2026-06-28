const fileSystem = chrome.webview.hostObjects.fileSystem;

async function getMapAndJsonFiles() {
    try {
        // Проверяем, что объект существует
        if (!chrome.webview.hostObjects.fileSystem) {
            console.error("fileSystem не зарегистрирован");
            return [];
        }
        
        const files = await chrome.webview.hostObjects.fileSystem.GetMapAndJsonFilesAsync();
        console.log(`Найдено ${files.length} файлов:`, files);
        return files;
    } catch (error) {
        console.error("Ошибка при получении файлов:", error);
        return [];
    }
}

// Чтение файла
async function readJsonFile(relativePath) {
    try {
        const content = await chrome.webview.hostObjects.fileSystem.ReadFileAsync(relativePath);
        if (content !== null) {
            const data = JSON.parse(content);
            console.log("Содержимое файла:", data);
            return data;
        } else {
            console.error("Файл не найден или ошибка чтения:", relativePath);
            return null;
        }
    } catch (error) {
        console.error("Ошибка при чтении файла:", error);
        return null;
    }
}

// Запись файла
async function writeJsonFile(relativePath, data) {
    try {
        const content = JSON.stringify(data, null, 2);
        const success = await chrome.webview.hostObjects.fileSystem.WriteFileAsync(relativePath, content);
        console.log(success ? "Файл записан" : "Ошибка записи");
        return success;
    } catch (error) {
        console.error("Ошибка при записи файла:", error);
        return false;
    }
}

async function loadGroupedMaps() {
    try {
        // Вызываем метод C# через WebView2 Host Object
        const jsonString = await window.chrome.webview.hostObjects.fileSystem.GetGroupedMapsAsync(libLink);
        
        // Парсим строку в JS-объект
        const groupedMaps = JSON.parse(jsonString);
        
        console.log(groupedMaps);

        return groupedMaps;
    } catch (error) {
        console.error("Ошибка при получении списка карт:", error);
    }
}

/* // Использование
loadGroupedMaps().then(maps => {
    // Работаем с объектом maps
});

// Пример использования:
async function example() {
    // Читаем JSON
    const config = await readJsonFile("maps/level1.json");
    if (config) {
        // Меняем что-то
        config.version = 2;
        // Сохраняем обратно
        await writeJsonFile("maps/level1.json", config);
    }
}*/

// getMapAndJsonFiles()