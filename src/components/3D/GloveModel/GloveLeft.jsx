import { useState, useEffect, useRef } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import {
  INITIAL_GLOVE_SPEED,
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
  const directionRef = useRef(-1);

  const [speed, setSpeed] = useState(INITIAL_GLOVE_SPEED);
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

  useFrame(() => {
    if (triggerAnimation && gloveLeftRef.current) {
      const currentZ = gloveLeftRef.current.position.z;
      gloveLeftRef.current.position.x = xPosition;
      gloveLeftRef.current.position.z += speed * directionRef.current;
      gloveLeftRef.current.rotation.x = -Math.PI / Math.max(xRotation, 2);
      gloveLeftRef.current.rotation.y = Math.PI / Math.max(yRotation, 2);
      console.log(xRotation);

      if (directionRef.current < 0) {
        setSpeed((previousSpeed) => previousSpeed + 0.01);
        setXPosition((previousPosition) =>
          Math.min(previousPosition + 0.03, 0),
        );
        setXRotation((previousRotation) => Math.max(previousRotation - 2.1, 2));
        setYRotation((previousRotation) => Math.max(previousRotation - 1.4, 2));
      } else {
        setSpeed((previousSpeed) => Math.max(previousSpeed - 0.008, 0.05));
        setXPosition((previousPosition) =>
          Math.max(previousPosition - 0.03, LEFT_GLOVE_POSITION.INITIAL_X),
        );
        setXRotation((previousRotation) =>
          Math.min(previousRotation + 2.1, LEFT_GLOVE_ROTATION.INITIAL_X),
        );
        setYRotation((previousRotation) =>
          Math.min(previousRotation + 1.4, LEFT_GLOVE_ROTATION.INITIAL_Y),
        );
      }

      if (currentZ <= MAX_GLOVE_REACH) {
        directionRef.current = 1;
      }

      if (currentZ > LEFT_GLOVE_POSITION.INITIAL_Z) {
        directionRef.current = -1;
        setSpeed(INITIAL_GLOVE_SPEED);
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
