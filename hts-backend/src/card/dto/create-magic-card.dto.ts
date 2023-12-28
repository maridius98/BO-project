import { CreateCardDto } from "./create-card.dto";

export class MagicCardDto extends CreateCardDto {
    readonly effects: string[];
}