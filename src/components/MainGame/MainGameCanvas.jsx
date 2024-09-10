import { Canvas } from "@react-three/fiber";

function MainGameCanvas() {
  return (
    <div className="relative w-full flex-grow border-2 border-solid border-sky-200">
      <div className="aspect-video w-full">
        <Canvas className="h-full w-full"></Canvas>
      </div>
    </div>
  );
}

export default MainGameCanvas;
