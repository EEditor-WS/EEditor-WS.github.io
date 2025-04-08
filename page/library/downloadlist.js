const inGameMaps = [
    "jalhund_europe_vg",
    "jaba_america_vg",
    "parcoucat_euro4_vg"
]

const scenariosData = [
    {
        id: "modern_world",
        title: "Modern World",
        image: "temporarily/eenot_world_modern.png",
        detailsLink: "detalis.html?type=scenario&scenario=eenot_world_v1_modern-world.json",
        downloadUrl: "https://raw.githubusercontent.com/eenot-eenot/eeditor-ws-data/refs/heads/main/lib/scenarios/eenot_world_v1_modern-world.json",
        author: {
            name: "@eenot",
            link: "https://discord.com/users/794675642037567498",
            color: "#3B83BD"
        },
        year: "2015",
        languages: ["EN", "RU"],
        gameMode: "Sandbox",
        tags: ["World", "For Phones", "Recomended", "without events", "without reforms"],
        worldCreator: "ЕЕнот",
        map: {
            name: "World by ЕЕнот",
            id: "eenot_world_v1"
        },
        awards: ["star", "enot"],
        // Hidden parameters
        publishDate: "2025-01-19",
        lastUpdate: "2025-01-19",
        hiddenScore: 1,
        type: "sandbox",
        period: "modern"
    },
    {
        id: "new_revolution",
        title: "New Revolution",
        image: "temporarily/jalhund_europe_new-revolution.png",
        detailsLink: "detalis.html?type=scenario&scenario=jalhund_europe_vg_new-revolution.json",
        downloadUrl: "https://raw.githubusercontent.com/eenot-eenot/eeditor-ws-data/refs/heads/main/lib/scenarios/jalhund_europe_vg_new-revolution.json",
        author: {
            name: "@eenot",
            link: "https://discord.com/users/794675642037567498",
            color: "#3B83BD"
        },
        year: "2022",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: ["Europe", "For Phones", "Recomended", "without events", "without reforms"],
        worldCreator: "ЕЕнот",
        map: {
            name: "Standart Europe",
            id: "jalhund_europe_vg"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2024-10-30",
        lastUpdate: "2024-10-30",
        hiddenScore: -250,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: "ww2",
        title: "World War 2",
        image: "temporarily/eenot_world_ww2.png",
        detailsLink: "detalis.html?type=scenario&scenario=eenot_world_v1_ww2.json",
        downloadUrl: "https://raw.githubusercontent.com/eenot-eenot/eeditor-ws-data/refs/heads/main/lib/scenarios/eenot_world_v1_ww2.json",
        author: {
            name: "@theman_the_myth_the_legend",
            link: "https://discord.com/users/1083919275951149118",
            color: "#3B83BD"
        },
        year: "1936",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["World", "For Phones", "Recomended", "without events", "without reforms"],
        worldCreator: "ЕЕнот",
        map: {
            name: "World by ЕЕнот",
            id: "eenot_world_v1"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2025-01-24",
        lastUpdate: "2025-01-24",
        hiddenScore: 0,
        type: "sandbox",
        period: "ww2"
    },
    {
        id: "cw",
        title: "The Cold War",
        image: "temporarily/eenot_world_cw.png",
        detailsLink: "detalis.html?type=scenario&scenario=eenot_world_v1_cw.json",
        downloadUrl: "https://raw.githubusercontent.com/eenot-eenot/eeditor-ws-data/refs/heads/main/lib/scenarios/eenot_world_v1_cw.json",
        author: {
            name: "@theman_the_myth_the_legend",
            link: "https://discord.com/users/1083919275951149118",
            color: "#3B83BD"
        },
        year: "1965",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["World", "For Phones", "without events", "without reforms"],
        worldCreator: "ЕЕнот",
        map: {
            name: "World by ЕЕнот",
            id: "eenot_world_v1"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2025-01-24",
        lastUpdate: "2025-01-24",
        hiddenScore: 0,
        type: "sandbox",
        period: "cw"
    },
    {
        id: "1984",
        title: "1984",
        image: "temporarily/eenot_world_1984.png",
        detailsLink: "detalis.html?type=scenario&scenario=eenot_world_v1_1984.json",
        downloadUrl: "https://raw.githubusercontent.com/eenot-eenot/eeditor-ws-data/refs/heads/main/lib/scenarios/eenot_world_v1_1984.json",
        author: {
            name: "@helvetic_brutalisation",
            link: "https://discord.com/users/1280887382920532073",
            color: "#3B83BD"
        },
        year: "1984",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["World", "For Phones", "Recomended", "without events", "without reforms"],
        worldCreator: "ЕЕнот",
        map: {
            name: "World by ЕЕнот",
            id: "eenot_world_v1"
        },
        awards: ["star"],
        // Hidden parameters
        publishDate: "2025-01-31",
        lastUpdate: "2025-01-31",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: "1444",
        title: "1444",
        image: "temporarily/estebanf259_euromagnus_v1_1444.png",
        detailsLink: "detalis.html?type=scenario&scenario=estebanf259_euromagnus_v1_1444.json",
        downloadUrl: "https://raw.githubusercontent.com/eenot-eenot/eeditor-ws-data/refs/heads/main/lib/scenarios/estebanf259_euromagnus_v1_1444.json",
        author: {
            name: "@totoska",
            link: "https://discord.com/users/820194328201920524",
            color: "#3B83BD"
        },
        year: "1444",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        map: {
            name: "EuroMagnus by Estebanf259",
            id: "estebanf259_euromagnus_v1"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2024-11-17",
        lastUpdate: "2024-11-17",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: "pick-roman-empire",
        title: "The peak of the Roman Empire",
        image: "temporarily/parkourcat_euro4_vg_pick-roman-empire.png",
        detailsLink: "detalis.html?type=scenario&scenario=parkourcat_euro4_vg_pick-roman-empire.json",
        downloadUrl: "https://raw.githubusercontent.com/eenot-eenot/eeditor-ws-data/refs/heads/main/lib/scenarios/parkourcat_euro4_vg_pick-roman-empire.json",
        author: {
            name: "@totoska",
            link: "https://discord.com/users/820194328201920524",
            color: "#3B83BD"
        },
        year: "1177",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        map: {
            name: "Euro4 Standart",
            id: "parkourcat_euro4_vg"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2024-11-20",
        lastUpdate: "2024-11-20",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: "shw",
        title: "The Seven Hours War",
        image: "temporarily/shahz0d_world_v1_shw.png",
        detailsLink: "detalis.html?type=scenario&scenario=shahz0d_world_v1_shw.json",
        downloadUrl: "https://raw.githubusercontent.com/eenot-eenot/eeditor-ws-data/refs/heads/main/lib/scenarios/shahz0d_world_v1_shw.json",
        author: {
            name: "@totoska",
            link: "https://discord.com/users/820194328201920524",
            color: "#3B83BD"
        },
        year: "2000",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        map: {
            name: "World Plus",
            id: "shahz0d_world_v1"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2024-11-21",
        lastUpdate: "2024-11-21",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: "kaiserreich",
        title: "Kaiserreich",
        image: "temporarily/zachary_eurasia_v1_kaiserreich.png",
        detailsLink: "detalis.html?type=scenario&scenario=zachary_eurasia_v1_kaiserreich.json",
        downloadUrl: "https://raw.githubusercontent.com/eenot-eenot/eeditor-ws-data/refs/heads/main/lib/scenarios/zachary_eurasia_v1_kaiserreich.json",
        author: {
            name: "@totoska",
            link: "https://discord.com/users/820194328201920524",
            color: "#3B83BD"
        },
        year: "1936",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        map: {
            name: "Eurasia by Zachary",
            id: "zachary_eurasia_v1"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2024-12-03",
        lastUpdate: "2025-04-07",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: "modern",
        title: "Modern Day",
        image: "temporarily/zachary_eurasia_v1_modern.png",
        detailsLink: "detalis.html?type=scenario&scenario=zachary_eurasia_v1_modern.json",
        downloadUrl: "https://raw.githubusercontent.com/eenot-eenot/eeditor-ws-data/refs/heads/main/lib/scenarios/zachary_eurasia_v1_modern.json",
        author: {
            name: "@totoska",
            link: "https://discord.com/users/820194328201920524",
            color: "#3B83BD"
        },
        year: "2020",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        map: {
            name: "Eurasia by Zachary",
            id: "zachary_eurasia_v1"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2025-03-07",
        lastUpdate: "2025-03-07",
        hiddenScore: 0,
        type: "sandbox",
        period: "modern"
    },
    {
        id: "tno",
        title: "The New Order",
        image: "temporarily/zachary_eurasia_v1_tno.png",
        detailsLink: "detalis.html?type=scenario&scenario=zachary_eurasia_v1_tno.json",
        downloadUrl: "https://raw.githubusercontent.com/eenot-eenot/eeditor-ws-data/refs/heads/main/lib/scenarios/zachary_eurasia_v1_tno.json",
        author: {
            name: "@totoska",
            link: "https://discord.com/users/820194328201920524",
            color: "#3B83BD"
        },
        year: "1962",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        map: {
            name: "Eurasia by Zachary",
            id: "zachary_eurasia_v1"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2024-12-17",
        lastUpdate: "2024-12-17",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: "ww2",
        title: "World War 2",
        image: "temporarily/zachary_world_v1_ww2.png",
        detailsLink: "detalis.html?type=scenario&scenario=zachary_world_v1_ww2.json",
        downloadUrl: "https://raw.githubusercontent.com/eenot-eenot/eeditor-ws-data/refs/heads/main/lib/scenarios/zachary_world_v1_ww2.json",
        author: {
            name: "@totoska",
            link: "https://discord.com/users/820194328201920524",
            color: "#3B83BD"
        },
        year: "1936",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        map: {
            name: "World by Zachary",
            id: "zachary_world_v1"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2025-03-07",
        lastUpdate: "2025-03-07",
        hiddenScore: 0,
        type: "sandbox",
        period: "ww2"
    },
    {
        id: "1-1",
        title: "1v1 Warnament",
        image: "temporarily/enotochel_pvp_v1_1-1.png",
        detailsLink: "detalis.html?type=scenario&scenario=enotochel_pvp_v1_1-1.json",
        downloadUrl: "https://raw.githubusercontent.com/eenot-eenot/eeditor-ws-data/refs/heads/main/lib/scenarios/enotochel_pvp_v1_1-1.json",
        author: {
            name: "@totoska",
            link: "https://discord.com/users/820194328201920524",
            color: "#3B83BD"
        },
        year: "0",
        languages: ["EN"],
        gameMode: "Battle",
        tags: [""],
        worldCreator: "ЕЕнот",
        map: {
            name: "PvP map by Енотий",
            id: "enotochel_pvp_v1"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2024-12-23",
        lastUpdate: "2024-12-23",
        hiddenScore: 0,
        type: "battle",
        period: ""
    },
    {
        id: "1-1",
        title: "1v1 Warnament (+Watcher)",
        image: "temporarily/enotochel_pvp_v1_1-1-watcher.png",
        detailsLink: "detalis.html?type=scenario&scenario=enotochel_pvp_v1_1-1-watcher.json",
        downloadUrl: "https://raw.githubusercontent.com/eenot-eenot/eeditor-ws-data/refs/heads/main/lib/scenarios/enotochel_pvp_v1_1-1-watcher.json",
        author: {
            name: "@totoska",
            link: "https://discord.com/users/820194328201920524",
            color: "#3B83BD"
        },
        year: "0",
        languages: ["EN"],
        gameMode: "Battle",
        tags: [""],
        worldCreator: "ЕЕнот",
        map: {
            name: "PvP map by Енотий",
            id: "enotochel_pvp_v1"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2024-12-23",
        lastUpdate: "2024-12-23",
        hiddenScore: 0,
        type: "battle",
        period: ""
    },
    {
        id: "cw",
        title: "The Cold War",
        image: "temporarily/estebanf259_world-redux_v2_cw.png",
        detailsLink: "detalis.html?type=scenario&scenario=estebanf259_world-redux_v2_cw.json",
        downloadUrl: "https://raw.githubusercontent.com/eenot-eenot/eeditor-ws-data/refs/heads/main/lib/scenarios/estebanf259_world-redux_v2_cw.json",
        author: {
            name: "@deleted_user",
            link: "https://discord.com/users/456226577798135808",
            color: "#3B83BD"
        },
        year: "1949",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        map: {
            name: "World Map Redux",
            id: "estebanf259_world-redux_v2"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2023-07-03",
        lastUpdate: "2023-07-03",
        hiddenScore: 0,
        type: "sandbox",
        period: "cw"
    },
    {
        id: "modern",
        title: "Modern Day",
        image: "temporarily/estebanf259_world-redux_v2_modern.png",
        detailsLink: "detalis.html?type=scenario&scenario=estebanf259_world-redux_v2_modern.json",
        downloadUrl: "https://raw.githubusercontent.com/eenot-eenot/eeditor-ws-data/refs/heads/main/lib/scenarios/estebanf259_world-redux_v2_modern.json",
        author: {
            name: "@deleted_user",
            link: "https://discord.com/users/456226577798135808",
            color: "#3B83BD"
        },
        year: "2000",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        map: {
            name: "World Map Redux",
            id: "estebanf259_world-redux_v2"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2023-07-03",
        lastUpdate: "2023-07-03",
        hiddenScore: 0,
        type: "sandbox",
        period: "modern"
    },
    {
        id: "hoi4-formables",
        title: "Hoi4 Formables",
        image: "temporarily/none.png",
        detailsLink: "detalis.html?type=scenario&scenario=estebanf259_world-redux_v2_hoi4-formables.json",
        downloadUrl: "https://raw.githubusercontent.com/eenot-eenot/eeditor-ws-data/refs/heads/main/lib/scenarios/estebanf259_world-redux_v2_hoi4-formables.json",
        author: {
            name: "@deleted_user",
            link: "https://discord.com/users/456226577798135808",
            color: "#3B83BD"
        },
        year: "1936",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        map: {
            name: "World Map Redux",
            id: "estebanf259_world-redux_v2"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2023-11-10",
        lastUpdate: "2023-11-10",
        hiddenScore: 0,
        type: "sandbox",
        period: "ww2"
    },
    {
        id: "1218",
        title: "1218",
        image: "temporarily/estebanf259_world-redux_v2_1218.png",
        detailsLink: "detalis.html?type=scenario&scenario=estebanf259_world-redux_v2_1218.json",
        downloadUrl: "https://raw.githubusercontent.com/eenot-eenot/eeditor-ws-data/refs/heads/main/lib/scenarios/estebanf259_world-redux_v2_1218.json",
        author: {
            name: "@deleted_user",
            link: "https://discord.com/users/456226577798135808",
            color: "#3B83BD"
        },
        year: "1218",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        map: {
            name: "World Map Redux",
            id: "estebanf259_world-redux_v2"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2023-07-03",
        lastUpdate: "2023-07-03",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: "1756",
        title: "1756",
        image: "temporarily/estebanf259_world-redux_v2_1756.png",
        detailsLink: "detalis.html?type=scenario&scenario=estebanf259_world-redux_v2_1756.json",
        downloadUrl: "https://raw.githubusercontent.com/eenot-eenot/eeditor-ws-data/refs/heads/main/lib/scenarios/estebanf259_world-redux_v2_1756.json",
        author: {
            name: "@deleted_user",
            link: "https://discord.com/users/456226577798135808",
            color: "#3B83BD"
        },
        year: "1756",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        map: {
            name: "World Map Redux",
            id: "estebanf259_world-redux_v2"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2023-07-03",
        lastUpdate: "2023-07-03",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: "continents",
        title: "World 3g ago",
        image: "temporarily/zachary_world-3ga_v1_continents.png",
        detailsLink: "detalis.html?type=scenario&scenario=zachary_world-3ga_v1_continents.json",
        downloadUrl: "https://raw.githubusercontent.com/eenot-eenot/eeditor-ws-data/refs/heads/main/lib/scenarios/zachary_world-3ga_v1_continents.json",
        author: {
            name: "@zacharyzachary.bachary",
            link: "https://discord.com/users/804839006403428423",
            color: "#3B83BD"
        },
        year: "-3000000000",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        map: {
            name: "World Map (3 billion years ago)",
            id: "zachary_world-3ga_v1"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2025-04-09",
        lastUpdate: "2025-04-09",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    // Add more scenarios here...
];

// Award score values
const awardScores = {
    "star": 25,
    "enot": 50,
    // Добавлять другие награды и их значения здесь
};

// Сортировка наград по весу
function sortAwardsByWeight(awards) {
    return [...awards].sort((a, b) => (awardScores[b] || 0) - (awardScores[a] || 0));
}

// Calculate total score for a scenario
function calculateScenarioScore(scenario) {
    let score = 0;
    
    // Base score from hidden parameter
    score += scenario.hiddenScore || 0;
    
    // Awards score
    if (scenario.awards) {
        score += scenario.awards.reduce((sum, award) => sum + (awardScores[award] || 0), 0);
    }
    
    // Publication date score (newer = higher score)
    const publishAge = (new Date() - new Date(scenario.publishDate)) / (1000 * 60 * 60 * 24); // days
    score += Math.max(0, 100 - publishAge/30); // Lose 1 point per month, max 100 points
    
    // Update freshness score
    const updateAge = (new Date() - new Date(scenario.lastUpdate)) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 50 - updateAge/30); // Lose 1 point per month, max 50 points

    console.log(`Scenario: ${scenario.title}, Score: ${score}`); // Debugging line
    return score;
}

// Sort scenarios by score
function getSortedScenarios() {
    return scenariosData
        .map(scenario => ({
            ...scenario,
            score: calculateScenarioScore(scenario)
        }))
        .sort((a, b) => b.score - a.score);
}

// Helper function to truncate author name
function truncateAuthorName(name, maxLength = 13) {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
}

// Добавляем отслеживание загруженных карт
const downloadedMaps = new Set();

let currentMapDownload = null;

async function libDownloadScenario(rawUrl, mapId) {
    try {
        // Сначала скачиваем сценарий
        const fileName = rawUrl.split('/').pop();
        await downloadFile(rawUrl, fileName);

        // Проверяем, нужно ли предлагать скачать карту
        if (mapId && !downloadedMaps.has(mapId) && !inGameMaps.includes(mapId)) {
            // Сохраняем информацию о карте для модального окна
            currentMapDownload = {
                mapId: mapId,
                mapUrl: `https://raw.githubusercontent.com/eenot-eenot/eeditor-ws-data/refs/heads/main/lib/maps/${mapId}_!.map`,
                fileName: `${mapId}_!.map`
            };
            
            // Показываем модальное окно
            const modal = document.getElementById('downloadMapModal');
            const mapNameText = document.getElementById('mapNameText');
            mapNameText.textContent = mapId;
            modal.classList.add('active');
        }
    } catch (error) {
        console.error('Ошибка при скачивании сценария:', error);
        alert('Ошибка при скачивании сценария. Попробуйте позже.');
        window.open(rawUrl, '_blank');
    }
}

function closeDownloadMapModal() {
    const modal = document.getElementById('downloadMapModal');
    modal.classList.remove('active');
    downloadedMaps.add(currentMapDownload.mapId);
    currentMapDownload = null;
}

function closeErrorMapModal() {
    const modal = document.getElementById('errorMapModal');
    modal.classList.remove('active');
}

function showErrorMapModal(mapId) {
    const modal = document.getElementById('errorMapModal');
    const errorText = document.getElementById('errorMapText');
    errorText.textContent = mapId;
    modal.classList.add('active');
}

async function confirmDownloadMap() {
    if (!currentMapDownload) return;

    try {
        await downloadFile(currentMapDownload.mapUrl, currentMapDownload.fileName);
        console.log(`Map ${currentMapDownload.mapId} downloaded successfully`);
    } catch (error) {
        console.error(`Error downloading map ${currentMapDownload.mapId}:`, error);
        showErrorMapModal(currentMapDownload.mapId);
    } finally {
        closeDownloadMapModal();
    }
}

// Обновляем вспомогательную функцию для скачивания файлов
async function downloadFile(url, fileName) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const blob = await response.blob();
    const enhancedBlob = new Blob([blob], { type: contentType });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(enhancedBlob);
    link.download = fileName || url.split('/').pop() || 'file';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);

    return new Promise(resolve => setTimeout(resolve, 100)); // Небольшая задержка между скачиваниями
}

// Generate HTML for a scenario card
function generateScenarioCard(scenario) {
    const sortedAwards = sortAwardsByWeight(scenario.awards || []);
    const awardsHTML = sortedAwards
        .map(award => `
            <div class="download-award">
                <img src="temporarily/awards/${award}.svg" class="download-award-img" title="${award}">
            </div>
        `).join('');

    const tagsHTML = scenario.tags
        .map(tag => `<a href="#" style="color: #6e8699">#${tag}</a>`)
        .join('<p>, </p>');

    return `
        <div class="download-card" 
            style="background-color: #333333; border-radius: 8px; padding: 16px; margin-bottom: 16px;"
            data-title="${scenario.title.toLowerCase()}"
            data-author="${scenario.author.name.toLowerCase()}"
            data-type="${scenario.type}"
            data-period="${scenario.period}"
            data-year="${scenario.year}"
            data-languages="${scenario.languages.join(',').toLowerCase()}"
            data-worldcreator="${scenario.worldCreator.toLowerCase()}"
            data-map-name="${scenario.map.name}"
            data-map-id="${scenario.map.id}"
            data-publish-date="${scenario.publishDate}"
            data-update-date="${scenario.lastUpdate}"
            data-mechanics='${JSON.stringify({
                economy: "none",
                population: "none",
                resources: "none",
                diplomacy: "none",
                rebellions: "none",
                reforms: "none",
                events: "none",
                ...scenario.mechanics
            })}'
        >
            <div class="download-info">
                <div class="download-up">
                    <a href="${scenario.detailsLink}">
                        <img src="${scenario.image}" class="download-goto-page" style="width: 250px; border-radius: 8px;">
                    </a>
                    <div class="download-awards">
                        ${awardsHTML}
                    </div>
                </div>
                <div class="download-center">
                    <a href="${scenario.detailsLink}" class="download-title download-goto-page">${scenario.title}</a>
                    <div class="download-row-big">
                        <div class="download-row">
                            <img src="autor.svg" class="download-info-ico" />
                            <a href="${scenario.author.link}" style="color: ${scenario.author.color}">${truncateAuthorName(scenario.author.name)}</a>
                        </div>
                        <div class="download-row">
                            <p>${scenario.year}</p>
                            <img src="calendar.svg" class="download-info-ico" />
                        </div>
                    </div>
                    <div class="download-row-big">
                        <div class="download-row">
                            <img src="flag.svg" class="download-info-ico" />
                            <p>${scenario.languages.join(", ")}</p>
                        </div>
                        <div class="download-row">
                            <a href="#" style="color: #6e8699">${scenario.gameMode}</a>
                            <img src="gamemode.svg" class="download-info-ico" />
                        </div>
                    </div>
                    <div class="download-tags">
                        ${tagsHTML}
                    </div>
                </div>
            </div>
            <div class="download-down">
                <div class="download-row-big">
                    <div class="download-row">
                        <img src="world.svg" class="download-info-ico" />
                        <p>${scenario.map.name}</p>
                    </div>
                    <button class="download-download-button" onclick="libDownloadScenario('${scenario.downloadUrl}', '${scenario.map.id}')" style="background-color: #44944A; border-radius: 8px; width: 45px; height: 45px; border: none; cursor: pointer;">
                        <img src="download.svg" class="download-info-ico" />
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Load scenarios into the page
function loadScenarios() {
    const container = document.getElementById('download-cards');
    if (!container) return;

    const sortedScenarios = getSortedScenarios();
    container.innerHTML = sortedScenarios.map(generateScenarioCard).join('');
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', loadScenarios);
