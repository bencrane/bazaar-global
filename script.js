// Canvas & Starfield Animation Setup
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

let width, height;
let stars = [];
let shootingStars = [];
let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;

// Resize Handler
function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initStars();
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', (e) => {
  targetMouseX = (e.clientX - window.innerWidth / 2) * 0.03;
  targetMouseY = (e.clientY - window.innerHeight / 2) * 0.03;
});

// Click to spawn a shooting star
window.addEventListener('click', (e) => {
  spawnShootingStar(e.clientX, e.clientY);
});

// Star Class
class Star {
  constructor(x, y, radius, alpha, twinkleSpeed) {
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.radius = radius;
    this.alpha = alpha;
    this.baseAlpha = alpha;
    this.twinkleSpeed = twinkleSpeed;
    this.twinkleOffset = Math.random() * Math.PI * 2;
  }

  update(time) {
    // Twinkle effect
    this.alpha = this.baseAlpha + Math.sin(time * this.twinkleSpeed + this.twinkleOffset) * 0.25;
    if (this.alpha < 0.05) this.alpha = 0.05;
    if (this.alpha > 0.95) this.alpha = 0.95;

    // Parallax effect
    this.x = this.baseX + mouseX * (this.radius * 0.5);
    this.y = this.baseY + mouseY * (this.radius * 0.5);
  }

  draw() {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220, 230, 255, ${this.alpha})`;
    ctx.fill();
    ctx.restore();
  }
}

// Shooting Star Class (Fast, Ultra-Long, Sharp Needle Streaks)
class ShootingStar {
  constructor(startX, startY) {
    // Angle: 0.30 to 0.45 rad (~17° - 25° downward slope, moving Left to Right)
    this.angle = 0.35 + (Math.random() - 0.5) * 0.12;
    this.speed = (Math.random() * 8 + 14) * 0.88; // 12% slower (12.3 - 19.36 px/frame)
    this.length = Math.random() * 200 + 300; // Ultra long, sleek tail (300px - 500px)
    
    if (startX !== undefined && startY !== undefined) {
      this.x = startX;
      this.y = startY;
    } else {
      const fromTop = Math.random() < 0.6;
      if (fromTop) {
        this.x = Math.random() * (width * 0.7) - 200;
        this.y = -100;
      } else {
        this.x = -200;
        this.y = Math.random() * (height * 0.5) - 50;
      }
    }
    
    this.dx = Math.cos(this.angle) * this.speed;
    this.dy = Math.sin(this.angle) * this.speed;
    
    this.life = 0;
    this.maxLife = Math.random() * 45 + 80; // Adjusted for 12% slower travel
    this.opacity = Math.random() * 0.5 + 0.45;
    this.width = Math.random() * 0.6 + 0.9; // Thin, sharp needle stroke
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
    this.life++;
  }

  draw() {
    const tailX = this.x - Math.cos(this.angle) * this.length;
    const tailY = this.y - Math.sin(this.angle) * this.length;

    // Smooth opacity curve
    let currentOpacity = this.opacity;
    const fadeIn = 12;
    const fadeOut = 25;

    if (this.life < fadeIn) {
      currentOpacity *= (this.life / fadeIn);
    } else if (this.life > this.maxLife - fadeOut) {
      currentOpacity *= ((this.maxLife - this.life) / fadeOut);
    }

    if (currentOpacity <= 0) return;

    ctx.save();
    
    // Sharp needle gradient tail
    const gradient = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity})`);
    gradient.addColorStop(0.08, `rgba(220, 235, 255, ${currentOpacity * 0.85})`);
    gradient.addColorStop(0.35, `rgba(160, 195, 255, ${currentOpacity * 0.45})`);
    gradient.addColorStop(0.75, `rgba(120, 160, 240, ${currentOpacity * 0.1})`);
    gradient.addColorStop(1, 'rgba(100, 140, 220, 0)');

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(tailX, tailY);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = this.width;
    ctx.lineCap = 'butt';
    ctx.stroke();

    // Sharp glowing tip (no rounded blob)
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
    ctx.shadowColor = 'rgba(200, 230, 255, 0.9)';
    ctx.shadowBlur = 4;
    ctx.fill();

    ctx.restore();
  }

  isDead() {
    return (
      this.life >= this.maxLife ||
      this.x > width + 400 ||
      this.y > height + 400
    );
  }
}

// Initialize Starfield
function initStars() {
  stars = [];
  const numStars = Math.floor((width * height) / 4500);

  // Single scattered stars
  for (let i = 0; i < numStars; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = Math.random() * 0.9 + 0.4;
    const alpha = Math.random() * 0.6 + 0.2;
    const twinkleSpeed = Math.random() * 0.002 + 0.001;
    stars.push(new Star(x, y, radius, alpha, twinkleSpeed));
  }

  // Constellation clusters
  const numClusters = Math.floor(width / 320);
  for (let c = 0; c < numClusters; c++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const clusterSize = Math.floor(Math.random() * 4) + 3;

    for (let s = 0; s < clusterSize; s++) {
      const offsetX = (Math.random() - 0.5) * 45;
      const offsetY = (Math.random() - 0.5) * 45;
      const radius = Math.random() * 0.8 + 0.5;
      const alpha = Math.random() * 0.5 + 0.3;
      const twinkleSpeed = Math.random() * 0.002 + 0.001;
      stars.push(new Star(cx + offsetX, cy + offsetY, radius, alpha, twinkleSpeed));
    }
  }
}

// Spawn shooting star
function spawnShootingStar(customX, customY) {
  shootingStars.push(new ShootingStar(customX, customY));
}

// Maintain shooting stars (Infrequent, sleek, elegant bursts)
let lastSpawnTime = 0;
function manageShootingStars(timestamp) {
  // Spawn every 2.0s to 3.8s
  if (timestamp - lastSpawnTime > Math.random() * 1800 + 2000) {
    if (shootingStars.length < 3) {
      spawnShootingStar();
    }
    lastSpawnTime = timestamp;
  }
}

// Main Animation Loop
function animate(timestamp) {
  // Smooth mouse interpolation for parallax
  mouseX += (targetMouseX - mouseX) * 0.05;
  mouseY += (targetMouseY - mouseY) * 0.05;

  // Clear Canvas
  ctx.fillStyle = '#03050d';
  ctx.fillRect(0, 0, width, height);

  // Static Stars
  const timeSeconds = timestamp * 0.001;
  for (let star of stars) {
    star.update(timeSeconds);
    star.draw();
  }

  // Shooting Stars
  manageShootingStars(timestamp);
  
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const shootingStar = shootingStars[i];
    shootingStar.update();
    shootingStar.draw();

    if (shootingStar.isDead()) {
      shootingStars.splice(i, 1);
    }
  }

  requestAnimationFrame(animate);
}

// Start
resize();
// Seed 1 sharp streak on load
setTimeout(() => spawnShootingStar(), 400);
requestAnimationFrame(animate);
