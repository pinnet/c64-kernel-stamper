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
            uploadDate: new Date().toISOString()
        };
        
        localStorage.setItem('c64-roms', JSON.stringify(roms));
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
}

export function getRomById(romId) {
    const roms = getRomsFromStorage();
    return roms[romId];
}
