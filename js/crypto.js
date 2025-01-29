class CryptoManager {
    constructor() {
        this.encoder = new TextEncoder();
        this.decoder = new TextDecoder();
        this.loadOrGenerateKey();
    }

    loadOrGenerateKey() {
        const savedKey = localStorage.getItem('cryptoKey');
        if (savedKey) {
            console.log('🔑 Загружен существующий ключ шифрования');
            this.encryptionKey = savedKey;
        } else {
            this.encryptionKey = this.generateRandomPassword();
            localStorage.setItem('cryptoKey', this.encryptionKey);
            console.log('🔑 Создан новый ключ шифрования');
        }
    }

    // Генерация ключа шифрования из строки
    async generateKey(password) {
        try {
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                this.encoder.encode(password),
                { name: 'PBKDF2' },
                false,
                ['deriveBits', 'deriveKey']
            );

            return crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: this.encoder.encode('EEditor-Salt'),
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
            );
        } catch (error) {
            console.error('❌ Ошибка генерации ключа:', error);
            throw error;
        }
    }

    // Шифрование данных
    async encrypt(data, password = this.encryptionKey) {
        try {
            console.log('🔐 Начало шифрования данных...');
            const key = await this.generateKey(password);
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encryptedContent = await crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                key,
                this.encoder.encode(JSON.stringify(data))
            );

            const encryptedArray = new Uint8Array(encryptedContent);
            const resultArray = new Uint8Array(iv.length + encryptedArray.length);
            resultArray.set(iv);
            resultArray.set(encryptedArray, iv.length);

            const result = btoa(String.fromCharCode.apply(null, resultArray));
            console.log('✅ Данные успешно зашифрованы');
            return result;
        } catch (error) {
            console.error('❌ Ошибка шифрования:', error);
            throw error;
        }
    }

    // Расшифровка данных
    async decrypt(encryptedData, password = this.encryptionKey) {
        try {
            console.log('🔓 Начало расшифровки данных...');
            const key = await this.generateKey(password);
            const encryptedArray = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
            
            const iv = encryptedArray.slice(0, 12);
            const data = encryptedArray.slice(12);

            const decryptedContent = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                key,
                data
            );

            const result = JSON.parse(this.decoder.decode(decryptedContent));
            console.log('✅ Данные успешно расшифрованы');
            return result;
        } catch (error) {
            console.error('❌ Ошибка расшифровки:', error);
            return null;
        }
    }

    // Генерация случайного пароля
    generateRandomPassword(length = 32) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode.apply(null, array)).slice(0, length);
    }
}

// Создаем глобальный экземпляр менеджера шифрования
window.cryptoManager = new CryptoManager(); 