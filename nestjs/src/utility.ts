export function rollNumber(diceSize: number = 6, diceCount: number = 2){
    let sum = 0;
    for (let i = 0; i < diceCount; i++){
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
    roll
}

export function stringifySafe(obj: object) {
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