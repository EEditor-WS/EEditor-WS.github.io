document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.events_head');
  if (!container) return;

  // Все перетаскиваемые блоки должны иметь attribute draggable="true"
  const draggables = container.querySelectorAll('[draggable]'); 
  let dragged = null;
  window.currentOrderEvents = []; // сюда записывается текущая последовательность

  // Функция для обновления порядка элементов
  function updateOrder() {
    window.currentOrderEvents = Array.from(container.querySelectorAll('[draggable]'))
      .map(el => el.dataset.sort);
    console.log('Текущий порядок:', window.currentOrderEvents);
    window.eventManager.updateEventsList()
  }

  function swapElements(a, b) {
    const parent = a.parentNode;
    const aNext = (a.nextSibling === b) ? a : a.nextSibling;
    parent.replaceChild(a, b);
    parent.insertBefore(b, aNext);
  }

  draggables.forEach(elem => {
    elem.dataset.dragAllowed = 'false';

    elem.addEventListener('dragstart', e => {
      if (elem.dataset.dragAllowed !== 'true') {
        e.preventDefault();
        return;
      }
      try {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
      } catch (err) { }

      dragged = elem;
      elem.classList.add('dragging');
    });

    elem.addEventListener('dragend', e => {
      dragged = null;
      elem.classList.remove('dragging');
      elem.dataset.dragAllowed = 'false';
      container.querySelectorAll('.over').forEach(el => el.classList.remove('over'));

      // после завершения перетаскивания обновляем порядок
      updateOrder();
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

    elem.addEventListener('pointerdown', (e) => {
      const handle = e.target.closest('th');
      if (handle && elem.contains(handle)) {
        elem.dataset.dragAllowed = 'true';
        handle.classList.add('drag-handle--active');
      } else {
        elem.dataset.dragAllowed = 'false';
      }
    });

    elem.addEventListener('pointerup', (e) => {
      const handle = elem.querySelector('th');
      if (handle) handle.classList.remove('drag-handle--active');
      if (elem.dataset.dragAllowed === 'true' && !elem.classList.contains('dragging')) {
        elem.dataset.dragAllowed = 'false';
      }
    });

    elem.addEventListener('pointercancel', () => {
      const handle = elem.querySelector('th');
      if (handle) handle.classList.remove('drag-handle--active');
      elem.dataset.dragAllowed = 'false';
    });

    const handleNode = elem.querySelector('.drag-handle');
    if (handleNode) {
      handleNode.style.userSelect = 'none';
      handleNode.style.touchAction = 'none';
      handleNode.style.cursor = 'move';
    }
  });

  // --- Логика разделителя ---
  const handle = document.querySelector('.drag-handle-slider');
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

  // Инициализация начального порядка
  updateOrder();
});
