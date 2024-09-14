import * as THREE from "three";

export const drawAxesAtPoint = (x, y, z, ref, scene) => {
  ref.current.forEach((axis) => scene.remove(axis));
  ref.current = [];

  const center = new THREE.Vector3(x, y, z);
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

  const xGeometry = new THREE.BufferGeometry().setFromPoints([
    center,
    new THREE.Vector3(x + 10, y, z),
  ]);
  const xLine = new THREE.Line(xGeometry, lineMaterial);
  scene.add(xLine);
  ref.current.push(xLine);

  const yGeometry = new THREE.BufferGeometry().setFromPoints([
    center,
    new THREE.Vector3(x, y + 10, z),
  ]);
  const yLine = new THREE.Line(yGeometry, lineMaterial);
  scene.add(yLine);
  ref.current.push(yLine);

  const zGeometry = new THREE.BufferGeometry().setFromPoints([
    center,
    new THREE.Vector3(x, y, z + 10),
  ]);
  const zLine = new THREE.Line(zGeometry, lineMaterial);
  scene.add(zLine);
  ref.current.push(zLine);
};
