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
        year: "2025",
        languages: ["EN", "RU"],
        gameMode: "Sandbox",
        tags: ["World", "For Phones", "Recomended", "without events", "without reforms"],
        worldCreator: "ЕЕнот",
        awards: ["star", "enot"],
        // Hidden parameters
        publishDate: "2025-01-19",
        lastUpdate: "2025-01-19",
        hiddenScore: 1,
        type: "sandbox",
        period: "modern"
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
        awards: ["star"],
        // Hidden parameters
        publishDate: "2025-01-31",
        lastUpdate: "2025-01-31",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
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

// Generate HTML for a scenario card
function generateScenarioCard(scenario) {
    const sortedAwards = sortAwardsByWeight(scenario.awards || []);
    const awardsHTML = sortedAwards
        .map(award => `
            <div class="download-award">
                <img src="temporarily/awards/${award}.svg" class="download-award-img">
            </div>
        `).join('');

    const tagsHTML = scenario.tags
        .map(tag => `<a href="#" style="color: #6e8699">#${tag}</a>`)
        .join('<p>, </p>');

    return `
        <div class="download-card" style="background-color: #333333; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <div class="download-up">
                <a href="${scenario.detailsLink}">
                    <img src="${scenario.image}" class="download-goto-page" style="width: 250px; border-radius: 8px;">
                </a>
                <div class="download-awards">
                    ${awardsHTML}
                </div>
            </div>
            <div class="download-info">
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
                <div class="download-row-big">
                    <div class="download-row">
                        <img src="world.svg" class="download-info-ico" />
                        <p>World by ${scenario.worldCreator}</p>
                    </div>
                    <button class="download-download-button" onclick="libDownloadScenario('${scenario.downloadUrl}')" style="background-color: #44944A; border-radius: 8px; width: 45px; height: 45px; border: none; cursor: pointer;">
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
