document.addEventListener('DOMContentLoaded', () => {
    const columns = 80;
    const rows = 24;
    const grid = document.getElementById("grid");
    const smallTable = document.getElementById("small-matrix");
    const ebcdicOutput = document.getElementById("ebcdic-output");
    const debugToggle = document.getElementById("debug-toggle");
    const modeButtons = {
      normal: document.getElementById('mode-normal'),
      debug: document.getElementById('mode-debug'),
      asm: document.getElementById('mode-asm'),
      asmCode: document.getElementById('mode-asm-code')
    };
  // Export Grid as JSON
document.getElementById('export-grid').addEventListener('click', () => {
  const gridData = [];
  for (let r = 0; r < rows; r++) {
    const rowCells = grid.rows[r].cells;
    const row = [];
    for (let c = 0; c < columns; c++) {
      const cell = rowCells[c];
      row.push({
        char: cell.dataset.char || '',
        fg: cell.dataset.fg || 'default',
        bg: cell.dataset.bg || 'default'
      });
    }
    gridData.push(row);
  }

  const blob = new Blob([JSON.stringify(gridData)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'grid.json';
  a.click();
  URL.revokeObjectURL(url);
});

// Import Grid from JSON
document.getElementById('import-trigger').addEventListener('click', () => {
  document.getElementById('import-grid').click();
});

document.getElementById('import-grid').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const text = await file.text();
  try {
    const gridData = JSON.parse(text);
    if (!Array.isArray(gridData) || gridData.length !== rows) throw new Error('Invalid format');

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const cellData = gridData[r][c];
        const cell = grid.rows[r].cells[c];
        cell.dataset.char = cellData.char || '';
        cell.dataset.fg = cellData.fg || 'default';
        cell.dataset.bg = cellData.bg || 'default';
        updateCellStyle(cell);
      }
    }
    updateEbcdicOutput();
    document.getElementById('status-message').textContent = "Grid imported successfully";
  } catch (err) {
    alert("Failed to import grid: " + err.message);
  }
});

    let debug = false;
    let selectedCell = null;
    let selectedSmallCell = null;
  
    let fgColor = "default";
    let fgColorValue = "#ddd";
    let bgColor = "default";
    let bgColorValue = "";
  
    const fgPalette = document.getElementById("fg-palette");
    const bgPalette = document.getElementById("bg-palette");
  
    let currentMode = 'normal';
  
    function asciiCharToEBCDICHex(char) {
      let code = asciiToEBCDIC[char];
      if (typeof code === 'undefined') code = 0x40;
      return code.toString(16).toUpperCase().padStart(2, '0');
    }
  
    function calculateBufferAddress(row, col) {
      return (row - 1) * 80 + (col - 1);
    }
  
    function calculateBinaryRepresentation(bufferAddress) {
      return bufferAddress.toString(2).padStart(12, '0');
    }
  
    function splitBinaryIntoGroups(binary) {
      return [binary.slice(0, 6), binary.slice(6)];
    }
  
    function addClearScreenButton() {
      const buttonContainer = document.getElementById('button-container');
      if (document.getElementById('clear-screen')) return;
      const clearButton = document.createElement('button');
      clearButton.id = 'clear-screen';
      clearButton.textContent = 'Clear Screen';
      clearButton.title = 'Clear all characters from the grid';
      clearButton.style.marginTop = '10px';
      buttonContainer.appendChild(clearButton);
  
      clearButton.addEventListener('click', (e) => {
        e.preventDefault();
        clearScreen();
        if (selectedCell) selectedCell.focus();
        else if (selectedSmallCell) selectedSmallCell.focus();
      });
    }
  
    function clearScreen() {
      for (let r = 0; r < rows; r++) {
        const rowCells = grid.rows[r].cells;
        for (let c = 0; c < columns; c++) {
          const cell = rowCells[c];
          delete cell.dataset.char;
          delete cell.dataset.fg;
          delete cell.dataset.bg;
          updateCellStyle(cell);
        }
      }
      updateEbcdicOutput();
      document.getElementById('status-message').textContent = "Screen cleared";
    }
  
    function createGrid() {
      for (let r = 0; r < rows; r++) {
        const tr = document.createElement('tr');
        tr.setAttribute('role', 'row');
        for (let c = 0; c < columns; c++) {
          const td = document.createElement('td');
          td.setAttribute('role', 'gridcell');
          td.textContent = '';
          td.dataset.fg = 'default';
          td.dataset.bg = 'default';
          td.tabIndex = 0;
          td.addEventListener('click', () => selectCell(td));
          td.addEventListener('focus', () => selectCell(td));
          tr.appendChild(td);
        }
        grid.appendChild(tr);
      }
    }
  
    function createSmallGrid() {
      while (smallTable.firstChild) smallTable.removeChild(smallTable.firstChild);
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.setAttribute('role', 'gridcell');
      td.tabIndex = 0;
      td.textContent = '';
      td.dataset.fg = 'default';
      td.dataset.bg = 'default';
      td.addEventListener('click', () => selectSmallCell(td));
      td.addEventListener('focus', () => selectSmallCell(td));
      tr.appendChild(td);
      smallTable.appendChild(tr);
    }
  
    function updateCellStyle(cell) {
      if (!cell) return;
      const fgColorMap = {
        default: '#ddd', blue: '#4A90E2', red: '#E94B4B', pink: '#E58BBF',
        green: '#4DBA65', turquoise: '#30C9C9', yellow: '#F5E050', white: '#FFFFFF'
      };
      const bgColorMap = {
        default: '', blue: '#4A90E2', red: '#E94B4B', pink: '#E58BBF',
        green: '#4DBA65', turquoise: '#30C9C9', yellow: '#F5E050', white: '#FFFFFF'
      };
      const fg = cell.dataset.fg || 'default';
      const bg = cell.dataset.bg || 'default';
      cell.style.color = fgColorMap[fg] || fgColorMap.default;
      cell.style.backgroundColor = bgColorMap[bg] || '';
      cell.textContent = cell.dataset.char || '';
    }
  
    function applyColorsToCell(cell) {
      if (!cell) return;
      cell.dataset.fg = fgColor;
      cell.dataset.bg = bgColor;
      updateCellStyle(cell);
      updateEbcdicOutput();
    }
  
    function applyCharToCell(cell, char) {
      if (!cell) return;
      cell.dataset.char = char;
      cell.dataset.fg = fgColor;
      cell.dataset.bg = bgColor;
      updateCellStyle(cell);
      updateEbcdicOutput();
    }
  
    function drawLine(x0, y0, x1, y1) {
      const points = [];
      const dx = Math.abs(x1 - x0);
      const dy = Math.abs(y1 - y0);
      const sx = (x0 < x1) ? 1 : -1;
      const sy = (y0 < y1) ? 1 : -1;
      let err = dx - dy;
  
      const smallCell = smallTable.rows[0].cells[0];
      const drawChar = smallCell.dataset.char || '*';
      const drawFg = smallCell.dataset.fg || fgColor;
      const drawBg = smallCell.dataset.bg || bgColor;
  
      while (true) {
        points.push({ x: x0, y: y0 });
        if (x0 === x1 && y0 === y1) break;
        const err2 = err << 1;
        if (err2 > -dy) {
          err -= dy;
          x0 += sx;
        }
        if (err2 < dx) {
          err += dx;
          y0 += sy;
        }
      }
  
      points.forEach(point => {
        const cell = grid.rows[point.y]?.cells[point.x];
        if (!cell) return;
        cell.dataset.char = drawChar;
        cell.dataset.fg = drawFg;
        cell.dataset.bg = drawBg;
        updateCellStyle(cell);
      });
      updateEbcdicOutput();
    }
  
    let isDrawingMode = false;
    let startPositionSet = false;
    let startCoords = null;
  
    document.getElementById('draw-line').addEventListener('click', (e) => {
      e.preventDefault();
      isDrawingMode = true;
      startPositionSet = false;
      startCoords = null;
      document.getElementById('status-message').textContent = "Select Start Position";
      if (selectedCell) selectedCell.focus();
      else if (selectedSmallCell) selectedSmallCell.focus();
    });
  
    function selectCell(cell) {
      const rowIndex = cell.parentElement.rowIndex;
      const cellIndex = cell.cellIndex;
  
      if (isDrawingMode) {
        if (!startPositionSet) {
          startCoords = { row: rowIndex, col: cellIndex };
          startPositionSet = true;
          document.getElementById('start-position').textContent = `Start Position: (${rowIndex + 1}, ${cellIndex + 1})`;
          document.getElementById('status-message').textContent = "Select End Position";
        } else {
          if (startCoords.row === rowIndex && startCoords.col === cellIndex) {
            document.getElementById('status-message').textContent = "End Position cannot be same as Start Position.";
            return;
          }
          document.getElementById('end-position').textContent = `End Position: (${rowIndex + 1}, ${cellIndex + 1})`;
          isDrawingMode = false;
          document.getElementById('status-message').textContent = "Drawing complete";
  
          drawLine(startCoords.col, startCoords.row, cellIndex, rowIndex);
          startCoords = null;
          startPositionSet = false;
        }
      } else {
        if (selectedCell && selectedCell !== cell) selectedCell.classList.remove('selected');
        if (selectedSmallCell) {
          selectedSmallCell.classList.remove('selected');
          selectedSmallCell = null;
        }
        selectedCell = cell;
        selectedCell.classList.add('selected');
        selectedCell.focus();
        document.getElementById('status-message').textContent = `Position: (${rowIndex + 1}, ${cellIndex + 1})`;
      }
    }
  
    function selectSmallCell(cell) {
      if (selectedSmallCell && selectedSmallCell !== cell) selectedSmallCell.classList.remove('selected');
      if (selectedCell) {
        selectedCell.classList.remove('selected');
        selectedCell = null;
      }
      selectedSmallCell = cell;
      selectedSmallCell.classList.add('selected');
      selectedSmallCell.focus();
      document.getElementById('status-message').textContent = `Position: (1, ${cell.cellIndex + 1})`;
    }
  
    document.getElementById('grid-container').addEventListener('keydown', e => {
      if (!selectedCell) return;
      const tr = selectedCell.parentElement;
      const rowIndex = tr.rowIndex;
      const cellIndex = selectedCell.cellIndex;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Backspace', 'Delete', ' '].includes(e.key) || e.key.length === 1) {
        e.preventDefault();
      }
      if (e.key.length === 1 && e.key >= ' ') {
        applyCharToCell(selectedCell, e.key);
        let nextCell = null;
        if (cellIndex < columns - 1) nextCell = tr.cells[cellIndex + 1];
        else if (rowIndex < rows - 1) nextCell = grid.rows[rowIndex + 1].cells[0];
        if (nextCell) selectCell(nextCell);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedCell.dataset.char) {
          delete selectedCell.dataset.char;
          updateCellStyle(selectedCell);
          updateEbcdicOutput();
        }
      } else if (e.key === 'ArrowLeft') {
        if (cellIndex > 0) selectCell(tr.cells[cellIndex - 1]);
        else if (rowIndex > 0) selectCell(grid.rows[rowIndex - 1].cells[columns - 1]);
      } else if (e.key === 'ArrowRight') {
        if (cellIndex < columns - 1) selectCell(tr.cells[cellIndex + 1]);
        else if (rowIndex < rows - 1) selectCell(grid.rows[rowIndex + 1].cells[0]);
      } else if (e.key === 'ArrowUp') {
        if (rowIndex > 0) selectCell(grid.rows[rowIndex - 1].cells[cellIndex]);
      } else if (e.key === 'ArrowDown') {
        if (rowIndex < rows - 1) selectCell(grid.rows[rowIndex + 1].cells[cellIndex]);
      }
    });
  
    smallTable.addEventListener('keydown', e => {
      if (!selectedSmallCell) return;
      if (['Backspace', 'Delete', ' '].includes(e.key) || e.key.length === 1) {
        e.preventDefault();
      }
      if (e.key.length === 1 && e.key >= ' ') {
        applyCharToCell(selectedSmallCell, e.key);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedSmallCell.dataset.char) {
          delete selectedSmallCell.dataset.char;
          updateCellStyle(selectedSmallCell);
          updateEbcdicOutput();
        }
      }
    });
  
    fgPalette.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        fgColor = btn.dataset.color;
        fgColorValue = btn.dataset.fg || fgColorValue;
        updatePaletteSelection(fgColor, bgColor);
        if (selectedCell) selectedCell.focus();
        else if (selectedSmallCell) selectedSmallCell.focus();
      });
    });
  
    bgPalette.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        bgColor = btn.dataset.color;
        bgColorValue = btn.dataset.bg || bgColorValue;
        updatePaletteSelection(fgColor, bgColor);
        if (selectedCell) selectedCell.focus();
        else if (selectedSmallCell) selectedSmallCell.focus();
      });
    });
  
    function updatePaletteSelection(fg, bg) {
      for (const btn of fgPalette.querySelectorAll('.color-btn')) {
        btn.classList.toggle('selected', btn.dataset.color === fg);
      }
      for (const btn of bgPalette.querySelectorAll('.color-btn')) {
        btn.classList.toggle('selected', btn.dataset.color === bg);
      }
    }
  
    function updateModeButtons() {
      ['normal', 'debug', 'asm', 'asmCode'].forEach(mode => {
        const btn = document.getElementById(`mode-${mode}`);
        if (btn) btn.classList.toggle('selected', mode === currentMode);
      });
    }
  
    Object.entries(modeButtons).forEach(([mode, button]) => {
      if (button) {
        button.addEventListener('click', () => {
          currentMode = mode;
          updateModeButtons();
          updateEbcdicOutput();
        });
      }
    });
  
  function updateEbcdicOutput() {
  const lines = [];

  function appendAsmRunLines(run) {
    const hexPart = `${run.hexes[0]}${run.hexes[1]}`;
    if (currentMode === 'asmCode') {
      lines.push(`         DC    X'11${hexPart}'`);
      lines.push(`         DC    X'2903'`);
      lines.push(`         DC    X'C0F0'`);
      if (run.bg !== 'default') {
        lines.push(`         DC    X'41F2'`);
        switch (run.bg) {
          case 'default': lines.push(`         DC    X'42F0'`); break;
          case 'blue': lines.push(`         DC    X'42F1'`); break;
          case 'red': lines.push(`         DC    X'42F2'`); break;
          case 'pink': lines.push(`         DC    X'42F3'`); break;
          case 'green': lines.push(`         DC    X'42F4'`); break;
          case 'turquoise': lines.push(`         DC    X'42F5'`); break;
          case 'yellow': lines.push(`         DC    X'42F6'`); break;
          case 'white': lines.push(`         DC    X'42F7'`); break;
        }
      } else {
        lines.push(`         DC    X'4100'`);
        switch (run.fg) {
          case 'default': lines.push(`         DC    X'42F0'`); break;
          case 'blue': lines.push(`         DC    X'42F1'`); break;
          case 'red': lines.push(`         DC    X'42F2'`); break;
          case 'pink': lines.push(`         DC    X'42F3'`); break;
          case 'green': lines.push(`         DC    X'42F4'`); break;
          case 'turquoise': lines.push(`         DC    X'42F5'`); break;
          case 'yellow': lines.push(`         DC    X'42F6'`); break;
          case 'white': lines.push(`         DC    X'42F7'`); break;
        }
      }
    } else {
      lines.push(`SBA: ${run.coords} ${run.colors} ${hexPart}`);
      lines.push(`SFA:`);
    }

    if (run.ebcids.length > 20) {
      for (let i = 0; i < run.ebcids.length; i += 20) {
        const chunk = run.ebcids.slice(i, i + 20);
        lines.push(`         DC    X'${chunk.join('')}'`);
      }
    } else {
      lines.push(`         DC    X'${run.ebcids.join('')}'`);
    }

    lines.push(`         DC    X'1DF0'`);
  }

  for (let r = 0; r < rows; r++) {
    const rowCells = grid.rows[r].cells;
    let currentRun = null;
    let lastCharWasNonSpace = false;
    let currentFg = null;
    let currentBg = null;

    for (let c = 0; c < columns; c++) {
      const cell = rowCells[c];
      const char = cell.dataset.char;
      const fg = cell.dataset.fg || 'default';
      const bg = cell.dataset.bg || 'default';

      if (!char) {
        if (currentRun) {
          if (currentMode === 'asm' || currentMode === 'asmCode') {
            appendAsmRunLines(currentRun);
          } else {
            const hexPart = currentMode === 'debug'
              ? `${currentRun.hexes[0]},${currentRun.hexes[1]}`
              : `${currentRun.hexes[0]}${currentRun.hexes[1]}`;
            lines.push(`${currentRun.coords} ${currentRun.colors} ${hexPart} ${currentRun.ebcids.join(',')}`);
          }
          currentRun = null;
          currentFg = null;
          currentBg = null;
        }
        lastCharWasNonSpace = false;
        continue;
      }

      const hexCode = asciiCharToEBCDICHex(char);
      const bufferAddress = calculateBufferAddress(r + 1, c + 1);
      const binary = calculateBinaryRepresentation(bufferAddress);
      const [group1, group2] = splitBinaryIntoGroups(binary);
      const hexValue1 = hexMapping[group1] || '??';
      const hexValue2 = hexMapping[group2] || '??';

      if (!lastCharWasNonSpace || fg !== currentFg || bg !== currentBg) {
        if (currentRun) {
          if (currentMode === 'asm' || currentMode === 'asmCode') {
            appendAsmRunLines(currentRun);
          } else {
            const hexPart = currentMode === 'debug'
              ? `${currentRun.hexes[0]},${currentRun.hexes[1]}`
              : `${currentRun.hexes[0]}${currentRun.hexes[1]}`;
            lines.push(`${currentRun.coords} ${currentRun.colors} ${hexPart} ${currentRun.ebcids.join(',')}`);
          }
        }
        currentRun = {
          coords: `(${r},${c})`,
          colors: `(${fg},${bg})`,
          fg,
          bg,
          hexes: [hexValue1, hexValue2],
          ebcids: [hexCode]
        };
        lastCharWasNonSpace = true;
        currentFg = fg;
        currentBg = bg;
      } else {
        currentRun.ebcids.push(hexCode);
      }

      if (c === columns - 1 && currentRun) {
        if (currentMode === 'asm' || currentMode === 'asmCode') {
          appendAsmRunLines(currentRun);
        } else {
          const hexPart = currentMode === 'debug'
            ? `${currentRun.hexes[0]},${currentRun.hexes[1]}`
            : `${currentRun.hexes[0]}${currentRun.hexes[1]}`;
          lines.push(`${currentRun.coords} ${currentRun.colors} ${hexPart} ${currentRun.ebcids.join(',')}`);
        }
        currentRun = null;
      }
    }
  }

  ebcdicOutput.value = lines.join('\n');
}

  
    // Initialization
    createGrid();
    createSmallGrid();
    addClearScreenButton();
    updateModeButtons();
  
    if (grid.rows.length && grid.rows[0].cells.length) selectCell(grid.rows[0].cells[0]);
    if (smallTable.rows.length && smallTable.rows[0].cells.length) selectSmallCell(smallTable.rows[0].cells[0]);
  
    updateEbcdicOutput();
  
    debugToggle.addEventListener('click', (e) => {
      e.preventDefault();
      debug = !debug;
      debugToggle.classList.toggle('active', debug);
      debugToggle.textContent = debug ? 'Debug: ON' : 'Debug: OFF';
      debugToggle.setAttribute('aria-pressed', debug.toString());
      updateEbcdicOutput();
      if (selectedCell) selectedCell.focus();
      else if (selectedSmallCell) selectedSmallCell.focus();
    });
  });
  
