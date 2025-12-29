// File Upload Module

import { saveRomToStorage } from './storage.js';
import { processRomFile } from './rom-processor.js';
import { loadRomBrowser } from './rom-browser.js';

export function handleFileUpload(event) {
    const romFiles = event.target.files;
    const romFile = romFiles[0];
    
    if (!romFile) return;
    
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
            fileInput.files = files;
            handleFileUpload({ target: fileInput });
        }
    });
}
