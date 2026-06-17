/*
    createCustomDropdown(container, options, config)
    - container: HTMLElement where dropdown will be appended
    - options: array of { value: string, label: string, group?: string }
    - config: { placeholder, searchable(boolean) }
*/
function createCustomDropdown(container, options = [], config = {}) {
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

    container.appendChild(root);

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
            const image = opt.img ? `<img src="${opt.img}.png" alt="" class="custom-dd__option-img"/>` : '';
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
        selectValue(opt.dataset.value);
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
let flags = [
    { value: '', label: '--- None ---' },
    { value: 'haiti', label: 'haiti', img: 'img/banners/haiti' },
    { value: 'flag_of_union', label: 'flag_of_union', img: 'img/banners/flag_of_union' },
    { value: 'costa_rica', label: 'costa_rica', img: 'img/banners/costa_rica' },
    { value: 'panama1861', label: 'panama1861', img: 'img/banners/panama1861' },
    { value: 'colombia', label: 'colombia', img: 'img/banners/colombia' },
    { value: 'venezuela1861', label: 'venezuela1861', img: 'img/banners/venezuela1861' },
    { value: 'equador', label: 'equador', img: 'img/banners/equador' },
    { value: 'mexico1861', label: 'mexico1861', img: 'img/banners/mexico1861' },
    { value: 'peru', label: 'peru', img: 'img/banners/peru' },
    { value: 'chile', label: 'chile', img: 'img/banners/chile' },
    { value: 'argentine', label: 'argentine', img: 'img/banners/argentine' },
    { value: 'bolivia', label: 'bolivia', img: 'img/banners/bolivia' },
    { value: 'paraguay', label: 'paraguay', img: 'img/banners/paraguay' },
    { value: 'uruguay', label: 'uruguay', img: 'img/banners/uruguay' },
    { value: 'second_flag_empire_of_brazil', label: 'second_flag_empire_of_brazil', img: 'img/banners/second_flag_empire_of_brazil' },
    { value: 'union_jack', label: 'union_jack', img: 'img/banners/union_jack' },
    { value: 'confederate_states_of_america', label: 'confederate_states_of_america', img: 'img/banners/confederate_states_of_america' },
    { value: 'russian_empire', label: 'russian_empire', img: 'img/banners/russian_empire' },
    { value: 'guatemala', label: 'guatemala', img: 'img/banners/guatemala' },
    { value: 'spain', label: 'spain', img: 'img/banners/spain' },
    { value: 'france', label: 'france', img: 'img/banners/france' },
    { value: 'netherlands', label: 'netherlands', img: 'img/banners/netherlands' },
    { value: 'denmark', label: 'denmark', img: 'img/banners/denmark' },
    { value: 'el_salvador', label: 'el_salvador', img: 'img/banners/el_salvador' },
    { value: 'honduras', label: 'honduras', img: 'img/banners/honduras' },
    { value: 'nicaragua', label: 'nicaragua', img: 'img/banners/nicaragua' },
    { value: 'soviet_russia', label: 'soviet_russia', img: 'img/banners/soviet_russia' },
    { value: 'ireland', label: 'ireland', img: 'img/banners/ireland' },
    { value: 'weimar_republic', label: 'weimar_republic', img: 'img/banners/weimar_republic' },
    { value: 'russian_empire2', label: 'russian_empire2', img: 'img/banners/russian_empire2' },
    { value: 'serbia', label: 'serbia', img: 'img/banners/serbia' },
    { value: 'belgium', label: 'belgium', img: 'img/banners/belgium' },
    { value: 'luxembourg', label: 'luxembourg', img: 'img/banners/luxembourg' },
    { value: 'lithuania', label: 'lithuania', img: 'img/banners/lithuania' },
    { value: 'latvia', label: 'latvia', img: 'img/banners/latvia' },
    { value: 'estonia', label: 'estonia', img: 'img/banners/estonia' },
    { value: 'finland', label: 'finland', img: 'img/banners/finland' },
    { value: 'sweden', label: 'sweden', img: 'img/banners/sweden' },
    { value: 'norway', label: 'norway', img: 'img/banners/norway' },
    { value: 'switzerland', label: 'switzerland', img: 'img/banners/switzerland' },
    { value: 'czechoslovakia', label: 'czechoslovakia', img: 'img/banners/czechoslovakia' },
    { value: 'romania', label: 'romania', img: 'img/banners/romania' },
    { value: 'bulgaria', label: 'bulgaria', img: 'img/banners/bulgaria' },
    { value: 'greece', label: 'greece', img: 'img/banners/greece' },
    { value: 'albania', label: 'albania', img: 'img/banners/albania' },
    { value: 'bavarian_soviet_republic', label: 'bavarian_soviet_republic', img: 'img/banners/bavarian_soviet_republic' },
    { value: 'sultanate_egypt', label: 'sultanate_egypt', img: 'img/banners/sultanate_egypt' },
    { value: 'persia', label: 'persia', img: 'img/banners/persia' },
    { value: 'italy', label: 'italy', img: 'img/banners/italy' },
    { value: 'ukrainian_peoples_republic', label: 'ukrainian_peoples_republic', img: 'img/banners/ukrainian_peoples_republic' },
    { value: 'poland', label: 'poland', img: 'img/banners/poland' },
    { value: 'german_empire', label: 'german_empire', img: 'img/banners/german_empire' },
    { value: 'ottoman_empire', label: 'ottoman_empire', img: 'img/banners/ottoman_empire' },
    { value: 'portugal', label: 'portugal', img: 'img/banners/portugal' },
    { value: 'azerbaijan_democratic_republic', label: 'azerbaijan_democratic_republic', img: 'img/banners/azerbaijan_democratic_republic' },
    { value: 'armenia', label: 'armenia', img: 'img/banners/armenia' },
    { value: 'democratic_republic_of_georgia', label: 'democratic_republic_of_georgia', img: 'img/banners/democratic_republic_of_georgia' },
    { value: 'soviet_union', label: 'soviet_union', img: 'img/banners/soviet_union' },
    { value: 'austria', label: 'austria', img: 'img/banners/austria' },
    { value: 'hungary', label: 'hungary', img: 'img/banners/hungary' },
    { value: 'yugoslavia', label: 'yugoslavia', img: 'img/banners/yugoslavia' },
    { value: 'azerbaijan', label: 'azerbaijan', img: 'img/banners/azerbaijan' },
    { value: 'free_state_of_bottleneck', label: 'free_state_of_bottleneck', img: 'img/banners/free_state_of_bottleneck' },
    { value: 'northern_corps', label: 'northern_corps', img: 'img/banners/northern_corps' },
    { value: 'makhnovshchina', label: 'makhnovshchina', img: 'img/banners/makhnovshchina' },
    { value: 'iceland', label: 'iceland', img: 'img/banners/iceland' },
    { value: 'latvian_soviet_republic', label: 'latvian_soviet_republic', img: 'img/banners/latvian_soviet_republic' },
    { value: 'austria_hungary', label: 'austria_hungary', img: 'img/banners/austria_hungary' },
];
flags.sort((a, b) => a.label.localeCompare(b.label));

document.addEventListener('DOMContentLoaded', () => {
    const cFlag = createCustomDropdown(document.getElementById('flagdiv'), flags, { placeholder: 'Flag', searchable: true });
    cFlag.setValue('');
    window.customDropFlag = cFlag; // for debugging

    const cReqType = createCustomDropdown(document.getElementById('reqTypeDiv'),  [], { placeholder: 'Type', searchable: true });
    cReqType.setValue('');
    window.cReqType = cReqType; // for debugging
});