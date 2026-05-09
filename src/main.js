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

  // Car assembly animation - parts move to form the vehicle
  tl.add(() => {
    carParts.forEach((part, i) => {
      gsap.to(part.mesh.position, {
        x: part.finalPos.x,
        y: part.finalPos.y,
        z: part.finalPos.z,
        duration: 2,
        delay: i * 0.12,
        ease: 'power2.out'
      });
      gsap.to(part.mesh.material, {
        opacity: part.finalOpacity,
        duration: 2,
        delay: i * 0.12,
        ease: 'power2.out'
      });
    });
  }, '-=1'); // Start assembly a bit before text finishes
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
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const goldLight = new THREE.PointLight(0xc8a96e, 4, 25);
goldLight.position.set(5, 3, 5);
scene.add(goldLight);

const blueLight = new THREE.PointLight(0x4488ff, 2.5, 25);
blueLight.position.set(-5, -1, 4);
scene.add(blueLight);

const purpleLight = new THREE.PointLight(0xaa44ff, 2, 20);
purpleLight.position.set(2, 2, -4);
scene.add(purpleLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
rimLight.position.set(0, 4, -6);
scene.add(rimLight);

/* ── WIREFRAME CAR (built from primitives) ── */
const carGroup = new THREE.Group();
scene.add(carGroup);

const wireMat = new THREE.MeshBasicMaterial({
  color: 0xffdd66,
  wireframe: true,
  transparent: true,
  opacity: 0.75
});

const wireMatDim = new THREE.MeshBasicMaterial({
  color: 0xcc8844,
  wireframe: true,
  transparent: true,
  opacity: 0.25
});

const carParts = []; // Array to hold all parts for animation

// ─ Body (main hull) ─
const bodyGeo  = new THREE.BoxGeometry(3.2, 0.55, 1.4, 8, 3, 5);
const body     = new THREE.Mesh(bodyGeo, wireMat);
body.position.set(0, -10, 0); // Start scattered
body.material.opacity = 0;
carGroup.add(body);
carParts.push({ mesh: body, finalPos: new THREE.Vector3(0, 0.1, 0), finalOpacity: 0.55 });

// ─ Cabin / roof ─
const cabinGeo = new THREE.BoxGeometry(1.8, 0.5, 1.25, 6, 3, 4);
const cabin    = new THREE.Mesh(cabinGeo, wireMat);
cabin.position.set(5, -10, 5); // Scattered
cabin.material.opacity = 0;
carGroup.add(cabin);
carParts.push({ mesh: cabin, finalPos: new THREE.Vector3(-0.1, 0.52, 0), finalOpacity: 0.55 });

// ─ Front hood slope ─
const hoodGeo = new THREE.CylinderGeometry(0.01, 0.55, 1.0, 6, 3, true);
const hood    = new THREE.Mesh(hoodGeo, wireMatDim);
hood.rotation.z = Math.PI * 0.5;
hood.position.set(10, -10, 0); // Scattered
hood.material.opacity = 0;
carGroup.add(hood);
carParts.push({ mesh: hood, finalPos: new THREE.Vector3(1.35, 0.38, 0), finalOpacity: 0.25 });

// ─ Rear slope ─
const rearGeo = new THREE.CylinderGeometry(0.55, 0.01, 0.85, 6, 3, true);
const rear    = new THREE.Mesh(rearGeo, wireMatDim);
rear.rotation.z = Math.PI * 0.5;
rear.position.set(-5, -10, -5); // Scattered
rear.material.opacity = 0;
carGroup.add(rear);
carParts.push({ mesh: rear, finalPos: new THREE.Vector3(-1.25, 0.38, 0), finalOpacity: 0.25 });

// ─ Wheels ─
const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 18, 2);
const wheelMat = new THREE.MeshBasicMaterial({
  color: 0xff9944,
  wireframe: true,
  transparent: true,
  opacity: 0.85
});

const wheelPositions = [
  [ 1.15, -0.3,  0.82],
  [ 1.15, -0.3, -0.82],
  [-1.15, -0.3,  0.82],
  [-1.15, -0.3, -0.82]
];

const wheels = [];
wheelPositions.forEach((pos, i) => {
  const w = new THREE.Mesh(wheelGeo, wheelMat);
  w.rotation.x = Math.PI * 0.5;
  w.position.set(Math.random()*20 - 10, -10, Math.random()*20 - 10); // Scattered
  w.material.opacity = 0;
  carGroup.add(w);
  wheels.push(w);
  carParts.push({ mesh: w, finalPos: new THREE.Vector3(...pos), finalOpacity: 0.7 });

  // Hub ring
  const hubGeo = new THREE.TorusGeometry(0.2, 0.03, 6, 12);
  const hub    = new THREE.Mesh(hubGeo, wheelMat);
  hub.position.copy(w.position);
  hub.material.opacity = 0;
  carGroup.add(hub);
  carParts.push({ mesh: hub, finalPos: new THREE.Vector3(...pos), finalOpacity: 0.7 });

  // Spoke cross
  const spokeGeo = new THREE.BoxGeometry(0.38, 0.03, 0.03, 4, 1, 1);
  const spoke1   = new THREE.Mesh(spokeGeo, wheelMat);
  spoke1.position.copy(w.position);
  spoke1.material.opacity = 0;
  carGroup.add(spoke1);
  carParts.push({ mesh: spoke1, finalPos: new THREE.Vector3(...pos), finalOpacity: 0.7 });

  const spoke2 = new THREE.Mesh(spokeGeo, wheelMat);
  spoke2.position.copy(w.position);
  spoke2.rotation.z = Math.PI * 0.5;
  spoke2.material.opacity = 0;
  carGroup.add(spoke2);
  carParts.push({ mesh: spoke2, finalPos: new THREE.Vector3(...pos), finalOpacity: 0.7 });
});

// ─ Windshield lines ─
const windGeo = new THREE.PlaneGeometry(0.9, 0.45, 4, 3);
const windMat = new THREE.MeshBasicMaterial({
  color: 0x88aaff,
  wireframe: true,
  transparent: true,
  opacity: 0,
  side: THREE.DoubleSide
});
const windshield = new THREE.Mesh(windGeo, windMat);
windshield.position.set(-10, -10, 10); // Scattered
windshield.rotation.y = Math.PI * 0.5;
windshield.rotation.z = 0.3;
carGroup.add(windshield);
carParts.push({ mesh: windshield, finalPos: new THREE.Vector3(0.72, 0.62, 0), finalOpacity: 0.3 });

// ─ Headlights ─
const lightGeo = new THREE.SphereGeometry(0.1, 8, 6);
const lightMat = new THREE.MeshBasicMaterial({ color: 0xfff5cc, transparent: true, opacity: 0 });
const headlights = [];
const headlightLights = [];
[-0.38, 0.38].forEach((z, i) => {
  const hl = new THREE.Mesh(lightGeo, lightMat);
  hl.position.set(Math.random()*20 - 10, -10, Math.random()*20 - 10); // Scattered
  carGroup.add(hl);
  headlights.push(hl);
  carParts.push({ mesh: hl, finalPos: new THREE.Vector3(1.62, 0.05, z), finalOpacity: 0.9 });

  // Point light from headlight
  const hLight = new THREE.PointLight(0xfff0aa, 0.8, 4);
  hLight.position.copy(hl.position);
  carGroup.add(hLight);
  headlightLights.push(hLight);
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
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0.3, -0.05, -1.2),
  new THREE.Vector3(-0.4, -0.1, -2.4),
  new THREE.Vector3(0.2, -0.15, -3.8),
  new THREE.Vector3(0, -0.2, -5.2)
];

const carPath = new THREE.CatmullRomCurve3(pathPoints);
carPath.closed = false;
const driveStart = 0.15; // Keep car assembled before driving
const driveEnd = 1.0;
// Mountains
const mountainGeo = new THREE.ConeGeometry(3, 4, 6);
const mountainMat = new THREE.MeshBasicMaterial({
  color: 0x1a1a1a,
  transparent: true,
  opacity: 0.3
});

const mountains = [];
for (let i = 0; i < 5; i++) {
  const mountain = new THREE.Mesh(mountainGeo, mountainMat);
  mountain.position.set(
    (Math.random() - 0.5) * 20,
    -2,
    -8 + Math.random() * 4
  );
  mountain.scale.setScalar(0.5 + Math.random() * 0.5);
  scene.add(mountain);
  mountains.push(mountain);
}

// Hills
const hillGeo = new THREE.SphereGeometry(2, 8, 6);
const hillMat = new THREE.MeshBasicMaterial({
  color: 0x0f0f0f,
  transparent: true,
  opacity: 0.2
});

const hills = [];
for (let i = 0; i < 8; i++) {
  const hill = new THREE.Mesh(hillGeo, hillMat);
  hill.position.set(
    (Math.random() - 0.5) * 25,
    -3,
    -6 + Math.random() * 6
  );
  hill.scale.set(1 + Math.random() * 0.5, 0.3 + Math.random() * 0.2, 1 + Math.random() * 0.5);
  scene.add(hill);
  hills.push(hill);
}

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
  color: 0xff8833,
  size: 0.12,
  transparent: true,
  opacity: 0.85,
  sizeAttenuation: true
});

const trailParticles = new THREE.Points(trailGeo, trailMat);
scene.add(trailParticles);

let trailHistory = [];

/* ── CAR GLOW EFFECT ── */
const glowLight = new THREE.PointLight(0xff9944, 4.5, 15);
glowLight.position.set(0, 0, 0);
scene.add(glowLight);

// Additional glow light for more vibrancy
const glowLight2 = new THREE.PointLight(0x4488ff, 3, 12);
glowLight2.position.set(0, 0.5, 0);
scene.add(glowLight2);

/* ── SPARKLE PARTICLES ── */
const sparkleCount = 150;
const sparklePositions = new Float32Array(sparkleCount * 3);
const sparkleGeo = new THREE.BufferGeometry();
sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));

const sparkleMat = new THREE.PointsMaterial({
  color: 0xffee99,
  size: 0.05,
  transparent: true,
  opacity: 0.95,
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
  let currentScale = 1; // Assembly already completed in intro

  if (s <= driveStart) {
    // Keep the car assembled and centered until user scrolls past the intro section
    pathProgress = 0;
  } else {
    pathProgress = gsap.utils.mapRange(driveStart, driveEnd, 0, 1, s);
    pathProgress = THREE.MathUtils.clamp(pathProgress, 0, 1);
  }

  // Get position from curved path
  const pathPos = carPath.getPointAt(pathProgress);
  targetPosX = pathPos.x;
  targetPosY = pathPos.y;
  targetPosZ = pathPos.z;

  // Get tangent for rotation
  const tangent = carPath.getTangentAt(pathProgress);
  targetRotY = Math.atan2(tangent.x, tangent.z);

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
  glowLight.intensity = 3 + Math.sin(elapsed * 2) * 1.5;

  glowLight2.position.copy(carGroup.position);
  glowLight2.position.y += 0.5;
  glowLight2.intensity = 2 + Math.cos(elapsed * 1.8) * 1;

  // Update headlight lights positions
  headlightLights.forEach((light, i) => {
    light.position.copy(headlights[i].position);
  });

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

  // Animate background landscape
  mountains.forEach((mountain, i) => {
    mountain.position.z += Math.sin(elapsed * 0.2 + i) * 0.002;
  });

  hills.forEach((hill, i) => {
    hill.position.z += Math.sin(elapsed * 0.15 + i) * 0.001;
    hill.rotation.y += 0.001;
  });

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