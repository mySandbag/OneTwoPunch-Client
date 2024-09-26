import { useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import GarageModel from "../3D/BackgroundModel/Garage";
import SandbagModel from "../3D/SandbagModel/Sandbag";
import GloveLeft from "../3D/GloveModel/GloveLeft";
import GloveRight from "../3D/GloveModel/GloveRight";
import usePackageStore from "../../store";

import landScapeIcon from "../../assets/landscape-icon.svg";

function MainGameCanvas() {
  const [animateSandbag, setAnimateSandbag] = useState(false);
  const [animateLeft, setAnimateLeft] = useState(false);
  const [animateRight, setAnimateRight] = useState(false);

  const isDev = import.meta.env.VITE_ENVIRONMENT === "DEV";

  const {
    getHitInProgress,
    getCurrentGloveAnimation,
    setCurrentGloveAnimation,
    getComboCount,
  } = usePackageStore();
  const CameraControls = () => {
    const { camera } = useThree();
    useEffect(() => {
      camera.lookAt(0, 2, 0);
    }, [camera]);

    return null;
  };

  const handleLeftGloveHookAnimationTrigger = (event) => {
    if (event.code === "KeyE" && !getCurrentGloveAnimation().left) {
      setCurrentGloveAnimation({ left: "hook" });
      setAnimateLeft(true);
    }
  };

  const handleLeftGlovePunchAnimationTrigger = (event) => {
    if (event.code === "KeyF" && !getCurrentGloveAnimation().left) {
      setCurrentGloveAnimation({ left: "punch" });
      setAnimateLeft(true);
    }
  };

  const handleRightGlovePunchAnimationTrigger = (event) => {
    if (event.code === "KeyJ" && !getCurrentGloveAnimation().right) {
      setCurrentGloveAnimation({ right: "punch" });
      setAnimateRight(true);
    }
  };

  const handleRightGloveHookAnimationTrigger = (event) => {
    if (event.code === "KeyI" && !getCurrentGloveAnimation().right) {
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
    <div className="w-full overflow-hidden">
      <div className="relative aspect-4/3 max-h-screen w-full md:aspect-video">
        <Canvas
          className="h-full w-full"
          shadows
          camera={{
            position: [0, 2.5, 3.5],
            fov: 50,
            near: 0.1,
            far: 20,
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
        {getComboCount() > 0 && (
          <div
            className={`font-comicy ${getComboCount() % 2 === 0 ? "skew-y-2 text-punch-blue" : "-skew-y-3 text-punch-red"} fixed -inset-x-1/2 inset-y-1/4 text-center text-3xl drop-shadow-[0_2px_2px_rgba(0,0,0,1)] text-shadow-lg md:text-5xl lg:text-7xl`}
          >
            <span>{getComboCount()}</span>
            <span>{" " + "COMBO"}</span>
          </div>
        )}
        <div className="z-50 hidden sm:block lg:hidden">
          <div className="p-4">
            <div>
              <button
                className="absolute bottom-40 left-2 h-20 w-40 rounded-full border-2 border-white text-2xl font-semibold text-white shadow-sm shadow-black text-shadow"
                onClick={() => {
                  setCurrentGloveAnimation({ left: "hook" });
                  setAnimateLeft(true);
                }}
              >
                Left Hook
              </button>
              <button
                className="absolute bottom-16 left-2 h-20 w-40 rounded-full border-2 border-white text-2xl font-semibold text-white shadow-sm shadow-black text-shadow"
                onClick={() => {
                  setCurrentGloveAnimation({ left: "punch" });
                  setAnimateLeft(true);
                }}
              >
                Left Punch
              </button>
            </div>
            <div>
              <button
                className="absolute bottom-40 right-2 h-20 w-40 rounded-full border-2 border-white text-2xl font-semibold text-white shadow-sm shadow-black text-shadow"
                onClick={() => {
                  setCurrentGloveAnimation({ right: "hook" });
                  setAnimateRight(true);
                }}
              >
                Right Hook
              </button>
              <button
                className="absolute bottom-16 right-2 h-20 w-40 rounded-full border-2 border-white text-2xl font-semibold text-white shadow-sm shadow-black text-shadow"
                onClick={() => {
                  setCurrentGloveAnimation({ right: "punch" });
                  setAnimateRight(true);
                }}
              >
                Right Punch
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 block sm:hidden">
        <div className="flex flex-col items-center text-center text-sm text-white">
          <img src={landScapeIcon} width="50px" />
          Landscape mode is recommended for mobile devices.
        </div>
        <div className="grid grid-cols-2 gap-3 p-4">
          <button
            className="h-24 rounded-lg border border-gray-300 bg-gray-100 text-2xl font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-200"
            onClick={() => {
              setCurrentGloveAnimation({ left: "hook" });
              setAnimateLeft(true);
            }}
          >
            Left Hook
          </button>
          <button
            className="h-24 rounded-lg border border-gray-300 bg-gray-100 text-2xl font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-200"
            onClick={() => {
              setCurrentGloveAnimation({ right: "hook" });
              setAnimateRight(true);
            }}
          >
            Right Hook
          </button>
          <button
            className="h-24 rounded-lg border border-gray-300 bg-gray-100 text-2xl font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-200"
            onClick={() => {
              setCurrentGloveAnimation({ left: "punch" });
              setAnimateLeft(true);
            }}
          >
            Left Punch
          </button>
          <button
            className="h-24 rounded-lg border border-gray-300 bg-gray-100 text-2xl font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-200"
            onClick={() => {
              setCurrentGloveAnimation({ right: "punch" });
              setAnimateRight(true);
            }}
          >
            Right Punch
          </button>
        </div>
      </div>
    </div>
  );
}

export default MainGameCanvas;
