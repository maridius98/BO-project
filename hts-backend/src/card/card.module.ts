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
import { CardDataLayer } from './card.data-layer';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Card', schema: CardSchema, discriminators: [
        { name: 'MonsterCard', schema: MonsterCardSchema },
        { name: 'ModifierCard', schema: ModifierCardSchema },
        { name: 'MagicCard', schema: MagicCardSchema },
        { name: 'HeroCard', schema: HeroCardSchema },
        { name: 'ChallengeCard', schema: ChallengeCardSchema },
      ]},
    ]),
  ],
  controllers: [CardController],
  providers: [CardService, CardDataLayer],
  exports: [CardService, CardDataLayer]
})
export class CardModule {}
