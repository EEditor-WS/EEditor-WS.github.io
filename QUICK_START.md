# Быстрая справка - Новый редактор требований/бонусов

## Что изменилось?

### 1. **Action теперь кнопки вместо select**
   - Вместо выпадающего списка для `action` теперь 4 кнопки:
   - `=` (равно / equal)
   - `≠` (не равно / not equal) 
   - `>` (больше / greater than)
   - `<` (меньше / less than)
   - Просто нажмите кнопку чтобы выбрать операцию

### 2. **Автоматическое отслеживание изменений**
   - Все изменения в полях требований/бонусов теперь отслеживаются
   - При каждом изменении вызывается обработчик `onRequirementFieldChange()`
   - Данные логируются в консоль (F12 → Console)

### 3. **Отслеживаемые поля:**
   - `action` - операция сравнения (equal, not_equal, more, less)
   - `subtype` - дополнительный параметр (страна, тип, и т.д.)
   - `value` - значение условия/эффекта
   - `duration` - длительность (только для бонусов)

---

## Как пользователю это видно?

### При редактировании требования:

```
Тип требования: money [выпадающий список]

action (новое!):
┌───┬────┬───┬───┐
│ = │ ≠  │ > │ < │  ← выберите одну кнопку
└───┴────┴───┴───┘

Subtype: [скрыто для большинства типов]

Value: [input field]
```

### История изменений:
```
При каждом клике, выборе, вводе в консоли (F12) будет:
"Requirement field changed: action = equal"
"Requirement field changed: value = 1000"
"Requirement field changed: subtype = some_value"
```

---

## Для разработчиков

### Файлы которые были изменены:

1. **js/reqbon.js**
   - Добавлена функция `createActionButtons()`
   - Обновлена функция `returnPlace()` для использования кнопок вместо select

2. **js/events/events-main.js**
   - Обновлена функция `updateValueField()` с event listeners
   - Обновлена функция сохранения для работы с кнопками
   - Добавлен метод `onRequirementFieldChange()`

3. **css/style.css**
   - Добавлены стили для `.action-buttons-group`
   - Добавлены стили для `.action-button`
   - Добавлены hover и active состояния

### Расширение функциональности:

Метод `onRequirementFieldChange()` можно расширить для:
- Сохранения в localStorage
- Обновления JSON данных в реальном времени
- Валидации полей
- Логирования истории изменений
- Отправки на сервер

Примеры реализации см. в файле `IMPLEMENTATION_EXAMPLES.js`

---

## Технические детали

### Event Listeners:
- **change** событие на input/select элементах
- **input** событие для real-time обновления
- **click** события на кнопках action

### Структура кнопок action:
```html
<div class="action-buttons-group" id="requirement-action">
  <button type="button" class="action-button active" data-value="equal">=</button>
  <button type="button" class="action-button" data-value="not_equal">≠</button>
  <button type="button" class="action-button" data-value="more">></button>
  <button type="button" class="action-button" data-value="less"><</button>
  <input type="hidden" class="action-value" value="equal">
</div>
```

### Как сохраняется значение:
1. Нажимаем кнопку → она получает класс `active`
2. Скрытый input обновляется с `data-value` кнопки
3. При сохранении берется значение из скрытого input'а
4. Все совместимо с существующим кодом

---

## Совместимость

✅ Полностью обратно совместимо
✅ Работает со всеми браузерами
✅ Мобильные устройства (кнопки легче тапить чем select)
✅ Не требует дополнительных библиотек
✅ Работает с существующими сохранениями

---

## Консоль отладки

Откройте консоль браузера (F12) и переходите на вкладку **Console**.

Вы увидите сообщения вроде:
```
Requirement field changed: type = money
Requirement field changed: action = more
Requirement field changed: value = 5000
Requirement field changed: duration = 10
```

Это нормально - это логирование всех изменений для отладки.

---

## FAQ

**Q: Где select для action?**
A: Заменен на 4 кнопки с иконками для удобства

**Q: Нужно ли что-то менять в HTML?**
A: Нет, все работает автоматически

**Q: Будут ли сохранены мои старые требования?**
A: Да, все старые данные сохранены и совместимы

**Q: Можно ли отключить логирование?**
A: Да, можно закомментировать строку console.log в `onRequirementFieldChange()`

**Q: Как вернуть select вместо кнопок?**
A: Отредактируйте функцию `createActionButtons()` в reqbon.js

---

## Контроль версии

Все изменения задокументированы в файле `CHANGES.md`
Примеры расширения функций в файле `IMPLEMENTATION_EXAMPLES.js`

Дата создания: 29 января 2026
