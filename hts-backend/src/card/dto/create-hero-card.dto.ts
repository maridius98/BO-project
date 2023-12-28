import { CreateCardDto } from "./create-card.dto";

export class HeroCardDto extends CreateCardDto {
    readonly defeatRoll: number;
    readonly victoryRoll: number;
    readonly class: string;
    readonly effects: string[];
}