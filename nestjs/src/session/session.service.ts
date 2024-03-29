import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Session } from './entities/session.entity';
import { Model } from 'mongoose';
import { CardService } from 'src/card/card.service';
import { SessionDataLayer } from './session.data-layer';
import { Player } from 'src/player/entities/player.entity';
import { Card } from 'src/card/entities/card.entity';
import { CardExecData } from 'src/card/card.data-layer';
import { PersonalSession } from './entities/personalSession';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel('Session') private readonly model: Model<Session>,
    private readonly cardService: CardService,
    private readonly sessionDataLayer: SessionDataLayer,
  ){}

  async create() {
    let code = this.randomCode()
    while (await this.findByCode(code)){
      code = this.randomCode()
    }
    const newSession = new this.model({code});
    return await newSession.save();
  }

  async findAll() {
    return await this.model.find().lean().exec();
  }

  async findByCode(code: string){
    return await this.model.findOne({code: code}).lean().exec()
  }

  async findOne(id: string) {
    return await this.model.findById(id).lean().exec();
  }

  async fetchSessionData(id: string){
    const session = await this.findOne(id);
    const cards = await this.cardService.getPlayableCards();
    const monsters = await this.cardService.getMonsterCards();
    const generatedSession = this.sessionDataLayer.generateSession(monsters, cards, session);
    const splitSessions = this.sessionDataLayer.getSplitSessions(generatedSession)
    await generatedSession.save();
    return splitSessions;
  }

  async update(cardExecData: CardExecData) {
    const updatedSession = this.sessionDataLayer.playCard(cardExecData);
    return await updatedSession.save();
  }

  remove(id: number) {
    return `This action removes a #${id} session`;
  }

  private randomCode(){
    return Math.random().toString(32).substring(7);
  }
}
