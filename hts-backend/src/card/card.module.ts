import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CardSchema } from './entities/card.entity';
import { MonsterCardSchema } from './entities/monsterCard.entity';
import { ModifierCardSchema } from './entities/modifierCard.entity';
import { MagicCardSchema } from './entities/magicCard.entity';
import { HeroCardSchema } from './entities/heroCard.entity';
import { ChallengeCardSchema } from './entities/challengeCard.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Card', schema: CardSchema },
      { name: 'MonsterCard', schema: MonsterCardSchema, discriminators: [{ name: 'Card', schema: CardSchema }] },
      { name: 'ModifierCard', schema: ModifierCardSchema, discriminators: [{ name: 'Card', schema: CardSchema }] },
      { name: 'MagicCard', schema: MagicCardSchema, discriminators: [{ name: 'Card', schema: CardSchema }] },
      { name: 'HeroCard', schema: HeroCardSchema, discriminators: [{ name: 'Card', schema: CardSchema }] },
      { name: 'ChallengeCard', schema: ChallengeCardSchema, discriminators: [{ name: 'Card', schema: CardSchema }] },
    ]),
  ],
  controllers: [CardController],
  providers: [CardService],
})
export class CardModule {}
