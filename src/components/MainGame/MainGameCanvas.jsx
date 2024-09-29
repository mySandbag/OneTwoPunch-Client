import { useState, useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import GarageModel from "../3D/BackgroundModel/Garage";
import SandbagModel from "../3D/SandbagModel/Sandbag";
import GloveLeft from "../3D/GloveModel/GloveLeft";
import GloveRight from "../3D/GloveModel/GloveRight";
import usePackageStore from "../../store";

import { DELTA_MOVING } from "../../constants/animationSettings";

import landScapeIcon from "../../assets/landscape-icon.svg";

function MainGameCanvas() {
  const [animateSandbag, setAnimateSandbag] = useState(false);
  const [animateLeft, setAnimateLeft] = useState(false);
  const [animateRight, setAnimateRight] = useState(false);
  const [moveLeftRightGloves, setMoveLeftRightGloves] = useState(false);

  const xRef = useRef(0);
  const zRef = useRef(0);

  const isDev = import.meta.env.VITE_ENVIRONMENT === "DEV";

  const {
    setMoveDirection,
    getMovePosition,
    setMovePosition,
    getHitInProgress,
    getCurrentGloveAnimation,
    setCurrentGloveAnimation,
    getComboCount,
  } = usePackageStore();

  const currentMoving = getMovePosition();

  const CameraControls = () => {
    const { camera, gl } = useThree();
    useEffect(() => {
      camera.position.set(0 + xRef.current, 2.5, 3.5 + zRef.current);
      camera.lookAt(0 + xRef.current, 2, 0 + zRef.current);
    }, [camera, gl, moveLeftRightGloves]);

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

  const handleLeftGloveUppercutAnimationTrigger = (event) => {
    if (event.code === "KeyV" && !getCurrentGloveAnimation().left && getCurrentGloveAnimation().right !== "uppercut") {
      setCurrentGloveAnimation({ left: "uppercut" });
      setAnimateLeft(true);
    }
  };

  const handleRightGloveUppercutAnimationTrigger = (event) => {
    if (event.code === "KeyN" && !getCurrentGloveAnimation().right && getCurrentGloveAnimation().left !== "uppercut") {
      setCurrentGloveAnimation({ right: "uppercut" });
      setAnimateRight(true);
    }
  };

  const handleMoveLeftRightGloves = (event) => {
    if (!getCurrentGloveAnimation().right && !getCurrentGloveAnimation().left && !moveLeftRightGloves) {
      switch (event.code) {
        case "ArrowRight":
          setMovePosition({ right: (currentMoving.right += DELTA_MOVING) });
          setMoveDirection("right");
          xRef.current += DELTA_MOVING;
          setMoveLeftRightGloves(true);
          break;
        case "ArrowLeft":
          setMovePosition({ left: (currentMoving.left += DELTA_MOVING) });
          setMoveDirection("left");
          xRef.current -= DELTA_MOVING;
          setMoveLeftRightGloves(true);
          break;
        case "ArrowUp":
          setMovePosition({ up: (currentMoving.up += DELTA_MOVING) });
          setMoveDirection("up");
          zRef.current -= DELTA_MOVING;
          setMoveLeftRightGloves(true);
          break;
        case "ArrowDown":
          setMovePosition({ down: (currentMoving.down += DELTA_MOVING) });
          setMoveDirection("down");
          zRef.current += DELTA_MOVING;
          setMoveLeftRightGloves(true);
          break;
      }
    }
  };

  const handleAnimationSandbagEnd = () => setAnimateSandbag(false);
  const handleAnimationRightEnd = () => setAnimateRight(false);
  const handleAnimationLeftEnd = () => setAnimateLeft(false);
  const handleMoveLeftRightGloveEnd = () => setMoveLeftRightGloves(false);

  useEffect(() => {
    window.addEventListener("keydown", handleLeftGloveHookAnimationTrigger);
    window.addEventListener("keydown", handleRightGlovePunchAnimationTrigger);
    window.addEventListener("keydown", handleRightGloveHookAnimationTrigger);
    window.addEventListener("keydown", handleLeftGlovePunchAnimationTrigger);
    window.addEventListener("keydown", handleLeftGloveUppercutAnimationTrigger);
    window.addEventListener("keydown", handleRightGloveUppercutAnimationTrigger);
    window.addEventListener("keydown", handleMoveLeftRightGloves);

    return () => {
      window.removeEventListener("keydown", handleLeftGloveHookAnimationTrigger);
      window.removeEventListener("keydown", handleRightGlovePunchAnimationTrigger);
      window.removeEventListener("keydown", handleRightGloveHookAnimationTrigger);
      window.removeEventListener("keydown", handleLeftGlovePunchAnimationTrigger);
      window.removeEventListener("keydown", handleLeftGloveUppercutAnimationTrigger);
      window.removeEventListener("keydown", handleRightGloveUppercutAnimationTrigger);
      window.removeEventListener("keydown", handleMoveLeftRightGloves);
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
            fov: 50,
            near: 0.1,
            far: 200,
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
          <SandbagModel triggerAnimation={animateSandbag} onAnimationEnd={handleAnimationSandbagEnd} />
          <GloveLeft
            triggerAnimation={animateLeft}
            onAnimationEnd={handleAnimationLeftEnd}
            triggerMove={moveLeftRightGloves}
            onMovesEnd={handleMoveLeftRightGloveEnd}
          />
          <GloveRight
            triggerAnimation={animateRight}
            onAnimationEnd={handleAnimationRightEnd}
            triggerMove={moveLeftRightGloves}
            onMovesEnd={handleMoveLeftRightGloveEnd}
          />

          {isDev ? <OrbitControls maxPolarAngle={Math.PI / 2} /> : null}
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
                className="absolute bottom-32 left-3 h-20 w-24 rounded-full border-2 border-white text-lg font-semibold text-white shadow-sm shadow-black text-shadow"
                onClick={() => {
                  setCurrentGloveAnimation({ left: "hook" });
                  setAnimateLeft(true);
                }}
              >
                Hook
              </button>
              <button
                className="absolute bottom-20 left-28 h-20 w-24 rounded-full border-2 border-white text-lg font-semibold text-white shadow-sm shadow-black text-shadow"
                onClick={() => {
                  setCurrentGloveAnimation({ left: "punch" });
                  setAnimateLeft(true);
                }}
              >
                Punch
              </button>
              <button
                className="absolute bottom-8 left-3 h-20 w-24 rounded-full border-2 border-white text-lg font-semibold leading-6 text-white shadow-sm shadow-black text-shadow"
                onClick={() => {
                  setCurrentGloveAnimation({ left: "uppercut" });
                  setAnimateLeft(true);
                }}
              >
                Uppercut
              </button>
            </div>
            <div>
              <button
                className="absolute bottom-32 right-3 h-20 w-24 rounded-full border-2 border-white text-lg font-semibold text-white shadow-sm shadow-black text-shadow"
                onClick={() => {
                  setCurrentGloveAnimation({ right: "hook" });
                  setAnimateRight(true);
                }}
              >
                Hook
              </button>
              <button
                className="absolute bottom-20 right-28 h-20 w-24 rounded-full border-2 border-white text-lg font-semibold text-white shadow-sm shadow-black text-shadow"
                onClick={() => {
                  setCurrentGloveAnimation({ right: "punch" });
                  setAnimateRight(true);
                }}
              >
                Punch
              </button>
              <button
                className="absolute bottom-8 right-3 h-20 w-24 rounded-full border-2 border-white text-lg font-semibold leading-6 text-white shadow-sm shadow-black text-shadow"
                onClick={() => {
                  setCurrentGloveAnimation({ right: "uppercut" });
                  setAnimateRight(true);
                }}
              >
                Uppercut
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 block sm:hidden">
        <div className="text-md flex flex-col items-center text-center text-white">
          <img src={landScapeIcon} width="50px" />
          <div className="block flex flex-col text-xl md:inline md:flex-row">
            <span className="">Landscape mode is recommended </span>
            <span className=""> for mobile devices</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainGameCanvas;
