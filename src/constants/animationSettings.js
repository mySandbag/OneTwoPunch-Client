import { degToRad } from "../common/mathUtils";
export const RIGHT_ANGLE = degToRad(90);

export const SANDBAG_POSITION = {
  INITIAL_Y: 4.8,
};

export const SANDBAG_PENDULUM = {
  INITIAL_ANGLE_VELOCITY: 0.04,
  DELTA_VELOCITY: 0.03,
  INTERPOLATION_SPEED: 0.2,
  DAMPING: 0.92,
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
};

export const MAX_GLOVE_REACH = {
  PUNCH_Z: 0.8,
  HOOK_Z: 0.3,
  HOOK_LEFT_X: -1.3,
  HOOK_RIGHT_X: 1.3,
};

export const RIGHT_GLOVE_POSITION = {
  INITIAL_X: 0.6,
  INITIAL_Y: 1.8,
  INITIAL_Z: 1.8,
  PUNCH_DELTA_X: 0.03,
  HOOK_DELTA_X: 0.15,
  HOOK_MIN_X: 0.4,
};

export const RIGHT_GLOVE_ROTATION = {
  INITIAL_X: degToRad(18),
  INITIAL_Y: degToRad(15),
  INITIAL_Z: degToRad(-10),
  PUNCH_DELTA_X: degToRad(9),
  PUNCH_DELTA_Y: degToRad(10),
  HOOK_DELTA_X: degToRad(2),
  HOOK_DELTA_Y: degToRad(0),
  HOOK_DELTA_Z: degToRad(8),
};

export const LEFT_GLOVE_POSITION = {
  INITIAL_X: -0.6,
  INITIAL_Y: 1.8,
  INITIAL_Z: 1.8,
  PUNCH_DELTA_X: 0.03,
  HOOK_DELTA_X: 0.15,
  HOOK_MIN_X: -0.4,
};

export const LEFT_GLOVE_ROTATION = {
  INITIAL_X: degToRad(-10),
  INITIAL_Y: degToRad(9),
  INITIAL_Z: degToRad(-1),
  PUNCH_DELTA_X: degToRad(10),
  PUNCH_DELTA_Y: degToRad(7),
  HOOK_DELTA_X: degToRad(4),
  HOOK_DELTA_Y: degToRad(0),
  HOOK_DELTA_Z: degToRad(7),
};
