document.addEventListener('DOMContentLoaded', function () {
    if (isAndroidApp) {
        TestWrite();
    };
});

function TestWrite(text) {
    const nf = document.getElementById('samsungzakos');
    if (nf) {
        nf.innerText = 'try';
    }

    try {
        // Форма вызова: Android.writeFile(relativePath, content, mode)
        // mode: "text" или "base64"
        if (typeof Android !== 'undefined' && Android.writeFile) {
            const result = Android.writeFile("test.txt", document.getElementById('preview-content').value, "text");
            // result — JSON-строка, можно распарсить
            try {
                const parsed = JSON.parse(result);
                if (parsed && parsed.ok) {
                    if (nf) nf.innerHTML = 'wrote OK';
                } else {
                    if (nf) nf.innerHTML = 'write error: ' + (parsed && parsed.error ? parsed.error : result);
                }
            } catch (e) {
                if (nf) nf.innerHTML = 'write returned (non-json): ' + result;
            }
        } else {
            if (nf) nf.innerHTML = 'Android interface not available';
        }
    } catch (e) {
        if (nf) nf.innerHTML = 'exception: ' + e.toString();
    }
}