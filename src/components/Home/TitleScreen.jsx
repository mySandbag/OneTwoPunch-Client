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
        className="mb-16 w-5/6 md:h-[618px] md:w-[796px]"
        src={titleImage}
        alt="one two punch logo"
      />
      <button
        className="transform rounded-lg bg-punch-red px-6 py-4 text-2xl font-bold text-punch-white shadow-lg transition duration-300 ease-in-out hover:scale-105 hover:bg-punch-dark-red md:text-4xl"
        onClick={navigateToMainGame}
        ref={buttonRef}
      >
        START GAME
      </button>
    </main>
  );
}

export default TitleScreen;
