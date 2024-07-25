import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { IPlayer, ISession, Lobby } from './interfaces';
import { CreatePlayerDto } from './components/login-page/create-player.dto';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private playerUsername: string = '';
  private sessionCode: string = '';
  private playerId = '';
  player$ = new BehaviorSubject<IPlayer | null>(null);
  opponent$ = new BehaviorSubject<IPlayer | null>(null);
  sessionData$ = new BehaviorSubject<ISession | null>(null);

  constructor(private socket: Socket) {}

  sub() {
    console.log('id: ' + this.playerId);
    this.socket
      .fromEvent(`lobby:${this.playerId}`)
      .pipe(map((data) => data as IPlayer))
      .subscribe((data: IPlayer) => {
        this.opponent$.next(data);
      });

    this.socket
      .fromEvent(`session:${this.playerId}`)
      .pipe(map((data) => data as ISession))
      .subscribe((data: ISession) => {
        this.sessionData$.next(data);
      });
  }

  getSessionCode(): string {
    return this.sessionCode;
  }

  getPlayerUsername(): string {
    return this.playerUsername;
  }

  async joinLobby(createPlayerDto: CreatePlayerDto) {
    console.log(createPlayerDto);
    await this.socket.emit('joinLobby', createPlayerDto, (res: string[]) => {
      this.player$.next(JSON.parse(res[0]));
      this.opponent$.next(JSON.parse(res[1]));
      const player = this.player$.getValue();
      this.playerId = player!._id!;
      this.playerUsername = player!.username;
      this.sessionCode = res[2];
      this.sub();
    });
  }

  async createLobby(createPlayerDto: CreatePlayerDto) {
    await this.socket.emit('createLobby', createPlayerDto, (res: string[]) => {
      this.player$.next(JSON.parse(res[0]));
      const player = this.player$.getValue();
      this.playerId = player!._id!;
      this.sessionCode = res[1];
      this.playerUsername = player!.username;
      this.sub();
    });
  }

  async startGame() {
    if (this.player$.getValue()?.isHost && this.opponent$.getValue()) {
      await this.socket.emit('startGame', this.sessionCode);
    }
  }
}
