import { useState, useEffect, useRef } from "react";
import { Vector3, Box3, Box3Helper, Color } from "three";
import { useLoader, useFrame, useThree } from "@react-three/fiber";
import { degToRad } from "../../../common/mathUtils";

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
import { checkOBBCollision } from "../../../common/checkOBBCollision";
import { visualizeOriginalAxesAtPoint } from "../../../common/visualizeOriginalAxesAtPoint";
import { computeAxesAtPoint } from "../../../common/computeAxesAtPoint";

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
  const isFirstCollisionInCycleRef = useRef(true);
  const validHitCount = useRef(0);

  const axesRef = useRef([]);
  const punchTargetSoundRef = useRef(null);
  const punchAirSoundRef = useRef(null);

  const frameCountRef = useRef(0);

  const initializeGlovePosition = () => {
    gloveRightRef.current.position.x = RIGHT_GLOVE_POSITION.INITIAL_X;
    gloveRightRef.current.position.y = RIGHT_GLOVE_POSITION.INITIAL_Y;
    gloveRightRef.current.position.z = RIGHT_GLOVE_POSITION.INITIAL_Z;

    gloveRightRef.current.rotation.x = -RIGHT_GLOVE_ROTATION.INITIAL_X;
    gloveRightRef.current.rotation.y = -RIGHT_GLOVE_ROTATION.INITIAL_Y;
    gloveRightRef.current.rotation.z = -RIGHT_GLOVE_ROTATION.INITIAL_Z;

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

      initializeGlovePosition();

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

  const xPosition = getCurrentPosition().rightX;

  const xRotation = getCurrentRotation().rightX;
  const yRotation = getCurrentRotation().rightY;
  const zRotation = getCurrentRotation().rightZ;

  const transformGloveRef = (FPSFactor) => {
    gloveRightRef.current.position.x = xPosition;
    gloveRightRef.current.position.z +=
      speedRef.current * directionRef.current * FPSFactor;

    gloveRightRef.current.rotation.x = -Math.min(xRotation, RIGHT_ANGLE);
    gloveRightRef.current.rotation.y = -Math.min(yRotation, RIGHT_ANGLE);

    if (getCurrentGloveAnimation().right === "punch") {
      gloveRightRef.current.rotation.z = degToRad(0);
    }
    if (getCurrentGloveAnimation().right === "hook") {
      gloveRightRef.current.rotation.z = zRotation;
    }
  };

  const handleCollision = () => {
    const isCollide = checkOBBCollision(getRightGloveOBB(), getSandbagOBB());
    if (
      isCollide &&
      isFirstCollisionInCycleRef.current &&
      getSandbagInMotion()
    ) {
      setAnotherHit(true);
    }
    if (isCollide && isFirstCollisionInCycleRef.current) {
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
    if (
      !isCollide &&
      isFirstCollisionInCycleRef.current &&
      punchAirSoundRef.current.paused
    ) {
      punchAirSoundRef.current.play();
    }
    if (
      !isCollide &&
      !isFirstCollisionInCycleRef.current &&
      getHitInProgress()
    ) {
      setHitInProgress(false);
    }
  };

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

  const handleForwardMovement = (FPSFactor) => {
    if (getCurrentGloveAnimation().right === "punch") {
      speedRef.current += GLOVE_SPEED.PUNCH_INCREMENT;
      setCurrentPosition({
        rightX: Math.max(
          xPosition - RIGHT_GLOVE_POSITION.PUNCH_DELTA_X * FPSFactor,
          0,
        ),
        rightZ: speedRef.current + GLOVE_SPEED.PUNCH_INCREMENT * FPSFactor,
      });
      setCurrentRotation({
        rightX: Math.min(
          xRotation + RIGHT_GLOVE_ROTATION.PUNCH_DELTA_X * FPSFactor,
          RIGHT_ANGLE,
        ),
        rightY: Math.min(
          yRotation + RIGHT_GLOVE_ROTATION.PUNCH_DELTA_Y * FPSFactor,
          RIGHT_ANGLE,
        ),
      });
    }
    if (getCurrentGloveAnimation().right === "hook") {
      const turnFactor = isHookTurnedRef.current ? -1 : 1;
      speedRef.current += GLOVE_SPEED.HOOK_INCREMENT;
      setCurrentPosition({
        rightX: Math.max(
          RIGHT_GLOVE_POSITION.HOOK_MIN_X,
          xPosition +
            RIGHT_GLOVE_POSITION.HOOK_DELTA_X * FPSFactor * turnFactor,
        ),
        rightZ: speedRef.current + GLOVE_SPEED.HOOK_INCREMENT * FPSFactor,
      });
      setCurrentRotation({
        rightX: Math.min(
          xRotation - RIGHT_GLOVE_ROTATION.HOOK_DELTA_X * FPSFactor,
          RIGHT_ANGLE,
        ),
        rightY: Math.min(
          yRotation - RIGHT_GLOVE_ROTATION.HOOK_DELTA_Y * FPSFactor,
          RIGHT_ANGLE,
        ),
        rightZ: Math.min(
          zRotation + RIGHT_GLOVE_ROTATION.HOOK_DELTA_Z * FPSFactor,
          RIGHT_ANGLE,
        ),
      });
    }
  };

  const handleBackwardMovement = (FPSFactor) => {
    const currentAnimation = getCurrentGloveAnimation().right;

    if (currentAnimation === "punch") {
      speedRef.current = Math.max(
        speedRef.current - GLOVE_SPEED.PUNCH_DECREMENT * FPSFactor,
        GLOVE_SPEED.PUNCH_INITIAL,
      );
      setCurrentPosition({
        rightX: Math.min(
          xPosition + RIGHT_GLOVE_POSITION.PUNCH_DELTA_X * FPSFactor,
          RIGHT_GLOVE_POSITION.INITIAL_X,
        ),
        rightZ: Math.max(
          speedRef.current - GLOVE_SPEED.PUNCH_DECREMENT * FPSFactor,
          GLOVE_SPEED.PUNCH_INITIAL,
        ),
      });
      setCurrentRotation({
        rightX: Math.min(
          xRotation + RIGHT_GLOVE_ROTATION.PUNCH_DELTA_X * FPSFactor,
          RIGHT_GLOVE_ROTATION.INITIAL_X,
        ),
        rightY: Math.min(
          yRotation + RIGHT_GLOVE_ROTATION.PUNCH_DELTA_Y * FPSFactor,
          RIGHT_GLOVE_ROTATION.INITIAL_Y,
        ),
      });
    }

    if (currentAnimation === "hook") {
      speedRef.current = Math.max(
        speedRef.current - GLOVE_SPEED.HOOK_INCREMENT * FPSFactor,
        GLOVE_SPEED.PUNCH_INITIAL,
      );

      setCurrentPosition({
        rightX: Math.min(
          xPosition + RIGHT_GLOVE_POSITION.HOOK_DELTA_X * FPSFactor,
          RIGHT_GLOVE_POSITION.INITIAL_X,
        ),
        rightZ: Math.max(
          gloveRightRef.current.position.z -
            GLOVE_SPEED.HOOK_INCREMENT * FPSFactor,
          RIGHT_GLOVE_POSITION.INITIAL_Z,
        ),
      });

      setCurrentRotation({
        rightX: Math.max(
          xRotation - RIGHT_GLOVE_ROTATION.HOOK_DELTA_X * FPSFactor,
          RIGHT_GLOVE_ROTATION.INITIAL_X,
        ),
        rightY: Math.max(
          yRotation - RIGHT_GLOVE_ROTATION.HOOK_DELTA_Y * FPSFactor,
          RIGHT_GLOVE_ROTATION.INITIAL_Y,
        ),
        rightZ: Math.max(
          zRotation - RIGHT_GLOVE_ROTATION.HOOK_DELTA_Z * FPSFactor,
          RIGHT_GLOVE_ROTATION.INITIAL_Z,
        ),
      });
    }
  };

  const computeTurningPoint = () => {
    if (
      getCurrentGloveAnimation().right === "hook" &&
      gloveRightRef.current.position.x > MAX_GLOVE_REACH.HOOK_RIGHT_X
    ) {
      isHookTurnedRef.current = true;
    }
    if (
      getCurrentGloveAnimation().right === "punch" &&
      gloveRightRef.current.position.z <= MAX_GLOVE_REACH.PUNCH_Z
    ) {
      directionRef.current = GLOVE_DIRECTION.RIGHT_BACKWARD;
    }

    if (
      getCurrentGloveAnimation().right === "hook" &&
      gloveRightRef.current.position.z <= MAX_GLOVE_REACH.HOOK_Z
    ) {
      directionRef.current = GLOVE_DIRECTION.RIGHT_BACKWARD;
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

        computeTurningPoint();

        isMovingForward
          ? handleForwardMovement(FPSFactor)
          : handleBackwardMovement(FPSFactor);

        transformGloveRef(FPSFactor);
        handleCollision();
        updateGloveOBBState();

        if (currentPositionZ > RIGHT_GLOVE_POSITION.INITIAL_Z) {
          directionRef.current = GLOVE_DIRECTION.RIGHT_FORWARD;
          speedRef.current = GLOVE_SPEED.PUNCH_INITIAL;
          isFirstCollisionInCycleRef.current = true;
          initializeGlovePosition();
          setCurrentGloveAnimation({ right: "" });
          isHookTurnedRef.current = false;

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
