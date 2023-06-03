// Get all square elements
const squares = document.querySelectorAll('.square');
const xMarker = document.getElementById('x-marker');
const oMarker = document.getElementById('o-marker');
const statusDisplay = document.getElementById('status');

// Game state variable
let gameState = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X'

function removeAnimationDelay(element) {
    element.style.animationDelay = '0s';
}
setTimeout(removeAnimationDelay(xMarker), 200);
setTimeout(removeAnimationDelay(statusDisplay), 400);


// Function to handle square clicks
function handleSquareClick(index) {
    // Check if the square is already filled or the game is over
    if (gameState[index] || isGameOver()) {
        return;
    }

    // Add the X marker to the clicked square
    squares[index].textContent = currentPlayer;
    squares[index].style.color = getTextColor(currentPlayer);
    squares[index].classList.add('filled')
    gameState[index] = currentPlayer;

    // Check if the game is over after the current move
    gameResult = isGameOver();
    if (gameResult === 'win') {
        statusDisplay.innerHTML = `<h3>${currentPlayer} wins!<h3>`;
        if (currentPlayer == 'X') xMarker.style.color = '#1E90FF';
        else oMarker.style.color = '#32CD32';
        xMarker.style.animationName = 'pop-in-left';
        oMarker.style.animationName = 'pop-in-right';
    } else if (gameResult === 'tie') {
        statusDisplay.innerHTML = `<h3>Tie<h3>`;
        xMarker.style.animationName = 'pop-in-left';
        oMarker.style.animationName = 'pop-in-right';
    } else {
        xMarker.style.animationName = getXAnimation(currentPlayer);
        oMarker.style.animationName = getOAnimation(currentPlayer);
        currentPlayer = togglePlayer(currentPlayer);
        statusDisplay.innerHTML = `<h3>${currentPlayer}'s turn<h3>`;
    }
}

function togglePlayer(currentPlayer) {
    if (currentPlayer === 'X') return 'O';
    else return 'X';
}

function getTextColor(currentPlayer) {
    if (currentPlayer === 'X') return '#1E90FF';
    else return '#32CD32';
}

function getXAnimation(currentPlayer) {
    if (currentPlayer === 'X') return 'pop-out-left';
    else return 'pop-in-left';
}

function getOAnimation(currentPlayer) {
    if (currentPlayer === 'X') return 'pop-in-right';
    else return 'pop-out-right';
}

// Function to check if the game is over
function isGameOver() {
    const rowCombinations = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];
    const columnCombinations = [[0, 3, 6], [1, 4, 7], [2, 5, 8]];
    const diagonalRightCombination = [0, 4, 8];
    const diagonalLeftCombination = [2, 4, 6];
    const winningCombinations = [...rowCombinations, ...columnCombinations, diagonalRightCombination, diagonalLeftCombination];

    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (gameState[a] !== '' && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            combination.forEach(index => squares[index].classList.add('winning-square', currentPlayer));

            if (rowCombinations.includes(combination)) {
                combination.forEach(index => squares[index].classList.add('horizontal'));
            } else if (columnCombinations.includes(combination)) {
                combination.forEach(index => squares[index].classList.add('vertical'));
            } else if (diagonalRightCombination === combination) {
                combination.forEach(index => squares[index].classList.add('diagonal-right'));
            } else if (diagonalLeftCombination === combination) {
                combination.forEach(index => squares[index].classList.add('diagonal-left'));
            }

            return 'win';
        }
    }

    if (!gameState.includes('')) {
        return 'tie';
    }

    return '';
}


// Function to handle restart
function handleRestart() {
    location.reload();
}

// Attach event listener to each square
squares.forEach((square, index) => {
    square.addEventListener('click', () => handleSquareClick(index));
});
