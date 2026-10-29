const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const startButton = document.getElementById("start-btn");
const resetButton = document.getElementById("reset-btn");
const gameMessage = document.getElementById("game-message");
let gameRunning = false;
let dropMaker;
let countdown;
let score = 0;
let timeLeft = 30;
const activeLanes = new Set();

const winningMessages = [
  "Amazing work! You collected enough clean drops!",
  "You did it! Great catching!",
  "Fantastic round! You reached the goal!",
];
const losingMessages = [
  "Good effort! Play again and see if you can reach 20.",
  "Keep practicing. Those drops are quick!",
  "So close! Give it another try.",
];

startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetGame);

function startGame() {
  if (gameRunning) return;

  gameRunning = true;
  score = 0;
  timeLeft = 30;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  gameMessage.textContent = "Catch clean blue drops. Avoid dirty red drops.";
  gameContainer.replaceChildren();
  activeLanes.clear();
  startButton.disabled = true;
  startButton.textContent = "Game in progress";

  createDrop();
  dropMaker = setInterval(createDrop, 1000);
  countdown = setInterval(() => {
    timeLeft -= 1;
    timeDisplay.textContent = timeLeft;

    if (timeLeft <= 0) endGame();
  }, 1000);
}

function resetGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(countdown);
  dropMaker = undefined;
  countdown = undefined;
  score = 0;
  timeLeft = 30;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  gameContainer.replaceChildren();
  activeLanes.clear();
  gameMessage.textContent = "Game reset. Press Start Game when you're ready.";
  startButton.disabled = false;
  startButton.textContent = "Start Game";
}

function createDrop() {
  if (!gameRunning) return;

  const drop = document.createElement("button");
  const isBadDrop = Math.random() < 0.35;
  const size = Math.random() * 18 + 68;
  const gameWidth = gameContainer.clientWidth;
  const gameHeight = gameContainer.clientHeight;
  const laneCount = Math.max(1, Math.floor(gameWidth / 100));
  const availableLanes = Array.from({ length: laneCount }, (_, lane) => lane)
    .filter((lane) => !activeLanes.has(lane));

  if (availableLanes.length === 0) return;

  const lane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
  const laneWidth = gameWidth / laneCount;
  const xPosition = lane * laneWidth + (laneWidth - size) / 2;
  activeLanes.add(lane);

  drop.type = "button";
  drop.className = isBadDrop ? "water-drop bad-drop" : "water-drop";
  drop.setAttribute("aria-label", isBadDrop ? "Dirty water drop, minus one point" : "Clean water drop, plus one point");
  drop.style.width = `${size}px`;
  drop.style.height = `${size}px`;
  drop.style.left = `${xPosition}px`;
  drop.style.setProperty("--fall-distance", `${gameHeight + size}px`);
  drop.style.animationDuration = "4s";

  let collected = false;
  const removeDrop = () => {
    activeLanes.delete(lane);
    drop.remove();
  };

  const collectDrop = () => {
    if (!gameRunning || collected) return;
    collected = true;

    score = Math.max(0, score + (isBadDrop ? -1 : 1));
    scoreDisplay.textContent = score;
    scoreDisplay.parentElement.classList.remove("score-pop");
    void scoreDisplay.parentElement.offsetWidth;
    scoreDisplay.parentElement.classList.add("score-pop");
    gameMessage.textContent = isBadDrop ? "Dirty drop! -1 point" : "Clean drop! +1 point";
    removeDrop();
  };

  drop.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    collectDrop();
  });
  drop.addEventListener("click", collectDrop);

  gameContainer.appendChild(drop);
  drop.addEventListener("animationend", removeDrop);
}

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(countdown);
  gameContainer.replaceChildren();
  activeLanes.clear();
  const playerWon = score >= 20;
  const messages = playerWon ? winningMessages : losingMessages;
  gameMessage.textContent = messages[Math.floor(Math.random() * messages.length)];
  startButton.disabled = false;
  startButton.textContent = "Play Again";
  if (playerWon) showConfetti();
}

function showConfetti() {
  const colors = ["#ffc907", "#2e9df7", "#4fcb53", "#ff902a", "#f5402c"];
  const confettiLayer = document.createElement("div");
  confettiLayer.className = "confetti-layer";
  confettiLayer.setAttribute("aria-hidden", "true");

  for (let index = 0; index < 36; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[index % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.45}s`;
    piece.style.setProperty("--confetti-distance", `${gameContainer.clientHeight + 24}px`);
    confettiLayer.appendChild(piece);
  }

  gameContainer.appendChild(confettiLayer);
  setTimeout(() => confettiLayer.remove(), 3000);
}
