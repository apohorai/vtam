const grid = document.getElementById('grid');
const bgColorPicker = document.getElementById('bg-color');
const charColorPicker = document.getElementById('char-color');

// Create an 80x24 grid
for (let row = 0; row < 24; row++) {
  for (let col = 0; col < 80; col++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.contentEditable = true; // Make cells editable
    grid.appendChild(cell);

    // Apply selected colors to the clicked cell
    cell.addEventListener('click', () => {
      const bgColor = bgColorPicker.value;
      const charColor = charColorPicker.value;

      // Map attribute values to actual colors
      const colorMap = {
        "F1": "blue",
        "F2": "red",
        "F3": "pink",
        "F4": "green",
        "F5": "turquoise",
        "F6": "yellow",
        "F7": "white",
        "00": "transparent" // Default
      };

      // Apply background and text color
      cell.style.backgroundColor = colorMap[bgColor];
      cell.style.color = colorMap[charColor];
    });
  }
}

// Save data as a matrix
function saveMatrix() {
  const cells = document.querySelectorAll('.cell');
  const matrix = [];
  for (let i = 0; i < 24; i++) {
    const row = [];
    for (let j = 0; j < 80; j++) {
      const cell = cells[i * 80 + j];
      row.push({
        char: cell.innerText || ' ',
        bgColor: cell.style.backgroundColor || 'transparent',
        charColor: cell.style.color || 'black'
      });
    }
    matrix.push(row);
  }
  return matrix;
}

// Log the matrix to the console (for testing)
grid.addEventListener('input', () => {
  console.clear();
  console.log(saveMatrix());
});
