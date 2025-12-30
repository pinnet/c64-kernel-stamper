// ROM Browser UI Module

import { getRomsFromStorage, deleteRomFromStorage, getRomById, renameRom } from './storage.js';
import { processRomFile } from './rom-processor.js';
import { saveChangesToRom, getCurrentRomId, updateBorderColor, updateBackgroundColor, updateTextColor } from './rom-editor.js';

// HTML escape to prevent XSS attacks
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

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
                <div class="rom-name">${escapeHtml(rom.name)}</div>
                <div class="rom-meta">${sizeKB} KB • ${uploadDate} • ${changeCount} edit${changeCount !== 1 ? 's' : ''}</div>
            </div>
        </div>
        <div class="rom-actions">
            <button class="rom-btn rom-btn-rename" data-action="rename" data-rom-id="${rom.id}" title="Rename">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </button>
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
    
    if (rom && confirm(`Delete "${escapeHtml(rom.name)}"?`)) {
        deleteRomFromStorage(romId);
        loadRomBrowser();
    }
}

export function renameRomPrompt(romId) {
    const rom = getRomById(romId);
    
    if (rom) {
        const newName = prompt('Enter new name:', rom.name);
        
        if (newName && newName.trim() !== '' && newName !== rom.name) {
            const success = renameRom(romId, newName.trim());
            if (success) {
                loadRomBrowser();
                
                // If this is the currently loaded ROM, keep it selected
                const currentRom = getCurrentRomId();
                if (currentRom === romId) {
                    setTimeout(() => {
                        const item = document.querySelector(`[data-rom-id="${romId}"]`);
                        if (item) {
                            item.closest('.rom-item').classList.add('active');
                        }
                    }, 50);
                }
            }
        }
    }
}

export function downloadRom(romId) {
    const currentRom = getCurrentRomId();
    
    // If downloading the currently edited ROM, save changes first
    if (currentRom === romId) {
        saveChangesToRom().then(() => {
            performDownload(romId);
        });
    } else {
        performDownload(romId);
    }
}

function performDownload(romId) {
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
            } else if (action === 'rename') {
                renameRomPrompt(romId);
            }
        } else if (infoTarget) {
            const romId = infoTarget.dataset.romId;
            loadRomFromStorage(romId);
        }
    });
    
    // Setup color palette click handlers
    setupColorPaletteEvents();
}

function setupColorPaletteEvents() {
    const colorGroups = document.querySelectorAll('.color-group');
    
    colorGroups.forEach((group, index) => {
        const palette = group.querySelector('.color-palette');
        if (!palette) return;
        
        palette.addEventListener('click', (e) => {
            const swatch = e.target.closest('.color-swatch');
            if (!swatch) return;
            
            const colorName = swatch.dataset.color;
            const colorIndex = getColorIndex(colorName);
            
            // Remove active from all swatches in this palette
            palette.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
            swatch.classList.add('selected');
            
            // Update the appropriate color based on which palette (0=border, 1=background, 2=text)
            if (index === 0) {
                updateBorderColor(colorIndex);
            } else if (index === 1) {
                updateBackgroundColor(colorIndex);
            } else if (index === 2) {
                updateTextColor(colorIndex);
            }
        });
    });
}

function getColorIndex(colorName) {
    const colorMap = {
        'black': 0,
        'white': 1,
        'red': 2,
        'cyan': 3,
        'purple': 4,
        'green': 5,
        'blue': 6,
        'yellow': 7,
        'orange': 8,
        'brown': 9,
        'light-red': 10,
        'gray-1': 11,
        'gray-2': 12,
        'light-green': 13,
        'light-blue': 14,
        'gray-3': 15
    };
    return colorMap[colorName] || 0;
}
