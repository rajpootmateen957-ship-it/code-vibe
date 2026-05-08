import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════
   LOADER
══════════════════════════════════ */
const loaderEl    = document.getElementById('loader');
const loaderCount = document.getElementById('loaderCount');

let progress = 0;

const loadInterval = setInterval(() => {
  progress += Math.random() * 12;
  if (progress >= 100) {
    progress = 100;
    clearInterval(loadInterval);

    // count to 100 then fade out
    gsap.to({}, {
      duration: 0.4,
      delay: 0.3,
      onComplete: () => {
        gsap.to(loaderEl, {
          opacity: 0,
          duration: 1,
          delay: 0.2,
          ease: 'power2.inOut',
          onComplete: () => {
            loaderEl.style.display = 'none';
            introAnimation();
          }
        });
      }
    });
  }

  const n = Math.floor(progress);
  loaderCount.innerText = n < 10 ? '0' + n : n;
}, 70);

/* ══════════════════════════════════
   INTRO ANIMATION
══════════════════════════════════ */
function introAnimation() {
  const heroLines = document.querySelectorAll('.hero-line');
  const eyebrow   = document.querySelector('.hero-eyebrow');
  const heroSub   = document.querySelector('.hero-sub');
  const scrollHint= document.querySelector('.hero-scroll-hint');
  const nav       = document.querySelector('.nav');

  gsap.set([...heroLines, eyebrow, heroSub, scrollHint], {
    y: 60,
    opacity: 0
  });
  gsap.set(nav, { y: -20, opacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to(nav,       { y: 0, opacity: 1, duration: 0.8 })
    .to(eyebrow,   { y: 0, opacity: 1, duration: 0.8 }, '-=0.4')
    .to(heroLines, { y: 0, opacity: 1, duration: 1.1, stagger: 0.12 }, '-=0.5')
    .to(heroSub,   { y: 0, opacity: 1, duration: 0.8 }, '-=0.6')
    .to(scrollHint,{ y: 0, opacity: 1, duration: 0.6 }, '-=0.4');
}

/* ══════════════════════════════════
   CURSOR
══════════════════════════════════ */
const cursor = document.getElementById('cursor');
const dot    = document.getElementById('cursorDot');

window.addEventListener('mousemove', (e) => {
  gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.35, ease: 'power2.out' });
  gsap.to(dot,    { x: e.clientX, y: e.clientY, duration: 0.08 });
});

/* ══════════════════════════════════
   LENIS SMOOTH SCROLL
══════════════════════════════════ */
const lenis = new Lenis({ smoothWheel: true, lerp: 0.08 });

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ══════════════════════════════════
   PROGRESS BAR
══════════════════════════════════ */
const progressBar = document.getElementById('progress');

window.addEventListener('scroll', () => {
  const total   = document.documentElement.scrollHeight - window.innerHeight;
  const percent = (window.scrollY / total) * 100;
  progressBar.style.width = percent + '%';
});

/* ══════════════════════════════════
   NAV SCROLL EFFECT
══════════════════════════════════ */
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

/* ══════════════════════════════════
   VIDEO SCROLL CONTROL
══════════════════════════════════ */
const bgVideo = document.getElementById('bgVideo');
bgVideo.pause();

let videoReady = false;
bgVideo.addEventListener('loadedmetadata', () => { videoReady = true; });

window.addEventListener('scroll', () => {
  if (!videoReady || !bgVideo.duration) return;
  const maxScroll   = document.body.scrollHeight - window.innerHeight;
  const fraction    = window.scrollY / maxScroll;
  bgVideo.currentTime = bgVideo.duration * fraction;
});

/* ══════════════════════════════════
   THREE.JS SETUP
══════════════════════════════════ */
const canvas   = document.getElementById('webgl');
const scene    = new THREE.Scene();

const camera   = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0.5, 7);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);

/* ── LIGHTS ── */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const goldLight = new THREE.PointLight(0xc8a96e, 3, 20);
goldLight.position.set(4, 2, 4);
scene.add(goldLight);

const blueLight = new THREE.PointLight(0x4488ff, 1.5, 20);
blueLight.position.set(-4, -2, 3);
scene.add(blueLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
rimLight.position.set(0, 3, -5);
scene.add(rimLight);

/* ── WIREFRAME CAR (built from primitives) ── */
const carGroup = new THREE.Group();
scene.add(carGroup);

const wireMat = new THREE.MeshBasicMaterial({
  color: 0xc8a96e,
  wireframe: true,
  transparent: true,
  opacity: 0.55
});

const wireMatDim = new THREE.MeshBasicMaterial({
  color: 0x886633,
  wireframe: true,
  transparent: true,
  opacity: 0.25
});

// ─ Body (main hull) ─
const bodyGeo  = new THREE.BoxGeometry(3.2, 0.55, 1.4, 8, 3, 5);
const body     = new THREE.Mesh(bodyGeo, wireMat);
body.position.y = 0.1;
carGroup.add(body);

// ─ Cabin / roof ─
const cabinGeo = new THREE.BoxGeometry(1.8, 0.5, 1.25, 6, 3, 4);
const cabin    = new THREE.Mesh(cabinGeo, wireMat);
cabin.position.set(-0.1, 0.52, 0);
carGroup.add(cabin);

// ─ Front hood slope ─
const hoodGeo = new THREE.CylinderGeometry(0.01, 0.55, 1.0, 6, 3, true);
const hood    = new THREE.Mesh(hoodGeo, wireMatDim);
hood.rotation.z = Math.PI * 0.5;
hood.position.set(1.35, 0.38, 0);
carGroup.add(hood);

// ─ Rear slope ─
const rearGeo = new THREE.CylinderGeometry(0.55, 0.01, 0.85, 6, 3, true);
const rear    = new THREE.Mesh(rearGeo, wireMatDim);
rear.rotation.z = Math.PI * 0.5;
rear.position.set(-1.25, 0.38, 0);
carGroup.add(rear);

// ─ Wheels ─
const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 18, 2);
const wheelMat = new THREE.MeshBasicMaterial({
  color: 0xc8a96e,
  wireframe: true,
  transparent: true,
  opacity: 0.7
});

const wheelPositions = [
  [ 1.15, -0.3,  0.82],
  [ 1.15, -0.3, -0.82],
  [-1.15, -0.3,  0.82],
  [-1.15, -0.3, -0.82]
];

const wheels = [];
wheelPositions.forEach(pos => {
  const w = new THREE.Mesh(wheelGeo, wheelMat);
  w.rotation.x = Math.PI * 0.5;
  w.position.set(...pos);
  carGroup.add(w);
  wheels.push(w);

  // Hub ring
  const hubGeo = new THREE.TorusGeometry(0.2, 0.03, 6, 12);
  const hub    = new THREE.Mesh(hubGeo, wheelMat);
  hub.position.set(...pos);
  carGroup.add(hub);

  // Spoke cross
  const spokeGeo = new THREE.BoxGeometry(0.38, 0.03, 0.03, 4, 1, 1);
  const spoke1   = new THREE.Mesh(spokeGeo, wheelMat);
  spoke1.position.set(...pos);
  carGroup.add(spoke1);

  const spoke2 = new THREE.Mesh(spokeGeo, wheelMat);
  spoke2.position.set(...pos);
  spoke2.rotation.z = Math.PI * 0.5;
  carGroup.add(spoke2);
});

// ─ Windshield lines ─
const windGeo = new THREE.PlaneGeometry(0.9, 0.45, 4, 3);
const windMat = new THREE.MeshBasicMaterial({
  color: 0x88aaff,
  wireframe: true,
  transparent: true,
  opacity: 0.3,
  side: THREE.DoubleSide
});
const windshield = new THREE.Mesh(windGeo, windMat);
windshield.position.set(0.72, 0.62, 0);
windshield.rotation.y = Math.PI * 0.5;
windshield.rotation.z = 0.3;
carGroup.add(windshield);

// ─ Headlights ─
const lightGeo = new THREE.SphereGeometry(0.1, 8, 6);
const lightMat = new THREE.MeshBasicMaterial({ color: 0xfff5cc, transparent: true, opacity: 0.9 });
[-0.38, 0.38].forEach(z => {
  const hl = new THREE.Mesh(lightGeo, lightMat);
  hl.position.set(1.62, 0.05, z);
  carGroup.add(hl);

  // Point light from headlight
  const hLight = new THREE.PointLight(0xfff0aa, 0.8, 4);
  hLight.position.set(1.62, 0.05, z);
  carGroup.add(hLight);
});

// ─ Ground grid ─
const gridHelper = new THREE.GridHelper(12, 20, 0xc8a96e, 0x333222);
gridHelper.position.y = -0.68;
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.18;
scene.add(gridHelper);

// ─ Ground reflection plane ─
const groundGeo = new THREE.PlaneGeometry(12, 6, 1, 1);
const groundMat = new THREE.MeshBasicMaterial({
  color: 0xc8a96e,
  transparent: true,
  opacity: 0.03,
  side: THREE.DoubleSide
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = Math.PI * 0.5;
ground.position.y = -0.68;
scene.add(ground);

/* ── PARTICLES ── */
const particleCount = 200;
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  positions[i * 3]     = (Math.random() - 0.5) * 16;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}

const partGeo = new THREE.BufferGeometry();
partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const partMat = new THREE.PointsMaterial({
  color: 0xc8a96e,
  size: 0.04,
  transparent: true,
  opacity: 0.4,
  sizeAttenuation: true
});

const particles = new THREE.Points(partGeo, partMat);
scene.add(particles);

/* ── CAR PATH ── */
const pathPoints = [
  new THREE.Vector3(0, 0, 0),       // Start at center
  new THREE.Vector3(1.5, -0.3, 0.5), // Curve right and down
  new THREE.Vector3(0.5, -0.8, -0.3), // Curve left
  new THREE.Vector3(-1, -1.2, 0.8),  // Curve left and down
  new THREE.Vector3(0, -1.5, 0),     // Center down
  new THREE.Vector3(0.8, -1.8, -0.5), // Continue down right
  new THREE.Vector3(-0.5, -2.2, 0.3), // Curve left
  new THREE.Vector3(0, -2.5, 0)       // End low
];

const carPath = new THREE.CatmullRomCurve3(pathPoints);
carPath.closed = false;

/* ══════════════════════════════════
   SCROLL-DRIVEN CAR ANIMATION
══════════════════════════════════ */
const maxScroll = () => document.body.scrollHeight - window.innerHeight;

// Map scroll fraction to car states
let targetRotY  = 0;
let targetPosX  = 0;
let targetPosY  = 0;
let targetPosZ  = 0;
let scrollFrac  = 0;

window.addEventListener('scroll', () => {
  scrollFrac = window.scrollY / maxScroll();
});

/* ── TRAIL PARTICLES ── */
const trailCount = 50;
const trailPositions = new Float32Array(trailCount * 3);
const trailGeo = new THREE.BufferGeometry();
trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));

const trailMat = new THREE.PointsMaterial({
  color: 0xffaa44,
  size: 0.08,
  transparent: true,
  opacity: 0.6,
  sizeAttenuation: true
});

const trailParticles = new THREE.Points(trailGeo, trailMat);
scene.add(trailParticles);

let trailHistory = [];

/* ── CAR GLOW EFFECT ── */
const glowLight = new THREE.PointLight(0xffaa44, 2, 8);
glowLight.position.set(0, 0, 0);
scene.add(glowLight);

/* ── SPARKLE PARTICLES ── */
const sparkleCount = 100;
const sparklePositions = new Float32Array(sparkleCount * 3);
const sparkleGeo = new THREE.BufferGeometry();
sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));

const sparkleMat = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.02,
  transparent: true,
  opacity: 0.8,
  sizeAttenuation: true
});

const sparkles = new THREE.Points(sparkleGeo, sparkleMat);
scene.add(sparkles);

/* ══════════════════════════════════
   CHAPTER REVEAL ANIMATIONS (GSAP)
══════════════════════════════════ */
document.querySelectorAll('.chapter-content').forEach(el => {
  gsap.fromTo(el,
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 75%',
        end: 'top 40%',
        scrub: false,
        toggleActions: 'play none none reverse'
      }
    }
  );
});

// Stats counter
document.querySelectorAll('.stat span').forEach(el => {
  const text = el.innerText;
  if (!isNaN(parseInt(text))) {
    const end = parseInt(text);
    gsap.from({ val: 0 }, {
      val: end,
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 80%' },
      onUpdate: function() {
        el.innerText = Math.floor(this.targets()[0].val) + '+';
      }
    });
  }
});

/* ══════════════════════════════════
   ANIMATION LOOP
══════════════════════════════════ */
const clock = new THREE.Clock();
let mouseX = 0, mouseY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

function animate() {
  const elapsed = clock.getElapsedTime();

  // ── Scroll-driven car behavior ──
  const s = scrollFrac;

  let pathProgress = 0;
  let currentScale = 1;

  if (s < 0.25) {
    // Assembly phase: car assembles at start position
    pathProgress = 0; // Stay at start
    currentScale = gsap.utils.mapRange(0, 0.25, 0, 1, s);
  } else {
    // Movement phase: car moves down the path
    pathProgress = gsap.utils.mapRange(0.25, 1, 0, 1, s);
    currentScale = 1;
  }

  // Get position from curved path
  const pathPos = carPath.getPointAt(pathProgress);
  targetPosX = pathPos.x;
  targetPosY = pathPos.y;
  targetPosZ = pathPos.z;

  // Get tangent for rotation
  const tangent = carPath.getTangentAt(pathProgress);
  targetRotY = Math.atan2(tangent.x, tangent.z);

  // Scale based on phase
  carGroup.scale.setScalar(currentScale);

  // Smooth lerp for car
  carGroup.rotation.y += (targetRotY - carGroup.rotation.y) * 0.06;
  carGroup.position.x += (targetPosX - carGroup.position.x) * 0.06;
  carGroup.position.y += (targetPosY - carGroup.position.y) * 0.06;
  carGroup.position.z += (targetPosZ - carGroup.position.z) * 0.06;

  // ── Trail particles ──
  trailHistory.push(carGroup.position.clone());
  if (trailHistory.length > trailCount) {
    trailHistory.shift();
  }

  for (let i = 0; i < trailHistory.length; i++) {
    const pos = trailHistory[i];
    trailPositions[i * 3] = pos.x;
    trailPositions[i * 3 + 1] = pos.y;
    trailPositions[i * 3 + 2] = pos.z;
  }
  trailGeo.attributes.position.needsUpdate = true;

  // ── Glow light follows car ──
  glowLight.position.copy(carGroup.position);
  glowLight.intensity = 1.5 + Math.sin(elapsed * 2) * 0.5;

  // ── Animate sparkles around car ──
  for (let i = 0; i < sparkleCount; i++) {
    const angle = (i / sparkleCount) * Math.PI * 2 + elapsed;
    const radius = 0.5 + Math.sin(elapsed * 3 + i) * 0.2;
    sparklePositions[i * 3] = carGroup.position.x + Math.cos(angle) * radius;
    sparklePositions[i * 3 + 1] = carGroup.position.y + Math.sin(elapsed * 2 + i * 0.1) * 0.3;
    sparklePositions[i * 3 + 2] = carGroup.position.z + Math.sin(angle) * radius;
  }
  sparkleGeo.attributes.position.needsUpdate = true;

  // Subtle mouse-driven tilt
  carGroup.rotation.x += (-mouseY * 0.06 - carGroup.rotation.x) * 0.04;
  carGroup.rotation.z += (-mouseX * 0.02 - carGroup.rotation.z) * 0.04;

  // Float bob
  carGroup.position.y += Math.sin(elapsed * 0.8) * 0.003;

  // Spin wheels
  wheels.forEach(w => { w.rotation.y += 0.04; });

  // Oscillating lights
  goldLight.intensity = 2.5 + Math.sin(elapsed * 1.2) * 0.8;
  goldLight.position.x = 4 + Math.sin(elapsed * 0.5) * 1;

  // Drift particles slowly
  particles.rotation.y = elapsed * 0.015;
  particles.rotation.x = elapsed * 0.008;

  // Grid scroll with car
  gridHelper.position.z = (elapsed * 0.3) % 0.6;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

/* ══════════════════════════════════
   RESIZE
══════════════════════════════════ */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});