import { useState, useEffect, useRef } from "react";
import { Vector3, Box3, Box3Helper, Color } from "three";
import { useLoader, useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import {
  GLOVE_SPEED,
  GLOVE_DIRECTION,
  MAX_GLOVE_REACH,
  LEFT_GLOVE_POSITION,
  LEFT_GLOVE_ROTATION,
  RIGHT_ANGLE,
} from "../../../constants/animationSettings";

import usePackageStore from "../../../store";
import { checkOBBCollision } from "../../../common/checkOBBCollision";
import { visualizeOriginalAxesAtPoint } from "../../../common/visualizeOriginalAxesAtPoint";
import { computeAxesAtPoint } from "../../../common/computeAxesAtPoint";

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
    setHitRotation,
    initializeLeftGloveCurrentState,
  } = usePackageStore();

  const { scene } = useThree();

  const [originalBoundingBox, setOriginalBoundingBox] = useState(null);

  const gloveLeftRef = useRef();
  const speedRef = useRef(GLOVE_SPEED.PUNCH_INITIAL);
  const directionRef = useRef(GLOVE_DIRECTION.LEFT_FORWARD);
  const isHookTurnedRef = useRef(false);
  const isFirstCollisionInCycleRef = useRef(true);
  const validHitCount = useRef(0);

  const axesRef = useRef([]);
  const punchTargetSoundRef = useRef(null);
  const punchAirSoundRef = useRef(null);

  const initializeGlovePosition = () => {
    gloveLeftRef.current.position.x = LEFT_GLOVE_POSITION.INITIAL_X;
    gloveLeftRef.current.position.y = LEFT_GLOVE_POSITION.INITIAL_Y;
    gloveLeftRef.current.position.z = LEFT_GLOVE_POSITION.INITIAL_Z;

    gloveLeftRef.current.rotation.x = -(
      Math.PI / LEFT_GLOVE_ROTATION.INITIAL_X
    ).toFixed(2);
    gloveLeftRef.current.rotation.y = -(
      Math.PI / LEFT_GLOVE_ROTATION.INITIAL_Y
    ).toFixed(2);
    gloveLeftRef.current.rotation.z = -(
      Math.PI / LEFT_GLOVE_ROTATION.INITIAL_Z
    ).toFixed(2);

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

      initializeGlovePosition();

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

      const xyzPosition = [
        getSummonPosition().leftX,
        getSummonPosition().leftY,
        getSummonPosition().leftZ,
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

  const xPosition = getCurrentPosition().leftX;

  const xRotation = getCurrentRotation().leftX;
  const yRotation = getCurrentRotation().leftY;
  const zRotation = getCurrentRotation().leftZ;

  const transformGloveRef = () => {
    gloveLeftRef.current.position.x = xPosition;
    gloveLeftRef.current.position.z += speedRef.current * directionRef.current;

    gloveLeftRef.current.rotation.x = -(
      Math.PI / Math.max(xRotation, RIGHT_ANGLE)
    ).toFixed(2);
    gloveLeftRef.current.rotation.y = (
      Math.PI / Math.max(yRotation, RIGHT_ANGLE)
    ).toFixed(2);
    if (getCurrentGloveAnimation().left === "punch") {
      gloveLeftRef.current.rotation.z = (Math.PI / 360).toFixed(2);
    }
    if (getCurrentGloveAnimation().left === "hook") {
      gloveLeftRef.current.rotation.z = -(Math.PI / zRotation).toFixed(2);
    }
  };

  const handleCollision = () => {
    const isCollide = checkOBBCollision(getLeftGloveOBB(), getSandbagOBB());
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
      setHitRotation(getLeftGloveOBB().rotation.elements);
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

  const handleForwardMovement = () => {
    if (getCurrentGloveAnimation().left === "punch") {
      speedRef.current += GLOVE_SPEED.PUNCH_INCREMENT;

      setCurrentPosition({
        leftX: Math.min(xPosition + LEFT_GLOVE_POSITION.PUNCH_DELTA_X, 0),
        leftZ: speedRef.current + GLOVE_SPEED.PUNCH_INCREMENT,
      });
      setCurrentRotation({
        leftX: Math.max(
          xRotation - LEFT_GLOVE_ROTATION.PUNCH_DELTA_X,
          RIGHT_ANGLE,
        ),
        leftY: Math.max(
          yRotation - LEFT_GLOVE_ROTATION.PUNCH_DELTA_Y,
          RIGHT_ANGLE,
        ),
      });
    }
    if (getCurrentGloveAnimation().left === "hook") {
      const turnFactor = isHookTurnedRef.current ? -1 : 1;
      speedRef.current += GLOVE_SPEED.HOOK_INCREMENT;
      setCurrentPosition({
        leftX: Math.min(
          LEFT_GLOVE_POSITION.HOOK_MIN_X,
          xPosition - LEFT_GLOVE_POSITION.HOOK_DELTA_X * turnFactor,
        ),
        leftZ: speedRef.current + GLOVE_SPEED.HOOK_INCREMENT,
      });
      setCurrentRotation({
        leftX: Math.max(
          xRotation - LEFT_GLOVE_ROTATION.HOOK_DELTA_X,
          RIGHT_ANGLE,
        ),
        leftY: Math.max(
          yRotation - LEFT_GLOVE_ROTATION.HOOK_DELTA_Y,
          RIGHT_ANGLE,
        ),
        leftZ: Math.max(
          Math.abs(zRotation) - LEFT_GLOVE_ROTATION.HOOK_DELTA_Z,
          RIGHT_ANGLE + 1,
        ),
      });
    }
  };
  const handleBackwardMovement = () => {
    if (getCurrentGloveAnimation().left === "punch") {
      speedRef.current = Math.max(
        speedRef.current - GLOVE_SPEED.PUNCH_DECREMENT,
        GLOVE_SPEED.PUNCH_INITIAL,
      );
      setCurrentPosition({
        leftX: Math.min(
          xPosition - LEFT_GLOVE_POSITION.PUNCH_DELTA_X,
          LEFT_GLOVE_POSITION.INITIAL_X,
        ),
        leftZ: Math.max(
          speedRef.current - GLOVE_SPEED.PUNCH_DECREMENT,
          GLOVE_SPEED.PUNCH_INITIAL,
        ),
      });
      setCurrentRotation({
        leftX: Math.min(
          xRotation + LEFT_GLOVE_ROTATION.PUNCH_DELTA_X,
          LEFT_GLOVE_ROTATION.INITIAL_X,
        ),
        leftY: Math.min(
          yRotation + LEFT_GLOVE_ROTATION.PUNCH_DELTA_Y,
          LEFT_GLOVE_ROTATION.INITIAL_Y,
        ),
      });
    }
  };

  const computeTurningPoint = () => {
    if (
      getCurrentGloveAnimation().left === "hook" &&
      gloveLeftRef.current.position.x < MAX_GLOVE_REACH.HOOK_LEFT_X
    ) {
      isHookTurnedRef.current = true;
    }

    if (
      getCurrentGloveAnimation().left === "punch" &&
      gloveLeftRef.current.position.z <= MAX_GLOVE_REACH.PUNCH_Z
    ) {
      directionRef.current = GLOVE_DIRECTION.LEFT_BACKWARD;
    }

    if (
      getCurrentGloveAnimation().left === "hook" &&
      gloveLeftRef.current.position.z <= MAX_GLOVE_REACH.HOOK_Z
    ) {
      directionRef.current = GLOVE_DIRECTION.LEFT_BACKWARD;
    }
  };
  const frameCountRef = useRef(0);
  useFrame(() => {
    if (triggerAnimation && gloveLeftRef.current) {
      const frameCount = frameCountRef.current;
      if (
        (import.meta.env.VITE_SPEED_SETTING === "SLOW" &&
          frameCount % 5 === 0) ||
        import.meta.env.VITE_SPEED_SETTING !== "SLOW"
      ) {
        const currentPositionZ = gloveLeftRef.current.position.z;
        const isMovingForward = directionRef.current < 0;

        computeTurningPoint();

        isMovingForward ? handleForwardMovement() : handleBackwardMovement();

        transformGloveRef();
        handleCollision();
        updateGloveOBBState();

        if (currentPositionZ > LEFT_GLOVE_POSITION.INITIAL_Z) {
          directionRef.current = GLOVE_DIRECTION.LEFT_FORWARD;
          speedRef.current = GLOVE_SPEED.PUNCH_INITIAL;
          isFirstCollisionInCycleRef.current = true;
          initializeGlovePosition();
          setCurrentGloveAnimation({ left: "" });
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

  return <primitive object={gloveLeft.scene} ref={gloveLeftRef} />;
}

export default GloveLeft;
