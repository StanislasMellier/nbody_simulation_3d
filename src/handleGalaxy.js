import * as THREE from 'three'
import { generateStarsPositions } from './handleStarsData';
import { rotatePoint } from './utils';

function generateGalaxy(nbOfStars) {
    const starsPositions = generateStarsPositions(nbOfStars, 100, 10, true, 2);
    const starsMass = [...Array(nbOfStars)].map(() => 1);
    starsMass[0] = nbOfStars * 0.01
    const starsVelocities = [...Array(nbOfStars * 3)].map(() => 0);

    for (let i = 0; i < starsMass.length; i++) {
        let index = i * 3
        const rotatedPoint = rotatePoint(starsPositions[index], starsPositions[index + 2], 0, 0, 1)
        let vel = 30
        starsVelocities[index] = (starsPositions[index] - rotatedPoint.x) * vel
        starsVelocities[index + 1] = 0
        starsVelocities[index + 2] = (starsPositions[index + 2] - rotatedPoint.y) * vel
    }

    const vertexShader = `
    attribute vec3 velocity;
    attribute float mass;
    varying vec3 vColor;
    void main() {
        gl_PointSize = 1.5;
        vColor = velocity;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `
    const fragmentShader = `
    varying vec3 vColor;
    uniform float maxCurrentVelLength;
    void main() {
        float l = abs(vColor.x)+abs(vColor.y)+abs(vColor.z);
        l = l / maxCurrentVelLength;
        gl_FragColor = vec4(1.0-l, 1.0-l, l, 1.0 );
    }
    `
    const galaxyGeometry = new THREE.BufferGeometry()
    galaxyGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsPositions, 3));
    galaxyGeometry.setAttribute('mass', new THREE.Float32BufferAttribute(starsMass, 1));
    galaxyGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(starsVelocities, 3));


    const galaxyMaterial = new THREE.ShaderMaterial({
        uniforms: {
            maxCurrentVelLength: { value: 0 }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    })

    const galaxyMesh = new THREE.Points(galaxyGeometry, galaxyMaterial);
    return { galaxyMesh, starsPositions, starsMass, starsVelocities };
}

function updateGalaxy(galaxy, timestep) {
    timestep *= 0.02

    let maxCurrentVelLength = 0
    let G = 1
    let softeningFactor = 20
    const { starsPositions, starsMass, starsVelocities } = galaxy
    for (let i = 1; i < starsMass.length; i++) {
        let starPosition = {
            x: starsPositions[i * 3],
            y: starsPositions[i * 3 + 1],
            z: starsPositions[i * 3 + 2]
        }

        let acceleration = {
            x: 0,
            y: 0,
            z: 0
        }

        for (let j = 0; j < starsMass.length; j++) {
            if (i === j) {
                continue
            }
            let otherStarPosition = {
                x: starsPositions[j * 3],
                y: starsPositions[j * 3 + 1],
                z: starsPositions[j * 3 + 2]
            }

            let diff = {
                x: otherStarPosition.x - starPosition.x,
                y: otherStarPosition.y - starPosition.y,
                z: otherStarPosition.z - starPosition.z
            }

            let d2 = Math.sqrt(diff.x ** 2 + diff.y ** 2 + diff.z ** 2 + softeningFactor) ** 2

            acceleration.x += G * diff.x * starsMass[j] / d2
            acceleration.y += G * diff.y * starsMass[j] / d2
            acceleration.z += G * diff.z * starsMass[j] / d2
        }

        starsVelocities[i * 3] += acceleration.x * timestep
        starsVelocities[i * 3 + 1] += acceleration.y * timestep
        starsVelocities[i * 3 + 2] += acceleration.z * timestep

        starsPositions[i * 3] += starsVelocities[i * 3] * timestep
        starsPositions[i * 3 + 1] += starsVelocities[i * 3 + 1] * timestep
        starsPositions[i * 3 + 2] += starsVelocities[i * 3 + 2] * timestep

        let velL = Math.abs(starsVelocities[i * 3]) + Math.abs(starsVelocities[i * 3 + 1]) + Math.abs(starsVelocities[i * 3 + 2])
        if (velL > maxCurrentVelLength) {
            maxCurrentVelLength = velL
        }
    }

    galaxy.galaxyMesh.geometry.setAttribute('position', new THREE.Float32BufferAttribute(starsPositions, 3))
    galaxy.galaxyMesh.geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(starsVelocities, 3))
    galaxy.galaxyMesh.material.uniforms.maxCurrentVelLength.value = maxCurrentVelLength
}
export { generateGalaxy, updateGalaxy }