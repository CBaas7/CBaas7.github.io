const gameCanvas = document.querySelector("[data-contact-game]");

if (gameCanvas) {
  const context = gameCanvas.getContext("2d");
  const scoreElement = document.querySelector("[data-game-score]");
  const statusElement = document.querySelector("[data-game-status]");
  const resetButton = document.querySelector("[data-game-reset]");
  const gravity = 0.36;
  const friction = 0.99;
  const ballRadius = 20;
  let score = 0;
  let isDragging = false;
  let dragPoint = null;
  let hasScoredThisThrow = false;
  let hasKicked = false;
  let roundResetTimer = null;
  let animationId = null;
  let popupMessage = "";
  const pointsPerKick = 1;
  const reactionInterval = 5;
  const winningScore = 100;
  const rugbyJokes = [
    "Raak. De palen deden hun werk en stonden vooral in de weg.",
    "Score. De bal had eindelijk Google Maps aan.",
    "Raak. Zelfs de grasmat keek onder de indruk.",
    "Raak. De palen hebben dit netjes toegelaten.",
    "Tussen de palen. Verdacht professioneel.",
    "Perfecte kick. De natuurkunde werkt blijkbaar soms mee.",
    "Score. De bal had vandaag duidelijk zijn huiswerk gedaan.",
    "Raak. Zelfs de wind dacht: deze laat ik gaan.",
    "Score. Iemand bel de scout, maar rustig aan.",
    "Raak. De bal koos voor karakterontwikkeling.",
    "Tussen de palen. Dit komt vast door talent, of toeval.",
    "Score. De palen waren zo vriendelijk om niet te bewegen.",
    "Perfect. De bal leek even te weten wat de bedoeling was.",
    "Score. Dat was bijna te netjes voor deze website.",
    "Raak. De palen hebben officieel akkoord gegeven.",
    "Tussen de palen. Het publiek in gedachten wordt wild.",
    "Score. De bal had een zeldzaam moment van focus.",
    "Raak. Dit wordt later zwaar overdreven naverteld.",
    "Perfecte kick. De bal mag dit op zijn cv zetten.",
    "Score. De palen staan er nog van bij te komen.",
    "Rugbyfeitje: de bal stuitert zo raar omdat zelfs hij contact probeert te vermijden.",
    "Waarom nam de rugbyer een ladder mee? Voor een hogere conversie.",
    "Deze kick was zo strak dat zelfs de palen even respectvol stil stonden.",
  ];
  const retryMessage = "Dat schot had meer ambitie dan richting.";
  const winningMessage = "Leuk geprobeerd, maar begin maar helemaal opnieuw.";

  const pitchGround = gameCanvas.height - 66;
  const ballStart = { x: 155, y: pitchGround - 21 };
  const goal = {
    leftPost: gameCanvas.width - 230,
    rightPost: gameCanvas.width - 86,
    crossbarY: 250,
    postTop: 62,
    groundY: pitchGround,
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

  const showPopup = (message) => {
    popupMessage = message;
  };

  const syncScore = () => {
    if (scoreElement) {
      scoreElement.textContent = score;
    }
  };

  const resetBall = () => {
    window.clearTimeout(roundResetTimer);
    roundResetTimer = null;
    ball.x = ballStart.x;
    ball.y = ballStart.y;
    ball.vx = 0;
    ball.vy = 0;
    dragPoint = null;
    isDragging = false;
    hasScoredThisThrow = false;
    hasKicked = false;
  };

  const resetRound = () => {
    window.clearTimeout(roundResetTimer);
    roundResetTimer = window.setTimeout(() => {
      resetBall();
      setStatus("Sleep de rugbybal naar achteren, richt tussen de palen en laat los.");
    }, 800);
  };

  const resetGame = () => {
    score = 0;
    popupMessage = "";
    syncScore();
    resetBall();
    setStatus("Sleep de rugbybal naar achteren, richt tussen de palen en laat los.");
  };

  const resetAfterWin = () => {
    window.clearTimeout(roundResetTimer);
    roundResetTimer = window.setTimeout(() => {
      score = 0;
      syncScore();
      resetBall();
      setStatus("Sleep de rugbybal naar achteren, richt tussen de palen en laat los.");
    }, 1600);
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

  const drawPitch = () => {
    context.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    context.fillStyle = "rgba(34, 139, 92, 0.42)";
    context.fillRect(0, pitchGround, gameCanvas.width, gameCanvas.height - pitchGround);

    context.strokeStyle = "rgba(245, 240, 230, 0.22)";
    context.lineWidth = 2;
    for (let lineX = 80; lineX < gameCanvas.width; lineX += 120) {
      context.beginPath();
      context.moveTo(lineX, pitchGround);
      context.lineTo(lineX + 48, gameCanvas.height);
      context.stroke();
    }

    context.strokeStyle = "rgba(184, 199, 217, 0.18)";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, pitchGround);
    context.lineTo(gameCanvas.width, pitchGround);
    context.stroke();

    context.strokeStyle = "rgba(245, 240, 230, 0.9)";
    context.lineWidth = 8;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(goal.leftPost, goal.groundY);
    context.lineTo(goal.leftPost, goal.postTop);
    context.moveTo(goal.rightPost, goal.groundY);
    context.lineTo(goal.rightPost, goal.postTop);
    context.moveTo(goal.leftPost, goal.crossbarY);
    context.lineTo(goal.rightPost, goal.crossbarY);
    context.stroke();
    context.lineCap = "butt";

    context.fillStyle = "rgba(240, 217, 154, 0.85)";
    context.font = "700 18px Arial";
    context.fillText("CONTACT", goal.leftPost + 16, goal.crossbarY + 34);
  };

  const getWrappedLines = (text, maxWidth) => {
    const words = text.split(" ");
    const lines = [];
    let line = "";

    words.forEach((word) => {
      const testLine = line ? `${line} ${word}` : word;

      if (context.measureText(testLine).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    });

    if (line) {
      lines.push(line);
    }

    return lines;
  };

  const drawPopup = () => {
    if (!popupMessage) {
      return;
    }

    const popupWidth = 330;
    const popupX = 24;
    const popupY = 24;
    const padding = 16;

    context.save();
    context.font = "700 16px Arial";
    const lines = getWrappedLines(popupMessage, popupWidth - padding * 2);
    const popupHeight = padding * 2 + lines.length * 22;

    context.fillStyle = "rgba(5, 11, 31, 0.88)";
    context.strokeStyle = "rgba(240, 217, 154, 0.76)";
    context.lineWidth = 2;
    context.beginPath();
    context.roundRect(popupX, popupY, popupWidth, popupHeight, 8);
    context.fill();
    context.stroke();

    context.fillStyle = "rgba(245, 240, 230, 0.95)";
    lines.forEach((line, index) => {
      context.fillText(line, popupX + padding, popupY + padding + 16 + index * 22);
    });

    context.restore();
  };

  const drawPlayer = () => {
    const footX = ballStart.x - 54;
    const footY = pitchGround - 1;

    context.strokeStyle = "rgba(245, 240, 230, 0.92)";
    context.lineWidth = 7;
    context.lineCap = "round";

    context.beginPath();
    context.arc(footX, footY - 92, 17, 0, Math.PI * 2);
    context.stroke();

    context.beginPath();
    context.moveTo(footX, footY - 72);
    context.lineTo(footX + 9, footY - 38);
    context.moveTo(footX - 24, footY - 60);
    context.lineTo(footX + 22, footY - 54);
    context.moveTo(footX + 9, footY - 38);
    context.lineTo(footX - 14, footY - 3);
    context.moveTo(footX + 9, footY - 38);
    context.lineTo(footX + 46, footY - 10);
    context.stroke();

    context.strokeStyle = "rgba(216, 183, 106, 0.9)";
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(footX - 12, footY - 73);
    context.lineTo(footX + 13, footY - 66);
    context.stroke();
    context.lineCap = "butt";
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

  const drawRugbyBall = () => {
    const angle = Math.atan2(ball.vy, ball.vx || 1) * 0.25;
    const gradient = context.createRadialGradient(ball.x - 7, ball.y - 8, 3, ball.x, ball.y, ballRadius);
    gradient.addColorStop(0, "#f0d99a");
    gradient.addColorStop(1, "#8f4a24");

    context.save();
    context.translate(ball.x, ball.y);
    context.rotate(angle);
    context.fillStyle = gradient;
    context.beginPath();
    context.ellipse(0, 0, ballRadius + 7, ballRadius - 6, 0, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = "rgba(5, 11, 31, 0.58)";
    context.lineWidth = 2;
    context.stroke();

    context.strokeStyle = "rgba(245, 240, 230, 0.78)";
    context.beginPath();
    context.moveTo(-9, -7);
    context.lineTo(9, 7);
    context.moveTo(-2, -5);
    context.lineTo(4, 1);
    context.moveTo(-6, 0);
    context.lineTo(0, 6);
    context.stroke();
    context.restore();
  };

  const checkScore = () => {
    const betweenPosts = ball.x > goal.leftPost + 12 && ball.x < goal.rightPost - 12;
    const aboveCrossbar = ball.y < goal.crossbarY - 12;
    const nearGoalLine = ball.x > goal.leftPost - 8 && ball.x < goal.rightPost + 8;

    if (hasKicked && betweenPosts && aboveCrossbar && nearGoalLine && !hasScoredThisThrow) {
      score += pointsPerKick;
      hasScoredThisThrow = true;
      syncScore();
      setStatus("Tussen de palen.");
      const jokeIndex = Math.floor(score / reactionInterval - 1) % rugbyJokes.length;

      if (score >= winningScore) {
        score = winningScore;
        syncScore();
        showPopup(`${rugbyJokes[jokeIndex]} ${winningMessage}`);
        resetAfterWin();
        return;
      }

      if (score > 0 && score % reactionInterval === 0) {
        showPopup(rugbyJokes[jokeIndex]);
      }

      resetRound();
    }
  };

  const checkMiss = () => {
    const ballIsResting = Math.abs(ball.vx) < 0.2 && Math.abs(ball.vy) < 1.3 && ball.y >= pitchGround - ballRadius - 0.5;
    const passedGoal = ball.x > goal.rightPost + 50;

    if (hasKicked && !hasScoredThisThrow && (ballIsResting || passedGoal)) {
      hasScoredThisThrow = true;
      score = 0;
      syncScore();
      setStatus("Mis. Score terug naar 0.");
      showPopup(retryMessage);
      resetRound();
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

    if (ball.y > pitchGround - ballRadius) {
      ball.y = pitchGround - ballRadius;
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
    checkMiss();
  };

  const draw = () => {
    updateBall();
    drawPitch();
    drawPlayer();
    drawAimLine();
    drawRugbyBall();
    drawPopup();
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
    window.clearTimeout(roundResetTimer);
    roundResetTimer = null;
    popupMessage = "";
    setStatus("Laat los om te kicken.");
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
    hasKicked = true;
    isDragging = false;
    dragPoint = null;
    gameCanvas.releasePointerCapture(event.pointerId);
    setStatus("De bal vliegt richting de palen...");
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
