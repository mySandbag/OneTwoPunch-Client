import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import titleImage from "../../assets/onetwopunch.png";

function TitleScreen() {
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleEnterPress = (event) => {
      if (event.key === "Enter") {
        buttonRef.current.click();
      }
    };

    window.addEventListener("keydown", handleEnterPress);

    return () => {
      window.removeEventListener("keydown", handleEnterPress);
    };
  }, []);

  const navigateToMainGame = () => {
    navigate("/main-game");
  };

  return (
    <main className="flex h-screen select-none flex-col items-center justify-center bg-black">
      <img className="mb-16 w-[680px]" src={titleImage} />
      <button
        className="bg-punch-red text-punch-white hover:bg-punch-dark-red transform rounded-lg px-6 py-4 text-4xl font-bold shadow-lg transition duration-300 ease-in-out hover:scale-105"
        onClick={navigateToMainGame}
        ref={buttonRef}
      >
        START GAME
      </button>
    </main>
  );
}

export default TitleScreen;
