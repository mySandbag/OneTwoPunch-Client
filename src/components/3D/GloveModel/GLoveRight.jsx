import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { useLoader, useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import {
  GLOVE_SPEED,
  GLOVE_DIRECTION,
  MAX_GLOVE_REACH,
  RIGHT_GLOVE_POSITION,
  RIGHT_GLOVE_ROTATION,
  RIGHT_ANGLE,
} from "../../../constants/gloveMotionSettings";

import { checkOBBCollision } from "../../../common/checkOBBCollision";
import { drawAxesAtPoint } from "../../../common/drawAxesAtPoint";
import { drawDynamicAxesAtPoint } from "../../../common/drawDynamicAxesAtPoint";
import usePackageStore from "../../../store";

function GloveRight({ triggerAnimation, onAnimationEnd }) {
  const gloveRight = useLoader(
    GLTFLoader,
    "/src/assets/model/glove_right/gloveRight.gltf",
  );

  const {
    updateHitCount,
    getHitInProgress,
    setHitInProgress,
    setAnotherHit,
    getSandbagInMotion,
    setSummonPosition,
    getSummonPosition,
    setRightGloveOBB,
    getRightGloveOBB,
    getSandbagOBB,
    setCurrentPosition,
    setCurrentRotation,
    getCurrentPosition,
    getCurrentRotation,
    initializeCurrentState,
  } = usePackageStore();

  const { scene } = useThree();

  const [speed, setSpeed] = useState(GLOVE_SPEED.INITIAL);
  const [isFirstCollision, setIsFirstCollision] = useState(true);
  const [originalBoundingBox, setOriginalBoundingBox] = useState(null);

  const gloveRightRef = useRef();
  const directionRef = useRef(GLOVE_DIRECTION.FORWARD);
  const axesRef = useRef([]);

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

    let centerPoint = new THREE.Vector3(
      gloveRightRef.current.position.x,
      gloveRightRef.current.position.y,
      gloveRightRef.current.position.z,
    );

    const currentAxis = drawDynamicAxesAtPoint(
      gloveRightRef.current.position.x,
      gloveRightRef.current.position.y,
      gloveRightRef.current.position.z,
      gloveRightRef.current.rotation,
      axesRef,
      scene,
    );
    setRightGloveOBB({ center: centerPoint, rotation: currentAxis });

    initializeCurrentState();
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
    if (gloveRightRef.current) {
      const originalBox = new THREE.Box3().setFromObject(gloveRightRef.current);
      setOriginalBoundingBox(originalBox.clone());

      initializeGlovePosition();

      const movedBox = new THREE.Box3().setFromObject(gloveRightRef.current);
      const movedHelper = new THREE.Box3Helper(
        movedBox,
        new THREE.Color(0x00ff00),
      );
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

        const helper = new THREE.Box3Helper(
          originalBoundingBox,
          new THREE.Color(0x00ffff),
        );
        const helperCenter = new THREE.Vector3();
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

  const xPosition = getCurrentPosition().rightX;
  const xRotation = getCurrentRotation().rightX;
  const yRotation = getCurrentRotation().rightY;

  const transformGloveRef = () => {
    gloveRightRef.current.position.x = xPosition;
    gloveRightRef.current.position.z += speed * directionRef.current;
    gloveRightRef.current.rotation.x = -(
      Math.PI / Math.max(xRotation, RIGHT_ANGLE)
    ).toFixed(2);
    gloveRightRef.current.rotation.y = -(
      Math.PI / Math.max(yRotation, RIGHT_ANGLE)
    ).toFixed(2);
  };

  const handleCollision = () => {
    const isCollide = checkOBBCollision(getRightGloveOBB(), getSandbagOBB());
    if (isCollide && isFirstCollision && getSandbagInMotion()) {
      setAnotherHit(true);
    }
    if (isCollide && isFirstCollision) {
      updateHitCount();
      setHitInProgress(true);
      setIsFirstCollision(false);
    }
    if (!isCollide && !isFirstCollision && getHitInProgress()) {
      setHitInProgress(false);
    }
  };

  const updateGloveState = () => {
    let centerPoint = new THREE.Vector3(
      gloveRightRef.current.position.x,
      gloveRightRef.current.position.y,
      gloveRightRef.current.position.z,
    );

    const currentAxis = drawDynamicAxesAtPoint(
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
    setSpeed((previousSpeed) => previousSpeed + GLOVE_SPEED.INCREMENT);
    setCurrentPosition({
      rightX: Math.max(xPosition - RIGHT_GLOVE_POSITION.DELTA_X, 0),
      rightZ: speed + GLOVE_SPEED.INCREMENT,
    });
    setCurrentRotation({
      rightX: Math.max(xRotation - RIGHT_GLOVE_ROTATION.DELTA_X, RIGHT_ANGLE),
      rightY: Math.max(yRotation - RIGHT_GLOVE_ROTATION.DELTA_Y, RIGHT_ANGLE),
    });
  };

  const handleBackwardMovement = () => {
    setSpeed((previousSpeed) =>
      Math.max(previousSpeed - GLOVE_SPEED.DECREMENT, GLOVE_SPEED.INITIAL),
    );
    setCurrentPosition({
      rightX: Math.min(
        xPosition + RIGHT_GLOVE_POSITION.DELTA_X,
        RIGHT_GLOVE_POSITION.INITIAL_X,
      ),
      rightZ: Math.max(speed - GLOVE_SPEED.DECREMENT, GLOVE_SPEED.INITIAL),
    });
    setCurrentRotation({
      rightX: Math.min(
        xRotation + RIGHT_GLOVE_ROTATION.DELTA_X,
        RIGHT_GLOVE_ROTATION.INITIAL_X,
      ),
      rightY: Math.min(
        yRotation + RIGHT_GLOVE_ROTATION.DELTA_Y,
        RIGHT_GLOVE_ROTATION.INITIAL_Y,
      ),
    });
  };

  useFrame(() => {
    if (triggerAnimation && gloveRightRef.current) {
      const currentPositionZ = gloveRightRef.current.position.z;
      const isMovingForward = directionRef.current < 0;

      transformGloveRef();
      handleCollision();
      updateGloveState();

      isMovingForward ? handleForwardMovement() : handleBackwardMovement();

      if (currentPositionZ <= MAX_GLOVE_REACH) {
        directionRef.current = GLOVE_DIRECTION.BACKWARD;
      }

      if (currentPositionZ > RIGHT_GLOVE_POSITION.INITIAL_Z) {
        directionRef.current = GLOVE_DIRECTION.FORWARD;
        setSpeed(GLOVE_SPEED.INITIAL);
        setIsFirstCollision(true);
        initializeGlovePosition();

        onAnimationEnd();
      }
    }
  });

  return <primitive object={gloveRight.scene} ref={gloveRightRef} />;
}

export default GloveRight;
