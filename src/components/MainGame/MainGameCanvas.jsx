import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";

import GarageModel from "../3D/GarageModel/GarageModel";
import SandbagModel from "../3D/SandbagModel/SandbagModel";
import GloveLeft from "../3D/GloveModel/GloveLeft";
import GloveRight from "../3D/GloveModel/GLoveRight";

function MainGameCanvas() {
  const CameraControls = () => {
    const { camera } = useThree();
    useEffect(() => {
      camera.lookAt(0, 2, 0);
    }, [camera]);

    return null;
  };

  return (
    <div className="relative w-full flex-grow">
      <div className="aspect-video max-h-[90vh] w-full">
        <Canvas
          className="h-full w-full"
          shadows
          camera={{
            position: [0, 2.5, 3.5],
            fov: 50,
          }}
        >
          <CameraControls />
          <ambientLight color="#FFFFFF" intensity={1.2} />
          <directionalLight
            castShadow
            position={[10, 10, 10]}
            intensity={1.3}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={100}
            shadow-camera-near={0.1}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
            shadow-radius={10}
          />

          <GarageModel />
          <SandbagModel />
          <GloveLeft />
          <GloveRight />
        </Canvas>
      </div>
    </div>
  );
}

export default MainGameCanvas;
