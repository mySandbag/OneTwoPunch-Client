import { useLoader } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

function GloveRight() {
  const gloveRight = useLoader(
    GLTFLoader,
    "/src/assets/model/glove_right/gloveRight.gltf",
  );
  const gloveRightRef = useRef();

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
      gloveRightRef.current.position.x = 0.6;
      gloveRightRef.current.position.y = 1.6;
      gloveRightRef.current.position.z = 2.3;

      gloveRightRef.current.rotation.x = -Math.PI / 7;
    }
  }, []);

  return <primitive object={gloveRight.scene} ref={gloveRightRef} />;
}

export default GloveRight;
