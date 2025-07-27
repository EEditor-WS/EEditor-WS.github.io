let coopRecivePeer = null;
let сoopRecivePusher = null;
let coopReciveChannel = null;
let coopReciveReceivedData = '';
let coopReciveIsConnected = false;
let coopReciveCurrentRoomId = // Скачивание файла
function coopReciveDownloadJSON() {
    try {
        const blob = new Blob([coopReciveReceivedData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `received_data_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        coopReciveUpdateDebug('💾 Файл скачан');
    } catch (e) {
        console.error('Ошибка скачивания:', e);
        coopReciveUpdateStatus('❌ Ошибка скачивания файла', 'error');
    }
};
coopReciveMyId = Math.random().toString(36).substr(2, 9);

// Используем Firebase Realtime Database как простой WebSocket relay
let coopReciveFirebaseUrl = 'https://webrtc-relay-default-rtdb.europe-west1.firebasedatabase.app/';

// Отправка сигнала через Firebase
async function coopReciveSendSignalToFirebase(eventName, data) {
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

// Слушаем offer через polling Firebase
let coopRecivePollingInterval = null;

function startListeningForOffer() {
    if (coopRecivePollingInterval) return;
    
    coopRecivePollingInterval = setInterval(async () => {
        try {
            const response = await fetch(`${coopReciveFirebaseUrl}rooms/${coopReciveCurrentRoomId}/offer.json`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.senderId !== coopReciveMyId && data.signal) {
                    clearInterval(coopRecivePollingInterval);
                    coopRecivePollingInterval = null;
                    coopReciveHandleOffer(data);
                    // Очищаем offer после получения
                    await fetch(`${coopReciveFirebaseUrl}rooms/${coopReciveCurrentRoomId}/offer.json`, { method: 'DELETE' });
                }
            }
        } catch (error) {
            // Игнорируем ошибки polling
        }
    }, 1000);
}

// Инициализация (убираем Pusher, используем Firebase)
function coopReciveInitConnection() {
    coopReciveUpdateDebug('🔥 Используем Firebase как WebSocket relay');
}

// Присоединение к комнате
function coopReciveJoinRoom(roomId) {
    if (!roomId.trim()) {
        coopReciveUpdateStatus('❌ Введите ID комнаты', 'error');
        return;
    }

    coopReciveCurrentRoomId = roomId;
    coopReciveUpdateStatus('🔗 Подключение к комнате...', 'waiting');
    
    coopReciveUpdateDebug(`Присоединяюсь к комнате: ${roomId}, мой ID: ${coopReciveMyId}`);
    coopReciveUpdateStatus('✅ Подключен к комнате, ожидаю WebRTC сигналы...', 'connected');
    
    // Начинаем слушать offer от отправителя
    coopReciveStartListeningForOffer();
}

// Создание peer соединения
function coopReciveCreatePeer(offerSignal) {
    coopRecivePeer = new SimplePeer({ 
        initiator: false, 
        trickle: false 
    });

    coopRecivePeer.on('signal', async (data) => {
        coopReciveUpdateDebug('📡 Генерирую WebRTC answer...');
        coopReciveUpdateStatus('📡 Отправка ответного сигнала через Firebase...', 'waiting');
        
        try {
            await coopReciveSendSignalToFirebase('answer', {
                signal: data,
                senderId: coopReciveMyId
            });
            coopReciveUpdateStatus('✅ Ответный сигнал отправлен', 'waiting');
        } catch (error) {
            coopReciveUpdateStatus('❌ Ошибка отправки ответного сигнала', 'error');
        }
    });

    coopRecivePeer.on('connect', () => {
        coopReciveIsConnected = true;
        coopReciveUpdateStatus('✅ WebRTC соединение установлено! Ожидаю данные...', 'connected');
        coopReciveUpdateDebug('🔗 WebRTC канал данных открыт');
        coopReciveReceivedData = '';
    });

    coopRecivePeer.on('data', data => {
        const chunk = data.toString();
        
        if (chunk === "__EOF__") {
            coopReciveUpdateStatus('✅ JSON получен полностью через WebRTC!', 'connected');
            coopReciveDisplayReceivedData();
            coopReciveUpdateDebug(`✅ Получение завершено. Размер: ${coopReciveReceivedData.length} символов`);
        } else {
            coopReciveReceivedData += chunk;
            const progress = Math.round((coopReciveReceivedData.length / 1000)); // Примерный прогресс
            coopReciveUpdateStatus(`📥 Получение данных через WebRTC... (${coopReciveReceivedData.length} символов)`, 'waiting');
        }
    });

    coopRecivePeer.on('error', err => {
        console.error('Ошибка WebRTC:', err);
        coopReciveUpdateStatus('❌ Ошибка WebRTC: ' + err.message, 'error');
        coopReciveUpdateDebug(`❌ WebRTC ошибка: ${err.message}`);
    });

    coopRecivePeer.on('close', () => {
        coopReciveUpdateStatus('🔌 WebRTC соединение закрыто', 'waiting');
        coopReciveUpdateDebug('🔌 WebRTC канал данных закрыт');
        coopReciveIsConnected = false;
    });

    // Обрабатываем полученный offer
    try {
        coopRecivePeer.signal(offerSignal);
        coopReciveUpdateDebug('✅ Offer обработан, генерирую answer...');
    } catch (e) {
        console.error('Ошибка обработки offer:', e);
        coopReciveUpdateStatus('❌ Ошибка обработки WebRTC сигнала', 'error');
        coopReciveUpdateDebug(`❌ Ошибка offer: ${e.message}`);
    }
}

// Обработка offer от отправителя
function coopReciveHandleOffer(data) {
    coopReciveUpdateDebug('📡 Получен WebRTC offer через Firebase');
    coopReciveUpdateStatus('🔄 Обработка WebRTC сигнала...', 'waiting');
    
    try {
        if (data.senderId !== coopReciveMyId && data.signal) {
            if (!coopRecivePeer) {
                coopReciveCreatePeer(data.signal);
            }
            coopReciveUpdateDebug('✅ Создаю WebRTC соединение...');
        } else {
            coopReciveUpdateDebug('⚠️ Игнорирую свой собственный сигнал');
        }
    } catch (e) {
        console.error('Ошибка обработки offer:', e);
        coopReciveUpdateStatus('❌ Ошибка обработки WebRTC сигнала', 'error');
        coopReciveUpdateDebug(`❌ Ошибка offer: ${e.message}`);
    }
}

// Отображение полученных данных
function coopReciveDisplayReceivedData() {
    try {
        const parsed = JSON.parse(coopReciveReceivedData);
        const formatted = JSON.stringify(parsed, null, 2);
        
        /*document.getElementById('receivedData').value = formatted;
        document.getElementById('downloadSection').style.display = 'block';*/
        coopReciveUpdateDebug('✅ JSON успешно отформатирован');
    } catch (e) {
        console.error('Полученные данные не являются валидным JSON:', e);
        /*document.getElementById('receivedData').value = receivedData;
        document.getElementById('downloadSection').style.display = 'block';*/
        coopReciveUpdateStatus('⚠️ Данные получены, но JSON некорректен', 'error');
        coopReciveUpdateDebug(`⚠️ JSON невалиден: ${e.message}`);
    }
}

// Скачивание файла
function coopReciveDownloadJSON() {
    try {
        const blob = new Blob([receivedData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `received_data_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        updateDebug('💾 Файл скачан');
    } catch (e) {
        console.error('Ошибка скачивания:', e);
        updateStatus('❌ Ошибка скачивания файла', 'error');
    }
}

// Копирование в буфер обмена
/*function copyToClipboard() {
    navigator.clipboard.writeText(receivedData).then(() => {
        updateDebug('📋 Данные скопированы в буфер обмена');
        const btn = document.getElementById('copyBtn');
        const originalText = btn.textContent;
        btn.textContent = '✅ Скопировано!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Ошибка копирования:', err);
        updateDebug(`❌ Ошибка копирования: ${err.message}`);
    });
}*/

// Обновление статуса
function coopReciveUpdateStatus(message, type = '') {
    const statusEl = document.getElementById('coop-recive-status');
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
}

// Обновление отладочной информации
function coopReciveUpdateDebug(message) {
    const debugEl = document.getElementById('coop-recive-debug');
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
document.getElementById('coop-recive-connect-button').onclick = () => {
    const coopReciveRoomId = document.getElementById('coop-recive-room').value;
    coopReciveInitConnection();
    document.getElementById('coop-recive-connect-button').disabled = true;
    coopReciveJoinRoom(coopReciveRoomId);
};

/*document.getElementById('coop-recive-download-btn').onclick = coopReciveDownloadJSON;
document.getElementById('coop-recive-copy-btn').onclick = coopReciveCopyToClipboard;*/

// Инициализация при загрузке страницы
window.addEventListener('load', () => {
    coopReciveUpdateDebug('🚀 Receiver загружен');
    coopReciveUpdateDebug('🔥 Firebase сигналы + 🔗 WebRTC данные');
});