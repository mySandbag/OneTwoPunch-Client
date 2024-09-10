import { Canvas } from "@react-three/fiber";

import MainGameTobBar from "./MainGameTobBar";

function MainGame() {
  return (
    <main className="flex h-screen w-screen select-none flex-col items-center justify-center bg-black">
      <MainGameTobBar />
      <div className="h-[90vh] w-[90vh] border-2 border-solid border-sky-200">
        <Canvas></Canvas>
      </div>
    </main>
  );
}

export default MainGame;
