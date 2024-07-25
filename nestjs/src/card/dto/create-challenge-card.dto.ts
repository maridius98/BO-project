import { CreateCardDto } from './create-card.dto';

export class ChallengeCardDto extends CreateCardDto {
  readonly positiveModifier: number;
  readonly class: string;
}
