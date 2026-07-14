// LEMONFARMZ Snake Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const speedDisplay = document.getElementById('speed');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const gameOverModal = document.getElementById('gameOver');
const finalScoreDisplay = document.getElementById('finalScore');
const finalLevelDisplay = document.getElementById('finalLevel');

// Game variables
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
    { x: 10, y: 10 }
];

let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = generateFood();
let powerUp = null;
let score = 0;
let level = 1;
let gameSpeed = 100;
let gameRunning = false;
let gamePaused = false;
let gameLoopId = null;

// Initialize
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetGame);

// Keyboard controls
document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(e) {
    if (!gameRunning) return;

    switch(e.key) {
        case 'ArrowUp':
            if (direction.y === 0) nextDirection = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (direction.y === 0) nextDirection = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (direction.x === 0) nextDirection = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x === 0) nextDirection = { x: 1, y: 0 };
            break;
    }
}

function startGame() {
    if (gameRunning) return;
    
    gameRunning = true;
    gamePaused = false;
    startBtn.textContent = '⏸ En cours';
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    gameLoopId = setInterval(gameLoop, gameSpeed);
}

function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? '▶ Reprendre' : '⏸ Pause';
    
    if (gamePaused) {
        clearInterval(gameLoopId);
    } else {
        gameLoopId = setInterval(gameLoop, gameSpeed);
    }
}

function resetGame() {
    clearInterval(gameLoopId);
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    food = generateFood();
    powerUp = null;
    score = 0;
    level = 1;
    gameSpeed = 100;
    gameRunning = false;
    gamePaused = false;
    
    updateUI();
    startBtn.textContent = '▶ Démarrer';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '⏸ Pause';
    gameOverModal.style.display = 'none';
    
    draw();
}

function gameLoop() {
    if (gamePaused) return;
    
    update();
    draw();
}

function update() {
    // Update direction
    direction = nextDirection;
    
    // Calculate new head position
    const head = snake[0];
    const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
    };
    
    // Check wall collision
    if (newHead.x < 0 || newHead.x >= tileCount || newHead.y < 0 || newHead.y >= tileCount) {
        endGame();
        return;
    }
    
    // Check self collision
    for (let segment of snake) {
        if (newHead.x === segment.x && newHead.y === segment.y) {
            endGame();
            return;
        }
    }
    
    // Add new head
    snake.unshift(newHead);
    
    // Check food collision
    if (newHead.x === food.x && newHead.y === food.y) {
        score += 10;
        food = generateFood();
        
        // Spawn power-up randomly (20% chance)
        if (Math.random() < 0.2) {
            powerUp = generatePowerUp();
        }
    } else {
        snake.pop();
    }
    
    // Check power-up collision
    if (powerUp && newHead.x === powerUp.x && newHead.y === powerUp.y) {
        score += 50;
        powerUp = null;
        
        // Increase level and speed
        level++;
        gameSpeed = Math.max(50, gameSpeed - 5);
        updateUI();
        
        // Restart game loop with new speed
        clearInterval(gameLoopId);
        gameLoopId = setInterval(gameLoop, gameSpeed);
    }
    
    updateUI();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.1)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    
    // Draw food (citron)
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Draw food emoji
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'transparent';
    ctx.fillText('🍋', food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2);
    
    // Draw power-up (pochon)
    if (powerUp) {
        ctx.fillStyle = '#32CD32';
        ctx.shadowColor = 'rgba(50, 205, 50, 0.5)';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(
            powerUp.x * gridSize + gridSize / 2,
            powerUp.y * gridSize + gridSize / 2,
            gridSize / 2 - 1,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Power-up animation glow
        ctx.strokeStyle = 'rgba(50, 205, 50, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw emoji
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'transparent';
        ctx.fillText('💚', powerUp.x * gridSize + gridSize / 2, powerUp.y * gridSize + gridSize / 2);
    }
    
    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        
        if (i === 0) {
            // Head - brighter color
            ctx.fillStyle = '#FFA500';
            ctx.shadowColor = 'rgba(255, 165, 0, 0.6)';
            ctx.shadowBlur = 10;
        } else {
            // Body - darker gradient
            const opacity = 1 - (i / snake.length) * 0.5;
            ctx.fillStyle = `rgba(255, 215, 0, ${opacity})`;
            ctx.shadowColor = 'transparent';
        }
        
        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
    }
    
    // Draw snake eyes on head if visible
    if (snake.length > 0) {
        const head = snake[0];
        ctx.fillStyle = '#000000';
        const eyeSize = 2;
        const eyeOffsets = [
            { x: gridSize * 0.3, y: gridSize * 0.3 },
            { x: gridSize * 0.7, y: gridSize * 0.3 }
        ];
        
        eyeOffsets.forEach(offset => {
            ctx.fillRect(
                head.x * gridSize + offset.x - eyeSize,
                head.y * gridSize + offset.y - eyeSize,
                eyeSize * 2,
                eyeSize * 2
            );
        });
    }
}

function generateFood() {
    let newFood;
    let validPosition = false;
    
    while (!validPosition) {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        // Check if food spawns on snake
        validPosition = !snake.some(segment => 
            segment.x === newFood.x && segment.y === newFood.y
        );
    }
    
    return newFood;
}

function generatePowerUp() {
    let newPowerUp;
    let validPosition = false;
    
    while (!validPosition) {
        newPowerUp = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        // Check if power-up spawns on snake or food
        validPosition = !snake.some(segment => 
            segment.x === newPowerUp.x && segment.y === newPowerUp.y
        ) && !(newPowerUp.x === food.x && newPowerUp.y === food.y);
    }
    
    return newPowerUp;
}

function updateUI() {
    scoreDisplay.textContent = score;
    levelDisplay.textContent = level;
    speedDisplay.textContent = gameSpeed + 'ms';
}

function endGame() {
    clearInterval(gameLoopId);
    gameRunning = false;
    
    finalScoreDisplay.textContent = score;
    finalLevelDisplay.textContent = level;
    
    gameOverModal.style.display = 'flex';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// Initial draw
draw();