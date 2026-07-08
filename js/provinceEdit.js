class provinceEditor {
    constructor() {
        this.provinceId = 0
        this.inputs = []

        // Значения по умолчанию для параметров
        // null означает "удалить ключ, если некорректно"
        this.defaults = {
            'uuid': null,
            'relief': 1,
            'owner': 'undeveloped_land',
            'true_owner': 'undeveloped_land',
            'economy': 0,
            'discontent': 0,
            'population_limit': null,
            'garrison': 0,
            'recruited': 0,
            'army': {
                cavalry: {},
                tank: {},
                artillery: {},
                shock_infantry: {},
                infantry: {}
            },
            'resource_rule': {},
            'resources': {},
            'infrastructure_level': null,
            'population': null,
            'buildings': {}
        }

        this.parameters = {
            'uuid': { value: 'string', readonly: true },
            'relief': {
                keys: {
                    plains: 1,
                    water: 'water',
                    river: 'river',
                    mountaines: 2,
                    desert: 3,
                    snow: 4
                },
                value: 'select'
            },
            owner: { value: 'country' },
            true_owner: { value: 'country' },
            'economy': { value: 'number' },
            discontent: { value: 'number', readonly: true },
            'population_limit': { value: 'number' },
            garrison: { value: 'number' },
            recruited: { value: 'number' },
            army: {
                units: Object.keys(window.unitsData || {}),
                value: 'armyList'
            },
            resource_rule: {
                keys: ['wood', 'iron', 'gold', 'oil', 'uranium'],
                value: 'isEnabled'
            },
            resources: {
                keys: ['wood', 'iron', 'gold', 'oil', 'uranium'],
                value: 'resourceList'
            },
            infrastructure_level: {
                keys: {
                    countryside: 1,
                    village: 2,
                    small_town: 3,
                    city: 4,
                    big_city: 5
                },
                value: 'select'
            },
            population: { value: 'population' },
            buildings: {
                buildings: window.buildings,
                value: 'buildingsList'
            }
        }

        this.init()
    }

    /**
     * Нормализует данные провинции: заменяет некорректные значения на дефолтные,
     * либо удаляет ключ, если для параметра дефолт не предусмотрен.
     * Применяется только к существующим ключам (не трогает отсутствующие).
     */
    _normalizeProvinceData(data) {
        if (!data || typeof data !== 'object') return

        Object.keys(this.defaults).forEach(key => {
            // Если ключа нет — не трогаем (параметр отключён пользователем)
            if (!(key in data)) return

            const value = data[key]
            const def = this.defaults[key]

            switch (key) {
                case 'uuid':
                    // Должен быть непустой строкой
                    if (typeof value !== 'string' || value.trim() === '') {
                        delete data[key]
                    }
                    break

                case 'relief':
                    // Должен быть числом или валидной строкой из keys
                    if (typeof value !== 'number' && typeof value !== 'string') {
                        data[key] = def
                    }
                    break

                case 'owner':
                case 'true_owner':
                    // Должны быть строкой
                    if (typeof value !== 'string' || value.trim() === '') {
                        data[key] = def
                    }
                    break

                case 'economy':
                case 'discontent':
                case 'population_limit':
                case 'garrison':
                case 'recruited':
                    // Должны быть числом
                    if (typeof value !== 'number' || isNaN(value)) {
                        if (def === null) {
                            delete data[key]
                        } else {
                            data[key] = def
                        }
                    }
                    break

                case 'army':
                    // Должен быть объектом; каждый тип юнита — тоже объект
                    if (!value || typeof value !== 'object' || Array.isArray(value)) {
                        data[key] = JSON.parse(JSON.stringify(def))
                    } else {
                        // Проверяем каждый тип юнита внутри
                        const armyKeys = Object.keys(def)
                        armyKeys.forEach(unitType => {
                            if (unitType in data[key]) {
                                if (!data[key][unitType] || typeof data[key][unitType] !== 'object' || Array.isArray(data[key][unitType])) {
                                    data[key][unitType] = {}
                                }
                            }
                        })
                    }
                    break

                case 'resource_rule':
                case 'resources':
                case 'buildings':
                    // Должны быть объектами (не массивами)
                    if (!value || typeof value !== 'object' || Array.isArray(value)) {
                        data[key] = {}
                    }
                    break

                case 'infrastructure_level':
                    // Должен быть числом или валидной строкой
                    if (typeof value !== 'number' && typeof value !== 'string') {
                        delete data[key]
                    }
                    break

                case 'population':
                    // Должен быть объектом
                    if (!value || typeof value !== 'object' || Array.isArray(value)) {
                        delete data[key]
                    }
                    break
            }
        })
    }

    init() {
        const inputWrap = document.querySelector('#provinceEditorIdInputWrap')
        if (!inputWrap) {
            const container = document.getElementById('provinceContainer')
        }

        const input = document.querySelector('#provinceEditorIdInput')
        const loadBtn = document.querySelector('#provinceEditorLoadBtn')

        const loadProvince = () => {
            const val = parseInt(input.value, 10)
            const total = window.countryManager?.jsonData?.provinces?.length || 0
            if (val > 0 && val <= total) {
                this.provinceId = val - 1
                // Нормализуем данные перед отображением
                const provinces = window.countryManager?.jsonData?.provinces
                if (provinces && provinces[this.provinceId]) {
                    this._normalizeProvinceData(provinces[this.provinceId])
                    window.countryManager.saveChanges()
                }
                this.updateUI()
            } else {
                window.notification.error(`Invalid index (1–${total})`)
            }
        }

        if (input) {
            input.addEventListener('change', loadProvince)
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') loadProvince()
            })
        }
        if (loadBtn) {
            loadBtn.addEventListener('click', loadProvince)
        }

        const uuidInput = document.querySelector('#provinceEditorUuid')
        if (uuidInput) {
            uuidInput.addEventListener('input', () => {
                const provinces = window.countryManager?.jsonData?.provinces
                if (provinces && this.provinceId < provinces.length) {
                    const val = uuidInput.value.trim()
                    if (val === '') {
                        delete provinces[this.provinceId].uuid
                    } else {
                        provinces[this.provinceId].uuid = val
                    }
                    window.countryManager.saveChanges()
                }
            })
        }

        this.createUI()
    }

    updateUI() {
        const provinces = window.countryManager?.jsonData?.provinces
        if (!provinces || this.provinceId >= provinces.length) return
        const data = provinces[this.provinceId]

        // Нормализуем данные при каждом обновлении UI
        this._normalizeProvinceData(data)

        const uuidInput = document.querySelector('#provinceEditorUuid')
        if (uuidInput) {
            uuidInput.value = data.uuid !== undefined && data.uuid !== null ? data.uuid : ''
        }

        this.inputs.forEach(item => {
            const { name, type, element, extra, existsCheckbox } = item

            if (name === 'uuid') return

            const exists = name in data
            if (existsCheckbox) {
                existsCheckbox.checked = exists
                const section = existsCheckbox.closest('.provinceEditorGreatSection')?.querySelector('.provinceEditorSection')
                if (section) {
                    section.classList.toggle('disabled', !exists)
                }
            }

            if (!exists) return

            const value = data[name]

            switch (type) {
                case 'number':
                case 'string':
                    element.value = (value !== undefined && value !== null) ? value : ''
                    break

                case 'select':
                    if (element.options) {
                        for (let opt of element.options) {
                            if (opt.value == value) {
                                opt.selected = true
                                break
                            }
                        }
                    }
                    break

                case 'country':
                    if (element && typeof element.setValue === 'function') {
                        element.setValue(value || '')
                    }
                    break

                case 'isEnabled': {
                    const checkboxes = extra.checkboxes || []
                    if (value && typeof value === 'object' && !Array.isArray(value)) {
                        checkboxes.forEach(cb => {
                            const key = cb.dataset.key
                            const val = value[key]
                            if (val === 'enabled') {
                                this._setCheckboxState(cb, 1)
                            } else if (val === 'disabled') {
                                this._setCheckboxState(cb, 2)
                            } else {
                                this._setCheckboxState(cb, 0)
                            }
                        })
                    } else {
                        const enabled = Array.isArray(value) ? value : []
                        checkboxes.forEach(cb => {
                            const key = cb.dataset.key
                            this._setCheckboxState(cb, enabled.includes(key) ? 1 : 0)
                        })
                    }
                    break
                }

                case 'resourceList': {
                    this._renderResourceList(element, value)
                    break
                }

                case 'armyList': {
                    this._renderArmyList(element, value)
                    break
                }

                case 'buildingsList': {
                    this._renderBuildingsList(element, value)
                    break
                }

                case 'population':
                    if (element) {
                        try {
                            element.value = JSON.stringify(value, null, 2)
                        } catch (e) {
                            element.value = ''
                        }
                    }
                    break

                default:
                    console.warn('Unknown type for update', name, type)
            }
        })
    }

    _setCheckboxState(cb, state) {
        cb.dataset.state = state
        if (state === 0) {
            cb.checked = false
            cb.indeterminate = false
        } else if (state === 1) {
            cb.checked = true
            cb.indeterminate = false
        } else if (state === 2) {
            cb.checked = false
            cb.indeterminate = true
        }
    }

    saveChanges() {
        const provinces = window.countryManager?.jsonData?.provinces
        if (!provinces || this.provinceId >= provinces.length) {
            window.notification.error('No province selected')
            return
        }
        const data = provinces[this.provinceId]

        let hasError = false

        this.inputs.forEach(item => {
            if (hasError) return

            const { name, type, element, extra, existsCheckbox } = item

            if (name === 'uuid') return

            if (!existsCheckbox.checked) {
                data[name + '_disabled'] = data[name]
                delete data[name]
                return
            } else if (data[name + '_disabled']) {
                data[name] = data[name + '_disabled']
                delete data[name + '_disabled']
            }

            let newValue

            switch (type) {
                case 'number':
                    newValue = parseFloat(element.value)
                    if (isNaN(newValue)) newValue = 0
                    break

                case 'string':
                    newValue = element.value
                    break

                case 'select':
                    newValue = element.value
                    if (newValue !== '' && !isNaN(newValue)) {
                        newValue = Number(newValue)
                    }
                    break

                case 'country':
                    if (element && typeof element.getValue === 'function') {
                        newValue = element.getValue() || ''
                    } else {
                        newValue = ''
                    }
                    break

                case 'isEnabled': {
                    const checkboxes = extra.checkboxes || []
                    const obj = {}
                    checkboxes.forEach(cb => {
                        const key = cb.dataset.key
                        const state = parseInt(cb.dataset.state, 10)
                        if (state === 1) {
                            obj[key] = 'enabled'
                        } else if (state === 2) {
                            obj[key] = 'disabled'
                        }
                    })
                    newValue = obj
                    break
                }

                case 'resourceList': {
                    newValue = this._readResourceList(element)
                    break
                }

                case 'armyList': {
                    newValue = this._readArmyList(element)
                    break
                }

                case 'buildingsList': {
                    newValue = this._readBuildingsList(element)
                    break
                }

                case 'population': {
                    const raw = element.value.trim()
                    if (raw === '') {
                        newValue = {}
                    } else {
                        try {
                            newValue = JSON.parse(raw)
                        } catch (e) {
                            window.notification.error(`Invalid JSON in field "${name}"`)
                            hasError = true
                            return
                        }
                    }
                    break
                }

                default:
                    console.warn('Unknown type for saving', name, type)
                    return
            }

            data[name] = newValue
        })

        if (hasError) return

        // Нормализуем данные после сохранения для гарантии корректности
        this._normalizeProvinceData(data)

        window.eventManager.jsonData.provinces = window.countryManager.jsonData.provinces
        document.getElementById('preview-content').value = JSON.stringify(window.countryManager.jsonData)
    }

    createUI() {
        const container = document.getElementById('provinceContainer')
        if (!container) {
            console.error('Container #provinceContainer not found')
            return
        }
        container.innerHTML = ''

        Object.keys(this.parameters).forEach(paramName => {
            if (paramName === 'uuid') return

            const paramDef = this.parameters[paramName]
            const type = paramDef.value

            const greatSection = document.createElement('div')
            greatSection.className = 'provinceEditorGreatSection'

            const section = document.createElement('div')
            section.className = 'provinceEditorSection'
            section.id = `provinceEditor-${paramName}`

            const headerDiv = document.createElement('div')
            headerDiv.className = 'provinceEditorHeader'
            greatSection.appendChild(headerDiv)

            let existsCheckbox = null
            const existsLabel = document.createElement('label')
            existsLabel.className = 'provinceEditorExistsLabel'
            existsCheckbox = document.createElement('input')
            existsCheckbox.type = 'checkbox'
            existsCheckbox.checked = true
            existsLabel.appendChild(existsCheckbox)
            headerDiv.appendChild(existsLabel)

            const headerText = document.createElement('h2')
            headerText.textContent = paramName
            headerDiv.appendChild(headerText)

            let element = null
            let extra = {}

            switch (type) {
                case 'number':
                case 'string': {
                    const input = document.createElement('input')
                    input.type = type === 'number' ? 'number' : 'text'
                    input.placeholder = type
                    if (paramDef.readonly) input.readOnly = true
                    input.addEventListener('input', () => this.saveChanges())
                    element = input
                    break
                }

                case 'select': {
                    const select = document.createElement('select')
                    const keys = paramDef.keys || {}
                    Object.entries(keys).forEach(([keyName, keyValue]) => {
                        const option = document.createElement('option')
                        option.text = keyName
                        option.value = keyValue
                        select.appendChild(option)
                    })
                    if (paramDef.readonly) select.disabled = true
                    select.addEventListener('change', () => this.saveChanges())
                    element = select
                    break
                }

                case 'country': {
                    const dd = window.dropdownAuto.country({ isUndv: true })
                    if (paramDef.readonly) {
                        const control = dd.querySelector('.custom-dd__control')
                        if (control) control.style.pointerEvents = 'none'
                    }
                    dd.addEventListener('change', () => this.saveChanges())
                    element = dd
                    section.appendChild(dd)
                    break
                }

                case 'isEnabled': {
                    const wrapper = document.createElement('div')
                    wrapper.className = 'provinceEditorCheckboxes'
                    const checkboxes = []
                    const keys = paramDef.keys || []

                    keys.forEach(key => {
                        const label = document.createElement('span')
                        label.style.cursor = 'pointer'
                        label.style.marginRight = '12px'
                        label.style.userSelect = 'none'

                        const cb = document.createElement('input')
                        cb.type = 'checkbox'
                        cb.dataset.key = key
                        cb.dataset.state = '0'
                        cb.style.cursor = 'pointer'

                        cb.addEventListener('click', (e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            this._cycleCheckboxState(cb)
                            this.saveChanges()
                        })

                        label.addEventListener('click', (e) => {
                            e.preventDefault()
                            this._cycleCheckboxState(cb)
                            this.saveChanges()
                        })

                        label.appendChild(cb)
                        label.appendChild(document.createTextNode(' ' + key))
                        wrapper.appendChild(label)
                        checkboxes.push(cb)
                    })
                    extra.checkboxes = checkboxes
                    element = wrapper
                    section.appendChild(wrapper)
                    break
                }

                case 'resourceList': {
                    const wrapper = this._createResourceListUI(paramDef)
                    element = wrapper
                    section.appendChild(wrapper)
                    break
                }

                case 'armyList': {
                    const wrapper = this._createArmyListUI(paramDef)
                    element = wrapper
                    section.appendChild(wrapper)
                    break
                }

                case 'buildingsList': {
                    const wrapper = this._createBuildingsListUI(paramDef)
                    element = wrapper
                    section.appendChild(wrapper)
                    break
                }

                case 'population': {
                    const textarea = document.createElement('textarea')
                    textarea.rows = 6
                    textarea.cols = 50
                    textarea.placeholder = `JSON для ${paramName}`
                    if (paramDef.readonly) textarea.readOnly = true
                    textarea.addEventListener('input', () => this.saveChanges())
                    element = textarea
                    break
                }

                default:
                    const dummy = document.createElement('div')
                    dummy.textContent = `Unsupported type: ${type}`
                    element = dummy
            }

            if (element && !section.contains(element)) {
                section.appendChild(element)
            }

            if (existsCheckbox) {
                existsCheckbox.addEventListener('change', () => {
                    section.classList.toggle('disabled', !existsCheckbox.checked)
                    this.saveChanges()
                })
            }

            greatSection.appendChild(section)
            container.appendChild(greatSection)

            this.inputs.push({
                name: paramName,
                type: type,
                element: element,
                extra: extra,
                existsCheckbox: existsCheckbox
            })
        })

        if (window.countryManager?.jsonData?.provinces?.length > 0) {
            this.updateUI()
        }
    }

    _cycleCheckboxState(cb) {
        let state = parseInt(cb.dataset.state, 10) || 0
        state = (state + 1) % 3
        this._setCheckboxState(cb, state)
        cb.dispatchEvent(new Event('change', { bubbles: true }))
    }

    // === RESOURCE LIST ===
    _createResourceListUI(paramDef) {
        const wrapper = document.createElement('div')
        wrapper.className = 'provinceEditorList'

        const listContainer = document.createElement('div')
        listContainer.className = 'provinceEditorListContainer'
        wrapper.appendChild(listContainer)

        const addBtn = document.createElement('button')
        addBtn.type = 'button'
        addBtn.textContent = '+ Добавить ресурс'
        addBtn.className = 'provinceEditorListAddBtn'
        addBtn.addEventListener('click', () => {
            this._addResourceRow(listContainer, paramDef.keys)
            this.saveChanges()
        })
        wrapper.appendChild(addBtn)

        wrapper._listContainer = listContainer
        wrapper._resourceKeys = paramDef.keys
        return wrapper
    }

    _addResourceRow(container, resourceKeys, resourceType = '', count = 0) {
        const row = document.createElement('div')
        row.className = 'provinceEditorListRow'

        const select = document.createElement('select')
        select.className = 'provinceEditorResourceType'
        const emptyOpt = document.createElement('option')
        emptyOpt.value = ''
        emptyOpt.text = '-- выберите ресурс --'
        select.appendChild(emptyOpt)

        resourceKeys.forEach(key => {
            const opt = document.createElement('option')
            opt.value = key
            opt.text = key
            select.appendChild(opt)
        })

        if (resourceType) {
            select.value = resourceType
        }

        select.addEventListener('change', () => this.saveChanges())

        const countInput = document.createElement('input')
        countInput.type = 'number'
        countInput.className = 'provinceEditorResourceCount'
        countInput.placeholder = 'Количество'
        countInput.min = '0'
        countInput.value = count

        countInput.addEventListener('input', () => this.saveChanges())

        const removeBtn = document.createElement('button')
        removeBtn.type = 'button'
        removeBtn.textContent = '×'
        removeBtn.className = 'provinceEditorListRemoveBtn'
        removeBtn.addEventListener('click', () => {
            row.remove()
            this.saveChanges()
        })

        row.appendChild(select)
        row.appendChild(countInput)
        row.appendChild(removeBtn)
        container.appendChild(row)
    }

    _renderResourceList(wrapper, value) {
        const container = wrapper._listContainer
        container.innerHTML = ''
        const resourceKeys = wrapper._resourceKeys

        if (value && typeof value === 'object') {
            Object.entries(value).forEach(([key, data]) => {
                const count = data?.count ?? 0
                this._addResourceRow(container, resourceKeys, key, count)
            })
        }
    }

    _readResourceList(wrapper) {
        const container = wrapper._listContainer
        const rows = container.querySelectorAll('.provinceEditorListRow')
        const result = {}

        rows.forEach(row => {
            const select = row.querySelector('.provinceEditorResourceType')
            const countInput = row.querySelector('.provinceEditorResourceCount')
            const key = select.value
            const count = parseFloat(countInput.value) || 0

            if (key) {
                result[key] = { count: count }
            }
        })

        return result
    }

    // === ARMY LIST ===
    _createArmyListUI(paramDef) {
        const wrapper = document.createElement('div')
        wrapper.className = 'provinceEditorList'

        const listContainer = document.createElement('div')
        listContainer.className = 'provinceEditorListContainer'
        wrapper.appendChild(listContainer)

        const addBtn = document.createElement('button')
        addBtn.type = 'button'
        addBtn.textContent = '+ Добавить юнит'
        addBtn.className = 'provinceEditorListAddBtn'
        addBtn.addEventListener('click', () => {
            this._addArmyRow(listContainer, paramDef.units)
            this.saveChanges()
        })
        wrapper.appendChild(addBtn)

        wrapper._listContainer = listContainer
        wrapper._unitKeys = paramDef.units
        return wrapper
    }

    _addArmyRow(container, unitKeys, unitType = '', country = '', count = 0) {
        const row = document.createElement('div')
        row.className = 'provinceEditorListRow'

        const unitSelect = document.createElement('select')
        unitSelect.className = 'provinceEditorArmyUnit'
        const emptyOpt = document.createElement('option')
        emptyOpt.value = ''
        emptyOpt.text = '-- выберите юнит --'
        unitSelect.appendChild(emptyOpt)

        unitKeys.forEach(key => {
            const opt = document.createElement('option')
            opt.value = key
            opt.text = key
            unitSelect.appendChild(opt)
        })

        if (unitType) {
            unitSelect.value = unitType
        }

        unitSelect.addEventListener('change', () => this.saveChanges())

        const countryDD = window.dropdownAuto.country({ isUndv: true })
        countryDD.className = 'provinceEditorArmyCountry'
        if (country) {
            if (typeof countryDD.setValue === 'function') {
                countryDD.setValue(country)
            }
        }

        countryDD.addEventListener('change', () => this.saveChanges())

        const countInput = document.createElement('input')
        countInput.type = 'number'
        countInput.className = 'provinceEditorArmyCount'
        countInput.placeholder = 'Количество'
        countInput.min = '0'
        countInput.value = count

        countInput.addEventListener('input', () => this.saveChanges())

        const removeBtn = document.createElement('button')
        removeBtn.type = 'button'
        removeBtn.textContent = '×'
        removeBtn.className = 'provinceEditorListRemoveBtn'
        removeBtn.addEventListener('click', () => {
            row.remove()
            this.saveChanges()
        })

        row.appendChild(unitSelect)
        row.appendChild(countryDD)
        row.appendChild(countInput)
        row.appendChild(removeBtn)
        container.appendChild(row)
    }

    _renderArmyList(wrapper, value) {
        const container = wrapper._listContainer
        container.innerHTML = ''
        const unitKeys = wrapper._unitKeys

        if (value && typeof value === 'object') {
            Object.entries(value).forEach(([unitType, countriesObj]) => {
                if (countriesObj && typeof countriesObj === 'object') {
                    Object.entries(countriesObj).forEach(([country, count]) => {
                        this._addArmyRow(container, unitKeys, unitType, country, count)
                    })
                }
            })
        }
    }

    _readArmyList(wrapper) {
        const container = wrapper._listContainer
        const rows = container.querySelectorAll('.provinceEditorListRow')
        const result = {}

        rows.forEach(row => {
            const unitSelect = row.querySelector('.provinceEditorArmyUnit')
            const countryDD = row.querySelector('.provinceEditorArmyCountry')
            const countInput = row.querySelector('.provinceEditorArmyCount')

            const unitType = unitSelect.value
            let country = ''
            if (countryDD && typeof countryDD.getValue === 'function') {
                country = countryDD.getValue() || ''
            }
            const count = parseFloat(countInput.value) || 0

            if (unitType && country) {
                if (!result[unitType]) {
                    result[unitType] = {}
                }
                result[unitType][country] = count
            }
        })

        return result
    }

    // === BUILDINGS LIST ===
    _createBuildingsListUI(paramDef) {
        const wrapper = document.createElement('div')
        wrapper.className = 'provinceEditorList'

        const listContainer = document.createElement('div')
        listContainer.className = 'provinceEditorListContainer'
        wrapper.appendChild(listContainer)

        const addBtn = document.createElement('button')
        addBtn.type = 'button'
        addBtn.textContent = '+ Добавить здание'
        addBtn.className = 'provinceEditorListAddBtn'
        addBtn.addEventListener('click', () => {
            this._addBuildingRow(listContainer, paramDef.buildings)
            this.saveChanges()
        })
        wrapper.appendChild(addBtn)

        wrapper._listContainer = listContainer
        wrapper._buildingKeys = paramDef.buildings
        return wrapper
    }

    _addBuildingRow(container, buildingsData, buildingType = '', enabled = true, lvl = 1, health = 10000) {
        const row = document.createElement('div')
        row.className = 'provinceEditorListRow'

        const enabledCb = document.createElement('input')
        enabledCb.type = 'checkbox'
        enabledCb.className = 'provinceEditorBuildingEnabled'
        enabledCb.checked = enabled
        enabledCb.title = 'Enabled/Disabled'

        enabledCb.addEventListener('change', () => this.saveChanges())

        const options = []
        if (buildingsData && typeof buildingsData === 'object') {
            Object.entries(buildingsData).forEach(([category, buildings]) => {
                if (Array.isArray(buildings)) {
                    const groupName = category.replace('buildings_', '').replace(/_/g, ' ')
                    buildings.forEach(b => {
                        options.push({
                            value: b,
                            label: b,
                            group: groupName
                        })
                    })
                }
            })
        }

        const buildingDDContainer = document.createElement('div')
        buildingDDContainer.className = 'provinceEditorBuildingType'
        
        const buildingDD = createCustomDropdown(buildingDDContainer, options, {
            placeholder: '-- выберите здание --',
            searchable: true
        })

        if (buildingType && typeof buildingDD.setValue === 'function') {
            buildingDD.setValue(buildingType)
        }

        buildingDD.addEventListener('change', () => this.saveChanges())

        const lvlInput = document.createElement('input')
        lvlInput.type = 'number'
        lvlInput.className = 'provinceEditorBuildingLvl'
        lvlInput.placeholder = 'Уровень'
        lvlInput.min = '0'
        lvlInput.value = lvl

        lvlInput.addEventListener('input', () => this.saveChanges())

        const healthInput = document.createElement('input')
        healthInput.type = 'number'
        healthInput.className = 'provinceEditorBuildingHealth'
        healthInput.placeholder = 'Здоровье'
        healthInput.min = '0'
        healthInput.value = health

        healthInput.addEventListener('input', () => this.saveChanges())

        const removeBtn = document.createElement('button')
        removeBtn.type = 'button'
        removeBtn.textContent = '×'
        removeBtn.className = 'provinceEditorListRemoveBtn'
        removeBtn.addEventListener('click', () => {
            row.remove()
            this.saveChanges()
        })

        row.appendChild(enabledCb)
        row.appendChild(buildingDDContainer)
        row.appendChild(lvlInput)
        row.appendChild(healthInput)
        row.appendChild(removeBtn)
        container.appendChild(row)
    }

    _renderBuildingsList(wrapper, value) {
        const container = wrapper._listContainer
        container.innerHTML = ''
        const buildingsData = wrapper._buildingKeys

        if (value && typeof value === 'object') {
            Object.entries(value).forEach(([buildingType, data]) => {
                const enabled = data?.state === 'enabled'
                const lvl = data?.lvl ?? 1
                const health = data?.health ?? 10000
                this._addBuildingRow(container, buildingsData, buildingType, enabled, lvl, health)
            })
        }
    }

    _readBuildingsList(wrapper) {
        const container = wrapper._listContainer
        const rows = container.querySelectorAll('.provinceEditorListRow')
        const result = {}

        rows.forEach(row => {
            const enabledCb = row.querySelector('.provinceEditorBuildingEnabled')
            const buildingDDContainer = row.querySelector('.provinceEditorBuildingType')
            const lvlInput = row.querySelector('.provinceEditorBuildingLvl')
            const healthInput = row.querySelector('.provinceEditorBuildingHealth')

            const buildingDD = buildingDDContainer.querySelector('.custom-dd') || buildingDDContainer.firstChild
            
            let buildingType = ''
            if (buildingDD && typeof buildingDD.getValue === 'function') {
                buildingType = buildingDD.getValue() || ''
            }

            const enabled = enabledCb.checked
            const lvl = parseInt(lvlInput.value) || 0
            const health = parseInt(healthInput.value) || 0

            if (buildingType) {
                result[buildingType] = {
                    lvl: lvl,
                    health: health,
                    state: enabled ? 'enabled' : 'disabled'
                }
            }
        })

        return result
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('provincesEditorNav')
    if (nav) {
        nav.addEventListener('click', () => {
            if (!window.provinceEditor) {
                window.provinceEditor = new provinceEditor()
            }
        })
    }
})