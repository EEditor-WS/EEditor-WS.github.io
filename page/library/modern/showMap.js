let currentMap;

function useUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const title = document.getElementById('filterHeaderTitle')

    if (params.get('map')) {
        const mapData = getMapDataNew(params.get('map'))
        title.textContent = mapData.title

        currentMap = `${mapData.id[0]}_${mapData.id[1]}`

        if (mapData.versions?.length > 1) {
            const versionsContainer = document.getElementById('downloadMapVersions')
            let scenarios = []
            scenariosData.forEach(i => {
                if (`${i.id[0]}_${i.id[1]}` == currentMap) scenarios.push(i.id[2])
            })

            mapData.versions.forEach(num => {
                const el = document.createElement('button')
                el.className = 'downloadVersion'
                const countOfScenarios = scenarios.reduce((acc, item) => (item === num ? acc + 1 : acc), 0);

                let date = ''
                if (num == 'v1') date = mapData.publishDate + ' -';
                if (num == mapData.versions[mapData.versions.length - 1]) date = mapData.lastUpdate + ' -';

                el.textContent = `${num} - ${date} ${countOfScenarios}`

                versionsContainer.appendChild(el)
                el.addEventListener('click', () => {
                    downloadMapMap(`${currentMap}_${num}`)
                })
            });
        } else {
            document.getElementById('downloadMapVersionsBtn').classList.add('noVersions')
        }

        document.getElementById('filterHeaderLinkBtn').addEventListener('click', () => {
            navigator.clipboard.writeText(`${window.location.protocol}\/\/${window.location.host}\/library.html?category=scenarios&map=${currentMap}`)
            window.notification.success('Copied', 'Sucessfuly copied link to map to clipboard')
        })
    } else if (params.get('period')) {
        const period = params.get('period') + ''
        title.textContent = period.charAt(0).toUpperCase() + period.slice(1)

        document.getElementById('downloadMapBtn').style.display = 'none'

        document.getElementById('filterHeaderLinkBtn').addEventListener('click', () => {
            navigator.clipboard.writeText(`${window.location.protocol}\/\/${window.location.host}\/library.html?category=scenarios&period=${period}`)
            window.notification.success('Copied', 'Sucessfuly copied link to map to clipboard')
        })
    } else {
        document.getElementById('filterHeader').style.display = 'none'
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('filterHeaderResetBtn').addEventListener('click', () => {
        document.getElementById('filterHeader').style.display = 'none'
        libResetFilters()
    })
    document.getElementById('downloadMapVersionsBtn').addEventListener('click', () => {
        document.getElementById('filterHeaderDownload').classList.toggle('active')
    })
    document.getElementById('downloadMapLastBtn').addEventListener('click', () => {
        const mapData = getMapDataNew(currentMap)
        let lastVersion;
        if (mapData.versions) {
            lastVersion = mapData.versions[mapData.versions.length - 1]
        } else {
            lastVersion = mapData.id[2]
        }

        downloadMapMap(`${currentMap}_${lastVersion}`)
    })
})