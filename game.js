const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game settings
const paddleWidth = 15, paddleHeight = 100;
const ballRadius = 12;
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Paddle objects
const player = {
    x: 10,
    y: canvasHeight/2 - paddleHeight/2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#0f0"
};
const ai = {
    x: canvasWidth - paddleWidth - 10,
    y: canvasHeight/2 - paddleHeight/2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#f00"
};

// Ball object
const ball = {
    x: canvasWidth/2,
    y: canvasHeight/2,
    radius: ballRadius,
    speed: 5,
    velocityX: 5,
    velocityY: 5,
    color: "#fff"
};

// Score
let playerScore = 0;
let aiScore = 0;

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2, false);
    ctx.closePath();
    ctx.fill();
}

function drawText(text, x, y, color) {
    ctx.fillStyle = color;
    ctx.font = "40px Arial";
    ctx.fillText(text, x, y);
}

function resetBall() {
    ball.x = canvasWidth/2;
    ball.y = canvasHeight/2;
    ball.velocityX = -ball.velocityX;
    ball.velocityY = (Math.random() > 0.5 ? 1 : -1) * (4 + Math.random()*2);
}

function collision(b, p) {
    // AABB - Circle collision
    let bTop = b.y - b.radius;
    let bBottom = b.y + b.radius;
    let bLeft = b.x - b.radius;
    let bRight = b.x + b.radius;

    let pTop = p.y;
    let pBottom = p.y + p.height;
    let pLeft = p.x;
    let pRight = p.x + p.width;

    return bRight > pLeft && bLeft < pRight && bBottom > pTop && bTop < pBottom;
}

function moveAI() {
    // Simple AI: follow the ball with some delay
    const aiCenter = ai.y + ai.height/2;
    if (ball.y < aiCenter - 20) {
        ai.y -= 5;
    } else if (ball.y > aiCenter + 20) {
        ai.y += 5;
    }
    // Keep AI paddle on canvas
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > canvasHeight) ai.y = canvasHeight - ai.height;
}

function update() {
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Wall collision (top/bottom)
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.velocityY = -ball.velocityY;
    }
    if (ball.y + ball.radius > canvasHeight) {
        ball.y = canvasHeight - ball.radius;
        ball.velocityY = -ball.velocityY;
    }

    // Paddle collision
    let paddle = (ball.x < canvasWidth/2) ? player : ai;
    if (collision(ball, paddle)) {
        // Calculate angle of reflection
        let collidePoint = (ball.y - (paddle.y + paddle.height/2));
        collidePoint = collidePoint / (paddle.height/2);

        // Max bounce angle = 60deg
        let angleRad = collidePoint * Math.PI/3;
        let direction = (ball.x < canvasWidth/2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);

        // Optionally increase speed a bit after each hit
        ball.speed += 0.2;
    }

    // Score and reset
    if (ball.x - ball.radius < 0) {
        aiScore++;
        ball.speed = 5;
        resetBall();
    } else if (ball.x + ball.radius > canvasWidth) {
        playerScore++;
        ball.speed = 5;
        resetBall();
    }

    moveAI();
}

function render() {
    // Clear canvas
    drawRect(0, 0, canvasWidth, canvasHeight, "#333");

    // Draw net
    for (let i = 0; i < canvasHeight; i += 30) {
        drawRect(canvasWidth/2-2, i, 4, 20, "#fff");
    }

    // Draw paddles
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);

    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, ball.color);

    // Draw scores
    drawText(playerScore, canvasWidth/4, 50, "#fff");
    drawText(aiScore, 3*canvasWidth/4, 50, "#fff");
}

function game() {
    update();
    render();
    requestAnimationFrame(game);
}

// Mouse movement - control player paddle
canvas.addEventListener('mousemove', function(evt) {
    const rect = canvas.getBoundingClientRect();
    const mouseY = evt.clientY - rect.top;
    player.y = mouseY - player.height/2;
    // Keep paddle on canvas
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvasHeight) player.y = canvasHeight - player.height;
});

game();