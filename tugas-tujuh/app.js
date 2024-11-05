// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/cont';
// import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/controls/OrbitControls.js';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene setup
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 5);

// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

scene.fog = new THREE.Fog(0xffffff, 1, 10);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Geometric objects
const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x44aa88 });
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.castShadow = true;
box.position.set(-1.5, 0.5, 0);
scene.add(box);

const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x8844aa });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.castShadow = true;
sphere.position.set(0, 0.5, 0);
scene.add(sphere);

const coneGeometry = new THREE.ConeGeometry(0.5, 1, 32);
const coneMaterial = new THREE.MeshStandardMaterial({ color: 0xaa8844 });
const cone = new THREE.Mesh(coneGeometry, coneMaterial);
cone.castShadow = true;
cone.position.set(1.5, 0.5, 0);
scene.add(cone);

const loader = new THREE.TextureLoader();
loader.load(
    'http://localhost:5500/starry-night.jpeg',
    (texture) => {
        // Set background texture setelah berhasil dimuat
        scene.background = texture;
        console.log("Background texture loaded successfully.");
    },
    undefined,
    (error) => {
        console.error("Error loading background texture:", error);
    }
);



// Panorama (Skybox) using starry-night.jpeg texture
// const loader = new THREE.TextureLoader();
// loader.load('./assets/starry-night.jpeg', function(texture) {
//     const skyboxGeometry = new THREE.SphereGeometry(50, 60, 40);
//     const skyboxMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
//     const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
//     scene.add(skybox);
// });

// const loader = new THREE.CubeTextureLoader();
// const skyboxTexture = loader.load([
//     './assets/starry-night.jpeg',  // Pos-X
//     './assets/starry-night.jpeg',  // Neg-X
//     './assets/starry-night.jpeg',  // Pos-Y
//     './assets/starry-night.jpeg',  // Neg-Y
//     './assets/starry-night.jpeg',  // Pos-Z
//     './assets/starry-night.jpeg'   // Neg-Z
// ]);


const objects = [box, sphere, cone];

let currentMode = 'idle';

document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'ArrowUp': // Naik
            objects.forEach(obj => {
                obj.position.y += 0.1; // Gerak ke atas
            });
            break;
        case 'ArrowDown': // Turun
            objects.forEach(obj => {
                obj.position.y -= 0.1; // Gerak ke bawah
            });
            break;
        case 'ArrowLeft': // Kiri
            objects.forEach(obj => {
                obj.position.x -= 0.1; // Gerak ke kiri
            });
            break;
        case 'ArrowRight': // Kanan
            objects.forEach(obj => {
                obj.position.x += 0.1; // Gerak ke kanan
            });
            break;
        case 'KeyW':
            currentMode = 'walk';
            break;
        case 'KeyR':
            currentMode = 'run';
            break;
        case 'Space':
            currentMode = 'jump';
            break;
        default:
            currentMode = 'idle';
            break;
    }
});

// Render loop
function animate() {
    requestAnimationFrame(animate);

    objects.forEach(obj => {
        switch (currentMode) {
            case 'walk':
                obj.position.x += 0.01; // Move objects to the right
                break;
            case 'run':
                obj.position.x += 0.05; // Move objects faster
                break;
            case 'jump':
                if (obj.position.y === 0.5) { // Check if already at ground level
                    obj.position.y += 0.5; // Move objects up (jump)
                    setTimeout(() => {
                        obj.position.y -= 0.5; // Move objects down after jump
                        currentMode = 'idle'; // Reset to idle mode
                    }, 200); // Jump duration
                }
                break;
            default: // 'idle'
                // No movement
                break;
        }
    });

    // // Rotating the objects for animation
    objects.forEach(obj => {
        obj.rotation.x += 0.01;
        obj.rotation.y += 0.01;
    });
    
    // Rotating the objects for animation
    // box.rotation.x += 0.01;
    // box.rotation.y += 0.01;
    // sphere.rotation.x += 0.01;
    // sphere.rotation.y += 0.01;
    // cone.rotation.x += 0.01;
    // cone.rotation.y += 0.01;
    
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Responsive resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
