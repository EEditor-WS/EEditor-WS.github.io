if (localStorage.getItem('isSelfadShowed') != 'true') {
    // 1. Определение языка пользователя
    const userLang = (navigator.language || navigator.userLanguage).toLowerCase();
    let lang = 'en'; // Дефолтный язык (английский)

    if (userLang.startsWith('uk')) {
        lang = 'uk';
    } else if (userLang.startsWith('ru') || userLang.startsWith('be') || userLang.startsWith('kk')) {
        lang = 'ru';
    }

    // 2. Словарь переводов
    const translations = {
        ru: {
            header: '!!! ВАЖНО !!!',
            close: 'Закрыть',
            open: 'Открыть',
            body: `Добрый день. Я занимаюсь разработкой сайтов, вебприложений, телеграм ботов и миниприложений и много чем ещё по низким ценам (от 50 долларов). По любым вопросам - пишите: <a style="color: var(--ac-text)" href="https://discord.com/users/794675642037567498">дискорд</a>, <a style="color: var(--ac-text)" href="https://t.me/eenot_eenot">телеграм</a>, <a style="color: var(--ac-text)" href="https://wa.me/37377995534">ватсап</a> и <a style="color: var(--ac-text)" href="https://eenot-eenot.github.io/#contactsSection">другие способы связи</a>.
            <br><br>
            Сейчас у меня сложное финансовое положение, т.ч. рекламлюсь так, уж простите что добавил это окно на пол экрана.`
        },
        uk: {
            header: '!!! ВАЖЛИВО !!!',
            close: 'Закрити',
            open: 'Відкрити',
            body: `Доброго дня. Я займаюся розробкою сайтів, вебдодатків, телеграм ботів та мінідодатків і багато чим іншим за низькими цінами (від 50 доларів). З будь-яких питань - пишіть: <a style="color: var(--ac-text)" href="https://discord.com/users/794675642037567498">дискорд</a>, <a style="color: var(--ac-text)" href="https://t.me/eenot_eenot">телеграм</a>, <a style="color: var(--ac-text)" href="https://wa.me/37377995534">ватсап</a> та <a style="color: var(--ac-text)" href="https://eenot-eenot.github.io/#contactsSection">інші способи зв'язку</a>.
            <br><br>
            Зараз у мене складне фінансове становище, тому рекламуюся так, вибачте, що додав це вікно на пів екрана.`
        },
        en: {
            header: '!!! IMPORTANT !!!',
            close: 'Close',
            open: 'Open',
            body: `Good day. I am engaged in the development of websites, web applications, Telegram bots, mini-apps, and much more at low prices (from $50). For any questions - feel free to write: <a style="color: var(--ac-text)" href="https://discord.com/users/794675642037567498">Discord</a>, <a style="color: var(--ac-text)" href="https://t.me/eenot_eenot">Telegram</a>, <a style="color: var(--ac-text)" href="https://wa.me/37377995534">WhatsApp</a> and <a style="color: var(--ac-text)" href="https://eenot-eenot.github.io/#contactsSection">other contact methods</a>.
            <br><br>
            Right now I am in a difficult financial situation, so I have to advertise like this, please forgive me for adding this half-screen window.`
        }
    };

    // 3. Создание элементов интерфейса
    const selfAd = document.createElement('div')
    const content = document.createElement('div')
    const mheader = document.createElement('div')
    const mbody = document.createElement('div')
    const mfooter = document.createElement('div')
    const header = document.createElement('h3')
    const headerClose = document.createElement('button')
    const text = document.createElement('p')
    const btnClose = document.createElement('button')
    const btnOpen = document.createElement('a')
    const btnCloseText = document.createElement('p')
    const btnOpenText = document.createElement('p')

    selfAd.className = 'modal active'
    content.className = 'modal-content'
    mheader.className = 'modal-header'
    mbody.className = 'modal-body'
    mfooter.className = 'modal-footer'
    header.className = 'modal-title'
    headerClose.className = 'close-modal'
    btnClose.className = 'action-button secondary'
    btnOpen.className = 'action-button primary'

    btnClose.style.height = 'max-content'
    btnOpen.style.height = 'max-content'
    btnOpen.style.minHeight = '0'
    btnCloseText.style.margin = '0'
    btnOpenText.style.margin = '0'
    header.style.margin = '0 auto'

    // 4. Подстановка текстов в зависимости от выбранного языка
    header.textContent = translations[lang].header
    headerClose.textContent = '×'
    btnCloseText.textContent = translations[lang].close
    btnOpenText.textContent = translations[lang].open
    mbody.innerHTML = translations[lang].body

    btnOpen.href = 'https://eenot-eenot.github.io/'

    btnClose.addEventListener('click', () => {
        localStorage.setItem('isSelfadShowed', true)
        selfAd.remove()
    })
    headerClose.addEventListener('click', () => {
        localStorage.setItem('isSelfadShowed', true)
        selfAd.remove()
    })

    document.body.appendChild(selfAd)
    selfAd.appendChild(content)
    content.appendChild(mheader)
    content.appendChild(mbody)
    content.appendChild(mfooter)
    mheader.appendChild(header)
    mheader.appendChild(headerClose)
    mbody.appendChild(text)
    mfooter.appendChild(btnClose)
    mfooter.appendChild(btnOpen)
    btnClose.appendChild(btnCloseText)
    btnOpen.appendChild(btnOpenText)
}