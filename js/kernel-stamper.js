// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadRomBrowser();
});

// Local Storage Functions
function saveRomToStorage(fileName, fileData, fileSize) {
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

function getRomsFromStorage() {
    try {
        const roms = localStorage.getItem('c64-roms');
        return roms ? JSON.parse(roms) : {};
    } catch (e) {
        console.error('Error loading ROMs:', e);
        return {};
    }
}

function deleteRomFromStorage(romId) {
    const roms = getRomsFromStorage();
    delete roms[romId];
    localStorage.setItem('c64-roms', JSON.stringify(roms));
    loadRomBrowser();
}

function loadRomBrowser() {
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
    
    item.innerHTML = `
        <div class="rom-item-info" onclick="loadRomFromStorage('${rom.id}')">
            <svg class="rom-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
            <div class="rom-details">
                <div class="rom-name">${rom.name}</div>
                <div class="rom-meta">${sizeKB} KB • ${uploadDate}</div>
            </div>
        </div>
        <div class="rom-actions">
            <button class="rom-btn rom-btn-download" onclick="event.stopPropagation(); downloadRom('${rom.id}')" title="Download">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
            </button>
            <button class="rom-btn rom-btn-delete" onclick="event.stopPropagation(); deleteRomPrompt('${rom.id}')" title="Delete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    `;
    
    return item;
}

function deleteRomPrompt(romId) {
    const roms = getRomsFromStorage();
    const rom = roms[romId];
    
    if (confirm(`Delete "${rom.name}"?`)) {
        deleteRomFromStorage(romId);
    }
}

function downloadRom(romId) {
    const roms = getRomsFromStorage();
    const rom = roms[romId];
    
    const link = document.createElement('a');
    link.href = rom.data;
    link.download = rom.name;
    link.click();
}

function loadRomFromStorage(romId) {
    // Remove active class from all items
    document.querySelectorAll('.rom-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to selected item
    const selectedItem = document.querySelector(`[data-rom-id="${romId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }
    
    const roms = getRomsFromStorage();
    const rom = roms[romId];
    
    // Convert base64 back to blob
    fetch(rom.data)
        .then(res => res.blob())
        .then(blob => {
            processRomFile(blob, rom.name);
        });
}

function readRomFiles(event) {
    var romFiles = event.target.files;
    var romFile = romFiles[0];
    console.log(romFile.name + " is " + romFile.size + " bytes");
    
    // Save to localStorage
    var reader = new FileReader();
    reader.onload = function(e) {
        const romId = saveRomToStorage(romFile.name, e.target.result, romFile.size);
        if (romId) {
            loadRomBrowser();
            // Highlight the newly added ROM
            setTimeout(() => {
                const newItem = document.querySelector(`[data-rom-id="${romId}"]`);
                if (newItem) {
                    newItem.classList.add('active');
                }
            }, 100);
        }
    };
    reader.readAsDataURL(romFile);
    
    // Process the file
    processRomFile(romFile, romFile.name);
}

function processRomFile(romFile, fileName) {
    var blobLine1 = romFile.slice(1141, 1178);
    var blobLine2 = romFile.slice(1178, 1195);
    var blobBorderColor = romFile.slice(3289, 3290);
    var blobBackgroundColor = romFile.slice(3290, 3291);
    var blobTextColor = romFile.slice(1333, 1334);

    var parsedLine1 = "";
    var parsedLine2 = "";
    var parsedBorderColor = "";
    var parsedBackgroundColor = "";
    var parsedTextColor = "";

    var reader = new FileReader();

    reader.onload = function(loadedEvent) {
    	parsedLine1 = loadedEvent.target.result;
        console.log("Line 1: [" + parsedLine1 + "]");

        var reader2 = new FileReader();
        reader2.onload = function(loadedEvent) {
            parsedLine2 = loadedEvent.target.result;
            console.log("Line 2: [" + parsedLine2 + "]");

            var reader3 = new FileReader();
            reader3.onload = function(loadedEvent) {
                parsedBorderColor = loadedEvent.target.result.charCodeAt();
                console.log("Border color from ROM: " + parsedBorderColor);

                var reader4 = new FileReader();
                reader4.onload = function(loadedEvent) {
                    parsedBackgroundColor = loadedEvent.target.result.charCodeAt();
                    console.log("Background color from ROM: " + parsedBackgroundColor);

                    var reader5 = new FileReader();
                    reader5.onload = function(loadedEvent) {
                        parsedTextColor = loadedEvent.target.result.charCodeAt();
                        console.log("Text color from ROM: " + parsedTextColor);
                        drawScreen();
                    }
                    reader5.readAsText(blobTextColor);

                }
                reader4.readAsText(blobBackgroundColor);

            }
            reader3.readAsText(blobBorderColor);

        };
        
        reader2.readAsText(blobLine2);
    };

    var drawScreen = function(line1, line2) {
        var textarea = document.getElementById("c64-screen-text");

        textarea.value = "\r" + parsedLine1 + parsedLine2 + "38911 BASIC BYTES FREE \r\rREADY.\r█";
        textarea.style.borderColor = "#" + colors[parsedBorderColor];
        textarea.style.backgroundColor = "#" + colors[parsedBackgroundColor];
        textarea.style.color = "#" + colors[parsedTextColor];
    }


    reader.readAsText(blobLine1);

    var colors = ["000000", "FFFFFF", "880000", "AAFFEE", "CC44CC", "00CC55", "0000AA", "EEEE77",
                  "DD8855", "664400", "FF7777", "333333", "777777", "AAFF66", "0088FF", "BBBBBB"];
}

// Drag and drop support
const uploadLabel = document.querySelector('.upload-label');
if (uploadLabel) {
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
        fileInput.files = files;
        readRomFiles({target: fileInput});
    });
}
