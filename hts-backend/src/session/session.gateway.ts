import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Server } from 'socket.io';
import { CreatePlayerDto} from 'src/player/dto/create-player.dto';
import { PlayerService } from 'src/player/player.service';
import { PlayCardDto } from './dto/play-card.dto';
import { CardService } from 'src/card/card.service';
import { Inject, forwardRef } from '@nestjs/common';

@WebSocketGateway()
export class SessionGateway {
  @WebSocketServer() server : Server;

  constructor(private readonly sessionService: SessionService,
    @Inject(forwardRef(() => PlayerService))
    private readonly playerService: PlayerService,
    private readonly cardService: CardService) {}

  @SubscribeMessage('createSession')
  async create(@MessageBody() createPlayerDto: CreatePlayerDto) {
    const player = await this.playerService.create(createPlayerDto);
    this.server.emit("createdSession", player, player.session.code);
  }

  @SubscribeMessage('joinSession')
  async joinSession(@MessageBody() CreatePlayerDto: CreatePlayerDto) {
    const player = await this.playerService.create(CreatePlayerDto);
    return await this.sessionService.findOne(player.session._id);
  }

  @SubscribeMessage('startSession')
  async startSession(@MessageBody() playerId: string) {
    const player = await this.playerService.findOne(playerId);
    const session = await this.sessionService.fetchSessionData(player.session._id);
    this.server.emit("sessionData", session);
  }

  @SubscribeMessage('updateSession')
  update(@MessageBody() updateSessionDto: UpdateSessionDto) {
    //return this.sessionService.update(updateSessionDto.id, updateSessionDto);
  }

  @SubscribeMessage('playCard')
  async playCard(@MessageBody() playCardDto: PlayCardDto) {
    const card = await this.cardService.findOne(playCardDto.cardId, playCardDto.target);
    const player = await this.playerService.findOne(playCardDto.playerId);
    const session = await this.sessionService.findOne(player.session._id);
    const updatedSession = await this.sessionService.update({card, player, session});
    this.server.emit('updateSession', updatedSession);
  }

  @SubscribeMessage('removeSession')
  remove(@MessageBody() id: number) {
    return this.sessionService.remove(id);
  }

}
