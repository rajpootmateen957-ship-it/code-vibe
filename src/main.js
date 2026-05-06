import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// 1. SMOOTH SCROLL (Lenis) synced with GSAP ScrollTrigger
// ============================================================
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ============================================================
// 2. THREE.JS SCENE — Interactive Mesh + Particle Field
// ============================================================
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();

const sizes = { width: window.innerWidth, height: window.innerHeight };
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 200);
camera.position.set(0, 0, 6);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// --- The Hero Mesh (TorusKnot) ---
const meshGeometry = new THREE.TorusKnotGeometry(1.2, 0.35, 256, 64);
const meshMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x6c5ce7,
  roughness: 0.15,
  metalness: 0.9,
  wireframe: false,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  emissive: 0x1a1a2e,
  emissiveIntensity: 0.3,
});
const mesh = new THREE.Mesh(meshGeometry, meshMaterial);
scene.add(mesh);

// --- Background Particles ---
const particlesCount = 2000;
const particlePositions = new Float32Array(particlesCount * 3);
for (let i = 0; i < particlesCount * 3; i++) {
  particlePositions[i] = (Math.random() - 0.5) * 30;
}
const particlesGeo = new THREE.BufferGeometry();
particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particlesMat = new THREE.PointsMaterial({
  size: 0.02,
  color: 0xffffff,
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const particles = new THREE.Points(particlesGeo, particlesMat);
scene.add(particles);

// --- Lights ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const mainLight = new THREE.PointLight(0x6c5ce7, 5, 30);
mainLight.position.set(3, 4, 5);
scene.add(mainLight);

const secondLight = new THREE.PointLight(0x00d2ff, 4, 30);
secondLight.position.set(-3, -2, 4);
scene.add(secondLight);

const rimLight = new THREE.PointLight(0xff6b6b, 2, 20);
rimLight.position.set(0, 5, -5);
scene.add(rimLight);

// ============================================================
// 3. MOUSE PARALLAX
// ============================================================
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / sizes.width - 0.5) * 2;
  mouseY = (e.clientY / sizes.height - 0.5) * 2;
});

// ============================================================
// 4. SCROLL-DRIVEN MESH ANIMATIONS (GSAP ScrollTrigger)
// ============================================================

// 4a. HOME — mesh centered, slowly rotating
// (default position, handled in render loop)

// 4b. ABOUT — mesh moves right + changes color
const aboutTL = gsap.timeline({
  scrollTrigger: {
    trigger: '#about',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1,
  },
});
aboutTL
  .to(mesh.position, { x: 3, y: 0.5, z: 3 }, 0)
  .to(mesh.rotation, { y: Math.PI }, 0)
  .to(meshMaterial.color, { r: 0, g: 0.82, b: 1 }, 0)      // cyan
  .to(meshMaterial.emissive, { r: 0, g: 0.1, b: 0.2 }, 0);

// 4c. SERVICES — mesh moves left + changes color
const servicesTL = gsap.timeline({
  scrollTrigger: {
    trigger: '#services',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1,
  },
});
servicesTL
  .to(mesh.position, { x: -3, y: -0.5, z: 2 }, 0)
  .to(mesh.rotation, { y: Math.PI * 2, x: Math.PI * 0.5 }, 0)
  .to(meshMaterial.color, { r: 1, g: 0.42, b: 0.42 }, 0)    // coral
  .to(meshMaterial.emissive, { r: 0.2, g: 0.05, b: 0.05 }, 0);

// 4d. CONTACT — mesh moves to center-right
const contactTL = gsap.timeline({
  scrollTrigger: {
    trigger: '#contact',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1,
  },
});
contactTL
  .to(mesh.position, { x: 2, y: 0, z: 4 }, 0)
  .to(mesh.rotation, { y: Math.PI * 3, z: Math.PI * 0.3 }, 0)
  .to(meshMaterial.color, { r: 0.42, g: 0.36, b: 0.9 }, 0)  // purple
  .to(meshMaterial.emissive, { r: 0.1, g: 0.08, b: 0.18 }, 0);

// 4e. AUTH — mesh zooms out & becomes small background element
const authTL = gsap.timeline({
  scrollTrigger: {
    trigger: '#auth',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1,
  },
});
authTL
  .to(mesh.position, { x: 0, y: 0, z: -5 }, 0)
  .to(mesh.scale, { x: 0.5, y: 0.5, z: 0.5 }, 0)
  .to(mesh.rotation, { y: Math.PI * 4 }, 0)
  .to(meshMaterial.color, { r: 0.42, g: 0.36, b: 0.9 }, 0);

// ============================================================
// 5. GSAP REVEAL ANIMATIONS FOR CONTENT
// ============================================================

// Navbar intro
gsap.from('.navbar', {
  y: -100,
  opacity: 0,
  duration: 1.2,
  ease: 'power3.out',
  delay: 0.3,
});

// Hero animations
const heroTL = gsap.timeline({ delay: 0.5 });
heroTL
  .from('.hero-badge', { y: 30, opacity: 0, duration: 0.8 })
  .from('.hero-title', { y: 60, opacity: 0, duration: 1, ease: 'power3.out' }, '-=0.4')
  .from('.hero-description', { y: 40, opacity: 0, duration: 0.8 }, '-=0.5')
  .from('.hero-cta', { y: 30, opacity: 0, duration: 0.8 }, '-=0.4')
  .from('.stat', { y: 40, opacity: 0, duration: 0.6, stagger: 0.15 }, '-=0.3')
  .from('.scroll-indicator', { opacity: 0, duration: 1 }, '-=0.3');

// Counter animation for stats
document.querySelectorAll('.stat-number').forEach(el => {
  const target = parseInt(el.getAttribute('data-count'));
  ScrollTrigger.create({
    trigger: el,
    start: 'top 90%',
    once: true,
    onEnter: () => {
      gsap.to(el, {
        innerText: target,
        duration: 2,
        snap: { innerText: 1 },
        ease: 'power2.out',
      });
    },
  });
});

// About section reveals
gsap.from('.section-about .section-label', {
  scrollTrigger: { trigger: '#about', start: 'top 75%' },
  x: -60, opacity: 0, duration: 0.8,
});
gsap.from('.section-about .section-heading', {
  scrollTrigger: { trigger: '#about', start: 'top 70%' },
  y: 60, opacity: 0, duration: 1,
});
gsap.from('.about-text', {
  scrollTrigger: { trigger: '#about', start: 'top 65%' },
  y: 40, opacity: 0, duration: 0.8, stagger: 0.2,
});
gsap.from('.feature', {
  scrollTrigger: { trigger: '.about-features', start: 'top 80%' },
  y: 50, opacity: 0, duration: 0.7, stagger: 0.15,
});

// Services section reveals
gsap.from('.section-services .section-label', {
  scrollTrigger: { trigger: '#services', start: 'top 75%' },
  x: -60, opacity: 0, duration: 0.8,
});
gsap.from('.section-services .section-heading', {
  scrollTrigger: { trigger: '#services', start: 'top 70%' },
  y: 60, opacity: 0, duration: 1,
});
gsap.from('.service-card', {
  scrollTrigger: { trigger: '.services-grid', start: 'top 80%' },
  y: 80, opacity: 0, duration: 0.8,
  stagger: { amount: 0.6, from: 'start' },
});

// Contact section reveals
gsap.from('.contact-left', {
  scrollTrigger: { trigger: '#contact', start: 'top 70%' },
  x: -80, opacity: 0, duration: 1,
});
gsap.from('.contact-right', {
  scrollTrigger: { trigger: '#contact', start: 'top 70%' },
  x: 80, opacity: 0, duration: 1,
});

// Auth section reveals
gsap.from('.auth-card', {
  scrollTrigger: { trigger: '#auth', start: 'top 75%' },
  y: 80, opacity: 0, scale: 0.9, duration: 1, ease: 'back.out(1.7)',
});

// Footer reveal
gsap.from('.footer-top', {
  scrollTrigger: { trigger: '.footer', start: 'top 90%' },
  y: 40, opacity: 0, duration: 0.8,
});

// ============================================================
// 6. NAVBAR SCROLL BEHAVIOR
// ============================================================
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  const currentScroll = window.scrollY;
  if (currentScroll > 100) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  lastScroll = currentScroll;
});

// Active nav link highlighting
const sections = document.querySelectorAll('.section[id]');
const navLinks = document.querySelectorAll('.nav-link');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    const sectionTop = sec.offsetTop - 200;
    if (window.scrollY >= sectionTop) current = sec.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
});

// ============================================================
// 7. MOBILE MENU
// ============================================================
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
});
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
  });
});

// ============================================================
// 8. AUTH TABS
// ============================================================
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.getAttribute('data-tab');
    document.getElementById('formSignIn').classList.toggle('hidden', target !== 'signin');
    document.getElementById('formSignUp').classList.toggle('hidden', target !== 'signup');
  });
});

// ============================================================
// 9. RENDER LOOP
// ============================================================
const clock = new THREE.Clock();

const tick = () => {
  const elapsed = clock.getElapsedTime();

  // Constant slow rotation of mesh
  mesh.rotation.y += 0.003;
  mesh.rotation.x += 0.001;

  // Mouse parallax on camera
  camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.05;
  camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.05;
  camera.lookAt(mesh.position);

  // Animate particles
  particles.rotation.y = elapsed * 0.03;
  particles.rotation.x = elapsed * 0.01;

  // Pulse light intensity
  mainLight.intensity = 5 + Math.sin(elapsed * 2) * 1;
  secondLight.intensity = 4 + Math.cos(elapsed * 1.5) * 1;

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
};
tick();

// ============================================================
// 10. RESIZE
// ============================================================
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
