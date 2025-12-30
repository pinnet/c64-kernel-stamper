# C64 Kernel Stamper

A modern, browser-based tool for editing Commodore 64 kernel ROM files. Upload, customize, and download modified C64 boot screens with a beautiful, intuitive interface.

![C64 Kernel Stamper](screenshot.png)

## Features

- **📁 ROM File Management** - Upload and store multiple ROM files in browser localStorage
- **✏️ Live Preview** - Real-time C64 screen preview as you edit
- **🎨 Color Customization** - Change border, background, and text colors from the C64 palette
- **📝 Text Editing** - Modify boot screen text (Line 1: 37 chars, Line 2: 17 chars)
- **↩️ Undo/Redo** - Full history tracking with keyboard shortcuts (Ctrl+Z/Ctrl+Y)
- **💾 Auto-Save** - Changes persist to localStorage automatically
- **🏷️ File Renaming** - Rename your ROM files directly in the browser
- **⬇️ Download** - Export modified ROMs with all changes included
- **🗂️ File Browser** - Visual browser showing all uploaded ROMs with metadata
- **📊 Change Tracking** - See edit counts and last modified dates for each ROM

## Project Structure

```
c64-kernel-stamper/
├── index.html                 # Main HTML structure
├── readme.md                  # This file
├── css/
│   ├── kernel-stamper.css    # All styles and responsive design
│   └── fonts/
│       ├── readme.md
│       └── C64_Pro_Mono-STYLE.woff  # C64-style font
└── js/
    ├── app.js                # Application entry point
    └── modules/
        ├── storage.js        # localStorage management
        ├── rom-processor.js  # ROM file parsing
        ├── rom-editor.js     # State management & editing
        ├── rom-browser.js    # File browser UI
        └── file-upload.js    # Upload & drag-drop handling
```

## Architecture

### ES6 Module System

The application uses modern ES6 modules for clean separation of concerns:

```javascript
// Main entry point
app.js → Initializes all modules

// Core modules
storage.js       → Data persistence layer
rom-processor.js → ROM binary parsing
rom-editor.js    → State management & editing logic
rom-browser.js   → File browser UI & interactions
file-upload.js   → File upload handling
```

### Module Details

#### `app.js` - Application Entry Point
```javascript
// Responsibilities:
- Initialize application on DOM load
- Setup all event listeners
- Coordinate module interactions
```

**Key Functions:**
- `init()` - Main initialization function

---

#### `storage.js` - Local Storage Management
```javascript
// Responsibilities:
- Save/retrieve ROM files from localStorage
- Manage ROM metadata (name, size, dates, change count)
- Handle undo/redo history
- Track all changes for each ROM
```

**Key Functions:**
- `saveRomToStorage(fileName, fileData, fileSize)` - Store new ROM
- `getRomsFromStorage()` - Retrieve all ROMs
- `getRomById(romId)` - Get specific ROM
- `deleteRomFromStorage(romId)` - Remove ROM
- `updateRomData(romId, newData)` - Update ROM binary data
- `renameRom(romId, newName)` - Rename ROM file
- `addHistoryEntry(romId, changeType, changeData, previousState)` - Record change
- `undo(romId)` / `redo(romId)` - Navigate history
- `canUndo(romId)` / `canRedo(romId)` - Check history availability
- `getHistorySummary(romId)` - Get change statistics

**Data Structure:**
```javascript
// ROM Object
{
  id: "timestamp",
  name: "filename.rom",
  data: "base64EncodedData",
  size: 8192,
  uploadDate: "ISO8601",
  lastModified: "ISO8601",
  metadata: {
    version: "1.0",
    originalName: "filename.rom",
    changeCount: 5
  }
}

// History Object (stored separately)
{
  romId: "timestamp",
  changes: [
    {
      timestamp: "ISO8601",
      changeType: "line1-change|line2-change|border-color-change|...",
      changeData: { newValue, oldValue },
      previousState: { line1, line2, borderColor, backgroundColor, textColor }
    }
  ],
  currentIndex: 2,
  maxHistorySize: 50
}
```

---

#### `rom-processor.js` - ROM File Processing
```javascript
// Responsibilities:
- Parse ROM binary data
- Extract boot text and colors from specific byte offsets
- Update preview screen with ROM data
```

**Key Functions:**
- `processRomFile(romFile, fileName, romId)` - Parse ROM and extract data

**ROM Binary Structure:**
- **Byte 1141-1177** (37 bytes): Boot screen line 1
- **Byte 1178-1194** (17 bytes): Boot screen line 2
- **Byte 1333**: Text color (0-15)
- **Byte 3289**: Border color (0-15)
- **Byte 3290**: Background color (0-15)

**C64 Color Palette:**
```javascript
[0] Black      #000000    [8]  Orange      #DD8855
[1] White      #FFFFFF    [9]  Brown       #664400
[2] Red        #880000    [10] Light Red   #FF7777
[3] Cyan       #AAFFEE    [11] Dark Gray   #333333
[4] Purple     #CC44CC    [12] Gray        #777777
[5] Green      #00CC55    [13] Light Green #AAFF66
[6] Blue       #0000AA    [14] Light Blue  #0088FF
[7] Yellow     #EEEE77    [15] Light Gray  #BBBBBB
```

---

#### `rom-editor.js` - State Management & Editing
```javascript
// Responsibilities:
- Manage current ROM editing state
- Track all changes and update history
- Handle undo/redo operations
- Update UI based on state changes
- Save changes back to ROM binary data
```

**Key Functions:**
- `setCurrentRom(romId)` - Set active ROM
- `getCurrentRomId()` - Get active ROM ID
- `resetEditorState()` - Clear editor state
- `updateLine1(newValue)` / `updateLine2(newValue)` - Edit text
- `updateBorderColor(colorIndex)` - Change border color
- `updateBackgroundColor(colorIndex)` - Change background color
- `updateTextColor(colorIndex)` - Change text color
- `updatePreview()` - Refresh C64 screen display
- `saveChangesToRom()` - Write changes to ROM binary
- `performUndo()` / `performRedo()` - Navigate history
- `setupEditorListeners()` - Setup input and keyboard listeners

**State Object:**
```javascript
currentRomState = {
  line1: "       JIFFYDOS V6.01 (C)1989 CMD  \n",
  line2: " C-64 BASIC V2   ",
  borderColor: 14,      // Light blue
  backgroundColor: 6,   // Blue
  textColor: 14         // Light blue
}
```

**Keyboard Shortcuts:**
- `Ctrl+Z` - Undo last change
- `Ctrl+Y` or `Ctrl+Shift+Z` - Redo change
- `Enter` (in text fields) - Save changes to ROM

---

#### `rom-browser.js` - File Browser UI
```javascript
// Responsibilities:
- Render ROM file list
- Handle file selection
- Manage rename/download/delete actions
- Setup color palette interactions
```

**Key Functions:**
- `loadRomBrowser()` - Render file list
- `createRomItem(rom)` - Create file list item HTML
- `loadRomFromStorage(romId)` - Load ROM for editing
- `deleteRomPrompt(romId)` - Confirm and delete ROM
- `renameRomPrompt(romId)` - Rename ROM file
- `downloadRom(romId)` - Download ROM with changes
- `setupRomBrowserEvents()` - Setup click handlers
- `setupColorPaletteEvents()` - Setup color picker handlers

---

#### `file-upload.js` - Upload Handling
```javascript
// Responsibilities:
- Handle file input changes
- Process drag-and-drop uploads
- Save uploaded files to storage
```

**Key Functions:**
- `handleFileUpload(event)` - Process file selection
- `setupDragAndDrop()` - Enable drag-drop on upload area

---

### CSS Architecture

#### Design System
```css
/* CSS Variables */
--primary-color: #0088FF     /* C64 light blue */
--secondary-color: #0000AA   /* C64 blue */
--background: #0f1419        /* Dark background */
--surface: #1a1f2e           /* Card background */
--surface-light: #242b3d     /* Elevated surfaces */
--text-primary: #e4e7eb      /* Main text */
--text-secondary: #8b92a6    /* Secondary text */
--border-color: #2d3548      /* Borders */
--radius: 12px               /* Border radius */
--transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
```

#### Key Components
- **Card Component** - Elevated surfaces with shadows
- **Color Palette** - 8-column grid of C64 colors
- **ROM Browser** - File list with hover effects
- **Upload Area** - Drag-drop zone with button
- **Preview Screen** - C64-styled textarea
- **History Controls** - Undo/redo buttons with tooltips

#### Responsive Breakpoints
```css
@media (max-width: 1024px) { /* Tablet: stack editor grid */ }
@media (max-width: 968px)  { /* Tablet: stack upload grid */ }
@media (max-width: 768px)  { /* Mobile: reduce padding, 4-col palette */ }
@media (max-width: 480px)  { /* Small mobile: smaller text */ }
```

---

## How It Works

### Upload Flow
1. User selects ROM file via button or drag-drop
2. File is read as base64 (for localStorage)
3. ROM is parsed to extract text and colors
4. ROM is saved to localStorage with metadata
5. Browser refreshes to show new file
6. Editor state is reset for new upload

### Edit Flow
1. User clicks ROM in browser
2. ROM binary is loaded from localStorage
3. File is parsed and state is populated
4. Preview updates with current values
5. User makes changes (text, colors)
6. Each change creates history entry
7. Preview updates in real-time
8. Press Enter to save changes to ROM binary

### History System
1. Each change stores previous state
2. Undo retrieves previous state from history
3. Redo applies forward change from history
4. History limited to 50 entries per ROM
5. New changes clear redo history

### Download Flow
1. User clicks download button
2. If ROM is currently edited, save changes first
3. Retrieve ROM data from localStorage
4. Create download link with base64 data
5. Trigger browser download

---

## Technical Details

### Browser Storage
- **localStorage** for ROM files (base64 encoded)
- **Separate keys** for each ROM's history
- **Key format**: `c64-roms` (main), `c64-rom-history-{id}` (history)
- **Storage limits**: Typically 5-10MB per origin

### Performance Considerations
- **Event delegation** for dynamic ROM list
- **Debouncing** not needed (changes tracked on input)
- **Lazy loading** of modules via dynamic imports
- **Minimal reflows** by batching DOM updates

### Compatibility
- **Modern browsers** with ES6 module support
- **Required APIs**: FileReader, localStorage, Blob, Promise
- **Font fallback**: Monaco, Consolas, monospace

---

## Development

### Running Locally
Simply open `index.html` in a modern browser. No build step required.

### File Paths
All paths are relative. Can be served from any directory.

### Debugging
Open browser DevTools console to see:
- ROM parsing logs
- History operations
- Storage operations

---

## Resources

### References
- [C64 Kernel Mods](http://www.breadbox64.com/blog/c64-kernal-mods/) - ROM modification guide
- [C64 Colors](https://www.c64-wiki.com/wiki/Color) - Color palette reference
- [C64 Font](http://style64.org/c64-truetype) - Authentic C64 typography

### Compatible ROMs
- Official Commodore 64 kernel ROMs
- JiffyDOS
- Other third-party C64 kernels

---

## License

Created by John Cook. Made with ❤️ for retro computing enthusiasts.

---

## Future Enhancements

Potential features for future versions:
- Export/import ROM collections
- Preset color schemes
- Custom font support
- Extended character set editing
- ROM comparison tool
- Cloud sync option