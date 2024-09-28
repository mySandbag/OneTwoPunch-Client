import {
  RIGHT_ANGLE,
  GLOVE_SPEED,
  RIGHT_GLOVE_POSITION,
  RIGHT_GLOVE_ROTATION,
  MAX_GLOVE_REACH,
  GLOVE_DIRECTION,
} from "../../constants/animationSettings";
import { degToRad } from "../utils/mathUtils";

export const computeForwardMovement = (punchType, position, rotation, FPSFactor, isHookTurnedRef, speedRef) => {
  const xPosition = position.rightX;
  const yPosition = position.rightY;
  const xRotation = rotation.rightX;
  const yRotation = rotation.rightY;
  const zRotation = rotation.rightZ;

  let newPosition;
  let newRotation;

  if (punchType === "punch") {
    speedRef.current += GLOVE_SPEED.PUNCH_INCREMENT;

    newPosition = {
      rightX: Math.max(xPosition - RIGHT_GLOVE_POSITION.PUNCH_DELTA_X * FPSFactor, 0),
      rightZ: speedRef.current + GLOVE_SPEED.PUNCH_INCREMENT * FPSFactor,
    };
    newRotation = {
      rightX: Math.min(xRotation + RIGHT_GLOVE_ROTATION.PUNCH_DELTA_X * FPSFactor, RIGHT_ANGLE),
      rightY: Math.min(yRotation + RIGHT_GLOVE_ROTATION.PUNCH_DELTA_Y * FPSFactor, RIGHT_ANGLE),
    };
  }
  if (punchType === "hook") {
    const turnFactor = isHookTurnedRef.current ? -1 : 1;
    speedRef.current += GLOVE_SPEED.HOOK_INCREMENT;
    newPosition = {
      rightX: Math.max(
        RIGHT_GLOVE_POSITION.HOOK_MIN_X,
        xPosition + RIGHT_GLOVE_POSITION.HOOK_DELTA_X * FPSFactor * turnFactor,
      ),
      rightZ: speedRef.current + GLOVE_SPEED.HOOK_INCREMENT * FPSFactor,
    };
    newRotation = {
      rightX: Math.min(xRotation - RIGHT_GLOVE_ROTATION.HOOK_DELTA_X * FPSFactor, RIGHT_ANGLE),
      rightY: Math.min(yRotation - RIGHT_GLOVE_ROTATION.HOOK_DELTA_Y * FPSFactor, RIGHT_ANGLE),
      rightZ: Math.min(zRotation + RIGHT_GLOVE_ROTATION.HOOK_DELTA_Z * FPSFactor, RIGHT_ANGLE),
    };
  }
  if (punchType === "uppercut") {
    speedRef.current += GLOVE_SPEED.UPPERCUT_INCREMENT;

    newPosition = {
      rightX: Math.min(xPosition + RIGHT_GLOVE_POSITION.UPPERCUT_DELTA_X * FPSFactor, 0),
      rightY: Math.max(
        yPosition - RIGHT_GLOVE_POSITION.UPPERCUT_DELTA_Y * FPSFactor,
        RIGHT_GLOVE_POSITION.UPPERCUT_MIN_Y,
      ),
      rightZ: speedRef.current + GLOVE_SPEED.UPPERCUT_INCREMENT * FPSFactor,
    };
    newRotation = {
      rightX: Math.min(xRotation + RIGHT_GLOVE_ROTATION.UPPERCUT_DELTA_X * FPSFactor, RIGHT_ANGLE),
      rightY: Math.min(yRotation + RIGHT_GLOVE_ROTATION.UPPERCUT_DELTA_Y * FPSFactor, RIGHT_ANGLE),
      rightZ: Math.min(zRotation + RIGHT_GLOVE_ROTATION.UPPERCUT_DELTA_Z * FPSFactor, RIGHT_ANGLE - degToRad(40)),
    };
  }
  return { newPosition, newRotation };
};

export const computeBackwardMovement = (punchType, position, rotation, FPSFactor, isHookTurnedRef, speedRef) => {
  const xPosition = position.rightX;
  const yPosition = position.rightY;
  const zPosition = position.rightZ;
  const xRotation = rotation.rightX;
  const yRotation = rotation.rightY;
  const zRotation = rotation.rightZ;

  let newPosition;
  let newRotation;

  if (punchType === "punch") {
    speedRef.current = Math.max(speedRef.current - GLOVE_SPEED.PUNCH_DECREMENT * FPSFactor, GLOVE_SPEED.PUNCH_INITIAL);
    newPosition = {
      rightX: Math.min(xPosition + RIGHT_GLOVE_POSITION.PUNCH_DELTA_X * FPSFactor, RIGHT_GLOVE_POSITION.INITIAL_X),
      rightZ: Math.max(speedRef.current - GLOVE_SPEED.PUNCH_DECREMENT * FPSFactor, GLOVE_SPEED.PUNCH_INITIAL),
    };
    newRotation = {
      rightX: Math.min(xRotation + RIGHT_GLOVE_ROTATION.PUNCH_DELTA_X * FPSFactor, RIGHT_GLOVE_ROTATION.INITIAL_X),
      rightY: Math.min(yRotation + RIGHT_GLOVE_ROTATION.PUNCH_DELTA_Y * FPSFactor, RIGHT_GLOVE_ROTATION.INITIAL_Y),
    };
  }
  if (punchType === "hook") {
    speedRef.current = Math.max(speedRef.current - GLOVE_SPEED.HOOK_INCREMENT * FPSFactor, GLOVE_SPEED.PUNCH_INITIAL);

    newPosition = {
      rightX: Math.min(xPosition + RIGHT_GLOVE_POSITION.HOOK_DELTA_X * FPSFactor, RIGHT_GLOVE_POSITION.INITIAL_X),
      rightZ: Math.max(zPosition - GLOVE_SPEED.HOOK_INCREMENT * FPSFactor, RIGHT_GLOVE_POSITION.INITIAL_Z),
    };

    newRotation = {
      rightX: Math.max(xRotation - RIGHT_GLOVE_ROTATION.HOOK_DELTA_X * FPSFactor, RIGHT_GLOVE_ROTATION.INITIAL_X),
      rightY: Math.max(yRotation - RIGHT_GLOVE_ROTATION.HOOK_DELTA_Y * FPSFactor, RIGHT_GLOVE_ROTATION.INITIAL_Y),
      rightZ: Math.max(zRotation - RIGHT_GLOVE_ROTATION.HOOK_DELTA_Z * FPSFactor, RIGHT_GLOVE_ROTATION.INITIAL_Z),
    };
  }
  if (punchType === "uppercut") {
  }
  return { newPosition, newRotation };
};

export const computeTurningPoint = (punchType, gloveRightRef, isHookTurnedRef, directionRef) => {
  const gloveXPositionRef = gloveRightRef.current.position.x;
  const gloveZPositionRef = gloveRightRef.current.position.z;

  if (punchType === "hook" && gloveXPositionRef > MAX_GLOVE_REACH.HOOK_RIGHT_X) {
    isHookTurnedRef.current = true;
  }

  if (punchType === "punch" && gloveZPositionRef <= MAX_GLOVE_REACH.PUNCH_Z) {
    directionRef.current = GLOVE_DIRECTION.RIGHT_BACKWARD;
  }

  if (punchType === "hook" && gloveZPositionRef <= MAX_GLOVE_REACH.HOOK_Z) {
    directionRef.current = GLOVE_DIRECTION.RIGHT_BACKWARD;
  }

  if (punchType === "uppercut" && gloveZPositionRef <= MAX_GLOVE_REACH.HOOK_Z) {
    directionRef.current = GLOVE_DIRECTION.RIGHT_BACKWARD;
  }
};
