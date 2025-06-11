import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#solar-system'),
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.physicallyCorrectLights = true;

// Camera position
camera.position.z = 100;

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Animation state
let isAnimating = true;
let speedMultiplier = 1.0; // Add speed multiplier

// Create speed control panel
const speedControlPanel = document.createElement('div');
speedControlPanel.style.position = 'fixed';
speedControlPanel.style.bottom = '20px';
speedControlPanel.style.left = '20px';
speedControlPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
speedControlPanel.style.padding = '15px';
speedControlPanel.style.borderRadius = '8px';
speedControlPanel.style.color = 'white';
speedControlPanel.style.fontFamily = 'Arial, sans-serif';
speedControlPanel.style.zIndex = '1000';

const speedLabel = document.createElement('div');
speedLabel.textContent = 'Animation Speed';
speedLabel.style.marginBottom = '10px';

const speedSlider = document.createElement('input');
speedSlider.type = 'range';
speedSlider.min = '0';
speedSlider.max = '5';
speedSlider.step = '0.1';
speedSlider.value = '1';
speedSlider.style.width = '200px';

const speedValue = document.createElement('div');
speedValue.textContent = '1.0x';
speedValue.style.marginTop = '5px';
speedValue.style.textAlign = 'center';

speedSlider.addEventListener('input', (e) => {
    speedMultiplier = parseFloat(e.target.value);
    speedValue.textContent = speedMultiplier.toFixed(1) + 'x';
});

speedControlPanel.appendChild(speedLabel);
speedControlPanel.appendChild(speedSlider);
speedControlPanel.appendChild(speedValue);
document.body.appendChild(speedControlPanel);

const toggleButton = document.getElementById('toggle-animation');
toggleButton.addEventListener('click', () => {
    isAnimating = !isAnimating;
    toggleButton.textContent = isAnimating ? 'Pause Animation' : 'Resume Animation';
});

// Lighting
const ambientLight = new THREE.AmbientLight(0x444444); // Balanced ambient light
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffffff, 50, 500); // Increased intensity for PBR
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 5); // Increased intensity for PBR
directionalLight.position.set(0, 0, 1).normalize(); // Pointing from the front, simulating sun's distant light
scene.add(directionalLight);

// Starfield
function createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.5,
    });

    const starsVertices = [];
    for (let i = 0; i < 50000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);
}

// Ring creation helper for Saturn
function createRing(innerRadius, outerRadius, textureFile) {
    const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 128);
    const texture = new THREE.TextureLoader().load(textureFile,
        // onLoad callback
        (texture) => {
            console.log('Successfully loaded Saturn ring texture');
        },
        // onProgress callback
        undefined,
        // onError callback
        (error) => {
            console.error('Error loading Saturn ring texture:', error);
        }
    );
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        alphaMap: texture,
        roughness: 0.5,
        metalness: 0.1
    });
    const ring = new THREE.Mesh(geometry, material);
    return ring;
}

// Map planet meshes to their data for easy lookup
const planetMeshes = [];
const planetDataMap = new Map();

// Raycaster for hover detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const tooltip = document.getElementById('planet-tooltip');

window.addEventListener('mousemove', onMouseMove, false);

function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the ray
    const intersects = raycaster.intersectObjects(planetMeshes);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        const hoveredPlanet = planetDataMap.get(intersectedObject);

        if (hoveredPlanet) {
            // Display tooltip
            tooltip.style.display = 'block';
            tooltip.textContent = hoveredPlanet.name;

            // Position tooltip next to the mouse, with some offset
            tooltip.style.left = (event.clientX + 10) + 'px';
            tooltip.style.top = (event.clientY + 10) + 'px';
        }
    } else {
        // Hide tooltip if no planet is hovered
        tooltip.style.display = 'none';
    }
}

// Planet creation helper
function createPlanet(size, textureFile, position, rotationSpeed, orbitSpeed, name) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    
    let material;
    const textureLoader = new THREE.TextureLoader();

    if (position === 0) { // This is the Sun
        const sunTexture = textureLoader.load(textureFile);
        material = new THREE.MeshBasicMaterial({
            map: sunTexture,
            emissive: 0xffffff,
            emissiveMap: sunTexture,
            emissiveIntensity: 1 // Moderate emissive intensity for natural glow
        });
    } else {
        const planetTexture = textureLoader.load(textureFile,
            // onLoad callback
            (texture) => {
                console.log(`Successfully loaded texture for planet: ${textureFile}`);
            },
            // onProgress callback
            undefined,
            // onError callback
            (error) => {
                console.error(`Error loading texture for planet ${textureFile}:`, error);
            }
        );
        material = new THREE.MeshStandardMaterial({
            map: planetTexture,
            roughness: 0.7, // Adjusted for natural PBR appearance
            metalness: 0.1, // Adjusted for natural PBR appearance
            emissive: 0x000000, // No emissive for planets, rely on proper lighting
            emissiveIntensity: 0
        });
    }

    const planet = new THREE.Mesh(geometry, material);
    
    // Create planet group for rotation and orbit
    const planetGroup = new THREE.Group();
    planetGroup.add(planet);
    scene.add(planetGroup);

    // Position the planet mesh relative to its group for orbiting bodies
    if (position !== 0) {
        planet.position.x = position;
    }

    // Handle orbital lines and Saturn's rings for non-Sun planets
    if (position !== 0) { // Only add orbits/rings for planets that actually orbit
        // Add orbit line for all planets except the Sun
        const orbitRadius = position;
        const orbitGeometry = new THREE.RingGeometry(orbitRadius - 0.05, orbitRadius + 0.05, 128);
        const orbitMaterial = new THREE.MeshBasicMaterial({
            color: 0x444444,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1
        });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2;
        planetGroup.add(orbit);

        // Add Saturn's rings if this is Saturn
        if (name === 'Saturn') {
            const saturnRing = createRing(size * 1.5, size * 2.5, '/textures/saturn_ring.png');
            // Add the ring to the planet mesh, not the group
            planet.add(saturnRing);
            // Set the rotation to match Saturn's tilt
            saturnRing.rotation.x = THREE.MathUtils.degToRad(26.7);
        }
    }

    planetMeshes.push(planet);
    planetDataMap.set(planet, {
        mesh: planet,
        group: planetGroup,
        rotationSpeed,
        orbitSpeed,
        orbitRadius: position,
        name: name
    });

    return {
        mesh: planet,
        group: planetGroup,
        rotationSpeed,
        orbitSpeed,
        orbitRadius: position,
        name: name
    };
}

// Create planets
const planets = [
    createPlanet(5, '/textures/sun.jpg', 0, 0.004, 0, 'Sun'), // Sun
    createPlanet(0.8, '/textures/mercury.jpg', 10, 0.004, 0.04, 'Mercury'), // Mercury
    createPlanet(1.2, '/textures/venus.jpg', 15, 0.002, 0.015, 'Venus'), // Venus
    createPlanet(1.5, '/textures/earth.jpg', 20, 0.02, 0.01, 'Earth'), // Earth
    createPlanet(1.2, '/textures/mars.jpg', 25, 0.018, 0.008, 'Mars'), // Mars
    createPlanet(3, '/textures/jupiter.jpg', 35, 0.04, 0.002, 'Jupiter'), // Jupiter
    createPlanet(2.5, '/textures/saturn.jpg', 45, 0.038, 0.0009, 'Saturn'), // Saturn
    createPlanet(2, '/textures/uranus.jpg', 55, 0.03, 0.0004, 'Uranus'), // Uranus
    createPlanet(2, '/textures/neptune.jpg', 65, 0.032, 0.0001, 'Neptune'), // Neptune
];

// Create starfield
createStarfield();

// Add some debug info to the scene
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update planet positions and rotations
    if (isAnimating) {
        planets.forEach(planet => {
            if (planet.orbitSpeed > 0) {
                planet.group.rotation.y += planet.orbitSpeed * speedMultiplier;
                planet.mesh.rotation.y += planet.rotationSpeed * speedMultiplier;
            } else {
                planet.mesh.rotation.y += planet.rotationSpeed * speedMultiplier;
            }
        });
    }

    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Handle space key for camera reset
window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        camera.position.set(0, 0, 50);
        controls.reset();
    }
});

// Start animation
animate(); 
