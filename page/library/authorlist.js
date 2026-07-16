function truncateAuthorName(name, maxLength = 10) {
    try {
        if (name == null) return '';
        if (name.length <= maxLength) return name;
        return name.substring(0, maxLength) + '...';
    } catch (error) {
        console.error('Error truncating author name:', error, name);
        return ' '; // Fallback to original name if error occurs
    }
}

const authorsData = {
    eenot: {
        name: "@eenot",
        link: "https://discord.com/users/794675642037567491",
        color: "#3B83BD",
        rights: true
    },
    theman_the_myth_the_legend: {
        name: "@theman_the_myth_the_legend",
        link: "https://discord.com/users/1083919275951149118",
        color: "#3B83BD",
        rights: true
    },
    helvetic_brutalisation: {
        name: "@helvetic_brutalisation",
        link: "https://discord.com/users/1280887382920532073",
        color: "#3B83BD",
        rights: true
    },
    totoska: {
        name: "@Totoska",
        link: "https://discord.com/users/820194328201920524",
        color: "#3B83BD",
        rights: true
    },
    kolkhoznik: {
        name: "@Колхозник",
        link: "https://discord.com/users/1057029940484247682",
        color: "#3B83BD",
        rights: true
    },
    esteban: {
        name: "@Esteban",
        link: "https://discord.com/users/456226577798135808",
        color: "#FF83BD"
    },
    esteban259: {
        name: "@Esteban259",
        link: "https://discord.com/users/456226577798135808",
        color: "#FF83BD"
    },
    zachary: {
        name: "@zachary",
        link: "https://discord.com/users/804839006403428423",
        color: "#3B83BD",
        rights: true
    },
    pelo: {
        name: "@pelo3918",
        link: "https://discord.com/users/1071700840492056717",
        color: "#3B83BD",
        rights: true
    },
    atharva: {
        name: "@atharva04303",
        link: "https://discord.com/users/1306545186146353193",
        color: "#3B83BD",
        rights: true
    },
    bluepum: {
        name: "@blue_pum_67269",
        link: "https://discord.com/users/1260558860796825610",
        color: "#3B83BD",
        rights: true
    },
    radardev: {
        name: "@radardev",
        link: "https://discord.com/users/951467148063158324",
        color: "#3B83BD",
        rights: true
    },
    stewardconstruct: {
        name: "@stewardconstruct",
        link: "https://discord.com/users/1114590604668706927",
        color: "#3B83BD",
        rights: true
    },
    trid: {
        name: "@Trid",
        link: "https://discord.com/users/993585215358386306",
        color: "#FF83BD",
        rights: true
    },
    jaba: {
        name: "@jaba4275",
        link: "https://discord.com/users/921793805915668520",
        color: "#3B83BD",
        rights: true
    },
    parkourcat: {
        name: "@parkourfox",
        link: "https://discord.com/users/921793805915668520",
        color: "#3B83BD"
    },
    jalhund: {
        name: "@jalhund",
        link: "https://discord.com/users/277053272959008768",
        color: "#3B83BD",
        rights: true
    },
    chuckcha: {
        name: "@chuckha",
        link: "https://discord.com/users/896347314615123978",
        color: "#3B83BD"
    },
    jombone: {
        name: "@.jombonethegreat",
        link: "https://discord.com/users/702259308817285220",
        color: "#3B83BD"
    },
    mapmancer: {
        name: "@stilltrex",
        link: "https://discord.com/users/950707094229766174",
        color: "#3B83BD",
        rights: true
    },
    chitterss: {
        name: "@Chitteress",
        link: "https://discord.com/users/611870107970568214",
        color: "#FF83BD"
    },
    eeditor: {
        name: "@EEditor",
        link: "https://discord.gg/s5JgHChaQE",
        color: "#efe927ff",
        rights: true
    },
    astroja: {
        name: "@astroja",
        link: "https://discord.com/users/714028605188997172",
        color: "#3B83BD"
    },
    argentumm: {
        name: "@argentumm",
        link: "https://discord.com/users/1030812623232581674",
        color: "#3B83BD"
    },
    eleven: {
        name: "@eleven141",
        link: "https://discord.com/users/913765004325572609",
        color: "#3B83BD"
    },
    dener: {
        name: "@denerfox",
        link: "https://discord.com/users/775753842528747581",
        color: "#3B83BD"
    },
    enotochel: {
        name: "@enotochel",
        link: "https://discord.com/users/714176620931448913",
        color: "#3B83BD"
    },
    joker: {
        name: "@1j0ker3",
        link: "https://discord.com/users/602798356133052456",
        color: "#3B83BD"
    },
    zloy: {
        name: "@zloi_hozain",
        link: "https://discord.com/users/962955511203000351",
        color: "#3B83BD",
        rights: true
    },
    gray_car: {
        name: "@gray_car",
        link: "https://discord.com/users/1260611002240860202",
        color: "#3B83BD",
        rights: true
    },
    fredstein: {
        name: "@fred.stein",
        link: "https://discord.com/users/814856713105965077",
        color: "#3B83BD"
    },
    thefanfinfulo: {
        name: "@thefanfinfulo_67965",
        link: "https://discord.com/users/1288264777105408020",
        color: "#3B83BD",
        rights: true
    },
    lurus: {
        name: "@lurus",
        link: "https://discord.com/users/764533673512927242",
        color: "#3B83BD",
        rights: true
    },
    vova: {
        name: "@vova_lifi_19090",
        link: "https://discord.com/users/1376239281583951965",
        color: "#3B83BD",
        rights: true
    },
    mat: {
        name: "@Mat971345",
        link: "https://discord.com/users/946593397169324094",
        color: "#3B83BD",
        rights: true
    },
    preferablynothing: {
        name: "@PreferablyNothing",
        link: "https://discord.com/users/1325022120299860114",
        color: "#3B83BD"
    },
    gooby: {
        name: "@goobysilly",
        link: "https://discord.com/users/1362516428242161856",
        color: "#3B83BD"
    },
    shutkin: {
        name: "@Andrey Shutkin",
        link: "https://discord.com/users/613275285982281728",
        color: "#3B83BD"
    },
    greg: {
        name: "@greg👍",
        link: "https://discord.com/users/1395745707247407124",
        color: "#3B83BD",
        rights: true
    },
    manstein: {
        name: "@Manstein",
        link: "https://discord.com/users/1098662845647945808",
        color: "#3B83BD"
    },
    thehardenginerr: {
        name: "@theHardEngineer",
        link: "https://discord.com/users/1088785354699575366",
        color: "#3B83BD"
    },
    hamod: {
        name: "@Hamod_2032",
        link: "https://discord.com/users/1347239235530391552",
        color: "#3B83BD",
        rights: true
    },
    nghe: {
        name: "@nghe_",
        link: "https://discord.com/users/1051046487813013514",
        color: "#3B83BD"
    },
    mooned: {
        name: "@Mooned",
        link: "https://discord.com/users/1203679089182122037",
        color: "#3B83BD"
    },
    kaschby: {
        name: "@Kaschby",
        link: "https://discord.com/users/858627085940424735",
        color: "#3B83BD"
    },
    inka: {
        name: "@Inka",
        link: "https://discord.com/users/1050563653394505728",
        color: "#3B83BD"
    },
    dairygal: {
        name: "@DairyGal",
        link: "https://discord.com/users/1300064159320506368",
        color: "#3B83BD"
    },
    blasha: {
        name: "@BlashaSmasha",
        link: "https://discord.com/users/1201248166746538098",
        color: "#3B83BD"
    },
    paris06778: {
        name: "@paris06778",
        link: "https://discord.com/users/1509636971855872102",
        color: "#3B83BD"
    },
    stanczyk: {
        name: "@stanczyk",
        link: "https://discord.com/users/1416759554271875182",
        color: "#3B83BD",
        rights: true
    },
    titanium: {
        name: "@thetitaniumguyithink ✝",
        link: "https://discord.com/users/1253980363424923680",
        color: "#3B83BD"
    },
    grim: {
        name: "@GrimReaper54",
        link: "https://discord.com/users/720328844464357446",
        color: "#3B83BD"
    },
    pinguenis: {
        name: "@What?",
        link: "https://discord.com/users/754688516935516162",
        color: "#3B83BD"
    },
    lizardmaker: {
        name: "@deteled_user",
        link: "https://discord.com/users/754688516935516162",
        color: "#FF83BD"
    },
    youmix: {
        name: "@YouMix",
        link: "https://discord.com/users/997134387537784932",
        color: "#3B83BD"
    },
    shine: {
        name: "@.sh1ne",
        link: "https://discord.com/users/670287522701639681",
        color: "#3B83BD"
    },
    carolus: {
        name: "@Carolus",
        link: "https://discord.com/users/899727759335628850",
        color: "#3B83BD"
    },
    hitaroko: {
        name: "@Hitaroko",
        link: "https://discord.com/users/611870107970568214",
        color: "#3B83BD"
    },
    aresrussian: {
        name: "@AresRussian",
        link: "https://discord.com/users/700262353274667069",
        color: "#3B83BD"
    },
    swissmapp: {
        name: "@Swissmapp",
        link: "https://discord.com/users/810045615730982912",
        color: "#3B83BD"
    },
    likot: {
        name: "@Likot",
        link: "https://discord.com/users/791646861568114699",
        color: "#3B83BD"
    },
    shell: {
        name: "@Shell",
        link: "https://discord.com/users/456226577798135808",
        color: "#FF83BD"
    },
    strorew: {
        name: "@Strorew",
        link: "https://discord.com/users/857178749271146507",
        color: "#3B83BD"
    },
    tapner: {
        name: "@Тапнер",
        link: "https://discord.com/users/800349940114522133",
        color: "#3B83BD"
    },
    berg: {
        name: "@berg",
        link: "https://discord.com/users/731562528953598042",
        color: "#3B83BD"
    },
    vatrushka: {
        name: "@ватрушка",
        link: "https://discord.com/users/728538560503742545",
        color: "#3B83BD"
    },
    sunflower: {
        name: "@Sunflower",
        link: "https://discord.com/users/934014814882250753",
        color: "#3B83BD"
    },
    seasalt: {
        name: "@МорскаяСоль",
        link: "https://discord.com/users/893992031754543126",
        color: "#3B83BD"
    },
    quebyn: {
        name: "@quebyn",
        link: "https://discord.com/users/",
        color: "#3B83BD"
    },
    waffle: {
        name: "@Waffle",
        link: "https://discord.com/users/740176051233226764",
        color: "#3B83BD"
    },
    timka3310: {
        name: "@timka3310",
        link: "https://discord.com/users/669210458695401473",
        color: "#3B83BD"
    },
    ando: {
        name: "@Ando",
        link: "https://discord.com/users/1303395726050725958",
        color: "#3B83BD"
    },
    lobsterk: {
        name: "@Lobster K",
        link: "https://discord.com/users/884085665527123989",
        color: "#3B83BD"
    },
    zakharov: {
        name: "@Матвей Захаров",
        link: "https://discord.com/users/1222612224632160470",
        color: "#3B83BD"
    },
    deleted: {
        name: "undefined",
        link: "https://discord.com/users/456226577798135808",
        color: "#FF83BD"
    },
    neojid: {
        name: "@NeoJid",
        link: "https://discord.com/users/945007670115573871",
        color: "#3B83BD"
    },
    hinginmarat: {
        name: "@hinginmarat",
        link: "https://discord.com/users/1075765010019655762",
        color: "#3B83BD"
    },
    topkatop: {
        name: "@topkatop",
        link: "https://discord.com/users/",
        color: "#3B83BD"
    },
    ra: {
        name: "@ra",
        link: "https://discord.com/users/898142075898433546",
        color: "#3B83BD"
    },
    nagibatorchikc: {
        name: "@Nagidatorchick",
        link: "https://discord.com/users/1177261124249456774",
        color: "#3B83BD"
    },
    rokforr: {
        name: "@Rokforr",
        link: "https://discord.com/users/783508883254935563",
        color: "#3B83BD"
    },
    mir4ik: {
        name: "@mir4ik",
        link: "https://discord.com/users/",
        color: "#FF83BD"
    },
    elrond: {
        name: "@Elrond",
        link: "https://discord.com/users/",
        color: "#FF83BD"
    },
    kent52: {
        name: "@kent52",
        link: "https://discord.com/users/1225289148269596672",
        color: "#3B83BD"
    },
    maximov: {
        name: "@Maximov",
        link: "https://discord.com/users/1102997665014358107",
        color: "#3B83BD"
    },
    mrgutentag: {
        name: "@mrgutentag",
        link: "https://discord.com/users/",
        color: "#FF83BD"
    },
    catpath: {
        name: "@zeloniy_",
        link: "https://discord.com/users/1262291258341330997",
        color: "#3B83BD"
    }
}