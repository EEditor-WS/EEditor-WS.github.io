import json

def add_wood_disabled(file_path):
    # Читаем JSON файл
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Проходим по всем провинциям
    for province in data['provinces']:
        # Проверяем наличие параметра resource_rule
        if 'resource_rule' in province:
            # Если resource_rule это словарь и в нем нет параметра wood
            if isinstance(province['resource_rule'], dict) and 'wood' not in province['resource_rule']:
                province['resource_rule']['wood'] = 'disabled'
            # Если resource_rule это пустой список или что-то другое
            elif isinstance(province['resource_rule'], list) or not isinstance(province['resource_rule'], dict):
                province['resource_rule'] = {'wood': 'disabled'}
        else:
            # Если параметра resource_rule нет вообще
            province['resource_rule'] = {'wood': 'disabled'}
    
    # Сохраняем изменения
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

if __name__ == '__main__':
    file_path = 'euro4_eenot_coldwar.json'
    add_wood_disabled(file_path)
    print("Обработка завершена")
