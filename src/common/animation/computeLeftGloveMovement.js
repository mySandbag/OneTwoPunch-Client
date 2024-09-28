import {
  RIGHT_ANGLE,
  GLOVE_SPEED,
  LEFT_GLOVE_POSITION,
  LEFT_GLOVE_ROTATION,
  MAX_GLOVE_REACH,
  GLOVE_DIRECTION,
} from "../../constants/animationSettings";
import { degToRad } from "../utils/mathUtils";

export const computeForwardMovement = (punchType, position, rotation, FPSFactor, isHookTurnedRef, speedRef) => {
  const xPosition = position.leftX;
  const yPosition = position.leftY;
  const xRotation = rotation.leftX;
  const yRotation = rotation.leftY;
  const zRotation = rotation.leftZ;

  let newPosition;
  let newRotation;

  if (punchType === "punch") {
    speedRef.current += GLOVE_SPEED.PUNCH_INCREMENT;

    newPosition = {
      leftX: Math.min(xPosition + LEFT_GLOVE_POSITION.PUNCH_DELTA_X * FPSFactor, 0),
      leftZ: speedRef.current + GLOVE_SPEED.PUNCH_INCREMENT * FPSFactor,
    };
    newRotation = {
      leftX: Math.min(xRotation + LEFT_GLOVE_ROTATION.PUNCH_DELTA_X * FPSFactor, RIGHT_ANGLE),
      leftY: Math.min(yRotation + LEFT_GLOVE_ROTATION.PUNCH_DELTA_Y * FPSFactor, RIGHT_ANGLE),
    };
  }
  if (punchType === "hook") {
    const turnFactor = isHookTurnedRef.current ? -1 : 1;
    speedRef.current += GLOVE_SPEED.HOOK_INCREMENT;
    newPosition = {
      leftX: Math.min(
        LEFT_GLOVE_POSITION.HOOK_MIN_X,
        xPosition - LEFT_GLOVE_POSITION.HOOK_DELTA_X * FPSFactor * turnFactor,
      ),
      leftZ: speedRef.current + GLOVE_SPEED.HOOK_INCREMENT * FPSFactor,
    };
    newRotation = {
      leftX: Math.min(xRotation + LEFT_GLOVE_ROTATION.HOOK_DELTA_X * FPSFactor, RIGHT_ANGLE),
      leftY: Math.min(yRotation + LEFT_GLOVE_ROTATION.HOOK_DELTA_Y * FPSFactor, RIGHT_ANGLE),
      leftZ: Math.min(zRotation + LEFT_GLOVE_ROTATION.HOOK_DELTA_Z * FPSFactor, RIGHT_ANGLE),
    };
  }
  if (punchType === "uppercut") {
    speedRef.current += GLOVE_SPEED.UPPERCUT_INCREMENT;

    newPosition = {
      leftX: Math.min(xPosition + LEFT_GLOVE_POSITION.UPPERCUT_DELTA_X * FPSFactor, 0),
      leftY: Math.max(yPosition - LEFT_GLOVE_POSITION.UPPERCUT_DELTA_Y * FPSFactor, LEFT_GLOVE_POSITION.UPPERCUT_MIN_Y),
      leftZ: speedRef.current + GLOVE_SPEED.UPPERCUT_INCREMENT * FPSFactor,
    };
    newRotation = {
      leftX: Math.min(xRotation + LEFT_GLOVE_ROTATION.UPPERCUT_DELTA_X * FPSFactor, RIGHT_ANGLE),
      leftY: Math.min(yRotation + LEFT_GLOVE_ROTATION.UPPERCUT_DELTA_Y * FPSFactor, RIGHT_ANGLE),
      leftZ: Math.min(zRotation + LEFT_GLOVE_ROTATION.UPPERCUT_DELTA_Z * FPSFactor, RIGHT_ANGLE - degToRad(40)),
    };
  }
  return { newPosition, newRotation };
};

export const computeBackwardMovement = (punchType, position, rotation, FPSFactor, isHookTurnedRef, speedRef) => {
  const xPosition = position.leftX;
  const yPosition = position.leftY;
  const zPosition = position.leftZ;
  const xRotation = rotation.leftX;
  const yRotation = rotation.leftY;
  const zRotation = rotation.leftZ;

  let newPosition;
  let newRotation;

  if (punchType === "punch") {
    speedRef.current = Math.max(speedRef.current - GLOVE_SPEED.PUNCH_DECREMENT * FPSFactor, GLOVE_SPEED.PUNCH_INITIAL);
    newPosition = {
      leftX: Math.max(xPosition - LEFT_GLOVE_POSITION.PUNCH_DELTA_X * FPSFactor, LEFT_GLOVE_POSITION.INITIAL_X),
      leftZ: Math.max(speedRef.current - GLOVE_SPEED.PUNCH_DECREMENT * FPSFactor, GLOVE_SPEED.PUNCH_INITIAL),
    };
    newRotation = {
      leftX: Math.max(xRotation - LEFT_GLOVE_ROTATION.PUNCH_DELTA_X * FPSFactor, LEFT_GLOVE_ROTATION.INITIAL_X),
      leftY: Math.min(
        Math.abs(yRotation) + LEFT_GLOVE_ROTATION.PUNCH_DELTA_Y * FPSFactor,
        LEFT_GLOVE_ROTATION.INITIAL_Y,
      ),
    };
  }
  if (punchType === "hook") {
    speedRef.current = Math.max(speedRef.current - GLOVE_SPEED.HOOK_INCREMENT * FPSFactor, GLOVE_SPEED.PUNCH_INITIAL);

    newPosition = {
      leftX: Math.min(xPosition + LEFT_GLOVE_POSITION.HOOK_DELTA_X * FPSFactor, LEFT_GLOVE_POSITION.INITIAL_X),
      leftZ: Math.max(zPosition - GLOVE_SPEED.HOOK_INCREMENT * FPSFactor, LEFT_GLOVE_POSITION.INITIAL_Z),
    };

    newRotation = {
      leftX: Math.max(xRotation - LEFT_GLOVE_ROTATION.HOOK_DELTA_X * FPSFactor, LEFT_GLOVE_ROTATION.INITIAL_X),
      leftY: Math.max(yRotation - LEFT_GLOVE_ROTATION.HOOK_DELTA_Y * FPSFactor, LEFT_GLOVE_ROTATION.INITIAL_Y),
      leftZ: Math.max(zRotation - LEFT_GLOVE_ROTATION.HOOK_DELTA_Z * FPSFactor, LEFT_GLOVE_ROTATION.INITIAL_Z),
    };
  }
  if (punchType === "uppercut") {
  }
  return { newPosition, newRotation };
};

export const computeTurningPoint = (punchType, gloveLeftRef, isHookTurnedRef, directionRef) => {
  const gloveXPositionRef = gloveLeftRef.current.position.x;
  const gloveZPositionRef = gloveLeftRef.current.position.z;

  if (punchType === "hook" && gloveXPositionRef < MAX_GLOVE_REACH.HOOK_LEFT_X) {
    isHookTurnedRef.current = true;
  }

  if (punchType === "punch" && gloveZPositionRef <= MAX_GLOVE_REACH.PUNCH_Z) {
    directionRef.current = GLOVE_DIRECTION.LEFT_BACKWARD;
  }

  if (punchType === "hook" && gloveZPositionRef <= MAX_GLOVE_REACH.HOOK_Z) {
    directionRef.current = GLOVE_DIRECTION.LEFT_BACKWARD;
  }

  if (punchType === "uppercut" && gloveZPositionRef <= MAX_GLOVE_REACH.HOOK_Z) {
    directionRef.current = GLOVE_DIRECTION.LEFT_BACKWARD;
  }
};
