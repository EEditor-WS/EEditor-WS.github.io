const inGameMaps = [
    "jalhund_europe_vg",
    "jaba_america_vg",
    "parcoucat_euro4_vg",
    "jalhund_europe",
    "jaba_america",
    "parcoucat_euro4",
];

const statusScores = {
    "complate": 40,
    "early_access": 30,
    "in_development": 20,
    "beta": 15,
    "alpha": 10,
    "experimental": 5,
    "frozen": 0,
    "archived": -30,
    "discontinued": -50,
};

const awardScores = {
    "star": 25,
    "enot": 50,
    "50": 25,
};

const scenariosData = [
    {
        id: [
            "eenot",
            "world",
            "v1",
            "modern-world",
        ],
        title: "Modern World",
        author: "eenot",
        year: "2015",
        languages: ["EN", "RU"],
        gameMode: "Sandbox",
        tags: ["World", "For Phones", "Recommended", "without events", "without reforms", "Modern Day"],
        worldCreator: "ЕЕнот",
        awards: ["star", "enot"],
        // Hidden parameters
        publishDate: "2025-01-19",
        lastUpdate: "2025-01-19",
        hiddenScore: 50,
        type: "sandbox",
        period: "modern",
        status: "archived",
    },
    {
        id: [
            "jalhund",
            "europe",
            "vg",
            "new-revolution",
        ],
        title: "New Revolution",
        author: "eenot",
        year: "2022",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: ["Europe", "For Phones", "Recommended", "without events", "without reforms", "Alternative History"],
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
        period: "alternative",
        status: "discontinued",
    },
    {
        id: [
            "eenot",
            "world",
            "v1",
            "ww2",
        ],
        title: "World War 2",
        author: "theman_the_myth_the_legend",
        year: "1936",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["World", "For Phones", "Recommended", "without events", "without reforms", "Historical", "WW2"],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2025-01-24",
        lastUpdate: "2025-01-24",
        hiddenScore: 0,
        type: "sandbox",
        period: "ww2",
    },
    {
        id: [
            "eenot",
            "world",
            "v1",
            "cw",
        ],
        title: "The Cold War",
        author: "theman_the_myth_the_legend",
        year: "1965",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["World", "For Phones", "without events", "without reforms", "Historical", "Cold War"],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2025-01-24",
        lastUpdate: "2025-01-24",
        hiddenScore: 0,
        type: "sandbox",
        period: "cw",
    },
    {
        id: [
            "eenot",
            "world",
            "v1",
            "1984",
        ],
        title: "1984",
        author: "helvetic_brutalisation",
        year: "1984",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["World", "For Phones", "Recommended", "without events", "without reforms", "Alternative History", "1984"],
        worldCreator: "ЕЕнот",
        awards: ["enot"],
        // Hidden parameters
        publishDate: "2025-01-31",
        lastUpdate: "2025-01-31",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: [
            "estebanf259",
            "euromagnus",
            "v1",
            "1444",
        ],
        title: "1444",
        author: "totoska",
        year: "1444",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["Europe", "Historical", "Medieval", "without events", "without reforms"],
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
        id: [
            "parkourcat",
            "euro4",
            "vg",
            "pick-roman-empire",
        ],
        title: "The peak of the Roman Empire",
        author: "totoska",
        year: "1177",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["Europe", "Historical", "Roman Empire", "Ancient"],
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
        id: [
            "shahz0d",
            "world",
            "v1",
            "shw",
        ],
        title: "The Seven Hours War",
        author: "totoska",
        year: "2000",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["World", "Alternative History", "Half-Life", "Post-apocalyptic"],
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
        id: [
            "zachary",
            "eurasia",
            "v2",
            "kaiserreich",
        ],
        title: "Kaiserreich",
        author: "totoska",
        year: "1936",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["Eurasia", "Alternative History", "WW1", "Kaiserreich"],
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
        id: [
            "zachary",
            "eurasia",
            "v2",
            "modern",
        ],
        title: "Modern Day",
        author: "totoska",
        year: "2020",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["Eurasia", "Modern Day", "2020s"],
        worldCreator: "ЕЕнот",
        map: {
            name: "Eurasia by Zachary",
            id: "zachary_eurasia_v1"
        },
        awards: ["star","enot"],
        // Hidden parameters
        publishDate: "2025-03-07",
        lastUpdate: "2025-04-30",
        hiddenScore: 0,
        type: "sandbox",
        period: "modern"
    },
    {
        id: [
            "zachary",
            "eurasia",
            "v2",
            "tno",
        ],
        title: "The New Order",
        author: "totoska",
        year: "1962",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["Eurasia", "Alternative History", "WW2", "The New Order", "Cold War"],
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
        id: [
            "zachary",
            "world",
            "v1",
            "ww2",
        ],
        title: "World War 2",
        author: "totoska",
        year: "1936",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["World", "Historical", "WW2", "1936"],
        worldCreator: "ЕЕнот",
        map: {
            name: "World by Zachary",
            id: "zachary_world_v1"
        },
        awards: ["star","enot"],
        // Hidden parameters
        publishDate: "2025-03-07",
        lastUpdate: "2025-03-07",
        hiddenScore: 0,
        type: "sandbox",
        period: "ww2"
    },
    {
        id: [
            "enotochel",
            "pvp",
            "v1",
            "1-1",
        ],
        title: "1v1 Warnament",
        author: "totoska",
        year: "0",
        languages: ["EN"],
        gameMode: "Battle",
        tags: ["PvP", "Battle", "1v1", "Competitive"],
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
        id: [
            "enotochel",
            "pvp",
            "v1",
            "1-1-watcher",
        ],
        title: "1v1 Warnament (+Watcher)",
        author: "totoska",
        year: "0",
        languages: ["EN"],
        gameMode: "Battle",
        tags: ["PvP", "Battle", "1v1", "Competitive", "Spectator"],
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
        id: [
            "estebanf259",
            "world-redux",
            "v2",
            "cw",
        ],
        title: "The Cold War",
        author: "esteban",
        year: "1949",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["World", "Historical", "Cold War", "Redux"],
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
        id: [
            "estebanf259",
            "world-redux",
            "v2",
            "modern",
        ],
        title: "Modern Day",
        author: "esteban",
        year: "2000",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["World", "Modern Day", "Redux", "2000s"],
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
        id: [
            "estebanf259",
            "world-redux",
            "v2",
            "hoi4-formables",
        ],
        title: "Hoi4 Formables",
        author: "esteban",
        year: "1936",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["World", "WW2", "Hearts of Iron", "Formable Nations", "Redux"],
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
        id: [
            "estebanf259",
            "world-redux",
            "v2",
            "1218",
        ],
        title: "1218",
        author: "esteban",
        year: "1218",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["World", "Historical", "Medieval", "Redux", "13th Century"],
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
        id: [
            "estebanf259",
            "world-redux",
            "v2",
            "1756",
        ],
        title: "1756",
        author: "esteban",
        year: "1756",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["World", "Historical", "18th Century", "Redux"],
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
        id: [
            "zachary",
            "world-3ga",
            "v1",
            "continents",
        ],
        title: "World 3g ago",
        author: "zachary",
        year: "-3000000000",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["World", "Historical", "Prehistoric", "Geology", "Continents"],
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
    {
        id: [
            "zachary",
            "eurasia",
            "v2",
            "1800"
        ],
        title: "Europe 1800",
        author: "zachary",
        year: "1800",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["Eurasia", "Historical", "Napoleonic Era", "19th Century"],
        worldCreator: "Zachary",
        map: {
            name: "Eurasia by Zachary",
            id: "zachary_eurasia_v2"
        },
        awards: [],
        publishDate: "2025-03-07",
        lastUpdate: "2025-03-07",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: [
            "zachary",
            "eurasia",
            "v2",
            "1812"
        ],
        title: "Napoleonic Wars",
        author: "zachary",
        year: "1812",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["Eurasia", "Historical", "Napoleonic Wars", "19th Century"],
        worldCreator: "Zachary",
        map: {
            name: "Eurasia by Zachary",
            id: "zachary_eurasia_v2"
        },
        awards: [],
        publishDate: "2025-03-07",
        lastUpdate: "2025-03-07",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: [
            "zachary",
            "eurasia",
            "v2",
            "1939"
        ],
        title: "World War 2 Start",
        author: "zachary",
        year: "1939",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["Eurasia", "Historical", "WW2", "20th Century"],
        worldCreator: "Zachary",
        map: {
            name: "Eurasia by Zachary",
            id: "zachary_eurasia_v2"
        },
        awards: [],
        publishDate: "2025-03-07",
        lastUpdate: "2025-03-07",
        hiddenScore: 0,
        type: "sandbox",
        period: "ww2"
    },
    {
        id: [
            "zachary",
            "eurasia",
            "v2",
            "ep2"
        ],
        title: "Episode 2",
        author: "zachary",
        year: "2025",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["Eurasia", "Alternative History", "Future", "Episode 2"],
        worldCreator: "Zachary",
        map: {
            name: "Eurasia by Zachary",
            id: "zachary_eurasia_v2"
        },
        awards: [],
        publishDate: "2025-03-07",
        lastUpdate: "2025-03-07",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: [
            "zachary",
            "eurasia",
            "v2",
            "ep3"
        ],
        title: "Episode 3",
        author: "zachary",
        year: "2025",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["Eurasia", "Alternative History", "Future", "Episode 3"],
        worldCreator: "Zachary",
        map: {
            name: "Eurasia by Zachary",
            id: "zachary_eurasia_v2"
        },
        awards: [],
        publishDate: "2025-03-07",
        lastUpdate: "2025-03-07",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: [
            "zachary",
            "eurasia",
            "v2",
            "ep4"
        ],
        title: "Episode 4",
        author: "zachary",
        year: "2025",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["Eurasia", "Alternative History", "Future", "Episode 4"],
        worldCreator: "Zachary",
        map: {
            name: "Eurasia by Zachary",
            id: "zachary_eurasia_v2"
        },
        awards: [],
        publishDate: "2025-03-07",
        lastUpdate: "2025-03-07",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: [
            "zachary",
            "eurasia",
            "v2",
            "fac"
        ],
        title: "Fall of Constantinople",
        author: "zachary",
        year: "2077",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["Eurasia", "Post-apocalyptic", "Fallout", "Alternative History"],
        worldCreator: "Zachary",
        map: {
            name: "Eurasia by Zachary",
            id: "zachary_eurasia_v2"
        },
        awards: [],
        publishDate: "2025-03-07",
        lastUpdate: "2025-03-07",
        hiddenScore: 0,
        type: "sandbox",
        period: "future"
    },
    {
        id: [
            "zachary",
            "eurasia",
            "v2",
            "ww1"
        ],
        title: "World War 1",
        author: "zachary",
        year: "1914",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["Eurasia", "Historical", "WW1", "20th Century"],
        worldCreator: "Zachary",
        map: {
            name: "Eurasia by Zachary",
            id: "zachary_eurasia_v2"
        },
        awards: [],
        publishDate: "2025-03-07",
        lastUpdate: "2025-03-07",
        hiddenScore: 0,
        type: "sandbox",
        period: "ww1"
    },
    {
        id: [
            "zachary",
            "eurasia",
            "v2",
            "nw"
        ],
        title: "Napoleonic War",
        author: "zachary",
        year: "2025",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["Eurasia", "Alternative History", "Nuclear War", "Post-apocalyptic"],
        worldCreator: "Zachary",
        map: {
            name: "Eurasia by Zachary",
            id: "zachary_eurasia_v2"
        },
        awards: [],
        publishDate: "2025-03-07",
        lastUpdate: "2025-03-07",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: [
            "zachary",
            "world",
            "v1",
            "islam"
        ],
        title: "Islamic World",
        author: "zachary",
        year: "632",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["World", "Historical", "Islam", "7th Century", "Medieval"],
        worldCreator: "Zachary",
        map: {
            name: "World by Zachary",
            id: "zachary_world_v1"
        },
        awards: [],
        publishDate: "2025-03-07",
        lastUpdate: "2025-03-07",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: [
            "zachary",
            "world",
            "v1",
            "revolutionary-war"
        ],
        title: "American Revolution",
        author: "zachary",
        year: "1776",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["World", "Historical", "American Revolution", "18th Century"],
        worldCreator: "Zachary",
        map: {
            name: "World by Zachary",
            id: "zachary_world_v1"
        },
        awards: [],
        publishDate: "2025-03-07",
        lastUpdate: "2025-03-07",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: [
            "zachary",
            "world",
            "v1",
            "ww1"
        ],
        title: "World War 1",
        author: "zachary",
        year: "1914",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["World", "Historical", "WW1", "20th Century"],
        worldCreator: "Zachary",
        map: {
            name: "World by Zachary",
            id: "zachary_world_v1"
        },
        awards: [],
        publishDate: "2025-03-07",
        lastUpdate: "2025-03-07",
        hiddenScore: 0,
        type: "sandbox",
        period: "ww1"
    },
    {
        id: [
            "zachary",
            "world",
            "v1",
            "ww2z"
        ],
        title: "World War 2",
        author: "zachary",
        year: "1936",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["World", "Alternative History", "WW2", "Zombies"],
        worldCreator: "Zachary",
        map: {
            name: "World by Zachary",
            id: "zachary_world_v1"
        },
        awards: [],
        publishDate: "2025-03-27",
        lastUpdate: "2025-03-27",
        hiddenScore: 0,
        type: "sandbox",
        period: "ww2"
    },
    {
        id: [
            "zachary",
            "usa",
            "v1",
            "2025"
        ],
        title: "USA 2025",
        author: "zachary",
        year: "2025",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["USA", "Modern Day", "2025"],
        worldCreator: "Zachary",
        map: {
            name: "USA by Zachary",
            id: "zachary_usa_v1"
        },
        awards: [],
        publishDate: "2025-01-21",
        lastUpdate: "2025-01-21",
        hiddenScore: 0,
        type: "sandbox",
        period: "modern"
    },
    {
        id: [
            "zachary",
            "usa",
            "v1",
            "civil"
        ],
        title: "American Civil War",
        author: "zachary",
        year: "1861",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["USA", "Historical", "Civil War", "19th Century"],
        worldCreator: "Zachary",
        map: {
            name: "USA by Zachary",
            id: "zachary_usa_v1"
        },
        awards: [],
        publishDate: "2025-02-02",
        lastUpdate: "2025-02-02",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: [
            "zachary",
            "usa",
            "v1",
            "ethnic"
        ],
        title: "USA Ethnic Map",
        author: "zachary",
        year: "2020",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["USA", "Modern Day", "Ethnic Groups", "Demographics"],
        worldCreator: "Zachary",
        map: {
            name: "USA by Zachary",
            id: "zachary_usa_v1"
        },
        awards: [],
        publishDate: "2025-01-23",
        lastUpdate: "2025-01-23",
        hiddenScore: 0,
        type: "sandbox",
        period: "modern"
    },
    {
        id: [
            "zachary",
            "world",
            "v1",
            "kaiserreich",
        ],
        title: "Kaiserreich",
        author: "totska",
        year: "1936",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["World", "Alternative History", "Kaiserreich"],
        worldCreator: "ЕЕнот",
        map: {
            name: "World by Zachary",
            id: "zachary_world_v1"
        },
        awards: ["enot"],
        // Hidden parameters
        publishDate: "2025-04-14",
        lastUpdate: "2025-04-14",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: [
            "zachary",
            "world",
            "v1",
            "kalterkrieg",
        ],
        title: "Kalterkrieg",
        author: "totska",
        year: "1948",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["World", "Alternative History", "Kalterkrieg"],
        worldCreator: "ЕЕнот",
        map: {
            name: "World by Zachary",
            id: "zachary_world_v1"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2025-04-14",
        lastUpdate: "2025-04-14",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: [
            "jalhund",
            "europe",
            "vg",
            "1941",
        ],
        title: "Великая Отечественная Война",
        author: "pelo",
        year: "1941",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: ["Europe", "Historical", "WW2", "1941"],
        worldCreator: "ЕЕнот",
        map: {
            name: "Standart Europe",
            id: "jalhund_europe_vg"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2024-07-01",
        lastUpdate: "2024-07-01",
        hiddenScore: 0,
        type: "sandbox",
        period: "ww2"
    },
    {
        id: [
            "jalhund",
            "europe",
            "vg",
            "modern-ru",
        ],
        title: "Современный Мир",
        author: "pelo",
        year: "2020",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: ["Europe", "Historical", "Modern", "2020"],
        worldCreator: "ЕЕнот",
        map: {
            name: "Standart Europe",
            id: "jalhund_europe_vg"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2024-06-14",
        lastUpdate: "2024-06-14",
        hiddenScore: 0,
        type: "sandbox",
        period: "modern"
    },
    {
        id: [
            "jalhund",
            "europe",
            "vg",
            "modern-en",
        ],
        title: "Modern World",
        author: "pelo",
        year: "2020",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["Europe", "Historical", "Modern", "2020"],
        worldCreator: "ЕЕнот",
        map: {
            name: "Standart Europe",
            id: "jalhund_europe_vg"
        },
        awards: ["star","enot"],
        // Hidden parameters
        publishDate: "2024-06-14",
        lastUpdate: "2024-06-14",
        hiddenScore: 0,
        type: "sandbox",
        period: "modern"
    },
    {
        id: [
            "jalhund",
            "europe",
            "vg",
            "1985",
        ],
        title: "Холодная Война",
        author: "pelo",
        year: "1985",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: ["Europe", "Historical"],
        worldCreator: "ЕЕнот",
        map: {
            name: "Standart Europe",
            id: "jalhund_europe_vg"
        },
        awards: ["enot"],
        // Hidden parameters
        publishDate: "2024-07-01",
        lastUpdate: "2024-07-01",
        hiddenScore: 0,
        type: "sandbox",
        period: "cw"
    },
    {
        id: [
            "jalhund",
            "europe",
            "vg",
            "nw-ru",
        ],
        title: "Северная Война",
        author: "pelo",
        year: "1700",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: ["Europe", "Historical"],
        worldCreator: "ЕЕнот",
        map: {
            name: "Standart Europe",
            id: "jalhund_europe_vg"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2024-04-12",
        lastUpdate: "2024-04-12",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: [
            "jalhund",
            "europe",
            "vg",
            "nw-en",
        ],
        title: "Northern War",
        author: "pelo",
        year: "1700",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["Europe", "Historical"],
        worldCreator: "ЕЕнот",
        map: {
            name: "Standart Europe",
            id: "jalhund_europe_vg"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2024-04-12",
        lastUpdate: "2024-04-12",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: [
            "parkourcat",
            "euro4",
            "vg",
            "hsb",
        ],
        title: "Эллада наносит ответный удар",
        author: "pelo",
        year: "-323",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: ["Europe", "Historical", "Ancient"],
        worldCreator: "ЕЕнот",
        map: {
            name: "Euro4 Standart",
            id: "parkourcat_euro4_vg"
        },
        awards: ["50"],
        // Hidden parameters
        publishDate: "2024-02-03",
        lastUpdate: "2024-02-03",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: [
            "eenot",
            "arstotzka",
            "v2",
            "1996",
        ],
        title: "Arstotzka World - 1996",
        author: "eenot",
        year: "1996",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["World", "For Phones", "Recommended", "without events", "without reforms"],
        worldCreator: "ЕЕнот",
        map: {
            name: "World by ЕЕнот",
            id: "eenot_arstotzka_v2"
        },
        awards: ["enot"],
        // Hidden parameters
        publishDate: "2025-04-21",
        lastUpdate: "2025-05-21",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative",
    },
    {
        id: [
            "zachary",
            "world-am",
            "v1",
            "modern",
        ],
        title: "World According to Americans",
        author: "zachary",
        year: "2026",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["World", "For Phones", "without events", "without reforms"],
        map: {
            name: "World According to Americans",
            id: "zachary_world-am_v1"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2025-01-28",
        lastUpdate: "2025-02-21",
        hiddenScore: 0,
        type: "sandbox",
        period: "modern"
    },
    {
        id: [
            "zachary",
            "world-am",
            "v1",
            "ru",
        ],
        title: "Мир, со слов русских",
        author: "eenot",
        year: "2026",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: ["World", "For Phones", "without events", "without reforms"],
        map: {
            name: "World According to Americans",
            id: "zachary_world-am_v1"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2025-03-26",
        lastUpdate: "2025-03-26",
        hiddenScore: 0,
        type: "sandbox",
        period: "modern"
    },
    {
        id: [
            "eenot",
            "moldavia",
            "v1",
            "1990",
        ],
        title: "Moldavia - 1990",
        author: "eenot",
        year: "1990",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: ["For Phones", "without events", "without reforms", "Modern Day"],
        worldCreator: "ЕЕнот",
        map: {
            name: "Moldavia by ЕЕнот",
            id: "eenot_moldavia_v1"
        },
        awards: ["enot"],
        // Hidden parameters
        publishDate: "2025-04-28",
        lastUpdate: "2025-04-28",
        hiddenScore: 0,
        type: "sandbox",
        period: "modern",
        status: "in_development",
    },
    {
        id: [
            "eenot",
            "moldavia",
            "v1",
            "2025",
        ],
        title: "Moldavia - 2025",
        author: "eenot",
        year: "2025",
        languages: ["EN","RU"],
        gameMode: "Sandbox",
        tags: ["For Phones", "without events", "without reforms", "Modern Day"],
        worldCreator: "ЕЕнот",
        map: {
            name: "Moldavia by ЕЕнот",
            id: "eenot_moldavia_v1"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2025-04-28",
        lastUpdate: "2025-04-28",
        hiddenScore: 0,
        type: "sandbox",
        period: "modern",
        status: "in_development",
    },
    {
        id: [
            "eenot",
            "moldavia",
            "v1",
            "1941",
        ],
        title: "Moldavia - 1941",
        author: "eenot",
        year: "1941",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["For Phones", "without events", "without reforms", "World War 2"],
        worldCreator: "ЕЕнот",
        map: {
            name: "Moldavia by ЕЕнот",
            id: "eenot_moldavia_v1"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2025-04-28",
        lastUpdate: "2025-04-28",
        hiddenScore: 0,
        type: "sandbox",
        period: "ww2",
        status: "in_development",
    },
    {
        id: [
            "eenot",
            "moldavia",
            "v1",
            "1944",
        ],
        title: "Moldavia - 1944",
        author: "eenot",
        year: "1944",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: ["For Phones", "without events", "without reforms", "World War 2"],
        worldCreator: "ЕЕнот",
        map: {
            name: "Moldavia by ЕЕнот",
            id: "eenot_moldavia_v1"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2025-04-28",
        lastUpdate: "2025-04-28",
        hiddenScore: 0,
        type: "sandbox",
        period: "ww2",
        status: "in_development",
    },
    {
        id: [
            "eenot",
            "world",
            "v1",
            "ww1",
        ],
        title: "World War 1",
        author: "totoska",
        year: "1914",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["World", "Historical", "WW1"],
        worldCreator: "ЕЕнот",
        awards: ["star","enot"],
        // Hidden parameters
        publishDate: "2025-05-01",
        lastUpdate: "2025-05-01",
        hiddenScore: 10,
        type: "sandbox",
        period: "ww1"
    },
    {
        id: [
            "bluepum",
            "enaatme",
            "v2",
            "1444-atharva",
        ],
        title: "1444",
        author: "atharva",
        year: "1444",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [],
        worldCreator: "ЕЕнот",
        map: {
            name: "Europe+ by BluePum",
            id: "bluepum_enaatme_v2"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2025-04-30",
        lastUpdate: "2025-04-30",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: [
            "bluepum",
            "enaatme",
            "v5",
            "modern-atharva",
        ],
        title: "Modern",
        author: "atharva",
        year: "2025",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [],
        worldCreator: "ЕЕнот",
        map: {
            name: "Europe+ by BluePum",
            id: "bluepum_enaatme_v5"
        },
        awards: ["star","enot"],
        // Hidden parameters
        publishDate: "2025-04-29",
        lastUpdate: "2025-05-20",
        hiddenScore: 0,
        type: "sandbox",
        period: "modern"
    },
    {
        id: [
            "bluepum",
            "enaatme",
            "v2",
            "fc",
        ],
        title: "First coalition of france",
        author: "atharva",
        year: "1792",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [],
        worldCreator: "ЕЕнот",
        map: {
            name: "Europe+ by BluePum",
            id: "bluepum_enaatme_v2"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2025-04-30",
        lastUpdate: "2025-04-30",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: [
            "bluepum",
            "enaatme",
            "v4",
            "1991",
        ],
        title: "1991",
        author: "atharva",
        year: "2025",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [],
        worldCreator: "ЕЕнот",
        map: {
            name: "Europe+ by BluePum",
            id: "bluepum_enaatme_v4"
        },
        awards: ["star","enot"],
        // Hidden parameters
        publishDate: "2025-05-02",
        lastUpdate: "2025-05-03",
        hiddenScore: 0,
        type: "sandbox",
        period: "modern"
    },
    {
        id: [
            "bluepum",
            "enaatme",
            "v5",
            "ww1",
        ],
        title: "World War 1",
        author: "bluepum",
        year: "1914",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [],
        worldCreator: "ЕЕнот",
        map: {
            name: "Europe+ by BluePum",
            id: "bluepum_enaatme_v5"
        },
        awards: ["star","enot"],
        // Hidden parameters
        publishDate: "2025-05-02",
        lastUpdate: "2025-05-15",
        hiddenScore: 0,
        type: "sandbox",
        period: "ww1"
    },
    {
        id: [
            "bluepum",
            "enaatme",
            "v1",
            "ww2",
        ],
        title: "World War 2",
        author: "radardev",
        year: "1936",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [],
        worldCreator: "ЕЕнот",
        map: {
            name: "Europe+ by BluePum",
            id: "bluepum_enaatme_v1"
        },
        awards: ["star","enot"],
        // Hidden parameters
        publishDate: "2025-04-27",
        lastUpdate: "2025-04-27",
        hiddenScore: 0,
        type: "sandbox",
        period: "ww2"
    },
    {
        id: [
            "bluepum",
            "enaatme",
            "v2",
            "cw",
        ],
        title: "Cold War",
        author: "zachary",
        year: "1964",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [],
        worldCreator: "ЕЕнот",
        map: {
            name: "Europe+ by BluePum",
            id: "bluepum_enaatme_v2"
        },
        awards: ["enot"],
        // Hidden parameters
        publishDate: "2025-04-29",
        lastUpdate: "2025-04-29",
        hiddenScore: 0,
        type: "sandbox",
        period: "cw"
    },
    {
        id: [
            "zachary",
            "deadhand",
            "v1",
            "2022",
        ],
        title: "Dead Hand | Aftermath of WW3",
        author: "zachary",
        year: "2022",
        languages: ["EN"],
        gameMode: "Historical",
        tags: [],
        worldCreator: "ЕЕнот",
        map: {
            name: "Dead Hand by BluePum",
            id: "zachary_deadhand_v1"
        },
        awards: ["enot"],
        // Hidden parameters
        publishDate: "2025-05-07",
        lastUpdate: "2025-05-07",
        hiddenScore: 0,
        type: "historical",
        period: "alternative"
    },
    {
        id: [
            "bluepum",
            "enaatme",
            "v4",
            "ww2",
        ],
        title: "World War 2",
        author: "bluepum",
        year: "1936",
        languages: ["EN", "RU"],
        gameMode: "Sandbox",
        tags: [],
        worldCreator: "ЕЕнот",
        map: {
            name: "Europe+ by BluePum",
            id: "bluepum_enaatme_v2"
        },
        awards: ["enot"],
        // Hidden parameters
        publishDate: "2025-05-07",
        lastUpdate: "2025-05-07",
        hiddenScore: 0,
        type: "sandbox",
        period: "ww2"
    },
    {
        id: [
            "bluepum",
            "enaatme",
            "v5",
            "1683",
        ],
        title: "Great Turkish War",
        author: "bluepum",
        year: "1683",
        languages: ["EN", "RU"],
        gameMode: "Sandbox",
        tags: [],
        worldCreator: "ЕЕнот",
        map: {
            name: "Europe+ by BluePum",
            id: "bluepum_enaatme_v5"
        },
        awards: ["enot"],
        // Hidden parameters
        publishDate: "2025-05-16",
        lastUpdate: "2025-05-16",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: [
            "stewardconstruct",
            "europe",
            "v1",
            "ww1",
        ],
        title: "World War 1",
        author: "stewardconstruct",
        year: "1914",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [],
        worldCreator: "ЕЕнот",
        map: {
            name: "Europe by Public nuisance 🇷🇸☦",
            id: "stewardconstruct_europe_v1"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2025-05-07",
        lastUpdate: "2025-05-07",
        hiddenScore: 0,
        type: "sandbox",
        period: "ww1"
    },
    {
        id: [
            "stewardconstruct",
            "europe",
            "v1",
            "ww2",
        ],
        title: "World War 2",
        author: "stewardconstruct",
        year: "1936",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [],
        worldCreator: "ЕЕнот",
        map: {
            name: "Europe by Public nuisance 🇷🇸☦",
            id: "stewardconstruct_europe_v1"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2025-05-07",
        lastUpdate: "2025-05-07",
        hiddenScore: 0,
        type: "sandbox",
        period: "ww2"
    },
    {
        id: [
            "stewardconstruct",
            "serbia",
            "v1",
            "regions",
        ],
        title: "Regions of Serbia",
        author: "stewardconstruct",
        year: "2025",
        languages: ["other"],
        gameMode: "Sandbox",
        tags: [],
        worldCreator: "ЕЕнот",
        map: {
            name: "",
            id: "stewardconstruct_serbia_v1"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2025-03-15",
        lastUpdate: "2025-03-15",
        hiddenScore: 0,
        type: "sandbox",
        period: "modern"
    },
    {
        id: [
            "stewardconstruct",
            "yugoslavia",
            "v1",
            "modern",
        ],
        title: "West Balkans / Yugoslavia",
        author: "stewardconstruct",
        year: "2025",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [],
        worldCreator: "ЕЕнот",
        map: {
            name: "",
            id: "stewardconstruct_yugoslavia_v1"
        },
        awards: [],
        // Hidden parameters
        publishDate: "2025-03-19",
        lastUpdate: "2025-03-19",
        hiddenScore: -250,
        type: "sandbox",
        period: "modern",
        status: "discontinued"
    },
    {
        id: [
            "pelo",
            "greece",
            "v1",
            "corinthian-war",
        ],
        title: "Коринфская война",
        author: "pelo",
        year: "-395",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: ["Europe", "Historical", "Ancient"],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2024-06-09",
        lastUpdate: "2024-06-09",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: [
            "pelo",
            "greece",
            "v1",
            "grcirn-war",
        ],
        title: "Греко-Персидская война",
        author: "pelo",
        year: "-480",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: ["Europe", "Historical", "Ancient"],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2024-06-07",
        lastUpdate: "2024-06-07",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: [
            "pelo",
            "greece",
            "v1",
            "macedonia",
        ],
        title: "Начало возвышения Македонии",
        author: "pelo",
        year: "-355",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: ["Europe", "Historical", "Ancient"],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2024-06-29",
        lastUpdate: "2024-06-29",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: [
            "pelo",
            "greece",
            "v1",
            "persiainvasion-war",
        ],
        title: "Греко-Персидская воина",
        author: "pelo",
        year: "-480",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: ["Europe", "Historical", "Ancient"],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2024-06-07",
        lastUpdate: "2024-06-07",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: [
            "pelo",
            "greece",
            "v1",
            "peloponessian-war",
        ],
        title: "Пелопонесская война",
        author: "pelo",
        year: "-431",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: ["Europe", "Historical", "Ancient"],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2024-06-08",
        lastUpdate: "2024-06-08",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: [
            "pelo",
            "greece",
            "v1",
            "persiainvasion-war-en",
        ],
        title: "Sacred war of Hellada",
        author: "pelo",
        year: "-480",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: ["Europe", "Historical", "Ancient"],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2025-05-11",
        lastUpdate: "2025-05-11",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: [
            "trid",
            "archangelsk",
            "v1",
            "!",
        ],
        title: "Archangelsk",
        author: "trid",
        year: "2009",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: ["Russia", "Modern Day", "Archangelsk"],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2024-02-04",
        lastUpdate: "2024-02-04",
        hiddenScore: 0,
        type: "sandbox",
        period: "modern"
    },
    {
        id: [
            "chuckcha",
            "europe",
            "v1",
            "1328",
        ],
        title: "1328",
        author: "chuckcha",
        year: "1328",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2023-11-21",
        lastUpdate: "2023-11-21",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: [
            "chuckcha",
            "europe",
            "v1",
            "1444",
        ],
        title: "1444",
        author: "jaba",
        year: "1444",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2024-02-24",
        lastUpdate: "2024-02-24",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: [
            "jaba",
            "asia",
            "v1",
            "1444",
        ],
        title: "1444 Asia",
        author: "jaba",
        year: "1444",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2024-02-23",
        lastUpdate: "2024-02-23",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: [
            "jaba",
            "asia",
            "v1",
            "1904",
        ],
        title: "Russo-Japanese War (generals)",
        author: "jaba",
        year: "1904",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2024-03-19",
        lastUpdate: "2024-03-19",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: [
            "jaba",
            "asia",
            "v1",
            "1945",
        ],
        title: "1945 Asia",
        author: "jaba",
        year: "1945",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2024-03-19",
        lastUpdate: "2024-03-19",
        hiddenScore: 0,
        type: "sandbox",
        period: "cw"
    },
    {
        id: [
            "jaba",
            "asia",
            "v1",
            "ww2",
        ],
        title: "World War 2 in Asia",
        author: "jaba",
        year: "1936",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2024-04-22",
        lastUpdate: "2024-04-22",
        hiddenScore: 0,
        type: "sandbox",
        period: "ww2"
    },
    {
        id: [
            "jalhund",
            "lp16",
            "v1",
            "!",
        ],
        title: "LP-16 by Jalhund",
        author: "jalhund",
        year: "0",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2023-06-12",
        lastUpdate: "2023-06-12",
        hiddenScore: 0,
        type: "sandbox",
        period: "other"
    },
    {
        id: [
            "trid",
            "eurosat",
            "v5",
            "modern",
        ],
        title: "Modern Europe",
        author: "trid",
        year: "2023",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: ["enot", "star"],
        // Hidden parameters
        publishDate: "2024-03-27",
        lastUpdate: "2024-04-06",
        hiddenScore: 0,
        type: "sandbox",
        period: "modern"
    },
    {
        id: [
            "trid",
            "eurosat",
            "v5",
            "ww1",
        ],
        title: "World War I",
        author: "trid",
        year: "1914",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: ["enot", "star"],
        // Hidden parameters
        publishDate: "2024-03-27",
        lastUpdate: "2024-04-06",
        hiddenScore: 0,
        type: "sandbox",
        period: "ww1"
    },
    {
        id: [
            "trid",
            "eurosat",
            "v5",
            "ww2",
        ],
        title: "World War II",
        author: "trid",
        year: "1936",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: ["enot", "star"],
        // Hidden parameters
        publishDate: "2024-03-27",
        lastUpdate: "2024-04-06",
        hiddenScore: 0,
        type: "sandbox",
        period: "ww2"
    },
    {
        id: [
            "trid",
            "eurosat",
            "v5",
            "1444",
        ],
        title: "1444",
        author: "trid",
        year: "1444",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2024-03-27",
        lastUpdate: "2024-03-27",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: [
            "trid",
            "eurosat",
            "v5",
            "interbellum",
        ],
        title: "After Great War",
        author: "trid",
        year: "1917",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2024-03-27",
        lastUpdate: "2024-03-27",
        hiddenScore: 0,
        type: "sandbox",
        period: "interbellum"
    },
    {
        id: [
            "trid",
            "eurosat",
            "v5",
            "tno",
        ],
        title: "The New Order",
        author: "trid",
        year: "1950",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: ["enot"],
        // Hidden parameters
        publishDate: "2024-03-27",
        lastUpdate: "2024-03-27",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: [
            "trid",
            "eurosat",
            "v5",
            "cw",
        ],
        title: "Iron Certains",
        author: "trid",
        year: "1955",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2024-03-27",
        lastUpdate: "2024-03-27",
        hiddenScore: 0,
        type: "sandbox",
        period: "cw"
    },
    {
        id: [
            "trid",
            "eurosat",
            "v5",
            "kaizerreich",
        ],
        title: "Kaizerreich",
        author: "trid",
        year: "1914",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2024-03-27",
        lastUpdate: "2024-03-27",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: [
            "trid",
            "eurosat",
            "v5",
            "kaizerreich",
        ],
        title: "Kaizerreich",
        author: "trid",
        year: "1914",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2024-04-05",
        lastUpdate: "2024-04-05",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: [
            "trid",
            "eurosat",
            "v5",
            "eor",
        ],
        title: "Era of Reborn",
        author: "trid",
        year: "1959",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2024-04-21",
        lastUpdate: "2024-04-21",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: [
            "trid",
            "eurosat",
            "v5",
            "1000",
        ],
        title: "The thousands of Europe",
        author: "jaba",
        year: "1000",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2024-05-29",
        lastUpdate: "2024-05-29",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: [
            "jaba",
            "korea",
            "v2",
            "1950",
        ],
        title: "Korea 1950",
        author: "jaba",
        year: "1950",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2023-03-29",
        lastUpdate: "2023-10-01",
        hiddenScore: 0,
        type: "sandbox",
        period: "cw"
    },
    {
        id: [
            "jaba",
            "korea",
            "v2",
            "1953",
        ],
        title: "Korea 1953",
        author: "esteban",
        year: "1953",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2023-10-01",
        lastUpdate: "2023-10-01",
        hiddenScore: 0,
        type: "sandbox",
        period: "cw"
    },
    {
        id: [
            "trid",
            "ukraine",
            "v2",
            "2021",
        ],
        title: "Ukraine 2021",
        author: "trid",
        year: "2021",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: ["star", "enot"],
        // Hidden parameters
        publishDate: "2024-09-15",
        lastUpdate: "2024-09-15",
        hiddenScore: 0,
        type: "sandbox",
        period: "modern"
    },
    {
        id: [
            "trid",
            "ukraine",
            "v2",
            "2024",
        ],
        title: "Ukraine 2024",
        author: "trid",
        year: "2024",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2024-09-15",
        lastUpdate: "2024-09-15",
        hiddenScore: 0,
        type: "sandbox",
        period: "modern"
    },
    {
        id: [
            "trid",
            "ukraine",
            "v2",
            "holoborodko",
        ],
        title: "Ukraine Слуга Народа",
        author: "kolkhoznik",
        year: "2023",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: ["star", "enot"],
        // Hidden parameters
        publishDate: "2024-12-04",
        lastUpdate: "2024-12-04",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: [
            "jaba",
            "america",
            "vg",
            "1862",
        ],
        title: "1862 America",
        author: "jaba",
        year: "1862",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2023-10-19",
        lastUpdate: "2023-10-19",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: [
            "jaba",
            "america",
            "vg",
            "modern",
        ],
        title: "Modern America",
        author: "jaba",
        year: "2023",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2023-10-19",
        lastUpdate: "2023-10-19",
        hiddenScore: 0,
        type: "sandbox",
        period: "modern"
    },
    {
        id: [
            "jaba",
            "america",
            "vg",
            "modern",
        ],
        title: "Modern America",
        author: "jaba",
        year: "2023",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2023-10-19",
        lastUpdate: "2023-10-19",
        hiddenScore: 0,
        type: "sandbox",
        period: "modern"
    },
    {
        id: [
            "jaba",
            "america",
            "vg",
            "1492",
        ],
        title: "1492 America",
        author: "jaba",
        year: "1492",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2023-10-19",
        lastUpdate: "2023-10-19",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
    {
        id: [
            "chuckcha",
            "tigerland",
            "v1",
            "civilwar",
        ],
        title: "Тигерленд",
        author: "chuckcha",
        year: "2024",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2023-10-13",
        lastUpdate: "2023-10-28",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: [
            "chuckcha",
            "tigerland",
            "v1",
            "civilwar-en",
        ],
        title: "Tigerland",
        author: "chuckcha",
        year: "2024",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2023-10-13",
        lastUpdate: "2023-10-16",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: [
            "chuckcha",
            "tigerland",
            "v1",
            "civilwar-expanded",
        ],
        title: "Expanded Tigerland",
        author: "chuckcha",
        year: "2024",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2024-02-09",
        lastUpdate: "2024-10-16",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: [
            "chuckcha",
            "tigerland",
            "v1",
            "civilwar-jalhund-en",
        ],
        title: "Tigerland by Jalhund",
        author: "jalhund",
        year: "2024",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2024-02-10",
        lastUpdate: "2024-02-10",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: [
            "chuckcha",
            "tigerland",
            "v1",
            "civilwar-jalhund",
        ],
        title: "Тигерленд by Jalhund",
        author: "jalhund",
        year: "2024",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2024-02-10",
        lastUpdate: "2024-02-10",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: [
            "chuckcha",
            "tigerland",
            "v2",
            "civilwar-jalhund-en",
        ],
        title: "Tigerland by Jalhund",
        author: "jalhund",
        year: "2024",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2024-02-10",
        lastUpdate: "2024-11-18",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: [
            "chuckcha",
            "tigerland",
            "v3",
            "civilwar-jalhund-en",
        ],
        title: "Tigerland by Jalhund",
        author: "jalhund",
        year: "2024",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [""],
        worldCreator: "ЕЕнот",
        awards: ["star", "enot"],
        // Hidden parameters
        publishDate: "2024-02-10",
        lastUpdate: "2024-12-08",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: [
            "chuckcha",
            "tigerland",
            "v3",
            "civilwar",
        ],
        title: "Classic Tigerland",
        author: "trid",
        year: "2024",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [],
        worldCreator: "ЕЕнот",
        awards: ["star", "enot"],
        // Hidden parameters
        publishDate: "2025-01-17",
        lastUpdate: "2025-01-17",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: [
            "mapmancer",
            "centaura",
            "v1",
            "!",
        ],
        title: "Centaura",
        author: "mapmancer",
        year: "1910",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2025-04-13",
        lastUpdate: "2025-04-13",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: [
            "mapmancer",
            "centaura",
            "v1",
            "dystopian",
        ],
        title: "Centaura 1984",
        author: "radardev",
        year: "1994",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2025-04-13",
        lastUpdate: "2025-04-13",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: [
            "bluepum",
            "world",
            "v2",
            "!",
        ],
        title: "World with Lost Continents",
        author: "bluepum",
        year: "0",
        languages: ["EN", "RU"],
        gameMode: "Sandbox",
        tags: [],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2025-05-26", 
        lastUpdate: "2025-05-27",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: [
            "bluepum",
            "atlantis",
            "v2",
            "regions",
        ],
        title: "Atlantis",
        author: "bluepum",
        year: "2025",
        languages: ["EN"],
        gameMode: "Sandbox",
        tags: [],
        worldCreator: "ЕЕнот",
        awards: [],
        // Hidden parameters
        publishDate: "2025-05-31", 
        lastUpdate: "2025-05-31",
        hiddenScore: 0,
        type: "sandbox",
        period: "alternative"
    },
    {
        id: [
            "pelo",
            "euam",
            "v1",
            "1492",
        ],
        title: "Завоевание рая - Europe and America",
        author: "pelo",
        year: "1492",
        languages: ["RU"],
        gameMode: "Sandbox",
        tags: [],
        worldCreator: "ЕЕнот",
        awards: ["star"],
        // Hidden parameters
        publishDate: "2025-06-02", 
        lastUpdate: "2025-06-02",
        hiddenScore: 0,
        type: "sandbox",
        period: "ancient"
    },
];

console.log("Данные сценариев загружены");