import { create } from "zustand";

import {
  LEFT_GLOVE_POSITION,
  LEFT_GLOVE_ROTATION,
  RIGHT_GLOVE_POSITION,
  RIGHT_GLOVE_ROTATION,
  SANDBAG_POSITION,
} from "../constants/animationSettings";

const createMoveStateSlice = (set, get) => ({
  currentDegree: 0,
  getCurrentDegree: () => get().currentDegree,
  setCurrentDegree: (setValue) =>
    set(() => ({
      currentDegree: setValue,
    })),
  xzPosition: {
    degreeMinus2: { leftGlove: { x: 0, z: 0 }, rightGlove: { x: 0, z: 0 } },
    degreeMinus1: { leftGlove: { x: 0, z: 0 }, rightGlove: { x: 0, z: 0 } },
    degree0: { leftGlove: { x: 0, z: 0 }, rightGlove: { x: 0, z: 0 } },
    degreePlus1: { leftGlove: { x: 0, z: 0 }, rightGlove: { x: 0, z: 0 } },
    degreePlus2: { leftGlove: { x: 0, z: 0 }, rightGlove: { x: 0, z: 0 } },
  },
  getXZPosition: () => get().xzPosition,
  setXZPosition: (setValue) =>
    set((state) => ({
      xzPosition: { ...state.xzPosition, ...setValue },
    })),
  movePosition: { left: 0, right: 0, up: 0, down: 0 },
  getMovePosition: () => get().movePosition,
  setMovePosition: (setValue) =>
    set((state) => ({
      movePosition: { ...state.movePosition, ...setValue },
    })),
  resetMovePosition: () =>
    set(() => ({
      movePosition: { left: 0, right: 0, up: 0, down: 0 },
    })),
  moveDirection: "",
  getMoveDirection: () => get().moveDirection,
  setMoveDirection: (setValue) =>
    set(() => ({
      moveDirection: setValue,
    })),
  clearMoveDirection: () =>
    set(() => ({
      moveDirection: "",
    })),
});

const createHitStateSlice = (set, get) => ({
  hitInProgress: false,
  hitCount: 0,
  anotherHit: false,
  comboCount: -1,
  latestHitState: { hitRotation: [], latestPart: "", latestAnimation: "" },
  updateHitCount: () =>
    set((state) => ({
      hitCount: state.hitCount + 1,
    })),
  getHitCount: () => get().hitCount,
  resetHitCount: () =>
    set(() => ({
      hitCount: 0,
    })),

  getHitInProgress: () => get().hitInProgress,
  setHitInProgress: (setValue) =>
    set(() => ({
      hitInProgress: setValue,
    })),

  getAnotherHit: () => get().anotherHit,
  setAnotherHit: (setValue) =>
    set(() => ({
      anotherHit: setValue,
    })),

  updateComboCount: () =>
    set((state) => ({
      comboCount: state.comboCount + 1,
    })),
  getComboCount: () => get().comboCount,
  resetComboCount: () =>
    set(() => ({
      comboCount: -1,
    })),

  getLatestHitState: () => get().latestHitState,
  setLatestHitState: (setValue) =>
    set((state) => ({
      latestHitState: { ...state.latestHitState, ...setValue },
    })),
});

const createAnimationSlice = (set, get) => ({
  currentGloveAnimation: {
    left: "",
    right: "",
  },
  sandbagInMotion: false,
  getCurrentGloveAnimation: () => get().currentGloveAnimation,
  setCurrentGloveAnimation: (setValue) =>
    set((state) => ({
      currentGloveAnimation: { ...state.currentGloveAnimation, ...setValue },
    })),
  getSandbagInMotion: () => get().sandbagInMotion,
  setSandbagInMotion: (setValue) =>
    set(() => ({
      sandbagInMotion: setValue,
    })),
});

const createGloveOBBSlice = (set, get) => ({
  leftGloveOBB: {
    center: {},
    halfSize: {},
    rotation: [],
  },
  rightGloveOBB: {
    center: {},
    halfSize: {},
    rotation: [],
  },
  setLeftGloveOBB: (setValue) =>
    set((state) => ({
      leftGloveOBB: { ...state.leftGloveOBB, ...setValue },
    })),
  setRightGloveOBB: (setValue) =>
    set((state) => ({
      rightGloveOBB: { ...state.rightGloveOBB, ...setValue },
    })),
  getLeftGloveOBB: () => get().leftGloveOBB,
  getRightGloveOBB: () => get().rightGloveOBB,
});

const createSandbagOBBSlice = (set, get) => ({
  sandbagOBB: {
    center: {},
    halfSize: {},
    rotation: [],
  },
  setSandbagOBB: (setValue) =>
    set((state) => ({
      sandbagOBB: { ...state.sandbagOBB, ...setValue },
    })),
  getSandbagOBB: () => get().sandbagOBB,
});

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
  leftZ: LEFT_GLOVE_ROTATION.INITIAL_Z,
  rightX: RIGHT_GLOVE_ROTATION.INITIAL_X,
  rightY: RIGHT_GLOVE_ROTATION.INITIAL_X,
  rightZ: RIGHT_GLOVE_ROTATION.INITIAL_Z,
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
  initializeLeftGloveCurrentState: (leftRightFactor, forwardBackwardFactor) =>
    set((state) => ({
      currentPosition: {
        ...state.currentPosition,
        leftX: LEFT_GLOVE_POSITION.INITIAL_X + leftRightFactor,
        leftY: LEFT_GLOVE_POSITION.INITIAL_Y,
        leftZ: LEFT_GLOVE_POSITION.INITIAL_Z + forwardBackwardFactor,
      },
      currentRotation: {
        ...state.currentRotation,
        leftX: LEFT_GLOVE_ROTATION.INITIAL_X,
        leftY: LEFT_GLOVE_ROTATION.INITIAL_Y,
        leftZ: LEFT_GLOVE_ROTATION.INITIAL_Z,
      },
    })),
  initializeRightGloveCurrentState: (leftRightFactor, forwardBackwardFactor) =>
    set((state) => ({
      currentPosition: {
        ...state.currentPosition,
        rightX: RIGHT_GLOVE_POSITION.INITIAL_X + leftRightFactor,
        rightY: RIGHT_GLOVE_POSITION.INITIAL_Y,
        rightZ: RIGHT_GLOVE_POSITION.INITIAL_Z + forwardBackwardFactor,
      },
      currentRotation: {
        ...state.currentRotation,
        rightX: RIGHT_GLOVE_ROTATION.INITIAL_X,
        rightY: RIGHT_GLOVE_ROTATION.INITIAL_Y,
        rightZ: RIGHT_GLOVE_ROTATION.INITIAL_Z,
      },
    })),
});

const usePackageStore = create((set, get) => ({
  ...createMoveStateSlice(set, get),
  ...createHitStateSlice(set, get),
  ...createAnimationSlice(set, get),
  ...createGloveOBBSlice(set, get),
  ...createSandbagOBBSlice(set, get),
  ...createSummonGloveStateSlice(set, get),
  ...createCurrentGloveStateSlice(set, get),
}));

export default usePackageStore;
