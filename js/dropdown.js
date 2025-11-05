/*
  createCustomDropdown(container, options, config)
  - container: HTMLElement where dropdown will be appended
  - options: array of { value: string, label: string, group?: string }
  - config: { placeholder, searchable(boolean) }
*/
function createCustomDropdown(container, options = [], config = {}) {
  // Defensive: ensure container element exists before manipulating DOM
  if (!container) {
    console.warn('createCustomDropdown: missing container element, aborting.', { container, options, config });
    return null;
  }
  const { placeholder = "Выберите...", searchable = true } = config;
  const root = document.createElement('div');
  root.className = 'custom-dd';
  root.tabIndex = 0;
  root.setAttribute('role', 'combobox');
  root.setAttribute('aria-haspopup', 'listbox');
  root.setAttribute('aria-expanded', 'false');

  // Elements
  root.innerHTML = `
    <div class="custom-dd__control" tabindex="0">
      <span class="custom-dd__label custom-dd__placeholder">${placeholder}</span>
      <svg class="custom-dd__chev" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M7 10l5 5 5-5z"/>
      </svg>
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

  // State
  let open = false;
  let highlighted = -1;
  let filtered = options.slice();
  let selectedValue = null;

  // Helpers
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
      el.innerHTML = `<span class="custom-dd__text">${opt.label}</span>${checkmark}`;
      list.appendChild(el);
    });
    updateHighlight();
  }

  function openMenu() {
    open = true;
    root.classList.add('custom-dd--open');
    menu.hidden = false;
    root.setAttribute('aria-expanded', 'true');
    if (searchInput) { searchInput.focus(); searchInput.select(); }
    else { list.focus(); }
  }
  function closeMenu(focusControl = true) {
    open = false;
    root.classList.remove('custom-dd--open');
    menu.hidden = true;
    root.setAttribute('aria-expanded', 'false');
    highlighted = -1;
    if (focusControl) control.focus();
  }

  function toggleMenu() {
    if (open) closeMenu();
    else openMenu();
  }

  function updateHighlight() {
    const items = Array.from(list.querySelectorAll('.custom-dd__option'));
    items.forEach((it, i) => {
      it.dataset.highlight = (i === highlighted) ? 'true' : 'false';
      // scroll into view when highlighted
      if (i === highlighted) {
        it.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  function highlightNext(delta = 1) {
    const n = filtered.length;
    if (n === 0) return;
    if (highlighted === -1) {
      highlighted = delta > 0 ? 0 : n - 1;
    } else {
      highlighted = (highlighted + delta + n) % n;
    }
    updateHighlight();
  }

  function selectHighlighted() {
    if (highlighted < 0 || highlighted >= filtered.length) return;
    selectValue(filtered[highlighted].value);
  }

  function selectValue(val) {
    const opt = options.find(o => o.value === val);
    if (!opt) return;
    selectedValue = opt.value;
    label.classList.remove('custom-dd__placeholder');
    label.textContent = opt.label;
    // dispatch change event from root
    const evt = new CustomEvent('change', { detail: { value: selectedValue, option: opt }});
    root.dispatchEvent(evt);
    renderList();
    closeMenu(true);
  }

  function filterBy(q) {
    const qq = (q || '').trim().toLowerCase();
    if (!qq) filtered = options.slice();
    else filtered = options.filter(o => o.label.toLowerCase().includes(qq) || String(o.value).toLowerCase().includes(qq));
    highlighted = filtered.length ? 0 : -1;
    renderList();
  }

    root.setOptions = (newOptions) => {
        if (!Array.isArray(newOptions)) return;
        options = newOptions.slice(); // обновляем все опции
        filterBy(searchInput?.value || ''); // применяем фильтр и перерисовываем список
    };

  // Initial render
  renderList();

  // Event listeners
  control.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  control.addEventListener('keydown', (e) => {
    if (['ArrowDown','ArrowUp','Enter',' '].includes(e.key)) {
      e.preventDefault();
      openMenu();
      if (e.key === 'ArrowDown') highlightNext(0); // ensure first
      return;
    }
  });

  list.addEventListener('click', (e) => {
    const opt = e.target.closest('.custom-dd__option');
    if (!opt) return;
    if (opt.disabled === 'true') return;
    selectValue(opt.dataset.value);
  });

  list.addEventListener('mousemove', (e) => {
    const opt = e.target.closest('.custom-dd__option');
    if (!opt) return;
    highlighted = Number(opt.dataset.index);
    updateHighlight();
  });

  // Keyboard navigation on list/search
  const keyHandler = (e) => {
    if (!open) return;
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); highlightNext(1); break;
      case 'ArrowUp': e.preventDefault(); highlightNext(-1); break;
      case 'Enter': e.preventDefault(); selectHighlighted(); break;
      case 'Escape': e.preventDefault(); closeMenu(); break;
      case 'Home': e.preventDefault(); highlighted = 0; updateHighlight(); break;
      case 'End': e.preventDefault(); highlighted = filtered.length - 1; updateHighlight(); break;
    }
  };

  list.addEventListener('keydown', keyHandler);
  if (searchInput) {
    searchInput.addEventListener('keydown', keyHandler);
    searchInput.addEventListener('input', (e) => {
      filterBy(e.target.value);
    });
  }

  // close on outside click
  document.addEventListener('click', (e) => {
    if (!root.contains(e.target)) closeMenu(false);
  });

  // expose API on element
  root.getValue = () => selectedValue;
  root.setValue = (v) => selectValue(v);
  root.open = openMenu;
  root.close = closeMenu;

  return root;
}

/* --------------- Пример использования --------------- */
let flags = [
    { value: '', label: '--- None ---' },
    { value: 'haiti', label: 'haiti' },
    { value: 'flag_of_union', label: 'flag_of_union' },
    { value: 'costa_rica', label: 'costa_rica' },
    { value: 'panama1861', label: 'panama1861' },
    { value: 'colombia', label: 'colombia' },
    { value: 'venezuela1861', label: 'venezuela1861' },
    { value: 'equador', label: 'equador' },
    { value: 'mexic01861', label: 'mexic01861' },
    { value: 'peru', label: 'peru' },
    { value: 'chile', label: 'chile' },
    { value: 'argentine', label: 'argentine' },
    { value: 'bolivia', label: 'bolivia' },
    { value: 'paraguay', label: 'paraguay' },
    { value: 'uruguay', label: 'uruguay' },
    { value: 'second_flag_empire_of_brazil', label: 'second_flag_empire_of_brazil' },
    { value: 'union_jack', label: 'union_jack' },
    { value: 'confederate_states_of_america', label: 'confederate_states_of_america' },
    { value: 'russian_empire', label: 'russian_empire' },
    { value: 'guatemala', label: 'guatemala' },
    { value: 'spain', label: 'spain' },
    { value: 'france', label: 'france' },
    { value: 'netherlands', label: 'netherlands' },
    { value: 'denmark', label: 'denmark' },
    { value: 'el_salvador', label: 'el_salvador' },
    { value: 'honduras', label: 'honduras' },
    { value: 'nicaragua', label: 'nicaragua' },
    { value: 'soviet_russia', label: 'soviet_russia' },
    { value: 'ireland', label: 'ireland' },
    { value: 'weimar_republic', label: 'weimar_republic' },
    { value: 'russian_empire2', label: 'russian_empire2' },
    { value: 'serbia', label: 'serbia' },
    { value: 'belgium', label: 'belgium' },
    { value: 'luxembourg', label: 'luxembourg' },
    { value: 'lithuania', label: 'lithuania' },
    { value: 'latvia', label: 'latvia' },
    { value: 'estonia', label: 'estonia' },
    { value: 'finland', label: 'finland' },
    { value: 'sweden', label: 'sweden' },
    { value: 'norway', label: 'norway' },
    { value: 'switzerland', label: 'switzerland' },
    { value: 'czechoslovakia', label: 'czechoslovakia' },
    { value: 'romania', label: 'romania' },
    { value: 'bulgaria', label: 'bulgaria' },
    { value: 'greece', label: 'greece' },
    { value: 'albania', label: 'albania' },
    { value: 'bavarian_soviet_republic', label: 'bavarian_soviet_republic' },
    { value: 'sultanate_egypt', label: 'sultanate_egypt' },
    { value: 'persia', label: 'persia' },
    { value: 'italy', label: 'italy' },
    { value: 'ukrainian_peoples_republic', label: 'ukrainian_peoples_republic' },
    { value: 'poland', label: 'poland' },
    { value: 'german_empire', label: 'german_empire' },
    { value: 'ottoman_empire', label: 'ottoman_empire' },
    { value: 'portugal', label: 'portugal' },
    { value: 'azerbaijan_democratic_republic', label: 'azerbaijan_democratic_republic' },
    { value: 'armenia', label: 'armenia' },
    { value: 'democratic_republic_of_georgia', label: 'democratic_republic_of_georgia' },
    { value: 'soviet_union', label: 'soviet_union' },
    { value: 'austria', label: 'austria' },
    { value: 'hungary', label: 'hungary' },
    { value: 'yugoslavia', label: 'yugoslavia' },
    { value: 'azerbaijan', label: 'azerbaijan' },
    { value: 'free_state_of_bottleneck', label: 'free_state_of_bottleneck' },
    { value: 'northem_corps', label: 'northem_corps' },
    { value: 'makhnovshchina', label: 'makhnovshchina' },
    { value: 'iceland', label: 'iceland' },
    { value: 'latvian_soviet_republic', label: 'latvian_soviet_republic' },
    { value: 'austria_hungary', label: 'austria_hungary' },
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