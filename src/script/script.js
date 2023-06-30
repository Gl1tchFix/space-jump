const SPEED_SCALE = 0.00001;

const game = document.querySelector("#game");
const scoreDisplay = document.querySelector("#score");
const startMessage = document.querySelector("#start-message");
const gameoverMessage = document.querySelector("#gameover-message");

document.addEventListener("keydown", startGame, { once: true });

let lastTime;
let speedScale;
let score;

function update(time) { 
  if (lastTime == null) {
    lastTime = time;
    window.requestAnimationFrame(update);
    return;
  }

  const delta = time - lastTime;

  updateGround(delta, speedScale);
  updateDino(delta, speedScale);
  updateCactus(delta, speedScale);
  updateSpeedScale(delta);
  updateScore(delta);

  if (checkGameOver()) return handleGameOver();

  lastTime = time;
  window.requestAnimationFrame(update);
}

function startGame() {
  lastTime = null;
  speedScale = 1;
  score = 0;
  setupGround();
  setupDino();
  setupCactus();
  startMessage.classList.add("hide");
  gameoverMessage.classList.add("hide");
  window.requestAnimationFrame(update);
}


function updateSpeedScale(delta) { 
  speedScale += delta * SPEED_SCALE;
}

function updateScore(delta) {
  score += delta * 0.01; 
  scoreDisplay.textContent = Math.floor(score);
}


function checkCollision(rect1, rect2) {
  return (
    rect1.left < rect2.right &&
    rect1.top < rect2.bottom &&
    rect1.right > rect2.left &&
    rect1.bottom > rect2.top
  );
}

function checkGameOver() {
  const dinoRect = getDinoRect();
  return getCactusRects().some(rect => checkCollision(rect, dinoRect));
}

function handleGameOver() {
  setDinoLose();
  setTimeout(() => {
    document.addEventListener("keydown", startGame, { once: true });
    gameoverMessage.classList.remove("hide");
  }, 100);
}





function getCustomProperty(elem, prop) {
  return parseFloat(getComputedStyle(elem).getPropertyValue(prop)) || 0;
}

function setCustomProperty(elem, prop, value) {
  elem.style.setProperty(prop, value);
}

function incrementCustomProperty(elem, prop, inc) {
  setCustomProperty(elem, prop, getCustomProperty(elem, prop) + inc);
}

const GROUND_SPEED = 0.05;
const grounds = document.querySelectorAll(".ground");

function setupGround() {
  setCustomProperty(grounds[0], "--left", 0);
  setCustomProperty(grounds[1], "--left", 300);
}

function updateGround(delta, speedScale) {
  grounds.forEach(ground => {
    incrementCustomProperty(ground, "--left", delta * speedScale * GROUND_SPEED * -1);

    if (getCustomProperty(ground, "--left") <= -300) {
      incrementCustomProperty(ground, "--left", 600);
    }
  });
}


const dino = document.querySelector("#dino");
const JUMP_SPEED = 0.25;
const GRAVITY = 0.001;
const DINO_FRAME_COUNT = 4;
const CACTUS_FRAME_COUNT = 2;
const FRAME_TIME = 100;

let isJumping;
let isDoubleJump;
let dinoFrame;
let cactusFrame = 0;
let currentFrameTime;
let cactusFrameTime = 0;
let yVelocity;

function setupDino() {
  isJumping = false;
  isDoubleJump = false;

  dinoFrame = 0;
  currentFrameTime = 0;
  yVelocity = 0;

  setCustomProperty(dino, "--bottom", 0);
  document.removeEventListener("keydown", onJump);
  document.addEventListener("keydown", onJump);
}

function updateDino(delta, speedScale) {
  handleRun(delta, speedScale);
  handleJump(delta);
}

function getDinoRect() {
  return dino.getBoundingClientRect();
}

function setDinoLose() {
  dino.src = "src/assets/over.svg";
}

function handleRun(delta, speedScale) {
  if (isJumping) {
    dino.src = `src/assets/jump.svg`;
    return;
  }

  if (currentFrameTime >= FRAME_TIME) {
    dinoFrame = (dinoFrame + 1) % DINO_FRAME_COUNT;
    dino.src = `src/assets/step-${dinoFrame}.svg`;
    currentFrameTime -= FRAME_TIME;
  }
  currentFrameTime += delta * speedScale;
}

function handleJump(delta) {
  if (!isJumping) return;

  incrementCustomProperty(dino, "--bottom", yVelocity * delta);

  if (getCustomProperty(dino, "--bottom") <= 0) {
    setCustomProperty(dino, "--bottom", 0);
    isJumping = false;
  }

  yVelocity -= GRAVITY * delta;
}

function onJump(e) {
  if (e.code !== "Space" || isJumping) return;
 
    yVelocity = JUMP_SPEED;
    isJumping = true;
}

const CACTUS_SPEED = 0.05;
const CACTUS_INTERVAL_MIN = 500;
const CACTUS_INTERVAL_MAX = 2000;

let nextCactusTime;

function setupCactus() {
  nextCactusTime = CACTUS_INTERVAL_MIN;
  document.querySelectorAll(".cactus").forEach(cactus => {
    cactus.remove();
  })
}

function updateCactus(delta, speedScale) {
  document.querySelectorAll(".cactus").forEach(cactus => {
    incrementCustomProperty(cactus, "--left", delta * speedScale * CACTUS_SPEED * -1);
    if (getCustomProperty(cactus, "--left") <= -100) {
      cactus.remove();
    }
  })

  if (nextCactusTime <= 0) {
    createCactus();
    nextCactusTime =
      randomizer(CACTUS_INTERVAL_MIN, CACTUS_INTERVAL_MAX) / speedScale;
  }
  nextCactusTime -= delta;
}

function getCactusRects() {
  return [...document.querySelectorAll(".cactus")].map(cactus => {
    return cactus.getBoundingClientRect();
  })
}

function createCactus() {
  const cactus = document.createElement("img");
  let cactusID = Math.floor(Math.random() * 3);
  cactus.src = `src/assets/cone-${cactusID}.svg`;
  cactus.classList.add("cactus");
  setCustomProperty(cactus, "--left", 100);
  game.append(cactus); 
}

function randomizer(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}