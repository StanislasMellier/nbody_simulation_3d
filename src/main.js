import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { generateGalaxy, updateGalaxy } from './handleGalaxy'

const stats = new Stats()
document.body.appendChild(stats.dom)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000)
const renderer = new THREE.WebGLRenderer()
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})

const controls = new OrbitControls(camera, renderer.domElement)
camera.position.y = 100
camera.position.x = 100

const nbOfStars = 2000

const galaxy = generateGalaxy(nbOfStars)
scene.add(galaxy.galaxyMesh)

let last = performance.now()
function animate() {
    let timeSinceLastCalled = performance.now() - last;
    timeSinceLastCalled = 1
    requestAnimationFrame(animate)

    updateGalaxy(galaxy, timeSinceLastCalled)

    stats.update()
    controls.update()
    renderer.render(scene, camera)
    last = performance.now()
}
animate()