const adslist = [
//    'me2ads', 'satads'
    'tournamentAds'
];

function adsShowRandomEditor() {
    const adsRandom = adslist[Math.floor(Math.random() * adslist.length)];
    document.getElementById(adsRandom).classList.add('active');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    adsShowRandomEditor();
});