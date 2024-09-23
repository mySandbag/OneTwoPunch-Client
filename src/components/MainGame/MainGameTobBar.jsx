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
    <div className="flex-none">
      <div className="m-2 flex w-screen justify-evenly md:m-6">
        <button
          className="m-2 w-40 rounded-lg bg-punch-red p-2 text-xl font-bold text-white md:m-0"
          onClick={navigateToTitle}
        >
          Back to Title
        </button>
        <button
          className="m-2 w-40 rounded-lg bg-punch-blue p-2 text-xl font-bold text-white md:m-0"
          onClick={openModal}
        >
          How to Play
        </button>
        <div className="m-2 w-40 rounded-lg bg-white p-2 text-center text-xl font-bold md:m-0">
          <span className="block md:inline">Hit: </span>
          <span className="block md:inline">
            {String(getHitCount()).padStart(4, "0")}
          </span>
        </div>
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <h2 className="mb-4 text-4xl font-bold">How to Play🥊</h2>
          <p className="mb-4 text-xl md:text-2xl">
            Press the key to control your fist!
          </p>
          <div className="text-md my-1 flex flex-row md:text-3xl">
            <div className="flex flex-col justify-between">
              <div className="m-2">
                <span className="mr-2 inline-block h-[45px] w-[45px] rounded-lg border border-gray-400 bg-slate-100 text-center font-mono font-bold leading-[45px] text-gray-800 shadow-lg">
                  E
                </span>
                : Left Hook
              </div>
              <div className="m-2">
                <span className="mr-2 inline-block h-[45px] w-[45px] rounded-lg border border-gray-400 bg-slate-100 text-center font-mono font-bold leading-[45px] text-gray-800 shadow-lg">
                  F
                </span>
                : Left Punch
              </div>
            </div>
            <div className="flex flex-col justify-between">
              <div className="m-2">
                <span className="mr-2 inline-block h-[45px] w-[45px] rounded-lg border border-gray-400 bg-slate-100 text-center font-mono font-bold leading-[45px] text-gray-800 shadow-lg">
                  I
                </span>
                : Right Hook
              </div>
              <div className="m-2">
                <span className="mr-2 inline-block h-[45px] w-[45px] rounded-lg border border-gray-400 bg-slate-100 text-center font-mono font-bold leading-[45px] text-gray-800 shadow-lg">
                  J
                </span>
                : Right Punch
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={closeModal}
              className="mt-4 rounded-md bg-punch-red px-4 py-2 text-center text-2xl font-bold text-white"
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
