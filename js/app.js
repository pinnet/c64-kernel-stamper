// Main Application Module

import { loadRomBrowser, setupRomBrowserEvents } from './modules/rom-browser.js';
import { handleFileUpload, setupDragAndDrop } from './modules/file-upload.js';
import { setupEditorListeners, saveChangesToRom } from './modules/rom-editor.js';

// Initialize application
function init() {
    console.log('C64 Kernel Stamper initialized');
    
    // Load existing ROMs from storage
    loadRomBrowser();
    
    // Setup event listeners
    setupRomBrowserEvents();
    setupDragAndDrop();
    setupEditorListeners();
    
    // Setup file input handler
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
    
    // Setup upload button to trigger file input
    const uploadButton = document.getElementById('upload-button');
    if (uploadButton && fileInput) {
        uploadButton.addEventListener('click', () => {
            fileInput.click();
        });
    }
    
    // Setup save changes button
    const saveChangesBtn = document.getElementById('save-changes-btn');
    if (saveChangesBtn) {
        saveChangesBtn.addEventListener('click', () => {
            saveChangesToRom();
        });
    }
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
