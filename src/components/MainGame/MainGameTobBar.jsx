import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Modal from "../Modal/Modal";
import usePackageStore from "../../store";

import homeIcon from "../../assets/home-icon.svg";

function MainGameTobBar() {
  const { getHitCount, resetHitCount, resetComboCount } = usePackageStore();
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
      resetComboCount();
    };
  }, []);

  return (
    <div className="absolute z-50 flex-none px-0">
      <div className="mx-0 my-1 flex w-screen items-center justify-evenly bg-black bg-opacity-50 px-0 md:my-4">
        <button
          className="text-md m-2 flex h-7 w-7 items-center justify-center rounded-lg border border-gray-800 bg-punch-red p-1 font-bold text-white shadow-md shadow-black text-shadow sm:text-lg md:m-0 md:h-12 md:w-12 md:text-xl lg:h-16 lg:w-16"
          onClick={navigateToTitle}
        >
          <img src={homeIcon} className="lg:w-10" />
        </button>
        <div className="text-md text-shadow-white textShadow-lg relative m-2 flex items-center justify-between rounded-lg p-1 text-center font-square font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,1)] text-shadow-lg sm:p-1 sm:text-2xl md:m-0 md:w-60 md:text-5xl">
          <span className="">Hit: </span>
          <span className="">{String(getHitCount()).padStart(5, "0")}</span>
        </div>
        <button
          className="text-md m-2 hidden h-6 w-6 rounded-lg border border-gray-800 bg-punch-blue p-1 font-square font-bold text-white shadow-md shadow-black text-shadow sm:text-lg md:m-0 md:h-8 md:w-8 md:text-xl lg:block lg:h-16 lg:w-16 lg:text-4xl"
          onClick={openModal}
        >
          ?
        </button>
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <h2 className="mb-1 text-xl font-bold md:mb-4 md:text-4xl">How to Play🥊</h2>
          <p className="mb-1 text-base md:mb-4 lg:text-2xl">Press the key to control your fist!</p>
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
              <div className="m-1 lg:m-2">
                <span className="mr-2 inline-block h-[25px] w-[25px] rounded-lg border border-gray-400 bg-slate-100 text-center font-mono font-bold leading-[25px] text-gray-800 shadow-lg md:h-[45px] md:w-[45px] md:leading-[45px]">
                  V
                </span>
                : Left Uppercut
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
              <div className="m-1 lg:m-2">
                <span className="mr-2 inline-block h-[25px] w-[25px] rounded-lg border border-gray-400 bg-slate-100 text-center font-mono font-bold leading-[25px] text-gray-800 shadow-lg md:h-[45px] md:w-[45px] md:leading-[45px]">
                  N
                </span>
                : Right Uppercut
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-row items-center justify-evenly">
            <div className="flex flex-col">
              <div>
                <span className="invisible mb-2 mr-2 inline-block h-[25px] w-[25px] rounded-lg border border-gray-400 bg-slate-100 text-center font-bold leading-[25px] text-gray-800 shadow-lg md:h-[45px] md:w-[45px] md:leading-[45px]">
                  N
                </span>
                <span className="mb-2 mr-2 inline-block h-[25px] w-[25px] rounded-lg border border-gray-400 bg-slate-100 text-center font-bold leading-[25px] text-gray-800 shadow-lg md:h-[45px] md:w-[45px] md:leading-[45px]">
                  ▲
                </span>
                <span className="invisible mb-2 mr-2 inline-block h-[25px] w-[25px] rounded-lg border border-gray-400 bg-slate-100 text-center font-bold leading-[25px] text-gray-800 shadow-lg md:h-[45px] md:w-[45px] md:leading-[45px]">
                  N
                </span>
              </div>
              <div>
                <span className="mr-2 inline-block h-[25px] w-[25px] rounded-lg border border-gray-400 bg-slate-100 text-center font-bold leading-[25px] text-gray-800 shadow-lg md:h-[45px] md:w-[45px] md:leading-[45px]">
                  ◀
                </span>
                <span className="mr-2 inline-block h-[25px] w-[25px] rounded-lg border border-gray-400 bg-slate-100 text-center font-bold leading-[25px] text-gray-800 shadow-lg md:h-[45px] md:w-[45px] md:leading-[45px]">
                  ▼
                </span>
                <span className="mr-2 inline-block h-[25px] w-[25px] rounded-lg border border-gray-400 bg-slate-100 text-center font-bold leading-[25px] text-gray-800 shadow-lg md:h-[45px] md:w-[45px] md:leading-[45px]">
                  ▶
                </span>
              </div>
            </div>
            <div className="ml-3 flex flex-col justify-center text-3xl leading-normal">
              <p> Top: Move forward</p>
              <p> Down: Move backward</p>
              <p> Left: Rotate Left</p>
              <p> Right: Rotate Right</p>
            </div>
          </div>
          <p className="mt-3 text-center text-lg text-red-400">
            * You can only hit the Punchbag when you're directly in front of it *
          </p>
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
