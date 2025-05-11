console.log('Library downloadlist.js loaded');
const libLink = 'https://raw.githubusercontent.com/eenot-eenot/eeditor-ws-data/refs/heads/main/';
//const libLink = 'http://192.168.100.18:8081/'
//const libLink = 'https://ee-lib-data.netlify.app/'

// Award score values задаються в другом файле.

// Functions for generating paths from composite ID
function generateMapId(id, separator, length) {
    if (!Array.isArray(id)) {
        console.error('ID is not an array:', id);
        return '';
    }
    return id.slice(0, length).join(separator);
}

function generateImagePath(id) {
    if (!Array.isArray(id)) {
        console.error('ID is not an array:', id);
        return '';
    }
    const mapId = generateMapId(id, '/', 2);
    console.log(`Image ID: ${libLink}lib/${mapId}/${id.join('_')}.png`); // Debugging line
    return `${libLink}lib/${mapId}/${id.join('_')}.png`;
}

function generateScenarioPath(id) {
    if (!Array.isArray(id)) {
        console.error('ID is not an array:', id);
        return '';
    }
    const mapId = generateMapId(id, '/', 2);
    console.log(`Scenario ID: ${libLink}lib/${mapId}/${id.join('_')}.json`); // Debugging line
    return `${libLink}lib/${mapId}/${id.join('_')}.json`;
}

function generateMapPath(id) {
    if (!Array.isArray(id)) {
        console.error('ID is not an array:', id);
        return '';
    }
    const mapId = generateMapId(id, '/', 2);
    const mapFileId = generateMapId(id, '_', 3);
    console.log(`Map ID: ${libLink}lib/${mapId}/${mapFileId}_!.map`); // Debugging line
    return `${libLink}lib/${mapId}/${mapFileId}_!.map`;
}

function generateDetailsLink(id) {
    if (!Array.isArray(id)) {
        console.error('ID is not an array:', id);
        return '';
    }
    return `detalis.html?type=scenario&scenario=${id.join('_')}.json`;
}

// Sort awards by weight
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

// Store downloaded maps
const downloadedMaps = new Set();
let currentMapDownload = null;

// Generate HTML for a scenario card
function generateScenarioCard(scenario) {
    const sortedAwards = sortAwardsByWeight(scenario.awards || []);
    const awardsHTML = sortedAwards
        .map(award => `
            <div class="download-award">
                <img src="temporarily/awards/${award}.svg" class="download-award-img" title="${award === "enot" ? "EEnot recommends" : award}">
            </div>
        `).join('');

    const tagsHTML = scenario.tags
        .map(tag => `<a href="#" style="color: #6e8699">#${tag}</a>`)
        .join('<p>, </p>');

    const mapId = scenario.id.slice(0, 2);
    const mapData = getMapData(scenario.id.slice(0, 3).join('_'));
    const imagePath = generateImagePath(scenario.id);
    const scenarioPath = generateScenarioPath(scenario.id);
    const detailsLink = generateDetailsLink(scenario.id);
    const score = calculateScenarioScore(scenario);

    const status = scenario.status || "completed";
    const statusLabel = {
        "early_access": "Early Access",
        "in_development": "In Development",
        "discontinued": "Discontinued",
        "beta": "Beta",
        "alpha": "Alpha",
        "stable": "Stable",
        "completed": "Completed",
        "archived": "Archived",
        "experimental": "Experimental",
        "frozen": "Frozen"
    }[status] || "";
    console.log('--------------------');
    console.log(`Scenario: ${scenario.title}, Status: ${statusLabel}`);
    console.log(scenario.id.slice(0, 2).join('_'));
    console.log('--------------------');

    return `
        <div class="download-card" 
            data-title="${scenario.title.toLowerCase()}"
            data-author="${scenario.author.name.toLowerCase()}"
            data-type="${scenario.type}"
            data-period="${scenario.period}"
            data-year="${scenario.year}"
            data-languages="${scenario.languages.join(',').toLowerCase()}"
            data-map-name="${mapData ? mapData.title : scenario.map.name}"
            data-map-id="${scenario.id.slice(0, 2).join('_')}"
            data-publish-date="${scenario.publishDate}"
            data-update-date="${scenario.lastUpdate}"
            data-mechanics='${JSON.stringify(scenario.mechanics || {})}'
            data-score="${score}"
        >
            <div class="download-info">
                <div class="download-up">
                    <div class="download-image-container">
                        <a href="${detailsLink}">
                            <img src="${imagePath}" class="download-goto-page" style="width: 250px; height: 156px; object-fit: cover; border-radius: 15px 15px 0 0;">
                        </a>
                        <div class="download-awards">
                            ${awardsHTML}
                        </div>
                        <div class="download-status status-${status}">
                            ${statusLabel}
                        </div>
                    </div>
                </div>
                <div class="download-center">
                    <a href="${detailsLink}" class="download-title download-goto-page">${scenario.title}</a>
                    <div class="download-row-big">
                        <div class="download-row">
                            <img src="../../img/library/autor.svg" class="download-info-ico" />
                            <a href="${scenario.author.link}" style="color: ${scenario.author.color}">${truncateAuthorName(scenario.author.name)}</a>
                        </div>
                        <div class="download-row">
                            <p>${scenario.year}</p>
                            <img src="../../img/library/calendar.svg" class="download-info-ico" />
                        </div>
                    </div>
                    <div class="download-row-big">
                        <div class="download-row">
                            <img src="../../img/library/flag.svg" class="download-info-ico" />
                            <p>${scenario.languages.join(", ")}</p>
                        </div>
                        <div class="download-row">
                            <a href="#" style="color: #6e8699">${scenario.gameMode}</a>
                            <img src="../../img/library/gamemode.svg" class="download-info-ico" />
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
                        <img src="../../img/library/world.svg" class="download-info-ico" />
                        <p>${mapData ? mapData.title : scenario.map.name}</p>
                    </div>
                    <button class="download-download-button" onclick="libDownloadScenario('${scenarioPath}', '${mapId}', '${scenario.id[0]}', '${scenario.id[1]}', '${scenario.id[2]}')" style="background-color: #44944A; border-radius: 15px; width: 45px; height: 45px; border: none; cursor: pointer;">
                        <img src="../../img/library/download.svg" class="download-info-ico" />
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Download handling functions
async function libDownloadScenario(rawUrl, mapId, autor, map, version) {
    try {
        const fileName = rawUrl.split('/').pop();
        await downloadFile(rawUrl, fileName);

        if (mapId && !downloadedMaps.has(mapId) && !inGameMaps.includes(mapId)) {
            const mapData = getMapData(mapId);
            currentMapDownload = {
                mapId: mapId,
                mapUrl: `${libLink}lib/${autor}/${map}/${autor}_${map}_${version}_!.map`,
                fileName: `${autor}_${map}_${version}_!.map`,
                mapName: `${autor}_${map}_${version}`
                //mapName: mapData ? mapData.title : mapId
            };
            
            const modal = document.getElementById('downloadMapModal');
            const mapNameText = document.getElementById('mapNameText');
            mapNameText.textContent = currentMapDownload.mapName;
            modal.classList.add('active');
        }
    } catch (error) {
        console.error('Error downloading scenario:', error);
        showErrorMapModal(mapId);
    }
}

// Modal handling functions
function closeDownloadMapModal() {
    const modal = document.getElementById('downloadMapModal');
    modal.classList.remove('active');
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
    console.log(`Downloading map ${currentMapDownload.mapId}...`);
    console.log(currentMapDownload);

    try {
        await downloadFile(currentMapDownload.mapUrl, currentMapDownload.fileName);
        downloadedMaps.add(currentMapDownload.mapId);
        console.log(`Map ${currentMapDownload.mapId} downloaded successfully`);
    } catch (error) {
        console.error(`Error downloading map ${currentMapDownload.mapId}:`, error);
        showErrorMapModal(currentMapDownload.mapId);
    } finally {
        closeDownloadMapModal();
    }
}

// File download helper
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
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);
    return new Promise(resolve => setTimeout(resolve, 100));
}

// Load scenarios
function loadScenarios() {
    const container = document.getElementById('download-cards');
    if (!container) return;

    const sortedScenarios = getSortedScenarios();
    container.innerHTML = sortedScenarios.map(generateScenarioCard).join('');
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', loadScenarios);