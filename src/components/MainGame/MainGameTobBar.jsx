import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Modal from "../Modal/Modal";
import usePackageStore from "../../store";

function MainGameTobBar() {
  const { getHitCount, resetHitCount } = usePackageStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const navigateToTitle = () => {
    navigate("/");
  };

  useEffect(() => {
    return () => {
      resetHitCount();
    };
  }, []);

  return (
    <div className="absolute z-50 flex-none">
      <div className="my-1 flex w-screen justify-evenly md:m-4">
        <button
          className="text-md text-shadow m-2 w-40 rounded-lg border border-gray-400 bg-punch-red p-1 font-bold text-white shadow-md shadow-black sm:p-2 sm:text-lg md:m-0 md:text-xl"
          onClick={navigateToTitle}
        >
          Back to Title
        </button>
        <button
          className="text-md text-shadow m-2 w-40 rounded-lg border border-gray-400 bg-punch-blue p-1 font-bold text-white shadow-md shadow-black sm:p-2 sm:text-lg md:m-0 md:text-xl"
          onClick={openModal}
        >
          How to Play
        </button>
        <div className="text-md m-2 w-40 rounded-lg border border-gray-400 bg-white p-1 text-center font-bold shadow-md sm:p-2 sm:text-lg md:m-0 md:text-xl">
          <span className="inline">Hit: </span>
          <span className="inline">
            {String(getHitCount()).padStart(5, "0")}
          </span>
        </div>
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <h2 className="mb-1 text-xl font-bold md:mb-4 md:text-4xl">
            How to Play🥊
          </h2>
          <p className="mb-1 text-base md:mb-4 lg:text-2xl">
            Press the key to control your fist!
          </p>
          <div className="text-md my-1 flex flex-row md:text-3xl">
            <div className="flex flex-col justify-between">
              <div className="m-1 lg:m-2">
                <span className="mr-2 inline-block h-[25px] w-[25px] rounded-lg border border-gray-400 bg-slate-100 text-center font-mono font-bold leading-[25px] text-gray-800 shadow-lg md:h-[45px] md:w-[45px] md:leading-[45px]">
                  E
                </span>
                : Left Hook
              </div>
              <div className="m-1 lg:m-2">
                <span className="mr-2 inline-block h-[25px] w-[25px] rounded-lg border border-gray-400 bg-slate-100 text-center font-mono font-bold leading-[25px] text-gray-800 shadow-lg md:h-[45px] md:w-[45px] md:leading-[45px]">
                  F
                </span>
                : Left Punch
              </div>
            </div>
            <div className="flex flex-col justify-between">
              <div className="m-1 lg:m-2">
                <span className="mr-2 inline-block h-[25px] w-[25px] rounded-lg border border-gray-400 bg-slate-100 text-center font-mono font-bold leading-[25px] text-gray-800 shadow-lg md:h-[45px] md:w-[45px] md:leading-[45px]">
                  I
                </span>
                : Right Hook
              </div>
              <div className="m-1 lg:m-2">
                <span className="mr-2 inline-block h-[25px] w-[25px] rounded-lg border border-gray-400 bg-slate-100 text-center font-mono font-bold leading-[25px] text-gray-800 shadow-lg md:h-[45px] md:w-[45px] md:leading-[45px]">
                  J
                </span>
                : Right Punch
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={closeModal}
              className="mt-1 rounded-md bg-punch-red px-3 py-1 text-center text-base font-bold text-white md:mt-4 md:text-2xl lg:px-4 lg:py-2"
            >
              OK
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default MainGameTobBar;
