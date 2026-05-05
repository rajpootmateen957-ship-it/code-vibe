// ============================================================
//  SCRIPT.JS  —  Cursor + Canvas Particles + GSAP Animations
// ============================================================

// ─── 1. GSAP SETUP ──────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger);

// ─── 2. CUSTOM CURSOR ───────────────────────────────────────
const dot     = document.querySelector('.cursor-dot');
const outline = document.querySelector('.cursor-outline');

let mouseX = 0, mouseY = 0;
let outlineX = 0, outlineY = 0;

// Mouse position track karna
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  // Dot instantly follow kare
  gsap.to(dot, {
    x: mouseX,
    y: mouseY,
    duration: 0,
  });
});

// Outline smoothly follow kare (lag effect)
function animateCursor() {
  outlineX += (mouseX - outlineX) * 0.12;
  outlineY += (mouseY - outlineY) * 0.12;

  gsap.set(outline, { x: outlineX, y: outlineY });
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Hover pe cursor bada ho jata hai
const hoverTargets = document.querySelectorAll('a, .work-item, button');
hoverTargets.forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ─── 3. CANVAS PARTICLES ─────────────────────────────────────
const canvas  = document.getElementById('canvas');
const ctx     = canvas.getContext('2d');

let W = canvas.width  = window.innerWidth;
let H = canvas.height = window.innerHeight;

// Mouse position (canvas ke liye)
let mx = W / 2;
let my = H / 2;

window.addEventListener('mousemove', (e) => {
  mx = e.clientX;
  my = e.clientY;
});

// Particle class
class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    // Random position
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;

    // Original position (mouse se door jaane ke baad wapas aaye ga)
    this.ox = this.x;
    this.oy = this.y;

    // Size aur opacity
    this.size    = Math.random() * 2 + 0.5;
    this.opacity = Math.random() * 0.6 + 0.1;

    // Speed
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
  }

  update() {
    // Mouse se distance
    const dx   = mx - this.x;
    const dy   = my - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Mouse ke paas aane pe particle door bhag jata hai
    const repelRadius = 120;
    if (dist < repelRadius) {
      const force  = (repelRadius - dist) / repelRadius;
      const angle  = Math.atan2(dy, dx);
      this.x -= Math.cos(angle) * force * 4;
      this.y -= Math.sin(angle) * force * 4;
    }

    // Apni original position pe wapas aana (easing)
    this.x += (this.ox - this.x) * 0.05;
    this.y += (this.oy - this.y) * 0.05;

    // Slow floating movement
    this.ox += this.vx;
    this.oy += this.vy;

    // Boundary check
    if (this.ox < 0 || this.ox > W) this.vx *= -1;
    if (this.oy < 0 || this.oy > H) this.vy *= -1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.fill();
  }
}

// 150 particles banao
const particles = [];
for (let i = 0; i < 150; i++) {
  particles.push(new Particle());
}

// Mouse ke paas particles ko connect karne wali lines
function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    const dx   = mx - particles[i].x;
    const dy   = my - particles[i].y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 150) {
      ctx.beginPath();
      ctx.moveTo(particles[i].x, particles[i].y);
      ctx.lineTo(mx, my);
      ctx.strokeStyle = `rgba(255,255,255,${0.15 * (1 - dist / 150)})`;
      ctx.lineWidth   = 0.5;
      ctx.stroke();
    }

    // Particle se particle connection (close hone pe)
    for (let j = i + 1; j < particles.length; j++) {
      const dx2   = particles[i].x - particles[j].x;
      const dy2   = particles[i].y - particles[j].y;
      const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

      if (dist2 < 80) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(255,255,255,${0.08 * (1 - dist2 / 80)})`;
        ctx.lineWidth   = 0.3;
        ctx.stroke();
      }
    }
  }
}

// Animation loop
function animate() {
  ctx.clearRect(0, 0, W, H);

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  drawConnections();
  requestAnimationFrame(animate);
}
animate();

// Resize handle karna
window.addEventListener('resize', () => {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  particles.forEach(p => p.reset());
});

// ─── 4. HERO TEXT ANIMATION ──────────────────────────────────
// Page load pe text neeche se upar aata hai
gsap.to('.hero-title .line', {
  y: 0,
  duration: 1.2,
  ease: 'power4.out',
  stagger: 0.15,    // Pehle "Creative" phir "Developer"
  delay: 0.3,
});

gsap.to('.hero-sub', {
  opacity: 1,
  duration: 1,
  ease: 'power2.out',
  delay: 1,
});

// ─── 5. SCROLL ANIMATIONS (ScrollTrigger) ────────────────────
// Har .reveal-text scroll pe appear hoti hai
gsap.utils.toArray('.reveal-text').forEach(el => {
  gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',   // Element 85% viewport mein aaye
      toggleActions: 'play none none none',
    }
  });
});

// ─── 6. PARALLAX on HERO ─────────────────────────────────────
// Hero content mouse movement pe thoda hilti hai
const heroContent = document.querySelector('.hero-content');
window.addEventListener('mousemove', (e) => {
  const xPercent = (e.clientX / W - 0.5) * 20;  // -10 to +10
  const yPercent = (e.clientY / H - 0.5) * 10;  // -5 to +5

  gsap.to(heroContent, {
    x: xPercent,
    y: yPercent,
    duration: 1.5,
    ease: 'power2.out',
  });
});