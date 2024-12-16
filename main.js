// Import required modules from Three.js
import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// Add AR button to the page
document.body.appendChild(ARButton.createButton(renderer));

// Add lighting
const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
light.position.set(0.5, 1, 0.25);
scene.add(light);

// Load the custom 3D model
const loader = new GLTFLoader();
let model;
loader.load(
  models/tornado.blend
  function (gltf) {
    model = gltf.scene;
  },
  undefined,
  function (error) {
    console.error('An error occurred while loading the model:', error);
  }
);

// Handle object placement
let reticle;
const raycaster = new THREE.Raycaster();
const touch = new THREE.Vector2();

// Add a reticle for placement
const reticleGeometry = new THREE.RingGeometry(0.1, 0.11, 32).rotateX(-Math.PI / 2);
const reticleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
reticle = new THREE.Mesh(reticleGeometry, reticleMaterial);
reticle.visible = false;
scene.add(reticle);

renderer.xr.addEventListener('sessionstart', () => {
  // Enable reticle visibility on session start
  reticle.visible = true;
});

window.addEventListener('touchstart', (event) => {
  if (model && reticle.visible) {
    const newModel = model.clone();
    newModel.position.copy(reticle.position);
    scene.add(newModel);
  }
});

function animate() {
  renderer.setAnimationLoop(() => {
    // Update reticle position
    const session = renderer.xr.getSession();
    if (session) {
      const viewerSpace = renderer.xr.getReferenceSpace().viewerSpace;
      const hitTestSource = session.requestHitTestSource({ space: viewerSpace });
      const hitTestResults = hitTestSource.getHitTestResults();

      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        reticle.visible = true;
        reticle.matrix.fromArray(hit.getPose(renderer.xr.getReferenceSpace()).transform.matrix);
        reticle.position.setFromMatrixPosition(reticle.matrix);
      } else {
        reticle.visible = false;
      }
    }

    renderer.render(scene, camera);
  });
}

animate();
