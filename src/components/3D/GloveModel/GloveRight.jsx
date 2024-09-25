import { useState, useEffect, useRef } from "react";
import { Vector3, Box3, Box3Helper, Color } from "three";
import { useLoader, useFrame, useThree } from "@react-three/fiber";
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
    setHitRotation,
    initializeRightGloveCurrentState,
  } = usePackageStore();

  const { scene } = useThree();

  const [speed, setSpeed] = useState(GLOVE_SPEED.PUNCH_INITIAL);
  const [isFirstCollisionInCycle, setIsFirstCollisionInCycle] = useState(true);
  const [originalBoundingBox, setOriginalBoundingBox] = useState(null);
  const [isHookTurned, setIsHookTurned] = useState(false);

  const gloveRightRef = useRef();
  const directionRef = useRef(GLOVE_DIRECTION.RIGHT_FORWARD);
  const axesRef = useRef([]);
  const punchTargetSoundRef = useRef(null);
  const punchAirSoundRef = useRef(null);

  const initializeGlovePosition = () => {
    gloveRightRef.current.position.x = RIGHT_GLOVE_POSITION.INITIAL_X;
    gloveRightRef.current.position.y = RIGHT_GLOVE_POSITION.INITIAL_Y;
    gloveRightRef.current.position.z = RIGHT_GLOVE_POSITION.INITIAL_Z;

    gloveRightRef.current.rotation.x = -(
      Math.PI / RIGHT_GLOVE_ROTATION.INITIAL_X
    ).toFixed(2);
    gloveRightRef.current.rotation.y = -(
      Math.PI / RIGHT_GLOVE_ROTATION.INITIAL_Y
    ).toFixed(2);
    gloveRightRef.current.rotation.z = -(
      Math.PI / RIGHT_GLOVE_ROTATION.INITIAL_Z
    ).toFixed(2);

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

      return () => {
        scene.remove(gloveRight.scene);
        gloveRightRef.current = null;
      };
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

  const transformGloveRef = () => {
    gloveRightRef.current.position.x = xPosition;
    gloveRightRef.current.position.z += speed * directionRef.current;

    gloveRightRef.current.rotation.x = -(
      Math.PI / Math.max(xRotation, RIGHT_ANGLE)
    ).toFixed(2);
    gloveRightRef.current.rotation.y = -(
      Math.PI / Math.max(yRotation, RIGHT_ANGLE)
    ).toFixed(2);
    if (getCurrentGloveAnimation().right === "punch") {
      gloveRightRef.current.rotation.z = -(Math.PI / 360).toFixed(2);
    }
    if (getCurrentGloveAnimation().right === "hook") {
      gloveRightRef.current.rotation.z = (Math.PI / zRotation).toFixed(2);
    }
  };

  const handleCollision = () => {
    const isCollide = checkOBBCollision(getRightGloveOBB(), getSandbagOBB());
    if (isCollide && isFirstCollisionInCycle && getSandbagInMotion()) {
      setAnotherHit(true);
    }
    if (isCollide && isFirstCollisionInCycle) {
      punchTargetSoundRef.current.currentTime = 0;
      punchTargetSoundRef.current.play();

      setIsFirstCollisionInCycle(false);
      updateHitCount();
      setHitInProgress(true);
      setHitRotation(getRightGloveOBB().rotation.elements);
    }
    if (
      !isCollide &&
      isFirstCollisionInCycle &&
      punchAirSoundRef.current.paused
    ) {
      punchAirSoundRef.current.play();
    }
    if (!isCollide && !isFirstCollisionInCycle && getHitInProgress()) {
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

  const handleForwardMovement = () => {
    if (getCurrentGloveAnimation().right === "punch") {
      setSpeed((previousSpeed) => previousSpeed + GLOVE_SPEED.PUNCH_INCREMENT);
      setCurrentPosition({
        rightX: Math.max(xPosition - RIGHT_GLOVE_POSITION.PUNCH_DELTA_X, 0),
        rightZ: speed + GLOVE_SPEED.PUNCH_INCREMENT,
      });
      setCurrentRotation({
        rightX: Math.max(
          xRotation - RIGHT_GLOVE_ROTATION.PUNCH_DELTA_X,
          RIGHT_ANGLE,
        ),
        rightY: Math.max(
          yRotation - RIGHT_GLOVE_ROTATION.PUNCH_DELTA_Y,
          -RIGHT_ANGLE,
        ),
      });
    }
    if (getCurrentGloveAnimation().right === "hook") {
      const turnFactor = isHookTurned ? -1 : 1;
      setSpeed((previousSpeed) => previousSpeed + GLOVE_SPEED.HOOK_INCREMENT);
      setCurrentPosition({
        rightX: Math.max(
          RIGHT_GLOVE_POSITION.HOOK_MIN_X,
          xPosition + RIGHT_GLOVE_POSITION.HOOK_DELTA_X * turnFactor,
        ),
        rightZ: speed + GLOVE_SPEED.HOOK_INCREMENT,
      });
      setCurrentRotation({
        rightX: Math.max(
          xRotation - RIGHT_GLOVE_ROTATION.HOOK_DELTA_X,
          RIGHT_ANGLE,
        ),
        rightY: Math.max(
          yRotation - RIGHT_GLOVE_ROTATION.HOOK_DELTA_Y,
          RIGHT_ANGLE,
        ),
        rightZ: Math.max(
          Math.abs(zRotation) - RIGHT_GLOVE_ROTATION.HOOK_DELTA_Z,
          RIGHT_ANGLE + 1,
        ),
      });
    }
  };

  const handleBackwardMovement = () => {
    if (getCurrentGloveAnimation().right === "punch") {
      setSpeed((previousSpeed) =>
        Math.max(
          previousSpeed - GLOVE_SPEED.PUNCH_DECREMENT,
          GLOVE_SPEED.PUNCH_INITIAL,
        ),
      );
      setCurrentPosition({
        rightX: Math.min(
          xPosition + RIGHT_GLOVE_POSITION.PUNCH_DELTA_X,
          RIGHT_GLOVE_POSITION.INITIAL_X,
        ),
        rightZ: Math.max(
          speed - GLOVE_SPEED.PUNCH_DECREMENT,
          GLOVE_SPEED.PUNCH_INITIAL,
        ),
      });
      setCurrentRotation({
        rightX: Math.min(
          xRotation + RIGHT_GLOVE_ROTATION.PUNCH_DELTA_X,
          RIGHT_GLOVE_ROTATION.INITIAL_X,
        ),
        rightY: Math.min(
          yRotation + RIGHT_GLOVE_ROTATION.PUNCH_DELTA_Y,
          RIGHT_GLOVE_ROTATION.INITIAL_Y,
        ),
      });
    }
  };
  const computeTurningPoint = () => {
    if (
      getCurrentGloveAnimation().right === "hook" &&
      gloveRightRef.current.position.x > MAX_GLOVE_REACH.HOOK_RIGHT_X
    ) {
      setIsHookTurned((prev) => true);
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

  const [frameCount, setFrameCount] = useState(0);
  useFrame(() => {
    if (triggerAnimation && gloveRightRef.current) {
      if (
        (import.meta.env.VITE_SPEED_SETTING === "SLOW" &&
          frameCount % 5 === 0) ||
        import.meta.env.VITE_SPEED_SETTING !== "SLOW"
      ) {
        const currentPositionZ = gloveRightRef.current.position.z;
        const isMovingForward = directionRef.current < 0;

        computeTurningPoint();

        isMovingForward ? handleForwardMovement() : handleBackwardMovement();

        transformGloveRef();
        handleCollision();
        updateGloveOBBState();

        if (currentPositionZ > RIGHT_GLOVE_POSITION.INITIAL_Z) {
          directionRef.current = GLOVE_DIRECTION.RIGHT_FORWARD;
          setSpeed(GLOVE_SPEED.PUNCH_INITIAL);
          setIsFirstCollisionInCycle(true);
          initializeGlovePosition();
          setCurrentGloveAnimation({ right: "" });
          setIsHookTurned(false);

          onAnimationEnd();
        }
      }
      setFrameCount((prev) => prev + 1);
    }
  });

  return <primitive object={gloveRight.scene} ref={gloveRightRef} />;
}

export default GloveRight;
