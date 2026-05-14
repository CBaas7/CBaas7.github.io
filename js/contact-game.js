const gameCanvas = document.querySelector("[data-contact-game]");

if (gameCanvas) {
  const context = gameCanvas.getContext("2d");
  const scoreElement = document.querySelector("[data-game-score]");
  const statusElement = document.querySelector("[data-game-status]");
  const resetButton = document.querySelector("[data-game-reset]");
  const gravity = 0.42;
  const friction = 0.985;
  const ballRadius = 18;
  let score = 0;
  let isDragging = false;
  let dragPoint = null;
  let hasScoredThisThrow = false;
  let animationId = null;

  const ballStart = { x: 120, y: gameCanvas.height - 95 };
  const hoop = {
    x: gameCanvas.width - 170,
    y: 220,
    width: 104,
    height: 22,
  };

  const ball = {
    x: ballStart.x,
    y: ballStart.y,
    vx: 0,
    vy: 0,
  };

  const setStatus = (message) => {
    if (statusElement) {
      statusElement.textContent = message;
    }
  };

  const syncScore = () => {
    if (scoreElement) {
      scoreElement.textContent = score;
    }
  };

  const resetBall = () => {
    ball.x = ballStart.x;
    ball.y = ballStart.y;
    ball.vx = 0;
    ball.vy = 0;
    dragPoint = null;
    isDragging = false;
    hasScoredThisThrow = false;
  };

  const resetGame = () => {
    score = 0;
    syncScore();
    resetBall();
    setStatus("Sleep de bal naar achteren en laat los.");
  };

  const getPointerPosition = (event) => {
    const rect = gameCanvas.getBoundingClientRect();
    const scaleX = gameCanvas.width / rect.width;
    const scaleY = gameCanvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const pointerHitsBall = (point) => {
    const distance = Math.hypot(point.x - ball.x, point.y - ball.y);
    return distance <= ballRadius + 12;
  };

  const drawCourt = () => {
    context.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    context.fillStyle = "rgba(240, 217, 154, 0.1)";
    context.fillRect(0, gameCanvas.height - 60, gameCanvas.width, 60);

    context.strokeStyle = "rgba(184, 199, 217, 0.18)";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, gameCanvas.height - 60);
    context.lineTo(gameCanvas.width, gameCanvas.height - 60);
    context.stroke();

    context.fillStyle = "rgba(245, 240, 230, 0.88)";
    context.fillRect(hoop.x + hoop.width - 10, hoop.y - 72, 12, 112);

    context.fillStyle = "rgba(184, 199, 217, 0.88)";
    context.fillRect(hoop.x + 42, hoop.y - 64, 72, 52);

    context.strokeStyle = "#d8b76a";
    context.lineWidth = 7;
    context.beginPath();
    context.ellipse(hoop.x, hoop.y, hoop.width / 2, hoop.height / 2, 0, 0, Math.PI * 2);
    context.stroke();

    context.strokeStyle = "rgba(240, 217, 154, 0.34)";
    context.lineWidth = 2;
    for (let i = 0; i < 7; i += 1) {
      const startX = hoop.x - hoop.width / 2 + i * (hoop.width / 6);
      context.beginPath();
      context.moveTo(startX, hoop.y + 12);
      context.lineTo(hoop.x - 34 + i * 11, hoop.y + 72);
      context.stroke();
    }

    context.fillStyle = "rgba(240, 217, 154, 0.85)";
    context.font = "700 18px Arial";
    context.fillText("INBOX", hoop.x + 50, hoop.y - 27);
  };

  const drawAimLine = () => {
    if (!isDragging || !dragPoint) {
      return;
    }

    context.strokeStyle = "rgba(240, 217, 154, 0.75)";
    context.lineWidth = 3;
    context.setLineDash([8, 8]);
    context.beginPath();
    context.moveTo(ball.x, ball.y);
    context.lineTo(dragPoint.x, dragPoint.y);
    context.stroke();
    context.setLineDash([]);
  };

  const drawBall = () => {
    const gradient = context.createRadialGradient(ball.x - 7, ball.y - 9, 3, ball.x, ball.y, ballRadius);
    gradient.addColorStop(0, "#f0d99a");
    gradient.addColorStop(1, "#d87c2d");

    context.fillStyle = gradient;
    context.beginPath();
    context.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = "rgba(5, 11, 31, 0.55)";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(ball.x - ballRadius, ball.y);
    context.lineTo(ball.x + ballRadius, ball.y);
    context.moveTo(ball.x, ball.y - ballRadius);
    context.lineTo(ball.x, ball.y + ballRadius);
    context.stroke();
  };

  const checkScore = () => {
    const insideHoop =
      ball.x > hoop.x - hoop.width / 2 &&
      ball.x < hoop.x + hoop.width / 2 &&
      ball.y > hoop.y - hoop.height &&
      ball.y < hoop.y + hoop.height + 8 &&
      ball.vy > 0;

    if (insideHoop && !hasScoredThisThrow) {
      score += 1;
      hasScoredThisThrow = true;
      syncScore();
      setStatus("Raak. Dat bericht is verzonden.");
    }
  };

  const updateBall = () => {
    if (isDragging) {
      return;
    }

    ball.vy += gravity;
    ball.vx *= friction;
    ball.vy *= friction;
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.x < ballRadius) {
      ball.x = ballRadius;
      ball.vx *= -0.65;
    }

    if (ball.x > gameCanvas.width - ballRadius) {
      ball.x = gameCanvas.width - ballRadius;
      ball.vx *= -0.65;
    }

    if (ball.y > gameCanvas.height - 60 - ballRadius) {
      ball.y = gameCanvas.height - 60 - ballRadius;
      ball.vy *= -0.55;
      ball.vx *= 0.82;

      if (Math.abs(ball.vx) < 0.2 && Math.abs(ball.vy) < 1.3) {
        ball.vx = 0;
        ball.vy = 0;
      }
    }

    if (ball.y < ballRadius) {
      ball.y = ballRadius;
      ball.vy *= -0.45;
    }

    checkScore();
  };

  const draw = () => {
    updateBall();
    drawCourt();
    drawAimLine();
    drawBall();
    animationId = window.requestAnimationFrame(draw);
  };

  gameCanvas.addEventListener("pointerdown", (event) => {
    const point = getPointerPosition(event);

    if (!pointerHitsBall(point)) {
      return;
    }

    gameCanvas.setPointerCapture(event.pointerId);
    isDragging = true;
    dragPoint = point;
    ball.vx = 0;
    ball.vy = 0;
    hasScoredThisThrow = false;
    setStatus("Laat los om te gooien.");
  });

  gameCanvas.addEventListener("pointermove", (event) => {
    if (!isDragging) {
      return;
    }

    dragPoint = getPointerPosition(event);
  });

  gameCanvas.addEventListener("pointerup", (event) => {
    if (!isDragging || !dragPoint) {
      return;
    }

    const pullX = ball.x - dragPoint.x;
    const pullY = ball.y - dragPoint.y;
    ball.vx = Math.max(-16, Math.min(16, pullX * 0.13));
    ball.vy = Math.max(-18, Math.min(13, pullY * 0.16));
    isDragging = false;
    dragPoint = null;
    gameCanvas.releasePointerCapture(event.pointerId);
    setStatus("Onderweg naar de inbox...");
  });

  gameCanvas.addEventListener("pointercancel", resetBall);

  resetButton?.addEventListener("click", resetGame);

  resetBall();
  syncScore();
  draw();

  window.addEventListener("beforeunload", () => {
    if (animationId) {
      window.cancelAnimationFrame(animationId);
    }
  });
}
