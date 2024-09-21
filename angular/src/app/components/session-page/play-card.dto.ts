export class PlayCardDto {
  cardId?: string;
  playerId?: string;
  target?: { effectIndex: number; target: string };
  index?: number;
  cardList?: number[];
}
