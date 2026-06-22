const gifChips = Array.from(document.querySelectorAll(".gif-chip"));
const reactionGifs = Array.from(document.querySelectorAll(".reaction-gif"));
const celebrationCanvas = document.getElementById("celebrationCanvas");
const celebrationContext = celebrationCanvas ? celebrationCanvas.getContext("2d") : null;

let confettiPieces = [];
let fireworks = [];
let celebrationFrame = null;
let celebrationStart = 0;
let lastFireworkTime = 0;

function setGifMode(mode) {
  gifChips.forEach((chip) => {
    const isActive = chip.dataset.gif === mode;
    chip.classList.toggle("active", isActive);
    chip.setAttribute("aria-pressed", String(isActive));
  });

  reactionGifs.forEach((gif) => {
    gif.classList.toggle("active", gif.dataset.gif === mode);
  });
}

window.setGifMode = setGifMode;

function resizeCelebrationCanvas() {
  if (!celebrationCanvas) {
    return;
  }
  celebrationCanvas.width = window.innerWidth;
  celebrationCanvas.height = window.innerHeight;
}

function spawnConfettiBurst(count = 140) {
  if (!celebrationCanvas) {
    return;
  }

  for (let index = 0; index < count; index += 1) {
    confettiPieces.push({
      x: Math.random() * celebrationCanvas.width,
      y: -20 - Math.random() * celebrationCanvas.height * 0.25,
      size: 5 + Math.random() * 8,
      speedY: 1.8 + Math.random() * 3.8,
      speedX: -2 + Math.random() * 4,
      rotation: Math.random() * Math.PI,
      rotationSpeed: -0.15 + Math.random() * 0.3,
      color: ["#c7613d", "#ffd166", "#86a89a", "#304754", "#fff8f3"][Math.floor(Math.random() * 5)],
    });
  }
}

function spawnFirework() {
  if (!celebrationCanvas) {
    return;
  }

  const burstX = celebrationCanvas.width * (0.18 + Math.random() * 0.64);
  const burstY = celebrationCanvas.height * (0.12 + Math.random() * 0.34);
  const palette = ["#ffd166", "#f4976c", "#86a89a", "#9bb9ff", "#fff8f3"];

  fireworks.push({
    particles: Array.from({ length: 26 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.4 + Math.random() * 3.2;
      return {
        x: burstX,
        y: burstY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.012 + Math.random() * 0.018,
        radius: 2 + Math.random() * 2.5,
        color: palette[Math.floor(Math.random() * palette.length)],
      };
    }),
  });
}

function drawCelebration() {
  if (!celebrationCanvas || !celebrationContext) {
    return;
  }

  const now = performance.now();
  const elapsed = now - celebrationStart;

  celebrationContext.clearRect(0, 0, celebrationCanvas.width, celebrationCanvas.height);

  confettiPieces.forEach((piece) => {
    piece.x += piece.speedX;
    piece.y += piece.speedY;
    piece.rotation += piece.rotationSpeed;

    celebrationContext.save();
    celebrationContext.translate(piece.x, piece.y);
    celebrationContext.rotate(piece.rotation);
    celebrationContext.fillStyle = piece.color;
    celebrationContext.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.64);
    celebrationContext.restore();
  });

  confettiPieces = confettiPieces.filter((piece) => piece.y < celebrationCanvas.height + 30);

  if (elapsed < 4200 && now - lastFireworkTime > 380) {
    spawnFirework();
    lastFireworkTime = now;
  }

  fireworks.forEach((burst) => {
    burst.particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.015;
      particle.life -= particle.decay;

      celebrationContext.save();
      celebrationContext.globalAlpha = Math.max(particle.life, 0);
      celebrationContext.fillStyle = particle.color;
      celebrationContext.beginPath();
      celebrationContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      celebrationContext.fill();
      celebrationContext.restore();
    });

    burst.particles = burst.particles.filter((particle) => particle.life > 0);
  });

  fireworks = fireworks.filter((burst) => burst.particles.length > 0);

  if (elapsed < 6500 || confettiPieces.length > 0 || fireworks.length > 0) {
    celebrationFrame = requestAnimationFrame(drawCelebration);
  } else {
    celebrationContext.clearRect(0, 0, celebrationCanvas.width, celebrationCanvas.height);
    celebrationFrame = null;
  }
}

function startCelebration() {
  if (!celebrationCanvas || !celebrationContext) {
    return;
  }

  if (celebrationFrame) {
    cancelAnimationFrame(celebrationFrame);
  }

  resizeCelebrationCanvas();
  confettiPieces = [];
  fireworks = [];
  celebrationStart = performance.now();
  lastFireworkTime = 0;
  spawnConfettiBurst();
  spawnFirework();
  celebrationFrame = requestAnimationFrame(drawCelebration);
}

gifChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    setGifMode(chip.dataset.gif);
  });
});

if (celebrationCanvas) {
  window.addEventListener("resize", resizeCelebrationCanvas);
  startCelebration();
}
