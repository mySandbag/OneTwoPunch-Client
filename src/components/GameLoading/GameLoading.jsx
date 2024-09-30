import { useState, useEffect } from "react";

function GameLoading() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length === 6 ? "" : prev + " ."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute bottom-1/2 right-1/2 mb-4 flex translate-x-1/2 translate-y-1/2 transform flex-col items-center justify-center">
      <div className="relative mt-4 font-square text-4xl text-white">
        Loading Game <span className="inline-block">{dots}</span>
      </div>
    </div>
  );
}

export default GameLoading;
