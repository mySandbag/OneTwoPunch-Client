import { create } from "zustand";

import {
  LEFT_GLOVE_POSITION,
  LEFT_GLOVE_ROTATION,
  RIGHT_GLOVE_POSITION,
  RIGHT_GLOVE_ROTATION,
  SANDBAG_POSITION,
} from "../constants/gloveMotionSettings";

const createSummonGloveStateSlice = (set, get) => ({
  summonPosition: {
    leftX: 0,
    leftY: 0,
    leftZ: 0,
    rightX: 0,
    rightY: 0,
    rightZ: 0,
    sandbagX: 0,
    sandbagY: 0,
    sandbagZ: 0,
    isLeftInitialized: false,
    isRightInitialized: false,
    isSandbagInitialized: false,
  },
  summonRotation: {
    leftX: 0,
    leftY: 0,
    leftZ: 0,
    rightX: 0,
    rightY: 0,
    rightZ: 0,
    sandbagX: 0,
    sandbagY: 0,
    sandbagZ: 0,
    isLeftInitialized: false,
    isRightInitialized: false,
    isSandbagInitialized: false,
  },
  setSummonPosition: (setValue) =>
    set((state) => ({
      summonPosition: { ...state.summonPosition, ...setValue },
    })),
  setSummonRotation: (setValue) =>
    set((state) => ({
      summonRotation: { ...state.summonRotation, ...setValue },
    })),
  getSummonPosition: () => get().summonPosition,
  getSummonRotation: () => get().summonRotation,
});

const defaultConfiguredPosition = {
  leftX: LEFT_GLOVE_POSITION.INITIAL_X,
  leftY: LEFT_GLOVE_POSITION.INITIAL_Y,
  leftZ: LEFT_GLOVE_POSITION.INITIAL_Z,
  rightX: RIGHT_GLOVE_POSITION.INITIAL_X,
  rightY: RIGHT_GLOVE_POSITION.INITIAL_Y,
  rightZ: RIGHT_GLOVE_POSITION.INITIAL_Z,
  sandbagX: 0,
  sandbagY: SANDBAG_POSITION.INITIAL_Y,
  sandbagZ: 0,
  isMoving: false,
};

const defaultConfiguredRotation = {
  leftX: LEFT_GLOVE_ROTATION.INITIAL_X,
  leftY: LEFT_GLOVE_ROTATION.INITIAL_Y,
  leftZ: 0,
  rightX: RIGHT_GLOVE_ROTATION.INITIAL_X,
  rightY: RIGHT_GLOVE_ROTATION.INITIAL_X,
  rightZ: 0,
  sandbagX: 0,
  sandbagY: 0,
  sandbagZ: 0,
  isMoving: false,
};

const createCurrentGloveStateSlice = (set, get) => ({
  currentPosition: defaultConfiguredPosition,
  currentRotation: defaultConfiguredRotation,
  setCurrentPosition: (setValue) =>
    set((state) => ({
      currentPosition: { ...state.currentPosition, ...setValue },
    })),
  setCurrentRotation: (setValue) =>
    set((state) => ({
      currentRotation: { ...state.currentRotation, ...setValue },
    })),
  getCurrentPosition: () => get().currentPosition,
  getCurrentRotation: () => get().currentRotation,
  initializeCurrentState: () =>
    set(() => ({
      currentPosition: defaultConfiguredPosition,
      currentRotation: defaultConfiguredRotation,
    })),
});

const usePackageStore = create((set, get) => ({
  ...createSummonGloveStateSlice(set, get),
  ...createCurrentGloveStateSlice(set, get),
}));

export default usePackageStore;
