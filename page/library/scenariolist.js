const inGameMaps = [
    "jalhund_europe_vg",
    "jaba_america_vg",
    "parcoucat_euro4_vg",
];

const awardScores = {
    "star": 25,
    "enot": 50,
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
        author: {
            name: "@eenot",
            link: "https://discord.com/users/794675642037567491",
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
        id: [
            "jalhund",
            "europe",
            "vg",
            "new_revolution",
        ],
        title: "New Revolution",
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
        id: [
            "eenot",
            "world",
            "v1",
            "ww2",
        ],
        title: "World War 2",
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
        id: [
            "eenot",
            "world",
            "v1",
            "cw",
        ],
        title: "The Cold War",
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
        id: [
            "eenot",
            "world",
            "v1",
            "1984",
        ],
        title: "1984",
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
        id: [
            "estebanf259",
            "euromagnus",
            "v1",
            "1444",
        ],
        title: "1444",
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
        id: [
            "parkourcat",
            "euro4",
            "vg",
            "pick-roman-empire",
        ],
        title: "The peak of the Roman Empire",
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
        id: [
            "shahz0d",
            "world",
            "v1",
            "shw",
        ],
        title: "The Seven Hours War",
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
        id: [
            "zachary",
            "eurasia",
            "v1",
            "kaiserreich",
        ],
        title: "Kaiserreich",
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
        id: [
            "zachary",
            "eurasia",
            "v1",
            "modern",
        ],
        title: "Modern Day",
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
        id: [
            "zachary",
            "eurasia",
            "v1",
            "tno",
        ],
        title: "The New Order",
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
        id: [
            "zachary",
            "world",
            "v1",
            "ww2",
        ],
        title: "World War 2",
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
        id: [
            "enotochel",
            "pvp",
            "v1",
            "1-1",
        ],
        title: "1v1 Warnament",
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
        id: [
            "enotochel",
            "pvp",
            "v1",
            "1-1-watcher",
        ],
        title: "1v1 Warnament (+Watcher)",
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
        downloadUrl: "${libLink}lib/scenarios/estebanf259_world-redux_v2_cw.json",
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
        downloadUrl: "${libLink}lib/scenarios/estebanf259_world-redux_v2_modern.json",
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
        downloadUrl: "${libLink}lib/scenarios/estebanf259_world-redux_v2_hoi4-formables.json",
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
        downloadUrl: "${libLink}lib/scenarios/estebanf259_world-redux_v2_1218.json",
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
        downloadUrl: "${libLink}lib/scenarios/estebanf259_world-redux_v2_1756.json",
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
        downloadUrl: "${libLink}lib/scenarios/zachary_world-3ga_v1_continents.json",
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

console.log("Данные сценариев загружены");