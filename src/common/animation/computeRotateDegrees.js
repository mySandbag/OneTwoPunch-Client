export const rotateCenterPointByDegrees = (originZ, degree) => {
  const currentAngle = originZ > 0 ? 90 : 270;

  const newAngle = currentAngle + degree;

  const radians = (newAngle * Math.PI) / 180;
  const x = Math.cos(radians) * Math.abs(originZ);
  const z = Math.sin(radians) * Math.abs(originZ);

  return { x, z };
};

const getTangentSlope = (x, z) => {
  return -x / z;
};

const getBothSidePosition = (x, z, distance, direction) => {
  const slope = getTangentSlope(x, z);

  const dx = distance / Math.sqrt(1 + slope * slope);
  const dz = slope * dx;

  if (direction === "left") {
    return { x: -(x + dx), z: z + dz };
  } else if (direction === "right") {
    return { x: -(x - dx), z: z - dz };
  }
};

export const getNewGlovesPoints = (originZ, degree, distance) => {
  const { x, z } = rotateCenterPointByDegrees(originZ, degree);

  const leftGlove = getBothSidePosition(x, z, distance, "left");
  const rightGlove = getBothSidePosition(x, z, distance, "right");

  return { leftGlove, rightGlove };
};
