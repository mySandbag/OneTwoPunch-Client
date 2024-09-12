import { useState, useEffect, useRef } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import {
  GLOVE_SPEED,
  GLOVE_DIRECTION,
  MAX_GLOVE_REACH,
  RIGHT_GLOVE_POSITION,
  RIGHT_GLOVE_ROTATION,
} from "../../../constants/gloveMotionSettings";

function GloveRight({ triggerAnimation, onAnimationEnd }) {
  const gloveRight = useLoader(
    GLTFLoader,
    "/src/assets/model/glove_right/gloveRight.gltf",
  );
  const gloveRightRef = useRef();
  const directionRef = useRef(GLOVE_DIRECTION.FORWARD);

  const [speed, setSpeed] = useState(GLOVE_SPEED.INITIAL);
  const [xPosition, setXPosition] = useState(RIGHT_GLOVE_POSITION.INITIAL_X);
  const [xRotation, setXRotation] = useState(RIGHT_GLOVE_ROTATION.INITIAL_X);
  const [yRotation, setYRotation] = useState(RIGHT_GLOVE_ROTATION.INITIAL_Y);

  useEffect(() => {
    gloveRight.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [gloveRight]);

  useEffect(() => {
    if (gloveRightRef.current) {
      initializeGlovePosition();
    }
  }, []);

  const initializeGlovePosition = () => {
    gloveRightRef.current.position.x = RIGHT_GLOVE_POSITION.INITIAL_X;
    gloveRightRef.current.position.y = RIGHT_GLOVE_POSITION.INITIAL_Y;
    gloveRightRef.current.position.z = RIGHT_GLOVE_POSITION.INITIAL_Z;
    gloveRightRef.current.rotation.x =
      -Math.PI / RIGHT_GLOVE_ROTATION.INITIAL_X;
    gloveRightRef.current.rotation.y =
      -Math.PI / RIGHT_GLOVE_ROTATION.INITIAL_Y;
  };

  const handleForwardMovement = () => {
    setSpeed((previousSpeed) => previousSpeed + GLOVE_SPEED.INCREMENT);
    setXPosition((previousPosition) =>
      Math.max(previousPosition - RIGHT_GLOVE_POSITION.DELTA_X, 0),
    );
    setXRotation((previousRotation) =>
      Math.max(previousRotation - RIGHT_GLOVE_ROTATION.DELTA_X, 2),
    );
    setYRotation((previousRotation) =>
      Math.max(previousRotation - RIGHT_GLOVE_ROTATION.DELTA_Y, 2),
    );
  };

  const handleBackwardMovement = () => {
    setSpeed((previousSpeed) =>
      Math.max(previousSpeed - GLOVE_SPEED.DECREMENT, GLOVE_SPEED.INITIAL),
    );
    setXPosition((previousPosition) =>
      Math.min(
        previousPosition + RIGHT_GLOVE_POSITION.DELTA_X,
        RIGHT_GLOVE_POSITION.INITIAL_X,
      ),
    );
    setXRotation((previousRotation) =>
      Math.min(
        previousRotation + RIGHT_GLOVE_ROTATION.DELTA_X,
        RIGHT_GLOVE_ROTATION.INITIAL_X,
      ),
    );
    setYRotation((previousRotation) =>
      Math.min(
        previousRotation + RIGHT_GLOVE_ROTATION.DELTA_Y,
        RIGHT_GLOVE_ROTATION.INITIAL_Y,
      ),
    );
  };

  useFrame(() => {
    if (triggerAnimation && gloveRightRef.current) {
      const currentZ = gloveRightRef.current.position.z;
      const isMovingForward = directionRef.current < 0;

      gloveRightRef.current.position.x = xPosition;
      gloveRightRef.current.position.z += speed * directionRef.current;
      gloveRightRef.current.rotation.x = -Math.PI / Math.max(xRotation, 2);
      gloveRightRef.current.rotation.y = -Math.PI / Math.max(yRotation, 2);

      if (isMovingForward) {
        handleForwardMovement();
      } else {
        handleBackwardMovement();
      }

      if (currentZ <= MAX_GLOVE_REACH) {
        directionRef.current = GLOVE_DIRECTION.BACKWARD;
      }

      if (currentZ > RIGHT_GLOVE_POSITION.INITIAL_Z) {
        directionRef.current = GLOVE_DIRECTION.FORWARD;
        setSpeed(GLOVE_SPEED.INITIAL);
        setXPosition(RIGHT_GLOVE_POSITION.INITIAL_X);
        setXRotation(RIGHT_GLOVE_ROTATION.INITIAL_X);
        setYRotation(RIGHT_GLOVE_ROTATION.INITIAL_Y);

        initializeGlovePosition();
        onAnimationEnd();
      }
    }
  });

  return <primitive object={gloveRight.scene} ref={gloveRightRef} />;
}

export default GloveRight;
