import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Modal from "../Modal/Modal";

function MainGameTobBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const navigateToTitle = () => {
    navigate("/");
  };

  return (
    <div className="flex-none">
      <div className="m-6 flex w-screen justify-evenly">
        <button
          className="bg-punch-red w-40 rounded-lg p-2 text-xl font-bold text-white"
          onClick={navigateToTitle}
        >
          Back to Title
        </button>
        <button
          className="bg-punch-blue w-40 rounded-lg p-2 text-xl font-bold text-white"
          onClick={openModal}
        >
          How to
        </button>
        <div className="w-40 rounded-lg bg-white p-2 text-center text-xl font-bold">
          Hit: 000
        </div>
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <h2 className="mb- text-xl font-bold">How to Game Play</h2>
          <p>추후 업데이트 예정</p>
          <div className="flex justify-center">
            <button
              onClick={closeModal}
              className="bg-punch-red mt-4 rounded p-2 text-center font-bold"
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
