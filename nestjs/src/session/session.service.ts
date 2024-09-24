import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session } from './entities/session.entity';
import { Model } from 'mongoose';
import { CardService } from 'src/card/card.service';
import { SessionDataLayer } from './session.data-layer';
import { CardDataLayer, CardExecData, CommandFactory } from 'src/card/card.data-layer';
import { PlayerService } from 'src/player/player.service';
import { ModuleRef } from '@nestjs/core';
import { Player } from 'src/player/entities/player.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel('Session') private readonly model: Model<Session>,
    private readonly cardService: CardService,
    private readonly playerService: PlayerService,
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

  async evaluateTurnSwap(player: Player, session: Session) {
    this.cardDataLayer.evaluateTurnSwap(player, session);
    await this.update(session);
  }

  async attackMonster(cardData: CardExecData) {
    const session = this.cardDataLayer.attackMonster(cardData);
    await this.update(session);
    return session;
  }

  async findAll() {
    return await this.model.find().lean().exec();
  }

  async findByCode(code: string) {
    return await this.model.findOne({ code: code }).populate('players').exec();
  }

  async findOne(id: string) {
    return await this.model.findById(id).populate('players').exec();
  }

  async createSessionData(id: string) {
    const session = await this.findOne(id);
    const cards = await this.cardService.getPlayableCards();
    const monsters = await this.cardService.getMonsterCards();
    const generatedSession = this.sessionDataLayer.generateSession(monsters, cards, session);
    await this.update(generatedSession);
    return generatedSession;
  }

  async drawCard(player: Player) {
    const updatedSession = this.cardDataLayer.drawCard(
      player,
      await this.model.findById(player.session._id),
    );
    await this.update(updatedSession);
    return updatedSession;
  }

  async playCard(cardExecData: CardExecData) {
    const session = this.cardDataLayer.playCard(cardExecData);
    await this.update(session);
    return session;
  }

  async playEffect(cardExecData: CardExecData) {
    this.cardDataLayer.playEffect(cardExecData);
    await this.update(cardExecData.session);
    // return session;
  }

  async startEffect(cardExecData: CardExecData) {
    this.cardDataLayer.setNextState(cardExecData);
    await this.update(cardExecData.session);
  }

  async update(session: Session) {
    await Promise.all(session.players.map((player) => this.playerService.update(player)));
    const { _id, ...data } = session;
    const savedSession = await this.model.updateOne({ _id }, { $set: data });
    return savedSession;
  }

  async delete(session: Session) {
    await this.playerService.remove(session);
    await this.model.deleteOne({ code: session.code });
  }

  private randomCode() {
    return Math.random().toString(32).substring(7);
  }

  async checkStateChanged(session: Session) {
    const newSession = await this.findByCode(session.code);
    for (let i = 0; i < 2; i++) {
      if (newSession.players[i].state != session.players[i].state) {
        return true;
      }
    }
    return false;
  }
}
