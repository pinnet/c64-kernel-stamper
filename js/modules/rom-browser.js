// ROM Browser UI Module

import { getRomsFromStorage, deleteRomFromStorage, getRomById } from './storage.js';
import { processRomFile } from './rom-processor.js';

export function loadRomBrowser() {
    const romList = document.getElementById('rom-list');
    const roms = getRomsFromStorage();
    const romIds = Object.keys(roms);
    
    if (romIds.length === 0) {
        romList.innerHTML = '<p class="empty-state">No ROM files uploaded yet</p>';
        return;
    }
    
    romList.innerHTML = '';
    
    romIds.forEach(romId => {
        const rom = roms[romId];
        const romItem = createRomItem(rom);
        romList.appendChild(romItem);
    });
}

function createRomItem(rom) {
    const item = document.createElement('div');
    item.className = 'rom-item';
    item.dataset.romId = rom.id;
    
    const sizeKB = (rom.size / 1024).toFixed(2);
    const uploadDate = new Date(rom.uploadDate).toLocaleDateString();
    const changeCount = rom.metadata?.changeCount || 0;
    
    item.innerHTML = `
        <div class="rom-item-info" data-rom-id="${rom.id}">
            <svg class="rom-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
            <div class="rom-details">
                <div class="rom-name">${rom.name}</div>
                <div class="rom-meta">${sizeKB} KB • ${uploadDate} • ${changeCount} edit${changeCount !== 1 ? 's' : ''}</div>
            </div>
        </div>
        <div class="rom-actions">
            <button class="rom-btn rom-btn-download" data-action="download" data-rom-id="${rom.id}" title="Download">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
            </button>
            <button class="rom-btn rom-btn-delete" data-action="delete" data-rom-id="${rom.id}" title="Delete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    `;
    
    return item;
}

export function deleteRomPrompt(romId) {
    const rom = getRomById(romId);
    
    if (rom && confirm(`Delete "${rom.name}"?`)) {
        deleteRomFromStorage(romId);
        loadRomBrowser();
    }
}

export function downloadRom(romId) {
    const rom = getRomById(romId);
    
    if (rom) {
        const link = document.createElement('a');
        link.href = rom.data;
        link.download = rom.name;
        link.click();
    }
}

export function loadRomFromStorage(romId) {
    // Remove active class from all items
    document.querySelectorAll('.rom-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to selected item
    const selectedItem = document.querySelector(`[data-rom-id="${romId}"]`);
    if (selectedItem) {
        selectedItem.closest('.rom-item').classList.add('active');
    }
    
    const rom = getRomById(romId);
    
    if (rom) {
        // Convert base64 back to blob
        fetch(rom.data)
            .then(res => res.blob())
            .then(blob => {
                processRomFile(blob, rom.name, romId);
            });
    }
}

export function setupRomBrowserEvents() {
    const romList = document.getElementById('rom-list');
    
    romList.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action]');
        const infoTarget = e.target.closest('.rom-item-info');
        
        if (target) {
            e.stopPropagation();
            const action = target.dataset.action;
            const romId = target.dataset.romId;
            
            if (action === 'delete') {
                deleteRomPrompt(romId);
            } else if (action === 'download') {
                downloadRom(romId);
            }
        } else if (infoTarget) {
            const romId = infoTarget.dataset.romId;
            loadRomFromStorage(romId);
        }
    });
}
