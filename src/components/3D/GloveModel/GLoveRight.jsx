import { useState, useEffect, useRef } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import {
  INITIAL_GLOVE_SPEED,
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
  const directionRef = useRef(-1);

  const [speed, setSpeed] = useState(INITIAL_GLOVE_SPEED);
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

  useFrame(() => {
    if (triggerAnimation && gloveRightRef.current) {
      const currentZ = gloveRightRef.current.position.z;
      gloveRightRef.current.position.x = xPosition;
      gloveRightRef.current.position.z += speed * directionRef.current;
      gloveRightRef.current.rotation.x = -Math.PI / Math.max(xRotation, 2);
      gloveRightRef.current.rotation.y = -Math.PI / Math.max(yRotation, 2);

      if (directionRef.current < 0) {
        setSpeed((previousSpeed) => previousSpeed + 0.01);
        setXPosition((previousPosition) =>
          Math.max(previousPosition - 0.03, 0),
        );
        setXRotation((previousRotation) => Math.max(previousRotation - 0.4, 2));
        setYRotation((previousRotation) => Math.max(previousRotation - 1.4, 2));
      } else {
        setSpeed((previousSpeed) => Math.max(previousSpeed - 0.008, 0.05));
        setXPosition((previousPosition) =>
          Math.min(previousPosition + 0.03, RIGHT_GLOVE_POSITION.INITIAL_X),
        );
        setXRotation((previousRotation) =>
          Math.min(previousRotation + 0.4, RIGHT_GLOVE_ROTATION.INITIAL_X),
        );
        setYRotation((previousRotation) =>
          Math.min(previousRotation + 1.4, RIGHT_GLOVE_ROTATION.INITIAL_Y),
        );
      }

      if (currentZ <= MAX_GLOVE_REACH) {
        directionRef.current = 1;
      }

      if (currentZ > RIGHT_GLOVE_POSITION.INITIAL_Z) {
        directionRef.current = -1;
        setSpeed(INITIAL_GLOVE_SPEED);
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
