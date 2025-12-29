// Main Application Module

import { loadRomBrowser, setupRomBrowserEvents } from './modules/rom-browser.js';
import { handleFileUpload, setupDragAndDrop } from './modules/file-upload.js';

// Initialize application
function init() {
    console.log('C64 Kernel Stamper initialized');
    
    // Load existing ROMs from storage
    loadRomBrowser();
    
    // Setup event listeners
    setupRomBrowserEvents();
    setupDragAndDrop();
    
    // Setup file input handler
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
