const WORDS = [
    "TERMO", "SAGAZ", "AMIGO", "NOBRE", "SENSO", "AFETO", "PLENA", "MUITO", "IDEIA", "VIGOR",
    "SUTIL", "HONRA", "ANEXO", "MORAL", "JUSTO", "MUNDO", "ETNIA", "ICONE", "SOBRE", "SONHO",
    "TEMPO", "RAZAO", "CHUVA", "FALAR", "PODER", "DIZER", "SAUDE", "LIVRO", "NOITE", "VIVER",
    "CORPO", "COISA", "FORMA", "PARTE", "GRUPO", "HOMEM", "FINAL", "LINHA", "CAUSA", "LUGAR",
    "MESMO", "MAIOR", "IDEAL", "JOVEM", "PONTO", "VELHO", "VISTA", "TANTO", "CAMPO", "PAPEL"
];

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

let targetWord = WORDS[Math.floor(Math.random() * WORDS.length)];
let currentRow = 0;
let currentTile = 0;
let isGameOver = false;
let guesses = [
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""]
];

const grid = document.getElementById('grid');
const keyboard = document.getElementById('keyboard');
const messageContainer = document.getElementById('message-container');

// Initialize Grid
function initGrid() {
    for (let i = 0; i < MAX_GUESSES; i++) {
        const row = document.createElement('div');
        row.className = 'tile-row';
        row.setAttribute('id', 'row-' + i);
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.setAttribute('id', 'row-' + i + '-tile-' + j);
            row.appendChild(tile);
        }
        grid.appendChild(row);
    }
}

// Initialize Keyboard
const keyLayout = [
    "QWERTYUIOP",
    "ASDFGHJKL",
    "ZXCVBNM"
];

function initKeyboard() {
    keyLayout.forEach((rowKeys, index) => {
        const rowElement = document.createElement('div');
        rowElement.className = 'keyboard-row';

        // Add spacer for second and third rows for layout balance if needed, 
        // but for now simple flex is fine.

        if (index === 2) {
            // Enter key
            const enterKey = document.createElement('div');
            enterKey.className = 'key key-large';
            enterKey.textContent = 'ENTER';
            enterKey.addEventListener('click', () => handleKey('ENTER'));
            rowElement.appendChild(enterKey);
        }

        for (let key of rowKeys) {
            const keyElement = document.createElement('div');
            keyElement.className = 'key';
            keyElement.textContent = key;
            keyElement.setAttribute('data-key', key);
            keyElement.addEventListener('click', () => handleKey(key));
            rowElement.appendChild(keyElement);
        }

        if (index === 2) {
            // Backspace key
            const backspaceKey = document.createElement('div');
            backspaceKey.className = 'key key-large';
            backspaceKey.textContent = '⌫';
            backspaceKey.addEventListener('click', () => handleKey('BACKSPACE'));
            rowElement.appendChild(backspaceKey);
        }

        keyboard.appendChild(rowElement);
    });
}

function handleKey(key) {
    if (isGameOver) return;

    if (key === 'ENTER') {
        checkGuess();
    } else if (key === 'BACKSPACE') {
        deleteLetter();
    } else {
        addLetter(key);
    }
}

function addLetter(letter) {
    if (currentTile < WORD_LENGTH && currentRow < MAX_GUESSES) {
        const tile = document.getElementById('row-' + currentRow + '-tile-' + currentTile);
        tile.textContent = letter;
        tile.setAttribute('data-state', 'active');
        guesses[currentRow][currentTile] = letter;
        currentTile++;
    }
}

function deleteLetter() {
    if (currentTile > 0) {
        currentTile--;
        const tile = document.getElementById('row-' + currentRow + '-tile-' + currentTile);
        tile.textContent = '';
        tile.removeAttribute('data-state');
        guesses[currentRow][currentTile] = '';
    }
}

function checkGuess() {
    const guess = guesses[currentRow].join("");
    if (currentTile < WORD_LENGTH) {
        showMessage('Só palavras com 5 letras');
        return;
    }

    // Color logic
    const rowTiles = document.getElementById('row-' + currentRow).children;
    let targetWordArr = targetWord.split("");
    let guessArr = guess.split("");

    // First pass: Correct (Green)
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessArr[i] === targetWordArr[i]) {
            rowTiles[i].setAttribute('data-state', 'correct');
            updateKeyboardColor(guessArr[i], 'correct');
            targetWordArr[i] = null; // Mark as used
            guessArr[i] = null;
        }
    }

    // Second pass: Present (Yellow) or Absent (Gray)
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessArr[i]) { // If not already processed
            const indexInTarget = targetWordArr.indexOf(guessArr[i]);
            if (indexInTarget > -1) {
                rowTiles[i].setAttribute('data-state', 'present');
                updateKeyboardColor(guessArr[i], 'present');
                targetWordArr[indexInTarget] = null;
            } else {
                rowTiles[i].setAttribute('data-state', 'absent');
                updateKeyboardColor(guessArr[i], 'absent');
            }
        }
    }

    if (guess === targetWord) {
        showMessage('Parabéns! Você venceu!');
        isGameOver = true;
        return;
    }

    if (currentRow >= MAX_GUESSES - 1) {
        showMessage('Fim de jogo. A palavra era ' + targetWord);
        isGameOver = true;
        return;
    }

    currentRow++;
    currentTile = 0;
}

function updateKeyboardColor(key, state) {
    const keyElement = document.querySelector(`.key[data-key="${key}"]`);
    if (keyElement) {
        const currentState = keyElement.getAttribute('data-state');
        if (state === 'correct') {
            keyElement.style.backgroundColor = '#3aa394';
            keyElement.setAttribute('data-state', 'correct');
        } else if (state === 'present' && currentState !== 'correct') {
            keyElement.style.backgroundColor = '#d3ad69';
            keyElement.setAttribute('data-state', 'present');
        } else if (state === 'absent' && currentState !== 'correct' && currentState !== 'present') {
            keyElement.style.backgroundColor = '#313131';
            keyElement.setAttribute('data-state', 'absent');
        }
    }
}

// ... (existing code)

function showMessage(msg) {
    const messageElement = document.createElement('div');
    messageElement.textContent = msg;
    messageElement.className = 'message';
    messageContainer.appendChild(messageElement);
    setTimeout(() => {
        messageContainer.removeChild(messageElement);
    }, 3000);
}

function resetGame() {
    // Reset variables
    targetWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    currentRow = 0;
    currentTile = 0;
    isGameOver = false;
    guesses = [
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""]
    ];

    // Clear grid
    grid.innerHTML = '';
    initGrid();

    // Reset keyboard
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        key.style.backgroundColor = '';
        key.removeAttribute('data-state');
    });

    showMessage('Jogo reiniciado!');
}

document.getElementById('restart-btn').addEventListener('click', resetGame);

// Start Game
initGrid();
initKeyboard();

document.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    const key = e.key.toUpperCase();
    if (key === 'ENTER') {
        handleKey('ENTER');
    } else if (key === 'BACKSPACE') {
        handleKey('BACKSPACE');
    } else if (/^[A-Z]$/.test(key)) {
        handleKey(key);
    }
});
