const _DEFAULT_VALUES = {
  puzzleDimension: 4,
  startGameTIme: new Date(),
  steps: 0,
  gameInProgress: false,
};

let savedGame = window.localStorage.getItem("savedGame");
if (savedGame) {
  _DEFAULT_VALUES.gameInProgress = true;
  savedGame = JSON.parse(savedGame);
  _DEFAULT_VALUES.puzzleDimension = savedGame.dimension;
  _DEFAULT_VALUES.steps = savedGame.steps;
  _DEFAULT_VALUES.startGameTIme = new Date() - savedGame.time;
}

let body = document.querySelector("body");

let gameArea = document.createElement("div");
gameArea.className = "game-area";
body.appendChild(gameArea);

let buttons = document.createElement("div");
buttons.className = "game-area__buttons";
gameArea.appendChild(buttons);

let shuffleAndStartButton = document.createElement("button");
shuffleAndStartButton.classList.add(
  "game-area__buttons__button",
  "game-area__buttons__button_shuffle-and-start"
);
shuffleAndStartButton.innerText = "Размешать и начать";
buttons.appendChild(shuffleAndStartButton);

shuffleAndStartButton.addEventListener("click", startGame);

let stopButton = document.createElement("button");
stopButton.classList.add(
  "game-area__buttons__button",
  "game-area__buttons__button_stop"
);
stopButton.innerText = "Стоп";
buttons.appendChild(stopButton);

stopButton.addEventListener("click", stopGame);

let saveButton = document.createElement("button");
saveButton.classList.add(
  "game-area__buttons__button",
  "game-area__buttons__button_save"
);
saveButton.innerText = "Сохранить";
buttons.appendChild(saveButton);

saveButton.addEventListener("click", saveGame);

let resultButton = document.createElement("button");
resultButton.classList.add(
  "game-area__buttons__button",
  "game-area__buttons__button_result"
);
resultButton.innerText = "Результаты";
buttons.appendChild(resultButton);

resultButton.addEventListener("click", showResults);

let timer = document.createElement("div");
timer.className = "game-area__timer";
gameArea.appendChild(timer);

let steps = document.createElement("div");
steps.className = "game-area__timer__steps";
steps.innerText = "Ходов: ";
timer.appendChild(steps);

let stepsCount = document.createElement("div");
stepsCount.className = "game-area__timer__inner";
stepsCount.innerText = _DEFAULT_VALUES.steps;
steps.appendChild(stepsCount);

let time = document.createElement("div");
time.className = "game-area__timer__time";
time.innerText = "Время: ";
timer.appendChild(time);

let currentTime = document.createElement("div");
currentTime.className = "game-area__timer__inner";
currentTime.innerText = msToTime(new Date() - _DEFAULT_VALUES.startGameTIme);
time.appendChild(currentTime);

if (savedGame) {
  startTimer();
}

let puzzle = document.createElement("div");
puzzle.classList.add(
  "game-area__puzzle",
  `game-area__puzzle_${_DEFAULT_VALUES.puzzleDimension}`
);
gameArea.appendChild(puzzle);

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
    stopGame();
  });
  dimensions.appendChild(specificSize);
}

drawGrid(_DEFAULT_VALUES.puzzleDimension);
if (savedGame) shuffle(_DEFAULT_VALUES.puzzleDimension, savedGame.grid);

function drawGrid(dimension) {
  let cellValue = dimension * dimension;
  let animationEnd = true;
  for (let i = 0; i < cellValue; i++) {
    let puzzleCell = document.createElement("div");
    let puzzleCellCover = document.createElement("div");
    puzzleCell.appendChild(puzzleCellCover);
    puzzleCell.setAttribute("key", i + 1);
    puzzleCellCover.innerText = i + 1;
    puzzleCell.className = "game-area__puzzle__puzzle-cell";
    puzzleCellCover.className = "game-area__puzzle__puzzle-cell-cover";
    if (i == cellValue - 1) {
      puzzleCell.classList.add("game-area__puzzle__puzzle-cell_empty");
      puzzleCellCover.remove();
    } else {
      let move;

      puzzleCell.addEventListener("click", (e) => {
        if (!_DEFAULT_VALUES.gameInProgress) return;
        move = getMove(puzzleCell, dimension);
        if (!move) return;
        if (animationEnd) {
          animationEnd = false;
          puzzleCellCover.style.animation = `move${move.direction} 0.3s ease`;
        }
      });

      puzzleCellCover.addEventListener("animationend", () => {
        puzzleCellCover.style.animation = "";
        let itemParent = move.element.parentElement;
        itemParent.insertBefore(move.empty, move.next);
        itemParent.insertBefore(move.element, move.emptyNext);
        _DEFAULT_VALUES.steps++;
        stepsCount.innerText = _DEFAULT_VALUES.steps;

        animationEnd = true;

        if (isWin()) {
          let elapsedTime = msToTime(
            new Date() - _DEFAULT_VALUES.startGameTIme
          );
          setTimeout(() => {
            stopGame();
            window.alert(
              `Ура! Вы решили головоломку за ${elapsedTime} и ${_DEFAULT_VALUES.steps} ходов`
            );
          }, 0);
          saveResult(elapsedTime, _DEFAULT_VALUES.steps);
        }
      });
    }
    puzzle.appendChild(puzzleCell);
  }
  dimensionText.innerText = `Размерность пазла ${dimension} на ${dimension} `;
  puzzle.className = "";
  puzzle.classList.add("game-area__puzzle", `game-area__puzzle_${dimension}`);
}

function showResults() {
  let results = [];
  let sResults = window.localStorage.getItem("result");
  if (sResults) {
    results = JSON.parse(sResults);
  }
  let i = 1;
  resultString = "Последние результаты:\n#     Ходы     Время\n";
  for (let el of results) {
    resultString += `${i})     ${el.steps}    ${el.elapsedTime}\n`;
    i++;
  }
  window.alert(resultString);
}

function saveResult(elapsedTime, steps) {
  let results = [];
  let sResults = window.localStorage.getItem("result");
  if (sResults) {
    results = JSON.parse(sResults);
  }
  if (results.length < 10) results.push({ elapsedTime, steps });
  else {
    if (results[9].steps > steps) {
      results.pop();
      results.push({ elapsedTime, steps });
    } else {
      if (results[9].elapsedTime > elapsedTime && results[9].steps == steps) {
        results.pop();
        results.push({ elapsedTime, steps });
      }
    }
  }
  results.sort((a, b) => {
    if (a.steps == b.steps) {
      if (a.elapsedTime.length == b.elapsedTime.length) {
        if (a.elapsedTime >= b.elapsedTime) return 1;
        else return -1;
      } else return a.elapsedTime.length - b.elapsedTime.length;
    } else return a.steps - b.steps;
  });
  window.localStorage.setItem("result", JSON.stringify(results));
}

function shuffle(dimension, sortOrder) {
  let puzzle = document.querySelector(
    `body > div > div.game-area__puzzle_${dimension}`
  );
  let cellsArr = puzzle.querySelectorAll(".game-area__puzzle__puzzle-cell");
  cellsArr = [...cellsArr];
  if (sortOrder) {
    cellsArr = sortOrder.map((e) => cellsArr[parseInt(e) - 1]);
  } else {
    cellsArr.sort(() => Math.random() - 0.5);
  }
  cellsArr.forEach((cell) => {
    cell.remove();
    puzzle.appendChild(cell);
  });
}

function startGame() {
  _DEFAULT_VALUES.gameInProgress = true;
  shuffle(_DEFAULT_VALUES.puzzleDimension);
  _DEFAULT_VALUES.steps = 0;
  stepsCount.innerText = _DEFAULT_VALUES.steps;
  _DEFAULT_VALUES.startGameTIme = new Date();
  currentTime.innerText = msToTime(new Date() - _DEFAULT_VALUES.startGameTIme);
  startTimer();
}

function startTimer() {
  setInterval(() => {
    currentTime.innerText = msToTime(
      new Date() - _DEFAULT_VALUES.startGameTIme
    );
  }, 1000);

  timer.classList.add("game-area__timer_visible");
}

function stopGame() {
  let cellsArr = puzzle.querySelectorAll(".game-area__puzzle__puzzle-cell");
  cellsArr.forEach((cell) => {
    cell.remove();
  });
  drawGrid(_DEFAULT_VALUES.puzzleDimension);
  timer.classList.remove("game-area__timer_visible");
  _DEFAULT_VALUES.gameInProgress = false;
}

function saveGame() {
  let savedGame = {};
  savedGame.steps = _DEFAULT_VALUES.steps;
  savedGame.time = new Date() - _DEFAULT_VALUES.startGameTIme;
  savedGame.dimension = _DEFAULT_VALUES.puzzleDimension;

  let currentGameGrid = puzzle.querySelectorAll(
    ".game-area__puzzle__puzzle-cell"
  );
  currentGameGrid = [...currentGameGrid];
  savedGame.grid = currentGameGrid.map((e) => e.getAttribute("key"));
  window.localStorage.setItem("savedGame", JSON.stringify(savedGame));
}

function isWin() {
  let cellsArr = puzzle.querySelectorAll(".game-area__puzzle__puzzle-cell");
  cellsArr = [...cellsArr];
  for (let i = 0; i < cellsArr.length; i++) {
    if (cellsArr[i].getAttribute("key") != i + 1) return false;
  }
  return true;
}

function getCordsByPosition(position, dim) {
  return { i: Math.floor(position / dim), j: position % dim };
}

function getPositionByCords(i, j, dim) {
  return i * dim + j;
}

function getMove(element, dimension) {
  let items = puzzle.querySelectorAll(".game-area__puzzle__puzzle-cell");
  let empty = puzzle.querySelector(".game-area__puzzle__puzzle-cell_empty");
  items = [...items];
  let position = items.indexOf(element);
  let emptyPosition = items.indexOf(empty);
  let cords = getCordsByPosition(position, dimension);
  let emptyCords = getCordsByPosition(emptyPosition, dimension);
  let direction;
  if (cords.i - 1 == emptyCords.i && cords.j == emptyCords.j) direction = "up";
  else if (cords.i + 1 == emptyCords.i && cords.j == emptyCords.j)
    direction = "down";
  else if (cords.i == emptyCords.i && cords.j - 1 == emptyCords.j)
    direction = "left";
  else if (cords.i == emptyCords.i && cords.j + 1 == emptyCords.j)
    direction = "right";

  if (!direction) return;
  return {
    direction,
    next: items[position + 1] ? items[position + 1] : null,
    emptyNext: items[emptyPosition + 1] ? items[emptyPosition + 1] : null,
    element,
    empty,
  };
}

function msToTime(s) {
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s;

  if (secs < 10) secs = "0" + secs;
  if (mins < 10) mins = "0" + mins;
  return mins + ":" + secs;
}
