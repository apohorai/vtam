const grid = document.getElementById('grid');

// Create an 80x24 grid
for (let row = 0; row < 24; row++) {
  for (let col = 0; col < 80; col++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.contentEditable = true; // Make cells editable
    grid.appendChild(cell);
  }
}

// Save data as a matrix
function saveMatrix() {
  const cells = document.querySelectorAll('.cell');
  const matrix = [];
  for (let i = 0; i < 24; i++) {
    const row = [];
    for (let j = 0; j < 80; j++) {
      row.push(cells[i * 80 + j].innerText || ' ');
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
