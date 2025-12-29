// ROM File Processing Module

const colors = [
    "000000", "FFFFFF", "880000", "AAFFEE", "CC44CC", "00CC55", "0000AA", "EEEE77",
    "DD8855", "664400", "FF7777", "333333", "777777", "AAFF66", "0088FF", "BBBBBB"
];

export function processRomFile(romFile, fileName) {
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

    reader.onload = function(loadedEvent) {
        parsedLine1 = loadedEvent.target.result;
        console.log("Line 1: [" + parsedLine1 + "]");

        const reader2 = new FileReader();
        reader2.onload = function(loadedEvent) {
            parsedLine2 = loadedEvent.target.result;
            console.log("Line 2: [" + parsedLine2 + "]");

            const reader3 = new FileReader();
            reader3.onload = function(loadedEvent) {
                parsedBorderColor = loadedEvent.target.result.charCodeAt();
                console.log("Border color from ROM: " + parsedBorderColor);

                const reader4 = new FileReader();
                reader4.onload = function(loadedEvent) {
                    parsedBackgroundColor = loadedEvent.target.result.charCodeAt();
                    console.log("Background color from ROM: " + parsedBackgroundColor);

                    const reader5 = new FileReader();
                    reader5.onload = function(loadedEvent) {
                        parsedTextColor = loadedEvent.target.result.charCodeAt();
                        console.log("Text color from ROM: " + parsedTextColor);
                        drawScreen(parsedLine1, parsedLine2, parsedBorderColor, parsedBackgroundColor, parsedTextColor);
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
