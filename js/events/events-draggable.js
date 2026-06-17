document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.event-form-container');
  if (!container) return;

  // Все перетаскиваемые блоки должны иметь attribute draggable="true"
  const draggables = container.querySelectorAll('[draggable]'); 
  let dragged = null;

  function swapElements(a, b) {
    const parent = a.parentNode;
    const aNext = (a.nextSibling === b) ? a : a.nextSibling;
    parent.replaceChild(a, b);
    parent.insertBefore(b, aNext);
  }

  draggables.forEach(elem => {
    // Флаг, разрешающий dragstart — выставляется при pointerdown/mousedown на handle
    elem.dataset.dragAllowed = 'false';

    // Когда начинается drag — проверяем, разрешён ли он (т. е. был ли start на handle)
    elem.addEventListener('dragstart', e => {
      if (elem.dataset.dragAllowed !== 'true') {
        // Запретить начало перетаскивания, если не с ручки
        e.preventDefault();
        return;
      }
      // Для Firefox нужно обязательно положить что-то в dataTransfer
      try {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
      } catch (err) { /* ignore */ }

      dragged = elem;
      elem.classList.add('dragging');
    });

    elem.addEventListener('dragend', e => {
      dragged = null;
      elem.classList.remove('dragging');
      elem.dataset.dragAllowed = 'false';
      container.querySelectorAll('.over').forEach(el => el.classList.remove('over'));
    });

    elem.addEventListener('dragover', e => e.preventDefault());

    elem.addEventListener('dragenter', e => {
      if (elem !== dragged) elem.classList.add('over');
    });

    elem.addEventListener('dragleave', e => elem.classList.remove('over'));

    elem.addEventListener('drop', e => {
      e.preventDefault();
      if (dragged && dragged !== elem) {
        swapElements(dragged, elem);
        elem.classList.remove('over');
      }
    });

    // Отслеживаем начало указателя (мышь/тач/стилус). Если он пришёлся на handle — разрешаем drag.
    // Используем pointerdown для универсальности.
    elem.addEventListener('pointerdown', (e) => {
      // closest — проверим, был ли нажат элемент с классом .drag-handle внутри этого блока.
      // Измените селектор, если у вас другой класс ручки (например .title-bar и т.д.)
      const handle = e.target.closest('.drag-handle');
      if (handle && elem.contains(handle)) {
        // Разрешаем drag для этого элемента
        elem.dataset.dragAllowed = 'true';

        // Опционально: поставить визуальную подсветку ручки
        handle.classList.add('drag-handle--active');
      } else {
        elem.dataset.dragAllowed = 'false';
      }
    });

    // Убрать активный стиль ручки при отпускании
    elem.addEventListener('pointerup', (e) => {
      const handle = elem.querySelector('.drag-handle');
      if (handle) handle.classList.remove('drag-handle--active');
      // Если pointerup произошёл до того, как dragstart произошёл — отказаться от перетаскивания
      // (dragstart сам сбросит флаг при dragend)
      if (elem.dataset.dragAllowed === 'true' && !elem.classList.contains('dragging')) {
        // краткая задержка — чтобы не конфликтовать с dragstart, но обычно можно просто сбросить
        elem.dataset.dragAllowed = 'false';
      }
    });

    // На случай, если пользователь уходит курсором с окна
    elem.addEventListener('pointercancel', () => {
      const handle = elem.querySelector('.drag-handle');
      if (handle) handle.classList.remove('drag-handle--active');
      elem.dataset.dragAllowed = 'false';
    });

    // (Опционально) предотвратить выделение текста при перетаскивании за ручку:
    const handleNode = elem.querySelector('.drag-handle');
    if (handleNode) {
      handleNode.style.userSelect = 'none';
      handleNode.style.touchAction = 'none';
      handleNode.style.cursor = 'move';
    }
  });

  // --- Существующая логика разделителя (splitter) ---
  const handle = document.querySelector('.drag-handle-slider');   // если это не конфликтует с ручками элементов
  const handle2 = document.querySelector('.drag-handle-slider2');
  if (handle) {
    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const startX = e.clientX;
      const leftCol = container.children[0];
      const rightCol = container.children[2];
      const startLeftWidth = leftCol.getBoundingClientRect().width;
      const startRightWidth = rightCol.getBoundingClientRect().width;

      function onMouseMove(e) {
        const dx = e.clientX - startX;
        const containerWidth = container.getBoundingClientRect().width;
        const newLeftWidth = ((startLeftWidth + dx) / containerWidth) * 100;
        const newRightWidth = ((startRightWidth - dx) / containerWidth) * 100;
        if (newLeftWidth < 25 || newRightWidth < 25) return;
        container.style.gridTemplateColumns = `${newLeftWidth}% 5px ${newRightWidth}%`;
      }

      function onMouseUp() {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      }

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });

    if (handle2) {
      handle2.addEventListener('mousedown', (e) => handle.dispatchEvent(new MouseEvent('mousedown', e)));
    }
  }
});
