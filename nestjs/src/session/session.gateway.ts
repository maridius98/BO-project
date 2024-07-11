import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { SessionService } from './session.service';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Server } from 'socket.io';
import { CreatePlayerDto} from 'src/player/dto/create-player.dto';
import { PlayerService } from 'src/player/player.service';
import { PlayCardDto } from './dto/play-card.dto';
import { CardService } from 'src/card/card.service';
import { Inject, OnModuleInit, forwardRef } from '@nestjs/common';
import { State, rollNumber } from 'src/utility';
import { SessionDataLayer } from './session.data-layer';
import { Session } from './entities/session.entity';
import { HeroCard } from 'src/card/entities/heroCard.entity';
import { stringifySafe } from 'src/utility';
import { CardDataLayer } from 'src/card/card.data-layer';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:4200']
  }
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

  constructor(private readonly sessionService: SessionService,
    @Inject(forwardRef(() => PlayerService))
    private readonly playerService: PlayerService,
    private readonly cardService: CardService,
    private readonly sessionDataLayer: SessionDataLayer
    ) {}

  @SubscribeMessage('createLobby')
  async create(@MessageBody() createPlayerDto: CreatePlayerDto) {
    const player = await this.playerService.create(createPlayerDto);
    console.log(stringifySafe(player));
    return [stringifySafe(player), player.session.code];
  }

  @SubscribeMessage('joinLobby')
  async joinLobby(@MessageBody() CreatePlayerDto: CreatePlayerDto) {
    const player = await this.playerService.create(CreatePlayerDto);
    const session = await this.sessionService.findOne(player.session._id);
    this.server.emit(`lobby:${session.players[0]._id}`, session);
    return [player, player.session.code];
  }

  @SubscribeMessage('startSession')
  async startSession(@MessageBody() code: string) {
    const session = await this.sessionService.findByCode(code);
    const generatedSession = await this.sessionService.createSessionData(session._id);
    this.emitToAllClients(generatedSession);
  }

  @SubscribeMessage('updateSession')
  update(@MessageBody() updateSessionDto: UpdateSessionDto) {
    //return this.sessionService.update(updateSessionDto.id, updateSessionDto);
  }

  @SubscribeMessage('roll')
  async roll(@MessageBody() playerId: string){
    const player = await this.playerService.findOne(playerId);
    if (player.session.state != State.roll){
      return "Invalid request";
    }
    player.session.roll = rollNumber();
    player.session.state = State.resolveRoll;
    await this.sessionService.update(player.session);
    this.emitToAllClients(player.session);
  }

  @SubscribeMessage('resolveRoll')
  async resolveRoll(@MessageBody() playCardDto: PlayCardDto) {
    const card = await this.cardService.findOne(playCardDto.cardId) as HeroCard;
    const player = await this.playerService.findOne(playCardDto.playerId);
    const session = await this.sessionService.findOne(player.session._id);
    if (card.usedEffect) {
      return "Effect already used";
    }
    const updatedSession = await this.sessionService.startEffect({card, player, session, index: playCardDto.index});
    this.emitToAllClients(updatedSession);
  }

  @SubscribeMessage('playCard')
  async playCard(@MessageBody() playCardDto: PlayCardDto) {
    const card = await this.cardService.findOne(playCardDto.cardId);
    const player = await this.playerService.findOne(playCardDto.playerId);
    const session = await this.sessionService.findOne(player.session._id);
    const updatedSession = await this.sessionService.playCard({card, player, session, index: playCardDto.index});
    this.emitToAllClients(updatedSession);
  }

  @SubscribeMessage('useEffect')
  async handleEffect(@MessageBody() playCardDto: PlayCardDto) {
    const card = await this.cardService.findOne(playCardDto.cardId);
    const player = await this.playerService.findOne(playCardDto.playerId);
    const session = await this.sessionService.findOne(player.session._id);
    const updatedSession = await this.sessionService.playEffect({card, player, session, index: playCardDto.index});
    this.emitToAllClients(updatedSession);
  }

  @SubscribeMessage('removeSession')
  remove(@MessageBody() id: number) {
    return this.sessionService.remove(id);
  }

  emitToAllClients(session: Session) {
    const splitSessions = this.sessionDataLayer.getSplitSessions(session);
    for (const [id, session] of splitSessions) {
      this.server.emit(`session:${id}`, session);
    }
  }

}
