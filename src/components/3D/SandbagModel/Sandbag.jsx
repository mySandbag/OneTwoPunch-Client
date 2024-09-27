import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { useLoader, useThree, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import {
  SANDBAG_POSITION,
  SANDBAG_PENDULUM,
} from "../../../constants/animationSettings";

import { visualizeOriginalAxesAtPoint } from "../../../common/visualizeOriginalAxesAtPoint";
import { computeAxesAtPoint } from "../../../common/computeAxesAtPoint";
import usePackageStore from "../../../store";

function SandbagModel({ triggerAnimation, onAnimationEnd }) {
  const sandbag = useLoader(GLTFLoader, "/model/sandbag/sandbag.gltf");
  const {
    setSummonPosition,
    getSummonPosition,
    setSandbagOBB,
    getAnotherHit,
    setAnotherHit,
    setSandbagInMotion,
    getLatestHitState,
    resetComboCount,
  } = usePackageStore();
  const { scene } = useThree();

  const damping = SANDBAG_PENDULUM.DAMPING;
  const gravity = SANDBAG_PENDULUM.GRAVITY;

  const [originalBoundingBox, setOriginalBoundingBox] = useState(null);

  const angleRef = useRef(0);
  const angleAccelerateRef = useRef(0);
  const angleVelocityRef = useRef(0);
  const isStartRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const frameCountRef = useRef(0);

  const sandbagRef = useRef();
  const axesRef = useRef([]);

  const currentXAngleRef = useRef(0);
  const targetXAngleRef = useRef(0);
  const currentZAngleRef = useRef(0);
  const targetZAngleRef = useRef(0);

  useEffect(() => {
    if (triggerAnimation) {
      isAnimatingRef.current = true;
    }
  }, [triggerAnimation]);

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
      sandbagRef.current.rotation.x = 0;
      sandbagRef.current.rotation.z = 0;

      const movedBox = new THREE.Box3().setFromObject(sandbagRef.current, true);
      const movedHelper = new THREE.Box3Helper(
        movedBox,
        new THREE.Color(0x0000ff),
      );

      const centerPoint = new THREE.Vector3();
      movedBox.getCenter(centerPoint);

      setSandbagOBB({
        center: centerPoint,
      });

      if (import.meta.env.VITE_ENVIRONMENT === "DEV") {
        scene.add(movedHelper);
      }
      return () => {
        scene.remove(sandbag.scene);
        sandbagRef.current = null;
        setAnotherHit(false);
        setSandbagInMotion(false);

        const rotationMatrix = new THREE.Matrix3();
        rotationMatrix.set(1, 0, 0, 0, 1, 0, 0, 0, 1);
        setSandbagOBB({
          rotation: rotationMatrix,
        });
      };
    }
  }, []);

  useEffect(() => {
    if (originalBoundingBox) {
      if (!getSummonPosition().isSandbagInitialized) {
        const boxHalfSize = {
          x: (originalBoundingBox.max.x - originalBoundingBox.min.x) / 2,
          y: originalBoundingBox.max.y - originalBoundingBox.min.y,
          z: (originalBoundingBox.max.z - originalBoundingBox.min.z) / 2,
        };

        const rotationMatrix = new THREE.Matrix3();
        rotationMatrix.set(1, 0, 0, 0, 1, 0, 0, 0, 1);

        setSandbagOBB({
          halfSize: {
            x: boxHalfSize.x,
            y: boxHalfSize.y,
            z: boxHalfSize.z,
          },
          rotation: rotationMatrix,
        });

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
        visualizeOriginalAxesAtPoint(...xyzPosition, axesRef, scene);
      }
      sandbagRef.current.rotation.x = 0;
      sandbagRef.current.rotation.z = 0;

      return () => {
        if (import.meta.env.VITE_ENVIRONMENT === "DEV") {
          axesRef.current.forEach((axis) => scene.remove(axis));
          axesRef.current = [];
        }
      };
    }
  }, [originalBoundingBox]);

  const stopPendulum = () => {
    angleRef.current = 0;
    angleAccelerateRef.current = 0;
    angleVelocityRef.current = 0;
    isStartRef.current = false;
    isAnimatingRef.current = false;

    resetComboCount();
    setAnotherHit(false);
    setSandbagInMotion(false);

    sandbagRef.current.rotation.x = 0;
    sandbagRef.current.rotation.z = 0;
  };

  const animatePendulum = () => {
    let currentAngle = angleRef.current;
    let currentAngleVelocity = angleVelocityRef.current;
    let currentAngleAccelerate = angleAccelerateRef.current;

    if (!isStartRef.current) {
      currentAngleVelocity = SANDBAG_PENDULUM.INITIAL_ANGLE_VELOCITY;
      isStartRef.current = true;
      setSandbagInMotion(true);

      const xHookFactor =
        getLatestHitState().latestAnimation === "hook" ? 0.5 : 1;
      const zHookFactor =
        getLatestHitState().latestAnimation === "hook" ? 2 : 1;
      const zLeftFactor = getLatestHitState().latestPart === "left" ? -1 : 1;

      targetXAngleRef.current = xHookFactor;
      targetZAngleRef.current = -zLeftFactor * zHookFactor;
      currentXAngleRef.current = targetXAngleRef.current;
      currentZAngleRef.current = targetZAngleRef.current;
    }

    if (getAnotherHit()) {
      currentAngleVelocity += SANDBAG_PENDULUM.DELTA_VELOCITY;
      setAnotherHit(false);

      const xHookFactor =
        getLatestHitState().latestAnimation === "hook" ? 0.5 : 1;
      const zHookFactor =
        getLatestHitState().latestAnimation === "hook" ? 2 : 1;
      const zLeftFactor = getLatestHitState().latestPart === "left" ? -1 : 1;

      targetXAngleRef.current = xHookFactor;
      targetZAngleRef.current = -zLeftFactor * zHookFactor;
    }

    const force = gravity * Math.sin(currentAngle);
    currentAngleAccelerate = -1 * force;
    currentAngleVelocity =
      (currentAngleVelocity + currentAngleAccelerate) * damping;
    currentAngle += currentAngleVelocity;

    const interpolationSpeed = SANDBAG_PENDULUM.INTERPOLATION_SPEED;

    currentXAngleRef.current +=
      (targetXAngleRef.current - currentXAngleRef.current) * interpolationSpeed;
    currentZAngleRef.current +=
      (targetZAngleRef.current - currentZAngleRef.current) * interpolationSpeed;

    sandbagRef.current.rotation.x = currentAngle * currentXAngleRef.current;
    sandbagRef.current.rotation.z = currentAngle * currentZAngleRef.current;

    const centerPoint = new THREE.Vector3(
      sandbagRef.current.position.x,
      sandbagRef.current.position.y,
      sandbagRef.current.position.z,
    );
    const currentAxis = computeAxesAtPoint(
      sandbagRef.current.position.x,
      sandbagRef.current.position.y,
      sandbagRef.current.position.z,
      sandbagRef.current.rotation,
      axesRef,
      scene,
    );
    setSandbagOBB({ center: centerPoint, rotation: currentAxis });

    angleRef.current = currentAngle;
    angleVelocityRef.current = currentAngleVelocity;
    angleAccelerateRef.current = currentAngleAccelerate;

    if (
      isStartRef.current &&
      Math.abs(angleRef.current) < SANDBAG_PENDULUM.STOP_CONDITION &&
      Math.abs(angleVelocityRef.current) < SANDBAG_PENDULUM.STOP_CONDITION &&
      Math.abs(sandbagRef.current.rotation.x) <
        SANDBAG_PENDULUM.STOP_CONDITION &&
      Math.abs(sandbagRef.current.rotation.z) < SANDBAG_PENDULUM.STOP_CONDITION
    ) {
      stopPendulum();
      onAnimationEnd();
    }
  };

  useFrame(() => {
    if (isAnimatingRef.current && sandbagRef.current) {
      if (
        (import.meta.env.VITE_SPEED_SETTING === "SLOW" &&
          frameCountRef.current % 5 === 0) ||
        import.meta.env.VITE_SPEED_SETTING !== "SLOW"
      ) {
        animatePendulum();
      }
      frameCountRef.current += 1;
    }
  });

  return <primitive object={sandbag.scene} ref={sandbagRef} />;
}

export default SandbagModel;
