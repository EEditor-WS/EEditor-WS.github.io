/*
    createCustomDropdown(container, options, config)
    - container: HTMLElement where dropdown will be appended
    - options: array of { value: string, label: string, group?: string }
    - config: { placeholder, searchable(boolean) }
*/
function createCustomDropdown(container, options = [], config = {}, isContainer = true) {
    if (!container) return null;

    const { placeholder = "Выберите...", searchable = true } = config;

    const root = document.createElement('div');
    root.className = 'custom-dd';
    root.setAttribute('role', 'combobox');
    root.setAttribute('aria-haspopup', 'listbox');
    root.setAttribute('aria-expanded', 'false');

    root.innerHTML = `
        <div class="custom-dd__control" tabindex="-1">
            <span class="custom-dd__label custom-dd__placeholder">${placeholder}</span>
            <img src="img/ui/arrow/down.svg" alt="">
        </div>
        <div class="custom-dd__menu" hidden>
            ${searchable ? '<input type="text" class="custom-dd__search" placeholder="Поиск..."/>' : ''}
            <div class="custom-dd__list" role="listbox" tabindex="-1"></div>
        </div>
    `;

    if (isContainer) { container.appendChild(root) };

    const control = root.querySelector('.custom-dd__control');
    const menu = root.querySelector('.custom-dd__menu');
    const list = root.querySelector('.custom-dd__list');
    const label = root.querySelector('.custom-dd__label');
    const searchInput = root.querySelector('.custom-dd__search');

    let open = false;
    let filtered = options.slice();
    let selectedValue = null;
    let highlighted = -1;
    let typingInSearch = false;

    function renderList() {
        list.innerHTML = '';
        if (filtered.length === 0) {
            const no = document.createElement('div');
            no.className = 'custom-dd__group';
            no.textContent = 'Ничего не найдено';
            list.appendChild(no);
            return;
        }
        filtered.forEach((opt, idx) => {
            const el = document.createElement('div');
            el.className = 'custom-dd__option';
            el.setAttribute('role', 'option');
            el.dataset.index = idx;
            el.dataset.value = opt.value;
            el.setAttribute('aria-selected', opt.value === selectedValue ? 'true' : 'false');
            const checkmark = (opt.disabled === true) ? '' : `<span class="custom-dd__check" aria-hidden="true"></span>`;
            const image = opt.img ? `<img src="${opt.img}${opt.img.endsWith('.svg') ? '' : '.png'}" alt="" class="custom-dd__option-img"/>` : '';
            el.innerHTML = `${image}<span class="custom-dd__text">${opt.label}</span>${checkmark}`;
            list.appendChild(el);
        });
        updateHighlight();
    }

    function updateHighlight() {
        const items = Array.from(list.querySelectorAll('.custom-dd__option'));
        items.forEach((it, i) => {
            it.dataset.highlight = (i === highlighted) ? 'true' : 'false';
            if (i === highlighted) it.scrollIntoView({ block: 'nearest' });
        });
    }

    function openMenu() {
        open = true;
        root.classList.add('custom-dd--open');
        menu.hidden = false;
        root.setAttribute('aria-expanded', 'true');

        typingInSearch = false;

        // выделяем выбранный элемент или первый
        if (selectedValue !== null) {
            const idx = filtered.findIndex(o => o.value === selectedValue);
            highlighted = idx >= 0 ? idx : (filtered.length ? 0 : -1);
        } else {
            highlighted = filtered.length ? 0 : -1;
        }

        updateHighlight();
    }

    function closeMenu() {
        open = false;
        root.classList.remove('custom-dd--open');
        menu.hidden = true;
        root.setAttribute('aria-expanded', 'false');
        typingInSearch = false;
    }

    function toggleMenu() {
        if (open) closeMenu();
        else openMenu();
    }

    function filterBy(q) {
        const qq = (q || '').trim().toLowerCase();
        if (!qq) filtered = options.slice();
        else filtered = options.filter(o => o.label.toLowerCase().includes(qq) || String(o.value).toLowerCase().includes(qq));

        // после фильтрации выделяем первую видимую опцию
        highlighted = filtered.length ? 0 : -1;
        renderList();
    }

    function selectValue(val) {
        const opt = options.find(o => o.value === val);
        if (!opt) return;
        selectedValue = opt.value;
        label.classList.remove('custom-dd__placeholder');
        label.textContent = opt.label;
        root.dispatchEvent(new CustomEvent('change', { detail: { value: selectedValue, option: opt } }));
        renderList();
        closeMenu();
    }

    function selectValueByIndex(idx) {
        if (idx < 0 || idx >= filtered.length) return;
        selectValue(filtered[idx].value);
    }

    function highlightNext(delta = 1) {
        if (!filtered.length) return;
        highlighted = (highlighted + delta + filtered.length) % filtered.length;
        updateHighlight();
    }

    root.setOptions = (newOptions) => {
        if (!Array.isArray(newOptions)) return;
        options = newOptions.slice();
        filtered = options.slice();
        if (searchInput && searchInput.value) filterBy(searchInput.value);
        else renderList();
    };

    renderList();

    // desktop mouse only: prevent scroll
    control.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') e.preventDefault(); }, { passive: false });
    control.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });

    // клавиши для управления
    root.tabIndex = 0; // теперь root может принимать фокус

    // основной обработчик клавиш
    root.addEventListener('keydown', (e) => {
        if (!open) {
            if (['ArrowDown','ArrowUp','Enter',' '].includes(e.key)) {
                e.preventDefault();
                openMenu();
            }
            return;
        }

        if (searchable && /^[a-zA-Z0-9]$/.test(e.key)) {
            typingInSearch = true;
            searchInput.focus();
            return;
        }

        switch (e.key) {
            case 'ArrowDown': e.preventDefault(); highlightNext(1); break;
            case 'ArrowUp': e.preventDefault(); highlightNext(-1); break;
            case 'Home': e.preventDefault(); highlighted = 0; updateHighlight(); break;
            case 'End': e.preventDefault(); highlighted = filtered.length - 1; updateHighlight(); break;
            case 'Enter': e.preventDefault(); if (highlighted >= 0) selectValue(filtered[highlighted].value); break;
            case 'Escape': e.preventDefault(); closeMenu(); break;
        }
    });

    list.addEventListener('click', (e) => {
        const opt = e.target.closest('.custom-dd__option');
        if (!opt) return;
        selectValueByIndex(Number(opt.dataset.index));
    });

    list.addEventListener('mousemove', (e) => {
        const opt = e.target.closest('.custom-dd__option');
        if (!opt) return;
        highlighted = Number(opt.dataset.index);
        updateHighlight();
    });

    // тоже на searchInput, чтобы Enter и Esc работали
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterBy(e.target.value);
        });
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); if (filtered.length) selectValue(filtered[0].value); }
            else if (e.key === 'Escape') { e.preventDefault(); closeMenu(); }
        });
    }

    document.addEventListener('click', (e) => { if (!root.contains(e.target)) closeMenu(); });

    root.getValue = () => selectedValue;
    root.setValue = (v) => selectValue(v);
    root.open = openMenu;
    root.close = closeMenu;

    return root;
}

/* --------------- Пример использования --------------- */
/*let flags = [
    { value: '', label: '--- None ---' },
    { value: 'haiti', label: 'haiti', img: 'img/banners/haiti' },
];
flags.sort((a, b) => a.label.localeCompare(b.label));*/

document.addEventListener('DOMContentLoaded', () => {
    /*const cFlag = createCustomDropdown(document.getElementById('flagdiv'), flags, { placeholder: 'Flag', searchable: true });
    cFlag.setValue('');
    window.customDropFlag = cFlag; // for debugging*/
});

window.createCustomDropdown = createCustomDropdown;