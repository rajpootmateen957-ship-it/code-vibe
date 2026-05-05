import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// --- 1. SMOOTH SCROLL (Lenis) ---
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// --- 2. THREE.JS SCENE SETUP ---
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.04);

// Camera
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 5;
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- 3. 3D OBJECTS (Particles & Shapes) ---
// Abstract Torus Knot representing the "Core"
const geometry = new THREE.TorusKnotGeometry(1, 0.3, 200, 32);
const material = new THREE.MeshStandardMaterial({ 
  color: 0xffffff,
  roughness: 0.1,
  metalness: 0.8,
  wireframe: true
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Particles for the background
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 1500;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 20; // Spread particles around
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.015,
  color: 0xffffff,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xff0055, 3);
pointLight.position.set(2, 3, 4);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0x0055ff, 3);
pointLight2.position.set(-2, -3, -4);
scene.add(pointLight2);

// --- 4. ANIMATIONS & MOUSE TRACKING ---
// Mouse Tracking Parallax
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX - windowHalfX);
  mouseY = (event.clientY - windowHalfY);
});

// ScrollTrigger Animations
// Rotate the mesh as we scroll down
gsap.to(mesh.rotation, {
  x: Math.PI * 2,
  z: Math.PI * 2,
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: 1 // scrub makes it linked directly to scroll bar position
  }
});

// Move the mesh right for the 'Discovery' section
gsap.to(mesh.position, {
  x: 2,
  y: 0,
  scrollTrigger: {
    trigger: ".story-block.left",
    start: "top bottom",
    end: "center center",
    scrub: 1
  }
});

// Move the mesh left for the 'Connection' section
gsap.to(mesh.position, {
  x: -2,
  y: -1,
  scrollTrigger: {
    trigger: ".story-block.right",
    start: "top bottom",
    end: "center center",
    scrub: 1
  }
});

// Center and zoom in for the 'Evolution' section
gsap.to(mesh.position, {
  x: 0,
  y: 0,
  z: 2,
  scrollTrigger: {
    trigger: ".story-block.center",
    start: "top bottom",
    end: "center center",
    scrub: 1
  }
});

// Fade in Text
const sections = document.querySelectorAll('.story-block');
sections.forEach(section => {
  gsap.fromTo(section, 
    { opacity: 0, y: 100 },
    { 
      opacity: 1, 
      y: 0,
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        end: "top 40%",
        scrub: 1
      }
    }
  );
});

// Tick Loop (Game Loop)
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Constant slow rotation of the main mesh
  mesh.rotation.y += 0.005;

  // Rotate particles
  particlesMesh.rotation.y = -elapsedTime * 0.05;
  particlesMesh.position.y = Math.sin(elapsedTime * 0.5) * 0.2; // subtle float

  // Parallax easing based on mouse position
  targetX = mouseX * 0.001;
  targetY = mouseY * 0.001;

  camera.position.x += (targetX - camera.position.x) * 0.05;
  camera.position.y += (-targetY - camera.position.y) * 0.05;
  
  // Make camera always look at the center of the scene
  camera.lookAt(scene.position);

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();

// --- 5. RESIZE HANDLER ---
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
