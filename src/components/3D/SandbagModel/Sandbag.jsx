import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { useLoader, useThree, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { SANDBAG_POSITION } from "../../../constants/gloveMotionSettings";

import { drawAxesAtPoint } from "../../../common/drawAxesAtPoint";
import usePackageStore from "../../../store";

function SandbagModel({ triggerAnimation, onAnimationEnd }) {
  const sandbag = useLoader(
    GLTFLoader,
    "/src/assets/model/sandbag/sandbag.gltf",
  );
  const { setSummonPosition, getSummonPosition, setSandbagOBB } =
    usePackageStore();
  const { scene } = useThree();

  const [originalBoundingBox, setOriginalBoundingBox] = useState(null);
  const [angle, setAngle] = useState(Math.PI / 4);
  const [angleAccelerate, setAngleAccelerate] = useState(0);
  const [angleVelocity, setAngleVelocity] = useState(0);
  const [isStart, setIsStart] = useState(false);

  const sandbagRef = useRef();
  const axesRef = useRef([]);

  useEffect(() => {
    sandbag.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [sandbag]);

  useEffect(() => {
    if (sandbagRef.current) {
      const originalBox = new THREE.Box3().setFromObject(
        sandbagRef.current,
        true,
      );
      setOriginalBoundingBox(originalBox.clone());

      sandbagRef.current.position.y = SANDBAG_POSITION.INITIAL_Y;

      const movedBox = new THREE.Box3().setFromObject(sandbagRef.current, true);
      const movedHelper = new THREE.Box3Helper(
        movedBox,
        new THREE.Color(0x0000ff),
      );

      let centerPoint = new THREE.Vector3();
      movedBox.getCenter(centerPoint);
      const boxHalfSize = {
        x: (movedBox.max.x - movedBox.min.x) / 2,
        y: (movedBox.max.y - movedBox.min.y) / 2,
        z: (movedBox.max.z - movedBox.min.z) / 2,
      };

      const rotationMatrix = new THREE.Matrix3();
      rotationMatrix.set(1, 0, 0, 0, 1, 0, 0, 0, 1);

      setSandbagOBB({
        center: centerPoint,
        halfSize: {
          x: boxHalfSize.x,
          y: boxHalfSize.y,
          z: boxHalfSize.z,
        },
        rotation: rotationMatrix,
      });

      if (import.meta.env.VITE_ENVIRONMENT === "DEV") {
        scene.add(movedHelper);
      }
      return () => {
        scene.remove(sandbag.scene);
        sandbagRef.current = null;
      };
    }
  }, []);

  useEffect(() => {
    if (originalBoundingBox) {
      if (!getSummonPosition().isSandbagInitialized) {
        const helper = new THREE.Box3Helper(
          originalBoundingBox,
          new THREE.Color(0x800080),
        );
        const helperCenter = new THREE.Vector3();
        originalBoundingBox.getCenter(helperCenter);

        setSummonPosition({
          sandbagX: helperCenter.x,
          sandbagY: helperCenter.y,
          sandbagZ: helperCenter.z,
          isSandbagInitialized: true,
        });
        if (import.meta.env.VITE_ENVIRONMENT === "DEV") {
          scene.add(helper);
        }
      }

      const xyzPosition = [
        getSummonPosition().sandbagX,
        getSummonPosition().sandbagY,
        getSummonPosition().sandbagZ,
      ];

      if (import.meta.env.VITE_ENVIRONMENT === "DEV") {
        drawAxesAtPoint(...xyzPosition, axesRef, scene);
      }

      return () => {
        if (import.meta.env.VITE_ENVIRONMENT === "DEV") {
          axesRef.current.forEach((axis) => scene.remove(axis));
          axesRef.current = [];
        }
      };
    }
  }, [originalBoundingBox]);

  useFrame(() => {
    if (triggerAnimation && sandbagRef.current) {
      const damping = 0.94;
      const gravity = 0.01;

      if (sandbagRef.current) {
        let force = gravity * Math.sin(angle);
        setAngleAccelerate((prevAccelerlate) => -1 * force);

        setAngleVelocity(
          (prevVelocity) => (prevVelocity + angleAccelerate) * damping,
        );

        if (isStart && Math.abs(angleAccelerate) < 0.00001) {
          setAngle(Math.PI / 4);
          setAngleAccelerate(0);
          setAngleVelocity(0);
          setIsStart(false);

          onAnimationEnd();
          return;
        }
        setIsStart(true);

        setAngle((prevAngle) => prevAngle + angleVelocity);

        sandbagRef.current.rotation.x = angle;
      }
    }
  });

  return <primitive object={sandbag.scene} ref={sandbagRef} />;
}

export default SandbagModel;
