import { useEffect } from "react";
import { BackSide, SRGBColorSpace } from "three";
import { useLoader, useThree } from "@react-three/fiber";
import { TextureLoader } from "three/src/loaders/TextureLoader";

function GarageModel() {
  const concreteFloor = useLoader(
    TextureLoader,
    "/src/assets/concreteFloor.jpg",
  );
  const brickWallLR = useLoader(TextureLoader, "/src/assets/brickWall_LR.jpg");
  const brickWallFB = useLoader(TextureLoader, "/src/assets/brickWall_FB.jpg");

  function SetRendererSettings() {
    const { gl } = useThree();
    useEffect(() => {
      gl.outputColorSpace = SRGBColorSpace;
      concreteFloor.colorSpace = SRGBColorSpace;
      brickWallLR.colorSpace = SRGBColorSpace;
      brickWallFB.colorSpace = SRGBColorSpace;
    }, [gl]);

    return null;
  }

  return (
    <>
      <SetRendererSettings />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 3, 0]} receiveShadow>
        <boxGeometry args={[12, 12, 7]} />
        <meshStandardMaterial
          attach="material-0"
          map={brickWallLR}
          side={BackSide}
        />
        <meshStandardMaterial
          attach="material-1"
          map={brickWallLR}
          side={BackSide}
        />
        <meshStandardMaterial
          attach="material-2"
          map={brickWallFB}
          side={BackSide}
        />
        <meshStandardMaterial
          attach="material-3"
          map={brickWallFB}
          side={BackSide}
        />
        <meshStandardMaterial
          attach="material-4"
          color="purple"
          side={BackSide}
        />
        <meshStandardMaterial
          attach="material-5"
          map={concreteFloor}
          side={BackSide}
        />
      </mesh>
    </>
  );
}

export default GarageModel;
