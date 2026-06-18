let scenariosData;

async function loadJson() {
  try {
    const url = `${libLink}scenarios.json`
    
    // Запрашиваем файл по сети
    const response = await fetch(url, {
        cache: 'reload' // или 'reload'
    });
    
    // Проверяем, успешный ли ответ (статус 200-299)
    if (!response.ok) {
      throw new Error(`Ошибка сети: ${response.status}`);
    }
    
    // Метод .json() сам прочитает тело ответа и превратит его в JS-объект
    scenariosData = await response.json(); 
    
    // Выводим результат в консоль браузера
    console.log(scenariosData);
  } catch (error) {
    console.error('Не удалось загрузить JSON:', error);
  }
}

loadJson();