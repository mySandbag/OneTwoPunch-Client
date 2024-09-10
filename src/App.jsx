import { Route, Routes } from "react-router-dom";
import TitleScreen from "./componnents/TitleScreen";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<TitleScreen />} />
      </Routes>
    </>
  );
}

export default App;
