let players = [];
let scores = {};
let currentPlayerIndex = -1;
let timer;
let timeLeft = 60; // Timer duration
let questions = [];
let usedQuestions = new Set(); // Track used questions
let currentTruth = null; // To store the current truth question
let currentDare = null; // To store the current dare question

// Fetch questions from JSON file
fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        questions = data.questions;
    })
    .catch(error => console.error('Error loading questions:', error));

document.getElementById('addPlayer').onclick = function() {
    const playerName = document.getElementById('playerName').value.trim();
    if (playerName && !players.includes(playerName)) {
        players.push(playerName);
        scores[playerName] = 0;
        updatePlayerList();
        document.getElementById('playerName').value = '';
        document.getElementById('startGame').disabled = players.length < 2;
    }
};

function updatePlayerList() {
    const playerList = document.getElementById('playerList');
    playerList.innerHTML = '';
    players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player;
        playerList.appendChild(li);
    });
}

document.getElementById('startGame').onclick = function() {
    if (players.length < 2) return; // Require at least 2 players
    currentPlayerIndex = -1;
    timeLeft = 60; // Reset timer
    document.getElementById('player-input').style.display = 'none';
    document.getElementById('currentScores').style.display = 'block'; // Show current scores
    document.getElementById('gameArea').style.display = 'block';
    nextTurn();
};

document.getElementById('endGameDuringPlay').onclick = function() {
    endGame();
};

function endGame() {
    clearInterval(timer); // Stop the timer
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('currentScores').style.display = 'none'; // Hide current scores
    document.getElementById('leaderboard').style.display = 'block'; // Show leaderboard
    updateLeaderboard(); // Update leaderboard with scores
}

function updateLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '';
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    sortedScores.forEach(([player, score]) => {
        const li = document.createElement('li');
        li.textContent = `${player}: ${score} point${score !== 1 ? 's' : ''}`;
        leaderboardList.appendChild(li);
    });
}

document.getElementById('newGame').onclick = function() {
    resetGame(); // Reset game data
    document.getElementById('leaderboard').style.display = 'none'; // Hide leaderboard
    document.getElementById('player-input').style.display = 'flex'; // Show player input again
    document.getElementById('startGame').disabled = true; // Disable start button
};

function resetGame() {
    players = [];
    scores = {};
    currentPlayerIndex = -1;
    usedQuestions.clear(); // Clear used questions
    currentTruth = null; // Reset current truth question
    currentDare = null; // Reset current dare question
    document.getElementById('playerList').innerHTML = '';
    document.getElementById('scoreList').innerHTML = '';
    document.getElementById('truthOrDare').textContent = '';
    document.getElementById('timer').textContent = '';
    document.getElementById('currentTurn').textContent = ''; // Clear current turn display
}

function startTimer() {
    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            document.getElementById('timer').textContent = `Time left: ${timeLeft} seconds`;
        } else {
            clearInterval(timer);
            alert("Time's up! You get 0 points.");
            nextTurn();
        }
    }, 1000);
}

function nextTurn() {
    // Randomly select the next player
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length; // Rotate through players
    const currentPlayer = players[currentPlayerIndex];

    // Display current player's turn
    document.getElementById('currentTurn').textContent = `${currentPlayer}'s turn!`;

    timeLeft = 60; // Reset timer for the new player
    document.getElementById('timer').textContent = `Time left: ${timeLeft} seconds`;
    document.getElementById('truthOrDare').textContent = ''; // Clear the question
    document.getElementById('done').style.display = 'none'; // Hide Done button
    document.getElementById('truthBtn').disabled = false; // Enable truth button
    document.getElementById('dareBtn').disabled = false; // Enable dare button
    currentTruth = null; // Reset current truth question
    currentDare = null; // Reset current dare question
    startTimer(); // Start the timer for the next player
}

document.getElementById('truthBtn').onclick = function() {
    selectQuestion('truth');
};

document.getElementById('dareBtn').onclick = function() {
    selectQuestion('dare');
};

function selectQuestion(type) {
    if (usedQuestions.size >= questions.length) {
        alert("All questions have been used!");
        return;
    }

    let question;
    do {
        const randomIndex = Math.floor(Math.random() * questions.length);
        question = questions[randomIndex];
    } while (usedQuestions.has(question.question) || question.type !== type); // Ensure question hasn't been used and matches the type

    usedQuestions.add(question.question);

    if (type === 'truth') {
        currentTruth = question.question; // Store current truth question
        document.getElementById('truthOrDare').textContent = `Truth: ${currentTruth}`;
    } else if (type === 'dare') {
        currentDare = question.question; // Store current dare question
        document.getElementById('truthOrDare').textContent = `Dare: ${currentDare}`;
    }

    document.getElementById('done').style.display = 'inline-block'; // Show Done button
};

document.getElementById('done').onclick = function() {
    clearInterval(timer);
    const currentPlayer = players[currentPlayerIndex];
    if (currentTruth) {
        scores[currentPlayer] += 1; // Add point for completing truth
        currentTruth = null; // Reset truth question
    } else if (currentDare) {
        scores[currentPlayer] += 1; // Add point for completing dare
        currentDare = null; // Reset dare question
    }
    updateScores();
    nextTurn(); // Go to the next player's turn
};

function updateScores() {
    const scoreList = document.getElementById('scoreList');
    scoreList.innerHTML = '';
    players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = `${player}: ${scores[player]} point${scores[player] !== 1 ? 's' : ''}`;
        scoreList.appendChild(li);
    });
}
