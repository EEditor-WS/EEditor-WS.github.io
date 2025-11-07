document.addEventListener('DOMContentLoaded', () => {
  // Парсер даты -> timestamp (ms)
  function toTs(d) {
    if (d == null) return 0;
    if (d instanceof Date) {
      const t = d.getTime();
      return isNaN(t) ? 0 : t;
    }
    if (typeof d === 'number') return isNaN(d) ? 0 : d;
    const asNum = Number(d);
    if (!Number.isNaN(asNum)) return asNum;
    const parsed = Date.parse(String(d));
    return isNaN(parsed) ? 0 : parsed;
  }

  // Определяем, является ли сценарий ивентом по title (EN/RU)
  function isEvent(scenario) {
    if (!scenario || !scenario.title) return false;
    const t = String(scenario.title).toLowerCase();
    return t.includes('(events)') || t.includes('(ивенты)');
  }

  // isAlthist: scenario.period == 'alternative'
  function isAlthist(scenario) {
    if (!scenario) return false;
    // защитимся от null/undefined и разных регистров
    return String(scenario.period || '').toLowerCase() === 'alternative';
  }

  // isDetailed (проработанные): awards содержит "star"
  function isDetailed(scenario) {
    if (!scenario) return false;
    const aw = scenario.awards;
    if (!aw) return false;
    // если awards — массив
    if (Array.isArray(aw)) {
      for (const a of aw) {
        if (!a) continue;
        const s = (typeof a === 'string') ? a.toLowerCase() : (
          typeof a === 'object' ? (
            (a.type && String(a.type).toLowerCase()) ||
            (a.subtype && String(a.subtype).toLowerCase()) ||
            (a.id && String(a.id).toLowerCase()) ||
            ''
          ) : ''
        );
        if (s === 'star' || s.includes('star')) return true;
      }
      return false;
    }
    // если awards — строка
    if (typeof aw === 'string') {
      return aw.toLowerCase().split(/[,;\s]+/).some(x => x === 'star' || x.includes('star'));
    }
    // другой формат — попытка привести к строке
    return String(aw).toLowerCase().includes('star');
  }

  // isUnusual: tags contains "unusual" (case-insensitive)
  function isUnusual(scenario) {
    if (!scenario) return false;
    const tags = scenario.tags || scenario.labels || scenario.categories || [];
    if (Array.isArray(tags)) {
      return tags.some(t => {
        if (!t) return false;
        return String(t).toLowerCase() === 'unusual' || String(t).toLowerCase().includes('unusual');
      });
    }
    if (typeof tags === 'string') {
      return tags.toLowerCase().split(/[,;\s]+/).some(x => x === 'unusual' || x.includes('unusual'));
    }
    return false;
  }

  // Сортировка массива по lastUpdate (новые сверху)
  function sortByLastUpdateDesc(arr) {
    return arr.slice().sort((a, b) => toTs(b.lastUpdate) - toTs(a.lastUpdate));
  }

  // Сортировка массива по score (новые сверху)
  function sortByScoreDesc(arr) {
    return arr.slice().sort((a, b) => b.score - a.score);
  }

  // Поиск глобальной переменной scenariosData безопасно
  function findScenariosData() {
    if (typeof scenariosData !== 'undefined' && Array.isArray(scenariosData)) return scenariosData;
    if (typeof globalThis !== 'undefined' && Array.isArray(globalThis.scenariosData)) return globalThis.scenariosData;
    if (typeof window !== 'undefined' && Array.isArray(window.scenariosData)) return window.scenariosData;
    return null;
  }

  // Универсальная вставка: поддерживает generateScenarioCard возвращающую строку или DOM-узел
  function renderListInto(container, items) {
    if (!container) return;
    container.innerHTML = '';
    if (!items || items.length === 0) {
      container.textContent = 'Сценарии не найдены.';
      return;
    }

    const gen = (typeof globalThis.generateScenarioCard === 'function')
      ? globalThis.generateScenarioCard
      : (typeof window.generateScenarioCard === 'function' ? window.generateScenarioCard : null);

    if (!gen) {
      // fallback — просто JSON
      const frag = document.createDocumentFragment();
      items.forEach(it => {
        const pre = document.createElement('pre');
        pre.textContent = JSON.stringify(it, null, 2);
        frag.appendChild(pre);
      });
      container.appendChild(frag);
      return;
    }

    // Проверим, что возвращает generateScenarioCard для первого — строка или узел
    let sample;
    try {
      sample = gen(items[0]);
    } catch (e) {
      console.warn('generateScenarioCard бросает при вызове:', e);
      sample = null;
    }

    if (typeof sample === 'string') {
      // Если строка — собираем innerHTML
      const html = items.map(i => gen(i)).join('');
      container.innerHTML = html;
      return;
    }

    // Иначе ожидаем DOM-узлы
    const frag = document.createDocumentFragment();
    for (const it of items) {
      let node;
      try {
        node = gen(it);
      } catch (e) {
        console.warn('generateScenarioCard бросил для элемента', it, e);
        continue;
      }
      if (!node) continue;
      if (typeof node === 'string') {
        const tmp = document.createElement('div');
        tmp.innerHTML = node;
        while (tmp.firstChild) frag.appendChild(tmp.firstChild);
      } else if (node instanceof Node) {
        frag.appendChild(node);
      } else {
        console.warn('generateScenarioCard вернула неожиданный тип:', node);
      }
    }
    container.appendChild(frag);
  }

  // Получаем все контейнеры
  const containerEvents = document.getElementById('libgroup_events');
  const containerNew = document.getElementById('libgroup_new');
  const containerDetailed = document.getElementById('libgroup_detailed');
  const containerUnusual = document.getElementById('libgroup_unusual');
  const containerAlthist = document.getElementById('libgroup_althist');

  // Если ни одного контейнера нет — выходим
  if (!containerEvents && !containerNew && !containerDetailed && !containerUnusual && !containerAlthist) {
    console.warn('Ни один из контейнеров для сценариев не найден (events/new/detailed/unusual/althist).');
    return;
  }

  // Попытка получить данные сразу, иначе короткий poll до 5 секунд
  let attempts = 0;
  const maxAttempts = 25;
  const intervalMs = 200;

  function tryLoadAndRender() {
    const data = findScenariosData();
    if (!Array.isArray(data)) return false;

    // Формируем отдельные массивы
    const events = data.filter(isEvent);
    const nonEvents = data.filter(s => !isEvent(s));

    const althist = data.filter(isAlthist);
    const detailed = data.filter(isDetailed);
    const unusual = data.filter(isUnusual);

    // Сортируем все по lastUpdate (новые сверху)
    const eventsSorted = sortByLastUpdateDesc(events);
    const nonEventsSorted = sortByLastUpdateDesc(nonEvents);
    const althistSorted = sortByLastUpdateDesc(althist);
    const detailedSorted = sortByLastUpdateDesc(detailed);
    const unusualSorted = sortByLastUpdateDesc(unusual);

    // Рендерим туда, где есть контейнер
    if (containerEvents) renderListInto(containerEvents, eventsSorted);
    if (containerNew) renderListInto(containerNew, nonEventsSorted);
    if (containerAlthist) renderListInto(containerAlthist, althistSorted);
    if (containerDetailed) renderListInto(containerDetailed, detailedSorted);
    if (containerUnusual) renderListInto(containerUnusual, unusualSorted);

    return true;
  }

  if (!tryLoadAndRender()) {
    const timer = setInterval(() => {
      attempts++;
      if (tryLoadAndRender()) {
        clearInterval(timer);
        return;
      }
      if (attempts >= maxAttempts) {
        clearInterval(timer);
        // Если данные так и не появились — покажем сообщение в тех контейнерах, которые существуют
        if (containerEvents && containerEvents.innerHTML.trim() === '') containerEvents.textContent = 'Данные сценариев не загружены.';
        if (containerNew && containerNew.innerHTML.trim() === '') containerNew.textContent = 'Данные сценариев не загружены.';
        if (containerAlthist && containerAlthist.innerHTML.trim() === '') containerAlthist.textContent = 'Данные сценариев не загружены.';
        if (containerDetailed && containerDetailed.innerHTML.trim() === '') containerDetailed.textContent = 'Данные сценариев не загружены.';
        if (containerUnusual && containerUnusual.innerHTML.trim() === '') containerUnusual.textContent = 'Данные сценариев не загружены.';
        console.warn('scenariosData не найдено после ожидания. Проверь, где и когда задаётся scenariosData.');
      }
    }, intervalMs);
  }
});
