import * as THREE from 'three'
import { generateStarsPositions, updateBarnesHut, updateDirectSum } from './handleStarsData';
import { rotatePoint } from './utils';

function generateGalaxy(nbOfStars) {
    let d = 100
    const starsPositions = generateStarsPositions(nbOfStars, d, d / 10, true);
    const starsMass = [...Array(nbOfStars)].map(() => 1);
    starsMass[0] = nbOfStars * 0.1
    const starsVelocities = [...Array(nbOfStars * 3)].map(() => 0);

    for (let i = 0; i < starsMass.length; i++) {
        let index = i * 3
        const rotatedPoint = rotatePoint(starsPositions[index], starsPositions[index + 2], 0, 0, 1)
        let vel = 50
        starsVelocities[index] = (starsPositions[index] - rotatedPoint.x) * vel
        starsVelocities[index + 1] = 0
        starsVelocities[index + 2] = (starsPositions[index + 2] - rotatedPoint.y) * vel
    }

    const galaxyGeometry = new THREE.BufferGeometry()
    galaxyGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsPositions, 3));
    galaxyGeometry.setAttribute('mass', new THREE.Float32BufferAttribute(starsMass, 1));
    galaxyGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(starsVelocities, 3));

    const vertexShader = `
    attribute vec3 velocity;
    attribute float mass;
    varying vec3 vColor;
    void main() {
        gl_PointSize = 1.5;
        vColor = velocity;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`
    const fragmentShader = `
    varying vec3 vColor;
    uniform float maxCurrentVelLength;
    void main() {
        float l = abs(vColor.x)+abs(vColor.y)+abs(vColor.z);
        l = l / maxCurrentVelLength;
        gl_FragColor = vec4(1.0-l, 1.0-l, l, 1.0 );
    }`

    const galaxyMaterial = new THREE.ShaderMaterial({
        uniforms: {
            maxCurrentVelLength: { value: 0.0 }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    })

    const galaxyMesh = new THREE.Points(galaxyGeometry, galaxyMaterial);
    return { galaxyMesh, starsPositions, starsMass, starsVelocities, debugObject: new THREE.Object3D() };
}

function updateGalaxy(galaxy, timestep) {

    // updateDirectSum(galaxy, timestep)
    updateBarnesHut(galaxy, timestep)
}



export { generateGalaxy, updateGalaxy }