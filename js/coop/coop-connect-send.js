const CHUNK_SIZE = 15000;
let peer = null;
let pusher = null;
let channel = null;
let jsonString = '';
let isConnected = false;
let currentRoomId = '';
let myId = Math.random().toString(36).substr(2, 9);

// Используем Firebase Realtime Database как простой WebSocket relay
let firebaseUrl = 'https://webrtc-relay-default-rtdb.europe-west1.firebasedatabase.app/';

// Отправка сигнала через Firebase
async function sendSignalToFirebase(eventName, data) {
    try {
        const response = await fetch(`${firebaseUrl}rooms/${currentRoomId}/${eventName}.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...data,
                timestamp: Date.now()
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        updateDebug(`✅ Сигнал ${eventName} отправлен через Firebase`);
        return await response.json();
    } catch (error) {
        updateDebug(`❌ Ошибка Firebase: ${error.message}`);
        throw error;
    }
}

// Слушаем ответы через polling Firebase
let pollingInterval = null;

function startListeningForAnswer() {
    if (pollingInterval) return;
    
    pollingInterval = setInterval(async () => {
        try {
            const response = await fetch(`${firebaseUrl}rooms/${currentRoomId}/answer.json`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.senderId !== myId && data.signal) {
                    clearInterval(pollingInterval);
                    pollingInterval = null;
                    handleAnswer(data);
                    // Очищаем ответ после получения
                    await fetch(`${firebaseUrl}rooms/${currentRoomId}/answer.json`, { method: 'DELETE' });
                }
            }
        } catch (error) {
            // Игнорируем ошибки polling
        }
    }, 1000);
}

// Инициализация (убираем Pusher, используем Firebase)
function initConnection() {
    updateDebug('🔥 Используем Firebase как WebSocket relay');
}

// Присоединение к комнате
function joinRoom(roomId) {
    if (!roomId.trim()) {
        updateStatus('❌ Введите ID комнаты', 'error');
        return;
    }

    currentRoomId = roomId;
    updateStatus('🔗 Подключение к комнате...', 'waiting');
    
    updateDebug(`Присоединяюсь к комнате: ${roomId}, мой ID: ${myId}`);
    updateStatus('🔗 Подключен к комнате, создаю WebRTC соединение...', 'waiting');
    
    // Создаем peer как инициатор
    createPeer(true);
    
    // Начинаем слушать ответы
    startListeningForAnswer();
}

// Создание peer соединения
function createPeer(initiator) {
    peer = new SimplePeer({ 
        initiator: initiator, 
        trickle: false 
    });

    peer.on('signal', async (data) => {
        updateDebug('📡 Генерирую WebRTC offer...');
        updateStatus('📡 Отправка сигнала WebRTC через Firebase...', 'waiting');
        
        try {
            await sendSignalToFirebase('offer', {
                signal: data,
                senderId: myId
            });
            updateStatus('✅ Сигнал отправлен, ожидаю ответа...', 'waiting');
        } catch (error) {
            updateStatus('❌ Ошибка отправки сигнала', 'error');
        }
    });

    peer.on('connect', () => {
        isConnected = true;
        updateStatus('✅ WebRTC соединение установлено! Можно выбрать файл', 'connected');
        
        if (jsonString) {
            sendInChunks(jsonString);
        }
    });

    peer.on('error', err => {
        console.error('Ошибка WebRTC:', err);
        updateStatus('❌ Ошибка WebRTC: ' + err.message, 'error');
        updateDebug(`❌ WebRTC ошибка: ${err.message}`);
    });

    peer.on('close', () => {
        updateStatus('🔌 WebRTC соединение закрыто', 'waiting');
        isConnected = false;
    });
}

// Обработка ответа от получателя
function handleAnswer(data) {
    updateDebug('📡 Получен WebRTC answer через Firebase');
    updateStatus('🔄 Завершение WebRTC подключения...', 'waiting');
    
    try {
        if (data.senderId !== myId && data.signal) {
            peer.signal(data.signal);
            updateDebug('✅ Answer обработан');
        } else {
            updateDebug('⚠️ Игнорирую свой собственный сигнал');
        }
    } catch (e) {
        console.error('Ошибка обработки answer:', e);
        updateStatus('❌ Ошибка обработки ответного сигнала', 'error');
        updateDebug(`❌ Ошибка answer: ${e.message}`);
    }
}

// Отправка данных частями через WebRTC
function sendInChunks(data) {
    updateStatus('📤 Отправка JSON через WebRTC...', 'waiting');
    updateDebug(`📦 Начинаю отправку файла (${data.length} символов)`);
    let offset = 0;
    
    function sendChunk() {
        if (!isConnected) {
            updateDebug('❌ Соединение потеряно во время отправки');
            return;
        }
        
        if (offset < data.length) {
            const chunk = data.slice(offset, offset + CHUNK_SIZE);
            try {
                peer.send(chunk);
                offset += CHUNK_SIZE;
                
                // Показываем прогресс
                const progress = Math.round((offset / data.length) * 100);
                updateStatus(`📤 Отправка через WebRTC: ${progress}%`, 'waiting');
                
                setTimeout(sendChunk, 10);
            } catch (e) {
                console.error('Ошибка отправки chunk:', e);
                updateStatus('❌ Ошибка отправки данных через WebRTC', 'error');
                updateDebug(`❌ Ошибка отправки chunk: ${e.message}`);
                return;
            }
        } else {
            peer.send("__EOF__");
            updateStatus('✅ JSON отправлен полностью через WebRTC!', 'connected');
            updateDebug('✅ Отправка файла завершена');
        }
    }
    
    sendChunk();
}

// Обновление статуса
function updateStatus(message, type = '') {
    const statusEl = document.getElementById('coop-send-status');
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
}

// Обновление отладочной информации
function updateDebug(message) {
    const debugEl = document.getElementById('coop-send-debug');
    const time = new Date().toLocaleTimeString();
    debugEl.innerHTML += `<div>[${time}] ${message}</div>`;
    debugEl.scrollTop = debugEl.scrollHeight;
    
    // Ограничиваем количество записей
    const lines = debugEl.children;
    if (lines.length > 50) {
        debugEl.removeChild(lines[0]);
    }
}

// Обработчики событий
document.getElementById('coop-send-connect-button').onclick = () => {
    const roomId = document.getElementById('coop-send-room').value;
    initConnection();
    document.getElementById('coop-send-connect-button').disabled = true;
    joinRoom(roomId);
};

/*document.getElementById('file').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    updateStatus('📁 Загрузка файла...', 'waiting');
    updateDebug(`📁 Загружаю файл: ${file.name} (${file.size} байт)`);
    const reader = new FileReader();
    
    reader.onload = () => {
        try {
            const json = JSON.parse(reader.result);
            jsonString = JSON.stringify(json);
            updateStatus('📁 JSON готов к отправке через WebRTC', 'waiting');
            updateDebug(`✅ JSON валиден, размер: ${jsonString.length} символов`);
            
            if (isConnected) {
                sendInChunks(jsonString);
            } else {
                updateStatus('⏳ JSON готов, ожидаю WebRTC соединения...', 'waiting');
            }
        } catch (err) {
            updateStatus('❌ Ошибка: Неверный JSON файл', 'error');
            updateDebug(`❌ JSON ошибка: ${err.message}`);
        }
    };
    
    reader.readAsText(file);
});*/

// Инициализация при загрузке страницы
window.addEventListener('load', () => {
    updateDebug('🚀 Sender загружен');
    updateDebug('🔥 Firebase сигналы + 🔗 WebRTC данные');
});