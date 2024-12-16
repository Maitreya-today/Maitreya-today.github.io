<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WebXR AR Experience</title>
  <style>
    body {
      margin: 0;
      overflow: hidden;
      font-family: Arial, sans-serif;
    }
    #loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 18px;
      color: #fff;
    }
  </style>
</head>
<body>
  <div id="loading">Loading AR experience...</div>
  <script type="module">
    // Import required modules from Three.js
    import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js';
    import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/webxr/ARButton.js';
    import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/loaders/GLTFLoader.js';

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
      models/R2YI1K.glb
      function (gltf) {
        model = gltf.scene;
        document.getElementById('loading').style.display = 'none';
      },
      undefined,
      function (error) {
        console.error('An error occurred while loading the model:', error);
      }
    );

    // Handle object placement
    let reticle;
    const reticleGeometry = new THREE.RingGeometry(0.1, 0.11, 32).rotateX(-Math.PI / 2);
    const reticleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    reticle = new THREE.Mesh(reticleGeometry, reticleMaterial);
    reticle.visible = false;
    scene.add(reticle);

    renderer.xr.addEventListener('sessionstart', () => {
      // Enable reticle visibility on session start
      reticle.visible = true;
    });

    window.addEventListener('click', () => {
      if (model && reticle.visible) {
        const newModel = model.clone();
        newModel.position.copy(reticle.position);
        scene.add(newModel);
      }
    });

    function animate() {
      renderer.setAnimationLoop(() => {
        // Update reticle position
        renderer.render(scene, camera);
      });
    }

    animate();
  </script>
</body>
</html>
