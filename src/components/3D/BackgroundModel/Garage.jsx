import { useRef, useEffect } from "react";
import { BackSide, SRGBColorSpace } from "three";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

function GarageModel() {
  const boxerPoster = useLoader(GLTFLoader, "/model/background/poster/poster.gltf");
  const dumbbell = useLoader(GLTFLoader, "/model/background/dumbell/dumbbell.gltf");

  const boxerPosterRef = useRef();
  const dumbbellRef = useRef();

  const concreteFloor = useLoader(TextureLoader, "/model/background/concreteFloor.jpg");
  const brickWallLR = useLoader(TextureLoader, "/model/background/brickWall_LR.jpg");
  const brickWallFB = useLoader(TextureLoader, "/model/background/brickWall_FB.jpg");

  concreteFloor.colorSpace = SRGBColorSpace;
  brickWallLR.colorSpace = SRGBColorSpace;
  brickWallFB.colorSpace = SRGBColorSpace;

  useEffect(() => {
    boxerPosterRef.current.position.set(3.2, 3, -5.9);
    dumbbellRef.current.position.set(-4.8, -0.2, -5.3);
    dumbbellRef.current.rotation.set(0, 0.5, 0);
  }, []);

  useEffect(() => {
    dumbbell.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
      }
    });
  }, [dumbbell]);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 3, 0]} receiveShadow>
        <boxGeometry args={[12, 12, 7]} />
        <meshStandardMaterial attach="material-0" map={brickWallLR} side={BackSide} />
        <meshStandardMaterial attach="material-1" map={brickWallLR} side={BackSide} />
        <meshStandardMaterial attach="material-2" map={brickWallFB} side={BackSide} />
        <meshStandardMaterial attach="material-3" map={brickWallFB} side={BackSide} />
        <meshStandardMaterial attach="material-4" map={concreteFloor} side={BackSide} />
        <meshStandardMaterial attach="material-5" map={concreteFloor} side={BackSide} />
      </mesh>
      <primitive object={boxerPoster.scene} ref={boxerPosterRef} scale={[0.7, 0.9, 0.9]} />
      <primitive object={dumbbell.scene} ref={dumbbellRef} scale={[0.3, 0.3, 0.3]} />
    </>
  );
}

export default GarageModel;
