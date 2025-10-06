(function(){
    const ranges = Array.from(document.querySelectorAll('input[type="range"]'));
    if(!ranges.length) return;

    // вычисляет процент заполнения (0..100) точно
    function calcPercent(el){
        const min = Number(el.min ?? 0);
        const max = Number(el.max ?? 100);
        const val = Number(el.value);
        // защититься от деления на ноль
        return max === min ? 0 : ((val - min) / (max - min)) * 100;
    }

    // обновляет background через inline style (работает в Chrome/Safari/Edge)
    function updateBg(el){
        const pct = calcPercent(el);
        // округляем до двух знаков для компактности (строка), но это не обязательно
        const p = Math.max(0, Math.min(100, +pct.toFixed(2)));
        el.style.background = `linear-gradient(90deg, var(--fill) ${p}%, var(--empty) ${p}%)`;
    }

    // обновляет связанное текстовое значение, если есть .val[data-for=ID]
    function updateValueLabel(el){
        if(!el.id) return;
        const label = document.querySelector(`.val[data-for="${el.id}"]`);
        if(label) label.textContent = el.value;
    }

    // инициализация всех
    ranges.forEach(r => {
        updateBg(r);
        updateValueLabel(r);
    });

    // события для каждого ползунка
    ranges.forEach(r => {
        r.addEventListener('input', (e) => {
            updateBg(e.target);
            updateValueLabel(e.target);
        });

        // добавление/удаление класса active при зажатии/фокусе
        const addActive = () => r.classList.add('r-active');
        const removeActive = () => r.classList.remove('r-active');

        r.addEventListener('pointerdown', addActive); // pointer - универсально для мыши и тача
        r.addEventListener('focus', addActive);
        r.addEventListener('blur', removeActive);
    });

    // убрать active при отпускании в любом месте
    document.addEventListener('pointerup', () => {
        ranges.forEach(r => r.classList.remove('r-active'));
    });

    // на случай динамически добавленных ползунков: наблюдаем DOM (опционально, не обязательно)
    // если не нужны — можно удалить этот блок
    const observer = new MutationObserver((mutations) => {
        for(const m of mutations){
            if(m.type === 'childList'){
                m.addedNodes.forEach(node => {
                    if(node.nodeType !== 1) return;
                    if(node.matches && node.matches('input[type="range"]')){
                        // новый элемент добавлен — инициализируем
                        ranges.push(node);
                        updateBg(node);
                        // аналогично добавляем слушатели (копируем логику выше)
                        node.addEventListener('input', (e)=> { updateBg(e.target); updateValueLabel(e.target); });
                        node.addEventListener('pointerdown', ()=> node.classList.add('r-active'));
                        node.addEventListener('focus', ()=> node.classList.add('r-active'));
                        node.addEventListener('blur', ()=> node.classList.remove('r-active'));
                    }
                    // если добавлены контейнеры с range внутри — обойти их
                    node.querySelectorAll && node.querySelectorAll('input[type="range"]').forEach(n => {
                        ranges.push(n);
                        updateBg(n);
                        n.addEventListener('input', (e)=> { updateBg(e.target); updateValueLabel(e.target); });
                        n.addEventListener('pointerdown', ()=> n.classList.add('r-active'));
                        n.addEventListener('focus', ()=> n.classList.add('r-active'));
                        n.addEventListener('blur', ()=> n.classList.remove('r-active'));
                    });
                });
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

})();