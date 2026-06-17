// memap_editor.js
// Обёртка в класс как просили, с улучшенным масштабированием для canvas,
// находящегося внутри контейнера с overflow: scroll.
// Уникальные id: memap_map_canvas_unique

class mapEditMgr {
    constructor(opts = {}) {
        // Element references (IDs unique to project)
        this.fileInput = document.getElementById('memap_file_input');
        this.fileStatus = document.getElementById('memap_file_status');
        this.provinceSelect = document.getElementById('memap_province_select');
        this.globalStatus = document.getElementById('memap_global_status');

        this.fieldPopulation = document.getElementById('memap_field_population');
        this.fieldInfra = document.getElementById('memap_field_infra');
        this.fieldOwner = document.getElementById('memap_field_owner');
        this.fieldTrueOwner = document.getElementById('memap_field_true_owner');
        this.fieldUUID = document.getElementById('memap_field_uuid');
        this.fieldResources = document.getElementById('memap_field_resources');
        this.landType = document.getElementById('memap_field_landtype');

        this.saveBtn = document.getElementById('memap_save_btn');
        this.exportBtn = document.getElementById('memap_export_btn');
        this.refreshBtn = document.getElementById('memap_refresh_btn');
        this.loadFromGlobalBtn = document.getElementById('memap_load_from_global_btn');

        this.preview = document.getElementById('memap_preview'); // we will append canvas near preview
        this.message = document.getElementById('memap_message');

        // Internal state
        this.mapData = null; // parsed map.json
        this.currentProvinceId = null; // numeric id from map.json
        this.provincesArray = null; // reference to window.countryManager.jsonData.provinces

        // Map rendering / zoom state
        this.canvas = null;
        this.ctx = null;
        this.tileSize = 18; // базовый размер "пикселя карты" (пикселей на одну единицу координат)
        this.mapWidth = 0;
        this.mapHeight = 0;
        this.colorsCache = {}; // cache colors per province id

        // Zoom / scale (affects canvas CSS size and drawing transform)
        this.scale = 1; // пользовательский масштаб (1 = tileSize px per map unit)
        this.minScale = 0.025;
        this.maxScale = 0.5;

        // Bind events safely (checks inside)
        this._bindEvents();

        // Initialize global structures
        this._ensureGlobalProvinces();
        this._updateGlobalStatus();

        // Ensure canvas exists in DOM for drawing and set up zoom on canvas
        this._ensureCanvas();
    }

    /* -----------------------------
         Binding events (safe checks)
         ----------------------------- */
    _bindEvents() {
        if (this.fileInput) this.fileInput.addEventListener('change', (e) => this._onFileLoad(e));
        if (this.provinceSelect) this.provinceSelect.addEventListener('change', (e) => this._onProvinceSelect(e));
        if (this.saveBtn) this.saveBtn.addEventListener('click', () => this._onSave());
        if (this.exportBtn) this.exportBtn.addEventListener('click', () => this._onExport());
        if (this.refreshBtn) this.refreshBtn.addEventListener('click', () => this._onRefresh());
        if (this.loadFromGlobalBtn) this.loadFromGlobalBtn.addEventListener('click', () => this._loadProvincesFromGlobal());
    }

    /* -----------------------------
         Global provinces safety
         ----------------------------- */
    _ensureGlobalProvinces() {
        if (!window.countryManager) window.countryManager = {};
        if (!window.countryManager.jsonData) window.countryManager.jsonData = {};
        if (!Array.isArray(window.countryManager.jsonData.provinces)) {
            window.countryManager.jsonData.provinces = [];
        }
        this.provincesArray = window.countryManager.jsonData.provinces;
    }

    _updateGlobalStatus() {
        if (!this.globalStatus) return;
        const len = Array.isArray(this.provincesArray) ? this.provincesArray.length : 0;
        this.globalStatus.textContent = `window.countryManager.jsonData.provinces — elementos: ${len}`;
    }

    /* -----------------------------
         File load + parse
         ----------------------------- */
    _onFileLoad(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const parsed = JSON.parse(ev.target.result);
                this.mapData = parsed;

                if (this.fileStatus) {
                    this.fileStatus.textContent = `Загружен: ${file.name} — provinces: ${(parsed.provinces && parsed.provinces.length) || 0}`;
                }

                this._populateProvinceSelect();
                this._showMessage('map.json успешно загружен', 'ok');

                const built = this._buildTileMapFromMapData(parsed);
                if (built) {
                    // Определяем минимальный масштаб
                    if (parsed.metadata && parsed.metadata.image_size && this.canvas) {
                        const mapW = parsed.metadata.image_size.width;
                        const mapH = parsed.metadata.image_size.height;
                        const contW = this.canvas.clientWidth || this.canvas.width;
                        const contH = this.canvas.clientHeight || this.canvas.height;

                        // Вычисляем масштаб, при котором карта помещается целиком
                        const scaleX = contW / mapW;
                        const scaleY = contH / mapH;

                        this.minScale = Math.min(scaleX, scaleY) / this.tileSize * 2; // немного меньше, чтобы не впритык
                    } else {
                        this.minScale = 0.5; // запасной вариант
                    }

                    // Устанавливаем масштаб в минимальный при первом показе
                    this.scale = this.minScale;

                    this._fitScaleToContainer();
                    this._drawMap();
                } else {
                    this._showMessage('Не удалось разобрать структуру map.json для отрисовки карты. Продолжайте работу с формой.', 'warn');
                    this._clearCanvas();
                }
            } catch (err) {
                if (this.fileStatus) this.fileStatus.textContent = `Ошибка чтения файла: ${err.message}`;
                this._showMessage('Ошибка парсинга map.json — проверьте корректность JSON.', 'error');
                this._clearCanvas();
            }
        };
        reader.readAsText(file, 'utf-8');
    }

    /* -----------------------------
         Province select population
         ----------------------------- */
    _populateProvinceSelect() {
        if (!this.provinceSelect) return;
        this.provinceSelect.innerHTML = '';
        if (!this.mapData || !Array.isArray(this.mapData.provinces)) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = '— некорректный map.json —';
            this.provinceSelect.appendChild(opt);
            return;
        }

        const headerOpt = document.createElement('option');
        headerOpt.value = '';
        headerOpt.textContent = '— выберите id провинции —';
        this.provinceSelect.appendChild(headerOpt);

        this.mapData.provinces.forEach((p) => {
            const opt = document.createElement('option');
            opt.value = String(p.id);
            opt.textContent = `id=${p.id} — ${p.name || '(без имени)'}`;
            this.provinceSelect.appendChild(opt);
        });
    }

    /* -----------------------------
         Build tile -> province map (improved)
         ----------------------------- */
    _buildTileMapFromMapData(map) {
        console.log('Building map from:', map);

        // Basic validation of expected structure
        if (!map || !map.vertices_positions || !Array.isArray(map.provinces)) {
            this._showMessage('Неверная структура map.json', 'error');
            return false;
        }

        // Определяем размеры карты из вершин
        const vertexKeys = Object.keys(map.vertices_positions);
        let maxX = 0, maxY = 0;

        for (let key of vertexKeys) {
            const vertex = map.vertices_positions[key];
            if (!Array.isArray(vertex) || vertex.length < 2) continue;
            const vx = Number(vertex[0]);
            const vy = Number(vertex[1]);
            if (isFinite(vx) && vx > maxX) maxX = vx;
            if (isFinite(vy) && vy > maxY) maxY = vy;
        }

        // mapWidth/Height - именно в "единицах карты" (координатах вершин)
        this.mapWidth = Math.ceil(maxX) + 1;
        this.mapHeight = Math.ceil(maxY) + 1;

        // Сохраняем данные о провинциях для векторной отрисовки
        this.mapData = map;

        console.log(`Map dimensions (units): ${this.mapWidth} x ${this.mapHeight}, provinces: ${map.provinces.length}`);
        return true;
    }

    /* -----------------------------
         Canvas management (scroll container friendly)
         ----------------------------- */
    _ensureCanvas() {
        // try to find existing canvas first
        let canvas = document.getElementById('memap_map_canvas_unique');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'memap_map_canvas_unique';
            // Do not force canvas to match container size — it should be full-size and scrollable
            canvas.style.display = 'block';
            canvas.style.border = '1px solid rgba(0,0,0,0.08)';
            canvas.style.marginTop = '12px';
            canvas.style.background = '#f6f6f8';
            canvas.classList.add('zoom-content');

            const previewSection = document.getElementById('memap_preview_section');
            if (previewSection) {
                // Make sure preview container allows scroll (user said it's inside overflow scroll)
                previewSection.style.overflow = previewSection.style.overflow || 'auto';
                previewSection.appendChild(canvas);
            } else {
                document.body.appendChild(canvas);
            }
        }
        this.canvas = canvas;
        this.ctx = this.canvas.getContext ? this.canvas.getContext('2d') : null;

        // Bind click for province selection
        if (this.canvas && !this.canvas._memap_click_bound) {
            this.canvas.addEventListener('click', (e) => this._onCanvasClick(e));
            this.canvas._memap_click_bound = true;
        }

        // Bind wheel for zoom on CTRL+wheel (zoom towards cursor), passive:false so we can preventDefault
if (this.canvas && !this.canvas._memap_wheel_bound) {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    parent.addEventListener('wheel', (e) => {
        // Только если зажат Ctrl или Shift (иначе позволяем обычный скролл)
        if (!e.ctrlKey && !e.shiftKey) return;

        e.preventDefault();

        const zoomStep = 1.12;
        const delta = e.deltaY;
        const zoomIn = delta < 0;
        const prevScale = this.scale;
        const newScale = this._clampScale(prevScale * (zoomIn ? zoomStep : 1 / zoomStep));

        if (Math.abs(newScale - prevScale) < 1e-6) return;

        // Позиция мыши относительно canvas
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Текущие скроллы родителя
        const prevScrollLeft = parent.scrollLeft;
        const prevScrollTop = parent.scrollTop;

        // Координаты содержимого в "единицах карты"
        const contentX = mouseX / (this.tileSize * prevScale);
        const contentY = mouseY / (this.tileSize * prevScale);

        // Установить новый масштаб и перерисовать
        this.scale = newScale;
        this._drawMap();

        // Новая позиция мыши для того же контента
        const newMouseX = contentX * (this.tileSize * this.scale);
        const newMouseY = contentY * (this.tileSize * this.scale);

        // Коррекция скролла родителя
        parent.scrollLeft = Math.max(0, prevScrollLeft + (newMouseX - mouseX));
        parent.scrollTop = Math.max(0, prevScrollTop + (newMouseY - mouseY));
    }, { passive: false });

    this.canvas._memap_wheel_bound = true;
}

    }

    _clearCanvas() {
        if (!this.canvas || !this.ctx) return;
        this.ctx.setTransform(1,0,0,1,0,0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    _clampScale(s) {
        return Math.min(this.maxScale, Math.max(this.minScale, s));
    }

    /* -----------------------------
         Deterministic color for province id
         ----------------------------- */
    _colorForProvince(pid) {
        if (pid === null || pid === undefined) return '#f0f0f3';
        const key = String(pid);
        if (this.colorsCache[key]) return this.colorsCache[key];
        // simple hash -> h
        let h = 0;
        for (let i = 0; i < key.length; i++) {
            h = (h * 31 + key.charCodeAt(i)) | 0;
        }
        h = (h >>> 0) % 360; // hue
        // produce pastel-ish color
        const color = `hsl(${h}deg 60% 70%)`;
        this.colorsCache[key] = color;
        return color;
    }

    /* -----------------------------
         Draw map (uses tileSize * scale to compute CSS size of canvas)
         Important: canvas CSS size becomes mapWidth * tileSize * scale,
         while internal pixel buffer accounts for devicePixelRatio (DPR).
         ----------------------------- */
    _drawMap() {
        if (!this.mapData || !this.canvas || !this.ctx) return;

        const wUnits = this.mapWidth;
        const hUnits = this.mapHeight;

        // Compute CSS pixel size of the canvas based on map units, tileSize and user scale
        const cssWidth = Math.max(1, wUnits * this.tileSize * this.scale);
        const cssHeight = Math.max(1, hUnits * this.tileSize * this.scale);

        // Device pixel ratio handling for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = Math.floor(cssWidth * dpr);
        this.canvas.height = Math.floor(cssHeight * dpr);
        this.canvas.style.width = cssWidth + 'px';
        this.canvas.style.height = cssHeight + 'px';

        // Set transform so that drawing uses map units directly (vertices are in map units)
        // scaleFactor converts "map units" -> device pixels
        const scaleFactor = dpr * this.tileSize * this.scale;
        this.ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);
        this.ctx.imageSmoothingEnabled = true;

        // Background (draw in map unit coords: width/height in map units)
        this.ctx.save();
        this.ctx.fillStyle = '#e8e8ea';
        this.ctx.fillRect(0, 0, wUnits, hUnits);
        this.ctx.restore();

        // Draw each province
        for (let province of this.mapData.provinces) {
            this._drawProvince(province, false);
        }

        // If a province is selected, re-highlight to ensure it's drawn on top
        if (this.currentProvinceId !== null) {
            this._highlightProvince(this.currentProvinceId);
        }
    }

    _drawProvince(province, highlight = false) {
        if (!this.ctx || !this.mapData) return;

        // Получаем координаты вершин (в единицах карты)
        const vertices = (province.vertex_indices || []).map(idx => {
            const vertex = this.mapData.vertices_positions[String(idx)];
            return (Array.isArray(vertex) && vertex.length >= 2) ? [Number(vertex[0]), Number(vertex[1])] : [0, 0];
        });

        if (vertices.length < 3) return;

        // Создаем путь полигона (координаты в map units)
        this.ctx.beginPath();
        this.ctx.moveTo(vertices[0][0], vertices[0][1]);

        for (let i = 1; i < vertices.length; i++) {
            this.ctx.lineTo(vertices[i][0], vertices[i][1]);
        }
        this.ctx.closePath();

        // Получаем данные провинции из глобального массива
        const provinceData = window.countryManager?.jsonData?.provinces?.[province.id] || {};

        // Определяем цвет в зависимости от режима просмотра и специальных свойств
        let color;

        // Приоритет: water и river игнорируют режим просмотра
        if (provinceData.river === true) {
            color = '#3b82f6'; // голубой для рек
        } else if (provinceData.water === true) {
            color = '#2563eb'; // синий для воды
        } else {
            // Обычное окрашивание по режиму
            color = this._getProvinceColorByMode(province.id, provinceData);
        }

        document.getElementById('memap_preview_section').width

        // Заливка провинции (в map units)
        this.ctx.fillStyle = highlight ? this._darkenColor(color, 0.01) : color;
        this.ctx.fill();

        // Граница провинции
        this.ctx.strokeStyle = highlight ? 'rgba(255, 100, 0, 0.9)' : 'rgba(0, 0, 0, 0.25)';
        this.ctx.lineWidth = highlight ? 2.5 : 0.04; // lineWidth in map units (transformed by scaleFactor)
        this.ctx.stroke();

        // Название провинции в центре (если есть центр)
        if (province.center && !highlight) {
            const center = province.center;
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            // Font size given in map units (will be scaled by transform)
            this.ctx.font = '25px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(String(province.id), center[0], center[1]);
        }
    }

    _getProvinceColorByMode(provinceId, provinceData) {
        switch (this.mapView) {
            case 'countries':
                return this._getCountryColor(provinceData.owner);

            case 'diplomacy':
                return this._getDiplomacyColor(provinceData.owner);

            case 'population':
                return this._getPopulationColor(provinceData.population_limit || 0);

            case 'economic':
                return this._getEconomicColor(provinceData.infrastructure_level || 0);

            default:
                return this._colorForProvince(provinceId);
        }
    }

    _getCountryColor(owner) {
      const defaultGray = '#9ca3af';
      if (!owner) return defaultGray;

      if (!this.colorsCache) this.colorsCache = {};
      const cacheKey = 'country_' + owner;
      if (this.colorsCache[cacheKey]) return this.colorsCache[cacheKey];

      try {
        const lands = window?.countryManager?.jsonData?.lands;
        if (lands && lands[owner] && Array.isArray(lands[owner].color)) {
          const [r, g, b, a] = lands[owner].color;
          const rgba = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
          this.colorsCache[cacheKey] = rgba;
          return rgba;
        }
      } catch (e) {
        console.warn('Ошибка при получении цвета страны:', e);
      }

      // fallback — если не найдено
      let h = 0;
      const key = String(owner);
      for (let i = 0; i < key.length; i++) {
        h = (h * 31 + key.charCodeAt(i)) | 0;
      }
      h = (h >>> 0) % 360;
      const color = `hsl(${h}deg 65% 65%)`;
      this.colorsCache[cacheKey] = color;
      return color;
    }

    _getDiplomacyColor(owner) {
        if (!this.currentProvinceId) return '#9ca3af';

        const selectedProvince = this.provincesArray[this.currentProvinceId] || {};
        const selectedOwner = selectedProvince.owner;

        if (!selectedOwner) return '#9ca3af';
        if (!owner) return '#6b7280'; // темно-серый для провинций без владельца

        if (owner === selectedOwner) {
            return '#10b981'; // зеленый - своя страна
        }

        return '#ef4444'; // красный - другая страна
    }

    _getPopulationColor(population) {
      if (population === 0) return '#ff4d4d'; // красный для пустых

      let maxPopulation = 1;
      const provinces = window?.countryManager?.jsonData?.provinces;
      if (Array.isArray(provinces)) {
        for (let prov of provinces) {
          if (prov && prov.population_limit > maxPopulation) {
            maxPopulation = prov.population_limit;
          }
        }
      }

      const normalized = Math.min(population / maxPopulation, 1);
      const hue = normalized * 120;
      const lightness = 70 - (normalized * 25);
      return `hsl(${hue}deg 80% ${lightness}%)`;
    }

    _getEconomicColor(infraLevel) {
        const colors = [
            '#f3f4f6', // 0 - серый (нет инфраструктуры)
            '#9c3c31', // 1 - красный (очень низкий)
            '#924934', // 2 - оранжевый (низкий)
            '#7d6339', // 3 - желтый (средний)
            '#5d8a41', // 4 - желто-зеленый (хороший)
            '#49a447'  // 5 - зеленый (отличный)
        ];

        return colors[Math.min(Math.max(infraLevel, 0), 5)];
    }

    _darkenColor(color, amount) {
        const match = String(color).match(/hsl\((\d+)deg\s+(\d+)%\s+(\d+)%\)/);
        if (match) {
            const h = match[1];
            const s = match[2];
            const l = Math.max(0, parseInt(match[3]) - Math.round(amount * 100));
            return `hsl(${h}deg ${s}% ${l}%)`;
        }
        // fallback: try rgba or hex — for simplicity return original
        return color;
    }

    _onCanvasClick(e) {
        if (!this.canvas || !this.mapData) return;

        const rect = this.canvas.getBoundingClientRect();

        // map coordinates (in map units) = (client - rect.left) / (tileSize * scale)
        const mapX = (e.clientX - rect.left) / (this.tileSize * this.scale);
        const mapY = (e.clientY - rect.top) / (this.tileSize * this.scale);

        // Проверяем, в какую провинцию попали
        const clickedProvince = this._findProvinceAtPoint(mapX, mapY);

        if (!clickedProvince) {
            this._showMessage('Кликнули вне провинций', 'info');
            return;
        }

        const pid = clickedProvince.id;

        // Устанавливаем выбор в select
        if (this.provinceSelect) {
            const targetVal = String(pid);
            this.provinceSelect.value = targetVal;
            // Важно: вызываем обработчик напрямую, чтобы форма обновилась
            this._onProvinceSelect({ target: { value: targetVal } });
        } else {
            // Если select не доступен, загружаем форму напрямую
            this.currentProvinceId = pid;
            this._loadFormForProvinceId(pid);
        }

        this._showMessage(`Выбрана провинция id=${pid}`, 'ok');
        this._onRefresh();
        this._drawMap();
    }

    _findProvinceAtPoint(x, y) {
        if (!this.mapData) return null;

        // Проверяем провинции в обратном порядке (последние рисуются сверху)
        for (let i = this.mapData.provinces.length - 1; i >= 0; i--) {
            const province = this.mapData.provinces[i];
            const vertices = (province.vertex_indices || []).map(idx => {
                const vertex = this.mapData.vertices_positions[String(idx)];
                return (Array.isArray(vertex) && vertex.length >= 2) ? [Number(vertex[0]), Number(vertex[1])] : [0, 0];
            });

            if (this._pointInPolygon(x, y, vertices)) {
                return province;
            }
        }

        return null;
    }

    _pointInPolygon(x, y, vertices) {
        let inside = false;
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            const xi = vertices[i][0], yi = vertices[i][1];
            const xj = vertices[j][0], yj = vertices[j][1];

            const intersect = ((yi > y) !== (yj > y)) &&
                             (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

_highlightProvince(pid) {
        if (!this.mapData || !this.ctx) return;

        // Находим провинцию в mapData (карта)
        const province = this.mapData.provinces.find(p => p.id === pid);
        if (province) {
            this._drawProvince(province, true);

            // Добавляем метку (в map units)
            if (province.center) {
                this.ctx.fillStyle = 'rgba(255, 100, 0, 0.9)';
                this.ctx.font = '35px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(`▸ ${province.id}`, province.center[0], province.center[1]);
            }
        }
    }

    _indexForProvinceId(id) {
        // В текущей системе предполагаем, что индекс совпадает с id.
        // Если нужно другое соответствие — измените здесь.
        return id;
    }

    _loadFormForProvinceId(id) {
        const idx = this._indexForProvinceId(id);
        const arr = this.provincesArray;
        if (!arr[idx]) {
            arr[idx] = {
                population_limit: 0,
                infrastructure_level: 0,
                water: false,
                river: false,
                relief: 1
            };
            this._showMessage(`Не найден элемент в window.countryManager.jsonData.provinces с индексом ${idx}. Создан placeholder.`, 'warn');
            this._updateGlobalStatus();
        }

        const obj = arr[idx];
        if (this.fieldPopulation) this.fieldPopulation.value = obj.population_limit != null ? obj.population_limit : '';
        if (this.fieldInfra) this.fieldInfra.value = obj.infrastructure_level != null ? obj.infrastructure_level : '';
        if (this.fieldOwner) this.fieldOwner.value = obj.owner != null ? obj.owner : '';
        if (this.fieldTrueOwner) this.fieldTrueOwner.value = obj.true_owner != null ? obj.true_owner : '';
        if (this.fieldUUID) this.fieldUUID.value = obj.uuid != null ? obj.uuid : '';
        if (this.landType) {
            if (obj.water === true) this.landType.value = 'water';
            if (obj.river === true) this.landType.value = 'river';
            if (obj.relief != null) this.landType.value = String(obj.relief);
            if (obj.water !== true && obj.river !== true && (obj.relief == null || obj.relief === 1)) this.landType.value = '1';
        }
        if (this.fieldResources) {
            try {
                this.fieldResources.value = JSON.stringify(obj.resource_rule || [], null, 2);
            } catch (err) {
                this.fieldResources.value = '[]';
            }
        }
        this.currentProvinceId = id;
        this._renderPreview(obj);
        // Also highlight on canvas if available
        this._highlightProvince(Number(id));
    }

    _clearForm() {
        if (this.fieldPopulation) this.fieldPopulation.value = '';
        if (this.fieldInfra) this.fieldInfra.value = '';
        if (this.fieldOwner) this.fieldOwner.value = '';
        if (this.fieldTrueOwner) this.fieldTrueOwner.value = '';
        if (this.fieldUUID) this.fieldUUID.value = '';
        if (this.fieldResources) this.fieldResources.value = '[]';
        this.currentProvinceId = null;
        if (this.canvas) this._drawMap(); // remove highlight
    }

    _onProvinceSelect(e) {
        const val = e.target.value;
        if (val === '') {
            this._clearForm();
            this._renderPreview(null);
            return;
        }
        const id = Number(val);
        this.currentProvinceId = id;
        this._loadFormForProvinceId(id);
    }

    _onSave() {
        if (this.currentProvinceId === null) {
            this._showMessage('Сначала выберите провинцию (id).', 'error');
            return;
        }
        const idx = this._indexForProvinceId(this.currentProvinceId);
        const arr = this.provincesArray;

        // Parse resource_rule JSON
        let resourcesVal;
        try {
            const txt = this.fieldResources.value.trim();
            resourcesVal = txt === '' ? [] : JSON.parse(txt);
            if (!Array.isArray(resourcesVal)) {
                this._showMessage('resource_rule должен быть массивом. Исправлено автоматически.', 'warn');
                resourcesVal = Array.isArray(resourcesVal) ? resourcesVal : [];
            }
            if (resourcesVal == []) resourcesVal = '';
        } catch (err) {
            this._showMessage('Ошибка парсинга resource_rule — исправьте JSON перед сохранением.', 'error');
            return;
        }

        if (!arr[idx]) arr[idx] = {};

        function setOrDelete(obj, key, val) {
            if (val === '' || val === null || val === undefined || val == [] || val == {} || val == '[]' || val == '{}') {
                delete obj[key];
            } else {
                obj[key] = val;
            }
        }

        setOrDelete(arr[idx], 'population_limit', this.fieldPopulation.value === '' ? '' : Number(this.fieldPopulation.value));
        setOrDelete(arr[idx], 'infrastructure_level', this.fieldInfra.value === '' ? '' : Number(this.fieldInfra.value));
        setOrDelete(arr[idx], 'owner', this.fieldOwner.value);
        setOrDelete(arr[idx], 'true_owner', this.fieldTrueOwner.value);
        setOrDelete(arr[idx], 'uuid', this.fieldUUID.value);
        setOrDelete(arr[idx], 'resource_rule', resourcesVal);
        if (resourcesVal == '') delete arr[idx].resource_rule;

        this._renderPreview(arr[idx]);
        this._showMessage(`Провинция id=${this.currentProvinceId} сохранена в window.countryManager.jsonData.provinces[${idx}].`, 'ok');
        this._updateGlobalStatus();
        saveToPreview(window.countryManager.jsonData);
    }

    _renderPreview(obj) {
        if (!this.preview) return;
        if (!obj) {
            this.preview.textContent = '— ничего не выбрано —';
            return;
        }
        try {
            this.preview.textContent = JSON.stringify(obj, null, 2);
        } catch (err) {
            this.preview.textContent = String(obj);
        }
    }

    _onExport() {
        const arr = this.provincesArray || [];
        const txt = JSON.stringify(arr, null, 2);
        const blob = new Blob([txt], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'provinces_export.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        this._showMessage('Экспорт завершён: provinces_export.json', 'ok');
    }

    _onRefresh() {
        this._ensureGlobalProvinces();
        this._updateGlobalStatus();
        if (this.currentProvinceId !== null) {
            this._loadFormForProvinceId(this.currentProvinceId);
        }
        this._showMessage('Данные обновлены из window.countryManager.jsonData.provinces.', 'ok');
    }

    _loadProvincesFromGlobal() {
        if (!this.mapData) {
            this._showMessage('Сначала загрузите map.json (кнопка выше).', 'error');
            return;
        }
        const required = this.mapData.provinces.length;
        for (let i = 0; i < required; i++) {
            if (!this.provincesArray[i]) {
                this.provincesArray[i] = {
                    population_limit: 0,
                    resource_rule: [],
                    uuid: '',
                    true_owner: '',
                    owner: '',
                    infrastructure_level: 0
                };
            }
        }
        this._updateGlobalStatus();
        this._showMessage(`Глобальный массив приведён в соответствие с количеством провинций в map.json (${required}).`, 'ok');
        if (this.currentProvinceId !== null) this._loadFormForProvinceId(this.currentProvinceId);
        // redraw in case new provinces matter for colors
        this._drawMap();
    }

    _showMessage(text, type = 'info') {
        if (this.message) {
            this.message.textContent = text;
            this.message.className = 'memap-message-unique';
            if (type === 'ok') this.message.classList.add('memap-message-ok-unique');
            if (type === 'error') this.message.classList.add('memap-message-error-unique');
            if (type === 'warn') this.message.classList.add('memap-message-warn-unique');
        }
        console.log('[mapEditMgr]', type.toUpperCase(), text);
    }

    /* -----------------------------
       Helper: fit initial scale so map is reasonably sized in parent container
       If canvas parent width is small, fit horizontally; otherwise keep default scale.
       ----------------------------- */
    _fitScaleToContainer() {
        if (!this.canvas || !this.mapData) return;
        const parent = this.canvas.parentElement;
        if (!parent) return;

        // try to fit width to parent.clientWidth if possible but do not exceed 1
        const parentW = parent.clientWidth || 800;
        const targetScale = parentW / (this.mapWidth * this.tileSize);
        // choose scale between min and max, and not larger than 1 unless map is tiny
        const preferred = Math.min(Math.max(targetScale, this.minScale), this.maxScale);
        this.scale = Math.max(0.6, Math.min(preferred, 1.5));
    }

    // Метод для изменения режима просмотра карты
    setMapView(mode) {
        const validModes = ['countries', 'diplomacy', 'population', 'economic'];
        if (validModes.includes(mode)) {
            this.mapView = mode;
            this._drawMap();
            if (this.currentProvinceId !== null) {
                this._highlightProvince(this.currentProvinceId);
            }
            this._showMessage(`Режим карты изменён: ${mode}`, 'ok');
        } else {
            this._showMessage(`Неверный режим карты: ${mode}. Доступные: ${validModes.join(', ')}`, 'error');
        }
        document.querySelectorAll('#memap_root .mapedit-btn-mode').forEach(el => el.classList.remove('active'));
        if (mode === 'countries') document.getElementById('mapedit_btn_mode-countries').classList.add('active');
        if (mode === 'diplomacy') document.getElementById('mapedit_btn_mode-diplomacy').classList.add('active');
        if (mode === 'population') document.getElementById('mapedit_btn_mode-population').classList.add('active');
        if (mode === 'economic') document.getElementById('mapedit_btn_mode-economic').classList.add('active');
    }

    setEditMode(mode) {
        const validModes = ['view', 'edit'];
        if (validModes.includes(mode)) {
            this.editMode = mode;
            this._showMessage(`Режим редактирования изменён: ${mode}`, 'ok');
        } else {
            this._showMessage(`Неверный режим редактирования: ${mode}. Доступные: ${validModes.join(', ')}`, 'error');
        }
        document.querySelectorAll('#memap_root .mapedit-btn-editmode').forEach(el => el.classList.remove('active'));
        document.getElementById(`mapedit_btn-${mode}`).classList.add('active');
    }

    page(page) {
        //document.querySelectorAll(`#memap_root ${page}`).forEach(el => el.classList.toggle('active'))
        document.querySelectorAll('#memap_root .mapeditpage').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('#memap_root .memap-btn-page').forEach(el => el.classList.remove('active'));
        document.getElementById(page).classList.add('active');
        if (page === 'mapedit') {
            document.querySelectorAll('#memap_root .mapeditthings').forEach(el => el.classList.add('active'));
        } else {
            document.querySelectorAll('#memap_root .mapeditthings').forEach(el => el.classList.remove('active'));
        }
        document.getElementById(`mapeditpage-${page}`).classList.add('active');
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    try {
        window.mapEditMgr = new mapEditMgr();
        console.info('[mapEditMgr] instance created');
    } catch (err) {
        console.error('[mapEditMgr] init error:', err);
    }

    try {
        document.querySelectorAll('.mapedit_input_needsave').forEach(el => {
            el.addEventListener('change', () => {
                window.mapEditMgr._onSave();
            });
        });
    } catch (e) {
        // ignore
    }

    // NOTE:
    // Ранее в коде была глобальная обработка wheel на .zoom-container, которая масштабировала
    // весь контейнер через CSS transform. Это конфликтовало с тем, что canvas находится
    // внутри scrollable контейнера. Новый подход — масштабировать содержимое canvas
    // (через this.scale) при CTRL+Wheel на самом canvas (реализовано выше).
    // Если на странице всё ещё есть обработчик для .zoom-container, можно его удалить/закомментировать
    // чтобы избежать двойного масштабирования.
});
