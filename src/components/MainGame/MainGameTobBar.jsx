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
      <div className="m-6 flex w-screen justify-evenly">
        <button
          className="w-40 rounded-lg bg-punch-red p-2 text-xl font-bold text-white"
          onClick={navigateToTitle}
        >
          Back to Title
        </button>
        <button
          className="w-40 rounded-lg bg-punch-blue p-2 text-xl font-bold text-white"
          onClick={openModal}
        >
          How to Play
        </button>
        <div className="w-40 rounded-lg bg-white p-2 text-center text-xl font-bold">
          Hit: {String(getHitCount()).padStart(4, "0")}
        </div>
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <h2 className="mb- text-xl font-bold">How to Play</h2>
          <p>추후 업데이트 예정</p>
          <div className="flex justify-center">
            <button
              onClick={closeModal}
              className="mt-4 rounded bg-punch-red p-2 text-center font-bold"
            >
              닫기
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default MainGameTobBar;
