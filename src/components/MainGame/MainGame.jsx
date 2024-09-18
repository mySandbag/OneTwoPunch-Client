import MainGameTobBar from "./MainGameTobBar";
import MainGameCanvas from "./MainGameCanvas";

function MainGame() {
  return (
    <main className="flex h-screen w-screen select-none flex-col items-center justify-start overflow-hidden bg-black">
      <MainGameTobBar />
      <MainGameCanvas />
    </main>
  );
}

export default MainGame;
