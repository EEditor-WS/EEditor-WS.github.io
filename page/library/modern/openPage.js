function openScenariosPage(pageId) {
    const navButtons = document.querySelectorAll('.navbtn');
    navButtons.forEach(btn => btn.classList.remove('active'));
            
    // Показываем соответствующую страницу
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId)?.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(document.location.search);
    const category = params.get('category');
    const fullId = params.get('fullid');
    if (category) {
        openScenariosPage(category);
    } else if (fullId) {
        openScenariosPage('scenarios');
        window.location.href = window.location.href.replace('download.html?fullid', 'detalis.html?type=scenario&scenario');
    } else {
        openScenariosPage('main');
    }
    window.params = params;
});