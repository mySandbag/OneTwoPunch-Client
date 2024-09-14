import * as THREE from "three";

export const drawDynamicAxesAtPoint = (x, y, z, rotation, ref, scene) => {
  ref.current.forEach((axis) => scene.remove(axis));
  ref.current = [];

  const center = new THREE.Vector3(x, y, z);

  const xEnd = new THREE.Vector3(10, 0, 0).applyEuler(rotation).add(center);
  const xGeometry = new THREE.BufferGeometry().setFromPoints([center, xEnd]);
  const xLine = new THREE.Line(xGeometry, new THREE.LineBasicMaterial({ color: 0xff0000 }));
  scene.add(xLine);
  ref.current.push(xLine);

  const yEnd = new THREE.Vector3(0, 10, 0).applyEuler(rotation).add(center);
  const yGeometry = new THREE.BufferGeometry().setFromPoints([center, yEnd]);
  const yLine = new THREE.Line(yGeometry, new THREE.LineBasicMaterial({ color: 0x00ff00 }));
  scene.add(yLine);
  ref.current.push(yLine);

  const zEnd = new THREE.Vector3(0, 0, 10).applyEuler(rotation).add(center);
  const zGeometry = new THREE.BufferGeometry().setFromPoints([center, zEnd]);
  const zLine = new THREE.Line(zGeometry, new THREE.LineBasicMaterial({ color: 0x0000ff }));
  scene.add(zLine);
  ref.current.push(zLine);
};
