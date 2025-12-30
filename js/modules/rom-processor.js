// ROM File Processing Module

import { setCurrentRomState, setCurrentRom, applyColors, resetEditorState } from './rom-editor.js';

const colors = [
    "000000", "FFFFFF", "880000", "AAFFEE", "CC44CC", "00CC55", "0000AA", "EEEE77",
    "DD8855", "664400", "FF7777", "333333", "777777", "AAFF66", "0088FF", "BBBBBB"
];

export function processRomFile(romFile, fileName, romId = null) {
    // If this is a new upload (no romId), reset the editor state
    if (!romId) {
        resetEditorState();
    }
    
    const blobLine1 = romFile.slice(1141, 1178);
    const blobLine2 = romFile.slice(1178, 1195);
    const blobBorderColor = romFile.slice(3289, 3290);
    const blobBackgroundColor = romFile.slice(3290, 3291);
    const blobTextColor = romFile.slice(1333, 1334);

    let parsedLine1 = "";
    let parsedLine2 = "";
    let parsedBorderColor = "";
    let parsedBackgroundColor = "";
    let parsedTextColor = "";

    const reader = new FileReader();

    reader.onerror = function() {
        console.error("Failed to read Line 1 from ROM file");
        alert("Error reading ROM file: Failed to parse Line 1. The file may be corrupted.");
    };

    reader.onload = function(loadedEvent) {
        parsedLine1 = loadedEvent.target.result;
        console.log("Line 1: [" + parsedLine1 + "]");

        const reader2 = new FileReader();
        
        reader2.onerror = function() {
            console.error("Failed to read Line 2 from ROM file");
            alert("Error reading ROM file: Failed to parse Line 2. The file may be corrupted.");
        };
        
        reader2.onload = function(loadedEvent) {
            parsedLine2 = loadedEvent.target.result;
            console.log("Line 2: [" + parsedLine2 + "]");

            const reader3 = new FileReader();
            
            reader3.onerror = function() {
                console.error("Failed to read Border Color from ROM file");
                alert("Error reading ROM file: Failed to parse Border Color. The file may be corrupted.");
            };
            
            reader3.onload = function(loadedEvent) {
                parsedBorderColor = loadedEvent.target.result.charCodeAt();
                console.log("Border color from ROM: " + parsedBorderColor);

                const reader4 = new FileReader();
                
                reader4.onerror = function() {
                    console.error("Failed to read Background Color from ROM file");
                    alert("Error reading ROM file: Failed to parse Background Color. The file may be corrupted.");
                };
                
                reader4.onload = function(loadedEvent) {
                    parsedBackgroundColor = loadedEvent.target.result.charCodeAt();
                    console.log("Background color from ROM: " + parsedBackgroundColor);

                    const reader5 = new FileReader();
                    
                    reader5.onerror = function() {
                        console.error("Failed to read Text Color from ROM file");
                        alert("Error reading ROM file: Failed to parse Text Color. The file may be corrupted.");
                    };
                    
                    reader5.onload = function(loadedEvent) {
                        parsedTextColor = loadedEvent.target.result.charCodeAt();
                        console.log("Text color from ROM: " + parsedTextColor);
                        
                        const state = {
                            line1: parsedLine1,
                            line2: parsedLine2,
                            borderColor: parsedBorderColor,
                            backgroundColor: parsedBackgroundColor,
                            textColor: parsedTextColor
                        };
                        
                        // Set current ROM for editor
                        if (romId) {
                            setCurrentRom(romId);
                        }
                        
                        // Update state
                        setCurrentRomState(state);
                        
                        // Draw screen
                        drawScreen(parsedLine1, parsedLine2, parsedBorderColor, parsedBackgroundColor, parsedTextColor);
                        
                        // Update form inputs
                        updateFormInputs(parsedLine1, parsedLine2);
                    }
                    reader5.readAsText(blobTextColor);
                }
                reader4.readAsText(blobBackgroundColor);
            }
            reader3.readAsText(blobBorderColor);
        };
        
        reader2.readAsText(blobLine2);
    };

    reader.readAsText(blobLine1);
}

function drawScreen(line1, line2, borderColor, backgroundColor, textColor) {
    const textarea = document.getElementById("c64-screen-text");

    textarea.value = "\r" + line1 + line2 + "38911 BASIC BYTES FREE \r\rREADY.\r█";
    textarea.style.borderColor = "#" + colors[borderColor];
    textarea.style.backgroundColor = "#" + colors[backgroundColor];
    textarea.style.color = "#" + colors[textColor];
}

function updateFormInputs(line1, line2) {
    const line1Input = document.getElementById('rom-line-1');
    const line2Input = document.getElementById('rom-line-2');
    
    if (line1Input) line1Input.value = line1;
    if (line2Input) line2Input.value = line2;
}
