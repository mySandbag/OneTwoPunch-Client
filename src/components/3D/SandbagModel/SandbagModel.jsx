import { useLoader } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

function SandbagModel() {
  const sandbagGLTF = useLoader(
    GLTFLoader,
    "/src/assets/model/sandbag/scene.gltf",
  );
  const sandbagRef = useRef();

  useEffect(() => {
    sandbagGLTF.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [sandbagGLTF]);

  useEffect(() => {
    if (sandbagRef.current) {
      sandbagRef.current.position.y = 1;
    }
  }, []);

  return <primitive object={sandbagGLTF.scene} ref={sandbagRef} />;
}

export default SandbagModel;
