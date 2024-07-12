import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { IPlayer, ISession, Lobby } from './interfaces';
import { CreatePlayerDto } from './components/login-page/create-player.dto';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private playerUsername:string='';
  private sessionCode:string='';
  private playerId = '';
  player$ = new BehaviorSubject<IPlayer | null> (null);
  lobbyData$ = new BehaviorSubject<Lobby | null> (null);
  sessionData$ = new BehaviorSubject<ISession | null> (null);

  constructor(private socket: Socket) { }

  sub() {
    this.socket.fromEvent(`lobby:${this.playerId}`).pipe(map(data => data as Lobby))
      .subscribe((data : Lobby) => {
        this.lobbyData$.next(data);
      });

    this.socket.fromEvent(`session:${this.playerId}`).pipe(map(data => data as ISession))
      .subscribe((data : ISession) => {
        this.sessionData$.next(data);
      });
  }

  getSessionCode(): string {
    return this.sessionCode;
  }

  getPlayerUsername():string{
    return this.playerUsername;
  }

  async joinLobby(createPlayerDto: CreatePlayerDto){
    const joinLobbyReponse = await this.socket.emit('joinLobby', createPlayerDto);
    this.player$.next(joinLobbyReponse[0])
    const player = this.player$.getValue()
    this.playerId = player!._id!;
    this.sessionCode = joinLobbyReponse[1]
    this.sub();
  }

  async createLobby(createPlayerDto: CreatePlayerDto){
    await this.socket.emit('createLobby', createPlayerDto, (res: string[]) => {
      console.log(res)
      this.player$.next(JSON.parse(res[0]))
      const player = this.player$.getValue()
      this.playerId = player!._id!;
      this.sessionCode = res[1];
      console.log(player);
      this.sub();
    });
  }

  async startLobby() {
    if (this.player$.getValue()?.isHost && this.lobbyData$.getValue()?.opponent) {
      await this.socket.emit('startSession', this.sessionCode);
    }
  }
}
