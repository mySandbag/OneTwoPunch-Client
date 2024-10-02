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
          <h2 className="font-pretendard mb-1 text-xl font-bold md:mb-4 md:text-4xl">플레이 방법</h2>
          <p className="font-pretendard mb-1 text-base md:mb-4 lg:text-xl">키보드를 눌러 주먹을 컨트롤해보세요!</p>
          <div className="text-md font-pretendard my-1 flex flex-row md:text-2xl">
            <div className="flex flex-col justify-between">
              <div className="m-1 lg:m-2">
                <span className="mr-2 inline-block h-[25px] w-[25px] rounded-lg border border-gray-400 bg-slate-100 text-center font-mono font-bold leading-[25px] text-gray-800 shadow-lg md:h-[45px] md:w-[45px] md:leading-[45px]">
                  E
                </span>
                : 레프트 훅
              </div>
              <div className="m-1 lg:m-2">
                <span className="mr-2 inline-block h-[25px] w-[25px] rounded-lg border border-gray-400 bg-slate-100 text-center font-mono font-bold leading-[25px] text-gray-800 shadow-lg md:h-[45px] md:w-[45px] md:leading-[45px]">
                  F
                </span>
                : 레프트 펀치
              </div>
              <div className="m-1 lg:m-2">
                <span className="mr-2 inline-block h-[25px] w-[25px] rounded-lg border border-gray-400 bg-slate-100 text-center font-mono font-bold leading-[25px] text-gray-800 shadow-lg md:h-[45px] md:w-[45px] md:leading-[45px]">
                  V
                </span>
                : 레프트 어퍼컷
              </div>
            </div>
            <div className="flex flex-col justify-between">
              <div className="m-1 lg:m-2">
                <span className="mr-2 inline-block h-[25px] w-[25px] rounded-lg border border-gray-400 bg-slate-100 text-center font-mono font-bold leading-[25px] text-gray-800 shadow-lg md:h-[45px] md:w-[45px] md:leading-[45px]">
                  I
                </span>
                : 라이트 훅
              </div>
              <div className="m-1 lg:m-2">
                <span className="mr-2 inline-block h-[25px] w-[25px] rounded-lg border border-gray-400 bg-slate-100 text-center font-mono font-bold leading-[25px] text-gray-800 shadow-lg md:h-[45px] md:w-[45px] md:leading-[45px]">
                  J
                </span>
                : 라이트 펀치
              </div>
              <div className="m-1 lg:m-2">
                <span className="mr-2 inline-block h-[25px] w-[25px] rounded-lg border border-gray-400 bg-slate-100 text-center font-mono font-bold leading-[25px] text-gray-800 shadow-lg md:h-[45px] md:w-[45px] md:leading-[45px]">
                  I
                </span>
                : 라이트 어퍼컷
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-row items-start justify-evenly">
            <div className="flex flex-col">
              <div>
                <span className="invisible mb-2 mr-2 inline-block h-[25px] w-[25px] rounded-lg border border-gray-400 bg-slate-100 text-center font-bold leading-[25px] text-gray-800 shadow-lg md:h-[45px] md:w-[45px] md:leading-[45px]">
                  {" "}
                </span>
                <span className="mb-2 mr-2 inline-block h-[25px] w-[25px] rounded-lg border border-gray-400 bg-slate-100 text-center font-bold leading-[25px] text-gray-800 shadow-lg md:h-[45px] md:w-[45px] md:leading-[45px]">
                  ▲
                </span>
                <span className="invisible mb-2 mr-2 inline-block h-[25px] w-[25px] rounded-lg border border-gray-400 bg-slate-100 text-center font-bold leading-[25px] text-gray-800 shadow-lg md:h-[45px] md:w-[45px] md:leading-[45px]">
                  {" "}
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
            <div className="font-pretendard ml-3 flex flex-col justify-center text-2xl leading-relaxed">
              <p> 위: 앞으로 이동</p>
              <p> 아래: 뒤로 이동</p>
              <p> 왼쪽: 왼쪽으로 회전</p>
              <p> 오른쪽: 오른쪽으로 회전</p>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={closeModal}
              className="mt-1 rounded-md bg-blue-400 px-4 py-2 text-center text-base font-bold text-white md:mt-4 md:text-2xl lg:px-4 lg:py-2"
            >
              확인
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default MainGameTobBar;
