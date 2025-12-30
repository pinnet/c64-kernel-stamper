// File Upload Module

import { saveRomToStorage } from './storage.js';
import { processRomFile } from './rom-processor.js';
import { loadRomBrowser } from './rom-browser.js';

// ROM file validation constants
const VALID_EXTENSIONS = ['.bin', '.rom'];
const MIN_ROM_SIZE = 4096;  // 4KB minimum
const MAX_ROM_SIZE = 65536; // 64KB maximum (allow for larger ROMs)
const TYPICAL_C64_ROM_SIZE = 8192; // 8KB for reference

function validateRomFile(file) {
    const errors = [];
    
    // Check file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = VALID_EXTENSIONS.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
        errors.push(`Invalid file type. Please upload a ROM file with extension: ${VALID_EXTENSIONS.join(', ')}`);
    }
    
    // Check file size
    if (file.size < MIN_ROM_SIZE) {
        errors.push(`File is too small (${file.size} bytes). ROM files should be at least ${MIN_ROM_SIZE} bytes.`);
    } else if (file.size > MAX_ROM_SIZE) {
        errors.push(`File is too large (${file.size} bytes). ROM files should not exceed ${MAX_ROM_SIZE} bytes.`);
    }
    
    // Warn if size is unusual (not exactly 8KB)
    if (file.size !== TYPICAL_C64_ROM_SIZE && file.size >= MIN_ROM_SIZE && file.size <= MAX_ROM_SIZE) {
        console.warn(`Note: File size is ${file.size} bytes. Typical C64 ROM size is ${TYPICAL_C64_ROM_SIZE} bytes (8KB).`);
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

export function handleFileUpload(event) {
    const romFiles = event.target.files;
    const romFile = romFiles[0];
    
    if (!romFile) return;
    
    // Validate file before processing
    const validation = validateRomFile(romFile);
    if (!validation.valid) {
        alert('Upload Error:\n\n' + validation.errors.join('\n\n'));
        // Clear the file input
        event.target.value = '';
        return;
    }
    
    console.log(romFile.name + " is " + romFile.size + " bytes");
    
    // Save to localStorage
    const reader = new FileReader();
    reader.onload = function(e) {
        const romId = saveRomToStorage(romFile.name, e.target.result, romFile.size);
        if (romId) {
            loadRomBrowser();
            // Highlight the newly added ROM
            setTimeout(() => {
                const newItem = document.querySelector(`[data-rom-id="${romId}"]`);
                if (newItem) {
                    newItem.closest('.rom-item').classList.add('active');
                }
            }, 100);
        }
    };
    reader.readAsDataURL(romFile);
    
    // Process the file
    processRomFile(romFile, romFile.name, null);
}

export function setupDragAndDrop() {
    const uploadLabel = document.querySelector('.upload-label');
    
    if (!uploadLabel) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadLabel.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadLabel.addEventListener(eventName, () => {
            uploadLabel.style.borderColor = 'var(--primary-color)';
            uploadLabel.style.background = 'rgba(0, 136, 255, 0.1)';
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadLabel.addEventListener(eventName, () => {
            uploadLabel.style.borderColor = '';
            uploadLabel.style.background = '';
        });
    });
    
    uploadLabel.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        const fileInput = document.getElementById('file-input');
        
        if (files.length > 0) {
            const file = files[0];
            
            // Validate dropped file
            const validation = validateRomFile(file);
            if (!validation.valid) {
                alert('Upload Error:\n\n' + validation.errors.join('\n\n'));
                return;
            }
            
            fileInput.files = files;
            handleFileUpload({ target: fileInput });
        }
    });
}
