import * as THREE from 'three'
import * as dat from 'dat.gui';
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

const BloomParams = {
    threshold: 0,
    strength: 0.20,
    radius: 0,
};

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = BloomParams.threshold;
bloomPass.strength = BloomParams.strength;
bloomPass.radius = BloomParams.radius;
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


let galaxyParameter = {
    nbOfStars: 2000,
    diameter: 100,
    thickness: 10,
    isFirstPointCentered: true,
    firstPointMassMultiplier: 100,
    galaxyStartingRotation: 30,
    G: 1,
    softeningFactor: 20,
    theta: 0.5,
    reset: () => {
        galaxy.galaxyMesh.removeFromParent()
        galaxy = generateGalaxy(galaxyParameter)
        scene.add(galaxy.galaxyMesh)
    }
}

let galaxy = generateGalaxy(galaxyParameter)
scene.add(galaxy.galaxyMesh)

let GUI = new dat.GUI()

let nbStartGUI = GUI.add(galaxyParameter, 'nbOfStars', 1, 5000)
console.log(nbStartGUI);
GUI.add(galaxyParameter, 'diameter', 1, 100)
GUI.add(galaxyParameter, 'thickness', 1, 100)
GUI.add(galaxyParameter, 'isFirstPointCentered')
GUI.add(galaxyParameter, 'firstPointMassMultiplier', 1, galaxyParameter.nbOfStars)
GUI.add(galaxyParameter, 'galaxyStartingRotation', 0, 100)
GUI.add(galaxyParameter, 'reset', 'test')


GUI.add(galaxyParameter, 'softeningFactor', 0, 100)
GUI.add(galaxyParameter, 'G', 0, 100)
GUI.add(galaxyParameter, 'theta', 0, 1)


const clock = new THREE.Clock()
function animate() {
    let timeSinceLastCalled = clock.getDelta()
    updateGalaxy(galaxy, 'barnesHut', timeSinceLastCalled)

    stats.update()
    controls.update()

    composer.render();
    // renderer.render(scene, camera)
    requestAnimationFrame(animate)
}
animate()