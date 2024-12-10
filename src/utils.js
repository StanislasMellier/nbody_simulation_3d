// stolen from https://karthikkaranth.me/blog/generating-random-points-in-a-sphere/
function getRandomPointInSphere(u, v) {
    var u = Math.random();
    var v = v || Math.random();
    var theta = u * 2.0 * Math.PI;
    var phi = Math.acos(2.0 * v - 1.0);
    var r = Math.cbrt(Math.random());
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);
    var sinPhi = Math.sin(phi);
    var cosPhi = Math.cos(phi);
    var x = r * sinPhi * cosTheta;
    var y = r * sinPhi * sinTheta;
    var z = r * cosPhi;
    return { x: x, y: y, z: z };
}
function getRandomPointClustered() {
    var x = Math.random() - 0.5;
    var y = Math.random() - 0.5;
    var z = Math.random() - 0.5;

    var mag = Math.sqrt(x * x + y * y + z * z);
    x /= mag; y /= mag; z /= mag;

    var d = Math.random();
    return { x: x * d, y: y * d, z: z * d };
}
function rotatePoint(x, y, centerX, centerY, angle) {
    const radians = angle * (Math.PI / 180);
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    const nx = (cos * (x - centerX)) - (sin * (y - centerY)) + centerX;
    const ny = (sin * (x - centerX)) + (cos * (y - centerY)) + centerY;
    return { x: nx, y: ny };
}

export { getRandomPointInSphere, getRandomPointClustered, rotatePoint }