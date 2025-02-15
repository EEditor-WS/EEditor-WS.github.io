import json

# Читаем JSON файл
with open('World_WW2.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Список параметров для удаления из провинций
province_params_to_remove = [
    'recruited',
    'relief',
    'garrison',
    'discontent',
    'buildings',
    'resources',
    'economy',
    'true_owner',
    'army',
    'population',
    'defense_line'
]

# Список параметров для удаления из стран
country_params_to_remove = [
    'opened_institutions',
    'branch'
]

# Очищаем провинции
for province in data['provinces']:
    if 'water' not in province:  # Пропускаем водные провинции
        for param in province_params_to_remove:
            if param in province:
                del province[param]

# Очищаем страны
for country_id, country in data['lands'].items():
    for param in country_params_to_remove:
        if param in country:
            del country[param]

# Сохраняем очищенный JSON
with open('World_WW2.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print("Файл успешно очищен от неиспользуемых параметров.") 