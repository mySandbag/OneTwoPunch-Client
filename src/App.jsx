import { Route, Routes } from "react-router-dom";
import TitleScreen from "./components/Home/TitleScreen";
import MainGame from "./components/MainGame/MainGame";
import NotFound from "./components/NotFound/NotFound";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<TitleScreen />} />
        <Route path="/main-game" element={<MainGame />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
