import { CreateCardDto } from './create-card.dto';

export class ChallengeCardDto extends CreateCardDto {
  readonly modifier: number;
  readonly class: string;
}
