import { useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import GarageModel from "../3D/BackgroundModel/Garage";
import SandbagModel from "../3D/SandbagModel/Sandbag";
import GloveLeft from "../3D/GloveModel/GloveLeft";
import GloveRight from "../3D/GloveModel/GloveRight";
import usePackageStore from "../../store";

function MainGameCanvas() {
  const [animateSandbag, setAnimateSandbag] = useState(false);
  const [animateLeft, setAnimateLeft] = useState(false);
  const [animateRight, setAnimateRight] = useState(false);

  const isDev = import.meta.env.VITE_ENVIRONMENT === "DEV";

  const { getHitInProgress, setCurrentGloveAnimation } = usePackageStore();
  const CameraControls = () => {
    const { camera } = useThree();
    useEffect(() => {
      camera.lookAt(0, 2, 0);
    }, [camera]);

    return null;
  };

  const handleLeftGloveHookAnimationTrigger = (event) => {
    if (event.key === "E" || event.key === "e") {
      setCurrentGloveAnimation({ left: "hook" });
      setAnimateLeft(true);
    }
  };

  const handleLeftGlovePunchAnimationTrigger = (event) => {
    if (event.key === "F" || event.key === "f") {
      setCurrentGloveAnimation({ left: "punch" });
      setAnimateLeft(true);
    }
  };

  const handleRightGlovePunchAnimationTrigger = (event) => {
    if (event.key === "J" || event.key === "j") {
      setCurrentGloveAnimation({ right: "punch" });
      setAnimateRight(true);
    }
  };

  const handleRightGloveHookAnimationTrigger = (event) => {
    if (event.key === "I" || event.key === "i") {
      setCurrentGloveAnimation({ right: "hook" });
      setAnimateRight(true);
    }
  };

  const handleAnimationSandbagEnd = () => setAnimateSandbag(false);
  const handleAnimationRightEnd = () => setAnimateRight(false);
  const handleAnimationLeftEnd = () => setAnimateLeft(false);

  useEffect(() => {
    window.addEventListener("keydown", handleLeftGloveHookAnimationTrigger);
    window.addEventListener("keydown", handleRightGlovePunchAnimationTrigger);
    window.addEventListener("keydown", handleRightGloveHookAnimationTrigger);
    window.addEventListener("keydown", handleLeftGlovePunchAnimationTrigger);

    return () => {
      window.removeEventListener(
        "keydown",
        handleLeftGloveHookAnimationTrigger,
      );
      window.removeEventListener(
        "keydown",
        handleRightGlovePunchAnimationTrigger,
      );
      window.removeEventListener(
        "keydown",
        handleRightGloveHookAnimationTrigger,
      );
      window.removeEventListener(
        "keydown",
        handleLeftGlovePunchAnimationTrigger,
      );
    };
  }, []);

  useEffect(() => {
    if (getHitInProgress()) {
      setAnimateSandbag(true);
    }
  }, [getHitInProgress()]);

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
          <ambientLight color="#a3c1da" intensity={1.1} />
          <directionalLight
            castShadow
            position={[10, 10, 10]}
            intensity={1.3}
            shadow-mapSize-width={1048}
            shadow-mapSize-height={1048}
            shadow-camera-far={100}
            shadow-camera-near={0.1}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
            shadow-radius={10}
          />

          <GarageModel />
          <SandbagModel
            triggerAnimation={animateSandbag}
            onAnimationEnd={handleAnimationSandbagEnd}
          />
          <GloveLeft
            triggerAnimation={animateLeft}
            onAnimationEnd={handleAnimationLeftEnd}
          />
          <GloveRight
            triggerAnimation={animateRight}
            onAnimationEnd={handleAnimationRightEnd}
          />

          {isDev ? <OrbitControls /> : null}
        </Canvas>
      </div>
      <div className="grid grid-cols-2 gap-4 p-4 md:hidden">
        <button
          className="h-28 rounded-lg border border-gray-300 bg-gray-100 text-2xl font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-200"
          onClick={() => {
            setCurrentGloveAnimation({ left: "hook" });
            setAnimateLeft(true);
          }}
        >
          Left Hook
        </button>
        <button
          className="h-28 rounded-lg border border-gray-300 bg-gray-100 text-2xl font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-200"
          onClick={() => {
            setCurrentGloveAnimation({ right: "hook" });
            setAnimateRight(true);
          }}
        >
          Right Hook
        </button>
        <button
          className="h-28 rounded-lg border border-gray-300 bg-gray-100 text-2xl font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-200"
          onClick={() => {
            setCurrentGloveAnimation({ left: "punch" });
            setAnimateLeft(true);
          }}
        >
          Left Punch
        </button>
        <button
          className="h-28 rounded-lg border border-gray-300 bg-gray-100 text-2xl font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-200"
          onClick={() => {
            setCurrentGloveAnimation({ right: "punch" });
            setAnimateRight(true);
          }}
        >
          Right Punch
        </button>
      </div>
    </div>
  );
}

export default MainGameCanvas;
