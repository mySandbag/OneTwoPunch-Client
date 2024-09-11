import { useLoader } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

function GloveLeft() {
  const gloveLeft = useLoader(
    GLTFLoader,
    "/src/assets/model/glove_left/gloveLeft.gltf",
  );
  const gloveLeftRef = useRef();

  console.log(gloveLeft);

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
      gloveLeftRef.current.position.x = -0.6;
      gloveLeftRef.current.position.y = 1.6;
      gloveLeftRef.current.position.z = 2.3;

      gloveLeftRef.current.rotation.x = -Math.PI / 30;
    }
  }, []);

  return <primitive object={gloveLeft.scene} ref={gloveLeftRef} />;
}

export default GloveLeft;
