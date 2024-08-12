import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session } from './entities/session.entity';
import { Model } from 'mongoose';
import { CardService } from 'src/card/card.service';
import { SessionDataLayer } from './session.data-layer';
import { CardDataLayer, CardExecData } from 'src/card/card.data-layer';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel('Session') private readonly model: Model<Session>,
    private readonly cardService: CardService,
    private readonly sessionDataLayer: SessionDataLayer,
    private readonly cardDataLayer: CardDataLayer,
  ) {}

  async create() {
    let code = this.randomCode();
    while (await this.findByCode(code)) {
      code = this.randomCode();
    }
    const newSession = new this.model({ code });
    return await newSession.save();
  }

  async findAll() {
    return await this.model.find().lean().exec();
  }

  async findByCode(code: string) {
    return await this.model.findOne({ code: code }).exec();
  }

  async findOne(id: string) {
    return await this.model.findById(id).populate('players').exec();
  }

  async createSessionData(id: string) {
    const session = await this.findOne(id);
    const cards = await this.cardService.getPlayableCards();
    const monsters = await this.cardService.getMonsterCards();
    const generatedSession = this.sessionDataLayer.generateSession(monsters, cards, session);
    await generatedSession.save();
    return generatedSession;
  }

  async playCard(cardExecData: CardExecData) {
    const session = this.cardDataLayer.playCard(cardExecData);
    return await this.update(session);
  }

  async playEffect(cardExecData: CardExecData) {
    const session = this.cardDataLayer.playEffect(cardExecData);
    return await this.update(session);
  }

  async startEffect(cardExecData: CardExecData) {
    const session = this.cardDataLayer.startEffect(cardExecData);
    return await this.update(session);
  }

  async update(session: Session) {
    return await session.save();
  }

  remove(id: number) {
    return `This action removes a #${id} session`;
  }

  private randomCode() {
    return Math.random().toString(32).substring(7);
  }
}
