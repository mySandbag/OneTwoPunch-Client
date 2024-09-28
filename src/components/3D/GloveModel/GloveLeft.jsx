import { useState, useEffect, useRef } from "react";
import { Vector3, Box3, Box3Helper, Color } from "three";
import { useLoader, useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import {
  GLOVE_SPEED,
  GLOVE_DIRECTION,
  LEFT_GLOVE_POSITION,
  LEFT_GLOVE_ROTATION,
} from "../../../constants/animationSettings";

import usePackageStore from "../../../store";

import { checkOBBCollision } from "../../../common/physics/checkOBBCollision";
import { visualizeOriginalAxesAtPoint } from "../../../common/physics/visualizeOriginalAxesAtPoint";
import { computeAxesAtPoint } from "../../../common/physics/computeAxesAtPoint";
import {
  computeForwardMovement,
  computeBackwardMovement,
  computeTurningPoint,
} from "../../../common/animation/computeLeftGloveMovement.js";

import punchTargetSound from "/sound/punchTarget.mp3";
import punchAirSound from "/sound/punchAir.mp3";

function GloveLeft({ triggerAnimation, onAnimationEnd }) {
  const gloveLeft = useLoader(GLTFLoader, "/model/glove_left/gloveLeft.gltf");
  const {
    updateHitCount,
    getHitInProgress,
    setHitInProgress,
    getSandbagInMotion,
    setAnotherHit,
    updateComboCount,
    resetComboCount,
    getCurrentGloveAnimation,
    setCurrentGloveAnimation,
    setSummonPosition,
    getSummonPosition,
    setLeftGloveOBB,
    getLeftGloveOBB,
    getSandbagOBB,
    setCurrentPosition,
    setCurrentRotation,
    getCurrentPosition,
    getCurrentRotation,
    setLatestHitState,
    initializeLeftGloveCurrentState,
  } = usePackageStore();

  const { scene } = useThree();

  const [originalBoundingBox, setOriginalBoundingBox] = useState(null);

  const gloveLeftRef = useRef();
  const speedRef = useRef(GLOVE_SPEED.PUNCH_INITIAL);
  const directionRef = useRef(GLOVE_DIRECTION.LEFT_FORWARD);
  const isHookTurnedRef = useRef(false);
  const isUppercutTurnedRef = useRef(false);
  const isFirstCollisionInCycleRef = useRef(true);
  const validHitCount = useRef(0);

  const axesRef = useRef([]);
  const punchTargetSoundRef = useRef(null);
  const punchAirSoundRef = useRef(null);

  const frameCountRef = useRef(0);

  const updateGloveOBBState = () => {
    const centerPoint = new Vector3(
      gloveLeftRef.current.position.x,
      gloveLeftRef.current.position.y,
      gloveLeftRef.current.position.z,
    );
    const currentAxis = computeAxesAtPoint(
      gloveLeftRef.current.position.x,
      gloveLeftRef.current.position.y,
      gloveLeftRef.current.position.z,
      gloveLeftRef.current.rotation,
      axesRef,
      scene,
    );
    setLeftGloveOBB({ center: centerPoint, rotation: currentAxis });
  };

  const initializeGloveRef = () => {
    gloveLeftRef.current.position.x = LEFT_GLOVE_POSITION.INITIAL_X;
    gloveLeftRef.current.position.y = LEFT_GLOVE_POSITION.INITIAL_Y;
    gloveLeftRef.current.position.z = LEFT_GLOVE_POSITION.INITIAL_Z;

    gloveLeftRef.current.rotation.x = LEFT_GLOVE_ROTATION.INITIAL_X;
    gloveLeftRef.current.rotation.y = LEFT_GLOVE_ROTATION.INITIAL_Y;
    gloveLeftRef.current.rotation.z = LEFT_GLOVE_ROTATION.INITIAL_Z;

    directionRef.current = GLOVE_DIRECTION.LEFT_FORWARD;
    speedRef.current = GLOVE_SPEED.PUNCH_INITIAL;
    isFirstCollisionInCycleRef.current = true;
    isHookTurnedRef.current = false;
    isUppercutTurnedRef.current = false;

    updateGloveOBBState();

    setCurrentGloveAnimation({ left: "" });
    initializeLeftGloveCurrentState();
  };

  useEffect(() => {
    if (gloveLeft) {
      gloveLeft.scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }

    return () => {
      if (gloveLeftRef.current) {
        gloveLeftRef.current.traverse((child) => {
          if (child.isMesh) {
            child.geometry.dispose();
            child.material.dispose();
          }
        });
      }
      scene.remove(gloveLeft.scene);
      gloveLeftRef.current = null;
    };
  }, [gloveLeft]);

  useEffect(() => {
    punchTargetSoundRef.current = new Audio(punchTargetSound);
    punchAirSoundRef.current = new Audio(punchAirSound);
    punchTargetSoundRef.current.load();
    punchAirSoundRef.current.load();

    if (gloveLeftRef.current) {
      const originalBox = new Box3().setFromObject(gloveLeftRef.current);
      setOriginalBoundingBox(originalBox.clone());

      initializeGloveRef();

      const movedBox = new Box3().setFromObject(gloveLeftRef.current);
      const movedHelper = new Box3Helper(movedBox, new Color(0xff00ff));

      if (import.meta.env.VITE_ENVIRONMENT === "DEV") {
        scene.add(movedHelper);
      }
    }
  }, []);

  useEffect(() => {
    if (originalBoundingBox) {
      if (!getSummonPosition().isLeftInitialized) {
        const boxHalfSize = {
          x: (originalBoundingBox.max.x - originalBoundingBox.min.x) / 2,
          y: (originalBoundingBox.max.y - originalBoundingBox.min.y) / 2,
          z: (originalBoundingBox.max.z - originalBoundingBox.min.z) / 2,
        };

        setLeftGloveOBB({
          halfSize: {
            x: boxHalfSize.x,
            y: boxHalfSize.y,
            z: boxHalfSize.z,
          },
        });

        const helper = new Box3Helper(originalBoundingBox, new Color(0x800080));
        const helperCenter = new Vector3();
        originalBoundingBox.getCenter(helperCenter);

        setSummonPosition({
          leftX: helperCenter.x,
          leftY: helperCenter.y,
          leftZ: helperCenter.z,
          isLeftInitialized: true,
        });
        if (import.meta.env.VITE_ENVIRONMENT === "DEV") {
          scene.add(helper);
        }
      }

      const xyzPosition = [getSummonPosition().leftX, getSummonPosition().leftY, getSummonPosition().leftZ];

      if (import.meta.env.VITE_ENVIRONMENT === "DEV") {
        visualizeOriginalAxesAtPoint(...xyzPosition, axesRef, scene);
      }

      return () => {
        if (import.meta.env.VITE_ENVIRONMENT === "DEV") {
          axesRef.current.forEach((axis) => scene.remove(axis));
          axesRef.current = [];
        }
      };
    }
  }, [originalBoundingBox]);

  const { leftX: xPosition, leftY: yPosition } = getCurrentPosition();
  const { leftX: xRotation, leftY: yRotation, leftZ: zRotation } = getCurrentRotation();

  const punchType = getCurrentGloveAnimation().left;

  const transformGloveRef = (FPSFactor) => {
    gloveLeftRef.current.position.set(
      xPosition,
      yPosition,
      gloveLeftRef.current.position.z + speedRef.current * directionRef.current * FPSFactor,
    );

    if (punchType === "punch") {
      gloveLeftRef.current.rotation.set(-xRotation, yRotation, zRotation);
    }

    if (punchType === "hook") {
      gloveLeftRef.current.rotation.set(-xRotation, yRotation, -zRotation);
    }

    if (punchType === "uppercut") {
      gloveLeftRef.current.rotation.set(-xRotation, -yRotation, zRotation);
    }
  };

  const handleCollision = () => {
    const isCollide = checkOBBCollision(getLeftGloveOBB(), getSandbagOBB());
    const validHit = isCollide && isFirstCollisionInCycleRef.current;
    const nthHit = isCollide && isFirstCollisionInCycleRef.current && getSandbagInMotion();
    const isCollisionStateEnd = !isCollide && !isFirstCollisionInCycleRef.current && getHitInProgress();
    const isAirSoundTriggered = !isCollide && isFirstCollisionInCycleRef.current && punchAirSoundRef.current.paused;

    if (nthHit) {
      setAnotherHit(true);
    }
    if (validHit) {
      punchTargetSoundRef.current.currentTime = 0;
      punchTargetSoundRef.current.play();

      isFirstCollisionInCycleRef.current = false;
      validHitCount.current += 1;
      updateHitCount();
      updateComboCount();
      setHitInProgress(true);
      setLatestHitState({
        hitRotation: getLeftGloveOBB().rotation.elements,
        latestPart: "left",
        latestAnimation: punchType,
      });
    }
    if (isAirSoundTriggered) {
      punchAirSoundRef.current.play();
    }
    if (isCollisionStateEnd) {
      setHitInProgress(false);
    }
  };

  useFrame((state, delta) => {
    if (triggerAnimation && gloveLeftRef.current) {
      const frameCount = frameCountRef.current;
      const ideal60FPS = 1 / 60;
      const FPSFactor = delta / ideal60FPS;

      if (
        (import.meta.env.VITE_SPEED_SETTING === "SLOW" && frameCount % 5 === 0) ||
        import.meta.env.VITE_SPEED_SETTING !== "SLOW"
      ) {
        const currentPositionZ = gloveLeftRef.current.position.z;
        const isMovingForward = directionRef.current < 0;
        const isGloveReturnToOriginPoint = currentPositionZ > LEFT_GLOVE_POSITION.INITIAL_Z;

        computeTurningPoint(punchType, gloveLeftRef, isHookTurnedRef, isUppercutTurnedRef, directionRef);

        if (isMovingForward) {
          const { newPosition, newRotation } = computeForwardMovement(
            punchType,
            getCurrentPosition(),
            getCurrentRotation(),
            FPSFactor,
            isHookTurnedRef,
            isUppercutTurnedRef,
            speedRef,
          );

          setCurrentPosition(newPosition);
          setCurrentRotation(newRotation);
        } else {
          const { newPosition, newRotation } = computeBackwardMovement(
            punchType,
            getCurrentPosition(),
            getCurrentRotation(),
            FPSFactor,
            isHookTurnedRef,
            speedRef,
          );

          setCurrentPosition(newPosition);
          setCurrentRotation(newRotation);
        }

        transformGloveRef(FPSFactor);
        handleCollision();
        updateGloveOBBState();

        if (isGloveReturnToOriginPoint) {
          initializeGloveRef();

          if (!validHitCount.current) {
            resetComboCount();
          }
          validHitCount.current = 0;

          onAnimationEnd();
        }
      }
      frameCountRef.current += 1;
    }
  });

  return <primitive object={gloveLeft.scene} ref={gloveLeftRef} />;
}

export default GloveLeft;
