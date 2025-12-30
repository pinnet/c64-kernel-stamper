// ROM Editor Module - Handles editing and tracks changes

import { addHistoryEntry, canUndo, canRedo, undo, redo, getHistorySummary, getRomById, updateRomData } from './storage.js';

let currentRomId = null;
let currentRomState = {
    line1: '',
    line2: '',
    borderColor: 14,
    backgroundColor: 6,
    textColor: 14
};

// Track original values for change detection
let originalLine1 = '';
let originalLine2 = '';

const colors = [
    "000000", "FFFFFF", "880000", "AAFFEE", "CC44CC", "00CC55", "0000AA", "EEEE77",
    "DD8855", "664400", "FF7777", "333333", "777777", "AAFF66", "0088FF", "BBBBBB"
];

export function setCurrentRom(romId) {
    currentRomId = romId;
    updateHistoryUI();
}

export function getCurrentRomId() {
    return currentRomId;
}

export function resetEditorState() {
    currentRomId = null;
    currentRomState = {
        line1: '',
        line2: '',
        borderColor: 14,
        backgroundColor: 6,
        textColor: 14
    };
    
    originalLine1 = '';
    originalLine2 = '';
    
    // Clear form inputs
    const line1Input = document.getElementById('rom-line-1');
    const line2Input = document.getElementById('rom-line-2');
    
    if (line1Input) line1Input.value = '';
    if (line2Input) line2Input.value = '';
    
    // Reset history UI
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const historyInfo = document.getElementById('history-info');
    
    if (undoBtn) undoBtn.disabled = true;
    if (redoBtn) redoBtn.disabled = true;
    if (historyInfo) historyInfo.textContent = '0 changes';
}

export function setCurrentRomState(state) {
    currentRomState = { ...state };
    originalLine1 = state.line1;
    originalLine2 = state.line2;
}

export function getCurrentRomState() {
    return { ...currentRomState };
}

export function updateLine1(newValue) {
    if (!currentRomId) return;
    
    const previousState = getCurrentRomState();
    currentRomState.line1 = newValue;
    
    // Only add history if value actually changed from original
    if (newValue !== originalLine1) {
        addHistoryEntry(currentRomId, 'line1-change', {
            newValue: newValue,
            oldValue: originalLine1
        }, previousState);
        
        originalLine1 = newValue;
    }
    
    updatePreview();
    updateHistoryUI();
}

export function updateLine2(newValue) {
    if (!currentRomId) return;
    
    const previousState = getCurrentRomState();
    currentRomState.line2 = newValue;
    
    // Only add history if value actually changed from original
    if (newValue !== originalLine2) {
        addHistoryEntry(currentRomId, 'line2-change', {
            newValue: newValue,
            oldValue: originalLine2
        }, previousState);
        
        originalLine2 = newValue;
    }
    
    updatePreview();
    updateHistoryUI();
}

// Live preview update without history tracking
function updateLine1Preview(newValue) {
    currentRomState.line1 = newValue;
    updatePreview();
}

function updateLine2Preview(newValue) {
    currentRomState.line2 = newValue;
    updatePreview();
}

export function updateBorderColor(colorIndex) {
    if (!currentRomId) return;
    
    const previousState = getCurrentRomState();
    currentRomState.borderColor = colorIndex;
    
    addHistoryEntry(currentRomId, 'border-color-change', {
        newValue: colorIndex,
        oldValue: previousState.borderColor
    }, previousState);
    
    updatePreview();
    updateColorPaletteSelections();
    updateHistoryUI();
}

export function updateBackgroundColor(colorIndex) {
    if (!currentRomId) return;
    
    const previousState = getCurrentRomState();
    currentRomState.backgroundColor = colorIndex;
    
    addHistoryEntry(currentRomId, 'background-color-change', {
        newValue: colorIndex,
        oldValue: previousState.backgroundColor
    }, previousState);
    
    updatePreview();
    updateColorPaletteSelections();
    updateHistoryUI();
}

export function updateTextColor(colorIndex) {
    if (!currentRomId) return;
    
    const previousState = getCurrentRomState();
    currentRomState.textColor = colorIndex;
    
    addHistoryEntry(currentRomId, 'text-color-change', {
        newValue: colorIndex,
        oldValue: previousState.textColor
    }, previousState);
    
    updatePreview();
    updateColorPaletteSelections();
    updateHistoryUI();
}

export function applyColors() {
    const textarea = document.getElementById("c64-screen-text");
    if (!textarea) return;
    
    textarea.style.borderColor = "#" + colors[currentRomState.borderColor];
    textarea.style.backgroundColor = "#" + colors[currentRomState.backgroundColor];
    textarea.style.color = "#" + colors[currentRomState.textColor];
}

export function updatePreview() {
    const textarea = document.getElementById("c64-screen-text");
    if (!textarea) return;
    
    textarea.value = "\r" + currentRomState.line1 + currentRomState.line2 + "38911 BASIC BYTES FREE \r\rREADY.\r█";
    applyColors();
}

function updateColorPaletteSelections() {
    const colorGroups = document.querySelectorAll('.color-group');
    
    // Update border color palette (index 0)
    if (colorGroups[0]) {
        updatePaletteSelection(colorGroups[0], currentRomState.borderColor);
    }
    
    // Update background color palette (index 1)
    if (colorGroups[1]) {
        updatePaletteSelection(colorGroups[1], currentRomState.backgroundColor);
    }
    
    // Update text color palette (index 2)
    if (colorGroups[2]) {
        updatePaletteSelection(colorGroups[2], currentRomState.textColor);
    }
}

function updatePaletteSelection(colorGroup, colorIndex) {
    const palette = colorGroup.querySelector('.color-palette');
    if (!palette) return;
    
    const colorName = getColorNameFromIndex(colorIndex);
    
    // Remove selected from all swatches
    palette.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
    
    // Add selected to the correct swatch
    const targetSwatch = palette.querySelector(`[data-color="${colorName}"]`);
    if (targetSwatch) {
        targetSwatch.classList.add('selected');
    }
}

function getColorNameFromIndex(index) {
    const indexToColorMap = {
        0: 'black',
        1: 'white',
        2: 'red',
        3: 'cyan',
        4: 'purple',
        5: 'green',
        6: 'blue',
        7: 'yellow',
        8: 'orange',
        9: 'brown',
        10: 'light-red',
        11: 'gray-1',
        12: 'gray-2',
        13: 'light-green',
        14: 'light-blue',
        15: 'gray-3'
    };
    return indexToColorMap[index] || 'black';
}

export async function saveChangesToRom() {
    if (!currentRomId) {
        console.warn('No ROM loaded');
        return false;
    }
    
    const rom = getRomById(currentRomId);
    if (!rom) {
        console.error('ROM not found');
        return false;
    }
    
    try {
        // Convert the base64 data back to a blob
        const response = await fetch(rom.data);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Update line 1 (bytes 1141-1177, 37 bytes)
        const line1Bytes = new TextEncoder().encode(currentRomState.line1.padEnd(37, ' '));
        for (let i = 0; i < 37 && i < line1Bytes.length; i++) {
            uint8Array[1141 + i] = line1Bytes[i];
        }
        
        // Update line 2 (bytes 1178-1194, 17 bytes)
        const line2Bytes = new TextEncoder().encode(currentRomState.line2.padEnd(17, ' '));
        for (let i = 0; i < 17 && i < line2Bytes.length; i++) {
            uint8Array[1178 + i] = line2Bytes[i];
        }
        
        // Update border color (byte 3289)
        uint8Array[3289] = currentRomState.borderColor;
        
        // Update background color (byte 3290)
        uint8Array[3290] = currentRomState.backgroundColor;
        
        // Update text color (byte 1333)
        uint8Array[1333] = currentRomState.textColor;
        
        // Convert back to base64
        const newBlob = new Blob([uint8Array]);
        const reader = new FileReader();
        
        return new Promise((resolve) => {
            reader.onload = function(e) {
                const success = updateRomData(currentRomId, e.target.result);
                if (success) {
                    console.log('ROM data updated in localStorage');
                    showSaveNotification();
                }
                resolve(success);
            };
            reader.readAsDataURL(newBlob);
        });
    } catch (error) {
        console.error('Error saving ROM:', error);
        return false;
    }
}

function showSaveNotification() {
    const historyInfo = document.getElementById('history-info');
    if (historyInfo) {
        const originalText = historyInfo.textContent;
        historyInfo.textContent = 'Saved ✓';
        historyInfo.style.color = '#00CC55';
        setTimeout(() => {
            historyInfo.textContent = originalText;
            historyInfo.style.color = '';
        }, 2000);
    }
}

export function performUndo() {
    if (!currentRomId || !canUndo(currentRomId)) return;
    
    const change = undo(currentRomId);
    if (change && change.previousState) {
        currentRomState = { ...change.previousState };
        applyStateToUI();
        updateHistoryUI();
    }
}

export function performRedo() {
    if (!currentRomId || !canRedo(currentRomId)) return;
    
    const change = redo(currentRomId);
    if (change) {
        // Apply the change
        switch (change.changeType) {
            case 'line1-change':
                currentRomState.line1 = change.changeData.newValue;
                break;
            case 'line2-change':
                currentRomState.line2 = change.changeData.newValue;
                break;
            case 'border-color-change':
                currentRomState.borderColor = change.changeData.newValue;
                break;
            case 'background-color-change':
                currentRomState.backgroundColor = change.changeData.newValue;
                break;
            case 'text-color-change':
                currentRomState.textColor = change.changeData.newValue;
                break;
        }
        applyStateToUI();
        updateHistoryUI();
    }
}

function applyStateToUI() {
    const line1Input = document.getElementById('rom-line-1');
    const line2Input = document.getElementById('rom-line-2');
    
    if (line1Input) line1Input.value = currentRomState.line1;
    if (line2Input) line2Input.value = currentRomState.line2;
    
    updatePreview();
    updateColorPaletteSelections();
}

function updateHistoryUI() {
    if (!currentRomId) return;
    
    const summary = getHistorySummary(currentRomId);
    if (!summary) return;
    
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const historyInfo = document.getElementById('history-info');
    
    if (undoBtn) {
        undoBtn.disabled = !summary.canUndo;
    }
    
    if (redoBtn) {
        redoBtn.disabled = !summary.canRedo;
    }
    
    if (historyInfo) {
        historyInfo.textContent = `${summary.changeCount} change${summary.changeCount !== 1 ? 's' : ''}`;
    }
}

export function setupEditorListeners() {
    // Line 1 input
    const line1Input = document.getElementById('rom-line-1');
    if (line1Input) {
        // Live preview on input (no history)
        line1Input.addEventListener('input', (e) => {
            updateLine1Preview(e.target.value);
        });
        
        // Create history entry on blur (when field loses focus)
        line1Input.addEventListener('blur', (e) => {
            if (e.target.value !== originalLine1) {
                updateLine1(e.target.value);
            }
        });
        
        // Save on Enter
        line1Input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (e.target.value !== originalLine1) {
                    updateLine1(e.target.value);
                }
                saveChangesToRom();
            }
        });
    }
    
    // Line 2 input
    const line2Input = document.getElementById('rom-line-2');
    if (line2Input) {
        // Live preview on input (no history)
        line2Input.addEventListener('input', (e) => {
            updateLine2Preview(e.target.value);
        });
        
        // Create history entry on blur (when field loses focus)
        line2Input.addEventListener('blur', (e) => {
            if (e.target.value !== originalLine2) {
                updateLine2(e.target.value);
            }
        });
        
        // Save on Enter
        line2Input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (e.target.value !== originalLine2) {
                    updateLine2(e.target.value);
                }
                saveChangesToRom();
            }
        });
    }
    
    // Undo/Redo buttons
    const undoBtn = document.getElementById('undo-btn');
    if (undoBtn) {
        undoBtn.addEventListener('click', performUndo);
    }
    
    const redoBtn = document.getElementById('redo-btn');
    if (redoBtn) {
        redoBtn.addEventListener('click', performRedo);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            performUndo();
        } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
            e.preventDefault();
            performRedo();
        }
    });
}
