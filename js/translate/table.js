const tableTranslations = `
Русский,English,Country,Time,Українська
Украина,Ukraine,Ukraine,Default,Україна
Советская Украина,Soviet Ukraine,Ukraine,Interbellum,Радянська Україна
Украинская Советская Социалистическая Республика,Ukrainian Society Socialist Republic,Ukraine,Cold War,Українська Радянська Соціалістична Республіка
Украинская Советская Республика,Ukrainian Soviet Republic,Ukraine,Interbellum,Українська Радянська Республікс
Украинская Народная Республика,Ukrainian People Republic,Ukraine,Interbellum,Українська Народна Республіка
Украинская Народная Республика Советов,Ukrainian People Republic of Society,Ukraine,Interbellum,Українська Народна Республіка Радянів
УНР,UPR,Ukraine,Interbellum,УНР
УНРС,UPRS,Ukraine,Interbellum,УНРР
УССР,USSR,Ukraine,Cold War,УРСР
Незалежная Украина,Independent Ukraine ,Ukraine,,Незалежна Україна
Независимая Украина,Independent Ukraine ,Ukraine,,Незалежна Україна
Украинская ССР,Ukrainian SSR,Ukraine,Cold War,Українська РСР
Украинское Королевство,Ukrainian Kingdom,Ukraine,Alternative,Українське Королівство
Украинское Царство,Ukrainian Kingdom,Ukraine,Alternative,Українське Царство
Украинский Гетьманат,Ukrainian Hetmanate,Ukraine,Alternative,Укранський Гетьманат
Украинское Панство,Ukrainian Pantry,Ukraine,Alternative,Українське Панство
Гетьманат,Hetmanate,,,Гетьманат
Запорожская Сечь,Zaporozhian Sich,Ukraine,,Запорізька Січ
Черноморское Казачье Войско,Black Sea Cossack Host,Ukraine,,Чорноморське Казацьке Військо
Крым,Crimea,Ukraine,Default,Крим
Крымская АР,Crimean AR,Ukraine,,Кримська АР
Крымская АССР,Crimean ASSR,Ukraine,Cold War,Кримська АРСР
Крымская Республика,Crimean Republic,Ukraine,,Кримська Республіка
Республика Крым,Republic of Crimea,Ukraine,Modern,Республіка Крим
Крымская Автономная Республика ,Crimean Autonomous Republic,Ukraine,,Кримська Автономна Республіка
Автономная Республика Крым,Autonomous Republic of Crimea,Ukraine,Modern,Автономна Республіка Крим
Западная Украина,Western Ukraine,Ukraine,Interbellum,Західна Україна
Западная Украинская Народная Республика ,West Ukrainian People's Republic,Ukraine,Interbellum,Західна Українська Народна Республіка
Западноукраинская Народная Республика ,West Ukrainian People's Republic,Ukraine,Interbellum,Західноукраїнська Народна Республіка
Западная Украинская Республика ,West Ukrainian Republic,Ukraine,,Західна Українська Республіка
Западноукраинская Республика,West Ukrainian Republic,Ukraine,,Західноукраїнська Республіка
Донецк,Donetsk,Ukraine,Modern,Донецьк
Луганск,Lugansk,Ukraine,Modern,Луганськ
Харьков,Kharkov,Ukraine,Alternative,Харків
Херсон,Kherson,Ukraine,Alternative,Херсон
Одесса,Odessa,Ukraine,Alternative,Одеса
Донецкая Народная Республика,Donetsk People's Republic,Ukraine,Modern,Донецька Народная Республіка
Луганская Народная Республика,Lugansk People's Republic,Ukraine,Modern,Луганська Народная Республіка
Харьковская Народная Республика,Kharkov People's Republic,Ukraine,Alternative,Харківська Народная Республіка
Херсонская Народная Республика,Kherson People's Republic,Ukraine,Alternative,Херсонська Народная Республіка
Одесская Народная Республика,Odessa People's Republic,Ukraine,Alternative,Одеська Народная Республіка
Новороссия,Newrussia,Ukraine,Modern,Новоросія
Государство Новороссия,State Newrussia,Ukraine,Modern,Держава Новоросія
Республика Новороссия,Republic of Newrussia,Ukraine,Modern,Республіка Новоросія
Южная Украина,Southern Ukraine,Ukraine,Alternative,Південна Україна
Южноукраинская Народная Республика,South-Ukrainian People's Republic,Ukraine,Alternative,Південноукраїнська Народная Республіка
Восточноукраинская Народна Республика,Eastern-Ukrainian People's Republic,Ukraine,Alternative,Східноукраїнська Народная Республіка
Левобережная Украина,Left-bank Ukraine,Ukraine,Alternative,Лівобережна Україна
Правобережная Украина,Right-bank Ukraine,Ukraine,Alternative,Правобережна Україна
Восточная Украина,Eastern Ukraine,Ukraine,Alternative,Східна Україна
Российская Украина,Russian Ukraine,Ukraine,Alternative,Російська Україна
СССР,USSR,USSR,Cold War,СРСР
Советский Союз,Soviet Union,USSR,Cold War,Радянський Союз
Союз Советских Социалистических Республик ,Union of Society Socialist Republics,USSR,Cold War,Союз Радянських Соціалістичних Республік 
Беларусь,Belarus,Belarus,Default,Білорусь
Белоруссия,Byelorussia,Belarus,Default,Білорусія
Республика Беларусь ,Republic of Belarus,Belarus,Modern,Республіка Білорусь
РБ,RB,Belarus,Modern,РБ
Белорусская Советская Республика ,Byelorussian Soviet Republic,Belarus,Interbellum,Білоруська Радянська Республіка
Белорусская Советская Социалистическая Республика ,Byelorussian Soviet Socialist Republic,Belarus,Cold War,Білоруська Радянська Соціалістична Республіка
Белорусская Народная Республика ,Byelorusian People's Republic,Belarus,Interbellum,Білоруська Народна Республіка
Советская Беларусь,Soviet Belarus,Belarus,Cold War,Радянська Білорусь
Советская Белоруссия,Soviet Byelorussia,Belarus,Cold War,Радянська Білорусія
БСР,BSR,Belarus,Interbellum,БРР
БССР,BSSR,Belarus,Cold War,БРСР
БНР,BPR,Belarus,Interbellum,БНР
Белорусская ССР,Byelorussian SSR,Belarus,Cold War,Білоруська РСР
Приднестровье,Pridnestrovie/Transnistria,Pridnestrovie,Default,Придністров'я
Приднестровская Молдавская Республика,Pridnestrovian Moldavian Republic,Pridnestrovie,Modern,Придністровська Молдавська Республіка
Приднестровская Молдавская Советская Социалистическая Республика ,Pridnestrovian Moldavian Soviet Socialist Republic,Pridnestrovie,Cold War,Придністровська Молдавська Радянська Соціалістична Республіка
ПМР,PMR,Pridnestrovie,Modern,ПМРСР
ПМССР,PMSSR,Pridnestrovie,Cold War,ПМРСР
Приднестровская МССР,Pridnestrovian MSSR,Pridnestrovie,Cold War,Придністровська МРСР
Приднестровская Молдавская ССР,Pridnestrovian Moldavian SSR,Pridnestrovie,Cold War,Придністровська Молдавська РСР
Приднестровская Народная Республика,Pridnestrovian People's Republic,Pridnestrovie,Alternative,Придністровська Народна Республіка
Польша,Poland,Poland,Default,Польша
Бобр Курва,Bobr Kurwa,Poland,,Бобр Курва
Польская Республика,Polish Republic,Poland,,Польська Республіка
Советская Польша,Soviet Poland,Poland,Cold War,Радянська Польша
Независимая Польша,Independent Poland,Poland,,Незалежна Польша
Армия Крайова,Home Army,Poland,WW2,Армія Крайова
Российская Польша,Russian Poland/Congress Kingdom of Poland(1815),Poland,,Россійська Польша
Польская Народная Республика,Polish People's Republic,Poland,Cold War,Польська Народна Республіка
Республика Польша,Republic of Poland,Poland,Modern,Республіка Польша
Речь Посполитая ,Polish-Lithuanian Commonwealth,Poland,,Річ Посполита
Польско-Латвийская Конфедерация,Polish–Latvian Commonwealth,Poland,,Польсько-Латвійська Конфедерація
Румыния,Romania,Romnia,Default,Румунія
Румынская Советская Республика,Romanian Soviet Republic,Romnia,Cold War,Румунська Радянська Республіка
Румынская Социалистическая Республика,Romanian Socialist Republic,Romnia,Cold War,Румунська Соціалістична Республіка
Советская Румыния,Soviet Romania,Romnia,Cold War,Радянська Румунія
Республика Румыния,Republic of Romania,Romnia,,Республіка Румунія
Румынская Республика,Romanian Republic,Romnia,,Румунська Республіка
Королевство Румыния,Kingdom of Romania,Romnia,WW2,Королівство Румунія
Княжество Валлахия,Principality of Wallachia,Romnia,,Княжівство Валахія
Валлахия,Wallachia,Romnia,Default,Валахія
Союз Трёх Княжеств,United Principalities of Moldavia and Wallachia (1859–1862)Romanian United Principalities (1862–1866)Principality of Romania (1866–1881),Romnia,,Союз Трьох Княжівств
Три Княжества,Three Principalities,Romnia,,Три Княжівства
Трансильвания,Transylvania,Romnia,Default,Трансільванія
Ко-Протекторат Трансильвания,Co-Protectorate Transylvania,Romnia,Alternative,Ко-Протекторат Трансільванія
Трансильванский Ко-Протекторат,Transylvanian Protectorate,Romnia,Alternative,Трансільванський Ко-Протекторат
Бессарабия,Bessarabia,Romnia,Default,Безсарабія
Молдавия,Moldavia,Moldavia,Default,Молдавія
Молдова,Moldova,Moldavia,Modern,Молдова
Республика Молдова,Republic of Moldova,Moldavia,Modern,Республіка Молдова
Республика Молдавия,Republic of Moldavia,Moldavia,,Республіка Молдавія
Молдавская Республика,Moldavian Republic,Moldavia,,Молдавська Республіка
Советская Молдавия,Soviet Moldova,Moldavia,Cold War,Радянська Молдавія
Молдавская ССР,Moldavian SSR,Moldavia,Cold War,Молдавська РСР
Молдавская Советская Социалистическая Республика ,Moldavian Soviet Socialist Republic,Moldavia,Cold War,Молдавська Радянська Соціалістична Республіка
Молдавская Автономная Советская Социалистическая Республика ,Moldavian Autonomous Soviet Socialist Republic,Moldavia,Interbellum,Молдавська Автономна Радянська Соціалістична Республіка
Молдавская Демократическая Республика,Moldavian Democratic Republic,Moldavia,Interbellum,Молдавська Демократична Республіка
Jos Maya Sandu!,Jos Maya Sandu!  (?),Moldavia,,Ганьба Маї Санду!
Молдавская Народная Республика,Moldavian People's Republic,Moldavia,,Молдавська Народна Республіка
Молдавская АССР,Moldavian ASSR,Moldavia,WW2,Молдавська АРСР
МАССР,MASSR,Moldavia,WW2,МАРСР
Россия,Russia ,Russia,Default,Росія
Российская Республика,Russian Republic,Russia,Interbellum,Російська Республіка
Советская Россия,Soviet Russia,Russia,Cold War,Радянська Росія
Российская Федеративная ССР,Russian Federative SSR,Russia,Cold War,Російська Федеративна РСР
Российская СФСР,Russian SFSR,Russia,Cold War,Російська РФСР
РСФСР,RSFSR,Russia,Cold War,РРФСР
Российская Федерация ,Russian Federation ,Russia,Modern,Російська Федерація
Российское Государство,Russian State,Russia,Interbellum,Російська Держава
Республика Россия,Republic of Russia,Russia,,Республіка Росія
Государство Россия,State of Russia,Russia,,Деджава Росія
Царство Российское,The Russian Kingdom,Russia,,Царство Російське
Союзное Государство,Union State,Russia,Alternative,Союзна Держава
Российская Империя,Russian Empire,Russia,,Російська Імперія
Моравия,Moravia,Czechoslovakia,,Моравія
Богемия,Bohemia,Czechoslovakia,,Богемія
Чехия,Czechia,Czechoslovakia,Defalut,Чехія
Судетская область,Sudetenland,Czechoslovakia,,Судетська Область
Словакия,Slovakia,Czechoslovakia,Defalut,Словакія
Чехословакия,Czechoslovakia,Czechoslovakia,Cold War,Чехословакія
Чехо-Словакия,Czecho-Slovakia,Czechoslovakia,Interbellum,Чехо-Словакія
Чехо-Словацкая Республика,Czecho-Slovak Republic,Czechoslovakia,Interbellum,Чехо-Словацька Республіка
Чехословацкая Республика,Czechoslovak Republic,Czechoslovakia,Cold War,Чехословацька Республіка
Чехословацкая Народная Республика,Czechoslovak People's Republic,Czechoslovakia,,Чехословацька Народна Респубіка
Чехословацкая Советская Республика ,Czechoslovak Soviet Republic,Czechoslovakia,,Чехословацька Радянська Республіка
Чехословацкая Социалистическая Республика,Czechoslovak Socialist Republic,Czechoslovakia,Cold War,Чехословацька Соціалістична Республіка
Советская Чехословакия,Soviet Czechoslovakia,Czechoslovakia,,Радянська Чехословакія
Республика Чехия,Czech Republic,Czechoslovakia,,Республіка Чехія
Чешская Республика,Czech Republic,Czechoslovakia,,Чеська Республіка
Словацкая Республика,Slovak Republic,Czechoslovakia,,Словацька Республіка
Республика Словакия,Republic of Slovakia,Czechoslovakia,,Республіка Словакія
Венгрия,Hungary,Hungary,Default,Угорщина
Венгерская Республика,Hungarian Republic,Hungary,,Угорська Республіка
Советская Венгрия,Soviet Hungary,Hungary,,Радянська Угорщина
Венгерская Советская Республика,Hungarian Soviet Republic,Hungary,Interbellum,Угорська Радянська Республіка
Республика Венгрия,Republic of Hungary,Hungary,,Республіка Угорщина
Венгерская Народная Республика,Hungarian People's Republic,Hungary,Interbellum,Угорська Народна Республіка
Венгерская Империя,Hungarian Empire,Hungary,,Угорська Імперія
Австрия ,Austria ,Austria,Default,Австрія
Австровенгрия,Austria-Hungary,Austria,WW1,Австроугорщина
Венгроавстрия,Hungary-Austria (?),Hungary,,Угороавстрія
Венгерское Княжество,Principality of Hungary,Hungary,,Угорське Княжівство
Венгерское Королевство,Hungarian Kingdom,Hungary,,Угорське Королівство
Королевство Венгрия ,Kingdom of Hungary,Hungary,,Королівство Угорщина
Германия,Germany,Germany,Defalut,Німеччина
Германская Демократическая Республика,German Democratic Republic,Germany,Cold War,Німецька Демократична Республіка
Федеративная Республика Германия,Federal Republic of Germany,Germany,Modern,Федеративна Республіка Німеччина
Великогерманский Рейх,Greater German Reich,Germany,Defalut,Великонімецький Рейх
Тысячелетний Рейх,Thousand-Year Reich,Germany,Alternative,Тисячолітній Рейх
Первый Рейх,First Reich,Germany,1444,Перший Рейх
Второй Рейх,Second Reich,Germany,WW1,Другий Рейх
Третий Рейх,Third Reich,Germany,WW2,Третій Рейх
Четвёртый Рейх,Fourth Reiach,Germany,Alternative,Четвертий Рейх
Пятый Рейх,Fifth Reich,Germany,Alternative,П'ятий Рейх
Рейх,Reich,Germany,Defalut,Рейх
Веймарская Республика,Weimar Republic,Germany,Interbellum,Веймарська Республіка
Священная Римская Империя,Holy Roman Empire,Germany,,Священна Римська Імперія
Пруссия,Prussia,Germany,Default,Прусія
Королевство Пруссия,Kingdom of Prussia,Germany,,Королівство Прусія
Восточная Пруссия,East Prussia,Germany,,Східна Прусія
Западная Пруссия,West Prussia,Germany,,Західна Прусія
Восточная Германия,East Germany,Germany,Cold War,Східна Німеччина
Западная Германия,West Germany,Germany,Cold War,Західна Німеччина
Советская Германия,Soviet Germany,Germany,,Радянська Німеччина
Свободное Государство Пруссия,Free State of Prussia,Germany,,Вільна Держава Прусія
Германская Конфедерация,German Confederation,Germany,,Німецька Конфедерація
Северогерманская Конфедерация,North German Confederation,Germany,,Північнонімецька Конфедерація
Южногерманская Конфедерация,South German Confederation,Germany,,Південнонімецька Конфедерація
Бавария,Bavaria,Germany/district,Default,Баварія
Бранденбург,Brandenburg,Germany/district,,Бранденбург
Вюртемберг,Wurttemberg,Germany/district,,Вютембург
Гессен,Hessen,Germany/district,,Гесен
Шлезвиг,Schleswig,Germany/district,,Шлезвіг
Гольштейн,Holstein,Germany/district,,Гольштейн
Саксония,Saxony,Germany/district,,Сакснія
Советская Бавария,Soviet Bavaria,Germany,,Радянська Баварія
Советская Республика Бавария,Soviet Republic of Bavaria,Germany,,Радянська Республіка Баварія
Баварская Советская Республика,Bavarian Soviet Republic,Germany,Interbellum,Баварська Радянська Республіка
Британия,Britannia,UK,Default,Британія
Британский Союз,Union of Britain,UK,Alternative,Британський Союз
Великобритания,Great Britain,UK,Default,Великобританія
Соеденённое Королевство,United Kingdom,UK,Default,З'єднане Королівство
"Соеденённое Королевство Англии, Шотландии, Уэльса и Северной Ирландии","United Kingdom of England, Scotland, Wales and Northern Ireland",UK,Default,"Сполучене Королівство Англії, Шотландії, Уельсу та Північної Ірландії."
Англия,England,UK,,Англія
Шотландия,Scotland,UK,,Шотландія
Королевство Островов,Kingdom of the Isles,UK,,Королівство Островів
Остров Мэн,Isle of Man,UK,,Остров Мен
Уэльс,Wales,UK,,Уельс
Северная Ирландия,Nothern Ireland,Ireland,,Північна Ірландія
Ирландия,Ireland,Ireland,Default,Ірландія
Гибралтар,Giblartar,Iberia,Default,Гібралтар
Испания,Spain,Iberia,Default,Іспанія
Португалия,Portugal,Iberia,Default,Португалія
Кастилия,Castile,Iberia,Old,Кастилія
Арагон,Aragon,Iberia,Old,Арагон
Каталония,Catalonia,Iberia,,Каталонія
Андорра,Andorra,Iberia,,Андора
Франкистская Испания,Francoist Spain,Iberia,,Франксиська Іспанія
Республиканская Испания,Spanish Republic,Iberia,,Республіканська Іспанія
Региональный совет обороны Арагона,Regional Defense Council of Aragon,Iberia,,Регіональна Рада Захисту Арагону
Региональный совет обороны Иберии,Regional Defense Council of Iberia,Iberia,,Регіональна Рада Захисту Іберії
Испанская коммуна,Spanish Commune,Iberia,,Іспанська Комуна
Дания,Denmark,Denmark,,Данія
Норвегия,Norway,Norway,,Норвегія
Готланд,Gotland,Sweden,,Готланд
Швеция,Sweden,Sweden,,Швеція
Королевство Швеция,Kingdom of Sweden,Sweden,,Королівство Швеція
Швецкое Королевство,Swedish Kingdom,Sweden,,Швецьке Королівство
Республика Швеция,Republic of Sweden,Sweden,,Республіка Швеція
Государство Швеция,State of Sweden,Sweden,,Держава Швеція
Соеденённые Королевства Швеции и Норвегии,United Kingdoms of Sweden and Norway,Sweden,,Сполучені Королівства Швеції та Норвегії
Соеденённые Королевства Швеция и Норвегия,United Kingdoms Sweden and Norway,Sweden,,Сполучені Королівства Швеція та Норвегія
Финляндия,Finland,Finland,,Фінляндія
Российская Финлянидя,Russian Findland,Finland,,Російська Фінляндія
Великое княжество Финляндское,Grand Duchy of Finland,Finland,,Велике Княжівство Фінляндське
Кальмаровая Уния,Kalmar Union,Scandina,,Кальмарова Унія
Скандинавия,Scandinavia ,Scandina,,Скандинавія
Скандинавский Союз,Scandinavian Union,Scandina,,Скандинавський Союз
Исландия,Iceland,Iceland,,Ісландія
Гренландия,Greenland,Greenalnd,,Гренландія
Бельгия,Belgium,Benelux,,Бельгія
Фландрия,Flanders,Benelux,,Фландрія
Валлония,Wallonia,Benelux,,Валонія
Нидерланды,Netherlands,Benelux,,Нідерланди
Люксембург,Luxembourg,Benelux,,Люксембург
Бенилюкс,Benelux,Benelux,,Бенілюкс
Корсика,Corsica,France,,Корсика
Франция,France,France,,Франція
Герцогство Бретань,Kingdom of Brittany,France,,Герцогсьтво Бретань
Лотарингия,Lotharingia,France,,Лотарінгія
Бургундия,Burgundy,France,,Бургундія
Нормандия,Normandy,France,,Нормандія
Королевство Франция,Kingdom of France,France,,Королівство Франція
Первая Французская Республика,First French Republic,France,,Перша Французька Республіка
Вторая Французская Республика,Second French Republic,France,,Друга Французька Республіка
Третья Французская Республика,Third French Republic,France,,Третя Французька Республіка
Четвертая Французская Республика,Fourth French Republic,France,Alternative,Четверта Французька Республіка
Французская Республика,French Republic,France,,Французька Республіка
Западно-Франкское королевство,West Francia / Kingdom of the West Franks,France,,Західно-Фракське Королівство
Восточно-Франкское королевство,East Francia / Kingdom of the East Franks,France,,Східно-Фракське Королівство
Средне-Франкское королевство,Middle Francia / Kingdom of Middle Francia,France,,
Французская Коммуна,French Commune,France,,
Монако,Monaco,,,Монако
Швейцарская Конфедерация,Swiss Confederation,Switzerland,,Швейцарська Конфедерація
Швейцария ,Switzerland,Switzerland,,Швейцарія
Альпийская Федерация,Alpine Federation,Switzerland,,Альпійська Конфедерація
Италия,Italy,Italy,,Італія
Итальянская Республика,Italian Republic,Italy,,Італьянська Республіка
Итальянский синдикальный союз,Syndicalist Italy,Italy,,Італьянський Синдикальний Союз
Итальянская Федерация,Italian Federation,Italy,,Італьянська Федерація
Сан-Марино,San-Marino,Italy,,Сан-Марино
Ватикан,Vatican,Italy,,Ватикан
Папская Область,Papal States,Italy,,Папська Область
Неаполитанское королевство,Kingdom of Naples,Italy,,Неаполітанське Королівство
Королевство обеих Сицилий,Kingdom of the Two Sicilies,Italy,,Королівство Обох Сицилій
Две Сицилии,Two Sicilies,Italy,,Дві Сицилії
Сардиния,Sardinia,Italy,,Сардинія
Венеция,Venice,Italy,,Венеція
Венецианская республика,Republic of Venice,Italy,,Венеціанська Республіка
Королевство Сицилия,Kingdom of Sicily,Italy,,Королівство Сицилія
Генуэзская республика,Republic of Genoa,Italy,,Генеуезька Республіка
Савойское герцогство,Duchy of Savoy,Italy,,Савойське Герцогство
Миланское герцогство,Duchy of Milan,Italy,,Міланське Герцогство
Римская империя,Roman Empire,Italy,,Римська Імперія
Казахстан,Kazakhstan,Kazakhstan,,Казахстан
Советский Казахстан,Soviet Kazakhstan,Kazakhstan,,Радянський Казахстан
Казахская АССР,Kazakh ASSR,Kazakhstan,,Казахська АРСР
Казахская ССР,Kazakh SSR,Kazakhstan,,Казахська РСР
КССР,KSSR,Kazakhstan,,КРСР
КАССР,KASSR,Kazakhstan,,КАРСР
КазССР,KazSSR,Kazakhstan,,КазРСР
КазАССР,KazASSR,Kazakhstan,,КазАРСР
Республика Казахстан,Republic of Kazakhstan,Kazakhstan,,Республіка Казахстан
Казахская Республика,Kazakh Republic,Kazakhstan,,Казахська Республіка
Алаш,Alash,Kazakhstan,,Алаш
Республика Алаш,Republic of Alash,Kazakhstan,,Республіка Алаш
Алашская Республика,Alash Republic,Kazakhstan,,Алашська Республіка
Алаш-Орда,Alash-Horde,Kazakhstan,,Алаш-Орда
Алаш Орда,Alash Horde,Kazakhstan,,Алашська Орда
Узбекистан,Uzbekistan,Uzbekistan,,Узбекістан
Советский Узбекистан,Soviet Uzbekistan,Uzbekistan,,Радянський Узбекістан
Узбекская ССР,Uzbek SSR,Uzbekistan,,Узбекська РСР
Республика Узбекистан,Republic of Uzbekistan,Uzbekistan,,Республіка Узбекістан
Узбекская Республика,Uzbek Republic,Uzbekistan,,Узбекська Республіка
Словения,Slovenia,Yugoslavia,,Словенія
Хорватия,Croatia,Yugoslavia,,Хорватія
Босния и Герцеговина,Bosnia and Herzegovina,Yugoslavia,,Боснія та Герцоговина
Косово,Kosovo,Yugoslavia,,Косово
Сербия,Serbia,Yugoslavia,,Сербія
Черногория,Montenegro,Yugoslavia,,Чорногорія
Северная Македония,North Macedonia,Yugoslavia,,Північна Македонія
Албания,Albania,Yugoslavia,,Албанія
Иллирия,Illyria,Yugoslavia,,Іллірія
Югославия,Yugoslavia,Yugoslavia,,Югославія
Греция,Greece,Greece,,Греція
Эллада,Hellas,Greece,,Еллада
Болгария,Bulgaria,Bulgaria,,Болгарія
Турция,Turkey,Turkey,,Турція
Османия,Ottoman,Turkey,,Османія
Османская Империя,Ottoman Empire,Turkey,,Османська Імперія
Турецкая Республика,Turkish Republic,Turkey,,Турецька Республіка
Турецкая Империя,Turkish Empire,Turkey,,Турецька Імперія
Республика Турция,Republic of Turkey,Turkey,,Республіка Турція
Государство Турция,State of Turkey,Turkey,,Держава Турція
Государство Ататюрка,State of Ataturk,Turkey,,Держава Ататюрка
Империя Тигерленд,Empire of Tigerland,Tigerland,Alternative,Імперія Тигрленд
Народная Федерация Тигерленда,Tigerland People's Federation,Tigerland,Alternative,Народна Федерація Тигирленду
Тигерлендская Коммунистическая Республика,Tigerland Communist Republic,Tigerland,Alternative,Тигрлендська Комуністична Республіка
Конгломерат Тигрлендских Компаний,Conglomerate of Tigerland Companies,Tigerland,Alternative,Конгломерат Тигрлендських Компаній
Северный Загорск,Northern Zagorsk,Tigerland,Alternative,Північний Загорськ
Южный Загорск,Southern Zagorsk,Tigerland,Alternative,Південний Загорськ
Южнополосск,Yuzhnopolossk,Tigerland,Alternative,Южнополоськ
Интернациональная Коммунистическая Бригада,International Communist Brigade,Tigerland,Alternative,Інтернаціональна Комуністична Бригада
Южные Земли Короны,Southern Crown Lands,Tigerland,Alternative,Південні Землі Корони
Киризская Автономия,Kiriz Autonomy,Tigerland,Alternative,Кірізька Автономія
,Order of Mary,Tigerland,Alternative,
Хорватский Корпус,Croatian Corps,Tigerland,Alternative,Хорватський Корпус
Македонский Корпус,Macedonian Corps,Tigerland,Alternative,Македонський Корпус
Словенский Корпус,Slovenian Corps,Tigerland,Alternative,Словенський Корпус
Кечня,,Tigerland,Alternative,Кечня
Территория Сталкова,Territory of Stalkov,Tigerland,Alternative,Територія Сталкова
Иностранный Легион,Foreign Legion,Tigerland,Alternative,Інтернаціональний Легіон
Конституционное Собрание,Constituent Assembly,Tigerland,Alternative,Конституційний Збір
Пантерлендский Мандат Северного Загорска,Pantherland Mandate of Northern Zagorsk,Tigerland,Alternative,Пантерлендський Мандат Північного Загорська
Анархисты,Anarchist,Tigerland,Alternative,Анархісти
Речные Пираты,River Pirates,Tigerland,Alternative,Річкові Пірати
Частная Военная Компания «Восход»,Private Military Company «Sunrise»,Tigerland,Alternative,Часна Воєнна Компанія «Схід»
ЧВК Восход,PMC Sunrise,Tigerland,Alternative,ЧВК Схід
Великое Восстание Ризьбы,Great Rizba's Uprising,Tigerland,Alternative,Велике Повстання Ризьби
Свободный Город Ланта,Free City of Lanta,Tigerland,Alternative,Вільне Місто Ланта
Свободный Город Ремар,Free City of Remara,Tigerland,Alternative,Вільне Місто Ремар
Братовия,Bratovia,Tigerland,Alternative,Братовія
Дил,Dile,Tigerland,Alternative,Дил
Драк,Drak,Tigerland,Alternative,Драк
Свободный Город Камара,Free City of Kamara,Tigerland,Alternative,Вільне Місто Камара
Свободный Город Лаит,Free City of Lait,Tigerland,Alternative,Вільне Місто Лайт
Свободный Город Мелск,Free City of Melsk,Tigerland,Alternative,Вільне Місто Мєльск
Свободное Государство Загория,Free State of Zagoria,Tigerland,Alternative,Вільна Держава Загорія
Карол,Karol,Tigerland,Alternative,Карол
Воланское Свободное Государство,Volyansk Free State,Tigerland,Alternative,Воланська Вільна Держава
Соединённые Провинции Тигоров,United Provinces of Tigris,Tigerland,Alternative,Сполучені Провінції Тигрів
Территория Генерала Сталкова,Territory of General Stalkov,Tigerland,Alternative,Територія Генерала Сталкова
Терноградский Пакт,Ternograd Pact,Tigerland,Alternative,Терноградський Пакт`.trim()