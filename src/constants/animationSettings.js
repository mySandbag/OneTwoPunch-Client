import { degToRad } from "../common/utils/mathUtils";
export const RIGHT_ANGLE = degToRad(90);

export const POV = {
  DELTA_Z_MOVING: 0.25,
  DELTA_Z_MAX_LIMIT: 8,
  DELTA_Z_MIN_LIMIT: -0.6,
  DELTA_DEGREE: 20,
};

export const SANDBAG_POSITION = {
  INITIAL_Y: 4.8,
};

export const SANDBAG_PENDULUM = {
  INITIAL_ANGLE_VELOCITY: 0.04,
  DELTA_VELOCITY: 0.02,
  INTERPOLATION_SPEED: 0.3,
  DAMPING: 0.94,
  GRAVITY: 9.8 / 1000,
  STOP_CONDITION: 0.001,
};

export const GLOVE_DIRECTION = {
  RIGHT_FORWARD: -1,
  RIGHT_BACKWARD: 1,
  LEFT_FORWARD: -1,
  LEFT_BACKWARD: 1,
};

export const GLOVE_SPEED = {
  PUNCH_INITIAL: 0.05,
  PUNCH_INCREMENT: 0.01,
  PUNCH_DECREMENT: 0.004,
  HOOK_INCREMENT: 0.008,
  HOOK_DECREMENT: 0.002,
  UPPERCUT_INCREMENT: 0.01,
  UPPERCUT_DECREMENT: 0.004,
};

export const MAX_GLOVE_REACH = {
  PUNCH_Z: 0.8,
  HOOK_Z: 0.3,
  UPPER_Z: 0.6,
  HOOK_LEFT_X: -1.3,
  HOOK_RIGHT_X: 1.3,
};

export const RIGHT_GLOVE_POSITION = {
  INITIAL_X: 0.6,
  INITIAL_Y: 2.1,
  INITIAL_Z: 2,
  PUNCH_DELTA_X: 0.03,
  HOOK_DELTA_X: 0.13,
  UPPERCUT_DELTA_X: 0.06,
  UPPERCUT_DELTA_Y: 0.09,
  HOOK_MIN_X: 0.2,
  UPPERCUT_MIN_Y: 1.5,
};

export const RIGHT_GLOVE_ROTATION = {
  INITIAL_X: degToRad(0),
  INITIAL_Y: degToRad(0),
  INITIAL_Z: degToRad(0),
  PUNCH_DELTA_X: degToRad(9),
  PUNCH_DELTA_Y: degToRad(10),
  HOOK_DELTA_X: degToRad(1),
  HOOK_DELTA_Y: degToRad(0),
  HOOK_DELTA_Z: degToRad(8),
  UPPERCUT_DELTA_X: degToRad(2),
  UPPERCUT_DELTA_Y: degToRad(13),
  UPPERCUT_DELTA_Z: degToRad(14),
};

export const LEFT_GLOVE_POSITION = {
  INITIAL_X: -0.6,
  INITIAL_Y: 2.1,
  INITIAL_Z: 2,
  PUNCH_DELTA_X: 0.03,
  HOOK_DELTA_X: 0.13,
  UPPERCUT_DELTA_X: 0.06,
  UPPERCUT_DELTA_Y: 0.09,
  HOOK_MIN_X: -0.2,
  UPPERCUT_MIN_Y: 1.5,
};

export const LEFT_GLOVE_ROTATION = {
  INITIAL_X: degToRad(0),
  INITIAL_Y: degToRad(0),
  INITIAL_Z: degToRad(0),
  PUNCH_DELTA_X: degToRad(10),
  PUNCH_DELTA_Y: degToRad(7),
  HOOK_DELTA_X: degToRad(2),
  HOOK_DELTA_Y: degToRad(0),
  HOOK_DELTA_Z: degToRad(7),
  UPPERCUT_DELTA_X: degToRad(2),
  UPPERCUT_DELTA_Y: degToRad(13),
  UPPERCUT_DELTA_Z: degToRad(14),
};
