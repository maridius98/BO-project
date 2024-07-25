import { CreateCardDto } from './create-card.dto';

export class ModifierCardDto extends CreateCardDto {
  readonly positiveModifier: number;
  readonly negativeModifier: number;
}
