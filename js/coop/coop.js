class CoopManager {

    constructor() {
        this.coopData = {};
        this.init();
    }

    init() {
        console.log('Инициализация менеджера кооператива...');

        // Обработчики событий
        const setSender = document.getElementById('coop-will-send');
        const setReciver = document.getElementById('coop-will-recive');
        const dataSender = document.getElementById('coopSend');
        const dataReciver = document.getElementById('coopRecive');
        
        setSender.onclick = () => {
            dataSender.classList.add('active');
            if (dataReciver.classList.contains('active')) {
                dataReciver.classList.remove('active');
            }
        }
        setReciver.onclick = () => {
            dataReciver.classList.add('active');
            if (dataSender.classList.contains('active')) {
                dataSender.classList.remove('active');
            }
        }
    }

    scenarioData() {
        // Получаем данные сценария из глобального объекта
        if (window.scenarioData && typeof window.scenarioData === 'function') {
            return window.scenarioData();
        } else {
            console.error('Не удалось получить данные сценария: функция scenarioData не определена');
            return {};
        }
    }

    coopSettings() {
        const navButtons = document.querySelectorAll('.nav-button');
        navButtons.forEach(btn => btn.classList.remove('active'));
        
        // Switch to pcoop page
        const pageId = "pcoop";
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId)?.classList.add('active');
    }

}

// Создаем глобальный экземпляр менеджера кооператива после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('Инициализация CoopManager...');
    window.CoopManager = new CoopManager();
    console.log('CoopManager инициализирован:', window.CoopManager);
});
