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