import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { useLoader, useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import {
  GLOVE_SPEED,
  GLOVE_DIRECTION,
  MAX_GLOVE_REACH,
  LEFT_GLOVE_POSITION,
  LEFT_GLOVE_ROTATION,
  RIGHT_ANGLE,
} from "../../../constants/gloveMotionSettings";

import usePackageStore from "../../../store";
import { checkOBBCollision } from "../../../common/checkOBBCollision";
import { drawAxesAtPoint } from "../../../common/drawAxesAtPoint";
import { drawDynamicAxesAtPoint } from "../../../common/drawDynamicAxesAtPoint";

import punchTargetSound from "../../../assets/sound/punchTarget.mp3";
import punchAirSound from "../../../assets/sound/punchAir.mp3";

function GloveLeft({ triggerAnimation, onAnimationEnd }) {
  const gloveLeft = useLoader(
    GLTFLoader,
    "/src/assets/model/glove_left/gloveLeft.gltf",
  );
  const {
    updateHitCount,
    getHitInProgress,
    setHitInProgress,
    getSandbagInMotion,
    setAnotherHit,
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
    initializeCurrentState,
  } = usePackageStore();

  const { scene } = useThree();

  const [speed, setSpeed] = useState(GLOVE_SPEED.INITIAL);
  const [isFirstCollision, setIsFirstCollision] = useState(true);
  const [originalBoundingBox, setOriginalBoundingBox] = useState(null);

  const gloveLeftRef = useRef();
  const directionRef = useRef(GLOVE_DIRECTION.FORWARD);
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
    gloveLeftRef.current.rotation.y = (
      Math.PI / LEFT_GLOVE_ROTATION.INITIAL_Y
    ).toFixed(2);

    let centerPoint = new THREE.Vector3(
      gloveLeftRef.current.position.x,
      gloveLeftRef.current.position.y,
      gloveLeftRef.current.position.z,
    );

    const currentAxis = drawDynamicAxesAtPoint(
      gloveLeftRef.current.position.x,
      gloveLeftRef.current.position.y,
      gloveLeftRef.current.position.z,
      gloveLeftRef.current.rotation,
      axesRef,
      scene,
    );
    setLeftGloveOBB({ center: centerPoint, rotation: currentAxis });

    initializeCurrentState();
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
      const originalBox = new THREE.Box3().setFromObject(gloveLeftRef.current);
      setOriginalBoundingBox(originalBox.clone());

      initializeGlovePosition();

      const movedBox = new THREE.Box3().setFromObject(gloveLeftRef.current);
      const movedHelper = new THREE.Box3Helper(
        movedBox,
        new THREE.Color(0xff00ff),
      );

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

        const helper = new THREE.Box3Helper(
          originalBoundingBox,
          new THREE.Color(0x800080),
        );
        const helperCenter = new THREE.Vector3();
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

  const xPosition = getCurrentPosition().leftX;
  const xRotation = getCurrentRotation().leftX;
  const yRotation = getCurrentRotation().leftY;

  const transformGloveRef = () => {
    gloveLeftRef.current.position.x = xPosition;
    gloveLeftRef.current.position.z += speed * directionRef.current;
    gloveLeftRef.current.rotation.x = -(
      Math.PI / Math.max(xRotation, RIGHT_ANGLE)
    ).toFixed(2);
    gloveLeftRef.current.rotation.y = (
      Math.PI / Math.max(yRotation, RIGHT_ANGLE)
    ).toFixed(2);
  };

  const handleCollision = () => {
    const isCollide = checkOBBCollision(getLeftGloveOBB(), getSandbagOBB());
    if (isCollide && isFirstCollision && getSandbagInMotion()) {
      setAnotherHit(true);
    }
    if (isCollide && isFirstCollision) {
      punchTargetSoundRef.current.currentTime = 0;
      punchTargetSoundRef.current.play();
      setIsFirstCollision(false);
      updateHitCount();
      setHitInProgress(true);
      setHitRotation(getLeftGloveOBB().rotation.elements);
    }
    if (!isCollide && isFirstCollision && punchAirSoundRef.current.paused) {
      punchAirSoundRef.current.play();
    }
    if (!isCollide && !isFirstCollision && getHitInProgress()) {
      setHitInProgress(false);
    }
  };

  const updateGloveState = () => {
    let centerPoint = new THREE.Vector3(
      gloveLeftRef.current.position.x,
      gloveLeftRef.current.position.y,
      gloveLeftRef.current.position.z,
    );

    const currentAxis = drawDynamicAxesAtPoint(
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
    setSpeed((previousSpeed) => previousSpeed + GLOVE_SPEED.INCREMENT);
    setCurrentPosition({
      leftX: Math.min(xPosition + LEFT_GLOVE_POSITION.DELTA_X, 0),
      leftZ: speed + GLOVE_SPEED.INCREMENT,
    });
    setCurrentRotation({
      leftX: Math.max(xRotation - LEFT_GLOVE_ROTATION.DELTA_X, RIGHT_ANGLE),
      leftY: Math.max(yRotation - LEFT_GLOVE_ROTATION.DELTA_Y, RIGHT_ANGLE),
    });
  };

  const handleBackwardMovement = () => {
    setSpeed((previousSpeed) =>
      Math.max(previousSpeed - GLOVE_SPEED.DECREMENT, GLOVE_SPEED.INITIAL),
    );
    setCurrentPosition({
      leftX: Math.max(
        xPosition - LEFT_GLOVE_POSITION.DELTA_X,
        LEFT_GLOVE_POSITION.INITIAL_X,
      ),
      leftZ: Math.max(speed - GLOVE_SPEED.DECREMENT, GLOVE_SPEED.INITIAL),
    });
    setCurrentRotation({
      leftX: Math.min(
        xRotation + LEFT_GLOVE_ROTATION.DELTA_X,
        LEFT_GLOVE_ROTATION.INITIAL_X,
      ),
      leftY: Math.min(
        yRotation + LEFT_GLOVE_ROTATION.DELTA_Y,
        LEFT_GLOVE_ROTATION.INITIAL_Y,
      ),
    });
  };

  useFrame(() => {
    if (triggerAnimation && gloveLeftRef.current) {
      const currentPositionZ = gloveLeftRef.current.position.z;
      const isMovingForward = directionRef.current < 0;

      transformGloveRef();
      handleCollision();
      updateGloveState();

      isMovingForward ? handleForwardMovement() : handleBackwardMovement();

      if (currentPositionZ <= MAX_GLOVE_REACH) {
        directionRef.current = GLOVE_DIRECTION.BACKWARD;
      }

      if (currentPositionZ > LEFT_GLOVE_POSITION.INITIAL_Z) {
        directionRef.current = GLOVE_DIRECTION.FORWARD;
        setSpeed(GLOVE_SPEED.INITIAL);
        setIsFirstCollision(true);
        initializeGlovePosition();

        onAnimationEnd();
      }
    }
  });

  return <primitive object={gloveLeft.scene} ref={gloveLeftRef} />;
}

export default GloveLeft;
