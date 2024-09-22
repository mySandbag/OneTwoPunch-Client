import { Suspense } from "react";

import MainGameTobBar from "./MainGameTobBar";
import GameLoading from "../GameLoading/GameLoading";
import MainGameCanvas from "./MainGameCanvas";

function MainGame() {
  return (
    <main className="flex h-screen w-screen select-none flex-col items-center justify-start overflow-hidden bg-black">
      <MainGameTobBar />
      <Suspense fallback={<GameLoading />}>
        <MainGameCanvas />
      </Suspense>
    </main>
  );
}

export default MainGame;
