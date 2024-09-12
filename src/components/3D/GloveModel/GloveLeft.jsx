import { useState, useEffect, useRef } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import {
  GLOVE_SPEED,
  GLOVE_DIRECTION,
  MAX_GLOVE_REACH,
  LEFT_GLOVE_POSITION,
  LEFT_GLOVE_ROTATION,
} from "../../../constants/gloveMotionSettings";

function GloveLeft({ triggerAnimation, onAnimationEnd }) {
  const gloveLeft = useLoader(
    GLTFLoader,
    "/src/assets/model/glove_left/gloveLeft.gltf",
  );
  const gloveLeftRef = useRef();
  const directionRef = useRef(GLOVE_DIRECTION.FORWARD);

  const [speed, setSpeed] = useState(GLOVE_SPEED.INITIAL);
  const [xPosition, setXPosition] = useState(LEFT_GLOVE_POSITION.INITIAL_X);
  const [xRotation, setXRotation] = useState(LEFT_GLOVE_ROTATION.INITIAL_X);
  const [yRotation, setYRotation] = useState(LEFT_GLOVE_ROTATION.INITIAL_Y);

  useEffect(() => {
    gloveLeft.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [gloveLeft]);

  useEffect(() => {
    if (gloveLeftRef.current) {
      initializeGlovePosition();
    }
  }, []);

  const initializeGlovePosition = () => {
    gloveLeftRef.current.position.x = LEFT_GLOVE_POSITION.INITIAL_X;
    gloveLeftRef.current.position.y = LEFT_GLOVE_POSITION.INITIAL_Y;
    gloveLeftRef.current.position.z = LEFT_GLOVE_POSITION.INITIAL_Z;
    gloveLeftRef.current.rotation.x = -Math.PI / LEFT_GLOVE_ROTATION.INITIAL_X;
    gloveLeftRef.current.rotation.y = Math.PI / LEFT_GLOVE_ROTATION.INITIAL_Y;
  };

  const handleForwardMovement = () => {
    setSpeed((previousSpeed) => previousSpeed + GLOVE_SPEED.INCREMENT);
    setXPosition((previousPosition) =>
      Math.min(previousPosition + LEFT_GLOVE_POSITION.DELTA_X, 0),
    );
    setXRotation((previousRotation) =>
      Math.max(previousRotation - LEFT_GLOVE_ROTATION.DELTA_X, 2),
    );
    setYRotation((previousRotation) =>
      Math.max(previousRotation - LEFT_GLOVE_ROTATION.DELTA_Y, 2),
    );
  };

  const handleBackwardMovement = () => {
    setSpeed((previousSpeed) =>
      Math.max(previousSpeed - GLOVE_SPEED.DECREMENT, GLOVE_SPEED.INITIAL),
    );
    setXPosition((previousPosition) =>
      Math.max(
        previousPosition - LEFT_GLOVE_POSITION.DELTA_X,
        LEFT_GLOVE_POSITION.INITIAL_X,
      ),
    );
    setXRotation((previousRotation) =>
      Math.min(
        previousRotation + LEFT_GLOVE_ROTATION.DELTA_X,
        LEFT_GLOVE_ROTATION.INITIAL_X,
      ),
    );
    setYRotation((previousRotation) =>
      Math.min(
        previousRotation + LEFT_GLOVE_ROTATION.DELTA_Y,
        LEFT_GLOVE_ROTATION.INITIAL_Y,
      ),
    );
  };

  useFrame(() => {
    if (triggerAnimation && gloveLeftRef.current) {
      const currentZ = gloveLeftRef.current.position.z;
      const isMovingForward = directionRef.current < 0;

      gloveLeftRef.current.position.x = xPosition;
      gloveLeftRef.current.position.z += speed * directionRef.current;
      gloveLeftRef.current.rotation.x = -Math.PI / Math.max(xRotation, 2);
      gloveLeftRef.current.rotation.y = Math.PI / Math.max(yRotation, 2);

      if (isMovingForward) {
        handleForwardMovement();
      } else {
        handleBackwardMovement();
      }

      if (currentZ <= MAX_GLOVE_REACH) {
        directionRef.current = GLOVE_DIRECTION.BACKWARD;
      }

      if (currentZ > LEFT_GLOVE_POSITION.INITIAL_Z) {
        directionRef.current = GLOVE_DIRECTION.FORWARD;
        setSpeed(GLOVE_SPEED.INITIAL);
        setXPosition(LEFT_GLOVE_POSITION.INITIAL_X);
        setXRotation(LEFT_GLOVE_ROTATION.INITIAL_X);
        setYRotation(LEFT_GLOVE_ROTATION.INITIAL_Y);

        initializeGlovePosition();
        onAnimationEnd();
      }
    }
  });

  return <primitive object={gloveLeft.scene} ref={gloveLeftRef} />;
}

export default GloveLeft;
