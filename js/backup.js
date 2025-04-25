class BackupManager {
    constructor() {
        this.backups = [];
        this.settings = {
            interval: 300, // minutes
            limit: 20
        };
        this.loadSettings();
        this.loadBackups(); // Load existing backups
        //this.initAutoBackup(); // Changed from startAB to initAB
        this.startAutoBackup();
        console.log('BackupManager initialized with settings:', this.settings);
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('backup_settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            console.log('Loaded settings:', this.settings);
        }
    }

    saveSettings() {
        localStorage.setItem('backup_settings', JSON.stringify(this.settings));
    }

    loadBackups() {
        const savedBackups = localStorage.getItem('scenario_backups');
        if (savedBackups) {
            try {
                this.backups = JSON.parse(savedBackups);
            } catch (e) {
                console.error('Error loading backups:', e);
                this.backups = [];
            }
        }
    }

    hasUnsavedChanges() {
        // Safe check for scenarioManager
        if (!window.scenarioManager) return false;
        return typeof window.scenarioManager.hasUnsavedChanges === 'function' 
            ? window.scenarioManager.hasUnsavedChanges()
            : false;
    }

    getCurrentScenario() {
        // Safe check for scenarioManager
        if (!window.scenarioManager) return null;
        return typeof window.scenarioManager.getCurrentScenario === 'function'
            ? window.scenarioManager.getCurrentScenario()
            : null;
    }

    getCurrentFileName() {
        // Safe check for scenarioManager
        if (!window.scenarioManager) return 'untitled.json';
        return typeof window.scenarioManager.getCurrentFileName === 'function'
            ? window.scenarioManager.getCurrentFileName()
            : 'untitled.json';
    }

    async createBackup() {
        setTimeout(() => {
        }, 1000);
        
        const scenarioData = this.getCurrentScenario();
        if (!scenarioData) return; // Don't create backup if no scenario data

        const currentData = {
            scenarioData,
            timestamp: new Date().toISOString(),
            fileName: this.getCurrentFileName(),
            size: 0,
            charCount: 0
        };

        // Convert to string to get size and char count
        const dataStr = JSON.stringify(currentData.scenarioData);
        currentData.size = new Blob([dataStr]).size;
        currentData.charCount = dataStr.length;

        // Add to beginning of array
        this.backups.unshift(currentData);

        // Enforce limit
        if (this.backups.length > this.settings.limit) {
            this.backups = this.backups.slice(0, this.settings.limit);
        }

        // Save to localStorage
        console.log('Creating backup:', currentData);
        localStorage.setItem('scenario_backups', JSON.stringify(this.backups));
        this.showBackupModal(); // Update UI immediately
    }

    async restoreBackup(index) {
        if (index >= 0 && index < this.backups.length) {
            const backup = this.backups[index];
            if (window.scenarioManager && typeof window.scenarioManager.loadScenario === 'function') {
                await window.scenarioManager.loadScenario(backup.scenarioData);
                return true;
            }
        }
        return false;
    }

    deleteBackup(index) {
        if (index >= 0 && index < this.backups.length) {
            // Remove the backup
            this.backups.splice(index, 1);
            // Save to localStorage
            localStorage.setItem('scenario_backups', JSON.stringify(this.backups));
            // Update UI immediately
            this.showBackupModal(); // Re-render the entire backup list
            return true;
        }
        return false;
    }

    updateBackupList() {
        const backupList = document.getElementById('backup-list');
        if (!backupList) return;

        backupList.innerHTML = '';

        const backups = this.getBackups();
        backups.forEach(backup => {
            const backupItem = document.createElement('div');
            backupItem.className = 'backup-item';
            backupItem.innerHTML = `
                <div class="backup-info">
                    <div class="backup-name">${backup.name}</div>
                    <div class="backup-meta">${new Date(backup.timestamp).toLocaleString()}</div>
                </div>
                <div class="backup-size">${this.formatSize(backup.size)}</div>
                <div class="backup-actions">
                    <button class="restore-backup" data-id="${backup.id}" data-translate="restore">Восстановить</button>
                    <button class="delete-backup" data-id="${backup.id}" data-translate="delete">Удалить</button>
                </div>
            `;

            const deleteBtn = backupItem.querySelector('.delete-backup');
            deleteBtn.addEventListener('click', () => this.deleteBackup(backup.id));

            const restoreBtn = backupItem.querySelector('.restore-backup');
            restoreBtn.addEventListener('click', () => this.showRestoreConfirmation(backup.id));

            backupList.appendChild(backupItem);
        });
    }

    initAutoBackup() {
        // Initial delay to wait for scenarioManager to be available
        setTimeout(() => {
            if (this.hasUnsavedChanges()) {
                console.log('Auto backup triggered');
                this.createBackup();
            }
            this.startAutoBackup();
            console.log('Initial backup triggered');
        }, 2000); // 2 second initial delay
    }

    startAutoBackup() {
        console.log('Auto backup started with interval:', this.settings.interval, 'seconds');
        setInterval(() => {
            if (this.hasUnsavedChanges() || 1 === 1 ) { // Always trigger backup for testing
                console.log('Auto backup triggered');
                this.createBackup();
            }
        }, this.settings.interval * 1000); // Convert seconds to milliseconds
    }

    showBackupModal() {
        const modal = document.getElementById('backups-modal');
        const listContainer = document.getElementById('backup-list');
        listContainer.innerHTML = '';

        this.backups.forEach((backup, index) => {
            const date = new Date(backup.timestamp);
            const formattedDate = date.toLocaleString();
            const size = (backup.size / 1024).toFixed(2); // Convert to KB

            const backupItem = document.createElement('div');
            backupItem.className = 'backup-item';
            backupItem.innerHTML = `
                <div class="backup-info">
                    <div class="backup-name">${backup.fileName}</div>
                    <div class="backup-meta">${formattedDate} • ${size}KB • ${backup.charCount} chars</div>
                </div>
                <div class="backup-size">${size}KB</div>
                <div class="backup-actions">
                    <button class="restore-backup" onclick="window.backupManager.confirmRestore(${index})" data-translate="restore">Восстановить</button>
                    <button class="delete-backup" onclick="window.backupManager.deleteBackup(${index})" data-translate="delete">Удалить</button>
                </div>
            `;
            listContainer.appendChild(backupItem);
        });

        modal.classList.add('active');
    }

    async confirmRestore(index) {
        const confirmModal = document.getElementById('restore-backup-confirm-modal');
        confirmModal.classList.add('active');

        // Handle confirmation
        const confirmButton = confirmModal.querySelector('[data-action="confirm"]');
        const cancelButton = confirmModal.querySelector('[data-action="cancel"]');

        const handleConfirm = async () => {
            await this.restoreBackup(index);
            confirmModal.classList.remove('active');
            document.getElementById('backups-modal').classList.remove('active');
            cleanup();
        };

        const handleCancel = () => {
            confirmModal.classList.remove('active');
            cleanup();
        };

        const cleanup = () => {
            confirmButton.removeEventListener('click', handleConfirm);
            cancelButton.removeEventListener('click', handleCancel);
        };

        confirmButton.addEventListener('click', handleConfirm);
        cancelButton.addEventListener('click', handleCancel);
    }
}

// Initialize backup manager
window.backupManager = new BackupManager();

// Add event listeners when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Settings listeners
    const intervalInput = document.getElementById('backup-interval');
    const limitInput = document.getElementById('backup-limit');

    if (intervalInput) {
        intervalInput.value = window.backupManager.settings.interval;
        intervalInput.addEventListener('change', () => {
            window.backupManager.settings.interval = parseInt(intervalInput.value, 10);
            window.backupManager.saveSettings();
        });
    }

    if (limitInput) {
        limitInput.value = window.backupManager.settings.limit;
        limitInput.addEventListener('change', () => {
            window.backupManager.settings.limit = parseInt(limitInput.value, 10);
            window.backupManager.saveSettings();
        });
    }

    // Add backup button listener
    const backupButton = document.querySelector('[data-action="backups"]');
    if (backupButton) {
        backupButton.addEventListener('click', () => {
            window.backupManager.showBackupModal();
        });
    }

    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').classList.remove('active');
        });
    });
});