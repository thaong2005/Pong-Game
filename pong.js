const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 14;
const PLAYER_X = 24;
const AI_X = canvas.width - PADDLE_WIDTH - 24;
const PADDLE_SPEED = 8;
const BALL_SPEED = 6;
const AI_MAX_SPEED = 5;

// Game state
let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let aiY = (canvas.height - PADDLE_HEIGHT) / 2;
let ballX = canvas.width / 2 - BALL_SIZE / 2;
let ballY = canvas.height / 2 - BALL_SIZE / 2;
let ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
let ballVelY = BALL_SPEED * (Math.random() * 2 - 1);

let playerScore = 0;
let aiScore = 0;

// Draw everything
function draw() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Net
    ctx.strokeStyle = "#fff";
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, 0);
    ctx.lineTo(canvas.width/2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Scores
    ctx.font = "bold 36px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(playerScore, canvas.width/4, 48);
    ctx.fillText(aiScore, canvas.width*3/4, 48);

    // Paddles
    ctx.fillStyle = "#fff";
    ctx.fillRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Ball
    ctx.fillRect(ballX, ballY, BALL_SIZE, BALL_SIZE);
}

// Collision detection
function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return !(x2 > x1 + w1 ||
             x2 + w2 < x1 ||
             y2 > y1 + h1 ||
             y2 + h2 < y1);
}

// Update game state
function update() {
    // Move ball
    ballX += ballVelX;
    ballY += ballVelY;

    // Ball collision with top/bottom
    if (ballY <= 0) {
        ballY = 0;
        ballVelY *= -1;
    }
    if (ballY + BALL_SIZE >= canvas.height) {
        ballY = canvas.height - BALL_SIZE;
        ballVelY *= -1;
    }

    // Ball collision with player paddle
    if (rectIntersect(ballX, ballY, BALL_SIZE, BALL_SIZE, PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT)) {
        ballX = PLAYER_X + PADDLE_WIDTH;
        ballVelX *= -1;

        // Add a bit of randomness to the bounce
        let impact = ((ballY + BALL_SIZE/2) - (playerY + PADDLE_HEIGHT/2)) / (PADDLE_HEIGHT/2);
        ballVelY = BALL_SPEED * impact;
    }

    // Ball collision with AI paddle
    if (rectIntersect(ballX, ballY, BALL_SIZE, BALL_SIZE, AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT)) {
        ballX = AI_X - BALL_SIZE;
        ballVelX *= -1;

        let impact = ((ballY + BALL_SIZE/2) - (aiY + PADDLE_HEIGHT/2)) / (PADDLE_HEIGHT/2);
        ballVelY = BALL_SPEED * impact;
    }

    // Scoring
    if (ballX < 0) {
        aiScore++;
        resetBall(-1);
    } else if (ballX + BALL_SIZE > canvas.width) {
        playerScore++;
        resetBall(1);
    }

    // AI paddle movement (simple tracking)
    let aiCenter = aiY + PADDLE_HEIGHT/2;
    if (aiCenter < ballY + BALL_SIZE/2 - 10) {
        aiY += Math.min(AI_MAX_SPEED, ballY + BALL_SIZE/2 - aiCenter);
    } else if (aiCenter > ballY + BALL_SIZE/2 + 10) {
        aiY -= Math.min(AI_MAX_SPEED, aiCenter - (ballY + BALL_SIZE/2));
    }
    // Clamp AI paddle within canvas
    aiY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, aiY));
}

// Reset ball to center
function resetBall(direction) {
    ballX = canvas.width / 2 - BALL_SIZE / 2;
    ballY = canvas.height / 2 - BALL_SIZE / 2;
    // Serve towards the last scorer
    ballVelX = BALL_SPEED * direction;
    // Random vertical direction
    ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
}

// Player paddle control (mouse)
canvas.addEventListener('mousemove', function(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT/2;
    // Clamp within canvas
    playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
});

// Main loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();