import { useState, useEffect, useRef } from "react";
import { Vector3, Box3, Box3Helper, Color } from "three";
import { useLoader, useFrame, useThree } from "@react-three/fiber";
import { degToRad } from "../../../common/utils/mathUtils";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import {
  GLOVE_SPEED,
  GLOVE_DIRECTION,
  MAX_GLOVE_REACH,
  RIGHT_GLOVE_POSITION,
  RIGHT_GLOVE_ROTATION,
  RIGHT_ANGLE,
} from "../../../constants/animationSettings";

import usePackageStore from "../../../store";

import { checkOBBCollision } from "../../../common/physics/checkOBBCollision";
import { visualizeOriginalAxesAtPoint } from "../../../common/physics/visualizeOriginalAxesAtPoint";
import { computeAxesAtPoint } from "../../../common/physics/computeAxesAtPoint";
import {
  computeForwardMovement,
  computeBackwardMovement,
  computeTurningPoint,
} from "../../../common/animation/computeRightGloveMovement.js";

import punchTargetSound from "/sound/punchTarget.mp3";
import punchAirSound from "/sound/punchAir.mp3";

function GloveRight({ triggerAnimation, onAnimationEnd }) {
  const gloveRight = useLoader(
    GLTFLoader,
    "/model/glove_right/gloveRight.gltf",
  );

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
    setRightGloveOBB,
    getRightGloveOBB,
    getSandbagOBB,
    setCurrentPosition,
    setCurrentRotation,
    getCurrentPosition,
    getCurrentRotation,
    setLatestHitState,
    initializeRightGloveCurrentState,
  } = usePackageStore();

  const { scene } = useThree();

  const [originalBoundingBox, setOriginalBoundingBox] = useState(null);

  const gloveRightRef = useRef();
  const speedRef = useRef(GLOVE_SPEED.PUNCH_INITIAL);
  const directionRef = useRef(GLOVE_DIRECTION.RIGHT_FORWARD);
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
      gloveRightRef.current.position.x,
      gloveRightRef.current.position.y,
      gloveRightRef.current.position.z,
    );

    const currentAxis = computeAxesAtPoint(
      gloveRightRef.current.position.x,
      gloveRightRef.current.position.y,
      gloveRightRef.current.position.z,
      gloveRightRef.current.rotation,
      axesRef,
      scene,
    );
    setRightGloveOBB({ center: centerPoint, rotation: currentAxis });
  };

  const initializeGloveRef = () => {
    gloveRightRef.current.position.x = RIGHT_GLOVE_POSITION.INITIAL_X;
    gloveRightRef.current.position.y = RIGHT_GLOVE_POSITION.INITIAL_Y;
    gloveRightRef.current.position.z = RIGHT_GLOVE_POSITION.INITIAL_Z;

    gloveRightRef.current.rotation.x = -RIGHT_GLOVE_ROTATION.INITIAL_X;
    gloveRightRef.current.rotation.y = -RIGHT_GLOVE_ROTATION.INITIAL_Y;
    gloveRightRef.current.rotation.z = -RIGHT_GLOVE_ROTATION.INITIAL_Z;

    directionRef.current = GLOVE_DIRECTION.RIGHT_FORWARD;
    speedRef.current = GLOVE_SPEED.PUNCH_INITIAL;
    isFirstCollisionInCycleRef.current = true;
    isHookTurnedRef.current = false;
    isUppercutTurnedRef.current = false;

    updateGloveOBBState();

    setCurrentGloveAnimation({ right: "" });
    initializeRightGloveCurrentState();
  };

  useEffect(() => {
    gloveRight.scene.traverse((child) => {
      if (gloveRight) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      }
    });

    return () => {
      if (gloveRightRef.current) {
        gloveRightRef.current.traverse((child) => {
          if (child.isMesh) {
            child.geometry.dispose();
            child.material.dispose();
          }
        });
      }
      scene.remove(gloveRight.scene);
      gloveRightRef.current = null;
    };
  }, [gloveRight]);

  useEffect(() => {
    punchTargetSoundRef.current = new Audio(punchTargetSound);
    punchAirSoundRef.current = new Audio(punchAirSound);
    punchTargetSoundRef.current.load();
    punchAirSoundRef.current.load();

    if (gloveRightRef.current) {
      const originalBox = new Box3().setFromObject(gloveRightRef.current);
      setOriginalBoundingBox(originalBox.clone());

      initializeGloveRef();

      const movedBox = new Box3().setFromObject(gloveRightRef.current);
      const movedHelper = new Box3Helper(movedBox, new Color(0x00ff00));
      if (import.meta.env.VITE_ENVIRONMENT === "DEV") {
        scene.add(movedHelper);
      }
    }
  }, []);

  useEffect(() => {
    if (originalBoundingBox) {
      if (!getSummonPosition().isRightInitialized) {
        const boxHalfSize = {
          x: (originalBoundingBox.max.x - originalBoundingBox.min.x) / 2,
          y: (originalBoundingBox.max.y - originalBoundingBox.min.y) / 2,
          z: (originalBoundingBox.max.z - originalBoundingBox.min.z) / 2,
        };

        setRightGloveOBB({
          halfSize: {
            x: boxHalfSize.x,
            y: boxHalfSize.y,
            z: boxHalfSize.z,
          },
        });

        const helper = new Box3Helper(originalBoundingBox, new Color(0x00ffff));
        const helperCenter = new Vector3();
        originalBoundingBox.getCenter(helperCenter);

        setSummonPosition({
          rightX: helperCenter.x,
          rightY: helperCenter.y,
          rightZ: helperCenter.z,
          isRightInitialized: true,
        });
        if (import.meta.env.VITE_ENVIRONMENT === "DEV") {
          scene.add(helper);
        }
      }

      const xyzPosition = [
        getSummonPosition().rightX,
        getSummonPosition().rightY,
        getSummonPosition().rightZ,
      ];

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

  const { rightX: xPosition, rightY: yPosition } = getCurrentPosition();
  const {
    rightX: xRotation,
    rightY: yRotation,
    rightZ: zRotation,
  } = getCurrentRotation();

  const punchType = getCurrentGloveAnimation().right;

  const transformGloveRef = (FPSFactor) => {
    gloveRightRef.current.position.x = xPosition;
    gloveRightRef.current.position.y = yPosition;
    gloveRightRef.current.position.z +=
      speedRef.current * directionRef.current * FPSFactor;

    gloveRightRef.current.rotation.x = -Math.min(xRotation, RIGHT_ANGLE);
    gloveRightRef.current.rotation.y = -Math.min(yRotation, RIGHT_ANGLE);
    gloveRightRef.current.rotation.z = -Math.min(zRotation, RIGHT_ANGLE);

    if (getCurrentGloveAnimation().right === "punch") {
      gloveRightRef.current.rotation.z = degToRad(0);
    }
    if (getCurrentGloveAnimation().right === "hook") {
      gloveRightRef.current.rotation.z = zRotation;
    }
  };

  const handleCollision = () => {
    const isCollide = checkOBBCollision(getRightGloveOBB(), getSandbagOBB());
    const validHit = isCollide && isFirstCollisionInCycleRef.current;
    const nthHit =
      isCollide && isFirstCollisionInCycleRef.current && getSandbagInMotion();
    const isCollisionStateEnd =
      !isCollide && !isFirstCollisionInCycleRef.current && getHitInProgress();
    const isAirSoundTriggered =
      !isCollide &&
      isFirstCollisionInCycleRef.current &&
      punchAirSoundRef.current.paused;

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
        hitRotation: getRightGloveOBB().rotation.elements,
        latestPart: "right",
        latestAnimation: getCurrentGloveAnimation().right,
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
    if (triggerAnimation && gloveRightRef.current) {
      const frameCount = frameCountRef.current;
      const ideal60FPS = 1 / 60;
      const FPSFactor = delta / ideal60FPS;

      if (
        (import.meta.env.VITE_SPEED_SETTING === "SLOW" &&
          frameCount % 5 === 0) ||
        import.meta.env.VITE_SPEED_SETTING !== "SLOW"
      ) {
        const currentPositionZ = gloveRightRef.current.position.z;
        const isMovingForward = directionRef.current < 0;
        const isGloveReturnToOriginPoint =
          currentPositionZ > RIGHT_GLOVE_POSITION.INITIAL_Z;

        computeTurningPoint(
          punchType,
          gloveRightRef,
          isHookTurnedRef,
          isUppercutTurnedRef,
          directionRef,
        );

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

  return <primitive object={gloveRight.scene} ref={gloveRightRef} />;
}

export default GloveRight;
