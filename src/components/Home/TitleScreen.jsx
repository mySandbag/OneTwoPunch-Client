import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import titleImage from "../../assets/onetwopunch.webp";

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
      <img
        className="mb-4 h-2/3 w-auto object-contain lg:mb-16 lg:h-[618px] lg:w-[796px]"
        src={titleImage}
        alt="one two punch logo"
      />
      <button
        className="transform rounded-lg bg-punch-red px-4 py-2 text-2xl font-bold text-punch-white shadow-lg transition duration-300 ease-in-out hover:scale-105 hover:bg-punch-dark-red lg:px-6 lg:py-4 lg:text-4xl"
        onClick={navigateToMainGame}
        ref={buttonRef}
      >
        START GAME
      </button>
    </main>
  );
}

export default TitleScreen;
