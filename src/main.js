import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { generateGalaxy, updateGalaxy } from './handleGalaxy'
import { EffectComposer, OutputPass, RenderPass, UnrealBloomPass } from 'three/examples/jsm/Addons.js'

const stats = new Stats()
document.body.appendChild(stats.dom)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000)
const renderer = new THREE.WebGLRenderer()
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const params = {
    threshold: 0,
    strength: 0.20,
    radius: 0,
};

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = params.threshold;
bloomPass.strength = params.strength;
bloomPass.radius = params.radius;
const outputPass = new OutputPass();

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);
composer.addPass(outputPass);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    composer.setSize(window.innerWidth, window.innerHeight)
})

const controls = new OrbitControls(camera, renderer.domElement)
camera.position.y = 100
camera.position.x = 130

const nbOfStars = 5000

const galaxy = generateGalaxy(nbOfStars)
scene.add(galaxy.galaxyMesh)
// scene.add(galaxy.debugObject)

// const helper = new THREE.AxesHelper(100)
// scene.add(helper)
// updateGalaxy(galaxy, 1)

const clock = new THREE.Clock()

function animate() {
    let timeSinceLastCalled = clock.getDelta()
    updateGalaxy(galaxy, timeSinceLastCalled)

    stats.update()
    controls.update()

    composer.render();
    // renderer.render(scene, camera)
    requestAnimationFrame(animate)
}
animate()