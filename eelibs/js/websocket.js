// cloud-websocket.js
// CloudWebSocket — лёгкий клиент для wss://clouddata.turbowarp.org
// Подключаетcя, шлёт handshake в заданном формате, умеет отправлять {"method":"set",...}
// По умолчанию: project_id = "1234567", user = "ExampleUsername"
//
// Usage:
// import CloudWebSocket from './cloud-websocket.js';
// const cws = new CloudWebSocket(); // использует defaults
// await cws.connect(); // или cws.connect({ project_id: '...', user: '...' });
// cws.sendSet('test', '5513845...', { encode: true });
// cws.on('set', data => console.log('someone set', data));
// window.addEventListener('clouddata:set', (e) => console.log('event', e.detail));
//
// Обрати внимание: при encode=true клиент пытается привести значение к Number.
// Если число слишком длинное для безопасного Number, оно будет отправлено как строка
// (JSON не поддерживает BigInt напрямую).

export default class CloudWebSocket {
    /**
     * Создаёт клиент.
     * @param {object} opts
     * @param {string} [opts.url] default 'wss://clouddata.turbowarp.org'
     * @param {string} [opts.project_id] default '1234567'
     * @param {string} [opts.user] default 'ExampleUsername'
     * @param {boolean} [opts.log] логировать входящие/исходящие (default true)
     */
    constructor(opts = {}) {
        this.url = opts.url || 'wss://clouddata.turbowarp.org';
        this.project_id = opts.project_id || opts.projectId || '1234567';
        this.user = opts.user || opts.username || 'ExampleUsername';
        this.logEnabled = opts.log !== undefined ? !!opts.log : true;
        this.helloRecive;
        this.helloRecived = false;
        this.initialMessages = []; // Массив для хранения всех начальных сообщений

        /** @type {WebSocket|null} */
        this.ws = null;

        // внутренние callback'и по событиям: 'open','close','error','message','set'
        this.listeners = new Map();

        // состояние
        this.connected = false;

        // TextEncoder/TextDecoder для кодирования
        this.textEncoder = new TextEncoder();
        this.textDecoder = new TextDecoder();
    }

    _log(...args) {
        if (this.logEnabled) console.log('[CloudWebSocket]', ...args);
    }

    /**
     * Добавить слушатель события.
     * События: 'open','close','error','message','set'
     * @param {string} name
     * @param {Function} cb
     */
    on(name, cb) {
        if (!this.listeners.has(name)) this.listeners.set(name, new Set());
        this.listeners.get(name).add(cb);
    }

    off(name, cb) {
        if (!this.listeners.has(name)) return;
        this.listeners.get(name).delete(cb);
    }

    _emit(name, ...args) {
        if (this.listeners.has(name)) {
            for (const cb of Array.from(this.listeners.get(name))) {
                try {
                    cb(...args);
                } catch (e) {
                    console.error('[CloudWebSocket] listener error', e);
                }
            }
        }
    }

    /**
     * Распарсить несколько JSON объектов в одной строке
     * Например: {"a":1}{"b":2} → [{a:1}, {b:2}]
     * @param {string} text
     * @returns {Array} массив распарсенных объектов
     */
    _parseMultipleJSON(text) {
        const results = [];
        let current = '';
        let depth = 0;
        let inString = false;
        let escapeNext = false;
        
        const str = typeof text === 'string' ? text : String(text);
        
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            
            // Обработка экранирования
            if (escapeNext) {
                current += char;
                escapeNext = false;
                continue;
            }
            
            if (char === '\\' && inString) {
                escapeNext = true;
                current += char;
                continue;
            }
            
            // Обработка строк
            if (char === '"') {
                inString = !inString;
                current += char;
                continue;
            }
            
            if (inString) {
                current += char;
                continue;
            }
            
            // Обработка скобок вне строк
            if (char === '{' || char === '[') {
                depth++;
            } else if (char === '}' || char === ']') {
                depth--;
            }
            
            current += char;
            
            // Если закончился объект/массив, пытаемся распарсить
            if (depth === 0 && current.trim()) {
                try {
                    const parsed = JSON.parse(current);
                    results.push(parsed);
                    current = '';
                } catch (e) {
                    // Может быть разделитель или незавершённый объект
                    // Пропускаем и продолжаем
                }
            }
        }
        
        // Попытка распарсить остаток
        if (current.trim()) {
            try {
                const parsed = JSON.parse(current);
                results.push(parsed);
            } catch (e) {
                this._log('Could not parse remaining text:', current);
            }
        }
        
        return results;
    }

    /**
     * Подключиться. После открытия автоматически отправит handshake
     * в формате с отступами (2 пробела), как ты просил.
     * @param {object} [opts]
     * @param {string} [opts.project_id]
     * @param {string} [opts.user]
     * @returns {Promise<void>}
     */
    connect(opts = {}) {
        if (opts.project_id || opts.projectId) this.project_id = opts.project_id || opts.projectId;
        if (opts.user || opts.username) this.user = opts.user || opts.username;
        if (opts.url) this.url = opts.url;
        
        const project_id = this.project_id;
        const user = this.user;
        const url = this.url;
        this._log('Connecting to CloudWebSocket:', url, 'as', user, 'in project', project_id);

        return new Promise((resolve, reject) => {
            try {
                const ws = new WebSocket(url);
                this.ws = ws;

                ws.onopen = () => {
                    this.connected = true;
                    this._log('connected to', url);

                    // Формируем handshake в точно таком виде (с отступом 2 пробела)
                    const handshake = {
                        method: 'handshake',
                        project_id: String(project_id),
                        user: String(user),
                    };

                    // stringify с отступом 2 пробела чтобы сохранить формат как в примере
                    const handshakeText = JSON.stringify(handshake, null, 2);

                    this._log('send handshake:', handshakeText);
                    ws.send(handshakeText);

                    this._emit('open');
                    
                    // После отправки handshake, в скором времени придут начальные сообщения
                    // Даём серверу время отправить все начальные сообщения (roomsList, signals и т.д.)
                    const handleInitialMessages = () => {
                        // Обрабатываем все собранные начальные сообщения
                        if (this.initialMessages.length > 0) {
                            this._log('Processing', this.initialMessages.length, 'initial messages');
                            
                            for (const msgData of this.initialMessages) {
                                try {
                                    const parsed = JSON.parse(typeof msgData === 'string' ? msgData : String(msgData));
                                    
                                    if (parsed && parsed.method === 'set') {
                                        this._log('Processing initial set message:', parsed.name);
                                        this._emit('set', parsed);
                                        
                                        // Также диспатчим CustomEvent
                                        try {
                                            if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
                                                const ev = new CustomEvent('clouddata:set', { detail: parsed });
                                                window.dispatchEvent(ev);
                                            }
                                        } catch (e) {
                                            // ignore
                                        }
                                    }
                                } catch (e) {
                                    this._log('Could not parse initial message');
                                }
                            }
                        }
                    };
                    
                    // Даём серверу время отправить все hello сообщения (roomsList, signals и т.д.)
                    setTimeout(handleInitialMessages, 200);
                    
                    resolve();
                };

                ws.onmessage = async (evt) => {
                    let data = evt.data;
                    
                    // если пришёл Blob → конвертируем в data:URI (для совместимости)
                    if (typeof Blob !== 'undefined' && data instanceof Blob) {
                        data = await this._blobToDataURL(data);
                    }

                    // логируем
                    this._log('recv raw:', data);

                    // Обработка: может быть несколько JSON объектов в одной строке
                    // Нужно их разбить и обработать каждый
                    const messages = this._parseMultipleJSON(data);
                    
                    for (const parsed of messages) {
                        if (!parsed) continue;
                        
                        // Если это первое сообщение, сохраняем в initialMessages
                        if (this.helloRecived != true) {
                            this.initialMessages.push(JSON.stringify(parsed));
                        }
                        this.helloRecived = true;
                        
                        // ставим общий 'message'
                        this._emit('message', parsed);

                        // если метод == 'set' — логируем и уведомляем другие скрипты
                        if (parsed && parsed.method === 'set') {
                            this._log('recv set:', parsed);

                            // Встроенный callback
                            this._emit('set', parsed);

                            // Также диспатчим CustomEvent в window с именем 'clouddata:set'
                            try {
                                if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
                                    const ev = new CustomEvent('clouddata:set', { detail: parsed });
                                    window.dispatchEvent(ev);
                                }
                            } catch (e) {
                                // ignore
                            }
                        }
                    }
                };

                ws.onerror = (evt) => {
                    this._log('error', evt);
                    this._emit('error', evt);
                    // Не reject сразу — ошибка может быть шумной; но если до открытия не подключились — reject
                    if (!this.connected) {
                        reject(new Error('WebSocket error before open'));
                    }
                };
                
                ws.onclose = (evt) => {
                    this.connected = false;
                    this._log('closed', evt.code, evt.reason || '');
                    if (evt.code === 4002) {
                        this._log('ERROR: Server rejected handshake. Check project_id and username.');
                    }
                    this._emit('close', evt);
                };
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Отправить произвольный объект (будет JSON.stringify без отступов).
     * @param {object|string} obj
     */
    sendRaw(obj) {
        if (!this.ws) {
            throw new Error('WebSocket is not initialized');
        }
        if (this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket is not open');
        }
        const text = typeof obj === 'string' ? obj : JSON.stringify(obj);
        this._log('send raw:', text);
        this.ws.send(text);
    }

    /**
     * Отправить set-сообщение вида {"method":"set","name":"☁ test","value":...}
     * @param {string} varName — название переменной, например "test" (в сообщении будет "☁ test")
     * @param {any} value — значение. По умолчанию кодируется в число когда это возможно
     * @param {object} [opts]
     * @param {boolean} [opts.encode=true] — если true, для строк кодирует через Numerical Encoding V2, для чисел как число
     */
    sendSet(varName, value, opts = {}) {
        const encode = opts.encode !== undefined ? !!opts.encode : true;

        const name = `☁ ${varName}`; // оставляем облачко и пробел как просил

        let outValue = value;

        if (encode) {
            // Если это строка, кодируем через Numerical Encoding V2
            if (typeof value === 'string') {
                outValue = this.encodeText(value);
            } else {
                // Иначе пытаемся привести к числу
                outValue = this._encodeValueToNumberIfPossible(value);
            }
        } else {
            // если не кодируем — оставляем как есть. Если это объект/массив → JSON-строка
            if (typeof outValue === 'object' && outValue !== null) {
                try {
                    outValue = JSON.stringify(outValue);
                } catch (e) {
                    outValue = String(outValue);
                }
            } else {
                outValue = String(outValue);
            }
        }

        // Сформируем компактную JSON-строку, похожую на формат примера
        const msgObj = {
            method: 'set',
            name,
            value: outValue,
        };

        const text = JSON.stringify(msgObj); // компактный, без отступов как в примере
        this._log('send set:', text);
        if (!this.ws) {
            throw new Error('WebSocket is not initialized');
        }
        if (this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket is not open');
        }
        this.ws.send(text);
    }

    /**
     * Закрыть соединение (опционально с кодом/причиной)
     * @param {number} [code]
     * @param {string} [reason]
     */
    close(code, reason) {
        if (!this.ws) return;
        if (code !== undefined && reason !== undefined) {
            this.ws.close(code, reason);
        } else if (code !== undefined) {
            this.ws.close(code);
        } else {
            this.ws.close();
        }
    }

    // Вспомогательные методы

    async _blobToDataURL(blob) {
        return new Promise((resolve, reject) => {
            try {
                const fr = new FileReader();
                fr.onload = () => resolve(fr.result);
                fr.onerror = () => reject(fr.error || new Error('FileReader error'));
                fr.readAsDataURL(blob);
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Кодирование бинарных данных в строку чисел (Numerical Encoding V2)
     * @param {Uint8Array} bytes
     * @returns {string}
     */
    _encodeBinary(bytes) {
        const buffer = new Uint8Array(Math.ceil((bytes.length * 8) / 3));
        let ptr = 0;
        let i = 0;

        for (i = 0; i <= bytes.length - 3; i += 3) {
            const a = bytes[i];
            const b = bytes[i + 1];
            const c = bytes[i + 2];
            buffer[ptr++] = 49 + (a >> 5);
            buffer[ptr++] = 49 + ((a >> 2) & 0b111);
            buffer[ptr++] = 49 + (((a & 0b11) << 1) | (b >> 7));
            buffer[ptr++] = 49 + ((b >> 4) & 0b111);
            buffer[ptr++] = 49 + ((b >> 1) & 0b111);
            buffer[ptr++] = 49 + (((b & 0b1) << 2) | (c >> 6));
            buffer[ptr++] = 49 + ((c >> 3) & 0b111);
            buffer[ptr++] = 49 + (c & 0b111);
        }

        switch (bytes.length - i) {
            case 1: {
                const a = bytes[i];
                buffer[ptr++] = 49 + (a >> 5);
                buffer[ptr++] = 49 + ((a >> 2) & 0b111);
                buffer[ptr++] = 49 + ((a & 0b11) << 1);
                break;
            }
            case 2: {
                const a = bytes[i];
                const b = bytes[i + 1];
                buffer[ptr++] = 49 + (a >> 5);
                buffer[ptr++] = 49 + ((a >> 2) & 0b111);
                buffer[ptr++] = 49 + (((a & 0b11) << 1) | (b >> 7));
                buffer[ptr++] = 49 + ((b >> 4) & 0b111);
                buffer[ptr++] = 49 + ((b >> 1) & 0b111);
                buffer[ptr++] = 49 + ((b & 0b1) << 2);
                break;
            }
        }

        // Конвертируем байты в строку через String.fromCharCode
        let result = '';
        for (let j = 0; j < ptr; j++) {
            result += String.fromCharCode(buffer[j]);
        }
        return result;
    }

    /**
     * Декодирование строки чисел обратно в бинарные данные (Numerical Encoding V2)
     * @param {string} string
     * @returns {Uint8Array}
     */
    _decodeBinary(string) {
        const encodedBytes = Math.floor((string.length * 3) / 8);
        const result = new Uint8Array(encodedBytes);
        let ptr = 0;
        let i = 0;

        for (i = 0; i <= string.length - 8; i += 8) {
            const a = string.charCodeAt(i) - 49;
            const b = string.charCodeAt(i + 1) - 49;
            const c = string.charCodeAt(i + 2) - 49;
            const d = string.charCodeAt(i + 3) - 49;
            const e = string.charCodeAt(i + 4) - 49;
            const f = string.charCodeAt(i + 5) - 49;
            const g = string.charCodeAt(i + 6) - 49;
            const h = string.charCodeAt(i + 7) - 49;
            result[ptr++] = (a << 5) | (b << 2) | (c >> 1);
            result[ptr++] = ((c & 0b1) << 7) | (d << 4) | (e << 1) | (f >> 2);
            result[ptr++] = ((f & 0b11) << 6) | (g << 3) | h;
        }

        switch (encodedBytes - ptr) {
            case 1: {
                const a = string.charCodeAt(i) - 49;
                const b = string.charCodeAt(i + 1) - 49;
                const c = string.charCodeAt(i + 2) - 49;
                result[ptr] = (a << 5) | (b << 2) | (c >> 1);
                break;
            }
            case 2: {
                const a = string.charCodeAt(i) - 49;
                const b = string.charCodeAt(i + 1) - 49;
                const c = string.charCodeAt(i + 2) - 49;
                const d = string.charCodeAt(i + 3) - 49;
                const e = string.charCodeAt(i + 4) - 49;
                const f = string.charCodeAt(i + 5) - 49;
                result[ptr++] = (a << 5) | (b << 2) | (c >> 1);
                result[ptr] = ((c & 0b1) << 7) | (d << 4) | (e << 1) | (f >> 2);
                break;
            }
        }

        return result;
    }

    /**
     * Закодировать текст в строку чисел
     * @param {string} text
     * @returns {string}
     */
    encodeText(text) {
        return this._encodeBinary(this.textEncoder.encode(text));
    }

    /**
     * Декодировать строку чисел в текст
     * @param {string} text
     * @returns {string}
     */
    decodeText(text) {
        // Все символы должны быть в диапазоне [1, 8]
        for (let i = 0; i < text.length; i++) {
            const ch = text.charCodeAt(i);
            if (ch < 49 || ch > 56) {
                return "";
            }
        }
        return this.textDecoder.decode(this._decodeBinary(text));
    }

    _encodeValueToNumberIfPossible(value) {
        // Если это уже number — возвращаем как есть
        if (typeof value === 'number') {
            return value;
        }

        // Если это BigInt, превращаем в строку — JSON не поддерживает BigInt
        if (typeof value === 'bigint') {
            return value.toString();
        }

        // Приведём к строке и посмотрим, состоит ли она только из цифр (опционально -)
        const s = String(value).trim();

        // Регулярка для целого числа (опциональный минус)
        const isIntegerDigits = /^-?\d+$/.test(s);

        if (!isIntegerDigits) {
            // не чисто цифры — отправляем как строку
            return s;
        }

        // Это чистое целое число в виде строки.
        // Попробуем привести к Number, но только если в безопасном диапазоне.
        try {
            // если длина <= 15, с высокой вероятностью безопасно
            if (s.length <= 15) {
                const n = Number(s);
                if (Number.isSafeInteger(n)) return n;
            }

            // Если длина больше и/или не безопасно — не преобразуем в Number,
            // поскольку потеряется точность. JSON не поддерживает BigInt,
            // поэтому отправляем как строку (это безопаснее).
            return s;
        } catch (e) {
            return s;
        }
    }
}
