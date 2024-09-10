import { Route, Routes } from "react-router-dom";
import TitleScreen from "./components/Home/TitleScreen";
import MainGame from "./components/MainGame/MainGame";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<TitleScreen />} />
        <Route path="/main-game" element={<MainGame />} />
      </Routes>
    </>
  );
}

export default App;
