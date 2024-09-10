import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";

import SandbagModel from "../3D/SandbagModel/SandbagModel";

function MainGameCanvas() {
  function CameraControls() {
    const { camera } = useThree();
    useEffect(() => {
      camera.lookAt(0, 2, 0);
    }, [camera]);

    return null;
  }

  return (
    <div className="relative w-full flex-grow">
      <div className="aspect-video max-h-[90vh] w-full">
        <Canvas
          className="h-full w-full"
          shadows
          camera={{
            position: [0, 3, 6],
            fov: 30,
          }}
        >
          <CameraControls />
          <color attach="background" args={["teal"]} />

          <ambientLight color="#FDF3C6" intensity={1.7} />
          <directionalLight
            castShadow
            position={[10, 10, 10]}
            intensity={1.3}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-far={100}
            shadow-camera-near={0.1}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
            shadow-radius={70}
          />

          <SandbagModel />
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[30, 30]} />
            <meshPhongMaterial color="gray" shininess={10} />
          </mesh>
        </Canvas>
      </div>
    </div>
  );
}

export default MainGameCanvas;
