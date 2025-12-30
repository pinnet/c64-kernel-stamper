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
    const screen = document.getElementById("c64-screen-text");

    // Generate exactly 22 lines, each 40 characters wide
    const emptyLine = ''.padEnd(40, ' ');
    const displayLine1 = line1.substring(0, 40).padEnd(40, ' ');
    const line2Part = line2.substring(0, 17).padEnd(17, ' ');
    const displayLine2 = (line2Part + '38911 BASIC BYTES FREE').padEnd(40, ' ');
    const readyLine = 'READY.'.padEnd(40, ' ');
    const cursorLine = '█'.padEnd(40, ' ');
    
    const lines = [
        emptyLine,        // Line 1
        displayLine1,     // Line 2
        emptyLine,        // Line 3 (blank line)
        displayLine2,     // Line 4
        emptyLine,        // Line 5
        readyLine,        // Line 6
        cursorLine,       // Line 7
        emptyLine,        // Line 8
        emptyLine,        // Line 9
        emptyLine,        // Line 10
        emptyLine,        // Line 11
        emptyLine,        // Line 12
        emptyLine,        // Line 13
        emptyLine,        // Line 14
        emptyLine,        // Line 15
        emptyLine,        // Line 16
        emptyLine,        // Line 17
        emptyLine,        // Line 18
        emptyLine,        // Line 19
        emptyLine,        // Line 20
        emptyLine,        // Line 21
        emptyLine         // Line 22
    ];
    
    screen.textContent = lines.join('\n');
    screen.style.borderColor = "#" + colors[borderColor];
    screen.style.backgroundColor = "#" + colors[backgroundColor];
    screen.style.color = "#" + colors[textColor];
}

function updateFormInputs(line1, line2) {
    const line1Input = document.getElementById('rom-line-1');
    const line2Input = document.getElementById('rom-line-2');
    
    if (line1Input) line1Input.value = line1;
    if (line2Input) line2Input.value = line2;
}
