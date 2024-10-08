import { Document } from 'mongoose';
import { Player } from './player/entities/player.entity';
import { Session } from './session/entities/session.entity';

export function rollNumber(diceSize: number = 6, diceCount: number = 2) {
  let sum = 0;
  for (let i = 0; i < diceCount; i++) {
    sum += Math.floor(Math.random() * diceSize + 1);
  }
  return sum;
}

export enum State {
  selectDiscard,
  selectDestroy,
  selectSacrifice,
  makeMove,
  resolveRoll,
  roll,
  skip,
  wait,
  canChallenge,
}

export function stringifySafe<T>(obj: T) {
  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return;
      }
      cache.add(value);
    }
    return value;
  });
}

export function validateModel<T>(input: Document | object, type: { new (): T }): T {
  const instance = new type();
  let objectInput = input;
  if (input instanceof Document) {
    objectInput = input.toObject();
  }
  Object.getOwnPropertyNames(objectInput).forEach((key) => {
    if (Object.getOwnPropertyNames(instance).includes(key)) {
      instance[key] = objectInput[key];
    }
  });
  return instance;
}

export function cleanOutput<T>(input: Document, type: { new (): T }): string {
  return stringifySafe(validateModel(input, type));
}

export function getMutablePlayer(player: Player, session: Session) {
  return session.players.find((p) => {
    return p._id.toString() === player._id.toString();
  });
}

export function getOpposingPlayer(player: Player, session: Session) {
  return session.players.find((p) => {
    return p._id.toString() != player._id.toString();
  });
}
