import {
  Vector3,
  BufferGeometry,
  Line,
  LineBasicMaterial,
  Matrix3,
} from "three";

export const drawDynamicAxesAtPoint = (x, y, z, rotation, ref, scene) => {
  if (import.meta.env.VITE_ENVIRONMENT === "DEV") {
    ref.current.forEach((axis) => scene.remove(axis));
    ref.current = [];
  }

  const center = new Vector3(x, y, z);

  const xEnd = new Vector3(10, 0, 0).applyEuler(rotation).add(center);
  const xGeometry = new BufferGeometry().setFromPoints([center, xEnd]);
  const xLine = new Line(xGeometry, new LineBasicMaterial({ color: 0xff0000 }));

  const yEnd = new Vector3(0, 10, 0).applyEuler(rotation).add(center);
  const yGeometry = new BufferGeometry().setFromPoints([center, yEnd]);
  const yLine = new Line(yGeometry, new LineBasicMaterial({ color: 0x00ff00 }));

  const zEnd = new Vector3(0, 0, 10).applyEuler(rotation).add(center);
  const zGeometry = new BufferGeometry().setFromPoints([center, zEnd]);
  const zLine = new Line(zGeometry, new LineBasicMaterial({ color: 0x0000ff }));

  if (import.meta.env.VITE_ENVIRONMENT === "DEV") {
    scene.add(xLine);
    ref.current.push(xLine);
    scene.add(yLine);
    ref.current.push(yLine);
    scene.add(zLine);
    ref.current.push(zLine);
  }

  const xAxis = new Vector3();
  const yAxis = new Vector3();
  const zAxis = new Vector3();

  xAxis
    .fromBufferAttribute(xLine.geometry.attributes.position, 1)
    .sub(center)
    .normalize();
  yAxis
    .fromBufferAttribute(yLine.geometry.attributes.position, 1)
    .sub(center)
    .normalize();
  zAxis
    .fromBufferAttribute(zLine.geometry.attributes.position, 1)
    .sub(center)
    .normalize();

  const rotationMatrix = new Matrix3();
  rotationMatrix.set(
    xAxis.x,
    yAxis.x,
    zAxis.x,
    xAxis.y,
    yAxis.y,
    zAxis.y,
    xAxis.z,
    yAxis.z,
    zAxis.z,
  );

  return rotationMatrix;
};
