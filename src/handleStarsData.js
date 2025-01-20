import { getRandomPointClustered, getRandomPointInSphere, rotatePoint } from './utils'
import * as THREE from 'three'

let maxCurrentVelLength = 0
let G = 1
let softeningFactor = 20
let theta = 0.5

function generateStarsPositions(nbOfPoints, diameter, thickness, isFirstPointCentered) {
    const points = []

    for (let i = 0; i < nbOfPoints; i++) {
        // const point = getRandomPointInSphere()
        const point = getRandomPointClustered()
        points.push(point.x * diameter, point.y * thickness, point.z * diameter)
    }

    if (isFirstPointCentered) {
        points[0] = 0
        points[1] = 0
        points[2] = 0
    }
    return points
}

function computeForceWithAnotherBody(body, otherBody) {

    let diff = {
        x: otherBody.pos[0] - body.pos[0],
        y: otherBody.pos[1] - body.pos[1],
        z: otherBody.pos[2] - body.pos[2]
    }

    let d2 = Math.sqrt(diff.x ** 2 + diff.y ** 2 + diff.z ** 2 + softeningFactor) ** 2

    return {
        x: G * diff.x * otherBody.mass / d2,
        y: G * diff.y * otherBody.mass / d2,
        z: G * diff.z * otherBody.mass / d2
    }
}

function updateDirectSum(galaxy, timestep) {
    // timestep *= 0.02


    const { starsPositions, starsMass, starsVelocities } = galaxy
    for (let i = 1; i < starsMass.length; i++) {
        let acceleration = {
            x: 0,
            y: 0,
            z: 0
        }

        for (let j = 0; j < starsMass.length; j++) {
            if (i === j) {
                continue
            }
            let force = computeForceWithAnotherBody(
                {
                    pos: [
                        starsPositions[i * 3],
                        starsPositions[i * 3 + 1],
                        starsPositions[i * 3 + 2]
                    ],
                    mass: starsMass[i]
                },
                {
                    pos: [
                        starsPositions[j * 3],
                        starsPositions[j * 3 + 1],
                        starsPositions[j * 3 + 2]
                    ],
                    mass: starsMass[j]
                },
            )
            acceleration.x += force.x
            acceleration.y += force.y
            acceleration.z += force.z
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

function determineSizeAndCenterOfTree(starsPositions, nbOfStars) {
    let min = new THREE.Vector3(starsPositions[0], starsPositions[1], starsPositions[2]);
    let max = new THREE.Vector3(starsPositions[0], starsPositions[1], starsPositions[2]);
    for (let i = 0; i < nbOfStars; i++) {
        min.x = Math.min(min.x, starsPositions[i * 3])
        min.y = Math.min(min.y, starsPositions[i * 3 + 1])
        min.z = Math.min(min.z, starsPositions[i * 3 + 2])
        max.x = Math.max(max.x, starsPositions[i * 3])
        max.y = Math.max(max.y, starsPositions[i * 3 + 1])
        max.z = Math.max(max.z, starsPositions[i * 3 + 2])
    }
    let w = max.x - min.x;
    let h = max.y - min.y;
    let d = max.z - min.z;
    let size = Math.max(w, h, d);
    let treeCenter = [
        min.x + w / 2,
        min.y + h / 2,
        min.z + d / 2
    ];
    return { size, treeCenter }
}

// let debugObject
function updateBarnesHut(galaxy, timestep) {
    theta = galaxy.galaxyParameter.theta
    G = galaxy.galaxyParameter.G
    // timestep *= 0.02

    const { starsPositions, starsMass, starsVelocities } = galaxy
    // debugObject = galaxy.debugObject

    let { size, treeCenter } = determineSizeAndCenterOfTree(starsPositions, starsMass.length)


    let root = new node(treeCenter, size, 'yellow')

    for (let i = 0; i < starsMass.length; i++) {
        let body = {
            index: i,
            mass: starsMass[i],
            pos: [starsPositions[i * 3], starsPositions[i * 3 + 1], starsPositions[i * 3 + 2]]
        }
        root.insertBody(body)
    }
    root.computeCenterOfMass()

    let firstIndex = 0
    if (galaxy.galaxyParameter.isFirstPointCentered) firstIndex = 1
    for (let i = firstIndex; i < starsMass.length; i++) {
        let body = {
            index: i,
            mass: starsMass[i],
            pos: [starsPositions[i * 3], starsPositions[i * 3 + 1], starsPositions[i * 3 + 2]]
        }
        let force = root.calculateForce(body)

        starsVelocities[i * 3] += force.x * timestep
        starsVelocities[i * 3 + 1] += force.y * timestep
        starsVelocities[i * 3 + 2] += force.z * timestep

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

let nodeId = 0
class node {
    constructor([x, y, z], size) {
        this.id = nodeId++
        this.pos = [x, y, z];
        this.centerOfMass = [0, 0, 0];
        this.mass = 0;
        this.size = size;
        this.bodyInNode = [];
        this.bodyOfNode = null;
        this.octans = new Array(8).fill(null);
        // this.color = color || 'green'
        // this.boxHelper = createDebugCubeForNode(this, this.color);

    }
    insertBody(body) {
        if (this.bodyInNode.length > 1) {
            let octantNumber = determineOctant(this.pos, body.pos);
            if (this.octans[octantNumber] === null) {
                this.createSubNode(octantNumber)
            }
            this.octans[octantNumber].insertBody(body)

        } else if (this.bodyInNode.length === 1) {
            let octantNumber = determineOctant(this.pos, this.bodyOfNode.pos);
            if (this.octans[octantNumber] === null) {
                this.createSubNode(octantNumber)
            }
            this.octans[octantNumber].insertBody(this.bodyOfNode);

            octantNumber = determineOctant(this.pos, body.pos);
            if (this.octans[octantNumber] === null) {
                this.createSubNode(octantNumber)
            }
            this.octans[octantNumber].insertBody(body);

            // this.boxHelper.removeFromParent()

        } else if (this.bodyInNode.length === 0) {
            this.bodyOfNode = body;
        }
        this.bodyInNode.push(body);
    }
    createSubNode(octantNumber) {
        // Octant Order
        // TOP   BOTTOM
        // x- x+ 
        // [0,1] [4,5] z-
        // [2,3] [6,7] z+
        let cotanPosOffset = this.size / 4
        let octanPos = [...this.pos]
        let TestoctanPos = [...this.pos]

        if (octantNumber >= 4) {
            octanPos[1] -= cotanPosOffset
            TestoctanPos[1] -= cotanPosOffset
        } else {
            octanPos[1] += cotanPosOffset
            TestoctanPos[1] += cotanPosOffset
        }

        if (octantNumber === 0 || octantNumber === 4) {
            octanPos[0] -= cotanPosOffset
            octanPos[2] -= cotanPosOffset
        } else if (octantNumber === 1 || octantNumber === 5) {
            octanPos[0] += cotanPosOffset
            octanPos[2] -= cotanPosOffset
        } else if (octantNumber === 2 || octantNumber === 6) {
            octanPos[0] -= cotanPosOffset
            octanPos[2] += cotanPosOffset
        } else if (octantNumber === 3 || octantNumber === 7) {
            octanPos[0] += cotanPosOffset
            octanPos[2] += cotanPosOffset
        }

        this.octans[octantNumber] = new node(octanPos, this.size / 2);
    }
    computeCenterOfMass() {

        if (this.bodyInNode.length === 1) {
            this.centerOfMass = this.bodyOfNode.pos
            this.mass = this.bodyOfNode.mass
            return
        } else {
            for (let i = 0; i < this.octans.length; i++) {
                if (this.octans[i] !== null) {
                    this.octans[i].computeCenterOfMass()
                    this.mass += this.octans[i].mass
                    this.centerOfMass[0] += this.octans[i].centerOfMass[0] * this.octans[i].mass
                    this.centerOfMass[1] += this.octans[i].centerOfMass[1] * this.octans[i].mass
                    this.centerOfMass[2] += this.octans[i].centerOfMass[2] * this.octans[i].mass
                }
            }
            this.centerOfMass[0] /= this.mass
            this.centerOfMass[1] /= this.mass
            this.centerOfMass[2] /= this.mass
        }
    }
    calculateForce(body) {
        let force = {
            x: 0,
            y: 0,
            z: 0
        }

        if (this.bodyInNode.length === 1) {
            return force = computeForceWithAnotherBody(body, this.bodyOfNode)
        } else {
            let r = Math.sqrt((this.centerOfMass[0] - body.pos[0]) ** 2 + (this.centerOfMass[1] - body.pos[1]) ** 2 + (this.centerOfMass[2] - body.pos[2]) ** 2)
            let d = this.size

            if (d / r < theta) {
                let bodyNode = {
                    pos: this.centerOfMass,
                    mass: this.mass
                }
                let f = computeForceWithAnotherBody(body, bodyNode)
                return f
            } else {
                for (let i = 0; i < this.octans.length; i++) {
                    if (this.octans[i] !== null) {
                        let f = this.octans[i].calculateForce(body)
                        force.x += f.x
                        force.y += f.y
                        force.z += f.z
                    }
                }
                return force;
            }
        }
        // console.log('force', this.bodyInNode.length);
    }
}
function determineOctant(nodePos, bodyPos) {
    let octantId = 0
    if (bodyPos[0] < nodePos[1]) octantId += 4
    if (bodyPos[1] > nodePos[0]) octantId += 1
    if (bodyPos[2] > nodePos[2]) octantId += 2

    return octantId;
}
function createDebugCubeForNode(node, color) {
    let box3 = new THREE.Box3();
    box3.setFromCenterAndSize(new THREE.Vector3(...node.pos), new THREE.Vector3(node.size, node.size, node.size));
    // box3.setFromCenterAndSize(new THREE.Vector3(...node.pos), new THREE.Vector3(node.size, 0, node.size));
    let boxH = new THREE.Box3Helper(box3, color);
    debugObject.add(boxH);
    return boxH;

}


export { generateStarsPositions, updateDirectSum, updateBarnesHut }