getMapAndJsonFiles()

const content = document.getElementById('filesList')

async function displayMaps() {
    const files = await loadGroupedMaps();
    console.log(files);

    if (!files) {
        console.error("Не удалось загрузить карты");
        return;
    }

    Object.keys(files).forEach(map => {
        const mapEl = document.createElement('h1');
        mapEl.textContent = map;
        content.appendChild(mapEl);

        files[map].forEach(scenario => {
            const scenEl = document.createElement('p');
            scenEl.textContent = scenario;
            scenEl.style.paddingLeft = '1rem';
            content.appendChild(scenEl);
        });
    });
}

displayMaps();