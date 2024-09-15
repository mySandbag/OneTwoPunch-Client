import { Vector3 } from "three";

const getAxis = (obb, index) => {
  return new Vector3(...obb.rotation.elements.slice(index * 3, index * 3 + 3));
};

const projectOBB = (obb, axis) => {
  let r =
    obb.halfSize.x * Math.abs(axis.dot(getAxis(obb, 0))) +
    obb.halfSize.y * Math.abs(axis.dot(getAxis(obb, 1))) +
    obb.halfSize.z * Math.abs(axis.dot(getAxis(obb, 2)));
  return r;
};

const testAxisSeparation = (axis, obb1, obb2) => {
  let r1 = projectOBB(obb1, axis);
  let r2 = projectOBB(obb2, axis);

  let distance = Math.abs(
    axis.dot(new Vector3().subVectors(obb2.center, obb1.center)),
  );
  return distance > r1 + r2;
};

export const checkOBBCollision = (obb1, obb2) => {
  for (let i = 0; i < 3; i++) {
    if (testAxisSeparation(getAxis(obb1, i), obb1, obb2)) return false;
    if (testAxisSeparation(getAxis(obb2, i), obb1, obb2)) return false;
  }

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let axis = new Vector3().crossVectors(getAxis(obb1, i), getAxis(obb2, j));
      if (axis.length() > 0) {
        if (testAxisSeparation(axis, obb1, obb2)) return false;
      }
    }
  }
  return "충돌함";
};
