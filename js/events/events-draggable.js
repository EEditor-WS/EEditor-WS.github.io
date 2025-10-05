document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.event-form-container');
  const draggables = container.querySelectorAll('[draggable]');
  let dragged = null;

  function swapElements(a, b) {
    const parent = a.parentNode;
    const aNext = (a.nextSibling === b) ? a : a.nextSibling;
    parent.replaceChild(a, b);
    parent.insertBefore(b, aNext);
  }

  draggables.forEach(elem => {
    elem.addEventListener('dragstart', e => {
      dragged = elem;
      elem.classList.add('dragging');
    });

    elem.addEventListener('dragend', e => {
      dragged = null;
      elem.classList.remove('dragging');
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
  });
  
    const handle = document.querySelector('.drag-handle');
    const handle2 = document.querySelector('.drag-handle2');
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
            if (newLeftWidth < 25 || newRightWidth < 25) return; // Minimum width of 10%
            container.style.gridTemplateColumns = `${newLeftWidth}% 5px ${newRightWidth}%`;
        }

        function onMouseUp() {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        }

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    });
    handle2.addEventListener('mousedown', (e) => handle.dispatchEvent(new MouseEvent('mousedown', e)) );

});
