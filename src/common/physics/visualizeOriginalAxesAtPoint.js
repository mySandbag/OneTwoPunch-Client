import { Vector3, BufferGeometry, Line, LineBasicMaterial } from "three";

export const visualizeOriginalAxesAtPoint = (x, y, z, ref, scene) => {
  ref.current.forEach((axis) => scene.remove(axis));
  ref.current = [];

  const center = new Vector3(x, y, z);
  const lineMaterial = new LineBasicMaterial({ color: 0xff0000 });

  const xGeometry = new BufferGeometry().setFromPoints([
    center,
    new Vector3(x + 10, y, z),
  ]);
  const yGeometry = new BufferGeometry().setFromPoints([
    center,
    new Vector3(x, y + 10, z),
  ]);
  const zGeometry = new BufferGeometry().setFromPoints([
    center,
    new Vector3(x, y, z + 10),
  ]);

  const xLine = new Line(xGeometry, lineMaterial);
  const yLine = new Line(yGeometry, lineMaterial);
  const zLine = new Line(zGeometry, lineMaterial);

  scene.add(xLine);
  scene.add(yLine);
  scene.add(zLine);

  ref.current.push(xLine);
  ref.current.push(yLine);
  ref.current.push(zLine);
};
