if (localStorage.getItem('isSelfadShowed') != true) {
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

    header.textContent = '!!! ВАЖНО !!!'
    headerClose.textContent = '×'
    btnCloseText.textContent = 'Закрыть'
    btnOpenText.textContent = 'Открыть'
    mbody.innerHTML = `
Добрый день. Я занимаюсь разработкой сайтов, вебприложений, телеграм ботов и миниприложений и много чем ещё по низким ценам (от 50 долларов). По любым вопросам - пишите: <a style="color: var(--ac-text)" href="https://discord.com/users/794675642037567498">дискорд</a>, <a style="color: var(--ac-text)" href="https://t.me/eenot_eenot">телеграм</a>, <a style="color: var(--ac-text)" href="https://wa.me/37377995534">ватсап</a> и <a style="color: var(--ac-text)" href="https://eenot-eenot.github.io/#contactsSection">другие способы связи</a>.
<br><br>
Сейчас у меня сложное финансовое положение, т.ч. рекламлюсь так, уж простите что добавил это окно на пол экрана.
    `

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
