import { Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Card } from './entities/card.entity';
import { MonsterCard } from './entities/monsterCard.entity';
import { ModifierCard } from './entities/modifierCard.entity';
import { MagicCard } from './entities/magicCard.entity';
import { HeroCard } from './entities/heroCard.entity';
import { ChallengeCard } from './entities/challengeCard.entity';
import { MonsterCardDto } from './dto/create-monster-card.dto';
import { ModifierCardDto } from './dto/create-modifier-card.dto';
import { ChallengeCardDto } from './dto/create-challenge-card.dto';
import { HeroCardDto } from './dto/create-hero-card.dto';
import { MagicCardDto } from './dto/create-magic-card.dto';
import { CardDataLayer } from './card.data-layer';

@Injectable()
export class CardService {
  constructor(
    @InjectModel('Card') private readonly cardModel: Model<Card>,
    @InjectModel('MonsterCard')
    private readonly monsterCardModel: Model<MonsterCard>,
    @InjectModel('ModifierCard')
    private readonly modifierCardModel: Model<ModifierCard>,
    @InjectModel('MagicCard')
    private readonly magicCardModel: Model<MagicCard>,
    @InjectModel('HeroCard')
    private readonly heroCardModel: Model<HeroCard>,
    @InjectModel('ChallengeCard')
    private readonly challengeCardModel: Model<ChallengeCard>,
    private readonly cardDataLayer: CardDataLayer,
  ) {}
  //refaktorisati u strategy
  async create(createCardDto: CreateCardDto): Promise<CreateCardDto> {
    if (this.isMonsterCardDto(createCardDto)) {
      return this.createMonsterCard(createCardDto);
    } else if (this.isModifierCardDto(createCardDto)) {
      return this.createModifierCard(createCardDto);
    } else if (this.isMagicCardDto(createCardDto)) {
      return this.createMagicCard(createCardDto);
    } else if (this.isHeroCardDto(createCardDto)) {
      return this.createHeroCard(createCardDto);
    } else if (this.isChallengeCardDto(createCardDto)) {
      return this.createChallengeCard(createCardDto);
    } else {
      throw new Error(`Unsupported card type: ${createCardDto}`);
    }
  }

  async getPlayableCards() {
    return await this.cardModel.find({ isPlayable: true }).lean().exec();
  }

  async getMonsterCards() {
    return await this.monsterCardModel.find().lean().exec();
  }

  async getShuffledCards() {
    return this.cardDataLayer.shuffle(await this.findAll());
  }

  private isMonsterCardDto(dto: CreateCardDto): dto is MonsterCardDto {
    return (dto as MonsterCardDto).defeatRoll !== undefined;
  }

  private isModifierCardDto(dto: CreateCardDto): dto is ModifierCardDto {
    return (dto as ModifierCardDto).negativeModifier !== undefined;
  }

  private isMagicCardDto(dto: CreateCardDto): dto is MagicCardDto {
    return (dto as MagicCardDto).effects !== undefined;
  }

  private isHeroCardDto(dto: CreateCardDto): dto is HeroCardDto {
    return (dto as HeroCardDto).victoryRoll !== undefined;
  }

  private isChallengeCardDto(dto: CreateCardDto): dto is ChallengeCardDto {
    return (dto as ChallengeCardDto).positiveModifier !== undefined;
  }

  private async createMonsterCard(
    createCardDto: MonsterCardDto,
  ): Promise<MonsterCardDto> {
    const createdMonsterCard = new this.monsterCardModel(createCardDto);
    return createdMonsterCard.save();
  }

  private async createModifierCard(
    createCardDto: ModifierCardDto,
  ): Promise<ModifierCardDto> {
    const createdModifierCard = new this.modifierCardModel(createCardDto);
    return createdModifierCard.save();
  }

  private async createMagicCard(
    createCardDto: MagicCardDto,
  ): Promise<MagicCardDto> {
    const createdMagicCard = new this.magicCardModel(createCardDto);
    return createdMagicCard.save();
  }

  private async createHeroCard(
    createCardDto: HeroCardDto,
  ): Promise<HeroCardDto> {
    const createdHeroCard = new this.heroCardModel(createCardDto);
    return createdHeroCard.save();
  }

  private async createChallengeCard(
    createCardDto: ChallengeCardDto,
  ): Promise<ChallengeCardDto> {
    const createdChallengeCard = new this.challengeCardModel(createCardDto);
    return createdChallengeCard.save();
  }

  async findAll() {
    return await this.cardModel.find().lean().exec();
  }

  async findOne(id: string) {
    const card = await this.cardModel.findById(id);
    return card;
  }

  update(id: string, updateCardDto: UpdateCardDto) {
    // Implement the logic to update a specific card by ID
  }

  remove(id: string) {
    // Implement the logic to remove a specific card by ID
  }
}
