const startBtn = document.getElementById('startBtn');
const usernameInput = document.getElementById('usernameInput');
const userInputContainer = document.getElementById('userInputContainer');
const gameContainer = document.getElementById('gameContainer');
const displayName = document.getElementById('displayName');
const scoreboard = document.getElementById('scoreboard');
const guessInput = document.getElementById('guessInput');
const guessBtn = document.getElementById('guessBtn');
const difficultySelect = document.getElementById('difficulty');
const message = document.getElementById('message');
const timerDiv = document.getElementById('timer');
const clock = document.getElementById('clock');
const highScoreDisplay = document.getElementById('highScoreDisplay');
const exitBtn = document.getElementById('exitBtn');
const canvas = document.getElementById('confettiCanvas');
const ctx = canvas.getContext('2d');

let username = '';
let totalScore = 0;
let numberToGuess = 0;
let attemptsLeft = 0;
let timer;
let timeLeft;
let currentDifficulty = 'medium';

const difficulties = {
  easy: { low: 1, high: 10, attempts: 5, timeLimit: 30 },
  medium: { low: 1, high: 50, attempts: 7, timeLimit: 45 },
  hard: { low: 1, high: 100, attempts: 10, timeLimit: 60 }
};

function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

function startTimer(duration) {
  timeLeft = duration;
  timerDiv.textContent = `⏳ Time left: ${timeLeft}s`;
  timer = setInterval(() => {
    timeLeft--;
    timerDiv.textContent = `⏳ Time left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      message.textContent = `⏰ Time's up! The number was ${numberToGuess}. Your total score: ${totalScore}.`;
      guessInput.disabled = true;
      guessBtn.textContent = 'Play Again';
    }
  }, 1000);
}

function getHighScore() {
  const stored = localStorage.getItem('highscore');
  return stored ? JSON.parse(stored) : { name: '', score: 0 };
}

function setHighScore(name, score) {
  localStorage.setItem('highscore', JSON.stringify({ name, score }));
}

function updateHighScoreDisplay() {
  const high = getHighScore();
  highScoreDisplay.textContent = `🏆 High Score: ${high.score} by ${high.name}`;
}

function startGame() {
  currentDifficulty = difficultySelect.value;
  const { low, high, attempts, timeLimit } = difficulties[currentDifficulty];
  numberToGuess = Math.floor(Math.random() * (high - low + 1)) + low;
  attemptsLeft = attempts;
  guessInput.disabled = false;
  guessInput.value = '';
  message.textContent = `Guess a number between ${low} and ${high}. You have ${attemptsLeft} attempts.`;
  scoreboard.textContent = `Score: ${totalScore}`;
  guessBtn.textContent = 'Guess';
  startTimer(timeLimit);
}

function handleGuess() {
  if (guessBtn.textContent === 'Play Again') {
    startGame();
    return;
  }

  const guess = parseInt(guessInput.value, 10);
  if (isNaN(guess)) {
    message.textContent = 'Please enter a valid number!';
    return;
  }

  const { low, high } = difficulties[currentDifficulty];
  if (guess < low || guess > high) {
    message.textContent = `Please guess a number within the range ${low} to ${high}.`;
    return;
  }

  attemptsLeft--;
  if (guess === numberToGuess) {
    clearInterval(timer);
    const roundScore = attemptsLeft + 1;
    totalScore += roundScore;
    scoreboard.textContent = `Score: ${totalScore}`;
    message.textContent = `🎉 Correct! You scored ${roundScore} points. Starting new round...`;
    guessInput.value = '';
    guessInput.disabled = true;
    guessBtn.textContent = 'Play Again';

    const highscore = getHighScore();
    if (totalScore > highscore.score) {
      setHighScore(username, totalScore);
      updateHighScoreDisplay();
      startConfetti();
    }

  } else if (attemptsLeft <= 0) {
    clearInterval(timer);
    message.textContent = `❌ Game Over! The number was ${numberToGuess}. Your total score: ${totalScore}.`;
    guessInput.disabled = true;
    guessBtn.textContent = 'Play Again';
  } else {
    message.textContent = guess > numberToGuess ? `Too high! Attempts left: ${attemptsLeft}` : `Too low! Attempts left: ${attemptsLeft}`;
    guessInput.value = '';
  }
}

startBtn.addEventListener('click', () => {
  const name = usernameInput.value.trim();
  if (!name) {
    alert('Please enter your name to start!');
    return;
  }
  username = name;
  displayName.textContent = name;
  userInputContainer.style.display = 'none';
  gameContainer.style.display = 'block';
  exitBtn.style.display = 'inline-block';
  updateHighScoreDisplay();
  totalScore = 0;
  scoreboard.textContent = `Score: 0`;
  startGame();
});

guessBtn.addEventListener('click', handleGuess);

guessInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') handleGuess();
});

exitBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to exit the game?')) {
    clearInterval(timer);
    totalScore = 0;
    message.textContent = '';
    scoreboard.textContent = '';
    timerDiv.textContent = '';
    guessInput.disabled = false;
    userInputContainer.style.display = 'block';
    gameContainer.style.display = 'none';
    exitBtn.style.display = 'none';
  }
});

// Confetti animation
function startConfetti() {
  const confettiCount = 300;
  const colors = ['#ff0', '#f0f', '#0ff', '#0f0', '#f00'];

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const confetti = Array.from({ length: confettiCount }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    r: Math.random() * 6 + 4,
    d: Math.random() * confettiCount,
    color: colors[Math.floor(Math.random() * colors.length)],
    tilt: Math.floor(Math.random() * 10) - 10
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confetti.forEach((c, i) => {
      ctx.beginPath();
      ctx.fillStyle = c.color;
      ctx.moveTo(c.x + c.tilt + c.r / 3, c.y);
      ctx.lineTo(c.x + c.tilt, c.y + c.r);
      ctx.lineTo(c.x + c.tilt + c.r, c.y + c.r);
      ctx.closePath();
      ctx.fill();
    });
    update();
  }

  function update() {
    confetti.forEach((c) => {
      c.y += Math.cos(c.d) + 1 + c.r / 2;
      c.x += Math.sin(c.d);
      if (c.y > canvas.height) {
        c.y = -10;
        c.x = Math.random() * canvas.width;
      }
    });
  }

  let animation = setInterval(draw, 20);
  setTimeout(() => clearInterval(animation), 5000);
}
