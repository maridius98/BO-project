import { CreateCardDto } from "./create-card.dto";

export class MonsterCardDto extends CreateCardDto {
    readonly defeatRoll: number;
    readonly victoryRoll: number;
    readonly effects: string[];
    readonly isPlayable: boolean;
}