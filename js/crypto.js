class CryptoManager {
    constructor() {
        this.encoder = new TextEncoder();
        this.decoder = new TextDecoder();
    }

    // Генерация ключа шифрования из строки
    async generateKey(password) {
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
    }

    // Шифрование данных
    async encrypt(data, password) {
        try {
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

            return btoa(String.fromCharCode.apply(null, resultArray));
        } catch (error) {
            console.error('Ошибка шифрования:', error);
            return null;
        }
    }

    // Расшифровка данных
    async decrypt(encryptedData, password) {
        try {
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

            return JSON.parse(this.decoder.decode(decryptedContent));
        } catch (error) {
            console.error('Ошибка расшифровки:', error);
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