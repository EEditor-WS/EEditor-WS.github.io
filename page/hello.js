if (isAndroidApp) {
    document.getElementById('hello_done').addEventListener('click', () => {
    })
}

function helloWriteSettings() {
    try {
    Android.writeFile('settings.json', `{"link": "${document.getElementById('sett_link').value}", "lang": "${document.getElementById('sett_lang').value}"}`, 'text');
    } catch(e) {
        alert(e);
    }
}