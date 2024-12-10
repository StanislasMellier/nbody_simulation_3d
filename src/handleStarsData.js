import { getRandomPointClustered, getRandomPointInSphere, rotatePoint } from './utils'

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

export { generateStarsPositions }