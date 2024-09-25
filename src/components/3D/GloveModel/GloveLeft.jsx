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

  const [speed, setSpeed] = useState(GLOVE_SPEED.PUNCH_INITIAL);
  const [isFirstCollisionInCycle, setIsFirstCollisionInCycle] = useState(true);
  const [originalBoundingBox, setOriginalBoundingBox] = useState(null);
  const [isHookTurned, setIsHookTurned] = useState(false);

  const gloveLeftRef = useRef();
  const directionRef = useRef(GLOVE_DIRECTION.LEFT_FORWARD);
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

      return () => {
        scene.remove(gloveLeft.scene);
        gloveLeftRef.current = null;
      };
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
    gloveLeftRef.current.position.z += speed * directionRef.current;

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
    if (isCollide && isFirstCollisionInCycle && getSandbagInMotion()) {
      setAnotherHit(true);
    }
    if (isCollide && isFirstCollisionInCycle) {
      punchTargetSoundRef.current.currentTime = 0;
      punchTargetSoundRef.current.play();

      setIsFirstCollisionInCycle(false);
      updateHitCount();
      setHitInProgress(true);
      setHitRotation(getLeftGloveOBB().rotation.elements);
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
      setSpeed((previousSpeed) => previousSpeed + GLOVE_SPEED.PUNCH_INCREMENT);
      setCurrentPosition({
        leftX: Math.min(xPosition + LEFT_GLOVE_POSITION.PUNCH_DELTA_X, 0),
        leftZ: speed + GLOVE_SPEED.PUNCH_INCREMENT,
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
      const turnFactor = isHookTurned ? -1 : 1;
      setSpeed((previousSpeed) => previousSpeed + GLOVE_SPEED.HOOK_INCREMENT);
      setCurrentPosition({
        leftX: Math.min(
          LEFT_GLOVE_POSITION.HOOK_MIN_X,
          xPosition - LEFT_GLOVE_POSITION.HOOK_DELTA_X * turnFactor,
        ),
        leftZ: speed + GLOVE_SPEED.HOOK_INCREMENT,
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
      setSpeed((previousSpeed) =>
        Math.max(
          previousSpeed - GLOVE_SPEED.PUNCH_DECREMENT,
          GLOVE_SPEED.PUNCH_INITIAL,
        ),
      );
      setCurrentPosition({
        leftX: Math.min(
          xPosition - LEFT_GLOVE_POSITION.PUNCH_DELTA_X,
          LEFT_GLOVE_POSITION.INITIAL_X,
        ),
        leftZ: Math.max(
          speed - GLOVE_SPEED.PUNCH_DECREMENT,
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
      setIsHookTurned((prev) => true);
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
  const [frameCount, setFrameCount] = useState(0);
  useFrame(() => {
    if (triggerAnimation && gloveLeftRef.current) {
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
          setSpeed(GLOVE_SPEED.PUNCH_INITIAL);
          setIsFirstCollisionInCycle(true);
          initializeGlovePosition();
          setCurrentGloveAnimation({ left: "" });
          setIsHookTurned(false);

          onAnimationEnd();
        }
      }
      setFrameCount((prev) => prev + 1);
    }
  });

  return <primitive object={gloveLeft.scene} ref={gloveLeftRef} />;
}

export default GloveLeft;
