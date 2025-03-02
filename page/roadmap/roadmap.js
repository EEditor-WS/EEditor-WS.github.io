document.addEventListener('DOMContentLoaded', () => {
    console.log('Roadmap page loaded');

    // Добавляем обработчики для карточек
    const cards = document.querySelectorAll('.roadmap-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            alert(`Вы выбрали: ${card.textContent}`);
        });
    });
});
