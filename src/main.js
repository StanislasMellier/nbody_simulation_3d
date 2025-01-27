import * as THREE from 'three'
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { generateGalaxy, updateGalaxy } from './handleGalaxy'
import { EffectComposer, OutputPass, RenderPass, UnrealBloomPass } from 'three/examples/jsm/Addons.js'

const stats = new Stats();
document.body.appendChild(stats.dom);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const BloomParams = {
    enabled: true,
    threshold: 0.07,
    strength: 0.30,
    radius: 0.5,
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
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.y = 100;
camera.position.x = 130;


let galaxyParameter = {
    nbOfStars: 2500,
    diameter: 100,
    thickness: 10,
    spawnDistribution: 'homogeneous',
    isFirstPointCentered: true,
    firstPointMassMultiplier: 100,
    startingRotation: 35,
    G: 1,
    softeningFactor: 20,
    theta: 0.5,
    reset: () => {
        galaxy.galaxyMesh.removeFromParent();
        galaxy = generateGalaxy(galaxyParameter);
        scene.add(galaxy.galaxyMesh);
    }
};

let galaxy = generateGalaxy(galaxyParameter);
scene.add(galaxy.galaxyMesh);

let GUI = new dat.GUI();
GUI.width = 300;

let nbOfStarsParameter = GUI.add(galaxyParameter, 'nbOfStars', 1, 5000);
nbOfStarsParameter.name('Number of Stars');

let diameterParameter = GUI.add(galaxyParameter, 'diameter', 1, 100);
diameterParameter.name('Galaxy Diameter');

let thicknessParameter = GUI.add(galaxyParameter, 'thickness', 1, 100);
thicknessParameter.name('Galaxy Thickness');

let spawnDistributionParameter = GUI.add(galaxyParameter, 'spawnDistribution', ['homogeneous', 'clustered']);
spawnDistributionParameter.name('Spawn Distribution');

let isFirstPointCenteredParameter = GUI.add(galaxyParameter, 'isFirstPointCentered');
isFirstPointCenteredParameter.name('Is First Star Freezed');

let firstPointMassMultiplierParameter = GUI.add(galaxyParameter, 'firstPointMassMultiplier', 1, galaxyParameter.nbOfStars);
firstPointMassMultiplierParameter.name('First Star Mass Multiplier');

let startingRotationParameter = GUI.add(galaxyParameter, 'startingRotation', 0, 100);
startingRotationParameter.name('Initial Galaxy Rotation');

let resetParameter = GUI.add(galaxyParameter, 'reset', 'test');
resetParameter.name('Reset Galaxy');


let softeningFactorParameter = GUI.add(galaxyParameter, 'softeningFactor', 0, 100);
softeningFactorParameter.name('Softening Factor');

let GParameter = GUI.add(galaxyParameter, 'G', 0, 100);
GParameter.name('G Constant');

let thetaParameter = GUI.add(galaxyParameter, 'theta', 0, 0.9);
thetaParameter.step(0.1);
thetaParameter.name('Barnes-Hut Accuracy');

let bloomFolder = GUI.addFolder('Bloom');
bloomFolder.open()
let bloomEnabledParameter = bloomFolder.add(BloomParams, 'enabled')
bloomEnabledParameter.name('Enable Bloom');

let bloomThresholdParameter = bloomFolder.add(BloomParams, 'threshold', 0.0, 1.0).onChange(function (value) {
    bloomPass.threshold = value;
});
bloomThresholdParameter.name('Threshold');

let bloomStrengthParameter = bloomFolder.add(BloomParams, 'strength', 0.0, 1.0).onChange(function (value) {
    bloomPass.strength = value;
});
bloomStrengthParameter.name('Strength');

let bloomRadiusParameter = bloomFolder.add(BloomParams, 'radius', 0.0, 1.0).onChange(function (value) {
    bloomPass.radius = value;
});
bloomRadiusParameter.name('Radius');

const clock = new THREE.Clock();
function animate() {
    let timeSinceLastCalled = clock.getDelta();

    updateGalaxy(galaxy, 'barnesHut', timeSinceLastCalled);

    stats.update();
    controls.update();

    if (BloomParams.enabled) {
        composer.render();
    } else {
        renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
}
animate();