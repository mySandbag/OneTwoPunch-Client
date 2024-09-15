import { Vector3, BufferGeometry, Line, LineBasicMaterial } from "three";

export const drawAxesAtPoint = (x, y, z, ref, scene) => {
  ref.current.forEach((axis) => scene.remove(axis));
  ref.current = [];

  const center = new Vector3(x, y, z);
  const lineMaterial = new LineBasicMaterial({ color: 0xff0000 });

  const xGeometry = new BufferGeometry().setFromPoints([
    center,
    new Vector3(x + 10, y, z),
  ]);
  const xLine = new Line(xGeometry, lineMaterial);
  scene.add(xLine);
  ref.current.push(xLine);

  const yGeometry = new BufferGeometry().setFromPoints([
    center,
    new Vector3(x, y + 10, z),
  ]);
  const yLine = new Line(yGeometry, lineMaterial);
  scene.add(yLine);
  ref.current.push(yLine);

  const zGeometry = new BufferGeometry().setFromPoints([
    center,
    new Vector3(x, y, z + 10),
  ]);
  const zLine = new Line(zGeometry, lineMaterial);
  scene.add(zLine);
  ref.current.push(zLine);
};
