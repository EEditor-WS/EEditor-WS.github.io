import json

def load_json(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)

# Загружаем оба файла
file1 = load_json('World_WW2.json')
file2 = load_json('World_WW2 (1).json')

# Функция для сравнения структуры
def compare_structure(data1, data2, path=""):
    if isinstance(data1, dict):
        if not isinstance(data2, dict):
            print(f"Разные типы в {path}: dict vs {type(data2)}")
            return
        
        keys1 = set(data1.keys())
        keys2 = set(data2.keys())
        
        # Проверяем разницу в ключах
        if keys1 != keys2:
            extra_keys1 = keys1 - keys2
            extra_keys2 = keys2 - keys1
            if extra_keys1:
                print(f"Ключи только в первом файле в {path}: {extra_keys1}")
            if extra_keys2:
                print(f"Ключи только во втором файле в {path}: {extra_keys2}")
        
        # Рекурсивно сравниваем значения
        for key in keys1 & keys2:
            new_path = f"{path}.{key}" if path else key
            compare_structure(data1[key], data2[key], new_path)
            
    elif isinstance(data1, list):
        if not isinstance(data2, list):
            print(f"Разные типы в {path}: list vs {type(data2)}")
            return
        
        if len(data1) != len(data2):
            print(f"Разная длина списков в {path}: {len(data1)} vs {len(data2)}")
            return
            
        for i, (item1, item2) in enumerate(zip(data1, data2)):
            compare_structure(item1, item2, f"{path}[{i}]")

print("Сравнение структуры файлов:")
compare_structure(file1, file2) 