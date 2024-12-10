import * as THREE from 'three'
import { generateStarsPositions } from './handleStarsData';
import { rotatePoint } from './utils';

function generateGalaxy(nbOfStars) {
    const starsPositions = generateStarsPositions(nbOfStars, 100, 10, true, 2);
    const starsMass = [...Array(nbOfStars)].map(() => 1);
    starsMass[0] = nbOfStars * 0.1
    starsMass[0] = nbOfStars * 0.05
    const starsVelocities = [...Array(nbOfStars * 3)].map(() => 0);

    const galaxyGeometry = new THREE.BufferGeometry()
    galaxyGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsPositions, 3));

    const galaxyMaterial = new THREE.PointsMaterial({ color: 0xffffff });
    galaxyMaterial.size = 2;
    galaxyMaterial.sizeAttenuation = false;

    for (let i = 0; i < starsMass.length; i++) {
        let index = i * 3
        const rotatedPoint = rotatePoint(starsPositions[index], starsPositions[index + 2], 0, 0, 1)
        let vel = 30
        starsVelocities[index] = (starsPositions[index] - rotatedPoint.x) * vel
        starsVelocities[index + 1] = 0
        starsVelocities[index + 2] = (starsPositions[index + 2] - rotatedPoint.y) * vel
    }

    const galaxyMesh = new THREE.Points(galaxyGeometry, galaxyMaterial);
    return { galaxyMesh, starsPositions, starsMass, starsVelocities };
}

let startTime
function updateGalaxy(galaxy, timestep) {
    timestep *= 0.02
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
    }

    galaxy.galaxyMesh.geometry.setAttribute('position', new THREE.Float32BufferAttribute(starsPositions, 3))
}
export { generateGalaxy, updateGalaxy }