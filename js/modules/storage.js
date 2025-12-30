// Local Storage Management Module

export function saveRomToStorage(fileName, fileData, fileSize) {
    try {
        const roms = getRomsFromStorage();
        const romId = Date.now().toString();
        
        roms[romId] = {
            id: romId,
            name: fileName,
            data: fileData,
            size: fileSize,
            uploadDate: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            metadata: {
                version: '1.0',
                originalName: fileName,
                changeCount: 0
            }
        };
        
        localStorage.setItem('c64-roms', JSON.stringify(roms));
        
        // Initialize history for this ROM
        initializeRomHistory(romId);
        
        return romId;
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            alert('Storage quota exceeded. Please delete some ROM files.');
        }
        console.error('Error saving ROM:', e);
        return null;
    }
}

export function getRomsFromStorage() {
    try {
        const roms = localStorage.getItem('c64-roms');
        return roms ? JSON.parse(roms) : {};
    } catch (e) {
        console.error('Error loading ROMs:', e);
        return {};
    }
}

export function deleteRomFromStorage(romId) {
    const roms = getRomsFromStorage();
    delete roms[romId];
    localStorage.setItem('c64-roms', JSON.stringify(roms));
    
    // Delete associated history
    deleteRomHistory(romId);
}

export function getRomById(romId) {
    const roms = getRomsFromStorage();
    return roms[romId];
}

export function updateRomMetadata(romId, updates) {
    const roms = getRomsFromStorage();
    const rom = roms[romId];
    
    if (rom) {
        rom.lastModified = new Date().toISOString();
        
        // Initialize metadata if it doesn't exist (for legacy ROMs)
        if (!rom.metadata) {
            rom.metadata = {
                version: '1.0',
                originalName: rom.name,
                changeCount: 0
            };
        }
        
        rom.metadata.changeCount = (rom.metadata.changeCount || 0) + 1;
        
        Object.assign(rom.metadata, updates);
        
        localStorage.setItem('c64-roms', JSON.stringify(roms));
    }
}

export function updateRomData(romId, newData) {
    const roms = getRomsFromStorage();
    const rom = roms[romId];
    
    if (rom) {
        rom.data = newData;
        rom.lastModified = new Date().toISOString();
        localStorage.setItem('c64-roms', JSON.stringify(roms));
        return true;
    }
    return false;
}

export function renameRom(romId, newName) {
    const roms = getRomsFromStorage();
    const rom = roms[romId];
    
    if (rom) {
        rom.name = newName;
        rom.lastModified = new Date().toISOString();
        localStorage.setItem('c64-roms', JSON.stringify(roms));
        return true;
    }
    return false;
}

// History Management Functions

function getHistoryKey(romId) {
    return `c64-rom-history-${romId}`;
}

export function initializeRomHistory(romId) {
    const historyKey = getHistoryKey(romId);
    const history = {
        romId: romId,
        changes: [],
        currentIndex: -1,
        maxHistorySize: 50
    };
    
    localStorage.setItem(historyKey, JSON.stringify(history));
}

export function addHistoryEntry(romId, changeType, changeData, previousState) {
    try {
        const historyKey = getHistoryKey(romId);
        const historyJson = localStorage.getItem(historyKey);
        
        let history;
        if (!historyJson) {
            initializeRomHistory(romId);
            // Re-read after initialization
            history = JSON.parse(localStorage.getItem(historyKey));
        } else {
            history = JSON.parse(historyJson);
        }
        
        // Remove any redo history if we're not at the end
        if (history.currentIndex < history.changes.length - 1) {
            history.changes = history.changes.slice(0, history.currentIndex + 1);
        }
        
        // Add new history entry
        const entry = {
            timestamp: new Date().toISOString(),
            changeType: changeType,
            changeData: changeData,
            previousState: previousState
        };
        
        history.changes.push(entry);
        history.currentIndex++;
        
        // Limit history size
        if (history.changes.length > history.maxHistorySize) {
            history.changes.shift();
            history.currentIndex--;
        }
        
        localStorage.setItem(historyKey, JSON.stringify(history));
        
        // Update ROM metadata
        updateRomMetadata(romId, {});
        
        return true;
    } catch (e) {
        console.error('Error adding history entry:', e);
        return false;
    }
}

export function getRomHistory(romId) {
    const historyKey = getHistoryKey(romId);
    const historyJson = localStorage.getItem(historyKey);
    
    if (!historyJson) {
        initializeRomHistory(romId);
        return JSON.parse(localStorage.getItem(historyKey));
    }
    
    return JSON.parse(historyJson);
}

export function canUndo(romId) {
    const history = getRomHistory(romId);
    return history.currentIndex >= 0;
}

export function canRedo(romId) {
    const history = getRomHistory(romId);
    return history.currentIndex < history.changes.length - 1;
}

export function undo(romId) {
    const history = getRomHistory(romId);
    
    if (!canUndo(romId)) {
        return null;
    }
    
    const change = history.changes[history.currentIndex];
    history.currentIndex--;
    
    const historyKey = getHistoryKey(romId);
    localStorage.setItem(historyKey, JSON.stringify(history));
    
    return change;
}

export function redo(romId) {
    const history = getRomHistory(romId);
    
    if (!canRedo(romId)) {
        return null;
    }
    
    history.currentIndex++;
    const change = history.changes[history.currentIndex];
    
    const historyKey = getHistoryKey(romId);
    localStorage.setItem(historyKey, JSON.stringify(history));
    
    return change;
}

export function deleteRomHistory(romId) {
    const historyKey = getHistoryKey(romId);
    localStorage.removeItem(historyKey);
}

export function getHistorySummary(romId) {
    const history = getRomHistory(romId);
    const rom = getRomById(romId);
    
    if (!rom) return null;
    
    return {
        totalChanges: history.changes.length,
        currentPosition: history.currentIndex + 1,
        canUndo: canUndo(romId),
        canRedo: canRedo(romId),
        lastModified: rom.lastModified || rom.uploadDate,
        changeCount: rom.metadata?.changeCount || 0
    };
}
