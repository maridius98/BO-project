import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { SessionService } from './session.service';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Server } from 'socket.io';
import { CreatePlayerDto } from 'src/player/dto/create-player.dto';
import { PlayerService } from 'src/player/player.service';
import { IPlayerCard, PlayCardDto } from './dto/play-card.dto';
import { CardService } from 'src/card/card.service';
import { Inject, OnModuleInit, forwardRef } from '@nestjs/common';
import { State, cleanOutput, getMutablePlayer, getOpposingPlayer, rollNumber } from 'src/utility';
import { SessionDataLayer } from './session.data-layer';
import { Session } from './entities/session.entity';
import { HeroCard } from 'src/card/entities/heroCard.entity';
import { stringifySafe, validateModel } from 'src/utility';
import { CardDataLayer, CardExecData } from 'src/card/card.data-layer';
import { IPlayer, Lobby } from 'src/fe.intefaces';
import { Card } from 'src/card/entities/card.entity';
import { MagicCard } from 'src/card/entities/magicCard.entity';
import { Player } from 'src/player/entities/player.entity';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:4200'],
  },
})
export class SessionGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id);
      console.log('Connected');
    });
  }

  constructor(
    private readonly sessionService: SessionService,
    @Inject(forwardRef(() => PlayerService))
    private readonly playerService: PlayerService,
    private readonly cardService: CardService,
    private readonly sessionDataLayer: SessionDataLayer,
    private readonly cardDataLayer: CardDataLayer,
  ) {}

  @SubscribeMessage('createLobby')
  async create(@MessageBody() createPlayerDto: CreatePlayerDto) {
    createPlayerDto.isHost = true;
    const player = await this.playerService.create(createPlayerDto);
    return [cleanOutput(player, IPlayer), player.session.code];
  }

  @SubscribeMessage('monsterAttack')
  async attackMonster(@MessageBody() monsterInfo: IPlayerCard) {
    const [card, player, session] = await this.fetchData(monsterInfo);
    const updatedSesssion = await this.sessionService.attackMonster({
      card,
      player,
      session,
    });
    this.finishGame(session);
    this.emitToAllClients(updatedSesssion);
  }

  @SubscribeMessage('joinLobby')
  async joinLobby(@MessageBody() CreatePlayerDto: CreatePlayerDto) {
    const player = await this.playerService.create(CreatePlayerDto);
    const session = await this.sessionService.findOne(player.session._id);
    const opponent = session.players[0];
    const opponentID = opponent._id.toString();
    this.server.emit(`lobby:${opponentID}`, cleanOutput(player, IPlayer));
    return [cleanOutput(player, IPlayer), cleanOutput(opponent, IPlayer), player.session.code];
  }

  @SubscribeMessage('startGame')
  async startSession(@MessageBody() code: string) {
    const session = await this.sessionService.findByCode(code);
    const generatedSession = await this.sessionService.createSessionData(session._id);
    this.emitToAllClients(generatedSession);
  }

  @SubscribeMessage('roll')
  async roll(@MessageBody() [playerId, rollBoth = false]: [string, boolean]) {
    const player = await this.playerService.findOne(playerId);
    const session = await this.sessionService.findOne(player.session._id);
    const mutablePlayer = getMutablePlayer(player, session);
    const opponent = getOpposingPlayer(player, session);

    if (rollBoth) {
      opponent.roll = rollNumber();
    }

    mutablePlayer.roll = rollNumber();
    await this.sessionService.update(session);
    this.emitToAllClients(session);
  }

  @SubscribeMessage('evaluteTurnSwap')
  async evaluateTurnSwap(@MessageBody() playerId: string) {
    console.log('evaluating turn swap');
    const player = await this.playerService.findOne(playerId);
    const session = await this.sessionService.findOne(player.session._id);
    await this.sessionService.evaluateTurnSwap(player, session);
    this.emitToAllClients(session);
  }

  @SubscribeMessage('resolveRoll')
  async resolveRoll(@MessageBody() playCardDto: PlayCardDto) {
    const [card, player, session] = await this.fetchData(playCardDto, true);
    if (
      card.cardType == 'HeroCard' &&
      !this.sessionDataLayer.resolveRoll(player, card as HeroCard)
    ) {
      await this.sessionService.evaluateTurnSwap(player, session);
      getMutablePlayer(player, session).roll = 0;
      this.emitToAllClients(session);
      return false;
    }
    getMutablePlayer(player, session).roll = 0;
    return await this.startEffect({ player, card, session });
  }

  @SubscribeMessage('drawCard')
  async drawCard(@MessageBody() playerId: string) {
    const player = await this.playerService.findOne(playerId);
    const session = await this.sessionService.drawCard(player);
    this.emitToAllClients(session);
  }

  @SubscribeMessage('playCard')
  async playCard(@MessageBody() playCardDto: PlayCardDto) {
    const [card, player, session] = await this.fetchData(playCardDto);
    const oldStates = session.players.map((p) => p.state);
    const updatedSession = await this.sessionService.playCard({
      card,
      player,
      session,
      index: playCardDto.index,
    });
    if (card.cardType != 'HeroCard') {
      this.emitPlayedCard(session.code, card);
    }
    this.emitChallengeCard(card, session);
    this.emitToAllClients(updatedSession);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const isStateChanged = await this.sessionService.checkStateChanged(session);
    if (isStateChanged) {
      console.log('state got changed...');
      return false;
    }
    oldStates.forEach((state, index) => {
      updatedSession.players[index].state = state;
    });
    console.log("State didn't get changed...");
    await this.sessionService.update(updatedSession);
    this.finishGame(updatedSession);
    this.emitToAllClients(updatedSession);
    return true;
  }

  @SubscribeMessage('challenge')
  async challenge(@MessageBody() playCardDto: PlayCardDto) {
    const [card, player, session] = await this.fetchData(playCardDto);
    if (player.state != State.canChallenge || card.cardType != 'ChallengeCard') {
      return;
    }

    const updatedSession = await this.sessionService.playCard({
      card,
      player,
      session,
      index: playCardDto.index,
    });
    this.emitPlayedCard(session.code, card);
    this.emitToAllClients(updatedSession);
  }

  @SubscribeMessage('resolveChallenge')
  async resolveChallenge(@MessageBody() playCardDto: PlayCardDto) {
    const [card, player, session] = await this.fetchData(playCardDto);
    const challengingPlayer = getMutablePlayer(player, session);
    const challengedPlayer = getOpposingPlayer(player, session);
    console.log(
      `CHALLENGING PLAYER: ${challengingPlayer.roll} ... CHALLENGED PLAYER: ${challengedPlayer.roll}`,
    );
    if (challengingPlayer.roll >= challengedPlayer.roll) {
      if (card.cardType === 'HeroCard') {
        const challengedCard = challengedPlayer.field.find((c) => {
          return c.name == card.name;
        });
        session.discardPile.push(challengedCard);
        challengedPlayer.field.splice(challengedPlayer.field.indexOf(challengedCard), 1);
      }
      this.emitChallengeCard(card, session, true);
    }
    challengedPlayer.roll = 0;
    challengingPlayer.roll = 0;
    this.cardDataLayer.evaluateTurnSwap(challengedPlayer, session);
    await this.sessionService.update(session);
    this.emitToAllClients(session);
  }

  @SubscribeMessage('useEffect')
  async handleEffect(@MessageBody() playCardDto: PlayCardDto) {
    const [card, player, session] = await this.fetchData(playCardDto);
    await this.sessionService.playEffect({
      card,
      player,
      session,
      index: playCardDto.target.effectIndex,
      cardList: playCardDto.cardList,
    });
    this.emitToAllClients(session);
    return this.cardDataLayer.getNextIndex(card, playCardDto.target.effectIndex);
  }

  emitToAllClients(session: Session) {
    const splitSessions = this.sessionDataLayer.getSplitSessions(session);
    for (const [id, session] of splitSessions) {
      this.server.emit(`session:${id}`, stringifySafe(session));
    }
  }

  emitChallengeCard(card: Card, session: Session, clear = false) {
    if (card.cardType === 'HeroCard' || card.cardType === 'MagicCard') {
      if (!clear) {
        this.server.emit(`challengeCardId:${session.code}`, card._id);
      } else {
        this.server.emit(`challengeCardId:${session.code}`, '');
      }
    }
  }

  async startEffect(CardExecData: CardExecData) {
    await this.sessionService.startEffect({
      card: CardExecData.card,
      player: CardExecData.player,
      session: CardExecData.session,
      index: 0,
    });
    let wasDraw = false;
    const playerFromSession = getMutablePlayer(CardExecData.player, CardExecData.session);
    if (playerFromSession.state === State.skip) {
      wasDraw = true;
      await this.sessionService.playEffect({
        card: CardExecData.card,
        player: CardExecData.player,
        session: CardExecData.session,
        index: 0,
      });
    }
    this.emitToAllClients(CardExecData.session);
    return wasDraw;
  }

  emitPlayedCard(sessionCode: string, card: Card) {
    this.server.emit(`playedCard:${sessionCode}`, stringifySafe(card));
  }

  async finishGame(session: Session) {
    const playerName = this.sessionDataLayer.checkWinner(session);
    if (playerName) {
      this.server.emit(`gameFinished:${session.code}`, playerName);
      await this.sessionService.delete(session);
    }
  }

  async fetchData(
    playCardDto: IPlayerCard,
    asHero: boolean = false,
  ): Promise<[Card | HeroCard, Player, Session]> {
    let card: Card;
    if (asHero) {
      card = (await this.cardService.findOne(playCardDto.cardId)) as HeroCard;
    } else {
      card = await this.cardService.findOne(playCardDto.cardId);
    }
    const player = await this.playerService.findOne(playCardDto.playerId);
    const session = await this.sessionService.findOne(player.session._id);
    return [card, player, session];
  }
}
