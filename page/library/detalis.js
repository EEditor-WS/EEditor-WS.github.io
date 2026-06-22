/* ==========================================================================
   1. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И НАСТРОЙКА ОКРУЖЕНИЯ
   ========================================================================== */
let params;
let fileType;
let scenarioId;
let scenarioArray;
let scenarioConent;
let scenarioMap;

/* ==========================================================================
   2. ИНИЦИАЛИЗАЦИЯ И ИЗВЛЕЧЕНИЕ ДАННЫХ ИЗ URL
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, что глобальный массив данных о сценариях доступен
    if (typeof scenariosData === 'undefined' || !Array.isArray(scenariosData)) {
        console.error('Ошибка: Массив scenariosData не найден или объявлен некорректно.');
        return; 
    }
    
    // Считываем параметры строки запроса URL
    params = new URLSearchParams(document.location.search);
    fileType = params.get('type');
    
    const rawScenarioId = params.get('scenario');
    if (!rawScenarioId) {
        console.warn("Параметр 'scenario' не найден в URL.");
        return;
    }
    
    const cleanScenarioId = rawScenarioId.replace(/\.json$/i, '');
    
    // Преобразуем имя сценария в массив по разделителю '_' (например: eeditor_blank_v1)
    scenarioArray = cleanScenarioId.split('_');
    console.log("Целевой массив из URL:", scenarioArray);

    // Ищем метаданные сценария в локальной базе scenariosData
    const foundScenario = scenariosData.find(scenario => {
        if (!Array.isArray(scenario.id)) return false;
        return JSON.stringify(scenarioArray) === JSON.stringify(scenario.id);
    });

    // Если метаданные сценария не найдены в maplist.js / scenariosData
    if (!foundScenario) {
        console.error(`Сценарий с ID "${cleanScenarioId}" не найден в базе данных scenariosData.`);
        return;
    }

    /* ==========================================================================
       3. ФУНКЦИЯ ОТРИСОВКИ ИНТЕРФЕЙСА (ПОСЛЕ ЗАГРУЗКИ JSON)
       ========================================================================== */
    function setOtherParams() {
        console.log('Сценарий успешно сопоставлен:', foundScenario.title);
        console.log('Данные метаструктуры:', foundScenario);
        
        // Заполнение текстовых узлов и инпутов данными метаструктуры
        document.getElementById('scenario-name').textContent = foundScenario.title;
        document.getElementById('scenarioTitle').value = foundScenario.title;
        document.getElementById('scenarioAuthor').value = Array.isArray(foundScenario.author) ? foundScenario.author.join(', ') : foundScenario.author;
        document.getElementById('scenarioMap').value = foundScenario.id.slice(0, 2).join('_');
        document.getElementById('scenarioLang').value = foundScenario.languages ? foundScenario.languages[0] : '';
        document.getElementById('scenarioPublish').value = foundScenario.publishDate;
        document.getElementById('scenarioUpdate').value = foundScenario.lastUpdate;
        
        // Наполнение данными из тела самого файла сценария (scenarioConent)
        document.getElementById('scenarioProvinces').value = scenarioConent.num_of_provinces || 0;
        
        // Безопасный подсчет кастомных ивентов
        if (scenarioConent.custom_events && Object.keys(scenarioConent.custom_events).length > 0) {
            document.getElementById('scenarioEvents').value = Object.keys(scenarioConent.custom_events).length;
        } else {
            document.getElementById('scenarioEvents').value = 0;
        }
        
        // Определение наличия механик по ключевым маркерам в строке структуры
        const contentString = JSON.stringify(scenarioConent);
        document.getElementById('scenarioEconomy').value = contentString.includes('infrastructure_level') ? 'yes' : 'no';
        document.getElementById('scenarioResources').value = contentString.includes('resource_rule') ? 'yes' : 'no';
        document.getElementById('scenarioReforms').value = contentString.includes('reforms') ? 'yes' : 'no';
        
        // Рендеринг интерактивного описания (eeditor)
        const targetDiv = document.getElementById('description');

        if (scenarioConent.eeditor?.description) { 
            // 1. Вставляем отрендеренную Markdown-разметку с сохранением HTML-тегов
            targetDiv.innerHTML = discordMarkdownToHtml(scenarioConent.eeditor.description, true);

            // 2. Гарантированное выполнение скриптов в глобальном контексте window через eval
            targetDiv.querySelectorAll('script').forEach(oldScript => {
                try {
                    // Берем чистый текст скрипта, убираем возможные HTML-сущности, если они проскочили
                    let code = oldScript.textContent
                        .replace(/&amp;/g, '&')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&quot;/g, '"')
                        .replace(/&#39;/g, "'");

                    const globalEval = window.eval;
                    globalEval(code);
                } catch (e) {
                    console.error("Ошибка при инициализации скрипта из описания:", e);
                }
            });
        } else { 
            targetDiv.innerHTML = 'Описание отсутствует.'; 
        }

        // НОВЫЙ МЕХАНИЗМ: Добавление iframe в конец описания без перезаписи innerHTML
        if (scenarioConent && scenarioConent.eeditor.iframe) {
            const iframeUrl = `${libLink}lib/${foundScenario.id.slice(0, 2).join('/')}/${rawScenarioId.replace(/\.json$/i, '')}.html`;
            
            const iframeHTML = `
                <div class="scenario-iframe-container" style="margin-top: 20px;">
                    <iframe src="${iframeUrl}" style="width: 100%; height: 600px; border: none;" allowfullscreen></iframe>
                </div>
            `;
            
            // Вставляем строго перед закрывающим тегом #description, сохраняя все скрипты и текст
            targetDiv.insertAdjacentHTML('beforeend', iframeHTML);
        }

        // Подгрузка превью-изображения (скриншота) карты
        document.getElementById('screenshoot').src = `${libLink}lib/${foundScenario.id.slice(0, 2).join('/')}/${cleanScenarioId}.webp`;

        // Логика обработчиков клика для кнопок скачивания
        document.getElementById('downloadScenarioDetalis').onclick = () => {
            libDownloadScenario(`${libLink}lib/${foundScenario.id.slice(0, 2).join('/')}/${cleanScenarioId}`, foundScenario, true);
        };
        document.getElementById('downloadMapDetalis').onclick = () => {
            downloadMapMap(`${foundScenario.id[0]}_${foundScenario.id[1]}_${foundScenario.id[2]}`);
        };
    }

    /* ==========================================================================
       4. ЗАПРОС ТЕЛА СЦЕНАРИЯ С СЕРВЕРА / ИЗ РЕПОЗИТОРИЯ
       ========================================================================== */
    fetch(`${libLink}lib/${foundScenario.id.slice(0, 2).join('/')}/${rawScenarioId.replace(/\.json$/i, '')}.json`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); 
    })
    .then(data => {
        scenarioConent = data;
        setOtherParams(); // Запуск отрисовки после успешного получения контента
    })
    .catch(error => {
        console.error('Ошибка Fetch при получении файла сценария:', error);
    });
});

/* ==========================================================================
   5. ПАРСЕР РАЗМЕТКИ DISCORD MARKDOWN TO HTML (МОДИФИЦИРОВАННЫЙ)
   ========================================================================== */
function discordMarkdownToHtml(input, skipEscapeHtml = false) {
  if (input == null) return '';

  const escapeHtml = (s) => {
    if (skipEscapeHtml) return String(s);
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const codeBlockPlaceholders = [];
  const inlineCodePlaceholders = [];
  const scriptPlaceholders = []; // Хранилище для сырых скриптов

  // ШАГ 0: Изолируем теги <script> до какого-либо победного конца, чтобы парсер их не трогал
  let text = input.replace(/<script([\s\S]*?)>([\s\S]*?)<\/script>/gi, (m, attrs, content) => {
    const idx = scriptPlaceholders.length;
    scriptPlaceholders.push(`<script${attrs}>${content}</script>`);
    return `\u0000RAWSCRIPT${idx}\u0000`;
  });

  // Изоляция многострочных блоков кода ```
  text = text.replace(/```([\s\S]*?)```/g, (m, inner) => {
    const idx = codeBlockPlaceholders.length;
    codeBlockPlaceholders.push('<pre><code>' + escapeHtml(inner.replace(/^\n|\n$/g, '')) + '</code></pre>');
    return `\u0000CODEBLOCK${idx}\u0000`;
  });

  text = escapeHtml(text);

  // Изоляция инлайнового кода
  text = text.replace(/(`+)([\s\S]*?)\1(?=(?:[^>]*<|[^<>]*$))/g, (m, ticks, inner) => {
    const idx = inlineCodePlaceholders.length;
    inlineCodePlaceholders.push('<code>' + escapeHtml(inner) + '</code>');
    return `\u0000INLINECODE${idx}\u0000`;
  });

  const lines = text.split(/\r?\n/);
  let out = '';
  let inStyleBlock = false;

  const listStack = [];
  const closeListsToDepth = (targetDepth) => {
    while (listStack.length > targetDepth) {
      const top = listStack.pop();
      out += top.type === 'ul' ? '</ul>' : '</ol>';
    }
  };

  const pushList = (type, depth) => {
    out += type === 'ul' ? '<ul>' : '<ol>';
    listStack.push({type, depth});
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (/^\s*$/.test(line)) {
      closeListsToDepth(0);
      continue;
    }

    // Многострочные цитаты >>>
    const trimmed = line.trimStart();
    if (trimmed.startsWith('&gt;&gt;&gt;') || trimmed.startsWith('>>>')) {
      let content = trimmed.replace(/^(&gt;){3}|^>{3}/, '').trimStart();
      let j = i + 1;
      while (j < lines.length && !/^\s*$/.test(lines[j])) {
        content += '\n' + lines[j];
        j++;
      }
      i = j - 1;
      closeListsToDepth(0);
      content = restoreInlinePlaceholders(content);
      content = processInlineFormatting(content);
      out += '<blockquote><p>' + content.replace(/\n/g, '<br/>') + '</p></blockquote>';
      continue;
    }

    // Однострочные цитаты >
    const bqMatch = line.match(/^\s*&gt;?&gt;?\s*(.*)$/) || line.match(/^\s*>+\s*(.*)$/);
    if ((bqMatch && /^\s*>/.test(line)) || /^\s*&gt;/.test(line)) {
      const raw = line.replace(/^\s*/, '');
      const gtCount = (raw.match(/^(&gt;|>)+/) || [''])[0].replace(/(&gt;)/g, '>').length;
      const after = raw.replace(/^(&gt;|>)+\s*/, '');
      closeListsToDepth(0);
      const content = processInlineFormatting(restoreInlinePlaceholders(after));
      let bqHtml = content;
      for (let k = 0; k < gtCount; k++) bqHtml = '<blockquote>' + bqHtml + '</blockquote>';
      out += bqHtml;
      continue;
    }

    // Заголовки h1 - h6
    const headerMatch = line.match(/^\s*(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      closeListsToDepth(0);
      const level = headerMatch[1].length;
      const content = processInlineFormatting(restoreInlinePlaceholders(headerMatch[2].trim()));
      out += `<h${level}>${content}</h${level}>`;
      continue;
    }

    // Списки
    const listMatch = line.match(/^\s*([-*+])\s+(.*)$/);
    const olMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (listMatch || olMatch) {
      const spaces = (listMatch ? line.match(/^\s*/)[0].length : line.match(/^\s*/)[0].length);
      const depth = Math.floor(spaces / 2);
      const isUl = !!listMatch;
      const itemText = (listMatch ? listMatch[2] : olMatch[2]).trim();

      while (listStack.length > 0 && listStack[listStack.length - 1].depth > depth) {
        closeListsToDepth(listStack.length - 1);
      }
      while (listStack.length <= depth) {
        const newType = isUl ? 'ul' : 'ol';
        pushList(newType, listStack.length);
      }
      if (listStack.length && listStack[listStack.length - 1].type !== (isUl ? 'ul' : 'ol')) {
        closeListsToDepth(listStack.length - 1);
        pushList(isUl ? 'ul' : 'ol', listStack.length);
      }

      out += '<li>' + processInlineFormatting(restoreInlinePlaceholders(itemText)) + '</li>';
      continue;
    }

    closeListsToDepth(0);
    const trimmedLine = line.trim();

    if (trimmedLine.toLowerCase().startsWith('<style')) inStyleBlock = true;

    // Исключаем разметку параграфов для скриптов-плейсхолдеров и стилей
    if (inStyleBlock || trimmedLine.includes('\u0000RAWSCRIPT') || /^<\/?(div|style|script|ol|ul|li|h[1-6]|blockquote|p)/i.test(trimmedLine)) {
        out += processInlineFormatting(restoreInlinePlaceholders(trimmedLine));
    } else {
        out += '<p>' + processInlineFormatting(restoreInlinePlaceholders(trimmedLine)) + '</p>';
    }

    if (trimmedLine.toLowerCase().includes('</style>')) inStyleBlock = false;
  }

  closeListsToDepth(0);

  // Возврат заблокированных сущностей на свои места
  out = out.replace(/\u0000INLINECODE(\d+)\u0000/g, (_, idx) => inlineCodePlaceholders[Number(idx)] || '');
  out = out.replace(/\u0000CODEBLOCK(\d+)\u0000/g, (_, idx) => codeBlockPlaceholders[Number(idx)] || '');
  out = out.replace(/\u0000RAWSCRIPT(\d+)\u0000/g, (_, idx) => scriptPlaceholders[Number(idx)] || '');

  return out;

  function restoreInlinePlaceholders(s) {
    return s.replace(/\u0000INLINECODE(\d+)\u0000/g, (_, idx) => inlineCodePlaceholders[Number(idx)] || '')
            .replace(/\u0000CODEBLOCK(\d+)\u0000/g, (_, idx) => codeBlockPlaceholders[Number(idx)] || '');
  }

  function processInlineFormatting(s, allowLinks = true) {
    if (!s) return '';

    const linkPlaceholders = [];
    if (allowLinks) {
      s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, text, url) => {
        const processedText = processInlineFormatting(text, false);
        const safeUrl = escapeHtml(url);
        const idx = linkPlaceholders.length;
        linkPlaceholders.push(`<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${processedText}</a>`);
        return `\u0000LINK${idx}\u0000`;
      });
    }

    s = s.replace(/\|\|([\s\S]+?)\|\|/g, (m, inside) => {
      return `<span class="spoiler" style="background:#444;color:#444;filter:blur(4px);cursor:pointer;" onclick="this.style.filter='none';this.style.color='inherit';this.style.background='transparent';">${inside}</span>`;
    });

    s = s.replace(/~~([\s\S]+?)~~/g, '<del>$1</del>');
    s = s.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/__([\s\S]+?)__/g, '<u>$1</u>');
    s = s.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    s = s.replace(/(?<!_)_([^_]+)_(?!_)/g, '<em>$1</em>');

    if (allowLinks && linkPlaceholders.length > 0) {
      s = s.replace(/\u0000LINK(\d+)\u0000/g, (_, idx) => linkPlaceholders[Number(idx)] || '');
    }

    return s;
  }
}