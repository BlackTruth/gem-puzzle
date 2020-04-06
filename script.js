const _DEFAULT_VALUES = { puzzleDimension: 4 };

let body = document.querySelector("body");

let gameArea = document.createElement("div");
gameArea.className = "game-area";
body.appendChild(gameArea);

let buttons = document.createElement("div");
buttons.className = "game-area__buttons";
buttons.innerText = "buttons";
gameArea.appendChild(buttons);

let timer = document.createElement("div");
timer.className = "game-area__timer";
timer.innerText = "timer";
gameArea.appendChild(timer);

let puzzle = document.createElement("div");
puzzle.className = `game-area__puzzle_${_DEFAULT_VALUES.puzzleDimension}`;
gameArea.appendChild(puzzle);

function drawGrid(dimension) {
  let cellValue = dimension * dimension;
  for (let i = 0; i < cellValue; i++) {
    let puzzleCell = document.createElement("div");
    puzzleCell.setAttribute("key", i + 1);
    puzzleCell.innerText = i + 1;
    puzzleCell.className = "game-area__puzzle__puzzle-cell";
    if (i == cellValue - 1) {
      puzzleCell.classList.add("game-area__puzzle__puzzle-cell_empty");
      puzzleCell.innerText = "";
    }
    puzzle.appendChild(puzzleCell);
  }
  dimensionText.innerText = `Размерность пазла ${dimension} на ${dimension} `;
  puzzle.className = `game-area__puzzle_${dimension}`;
}

function shuffle(dimension) {
  let puzzle = document.querySelector(
    `body > div > div.game-area__puzzle_${dimension}`
  );
  let cellsArr = puzzle.querySelectorAll(".game-area__puzzle__puzzle-cell");
  cellsArr = [...cellsArr];
  cellsArr.sort(() => Math.random() - 0.5);
  cellsArr.forEach((cell) => {
    cell.remove();
    puzzle.appendChild(cell);
  });
}

let options = document.createElement("div");
options.className = "game-area__options";
gameArea.appendChild(options);

let dimensionText = document.createElement("div");
dimensionText.innerText = `Размерность пазла ${_DEFAULT_VALUES.puzzleDimension} на ${_DEFAULT_VALUES.puzzleDimension} `;
options.appendChild(dimensionText);

let dimensions = document.createElement("div");
dimensions.className = "game-area__options__chose-dimension";
dimensions.innerText = "Другие размеры: ";
options.appendChild(dimensions);

for (let i = 3; i <= 8; i++) {
  let specificSize = document.createElement("div");
  specificSize.className = "game-area__options__chose-dimension_specificSize";
  specificSize.innerText = `${i}x${i}`;
  specificSize.addEventListener("click", () => {
    _DEFAULT_VALUES.puzzleDimension = i;
    let cellsArr = puzzle.querySelectorAll(".game-area__puzzle__puzzle-cell");
    cellsArr.forEach((cell) => {
      cell.remove();
    });
    drawGrid(i);
    // shuffle(i);
  });
  dimensions.appendChild(specificSize);
}

drawGrid(_DEFAULT_VALUES.puzzleDimension);
shuffle(_DEFAULT_VALUES.puzzleDimension);
